import { z } from 'zod';
export declare const opSchema: z.ZodObject<{
    opId: z.ZodUUID;
    seq: z.ZodNumber;
    kind: z.ZodEnum<{
        policy: "policy";
        revise: "revise";
        resolve: "resolve";
        propose: "propose";
        accept: "accept";
        supersede: "supersede";
        dispute: "dispute";
        promote: "promote";
        forget: "forget";
        retire_shard: "retire_shard";
        migration: "migration";
        cleanup: "cleanup";
    }>;
    subjectIds: z.ZodArray<z.ZodUUID>;
    payloadRefs: z.ZodArray<z.ZodUUID>;
    expectedRevision: z.ZodNumber;
    forgetEpoch: z.ZodNumber;
    versions: z.ZodArray<z.ZodUnion<readonly [z.ZodObject<{
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
    }, z.core.$strict>]>>;
    receiptRefs: z.ZodArray<z.ZodUUID>;
    owner: z.ZodOptional<z.ZodObject<{
        botId: z.ZodString;
        botCreatedAt: z.ZodNumber;
    }, z.core.$strict>>;
    autoPolicy: z.ZodOptional<z.ZodObject<{
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
    }, z.core.$strict>>;
    quotaCharge: z.ZodOptional<z.ZodObject<{
        botId: z.ZodString;
        bucket: z.ZodNumber;
        end: z.ZodNumber;
        timeZone: z.ZodString;
        at: z.ZodNumber;
    }, z.core.$strict>>;
    grantUse: z.ZodOptional<z.ZodUUID>;
}, z.core.$strict>;
export declare const barrierSchema: z.ZodObject<{
    id: z.ZodUUID;
    epoch: z.ZodNumber;
    targets: z.ZodArray<z.ZodUUID>;
    affectedSessionIds: z.ZodArray<z.ZodString>;
    state: z.ZodEnum<{
        intent: "intent";
        stopped: "stopped";
        cleaning: "cleaning";
        blocked: "blocked";
        verified: "verified";
    }>;
    scope: z.ZodEnum<{
        shared: "shared";
        private: "private";
    }>;
    previewRevision: z.ZodNumber;
    receipts: z.ZodArray<z.ZodUUID>;
}, z.core.$strict>;
export declare const metaSchema: z.ZodObject<{
    scope: z.ZodObject<{
        id: z.ZodUUID;
        createdAt: z.ZodNumber;
    }, z.core.$strict>;
    policyRevision: z.ZodNumber;
    quotaTimeZone: z.ZodString;
}, z.core.$strict>;
export declare const migrationSchema: z.ZodObject<{
    id: z.ZodUUID;
    sourceSchema: z.ZodLiteral<1>;
    targetSchema: z.ZodLiteral<2>;
    sourceDigest: z.ZodOptional<z.ZodString>;
    phase: z.ZodEnum<{
        prepare: "prepare";
        copy: "copy";
        verify: "verify";
        cutover: "cutover";
        "legacy-clean": "legacy-clean";
        done: "done";
    }>;
    counts: z.ZodObject<{
        source: z.ZodNumber;
        copied: z.ZodNumber;
        quarantined: z.ZodNumber;
    }, z.core.$strict>;
    cutoverSeq: z.ZodNumber;
    forgetEpoch: z.ZodNumber;
}, z.core.$strict>;
export declare const migrationItemSchema: z.ZodObject<{
    legacyId: z.ZodString;
    memoryId: z.ZodUUID;
    versionId: z.ZodUUID;
    opId: z.ZodUUID;
    contentRef: z.ZodUUID;
    quarantine: z.ZodBoolean;
}, z.core.$strict>;
export declare const fenceSchema: z.ZodObject<{
    schemaVersion: z.ZodLiteral<2>;
    kind: z.ZodLiteral<"migration-fence">;
    migrationId: z.ZodUUID;
}, z.core.$strict>;
export type MemoryOp = z.output<typeof opSchema>;
export type MemoryBarrier = z.output<typeof barrierSchema>;
export type Migration = z.output<typeof migrationSchema>;
