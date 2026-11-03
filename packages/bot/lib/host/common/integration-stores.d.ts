import type { Context } from '@deepseek-ai/cordis';
import type { Domain } from '@deepseek-ai/dsh-storage-domain';
export declare const connectorDomain: {
    name: string;
    version: number;
    tables: {
        definitions: import("@deepseek-ai/dsh-storage-domain").DomainTableSpec<string, {
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
        assignments: import("@deepseek-ai/dsh-storage-domain").DomainTableSpec<string, {
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
        legacy_imports: import("@deepseek-ai/dsh-storage-domain").DomainTableSpec<string, {
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
    };
};
export declare const notificationDomain: {
    name: string;
    version: number;
    tables: {
        read_state: import("@deepseek-ai/dsh-storage-domain").DomainTableSpec<string, {
            id: string;
            owner: {
                botId: string;
                botCreatedAt: number;
            };
            revision: number;
            createdAt: number;
            updatedAt: number;
            schemaVersion: 1;
        }>;
        policies: import("@deepseek-ai/dsh-storage-domain").DomainTableSpec<string, {
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
        }>;
        intents: import("@deepseek-ai/dsh-storage-domain").DomainTableSpec<string, {
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
        }>;
        receipts: import("@deepseek-ai/dsh-storage-domain").DomainTableSpec<string, {
            revision: number;
            createdAt: number;
            updatedAt: number;
            schemaVersion: 1;
            id: string;
            intentId: string;
            attemptId: string;
            channel: "in-app" | "im";
            state: "unknown" | "failed" | "cancelled" | "recorded" | "waiting_approval" | "suppressed" | "sending" | "accepted";
            acceptedAt?: number | undefined;
            platformMessageId?: string | undefined;
        }>;
    };
};
export interface IntegrationStores {
    connectors: Domain<typeof connectorDomain>;
    notifications: Domain<typeof notificationDomain>;
    close(): Promise<void>;
}
export declare function openIntegrationStores(ctx: Context): Promise<IntegrationStores>;
