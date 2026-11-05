/**
 * Host-side panel service: snapshots, closed actions, and run history for the
 * GUI panel. Mutations go through the same alarm factory as the model tools
 * and end with the same store + scheduler wiring, so the panel is a second
 * surface over one domain, never a parallel implementation.
 *
 * v2 (260907-proactive-alarm-v2): ownership moved to the alarm's creator
 * (ownerSessionId); fork/new wakes land in child sessions, so the session
 * view shows a run when it happened IN the session OR the alarm it belongs
 * to is owned BY the session.
 */
import { type ToolError } from "../domain.js";
import type { ProactiveConfig } from "../config.js";
import type { ProactiveStore } from "../store.js";
import type { ProactiveScheduler } from "../scheduler.js";
import type { PanelResult, PanelSnapshot, PresetRosterRow } from "./contract.js";
export interface PanelServiceDeps {
    store: ProactiveStore;
    config: ProactiveConfig;
    scheduler: Pick<ProactiveScheduler, "requestDrive">;
    dataDir: string;
    now: () => number;
    log: (level: "info" | "warn" | "error", message: string) => void;
    /** Resolve a session id to a display title (empty = unknown). */
    sessionTitle: (sessionId: string) => string;
    /** Session-owned live event log (host in-memory store) for client-zone resolution. */
    sessionEvents: (sessionId: string) => readonly unknown[] | undefined;
    /** Create-side workspace argument normalization (the panel sends explicit ids); absent -> workspace creates fail closed. */
    resolveWorkspace?: (args: Record<string, unknown>, sessionCwd?: string) => Promise<Record<string, unknown> | ToolError>;
    /**
     * Agent preset roster rows (AgentPresets.remoteExportList projected): feeds
     * the preset pickers in the create form. Absent/failed -> empty roster, the
     * pickers degrade to free-text preset ids.
     */
    presetRoster?: () => Promise<readonly PresetRosterRow[]>;
    /** Immediate schedule-file sync (late-bound: created after the panel). */
    syncNow?: () => Promise<unknown>;
    /** Last schedule-file sync summary, for the snapshot's diagnostics block. */
    syncSummary?: () => {
        lastAt: number;
        handles: number;
        created: number;
        updated: number;
        removed: number;
        skippedPast: number;
        errors: string[];
    } | undefined;
}
export declare class ProactivePanelService {
    private readonly deps;
    constructor(deps: PanelServiceDeps);
    /**
     * One snapshot. Without a sessionId this is the host-wide (settings page)
     * view. With a sessionId it is the conversation-page view: rows scoped to
     * alarms the session OWNS, runs scoped to this session plus every run of
     * the session's own alarms (so fork/new child wakes show up in the owner's
     * history).
     */
    snapshot(sessionId?: string): Promise<PanelSnapshot>;
    /** Roster rows for the create form; failures degrade to an empty roster. */
    private presetRows;
    private rowFor;
    action(input: unknown, sessionId?: string): Promise<PanelResult>;
    /** Ownership guard: when a session scope is active every touched alarm must belong to it. */
    private guardOwnership;
    /**
     * Shared pre-validation wiring for create/edit args: the client-zone default
     * chain for time_zone, then workspace-id normalization (explicit ids only —
     * the panel form always sends one for workspace targets).
     */
    private wireWorkspace;
    /**
     * Schedule-file handle pre-wiring, shared by create and edit: canonicalize
     * the path, enforce same-file uniqueness, and fill the target when the
     * caller named none (create: the file's own workspace; edit: the alarm's
     * current target, so a bare edit can never retarget a handle).
     */
    private wireScheduleFile;
    /**
     * Roll a failed mutation back in memory and surface the durable failure as
     * persistence_uncertain — the same contract the model tools follow, so the
     * panel never reports a save that a crash could silently drop.
     */
    private persistFailure;
    private runAction;
}
