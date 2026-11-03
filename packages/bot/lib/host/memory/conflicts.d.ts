import { type BotKey } from '../../shared/identity.js';
import type { MemoryVersion } from '../../shared/memory-v2.js';
import { type Fact } from './temporal.js';
export interface JudgedFact extends Fact {
    state: MemoryVersion['status'];
    supersededBy?: string;
}
export declare function factKey({ payload: p, version: v }: Fact): string | undefined;
/** Pure, time-sliced adjudication. Permission filtering precedes grouping, so private disputes cannot leak. */
export declare function adjudicate(facts: readonly Fact[], at: number, bot?: BotKey, management?: boolean): JudgedFact[];
/** Partition known validity boundaries without assuming seq numbers are real-world time. */
export declare function temporalSlices(facts: readonly Fact[], bot?: BotKey): {
    from: number;
    to: number | null;
    rows: JudgedFact[];
}[];
