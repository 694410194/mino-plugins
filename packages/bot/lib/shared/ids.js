import { z } from 'zod';
export const BOT_ID_PATTERN = /^[a-z0-9][a-z0-9-]{1,31}$/;
export const botIdSchema = z.string().regex(BOT_ID_PATTERN);
export const memoryIdSchema = z.string().min(1);
//# sourceMappingURL=ids.js.map
export const DSH_BOT_MODULE_VERSION = '0.6.3';
