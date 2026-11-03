import type { MemoryAddInput, MemoryListOptions, MemoryPatch, MemoryRecord, MemorySaveResult } from '../../shared/schema.js';
import { type BotDomain } from './domain.js';
/** Replaceable retrieval predicate; the store always applies Bot isolation first. */
export type MemorySearchRecord = Readonly<Omit<MemoryRecord, 'tags' | 'source'>> & {
    readonly tags: readonly string[];
    readonly source?: Readonly<NonNullable<MemoryRecord['source']>>;
};
export interface MemorySearch {
    matches(record: MemorySearchRecord, query: string): boolean;
}
export declare function tokenizeMemoryQuery(query: string): string[];
export declare const lexicalMemorySearch: MemorySearch;
export declare class MemoryStore {
    private readonly domain;
    private readonly search;
    constructor(domain: BotDomain, search?: MemorySearch);
    add(input: MemoryAddInput): Promise<MemoryRecord>;
    /** Match and merge inside the domain writer, including across Store instances. */
    saveUnique(input: MemoryAddInput, signal?: AbortSignal): Promise<MemorySaveResult>;
    private persist;
    update(botId: string, id: string, patch: MemoryPatch): Promise<MemoryRecord>;
    remove(botId: string, id: string): Promise<void>;
    /** Count all rows owned by a Bot without allocating/cloning a result page. */
    countByBot(botId: string): number;
    /** Cursor denotes an exclusive position, not a timestamp cutoff or snapshot. */
    listByBot(botId: string, options: MemoryListOptions): MemoryRecord[];
    /** Serialized with adds/removes through either Store; not a cross-table transaction. */
    removeByBot(botId: string): Promise<number>;
}
