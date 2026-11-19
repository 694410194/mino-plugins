/** OpenAI Images API adapter for the Mino channel (generations + multipart edits). */
import type { ImageMediaType } from '@deepseek-ai/dsh-attachment';
export interface GeneratedImage {
    data: Uint8Array;
    mediaType: ImageMediaType;
}
export interface ReferenceImage {
    data: Uint8Array;
    mediaType: ImageMediaType;
}
/** HTTP failure carrying the response status so callers can drop rejected grants. */
export declare class HttpStatusError extends Error {
    readonly status: number;
    constructor(message: string, status: number);
}
interface RequestAuth {
    /** Credential sent as Bearer and echoed into `x-dsh-auth-token`. */
    headers: Record<string, string>;
    /** Raw token, passed to the secret redactor only. */
    token: string;
}
/** POST {baseURL}/images/generations and decode the first image result. */
export declare function generateMinoImage(input: {
    auth: RequestAuth;
    baseURL: string;
    model: string;
    prompt: string;
    size?: string;
    quality?: string;
    maxBytes: number;
    signal: AbortSignal;
}): Promise<GeneratedImage>;
/** POST {baseURL}/images/edits as an OpenAI multipart form with reference uploads. */
export declare function editMinoImage(input: {
    auth: RequestAuth;
    baseURL: string;
    model: string;
    prompt: string;
    sourceImages: ReferenceImage[];
    size?: string;
    quality?: string;
    maxBytes: number;
    signal: AbortSignal;
}): Promise<GeneratedImage>;
export {};
