/** Header the inference gateway maps to `Authorization: Bearer`. */
const TOKEN_HEADER = 'x-dsh-auth-token';
function account(ctx) {
    return ctx.get('deepseekAccount');
}
/**
 * Resolve the signed-in account token for one image request. The token is
 * sent both as `x-dsh-auth-token` (the harness account convention, mapped to
 * Bearer by the managed gateway) and as a plain Bearer credential so any
 * OpenAI-compatible deployment accepts it unchanged.
 */
export async function requireMinoAuth(ctx, baseURL) {
    const token = await account(ctx)?.resolveToken(baseURL);
    if (token === undefined) {
        throw new Error('请先登录 Mino 账号后使用图像生成；登录后重试。');
    }
    return {
        token,
        headers: {
            [TOKEN_HEADER]: token,
            authorization: `Bearer ${token}`,
        },
    };
}
/** Drop a stored grant after the gateway rejected it, so the next sign-in re-auths. */
export async function rejectMinoToken(ctx, token) {
    try {
        await account(ctx)?.rejectToken(token);
    }
    catch (_credentialRemovalFailed) {
        // Storage failure cannot replace the inference failure being reported.
    }
}
//# sourceMappingURL=mino-auth.js.map