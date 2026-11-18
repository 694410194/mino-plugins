/** mino-voice-notes 宿主半：vnote_* 模型工具 + 分段上传/分享路由 + speechToText 转写 + 服务缝。
 *
 * 解耦边界（全官方缝，零他插件私域）：
 * - 录音段：自有 client 半经 MediaRecorder/AudioWorklet 采 PCM16 WAV → POST /mino-voice-notes/api/segment
 * - 转写：ctx.speechToText（resolve→transcribe 官方缝；sensevoice provider 由 voice-input bundle 内置）
 * - 纪要：模型读 vnote_get 的转写文 → vnote_update 写回 summary → 可 today_post 投 feed（软依赖，不耦合）
 * - 分享：/mino-voice-notes/s/<shareId> 只读页（web 档鉴权域内，本地链接）
 * - 服务缝：ctx.provide('mino-voice-notes') 暴露 start/stop/getStatus 给 meeting-detect 等消费方
 */
import type { Context } from '@deepseek-ai/cordis'
import {
  appendSegment, deleteNote, getNote, loadNotes, newId, putNote, readSegment,
  type VNote,
} from './store.ts'

export const name = 'mino-voice-notes'
export const inject = ['webServer', 'tools']

const JSON_HEADERS = { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }
const MAX_TITLE = 120
const MAX_SEGMENTS = 400
const MAX_SEGMENT_BYTES = 24 * 1024 * 1024
const TRANSCRIBE_TIMEOUT_MS = 120_000

interface WebServerFace {
  register(route: {
    kind: 'exact' | 'prefix'
    path: string
    handler: (req: NodeReq, res: NodeRes) => Promise<void> | void
  }): () => void
}
interface NodeReq {
  url?: string
  method?: string
  on(event: 'data' | 'end', cb: (chunk?: unknown) => void): void
  [Symbol.asyncIterator]?: () => AsyncIterableIterator<unknown>
}
interface NodeRes {
  writeHead(status: number, headers?: Record<string, string>): void
  end(body?: string): void
}
interface ToolsFace {
  register(tool: Record<string, unknown>, options?: Record<string, unknown>): () => void
}

/** ctx.speechToText 官方缝的结构面（experimental/speech-to-text 的 resolve/transcribe 契约）。 */
interface SpeechToTextFace {
  resolve(request: { audio: Uint8Array; providerId?: string; language?: string }): { provider: unknown; audio: Uint8Array; language: string }
  transcribe(spec: { provider: unknown; audio: Uint8Array; language: string }, signal: AbortSignal): Promise<{ text: string; audioSeconds: number; inferenceSeconds: number }>
}

/** 提供给其他插件消费的服务缝（meeting-detect 预约/触发录音走这里，不走工具名）。 */
interface VoiceNotesService {
  start(title?: string): VNote
  stop(id: string): VNote | undefined
  status(id: string): VNote | undefined
}

function sendJson(res: NodeRes, status: number, body: unknown): void {
  res.writeHead(status, JSON_HEADERS)
  res.end(JSON.stringify(body))
}
async function readBody(req: NodeReq): Promise<Record<string, unknown>> {
  let raw = ''
  for await (const chunk of req as AsyncIterable<unknown>) raw += String(chunk)
  if (!raw) return {}
  try {
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed as Record<string, unknown> : {}
  } catch {
    return {}
  }
}
const clip = (s: unknown, max: number): string | undefined => {
  if (s === undefined || s === null) return undefined
  const v = String(s).slice(0, max)
  return v || undefined
}
const esc = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

function notePublic(n: VNote) {
  return {
    id: n.id, title: n.title, status: n.status,
    createdAt: n.createdAt, stoppedAt: n.stoppedAt,
    segments: n.segments.length, transcript: n.transcript,
    summary: n.summary, shareId: n.shareId, error: n.error,
    audioSeconds: n.audioSeconds,
  }
}

function startNote(title?: string): VNote {
  const now = new Date().toISOString()
  const note: VNote = {
    id: newId(),
    title: (title || `录音 ${now.slice(0, 16).replace('T', ' ')}`).slice(0, MAX_TITLE),
    status: 'recording',
    createdAt: now,
    updatedAt: now,
    segments: [],
  }
  putNote(note)
  return note
}

async function transcribeNote(ctx: Context, note: VNote): Promise<VNote> {
  const stt = ctx.get('speechToText') as SpeechToTextFace | undefined
  if (!stt?.transcribe) {
    note.status = 'failed'
    note.error = '没有可用的语音转写服务（装 voice-input bundle / 配 ASR provider）'
    note.updatedAt = new Date().toISOString()
    putNote(note)
    return note
  }
  const segments = [...note.segments].sort((a, b) => a.seq - b.seq)
  if (!segments.length) {
    note.status = 'failed'
    note.error = '没有音频分段'
    note.updatedAt = new Date().toISOString()
    putNote(note)
    return note
  }
  const texts: string[] = []
  let audioSeconds = 0
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(new Error('transcribe timeout')), TRANSCRIBE_TIMEOUT_MS)
  try {
    for (const seg of segments) {
      const wav = readSegment(note.id, seg.seq)
      if (!wav) continue
      const spec = stt.resolve({ audio: new Uint8Array(wav) })
      const out = await stt.transcribe(spec, controller.signal)
      if (out.text?.trim()) texts.push(out.text.trim())
      audioSeconds += out.audioSeconds || 0
    }
    note.transcript = texts.join('\n')
    note.audioSeconds = audioSeconds || undefined
    note.status = 'ready'
    note.error = undefined
  } catch (error) {
    note.status = 'failed'
    note.error = `转写失败：${String((error as Error)?.message ?? error)}`
  } finally {
    clearTimeout(timer)
    note.updatedAt = new Date().toISOString()
    putNote(note)
  }
  return note
}

function stopAndTranscribe(ctx: Context, id: string): VNote | 'not_found' | 'bad_state' {
  const note = getNote(id)
  if (!note) return 'not_found'
  if (note.status !== 'recording') return 'bad_state'
  note.status = 'transcribing'
  note.stoppedAt = new Date().toISOString()
  note.updatedAt = note.stoppedAt
  putNote(note)
  // 转写走后台：长音频不阻塞工具/路由调用方；调用方轮询 vnote_get/api/note。
  void transcribeNote(ctx, note).catch(() => { /* transcribeNote 内部已落 failed 状态 */ })
  return note
}

const PARAM_ID = { type: 'object', additionalProperties: false, required: ['id'], properties: { id: { type: 'string', description: '笔记 id（vn_ 开头）。' } } }
const OUT_NOTE = {
  type: 'object', additionalProperties: false,
  properties: {
    id: { type: 'string' }, title: { type: 'string' }, status: { type: 'string' },
    transcript: { type: 'string' }, summary: { type: 'string' }, error: { type: 'string' },
  },
}

function makeTools(ctx: Context): Record<string, unknown>[] {
  return [
    {
      name: 'vnote_start',
      description:
        '开始一段语音笔记录音。返回笔记 id——客户端的「语音笔记」面板会用这个 id 上传音频分段；' +
        '录完用 vnote_stop 收尾并转写。',
      parameters: {
        type: 'object', additionalProperties: false,
        properties: { title: { type: 'string', description: '可选。给这段录音起个名（≤120字）。' } },
      },
      output: { schema: OUT_NOTE, render: (_a: unknown, v: { id?: string }) => [{ type: 'text', text: `开始录音 ${v?.id ?? ''}` }] },
      isConcurrencySafe: () => false,
      async execute(args: { title?: string }) {
        const note = startNote(args.title)
        return { id: note.id, title: note.title, status: note.status }
      },
      presentCall: (a: { title?: string }) => ({ card: 'generic', title: a?.title ? `开始录音：${a.title}` : '开始录音', kind: 'other', rawInput: a }),
    },
    {
      name: 'vnote_stop',
      description:
        '结束一段录音并触发本机转写。转写在后台跑——长录音别干等，过几秒用 vnote_get 取结果。',
      parameters: PARAM_ID,
      output: { schema: OUT_NOTE, render: (_a: unknown, v: { status?: string }) => [{ type: 'text', text: `收尾：${v?.status ?? ''}` }] },
      isConcurrencySafe: () => false,
      async execute(args: { id: string }) {
        const r = stopAndTranscribe(ctx, String(args.id || ''))
        if (r === 'not_found') throw new Error(`找不到笔记 ${args.id}`)
        if (r === 'bad_state') throw new Error('这段录音不在录制中（可能已收尾）')
        return { id: r.id, title: r.title, status: r.status }
      },
      presentCall: () => ({ card: 'generic', title: '结束录音', kind: 'other' }),
    },
    {
      name: 'vnote_list',
      description: '列出最近的语音笔记（id/标题/状态/时长），不含转写全文——要全文用 vnote_get。',
      parameters: {
        type: 'object', additionalProperties: false,
        properties: { limit: { type: 'integer', description: '最近多少条（默认 20）' } },
      },
      output: {
        schema: { type: 'object', additionalProperties: false, properties: { count: { type: 'integer' }, notes: { type: 'array', items: { type: 'object', additionalProperties: true } } } },
        render: (_a: unknown, v: { count?: number }) => [{ type: 'text', text: `${v?.count ?? 0} 条语音笔记` }],
      },
      isConcurrencySafe: () => true,
      async execute(args: { limit?: number }) {
        const limit = Math.min(Math.max(Number(args.limit) || 20, 1), 100)
        const notes = Object.values(loadNotes())
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
          .slice(0, limit)
          .map(notePublic)
        return { count: notes.length, notes }
      },
      presentCall: () => ({ card: 'generic', title: '看语音笔记', kind: 'other' }),
    },
    {
      name: 'vnote_get',
      description: '取一条语音笔记的完整信息：转写全文、纪要、状态。转写文可能很长。',
      parameters: PARAM_ID,
      output: { schema: OUT_NOTE, render: (_a: unknown, v: { status?: string }) => [{ type: 'text', text: `笔记 ${v?.status ?? ''}` }] },
      isConcurrencySafe: () => true,
      async execute(args: { id: string }) {
        const note = getNote(String(args.id || ''))
        if (!note) throw new Error(`找不到笔记 ${args.id}`)
        return notePublic(note)
      },
      presentCall: () => ({ card: 'generic', title: '读语音笔记', kind: 'other' }),
    },
    {
      name: 'vnote_update',
      description:
        '改一条语音笔记的标题或纪要。转写完之后，把读出来的要点写成 summary 存回去。',
      parameters: {
        type: 'object', additionalProperties: false, required: ['id'],
        properties: {
          id: { type: 'string', description: '笔记 id。' },
          title: { type: 'string', description: '可选。新标题（≤120字）。' },
          summary: { type: 'string', description: '可选。纪要文字（≤4000字）。' },
        },
      },
      output: { schema: OUT_NOTE, render: () => [{ type: 'text', text: '已更新' }] },
      isConcurrencySafe: () => false,
      async execute(args: { id: string; title?: string; summary?: string }) {
        const note = getNote(String(args.id || ''))
        if (!note) throw new Error(`找不到笔记 ${args.id}`)
        const title = clip(args.title, MAX_TITLE)
        const summary = clip(args.summary, 4000)
        if (title !== undefined) note.title = title
        if (summary !== undefined) note.summary = summary
        note.updatedAt = new Date().toISOString()
        putNote(note)
        return { id: note.id, title: note.title, status: note.status }
      },
      presentCall: () => ({ card: 'generic', title: '改语音笔记', kind: 'other' }),
    },
    {
      name: 'vnote_share',
      description: '给一条已完成的语音笔记生成本地只读分享页（转写+纪要+音频分段），返回页面路径。',
      parameters: PARAM_ID,
      output: {
        schema: { type: 'object', additionalProperties: false, properties: { shareId: { type: 'string' }, path: { type: 'string' } } },
        render: (_a: unknown, v: { path?: string }) => [{ type: 'text', text: `分享页 ${v?.path ?? ''}` }],
      },
      isConcurrencySafe: () => false,
      async execute(args: { id: string }) {
        const note = getNote(String(args.id || ''))
        if (!note) throw new Error(`找不到笔记 ${args.id}`)
        if (!note.shareId) {
          note.shareId = Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
          note.updatedAt = new Date().toISOString()
          putNote(note)
        }
        return { shareId: note.shareId, path: `/mino-voice-notes/s/${note.shareId}` }
      },
      presentCall: () => ({ card: 'generic', title: '分享语音笔记', kind: 'other' }),
    },
  ]
}

function sharePage(note: VNote): string {
  const segs = note.segments.map(s =>
    `<li><a href="/mino-voice-notes/api/audio?id=${encodeURIComponent(note.id)}&seq=${s.seq}">分段 ${s.seq}</a>（${(s.bytes / 1024).toFixed(0)} KB）</li>`).join('')
  return `<!doctype html><html lang="zh"><head><meta charset="utf-8"><title>${esc(note.title)}</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>body{font-family:system-ui,sans-serif;max-width:720px;margin:32px auto;padding:0 16px;color:#222}
h1{font-size:20px}h2{font-size:15px;margin-top:28px;color:#555}
pre{white-space:pre-wrap;background:#f6f6f6;padding:14px;border-radius:8px;font-size:14px;line-height:1.7}
ul{padding-left:20px}.muted{color:#888;font-size:12px}</style></head><body>
<h1>${esc(note.title)}</h1><div class="muted">${esc(note.createdAt)} · ${note.audioSeconds ? note.audioSeconds.toFixed(1) + 's' : ''}</div>
${note.summary ? `<h2>纪要</h2><pre>${esc(note.summary)}</pre>` : ''}
<h2>转写</h2><pre>${esc(note.transcript || '（无）')}</pre>
<h2>音频</h2><ul>${segs || '<li>无分段</li>'}</ul>
</body></html>`
}

export function apply(ctx: Context): void {
  const webServer = ctx.get('webServer') as WebServerFace | undefined
  const tools = ctx.get('tools') as ToolsFace | undefined

  // 服务缝：其他插件（meeting-detect 等）经 ctx.get('mino-voice-notes') 消费，不走工具名。
  // 与 task-board 同款守卫：宿主没有 provide 面时安静缺席。
  if (typeof (ctx as { provide?: unknown }).provide === 'function') {
    ;(ctx as Context & { provide: (name: string, svc: VoiceNotesService) => void }).provide('mino-voice-notes', {
      start: (title?: string) => startNote(title),
      stop: (id: string) => { const r = stopAndTranscribe(ctx, id); return typeof r === 'object' ? r : undefined },
      status: (id: string) => getNote(id),
    })
  }

  const route = (kind: 'exact' | 'prefix', path: string, handler: (req: NodeReq, res: NodeRes) => Promise<void> | void) => {
    if (!webServer) return
    ctx.effect(() =>
      webServer.register({
        kind, path,
        handler: async (req, res) => {
          try { await handler(req, res) } catch (error) {
            sendJson(res, 500, { ok: false, error: String((error as Error)?.message ?? error) })
          }
        },
      }),
    )
  }

  route('exact', '/mino-voice-notes/api/start', async (req, res) => {
    const body = await readBody(req)
    const note = startNote(clip(body.title, MAX_TITLE))
    sendJson(res, 200, { ok: true, id: note.id, title: note.title })
  })

  route('exact', '/mino-voice-notes/api/segment', async (req, res) => {
    const body = await readBody(req)
    const id = String(body.id || '')
    const seq = Number(body.seq)
    const note = getNote(id)
    if (!note) return sendJson(res, 404, { ok: false, error: '找不到笔记' })
    if (note.status !== 'recording') return sendJson(res, 409, { ok: false, error: '不在录制中' })
    if (!Number.isInteger(seq) || seq < 0 || seq >= MAX_SEGMENTS) return sendJson(res, 400, { ok: false, error: 'seq 不对' })
    if (typeof body.audio !== 'string' || !body.audio) return sendJson(res, 400, { ok: false, error: 'audio 为空' })
    const wav = Buffer.from(body.audio, 'base64')
    if (!wav.length || wav.length > MAX_SEGMENT_BYTES) return sendJson(res, 400, { ok: false, error: 'audio 大小不对' })
    if (wav.length > 12 && wav.toString('ascii', 0, 4) !== 'RIFF') return sendJson(res, 400, { ok: false, error: 'audio 不是 WAV' })
    const seg = appendSegment(id, seq, wav, Number.isFinite(+body.durationMs!) ? +body.durationMs! : undefined)
    const fresh = getNote(id)!
    if (!fresh.segments.some(s => s.seq === seq)) fresh.segments.push(seg)
    else fresh.segments = fresh.segments.map(s => (s.seq === seq ? seg : s))
    fresh.updatedAt = new Date().toISOString()
    putNote(fresh)
    sendJson(res, 200, { ok: true, seq, bytes: seg.bytes })
  })

  route('exact', '/mino-voice-notes/api/stop', async (req, res) => {
    const body = await readBody(req)
    const r = stopAndTranscribe(ctx, String(body.id || ''))
    if (r === 'not_found') return sendJson(res, 404, { ok: false, error: '找不到笔记' })
    if (r === 'bad_state') return sendJson(res, 409, { ok: false, error: '不在录制中' })
    sendJson(res, 200, { ok: true, id: r.id, status: r.status })
  })

  route('exact', '/mino-voice-notes/api/list', async (_req, res) => {
    const notes = Object.values(loadNotes())
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 100)
      .map(notePublic)
    sendJson(res, 200, { ok: true, notes })
  })

  route('exact', '/mino-voice-notes/api/note', async (req, res) => {
    const url = new URL(req.url || '', 'http://localhost')
    const note = getNote(url.searchParams.get('id') || '')
    if (!note) return sendJson(res, 404, { ok: false, error: '找不到笔记' })
    sendJson(res, 200, { ok: true, note: notePublic(note) })
  })

  route('exact', '/mino-voice-notes/api/update', async (req, res) => {
    const body = await readBody(req)
    const note = getNote(String(body.id || ''))
    if (!note) return sendJson(res, 404, { ok: false, error: '找不到笔记' })
    const title = clip(body.title, MAX_TITLE)
    const summary = clip(body.summary, 4000)
    if (title !== undefined) note.title = title
    if (summary !== undefined) note.summary = summary
    note.updatedAt = new Date().toISOString()
    putNote(note)
    sendJson(res, 200, { ok: true })
  })

  route('exact', '/mino-voice-notes/api/share', async (req, res) => {
    const body = await readBody(req)
    const note = getNote(String(body.id || ''))
    if (!note) return sendJson(res, 404, { ok: false, error: '找不到笔记' })
    if (!note.shareId) {
      note.shareId = Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
      note.updatedAt = new Date().toISOString()
      putNote(note)
    }
    sendJson(res, 200, { ok: true, shareId: note.shareId, path: `/mino-voice-notes/s/${note.shareId}` })
  })

  route('exact', '/mino-voice-notes/api/delete', async (req, res) => {
    const body = await readBody(req)
    if (!deleteNote(String(body.id || ''))) return sendJson(res, 404, { ok: false, error: '找不到笔记' })
    sendJson(res, 200, { ok: true })
  })

  route('exact', '/mino-voice-notes/api/audio', async (req, res) => {
    const url = new URL(req.url || '', 'http://localhost')
    const note = getNote(url.searchParams.get('id') || '')
    const seq = Number(url.searchParams.get('seq'))
    if (!note || !Number.isInteger(seq)) return sendJson(res, 404, { ok: false, error: '找不到' })
    const wav = readSegment(note.id, seq)
    if (!wav) return sendJson(res, 404, { ok: false, error: '找不到分段' })
    res.writeHead(200, { 'content-type': 'audio/wav', 'content-length': String(wav.length), 'cache-control': 'no-store' })
    res.end(wav.toString('binary'))
  })

  route('prefix', '/mino-voice-notes/s', async (req, res) => {
    const shareId = (req.url || '').split('/mino-voice-notes/s/')[1]?.split(/[?#]/)[0] || ''
    const note = Object.values(loadNotes()).find(n => n.shareId === shareId)
    if (!note) {
      res.writeHead(404, { 'content-type': 'text/html; charset=utf-8' })
      return res.end('<!doctype html><meta charset="utf-8"><p>分享不存在或已删除。</p>')
    }
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' })
    res.end(sharePage(note))
  })

  if (tools) {
    for (const tool of makeTools(ctx)) ctx.effect(() => tools.register(tool))
  }
}
