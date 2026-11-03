import { type BotKey } from '../../shared/identity.js';
import { type MemoryAddInput, type MemoryRecord, type MemoryPatch, type MemoryListOptions } from '../../shared/schema.js';
import type { BotStore } from '../stores/bots.js';
import type { MemoryKernel } from './op-log.js';
export declare class V2MemoryStore {
    readonly kernel: MemoryKernel;
    private readonly bots;
    private readonly queue;
    private readonly bound?;
    constructor(kernel: MemoryKernel, bots: BotStore, queue?: {
        tail: Promise<unknown>;
    }, bound?: BotKey | undefined);
    forBot(botId: string): V2MemoryStore;
    captureEpoch(): number;
    assertEpoch(epoch: number): void;
    private owner;
    private mutate;
    private compare;
    /** Read-only legacy DTO. Host version/provenance fields never enter the old Remote/tool contract. */
    records(botId: string): MemoryRecord[];
    listByBot(botId: string, options: MemoryListOptions): MemoryRecord[];
    readableByBot(botId: string, options: MemoryListOptions): (MemoryRecord & {
        scope?: 'private' | 'shared';
    })[];
    countByBot(botId: string): number;
    add(input: MemoryAddInput): Promise<MemoryRecord>;
    saveUnique(input: MemoryAddInput, signal?: AbortSignal): Promise<{
        id: string;
        deduplicated: boolean;
    }>;
    private persist;
    private put;
    update(botId: string, id: string, patch: MemoryPatch): Promise<MemoryRecord>;
    remove(botId: string, id: string): Promise<void>;
    private forget;
    removeByBot(botId: string): Promise<number>;
}
