import type { Context } from '@deepseek-ai/cordis';
import type { AgentHandle } from '@deepseek-ai/dsh-agent';
import { type GroupRecord, type GroupKey } from '../../shared/groups.js';
import type { GroupState, GroupRoot } from './state.js';
export declare class GroupRoots {
    private state;
    constructor(state: GroupState);
    start(): Promise<void>;
    setup(ctx: Context): Promise<void>;
    own(handle: AgentHandle): GroupRoot;
    release(root: GroupRoot): Promise<void>;
    flush(handle: Pick<GroupRoot, 'agent'>): Promise<void>;
    rename(g: GroupRecord, check?: () => void): Promise<string>;
    private valid;
    /** Register/attach through the public canonical-cwd workspace registry; never move a legacy cwd. */
    workspace(g: GroupRecord, check?: () => void): Promise<import("@deepseek-ai/dsh-workspace").Workspace>;
    initialize(g: GroupRecord, root: GroupRoot, operation: 'create' | 'restore' | 'open'): Promise<void>;
    open(key: GroupKey): Promise<{
        sessionId: string;
        workspaceId: string;
    }>;
    /** Publish only after title persistence succeeds; a borrowed Agent is never ours to dispose. */
    private publish;
    restore(g: GroupRecord): Promise<GroupRoot>;
}
