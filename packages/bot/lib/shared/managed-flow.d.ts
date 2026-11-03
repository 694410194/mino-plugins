import { z } from 'zod';
export declare const outletSchema: z.ZodEnum<{
    message: "message";
    "group-input": "group-input";
    "group-result": "group-result";
    "delegate-input": "delegate-input";
    "delegate-result": "delegate-result";
    "notify-record": "notify-record";
    "notify-send": "notify-send";
    "mcp-copy": "mcp-copy";
    connector: "connector";
    "auto-share": "auto-share";
}>;
export type Outlet = z.output<typeof outletSchema>;
export declare const flowEnvelopeSchema: z.ZodObject<{
    binding: z.ZodObject<{
        userScope: z.ZodUUID;
        bot: z.ZodObject<{
            botId: z.ZodString;
            botCreatedAt: z.ZodNumber;
        }, z.core.$strict>;
        invocation: z.ZodString;
        payloadVersion: z.ZodUUID;
        sourceVersions: z.ZodArray<z.ZodUUID>;
        sourceRefs: z.ZodArray<z.ZodObject<{
            sessionId: z.ZodOptional<z.ZodString>;
            eventSeq: z.ZodOptional<z.ZodNumber>;
            callId: z.ZodOptional<z.ZodString>;
            parentVersionId: z.ZodOptional<z.ZodUUID>;
            entryReceiptId: z.ZodOptional<z.ZodUUID>;
            managementOpId: z.ZodOptional<z.ZodUUID>;
        }, z.core.$strict>>;
        target: z.ZodDiscriminatedUnion<[z.ZodObject<{
            kind: z.ZodLiteral<"bot">;
            bot: z.ZodObject<{
                botId: z.ZodString;
                botCreatedAt: z.ZodNumber;
            }, z.core.$strict>;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"shared">;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"group">;
            groupId: z.ZodString;
            groupCreatedAt: z.ZodNumber;
            members: z.ZodArray<z.ZodObject<{
                botId: z.ZodString;
                botCreatedAt: z.ZodNumber;
            }, z.core.$strict>>;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"external">;
            destination: z.ZodString;
        }, z.core.$strict>], "kind">;
        epoch: z.ZodNumber;
        policyRevision: z.ZodNumber;
    }, z.core.$strict>;
    label: z.ZodObject<{
        readers: z.ZodUnion<readonly [z.ZodLiteral<"shared">, z.ZodArray<z.ZodObject<{
            botId: z.ZodString;
            botCreatedAt: z.ZodNumber;
        }, z.core.$strict>>]>;
        originTrust: z.ZodEnum<{
            candidate: "candidate";
            user_stated: "user_stated";
            user_confirmed: "user_confirmed";
        }>;
        sourceVersions: z.ZodArray<z.ZodUUID>;
        restrictions: z.ZodArray<z.ZodEnum<{
            secret: "secret";
            "no-egress": "no-egress";
            "pending-cleanup": "pending-cleanup";
            revoked: "revoked";
        }>>;
        grants: z.ZodArray<z.ZodUUID>;
    }, z.core.$strict>;
    content: z.ZodString;
    outlet: z.ZodEnum<{
        message: "message";
        "group-input": "group-input";
        "group-result": "group-result";
        "delegate-input": "delegate-input";
        "delegate-result": "delegate-result";
        "notify-record": "notify-record";
        "notify-send": "notify-send";
        "mcp-copy": "mcp-copy";
        connector: "connector";
        "auto-share": "auto-share";
    }>;
}, z.core.$strict>;
export type FlowEnvelope = z.output<typeof flowEnvelopeSchema>;
export declare const flowRecordSchema: z.ZodObject<{
    id: z.ZodUUID;
    state: z.ZodEnum<{
        unknown: "unknown";
        dispatching: "dispatching";
        admitted: "admitted";
        delivered: "delivered";
        cancelled: "cancelled";
    }>;
    envelope: z.ZodOptional<z.ZodObject<{
        binding: z.ZodObject<{
            userScope: z.ZodUUID;
            bot: z.ZodObject<{
                botId: z.ZodString;
                botCreatedAt: z.ZodNumber;
            }, z.core.$strict>;
            invocation: z.ZodString;
            payloadVersion: z.ZodUUID;
            sourceVersions: z.ZodArray<z.ZodUUID>;
            sourceRefs: z.ZodArray<z.ZodObject<{
                sessionId: z.ZodOptional<z.ZodString>;
                eventSeq: z.ZodOptional<z.ZodNumber>;
                callId: z.ZodOptional<z.ZodString>;
                parentVersionId: z.ZodOptional<z.ZodUUID>;
                entryReceiptId: z.ZodOptional<z.ZodUUID>;
                managementOpId: z.ZodOptional<z.ZodUUID>;
            }, z.core.$strict>>;
            target: z.ZodDiscriminatedUnion<[z.ZodObject<{
                kind: z.ZodLiteral<"bot">;
                bot: z.ZodObject<{
                    botId: z.ZodString;
                    botCreatedAt: z.ZodNumber;
                }, z.core.$strict>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"shared">;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"group">;
                groupId: z.ZodString;
                groupCreatedAt: z.ZodNumber;
                members: z.ZodArray<z.ZodObject<{
                    botId: z.ZodString;
                    botCreatedAt: z.ZodNumber;
                }, z.core.$strict>>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"external">;
                destination: z.ZodString;
            }, z.core.$strict>], "kind">;
            epoch: z.ZodNumber;
            policyRevision: z.ZodNumber;
        }, z.core.$strict>;
        label: z.ZodObject<{
            readers: z.ZodUnion<readonly [z.ZodLiteral<"shared">, z.ZodArray<z.ZodObject<{
                botId: z.ZodString;
                botCreatedAt: z.ZodNumber;
            }, z.core.$strict>>]>;
            originTrust: z.ZodEnum<{
                candidate: "candidate";
                user_stated: "user_stated";
                user_confirmed: "user_confirmed";
            }>;
            sourceVersions: z.ZodArray<z.ZodUUID>;
            restrictions: z.ZodArray<z.ZodEnum<{
                secret: "secret";
                "no-egress": "no-egress";
                "pending-cleanup": "pending-cleanup";
                revoked: "revoked";
            }>>;
            grants: z.ZodArray<z.ZodUUID>;
        }, z.core.$strict>;
        content: z.ZodString;
        outlet: z.ZodEnum<{
            message: "message";
            "group-input": "group-input";
            "group-result": "group-result";
            "delegate-input": "delegate-input";
            "delegate-result": "delegate-result";
            "notify-record": "notify-record";
            "notify-send": "notify-send";
            "mcp-copy": "mcp-copy";
            connector: "connector";
            "auto-share": "auto-share";
        }>;
    }, z.core.$strict>>;
    grantUse: z.ZodOptional<z.ZodUUID>;
}, z.core.$strict>;
export type FlowRecord = z.output<typeof flowRecordSchema>;
export declare const flowSessionSchema: z.ZodObject<{
    sessionId: z.ZodString;
    label: z.ZodObject<{
        readers: z.ZodUnion<readonly [z.ZodLiteral<"shared">, z.ZodArray<z.ZodObject<{
            botId: z.ZodString;
            botCreatedAt: z.ZodNumber;
        }, z.core.$strict>>]>;
        originTrust: z.ZodEnum<{
            candidate: "candidate";
            user_stated: "user_stated";
            user_confirmed: "user_confirmed";
        }>;
        sourceVersions: z.ZodArray<z.ZodUUID>;
        restrictions: z.ZodArray<z.ZodEnum<{
            secret: "secret";
            "no-egress": "no-egress";
            "pending-cleanup": "pending-cleanup";
            revoked: "revoked";
        }>>;
        grants: z.ZodArray<z.ZodUUID>;
    }, z.core.$strict>;
}, z.core.$strict>;
