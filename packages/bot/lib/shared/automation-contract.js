/** Browser-safe, independent contribution; mounting P1 does not enable automation. */
import { createTypertRemoteInfo } from '@deepseek-ai/dsh-typert-protocol/remote-info';
import { z } from 'zod';
import { automationIdSchema, runListSchema, runRecordSchema } from './automation.js';
import { aggregateSchema } from './native-schedule.js';
const codec = (name, schema) => ({
    mode: 'strict',
    typeSymbol: `dsh-bot/automation#${name}`,
    create: () => schema,
    encode: (value) => schema.parse(value),
    decode: (value) => schema.parse(value),
});
const param = (name, schema) => {
    const value = codec(name, schema);
    return { name, source: 'json', codec: value, strictCodec: value };
};
const nativeOwner = { service: 'dshBotNativeSchedules', invocation: { kind: 'direct' } };
const runOwner = { service: 'dshBotRuns', invocation: { kind: 'direct' } };
export const automationStatusSchema = z.strictObject({
    state: z.enum(['starting', 'ready', 'failed', 'stopping']),
    reason: z.string().optional(),
});
export const automationRemoteSpec = {
    package: 'dsh-bot/automation',
    methods: {
        'dshBot.automation/status': {
            service: 'dshBotAutomation',
            invocation: { kind: 'direct' },
            parameters: [],
            result: codec('AutomationStatus', automationStatusSchema),
        },
        'dshBot.nativeSchedule/aggregate': { ...nativeOwner, parameters: [], result: codec('Aggregate', aggregateSchema) },
        'dshBot.nativeSchedule/deleteLegacy': {
            ...nativeOwner,
            parameters: [param('id', automationIdSchema)],
            result: codec('Deleted', z.boolean()),
        },
        'dshBot.nativeSchedule/runNow': {
            ...nativeOwner,
            parameters: [
                param('id', z.string().min(1)),
                param('operationId', automationIdSchema),
                param('expected', z.strictObject({ title: z.string(), prompt: z.string(), botCreatedAt: z.number() })),
                param('approved', z.literal(true)),
            ],
            result: codec('Run', runRecordSchema),
        },
        'dshBot.run/list': {
            ...runOwner,
            parameters: [param('options', runListSchema)],
            result: codec('Run[]', z.array(runRecordSchema)),
        },
        'dshBot.run/get': {
            ...runOwner,
            parameters: [param('id', automationIdSchema)],
            result: codec('Run', runRecordSchema),
        },
    },
};
export const AUTOMATION_REMOTE = createTypertRemoteInfo(automationRemoteSpec, z);
export default AUTOMATION_REMOTE;
//# sourceMappingURL=automation-contract.js.map
export const DSH_BOT_MODULE_VERSION = '0.6.3';
