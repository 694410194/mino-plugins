/** mino-call: a sessionless proactive companion agent for Mino. */
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
import { webwatchSource } from './sources/webwatch.ts'
import { mailSource } from './sources/mail.ts'
import { calendarSource } from './sources/calendar.ts'
import { taskSource } from './sources/tasks.ts'

declare module '@deepseek-ai/dsh-llm' {
  interface MessageSourceMap {
    'mino-call': { kind: 'mino-call' }
  }
}

export const name = 'mino-call'
export const inject = ['storageDomain', 'sessionController', 'workspaceRegistry', 'sessionPersistence', 'subprocess', 'schedule']
export const Config = z.object({
  /** Directory the router Workspace owns; defaults to the profile's working directory. */
  workspaceRoot: z.string().optional(),
  sources: z.object({
    im: z.object({
      /** Explicit off switch; when on, an empty botId auto-pairs through listBots(). */
      enabled: z.boolean().default(true),
      /** @xmanrui/dsh-im bot id in external-consumer exclusive mode; empty resolves config→state→listBots. */
      botId: z.string().default(''),
    }).prefault({}),
    webwatch: z.object({
      /** Poll watch_scan through the tools executor; absent webwatch plugin idles harmlessly. */
      enabled: z.boolean().default(true),
      /** Poll interval in minutes. */
      intervalMinutes: z.number().min(1).default(60),
      /** Lookback days per scan. */
      days: z.number().min(1).max(365).default(1),
    }).prefault({}),
    mail: z.object({
      /** Poll mail_recent through the tools executor; absent connector-mail idles harmlessly. */
      enabled: z.boolean().default(true),
      intervalMinutes: z.number().min(1).default(30),
      /** How many recent mails per poll (tool clamps to 50). */
      limit: z.number().int().min(1).max(50).default(15),
      /** Extra keywords searched every poll (订票/发票/验证码 style hits). */
      queries: z.array(z.string()).default([]),
    }).prefault({}),
    calendar: z.object({
      /** Poll cal_upcoming through the tools executor; absent connector-calendar idles harmlessly. */
      enabled: z.boolean().default(true),
      intervalMinutes: z.number().min(1).default(30),
      /** Lookahead days per poll. */
      days: z.number().min(1).max(90).default(3),
      /** Attempt cal_sync (CalDAV pull) first; absent creds error is ignored. */
      sync: z.boolean().default(true),
    }).prefault({}),
    tasks: z.object({
      /** Read the task-board service snapshot; absent board idles harmlessly. */
      enabled: z.boolean().default(true),
      intervalMinutes: z.number().min(1).default(10),
      /** A scheduled todo within this many minutes counts as due-soon signal. */
      dueSoonMinutes: z.number().min(0).default(30),
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
    /** @xmanrui/dsh-im bot + saved delivery target for proactive pushes; both empty disables pushes. */
    botId: z.string().default(''),
    targetId: z.string().default(''),
    /** Also post each delivered notification to the mino-today feed; feed feedback can then mute that source. */
    postToFeed: z.boolean().default(true),
  }).prefault({}),
  notebook: z.object({
    /** Rendered notebook path; defaults to <workspaceRoot>/Call/Notebook.md. */
    path: z.string().optional(),
  }).prefault({}),
  briefing: z.object({
    /** Daily briefing push + router note at `hour` (local, 0-23). */
    enabled: z.boolean().default(true),
    hour: z.number().int().min(0).max(23).default(9),
  }).prefault({}),
  /** Worker 委派：任务执行载体。dsh-session=起 mino-call-worker preset 会话；cli=经 ctx.subprocess 起外部命令行 agent（autoloop 式）。 */
  worker: z.object({
    kind: z.enum(['dsh-session', 'cli']).default('dsh-session'),
    /** kind=cli 时的外部命令行（argv 形式，空格分隔）；任务目标经 stdin 喂入。 */
    command: z.string().default(''),
    /** worker 单轮超时（分钟），超时判失联。 */
    timeoutMinutes: z.number().min(1).default(30),
  }).prefault({}),
  /** Seed loops upserted by name at every boot; runtime edits survive reseeding. */
  loops: z.array(z.object({
    name: z.string().min(1),
    everyMinutes: z.number().min(5),
    prompt: z.string().min(1),
    enabled: z.boolean().default(true),
  })).default([]),
}).prefault({})
export type CallConfig = z.infer<typeof Config>

export async function apply(ctx: Context, config: CallConfig): Promise<void> {
  let runtime!: Runtime
  // Registered before Runtime construction so the router's own materialization is caught.
  ctx.on('agent/created', ({ agent }) => { runtime?.decorateRouter(agent) })
  ctx.on('agent/disposed', ({ agent }) => { runtime?.dropRouter(agent) })
  const sources: Source[] = []
  if (config.sources.im.enabled) {
    sources.push(imSource(ctx, config.sources.im, () => runtime.resolveBot()))
  }
  if (config.sources.webwatch.enabled) {
    sources.push(webwatchSource(ctx, config.sources.webwatch))
  }
  if (config.sources.mail.enabled) {
    sources.push(mailSource(ctx, config.sources.mail))
  }
  if (config.sources.calendar.enabled) {
    sources.push(calendarSource(ctx, config.sources.calendar))
  }
  if (config.sources.tasks.enabled) {
    sources.push(taskSource(ctx, config.sources.tasks))
  }
  runtime = new Runtime(ctx, sources, {
    workspaceRoot: config.workspaceRoot,
    sourceBotId: config.sources.im.botId,
    decideModel: config.proactive.decideModel,
    decideIntervalMinutes: config.proactive.intervalMinutes,
    notify: config.notify,
    postToFeed: config.notify.postToFeed,
    notifyBudgetPerDay: config.proactive.notifyBudgetPerDay,
    notifyMinIntervalMinutes: config.proactive.notifyMinIntervalMinutes,
    notebookPath: config.notebook.path,
    briefing: config.briefing,
    worker: config.worker,
    seedLoops: config.loops,
  })
  ctx.effect(() => async () => { await runtime.stop() })
  await runtime.ready
  ctx.logger.info('mino-call ready (%d source%s)', sources.length, sources.length === 1 ? '' : 's')
}

export * from './domain.ts'
export * from './source.ts'
export * from './decide.ts'
export * from './notebook.ts'
export * from './tasks.ts'
export { ROUTER_PRESET, ROUTER_SESSION_ID, Runtime, type RuntimeOptions } from './runtime.ts'
