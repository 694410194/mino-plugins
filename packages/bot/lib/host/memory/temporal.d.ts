import type { MemoryVersion, MemoryPayload } from '../../shared/memory-v2.js';
import type { MemoryKernel } from './op-log.js';
export interface Fact {
    version: MemoryVersion;
    payload: MemoryPayload;
}
export interface TimeQuery {
    at: number;
    recordedBefore?: number;
    commitBefore?: number;
}
export declare const effective: (p: MemoryPayload, at: number) => boolean;
/** Recorded time is a knowledge cutoff; valid time is the independently queried real-world interval. */
export declare function temporalView(kernel: MemoryKernel, query: TimeQuery): {
    facts: Fact[];
    boundary: number;
};
export declare const temporalFacts: (kernel: MemoryKernel, query: TimeQuery) => Fact[];
