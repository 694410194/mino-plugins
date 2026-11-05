/**
 * Wake driver: the agent-world mechanics behind one alarm fire.
 *
 * v3 target dialect — the wake INTENT (new/resume/fork) is orthogonal to the
 * SOURCE that names the conversation:
 *
 *   target new    -> drive the wake in a brand-new empty session, optionally
 *                    configured: workspaceId (meta.cwd + attach), presetId
 *                    (composition stamp), provider/model (wake selection).
 *   target resume -> reuse the live agent handle (follow-up queued politely)
 *                    or ctx.agents.resume() on the same session id when cold.
 *   target fork   -> copy the parent's completed-turn prefix (host session.fork
 *                    semantics: last `turn/end` boundary, seedLength metadata,
 *                    parentSession lineage) into a brand-new child session and
 *                    drive the wake there. Fork/new children are real persisted
 *                    sessions and stay in the sidebar once created.
 *
 *   source session  (resume/fork) -> the named target_session_id.
 *   source workspace (resume/fork, and the legacy target_mode "workspace") ->
 *                    resolve at fire time through the WorkspaceWakePort (most
 *                    recently updated session in the workspace; else its newest
 *                    blank New Session slot; else SKIP — nothing eligible).
 *                    The resolver never creates; plugin-created products are
 *                    never eligible (store bookkeeping).
 *   source preset   (resume/fork) -> resolve at fire time through the
 *                    PresetWakePort (the most recently updated session RUNNING
 *                    that preset; else SKIP for resume, fail-closed for fork).
 *
 * Sessions this driver creates itself (target_mode new products, fork
 * children) are bookkept into the store right after agents.create, so later
 * workspace/preset resolutions never wake inside the plugin's own echo.
 *
 * Every created/resumed agent gets a model-selection installed on its scope
 * (mirroring the web host's selectionFor), so its first buildRequest resolves
 * provider/model even when AgentOptions are empty: an alarm-level provider/
 * model override (target new) wins outright, else the session's own committed
 * request header, else agentDefaultModel. It is also composed onto the
 * session's agent preset (mirroring the web host's composeAgent): preset-owned
 * tools live on the agent's scope, so a resume/create that skips the join
 * leaves the agent on the host-plane-only registry — bash, read, ... all
 * answer "unknown tool". The preset id comes from the session's own header
 * plus any later `agent-preset/selected` events, so a wake rebuilds the exact
 * composition the session's history ran under.
 *
 *   busy agent    -> runMaintenance throws; caller retries after a short delay
 *   deep silence  -> the framing + no_reply contract; the observer
 *                    derives the decision from the committed session log
 *
 * The handle is always disposed when this driver created it (a resumed/created
 * agent is a process-local runtime; the persisted session itself stays intact).
 */
import type { Context } from "@deepseek-ai/cordis";
import type { Agent, AgentOptions, ModelSelection, ModelSelectionRef } from "@deepseek-ai/dsh-agent";
import type { EpochHeader, SessionEvent, SessionHeader } from "@deepseek-ai/dsh-session";
import { type Alarm, type RunDecision } from "./domain.js";
import type { ProactiveStore } from "./store.js";
import type { ProactiveConfig } from "./config.js";
import { resolveSessionPresetOf, type PresetWakePort, type WorkspaceWakePort } from "./workspace.js";
export { resolveSessionPresetOf };
export interface WakeAnalysisResult {
    decision: RunDecision;
    budgetDelta: number;
    note?: string;
    /** The no_reply reason the model gave for staying silent. */
    noReplyReason?: string;
    /** Truncated reasoning (thinking) summary of the wake turn. */
    reasoningSummary?: string;
    /** Truncated visible-reply summary of the wake turn. */
    replySummary?: string;
}
export type WakeFireResult = {
    outcome: "ok";
    analysis: WakeAnalysisResult; /** The session the wake actually ran in. */
    sessionId: string;
} | {
    outcome: "busy";
} | {
    outcome: "failed";
    error: string;
    sessionId?: string;
}
/** Nothing to wake (workspace/preset source resolved to no eligible session): the scheduler records a skip and advances — no retry, no budget. */
 | {
    outcome: "skipped";
    skipReason: string;
}
/** min_idle gate not satisfied yet: the scheduler re-arms at deferUntilMs with no record, no retry count, and no budget cost. */
 | {
    outcome: "defer";
    deferUntilMs: number;
};
/**
 * The live Session log surface across host lines: 0.1.1-rc.2 exposes `.events`,
 * 0.1.2-rc.1 replaced it with `snapshotEvents()` (`.seq` and `requestHeader()`
 * exist in both). A profile may run either line, so read the log through
 * whichever surface the live Session carries. A session still being created
 * has an empty log either way.
 */
export declare function sessionLogOf(session: unknown): readonly unknown[];
/**
 * The newest event timestamp in a session log, or undefined when the log is
 * empty or carries no parseable times. SessionEvent.time lives at the event
 * top level (never inside data) and is an ISO string.
 */
export declare function lastEventEpoch(events: readonly unknown[]): number | undefined;
/** Narrow facade over the pieces of AgentRegistry / agents we actually use. */
export interface AgentsFacade {
    get(sessionId: string): Agent | undefined;
    resume(options: ResumeFacadeOptions): Promise<AgentHandleLike>;
    create(options: CreateFacadeOptions): Promise<AgentHandleLike>;
}
/**
 * Read-only view of one persisted session, used to fork from a cold parent.
 * The plugin wires this to ctx.sessionPersistence.inspect; the narrow shape
 * keeps the driver independent of dsh-session-persistence internals.
 */
export interface SessionInspectLike {
    inspect(sessionId: string): Promise<{
        meta?: SessionHeader;
        events: readonly SessionEvent[];
    }>;
}
/**
 * Narrow facade over ctx.agentPresets: join one agent's scope to the standing
 * mount of one preset. The plugin resolves this from ctx (absent on a
 * rosterless deployment, where cold wakes stay on the host-plane registry).
 */
export interface AgentPresetsPort {
    /** The preset id mounted when a caller names none (AgentPresets.defaultId). */
    readonly defaultId: string;
    mount(agentCtx: Context, id?: string): Promise<unknown>;
}
/**
 * Creation/resume-time composition hook, handed the agent's scoped context
 * and the agent itself.
 *
 * dsh-agent 0.1.7 passes the Agent as the SECOND setup argument; reading it
 * as `agentCtx.agent` became an inject-gated service access on 0.1.7 and
 * throws `cannot get property "agent" without inject` (which took down every
 * new/fork/cold-resume wake, see docs/issues/260102-proactive-not-firing/).
 * The dev-mirror dsh-agent is still 0.1.1-rc.2 (one-argument AgentSetup), so
 * the live contract is declared here instead of imported from it.
 */
export type WakeSetup = (agentCtx: Context, agent: Agent) => void | Promise<void>;
/** Back-compat alias for the setup hook's historical export name. */
export type WakeResumeSetup = WakeSetup;
export interface ResumeFacadeOptions {
    resumeSessionId: string;
    agentOptions?: AgentOptions;
    setup?: WakeSetup;
}
export interface CreateFacadeOptions {
    sessionId: string;
    seed?: readonly SessionEvent[];
    agentOptions?: AgentOptions;
    setup?: WakeSetup;
    meta?: {
        cwd?: string;
        parentSession?: string;
        seedLength?: number;
        agentPreset?: string;
    };
}
/** The handle surface we consume (dsh-agent AgentHandle). */
export interface AgentHandleLike {
    agent: Agent;
    dispose(): Promise<void>;
}
export interface WakeDriverDeps {
    agents: AgentsFacade;
    /** Persisted-session reader for forking from cold parents (optional: fork degrades to failed when absent). */
    sessionPersistence?: SessionInspectLike;
    /** Workspace destination resolution for workspace-sourced targets (absent -> those alarms fail loudly). */
    workspaces?: WorkspaceWakePort;
    /** Preset destination resolution for preset-sourced targets (absent -> those alarms fail loudly). */
    presetTargets?: PresetWakePort;
    /** Preset roster for composing wake agents onto their session's preset (absent on a rosterless deployment). */
    agentPresets?: AgentPresetsPort;
    /** Provider/model override for resumed/created agents (from ctx.agentDefaultModel or config). */
    modelSelection: () => {
        provider?: string;
        model?: string;
    } | undefined;
    store: ProactiveStore;
    config: ProactiveConfig;
    now?: () => number;
    log: (level: "info" | "warn" | "error", message: string) => void;
}
/**
 * Host session.fork seed cut, mirrored verbatim: the seed is the balanced
 * completed-turn prefix ending at the LAST `turn/end` (extended over trailing
 * non-turn events up to the next `turn/start`), contiguous from seq 0. 0 when
 * the parent has no completed turn (fork unavailable).
 */
export declare function completedTurnCut(events: readonly {
    seq: number;
    type: string;
}[]): number;
export declare class WakeDriver {
    private readonly deps;
    /** Re-fire guard per alarm id. */
    private readonly inflightByAlarm;
    /** Wake-turn guard per session (kept for inflight/busy semantics). */
    private readonly inflightBySession;
    constructor(deps: WakeDriverDeps);
    /** Whether a wake for this session is currently in flight. */
    isActiveWake(sessionId: string): boolean;
    /**
     * Collapse the settled wake turn on the model surface (tombstone + fold
     * notice). Best-effort by design: a session without the platform's
     * append/surface split (test fakes) or a range a concurrent compaction
     * already shadowed just skips with a warn.
     */
    private compactWake;
    /**
     * Model selection for a resumed/created agent: an alarm-level override with
     * BOTH provider and model wins outright (a "new" target naming its model);
     * otherwise the session's own committed request header wins (the same model
     * the live session last used), and the fallback chain is the host's
     * agentDefaultModel MERGED with any partial override. Installed on the
     * agent's scope so the first buildRequest resolves provider/model even when
     * AgentOptions are empty — the web host's exact pattern (selectionFor).
     */
    private createWakeSelection;
    private agentOptions;
    private installSelection;
    /**
     * Creation meta recording the default preset, so a fresh child's header
     * names the composition it runs under (the web host records the same on
     * every create). `undefined` on a rosterless deployment.
     */
    private defaultPresetMeta;
    /**
     * Bookkeep one just-created session so the fire-time resolvers never route
     * a later wake into it (see workspace.ts). Best-effort persistence: the
     * in-memory book is already updated when the write fails, and this
     * process keeps the exclusion until a restart loses it.
     */
    private bookkeepCreatedSession;
    /**
     * Creation/resume-time composition, the web host's exact pattern
     * (composeAgent in the session controller): model selection first, then the
     * session's own preset — resolved from its header plus any later
     * `agent-preset/selected` events, so a wake rebuilds the exact composition
     * the session's history ran under. Without the join a preset-world agent
     * resolves only host-plane tools (bash/read/... all "unknown tool"), which
     * is the cold-wake defect this exists to prevent.
     *
     * Setup-time shape notes: a session being CREATED has an empty log at setup
     * (sessionLogOf → []; the header already carries the creation meta's preset
     * stamp, which the empty-log resolve falls back to), and resolveSessionPreset
     * reads `.events` directly, so it always receives the compat-adapted view —
     * never the raw live Session.
     */
    private composeAgent;
    /**
     * Events + workspace cwd + preset of a parent session, live agent first,
     * then persistence. The preset rides the fork child's meta so its header
     * records the composition its inherited history ran under.
     */
    private parentLog;
    /** Acquire the agent for one session id: live reuse or cold resume. */
    private acquireForResume;
    /**
     * min_idle_seconds gate for resume destinations: the wake is delivered only
     * after the destination session has been quiet for the configured span. The
     * clock reads the LIVE agent's session log tail — any event resets it,
     * including earlier wake turns, so a self-monitoring alarm enforces its own
     * spacing. A cold session is idle by definition (nothing is running).
     * Returns null when the wake may proceed.
     */
    private idleGate;
    /** Deliver the framed wake to `agent` and analyze the settled turn. */
    private drive;
    fire(alarm: Alarm): Promise<WakeFireResult>;
}
/**
 * Provider/model for a wake turn from the session's last committed request
 * header, when one exists. Pure so the fallback chain is unit-testable.
 *
 * `reasoningEffort` is passed through verbatim: an explicit effort in the
 * header is preserved for the wake turn, while an absent effort is left unset
 * so adapter/default effort resolution applies (mirrors the web host).
 */
export declare function selectionFromHeader(header: EpochHeader | undefined): ModelSelection | undefined;
/**
 * Mutable model selection for a resumed agent's wake turn: the session's own
 * committed request header wins, then {@link fallback} (agentDefaultModel).
 * A missing or incomplete fallback is surfaced as a warn instead of silently
 * emptying the selection; `current` is undefined only when nothing at all
 * resolves, so the request waterfall has nowhere to draw provider/model from.
 */
export declare function createWakeSelectionRef(header: EpochHeader | undefined, fallback: () => {
    provider?: string;
    model?: string;
} | undefined, log: WakeDriverDeps["log"]): ModelSelectionRef;
