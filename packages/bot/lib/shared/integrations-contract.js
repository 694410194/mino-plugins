import { z } from 'zod';
import { createTypertRemoteInfo } from '@deepseek-ai/dsh-typert-protocol/remote-info';
import { assignmentInputSchema, assignmentSchema, botKeySchema, connectorInputSchema, connectorSchema, connectorRuntimeSchema, legacyImportSchema, notificationSchema, notifyInputSchema, integrationCatalogSchema, resourceId, policyInputSchema, policySchema, } from './integrations.js';
const codec = (name, schema) => ({
    mode: 'strict',
    typeSymbol: `dsh-bot/integrations#${name}`,
    create: () => schema,
    encode: (v) => schema.parse(v),
    decode: (v) => schema.parse(v),
});
const param = (name, s) => ({
    name,
    source: 'json',
    codec: codec(name, s),
    strictCodec: codec(name, s),
});
const base = { service: 'dshBotP34', invocation: { kind: 'direct' } };
const expected = param('expectedRevision', z.number().int().nonnegative());
export const integrationsSpec = {
    package: 'dsh-bot/integrations',
    methods: {
        'dshBot.connectors/catalog': { ...base, parameters: [], result: codec('Catalog', integrationCatalogSchema) },
        'dshBot.connectors/saveDefinition': {
            ...base,
            parameters: [param('input', connectorInputSchema), expected],
            result: codec('Connector', connectorSchema),
        },
        'dshBot.connectors/saveAssignment': {
            ...base,
            parameters: [param('input', assignmentInputSchema), expected],
            result: codec('Assignment', assignmentSchema),
        },
        'dshBot.connectors/applyIdle': {
            ...base,
            parameters: [param('bot', botKeySchema)],
            result: codec('Runtime', z.array(connectorRuntimeSchema)),
        },
        'dshBot.connectors/importLegacy': {
            ...base,
            parameters: [param('bot', botKeySchema)],
            result: codec('Import', legacyImportSchema),
        },
        'dshBot.notifications/savePolicy': {
            ...base,
            service: 'dshBotNotificationRemote',
            parameters: [param('input', policyInputSchema), expected, param('confirmed', z.boolean())],
            result: codec('Policy', policySchema),
        },
        'dshBot.notifications/markRead': {
            ...base,
            service: 'dshBotNotificationRemote',
            parameters: [param('id', resourceId), expected],
            result: codec('Notification', notificationSchema),
        },
        'dshBot.notifications/test': {
            ...base,
            service: 'dshBotNotificationRemote',
            implementation: 'testNotification',
            parameters: [
                param('owner', botKeySchema),
                param('input', notifyInputSchema),
                param('expectedScope', z.string()),
                param('confirmed', z.literal(true)),
            ],
            result: codec('Notification', notificationSchema),
        },
    },
};
export const INTEGRATIONS_REMOTE = createTypertRemoteInfo(integrationsSpec, z);
//# sourceMappingURL=integrations-contract.js.map
export const DSH_BOT_MODULE_VERSION = '0.6.3';
