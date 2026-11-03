import { createForChatSchema, startOnboardingSchema, onboardingStatusSchema } from './onboarding.js';
import { autoShareStatusSchema, autoShareToggleSchema } from './data-flow.js';
import { memoryQuerySchema, memoryCreateSchema, memoryReviseSchema, memoryConfirmSchema, memoryResolveSchema, memoryPageSchema } from './memory-management.js';
import { z } from 'zod';
import { forgetSelectionSchema, forgetPreviewSchema, forgetChoiceSchema, cleanupStatusSchema, rootInstructionsSchema } from './memory-forget.js';
import { botIdSchema, memoryIdSchema } from './ids.js';
import { activityListResultSchema, activitySessionIdSchema, activitySessionSchema } from './activity.js';
import { absoluteDirectorySchema, botCreateSchema, botPatchSchema, botRemoveOptionsSchema, botSchema, memoryAddSchema, memoryListOptionsSchema, memoryPatchSchema, memorySchema, } from './schema.js';
export const botStatusSchema = z.strictObject({
    id: botIdSchema,
    presetId: z.string().min(1),
    mainSessionId: z.string().min(1).optional(),
    warnings: z.array(z.enum(['avatar/invalid'])).optional(),
    preset: z.strictObject({ state: z.enum(['ok', 'broken', 'missing']), reason: z.string().optional() }),
});
export const catalogInfoSchema = z.strictObject({ presetIdPrefix: z.string().regex(/^[a-z][a-z0-9-]*$/) });
export const botHomeSchema = z.strictObject({ path: absoluteDirectorySchema });
export const botsWorkspaceSchema = z.strictObject({ workspaceId: z.string().min(1), path: absoluteDirectorySchema });
// Process-local invalidation only: consumers always re-read authoritative data.
// No persisted revision, user text, paths or credential-shaped payloads travel here.
export const botChangeSchema = z.strictObject({
    revision: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER),
});
// UI may choose the Bot, never the persisted identity or provenance of a memory.
export const memoryRemoteSaveSchema = memoryAddSchema.omit({ botId: true, source: true });
export const memoryRemotePatchSchema = memoryPatchSchema.omit({ source: true });
export const memoryRemoteListSchema = memoryListOptionsSchema
    .omit({ query: true })
    .extend({ limit: memoryListOptionsSchema.shape.limit.optional() });
export const memoryRemoteSearchSchema = memoryRemoteListSchema.extend({ query: z.string() });
const codec = (type, schema) => ({
    mode: 'strict',
    typeSymbol: `dsh-bot#${type}`,
    create: () => schema,
});
// rc.2 only invokes explicit result encode/decode hooks; mode/create alone
// describe a parser but do not validate the Host response or Client wire value.
const activityResultCodec = (type, schema) => ({
    ...codec(type, schema),
    encode: (value) => schema.parse(value),
    decode: (value) => schema.parse(value),
});
const parameter = (name, type, schema) => {
    const value = codec(type, schema);
    return { name, source: 'json', codec: value, strictCodec: value };
};
const owner = { service: 'dshBots', invocation: { kind: 'direct' } };
const memoryOwner = { service: 'dshBotMemory', invocation: { kind: 'direct' } };
const activityOwner = { service: 'dshBotActivity', invocation: { kind: 'direct' } };
const id = parameter('id', 'BotId', botIdSchema);
const botId = parameter('botId', 'BotId', botIdSchema);
const memoryId = parameter('id', 'MemoryId', memoryIdSchema);
const bot = codec('BotRecord', botSchema);
const memories = codec('MemoryRecord[]', z.array(memorySchema));
/** Both Host descriptors and Client codecs are assembled from this single spec. */
export const dshBotRemoteSpec = {
    package: 'dsh-bot',
    methods: {
        'dshBot/watch': {
            ...owner,
            mode: 'stream',
            parameters: [],
            cancellation: { parameter: 'signal' },
            result: activityResultCodec('BotChange', botChangeSchema),
        },
        // Zero parameters deliberately support activity.list() on rc.2, whose
        // Client enforces exact arity even for optional descriptor parameters.
        'dshBot.activity/list': {
            ...activityOwner,
            parameters: [],
            result: activityResultCodec('ActivityListResult', activityListResultSchema),
        },
        'dshBot.activity/markRead': {
            ...activityOwner,
            parameters: [parameter('sessionId', 'ActivitySessionId', activitySessionIdSchema)],
            result: activityResultCodec('ActivitySession', activitySessionSchema),
        },
        'dshBot/list': { ...owner, parameters: [], result: codec('BotRecord[]', z.array(botSchema)) },
        'dshBot/catalogInfo': { ...owner, parameters: [], result: codec('CatalogInfo', catalogInfoSchema) },
        'dshBot/status': { ...owner, parameters: [], result: codec('BotStatus[]', z.array(botStatusSchema)) },
        'dshBot/get': { ...owner, parameters: [id], result: bot },
        'dshBot/openConversation': {
            ...owner,
            parameters: [botId],
            result: activityResultCodec('MainSession', z.strictObject({ sessionId: z.string().min(1) })),
        },
        'dshBot/ensureHome': { ...owner, parameters: [botId], result: activityResultCodec('BotHome', botHomeSchema) },
        'dshBot/ensureBotsWorkspace': {
            ...owner,
            parameters: [],
            result: activityResultCodec('BotsWorkspace', botsWorkspaceSchema),
        },
        'dshBot/createForChat': { ...owner, parameters: [parameter('input', 'CreateForChatInput', createForChatSchema)], result: bot },
        'dshBot/startOnboarding': { ...owner, parameters: [parameter('input', 'StartOnboardingInput', startOnboardingSchema)], result: activityResultCodec('OnboardingStatus', onboardingStatusSchema) },
        'dshBot/retryOnboarding': { ...owner, parameters: [parameter('input', 'StartOnboardingInput', startOnboardingSchema)], result: activityResultCodec('OnboardingStatus', onboardingStatusSchema) },
        'dshBot/onboardingStatus': { ...owner, parameters: [botId], result: activityResultCodec('OnboardingStatus', onboardingStatusSchema) },
        'dshBot/create': { ...owner, parameters: [parameter('input', 'BotCreateInput', botCreateSchema)], result: bot },
        'dshBot/update': { ...owner, parameters: [id, parameter('patch', 'BotPatch', botPatchSchema)], result: bot },
        'dshBot/duplicate': { ...owner, parameters: [id, parameter('newId', 'BotId', botIdSchema)], result: bot },
        // "remove" is reserved by rc.2's Client namespace service.
        'dshBot/delete': {
            ...owner,
            implementation: 'remove',
            parameters: [
                id,
                {
                    ...parameter('options', 'BotRemoveOptions | undefined', botRemoveOptionsSchema.optional()),
                    acceptsUndefined: true,
                },
            ],
            result: codec('void', z.void()),
        },
        'dshBot.memory/autoShareStatus': {
            ...memoryOwner, parameters: [], result: activityResultCodec('AutoShareStatus', autoShareStatusSchema),
        },
        'dshBot.memory/setAutoShare': {
            ...memoryOwner, parameters: [parameter('input', 'AutoShareToggle', autoShareToggleSchema)],
            result: activityResultCodec('AutoShareStatus', autoShareStatusSchema),
        },
        'dshBot.memory/query': {
            ...memoryOwner, parameters: [parameter('input', 'queryInput', memoryQuerySchema)],
            result: activityResultCodec('ManagedMemoryPage', memoryPageSchema),
        },
        'dshBot.memory/createManaged': {
            ...memoryOwner, parameters: [parameter('input', 'createManagedInput', memoryCreateSchema)],
            result: activityResultCodec('MemoryId', z.uuid()),
        },
        'dshBot.memory/revise': {
            ...memoryOwner, parameters: [parameter('input', 'reviseInput', memoryReviseSchema)],
            result: activityResultCodec('void', z.void()),
        },
        'dshBot.memory/confirm': {
            ...memoryOwner, parameters: [parameter('input', 'confirmInput', memoryConfirmSchema)],
            result: activityResultCodec('MemoryId', z.uuid()),
        },
        'dshBot.memory/resolve': {
            ...memoryOwner, parameters: [parameter('input', 'resolveInput', memoryResolveSchema)],
            result: activityResultCodec('void', z.void()),
        },
        'dshBot.memory/previewContribution': {
            ...memoryOwner, parameters: [parameter('input', 'previewContributionInput', z.uuid())],
            result: activityResultCodec('ForgetPreview', forgetPreviewSchema),
        },
        'dshBot.memory/previewShared': {
            ...memoryOwner, parameters: [parameter('input', 'previewSharedInput', forgetSelectionSchema)],
            result: activityResultCodec('ForgetPreview', forgetPreviewSchema),
        },
        'dshBot.memory/list': {
            ...memoryOwner,
            parameters: [botId, parameter('options', 'MemoryRemoteListInput', memoryRemoteListSchema)],
            result: memories,
        },
        'dshBot.memory/search': {
            ...memoryOwner,
            parameters: [botId, parameter('input', 'MemoryRemoteSearchInput', memoryRemoteSearchSchema)],
            result: memories,
        },
        'dshBot.memory/save': {
            ...memoryOwner,
            parameters: [botId, parameter('input', 'MemoryRemoteSaveInput', memoryRemoteSaveSchema)],
            result: codec('MemorySaveResult', z.strictObject({ id: memoryIdSchema, deduplicated: z.boolean() })),
        },
        'dshBot.memory/update': {
            ...memoryOwner,
            parameters: [botId, memoryId, parameter('patch', 'MemoryRemotePatch', memoryRemotePatchSchema)],
            result: codec('MemoryRecord', memorySchema),
        },
        'dshBot.memory/delete': {
            ...memoryOwner,
            implementation: 'remove',
            parameters: [botId, memoryId],
            result: codec('void', z.void()),
        },
        'dshBot.memory/quarantineCount': {
            ...memoryOwner,
            parameters: [],
            result: activityResultCodec('MemoryQuarantineCount', z.number().int().nonnegative()),
        },
        'dshBot.memory/count': {
            ...memoryOwner,
            parameters: [botId],
            result: codec('MemoryCount', z.number().int().nonnegative()),
        },
        'dshBot.memory/previewForget': {
            ...memoryOwner, parameters: [botId, parameter('selection', 'ForgetSelection', forgetSelectionSchema)],
            result: activityResultCodec('ForgetPreview', forgetPreviewSchema),
        },
        'dshBot.memory/chooseForget': {
            ...memoryOwner, parameters: [parameter('choice', 'ForgetChoice', forgetChoiceSchema)],
            result: activityResultCodec('CleanupStatus', cleanupStatusSchema),
        },
        'dshBot.memory/cleanupStatuses': {
            ...memoryOwner, parameters: [], result: activityResultCodec('CleanupStatus[]', z.array(cleanupStatusSchema)),
        },
        'dshBot.memory/retryCleanup': {
            ...memoryOwner, parameters: [parameter('id', 'CleanupId', z.uuid())],
            result: activityResultCodec('CleanupStatus', cleanupStatusSchema),
        },
        'dshBot.memory/rootInstructions': {
            ...memoryOwner, parameters: [], result: activityResultCodec('RootInstructions', rootInstructionsSchema),
        },
    },
};
//# sourceMappingURL=remote-contract.js.map
export const DSH_BOT_MODULE_VERSION = '0.6.3';
