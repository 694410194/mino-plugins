import { z } from 'zod';
export declare const safeCounter: z.ZodNumber;
export declare const randomId: z.ZodUUID;
export declare const userScopeSchema: z.ZodObject<{
    id: z.ZodUUID;
    createdAt: z.ZodNumber;
}, z.core.$strict>;
export declare const validitySchema: z.ZodObject<{
    from: z.ZodNullable<z.ZodNumber>;
    to: z.ZodNullable<z.ZodNumber>;
    basis: z.ZodEnum<{
        unknown: "unknown";
        explicit: "explicit";
        "message-default": "message-default";
    }>;
}, z.core.$strict>;
export declare const sourceRefSchema: z.ZodObject<{
    sessionId: z.ZodOptional<z.ZodString>;
    eventSeq: z.ZodOptional<z.ZodNumber>;
    callId: z.ZodOptional<z.ZodString>;
    parentVersionId: z.ZodOptional<z.ZodUUID>;
    entryReceiptId: z.ZodOptional<z.ZodUUID>;
    managementOpId: z.ZodOptional<z.ZodUUID>;
}, z.core.$strict>;
export { dataLabelSchema as labelSchema } from './data-flow.js';
export declare const payloadSchema: z.ZodObject<{
    content: z.ZodString;
    subject: z.ZodOptional<z.ZodString>;
    factKey: z.ZodOptional<z.ZodString>;
    qualifiers: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    valid: z.ZodObject<{
        from: z.ZodNullable<z.ZodNumber>;
        to: z.ZodNullable<z.ZodNumber>;
        basis: z.ZodEnum<{
            unknown: "unknown";
            explicit: "explicit";
            "message-default": "message-default";
        }>;
    }, z.core.$strict>;
    sourceExcerpt: z.ZodOptional<z.ZodString>;
    confirmation: z.ZodOptional<z.ZodString>;
    localException: z.ZodOptional<z.ZodBoolean>;
    botSnapshot: z.ZodOptional<z.ZodObject<{
        name: z.ZodString;
        avatar: z.ZodOptional<z.ZodString>;
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
        avatarVariant: z.ZodOptional<z.ZodEnum<{
            classic: "classic";
            glasses: "glasses";
            spout: "spout";
            baby: "baby";
            hat: "hat";
            sleeping: "sleeping";
            auto: "auto";
        }>>;
    }, z.core.$strict>>;
    legacy: z.ZodOptional<z.ZodObject<{
        kind: z.ZodEnum<{
            profile: "profile";
            preference: "preference";
            fact: "fact";
            note: "note";
        }>;
        tags: z.ZodArray<z.ZodString>;
        pinned: z.ZodBoolean;
        source: z.ZodOptional<z.ZodObject<{
            sessionId: z.ZodOptional<z.ZodString>;
            at: z.ZodNumber;
            by: z.ZodEnum<{
                model: "model";
                user: "user";
            }>;
        }, z.core.$strict>>;
        id: z.ZodString;
        botId: z.ZodString;
        createdAt: z.ZodNumber;
        updatedAt: z.ZodNumber;
    }, z.core.$strict>>;
}, z.core.$strict>;
export declare const memoryVersionSchema: z.ZodUnion<readonly [z.ZodObject<{
    scope: z.ZodLiteral<"private">;
    ownerBotKey: z.ZodObject<{
        botId: z.ZodString;
        botCreatedAt: z.ZodNumber;
    }, z.core.$strict>;
    shard: z.ZodObject<{
        botId: z.ZodString;
        botCreatedAt: z.ZodNumber;
    }, z.core.$strict>;
    schemaVersion: z.ZodLiteral<2>;
    memoryId: z.ZodUUID;
    versionId: z.ZodUUID;
    userScope: z.ZodUUID;
    contentRef: z.ZodUUID;
    revision: z.ZodNumber;
    commitSeq: z.ZodNumber;
    kind: z.ZodEnum<{
        user_fact: "user_fact";
        user_event: "user_event";
        bot_role: "bot_role";
        how_to_work: "how_to_work";
    }>;
    legacyKind: z.ZodOptional<z.ZodEnum<{
        profile: "profile";
        preference: "preference";
        fact: "fact";
        note: "note";
    }>>;
    recordedAt: z.ZodNumber;
    sourceRefs: z.ZodArray<z.ZodObject<{
        sessionId: z.ZodOptional<z.ZodString>;
        eventSeq: z.ZodOptional<z.ZodNumber>;
        callId: z.ZodOptional<z.ZodString>;
        parentVersionId: z.ZodOptional<z.ZodUUID>;
        entryReceiptId: z.ZodOptional<z.ZodUUID>;
        managementOpId: z.ZodOptional<z.ZodUUID>;
    }, z.core.$strict>>;
    provenance: z.ZodObject<{
        channel: z.ZodEnum<{
            model: "model";
            legacy: "legacy";
            management: "management";
        }>;
        bot: z.ZodObject<{
            botId: z.ZodString;
            botCreatedAt: z.ZodNumber;
        }, z.core.$strict>;
    }, z.core.$strict>;
    trust: z.ZodEnum<{
        candidate: "candidate";
        user_stated: "user_stated";
        user_confirmed: "user_confirmed";
    }>;
    status: z.ZodEnum<{
        proposed: "proposed";
        active: "active";
        disputed: "disputed";
        superseded: "superseded";
        expired: "expired";
        rejected: "rejected";
        forgotten: "forgotten";
    }>;
    labels: z.ZodObject<{
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
}, z.core.$strict>, z.ZodObject<{
    scope: z.ZodLiteral<"shared">;
    shard: z.ZodUnion<readonly [z.ZodLiteral<"user">, z.ZodObject<{
        botId: z.ZodString;
        botCreatedAt: z.ZodNumber;
    }, z.core.$strict>]>;
    schemaVersion: z.ZodLiteral<2>;
    memoryId: z.ZodUUID;
    versionId: z.ZodUUID;
    userScope: z.ZodUUID;
    contentRef: z.ZodUUID;
    revision: z.ZodNumber;
    commitSeq: z.ZodNumber;
    kind: z.ZodEnum<{
        user_fact: "user_fact";
        user_event: "user_event";
        bot_role: "bot_role";
        how_to_work: "how_to_work";
    }>;
    legacyKind: z.ZodOptional<z.ZodEnum<{
        profile: "profile";
        preference: "preference";
        fact: "fact";
        note: "note";
    }>>;
    recordedAt: z.ZodNumber;
    sourceRefs: z.ZodArray<z.ZodObject<{
        sessionId: z.ZodOptional<z.ZodString>;
        eventSeq: z.ZodOptional<z.ZodNumber>;
        callId: z.ZodOptional<z.ZodString>;
        parentVersionId: z.ZodOptional<z.ZodUUID>;
        entryReceiptId: z.ZodOptional<z.ZodUUID>;
        managementOpId: z.ZodOptional<z.ZodUUID>;
    }, z.core.$strict>>;
    provenance: z.ZodObject<{
        channel: z.ZodEnum<{
            model: "model";
            legacy: "legacy";
            management: "management";
        }>;
        bot: z.ZodObject<{
            botId: z.ZodString;
            botCreatedAt: z.ZodNumber;
        }, z.core.$strict>;
    }, z.core.$strict>;
    trust: z.ZodEnum<{
        candidate: "candidate";
        user_stated: "user_stated";
        user_confirmed: "user_confirmed";
    }>;
    status: z.ZodEnum<{
        proposed: "proposed";
        active: "active";
        disputed: "disputed";
        superseded: "superseded";
        expired: "expired";
        rejected: "rejected";
        forgotten: "forgotten";
    }>;
    labels: z.ZodObject<{
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
}, z.core.$strict>]>;
/** Model/UI input never includes Host identity, trust, epoch or operation sequence. */
export declare const privateMemoryInputSchema: z.ZodObject<{
    content: z.ZodString;
    kind: z.ZodOptional<z.ZodEnum<{
        profile: "profile";
        preference: "preference";
        fact: "fact";
        note: "note";
    }>>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString>>;
    pinned: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strict>;
export type MemoryVersion = z.output<typeof memoryVersionSchema>;
export type MemoryPayload = z.output<typeof payloadSchema>;
export type UserScope = z.output<typeof userScopeSchema>;
