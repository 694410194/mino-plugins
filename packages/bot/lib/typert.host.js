import TYPERT_REMOTE from './typert.remote-client.js';
export const TYPERT = {
    package: 'dsh-bot',
    face: 'host',
    schemas: [],
    get invocations() {
        return TYPERT_REMOTE.descriptors;
    },
    model: { services: [], events: [], objects: [] },
};
export default TYPERT;
//# sourceMappingURL=typert.host.js.map
export const DSH_BOT_MODULE_VERSION = '0.6.3';
