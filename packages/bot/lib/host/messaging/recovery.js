import { createUserMessage, } from '@deepseek-ai/dsh-llm';
import { OperationError, } from '../common/operations.js';
import { keyOf } from './store.js';
import { MessagingCore } from './core.js';
export class MessagingRecovery extends MessagingCore {
    kick(id, recovery = false) {
        if (this.stopped)
            return;
        const r = this.store.get(id);
        if (!r)
            return;
        const key = keyOf(r.envelope.to), previous = this.targets.get(key) ?? Promise.resolve();
        const p = previous
            .then(() => this.deliver(id, recovery))
            .catch(async () => {
            if (!this.stopped) {
                const row = this.store.get(id);
                if (row && ['queued', 'delivering'].includes(row.delivery))
                    await this.store
                        .update(id, {
                        delivery: 'unknown',
                        lastErrorCode: 'recovery-needed',
                    })
                        .catch(() => { });
            }
        });
        this.targets.set(key, p);
        this.track(p);
        void p.finally(() => {
            if (this.targets.get(key) === p)
                this.targets.delete(key);
        });
    }
    async wake(agent, r) {
        if (!this.capabilities.coldWake) {
            await this.store.update(r.envelope.id, {
                lastErrorCode: 'pending-recovery-needed',
            });
            return;
        }
        if ([...this.wakes.values()].some((w) => w.sessionId === agent.session.id))
            return;
        const token = createUserMessage({
            source: {
                kind: 'dsh-bot-message-wake',
                form: 'notice',
                summary: 'Resume pending teammate input',
                messageId: r.envelope.id,
                generation: this.generation,
                toSessionId: agent.session.id,
            },
            content: [
                {
                    type: 'text',
                    text: 'Internal pending-input wake control. No business content or authorization.',
                },
            ],
        });
        this.wakes.set(token.id, {
            sessionId: agent.session.id,
            generation: this.generation,
        });
        agent.send(token, 'next-step', true);
        if (!(await this.ctx.sessions.flush(agent.session)))
            throw new OperationError('recovery-needed');
    }
    arm(id, ms) {
        if (this.stopped)
            return;
        const at = this.now() + ms, old = this.timers.get(id);
        if (old && old.at <= at)
            return;
        if (old)
            clearTimeout(old.timer);
        this.timers.set(id, {
            at,
            timer: setTimeout(() => {
                this.timers.delete(id);
                this.kick(id);
            }, Math.min(Math.max(1, ms), 2147483647)),
        });
    }
    async settled() {
        while (this.tasks.size)
            await Promise.allSettled([...this.tasks]);
    }
    lifecycle() {
        return {
            phase: this.stopped ? 'closed' : 'running',
            tasks: this.tasks.size,
            timers: this.timers.size,
            wakes: this.wakes.size,
            targets: this.targets.size,
            ownedAgentHandles: 0,
        };
    }
    close() {
        this.closing ??= (async () => {
            this.stopped = true;
            for (const { timer } of this.timers.values())
                clearTimeout(timer);
            this.timers.clear();
            for (const release of this.releases.splice(0).reverse())
                release();
            await this.admission.close();
            await this.settled();
            this.wakes.clear();
            await this.store.close();
        })();
        return this.closing;
    }
}
//# sourceMappingURL=recovery.js.map
export const DSH_BOT_MODULE_VERSION = '0.6.3';
