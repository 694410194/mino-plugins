import type { Context } from '@deepseek-ai/cordis';
import type { Agent } from '@deepseek-ai/dsh-agent';
import type { DshBotRegistry } from '../registry.js';
export declare const BOT_MANAGE_TOOL_NAME = "bot_manage";
type Registry = Pick<DshBotRegistry, 'list' | 'get' | 'create' | 'update' | 'remove' | 'config'> & {
    memoryFor(botId: string): Pick<ReturnType<DshBotRegistry['memoryFor']>, 'count'>;
};
/** One agent owns both the policy gate and the tool; the caller retains the disposer. */
export declare function registerBotManageTool(owner: Agent, registry: Registry, onDisposed?: () => void, currentBotId?: string): () => void;
/** Optional Host contribution: no global tool and no mutation of the standard preset. */
export declare function registerStandardBotManage(ctx: Context): void;
/** Follow the exact Bot generation, including blank-session preset changes. */
export declare function registerBotPresetManage(ctx: Context, botId: string): void;
export {};
