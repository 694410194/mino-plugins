/**
 * Wake framing: the deterministic user-role message that starts every
 * proactive turn, plus the notice-form source that keeps it restrained in
 * the GUI (renders as a context chip, not a user bubble) and the reply
 * rule that lets the model end the turn silently.
 *
 * v3 (260908-wake-context-minimization): the framing is deliberately tiny.
 * Hourly reminders over long sessions must not pollute model context, so
 * every byte here is paid on EVERY fire: the rendered text carries only the
 * alarm identity, the current time, the not-from-user marker, the alarm's
 * own prompt (verbatim — the only irreplaceable content), and one reply
 * rule. Budget mechanics, quiet-hours windows, wake-type glosses, and the
 * JSON/untrusted-data envelope of v2 were dropped: the host enforces the
 * gates, and post-settle compaction (see compact.ts) erases the whole
 * exchange from the model surface when the wake ends silent, leaving a
 * ~80-byte tombstone instead.
 */
import { type UserMessage } from "@deepseek-ai/dsh-llm";
import { type Alarm } from "./domain.js";
export type UserPresence = "live" | "cold";
export interface FramingContext {
    alarm: Alarm;
    /** Whether the wake fires inside the configured quiet window. */
    quiet: boolean;
    now: Date;
    userPresence: UserPresence;
}
/**
 * First token of every rendered wake framing. The observer anchors wake-turn
 * analysis on framing notices (never on compaction tombstones), so the marker
 * must stay distinct from {@link TOMBSTONE_MARKER} in compact.ts.
 */
export declare const FRAMING_MARKER = "[dsh-proactive wake ";
/**
 * Session-format v4 producer-owned source kind for this plugin's durable
 * messages. v4 retired the v3 `{kind:"plugin", plugin}` wrapper — the v4
 * write path (encodeEvent row admission) rejects it with "format v4 message
 * requires a producer-owned source kind", which broke every wake whose
 * framing hit the disk (see docs/issues/260102-proactive-not-firing/). The
 * producer now rides inside the kind itself, exactly like the released
 * v3-to-v4 migration rewrites historical rows.
 */
export declare const PROACTIVE_SOURCE_KIND: string;
/**
 * Notice-form producer source in the v4 shape. Cast once here because the
 * dev-mirror dsh-llm (0.1.1-rc.2) still types the retired v3 plugin wrapper
 * as the only plugin source; the runtime host is already on producer-owned
 * kinds and its union has no member for them.
 */
export declare function proactiveNoticeSource(summary: string): UserMessage["source"];
/** The instruction text the wake turn should actually follow: the alarm's own prompt. */
export declare function effectiveWakePrompt(ctx: FramingContext): string;
/**
 * Render `now` as the alarm's local wall-clock time, numeric offset, and IANA
 * zone, e.g. `2026-09-10 09:25:51 (+08:00, Asia/Shanghai)`. The old UTC-only
 * `toISOString()` hid the local time from the model; projecting into the
 * alarm's canonical zone (see canonicalizeTimeZone) makes "now" read as the
 * user's local time. Uses the same DST-correct projection machinery
 * (makeLocalFormatter/localProjection, with the robust longOffset parsing) as
 * domain.ts — never a hand-rolled offset string. Same ISO-shaped + offset +
 * zone convention as dsh-time-context's durable readings.
 */
export declare function formatFramingTime(now: Date, timeZone: string): string;
/** The full wake prompt handed to the model (header + facts + alarm prompt + reply rule). */
export declare function renderFraming(ctx: FramingContext): string;
/** Build the immutable user-role wake message with notice form (restrained chip in the GUI). */
export declare function createFramingMessage(ctx: FramingContext): UserMessage;
