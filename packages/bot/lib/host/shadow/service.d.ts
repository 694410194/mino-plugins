import type { Context } from '@deepseek-ai/cordis';
import type { ShadowConfig } from './config.js';
import { ShadowPlanner } from './planner.js';
export declare const shadowDomain: {
    name: string;
    version: number;
    tables: {
        state: import("@deepseek-ai/dsh-storage-domain").DomainTableSpec<string, {
            seen: string[];
            days: Record<string, number>;
            last: Record<string, number>;
            highWater: number;
            opportunities: number;
            candidates: number;
        }>;
    };
};
declare module '@deepseek-ai/cordis' {
    interface Context {
        dshBotShadow: ShadowPlanner;
    }
}
export declare function startShadow(ctx: Context, config: ShadowConfig): Promise<ShadowPlanner>;
