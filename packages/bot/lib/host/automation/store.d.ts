import type { Context } from '@deepseek-ai/cordis';
import { type Domain } from '@deepseek-ai/dsh-storage-domain';
import { z } from 'zod';
import { runListSchema, type RunRecord, type RunRequest, type RunStatus } from '../../shared/automation.js';
import type { BotRecord } from '../../shared/schema.js';
/** New manual executions only; historical delegate rows remain readable. */
export declare const executionDomain: {
    name: string;
    version: number;
    tables: {
        runs: import("@deepseek-ai/dsh-storage-domain").DomainTableSpec<string, {
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
        }>;
    };
};
export interface AutomationOptions {
    resolveBot: (id: string) => {
        bot: BotRecord;
        presetId: string;
    } | Promise<{
        bot: BotRecord;
        presetId: string;
    }>;
    now?: () => number;
    beforeClose?: () => Promise<void>;
}
interface State {
    domain: Domain<typeof executionDomain>;
    options: AutomationOptions;
    now: () => number;
    tail: Promise<unknown>;
    closing: boolean;
    listeners: Set<() => void>;
}
export declare function runDedupeKey(request: RunRequest): string;
export declare const runProgressSchema: z.ZodObject<{
    step: z.ZodOptional<z.ZodEnum<{
        unknown: "unknown";
        creating: "creating";
        queued: "queued";
        reserved: "reserved";
        submitting: "submitting";
        executing: "executing";
        settled: "settled";
    }>>;
    startedAt: z.ZodOptional<z.ZodNumber>;
    sessionId: z.ZodOptional<z.ZodString>;
    snapshot: z.ZodOptional<z.ZodObject<{
        title: z.ZodString;
        prompt: z.ZodString;
        timeZone: z.ZodString;
        presetId: z.ZodString;
        botUpdatedAt: z.ZodNumber;
    }, z.core.$strict>>;
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
    summary: z.ZodOptional<z.ZodString>;
    errorCode: z.ZodOptional<z.ZodString>;
    skipReason: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export declare class RunService {
    private readonly s;
    constructor(s: State);
    forSession(id: string): {
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
    } | undefined;
    get(id: string): {
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
    list(options?: z.input<typeof runListSchema>): RunRecord[];
    enqueue(input: RunRequest): Promise<RunRecord>;
    reserve(id: string): Promise<RunRecord>;
    /** Internal executor boundary. Terminal transitions require confirmed chain termination. */
    transition(id: string, status: RunStatus, expectedRevision: number, progress?: z.input<typeof runProgressSchema>, confirmedStopped?: boolean): Promise<RunRecord>;
}
export declare function openAutomationStores(ctx: Context, options: AutomationOptions): Promise<{
    runs: RunService;
    subscribe: (listener: () => void) => () => void;
    close: () => Promise<void>;
}>;
export {};
