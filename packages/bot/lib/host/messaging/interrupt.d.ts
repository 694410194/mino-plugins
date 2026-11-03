import type { Agent } from '@deepseek-ai/dsh-agent';
import type { MessageStore } from './store.js';
export declare function interrupt(store: MessageStore, agent: Agent, id: string, now: () => number): Promise<void>;
