import type { Context } from '@deepseek-ai/cordis';
import type { DshBotRegistry } from '../registry.js';
import type { RunRequest } from '../../shared/automation.js';
import { MainSessionDelivery } from './delivery.js';
import { openAutomationStores } from './store.js';
import { NativeSchedules } from '../native-schedule/service.js';
declare module '@deepseek-ai/cordis' {
    interface Context {
        dshBotDelivery: MainSessionDelivery;
        dshBotAutomationStores: Awaited<ReturnType<typeof openAutomationStores>>;
        dshBotSubmitter: {
            submit(request: RunRequest): ReturnType<Awaited<ReturnType<typeof openAutomationStores>>['runs']['enqueue']>;
        };
    }
}
/** Explicit requests only: no clock, queue driver, quota, catch-up or Host lease. */
export declare function startAutomation(ctx: Context, bots: DshBotRegistry): Promise<{
    delivery: MainSessionDelivery;
    stores: {
        runs: import("./store.js").RunService;
        subscribe: (listener: () => void) => () => void;
        close: () => Promise<void>;
    };
    native: NativeSchedules;
    close: () => Promise<void>;
}>;
