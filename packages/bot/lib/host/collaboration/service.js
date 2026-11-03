import { defineDomain, domainTable } from '@deepseek-ai/dsh-storage-domain';
import { teamLinkSchema, teamBoardSchema, teamTaskInputSchema, teamUpdateSchema, } from '../../shared/collaboration.js';
import { botKeySchema } from '../../shared/integrations.js';
import { getBotBinding } from '../bot-context.js';
import { OperationError, Serial, digest, need, parse } from '../common/operations.js';
export const collaborationDomain = defineDomain({
    name: 'dsh_bot_collaboration',
    version: 1,
    tables: { team_links: domainTable(teamLinkSchema) },
});
/** Native Session is authoritative for roster/tasks. This sidecar only links identities. */
export class Collaboration {
    ctx;
    registry;
    domain;
    changed;
    queue = new Serial();
    stopped = false;
    closing;
    operations = new Set();
    constructor(ctx, registry, domain, changed) {
        this.ctx = ctx;
        this.registry = registry;
        this.domain = domain;
        this.changed = changed;
    }
    service() {
        if (this.stopped)
            throw new OperationError('unavailable');
        return need(this.ctx.get('agentTeams'));
    }
    async assertBot(key) {
        const bot = await this.registry.get(key.botId);
        if (bot.createdAt !== key.botCreatedAt)
            throw new OperationError('conflict');
        if (this.stopped)
            throw new OperationError('unavailable');
    }
    id(key) {
        return `team:${digest(key)}`;
    }
    link(key) {
        return this.domain.table('team_links').get(this.id(key));
    }
    async live(key, link) {
        await this.assertBot(key);
        const main = await need(this.registry.mainSessions).find(key.botId);
        if (main?.sessionId !== link.leadSessionId)
            throw new OperationError('recovery-needed');
        const result = await this.ctx.sessionController.resolveAgent(link.leadSessionId);
        if ('error' in result)
            throw new OperationError('unavailable');
        const agent = result.agent;
        const binding = getBotBinding(agent);
        if (this.ctx.agents.get(agent.id) !== agent ||
            agent.session.header.parentSession ||
            agent.session.header.origin === 'subagent' ||
            binding?.botId !== key.botId ||
            binding.botCreatedAt !== key.botCreatedAt)
            throw new OperationError('conflict');
        await this.assertBot(key);
        const membership = this.service().membership(agent);
        if (membership.role !== 'lead' || membership.root !== agent || membership.id !== link.nativeTeamId)
            throw new OperationError('conflict');
        return agent;
    }
    async operation(work) {
        if (this.stopped)
            throw new OperationError('unavailable');
        const task = work();
        this.operations.add(task);
        try {
            return await task;
        }
        catch (error) {
            if (error instanceof OperationError)
                throw error;
            const code = error && typeof error === 'object' && 'code' in error ? error.code : '';
            if (code === 'TEAM_TASK_STALE_REVISION' || code === 'TEAM_TASK_ALREADY_CLAIMED')
                throw new OperationError('conflict');
            if (code === 'TEAM_TASK_NOT_FOUND' || code === 'bot/not-found')
                throw new OperationError('not-found');
            if (code === 'TEAM_TASK_BLOCKED' || code === 'TEAM_TASK_INVALID_TRANSITION' || code === 'TEAM_INVALID_ARGUMENT')
                throw new OperationError('invalid');
            throw new OperationError('unavailable');
        }
        finally {
            this.operations.delete(task);
        }
    }
    board(input) {
        return this.operation(async () => {
            const key = parse(botKeySchema, input);
            await this.assertBot(key);
            if (!this.ctx.get('agentTeams'))
                return { supported: false, reason: 'native-service-missing', members: [], tasks: [] };
            const link = this.link(key);
            if (!link)
                return { supported: true, reason: 'not-linked', members: [], tasks: [] };
            const agent = await this.live(key, link), native = this.service();
            return parse(teamBoardSchema, {
                supported: true,
                link,
                members: native.listMembers(agent).map((m) => ({
                    id: m.id,
                    name: m.name,
                    role: m.role,
                    status: m.status,
                    ...(m.description ? { description: m.description } : {}),
                })),
                tasks: native.listTasks(agent),
            });
        });
    }
    ensure(input, expectedRevision) {
        return this.operation(() => this.queue.run(async () => {
            const key = parse(botKeySchema, input);
            this.service();
            await this.assertBot(key);
            if (!Number.isSafeInteger(expectedRevision) || expectedRevision < 0)
                throw new OperationError('invalid');
            const previous = this.link(key);
            if ((previous?.revision ?? 0) !== expectedRevision)
                throw new OperationError('conflict');
            if (previous) {
                await this.live(key, previous);
                return structuredClone(previous);
            }
            const main = await this.registry.openConversation(key.botId);
            await this.assertBot(key);
            const agent = need(this.ctx.agents.get(main.sessionId));
            const native = this.service().membership(agent);
            const binding = getBotBinding(agent);
            if (native.role !== 'lead' ||
                native.root !== agent ||
                agent.session.header.parentSession ||
                binding?.botId !== key.botId ||
                binding.botCreatedAt !== key.botCreatedAt)
                throw new OperationError('conflict');
            const at = Date.now();
            const row = parse(teamLinkSchema, {
                id: this.id(key),
                bot: key,
                leadSessionId: main.sessionId,
                nativeTeamId: native.id,
                enabled: true,
                revision: 1,
                createdAt: at,
                updatedAt: at,
                schemaVersion: 1,
            });
            await this.domain.table('team_links').put(row.id, row);
            this.changed();
            return row;
        }));
    }
    createTask(input, raw) {
        return this.operation(async () => {
            const key = parse(botKeySchema, input), task = parse(teamTaskInputSchema, raw), link = need(this.link(key));
            const agent = await this.live(key, link);
            const result = await this.service().createTask(agent, { ...task, blockedBy: task.blockedBy });
            if (!(await this.ctx.sessions.flush(agent.session)))
                throw new OperationError('recovery-needed');
            this.changed();
            return result;
        });
    }
    updateTask(input, raw) {
        return this.operation(async () => {
            const key = parse(botKeySchema, input), update = parse(teamUpdateSchema, raw), link = need(this.link(key));
            const agent = await this.live(key, link);
            // Client cannot select an arbitrary claimant or Agent. Native CAS/ownership remains authoritative.
            const result = await this.service().updateTask(agent, { ...update, taskId: update.taskId });
            if (!(await this.ctx.sessions.flush(agent.session)))
                throw new OperationError('recovery-needed');
            this.changed();
            return result;
        });
    }
    close() {
        this.closing ??= (async () => {
            this.stopped = true;
            await Promise.allSettled([...this.operations]);
            await this.queue.close();
            await this.domain.close();
        })();
        return this.closing;
    }
}
//# sourceMappingURL=service.js.map
export const DSH_BOT_MODULE_VERSION = '0.6.3';
