import type { Context } from '@deepseek-ai/cordis';
import { BotStore } from './stores/bots.js';
import { ActivityStore, type ActivityStoreOptions } from './stores/activity.js';
import type { MemoryPort } from './memory/port.js';
import type { MemoryKernel } from './memory/op-log.js';
export { botDomain } from './stores/domain.js';
export { BotStore } from './stores/bots.js';
export { ActivityStore, type ActivityStoreOptions, type ActivityRecordInput } from './stores/activity.js';
export { MemoryStore, lexicalMemorySearch, tokenizeMemoryQuery, type MemorySearch, type MemorySearchRecord, } from './stores/memory.js';
/** Call once in the owning Host context (inject storageDomain); share the stores. */
export declare function openBotStores(ctx: Context, options?: ActivityStoreOptions & {
    beforeClose?: () => Promise<void>;
    assertOwner?: () => void;
    memoryV2?: {
        dataDir: string;
        timeZone?: string;
        retrievalConfig?: import('./memory/retrieval-config.js').Config;
    };
}): Promise<{
    bots: BotStore;
    memories: MemoryPort;
    memoryKernel?: MemoryKernel;
    activities: ActivityStore;
    close: () => Promise<void>;
}>;
