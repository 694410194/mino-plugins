import { z } from 'zod';
import type { ScheduleDeliveryRecord } from '@deepseek-ai/dsh-schedule';
export declare const dueSchema: z.ZodObject<{
    source: z.ZodLiteral<"synthetic">;
    occurrenceId: z.ZodString;
    owner: z.ZodObject<{
        botId: z.ZodString;
        botCreatedAt: z.ZodNumber;
    }, z.core.$strict>;
    at: z.ZodNumber;
    relevant: z.ZodBoolean;
}, z.core.$strict>;
export type SyntheticDue = z.output<typeof dueSchema>;
export declare function syntheticDue(scheduleId: string, delivery: Pick<ScheduleDeliveryRecord, 'scheduledAt'>, fixture: Omit<SyntheticDue, 'occurrenceId'>): {
    source: "synthetic";
    occurrenceId: string;
    owner: {
        botId: string;
        botCreatedAt: number;
    };
    at: number;
    relevant: boolean;
};
