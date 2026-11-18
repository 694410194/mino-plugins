/** calendar source: polls the connector-calendar plugin's cal_sync/cal_upcoming through the official tools executor.
 *
 * Only public seams: `ctx.get('tools').execute(...)` — no import of calendar internals, no read
 * of its sqlite store or CalDAV creds (owned by connector-calendar's own config). cal_sync is
 * best-effort (absent creds → the tool errors; imported .ics events still surface via cal_upcoming).
 */
import type { Context } from '@deepseek-ai/cordis'
import type { Source, SourceHost } from '../source.ts'

export const CALENDAR_SOURCE = 'calendar'
const RETRY_MS = 15_000

interface ToolsExecFace {
  execute(input: {
    calls: readonly { type: 'tool-call'; id: string; name: string; arguments: string }[]
    signal: AbortSignal
  }): Promise<{
    results: readonly { callId: string; result: { isError: boolean; value?: unknown; error?: { message?: string } } }[]
  }>
}

/** cal_upcoming output row (its output.schema contract). */
interface CalEvent {
  dtstart: string
  dtend: string
  summary: string
  location: string
}

export interface CalendarSourceConfig {
  /** Poll interval in minutes. */
  intervalMinutes: number
  /** Lookahead days per poll (cal_upcoming clamps internally). */
  days: number
  /** Also attempt cal_sync (CalDAV pull) before reading upcoming. */
  sync: boolean
}

const pause = (ms: number, signal: AbortSignal): Promise<void> =>
  new Promise(resolve => {
    if (signal.aborted) return resolve()
    const timer = setTimeout(resolve, ms)
    signal.addEventListener('abort', () => { clearTimeout(timer); resolve() }, { once: true })
  })

async function callTool(tools: ToolsExecFace, signal: AbortSignal, id: string, name: string, args: object) {
  const { results } = await tools.execute({
    calls: [{ type: 'tool-call', id, name, arguments: JSON.stringify(args) }],
    signal,
  })
  return results[0]?.result
}

export function calendarSource(ctx: Context, config: CalendarSourceConfig): Source {
  let warnedMissing = false
  return {
    kind: CALENDAR_SOURCE,
    async run(host, signal) {
      while (!signal.aborted) {
        const tools = ctx.get('tools') as ToolsExecFace | undefined
        if (!tools?.execute) {
          await pause(RETRY_MS, signal)
          continue
        }
        try {
          if (config.sync) await callTool(tools, signal, 'mino-call-cal-sync', 'cal_sync', {}) // best-effort
          const res = await callTool(tools, signal, 'mino-call-cal-upcoming', 'cal_upcoming', { days: config.days })
          if (res && !res.isError) {
            warnedMissing = false
            const events = (res.value as { events?: CalEvent[] } | undefined)?.events ?? []
            for (const ev of events) {
              await host.emit({
                sourceKind: CALENDAR_SOURCE,
                externalId: `${ev.dtstart}|${ev.summary}`,
                // 按天归组：同一天的临近日程进同一 matter（「明天的安排」），不是每事件一摊。
                groupKey: `calendar:${String(ev.dtstart).slice(0, 10)}`,
                summary: `[日程] ${ev.dtstart}${ev.dtend ? `→${ev.dtend}` : ''} ${ev.summary}${ev.location ? ` @${ev.location}` : ''}`.slice(0, 500),
              })
            }
          } else if (!warnedMissing) {
            warnedMissing = true
            host.logger.info('mino-call calendar: cal_upcoming unavailable (%s)；装好 connector-calendar 后自动生效', res?.error?.message ?? 'tool missing')
          }
        } catch (error) {
          if (!warnedMissing) {
            warnedMissing = true
            host.logger.info('mino-call calendar: poll failed, will retry silently: %s', String(error))
          }
        }
        await pause(config.intervalMinutes * 60_000, signal)
      }
    },
  }
}
