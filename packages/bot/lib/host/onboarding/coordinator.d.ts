import type { Context } from '@deepseek-ai/cordis';
import type { Agent } from '@deepseek-ai/dsh-agent';
import { MessageId, type LlmCallConfig, type UserMessage } from '@deepseek-ai/dsh-llm';
import { type SessionEvent } from '@deepseek-ai/dsh-session';
import { type OnboardingStatus, type StartOnboardingInput } from '../../shared/onboarding.js';
import type { BotKey } from '../../shared/identity.js';
import type { BotRecord } from '../../shared/schema.js';
import type { DshBotRegistry } from '../registry.js';
export declare const onboardingDomain: {
    name: string;
    version: number;
    tables: {
        receipts: import("@deepseek-ai/dsh-storage-domain").DomainTableSpec<string, {
            botId: string;
            state: "pending" | "unavailable" | "dispatching" | "submitted" | "completed" | "skipped" | "failed" | "uncertain";
            botCreatedAt: number;
            updatedAt: number;
            operationId?: string | undefined;
            sessionId?: string | undefined;
            reason?: string | undefined;
            input?: {
                id: MessageId;
                role: "user";
                content: {
                    type: "text";
                    text: string;
                }[];
                source: {
                    kind: "dsh-bot-onboarding";
                    botId: string;
                    botCreatedAt: number;
                    operationId: string;
                    sessionId: string;
                    inputId: string;
                    context: {
                        form: "notice";
                        summary: string;
                    };
                };
            } | undefined;
            turn?: number | undefined;
            assistantId?: string | undefined;
            controls?: {
                cap: number;
                priorMaxTokens?: number | undefined;
                provider?: string | undefined;
                model?: string | undefined;
                restored?: boolean | undefined;
            } | undefined;
        }>;
    };
};
export declare function onboardingPrompt(bot: BotRecord, language: 'zh' | 'en'): string;
/** Exact event correlation, also usable on a cold read without resolving/waking an Agent. */
export declare function onboardingEvidence(events: readonly SessionEvent[], input: UserMessage): {
    ended: boolean;
    turn: number;
    assistantId: string | undefined;
    state: "completed" | "failed" | "uncertain";
} | {
    ended: boolean;
    turn: number | undefined;
    assistantId: string | undefined;
    state: "uncertain";
};
export declare class Onboarding {
    private readonly ctx;
    private readonly registry;
    private domain;
    private tail;
    private stopped;
    private closing?;
    private readonly running;
    constructor(ctx: Context, registry: DshBotRegistry);
    start(): Promise<void>;
    private serial;
    private statusOf;
    status(botId: string): Promise<OnboardingStatus>;
    /** No async gap: this exact persisted receipt is checked again at native pre-step. */
    owns(agent: Agent, bot: BotKey, message: UserMessage): boolean;
    requestConfig(agent: Agent, resolved: LlmCallConfig, active: boolean): Promise<LlmCallConfig>;
    userWon(agent: Agent, bot: BotKey): void;
    dispatch(input: StartOnboardingInput, retry?: boolean): Promise<OnboardingStatus>;
    private settle;
    private cancel;
    close(): Promise<void>;
}
