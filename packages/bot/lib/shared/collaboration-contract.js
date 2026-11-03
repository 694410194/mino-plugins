import { z } from 'zod';
import { createTypertRemoteInfo } from '@deepseek-ai/dsh-typert-protocol/remote-info';
import { botKeySchema } from './integrations.js';
import { imStatusSchema, teamBoardSchema, teamLinkSchema, teamTaskInputSchema, teamTaskSchema, teamUpdateSchema, } from './collaboration.js';
const codec = (name, schema) => ({
    mode: 'strict',
    typeSymbol: `dsh-bot/collaboration#${name}`,
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
const base = { service: 'dshBotCollaborationRemote', invocation: { kind: 'direct' } };
export const collaborationSpec = {
    package: 'dsh-bot/collaboration',
    methods: {
        'dshBot.collaboration/board': {
            ...base,
            parameters: [param('bot', botKeySchema)],
            result: codec('Board', teamBoardSchema),
        },
        'dshBot.collaboration/ensure': {
            ...base,
            parameters: [param('bot', botKeySchema), param('expectedRevision', z.number().int().nonnegative())],
            result: codec('Link', teamLinkSchema),
        },
        'dshBot.collaboration/createTask': {
            ...base,
            parameters: [param('bot', botKeySchema), param('input', teamTaskInputSchema)],
            result: codec('Task', teamTaskSchema),
        },
        'dshBot.collaboration/updateTask': {
            ...base,
            parameters: [param('bot', botKeySchema), param('input', teamUpdateSchema)],
            result: codec('Task', teamTaskSchema),
        },
        'dshBot.im/status': {
            ...base,
            service: 'dshBotImRemote',
            parameters: [],
            result: codec('ImStatus', imStatusSchema),
        },
    },
};
export const COLLABORATION_REMOTE = createTypertRemoteInfo(collaborationSpec, z);
//# sourceMappingURL=collaboration-contract.js.map
export const DSH_BOT_MODULE_VERSION = '0.6.3';
