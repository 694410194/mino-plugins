import type { Agent } from '@deepseek-ai/dsh-agent';
import type { ForgetPreview } from '../../shared/memory-forget.js';
import type { MemoryKernel } from './op-log.js';
/** Capture source dependencies before payload erasure; persist only session identities, never content hashes. */
export declare function contaminatedHeads(kernel: MemoryKernel, preview: ForgetPreview, agents: Agent[], presetPrefix?: string): string[];
