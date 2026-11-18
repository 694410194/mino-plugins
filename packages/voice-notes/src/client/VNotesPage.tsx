/** 「语音笔记」main 页：录音控制 + 笔记列表 + 详情（转写/纪要/分享）。 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Translate } from './index.tsx'
import * as api from './api.ts'
import { startRecording, wavToBase64, type Recorder } from './recorder.ts'
import styles from './vnotes.module.css'

export interface VNotesActions {
  refresh: () => void
}

export function VNotesPage({ t }: { t: Translate }) {
  const [notes, setNotes] = useState<api.VNotePublic[]>([])
  const [selected, setSelected] = useState<api.VNotePublic | undefined>()
  const [recording, setRecording] = useState<{ id: string; seconds: number } | undefined>()
  const [error, setError] = useState<string>()
  const [sharePath, setSharePath] = useState<string>()
  const recorderRef = useRef<Recorder | undefined>()
  const seqRef = useRef(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>()

  const refresh = useCallback(async () => {
    try {
      const list = await api.listNotes()
      setNotes(list)
      if (selected) setSelected(list.find(n => n.id === selected.id) ?? selected)
    } catch { /* 列表刷新失败静默 */ }
  }, [selected])

  useEffect(() => {
    void refresh()
    const poll = setInterval(() => void refresh(), 4000)
    return () => clearInterval(poll)
  }, [])

  const begin = async () => {
    setError(undefined)
    try {
      const { id } = (await api.startNote()) as { id: string }
      seqRef.current = 0
      const rec = await startRecording(async (wav, ms) => {
        const seq = seqRef.current++
        await api.uploadSegment(id, seq, wavToBase64(wav), ms)
      })
      recorderRef.current = rec
      setRecording({ id, seconds: 0 })
      timerRef.current = setInterval(() => {
        setRecording(r => (r ? { ...r, seconds: rec.seconds() } : r))
      }, 500)
      void refresh()
    } catch {
      setError(t('record.micDenied'))
    }
  }

  const finish = async () => {
    if (!recording) return
    clearInterval(timerRef.current)
    try {
      await recorderRef.current?.stop()
      recorderRef.current?.dispose()
      recorderRef.current = undefined
      await api.stopNote(recording.id)
    } catch { /* 上传/收尾失败也走清理 */ }
    setRecording(undefined)
    void refresh()
  }

  const share = async (id: string) => {
    try {
      const data = (await api.shareNote(id)) as { path?: string }
      if (data.path) {
        setSharePath(data.path)
        try { await navigator.clipboard.writeText(location.origin + data.path) } catch { /* 剪贴板不可用就只显示 */ }
      }
    } catch { /* 分享失败静默 */ }
  }

  const remove = async (id: string) => {
    try { await api.deleteNote(id) } catch { /* 删除失败静默 */ }
    if (selected?.id === id) setSelected(undefined)
    void refresh()
  }

  const statusLabel = (s: api.VNotePublic['status']) => t(`list.status.${s}` as Parameters<Translate>[0])

  // audioNotes 同款时间分桶：今天 / 昨天 / 更早。
  const grouped = useMemo(() => {
    const dayStart = (iso: string) => { const d = new Date(iso); return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime() }
    const today = dayStart(new Date().toISOString())
    const buckets: { key: 'group.today' | 'group.yesterday' | 'group.earlier'; items: api.VNotePublic[] }[] = [
      { key: 'group.today', items: [] },
      { key: 'group.yesterday', items: [] },
      { key: 'group.earlier', items: [] },
    ]
    for (const n of notes) {
      const d = dayStart(n.createdAt)
      buckets[d >= today ? 0 : d >= today - 86_400_000 ? 1 : 2]!.items.push(n)
    }
    return buckets.filter(b => b.items.length > 0)
  }, [notes])

  return (
    <div className={styles.page}>
      <div className={styles.head}>
        {recording ? (
          <button className={`${styles.btn} ${styles.btnStop}`} onClick={() => void finish()}>
            ● {t('record.recording')} {Math.floor(recording.seconds / 60)}:{String(Math.floor(recording.seconds % 60)).padStart(2, '0')} — {t('record.stop')}
          </button>
        ) : (
          <button className={styles.btn} onClick={() => void begin()}>{t('record.start')}</button>
        )}
        <button className={styles.miniButton} onClick={() => void refresh()}>{t('action.refresh')}</button>
      </div>
      {error && <div className={styles.error}>{error}</div>}
      {sharePath && <div className={styles.share}>{t('share.path')}: <a href={sharePath} target="_blank" rel="noreferrer">{sharePath}</a> · {t('share.copied')}</div>}

      <div className={styles.body}>
        <div className={styles.list}>
          {notes.length === 0 && <div className={styles.empty}>{t('list.empty')}</div>}
          {grouped.map(g => (
            <div key={g.key} className={styles.group}>
              <div className={styles.groupHead}>{t(g.key)}</div>
              {g.items.map(n => (
                <div key={n.id} className={`${styles.row} ${selected?.id === n.id ? styles.rowActive : ''}`}
                  onClick={() => { setSelected(n); void api.getNote(n.id).then(d => d && setSelected(d)) }}>
                  <div className={styles.rowTitle}>{n.title}</div>
                  <div className={styles.rowMeta}>
                    <span className={`${styles.badge} ${styles[`st_${n.status}`]}`}>{statusLabel(n.status)}</span>
                    <span>{n.createdAt.slice(0, 16).replace('T', ' ')}</span>
                    {n.audioSeconds !== undefined && <span>{n.audioSeconds.toFixed(0)}s</span>}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        {selected && (
          <div className={styles.detail}>
            <div className={styles.detailHead}>
              <h2>{selected.title}</h2>
              <div>
                <button className={styles.miniButton} onClick={() => void share(selected.id)}>{t('action.share')}</button>
                <button className={`${styles.miniButton} ${styles.danger}`} onClick={() => void remove(selected.id)}>{t('action.delete')}</button>
              </div>
            </div>
            {selected.error && <div className={styles.error}>{selected.error}</div>}
            {selected.summary && (<><h3>{t('detail.summary')}</h3><pre className={styles.pre}>{selected.summary}</pre></>)}
            <h3>{t('detail.transcript')}</h3>
            <pre className={styles.pre}>{selected.transcript || t('detail.noTranscript')}</pre>
            <h3>{t('detail.audio')}（{selected.segments}）</h3>
            {Array.from({ length: selected.segments }, (_, i) => (
              <audio key={i} controls preload="none" src={`/mino-voice-notes/api/audio?id=${selected.id}&seq=${i}`} className={styles.audio} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
