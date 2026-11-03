import { z } from 'zod';
export declare const automationIdSchema: z.ZodUUID;
export declare const automationTimeSchema: z.ZodNumber;
export declare const revisionSchema: z.ZodNumber;
export declare const timeZoneSchema: z.ZodString;
export declare const routineRuleSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    kind: z.ZodLiteral<"at">;
    at: z.ZodNumber;
}, z.core.$strict>, z.ZodObject<{
    kind: z.ZodLiteral<"every">;
    everySeconds: z.ZodNumber;
}, z.core.$strict>, z.ZodObject<{
    kind: z.ZodLiteral<"daily">;
    time: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    kind: z.ZodLiteral<"weekly">;
    time: z.ZodString;
    weekdays: z.ZodArray<z.ZodNumber>;
}, z.core.$strict>, z.ZodObject<{
    kind: z.ZodLiteral<"cron">;
    expression: z.ZodString;
}, z.core.$strict>], "kind">;
export declare const routineCreateSchema: z.ZodObject<{
    botId: z.ZodString;
    title: z.ZodString;
    prompt: z.ZodString;
    rule: z.ZodDiscriminatedUnion<[z.ZodObject<{
        kind: z.ZodLiteral<"at">;
        at: z.ZodNumber;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"every">;
        everySeconds: z.ZodNumber;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"daily">;
        time: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"weekly">;
        time: z.ZodString;
        weekdays: z.ZodArray<z.ZodNumber>;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"cron">;
        expression: z.ZodString;
    }, z.core.$strict>], "kind">;
    timeZone: z.ZodString;
    enabled: z.ZodDefault<z.ZodBoolean>;
    misfirePolicy: z.ZodDefault<z.ZodEnum<{
        latest: "latest";
        skip: "skip";
    }>>;
}, z.core.$strict>;
export declare const routinePatchSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    prompt: z.ZodOptional<z.ZodString>;
    rule: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
        kind: z.ZodLiteral<"at">;
        at: z.ZodNumber;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"every">;
        everySeconds: z.ZodNumber;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"daily">;
        time: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"weekly">;
        time: z.ZodString;
        weekdays: z.ZodArray<z.ZodNumber>;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"cron">;
        expression: z.ZodString;
    }, z.core.$strict>], "kind">>;
    timeZone: z.ZodOptional<z.ZodString>;
    enabled: z.ZodOptional<z.ZodBoolean>;
    misfirePolicy: z.ZodOptional<z.ZodEnum<{
        latest: "latest";
        skip: "skip";
    }>>;
}, z.core.$strict>;
export declare const createdBySchema: z.ZodObject<{
    kind: z.ZodEnum<{
        model: "model";
        user: "user";
    }>;
    sessionId: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export declare const routineRecordSchema: z.ZodObject<{
    botId: z.ZodString;
    title: z.ZodString;
    prompt: z.ZodString;
    rule: z.ZodDiscriminatedUnion<[z.ZodObject<{
        kind: z.ZodLiteral<"at">;
        at: z.ZodNumber;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"every">;
        everySeconds: z.ZodNumber;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"daily">;
        time: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"weekly">;
        time: z.ZodString;
        weekdays: z.ZodArray<z.ZodNumber>;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"cron">;
        expression: z.ZodString;
    }, z.core.$strict>], "kind">;
    timeZone: z.ZodString;
    enabled: z.ZodBoolean;
    misfirePolicy: z.ZodEnum<{
        latest: "latest";
        skip: "skip";
    }>;
    id: z.ZodUUID;
    schemaVersion: z.ZodLiteral<1>;
    revision: z.ZodNumber;
    ruleRevision: z.ZodNumber;
    botCreatedAt: z.ZodNumber;
    createdBy: z.ZodObject<{
        kind: z.ZodEnum<{
            model: "model";
            user: "user";
        }>;
        sessionId: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>;
    workspacePolicy: z.ZodLiteral<"bots">;
    anchorAt: z.ZodNumber;
    nextRunAt: z.ZodOptional<z.ZodNumber>;
    lastDecidedOccurrenceAt: z.ZodOptional<z.ZodNumber>;
    lastDecisionKey: z.ZodOptional<z.ZodString>;
    lastRunId: z.ZodOptional<z.ZodUUID>;
    deletedAt: z.ZodOptional<z.ZodNumber>;
    createdAt: z.ZodNumber;
    updatedAt: z.ZodNumber;
}, z.core.$strict>;
export declare const runStatusSchema: z.ZodEnum<{
    skipped: "skipped";
    failed: "failed";
    delivered: "delivered";
    cancelled: "cancelled";
    running: "running";
    waiting_approval: "waiting_approval";
    recovery_needed: "recovery_needed";
    queued: "queued";
    succeeded: "succeeded";
    timed_out: "timed_out";
}>;
export declare const terminalRunStatuses: readonly ["delivered", "succeeded", "failed", "cancelled", "timed_out", "skipped"];
export declare const isTerminalRun: (status: RunStatus) => boolean;
export declare const reportMessageSchema: z.ZodObject<{
    id: z.ZodUUID;
    role: z.ZodLiteral<"user">;
    content: z.ZodArray<z.ZodObject<{
        type: z.ZodLiteral<"text">;
        text: z.ZodString;
    }, z.core.$strict>>;
    source: z.ZodObject<{
        kind: z.ZodLiteral<"dsh-bot-delegate">;
        form: z.ZodLiteral<"notice">;
        summary: z.ZodString;
        runId: z.ZodUUID;
        sourceSessionId: z.ZodString;
    }, z.core.$strict>;
}, z.core.$strict>;
declare module '@deepseek-ai/dsh-llm' {
    interface MessageSourceMap {
        'dsh-bot-delegate': {
            kind: 'dsh-bot-delegate';
            form: 'notice';
            summary: string;
            runId: string;
            sourceSessionId: string;
        };
    }
}
export declare const runReportSchema: z.ZodObject<{
    state: z.ZodEnum<{
        pending: "pending";
        blocked: "blocked";
        sent: "sent";
    }>;
    originSessionId: z.ZodString;
    messageId: z.ZodOptional<z.ZodUUID>;
    message: z.ZodOptional<z.ZodObject<{
        id: z.ZodUUID;
        role: z.ZodLiteral<"user">;
        content: z.ZodArray<z.ZodObject<{
            type: z.ZodLiteral<"text">;
            text: z.ZodString;
        }, z.core.$strict>>;
        source: z.ZodObject<{
            kind: z.ZodLiteral<"dsh-bot-delegate">;
            form: z.ZodLiteral<"notice">;
            summary: z.ZodString;
            runId: z.ZodUUID;
            sourceSessionId: z.ZodString;
        }, z.core.$strict>;
    }, z.core.$strict>>;
    attempts: z.ZodNumber;
    lastAttemptAt: z.ZodOptional<z.ZodNumber>;
    durableAt: z.ZodOptional<z.ZodNumber>;
    reason: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export declare const runRecordSchema: z.ZodObject<{
    id: z.ZodUUID;
    schemaVersion: z.ZodLiteral<1>;
    revision: z.ZodNumber;
    dedupeKey: z.ZodString;
    trigger: z.ZodEnum<{
        manual: "manual";
        delegate: "delegate";
    }>;
    operationId: z.ZodOptional<z.ZodUUID>;
    nativeScheduleId: z.ZodOptional<z.ZodString>;
    botId: z.ZodString;
    botCreatedAt: z.ZodNumber;
    snapshot: z.ZodObject<{
        title: z.ZodString;
        prompt: z.ZodString;
        timeZone: z.ZodString;
        presetId: z.ZodString;
        botUpdatedAt: z.ZodNumber;
    }, z.core.$strict>;
    requestedAt: z.ZodNumber;
    admittedAt: z.ZodOptional<z.ZodNumber>;
    startedAt: z.ZodOptional<z.ZodNumber>;
    endedAt: z.ZodOptional<z.ZodNumber>;
    updatedAt: z.ZodNumber;
    status: z.ZodEnum<{
        skipped: "skipped";
        failed: "failed";
        delivered: "delivered";
        cancelled: "cancelled";
        running: "running";
        waiting_approval: "waiting_approval";
        recovery_needed: "recovery_needed";
        queued: "queued";
        succeeded: "succeeded";
        timed_out: "timed_out";
    }>;
    step: z.ZodEnum<{
        unknown: "unknown";
        creating: "creating";
        queued: "queued";
        reserved: "reserved";
        submitting: "submitting";
        executing: "executing";
        settled: "settled";
    }>;
    lastConfirmedStep: z.ZodOptional<z.ZodEnum<{
        unknown: "unknown";
        creating: "creating";
        queued: "queued";
        reserved: "reserved";
        submitting: "submitting";
        executing: "executing";
        settled: "settled";
    }>>;
    decision: z.ZodEnum<{
        run: "run";
        skip: "skip";
    }>;
    skipReason: z.ZodOptional<z.ZodString>;
    sessionId: z.ZodString;
    requestId: z.ZodString;
    workspaceId: z.ZodOptional<z.ZodString>;
    cwd: z.ZodOptional<z.ZodString>;
    inputMessageId: z.ZodOptional<z.ZodString>;
    inputTurn: z.ZodOptional<z.ZodNumber>;
    lastEventSeq: z.ZodOptional<z.ZodNumber>;
    execution: z.ZodOptional<z.ZodObject<{
        turns: z.ZodArray<z.ZodNumber>;
        jobIds: z.ZodArray<z.ZodString>;
        activationIds: z.ZodArray<z.ZodString>;
        childSessionIds: z.ZodArray<z.ZodString>;
    }, z.core.$strict>>;
    slotHeld: z.ZodBoolean;
    originSessionId: z.ZodOptional<z.ZodString>;
    originBotId: z.ZodOptional<z.ZodString>;
    originBotCreatedAt: z.ZodOptional<z.ZodNumber>;
    depth: z.ZodNumber;
    summary: z.ZodOptional<z.ZodString>;
    errorCode: z.ZodOptional<z.ZodString>;
    report: z.ZodOptional<z.ZodObject<{
        state: z.ZodEnum<{
            pending: "pending";
            blocked: "blocked";
            sent: "sent";
        }>;
        originSessionId: z.ZodString;
        messageId: z.ZodOptional<z.ZodUUID>;
        message: z.ZodOptional<z.ZodObject<{
            id: z.ZodUUID;
            role: z.ZodLiteral<"user">;
            content: z.ZodArray<z.ZodObject<{
                type: z.ZodLiteral<"text">;
                text: z.ZodString;
            }, z.core.$strict>>;
            source: z.ZodObject<{
                kind: z.ZodLiteral<"dsh-bot-delegate">;
                form: z.ZodLiteral<"notice">;
                summary: z.ZodString;
                runId: z.ZodUUID;
                sourceSessionId: z.ZodString;
            }, z.core.$strict>;
        }, z.core.$strict>>;
        attempts: z.ZodNumber;
        lastAttemptAt: z.ZodOptional<z.ZodNumber>;
        durableAt: z.ZodOptional<z.ZodNumber>;
        reason: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export declare const runListSchema: z.ZodObject<{
    botId: z.ZodOptional<z.ZodString>;
    nativeScheduleId: z.ZodOptional<z.ZodString>;
    limit: z.ZodDefault<z.ZodNumber>;
    before: z.ZodOptional<z.ZodObject<{
        requestedAt: z.ZodNumber;
        id: z.ZodUUID;
    }, z.core.$strict>>;
}, z.core.$strict>;
export declare const runRequestSchema: z.ZodObject<{
    trigger: z.ZodLiteral<"manual">;
    nativeScheduleId: z.ZodString;
    operationId: z.ZodUUID;
    botId: z.ZodString;
    botCreatedAt: z.ZodNumber;
    title: z.ZodString;
    prompt: z.ZodString;
    timeZone: z.ZodString;
}, z.core.$strict>;
export type RoutineRule = z.output<typeof routineRuleSchema>;
export type RoutineRecord = z.output<typeof routineRecordSchema>;
export type RoutineCreate = z.input<typeof routineCreateSchema>;
export type RoutinePatch = z.input<typeof routinePatchSchema>;
export type RunRecord = z.output<typeof runRecordSchema>;
export type RunStatus = z.output<typeof runStatusSchema>;
export type RunRequest = z.input<typeof runRequestSchema>;
