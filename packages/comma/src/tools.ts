/** Model-facing router tools: matter lifecycle and IM pairing over the comma domain. */
import type { Context } from '@deepseek-ai/cordis'
import type { Domain } from '@deepseek-ai/dsh-storage-domain'
import { z } from 'zod'
import type { commaDomain, Matter } from './domain.ts'
import { NOTIFY_URGENCIES } from './decide.ts'
import { SELECTED_BOT_KEY } from './resolve.ts'

type CommaDomain = Domain<typeof commaDomain>

export const PAIRING_NAG_KEY = 'pairing_nag'
const PAIRING_NAG_RESOLVED = 'resolved'

/** Host surface the router tools read and mutate through. */
export interface RouterToolsHost {
  ctx: Context
  /** Lazily resolved: the agent may materialize before the runtime finishes opening the domain. */
  domain(): CommaDomain
  ready(): Promise<void>
  /** Marks the notebook dirty so lifecycle edits render on the next tick. */
  onChanged(): void
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
        return { paired: current, candidates, hint: candidates.length ? 'call again with botId to select one' : 'no IM bot is configured in mino-im yet' }
      }
      if (!candidates.includes(args.botId)) return { error: 'unknown-bot', paired: current, candidates }
      await state.put(SELECTED_BOT_KEY, { key: SELECTED_BOT_KEY, value: args.botId })
      await state.put(PAIRING_NAG_KEY, { key: PAIRING_NAG_KEY, value: PAIRING_NAG_RESOLVED })
      return { ok: true, paired: args.botId, changed: current !== args.botId }
    },
  }

  return [matters, done, snooze, pair] as ToolSchema<unknown>[]
}
