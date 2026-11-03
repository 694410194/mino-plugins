import { randomUUID } from 'node:crypto';
import { mergeLabels, unknownLabel } from './labels.js';
/** Durable, monotone session taint. Cleanup cannot narrow it without a separately verified recomputation. */
export class MemoryLineage {
    kernel;
    constructor(kernel) {
        this.kernel = kernel;
    }
    seen(sessionId) {
        return [...new Set([...this.kernel.domain.table('receipts').entries()]
                .filter(([, r]) => r.sessionId === sessionId && r.state === 'read').flatMap(([, r]) => r.versionIds))];
    }
    label(versionIds) {
        const ids = new Set(versionIds), found = new Map();
        for (const [, op] of this.kernel.domain.table('ops').entries())
            for (const v of op.versions)
                if (ids.has(v.versionId)) {
                    found.set(v.versionId, { ...v.labels, sourceVersions: [...new Set([...v.labels.sourceVersions, v.versionId])],
                        restrictions: this.kernel.snapshot.forgotten.has(v.memoryId) ? [...v.labels.restrictions, 'revoked'] : v.labels.restrictions });
                }
        return mergeLabels(...versionIds.map(id => found.get(id) ?? unknownLabel()));
    }
    async record(sessionId, versionIds) {
        return this.kernel.serial(async () => {
            this.kernel.assertReadable();
            this.kernel.assertOwnership();
            const all = [...new Set([...this.seen(sessionId), ...versionIds])];
            const id = randomUUID();
            await this.kernel.domain.table('receipts').put(id, { id, sessionId, versionIds: all, epoch: this.kernel.epoch, state: 'read' });
            return this.label(all);
        });
    }
}
//# sourceMappingURL=lineage.js.map
export const DSH_BOT_MODULE_VERSION = '0.6.3';
