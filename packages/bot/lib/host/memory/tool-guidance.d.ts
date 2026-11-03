import type { Agent } from '@deepseek-ai/dsh-agent';
/** A native guard explains stale calls without registering aliases or intercepting another plugin's tool. */
export declare function retiredMemoryGuidance(agent: Agent): () => void;
