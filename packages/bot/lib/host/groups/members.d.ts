import { type GroupKey } from '../../shared/groups.js';
import type { GroupState } from './state.js';
import type { GroupRoots } from './roots.js';
export declare class GroupMembers {
    private state;
    private roots;
    constructor(state: GroupState, roots: GroupRoots);
    create(value: unknown): Promise<{
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
    /** A group-local override: never changes the Host default or active worker selections. */
    setModel(key: GroupKey, value: unknown): Promise<{
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
    edit(key: GroupKey, value: unknown): Promise<{
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
}
