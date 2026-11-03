import { type Domain } from '@deepseek-ai/dsh-storage-domain';
export declare const memoryDomain: {
    name: string;
    version: number;
    layout: "per-record";
    tables: {
        layout: import("@deepseek-ai/dsh-storage-domain").DomainTableSpec<string, {
            phase: "copied" | "ready";
        }>;
        meta: import("@deepseek-ai/dsh-storage-domain").DomainTableSpec<string, {
            scope: {
                id: string;
                createdAt: number;
            };
            policyRevision: number;
            quotaTimeZone: string;
        }>;
        ops: import("@deepseek-ai/dsh-storage-domain").DomainTableSpec<string, {
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
        payloads: import("@deepseek-ai/dsh-storage-domain").DomainTableSpec<string, {
            content: string;
            valid: {
                from: number | null;
                to: number | null;
                basis: "unknown" | "explicit" | "message-default";
            };
            subject?: string | undefined;
            factKey?: string | undefined;
            qualifiers?: Record<string, string> | undefined;
            sourceExcerpt?: string | undefined;
            confirmation?: string | undefined;
            localException?: boolean | undefined;
            botSnapshot?: {
                name: string;
                avatar?: string | undefined;
                avatarColor?: "--dsw-alias-state-business-primary" | "--dsw-alias-state-success-primary" | "--dsw-alias-state-warn-label" | "--dsw-alias-state-error-primary" | "teal" | "cyan" | "indigo" | "purple" | "rose" | "orange" | "olive" | "slate" | undefined;
                avatarVariant?: "classic" | "glasses" | "spout" | "baby" | "hat" | "sleeping" | "auto" | undefined;
            } | undefined;
            legacy?: {
                kind: "profile" | "preference" | "fact" | "note";
                tags: string[];
                pinned: boolean;
                id: string;
                botId: string;
                createdAt: number;
                updatedAt: number;
                source?: {
                    at: number;
                    by: "model" | "user";
                    sessionId?: string | undefined;
                } | undefined;
            } | undefined;
        }>;
        projections: import("@deepseek-ai/dsh-storage-domain").DomainTableSpec<string, unknown>;
        barriers: import("@deepseek-ai/dsh-storage-domain").DomainTableSpec<string, {
            id: string;
            epoch: number;
            targets: string[];
            affectedSessionIds: string[];
            state: "intent" | "stopped" | "cleaning" | "blocked" | "verified";
            scope: "shared" | "private";
            previewRevision: number;
            receipts: string[];
        }>;
        receipts: import("@deepseek-ai/dsh-storage-domain").DomainTableSpec<string, {
            id: string;
            epoch: number;
            sessionId: string;
            versionIds: string[];
            state: "blocked" | "verified" | "read";
        }>;
        migration: import("@deepseek-ai/dsh-storage-domain").DomainTableSpec<string, {
            id: string;
            sourceSchema: 1;
            targetSchema: 2;
            phase: "prepare" | "copy" | "verify" | "cutover" | "legacy-clean" | "done";
            counts: {
                source: number;
                copied: number;
                quarantined: number;
            };
            cutoverSeq: number;
            forgetEpoch: number;
            sourceDigest?: string | undefined;
        }>;
        migration_items: import("@deepseek-ai/dsh-storage-domain").DomainTableSpec<string, {
            legacyId: string;
            memoryId: string;
            versionId: string;
            opId: string;
            contentRef: string;
            quarantine: boolean;
        }>;
        forget_jobs: import("@deepseek-ai/dsh-storage-domain").DomainTableSpec<string, {
            id: string;
            targets: string[];
            sessionIds: string[];
            epoch: number;
            revision: number;
            choice: "stop" | "clean";
            phase: "intent" | "stopped" | "cleaning" | "blocked" | "verified";
            reasons: ("unavailable" | "copies" | "history" | "system-head" | "inbox" | "root-instructions" | "raw-read-policy" | "inventory" | "flush")[];
            historyVerified: string[];
            copiesVerified: boolean;
            verificationReceipt?: string | undefined;
            blockedHeads?: string[] | undefined;
            pendingInbox?: boolean | undefined;
        }>;
        flows: import("@deepseek-ai/dsh-storage-domain").DomainTableSpec<string, {
            id: string;
            state: "unknown" | "dispatching" | "admitted" | "delivered" | "cancelled";
            envelope?: {
                binding: {
                    userScope: string;
                    bot: {
                        botId: string;
                        botCreatedAt: number;
                    };
                    invocation: string;
                    payloadVersion: string;
                    sourceVersions: string[];
                    sourceRefs: {
                        sessionId?: string | undefined;
                        eventSeq?: number | undefined;
                        callId?: string | undefined;
                        parentVersionId?: string | undefined;
                        entryReceiptId?: string | undefined;
                        managementOpId?: string | undefined;
                    }[];
                    target: {
                        kind: "bot";
                        bot: {
                            botId: string;
                            botCreatedAt: number;
                        };
                    } | {
                        kind: "shared";
                    } | {
                        kind: "group";
                        groupId: string;
                        groupCreatedAt: number;
                        members: {
                            botId: string;
                            botCreatedAt: number;
                        }[];
                    } | {
                        kind: "external";
                        destination: string;
                    };
                    epoch: number;
                    policyRevision: number;
                };
                label: {
                    readers: "shared" | {
                        botId: string;
                        botCreatedAt: number;
                    }[];
                    originTrust: "candidate" | "user_stated" | "user_confirmed";
                    sourceVersions: string[];
                    restrictions: ("secret" | "no-egress" | "pending-cleanup" | "revoked")[];
                    grants: string[];
                };
                content: string;
                outlet: "message" | "group-input" | "group-result" | "delegate-input" | "delegate-result" | "notify-record" | "notify-send" | "mcp-copy" | "connector" | "auto-share";
            } | undefined;
            grantUse?: string | undefined;
        }>;
        flow_sessions: import("@deepseek-ai/dsh-storage-domain").DomainTableSpec<string, {
            sessionId: string;
            label: {
                readers: "shared" | {
                    botId: string;
                    botCreatedAt: number;
                }[];
                originTrust: "candidate" | "user_stated" | "user_confirmed";
                sourceVersions: string[];
                restrictions: ("secret" | "no-egress" | "pending-cleanup" | "revoked")[];
                grants: string[];
            };
        }>;
    };
};
export type MemoryDomain = Domain<Omit<typeof memoryDomain, 'layout'>>;
