import { botDomain, writer, failure } from './stores/domain.js';
import { BotStore } from './stores/bots.js';
import { ActivityStore } from './stores/activity.js';
import { MemoryStore } from './stores/memory.js';
import { migrationBotDomain } from './stores/domain.js';
import { openMemoryKernel } from './memory/open-v2.js';
import { migratePrivate } from './memory/migration.js';
import { V2MemoryStore } from './memory/store-v2.js';
export { botDomain } from './stores/domain.js';
export { BotStore } from './stores/bots.js';
export { ActivityStore } from './stores/activity.js';
export { MemoryStore, lexicalMemorySearch, tokenizeMemoryQuery, } from './stores/memory.js';
/** Call once in the owning Host context (inject storageDomain); share the stores. */
export async function openBotStores(ctx, options = {}) {
    let stores;
    let closing;
    try {
        const release = ctx.effect(async () => {
            options.assertOwner?.();
            const v2 = options.memoryV2;
            const memory = v2 ? await openMemoryKernel(ctx, v2.dataDir, v2.timeZone, v2.retrievalConfig) : undefined;
            const legacy = await ctx.storageDomain.open(options.memoryV2 ? migrationBotDomain : botDomain)
                .catch(async (error) => { await memory?.close(); throw error; });
            // The migration-only union is never exposed to legacy memory writers.
            const domain = legacy;
            writer(domain).assertOwner = options.assertOwner;
            try {
                if (memory)
                    await migratePrivate(legacy, memory.kernel);
                const activities = new ActivityStore(domain, options);
                await activities.prune();
                const bots = new BotStore(domain);
                stores = { bots, memories: memory ? new V2MemoryStore(memory.kernel, bots) : new MemoryStore(domain),
                    activities, ...(memory ? { memoryKernel: memory.kernel } : {}) };
            }
            catch (error) {
                await domain.close();
                await memory?.close();
                throw error;
            }
            const closeDomain = async () => {
                // Cordis may dispose sibling effects concurrently. The registry owns a
                // wider queue than these stores, and must drain it before we reject writes.
                if (options.beforeClose)
                    await options.beforeClose();
                const state = writer(domain);
                state.closing = true;
                await state.tail;
                try {
                    await domain.close();
                    await memory?.close();
                }
                catch (error) {
                    throw failure(error);
                }
            };
            return () => (closing ??= closeDomain());
        });
        await release;
        // Cordis skips repeat disposer calls; still await the original teardown.
        return {
            ...stores,
            close: async () => {
                await release();
                await closing;
            },
        };
    }
    catch (error) {
        throw failure(error);
    }
}
//# sourceMappingURL=store.js.map
export const DSH_BOT_MODULE_VERSION = '0.6.3';
