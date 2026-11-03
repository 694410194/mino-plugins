import { GROUP_ROOT_PRESET } from '../../shared/groups.js';
import { OperationError } from '../common/operations.js';
export const name = 'dsh-bot-group-root-guard';
/** Exact Agent and complete-message check; a machine source alone grants no authority. */
export async function executeRootSetup(agent, messages, turn) {
    const permit = agent.ctx.get('dshBotGroupSetupPermit', false);
    if (!permit || permit.agent !== agent || permit.consumed || !permit.valid() || messages.length !== 1)
        return false;
    const message = messages[0];
    if (message?.source.kind !== 'dsh-bot-group-setup' || message.id !== permit.messageId || JSON.stringify(message) !== permit.fingerprint)
        return false;
    permit.consumed = true;
    permit.turn = turn;
    await permit.run();
    if (!permit.valid())
        throw new OperationError('recovery-needed');
    permit.completed = true;
    return true;
}
/** Execute genuine root setup inside a native no-model turn. Callers serialize the entire idle pair. */
export async function runRootSetup(agent, message, valid, run) {
    await agent.whenIdle();
    if (!valid() || agent.ctx.get('dshBotGroupSetupPermit', false) || agent.inbox.nextTurn.length || agent.inbox.nextStep.length)
        throw new OperationError('recovery-needed');
    const offset = agent.session.seq;
    const permit = { agent, messageId: message.id, fingerprint: JSON.stringify(message), valid, run, consumed: false, completed: false };
    // Cordis service names are shared. The Groups queue serializes this short-lived lease, whose
    // identity is additionally bound to one Agent. Dynamic lookup survives retained preset modules.
    const revoke = agent.ctx.effect(() => agent.ctx.provide('dshBotGroupSetupPermit', permit), 'dsh-bot: group setup permit');
    try {
        agent.followup(message);
        // Do not race cancellation: the queue must retain ownership until all callback writes finish.
        await agent.whenIdle();
        const ended = agent.session.snapshotEvents(offset).find(event => event.type === 'turn/end' && event.data.turn === permit.turn);
        if (!valid() || !permit.consumed || !permit.completed || ended?.type !== 'turn/end' || ended.data.reason.kind !== 'completed')
            throw new OperationError('recovery-needed');
    }
    finally {
        await revoke();
    }
}
/** Retained preset generation owns the listener, even for a Controller-owned root. */
export function apply(ctx) {
    ctx.effect(() => ctx.on('agent/pre-step', async ({ agent, messages, turn }, next) => {
        if (agent.session.header.agentPreset !== GROUP_ROOT_PRESET)
            return next();
        const decision = await next();
        if (decision.kind !== 'reject' && await executeRootSetup(agent, messages, turn))
            return { kind: 'enter', messages: [] };
        return { kind: 'reject' };
    }, { prepend: true }), 'dsh-bot: group root no-model guard');
    ctx.effect(() => ctx.on('agent/request', async ({ agent }, next) => {
        if (agent.session.header.agentPreset === GROUP_ROOT_PRESET)
            throw new OperationError('unavailable');
        return next();
    }, { prepend: true }), 'dsh-bot: group root request prohibition');
}
//# sourceMappingURL=root-guard.js.map
export const DSH_BOT_MODULE_VERSION = '0.6.3';
