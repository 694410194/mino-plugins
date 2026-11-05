/** Mino account-token resolution for image requests. */
import type { Context } from '@deepseek-ai/cordis';
/**
 * Resolve the signed-in account token for one image request. The token is
 * sent both as `x-dsh-auth-token` (the harness account convention, mapped to
 * Bearer by the managed gateway) and as a plain Bearer credential so any
 * OpenAI-compatible deployment accepts it unchanged.
 */
export declare function requireMinoAuth(ctx: Context, baseURL: string): Promise<{
    token: string;
    headers: Record<string, string>;
}>;
/** Drop a stored grant after the gateway rejected it, so the next sign-in re-auths. */
export declare function rejectMinoToken(ctx: Context, token: string): Promise<void>;
