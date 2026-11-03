import { z } from 'zod';
export declare const scheduleBindingSchema: z.ZodObject<{
    botId: z.ZodString;
    botCreatedAt: z.ZodNumber;
    sessionId: z.ZodString;
    nativeScheduleId: z.ZodString;
}, z.core.$strict>;
export type ScheduleBinding = z.output<typeof scheduleBindingSchema>;
export declare const legacyEntrySchema: z.ZodObject<{
    id: z.ZodString;
    botId: z.ZodString;
    botCreatedAt: z.ZodNumber;
    title: z.ZodString;
    prompt: z.ZodString;
}, z.core.$strict>;
export type LegacyEntry = z.output<typeof legacyEntrySchema>;
export declare const aggregateSchema: z.ZodObject<{
    bindings: z.ZodArray<z.ZodObject<{
        botId: z.ZodString;
        botCreatedAt: z.ZodNumber;
        sessionId: z.ZodString;
        nativeScheduleId: z.ZodString;
    }, z.core.$strict>>;
    legacy: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        botId: z.ZodString;
        botCreatedAt: z.ZodNumber;
        title: z.ZodString;
        prompt: z.ZodString;
    }, z.core.$strict>>;
    nativeAvailable: z.ZodBoolean;
    legacyUnavailable: z.ZodBoolean;
    legacySkipped: z.ZodNumber;
}, z.core.$strict>;
export type NativeAggregate = z.output<typeof aggregateSchema>;
