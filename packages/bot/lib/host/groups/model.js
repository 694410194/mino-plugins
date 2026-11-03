import { defineDomain, domainTable } from '@deepseek-ai/dsh-storage-domain';
import { groupRecordSchema, groupMemberSchema, groupTurnSchema, groupDeliverySchema, groupReadSchema, } from '../../shared/groups.js';
export const groupsDomain = defineDomain({
    name: 'dsh_bot_groups',
    version: 1,
    tables: {
        groups: domainTable(groupRecordSchema),
        members: domainTable(groupMemberSchema),
        turns: domainTable(groupTurnSchema),
        deliveries: domainTable(groupDeliverySchema),
        read_state: domainTable(groupReadSchema),
    },
});
export const sameBot = (a, b) => a.botId === b.botId && a.botCreatedAt === b.botCreatedAt;
export const blocks = (text) => [{ type: 'text', text }];
export const textOf = (content) => content
    .filter((b) => b.type === 'text' && typeof b.text === 'string')
    .map((b) => b.text)
    .join('\n');
export const terminal = (turn) => !['accepted', 'running'].includes(turn.state);
//# sourceMappingURL=model.js.map
export const DSH_BOT_MODULE_VERSION = '0.6.3';
