var __addDisposableResource = (this && this.__addDisposableResource) || function (env, value, async) {
    if (value !== null && value !== void 0) {
        if (typeof value !== "object" && typeof value !== "function") throw new TypeError("Object expected.");
        var dispose, inner;
        if (async) {
            if (!Symbol.asyncDispose) throw new TypeError("Symbol.asyncDispose is not defined.");
            dispose = value[Symbol.asyncDispose];
        }
        if (dispose === void 0) {
            if (!Symbol.dispose) throw new TypeError("Symbol.dispose is not defined.");
            dispose = value[Symbol.dispose];
            if (async) inner = dispose;
        }
        if (typeof dispose !== "function") throw new TypeError("Object not disposable.");
        if (inner) dispose = function() { try { inner.call(this); } catch (e) { return Promise.reject(e); } };
        env.stack.push({ value: value, dispose: dispose, async: async });
    }
    else if (async) {
        env.stack.push({ async: true });
    }
    return value;
};
var __disposeResources = (this && this.__disposeResources) || (function (SuppressedError) {
    return function (env) {
        function fail(e) {
            env.error = env.hasError ? new SuppressedError(e, env.error, "An error was suppressed during disposal.") : e;
            env.hasError = true;
        }
        var r, s = 0;
        function next() {
            while (r = env.stack.pop()) {
                try {
                    if (!r.async && s === 1) return s = 0, env.stack.push(r), Promise.resolve().then(next);
                    if (r.dispose) {
                        var result = r.dispose.call(r.value);
                        if (r.async) return s |= 2, Promise.resolve(result).then(next, function(e) { fail(e); return next(); });
                    }
                    else s |= 1;
                }
                catch (e) {
                    fail(e);
                }
            }
            if (s === 1) return env.hasError ? Promise.reject(env.error) : Promise.resolve();
            if (env.hasError) throw env.error;
        }
        return next();
    };
})(typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
});
import { followupInput, groupInput } from './data-flow.js';
import { outlets } from '../data-flow/tool-guard.js';
import { SessionId } from '@deepseek-ai/dsh-session';
import { createUserMessage } from '@deepseek-ai/dsh-llm';
import { groupSendSchema } from '../../shared/groups.js';
import { OperationError, digest, need, parse } from '../common/operations.js';
import { groupContext, routeMembers } from './routing.js';
import { blocks, terminal } from './model.js';
export class GroupTurns {
    state;
    roots;
    messages;
    runner;
    constructor(state, roots, messages, runner) {
        this.state = state;
        this.roots = roots;
        this.messages = messages;
        this.runner = runner;
    }
    async send(key, value) {
        const input = parse(groupSendSchema, value);
        return this.state.queue.run(async () => {
            const g = this.state.record(key), id = `turn:${digest([key, input.operationId])}`, hash = digest({ ...input, ...(input.fileReceiptIds.length ? {} : { fileReceiptIds: undefined }) });
            const used = this.state.turns(g).flatMap(t => [
                ...(t.operationId === input.operationId ? [{ requestDigest: t.requestDigest }] : []),
                ...(t.followups ?? []).filter(row => row.operationId === input.operationId),
            ]);
            if (used.some(row => row.requestDigest !== hash))
                throw new OperationError('conflict');
            if (input.followup)
                return this.followup(key, input, hash);
            const old = this.state.table('turns').get(id);
            if (old) {
                if (old.requestDigest !== hash)
                    throw new OperationError('conflict');
                return old;
            }
            if (g.archived || g.state !== 'ready' || this.state.reasons.has(g.id))
                throw new OperationError('recovery-needed');
            if (g.membershipRevision !== input.expectedMembershipRevision)
                throw new OperationError('conflict');
            const root = await this.roots.restore(g);
            const replied = input.replyTo ? this.messages.messages(g).find(m => m.id === input.replyTo) : undefined;
            if (input.replyTo && !replied)
                throw new OperationError('invalid');
            const replyMember = replied?.speaker && this.state.members(g).find(m => m.bot.botId === replied.speaker?.bot.botId && m.bot.botCreatedAt === replied.speaker.bot.botCreatedAt);
            const selected = routeMembers(g, this.state.members(g), input.memberIds.length ? input.memberIds : replyMember ? [replyMember.id] : [], input.round, this.state.registry.config.groupMaxTurns);
            await this.state.validateMembers(selected.map((m) => m.bot));
            const provider = this.state.ctx.subagents.getProvider('spawn');
            if (!provider ||
                provider.inheritsParentContext ||
                !provider.capabilities.agentPreset ||
                !provider.capabilities.agentOptions ||
                !provider.capabilities.depthLimit)
                throw new OperationError('unsupported');
            const receiptIds = [...new Set(input.fileReceiptIds)];
            const uploads = receiptIds.length ? need(this.state.ctx.get('fileUploads')) : undefined;
            const files = receiptIds.map(receiptId => {
                const ref = uploads?.resolve(root.agent, receiptId);
                if (!ref)
                    throw new OperationError('invalid');
                return { type: 'file', attachment: ref };
            });
            // Keep native user attribution: fileUploads retires bound receipts by user rpcId.
            // Extra protocol metadata is public JSON source data for the workspace projection.
            const source = { kind: 'user', group: key, turnId: id,
                ...(input.replyTo ? { replyTo: input.replyTo } : {}), ...(files.length ? { rpcId: id } : {}) };
            const message = createUserMessage({ source, content: [...blocks(input.text), ...files] });
            const at = Date.now();
            const turn = {
                id,
                group: key,
                operationId: input.operationId,
                requestDigest: hash,
                inputMessageId: message.id,
                membershipRevision: g.membershipRevision,
                orderedMemberIds: selected.map((m) => m.id),
                mode: g.mode,
                ...(g.mode !== 'round-robin' ? { protocol: 2, automaticExecutions: 0, continuationAllowance: this.state.registry.config.groupMaxContinuations } : {}),
                ...(g.modelSelection ? { modelSelection: { ...g.modelSelection } } : {}),
                ...(g.memberModelSelections ? { memberModelSelections: g.memberModelSelections.map(row => ({
                        memberId: row.memberId, modelSelection: { ...row.modelSelection },
                    })) } : {}),
                contextThroughSeq: this.messages.messages(g).at(-1)?.seq ?? -1,
                predecessorTurnIds: g.mode !== 'round-robin' ? [] : this.state.turns(g).filter(t => !terminal(t)).map(t => t.id),
                ...(input.replyTo ? { replyTo: input.replyTo } : {}),
                state: 'accepted',
                revision: 1,
                schemaVersion: 1,
                createdAt: at,
                updatedAt: at,
            };
            // Reject an oversized required question before admitting any native or model side effect.
            groupContext(g.name, selected[0]?.bot.botId ?? '', this.state.members(g).map((m) => m.bot.botId), { id: message.id, seq: 0, at, text: input.text, turnId: id, ...(files.length ? { attachments: files } : {}) }, [], [], this.state.registry.config.groupContextMaxBytes);
            const flowId = await groupInput(this.state, g, root.agent, JSON.stringify(message), id);
            const flow = outlets(this.state.registry);
            if (flowId)
                await need(flow).persist(flowId, () => this.state.putTurn(turn));
            else
                await this.state.putTurn(turn);
            try {
                const env_1 = { stack: [], error: void 0, hasError: false };
                try {
                    const statuses = await this.state.registry.status();
                    for (const [ordinal, m] of selected.entries()) {
                        const bot = await this.state.bot(m.bot);
                        const status = need(statuses.find((s) => s.id === bot.id));
                        await this.state.putDelivery({
                            id: `${id}:${ordinal}`,
                            turnId: id,
                            memberId: m.id,
                            ordinal,
                            bot: m.bot,
                            botRevision: bot.updatedAt,
                            presetId: status.presetId,
                            contextOutputMessageIds: [],
                            contextTruncated: false,
                            state: 'pending',
                        });
                    }
                    const receiptBinding = __addDisposableResource(env_1, uploads?.bindPrompt(root.agent, receiptIds, id), false);
                    const send = () => root.agent.session.append('user/message', message, { surfaceOp: 'append' });
                    const event = flowId ? await need(flow).dispatch(flowId, send) : send();
                    receiptBinding?.commit();
                    await this.roots.flush(root);
                    const accepted = await this.state.putTurn({ ...turn, inputSeq: Number(event.seq) });
                    const limit = accepted.protocol === 2 ? Number.MAX_SAFE_INTEGER : 1;
                    const running = this.state.schedule(g.id, limit, async () => {
                        try {
                            await this.runner.execute(id);
                        }
                        catch {
                            await this.state.queue.run(async () => {
                                const t = this.state.table('turns').get(id);
                                if (t && !terminal(t))
                                    await this.state.putTurn({ ...t, state: 'recovery_needed' });
                            });
                        }
                    });
                    this.state.chains.set(id, running);
                    void running.finally(() => this.state.chains.delete(id)).catch(() => { });
                    return accepted;
                }
                catch (e_1) {
                    env_1.error = e_1;
                    env_1.hasError = true;
                }
                finally {
                    __disposeResources(env_1);
                }
            }
            catch {
                await this.state.putTurn({ ...turn, state: 'recovery_needed' });
                throw new OperationError('recovery-needed');
            }
        });
    }
    /** Queue-owned, durable acceptance prevents re-dispatch after an unknown native outcome. */
    async followup(key, input, hash) {
        const g = this.state.record(key), target = need(input.followup);
        const t = this.state.turns(g).find(row => row.id === target.turnId);
        if (!t)
            throw new OperationError('not-found');
        const old = t.followups?.find(row => row.operationId === input.operationId);
        if (old) {
            if (old.requestDigest !== hash)
                throw new OperationError('conflict');
            if (old.state !== 'accepted')
                throw new OperationError('recovery-needed');
            return t;
        }
        if (!input.text || input.fileReceiptIds.length || input.memberIds.length || input.round || input.replyTo)
            throw new OperationError('invalid');
        if (g.membershipRevision !== input.expectedMembershipRevision || t.membershipRevision !== g.membershipRevision)
            throw new OperationError('conflict');
        const d = this.state.deliveries(t.id).find(row => row.id === target.deliveryId);
        const active = d && this.state.activations.get(d.id), controller = d && this.state.controllers.get(d.id);
        const worker = d?.childSessionId && t.protocol === 2 ? this.state.workers.get(d.childSessionId) : undefined;
        const childId = active?.childId ?? (worker?.deliveryId === d?.id && worker?.isActive?.() ? d?.childSessionId : undefined);
        const inputAdmission = d && this.state.inputAdmissions.get(d.id);
        const member = d && this.state.members(g).find(m => m.id === d.memberId && m.enabled && m.removedAt === undefined);
        if (!d || !childId || !controller || !inputAdmission || !member || d.state !== 'running' || d.skipped ||
            this.state.settledInputs.has(d.id) || inputAdmission.signal.aborted || terminal(t) ||
            g.archived || this.state.cancelledTurns.has(t.id) || controller.signal.aborted)
            throw new OperationError('unavailable');
        const admissionSignal = AbortSignal.any([controller.signal, inputAdmission.signal]);
        const assertInputOpen = () => {
            if (admissionSignal.aborted || this.state.stopped || this.state.settledInputs.has(d.id) || (t.protocol === 2 ? this.state.workers.get(childId) !== worker || !worker?.isActive?.() : this.state.activations.get(d.id) !== active))
                throw new OperationError('unavailable');
        };
        await this.state.validateMembers([d.bot]);
        // Validation and native storage can yield while the result settles outside this queue.
        assertInputOpen();
        const root = need(this.state.roots.get(g.id));
        const message = createUserMessage({ source: { kind: 'dsh-bot-group-followup', group: key,
                turnId: t.id, deliveryId: d.id, replyTo: d.triggerMessageId ?? t.inputMessageId }, content: blocks(input.text) });
        const receipt = { operationId: input.operationId, requestDigest: hash, deliveryId: d.id,
            messageId: message.id, state: 'dispatching' };
        const flowId = await groupInput(this.state, g, root.agent, JSON.stringify(message), `followup:${input.operationId}`);
        const flow = outlets(this.state.registry);
        assertInputOpen();
        const persist = () => {
            assertInputOpen();
            return this.state.putTurn({ ...t, followups: [...(t.followups ?? []), receipt] });
        };
        if (flowId)
            await need(flow).persist(flowId, persist);
        else
            await persist();
        try {
            const append = () => root.agent.session.append('user/message', message, { surfaceOp: 'append' });
            assertInputOpen();
            if (flowId)
                await need(flow).dispatch(flowId, append, admissionSignal);
            else
                append();
            await this.roots.flush(root);
            const childMessageId = await followupInput(this.state, g, root.agent, d.bot, childId, input.text, `followup:${input.operationId}`, admissionSignal, () => {
                assertInputOpen();
                return this.state.ctx.subagents.prompt({
                    requestId: input.operationId, parentSessionId: root.agent.session.id,
                    childSessionId: SessionId(childId), mode: 'continuable', delivery: 'steer', content: blocks(input.text),
                }, admissionSignal);
            });
            const current = need(this.state.table('turns').get(t.id));
            return this.state.putTurn({ ...current, followups: current.followups?.map(row => row.operationId === input.operationId
                    ? { ...row, state: 'accepted', childMessageId: childMessageId.messageId } : row) });
        }
        catch {
            const current = need(this.state.table('turns').get(t.id));
            await this.state.putTurn({ ...current, followups: current.followups?.map(row => row.operationId === input.operationId
                    ? { ...row, state: 'unknown' } : row) });
            throw new OperationError('recovery-needed');
        }
    }
    async cancel(key, turnId, revision) {
        return this.state.queue.run(async () => {
            const g = this.state.record(key), t = this.state.turns(g).find((t) => t.id === turnId);
            if (!t)
                throw new OperationError('not-found');
            if (t.revision !== revision)
                throw new OperationError('conflict');
            if (terminal(t) && t.state !== 'paused')
                return t;
            this.state.cancelledTurns.add(t.id);
            this.state.wakeTurns.get(t.id)?.();
            for (const d of this.state.deliveries(t.id)) {
                this.state.controllers.get(d.id)?.abort('user-task-stop');
                if (d.state === 'pending')
                    await this.state.putDelivery({ ...d, state: 'cancelled' });
            }
            const active = this.state.deliveries(t.id).some((d) => ['starting', 'running'].includes(d.state));
            return this.state.putTurn({ ...t, state: active ? t.state : 'cancelled' });
        });
    }
    async continueTurn(key, turnId, revision) {
        return this.state.queue.run(async () => {
            const g = this.state.record(key), t = need(this.state.turns(g).find(row => row.id === turnId));
            if (t.revision !== revision || t.membershipRevision !== g.membershipRevision)
                throw new OperationError('conflict');
            if (t.protocol !== 2 || t.state !== 'paused' || g.archived || this.state.chains.has(t.id))
                throw new OperationError('unavailable');
            if (!this.state.registry.config.groupMaxContinuations)
                throw new OperationError('invalid');
            await this.roots.restore(g);
            const next = await this.state.putTurn({ ...t, state: 'accepted', continuationAllowance: (t.automaticExecutions ?? 0) + this.state.registry.config.groupMaxContinuations });
            const running = this.runner.execute(t.id).catch(() => this.state.queue.run(async () => {
                const current = this.state.table('turns').get(t.id);
                if (current && !terminal(current))
                    await this.state.putTurn({ ...current, state: 'recovery_needed' });
            }));
            this.state.chains.set(t.id, running);
            void running.finally(() => this.state.chains.delete(t.id)).catch(() => { });
            return next;
        });
    }
    async stopMember(key, turnId, memberId, revision) {
        return this.state.queue.run(async () => {
            const g = this.state.record(key), t = need(this.state.turns(g).find(row => row.id === turnId));
            if (t.revision !== revision)
                throw new OperationError('conflict');
            if (t.protocol !== 2 || !['accepted', 'running', 'paused'].includes(t.state) || !this.state.members(g).some(m => m.id === memberId))
                throw new OperationError('invalid');
            const next = await this.state.putTurn({ ...t, stoppedMemberIds: [...new Set([...(t.stoppedMemberIds ?? []), memberId])] });
            for (const d of this.state.deliveries(t.id).filter(d => d.memberId === memberId)) {
                this.state.controllers.get(d.id)?.abort('user-member-stop');
                if (d.state === 'pending')
                    await this.state.putDelivery({ ...d, state: 'cancelled', endedAt: Date.now(), reasonCode: 'user-member-stop' });
            }
            this.state.wakeTurns.get(t.id)?.();
            return next;
        });
    }
    async archive(key, revision) {
        const next = await this.state.queue.run(async () => {
            const g = this.state.record(key);
            if (g.revision !== revision)
                throw new OperationError('conflict');
            const next = { ...g, archived: true, revision: g.revision + 1, updatedAt: Date.now() };
            await this.state.putGroup(next);
            for (const t of this.state.turns(g).filter((t) => !terminal(t) || t.state === 'paused')) {
                this.state.cancelledTurns.add(t.id);
                this.state.wakeTurns.get(t.id)?.();
                for (const d of this.state.deliveries(t.id)) {
                    this.state.controllers.get(d.id)?.abort('user-task-stop');
                    if (d.state === 'pending')
                        await this.state.putDelivery({ ...d, state: 'cancelled', reasonCode: 'user-task-stop', endedAt: Date.now() });
                }
                if (t.state === 'paused') {
                    await this.state.putTurn({ ...t, state: 'cancelled' });
                    this.state.cancelledTurns.delete(t.id);
                }
            }
            return next;
        });
        await Promise.all(this.state.turns(next).map(t => this.state.chains.get(t.id)));
        await this.state.queue.run(async () => {
            const h = this.state.roots.get(next.id);
            if (h) {
                await this.state.ctx.subagents.drainChildren(h.agent, (await this.state.ctx.subagents.listChildren(h.agent.id)).map(child => child.id));
                await this.roots.flush(h);
                await this.roots.release(h);
                this.state.roots.delete(next.id);
            }
        });
        return next;
    }
}
//# sourceMappingURL=turns.js.map
export const DSH_BOT_MODULE_VERSION = '0.6.3';
