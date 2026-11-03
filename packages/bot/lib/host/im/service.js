import { IM_PIN } from '../../shared/collaboration.js';
/** No import of dsh-im internals and no probing real accounts/credentials. */
export function imStatus(ctx) {
    const candidate = ctx.get('dshIm');
    const service = candidate && typeof candidate === 'object' ? candidate : undefined;
    const contractDetected = Boolean(service &&
        service.contractVersion === 1 &&
        service.inboundVersion === 1 &&
        ['describeBot', 'listBots', 'listTargets', 'consumeInbound', 'replyChecked', 'sendChecked'].every((k) => typeof service[k] === 'function'));
    return {
        pin: IM_PIN,
        installed: Boolean(service),
        contractDetected,
        inboundSupported: false,
        outboundSupported: false,
        reason: !service ? 'plugin-missing' : !contractDetected ? 'contract-unavailable' : 'consumer-gate-unverified',
    };
}
//# sourceMappingURL=service.js.map
export const DSH_BOT_MODULE_VERSION = '0.6.3';
