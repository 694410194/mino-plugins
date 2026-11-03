import type { Context } from '@deepseek-ai/cordis';
import type { RunRecord, RunRequest } from '../../shared/automation.js';
import type { DshBotRegistry } from '../registry.js';
import type { RunService } from './store.js';
/** A durable explicit delivery receipt. DSH owns execution in the shared conversation. */
export declare class MainSessionDelivery {
    private readonly ctx;
    private readonly bots;
    private readonly runs;
    private readonly active;
    private stopped;
    constructor(ctx: Context, bots: DshBotRegistry, runs: RunService);
    submit(request: RunRequest): Promise<RunRecord>;
    private deliver;
    close(): Promise<void>;
}
