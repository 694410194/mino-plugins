import type { MessageRecord } from '../../shared/messaging.js';
import { MessagingRecovery } from './recovery.js';
export declare class MessagingDelivery extends MessagingRecovery {
    protected mirror(r: MessageRecord): Promise<void>;
    protected deliver(id: string, recovery: boolean): Promise<void>;
}
