/** Public error identity shared by Host and Client; no Host runtime dependencies. */
export const OPERATION_CODES = {
    invalid: 'dsh-bot/invalid',
    conflict: 'dsh-bot/conflict',
    'not-found': 'dsh-bot/not-found',
    unavailable: 'dsh-bot/unavailable',
    unsupported: 'dsh-bot/unsupported',
    'approval-denied': 'dsh-bot/approval-denied',
    'recovery-needed': 'dsh-bot/recovery-needed',
};
export function hasOperationCode(error, code) {
    return typeof error === 'object' && error !== null && 'code' in error && error.code === OPERATION_CODES[code];
}
//# sourceMappingURL=operation-errors.js.map
export const DSH_BOT_MODULE_VERSION = '0.6.3';
