/**
 * Wake-turn observer: after a wake turn settles, derive its decision from the
 * committed session log so the budget and the persistent run record are
 * grounded in durable evidence, not in the driver's assumptions.
 *
 * Analysis is log-slice based: the driver records the event index before
 * follow-up, then scans the appended slice for the turn boundary, tool calls,
 * and the final assistant message. The slice is anchored to the wake framing
 * notice (user/message with source.kind=plugin) so a pending pre-wake turn is
 * never misattributed. A settled turn with no visible chat text is
 * "no_reply" (deep silence); compaction is explicit opt-in — ONLY a
 * proactive_reclaim call marks the turn compactable (reclaimable). Everything
 * else (implicit silence, any other tool's silence, failed turns) keeps the
 * exchange on the model surface. Visible chat text is charged one budget unit.
 */
import { type RunDecision } from "./domain.js";
/** The subset of a session event we inspect. */
export interface MinimalEvent {
    type: string;
    data: Record<string, unknown>;
}
export interface WakeAnalysis {
    decision: RunDecision;
    budgetDelta: number;
    toolNames: string[];
    hasText: boolean;
    note?: string;
    /** Truncated reasoning (thinking) summary of the turn, for the run history. */
    reasoningSummary?: string;
    /** Truncated visible-reply summary of the turn, for the run history. */
    replySummary?: string;
    /** The proactive_reclaim reason the model gave for staying silent, for the run history. */
    noReplyReason?: string;
    /**
     * Whether the settled wake turn should be compacted off the model surface
     * (subject to the silentWakeCompaction gate in the driver). Compaction is
     * EXPLICIT OPT-IN: only a silence signaled by the proactive_reclaim tool
     * call reclaims the turn. Everything else — an implicit no-text turn, a
     * "no_reply" tool call (e.g. dsh-im's), a visible reply, or a failed/aborted
     * turn — keeps the exchange on the model surface. Nothing is erased unless
     * the model asserted the turn is reclaimable.
     */
    compactable: boolean;
}
/** Per-field summary cap for the run history (reasoning + reply are stored truncated). */
export declare const RUN_SUMMARY_MAX_LENGTH = 200;
/** Collapse one summary field to at most RUN_SUMMARY_MAX_LENGTH characters. */
export declare function truncateSummary(text: string): string;
export declare function extractTextBlocks(data: Record<string, unknown>): string[];
/** Reasoning (thinking) block texts from one assistant/message event, same shapes as text. */
export declare function extractReasoningBlocks(data: Record<string, unknown>): string[];
/**
 * True when one session event is our wake framing notice. Anchors on the
 * plugin source AND the framing marker so compaction tombstones (same plugin,
 * different marker) are never mistaken for a fresh framing.
 */
export declare function isFramingNotice(event: MinimalEvent): boolean;
/**
 * Analyze the event slice that starts at startIndex (inclusive) and covers the
 * wake turn. Returns a stable decision with the budget delta applied.
 */
export declare function analyzeWakeTurn(events: readonly MinimalEvent[], startIndex: number): WakeAnalysis;
