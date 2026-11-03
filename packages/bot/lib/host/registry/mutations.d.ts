import { type BotCreateInput, type BotRecord } from '../../shared/schema.js';
import { RegistryPresets } from './presets.js';
import type { BotChanged } from './types.js';
export declare abstract class RegistryMutations extends RegistryPresets {
    protected abstract changed(id: string, action: BotChanged['action']): void;
    protected createRecord(input: BotCreateInput, action: 'create' | 'duplicate', onboarding?: BotRecord['onboarding']): Promise<BotRecord>;
}
