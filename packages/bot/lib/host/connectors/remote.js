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
import { INTEGRATIONS_REMOTE } from '../../shared/integrations-contract.js';
import { integrationCatalogSchema } from '../../shared/integrations.js';
export const INTEGRATIONS_HOST = {
    package: 'dsh-bot/integrations',
    face: 'host',
    schemas: [],
    get invocations() {
        return INTEGRATIONS_REMOTE.descriptors;
    },
    model: { services: [], events: [], objects: [] },
};
let ConnectorRemote = (() => {
    let _classSuper = TypertRemoteService;
    let _instanceExtraInitializers = [];
    let _catalog_decorators;
    let _saveDefinition_decorators;
    let _saveAssignment_decorators;
    let _applyIdle_decorators;
    let _importLegacy_decorators;
    return class ConnectorRemote extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _catalog_decorators = [Remote];
            _saveDefinition_decorators = [Remote];
            _saveAssignment_decorators = [Remote];
            _applyIdle_decorators = [Remote];
            _importLegacy_decorators = [Remote];
            __esDecorate(this, null, _catalog_decorators, { kind: "method", name: "catalog", static: false, private: false, access: { has: obj => "catalog" in obj, get: obj => obj.catalog }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _saveDefinition_decorators, { kind: "method", name: "saveDefinition", static: false, private: false, access: { has: obj => "saveDefinition" in obj, get: obj => obj.saveDefinition }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _saveAssignment_decorators, { kind: "method", name: "saveAssignment", static: false, private: false, access: { has: obj => "saveAssignment" in obj, get: obj => obj.saveAssignment }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _applyIdle_decorators, { kind: "method", name: "applyIdle", static: false, private: false, access: { has: obj => "applyIdle" in obj, get: obj => obj.applyIdle }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _importLegacy_decorators, { kind: "method", name: "importLegacy", static: false, private: false, access: { has: obj => "importLegacy" in obj, get: obj => obj.importLegacy }, metadata: _metadata }, null, _instanceExtraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        connectors = __runInitializers(this, _instanceExtraInitializers);
        notifications;
        constructor(ctx, connectors, notifications) {
            super(ctx, 'dshBotP34', { namespace: 'dshBot.connectors' });
            this.connectors = connectors;
            this.notifications = notifications;
        }
        async catalog() {
            const notifications = this.notifications.list();
            return integrationCatalogSchema.parse({
                definitions: this.connectors.definitions(),
                assignments: this.connectors.assignments(),
                runtime: this.connectors.runtime(),
                policies: this.notifications.policies(),
                notifications,
                unread: notifications.filter((r) => r.readAt === undefined).length,
                imSupported: this.notifications.supported(),
                desktopSupported: false,
                defaults: {
                    dailyLimit: this.notifications.options.dailyLimit,
                    cooldownSec: this.notifications.options.cooldownSec,
                },
            });
        }
        async saveDefinition(input, expected) {
            return this.connectors.saveDefinition(input, expected);
        }
        async saveAssignment(input, expected) {
            return this.connectors.saveAssignment(input, expected);
        }
        async applyIdle(bot) {
            return this.connectors.applyIdle(bot);
        }
        async importLegacy(bot) {
            return this.connectors.importLegacy(bot);
        }
    };
})();
export { ConnectorRemote };
export { NotificationRemote } from '../notifications/remote.js';
//# sourceMappingURL=remote.js.map
export const DSH_BOT_MODULE_VERSION = '0.6.3';
