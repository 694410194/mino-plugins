/**
 * Thin bridge between the official settings surface (ctx.settings) and the
 * live ProactiveConfig snapshot. The panel/settings UI edits the `proactive`
 * namespace for free; every resolved change hot-applies onto the single
 * config object the scheduler/wake/tools already hold by reference, so
 * quietHours/budget policies change without a restart.
 */
import z from "@deepseek-ai/schemastery";
import type { Context } from "@deepseek-ai/cordis";
import { type ProactiveConfig, type BootOverduePolicy, type QuietHours } from "./config.js";
import { type ToolError } from "./domain.js";
/** The hot-updatable configuration subset, excluding the immutable dataDir. */
export interface HotConfig {
    enabled: boolean;
    maxDeliveriesPerDay: number;
    quietHours: QuietHours;
    maxWakeupsPerHour: number;
    bootOverduePolicy: BootOverduePolicy;
    maxRetriesPerFire: number;
    maxPromptLength: number;
    defaultPrompt: string;
    silentWakeCompaction: boolean;
}
/**
 * Pull the hot subset out of a full configuration; used as the composition
 * `base` layer so an existing config.json keeps working as the default under
 * any user overrides written through the settings UI.
 */
export declare function hotSubset(config: ProactiveConfig): HotConfig;
/**
 * Apply a settings-resolved value onto the live config snapshot in place.
 * Returns whether anything changed; a deep-equal next value is a no-op.
 */
export declare function applyHotConfig(target: ProactiveConfig, next: HotConfig): boolean;
/**
 * Closed validation for the proactive_update_settings tool: an open patch of
 * snake_case keys, each optional; at least one key must be present. Returns
 * ONLY the keys that were supplied (partial), so an update never clobbers
 * other live settings. Numeric ranges mirror the resolveConfig clamps exactly
 * (tighter than the settings UI schema where they differ), so a tool-written
 * config.json is never silently truncated on the next boot — hot-applied and
 * persisted values always agree. default_prompt is capped at the hard
 * alarm-prompt limit (MAX_PROMPT_LENGTH): the prefill must always produce a
 * creatable alarm; a maxPromptLength below that cap only trims the prefill
 * loaded from a hand-edited file, never to an invalid state.
 */
export declare function validateSettingsPatch(raw: unknown): {
    patch: Partial<HotConfig>;
} | ToolError;
/** The `proactive` settings namespace schema; mirrors HotConfig. */
export declare const proactiveSettingsSchema: z<Schemastery.ObjectS<NoInfer<{
    enabled: z<boolean, boolean, "defined">;
    maxDeliveriesPerDay: z<number, number, "defined">;
    quietHours: z<Schemastery.ObjectS<NoInfer<{
        start: z<string, string, "defined">;
        end: z<string, string, "defined">;
        timeZone: z<string, string, "defined">;
    }>>, Schemastery.ObjectT<NoInfer<{
        start: z<string, string, "defined">;
        end: z<string, string, "defined">;
        timeZone: z<string, string, "defined">;
    }>>, "plain">;
    maxWakeupsPerHour: z<number, number, "defined">;
    bootOverduePolicy: z<"fire" | "notify-only" | "drop", "fire" | "notify-only" | "drop", "defined">;
    maxRetriesPerFire: z<number, number, "defined">;
    maxPromptLength: z<number, number, "defined">;
    defaultPrompt: z<string, string, "defined">;
    silentWakeCompaction: z<boolean, boolean, "defined">;
}>>, Schemastery.ObjectT<NoInfer<{
    enabled: z<boolean, boolean, "defined">;
    maxDeliveriesPerDay: z<number, number, "defined">;
    quietHours: z<Schemastery.ObjectS<NoInfer<{
        start: z<string, string, "defined">;
        end: z<string, string, "defined">;
        timeZone: z<string, string, "defined">;
    }>>, Schemastery.ObjectT<NoInfer<{
        start: z<string, string, "defined">;
        end: z<string, string, "defined">;
        timeZone: z<string, string, "defined">;
    }>>, "plain">;
    maxWakeupsPerHour: z<number, number, "defined">;
    bootOverduePolicy: z<"fire" | "notify-only" | "drop", "fire" | "notify-only" | "drop", "defined">;
    maxRetriesPerFire: z<number, number, "defined">;
    maxPromptLength: z<number, number, "defined">;
    defaultPrompt: z<string, string, "defined">;
    silentWakeCompaction: z<boolean, boolean, "defined">;
}>>, "plain">;
export interface SettingsWire {
    installed: boolean;
    dispose?: () => void;
}
/**
 * Register the namespace on ctx.settings when the service is composed and
 * hot-apply every resolved change onto the live config snapshot. Missing
 * settings (headless profiles) degrades to a logged no-op; the plugin never
 * hard-depends on the GUI surface.
 */
export declare function wireSettings(ctx: Context, config: ProactiveConfig): SettingsWire;
