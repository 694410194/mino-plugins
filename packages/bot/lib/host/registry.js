var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
import { createHash } from 'node:crypto';
import { createForChatSchema } from '../shared/onboarding.js';
import { AutoShareQuota } from './memory/quota.js';
import { autoShareToggleSchema } from '../shared/data-flow.js';
import { migrateMemoryDeny } from '../shared/memory-tool-names.js';
import { MemoryManagement } from './memory/facade.js';
import { retireShard } from './memory/shards.js';
import { isDeepStrictEqual } from 'node:util';
import { Remote } from '@deepseek-ai/dsh-typert-protocol';
import { botIdSchema } from '../shared/ids.js';
import { botChangeSchema, botsWorkspaceSchema, } from '../shared/remote-contract.js';
import { botPatchSchema, botRemoveOptionsSchema, botSchema, normalizeBotPatch, } from '../shared/schema.js';
import { DshBotError, parseInput } from './errors.js';
import { validateDefaultCwd } from './home.js';
import { BotMemoryService } from './memory/service.js';
import { activitySessionIdSchema } from '../shared/activity.js';
import { RegistryMutations } from './registry/mutations.js';
import { messageOf } from './registry/identity.js';
export { Config } from './registry-config.js';
export { composeBotPreset } from './composer.js';
let DshBotRegistry = (() => {
    let _classSuper = RegistryMutations;
    let _instanceExtraInitializers = [];
    let _watch_decorators;
    let _list_decorators;
    let _catalogInfo_decorators;
    let _status_decorators;
    let _openConversation_decorators;
    let _get_decorators;
    let _ensureHome_decorators;
    let _ensureBotsWorkspace_decorators;
    let _create_decorators;
    let _createForChat_decorators;
    let _onboardingStatus_decorators;
    let _startOnboarding_decorators;
    let _retryOnboarding_decorators;
    let _update_decorators;
    let _duplicate_decorators;
    let _remove_decorators;
    return class DshBotRegistry extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _watch_decorators = [Remote({ mode: 'stream' })];
            _list_decorators = [Remote];
            _catalogInfo_decorators = [Remote];
            _status_decorators = [Remote];
            _openConversation_decorators = [Remote];
            _get_decorators = [Remote];
            _ensureHome_decorators = [Remote];
            _ensureBotsWorkspace_decorators = [Remote];
            _create_decorators = [Remote];
            _createForChat_decorators = [Remote];
            _onboardingStatus_decorators = [Remote];
            _startOnboarding_decorators = [Remote];
            _retryOnboarding_decorators = [Remote];
            _update_decorators = [Remote];
            _duplicate_decorators = [Remote];
            _remove_decorators = [Remote('delete')];
            __esDecorate(this, null, _watch_decorators, { kind: "method", name: "watch", static: false, private: false, access: { has: obj => "watch" in obj, get: obj => obj.watch }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _list_decorators, { kind: "method", name: "list", static: false, private: false, access: { has: obj => "list" in obj, get: obj => obj.list }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _catalogInfo_decorators, { kind: "method", name: "catalogInfo", static: false, private: false, access: { has: obj => "catalogInfo" in obj, get: obj => obj.catalogInfo }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _status_decorators, { kind: "method", name: "status", static: false, private: false, access: { has: obj => "status" in obj, get: obj => obj.status }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _openConversation_decorators, { kind: "method", name: "openConversation", static: false, private: false, access: { has: obj => "openConversation" in obj, get: obj => obj.openConversation }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _get_decorators, { kind: "method", name: "get", static: false, private: false, access: { has: obj => "get" in obj, get: obj => obj.get }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _ensureHome_decorators, { kind: "method", name: "ensureHome", static: false, private: false, access: { has: obj => "ensureHome" in obj, get: obj => obj.ensureHome }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _ensureBotsWorkspace_decorators, { kind: "method", name: "ensureBotsWorkspace", static: false, private: false, access: { has: obj => "ensureBotsWorkspace" in obj, get: obj => obj.ensureBotsWorkspace }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _create_decorators, { kind: "method", name: "create", static: false, private: false, access: { has: obj => "create" in obj, get: obj => obj.create }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _createForChat_decorators, { kind: "method", name: "createForChat", static: false, private: false, access: { has: obj => "createForChat" in obj, get: obj => obj.createForChat }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _onboardingStatus_decorators, { kind: "method", name: "onboardingStatus", static: false, private: false, access: { has: obj => "onboardingStatus" in obj, get: obj => obj.onboardingStatus }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _startOnboarding_decorators, { kind: "method", name: "startOnboarding", static: false, private: false, access: { has: obj => "startOnboarding" in obj, get: obj => obj.startOnboarding }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _retryOnboarding_decorators, { kind: "method", name: "retryOnboarding", static: false, private: false, access: { has: obj => "retryOnboarding" in obj, get: obj => obj.retryOnboarding }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _update_decorators, { kind: "method", name: "update", static: false, private: false, access: { has: obj => "update" in obj, get: obj => obj.update }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _duplicate_decorators, { kind: "method", name: "duplicate", static: false, private: false, access: { has: obj => "duplicate" in obj, get: obj => obj.duplicate }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _remove_decorators, { kind: "method", name: "remove", static: false, private: false, access: { has: obj => "remove" in obj, get: obj => obj.remove }, metadata: _metadata }, null, _instanceExtraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        onboarding = __runInitializers(this, _instanceExtraInitializers);
        personaListeners = new Set();
        /** Synchronous generation snapshot for preset plugins. It deliberately bypasses
         * the Remote queue: register() activates rows while that queue is held. */
        directorySnapshot() {
            if (!this.initialized || this.stopping)
                return [];
            return this.stores.bots.list().map(({ id, name, description }) => ({ id, name, description }))
                .sort((a, b) => a.id.localeCompare(b.id));
        }
        presetBot(botId) {
            const key = parseInput(botIdSchema, botId);
            const bot = this.activating.get(key) ?? this.leases.get(`${this.config.presetIdPrefix}${key}`)?.bot;
            if (!bot)
                throw new DshBotError('bot/unavailable', `No activating Bot preset for '${key}'`);
            return structuredClone(bot);
        }
        /** Host-only committed snapshot for a live Agent. Never observe an activating
         * candidate or adopt a deleted/recreated Bot with the same display ID. */
        personaSnapshot(botId, createdAt) {
            if (!this.initialized || this.stopping || this.failed)
                return undefined;
            const bot = this.stores.bots.list().find(row => row.id === botId && row.createdAt === createdAt);
            return bot ? { ...bot.persona } : undefined;
        }
        /** Synchronous final onboarding admission after its durable dispatch receipt. */
        onboardingSnapshot(botId, createdAt) {
            if (!this.initialized || this.stopping || this.failed)
                return undefined;
            const bot = this.stores.bots.list().find(row => row.id === botId && row.createdAt === createdAt);
            return bot ? structuredClone(bot) : undefined;
        }
        /** Host-only synchronous commit notification; listeners cannot undo a commit. */
        subscribePersonaChanges(listener) {
            this.personaListeners.add(listener);
            return () => { this.personaListeners.delete(listener); };
        }
        /** Host-only, Bot-bound access to the existing domain; never open a second store.
         * Join the registry queue so unload drains accepted operations before closing it.
         */
        memoryFor(botId) {
            this.assertReady();
            const key = parseInput(botIdSchema, botId);
            return new BotMemoryService(this.stores.memories, key, (operation) => this.enqueue(() => {
                this.stores.bots.get(key);
                return operation();
            }), this.config.memoryListLimit);
        }
        async autoShareStatus() {
            return this.enqueue(() => {
                if (!this.memoryKernel)
                    throw new Error('Memory kernel unavailable');
                return { ...new AutoShareQuota(this.memoryKernel).status(), shadow: this.shadow?.status() };
            });
        }
        shadow;
        async setAutoShare(input) {
            const f = autoShareToggleSchema.parse(input);
            return this.enqueue(async () => {
                if (!this.memoryKernel)
                    throw new Error('Memory kernel unavailable');
                const quota = new AutoShareQuota(this.memoryKernel), { revision: _revision, ...policy } = quota.policy;
                await quota.configure({ ...policy, enabled: f.enabled }, f.expectedRevision);
                this.invalidate();
                return { ...quota.status(), shadow: this.shadow?.status() };
            });
        }
        async manageMemory(operation) {
            return this.enqueue(() => {
                if (!this.memoryKernel)
                    throw new Error('Memory kernel unavailable');
                return operation(new MemoryManagement(this.memoryKernel, this.stores.bots, this.config.journalDays));
            });
        }
        /** Management-only total includes orphaned legacy rows that have no current Bot panel. */
        async memoryQuarantineCount() {
            return this.enqueue(() => {
                const kernel = this.memoryKernel;
                if (!kernel)
                    throw new Error('Memory kernel is not ready');
                const state = kernel.snapshot;
                return [...kernel.domain.table('migration_items').entries()].filter(([, item]) => item.quarantine && state.versions.get(item.memoryId)?.status === 'proposed').length;
            });
        }
        /** Host-only completion sink. The same queue drains before domain shutdown
         * and serializes accepted messages with Bot deletion and Remote reads. */
        async recordActivity(input) {
            await this.enqueue(async () => {
                const previous = this.stores.activities.list();
                await this.stores.activities.record(input);
                if (!isDeepStrictEqual(previous, this.stores.activities.list()))
                    this.invalidate();
            });
        }
        async listActivity() {
            try {
                const data = await this.enqueue(() => this.stores.activities.list());
                const mainSessions = this.mainSessions;
                if (!mainSessions)
                    return data;
                const bots = await this.list();
                const mains = await Promise.all(bots.map(async (bot) => ({ bot, main: await mainSessions.find(bot.id) })));
                const sessions = data.sessions.filter((row) => mains.some(({ bot, main }) => bot.id === row.botId && main?.sessionId === row.sessionId));
                return {
                    sessions,
                    bots: bots.map((bot) => {
                        const latest = sessions.find((row) => row.botId === bot.id);
                        return {
                            botId: bot.id,
                            lastActivityAt: latest?.updatedAt ?? 0,
                            unreadCount: latest?.unread ? 1 : 0,
                            ...(latest ? { latest: { ...latest.lastMessage, sessionId: latest.sessionId } } : {}),
                        };
                    }),
                };
            }
            catch (error) {
                if (error instanceof DshBotError && (error.code === 'store/unavailable' || error.code === 'bot/unavailable')) {
                    return { sessions: [], bots: [] };
                }
                throw error;
            }
        }
        async markActivityRead(sessionId) {
            const key = parseInput(activitySessionIdSchema, sessionId);
            try {
                return await this.enqueue(async () => {
                    const previous = this.stores.activities.list();
                    const result = await this.stores.activities.markRead(key);
                    if (!isDeepStrictEqual(previous, this.stores.activities.list()))
                        this.invalidate();
                    return result;
                });
            }
            catch (error) {
                if (error instanceof DshBotError && error.code === 'bot/unavailable') {
                    throw new DshBotError('store/unavailable', 'Activity store is unavailable', { cause: error });
                }
                throw error;
            }
        }
        changed(id, action) {
            for (const listener of this.personaListeners) {
                try {
                    listener();
                }
                catch (error) {
                    this.ctx.logger.warn(`[dsh-bot] persona listener failed: ${messageOf(error)}`);
                }
            }
            this.invalidate();
            // Host-only event. Do not await listeners inside the writer queue: listeners
            // may themselves read the registry. Their failures cannot undo a commit.
            void this.ctx.parallel('dsh-bot/changed', { id, action }).catch((error) => {
                this.ctx.logger.warn(`[dsh-bot] changed listener failed: ${messageOf(error)}`);
            });
        }
        invalidate() {
            this.changeRevision++;
            for (const changed of this.changeListeners)
                changed();
        }
        /** A fresh opening invalidation closes the subscribe/read race; each Client
         * keeps one coalesced pending revision, then refetches its ordinary catalogs.
         * Remote cancellation and Host effect disposal both wake a suspended pull.
         */
        async *watch(signal) {
            await this.waitUntilReady();
            if (signal.aborted)
                return;
            let stopped = false;
            let pending = true;
            let wake;
            const changed = () => {
                pending = true;
                wake?.();
            };
            const release = this.watchOwner.effect(() => {
                this.changeListeners.add(changed);
                return () => {
                    this.changeListeners.delete(changed);
                    stopped = true;
                    wake?.();
                };
            }, 'dsh-bot: change stream');
            const abort = () => {
                release();
            };
            signal.addEventListener('abort', abort, { once: true });
            try {
                while (!stopped && !signal.aborted) {
                    if (pending) {
                        pending = false;
                        yield botChangeSchema.parse({ revision: this.changeRevision });
                        continue;
                    }
                    await new Promise((resolve) => {
                        wake = resolve;
                    });
                    wake = undefined;
                }
            }
            finally {
                signal.removeEventListener('abort', abort);
                release();
            }
        }
        async list() {
            return this.enqueue(() => this.stores.bots.list());
        }
        async catalogInfo() {
            return this.enqueue(() => ({ presetIdPrefix: this.config.presetIdPrefix }));
        }
        async status() {
            const rows = await this.enqueue(() => this.statusRows());
            const mainSessions = this.mainSessions;
            if (!mainSessions)
                return rows;
            return Promise.all(rows.map(async (row) => {
                const main = await mainSessions.find(row.id);
                return { ...row, ...(main ? { mainSessionId: main.sessionId } : {}) };
            }));
        }
        async openConversation(botId) {
            await this.waitUntilReady();
            if (!this.mainSessions)
                throw new DshBotError('bot/unavailable', 'Main sessions are starting');
            const result = await this.mainSessions.open(parseInput(botIdSchema, botId));
            const graph = this.ctx.get('dshBotReferenceMemory');
            if (graph) {
                const bot = await this.get(botId);
                try {
                    await graph.apply({ botId: bot.id, botCreatedAt: bot.createdAt });
                }
                catch {
                    this.ctx.logger.warn('[dsh-bot] reference graph unavailable; internal memory remains active');
                }
            }
            this.invalidate();
            return result;
        }
        async get(id) {
            return this.enqueue(() => this.stores.bots.get(id));
        }
        async ensureHome(botId) {
            return this.enqueue(async () => {
                const bot = this.stores.bots.get(botId);
                return this.homes.ensure(bot.id);
            });
        }
        /** Runs only during initialization or in a registry queue slot. Do not call
         * the queued Remote from initialization: readiness and the writer would wait
         * on each other. The native registry independently serializes path creation.
         */
        async ensureWorkspace() {
            try {
                const registry = this.ctx.get('workspaceRegistry');
                if (!registry)
                    throw new DshBotError('bot/unavailable', 'Workspace registry is unavailable');
                const { path } = await this.homes.ensureRoot();
                // Resolve the authoritative path on every request: a saved id can have
                // been deleted, and an existing user-named workspace must retain its name.
                const workspace = (await registry.resolveByPath(path)) ?? (await registry.create(path, 'Bots'));
                if (this.stores.bots.botsWorkspaceId() !== workspace.id)
                    await this.stores.bots.saveBotsWorkspaceId(workspace.id);
                // Never attach historical activity here. Native deletion deliberately
                // removed its membership; archive state and old private-home cwd survive.
                return botsWorkspaceSchema.parse({ workspaceId: workspace.id, path: workspace.path });
            }
            catch (error) {
                if (error instanceof DshBotError)
                    throw error;
                throw new DshBotError('bot/unavailable', `Cannot ensure the shared Bots workspace: ${messageOf(error)}`, {
                    cause: error,
                });
            }
        }
        async ensureBotsWorkspace() {
            return this.enqueue(() => this.ensureWorkspace());
        }
        async create(input) {
            return this.enqueue(() => this.createRecord(input, 'create'), true);
        }
        async createForChat(input) {
            const f = createForChatSchema.parse(input);
            const inputDigest = createHash('sha256').update(JSON.stringify(f)).digest('hex');
            return this.enqueue(async () => {
                const existing = this.stores.bots.list().find(bot => bot.onboarding?.operationId === f.operationId);
                if (existing) {
                    if (existing.onboarding?.inputDigest !== inputDigest)
                        throw new DshBotError('bot/conflict', 'Creation operation input changed');
                    return existing;
                }
                if (this.stores.bots.retiredCreation(f.operationId))
                    throw new DshBotError('bot/conflict', 'Creation operation belongs to a removed Bot');
                return this.createRecord(f.bot, 'create', { operationId: f.operationId, language: f.language, policyVersion: 1, inputDigest });
            }, true);
        }
        async onboardingStatus(botId) {
            await this.waitUntilReady();
            if (!this.onboarding)
                return { botId: parseInput(botIdSchema, botId), state: 'unavailable', retryable: false };
            return this.onboarding.status(botId);
        }
        async startOnboarding(input) {
            await this.waitUntilReady();
            if (!this.onboarding)
                throw new DshBotError('bot/unavailable', 'Onboarding is starting');
            return this.onboarding.dispatch(input);
        }
        async retryOnboarding(input) {
            await this.waitUntilReady();
            if (!this.onboarding)
                throw new DshBotError('bot/unavailable', 'Onboarding is starting');
            return this.onboarding.dispatch(input, true);
        }
        async update(id, patch) {
            const updated = await this.enqueue(async () => {
                const reviewed = parseInput(botPatchSchema, patch);
                const fields = normalizeBotPatch(reviewed);
                if (fields.tools)
                    fields.tools = { ...fields.tools, deny: migrateMemoryDeny(fields.tools.deny) };
                const previous = this.stores.bots.get(id);
                if ((reviewed.expectedCreatedAt !== undefined && reviewed.expectedCreatedAt !== previous.createdAt)
                    || (reviewed.expectedUpdatedAt !== undefined && reviewed.expectedUpdatedAt !== previous.updatedAt)) {
                    throw new DshBotError('bot/conflict', 'Bot changed; get its current details and review the update again');
                }
                const candidate = parseInput(botSchema, { ...previous, ...fields });
                await validateDefaultCwd(candidate.defaultCwd);
                const record = await this.transition(id, candidate, () => this.stores.bots.update(id, fields, previous.updatedAt));
                this.changed(id, 'update');
                return record;
            }, true);
            await this.mainSessions?.find(id);
            return updated;
        }
        async duplicate(id, newId) {
            return this.enqueue(async () => {
                const original = this.stores.bots.get(id);
                const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, schemaVersion: _schemaVersion, onboarding: _onboarding, ...fields } = original;
                const duplicate = await this.createRecord({ ...fields, id: newId }, 'duplicate');
                await this.ctx
                    .get('dshBotConnectors')
                    ?.copyDisabled({ botId: original.id, botCreatedAt: original.createdAt }, { botId: duplicate.id, botCreatedAt: duplicate.createdAt });
                return duplicate;
            }, true);
        }
        async remove(id, options) {
            return this.enqueue(async () => {
                const key = parseInput(botIdSchema, id);
                const fields = parseInput(botRemoveOptionsSchema, options ?? {});
                const removedBot = this.stores.bots.get(key);
                if ((fields.expectedCreatedAt !== undefined && fields.expectedCreatedAt !== removedBot.createdAt)
                    || (fields.expectedUpdatedAt !== undefined && fields.expectedUpdatedAt !== removedBot.updatedAt)) {
                    throw new DshBotError('bot/conflict', 'Bot changed; review its current details before deleting');
                }
                if (fields.deleteMemories)
                    await this.stores.memories.removeByBot(key);
                if (this.memoryKernel)
                    await retireShard(this.memoryKernel, { botId: key, botCreatedAt: removedBot.createdAt });
                const removeHome = fields.deleteHome ? await this.homes.prepareRemoval(key) : undefined;
                await this.transition(key, undefined, () => this.stores.bots.remove(key, fields));
                this.changed(key, 'remove');
                try {
                    await removeHome?.();
                }
                catch (error) {
                    throw new DshBotError('bot/home-cleanup-failed', 'Bot was deleted, but its private home cleanup failed; its remaining private files may need manual cleanup', { cause: error });
                }
            }, true);
        }
    };
})();
export { DshBotRegistry };
//# sourceMappingURL=registry.js.map
export const DSH_BOT_MODULE_VERSION = '0.6.3';
