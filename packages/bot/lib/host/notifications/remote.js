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
import { OperationError } from '../common/operations.js';
let NotificationRemote = (() => {
    let _classSuper = TypertRemoteService;
    let _instanceExtraInitializers = [];
    let _savePolicy_decorators;
    let _markRead_decorators;
    let _testNotification_decorators;
    return class NotificationRemote extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _savePolicy_decorators = [Remote];
            _markRead_decorators = [Remote];
            _testNotification_decorators = [Remote];
            __esDecorate(this, null, _savePolicy_decorators, { kind: "method", name: "savePolicy", static: false, private: false, access: { has: obj => "savePolicy" in obj, get: obj => obj.savePolicy }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _markRead_decorators, { kind: "method", name: "markRead", static: false, private: false, access: { has: obj => "markRead" in obj, get: obj => obj.markRead }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _testNotification_decorators, { kind: "method", name: "testNotification", static: false, private: false, access: { has: obj => "testNotification" in obj, get: obj => obj.testNotification }, metadata: _metadata }, null, _instanceExtraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        notifications = __runInitializers(this, _instanceExtraInitializers);
        constructor(ctx, notifications) {
            super(ctx, 'dshBotNotificationRemote', { namespace: 'dshBot.notifications' });
            this.notifications = notifications;
        }
        async savePolicy(input, expected, confirmed) {
            return this.notifications.savePolicy(input, expected, confirmed);
        }
        async markRead(id, expected) {
            return this.notifications.markRead(id, expected);
        }
        async testNotification(owner, input, expectedScope, confirmed) {
            if (confirmed !== true)
                throw new OperationError('approval-denied');
            const policy = this.notifications.policy(input.policyId);
            if (policy.scopeDigest !== expectedScope)
                throw new OperationError('conflict');
            const r = await this.notifications.record(owner, input, { kind: 'tool', id: input.relatedId ?? input.operationId });
            return this.notifications.deliver(r.id, expectedScope);
        }
    };
})();
export { NotificationRemote };
//# sourceMappingURL=remote.js.map
export const DSH_BOT_MODULE_VERSION = '0.6.3';
