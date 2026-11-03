import { wakeSourceSchema } from '../../shared/messaging.js';
const ambient = new Set(['agent-instructions', 'runtime-context', 'time-context', 'tmux-context']);
export const isWake = (message) => wakeSourceSchema.safeParse(message.source).success;
/** Native next() adds ambient context. It is not business input that may wake a model. */
export function withoutWakeControls(claimed, decision) {
    if (decision.kind !== 'enter')
        return decision;
    const messages = decision.messages.filter((m) => !isWake(m));
    if (claimed.some(isWake) && !messages.some((m) => !ambient.has(m.source.kind)))
        return { kind: 'reject' };
    return { ...decision, messages };
}
//# sourceMappingURL=wake.js.map
export const DSH_BOT_MODULE_VERSION = '0.6.3';
