/** No public rc.2/rc.3 native proof distinguishes composer gestures from owner RPC automation.
 * This gate has no nonce/Remote/isTrusted escape hatch. Only an upstream verified capability can replace it.
 */
export declare const nativeIngressCapability: Readonly<{
    verified: false;
    reason: "unverifiable-user-input";
}>;
export declare function classifyNativeIngress(_acceptedMessage: unknown): {
    trust: "candidate";
    receipt: undefined;
    effectiveAutoShare: false;
    reason: "unverifiable-user-input";
};
export declare function assertTrustedIngress(_claimedReceipt: unknown): never;
