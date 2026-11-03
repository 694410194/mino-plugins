import type { Context } from '@deepseek-ai/cordis';
import { type MemoryDomain } from './domain-v2.js';
/** Native per-record bootstrap leaves the single document behind and may stop halfway.
 * Recopy from its public single-layout domain until `copied` is durable; only then erase
 * legacy rows through public table APIs. `ready` prevents reading the old medium again.
 * The caller holds the existing owner lease throughout. No kernel is exposed before ready.
 */
export declare function openMemoryDomain(ctx: Context): Promise<MemoryDomain>;
