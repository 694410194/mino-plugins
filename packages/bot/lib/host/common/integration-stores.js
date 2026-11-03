import { z } from 'zod';
import { botKeySchema, resourceId } from '../../shared/integrations.js';
import { defineDomain, domainTable } from '@deepseek-ai/dsh-storage-domain';
import { assignmentSchema, connectorSchema, legacyImportSchema, notificationSchema, policySchema, receiptSchema, } from '../../shared/integrations.js';
export const connectorDomain = defineDomain({
    name: 'dsh_bot_connectors',
    version: 1,
    tables: {
        definitions: domainTable(connectorSchema),
        assignments: domainTable(assignmentSchema),
        legacy_imports: domainTable(legacyImportSchema),
    },
});
export const notificationDomain = defineDomain({
    name: 'dsh_bot_notifications',
    version: 1,
    tables: {
        read_state: domainTable(z.strictObject({
            id: resourceId,
            owner: botKeySchema,
            revision: z.number(),
            createdAt: z.number(),
            updatedAt: z.number(),
            schemaVersion: z.literal(1),
        })),
        policies: domainTable(policySchema),
        intents: domainTable(notificationSchema),
        receipts: domainTable(receiptSchema),
    },
});
export async function openIntegrationStores(ctx) {
    const connectors = await ctx.storageDomain.open(connectorDomain);
    try {
        const notifications = await ctx.storageDomain.open(notificationDomain);
        return {
            connectors,
            notifications,
            async close() {
                await notifications.close();
                await connectors.close();
            },
        };
    }
    catch {
        await connectors.close();
        throw new Error('Integration storage unavailable');
    }
}
//# sourceMappingURL=integration-stores.js.map
export const DSH_BOT_MODULE_VERSION = '0.6.3';
