import type { Context } from '@deepseek-ai/cordis';
import { TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol';
import type { DshBotActivityMethods, ActivityListResult, ActivitySession } from '../../shared/remote-contract.js';
declare module '@deepseek-ai/cordis' {
    interface Context {
        dshBotActivity: DshBotActivityRemote;
    }
}
/** Shares the registry's store and drain queue; no separate domain handle. */
export declare class DshBotActivityRemote extends TypertRemoteService implements DshBotActivityMethods {
    static inject: string[];
    constructor(ctx: Context);
    list(): Promise<ActivityListResult>;
    markRead(sessionId: string): Promise<ActivitySession>;
}
