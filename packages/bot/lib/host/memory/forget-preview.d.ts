import type { ForgetPreview, ForgetSelection } from '../../shared/memory-forget.js';
import type { MemoryKernel } from './op-log.js';
export interface ForgetInventory {
    sessionIds: string[];
    historyNodes: number;
    summaries: number;
    copies: number;
    pendingMessages: number;
    conservative: boolean;
    rootInstructions: boolean;
    stamp: unknown;
    bots?: number;
}
export declare class ForgetPreviews {
    private readonly kernel;
    private readonly inventory;
    private readonly pending;
    constructor(kernel: MemoryKernel, inventory: () => Promise<ForgetInventory>);
    contribution(memoryId: string): Promise<ForgetPreview>;
    create(selection: ForgetSelection): Promise<ForgetPreview>;
    private createPreview;
    /** Called inside the kernel commit queue, immediately before persisting intent. */
    validate(revision: string): Promise<ForgetPreview>;
    clear(): void;
    private build;
    private duplicate;
}
