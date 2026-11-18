/**
 * 「日记」视图：按月分组的双列瀑布卡（周几+日号徽章 + 标题 + 摘要，
 * 对齐 Today 的日记页）；点卡进当天详情（回退圆钮 + 条目列表 + 写入框）。
 * 条目的作者徽标区分米洛写的（带 sessionId）和我写的。
 */
import { useCallback, useEffect, useMemo, useState } from 'react'
import { api, type DiaryEntry, type DiaryListRow } from './api.ts'
import { dayKey, hhmm } from './shared.tsx'
import type { Translate } from './TodayPage.tsx'
import css from './today.module.css'

/** 徽章顶部条的淡彩轮转（视觉，不是文案）。 */
const BADGE_TONES = ['blue', 'peach', 'violet', 'green', 'pink', 'amber'] as const

function weekdayShort(dateKey: string): string {
  return new Date(`${dateKey}T00:00:00`).toLocaleDateString(undefined, { weekday: 'short' })
}

function monthLabel(dateKey: string): string {
  const [y = 0, m = 1] = dateKey.split('-').map(Number)
  return new Date(y, m - 1).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })
}

/** 预览文本拆「标题 + 摘要」：第一处分句前当标题，余下当摘要。 */
function splitPreview(preview: string): { title: string; body: string } {
  const text = preview.trim()
  const cut = text.search(/[。！？!?\n]/)
  if (cut <= 0 || cut > 24) return { title: text.slice(0, 24), body: text.slice(24).trim() }
  return { title: text.slice(0, cut), body: text.slice(cut + 1).trim() }
}

function DiaryGrid({ dates, t, onOpen }: { dates: DiaryListRow[]; t: Translate; onOpen: (date: string) => void }) {
  const months = useMemo(() => {
    const map = new Map<string, DiaryListRow[]>()
    for (const row of dates) {
      const key = row.date.slice(0, 7)
      const list = map.get(key) ?? []
      list.push(row)
      map.set(key, list)
    }
    return [...map.entries()].sort((a, b) => b[0].localeCompare(a[0]))
  }, [dates])
  return (
    <>
      {months.map(([month, rows]) => (
        <section key={month}>
          <h3 className={css.monthHead}>{monthLabel(`${month}-01`)}</h3>
          <ul className={css.diaryGrid}>
            {[...rows].sort((a, b) => b.date.localeCompare(a.date)).map((row, i) => {
              const { title, body } = splitPreview(row.preview)
              return (
                <li key={row.date}>
                  <button type="button" className={css.diaryCard} onClick={() => onOpen(row.date)}>
                    <span className={css.diaryBadge} data-tone={BADGE_TONES[i % BADGE_TONES.length]}>
                      <span className={css.diaryBadgeWeek}>{weekdayShort(row.date)}</span>
                      <span className={css.diaryBadgeDay}>{Number(row.date.slice(8, 10))}</span>
                    </span>
                    <span className={css.diaryCardTitle}>{row.date === dayKey(new Date()) ? t('diary.today') : title}</span>
                    {body ? <span className={css.diaryCardBody}>{body}</span> : null}
                    {row.count > 1 ? <span className={css.diaryCardCount}>{t('diary.entries', { count: row.count })}</span> : null}
                  </button>
                </li>
              )
            })}
          </ul>
        </section>
      ))}
    </>
  )
}

export function DiaryTab({ t }: { t: Translate }) {
  const [dates, setDates] = useState<DiaryListRow[] | null>(null)
  const [failed, setFailed] = useState(false)
  const [selected, setSelected] = useState<string | null>(null)
  const [entries, setEntries] = useState<DiaryEntry[] | null>(null)
  const [draft, setDraft] = useState('')
  const [posting, setPosting] = useState(false)

  const loadDates = useCallback(() => {
    setFailed(false)
    api.diaries().then(res => {
      setDates(res.dates)
    }).catch(() => setFailed(true))
  }, [])
  useEffect(loadDates, [loadDates])

  useEffect(() => {
    if (!selected) { setEntries(null); return }
    setEntries(null)
    api.diary(selected).then(res => setEntries(res.entries)).catch(() => setEntries([]))
  }, [selected])

  const submit = async () => {
    const text = draft.trim()
    if (!text || posting) return
    setPosting(true)
    try {
      const res = await api.addDiary(text, selected ?? undefined)
      setDraft('')
      setSelected(res.date)
      loadDates()
      const detail = await api.diary(res.date)
      setEntries(detail.entries)
    } catch { /* 失败保留草稿 */ } finally {
      setPosting(false)
    }
  }

  const composer = (
    <div className={css.quickAdd}>
      <input
        className={css.quickInput}
        value={draft}
        placeholder={t('diary.addPlaceholder')}
        onChange={e => setDraft(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') void submit() }}
      />
      <button type="button" className={css.quickButton} disabled={!draft.trim() || posting} onClick={() => void submit()}>
        {t('diary.add')}
      </button>
    </div>
  )

  if (failed) return <button type="button" className={css.errorBox} onClick={loadDates}>{t('error.load')}</button>
  if (!dates) return <div className={css.loading} />
  if (dates.length === 0) {
    return (
      <div className={css.emptyPanel}>
        <div className={css.emptyTitle}>{t('diary.empty.title')}</div>
        <p className={css.emptyText}>{t('diary.empty.body')}</p>
        <div style={{ marginTop: 12 }}>{composer}</div>
      </div>
    )
  }

  if (selected) {
    return (
      <div>
        <div className={css.pageTitleRow}>
          <button type="button" className={css.backButton} aria-label={t('diary.back')} onClick={() => setSelected(null)}>‹</button>
          <h2 className={css.pageTitle}>{monthLabel(`${selected.slice(0, 7)}-01`)}</h2>
        </div>
        <div className={css.diaryDetail}>
          {entries === null ? <div className={css.loading} /> : (
            <>
              {entries.length === 0 ? <p className={css.sectionHint}>{t('diary.empty.body')}</p> : (
                <ul className={css.diaryEntries}>
                  {entries.map(entry => (
                    <li key={entry.at} className={css.diaryEntry}>
                      <span className={css.diaryTime}>{hhmm(entry.at)}</span>
                      <div className={css.diaryBody}>
                        <span className={css.authorBadge} data-author={entry.sessionId ? 'agent' : 'me'}>
                          {entry.sessionId ? t('diary.author.agent') : t('diary.author.me')}
                        </span>
                        <span className={css.diaryText}>{entry.text}</span>
                      </div>
                      <button
                        type="button"
                        className={css.iconButton}
                        title={t('diary.delete')}
                        onClick={() => {
                          if (!selected) return
                          void api.deleteDiaryEntry(selected, entry.at).then(() => {
                            setEntries(cur => cur ? cur.filter(e => e.at !== entry.at) : cur)
                            loadDates()
                          }).catch(() => {})
                        }}
                      >×</button>
                    </li>
                  ))}
                </ul>
              )}
              {composer}
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className={css.pageTitleRow}>
        <h2 className={css.pageTitle}>{t('tab.diary')}</h2>
      </div>
      <DiaryGrid dates={dates} t={t} onOpen={setSelected} />
    </div>
  )
}
