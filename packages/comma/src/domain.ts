/**
 * The `comma` storage domain: durable entity tables behind the plugin's ports.
 * Domain and table names must match UNIT_NAME_RE (`[a-z][a-z0-9_]*`).
 */
import { defineDomain, domainTable } from '@deepseek-ai/dsh-storage-domain'
import { z } from 'zod'

/** Attention urgency bands, mirroring Comma's `decide` output. */
export const MATTER_URGENCIES = ['critical', 'high', 'ask', 'normal', 'low'] as const
export type MatterUrgency = (typeof MATTER_URGENCIES)[number]

export const MATTER_STATUSES = ['open', 'snoozed', 'waiting', 'done'] as const
export type MatterStatus = (typeof MATTER_STATUSES)[number]

/** A matter is the unit of proactive attention: grouped source items needing a decision. */
export const Matter = z.object({
  id: z.string(),
  /** Deterministic grouping key from the producing source (e.g. an IM thread). */
  groupKey: z.string(),
  title: z.string(),
  urgency: z.enum(MATTER_URGENCIES),
  status: z.enum(MATTER_STATUSES),
  /** Last decide outcome; re-judged whenever items arrive after `decidedAt`. */
  decision: z.enum(['notify', 'quiet', 'snooze']).optional(),
  decidedAt: z.number().optional(),
  notifiedAt: z.number().optional(),
  sourceItemIds: z.array(z.string()),
  createdAt: z.number(),
  updatedAt: z.number(),
  snoozedUntil: z.number().optional(),
})
export type Matter = z.infer<typeof Matter>

/** A normalized item collected from a connected source before matter grouping. */
export const SourceItem = z.object({
  /** `sourceKind:externalId` — deterministic, so redelivery dedupes idempotently. */
  id: z.string(),
  sourceKind: z.string(),
  externalId: z.string(),
  groupKey: z.string(),
  summary: z.string(),
  receivedAt: z.number(),
  matterId: z.string().optional(),
})
export type SourceItem = z.infer<typeof SourceItem>

/** A durable background Loop: a periodic watch that wakes the router Session. */
export const Loop = z.object({
  id: z.string(),
  name: z.string(),
  everyMinutes: z.number(),
  prompt: z.string(),
  enabled: z.boolean(),
  lastRunAt: z.number().optional(),
  checkpoint: z.string().optional(),
})
export type Loop = z.infer<typeof Loop>

/** Small singleton rows: router session id, per-source cursors, budget counters. */
export const StateRow = z.object({
  key: z.string(),
  value: z.string(),
})
export type StateRow = z.infer<typeof StateRow>

export const commaDomain = defineDomain({
  name: 'comma',
  version: 1,
  tables: {
    matters: domainTable<string, Matter>(Matter),
    source_items: domainTable<string, SourceItem>(SourceItem),
    loops: domainTable<string, Loop>(Loop),
    state: domainTable<string, StateRow>(StateRow),
  },
})
