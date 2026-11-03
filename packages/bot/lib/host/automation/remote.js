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
import { AUTOMATION_REMOTE, } from '../../shared/automation-contract.js';
import { AutomationError } from './errors.js';
export const AUTOMATION_HOST = {
    package: 'dsh-bot/automation',
    face: 'host',
    schemas: [],
    get invocations() {
        return AUTOMATION_REMOTE.descriptors;
    },
    model: { services: [], events: [], objects: [] },
};
let AutomationStatusRemote = (() => {
    let _classSuper = TypertRemoteService;
    let _instanceExtraInitializers = [];
    let _status_decorators;
    return class AutomationStatusRemote extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _status_decorators = [Remote];
            __esDecorate(this, null, _status_decorators, { kind: "method", name: "status", static: false, private: false, access: { has: obj => "status" in obj, get: obj => obj.status }, metadata: _metadata }, null, _instanceExtraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        readStatus = __runInitializers(this, _instanceExtraInitializers);
        constructor(ctx, readStatus) {
            super(ctx, 'dshBotAutomation', { namespace: 'dshBot.automation' });
            this.readStatus = readStatus;
        }
        async status() {
            return this.readStatus();
        }
    };
})();
export { AutomationStatusRemote };
let NativeScheduleRemote = (() => {
    let _classSuper = TypertRemoteService;
    let _instanceExtraInitializers = [];
    let _aggregate_decorators;
    let _deleteLegacy_decorators;
    let _runNow_decorators;
    return class NativeScheduleRemote extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _aggregate_decorators = [Remote];
            _deleteLegacy_decorators = [Remote];
            _runNow_decorators = [Remote];
            __esDecorate(this, null, _aggregate_decorators, { kind: "method", name: "aggregate", static: false, private: false, access: { has: obj => "aggregate" in obj, get: obj => obj.aggregate }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _deleteLegacy_decorators, { kind: "method", name: "deleteLegacy", static: false, private: false, access: { has: obj => "deleteLegacy" in obj, get: obj => obj.deleteLegacy }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _runNow_decorators, { kind: "method", name: "runNow", static: false, private: false, access: { has: obj => "runNow" in obj, get: obj => obj.runNow }, metadata: _metadata }, null, _instanceExtraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        native = __runInitializers(this, _instanceExtraInitializers);
        submit;
        constructor(ctx, native, submit) {
            super(ctx, 'dshBotNativeSchedules', { namespace: 'dshBot.nativeSchedule' });
            this.native = native;
            this.submit = submit;
        }
        async aggregate() {
            return this.native.aggregate();
        }
        async deleteLegacy(id) {
            await this.native.deleteLegacy(id);
            return true;
        }
        async runNow(id, operationId, expected, approved) {
            if (approved !== true)
                throw new AutomationError('automation/invalid', 'Explicit confirmation required');
            const { binding, task } = await this.native.task(id);
            if (expected.title !== task.title ||
                expected.prompt !== task.prompt ||
                expected.botCreatedAt !== binding.botCreatedAt) {
                throw new AutomationError('automation/conflict', 'Task changed since confirmation');
            }
            return this.submit({
                trigger: 'manual',
                nativeScheduleId: id,
                operationId,
                botId: binding.botId,
                botCreatedAt: binding.botCreatedAt,
                title: task.title,
                prompt: task.prompt,
                timeZone: 'timeZone' in task ? task.timeZone : 'UTC',
            });
        }
    };
})();
export { NativeScheduleRemote };
let RunRemote = (() => {
    let _classSuper = TypertRemoteService;
    let _instanceExtraInitializers = [];
    let _list_decorators;
    let _get_decorators;
    return class RunRemote extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _list_decorators = [Remote];
            _get_decorators = [Remote];
            __esDecorate(this, null, _list_decorators, { kind: "method", name: "list", static: false, private: false, access: { has: obj => "list" in obj, get: obj => obj.list }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _get_decorators, { kind: "method", name: "get", static: false, private: false, access: { has: obj => "get" in obj, get: obj => obj.get }, metadata: _metadata }, null, _instanceExtraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        runs = __runInitializers(this, _instanceExtraInitializers);
        constructor(ctx, runs) {
            super(ctx, 'dshBotRuns', { namespace: 'dshBot.run' });
            this.runs = runs;
        }
        async list(options) {
            return this.runs.list(options);
        }
        async get(id) {
            return this.runs.get(id);
        }
    };
})();
export { RunRemote };
//# sourceMappingURL=remote.js.map
export const DSH_BOT_MODULE_VERSION = '0.6.3';
