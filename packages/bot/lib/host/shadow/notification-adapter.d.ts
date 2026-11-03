import type { NotificationPolicy } from '../../shared/integrations.js';
import { localTime } from '../notifications/time.js';
export { localTime };
/** Uses the shipped notification policy/time semantics; deliberately has no notification send port. */
export declare function notificationDecision(at: number, policy: NotificationPolicy, used: number, lastAt?: number): "cooldown" | "policy-disabled" | "quiet" | "bot-budget" | "eligible";
