import type { Agent } from '@deepseek-ai/dsh-agent';
import type { ToolExecution } from '@deepseek-ai/dsh-tools';
import type { MessageInput } from '../../shared/messaging.js';
import type { BotKey } from '../../shared/identity.js';
import type { MessagingAuthorization } from './core.js';
export declare function teammateTurn(agent: Agent): boolean;
export declare function invocation(agent: Agent, exec: ToolExecution): string;
export declare class MessagingSafety implements MessagingAuthorization {
    private grants;
    private scopes;
    targets(id: string): {
        botId: string;
        botCreatedAt: number;
    }[] | undefined;
    active: boolean;
    revoke(key: string): void;
    close(): void;
    approve(agent: Agent, input: Exclude<MessageInput, {
        action: 'list';
    }>, target: BotKey, invocation?: string): Promise<string>;
    grant(agent: Agent, input: MessageInput, target: BotKey, invocation: string, targets: BotKey[], signal?: AbortSignal, valid?: () => boolean): void;
    /** Guard ownership is the retained Agent, not the preset or Host plugin fiber. */
    protect(agent: Agent): void;
}
declare module '@deepseek-ai/cordis' {
    interface Context {
        dshBotMessagingSafety: MessagingSafety;
    }
}
