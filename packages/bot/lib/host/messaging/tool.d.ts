import type { Agent } from '@deepseek-ai/dsh-agent';
import type { MessagingSafety } from './safety.js';
export declare function registerMessageTool(agent: Agent, safety: MessagingSafety): () => void;
