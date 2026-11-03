import { randomUUID } from 'node:crypto';
import { sameBot } from '../../shared/identity.js';
export const retiredShard = (kernel, bot) => [...kernel.domain.table('ops').entries()]
    .some(([, op]) => op.kind === 'retire_shard' && !!op.owner && sameBot(op.owner, bot));
export async function retireShard(kernel, owner) {
    if (retiredShard(kernel, owner))
        return;
    await kernel.commit({ opId: randomUUID(), kind: 'retire_shard', owner, subjectIds: [],
        expectedRevision: kernel.seq, forgetEpoch: kernel.epoch });
}
//# sourceMappingURL=shards.js.map
export const DSH_BOT_MODULE_VERSION = '0.6.3';
