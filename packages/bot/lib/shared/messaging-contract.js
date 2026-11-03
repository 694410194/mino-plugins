import { z } from 'zod';
import { createTypertRemoteInfo } from '@deepseek-ai/dsh-typert-protocol/remote-info';
import { botIdSchema } from './ids.js';
import { envelopeSchema, messageRecordSchema } from './messaging.js';
export const messageRequestSchema = z.discriminatedUnion('action', [
    z.strictObject({ action: z.literal('list'), botId: botIdSchema }),
    z.strictObject({ action: z.enum(['cancel', 'retry']), id: z.string().min(1), revision: z.number().int().positive() }),
]);
const summarySchema = z.strictObject({ envelope: envelopeSchema, revision: z.number().int().positive(),
    delivery: messageRecordSchema.shape.delivery, processing: messageRecordSchema.shape.processing,
    response: messageRecordSchema.shape.response, lastErrorCode: z.string().optional() });
export const messageOverviewSchema = z.strictObject({ enabled: z.boolean(), pending: z.number().int().nonnegative(),
    nestedMessaging: z.literal(false), items: z.array(summarySchema).max(20) });
const codec = (name, schema) => ({ mode: 'strict',
    typeSymbol: `dsh-bot/messaging#${name}`, create: () => schema,
    encode: (value) => schema.parse(value), decode: (value) => schema.parse(value) });
const input = codec('Request', messageRequestSchema);
export const MESSAGING_REMOTE = createTypertRemoteInfo({ package: 'dsh-bot/messaging', methods: {
        'dshBot.messaging/request': { service: 'dshBotMessagingRemote', invocation: { kind: 'direct' },
            parameters: [{ name: 'input', source: 'json', codec: input, strictCodec: input }],
            result: codec('Overview', messageOverviewSchema) },
    } }, z);
//# sourceMappingURL=messaging-contract.js.map
export const DSH_BOT_MODULE_VERSION = '0.6.3';
