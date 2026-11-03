import { SessionId } from '@deepseek-ai/dsh-session';
import type { Agent } from '@deepseek-ai/dsh-agent';
import type { BotKey } from '../../shared/identity.js';
import type { GroupRecord } from '../../shared/groups.js';
import type { GroupState } from './state.js';
export declare function audience(state: GroupState, g: GroupRecord): {
    kind: "group";
    groupId: string;
    groupCreatedAt: number;
    members: {
        botId: string;
        botCreatedAt: number;
    }[];
};
export declare function groupInput(state: GroupState, g: GroupRecord, root: Agent, content: string, call: string): Promise<string | undefined>;
export declare function groupChild(state: GroupState, g: GroupRecord, root: Agent, bot: BotKey, content: string, call: string, signal: AbortSignal): Promise<{
    id: string;
    childId: SessionId;
} | undefined>;
export declare function groupResult<T>(state: GroupState, g: GroupRecord, bot: BotKey, childId: string, root: Agent, content: string, call: string, send: () => T, signal: AbortSignal): Promise<T>;
export declare function followupInput<T>(state: GroupState, g: GroupRecord, root: Agent, bot: BotKey, childId: string, content: string, call: string, signal: AbortSignal, send: () => Promise<T>): Promise<T>;
