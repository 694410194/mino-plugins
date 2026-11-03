import { isDeepStrictEqual } from 'node:util';
import { randomUUID } from 'node:crypto';
import { autoSharePolicySchema } from '../../shared/data-flow.js';
import { nextDayBoundary } from './context.js';
import { nativeIngressCapability } from './trusted-ingress.js';
export class AutoShareQuota {
    kernel;
    clock;
    constructor(kernel, clock = Date.now) {
        this.kernel = kernel;
        this.clock = clock;
    }
    get policy() {
        return this.kernel.snapshot.autoPolicy ?? { enabled: true, botDaily: 5, domainDaily: 20,
            timeZone: this.kernel.scope.quotaTimeZone, revision: this.kernel.scope.policyRevision };
    }
    async configureHost(input) {
        const previous = this.kernel.snapshot.autoPolicy?.hostConfig;
        if (isDeepStrictEqual(previous, input))
            return;
        const changed = Object.fromEntries(Object.entries(input).filter(([key, value]) => !previous || previous[key] !== value));
        await this.configure({ ...this.policy, ...changed, hostConfig: input });
    }
    async configure(input, expectedRevision = this.kernel.policyRevision) {
        const policy = autoSharePolicySchema.parse({ ...input, revision: expectedRevision + 1 });
        const old = this.policy;
        if (expectedRevision !== this.kernel.policyRevision)
            throw new Error('Sharing policy conflict');
        const unchanged = Object.entries(input).every(([key, value]) => isDeepStrictEqual(old[key], value));
        if (unchanged && this.kernel.snapshot.autoPolicy)
            return;
        await this.kernel.transact(() => {
            if (expectedRevision !== this.kernel.policyRevision)
                throw new Error('Sharing policy conflict');
            return { opId: randomUUID(), kind: 'policy', subjectIds: [], expectedRevision: this.kernel.seq,
                forgetEpoch: this.kernel.epoch, autoPolicy: policy };
        });
    }
    status() {
        const p = this.policy, charges = [...this.kernel.snapshot.quota.values()];
        const latest = charges.reduce((a, b) => !a || a.at < b.at ? b : a, undefined);
        const now = Math.max(this.clock(), latest?.at ?? 0);
        const domainUsed = latest && now < latest.end ? charges.filter(c => c.bucket === latest.bucket).length : 0;
        return { domainUsed, configured: p.enabled, effectiveAutoShare: false, reason: nativeIngressCapability.reason,
            botDaily: p.botDaily, domainDaily: p.domainDaily, timeZone: p.timeZone, revision: p.revision };
    }
    charge(botId) {
        const charges = [...this.kernel.snapshot.quota.values()], now = this.clock();
        if (!Number.isSafeInteger(now) || now < 0)
            throw new Error('Invalid Host clock');
        const latest = charges.reduce((a, b) => !a || a.at < b.at ? b : a, undefined);
        const at = Math.max(now, latest?.at ?? 0), p = this.policy;
        // A timezone edit takes effect only after the existing bucket ends. Rollback never reopens an old bucket.
        let bucket, end, timeZone;
        if (latest && at < latest.end)
            ({ bucket, end, timeZone } = latest);
        else {
            timeZone = p.timeZone;
            end = nextDayBoundary(at, timeZone);
            // Find the current local day start, including DST. Clamp at the previous bucket boundary on timezone changes.
            const day = new Intl.DateTimeFormat('en-CA', { timeZone, dateStyle: 'short' });
            let low = Math.max(0, at - 36 * 3600000), high = at;
            while (high - low > 1) {
                const middle = Math.floor((low + high) / 2);
                if (day.format(middle) === day.format(at))
                    high = middle;
                else
                    low = middle;
            }
            bucket = Math.max(high, latest?.end ?? 0);
        }
        const sameBucket = charges.filter(c => c.bucket === bucket);
        if (!p.enabled || sameBucket.length >= p.domainDaily || sameBucket.filter(c => c.botId === botId).length >= p.botDaily)
            throw new Error('Automatic sharing disabled or daily quota exhausted');
        return { botId, bucket, end, timeZone, at };
    }
    /** Host-only accounting seam. Caller validates source capability; this method grants no user_stated authority.
     * Used by the future automatic outlet after its capability/checker gates, and synthetic accounting tests now.
     */
    async commit(opId, owner, policyRevision, build) {
        return this.kernel.transact(() => {
            const old = this.kernel.domain.table('ops').get(opId);
            if (old) {
                const { seq: _seq, payloadRefs: _refs, receiptRefs: _receipts, ...command } = old;
                const proposed = build();
                return { ...proposed, owner, quotaCharge: command.quotaCharge };
            }
            if (policyRevision !== this.kernel.policyRevision)
                throw new Error('Automatic sharing policy changed');
            if (this.kernel.snapshot.retired.has(JSON.stringify(owner)))
                throw new Error('Bot shard retired');
            const command = build();
            if (command.opId !== opId || command.kind !== 'accept' || command.versions?.length !== 1 ||
                command.versions[0]?.scope !== 'shared')
                throw new Error('Automatic quota requires one shared accept operation');
            return { ...command, owner, quotaCharge: this.charge(owner.botId) };
        });
    }
}
//# sourceMappingURL=quota.js.map
export const DSH_BOT_MODULE_VERSION = '0.6.3';
