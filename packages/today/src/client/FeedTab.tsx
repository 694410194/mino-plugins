/**
 * 「今日」视图：接下来的安排（定时任务，可暂停/恢复）+ 批次分组的动态卡。
 * 卡片带类型左条、来源 chip、建议 chips（点了把 prompt 发回给写卡片的会话）、
 * 会话跳转和划掉。
 */
import { useMemo, useState } from 'react'
import { api, type FeedCard as FeedCardBody, type FeedItem, type ScheduleCard, type Summary } from './api.ts'
import { batchOf, dayKey, hhmm, relTime, useNow } from './shared.tsx'
import type { TodayActions, Translate } from './TodayPage.tsx'
import css from './today.module.css'

const KIND_ICON: Record<FeedItem['kind'], string> = {
  note: '✎',
  result: '✓',
  moment: '◆',
}

/** 定时任务行的「下次」标签。 */
function nextRunLabel(card: ScheduleCard, t: Translate): string {
  if (!card.nextAt) return ''
  const d = new Date(card.nextAt)
  const now = new Date()
  const startOfDay = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime()
  const days = Math.round((startOfDay(d) - startOfDay(now)) / 86_400_000)
  if (days <= 0) return t('schedule.nextToday', { time: hhmm(card.nextAt) })
  if (days === 1) return t('schedule.nextTomorrow', { time: hhmm(card.nextAt) })
  return `${d.getMonth() + 1}/${d.getDate()} ${hhmm(card.nextAt)}`
}

function kindLabel(card: ScheduleCard, t: Translate): string {
  switch (card.kind) {
    case 'daily': return t('schedule.daily', { time: card.nextAt ? hhmm(card.nextAt) : '—' })
    case 'weekly': return t('schedule.weekly', { time: card.nextAt ? `${new Date(card.nextAt).getMonth() + 1}/${new Date(card.nextAt).getDate()}` : '—' })
    case 'after': case 'at': return t('schedule.once')
    default: return t('schedule.repeating')
  }
}

function ScheduleRow({ card, t, onToggle }: { card: ScheduleCard; t: Translate; onToggle: (card: ScheduleCard) => void }) {
  return (
    <li className={css.scheduleRow} data-status={card.status}>
      <span className={css.scheduleDot} data-status={card.status} />
      <span className={css.scheduleTitle}>{card.title}</span>
      <span className={css.chip} data-tone="kind">{kindLabel(card, t)}</span>
      {card.running ? <span className={css.chip} data-tone="run">{t('schedule.running')}</span> : null}
      <span className={css.chip} data-tone={card.status}>{t(`schedule.status.${card.status}`)}</span>
      <span className={css.scheduleTime}>
        {card.status === 'active' && card.nextAt
          ? nextRunLabel(card, t)
          : card.lastDeliveredAt
            ? t('schedule.lastRun', { time: relTime(card.lastDeliveredAt, Date.now()) })
            : ''}
      </span>
      {card.status !== 'ended' ? (
        <button
          type="button"
          className={css.miniButton}
          onClick={() => onToggle(card)}
        >
          {card.status === 'active' ? t('schedule.pause') : t('schedule.resume')}
        </button>
      ) : null}
    </li>
  )
}

function SuggestionChips({ item, t, actions }: { item: FeedItem; t: Translate; actions: TodayActions }) {
  const [sent, setSent] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  if (!item.suggestions?.length) return null
  return (
    <div className={css.suggestRow}>
      {item.suggestions.map((s, i) => (
        <button
          key={i}
          type="button"
          className={css.suggestChip}
          disabled={busy || sent === s.label}
          onClick={() => {
            setBusy(true)
            void actions.sendPrompt(item.sessionId, s.prompt)
              .then(ok => { if (ok) setSent(s.label) })
              .finally(() => setBusy(false))
          }}
        >
          {sent === s.label ? t('feed.sent') : s.label}
        </button>
      ))}
    </div>
  )
}

/** 结构化卡体渲染：list 清单 / metric 指标 / progress 进度条。 */
function CardBody({ card }: { card: FeedCardBody }) {
  switch (card.type) {
    case 'list':
      return (
        <ul className={css.cardList}>
          {card.items.map((it, i) => <li key={i}>{it}</li>)}
        </ul>
      )
    case 'metric':
      return (
        <div className={css.cardMetric}>
          <span className={css.cardMetricValue}>{card.value}</span>
          {card.unit ? <span className={css.cardMetricUnit}>{card.unit}</span> : null}
          {card.delta ? <span className={css.cardMetricDelta}>{card.delta}</span> : null}
        </div>
      )
    case 'progress': {
      const pct = Math.round((card.done / card.total) * 100)
      return (
        <div className={css.cardProgress}>
          <div className={css.cardProgressBar}><span style={{ width: `${pct}%` }} /></div>
          <span className={css.cardProgressText}>{card.label ? `${card.label} ` : ''}{card.done}/{card.total}</span>
        </div>
      )
    }
  }
}

function FeedCard({ item, t, now, actions, onDelete, onFeedback, onPin, onRead }: { item: FeedItem; t: Translate; now: number; actions: TodayActions; onDelete: (id: string) => void; onFeedback: (id: string, signal: 'up' | 'down' | 'not_interested') => void; onPin: (id: string, pinned: boolean) => void; onRead: (id: string) => void }) {
  const [confirming, setConfirming] = useState(false)
  return (
    <li className={css.feedCard} data-kind={item.kind} data-pinned={item.pinned || undefined} data-unread={item.read ? undefined : true}>
      <div className={css.feedHead}>
        {!item.read ? <span className={css.unreadDot} title={t('feed.unread')} /> : null}
        <span className={css.feedKind} data-kind={item.kind}>
          <span className={css.feedKindIcon}>{KIND_ICON[item.kind]}</span>
          {t(`feed.kind.${item.kind}`)}
        </span>
        {item.source ? <span className={css.chip} data-tone="source">{item.source}</span> : null}
        <span className={css.feedTime}>{relTime(item.at, now)}</span>
        <button
          type="button"
          className={css.miniButton}
          title={item.pinned ? t('feed.unpin') : t('feed.pin')}
          onClick={() => onPin(item.id, !item.pinned)}
        >{item.pinned ? '📌' : '📍'}</button>
        <button
          type="button"
          className={css.miniButton}
          data-active={item.feedback === 'up' || undefined}
          title={t('feed.up')}
          onClick={() => onFeedback(item.id, 'up')}
        >👍</button>
        <button
          type="button"
          className={css.miniButton}
          data-active={item.feedback === 'down' || undefined}
          title={t('feed.down')}
          onClick={() => onFeedback(item.id, 'down')}
        >👎</button>
        <button
          type="button"
          className={css.miniButton}
          title={t('feed.notInterested')}
          onClick={() => onFeedback(item.id, 'not_interested')}
        >⊘</button>
        {item.sessionId ? (
          <button
            type="button"
            className={css.miniButton}
            title={t('feed.openSession')}
            onClick={() => actions.openSession(item.sessionId!)}
          >↗</button>
        ) : null}
        <button
          type="button"
          className={css.iconButton}
          title={t('feed.dismiss')}
          onClick={() => (confirming ? onDelete(item.id) : setConfirming(true))}
          onBlur={() => setConfirming(false)}
        >{confirming ? t('feed.delete') : '×'}</button>
      </div>
      <div className={css.feedTitle} onClick={() => { if (!item.read) onRead(item.id) }}>{item.title}</div>
      {item.body ? <div className={css.feedBody}>{item.body}</div> : null}
      {item.card ? <CardBody card={item.card} /> : null}
      <SuggestionChips item={item} t={t} actions={actions} />
    </li>
  )
}

/** 同一批次的卡片一组：晨间/下午/晚间 + 日期，对齐 Today 的简报批次头。 */
interface FeedGroup {
  key: string
  label: string
  items: FeedItem[]
}

export function FeedTab({ t, summary, onChanged, actions }: { t: Translate; summary: Summary | null; onChanged: () => void; actions: TodayActions }) {
  const [draft, setDraft] = useState('')
  const [posting, setPosting] = useState(false)
  const now = useNow()

  const groups = useMemo<FeedGroup[]>(() => {
    if (!summary) return []
    const map = new Map<string, FeedGroup>()
    for (const item of summary.items) {
      const day = dayKey(new Date(item.at))
      const batch = batchOf(item.at)
      // 显式 batchId 的分组优先（简报/关注的成批产出），否则回落时段分桶。
      // 键以日期开头，保证跨天排序仍由天主导。
      const key = item.batchId ? `${day}|批|${item.batchId}` : `${day}|${batch}`
      const label = item.batchId
        ? `${item.batchId} · ${Number(day.slice(5, 7))}/${Number(day.slice(8, 10))}`
        : `${t(`feed.group.${batch}`)} · ${Number(day.slice(5, 7))}/${Number(day.slice(8, 10))}`
      const g = map.get(key) ?? { key, label, items: [] }
      g.items.push(item)
      map.set(key, g)
    }
    for (const g of map.values()) g.items.sort((a, b) => Number(!!b.pinned) - Number(!!a.pinned))
    return [...map.values()].sort((a, b) => b.key.localeCompare(a.key))
  }, [summary, t])

  const submit = async () => {
    const title = draft.trim()
    if (!title || posting) return
    setPosting(true)
    try {
      await api.postItem(title)
      setDraft('')
      onChanged()
    } catch { /* 失败保留草稿 */ } finally {
      setPosting(false)
    }
  }

  const toggleSchedule = (card: ScheduleCard) => {
    void api.setScheduleActive(card.id, card.status !== 'active').then(onChanged).catch(() => {})
  }

  if (!summary) return <div className={css.loading} />
  return (
    <div>
      <h2 className={css.sectionTitle}>
        {t('section.schedule')}
        <button type="button" className={css.linkButton} onClick={actions.openSchedules}>{t('section.scheduleAll')} →</button>
      </h2>
      {summary.schedules.length === 0 ? (
        <p className={css.sectionHint}>{t('schedule.empty')}</p>
      ) : (
        <ul className={css.scheduleList}>
          {[...summary.schedules]
            .sort((a, b) => ({ active: 0, paused: 1, ended: 2 })[a.status] - ({ active: 0, paused: 1, ended: 2 })[b.status])
            .map(card => <ScheduleRow key={card.id} card={card} t={t} onToggle={toggleSchedule} />)}
        </ul>
      )}

      <div className={css.sectionRow}>
        <h2 className={css.sectionTitle}>
          {t('section.feed')}
          {summary.items.some(i => !i.read) ? (
            <button type="button" className={css.linkButton} onClick={() => { void api.markRead().then(onChanged).catch(() => {}) }}>
              {t('feed.readAll')}
            </button>
          ) : null}
        </h2>
        <div className={css.quickAdd}>
          <input
            className={css.quickInput}
            value={draft}
            placeholder={t('feed.addPlaceholder')}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') void submit() }}
          />
          <button type="button" className={css.quickButton} disabled={!draft.trim() || posting} onClick={() => void submit()}>
            {t('feed.add')}
          </button>
        </div>
      </div>

      {summary.items.length === 0 ? (
        <div className={css.emptyPanel}>
          <div className={css.emptyTitle}>{t('feed.empty.title')}</div>
          <p className={css.emptyText}>{t('feed.empty.body')}</p>
        </div>
      ) : (
        groups.map(group => (
          <section key={group.key} className={css.feedGroup}>
            <header className={css.feedGroupHead}>
              <span className={css.feedGroupKind}>{group.label}</span>
              <span className={css.feedGroupDivider}>·</span>
              <span className={css.feedGroupCount}>{t('memory.count', { count: group.items.length })}</span>
            </header>
            <ul className={css.feedList}>
              {group.items.map(item => (
                <FeedCard
                  key={item.id}
                  item={item}
                  t={t}
                  now={now}
                  actions={actions}
                  onDelete={id => { void api.deleteItem(id).then(onChanged).catch(() => {}) }}
                  onFeedback={(id, signal) => { void api.feedback(id, signal).then(onChanged).catch(() => {}) }}
                  onPin={(id, pinned) => { void api.setPin(id, pinned).then(onChanged).catch(() => {}) }}
                  onRead={id => { void api.markRead(id).then(onChanged).catch(() => {}) }}
                />
              ))}
            </ul>
          </section>
        ))
      )}
    </div>
  )
}
