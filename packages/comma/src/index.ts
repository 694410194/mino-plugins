/** mino-comma: a sessionless proactive companion agent for Mino. */
import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-api-session-controller'
import type {} from '@deepseek-ai/dsh-agent'
import type {} from '@deepseek-ai/dsh-storage-domain'
import type {} from '@deepseek-ai/dsh-tools'
import type {} from '@deepseek-ai/dsh-workspace'
import { z } from 'zod'
import { Runtime } from './runtime.ts'
import type { Source } from './source.ts'
import { imSource } from './sources/im.ts'

declare module '@deepseek-ai/dsh-llm' {
  interface MessageSourceMap {
    'mino-comma': { kind: 'mino-comma' }
  }
}

export const name = 'mino-comma'
export const inject = ['storageDomain', 'sessionController', 'workspaceRegistry']
export const Config = z.object({
  /** Directory the router Workspace owns; defaults to the profile's working directory. */
  workspaceRoot: z.string().optional(),
  sources: z.object({
    im: z.object({
      /** Explicit off switch; when on, an empty botId auto-pairs through listBots(). */
      enabled: z.boolean().default(true),
      /** mino-im bot id in external-consumer exclusive mode; empty resolves config→state→listBots. */
      botId: z.string().default(''),
    }).prefault({}),
  }).prefault({}),
  proactive: z.object({
    /** Minutes between attention sweeps. */
    intervalMinutes: z.number().min(1).default(15),
    /** Cheap judge model for matter urgency; falls back to heuristics while unset. */
    decideModel: z.object({ provider: z.string(), model: z.string() }).optional(),
    /** Daily notification handoff cap and the minimum gap between two pushes. */
    notifyBudgetPerDay: z.number().int().min(0).default(12),
    notifyMinIntervalMinutes: z.number().min(0).default(30),
  }).prefault({}),
  notify: z.object({
    /** mino-im bot + saved delivery target for proactive pushes; both empty disables pushes. */
    botId: z.string().default(''),
    targetId: z.string().default(''),
  }).prefault({}),
  notebook: z.object({
    /** Rendered notebook path; defaults to <workspaceRoot>/Comma/Notebook.md. */
    path: z.string().optional(),
  }).prefault({}),
  briefing: z.object({
    /** Daily briefing push + router note at `hour` (local, 0-23). */
    enabled: z.boolean().default(true),
    hour: z.number().int().min(0).max(23).default(9),
  }).prefault({}),
  /** Seed loops upserted by name at every boot; runtime edits survive reseeding. */
  loops: z.array(z.object({
    name: z.string().min(1),
    everyMinutes: z.number().min(5),
    prompt: z.string().min(1),
    enabled: z.boolean().default(true),
  })).default([]),
}).prefault({})
export type CommaConfig = z.infer<typeof Config>

export async function apply(ctx: Context, config: CommaConfig): Promise<void> {
  let runtime!: Runtime
  // Registered before Runtime construction so the router's own materialization is caught.
  ctx.on('agent/created', ({ agent }) => { runtime?.decorateRouter(agent) })
  ctx.on('agent/disposed', ({ agent }) => { runtime?.dropRouter(agent) })
  const sources: Source[] = []
  if (config.sources.im.enabled) {
    sources.push(imSource(ctx, config.sources.im, () => runtime.resolveBot()))
  }
  runtime = new Runtime(ctx, sources, {
    workspaceRoot: config.workspaceRoot,
    sourceBotId: config.sources.im.botId,
    decideModel: config.proactive.decideModel,
    decideIntervalMinutes: config.proactive.intervalMinutes,
    notify: config.notify,
    notifyBudgetPerDay: config.proactive.notifyBudgetPerDay,
    notifyMinIntervalMinutes: config.proactive.notifyMinIntervalMinutes,
    notebookPath: config.notebook.path,
    briefing: config.briefing,
    seedLoops: config.loops,
  })
  ctx.effect(() => async () => { await runtime.stop() })
  await runtime.ready
  ctx.logger.info('mino-comma ready (%d source%s)', sources.length, sources.length === 1 ? '' : 's')
}

export * from './domain.ts'
export * from './source.ts'
export * from './decide.ts'
export * from './notebook.ts'
export { ROUTER_PRESET, ROUTER_SESSION_ID, Runtime, type RuntimeOptions } from './runtime.ts'
