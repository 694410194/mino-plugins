import { z } from 'zod';
import { type NotificationPolicy } from '../../shared/notifications.js';
import type { ShadowStatus } from '../../shared/shadow.js';
import type { ShadowConfig } from './config.js';
import { type SyntheticDue } from './schedule-adapter.js';
export declare const shadowStateSchema: z.ZodObject<{
    seen: z.ZodArray<z.ZodString>;
    days: z.ZodRecord<z.ZodString, z.ZodNumber>;
    last: z.ZodRecord<z.ZodString, z.ZodNumber>;
    highWater: z.ZodNumber;
    opportunities: z.ZodNumber;
    candidates: z.ZodNumber;
}, z.core.$strict>;
export type ShadowState = z.output<typeof shadowStateSchema>;
export declare const emptyShadow: () => ShadowState;
/** Reports only. No clock, schedule registration, Agent, send, memory, or model capability is accepted. */
export declare class ShadowPlanner {
    private config;
    private persist;
    private queue;
    private frozen;
    private state;
    constructor(config: ShadowConfig, initial: ShadowState, persist: (state: ShadowState) => Promise<void>);
    status(): ShadowStatus;
    snapshot(): {
        seen: string[];
        days: Record<string, number>;
        last: Record<string, number>;
        highWater: number;
        opportunities: number;
        candidates: number;
    };
    evaluate(raw: SyntheticDue, rawPolicy: NotificationPolicy): Promise<{
        candidate: boolean;
        reason: string;
        mode: string;
    }>;
    close(): Promise<void>;
}
