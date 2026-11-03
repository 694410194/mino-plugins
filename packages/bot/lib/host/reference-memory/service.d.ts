import type { z } from 'zod';
import { graphRequestSchema } from '../../shared/reference-memory.js';
import { MemoryCopyWorkflow } from './copies.js';
export { referenceMemoryDomain, memoryEntity, verifyMemoryEntity } from './model.js';
export declare class ReferenceMemory extends MemoryCopyWorkflow {
    forgetInventory(): Promise<{
        count: number;
        stamp: {
            files: {
                path: string;
                size: number;
                mtime: number;
            }[];
            copies: [string, {
                receipt: {
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
                };
                snapshot: {
                    kind: "profile" | "preference" | "fact" | "note";
                    content: string;
                    tags: string[];
                    pinned: boolean;
                    id: string;
                    botId: string;
                    createdAt: number;
                    updatedAt: number;
                    source?: {
                        at: number;
                        by: "model" | "user";
                        sessionId?: string | undefined;
                    } | undefined;
                }[];
                previousMode: "internal" | "internal+reference-graph";
                flowEpoch?: number | undefined;
            }][];
            bindings: [string, {
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
            }][];
        };
    }>;
    /** All managed graph generations are in the conservative preview. User explicitly chooses their reset. */
    forgetCleanup(): Promise<void>;
    request(input: z.input<typeof graphRequestSchema>): Promise<{
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
        dshBotReferenceMemory: ReferenceMemory;
    }
}
