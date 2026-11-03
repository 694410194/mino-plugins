import type { Context } from '@deepseek-ai/cordis';
import type { Agent } from '@deepseek-ai/dsh-agent';
type ActivitySink = Pick<Context['dshBots'], 'recordActivity'>;
/** Track the exact mounted Bot generation, including blank-session selection.
 * Both the preset owner and Agent own cleanup; stable preset ids alone cannot
 * distinguish a retained generation from the newly selected generation.
 */
export declare function registerBotPresetActivity(ctx: Context, botId: string, botCreatedAt: number): void;
/** Called within the Bot's agent/created effect. Only complete, newly appended
 * human/assistant text is observed; streaming deltas and replay are not writes. */
export declare function registerActivityTracking(agent: Agent, botId: string, botCreatedAt: number, registry: ActivitySink): () => void;
export {};
