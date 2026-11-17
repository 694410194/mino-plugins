/**
 * mino-today 的自有存储：`$DSH_HOME/mino-today/store.json`。
 * 只有自己的动态卡片和日记——定时任务实时从宿主 schedule 服务读，
 * 记忆由 fish-memory 自己的 /dsh-fish-memory/list 提供（客户端直取，不经手）。
 */
import { mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'

/** 卡片底部的建议按钮：点一下把 prompt 发回给写卡片的会话。 */
export interface Suggestion {
  label: string
  prompt: string
}

/** 「今日」动态卡片。kind: note=随手记 / result=做完的事 / moment=值得留意。 */
export interface FeedItem {
  id: string
  kind: 'note' | 'result' | 'moment'
  title: string
  body?: string
  at: string
  sessionId?: string
  /** 来源小标签（会话、定时任务、随手记…），卡片右上角 chip。 */
  source?: string
  suggestions?: Suggestion[]
  dismissed?: boolean
  /** 生成方给的批次标签（如「早报」「晚报」）；同批卡片在 feed 里并成一组。 */
  batchId?: string
  /** 用户置顶——组内排在最前。 */
  pinned?: boolean
  /** 用户反馈信号；not_interested 同时意味着划掉。 */
  feedback?: 'up' | 'down' | 'not_interested'
}

/** 「关注 X」追踪：用户点名的长期关注主题，绑一条宿主 schedule 定时去查。 */
export interface Watch {
  id: string
  topic: string
  prompt: string
  /** 宿主 schedule 条目 id（schedule 服务缺失时为空——只记不跑）。 */
  scheduleId?: string
  at: string
  enabled: boolean
}

export interface DiaryEntry {
  at: string
  text: string
  sessionId?: string
}

export interface Diary {
  entries: DiaryEntry[]
  updatedAt: string
}

export interface Store {
  items: FeedItem[]
  diaries: Record<string, Diary>
  watches: Watch[]
}

/** 存留的动态卡片上限；先丢最旧的已划掉卡片，再丢最旧的。 */
const MAX_ITEMS = 200
/** 单篇日记的条数上限（防 runaway）。 */
const MAX_DIARY_ENTRIES = 200

const STORE_DIR = join(process.env.DSH_HOME || join(homedir(), '.mino'), 'mino-today')
const STORE_FILE = join(STORE_DIR, 'store.json')

function emptyStore(): Store {
  return { items: [], diaries: {}, watches: [] }
}

export function loadStore(): Store {
  try {
    const raw = JSON.parse(readFileSync(STORE_FILE, 'utf8'))
    const store = emptyStore()
    if (Array.isArray(raw?.items)) store.items = raw.items
    if (raw && typeof raw.diaries === 'object' && raw.diaries !== null) store.diaries = raw.diaries
    if (Array.isArray(raw?.watches)) store.watches = raw.watches
    return store
  } catch {
    return emptyStore()
  }
}

export function saveStore(store: Store): void {
  mkdirSync(dirname(STORE_FILE), { recursive: true })
  const tmp = STORE_FILE + '.tmp'
  writeFileSync(tmp, JSON.stringify(store))
  renameSync(tmp, STORE_FILE)
}

/** 本地日期键 YYYY-MM-DD（日记按本地日子归档）。 */
export function dayKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const DAY_KEY_RE = /^\d{4}-\d{2}-\d{2}$/

/** 加一张动态卡片，返回它的 id。 */
export function addItem(store: Store, item: Omit<FeedItem, 'id' | 'at'> & { at?: string }): FeedItem {
  const full: FeedItem = {
    id: 'td' + Date.now().toString(36) + Math.floor(Math.random() * 10000).toString(36),
    at: item.at ?? new Date().toISOString(),
    kind: item.kind,
    title: item.title,
  }
  if (item.body) full.body = item.body
  if (item.sessionId) full.sessionId = item.sessionId
  if (item.source) full.source = item.source
  if (item.batchId) full.batchId = item.batchId
  if (item.suggestions?.length) full.suggestions = item.suggestions
  store.items.push(full)
  if (store.items.length > MAX_ITEMS) {
    const dismissed = store.items.filter(i => i.dismissed)
    const kept = store.items.filter(i => !i.dismissed)
    const overflow = store.items.length - MAX_ITEMS
    store.items = dismissed.length >= overflow
      ? [...dismissed.slice(overflow), ...kept]
      : kept.slice(-MAX_ITEMS)
  }
  return full
}

/** 往某天的日记追加一条。date 缺省/非法时归今天。 */
export function addDiaryEntry(store: Store, date: string | undefined, text: string, sessionId?: string): { date: string; entry: DiaryEntry } {
  const key = date && DAY_KEY_RE.test(date) ? date : dayKey(new Date())
  const diary = store.diaries[key] ?? { entries: [], updatedAt: '' }
  const entry: DiaryEntry = { at: new Date().toISOString(), text }
  if (sessionId) entry.sessionId = sessionId
  diary.entries.push(entry)
  if (diary.entries.length > MAX_DIARY_ENTRIES) diary.entries = diary.entries.slice(-MAX_DIARY_ENTRIES)
  diary.updatedAt = new Date().toISOString()
  store.diaries[key] = diary
  return { date: key, entry }
}

/** 删掉某天日记里的一条（按 at 精确匹配）。 */
export function deleteDiaryEntry(store: Store, date: string, at: string): boolean {
  const diary = store.diaries[date]
  if (!diary) return false
  const before = diary.entries.length
  diary.entries = diary.entries.filter(e => e.at !== at)
  if (diary.entries.length === before) return false
  if (diary.entries.length === 0) delete store.diaries[date]
  else diary.updatedAt = new Date().toISOString()
  return true
}

/** 登记一条「关注」追踪，返回它的 id。 */
export function addWatch(store: Store, watch: Omit<Watch, 'id' | 'at'>): Watch {
  const full: Watch = {
    id: 'wt' + Date.now().toString(36) + Math.floor(Math.random() * 10000).toString(36),
    at: new Date().toISOString(),
    ...watch,
  }
  store.watches.push(full)
  return full
}

/** 按 id 摘一条 watch（返回被摘的，方便拿 scheduleId 去删宿主条目）。 */
export function removeWatch(store: Store, id: string): Watch | undefined {
  const idx = store.watches.findIndex(w => w.id === id)
  if (idx < 0) return undefined
  return store.watches.splice(idx, 1)[0]
}
