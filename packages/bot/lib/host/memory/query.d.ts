import type { BotKey } from '../../shared/identity.js';
import type { MemoryKernel } from './op-log.js';
import { type TimeQuery } from './temporal.js';
export { retrievalRank as rankFacts } from './retrieval-rank.js';
export declare function readableFacts(kernel: MemoryKernel, bot: BotKey, query: TimeQuery): import("./conflicts.js").JudgedFact[];
