/** The source port: producers normalize inbound evidence into items the runtime groups into matters. */
import type { Context } from '@deepseek-ai/cordis'

export interface NewItem {
  sourceKind: string
  /** Stable id at the source; combined with sourceKind into the item's dedup key. */
  externalId: string
  /** Deterministic grouping key: items sharing it land on one matter. */
  groupKey: string
  summary: string
}

export interface SourceHost {
  readonly logger: Context['logger']
  /** Persist the item and group it onto an open matter. Idempotent on the item key. */
  emit(item: NewItem): Promise<void>
  /** Report a pairing blockage once per state change; the host surfaces it on the router session. */
  pairingStatus(status: 'unavailable' | 'none' | 'ambiguous', candidates?: string[]): Promise<void>
}

/** A source runs until its signal aborts; it owns its retry policy. */
export interface Source {
  readonly kind: string
  run(host: SourceHost, signal: AbortSignal): Promise<void>
}
