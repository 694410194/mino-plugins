import type { Context } from '@deepseek-ai/cordis';
import type { MemoryKernel } from '../memory/op-log.js';
export declare function outletInventory(ctx: Context): {
    count: number;
    stamp: {
        messages: {
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
        }[];
        notifications: {
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
    };
};
/** The preview counts these conservative copies. Preserve random identity/dedup barriers, erase content and hashes. */
export declare function eraseOutletCopies(ctx: Context, kernel: MemoryKernel): Promise<void>;
