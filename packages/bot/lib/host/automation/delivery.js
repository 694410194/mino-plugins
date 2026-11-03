import { AutomationError } from './errors.js';
/** A durable explicit delivery receipt. DSH owns execution in the shared conversation. */
export class MainSessionDelivery {
    ctx;
    bots;
    runs;
    active = new Map();
    stopped = false;
    constructor(ctx, bots, runs) {
        this.ctx = ctx;
        this.bots = bots;
        this.runs = runs;
    }
    async submit(request) {
        if (this.stopped)
            throw new AutomationError('automation/unavailable', 'Delivery is closing');
        const run = await this.runs.enqueue(request);
        const existing = this.active.get(run.id);
        if (existing)
            return existing;
        if (run.status !== 'queued')
            return run;
        const task = this.deliver(run.id).finally(() => this.active.delete(run.id));
        this.active.set(run.id, task);
        return task;
    }
    async deliver(id) {
        let run = await this.runs.reserve(id);
        if (run.status !== 'running')
            return run;
        let submitted = false;
        try {
            const bot = await this.bots.get(run.botId);
            if (bot.createdAt !== run.botCreatedAt)
                throw new Error('Bot identity changed');
            const main = await this.bots.openConversation(run.botId);
            const current = await this.bots.get(run.botId);
            if (current.createdAt !== run.botCreatedAt)
                throw new Error('Bot identity changed');
            run = await this.runs.transition(id, 'running', run.revision, { sessionId: main.sessionId, step: 'submitting' });
            submitted = true;
            const receipt = await this.ctx.sessionController.prompt({
                sessionId: main.sessionId,
                requestId: run.requestId,
                mode: 'queue',
                content: [{ type: 'text', text: run.snapshot.prompt }],
                clientTimeZone: run.snapshot.timeZone,
            }, new AbortController().signal);
            if (!receipt.accepted)
                throw new Error('Prompt refused');
            // Delivered is explicitly NOT model completion. Never stop a user's shared session on unload/error.
            return await this.runs.transition(id, 'delivered', run.revision, {}, true);
        }
        catch {
            run = this.runs.get(id);
            return this.runs.transition(id, submitted ? 'recovery_needed' : 'failed', run.revision, { errorCode: submitted ? 'delivery/unconfirmed' : 'delivery/not-submitted' }, !submitted);
        }
    }
    async close() {
        this.stopped = true;
        await Promise.allSettled([...this.active.values()]);
    }
}
//# sourceMappingURL=delivery.js.map
export const DSH_BOT_MODULE_VERSION = '0.6.3';
