import type { BotKey } from '../../shared/identity.js';
import type { MemoryRecord } from '../../shared/schema.js';
import type { MemoryKernel } from './op-log.js';
export declare function privateVersion(kernel: MemoryKernel, record: MemoryRecord, owner: BotKey, ids?: {
    memoryId: string;
    versionId: string;
    contentRef: string;
    revision: number;
}, channel?: 'legacy' | 'model' | 'management'): {
    version: {
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
    };
    payload: {
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
    };
};
