import type { Agent } from '@deepseek-ai/dsh-agent';
import type { DataLabel, EgressTarget } from '../../shared/data-flow.js';
import { type FlowEnvelope, type FlowRecord, type Outlet } from '../../shared/managed-flow.js';
import type { BotKey } from '../../shared/identity.js';
import type { EgressChecker } from './egress.js';
import type { OnceGrant } from './grants.js';
/** Durable outlet state in the existing memory domain. No replay of uncertain native side effects. */
export declare class ManagedOutlets {
    readonly checker: EgressChecker;
    private stopped;
    private readonly lifetime;
    private readonly permissions;
    private readonly pending;
    constructor(checker: EgressChecker);
    get kernel(): import("../memory/op-log").MemoryKernel;
    private signal;
    stop(): void;
    recover(): Promise<void>;
    inherit(sessionId: string, label: DataLabel): Promise<void>;
    label(sessionId: string): DataLabel;
    draft(outlet: Outlet, bot: BotKey, sessionId: string, call: string, target: EgressTarget, content: string): FlowEnvelope;
    /** Data export approval is distinct from generic native tool execution approval. */
    request(agent: Agent, envelope: FlowEnvelope, signal: AbortSignal): Promise<OnceGrant | undefined>;
    admit(envelope: FlowEnvelope, grant?: OnceGrant, signal?: AbortSignal): Promise<string>;
    persist<T>(id: string, save: () => Promise<T>, signal?: AbortSignal): Promise<T>;
    private check;
    get(id: string): FlowRecord;
    validate(id: string, content?: string, signal?: AbortSignal): Promise<void>;
    dispatch<T>(id: string, send: (envelope: FlowEnvelope, signal: AbortSignal) => T | Promise<T>, signal?: AbortSignal): Promise<T>;
    private dispatchInternal;
    private put;
    close(): Promise<void>;
}
