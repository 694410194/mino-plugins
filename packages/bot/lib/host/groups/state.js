import { groupKeySchema, groupRecordSchema, groupTurnSchema, groupDeliverySchema, } from '../../shared/groups.js';
import { OperationError, Serial, need, parse } from '../common/operations.js';
/** Shared per-service state: one queue and one set of ownership/cancellation maps. */
export class GroupState {
    ctx;
    registry;
    domain;
    changed;
    queue = new Serial();
    workers = new Map();
    offWorkers;
    stopped = false;
    shutdownPhase = 'running';
    closing;
    roots = new Map();
    reasons = new Map();
    scheduling = new Map();
    chains = new Map();
    controllers = new Map();
    activations = new Map();
    settledInputs = new Set();
    inputAdmissions = new Map();
    wakeTurns = new Map();
    cancelledTurns = new Set();
    unregister;
    offTitle;
    repairing = new Set();
    naming = new Set();
    titles = new Map();
    startup = new AbortController();
    constructor(ctx, registry, domain, changed) {
        this.ctx = ctx;
        this.registry = registry;
        this.domain = domain;
        this.changed = changed;
    }
    /** Bounded FIFO admission: any released slot may start the next independent work. */
    schedule(groupId, limit, run) {
        const lane = this.scheduling.get(groupId) ?? { active: 0, pending: [] };
        this.scheduling.set(groupId, lane);
        const pump = () => {
            while (lane.pending.length && lane.active < need(lane.pending[0]).limit) {
                const job = need(lane.pending.shift());
                lane.active++;
                job.start();
            }
            if (!lane.active && !lane.pending.length)
                this.scheduling.delete(groupId);
        };
        const completed = new Promise((resolve, reject) => {
            lane.pending.push({ limit, start: () => {
                    void Promise.resolve().then(run).then(resolve, reject).finally(() => { lane.active--; pump(); });
                } });
        });
        pump();
        return completed;
    }
    table(key) {
        return this.domain.table(key);
    }
    check() {
        if (this.stopped)
            throw new OperationError('unavailable');
    }
    record(key) {
        this.check();
        const k = parse(groupKeySchema, key);
        const g = this.table('groups').get(k.groupId);
        if (!g)
            throw new OperationError('not-found');
        if (g.createdAt !== k.groupCreatedAt)
            throw new OperationError('conflict');
        return g;
    }
    members(g) {
        return [...this.table('members').entries()]
            .map(([, value]) => value)
            .filter((m) => m.group.groupId === g.id && m.group.groupCreatedAt === g.createdAt)
            .sort((a, b) => a.order - b.order);
    }
    deliveries(turn) {
        return [...this.table('deliveries').entries()]
            .map(([, value]) => value)
            .filter((d) => d.turnId === turn)
            .sort((a, b) => a.ordinal - b.ordinal);
    }
    turns(g) {
        return [...this.table('turns').entries()]
            .map(([, value]) => value)
            .filter((t) => t.group.groupId === g.id && t.group.groupCreatedAt === g.createdAt)
            .sort((a, b) => a.createdAt - b.createdAt || a.id.localeCompare(b.id));
    }
    async putGroup(g) {
        await this.table('groups').put(g.id, parse(groupRecordSchema, g));
        this.changed();
    }
    async putTurn(t) {
        const next = { ...t, updatedAt: Date.now(), revision: t.revision + 1 };
        await this.table('turns').put(t.id, parse(groupTurnSchema, next));
        this.changed();
        return next;
    }
    async putDelivery(d) {
        await this.table('deliveries').put(d.id, parse(groupDeliverySchema, d));
        this.changed();
    }
    route() {
        const route = need(this.ctx.get('agentDefaultModel')).currentSelection();
        if (!route.provider || !route.model)
            throw new OperationError('unavailable');
        return route;
    }
    async bot(key) {
        const b = await this.registry.get(key.botId).catch(() => {
            throw new OperationError('conflict');
        });
        if (b.createdAt !== key.botCreatedAt)
            throw new OperationError('conflict');
        this.check();
        return b;
    }
    async validateMembers(keys) {
        if (keys.length > this.registry.config.groupMaxMembers || new Set(keys.map((k) => k.botId)).size !== keys.length)
            throw new OperationError('invalid');
        const statuses = await this.registry.status();
        for (const key of keys) {
            await this.bot(key);
            if (statuses.find((s) => s.id === key.botId)?.preset.state !== 'ok')
                throw new OperationError('unavailable');
        }
    }
}
//# sourceMappingURL=state.js.map
export const DSH_BOT_MODULE_VERSION = '0.6.3';
