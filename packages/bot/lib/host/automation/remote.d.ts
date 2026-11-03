import type { Context } from '@deepseek-ai/cordis';
import { TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol';
import { type AutomationHostMethods, type AutomationStatus } from '../../shared/automation-contract.js';
import type { RunService } from './store.js';
import type { NativeSchedules } from '../native-schedule/service.js';
import type { RunRequest } from '../../shared/automation.js';
export declare const AUTOMATION_HOST: {
    package: string;
    face: "host";
    schemas: never[];
    readonly invocations: readonly import("@deepseek-ai/dsh-typert-protocol").InvocationDescriptor[];
    model: {
        services: never[];
        events: never[];
        objects: never[];
    };
};
declare module '@deepseek-ai/cordis' {
    interface Context {
        dshBotNativeSchedules: NativeScheduleRemote;
        dshBotRuns: RunRemote;
        dshBotAutomation: AutomationStatusRemote;
    }
}
export declare class AutomationStatusRemote extends TypertRemoteService implements AutomationHostMethods<'dshBot.automation'> {
    private readonly readStatus;
    constructor(ctx: Context, readStatus: () => AutomationStatus);
    status(): Promise<{
        state: "failed" | "ready" | "stopping" | "starting";
        reason?: string | undefined;
    }>;
}
export declare class NativeScheduleRemote extends TypertRemoteService implements AutomationHostMethods<'dshBot.nativeSchedule'> {
    private readonly native;
    private readonly submit;
    constructor(ctx: Context, native: NativeSchedules, submit: (request: RunRequest) => ReturnType<RunService['enqueue']>);
    aggregate(): Promise<{
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
    }>;
    deleteLegacy(id: string): Promise<boolean>;
    runNow(id: string, operationId: string, expected: {
        title: string;
        prompt: string;
        botCreatedAt: number;
    }, approved: true): Promise<{
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
}
export declare class RunRemote extends TypertRemoteService implements AutomationHostMethods<'dshBot.run'> {
    private readonly runs;
    constructor(ctx: Context, runs: RunService);
    list(options: Parameters<RunService['list']>[0]): Promise<{
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
    }[]>;
    get(id: string): Promise<{
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
}
