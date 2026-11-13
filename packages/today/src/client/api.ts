/** mino-today 客户端的 API 面：本插件路由 + fish-memory 自己的 /list。 */

export interface Suggestion {
  label: string
  prompt: string
}

export interface FeedItem {
  id: string
  kind: 'note' | 'result' | 'moment'
  title: string
  body?: string
  at: string
  sessionId?: string
  source?: string
  suggestions?: Suggestion[]
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
  /** 定时任务暂停/恢复（id + 目标状态）。 */
  setScheduleActive: (id: string, active: boolean) => postJson<{ ok: boolean }>('/mino-today/api/schedule/edit', { id, active }),
  diaries: () => getJson<{ ok: boolean; dates: DiaryListRow[] }>('/mino-today/api/diaries'),
  diary: (date: string) => getJson<{ ok: boolean; date: string; entries: DiaryEntry[] }>(`/mino-today/api/diary?date=${encodeURIComponent(date)}`),
  addDiary: (text: string, date?: string) => postJson<{ ok: boolean; date: string }>('/mino-today/api/diary', { text, date }),
  deleteDiaryEntry: (date: string, at: string) => postJson<{ ok: boolean }>('/mino-today/api/diary/delete', { date, at }),
  /** fish-memory 自己的路由；插件不在 → fetch 抛错，由调用方转「未安装」态。 */
  memoryList: () => getJson<{
    ok: boolean
    sessions: { id: string; title?: string; memories: Omit<MemoryRow, 'sessionTitle'>[] }[]
  }>('/dsh-fish-memory/list'),
}
