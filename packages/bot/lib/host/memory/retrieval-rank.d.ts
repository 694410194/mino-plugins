import { type Config } from './retrieval-config.js';
export interface SearchPayload {
    content: string;
    subject?: string;
    factKey?: string;
    qualifiers?: Record<string, string>;
}
export interface SearchRow {
    payload: SearchPayload;
    version: {
        memoryId: string;
        commitSeq: number;
    };
}
/** BM25 per field with soft token matching. Caller must supply only authorized, time-filtered rows. */
export declare function retrievalRank<T extends SearchRow>(rows: readonly T[], query: string, limit?: number, config?: Config): T[];
