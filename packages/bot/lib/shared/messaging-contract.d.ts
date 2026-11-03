import { z } from 'zod';
import type { RemoteResult } from '@deepseek-ai/dsh-typert-protocol';
export declare const messageRequestSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    action: z.ZodLiteral<"list">;
    botId: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    action: z.ZodEnum<{
        cancel: "cancel";
        retry: "retry";
    }>;
    id: z.ZodString;
    revision: z.ZodNumber;
}, z.core.$strict>], "action">;
export declare const messageOverviewSchema: z.ZodObject<{
    enabled: z.ZodBoolean;
    pending: z.ZodNumber;
    nestedMessaging: z.ZodLiteral<false>;
    items: z.ZodArray<z.ZodObject<{
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
        lastErrorCode: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type MessageOverview = z.output<typeof messageOverviewSchema>;
export type MessageRequest = z.output<typeof messageRequestSchema>;
export declare const MESSAGING_REMOTE: import("@deepseek-ai/dsh-typert-protocol").TypertRemoteInfo<Readonly<Record<string, import("@deepseek-ai/dsh-typert-protocol").TypertRemoteMethod<object, unknown, "unary", never, unknown> | import("@deepseek-ai/dsh-typert-protocol").TypertRemoteMethod<object, unknown, "stream", unknown, unknown>>>>;
export interface MessageMethods {
    request(input: MessageRequest): Promise<RemoteResult<MessageOverview>>;
}
declare module '@deepseek-ai/dsh-typert-protocol' {
    interface TypertRemoteMap {
        'dshBot.messaging/request': MessageMethods['request'];
    }
    interface TypertRemoteNamespaceMap {
        'dshBot.messaging': MessageMethods;
    }
}
