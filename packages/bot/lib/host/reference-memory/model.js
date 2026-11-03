import { defineDomain, domainTable } from '@deepseek-ai/dsh-storage-domain';
import { z } from 'zod';
import { sameBot } from '../../shared/integrations.js';
import { copyReceiptSchema, graphBindingSchema, graphEntitySchema, memoryEnvelopeSchema, } from '../../shared/reference-memory.js';
import { memorySchema } from '../../shared/schema.js';
import { hasCredential } from '../../shared/secrets.js';
import { OperationError, digest, need, parse } from '../common/operations.js';
export const copyRowSchema = z.strictObject({
    receipt: copyReceiptSchema,
    snapshot: z.array(memorySchema),
    previousMode: graphBindingSchema.shape.mode,
    flowEpoch: z.number().int().nonnegative().optional(),
});
export const referenceMemoryDomain = defineDomain({
    name: 'dsh_bot_reference_memory',
    version: 1,
    tables: {
        bindings: domainTable(graphBindingSchema),
        copies: domainTable(copyRowSchema),
    },
});
// One process-wide lease, retained on teardown failure. The supported deployment is one Host per backend.
export const writers = new Map();
export const keyOf = (bot) => digest([bot.botId, bot.botCreatedAt]);
export const canonicalRows = (rows) => [...rows].sort((a, b) => a.id.localeCompare(b.id));
export const sourceDigest = (rows) => digest(canonicalRows(rows));
export const entityName = (bot, id) => `dsh-memory:${keyOf(bot)}:${id}`;
export function memoryEntity(bot, record) {
    const envelope = memoryEnvelopeSchema.parse({
        format: 'dsh-bot-memory-record',
        version: 1,
        bot,
        record,
        recordDigest: digest(record),
    });
    if (record.botId !== bot.botId || hasCredential(JSON.stringify(envelope)))
        throw new OperationError('invalid');
    return {
        name: entityName(bot, record.id),
        entityType: 'dsh-bot-memory-v1',
        observations: [JSON.stringify(envelope)],
    };
}
export function verifyMemoryEntity(bot, record, value) {
    const entity = parse(graphEntitySchema, value);
    if (entity.name !== entityName(bot, record.id) ||
        entity.entityType !== 'dsh-bot-memory-v1' ||
        entity.observations.length !== 1)
        throw new OperationError('conflict');
    let raw;
    try {
        raw = JSON.parse(need(entity.observations[0]));
    }
    catch {
        throw new OperationError('invalid');
    }
    const envelope = parse(memoryEnvelopeSchema, raw);
    if (!sameBot(envelope.bot, bot) ||
        envelope.record.botId !== bot.botId ||
        digest(envelope.record) !== digest(record) ||
        envelope.recordDigest !== digest(record) ||
        hasCredential(JSON.stringify(envelope)))
        throw new OperationError('conflict');
}
//# sourceMappingURL=model.js.map
export const DSH_BOT_MODULE_VERSION = '0.6.3';
