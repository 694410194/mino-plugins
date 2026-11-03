import type { Context } from '@deepseek-ai/cordis';
import type { BotKey, NotificationRecord, NotificationPolicy } from '../../shared/integrations.js';
import type { DshBotRegistry } from '../registry.js';
export declare const notificationContent: (row: NotificationRecord) => string;
export declare function notificationAdmission(registry: DshBotRegistry, owner: BotKey, row: NotificationRecord): Promise<string | undefined>;
export declare function notificationSend<T>(ctx: Context, registry: DshBotRegistry, row: NotificationRecord, policy: NotificationPolicy, currentPolicy: () => NotificationPolicy, send: () => Promise<T>, signal: AbortSignal): Promise<T>;
