import { randomUUID } from 'node:crypto';
import { SessionId } from '@deepseek-ai/dsh-session';
import { defineDomain, domainTable } from '@deepseek-ai/dsh-storage-domain';
import { z } from 'zod';
import { DshBotError } from './errors.js';
import { getBotBinding } from './bot-context.js';
const bindingSchema = z.strictObject({ botId: z.string(), botCreatedAt: z.number(), sessionId: z.string() });
export const mainSessionDomain = defineDomain({
    name: 'dsh_bot_main_session',
    version: 1,
    tables: { bindings: domainTable(bindingSchema) },
});
const keyOf = (bot) => JSON.stringify([bot.id, bot.createdAt]);
/** Only metadata/projections choose a main session. No history inspection, deletion or replay. */
export class MainSessions {
    ctx;
    bots;
    domain;
    tail = Promise.resolve();
    stopped = false;
    closing;
    pinned = new Map();
    naming = new Set();
    off;
    repairs = new Set();
    /** Host-only immutable IDs, including retired Bot generations. No resolve or title writes during forget CAS. */
    boundSessionIds() {
        return this.domain ? [...this.domain.table('bindings').entries()].map(([, row]) => row.sessionId) : [];
    }
    /** Exact persisted pointer for explicit recovery CAS, including an unavailable former main. */
    boundSessionId(botId, botCreatedAt) {
        return this.domain?.table('bindings').get(JSON.stringify([botId, botCreatedAt]))?.sessionId;
    }
    constructor(ctx, bots) {
        this.ctx = ctx;
        this.bots = bots;
    }
    async start() {
        await this.ctx.effect(async () => {
            this.domain = await this.ctx.storageDomain.open(mainSessionDomain);
            return () => this.close();
        }, 'dsh-bot: main session store');
        this.off = this.ctx.effect(() => this.ctx.on('session/event', (session, event) => {
            const pin = this.pinned.get(session.id);
            if (event.type !== 'session/title' ||
                this.naming.has(session.id) ||
                !pin ||
                event.data.title === pin.title ||
                this.repairs.has(session.id))
                return;
            // Coalesce a burst; rename emits the desired title and cannot loop.
            this.repairs.add(session.id);
            queueMicrotask(() => {
                if (this.stopped)
                    return;
                this.pinned.delete(session.id);
                void this.find(pin.botId)
                    .catch(() => this.ctx.logger.warn('[dsh-bot] main title repair unavailable'))
                    .finally(() => this.repairs.delete(session.id));
            });
        }), 'dsh-bot: main title invariant');
    }
    serialize(work) {
        if (this.stopped)
            return Promise.reject(new DshBotError('bot/unavailable', 'Main sessions are closing'));
        const task = this.tail.then(work);
        this.tail = task.catch(() => { });
        return task;
    }
    async header(id) {
        const live = this.ctx.sessions.get(id)?.header;
        if (live)
            return live;
        const persistence = this.ctx.get('sessionPersistence');
        if (!persistence)
            throw new DshBotError('bot/unavailable', 'Session metadata is unavailable');
        return (await persistence.stat(id))?.header;
    }
    async eligible(id, bot) {
        const meta = await this.header(id);
        if (!meta ||
            meta.createdAt < bot.createdAt ||
            meta.parentSession ||
            meta.origin === 'subagent' ||
            meta.isSeeded ||
            (meta.delegationDepth ?? 0) > 0)
            return false;
        const live = this.ctx.agents.get(id);
        if (live) {
            const binding = getBotBinding(live);
            return binding?.botId === bot.id && binding.botCreatedAt === bot.createdAt;
        }
        return meta.agentPreset === `${this.bots.config.presetIdPrefix}${bot.id}`;
    }
    async pin(bot, sessionId) {
        if (this.pinned.get(sessionId)?.name === bot.name)
            return;
        this.naming.add(sessionId);
        let result;
        try {
            result = await this.ctx.sessionController.rename({ sessionId: sessionId, title: bot.name });
        }
        catch (error) {
            this.pinned.delete(sessionId);
            throw error;
        }
        finally {
            this.naming.delete(sessionId);
        }
        // Native normalization folds whitespace; use its accepted value for the event guard.
        this.pinned.set(sessionId, { botId: bot.id, name: bot.name, title: result.title });
        const session = this.ctx.sessions.get(sessionId);
        if (!session || !(await this.ctx.sessions.flush(session))) {
            this.pinned.delete(sessionId);
            throw new DshBotError('bot/unavailable', 'Main title flush failed');
        }
    }
    async resolve(botId, create) {
        const bot = await this.bots.get(botId);
        const key = keyOf(bot);
        const table = this.domain.table('bindings');
        const saved = table.get(key);
        let binding = saved;
        if (binding && !(await this.eligible(binding.sessionId, bot))) {
            // Tombstone an invalid mapping without deleting any session.
            this.pinned.delete(binding.sessionId);
            binding = undefined;
        }
        if (!binding) {
            // Migration runs only for an unmapped incarnation. A deleted main must not resurrect hidden legacy history.
            const { items } = saved ? { items: [] } : await this.ctx.sessionController.list({}, new AbortController().signal);
            const candidates = [...items]
                .filter((row) => !row.parentSessionId && row.origin !== 'subagent')
                .sort((a, b) => b.updatedAt - a.updatedAt || a.sessionId.localeCompare(b.sessionId));
            for (const candidate of candidates) {
                const projected = candidate.projections?.values.agentPreset;
                if (projected !== undefined && projected !== `${this.bots.config.presetIdPrefix}${bot.id}`)
                    continue;
                if ([...table.entries()].some(([, row]) => row.botId === bot.id && row.botCreatedAt !== bot.createdAt && row.sessionId === candidate.sessionId))
                    continue;
                if (!(await this.eligible(candidate.sessionId, bot)))
                    continue;
                binding = { botId, botCreatedAt: bot.createdAt, sessionId: candidate.sessionId };
                break;
            }
            if (!binding && create) {
                const presetId = `${this.bots.config.presetIdPrefix}${bot.id}`;
                const preset = (await this.ctx.agentPresets.list()).find((row) => row.id === presetId);
                if (!preset || preset.broken)
                    throw new DshBotError('bot/unavailable', 'Bot preset is unavailable');
                const workspace = await this.bots.ensureBotsWorkspace();
                const created = await this.ctx.sessionController.create({
                    workspaceId: workspace.workspaceId,
                    agentPreset: presetId,
                });
                binding = { botId, botCreatedAt: bot.createdAt, sessionId: created.sessionId };
                const session = this.ctx.sessions.get(created.sessionId);
                if (!session || !(await this.ctx.sessions.flush(session)))
                    throw new DshBotError('bot/unavailable', 'Main header flush failed');
            }
            if (binding)
                await table.put(key, binding);
        }
        if (!binding)
            return undefined;
        // Recheck after async creation/migration. A same-id replacement never inherits it.
        const current = await this.bots.get(botId);
        if (current.createdAt !== bot.createdAt)
            throw new DshBotError('bot/conflict', 'Bot identity changed');
        await this.pin(current, binding.sessionId);
        return { sessionId: binding.sessionId };
    }
    find(botId) {
        return this.serialize(() => this.resolve(botId, false));
    }
    async open(botId) {
        return this.serialize(async () => {
            const result = await this.resolve(botId, true);
            if (!result)
                throw new DshBotError('bot/unavailable', 'Main session unavailable');
            return result;
        });
    }
    /** Explicit user recovery: create a new native conversation without copying or erasing lineage. */
    fresh(botId, expectedBotCreatedAt, expectedSessionId) {
        return this.serialize(async () => {
            const bot = await this.bots.get(botId);
            if (bot.createdAt !== expectedBotCreatedAt)
                throw new DshBotError('bot/conflict', 'Bot identity changed');
            const key = keyOf(bot), table = this.domain.table('bindings');
            const matches = () => (table.get(key)?.sessionId ?? null) === expectedSessionId;
            if (!matches())
                throw new DshBotError('bot/conflict', 'Main conversation changed');
            const presetId = `${this.bots.config.presetIdPrefix}${bot.id}`;
            const preset = (await this.ctx.agentPresets.list()).find(row => row.id === presetId);
            if (!preset || preset.broken)
                throw new DshBotError('bot/unavailable', 'Bot preset is unavailable');
            const workspace = await this.bots.ensureBotsWorkspace();
            const newId = SessionId(randomUUID());
            const created = await this.ctx.sessionController.create({ sessionId: newId, workspaceId: workspace.workspaceId, agentPreset: presetId });
            if (created.sessionId !== newId)
                throw new DshBotError('bot/conflict', 'Native conversation identity changed');
            const session = this.ctx.sessions.get(created.sessionId);
            if (!session || !(await this.ctx.sessions.flush(session)))
                throw new DshBotError('bot/unavailable', 'Fresh main header flush failed');
            const current = await this.bots.get(botId);
            if (current.createdAt !== expectedBotCreatedAt)
                throw new DshBotError('bot/conflict', 'Bot identity changed');
            try {
                const latest = await this.bots.get(botId);
                if (latest.createdAt !== expectedBotCreatedAt || !matches())
                    throw new DshBotError('bot/conflict', 'Main conversation changed');
                // This serialized service is the sole binding writer. Recheck after every native await.
                await table.put(key, { botId, botCreatedAt: expectedBotCreatedAt, sessionId: created.sessionId });
            }
            catch (error) {
                this.pinned.delete(created.sessionId);
                throw error;
            }
            if (expectedSessionId)
                this.pinned.delete(expectedSessionId);
            this.bots.invalidate();
            return { sessionId: created.sessionId };
        });
    }
    close() {
        this.closing ??= (async () => {
            this.stopped = true;
            this.off?.();
            await this.tail;
            this.pinned.clear();
            this.naming.clear();
            this.repairs.clear();
            await this.domain?.close();
        })();
        return this.closing;
    }
}
//# sourceMappingURL=main-session.js.map
export const DSH_BOT_MODULE_VERSION = '0.6.3';
