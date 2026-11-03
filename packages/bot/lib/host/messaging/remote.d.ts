import type { Context } from '@deepseek-ai/cordis';
import { TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol';
import { type MessageRequest } from '../../shared/messaging-contract.js';
import type { Messaging } from './service.js';
export declare const MESSAGING_HOST: {
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
export declare class MessagingRemote extends TypertRemoteService {
    private messaging?;
    static inject: string[];
    constructor(ctx: Context, messaging?: Messaging | undefined);
    request(value: MessageRequest): Promise<{
        enabled: boolean;
        nestedMessaging: false;
        pending: number;
        items: {
            lastErrorCode?: string | undefined;
            envelope: {
                content: undefined;
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
                authorizedTargets?: {
                    botId: string;
                    botCreatedAt: number;
                }[] | undefined;
            };
            revision: number;
            delivery: "unknown" | "failed" | "expired" | "delivered" | "queued" | "delivering" | "canceled";
            processing: "pending" | "unknown" | "completed" | "interrupted" | "claimed";
            response: "not-required" | "waiting" | "reply-queued" | "replied" | "timed-out";
        }[];
    }>;
    private change;
    private overview;
}
declare module '@deepseek-ai/cordis' {
    interface Context {
        dshBotMessagingRemote: MessagingRemote;
    }
}
