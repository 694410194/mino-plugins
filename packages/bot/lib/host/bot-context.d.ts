import type { Context } from '@deepseek-ai/cordis';
import Schema from '@deepseek-ai/schemastery';
export declare const name = "dsh-bot-context";
export declare const inject: string[];
export interface Config {
    botId: string;
}
export declare const Config: Schema<Config>;
export { getBotBinding, type BotBinding } from './data-flow/agent-binding.js';
/** Mounted inside a preset; its closure is retained with that preset generation. */
export declare function apply(ctx: Context, config: Config): void;
