import { defineTool } from '@deepseek-ai/dsh-tools';
import { Config, resolveChannel } from './config.js';
import { withGenerationTimeout } from './generation-timeout.js';
import { rejectMinoToken, requireMinoAuth } from './mino-auth.js';
import { HttpStatusError, editMinoImage, generateMinoImage } from './images-api.js';
import { DELETE_ROUTE, DEFAULT_CLOUD_TIMEOUT_MS, GENERATE_ROUTE, IMAGE_ROUTE, META_KIND, META_KIND_BATCH, SAVE_WORKSPACE_ROUTE } from './shared.js';
import { imageAttachmentFromMeta, serveDelete, serveImage, serveSaveWorkspace } from './image-route.js';
import { resolveReferenceImages } from './reference-image.js';
import { deleteImageFromWorkspace, getDshWorkspaceRoots, saveImageToWorkspace } from './workspace-save.js';
export { Config } from './config.js';
export { DELETE_ROUTE, GENERATE_ROUTE, IMAGE_ROUTE, SAVE_WORKSPACE_ROUTE, imageAttachmentFromMeta };
export const name = 'dsh-image-gen';
export const inject = ['tools', 'attachments'];
/** Optional strings from tool callers may contain empty placeholders. */
function cleanImageToolArgs(args) {
    const clean = { ...args };
    const fields = clean;
    for (const key of ['model', 'size', 'quality']) {
        const value = fields[key];
        if (typeof value !== 'string')
            continue;
        if (value.trim().length === 0)
            delete fields[key];
        else
            fields[key] = value.trim();
    }
    return clean;
}
/** Shared inference layer; falls back to this plugin's own config when absent. */
function minoInference(ctx) {
    const service = ctx.get('minoInference');
    if (service === undefined)
        return undefined;
    // Duck-typed seam: verify the members this plugin actually calls, so a
    // stale mino-inference names the missing method instead of failing
    // silently inside a tool call.
    if (typeof service.baseURL !== 'string'
        || typeof service.resolveAuth !== 'function'
        || typeof service.rejectToken !== 'function') {
        throw new Error('minoInference 服务契约不匹配：需要 baseURL/resolveAuth/rejectToken（mino-inference 版本过旧，请升级插件）。');
    }
    return service;
}
export function apply(ctx, config = {}) {
    // Volatile schema fields arrive as boxes whose `.get()` returns the current
    // snapshot, so a settings edit lands without restarting this fiber.
    const plainConfig = (source) => {
        const out = {};
        for (const [key, value] of Object.entries(source)) {
            out[key] = value !== null && typeof value === 'object' && typeof value.get === 'function'
                ? value.get()
                : value;
        }
        return out;
    };
    const current = () => plainConfig(config);
    const knownWorkspaceRoots = new Set();
    // HTTP surfaces need webServer, which only the web-app bundle (web, desktop)
    // provides; headless, acp and sdk profiles still get the tools below.
    ctx.inject(['webServer'], (webCtx) => {
        webCtx.effect(() => webCtx.webServer.register({
            kind: 'exact', path: IMAGE_ROUTE,
            handler: (req, res) => serveImage(req, res, { readImage: ref => ctx.attachments.readImage(ref) }),
        }), 'dsh-image-gen: image route');
        webCtx.effect(() => webCtx.webServer.register({
            kind: 'exact', path: DELETE_ROUTE,
            handler: (req, res) => serveDelete(req, res, {
                deleteWorkspaceImage: async (filePath) => {
                    const discovered = await getDshWorkspaceRoots().catch(() => []);
                    return deleteImageFromWorkspace(filePath, new Set([...knownWorkspaceRoots, ...discovered, process.cwd()]));
                },
            }),
        }), 'dsh-image-gen: delete route');
        webCtx.effect(() => webCtx.webServer.register({
            kind: 'exact', path: SAVE_WORKSPACE_ROUTE,
            handler: (req, res) => serveSaveWorkspace(req, res, {
                readImage: ref => ctx.attachments.readImage(ref),
                saveToWorkspace: options => {
                    if (options.workspaceRoot) {
                        knownWorkspaceRoots.add(options.workspaceRoot);
                    }
                    return saveImageToWorkspace({
                        workspaceRoot: options.workspaceRoot,
                        folder: current().workspaceFolder,
                        attachmentId: options.attachmentId,
                        mediaType: options.mediaType,
                        data: options.data,
                    });
                },
                getActiveWorkspaceRoot: () => Array.from(knownWorkspaceRoots)[0] || process.cwd(),
                getAllowedWorkspaceRoots: async () => {
                    const discovered = await getDshWorkspaceRoots().catch(() => []);
                    return new Set([...knownWorkspaceRoots, ...discovered, process.cwd()]);
                },
                isSaveEnabled: () => current().saveToWorkspace !== false,
            }),
        }), 'dsh-image-gen: save workspace route');
        webCtx.effect(() => webCtx.webServer.register({
            kind: 'exact', path: GENERATE_ROUTE,
            handler: (req, res) => serveGenerate(req, res, async (body) => {
                const channel = resolveChannel(current());
                const exec = { signal: AbortSignal.timeout(2 * (current().cloudTimeoutMs ?? DEFAULT_CLOUD_TIMEOUT_MS)) };
                const value = await generateAndSave(ctx, body, channel, exec, knownWorkspaceRoots, current());
                return {
                    attachment: attachmentMeta(value.attachment),
                    prompt: body.prompt,
                    model: value.model,
                    output: value.output,
                    ...(value.savedTo === undefined ? {} : { savedTo: value.savedTo }),
                    createdAt: Date.now(),
                };
            }),
        }), 'dsh-image-gen: generate route');
    });
    // A few lines of live image-tool context per model request.
    ctx.inject(['systemPrompt'], (promptCtx) => {
        promptCtx.effect(() => promptCtx.systemPrompt.context({
            name: 'dsh-image-gen:defaults',
            order: 59,
            text: () => {
                const model = current().model?.trim() || 'not configured';
                return [
                    `Image tools current provider: mino; generation model: ${JSON.stringify(model)}.`,
                    'Unless the user explicitly requests a different image model, OMIT model from generate_image, generate_images and edit_image. Do not guess a model or switch models after an error.',
                    'Omit unused optional arguments entirely; never fill them with empty strings.',
                    'Minimal calls: generate_image({"prompt":"a sailboat"}); edit_image({"prompt":"make the sail blue"}).',
                ].join('\n');
            },
        }), 'dsh-image-gen: tool context');
    });
    /** Shared per-item generation for generate_image and the batch loop. */
    const generateSingle = async (rawArgs, exec) => {
        const args = cleanImageToolArgs(rawArgs);
        const channel = resolveChannel(current());
        return generateAndSave(ctx, { ...args, model: args.model ?? channel.model }, channel, exec, knownWorkspaceRoots, current());
    };
    ctx.tools.register(defineTool({
        name: 'generate_image',
        description: 'Generate a new image with the Mino image service. Use when the user asks to create or draw a new image; use edit_image instead when they want to change an existing image. Give a complete visual prompt including subject, composition, style, lighting, and any exact text that should appear. A successful image is attached directly to the conversation and may also be saved under the session workspace. Do not call read, glob, or other tools to locate or verify the image.',
        parameters: {
            prompt: { type: 'string', required: true, description: 'Complete description of the image to generate.' },
            model: { type: 'string', description: 'Optional image model name for this call only, overriding the configured model. Omit unless the user asks for a specific model.' },
            size: { type: 'string', description: 'Optional dimensions or size tier for this call only (e.g. 1024x1024). Omit to use the configured default.' },
            quality: { type: 'string', description: 'Optional generation quality tier for this call only. Omit to use the configured default.' },
        },
        output: imageOutput('Generated'),
        async execute(args, exec) {
            return generateSingle(args, exec);
        },
        presentResult: (_args, result) => imagePresentation(result),
    }));
    ctx.tools.register(defineTool({
        name: 'generate_images',
        description: 'Generate several images in one call, one per prompt, in order. Use for batches, variations, or illustration sets; prefer generate_image for a single image. Every successful image is attached to the conversation and may be saved under the session workspace. Items generate sequentially; a failed item is reported in the failures list and does not abort the rest.',
        parameters: {
            prompts: { type: 'array', items: { type: 'string' }, required: true, description: 'Ordered complete prompts; one image is generated per entry (1-10).' },
            model: { type: 'string', description: 'Optional image model name for this call only, applied to every item.' },
            size: { type: 'string', description: 'Optional dimensions or size tier for this call only, applied to every item.' },
            quality: { type: 'string', description: 'Optional generation quality tier for this call only, applied to every item.' },
        },
        output: {
            schema: {
                type: 'object', additionalProperties: false, properties: {
                    images: { type: 'array', items: { type: 'object', additionalProperties: false, properties: {
                                attachment: { type: 'object', required: true, additionalProperties: false, properties: {
                                        attachmentId: { type: 'string', required: true }, mediaType: { type: 'string', required: true }, bytes: { type: 'integer', required: true }, width: { type: 'integer', required: true }, height: { type: 'integer', required: true }, name: { type: 'string' }, originalDimensions: { type: 'object', additionalProperties: false, properties: { width: { type: 'integer', required: true }, height: { type: 'integer', required: true } } },
                                    } },
                                provider: { type: 'string', required: true }, model: { type: 'string', required: true }, output: { type: 'string', required: true }, savedTo: { type: 'string' }, saveError: { type: 'string' }, prompt: { type: 'string', required: true },
                            } } },
                    failures: { type: 'array', items: { type: 'object', additionalProperties: false, properties: {
                                index: { type: 'integer', required: true }, prompt: { type: 'string', required: true }, error: { type: 'string', required: true },
                            } } },
                },
            },
            render: (_args, value) => [
                {
                    type: 'text',
                    text: `Generated ${String(value.images.length)} of ${String(value.images.length + value.failures.length)} images.\n${value.failures.map(failure => `${failure.prompt.slice(0, 80)} — failed: ${failure.error}`).join('\n')}`,
                },
                ...value.images.flatMap(image => imageOutput('Generated').render({}, image).map(block => block.type === 'text' ? { ...block, text: `${block.text}\nImage prompt: ${image.prompt}` } : block)),
            ],
            presentationMeta: (_args, value) => ({
                kind: META_KIND_BATCH,
                images: value.images.map(image => imageOutput('Generated').presentationMeta({ prompt: image.prompt }, image)),
            }),
        },
        async execute(args, exec) {
            if (args.prompts.length === 0)
                throw new Error('generate_images requires at least one prompt');
            if (args.prompts.length > 10)
                throw new Error(`generate_images accepts at most 10 prompts per call (got ${String(args.prompts.length)}); split larger batches into several calls`);
            const images = [];
            const failures = [];
            for (const [index, prompt] of args.prompts.entries()) {
                if (exec.signal.aborted) {
                    failures.push({ index, prompt, error: 'aborted before this image started' });
                    continue;
                }
                try {
                    const value = await generateSingle({
                        prompt,
                        ...(args.model !== undefined ? { model: args.model } : {}),
                        ...(args.size !== undefined ? { size: args.size } : {}),
                        ...(args.quality !== undefined ? { quality: args.quality } : {}),
                    }, exec);
                    images.push({ ...value, prompt });
                }
                catch (error) {
                    failures.push({ index, prompt, error: error instanceof Error ? error.message : String(error) });
                }
            }
            return { images, failures };
        },
        presentResult: (_args, result) => imagePresentation(result),
    }));
    ctx.tools.register(defineTool({
        name: 'edit_image',
        description: 'Edit, combine, or restyle existing images with the Mino image service. Images attached inline to the latest human message are already readable attachments even when no workspace file exists. In that case, call edit_image immediately with prompt only; NEVER call read_image, glob, or shell to locate them, and NEVER invent @ paths. All inline images will be used in upload order. For specific older conversation images use source_attachment_id or source_attachment_ids; both canonical sha256: IDs and full bare SHA-256 digests are accepted. For files the user explicitly names in the workspace use source_path or source_paths. Provide exactly one selector field. Without a selector, images from the latest human message take priority; only when that message has no images does editing fall back to the newest conversation image. When the user wants a person, character, or object from the reference images kept as the same identity, write short hard identity-preservation instructions instead of long generic appearance descriptions.',
        parameters: {
            prompt: { type: 'string', required: true, description: 'Describe the changes to make while preserving everything else that should remain.' },
            model: { type: 'string', description: 'Optional image model name for this call only, overriding the configured edit model. Omit unless the user asks for a specific model.' },
            source_attachment_id: { type: 'string', description: 'Optional attachment id of a specific image already present in the current conversation.' },
            source_attachment_ids: { type: 'array', items: { type: 'string' }, description: 'Optional ordered attachment ids of multiple images already present in the current conversation. Prompt references such as image 1 and image 2 follow this order.' },
            source_path: { type: 'string', description: 'Optional absolute or workspace-relative path of a specific image file inside the active session workspace. Prefer this when the user names a saved file.' },
            source_paths: { type: 'array', items: { type: 'string' }, description: 'Optional ordered absolute or workspace-relative paths of multiple image files inside the active session workspace.' },
            size: { type: 'string', description: 'Optional output size for this call only. Omit to use the configured default.' },
            quality: { type: 'string', description: 'Optional generation quality tier for this call only.' },
        },
        output: imageOutput('Edited'),
        async execute(rawArgs, exec) {
            const args = cleanImageToolArgs(rawArgs);
            const channel = resolveChannel(current());
            const sourceImages = await resolveReferenceImages({
                ...(exec.agent === undefined ? {} : { agent: exec.agent }),
                attachments: ctx.attachments,
                ...(typeof args.source_attachment_id === 'string' ? { sourceAttachmentId: args.source_attachment_id } : {}),
                ...(Array.isArray(args.source_attachment_ids) ? { sourceAttachmentIds: args.source_attachment_ids } : {}),
                ...(typeof args.source_path === 'string' ? { sourcePath: args.source_path } : {}),
                ...(Array.isArray(args.source_paths) ? { sourcePaths: args.source_paths } : {}),
                maxBytes: ctx.attachments.imageLimits.maxImageBytes,
                signal: exec.signal,
            });
            const service = minoInference(ctx);
            const baseURL = service?.baseURL ?? channel.baseURL;
            const auth = service !== undefined ? await service.resolveAuth() : await requireMinoAuth(ctx, baseURL);
            const request = {
                auth,
                baseURL,
                model: args.model ?? channel.editModel,
                prompt: args.prompt,
                sourceImages,
                maxBytes: ctx.attachments.imageLimits.maxImageBytes,
                ...(args.size ?? channel.size ? { size: args.size ?? channel.size ?? '' } : {}),
                ...(args.quality ?? channel.quality ? { quality: args.quality ?? channel.quality } : {}),
            };
            try {
                const generated = await withGenerationTimeout(current().cloudTimeoutMs ?? DEFAULT_CLOUD_TIMEOUT_MS, exec.signal, signal => editMinoImage({ ...request, signal }));
                return saveGenerated(ctx, generated, args.model ?? channel.editModel, outputLabel(request.size, request.quality), exec, knownWorkspaceRoots, current());
            }
            catch (error) {
                await reauthOnUnauthorized(ctx, auth, error);
                throw error;
            }
        },
        presentResult: (_args, result) => imagePresentation(result),
    }));
}
/** Run one generation through the channel and persist the image. */
async function generateAndSave(ctx, args, channel, exec, knownRoots, config) {
    const service = minoInference(ctx);
    const baseURL = service?.baseURL ?? channel.baseURL;
    const auth = service !== undefined ? await service.resolveAuth() : await requireMinoAuth(ctx, baseURL);
    const model = args.model ?? channel.model;
    const size = args.size ?? channel.size;
    const quality = args.quality ?? channel.quality;
    try {
        const generated = await withGenerationTimeout(config.cloudTimeoutMs ?? DEFAULT_CLOUD_TIMEOUT_MS, exec.signal, signal => generateMinoImage({
            auth, baseURL, model, prompt: args.prompt,
            ...(size === undefined ? {} : { size }),
            ...(quality === undefined ? {} : { quality }),
            maxBytes: ctx.attachments.imageLimits.maxImageBytes,
            signal,
        }));
        return saveGenerated(ctx, generated, model, outputLabel(size, quality), exec, knownRoots, config);
    }
    catch (error) {
        await reauthOnUnauthorized(ctx, auth, error);
        throw error;
    }
}
function outputLabel(size, quality) {
    return quality === undefined ? (size ?? 'default') : `${size ?? 'default'}, quality=${quality}`;
}
/** Drop a rejected grant so the next attempt surfaces the sign-in flow. */
async function reauthOnUnauthorized(ctx, auth, error) {
    if (error instanceof HttpStatusError && error.status === 401) {
        const service = minoInference(ctx);
        if (service !== undefined)
            await service.rejectToken(auth.token);
        else
            await rejectMinoToken(ctx, auth.token);
    }
}
/** Serve the client card's regenerate request through the same generation core. */
async function serveGenerate(req, res, generate) {
    if (req.method !== 'POST')
        return jsonError(res, 405, 'method-not-allowed');
    if (!(req.headers['content-type'] ?? '').toLowerCase().startsWith('application/json'))
        return jsonError(res, 415, 'json-required');
    const origin = req.headers.origin;
    const host = req.headers.host;
    if (origin !== undefined && host !== undefined && origin !== `http://${host}` && origin !== `https://${host}`) {
        return jsonError(res, 403, 'origin-rejected');
    }
    let body;
    try {
        const raw = JSON.parse(await readAll(req));
        if (typeof raw.prompt !== 'string' || raw.prompt.trim().length === 0)
            return jsonError(res, 400, 'prompt-required');
        body = { prompt: raw.prompt.trim(), ...(typeof raw.model === 'string' ? { model: raw.model } : {}), ...(typeof raw.size === 'string' ? { size: raw.size } : {}), ...(typeof raw.quality === 'string' ? { quality: raw.quality } : {}) };
    }
    catch {
        return jsonError(res, 400, 'invalid-request');
    }
    try {
        const value = await generate(body);
        res.writeHead(200, { 'content-type': 'application/json', 'cache-control': 'no-store' });
        res.end(JSON.stringify(value));
    }
    catch (error) {
        res.writeHead(500, { 'content-type': 'application/json', 'cache-control': 'no-store' });
        res.end(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }));
    }
}
async function readAll(req) {
    const chunks = [];
    let bytes = 0;
    for await (const chunk of req) {
        const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
        bytes += buffer.byteLength;
        if (bytes > 64 * 1024)
            throw new Error('request too large');
        chunks.push(buffer);
    }
    return Buffer.concat(chunks).toString('utf8');
}
function jsonError(res, status, code) {
    res.writeHead(status, { 'content-type': 'application/json', 'cache-control': 'no-store' });
    res.end(JSON.stringify({ error: code }));
}
function imageOutput(verb) {
    return {
        schema: {
            type: 'object', additionalProperties: false, properties: {
                attachment: { type: 'object', required: true, additionalProperties: false, properties: {
                        attachmentId: { type: 'string', required: true }, mediaType: { type: 'string', required: true }, bytes: { type: 'integer', required: true }, width: { type: 'integer', required: true }, height: { type: 'integer', required: true }, name: { type: 'string' }, originalDimensions: { type: 'object', additionalProperties: false, properties: { width: { type: 'integer', required: true }, height: { type: 'integer', required: true } } },
                    } },
                provider: { type: 'string', required: true }, model: { type: 'string', required: true }, output: { type: 'string', required: true }, savedTo: { type: 'string' }, saveError: { type: 'string' },
            },
        },
        render: (_args, value) => {
            const saved = typeof value.savedTo === 'string' ? ` It was also saved to the workspace as ${value.savedTo}.` : typeof value.saveError === 'string' ? ` Saving it to the workspace failed: ${value.saveError}.` : ' It has no local file path.';
            const action = verb === 'Generated' ? 'It is already attached to the conversation.' : 'The edited image is attached to the conversation.';
            return [
                { type: 'text', text: `${verb} one image with mino/${value.model} (${value.output}). Attachment ID: ${String(value.attachment.attachmentId)}. ${action}${saved} Respond to the user without reading or searching for the image.` },
                { type: 'image', attachment: value.attachment },
            ];
        },
        presentationMeta: (args, value) => ({
            kind: META_KIND, attachment: attachmentMeta(value.attachment), provider: value.provider, model: value.model, output: value.output,
            ...(verb === 'Edited' ? { operation: 'edit' } : {}),
            ...(typeof value.savedTo === 'string' ? { savedTo: value.savedTo } : {}),
            prompt: args.prompt,
        }),
    };
}
function attachmentMeta(ref) {
    return {
        attachmentId: String(ref.attachmentId), mediaType: ref.mediaType, bytes: ref.bytes, width: ref.width, height: ref.height,
        ...(ref.name === undefined ? {} : { name: ref.name }),
        ...(ref.originalDimensions === undefined ? {} : { originalDimensions: { width: ref.originalDimensions.width, height: ref.originalDimensions.height } }),
    };
}
async function saveGenerated(ctx, generated, model, output, exec, knownRoots, config) {
    if (!ctx.attachments.imageLimits.mediaTypes.includes(generated.mediaType))
        throw new Error(`This deployment does not accept ${generated.mediaType} generated images`);
    const attachment = await ctx.attachments.saveImage({ data: generated.data, mediaType: generated.mediaType, name: 'generated-image' });
    const value = { attachment, provider: 'mino', model, output };
    if (config.saveToWorkspace === false)
        return value;
    const workspaceRoot = exec.agent?.session.header.cwd ?? Array.from(knownRoots)[0];
    if (workspaceRoot === undefined)
        return value;
    knownRoots.add(workspaceRoot);
    try {
        value.savedTo = await saveImageToWorkspace({ workspaceRoot, folder: config.workspaceFolder, attachmentId: attachment.attachmentId, mediaType: generated.mediaType, data: generated.data, signal: exec.signal });
    }
    catch (error) {
        exec.signal.throwIfAborted();
        ctx.logger.warn(`dsh-image-gen: failed to save image to workspace: ${error instanceof Error ? error.message : String(error)}`);
        value.saveError = error instanceof Error ? error.message : String(error);
    }
    return value;
}
function imagePresentation(result) {
    const meta = result.meta;
    if (typeof meta === 'object' && meta !== null && !Array.isArray(meta)
        && meta.kind === META_KIND_BATCH && Array.isArray(meta.images)) {
        const content = meta.images.flatMap(image => {
            const attachment = imageAttachmentFromMeta(image);
            return attachment === undefined ? [] : [{ type: 'image', attachment }];
        });
        return content.length === 0 ? undefined : { card: 'generic', title: 'Generated images', content };
    }
    const attachment = imageAttachmentFromMeta(result.meta);
    return attachment === undefined ? undefined : { card: 'generic', title: 'Generated image', content: [{ type: 'image', attachment }] };
}
//# sourceMappingURL=index.js.map