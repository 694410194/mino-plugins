import type { Agent } from '@deepseek-ai/dsh-agent';
import type { BotRecord } from '../shared/schema.js';
type Persona = BotRecord['persona'];
/** Shadow the preset's public persona slots in the narrower Agent scope.
 * Only committed persona prose is refreshed; models, tools and permissions stay
 * with their original generation. A step already sent to a provider is immutable.
 */
export declare function installLivePersona(agent: Agent, read: () => Persona | undefined, subscribe: (changed: () => void) => () => void): () => void;
export {};
