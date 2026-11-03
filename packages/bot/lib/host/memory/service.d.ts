import { z } from 'zod';
import type { MemoryListOptions, MemoryPatch, MemoryRecord, MemorySaveResult } from '../../shared/schema.js';
import type { MemoryPort } from './port.js';
export declare const memorySaveInputSchema: z.ZodObject<{
    kind: z.ZodDefault<z.ZodEnum<{
        profile: "profile";
        preference: "preference";
        fact: "fact";
        note: "note";
    }>>;
    content: z.ZodString;
    tags: z.ZodDefault<z.ZodArray<z.ZodString>>;
    pinned: z.ZodDefault<z.ZodBoolean>;
}, z.core.$strict>;
export declare const memorySearchInputSchema: z.ZodObject<{
    query: z.ZodString;
    limit: z.ZodOptional<z.ZodNumber>;
}, z.core.$strict>;
export declare const memoryListInputSchema: z.ZodObject<{
    pinned: z.ZodOptional<z.ZodBoolean>;
    tag: z.ZodOptional<z.ZodString>;
    limit: z.ZodOptional<z.ZodNumber>;
}, z.core.$strict>;
export declare const memoryForgetInputSchema: z.ZodObject<{
    id: z.ZodString;
}, z.core.$strict>;
export type MemorySaveInput = z.input<typeof memorySaveInputSchema>;
export type MemorySearchInput = z.input<typeof memorySearchInputSchema>;
export type MemoryListInput = z.input<typeof memoryListInputSchema>;
export type MemoryForgetInput = z.input<typeof memoryForgetInputSchema>;
export type MemoryOperationExecutor = <T>(operation: () => T | Promise<T>) => Promise<T>;
/** A capability for exactly one Bot. The registry supplies its lifecycle queue. */
export declare class BotMemoryService {
    private store;
    private readonly execute;
    private readonly botId;
    private readonly defaultListLimit;
    constructor(store: MemoryPort, botId: string, execute?: MemoryOperationExecutor, defaultListLimit?: number);
    save(input: MemorySaveInput, source?: MemoryRecord['source'], signal?: AbortSignal): Promise<MemorySaveResult>;
    search(input: MemorySearchInput, signal?: AbortSignal, observed?: (rows: MemoryRecord[]) => Promise<void>): Promise<MemoryRecord[]>;
    list(input?: MemoryListInput, signal?: AbortSignal, observed?: (rows: MemoryRecord[]) => Promise<void>): Promise<MemoryRecord[]>;
    forget(input: MemoryForgetInput, signal?: AbortSignal): Promise<void>;
    /** Management batches use the same validation, deduplication and registry ownership queue. */
    saveBatch(inputs: MemorySaveInput[], check: (rows: MemoryRecord[]) => void): Promise<MemorySaveResult[]>;
    /** Cursor reads for management UI; model tools keep their narrower contracts. */
    query(input: Omit<MemoryListOptions, 'limit'> & {
        limit?: number;
    }, signal?: AbortSignal): Promise<MemoryRecord[]>;
    update(id: string, patch: MemoryPatch, signal?: AbortSignal): Promise<MemoryRecord>;
    /** Count every memory in one registry queue slot, without returning its content. */
    count(signal?: AbortSignal): Promise<number>;
    /** Read all pins plus the latest unpinned records in a single queue slot.
     * Synchronous cursor reads keep every page in the same point-in-time snapshot.
     */
    snapshot(injectLimit: number): Promise<MemoryRecord[]>;
    /** Hold the existing registry write queue while verifying and committing a copy receipt. */
    withSnapshot<T>(injectLimit: number, consume: (rows: MemoryRecord[]) => Promise<T>): Promise<T>;
    private run;
}
