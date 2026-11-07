/**
 * Mino image plugin, browser half: promoted generated-image Chat rows, keyed
 * Tool view cards for the image tools, and the bundle configuration card.
 * Copy comes through the `dsh-image-gen` locale namespace; image bytes arrive
 * through the owner-supplied authorized `loadImage` loader.
 */
import { useEffect, useRef, useState } from 'react'
import type { Context as ClientContext } from '@deepseek-ai/cordis'
import type { ImageAttachmentRef } from '@deepseek-ai/dsh-attachment'
import type {} from '@deepseek-ai/dsh-api-session-controller/client'
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
import type {} from '@deepseek-ai/dsh-client-ui-chat/client'
import type {} from '@deepseek-ai/dsh-client-ui-plugin-manager/client'
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import type {} from '@deepseek-ai/dsh-client-ui-tool/client'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type { MessageImageLoader, ToolResultNode } from '@deepseek-ai/dsh-client-ui-conversation/client'
import type { ToolCallViewProps } from '@deepseek-ai/dsh-client-ui-tool/client'
import type { PluginConfigViewProps } from '@deepseek-ai/dsh-client-ui-plugin-manager/client'
import type { ConfigForm, ConfigFormSnapshot } from '@deepseek-ai/dsh-client-ui-settings/client'
import type { InjectFace, PropsLocale, PropsRuntime, TranslateNS } from '@deepseek-ai/dsh-client-ui-slots'
import { GENERATE_ROUTE, type GenerateRouteResponse } from '../shared.js'
import { en, zh, NS, type MinoImageKey } from './locales.js'
import {
  createImageResultDefinition, imageAttachment, imageResultFromMeta, imageResultsFromMeta,
  IMAGE_RESULT_NODE_KIND, type ImageResultPresentation,
} from './image-result-node.js'
import {
  appendConversationImageRevision, loadConversationImageRevisionChain,
  selectConversationImageRevision,
  type ConversationImageRevision, type ConversationImageRevisionChain,
} from './conversation-image-revisions.js'
import { conversationRegenerateRequest } from './conversation-regenerate.js'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** Generated-image card, promoted row, and settings-page copy. */
    'dsh-image-gen': MinoImageKey
  }
}

/** Business face injected into the image tool cards. */
interface ImageCardInjected {
  /** True once the promoted result node is registered; folded duplicates hide. */
  readonly promoted: boolean
}

/** Business face injected into the bundle settings card. */
interface SettingsInjected {
  readonly hooks: {
    /** Live configuration snapshot for the `dsh-image-gen` namespace. */
    readonly form: ConfigForm<Record<string, unknown>>
  }
  readonly setField: (field: string, value: unknown) => Promise<boolean>
  readonly unsetField: (field: string) => Promise<boolean>
}

type ImageCardProps = ToolCallViewProps & PropsLocale<'dsh-image-gen'> & InjectFace<ImageCardInjected>
type ImageResultNodeProps = PropsRuntime<'conversation.chat.node', 'dsh-image-gen-result'> & PropsLocale<'dsh-image-gen'>
type SettingsCardProps = PluginConfigViewProps & PropsLocale<'dsh-image-gen'> & InjectFace<SettingsInjected>
type T = TranslateNS<'dsh-image-gen'>

/** Required browser services for the registrations and dictionaries. */
export const inject = ['slots', 'locale', 'uiConversation', 'configForms']

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
`

/** Mount the dictionaries, result row, tool cards, and the settings card. */
export function apply(ctx: ClientContext): void {
  ctx.effect(() => {
    const style = document.createElement('style')
    style.dataset.plugin = 'dsh-image-gen'
    style.textContent = STYLE
    document.head.appendChild(style)
    return () => { style.remove() }
  }, 'dsh-image-gen: styles')
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'dsh-image-gen: dictionaries')
  ctx.effect(
    () => ctx.uiConversation.events.register(createImageResultDefinition()),
    'dsh-image-gen: image result node',
  )
  ctx.slots.inject('conversation.chat.node', () => ctx.slots.register({
    name: 'conversation.chat.node', key: IMAGE_RESULT_NODE_KIND, locale: NS,
  }, PromotedImageResultNode))
  for (const tool of ['generate_image', 'edit_image'] as const) {
    ctx.slots.inject('tool.call.toolview', () => ctx.slots.register({
      name: 'tool.call.toolview', key: tool, locale: NS,
      inject: (): ImageCardInjected => ({ promoted: true }),
    }, GeneratedImageCard))
  }
  ctx.slots.inject('tool.call.toolview', () => ctx.slots.register({
    name: 'tool.call.toolview', key: 'generate_images', locale: NS,
    inject: (): ImageCardInjected => ({ promoted: true }),
  }, GeneratedImagesCard))

  const form = ctx.configForms.get<Record<string, unknown>>('dsh-image-gen')
  ctx.effect(() => ctx.configForms.whileServed(['dsh-image-gen'], () =>
    ctx.slots.inject('plugins.bundle.config', () => ctx.slots.register({
      name: 'plugins.bundle.config', key: 'dsh-image-gen', locale: NS,
      inject: (): SettingsInjected => ({
        hooks: { form },
        setField: (field, value) => form.set(field, value),
        unsetField: field => form.unset(field),
      }),
    }, MinoImageSettingsCard)),
  ), 'dsh-image-gen: settings card')
}

/* ============================== Settings card ============================== */

function MinoImageSettingsCard(props: SettingsCardProps) {
  const { t } = props
  const snapshot = props.useForm((state: ConfigFormSnapshot<Record<string, unknown>> | undefined) => state)
  const [draft, setDraft] = useState<Record<string, unknown>>({})
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string>()

  useEffect(() => { setDraft(snapshot.value ?? {}) }, [snapshot.value])

  if (props.view !== 'page') return null
  if (snapshot.status !== 'ready') {
    return <div className="mino-ig-settings"><p className="mino-ig-note">{t(snapshot.status === 'loading' ? 'settings.loading' : 'settings.unavailable')}</p></div>
  }
  const writable = snapshot.writable
  const stringField = (key: string): string => typeof draft[key] === 'string' ? draft[key] : ''
  const set = (key: string, value: unknown) => setDraft(current => ({ ...current, [key]: value }))

  const save = async () => {
    setSaving(true)
    setMessage(undefined)
    let ok = true
    for (const [field, value] of Object.entries(draft)) {
      if (value === '' || value === undefined) {
        if (!await props.unsetField(field)) ok = false
      } else if (!await props.setField(field, value)) ok = false
    }
    setSaving(false)
    setMessage(t(ok ? 'settings.saved' : 'settings.writeRejected'))
  }

  return <section className="mino-ig-settings" aria-label={t('settings.title')}>
    <h3>{t('settings.title')}</h3>
    <p className="mino-ig-desc">{t('settings.desc')}</p>
    {!writable ? <p className="mino-ig-note">{t('settings.readOnly')}</p> : null}
    <div className="mino-ig-field">
      <label htmlFor="mino-ig-model">{t('settings.field.model')}</label>
      <input id="mino-ig-model" type="text" value={stringField('model')} disabled={!writable} onChange={e => { set('model', e.target.value) }} />
      <div className="mino-ig-hint">{t('settings.field.model.hint')}</div>
    </div>
    <div className="mino-ig-field">
      <label htmlFor="mino-ig-edit-model">{t('settings.field.editModel')}</label>
      <input id="mino-ig-edit-model" type="text" value={stringField('editModel')} disabled={!writable} onChange={e => { set('editModel', e.target.value) }} />
      <div className="mino-ig-hint">{t('settings.field.editModel.hint')}</div>
    </div>
    <div className="mino-ig-field">
      <label htmlFor="mino-ig-size">{t('settings.field.size')}</label>
      <input id="mino-ig-size" type="text" value={stringField('size')} disabled={!writable} onChange={e => { set('size', e.target.value) }} />
    </div>
    <div className="mino-ig-field">
      <label htmlFor="mino-ig-quality">{t('settings.field.quality')}</label>
      <input id="mino-ig-quality" type="text" value={stringField('quality')} disabled={!writable} onChange={e => { set('quality', e.target.value) }} />
      <div className="mino-ig-hint">{t('settings.field.quality.hint')}</div>
    </div>
    <div className="mino-ig-field">
      <label htmlFor="mino-ig-timeout">{t('settings.field.timeout')}</label>
      <input id="mino-ig-timeout" type="number" min={5} max={3600}
        value={Math.round((typeof draft.cloudTimeoutMs === 'number' ? draft.cloudTimeoutMs : 120000) / 1000)}
        disabled={!writable}
        onChange={e => { set('cloudTimeoutMs', Math.max(5, Number(e.target.value) || 120) * 1000) }} />
    </div>
    <div className="mino-ig-field mino-ig-toggle">
      <input id="mino-ig-save-ws" type="checkbox" checked={draft.saveToWorkspace !== false} disabled={!writable} onChange={e => { set('saveToWorkspace', e.target.checked) }} />
      <label htmlFor="mino-ig-save-ws">{t('settings.field.saveToWorkspace')}</label>
    </div>
    <div className="mino-ig-field">
      <label htmlFor="mino-ig-folder">{t('settings.field.workspaceFolder')}</label>
      <input id="mino-ig-folder" type="text" value={stringField('workspaceFolder')} disabled={!writable} onChange={e => { set('workspaceFolder', e.target.value) }} />
    </div>
    <div className="mino-ig-save-row">
      <button type="button" className="mino-ig-save-btn" disabled={!writable || saving} onClick={() => { void save() }}>{t(saving ? 'settings.saving' : 'settings.save')}</button>
      {message ? <span className="mino-ig-save-msg">{message}</span> : null}
    </div>
  </section>
}

/* ============================== Result cards ============================== */

function GeneratedImageCard(props: ImageCardProps) {
  if (props.phase !== 'result') return <ImagePendingRow t={props.t} />
  const result = imageResultFromBlock(props.block)
  if (props.promoted && result !== undefined) return <PromotedResultNotice t={props.t} />
  return <ImageResultCard result={result} loadImage={props.loadImage} t={props.t} />
}

/** Suppress the folded duplicate on hosts with the promoted node; render every image otherwise. */
function GeneratedImagesCard(props: ImageCardProps) {
  if (props.phase !== 'result') return <ImagePendingRow t={props.t} />
  const results = imageResultsFromMeta(props.block.meta)
  if (props.promoted && results.length > 0) return <PromotedResultNotice t={props.t} />
  if (results.length === 0) {
    return <div>{props.block.content.filter(item => item.type === 'text').map((item, index) =>
      <p key={index}>{item.type === 'text' ? item.text : ''}</p>)}</div>
  }
  return <div className="mino-ig-promoted-results">
    {results.map((result, index) =>
      <ImageResultCard key={`${result.attachment.attachmentId}:${index}`} result={result} loadImage={props.loadImage} t={props.t} />)}
  </div>
}

function ImagePendingRow({ t }: { t: T }) {
  return <div className="mino-ig-loading">{t('card.generating')}</div>
}

function PromotedResultNotice({ t }: { t: T }) {
  return <div className="mino-ig-loading">{t('card.resultShown')}</div>
}

/** Render image artifacts as final conversation output instead of Tool process content. */
function PromotedImageResultNode(props: ImageResultNodeProps) {
  return <div className="mino-ig-promoted-results">
    {props.node.data.results.map((result, index) =>
      <ImageResultCard key={`${result.attachment.attachmentId}:${index}`} result={result} loadImage={props.loadImage} t={props.t} />)}
  </div>
}

function ImageResultCard({
  result,
  loadImage,
  t,
}: {
  result?: ImageResultPresentation | undefined
  loadImage: MessageImageLoader
  t: T
}) {
  const attachment = result?.attachment
  const originId = attachment?.attachmentId
  const [revisionChain, setRevisionChain] = useState<ConversationImageRevisionChain>(() =>
    loadConversationImageRevisionChain(String(originId ?? ''))
  )
  const selectedRevision = revisionChain.revisions[revisionChain.currentIndex - 1]
  const activeAttachment = selectedRevision?.attachment ?? attachment
  const activeResult = selectedRevision !== undefined ? {
    prompt: selectedRevision.prompt,
    provider: selectedRevision.provider,
    model: selectedRevision.model,
    output: selectedRevision.output,
  } : result
  const savedTo = result?.savedTo
  const [url, setUrl] = useState<string>()
  const [blob, setBlob] = useState<Blob>()
  const [error, setError] = useState<string>()
  const [previewOpen, setPreviewOpen] = useState(false)
  const [toast, setToast] = useState<string>()
  const [regenerateOpen, setRegenerateOpen] = useState(false)
  const [regeneratePrompt, setRegeneratePrompt] = useState('')
  const [regenerateError, setRegenerateError] = useState<string>()
  const [isRegenerating, setIsRegenerating] = useState(false)
  const regenerateControllerRef = useRef<AbortController>()
  const regenerateTextareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (!originId) return
    regenerateControllerRef.current?.abort()
    regenerateControllerRef.current = undefined
    setIsRegenerating(false)
    setRegenerateOpen(false)
    setRevisionChain(loadConversationImageRevisionChain(String(originId)))
  }, [originId])

  useEffect(() => () => { regenerateControllerRef.current?.abort() }, [])

  useEffect(() => {
    if (!regenerateOpen || isRegenerating) return
    const frame = requestAnimationFrame(() => {
      regenerateTextareaRef.current?.focus()
      regenerateTextareaRef.current?.select()
    })
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setRegenerateOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [regenerateOpen, isRegenerating])

  useEffect(() => {
    if (!previewOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPreviewOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => { window.removeEventListener('keydown', onKeyDown) }
  }, [previewOpen])

  const currentUrlRef = useRef<string | undefined>()
  useEffect(() => () => {
    if (currentUrlRef.current !== undefined) {
      URL.revokeObjectURL(currentUrlRef.current)
      currentUrlRef.current = undefined
    }
  }, [])

  useEffect(() => {
    if (activeAttachment === undefined) return
    let canceled = false
    void loadImage(activeAttachment).then(async resUrl => {
      if (canceled) return
      setError(undefined)
      setUrl(resUrl)
      const fetched = await fetch(resUrl).then(res => res.ok ? res.blob() : Promise.reject(new Error(`HTTP ${String(res.status)}`))).catch(() => undefined)
      if (!canceled) setBlob(fetched)
    }).catch((cause: unknown) => {
      if (canceled) return
      setError(cause instanceof Error ? cause.message : String(cause))
    })
    return () => { canceled = true }
  }, [activeAttachment, loadImage])

  const copy = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!blob) return
    const ok = await copyImageBlob(blob)
    setToast(ok ? t('card.copiedImage') : t('card.copyFailed'))
    setTimeout(() => { setToast(undefined) }, 2000)
  }

  const download = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!url) return
    const a = document.createElement('a')
    a.href = url
    a.download = activeAttachment?.name || `dsh-image-gen-${Date.now()}.png`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const openNewTab = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!url) return
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const openRegenerate = (event: React.MouseEvent) => {
    event.stopPropagation()
    if (activeResult === undefined || isRegenerating) return
    setRegeneratePrompt(activeResult.prompt)
    setRegenerateError(undefined)
    setRegenerateOpen(true)
  }

  const cancelRegenerate = () => {
    regenerateControllerRef.current?.abort()
    regenerateControllerRef.current = undefined
    setIsRegenerating(false)
    setRegenerateOpen(false)
    setRegenerateError(undefined)
  }

  const regenerate = async () => {
    if (activeResult === undefined || !originId || isRegenerating || regeneratePrompt.trim().length === 0) return
    setIsRegenerating(true)
    setRegenerateError(undefined)
    setRegenerateOpen(false)
    const controller = new AbortController()
    regenerateControllerRef.current = controller
    try {
      const request = conversationRegenerateRequest(
        activeResult,
        regeneratePrompt,
        selectedRevision === undefined ? undefined : { ratio: selectedRevision.ratio, quality: selectedRevision.quality },
      )
      const response = await fetch(GENERATE_ROUTE, {
        method: 'POST',
        credentials: 'same-origin',
        signal: controller.signal,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(request),
      })
      const payload = await response.json().catch(() => null) as (GenerateRouteResponse & { attachment?: unknown }) | { error?: string } | null
      const generated = payload !== null && 'attachment' in payload ? imageAttachment(payload.attachment) : undefined
      if (!response.ok || payload === null || generated === undefined || !('attachment' in payload)) {
        throw new Error(payload && 'error' in payload && payload.error ? payload.error : t('card.regenerateFailed'))
      }
      const revision: ConversationImageRevision = {
        attachment: generated,
        prompt: payload.prompt,
        provider: 'mino',
        model: payload.model,
        output: payload.output,
        createdAt: payload.createdAt,
        ratio: request.size !== undefined ? ratioOf(request.size) : '1:1',
        quality: request.quality ?? 'default',
      }
      const next = appendConversationImageRevision(String(originId), revision)
      setRevisionChain(next)
      setToast(t('card.regenerate'))
      setTimeout(() => { setToast(undefined) }, 2000)
    } catch (cause) {
      if (!controller.signal.aborted) {
        const errMsg = cause instanceof Error ? cause.message : String(cause)
        setError(errMsg)
        setToast(errMsg)
        setTimeout(() => { setToast(undefined) }, 3500)
      }
    } finally {
      if (regenerateControllerRef.current === controller) {
        regenerateControllerRef.current = undefined
        setIsRegenerating(false)
      }
    }
  }

  const selectVersion = (index: number) => {
    if (!originId || isRegenerating) return
    setRevisionChain(selectConversationImageRevision(String(originId), index))
  }

  const canRegenerate = activeResult !== undefined && activeResult.model.trim().length > 0
  const versionTotal = revisionChain.revisions.length + 1
  const versionCurrent = revisionChain.currentIndex + 1

  if (attachment === undefined) return <div className="mino-ig-loading">{t('card.generating')}</div>
  return <section className="mino-ig-result" aria-label={t('card.generatedTitle')}>
    <div className="mino-ig-result-title">{t('card.generatedTitle')}</div>
    {savedTo !== undefined ? <div className="mino-ig-savedto">{t('card.savedToPath')}: {savedTo}</div> : null}
    {error !== undefined ? <div className="mino-ig-error">{error}</div> : null}
    {url === undefined && error === undefined ? <div className="mino-ig-loading">{t('card.loading')}</div> : null}
    {url !== undefined ? <div className="mino-ig-container">
      <img
        className="mino-ig-image"
        src={url}
        alt={activeAttachment?.name ?? 'Generated image'}
        onClick={() => { if (!isRegenerating) setPreviewOpen(true) }}
      />
      {isRegenerating ? (
        <div className="mino-ig-regenerate-overlay">
          <div className="mino-ig-regenerate-spinner" />
          <span className="mino-ig-regenerate-overlay-text">{t('card.regenerating')}</span>
          <button type="button" className="mino-ig-regenerate-overlay-cancel" onClick={cancelRegenerate}>
            {t('card.cancel')}
          </button>
        </div>
      ) : null}
      <div className="mino-ig-toolbar">
        {canRegenerate ? <button type="button" className="mino-ig-tool-btn" disabled={isRegenerating} title={isRegenerating ? t('card.regenerating') : t('card.regenerate')} onClick={openRegenerate}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 11a8.1 8.1 0 0 0-15.5-2M4 4v5h5"/><path d="M4 13a8.1 8.1 0 0 0 15.5 2M20 20v-5h-5"/></svg>
        </button> : null}
        <button type="button" className="mino-ig-tool-btn" title={t('card.copyImg')} onClick={(e) => { void copy(e) }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
        </button>
        <button type="button" className="mino-ig-tool-btn" title={t('card.download')} onClick={download}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        </button>
        <button type="button" className="mino-ig-tool-btn" title={t('card.openNewTab')} onClick={openNewTab}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
        </button>
        {toast ? <div className="mino-ig-toast">{toast}</div> : null}
      </div>
      {versionTotal > 1 ? <div className="mino-ig-version-nav" aria-label={t('card.versionLabel', { current: String(versionCurrent), total: String(versionTotal) })}>
        <button type="button" title={t('card.versionPrevious')} disabled={revisionChain.currentIndex === 0 || isRegenerating} onClick={(event) => { event.stopPropagation(); selectVersion(revisionChain.currentIndex - 1) }}>‹</button>
        <span className="mino-ig-version-count">{versionCurrent}/{versionTotal}</span>
        <button type="button" title={t('card.versionNext')} disabled={revisionChain.currentIndex >= revisionChain.revisions.length || isRegenerating} onClick={(event) => { event.stopPropagation(); selectVersion(revisionChain.currentIndex + 1) }}>›</button>
      </div> : null}
    </div> : null}

    {previewOpen && url !== undefined ? <div className="mino-ig-lightbox-backdrop" onClick={() => { setPreviewOpen(false) }}>
      <div onClick={(e) => { e.stopPropagation() }}>
        <img
          className="mino-ig-lightbox-img"
          src={url}
          alt={activeAttachment?.name ?? 'Generated image preview'}
        />
      </div>
    </div> : null}
    {regenerateOpen && activeResult !== undefined ? <div className="mino-ig-regenerate-backdrop" onMouseDown={(event) => {
      if (event.target === event.currentTarget && !isRegenerating) setRegenerateOpen(false)
    }}>
      <div className="mino-ig-regenerate-dialog" role="dialog" aria-modal="true" aria-labelledby={`mino-ig-regenerate-${String(originId)}`}>
        <h3 id={`mino-ig-regenerate-${String(originId)}`}>{t('card.regenerateTitle')}</h3>
        <p>{t('card.regenerateHint')}</p>
        <label>
          <span>{t('card.promptLabel')}</span>
          <textarea
            ref={regenerateTextareaRef}
            value={regeneratePrompt}
            disabled={isRegenerating}
            onChange={(event) => setRegeneratePrompt(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
                event.preventDefault()
                void regenerate()
              }
            }}
          />
        </label>
        {regenerateError ? <p className="mino-ig-regenerate-error" role="alert">{regenerateError}</p> : null}
        <div className="mino-ig-regenerate-actions">
          <button type="button" className="mino-ig-regenerate-cancel" onClick={cancelRegenerate}>{t('card.cancel')}</button>
          <button type="button" className="mino-ig-regenerate-confirm" disabled={isRegenerating || regeneratePrompt.trim().length === 0} onClick={() => { void regenerate() }}>
            {t('card.confirmRegenerate')}
          </button>
        </div>
      </div>
    </div> : null}
  </section>
}

function ratioOf(size: string): string {
  const sizes: Record<string, string> = { '1024x1024': '1:1', '1536x1024': '3:2', '1024x1536': '2:3' }
  return sizes[size] ?? '1:1'
}

/** Copy a Blob to the clipboard as PNG where the platform allows it. */
async function copyImageBlob(blob: Blob): Promise<boolean> {
  try {
    let target = blob
    if (blob.type !== 'image/png' && typeof createImageBitmap === 'function') {
      const bitmap = await createImageBitmap(blob)
      const canvas = document.createElement('canvas')
      canvas.width = bitmap.width
      canvas.height = bitmap.height
      const context = canvas.getContext('2d')
      if (context !== null) {
        context.drawImage(bitmap, 0, 0)
        target = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob(result => result === null ? reject(new Error('png encode failed')) : resolve(result), 'image/png')
        })
      }
      bitmap.close()
    }
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': target })])
    return true
  } catch {
    return false
  }
}

/** Parse one presentation record off a settled Tool block's durable meta. */
function imageResultFromBlock(block: ToolResultNode): ImageResultPresentation | undefined {
  const meta = imageResultFromMeta(block.meta)
  const sourceIds = sourceAttachmentIdsOf(block)
  const fallbackAttachment = block.content.find(item => item.type === 'image' && 'attachment' in item)
  const attachment = meta?.attachment
    ?? (fallbackAttachment?.type === 'image' ? fallbackAttachment.attachment : undefined)
  if (attachment === undefined) return undefined
  const prompt = block.args.value('prompt')
  return {
    attachment,
    prompt: meta?.prompt ?? (typeof prompt === 'string' ? prompt : 'Generated Image'),
    provider: meta?.provider ?? 'mino',
    model: meta?.model ?? '',
    output: meta?.output ?? '',
    ...(meta?.savedTo === undefined ? {} : { savedTo: meta.savedTo }),
    ...(sourceIds === undefined ? {} : { sourceAttachmentIds: sourceIds }),
  }
}

/** Read edit_image's source attachment selectors off the recorded call arguments. */
function sourceAttachmentIdsOf(block: ToolResultNode): readonly string[] | undefined {
  const single = block.args.value('source_attachment_id')
  const list = block.args.value('source_attachment_ids')
  const ids = typeof single === 'string' ? [single]
    : Array.isArray(list) ? list.filter((id): id is string => typeof id === 'string')
      : undefined
  return ids !== undefined && ids.length > 0 ? ids : undefined
}
