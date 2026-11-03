import type { Agent } from '@deepseek-ai/dsh-agent';
import type { UserMessage } from '@deepseek-ai/dsh-llm';
/** Preserve public Inbox boundaries even if native claim is rejected/cancelled before user/message commits. */
export declare function preserveInbox(agent: Agent, blocked: () => boolean): {
    restore: (messages?: UserMessage[]) => void;
    dispose: () => void;
};
