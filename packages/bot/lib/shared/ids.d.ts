import { z } from 'zod';
export declare const BOT_ID_PATTERN: RegExp;
export declare const botIdSchema: z.ZodString;
export declare const memoryIdSchema: z.ZodString;
export type BotId = z.infer<typeof botIdSchema>;
