import { z } from 'zod';
import { createTypertRemoteInfo } from '@deepseek-ai/dsh-typert-protocol/remote-info';
import { graphRequestSchema, graphResultSchema } from './reference-memory.js';
import { workspaceRequestSchema, workspaceResultSchema } from './workspace.js';
const codec = (schema) => ({
    mode: 'strict',
    typeSymbol: 'dsh-bot/workspace#Value',
    create: () => schema,
    encode: (v) => schema.parse(v),
    decode: (v) => schema.parse(v),
});
const parameter = (schema) => ({
    name: 'input',
    source: 'json',
    codec: codec(schema),
    strictCodec: codec(schema),
});
export const workspaceSpec = {
    package: 'dsh-bot/workspace',
    methods: {
        'dshBot.workspace/request': {
            service: 'dshBotWorkspaceRemote',
            invocation: { kind: 'direct' },
            parameters: [parameter(workspaceRequestSchema)],
            result: codec(workspaceResultSchema),
        },
        'dshBot.referenceMemory/request': {
            service: 'dshBotReferenceMemoryRemote',
            invocation: { kind: 'direct' },
            parameters: [parameter(graphRequestSchema)],
            result: codec(graphResultSchema),
        },
    },
};
export const WORKSPACE_REMOTE = createTypertRemoteInfo(workspaceSpec, z);
//# sourceMappingURL=workspace-contract.js.map
export const DSH_BOT_MODULE_VERSION = '0.6.3';
