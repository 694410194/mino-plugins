import type { Context } from '@deepseek-ai/cordis';
import { TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol';
import type { WorkspaceMethods, ReferenceMemoryMethods } from '../../shared/workspace-contract.js';
import type { WorkspaceManagement } from './service.js';
import type { ReferenceMemory } from '../reference-memory/service.js';
export declare const WORKSPACE_HOST: {
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
export declare class WorkspaceRemote extends TypertRemoteService {
    private management;
    constructor(ctx: Context, management: WorkspaceManagement | undefined);
    request(input: Parameters<WorkspaceMethods['request']>[0]): Promise<{
        kind: "summary";
        summary: {
            available: boolean;
            sampleSize: number;
            accepted: number;
            completed: number;
            failed: number;
            unknown: number;
        };
    } | {
        kind: "export";
        document: {
            format: "dsh-bot-export";
            version: 1;
            bot: {
                name: string;
                description: string;
                persona: {
                    prefix: string;
                    suffix?: string | undefined;
                    complete?: boolean | undefined;
                };
                template: "standard" | "minimal";
                tools: {
                    deny: string[];
                };
                memory: {
                    enabled: boolean;
                    injectLimit: number;
                };
                avatar?: string | undefined;
                avatarColor?: "--dsw-alias-state-business-primary" | "--dsw-alias-state-success-primary" | "--dsw-alias-state-warn-label" | "--dsw-alias-state-error-primary" | "teal" | "cyan" | "indigo" | "purple" | "rose" | "orange" | "olive" | "slate" | undefined;
                avatarVariant?: "classic" | "glasses" | "spout" | "baby" | "hat" | "sleeping" | "auto" | undefined;
                model?: {
                    provider: string;
                    model: string;
                    reasoningEffort?: string | undefined;
                } | undefined;
                order?: number | undefined;
            };
            skillsManifest: {
                path: string;
                content: string;
            }[];
            connectorTemplates: {
                connectorId: string;
                enabled: false;
            }[];
            channelTemplates: {
                kind: "feishu" | "telegram" | "slack" | "email" | "desktop";
                enabled: false;
            }[];
            memoryRecords: {
                kind: "profile" | "preference" | "fact" | "note";
                content: string;
                tags: string[];
                pinned: boolean;
            }[];
        };
    } | {
        kind: "preview";
        preview: {
            id: string;
            newId: string;
            digest: string;
            files: string[];
            memories: number;
            connectorRefs: string[];
            missingConnectorRefs: string[];
            conflict: boolean;
            phase: "failed" | "preview" | "committed" | "applying";
            scope: "bot" | "memories";
            createdBot?: {
                botId: string;
                botCreatedAt: number;
            } | undefined;
            targetBot?: {
                botId: string;
                botCreatedAt: number;
            } | undefined;
            targetDigest?: string | undefined;
        };
    }>;
}
export declare class ReferenceMemoryRemote extends TypertRemoteService {
    private memory;
    constructor(ctx: Context, memory: ReferenceMemory | undefined);
    request(input: Parameters<ReferenceMemoryMethods['request']>[0]): Promise<{
        status: {
            bot: {
                botId: string;
                botCreatedAt: number;
            };
            state: "pending" | "unavailable" | "ready" | "internal";
            toolCount: number;
            writer: boolean;
            copies: {
                id: string;
                bot: {
                    botId: string;
                    botCreatedAt: number;
                };
                sourceDigest: string;
                targetFileIdentity: string;
                previousFileIdentity: string;
                bindingRevision: number;
                phase: "failed" | "verified" | "preview" | "staging" | "committed" | "rolled-back";
                records: {
                    memoryId: string;
                    digest: string;
                    targetEntityName: string;
                    status: "pending" | "verified" | "written";
                }[];
                startedAt: number;
                verifiedAt?: number | undefined;
                committedAt?: number | undefined;
            }[];
            binding?: {
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
            reason?: "unsupported" | "busy" | "initialization-failed" | "stopping" | "main-only" | "writer-conflict" | "invalid-file" | "copy-in-progress" | undefined;
        };
        graph?: {
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
        } | undefined;
        copy?: {
            id: string;
            bot: {
                botId: string;
                botCreatedAt: number;
            };
            sourceDigest: string;
            targetFileIdentity: string;
            previousFileIdentity: string;
            bindingRevision: number;
            phase: "failed" | "verified" | "preview" | "staging" | "committed" | "rolled-back";
            records: {
                memoryId: string;
                digest: string;
                targetEntityName: string;
                status: "pending" | "verified" | "written";
            }[];
            startedAt: number;
            verifiedAt?: number | undefined;
            committedAt?: number | undefined;
        } | undefined;
    }>;
}
declare module '@deepseek-ai/cordis' {
    interface Context {
        dshBotWorkspaceRemote: WorkspaceRemote;
        dshBotReferenceMemoryRemote: ReferenceMemoryRemote;
    }
}
