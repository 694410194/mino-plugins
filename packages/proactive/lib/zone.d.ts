/**
 * Minimal "which time zone does this alarm belong to" resolution.
 *
 * time_zone is optional everywhere: when a caller does not pass one (the
 * overwhelmingly common case), the effective zone is the session's last
 * client-reported browser zone (web clients send `clientTimeZone` on every
 * user rpc message, exactly like dsh-time-context expects), falling back to
 * the host process zone. UTC remains only the final safety net.
 */
/** The host process zone (resolved once): typically the user's local zone in a self-hosted deploy. */
export declare const SYSTEM_DEFAULT_TIME_ZONE: string;
/**
 * The one resolution rule shared by the model tools and the GUI panel:
 * explicit non-empty time_zone wins, else the session's client zone, else
 * the host process zone.
 */
export declare function effectiveTimeZone(explicit: unknown, events: readonly unknown[] | undefined): string;
/**
 * Fill every empty time-zone slot of a create request through the one default
 * chain. A local `at` object that already names its zone IS the explicit
 * intent — nothing is wired on top of it (the at zone then flows into the
 * stored alarm through buildAlarm). Otherwise both the top-level time_zone and
 * a zone-less at object are completed with effectiveTimeZone.
 */
export declare function wireTimeZones(args: Record<string, unknown>, events: readonly unknown[] | undefined): Record<string, unknown>;
