import type { PresetDefinition } from '@deepseek-ai/dsh-agent-preset-registry';
import type { BotRecord } from '../../shared/schema.js';
import type { BotStatus } from '../../shared/remote-contract.js';
import { RegistryLifecycle } from './lifecycle.js';
import type { Lease } from './types.js';
export declare abstract class RegistryPresets extends RegistryLifecycle {
    /** Only retained disposer handles establish ownership; a prefix is not ownership. */
    protected reconcile(): Promise<void>;
    protected statusRows(): Promise<BotStatus[]>;
    protected release(lease: Lease): Promise<void>;
    protected acquire(definition: PresetDefinition, bot: BotRecord): Promise<void>;
    protected transition<T>(id: string, candidate: BotRecord | undefined, commit: () => Promise<T>): Promise<T>;
}
