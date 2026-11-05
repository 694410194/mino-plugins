import { META_KIND, META_KIND_BATCH } from '../shared.js';
export const IMAGE_RESULT_NODE_KIND = 'mino-image-result';
/** Plugin tools whose results carry image presentation meta. */
const IMAGE_TOOL_NAMES = new Set(['generate_image', 'generate_images', 'edit_image']);
/** Default definition for the successful images from each Tool invocation. */
export const imageResultDefinition = createImageResultDefinition();
/** Give each image Tool result its own Chat row at the event that produced it. */
export function createImageResultDefinition() {
    return {
        kind: IMAGE_RESULT_NODE_KIND,
        target: 'chat',
        match: (event) => {
            if (event.type === 'tool/ptc-dispatch') {
                if (event.data.isError || !IMAGE_TOOL_NAMES.has(event.data.name))
                    return null;
                return imageResultsFromDispatch(event).length === 0 ? null : { id: `ptc:${event.data.subCallId}`, role: 'start' };
            }
            if (event.type === 'tool/result' && imageResultsFromMeta(event.data.meta).length > 0) {
                return { id: `result:${String(event.seq)}`, role: 'start' };
            }
            return null;
        },
        start: (_context, match) => {
            if (match.event.type === 'tool/ptc-dispatch') {
                const results = imageResultsFromDispatch(match.event);
                if (results.length === 0)
                    throw new Error('mino-image-result start requires a plugin image dispatch');
                return { results: results.map(result => ({ ...result, seq: match.event.seq })) };
            }
            if (match.event.type !== 'tool/result') {
                throw new Error('mino-image-result start requires an image Tool result');
            }
            const results = imageResultsFromMeta(match.event.data.meta);
            if (results.length === 0)
                throw new Error('mino-image-result start requires an image Tool result');
            return { turn: match.event.data.turn, results: results.map(result => ({ ...result, seq: match.event.seq })) };
        },
        update: (context, match) => {
            if (match.event.type !== 'tool/ptc-dispatch')
                return context.state;
            return imageResultsFromDispatch(match.event).reduce((state, result) => appendResult(state, result, match.event.seq), context.state);
        },
        buildViewNode: (context) => buildNode(context),
    };
}
function buildNode(context) {
    const state = context.state;
    const first = state?.results[0];
    if (state === undefined || first === undefined)
        return null;
    return {
        key: context.key,
        kind: IMAGE_RESULT_NODE_KIND,
        id: context.id,
        target: 'chat',
        // Keep the result at the event that produced it; a session-located node is a
        // direct Chat row that stays visible when the owning Tool process folds.
        anchorSeq: first.seq,
        location: { kind: 'session' },
        visibility: 'visible',
        data: {
            ...(state.turn !== undefined ? { turn: state.turn } : {}),
            results: state.results.map(({ seq: _seq, ...result }) => result),
        },
    };
}
/** Append a parsed result unless its attachment is already collected. */
function appendResult(state, result, seq) {
    if (state.results.some(candidate => candidate.attachment.attachmentId === result.attachment.attachmentId)) {
        return state;
    }
    return { ...state, results: [...state.results, { ...result, seq }] };
}
/** Parse the plugin-owned durable presentation metadata from a Tool result event. */
export function imageResultFromMeta(value) {
    const meta = record(value);
    if (meta?.kind !== META_KIND)
        return undefined;
    const attachment = imageAttachment(meta.attachment);
    if (attachment === undefined)
        return undefined;
    return {
        attachment,
        prompt: stringValue(meta.prompt, 'Generated Image'),
        provider: stringValue(meta.provider, 'mino'),
        model: stringValue(meta.model, ''),
        output: stringValue(meta.output, ''),
        ...(typeof meta.savedTo === 'string' ? { savedTo: meta.savedTo } : {}),
    };
}
/** Parse all successful images from either a single or batch Tool result meta. */
export function imageResultsFromMeta(value) {
    const meta = record(value);
    if (meta?.kind === META_KIND_BATCH && Array.isArray(meta.images)) {
        return meta.images.flatMap(image => {
            const result = imageResultFromMeta(image);
            return result === undefined ? [] : [result];
        });
    }
    const result = imageResultFromMeta(value);
    return result === undefined ? [] : [result];
}
/**
 * Parse plugin image results from a `tool/ptc-dispatch` event: its durable
 * `meta` carries the same presentation payload as `tool/result`; a meta-less
 * legacy event falls back to the rendered image blocks plus call arguments.
 */
function imageResultsFromDispatch(event) {
    const results = imageResultsFromMeta(event.data.meta);
    if (results.length > 0)
        return results;
    const image = event.data.content.find(block => block.type === 'image' && 'attachment' in block);
    if (image === undefined || image.type !== 'image')
        return [];
    const args = record(event.data.arguments);
    const sourceIds = sourceAttachmentIds(args);
    return [{
            attachment: image.attachment,
            prompt: stringValue(args?.prompt, 'Generated Image'),
            provider: 'mino',
            model: '',
            output: '',
            ...(sourceIds !== undefined ? { sourceAttachmentIds: sourceIds } : {}),
        }];
}
/** Collect edit_image source attachment ids (single or list form) from dispatch arguments. */
function sourceAttachmentIds(args) {
    if (args === undefined)
        return undefined;
    const single = typeof args.source_attachment_id === 'string' ? [args.source_attachment_id] : undefined;
    const list = Array.isArray(args.source_attachment_ids)
        ? args.source_attachment_ids.filter((id) => typeof id === 'string')
        : undefined;
    const ids = single ?? list;
    return ids !== undefined && ids.length > 0 ? ids : undefined;
}
/** Parse an ImageAttachmentRef from the serialized meta payload. */
export function imageAttachment(value) {
    const candidate = record(value);
    if (candidate === undefined
        || typeof candidate.attachmentId !== 'string'
        || !isImageMediaType(candidate.mediaType)
        || !positiveInteger(candidate.bytes)
        || !positiveInteger(candidate.width)
        || !positiveInteger(candidate.height))
        return undefined;
    const original = record(candidate.originalDimensions);
    if (candidate.originalDimensions !== undefined
        && (original === undefined || !positiveInteger(original.width) || !positiveInteger(original.height)))
        return undefined;
    return {
        attachmentId: candidate.attachmentId,
        mediaType: candidate.mediaType,
        bytes: candidate.bytes,
        width: candidate.width,
        height: candidate.height,
        ...(typeof candidate.name === 'string' ? { name: candidate.name } : {}),
        ...(original !== undefined && positiveInteger(original.width) && positiveInteger(original.height)
            ? { originalDimensions: { width: original.width, height: original.height } }
            : {}),
    };
}
function isImageMediaType(value) {
    return value === 'image/png' || value === 'image/jpeg' || value === 'image/webp' || value === 'image/gif';
}
function positiveInteger(value) {
    return typeof value === 'number' && Number.isSafeInteger(value) && value > 0;
}
function stringValue(value, fallback) {
    return typeof value === 'string' ? value : fallback;
}
function record(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value)
        ? value
        : undefined;
}
//# sourceMappingURL=image-result-node.js.map