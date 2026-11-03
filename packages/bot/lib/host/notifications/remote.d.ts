import type { Context } from '@deepseek-ai/cordis';
import { TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol';
import type { BotKey } from '../../shared/identity.js';
import type { NotifyInput } from '../../shared/notifications.js';
import type { Notifications } from './service.js';
export declare class NotificationRemote extends TypertRemoteService {
    private notifications;
    constructor(ctx: Context, notifications: Notifications);
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
    testNotification(owner: BotKey, input: NotifyInput, expectedScope: string, confirmed: true): Promise<{
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
}
declare module '@deepseek-ai/cordis' {
    interface Context {
        dshBotNotificationRemote: NotificationRemote;
    }
}
