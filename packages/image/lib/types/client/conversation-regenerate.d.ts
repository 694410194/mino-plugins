import type { GenerateRouteRequest } from '../shared.js';
export interface RegeneratableImage {
    provider: string;
    model: string;
    output?: string | undefined;
}
/**
 * Build the plugin generate-route request that reproduces a conversation
 * image with an edited prompt. The output label `size(, quality=...)` the
 * host recorded is parsed back into request fields so the revision repeats
 * the same knobs.
 */
export declare function conversationRegenerateRequest(image: RegeneratableImage, prompt: string, remembered?: {
    ratio: string;
    quality: string;
} | undefined): GenerateRouteRequest;
