/**
 * mino-today 宿主半：自有 JSON 存储 + /mino-today/api/* 路由 + 两个模型工具。
 *
 * - `today_post`：模型把「做完了什么 / 值得留意什么」投到用户的今日页；
 * - `diary_write`：模型往某天的日记里写一条。
 * 页面数据（动态、定时任务、日记）由本插件自己的路由聚合；记忆列表由
 * fish-memory 自己的 /dsh-fish-memory/list 直接提供给客户端，本插件不读它的存储。
 */
import type { Context } from '@deepseek-ai/cordis'
import { addDiaryEntry, addItem, dayKey, deleteDiaryEntry, loadStore, saveStore, type FeedItem, type Suggestion } from './store.ts'

export const name = 'mino-today'
export const inject = ['webServer', 'tools']

/** ctx.webServer 的结构面（dsh-host-webserver 的 register 形态）。 */
interface WebServerFace {
  register(route: { kind: 'exact'; path: string; handler: (req: NodeReq, res: NodeRes) => Promise<void> | void }): () => void
}

interface NodeReq {
  url?: string
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

/** 宿主 schedule 服务（可选）：catalog() 返回浏览器安全的任务条目，edit() 暂停/恢复。 */
interface ScheduleFace {
  catalog(): Promise<ScheduleEntry[]>
  edit(request: { id: string; action: 'update' | 'delete'; patch?: { active?: boolean } }): Promise<unknown>
}

interface ScheduleEntry {
  id: string
  kind: string
  title: string
  status: 'active' | 'paused' | 'ended'
  scheduledAt?: string
  lastDelivery?: { deliveredAt?: string; scheduledAt?: string }
  executionActive?: true
}

const JSON_HEADERS = { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }
const MAX_TITLE = 120
const MAX_BODY = 4000
const MAX_DIARY_TEXT = 4000
const MAX_SOURCE = 40
const MAX_SUGGESTIONS = 4
const MAX_SUGGESTION_LABEL = 40
const MAX_SUGGESTION_PROMPT = 400

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

/** 从工具执行上下文取会话 id（来源字段以宿主为准，取空容忍）。 */
function sessionIdFromExec(exec: unknown): string {
  try {
    const a = (exec as Record<string, unknown> | null)?.agent
      ?? (exec as Record<string, unknown> | null)?.caller
      ?? (exec as Record<string, unknown> | null)?.agentRef
    if (a && typeof a === 'object') {
      const session = (a as Record<string, unknown>).session
      if (session && typeof session === 'object') {
        const sid = (session as Record<string, unknown>).id
        if (typeof sid === 'string' && sid) return sid
      }
      for (const key of ['sessionId', 'id']) {
        const v = (a as Record<string, unknown>)[key]
        if (typeof v === 'string' && v) return v
      }
    }
  } catch { /* 取空容忍 */ }
  return ''
}

function clip(text: string, max: number): string {
  return text.length > max ? text.slice(0, max) : text
}

/** 把模型给的 suggestions 参数钳成 Suggestion[]（超长裁剪，非法条目丢弃）。 */
function clipSuggestions(input: unknown): Suggestion[] | undefined {
  if (!Array.isArray(input)) return undefined
  const out: Suggestion[] = []
  for (const raw of input) {
    if (out.length >= MAX_SUGGESTIONS) break
    if (!raw || typeof raw !== 'object') continue
    const label = String((raw as Record<string, unknown>).label || '').trim()
    const prompt = String((raw as Record<string, unknown>).prompt || '').trim()
    if (!label || !prompt) continue
    out.push({ label: clip(label, MAX_SUGGESTION_LABEL), prompt: clip(prompt, MAX_SUGGESTION_PROMPT) })
  }
  return out.length ? out : undefined
}

const KINDS = new Set(['note', 'result', 'moment'])

function makeTools(ctx: Context): Record<string, unknown>[] {
  return [
    {
      name: 'today_post',
      description:
        '把一条动态投到用户的「今日」页面（侧边栏「今日」图标）。' +
        '什么时候用：完成了一件值得让她看到结果的事（比如做完了报表、搭好了网页）、' +
        '发现了值得她留意的事、或者她让你「记到今日页」。' +
        '日常闲聊不要投。投了就别在回复里再重复一遍。',
      parameters: {
        type: 'object',
        additionalProperties: false,
        required: ['title'],
        properties: {
          title: { type: 'string', description: '一句话标题，说明发生了什么（≤120字）。' },
          body: { type: 'string', description: '可选。展开内容：结果摘要、文件位置、下一步建议。' },
          kind: {
            type: 'string',
            enum: ['note', 'result', 'moment'],
            description: 'note=随手记；result=做完的事交付；moment=值得留意。默认 note。',
          },
          source: {
            type: 'string',
            description: '可选。这条动态来自哪（≤40字的小标签），比如「会话」「定时任务」「日报」。',
          },
          suggestions: {
            type: 'array',
            description: '可选。卡片底部的建议按钮（≤4个）：她点一下就把 prompt 发回来找你。比如「展开说说」→展开讲。',
            items: {
              type: 'object',
              additionalProperties: false,
              required: ['label', 'prompt'],
              properties: {
                label: { type: 'string', description: '按钮文字（≤40字）。' },
                prompt: { type: 'string', description: '点按钮后发给你的话（≤400字）。' },
              },
            },
          },
        },
      },
      output: {
        schema: {
          type: 'object',
          additionalProperties: false,
          properties: { ok: { type: 'boolean' }, message: { type: 'string' }, id: { type: 'string' } },
        },
        render: (_args: unknown, value: unknown) => {
          const ok = (value as { ok?: boolean } | null)?.ok !== false
          return [{ type: 'text', text: ok ? '✓ 已投到今日页' : '✗ ' + String((value as { message?: string } | null)?.message || '没投成') }]
        },
      },
      async execute(args: { title?: string; body?: string; kind?: string; source?: string; suggestions?: unknown }, exec: unknown) {
        const title = String(args?.title || '').trim()
        if (!title) return { ok: false, message: '标题是空的' }
        const store = loadStore()
        const item = addItem(store, {
          kind: KINDS.has(String(args?.kind)) ? args!.kind as FeedItem['kind'] : 'note',
          title: clip(title, MAX_TITLE),
          body: args?.body ? clip(String(args.body).trim(), MAX_BODY) : undefined,
          sessionId: sessionIdFromExec(exec) || undefined,
          source: args?.source ? clip(String(args.source).trim(), MAX_SOURCE) : undefined,
          suggestions: clipSuggestions(args?.suggestions),
        })
        saveStore(store)
        return { ok: true, id: item.id }
      },
    },
    {
      name: 'diary_write',
      description:
        '往用户的日记里写一条（「今日」页的「日记」标签）。' +
        '什么时候用：今天发生了值得留下的事——一起做完的决定、她的状态、重要进展；' +
        '或她让你「记到日记里」。像人写日记一样写，不要写成工作汇报。' +
        '一天写几条就好，别事无巨细。',
      parameters: {
        type: 'object',
        additionalProperties: false,
        required: ['text'],
        properties: {
          text: { type: 'string', description: '日记内容，一两句话。' },
          date: { type: 'string', description: '哪天（YYYY-MM-DD），默认今天。' },
        },
      },
      output: {
        schema: {
          type: 'object',
          additionalProperties: false,
          properties: { ok: { type: 'boolean' }, message: { type: 'string' }, date: { type: 'string' } },
        },
        render: (_args: unknown, value: unknown) => {
          const ok = (value as { ok?: boolean } | null)?.ok !== false
          return [{ type: 'text', text: ok ? '✓ 写进日记了' : '✗ ' + String((value as { message?: string } | null)?.message || '没写成') }]
        },
      },
      async execute(args: { text?: string; date?: string }, exec: unknown) {
        const text = String(args?.text || '').trim()
        if (!text) return { ok: false, message: '内容是空的' }
        const store = loadStore()
        const { date } = addDiaryEntry(store, args?.date, clip(text, MAX_DIARY_TEXT), sessionIdFromExec(exec) || undefined)
        saveStore(store)
        return { ok: true, date }
      },
    },
  ]
}

export function apply(ctx: Context): void {
  const webServer = ctx.get('webServer') as WebServerFace | undefined
  const tools = ctx.get('tools') as ToolsFace | undefined

  const route = (path: string, handler: (req: NodeReq, res: NodeRes) => Promise<void> | void) => {
    if (!webServer) return
    ctx.effect(() =>
      webServer.register({
        kind: 'exact',
        path,
        handler: async (req, res) => {
          try {
            await handler(req, res)
          } catch (error) {
            sendJson(res, 500, { ok: false, error: String(error && (error as Error).message) })
          }
        },
      }),
    )
  }

  route('/mino-today/api/summary', async (_req, res) => {
    const store = loadStore()
    const items = store.items.filter(i => !i.dismissed).slice(-100).reverse()

    let schedules: unknown[] = []
    const schedule = ctx.get('schedule') as ScheduleFace | undefined
    if (schedule) {
      try {
        const entries = await schedule.catalog()
        schedules = entries.map(e => ({
          id: e.id,
          title: e.title,
          kind: e.kind,
          status: e.status,
          nextAt: e.status === 'active' ? e.scheduledAt : undefined,
          running: e.executionActive === true,
          lastDeliveredAt: e.lastDelivery?.deliveredAt,
        }))
      } catch { /* 宿主没有调度面或读失败时按无任务处理 */ }
    }

    const diaryDates = Object.keys(store.diaries).sort().reverse()
    const oldest = [...store.items.map(i => i.at), ...diaryDates].sort()[0]
    sendJson(res, 200, {
      ok: true,
      now: new Date().toISOString(),
      today: dayKey(new Date()),
      items,
      schedules,
      diaries: {
        count: diaryDates.length,
        latest: diaryDates[0] ?? null,
        todayHasDiary: diaryDates.includes(dayKey(new Date())),
      },
      stats: {
        feedCount: store.items.filter(i => !i.dismissed).length,
        diaryDays: diaryDates.length,
        oldestAt: oldest ?? null,
      },
    })
  })

  /** 定时任务的暂停/恢复（Today routines 同款操作）。 */
  route('/mino-today/api/schedule/edit', async (req, res) => {
    const schedule = ctx.get('schedule') as ScheduleFace | undefined
    if (!schedule) return sendJson(res, 503, { ok: false, error: '没有调度服务' })
    const body = await readBody(req)
    const id = String(body.id || '')
    if (!id || typeof body.active !== 'boolean') return sendJson(res, 400, { ok: false, error: '参数不对' })
    const result = await schedule.edit({ id, action: 'update', patch: { active: body.active } })
    sendJson(res, 200, { ok: true, result })
  })

  route('/mino-today/api/item', async (req, res) => {
    const body = await readBody(req)
    const title = String(body.title || '').trim()
    if (!title) return sendJson(res, 400, { ok: false, error: '标题是空的' })
    const store = loadStore()
    const item = addItem(store, {
      kind: KINDS.has(String(body.kind)) ? body.kind as FeedItem['kind'] : 'note',
      title: clip(title, MAX_TITLE),
      body: body.body ? clip(String(body.body).trim(), MAX_BODY) : undefined,
    })
    saveStore(store)
    sendJson(res, 200, { ok: true, item })
  })

  route('/mino-today/api/dismiss', async (req, res) => {
    const body = await readBody(req)
    const id = String(body.id || '')
    const store = loadStore()
    const item = store.items.find(i => i.id === id)
    if (!item) return sendJson(res, 404, { ok: false, error: '没这条' })
    item.dismissed = true
    saveStore(store)
    sendJson(res, 200, { ok: true })
  })

  route('/mino-today/api/item/delete', async (req, res) => {
    const body = await readBody(req)
    const id = String(body.id || '')
    const store = loadStore()
    const before = store.items.length
    store.items = store.items.filter(i => i.id !== id)
    if (store.items.length === before) return sendJson(res, 404, { ok: false, error: '没这条' })
    saveStore(store)
    sendJson(res, 200, { ok: true })
  })

  route('/mino-today/api/diaries', async (_req, res) => {
    const store = loadStore()
    const dates = Object.entries(store.diaries)
      .map(([date, diary]) => ({
        date,
        updatedAt: diary.updatedAt,
        count: diary.entries.length,
        preview: diary.entries[diary.entries.length - 1]?.text.slice(0, 80) ?? '',
      }))
      .sort((a, b) => b.date.localeCompare(a.date))
    sendJson(res, 200, { ok: true, dates })
  })

  route('/mino-today/api/diary', async (req, res) => {
    const method = (req as unknown as { method?: string }).method || 'GET'
    if (method === 'POST') {
      const body = await readBody(req)
      const text = String(body.text || '').trim()
      if (!text) return sendJson(res, 400, { ok: false, error: '内容是空的' })
      const store = loadStore()
      const { date, entry } = addDiaryEntry(store, typeof body.date === 'string' ? body.date : undefined, clip(text, MAX_DIARY_TEXT))
      saveStore(store)
      return sendJson(res, 200, { ok: true, date, entry })
    }
    const url = new URL(req.url || '', 'http://127.0.0.1')
    const date = url.searchParams.get('date') || dayKey(new Date())
    const diary = loadStore().diaries[date]
    sendJson(res, 200, { ok: true, date, entries: diary?.entries ?? [] })
  })

  route('/mino-today/api/diary/delete', async (req, res) => {
    const body = await readBody(req)
    const store = loadStore()
    if (!deleteDiaryEntry(store, String(body.date || ''), String(body.at || ''))) {
      return sendJson(res, 404, { ok: false, error: '没这条' })
    }
    saveStore(store)
    sendJson(res, 200, { ok: true })
  })

  if (tools) {
    for (const tool of makeTools(ctx)) ctx.effect(() => tools.register(tool))
  }
}
