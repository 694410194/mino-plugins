/**
 * Schedule-file reconciliation + poll loop (261009, replacing declared.ts).
 *
 * The store's "file" alarms are subscription HANDLES: each points at one
 * absolute schedule file and owns the child alarms generated from it. One
 * reconciliation pass, per handle:
 *
 *   read the file  ──►  entry set  ──►  child alarm set  ──►  diff the store
 *
 * Semantics:
 *   - FILE = source of truth for its entries: a removed entry removes its
 *     child; a deleted file revokes the whole plan (children removed).
 *   - HANDLE = source of truth for the subscription's existence: a file that
 *     cannot be read or parsed keeps its children (a transient failure must
 *     never cancel wakes), and a paused/deleted handle drops them.
 *   - a changed entry hash replaces the child; an unchanged hash is a total
 *     no-op (it must not disturb jitter anchors or a min_idle deferral).
 *   - children whose `declared.sourceId` no longer names an ACTIVE handle are
 *     orphans and are removed (this is also the 260918 migration path).
 *
 * Concurrency: every pass goes through ONE serialized chain (`enqueueSync`),
 * so the tools/panel can request an immediate pass without racing the poll
 * tick into duplicate alarms. The apply phase itself is synchronous, and it
 * re-checks the handle before writing — a cancel/pause that lands during the
 * (awaited) entry preparation can never resurrect a child alarm.
 */
import { type Alarm } from "./domain.js";
import { type WorkspaceResolver } from "./schedule-file.js";
import type { ProactiveConfig } from "./config.js";
export interface SyncSummary {
    /** Instant of the pass (epoch ms). */
    lastAt: number;
    /** Active file handles examined. */
    handles: number;
    created: number;
    updated: number;
    removed: number;
    skippedPast: number;
    /** Entry-level failures (bad spec / unresolvable target / past at), newest last. */
    errors: string[];
    mutated: boolean;
}
export interface ScheduleSyncStore {
    listAlarms(): readonly Alarm[];
    getAlarm(id: string): Alarm | undefined;
    addAlarm(alarm: Alarm): void;
    replaceAlarm(alarm: Alarm): void;
    removeAlarm(id: string): Alarm | undefined;
    persist(): Promise<void>;
}
export interface ScheduleSyncDeps {
    config: Pick<ProactiveConfig, "schedulePollSeconds">;
    store: ScheduleSyncStore;
    now: () => number;
    /**
     * Create-side workspace argument wiring, for entries that name
     * `target.workspace_path`. Absent on hosts without a workspace registry:
     * such entries fail closed and keep their current child alarm.
     */
    resolveWorkspace?: WorkspaceResolver;
    log: (level: "info" | "warn" | "error", message: string) => void;
}
export interface ScheduleSyncHandle {
    dispose(): void;
    /** Request a pass and await ITS result (serialized with the poll tick). */
    enqueueSync(): Promise<SyncSummary>;
    lastSummary(): SyncSummary | undefined;
}
export declare function syncScheduleFiles(deps: ScheduleSyncDeps): Promise<SyncSummary>;
/**
 * Poll loop over the schedule files. The first pass runs immediately; every
 * pass — the tick's and the tools'/panel's immediate requests — goes through
 * ONE serialized chain, so two passes can never interleave into duplicate
 * alarms. A pass that mutated the store nudges the scheduler.
 */
export declare function startScheduleSync(deps: ScheduleSyncDeps & {
    scheduler: {
        requestDrive(): void;
    };
}): ScheduleSyncHandle;
