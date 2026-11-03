import { z } from 'zod';
export declare const messageInputSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    action: z.ZodLiteral<"list">;
    cursor: z.ZodOptional<z.ZodString>;
    limit: z.ZodDefault<z.ZodNumber>;
}, z.core.$strict>, z.ZodObject<{
    action: z.ZodLiteral<"send">;
    to: z.ZodString;
    content: z.ZodString;
    mode: z.ZodEnum<{
        notify: "notify";
        ask: "ask";
    }>;
    priority: z.ZodDefault<z.ZodEnum<{
        normal: "normal";
        interrupt: "interrupt";
    }>>;
    inReplyToContext: z.ZodOptional<z.ZodString>;
}, z.core.$strict>, z.ZodObject<{
    action: z.ZodLiteral<"reply">;
    replyTo: z.ZodString;
    content: z.ZodString;
}, z.core.$strict>], "action">;
export type MessageInput = z.output<typeof messageInputSchema>;
export declare const envelopeSchema: z.ZodObject<{
    schemaVersion: z.ZodLiteral<1>;
    id: z.ZodString;
    from: z.ZodObject<{
        botId: z.ZodString;
        botCreatedAt: z.ZodNumber;
    }, z.core.$strict>;
    to: z.ZodObject<{
        botId: z.ZodString;
        botCreatedAt: z.ZodNumber;
    }, z.core.$strict>;
    fromSessionId: z.ZodString;
    toSessionId: z.ZodString;
    threadId: z.ZodString;
    correlationId: z.ZodString;
    parentMessageId: z.ZodOptional<z.ZodString>;
    replyTo: z.ZodOptional<z.ZodString>;
    origin: z.ZodObject<{
        bot: z.ZodObject<{
            botId: z.ZodString;
            botCreatedAt: z.ZodNumber;
        }, z.core.$strict>;
        sessionId: z.ZodString;
        userMessageId: z.ZodString;
    }, z.core.$strict>;
    hop: z.ZodNumber;
    depth: z.ZodNumber;
    mode: z.ZodEnum<{
        notify: "notify";
        ask: "ask";
        reply: "reply";
    }>;
    priority: z.ZodEnum<{
        normal: "normal";
        interrupt: "interrupt";
    }>;
    ts: z.ZodNumber;
    expiresAt: z.ZodNumber;
    path: z.ZodArray<z.ZodObject<{
        botId: z.ZodString;
        botCreatedAt: z.ZodNumber;
    }, z.core.$strict>>;
    content: z.ZodOptional<z.ZodString>;
    contentDigest: z.ZodString;
    fromDisplay: z.ZodObject<{
        name: z.ZodString;
        avatarVariant: z.ZodOptional<z.ZodEnum<{
            classic: "classic";
            glasses: "glasses";
            spout: "spout";
            baby: "baby";
            hat: "hat";
            sleeping: "sleeping";
            auto: "auto";
        }>>;
        avatarColor: z.ZodOptional<z.ZodEnum<{
            "--dsw-alias-state-business-primary": "--dsw-alias-state-business-primary";
            "--dsw-alias-state-success-primary": "--dsw-alias-state-success-primary";
            "--dsw-alias-state-warn-label": "--dsw-alias-state-warn-label";
            "--dsw-alias-state-error-primary": "--dsw-alias-state-error-primary";
            teal: "teal";
            cyan: "cyan";
            indigo: "indigo";
            purple: "purple";
            rose: "rose";
            orange: "orange";
            olive: "olive";
            slate: "slate";
        }>>;
    }, z.core.$strict>;
    toDisplay: z.ZodObject<{
        name: z.ZodString;
        avatarVariant: z.ZodOptional<z.ZodEnum<{
            classic: "classic";
            glasses: "glasses";
            spout: "spout";
            baby: "baby";
            hat: "hat";
            sleeping: "sleeping";
            auto: "auto";
        }>>;
        avatarColor: z.ZodOptional<z.ZodEnum<{
            "--dsw-alias-state-business-primary": "--dsw-alias-state-business-primary";
            "--dsw-alias-state-success-primary": "--dsw-alias-state-success-primary";
            "--dsw-alias-state-warn-label": "--dsw-alias-state-warn-label";
            "--dsw-alias-state-error-primary": "--dsw-alias-state-error-primary";
            teal: "teal";
            cyan: "cyan";
            indigo: "indigo";
            purple: "purple";
            rose: "rose";
            orange: "orange";
            olive: "olive";
            slate: "slate";
        }>>;
    }, z.core.$strict>;
    authorizationId: z.ZodString;
    authorizedTargets: z.ZodOptional<z.ZodArray<z.ZodObject<{
        botId: z.ZodString;
        botCreatedAt: z.ZodNumber;
    }, z.core.$strict>>>;
}, z.core.$strict>;
export type MessageEnvelope = z.output<typeof envelopeSchema>;
export declare const messageSourceSchema: z.ZodObject<{
    kind: z.ZodEnum<{
        "dsh-bot-message": "dsh-bot-message";
        "dsh-bot-message-sent": "dsh-bot-message-sent";
    }>;
    form: z.ZodEnum<{
        notice: "notice";
        relay: "relay";
    }>;
    summary: z.ZodOptional<z.ZodString>;
    messageId: z.ZodString;
    threadId: z.ZodString;
    replyTo: z.ZodOptional<z.ZodString>;
    from: z.ZodObject<{
        botId: z.ZodString;
        botCreatedAt: z.ZodNumber;
    }, z.core.$strict>;
    to: z.ZodObject<{
        botId: z.ZodString;
        botCreatedAt: z.ZodNumber;
    }, z.core.$strict>;
    fromSessionId: z.ZodString;
    toSessionId: z.ZodString;
    hop: z.ZodNumber;
    mode: z.ZodEnum<{
        notify: "notify";
        ask: "ask";
        reply: "reply";
    }>;
    priority: z.ZodEnum<{
        normal: "normal";
        interrupt: "interrupt";
    }>;
    displaySnapshots: z.ZodObject<{
        from: z.ZodObject<{
            name: z.ZodString;
            avatarVariant: z.ZodOptional<z.ZodEnum<{
                classic: "classic";
                glasses: "glasses";
                spout: "spout";
                baby: "baby";
                hat: "hat";
                sleeping: "sleeping";
                auto: "auto";
            }>>;
            avatarColor: z.ZodOptional<z.ZodEnum<{
                "--dsw-alias-state-business-primary": "--dsw-alias-state-business-primary";
                "--dsw-alias-state-success-primary": "--dsw-alias-state-success-primary";
                "--dsw-alias-state-warn-label": "--dsw-alias-state-warn-label";
                "--dsw-alias-state-error-primary": "--dsw-alias-state-error-primary";
                teal: "teal";
                cyan: "cyan";
                indigo: "indigo";
                purple: "purple";
                rose: "rose";
                orange: "orange";
                olive: "olive";
                slate: "slate";
            }>>;
        }, z.core.$strict>;
        to: z.ZodObject<{
            name: z.ZodString;
            avatarVariant: z.ZodOptional<z.ZodEnum<{
                classic: "classic";
                glasses: "glasses";
                spout: "spout";
                baby: "baby";
                hat: "hat";
                sleeping: "sleeping";
                auto: "auto";
            }>>;
            avatarColor: z.ZodOptional<z.ZodEnum<{
                "--dsw-alias-state-business-primary": "--dsw-alias-state-business-primary";
                "--dsw-alias-state-success-primary": "--dsw-alias-state-success-primary";
                "--dsw-alias-state-warn-label": "--dsw-alias-state-warn-label";
                "--dsw-alias-state-error-primary": "--dsw-alias-state-error-primary";
                teal: "teal";
                cyan: "cyan";
                indigo: "indigo";
                purple: "purple";
                rose: "rose";
                orange: "orange";
                olive: "olive";
                slate: "slate";
            }>>;
        }, z.core.$strict>;
    }, z.core.$strict>;
}, z.core.$strict>;
export declare const wakeSourceSchema: z.ZodObject<{
    kind: z.ZodLiteral<"dsh-bot-message-wake">;
    form: z.ZodLiteral<"notice">;
    summary: z.ZodString;
    messageId: z.ZodString;
    generation: z.ZodString;
    toSessionId: z.ZodString;
}, z.core.$strict>;
export type MessageSource = z.output<typeof messageSourceSchema>;
declare module '@deepseek-ai/dsh-llm' {
    interface MessageSourceMap {
        'dsh-bot-message': MessageSource & {
            kind: 'dsh-bot-message';
        };
        'dsh-bot-message-sent': MessageSource & {
            kind: 'dsh-bot-message-sent';
        };
        'dsh-bot-message-wake': z.output<typeof wakeSourceSchema>;
    }
}
export declare const nativeMessageSchema: z.ZodObject<{
    id: z.ZodString;
    role: z.ZodLiteral<"user">;
    source: z.ZodObject<{
        kind: z.ZodEnum<{
            "dsh-bot-message": "dsh-bot-message";
            "dsh-bot-message-sent": "dsh-bot-message-sent";
        }>;
        form: z.ZodEnum<{
            notice: "notice";
            relay: "relay";
        }>;
        summary: z.ZodOptional<z.ZodString>;
        messageId: z.ZodString;
        threadId: z.ZodString;
        replyTo: z.ZodOptional<z.ZodString>;
        from: z.ZodObject<{
            botId: z.ZodString;
            botCreatedAt: z.ZodNumber;
        }, z.core.$strict>;
        to: z.ZodObject<{
            botId: z.ZodString;
            botCreatedAt: z.ZodNumber;
        }, z.core.$strict>;
        fromSessionId: z.ZodString;
        toSessionId: z.ZodString;
        hop: z.ZodNumber;
        mode: z.ZodEnum<{
            notify: "notify";
            ask: "ask";
            reply: "reply";
        }>;
        priority: z.ZodEnum<{
            normal: "normal";
            interrupt: "interrupt";
        }>;
        displaySnapshots: z.ZodObject<{
            from: z.ZodObject<{
                name: z.ZodString;
                avatarVariant: z.ZodOptional<z.ZodEnum<{
                    classic: "classic";
                    glasses: "glasses";
                    spout: "spout";
                    baby: "baby";
                    hat: "hat";
                    sleeping: "sleeping";
                    auto: "auto";
                }>>;
                avatarColor: z.ZodOptional<z.ZodEnum<{
                    "--dsw-alias-state-business-primary": "--dsw-alias-state-business-primary";
                    "--dsw-alias-state-success-primary": "--dsw-alias-state-success-primary";
                    "--dsw-alias-state-warn-label": "--dsw-alias-state-warn-label";
                    "--dsw-alias-state-error-primary": "--dsw-alias-state-error-primary";
                    teal: "teal";
                    cyan: "cyan";
                    indigo: "indigo";
                    purple: "purple";
                    rose: "rose";
                    orange: "orange";
                    olive: "olive";
                    slate: "slate";
                }>>;
            }, z.core.$strict>;
            to: z.ZodObject<{
                name: z.ZodString;
                avatarVariant: z.ZodOptional<z.ZodEnum<{
                    classic: "classic";
                    glasses: "glasses";
                    spout: "spout";
                    baby: "baby";
                    hat: "hat";
                    sleeping: "sleeping";
                    auto: "auto";
                }>>;
                avatarColor: z.ZodOptional<z.ZodEnum<{
                    "--dsw-alias-state-business-primary": "--dsw-alias-state-business-primary";
                    "--dsw-alias-state-success-primary": "--dsw-alias-state-success-primary";
                    "--dsw-alias-state-warn-label": "--dsw-alias-state-warn-label";
                    "--dsw-alias-state-error-primary": "--dsw-alias-state-error-primary";
                    teal: "teal";
                    cyan: "cyan";
                    indigo: "indigo";
                    purple: "purple";
                    rose: "rose";
                    orange: "orange";
                    olive: "olive";
                    slate: "slate";
                }>>;
            }, z.core.$strict>;
        }, z.core.$strict>;
    }, z.core.$strict>;
    content: z.ZodArray<z.ZodObject<{
        type: z.ZodLiteral<"text">;
        text: z.ZodString;
    }, z.core.$strict>>;
}, z.core.$strict>;
export declare const messageRecordSchema: z.ZodObject<{
    envelope: z.ZodObject<{
        schemaVersion: z.ZodLiteral<1>;
        id: z.ZodString;
        from: z.ZodObject<{
            botId: z.ZodString;
            botCreatedAt: z.ZodNumber;
        }, z.core.$strict>;
        to: z.ZodObject<{
            botId: z.ZodString;
            botCreatedAt: z.ZodNumber;
        }, z.core.$strict>;
        fromSessionId: z.ZodString;
        toSessionId: z.ZodString;
        threadId: z.ZodString;
        correlationId: z.ZodString;
        parentMessageId: z.ZodOptional<z.ZodString>;
        replyTo: z.ZodOptional<z.ZodString>;
        origin: z.ZodObject<{
            bot: z.ZodObject<{
                botId: z.ZodString;
                botCreatedAt: z.ZodNumber;
            }, z.core.$strict>;
            sessionId: z.ZodString;
            userMessageId: z.ZodString;
        }, z.core.$strict>;
        hop: z.ZodNumber;
        depth: z.ZodNumber;
        mode: z.ZodEnum<{
            notify: "notify";
            ask: "ask";
            reply: "reply";
        }>;
        priority: z.ZodEnum<{
            normal: "normal";
            interrupt: "interrupt";
        }>;
        ts: z.ZodNumber;
        expiresAt: z.ZodNumber;
        path: z.ZodArray<z.ZodObject<{
            botId: z.ZodString;
            botCreatedAt: z.ZodNumber;
        }, z.core.$strict>>;
        content: z.ZodOptional<z.ZodString>;
        contentDigest: z.ZodString;
        fromDisplay: z.ZodObject<{
            name: z.ZodString;
            avatarVariant: z.ZodOptional<z.ZodEnum<{
                classic: "classic";
                glasses: "glasses";
                spout: "spout";
                baby: "baby";
                hat: "hat";
                sleeping: "sleeping";
                auto: "auto";
            }>>;
            avatarColor: z.ZodOptional<z.ZodEnum<{
                "--dsw-alias-state-business-primary": "--dsw-alias-state-business-primary";
                "--dsw-alias-state-success-primary": "--dsw-alias-state-success-primary";
                "--dsw-alias-state-warn-label": "--dsw-alias-state-warn-label";
                "--dsw-alias-state-error-primary": "--dsw-alias-state-error-primary";
                teal: "teal";
                cyan: "cyan";
                indigo: "indigo";
                purple: "purple";
                rose: "rose";
                orange: "orange";
                olive: "olive";
                slate: "slate";
            }>>;
        }, z.core.$strict>;
        toDisplay: z.ZodObject<{
            name: z.ZodString;
            avatarVariant: z.ZodOptional<z.ZodEnum<{
                classic: "classic";
                glasses: "glasses";
                spout: "spout";
                baby: "baby";
                hat: "hat";
                sleeping: "sleeping";
                auto: "auto";
            }>>;
            avatarColor: z.ZodOptional<z.ZodEnum<{
                "--dsw-alias-state-business-primary": "--dsw-alias-state-business-primary";
                "--dsw-alias-state-success-primary": "--dsw-alias-state-success-primary";
                "--dsw-alias-state-warn-label": "--dsw-alias-state-warn-label";
                "--dsw-alias-state-error-primary": "--dsw-alias-state-error-primary";
                teal: "teal";
                cyan: "cyan";
                indigo: "indigo";
                purple: "purple";
                rose: "rose";
                orange: "orange";
                olive: "olive";
                slate: "slate";
            }>>;
        }, z.core.$strict>;
        authorizationId: z.ZodString;
        authorizedTargets: z.ZodOptional<z.ZodArray<z.ZodObject<{
            botId: z.ZodString;
            botCreatedAt: z.ZodNumber;
        }, z.core.$strict>>>;
    }, z.core.$strict>;
    nativeInput: z.ZodOptional<z.ZodObject<{
        id: z.ZodString;
        role: z.ZodLiteral<"user">;
        source: z.ZodObject<{
            kind: z.ZodEnum<{
                "dsh-bot-message": "dsh-bot-message";
                "dsh-bot-message-sent": "dsh-bot-message-sent";
            }>;
            form: z.ZodEnum<{
                notice: "notice";
                relay: "relay";
            }>;
            summary: z.ZodOptional<z.ZodString>;
            messageId: z.ZodString;
            threadId: z.ZodString;
            replyTo: z.ZodOptional<z.ZodString>;
            from: z.ZodObject<{
                botId: z.ZodString;
                botCreatedAt: z.ZodNumber;
            }, z.core.$strict>;
            to: z.ZodObject<{
                botId: z.ZodString;
                botCreatedAt: z.ZodNumber;
            }, z.core.$strict>;
            fromSessionId: z.ZodString;
            toSessionId: z.ZodString;
            hop: z.ZodNumber;
            mode: z.ZodEnum<{
                notify: "notify";
                ask: "ask";
                reply: "reply";
            }>;
            priority: z.ZodEnum<{
                normal: "normal";
                interrupt: "interrupt";
            }>;
            displaySnapshots: z.ZodObject<{
                from: z.ZodObject<{
                    name: z.ZodString;
                    avatarVariant: z.ZodOptional<z.ZodEnum<{
                        classic: "classic";
                        glasses: "glasses";
                        spout: "spout";
                        baby: "baby";
                        hat: "hat";
                        sleeping: "sleeping";
                        auto: "auto";
                    }>>;
                    avatarColor: z.ZodOptional<z.ZodEnum<{
                        "--dsw-alias-state-business-primary": "--dsw-alias-state-business-primary";
                        "--dsw-alias-state-success-primary": "--dsw-alias-state-success-primary";
                        "--dsw-alias-state-warn-label": "--dsw-alias-state-warn-label";
                        "--dsw-alias-state-error-primary": "--dsw-alias-state-error-primary";
                        teal: "teal";
                        cyan: "cyan";
                        indigo: "indigo";
                        purple: "purple";
                        rose: "rose";
                        orange: "orange";
                        olive: "olive";
                        slate: "slate";
                    }>>;
                }, z.core.$strict>;
                to: z.ZodObject<{
                    name: z.ZodString;
                    avatarVariant: z.ZodOptional<z.ZodEnum<{
                        classic: "classic";
                        glasses: "glasses";
                        spout: "spout";
                        baby: "baby";
                        hat: "hat";
                        sleeping: "sleeping";
                        auto: "auto";
                    }>>;
                    avatarColor: z.ZodOptional<z.ZodEnum<{
                        "--dsw-alias-state-business-primary": "--dsw-alias-state-business-primary";
                        "--dsw-alias-state-success-primary": "--dsw-alias-state-success-primary";
                        "--dsw-alias-state-warn-label": "--dsw-alias-state-warn-label";
                        "--dsw-alias-state-error-primary": "--dsw-alias-state-error-primary";
                        teal: "teal";
                        cyan: "cyan";
                        indigo: "indigo";
                        purple: "purple";
                        rose: "rose";
                        orange: "orange";
                        olive: "olive";
                        slate: "slate";
                    }>>;
                }, z.core.$strict>;
            }, z.core.$strict>;
        }, z.core.$strict>;
        content: z.ZodArray<z.ZodObject<{
            type: z.ZodLiteral<"text">;
            text: z.ZodString;
        }, z.core.$strict>>;
    }, z.core.$strict>>;
    outgoingInput: z.ZodOptional<z.ZodObject<{
        id: z.ZodString;
        role: z.ZodLiteral<"user">;
        source: z.ZodObject<{
            kind: z.ZodEnum<{
                "dsh-bot-message": "dsh-bot-message";
                "dsh-bot-message-sent": "dsh-bot-message-sent";
            }>;
            form: z.ZodEnum<{
                notice: "notice";
                relay: "relay";
            }>;
            summary: z.ZodOptional<z.ZodString>;
            messageId: z.ZodString;
            threadId: z.ZodString;
            replyTo: z.ZodOptional<z.ZodString>;
            from: z.ZodObject<{
                botId: z.ZodString;
                botCreatedAt: z.ZodNumber;
            }, z.core.$strict>;
            to: z.ZodObject<{
                botId: z.ZodString;
                botCreatedAt: z.ZodNumber;
            }, z.core.$strict>;
            fromSessionId: z.ZodString;
            toSessionId: z.ZodString;
            hop: z.ZodNumber;
            mode: z.ZodEnum<{
                notify: "notify";
                ask: "ask";
                reply: "reply";
            }>;
            priority: z.ZodEnum<{
                normal: "normal";
                interrupt: "interrupt";
            }>;
            displaySnapshots: z.ZodObject<{
                from: z.ZodObject<{
                    name: z.ZodString;
                    avatarVariant: z.ZodOptional<z.ZodEnum<{
                        classic: "classic";
                        glasses: "glasses";
                        spout: "spout";
                        baby: "baby";
                        hat: "hat";
                        sleeping: "sleeping";
                        auto: "auto";
                    }>>;
                    avatarColor: z.ZodOptional<z.ZodEnum<{
                        "--dsw-alias-state-business-primary": "--dsw-alias-state-business-primary";
                        "--dsw-alias-state-success-primary": "--dsw-alias-state-success-primary";
                        "--dsw-alias-state-warn-label": "--dsw-alias-state-warn-label";
                        "--dsw-alias-state-error-primary": "--dsw-alias-state-error-primary";
                        teal: "teal";
                        cyan: "cyan";
                        indigo: "indigo";
                        purple: "purple";
                        rose: "rose";
                        orange: "orange";
                        olive: "olive";
                        slate: "slate";
                    }>>;
                }, z.core.$strict>;
                to: z.ZodObject<{
                    name: z.ZodString;
                    avatarVariant: z.ZodOptional<z.ZodEnum<{
                        classic: "classic";
                        glasses: "glasses";
                        spout: "spout";
                        baby: "baby";
                        hat: "hat";
                        sleeping: "sleeping";
                        auto: "auto";
                    }>>;
                    avatarColor: z.ZodOptional<z.ZodEnum<{
                        "--dsw-alias-state-business-primary": "--dsw-alias-state-business-primary";
                        "--dsw-alias-state-success-primary": "--dsw-alias-state-success-primary";
                        "--dsw-alias-state-warn-label": "--dsw-alias-state-warn-label";
                        "--dsw-alias-state-error-primary": "--dsw-alias-state-error-primary";
                        teal: "teal";
                        cyan: "cyan";
                        indigo: "indigo";
                        purple: "purple";
                        rose: "rose";
                        orange: "orange";
                        olive: "olive";
                        slate: "slate";
                    }>>;
                }, z.core.$strict>;
            }, z.core.$strict>;
        }, z.core.$strict>;
        content: z.ZodArray<z.ZodObject<{
            type: z.ZodLiteral<"text">;
            text: z.ZodString;
        }, z.core.$strict>>;
    }, z.core.$strict>>;
    flowId: z.ZodOptional<z.ZodUUID>;
    invocationKey: z.ZodString;
    invocationDigest: z.ZodString;
    revision: z.ZodNumber;
    delivery: z.ZodEnum<{
        unknown: "unknown";
        failed: "failed";
        expired: "expired";
        delivered: "delivered";
        queued: "queued";
        delivering: "delivering";
        canceled: "canceled";
    }>;
    processing: z.ZodEnum<{
        pending: "pending";
        unknown: "unknown";
        completed: "completed";
        interrupted: "interrupted";
        claimed: "claimed";
    }>;
    response: z.ZodEnum<{
        "not-required": "not-required";
        waiting: "waiting";
        "reply-queued": "reply-queued";
        replied: "replied";
        "timed-out": "timed-out";
    }>;
    nativeRef: z.ZodOptional<z.ZodObject<{
        sessionId: z.ZodString;
        messageId: z.ZodString;
        seq: z.ZodOptional<z.ZodNumber>;
        turn: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strict>>;
    outgoingRef: z.ZodOptional<z.ZodObject<{
        sessionId: z.ZodString;
        messageId: z.ZodString;
        seq: z.ZodOptional<z.ZodNumber>;
        turn: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strict>>;
    lastErrorCode: z.ZodOptional<z.ZodString>;
    nextAttemptAt: z.ZodOptional<z.ZodNumber>;
    claimedTurn: z.ZodOptional<z.ZodNumber>;
    interrupt: z.ZodOptional<z.ZodEnum<{
        pending: "pending";
        unknown: "unknown";
        stopped: "stopped";
        disabled: "disabled";
        requested: "requested";
        issued: "issued";
    }>>;
    retainedAt: z.ZodOptional<z.ZodNumber>;
    retryCount: z.ZodDefault<z.ZodNumber>;
    interruptTurn: z.ZodOptional<z.ZodNumber>;
    interruptDeadlineAt: z.ZodOptional<z.ZodNumber>;
}, z.core.$strict>;
export type MessageRecord = z.output<typeof messageRecordSchema>;
export declare const threadSchema: z.ZodObject<{
    id: z.ZodString;
    rootId: z.ZodString;
    authorizationId: z.ZodString;
    count: z.ZodNumber;
    openAsks: z.ZodArray<z.ZodString>;
    deadline: z.ZodNumber;
    closed: z.ZodBoolean;
    revision: z.ZodNumber;
}, z.core.$strict>;
export declare const reservationSchema: z.ZodObject<{
    id: z.ZodString;
    invocationKey: z.ZodString;
    invocationDigest: z.ZodString;
    pair: z.ZodString;
    target: z.ZodString;
    threadId: z.ZodString;
    mode: z.ZodEnum<{
        notify: "notify";
        ask: "ask";
        reply: "reply";
    }>;
    priority: z.ZodEnum<{
        normal: "normal";
        interrupt: "interrupt";
    }>;
    at: z.ZodNumber;
    nextAttemptAt: z.ZodOptional<z.ZodNumber>;
}, z.core.$strict>;
export declare const dedupeSchema: z.ZodObject<{
    id: z.ZodString;
    invocationKey: z.ZodString;
    invocationDigest: z.ZodString;
    messageId: z.ZodString;
    at: z.ZodNumber;
    nativeRef: z.ZodOptional<z.ZodObject<{
        sessionId: z.ZodString;
        messageId: z.ZodString;
        seq: z.ZodOptional<z.ZodNumber>;
        turn: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strict>>;
    outgoingRef: z.ZodOptional<z.ZodObject<{
        sessionId: z.ZodString;
        messageId: z.ZodString;
        seq: z.ZodOptional<z.ZodNumber>;
        turn: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export declare const readStateSchema: z.ZodObject<{
    id: z.ZodString;
    sessionId: z.ZodString;
    throughSeq: z.ZodNumber;
    revision: z.ZodNumber;
}, z.core.$strict>;
export declare const messageReceiptSchema: z.ZodObject<{
    messageId: z.ZodString;
    threadId: z.ZodString;
    status: z.ZodLiteral<"queued">;
    mode: z.ZodEnum<{
        notify: "notify";
        ask: "ask";
        reply: "reply";
    }>;
}, z.core.$strict>;
export type MessageReceipt = z.output<typeof messageReceiptSchema>;
export declare const messagingCodecs: {
    input: {
        encode: (value: unknown) => {
            action: "list";
            limit: number;
            cursor?: string | undefined;
        } | {
            action: "send";
            to: string;
            content: string;
            mode: "notify" | "ask";
            priority: "normal" | "interrupt";
            inReplyToContext?: string | undefined;
        } | {
            action: "reply";
            replyTo: string;
            content: string;
        };
        decode: (value: unknown) => {
            action: "list";
            limit: number;
            cursor?: string | undefined;
        } | {
            action: "send";
            to: string;
            content: string;
            mode: "notify" | "ask";
            priority: "normal" | "interrupt";
            inReplyToContext?: string | undefined;
        } | {
            action: "reply";
            replyTo: string;
            content: string;
        };
    };
    receipt: {
        encode: (value: unknown) => {
            messageId: string;
            threadId: string;
            status: "queued";
            mode: "notify" | "ask" | "reply";
        };
        decode: (value: unknown) => {
            messageId: string;
            threadId: string;
            status: "queued";
            mode: "notify" | "ask" | "reply";
        };
    };
};
