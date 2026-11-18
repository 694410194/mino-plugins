/**
 * `today_post` 的会话内工具结果卡——走官方 `tool.call.toolview` keyed 槽。
 * 只消费 owner props 里的 argsRaw / content，不读 mino-today 私有 store，
 * 与 feed 卡片样式独立（会话内是紧凑行，不是整卡）。
 */
import type { Translate } from './TodayPage.tsx'
import css from './today.module.css'

/** `tool.call.toolview` owner props 的结构面（官方 ToolCallOwnerProps 的最小子集）。 */
export interface ToolViewProps {
  phase: 'preparing' | 'start' | 'result'
  block: {
    argsRaw?: string
    call?: { name: string; argsRaw: string } | null
    isError?: boolean
    content?: readonly { type: string; text?: string }[]
  }
  t: Translate
}

interface PostArgs {
  title?: string
  summary?: string
  items?: string[]
  card?: { type: string; items?: string[]; value?: string | number; label?: string; done?: number; total?: number }
  batch?: string
}

function parseArgs(raw: string | undefined): PostArgs | null {
  if (!raw) return null
  try {
    const v = JSON.parse(raw)
    return v && typeof v === 'object' ? v as PostArgs : null
  } catch {
    return null
  }
}

function CardBody({ card }: { card: NonNullable<PostArgs['card']> }): JSX.Element | null {
  if (card.type === 'list' && Array.isArray(card.items)) {
    return <ul className={css.tvList}>{card.items.slice(0, 5).map((it, i) => <li key={i}>{it}</li>)}</ul>
  }
  if (card.type === 'metric' && card.value !== undefined) {
    return (
      <div className={css.tvMetric}>
        <span className={css.tvMetricValue}>{String(card.value)}</span>
        {card.label ? <span className={css.tvMetricLabel}>{card.label}</span> : null}
      </div>
    )
  }
  if (card.type === 'progress' && typeof card.done === 'number' && typeof card.total === 'number' && card.total > 0) {
    const pct = Math.min(100, Math.round((card.done / card.total) * 100))
    return (
      <div className={css.tvProgress}>
        <div className={css.tvProgressBar}><div className={css.tvProgressFill} style={{ width: `${pct}%` }} /></div>
        <span className={css.tvProgressText}>{card.done}/{card.total}{card.label ? ` · ${card.label}` : ''}</span>
      </div>
    )
  }
  return null
}

export function TodayPostRow(props: ToolViewProps): JSX.Element {
  const { t } = props
  const raw = props.phase === 'result' ? props.block.call?.argsRaw : props.block.argsRaw
  const args = parseArgs(raw)
  const failed = props.phase === 'result' && props.block.isError === true
  const errorText = failed
    ? (props.block.content ?? []).map(b => b.text ?? '').join(' ').trim()
    : ''
  return (
    <div className={css.tvRow} data-error={failed || undefined}>
      <div className={css.tvHead}>
        <span className={css.tvBadge}>{t('tv.badge')}</span>
        <span className={css.tvTitle}>{args?.title ?? t('tv.untitled')}</span>
        {args?.batch ? <span className={css.tvBatch}>{args.batch}</span> : null}
        <span className={css.tvState}>
          {failed ? t('tv.failed') : props.phase === 'result' ? t('tv.posted') : t('tv.posting')}
        </span>
      </div>
      {args?.summary ? <div className={css.tvSummary}>{args.summary}</div> : null}
      {Array.isArray(args?.items) && args.items.length > 0
        ? <ul className={css.tvList}>{args.items.slice(0, 5).map((it, i) => <li key={i}>{it}</li>)}</ul>
        : null}
      {args?.card ? <CardBody card={args.card} /> : null}
      {failed && errorText ? <div className={css.tvError}>{errorText}</div> : null}
    </div>
  )
}
