import { resolve } from 'node:path';
import { Service } from '@deepseek-ai/cordis';
import { resolveDshHome } from '@deepseek-ai/dsh-home-paths';
import { TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol';
import { DshBotError } from '../errors.js';
import { BotHomes } from '../home.js';
import { composeBotPreset, ensureBotSkillsDirectory } from '../composer.js';
import { openBotStores } from '../store.js';
import { Config } from '../registry-config.js';
import { messageOf } from './identity.js';
import { MemoryConfirmation } from '../memory/confirmation.js';
import { ManagedOutlets } from '../data-flow/outlets.js';
import { EgressChecker } from '../data-flow/egress.js';
import { sameBot } from '../../shared/identity.js';
import { AutoShareQuota } from '../memory/quota.js';
import { MemoryAdmission } from '../memory/admission.js';
const examples = [
    {
        id: 'assistant',
        name: '通用助手',
        description: '协助处理日常问题与任务。',
        persona: { prefix: '你是一位认真、友善的通用助手。请用清晰的中文回答问题，说明不确定之处，并提供可执行的建议。' },
    },
    {
        id: 'researcher',
        name: '研究员',
        description: '查证信息、分析资料并整理研究结论。',
        persona: { prefix: '你是一位严谨的研究员。请区分事实、推断与假设，核实来源，以中文整理证据、分析方法和局限。' },
    },
];
export class RegistryLifecycle extends TypertRemoteService {
    assertOwner;
    static inject = ['storageDomain', 'agentPresets'];
    static Config = Config;
    config;
    memoryAdmission;
    memoryForget;
    memoryConfirmation;
    memoryEgress;
    memoryOutlets;
    get memoryKernel() { return this.stores?.memoryKernel; }
    mainSessions;
    stores;
    leases = new Map();
    activating = new Map();
    ready;
    tail = Promise.resolve();
    stopping = false;
    failed = false;
    initialized = false;
    started = false;
    startupError;
    // A live old Agent must not match a same-id replacement even if the system
    // clock stalls or moves backwards. A scalar suffices for this Host lifetime.
    creationTime = 0;
    diagnostics = new Map();
    changeRevision = 0;
    changeListeners = new Set();
    watchOwner;
    homes;
    memoryOwnerDir;
    releaseResources;
    closeTask;
    constructor(ctx, config, start = async () => { }, assertOwner = () => { }) {
        super(ctx, 'dshBots', { namespace: 'dshBot' });
        this.assertOwner = assertOwner;
        this.watchOwner = ctx;
        const parsed = Config(config);
        this.memoryAdmission = new MemoryAdmission(ctx, parsed.presetIdPrefix);
        const home = resolveDshHome();
        // Skill dataDir changes must not create a second writer for the same native storage.
        this.memoryOwnerDir = resolve(home, 'dsh-bot');
        this.homes = new BotHomes(home);
        this.config = { ...parsed, dataDir: resolve(parsed.dataDir.replace(/^\$DSH_HOME(?=\/|$)/, home)) };
        this.ready = (async () => {
            await start();
            if (this.stopping)
                return;
            this.started = true;
            await this.initialize();
            this.initialized = true;
        })().catch((error) => {
            this.startupError = messageOf(error);
            this.memoryAdmission.markStartupFailed();
            this.ctx.logger.error(`[dsh-bot] startup failed bot=*: ${this.startupError}`);
        });
        // Publish the service before Loader settlement. Never join the Loader from
        // its own teardown; once initialization starts, all resources are joined.
        ctx.effect(() => () => {
            this.stopping = true;
            if (this.started)
                return this.ready;
        }, 'dsh-bot: startup guard');
    }
    async [Service.init]() {
        await this.ready;
    }
    async waitUntilReady() {
        await this.ready;
        this.assertReady();
    }
    /** Host coordinator joins this before releasing shared-storage ownership. */
    close() {
        this.closeTask ??= (async () => {
            this.stopping = true;
            if (this.started)
                await this.ready;
            await this.releaseResources?.();
        })();
        return this.closeTask;
    }
    assertReady() {
        if (!this.initialized || this.stopping) {
            throw new DshBotError('bot/unavailable', this.startupError
                ? `Bot registry startup failed: ${this.startupError}`
                : 'Bot registry is not ready or is stopping');
        }
    }
    async initialize() {
        // A single owning effect drains API operations before releasing its collected
        // preset leases and domain. Updating a lease never moves it to an agent scope.
        await this.ctx.effect(async () => {
            let shutdownTask;
            const shutdown = () => (shutdownTask ??= (async () => {
                this.stopping = true;
                this.memoryOutlets?.stop();
                this.memoryEgress?.close();
                this.memoryConfirmation?.close();
                await this.memoryAdmission.close();
                await this.memoryOutlets?.close();
                await this.tail;
                const errors = [];
                for (const lease of [...this.leases.values()].reverse()) {
                    try {
                        await this.release(lease);
                    }
                    catch (error) {
                        errors.push(error);
                    }
                }
                try {
                    await this.stores?.close();
                }
                catch (error) {
                    errors.push(error);
                }
                if (errors.length)
                    throw new AggregateError(errors, 'DSH Bot registry cleanup failed');
            })());
            this.releaseResources = shutdown;
            try {
                this.stores = await openBotStores(this.ctx, {
                    memoryV2: { dataDir: this.memoryOwnerDir, timeZone: this.config.quotaTimeZone,
                        retrievalConfig: this.config.memoryRetrieval },
                    assertOwner: this.assertOwner,
                    activityMaxSessionsPerBot: this.config.activityMaxSessionsPerBot,
                    activityMaxSessionsTotal: this.config.activityMaxSessionsTotal,
                    beforeClose: async () => {
                        this.stopping = true;
                        await this.tail;
                    },
                });
                await this.stores.bots.migrateMemoryTools();
                if (!this.stores.memoryKernel)
                    throw new Error('Memory kernel did not initialize');
                const quota = new AutoShareQuota(this.stores.memoryKernel);
                await quota.configureHost({ enabled: this.config.autoShareEnabled,
                    botDaily: this.config.autoShareBotDaily, domainDaily: this.config.autoShareDomainDaily, timeZone: this.config.quotaTimeZone });
                const currentBot = (key) => this.stores.bots.list()
                    .some(b => sameBot({ botId: b.id, botCreatedAt: b.createdAt }, key));
                this.memoryConfirmation = new MemoryConfirmation(this.stores.memoryKernel, currentBot, this.config.memoryGrantTtlMs);
                this.memoryEgress = new EgressChecker(this.stores.memoryKernel, this.memoryConfirmation.grants, currentBot);
                this.memoryOutlets = new ManagedOutlets(this.memoryEgress);
                await this.memoryOutlets.recover();
                this.memoryAdmission.start(this.stores.memoryKernel);
                // Workspace storage may be temporarily unavailable. Bot management and
                // preset registration still work, while the launch Remote can retry.
                try {
                    await this.ensureWorkspace();
                }
                catch (error) {
                    this.ctx.logger.warn(`[dsh-bot] Bots workspace startup failed: ${messageOf(error)}`);
                }
                for (const id of this.stores.bots.avatarWarnings())
                    this.ctx.logger.warn(`[dsh-bot] avatar/invalid bot=${id}: unsupported saved avatar hidden; replace or clear explicitly`);
                if (this.config.seedExamples)
                    await this.stores.bots.seedExamples(examples);
                for (const bot of this.stores.bots.list()) {
                    this.creationTime = Math.max(this.creationTime, bot.createdAt);
                    try {
                        await ensureBotSkillsDirectory(bot.id, this.config);
                        await this.acquire(await composeBotPreset(bot, this.ctx, this.config), bot);
                    }
                    catch (error) {
                        this.diagnostics.set(bot.id, messageOf(error));
                        this.ctx.logger.error(`[dsh-bot] preset startup failed bot=${bot.id}: ${messageOf(error)}`);
                    }
                }
                this.ctx.logger.info(`[dsh-bot] registered ${this.leases.size} presets: ${[...this.leases.keys()].join(', ')}`);
            }
            catch (error) {
                this.failed = true;
                try {
                    await shutdown();
                }
                catch (cleanup) {
                    throw new AggregateError([error, cleanup], 'DSH Bot registry startup and cleanup failed');
                }
                throw error;
            }
            return shutdown;
        }, 'dsh-bot: registry presets and stores');
    }
    async enqueue(operation, write = false) {
        this.assertReady();
        const pending = this.tail.then(async () => {
            if (write && this.failed)
                await this.reconcile();
            return operation();
        });
        this.tail = pending.catch(() => { });
        return pending;
    }
}
//# sourceMappingURL=lifecycle.js.map
export const DSH_BOT_MODULE_VERSION = '0.6.3';
