import { randomUUID } from 'node:crypto';
import { isDeepStrictEqual } from 'node:util';
import { flowBindingSchema } from '../../shared/data-flow.js';
/** Host objects, never accepted via Remote/model JSON. Restart discards unused permissions. */
export class OnceGrants {
    kernel;
    ttlMs;
    clock;
    stopped = false;
    grants = new Map();
    constructor(kernel, ttlMs = 300000, clock = Date.now) {
        this.kernel = kernel;
        this.ttlMs = ttlMs;
        this.clock = clock;
    }
    issue(binding, content) {
        if (this.stopped)
            throw new Error('Grant owner closed');
        const grant = Object.freeze({ id: randomUUID() });
        this.grants.set(grant, { binding: structuredClone(flowBindingSchema.parse(binding)), content,
            expires: this.clock() + this.ttlMs });
        return grant;
    }
    check(grant, binding, content, admitted) {
        const row = this.grants.get(grant);
        if (this.stopped || !row || this.clock() >= row.expires || row.content !== content || !isDeepStrictEqual(row.binding, binding) ||
            row.admitted !== admitted || (this.kernel.snapshot.grantUses.has(grant.id) && !admitted))
            throw new Error('Grant invalid or consumed');
    }
    admitted(grant, opId) {
        const row = this.grants.get(grant);
        if (this.stopped || !row || !this.kernel.snapshot.grantUses.has(grant.id))
            throw new Error('Grant admission was not committed');
        row.admitted = opId;
    }
    close() { this.stopped = true; this.grants.clear(); }
}
//# sourceMappingURL=grants.js.map
export const DSH_BOT_MODULE_VERSION = '0.6.3';
