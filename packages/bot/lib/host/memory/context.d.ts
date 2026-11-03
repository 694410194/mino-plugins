import type { BotKey } from '../../shared/identity.js';
import type { Agent } from '@deepseek-ai/dsh-agent';
import type { MemoryKernel } from './op-log.js';
import type { MemoryAdmission } from './admission.js';
export interface ContextPolicy {
    maxInjectChars: number;
    privateShare: number;
    journalShare: number;
    journalDays: number;
}
export declare function nextDayBoundary(now: number, timeZone: string): number;
/** Sync provider reads only the published projection. No file, network, timer or model activity. */
export declare function memoryContext(kernel: MemoryKernel, owner: BotKey, policy: ContextPolicy, injectLimit: number, clock?: () => number, observed?: (ids: string[]) => void, audience?: () => readonly BotKey[] | undefined): () => string;
export declare function registerMemoryContext(agent: Agent, owner: BotKey, kernel: MemoryKernel, admission: MemoryAdmission, policy: ContextPolicy & {
    memorySectionOrder: number;
}, injectLimit: number, audience?: () => readonly BotKey[] | undefined): () => void;
