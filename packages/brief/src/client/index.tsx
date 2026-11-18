/** mino-brief 客户端半：早晚报偏好编辑器，注册进 mino-today 的「自定义」座位。 */
import type { Context } from '@deepseek-ai/cordis'
import { BriefEditor } from './BriefEditor.tsx'
import { en, zh, type CopyKey } from './locales.ts'

export const inject = ['slots', 'locale']

const NS = 'mino-brief'
const SEAT = 'today.page.customize'

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
    ctx.effect(() => locale.register(NS, { zh, en }), 'mino-brief: dictionaries')
    const bound = locale.bind(NS)
    t = (key, params) => bound(key as CopyKey, params)
  }

  ctx.effect(() =>
    slots.inject(SEAT, () =>
      slots.register({
        name: SEAT,
        id: 'mino-brief',
        locale: NS,
        inject: () => ({ t }),
      }, BriefEditor)))
}
