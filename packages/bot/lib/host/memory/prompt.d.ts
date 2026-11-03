import type { MemoryRecord } from '../../shared/schema.js';
/** Pack whole records in priority order, reserving space for an exact omitted count. */
export declare function buildMemoryPrompt(records: readonly MemoryRecord[], maxInjectChars: number): string;
