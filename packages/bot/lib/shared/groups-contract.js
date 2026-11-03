import { z } from 'zod';
import { createTypertRemoteInfo } from '@deepseek-ai/dsh-typert-protocol/remote-info';
import { groupKeySchema, groupCreateSchema, groupEditSchema, groupSendSchema, groupSetModelSchema, groupPageSchema, groupRecordSchema, groupSummarySchema, groupTurnSchema, groupViewSchema, } from './groups.js';
const codec = (name, schema) => ({
    mode: 'strict',
    typeSymbol: `dsh-bot/groups#${name}`,
    create: () => schema,
    encode: (v) => schema.parse(v),
    decode: (v) => schema.parse(v),
});
const param = (name, schema) => ({
    name,
    source: 'json',
    codec: codec(name, schema),
    strictCodec: codec(name, schema),
});
const base = { service: 'dshBotGroupsRemote', invocation: { kind: 'direct' } };
export const groupsSpec = {
    package: 'dsh-bot/groups',
    methods: {
        'dshBot.groups/open': {
            ...base, parameters: [param('group', groupKeySchema)],
            result: codec('OpenedGroup', z.strictObject({ sessionId: z.string().min(1), workspaceId: z.string().min(1) })),
        },
        'dshBot.groups/openAttachment': {
            ...base,
            parameters: [param('group', groupKeySchema), param('messageId', z.string().min(1)), param('attachmentId', z.string().min(1))],
            result: codec('OpenedAttachment', z.strictObject({ opened: z.literal(true) })),
        },
        'dshBot.groups/markRead': {
            ...base,
            parameters: [
                param('group', groupKeySchema),
                param('throughSeq', z.number().int().nonnegative()),
                param('expectedRevision', z.number().int().nonnegative()),
            ],
            result: codec('Read', z.boolean()),
        },
        'dshBot.groups/list': { ...base, parameters: [], result: codec('List', z.array(groupSummarySchema)) },
        'dshBot.groups/create': {
            ...base,
            parameters: [param('input', groupCreateSchema)],
            result: codec('Group', groupRecordSchema),
        },
        'dshBot.groups/edit': {
            ...base,
            parameters: [param('group', groupKeySchema), param('input', groupEditSchema)],
            result: codec('Group', groupRecordSchema),
        },
        'dshBot.groups/setModel': {
            ...base,
            parameters: [param('group', groupKeySchema), param('input', groupSetModelSchema)],
            result: codec('Group', groupRecordSchema),
        },
        'dshBot.groups/view': {
            ...base,
            parameters: [param('group', groupKeySchema), param('page', groupPageSchema)],
            result: codec('View', groupViewSchema),
        },
        'dshBot.groups/send': {
            ...base,
            parameters: [param('group', groupKeySchema), param('input', groupSendSchema)],
            result: codec('Turn', groupTurnSchema),
        },
        'dshBot.groups/cancel': {
            ...base,
            parameters: [
                param('group', groupKeySchema),
                param('turnId', z.string().min(1)),
                param('expectedRevision', z.number().int().positive()),
            ],
            result: codec('Turn', groupTurnSchema),
        },
        'dshBot.groups/continueTurn': {
            ...base, parameters: [param('group', groupKeySchema), param('turnId', z.string().min(1)), param('expectedRevision', z.number().int().positive())],
            result: codec('Turn', groupTurnSchema),
        },
        'dshBot.groups/stopMember': {
            ...base, parameters: [param('group', groupKeySchema), param('turnId', z.string().min(1)), param('memberId', z.string().min(1)), param('expectedRevision', z.number().int().positive())],
            result: codec('Turn', groupTurnSchema),
        },
        'dshBot.groups/archive': {
            ...base,
            parameters: [param('group', groupKeySchema), param('expectedRevision', z.number().int().positive())],
            result: codec('Group', groupRecordSchema),
        },
    },
};
export const GROUPS_REMOTE = createTypertRemoteInfo(groupsSpec, z);
//# sourceMappingURL=groups-contract.js.map
export const DSH_BOT_MODULE_VERSION = '0.6.3';
