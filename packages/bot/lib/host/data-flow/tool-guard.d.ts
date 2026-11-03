import type { Agent } from '@deepseek-ai/dsh-agent';
import type { BotKey } from '../../shared/identity.js';
import type { DshBotRegistry } from '../registry.js';
import type { ManagedOutlets } from './outlets.js';
/** Missing real Host infrastructure fails closed; older isolated unit fixtures have no memory kernel. */
export declare function outlets(registry: DshBotRegistry): ManagedOutlets | undefined;
/** Native schedule payloads have no human authority. Only the current Bot's exact root main
 * can retain its existing audience when its own scheduler inserts a candidate notice.
 * All persistence still uses mergeLabels: an old unknown/no-egress label is never repaired here.
 */
export declare function inheritOwnSchedule(agent: Agent, bot: BotKey, registry: DshBotRegistry, flow: ManagedOutlets): Promise<boolean>;
/** Own lifetime is the Agent. Unload does not remove protection from surviving Agents. */
export declare function protectDataFlow(agent: Agent, bot: BotKey, registry: DshBotRegistry): import("@deepseek-ai/cordis").Disposable<Promise<void>> | undefined;
