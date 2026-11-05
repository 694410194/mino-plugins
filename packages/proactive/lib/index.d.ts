/**
 * dsh-proactive — 模型主动跟进插件（host-level alarms for DSH agents）
 *
 * Wire-up:
 *   - host store (alarms.json / runs.jsonl / state.json) under the data dir
 *   - ProactiveScheduler drives due alarms through WakeDriver
 *   - WakeDriver resumes cold sessions (ctx.agents.resume) or reuses live
 *     agents, delivers the framed wake message, waits for the turn, and the
 *     observer derives the decision from the committed session log
 *   - proactive_* tools are registered on every root agent (agent/created),
 *     so resumed wake turns always see them
 *
 * Configuration: <dataDir>/config.json overrides defaults (see config.ts),
 * DSH_PROACTIVE_* environment variables override both.
 */
import type { Context } from "@deepseek-ai/cordis";
export declare const name = "dsh-proactive";
export declare const inject: string[];
export declare function apply(ctx: Context): Promise<() => Promise<void>>;
