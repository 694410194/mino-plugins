/** No public rc.2/rc.3 native proof distinguishes composer gestures from owner RPC automation.
 * This gate has no nonce/Remote/isTrusted escape hatch. Only an upstream verified capability can replace it.
 */
export const nativeIngressCapability = Object.freeze({ verified: false, reason: 'unverifiable-user-input' });
export function classifyNativeIngress(_acceptedMessage) {
    return { trust: 'candidate', receipt: undefined, effectiveAutoShare: false,
        reason: nativeIngressCapability.reason };
}
export function assertTrustedIngress(_claimedReceipt) {
    throw new Error('Automatic sharing unavailable: native direct user input cannot be verified');
}
//# sourceMappingURL=trusted-ingress.js.map
export const DSH_BOT_MODULE_VERSION = '0.6.3';
