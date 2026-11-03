import type { AutoSharePolicy, QuotaCharge } from '../../shared/data-flow.js';
import type { MemoryOp } from '../../shared/memory-ops.js';
import type { MemoryVersion } from '../../shared/memory-v2.js';
import type { MemoryDomain } from './domain-v2.js';
import { PersistentMap, PersistentSet } from './persistent-map.js';
export interface Projection {
    seq: number;
    epoch: number;
    versions: PersistentMap<MemoryVersion>;
    forgotten: PersistentSet;
    retired: PersistentSet;
    autoPolicy?: AutoSharePolicy;
    quota: PersistentMap<QuotaCharge>;
    grantUses: PersistentSet;
}
export declare const emptyProjection: () => Projection;
export declare function applyOp(current: Projection, op: MemoryOp): Projection;
export declare function rebuild(domain: MemoryDomain): Projection;
/** Constant-size disposable watermark, never authority for recovery. Replay does bounded work per version after sorting ops. */
export declare function persistWatermark(domain: MemoryDomain, state: Projection): Promise<void>;
/** Recovery/forget maintenance only: remove abandoned and erased attachments, including old revisions. */
export declare function persistProjection(domain: MemoryDomain, state: Projection): Promise<void>;
