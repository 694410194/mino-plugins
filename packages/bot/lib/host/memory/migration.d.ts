import type { MigrationBotDomain } from '../stores/domain.js';
import type { MemoryKernel } from './op-log.js';
export declare const FENCE_KEY = "__dsh_bot_memory_v2_fence__";
export declare function assertCompatibleRecovery(kernel: MemoryKernel, capabilities: {
    fence: boolean;
    tombstone: boolean;
    epoch: boolean;
}): void;
/** Restartable private migration using only public table methods. The old table never becomes writable again. */
export declare function migratePrivate(legacy: MigrationBotDomain, kernel: MemoryKernel): Promise<{
    id: string;
    sourceSchema: 1;
    targetSchema: 2;
    phase: "prepare" | "copy" | "verify" | "cutover" | "legacy-clean" | "done";
    counts: {
        source: number;
        copied: number;
        quarantined: number;
    };
    cutoverSeq: number;
    forgetEpoch: number;
    sourceDigest?: string | undefined;
}>;
