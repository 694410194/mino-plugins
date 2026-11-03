import type { Agent } from '@deepseek-ai/dsh-agent';
import type { MessageRecord } from '../../shared/messaging.js';
import { MessagingCore } from './core.js';
export declare abstract class MessagingRecovery extends MessagingCore {
    protected abstract deliver(id: string, recovery: boolean): Promise<void>;
    protected kick(id: string, recovery?: boolean): void;
    protected wake(agent: Agent, r: MessageRecord): Promise<void>;
    protected arm(id: string, ms: number): void;
    settled(): Promise<void>;
    lifecycle(): {
        phase: string;
        tasks: number;
        timers: number;
        wakes: number;
        targets: number;
        ownedAgentHandles: number;
    };
    close(): Promise<void>;
}
