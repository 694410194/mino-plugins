import type { Agent } from '@deepseek-ai/dsh-agent';
import type { BotKey } from '../../shared/identity.js';
/** Reserved before native creation. Only its fresh startup Agent may claim it once. */
export declare function reserveDelegate(childId: string, owner: Agent, from: BotKey, to: BotKey, presetId?: string): () => void;
export declare function protectDelegateContinuation(agent: Agent, bot: BotKey, source: string): import("@deepseek-ai/cordis").Disposable<Promise<void>>;
