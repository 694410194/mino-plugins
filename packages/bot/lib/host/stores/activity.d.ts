import type { ActivityListOptions, ActivityListResult, ActivityRecord, ActivitySession } from '../../shared/activity.js';
import { type BotDomain } from './domain.js';
export interface ActivityStoreOptions {
    activityMaxSessionsPerBot?: number;
    activityMaxSessionsTotal?: number;
}
export interface ActivityRecordInput {
    sessionId: string;
    botId: string;
    role: 'user' | 'assistant';
    text: string;
    at: number;
    title?: string;
    /** First actual human message (or screened summary) from a public projection,
     * never a later message inferred from a row that lacks this metadata. */
    firstUserText?: string;
    seq?: number;
    /** Guards queued events from an Agent belonging to a deleted Bot incarnation. */
    expectedBotCreatedAt?: number;
}
/** Stores only completed-message summaries. The event adapter owns completion
 * coalescing; all writes share the Bot/Memory domain queue and delete boundary.
 */
export declare class ActivityStore {
    private readonly domain;
    private readonly perBot;
    private readonly total;
    constructor(domain: BotDomain, options?: ActivityStoreOptions);
    list(options?: ActivityListOptions): ActivityListResult;
    record(input: ActivityRecordInput): Promise<ActivityRecord | undefined>;
    markRead(sessionId: string): Promise<ActivitySession>;
    /** Apply changed caps after reopening, without rewriting retained summaries. */
    prune(): Promise<void>;
    private pruneRows;
}
