import { temporalFacts } from './temporal.js';
import { adjudicate } from './conflicts.js';
export { retrievalRank as rankFacts } from './retrieval-rank.js';
export function readableFacts(kernel, bot, query) {
    return adjudicate(temporalFacts(kernel, query), query.at, bot).filter(f => f.state === 'active');
}
//# sourceMappingURL=query.js.map
export const DSH_BOT_MODULE_VERSION = '0.6.3';
