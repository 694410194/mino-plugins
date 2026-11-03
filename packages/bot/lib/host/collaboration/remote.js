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
import { COLLABORATION_REMOTE } from '../../shared/collaboration-contract.js';
import { imStatus } from '../im/service.js';
export const COLLABORATION_HOST = {
    package: 'dsh-bot/collaboration',
    face: 'host',
    schemas: [],
    get invocations() {
        return COLLABORATION_REMOTE.descriptors;
    },
    model: { services: [], events: [], objects: [] },
};
let CollaborationRemote = (() => {
    let _classSuper = TypertRemoteService;
    let _instanceExtraInitializers = [];
    let _board_decorators;
    let _ensure_decorators;
    let _createTask_decorators;
    let _updateTask_decorators;
    return class CollaborationRemote extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _board_decorators = [Remote];
            _ensure_decorators = [Remote];
            _createTask_decorators = [Remote];
            _updateTask_decorators = [Remote];
            __esDecorate(this, null, _board_decorators, { kind: "method", name: "board", static: false, private: false, access: { has: obj => "board" in obj, get: obj => obj.board }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _ensure_decorators, { kind: "method", name: "ensure", static: false, private: false, access: { has: obj => "ensure" in obj, get: obj => obj.ensure }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _createTask_decorators, { kind: "method", name: "createTask", static: false, private: false, access: { has: obj => "createTask" in obj, get: obj => obj.createTask }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _updateTask_decorators, { kind: "method", name: "updateTask", static: false, private: false, access: { has: obj => "updateTask" in obj, get: obj => obj.updateTask }, metadata: _metadata }, null, _instanceExtraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        collaboration = __runInitializers(this, _instanceExtraInitializers);
        constructor(ctx, collaboration) {
            super(ctx, 'dshBotCollaborationRemote', { namespace: 'dshBot.collaboration' });
            this.collaboration = collaboration;
        }
        async board(bot) {
            return this.collaboration.board(bot);
        }
        async ensure(bot, expectedRevision) {
            return this.collaboration.ensure(bot, expectedRevision);
        }
        async createTask(bot, input) {
            return this.collaboration.createTask(bot, input);
        }
        async updateTask(bot, input) {
            return this.collaboration.updateTask(bot, input);
        }
    };
})();
export { CollaborationRemote };
let ImRemote = (() => {
    let _classSuper = TypertRemoteService;
    let _instanceExtraInitializers = [];
    let _status_decorators;
    return class ImRemote extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _status_decorators = [Remote];
            __esDecorate(this, null, _status_decorators, { kind: "method", name: "status", static: false, private: false, access: { has: obj => "status" in obj, get: obj => obj.status }, metadata: _metadata }, null, _instanceExtraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        constructor(ctx) {
            super(ctx, 'dshBotImRemote', { namespace: 'dshBot.im' });
            __runInitializers(this, _instanceExtraInitializers);
        }
        async status() {
            return imStatus(this.ctx);
        }
    };
})();
export { ImRemote };
//# sourceMappingURL=remote.js.map
export const DSH_BOT_MODULE_VERSION = '0.6.3';
