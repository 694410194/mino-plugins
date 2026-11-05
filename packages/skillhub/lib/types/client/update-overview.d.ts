import type { InstalledUpdateCheck } from '../host/types.js';
export type UpdateResult = InstalledUpdateCheck | {
    state: 'failed';
};
/** Bounded read-only queue. Cancellation and timeouts settle even if a transport ignores abort. */
export declare function checkInstalledUpdates(keys: string[], check: (key: string, signal: AbortSignal) => Promise<InstalledUpdateCheck>, signal: AbortSignal, receive: (key: string, result: UpdateResult) => void, timeoutMs?: number): Promise<void>;
export declare const updateFailed: (result?: UpdateResult) => boolean;
