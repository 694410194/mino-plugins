export declare function ensureLeaseDirectory(path: string): Promise<string>;
/** Immutable successor chain: competing stale-owner recoveries create the same next path.
 * Never unlink a lock; that could unlink a newly acquired owner's lock. Live/unknown owners always refuse.
 */
export declare function acquireMemoryOwner(directory: string): Promise<{
    token: string;
    assertOwner: () => void;
    close(): Promise<void>;
}>;
