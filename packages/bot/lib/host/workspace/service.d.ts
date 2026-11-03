import type { Context } from '@deepseek-ai/cordis';
import { type Domain } from '@deepseek-ai/dsh-storage-domain';
import { z } from 'zod';
import { workspaceRequestSchema } from '../../shared/workspace.js';
import type { DshBotRegistry } from '../registry.js';
import type { Connectors } from '../connectors/service.js';
export declare const workspaceDomain: {
    name: string;
    version: number;
    tables: {
        previews: import("@deepseek-ai/dsh-storage-domain").DomainTableSpec<string, {
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
        }>;
    };
};
export declare class WorkspaceManagement {
    private ctx;
    private registry;
    private connectors;
    private domain;
    private queue;
    private closing?;
    constructor(ctx: Context, registry: DshBotRegistry, connectors: Connectors, domain: Domain<typeof workspaceDomain>);
    private bot;
    private files;
    private conflict;
    request(input: z.input<typeof workspaceRequestSchema>): Promise<{
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
    close(): Promise<void>;
}
declare module '@deepseek-ai/cordis' {
    interface Context {
        dshBotWorkspace: WorkspaceManagement;
    }
}
