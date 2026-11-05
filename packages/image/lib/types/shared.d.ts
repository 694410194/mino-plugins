/** Shared route constants and wire shapes for the mino-image plugin. */
export declare const IMAGE_ROUTE = "/plugins/mino-image/image";
export declare const DELETE_ROUTE = "/plugins/mino-image/delete";
export declare const SAVE_WORKSPACE_ROUTE = "/plugins/mino-image/save-workspace";
/** Host route the conversation card calls for regenerate. */
export declare const GENERATE_ROUTE = "/plugins/mino-image/generate";
/** Presentation metadata kinds carried by tool results and result nodes. */
export declare const META_KIND = "mino-image";
export declare const META_KIND_BATCH = "mino-image-batch";
export declare const DEFAULT_CLOUD_TIMEOUT_MS = 120000;
export declare const DEFAULT_WORKSPACE_FOLDER = "mino-image";
export declare const DEFAULT_MINO_BASE_URL = "https://api.mino.baby/v1";
/** Body the client regenerate flow posts to GENERATE_ROUTE. */
export interface GenerateRouteRequest {
    prompt: string;
    model?: string;
    size?: string;
    quality?: string;
}
/** Body GENERATE_ROUTE returns on success. */
export interface GenerateRouteResponse {
    attachment: unknown;
    prompt: string;
    model: string;
    output: string;
    savedTo?: string;
    createdAt: number;
}
