import { type Config as RetrievalConfig } from './retrieval-config.js';
import { type MemoryOp } from '../../shared/memory-ops.js';
import { type MemoryPayload, type MemoryVersion } from '../../shared/memory-v2.js';
import type { MemoryDomain } from './domain-v2.js';
import { type Projection } from './projection.js';
export type Commit = Omit<MemoryOp, 'seq' | 'versions' | 'payloadRefs' | 'receiptRefs'> & {
    versions?: MemoryVersion[];
    payloads?: Record<string, MemoryPayload>;
};
/** One queue for durable memory admission, commits and barriers. Not a cross-process lock. */
export declare class MemoryKernel {
    readonly domain: MemoryDomain;
    private readonly assertOwner;
    readonly retrievalConfig: RetrievalConfig;
    private tail;
    private state;
    frozen: boolean;
    stopped: boolean;
    cacheFailures: number;
    readonly listeners: Set<() => void>;
    constructor(domain: MemoryDomain, assertOwner: () => void, retrievalConfig?: RetrievalConfig);
    recover(timeZone?: string): Promise<void>;
    get snapshot(): Projection;
    get scope(): {
        scope: {
            id: string;
            createdAt: number;
        };
        policyRevision: number;
        quotaTimeZone: string;
    };
    get epoch(): number;
    get seq(): number;
    get blocked(): boolean;
    assertReadable(): void;
    assertOwnership(): void;
    serial<T>(operation: () => Promise<T> | T): Promise<T>;
    get policyRevision(): number;
    transact(build: () => Commit): Promise<MemoryOp>;
    commit(input: Commit, beforeCommit?: () => Promise<void>): Promise<MemoryOp>;
    private commitNow;
    private publish;
    close(): Promise<void>;
}
