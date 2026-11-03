/** A user-selected cwd is only validated, never created, chmod'ed or deleted. */
export declare function validateDefaultCwd(path: string | undefined): Promise<void>;
/** Directory ownership is separate from Bot records, so keeping a home across
 * Bot deletion/recreation or Host restart never silently transfers user data.
 * The marker is outside the private home; it records the exact directory inode.
 * All Bots share the workspace root, including these per-Bot markers.
 */
export declare class BotHomes {
    private readonly dshHome;
    constructor(dshHome: string);
    private directory;
    private botsRoot;
    /** Shared cwd, separate from configurable skills data; never follows a managed symlink. */
    ensureRoot(): Promise<{
        path: string;
    }>;
    private paths;
    private identity;
    private readOwner;
    private owned;
    ensure(botId: string): Promise<{
        path: string;
    }>;
    /** Validate before deleting a Bot. Recheck after its successful store commit;
     * an absent home is a no-op, and unowned paths are never adopted or deleted. */
    prepareRemoval(botId: string): Promise<() => Promise<void>>;
}
