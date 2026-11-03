import type { Agent } from '@deepseek-ai/dsh-agent';
import { z } from 'zod';
import { type BotKey } from '../../shared/integrations.js';
import { type MemoryRecord } from '../../shared/schema.js';
export declare const copyRowSchema: z.ZodObject<{
    receipt: z.ZodObject<{
        id: z.ZodString;
        bot: z.ZodObject<{
            botId: z.ZodString;
            botCreatedAt: z.ZodNumber;
        }, z.core.$strict>;
        sourceDigest: z.ZodString;
        targetFileIdentity: z.ZodString;
        previousFileIdentity: z.ZodString;
        bindingRevision: z.ZodNumber;
        phase: z.ZodEnum<{
            failed: "failed";
            verified: "verified";
            preview: "preview";
            staging: "staging";
            committed: "committed";
            "rolled-back": "rolled-back";
        }>;
        records: z.ZodArray<z.ZodObject<{
            memoryId: z.ZodString;
            digest: z.ZodString;
            targetEntityName: z.ZodString;
            status: z.ZodEnum<{
                pending: "pending";
                verified: "verified";
                written: "written";
            }>;
        }, z.core.$strict>>;
        startedAt: z.ZodNumber;
        verifiedAt: z.ZodOptional<z.ZodNumber>;
        committedAt: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strict>;
    snapshot: z.ZodArray<z.ZodPipe<z.ZodObject<{
        kind: z.ZodEnum<{
            profile: "profile";
            preference: "preference";
            fact: "fact";
            note: "note";
        }>;
        content: z.ZodString;
        tags: z.ZodArray<z.ZodString>;
        pinned: z.ZodBoolean;
        source: z.ZodOptional<z.ZodObject<{
            sessionId: z.ZodOptional<z.ZodString>;
            at: z.ZodNumber;
            by: z.ZodEnum<{
                model: "model";
                user: "user";
            }>;
        }, z.core.$strict>>;
        id: z.ZodString;
        botId: z.ZodString;
        createdAt: z.ZodNumber;
        updatedAt: z.ZodNumber;
    }, z.core.$strict>, z.ZodTransform<{
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
    }, {
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
    }>>>;
    previousMode: z.ZodEnum<{
        internal: "internal";
        "internal+reference-graph": "internal+reference-graph";
    }>;
    flowEpoch: z.ZodOptional<z.ZodNumber>;
}, z.core.$strict>;
export declare const referenceMemoryDomain: {
    name: string;
    version: number;
    tables: {
        bindings: import("@deepseek-ai/dsh-storage-domain").DomainTableSpec<string, {
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
        }>;
        copies: import("@deepseek-ai/dsh-storage-domain").DomainTableSpec<string, {
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
        }>;
    };
};
export type Child = {
    await(): Promise<void>;
    dispose(): Promise<void>;
};
export interface Live {
    bot: BotKey;
    agent: Agent;
    identity: string;
    child?: Child;
    accepting: boolean;
    copying: boolean;
    tail: Promise<unknown>;
    allowed: Set<string>;
    off: Array<() => void>;
    closing?: Promise<void>;
}
export declare const writers: Map<string, Live>;
export declare const keyOf: (bot: BotKey) => string;
export declare const canonicalRows: (rows: MemoryRecord[]) => {
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
export declare const sourceDigest: (rows: MemoryRecord[]) => string;
export declare const entityName: (bot: BotKey, id: string) => string;
export declare function memoryEntity(bot: BotKey, record: MemoryRecord): {
    name: string;
    entityType: string;
    observations: string[];
};
export declare function verifyMemoryEntity(bot: BotKey, record: MemoryRecord, value: unknown): void;
