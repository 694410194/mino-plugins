/** Public error identity shared by Host and Client; no Host runtime dependencies. */
export declare const OPERATION_CODES: {
    readonly invalid: "dsh-bot/invalid";
    readonly conflict: "dsh-bot/conflict";
    readonly 'not-found': "dsh-bot/not-found";
    readonly unavailable: "dsh-bot/unavailable";
    readonly unsupported: "dsh-bot/unsupported";
    readonly 'approval-denied': "dsh-bot/approval-denied";
    readonly 'recovery-needed': "dsh-bot/recovery-needed";
};
export type OperationCode = keyof typeof OPERATION_CODES;
export type OperationErrorCode = (typeof OPERATION_CODES)[OperationCode];
export declare function hasOperationCode(error: unknown, code: OperationCode): error is {
    code: OperationErrorCode;
};
