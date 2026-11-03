import type { Context } from '@deepseek-ai/cordis';
import type { DshBotRegistry } from './registry.js';
export declare const mainSessionDomain: {
    name: string;
    version: number;
    tables: {
        bindings: import("@deepseek-ai/dsh-storage-domain").DomainTableSpec<string, {
            botId: string;
            botCreatedAt: number;
            sessionId: string;
        }>;
    };
};
export interface MainSession {
    sessionId: string;
}
/** Only metadata/projections choose a main session. No history inspection, deletion or replay. */
export declare class MainSessions {
    private readonly ctx;
    private readonly bots;
    private domain;
    private tail;
    private stopped;
    private closing?;
    private readonly pinned;
    private readonly naming;
    private off?;
    private readonly repairs;
    /** Host-only immutable IDs, including retired Bot generations. No resolve or title writes during forget CAS. */
    boundSessionIds(): string[];
    /** Exact persisted pointer for explicit recovery CAS, including an unavailable former main. */
    boundSessionId(botId: string, botCreatedAt: number): string | undefined;
    constructor(ctx: Context, bots: DshBotRegistry);
    start(): Promise<void>;
    private serialize;
    private header;
    private eligible;
    private pin;
    private resolve;
    find(botId: string): Promise<MainSession | undefined>;
    open(botId: string): Promise<MainSession>;
    /** Explicit user recovery: create a new native conversation without copying or erasing lineage. */
    fresh(botId: string, expectedBotCreatedAt: number, expectedSessionId: string | null): Promise<MainSession>;
    close(): Promise<void>;
}
