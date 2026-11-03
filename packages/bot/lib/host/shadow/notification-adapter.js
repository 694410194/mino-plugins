import { localTime, quietAt } from '../notifications/time.js';
export { localTime };
/** Uses the shipped notification policy/time semantics; deliberately has no notification send port. */
export function notificationDecision(at, policy, used, lastAt) {
    if (!policy.enabled)
        return 'policy-disabled';
    if (quietAt(at, policy))
        return 'quiet';
    if (used >= policy.dailyLimit)
        return 'bot-budget';
    if (lastAt !== undefined && at - lastAt < policy.cooldownSec * 1000)
        return 'cooldown';
    return 'eligible';
}
//# sourceMappingURL=notification-adapter.js.map
export const DSH_BOT_MODULE_VERSION = '0.6.3';
