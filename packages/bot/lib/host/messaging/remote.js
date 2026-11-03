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
import { MessageId } from '@deepseek-ai/dsh-llm';
import { messageRequestSchema, MESSAGING_REMOTE } from '../../shared/messaging-contract.js';
import { OperationError } from '../common/operations.js';
export const MESSAGING_HOST = { package: 'dsh-bot/messaging', face: 'host', schemas: [],
    get invocations() { return MESSAGING_REMOTE.descriptors; }, model: { services: [], events: [], objects: [] } };
let MessagingRemote = (() => {
    let _classSuper = TypertRemoteService;
    let _instanceExtraInitializers = [];
    let _request_decorators;
    return class MessagingRemote extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _request_decorators = [Remote];
            __esDecorate(this, null, _request_decorators, { kind: "method", name: "request", static: false, private: false, access: { has: obj => "request" in obj, get: obj => obj.request }, metadata: _metadata }, null, _instanceExtraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        messaging = __runInitializers(this, _instanceExtraInitializers);
        static inject = ['dshBots', 'sessionController', 'sessions'];
        constructor(ctx, messaging) {
            super(ctx, 'dshBotMessagingRemote', { namespace: 'dshBot.messaging' });
            this.messaging = messaging;
        }
        async request(value) {
            const input = messageRequestSchema.parse(value), service = this.messaging;
            if (!service)
                return { enabled: false, nestedMessaging: false, pending: 0, items: [] };
            let botId;
            if (input.action === 'list')
                botId = input.botId;
            else {
                return service.exclusive(input.id, () => this.change(input));
            }
            return this.overview(botId);
        }
        async change(input) {
            const service = this.messaging;
            if (!service)
                throw new OperationError('unavailable');
            const row = service.store.get(input.id);
            if (!row || row.revision !== input.revision)
                throw new OperationError('conflict');
            const botId = row.envelope.from.botId;
            if (input.action === 'cancel') {
                if (row.delivery === 'queued')
                    await service.store.update(input.id, { delivery: 'canceled', processing: 'interrupted' }, input.revision);
                else {
                    const result = await this.ctx.sessionController.resolveAgent(row.envelope.toSessionId);
                    if ('error' in result || !row.nativeInput)
                        throw new OperationError('recovery-needed');
                    // Never remove a claimed message or cancel an unrelated human turn.
                    if (!result.agent.inbox.remove(MessageId(row.nativeInput.id)))
                        throw new OperationError('conflict');
                    if (!(await this.ctx.sessions.flush(result.agent.session)))
                        throw new OperationError('recovery-needed');
                    await service.store.update(input.id, { delivery: 'canceled', processing: 'interrupted' }, input.revision);
                }
            }
            else {
                if (row.delivery !== 'failed' || row.nativeRef || !['resolve-unavailable', 'session/writer-held'].includes(row.lastErrorCode ?? ''))
                    throw new OperationError('recovery-needed');
                await service.store.update(input.id, { delivery: 'queued', retryCount: 0, nextAttemptAt: Date.now() }, input.revision);
                service.retry(input.id);
            }
            return this.overview(botId);
        }
        async overview(botId) {
            const service = this.messaging;
            if (!service)
                throw new OperationError('unavailable');
            const bot = await this.ctx.dshBots.get(botId);
            const rows = service.store.rows().filter((r) => (r.envelope.from.botId === botId && r.envelope.from.botCreatedAt === bot.createdAt) ||
                (r.envelope.to.botId === botId && r.envelope.to.botCreatedAt === bot.createdAt));
            return { enabled: service.lifecycle().phase === 'running', nestedMessaging: false,
                pending: rows.filter((r) => r.envelope.from.botId === botId && r.response === 'waiting').length,
                items: rows.sort((a, b) => b.envelope.ts - a.envelope.ts).slice(0, 20).map((r) => ({
                    envelope: { ...r.envelope, content: undefined }, revision: r.revision, delivery: r.delivery,
                    processing: r.processing, response: r.response, ...(r.lastErrorCode ? { lastErrorCode: r.lastErrorCode } : {}),
                })) };
        }
    };
})();
export { MessagingRemote };
//# sourceMappingURL=remote.js.map
export const DSH_BOT_MODULE_VERSION = '0.6.3';
