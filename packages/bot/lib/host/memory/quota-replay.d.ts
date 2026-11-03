import type { MemoryOp } from '../../shared/memory-ops.js';
import type { Projection } from './projection.js';
/** Also enforced during recovery: quotas cannot depend on disposable caches or a caller's counter. */
export declare function validateCharge(state: Projection, op: MemoryOp): void;
