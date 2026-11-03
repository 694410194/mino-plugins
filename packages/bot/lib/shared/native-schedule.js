import { z } from 'zod';
import { botIdSchema } from './ids.js';
import { automationTimeSchema } from './automation.js';
export const scheduleBindingSchema = z.strictObject({
    botId: botIdSchema,
    botCreatedAt: automationTimeSchema,
    sessionId: z.string().min(1),
    nativeScheduleId: z.string().min(1),
});
export const legacyEntrySchema = z.strictObject({
    id: z.string(),
    botId: z.string(),
    botCreatedAt: automationTimeSchema,
    title: z.string(),
    prompt: z.string(),
});
export const aggregateSchema = z.strictObject({
    bindings: z.array(scheduleBindingSchema),
    legacy: z.array(legacyEntrySchema),
    nativeAvailable: z.boolean(),
    legacyUnavailable: z.boolean(),
    legacySkipped: z.number().int().nonnegative(),
});
//# sourceMappingURL=native-schedule.js.map
export const DSH_BOT_MODULE_VERSION = '0.6.3';
