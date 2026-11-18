/**
 * 「今日」主页面：晨曦渐变 hero（问候 + 正在处理 + 陪伴统计 + 和米洛聊聊）
 * 下面挂四个视图 —— 今日动态 / 任务 / 记忆 / 日记。
 * 数据：自有路由 /mino-today/api/* + fish-memory /dsh-fish-memory/list
 * + 官方缝（sessions.list / jobs.state / uiWorkspace / schedule）。
 */
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { api, type Summary } from './api.ts'
import { DiaryTab } from './DiaryTab.tsx'
import { FeedTab } from './FeedTab.tsx'
import { MemoryTab } from './MemoryTab.tsx'
import { TasksTab } from './TasksTab.tsx'
import { dayKey, edgeGlowHandlers, hhmm, useNow } from './shared.tsx'
import css from './today.module.css'

export type Translate = (key: string, params?: Record<string, string | number>) => string

/** 页面从 inject 面拿到的动作（缺服务时回调是空操作/假）。 */
export interface TodayActions {
  openSession(sessionId: string): void
  /** 往会话发一句话；sessionId 为空时新开一个会话。返回是否发出。 */
  sendPrompt(sessionId: string | undefined, text: string): Promise<boolean>
  /** 「和米洛聊聊」：开新会话并跳过去。 */
  newChat(): Promise<void>
  /** 订一个会话的后台任务流，返回停止函数。 */
  watchJobs(sessionId: string): () => void
  killJob(sessionId: string, jobId: string): Promise<boolean>
  /** 跳到官方「自动化任务」面板。 */
  openSchedules(): void
  refreshSessions(): void
}

export interface SessionRowLite {
  id: string
  displayTitle: string
  running: boolean
  updatedAt: number
}

export interface SessionListLite {
  ids: string[]
  byId: Record<string, SessionRowLite>
}

export interface JobLite {
  id: string
  kind: string
  label: string
  owner?: string
  status: 'running' | 'stopping' | 'completed' | 'killed' | 'failed'
  progress?: string
  detail?: string
  startedAt: number
  finishedAt?: number
}

export interface JobsSnapshotLite {
  rows: Record<string, readonly JobLite[]>
}

/** 渲染器把 hooks 隔间里的裸源绑成的 selector hook；缺服务时不注入。 */
type BoundHook<S> = <R>(selector: (state: S) => R, equal?: (a: R, b: R) => boolean) => R

export interface TodayPageProps {
  t: Translate
  actions: TodayActions
  useSessionList?: BoundHook<SessionListLite>
  useJobs?: BoundHook<JobsSnapshotLite>
  /** 框架下发的子座位渲染器；渲染 'today.page.voice' 由语音笔记插件贡献。 */
  renderSlot?: (key: string, owner: Record<string, unknown>, opts?: { fallback?: ReactNode }) => ReactNode
}

type Tab = 'feed' | 'tasks' | 'memory' | 'diary' | 'voice'

const EMPTY_SESSIONS: SessionListLite = { ids: [], byId: {} }

function greetingKey(hour: number): string {
  if (hour < 5) return 'greeting.night'
  if (hour < 9) return 'greeting.morning'
  if (hour < 12) return 'greeting.forenoon'
  if (hour < 14) return 'greeting.noon'
  if (hour < 18) return 'greeting.afternoon'
  if (hour < 23) return 'greeting.evening'
  return 'greeting.night'
}

/** 陪伴天数：从最早一条记录算到今天（至少 1）。 */
function daysSince(iso: string | null | undefined): number {
  if (!iso) return 1
  const start = new Date(iso.slice(0, 10))
  if (Number.isNaN(start.getTime())) return 1
  const now = new Date()
  const days = Math.floor((new Date(dayKey(now)).getTime() - start.getTime()) / 86_400_000) + 1
  return Math.max(1, days)
}

export function TodayPage({ t, actions, useSessionList, useJobs, renderSlot }: TodayPageProps) {
  const [tab, setTab] = useState<Tab>('feed')
  const [summary, setSummary] = useState<Summary | null>(null)
  const [summaryFailed, setSummaryFailed] = useState(false)
  const [loadedAt, setLoadedAt] = useState<number | null>(null)
  const now = useNow()

  const loadSummary = useCallback(() => {
    setSummaryFailed(false)
    api.summary()
      .then(res => { setSummary(res); setLoadedAt(Date.now()) })
      .catch(() => setSummaryFailed(true))
  }, [])
  useEffect(() => {
    actions.refreshSessions()
    loadSummary()
  }, [actions, loadSummary])

  const sessions = (useSessionList?.(s => s) ?? EMPTY_SESSIONS) as SessionListLite
  const runningSessions = useMemo(
    () => sessions.ids.map(id => sessions.byId[id]).filter((s): s is SessionRowLite => Boolean(s?.running)),
    [sessions],
  )
  const runningCount = runningSessions.length

  const today = new Date()
  const dateLine = today.toLocaleDateString(undefined, { month: 'long', day: 'numeric', weekday: 'long' })
  const stats = summary?.stats

  return (
    <div className={css.page}>
      <header className={css.hero}>
        <div className={css.heroMain}>
          <div className={css.heroDate}>{dateLine}</div>
          <h1 className={css.heroGreeting}>{t(greetingKey(today.getHours()))}</h1>
          <div className={css.heroStats}>
            {stats ? <span className={css.statChip}>{t('hero.stat.days', { count: daysSince(stats.oldestAt) })}</span> : null}
            {stats ? <span className={css.statChip}>{t('hero.stat.feed', { count: stats.feedCount })}</span> : null}
            {stats ? <span className={css.statChip}>{t('hero.stat.diary', { count: stats.diaryDays })}</span> : null}
            {summary ? <span className={css.statChip}>{t('hero.stat.schedule', { count: summary.schedules.length })}</span> : null}
          </div>
        </div>
        <div className={css.heroSide}>
          <button type="button" className={css.chatButton} onClick={() => void actions.newChat()}>
            {t('hero.chat')}
          </button>
          <button
            type="button"
            className={css.updatedAt}
            title={t('hero.updated', { time: loadedAt ? hhmm(loadedAt) : '—' })}
            onClick={loadSummary}
          >
            {t('hero.updated', { time: loadedAt ? hhmm(loadedAt) : '—' })}
          </button>
        </div>
        {runningCount > 0 && runningSessions[0] ? (
          <button
            type="button"
            className={css.workingBar}
            onClick={() => { const s = runningSessions[0]; if (s) actions.openSession(s.id) }}
            {...edgeGlowHandlers<HTMLButtonElement>()}
          >
            <span className={css.edgeLight} />
            <span className={css.workingDot} />
            {runningCount === 1
              ? t('hero.working', { title: runningSessions[0]?.displayTitle ?? '' })
              : t('hero.workingMore', { title: runningSessions[0]?.displayTitle ?? '', count: runningCount })}
          </button>
        ) : null}
      </header>

      <nav className={css.tabs}>
        {(['feed', 'tasks', 'memory', 'diary', 'voice'] as const).map(key => (
          <button
            key={key}
            type="button"
            className={css.tab}
            data-active={tab === key}
            onClick={() => setTab(key)}
          >
            {t(`tab.${key}`)}
            {key === 'tasks' && runningCount > 0 ? <span className={css.tabBadge}>{runningCount}</span> : null}
          </button>
        ))}
      </nav>

      <main className={css.body}>
        {summaryFailed && tab === 'feed' ? (
          <button type="button" className={css.errorBox} onClick={loadSummary}>{t('error.load')}</button>
        ) : null}
        {tab === 'feed' ? <FeedTab t={t} summary={summary} onChanged={loadSummary} actions={actions} /> : null}
        {tab === 'tasks' ? (
          <TasksTab t={t} actions={actions} sessions={sessions} useJobs={useJobs} now={now} />
        ) : null}
        {tab === 'memory' ? <MemoryTab t={t} /> : null}
        {tab === 'diary' ? <DiaryTab t={t} /> : null}
        {tab === 'voice'
          ? (renderSlot?.('today.page.voice', {}, { fallback: <div className={css.emptyPanel}>{t('tab.voiceEmpty')}</div> }) ?? null)
          : null}
      </main>
    </div>
  )
}
