/** OpenAI Images API adapter for the Mino channel (generations + multipart edits). */
import type { ImageMediaType } from '@deepseek-ai/dsh-attachment'
import { guardedFetch, readResponseBody } from './fetch-diagnostics.js'
import { redactSecrets } from './redact.js'
import { detectImageMediaType } from './reference-image.js'

const ERROR_LIMIT = 4096

export interface GeneratedImage {
  data: Uint8Array
  mediaType: ImageMediaType
}

export interface ReferenceImage {
  data: Uint8Array
  mediaType: ImageMediaType
}

/** HTTP failure carrying the response status so callers can drop rejected grants. */
export class HttpStatusError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message)
    this.name = 'HttpStatusError'
  }
}

interface RequestAuth {
  /** Credential sent as Bearer and echoed into `x-dsh-auth-token`. */
  headers: Record<string, string>
  /** Raw token, passed to the secret redactor only. */
  token: string
}

/** POST {baseURL}/images/generations and decode the first image result. */
export async function generateMinoImage(input: {
  auth: RequestAuth
  baseURL: string
  model: string
  prompt: string
  size?: string
  quality?: string
  maxBytes: number
  signal: AbortSignal
}): Promise<GeneratedImage> {
  const response = await guardedFetch('image generation request', input.signal, () => fetch(imageEndpoint(input.baseURL, 'generations'), {
    method: 'POST', redirect: 'error', signal: input.signal,
    headers: { ...input.auth.headers, 'content-type': 'application/json' },
    body: JSON.stringify({
      model: input.model,
      prompt: input.prompt,
      ...(input.size === undefined ? {} : { size: input.size }),
      ...(input.quality === undefined ? {} : { quality: input.quality }),
    }),
  }), input.auth.token)
  return parseImageResponse(response, input)
}

/** POST {baseURL}/images/edits as an OpenAI multipart form with reference uploads. */
export async function editMinoImage(input: {
  auth: RequestAuth
  baseURL: string
  model: string
  prompt: string
  sourceImages: ReferenceImage[]
  size?: string
  quality?: string
  maxBytes: number
  signal: AbortSignal
}): Promise<GeneratedImage> {
  const form = new FormData()
  const imageField = input.sourceImages.length > 1 ? 'image[]' : 'image'
  input.sourceImages.forEach((sourceImage, index) => {
    const blob = new Blob([new Uint8Array(sourceImage.data)], { type: sourceImage.mediaType })
    form.append(imageField, blob, `reference-${index + 1}.${extensionOf(sourceImage.mediaType)}`)
  })
  form.append('prompt', input.prompt)
  form.append('model', input.model)
  if (input.size !== undefined && input.size.length > 0) form.append('size', input.size)
  if (input.quality !== undefined) form.append('quality', input.quality)
  const response = await guardedFetch('image edit request', input.signal, () => fetch(imageEndpoint(input.baseURL, 'edits'), {
    method: 'POST', redirect: 'error', signal: input.signal,
    headers: input.auth.headers,
    body: form,
  }), input.auth.token)
  return parseImageResponse(response, input)
}

async function parseImageResponse(
  response: Response,
  input: { maxBytes: number; signal: AbortSignal; auth: RequestAuth },
): Promise<GeneratedImage> {
  const text = await readBoundedText(response, Math.ceil(input.maxBytes * 1.4) + ERROR_LIMIT)
  if (!response.ok) throw new HttpStatusError(`图像请求失败（HTTP ${response.status}）：${redactSecrets(text, input.auth.token).slice(0, ERROR_LIMIT)}`, response.status)
  let payload: unknown
  try { payload = JSON.parse(text) } catch { throw new Error('图像接口返回了无效的 JSON 响应') }
  const image = firstImage(payload)
  if (image === undefined) throw new Error(`图像接口未返回图片：${redactSecrets(text, input.auth.token).slice(0, ERROR_LIMIT)}`)
  if (image.b64_json !== undefined) {
    const data = decodeBase64(image.b64_json)
    return { data, mediaType: detectImageMediaType(data) ?? imageMediaType(image.mime_type) ?? 'image/png' }
  }
  return downloadImage(image.url, input)
}

function imageEndpoint(baseURL: string, operation: 'generations' | 'edits'): string {
  try { return new URL(`images/${operation}`, baseURL.endsWith('/') ? baseURL : `${baseURL}/`).toString() } catch { throw new Error('图像接口地址必须是绝对 URL') }
}

function firstImage(value: unknown): { b64_json?: string; url?: string; mime_type?: string } | undefined {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return undefined
  const record = value as { data?: unknown; images?: unknown; output?: unknown }
  const data = Array.isArray(record.data) ? record.data : Array.isArray(record.images) ? record.images : Array.isArray(record.output) ? record.output : undefined
  if (data === undefined || data.length === 0) return undefined
  const candidate = data[0]
  if (typeof candidate !== 'object' || candidate === null || Array.isArray(candidate)) return undefined
  const item = candidate as { b64_json?: unknown; url?: unknown; mime_type?: unknown; mime?: unknown }
  const mime = typeof item.mime_type === 'string' ? item.mime_type : typeof item.mime === 'string' ? item.mime : undefined
  // Length checks matter: relays may send `b64_json: ""` alongside the real
  // field, and an empty string would shadow a usable sibling value.
  return typeof item.b64_json === 'string' && item.b64_json.length > 0
    ? { b64_json: item.b64_json, ...(mime === undefined ? {} : { mime_type: mime }) }
    : typeof item.url === 'string' && item.url.length > 0
      ? { url: item.url, ...(mime === undefined ? {} : { mime_type: mime }) }
      : undefined
}

async function downloadImage(
  url: string | undefined,
  input: { maxBytes: number; signal: AbortSignal; auth: RequestAuth },
): Promise<GeneratedImage> {
  if (url === undefined) throw new Error('图像接口未返回图片数据')
  if (url.startsWith('data:')) {
    const parsed = parseDataUrl(url)
    if (parsed === undefined) throw new Error('图像接口返回了无效的 data URL')
    const data = decodeBase64(parsed.base64)
    return { data, mediaType: detectImageMediaType(data) ?? imageMediaType(parsed.mediaType) ?? 'image/png' }
  }
  let response = await guardedFetch('image download', input.signal, () => fetch(url, {
    redirect: 'follow', signal: input.signal,
    headers: { authorization: `Bearer ${input.auth.token}` },
  }), input.auth.token)
  // Some relay CDNs reject downloads carrying an Authorization header even
  // though the URL is public; retrying without it is a safe downgrade.
  if (!response.ok) {
    response = await guardedFetch('image download', input.signal, () => fetch(url, { redirect: 'follow', signal: input.signal }), input.auth.token)
  }
  if (!response.ok) throw new Error(`图像下载失败（HTTP ${response.status}）`)
  const data = await readBoundedBytes(response, input.maxBytes)
  const mediaType = detectImageMediaType(data) ?? imageMediaType(response.headers.get('content-type'))
  if (mediaType === undefined) throw new Error('图像下载返回了不支持的内容类型')
  return { data, mediaType }
}

function parseDataUrl(value: string): { mediaType: string; base64: string } | undefined {
  const match = /^data:([^;,]+);base64,(.*)$/s.exec(value.trim())
  return match?.[1] !== undefined && match[2] !== undefined ? { mediaType: match[1], base64: match[2] } : undefined
}

function extensionOf(mediaType: ImageMediaType): string {
  switch (mediaType) {
    case 'image/jpeg': return 'jpg'
    case 'image/webp': return 'webp'
    case 'image/gif': return 'gif'
    case 'image/png': return 'png'
  }
}

function decodeBase64(value: string): Uint8Array {
  const parsed = parseDataUrl(value)
  const clean = (parsed?.base64 ?? value).replace(/\s+/g, '')
  if (clean.length === 0) throw new Error('图像接口返回了无效的 base64 图片数据')
  const decoded = Buffer.from(clean, 'base64')
  if (decoded.length === 0) throw new Error('图像接口返回了无效的 base64 图片数据')
  return new Uint8Array(decoded)
}

function imageMediaType(value: string | null | undefined): ImageMediaType | undefined {
  const mediaType = value?.split(';', 1)[0]?.trim().toLowerCase()
  return mediaType === 'image/png' || mediaType === 'image/jpeg' || mediaType === 'image/webp' || mediaType === 'image/gif' ? mediaType : undefined
}

async function readBoundedText(response: Response, maxBytes: number): Promise<string> { return new TextDecoder().decode(await readBoundedBytes(response, maxBytes)) }

async function readBoundedBytes(response: Response, maxBytes: number): Promise<Uint8Array> {
  if (response.body === null) return new Uint8Array()
  const reader = response.body.getReader(); const chunks: Uint8Array[] = []; let bytes = 0
  try { for (;;) { const next = await readResponseBody(response, () => reader.read()); if (next.done) break; bytes += next.value.byteLength; if (bytes > maxBytes) throw new Error(`图像响应超过 ${String(maxBytes)} 字节上限`); chunks.push(next.value) } } finally { reader.releaseLock() }
  const joined = new Uint8Array(bytes); let offset = 0
  for (const chunk of chunks) { joined.set(chunk, offset); offset += chunk.byteLength }
  return joined
}
