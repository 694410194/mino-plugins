export async function interrupt(store, agent, id, now) {
    // Persist an issued marker first. Recovery never cancels a later user turn.
    const current = agent.status === 'running'
        ? agent.session.snapshotEvents().findLast((e) => e.type === 'turn/start')
        : undefined;
    await store.update(id, {
        interrupt: 'issued',
        ...(current?.type === 'turn/start' ? { interruptTurn: current.data.turn } : {}),
        interruptDeadlineAt: now() + store.config.messageInterruptWaitMs,
    });
    agent.cancel({ kind: 'hook', reason: `dsh-bot-message:${id}` }, { keepInbox: true });
    await store.update(id, { interrupt: 'pending' });
}
//# sourceMappingURL=interrupt.js.map
export const DSH_BOT_MODULE_VERSION = '0.6.3';
