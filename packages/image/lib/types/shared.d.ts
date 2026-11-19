/** Shared route constants and wire shapes for the dsh-image-gen plugin. */
export declare const IMAGE_ROUTE = "/plugins/dsh-image-gen/image";
export declare const DELETE_ROUTE = "/plugins/dsh-image-gen/delete";
export declare const SAVE_WORKSPACE_ROUTE = "/plugins/dsh-image-gen/save-workspace";
/** Host route the conversation card calls for regenerate. */
export declare const GENERATE_ROUTE = "/plugins/dsh-image-gen/generate";
/** Presentation metadata kinds carried by tool results and result nodes. */
export declare const META_KIND = "dsh-image-gen";
export declare const META_KIND_BATCH = "dsh-image-gen-batch";
export declare const DEFAULT_CLOUD_TIMEOUT_MS = 120000;
export declare const DEFAULT_WORKSPACE_FOLDER = "dsh-image-gen";
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
