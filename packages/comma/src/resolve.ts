/** Explicit pairing resolution: config → durable selection → discovery. Never a hidden default. */
import type { Context } from '@deepseek-ai/cordis'
import type { Domain } from '@deepseek-ai/dsh-storage-domain'
import type { commaDomain } from './domain.ts'

type CommaDomain = Domain<typeof commaDomain>

/** The subset of the `dshIm` surface pairing resolution reads. */
interface DshImDiscovery {
  listBots?(): Promise<string[]>
  listTargets?(botId: string): Promise<{ targetId: string }[]>
}

export type BotResolution =
  | { kind: 'resolved'; botId: string; origin: 'config' | 'state' | 'auto' }
  | { kind: 'none' }
  | { kind: 'ambiguous'; candidates: string[] }

export type TargetResolution =
  | { kind: 'resolved'; botId: string; targetId: string; origin: 'config' | 'state' | 'auto' }
  | { kind: 'none' }
  | { kind: 'ambiguous'; botId: string; candidates: string[] }

export const SELECTED_BOT_KEY = 'selected_bot'
export const NOTIFY_TARGET_KEY = 'notify_target'

const dshimOf = (ctx: Context): DshImDiscovery | undefined =>
  ctx.get('dshIm') as DshImDiscovery | undefined

export async function resolveBot(ctx: Context, domain: CommaDomain, configured: string): Promise<BotResolution> {
  if (configured !== '') return { kind: 'resolved', botId: configured, origin: 'config' }
  const remembered = domain.table('state').get(SELECTED_BOT_KEY)?.value
  const dshim = dshimOf(ctx)
  const candidates = dshim?.listBots !== undefined ? await dshim.listBots() : undefined
  if (remembered !== undefined && remembered !== '') {
    // A remembered bot that vanished from discovery is cleared and re-resolved; an empty list is transient.
    if (candidates === undefined || candidates.length === 0 || candidates.includes(remembered)) {
      return { kind: 'resolved', botId: remembered, origin: 'state' }
    }
    await domain.table('state').put(SELECTED_BOT_KEY, { key: SELECTED_BOT_KEY, value: '' })
  }
  if (candidates === undefined) return { kind: 'none' }
  if (candidates.length === 0) return { kind: 'none' }
  if (candidates.length > 1) return { kind: 'ambiguous', candidates }
  const botId = candidates[0]!
  await domain.table('state').put(SELECTED_BOT_KEY, { key: SELECTED_BOT_KEY, value: botId })
  return { kind: 'resolved', botId, origin: 'auto' }
}

export async function resolveNotifyTarget(
  ctx: Context,
  domain: CommaDomain,
  configured: { botId: string; targetId: string },
  sourceBotId: string | undefined,
): Promise<TargetResolution> {
  if (configured.botId !== '' && configured.targetId !== '') {
    return { kind: 'resolved', botId: configured.botId, targetId: configured.targetId, origin: 'config' }
  }
  const remembered = domain.table('state').get(NOTIFY_TARGET_KEY)?.value
  if (remembered !== undefined && remembered !== '') {
    const parsed = JSON.parse(remembered) as { botId?: unknown; targetId?: unknown }
    if (typeof parsed.botId === 'string' && typeof parsed.targetId === 'string') {
      return { kind: 'resolved', botId: parsed.botId, targetId: parsed.targetId, origin: 'state' }
    }
  }
  const botId = configured.botId !== '' ? configured.botId : sourceBotId
  if (botId === undefined) return { kind: 'none' }
  const dshim = dshimOf(ctx)
  if (dshim?.listTargets === undefined) return { kind: 'none' }
  const targets = (await dshim.listTargets(botId)).map(t => t.targetId)
  if (targets.length === 0) return { kind: 'none' }
  if (targets.length > 1) return { kind: 'ambiguous', botId, candidates: targets }
  const targetId = targets[0]!
  await domain.table('state').put(NOTIFY_TARGET_KEY, { key: NOTIFY_TARGET_KEY, value: JSON.stringify({ botId, targetId }) })
  return { kind: 'resolved', botId, targetId, origin: 'auto' }
}
