/** User-facing configuration for the single Mino image channel. */
import z from '@deepseek-ai/schemastery'
import {
  DEFAULT_CLOUD_TIMEOUT_MS,
  DEFAULT_MINO_BASE_URL,
  DEFAULT_WORKSPACE_FOLDER,
} from './shared.js'

export {
  DEFAULT_CLOUD_TIMEOUT_MS,
  DEFAULT_MINO_BASE_URL,
  DEFAULT_WORKSPACE_FOLDER,
} from './shared.js'

/** Bundle configuration from the profile patch and the Web settings page. */
export interface Config {
  /**
   * OpenAI-compatible inference base URL the Mino account token resolves
   * against. Deployments only change this for staging or self-hosted
   * gateways; the account service resolves tokens by request origin.
   */
  baseURL?: string
  /** Image model id on the configured gateway (e.g. nano-banana, gpt-image). */
  model?: string
  /** Optional separate model for edits; empty reuses `model`. */
  editModel?: string
  /** Dimensions or size tier sent as the Images API `size` field. */
  size?: string
  /** Vendor quality tier sent when set; empty omits the field. */
  quality?: string
  /** Cloud request timeout in milliseconds. */
  cloudTimeoutMs?: number
  /** Also write every generated image as a file under the session workspace. */
  saveToWorkspace?: boolean
  /** Workspace subfolder for generated images; empty means the workspace root. */
  workspaceFolder?: string
}

/**
 * Mark a schema field live for the host's settings form: the loader serves a
 * plugin's settings only for `.volatile()` fields and hands `apply` a
 * `Volatile` box per field (unwrapped at the entry). Older schemastery builds
 * lack the method, so marking is conditional.
 */
function volatile<T extends z>(schema: T): T {
  const mark = (schema as unknown as { volatile?: () => T }).volatile
  return typeof mark === 'function' ? mark.call(schema) : schema
}

/** Cordis configuration schema. */
export const Config = z.object({
  baseURL: volatile(z.string().default(DEFAULT_MINO_BASE_URL)),
  model: volatile(z.string().default('')),
  editModel: volatile(z.string().default('')),
  size: volatile(z.string().default('1024x1024')),
  quality: volatile(z.string().default('')),
  cloudTimeoutMs: volatile(z.number().min(5_000).max(3_600_000).default(DEFAULT_CLOUD_TIMEOUT_MS)),
  saveToWorkspace: volatile(z.boolean().default(true)),
  workspaceFolder: volatile(z.string().default(DEFAULT_WORKSPACE_FOLDER)),
}) as unknown as z<Config>

/** The resolved channel for one tool call. */
export interface ResolvedChannel {
  baseURL: string
  model: string
  editModel: string
  size?: string
  quality?: string
}

/** Resolve the channel, failing loudly on the one field with no safe default. */
export function resolveChannel(config: Config): ResolvedChannel {
  const baseURL = config.baseURL?.trim() || DEFAULT_MINO_BASE_URL
  const model = config.model?.trim() ?? ''
  if (model.length === 0) {
    throw new Error('图像模型未配置：请前往 设置 > 插件 > Mino 图像生成 填写模型（例如在 Mino 后台开通的图像模型 id）。')
  }
  const editModel = config.editModel?.trim() || model
  const size = config.size?.trim()
  const quality = config.quality?.trim()
  return {
    baseURL,
    model,
    editModel,
    ...(size === undefined || size.length === 0 ? {} : { size }),
    ...(quality === undefined || quality.length === 0 ? {} : { quality }),
  }
}
