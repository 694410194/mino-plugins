import type { Context } from '@deepseek-ai/cordis';
import type { BotKey, NotificationRecord, NotifyInput } from '../../shared/integrations.js';
import type { DshBotRegistry } from '../registry.js';
import { Serial } from '../common/operations.js';
import type { IntegrationStores } from '../common/integration-stores.js';
export interface NotificationPort {
    /** Safe display identity. Adapter must recheck this digest immediately before sending. */
    describe(targetRef: string): Promise<{
        targetDigest: string;
        label: string;
    }>;
    send(request: {
        targetRef: string;
        targetDigest: string;
        text: string;
        attemptId: string;
        signal: AbortSignal;
    }): Promise<{
        state: 'accepted';
        platformMessageId?: string;
    } | {
        state: 'failed' | 'unknown';
    }>;
}
export { localTime, quietAt } from './time.js';
export interface NotificationOptions {
    dailyLimit: number;
    cooldownSec: number;
    retentionDays: number;
    maxRecords: number;
    sendTimeoutMs: number;
}
export declare class Notifications {
    private ctx;
    private stores;
    private registry;
    readonly options: NotificationOptions;
    private changed;
    private port?;
    private now;
    readonly queue: Serial;
    private stopping;
    private lifetime;
    private portLifetime;
    private sends;
    constructor(ctx: Context, stores: IntegrationStores, registry: DshBotRegistry, options: NotificationOptions, changed: () => void, port?: NotificationPort | undefined, now?: () => number);
    attachPort(port: NotificationPort, owner?: Context): () => void;
    supported(): boolean;
    policies(): {
        id: string;
        owner: {
            botId: string;
            botCreatedAt: number;
        };
        channel: "in-app" | "im";
        enabled: boolean;
        timezone: string;
        dailyLimit: number;
        cooldownSec: number;
        authorization: {
            mode: "ask" | "preapproved";
        };
        scopeDigest: string;
        targetDigest: string;
        revision: number;
        createdAt: number;
        updatedAt: number;
        schemaVersion: 1;
        targetRef?: string | undefined;
        quietHours?: {
            start: string;
            end: string;
        } | undefined;
        approvedAt?: number | undefined;
    }[];
    list(): {
        revision: number;
        createdAt: number;
        updatedAt: number;
        schemaVersion: 1;
        id: string;
        operationId: string;
        owner: {
            botId: string;
            botCreatedAt: number;
        };
        policyId: string;
        policyRevision: number;
        targetDigest: string;
        scopeDigest: string;
        text: string;
        source: {
            kind: "tool" | "schedule" | "manual-run" | "group-turn";
            id: string;
            sessionId?: string | undefined;
        };
        state: "unknown" | "failed" | "cancelled" | "recorded" | "waiting_approval" | "suppressed" | "sending" | "accepted";
        flowId?: string | undefined;
        reasonCode?: "unsupported" | "approval-denied" | "recovery-needed" | "disabled" | "stopping" | "quiet-hours" | "daily-limit" | "cooldown" | "changed" | "transport-failed" | undefined;
        reservation?: {
            at: number;
            day: string;
        } | undefined;
        readAt?: number | undefined;
        attemptId?: string | undefined;
        platformMessageId?: string | undefined;
    }[];
    policy(id: string): {
        id: string;
        owner: {
            botId: string;
            botCreatedAt: number;
        };
        channel: "in-app" | "im";
        enabled: boolean;
        timezone: string;
        dailyLimit: number;
        cooldownSec: number;
        authorization: {
            mode: "ask" | "preapproved";
        };
        scopeDigest: string;
        targetDigest: string;
        revision: number;
        createdAt: number;
        updatedAt: number;
        schemaVersion: 1;
        targetRef?: string | undefined;
        quietHours?: {
            start: string;
            end: string;
        } | undefined;
        approvedAt?: number | undefined;
    };
    private assertBot;
    recover(): Promise<void>;
    savePolicy(input: unknown, expected: number, confirmed: boolean): Promise<{
        id: string;
        owner: {
            botId: string;
            botCreatedAt: number;
        };
        channel: "in-app" | "im";
        enabled: boolean;
        timezone: string;
        dailyLimit: number;
        cooldownSec: number;
        authorization: {
            mode: "ask" | "preapproved";
        };
        scopeDigest: string;
        targetDigest: string;
        revision: number;
        createdAt: number;
        updatedAt: number;
        schemaVersion: 1;
        targetRef?: string | undefined;
        quietHours?: {
            start: string;
            end: string;
        } | undefined;
        approvedAt?: number | undefined;
    }>;
    record(owner: BotKey, input: NotifyInput, source: NotificationRecord['source']): Promise<{
        revision: number;
        createdAt: number;
        updatedAt: number;
        schemaVersion: 1;
        id: string;
        operationId: string;
        owner: {
            botId: string;
            botCreatedAt: number;
        };
        policyId: string;
        policyRevision: number;
        targetDigest: string;
        scopeDigest: string;
        text: string;
        source: {
            kind: "tool" | "schedule" | "manual-run" | "group-turn";
            id: string;
            sessionId?: string | undefined;
        };
        state: "unknown" | "failed" | "cancelled" | "recorded" | "waiting_approval" | "suppressed" | "sending" | "accepted";
        flowId?: string | undefined;
        reasonCode?: "unsupported" | "approval-denied" | "recovery-needed" | "disabled" | "stopping" | "quiet-hours" | "daily-limit" | "cooldown" | "changed" | "transport-failed" | undefined;
        reservation?: {
            at: number;
            day: string;
        } | undefined;
        readAt?: number | undefined;
        attemptId?: string | undefined;
        platformMessageId?: string | undefined;
    }>;
    waiting(id: string): Promise<{
        revision: number;
        createdAt: number;
        updatedAt: number;
        schemaVersion: 1;
        id: string;
        operationId: string;
        owner: {
            botId: string;
            botCreatedAt: number;
        };
        policyId: string;
        policyRevision: number;
        targetDigest: string;
        scopeDigest: string;
        text: string;
        source: {
            kind: "tool" | "schedule" | "manual-run" | "group-turn";
            id: string;
            sessionId?: string | undefined;
        };
        state: "unknown" | "failed" | "cancelled" | "recorded" | "waiting_approval" | "suppressed" | "sending" | "accepted";
        flowId?: string | undefined;
        reasonCode?: "unsupported" | "approval-denied" | "recovery-needed" | "disabled" | "stopping" | "quiet-hours" | "daily-limit" | "cooldown" | "changed" | "transport-failed" | undefined;
        reservation?: {
            at: number;
            day: string;
        } | undefined;
        readAt?: number | undefined;
        attemptId?: string | undefined;
        platformMessageId?: string | undefined;
    }>;
    get(id: string): {
        revision: number;
        createdAt: number;
        updatedAt: number;
        schemaVersion: 1;
        id: string;
        operationId: string;
        owner: {
            botId: string;
            botCreatedAt: number;
        };
        policyId: string;
        policyRevision: number;
        targetDigest: string;
        scopeDigest: string;
        text: string;
        source: {
            kind: "tool" | "schedule" | "manual-run" | "group-turn";
            id: string;
            sessionId?: string | undefined;
        };
        state: "unknown" | "failed" | "cancelled" | "recorded" | "waiting_approval" | "suppressed" | "sending" | "accepted";
        flowId?: string | undefined;
        reasonCode?: "unsupported" | "approval-denied" | "recovery-needed" | "disabled" | "stopping" | "quiet-hours" | "daily-limit" | "cooldown" | "changed" | "transport-failed" | undefined;
        reservation?: {
            at: number;
            day: string;
        } | undefined;
        readAt?: number | undefined;
        attemptId?: string | undefined;
        platformMessageId?: string | undefined;
    };
    reject(id: string, reasonCode?: 'approval-denied' | 'changed'): Promise<{
        revision: number;
        createdAt: number;
        updatedAt: number;
        schemaVersion: 1;
        id: string;
        operationId: string;
        owner: {
            botId: string;
            botCreatedAt: number;
        };
        policyId: string;
        policyRevision: number;
        targetDigest: string;
        scopeDigest: string;
        text: string;
        source: {
            kind: "tool" | "schedule" | "manual-run" | "group-turn";
            id: string;
            sessionId?: string | undefined;
        };
        state: "unknown" | "failed" | "cancelled" | "recorded" | "waiting_approval" | "suppressed" | "sending" | "accepted";
        flowId?: string | undefined;
        reasonCode?: "unsupported" | "approval-denied" | "recovery-needed" | "disabled" | "stopping" | "quiet-hours" | "daily-limit" | "cooldown" | "changed" | "transport-failed" | undefined;
        reservation?: {
            at: number;
            day: string;
        } | undefined;
        readAt?: number | undefined;
        attemptId?: string | undefined;
        platformMessageId?: string | undefined;
    }>;
    markRead(id: string, expected: number): Promise<{
        revision: number;
        createdAt: number;
        updatedAt: number;
        schemaVersion: 1;
        id: string;
        operationId: string;
        owner: {
            botId: string;
            botCreatedAt: number;
        };
        policyId: string;
        policyRevision: number;
        targetDigest: string;
        scopeDigest: string;
        text: string;
        source: {
            kind: "tool" | "schedule" | "manual-run" | "group-turn";
            id: string;
            sessionId?: string | undefined;
        };
        state: "unknown" | "failed" | "cancelled" | "recorded" | "waiting_approval" | "suppressed" | "sending" | "accepted";
        flowId?: string | undefined;
        reasonCode?: "unsupported" | "approval-denied" | "recovery-needed" | "disabled" | "stopping" | "quiet-hours" | "daily-limit" | "cooldown" | "changed" | "transport-failed" | undefined;
        reservation?: {
            at: number;
            day: string;
        } | undefined;
        readAt?: number | undefined;
        attemptId?: string | undefined;
        platformMessageId?: string | undefined;
    }>;
    private put;
    deliver(id: string, approvedScope?: string, signal?: AbortSignal): Promise<{
        revision: number;
        createdAt: number;
        updatedAt: number;
        schemaVersion: 1;
        id: string;
        operationId: string;
        owner: {
            botId: string;
            botCreatedAt: number;
        };
        policyId: string;
        policyRevision: number;
        targetDigest: string;
        scopeDigest: string;
        text: string;
        source: {
            kind: "tool" | "schedule" | "manual-run" | "group-turn";
            id: string;
            sessionId?: string | undefined;
        };
        state: "unknown" | "failed" | "cancelled" | "recorded" | "waiting_approval" | "suppressed" | "sending" | "accepted";
        flowId?: string | undefined;
        reasonCode?: "unsupported" | "approval-denied" | "recovery-needed" | "disabled" | "stopping" | "quiet-hours" | "daily-limit" | "cooldown" | "changed" | "transport-failed" | undefined;
        reservation?: {
            at: number;
            day: string;
        } | undefined;
        readAt?: number | undefined;
        attemptId?: string | undefined;
        platformMessageId?: string | undefined;
    }>;
    private prune;
    forgetCleanup(epoch: number): Promise<void>;
    close(): Promise<void>;
}
declare module '@deepseek-ai/cordis' {
    interface Context {
        dshBotNotifications: Notifications;
    }
}
