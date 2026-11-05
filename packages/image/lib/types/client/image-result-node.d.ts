/**
 * Conversation node that keeps generated images outside Tool process folding:
 * each successful image tool result materializes one session-located Chat row
 * at the event that produced it, rebuilt from durable `meta` on replay.
 */
import type { ImageAttachmentRef } from '@deepseek-ai/dsh-attachment';
import type { ConversationMatch, ConversationNodeDefinition, ConversationStartMatch } from '@deepseek-ai/dsh-client-ui-conversation/client';
export declare const IMAGE_RESULT_NODE_KIND = "mino-image-result";
export interface ImageResultPresentation {
    readonly attachment: ImageAttachmentRef;
    readonly prompt: string;
    readonly provider: string;
    readonly model: string;
    readonly output: string;
    readonly savedTo?: string;
    /** Attachment ids of the edit sources when this image came from edit_image. */
    readonly sourceAttachmentIds?: readonly string[];
}
/** Data payload merged into ChatNodeDataMap under {@link IMAGE_RESULT_NODE_KIND}. */
export interface MinoImageResultData {
    readonly turn?: number;
    readonly results: readonly ImageResultPresentation[];
}
declare module '@deepseek-ai/dsh-client-ui-chat/client' {
    interface ChatNodeDataMap {
        /** Successful Mino image results rendered as their own conversation rows. */
        'mino-image-result': MinoImageResultData;
    }
}
interface ImageResultState {
    /** Owning conversation turn; PTC (run_code) sub-call results carry no turn. */
    readonly turn?: number;
    readonly results: readonly (ImageResultPresentation & {
        readonly seq: number;
    })[];
}
/** Default definition for the successful images from each Tool invocation. */
export declare const imageResultDefinition: ConversationNodeDefinition<ImageResultState>;
/** Give each image Tool result its own Chat row at the event that produced it. */
export declare function createImageResultDefinition(): ConversationNodeDefinition<ImageResultState>;
/** Parse the plugin-owned durable presentation metadata from a Tool result event. */
export declare function imageResultFromMeta(value: unknown): ImageResultPresentation | undefined;
/** Parse all successful images from either a single or batch Tool result meta. */
export declare function imageResultsFromMeta(value: unknown): readonly ImageResultPresentation[];
/** Parse an ImageAttachmentRef from the serialized meta payload. */
export declare function imageAttachment(value: unknown): ImageAttachmentRef | undefined;
export type { ConversationMatch, ConversationStartMatch };
