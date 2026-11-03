/** Observe only public optional service facts. Registration is not proof of tool ownership or execution. */
export function platformCapabilities(ctx) {
    const browser = ctx.get('browserUse');
    const speech = ctx.get('speechToText');
    let voice = { available: false, providers: [] };
    if (speech) {
        try {
            const snapshot = speech.snapshot();
            voice = { available: true, selectedProvider: snapshot.selection.providerId,
                providers: snapshot.providers.map(provider => ({ id: provider.id, name: provider.name, phase: provider.preparation.phase })) };
        }
        catch { /* Readiness unavailable; do not prepare, download, record or transcribe. */ }
    }
    return { browser: { ...(browser?.providerName ? { provider: browser.providerName } : {}), toolBridge: false }, voice };
}
//# sourceMappingURL=platform.js.map
export const DSH_BOT_MODULE_VERSION = '0.6.3';
