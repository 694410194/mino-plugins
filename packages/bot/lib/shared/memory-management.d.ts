import { z } from 'zod';
export declare const memoryQuerySchema: z.ZodObject<{
    botId: z.ZodString;
    scope: z.ZodEnum<{
        shared: "shared";
        private: "private";
        quarantine: "quarantine";
    }>;
    view: z.ZodEnum<{
        candidates: "candidates";
        facts: "facts";
        journal: "journal";
        conflicts: "conflicts";
        all: "all";
    }>;
    query: z.ZodOptional<z.ZodString>;
    cursor: z.ZodOptional<z.ZodUUID>;
    revision: z.ZodOptional<z.ZodNumber>;
    at: z.ZodOptional<z.ZodNumber>;
    recordedBefore: z.ZodOptional<z.ZodNumber>;
    commitBefore: z.ZodOptional<z.ZodNumber>;
    limit: z.ZodOptional<z.ZodNumber>;
}, z.core.$strict>;
export declare const memoryCreateSchema: z.ZodObject<{
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
    localException: z.ZodOptional<z.ZodBoolean>;
    botId: z.ZodString;
    scope: z.ZodEnum<{
        shared: "shared";
        private: "private";
    }>;
    kind: z.ZodEnum<{
        user_fact: "user_fact";
        user_event: "user_event";
        bot_role: "bot_role";
        how_to_work: "how_to_work";
    }>;
    expectedRevision: z.ZodNumber;
}, z.core.$strict>;
export declare const memoryReviseSchema: z.ZodObject<{
    id: z.ZodUUID;
    expectedRevision: z.ZodNumber;
    patch: z.ZodObject<{
        content: z.ZodOptional<z.ZodString>;
        subject: z.ZodOptional<z.ZodOptional<z.ZodString>>;
        factKey: z.ZodOptional<z.ZodOptional<z.ZodString>>;
        qualifiers: z.ZodOptional<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>>;
        valid: z.ZodOptional<z.ZodObject<{
            from: z.ZodNullable<z.ZodNumber>;
            to: z.ZodNullable<z.ZodNumber>;
            basis: z.ZodEnum<{
                unknown: "unknown";
                explicit: "explicit";
                "message-default": "message-default";
            }>;
        }, z.core.$strict>>;
        localException: z.ZodOptional<z.ZodOptional<z.ZodBoolean>>;
    }, z.core.$strict>;
}, z.core.$strict>;
export declare const memoryConfirmSchema: z.ZodObject<{
    id: z.ZodUUID;
    expectedRevision: z.ZodNumber;
    scope: z.ZodEnum<{
        shared: "shared";
        private: "private";
    }>;
    botId: z.ZodString;
}, z.core.$strict>;
export declare const memoryResolveSchema: z.ZodObject<{
    ids: z.ZodArray<z.ZodUUID>;
    expectedRevision: z.ZodNumber;
    choice: z.ZodEnum<{
        select: "select";
        coexist: "coexist";
        reject: "reject";
    }>;
    selected: z.ZodOptional<z.ZodUUID>;
    qualifiers: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodUUID;
        values: z.ZodRecord<z.ZodString, z.ZodString>;
    }, z.core.$strict>>>;
}, z.core.$strict>;
export declare const memoryRowSchema: z.ZodObject<{
    version: z.ZodUnion<readonly [z.ZodObject<{
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
    payload: z.ZodObject<{
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
    state: z.ZodEnum<{
        proposed: "proposed";
        active: "active";
        disputed: "disputed";
        superseded: "superseded";
        expired: "expired";
        rejected: "rejected";
        forgotten: "forgotten";
    }>;
    supersededBy: z.ZodOptional<z.ZodUUID>;
    deletedBot: z.ZodBoolean;
}, z.core.$strict>;
export declare const memoryPageSchema: z.ZodObject<{
    revision: z.ZodNumber;
    rows: z.ZodArray<z.ZodObject<{
        version: z.ZodUnion<readonly [z.ZodObject<{
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
        payload: z.ZodObject<{
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
        state: z.ZodEnum<{
            proposed: "proposed";
            active: "active";
            disputed: "disputed";
            superseded: "superseded";
            expired: "expired";
            rejected: "rejected";
            forgotten: "forgotten";
        }>;
        supersededBy: z.ZodOptional<z.ZodUUID>;
        deletedBot: z.ZodBoolean;
    }, z.core.$strict>>;
    next: z.ZodOptional<z.ZodUUID>;
    total: z.ZodNumber;
}, z.core.$strict>;
export type MemoryQuery = z.input<typeof memoryQuerySchema>;
export type MemoryCreate = z.input<typeof memoryCreateSchema>;
export type MemoryRevise = z.input<typeof memoryReviseSchema>;
export type MemoryConfirm = z.input<typeof memoryConfirmSchema>;
export type MemoryResolve = z.input<typeof memoryResolveSchema>;
export type ManagedMemoryRow = z.output<typeof memoryRowSchema>;
export type ManagedMemoryPage = z.output<typeof memoryPageSchema>;
