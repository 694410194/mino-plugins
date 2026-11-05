/**
 * Agent-scoped proactive alarm tools. Registered on every root agent's scoped
 * context (re-registration happens for resumed agents via agent/created).
 *
 *   proactive_set       create one host-level alarm for this session
 *   proactive_list      view this session's active alarms (all=true: every session's)
 *   proactive_cancel    cancel one active alarm by exact id — any owner
 *   proactive_update    replace one active alarm's spec by exact id — any owner
 *   proactive_reclaim    nothing to do this wake turn: end it and let the host reclaim the exchange
 *   proactive_update_settings  partially update host-level settings (only the given fields)
 *
 * The stores they touch are host-level (the plugin singleton), so they work
 * identically in cold-wake turns and in ordinary user turns.
 *
 * v2 (260907-proactive-alarm-v2): the wake_reason dial is gone; proactive_set
 * now takes exactly one of at | after_seconds | every_seconds | cron (the
 * alarm type falls out of it) plus the unified jitter_seconds, the
 * respect_quiet_hours switch (default false) and the target_mode /
 * target_session_id destination (default: this session, i.e. resume).
 */
import type { Context } from "@deepseek-ai/cordis";
import { type ToolDefinition } from "@deepseek-ai/dsh-tools";
import type { Agent } from "@deepseek-ai/dsh-agent";
import { type Alarm, type ToolError } from "./domain.js";
import type { ProactiveConfig } from "./config.js";
import type { ProactiveStore } from "./store.js";
import type { ProactiveScheduler } from "./scheduler.js";
import type { WakeDriver } from "./wake.js";
export interface ToolServices {
    store: ProactiveStore;
    config: ProactiveConfig;
    driver: WakeDriver;
    scheduler: ProactiveScheduler;
    now: () => number;
    /**
     * Create-side workspace argument wiring (target_workspace_path / default ->
     * canonical target_workspace_id). Absent on hosts without a workspace
     * registry; workspace-targeted creates then fail closed.
     */
    resolveWorkspace?: (args: Record<string, unknown>, sessionCwd: string | undefined) => Promise<Record<string, unknown> | ToolError>;
    /**
     * The live event log of any session by id (client-zone default chain for
     * updates of alarms owned by other sessions). Absent on hosts without the
     * sessions service; timezone wiring then falls back to the host zone.
     */
    sessionEvents?: (sessionId: string) => readonly unknown[] | undefined;
    /** Host logger; absent in unit tests. */
    log?: (level: "info" | "warn" | "error", message: string) => void;
    /**
     * Immediate schedule-file sync (late-bound: the sync loop is constructed
     * after the tools so the registration order never matters).
     */
    syncNow?: () => Promise<unknown>;
}
/** Build the six tool definitions bound to one agent + its host services. */
export declare function proactiveToolDefinitions(agent: Agent, services: ToolServices): ToolDefinition[];
/**
 * Register the six tools on an agent's scoped context; returns disposable
 * tools. The definitions themselves live in {@link proactiveToolDefinitions}
 * so they can be unit-tested without a cordis context.
 */
export declare function registerProactiveTools(agentCtx: Context, agent: Agent, services: ToolServices): {
    disposer: () => void;
};
export type { Alarm };
