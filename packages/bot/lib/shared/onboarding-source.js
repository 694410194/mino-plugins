import { z } from 'zod';
import { botIdSchema } from './ids.js';
export const onboardingSourceSchema = z.strictObject({
    kind: z.literal('dsh-bot-onboarding'), botId: botIdSchema, botCreatedAt: z.number().int().nonnegative(),
    operationId: z.uuid(), sessionId: z.string().min(1), inputId: z.string().min(1),
    context: z.strictObject({ form: z.literal('notice'), summary: z.string().min(1).max(120) }),
});
//# sourceMappingURL=onboarding-source.js.map
export const DSH_BOT_MODULE_VERSION = '0.6.3';
