import { z } from 'zod';
export declare const sourceSelectionSchema: z.ZodObject<{
    start: z.ZodNumber;
    end: z.ZodNumber;
    content: z.ZodString;
    kind: z.ZodEnum<{
        user_fact: "user_fact";
        user_event: "user_event";
    }>;
}, z.core.$strict>;
export interface AcceptedText {
    text: string;
    at: number;
    attachments: number;
}
/** Pure extraction contract, NOT a trusted entry adapter. Offsets are Unicode code points, end-exclusive. */
export declare function extractSource(message: AcceptedText, raw: unknown): {
    status: "candidate";
    reason: "ambiguous-source";
} | {
    status: "extractable";
    payload: {
        content: string;
        subject: string;
        factKey: string;
        qualifiers: {};
        valid: {
            from: number;
            to: null;
            basis: "message-default";
        };
        sourceExcerpt: string;
    };
};
/** Production path always fails closed until upstream supplies an unforgeable accepted-entry proof. */
export declare function prepareAutomaticShare(claimedReceipt: unknown, _selection: unknown): never;
