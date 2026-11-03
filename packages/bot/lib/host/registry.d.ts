import { type CreateForChatInput, type StartOnboardingInput } from '../shared/onboarding.js';
import type { Onboarding } from './onboarding/coordinator.js';
import { autoShareToggleSchema } from '../shared/data-flow.js';
import { MemoryManagement } from './memory/facade.js';
import { type CatalogInfo, type BotStatus, type BotChange, type BotHome, type BotsWorkspace, type DshBotMethods } from '../shared/remote-contract.js';
import { type BotCreateInput, type BotPatch, type BotRecord, type BotRemoveOptions } from '../shared/schema.js';
import { BotMemoryService } from './memory/service.js';
import type { ActivityListResult, ActivitySession } from '../shared/activity.js';
import type { ActivityStore } from './store.js';
import { RegistryMutations } from './registry/mutations.js';
import type { BotChanged } from './registry/types.js';
export type { BotChanged } from './registry/types.js';
export { Config } from './registry-config.js';
export { composeBotPreset } from './composer.js';
declare module '@deepseek-ai/cordis' {
    interface Context {
        dshBots: DshBotRegistry;
    }
    interface Events {
        'dsh-bot/changed'(change: BotChanged): void;
    }
}
export declare class DshBotRegistry extends RegistryMutations implements DshBotMethods {
    onboarding?: Onboarding;
    private readonly personaListeners;
    /** Synchronous generation snapshot for preset plugins. It deliberately bypasses
     * the Remote queue: register() activates rows while that queue is held. */
    directorySnapshot(): {
        id: string;
        name: string;
        description: string;
    }[];
    presetBot(botId: string): BotRecord;
    /** Host-only committed snapshot for a live Agent. Never observe an activating
     * candidate or adopt a deleted/recreated Bot with the same display ID. */
    personaSnapshot(botId: string, createdAt: number): BotRecord['persona'] | undefined;
    /** Synchronous final onboarding admission after its durable dispatch receipt. */
    onboardingSnapshot(botId: string, createdAt: number): BotRecord | undefined;
    /** Host-only synchronous commit notification; listeners cannot undo a commit. */
    subscribePersonaChanges(listener: () => void): () => void;
    /** Host-only, Bot-bound access to the existing domain; never open a second store.
     * Join the registry queue so unload drains accepted operations before closing it.
     */
    memoryFor(botId: string): BotMemoryService;
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
    shadow?: import('./shadow/planner.js').ShadowPlanner;
    setAutoShare(input: import('zod').z.input<typeof autoShareToggleSchema>): Promise<{
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
    manageMemory<T>(operation: (memory: MemoryManagement) => T | Promise<T>): Promise<T>;
    /** Management-only total includes orphaned legacy rows that have no current Bot panel. */
    memoryQuarantineCount(): Promise<number>;
    /** Host-only completion sink. The same queue drains before domain shutdown
     * and serializes accepted messages with Bot deletion and Remote reads. */
    recordActivity(input: Parameters<ActivityStore['record']>[0]): Promise<void>;
    listActivity(): Promise<ActivityListResult>;
    markActivityRead(sessionId: string): Promise<ActivitySession>;
    protected changed(id: string, action: BotChanged['action']): void;
    invalidate(): void;
    /** A fresh opening invalidation closes the subscribe/read race; each Client
     * keeps one coalesced pending revision, then refetches its ordinary catalogs.
     * Remote cancellation and Host effect disposal both wake a suspended pull.
     */
    watch(signal: AbortSignal): AsyncIterable<BotChange>;
    list(): Promise<BotRecord[]>;
    catalogInfo(): Promise<CatalogInfo>;
    status(): Promise<BotStatus[]>;
    openConversation(botId: string): Promise<import("./main-session.js").MainSession>;
    get(id: string): Promise<BotRecord>;
    ensureHome(botId: string): Promise<BotHome>;
    /** Runs only during initialization or in a registry queue slot. Do not call
     * the queued Remote from initialization: readiness and the writer would wait
     * on each other. The native registry independently serializes path creation.
     */
    protected ensureWorkspace(): Promise<BotsWorkspace>;
    ensureBotsWorkspace(): Promise<BotsWorkspace>;
    create(input: BotCreateInput): Promise<BotRecord>;
    createForChat(input: CreateForChatInput): Promise<BotRecord>;
    onboardingStatus(botId: string): Promise<{
        botId: string;
        state: "pending" | "unavailable" | "dispatching" | "submitted" | "completed" | "skipped" | "failed" | "uncertain";
        retryable: boolean;
        operationId?: string | undefined;
        sessionId?: string | undefined;
        reason?: string | undefined;
    }>;
    startOnboarding(input: StartOnboardingInput): Promise<{
        botId: string;
        state: "pending" | "unavailable" | "dispatching" | "submitted" | "completed" | "skipped" | "failed" | "uncertain";
        retryable: boolean;
        operationId?: string | undefined;
        sessionId?: string | undefined;
        reason?: string | undefined;
    }>;
    retryOnboarding(input: StartOnboardingInput): Promise<{
        botId: string;
        state: "pending" | "unavailable" | "dispatching" | "submitted" | "completed" | "skipped" | "failed" | "uncertain";
        retryable: boolean;
        operationId?: string | undefined;
        sessionId?: string | undefined;
        reason?: string | undefined;
    }>;
    update(id: string, patch: BotPatch): Promise<BotRecord>;
    duplicate(id: string, newId: string): Promise<BotRecord>;
    remove(id: string, options?: BotRemoveOptions): Promise<void>;
}
