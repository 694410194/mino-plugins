import type { Agent } from '@deepseek-ai/dsh-agent';
import type { z } from 'zod';
import type { GroupDelivery, GroupTurn } from '../../shared/groups.js';
import { type WorkerBinding, type groupToolInput } from './worker-tool.js';
import type { GroupState } from './state.js';
import type { GroupRoots } from './roots.js';
import type { GroupMessages } from './messages.js';
import type { GroupTurnRunner } from './turn-runner.js';
/** Task-local single ownership; the shared FIFO bounds native work across tasks. */
export declare class ConcurrentGroups {
    private state;
    private roots;
    private messages;
    private runner;
    constructor(state: GroupState, roots: GroupRoots, messages: GroupMessages, runner: GroupTurnRunner);
    message(agent: Agent, binding: WorkerBinding, input: z.output<typeof groupToolInput>, callId: string, signal: AbortSignal): Promise<{
        status: string;
        messageId?: undefined;
    } | {
        status: string;
        messageId: string | undefined;
    }>;
    returnToActive(t: GroupTurn, receipt: GroupDelivery, text: string, author: string, signal: AbortSignal): Promise<void>;
    private active;
    /** Called under the queue; the receipt is durable before an uncertain native effect. */
    private bridge;
    execute(id: string): Promise<void>;
    private deliver;
}
