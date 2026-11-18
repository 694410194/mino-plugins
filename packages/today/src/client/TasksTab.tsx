/**
 * 「任务」视图：分段开关「任务 | 定时任务」（对齐 Today 的任务页骨架）——
 * 任务段 = 为你推荐（推荐卡把 prompt 发给米洛/开新会话）+ 活跃会话后台 job 分组；
 * 定时任务段 = 定时版推荐 + 自有 schedule 列表（可暂停/恢复）。
 */
import { useEffect, useMemo, useRef, useState } from 'react'
import type { Summary } from './api.ts'
import { ScheduleList } from './FeedTab.tsx'
import { durationText } from './shared.tsx'
import type { JobLite, JobsSnapshotLite, SessionListLite, SessionRowLite, TodayActions, Translate } from './TodayPage.tsx'
import css from './today.module.css'

type BoundHook<S> = <R>(selector: (state: S) => R, equal?: (a: R, b: R) => boolean) => R

interface JobRow {
  job: JobLite
  sessionId: string
  sessionTitle: string
}

/** 推荐卡的图标：按序号轮转一组彩色字形（图标不是文案，不进 locales）。 */
const RECO_ICONS = ['☰', '✉', '⌕', '◫', '☂', '✦', '↻', '⏱'] as const
const RECO_TONES = ['blue', 'violet', 'green', 'amber', 'red', 'pink'] as const

/** 每段的推荐条数；文案全部走 locales 的 tasks.reco.{seg}.{i}.*。 */
const RECO_COUNT = 6

function RecoList({ seg, t, actions }: { seg: 'task' | 'schedule'; t: Translate; actions: TodayActions }) {
  const [sent, setSent] = useState<number | null>(null)
  const [busy, setBusy] = useState(false)
  return (
    <section>
      <h3 className={css.recoTitle}>{t('tasks.reco.title')}</h3>
      <ul className={css.recoList}>
        {Array.from({ length: RECO_COUNT }, (_, i) => {
          const title = t(`tasks.reco.${seg}.${i}.title`)
          if (!title || title === `tasks.reco.${seg}.${i}.title`) return null
          return (
            <li key={i} className={css.recoCard}>
              <span className={css.recoIcon} data-tone={RECO_TONES[i % RECO_TONES.length]}>{RECO_ICONS[i % RECO_ICONS.length]}</span>
              <span className={css.recoText}>
                <span className={css.recoName}>{title}</span>
                <span className={css.recoDesc}>{t(`tasks.reco.${seg}.${i}.desc`)}</span>
              </span>
              <button
                type="button"
                className={css.recoAdd}
                aria-label={title}
                disabled={busy || sent === i}
                onClick={() => {
                  setBusy(true)
                  void actions.sendPrompt(undefined, t(`tasks.reco.${seg}.${i}.prompt`))
                    .then(ok => { if (ok) setSent(i) })
                    .finally(() => setBusy(false))
                }}
              >{sent === i ? '✓' : '+'}</button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

function JobCard({ row, t, now, actions }: { row: JobRow; t: Translate; now: number; actions: TodayActions }) {
  const { job } = row
  const [busy, setBusy] = useState(false)
  const running = job.status === 'running' || job.status === 'stopping'
  const end = job.finishedAt ?? now
  return (
    <li className={css.jobCard} data-status={job.status}>
      <div className={css.jobHead}>
        <span className={css.jobStatus} data-status={job.status} />
        <span className={css.jobLabel}>{job.label || job.kind}</span>
        {job.progress ? <span className={css.chip} data-tone="run">{t('tasks.progress', { progress: job.progress })}</span> : null}
        <span className={css.jobTime}>
          {running ? t('tasks.duration', { duration: durationText(end - job.startedAt) }) : ''}
        </span>
      </div>
      {job.detail ? <div className={css.jobDetail}>{job.detail}</div> : null}
      <div className={css.jobFoot}>
        <button type="button" className={css.miniButton} onClick={() => actions.openSession(row.sessionId)}>
          {row.sessionTitle || t('tasks.openSession')}
        </button>
        {running ? (
          <button
            type="button"
            className={css.miniButton}
            disabled={busy}
            onClick={() => {
              setBusy(true)
              void actions.killJob(row.sessionId, job.id).finally(() => setBusy(false))
            }}
          >{t('tasks.kill')}</button>
        ) : null}
      </div>
    </li>
  )
}

function JobGroup({ title, rows, t, now, actions }: { title: string; rows: JobRow[]; t: Translate; now: number; actions: TodayActions }) {
  if (rows.length === 0) return null
  return (
    <section className={css.feedGroup}>
      <header className={css.feedGroupHead}>
        <span className={css.feedGroupKind}>{title}</span>
        <span className={css.feedGroupDivider}>·</span>
        <span className={css.feedGroupCount}>{t('memory.count', { count: rows.length })}</span>
      </header>
      <ul className={css.jobList}>
        {rows.map(row => <JobCard key={`${row.sessionId}:${row.job.id}`} row={row} t={t} now={now} actions={actions} />)}
      </ul>
    </section>
  )
}

/** 订了哪些会话的 job 流：正在跑的全部 + 最近活跃的 5 个。 */
const MAX_WATCHED_SESSIONS = 8

export function TasksTab({ t, actions, sessions, useJobs, now, summary, onChanged }: {
  t: Translate
  actions: TodayActions
  sessions: SessionListLite
  useJobs?: BoundHook<JobsSnapshotLite>
  now: number
  summary: Summary | null
  onChanged: () => void
}) {
  const [seg, setSeg] = useState<'task' | 'schedule'>('task')
  const jobsState = (useJobs?.(s => s) ?? { rows: {} }) as JobsSnapshotLite

  /** 订阅范围：running 会话优先，剩下按最近活跃补齐。 */
  const watchIds = useMemo(() => {
    const rows = sessions.ids.map(id => sessions.byId[id]).filter((r): r is SessionRowLite => Boolean(r))
    const running = rows.filter(r => r.running).map(r => r.id)
    const recent = rows
      .filter(r => !r.running)
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .map(r => r.id)
    return [...running, ...recent].slice(0, MAX_WATCHED_SESSIONS)
  }, [sessions])

  // 维护 watch 集合：多退少补，卸载时全退。
  const heldRef = useRef(new Map<string, () => void>())
  useEffect(() => {
    const held = heldRef.current
    const wanted = new Set(watchIds)
    for (const id of wanted) if (!held.has(id)) held.set(id, actions.watchJobs(id))
    for (const [id, release] of held) if (!wanted.has(id)) { release(); held.delete(id) }
  }, [watchIds, actions])
  useEffect(() => () => {
    for (const [, release] of heldRef.current) release()
    heldRef.current.clear()
  }, [])

  const { running, done, failed } = useMemo(() => {
    const running: JobRow[] = []
    const done: JobRow[] = []
    const failed: JobRow[] = []
    for (const [sessionId, rows] of Object.entries(jobsState.rows)) {
      for (const job of rows) {
        const row: JobRow = { job, sessionId, sessionTitle: sessions.byId[sessionId]?.displayTitle ?? '' }
        if (job.status === 'running' || job.status === 'stopping') running.push(row)
        else if (job.status === 'completed') done.push(row)
        else failed.push(row)
      }
    }
    const byEnd = (a: JobRow, b: JobRow) => (b.job.finishedAt ?? b.job.startedAt) - (a.job.finishedAt ?? a.job.startedAt)
    running.sort((a, b) => a.job.startedAt - b.job.startedAt)
    done.sort(byEnd)
    failed.sort(byEnd)
    return { running, done, failed }
  }, [jobsState, sessions])

  return (
    <div>
      <div className={css.pageTitleRow}>
        <h2 className={css.pageTitle}>{t('tab.tasks')}</h2>
        <button
          type="button"
          className={css.createButton}
          onClick={() => { if (seg === 'task') void actions.newChat(); else actions.openSchedules() }}
        >{seg === 'task' ? t('tasks.create') : t('tasks.createSchedule')}</button>
      </div>

      <div className={css.segmented} role="tablist">
        <button type="button" role="tab" className={css.seg} data-active={seg === 'task'} onClick={() => setSeg('task')}>
          <span className={css.segIcon}>☰</span>{t('tasks.seg.task')}
        </button>
        <button type="button" role="tab" className={css.seg} data-active={seg === 'schedule'} onClick={() => setSeg('schedule')}>
          <span className={css.segIcon}>◷</span>{t('tasks.seg.schedule')}
        </button>
      </div>

      <RecoList seg={seg} t={t} actions={actions} />

      {seg === 'task' ? (
        <>
          <p className={css.sectionHint}>{t('tasks.note')}</p>
          {running.length === 0 ? <p className={css.sectionHint}>{t('tasks.empty.running')}</p> : (
            <JobGroup title={t('tasks.running')} rows={running} t={t} now={now} actions={actions} />
          )}
          {done.length === 0 && failed.length === 0 ? (
            <p className={css.sectionHint}>{t('tasks.empty.done')}</p>
          ) : (
            <>
              <JobGroup title={t('tasks.done')} rows={done} t={t} now={now} actions={actions} />
              <JobGroup title={t('tasks.failed')} rows={failed} t={t} now={now} actions={actions} />
            </>
          )}
        </>
      ) : (
        summary ? <ScheduleList cards={summary.schedules} t={t} onChanged={onChanged} /> : <div className={css.loading} />
      )}
    </div>
  )
}
