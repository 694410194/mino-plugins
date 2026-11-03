import type { Context } from '@deepseek-ai/cordis';
import type { Agent } from '@deepseek-ai/dsh-agent';
import type { BotKey } from '../../shared/integrations.js';
import type { DshBotRegistry } from '../registry.js';
import type { IntegrationStores } from '../common/integration-stores.js';
import { Serial } from '../common/operations.js';
export declare class Connectors {
    private ctx;
    private stores;
    private registry;
    private timeoutMs;
    private changed;
    readonly queue: Serial;
    private live;
    private stopping;
    constructor(ctx: Context, stores: IntegrationStores, registry: DshBotRegistry, timeoutMs: number, changed: () => void);
    definitions(): {
        id: string;
        label: string;
        templateId: "custom" | "github" | "filesystem" | "browser" | "notion";
        templateVersion: 1;
        serverName: string;
        transport: "stdio" | "streamable-http";
        args: string[];
        literalEnv: Partial<Record<"LANG" | "LC_ALL" | "TZ" | "NODE_ENV", string>>;
        literalHeaders: Partial<Record<"Accept" | "Content-Type", "application/json" | "text/event-stream" | "application/json, text/event-stream">>;
        credentialBindings: {
            destination: "header" | "env";
            key: string;
            credentialRef: string;
            format: "raw" | "bearer" | "basic-token";
        }[];
        enabled: boolean;
        revision: number;
        createdAt: number;
        updatedAt: number;
        schemaVersion: 1;
        command?: string | undefined;
        url?: string | undefined;
    }[];
    assignments(): {
        desiredRevision: number;
        id: string;
        bot: {
            botId: string;
            botCreatedAt: number;
        };
        connectorId: string;
        enabled: boolean;
        overrides: {
            args?: string[] | undefined;
            literalEnv?: Partial<Record<"LANG" | "LC_ALL" | "TZ" | "NODE_ENV", string>> | undefined;
            literalHeaders?: Partial<Record<"Accept" | "Content-Type", "application/json" | "text/event-stream" | "application/json, text/event-stream">> | undefined;
        };
        revision: number;
        createdAt: number;
        updatedAt: number;
        schemaVersion: 1;
    }[];
    runtime(): {
        toolCount: number;
        assignmentId: string;
        sessionId: string;
        desiredRevision: number;
        state: "pending" | "unavailable" | "ready" | "disabled" | "connecting";
        appliedRevision?: number | undefined;
        reasonCode?: "revoked" | "saved" | "busy" | "missing-credential" | "initialization-failed" | "namespace-conflict" | "stopping" | "agent-closed" | undefined;
    }[];
    assertBot(bot: BotKey): Promise<void>;
    saveDefinition(input: unknown, expected: number): Promise<{
        id: string;
        label: string;
        templateId: "custom" | "github" | "filesystem" | "browser" | "notion";
        templateVersion: 1;
        serverName: string;
        transport: "stdio" | "streamable-http";
        args: string[];
        literalEnv: Partial<Record<"LANG" | "LC_ALL" | "TZ" | "NODE_ENV", string>>;
        literalHeaders: Partial<Record<"Accept" | "Content-Type", "application/json" | "text/event-stream" | "application/json, text/event-stream">>;
        credentialBindings: {
            destination: "header" | "env";
            key: string;
            credentialRef: string;
            format: "raw" | "bearer" | "basic-token";
        }[];
        enabled: boolean;
        revision: number;
        createdAt: number;
        updatedAt: number;
        schemaVersion: 1;
        command?: string | undefined;
        url?: string | undefined;
    }>;
    private generation;
    private assertNamespace;
    saveAssignment(input: unknown, expected: number): Promise<{
        id: string;
        bot: {
            botId: string;
            botCreatedAt: number;
        };
        connectorId: string;
        enabled: boolean;
        overrides: {
            args?: string[] | undefined;
            literalEnv?: Partial<Record<"LANG" | "LC_ALL" | "TZ" | "NODE_ENV", string>> | undefined;
            literalHeaders?: Partial<Record<"Accept" | "Content-Type", "application/json" | "text/event-stream" | "application/json, text/event-stream">> | undefined;
        };
        desiredRevision: number;
        revision: number;
        createdAt: number;
        updatedAt: number;
        schemaVersion: 1;
    }>;
    private markPending;
    botChanged(id: string): void;
    credentialChanged(ref: string): void;
    applyIdle(bot: BotKey): Promise<{
        toolCount: number;
        assignmentId: string;
        sessionId: string;
        desiredRevision: number;
        state: "pending" | "unavailable" | "ready" | "disabled" | "connecting";
        appliedRevision?: number | undefined;
        reasonCode?: "revoked" | "saved" | "busy" | "missing-credential" | "initialization-failed" | "namespace-conflict" | "stopping" | "agent-closed" | undefined;
    }[]>;
    attach(agent: Agent, bot: BotKey): Promise<() => Promise<void>>;
    private schedule;
    private applyLive;
    importLegacy(bot: BotKey): Promise<{
        revision: number;
        createdAt: number;
        updatedAt: number;
        schemaVersion: 1;
        id: string;
        bot: {
            botId: string;
            botCreatedAt: number;
        };
        digest: string;
        assignmentIds: string[];
    }>;
    copyDisabled(source: BotKey, target: BotKey): Promise<void>;
    close(): Promise<void>;
}
declare module '@deepseek-ai/cordis' {
    interface Context {
        dshBotConnectors: Connectors;
    }
}
