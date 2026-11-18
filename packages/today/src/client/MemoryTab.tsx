/**
 * 「记忆」视图：皇冠「我对你的了解」卡 + 「全部」分类网格（对齐 Today 记忆页）——
 * 点分类卡=按类筛选出下面的记忆列表。数据仍走 fish-memory 自己的
 * /dsh-fish-memory/list —— 不读它的存储、不 import 它的代码。
 */
import { useCallback, useEffect, useMemo, useState } from 'react'
import { api, type MemoryRow } from './api.ts'
import { relTime, useNow } from './shared.tsx'
import type { Translate } from './TodayPage.tsx'
import css from './today.module.css'

/** 常见分类的图标映射；没见过的类用文件夹。 */
const CAT_ICONS: [RegExp, string][] = [
  [/健康|health|运动|身体/i, '♥'],
  [/工作|work|job|career/i, '⌂'],
  [/财务|finance|钱|账/i, '￥'],
  [/家庭|family|家人/i, '⌂'],
  [/学习|learn|study|读书/i, '✎'],
  [/人际|朋友|social|关系/i, '☺'],
  [/兴趣|hobby|爱好/i, '✦'],
  [/出行|travel|trip|行程/i, '✈'],
  [/信息|偏好|preference|习惯/i, '☰'],
]
const CAT_TONES = ['pink', 'blue', 'amber', 'green', 'violet', 'red'] as const

function catIcon(category: string): string {
  for (const [re, icon] of CAT_ICONS) if (re.test(category)) return icon
  return '▤'
}

function catTone(category: string): string {
  let h = 0
  for (const ch of category) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  return CAT_TONES[h % CAT_TONES.length] ?? 'blue'
}

function MemoryRowView({ row, t, now }: { row: MemoryRow; t: Translate; now: number }) {
  const pct = row.activation === null ? null : Math.round(row.activation * 100)
  return (
    <li className={css.memoryRow}>
      <div className={css.memoryText}>{row.text}</div>
      <div className={css.memoryMeta}>
        {row.sessionTitle ? <span className={css.memorySession}>{row.sessionTitle}</span> : null}
        {row.at ? <span>{relTime(row.at, now)}</span> : null}
        {pct !== null ? (
          <span className={css.fresh}>
            <span className={css.freshBar}><span className={css.freshFill} style={{ width: `${pct}%` }} /></span>
            {t('memory.freshness', { pct })}
          </span>
        ) : null}
      </div>
    </li>
  )
}

export function MemoryTab({ t }: { t: Translate }) {
  const [state, setState] = useState<'loading' | 'missing' | 'error' | MemoryRow[]>('loading')
  const [query, setQuery] = useState('')
  const now = useNow()

  const load = useCallback(() => {
    setState('loading')
    api.memoryList()
      .then(res => {
        const rows: MemoryRow[] = []
        for (const s of res.sessions || []) {
          for (const m of s.memories || []) rows.push({ ...m, sessionTitle: s.title || '' })
        }
        setState(rows)
      })
      .catch(error => setState(error instanceof Error && error.message === '404' ? 'missing' : 'error'))
  }, [])
  useEffect(load, [load])

  const { stable, fading, about, cats, latestAt } = useMemo(() => {
    if (!Array.isArray(state)) {
      return { stable: [] as MemoryRow[], fading: [] as MemoryRow[], about: [] as MemoryRow[], cats: [] as { name: string; count: number }[], latestAt: undefined as string | undefined }
    }
    const q = query.trim().toLowerCase()
    const match = (r: MemoryRow) => !q
      || r.text.toLowerCase().includes(q)
      || (r.category ?? '').toLowerCase().includes(q)
      || (r.sessionTitle ?? '').toLowerCase().includes(q)
    const filtered = state.filter(match)
    const stable = filtered.filter(r => r.freshKind === 'fact')
    const fading = filtered
      .filter(r => r.freshKind !== 'fact')
      .sort((a, b) => (b.activation ?? 0) - (a.activation ?? 0))
    const about = [...state].sort((a, b) => (b.importance ?? 0) - (a.importance ?? 0)).slice(0, 6)
    const byCat = new Map<string, number>()
    for (const r of state) {
      const c = (r.category ?? '').trim() || '—'
      byCat.set(c, (byCat.get(c) ?? 0) + 1)
    }
    const cats = [...byCat.entries()].map(([name, count]) => ({ name, count }))
    cats.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    const latestAt = state.map(r => r.at).filter((a): a is string => Boolean(a)).sort().at(-1)
    return { stable, fading, about, cats, latestAt }
  }, [state, query])

  const titleRow = (
    <div className={css.pageTitleRow}>
      <h2 className={css.pageTitle}>{t('tab.memory')}</h2>
      <input
        className={css.searchInput}
        value={query}
        placeholder={t('memory.search')}
        onChange={e => setQuery(e.target.value)}
      />
    </div>
  )

  if (state === 'loading') return <div>{titleRow}<p className={css.sectionHint}>{t('memory.loading')}</p></div>
  if (state === 'missing') {
    return (
      <div>
        {titleRow}
        <div className={css.emptyPanel}>
          <div className={css.emptyTitle}>{t('memory.missing.title')}</div>
          <p className={css.emptyText}>{t('memory.missing.body')}</p>
        </div>
      </div>
    )
  }
  if (state === 'error') return <div>{titleRow}<button type="button" className={css.errorBox} onClick={load}>{t('error.load')}</button></div>

  return (
    <div>
      {titleRow}

      {state.length === 0 ? <p className={css.sectionHint}>{t('memory.empty')}</p> : null}

      {!query && about.length > 0 ? (
        <section className={css.aboutCard}>
          <span className={css.aboutCrown}>♛</span>
          <h3 className={css.aboutTitle}>{t('memory.about')}</h3>
          {latestAt ? <div className={css.aboutMeta}>{t('memory.updated', { time: relTime(latestAt, now) })}</div> : null}
          <div className={css.aboutLabel}>{t('memory.summary')}</div>
          <ul className={css.aboutList}>
            {about.map(r => <li key={r.id} className={css.aboutItem}>{r.text}</li>)}
          </ul>
        </section>
      ) : null}
      {!query && about.length === 0 && state.length > 0 ? (
        <p className={css.sectionHint}>{t('memory.aboutEmpty')}</p>
      ) : null}

      <div className={css.sectionRow}>
        <h3 className={css.recoTitle}>
          {t('memory.all')} <span className={css.countNote}>{t('memory.count', { count: state.length })}</span>
        </h3>
      </div>

      {!query && cats.length > 0 ? (
        <ul className={css.catGrid}>
          {cats.map(c => (
            <li key={c.name}>
              <button
                type="button"
                className={css.catCard}
                onClick={() => setQuery(c.name === '—' ? '' : c.name)}
              >
                <span className={css.catIcon} data-tone={catTone(c.name)}>{catIcon(c.name)}</span>
                <span className={css.catName}>{c.name === '—' ? t('memory.catOther') : c.name}</span>
                <span className={css.catCount}>{t('memory.catCount', { count: c.count })}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {query && stable.length === 0 && fading.length === 0 ? (
        <p className={css.sectionHint}>{t('memory.noMatch')}</p>
      ) : (
        <>
          {stable.length > 0 ? (
            <section className={css.feedGroup}>
              <header className={css.feedGroupHead}>
                <span className={css.feedGroupKind}>{t('memory.stable')}</span>
                <span className={css.feedGroupDivider}>·</span>
                <span className={css.feedGroupCount}>{t('memory.count', { count: stable.length })}</span>
              </header>
              <ul className={css.memoryList}>{stable.map(r => <MemoryRowView key={r.id} row={r} t={t} now={now} />)}</ul>
            </section>
          ) : null}
          {fading.length > 0 ? (
            <section className={css.feedGroup}>
              <header className={css.feedGroupHead}>
                <span className={css.feedGroupKind}>{t('memory.fading')}</span>
                <span className={css.feedGroupDivider}>·</span>
                <span className={css.feedGroupCount}>{t('memory.count', { count: fading.length })}</span>
              </header>
              <ul className={css.memoryList}>{fading.map(r => <MemoryRowView key={r.id} row={r} t={t} now={now} />)}</ul>
            </section>
          ) : null}
        </>
      )}
    </div>
  )
}
