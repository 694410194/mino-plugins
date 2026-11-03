import type { Context } from '@deepseek-ai/cordis';
import type { Agent } from '@deepseek-ai/dsh-agent';
import { type GenerateOptions } from '@deepseek-ai/dsh-llm';
import type { MemoryKernel } from './op-log.js';
export declare class MemoryAdmission {
    private readonly ctx;
    private readonly presetPrefix;
    private kernel?;
    private stopped;
    private ready;
    private startupFailed;
    private readonly agents;
    private readonly leases;
    private readonly seen;
    private readonly audits;
    private readonly cleanupReads;
    denied: number;
    /** Exact one-call capability: no arbitrary tool or model bypass while the barrier is held. */
    cleanupRead<T>(agent: Agent, callId: string, read: () => Promise<T>): Promise<T>;
    assertToolAllowed(exec: {
        agent?: Agent;
        callId: string;
        name: string;
    }): void;
    /** Native request assembly, captured at final admission without reaching any provider or executing a tool. */
    verifyRequest(agent: Agent): Promise<GenerateOptions>;
    private auditRequest;
    get inFlight(): number;
    sessions(): Agent[];
    drain(): Promise<void>;
    constructor(ctx: Context, presetPrefix?: string);
    start(kernel: MemoryKernel): void;
    markStartupFailed(): void;
    private changed;
    assertAllowed(): void;
    observed(sessionId: string, versionIds: string[]): void;
    recordRead(sessionId: string, versionIds: string[]): Promise<void>;
    /** This effect is intentionally not returned to the preset/Host: it lasts until Agent disposal. */
    protect(agent: Agent): void;
    private assertSurface;
    private stream;
    close(): Promise<void>;
}
