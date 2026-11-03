import type { Context } from '@deepseek-ai/cordis';
import type { Agent } from '@deepseek-ai/dsh-agent';
import type { UserMessage } from '@deepseek-ai/dsh-llm';
export declare const name = "dsh-bot-group-root-guard";
interface SetupPermit {
    agent: Agent;
    messageId: string;
    fingerprint: string;
    valid: () => boolean;
    run: () => Promise<void>;
    consumed: boolean;
    completed: boolean;
    turn?: number;
}
declare module '@deepseek-ai/cordis' {
    interface Context {
        dshBotGroupSetupPermit: SetupPermit;
    }
}
/** Exact Agent and complete-message check; a machine source alone grants no authority. */
export declare function executeRootSetup(agent: Agent, messages: readonly UserMessage[], turn: number): Promise<boolean>;
/** Execute genuine root setup inside a native no-model turn. Callers serialize the entire idle pair. */
export declare function runRootSetup(agent: Agent, message: UserMessage, valid: () => boolean, run: () => Promise<void>): Promise<void>;
/** Retained preset generation owns the listener, even for a Controller-owned root. */
export declare function apply(ctx: Context): void;
export {};
