import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Mino image plugin, browser half: promoted generated-image Chat rows, keyed
 * Tool view cards for the image tools, and the bundle configuration card.
 * Copy comes through the `mino-image` locale namespace; image bytes arrive
 * through the owner-supplied authorized `loadImage` loader.
 */
import { useEffect, useRef, useState } from 'react';
import { GENERATE_ROUTE } from '../shared.js';
import { en, zh, NS } from './locales.js';
import { createImageResultDefinition, imageAttachment, imageResultFromMeta, imageResultsFromMeta, IMAGE_RESULT_NODE_KIND, } from './image-result-node.js';
import { appendConversationImageRevision, loadConversationImageRevisionChain, selectConversationImageRevision, } from './conversation-image-revisions.js';
import { conversationRegenerateRequest } from './conversation-regenerate.js';
/** Required browser services for the registrations and dictionaries. */
export const inject = ['slots', 'locale', 'uiConversation', 'configForms'];
const STYLE = `
.mino-ig-result{display:block;margin:8px 0;max-width:520px}
.mino-ig-result-title{font-size:12px;color:var(--dsw-alias-label-secondary,#64748b);margin-bottom:6px}
.mino-ig-savedto{font-size:11.5px;color:var(--dsw-alias-label-secondary,#64748b);margin-bottom:6px;word-break:break-all}
.mino-ig-container{position:relative;display:inline-block}
.mino-ig-image{display:block;max-width:100%;max-height:480px;border-radius:10px;border:1px solid var(--dsw-alias-border-l2,#e2e8f0);cursor:zoom-in}
.mino-ig-toolbar{display:flex;gap:6px;align-items:center;margin-top:8px}
.mino-ig-tool-btn{display:inline-flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:7px;border:1px solid var(--dsw-alias-border-l2,#e2e8f0);background:var(--dsw-alias-bg-layer-2,#fff);color:var(--dsw-alias-label-primary,#334155);cursor:pointer}
.mino-ig-tool-btn:hover{background:var(--dsw-alias-bg-hover,#f1f5f9)}
.mino-ig-tool-btn:disabled{opacity:.5;cursor:default}
.mino-ig-loading{padding:24px;text-align:center;color:var(--dsw-alias-label-secondary,#64748b);font-size:13px}
.mino-ig-error{padding:10px 12px;margin:6px 0;border-radius:8px;background:var(--dsw-alias-bg-danger,#fef2f2);color:var(--dsw-alias-label-danger,#b91c1c);font-size:12.5px}
.mino-ig-toast{position:absolute;left:50%;bottom:14px;transform:translateX(-50%);padding:6px 12px;border-radius:999px;background:rgba(15,23,42,.82);color:#fff;font-size:12px;white-space:nowrap}
.mino-ig-lightbox-backdrop{position:fixed;inset:0;z-index:1000;background:rgba(2,6,23,.72);display:flex;align-items:center;justify-content:center}
.mino-ig-lightbox-img{max-width:92vw;max-height:92vh;border-radius:8px}
.mino-ig-regenerate-backdrop{position:fixed;inset:0;z-index:1000;background:rgba(2,6,23,.45);display:flex;align-items:center;justify-content:center}
.mino-ig-regenerate-dialog{width:min(520px,92vw);background:var(--dsw-alias-bg-layer-1,#fff);border-radius:12px;padding:20px;box-shadow:0 18px 50px rgba(2,6,23,.25)}
.mino-ig-regenerate-dialog h3{margin:0 0 6px;font-size:15px}
.mino-ig-regenerate-dialog p{margin:0 0 12px;font-size:12.5px;color:var(--dsw-alias-label-secondary,#64748b)}
.mino-ig-regenerate-dialog label{display:block;font-size:12.5px;color:var(--dsw-alias-label-secondary,#64748b)}
.mino-ig-regenerate-dialog textarea{box-sizing:border-box;width:100%;min-height:96px;margin-top:6px;padding:10px;border:1px solid var(--dsw-alias-border-l2,#e2e8f0);border-radius:8px;font-size:13px;resize:vertical;font-family:inherit}
.mino-ig-regenerate-error{color:var(--dsw-alias-label-danger,#b91c1c)!important}
.mino-ig-regenerate-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:14px}
.mino-ig-regenerate-cancel,.mino-ig-regenerate-confirm{height:32px;padding:0 14px;border-radius:7px;font-size:13px;cursor:pointer}
.mino-ig-regenerate-cancel{border:1px solid var(--dsw-alias-border-l2,#e2e8f0);background:var(--dsw-alias-bg-layer-2,#fff);color:var(--dsw-alias-label-primary,#334155)}
.mino-ig-regenerate-confirm{border:none;background:var(--dsw-alias-bg-brand,#2563eb);color:#fff}
.mino-ig-regenerate-confirm:disabled{opacity:.55;cursor:default}
.mino-ig-regenerate-overlay{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;background:rgba(255,255,255,.66);border-radius:10px;backdrop-filter:blur(2px)}
.mino-ig-regenerate-spinner{width:26px;height:26px;border-radius:50%;border:3px solid rgba(37,99,235,.25);border-top-color:var(--dsw-alias-bg-brand,#2563eb);animation:mino-ig-spin .8s linear infinite}
@keyframes mino-ig-spin{to{transform:rotate(360deg)}}
.mino-ig-regenerate-overlay-text{font-size:12.5px;color:var(--dsw-alias-label-secondary,#475569)}
.mino-ig-regenerate-overlay-cancel{border:1px solid var(--dsw-alias-border-l2,#e2e8f0);background:#fff;border-radius:7px;padding:5px 12px;font-size:12px;cursor:pointer}
.mino-ig-version-nav{display:flex;align-items:center;gap:8px;margin-left:8px}
.mino-ig-version-nav button{width:26px;height:26px;border-radius:6px;border:1px solid var(--dsw-alias-border-l2,#e2e8f0);background:var(--dsw-alias-bg-layer-2,#fff);cursor:pointer;font-size:14px;line-height:1}
.mino-ig-version-nav button:disabled{opacity:.4;cursor:default}
.mino-ig-version-count{font-size:12px;color:var(--dsw-alias-label-secondary,#64748b)}
.mino-ig-settings{display:block;max-width:640px}
.mino-ig-settings h3{margin:0 0 4px;font-size:16px}
.mino-ig-settings .mino-ig-desc{margin:0 0 16px;font-size:12.5px;color:var(--dsw-alias-label-secondary,#64748b)}
.mino-ig-field{margin-bottom:14px}
.mino-ig-field label{display:block;font-size:13px;margin-bottom:5px}
.mino-ig-field input[type=text],.mino-ig-field input[type=number]{box-sizing:border-box;width:100%;height:34px;padding:0 10px;border:1px solid var(--dsw-alias-border-l2,#e2e8f0);border-radius:7px;font-size:13px;background:var(--dsw-alias-bg-layer-2,#fff);color:var(--dsw-alias-label-primary,#1e293b)}
.mino-ig-field .mino-ig-hint{margin-top:4px;font-size:11.5px;color:var(--dsw-alias-label-secondary,#94a3b8)}
.mino-ig-toggle{display:flex;align-items:center;gap:8px;font-size:13px}
.mino-ig-save-row{display:flex;align-items:center;gap:10px;margin-top:16px}
.mino-ig-save-btn{height:32px;padding:0 16px;border:none;border-radius:7px;background:var(--dsw-alias-bg-brand,#2563eb);color:#fff;font-size:13px;cursor:pointer}
.mino-ig-save-btn:disabled{opacity:.55;cursor:default}
.mino-ig-save-msg{font-size:12.5px;color:var(--dsw-alias-label-secondary,#64748b)}
.mino-ig-note{font-size:12.5px;color:var(--dsw-alias-label-secondary,#64748b)}
`;
/** Mount the dictionaries, result row, tool cards, and the settings card. */
export function apply(ctx) {
    ctx.effect(() => {
        const style = document.createElement('style');
        style.dataset.plugin = 'mino-image';
        style.textContent = STYLE;
        document.head.appendChild(style);
        return () => { style.remove(); };
    }, 'mino-image: styles');
    ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'mino-image: dictionaries');
    ctx.effect(() => ctx.uiConversation.events.register(createImageResultDefinition()), 'mino-image: image result node');
    ctx.slots.inject('conversation.chat.node', () => ctx.slots.register({
        name: 'conversation.chat.node', key: IMAGE_RESULT_NODE_KIND, locale: NS,
    }, PromotedImageResultNode));
    for (const tool of ['generate_image', 'edit_image']) {
        ctx.slots.inject('tool.call.toolview', () => ctx.slots.register({
            name: 'tool.call.toolview', key: tool, locale: NS,
            inject: () => ({ promoted: true }),
        }, GeneratedImageCard));
    }
    ctx.slots.inject('tool.call.toolview', () => ctx.slots.register({
        name: 'tool.call.toolview', key: 'generate_images', locale: NS,
        inject: () => ({ promoted: true }),
    }, GeneratedImagesCard));
    const form = ctx.configForms.get('mino-image');
    ctx.effect(() => ctx.configForms.whileServed(['mino-image'], () => ctx.slots.inject('plugins.bundle.config', () => ctx.slots.register({
        name: 'plugins.bundle.config', key: 'mino-image', locale: NS,
        inject: () => ({
            hooks: { form },
            setField: (field, value) => form.set(field, value),
            unsetField: field => form.unset(field),
        }),
    }, MinoImageSettingsCard))), 'mino-image: settings card');
}
/* ============================== Settings card ============================== */
function MinoImageSettingsCard(props) {
    const { t } = props;
    const snapshot = props.useForm((state) => state);
    const [draft, setDraft] = useState({});
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState();
    useEffect(() => { setDraft(snapshot.value ?? {}); }, [snapshot.value]);
    if (props.view !== 'page')
        return null;
    if (snapshot.status !== 'ready') {
        return _jsx("div", { className: "mino-ig-settings", children: _jsx("p", { className: "mino-ig-note", children: t(snapshot.status === 'loading' ? 'settings.loading' : 'settings.unavailable') }) });
    }
    const writable = snapshot.writable;
    const stringField = (key) => typeof draft[key] === 'string' ? draft[key] : '';
    const set = (key, value) => setDraft(current => ({ ...current, [key]: value }));
    const save = async () => {
        setSaving(true);
        setMessage(undefined);
        let ok = true;
        for (const [field, value] of Object.entries(draft)) {
            if (value === '' || value === undefined) {
                if (!await props.unsetField(field))
                    ok = false;
            }
            else if (!await props.setField(field, value))
                ok = false;
        }
        setSaving(false);
        setMessage(t(ok ? 'settings.saved' : 'settings.writeRejected'));
    };
    return _jsxs("section", { className: "mino-ig-settings", "aria-label": t('settings.title'), children: [_jsx("h3", { children: t('settings.title') }), _jsx("p", { className: "mino-ig-desc", children: t('settings.desc') }), !writable ? _jsx("p", { className: "mino-ig-note", children: t('settings.readOnly') }) : null, _jsxs("div", { className: "mino-ig-field", children: [_jsx("label", { htmlFor: "mino-ig-model", children: t('settings.field.model') }), _jsx("input", { id: "mino-ig-model", type: "text", value: stringField('model'), disabled: !writable, onChange: e => { set('model', e.target.value); } }), _jsx("div", { className: "mino-ig-hint", children: t('settings.field.model.hint') })] }), _jsxs("div", { className: "mino-ig-field", children: [_jsx("label", { htmlFor: "mino-ig-edit-model", children: t('settings.field.editModel') }), _jsx("input", { id: "mino-ig-edit-model", type: "text", value: stringField('editModel'), disabled: !writable, onChange: e => { set('editModel', e.target.value); } }), _jsx("div", { className: "mino-ig-hint", children: t('settings.field.editModel.hint') })] }), _jsxs("div", { className: "mino-ig-field", children: [_jsx("label", { htmlFor: "mino-ig-size", children: t('settings.field.size') }), _jsx("input", { id: "mino-ig-size", type: "text", value: stringField('size'), disabled: !writable, onChange: e => { set('size', e.target.value); } })] }), _jsxs("div", { className: "mino-ig-field", children: [_jsx("label", { htmlFor: "mino-ig-quality", children: t('settings.field.quality') }), _jsx("input", { id: "mino-ig-quality", type: "text", value: stringField('quality'), disabled: !writable, onChange: e => { set('quality', e.target.value); } }), _jsx("div", { className: "mino-ig-hint", children: t('settings.field.quality.hint') })] }), _jsxs("div", { className: "mino-ig-field", children: [_jsx("label", { htmlFor: "mino-ig-timeout", children: t('settings.field.timeout') }), _jsx("input", { id: "mino-ig-timeout", type: "number", min: 5, max: 3600, value: Math.round((typeof draft.cloudTimeoutMs === 'number' ? draft.cloudTimeoutMs : 120000) / 1000), disabled: !writable, onChange: e => { set('cloudTimeoutMs', Math.max(5, Number(e.target.value) || 120) * 1000); } })] }), _jsxs("div", { className: "mino-ig-field mino-ig-toggle", children: [_jsx("input", { id: "mino-ig-save-ws", type: "checkbox", checked: draft.saveToWorkspace !== false, disabled: !writable, onChange: e => { set('saveToWorkspace', e.target.checked); } }), _jsx("label", { htmlFor: "mino-ig-save-ws", children: t('settings.field.saveToWorkspace') })] }), _jsxs("div", { className: "mino-ig-field", children: [_jsx("label", { htmlFor: "mino-ig-folder", children: t('settings.field.workspaceFolder') }), _jsx("input", { id: "mino-ig-folder", type: "text", value: stringField('workspaceFolder'), disabled: !writable, onChange: e => { set('workspaceFolder', e.target.value); } })] }), _jsxs("div", { className: "mino-ig-save-row", children: [_jsx("button", { type: "button", className: "mino-ig-save-btn", disabled: !writable || saving, onClick: () => { void save(); }, children: t(saving ? 'settings.saving' : 'settings.save') }), message ? _jsx("span", { className: "mino-ig-save-msg", children: message }) : null] })] });
}
/* ============================== Result cards ============================== */
function GeneratedImageCard(props) {
    if (props.phase !== 'result')
        return _jsx(ImagePendingRow, { t: props.t });
    const result = imageResultFromBlock(props.block);
    if (props.promoted && result !== undefined)
        return _jsx(PromotedResultNotice, { t: props.t });
    return _jsx(ImageResultCard, { result: result, loadImage: props.loadImage, t: props.t });
}
/** Suppress the folded duplicate on hosts with the promoted node; render every image otherwise. */
function GeneratedImagesCard(props) {
    if (props.phase !== 'result')
        return _jsx(ImagePendingRow, { t: props.t });
    const results = imageResultsFromMeta(props.block.meta);
    if (props.promoted && results.length > 0)
        return _jsx(PromotedResultNotice, { t: props.t });
    if (results.length === 0) {
        return _jsx("div", { children: props.block.content.filter(item => item.type === 'text').map((item, index) => _jsx("p", { children: item.type === 'text' ? item.text : '' }, index)) });
    }
    return _jsx("div", { className: "mino-ig-promoted-results", children: results.map((result, index) => _jsx(ImageResultCard, { result: result, loadImage: props.loadImage, t: props.t }, `${result.attachment.attachmentId}:${index}`)) });
}
function ImagePendingRow({ t }) {
    return _jsx("div", { className: "mino-ig-loading", children: t('card.generating') });
}
function PromotedResultNotice({ t }) {
    return _jsx("div", { className: "mino-ig-loading", children: t('card.resultShown') });
}
/** Render image artifacts as final conversation output instead of Tool process content. */
function PromotedImageResultNode(props) {
    return _jsx("div", { className: "mino-ig-promoted-results", children: props.node.data.results.map((result, index) => _jsx(ImageResultCard, { result: result, loadImage: props.loadImage, t: props.t }, `${result.attachment.attachmentId}:${index}`)) });
}
function ImageResultCard({ result, loadImage, t, }) {
    const attachment = result?.attachment;
    const originId = attachment?.attachmentId;
    const [revisionChain, setRevisionChain] = useState(() => loadConversationImageRevisionChain(String(originId ?? '')));
    const selectedRevision = revisionChain.revisions[revisionChain.currentIndex - 1];
    const activeAttachment = selectedRevision?.attachment ?? attachment;
    const activeResult = selectedRevision !== undefined ? {
        prompt: selectedRevision.prompt,
        provider: selectedRevision.provider,
        model: selectedRevision.model,
        output: selectedRevision.output,
    } : result;
    const savedTo = result?.savedTo;
    const [url, setUrl] = useState();
    const [blob, setBlob] = useState();
    const [error, setError] = useState();
    const [previewOpen, setPreviewOpen] = useState(false);
    const [toast, setToast] = useState();
    const [regenerateOpen, setRegenerateOpen] = useState(false);
    const [regeneratePrompt, setRegeneratePrompt] = useState('');
    const [regenerateError, setRegenerateError] = useState();
    const [isRegenerating, setIsRegenerating] = useState(false);
    const regenerateControllerRef = useRef();
    const regenerateTextareaRef = useRef(null);
    useEffect(() => {
        if (!originId)
            return;
        regenerateControllerRef.current?.abort();
        regenerateControllerRef.current = undefined;
        setIsRegenerating(false);
        setRegenerateOpen(false);
        setRevisionChain(loadConversationImageRevisionChain(String(originId)));
    }, [originId]);
    useEffect(() => () => { regenerateControllerRef.current?.abort(); }, []);
    useEffect(() => {
        if (!regenerateOpen || isRegenerating)
            return;
        const frame = requestAnimationFrame(() => {
            regenerateTextareaRef.current?.focus();
            regenerateTextareaRef.current?.select();
        });
        const onKeyDown = (event) => {
            if (event.key === 'Escape')
                setRegenerateOpen(false);
        };
        window.addEventListener('keydown', onKeyDown);
        return () => {
            cancelAnimationFrame(frame);
            window.removeEventListener('keydown', onKeyDown);
        };
    }, [regenerateOpen, isRegenerating]);
    useEffect(() => {
        if (!previewOpen)
            return;
        const onKeyDown = (e) => {
            if (e.key === 'Escape')
                setPreviewOpen(false);
        };
        window.addEventListener('keydown', onKeyDown);
        return () => { window.removeEventListener('keydown', onKeyDown); };
    }, [previewOpen]);
    const currentUrlRef = useRef();
    useEffect(() => () => {
        if (currentUrlRef.current !== undefined) {
            URL.revokeObjectURL(currentUrlRef.current);
            currentUrlRef.current = undefined;
        }
    }, []);
    useEffect(() => {
        if (activeAttachment === undefined)
            return;
        let canceled = false;
        void loadImage(activeAttachment).then(async (resUrl) => {
            if (canceled)
                return;
            setError(undefined);
            setUrl(resUrl);
            const fetched = await fetch(resUrl).then(res => res.ok ? res.blob() : Promise.reject(new Error(`HTTP ${String(res.status)}`))).catch(() => undefined);
            if (!canceled)
                setBlob(fetched);
        }).catch((cause) => {
            if (canceled)
                return;
            setError(cause instanceof Error ? cause.message : String(cause));
        });
        return () => { canceled = true; };
    }, [activeAttachment, loadImage]);
    const copy = async (e) => {
        e.stopPropagation();
        if (!blob)
            return;
        const ok = await copyImageBlob(blob);
        setToast(ok ? t('card.copiedImage') : t('card.copyFailed'));
        setTimeout(() => { setToast(undefined); }, 2000);
    };
    const download = (e) => {
        e.stopPropagation();
        if (!url)
            return;
        const a = document.createElement('a');
        a.href = url;
        a.download = activeAttachment?.name || `mino-image-${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };
    const openNewTab = (e) => {
        e.stopPropagation();
        if (!url)
            return;
        window.open(url, '_blank', 'noopener,noreferrer');
    };
    const openRegenerate = (event) => {
        event.stopPropagation();
        if (activeResult === undefined || isRegenerating)
            return;
        setRegeneratePrompt(activeResult.prompt);
        setRegenerateError(undefined);
        setRegenerateOpen(true);
    };
    const cancelRegenerate = () => {
        regenerateControllerRef.current?.abort();
        regenerateControllerRef.current = undefined;
        setIsRegenerating(false);
        setRegenerateOpen(false);
        setRegenerateError(undefined);
    };
    const regenerate = async () => {
        if (activeResult === undefined || !originId || isRegenerating || regeneratePrompt.trim().length === 0)
            return;
        setIsRegenerating(true);
        setRegenerateError(undefined);
        setRegenerateOpen(false);
        const controller = new AbortController();
        regenerateControllerRef.current = controller;
        try {
            const request = conversationRegenerateRequest(activeResult, regeneratePrompt, selectedRevision === undefined ? undefined : { ratio: selectedRevision.ratio, quality: selectedRevision.quality });
            const response = await fetch(GENERATE_ROUTE, {
                method: 'POST',
                credentials: 'same-origin',
                signal: controller.signal,
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify(request),
            });
            const payload = await response.json().catch(() => null);
            const generated = payload !== null && 'attachment' in payload ? imageAttachment(payload.attachment) : undefined;
            if (!response.ok || payload === null || generated === undefined || !('attachment' in payload)) {
                throw new Error(payload && 'error' in payload && payload.error ? payload.error : t('card.regenerateFailed'));
            }
            const revision = {
                attachment: generated,
                prompt: payload.prompt,
                provider: 'mino',
                model: payload.model,
                output: payload.output,
                createdAt: payload.createdAt,
                ratio: request.size !== undefined ? ratioOf(request.size) : '1:1',
                quality: request.quality ?? 'default',
            };
            const next = appendConversationImageRevision(String(originId), revision);
            setRevisionChain(next);
            setToast(t('card.regenerate'));
            setTimeout(() => { setToast(undefined); }, 2000);
        }
        catch (cause) {
            if (!controller.signal.aborted) {
                const errMsg = cause instanceof Error ? cause.message : String(cause);
                setError(errMsg);
                setToast(errMsg);
                setTimeout(() => { setToast(undefined); }, 3500);
            }
        }
        finally {
            if (regenerateControllerRef.current === controller) {
                regenerateControllerRef.current = undefined;
                setIsRegenerating(false);
            }
        }
    };
    const selectVersion = (index) => {
        if (!originId || isRegenerating)
            return;
        setRevisionChain(selectConversationImageRevision(String(originId), index));
    };
    const canRegenerate = activeResult !== undefined && activeResult.model.trim().length > 0;
    const versionTotal = revisionChain.revisions.length + 1;
    const versionCurrent = revisionChain.currentIndex + 1;
    if (attachment === undefined)
        return _jsx("div", { className: "mino-ig-loading", children: t('card.generating') });
    return _jsxs("section", { className: "mino-ig-result", "aria-label": t('card.generatedTitle'), children: [_jsx("div", { className: "mino-ig-result-title", children: t('card.generatedTitle') }), savedTo !== undefined ? _jsxs("div", { className: "mino-ig-savedto", children: [t('card.savedToPath'), ": ", savedTo] }) : null, error !== undefined ? _jsx("div", { className: "mino-ig-error", children: error }) : null, url === undefined && error === undefined ? _jsx("div", { className: "mino-ig-loading", children: t('card.loading') }) : null, url !== undefined ? _jsxs("div", { className: "mino-ig-container", children: [_jsx("img", { className: "mino-ig-image", src: url, alt: activeAttachment?.name ?? 'Generated image', onClick: () => { if (!isRegenerating)
                            setPreviewOpen(true); } }), isRegenerating ? (_jsxs("div", { className: "mino-ig-regenerate-overlay", children: [_jsx("div", { className: "mino-ig-regenerate-spinner" }), _jsx("span", { className: "mino-ig-regenerate-overlay-text", children: t('card.regenerating') }), _jsx("button", { type: "button", className: "mino-ig-regenerate-overlay-cancel", onClick: cancelRegenerate, children: t('card.cancel') })] })) : null, _jsxs("div", { className: "mino-ig-toolbar", children: [canRegenerate ? _jsx("button", { type: "button", className: "mino-ig-tool-btn", disabled: isRegenerating, title: isRegenerating ? t('card.regenerating') : t('card.regenerate'), onClick: openRegenerate, children: _jsxs("svg", { width: "15", height: "15", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [_jsx("path", { d: "M20 11a8.1 8.1 0 0 0-15.5-2M4 4v5h5" }), _jsx("path", { d: "M4 13a8.1 8.1 0 0 0 15.5 2M20 20v-5h-5" })] }) }) : null, _jsx("button", { type: "button", className: "mino-ig-tool-btn", title: t('card.copyImg'), onClick: (e) => { void copy(e); }, children: _jsxs("svg", { width: "15", height: "15", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [_jsx("rect", { x: "9", y: "9", width: "13", height: "13", rx: "2", ry: "2" }), _jsx("path", { d: "M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" })] }) }), _jsx("button", { type: "button", className: "mino-ig-tool-btn", title: t('card.download'), onClick: download, children: _jsxs("svg", { width: "15", height: "15", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [_jsx("path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" }), _jsx("polyline", { points: "7 10 12 15 17 10" }), _jsx("line", { x1: "12", y1: "15", x2: "12", y2: "3" })] }) }), _jsx("button", { type: "button", className: "mino-ig-tool-btn", title: t('card.openNewTab'), onClick: openNewTab, children: _jsxs("svg", { width: "15", height: "15", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [_jsx("path", { d: "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" }), _jsx("polyline", { points: "15 3 21 3 21 9" }), _jsx("line", { x1: "10", y1: "14", x2: "21", y2: "3" })] }) }), toast ? _jsx("div", { className: "mino-ig-toast", children: toast }) : null] }), versionTotal > 1 ? _jsxs("div", { className: "mino-ig-version-nav", "aria-label": t('card.versionLabel', { current: String(versionCurrent), total: String(versionTotal) }), children: [_jsx("button", { type: "button", title: t('card.versionPrevious'), disabled: revisionChain.currentIndex === 0 || isRegenerating, onClick: (event) => { event.stopPropagation(); selectVersion(revisionChain.currentIndex - 1); }, children: "\u2039" }), _jsxs("span", { className: "mino-ig-version-count", children: [versionCurrent, "/", versionTotal] }), _jsx("button", { type: "button", title: t('card.versionNext'), disabled: revisionChain.currentIndex >= revisionChain.revisions.length || isRegenerating, onClick: (event) => { event.stopPropagation(); selectVersion(revisionChain.currentIndex + 1); }, children: "\u203A" })] }) : null] }) : null, previewOpen && url !== undefined ? _jsx("div", { className: "mino-ig-lightbox-backdrop", onClick: () => { setPreviewOpen(false); }, children: _jsx("div", { onClick: (e) => { e.stopPropagation(); }, children: _jsx("img", { className: "mino-ig-lightbox-img", src: url, alt: activeAttachment?.name ?? 'Generated image preview' }) }) }) : null, regenerateOpen && activeResult !== undefined ? _jsx("div", { className: "mino-ig-regenerate-backdrop", onMouseDown: (event) => {
                    if (event.target === event.currentTarget && !isRegenerating)
                        setRegenerateOpen(false);
                }, children: _jsxs("div", { className: "mino-ig-regenerate-dialog", role: "dialog", "aria-modal": "true", "aria-labelledby": `mino-ig-regenerate-${String(originId)}`, children: [_jsx("h3", { id: `mino-ig-regenerate-${String(originId)}`, children: t('card.regenerateTitle') }), _jsx("p", { children: t('card.regenerateHint') }), _jsxs("label", { children: [_jsx("span", { children: t('card.promptLabel') }), _jsx("textarea", { ref: regenerateTextareaRef, value: regeneratePrompt, disabled: isRegenerating, onChange: (event) => setRegeneratePrompt(event.target.value), onKeyDown: (event) => {
                                        if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
                                            event.preventDefault();
                                            void regenerate();
                                        }
                                    } })] }), regenerateError ? _jsx("p", { className: "mino-ig-regenerate-error", role: "alert", children: regenerateError }) : null, _jsxs("div", { className: "mino-ig-regenerate-actions", children: [_jsx("button", { type: "button", className: "mino-ig-regenerate-cancel", onClick: cancelRegenerate, children: t('card.cancel') }), _jsx("button", { type: "button", className: "mino-ig-regenerate-confirm", disabled: isRegenerating || regeneratePrompt.trim().length === 0, onClick: () => { void regenerate(); }, children: t('card.confirmRegenerate') })] })] }) }) : null] });
}
function ratioOf(size) {
    const sizes = { '1024x1024': '1:1', '1536x1024': '3:2', '1024x1536': '2:3' };
    return sizes[size] ?? '1:1';
}
/** Copy a Blob to the clipboard as PNG where the platform allows it. */
async function copyImageBlob(blob) {
    try {
        let target = blob;
        if (blob.type !== 'image/png' && typeof createImageBitmap === 'function') {
            const bitmap = await createImageBitmap(blob);
            const canvas = document.createElement('canvas');
            canvas.width = bitmap.width;
            canvas.height = bitmap.height;
            const context = canvas.getContext('2d');
            if (context !== null) {
                context.drawImage(bitmap, 0, 0);
                target = await new Promise((resolve, reject) => {
                    canvas.toBlob(result => result === null ? reject(new Error('png encode failed')) : resolve(result), 'image/png');
                });
            }
            bitmap.close();
        }
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': target })]);
        return true;
    }
    catch {
        return false;
    }
}
/** Parse one presentation record off a settled Tool block's durable meta. */
function imageResultFromBlock(block) {
    const meta = imageResultFromMeta(block.meta);
    const sourceIds = sourceAttachmentIdsOf(block);
    const fallbackAttachment = block.content.find(item => item.type === 'image' && 'attachment' in item);
    const attachment = meta?.attachment
        ?? (fallbackAttachment?.type === 'image' ? fallbackAttachment.attachment : undefined);
    if (attachment === undefined)
        return undefined;
    const prompt = block.args.value('prompt');
    return {
        attachment,
        prompt: meta?.prompt ?? (typeof prompt === 'string' ? prompt : 'Generated Image'),
        provider: meta?.provider ?? 'mino',
        model: meta?.model ?? '',
        output: meta?.output ?? '',
        ...(meta?.savedTo === undefined ? {} : { savedTo: meta.savedTo }),
        ...(sourceIds === undefined ? {} : { sourceAttachmentIds: sourceIds }),
    };
}
/** Read edit_image's source attachment selectors off the recorded call arguments. */
function sourceAttachmentIdsOf(block) {
    const single = block.args.value('source_attachment_id');
    const list = block.args.value('source_attachment_ids');
    const ids = typeof single === 'string' ? [single]
        : Array.isArray(list) ? list.filter((id) => typeof id === 'string')
            : undefined;
    return ids !== undefined && ids.length > 0 ? ids : undefined;
}
//# sourceMappingURL=index.js.map