/** The decide step: judge open matters' urgency, gate notifications by budget, and act. */
import type { Context } from '@deepseek-ai/cordis'
import type { Matter, MatterUrgency, SourceItem } from './domain.ts'

/** The streaming slice of the `llm` service this sweep uses. */
export interface LlmStream {
  stream(options: {
    provider: string
    model: string
    system?: string
    messages: { role: 'user'; content: { type: 'text'; text: string }[] }[]
    maxTokens?: number
    temperature?: number
    signal?: AbortSignal
  }): AsyncIterable<{ type: string; text?: string }>
}

export interface DecideModel {
  provider: string
  model: string
}

const JUDGE_SYSTEM = `You judge how much each matter needs a person's attention. Reply with a JSON array only, no prose: [{"id":"<matter id>","urgency":"critical|high|ask|normal|low","title":"<short title>"}]. critical = act now, high = today, ask = needs an answer, normal = can wait, low = background noise.`

export function judgePrompt(matter: Matter, items: SourceItem[]): string {
  const lines = items.map(item => `- ${item.summary}`)
  return `Matter ${matter.id}\nCurrent title: ${matter.title}\nItems:\n${lines.join('\n')}`
}

/** Parse the judge's JSON array into an id→urgency map; unparseable replies drop out. */
export function parseJudgeResponse(text: string): Map<string, { urgency: MatterUrgency; title?: string }> {
  const out = new Map<string, { urgency: MatterUrgency; title?: string }>()
  const match = text.match(/\[[\s\S]*\]/)
  if (!match) return out
  try {
    for (const row of JSON.parse(match[0]) as unknown[]) {
      const r = row as { id?: string; urgency?: string; title?: string }
      if (typeof r?.id === 'string' && ['critical', 'high', 'ask', 'normal', 'low'].includes(r.urgency ?? '')) {
        out.set(r.id, { urgency: r.urgency as MatterUrgency, ...(typeof r.title === 'string' ? { title: r.title } : {}) })
      }
    }
  } catch { /* unparseable judge output yields an empty map */ }
  return out
}

const URGENT_RE = /urgent|asap|紧急|报警|宕机|失败|failed|down|critical|立即|马上|deadline/i
const ASK_RE = /\?|？|请问|能不能|可以吗|帮忙|帮个忙/

/** Deterministic fallback when no judge model is configured. */
export function heuristicUrgency(matter: Matter, items: SourceItem[]): MatterUrgency {
  const text = items.map(item => item.summary).join('\n')
  if (URGENT_RE.test(text)) return 'high'
  if (ASK_RE.test(text)) return 'ask'
  return 'normal'
}

/** One batched judge call for the sweep's pending matters; undefined when no model is set. */
export async function judgeMatters(
  ctx: Context,
  model: DecideModel,
  pending: { matter: Matter; items: SourceItem[] }[],
  signal: AbortSignal,
): Promise<Map<string, { urgency: MatterUrgency; title?: string }> | undefined> {
  const llm = ctx.get('llm') as LlmStream | undefined
  if (!llm?.stream || pending.length === 0) return undefined
  const prompt = pending.map(({ matter, items }) => judgePrompt(matter, items)).join('\n\n')
  try {
    let text = ''
    for await (const chunk of llm.stream({
      provider: model.provider, model: model.model, system: JUDGE_SYSTEM,
      messages: [{ role: 'user', content: [{ type: 'text', text: prompt }] }],
      maxTokens: 1024, temperature: 0, signal,
    })) {
      if (chunk.type === 'text-delta' && typeof chunk.text === 'string') text += chunk.text
    }
    return parseJudgeResponse(text)
  } catch (error) {
    ctx.logger.warn('mino-comma decide: judge call failed, falling back to heuristics: %s', String(error))
    return undefined
  }
}

/** Urgency bands that hand the matter to the router. */
export const NOTIFY_URGENCIES: readonly MatterUrgency[] = ['critical', 'high', 'ask']

/** Rolling-day notification budget; persisted as one JSON state row. */
export interface NotifyBudget {
  day: string
  count: number
  lastAt: number
}

export const emptyBudget = (): NotifyBudget => ({ day: '', count: 0, lastAt: 0 })

const dayOf = (now: number): string => new Date(now).toISOString().slice(0, 10)

export function budgetAllows(budget: NotifyBudget, now: number, perDay: number, minIntervalMinutes: number): boolean {
  const today = dayOf(now)
  const count = budget.day === today ? budget.count : 0
  if (count >= perDay) return false
  return now - budget.lastAt >= minIntervalMinutes * 60_000
}

export function budgetSpend(budget: NotifyBudget, now: number): NotifyBudget {
  const today = dayOf(now)
  return { day: today, count: (budget.day === today ? budget.count : 0) + 1, lastAt: now }
}
