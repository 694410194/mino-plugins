import { withoutWakeControls } from './wake.js';
import { randomUUID } from 'node:crypto';
import { digest, OperationError } from '../common/operations.js';
// Explicitly audited local reads only. MCP, run_code and unknown tools always ask.
const reads = new Set(['bot_memory_search', 'bot_memory_list']);
export function teammateTurn(agent) {
    const events = agent.session.snapshotEvents();
    const start = events.findLast((e) => e.type === 'turn/start')?.seq ?? -1;
    return events.some((e) => e.seq > start && e.type === 'user/message' &&
        ['dsh-bot-message', 'dsh-bot-message-sent', 'dsh-bot-message-wake'].includes(e.data.source.kind));
}
export function invocation(agent, exec) {
    return JSON.stringify([agent.session.snapshotEvents().findLast((e) => e.type === 'step/start' || e.type === 'turn/start')?.seq,
        exec.rootCallId, exec.callId]);
}
export class MessagingSafety {
    grants = new Map();
    scopes = new Map();
    targets(id) { const targets = this.scopes.get(id); this.scopes.delete(id); return targets; }
    active = true;
    revoke(key) { this.grants.delete(key); }
    close() { this.active = false; this.grants.clear(); this.scopes.clear(); }
    async approve(agent, input, target, invocation = '') {
        const grant = this.grants.get(invocation);
        this.grants.delete(invocation);
        grant?.signal?.throwIfAborted();
        if (!this.active || !grant || grant.valid?.() === false
            || grant.agent !== agent || grant.digest !== digest(input) || digest(grant.target) !== digest(target))
            throw new OperationError('approval-denied');
        this.scopes.set(grant.id, grant.targets);
        return grant.id;
    }
    grant(agent, input, target, invocation, targets, signal, valid) {
        if (!this.active)
            throw new OperationError('unavailable');
        this.grants.set(invocation, { agent, digest: digest(input), target, id: `native:${randomUUID()}`, targets, signal, valid });
    }
    /** Guard ownership is the retained Agent, not the preset or Host plugin fiber. */
    protect(agent) {
        const ctx = agent.ctx;
        ctx.effect(() => {
            const decisions = new WeakSet();
            const wakeOff = ctx.on('agent/pre-step', async (payload, next) => withoutWakeControls(payload.messages, await next()));
            const off = ctx.on('tools/pre-execute', async (exec, next) => {
                const decision = await next();
                if (decision.kind === 'deny' || decision.kind === 'cancel')
                    return decision;
                if (!teammateTurn(agent) || reads.has(exec.name) || exec.name === 'bot_message')
                    return decision;
                decisions.add(exec);
                const displayReason = {
                    en: `Teammate data is not user authorization. Approve ${exec.name}: ${JSON.stringify(exec.arguments)}`,
                    zh: `队友消息不代表用户授权。请审批 ${exec.name}：${JSON.stringify(exec.arguments)}`,
                };
                if (decision.kind === 'ask') {
                    displayReason.en += `\n${decision.displayReason?.en ?? decision.reason}`;
                    displayReason.zh += `\n${decision.displayReason?.zh ?? decision.reason}`;
                }
                return { kind: 'ask', reason: displayReason.en, displayReason };
            }, { prepend: true });
            const guard = ctx.tools.guard((exec) => {
                if (exec.name === 'bot_message' && exec.parent !== undefined)
                    return 'bot_message is disabled inside run_code';
                if (!teammateTurn(agent))
                    return;
                if (!this.active)
                    return 'Messaging unloaded; teammate processing requires the safety adapter';
                if (exec.name === 'bot_delegate')
                    return 'Teammate input cannot delegate';
                if (exec.name !== 'bot_message' && !reads.has(exec.name) && !decisions.has(exec))
                    return 'Teammate tool approval missing';
            });
            return () => { off(); guard(); wakeOff(); };
        }, 'dsh-bot: retained teammate safety');
    }
}
//# sourceMappingURL=safety.js.map
export const DSH_BOT_MODULE_VERSION = '0.6.3';
