import { randomUUID } from 'node:crypto';
import { defineDomain, domainTable } from '@deepseek-ai/dsh-storage-domain';
import { z } from 'zod';
import { automationIdSchema, automationTimeSchema, revisionSchema, isTerminalRun, runListSchema, runRecordSchema, runRequestSchema, } from '../../shared/automation.js';
import { AutomationError, parse, unavailable } from './errors.js';
/** New manual executions only; historical delegate rows remain readable. */
export const executionDomain = defineDomain({
    name: 'dsh_bot_executions',
    version: 1,
    tables: { runs: domainTable(runRecordSchema) },
});
const copy = (value) => structuredClone(value);
const cmp = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
const missing = () => new AutomationError('automation/not-found', 'Execution not found');
const conflict = () => new AutomationError('automation/conflict', 'Execution identity or revision changed');
const stamp = (s, previous = 0) => parse(automationTimeSchema, Math.max(s.now(), previous));
function read(operation) {
    return copy(operation());
}
function write(s, operation) {
    if (s.closing)
        return Promise.reject(new AutomationError('automation/unavailable', 'Executions are closing'));
    const pending = s.tail.then(operation);
    s.tail = pending.catch(() => { });
    return pending
        .then((value) => {
        for (const listener of s.listeners)
            listener();
        return copy(value);
    })
        .catch((error) => {
        throw unavailable(error);
    });
}
async function putRun(s, record) {
    const valid = runRecordSchema.parse(JSON.parse(JSON.stringify(record)));
    await s.domain.table('runs').put(valid.id, valid);
    return valid;
}
const allRuns = (s) => [...s.domain.table('runs').entries()].map(([, r]) => r);
function run(s, id) {
    const row = s.domain.table('runs').get(id);
    if (!row)
        throw missing();
    return row;
}
async function bot(s, id, expected) {
    const value = await s.options.resolveBot(id);
    if (value.bot.id !== id || (expected !== undefined && value.bot.createdAt !== expected))
        throw conflict();
    return value;
}
export function runDedupeKey(request) {
    return JSON.stringify(['manual', request.nativeScheduleId, request.operationId]);
}
const transitions = {
    queued: ['cancelled', 'skipped'],
    running: ['delivered', 'waiting_approval', 'succeeded', 'failed', 'cancelled', 'timed_out', 'recovery_needed'],
    waiting_approval: ['running', 'succeeded', 'failed', 'cancelled', 'timed_out', 'recovery_needed'],
    recovery_needed: ['succeeded', 'failed', 'cancelled', 'timed_out'],
    delivered: [],
    succeeded: [],
    failed: [],
    cancelled: [],
    timed_out: [],
    skipped: [],
};
export const runProgressSchema = z
    .strictObject({
    step: runRecordSchema.shape.step.optional(),
    startedAt: automationTimeSchema.optional(),
    sessionId: runRecordSchema.shape.sessionId.optional(),
    snapshot: runRecordSchema.shape.snapshot.optional(),
    workspaceId: runRecordSchema.shape.workspaceId,
    cwd: runRecordSchema.shape.cwd,
    inputMessageId: runRecordSchema.shape.inputMessageId,
    inputTurn: runRecordSchema.shape.inputTurn,
    lastEventSeq: runRecordSchema.shape.lastEventSeq,
    execution: runRecordSchema.shape.execution,
    summary: runRecordSchema.shape.summary,
    errorCode: runRecordSchema.shape.errorCode,
    skipReason: runRecordSchema.shape.skipReason,
})
    .refine((v) => Object.values(v).every((x) => x !== undefined), 'Undefined progress field');
export class RunService {
    s;
    constructor(s) {
        this.s = s;
    }
    forSession(id) {
        return read(() => allRuns(this.s).find((r) => r.sessionId === id));
    }
    get(id) {
        return read(() => run(this.s, parse(automationIdSchema, id)));
    }
    list(options = {}) {
        const f = parse(runListSchema, options);
        return read(() => allRuns(this.s)
            .filter((r) => (!f.botId || r.botId === f.botId) &&
            (!f.nativeScheduleId || r.nativeScheduleId === f.nativeScheduleId) &&
            (!f.before ||
                r.requestedAt < f.before.requestedAt ||
                (r.requestedAt === f.before.requestedAt && r.id > f.before.id)))
            .sort((a, b) => b.requestedAt - a.requestedAt || cmp(a.id, b.id))
            .slice(0, f.limit));
    }
    async enqueue(input) {
        const fields = parse(runRequestSchema, input);
        return write(this.s, async () => {
            const key = runDedupeKey(fields);
            const prior = allRuns(this.s).find((r) => r.dedupeKey === key);
            if (prior) {
                if (prior.botId !== fields.botId ||
                    prior.snapshot.prompt !== fields.prompt ||
                    prior.snapshot.title !== fields.title ||
                    prior.botCreatedAt !== fields.botCreatedAt)
                    throw conflict();
                return prior;
            }
            const { bot: target, presetId } = await bot(this.s, fields.botId, fields.botCreatedAt);
            const now = stamp(this.s);
            return putRun(this.s, runRecordSchema.parse({
                id: randomUUID(),
                schemaVersion: 1,
                revision: 1,
                dedupeKey: key,
                trigger: fields.trigger,
                operationId: fields.operationId,
                nativeScheduleId: fields.nativeScheduleId,
                botId: target.id,
                botCreatedAt: target.createdAt,
                snapshot: {
                    title: fields.title,
                    prompt: fields.prompt,
                    timeZone: fields.timeZone,
                    presetId,
                    botUpdatedAt: target.updatedAt,
                },
                requestedAt: now,
                updatedAt: now,
                status: 'queued',
                step: 'queued',
                decision: 'run',
                sessionId: `session-${randomUUID()}`,
                requestId: randomUUID(),
                slotHeld: false,
                depth: 0,
            }));
        });
    }
    async reserve(id) {
        const key = parse(automationIdSchema, id);
        return write(this.s, async () => {
            const current = run(this.s, key);
            if (current.status !== 'queued' || current.trigger !== 'manual')
                return current;
            const now = stamp(this.s, current.updatedAt);
            try {
                await bot(this.s, current.botId, current.botCreatedAt);
            }
            catch {
                return putRun(this.s, {
                    ...current,
                    status: 'cancelled',
                    step: 'settled',
                    endedAt: now,
                    updatedAt: now,
                    revision: current.revision + 1,
                    errorCode: 'execution/identity-unavailable',
                });
            }
            return putRun(this.s, {
                ...current,
                status: 'running',
                step: 'reserved',
                slotHeld: true,
                admittedAt: now,
                revision: current.revision + 1,
                updatedAt: now,
            });
        });
    }
    /** Internal executor boundary. Terminal transitions require confirmed chain termination. */
    async transition(id, status, expectedRevision, progress = {}, confirmedStopped = false) {
        const key = parse(automationIdSchema, id);
        const target = parse(runRecordSchema.shape.status, status);
        const expected = parse(revisionSchema, expectedRevision);
        const fields = parse(runProgressSchema, progress);
        return write(this.s, async () => {
            const current = run(this.s, key);
            if (current.revision !== expected)
                throw conflict();
            // Only admission may bind the destination main session.
            if ((fields.sessionId !== undefined && !['reserved', 'creating'].includes(current.step)) ||
                (fields.snapshot !== undefined && current.step !== 'reserved'))
                throw conflict();
            if ((current.status === target && isTerminalRun(target)) ||
                (current.status !== target && !transitions[current.status].includes(target)))
                throw conflict();
            if (isTerminalRun(target) && current.slotHeld && !confirmedStopped) {
                throw new AutomationError('automation/conflict', 'Execution chain termination is not confirmed');
            }
            const now = stamp(this.s, current.updatedAt);
            return putRun(this.s, {
                ...current,
                ...fields,
                status: target,
                revision: current.revision + 1,
                updatedAt: now,
                ...(isTerminalRun(target) ? { endedAt: now, slotHeld: false, step: 'settled' } : {}),
                ...(target === 'skipped' ? { decision: 'skip' } : {}),
                ...(target === 'recovery_needed' ? { step: 'unknown',
                    lastConfirmedStep: current.lastConfirmedStep ?? current.step } : {}),
            });
        });
    }
}
export async function openAutomationStores(ctx, options) {
    let state;
    let closing;
    const release = ctx.effect(async () => {
        const domain = await ctx.storageDomain.open(executionDomain);
        state = {
            domain,
            options,
            now: options.now ?? Date.now,
            tail: Promise.resolve(),
            closing: false,
            listeners: new Set(),
        };
        try {
            for (const [key, r] of domain.table('runs').entries()) {
                if (key !== r.id)
                    throw new Error('Execution key mismatch');
                // No persisted request is automatically replayed after restart.
                if (r.status === 'queued')
                    await putRun(state, {
                        ...r,
                        status: 'cancelled',
                        step: 'settled',
                        endedAt: stamp(state, r.requestedAt),
                        updatedAt: stamp(state, r.updatedAt),
                        revision: r.revision + 1,
                        errorCode: 'restart/not-started',
                    });
                else if (r.slotHeld && r.status !== 'recovery_needed')
                    await putRun(state, {
                        ...r,
                        status: 'recovery_needed',
                        step: 'unknown',
                        lastConfirmedStep: r.lastConfirmedStep ?? r.step,
                        updatedAt: stamp(state, r.updatedAt),
                        revision: r.revision + 1,
                        errorCode: 'restart/unconfirmed',
                    });
            }
        }
        catch (error) {
            await domain.close();
            throw error;
        }
        return () => (closing ??= (async () => {
            await options.beforeClose?.();
            state.closing = true;
            state.listeners.clear();
            await state.tail;
            await domain.close();
        })());
    });
    await release;
    return {
        runs: new RunService(state),
        subscribe: (listener) => {
            state.listeners.add(listener);
            return () => {
                state.listeners.delete(listener);
            };
        },
        close: async () => {
            await release();
            await closing;
        },
    };
}
//# sourceMappingURL=store.js.map
export const DSH_BOT_MODULE_VERSION = '0.6.3';
