/** IM source: consumes inbound messages through the mino-im `dshIm` exclusive-consumer contract. */
import type { Context } from '@deepseek-ai/cordis'
import { z } from 'zod'
import type { Source, SourceHost } from '../source.ts'

export const IM_SOURCE = 'im'
const RETRY_MS = 15_000

/** The `dshIm` same-host service surface (mino-im contractVersion/inboundVersion 1). */
interface DshIm {
  contractVersion?: number
  inboundVersion?: number
  describeBot(botId: string): Promise<{ account: { id?: string; fingerprint: string } }>
  consumeInbound(botId: string, options: {
    expectedFingerprint: string
    signal: AbortSignal
    onEvent(event: unknown, ctx: { signal: AbortSignal }): Promise<{ accepted: boolean }>
  }): Promise<() => void>
}

const EventSchema = z.looseObject({
  botId: z.string(),
  eventId: z.string(),
  messageId: z.string(),
  actor: z.looseObject({ kind: z.string().default('user'), id: z.string() }),
  conversation: z.looseObject({ kind: z.enum(['group', 'dm']), id: z.string() }),
  at: z.string(),
  text: z.string().default(''),
  reply: z.looseObject({ rootId: z.string().optional(), threadId: z.string().optional() }),
})

const pause = (ms: number, signal: AbortSignal): Promise<void> =>
  new Promise(resolve => {
    if (signal.aborted) return resolve()
    const timer = setTimeout(resolve, ms)
    signal.addEventListener('abort', () => { clearTimeout(timer); resolve() }, { once: true })
  })

/** Group key: a DM is one thread; a group message groups under its root when present. */
const groupKeyOf = (event: z.infer<typeof EventSchema>): string =>
  event.conversation.kind === 'dm'
    ? `im:${event.conversation.id}`
    : `im:${event.conversation.id}:${event.reply.rootId ?? event.messageId}`

export interface ImSourceConfig {
  botId: string
}

/** Requires mino-im with the account in external-consumer exclusive mode. */
export function imSource(ctx: Context, config: ImSourceConfig): Source {
  return {
    kind: IM_SOURCE,
    async run(host, signal) {
      while (!signal.aborted) {
        const dshim = ctx.get('dshIm') as DshIm | undefined
        if (!dshim?.consumeInbound) {
          host.logger.info('mino-comma im: mino-im not installed; retrying')
          await pause(RETRY_MS, signal)
          continue
        }
        try {
          const { account } = await dshim.describeBot(config.botId)
          const selfIds = new Set([config.botId, account.id ?? ''])
          const release = await dshim.consumeInbound(config.botId, {
            expectedFingerprint: account.fingerprint,
            signal,
            async onEvent(raw, { signal: eventSignal }) {
              eventSignal?.throwIfAborted()
              try {
                const event = EventSchema.parse(raw)
                if (!selfIds.has(event.actor.id) && event.actor.kind !== 'app') {
                  await host.emit({
                    sourceKind: IM_SOURCE,
                    externalId: event.messageId,
                    groupKey: groupKeyOf(event),
                    summary: event.text.slice(0, 500),
                  })
                }
              } catch (error) {
                host.logger.warn('mino-comma im: dropped inbound event: %s', String(error))
              }
              return { accepted: true }
            },
          })
          host.logger.info('mino-comma im: consuming bot %s', config.botId)
          await new Promise<void>(resolve => {
            if (signal.aborted) return resolve()
            signal.addEventListener('abort', () => resolve(), { once: true })
          })
          release()
        } catch (error) {
          if (signal.aborted) return
          host.logger.warn('mino-comma im: consumer error, retrying: %s', String(error))
          await pause(RETRY_MS, signal)
        }
      }
    },
  }
}
