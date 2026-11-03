import type { Agent } from '@deepseek-ai/dsh-agent';
import type { Session } from '@deepseek-ai/dsh-session';
import type { CleanupReason } from '../../shared/memory-forget.js';
declare module '@deepseek-ai/dsh-llm' {
    interface MessageSourceMap {
        'dsh-bot-memory-forget': {
            kind: 'dsh-bot-memory-forget';
            form: 'notice';
            summary: string;
        };
    }
}
export declare const removalNotice: () => {
    content: {
        type: "text";
        text: string;
    }[];
    source: {
        kind: "dsh-bot-memory-forget";
        form: "notice";
        summary: string;
    };
} & Pick<import("@deepseek-ai/dsh-llm").UserMessage, "id" | "role">;
export interface HistoryIO {
    flush(session: Session): Promise<boolean>;
    readSurface(session: Session): Promise<unknown>;
    rawReadPolicyVerified: boolean;
    headBlocked?: boolean;
}
/** Keep the native head intact: idle system append is invalid durable grammar in rc.2. */
export declare function cleanHistory(agent: Agent, io: HistoryIO): Promise<CleanupReason[]>;
