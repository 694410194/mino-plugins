import { z } from 'zod';
import { botIdSchema } from './ids.js';
import { botCreateSchema } from './schema.js';
export const createForChatSchema = z.strictObject({
    operationId: z.uuid(), bot: botCreateSchema, language: z.enum(['zh', 'en']),
});
export const startOnboardingSchema = z.strictObject({ botId: botIdSchema, operationId: z.uuid(), sessionId: z.string().min(1) });
export const onboardingStatusSchema = z.strictObject({
    botId: botIdSchema, operationId: z.uuid().optional(), sessionId: z.string().optional(),
    state: z.enum(['unavailable', 'pending', 'dispatching', 'submitted', 'completed', 'skipped', 'failed', 'uncertain']),
    retryable: z.boolean(), reason: z.string().optional(),
});
//# sourceMappingURL=onboarding.js.map
export const DSH_BOT_MODULE_VERSION = '0.6.3';
