import { randomUUID } from 'node:crypto';
import { parseInput } from '../errors.js';
import { botIdSchema, memoryIdSchema } from '../../shared/ids.js';
import { memoryAddSchema, memoryListOptionsSchema, memoryPatchSchema, memorySchema, normalizeMemoryContent, } from '../../shared/schema.js';
import { read, write, nextTimestamp, compareId, missingBot, missingMemory, deleteBotMemories, } from './domain.js';
// Custom predicates get a shallow frozen view, never mutable storage references.
function searchView(record) {
    return Object.freeze({
        ...record,
        tags: Object.freeze([...record.tags]),
        source: record.source === undefined ? undefined : Object.freeze({ ...record.source }),
    });
}
const normalize = (value) => value.normalize('NFKC').toLowerCase();
export function tokenizeMemoryQuery(query) {
    const words = normalize(query)
        .replace(/(\p{Script=Han}+)/gu, ' $1 ')
        .match(/[\p{L}\p{N}]+/gu) ?? [];
    return [
        ...new Set(words.flatMap((word) => {
            const chars = [...word];
            return /^\p{Script=Han}+$/u.test(word) && chars.length > 1
                ? chars.slice(0, -1).map((char, index) => char + chars[index + 1])
                : [word];
        })),
    ];
}
export const lexicalMemorySearch = {
    matches: (record, query) => {
        const content = normalize(record.content);
        return tokenizeMemoryQuery(query).every((token) => content.includes(token));
    },
};
function compareMemory(a, b) {
    return Number(b.pinned) - Number(a.pinned) || b.updatedAt - a.updatedAt || compareId(a.id, b.id);
}
export class MemoryStore {
    domain;
    search;
    constructor(domain, search = lexicalMemorySearch) {
        this.domain = domain;
        this.search = search;
    }
    async add(input) {
        return (await this.persist(input, false)).record;
    }
    /** Match and merge inside the domain writer, including across Store instances. */
    async saveUnique(input, signal) {
        const { record, deduplicated } = await this.persist(input, true, signal);
        return { id: record.id, deduplicated };
    }
    async persist(input, deduplicate, signal) {
        const fields = parseInput(memoryAddSchema, input);
        return write(this.domain, async () => {
            signal?.throwIfAborted();
            if (!this.domain.table('bots').get(fields.botId))
                throw missingBot(fields.botId);
            const table = this.domain.table('memories');
            if (deduplicate) {
                const normalized = normalizeMemoryContent(fields.content);
                const existing = [...table.entries()]
                    .map(([, record]) => record)
                    .filter((record) => record.botId === fields.botId && normalizeMemoryContent(record.content) === normalized)
                    .sort((a, b) => a.createdAt - b.createdAt || compareId(a.id, b.id))[0];
                if (existing) {
                    const record = parseInput(memorySchema, {
                        ...existing,
                        tags: [...new Set([...existing.tags, ...fields.tags])],
                        pinned: existing.pinned || fields.pinned,
                        updatedAt: nextTimestamp(existing.updatedAt),
                    });
                    await table.put(record.id, record);
                    return { record: structuredClone(record), deduplicated: true };
                }
            }
            let id = randomUUID();
            while (table.get(id))
                id = randomUUID();
            const now = Date.now();
            const record = parseInput(memorySchema, { ...fields, id, createdAt: now, updatedAt: now });
            await table.put(id, record);
            return { record: structuredClone(record), deduplicated: false };
        });
    }
    async update(botId, id, patch) {
        const owner = parseInput(botIdSchema, botId);
        const key = parseInput(memoryIdSchema, id);
        const fields = parseInput(memoryPatchSchema, patch);
        return write(this.domain, async () => structuredClone(await this.domain.table('memories').update(key, (current) => {
            if (current.botId !== owner)
                throw missingMemory();
            return parseInput(memorySchema, { ...current, ...fields, updatedAt: nextTimestamp(current.updatedAt) });
        })), 'memory/not-found');
    }
    async remove(botId, id) {
        const owner = parseInput(botIdSchema, botId);
        const key = parseInput(memoryIdSchema, id);
        return write(this.domain, async () => {
            const table = this.domain.table('memories');
            if (table.get(key)?.botId !== owner || !(await table.delete(key)))
                throw missingMemory();
        }, 'memory/not-found');
    }
    /** Count all rows owned by a Bot without allocating/cloning a result page. */
    countByBot(botId) {
        const owner = parseInput(botIdSchema, botId);
        return read(() => {
            let count = 0;
            for (const [, record] of this.domain.table('memories').entries()) {
                if (record.botId === owner)
                    count++;
            }
            return count;
        });
    }
    /** Cursor denotes an exclusive position, not a timestamp cutoff or snapshot. */
    listByBot(botId, options) {
        const owner = parseInput(botIdSchema, botId);
        const filter = parseInput(memoryListOptionsSchema, options);
        return read(() => [...this.domain.table('memories').entries()]
            .filter(([, record]) => record.botId === owner)
            .map(([, record]) => record)
            .filter((record) => (filter.tag === undefined || record.tags.includes(filter.tag)) &&
            (filter.pinned === undefined || record.pinned === filter.pinned) &&
            (filter.before === undefined || compareMemory(record, filter.before) > 0) &&
            (filter.query === undefined ||
                this.search.matches(this.search === lexicalMemorySearch ? record : searchView(record), filter.query)))
            .sort(compareMemory)
            .slice(0, filter.limit)
            .map((record) => structuredClone(record)));
    }
    /** Serialized with adds/removes through either Store; not a cross-table transaction. */
    async removeByBot(botId) {
        const owner = parseInput(botIdSchema, botId);
        return write(this.domain, () => deleteBotMemories(this.domain, owner));
    }
}
//# sourceMappingURL=memory.js.map
export const DSH_BOT_MODULE_VERSION = '0.6.3';
