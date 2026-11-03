import { defaultRetrievalConfig } from './retrieval-config.js';
import { randomUUID } from 'node:crypto';
import { isDeepStrictEqual } from 'node:util';
import { metaSchema, opSchema } from '../../shared/memory-ops.js';
import { payloadSchema } from '../../shared/memory-v2.js';
import { applyOp, emptyProjection, rebuild, persistProjection } from './projection.js';
const jsonValue = (value) => JSON.parse(JSON.stringify(value));
/** One queue for durable memory admission, commits and barriers. Not a cross-process lock. */
export class MemoryKernel {
    domain;
    assertOwner;
    retrievalConfig;
    tail = Promise.resolve();
    state = emptyProjection();
    frozen = true;
    stopped = false;
    cacheFailures = 0;
    listeners = new Set();
    constructor(domain, assertOwner, retrievalConfig = defaultRetrievalConfig) {
        this.domain = domain;
        this.assertOwner = assertOwner;
        this.retrievalConfig = retrievalConfig;
    }
    async recover(timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone) {
        await this.serial(async () => {
            this.assertOwner();
            if (!this.domain.table('meta').get('scope')) {
                if (this.domain.table('ops').size || this.domain.table('migration').size)
                    throw new Error('Missing durable memory UserScope');
                await this.domain.table('meta').put('scope', metaSchema.parse({
                    scope: { id: randomUUID(), createdAt: Date.now() }, policyRevision: 1, quotaTimeZone: timeZone,
                }));
            }
            this.state = rebuild(this.domain);
            // Forget intent is authority even when the barrier cache write was interrupted.
            for (const [, op] of this.domain.table('ops').entries())
                if (op.kind === 'forget' && !this.domain.table('barriers').get(op.opId)) {
                    await this.domain.table('barriers').put(op.opId, { id: op.opId, epoch: op.forgetEpoch, targets: op.subjectIds,
                        affectedSessionIds: [], state: 'blocked', scope: 'private', previewRevision: op.seq - 1, receipts: [] });
                }
            await persistProjection(this.domain, this.state);
            this.frozen = false;
        });
    }
    get snapshot() { this.assertReadable(); return this.state; }
    get scope() {
        const meta = this.domain.table('meta').get('scope');
        if (!meta)
            throw new Error('Memory scope is not ready');
        return meta;
    }
    get epoch() { return this.state.epoch; }
    get seq() { return this.state.seq; }
    get blocked() {
        return this.frozen || this.stopped || [...this.domain.table('barriers').entries()].some(([, b]) => b.state !== 'verified') ||
            [...this.domain.table('forget_jobs').entries()].some(([, job]) => job.phase !== 'verified');
    }
    assertReadable() {
        if (this.frozen || this.stopped)
            throw new Error('Memory unavailable: reconciliation required');
    }
    assertOwnership() { this.assertOwner(); }
    serial(operation) {
        const result = this.tail.then(operation);
        this.tail = result.catch(() => { });
        return result;
    }
    get policyRevision() { return this.state.autoPolicy?.revision ?? this.scope.policyRevision; }
    transact(build) { return this.serial(() => this.commitNow(build())); }
    async commit(input, beforeCommit) {
        return this.serial(() => this.commitNow(input, beforeCommit));
    }
    async commitNow(input, beforeCommit) {
        this.assertReadable();
        this.assertOwner();
        const payloads = Object.fromEntries(Object.entries(input.payloads ?? {}).map(([id, p]) => [id, jsonValue(payloadSchema.parse(p))]));
        const old = this.domain.table('ops').get(input.opId);
        const { payloads: _payloads, ...header } = input;
        const op = jsonValue(opSchema.parse({ ...header, seq: old?.seq ?? this.state.seq + 1,
            versions: input.versions ?? [], payloadRefs: Object.keys(payloads), receiptRefs: [] }));
        if (old) {
            if (!isDeepStrictEqual(old, op) || Object.entries(payloads).some(([id, p]) => !isDeepStrictEqual(this.domain.table('payloads').get(id), p)))
                throw new Error('Memory opId reused with different or erased parameters');
            return structuredClone(old);
        }
        const disabling = op.kind === 'policy' && op.autoPolicy?.enabled === false;
        if (this.blocked && !disabling && !['forget', 'cleanup', 'retire_shard'].includes(op.kind))
            throw new Error('Memory cleanup pending; writes blocked');
        if (input.forgetEpoch !== this.state.epoch + Number(input.kind === 'forget'))
            throw new Error('Stale memory epoch');
        if (input.expectedRevision !== this.state.seq)
            throw new Error('Memory revision conflict');
        await beforeCommit?.();
        if (!Number.isSafeInteger(op.seq))
            throw new Error('Memory sequence exhausted');
        if (op.versions.some(v => v.userScope !== this.scope.scope.id || !op.subjectIds.includes(v.memoryId) ||
            (!payloads[v.contentRef] && !this.domain.table('payloads').get(v.contentRef))))
            throw new Error('Invalid memory version references');
        const next = applyOp(this.state, op);
        for (const [id, payload] of Object.entries(payloads)) {
            const previous = this.domain.table('payloads').get(id);
            if (previous && !isDeepStrictEqual(previous, payload))
                throw new Error('Payload identity conflict');
            await this.domain.table('payloads').put(id, payload);
        }
        // Install the in-memory barrier before waiting on the authoritative forget commit.
        if (op.kind === 'forget') {
            this.frozen = true;
            this.publish();
            if (!this.domain.table('forget_jobs').get(op.opId)) {
                const sessionIds = [...new Set([...this.domain.table('receipts').entries()]
                        .filter(([, r]) => r.state === 'read').map(([, r]) => r.sessionId))];
                await this.domain.table('forget_jobs').put(op.opId, { id: op.opId, targets: op.subjectIds,
                    sessionIds, epoch: op.forgetEpoch, revision: op.expectedRevision, choice: 'stop', phase: 'intent',
                    reasons: [], historyVerified: [], copiesVerified: false });
            }
        }
        try {
            this.assertOwner();
            await this.domain.table('ops').put(op.opId, op);
        }
        catch (cause) {
            this.frozen = true;
            this.publish();
            throw new Error('Memory commit outcome unknown; reopen and reconcile this opId', { cause });
        }
        this.state = next;
        if (op.kind === 'forget') {
            try {
                await this.domain.table('barriers').put(op.opId, { id: op.opId, epoch: op.forgetEpoch, targets: op.subjectIds,
                    affectedSessionIds: [], state: 'blocked', scope: 'private', previewRevision: op.expectedRevision, receipts: [] });
                this.frozen = false;
            }
            catch (cause) {
                this.publish();
                throw new Error('Forget committed; barrier recovery required', { cause });
            }
        }
        this.publish();
        try {
            // A disposable watermark is useful only at recovery/erasure, never on the ordinary commit path.
            if (op.kind === 'forget')
                await persistProjection(this.domain, next);
        }
        catch {
            this.cacheFailures++;
        }
        return structuredClone(op);
    }
    publish() { for (const listener of this.listeners)
        listener(); }
    async close() { this.stopped = true; this.publish(); await this.tail; await this.domain.close(); }
}
//# sourceMappingURL=op-log.js.map
export const DSH_BOT_MODULE_VERSION = '0.6.3';
