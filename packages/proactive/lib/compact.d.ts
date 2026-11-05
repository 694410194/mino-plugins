/**
 * Post-settle wake-slice compaction: after a wake turn ends with nothing
 * user-visible (deep silence via proactive_reclaim, or a turn that produced
 * no output),
 * rewrite the model-visible surface so the exchange — framing notice,
 * assistant reasoning/tool-call, tool result — collapses to a ~70-byte
 * tombstone plus a one-line fold notice. This is the mechanism that keeps
 * hourly reminders from polluting a long session's context: the raw session
 * log keeps every event (the GUI transcript renders append-origin events, so
 * the wake exchange stays visible to the human), while the LLM message
 * surface — what deriveMessages folds for every future request — sees only
 * the tombstone and the notice.
 *
 * The platform's surface-replacement channel (dsh-session SurfaceOp
 * `{op:"replace", startSeq, endSeq}`; "any surface-replacing producer may use
 * it") is used once per owned run, always with a `user/message`:
 *   - the run containing the framing is replaced by a one-line tombstone
 *     (distinct marker, never mistaken for a fresh framing);
 *   - every other owned run (assistant/tool events of the wake turn) is
 *     replaced by a one-line fold notice.
 *
 * The replacement MUST be a user/message: the platform rejects an
 * `assistant/message` as a surface replacement ("assistant/message embeds its
 * source stream and cannot carry sourceEventSeqs"), so the earlier
 * empty-content assistant "eraser" is not expressible. The fold notice is
 * ~55 bytes and carries no tool payload, which is what the context budget
 * actually cares about.
 *
 * Runs are split around anything the wake did not author (runtime-context
 * snapshots, mnemon instructions, user messages that raced in mid-turn):
 * those stay on the surface untouched. Shadowing a runtime-context snapshot
 * would null the agent-loop's retained projection and force a full fresh
 * snapshot next turn — strictly worse than leaving it alone.
 *
 * Every append is validated by the session's SurfaceManager before it
 * commits: if a concurrent compaction already shadowed our range, the append
 * throws and we skip that run (logged, never fatal).
 */
import { type UserMessage } from "@deepseek-ai/dsh-llm";
import { type Alarm, type AlarmCompaction } from "./domain.js";
/** First token of every compaction tombstone; distinct from FRAMING_MARKER. */
export declare const TOMBSTONE_MARKER = "[dsh-proactive silent wake ";
/** The raw events we inspect (a superset of observer's MinimalEvent: seq + surfaceOp). */
export interface CompactEvent {
    seq: number;
    type: string;
    data: Record<string, unknown>;
    surfaceOp?: unknown;
}
/**
 * Narrow append surface the compaction needs; the platform Session satisfies
 * this structurally. Kept interface-local so the driver stays testable with
 * fakes that only implement append.
 */
export interface CompactSession {
    append(type: "user/message", data: UserMessage, opts: unknown): unknown;
}
/** One owned surface range to be collapsed, plus how to collapse it. */
export interface WakeCompactionRun {
    /** Seqs of the owned surface nodes, ascending; [0] and [at(-1)] bound the replace range. */
    seqs: number[];
    /** True when this run contains the framing notice (replaced by the tombstone). */
    framing: boolean;
}
/** The full compaction plan for one settled wake turn. */
export interface WakeCompactionPlan {
    runs: WakeCompactionRun[];
}
/**
 * The tombstone text that replaces the framing run. Under `minimal` compaction
 * the proactive_reclaim reason is appended so later turns can see why the wake
 * stayed silent; `aggressive` (and a reason-less `minimal`) keep only id + time.
 */
export declare function tombstoneText(alarm: Alarm, firedAt: Date, compaction: AlarmCompaction, reason?: string): string;
/**
 * Plan the compaction of the wake turn that starts at or after startIndex:
 * partition the turn's OWNED surface nodes (framing + assistant/tool events,
 * up to the wake turn's turn/end) into surface-contiguous runs. Anything the
 * wake did not author breaks a run and is left untouched. Returns undefined
 * when no framing notice is found in the slice.
 */
export declare function planWakeCompaction(events: readonly CompactEvent[], startIndex: number): WakeCompactionPlan | undefined;
/**
 * Apply one compaction plan to the live session. Each run becomes a single
 * user/message surface replacement appended after the settled turn: the
 * tombstone for a framing run, a one-line fold notice for an assistant/tool
 * run. Any validation failure (range no longer on the surface) skips that run
 * with a warn.
 * @returns true when at least the framing run was collapsed.
 */
export declare function applyWakeCompaction(session: CompactSession, plan: WakeCompactionPlan, alarm: Alarm, firedAt: Date, compaction: AlarmCompaction, reason: string | undefined, log: (level: "info" | "warn" | "error", message: string) => void): boolean;
/** Build the tombstone user message that replaces the framing run. */
export declare function createTombstoneMessage(alarm: Alarm, firedAt: Date, compaction: AlarmCompaction, reason?: string): UserMessage;
/** The one-line text that replaces an assistant/tool exchange run. */
export declare function exchangeNoticeText(alarm: Alarm): string;
/** Build the notice user message that replaces an assistant/tool exchange run. */
export declare function createExchangeNoticeMessage(alarm: Alarm): UserMessage;
