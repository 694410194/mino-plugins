import type { ProjectionDefinition } from '@deepseek-ai/dsh-session-projection';
import { z } from 'zod';
declare const stateSchema: z.ZodObject<{
    open: z.ZodNullable<z.ZodNumber>;
    records: z.ZodArray<z.ZodObject<{
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
    }, z.core.$strict>>;
}, z.core.$strict>;
type State = z.output<typeof stateSchema>;
declare module '@deepseek-ai/dsh-session-projection/types' {
    interface SessionProjectionStateMap {
        dshBotRoutineOutcomes: State;
    }
}
/** Pure native-log view. A completed response is not proof of task or child completion. */
type Definition = ProjectionDefinition<'dshBotRoutineOutcomes', State>;
export declare function routineOutcomes(limit: number): Definition & {
    wire: NonNullable<Definition['wire']>;
};
export {};
