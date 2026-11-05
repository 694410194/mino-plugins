/**
 * Schedule-file format + path helpers for the "file" alarm type (261009).
 *
 * A schedule file (convention: `<workspace>/.life/wake_schedule.json`) lists
 * desired wake entries. It is owned by exactly one file-handle alarm, which
 * points at ONE literal absolute path (no globs) — the FILE is the single
 * source of truth for its entries, and the handle is the single source of
 * truth for the subscription's existence (a missing/empty/all-invalid file
 * never makes the subscription disappear silently).
 *
 * This module is pure plus a little filesystem work (canonicalization); the
 * reconciliation itself lives in schedule-sync.ts.
 *
 * Entry parameters are layered, with an important asymmetry:
 *   - `target` picks ONE layer whole (entry > file top level > handle):
 *     target keys are NOT orthogonal (mode + which id goes with it), so a
 *     key-wise merge can synthesize a combination no layer ever meant — that
 *     is the 260928 residual-key failure class.
 *   - every other key is orthogonal and merges key-wise
 *     (entry > file top level > handle > dialect default).
 */
import { type Alarm, type AlarmView, type ToolError } from "./domain.js";
export declare const MAX_FILE_BYTES: number;
export declare const MAX_ENTRIES_PER_FILE = 200;
export interface DeclaredEntry {
    id: string;
    /** Flat scalar args: file-level defaults merged with the entry's own values (entry wins). */
    args: Record<string, unknown>;
    /** Flat target_* args of the winning layer (entry target > file-level target); absent = inherit the handle's target. */
    target?: Record<string, unknown>;
}
export interface ParsedSchedule {
    file: string;
    entries: DeclaredEntry[];
    errors: string[];
    /** True when the file could not be read/interpreted at all (keep current alarms). */
    fatal: boolean;
}
/**
 * Canonical spelling of one schedule file: absolute, no trailing slash, and
 * with the directory's symlinks folded when it exists. The canonical form is
 * what gets STORED and what feeds child alarm ids, so two spellings of the
 * same physical file can never become two handles with two id families
 * (which would fire every occurrence twice).
 */
export declare function canonicalizeScheduleFile(file: string): Promise<string>;
/** The same-file uniqueness rule, shared by the tools and the panel. */
export declare function findScheduleHandle(alarms: readonly Alarm[], canonicalFile: string, excludeId?: string): Alarm | undefined;
/**
 * The child alarms a handle currently owns (computed live from the store —
 * never persisted, so the count can never drift from reality).
 */
export declare function childrenOfHandle(alarms: readonly Alarm[], handleId: string): Alarm[];
/** One AlarmView, enriched with the handle's live child count. */
export declare function viewWithDeclaredEntries(alarms: readonly Alarm[], alarm: Alarm, now: number): AlarmView;
/**
 * Whether the create/update dialect names ANY target. Used to decide when the
 * schedule-file default (the file's own workspace) may fill the slot: an
 * explicit target_* argument always wins, and an edit that names none keeps
 * the alarm's current destination instead of falling back to a default.
 */
export declare function hasTargetArgs(args: Record<string, unknown>): boolean;
/** Stable JSON stringify (recursively key-sorted) for hashing. */
export declare function stableStringify(value: unknown): string;
export declare function sha256(text: string): string;
/** Stable alarm id for one (file, entry) pair — identical across sync passes. */
export declare function declaredAlarmId(file: string, entryId: string): string;
/** Flatten a nested target object into the flat target_* dialect keys. */
export declare function flattenTarget(target: unknown, label: string): Record<string, unknown> | string;
/**
 * Parse one schedule file's text into declared entries. Each entry carries a
 * flat record of its own + file-level scalar args and the WINNING target
 * layer (never a merge of layers); the caller fills the remaining defaults
 * from the owning handle. Synchronous and pure.
 */
export declare function parseScheduleFile(file: string, text: string): ParsedSchedule;
/** The resolveWorkspaceArg shape the tools/panel use (kept structural to avoid an import cycle). */
export type WorkspaceResolver = (args: Record<string, unknown>, sessionCwd?: string) => Promise<Record<string, unknown> | ToolError>;
/**
 * The strict default target for a handle created without any target_* arg:
 * the file must live EXACTLY one directory below a registered workspace
 * (i.e. `<workspace>/<dir>/<file>`, the `.life/` convention). Walking up to
 * the nearest registered ancestor is deliberately NOT done: this host has
 * `/root`, `/root/projects`, `/usr/bin` registered, so an unregistered agent
 * directory would silently resolve to `/root` and every wake would land in an
 * unrelated conversation — the same silent-failure family as 260928.
 */
export declare function defaultHandleTargetArgs(file: string, resolveWorkspace: WorkspaceResolver | undefined): Promise<Record<string, unknown> | ToolError>;
