import { randomUUID } from 'node:crypto';
import { forgetChoiceSchema, forgetJobSchema } from '../../shared/memory-forget.js';
import { persistProjection } from './projection.js';
export class ForgetRunner {
    kernel;
    previews;
    io;
    tail = Promise.resolve();
    stopped = false;
    choosing = new Set();
    constructor(kernel, previews, io) {
        this.kernel = kernel;
        this.previews = previews;
        this.io = io;
    }
    choose(choice) {
        const task = this.chooseInternal(choice);
        this.choosing.add(task);
        void task.finally(() => this.choosing.delete(task)).catch(() => { });
        return task;
    }
    async chooseInternal(choice) {
        const input = forgetChoiceSchema.parse(choice);
        // Capture only a server preview. Commit revalidates it under the same queue as stream admission.
        const preview = await this.kernel.serial(() => this.previews.validate(input.previewRevision));
        const id = randomUUID();
        await this.kernel.commit({ opId: id, kind: 'forget', subjectIds: preview.targets,
            expectedRevision: preview.revision, forgetEpoch: this.kernel.epoch + 1 }, async () => {
            if (this.stopped)
                throw new Error('Memory cleanup is stopping');
            await this.previews.validate(input.previewRevision);
            await this.save({ id, targets: preview.targets, sessionIds: preview.sessionIds, epoch: this.kernel.epoch + 1,
                revision: preview.revision, choice: input.choice, phase: 'intent', reasons: [], historyVerified: [], copiesVerified: false,
                blockedHeads: await this.io.captureHeads?.(preview), pendingInbox: preview.pendingMessages > 0 });
        });
        this.previews.clear();
        await this.phase(id, 'stopped');
        return input.choice === 'clean' ? this.resume(id) : this.status(id);
    }
    status(id) {
        const job = this.job(id), committed = !!this.kernel.domain.table('ops').get(id);
        const released = this.kernel.domain.table('barriers').get(id)?.state === 'verified';
        return { id, stopped: committed, strong: committed && released && job.phase === 'verified', phase: job.phase,
            reasons: job.reasons, sessions: job.sessionIds.length };
    }
    statuses() { return [...this.kernel.domain.table('forget_jobs').entries()].map(([id]) => this.status(id)); }
    resume(id) {
        const run = this.tail.then(() => this.run(id));
        this.tail = run.catch(() => { });
        return run;
    }
    async recover() {
        for (const [id, job] of this.kernel.domain.table('forget_jobs').entries()) {
            if (job.phase === 'verified') {
                await this.release(job);
                continue;
            }
            if (!this.kernel.domain.table('ops').get(id)) {
                // Intent survived without its op. Complete that exact operation, never discard it or manufacture a new ID.
                await this.kernel.commit({ opId: id, kind: 'forget', subjectIds: job.targets,
                    expectedRevision: job.revision, forgetEpoch: job.epoch });
            }
            if (job.choice === 'clean')
                await this.resume(id);
            else
                await this.phase(id, 'stopped');
        }
    }
    async close() {
        this.stopped = true;
        this.previews.clear();
        await Promise.allSettled([...this.choosing]);
        await this.tail;
    }
    job(id) {
        const job = this.kernel.domain.table('forget_jobs').get(id);
        if (!job)
            throw new Error('Unknown cleanup operation');
        return structuredClone(job);
    }
    save(job) {
        return this.kernel.domain.table('forget_jobs').put(job.id, forgetJobSchema.parse(job));
    }
    async phase(id, phase, reasons = []) {
        await this.kernel.serial(() => this.save({ ...this.job(id), phase, reasons: [...new Set(reasons)] }));
    }
    async run(id) {
        if (this.stopped)
            throw new Error('Memory cleanup is stopping');
        if (this.job(id).phase === 'verified') {
            await this.release(this.job(id));
            return this.status(id);
        }
        if (!this.kernel.domain.table('ops').get(id))
            throw new Error('Forget intent has not committed');
        await this.kernel.serial(() => this.save({ ...this.job(id), phase: 'cleaning', reasons: [],
            historyVerified: [], copiesVerified: false }));
        const reasons = [];
        try {
            await this.io.drain();
            // Remove all obsolete projections/payloads, including every prior revision of the tombstoned logical memory.
            await this.kernel.serial(() => persistProjection(this.kernel.domain, this.kernel.snapshot));
            for (const sessionId of this.job(id).sessionIds) {
                if (this.stopped)
                    throw new Error('Memory cleanup stopped');
                const result = await this.io.history(sessionId, this.job(id));
                reasons.push(...result);
                if (!result.length)
                    await this.kernel.serial(async () => {
                        const job = this.job(id);
                        await this.save({ ...job, historyVerified: [...new Set([...job.historyVerified, sessionId])] });
                    });
            }
            try {
                await this.io.copies();
                await this.kernel.serial(() => this.save({ ...this.job(id), copiesVerified: true }));
            }
            catch {
                reasons.push('copies');
            }
            reasons.push(...await this.io.verifyInventory(this.job(id)));
            if (this.stopped)
                reasons.push('unavailable');
        }
        catch {
            reasons.push('unavailable');
        }
        const job = this.job(id);
        if (job.sessionIds.some(s => !job.historyVerified.includes(s)))
            reasons.push('history');
        if (!job.copiesVerified)
            reasons.push('copies');
        if (job.pendingInbox)
            reasons.push('inbox');
        if (reasons.length) {
            await this.phase(id, 'blocked', reasons);
            return this.status(id);
        }
        await this.kernel.serial(async () => {
            // Receipt first, barrier release last. A crash between them leaves admission closed.
            const receiptId = randomUUID();
            await this.kernel.domain.table('receipts').put(receiptId, {
                id: receiptId, epoch: job.epoch, sessionId: '', versionIds: [], state: 'verified',
            });
            await this.save({ ...this.job(id), phase: 'verified', reasons: [], verificationReceipt: receiptId });
            const barrier = this.kernel.domain.table('barriers').get(id);
            if (!barrier)
                throw new Error('Missing forget barrier');
            await this.kernel.domain.table('barriers').put(id, { ...barrier, state: 'verified', receipts: [receiptId] });
        });
        return this.status(id);
    }
    async release(job) {
        await this.kernel.serial(async () => {
            const receipt = job.verificationReceipt ? this.kernel.domain.table('receipts').get(job.verificationReceipt) : undefined;
            const barrier = this.kernel.domain.table('barriers').get(job.id);
            if (receipt?.state !== 'verified' || receipt.epoch !== job.epoch || !barrier)
                throw new Error('Cleanup verification receipt missing');
            if (barrier.state !== 'verified')
                await this.kernel.domain.table('barriers').put(job.id, {
                    ...barrier, state: 'verified', receipts: [receipt.id],
                });
        });
    }
}
//# sourceMappingURL=forget-runner.js.map
export const DSH_BOT_MODULE_VERSION = '0.6.3';
