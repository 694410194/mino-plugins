import { type GroupKey, type GroupTurn, type GroupSpeaker } from '../../shared/groups.js';
import type { BotKey } from '../../shared/integrations.js';
declare module '@deepseek-ai/dsh-llm' {
    interface MessageSourceMap {
        'dsh-bot-group-setup': {
            kind: 'dsh-bot-group-setup';
            group: GroupKey;
            operation: 'create' | 'restore' | 'open';
            operationId: string;
        };
        'dsh-bot-group-user': {
            kind: 'dsh-bot-group-user';
            group: GroupKey;
            turnId: string;
            replyTo?: string;
            rpcId?: string;
        };
        'dsh-bot-group-followup': {
            kind: 'dsh-bot-group-followup';
            group: GroupKey;
            turnId: string;
            deliveryId: string;
            replyTo: string;
        };
        'dsh-bot-group': {
            kind: 'dsh-bot-group';
            group: GroupKey;
            turnId: string;
            memberId: string;
            speaker: GroupSpeaker;
            childSessionId: string;
            stopReason: string;
            replyTo?: string;
            causeId?: string;
        };
    }
}
export declare const groupsDomain: {
    name: string;
    version: number;
    tables: {
        groups: import("@deepseek-ai/dsh-storage-domain").DomainTableSpec<string, {
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
        members: import("@deepseek-ai/dsh-storage-domain").DomainTableSpec<string, {
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
        }>;
        turns: import("@deepseek-ai/dsh-storage-domain").DomainTableSpec<string, {
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
        deliveries: import("@deepseek-ai/dsh-storage-domain").DomainTableSpec<string, {
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
        }>;
        read_state: import("@deepseek-ai/dsh-storage-domain").DomainTableSpec<string, {
            id: string;
            group: {
                groupId: string;
                groupCreatedAt: number;
            };
            throughSeq: number;
            revision: number;
            createdAt: number;
            updatedAt: number;
            schemaVersion: 1;
        }>;
    };
};
export declare const sameBot: (a: BotKey, b: BotKey) => boolean;
export declare const blocks: (text: string) => {
    type: "text";
    text: string;
}[];
export declare const textOf: (content: readonly {
    type: string;
    text?: unknown;
}[]) => string;
export declare const terminal: (turn: GroupTurn) => boolean;
