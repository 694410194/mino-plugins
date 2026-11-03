import { type MemoryPayload } from '../../shared/memory-v2.js';
import { type MemoryQuery, type MemoryCreate, type MemoryRevise, type MemoryResolve, type MemoryConfirm } from '../../shared/memory-management.js';
import type { BotStore } from '../stores/bots.js';
import type { MemoryKernel } from './op-log.js';
/** Management capability only. Not registered as a model tool or accepted from model arguments. */
export declare class MemoryManagement {
    readonly kernel: MemoryKernel;
    private readonly bots;
    private readonly journalDays;
    constructor(kernel: MemoryKernel, bots: BotStore, journalDays?: number);
    private check;
    private bot;
    private fact;
    query(input: MemoryQuery): {
        rows: {
            deletedBot: boolean;
            state: "proposed" | "active" | "disputed" | "superseded" | "expired" | "rejected" | "forgotten";
            version: import("../../shared/memory-v2.js").MemoryVersion;
            payload: MemoryPayload;
        }[];
        next?: string | undefined;
        revision: number;
        total: number;
    };
    create(input: MemoryCreate): Promise<`${string}-${string}-${string}-${string}-${string}`>;
    private revision;
    revise(input: MemoryRevise): Promise<void>;
    confirm(input: MemoryConfirm): Promise<string>;
    resolve(input: MemoryResolve): Promise<void>;
    private write;
}
