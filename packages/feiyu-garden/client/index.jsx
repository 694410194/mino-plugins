// mino-feiyu-garden 浏览器半片：侧栏「海蒂花园」行 + main 全局面板。
// 注册走官方 slots 缝：main(keyed) + sidebar.panellist(list)。
import React from 'react'
import { Ocean, resolveScene, SCENES } from './scene.jsx'
import { Whale } from './whale.jsx'
import { t, useLang } from './i18n.js'
import css from './styles.css'

const PANEL_ID = 'feiyu-garden'
// 文档相对基址（issue #1707）：页面以 <base href="./"> 提供，省掉前导斜杠
const API = 'api/feiyu-garden'

// ---------------------------------------------------------------- 数据

const clamp = (v) => Math.min(100, Math.max(0, v))

function levelOf(exp) {
  let lv = 1
  while (exp >= lv * lv * 40) lv += 1
  const floor = (lv - 1) * (lv - 1) * 40
  return { level: lv, into: exp - floor, span: lv * lv * 40 - floor }
}

function moodLabel(score) {
  if (score >= 85) return '雀跃'
  if (score >= 65) return '开心'
  if (score >= 45) return '平静'
  if (score >= 25) return '蔫蔫'
  return '委屈'
}

// 乐观预览：同步落地前先让海面亮起来，形状与 host publicState 一致
function preview() {
  return {
    preview: true,
    name: '小肥', createdAt: new Date().toISOString(), exp: 0,
    level: 1, levelInto: 0, levelSpan: 40,
    mood: 72, moodLabel: '开心', satiety: 64, tokensFed: 0,
    scene: 'auto', settings: { reduceMotion: false, chime: true },
    stats: { pets: 0, feeds: 0, sessions: 0, minutesTogether: 0 },
    log: [{ id: 'preview', at: new Date().toISOString(), kind: 'born', text: '她游进了海蒂花园' }],
  }
}

function say(s, kind, text) {
  return { ...s, log: [{ id: `opt_${Date.now().toString(36)}`, at: new Date().toISOString(), kind, text }, ...s.log] }
}

function bumpExp(s, n) {
  const exp = s.exp + n
  const lv = levelOf(exp)
  return { ...s, exp, level: lv.level, levelInto: lv.into, levelSpan: lv.span }
}

// 本地即时回写；服务端回包到达后整体替换为权威态
const OPTIMISTIC = {
  feed(s) { const mood = clamp(s.mood + 6); return say(bumpExp({ ...s, mood, moodLabel: moodLabel(mood), satiety: clamp(s.satiety + 25), tokensFed: s.tokensFed + 15, stats: { ...s.stats, feeds: s.stats.feeds + 1 } }, 15), 'feed', '你喂了她一把鱼粮') },
  pet(s) { return say(bumpExp({ ...s, mood: clamp(s.mood + 10), moodLabel: moodLabel(clamp(s.mood + 10)), stats: { ...s.stats, pets: s.stats.pets + 1 } }, 8), 'pet', '你摸了摸她的头，她眯起了眼睛') },
  rename(s, b) { return { ...s, name: String(b.name ?? s.name).slice(0, 12) } },
  scene(s, b) { return { ...s, scene: b.scene ?? s.scene } },
  settings(s, b) { return { ...s, settings: { ...s.settings, ...b } } },
}

async function api(path, body) {
  const res = await fetch(`${API}${path}`, body ? {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  } : undefined)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

// apply 时即建：首抓在页面初始化阶段发出（彼时 socket 池尚有闲位），
// 此后请求靠 in-flight 去重，绝不叠加排队。
function createGarden() {
  const listeners = new Set()
  let snap = { data: null, error: null, syncing: true }
  let inflight = null
  let retryTimer = 0

  const emit = () => {
    snap = { ...snap }
    listeners.forEach(fn => fn())
  }

  const refresh = () => {
    if (inflight) return inflight
    inflight = api('/state')
      .then((data) => { snap = { data, error: null, syncing: false } })
      .catch((e) => {
        snap = { ...snap, error: String(e?.message ?? e), syncing: false }
        // 尚未成功过就接着试（路由未挂载/短暂拥挤都靠它自愈）
        if (!snap.data) retryTimer = setTimeout(() => { retryTimer = 0; refresh() }, 8_000)
      })
      .finally(() => { inflight = null; emit() })
    return inflight
  }

  refresh()

  return {
    subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn) },
    get: () => snap,
    refresh,
    dispose() { clearTimeout(retryTimer); listeners.clear() },
    act(type, extra = {}) {
      const optimistic = OPTIMISTIC[type]
      if (optimistic && snap.data) {
        snap = { ...snap, data: optimistic(snap.data, extra) }
        emit()
      }
      api('/action', { type, ...extra })
        .then((r) => { if (r?.state) { snap = { ...snap, data: r.state, error: null }; emit() } })
        .catch(() => { snap = { ...snap, error: 'sync' }; emit() })
      return { burst: type === 'feed' || type === 'pet' ? type : null }
    },
  }
}

function useGarden(store) {
  const [snap, setSnap] = React.useState(store.get())
  React.useEffect(() => store.subscribe(() => setSnap(store.get())), [store])
  React.useEffect(() => {
    const timer = setInterval(() => { if (!document.hidden) store.refresh() }, 45_000)
    const onVis = () => { if (!document.hidden) store.refresh() }
    document.addEventListener('visibilitychange', onVis)
    return () => { clearInterval(timer); document.removeEventListener('visibilitychange', onVis) }
  }, [store])
  const act = React.useCallback((type, extra = {}) => store.act(type, extra), [store])
  return { data: snap.data, error: snap.error, syncing: snap.syncing, load: store.refresh, act }
}

// ---------------------------------------------------------------- 小件

function Ring({ value, label, tone }) {
  const R = 26, C = 2 * Math.PI * R
  return (
    <div className="fg-ring" title={label}>
      <svg viewBox="0 0 64 64">
        <circle className="fg-ring-bg" cx="32" cy="32" r={R} />
        <circle className={`fg-ring-fg fg-tone-${tone}`} cx="32" cy="32" r={R}
          strokeDasharray={C} strokeDashoffset={C * (1 - Math.min(1, value / 100))} />
        <text x="32" y="37" className="fg-ring-num">{Math.round(value)}</text>
      </svg>
      <span>{label}</span>
    </div>
  )
}

const LOG_ICON = {
  born: '🌊', feed: '⚡', pet: '💗', level: '✨', rename: '✏️', companion: '🐋',
}

function relTime(at) {
  const diff = Date.now() - new Date(at).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return t('刚刚')
  if (m < 60) return `${m} ${t('分钟前')}`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} ${t('小时前')}`
  const d = Math.floor(h / 24)
  if (d < 7) return `${d} ${t('天前')}`
  const dt = new Date(at)
  return `${dt.getMonth() + 1}/${dt.getDate()}`
}

// ---------------------------------------------------------------- 页

function Garden({ store }) {
  useLang()
  const { data: raw, error, syncing, load, act } = useGarden(store)
  const data = raw ?? preview()
  const [burst, setBurst] = React.useState(null)
  const [flipped, setFlipped] = React.useState(false)
  const [renaming, setRenaming] = React.useState(false)
  const [nameDraft, setNameDraft] = React.useState('')
  const [settingsOpen, setSettingsOpen] = React.useState(false)
  const rootRef = React.useRef(null)
  const [width, setWidth] = React.useState(1280)

  React.useEffect(() => {
    const el = rootRef.current
    if (!el) return undefined
    const ob = new ResizeObserver(([e]) => setWidth(e.contentRect.width))
    ob.observe(el)
    return () => ob.disconnect()
  }, [])

  // 鲸鱼偶尔换向
  React.useEffect(() => {
    const timer = setInterval(() => setFlipped(f => !f), 14000)
    return () => clearInterval(timer)
  }, [])

  const fire = React.useCallback((type) => {
    const r = act(type)
    if (r.burst) {
      setBurst(r.burst)
      setTimeout(() => setBurst(null), 1800)
    }
  }, [act])

  const scene = resolveScene(data?.scene)
  const reduce = Boolean(data?.settings?.reduceMotion)

  if (error && !raw && error !== 'sync') {
    return (
      <div className="fg-root" ref={rootRef}>
        <style>{css}</style>
        <div className="fg-fail">
          <p>{t('花园加载失败')}：{error}</p>
          <button type="button" className="fg-btn" onClick={load}>{t('重试')}</button>
        </div>
      </div>
    )
  }

  return (
    <div className={`fg-root fg-scene-${scene} ${reduce ? 'fg-reduce' : ''} ${width < 900 ? 'is-narrow' : ''}`} ref={rootRef}>
      <style>{css}</style>
      <Ocean scene={scene} />

      {/* 鲸鱼舞台位 */}
      <div className="fg-stage">
        <Whale mood={data.mood} burst={burst} scene={scene} flipped={flipped} />
        <div className="fg-stage-name">
          <span className="fg-name">{data.name}</span>
          <span className="fg-lv">Lv.{data.level}</span>
          <span className={`fg-moodchip fg-mood-${data.moodLabel}`}>{t(data.moodLabel)}</span>
        </div>
      </div>

      {/* 右侧玻璃栏 */}
      <aside className="fg-rail">
        <header className="fg-head">
          <div>
            <h1>{t('海蒂花园')}</h1>
            <p>{t('她的小海，你的花园')}</p>
          </div>
          {(syncing || error === 'sync') && (
            <span className={`fg-sync ${error ? 'is-lost' : ''}`} title={t(error ? '同步失败，仍在重试' : '正在同步')}>
              {t(error ? '离线' : '同步中')}
            </span>
          )}
          <button type="button" className="fg-gear" aria-label={t('设置')} onClick={() => setSettingsOpen(v => !v)}>
            <svg viewBox="0 0 20 20" width="16" height="16"><path fill="currentColor" d="M10 13.4a3.4 3.4 0 1 0 0-6.8 3.4 3.4 0 0 0 0 6.8Zm8-2.1.9-.7a.6.6 0 0 0 .12-.78l-1.7-2.94a.6.6 0 0 0-.65-.27l-1.06.43a7.2 7.2 0 0 0-1.47-.85l-.16-1.13a.6.6 0 0 0-.6-.52h-3.4a.6.6 0 0 0-.6.52l-.16 1.13c-.52.21-1 .5-1.47.85l-1.06-.43a.6.6 0 0 0-.65.27L5.4 9.35a.6.6 0 0 0 .12.78l.9.7a7.4 7.4 0 0 0 0 1.7l-.9.7a.6.6 0 0 0-.12.78l1.7 2.94c.14.24.42.35.65.27l1.06-.43c.44.35.94.64 1.47.85l.16 1.13c.06.29.32.52.6.52h3.4c.3 0 .55-.23.6-.52l.16-1.13a7.2 7.2 0 0 0 1.47-.85l1.06.43c.24.1.51-.03.65-.27l1.7-2.94a.6.6 0 0 0-.12-.78l-.9-.7a7.4 7.4 0 0 0 0-1.7Z"/></svg>
          </button>
        </header>

        {settingsOpen && data && (
          <div className="fg-settings">
            <label className="fg-switchrow">
              <span>{t('减弱动效')}</span>
              <input type="checkbox" checked={reduce} onChange={e => act('settings', { reduceMotion: e.target.checked })} />
            </label>
          </div>
        )}

        <>
            <section className="fg-card fg-rings">
              <Ring value={data.mood} label={t('心情')} tone="mood" />
              <Ring value={data.satiety} label={t('饱食')} tone="food" />
              <Ring value={(data.levelInto / data.levelSpan) * 100} label={`${t('亲密')} Lv.${data.level}`} tone="bond" />
            </section>

            <section className="fg-card fg-actions">
              <button type="button" className="fg-btn is-primary" onClick={() => fire('feed')}>
                <i className="fg-ic">⚡</i>{t('喂她')}
              </button>
              <button type="button" className="fg-btn" onClick={() => fire('pet')}>
                <i className="fg-ic">💗</i>{t('摸头')}
              </button>
              <button type="button" className="fg-btn" onClick={() => { setNameDraft(data.name); setRenaming(true) }}>
                <i className="fg-ic">✏️</i>{t('改名')}
              </button>
            </section>

            <section className="fg-card fg-stats">
              <div><b>{data.tokensFed}</b><span>{t('累计偷吃')}</span></div>
              <div><b>{data.stats.minutesTogether}</b><span>{t('陪伴分钟')}</span></div>
              <div><b>{data.stats.sessions}</b><span>{t('次会话')}</span></div>
            </section>

            <section className="fg-card fg-diary">
              <h2>{t('日记')}</h2>
              <ul>
                {data.log.map(row => (
                  <li key={row.id}>
                    <i>{LOG_ICON[row.kind] ?? '·'}</i>
                    <span className="fg-log-text">{row.text}</span>
                    <time>{relTime(row.at)}</time>
                  </li>
                ))}
              </ul>
            </section>

            <section className="fg-scenepick">
              {SCENES.map(s => (
                <button key={s.id} type="button" title={t(s.zh)}
                  className={`fg-scenedot fg-dot-${s.id} ${data.scene === s.id ? 'is-on' : ''}`}
                  onClick={() => act('scene', { scene: s.id })} />
              ))}
            </section>
          </>
      </aside>

      {renaming && (
        <div className="fg-modal-mask" onClick={() => setRenaming(false)}>
          <form className="fg-modal" onClick={e => e.stopPropagation()} onSubmit={async (e) => {
            e.preventDefault()
            const name = nameDraft.trim()
            if (name) { await act('rename', { name }); setRenaming(false) }
          }}>
            <h3>{t('叫她什么')}</h3>
            <input autoFocus value={nameDraft} maxLength={12} onChange={e => setNameDraft(e.target.value)} />
            <div className="fg-modal-foot">
              <button type="button" className="fg-btn" onClick={() => setRenaming(false)}>{t('取消')}</button>
              <button type="submit" className="fg-btn is-primary">{t('保存')}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

// 侧栏行图标：小鲸鱼（壳层只问我们要 glyph）
function PanelIcon({ size = 18 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <path fill="currentColor" d="M4 13.5C4 9.4 8.2 6.5 13 6.5c3.6 0 7 1.9 7 5 0 2.6-2.7 4.5-6.3 4.5-1 0-2-.13-2.9-.4-.5 1.6-1.9 2.7-3.8 2.7-2.2 0-3-1.6-3-4.8Zm3.2-1a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" opacity=".95" />
      <path fill="currentColor" d="M15.5 4.6c.9-1.5 2.6-2 3.7-1.4-.7.6-1.2 1.4-1.4 2.3Z" />
    </svg>
  )
}

export const inject = ['slots']

export function apply(ctx) {
  // apply 在页面初始化即跑（侧栏行渲染可证）：此刻发首抓，socket 池尚未被
  // 各家长驻 SSE 流占满；面板首次打开时状态多半已经到手，否则先渲染乐观预览。
  const garden = createGarden()
  const GardenPanel = () => <Garden store={garden} />
  ctx.slots.inject('main', () => ctx.slots.register({ name: 'main', key: PANEL_ID }, GardenPanel))
  ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({
    name: 'sidebar.panellist',
    id: PANEL_ID,
    order: 6,
    label: () => t('海蒂花园'),
  }, PanelIcon))
}
