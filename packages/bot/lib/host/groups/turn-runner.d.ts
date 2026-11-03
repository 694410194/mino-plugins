import type { Agent } from '@deepseek-ai/dsh-agent';
import type { z } from 'zod';
import type { WorkerBinding, groupToolInput } from './worker-tool.js';
import type { SubagentResult } from '@deepseek-ai/dsh-subagent';
import type { GroupDelivery, GroupTurn } from '../../shared/groups.js';
import type { GroupState } from './state.js';
import type { GroupRoots } from './roots.js';
import type { GroupMessages } from './messages.js';
export declare class GroupTurnRunner {
    private state;
    private roots;
    private messages;
    private concurrent;
    constructor(state: GroupState, roots: GroupRoots, messages: GroupMessages);
    /** Called inside the service queue. A delivery receipt is the durable acceptance point. */
    enqueue(t: GroupTurn, memberId: string, triggerMessageId: string, id: string, returnMemberId?: string, requestDigest?: string): Promise<{
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
    groupMessage(agent: Agent, binding: WorkerBinding, input: z.output<typeof groupToolInput>, callId: string, signal: AbortSignal): Promise<{
        status: string;
        messageId?: undefined;
    } | {
        status: string;
        messageId: string | undefined;
    }>;
    prepareDelivery(t: GroupTurn, deliveryId: string, signal: AbortSignal): Promise<{
        root: {
            ownership: "owned";
            agent: Agent;
            handle: import("@deepseek-ai/dsh-agent").AgentHandle;
        } | {
            ownership: "borrowed";
            agent: Agent;
        };
        bot: {
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
        };
        d: {
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
        };
        context: {
            text: string;
            truncated: boolean;
            outputIds: string[];
        };
        attachmentBlocks: import("@deepseek-ai/dsh-llm").ContentBlock[];
        route: import("@deepseek-ai/dsh-agent").ModelSelection;
        modelSelection: {
            provider: string;
            model: string;
            reasoningEffort?: string | undefined;
        } | undefined;
    } | undefined>;
    recordDeliveryResult(t: GroupTurn, deliveryId: string, prepared: NonNullable<Awaited<ReturnType<GroupTurnRunner['prepareDelivery']>>>, childId: string, result: SubagentResult, signal: AbortSignal): Promise<void>;
    deliver(t: GroupTurn, d0: GroupDelivery, deadline: number): Promise<void>;
    execute(id: string): Promise<void>;
}
