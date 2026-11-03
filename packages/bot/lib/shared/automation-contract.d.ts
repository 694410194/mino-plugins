import type { RemoteResult } from '@deepseek-ai/dsh-typert-protocol';
import { z } from 'zod';
export declare const automationStatusSchema: z.ZodObject<{
    state: z.ZodEnum<{
        failed: "failed";
        ready: "ready";
        stopping: "stopping";
        starting: "starting";
    }>;
    reason: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export type AutomationStatus = z.output<typeof automationStatusSchema>;
export declare const automationRemoteSpec: {
    readonly package: "dsh-bot/automation";
    readonly methods: {
        readonly 'dshBot.automation/status': {
            readonly service: "dshBotAutomation";
            readonly invocation: {
                readonly kind: "direct";
            };
            readonly parameters: readonly [];
            readonly result: {
                mode: "strict";
                typeSymbol: string;
                create: () => z.ZodObject<{
                    state: z.ZodEnum<{
                        failed: "failed";
                        ready: "ready";
                        stopping: "stopping";
                        starting: "starting";
                    }>;
                    reason: z.ZodOptional<z.ZodString>;
                }, z.core.$strict>;
                encode: (value: unknown) => {
                    state: "failed" | "ready" | "stopping" | "starting";
                    reason?: string | undefined;
                };
                decode: (value: unknown) => {
                    state: "failed" | "ready" | "stopping" | "starting";
                    reason?: string | undefined;
                };
            };
        };
        readonly 'dshBot.nativeSchedule/aggregate': {
            readonly parameters: readonly [];
            readonly result: {
                mode: "strict";
                typeSymbol: string;
                create: () => z.ZodObject<{
                    bindings: z.ZodArray<z.ZodObject<{
                        botId: z.ZodString;
                        botCreatedAt: z.ZodNumber;
                        sessionId: z.ZodString;
                        nativeScheduleId: z.ZodString;
                    }, z.core.$strict>>;
                    legacy: z.ZodArray<z.ZodObject<{
                        id: z.ZodString;
                        botId: z.ZodString;
                        botCreatedAt: z.ZodNumber;
                        title: z.ZodString;
                        prompt: z.ZodString;
                    }, z.core.$strict>>;
                    nativeAvailable: z.ZodBoolean;
                    legacyUnavailable: z.ZodBoolean;
                    legacySkipped: z.ZodNumber;
                }, z.core.$strict>;
                encode: (value: unknown) => {
                    bindings: {
                        botId: string;
                        botCreatedAt: number;
                        sessionId: string;
                        nativeScheduleId: string;
                    }[];
                    legacy: {
                        id: string;
                        botId: string;
                        botCreatedAt: number;
                        title: string;
                        prompt: string;
                    }[];
                    nativeAvailable: boolean;
                    legacyUnavailable: boolean;
                    legacySkipped: number;
                };
                decode: (value: unknown) => {
                    bindings: {
                        botId: string;
                        botCreatedAt: number;
                        sessionId: string;
                        nativeScheduleId: string;
                    }[];
                    legacy: {
                        id: string;
                        botId: string;
                        botCreatedAt: number;
                        title: string;
                        prompt: string;
                    }[];
                    nativeAvailable: boolean;
                    legacyUnavailable: boolean;
                    legacySkipped: number;
                };
            };
            readonly service: string;
            readonly invocation: {
                kind: "direct";
            };
        };
        readonly 'dshBot.nativeSchedule/deleteLegacy': {
            readonly parameters: readonly [{
                name: string;
                source: "json";
                codec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodUUID;
                    encode: (value: unknown) => string;
                    decode: (value: unknown) => string;
                };
                strictCodec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodUUID;
                    encode: (value: unknown) => string;
                    decode: (value: unknown) => string;
                };
            }];
            readonly result: {
                mode: "strict";
                typeSymbol: string;
                create: () => z.ZodBoolean;
                encode: (value: unknown) => boolean;
                decode: (value: unknown) => boolean;
            };
            readonly service: string;
            readonly invocation: {
                kind: "direct";
            };
        };
        readonly 'dshBot.nativeSchedule/runNow': {
            readonly parameters: readonly [{
                name: string;
                source: "json";
                codec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodString;
                    encode: (value: unknown) => string;
                    decode: (value: unknown) => string;
                };
                strictCodec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodString;
                    encode: (value: unknown) => string;
                    decode: (value: unknown) => string;
                };
            }, {
                name: string;
                source: "json";
                codec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodUUID;
                    encode: (value: unknown) => string;
                    decode: (value: unknown) => string;
                };
                strictCodec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodUUID;
                    encode: (value: unknown) => string;
                    decode: (value: unknown) => string;
                };
            }, {
                name: string;
                source: "json";
                codec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodObject<{
                        title: z.ZodString;
                        prompt: z.ZodString;
                        botCreatedAt: z.ZodNumber;
                    }, z.core.$strict>;
                    encode: (value: unknown) => {
                        title: string;
                        prompt: string;
                        botCreatedAt: number;
                    };
                    decode: (value: unknown) => {
                        title: string;
                        prompt: string;
                        botCreatedAt: number;
                    };
                };
                strictCodec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodObject<{
                        title: z.ZodString;
                        prompt: z.ZodString;
                        botCreatedAt: z.ZodNumber;
                    }, z.core.$strict>;
                    encode: (value: unknown) => {
                        title: string;
                        prompt: string;
                        botCreatedAt: number;
                    };
                    decode: (value: unknown) => {
                        title: string;
                        prompt: string;
                        botCreatedAt: number;
                    };
                };
            }, {
                name: string;
                source: "json";
                codec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodLiteral<true>;
                    encode: (value: unknown) => true;
                    decode: (value: unknown) => true;
                };
                strictCodec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodLiteral<true>;
                    encode: (value: unknown) => true;
                    decode: (value: unknown) => true;
                };
            }];
            readonly result: {
                mode: "strict";
                typeSymbol: string;
                create: () => z.ZodObject<{
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
                encode: (value: unknown) => {
                    id: string;
                    schemaVersion: 1;
                    revision: number;
                    dedupeKey: string;
                    trigger: "manual" | "delegate";
                    botId: string;
                    botCreatedAt: number;
                    snapshot: {
                        title: string;
                        prompt: string;
                        timeZone: string;
                        presetId: string;
                        botUpdatedAt: number;
                    };
                    requestedAt: number;
                    updatedAt: number;
                    status: "skipped" | "failed" | "delivered" | "cancelled" | "running" | "waiting_approval" | "recovery_needed" | "queued" | "succeeded" | "timed_out";
                    step: "unknown" | "creating" | "queued" | "reserved" | "submitting" | "executing" | "settled";
                    decision: "run" | "skip";
                    sessionId: string;
                    requestId: string;
                    slotHeld: boolean;
                    depth: number;
                    operationId?: string | undefined;
                    nativeScheduleId?: string | undefined;
                    admittedAt?: number | undefined;
                    startedAt?: number | undefined;
                    endedAt?: number | undefined;
                    lastConfirmedStep?: "unknown" | "creating" | "queued" | "reserved" | "submitting" | "executing" | "settled" | undefined;
                    skipReason?: string | undefined;
                    workspaceId?: string | undefined;
                    cwd?: string | undefined;
                    inputMessageId?: string | undefined;
                    inputTurn?: number | undefined;
                    lastEventSeq?: number | undefined;
                    execution?: {
                        turns: number[];
                        jobIds: string[];
                        activationIds: string[];
                        childSessionIds: string[];
                    } | undefined;
                    originSessionId?: string | undefined;
                    originBotId?: string | undefined;
                    originBotCreatedAt?: number | undefined;
                    summary?: string | undefined;
                    errorCode?: string | undefined;
                    report?: {
                        state: "pending" | "blocked" | "sent";
                        originSessionId: string;
                        attempts: number;
                        messageId?: string | undefined;
                        message?: {
                            id: string;
                            role: "user";
                            content: {
                                type: "text";
                                text: string;
                            }[];
                            source: {
                                kind: "dsh-bot-delegate";
                                form: "notice";
                                summary: string;
                                runId: string;
                                sourceSessionId: string;
                            };
                        } | undefined;
                        lastAttemptAt?: number | undefined;
                        durableAt?: number | undefined;
                        reason?: string | undefined;
                    } | undefined;
                };
                decode: (value: unknown) => {
                    id: string;
                    schemaVersion: 1;
                    revision: number;
                    dedupeKey: string;
                    trigger: "manual" | "delegate";
                    botId: string;
                    botCreatedAt: number;
                    snapshot: {
                        title: string;
                        prompt: string;
                        timeZone: string;
                        presetId: string;
                        botUpdatedAt: number;
                    };
                    requestedAt: number;
                    updatedAt: number;
                    status: "skipped" | "failed" | "delivered" | "cancelled" | "running" | "waiting_approval" | "recovery_needed" | "queued" | "succeeded" | "timed_out";
                    step: "unknown" | "creating" | "queued" | "reserved" | "submitting" | "executing" | "settled";
                    decision: "run" | "skip";
                    sessionId: string;
                    requestId: string;
                    slotHeld: boolean;
                    depth: number;
                    operationId?: string | undefined;
                    nativeScheduleId?: string | undefined;
                    admittedAt?: number | undefined;
                    startedAt?: number | undefined;
                    endedAt?: number | undefined;
                    lastConfirmedStep?: "unknown" | "creating" | "queued" | "reserved" | "submitting" | "executing" | "settled" | undefined;
                    skipReason?: string | undefined;
                    workspaceId?: string | undefined;
                    cwd?: string | undefined;
                    inputMessageId?: string | undefined;
                    inputTurn?: number | undefined;
                    lastEventSeq?: number | undefined;
                    execution?: {
                        turns: number[];
                        jobIds: string[];
                        activationIds: string[];
                        childSessionIds: string[];
                    } | undefined;
                    originSessionId?: string | undefined;
                    originBotId?: string | undefined;
                    originBotCreatedAt?: number | undefined;
                    summary?: string | undefined;
                    errorCode?: string | undefined;
                    report?: {
                        state: "pending" | "blocked" | "sent";
                        originSessionId: string;
                        attempts: number;
                        messageId?: string | undefined;
                        message?: {
                            id: string;
                            role: "user";
                            content: {
                                type: "text";
                                text: string;
                            }[];
                            source: {
                                kind: "dsh-bot-delegate";
                                form: "notice";
                                summary: string;
                                runId: string;
                                sourceSessionId: string;
                            };
                        } | undefined;
                        lastAttemptAt?: number | undefined;
                        durableAt?: number | undefined;
                        reason?: string | undefined;
                    } | undefined;
                };
            };
            readonly service: string;
            readonly invocation: {
                kind: "direct";
            };
        };
        readonly 'dshBot.run/list': {
            readonly parameters: readonly [{
                name: string;
                source: "json";
                codec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodObject<{
                        botId: z.ZodOptional<z.ZodString>;
                        nativeScheduleId: z.ZodOptional<z.ZodString>;
                        limit: z.ZodDefault<z.ZodNumber>;
                        before: z.ZodOptional<z.ZodObject<{
                            requestedAt: z.ZodNumber;
                            id: z.ZodUUID;
                        }, z.core.$strict>>;
                    }, z.core.$strict>;
                    encode: (value: unknown) => {
                        limit: number;
                        botId?: string | undefined;
                        nativeScheduleId?: string | undefined;
                        before?: {
                            requestedAt: number;
                            id: string;
                        } | undefined;
                    };
                    decode: (value: unknown) => {
                        limit: number;
                        botId?: string | undefined;
                        nativeScheduleId?: string | undefined;
                        before?: {
                            requestedAt: number;
                            id: string;
                        } | undefined;
                    };
                };
                strictCodec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodObject<{
                        botId: z.ZodOptional<z.ZodString>;
                        nativeScheduleId: z.ZodOptional<z.ZodString>;
                        limit: z.ZodDefault<z.ZodNumber>;
                        before: z.ZodOptional<z.ZodObject<{
                            requestedAt: z.ZodNumber;
                            id: z.ZodUUID;
                        }, z.core.$strict>>;
                    }, z.core.$strict>;
                    encode: (value: unknown) => {
                        limit: number;
                        botId?: string | undefined;
                        nativeScheduleId?: string | undefined;
                        before?: {
                            requestedAt: number;
                            id: string;
                        } | undefined;
                    };
                    decode: (value: unknown) => {
                        limit: number;
                        botId?: string | undefined;
                        nativeScheduleId?: string | undefined;
                        before?: {
                            requestedAt: number;
                            id: string;
                        } | undefined;
                    };
                };
            }];
            readonly result: {
                mode: "strict";
                typeSymbol: string;
                create: () => z.ZodArray<z.ZodObject<{
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
                }, z.core.$strict>>;
                encode: (value: unknown) => {
                    id: string;
                    schemaVersion: 1;
                    revision: number;
                    dedupeKey: string;
                    trigger: "manual" | "delegate";
                    botId: string;
                    botCreatedAt: number;
                    snapshot: {
                        title: string;
                        prompt: string;
                        timeZone: string;
                        presetId: string;
                        botUpdatedAt: number;
                    };
                    requestedAt: number;
                    updatedAt: number;
                    status: "skipped" | "failed" | "delivered" | "cancelled" | "running" | "waiting_approval" | "recovery_needed" | "queued" | "succeeded" | "timed_out";
                    step: "unknown" | "creating" | "queued" | "reserved" | "submitting" | "executing" | "settled";
                    decision: "run" | "skip";
                    sessionId: string;
                    requestId: string;
                    slotHeld: boolean;
                    depth: number;
                    operationId?: string | undefined;
                    nativeScheduleId?: string | undefined;
                    admittedAt?: number | undefined;
                    startedAt?: number | undefined;
                    endedAt?: number | undefined;
                    lastConfirmedStep?: "unknown" | "creating" | "queued" | "reserved" | "submitting" | "executing" | "settled" | undefined;
                    skipReason?: string | undefined;
                    workspaceId?: string | undefined;
                    cwd?: string | undefined;
                    inputMessageId?: string | undefined;
                    inputTurn?: number | undefined;
                    lastEventSeq?: number | undefined;
                    execution?: {
                        turns: number[];
                        jobIds: string[];
                        activationIds: string[];
                        childSessionIds: string[];
                    } | undefined;
                    originSessionId?: string | undefined;
                    originBotId?: string | undefined;
                    originBotCreatedAt?: number | undefined;
                    summary?: string | undefined;
                    errorCode?: string | undefined;
                    report?: {
                        state: "pending" | "blocked" | "sent";
                        originSessionId: string;
                        attempts: number;
                        messageId?: string | undefined;
                        message?: {
                            id: string;
                            role: "user";
                            content: {
                                type: "text";
                                text: string;
                            }[];
                            source: {
                                kind: "dsh-bot-delegate";
                                form: "notice";
                                summary: string;
                                runId: string;
                                sourceSessionId: string;
                            };
                        } | undefined;
                        lastAttemptAt?: number | undefined;
                        durableAt?: number | undefined;
                        reason?: string | undefined;
                    } | undefined;
                }[];
                decode: (value: unknown) => {
                    id: string;
                    schemaVersion: 1;
                    revision: number;
                    dedupeKey: string;
                    trigger: "manual" | "delegate";
                    botId: string;
                    botCreatedAt: number;
                    snapshot: {
                        title: string;
                        prompt: string;
                        timeZone: string;
                        presetId: string;
                        botUpdatedAt: number;
                    };
                    requestedAt: number;
                    updatedAt: number;
                    status: "skipped" | "failed" | "delivered" | "cancelled" | "running" | "waiting_approval" | "recovery_needed" | "queued" | "succeeded" | "timed_out";
                    step: "unknown" | "creating" | "queued" | "reserved" | "submitting" | "executing" | "settled";
                    decision: "run" | "skip";
                    sessionId: string;
                    requestId: string;
                    slotHeld: boolean;
                    depth: number;
                    operationId?: string | undefined;
                    nativeScheduleId?: string | undefined;
                    admittedAt?: number | undefined;
                    startedAt?: number | undefined;
                    endedAt?: number | undefined;
                    lastConfirmedStep?: "unknown" | "creating" | "queued" | "reserved" | "submitting" | "executing" | "settled" | undefined;
                    skipReason?: string | undefined;
                    workspaceId?: string | undefined;
                    cwd?: string | undefined;
                    inputMessageId?: string | undefined;
                    inputTurn?: number | undefined;
                    lastEventSeq?: number | undefined;
                    execution?: {
                        turns: number[];
                        jobIds: string[];
                        activationIds: string[];
                        childSessionIds: string[];
                    } | undefined;
                    originSessionId?: string | undefined;
                    originBotId?: string | undefined;
                    originBotCreatedAt?: number | undefined;
                    summary?: string | undefined;
                    errorCode?: string | undefined;
                    report?: {
                        state: "pending" | "blocked" | "sent";
                        originSessionId: string;
                        attempts: number;
                        messageId?: string | undefined;
                        message?: {
                            id: string;
                            role: "user";
                            content: {
                                type: "text";
                                text: string;
                            }[];
                            source: {
                                kind: "dsh-bot-delegate";
                                form: "notice";
                                summary: string;
                                runId: string;
                                sourceSessionId: string;
                            };
                        } | undefined;
                        lastAttemptAt?: number | undefined;
                        durableAt?: number | undefined;
                        reason?: string | undefined;
                    } | undefined;
                }[];
            };
            readonly service: string;
            readonly invocation: {
                kind: "direct";
            };
        };
        readonly 'dshBot.run/get': {
            readonly parameters: readonly [{
                name: string;
                source: "json";
                codec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodUUID;
                    encode: (value: unknown) => string;
                    decode: (value: unknown) => string;
                };
                strictCodec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodUUID;
                    encode: (value: unknown) => string;
                    decode: (value: unknown) => string;
                };
            }];
            readonly result: {
                mode: "strict";
                typeSymbol: string;
                create: () => z.ZodObject<{
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
                encode: (value: unknown) => {
                    id: string;
                    schemaVersion: 1;
                    revision: number;
                    dedupeKey: string;
                    trigger: "manual" | "delegate";
                    botId: string;
                    botCreatedAt: number;
                    snapshot: {
                        title: string;
                        prompt: string;
                        timeZone: string;
                        presetId: string;
                        botUpdatedAt: number;
                    };
                    requestedAt: number;
                    updatedAt: number;
                    status: "skipped" | "failed" | "delivered" | "cancelled" | "running" | "waiting_approval" | "recovery_needed" | "queued" | "succeeded" | "timed_out";
                    step: "unknown" | "creating" | "queued" | "reserved" | "submitting" | "executing" | "settled";
                    decision: "run" | "skip";
                    sessionId: string;
                    requestId: string;
                    slotHeld: boolean;
                    depth: number;
                    operationId?: string | undefined;
                    nativeScheduleId?: string | undefined;
                    admittedAt?: number | undefined;
                    startedAt?: number | undefined;
                    endedAt?: number | undefined;
                    lastConfirmedStep?: "unknown" | "creating" | "queued" | "reserved" | "submitting" | "executing" | "settled" | undefined;
                    skipReason?: string | undefined;
                    workspaceId?: string | undefined;
                    cwd?: string | undefined;
                    inputMessageId?: string | undefined;
                    inputTurn?: number | undefined;
                    lastEventSeq?: number | undefined;
                    execution?: {
                        turns: number[];
                        jobIds: string[];
                        activationIds: string[];
                        childSessionIds: string[];
                    } | undefined;
                    originSessionId?: string | undefined;
                    originBotId?: string | undefined;
                    originBotCreatedAt?: number | undefined;
                    summary?: string | undefined;
                    errorCode?: string | undefined;
                    report?: {
                        state: "pending" | "blocked" | "sent";
                        originSessionId: string;
                        attempts: number;
                        messageId?: string | undefined;
                        message?: {
                            id: string;
                            role: "user";
                            content: {
                                type: "text";
                                text: string;
                            }[];
                            source: {
                                kind: "dsh-bot-delegate";
                                form: "notice";
                                summary: string;
                                runId: string;
                                sourceSessionId: string;
                            };
                        } | undefined;
                        lastAttemptAt?: number | undefined;
                        durableAt?: number | undefined;
                        reason?: string | undefined;
                    } | undefined;
                };
                decode: (value: unknown) => {
                    id: string;
                    schemaVersion: 1;
                    revision: number;
                    dedupeKey: string;
                    trigger: "manual" | "delegate";
                    botId: string;
                    botCreatedAt: number;
                    snapshot: {
                        title: string;
                        prompt: string;
                        timeZone: string;
                        presetId: string;
                        botUpdatedAt: number;
                    };
                    requestedAt: number;
                    updatedAt: number;
                    status: "skipped" | "failed" | "delivered" | "cancelled" | "running" | "waiting_approval" | "recovery_needed" | "queued" | "succeeded" | "timed_out";
                    step: "unknown" | "creating" | "queued" | "reserved" | "submitting" | "executing" | "settled";
                    decision: "run" | "skip";
                    sessionId: string;
                    requestId: string;
                    slotHeld: boolean;
                    depth: number;
                    operationId?: string | undefined;
                    nativeScheduleId?: string | undefined;
                    admittedAt?: number | undefined;
                    startedAt?: number | undefined;
                    endedAt?: number | undefined;
                    lastConfirmedStep?: "unknown" | "creating" | "queued" | "reserved" | "submitting" | "executing" | "settled" | undefined;
                    skipReason?: string | undefined;
                    workspaceId?: string | undefined;
                    cwd?: string | undefined;
                    inputMessageId?: string | undefined;
                    inputTurn?: number | undefined;
                    lastEventSeq?: number | undefined;
                    execution?: {
                        turns: number[];
                        jobIds: string[];
                        activationIds: string[];
                        childSessionIds: string[];
                    } | undefined;
                    originSessionId?: string | undefined;
                    originBotId?: string | undefined;
                    originBotCreatedAt?: number | undefined;
                    summary?: string | undefined;
                    errorCode?: string | undefined;
                    report?: {
                        state: "pending" | "blocked" | "sent";
                        originSessionId: string;
                        attempts: number;
                        messageId?: string | undefined;
                        message?: {
                            id: string;
                            role: "user";
                            content: {
                                type: "text";
                                text: string;
                            }[];
                            source: {
                                kind: "dsh-bot-delegate";
                                form: "notice";
                                summary: string;
                                runId: string;
                                sourceSessionId: string;
                            };
                        } | undefined;
                        lastAttemptAt?: number | undefined;
                        durableAt?: number | undefined;
                        reason?: string | undefined;
                    } | undefined;
                };
            };
            readonly service: string;
            readonly invocation: {
                kind: "direct";
            };
        };
    };
};
type Methods = typeof automationRemoteSpec.methods;
type Args<P extends readonly unknown[]> = {
    -readonly [K in keyof P]: P[K] extends {
        codec: {
            create: () => infer S extends z.ZodType;
        };
    } ? z.input<S> : never;
};
type Result<K extends keyof Methods> = z.output<ReturnType<Methods[K]['result']['create']>>;
export type AutomationHostMethods<N extends string> = {
    [K in keyof Methods as K extends `${N}/${infer M}` ? Methods[K] extends {
        implementation: infer I extends string;
    } ? I : M : never]: (...args: Args<Methods[K]['parameters']>) => Promise<Result<K>>;
};
export type AutomationRemoteMethods<N extends string> = {
    [K in keyof Methods as K extends `${N}/${infer M}` ? M : never]: (...args: Args<Methods[K]['parameters']>) => Promise<RemoteResult<Result<K>>>;
};
type Endpoints = {
    [K in keyof Methods]: (...args: Args<Methods[K]['parameters']>) => Promise<RemoteResult<Result<K>>>;
};
declare module '@deepseek-ai/dsh-typert-protocol' {
    interface TypertRemoteMap extends Endpoints {
    }
    interface TypertRemoteNamespaceMap {
        'dshBot.nativeSchedule': AutomationRemoteMethods<'dshBot.nativeSchedule'>;
        'dshBot.run': AutomationRemoteMethods<'dshBot.run'>;
        'dshBot.automation': AutomationRemoteMethods<'dshBot.automation'>;
    }
}
export declare const AUTOMATION_REMOTE: import("@deepseek-ai/dsh-typert-protocol").TypertRemoteInfo<Readonly<Record<string, import("@deepseek-ai/dsh-typert-protocol").TypertRemoteMethod<object, unknown, "unary", never, unknown> | import("@deepseek-ai/dsh-typert-protocol").TypertRemoteMethod<object, unknown, "stream", unknown, unknown>>>>;
export default AUTOMATION_REMOTE;
