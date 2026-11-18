/** Model-facing router tools: matter lifecycle and IM pairing over the comma domain. */
import type { Context } from '@deepseek-ai/cordis'
import type { Domain } from '@deepseek-ai/dsh-storage-domain'
import { z } from 'zod'
import type { commaDomain, Matter, Task, Loop } from './domain.ts'
import { NOTIFY_URGENCIES } from './decide.ts'
import { SELECTED_BOT_KEY } from './resolve.ts'

type CommaDomain = Domain<typeof commaDomain>

export const PAIRING_NAG_KEY = 'pairing_nag'
const PAIRING_NAG_RESOLVED = 'resolved'

/** 任务执行面——由 runtime 注入，把「该干的活」委派成 Task 由 worker 执行。 */
export interface TaskOps {
  add(input: { title: string; goal: string; matterId?: string }): Promise<Task>
  list(): Task[]
  answer(taskId: string, answer: string): Promise<{ ok: boolean; error?: string }>
  cancel(taskId: string): Promise<{ ok: boolean; error?: string }>
  find(ref: string): { key: string } | { error: 'not-found' | 'ambiguous'; candidates: { id: string; title: string }[] }
}

export interface LoopOps {
  add(input: { name: string; everyMinutes: number; prompt: string; checkTool?: string; checkArgs?: string }): Promise<{ ok: boolean; id?: string }>
  list(): Loop[]
  remove(name: string): Promise<{ ok: boolean; error?: string }>
}

/** Host surface the router tools read and mutate through. */
export interface RouterToolsHost {
  ctx: Context
  /** Lazily resolved: the agent may materialize before the runtime finishes opening the domain. */
  domain(): CommaDomain
  ready(): Promise<void>
  /** Marks the notebook dirty so lifecycle edits render on the next tick. */
  onChanged(): void
  tasks?: TaskOps
  loops?: LoopOps
}

const URGENCY_RANK: Record<Matter['urgency'], number> = { critical: 0, high: 1, ask: 2, normal: 3, low: 4 }

interface DshImDiscovery {
  listBots?(): Promise<string[]>
}

type MatterRef = { key: string; matter: Matter } | { error: 'not-found' | 'ambiguous'; candidates: { id: string; title: string }[] }

/** Resolve a user- or model-supplied reference: exact id, then unique title substring. */
function findMatter(domain: CommaDomain, ref: string): MatterRef {
  const table = domain.table('matters')
  const byId = table.get(ref)
  if (byId !== undefined) return { key: ref, matter: byId }
  const needle = ref.toLowerCase()
  const hits = [...table.entries()].filter(([, m]) => m.title.toLowerCase().includes(needle))
  if (hits.length === 1) return { key: hits[0]![0], matter: hits[0]![1] }
  return {
    error: hits.length === 0 ? 'not-found' : 'ambiguous',
    candidates: hits.slice(0, 8).map(([id, m]) => ({ id, title: m.title })),
  }
}

const openCandidates = (domain: CommaDomain): { id: string; title: string }[] =>
  [...domain.table('matters').entries()]
    .filter(([, m]) => m.status === 'open')
    .slice(0, 8)
    .map(([id, m]) => ({ id, title: m.title }))

const json = (value: unknown) => [{ type: 'text' as const, text: JSON.stringify(value) }]

interface ToolSchema<A> {
  name: string
  description: string
  schema: z.ZodType<A>
  execute(args: A): Promise<unknown>
}

/** Registers the router tools on the agent scope; returns a disposer for plugin unload. */
export function registerRouterTools(agentCtx: Context, host: RouterToolsHost): () => void {
  const disposers = routerToolDefs(host).map(def =>
    agentCtx.tools.register({
      name: def.name,
      description: def.description,
      parameters: z.toJSONSchema(def.schema),
      output: { schema: { type: 'object', additionalProperties: true }, render: (_args, value) => json(value) },
      execute: async raw => {
        await host.ready()
        return def.execute(def.schema.parse(raw))
      },
    }))
  return () => { for (const d of disposers) d() }
}

/** The tool definitions; exported so tests can drive them without an agent. */
export function routerToolDefs(host: RouterToolsHost): ToolSchema<unknown>[] {
  const domain = () => host.domain()
  const latestOf = (m: Matter): string[] =>
    m.sourceItemIds.slice(-2).map(id => domain().table('source_items').get(id)?.summary).filter((s): s is string => s !== undefined)

  const matters: ToolSchema<{ status: 'open' | 'snoozed' | 'waiting' | 'done' | 'all'; limit: number }> = {
    name: 'comma_matters',
    description: 'List companion matters grouped from incoming sources. Use to answer "what is pending" and to find a matter id before calling comma_matter_done or comma_matter_snooze.',
    schema: z.object({
      status: z.enum(['open', 'snoozed', 'waiting', 'done', 'all']).default('open'),
      limit: z.number().int().min(1).max(50).default(20),
    }),
    async execute(args) {
      const all = [...domain().table('matters').entries()].map(([key, m]) => ({ key, m }))
      const counts = { open: 0, snoozed: 0, waiting: 0, done: 0 }
      for (const { m } of all) counts[m.status] += 1
      const picked = all
        .filter(({ m }) => args.status === 'all' || m.status === args.status)
        .sort((a, b) => URGENCY_RANK[a.m.urgency] - URGENCY_RANK[b.m.urgency] || b.m.updatedAt - a.m.updatedAt)
        .slice(0, args.limit)
        .map(({ key, m }) => ({
          id: key, title: m.title, urgency: m.urgency, status: m.status,
          needsYou: NOTIFY_URGENCIES.includes(m.urgency), updatedAt: m.updatedAt,
          ...(m.snoozedUntil !== undefined ? { snoozedUntil: m.snoozedUntil } : {}),
          latest: latestOf(m),
        }))
      return { counts, matters: picked }
    },
  }

  const done: ToolSchema<{ matter: string }> = {
    name: 'comma_matter_done',
    description: 'Mark a companion matter as handled. Accepts the matter id or a unique substring of its title.',
    schema: z.object({ matter: z.string().min(1) }),
    async execute(args) {
      const found = findMatter(domain(), args.matter)
      if ('error' in found) return { error: found.error, candidates: found.candidates.length ? found.candidates : openCandidates(domain()) }
      if (found.matter.status === 'done') return { ok: true, already: true, matterId: found.key, title: found.matter.title }
      await domain().table('matters').update(found.key, m => ({ ...m, status: 'done', updatedAt: Date.now() }))
      host.onChanged()
      return { ok: true, matterId: found.key, title: found.matter.title }
    },
  }

  const snooze: ToolSchema<{ matter: string; minutes?: number; until?: string }> = {
    name: 'comma_matter_snooze',
    description: 'Snooze a companion matter; it re-opens when the time passes. Accepts the matter id or a unique title substring, plus `minutes` from now or an ISO `until` timestamp.',
    schema: z.object({
      matter: z.string().min(1),
      minutes: z.number().int().min(1).optional(),
      until: z.string().optional(),
    }).refine(v => (v.minutes !== undefined) !== (v.until !== undefined), { message: 'pass exactly one of minutes/until' }),
    async execute(args) {
      const found = findMatter(domain(), args.matter)
      if ('error' in found) return { error: found.error, candidates: found.candidates.length ? found.candidates : openCandidates(domain()) }
      const at = args.minutes !== undefined ? Date.now() + args.minutes * 60_000 : Date.parse(args.until!)
      if (!Number.isFinite(at)) return { error: 'bad-until' }
      await domain().table('matters').update(found.key, m => ({ ...m, status: 'snoozed', snoozedUntil: at, updatedAt: Date.now() }))
      host.onChanged()
      return { ok: true, matterId: found.key, title: found.matter.title, snoozedUntil: at }
    },
  }

  const pair: ToolSchema<{ botId?: string }> = {
    name: 'comma_im_pair',
    description: 'Show or choose which IM bot comma watches. Without arguments returns the current pairing and the candidates from dshIm.listBots; pass a candidate botId to select it. Takes effect on the next source retry (~15s) for an unpaired source.',
    schema: z.object({ botId: z.string().min(1).optional() }),
    async execute(args) {
      const state = domain().table('state')
      const current = state.get(SELECTED_BOT_KEY)?.value ?? null
      const dshim = host.ctx.get('dshIm') as DshImDiscovery | undefined
      const candidates = dshim?.listBots !== undefined ? await dshim.listBots() : []
      if (args.botId === undefined) {
        return { paired: current, candidates, hint: candidates.length ? 'call again with botId to select one' : 'no IM bot is configured in @xmanrui/dsh-im yet' }
      }
      if (!candidates.includes(args.botId)) return { error: 'unknown-bot', paired: current, candidates }
      await state.put(SELECTED_BOT_KEY, { key: SELECTED_BOT_KEY, value: args.botId })
      await state.put(PAIRING_NAG_KEY, { key: PAIRING_NAG_KEY, value: PAIRING_NAG_RESOLVED })
      return { ok: true, paired: args.botId, changed: current !== args.botId }
    },
  }

  const defs: ToolSchema<unknown>[] = [matters, done, snooze, pair]

  if (host.tasks !== undefined) {
    const ops = host.tasks
    const openTaskCandidates = () =>
      ops.list().filter(t => t.status !== 'done' && t.status !== 'cancelled').slice(0, 8).map(t => ({ id: t.id, title: t.title }))
    const resolveTask = (ref: string) => {
      const found = ops.find(ref)
      return 'key' in found ? found.key : undefined
    }
    const taskErr = (ref: string) => {
      const found = ops.find(ref)
      return 'error' in found
        ? { error: found.error, candidates: found.candidates.length ? found.candidates : openTaskCandidates() }
        : { error: 'not-found', candidates: openTaskCandidates() }
    }

    const taskAdd: ToolSchema<{ title: string; goal: string; matterId?: string }> = {
      name: 'comma_task_add',
      description: 'Delegate real work to a comma task worker: give it a goal and it runs in its own session, reports back, and pauses for your decision when it truly needs one. Use when a matter or request needs hands-on work, not just a reminder.',
      schema: z.object({
        title: z.string().min(1).describe('Short task title'),
        goal: z.string().min(1).describe('What done looks like, with enough context for the worker to act'),
        matterId: z.string().optional().describe('Originating matter id when the task comes from a signal'),
      }),
      async execute(args) {
        const task = await ops.add(args)
        return { ok: true, taskId: task.id, status: task.status }
      },
    }
    const taskList: ToolSchema<{ status: 'open' | 'working' | 'needs_review' | 'done' | 'failed' | 'cancelled' | 'all'; limit: number }> = {
      name: 'comma_tasks',
      description: 'List delegated tasks on the board: working, needs_review, done, failed.',
      schema: z.object({
        status: z.enum(['open', 'working', 'needs_review', 'done', 'failed', 'cancelled', 'all']).default('all'),
        limit: z.number().int().min(1).max(50).default(20),
      }),
      async execute(args) {
        const all = ops.list()
        const counts: Record<string, number> = {}
        for (const t of all) counts[t.status] = (counts[t.status] ?? 0) + 1
        return {
          counts,
          tasks: all.filter(t => args.status === 'all' || t.status === args.status)
            .sort((a, b) => b.updatedAt - a.updatedAt).slice(0, args.limit)
            .map(t => ({ id: t.id, title: t.title, status: t.status, question: t.question, result: t.result, rounds: t.rounds, updatedAt: t.updatedAt })),
        }
      },
    }
    const taskAnswer: ToolSchema<{ task: string; answer: string }> = {
      name: 'comma_task_answer',
      description: 'Answer a task that is waiting for a decision (status needs_review); the worker resumes with your answer.',
      schema: z.object({
        task: z.string().min(1).describe('Task id or unique title substring'),
        answer: z.string().min(1).describe('Your decision / answer to the worker\'s question'),
      }),
      async execute(args) {
        const key = resolveTask(args.task)
        if (key === undefined) return taskErr(args.task)
        return ops.answer(key, args.answer)
      },
    }
    const taskCancel: ToolSchema<{ task: string }> = {
      name: 'comma_task_cancel',
      description: 'Cancel a delegated task.',
      schema: z.object({ task: z.string().min(1).describe('Task id or unique title substring') }),
      async execute(args) {
        const key = resolveTask(args.task)
        if (key === undefined) return taskErr(args.task)
        return ops.cancel(key)
      },
    }
    defs.push(taskAdd, taskList, taskAnswer, taskCancel)
  }

  if (host.loops !== undefined) {
    const ops = host.loops
    const loopAdd: ToolSchema<{ name: string; everyMinutes: number; prompt: string; checkTool?: string; checkArgs?: string }> = {
      name: 'comma_loop_add',
      description: 'Write a watch loop: runs your prompt on a schedule. Give checkTool+checkArgs (a public tool like mail_recent/cal_upcoming) to make quiet polls cost zero model calls — the prompt only fires when the check output changes.',
      schema: z.object({
        name: z.string().min(1).describe('Loop name (unique)'),
        everyMinutes: z.number().min(5).describe('Poll cadence, min 5'),
        prompt: z.string().min(1).describe('Instruction delivered to the router when the loop fires'),
        checkTool: z.string().optional().describe('Public tool to run each tick; prompt fires only when its output changes'),
        checkArgs: z.string().optional().describe('JSON arguments for checkTool'),
      }),
      async execute(args) { return ops.add(args) },
    }
    const loopList: ToolSchema<Record<string, never>> = {
      name: 'comma_loops',
      description: 'List watch loops.',
      schema: z.object({}),
      async execute() {
        return { loops: ops.list().map(l => ({ id: l.id, name: l.name, everyMinutes: l.everyMinutes, enabled: l.enabled, checkTool: l.checkTool, lastRunAt: l.lastRunAt })) }
      },
    }
    const loopRemove: ToolSchema<{ name: string }> = {
      name: 'comma_loop_remove',
      description: 'Remove a watch loop by name.',
      schema: z.object({ name: z.string().min(1) }),
      async execute(args) { return ops.remove(args.name) },
    }
    defs.push(loopAdd, loopList, loopRemove)
  }

  return defs
}
