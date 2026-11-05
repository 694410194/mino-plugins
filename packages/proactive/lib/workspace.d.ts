/**
 * Workspace target resolution for alarms with target_mode "workspace".
 *
 * Two halves:
 *
 *  create-side wiring (resolveWorkspaceArg) — run BEFORE the closed
 *  validateCreateArgs, mirroring wireTimeZones: the model may name the
 *  workspace by registry id, by absolute path, or not at all (default = the
 *  creator session's own workspace). Everything resolves to a canonical,
 *  existence-checked target_workspace_id so the closed validator only ever
 *  sees one spelling. No auto-create: workspaces are user-managed groupings.
 *
 *  fire-side resolution (resolveWorkspaceWakeTarget / WorkspaceWakePort) —
 *  the destination is derived AT FIRE TIME so it always follows the user's
 *  latest activity:
 *    1. the workspace's most recently UPDATED visible session
 *       (updatedAt = max(createdAt, lastPromptAt), the exact sidebar ordering:
 *       GUI session.list semantics — plugin-source wake messages never move
 *       it, so repeated wakes converge on one session until the user prompts
 *       elsewhere in the workspace);
 *    2. else the workspace's newest BLANK session (the GUI's New Session
 *       slot — dsh-client-runtime connectWorkspace reuses it the same way);
 *    3. else "none": nothing is eligible, the fire is SKIPPED. The resolver
 *       never creates a session — ensuring a conversation is target_mode
 *  "new"'s job, not the last-active resolver's.
 *
 *  Subagent-origin sessions, archived sessions, and sessions this plugin
 *  created itself are never eligible. The plugin's own wake products
 *  (target_mode-new sessions, fork children) are bookkept in state.json
 *  (store.recordCreatedSession) and excluded at resolution time: without
 *  that, every new/fork fire injects a fresh top-ranked candidate (createdAt
 *  = fire time) and a later workspace/preset alarm would wake inside the
 *  plugin's own echo instead of the user's conversation. One adoption
 *  escape: a target_mode-new session the user has since typed in (positive
 *  evidence — lastPromptAt !== null) follows the user's activity again.
 *  Fork children inherit their parent's human history (lastPromptAt is not
 *  their own) and stay excluded unconditionally.
 */
import { type CreatedSessionKind, type ToolError } from "./domain.js";
/** Narrow read of one workspace registry record (dsh-workspace Workspace). */
export interface WorkspaceLike {
    readonly id: string;
    readonly path: string;
    readonly title: string;
    /** Header-validated session account in manual order (activity never reorders). */
    readonly sessionIds: readonly string[];
    status?(): Promise<"ok" | "missing-dir">;
    attachSession?(sessionId: string): Promise<void>;
}
/** Narrow facade over ctx.workspaceRegistry (absent on hosts without dsh-workspace). */
export interface WorkspaceRegistryFacade {
    get(id: string): WorkspaceLike | undefined;
    /** Resolve by canonical directory path without creating; undefined when unowned. */
    resolveByPath(path: string): Promise<WorkspaceLike | undefined>;
    readonly archivedSessionIds: readonly string[];
}
/** Narrow read of one live session from ctx.sessions. */
export interface LiveSessionLike {
    readonly id: string;
    /** dsh ≤0.1.1-rc.2 event log (removed in 0.1.2-rc.1). */
    readonly events?: readonly unknown[];
    /** dsh ≥0.1.2-rc.1 event log snapshot (supersedes `events`). */
    snapshotEvents?(): readonly unknown[];
    readonly header?: {
        createdAt?: number;
        cwd?: string;
        origin?: string;
        agentPreset?: string;
    };
}
/**
 * Live-session event log across dsh versions: the Session class dropped
 * `.events` in 0.1.2-rc.1 in favor of `snapshotEvents()`. A live session
 * whose log cannot be read folds as blank (a fresh GUI slot) — never as a
 * visible destination.
 */
export declare function liveEventsOf(live: LiveSessionLike): readonly unknown[];
/** Narrow read of one persisted session header from ctx.sessionPersistence.list(). */
export interface SessionHeaderLike {
    readonly id: string;
    readonly createdAt: number;
    readonly cwd?: string;
    readonly origin?: string;
    /** Creation-time preset stamp (dsh-session SessionHeader.agentPreset). */
    readonly agentPreset?: string;
    /** Fork children (seeded headers) get no bare-listing projection-cache row. */
    readonly isSeeded?: boolean;
}
/**
 * The session's effective preset id, latest `agent-preset/selected` first,
 * header stamp second, resolved by this local fold.
 *
 * The upstream plural package `@deepseek-ai/dsh-agent-presets` was pinned at
 * 0.1.1-rc.2 (its `resolveSessionPreset` export), but that package's module
 * graph imports `{ settingsNamespace }` from `@deepseek-ai/dsh-settings`, an
 * export the 0.1.7 core renamed to `SettingsForms`. Under the profile's
 * runtime interception the name routes to the core install, so even a
 * namespace import fails ESM link-time and takes the whole plugin tree down.
 * The singular successor (`dsh-agent-preset` / `-registry`, which the core
 * ships) exposes preset composition as the `agentPresets` service and does
 * not export `resolveSessionPreset` at all. This identical local fold is the
 * only usable implementation on 0.1.7 — the historic upstream upgrade path
 * (0.1.2-rc.1) is also dead because its `dsh-scope@^0.1.2` peer was never
 * published. Keep this fold; never re-introduce a static import of the
 * plural package at module scope.
 */
export declare function resolveSessionPresetOf(session: {
    header: {
        agentPreset?: string;
    };
    events: readonly unknown[];
}): string | undefined;
/**
 * One row of `ctx.sessionPersistence.list()` on the shipped core
 * (dsh-session-persistence ≥0.1.5): a {@link SessionPersistenceSnapshot} —
 * the detached header under `.header`, not the header itself. The 0.1.1-rc.2
 * devDependency this package compiles against still typed `list()` as bare
 * `SessionHeader[]`; reading `.id` off a snapshot row yields `undefined` and
 * silently drops every cold session from wake-target resolution
 * (docs/issues/260102-proactive-not-firing/, defect 1).
 */
export interface SessionPersistenceListRow {
    readonly header: SessionHeaderLike;
}
/**
 * Adapt runtime `list()` rows into the header stream the resolvers rank —
 * the single choke point for the snapshot/header contract drift above.
 */
export declare function coldSessionHeaders(rows: readonly SessionPersistenceListRow[]): readonly SessionHeaderLike[];
/** The persisted projection cache row (ctx.sessionProjectionCache.cachedSnapshot). */
export interface ProjectionCacheLike {
    /**
     * The persisted cache read, at host parity with the session controller's
     * cold listing (projectionsFor: `cachedSnapshot(header)` with no key
     * filter). The runtime's second parameter is a projection-key whitelist:
     * passing the legacy numeric inherited-event count there selects an empty
     * key set and the row always reads as undefined — never fold it back in.
     */
    cachedSnapshot(meta: SessionHeaderLike): {
        values?: {
            sessionListMetadata?: {
                blank: boolean;
                lastPromptAt: number | null;
            };
        };
    } | undefined;
}
/** Inputs the create-side resolver needs from the host. */
export interface WorkspaceArgDeps {
    registry: WorkspaceRegistryFacade;
    /** Creator session cwd (the default-workspace arm); absent when unknown. */
    sessionCwd?: string;
}
export declare function resolveWorkspaceArg(args: Record<string, unknown>, deps: WorkspaceArgDeps): Promise<Record<string, unknown> | ToolError>;
/**
 * Session-list metadata fold, mirrored from the host's session.list
 * projection (dsh-api-session-controller applySessionListMetadata): blank
 * flips to false on the first turn/start; lastPromptAt tracks the latest
 * human-authored user/message. The event `time` lives at the TOP level of a
 * SessionEvent (`{type, seq, time, data}`) — `data` carries only
 * `{content, id, role, source}` — and the host folds last-wins (not max).
 * Wake framing is a plugin-source notice, so a proactive wake never moves
 * lastPromptAt.
 */
export declare function listMetadataOf(events: readonly unknown[]): {
    blank: boolean;
    lastPromptAt: number | null;
};
/** The sidebar's updatedAt: the later of creation and the latest human prompt. */
export declare function updatedAtOf(createdAt: number, metadata: {
    lastPromptAt: number | null;
} | undefined): number;
/** One ranked workspace session candidate (live or cold). */
export interface WorkspaceCandidate {
    sessionId: string;
    /** Sidebar recency key: max(createdAt, lastPromptAt). */
    updatedAt: number;
    createdAt: number;
    /** Never had a turn (GUI hides these; they are the New Session slots). */
    blank: boolean;
    /** Subagent children are never eligible wake destinations. */
    subagent: boolean;
}
export type WorkspacePick = {
    kind: "session";
    sessionId: string;
} | {
    kind: "none";
};
/**
 * The fire-time destination, mirroring the GUI workspace tree + New Session:
 * the topmost VISIBLE (non-blank, non-subagent) row by recency; else the
 * newest blank row (the New Session slot, connectWorkspace-style); else
 * "none" (the caller skips the fire — it never creates).
 */
export declare function pickWorkspaceTarget(candidates: readonly WorkspaceCandidate[]): WorkspacePick;
/** Where a workspace wake should land, resolved at fire time. */
export type WorkspaceWakeDestination = {
    kind: "session";
    sessionId: string;
} | {
    kind: "none";
};
/**
 * Whether one plugin-created session stays a legal wake destination. A
 * target_mode-new product the user has ADOPTED (typed in — positive
 * evidence, lastPromptAt !== null) follows the user's activity again;
 * everything else the plugin created (new products nobody typed in, fork
 * children whose human history is inherited) is never eligible.
 */
export declare function createdSessionEligible(kind: CreatedSessionKind, lastPromptAt: number | null | undefined): boolean;
/** Inputs the fire-side resolver needs from the host. */
export interface WorkspaceWakeDeps {
    registry: WorkspaceRegistryFacade;
    /** Live in-memory session store (ctx.sessions). */
    liveSessions(): readonly LiveSessionLike[];
    /** Cold session headers (ctx.sessionPersistence.list); absent on headless hosts. */
    coldHeaders?(): Promise<readonly SessionHeaderLike[]>;
    /** Persisted projection cache rows (ctx.sessionProjectionCache). */
    projectionCache?: ProjectionCacheLike;
    /** Plugin-created session bookkeeping (store); absent = no exclusion. */
    createdSessionKind?(sessionId: string): CreatedSessionKind | undefined;
    log: (level: "info" | "warn" | "error", message: string) => void;
}
/**
 * Fire-time destination: rank the workspace's sessions (live fold first,
 * cold projection-cache row second — both are the exact sources the GUI's
 * session.list uses), excluding plugin-created products (see
 * {@link createdSessionEligible}), and pick per {@link pickWorkspaceTarget}.
 * "none" means nothing is eligible — the caller skips the fire.
 */
export declare function resolveWorkspaceWakeTarget(deps: WorkspaceWakeDeps, workspaceId: string): Promise<WorkspaceWakeDestination | {
    error: string;
}>;
/** The driver-facing port: resolve at fire time + attach created sessions. */
export interface WorkspaceWakePort {
    resolveTarget(workspaceId: string): Promise<WorkspaceWakeDestination | {
        error: string;
    }>;
    attach(workspaceId: string, sessionId: string): Promise<void>;
    /**
     * Canonical directory path for creating a session inside the workspace
     * (target_mode new with a configured workspace). Missing-dir guard: a
     * wake must never mkdir a ghost directory as a side effect.
     */
    cwdOf(workspaceId: string): Promise<string | {
        error: string;
    }>;
}
/** Assemble the driver-facing port from host-level deps (index.ts wiring). */
export declare function createWorkspaceWakePort(deps: WorkspaceWakeDeps): WorkspaceWakePort;
/**
 * Fire-time destination for a preset-sourced target: the most recently
 * updated session RUNNING that preset, or "none" when no eligible session
 * exists. No create arm: the caller decides what "none" means (resume skips
 * the fire; fork fails closed) — a fresh session is target_mode "new"'s job.
 * Plugin-created products follow {@link createdSessionEligible}.
 */
export type PresetWakeDestination = {
    kind: "session";
    sessionId: string;
} | {
    kind: "none";
};
/** Inputs the preset-source resolver needs from the host. */
export interface PresetWakeDeps {
    /** Live in-memory session store (ctx.sessions). */
    liveSessions(): readonly LiveSessionLike[];
    /** Cold session headers (ctx.sessionPersistence.list); absent on headless hosts. */
    coldHeaders?(): Promise<readonly SessionHeaderLike[]>;
    /** Persisted projection cache rows (ctx.sessionProjectionCache). */
    projectionCache?: ProjectionCacheLike;
    /** Archived-session exclusion (registry-backed; absent = no registry, nothing to exclude). */
    archivedSessionIds?(): readonly string[];
    /** Plugin-created session bookkeeping (store); absent = no exclusion. */
    createdSessionKind?(sessionId: string): CreatedSessionKind | undefined;
    log: (level: "info" | "warn" | "error", message: string) => void;
}
/**
 * Rank every session running the preset and pick the same way the workspace
 * resolver does (visible first, sidebar recency, subagent/archived/
 * plugin-created never).
 *
 * Preset matching: a LIVE session folds its effective preset (latest
 * `agent-preset/selected` event, header stamp second — the exact fold the
 * wake composition uses); a COLD session only carries its creation-time
 * header stamp, the same limitation the sidebar's cold rows have.
 */
export declare function resolvePresetWakeTarget(deps: PresetWakeDeps, presetId: string): Promise<PresetWakeDestination | {
    error: string;
}>;
/** The driver-facing port for preset-sourced targets. */
export interface PresetWakePort {
    resolveTarget(presetId: string): Promise<PresetWakeDestination | {
        error: string;
    }>;
}
/** Assemble the preset-source port from host-level deps (index.ts wiring). */
export declare function createPresetWakePort(deps: PresetWakeDeps): PresetWakePort;
