/**
 * dsh-proactive configuration: defaults, $DSH_HOME/proactive/config.json overrides,
 * quiet-hours evaluation, and per-day/host chat-text delivery budget accounting.
 *
 * The plugin preference order (highest wins) is:
 *   1. environment variables DSH_PROACTIVE_* (numeric/enabled fields)
 *   2. <dataDir>/config.json        (file, loaded once at startup)
 *   3. built-in defaults.
 */
export interface QuietHours {
    /** "HH:MM" wall-clock in the configured time zone; start inclusive, end exclusive. */
    start: string;
    end: string;
    timeZone: string;
}
export type BootOverduePolicy = "fire" | "notify-only" | "drop";
export interface ProactiveConfig {
    enabled: boolean;
    /** Budget: visible chat-text deliveries per UTC day. */
    maxDeliveriesPerDay: number;
    /** Quiet hours during which only user-requested alarms (wake_reason "alarm") fire. */
    quietHours: QuietHours;
    /** Host-wide cap on proactive wake-up turns per rolling hour. */
    maxWakeupsPerHour: number;
    /** How boot-time overdue alarms are treated. */
    bootOverduePolicy: BootOverduePolicy;
    /** Successive attempt budget when a wake turn cannot run (busy/transient). */
    maxRetriesPerFire: number;
    /** Upper bound for alarm prompts. */
    maxPromptLength: number;
    /**
     * Default wake-up instruction pre-filled into the GUI create form (both the
     * settings page and the conversation tab). Purely a prefill convenience —
     * every stored alarm keeps its own explicit prompt. The constant lives in
     * domain.ts so the browser client bundle shares it.
     */
    defaultPrompt: string;
    /** Master gate for silent-wake tombstone compaction (per-alarm `compaction` still fine-tunes). */
    silentWakeCompaction: boolean;
    /**
     * Poll interval in seconds for schedule files owned by "file" alarms
     * (15..3600). The list of files is NOT configuration anymore: each file
     * handle is an alarm (261009).
     */
    schedulePollSeconds: number;
    /** Absolute directory for alarms.json / runs.jsonl / state.json / config.json. */
    dataDir: string;
}
export declare const DEFAULT_CONFIG: ProactiveConfig;
/** Parse and normalize one quiet-hours time value ("HH:MM"). */
export declare function parseClockTime(value: unknown, label: string): string;
/** Load <dataDir>/config.json tolerantly; malformed JSON falls back to defaults and a console warning. */
export declare function loadConfigFile(dataDir: string): Partial<ProactiveConfig>;
/**
 * Persist one config patch to <dataDir>/config.json atomically. The patch is
 * merged over whatever the file currently holds, so fields outside the patch
 * (hand-written or set earlier) survive. Returns the merged file object.
 */
export declare function writeConfigFile(dataDir: string, patch: Partial<ProactiveConfig>): Promise<Partial<ProactiveConfig>>;
/** Merge defaults, file overrides, and DSH_PROACTIVE_* environment overrides. */
export declare function resolveConfig(dataDir?: string): ProactiveConfig;
/** The current local wall-clock minutes and UTC-day key for one instant. */
export declare function localClockMinutes(now: Date | number, timeZone: string): {
    minutes: number;
    utcDate: string;
};
/** Whether one instant falls inside the quiet window (start inclusive, end exclusive; wrap-around allowed). */
export declare function isInQuietHours(now: Date | number, cfg: Pick<ProactiveConfig, "quietHours">): boolean;
export declare function quietHoursLabel(cfg: Pick<ProactiveConfig, "quietHours">): string;
