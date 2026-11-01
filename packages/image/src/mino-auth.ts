/** Mino account-token resolution for image requests. */
import type { Context } from '@deepseek-ai/cordis'

/** Header the inference gateway maps to `Authorization: Bearer`. */
const TOKEN_HEADER = 'x-dsh-auth-token'

/** The account-service surface this plugin depends on. */
interface AccountLike {
  resolveToken(url: string): Promise<string | undefined>
  rejectToken(token: string): Promise<void>
}

function account(ctx: Context): AccountLike | undefined {
  return ctx.get('deepseekAccount') as AccountLike | undefined
}

/**
 * Resolve the signed-in account token for one image request. The token is
 * sent both as `x-dsh-auth-token` (the harness account convention, mapped to
 * Bearer by the managed gateway) and as a plain Bearer credential so any
 * OpenAI-compatible deployment accepts it unchanged.
 */
export async function requireMinoAuth(
  ctx: Context,
  baseURL: string,
): Promise<{ token: string; headers: Record<string, string> }> {
  const token = await account(ctx)?.resolveToken(baseURL)
  if (token === undefined) {
    throw new Error('请先登录 Mino 账号后使用图像生成；登录后重试。')
  }
  return {
    token,
    headers: {
      [TOKEN_HEADER]: token,
      authorization: `Bearer ${token}`,
    },
  }
}

/** Drop a stored grant after the gateway rejected it, so the next sign-in re-auths. */
export async function rejectMinoToken(ctx: Context, token: string): Promise<void> {
  try {
    await account(ctx)?.rejectToken(token)
  } catch (_credentialRemovalFailed) {
    // Storage failure cannot replace the inference failure being reported.
  }
}
