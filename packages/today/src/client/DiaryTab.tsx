/**
 * 「日记」视图：左栏日期（每天一篇，含条数+预览）+ 右栏当天条目。
 * 条目的作者徽标区分米洛写的（带 sessionId）和我写的。
 */
import { useCallback, useEffect, useState } from 'react'
import { api, type DiaryEntry, type DiaryListRow } from './api.ts'
import { dayKey, hhmm } from './shared.tsx'
import type { Translate } from './TodayPage.tsx'
import css from './today.module.css'

function dateTitle(dateKey: string, t: Translate): string {
  if (dateKey === dayKey(new Date())) return t('diary.today')
  const [, m, d] = dateKey.split('-').map(Number)
  return `${m}/${d}`
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
      setSelected(sel => sel ?? res.dates[0]?.date ?? null)
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
  return (
    <div className={css.diaryLayout}>
      <ul className={css.diaryList}>
        {dates.map(row => (
          <li key={row.date}>
            <button
              type="button"
              className={css.diaryDate}
              data-active={row.date === selected}
              onClick={() => setSelected(row.date)}
            >
              <span className={css.diaryDateNum}>{dateTitle(row.date, t)}</span>
              <span className={css.diaryPreview}>{row.preview}</span>
              <span className={css.diaryCount}>{t('diary.entries', { count: row.count })}</span>
            </button>
          </li>
        ))}
      </ul>
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
