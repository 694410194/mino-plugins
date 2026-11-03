import type { Context } from '@deepseek-ai/cordis';
import type { Agent } from '@deepseek-ai/dsh-agent';
import type { Domain } from '@deepseek-ai/dsh-storage-domain';
import type { BotKey } from '../../shared/integrations.js';
import type { DshBotRegistry } from '../registry.js';
import { Serial } from '../common/operations.js';
import { type referenceMemoryDomain, type Live } from './model.js';
export declare class ReferenceWriter {
    protected ctx: Context;
    protected registry: DshBotRegistry;
    protected domain: Domain<typeof referenceMemoryDomain>;
    protected changed: () => void;
    protected readonly control: Serial;
    protected readonly live: Map<string, Live>;
    protected readonly reasons: Map<string, "unsupported" | "busy" | "initialization-failed" | "stopping" | "main-only" | "writer-conflict" | "invalid-file" | "copy-in-progress" | undefined>;
    protected readonly copying: Map<string, AbortController>;
    protected stopping: boolean;
    protected closing?: Promise<void>;
    protected readonly root: string;
    protected readonly executable: string;
    constructor(ctx: Context, registry: DshBotRegistry, domain: Domain<typeof referenceMemoryDomain>, changed: () => void);
    protected assertBot(bot: BotKey): Promise<void>;
    protected binding(bot: BotKey): {
        bot: {
            botId: string;
            botCreatedAt: number;
        };
        mode: "internal" | "internal+reference-graph";
        provider: "mcp-reference";
        packageVersion: "2026.7.4";
        sourceCommit: "6dd0a683e198783e30feabf7abaf42f925bd18b1";
        fileIdentity: string;
        scope: "main-only";
        revision: number;
        importId?: string | undefined;
    } | undefined;
    protected file(bot: BotKey, identity: string): string;
    protected prepare(bot: BotKey, identity: string): Promise<void>;
    protected mount(bot: BotKey, agent: Agent, identity: string, copying: boolean): Promise<Live>;
    protected closeLive(l: Live): Promise<void>;
    protected stop(bot: BotKey): Promise<void>;
    protected call(l: Live, tool: string, args: unknown, signal: AbortSignal, cleanup?: boolean): Promise<unknown>;
    protected read(l: Live, signal: AbortSignal): Promise<{
        entities: {
            name: string;
            entityType: string;
            observations: string[];
        }[];
        relations: {
            from: string;
            to: string;
            relationType: string;
        }[];
    }>;
}
