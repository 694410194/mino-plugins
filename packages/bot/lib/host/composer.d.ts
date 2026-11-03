import type { Context } from '@deepseek-ai/cordis';
import { type PresetDefinition } from '@deepseek-ai/dsh-agent-preset-registry';
import type { BotRecord } from '../shared/schema.js';
export interface ComposerConfig {
    dataDir: string;
    presetIdPrefix: string;
    presetOrder: number;
}
export declare function botSkillsDirectory(botId: string, config: Pick<ComposerConfig, 'dataDir'>): string;
/** Host-owned files are independent of the storageDomain backend. Never remove
 * a directory on rollback/delete: it may contain user-authored skills. */
export declare function ensureBotSkillsDirectory(botId: string, config: Pick<ComposerConfig, 'dataDir'>): Promise<void>;
/** rc.2 readDocument uses the public Loader entry-list dialect. Expressions
 * remain { __jsExpr } nodes until the Host Loader evaluates them. */
export declare function composeBotPreset(bot: BotRecord, ctx: Pick<Context, 'agentPresets'> & Partial<Pick<Context, 'dshBots'>>, config?: ComposerConfig | undefined): Promise<PresetDefinition>;
