import type { Context } from '@deepseek-ai/cordis';
import type { Domain } from '@deepseek-ai/dsh-storage-domain';
import type { DshBotRegistry } from '../registry.js';
import type { groupsDomain } from './model.js';
import { GroupRoots } from './roots.js';
import { GroupMembers } from './members.js';
import { GroupMessages } from './messages.js';
import { GroupTurns } from './turns.js';
export { groupsDomain } from './model.js';
/** Public facade: compose domain modules and own their coordinated shutdown. */
export declare class Groups {
    private state;
    private roots;
    private membership;
    private messages;
    private turns;
    constructor(ctx: Context, registry: DshBotRegistry, domain: Domain<typeof groupsDomain>, changed: () => void);
    lifecycle(): {
        phase: string;
        ownedRoots: number;
        workers: number;
        activations: number;
    };
    start(...args: Parameters<GroupRoots['start']>): Promise<void>;
    open(...args: Parameters<GroupRoots['open']>): Promise<{
        sessionId: string;
        workspaceId: string;
    }>;
    create(...args: Parameters<GroupMembers['create']>): Promise<{
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
    edit(...args: Parameters<GroupMembers['edit']>): Promise<{
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
    setModel(...args: Parameters<GroupMembers['setModel']>): Promise<{
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
    openAttachment(...args: Parameters<GroupMessages['openAttachment']>): Promise<import("@deepseek-ai/dsh-api-session-controller").SessionOpenWorkspacePathValue>;
    markRead(...args: Parameters<GroupMessages['markRead']>): Promise<boolean>;
    list(...args: Parameters<GroupMessages['list']>): Promise<{
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
    view(...args: Parameters<GroupMessages['view']>): Promise<{
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
    send(...args: Parameters<GroupTurns['send']>): Promise<{
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
    cancel(...args: Parameters<GroupTurns['cancel']>): Promise<{
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
    continueTurn(...args: Parameters<GroupTurns['continueTurn']>): Promise<{
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
    stopMember(...args: Parameters<GroupTurns['stopMember']>): Promise<{
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
    archive(...args: Parameters<GroupTurns['archive']>): Promise<{
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
    close(): Promise<void>;
}
declare module '@deepseek-ai/cordis' {
    interface Context {
        dshBotGroups: Groups;
    }
}
