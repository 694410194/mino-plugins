import type { Agent } from '@deepseek-ai/dsh-agent';
import type { SubagentActivationSpec, SubagentActivation } from '@deepseek-ai/dsh-subagent';
import type { BotKey } from '../../shared/identity.js';
import type { DshBotRegistry } from '../registry.js';
/** Caller delivery gates content; parent turn cancellation owns startup only. */
export declare function startDelegate(registry: DshBotRegistry, owner: Agent, from: BotKey, to: BotKey, call: string, spec: SubagentActivationSpec, resultSignal?: AbortSignal): Promise<SubagentActivation>;
