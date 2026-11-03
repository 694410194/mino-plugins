// Host-owned exact-call capability for copy/cleanup only; no Remote/tool argument can create one.
const calls = new WeakMap();
export const graphCapability = (agent, callId) => calls.get(agent)?.has(callId) ?? false;
export async function withGraphCapability(agent, callId, work) {
    let owned = calls.get(agent);
    if (!owned) {
        owned = new Set();
        calls.set(agent, owned);
    }
    owned.add(callId);
    try {
        return await work();
    }
    finally {
        owned.delete(callId);
        if (!owned.size)
            calls.delete(agent);
    }
}
//# sourceMappingURL=graph-capability.js.map
export const DSH_BOT_MODULE_VERSION = '0.6.3';
