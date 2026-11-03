import type { Agent } from '@deepseek-ai/dsh-agent';
import { type MessageReceipt } from '../../shared/messaging.js';
import { MessagingDelivery } from './delivery.js';
export declare class MessagingRouting extends MessagingDelivery {
    send(agent: Agent, value: unknown, invocationKey: string, signal?: AbortSignal): Promise<MessageReceipt>;
}
