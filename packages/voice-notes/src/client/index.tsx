/** mino-voice-notes 客户端半：注册进 mino-today 的「语音」tab 座位。
 * 与 mino-today 同款注册法（slots.inject 座位缺席则安静缺席）。
 * 数据面：同源 fetch 自有路由；录音经 MediaRecorder 同款 getUserMedia+PCM16 WAV 链。
 */
import type { Context } from '@deepseek-ai/cordis'
import { VNotesPage } from './VNotesPage.tsx'
import { en, zh, type CopyKey } from './locales.ts'

export const inject = ['slots', 'locale']

const NS = 'mino-voice-notes'
const SEAT = 'today.page.voice'

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
    slots.inject(SEAT, () =>
      slots.register({
        name: SEAT,
        locale: NS,
        inject: () => ({ t }),
      }, VNotesPage)))
}
