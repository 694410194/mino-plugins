import { z } from 'zod';
export declare const GROUP_ROOT_PRESET = "dsh-bot-group-root";
export declare const GROUP_TEXT_MAX_BYTES = 65536;
export declare const GROUP_TIMELINE_LIMIT = 200;
export declare const groupKeySchema: z.ZodObject<{
    groupId: z.ZodString;
    groupCreatedAt: z.ZodNumber;
}, z.core.$strict>;
export declare const groupModeSchema: z.ZodEnum<{
    natural: "natural";
    mention: "mention";
    "round-robin": "round-robin";
}>;
/** A group override is optional; absent records preserve each Bot's model defaults. */
export declare const groupModelSelectionSchema: z.ZodObject<{
    provider: z.ZodString;
    model: z.ZodString;
    reasoningEffort: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export declare const groupMemberModelSelectionsSchema: z.ZodArray<z.ZodObject<{
    memberId: z.ZodString;
    modelSelection: z.ZodObject<{
        provider: z.ZodString;
        model: z.ZodString;
        reasoningEffort: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>;
}, z.core.$strict>>;
export declare const groupSetModelSchema: z.ZodObject<{
    expectedModelRevision: z.ZodNumber;
    memberId: z.ZodOptional<z.ZodString>;
    modelSelection: z.ZodNullable<z.ZodObject<{
        provider: z.ZodString;
        model: z.ZodString;
        reasoningEffort: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export declare const groupRecordSchema: z.ZodObject<{
    id: z.ZodString;
    operationId: z.ZodString;
    createDigest: z.ZodString;
    createdAt: z.ZodNumber;
    updatedAt: z.ZodNumber;
    schemaVersion: z.ZodLiteral<1>;
    name: z.ZodString;
    rootSessionId: z.ZodString;
    rootPresetId: z.ZodLiteral<"dsh-bot-group-root">;
    cwd: z.ZodString;
    mode: z.ZodEnum<{
        natural: "natural";
        mention: "mention";
        "round-robin": "round-robin";
    }>;
    modelSelection: z.ZodOptional<z.ZodObject<{
        provider: z.ZodString;
        model: z.ZodString;
        reasoningEffort: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>>;
    memberModelSelections: z.ZodOptional<z.ZodArray<z.ZodObject<{
        memberId: z.ZodString;
        modelSelection: z.ZodObject<{
            provider: z.ZodString;
            model: z.ZodString;
            reasoningEffort: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>;
    }, z.core.$strict>>>;
    modelRevision: z.ZodOptional<z.ZodNumber>;
    nextMemberId: z.ZodOptional<z.ZodString>;
    membershipRevision: z.ZodNumber;
    revision: z.ZodNumber;
    archived: z.ZodBoolean;
    state: z.ZodEnum<{
        ready: "ready";
        creating: "creating";
        recovery_needed: "recovery_needed";
    }>;
}, z.core.$strict>;
export declare const groupMemberSchema: z.ZodObject<{
    id: z.ZodString;
    group: z.ZodObject<{
        groupId: z.ZodString;
        groupCreatedAt: z.ZodNumber;
    }, z.core.$strict>;
    bot: z.ZodObject<{
        botId: z.ZodString;
        botCreatedAt: z.ZodNumber;
    }, z.core.$strict>;
    order: z.ZodNumber;
    joinedAt: z.ZodNumber;
    removedAt: z.ZodOptional<z.ZodNumber>;
    enabled: z.ZodBoolean;
}, z.core.$strict>;
export declare const groupTurnSchema: z.ZodObject<{
    id: z.ZodString;
    group: z.ZodObject<{
        groupId: z.ZodString;
        groupCreatedAt: z.ZodNumber;
    }, z.core.$strict>;
    operationId: z.ZodString;
    requestDigest: z.ZodString;
    inputMessageId: z.ZodString;
    inputSeq: z.ZodOptional<z.ZodNumber>;
    createdAt: z.ZodNumber;
    updatedAt: z.ZodNumber;
    revision: z.ZodNumber;
    schemaVersion: z.ZodLiteral<1>;
    membershipRevision: z.ZodNumber;
    orderedMemberIds: z.ZodArray<z.ZodString>;
    mode: z.ZodEnum<{
        natural: "natural";
        mention: "mention";
        "round-robin": "round-robin";
    }>;
    contextThroughSeq: z.ZodNumber;
    modelSelection: z.ZodOptional<z.ZodObject<{
        provider: z.ZodString;
        model: z.ZodString;
        reasoningEffort: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>>;
    memberModelSelections: z.ZodOptional<z.ZodArray<z.ZodObject<{
        memberId: z.ZodString;
        modelSelection: z.ZodObject<{
            provider: z.ZodString;
            model: z.ZodString;
            reasoningEffort: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>;
    }, z.core.$strict>>>;
    predecessorTurnIds: z.ZodOptional<z.ZodArray<z.ZodString>>;
    followups: z.ZodOptional<z.ZodArray<z.ZodObject<{
        operationId: z.ZodString;
        requestDigest: z.ZodString;
        deliveryId: z.ZodString;
        messageId: z.ZodString;
        childMessageId: z.ZodOptional<z.ZodString>;
        state: z.ZodEnum<{
            unknown: "unknown";
            dispatching: "dispatching";
            accepted: "accepted";
        }>;
    }, z.core.$strict>>>;
    replyTo: z.ZodOptional<z.ZodString>;
    protocol: z.ZodOptional<z.ZodLiteral<2>>;
    automaticExecutions: z.ZodOptional<z.ZodNumber>;
    continuationAllowance: z.ZodOptional<z.ZodNumber>;
    stoppedMemberIds: z.ZodOptional<z.ZodArray<z.ZodString>>;
    state: z.ZodEnum<{
        completed: "completed";
        cancelled: "cancelled";
        idle: "idle";
        running: "running";
        accepted: "accepted";
        recovery_needed: "recovery_needed";
        paused: "paused";
        partial: "partial";
    }>;
}, z.core.$strict>;
export declare const groupDeliverySchema: z.ZodObject<{
    id: z.ZodString;
    turnId: z.ZodString;
    memberId: z.ZodString;
    ordinal: z.ZodNumber;
    bot: z.ZodObject<{
        botId: z.ZodString;
        botCreatedAt: z.ZodNumber;
    }, z.core.$strict>;
    botRevision: z.ZodNumber;
    presetId: z.ZodString;
    contextOutputMessageIds: z.ZodArray<z.ZodString>;
    contextTruncated: z.ZodBoolean;
    state: z.ZodEnum<{
        pending: "pending";
        unknown: "unknown";
        completed: "completed";
        skipped: "skipped";
        failed: "failed";
        cancelled: "cancelled";
        running: "running";
        starting: "starting";
    }>;
    automatic: z.ZodOptional<z.ZodBoolean>;
    startedAt: z.ZodOptional<z.ZodNumber>;
    endedAt: z.ZodOptional<z.ZodNumber>;
    nativeRunId: z.ZodOptional<z.ZodString>;
    childMessageId: z.ZodOptional<z.ZodString>;
    joinedDeliveryId: z.ZodOptional<z.ZodString>;
    childSessionId: z.ZodOptional<z.ZodString>;
    triggerMessageId: z.ZodOptional<z.ZodString>;
    returnMemberId: z.ZodOptional<z.ZodString>;
    requestDigest: z.ZodOptional<z.ZodString>;
    skipped: z.ZodOptional<z.ZodBoolean>;
    outputMessageId: z.ZodOptional<z.ZodString>;
    outputSeq: z.ZodOptional<z.ZodNumber>;
    stopReason: z.ZodOptional<z.ZodString>;
    reasonCode: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export declare const groupCreateSchema: z.ZodObject<{
    operationId: z.ZodString;
    name: z.ZodString;
    members: z.ZodArray<z.ZodObject<{
        botId: z.ZodString;
        botCreatedAt: z.ZodNumber;
    }, z.core.$strict>>;
    mode: z.ZodEnum<{
        natural: "natural";
        mention: "mention";
        "round-robin": "round-robin";
    }>;
    cwd: z.ZodOptional<z.ZodString>;
    historyConfirmed: z.ZodLiteral<true>;
}, z.core.$strict>;
export declare const groupEditSchema: z.ZodObject<{
    expectedRevision: z.ZodNumber;
    expectedMembershipRevision: z.ZodNumber;
    name: z.ZodString;
    mode: z.ZodEnum<{
        natural: "natural";
        mention: "mention";
        "round-robin": "round-robin";
    }>;
    members: z.ZodArray<z.ZodObject<{
        botId: z.ZodString;
        botCreatedAt: z.ZodNumber;
    }, z.core.$strict>>;
    historyConfirmed: z.ZodLiteral<true>;
}, z.core.$strict>;
export declare const groupSendSchema: z.ZodObject<{
    operationId: z.ZodString;
    expectedMembershipRevision: z.ZodNumber;
    text: z.ZodDefault<z.ZodString>;
    fileReceiptIds: z.ZodDefault<z.ZodArray<z.ZodString>>;
    memberIds: z.ZodDefault<z.ZodArray<z.ZodString>>;
    round: z.ZodDefault<z.ZodBoolean>;
    followup: z.ZodOptional<z.ZodObject<{
        turnId: z.ZodString;
        deliveryId: z.ZodString;
    }, z.core.$strict>>;
    replyTo: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export declare const speakerSchema: z.ZodObject<{
    bot: z.ZodObject<{
        botId: z.ZodString;
        botCreatedAt: z.ZodNumber;
    }, z.core.$strict>;
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
}, z.core.$strict>;
export declare const groupAttachmentSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    type: z.ZodLiteral<"file">;
    attachment: z.ZodObject<{
        attachmentId: z.ZodString;
        name: z.ZodString;
        bytes: z.ZodNumber;
    }, z.core.$strict>;
}, z.core.$strict>, z.ZodObject<{
    type: z.ZodLiteral<"image">;
    attachment: z.ZodObject<{
        attachmentId: z.ZodString;
        mediaType: z.ZodEnum<{
            "image/png": "image/png";
            "image/jpeg": "image/jpeg";
            "image/webp": "image/webp";
            "image/gif": "image/gif";
        }>;
        bytes: z.ZodNumber;
        width: z.ZodNumber;
        height: z.ZodNumber;
        name: z.ZodOptional<z.ZodString>;
        originalDimensions: z.ZodOptional<z.ZodObject<{
            width: z.ZodNumber;
            height: z.ZodNumber;
        }, z.core.$strict>>;
    }, z.core.$strict>;
    offloaded: z.ZodOptional<z.ZodLiteral<true>>;
}, z.core.$strict>], "type">;
export type GroupAttachment = z.output<typeof groupAttachmentSchema>;
export declare const groupMessageSchema: z.ZodObject<{
    id: z.ZodString;
    seq: z.ZodNumber;
    at: z.ZodNumber;
    text: z.ZodString;
    hasNonText: z.ZodOptional<z.ZodBoolean>;
    attachments: z.ZodOptional<z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
        type: z.ZodLiteral<"file">;
        attachment: z.ZodObject<{
            attachmentId: z.ZodString;
            name: z.ZodString;
            bytes: z.ZodNumber;
        }, z.core.$strict>;
    }, z.core.$strict>, z.ZodObject<{
        type: z.ZodLiteral<"image">;
        attachment: z.ZodObject<{
            attachmentId: z.ZodString;
            mediaType: z.ZodEnum<{
                "image/png": "image/png";
                "image/jpeg": "image/jpeg";
                "image/webp": "image/webp";
                "image/gif": "image/gif";
            }>;
            bytes: z.ZodNumber;
            width: z.ZodNumber;
            height: z.ZodNumber;
            name: z.ZodOptional<z.ZodString>;
            originalDimensions: z.ZodOptional<z.ZodObject<{
                width: z.ZodNumber;
                height: z.ZodNumber;
            }, z.core.$strict>>;
        }, z.core.$strict>;
        offloaded: z.ZodOptional<z.ZodLiteral<true>>;
    }, z.core.$strict>], "type">>>;
    turnId: z.ZodString;
    replyTo: z.ZodOptional<z.ZodString>;
    authorKind: z.ZodOptional<z.ZodEnum<{
        user: "user";
        bot: "bot";
    }>>;
    causeId: z.ZodOptional<z.ZodString>;
    speaker: z.ZodOptional<z.ZodObject<{
        bot: z.ZodObject<{
            botId: z.ZodString;
            botCreatedAt: z.ZodNumber;
        }, z.core.$strict>;
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
    childSessionId: z.ZodOptional<z.ZodString>;
    stopReason: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export declare const groupReadSchema: z.ZodObject<{
    id: z.ZodString;
    group: z.ZodObject<{
        groupId: z.ZodString;
        groupCreatedAt: z.ZodNumber;
    }, z.core.$strict>;
    throughSeq: z.ZodNumber;
    revision: z.ZodNumber;
    createdAt: z.ZodNumber;
    updatedAt: z.ZodNumber;
    schemaVersion: z.ZodLiteral<1>;
}, z.core.$strict>;
export declare const groupSummarySchema: z.ZodObject<{
    latest: z.ZodOptional<z.ZodObject<{
        seq: z.ZodNumber;
        at: z.ZodNumber;
        speaker: z.ZodOptional<z.ZodObject<{
            bot: z.ZodObject<{
                botId: z.ZodString;
                botCreatedAt: z.ZodNumber;
            }, z.core.$strict>;
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
    }, z.core.$strict>>;
    unread: z.ZodDefault<z.ZodBoolean>;
    readRevision: z.ZodDefault<z.ZodNumber>;
    group: z.ZodObject<{
        id: z.ZodString;
        operationId: z.ZodString;
        createDigest: z.ZodString;
        createdAt: z.ZodNumber;
        updatedAt: z.ZodNumber;
        schemaVersion: z.ZodLiteral<1>;
        name: z.ZodString;
        rootSessionId: z.ZodString;
        rootPresetId: z.ZodLiteral<"dsh-bot-group-root">;
        cwd: z.ZodString;
        mode: z.ZodEnum<{
            natural: "natural";
            mention: "mention";
            "round-robin": "round-robin";
        }>;
        modelSelection: z.ZodOptional<z.ZodObject<{
            provider: z.ZodString;
            model: z.ZodString;
            reasoningEffort: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>>;
        memberModelSelections: z.ZodOptional<z.ZodArray<z.ZodObject<{
            memberId: z.ZodString;
            modelSelection: z.ZodObject<{
                provider: z.ZodString;
                model: z.ZodString;
                reasoningEffort: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>;
        }, z.core.$strict>>>;
        modelRevision: z.ZodOptional<z.ZodNumber>;
        nextMemberId: z.ZodOptional<z.ZodString>;
        membershipRevision: z.ZodNumber;
        revision: z.ZodNumber;
        archived: z.ZodBoolean;
        state: z.ZodEnum<{
            ready: "ready";
            creating: "creating";
            recovery_needed: "recovery_needed";
        }>;
    }, z.core.$strict>;
    members: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        group: z.ZodObject<{
            groupId: z.ZodString;
            groupCreatedAt: z.ZodNumber;
        }, z.core.$strict>;
        bot: z.ZodObject<{
            botId: z.ZodString;
            botCreatedAt: z.ZodNumber;
        }, z.core.$strict>;
        order: z.ZodNumber;
        joinedAt: z.ZodNumber;
        removedAt: z.ZodOptional<z.ZodNumber>;
        enabled: z.ZodBoolean;
    }, z.core.$strict>>;
    unavailableMemberIds: z.ZodArray<z.ZodString>;
    running: z.ZodBoolean;
    reason: z.ZodOptional<z.ZodEnum<{
        "recovery-needed": "recovery-needed";
        "root-owned-elsewhere": "root-owned-elsewhere";
        "root-unavailable": "root-unavailable";
    }>>;
}, z.core.$strict>;
export declare const groupViewSchema: z.ZodObject<{
    latest: z.ZodOptional<z.ZodObject<{
        seq: z.ZodNumber;
        at: z.ZodNumber;
        speaker: z.ZodOptional<z.ZodObject<{
            bot: z.ZodObject<{
                botId: z.ZodString;
                botCreatedAt: z.ZodNumber;
            }, z.core.$strict>;
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
    }, z.core.$strict>>;
    unread: z.ZodDefault<z.ZodBoolean>;
    readRevision: z.ZodDefault<z.ZodNumber>;
    group: z.ZodObject<{
        id: z.ZodString;
        operationId: z.ZodString;
        createDigest: z.ZodString;
        createdAt: z.ZodNumber;
        updatedAt: z.ZodNumber;
        schemaVersion: z.ZodLiteral<1>;
        name: z.ZodString;
        rootSessionId: z.ZodString;
        rootPresetId: z.ZodLiteral<"dsh-bot-group-root">;
        cwd: z.ZodString;
        mode: z.ZodEnum<{
            natural: "natural";
            mention: "mention";
            "round-robin": "round-robin";
        }>;
        modelSelection: z.ZodOptional<z.ZodObject<{
            provider: z.ZodString;
            model: z.ZodString;
            reasoningEffort: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>>;
        memberModelSelections: z.ZodOptional<z.ZodArray<z.ZodObject<{
            memberId: z.ZodString;
            modelSelection: z.ZodObject<{
                provider: z.ZodString;
                model: z.ZodString;
                reasoningEffort: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>;
        }, z.core.$strict>>>;
        modelRevision: z.ZodOptional<z.ZodNumber>;
        nextMemberId: z.ZodOptional<z.ZodString>;
        membershipRevision: z.ZodNumber;
        revision: z.ZodNumber;
        archived: z.ZodBoolean;
        state: z.ZodEnum<{
            ready: "ready";
            creating: "creating";
            recovery_needed: "recovery_needed";
        }>;
    }, z.core.$strict>;
    members: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        group: z.ZodObject<{
            groupId: z.ZodString;
            groupCreatedAt: z.ZodNumber;
        }, z.core.$strict>;
        bot: z.ZodObject<{
            botId: z.ZodString;
            botCreatedAt: z.ZodNumber;
        }, z.core.$strict>;
        order: z.ZodNumber;
        joinedAt: z.ZodNumber;
        removedAt: z.ZodOptional<z.ZodNumber>;
        enabled: z.ZodBoolean;
    }, z.core.$strict>>;
    unavailableMemberIds: z.ZodArray<z.ZodString>;
    running: z.ZodBoolean;
    reason: z.ZodOptional<z.ZodEnum<{
        "recovery-needed": "recovery-needed";
        "root-owned-elsewhere": "root-owned-elsewhere";
        "root-unavailable": "root-unavailable";
    }>>;
    turns: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        group: z.ZodObject<{
            groupId: z.ZodString;
            groupCreatedAt: z.ZodNumber;
        }, z.core.$strict>;
        operationId: z.ZodString;
        requestDigest: z.ZodString;
        inputMessageId: z.ZodString;
        inputSeq: z.ZodOptional<z.ZodNumber>;
        createdAt: z.ZodNumber;
        updatedAt: z.ZodNumber;
        revision: z.ZodNumber;
        schemaVersion: z.ZodLiteral<1>;
        membershipRevision: z.ZodNumber;
        orderedMemberIds: z.ZodArray<z.ZodString>;
        mode: z.ZodEnum<{
            natural: "natural";
            mention: "mention";
            "round-robin": "round-robin";
        }>;
        contextThroughSeq: z.ZodNumber;
        modelSelection: z.ZodOptional<z.ZodObject<{
            provider: z.ZodString;
            model: z.ZodString;
            reasoningEffort: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>>;
        memberModelSelections: z.ZodOptional<z.ZodArray<z.ZodObject<{
            memberId: z.ZodString;
            modelSelection: z.ZodObject<{
                provider: z.ZodString;
                model: z.ZodString;
                reasoningEffort: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>;
        }, z.core.$strict>>>;
        predecessorTurnIds: z.ZodOptional<z.ZodArray<z.ZodString>>;
        followups: z.ZodOptional<z.ZodArray<z.ZodObject<{
            operationId: z.ZodString;
            requestDigest: z.ZodString;
            deliveryId: z.ZodString;
            messageId: z.ZodString;
            childMessageId: z.ZodOptional<z.ZodString>;
            state: z.ZodEnum<{
                unknown: "unknown";
                dispatching: "dispatching";
                accepted: "accepted";
            }>;
        }, z.core.$strict>>>;
        replyTo: z.ZodOptional<z.ZodString>;
        protocol: z.ZodOptional<z.ZodLiteral<2>>;
        automaticExecutions: z.ZodOptional<z.ZodNumber>;
        continuationAllowance: z.ZodOptional<z.ZodNumber>;
        stoppedMemberIds: z.ZodOptional<z.ZodArray<z.ZodString>>;
        state: z.ZodEnum<{
            completed: "completed";
            cancelled: "cancelled";
            idle: "idle";
            running: "running";
            accepted: "accepted";
            recovery_needed: "recovery_needed";
            paused: "paused";
            partial: "partial";
        }>;
    }, z.core.$strict>>;
    deliveries: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        turnId: z.ZodString;
        memberId: z.ZodString;
        ordinal: z.ZodNumber;
        bot: z.ZodObject<{
            botId: z.ZodString;
            botCreatedAt: z.ZodNumber;
        }, z.core.$strict>;
        botRevision: z.ZodNumber;
        presetId: z.ZodString;
        contextOutputMessageIds: z.ZodArray<z.ZodString>;
        contextTruncated: z.ZodBoolean;
        state: z.ZodEnum<{
            pending: "pending";
            unknown: "unknown";
            completed: "completed";
            skipped: "skipped";
            failed: "failed";
            cancelled: "cancelled";
            running: "running";
            starting: "starting";
        }>;
        automatic: z.ZodOptional<z.ZodBoolean>;
        startedAt: z.ZodOptional<z.ZodNumber>;
        endedAt: z.ZodOptional<z.ZodNumber>;
        nativeRunId: z.ZodOptional<z.ZodString>;
        childMessageId: z.ZodOptional<z.ZodString>;
        joinedDeliveryId: z.ZodOptional<z.ZodString>;
        childSessionId: z.ZodOptional<z.ZodString>;
        triggerMessageId: z.ZodOptional<z.ZodString>;
        returnMemberId: z.ZodOptional<z.ZodString>;
        requestDigest: z.ZodOptional<z.ZodString>;
        skipped: z.ZodOptional<z.ZodBoolean>;
        outputMessageId: z.ZodOptional<z.ZodString>;
        outputSeq: z.ZodOptional<z.ZodNumber>;
        stopReason: z.ZodOptional<z.ZodString>;
        reasonCode: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>>;
    messages: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        seq: z.ZodNumber;
        at: z.ZodNumber;
        text: z.ZodString;
        hasNonText: z.ZodOptional<z.ZodBoolean>;
        attachments: z.ZodOptional<z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
            type: z.ZodLiteral<"file">;
            attachment: z.ZodObject<{
                attachmentId: z.ZodString;
                name: z.ZodString;
                bytes: z.ZodNumber;
            }, z.core.$strict>;
        }, z.core.$strict>, z.ZodObject<{
            type: z.ZodLiteral<"image">;
            attachment: z.ZodObject<{
                attachmentId: z.ZodString;
                mediaType: z.ZodEnum<{
                    "image/png": "image/png";
                    "image/jpeg": "image/jpeg";
                    "image/webp": "image/webp";
                    "image/gif": "image/gif";
                }>;
                bytes: z.ZodNumber;
                width: z.ZodNumber;
                height: z.ZodNumber;
                name: z.ZodOptional<z.ZodString>;
                originalDimensions: z.ZodOptional<z.ZodObject<{
                    width: z.ZodNumber;
                    height: z.ZodNumber;
                }, z.core.$strict>>;
            }, z.core.$strict>;
            offloaded: z.ZodOptional<z.ZodLiteral<true>>;
        }, z.core.$strict>], "type">>>;
        turnId: z.ZodString;
        replyTo: z.ZodOptional<z.ZodString>;
        authorKind: z.ZodOptional<z.ZodEnum<{
            user: "user";
            bot: "bot";
        }>>;
        causeId: z.ZodOptional<z.ZodString>;
        speaker: z.ZodOptional<z.ZodObject<{
            bot: z.ZodObject<{
                botId: z.ZodString;
                botCreatedAt: z.ZodNumber;
            }, z.core.$strict>;
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
        childSessionId: z.ZodOptional<z.ZodString>;
        stopReason: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>>;
    hasEarlier: z.ZodBoolean;
}, z.core.$strict>;
export declare const groupPageSchema: z.ZodObject<{
    beforeSeq: z.ZodOptional<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
}, z.core.$strict>;
export type GroupModelSelection = z.output<typeof groupModelSelectionSchema>;
export type GroupSetModel = z.input<typeof groupSetModelSchema>;
export type GroupKey = z.output<typeof groupKeySchema>;
export type GroupRecord = z.output<typeof groupRecordSchema>;
export type GroupMember = z.output<typeof groupMemberSchema>;
export type GroupTurn = z.output<typeof groupTurnSchema>;
export type GroupDelivery = z.output<typeof groupDeliverySchema>;
export type GroupMessage = z.output<typeof groupMessageSchema>;
export type GroupView = z.output<typeof groupViewSchema>;
export type GroupSummary = z.output<typeof groupSummarySchema>;
export type GroupCreate = z.input<typeof groupCreateSchema>;
export type GroupEdit = z.input<typeof groupEditSchema>;
export type GroupSend = z.input<typeof groupSendSchema>;
export type GroupSpeaker = z.output<typeof speakerSchema>;
export declare const groupKey: (g: GroupRecord) => GroupKey;
