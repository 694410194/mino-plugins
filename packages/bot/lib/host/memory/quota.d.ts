import type { AutoSharePolicy } from '../../shared/data-flow.js';
import type { BotKey } from '../../shared/identity.js';
import type { Commit, MemoryKernel } from './op-log.js';
export type AutoPolicyInput = Omit<AutoSharePolicy, 'revision'>;
export declare class AutoShareQuota {
    readonly kernel: MemoryKernel;
    private readonly clock;
    constructor(kernel: MemoryKernel, clock?: () => number);
    get policy(): AutoSharePolicy;
    configureHost(input: Omit<AutoPolicyInput, 'hostConfig'>): Promise<void>;
    configure(input: AutoPolicyInput, expectedRevision?: number): Promise<void>;
    status(): {
        domainUsed: number;
        configured: boolean;
        effectiveAutoShare: false;
        reason: "unverifiable-user-input";
        botDaily: number;
        domainDaily: number;
        timeZone: string;
        revision: number;
    };
    private charge;
    /** Host-only accounting seam. Caller validates source capability; this method grants no user_stated authority.
     * Used by the future automatic outlet after its capability/checker gates, and synthetic accounting tests now.
     */
    commit(opId: string, owner: BotKey, policyRevision: number, build: () => Commit): Promise<{
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
}
