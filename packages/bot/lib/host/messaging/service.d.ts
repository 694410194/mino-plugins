import type { Agent } from '@deepseek-ai/dsh-agent';
import { MessagingRouting } from './reply-routing.js';
export { messagingDomain } from './store.js';
export type { MessagingAuthorization, MessagingCapabilities } from './core.js';
export declare class Messaging extends MessagingRouting {
    exclusive<T>(id: string, work: () => Promise<T>): Promise<T>;
    retry(id: string): void;
    directory(agent: Agent, cursor?: string, limit?: number): Promise<{
        cursor?: string | undefined;
        items: {
            id: string;
            name: string;
            description: string;
        }[];
    }>;
    start(): Promise<void>;
}
declare module '@deepseek-ai/cordis' {
    interface Context {
        dshBotMessaging: Messaging;
    }
}
