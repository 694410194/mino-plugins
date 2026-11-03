import type { Context } from '@deepseek-ai/cordis';
import { Config, DshBotRegistry } from './registry.js';
export { Config, DshBotRegistry };
export declare const name = "dsh-bot";
export declare const inject: string[];
export declare function apply(ctx: Context, config: Config): void;
