import type { WorkerBinding } from './worker-tool.js';
import type { Context } from '@deepseek-ai/cordis';
import type { Agent, AgentHandle } from '@deepseek-ai/dsh-agent';
import type { SubagentActivation } from '@deepseek-ai/dsh-subagent';
import type { Domain } from '@deepseek-ai/dsh-storage-domain';
import { type GroupKey, type GroupRecord, type GroupDelivery, type GroupTurn } from '../../shared/groups.js';
import type { BotKey } from '../../shared/integrations.js';
import type { DshBotRegistry } from '../registry.js';
import { Serial } from '../common/operations.js';
import type { groupsDomain } from './model.js';
/** A Controller-owned root is borrowed as an Agent reference, never fabricated as an AgentHandle. */
export type GroupRoot = {
    ownership: 'owned';
    agent: Agent;
    handle: AgentHandle;
} | {
    ownership: 'borrowed';
    agent: Agent;
};
/** Shared per-service state: one queue and one set of ownership/cancellation maps. */
export declare class GroupState {
    ctx: Context;
    registry: DshBotRegistry;
    domain: Domain<typeof groupsDomain>;
    changed: () => void;
    queue: Serial;
    workers: Map<string, WorkerBinding>;
    offWorkers?: () => void;
    stopped: boolean;
    shutdownPhase: string;
    closing?: Promise<void>;
    roots: Map<string, GroupRoot>;
    reasons: Map<string, "recovery-needed" | "root-owned-elsewhere" | "root-unavailable" | undefined>;
    private scheduling;
    chains: Map<string, Promise<void>>;
    controllers: Map<string, AbortController>;
    activations: Map<string, SubagentActivation>;
    settledInputs: Set<string>;
    inputAdmissions: Map<string, AbortController>;
    wakeTurns: Map<string, () => void>;
    cancelledTurns: Set<string>;
    unregister?: () => Promise<void>;
    offTitle?: () => void;
    repairing: Set<string>;
    naming: Set<string>;
    titles: Map<string, string>;
    startup: AbortController;
    constructor(ctx: Context, registry: DshBotRegistry, domain: Domain<typeof groupsDomain>, changed: () => void);
    /** Bounded FIFO admission: any released slot may start the next independent work. */
    schedule(groupId: string, limit: number, run: () => Promise<void>): Promise<void>;
    table<K extends 'groups' | 'members' | 'turns' | 'deliveries' | 'read_state'>(key: K): import("@deepseek-ai/dsh-storage-domain").KvTable<import("@deepseek-ai/dsh-storage-domain").TableKeyOf<{
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
    }, K>, import("@deepseek-ai/dsh-storage-domain").TableValueOf<{
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
    }, K>>;
    check(): void;
    record(key: GroupKey): {
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
    members(g: GroupRecord): {
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
    deliveries(turn: string): {
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
    turns(g: GroupRecord): {
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
    putGroup(g: GroupRecord): Promise<void>;
    putTurn(t: GroupTurn): Promise<{
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
    putDelivery(d: GroupDelivery): Promise<void>;
    route(): import("@deepseek-ai/dsh-agent").ModelSelection;
    bot(key: BotKey): Promise<{
        name: string;
        description: string;
        persona: {
            prefix: string;
            suffix?: string | undefined;
            complete?: boolean | undefined;
        };
        template: "standard" | "minimal";
        tools: {
            deny: string[];
        };
        skills: {
            extraDirs: string[];
        };
        memory: {
            enabled: boolean;
            injectLimit: number;
        };
        mcpServers: {
            serverName: string;
            transport: "stdio" | "streamable-http";
            command?: string | undefined;
            args?: string[] | undefined;
            url?: string | undefined;
            envRefs?: Record<string, string> | undefined;
        }[];
        channels: {
            kind: "feishu" | "telegram" | "slack" | "email" | "desktop";
            target: string;
            policy: {
                dailyLimit: number;
                cooldownSec: number;
                quietHours?: [string, string] | undefined;
            };
            credentialRef?: string | undefined;
        }[];
        id: string;
        createdAt: number;
        updatedAt: number;
        schemaVersion: 1;
        avatar?: string | undefined;
        avatarColor?: "--dsw-alias-state-business-primary" | "--dsw-alias-state-success-primary" | "--dsw-alias-state-warn-label" | "--dsw-alias-state-error-primary" | "teal" | "cyan" | "indigo" | "purple" | "rose" | "orange" | "olive" | "slate" | undefined;
        avatarVariant?: "classic" | "glasses" | "spout" | "baby" | "hat" | "sleeping" | "auto" | undefined;
        model?: {
            provider: string;
            model: string;
            reasoningEffort?: string | undefined;
        } | undefined;
        defaultCwd?: string | undefined;
        order?: number | undefined;
        onboarding?: {
            operationId: string;
            language: "en" | "zh";
            policyVersion: 1;
            inputDigest: string;
        } | undefined;
    }>;
    validateMembers(keys: BotKey[]): Promise<void>;
}
