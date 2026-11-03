import { defineDomain, domainTable } from '@deepseek-ai/dsh-storage-domain';
import { emptyShadow, ShadowPlanner, shadowStateSchema } from './planner.js';
export const shadowDomain = defineDomain({ name: 'dsh_bot_shadow', version: 1,
    tables: { state: domainTable(shadowStateSchema) } });
export async function startShadow(ctx, config) {
    let planner;
    await ctx.effect(async () => {
        const domain = await ctx.storageDomain.open(shadowDomain);
        try {
            const table = domain.table('state');
            planner = new ShadowPlanner(config, table.get('active') ?? emptyShadow(), async (state) => { await table.put('active', state); });
            const release = ctx.provide('dshBotShadow', planner);
            return async () => { release(); await planner?.close(); await domain.close(); };
        }
        catch (error) {
            await domain.close();
            throw error;
        }
    }, 'dsh-bot: offline shadow');
    if (!planner)
        throw Error('Shadow failed to initialize');
    return planner;
}
//# sourceMappingURL=service.js.map
export const DSH_BOT_MODULE_VERSION = '0.6.3';
