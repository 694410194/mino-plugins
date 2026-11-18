/**
 * mino-today 客户端半：侧栏「今日」图标 + keyed main 页。
 * 两个注册都走 ctx.slots.inject —— 座位由 shell 包声明，装载顺序无关；
 * shell 没有这些座位时插件安静缺席而不是拖垮启动（task-board 同款写法）。
 *
 * 数据面全部走官方解耦缝：
 * - sessions.list / jobs.state —— hooks 隔间交给渲染器绑成 useSessionList / useJobs
 * - uiWorkspace.openSession —— 卡片跳回会话
 * - sessions.using + session.prompt —— 建议 chip 真发消息
 * - ctx.jobs.watchRows / kill —— 任务视图的流与停止
 * - layout.selectPanel —— 跳去官方「自动化任务」页
 */
import type { Context } from '@deepseek-ai/cordis'
import { PanelIcon } from './PanelIcon.tsx'
import { TodayPage, type TodayActions, type Translate } from './TodayPage.tsx'
import { TodayPostRow } from './TodayPostRow.tsx'
import { en, zh, type CopyKey } from './locales.ts'

export const inject = ['slots', 'locale', 'sessions', 'jobs', 'uiWorkspace', 'layout']

const NS = 'mino-today'
const PANEL_ID = 'today'
/** 排在会话下面、官方面板前面（Plugins 是 0，Schedule 是 10）。 */
const PANEL_ORDER = 5

interface SlotsFace {
  inject(key: string, callback: () => (() => void) | void): () => void
  register(options: Record<string, unknown>, component: unknown): () => void
}

interface LocaleFace {
  register(ns: string, dicts: Record<string, Record<string, string>>): () => void
  bind(ns: string): Translate
}

/** 裸可观察源（dsh-client-store 的 ObservableSnapshot 结构面）。 */
interface ObservableSource<T> {
  getSnapshot(): T
  subscribe(listener: () => void): () => void
}

interface SessionRow {
  id: string
  displayTitle: string
  running: boolean
  updatedAt: number
}

interface SessionListStateLite {
  ids: string[]
  byId: Record<string, SessionRow>
}

interface SessionPromptFace {
  beginSubmission(input: { mode: 'queue' | 'steer'; text: string; attachments: readonly unknown[] }): { requestId: string }
  prompt(content: { type: 'text'; text: string }[], mode: 'queue' | 'steer', signal?: AbortSignal, requestId?: string): Promise<{ ok: boolean }>
}

interface SessionReferenceLite {
  binding: { session: SessionPromptFace }
}

/**
 * `source` 对应官方 `SessionReferenceSourceMap` 的声明合并键；宿主版本对齐
 * `dsh.engines` 范围后，以 '@deepseek-ai/dsh-api-session-controller' 的官方
 * 类型替换此结构面，并声明合并 `minoToday` 键。当前按引擎范围自描述结构。
 */
interface SessionsFace {
  list: ObservableSource<SessionListStateLite>
  refresh(): Promise<void>
  create(opts?: Record<string, unknown>): Promise<string>
  using<T>(target: string, options: { source: 'minoToday' }, operation: (reference: SessionReferenceLite) => T | Promise<T>): Promise<T>
}

interface JobsFace {
  state: ObservableSource<{ rows: Record<string, readonly unknown[]> }>
  watchRows(sessionId: string): () => void
  kill(sessionId: string, id: string): Promise<{ ok: boolean }>
}

interface UiWorkspaceFace {
  openSession(sessionId: string): void
}

interface LayoutFace {
  selectPanel(panelId: string | null): void
}

export function apply(ctx: Context): void {
  const slots = ctx.get('slots') as SlotsFace | undefined
  const locale = ctx.get('locale') as LocaleFace | undefined
  if (!slots) return

  let t: Translate = (key, params) => {
    const dict = zh as Record<string, string>
    let s = dict[key] ?? key
    if (params) for (const [k, v] of Object.entries(params)) s = s.replace(`{${k}}`, String(v))
    return s
  }
  if (locale) {
    ctx.effect(() => locale.register(NS, { zh, en }), 'mino-today: dictionaries')
    const bound = locale.bind(NS)
    t = (key, params) => bound(key as CopyKey, params)
  }

  const sessions = ctx.get('sessions') as SessionsFace | undefined
  const jobs = ctx.get('jobs') as JobsFace | undefined
  const uiWorkspace = ctx.get('uiWorkspace') as UiWorkspaceFace | undefined
  const layout = ctx.get('layout') as LayoutFace | undefined

  /** 把一句话发进指定会话；没给会话就开一个新的再发。navigate=false 时新会话不抢前台（feed 内嵌生成态用）。 */
  const sendPrompt = async (sessionId: string | undefined, text: string, options?: { navigate?: boolean }): Promise<boolean> => {
    if (!sessions) return false
    try {
      let target = sessionId
      if (!target) {
        target = await sessions.create()
        if (options?.navigate !== false) uiWorkspace?.openSession(target)
      }
      await sessions.using(target, { source: 'minoToday' }, async (reference) => {
        const session = reference.binding.session
        const handle = session.beginSubmission({ mode: 'queue', text, attachments: [] })
        const result = await session.prompt([{ type: 'text', text }], 'queue', undefined, handle.requestId)
        if (!result?.ok) throw new Error('prompt rejected')
      })
      return true
    } catch {
      return false
    }
  }

  const actions: TodayActions = {
    openSession: (sessionId) => { if (sessionId) uiWorkspace?.openSession(sessionId) },
    sendPrompt,
    newChat: async () => {
      if (!sessions) return
      const id = await sessions.create().catch(() => undefined)
      if (id) uiWorkspace?.openSession(id)
    },
    watchJobs: (sessionId) => jobs?.watchRows(sessionId) ?? (() => {}),
    killJob: (sessionId, jobId) => jobs ? jobs.kill(sessionId, jobId).then(r => !!r?.ok).catch(() => false) : Promise.resolve(false),
    openSchedules: () => layout?.selectPanel('schedules'),
    refreshSessions: () => { void sessions?.refresh().catch(() => {}) },
  }

  ctx.effect(() =>
    slots.inject('sidebar.panellist', () =>
      slots.register({
        name: 'sidebar.panellist',
        id: PANEL_ID,
        order: PANEL_ORDER,
        locale: NS,
        label: () => t('entry.label'),
      }, PanelIcon)))
  ctx.effect(() =>
    slots.inject('main', () =>
      slots.register({
        name: 'main',
        key: PANEL_ID,
        locale: NS,
        // 「语音」tab 的贡献座位：语音笔记等插件经 slots.inject 注册进来，
        // 不在 bundles 里时座位为空、tab 显示占位文案。
        // 「自定义」编辑面座位：早晚报等生成方贡献自己的偏好编辑卡。
        children: {
          'today.page.voice': { kind: 'list', scope: 'root' },
          'today.page.customize': { kind: 'list', scope: 'root' },
        },
        inject: () => ({
          t,
          actions,
          hooks: {
            ...(sessions ? { sessionList: sessions.list } : {}),
            ...(jobs ? { jobs: jobs.state } : {}),
          },
        }),
      }, TodayPage)))

  // 会话内 `today_post` 结果卡：keyed 命中替换通用工具行；
  // 宿主没声明 tool.call.toolview 座位时安静缺席。
  ctx.effect(() =>
    slots.inject('tool.call.toolview', () =>
      slots.register({
        name: 'tool.call.toolview',
        key: 'today_post',
        locale: NS,
        inject: () => ({ t }),
      }, TodayPostRow)))
}
