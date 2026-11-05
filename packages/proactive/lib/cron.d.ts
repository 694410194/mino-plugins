/**
 * Zero-dependency five-field numeric cron for dsh-proactive (v2).
 *
 * dsh-schedule itself has no cron (only after/at/every); this module is a
 * self-contained implementation that mirrors the schedule plugin's semantics
 * and style: pure evaluation, closed error codes, occurrences strictly after
 * the reference instant, misses skipped (never re-fired), and — like every
 * other scheduler here — never trusting the process time zone.
 *
 * Grammar: five fields `minute hour day-of-month month day-of-week`.
 *   - minute 0-59, hour 0-23, dom 1-31, month 1-12, dow 0-7 (0 and 7 = Sunday, 1-6 = Mon-Sat)
 *   - each field: comma-separated atoms; atom = `*` | number | `a-b` | star-slash-n | `a-b/n`
 *   - no names, no '?', no seconds, no L/W/# extensions.
 * Day-of-month / day-of-week follow Vixie semantics: a day matches by the
 * restricted field alone when the other is a wildcard, or by either when both
 * are restricted (dom OR dow). On fall-back overlaps the earlier instant of an
 * ambiguous wall minute is the occurrence (the second, repeated wall minute is
 * not emitted — one occurrence per wall minute, consistent with the plugin's
 * resolveLocalInstant convention).
 */
export interface ParsedCron {
    minute: ReadonlySet<number>;
    hour: ReadonlySet<number>;
    dom: ReadonlySet<number>;
    month: ReadonlySet<number>;
    dow: ReadonlySet<number>;
}
/** Parse a five-field numeric cron expression; throws invalid_trigger on any syntax error. */
export declare function parseCron(expr: string): ParsedCron;
/**
 * The first cron occurrence strictly after afterEpoch in the given zone.
 * DST-correct: wall-clock moments are resolved through the same Intl-based
 * machinery as the rest of the plugin; a moment that does not exist
 * (spring-forward gap) is skipped, an ambiguous one (fall-back) takes the
 * earlier instant. Throws invalid_trigger when nothing matches in the 8-year
 * window. Pure: no clock, no random source, deterministic in (expr, zone, after).
 */
export declare function nextCronOccurrence(expr: string, timeZone: string, afterEpoch: number): number;
