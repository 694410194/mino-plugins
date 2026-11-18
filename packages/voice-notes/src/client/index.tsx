/** mino-voice-notes 客户端半：侧栏「语音笔记」图标 + keyed main 页。
 * 与 mino-today 同款注册法（slots.inject 座位缺席则安静缺席）。
 * 数据面：同源 fetch 自有路由；录音经 MediaRecorder 同款 getUserMedia+PCM16 WAV 链。
 */
import type { Context } from '@deepseek-ai/cordis'
import { PanelIcon } from './PanelIcon.tsx'
import { VNotesPage } from './VNotesPage.tsx'
import { en, zh, type CopyKey } from './locales.ts'

export const inject = ['slots', 'locale']

const NS = 'mino-voice-notes'
const PANEL_ID = 'vnotes'
const PANEL_ORDER = 6

interface SlotsFace {
  inject(key: string, callback: () => (() => void) | void): () => void
  register(options: Record<string, unknown>, component: unknown): () => void
}
interface LocaleFace {
  register(ns: string, dicts: Record<string, Record<string, string>>): () => void
  bind(ns: string): Translate
}
export type Translate = (key: CopyKey, params?: Record<string, unknown>) => string

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
    ctx.effect(() => locale.register(NS, { zh, en }), 'mino-voice-notes: dictionaries')
    const bound = locale.bind(NS)
    t = (key, params) => bound(key as CopyKey, params)
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
        inject: () => ({ t }),
      }, VNotesPage)))
}
