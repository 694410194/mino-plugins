import { type BotKey } from '../../shared/identity.js';
import type { MemoryKernel } from './op-log.js';
export declare const retiredShard: (kernel: MemoryKernel, bot: BotKey) => boolean;
export declare function retireShard(kernel: MemoryKernel, owner: BotKey): Promise<void>;
