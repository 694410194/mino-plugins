import { withGraphCapability } from '../data-flow/graph-capability.js';
import { outlets } from '../data-flow/tool-guard.js';
import { randomUUID } from 'node:crypto';
import { writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { resolveDshHome } from '@deepseek-ai/dsh-home-paths';
import { ToolCallId } from '@deepseek-ai/dsh-llm';
import * as mcp from '@deepseek-ai/dsh-mcp-client';
import { z } from 'zod';
import { GRAPH_NAMESPACE, GRAPH_PREFIX, graphSchema, graphEntitySchema, } from '../../shared/reference-memory.js';
import { hasCredential } from '../../shared/secrets.js';
import { OperationError, Serial, parse } from '../common/operations.js';
import { checkedFile, safeDirectory } from './files.js';
import { keyOf, writers } from './model.js';
export class ReferenceWriter {
    ctx;
    registry;
    domain;
    changed;
    control = new Serial();
    live = new Map();
    reasons = new Map();
    copying = new Map();
    stopping = false;
    closing;
    root;
    executable;
    constructor(ctx, registry, domain, changed) {
        this.ctx = ctx;
        this.registry = registry;
        this.domain = domain;
        this.changed = changed;
        this.root = join(resolveDshHome(), 'dsh-bot', 'memory');
        const require = createRequire(import.meta.url);
        this.executable = resolve(dirname(require.resolve('@modelcontextprotocol/server-memory/package.json')), 'dist/index.js');
    }
    async assertBot(bot) {
        this.registry.memoryAdmission?.assertAllowed();
        if ((await this.registry.get(bot.botId)).createdAt !== bot.botCreatedAt)
            throw new OperationError('conflict');
        this.registry.memoryAdmission?.assertAllowed();
    }
    binding(bot) {
        return this.domain.table('bindings').get(keyOf(bot));
    }
    file(bot, identity) {
        return join(this.root, keyOf(bot), `${identity}.jsonl`);
    }
    async prepare(bot, identity) {
        await safeDirectory(join(resolveDshHome(), 'dsh-bot'));
        await safeDirectory(this.root);
        await safeDirectory(join(this.root, keyOf(bot)));
        const bytes = await checkedFile(this.file(bot, identity), this.registry.config.referenceMemoryMaxFileBytes);
        if (bytes === undefined)
            await writeFile(this.file(bot, identity), '', {
                flag: 'wx',
                mode: 0o600,
            });
        if (bytes !== undefined)
            for (const line of bytes.split('\n').filter(Boolean)) {
                let row;
                try {
                    row = JSON.parse(line);
                }
                catch {
                    throw new OperationError('invalid');
                }
                const entity = graphEntitySchema.extend({ type: z.literal('entity') });
                const relation = graphSchema.shape.relations.element.extend({
                    type: z.literal('relation'),
                });
                if (!entity.safeParse(row).success && !relation.safeParse(row).success)
                    throw new OperationError('invalid');
            }
    }
    async mount(bot, agent, identity, copying) {
        if (this.stopping)
            throw new OperationError('unavailable');
        if (writers.has(join(this.root, keyOf(bot))) || this.live.has(keyOf(bot))) {
            this.reasons.set(keyOf(bot), 'writer-conflict');
            throw new OperationError('conflict');
        }
        try {
            await this.prepare(bot, identity);
        }
        catch {
            this.reasons.set(keyOf(bot), 'invalid-file');
            throw new OperationError('invalid');
        }
        if (agent.ctx.tools.schemas(agent).some((t) => t.name.startsWith(GRAPH_PREFIX)))
            throw new OperationError('conflict');
        const l = {
            bot,
            agent,
            identity,
            accepting: true,
            copying,
            tail: Promise.resolve(),
            allowed: new Set(),
            off: [],
        };
        writers.set(join(this.root, keyOf(bot)), l);
        this.live.set(keyOf(bot), l);
        l.off.push(agent.ctx.tools.guard((exec) => {
            if (!exec.name.startsWith(GRAPH_PREFIX))
                return;
            try {
                this.registry.memoryAdmission?.assertToolAllowed(exec);
            }
            catch {
                return 'Memory cleanup pending';
            }
            if (!l.accepting || this.stopping || exec.agent !== agent || (l.copying && !l.allowed.has(exec.callId)))
                return 'Reference graph writer unavailable';
            try {
                if (this.registry.presetBot(bot.botId).createdAt !== bot.botCreatedAt)
                    return 'Reference graph identity changed';
            }
            catch {
                return 'Reference graph identity changed';
            }
        }));
        l.off.push(agent.ctx.on('tools/execute', (exec, next) => {
            if (!exec.name.startsWith(GRAPH_PREFIX))
                return next();
            const pending = l.tail.then(async () => {
                this.registry.memoryAdmission?.assertToolAllowed(exec);
                if (!l.accepting || this.stopping || exec.agent !== agent || (l.copying && !l.allowed.has(exec.callId)))
                    throw new OperationError('unavailable');
                exec.signal.throwIfAborted();
                if (hasCredential(JSON.stringify(exec.arguments)))
                    throw new OperationError('invalid');
                await this.prepare(bot, identity);
                const result = await next();
                if (result.isError) {
                    l.accepting = false;
                    this.reasons.set(keyOf(bot), 'initialization-failed');
                    this.changed();
                }
                return result;
            });
            l.tail = pending.catch(() => { });
            return pending;
        }, { prepend: true }));
        agent.ctx.effect(() => () => this.closeLive(l), 'dsh-bot: reference graph writer');
        try {
            const file = this.file(bot, identity), executable = this.executable, timeoutMs = this.registry.config.referenceMemoryTimeoutMs;
            const child = agent.ctx.plugin({
                name: 'dsh-bot-reference-memory',
                inject: ['tools'],
                async apply(owner) {
                    await mcp.apply(owner, mcp.Config({
                        transport: 'stdio',
                        serverName: GRAPH_NAMESPACE,
                        command: process.execPath,
                        args: [executable],
                        env: { MEMORY_FILE_PATH: file },
                        cwd: dirname(file),
                        toolCallTimeoutMs: timeoutMs,
                        failOnStartupError: true,
                        reconnect: { enabled: false },
                    }));
                },
            });
            l.child = child;
            let timer;
            try {
                await Promise.race([
                    child.await(),
                    new Promise((_, reject) => {
                        timer = setTimeout(() => reject(new OperationError('unavailable')), timeoutMs);
                    }),
                ]);
            }
            finally {
                if (timer)
                    clearTimeout(timer);
            }
            const names = new Set(agent.ctx.tools.schemas(agent).map((t) => t.name));
            if (['create_entities', 'read_graph', 'open_nodes', 'search_nodes', 'delete_entities'].some((n) => !names.has(GRAPH_PREFIX + n)))
                throw new OperationError('unsupported');
            if (this.stopping || l.closing)
                throw new OperationError('unavailable');
            this.reasons.delete(keyOf(bot));
            return l;
        }
        catch {
            await this.closeLive(l);
            throw new OperationError('unavailable');
        }
    }
    closeLive(l) {
        l.accepting = false;
        l.closing ??= (async () => {
            await l.tail;
            await l.child?.dispose();
            for (const off of l.off.splice(0))
                off();
            if (this.live.get(keyOf(l.bot)) === l)
                this.live.delete(keyOf(l.bot));
            if (writers.get(join(this.root, keyOf(l.bot))) === l)
                writers.delete(join(this.root, keyOf(l.bot)));
            this.changed();
        })();
        return l.closing;
    }
    async stop(bot) {
        const l = this.live.get(keyOf(bot));
        if (l)
            await this.closeLive(l);
    }
    async call(l, tool, args, signal, cleanup = false) {
        if (!cleanup)
            this.registry.memoryAdmission?.assertAllowed();
        if (cleanup && tool !== 'read_graph')
            throw new OperationError('invalid');
        const callId = ToolCallId(randomUUID());
        l.allowed.add(callId);
        try {
            const execute = () => l.agent.ctx.tools.execute({
                name: GRAPH_PREFIX + tool,
                arguments: args,
                agent: l.agent,
                callId,
                signal,
            });
            const managed = () => withGraphCapability(l.agent, callId, execute);
            const flow = outlets(this.registry);
            let result;
            if (cleanup)
                result = await this.registry.memoryAdmission.cleanupRead(l.agent, callId, managed);
            else if (flow && !['read_graph', 'search_nodes', 'open_nodes'].includes(tool)) {
                const envelope = flow.draft('mcp-copy', l.bot, l.agent.session.id, callId, { kind: 'bot', bot: l.bot }, JSON.stringify({ identity: l.identity, tool, args }));
                const id = await flow.admit(envelope, undefined, signal);
                result = await flow.dispatch(id, managed, signal);
            }
            else
                result = await managed();
            if (result.isError)
                throw new OperationError('unavailable');
            const value = parse(z.object({
                content: z.array(z.object({ type: z.string(), text: z.string().optional() })),
            }), result.value);
            const text = value.content
                .filter((b) => b.type === 'text')
                .map((b) => b.text ?? '')
                .join('\n');
            try {
                return JSON.parse(text);
            }
            catch {
                throw new OperationError('invalid');
            }
        }
        finally {
            l.allowed.delete(callId);
        }
    }
    async read(l, signal) {
        return parse(graphSchema, await this.call(l, 'read_graph', {}, signal));
    }
}
//# sourceMappingURL=writer.js.map
export const DSH_BOT_MODULE_VERSION = '0.6.3';
