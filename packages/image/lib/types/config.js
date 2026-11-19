/** User-facing configuration for the single Mino image channel. */
import z from '@deepseek-ai/schemastery';
import { DEFAULT_CLOUD_TIMEOUT_MS, DEFAULT_MINO_BASE_URL, DEFAULT_WORKSPACE_FOLDER, } from './shared.js';
export { DEFAULT_CLOUD_TIMEOUT_MS, DEFAULT_MINO_BASE_URL, DEFAULT_WORKSPACE_FOLDER, } from './shared.js';
/**
 * Mark a schema field live for the host's settings form: the loader serves a
 * plugin's settings only for `.volatile()` fields and hands `apply` a
 * `Volatile` box per field (unwrapped at the entry). Older schemastery builds
 * lack the method, so marking is conditional.
 */
function volatile(schema) {
    const mark = schema.volatile;
    return typeof mark === 'function' ? mark.call(schema) : schema;
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
});
/** Resolve the channel, failing loudly on the one field with no safe default. */
export function resolveChannel(config) {
    const baseURL = config.baseURL?.trim() || DEFAULT_MINO_BASE_URL;
    const model = config.model?.trim() ?? '';
    if (model.length === 0) {
        throw new Error('图像模型未配置：请前往 设置 > 插件 > Mino 图像生成 填写模型（例如在 Mino 后台开通的图像模型 id）。');
    }
    const editModel = config.editModel?.trim() || model;
    const size = config.size?.trim();
    const quality = config.quality?.trim();
    return {
        baseURL,
        model,
        editModel,
        ...(size === undefined || size.length === 0 ? {} : { size }),
        ...(quality === undefined || quality.length === 0 ? {} : { quality }),
    };
}
//# sourceMappingURL=config.js.map