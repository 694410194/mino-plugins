import type { Agent } from '@deepseek-ai/dsh-agent';
import type { BotKey } from '../../shared/identity.js';
export type BotBinding = Readonly<BotKey>;
export declare const bindings: WeakMap<Agent, Readonly<{
    botId: string;
    botCreatedAt: number;
}>>;
export declare function getBotBinding(agent: Agent): BotBinding | undefined;
