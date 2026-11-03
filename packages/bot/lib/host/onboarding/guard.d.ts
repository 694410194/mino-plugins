import type { Agent } from '@deepseek-ai/dsh-agent';
import type { BotKey } from '../../shared/identity.js';
import type { DshBotRegistry } from '../registry.js';
/** Agent-owned protection survives retained presets; a stopped service rejects old sources. */
export declare function protectOnboarding(agent: Agent, bot: BotKey, registry: DshBotRegistry): import("@deepseek-ai/cordis").Disposable<Promise<void>>;
