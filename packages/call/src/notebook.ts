/** The notebook projection: a rendered Markdown view over matters and tasks — no model writes, ever. */
import type { Matter, SourceItem, Task } from './domain.ts'

const URGENCY_ORDER: Record<string, number> = { critical: 0, high: 1, ask: 2, normal: 3, low: 4 }

const stamp = (at: number): string => new Date(at).toLocaleString()

function section(title: string, rows: string[]): string[] {
  return rows.length === 0 ? [] : [`## ${title}`, '', ...rows, '']
}

/** Render the whole notebook. `items` resolves each matter's latest evidence; `tasks` renders the worker board. */
export function renderNotebook(matters: Matter[], items: Map<string, SourceItem>, now = Date.now(), tasks: Task[] = []): string {
  const open = matters.filter(m => m.status === 'open').sort((a, b) => (URGENCY_ORDER[a.urgency] ?? 9) - (URGENCY_ORDER[b.urgency] ?? 9) || b.updatedAt - a.updatedAt)
  const needs = open.filter(m => m.decision === 'notify' || ['critical', 'high', 'ask'].includes(m.urgency))
  const waiting = open.filter(m => !needs.includes(m) && m.status === 'open' && m.decision !== 'quiet')
  const quiet = open.filter(m => m.decision === 'quiet' || m.urgency === 'low')
  const snoozed = matters.filter(m => m.status === 'snoozed')
  const done = matters.filter(m => m.status === 'done').sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 10)

  const latest = (m: Matter): string => {
    const last = m.sourceItemIds.map(id => items.get(id)).filter(Boolean).at(-1)
    return last ? ` — ${last.summary.slice(0, 80)}` : ''
  }

  const liveTasks = tasks.filter(t => t.status !== 'done' && t.status !== 'cancelled').sort((a, b) => b.updatedAt - a.updatedAt)
  const taskRow = (t: Task): string => {
    const tail = t.status === 'needs_review' && t.question ? ` — ${t.question.slice(0, 60)}` : ''
    return `- **[${t.status}]** ${t.title}${tail} · ${stamp(t.updatedAt)}`
  }

  const lines: string[] = [
    '# Call Notebook', '',
    `Rendered ${stamp(now)} · ${open.length} open · ${done.length} recently done`, '',
    ...section('任务板', liveTasks.map(taskRow)),
    ...section('需要你', needs.map(m => `- **[${m.urgency}]** ${m.title}${latest(m)} · ${stamp(m.updatedAt)}`)),
    ...section('等待中', waiting.map(m => `- ${m.title}${latest(m)} · ${stamp(m.updatedAt)}`)),
    ...section('静默中', quiet.map(m => `- ${m.title}${latest(m)} · decided ${stamp(m.decidedAt ?? m.updatedAt)}`)),
    ...section('已推迟', snoozed.map(m => `- ${m.title} · until ${m.snoozedUntil ? stamp(m.snoozedUntil) : '?'}`)),
    ...section('已完成', done.map(m => `- ${m.title} · ${stamp(m.updatedAt)}`)),
  ]
  return lines.join('\n')
}
