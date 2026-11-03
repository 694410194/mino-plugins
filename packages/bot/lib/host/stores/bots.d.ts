import type { BotCreateInput, BotPatch, BotRecord, BotRemoveOptions } from '../../shared/schema.js';
import { type BotDomain } from './domain.js';
export declare class BotStore {
    private readonly domain;
    constructor(domain: BotDomain);
    migrateMemoryTools(): Promise<void>;
    botsWorkspaceId(): string | undefined;
    saveBotsWorkspaceId(id: string): Promise<void>;
    /** A durable marker prevents reseeding after users deliberately remove every Bot.
     * A pending batch resumes missing examples after an interrupted initial write.
     */
    seedExamples(inputs: readonly BotCreateInput[]): Promise<void>;
    list(): BotRecord[];
    get(id: string): BotRecord;
    retiredCreation(operationId: string): boolean;
    avatarWarnings(): string[];
    create(input: BotCreateInput, createdAt?: number, onboarding?: BotRecord['onboarding']): Promise<BotRecord>;
    update(id: string, patch: BotPatch, expectedUpdatedAt?: number): Promise<BotRecord>;
    /** Delete dependent data first so failed cleanup leaves the Bot available for retry. */
    remove(id: string, options?: BotRemoveOptions): Promise<void>;
}
