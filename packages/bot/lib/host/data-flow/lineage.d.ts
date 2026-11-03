import type { DataLabel } from '../../shared/data-flow.js';
import type { MemoryKernel } from '../memory/op-log.js';
/** Durable, monotone session taint. Cleanup cannot narrow it without a separately verified recomputation. */
export declare class MemoryLineage {
    private readonly kernel;
    constructor(kernel: MemoryKernel);
    seen(sessionId: string): string[];
    label(versionIds: string[]): DataLabel;
    record(sessionId: string, versionIds: string[]): Promise<DataLabel>;
}
