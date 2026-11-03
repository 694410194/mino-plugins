import { Config as RetrievalConfig } from './retrieval-config.js';
import { join } from 'node:path';
import { openMemoryDomain } from './layout-upgrade.js';
import { acquireMemoryOwner } from './owner-lease.js';
import { MemoryKernel } from './op-log.js';
export async function openMemoryKernel(ctx, dataDir, timeZone, retrievalConfig) {
    const lease = await acquireMemoryOwner(join(dataDir, 'memory-owner'));
    try {
        const domain = await openMemoryDomain(ctx);
        const kernel = new MemoryKernel(domain, lease.assertOwner, RetrievalConfig(retrievalConfig));
        try {
            await kernel.recover(timeZone);
        }
        catch (error) {
            await domain.close();
            throw error;
        }
        let closing;
        return { kernel, assertOwner: lease.assertOwner, close: () => (closing ??= (async () => {
                await kernel.close();
                await lease.close();
            })()) };
    }
    catch (error) {
        await lease.close();
        throw error;
    }
}
//# sourceMappingURL=open-v2.js.map
export const DSH_BOT_MODULE_VERSION = '0.6.3';
