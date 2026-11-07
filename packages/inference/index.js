/**
 * mino-inference — Mino 推理服务层。
 *
 * 职责：媒体生成类插件与网关之间唯一的耦合点。端点、账号凭据、请求语义、
 * 异步任务轮询全部收敛在此，消费插件通过 `ctx.get('minoInference')` 能力
 * 化调用，代码里零 URL、零凭据。
 */
import { setTimeout as delay } from 'node:timers/promises'
import z from '@deepseek-ai/schemastery'

/** Default inference origin; the account service scope-checks tokens per origin. */
export const DEFAULT_INFERENCE_BASE_URL = 'https://api.mino.baby/v1'
const ERROR_LIMIT = 4096

function volatile(schema) {
  const mark = schema.volatile
  return typeof mark === 'function' ? mark.call(schema) : schema
}

/** Cordis configuration schema — the only deploy-varying knob in this layer. */
export const Config = z.object({
  /** OpenAI-compatible gateway root; override only for staging/self-hosted. */
  baseURL: volatile(z.string().default(DEFAULT_INFERENCE_BASE_URL)),
}) .description('Mino 推理服务')

export const name = 'mino-inference'
export const inject = []

/** HTTP failure carrying status so consumers can drop rejected grants on 401. */
export class HttpStatusError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'HttpStatusError'
    this.status = status
  }
}

/**
 * Unwrap per-field volatile boxes (settings edits land without restart)
 * into a plain snapshot object.
 */
function readConfig(config) {
  const out = {}
  for (const [key, value] of Object.entries(config ?? {})) {
    out[key] = value !== null && typeof value === 'object' && typeof value.get === 'function' ? value.get() : value
  }
  return out
}

export function apply(ctx, config = {}) {
  const current = () => readConfig(config)
  const baseURL = () => {
    const raw = current().baseURL?.trim() ?? ''
    return (raw || DEFAULT_INFERENCE_BASE_URL).replace(/\/+$/, '')
  }
  // Duck-typed seam: verify the account members this layer calls, so a stale
  // host build names the missing method instead of throwing a bare TypeError.
  const account = () => {
    const svc = ctx.get('deepseekAccount')
    if (svc !== undefined && (typeof svc.resolveToken !== 'function' || typeof svc.rejectToken !== 'function')) {
      throw new Error('deepseekAccount 服务契约不匹配：需要 resolveToken/rejectToken（宿主版本过旧）。')
    }
    return svc
  }

  /** Strip the grant token out of any server-returned text before surfacing. */
  const redact = (text, token) => (token ? text.split(token).join('[redacted]') : text)

  async function resolveAuth() {
    const token = await account()?.resolveToken(baseURL())
    if (typeof token !== 'string' || token.length === 0) {
      throw new Error('当前未登录 Mino 账号或账号凭证不可用：请先在 设置 > 账户 登录后再试。')
    }
    return {
      token,
      headers: {
        'x-dsh-auth-token': token,
        authorization: `Bearer ${token}`,
      },
    }
  }

  async function rejectToken(token) {
    await account()?.rejectToken(token)
  }

  /**
   * Join a path onto the gateway. Bare paths resolve under baseURL (…/v1);
   * a leading-slash path resolves on the origin root (for routes mounted
   * outside /v1, e.g. /suno/*).
   */
  function endpoint(path) {
    const base = baseURL()
    const joined = path.startsWith('/')
      ? `${new URL(base).origin}${path}`
      : `${base}/${path}`
    try {
      return new URL(joined).toString()
    } catch {
      throw new Error('推理端点必须是绝对 URL：请检查 mino-inference 的 baseURL 配置')
    }
  }

  /** Read a response body into bytes, capped; excess is discarded not padded. */
  async function readBytes(response, maxBytes) {
    const reader = response.body?.getReader?.()
    if (!reader) return new Uint8Array()
    const chunks = []
    let filled = 0
    try {
      for (;;) {
        const next = await reader.read()
        if (next.done) break
        if (filled + next.value.byteLength > maxBytes) break
        filled += next.value.byteLength
        chunks.push(next.value)
      }
    } finally {
      reader.releaseLock()
    }
    const joined = new Uint8Array(filled)
    let offset = 0
    for (const chunk of chunks) { joined.set(chunk, offset); offset += chunk.byteLength }
    return joined
  }

  /** Read a response body with a byte cap and return it as text. */
  async function readText(response, maxBytes = ERROR_LIMIT) {
    return new TextDecoder().decode(await readBytes(response, maxBytes))
  }

  /**
   * POST to the gateway with account auth, then throw a typed error on
   * non-2xx. Returns the raw Response so the consumer decides how to parse
   * (JSON tool response vs binary media body).
   * @param {string} path API-relative path, e.g. 'video/generations'
   * @param {object} options
   * @param {unknown} [options.body] JSON-serializable payload
   * @param {FormData} [options.form] multipart body (mutually exclusive w/ body)
   * @param {AbortSignal} [options.signal]
   * @param {number} [options.errorLimit] server error text cap
   */
  async function post(path, options = {}) {
    const auth = await resolveAuth()
    const headers = { ...auth.headers }
    let body
    if (options.form !== undefined) {
      body = options.form
    } else if (options.body !== undefined) {
      headers['content-type'] = 'application/json'
      body = JSON.stringify(options.body)
    }
    let response
    try {
      response = await fetch(endpoint(path), {
        method: 'POST',
        redirect: 'error',
        signal: options.signal,
        headers,
        body,
      })
    } catch (error) {
      if (options.signal?.aborted) throw options.signal.reason ?? error
      throw new Error(`推理请求无法送达（${error instanceof Error ? error.message : String(error)}）`)
    }
    if (!response.ok) {
      // A rejected grant is dropped inside the service so the next call
      // re-resolves and surfaces the sign-in flow — consumers never see tokens.
      if (response.status === 401) await rejectToken(auth.token)
      const text = redact(await readText(response, options.errorLimit ?? ERROR_LIMIT), auth.token)
      throw new HttpStatusError(`推理请求失败（HTTP ${response.status}）：${text.slice(0, ERROR_LIMIT)}`, response.status)
    }
    return response
  }

  /** POST and parse a JSON object body. */
  async function postJson(path, options = {}) {
    const response = await post(path, options)
    const text = await readText(response, 4 * 1024 * 1024)
    try {
      return JSON.parse(text)
    } catch {
      throw new Error(`推理接口返回了无效的 JSON：${text.slice(0, 256)}`)
    }
  }

  /** GET with auth (task query endpoints). */
  async function getJson(path, options = {}) {
    const auth = await resolveAuth()
    let response
    try {
      response = await fetch(endpoint(path), {
        method: 'GET',
        redirect: 'error',
        signal: options.signal,
        headers: auth.headers,
      })
    } catch (error) {
      if (options.signal?.aborted) throw options.signal.reason ?? error
      throw new Error(`推理查询无法送达（${error instanceof Error ? error.message : String(error)}）`)
    }
    const text = await readText(response, 4 * 1024 * 1024)
    if (!response.ok) {
      if (response.status === 401) await rejectToken(auth.token)
      throw new HttpStatusError(`推理查询失败（HTTP ${response.status}）：${redact(text, auth.token).slice(0, ERROR_LIMIT)}`, response.status)
    }
    try {
      return JSON.parse(text)
    } catch {
      throw new Error(`推理接口返回了无效的 JSON：${text.slice(0, 256)}`)
    }
  }

  /**
   * Download a media artifact (absolute URL) with a byte cap. Same-origin
   * artifacts try the account grant first — gated /content endpoints on the
   * gateway need it — and retry without credentials on rejection, matching
   * the relay-CDN downgrade dsh-image-gen already relies on.
   */
  async function download(url, options = {}) {
    const maxBytes = options.maxBytes ?? 512 * 1024 * 1024
    const sameOrigin = (() => { try { return new URL(url).origin === new URL(baseURL()).origin } catch { return false } })()
    const tryFetch = async (headers) => {
      try {
        return await fetch(url, { redirect: 'follow', signal: options.signal, headers })
      } catch (error) {
        if (options.signal?.aborted) throw options.signal.reason ?? error
        throw new Error(`媒体文件下载失败（${error instanceof Error ? error.message : String(error)}）`)
      }
    }
    let response
    if (sameOrigin) {
      const auth = await resolveAuth()
      response = await tryFetch(auth.headers)
      if (!response.ok) response = await tryFetch({})
    } else {
      response = await tryFetch({})
    }
    if (!response.ok) throw new Error(`媒体文件下载失败（HTTP ${response.status}）`)
    const reader = response.body?.getReader?.()
    if (!reader) throw new Error('媒体文件下载返回了空响应')
    const chunks = []
    let bytes = 0
    try {
      for (;;) {
        const next = await reader.read()
        if (next.done) break
        bytes += next.value.byteLength
        if (bytes > maxBytes) throw new Error(`媒体文件超过 ${maxBytes} 字节上限`)
        chunks.push(next.value)
      }
    } finally {
      reader.releaseLock()
    }
    const joined = new Uint8Array(bytes)
    let offset = 0
    for (const chunk of chunks) { joined.set(chunk, offset); offset += chunk.byteLength }
    return { data: joined, mediaType: response.headers.get('content-type') ?? undefined }
  }

  /**
   * Poll a task endpoint until `isDone(payload)` or deadline.
   * @param {string} path API-relative task query path
   * @param {object} options
   * @param {(payload: object) => boolean | 'fail'} options.isDone done/fail judge;
   *   returning 'fail' throws with the payload's error field
   * @param {number} [options.intervalMs] poll interval (default 3000)
   * @param {number} [options.timeoutMs] deadline (default 600_000)
   * @param {AbortSignal} [options.signal]
   * @returns {Promise<object>} final task payload
   */
  async function poll(path, options) {
    if (typeof options?.isDone !== 'function') throw new TypeError('poll requires an isDone(payload) judge')
    const intervalMs = options.intervalMs ?? 3000
    const deadline = Date.now() + (options.timeoutMs ?? 600_000)
    for (;;) {
      const payload = await getJson(path, { signal: options.signal })
      const verdict = options.isDone(payload)
      if (verdict === 'fail') {
        const detail = payload?.error ?? payload?.fail_reason ?? payload?.message ?? '上游任务失败'
        throw new Error(`媒体任务失败：${typeof detail === 'string' ? detail : JSON.stringify(detail)}`)
      }
      if (verdict) return payload
      if (Date.now() >= deadline) throw new Error('媒体任务等待超时：请稍后重试或缩小生成规模')
      await delay(intervalMs, undefined, { signal: options.signal })
    }
  }

  // Official service seam: providing on this fiber scopes the service lifetime
  // to this plugin — unload and the capability disappears atomically.
  ctx.provide('minoInference', {
    get baseURL() { return baseURL() },
    endpoint,
    resolveAuth,
    rejectToken,
    post,
    postJson,
    getJson,
    /** Bounded body read for binary tool responses (TTS audio, etc). */
    readBytes: (response, maxBytes = 256 * 1024 * 1024) => readBytes(response, maxBytes),
    download,
    poll,
  })
}
