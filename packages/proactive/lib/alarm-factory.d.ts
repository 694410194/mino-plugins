/**
 * Shared alarm factory: the single path that turns a validated create request
 * into a stored Alarm. Both the model tools (tools.ts) and the GUI panel
 * (panel/service.ts) drive it, so a nuance fixed once cannot drift between
 * the two surfaces.
 *
 * v2 (260907-proactive-alarm-v2): one selector (at | after_seconds |
 * every_seconds | cron) derives the alarm type once/every/cron; a unified
 * jitter_seconds applies a random delay after every scheduled instant; the
 * wake target is decoupled from the creator via target_mode/target_session_id.
 *
 * 261009: the fifth selector `schedule_file` derives the fourth alarm type,
 * "file" — a schedule-file HANDLE that never fires itself (domain.firesAlarm)
 * and whose child alarms are materialized by schedule-sync.ts. Path
 * canonicalization and same-file uniqueness live in schedule-file.ts (they
 * need the store), so the validation here only checks the path's shape.
 */
import { type Alarm, type AlarmCompaction, type AlarmTarget, type RandomSource, type ToolError } from "./domain.js";
/** Upper bound for a schedule_file path (mirrors the old glob pattern cap). */
export declare const MAX_SCHEDULE_FILE_LENGTH = 512;
export interface CreateSpec {
    prompt: string;
    kind: "at" | "after" | "every" | "cron" | "file";
    at?: unknown;
    afterSeconds?: number;
    everySeconds?: number;
    cron?: string;
    /** kind "file": absolute schedule-file path (canonicalized by the caller). */
    scheduleFile?: string;
    /** Unified per-occurrence random delay in seconds; absent/0 = exact timing. */
    jitterSeconds?: number;
    /** Resume targets only: minimum destination idle span in seconds; absent/0 = off. */
    minIdleSeconds?: number;
    timeZone?: string;
    respectQuietHours: boolean;
    compaction: AlarmCompaction;
    target: AlarmTarget;
}
/**
 * Closed validation of the open parameter root shared by proactive_set and the
 * panel create action. Panels keep a payload comment on the same vocabulary so
 * the model tools and the GUI accept exactly one dialect.
 *
 * `defaultTargetSessionId` is the creator session; it becomes the wake target
 * when target_mode is resume/fork and no target_session_id was given (v1
 * behaviour — the alarm wakes its creator).
 */
export declare function validateCreateArgs(args: Record<string, unknown>, defaultTargetSessionId: string): CreateSpec | ToolError;
/**
 * Resolve the canonical trigger + nextDueAt for a validated create request.
 * jitter_seconds is drawn ONCE here and baked into nextDueAt, so the scheduler
 * itself never waits: the delay is part of the plan, not of the loop.
 */
export declare function buildAlarm(ownerSessionId: string, spec: CreateSpec, nowStart: number, random?: RandomSource): {
    alarm: Alarm;
} | ToolError;
