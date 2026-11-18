/** webwatch source: polls the webwatch plugin's watch_scan through the official tools executor.
 *
 * Only public seams: `ctx.get('tools').execute(...)` — no import of webwatch internals,
 * no read of its storage. Absent tool = the plugin isn't installed; the source idles.
 */
import type { Context } from '@deepseek-ai/cordis'
import type { Source, SourceHost } from '../source.ts'

export const WEBWATCH_SOURCE = 'webwatch'
const RETRY_MS = 15_000

/** The `tools` service execution face (ToolsService.execute → selected executor, agent optional). */
interface ToolsExecFace {
  execute(input: {
    calls: readonly { type: 'tool-call'; id: string; name: string; arguments: string }[]
    signal: AbortSignal
  }): Promise<{
    results: readonly { callId: string; result: { isError: boolean; value?: unknown; error?: { message?: string } } }[]
  }>
}

/** watch_scan output rows (its output.schema contract). */
interface WatchHit {
  site: string
  browser: string
  when: string
  title: string
  url: string
  hint: string
}

export interface WebwatchSourceConfig {
  /** Poll interval in minutes. */
  intervalMinutes: number
  /** Lookback days per scan (watch_scan clamps 1..365). */
  days: number
}

const pause = (ms: number, signal: AbortSignal): Promise<void> =>
  new Promise(resolve => {
    if (signal.aborted) return resolve()
    const timer = setTimeout(resolve, ms)
    signal.addEventListener('abort', () => { clearTimeout(timer); resolve() }, { once: true })
  })

export function webwatchSource(ctx: Context, config: WebwatchSourceConfig): Source {
  let warnedMissing = false
  return {
    kind: WEBWATCH_SOURCE,
    async run(host, signal) {
      while (!signal.aborted) {
        const tools = ctx.get('tools') as ToolsExecFace | undefined
        if (!tools?.execute) {
          await pause(RETRY_MS, signal)
          continue
        }
        try {
          const { results } = await tools.execute({
            calls: [{
              type: 'tool-call',
              id: 'mino-call-watch-scan',
              name: 'watch_scan',
              arguments: JSON.stringify({ days: config.days }),
            }],
            signal,
          })
          const res = results[0]?.result
          if (res && !res.isError) {
            warnedMissing = false
            const hits = (res.value as { hits?: WatchHit[] } | undefined)?.hits ?? []
            for (const hit of hits) {
              await host.emit({
                sourceKind: WEBWATCH_SOURCE,
                // 同一订单页反复访问不重复成项——call 按 sourceKind+externalId 幂等去重。
                externalId: `${hit.site}|${hit.url}`,
                groupKey: `webwatch:${hit.site}`,
                summary: `[${hit.site}] ${hit.when} ${hit.title || hit.url} — ${hit.hint}`.slice(0, 500),
              })
            }
          } else if (!warnedMissing) {
            warnedMissing = true
            host.logger.info('mino-call webwatch: watch_scan unavailable (%s)；装好 webwatch 插件后自动生效', res?.error?.message ?? 'tool missing')
          }
        } catch (error) {
          if (!warnedMissing) {
            warnedMissing = true
            host.logger.info('mino-call webwatch: scan failed, will retry silently: %s', String(error))
          }
        }
        await pause(config.intervalMinutes * 60_000, signal)
      }
    },
  }
}
