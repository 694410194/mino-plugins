import type { Context } from '@deepseek-ai/cordis';
import { TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol';
import { type BotKey } from '../../shared/integrations.js';
import type { Connectors } from '../connectors/service.js';
import type { Notifications } from '../notifications/service.js';
export declare const INTEGRATIONS_HOST: {
    package: string;
    face: "host";
    schemas: never[];
    readonly invocations: readonly import("@deepseek-ai/dsh-typert-protocol").InvocationDescriptor[];
    model: {
        services: never[];
        events: never[];
        objects: never[];
    };
};
export declare class ConnectorRemote extends TypertRemoteService {
    private connectors;
    private notifications;
    constructor(ctx: Context, connectors: Connectors, notifications: Notifications);
    catalog(): Promise<{
        definitions: {
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
        assignments: {
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
        }[];
        runtime: {
            assignmentId: string;
            sessionId: string;
            desiredRevision: number;
            state: "pending" | "unavailable" | "ready" | "disabled" | "connecting";
            toolCount: number;
            appliedRevision?: number | undefined;
            reasonCode?: "revoked" | "saved" | "busy" | "missing-credential" | "initialization-failed" | "namespace-conflict" | "stopping" | "agent-closed" | undefined;
        }[];
        policies: {
            id: string;
            owner: {
                botId: string;
                botCreatedAt: number;
            };
            channel: "in-app" | "im";
            enabled: boolean;
            timezone: string;
            dailyLimit: number;
            cooldownSec: number;
            authorization: {
                mode: "ask" | "preapproved";
            };
            scopeDigest: string;
            targetDigest: string;
            revision: number;
            createdAt: number;
            updatedAt: number;
            schemaVersion: 1;
            targetRef?: string | undefined;
            quietHours?: {
                start: string;
                end: string;
            } | undefined;
            approvedAt?: number | undefined;
        }[];
        notifications: {
            revision: number;
            createdAt: number;
            updatedAt: number;
            schemaVersion: 1;
            id: string;
            operationId: string;
            owner: {
                botId: string;
                botCreatedAt: number;
            };
            policyId: string;
            policyRevision: number;
            targetDigest: string;
            scopeDigest: string;
            text: string;
            source: {
                kind: "tool" | "schedule" | "manual-run" | "group-turn";
                id: string;
                sessionId?: string | undefined;
            };
            state: "unknown" | "failed" | "cancelled" | "recorded" | "waiting_approval" | "suppressed" | "sending" | "accepted";
            flowId?: string | undefined;
            reasonCode?: "unsupported" | "approval-denied" | "recovery-needed" | "disabled" | "stopping" | "quiet-hours" | "daily-limit" | "cooldown" | "changed" | "transport-failed" | undefined;
            reservation?: {
                at: number;
                day: string;
            } | undefined;
            readAt?: number | undefined;
            attemptId?: string | undefined;
            platformMessageId?: string | undefined;
        }[];
        unread: number;
        imSupported: boolean;
        desktopSupported: false;
        defaults: {
            dailyLimit: number;
            cooldownSec: number;
        };
    }>;
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
    applyIdle(bot: BotKey): Promise<{
        toolCount: number;
        assignmentId: string;
        sessionId: string;
        desiredRevision: number;
        state: "pending" | "unavailable" | "ready" | "disabled" | "connecting";
        appliedRevision?: number | undefined;
        reasonCode?: "revoked" | "saved" | "busy" | "missing-credential" | "initialization-failed" | "namespace-conflict" | "stopping" | "agent-closed" | undefined;
    }[]>;
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
}
export { NotificationRemote } from '../notifications/remote.js';
declare module '@deepseek-ai/cordis' {
    interface Context {
        dshBotP34: ConnectorRemote;
    }
}
