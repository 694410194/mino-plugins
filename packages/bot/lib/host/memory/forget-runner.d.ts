import { type ForgetJob, type ForgetChoice, type CleanupStatus, type CleanupReason, type ForgetPreview } from '../../shared/memory-forget.js';
import type { MemoryKernel } from './op-log.js';
import type { ForgetPreviews } from './forget-preview.js';
export interface ForgetIO {
    drain(): Promise<void>;
    captureHeads?(preview: ForgetPreview): Promise<string[]>;
    history(sessionId: string, job: ForgetJob): Promise<CleanupReason[]>;
    copies(): Promise<void>;
    verifyInventory(job: ForgetJob): Promise<CleanupReason[]>;
}
export declare class ForgetRunner {
    private readonly kernel;
    private readonly previews;
    private readonly io;
    private tail;
    private stopped;
    private readonly choosing;
    constructor(kernel: MemoryKernel, previews: ForgetPreviews, io: ForgetIO);
    choose(choice: ForgetChoice): Promise<CleanupStatus>;
    private chooseInternal;
    status(id: string): CleanupStatus;
    statuses(): CleanupStatus[];
    resume(id: string): Promise<CleanupStatus>;
    recover(): Promise<void>;
    close(): Promise<void>;
    private job;
    private save;
    private phase;
    private run;
    private release;
}
