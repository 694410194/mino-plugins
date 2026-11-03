import { z } from 'zod';
import { botIdSchema } from './ids.js';
export const resourceId = z.string().regex(/^[A-Za-z0-9][A-Za-z0-9_.:-]{0,159}$/);
export const botKeySchema = z.strictObject({ botId: botIdSchema, botCreatedAt: z.number().int().nonnegative() });
export const sameBot = (a, b) => a.botId === b.botId && a.botCreatedAt === b.botCreatedAt;
export const metadata = {
    revision: z.number().int().positive(),
    createdAt: z.number().int().nonnegative(),
    updatedAt: z.number().int().nonnegative(),
    schemaVersion: z.literal(1),
};
//# sourceMappingURL=identity.js.map
export const DSH_BOT_MODULE_VERSION = '0.6.3';
