/** mino-today 客户端的 API 面：本插件路由 + fish-memory 自己的 /list。 */

export interface Suggestion {
  label: string
  prompt: string
}

/** 结构化卡体（自有 schema 枚举）。 */
export type FeedCard =
  | { type: 'list'; items: string[] }
  | { type: 'metric'; value: string; unit?: string; delta?: string }
  | { type: 'progress'; done: number; total: number; label?: string }

export interface FeedItem {
  id: string
  kind: 'note' | 'result' | 'moment'
  title: string
  body?: string
  at: string
  sessionId?: string
  source?: string
  suggestions?: Suggestion[]
  /** 生成方给的批次标签；同批卡片并成一组显示。 */
  batchId?: string
  pinned?: boolean
  feedback?: 'up' | 'down' | 'not_interested'
  /** 结构化卡体；缺省就是普通文字卡。 */
  card?: FeedCard
  /** 已读时间；缺省=未读。 */
  read?: string
}

export interface ScheduleCard {
  id: string
  title: string
  kind: string
  status: 'active' | 'paused' | 'ended'
  nextAt?: string
  running?: boolean
  lastDeliveredAt?: string
}

export interface Summary {
  ok: boolean
  now: string
  today: string
  items: FeedItem[]
  schedules: ScheduleCard[]
  diaries: { count: number; latest: string | null; todayHasDiary: boolean }
  stats?: { feedCount: number; diaryDays: number; oldestAt: string | null }
}

export interface DiaryListRow {
  date: string
  updatedAt: string
  count: number
  preview: string
}

export interface DiaryEntry {
  at: string
  text: string
  sessionId?: string
}

export interface Watch {
  id: string
  topic: string
  prompt?: string
  scheduleId?: string | null
  enabled: boolean
  at: string
}

export interface MemoryRow {
  id: string
  text: string
  at?: string
  importance?: number
  category?: string
  activation: number | null
  freshKind: 'fact' | 'dated' | 'recorded' | 'unknown'
  sessionTitle: string
}

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) throw new Error(`${res.status}`)
  return await res.json() as T
}

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`${res.status}`)
  return await res.json() as T
}

export const api = {
  summary: () => getJson<Summary>('/mino-today/api/summary'),
  postItem: (title: string, kind: FeedItem['kind'] = 'note') => postJson<{ ok: boolean }>('/mino-today/api/item', { title, kind }),
  dismiss: (id: string) => postJson<{ ok: boolean }>('/mino-today/api/dismiss', { id }),
  /** 真删一条动态（dismiss 只是划出视野）。 */
  deleteItem: (id: string) => postJson<{ ok: boolean }>('/mino-today/api/item/delete', { id }),
  /** 卡片反馈：up/down 留信号；not_interested 顺带划掉。 */
  feedback: (id: string, signal: 'up' | 'down' | 'not_interested') =>
    postJson<{ ok: boolean }>('/mino-today/api/item/feedback', { id, signal }),
  /** 「调整卡片」自由文本：生成方按 source 取回并折进下次产出。 */
  adjust: (id: string, note: string) => postJson<{ ok: boolean }>('/mino-today/api/item/adjust', { id, note }),
  /** 置顶开关。 */
  setPin: (id: string, pinned: boolean) => postJson<{ ok: boolean; pinned: boolean }>('/mino-today/api/item/pin', { id, pinned }),
  /** 标已读：单条或全部。 */
  markRead: (id?: string) => postJson<{ ok: boolean }>('/mino-today/api/item/read', id ? { id } : { all: true }),
  /** 定时任务暂停/恢复（id + 目标状态）。 */
  setScheduleActive: (id: string, active: boolean) => postJson<{ ok: boolean }>('/mino-today/api/schedule/edit', { id, active }),
  diaries: () => getJson<{ ok: boolean; dates: DiaryListRow[] }>('/mino-today/api/diaries'),
  diary: (date: string) => getJson<{ ok: boolean; date: string; entries: DiaryEntry[] }>(`/mino-today/api/diary?date=${encodeURIComponent(date)}`),
  addDiary: (text: string, date?: string) => postJson<{ ok: boolean; date: string }>('/mino-today/api/diary', { text, date }),
  deleteDiaryEntry: (date: string, at: string) => postJson<{ ok: boolean }>('/mino-today/api/diary/delete', { date, at }),
  /** 追踪中的主题（live widget 对应物）。 */
  watches: () => getJson<{ ok: boolean; watches: Watch[] }>('/mino-today/api/watches'),
  /** fish-memory 自己的路由；插件不在 → fetch 抛错，由调用方转「未安装」态。 */
  memoryList: () => getJson<{
    ok: boolean
    sessions: { id: string; title?: string; memories: Omit<MemoryRow, 'sessionTitle'>[] }[]
  }>('/dsh-fish-memory/list'),
}
