// mino-content-ops 客户端面（浏览器半）：
// 走官方 slots 体系注册两个全局面板——
//   「内容工场」：流水线中枢页（选题库真热榜 feed + 爆款拆解/文风克隆/一键发
//     走官方 ctx.sessions.startSession 预填指令发起 agent 任务 + Agent 剪辑
//     经 ctx.layout.selectPanel 跳工作台面板）。
//   「Agent 剪辑」：ShotCraft Workbench iframe + open.mjs 生命周期工具条。
// host 通信走 /dsh-shotcraft-workbench/* 与 /dsh-content-ops/* fetch，不碰 typert。
// 注意：__ModuleLoader__.load 的 id 必须等于图行 id（包名），否则 loader 判
// "loaded without registering" 报 import failed。
window.__ModuleLoader__.load({
  id: 'mino-content-ops',
  factory: (require) => {
    const React = require('react')
    const h = React.createElement
    const { useState, useEffect, useCallback } = React

    const WB_API = '/dsh-shotcraft-workbench/'
    const OPS_API = '/dsh-content-ops/'
    const WB_PANEL = 'shotcraft-workbench'
    const HUB_PANEL = 'content-ops'

    const api = async (base, path, body) => {
      try {
        const r = await fetch(base + path, {
          ...(body === undefined
            ? { headers: { accept: 'application/json' } }
            : { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }),
          signal: AbortSignal.timeout(20000),
        })
        const j = await r.json().catch(() => null)
        if (j === null) return { ok: false, error: '服务无响应（会话可能已断开，请刷新页面）' }
        return j
      } catch (e) { return { ok: false, error: `请求失败（会话可能已断开，请刷新页面）：${String(e).slice(0, 120)}` } }
    }

    // ── 主题感知：读取宿主 colorScheme（官方 theme-presenter 写入 documentElement.style.colorScheme）
    const themeNow = () => {
      const cs = document.documentElement?.style?.colorScheme
      if (cs === 'dark' || cs === 'light') return cs === 'dark'
      return typeof matchMedia === 'function' ? matchMedia('(prefers-color-scheme: dark)').matches : true
    }
    const useTheme = () => {
      const [dark, setDark] = useState(themeNow)
      useEffect(() => {
        const mm = typeof matchMedia === 'function' ? matchMedia('(prefers-color-scheme: dark)') : null
        const onMm = () => setDark(themeNow())
        mm?.addEventListener?.('change', onMm)
        const mo = new MutationObserver(() => setDark(themeNow()))
        mo.observe(document.documentElement, { attributes: true, attributeFilter: ['style', 'data-theme', 'class'] })
        return () => { mm?.removeEventListener?.('change', onMm); mo.disconnect() }
      }, [])
      return dark
    }

    // ── 设计系统（复刻 todayai 语言：面>线、不透明度层级、胶囊形、柔和彩底瓦片）
    //   mkStyles(dark) 产出全部主题相关样式；组件内 const {CSS,PIPE,TILE,T}=mkStyles(useTheme())
    const mkStyles = (dark) => {
      const INK = dark ? 'rgba(255,255,255,.88)' : 'rgba(0,0,0,.82)'
      const INK2 = dark ? 'rgba(255,255,255,.55)' : 'rgba(0,0,0,.52)'
      const INK3 = dark ? 'rgba(255,255,255,.35)' : 'rgba(0,0,0,.34)'
      const SURF = dark ? 'rgba(255,255,255,.045)' : 'rgba(0,0,0,.035)'
      const SURF2 = dark ? 'rgba(255,255,255,.07)' : 'rgba(0,0,0,.055)'
      const ACCENT_TX = dark ? '#a9c2f5' : '#3a6fd8'
      const OK_TX = dark ? '#75d1a6' : '#1c9d68'
      const HOT_TX = dark ? '#eda964' : '#cf7d17'
      const ERR_TX = dark ? '#f0939b' : '#d33f4e'
      const T = { INK, INK2, INK3, SURF, SURF2, ACCENT_TX, OK_TX, HOT_TX, ERR_TX, dark }
      const TILE = {
        copy: { bg: 'rgba(178,132,240,.16)', fg: dark ? '#bd93f2' : '#7d4fd0' },
        video: { bg: 'rgba(240,168,84,.16)', fg: dark ? '#eda964' : '#c07a1a' },
      }
      const PULSE = [
        '@keyframes mcoPulse{0%,100%{opacity:.35}50%{opacity:.7}}',
        '@keyframes mcoRun{0%,100%{opacity:1}50%{opacity:.45}}',
        '.mcoSkel{animation:mcoPulse 1.6s ease-in-out infinite}',
        '.mcoSkelX{animation:mcoPulse 1.6s ease-in-out infinite}',
        '.mcoNodeNow{animation:mcoPulse 1.8s ease-in-out infinite}',
        '.mcoRun{animation:mcoRun 1.6s ease-in-out infinite}',
        '.mcoIn{transition:border-color .15s,box-shadow .15s,background .15s}',
        `.mcoIn:focus{outline:none;border-color:rgba(91,141,239,.6)!important;box-shadow:0 0 0 3px rgba(91,141,239,.14);background:${dark ? 'rgba(255,255,255,.06)' : 'rgba(255,255,255,.5)'}!important}`,
        '.mcoBtn{transition:background .15s,color .15s,filter .15s}',
        `.mcoBtn:hover{background:${dark ? 'rgba(255,255,255,.13)' : 'rgba(0,0,0,.09)'}!important}`,
        '.mcoBtnP:hover{filter:brightness(1.15)}',
        `.mcoWireC{transition:background .18s,border-color .18s;scroll-snap-align:start}`,
        `.mcoWireC:hover{background:${dark ? 'rgba(255,255,255,.075)' : 'rgba(0,0,0,.05)'};border-color:${dark ? 'rgba(255,255,255,.16)' : 'rgba(0,0,0,.16)'}}`,
        '.mcoWireC .mcoWAct{opacity:.5;transition:opacity .15s}',
        '.mcoWireC:hover .mcoWAct{opacity:1}',
        `.mcoWAct:hover{color:${ACCENT_TX}!important}`,
        `.mcoQ{transition:background .15s}`,
        `.mcoQ:hover{background:${dark ? 'rgba(255,255,255,.06)' : 'rgba(0,0,0,.045)'}}`,
        '.mcoQ .mcoQX{opacity:0;transition:opacity .15s}',
        '.mcoQ:hover .mcoQX{opacity:.7}',
        `@container mcoDesk (max-width:560px){.mcoDeskWrap{flex-direction:column}.mcoQueueW{width:auto!important;border-right:none!important;border-bottom:1px solid ${dark ? 'rgba(255,255,255,.07)' : 'rgba(0,0,0,.09)'};flex-direction:row;overflow-x:auto}.mcoQueueList{flex-direction:row!important;padding:6px 10px!important}.mcoQItem{width:150px;flex:none}}`,
        '.mcoWireT::-webkit-scrollbar,.mcoStageS::-webkit-scrollbar,.mcoQueueList::-webkit-scrollbar{height:6px;width:8px}',
        `.mcoWireT::-webkit-scrollbar-thumb,.mcoStageS::-webkit-scrollbar-thumb,.mcoQueueList::-webkit-scrollbar-thumb{background:${dark ? 'rgba(255,255,255,.14)' : 'rgba(0,0,0,.14)'};border-radius:99px}`,
      ].join('')

      const HAIR = dark ? 'rgba(255,255,255,.07)' : 'rgba(0,0,0,.09)'
      const HAIR2 = dark ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.05)'
      const FIELD_BG = dark ? 'rgba(255,255,255,.05)' : 'rgba(255,255,255,.6)'
      const FIELD_BD = dark ? 'rgba(255,255,255,.09)' : 'rgba(0,0,0,.13)'
      const MINI_BG = dark ? 'rgba(255,255,255,.04)' : 'rgba(0,0,0,.03)'
      const TODO_BD = dark ? 'rgba(255,255,255,.16)' : 'rgba(0,0,0,.18)'
      const ACCENT_BG = 'rgba(91,141,239,.16)'
      const ACCENT_BD = 'rgba(91,141,239,.55)'
      const OK_BG = dark ? 'rgba(96,198,152,.18)' : 'rgba(28,157,104,.13)'
      const OK_BD = dark ? 'rgba(96,198,152,.45)' : 'rgba(28,157,104,.4)'
      const SKEL_BG = dark ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.07)'

      const CSS = {
        wrap: { display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, overflow: 'hidden', color: INK },
        bar: { display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderBottom: `1px solid ${HAIR}`, fontSize: 12.5, flex: 'none' },
        input: { flex: 1, minWidth: 100, background: SURF, border: `1px solid ${FIELD_BD}`, color: 'inherit', borderRadius: 999, padding: '7px 14px', fontSize: 12.5 },
        btn: { border: 'none', background: SURF2, color: 'inherit', borderRadius: 999, padding: '7px 14px', fontSize: 12.5, cursor: 'pointer', whiteSpace: 'nowrap' },
        primary: { background: 'linear-gradient(155deg,#333338 45%,#63646a 115%)', border: '1px solid rgba(255,255,255,.16)', color: '#fff' },
        status: { fontSize: 11.5, color: INK2, whiteSpace: 'nowrap' },
        frame: { flex: 1, border: 0, background: '#fff', minHeight: 0 },
        empty: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: INK2, padding: 24, textAlign: 'center', lineHeight: 1.8 },
        // hub
        hubGlow: { position: 'absolute', inset: 0, pointerEvents: 'none', background: `radial-gradient(58% 34% at 50% -8%, rgba(91,141,239,${dark ? '.09' : '.12'}), transparent 72%)` },
        skel: { height: 13, borderRadius: 7, background: SKEL_BG, margin: '14px 8px', opacity: .6 },
        toastWrap: { position: 'fixed', right: 20, bottom: 20, zIndex: 9000, display: 'flex', flexDirection: 'column', gap: 8, pointerEvents: 'auto' },
        toast: { maxWidth: 340, padding: '11px 16px', borderRadius: 14, fontSize: 12.5, lineHeight: 1.5, cursor: 'pointer', boxShadow: '0 8px 28px rgba(0,0,0,.25)', backdropFilter: 'blur(12px)' },
        toastInfo: { background: dark ? 'rgba(32,34,40,.93)' : 'rgba(255,255,255,.95)', color: INK, border: `1px solid ${HAIR}` },
        toastErr: { background: dark ? 'rgba(56,26,30,.93)' : 'rgba(255,241,242,.95)', color: ERR_TX, border: '1px solid rgba(211,63,78,.3)' },
      }

      // ── 稿台样式系统：线索带(横滚) + 队列(窄列) + 稿台(聚焦) ────────────
      const PIPE = {
        // 顶栏
        head: { display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px 12px', flex: 'none', position: 'relative' },
        title: { fontSize: 16, fontWeight: 500, letterSpacing: '.01em', color: INK, flex: 'none' },
        composer: { flex: 1, minWidth: 160, display: 'flex', alignItems: 'center', gap: 8, background: SURF, borderRadius: 999, padding: '4px 6px 4px 16px', border: `1px solid ${FIELD_BD}` },
        composerIn: { flex: 1, minWidth: 0, background: 'none', border: 'none', outline: 'none', color: INK, fontSize: 13, padding: '6px 0' },
        composerBtn: { flex: 'none', border: 'none', borderRadius: 999, padding: '7px 16px', fontSize: 12.5, cursor: 'pointer', background: SURF2, color: INK },
        headBtn: { flex: 'none', border: 'none', borderRadius: 999, padding: '7px 14px', fontSize: 12, cursor: 'pointer', background: 'transparent', color: INK2, whiteSpace: 'nowrap' },
        // 线索带：一排横向滚动的热点卡，用完即收
        wire: { flex: 'none', borderBottom: `1px solid ${HAIR2}`, padding: '2px 20px 12px' },
        wireHead: { display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8 },
        wireTab: { flex: 'none', border: 'none', background: 'transparent', color: INK3, borderRadius: 999, padding: '4px 10px', fontSize: 11.5, cursor: 'pointer', whiteSpace: 'nowrap' },
        wireTabOn: { background: SURF2, color: INK },
        wireTrack: { display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, scrollSnapType: 'x proximity' },
        wireCard: { flex: 'none', width: 176, borderRadius: 12, padding: '10px 12px 9px', background: SURF, border: `1px solid ${HAIR2}`, cursor: 'grab', display: 'flex', flexDirection: 'column', gap: 7 },
        wireRank: { fontSize: 10.5, fontVariantNumeric: 'tabular-nums', color: INK3 },
        wireTitle: { fontSize: 12, lineHeight: 1.45, color: INK, display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2, overflow: 'hidden', minHeight: '2.9em', textDecoration: 'none' },
        wireFoot: { display: 'flex', alignItems: 'center', gap: 6, marginTop: 'auto' },
        wireHot: { fontSize: 10, color: INK3, fontVariantNumeric: 'tabular-nums', marginRight: 'auto' },
        wireAct: { fontSize: 10.5, border: 'none', background: 'none', color: INK2, cursor: 'pointer', padding: '1px 4px', borderRadius: 6 },
        wireEmpty: { flex: 'none', width: '100%', padding: '14px 4px', fontSize: 12, color: INK2 },
        // 稿台容器：队列 + 聚焦区（容器查询下窄屏转上下）
        desk: { flex: 1, minHeight: 0, display: 'flex', containerType: 'inline-size', containerName: 'mcoDesk' },
        deskWrap: { display: 'flex', flex: 1, minWidth: 0, minHeight: 0 },
        // 队列：你的稿，一条一条排着
        queueW: { flex: 'none', width: 172, display: 'flex', flexDirection: 'column', borderRight: `1px solid ${HAIR2}`, overflow: 'hidden' },
        queueHead: { flex: 'none', fontSize: 10.5, color: INK3, padding: '12px 14px 8px', letterSpacing: '.04em' },
        queueList: { flex: 1, overflow: 'auto', padding: '0 8px 12px', display: 'flex', flexDirection: 'column', gap: 4 },
        qItem: { display: 'flex', alignItems: 'center', gap: 8, padding: '8px 9px', borderRadius: 10, cursor: 'pointer', border: 'none', background: 'transparent', textAlign: 'left', width: '100%' },
        qItemOn: { background: dark ? 'rgba(91,141,239,.13)' : 'rgba(91,141,239,.10)' },
        qGlyph: { flex: 'none', width: 22, height: 22, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11 },
        qBody: { flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 },
        qTitle: { fontSize: 12, color: INK, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.3 },
        qDots: { display: 'flex', gap: 3, alignItems: 'center' },
        qDot: { width: 12, height: 3, borderRadius: 99, background: TODO_BD },
        qDotDone: { background: OK_BD },
        qX: { flex: 'none', border: 'none', background: 'none', color: INK3, cursor: 'pointer', fontSize: 11, padding: '0 1px' },
        queueEmpty: { padding: '18px 12px', fontSize: 11.5, color: INK3, lineHeight: 1.7 },
        // 稿台：一次只放大一条内容
        stage: { flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
        stageScroll: { flex: 1, overflow: 'auto', padding: '22px 26px 28px' },
        stageHead: { display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 4 },
        stageBadge: { flex: 'none', fontSize: 10.5, padding: '2px 9px', borderRadius: 999 },
        stageTopic: { fontSize: 17, fontWeight: 500, color: INK, flex: 1, minWidth: 0, lineHeight: 1.4 },
        stageMeta: { flex: 'none', fontSize: 10.5, color: INK3, fontVariantNumeric: 'tabular-nums' },
        stageX: { flex: 'none', border: 'none', background: 'none', color: INK3, cursor: 'pointer', fontSize: 13, padding: '0 2px' },
        stepper: { display: 'flex', alignItems: 'center', gap: 0, margin: '16px 0 4px', paddingBottom: 20, maxWidth: 560 },
        node: { width: 20, height: 20, borderRadius: 999, flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10.5 },
        nodeDone: { background: OK_BG, color: OK_TX, border: `1px solid ${OK_BD}` },
        nodeNow: { border: `1px solid ${ACCENT_BD}`, color: ACCENT_TX, background: ACCENT_BG },
        nodeTodo: { border: `1px solid ${TODO_BD}`, color: INK3 },
        line: { flex: 1, height: 1, margin: '0 8px', background: HAIR },
        lineDone: { background: OK_BD },
        stepLabel: { position: 'absolute', top: 26, left: '50%', transform: 'translateX(-50%)', fontSize: 11, color: INK3, whiteSpace: 'nowrap' },
        nextLabel: { fontSize: 10.5, color: INK3, letterSpacing: '.05em', margin: '22px 0 8px' },
        taskRow: { display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', fontSize: 12, borderTop: `1px solid ${HAIR2}` },
        taskPill: { fontSize: 10.5, padding: '2px 8px', borderRadius: 999, flex: 'none' },
        taskTitle: { flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: INK2, fontSize: 11.5 },
        taskTime: { fontSize: 10.5, color: INK3, flex: 'none', fontVariantNumeric: 'tabular-nums' },
        taskAct: { fontSize: 11, border: 'none', background: 'none', color: INK2, cursor: 'pointer', padding: '1px 3px', flex: 'none' },
        actRow: { display: 'flex', gap: 8, marginTop: 4, alignItems: 'center', flexWrap: 'wrap' },
        actP: { border: 'none', borderRadius: 999, padding: '8px 18px', fontSize: 12.5, cursor: 'pointer', background: ACCENT_BG, color: ACCENT_TX },
        actG: { border: 'none', borderRadius: 999, padding: '8px 15px', fontSize: 12, cursor: 'pointer', background: 'transparent', color: INK2, border: `1px solid ${HAIR}` },
        miniSheet: { marginTop: 12, background: MINI_BG, borderRadius: 12, padding: '14px 16px', maxWidth: 560 },
        fLabel: { fontSize: 11.5, color: INK2, marginBottom: 6 },
        field: { width: '100%', boxSizing: 'border-box', background: FIELD_BG, border: `1px solid ${FIELD_BD}`, color: 'inherit', borderRadius: 10, padding: '8px 11px', fontSize: 12.5, fontFamily: 'inherit' },
        chips: { display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 2 },
        chip: { border: `1px solid ${FIELD_BD}`, background: 'transparent', color: INK2, borderRadius: 999, padding: '4px 12px', fontSize: 11.5, cursor: 'pointer' },
        chipOn: { background: ACCENT_BG, borderColor: ACCENT_BD, color: ACCENT_TX },
        formErr: { fontSize: 11.5, color: ERR_TX, marginTop: 10 },
        empty: { height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, color: INK3, textAlign: 'center', lineHeight: 1.9, fontSize: 13 },
      }

      return { CSS, PIPE, TILE, PULSE, T }
    }

    const fmtHot = (n) => {
      const v = Number(n)
      if (!Number.isFinite(v) || v <= 0) return ''
      if (v >= 1e8) return (v / 1e8).toFixed(1) + '亿'
      if (v >= 1e4) return (v / 1e4).toFixed(1) + '万'
      return String(Math.round(v))
    }

    // ── Agent 剪辑面板：工具条 + ShotCraft Workbench iframe ─────────────
    const WB_DIR_KEY = 'mino.content-ops.wbDir'
    function WorkbenchPanel() {
      const { CSS } = mkStyles(useTheme())
      const [dir, setDir] = useState(() => { try { return localStorage.getItem(WB_DIR_KEY) || '' } catch { return '' } })
      const [status, setStatus] = useState('正在检查工作台状态…')
      const [url, setUrl] = useState('')
      const [busy, setBusy] = useState(false)

      const refresh = useCallback(async () => {
        const s = await api(WB_API, 'status')
        if (s.ok && s.running) { setStatus('工作台运行中'); setUrl(u => u || s.url) }
        else setStatus(s.ok ? '工作台未运行' : (s.error || '状态查询失败'))
        return s
      }, [])

      useEffect(() => { void refresh() }, [refresh])

      const open = async () => {
        if (!dir.trim()) { setStatus('请先填写工程目录'); return }
        setBusy(true); setStatus('正在启动工作台，首次运行需要初始化依赖…')
        try { localStorage.setItem(WB_DIR_KEY, dir.trim()) } catch (e) { console.warn('[mino-content-ops] persist dir failed:', e) }
        const r = await api(WB_API, 'open', { dir: dir.trim() })
        setBusy(false)
        if (r.ok && r.url) { setStatus('工作台运行中'); setUrl(r.url) }
        else setStatus(r.error || '启动失败')
      }
      const stop = async () => {
        setBusy(true); const r = await api(WB_API, 'stop', {}); setBusy(false)
        setStatus(r.ok ? '工作台已停止' : (r.error || '停止失败'))
      }

      return h('div', { style: CSS.wrap },
        h('div', { style: CSS.bar },
          h('input', { style: CSS.input, value: dir, spellCheck: false, placeholder: '成片工程目录', onChange: (e) => setDir(e.target.value), onKeyDown: (e) => { if (e.key === 'Enter') void open() } }),
          h('button', { style: { ...CSS.btn, ...CSS.primary }, disabled: busy, onClick: () => void open() }, '打开工作台'),
          h('button', { style: CSS.btn, disabled: busy, onClick: () => void refresh() }, '状态'),
          h('button', { style: CSS.btn, disabled: busy, onClick: () => void stop() }, '停止'),
          h('span', { style: CSS.status }, status),
        ),
        url
          ? h('iframe', { key: url, style: CSS.frame, src: url, title: 'ShotCraft Workbench' })
          : h('div', { style: CSS.empty },
              h('div', null,
                h('div', { style: { marginBottom: 8 } }, '填入成片工程目录后点「打开工作台」'),
                h('div', { style: { fontSize: 12, opacity: .8 } }, 'video-shotcraft 技能产出的工程可直接在面板里拆镜头、调卡、导出'),
              )),
      )
    }

    // ── 内容工场中枢页：流水线卡 + 表单 + 选题库热榜 feed ──────────────
    // stage.feed → 热榜 tab；stage.panel → selectPanel；stage.fields → 真表单，
    // 提交走官方 connectWorkspace → sessions.retain → session.prompt 真发，
    // 然后 openSession 跳过去看 agent 实时执行。
    const FEED_TABS = [
      { key: 'weibo', label: '微博' },
      { key: 'bilibili', label: 'B站' },
      { key: 'toutiao', label: '头条' },
      { key: 'baidu', label: '百度' },
      { key: 'aihot', label: 'AIHOT' },
    ]

    // ── 流水线模型 ─────────────────────────────────────────────────────
    // 条目（item）是工作台的一等公民：一条内容从选题流到发布。
    // 文案线：选题→文稿→发布 ｜ 视频线：素材→配方→成片→发布
    // 任务（task）挂在条目上，由 agent 会话执行；绑定任务完成 → 步进器自动推进。
    const LINES = {
      copy: { label: '文案', steps: ['选题', '文稿', '发布'], advance: { mimic: 1, publish: 2 } },
      video: { label: '视频', steps: ['素材', '配方', '成片', '发布'], advance: { breakdown: 1, produce: 2, publish: 3 } },
    }

    // 条目上的动作定义：fields 渲染卡内内联表单，build 拼 agent 指令；
    // kind=styles|templates 的字段渲染成模版库下拉（library 接口供数据）。
    // 所有产出固定在 content-factory/ 下，agent 不乱建目录；全程中文。
    const ACTIONS = {
      research: { label: '调研', line: 'any',
        fields: [{ key: 'extra', label: '调研侧重', placeholder: '想重点了解什么，可留空' }],
        build: (item, v) => `先读 content-ops 技能的工作区规范，再用 content-collect 技能调研这条选题：核实热度与事实，给出可用角度、素材线索和风险点，笔记写到 content-factory/storage/tasks/${item.id}/调研笔记.md，回复里给结论摘要。\n选题：${item.topic}${v.extra ? `\n侧重：${v.extra}` : ''}\n要求：全程使用中文。` },
      mimic: { label: '仿写', line: 'copy',
        fields: [
          { key: 'style', label: '文风模版', kind: 'styles' },
          { key: 'sample', label: '或直接粘贴样本', placeholder: '模版库为空时，粘贴样本全文', multiline: true },
        ],
        validate: (v) => (v.style || String(v.sample ?? '').trim() ? null : '请选择文风模版，或直接粘贴样本'),
        build: (item, v) => `先读 content-ops 技能的工作区规范，再用 copy-style-mimic 技能仿写文案：先测样本指纹，出 AI 味对照稿 + 指纹稿双稿，写完回测指纹自校准，产出写到 content-factory/storage/tasks/${item.id}/文稿.md。\n主题：${item.topic}\n${v.style ? `文风模版：${v.style}` : `样本：${v.sample}`}\n要求：全程使用中文。` },
      breakdown: { label: '拆解', line: 'video',
        fields: [
          { key: 'path', label: '视频路径', placeholder: '本地视频文件的完整路径', required: true },
          { key: 'extra', label: '补充要求', placeholder: '想重点拆的部分，可留空' },
        ],
        build: (item, v) => `先读 content-ops 技能的工作区规范，再用 video-breakdown 技能拆解这条对标视频，输出复刻配方（切点、结构公式、节奏参数、可换皮变量），配方写到 content-factory/storage/tasks/${item.id}/配方.md，并把可复用版本另存到 content-factory/resource/templates/ 下作为视频模板。\n视频路径：${v.path}${v.extra ? `\n补充要求：${v.extra}` : ''}\n要求：全程使用中文。` },
      produce: { label: '成片', line: 'video',
        fields: [
          { key: 'template', label: '视频模板', kind: 'templates', required: true },
          { key: 'extra', label: '补充要求', placeholder: '产品名、口播要点等，可留空' },
        ],
        build: (item, v) => `先读 content-ops 技能的工作区规范，再用 video-shotcraft 技能按模板制作成片：读 ${v.template === '__inkpress__' ? '技能自带的 Ink Press 模板' : `模板 ${v.template}`} 的说明与替换流程，把本条素材逐镜适配成片，工程与产物写到 content-factory/storage/tasks/${item.id}/project 下。${item.path ? `\n素材路径：${item.path}` : ''}${v.extra ? `\n补充要求：${v.extra}` : ''}\n要求：全程使用中文。` },
      wb: { label: '剪辑台', line: 'video', panel: WB_PANEL },
      publish: { label: '一键发', line: 'any',
        fields: [
          { key: 'platforms', label: '平台', chips: ['抖音', 'B站', '小红书', '头条', '公众号'] },
          { key: 'title', label: '标题', placeholder: '平台上显示的标题，可留空' },
          { key: 'content', label: '发布内容', placeholder: '要发布的正文内容', multiline: true, required: true },
        ],
        build: (item, v) => `先读 content-ops 技能的工作区规范，再用 social-publish 技能发布到 ${(v.platforms ?? []).join('、') || '（平台待选）'}：先 attach 我已登录的 Chrome（CDP :9222），填好各平台草稿后停下来找我确认再点发布。\n标题：${v.title || item.topic}\n内容：${v.content}\n要求：全程使用中文。` },
    }
    // 各条线的动作清单（research 仅在选题步骤出现）
    const LINE_ACTIONS = { copy: ['research', 'mimic', 'publish'], video: ['research', 'breakdown', 'produce', 'wb', 'publish'] }

    const icon = (paths) => h('svg', { width: 15, height: 15, viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', strokeWidth: 1.4, strokeLinecap: 'round', strokeLinejoin: 'round' },
      paths.map((d, i) => h('path', { key: i, d })))

    // ── 持久化 ─────────────────────────────────────────────────────────
    const ITEMS_KEY = 'mino.content-ops.items'
    const TASKS_KEY = 'mino.content-ops.tasks'
    const loadJSON = (k) => { try { const v = JSON.parse(localStorage.getItem(k) || '[]'); return Array.isArray(v) ? v : [] } catch { return [] } }
    const saveJSON = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v.slice(0, 30))) } catch (e) { console.warn('[mino-content-ops] persist failed:', e) } }
    const fmtElapsed = (t) => {
      const ms = (t.completedAt || Date.now()) - t.startedAt
      const m = Math.floor(ms / 60000)
      return m >= 1 ? `${m} 分钟` : `${Math.max(1, Math.floor(ms / 1000))} 秒`
    }
    const fmtAgo = (ts) => {
      const m = Math.floor((Date.now() - ts) / 60000)
      if (m < 1) return '刚刚'
      if (m < 60) return `${m} 分钟前`
      const h = Math.floor(m / 60)
      return h < 24 ? `${h} 小时前` : `${Math.floor(h / 24)} 天前`
    }

    // ── 步进器：done=绿勾 / now=蓝环呼吸 / todo=空心 ─────────────────────
    function Stepper({ steps, step }) {
      const { PIPE } = mkStyles(useTheme())
      return h('div', { style: PIPE.stepper },
        steps.map((s, i) => {
          const done = i < step
          const now = i === step
          return h(React.Fragment, { key: s },
            i > 0 && h('div', { style: { ...PIPE.line, ...(done || now ? PIPE.lineDone : {}) } }),
            h('div', { style: { position: 'relative', flex: 'none' } },
              h('div', { className: now ? 'mcoNodeNow' : '', style: { ...PIPE.node, ...(done ? PIPE.nodeDone : now ? PIPE.nodeNow : PIPE.nodeTodo) } },
                done ? '✓' : String(i + 1)),
              h('div', { style: PIPE.stepLabel }, s)),
          )
        }))
    }

    // ── 条目卡：话题 + 步进器 + 实时任务 + 上下文动作 ────────────────────
    function ItemCard({ item, tasks, openAction, setOpenAction, onSubmit, onRemove, onStop, onOpen, onRerun, onOpenPanel, busy, library }) {
      const { PIPE, TILE, T } = mkStyles(useTheme())
      const line = LINES[item.line]
      const tile = TILE[item.line]
      const [vals, setVals] = useState({ platforms: [], path: item.path || '' })
      const [err, setErr] = useState('')
      const [lib, setLib] = useState({})
      const action = ACTIONS[openAction]
      const set = (k, x) => setVals((v) => ({ ...v, [k]: x }))
      const toggleChip = (c) => setVals((v) => ({ ...v, platforms: (v.platforms ?? []).includes(c) ? v.platforms.filter((p) => p !== c) : [...(v.platforms ?? []), c] }))
      const done = item.step >= line.steps.length
      // 模版库下拉数据：表单展开时按需拉一次（templates 线追加内置 Ink Press）
      useEffect(() => {
        if (!action) return
        const kinds = [...new Set(action.fields.filter((f) => f.kind && lib[f.kind] === undefined).map((f) => f.kind))]
        if (!kinds.length) return
        void (async () => {
          for (const k of kinds) {
            const items = await library(k)
            setLib((l) => ({ ...l, [k]: k === 'templates' ? [{ name: '内置 Ink Press 模板', path: '__inkpress__' }, ...items] : items }))
          }
        })()
      }, [openAction])
      // 主动作随步骤推进：文案线 选题→仿写→发布；视频线 素材→拆解→成片→发布
      const PRIMARY = {
        copy: (s) => (s >= 2 ? 'publish' : 'mimic'),
        video: (s) => (s >= 3 ? 'publish' : s >= 1 ? 'produce' : 'breakdown'),
      }
      const primary = PRIMARY[item.line](item.step)
      // 调研只在选题阶段给
      const actionKeys = LINE_ACTIONS[item.line].filter((k) => k !== 'research' || item.step === 0)
      return h('div', null,
        h('div', { style: PIPE.stageHead },
          h('span', { style: { ...PIPE.stageBadge, background: tile.bg, color: tile.fg } }, line.label),
          h('span', { style: PIPE.stageTopic, title: item.topic }, item.topic),
          done && h('span', { style: { ...PIPE.taskPill, background: 'rgba(96,198,152,.15)', color: T.OK_TX } }, '已发布'),
          h('span', { style: PIPE.stageMeta }, fmtAgo(item.createdAt)),
          h('button', { style: PIPE.stageX, title: '移除条目', onClick: onRemove }, '✕'),
        ),
        h(Stepper, { steps: line.steps, step: item.step }),
        h('div', { style: PIPE.actRow },
          h('span', { style: { fontSize: 10.5, color: T.INK3, letterSpacing: '.05em', marginRight: 2 } }, '下一步'),
          actionKeys.map((k) => {
            const a = ACTIONS[k]
            if (a.panel) return h('button', { key: k, className: 'mcoBtn', style: PIPE.actG, onClick: () => onOpenPanel(a.panel) }, `${a.label} →`)
            const isP = k === primary && !done
            return h('button', {
              key: k, className: 'mcoBtn' + (isP ? ' mcoBtnP' : ''),
              style: isP ? PIPE.actP : PIPE.actG,
              onClick: () => { setOpenAction(openAction === k ? null : k); setErr('') },
            }, openAction === k ? `${a.label} ↑` : a.label)
          })),
        action && !action.panel && h('div', { style: PIPE.miniSheet },
          action.fields.map((f) => h('div', { key: f.key, style: { marginBottom: 12 } },
            h('div', { style: PIPE.fLabel }, f.label, f.required && h('span', { style: { color: T.ERR_TX } }, ' *')),
            f.kind
              ? (lib[f.kind]?.length
                  ? h('select', { className: 'mcoIn', style: { ...PIPE.field, cursor: 'pointer' }, value: vals[f.key] ?? '', onChange: (e) => set(f.key, e.target.value) },
                      h('option', { value: '' }, '—— 请选择 ——'),
                      lib[f.kind].map((o) => h('option', { key: o.path, value: o.path }, o.name)))
                  : h('div', { style: { fontSize: 11.5, color: T.INK3, lineHeight: 1.7 } },
                      lib[f.kind] === undefined ? '正在读取模版库…' : `模版库是空的——把文件放进工作区的 content-factory/resource/${f.kind}/ 后，这里会出现选项`))
              : f.chips
                ? h('div', { style: PIPE.chips }, f.chips.map((c) => h('button', {
                    key: c, className: 'mcoBtn', style: (vals.platforms ?? []).includes(c) ? { ...PIPE.chip, ...PIPE.chipOn } : PIPE.chip,
                    onClick: () => toggleChip(c),
                  }, c)))
                : f.multiline
                  ? h('textarea', { className: 'mcoIn', style: { ...PIPE.field, minHeight: 64, resize: 'vertical' }, value: vals[f.key] ?? '', placeholder: f.placeholder, onChange: (e) => set(f.key, e.target.value) })
                  : h('input', { className: 'mcoIn', style: PIPE.field, value: vals[f.key] ?? '', placeholder: f.placeholder, spellCheck: false, onChange: (e) => set(f.key, e.target.value) }),
          )),
          h('div', { style: { display: 'flex', gap: 8, alignItems: 'center' } },
            h('button', { className: 'mcoBtn mcoBtnP', style: PIPE.actP, disabled: busy, onClick: () => {
              const custom = action.validate?.(vals)
              const missing = action.fields.filter((f) => f.required && !String(vals[f.key] ?? '').trim())
              const msg = custom ?? (missing.length ? `请先填：${missing.map((f) => f.label).join('、')}` : null)
              if (msg) { setErr(msg); return }
              setErr('')
              onSubmit(item, openAction, vals)
            } }, busy ? '发起中…' : '开始执行'),
            h('button', { className: 'mcoBtn', style: PIPE.actG, onClick: () => setOpenAction(null) }, '取消'),
          ),
          err && h('div', { style: PIPE.formErr }, err),
        ),
        tasks.length > 0 && h('div', { style: PIPE.nextLabel }, '任务'),
        tasks.map((t) => h('div', { key: t.sessionId, style: PIPE.taskRow },
          h('span', { className: t.running ? 'mcoRun' : '', style: { ...PIPE.taskPill, ...(t.running ? { background: 'rgba(91,141,239,.16)', color: T.ACCENT_TX } : { background: T.SURF2, color: T.INK2 }) } },
            t.running ? '执行中' : '已结束'),
          h('span', { style: PIPE.taskTitle, title: t.title }, t.title !== t.stage ? t.title : t.stage),
          h('span', { style: PIPE.taskTime }, fmtElapsed(t)),
          h('button', { style: PIPE.taskAct, onClick: () => onOpen(t.sessionId) }, '会话'),
          t.running
            ? h('button', { style: PIPE.taskAct, onClick: () => onStop(t.sessionId) }, '停止')
            : h('button', { style: PIPE.taskAct, onClick: () => onRerun(t) }, '重发'),
        )),
      )
    }

    function HubPanel(props) {
      const { CSS, PIPE, TILE, T, PULSE } = mkStyles(useTheme())
      const [tab, setTab] = useState('weibo')
      const [feed, setFeed] = useState(null)
      const [err, setErr] = useState('')
      const [railOpen, setRailOpen] = useState(true)

      const load = useCallback(async (key) => {
        setFeed(null); setErr('')
        const r = await api(OPS_API, `feed/${key}`)
        if (r.ok && Array.isArray(r.items)) setFeed(r.items)
        else setErr(r.error || '热榜加载失败')
      }, [])
      useEffect(() => { void load(tab) }, [tab, load])

      const wsSnap = props.useWorkspaces ? props.useWorkspaces((s) => s) : undefined
      const { useRef } = React

      // 流水线状态：条目 + 挂在条目上的任务，全部持久化
      const [pipe, setPipe] = useState(() => loadJSON(ITEMS_KEY))
      const [tasks, setTasks] = useState(() => loadJSON(TASKS_KEY))
      const [openAction, setOpenAction] = useState({})
      const [composer, setComposer] = useState('')
      const [busy, setBusy] = useState(false)
      const [wsRoot, setWsRoot] = useState('')
      // 稿台聚焦：__orphans__ 聚焦独立任务，否则聚焦某个条目；新建条目自动聚焦
      const [focusId, setFocusId] = useState(null)
      useEffect(() => saveJSON(ITEMS_KEY, pipe), [pipe])
      useEffect(() => saveJSON(TASKS_KEY, tasks), [tasks])
      const tasksRef = useRef(tasks)
      tasksRef.current = tasks

      const createItem = (topic, line, path) => {
        const it = { id: `it${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`, topic: String(topic).trim(), line, path: path || '', step: 0, createdAt: Date.now() }
        setPipe((p) => [it, ...p])
        setFocusId(it.id)
        return it
      }
      const fromComposer = () => {
        const v = composer.trim()
        if (!v) return
        const isVideo = /\.(mp4|mov|webm|mkv|avi|flv|m4v)$/i.test(v) || /^[a-zA-Z]:[\\/]/.test(v)
        createItem(isVideo ? v.split(/[\\/]/).pop() : v, isVideo ? 'video' : 'copy', isVideo ? v : '')
        setComposer('')
        props.notify(isVideo ? '已立项视频条目' : '已立项选题')
      }
      const onDrop = (e) => {
        e.preventDefault()
        try {
          const d = JSON.parse(e.dataTransfer.getData('application/x-mco-item') || 'null')
          if (d?.topic) { createItem(d.topic, 'copy'); props.notify('已立项到流水线') }
        } catch (e2) { console.warn('[mino-content-ops] drop parse failed:', e2) }
      }

      // 工作区解析 + 建仓：拿 {id,path}，幂等建 content-factory 结构
      const resolveWs = async () => {
        let ws = wsSnap?.items?.[0]
        let id = ws?.workspaceId
        let path = ws?.path
        if (!id) {
          const created = await props.ensureWorkspace()
          id = created?.id; path = created?.path
        }
        if (!id) return null
        if (path) { setWsRoot(path); void api(OPS_API, 'scaffold', { root: path }) }
        return id
      }
      // 模版库清单（给 ItemCard 的 select 字段供数据）；先幂等建仓——老工作区补铺种子卡
      const library = async (kind) => {
        const root = wsRoot || wsSnap?.items?.[0]?.path
        if (!root) return []
        await api(OPS_API, 'scaffold', { root }).catch(() => null)
        const r = await api(OPS_API, `library?root=${encodeURIComponent(root)}&kind=${kind}`)
        return r.ok ? (r.items ?? []) : []
      }

      const submit = async (item, actionKey, vals) => {
        const action = ACTIONS[actionKey]
        const prompt = action.build(item, vals)
        setBusy(true)
        try {
          const wsId = await resolveWs()
          if (!wsId) { props.notify('未选择工作目录，任务未发起'); return }
          const sid = await props.runTask(prompt, wsId)
          setTasks((ts) => [{ sessionId: sid, itemId: item.id, stage: action.label, stageKey: actionKey, prompt, startedAt: Date.now(), running: true, title: action.label }, ...ts])
          props.notify(`「${action.label}」已下发，agent 执行中`)
          setOpenAction((o) => ({ ...o, [item.id]: null }))
        } catch (e) {
          props.notify(`发起失败：${String(e).slice(0, 140)}`, 'error')
          console.warn('[mino-content-ops] runTask failed:', e)
        } finally { setBusy(false) }
      }

      const rerun = async (t) => {
        setTasks((ts) => ts.filter((x) => x.sessionId !== t.sessionId))
        try {
          const wsId = await resolveWs()
          if (!wsId) { props.notify('未选择工作目录，任务未发起'); return }
          const sid = await props.runTask(t.prompt, wsId)
          setTasks((ts) => [{ sessionId: sid, itemId: t.itemId, stage: t.stage, stageKey: t.stageKey, prompt: t.prompt, startedAt: Date.now(), running: true, title: t.stage }, ...ts])
          props.notify(`「${t.stage}」已重新下发`)
        } catch (e) {
          props.notify(`重发失败：${String(e).slice(0, 140)}`, 'error')
          console.warn('[mino-content-ops] rerun failed:', e)
        }
      }

      // 热榜「调研」：一键立项并直接下发深度调研（不经表单）
      const scoutItem = async (title) => {
        if (busy) return
        const it = createItem(title, 'copy')
        await submit(it, 'research', {})
      }
      // 「AI 找选题」：agent 扫热点源推荐选题，独立任务挂在任务区
      const scoutTopics = async () => {
        if (busy) return
        setBusy(true)
        try {
          const wsId = await resolveWs()
          if (!wsId) { props.notify('未选择工作目录，任务未发起'); return }
          const prompt = `先读 content-ops 技能的工作区规范，再用 content-collect 技能扫描当前热点源（微博、B站、头条、百度、AIHOT），结合热度和可做的内容角度，推荐 8 条最值得立项的选题。每条给：标题、来源、为什么值得做、建议走文案线还是视频线。结果写到 content-factory/storage/tasks/scout-${Date.now().toString(36)}/选题建议.md，回复里直接列出清单。\n要求：全程使用中文。`
          const sid = await props.runTask(prompt, wsId)
          setTasks((ts) => [{ sessionId: sid, itemId: null, stage: '选题侦察', stageKey: 'scout', prompt, startedAt: Date.now(), running: true, title: '选题侦察' }, ...ts])
          props.notify('「选题侦察」已下发，agent 扫描热点中')
        } catch (e) {
          props.notify(`发起失败：${String(e).slice(0, 140)}`, 'error')
          console.warn('[mino-content-ops] scoutTopics failed:', e)
        } finally { setBusy(false) }
      }

      // 官方会话列表快照订阅：任务运行态实时同步，完成即推进条目步进器
      useEffect(() => {
        const src = props.sessionsList()
        const sync = () => {
          const st = src.getSnapshot()
          const cur = tasksRef.current
          const finished = []
          const next = cur.map((t) => {
            const s = st?.byId?.[t.sessionId]
            if (s) {
              const running = !!s.running
              if (t.running && !running) finished.push(t)
              return { ...t, running, completedAt: t.running && !running ? Date.now() : t.completedAt, title: s.displayTitle || t.title }
            }
            if (t.running && Date.now() - t.startedAt > 15000) { finished.push(t); return { ...t, running: false, completedAt: t.completedAt || Date.now() } }
            return t
          })
          setTasks(next)
          if (finished.length) setPipe((prev) => prev.map((it) => {
            const adv = finished.filter((f) => f.itemId === it.id)
              .map((f) => LINES[it.line]?.advance[f.stageKey])
              .filter((x) => x !== undefined)
            if (!adv.length) return it
            return { ...it, step: Math.min(LINES[it.line].steps.length, Math.max(it.step, Math.max(...adv) + 1)) }
          }))
        }
        sync()
        return src.subscribe(sync)
      }, [props])

      const orphans = tasks.filter((t) => !pipe.some((i) => i.id === t.itemId))
      // 稿台聚焦对象：队列点谁放大谁；空队列 → 空态
      const focusItem = focusId === '__orphans__' ? null : (pipe.find((i) => i.id === focusId) ?? pipe[0])
      const focusOrphans = focusId === '__orphans__' || (!focusItem && orphans.length > 0)
      const removeItem = (id) => { setPipe((p) => p.filter((x) => x.id !== id)); setTasks((ts) => ts.filter((t) => t.itemId !== id)); if (focusId === id) setFocusId(null) }
      const renderTaskRow = (t) => h('div', { key: t.sessionId, style: PIPE.taskRow },
        h('span', { className: t.running ? 'mcoRun' : '', style: { ...PIPE.taskPill, ...(t.running ? { background: 'rgba(91,141,239,.16)', color: T.ACCENT_TX } : { background: T.SURF2, color: T.INK2 }) } }, t.running ? '执行中' : '已结束'),
        h('span', { style: PIPE.taskTitle, title: t.title }, t.title !== t.stage ? t.title : t.stage),
        h('span', { style: PIPE.taskTime }, fmtElapsed(t)),
        h('button', { style: PIPE.taskAct, onClick: () => props.openSession(t.sessionId) }, '会话'),
        t.running
          ? h('button', { style: PIPE.taskAct, onClick: () => { void props.stopTask(t.sessionId).then(() => setTasks((prev) => prev.map((x) => x.sessionId === t.sessionId ? { ...x, running: false, completedAt: Date.now() } : x))) } }, '停止')
          : h('button', { style: PIPE.taskAct, onClick: () => void rerun(t) }, '重发'))

      return h('div', { style: { ...CSS.wrap, position: 'relative' } },
        h('style', null, PULSE),
        h('div', { style: CSS.hubGlow }),
        // 顶栏：标题 + 立项胶囊 + AI 找选题 + 线索开关
        h('div', { style: PIPE.head },
          h('span', { style: PIPE.title }, '内容工场'),
          h('div', { style: PIPE.composer },
            h('input', {
              style: PIPE.composerIn, value: composer, spellCheck: false,
              placeholder: '输入选题，或粘贴视频文件路径——回车立项',
              onChange: (e) => setComposer(e.target.value),
              onKeyDown: (e) => { if (e.key === 'Enter') fromComposer() },
            }),
            h('button', { className: 'mcoBtn', style: PIPE.composerBtn, onClick: fromComposer }, '立项')),
          h('button', { className: 'mcoBtn', style: PIPE.headBtn, disabled: busy, onClick: () => void scoutTopics() }, 'AI 找选题'),
          h('button', { className: 'mcoBtn', style: PIPE.headBtn, onClick: () => setRailOpen((o) => !o) }, railOpen ? '收起线索' : '线索'),
        ),
        // 线索带：五源热榜压成一条横向电报带，用完即收
        railOpen && h('div', { style: PIPE.wire },
          h('div', { style: PIPE.wireHead },
            h('span', { style: { fontSize: 10.5, color: T.INK3, letterSpacing: '.05em', marginRight: 4 } }, '线索'),
            FEED_TABS.map((t) => h('button', {
              key: t.key, className: 'mcoBtn',
              style: tab === t.key ? { ...PIPE.wireTab, ...PIPE.wireTabOn } : PIPE.wireTab,
              onClick: () => setTab(t.key),
            }, t.label)),
            h('button', { className: 'mcoBtn', style: { marginLeft: 'auto', border: 'none', background: 'none', color: T.INK3, cursor: 'pointer', fontSize: 11 }, onClick: () => void load(tab) }, '刷新')),
          h('div', { className: 'mcoWireT', style: PIPE.wireTrack },
            err && h('div', { style: PIPE.wireEmpty },
              h('span', { style: { marginRight: 10 } }, err),
              h('button', { className: 'mcoBtn', style: CSS.btn, onClick: () => void load(tab) }, '重试')),
            !err && feed === null && Array.from({ length: 6 }, (_, i) => h('div', { key: i, className: 'mcoSkelX', style: { ...PIPE.wireCard, cursor: 'default', height: 68 } })),
            !err && feed !== null && feed.length === 0 && h('div', { style: PIPE.wireEmpty }, '该源当前无数据'),
            !err && feed !== null && feed.map((it, i) => h('div', {
              key: i, className: 'mcoWireC', style: PIPE.wireCard, draggable: true,
              onDragStart: (e) => e.dataTransfer.setData('application/x-mco-item', JSON.stringify({ topic: it.title })),
            },
              h('span', { style: { ...PIPE.wireRank, ...(i < 3 ? { color: T.HOT_TX } : {}) } }, `${String(i + 1).padStart(2, '0')}`),
              it.url
                ? h('a', { style: PIPE.wireTitle, href: it.url, target: '_blank', rel: 'noreferrer', title: it.title }, it.title)
                : h('span', { style: PIPE.wireTitle, title: it.title }, it.title),
              h('div', { style: PIPE.wireFoot },
                h('span', { style: PIPE.wireHot }, fmtHot(it.hot)),
                h('button', { className: 'mcoWAct', style: PIPE.wireAct, title: '立项到稿台', onClick: () => { createItem(it.title, 'copy'); props.notify('已立项到稿台') } }, '立项'),
                h('button', { className: 'mcoWAct', style: { ...PIPE.wireAct, color: T.ACCENT_TX }, title: '立项并让 agent 深度调研', onClick: () => void scoutItem(it.title) }, '调研'),
              ))))),
        // 稿台：左边队列挑稿，右边放大处理
        h('div', { style: PIPE.desk },
          h('div', { className: 'mcoDeskWrap', style: PIPE.deskWrap },
            h('div', { className: 'mcoQueueW', style: PIPE.queueW },
              h('div', { style: PIPE.queueHead }, `队列 ${pipe.length || ''}`),
              h('div', { className: 'mcoQueueList', style: PIPE.queueList },
                pipe.length === 0 && h('div', { style: PIPE.queueEmpty }, '还没有立项的稿——从线索带立项，或在上方输入选题'),
                pipe.map((it) => {
                  const ln = LINES[it.line]
                  const on = focusItem?.id === it.id
                  const running = tasks.some((t) => t.itemId === it.id && t.running)
                  return h('button', {
                    key: it.id, className: 'mcoQ', style: { ...PIPE.qItem, ...(on ? PIPE.qItemOn : {}) },
                    onClick: () => setFocusId(it.id),
                  },
                    h('span', { className: running ? 'mcoRun' : '', style: { ...PIPE.qGlyph, background: TILE[it.line].bg, color: TILE[it.line].fg } }, it.line === 'video' ? '视' : '文'),
                    h('span', { style: PIPE.qBody },
                      h('span', { style: PIPE.qTitle, title: it.topic }, it.topic),
                      h('span', { style: PIPE.qDots }, ln.steps.map((_, di) => h('span', { key: di, style: { ...PIPE.qDot, ...(di < it.step ? PIPE.qDotDone : {}) } })))),
                    h('span', { className: 'mcoQX', style: PIPE.qX, title: '移除', onClick: (e) => { e.stopPropagation(); removeItem(it.id) } }, '✕'),
                  )
                }),
                orphans.length > 0 && h('button', {
                  className: 'mcoQ', style: { ...PIPE.qItem, ...(focusOrphans ? PIPE.qItemOn : {}), marginTop: 6 },
                  onClick: () => setFocusId('__orphans__'),
                },
                  h('span', { style: { ...PIPE.qGlyph, background: T.SURF2, color: T.INK2 } }, '独'),
                  h('span', { style: PIPE.qBody },
                    h('span', { style: PIPE.qTitle }, `独立任务 ${orphans.length}`),
                    h('span', { style: PIPE.qDots }, h('span', { style: PIPE.qDot })))),
              )),
            h('div', { style: PIPE.stage, onDragOver: (e) => e.preventDefault(), onDrop },
              h('div', { className: 'mcoStageS', style: PIPE.stageScroll },
                focusItem && h(ItemCard, {
                  key: focusItem.id, item: focusItem,
                  tasks: tasks.filter((t) => t.itemId === focusItem.id),
                  openAction: openAction[focusItem.id] || null,
                  setOpenAction: (k) => setOpenAction((o) => ({ ...o, [focusItem.id]: k })),
                  onSubmit: (item, k, vals) => void submit(item, k, vals),
                  onRemove: () => removeItem(focusItem.id),
                  onStop: (sid) => { void props.stopTask(sid).then(() => setTasks((prev) => prev.map((x) => x.sessionId === sid ? { ...x, running: false, completedAt: Date.now() } : x))).catch((e) => props.notify(`停止失败：${String(e).slice(0, 120)}`, 'error')) },
                  onOpen: props.openSession,
                  onRerun: (t) => void rerun(t),
                  onOpenPanel: props.openPanel,
                  busy,
                  library,
                }),
                !focusItem && focusOrphans && h('div', null,
                  h('div', { style: PIPE.stageHead },
                    h('span', { style: PIPE.stageTopic }, '独立任务'),
                    h('span', { style: PIPE.stageMeta }, `${orphans.length} 条`)),
                  h('div', { style: PIPE.nextLabel }, '不挂在条目上的任务（AI 找选题等）'),
                  orphans.map(renderTaskRow)),
                !focusItem && !focusOrphans && h('div', { style: PIPE.empty },
                  h('div', { style: {
                    width: 88, height: 88, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: `1.5px dashed ${T.dark ? 'rgba(255,255,255,.18)' : 'rgba(0,0,0,.18)'}`,
                    background: `radial-gradient(circle at 50% 35%, rgba(91,141,239,${T.dark ? '.12' : '.10'}), transparent 70%)`,
                    color: T.INK3,
                  } }, h('svg', { width: 34, height: 34, viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', strokeWidth: 1.1, strokeLinecap: 'round', strokeLinejoin: 'round' },
                    h('path', { d: 'M8 2.5v11M2.5 8h11' }))),
                  h('div', { style: { fontSize: 15, color: T.INK, fontWeight: 500 } }, '稿台是空的'),
                  h('div', { style: { maxWidth: 330 } }, '点线索卡的「立项」「调研」，或在上方输入选题 / 视频路径回车；也可以让 AI 扫热点帮你挑选题'),
                ),
              )),
          )),
      )
    }

    // ── shell.overlay 官方 toast 通道：面板/注入面共用的瞬时通知 ─────────
    function OpsToast({ store }) {
      const { CSS } = mkStyles(useTheme())
      const v = React.useSyncExternalStore(store.subscribe, store.getSnapshot)
      useEffect(() => {
        if (!v) return
        const t = setTimeout(() => store.clear(), 4500)
        return () => clearTimeout(t)
      }, [v])
      if (!v) return null
      return h('div', { style: CSS.toastWrap },
        h('div', { style: { ...CSS.toast, ...(v.kind === 'error' ? CSS.toastErr : CSS.toastInfo) }, onClick: () => store.clear() }, v.text))
    }

    // ── 图标 ────────────────────────────────────────────────────────────
    const HubIcon = ({ size = 18 }) => h('svg', { width: size, height: size, viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', strokeWidth: 1.3 },
      h('path', { d: 'M2 13V6.5L5 8.5V6.5L8 8.5V6.5L11 8.5V13z' }),
      h('path', { d: 'M12 4.5h2M13 3.5v2', strokeLinecap: 'round' }),
      h('path', { d: 'M1.5 13.5h13', strokeLinecap: 'round' }))

    const PanelIcon = ({ size = 18 }) => h('svg', { width: size, height: size, viewBox: '0 0 16 16', fill: 'none' },
      h('rect', { x: 1, y: 3, width: 14, height: 10, rx: 2, stroke: 'currentColor', strokeWidth: 1.4 }),
      h('path', { d: 'M6 6.2v3.6l3.4-1.8z', fill: 'currentColor' }))

    return {
      inject: ['slots', 'layout', 'uiWorkspace', 'workspaces', 'sessions'],
      apply(ctx) {
        try {
          // 面板与注入面共用的通知源；经 shell.overlay 官方浮层渲染
          let toastVal = null
          const toastSubs = new Set()
          const toast$ = {
            getSnapshot: () => toastVal,
            subscribe: (f) => { toastSubs.add(f); return () => toastSubs.delete(f) },
            set: (x) => { toastVal = x; toastSubs.forEach((f) => f()) },
            clear: () => { toastVal = null; toastSubs.forEach((f) => f()) },
          }
          const notify = (text, kind = 'info') => toast$.set({ text, kind })

          ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({
            name: 'sidebar.panellist', id: HUB_PANEL, order: 59, label: () => '内容工场',
          }, HubIcon))
          ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({
            name: 'sidebar.panellist', id: WB_PANEL, order: 60, label: () => 'Agent 剪辑',
          }, PanelIcon))
          ctx.slots.inject('shell.overlay', () => ctx.slots.register({
            name: 'shell.overlay', id: 'content-ops.toast',
          }, (props) => h(OpsToast, { store: toast$, ...props })))
          ctx.slots.inject('main', () => ctx.slots.register({
            name: 'main', key: HUB_PANEL,
            inject: () => ({
              runTask: async (prompt, workspaceId) => {
                const sid = await ctx.uiWorkspace.connectWorkspace(workspaceId)
                const ref = ctx.sessions.retain(sid, { source: 'mino-content-ops' })
                try {
                  const binding = await ref.ready
                  await binding.session.prompt([{ type: 'text', text: prompt }], 'queue')
                  return sid
                } finally { ref.release() }
              },
              // 无工作区时补一个：先走官方目录选择器，不可用时兜底建默认目录；返回 {id,path} 或 null（用户取消）
              ensureWorkspace: async () => {
                try {
                  const dir = await ctx.uiWorkspace.pickDirectory()
                  if (!dir) return null
                  const ws = await ctx.workspaces.create({ path: dir })
                  return { id: ws.id ?? ws.workspaceId ?? null, path: dir }
                } catch (e1) {
                  console.warn('[mino-content-ops] pickDirectory failed, fallback:', String(e1).slice(0, 200))
                  const r = await api(OPS_API, 'ensure-workspace')
                  if (!r.ok || !r.dir) throw new Error(r.error || '无法准备工作目录')
                  const ws = await ctx.workspaces.create({ path: r.dir })
                  return { id: ws.id ?? ws.workspaceId ?? null, path: r.dir }
                }
              },
              openSession: (sid) => ctx.uiWorkspace.openSession(sid),
              stopTask: async (sid) => ctx.sessions.using(sid, { source: 'mino-content-ops' }, (ref) => ref.binding.session.cancel()),
              sessionsList: () => ctx.sessions.list,
              openPanel: (id) => ctx.layout.selectPanel(id),
              notify,
            }),
          }, HubPanel))
          ctx.slots.inject('main', () => ctx.slots.register({
            name: 'main', key: WB_PANEL,
            inject: () => ({ notify }),
          }, WorkbenchPanel))
        } catch (e) { console.warn('[mino-content-ops] slots registration failed:', e) }
      },
    }
  },
})
