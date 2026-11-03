import { createUserMessage } from '@deepseek-ai/dsh-llm';
import { toolPairingBalancedBefore, toolPairingBalancedAfter } from '@deepseek-ai/dsh-compaction';
export const removalNotice = () => createUserMessage({
    content: [{ type: 'text', text: 'Memory-related history was removed by explicit user choice.' }],
    source: { kind: 'dsh-bot-memory-forget', form: 'notice', summary: 'History removed' },
});
/** Keep the native head intact: idle system append is invalid durable grammar in rc.2. */
export async function cleanHistory(agent, io) {
    agent.cancel({ kind: 'hook', reason: 'Memory cleanup' }, { keepInbox: true });
    await agent.whenIdle();
    return agent.runMaintenance(async (signal) => {
        signal.throwIfAborted();
        const session = agent.session, reasons = [];
        const events = new Map(session.snapshotEvents().map(e => [e.seq, e]));
        const head = session.surface.nodes[0];
        const hasHead = head !== undefined && events.get(head)?.type === 'system/message';
        if (hasHead && io.headBlocked !== false)
            reasons.push('system-head');
        const nodes = session.surface.nodes.slice(hasHead ? 1 : 0);
        const first = nodes[0], last = nodes.at(-1);
        // An already replaced range is a no-op, including after crash/retry.
        const existing = first === last && first !== undefined ? events.get(first) : undefined;
        const alreadyClean = existing?.type === 'user/message' &&
            existing.data.source?.kind === 'dsh-bot-memory-forget';
        if (first !== undefined && last !== undefined && !alreadyClean) {
            if (!toolPairingBalancedBefore(session, first) || !toolPairingBalancedAfter(session, last))
                return ['history'];
            session.append('user/message', removalNotice(), {
                surfaceOp: { op: 'replace', startSeq: first, endSeq: last }, sourceEventSeqs: nodes,
            });
        }
        signal.throwIfAborted();
        if (!await io.flush(session))
            return [...reasons, 'flush'];
        // Read back the public projection too. Raw events remain deliberately out of the model's reach.
        await io.readSurface(session);
        if (agent.inbox.nextStep.length || agent.inbox.nextTurn.length)
            reasons.push('inbox');
        if (!io.rawReadPolicyVerified)
            reasons.push('raw-read-policy');
        return reasons;
    });
}
//# sourceMappingURL=history.js.map
export const DSH_BOT_MODULE_VERSION = '0.6.3';
