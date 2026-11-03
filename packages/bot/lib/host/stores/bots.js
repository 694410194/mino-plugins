import { migrateMemoryDeny } from '../../shared/memory-tool-names.js';
import { DshBotError, parseInput } from '../errors.js';
import { validateDefaultCwd } from '../home.js';
import { botIdSchema } from '../../shared/ids.js';
import { botRegistryStateSchema, botCreateSchema, botPatchSchema, botRemoveOptionsSchema, botSchema, normalizeBotPatch, timestampSchema, } from '../../shared/schema.js';
import { publicBot, invalidAvatar, read, write, nextTimestamp, compareId, missingBot, deleteBotMemories, deleteBotActivities, } from './domain.js';
export class BotStore {
    domain;
    constructor(domain) {
        this.domain = domain;
    }
    async migrateMemoryTools() {
        await write(this.domain, async () => {
            for (const [id, record] of this.domain.table('bots').entries()) {
                const deny = migrateMemoryDeny(record.tools.deny);
                if (JSON.stringify(deny) !== JSON.stringify(record.tools.deny))
                    await this.domain.table('bots').put(id, { ...record, tools: { ...record.tools, deny } });
            }
        });
    }
    botsWorkspaceId() {
        return read(() => this.domain.table('registry_state').get('bots-workspace')?.botsWorkspaceId);
    }
    async saveBotsWorkspaceId(id) {
        const state = parseInput(botRegistryStateSchema, { botsWorkspaceId: id });
        await write(this.domain, () => this.domain.table('registry_state').put('bots-workspace', state));
    }
    /** A durable marker prevents reseeding after users deliberately remove every Bot.
     * A pending batch resumes missing examples after an interrupted initial write.
     */
    async seedExamples(inputs) {
        const examples = inputs.map((input) => parseInput(botCreateSchema, input));
        await Promise.all(examples.map((example) => validateDefaultCwd(example.defaultCwd)));
        await write(this.domain, async () => {
            const state = this.domain.table('registry_state');
            const bots = this.domain.table('bots');
            const previous = state.get('examples');
            if (previous?.status === 'complete')
                return;
            if (previous === undefined && bots.size > 0) {
                await state.put('examples', botRegistryStateSchema.parse({ status: 'complete' }));
                return;
            }
            await state.put('examples', botRegistryStateSchema.parse({ status: 'pending' }));
            for (const example of examples) {
                if (bots.get(example.id))
                    continue;
                const now = Date.now();
                const record = parseInput(botSchema, { ...example, createdAt: now, updatedAt: now, schemaVersion: 1 });
                await bots.put(record.id, record);
            }
            await state.put('examples', botRegistryStateSchema.parse({ status: 'complete' }));
        });
    }
    list() {
        return read(() => [...this.domain.table('bots').entries()]
            .map(([, value]) => publicBot(value))
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || compareId(a.id, b.id)));
    }
    get(id) {
        const key = parseInput(botIdSchema, id);
        return read(() => {
            const record = this.domain.table('bots').get(key);
            if (!record)
                throw missingBot(key);
            return publicBot(record);
        });
    }
    retiredCreation(operationId) {
        return read(() => this.domain.table('registry_state').get(`creation:${operationId}`)?.retiredCreationOperation === operationId);
    }
    avatarWarnings() {
        return read(() => [...this.domain.table('bots').entries()].filter(([, row]) => invalidAvatar(row)).map(([, row]) => row.id));
    }
    async create(input, createdAt = Date.now(), onboarding) {
        const fields = parseInput(botCreateSchema, input);
        if (fields.tools)
            fields.tools = { ...fields.tools, deny: migrateMemoryDeny(fields.tools.deny) };
        await validateDefaultCwd(fields.defaultCwd);
        const now = parseInput(timestampSchema, createdAt);
        return write(this.domain, async () => {
            const table = this.domain.table('bots');
            if (table.get(fields.id))
                throw new DshBotError('bot/conflict', `Bot '${fields.id}' already exists`);
            const record = parseInput(botSchema, { ...fields, createdAt: now, updatedAt: now, schemaVersion: 1, ...(onboarding ? { onboarding } : {}) });
            await table.put(record.id, record);
            return structuredClone(record);
        });
    }
    async update(id, patch, expectedUpdatedAt) {
        const key = parseInput(botIdSchema, id);
        const fields = normalizeBotPatch(parseInput(botPatchSchema, patch));
        if (fields.tools)
            fields.tools = { ...fields.tools, deny: migrateMemoryDeny(fields.tools.deny) };
        await validateDefaultCwd(fields.defaultCwd);
        const expected = parseInput(timestampSchema.optional(), expectedUpdatedAt);
        return write(this.domain, async () => publicBot(await this.domain.table('bots').update(key, (current) => {
            // Check at the domain's write slot, never against a pre-queue snapshot.
            if (expected !== undefined && current.updatedAt !== expected) {
                throw new DshBotError('bot/conflict', `Bot '${key}' has changed; reload before updating`);
            }
            if (invalidAvatar(current) && !('avatar' in fields)) {
                throw new DshBotError('bot/invalid', 'Stored avatar is unsupported; explicitly replace or clear the avatar before updating.');
            }
            return parseInput(botSchema, { ...current, ...fields, updatedAt: nextTimestamp(current.updatedAt) });
        })));
    }
    /** Delete dependent data first so failed cleanup leaves the Bot available for retry. */
    async remove(id, options = {}) {
        const key = parseInput(botIdSchema, id);
        const { deleteMemories } = parseInput(botRemoveOptionsSchema, options);
        return write(this.domain, async () => {
            const current = this.domain.table('bots').get(key);
            if (!current)
                throw missingBot(key);
            if (current.onboarding)
                await this.domain.table('registry_state').put(`creation:${current.onboarding.operationId}`, { retiredCreationOperation: current.onboarding.operationId });
            if (deleteMemories)
                await deleteBotMemories(this.domain, key);
            // Activity is never retained, including when the user keeps memories.
            await deleteBotActivities(this.domain, key);
            if (!(await this.domain.table('bots').delete(key)))
                throw missingBot(key);
        });
    }
}
//# sourceMappingURL=bots.js.map
export const DSH_BOT_MODULE_VERSION = '0.6.3';
