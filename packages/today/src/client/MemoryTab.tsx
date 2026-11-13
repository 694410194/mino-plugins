/**
 * 「记忆」视图：关于你（高置信稳定记忆卡）+ 搜索 + 稳定/消退分组。
 * 数据仍走 fish-memory 自己的 /dsh-fish-memory/list —— 不读它的存储、不 import 它的代码。
 */
import { useCallback, useEffect, useMemo, useState } from 'react'
import { api, type MemoryRow } from './api.ts'
import { relTime, useNow } from './shared.tsx'
import type { Translate } from './TodayPage.tsx'
import css from './today.module.css'

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

  const { stable, fading, about } = useMemo(() => {
    if (!Array.isArray(state)) return { stable: [] as MemoryRow[], fading: [] as MemoryRow[], about: [] as MemoryRow[] }
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
    const about = [...stable].sort((a, b) => (b.importance ?? 0) - (a.importance ?? 0)).slice(0, 6)
    return { stable, fading, about }
  }, [state, query])

  if (state === 'loading') return <p className={css.sectionHint}>{t('memory.loading')}</p>
  if (state === 'missing') {
    return (
      <div className={css.emptyPanel}>
        <div className={css.emptyTitle}>{t('memory.missing.title')}</div>
        <p className={css.emptyText}>{t('memory.missing.body')}</p>
      </div>
    )
  }
  if (state === 'error') return <button type="button" className={css.errorBox} onClick={load}>{t('error.load')}</button>
  if (state.length === 0) return <p className={css.sectionHint}>{t('memory.empty')}</p>

  return (
    <div>
      {!query ? (
        <section className={css.aboutCard}>
          <h2 className={css.aboutTitle}>{t('memory.about')}</h2>
          {about.length === 0 ? (
            <p className={css.aboutHint}>{t('memory.aboutEmpty')}</p>
          ) : (
            <ul className={css.aboutList}>
              {about.map(r => <li key={r.id} className={css.aboutItem}>{r.text}</li>)}
            </ul>
          )}
        </section>
      ) : null}

      <div className={css.sectionRow}>
        <h2 className={css.sectionTitle}>{t('memory.all')} <span className={css.countNote}>{t('memory.count', { count: state.length })}</span></h2>
        <input
          className={css.searchInput}
          value={query}
          placeholder={t('memory.search')}
          onChange={e => setQuery(e.target.value)}
        />
      </div>

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
