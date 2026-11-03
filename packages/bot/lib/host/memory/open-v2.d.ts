import type { Context } from '@deepseek-ai/cordis';
import { MemoryKernel } from './op-log.js';
export declare function openMemoryKernel(ctx: Context, dataDir: string, timeZone?: string, retrievalConfig?: Partial<import('./retrieval-config.js').Config>): Promise<{
    kernel: MemoryKernel;
    assertOwner: () => void;
    close: () => Promise<void>;
}>;
