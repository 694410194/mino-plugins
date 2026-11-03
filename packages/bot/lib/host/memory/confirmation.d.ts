import type { Agent } from '@deepseek-ai/dsh-agent';
import type { FlowBinding } from '../../shared/data-flow.js';
import { type BotKey } from '../../shared/identity.js';
import type { MemoryKernel } from './op-log.js';
import { OnceGrants, type OnceGrant } from '../data-flow/grants.js';
/** Native open-turn approval only. No tool/UI endpoint is added in B6a. */
export declare class MemoryConfirmation {
    private readonly kernel;
    private readonly currentBot;
    private readonly clock;
    readonly grants: OnceGrants;
    private readonly lifetime;
    constructor(kernel: MemoryKernel, currentBot: (key: BotKey) => boolean, ttlMs?: number, clock?: () => number);
    private source;
    binding(id: string, owner: BotKey, invocation: string): FlowBinding;
    request(agent: Agent, id: string, owner: BotKey, invocation: string, signal: AbortSignal): Promise<OnceGrant>;
    private copy;
    commit(id: string, owner: BotKey, invocation: string, grant: OnceGrant, signal: AbortSignal): Promise<{
        opId: string;
        seq: number;
        kind: "policy" | "revise" | "resolve" | "propose" | "accept" | "supersede" | "dispute" | "promote" | "forget" | "retire_shard" | "migration" | "cleanup";
        subjectIds: string[];
        payloadRefs: string[];
        expectedRevision: number;
        forgetEpoch: number;
        versions: ({
            scope: "private";
            ownerBotKey: {
                botId: string;
                botCreatedAt: number;
            };
            shard: {
                botId: string;
                botCreatedAt: number;
            };
            schemaVersion: 2;
            memoryId: string;
            versionId: string;
            userScope: string;
            contentRef: string;
            revision: number;
            commitSeq: number;
            kind: "user_fact" | "user_event" | "bot_role" | "how_to_work";
            recordedAt: number;
            sourceRefs: {
                sessionId?: string | undefined;
                eventSeq?: number | undefined;
                callId?: string | undefined;
                parentVersionId?: string | undefined;
                entryReceiptId?: string | undefined;
                managementOpId?: string | undefined;
            }[];
            provenance: {
                channel: "model" | "legacy" | "management";
                bot: {
                    botId: string;
                    botCreatedAt: number;
                };
            };
            trust: "candidate" | "user_stated" | "user_confirmed";
            status: "proposed" | "active" | "disputed" | "superseded" | "expired" | "rejected" | "forgotten";
            labels: {
                readers: "shared" | {
                    botId: string;
                    botCreatedAt: number;
                }[];
                originTrust: "candidate" | "user_stated" | "user_confirmed";
                sourceVersions: string[];
                restrictions: ("secret" | "no-egress" | "pending-cleanup" | "revoked")[];
                grants: string[];
            };
            legacyKind?: "profile" | "preference" | "fact" | "note" | undefined;
        } | {
            scope: "shared";
            shard: "user" | {
                botId: string;
                botCreatedAt: number;
            };
            schemaVersion: 2;
            memoryId: string;
            versionId: string;
            userScope: string;
            contentRef: string;
            revision: number;
            commitSeq: number;
            kind: "user_fact" | "user_event" | "bot_role" | "how_to_work";
            recordedAt: number;
            sourceRefs: {
                sessionId?: string | undefined;
                eventSeq?: number | undefined;
                callId?: string | undefined;
                parentVersionId?: string | undefined;
                entryReceiptId?: string | undefined;
                managementOpId?: string | undefined;
            }[];
            provenance: {
                channel: "model" | "legacy" | "management";
                bot: {
                    botId: string;
                    botCreatedAt: number;
                };
            };
            trust: "candidate" | "user_stated" | "user_confirmed";
            status: "proposed" | "active" | "disputed" | "superseded" | "expired" | "rejected" | "forgotten";
            labels: {
                readers: "shared" | {
                    botId: string;
                    botCreatedAt: number;
                }[];
                originTrust: "candidate" | "user_stated" | "user_confirmed";
                sourceVersions: string[];
                restrictions: ("secret" | "no-egress" | "pending-cleanup" | "revoked")[];
                grants: string[];
            };
            legacyKind?: "profile" | "preference" | "fact" | "note" | undefined;
        })[];
        receiptRefs: string[];
        owner?: {
            botId: string;
            botCreatedAt: number;
        } | undefined;
        autoPolicy?: {
            enabled: boolean;
            botDaily: number;
            domainDaily: number;
            timeZone: string;
            revision: number;
            hostConfig?: {
                enabled: boolean;
                botDaily: number;
                domainDaily: number;
                timeZone: string;
            } | undefined;
        } | undefined;
        quotaCharge?: {
            botId: string;
            bucket: number;
            end: number;
            timeZone: string;
            at: number;
        } | undefined;
        grantUse?: string | undefined;
    }>;
    close(): void;
}
