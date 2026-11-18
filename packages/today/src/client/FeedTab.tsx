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
import { api, type FeedCard as FeedCardBody, type FeedItem, type ScheduleCard, type Summary, type Watch } from './api.ts'
import { batchOf, dayKey, edgeGlowHandlers, hhmm, relTime, useNow } from './shared.tsx'
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

/** 同一批次的卡片一组：晨间/下午/晚间 + 日期，对齐 Today 的简报批次头。 */
interface FeedGroup {
  key: string
  label: string
  items: FeedItem[]
}

/** 批次入场：对齐 data-batch-revealed——滚入视口才置 true，CSS 做上浮淡入。 */
function revealRef(el: HTMLElement | null) {
  if (!el || el.dataset.revealed !== undefined) return
  el.dataset.revealed = 'false'
  const io = new IntersectionObserver(entries => {
    if (entries.some(e => e.isIntersecting)) {
      el.dataset.revealed = 'true'
      io.disconnect()
    }
  }, { rootMargin: '60px' })
  io.observe(el)
}

export function FeedTab({ t, summary, onChanged, actions }: { t: Translate; summary: Summary | null; onChanged: () => void; actions: TodayActions }) {
  const [draft, setDraft] = useState('')
  const [posting, setPosting] = useState(false)
  const [visible, setVisible] = useState(PAGE)
  const [seenIds, setSeenIds] = useState<Set<string>>(new Set())
  const [watches, setWatches] = useState<Watch[]>([])
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
  }, [summary])

  const { groups, total, windowed } = useMemo(() => {
    const groups: FeedGroup[] = []
    if (!summary) return { groups, total: 0, windowed: false }
    const cutoff = Date.now() - WINDOW_DAYS * 86_400_000
    const items = summary.items.filter(i => new Date(i.at).getTime() >= cutoff)
    const map = new Map<string, FeedGroup>()
    for (const item of items) {
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
    groups.push(...[...map.values()].sort((a, b) => b.key.localeCompare(a.key)))
    return { groups, total: items.length, windowed: items.length < summary.items.length }
  }, [summary, t])

  const shown = useMemo(() => {
    let budget = visible
    return groups
      .map(g => {
        const take = Math.min(g.items.length, budget)
        budget -= take
        return take > 0 ? { ...g, items: g.items.slice(0, take) } : null
      })
      .filter((g): g is FeedGroup => g !== null)
  }, [groups, visible])

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
      <h2 className={css.sectionTitle}>
        {t('section.schedule')}
        <button type="button" className={css.linkButton} onClick={actions.openSchedules}>{t('section.scheduleAll')} →</button>
      </h2>
      <ScheduleList cards={summary.schedules} t={t} onChanged={onChanged} limit={3} />

      {watches.length > 0 ? (
        <>
          <h2 className={css.sectionTitle}>{t('section.watches')}</h2>
          <ul className={css.scheduleList}>
            {watches.map(w => {
              const sched = summary.schedules.find(s => s.id === w.scheduleId)
              return (
                <li key={w.id} className={css.scheduleRow} data-status={w.enabled ? 'active' : 'paused'}>
                  <span className={css.scheduleDot} data-status={w.enabled ? 'active' : 'paused'} />
                  <span className={css.scheduleTitle}>{w.topic}</span>
                  {!w.enabled ? <span className={css.chip} data-tone="paused">{t('schedule.status.paused')}</span> : null}
                  <span className={css.scheduleTime}>{sched?.nextAt ? nextRunLabel(sched, t) : t('watch.manual')}</span>
                </li>
              )
            })}
          </ul>
        </>
      ) : null}

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
        shown.map(group => (
          <section key={group.key} className={css.feedGroup} ref={revealRef}>
            <header className={css.feedGroupHead}>
              <span className={css.feedGroupKind}>{group.label}</span>
              {group.items.some(i => !readOf(i)) ? <span className={css.newBadge}>{t('feed.newBatch')}</span> : null}
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
                  read={readOf(item)}
                  onSeen={markSeen}
                  onDelete={id => { void api.deleteItem(id).then(onChanged).catch(() => {}) }}
                  onFeedback={(id, signal) => { void api.feedback(id, signal).then(onChanged).catch(() => {}) }}
                  onPin={(id, pinned) => { void api.setPin(id, pinned).then(onChanged).catch(() => {}) }}
                />
              ))}
            </ul>
          </section>
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
