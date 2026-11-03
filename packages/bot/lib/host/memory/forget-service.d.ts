import type { Context } from '@deepseek-ai/cordis';
import type { ForgetSelection, ForgetChoice } from '../../shared/memory-forget.js';
import type { DshBotRegistry } from '../registry.js';
import { ForgetPreviews } from './forget-preview.js';
import { ForgetRunner } from './forget-runner.js';
/** Host-owned conservative closure. No user/model-supplied session IDs or verified flags. */
export declare class MemoryForgetting {
    private readonly ctx;
    private readonly registry;
    readonly previews: ForgetPreviews;
    readonly runner: ForgetRunner;
    readonly root: string;
    constructor(ctx: Context, registry: DshBotRegistry);
    preview(botId: string, selection: ForgetSelection): Promise<{
        previewRevision: string;
        memoryId: string;
        mode: "version" | "related";
        revision: number;
        targets: string[];
        sessionIds: string[];
        versions: number;
        historyNodes: number;
        summaries: number;
        copies: number;
        pendingMessages: number;
        conservative: boolean;
        rootInstructions: boolean;
        affectedBots?: number | undefined;
        derivatives?: number | undefined;
    }>;
    choose(choice: ForgetChoice): Promise<{
        id: string;
        stopped: boolean;
        strong: boolean;
        phase: "intent" | "stopped" | "cleaning" | "blocked" | "verified";
        reasons: ("unavailable" | "copies" | "history" | "system-head" | "inbox" | "root-instructions" | "raw-read-policy" | "inventory" | "flush")[];
        sessions: number;
    }>;
    previewShared(selection: ForgetSelection): Promise<{
        previewRevision: string;
        memoryId: string;
        mode: "version" | "related";
        revision: number;
        targets: string[];
        sessionIds: string[];
        versions: number;
        historyNodes: number;
        summaries: number;
        copies: number;
        pendingMessages: number;
        conservative: boolean;
        rootInstructions: boolean;
        affectedBots?: number | undefined;
        derivatives?: number | undefined;
    }>;
    roots(): Promise<{
        root: string;
        files: {
            path: string;
            state: "unknown" | "present" | "absent";
        }[];
    }>;
    private inventory;
    private verify;
}
