import type { GroupRecord, GroupMember, GroupMessage } from '../../shared/groups.js';
export declare function routeMembers(group: GroupRecord, members: GroupMember[], mentions: string[], round: boolean, maxTurns: number): GroupMember[];
/** Whole messages only; no model summarizer and no future queued input. */
export declare function groupContext(name: string, target: string, members: string[], question: GroupMessage, history: GroupMessage[], previous: GroupMessage[], maxBytes: number): {
    text: string;
    truncated: boolean;
    outputIds: string[];
};
