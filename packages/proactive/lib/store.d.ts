/**
 * Durable host-level store for dsh-proactive.
 *
 *   alarms.json  — one object { version, alarms: Alarm[] }  (atomic tmp+rename)
 *   runs.jsonl   — append-only run records
 *   state.json   — per-UTC-day delivery budget + plugin-created session bookkeeping
 *
 * A corrupt alarms.json never bricks the plugin: load() falls back to an empty
 * store and surfaces { code: "corrupt_store" } from tools that would mutate it.
 *
 * v2 (260907-proactive-alarm-v2): STORE_VERSION moved 1 -> 2. Legacy v1
 * records are normalized in memory on load (sessionId -> ownerSessionId +
 * target.resume; wakeReason "alarm" -> respectQuietHours false, any other ->
 * true; repeat jitter 0..1 rounded onto the unified jitterSeconds; unknown
 * legacy fields such as deliveryHint dropped). The on-disk file is rewritten
 * as version 2 on the next persist.
 */
import { type Alarm, type CreatedSessionKind, type CreatedSessionRecord, type RunRecord } from "./domain.js";
export interface StoreState {
    version: number;
    alarms: Alarm[];
}
/**
 * state.json contents: the per-UTC-day delivery budget plus the bookkeeping
 * for sessions this plugin created itself (new-mode products, fork children).
 */
export interface HostState {
    date: string;
    delivered: number;
    /** Newest last; bounded by MAX_CREATED_SESSIONS (excess ids age out harmlessly — at worst an ancient wake-only session becomes capturable again). */
    createdSessions: CreatedSessionRecord[];
}
/** Keeps state.json bounded across long-lived repeating new/fork alarms. */
export declare const MAX_CREATED_SESSIONS = 1024;
export declare class ProactiveStore {
    readonly dataDir: string;
    /** Set when alarms.json could not be fully trusted on load; mutating tools reject. */
    corrupt: boolean;
    private state;
    private host;
    private changeListeners;
    /** Subscribe to every store mutation (alarms/budget/runs); returns the disposer. */
    onChange(listener: () => void): () => void;
    private emitChange;
    constructor(dataDir: string, initial?: StoreState, initialHost?: HostState);
    /** Load from disk; corrupt files degrade to an empty in-memory store (never throw). */
    static load(dataDir: string): Promise<{
        store: ProactiveStore;
        corrupt: boolean;
    }>;
    listAlarms(): readonly Alarm[];
    getAlarm(id: string): Alarm | undefined;
    addAlarm(alarm: Alarm): void;
    replaceAlarm(updated: Alarm): void;
    removeAlarm(id: string): Alarm | undefined;
    persist(): Promise<void>;
    appendRun(record: RunRecord): Promise<void>;
    /** Budget for one UTC day; a new day resets the counter. */
    budgetFor(utcDate: string): number;
    /** Add one (or zero/negative log) chat-text delivery unit for a UTC day and persist the counter. */
    spendBudget(utcDate: string, delta: number): Promise<number>;
    /** Creation kind of a plugin-created session; undefined for user sessions. */
    createdSessionKind(sessionId: string): CreatedSessionKind | undefined;
    /**
     * Bookkeep one session this plugin created, then persist state.json. The
     * in-memory book updates even when the write fails (this process keeps the
     * exclusion; a restart loses it — the caller warns).
     */
    recordCreatedSession(sessionId: string, kind: CreatedSessionKind): Promise<void>;
    /** Atomic state.json write shared by every HostState mutation. */
    private persistHost;
    /** Latest run records from runs.jsonl, oldest-to-newest within the window. */
    listRecentRuns(limit: number): Promise<RunRecord[]>;
}
