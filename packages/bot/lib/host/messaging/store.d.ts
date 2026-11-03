import { type Domain } from '@deepseek-ai/dsh-storage-domain';
import { type MessageRecord } from '../../shared/messaging.js';
import type { MessagingConfig } from './config.js';
export declare const messagingDomain: {
    name: string;
    version: number;
    tables: {
        messages: import("@deepseek-ai/dsh-storage-domain").DomainTableSpec<string, {
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
        }>;
        threads: import("@deepseek-ai/dsh-storage-domain").DomainTableSpec<string, {
            id: string;
            rootId: string;
            authorizationId: string;
            count: number;
            openAsks: string[];
            deadline: number;
            closed: boolean;
            revision: number;
        }>;
        limits: import("@deepseek-ai/dsh-storage-domain").DomainTableSpec<string, {
            id: string;
            invocationKey: string;
            invocationDigest: string;
            pair: string;
            target: string;
            threadId: string;
            mode: "notify" | "ask" | "reply";
            priority: "normal" | "interrupt";
            at: number;
            nextAttemptAt?: number | undefined;
        }>;
        dedupe: import("@deepseek-ai/dsh-storage-domain").DomainTableSpec<string, {
            id: string;
            invocationKey: string;
            invocationDigest: string;
            messageId: string;
            at: number;
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
        }>;
        read_state: import("@deepseek-ai/dsh-storage-domain").DomainTableSpec<string, {
            id: string;
            sessionId: string;
            throughSeq: number;
            revision: number;
        }>;
    };
};
export type MessagingDomain = Domain<typeof messagingDomain>;
export declare const keyOf: (key: {
    botId: string;
    botCreatedAt: number;
}) => string;
export declare class MessageStore {
    readonly domain: MessagingDomain;
    readonly config: MessagingConfig;
    private now;
    private state;
    private closing?;
    constructor(domain: MessagingDomain, config: MessagingConfig, now?: () => number);
    run<T>(work: () => Promise<T>): Promise<T>;
    rows(): MessageRecord[];
    get(id: string): {
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
    } | undefined;
    byInvocation(invocationKey: string, invocationDigest: string): {
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
    } | undefined;
    accept(value: MessageRecord): Promise<MessageRecord>;
    private index;
    update(id: string, patch: Partial<Omit<MessageRecord, 'envelope' | 'nativeInput' | 'outgoingInput' | 'invocationKey' | 'invocationDigest' | 'revision'>>, expectedRevision?: number): Promise<{
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
    }>;
    reconcile(): Promise<void>;
    compact(): Promise<void>;
    close(): Promise<void>;
}
