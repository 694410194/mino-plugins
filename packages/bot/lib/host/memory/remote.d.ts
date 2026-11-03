import type { Context } from '@deepseek-ai/cordis';
import { TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol';
import { type DshBotMemoryMethods, type MemoryRemoteListInput, type MemoryRemotePatch, type MemoryRemoteSaveInput, type MemoryRemoteSearchInput } from '../../shared/remote-contract.js';
import type { MemoryRecord, MemorySaveResult } from '../../shared/schema.js';
import { type ForgetChoice, type ForgetSelection } from '../../shared/memory-forget.js';
import type { MemoryQuery, MemoryCreate, MemoryRevise, MemoryConfirm, MemoryResolve } from '../../shared/memory-management.js';
declare module '@deepseek-ai/cordis' {
    interface Context {
        dshBotMemory: DshBotMemoryRemote;
    }
}
/** The registry owns all storage and queue lifetimes; this service only adapts UI calls. */
export declare class DshBotMemoryRemote extends TypertRemoteService implements DshBotMemoryMethods {
    static inject: string[];
    constructor(ctx: Context);
    autoShareStatus(): Promise<{
        shadow: {
            mode: "offline-only";
            shadowEnabled: boolean;
            offlineOrganizeEnabled: boolean;
            opportunities: number;
            candidates: number;
            modelRequests: 0;
            notifications: 0;
            memoryWrites: 0;
        } | undefined;
        domainUsed: number;
        configured: boolean;
        effectiveAutoShare: false;
        reason: "unverifiable-user-input";
        botDaily: number;
        domainDaily: number;
        timeZone: string;
        revision: number;
    }>;
    setAutoShare(input: {
        enabled: boolean;
        expectedRevision: number;
    }): Promise<{
        shadow: {
            mode: "offline-only";
            shadowEnabled: boolean;
            offlineOrganizeEnabled: boolean;
            opportunities: number;
            candidates: number;
            modelRequests: 0;
            notifications: 0;
            memoryWrites: 0;
        } | undefined;
        domainUsed: number;
        configured: boolean;
        effectiveAutoShare: false;
        reason: "unverifiable-user-input";
        botDaily: number;
        domainDaily: number;
        timeZone: string;
        revision: number;
    }>;
    query(input: MemoryQuery): Promise<{
        rows: {
            deletedBot: boolean;
            state: "proposed" | "active" | "disputed" | "superseded" | "expired" | "rejected" | "forgotten";
            version: import("../../shared/memory-v2.js").MemoryVersion;
            payload: import("../../shared/memory-v2.js").MemoryPayload;
        }[];
        next?: string | undefined;
        revision: number;
        total: number;
    }>;
    createManaged(input: MemoryCreate): Promise<`${string}-${string}-${string}-${string}-${string}`>;
    revise(input: MemoryRevise): Promise<void>;
    confirm(input: MemoryConfirm): Promise<string>;
    resolve(input: MemoryResolve): Promise<void>;
    previewContribution(id: string): Promise<{
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
    private forgetting;
    previewForget(botId: string, selection: ForgetSelection): Promise<{
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
    chooseForget(choice: ForgetChoice): Promise<{
        id: string;
        stopped: boolean;
        strong: boolean;
        phase: "intent" | "stopped" | "cleaning" | "blocked" | "verified";
        reasons: ("unavailable" | "copies" | "history" | "system-head" | "inbox" | "root-instructions" | "raw-read-policy" | "inventory" | "flush")[];
        sessions: number;
    }>;
    cleanupStatuses(): Promise<{
        id: string;
        stopped: boolean;
        strong: boolean;
        phase: "intent" | "stopped" | "cleaning" | "blocked" | "verified";
        reasons: ("unavailable" | "copies" | "history" | "system-head" | "inbox" | "root-instructions" | "raw-read-policy" | "inventory" | "flush")[];
        sessions: number;
    }[]>;
    retryCleanup(id: string): Promise<{
        id: string;
        stopped: boolean;
        strong: boolean;
        phase: "intent" | "stopped" | "cleaning" | "blocked" | "verified";
        reasons: ("unavailable" | "copies" | "history" | "system-head" | "inbox" | "root-instructions" | "raw-read-policy" | "inventory" | "flush")[];
        sessions: number;
    }>;
    rootInstructions(): Promise<{
        root: string;
        files: {
            path: string;
            state: "unknown" | "present" | "absent";
        }[];
    }>;
    list(botId: string, options: MemoryRemoteListInput): Promise<MemoryRecord[]>;
    search(botId: string, input: MemoryRemoteSearchInput): Promise<MemoryRecord[]>;
    save(botId: string, input: MemoryRemoteSaveInput): Promise<MemorySaveResult>;
    update(botId: string, id: string, patch: MemoryRemotePatch): Promise<MemoryRecord>;
    remove(botId: string, id: string): Promise<void>;
    quarantineCount(): Promise<number>;
    count(botId: string): Promise<number>;
}
