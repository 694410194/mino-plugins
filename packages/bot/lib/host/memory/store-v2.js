import { MemoryLineage } from '../data-flow/lineage.js';
import { mergeLabels } from '../data-flow/labels.js';
import { randomUUID } from 'node:crypto';
import { sameBot } from '../../shared/identity.js';
import { memoryAddSchema, memoryPatchSchema, memoryListOptionsSchema, memorySchema, normalizeMemoryContent } from '../../shared/schema.js';
import { parseInput } from '../errors.js';
import { missingMemory, nextTimestamp, missingBot, compareId } from '../stores/domain.js';
import { lexicalMemorySearch } from '../stores/memory.js';
import { readableFacts, rankFacts } from './query.js';
import { privateVersion } from './version.js';
const compare = (a, b) => Number(b.pinned) - Number(a.pinned) || b.updatedAt - a.updatedAt || compareId(a.id, b.id);
export class V2MemoryStore {
    kernel;
    bots;
    queue;
    bound;
    constructor(kernel, bots, queue = { tail: Promise.resolve() }, bound) {
        this.kernel = kernel;
        this.bots = bots;
        this.queue = queue;
        this.bound = bound;
    }
    forBot(botId) { return new V2MemoryStore(this.kernel, this.bots, this.queue, this.owner(botId)); }
    captureEpoch() { return this.kernel.epoch; }
    assertEpoch(epoch) { this.kernel.assertReadable(); if (epoch !== this.kernel.epoch)
        throw new Error('Stale memory epoch'); }
    owner(botId) {
        const bot = this.bots.get(botId);
        const key = { botId, botCreatedAt: bot.createdAt };
        if (this.bound && !sameBot(this.bound, key))
            throw missingBot(botId);
        return key;
    }
    mutate(work) {
        const epoch = this.captureEpoch();
        const result = this.queue.tail.then(() => { this.assertEpoch(epoch); return work(); });
        this.queue.tail = result.catch(() => { });
        return result;
    }
    compare = (a, b) => {
        const sourceId = (id) => {
            const v = this.kernel.snapshot.versions.get(id);
            return v && this.kernel.domain.table('payloads').get(v.contentRef)?.legacy?.id || id;
        };
        return compare({ ...a, id: sourceId(a.id) }, { ...b, id: sourceId(b.id) });
    };
    /** Read-only legacy DTO. Host version/provenance fields never enter the old Remote/tool contract. */
    records(botId) {
        const owner = this.owner(botId), rows = [];
        for (const v of this.kernel.snapshot.versions.values()) {
            if (v.scope !== 'private' || !sameBot(v.ownerBotKey, owner) || v.status !== 'active')
                continue;
            if (v.labels.readers === 'shared' || !v.labels.readers.some(reader => sameBot(reader, owner)) ||
                v.labels.restrictions.some(r => r === 'revoked' || r === 'pending-cleanup'))
                continue;
            const payload = this.kernel.domain.table('payloads').get(v.contentRef);
            if (payload?.legacy)
                rows.push(memorySchema.parse({ ...payload.legacy, id: v.memoryId, content: payload.content }));
        }
        return rows.sort(this.compare);
    }
    listByBot(botId, options) {
        const f = parseInput(memoryListOptionsSchema, options);
        return this.records(botId).filter(r => (f.pinned === undefined || r.pinned === f.pinned) &&
            (f.tag === undefined || r.tags.includes(f.tag)) && (!f.query || lexicalMemorySearch.matches(r, f.query)) &&
            (!f.before || this.compare(r, f.before) > 0)).slice(0, f.limit);
    }
    readableByBot(botId, options) {
        const f = parseInput(memoryListOptionsSchema, options), owner = this.owner(botId);
        const facts = readableFacts(this.kernel, owner, { at: Date.now() });
        return rankFacts(facts, f.query ?? '', 10000, this.kernel.retrievalConfig).flatMap(({ version: v, payload: p }) => {
            const record = p.legacy ? memorySchema.parse({ ...p.legacy, id: v.memoryId, content: p.content, botId }) : memorySchema.parse({
                id: v.memoryId, botId, content: p.content, kind: 'fact', tags: [], pinned: false,
                createdAt: v.recordedAt, updatedAt: v.recordedAt,
            });
            if (f.tag !== undefined && !record.tags.includes(f.tag) || f.pinned !== undefined && record.pinned !== f.pinned)
                return [];
            return [{ ...record, ...(v.scope === 'shared' ? { scope: 'shared' } : {}) }];
        }).slice(0, f.limit);
    }
    countByBot(botId) { return this.records(botId).length; }
    async add(input) { return (await this.persist(input, false)).record; }
    async saveUnique(input, signal) {
        const result = await this.persist(input, true, signal);
        return { id: result.record.id, deduplicated: result.deduplicated };
    }
    persist(input, deduplicate, signal) {
        const fields = parseInput(memoryAddSchema, input);
        return this.mutate(async () => {
            signal?.throwIfAborted();
            const owner = this.owner(fields.botId);
            const previous = deduplicate ? this.records(fields.botId).filter(r => normalizeMemoryContent(r.content) === normalizeMemoryContent(fields.content))
                .sort((a, b) => a.createdAt - b.createdAt || a.id.localeCompare(b.id))[0] : undefined;
            const record = memorySchema.parse(previous ? { ...previous, tags: [...new Set([...previous.tags, ...fields.tags])],
                pinned: previous.pinned || fields.pinned, updatedAt: nextTimestamp(previous.updatedAt) }
                : { ...fields, id: randomUUID(), createdAt: Date.now(), updatedAt: Date.now() });
            await this.put(record, owner);
            return { record, deduplicated: !!previous };
        });
    }
    async put(record, owner) {
        const previous = this.kernel.snapshot.versions.get(record.id);
        const { version, payload } = privateVersion(this.kernel, record, owner, { memoryId: record.id,
            versionId: randomUUID(), contentRef: randomUUID(), revision: (previous?.revision ?? 0) + 1 }, record.source?.by === 'model' ? 'model' : 'management');
        if (previous) {
            version.labels = mergeLabels(version.labels, previous.labels);
            version.labels.sourceVersions = [...new Set([...version.labels.sourceVersions, previous.versionId])];
            version.sourceRefs = [...previous.sourceRefs, ...version.sourceRefs, { parentVersionId: previous.versionId }];
        }
        if (record.source?.by === 'model' && record.source.sessionId) {
            const lineage = new MemoryLineage(this.kernel), seen = lineage.seen(record.source.sessionId);
            if (seen.length)
                version.labels = mergeLabels(version.labels, lineage.label(seen));
            const session = this.kernel.domain.table('flow_sessions').get(record.source.sessionId);
            if (session)
                version.labels = mergeLabels(version.labels, session.label);
        }
        await this.kernel.commit({ opId: randomUUID(), kind: previous ? 'revise' : 'propose', subjectIds: [record.id],
            expectedRevision: this.kernel.seq, forgetEpoch: this.kernel.epoch, versions: [version], payloads: { [version.contentRef]: payload } });
    }
    async update(botId, id, patch) {
        const fields = parseInput(memoryPatchSchema, patch);
        return this.mutate(async () => {
            const record = this.records(botId).find(r => r.id === id);
            if (!record)
                throw missingMemory();
            const updated = memorySchema.parse({ ...record, ...fields, updatedAt: nextTimestamp(record.updatedAt) });
            await this.put(updated, this.owner(botId));
            return updated;
        });
    }
    async remove(botId, id) {
        return this.mutate(async () => {
            if (!this.records(botId).some(r => r.id === id))
                throw missingMemory();
            await this.forget([id]);
        });
    }
    async forget(ids) {
        if (!ids.length)
            return;
        await this.kernel.commit({ opId: randomUUID(), kind: 'forget', subjectIds: ids,
            expectedRevision: this.kernel.seq, forgetEpoch: this.kernel.epoch + 1 });
    }
    async removeByBot(botId) {
        return this.mutate(async () => {
            const owner = this.owner(botId);
            const ids = [...this.kernel.snapshot.versions.values()]
                .filter(v => v.scope === 'private' && sameBot(v.ownerBotKey, owner)).map(v => v.memoryId);
            await this.forget(ids);
            return ids.length;
        });
    }
}
//# sourceMappingURL=store-v2.js.map
export const DSH_BOT_MODULE_VERSION = '0.6.3';
