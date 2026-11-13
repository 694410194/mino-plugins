/**
 * 「任务」视图：把最近活跃会话的后台任务（ctx.jobs 官方缝）聚成
 * 进行中 / 已完成 / 失败三组。运行中的卡有进度行和已执行时长，
 * 每行可跳回会话、可停止（jobs.kill）。
 */
import { useEffect, useMemo, useRef, useState } from 'react'
import { durationText } from './shared.tsx'
import type { JobLite, JobsSnapshotLite, SessionListLite, SessionRowLite, TodayActions, Translate } from './TodayPage.tsx'
import css from './today.module.css'

type BoundHook<S> = <R>(selector: (state: S) => R, equal?: (a: R, b: R) => boolean) => R

interface JobRow {
  job: JobLite
  sessionId: string
  sessionTitle: string
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

export function TasksTab({ t, actions, sessions, useJobs, now }: {
  t: Translate
  actions: TodayActions
  sessions: SessionListLite
  useJobs?: BoundHook<JobsSnapshotLite>
  now: number
}) {
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
    </div>
  )
}
