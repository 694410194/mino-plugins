import { z } from 'zod';
export declare const shadowStatusSchema: z.ZodObject<{
    mode: z.ZodLiteral<"offline-only">;
    shadowEnabled: z.ZodBoolean;
    offlineOrganizeEnabled: z.ZodBoolean;
    opportunities: z.ZodNumber;
    candidates: z.ZodNumber;
    modelRequests: z.ZodLiteral<0>;
    notifications: z.ZodLiteral<0>;
    memoryWrites: z.ZodLiteral<0>;
}, z.core.$strict>;
export type ShadowStatus = z.output<typeof shadowStatusSchema>;
