import { randomUUID } from 'node:crypto';
import { messageSourceSchema, } from '../../shared/messaging.js';
import { getBotBinding } from '../bot-context.js';
import { OperationError, Serial } from '../common/operations.js';
const unavailableAuthorization = {
    async approve() {
        throw new OperationError('approval-denied');
    },
};
const ambient = new Set(['agent-instructions', 'runtime-context', 'time-context', 'tmux-context']);
export class MessagingCore {
    ctx;
    registry;
    store;
    authorization;
    capabilities;
    now;
    admission = new Serial();
    targets = new Map();
    tasks = new Set();
    timers = new Map();
    wakes = new Map();
    generation = randomUUID();
    releases = [];
    stopped = false;
    closing;
    constructor(ctx, registry, store, authorization = unavailableAuthorization, capabilities = {
        coldWake: false,
        interrupt: false,
    }, now = Date.now) {
        this.ctx = ctx;
        this.registry = registry;
        this.store = store;
        this.authorization = authorization;
        this.capabilities = capabilities;
        this.now = now;
    }
    track(p) {
        this.tasks.add(p);
        void p.finally(() => this.tasks.delete(p)).catch(() => { });
        return p;
    }
    async bot(key) {
        const bot = await this.registry.get(key.botId);
        if (bot.createdAt !== key.botCreatedAt)
            throw new OperationError('conflict');
        return bot;
    }
    async exact(agent) {
        const binding = getBotBinding(agent), h = agent.session.header;
        if (!binding ||
            h.parentSession ||
            h.origin === 'subagent' ||
            (h.delegationDepth ?? 0) > 0 ||
            this.ctx.agents.get(agent.session.id) !== agent)
            throw new OperationError('invalid');
        await this.bot(binding);
        const main = await this.registry.mainSessions?.find(binding.botId);
        if (main?.sessionId !== agent.session.id)
            throw new OperationError('conflict');
        return binding;
    }
    provenance(agent) {
        const events = agent.session.snapshotEvents();
        const turn = events.findLast((e) => e.type === 'turn/start');
        const current = events.filter((e) => e.type === 'user/message' && !ambient.has(e.data.source.kind) && (!turn || e.seq > turn.seq));
        const incoming = current.filter((e) => e.type === 'user/message' && e.data.source.kind === 'dsh-bot-message');
        if (incoming.length > 1)
            throw new OperationError('conflict');
        if (incoming.length) {
            const event = incoming[0];
            if (event?.type !== 'user/message')
                throw new OperationError('invalid');
            const source = messageSourceSchema.parse(event.data.source), record = this.store.get(source.messageId);
            if (!record ||
                record.nativeInput?.id !== event.data.id ||
                record.envelope.toSessionId !== agent.session.id)
                throw new OperationError('invalid');
            return { parent: record };
        }
        const meaningful = current.filter((e) => e.type === 'user/message' && e.data.source.kind !== 'dsh-bot-message-sent');
        if (!meaningful.length ||
            meaningful.some((e) => e.type === 'user/message' && e.data.source.kind !== 'user'))
            throw new OperationError('approval-denied');
        const user = meaningful.findLast((e) => e.type === 'user/message');
        if (user?.type !== 'user/message')
            throw new OperationError('invalid');
        return { userMessageId: user.data.id };
    }
    async resolve(sessionId) {
        const result = await this.ctx.sessionController.resolveAgent(sessionId);
        if ('error' in result)
            throw result.error;
        return result.agent;
    }
    async logs(agent) {
        if (!(await this.ctx.sessions.flush(agent.session)))
            throw new OperationError('recovery-needed');
        const handle = await this.ctx.sessionPersistence.open(agent.session.id, 'read');
        try {
            return (await handle.read()).events;
        }
        finally {
            await handle.close();
        }
    }
}
//# sourceMappingURL=core.js.map
export const DSH_BOT_MODULE_VERSION = '0.6.3';
