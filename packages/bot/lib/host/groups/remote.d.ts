import type { Context } from '@deepseek-ai/cordis';
import { TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol';
import type { GroupKey } from '../../shared/groups.js';
import type { Groups } from './service.js';
export declare const GROUPS_HOST: {
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
export declare class GroupsRemote extends TypertRemoteService {
    private groups;
    constructor(ctx: Context, groups: Groups);
    open(group: GroupKey): Promise<{
        sessionId: string;
        workspaceId: string;
    }>;
    openAttachment(group: GroupKey, messageId: string, attachmentId: string): Promise<import("@deepseek-ai/dsh-api-session-controller").SessionOpenWorkspacePathValue>;
    markRead(group: GroupKey, throughSeq: number, expectedRevision: number): Promise<boolean>;
    list(): Promise<{
        unread: boolean;
        readRevision: number;
        group: {
            id: string;
            operationId: string;
            createDigest: string;
            createdAt: number;
            updatedAt: number;
            schemaVersion: 1;
            name: string;
            rootSessionId: string;
            rootPresetId: "dsh-bot-group-root";
            cwd: string;
            mode: "natural" | "mention" | "round-robin";
            membershipRevision: number;
            revision: number;
            archived: boolean;
            state: "ready" | "creating" | "recovery_needed";
            modelSelection?: {
                provider: string;
                model: string;
                reasoningEffort?: string | undefined;
            } | undefined;
            memberModelSelections?: {
                memberId: string;
                modelSelection: {
                    provider: string;
                    model: string;
                    reasoningEffort?: string | undefined;
                };
            }[] | undefined;
            modelRevision?: number | undefined;
            nextMemberId?: string | undefined;
        };
        members: {
            id: string;
            group: {
                groupId: string;
                groupCreatedAt: number;
            };
            bot: {
                botId: string;
                botCreatedAt: number;
            };
            order: number;
            joinedAt: number;
            enabled: boolean;
            removedAt?: number | undefined;
        }[];
        unavailableMemberIds: string[];
        running: boolean;
        latest?: {
            seq: number;
            at: number;
            speaker?: {
                bot: {
                    botId: string;
                    botCreatedAt: number;
                };
                name: string;
                avatar?: string | undefined;
                avatarColor?: "--dsw-alias-state-business-primary" | "--dsw-alias-state-success-primary" | "--dsw-alias-state-warn-label" | "--dsw-alias-state-error-primary" | "teal" | "cyan" | "indigo" | "purple" | "rose" | "orange" | "olive" | "slate" | undefined;
                avatarVariant?: "classic" | "glasses" | "spout" | "baby" | "hat" | "sleeping" | "auto" | undefined;
            } | undefined;
        } | undefined;
        reason?: "recovery-needed" | "root-owned-elsewhere" | "root-unavailable" | undefined;
    }[]>;
    create(input: unknown): Promise<{
        id: string;
        operationId: string;
        createDigest: string;
        createdAt: number;
        updatedAt: number;
        schemaVersion: 1;
        name: string;
        rootSessionId: string;
        rootPresetId: "dsh-bot-group-root";
        cwd: string;
        mode: "natural" | "mention" | "round-robin";
        membershipRevision: number;
        revision: number;
        archived: boolean;
        state: "ready" | "creating" | "recovery_needed";
        modelSelection?: {
            provider: string;
            model: string;
            reasoningEffort?: string | undefined;
        } | undefined;
        memberModelSelections?: {
            memberId: string;
            modelSelection: {
                provider: string;
                model: string;
                reasoningEffort?: string | undefined;
            };
        }[] | undefined;
        modelRevision?: number | undefined;
        nextMemberId?: string | undefined;
    }>;
    edit(group: GroupKey, input: unknown): Promise<{
        id: string;
        operationId: string;
        createDigest: string;
        createdAt: number;
        updatedAt: number;
        schemaVersion: 1;
        name: string;
        rootSessionId: string;
        rootPresetId: "dsh-bot-group-root";
        cwd: string;
        mode: "natural" | "mention" | "round-robin";
        membershipRevision: number;
        revision: number;
        archived: boolean;
        state: "ready" | "creating" | "recovery_needed";
        modelSelection?: {
            provider: string;
            model: string;
            reasoningEffort?: string | undefined;
        } | undefined;
        memberModelSelections?: {
            memberId: string;
            modelSelection: {
                provider: string;
                model: string;
                reasoningEffort?: string | undefined;
            };
        }[] | undefined;
        modelRevision?: number | undefined;
        nextMemberId?: string | undefined;
    }>;
    setModel(group: GroupKey, input: unknown): Promise<{
        id: string;
        operationId: string;
        createDigest: string;
        createdAt: number;
        updatedAt: number;
        schemaVersion: 1;
        name: string;
        rootSessionId: string;
        rootPresetId: "dsh-bot-group-root";
        cwd: string;
        mode: "natural" | "mention" | "round-robin";
        membershipRevision: number;
        revision: number;
        archived: boolean;
        state: "ready" | "creating" | "recovery_needed";
        modelSelection?: {
            provider: string;
            model: string;
            reasoningEffort?: string | undefined;
        } | undefined;
        memberModelSelections?: {
            memberId: string;
            modelSelection: {
                provider: string;
                model: string;
                reasoningEffort?: string | undefined;
            };
        }[] | undefined;
        modelRevision?: number | undefined;
        nextMemberId?: string | undefined;
    }>;
    view(group: GroupKey, page: unknown): Promise<{
        unread: boolean;
        readRevision: number;
        group: {
            id: string;
            operationId: string;
            createDigest: string;
            createdAt: number;
            updatedAt: number;
            schemaVersion: 1;
            name: string;
            rootSessionId: string;
            rootPresetId: "dsh-bot-group-root";
            cwd: string;
            mode: "natural" | "mention" | "round-robin";
            membershipRevision: number;
            revision: number;
            archived: boolean;
            state: "ready" | "creating" | "recovery_needed";
            modelSelection?: {
                provider: string;
                model: string;
                reasoningEffort?: string | undefined;
            } | undefined;
            memberModelSelections?: {
                memberId: string;
                modelSelection: {
                    provider: string;
                    model: string;
                    reasoningEffort?: string | undefined;
                };
            }[] | undefined;
            modelRevision?: number | undefined;
            nextMemberId?: string | undefined;
        };
        members: {
            id: string;
            group: {
                groupId: string;
                groupCreatedAt: number;
            };
            bot: {
                botId: string;
                botCreatedAt: number;
            };
            order: number;
            joinedAt: number;
            enabled: boolean;
            removedAt?: number | undefined;
        }[];
        unavailableMemberIds: string[];
        running: boolean;
        turns: {
            id: string;
            group: {
                groupId: string;
                groupCreatedAt: number;
            };
            operationId: string;
            requestDigest: string;
            inputMessageId: string;
            createdAt: number;
            updatedAt: number;
            revision: number;
            schemaVersion: 1;
            membershipRevision: number;
            orderedMemberIds: string[];
            mode: "natural" | "mention" | "round-robin";
            contextThroughSeq: number;
            state: "completed" | "cancelled" | "idle" | "running" | "accepted" | "recovery_needed" | "paused" | "partial";
            inputSeq?: number | undefined;
            modelSelection?: {
                provider: string;
                model: string;
                reasoningEffort?: string | undefined;
            } | undefined;
            memberModelSelections?: {
                memberId: string;
                modelSelection: {
                    provider: string;
                    model: string;
                    reasoningEffort?: string | undefined;
                };
            }[] | undefined;
            predecessorTurnIds?: string[] | undefined;
            followups?: {
                operationId: string;
                requestDigest: string;
                deliveryId: string;
                messageId: string;
                state: "unknown" | "dispatching" | "accepted";
                childMessageId?: string | undefined;
            }[] | undefined;
            replyTo?: string | undefined;
            protocol?: 2 | undefined;
            automaticExecutions?: number | undefined;
            continuationAllowance?: number | undefined;
            stoppedMemberIds?: string[] | undefined;
        }[];
        deliveries: {
            id: string;
            turnId: string;
            memberId: string;
            ordinal: number;
            bot: {
                botId: string;
                botCreatedAt: number;
            };
            botRevision: number;
            presetId: string;
            contextOutputMessageIds: string[];
            contextTruncated: boolean;
            state: "pending" | "unknown" | "completed" | "skipped" | "failed" | "cancelled" | "running" | "starting";
            automatic?: boolean | undefined;
            startedAt?: number | undefined;
            endedAt?: number | undefined;
            nativeRunId?: string | undefined;
            childMessageId?: string | undefined;
            joinedDeliveryId?: string | undefined;
            childSessionId?: string | undefined;
            triggerMessageId?: string | undefined;
            returnMemberId?: string | undefined;
            requestDigest?: string | undefined;
            skipped?: boolean | undefined;
            outputMessageId?: string | undefined;
            outputSeq?: number | undefined;
            stopReason?: string | undefined;
            reasonCode?: string | undefined;
        }[];
        messages: {
            id: string;
            seq: number;
            at: number;
            text: string;
            turnId: string;
            hasNonText?: boolean | undefined;
            attachments?: ({
                type: "file";
                attachment: {
                    attachmentId: string;
                    name: string;
                    bytes: number;
                };
            } | {
                type: "image";
                attachment: {
                    attachmentId: string;
                    mediaType: "image/png" | "image/jpeg" | "image/webp" | "image/gif";
                    bytes: number;
                    width: number;
                    height: number;
                    name?: string | undefined;
                    originalDimensions?: {
                        width: number;
                        height: number;
                    } | undefined;
                };
                offloaded?: true | undefined;
            })[] | undefined;
            replyTo?: string | undefined;
            authorKind?: "user" | "bot" | undefined;
            causeId?: string | undefined;
            speaker?: {
                bot: {
                    botId: string;
                    botCreatedAt: number;
                };
                name: string;
                avatar?: string | undefined;
                avatarColor?: "--dsw-alias-state-business-primary" | "--dsw-alias-state-success-primary" | "--dsw-alias-state-warn-label" | "--dsw-alias-state-error-primary" | "teal" | "cyan" | "indigo" | "purple" | "rose" | "orange" | "olive" | "slate" | undefined;
                avatarVariant?: "classic" | "glasses" | "spout" | "baby" | "hat" | "sleeping" | "auto" | undefined;
            } | undefined;
            childSessionId?: string | undefined;
            stopReason?: string | undefined;
        }[];
        hasEarlier: boolean;
        latest?: {
            seq: number;
            at: number;
            speaker?: {
                bot: {
                    botId: string;
                    botCreatedAt: number;
                };
                name: string;
                avatar?: string | undefined;
                avatarColor?: "--dsw-alias-state-business-primary" | "--dsw-alias-state-success-primary" | "--dsw-alias-state-warn-label" | "--dsw-alias-state-error-primary" | "teal" | "cyan" | "indigo" | "purple" | "rose" | "orange" | "olive" | "slate" | undefined;
                avatarVariant?: "classic" | "glasses" | "spout" | "baby" | "hat" | "sleeping" | "auto" | undefined;
            } | undefined;
        } | undefined;
        reason?: "recovery-needed" | "root-owned-elsewhere" | "root-unavailable" | undefined;
    }>;
    send(group: GroupKey, input: unknown): Promise<{
        id: string;
        group: {
            groupId: string;
            groupCreatedAt: number;
        };
        operationId: string;
        requestDigest: string;
        inputMessageId: string;
        createdAt: number;
        updatedAt: number;
        revision: number;
        schemaVersion: 1;
        membershipRevision: number;
        orderedMemberIds: string[];
        mode: "natural" | "mention" | "round-robin";
        contextThroughSeq: number;
        state: "completed" | "cancelled" | "idle" | "running" | "accepted" | "recovery_needed" | "paused" | "partial";
        inputSeq?: number | undefined;
        modelSelection?: {
            provider: string;
            model: string;
            reasoningEffort?: string | undefined;
        } | undefined;
        memberModelSelections?: {
            memberId: string;
            modelSelection: {
                provider: string;
                model: string;
                reasoningEffort?: string | undefined;
            };
        }[] | undefined;
        predecessorTurnIds?: string[] | undefined;
        followups?: {
            operationId: string;
            requestDigest: string;
            deliveryId: string;
            messageId: string;
            state: "unknown" | "dispatching" | "accepted";
            childMessageId?: string | undefined;
        }[] | undefined;
        replyTo?: string | undefined;
        protocol?: 2 | undefined;
        automaticExecutions?: number | undefined;
        continuationAllowance?: number | undefined;
        stoppedMemberIds?: string[] | undefined;
    }>;
    cancel(group: GroupKey, turnId: string, expectedRevision: number): Promise<{
        id: string;
        group: {
            groupId: string;
            groupCreatedAt: number;
        };
        operationId: string;
        requestDigest: string;
        inputMessageId: string;
        createdAt: number;
        updatedAt: number;
        revision: number;
        schemaVersion: 1;
        membershipRevision: number;
        orderedMemberIds: string[];
        mode: "natural" | "mention" | "round-robin";
        contextThroughSeq: number;
        state: "completed" | "cancelled" | "idle" | "running" | "accepted" | "recovery_needed" | "paused" | "partial";
        inputSeq?: number | undefined;
        modelSelection?: {
            provider: string;
            model: string;
            reasoningEffort?: string | undefined;
        } | undefined;
        memberModelSelections?: {
            memberId: string;
            modelSelection: {
                provider: string;
                model: string;
                reasoningEffort?: string | undefined;
            };
        }[] | undefined;
        predecessorTurnIds?: string[] | undefined;
        followups?: {
            operationId: string;
            requestDigest: string;
            deliveryId: string;
            messageId: string;
            state: "unknown" | "dispatching" | "accepted";
            childMessageId?: string | undefined;
        }[] | undefined;
        replyTo?: string | undefined;
        protocol?: 2 | undefined;
        automaticExecutions?: number | undefined;
        continuationAllowance?: number | undefined;
        stoppedMemberIds?: string[] | undefined;
    }>;
    continueTurn(group: GroupKey, turnId: string, expectedRevision: number): Promise<{
        updatedAt: number;
        revision: number;
        id: string;
        group: {
            groupId: string;
            groupCreatedAt: number;
        };
        operationId: string;
        requestDigest: string;
        inputMessageId: string;
        createdAt: number;
        schemaVersion: 1;
        membershipRevision: number;
        orderedMemberIds: string[];
        mode: "natural" | "mention" | "round-robin";
        contextThroughSeq: number;
        state: "completed" | "cancelled" | "idle" | "running" | "accepted" | "recovery_needed" | "paused" | "partial";
        inputSeq?: number | undefined;
        modelSelection?: {
            provider: string;
            model: string;
            reasoningEffort?: string | undefined;
        } | undefined;
        memberModelSelections?: {
            memberId: string;
            modelSelection: {
                provider: string;
                model: string;
                reasoningEffort?: string | undefined;
            };
        }[] | undefined;
        predecessorTurnIds?: string[] | undefined;
        followups?: {
            operationId: string;
            requestDigest: string;
            deliveryId: string;
            messageId: string;
            state: "unknown" | "dispatching" | "accepted";
            childMessageId?: string | undefined;
        }[] | undefined;
        replyTo?: string | undefined;
        protocol?: 2 | undefined;
        automaticExecutions?: number | undefined;
        continuationAllowance?: number | undefined;
        stoppedMemberIds?: string[] | undefined;
    }>;
    stopMember(group: GroupKey, turnId: string, memberId: string, expectedRevision: number): Promise<{
        updatedAt: number;
        revision: number;
        id: string;
        group: {
            groupId: string;
            groupCreatedAt: number;
        };
        operationId: string;
        requestDigest: string;
        inputMessageId: string;
        createdAt: number;
        schemaVersion: 1;
        membershipRevision: number;
        orderedMemberIds: string[];
        mode: "natural" | "mention" | "round-robin";
        contextThroughSeq: number;
        state: "completed" | "cancelled" | "idle" | "running" | "accepted" | "recovery_needed" | "paused" | "partial";
        inputSeq?: number | undefined;
        modelSelection?: {
            provider: string;
            model: string;
            reasoningEffort?: string | undefined;
        } | undefined;
        memberModelSelections?: {
            memberId: string;
            modelSelection: {
                provider: string;
                model: string;
                reasoningEffort?: string | undefined;
            };
        }[] | undefined;
        predecessorTurnIds?: string[] | undefined;
        followups?: {
            operationId: string;
            requestDigest: string;
            deliveryId: string;
            messageId: string;
            state: "unknown" | "dispatching" | "accepted";
            childMessageId?: string | undefined;
        }[] | undefined;
        replyTo?: string | undefined;
        protocol?: 2 | undefined;
        automaticExecutions?: number | undefined;
        continuationAllowance?: number | undefined;
        stoppedMemberIds?: string[] | undefined;
    }>;
    archive(group: GroupKey, expectedRevision: number): Promise<{
        archived: boolean;
        revision: number;
        updatedAt: number;
        id: string;
        operationId: string;
        createDigest: string;
        createdAt: number;
        schemaVersion: 1;
        name: string;
        rootSessionId: string;
        rootPresetId: "dsh-bot-group-root";
        cwd: string;
        mode: "natural" | "mention" | "round-robin";
        membershipRevision: number;
        state: "ready" | "creating" | "recovery_needed";
        modelSelection?: {
            provider: string;
            model: string;
            reasoningEffort?: string | undefined;
        } | undefined;
        memberModelSelections?: {
            memberId: string;
            modelSelection: {
                provider: string;
                model: string;
                reasoningEffort?: string | undefined;
            };
        }[] | undefined;
        modelRevision?: number | undefined;
        nextMemberId?: string | undefined;
    }>;
}
declare module '@deepseek-ai/cordis' {
    interface Context {
        dshBotGroupsRemote: GroupsRemote;
    }
}
