import { randomUUID } from 'node:crypto';
import { sameBot } from '../../shared/identity.js';
import { isDeepStrictEqual } from 'node:util';
import { forgetSelectionSchema } from '../../shared/memory-forget.js';
export class ForgetPreviews {
    kernel;
    inventory;
    pending = new Map();
    constructor(kernel, inventory) {
        this.kernel = kernel;
        this.inventory = inventory;
    }
    async contribution(memoryId) {
        return this.createPreview({ memoryId, mode: 'related' }, true);
    }
    async create(selection) {
        return this.createPreview(selection, false);
    }
    async createPreview(selection, shard) {
        const input = forgetSelectionSchema.parse(selection);
        return this.kernel.serial(async () => {
            const { preview, stamp } = await this.build(input, shard);
            // Preview data lives only in the owning Host. Bounded even when callers abandon dialogs.
            if (this.pending.size >= 128)
                this.pending.delete(this.pending.keys().next().value ?? '');
            this.pending.set(preview.previewRevision, { selection: input, preview, stamp, shard });
            return structuredClone(preview);
        });
    }
    /** Called inside the kernel commit queue, immediately before persisting intent. */
    async validate(revision) {
        const old = this.pending.get(revision);
        if (!old)
            throw new Error('Forget preview expired; preview again');
        const next = await this.build(old.selection, old.shard);
        const { previewRevision: _before, ...before } = old.preview;
        const { previewRevision: _after, ...after } = next.preview;
        if (!isDeepStrictEqual(before, after) || !isDeepStrictEqual(old.stamp, next.stamp))
            throw new Error('Forget preview changed; preview again');
        return structuredClone(old.preview);
    }
    clear() { this.pending.clear(); }
    async build(selection, shard = false) {
        const state = this.kernel.snapshot, seed = state.versions.get(selection.memoryId);
        if (!seed)
            throw new Error('Memory is no longer available');
        const versions = [...this.kernel.domain.table('ops').entries()].flatMap(([, op]) => op.versions);
        const targets = new Set([seed.memoryId]);
        if (shard) {
            if (seed.scope !== 'shared' || seed.shard === 'user')
                throw new Error('No Bot contribution shard');
            for (const v of versions)
                if (v.scope === 'shared' && v.shard !== 'user' && sameBot(v.shard, seed.shard) &&
                    state.versions.has(v.memoryId))
                    targets.add(v.memoryId);
        }
        const seedCount = targets.size;
        if (selection.mode === 'related') {
            const selectedVersions = new Set();
            let changed = true;
            while (changed) {
                changed = false;
                for (const v of versions)
                    if (targets.has(v.memoryId))
                        selectedVersions.add(v.versionId);
                for (const v of versions) {
                    const refs = [...v.labels.sourceVersions, ...v.sourceRefs.flatMap(r => r.parentVersionId ? [r.parentVersionId] : [])];
                    const duplicate = versions.some(selected => targets.has(selected.memoryId) && this.duplicate(selected, v));
                    if (!targets.has(v.memoryId) && (refs.some(id => selectedVersions.has(id)) || duplicate)) {
                        targets.add(v.memoryId);
                        changed = true;
                    }
                }
            }
        }
        const inventory = await this.inventory();
        return { preview: {
                previewRevision: randomUUID(), ...selection, revision: state.seq,
                targets: [...targets].sort(), sessionIds: [...new Set(inventory.sessionIds)].sort(),
                affectedBots: inventory.bots, derivatives: targets.size - seedCount,
                versions: versions.filter(v => targets.has(v.memoryId)).length,
                historyNodes: inventory.historyNodes, summaries: inventory.summaries, copies: inventory.copies,
                pendingMessages: inventory.pendingMessages, conservative: inventory.conservative, rootInstructions: inventory.rootInstructions,
            }, stamp: structuredClone(inventory.stamp) };
    }
    duplicate(seed, other) {
        // Exact duplicates/structured keys within the same permission domain only; never infer semantic equivalence.
        if (seed.scope !== other.scope || (seed.scope === 'private' && other.scope === 'private' &&
            !isDeepStrictEqual(seed.ownerBotKey, other.ownerBotKey)))
            return false;
        const a = this.kernel.domain.table('payloads').get(seed.contentRef), b = this.kernel.domain.table('payloads').get(other.contentRef);
        if (!a || !b)
            return false;
        return a.content.normalize('NFKC').trim() === b.content.normalize('NFKC').trim() ||
            !!(a.factKey && b.factKey && a.subject && a.subject === b.subject && a.factKey === b.factKey &&
                isDeepStrictEqual(a.qualifiers, b.qualifiers));
    }
}
//# sourceMappingURL=forget-preview.js.map
export const DSH_BOT_MODULE_VERSION = '0.6.3';
