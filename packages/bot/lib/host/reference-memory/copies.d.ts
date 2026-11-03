import type { z } from 'zod';
import { type BotKey } from '../../shared/integrations.js';
import { type CopyReceipt } from '../../shared/reference-memory.js';
import { copyRowSchema } from './model.js';
import { ReferenceBackend } from './backend.js';
export declare class MemoryCopyWorkflow extends ReferenceBackend {
    protected rows(bot: BotKey): Promise<{
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
    }[]>;
    protected row(bot: BotKey, id: string): {
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
    };
    protected saveCopy(row: z.output<typeof copyRowSchema>): Promise<{
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
    }>;
    protected preview(bot: BotKey): Promise<CopyReceipt>;
    protected stage(bot: BotKey, id: string): Promise<CopyReceipt>;
    protected commit(bot: BotKey, id: string): Promise<CopyReceipt>;
    protected rollback(bot: BotKey, id: string): Promise<CopyReceipt>;
}
