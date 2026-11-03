import { z } from 'zod';
import { botIdSchema, memoryIdSchema } from '../../shared/ids.js';
import { MEMORY_LIST_MAX_LIMIT, memoryAddSchema, memoryListOptionsSchema, memoryPatchSchema, } from '../../shared/schema.js';
import { parseInput } from '../errors.js';
import { rejectModelSecrets } from './secrets.js';
import { failure } from '../stores/domain.js';
// These strict schemas are also the tool boundary: identity and provenance are
// supplied by the Host, never accepted from model arguments.
export const memorySaveInputSchema = memoryAddSchema.omit({ botId: true, source: true });
export const memorySearchInputSchema = memoryListOptionsSchema
    .pick({ query: true, limit: true })
    .extend({ query: z.string(), limit: memoryListOptionsSchema.shape.limit.optional() });
export const memoryListInputSchema = memoryListOptionsSchema
    .pick({ tag: true, pinned: true, limit: true })
    .extend({ limit: memoryListOptionsSchema.shape.limit.optional() });
export const memoryForgetInputSchema = z.strictObject({ id: memoryIdSchema });
const executeImmediately = async (operation) => operation();
const injectLimitSchema = z.number().int().nonnegative();
/** A capability for exactly one Bot. The registry supplies its lifecycle queue. */
export class BotMemoryService {
    store;
    execute;
    botId;
    defaultListLimit;
    constructor(store, botId, execute = executeImmediately, defaultListLimit = 20) {
        this.store = store;
        this.execute = execute;
        this.botId = parseInput(botIdSchema, botId);
        this.store = store.forBot?.(botId) ?? store;
        this.defaultListLimit = parseInput(memoryListOptionsSchema.shape.limit, defaultListLimit);
    }
    async save(input, source, signal) {
        if (source?.by === 'model')
            rejectModelSecrets(input);
        const fields = parseInput(memorySaveInputSchema, input);
        const provenance = parseInput(memoryAddSchema.shape.source, source);
        return this.run(() => this.store.saveUnique({
            ...fields,
            botId: this.botId,
            ...(provenance === undefined ? {} : { source: provenance }),
        }, signal), signal);
    }
    async search(input, signal, observed = async () => { }) {
        const fields = parseInput(memorySearchInputSchema, input);
        return this.run(async () => {
            const rows = (this.store.readableByBot?.bind(this.store) ?? this.store.listByBot.bind(this.store))(this.botId, {
                ...fields, limit: fields.limit ?? this.defaultListLimit,
            });
            await observed(rows);
            return rows;
        }, signal);
    }
    async list(input = {}, signal, observed = async () => { }) {
        const fields = parseInput(memoryListInputSchema, input);
        return this.run(async () => {
            const rows = (this.store.readableByBot?.bind(this.store) ?? this.store.listByBot.bind(this.store))(this.botId, {
                ...fields, limit: fields.limit ?? this.defaultListLimit,
            });
            await observed(rows);
            return rows;
        }, signal);
    }
    async forget(input, signal) {
        const { id } = parseInput(memoryForgetInputSchema, input);
        return this.run(() => this.store.remove(this.botId, id), signal);
    }
    /** Management batches use the same validation, deduplication and registry ownership queue. */
    async saveBatch(inputs, check) {
        const fields = inputs.map((input) => {
            rejectModelSecrets(input);
            return parseInput(memorySaveInputSchema, input);
        });
        return this.run(async () => {
            const rows = [];
            let before;
            while (true) {
                const page = this.store.listByBot(this.botId, { limit: MEMORY_LIST_MAX_LIMIT, before });
                rows.push(...page);
                const last = page.at(-1);
                if (page.length < MEMORY_LIST_MAX_LIMIT || !last)
                    break;
                before = { id: last.id, pinned: last.pinned, updatedAt: last.updatedAt };
            }
            check(rows);
            const results = [];
            for (const input of fields)
                results.push(await this.store.saveUnique({ ...input, botId: this.botId, source: { by: 'user', at: Date.now() } }));
            return results;
        });
    }
    /** Cursor reads for management UI; model tools keep their narrower contracts. */
    async query(input, signal) {
        const fields = parseInput(memoryListOptionsSchema, { ...input, limit: input.limit ?? this.defaultListLimit });
        return this.run(() => this.store.listByBot(this.botId, fields), signal);
    }
    async update(id, patch, signal) {
        const key = parseInput(memoryIdSchema, id);
        const fields = parseInput(memoryPatchSchema, patch);
        return this.run(() => this.store.update(this.botId, key, fields), signal);
    }
    /** Count every memory in one registry queue slot, without returning its content. */
    async count(signal) {
        return this.run(() => this.store.countByBot(this.botId), signal);
    }
    /** Read all pins plus the latest unpinned records in a single queue slot.
     * Synchronous cursor reads keep every page in the same point-in-time snapshot.
     */
    async snapshot(injectLimit) {
        return this.withSnapshot(injectLimit, async (rows) => rows);
    }
    /** Hold the existing registry write queue while verifying and committing a copy receipt. */
    async withSnapshot(injectLimit, consume) {
        const limit = parseInput(injectLimitSchema, injectLimit);
        return this.run(() => {
            const collect = (pinned, count) => {
                const records = [];
                let before;
                while (records.length < count) {
                    const pageSize = Math.min(MEMORY_LIST_MAX_LIMIT, count - records.length);
                    const page = this.store.listByBot(this.botId, { pinned, limit: pageSize, before });
                    records.push(...page);
                    const last = page.at(-1);
                    if (page.length < pageSize || !last)
                        break;
                    before = { id: last.id, pinned: last.pinned, updatedAt: last.updatedAt };
                }
                return records;
            };
            return consume([...collect(true, Number.POSITIVE_INFINITY), ...collect(false, limit)]);
        });
    }
    run(operation, signal) {
        const epoch = this.store.captureEpoch?.();
        return this.execute(() => {
            // Check after waiting for the registry queue, before touching storage.
            signal?.throwIfAborted();
            if (epoch !== undefined)
                this.store.assertEpoch?.(epoch);
            return operation();
        }).catch(error => {
            if (signal?.aborted && error === signal.reason)
                throw error;
            throw failure(error);
        });
    }
}
//# sourceMappingURL=service.js.map
export const DSH_BOT_MODULE_VERSION = '0.6.3';
