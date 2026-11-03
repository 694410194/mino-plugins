/** Capture source dependencies before payload erasure; persist only session identities, never content hashes. */
export function contaminatedHeads(kernel, preview, agents, presetPrefix = 'bot-') {
    const versions = [...kernel.domain.table('ops').entries()].flatMap(([, op]) => op.versions)
        .filter(v => preview.targets.includes(v.memoryId));
    const ids = new Set(versions.map(v => v.versionId));
    const contents = versions.flatMap(v => {
        const payload = kernel.domain.table('payloads').get(v.contentRef);
        return payload ? [payload.content] : [];
    });
    return agents.filter(agent => {
        const seq = agent.session.surface.nodes[0];
        const head = agent.session.snapshotEvents().find(e => e.seq === seq);
        if (head?.type !== 'system/message')
            return false;
        const text = head.data.message.content.filter(b => b.type === 'text').map(b => b.text).join('\n');
        const read = [...kernel.domain.table('receipts').entries()].some(([, r]) => r.sessionId === agent.session.id && r.versionIds.some(id => ids.has(id)));
        const owner = versions.some(v => v.scope === 'private' &&
            agent.session.header.agentPreset === `${presetPrefix}${v.ownerBotKey.botId}`);
        const truncated = text.split('\n').flatMap(line => {
            const match = line.match(/^\s*- (?:\[pinned\] )?\[[^\]]+\] \[truncated\] (".*")$/);
            if (!match?.[1])
                return [];
            try {
                const value = JSON.parse(match[1]);
                return typeof value === 'string' ? [value] : [];
            }
            catch {
                return [];
            }
        });
        return contents.some(content => text.includes(content) || text.includes(JSON.stringify(content))) ||
            ((read || owner) && truncated.some(value => value.endsWith('…') &&
                contents.some(content => content.startsWith(value.slice(0, -1)))));
    }).map(a => a.session.id);
}
//# sourceMappingURL=history-proof.js.map
export const DSH_BOT_MODULE_VERSION = '0.6.3';
