import { z } from 'zod';
export declare const NOTIFICATION_TEXT_MAX_BYTES = 8192;
export declare const policyInputSchema: z.ZodObject<{
    id: z.ZodString;
    owner: z.ZodObject<{
        botId: z.ZodString;
        botCreatedAt: z.ZodNumber;
    }, z.core.$strict>;
    channel: z.ZodEnum<{
        "in-app": "in-app";
        im: "im";
    }>;
    targetRef: z.ZodOptional<z.ZodString>;
    enabled: z.ZodBoolean;
    timezone: z.ZodString;
    quietHours: z.ZodOptional<z.ZodObject<{
        start: z.ZodString;
        end: z.ZodString;
    }, z.core.$strict>>;
    dailyLimit: z.ZodNumber;
    cooldownSec: z.ZodNumber;
    authorization: z.ZodObject<{
        mode: z.ZodEnum<{
            ask: "ask";
            preapproved: "preapproved";
        }>;
    }, z.core.$strict>;
}, z.core.$strict>;
export declare const policySchema: z.ZodObject<{
    id: z.ZodString;
    owner: z.ZodObject<{
        botId: z.ZodString;
        botCreatedAt: z.ZodNumber;
    }, z.core.$strict>;
    channel: z.ZodEnum<{
        "in-app": "in-app";
        im: "im";
    }>;
    targetRef: z.ZodOptional<z.ZodString>;
    enabled: z.ZodBoolean;
    timezone: z.ZodString;
    quietHours: z.ZodOptional<z.ZodObject<{
        start: z.ZodString;
        end: z.ZodString;
    }, z.core.$strict>>;
    dailyLimit: z.ZodNumber;
    cooldownSec: z.ZodNumber;
    authorization: z.ZodObject<{
        mode: z.ZodEnum<{
            ask: "ask";
            preapproved: "preapproved";
        }>;
    }, z.core.$strict>;
    scopeDigest: z.ZodString;
    targetDigest: z.ZodString;
    approvedAt: z.ZodOptional<z.ZodNumber>;
    revision: z.ZodNumber;
    createdAt: z.ZodNumber;
    updatedAt: z.ZodNumber;
    schemaVersion: z.ZodLiteral<1>;
}, z.core.$strict>;
export type NotificationPolicy = z.output<typeof policySchema>;
export declare const notifyInputSchema: z.ZodObject<{
    operationId: z.ZodString;
    policyId: z.ZodString;
    text: z.ZodString;
    relatedId: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export type NotifyInput = z.output<typeof notifyInputSchema>;
export declare const notificationState: z.ZodEnum<{
    unknown: "unknown";
    failed: "failed";
    cancelled: "cancelled";
    recorded: "recorded";
    waiting_approval: "waiting_approval";
    suppressed: "suppressed";
    sending: "sending";
    accepted: "accepted";
}>;
export declare const notificationSchema: z.ZodObject<{
    revision: z.ZodNumber;
    createdAt: z.ZodNumber;
    updatedAt: z.ZodNumber;
    schemaVersion: z.ZodLiteral<1>;
    id: z.ZodString;
    operationId: z.ZodString;
    flowId: z.ZodOptional<z.ZodUUID>;
    owner: z.ZodObject<{
        botId: z.ZodString;
        botCreatedAt: z.ZodNumber;
    }, z.core.$strict>;
    policyId: z.ZodString;
    policyRevision: z.ZodNumber;
    targetDigest: z.ZodString;
    scopeDigest: z.ZodString;
    text: z.ZodString;
    source: z.ZodObject<{
        kind: z.ZodEnum<{
            tool: "tool";
            schedule: "schedule";
            "manual-run": "manual-run";
            "group-turn": "group-turn";
        }>;
        id: z.ZodString;
        sessionId: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>;
    state: z.ZodEnum<{
        unknown: "unknown";
        failed: "failed";
        cancelled: "cancelled";
        recorded: "recorded";
        waiting_approval: "waiting_approval";
        suppressed: "suppressed";
        sending: "sending";
        accepted: "accepted";
    }>;
    reasonCode: z.ZodOptional<z.ZodEnum<{
        unsupported: "unsupported";
        "approval-denied": "approval-denied";
        "recovery-needed": "recovery-needed";
        disabled: "disabled";
        stopping: "stopping";
        "quiet-hours": "quiet-hours";
        "daily-limit": "daily-limit";
        cooldown: "cooldown";
        changed: "changed";
        "transport-failed": "transport-failed";
    }>>;
    reservation: z.ZodOptional<z.ZodObject<{
        at: z.ZodNumber;
        day: z.ZodString;
    }, z.core.$strict>>;
    readAt: z.ZodOptional<z.ZodNumber>;
    attemptId: z.ZodOptional<z.ZodString>;
    platformMessageId: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export type NotificationRecord = z.output<typeof notificationSchema>;
export declare const receiptSchema: z.ZodObject<{
    revision: z.ZodNumber;
    createdAt: z.ZodNumber;
    updatedAt: z.ZodNumber;
    schemaVersion: z.ZodLiteral<1>;
    id: z.ZodString;
    intentId: z.ZodString;
    attemptId: z.ZodString;
    channel: z.ZodEnum<{
        "in-app": "in-app";
        im: "im";
    }>;
    state: z.ZodEnum<{
        unknown: "unknown";
        failed: "failed";
        cancelled: "cancelled";
        recorded: "recorded";
        waiting_approval: "waiting_approval";
        suppressed: "suppressed";
        sending: "sending";
        accepted: "accepted";
    }>;
    acceptedAt: z.ZodOptional<z.ZodNumber>;
    platformMessageId: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
