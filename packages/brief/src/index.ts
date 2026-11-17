/**
 * mino-brief 宿主半：早晚简报流水线。
 *
 * 形态 = 固定 preset 会话 + 宿主 schedule 定时唤醒：
 *   schedule.create(daily) → 到点向 `mino-brief` 会话投递 user 消息
 *   → 简报员普通模型轮生成 → 自行调 today_post（mino-today 提供）投到「今日」页。
 * 生成管线不自造——一次带人格的模型轮就是生成器；定时条目出现在宿主
 * schedules 面板与 mino-today 定时 tab，用户可暂停/删除。
 * 删除过的条目记 tombstone，不偷偷复活。
 */
import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-api-session-controller'
import type {} from '@deepseek-ai/dsh-storage-domain'
import type {} from '@deepseek-ai/dsh-workspace'
import type {} from '@deepseek-ai/dsh-schedule'
import { z } from 'zod'
import { briefDomain } from './domain.ts'
import type { Domain } from '@deepseek-ai/dsh-storage-domain'

export const name = 'mino-brief'
export const inject = ['storageDomain', 'sessionController', 'workspaceRegistry']

const TIME_RE = /^\d{2}:\d{2}(:\d{2}(\.\d{1,3})?)?$/

export const Config = z.object({
  /** Directory the brief Workspace owns; defaults to the profile's working directory. */
  workspaceRoot: z.string().optional(),
  /** IANA zone the daily entries fire in. */
  timeZone: z.string().default('Asia/Shanghai'),
  /** Morning brief entry; `HH:mm` or `HH:mm:ss` local. */
  morning: z.object({
    enabled: z.boolean().default(true),
    time: z.string().regex(TIME_RE).default('08:00'),
    prompt: z.string().default(
      '生成今日早报：面向今天这一天——今天的日程线索、昨晚以来值得留意的变化、未完成事项的跟进提醒。',
    ),
  }).prefault({}),
  /** Evening brief entry. */
  evening: z.object({
    enabled: z.boolean().default(true),
    time: z.string().regex(TIME_RE).default('21:00'),
    prompt: z.string().default(
      '生成今日晚报：回顾这一天——今天完成和发生的事、明天要接续的线索。',
    ),
  }).prefault({}),
}).prefault({})
export type BriefConfig = z.infer<typeof Config>

const SESSION_ID = 'mino-brief'
const PRESET_ID = 'mino-brief'
const SESSION_TITLE = '简报'
const TITLE_KEY = 'title'

interface SlotSpec { slot: 'morning' | 'evening'; title: string; time: string; prompt: string; enabled: boolean }

export async function apply(ctx: Context, config: BriefConfig): Promise<void> {
  const logger = ctx.logger('mino-brief')
  const domain: Domain<typeof briefDomain> = await ctx.storageDomain.open(briefDomain)
  const state = domain.table('state')

  const workspace = await ctx.workspaceRegistry.create(config.workspaceRoot ?? process.cwd())
  const existing = await ctx.sessionController.resolveAgent(SESSION_ID)
  if ('error' in existing) {
    await ctx.sessionController.create({
      sessionId: SESSION_ID,
      workspaceId: workspace.id,
      agentPreset: PRESET_ID,
    })
    logger.info('brief session created: %s', SESSION_ID)
  }
  const resolved = await ctx.sessionController.resolveAgent(SESSION_ID)
  if (!('error' in resolved) && state.get(TITLE_KEY) === undefined) {
    resolved.agent.session.append('session/title', { title: SESSION_TITLE, messageSeqs: [], source: { kind: 'user' } })
    await state.put(TITLE_KEY, { key: TITLE_KEY, value: '1' })
  }

  const schedule = ctx.get('schedule')
  if (!schedule) {
    logger.warn('host schedule service unavailable — brief slots not registered')
    return
  }
  const catalog = await schedule.catalog()
  const byId = new Map(catalog.map(entry => [entry.id, entry]))

  for (const spec of slotSpecs(config)) {
    const idKey = `schedule:${spec.slot}`
    const goneKey = `gone:${spec.slot}`
    const storedId = state.get(idKey)?.value
    const stored = storedId === undefined ? undefined : byId.get(storedId)
    if (stored) continue
    if (storedId !== undefined) {
      // Stored entry vanished from the catalog: the user deleted it — keep the tombstone.
      await state.put(goneKey, { key: goneKey, value: '1' })
      continue
    }
    if (state.get(goneKey) !== undefined || !spec.enabled) continue
    // A hand-made entry with the same title counts as ownership — adopt, never duplicate.
    const adopted = catalog.find(entry => entry.title === spec.title)
    if (adopted) {
      await state.put(idKey, { key: idKey, value: adopted.id })
      continue
    }
    const created = await schedule.create({
      title: spec.title,
      prompt: spec.prompt,
      timing: { kind: 'daily', daily: { time: normalizeTime(spec.time), time_zone: config.timeZone } },
      target: { kind: 'session', sessionId: SESSION_ID },
    })
    await state.put(idKey, { key: idKey, value: created.id })
    logger.info('brief schedule created: %s at %s %s', spec.title, spec.time, config.timeZone)
  }
}

function slotSpecs(config: BriefConfig): SlotSpec[] {
  return [
    { slot: 'morning', title: 'Mino 早报', ...config.morning },
    { slot: 'evening', title: 'Mino 晚报', ...config.evening },
  ]
}

/** `HH:mm` → `HH:mm:00`; `HH:mm:ss(.SSS)` passes through. */
function normalizeTime(time: string): string {
  return time.length === 5 ? `${time}:00` : time
}
