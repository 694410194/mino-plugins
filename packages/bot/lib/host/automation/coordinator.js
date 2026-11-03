import { MainSessionDelivery } from './delivery.js';
import { openAutomationStores } from './store.js';
import { NativeScheduleRemote, RunRemote } from './remote.js';
import { routineOutcomes } from '../native-schedule/outcomes.js';
import { NativeSchedules } from '../native-schedule/service.js';
import { registerAutomationGuard } from '../delegate/guard.js';
import { AutomationError } from './errors.js';
/** Explicit requests only: no clock, queue driver, quota, catch-up or Host lease. */
export async function startAutomation(ctx, bots) {
    const resolveBot = async (id) => {
        const bot = await bots.get(id);
        return { bot, presetId: `${bots.config.presetIdPrefix}${bot.id}` };
    };
    let delivery;
    let stopped = false;
    const admissions = new Set();
    ctx.effect(() => {
        const fork = ctx.inject(['sessionProjections'], scoped => {
            scoped.effect(() => scoped.sessionProjections.register(routineOutcomes(bots.config.routineOutcomeLimit)), 'dsh-bot: routine outcomes');
        });
        return () => fork.dispose();
    }, 'dsh-bot: optional native projections');
    const native = new NativeSchedules(ctx, bots);
    const close = async () => {
        stopped = true;
        await Promise.allSettled([...admissions]);
        await delivery?.close();
        await native.close();
    };
    const stores = await openAutomationStores(ctx, { resolveBot, beforeClose: close });
    try {
        delivery = new MainSessionDelivery(ctx, bots, stores.runs);
        const sender = delivery;
        const submit = (request) => {
            if (stopped)
                return Promise.reject(new AutomationError('automation/unavailable', 'Executions are closing'));
            const pending = sender.submit(request);
            admissions.add(pending);
            void pending.finally(() => admissions.delete(pending)).catch(() => { });
            return pending;
        };
        ctx.provide('dshBotDelivery', delivery);
        ctx.provide('dshBotAutomationStores', stores);
        ctx.provide('dshBotSubmitter', { submit });
        registerAutomationGuard(ctx, stores.runs);
        await native.start();
        new NativeScheduleRemote(ctx, native, submit);
        new RunRemote(ctx, stores.runs);
        return { delivery, stores, native, close };
    }
    catch (error) {
        await close();
        await stores.close();
        throw error;
    }
}
//# sourceMappingURL=coordinator.js.map
export const DSH_BOT_MODULE_VERSION = '0.6.3';
