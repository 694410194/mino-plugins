/**
 * dsh-proactive durable domain (v2): alarm records, run records, validation, and closed error codes.
 * Local-time resolution ports the DST-correct algorithm from @deepseek-ai/dsh-schedule
 * (MIT): overlaps choose the earlier instant, gaps are rejected, and the zone is
 * never imported from the process or browser.
 *
 * v2 model (260907-proactive-alarm-v2):
 *   - wake_reason (heartbeat|alarm) is gone; every alarm carries its own
 *     `respectQuietHours` switch (true = deferred inside quiet hours and gated
 *     by the daily budget; false = user-requested, exempt from both).
 *   - alarm `type`: "once" | "every" | "cron" | "file"; the three firing
 *     types support a unified `jitterSeconds` random delay drawn after each
 *     scheduled instant. "file" is the 260918/261009 schedule-file HANDLE:
 *     it never fires itself (firesAlarm) — it watches one absolute JSON file
 *     and materializes one child alarm per entry.
 *   - the wake destination is decoupled from the creator: `ownerSessionId`
 *     (tools/panel ownership) vs `target` (resume existing / fork from an
 *     existing session / create a new session).
 */
export declare const PROACTIVE_PLUGIN = "dsh-proactive";
export declare const MIN_EVERY_SECONDS = 300;
export declare const MAX_PROMPT_LENGTH = 4000;
export declare const MAX_NO_REPLY_REASON_LENGTH = 200;
/** Default compaction policy for a new alarm (minimal: keep the proactive_reclaim reason in the tombstone). */
export declare const DEFAULT_COMPACTION: AlarmCompaction;
/** All valid compaction values (validation + schema enum share this source). */
export declare const COMPACTION_MODES: readonly string[];
/** Upper bound for the per-occurrence random delay (24h). */
export declare const MAX_JITTER_SECONDS = 86400;
/** Hard ceiling for min_idle_seconds: one day. */
export declare const MAX_MIN_IDLE_SECONDS = 86400;
/**
 * The repo default wake-up instruction: pre-filled into the GUI create form
 * (config.defaultPrompt, editable) so a new alarm starts from the user's
 * standing preset instead of a blank box. Pure constant — domain.ts stays
 * import-free so BOTH the host (config.ts) and the browser client bundle
 * (panel form fallback) share this one source of truth.
 */
export declare const DEFAULT_WAKE_PROMPT = "\u8FD9\u662F\u4E00\u4E2A heartbeat reminder\uFF0C\u4F60\u53EF\u4EE5\u9009\u62E9\u4E0E\u7528\u6237\u53D1\u9001\u6D88\u606F\u3002\u8BB0\u5F97\u5B8C\u5168\u8FDB\u5165\u4F60\u7684\u4EBA\u8BBE\u548C\u60C5\u5883\u3002\u5982\u679C\u4E0D\u5E0C\u671B\u53D1\u9001\u6D88\u606F\uFF0C\u5C31\u8C03\u7528 proactive_reclaim \u5B89\u9759\u7ED3\u675F\u3002";
/** dsh session ids are alphanumeric plus `._-`; anything else (slashes, traversals, spaces, UTF-8) is rejected. */
export declare const SESSION_ID_PATTERN: RegExp;
/** dsh workspace registry ids are generated uuids; the pattern only fails closed on junk shapes. */
export declare const WORKSPACE_ID_PATTERN: RegExp;
/**
 * Slice by Unicode code points (not UTF-16 units) so a surrogate pair is
 * never split in half — user-facing prompt/preset text may contain emoji.
 */
export declare function sliceCodePoints(text: string, max: number): string;
/** Fail closed on session ids that could escape storage paths or scope lookups. */
export declare function isValidSessionId(sessionId: string): boolean;
/** Fail closed on workspace ids that are not registry-uuid shaped (defense in depth for stored alarms). */
export declare function isValidWorkspaceId(workspaceId: string): boolean;
/** Preset ids are alphanumeric plus `._-`, max 100 characters. */
export declare function isValidPresetId(presetId: string): boolean;
export type AlarmType = "once" | "every" | "cron" | "file";
/**
 * Whether an alarm type ever fires a wake turn. "file" is a subscription
 * HANDLE (261009): the scheduler must never select it as due, the panel must
 * never offer "fire now", and overdue rendering must skip it. Every consumer
 * asks this one predicate instead of comparing against "file" itself.
 */
export declare function firesAlarm(type: AlarmType): boolean;
/** Per-alarm surface compaction policy for silent wake turns. */
export type AlarmCompaction = "off" | "minimal" | "aggressive";
export type TargetMode = "resume" | "fork" | "new" | "workspace";
export type TargetSourceType = "session" | "workspace" | "preset";
export type AlarmStatus = "scheduled" | "in-flight" | "completed" | "cancelled" | "failed" | "paused";
export type RunDecision = "no_reply" | "reply" | "skipped" | "failed";
/**
 * Why the plugin created a session itself: "new" = a target_mode-new product,
 * "fork" = a fork-mode child. Bookkept in state.json so the fire-time
 * resolvers (workspace/preset) never route a wake into the plugin's own
 * output — the alarm follows the USER's activity, not its own echo.
 */
export type CreatedSessionKind = "new" | "fork";
/** One bookkept plugin-created session (store.ts persists these in state.json). */
export interface CreatedSessionRecord {
    sessionId: string;
    kind: CreatedSessionKind;
    createdAt: string;
}
/**
 * Where the wake should land:
 *  - `new`: creates a fresh session on each fire; optionally configured with workspaceId, presetId, provider, model.
 *  - `resume`: wakes an existing or dynamically resolved session.
 *  - `fork`: branches from an existing or dynamically resolved source session.
 *  Source resolution for resume/fork:
 *    - `session`: direct specific sessionId.
 *    - `workspace`: dynamically resolves the workspace's most active session.
 *    - `preset`: dynamically resolves the preset's most active session.
 *  - `workspace`: legacy compatibility arm (folds into resume with workspace source).
 */
export type AlarmTarget = {
    mode: "resume" | "fork";
    sourceType?: TargetSourceType;
    sessionId?: string;
    workspaceId?: string;
    presetId?: string;
} | {
    mode: "new";
    workspaceId?: string;
    presetId?: string;
    provider?: string;
    model?: string;
} | {
    mode: "workspace";
    workspaceId: string;
};
/**
 * Effective source arm of a resume/fork target. v3 records carry an explicit
 * sourceType; v2 records (and the legacy workspace mode) fold to their stored
 * spelling. "new" targets have no source — undefined.
 */
export declare function targetSourceOf(target: AlarmTarget): TargetSourceType | undefined;
/**
 * Project a stored target back onto the flat `target_*` create dialect — the
 * inverse of alarm-factory's flattening, and the ONLY sanctioned way to feed
 * a stored target to validateCreateArgs. File-schedule entries inherit their
 * handle's target this way: a hand-rolled partial merge would drop
 * `target_session_id`/`target_source` and make the entry fail validation
 * silently (keptIds = "no change"), or -- worse -- key-merge two layers into
 * a combination neither layer meant (the 260928 residual-key failure class).
 */
export declare function targetArgsOf(target: AlarmTarget): Record<string, unknown>;
export interface OnceTrigger {
    /** Canonical RFC 3339 UTC instant. */
    at: string;
}
export interface EveryTrigger {
    everySeconds: number;
    /** Anchor instant for backward compatibility or reference to the latest wake. */
    anchor?: string;
    /** Optional per-occurrence random delay in seconds; absent/0 = exact intervals. */
    jitterSeconds?: number;
}
export interface CronTrigger {
    /** Five-field numeric cron expression (minute hour dom month dow). */
    expr: string;
    /** Optional per-occurrence random delay in seconds; absent/0 = exact cron moments. */
    jitterSeconds?: number;
}
/**
 * Schedule-file handle trigger (261009). The alarm never fires: it points at
 * ONE absolute JSON file whose entries are synced into child alarms. The path
 * is stored in its canonical form (see schedule-file.ts), so two spellings of
 * the same file can never become two handles.
 */
export interface FileTrigger {
    file: string;
    /** Optional per-occurrence random delay inherited by entries that set none. */
    jitterSeconds?: number;
}
export type AlarmTrigger = OnceTrigger | EveryTrigger | CronTrigger | FileTrigger;
/**
 * Provenance of a file-declared alarm (schedule-sync.ts): the source schedule
 * file (canonical path), the entry id inside it, and a hash of the entry's
 * normalized spec so the sync can distinguish "unchanged" (no-op) from
 * "changed" (replace). `sourceId` names the owning file-handle alarm;
 * it is optional because records synced before 261009 carry no parent — the
 * sync treats them as orphans and removes them.
 */
export interface DeclaredSource {
    file: string;
    entry: string;
    hash: string;
    sourceId?: string;
}
export interface Alarm {
    id: string;
    /** Creator session; scopes proactive_list/cancel and the panel ownership guard. */
    ownerSessionId: string;
    /** Wake destination, decoupled from the creator. */
    target: AlarmTarget;
    type: AlarmType;
    trigger: AlarmTrigger;
    prompt: string;
    /** true = defer inside quiet hours and gate by the daily budget; false = user-requested, exempt from both. */
    respectQuietHours: boolean;
    /** IANA zone for cron/every alignment and quiet-hours display; "UTC" default. */
    timeZone: string;
    status: AlarmStatus;
    nextDueAt: string;
    createdAt: string;
    updatedAt: string;
    runCount: number;
    lastRunAt: string | null;
    /** Per-alarm silent-wake surface compaction policy; absent = DEFAULT_COMPACTION (legacy records). */
    compaction?: AlarmCompaction;
    /** Resume targets only: deliver the wake only after the destination session has been idle at least this many seconds; absent/0 = off. */
    minIdleSeconds?: number;
    /** Present only for alarms materialized from a schedule file; the file + its handle alarm are their source of truth. */
    declared?: DeclaredSource;
}
export interface RunRecord {
    id: string;
    alarmId: string;
    /** The session the wake actually ran in (a fork/new child for those target modes). */
    sessionId: string;
    firedAt: string;
    decision: RunDecision;
    budgetDelta: number;
    note?: string;
    /** Truncated reasoning (thinking) summary of the wake turn, for the panel history. */
    reasoningSummary?: string;
    /** Truncated visible-reply summary of the wake turn, for the panel history. */
    replySummary?: string;
    /** The no_reply reason the model gave for staying silent, for the panel history. */
    noReplyReason?: string;
}
/**
 * Wire view of one alarm. `sessionId` deliberately keeps its old meaning of
 * OWNER so the GUI (filters, session column, copy-id) stays source-compatible;
 * the wake destination is surfaced separately via targetMode/targetSessionId.
 */
export type AlarmView = {
    id: string;
    sessionId: string;
    type: AlarmType;
    targetMode: TargetMode;
    targetSource?: TargetSourceType;
    /** Present for session-sourced resume/fork targets. */
    targetSessionId?: string;
    /** Present for workspace-sourced resume/fork targets, workspace legacy targets, or workspace-configured new targets. */
    targetWorkspaceId?: string;
    /** Present for preset-sourced resume/fork targets, or preset-configured new targets. */
    targetPresetId?: string;
    /** Present for model-configured new targets. */
    targetProvider?: string;
    targetModel?: string;
    respectQuietHours: boolean;
    prompt: string;
    nextDueAt: string;
    state: "scheduled" | "overdue" | "in-flight" | "completed" | "cancelled" | "failed" | "paused";
    deliveryMode: "host";
    /** Per-alarm silent-wake surface compaction policy. */
    compaction: AlarmCompaction;
    /** Resume targets only: minimum destination idle span in seconds before delivery; present only when > 0. */
    minIdleSeconds?: number;
    /** Unified per-occurrence random delay in seconds; present only when > 0. */
    jitterSeconds?: number;
    everySeconds?: number;
    cron?: string;
    at?: string;
    /** The alarm's canonical zone (drives at/cron alignment and wake framing). */
    timeZone?: string;
    /** Present only for declared (file-sourced) alarms: the source file and entry id. */
    declaredFile?: string;
    declaredEntry?: string;
    /**
     * File-handle alarms only ("type": "file"): the canonical schedule-file
     * path. Present also on child rows whenever the caller enriches the view.
     */
    scheduleFile?: string;
    /**
     * File-handle alarms only: how many child alarms this handle currently owns
     * (computed live by the caller from the store, never persisted).
     */
    declaredEntries?: number;
};
export type ProactiveErrorCode = "invalid_prompt" | "invalid_trigger" | "invalid_action" | "invalid_time_zone" | "not_future" | "frequency_too_high" | "not_found" | "corrupt_store" | "no_active_wake" | "persistence_uncertain" | "internal_error";
export type ToolError = {
    code: ProactiveErrorCode;
    message: string;
};
/** Input failure that maps to a closed, stable public code. */
export declare class ProactiveInputError extends Error {
    readonly code: ProactiveErrorCode;
    constructor(code: ProactiveErrorCode, message: string);
}
/** Canonicalize an IANA or UTC zone name. */
export declare function canonicalizeTimeZone(value: string): string;
/** Decode a canonical four-digit-year RFC 3339 UTC instant. */
export declare function decodeInstant(value: string): string;
/** The UTC epoch of a canonical instant string. */
export declare function instantEpoch(value: string): number;
/**
 * A local-time projector over one epoch: exact wall-clock fields plus the zone
 * offset that produced them. Structured so callers (quiet-hours, cron) share
 * one DST-correct projection machinery that never consults the process zone.
 */
export declare function makeLocalFormatter(timeZone: string, extra?: Intl.DateTimeFormatOptions): Intl.DateTimeFormat;
/** Project one epoch into exact local fields plus the zone offset that produced them. */
export declare function localProjection(formatter: Intl.DateTimeFormat, epoch: number): {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    second: number;
    millisecond: number;
    offset: number;
    weekday?: string;
};
/** Resolve local wall-clock fields in a zone: earlier instant on overlap, reject gaps. */
export declare function resolveLocalInstant(parts: {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    second: number;
    millisecond: number;
}, timeZone: string): number;
/** Trim and bound a model-supplied alarm prompt. */
export declare function validatePrompt(raw: unknown, maxLength?: number): string;
export interface LocalAtInput {
    date: string;
    time: string;
    time_zone: string;
}
export type AtInput = string | LocalAtInput;
/** Resolve one at input to { epoch, timeZone }. String must carry an explicit zone. */
export declare function resolveAtInput(at: AtInput): {
    epoch: number;
    timeZone: string;
};
/** The next occurrence of an every_seconds alarm aligned to its anchor, strictly after now. */
export declare function nextEveryOccurrence(anchorEpoch: number, everySeconds: number, now: number): number;
/** Uniform(0,1) source for jitter; default Math.random. */
export type RandomSource = () => number;
/** Validate the unified jitter knob: integer seconds 0..MAX_JITTER_SECONDS. */
export declare function validateJitterSeconds(raw: unknown): number;
/** Validate the min-idle knob: integer seconds 0..MAX_MIN_IDLE_SECONDS (0 = off). */
export declare function validateMinIdleSeconds(raw: unknown): number;
/** One random delay in milliseconds for jitter_seconds; 0 when the knob is absent/zero. */
export declare function jitterDelay(jitterSeconds: number | undefined, random?: RandomSource): number;
/**
 * The next occurrence of an every alarm: the anchor-aligned grid instant plus
 * a random delay drawn now. The grid itself never drifts (delays are applied
 * to the fire time, not to the interval), and a miss is skipped, never
 * re-fired (strictly after now). jitterSeconds 0 degenerates to the exact grid.
 */
export declare function nextJitteredOccurrence(anchorEpoch: number, everySeconds: number, now: number, jitterSeconds: number | undefined, random?: RandomSource): number;
/**
 * The next occurrence of an every alarm with drifting semantics:
 * Advances from the last wake instant by everySeconds plus jitterDelay.
 * If the resulting instant is already in the past (e.g. system sleep or prolonged
 * wake execution), re-anchors to nowEpoch so the next occurrence is strictly in the future.
 */
export declare function nextDriftingOccurrence(wakeEpoch: number, everySeconds: number, nowEpoch: number, jitterSeconds: number | undefined, random?: RandomSource): number;
/** Whether the alarm target time is still in the future. */
export declare function requireFuture(epoch: number, now: number): void;
export declare function isRecord(value: unknown): value is Record<string, unknown>;
export declare function toAlarmView(alarm: Alarm, now: number): AlarmView;
export declare function internalError(): ToolError;
export declare function inputError(error: unknown): ToolError;
export declare function isToolError(value: unknown): value is ToolError;
