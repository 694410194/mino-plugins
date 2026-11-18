/** 早晚报偏好编辑卡（Today briefEditor 复刻）：内容偏好 + 推送开关 + 推送时间。 */
import { useEffect, useState } from 'react'
import { api, type PrefsSlot } from './api.ts'
import type { Translate } from './index.tsx'
import css from './brief.module.css'

interface Draft { preference: string; enabled: boolean; time: string }

function SlotEditor({ slot, t, onSaved }: { slot: PrefsSlot; t: Translate; onSaved: () => void }) {
  const [draft, setDraft] = useState<Draft>({ preference: slot.preference, enabled: slot.enabled, time: slot.time })
  const [saving, setSaving] = useState(false)
  const [savedHint, setSavedHint] = useState('')
  useEffect(() => setDraft({ preference: slot.preference, enabled: slot.enabled, time: slot.time }), [slot])
  const dirty = draft.preference !== slot.preference || draft.enabled !== slot.enabled || draft.time !== slot.time
  const save = () => {
    setSaving(true)
    setSavedHint('')
    void api.savePrefs({ slot: slot.slot, preference: draft.preference, enabled: draft.enabled, time: draft.time })
      .then(() => {
        setSavedHint(t('editor.saved', { name: t(`editor.${slot.slot}`) }))
        onSaved()
      })
      .catch(() => setSavedHint(t('editor.failed')))
      .finally(() => setSaving(false))
  }
  return (
    <section className={css.slot}>
      <header className={css.slotHead}>
        <span className={css.slotName}>{t(`editor.${slot.slot}`)}</span>
        <label className={css.switch}>
          <input
            type="checkbox"
            checked={draft.enabled}
            onChange={e => setDraft(d => ({ ...d, enabled: e.target.checked }))}
          />
          <span className={css.switchTrack}><span className={css.switchThumb} /></span>
          <span className={css.switchLabel}>{t('editor.pushEnabled')}</span>
        </label>
      </header>
      <p className={css.slotDesc}>{t(`editor.desc.${slot.slot}`)}</p>
      <label className={css.field}>
        <span className={css.fieldLabel}>{t('editor.preferenceLabel')}</span>
        <textarea
          className={css.fieldInput}
          rows={3}
          value={draft.preference}
          placeholder={t('editor.preferencePlaceholder')}
          onChange={e => setDraft(d => ({ ...d, preference: e.target.value }))}
        />
      </label>
      <label className={css.field}>
        <span className={css.fieldLabel}>{t('editor.pushTime')}</span>
        <input
          className={css.timeInput}
          type="time"
          value={draft.time}
          onChange={e => setDraft(d => ({ ...d, time: e.target.value }))}
        />
        <span className={css.fieldHint}>{t('editor.dailyAt', { time: draft.time || '—' })}</span>
      </label>
      <footer className={css.slotFoot}>
        {savedHint ? <span className={css.savedHint}>{savedHint}</span> : null}
        <button type="button" className={css.saveButton} disabled={!dirty || saving} onClick={save}>
          {saving ? t('editor.saving') : t('editor.save')}
        </button>
      </footer>
    </section>
  )
}

export function BriefEditor({ t }: { t?: Translate }) {
  const tr = t ?? ((k: string) => k)
  const [slots, setSlots] = useState<PrefsSlot[] | null>(null)
  const [failed, setFailed] = useState(false)
  const load = () => {
    api.prefs()
      .then(r => { setSlots(r.slots); setFailed(false) })
      .catch(() => setFailed(true))
  }
  useEffect(load, [])
  return (
    <div className={css.editor}>
      <h3 className={css.title}>{tr('editor.title')}</h3>
      {failed ? (
        <p className={css.hint}>
          {tr('editor.loadFailed')}{' '}
          <button type="button" className={css.retry} onClick={load}>{tr('editor.retry')}</button>
        </p>
      ) : slots === null ? (
        <p className={css.hint}>{tr('editor.loading')}</p>
      ) : slots.length === 0 ? (
        <p className={css.hint}>{tr('editor.empty')}</p>
      ) : (
        slots.map(s => <SlotEditor key={s.slot} slot={s} t={tr} onSaved={load} />)
      )}
    </div>
  )
}
