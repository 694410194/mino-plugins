/** mail source: polls the connector-mail plugin's mail_recent/mail_search through the official tools executor.
 *
 * Only public seams: `ctx.get('tools').execute(...)` — no import of mail internals, no read of
 * its credential file (IMAP creds stay owned by the connector-mail plugin's own config). Absent
 * tool or missing creds = the source idles and retries; mail is opt-in by nature.
 */
import type { Context } from '@deepseek-ai/cordis'
import type { Source, SourceHost } from '../source.ts'

export const MAIL_SOURCE = 'mail'
const RETRY_MS = 15_000

interface ToolsExecFace {
  execute(input: {
    calls: readonly { type: 'tool-call'; id: string; name: string; arguments: string }[]
    signal: AbortSignal
  }): Promise<{
    results: readonly { callId: string; result: { isError: boolean; value?: unknown; error?: { message?: string } } }[]
  }>
}

/** mail_recent output row (its output.schema contract). */
interface MailRow {
  date: string
  from: string
  subject: string
}

export interface MailSourceConfig {
  /** Poll interval in minutes. */
  intervalMinutes: number
  /** How many recent mails to fetch per poll (tool clamps to 50). */
  limit: number
  /** Optional keywords additionally searched every poll (e.g. 订票/发票/验证码). */
  queries: string[]
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

const emitMail = async (host: SourceHost, mail: MailRow, via: string, groupKey: string) =>
  host.emit({
    sourceKind: MAIL_SOURCE,
    // date|subject 是 recent/search 两个面共有的稳定身份——mail_search 行没有 from 字段，
    // 同信经两个面命中时靠同 externalId 幂等去重，不会重复成项。
    externalId: `${mail.date}|${mail.subject}`,
    groupKey,
    summary: `[邮件${via}] ${mail.date} ${mail.from} — ${mail.subject}`.slice(0, 500),
  })

export function mailSource(ctx: Context, config: MailSourceConfig): Source {
  let warnedMissing = false
  const warnOnce = (host: SourceHost, why: string) => {
    if (warnedMissing) return
    warnedMissing = true
    host.logger.info('mino-comma mail: mail_recent unavailable (%s)；装好 connector-mail 并填 IMAP 授权码后自动生效', why)
  }
  return {
    kind: MAIL_SOURCE,
    async run(host, signal) {
      while (!signal.aborted) {
        const tools = ctx.get('tools') as ToolsExecFace | undefined
        if (!tools?.execute) {
          await pause(RETRY_MS, signal)
          continue
        }
        try {
          const res = await callTool(tools, signal, 'mino-comma-mail-recent', 'mail_recent', { limit: config.limit })
          if (res && !res.isError) {
            warnedMissing = false
            const mails = (res.value as { mails?: MailRow[] } | undefined)?.mails ?? []
            for (const mail of mails) await emitMail(host, mail, '', `mail:${mail.from || '未知发件人'}`)
            // 关键词侧查：命中 recent 窗口外的信单独归「mail-search:<q>」matter；
            // 已在 recent 面成项的信同 externalId 被去重，不会重复成项。
            for (const q of config.queries) {
              const sres = await callTool(tools, signal, `mino-comma-mail-search-${q}`, 'mail_search', { q, limit: config.limit })
              if (!sres || sres.isError) continue
              for (const mail of ((sres.value as { mails?: MailRow[] } | undefined)?.mails ?? [])) await emitMail(host, mail, `·${q}`, `mail-search:${q}`)
            }
          } else {
            warnOnce(host, res?.error?.message ?? 'tool missing')
          }
        } catch (error) {
          warnOnce(host, String(error))
        }
        await pause(config.intervalMinutes * 60_000, signal)
      }
    },
  }
}
