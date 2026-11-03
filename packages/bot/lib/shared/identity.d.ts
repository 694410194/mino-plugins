import { z } from 'zod';
export declare const resourceId: z.ZodString;
export declare const botKeySchema: z.ZodObject<{
    botId: z.ZodString;
    botCreatedAt: z.ZodNumber;
}, z.core.$strict>;
export type BotKey = z.output<typeof botKeySchema>;
export declare const sameBot: (a: BotKey, b: BotKey) => boolean;
export declare const metadata: {
    revision: z.ZodNumber;
    createdAt: z.ZodNumber;
    updatedAt: z.ZodNumber;
    schemaVersion: z.ZodLiteral<1>;
};
