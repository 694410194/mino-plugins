import { isDeepStrictEqual } from 'node:util';
export function sameBotConfig(left, right) {
    const { createdAt: _lc, updatedAt: _lu, ...l } = left;
    const { createdAt: _rc, updatedAt: _ru, ...r } = right;
    return isDeepStrictEqual(l, r);
}
export const messageOf = (error) => (error instanceof Error ? error.message : String(error));
//# sourceMappingURL=identity.js.map
export const DSH_BOT_MODULE_VERSION = '0.6.3';
