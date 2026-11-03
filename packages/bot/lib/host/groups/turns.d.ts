import { type GroupKey } from '../../shared/groups.js';
import type { GroupState } from './state.js';
import type { GroupRoots } from './roots.js';
import type { GroupMessages } from './messages.js';
import type { GroupTurnRunner } from './turn-runner.js';
export declare class GroupTurns {
    private state;
    private roots;
    private messages;
    private runner;
    constructor(state: GroupState, roots: GroupRoots, messages: GroupMessages, runner: GroupTurnRunner);
    send(key: GroupKey, value: unknown): Promise<{
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
    /** Queue-owned, durable acceptance prevents re-dispatch after an unknown native outcome. */
    private followup;
    cancel(key: GroupKey, turnId: string, revision: number): Promise<{
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
    continueTurn(key: GroupKey, turnId: string, revision: number): Promise<{
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
    stopMember(key: GroupKey, turnId: string, memberId: string, revision: number): Promise<{
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
    archive(key: GroupKey, revision: number): Promise<{
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
