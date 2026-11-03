import { z } from 'zod';
export const routineOutcomeSchema = z.strictObject({
    messageId: z.string(),
    turn: z.number().int(),
    state: z.enum(['processing', 'responded', 'stopped', 'failed', 'limited', 'unknown']),
    at: z.number(),
});
//# sourceMappingURL=routine-outcomes.js.map
export const DSH_BOT_MODULE_VERSION = '0.6.3';
