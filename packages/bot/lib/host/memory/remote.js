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
import { Remote, TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol';
import { memoryRemoteListSchema, memoryRemotePatchSchema, memoryRemoteSaveSchema, memoryRemoteSearchSchema, } from '../../shared/remote-contract.js';
import { parseInput } from '../errors.js';
import { rejectMemorySecrets } from './secrets.js';
import { forgetChoiceSchema, forgetSelectionSchema } from '../../shared/memory-forget.js';
import { z } from 'zod';
/** The registry owns all storage and queue lifetimes; this service only adapts UI calls. */
let DshBotMemoryRemote = (() => {
    let _classSuper = TypertRemoteService;
    let _instanceExtraInitializers = [];
    let _autoShareStatus_decorators;
    let _setAutoShare_decorators;
    let _query_decorators;
    let _createManaged_decorators;
    let _revise_decorators;
    let _confirm_decorators;
    let _resolve_decorators;
    let _previewContribution_decorators;
    let _previewShared_decorators;
    let _previewForget_decorators;
    let _chooseForget_decorators;
    let _cleanupStatuses_decorators;
    let _retryCleanup_decorators;
    let _rootInstructions_decorators;
    let _list_decorators;
    let _search_decorators;
    let _save_decorators;
    let _update_decorators;
    let _remove_decorators;
    let _quarantineCount_decorators;
    let _count_decorators;
    return class DshBotMemoryRemote extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _autoShareStatus_decorators = [Remote];
            _setAutoShare_decorators = [Remote];
            _query_decorators = [Remote];
            _createManaged_decorators = [Remote];
            _revise_decorators = [Remote];
            _confirm_decorators = [Remote];
            _resolve_decorators = [Remote];
            _previewContribution_decorators = [Remote];
            _previewShared_decorators = [Remote];
            _previewForget_decorators = [Remote];
            _chooseForget_decorators = [Remote];
            _cleanupStatuses_decorators = [Remote];
            _retryCleanup_decorators = [Remote];
            _rootInstructions_decorators = [Remote];
            _list_decorators = [Remote];
            _search_decorators = [Remote];
            _save_decorators = [Remote];
            _update_decorators = [Remote];
            _remove_decorators = [Remote('delete')];
            _quarantineCount_decorators = [Remote];
            _count_decorators = [Remote];
            __esDecorate(this, null, _autoShareStatus_decorators, { kind: "method", name: "autoShareStatus", static: false, private: false, access: { has: obj => "autoShareStatus" in obj, get: obj => obj.autoShareStatus }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _setAutoShare_decorators, { kind: "method", name: "setAutoShare", static: false, private: false, access: { has: obj => "setAutoShare" in obj, get: obj => obj.setAutoShare }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _query_decorators, { kind: "method", name: "query", static: false, private: false, access: { has: obj => "query" in obj, get: obj => obj.query }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _createManaged_decorators, { kind: "method", name: "createManaged", static: false, private: false, access: { has: obj => "createManaged" in obj, get: obj => obj.createManaged }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _revise_decorators, { kind: "method", name: "revise", static: false, private: false, access: { has: obj => "revise" in obj, get: obj => obj.revise }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _confirm_decorators, { kind: "method", name: "confirm", static: false, private: false, access: { has: obj => "confirm" in obj, get: obj => obj.confirm }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _resolve_decorators, { kind: "method", name: "resolve", static: false, private: false, access: { has: obj => "resolve" in obj, get: obj => obj.resolve }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _previewContribution_decorators, { kind: "method", name: "previewContribution", static: false, private: false, access: { has: obj => "previewContribution" in obj, get: obj => obj.previewContribution }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _previewShared_decorators, { kind: "method", name: "previewShared", static: false, private: false, access: { has: obj => "previewShared" in obj, get: obj => obj.previewShared }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _previewForget_decorators, { kind: "method", name: "previewForget", static: false, private: false, access: { has: obj => "previewForget" in obj, get: obj => obj.previewForget }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _chooseForget_decorators, { kind: "method", name: "chooseForget", static: false, private: false, access: { has: obj => "chooseForget" in obj, get: obj => obj.chooseForget }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _cleanupStatuses_decorators, { kind: "method", name: "cleanupStatuses", static: false, private: false, access: { has: obj => "cleanupStatuses" in obj, get: obj => obj.cleanupStatuses }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _retryCleanup_decorators, { kind: "method", name: "retryCleanup", static: false, private: false, access: { has: obj => "retryCleanup" in obj, get: obj => obj.retryCleanup }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _rootInstructions_decorators, { kind: "method", name: "rootInstructions", static: false, private: false, access: { has: obj => "rootInstructions" in obj, get: obj => obj.rootInstructions }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _list_decorators, { kind: "method", name: "list", static: false, private: false, access: { has: obj => "list" in obj, get: obj => obj.list }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _search_decorators, { kind: "method", name: "search", static: false, private: false, access: { has: obj => "search" in obj, get: obj => obj.search }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _save_decorators, { kind: "method", name: "save", static: false, private: false, access: { has: obj => "save" in obj, get: obj => obj.save }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _update_decorators, { kind: "method", name: "update", static: false, private: false, access: { has: obj => "update" in obj, get: obj => obj.update }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _remove_decorators, { kind: "method", name: "remove", static: false, private: false, access: { has: obj => "remove" in obj, get: obj => obj.remove }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _quarantineCount_decorators, { kind: "method", name: "quarantineCount", static: false, private: false, access: { has: obj => "quarantineCount" in obj, get: obj => obj.quarantineCount }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _count_decorators, { kind: "method", name: "count", static: false, private: false, access: { has: obj => "count" in obj, get: obj => obj.count }, metadata: _metadata }, null, _instanceExtraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static inject = ['dshBots'];
        constructor(ctx) {
            super(ctx, 'dshBotMemory', { namespace: 'dshBot.memory' });
            __runInitializers(this, _instanceExtraInitializers);
        }
        async autoShareStatus() { return this.ctx.dshBots.autoShareStatus(); }
        async setAutoShare(input) { return this.ctx.dshBots.setAutoShare(input); }
        async query(input) { return this.ctx.dshBots.manageMemory(m => m.query(input)); }
        async createManaged(input) {
            const result = await this.ctx.dshBots.manageMemory(m => m.create(input));
            this.ctx.dshBots.invalidate();
            return result;
        }
        async revise(input) {
            await this.ctx.dshBots.manageMemory(m => m.revise(input));
            this.ctx.dshBots.invalidate();
        }
        async confirm(input) {
            const result = await this.ctx.dshBots.manageMemory(m => m.confirm(input));
            this.ctx.dshBots.invalidate();
            return result;
        }
        async resolve(input) {
            await this.ctx.dshBots.manageMemory(m => m.resolve(input));
            this.ctx.dshBots.invalidate();
        }
        async previewContribution(id) { return this.forgetting().previews.contribution(parseInput(z.uuid(), id)); }
        async previewShared(selection) {
            return this.forgetting().previewShared(parseInput(forgetSelectionSchema, selection));
        }
        forgetting() {
            const service = this.ctx.dshBots.memoryForget;
            if (!service)
                throw new Error('Memory cleanup is not ready');
            return service;
        }
        async previewForget(botId, selection) {
            return this.forgetting().preview(botId, parseInput(forgetSelectionSchema, selection));
        }
        async chooseForget(choice) {
            const result = await this.forgetting().choose(parseInput(forgetChoiceSchema, choice));
            this.ctx.dshBots.invalidate();
            return result;
        }
        async cleanupStatuses() { return this.forgetting().runner.statuses(); }
        async retryCleanup(id) {
            return this.forgetting().runner.resume(parseInput(z.uuid(), id));
        }
        async rootInstructions() { return this.forgetting().roots(); }
        async list(botId, options) {
            return this.ctx.dshBots.memoryFor(botId).query(parseInput(memoryRemoteListSchema, options));
        }
        async search(botId, input) {
            return this.ctx.dshBots.memoryFor(botId).query(parseInput(memoryRemoteSearchSchema, input));
        }
        async save(botId, input) {
            rejectMemorySecrets(input);
            const fields = parseInput(memoryRemoteSaveSchema, input);
            return this.ctx.dshBots.memoryFor(botId).save(fields, { by: 'user', at: Date.now() });
        }
        async update(botId, id, patch) {
            rejectMemorySecrets(patch);
            return this.ctx.dshBots.memoryFor(botId).update(id, parseInput(memoryRemotePatchSchema, patch));
        }
        // "remove" is reserved by rc.2's Client namespace service, including nested namespaces.
        async remove(botId, id) {
            return this.ctx.dshBots.memoryFor(botId).forget({ id });
        }
        async quarantineCount() {
            return this.ctx.dshBots.memoryQuarantineCount();
        }
        async count(botId) {
            return this.ctx.dshBots.memoryFor(botId).count();
        }
    };
})();
export { DshBotMemoryRemote };
//# sourceMappingURL=remote.js.map
export const DSH_BOT_MODULE_VERSION = '0.6.3';
