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
import { GROUPS_REMOTE } from '../../shared/groups-contract.js';
export const GROUPS_HOST = {
    package: 'dsh-bot/groups',
    face: 'host',
    schemas: [],
    get invocations() {
        return GROUPS_REMOTE.descriptors;
    },
    model: { services: [], events: [], objects: [] },
};
let GroupsRemote = (() => {
    let _classSuper = TypertRemoteService;
    let _instanceExtraInitializers = [];
    let _open_decorators;
    let _openAttachment_decorators;
    let _markRead_decorators;
    let _list_decorators;
    let _create_decorators;
    let _edit_decorators;
    let _setModel_decorators;
    let _view_decorators;
    let _send_decorators;
    let _cancel_decorators;
    let _continueTurn_decorators;
    let _stopMember_decorators;
    let _archive_decorators;
    return class GroupsRemote extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _open_decorators = [Remote];
            _openAttachment_decorators = [Remote];
            _markRead_decorators = [Remote];
            _list_decorators = [Remote];
            _create_decorators = [Remote];
            _edit_decorators = [Remote];
            _setModel_decorators = [Remote];
            _view_decorators = [Remote];
            _send_decorators = [Remote];
            _cancel_decorators = [Remote];
            _continueTurn_decorators = [Remote];
            _stopMember_decorators = [Remote];
            _archive_decorators = [Remote];
            __esDecorate(this, null, _open_decorators, { kind: "method", name: "open", static: false, private: false, access: { has: obj => "open" in obj, get: obj => obj.open }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _openAttachment_decorators, { kind: "method", name: "openAttachment", static: false, private: false, access: { has: obj => "openAttachment" in obj, get: obj => obj.openAttachment }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _markRead_decorators, { kind: "method", name: "markRead", static: false, private: false, access: { has: obj => "markRead" in obj, get: obj => obj.markRead }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _list_decorators, { kind: "method", name: "list", static: false, private: false, access: { has: obj => "list" in obj, get: obj => obj.list }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _create_decorators, { kind: "method", name: "create", static: false, private: false, access: { has: obj => "create" in obj, get: obj => obj.create }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _edit_decorators, { kind: "method", name: "edit", static: false, private: false, access: { has: obj => "edit" in obj, get: obj => obj.edit }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _setModel_decorators, { kind: "method", name: "setModel", static: false, private: false, access: { has: obj => "setModel" in obj, get: obj => obj.setModel }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _view_decorators, { kind: "method", name: "view", static: false, private: false, access: { has: obj => "view" in obj, get: obj => obj.view }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _send_decorators, { kind: "method", name: "send", static: false, private: false, access: { has: obj => "send" in obj, get: obj => obj.send }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _cancel_decorators, { kind: "method", name: "cancel", static: false, private: false, access: { has: obj => "cancel" in obj, get: obj => obj.cancel }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _continueTurn_decorators, { kind: "method", name: "continueTurn", static: false, private: false, access: { has: obj => "continueTurn" in obj, get: obj => obj.continueTurn }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _stopMember_decorators, { kind: "method", name: "stopMember", static: false, private: false, access: { has: obj => "stopMember" in obj, get: obj => obj.stopMember }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _archive_decorators, { kind: "method", name: "archive", static: false, private: false, access: { has: obj => "archive" in obj, get: obj => obj.archive }, metadata: _metadata }, null, _instanceExtraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        groups = __runInitializers(this, _instanceExtraInitializers);
        constructor(ctx, groups) {
            super(ctx, 'dshBotGroupsRemote', { namespace: 'dshBot.groups' });
            this.groups = groups;
        }
        async open(group) { return this.groups.open(group); }
        async openAttachment(group, messageId, attachmentId) {
            return this.groups.openAttachment(group, messageId, attachmentId);
        }
        async markRead(group, throughSeq, expectedRevision) {
            return this.groups.markRead(group, throughSeq, expectedRevision);
        }
        async list() {
            return this.groups.list();
        }
        async create(input) {
            return this.groups.create(input);
        }
        async edit(group, input) {
            return this.groups.edit(group, input);
        }
        async setModel(group, input) {
            return this.groups.setModel(group, input);
        }
        async view(group, page) {
            return this.groups.view(group, page);
        }
        async send(group, input) {
            return this.groups.send(group, input);
        }
        async cancel(group, turnId, expectedRevision) {
            return this.groups.cancel(group, turnId, expectedRevision);
        }
        async continueTurn(group, turnId, expectedRevision) { return this.groups.continueTurn(group, turnId, expectedRevision); }
        async stopMember(group, turnId, memberId, expectedRevision) { return this.groups.stopMember(group, turnId, memberId, expectedRevision); }
        async archive(group, expectedRevision) {
            return this.groups.archive(group, expectedRevision);
        }
    };
})();
export { GroupsRemote };
//# sourceMappingURL=remote.js.map
export const DSH_BOT_MODULE_VERSION = '0.6.3';
