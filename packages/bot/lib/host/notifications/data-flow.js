import { outlets } from '../data-flow/tool-guard.js';
export const notificationContent = (row) => JSON.stringify({
    owner: row.owner, policyId: row.policyId, policyRevision: row.policyRevision, scopeDigest: row.scopeDigest,
    targetDigest: row.targetDigest, text: row.text, source: row.source,
});
export async function notificationAdmission(registry, owner, row) {
    const flow = outlets(registry);
    if (!flow)
        return;
    if (!row.source.sessionId)
        throw new Error('Notification held: unknown source lineage');
    const envelope = flow.draft('notify-record', owner, row.source.sessionId, row.id, { kind: 'bot', bot: owner }, notificationContent(row));
    return flow.admit(envelope);
}
export async function notificationSend(ctx, registry, row, policy, currentPolicy, send, signal) {
    const flow = outlets(registry);
    if (!flow)
        return send();
    const checkedSend = () => {
        const current = currentPolicy();
        if (!current.enabled || current.revision !== row.policyRevision || current.scopeDigest !== row.scopeDigest ||
            current.targetDigest !== row.targetDigest)
            throw new Error('Notification policy changed');
        return send();
    };
    const prior = row.flowId ? flow.get(row.flowId) : undefined;
    if (!prior?.envelope || prior.envelope.content !== notificationContent(row))
        throw new Error('Notification held: missing or changed envelope');
    flow.checker.check(prior.envelope, undefined, undefined, signal);
    const sessionId = row.source.sessionId;
    if (!sessionId)
        throw new Error('Notification held: missing session');
    if (policy.channel === 'in-app') {
        const envelope = flow.draft('notify-send', row.owner, sessionId, `${row.id}:display`, { kind: 'bot', bot: row.owner }, notificationContent(row));
        const id = await flow.admit(envelope, undefined, signal);
        return flow.dispatch(id, checkedSend, signal);
    }
    // Generic policy approval never authorizes data egress. The exact destination/text needs native approval.
    const envelope = flow.draft('notify-send', row.owner, sessionId, `${row.id}:send`, { kind: 'external', destination: JSON.stringify([policy.channel, policy.targetRef, policy.targetDigest]) }, notificationContent(row));
    const agent = ctx.get('agents')?.get(sessionId);
    if (!agent)
        throw new Error('Notification export needs a live native approval context');
    const grant = await flow.request(agent, envelope, signal), id = await flow.admit(envelope, grant, signal);
    return flow.dispatch(id, checkedSend, signal);
}
//# sourceMappingURL=data-flow.js.map
export const DSH_BOT_MODULE_VERSION = '0.6.3';
