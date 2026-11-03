import { migrateMemoryDeny } from '../../shared/memory-tool-names.js';
import { botCreateSchema, botSchema } from '../../shared/schema.js';
import { DshBotError, parseInput } from '../errors.js';
import { validateDefaultCwd } from '../home.js';
import { RegistryPresets } from './presets.js';
export class RegistryMutations extends RegistryPresets {
    async createRecord(input, action, onboarding) {
        const fields = parseInput(botCreateSchema, input);
        fields.tools = { ...fields.tools, deny: migrateMemoryDeny(fields.tools.deny) };
        await validateDefaultCwd(fields.defaultCwd);
        if (this.stores.bots.list().some((bot) => bot.id === fields.id)) {
            throw new DshBotError('bot/conflict', `Bot '${fields.id}' already exists`);
        }
        const now = Math.max(Date.now(), this.creationTime + 1);
        this.creationTime = now;
        const candidate = parseInput(botSchema, { ...fields, createdAt: now, updatedAt: now, schemaVersion: 1, ...(onboarding ? { onboarding } : {}) });
        // The generation snapshot and stored identity must share their creation
        // time even when preset activation crosses a millisecond boundary.
        const record = await this.transition(fields.id, candidate, () => this.stores.bots.create(fields, candidate.createdAt, onboarding));
        this.changed(record.id, action);
        return record;
    }
}
//# sourceMappingURL=mutations.js.map
export const DSH_BOT_MODULE_VERSION = '0.6.3';
