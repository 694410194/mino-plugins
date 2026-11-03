import { type DataLabel, type FlowBinding } from '../../shared/data-flow.js';
import type { BotKey } from '../../shared/identity.js';
import type { MemoryKernel, Commit } from '../memory/op-log.js';
import type { OnceGrants, OnceGrant } from './grants.js';
export interface EgressEnvelope {
    binding: FlowBinding;
    content: string;
    label: DataLabel;
}
export interface DispatchTicket {
    readonly id: string;
    state: 'admitted' | 'dispatching' | 'delivered' | 'unknown' | 'cancelled';
}
/** Shared policy checker. ManagedOutlets persists actual outlet envelopes and checkpoints. */
export declare class EgressChecker {
    readonly kernel: MemoryKernel;
    readonly grants: OnceGrants;
    private readonly currentBot;
    private stopped;
    private readonly tickets;
    constructor(kernel: MemoryKernel, grants: OnceGrants, currentBot: (key: BotKey) => boolean);
    check(envelope: EgressEnvelope, grant?: OnceGrant, admitted?: string, signal?: AbortSignal): void;
    admit(envelope: EgressEnvelope, build: () => Commit, grant?: OnceGrant, signal?: AbortSignal): Promise<DispatchTicket>;
    dispatch<T>(ticket: DispatchTicket, send: (envelope: EgressEnvelope) => Promise<T>, signal?: AbortSignal): Promise<T>;
    close(): void;
}
