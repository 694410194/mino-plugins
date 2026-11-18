/**
 * 「今日」视图：接下来的安排（定时任务，可暂停/恢复）+ 批次分组的动态卡。
 * 卡片带类型左条、来源 chip、建议 chips（点了把 prompt 发回给写卡片的会话）、
 * 会话跳转和划掉。
 */
import { useEffect, useMemo, useRef, useState } from 'react'

/** 对齐 todayV3.feed.window「这里只展示最近 14 天的内容」。 */
const WINDOW_DAYS = 14
/** 每次露出的条数（对应 today-feed-sentinel 的增量加载）。 */
const PAGE = 12
import { api, type BriefSlot, type CalEvent, type FeedCard as FeedCardBody, type FeedItem, type ScheduleCard, type Summary, type Watch } from './api.ts'
import { batchOf, dayKey, edgeGlowHandlers, hhmm, relTime, useNow } from './shared.tsx'
import type { TodayActions, TodayPageProps, Translate } from './TodayPage.tsx'
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

/** dayInProgress.startingSoon：active 且下次运行在未来 30 分钟内。 */
function startingSoon(card: ScheduleCard): boolean {
  if (!card.nextAt || card.running || card.status !== 'active') return false
  const diff = new Date(card.nextAt).getTime() - Date.now()
  return diff > 0 && diff <= 30 * 60_000
}

function ScheduleRow({ card, t, onToggle }: { card: ScheduleCard; t: Translate; onToggle: (card: ScheduleCard) => void }) {
  return (
    <li className={css.scheduleRow} data-status={card.status}>
      <span className={css.scheduleDot} data-status={card.status} />
      <span className={css.scheduleTitle}>{card.title}</span>
      <span className={css.chip} data-tone="kind">{kindLabel(card, t)}</span>
      {card.running ? <span className={css.chip} data-tone="run">{t('schedule.running')}</span> : null}
      {startingSoon(card) ? <span className={css.chip} data-tone="soon">{t('schedule.startingSoon')}</span> : null}
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

/** 定时任务列表：今日页 strip 与任务页「定时任务」段共用。limit=预览条数（对齐 day-in-progress 的 3+more）。 */
export function ScheduleList({ cards, t, onChanged, limit }: { cards: ScheduleCard[]; t: Translate; onChanged: () => void; limit?: number }) {
  const [showAll, setShowAll] = useState(false)
  const toggle = (card: ScheduleCard) => {
    void api.setScheduleActive(card.id, card.status !== 'active').then(onChanged).catch(() => {})
  }
  if (cards.length === 0) return <p className={css.sectionHint}>{t('schedule.empty')}</p>
  const sorted = [...cards]
    .sort((a, b) => ({ active: 0, paused: 1, ended: 2 })[a.status] - ({ active: 0, paused: 1, ended: 2 })[b.status])
  const hidden = limit && !showAll ? Math.max(0, sorted.length - limit) : 0
  return (
    <>
      <ul className={css.scheduleList}>
        {(hidden ? sorted.slice(0, limit) : sorted)
          .map(card => <ScheduleRow key={card.id} card={card} t={t} onToggle={toggle} />)}
      </ul>
      {limit && sorted.length > limit ? (
        <button type="button" className={css.scheduleMore} onClick={() => setShowAll(v => !v)}>
          {showAll ? t('schedule.showLess') : t('schedule.showMore', { count: sorted.length - limit })}
        </button>
      ) : null}
    </>
  )
}

/** 'YYYY-MM-DD HH:MM' → 当日分钟数；全日返回 null。 */
function minutesOf(start: string): number | null {
  const m = start.match(/\d{4}-\d{2}-\d{2} (\d{2}):(\d{2})/)
  return m ? Number(m[1]) * 60 + Number(m[2]) : null
}

/**
 * 日程进展卡（Today day_in_progress@1 复刻）：今日日历事件按时间列，
 * 状态 = 已过去/进行中/即将开始(30min)/未到；3 条起步 + 「还有 N 条」。
 * 数据走日历连接器自己的 /api/day——插件没装整条卡消失（events=null）。
 */
function EventsCard({ events, t, now }: { events: CalEvent[]; t: Translate; now: number }) {
  const [showAll, setShowAll] = useState(false)
  const statusOf = (e: CalEvent): 'allDay' | 'past' | 'now' | 'soon' | 'later' => {
    if (e.allDay) return 'allDay'
    const start = minutesOf(e.start)
    const end = minutesOf(e.end) ?? (start !== null ? start + 60 : null)
    const cur = new Date(now).getHours() * 60 + new Date(now).getMinutes()
    if (start === null) return 'later'
    if (end !== null && cur >= end) return 'past'
    if (cur >= start && (end === null || cur < end)) return 'now'
    return start - cur <= 30 ? 'soon' : 'later'
  }
  const list = showAll ? events : events.slice(0, 3)
  return (
    <section className={css.eventsCard} data-client-card="day_in_progress">
      <h2 className={css.sectionTitle}>{t('section.schedule')}</h2>
      {events.length === 0 ? <p className={css.sectionHint}>{t('events.empty')}</p> : (
        <ul className={css.scheduleList}>
          {list.map((e, i) => {
            const st = statusOf(e)
            const endMin = minutesOf(e.end)
            const cur = new Date(now).getHours() * 60 + new Date(now).getMinutes()
            return (
              <li key={i} className={css.scheduleRow} data-status={st === 'past' ? 'ended' : 'active'}>
                <span className={css.scheduleDot} data-status={st === 'past' ? 'ended' : st === 'now' ? 'active' : 'paused'} />
                <span className={css.scheduleTitle}>{e.summary}</span>
                {st === 'allDay' ? <span className={css.chip} data-tone="kind">{t('events.allDay')}</span> : null}
                {st === 'past' ? <span className={css.chip} data-tone="ended">{t('events.past')}</span> : null}
                {st === 'now' ? (
                  <span className={css.chip} data-tone="run">
                    {t('events.now')}
                    {endMin !== null && endMin > cur ? ` · ${t('events.endsIn', { count: endMin - cur })}` : ''}
                  </span>
                ) : null}
                {st === 'soon' ? <span className={css.chip} data-tone="soon">{t('schedule.startingSoon')}</span> : null}
                {e.location ? <span className={css.eventLoc}>{e.location}</span> : null}
                <span className={css.scheduleTime}>{e.allDay ? '' : `${e.start.slice(11)}${e.end ? `–${e.end.slice(11) || '…'}` : ''}`}</span>
              </li>
            )
          })}
        </ul>
      )}
      {events.length > 3 ? (
        <button type="button" className={css.scheduleMore} onClick={() => setShowAll(v => !v)}>
          {showAll ? t('schedule.showLess') : t('schedule.showMore', { count: events.length - 3 })}
        </button>
      ) : null}
    </section>
  )
}

/** 槽位 → 对应批次 kind（与 brief 约定：早= morning_brief，晚= evening_brief）。 */
const BRIEF_KIND: Record<string, string> = { morning: 'morning_brief', evening: 'evening_brief' }

/**
 * 候简报行（Today latestBriefCard 复刻）：该出的简报还没落地时，
 * 上下发丝线之间放「你的简报已在这里等候」+ 取稿 CTA；点击→生成态卡。
 * 数据走 mino-brief 自己的 /api/prefs——插件没装整条消失（slots=null）。
 */
function LatestBrief({ t, slots, items, creating, onFetch }: { t: Translate; slots: BriefSlot[]; items: FeedItem[]; creating: boolean; onFetch: () => void }) {
  const now = new Date()
  const nowHM = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  const today = dayKey(now)
  const pending = slots.find(s =>
    s.enabled && s.hasEntry && s.time <= nowHM &&
    !items.some(i => i.batchKind === BRIEF_KIND[s.slot] && dayKey(new Date(i.at)) === today),
  )
  if (creating) {
    return <div className={css.latestBrief}><p className={css.latestBriefText}>{t('brief.fetching')}</p></div>
  }
  if (!pending) return null
  return (
    <div className={css.latestBrief} data-batch-kind="latest_brief">
      <p className={css.latestBriefText}>{t('brief.waiting')}</p>
      <button type="button" className={css.latestBriefCta} onClick={onFetch}>{t('brief.fetch')}</button>
    </div>
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

/**
 * 卡片溢出菜单：Today 的 more 菜单（briefFeedback.more=更多）——
 * 置顶/反馈/不感兴趣/打开会话/删除全部收进一个 ⋯，外点与 Esc 关闭。
 */
function CardMenu({ item, t, actions, onDelete, onFeedback, onPin, onAdjust }: { item: FeedItem; t: Translate; actions: TodayActions; onDelete: (id: string) => void; onFeedback: (id: string, signal: 'up' | 'down' | 'not_interested') => void; onPin: (id: string, pinned: boolean) => void; onAdjust: () => void }) {
  const [open, setOpen] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const rootRef = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) { setOpen(false); setConfirming(false) }
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { setOpen(false); setConfirming(false) } }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])
  const act = (fn: () => void) => () => { fn(); setOpen(false); setConfirming(false) }
  return (
    <span className={css.menuWrap} ref={rootRef}>
      <button
        type="button"
        className={css.iconButton}
        title={t('feed.more')}
        aria-expanded={open}
        onClick={() => { setOpen(v => !v); setConfirming(false) }}
      >⋯</button>
      {open ? (
        <span className={css.feedMenu} role="menu">
          <button type="button" role="menuitem" className={css.menuItem} onClick={act(() => onPin(item.id, !item.pinned))}>
            {item.pinned ? t('feed.unpin') : t('feed.pin')}
          </button>
          <button type="button" role="menuitem" className={css.menuItem} data-active={item.feedback === 'up' || undefined} onClick={act(() => onFeedback(item.id, 'up'))}>
            {t('feed.up')}
          </button>
          <button type="button" role="menuitem" className={css.menuItem} data-active={item.feedback === 'down' || undefined} onClick={act(() => onFeedback(item.id, 'down'))}>
            {t('feed.down')}
          </button>
          <button type="button" role="menuitem" className={css.menuItem} onClick={act(() => onFeedback(item.id, 'not_interested'))}>
            {t('feed.notInterested')}
          </button>
          <button type="button" role="menuitem" className={css.menuItem} onClick={act(onAdjust)}>
            {t('feed.adjust')}
          </button>
          <button type="button" role="menuitem" className={css.menuItem} onClick={act(() => { void actions.sendPrompt(item.sessionId, t('feed.askPrompt', { title: item.title })) })}>
            {t('feed.askAgent')}
          </button>
          {item.sessionId ? (
            <button type="button" role="menuitem" className={css.menuItem} onClick={act(() => actions.openSession(item.sessionId!))}>
              {t('feed.openSession')}
            </button>
          ) : null}
          <button
            type="button"
            role="menuitem"
            className={`${css.menuItem} ${css.menuItemDanger}`}
            onClick={confirming ? act(() => onDelete(item.id)) : () => setConfirming(true)}
          >{confirming ? t('feed.confirmDelete') : t('feed.dismiss')}</button>
        </span>
      ) : null}
    </span>
  )
}

/**
 * 卡正文按 Today 信息流卡做紧凑预览（4 行），量出溢出挂「展开/收起」。
 */
function FeedBody({ body, t }: { body: string; t: Translate }) {
  const ref = useRef<HTMLDivElement>(null)
  const [overflow, setOverflow] = useState(false)
  const [open, setOpen] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (el) setOverflow(el.scrollHeight > el.clientHeight + 1)
  }, [body])
  return (
    <>
      <div ref={ref} className={`${css.feedBody} ${!open ? css.feedBodyClamped : ''}`}>{body}</div>
      {overflow ? (
        <button type="button" className={css.feedExpand} onClick={() => setOpen(v => !v)}>
          {open ? t('feed.collapse') : t('feed.expand')}
        </button>
      ) : null}
    </>
  )
}

/**
 * feed 卡 = 导航卡（对齐 data-today-v3-navigation-card）：点卡标记已读并进来源会话，
 * 正文只做紧凑预览；按钮/划词不误触。
 */
/** 卡头时间用 Today 的 updatedAt 句式：刚刚更新 / N分钟前更新 / 今天HH:mm更新 / 昨天HH:mm更新 / M/D更新。 */
function updatedLabel(iso: string, now: number, t: Translate): string {
  const ms = new Date(iso).getTime()
  if (Number.isNaN(ms)) return ''
  const diff = now - ms
  if (diff < 60_000) return t('feed.updated.now')
  if (diff < 3_600_000) return t('feed.updated.minutes', { count: Math.floor(diff / 60_000) })
  const d = new Date(iso), n = new Date(now)
  const day = (x: Date) => x.getFullYear() * 1000 + x.getMonth() * 40 + x.getDate()
  if (day(d) === day(n)) return t('feed.updated.today', { time: hhmm(iso) })
  if (day(d) === day(n) - 1) return t('feed.updated.yesterday', { time: hhmm(iso) })
  return t('feed.updated.date', { date: `${d.getMonth() + 1}/${d.getDate()}` })
}

/**
 * 实时组件区（Today liveWidgets 复刻）：追踪中的主题卡片 + 悬停刷新/编辑/删除 +
 * 空态建议卡（可关闭）+ 添加入口（经会话让 agent 建 watch）。
 */
function WidgetSection({ t, watches, schedules, actions, hintDismissed, onDismissHint, onChanged }: { t: Translate; watches: Watch[]; schedules: ScheduleCard[]; actions: TodayActions; hintDismissed: boolean; onDismissHint: () => void; onChanged: () => void }) {
  const [adding, setAdding] = useState(false)
  const [topic, setTopic] = useState('')
  const [sending, setSending] = useState(false)
  /** generationState==="creating" 对应物：add 发出后到 watch 落地（或超时）期间的占位卡。 */
  const [pendingTopic, setPendingTopic] = useState<string | null>(null)
  useEffect(() => {
    if (!pendingTopic) return
    if (watches.some(w => w.topic === pendingTopic)) { setPendingTopic(null); return }
    const timer = setTimeout(() => setPendingTopic(null), 90_000)
    return () => clearTimeout(timer)
  }, [watches, pendingTopic])
  const send = (text: string) => {
    setSending(true)
    void actions.sendPrompt(undefined, text, { navigate: false }).finally(() => setSending(false))
  }
  const askAdd = () => {
    const v = topic.trim()
    if (!v) return
    send(t('watch.addPrompt', { topic: v }))
    setPendingTopic(v)
    setAdding(false)
    setTopic('')
  }
  return (
    <section className={css.widgetSection} data-batch-kind="live_widget">
      <h2 className={css.sectionTitle}>
        {t('section.watches')}
        <button type="button" className={css.linkButton} onClick={() => setAdding(v => !v)}>{t('watch.add')} +</button>
      </h2>
      {adding ? (
        <div className={css.quickAdd}>
          <input
            className={css.quickInput}
            value={topic}
            placeholder={t('watch.addPlaceholder')}
            autoFocus
            onChange={e => setTopic(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') askAdd() }}
          />
          <button type="button" className={css.quickButton} disabled={!topic.trim() || sending} onClick={askAdd}>
            {t('watch.addSend')}
          </button>
        </div>
      ) : null}
      {watches.length === 0 && !hintDismissed && !adding ? (
        <div className={css.watchHint}>
          <span className={css.watchHintIcon}>◉</span>
          <div className={css.watchHintText}>
            <div className={css.watchHintTitle}>{t('watch.hintTitle')}</div>
            <p className={css.watchHintBody}>{t('watch.hintBody')}</p>
            <button type="button" className={css.miniButton} onClick={() => setAdding(true)}>{t('watch.add')}</button>
          </div>
          <button type="button" className={css.watchHintClose} title={t('watch.hintDismiss')} onClick={onDismissHint}>✕</button>
        </div>
      ) : null}
      {pendingTopic ? <div className={css.creatingCard}>{t('watch.creating', { topic: pendingTopic })}</div> : null}
      {watches.length ? (
        <ul className={css.scheduleList}>
          {watches.map(w => <WatchRow key={w.id} w={w} t={t} schedules={schedules} send={send} sending={sending} onChanged={onChanged} />)}
        </ul>
      ) : null}
    </section>
  )
}

/** 单个追踪组件：hover 露操作（刷新/编辑/删除），删除走两步确认（deleteConfirm 语义）。 */
function WatchRow({ w, t, schedules, send, sending, onChanged }: { w: Watch; t: Translate; schedules: ScheduleCard[]; send: (text: string) => void; sending: boolean; onChanged: () => void }) {
  const [confirming, setConfirming] = useState(false)
  const [removing, setRemoving] = useState(false)
  const sched = schedules.find(s => s.id === w.scheduleId)
  return (
    <li className={`${css.scheduleRow} ${css.watchRow}`} data-status={w.enabled ? 'active' : 'paused'}>
      <span className={css.scheduleDot} data-status={w.enabled ? 'active' : 'paused'} />
      <span className={css.scheduleTitle}>{w.topic}</span>
      {!w.enabled ? <span className={css.chip} data-tone="paused">{t('schedule.status.paused')}</span> : null}
      <span className={css.scheduleTime}>{sched?.nextAt ? t('watch.next', { time: nextRunLabel(sched, t) }) : t('watch.manual')}</span>
      <span className={css.watchActions}>
        {confirming ? (
          <>
            <button type="button" className={css.linkButton} onClick={() => setConfirming(false)}>{t('feed.cancel')}</button>
            <button
              type="button"
              className={css.miniButton}
              disabled={removing}
              onClick={() => {
                setRemoving(true)
                void api.deleteWatch(w.id).then(onChanged).catch(() => setRemoving(false))
              }}
            >{removing ? t('watch.deleting') : t('watch.deleteConfirm')}</button>
          </>
        ) : (
          <>
            <button type="button" className={css.watchAction} title={t('watch.refresh')} disabled={sending}
              onClick={() => send(t('watch.refreshPrompt', { topic: w.topic }))}>⟳</button>
            <button type="button" className={css.watchAction} title={t('watch.edit')} disabled={sending}
              onClick={() => send(t('watch.editPrompt', { topic: w.topic }))}>✎</button>
            <button type="button" className={css.watchAction} title={t('watch.delete')} onClick={() => setConfirming(true)}>✕</button>
          </>
        )}
      </span>
    </li>
  )
}

/** 「调整卡片」卡内编辑区：自由文本 → item.adjustNotes → 生成方按 source 取回。 */
function AdjustEditor({ item, t, onClose }: { item: FeedItem; t: Translate; onClose: (saved: boolean) => void }) {
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  return (
    <div className={css.adjustBox}>
      <textarea
        className={css.adjustInput}
        value={note}
        placeholder={t('feed.adjustPlaceholder')}
        rows={2}
        autoFocus
        onChange={e => setNote(e.target.value)}
      />
      <div className={css.adjustRow}>
        <button type="button" className={css.linkButton} onClick={() => onClose(false)}>{t('feed.cancel')}</button>
        <button
          type="button"
          className={css.quickButton}
          disabled={!note.trim() || saving}
          onClick={() => {
            setSaving(true)
            void api.adjust(item.id, note.trim()).then(() => onClose(true)).catch(() => setSaving(false))
          }}
        >{t('feed.adjustSave')}</button>
      </div>
    </div>
  )
}

/** 滚动已读：卡滚进视口（≥50% 露出）即标已读，对齐 Today 的 batch scroll-spy。 */
function seenRef(onSeen: () => void) {
  return (el: HTMLElement | null) => {
    if (!el || el.dataset.seenBound) return
    el.dataset.seenBound = '1'
    const io = new IntersectionObserver(entries => {
      if (entries.some(e => e.intersectionRatio >= 0.5)) { onSeen(); io.disconnect() }
    }, { threshold: 0.5 })
    io.observe(el)
  }
}

function FeedCard({ item, t, now, actions, onDelete, onFeedback, onPin, onSeen, read }: { item: FeedItem; t: Translate; now: number; actions: TodayActions; onDelete: (id: string) => void; onFeedback: (id: string, signal: 'up' | 'down' | 'not_interested') => void; onPin: (id: string, pinned: boolean) => void; onSeen: (id: string) => void; read: boolean }) {
  const [adjusting, setAdjusting] = useState(false)
  const [adjusted, setAdjusted] = useState(false)
  return (
    <li
      className={css.feedCard}
      data-kind={item.kind}
      data-pinned={item.pinned || undefined}
      data-unread={read ? undefined : true}
      data-nav={item.sessionId || undefined}
      ref={read ? undefined : seenRef(() => onSeen(item.id))}
      onClick={e => {
        if ((e.target as HTMLElement).closest('button, input, a, textarea')) return
        if (window.getSelection()?.toString()) return
        if (!read) onSeen(item.id)
        if (item.sessionId) actions.openSession(item.sessionId)
      }}
      {...edgeGlowHandlers<HTMLLIElement>()}
    >
      <span className={css.edgeLight} />
      <div className={css.feedHead}>
        {!read ? <span className={css.unreadDot} title={t('feed.unread')} /> : null}
        <span className={css.feedProvider} data-kind={item.kind}>
          <span className={css.feedKindIcon}>{KIND_ICON[item.kind]}</span>
          {item.source ?? t(`feed.kind.${item.kind}`)}
        </span>
        <span className={css.feedTime}>{updatedLabel(item.at, now, t)}</span>
        <CardMenu item={item} t={t} actions={actions} onDelete={onDelete} onFeedback={onFeedback} onPin={onPin} onAdjust={() => setAdjusting(true)} />
      </div>
      <div className={css.feedTitle}>{item.title}</div>
      {item.body ? <FeedBody body={item.body} t={t} /> : null}
      {item.card ? <CardBody card={item.card} /> : null}
      <SuggestionChips item={item} t={t} actions={actions} />
      {adjusting ? (
        <AdjustEditor item={item} t={t} onClose={saved => { setAdjusting(false); if (saved) setAdjusted(true) }} />
      ) : adjusted ? (
        <p className={css.adjustSaved}>{t('feed.adjustSaved')}</p>
      ) : null}
    </li>
  )
}

/** 批次 kind → section-title 氛围类别（Today e7 映射表同款）。 */
const KIND_AMBIENT: Record<string, 'morning' | 'evening' | 'welcome' | 'guidance'> = {
  morning_brief: 'morning',
  evening_brief: 'evening',
  diary: 'evening',
  health_brief: 'evening',
  first_health_report: 'evening',
  weekly_health_report: 'evening',
  welcome: 'welcome',
  feature_intro: 'guidance',
}

/** 批次 kind → 本地化标题键（Today e_ 映射表同款；未知 kind 回落 batchId 原文）。 */
const KIND_TITLE: Record<string, string> = {
  morning_brief: 'batch.title.morning',
  evening_brief: 'batch.title.evening',
  diary: 'batch.title.diary',
  health_brief: 'batch.title.healthBrief',
  first_health_report: 'batch.title.firstHealth',
  weekly_health_report: 'batch.title.weeklyHealth',
  welcome: 'batch.title.welcome',
  feature_intro: 'batch.title.featureIntro',
}

/** 闪光粒子布局（解包 el[] 原值：位置/大小/延迟/时长/不透明度）。 */
const SPARKLES = [
  { left: '-4%', top: '-20%', size: 11, delay: 0.2, dur: 2.6, op: 0.75 },
  { left: '76%', top: '-22%', size: 13, delay: 1.1, dur: 2.8, op: 0.7 },
  { left: '90%', top: '62%', size: 10, delay: 1.9, dur: 2.5, op: 0.7 },
  { left: '18%', top: '82%', size: 9, delay: 2.6, dur: 2.4, op: 0.65 },
]
/** 氛围色组：morning=暖金（解包实值）；evening/guidance 走品牌紫粉（Mino 品牌对应）；welcome 无氛围。 */
const AMBIENT_COLORS: Record<string, string[]> = {
  morning: ['rgba(255,212,120,1)', 'rgba(255,180,90,1)', 'rgba(255,232,160,1)', 'rgba(255,196,110,1)'],
  evening: ['rgba(165,94,232,0.85)', 'rgba(236,111,184,0.8)', 'rgba(200,150,245,0.75)', 'rgba(180,110,220,0.8)'],
  guidance: ['rgba(120,178,255,1)', 'rgba(150,205,255,1)', 'rgba(90,160,255,1)', 'rgba(170,210,250,1)'],
}

/** 批次头闪光粒子（Today today-section-title-sparkle 同款 pop 动效）。 */
function Sparkles({ kind }: { kind: string }) {
  const colors = AMBIENT_COLORS[kind] ?? AMBIENT_COLORS.evening!
  return (
    <span className={css.titleAmbient} aria-hidden="true">
      {SPARKLES.map((p, i) => (
        <svg key={i} className={css.sparkle} viewBox="0 0 21 21" width={p.size} height={p.size}
          style={{ left: p.left, top: p.top, animationDelay: `${p.delay}s`, animationDuration: `${p.dur}s`, ['--sp-op' as string]: p.op }}>
          <path fill={colors[i % colors.length]} d="M10.5 0.8 L11.9 7.2 C12.4 9.6 13.9 11.1 16.3 11.6 L20.2 10.5 L16.3 13 C13.9 13.5 12.4 15 11.9 17.4 L10.5 20.2 L9.1 17.4 C8.6 15 7.1 13.5 4.7 13 L0.8 10.5 L4.7 11.6 C7.1 11.1 8.6 9.6 9.1 7.2 Z" transform="rotate(10 10.5 10.5)" />
        </svg>
      ))}
    </span>
  )
}

/** 晨间太阳氛围（Today morning-bokeh：光晕脉动 + 11 道旋转光线 + 核心，32s 一圈）。 */
function MorningBokeh() {
  const rays = Array.from({ length: 11 }, (_, i) => i * (360 / 11))
  return (
    <span className={css.bokeh} aria-hidden="true">
      <svg viewBox="0 0 96 96" className={css.bokehSpin}>
        {rays.map(a => (
          <line key={a} x1="48" y1="14" x2="48" y2="4" stroke="rgba(255,180,90,.55)" strokeWidth="2.4" strokeLinecap="round" transform={`rotate(${a} 48 48)`} />
        ))}
      </svg>
      <span className={css.bokehHalo} />
      <span className={css.bokehCore} />
    </span>
  )
}

/** 批次区标题（Today section-title 复刻：居中时间小字 + 标题 + 氛围粒子；guidance 用引导标）。 */
function BatchTitle({ ambient, title, time }: { ambient?: string; title: string; time?: string }) {
  return (
    <div className={css.batchHead} data-ambient={ambient || undefined}>
      {ambient === 'guidance'
        ? <span className={css.guidanceMark} aria-hidden="true">◈</span>
        : time ? <span className={css.batchHeadTime}>{time}</span> : null}
      <h3 className={css.batchHeadTitle}>
        {title}
        {ambient === 'morning' ? <MorningBokeh /> : ambient && ambient !== 'welcome' ? <Sparkles kind={ambient} /> : null}
      </h3>
    </div>
  )
}

/** 同一批次的卡片一组；label 已是本地化标题或原文。 */
interface FeedGroup {
  key: string
  label: string
  ambient?: 'morning' | 'evening' | 'welcome' | 'guidance'
  time?: string
  items: FeedItem[]
}

/** 一天的容器：居中日期头（date.absolute 同款「M月D日 · 周X」）+ 各批次组。 */
interface FeedDay {
  day: string
  label: string
  groups: FeedGroup[]
}

/** 批次入场：对齐 data-batch-revealed——滚入视口才置 true，CSS 做上浮淡入。 */
function revealRef(el: HTMLElement | null) {
  if (!el || el.dataset.batchRevealed !== undefined) return
  el.dataset.batchRevealed = 'false'
  const io = new IntersectionObserver(entries => {
    if (entries.some(e => e.isIntersecting)) {
      el.dataset.batchRevealed = 'true'
      io.disconnect()
    }
  }, { rootMargin: '60px' })
  io.observe(el)
}

export function FeedTab({ t, summary, onChanged, actions, renderSlot }: { t: Translate; summary: Summary | null; onChanged: () => void; actions: TodayActions; renderSlot?: TodayPageProps['renderSlot'] }) {
  const [draft, setDraft] = useState('')
  const [posting, setPosting] = useState(false)
  const [visible, setVisible] = useState(PAGE)
  const [seenIds, setSeenIds] = useState<Set<string>>(new Set())
  const [watches, setWatches] = useState<Watch[]>([])
  const [editing, setEditing] = useState(false)
  /** null=日历连接器没装（路由 404）——日程进展卡整条隐藏。 */
  const [events, setEvents] = useState<CalEvent[] | null>(null)
  /** null=mino-brief 没装——候简报行整条隐藏。 */
  const [briefSlots, setBriefSlots] = useState<BriefSlot[] | null>(null)
  /** getLatestBriefPending 对应物：CTA 点到新简报落地（或超时）期间。 */
  const [briefFetching, setBriefFetching] = useState(false)
  const [hintDismissed, setHintDismissed] = useState(() => {
    try { return localStorage.getItem('mino-today.widgetHint.dismissed') === '1' } catch { return false }
  })
  const groupRefs = useRef(new Map<string, HTMLElement>())
  const [inView, setInView] = useState<Set<string>>(new Set())
  const sentinelRef = useRef<HTMLDivElement>(null)
  const now = useNow()

  /** 静默已读：本地记 seenIds 即时消点，后台标读不拉全量刷新。 */
  const markSeen = (id: string) => {
    setSeenIds(prev => {
      if (prev.has(id)) return prev
      const next = new Set(prev); next.add(id); return next
    })
    void api.markRead(id).catch(() => {})
  }
  const readOf = (item: FeedItem) => !!item.read || seenIds.has(item.id)

  useEffect(() => {
    void api.watches().then(r => setWatches(r.watches)).catch(() => {})
    void api.calendarDay(dayKey(new Date())).then(r => setEvents(r.events)).catch(() => setEvents(null))
    void api.briefPrefs().then(r => setBriefSlots(r.slots)).catch(() => setBriefSlots(null))
  }, [summary])

  /** 取稿等待态：新简报卡落地（对应 kind 出现在今日 items）或 120s 超时后清掉。 */
  useEffect(() => {
    if (!briefFetching) return
    const today = dayKey(new Date())
    if (summary?.items.some(i => i.batchKind && Object.values(BRIEF_KIND).includes(i.batchKind) && dayKey(new Date(i.at)) === today)) {
      setBriefFetching(false)
      return
    }
    const timer = setTimeout(() => setBriefFetching(false), 120_000)
    return () => clearTimeout(timer)
  }, [briefFetching, summary])

  const { days, total, windowed } = useMemo(() => {
    if (!summary) return { days: [] as FeedDay[], total: 0, windowed: false }
    const cutoff = Date.now() - WINDOW_DAYS * 86_400_000
    const items = summary.items.filter(i => new Date(i.at).getTime() >= cutoff)
    const dayMap = new Map<string, FeedDay>()
    const groupMap = new Map<string, Map<string, FeedGroup>>()
    for (const item of items) {
      const day = dayKey(new Date(item.at))
      const batch = batchOf(item.at)
      // 分组键：显式 batchKind/batchId 的成批产出优先生成批次组，否则回落时段桶。
      const gkey = item.batchId || item.batchKind ? `批|${item.batchKind ?? ''}|${item.batchId ?? ''}` : batch
      const kindTitle = item.batchKind ? KIND_TITLE[item.batchKind] : undefined
      const label = item.batchKind
        ? (kindTitle ? t(kindTitle) : item.batchKind)
        : item.batchId ?? t(`feed.group.${batch}`)
      const ambient = item.batchKind ? KIND_AMBIENT[item.batchKind] : undefined
      let groups = groupMap.get(day)
      if (!groups) { groups = new Map(); groupMap.set(day, groups) }
      const g = groups.get(gkey) ?? { key: gkey, label, ambient, items: [] }
      g.items.push(item)
      const at = hhmm(item.at)
      if (!g.time || at > g.time) g.time = at
      groups.set(gkey, g)
    }
    for (const [day, groups] of groupMap) {
      const d = new Date(`${day}T00:00:00`)
      const weekday = t(`date.weekday.${['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][d.getDay()]}`)
      const list = [...groups.values()]
      for (const g of list) g.items.sort((a, b) => Number(!!b.pinned) - Number(!!a.pinned))
      // 语义批次在前（对齐 Today 批次装配顺序），时段桶在后；同类内按组内最新时间倒序。
      list.sort((a, b) => Number(!!b.ambient) - Number(!!a.ambient) || (b.time ?? '').localeCompare(a.time ?? ''))
      dayMap.set(day, {
        day,
        label: t('date.dayHeader', { month: d.getMonth() + 1, day: d.getDate(), weekday }),
        groups: list,
      })
    }
    return {
      days: [...dayMap.values()].sort((a, b) => b.day.localeCompare(a.day)),
      total: items.length,
      windowed: items.length < summary.items.length,
    }
  }, [summary, t])

  const shown = useMemo(() => {
    let budget = visible
    return days
      .map(day => {
        const groups = day.groups
          .map(g => {
            const take = Math.min(g.items.length, budget)
            budget -= take
            return take > 0 ? { ...g, items: g.items.slice(0, take) } : null
          })
          .filter((g): g is FeedGroup => g !== null)
        return groups.length ? { ...day, groups } : null
      })
      .filter((d): d is FeedDay => d !== null)
  }, [days, visible])

  const hasMore = total > visible
  useEffect(() => {
    const el = sentinelRef.current
    if (!el || !hasMore) return
    const io = new IntersectionObserver(entries => {
      if (entries.some(e => e.isIntersecting)) setVisible(v => v + PAGE)
    }, { rootMargin: '240px' })
    io.observe(el)
    return () => io.disconnect()
  }, [hasMore])

  /** 批次在视口集合——未读批次胶囊只在对应批次滚出视口时浮现（unreadBatch 语义）。 */
  useEffect(() => {
    const io = new IntersectionObserver(entries => {
      setInView(prev => {
        const next = new Set(prev)
        for (const e of entries) {
          const k = (e.target as HTMLElement).dataset.groupKey
          if (k) e.isIntersecting ? next.add(k) : next.delete(k)
        }
        return next
      })
    }, { rootMargin: '-72px 0px 0px 0px' })
    for (const el of groupRefs.current.values()) io.observe(el)
    return () => io.disconnect()
  }, [shown])

  const unreadGroup = shown
    .flatMap(d => d.groups)
    .find(g => g.items.some(i => !readOf(i)) && !inView.has(g.key))

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

  if (!summary) return <div className={css.loading} />
  return (
    <div>
      {events !== null ? <EventsCard events={events} t={t} now={now} /> : null}

      <h2 className={css.sectionTitle}>
        {t('section.routines')}
        <button type="button" className={css.linkButton} onClick={actions.openSchedules}>{t('section.scheduleAll')} →</button>
      </h2>
      <ScheduleList cards={summary.schedules} t={t} onChanged={onChanged} limit={3} />

      {briefSlots !== null ? (
        <LatestBrief
          t={t}
          slots={briefSlots}
          items={summary.items}
          creating={briefFetching}
          onFetch={() => {
            setBriefFetching(true)
            void actions.sendPrompt('mino-brief', t('brief.fetchPrompt')).then(ok => { if (!ok) setBriefFetching(false) })
          }}
        />
      ) : null}

      <WidgetSection
        t={t}
        watches={watches}
        schedules={summary.schedules}
        actions={actions}
        hintDismissed={hintDismissed}
        onDismissHint={() => { setHintDismissed(true); try { localStorage.setItem('mino-today.widgetHint.dismissed', '1') } catch { /* 私密模式写不进就算了 */ } }}
        onChanged={() => { void api.watches().then(r => setWatches(r.watches)).catch(() => {}) }}
      />

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

      {unreadGroup && !editing ? (
        <button
          type="button"
          className={css.unreadPill}
          onClick={() => {
            groupRefs.current.get(unreadGroup.key)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            // 批次级已读（Today PUT batches/{id}/read 语义）：胶囊点了=这批看过了。
            for (const i of unreadGroup.items) if (!readOf(i)) markSeen(i.id)
          }}
        >{t('feed.newBatchOf', { label: unreadGroup.label })}</button>
      ) : null}

      <div className={css.customizeRow}>
        {editing ? (
          <button type="button" className={css.miniButton} data-active onClick={() => setEditing(false)}>{t('customize.done')}</button>
        ) : (
          <button type="button" className={css.miniButton} onClick={() => setEditing(true)}>{t('customize.edit')}</button>
        )}
      </div>
      {editing ? (
        <div className={css.customizePanel}>
          {renderSlot?.('today.page.customize', {}, {
            fallback: <div className={css.emptyPanel}><p className={css.emptyText}>{t('customize.empty')}</p></div>,
          }) ?? <div className={css.emptyPanel}><p className={css.emptyText}>{t('customize.empty')}</p></div>}
        </div>
      ) : summary.items.length === 0 ? (
        <div className={css.emptyPanel}>
          <div className={css.emptyTitle}>{t('feed.empty.title')}</div>
          <p className={css.emptyText}>{t('feed.empty.body')}</p>
        </div>
      ) : (
        shown.map(day => (
          <div key={day.day} className={css.feedDay}>
            <h2 className={css.dayHead}>{day.label}</h2>
            {day.groups.map(group => (
              <section
                key={group.key}
                className={css.feedGroup}
                data-group-key={group.key}
                data-batch-id={group.key}
                data-batch-kind={group.ambient}
                ref={el => { revealRef(el); if (el) groupRefs.current.set(group.key, el) }}
              >
                <BatchTitle ambient={group.ambient} title={group.label} time={group.time} />
                <ul className={css.feedList}>
                  {group.items.map(item => (
                    <FeedCard
                      key={item.id}
                      item={item}
                      t={t}
                      now={now}
                      actions={actions}
                      read={readOf(item)}
                      onSeen={markSeen}
                      onDelete={id => { void api.deleteItem(id).then(onChanged).catch(() => {}) }}
                      onFeedback={(id, signal) => { void api.feedback(id, signal).then(onChanged).catch(() => {}) }}
                      onPin={(id, pinned) => { void api.setPin(id, pinned).then(onChanged).catch(() => {}) }}
                    />
                  ))}
                </ul>
              </section>
            ))}
          </div>
        ))
      )}
      {summary.items.length > 0 ? (
        hasMore
          ? <div ref={sentinelRef} className={css.feedLoading}>{t('feed.loadingMore')}</div>
          : <p className={css.feedEnd}>{t(windowed ? 'feed.window' : 'feed.end')}</p>
      ) : null}
    </div>
  )
}
