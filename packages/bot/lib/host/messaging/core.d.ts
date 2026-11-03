import type { Context } from '@deepseek-ai/cordis';
import type { Agent } from '@deepseek-ai/dsh-agent';
import { type MessageInput } from '../../shared/messaging.js';
import type { BotKey } from '../../shared/identity.js';
import type { DshBotRegistry } from '../registry.js';
import { Serial } from '../common/operations.js';
import type { MessageStore } from './store.js';
export interface MessagingAuthorization {
    /** Called after exact origin/target resolution and before any native delivery. B04 must implement concrete native approval. */
    approve(agent: Agent, input: Exclude<MessageInput, {
        action: 'list';
    }>, target: BotKey, invocation?: string): Promise<string>;
    targets?(id: string): BotKey[] | undefined;
}
export interface MessagingCapabilities {
    coldWake: boolean;
    interrupt: boolean;
    processing?: boolean;
}
export declare abstract class MessagingCore {
    protected ctx: Context;
    protected registry: DshBotRegistry;
    readonly store: MessageStore;
    protected authorization: MessagingAuthorization;
    readonly capabilities: MessagingCapabilities;
    protected now: () => number;
    protected admission: Serial;
    protected targets: Map<string, Promise<void>>;
    protected tasks: Set<Promise<unknown>>;
    protected timers: Map<string, {
        timer: ReturnType<typeof setTimeout>;
        at: number;
    }>;
    protected wakes: Map<string, {
        sessionId: string;
        generation: string;
    }>;
    protected generation: `${string}-${string}-${string}-${string}-${string}`;
    protected releases: Array<() => void>;
    protected stopped: boolean;
    protected closing?: Promise<void>;
    constructor(ctx: Context, registry: DshBotRegistry, store: MessageStore, authorization?: MessagingAuthorization, capabilities?: MessagingCapabilities, now?: () => number);
    protected abstract kick(id: string, recovery?: boolean): void;
    protected track<T>(p: Promise<T>): Promise<T>;
    protected bot(key: BotKey): Promise<{
        name: string;
        description: string;
        persona: {
            prefix: string;
            suffix?: string | undefined;
            complete?: boolean | undefined;
        };
        template: "standard" | "minimal";
        tools: {
            deny: string[];
        };
        skills: {
            extraDirs: string[];
        };
        memory: {
            enabled: boolean;
            injectLimit: number;
        };
        mcpServers: {
            serverName: string;
            transport: "stdio" | "streamable-http";
            command?: string | undefined;
            args?: string[] | undefined;
            url?: string | undefined;
            envRefs?: Record<string, string> | undefined;
        }[];
        channels: {
            kind: "feishu" | "telegram" | "slack" | "email" | "desktop";
            target: string;
            policy: {
                dailyLimit: number;
                cooldownSec: number;
                quietHours?: [string, string] | undefined;
            };
            credentialRef?: string | undefined;
        }[];
        id: string;
        createdAt: number;
        updatedAt: number;
        schemaVersion: 1;
        avatar?: string | undefined;
        avatarColor?: "--dsw-alias-state-business-primary" | "--dsw-alias-state-success-primary" | "--dsw-alias-state-warn-label" | "--dsw-alias-state-error-primary" | "teal" | "cyan" | "indigo" | "purple" | "rose" | "orange" | "olive" | "slate" | undefined;
        avatarVariant?: "classic" | "glasses" | "spout" | "baby" | "hat" | "sleeping" | "auto" | undefined;
        model?: {
            provider: string;
            model: string;
            reasoningEffort?: string | undefined;
        } | undefined;
        defaultCwd?: string | undefined;
        order?: number | undefined;
        onboarding?: {
            operationId: string;
            language: "en" | "zh";
            policyVersion: 1;
            inputDigest: string;
        } | undefined;
    }>;
    exact(agent: Agent): Promise<Readonly<{
        botId: string;
        botCreatedAt: number;
    }>>;
    provenance(agent: Agent): {
        parent: {
            envelope: {
                schemaVersion: 1;
                id: string;
                from: {
                    botId: string;
                    botCreatedAt: number;
                };
                to: {
                    botId: string;
                    botCreatedAt: number;
                };
                fromSessionId: string;
                toSessionId: string;
                threadId: string;
                correlationId: string;
                origin: {
                    bot: {
                        botId: string;
                        botCreatedAt: number;
                    };
                    sessionId: string;
                    userMessageId: string;
                };
                hop: number;
                depth: number;
                mode: "notify" | "ask" | "reply";
                priority: "normal" | "interrupt";
                ts: number;
                expiresAt: number;
                path: {
                    botId: string;
                    botCreatedAt: number;
                }[];
                contentDigest: string;
                fromDisplay: {
                    name: string;
                    avatarVariant?: "classic" | "glasses" | "spout" | "baby" | "hat" | "sleeping" | "auto" | undefined;
                    avatarColor?: "--dsw-alias-state-business-primary" | "--dsw-alias-state-success-primary" | "--dsw-alias-state-warn-label" | "--dsw-alias-state-error-primary" | "teal" | "cyan" | "indigo" | "purple" | "rose" | "orange" | "olive" | "slate" | undefined;
                };
                toDisplay: {
                    name: string;
                    avatarVariant?: "classic" | "glasses" | "spout" | "baby" | "hat" | "sleeping" | "auto" | undefined;
                    avatarColor?: "--dsw-alias-state-business-primary" | "--dsw-alias-state-success-primary" | "--dsw-alias-state-warn-label" | "--dsw-alias-state-error-primary" | "teal" | "cyan" | "indigo" | "purple" | "rose" | "orange" | "olive" | "slate" | undefined;
                };
                authorizationId: string;
                parentMessageId?: string | undefined;
                replyTo?: string | undefined;
                content?: string | undefined;
                authorizedTargets?: {
                    botId: string;
                    botCreatedAt: number;
                }[] | undefined;
            };
            invocationKey: string;
            invocationDigest: string;
            revision: number;
            delivery: "unknown" | "failed" | "expired" | "delivered" | "queued" | "delivering" | "canceled";
            processing: "pending" | "unknown" | "completed" | "interrupted" | "claimed";
            response: "not-required" | "waiting" | "reply-queued" | "replied" | "timed-out";
            retryCount: number;
            nativeInput?: {
                id: string;
                role: "user";
                source: {
                    kind: "dsh-bot-message" | "dsh-bot-message-sent";
                    form: "notice" | "relay";
                    messageId: string;
                    threadId: string;
                    from: {
                        botId: string;
                        botCreatedAt: number;
                    };
                    to: {
                        botId: string;
                        botCreatedAt: number;
                    };
                    fromSessionId: string;
                    toSessionId: string;
                    hop: number;
                    mode: "notify" | "ask" | "reply";
                    priority: "normal" | "interrupt";
                    displaySnapshots: {
                        from: {
                            name: string;
                            avatarVariant?: "classic" | "glasses" | "spout" | "baby" | "hat" | "sleeping" | "auto" | undefined;
                            avatarColor?: "--dsw-alias-state-business-primary" | "--dsw-alias-state-success-primary" | "--dsw-alias-state-warn-label" | "--dsw-alias-state-error-primary" | "teal" | "cyan" | "indigo" | "purple" | "rose" | "orange" | "olive" | "slate" | undefined;
                        };
                        to: {
                            name: string;
                            avatarVariant?: "classic" | "glasses" | "spout" | "baby" | "hat" | "sleeping" | "auto" | undefined;
                            avatarColor?: "--dsw-alias-state-business-primary" | "--dsw-alias-state-success-primary" | "--dsw-alias-state-warn-label" | "--dsw-alias-state-error-primary" | "teal" | "cyan" | "indigo" | "purple" | "rose" | "orange" | "olive" | "slate" | undefined;
                        };
                    };
                    summary?: string | undefined;
                    replyTo?: string | undefined;
                };
                content: {
                    type: "text";
                    text: string;
                }[];
            } | undefined;
            outgoingInput?: {
                id: string;
                role: "user";
                source: {
                    kind: "dsh-bot-message" | "dsh-bot-message-sent";
                    form: "notice" | "relay";
                    messageId: string;
                    threadId: string;
                    from: {
                        botId: string;
                        botCreatedAt: number;
                    };
                    to: {
                        botId: string;
                        botCreatedAt: number;
                    };
                    fromSessionId: string;
                    toSessionId: string;
                    hop: number;
                    mode: "notify" | "ask" | "reply";
                    priority: "normal" | "interrupt";
                    displaySnapshots: {
                        from: {
                            name: string;
                            avatarVariant?: "classic" | "glasses" | "spout" | "baby" | "hat" | "sleeping" | "auto" | undefined;
                            avatarColor?: "--dsw-alias-state-business-primary" | "--dsw-alias-state-success-primary" | "--dsw-alias-state-warn-label" | "--dsw-alias-state-error-primary" | "teal" | "cyan" | "indigo" | "purple" | "rose" | "orange" | "olive" | "slate" | undefined;
                        };
                        to: {
                            name: string;
                            avatarVariant?: "classic" | "glasses" | "spout" | "baby" | "hat" | "sleeping" | "auto" | undefined;
                            avatarColor?: "--dsw-alias-state-business-primary" | "--dsw-alias-state-success-primary" | "--dsw-alias-state-warn-label" | "--dsw-alias-state-error-primary" | "teal" | "cyan" | "indigo" | "purple" | "rose" | "orange" | "olive" | "slate" | undefined;
                        };
                    };
                    summary?: string | undefined;
                    replyTo?: string | undefined;
                };
                content: {
                    type: "text";
                    text: string;
                }[];
            } | undefined;
            flowId?: string | undefined;
            nativeRef?: {
                sessionId: string;
                messageId: string;
                seq?: number | undefined;
                turn?: number | undefined;
            } | undefined;
            outgoingRef?: {
                sessionId: string;
                messageId: string;
                seq?: number | undefined;
                turn?: number | undefined;
            } | undefined;
            lastErrorCode?: string | undefined;
            nextAttemptAt?: number | undefined;
            claimedTurn?: number | undefined;
            interrupt?: "pending" | "unknown" | "stopped" | "disabled" | "requested" | "issued" | undefined;
            retainedAt?: number | undefined;
            interruptTurn?: number | undefined;
            interruptDeadlineAt?: number | undefined;
        };
        userMessageId?: undefined;
    } | {
        userMessageId: import("@deepseek-ai/dsh-llm").MessageId;
        parent?: undefined;
    };
    protected resolve(sessionId: string): Promise<Agent>;
    protected logs(agent: Agent): Promise<readonly import("@deepseek-ai/dsh-session").SessionEvent[]>;
}
