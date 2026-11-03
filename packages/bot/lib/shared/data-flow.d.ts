import { z } from 'zod';
export declare const dataLabelSchema: z.ZodObject<{
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
export type DataLabel = z.output<typeof dataLabelSchema>;
export declare const egressTargetSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
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
export type EgressTarget = z.output<typeof egressTargetSchema>;
export declare const flowBindingSchema: z.ZodObject<{
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
export type FlowBinding = z.output<typeof flowBindingSchema>;
export declare const autoShareSettingsSchema: z.ZodObject<{
    enabled: z.ZodBoolean;
    botDaily: z.ZodNumber;
    domainDaily: z.ZodNumber;
    timeZone: z.ZodString;
}, z.core.$strict>;
export declare const autoSharePolicySchema: z.ZodObject<{
    enabled: z.ZodBoolean;
    botDaily: z.ZodNumber;
    domainDaily: z.ZodNumber;
    timeZone: z.ZodString;
    revision: z.ZodNumber;
    hostConfig: z.ZodOptional<z.ZodObject<{
        enabled: z.ZodBoolean;
        botDaily: z.ZodNumber;
        domainDaily: z.ZodNumber;
        timeZone: z.ZodString;
    }, z.core.$strict>>;
}, z.core.$strict>;
export declare const quotaChargeSchema: z.ZodObject<{
    botId: z.ZodString;
    bucket: z.ZodNumber;
    end: z.ZodNumber;
    timeZone: z.ZodString;
    at: z.ZodNumber;
}, z.core.$strict>;
export type AutoSharePolicy = z.output<typeof autoSharePolicySchema>;
export type QuotaCharge = z.output<typeof quotaChargeSchema>;
export declare const autoShareStatusSchema: z.ZodObject<{
    shadow: z.ZodOptional<z.ZodObject<{
        mode: z.ZodLiteral<"offline-only">;
        shadowEnabled: z.ZodBoolean;
        offlineOrganizeEnabled: z.ZodBoolean;
        opportunities: z.ZodNumber;
        candidates: z.ZodNumber;
        modelRequests: z.ZodLiteral<0>;
        notifications: z.ZodLiteral<0>;
        memoryWrites: z.ZodLiteral<0>;
    }, z.core.$strict>>;
    domainUsed: z.ZodOptional<z.ZodNumber>;
    configured: z.ZodBoolean;
    effectiveAutoShare: z.ZodLiteral<false>;
    reason: z.ZodLiteral<"unverifiable-user-input">;
    botDaily: z.ZodNumber;
    domainDaily: z.ZodNumber;
    timeZone: z.ZodString;
    revision: z.ZodNumber;
}, z.core.$strict>;
export declare const autoShareToggleSchema: z.ZodObject<{
    enabled: z.ZodBoolean;
    expectedRevision: z.ZodNumber;
}, z.core.$strict>;
