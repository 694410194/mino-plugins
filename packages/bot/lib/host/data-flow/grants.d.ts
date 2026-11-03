import { type FlowBinding } from '../../shared/data-flow.js';
import type { MemoryKernel } from '../memory/op-log.js';
export interface OnceGrant {
    readonly id: string;
}
/** Host objects, never accepted via Remote/model JSON. Restart discards unused permissions. */
export declare class OnceGrants {
    private readonly kernel;
    private readonly ttlMs;
    private readonly clock;
    private stopped;
    private readonly grants;
    constructor(kernel: MemoryKernel, ttlMs?: number, clock?: () => number);
    issue(binding: FlowBinding, content: string): OnceGrant;
    check(grant: OnceGrant, binding: FlowBinding, content: string, admitted?: string): void;
    admitted(grant: OnceGrant, opId: string): void;
    close(): void;
}
