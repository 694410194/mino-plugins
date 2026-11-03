import { installWorkerTools } from './worker-tool.js';
import { GroupState } from './state.js';
import { GroupRoots } from './roots.js';
import { GroupMembers } from './members.js';
import { GroupMessages } from './messages.js';
import { GroupTurnRunner } from './turn-runner.js';
import { GroupTurns } from './turns.js';
export { groupsDomain } from './model.js';
/** Public facade: compose domain modules and own their coordinated shutdown. */
export class Groups {
    state;
    roots;
    membership;
    messages;
    turns;
    constructor(ctx, registry, domain, changed) {
        this.state = new GroupState(ctx, registry, domain, changed);
        this.roots = new GroupRoots(this.state);
        this.membership = new GroupMembers(this.state, this.roots);
        this.messages = new GroupMessages(this.state, this.roots);
        const runner = new GroupTurnRunner(this.state, this.roots, this.messages);
        this.state.offWorkers = installWorkerTools(this.state, runner);
        this.turns = new GroupTurns(this.state, this.roots, this.messages, runner);
    }
    lifecycle() {
        return {
            phase: this.state.shutdownPhase,
            ownedRoots: [...this.state.roots.values()].filter(root => root.ownership === 'owned').length,
            workers: this.state.chains.size,
            activations: this.state.activations.size,
        };
    }
    start(...args) {
        return this.roots.start(...args);
    }
    open(...args) { return this.roots.open(...args); }
    create(...args) {
        return this.membership.create(...args);
    }
    edit(...args) {
        return this.membership.edit(...args);
    }
    setModel(...args) {
        return this.membership.setModel(...args);
    }
    openAttachment(...args) {
        return this.messages.openAttachment(...args);
    }
    markRead(...args) {
        return this.messages.markRead(...args);
    }
    list(...args) {
        return this.messages.list(...args);
    }
    view(...args) {
        return this.messages.view(...args);
    }
    send(...args) {
        return this.turns.send(...args);
    }
    cancel(...args) {
        return this.turns.cancel(...args);
    }
    continueTurn(...args) { return this.turns.continueTurn(...args); }
    stopMember(...args) { return this.turns.stopMember(...args); }
    archive(...args) {
        return this.turns.archive(...args);
    }
    close() {
        this.state.closing ??= (async () => {
            this.state.stopped = true;
            this.state.shutdownPhase = 'draining-workers';
            this.state.startup.abort();
            for (const c of this.state.controllers.values())
                c.abort('host-unloaded');
            for (const wake of this.state.wakeTurns.values())
                wake();
            // Pending workers check stopped before starting. Drain all callers before roots and preset.
            const errors = [];
            const attempt = async (fn) => {
                try {
                    await fn();
                }
                catch (e) {
                    errors.push(e);
                }
            };
            await attempt(() => Promise.all([...this.state.chains.values()]));
            this.state.shutdownPhase = 'draining-queue';
            await attempt(() => this.state.queue.close());
            this.state.offTitle?.();
            this.state.offWorkers?.();
            this.state.workers.clear();
            this.state.shutdownPhase = 'disposing-roots';
            for (const a of this.state.activations.values())
                await attempt(() => a.dispose());
            for (const h of this.state.roots.values()) {
                await attempt(async () => this.state.ctx.subagents.drainChildren(h.agent, (await this.state.ctx.subagents.listChildren(h.agent.id)).map(c => c.id)));
                await attempt(() => this.roots.flush(h));
                await attempt(() => this.roots.release(h));
            }
            this.state.roots.clear();
            this.state.shutdownPhase = 'unregistering-preset';
            await attempt(() => this.state.unregister?.());
            this.state.shutdownPhase = 'closing-domain';
            await attempt(() => this.state.domain.close());
            this.state.shutdownPhase = errors.length ? 'failed' : 'closed';
            if (errors.length)
                throw new AggregateError(errors, 'Group shutdown failed');
        })();
        return this.state.closing;
    }
}
//# sourceMappingURL=service.js.map
export const DSH_BOT_MODULE_VERSION = '0.6.3';
