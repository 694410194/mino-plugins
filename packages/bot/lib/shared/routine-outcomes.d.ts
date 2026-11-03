import { z } from 'zod';
export declare const routineOutcomeSchema: z.ZodObject<{
    messageId: z.ZodString;
    turn: z.ZodNumber;
    state: z.ZodEnum<{
        unknown: "unknown";
        failed: "failed";
        stopped: "stopped";
        processing: "processing";
        responded: "responded";
        limited: "limited";
    }>;
    at: z.ZodNumber;
}, z.core.$strict>;
export type RoutineOutcome = z.output<typeof routineOutcomeSchema>;
declare module '@deepseek-ai/dsh-session-projection/types' {
    interface SessionProjectionMap {
        dshBotRoutineOutcomes: RoutineOutcome[];
    }
}
