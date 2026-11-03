import type { Agent } from '@deepseek-ai/dsh-agent';
export declare const BOT_DELEGATE_TOOL_NAME = "bot_delegate";
export declare function registerDelegateTool(owner: Agent): () => void;
