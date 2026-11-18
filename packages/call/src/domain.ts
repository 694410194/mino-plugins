/**
 * The `call` storage domain: durable entity tables behind the plugin's ports.
 * Domain and table names must match UNIT_NAME_RE (`[a-z][a-z0-9_]*`).
 */
import { defineDomain, domainTable } from '@deepseek-ai/dsh-storage-domain'
import { z } from 'zod'

/** Attention urgency bands, mirroring Call's `decide` output. */
export const MATTER_URGENCIES = ['critical', 'high', 'ask', 'normal', 'low'] as const
export type MatterUrgency = (typeof MATTER_URGENCIES)[number]

export const MATTER_STATUSES = ['open', 'snoozed', 'waiting', 'done'] as const
export type MatterStatus = (typeof MATTER_STATUSES)[number]

export const TASK_STATUSES = ['open', 'working', 'needs_review', 'done', 'failed', 'cancelled'] as const
export type TaskStatus = (typeof TASK_STATUSES)[number]

/** A task is the unit of proactive execution: work the router delegated to a worker. */
export const Task = z.object({
  id: z.string(),
  title: z.string(),
  goal: z.string(),
  status: z.enum(TASK_STATUSES),
  /** 'dsh-session' = 起 preset worker 会话；'cli' = ctx.subprocess 起外部命令行 agent。 */
  workerKind: z.enum(['dsh-session', 'cli']),
  workerSessionId: z.string().optional(),
  /** needs_review 时等用户拍板的问题。 */
  question: z.string().optional(),
  /** done 时的交付摘要。 */
  result: z.string().optional(),
  failure: z.string().optional(),
  /** 来源 matter（信号→干活链路）。 */
  matterId: z.string().optional(),
  rounds: z.number(),
  createdAt: z.number(),
  updatedAt: z.number(),
})
export type Task = z.infer<typeof Task>

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
  /** 确定性前置闸：先跑这个公开工具，输出与 checkpoint 相同则本轮静默（零 LLM token）。 */
  checkTool: z.string().optional(),
  checkArgs: z.string().optional(),
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

export const callDomain = defineDomain({
  name: 'call',
  version: 1,
  tables: {
    matters: domainTable<string, Matter>(Matter),
    source_items: domainTable<string, SourceItem>(SourceItem),
    tasks: domainTable<string, Task>(Task),
    loops: domainTable<string, Loop>(Loop),
    state: domainTable<string, StateRow>(StateRow),
  },
})
