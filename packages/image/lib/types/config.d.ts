/** User-facing configuration for the single Mino image channel. */
import z from '@deepseek-ai/schemastery';
export { DEFAULT_CLOUD_TIMEOUT_MS, DEFAULT_MINO_BASE_URL, DEFAULT_WORKSPACE_FOLDER, } from './shared.js';
/** Bundle configuration from the profile patch and the Web settings page. */
export interface Config {
    /**
     * OpenAI-compatible inference base URL the Mino account token resolves
     * against. Deployments only change this for staging or self-hosted
     * gateways; the account service resolves tokens by request origin.
     */
    baseURL?: string;
    /** Image model id on the configured gateway (e.g. nano-banana, gpt-image). */
    model?: string;
    /** Optional separate model for edits; empty reuses `model`. */
    editModel?: string;
    /** Dimensions or size tier sent as the Images API `size` field. */
    size?: string;
    /** Vendor quality tier sent when set; empty omits the field. */
    quality?: string;
    /** Cloud request timeout in milliseconds. */
    cloudTimeoutMs?: number;
    /** Also write every generated image as a file under the session workspace. */
    saveToWorkspace?: boolean;
    /** Workspace subfolder for generated images; empty means the workspace root. */
    workspaceFolder?: string;
}
/** Cordis configuration schema. */
export declare const Config: z<Config>;
/** The resolved channel for one tool call. */
export interface ResolvedChannel {
    baseURL: string;
    model: string;
    editModel: string;
    size?: string;
    quality?: string;
}
/** Resolve the channel, failing loudly on the one field with no safe default. */
export declare function resolveChannel(config: Config): ResolvedChannel;
