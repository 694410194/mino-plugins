/**
 * Host-level alarm scheduler for dsh-proactive.
 *
 * One serialized drive loop owns all firing decisions:
 *   - due detection (nextDueAt <= now), boot overdue policy, quiet-hours
 *     gating (respect=true occurrences inside the window are DROPPED: once
 *     alarms complete, repeating alarms fast-forward to the first anchor
 *     outside the window), hourly wake cap, and daily budget gating for
 *     alarms that respect quiet hours;
 *   - one alarm at a time through the WakeDriver, then advances its state
 *     from the analyzed outcome: once -> completed, every/cron -> next due;
 *   - bounded retries for busy/failed fires, coalesced re-arming.
 *
 * The loop never busy-waits: every pass ends by arming a single timer at the
 * nearest due alarm (split across the 24.8-day setTimeout ceiling) or by
 * scheduling an explicit deferral for busy/deferred outcomes.
 *
 * v2 (260907-proactive-alarm-v2): the alarm/heartbeat wake_reason split is
 * gone; `respectQuietHours` is a per-alarm switch. true = occurrences inside
 * quiet hours are skipped (no late re-delivery) and gated by the daily
 * budget; false = user-requested, quiet hours and budget exempt. Formal
 * gating order: quiet(+respect) -> hourly cap -> budget (+respect) -> fire.
 * every/cron jitter is pre-drawn into nextDueAt so this loop never waits.
 */
import type { Alarm, RunDecision } from "./domain.js";
import type { ProactiveConfig } from "./config.js";
import type { ProactiveStore } from "./store.js";
/** Wake-driver outcomes the scheduler translates into alarm transitions. */
export type WakeOutcome = "ok" | "busy" | "failed" | "skipped" | "defer";
export type FireResult = "completed" | "advanced" | "skipped" | "deferred" | "retry" | "failed";
export interface SchedulerDeps {
    store: ProactiveStore;
    config: ProactiveConfig;
    /**
     * Runs one alarm through the agent world; returns ok + analysis + the session the wake actually ran in (fork/new children differ from the owner).
     * "skipped" = no eligible destination (nothing was woken): the reason rides along for the run record.
     * "failed" carries the driver's error text so the run record states WHY the wake failed (observability: the cordis warn log is not persisted anywhere).
     */
    runWake: (alarm: Alarm) => Promise<{
        outcome: WakeOutcome;
        sessionId?: string;
        skipReason?: string;
        deferUntilMs?: number;
        error?: string;
        analysis?: {
            decision: RunDecision;
            budgetDelta: number;
            note?: string;
            reasoningSummary?: string;
            replySummary?: string;
            noReplyReason?: string;
        };
    }>;
    now?: () => number;
    /** Uniform(0,1) source for jittered repeats; defaults to Math.random. */
    random?: () => number;
    log: (level: "info" | "warn" | "error", message: string) => void;
}
export declare class ProactiveScheduler {
    private readonly deps;
    private readonly config;
    private timer;
    private driveChain;
    private driveRequested;
    private stopped;
    private retries;
    private recentFires;
    constructor(deps: SchedulerDeps);
    start(): void;
    stop(): void;
    /** Coalesced tick: at most one drive per macrotask. */
    requestDrive(): void;
    private now;
    /** Boot recovery: anything left in-flight resumes as overdue. */
    private recoverInFlight;
    private dueAlarms;
    private hourlyCapHit;
    private drive;
    private bootHandled;
    private applyBootOverdue;
    /** Gate + run one due alarm; returns the transition the loop should apply. */
    private fireOne;
    private bumpRetry;
    private recordRun;
    private recordSkip;
    /** Once: terminate. every/cron: move to the next occurrence strictly after now. */
    private advancePast;
    private advance;
    private terminate;
    /** Rewind one alarm to now + delay without recording; only used by quiet/cap defers. */
    private deflect;
    /**
     * Quiet-hours gate for alarms that respect it: the occurrence is dropped,
     * not postponed — respect=true alarms are model-initiated, so a late
     * re-delivery at window end would only pile up there. once -> completed
     * with one skipped run; every/cron -> fast-forward to the first anchor
     * outside the window (one skipped run per window entry), so a frequent
     * alarm never spins the drive loop all night.
     */
    private skipPastQuiet;
    /**
     * First occurrence of a repeating alarm strictly after `from` that lies
     * outside the quiet window, with the number of in-window occurrences
     * consumed; undefined when the trigger is corrupt. Pure schedule math (no
     * store writes), bounded so a pathological interval can never spin —
     * hitting the bound returns the last in-window instant and the next drive
     * pass continues skipping from there. Jitter keeps the same drift
     * semantics as advance() (each candidate redraws; cron candidates drift
     * off the minute grid the same way).
     */
    private nextAwakeOccurrence;
    /** Defer one due alarm to an absolute time without recording (min-idle gate). */
    private deferWakeTo;
    private deferRetry;
    /** Arm a single timer at the nearest due alarm (or explicit deferral). */
    private arm;
}
