import type { SessionEvent } from '@deepseek-ai/dsh-session';
import type { MessageRecord } from '../../shared/messaging.js';
/** Replay the complete durable log, never a compressed context window. */
export declare function messageEvidence(record: MessageRecord, events: readonly SessionEvent[]): {
    inserted: boolean;
    canceled: boolean;
    claimed: boolean;
    pending: boolean;
    seq: number | undefined;
    turn: number | undefined;
    ended: boolean;
    interrupted: boolean;
    crashClosed: boolean;
    assistant: boolean;
};
