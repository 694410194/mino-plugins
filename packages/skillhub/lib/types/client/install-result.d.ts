import { z } from 'zod';
declare const schema: z.ZodObject<{
    schemaVersion: z.ZodLiteral<1>;
    kind: z.ZodLiteral<"skillhub-install">;
    status: z.ZodLiteral<"accepted">;
    toolCallId: z.ZodString;
    operationId: z.ZodUUID;
    hostInstanceId: z.ZodUUID;
    namespace: z.ZodString;
    slug: z.ZodString;
    version: z.ZodString;
    targetLabel: z.ZodString;
    sourceLabel: z.ZodString;
    sourceRevision: z.ZodUUID;
    hostLabel: z.ZodString;
    createdAt: z.ZodISODateTime;
}, z.core.$strict>;
export type InstallResult = z.infer<typeof schema>;
declare const failureSchema: z.ZodObject<{
    schemaVersion: z.ZodLiteral<1>;
    kind: z.ZodLiteral<"skillhub-install">;
    status: z.ZodLiteral<"not-confirmed">;
    toolCallId: z.ZodString;
    code: z.ZodEnum<{
        RATE_LIMITED: "RATE_LIMITED";
        CONTEXT_STALE: "CONTEXT_STALE";
        REQUEST_CONFLICT: "REQUEST_CONFLICT";
        SOURCE_NOT_CONFIGURED: "SOURCE_NOT_CONFIGURED";
        SOURCE_DENIED: "SOURCE_DENIED";
        SKILL_UNAVAILABLE: "SKILL_UNAVAILABLE";
        SOURCE_UNAVAILABLE: "SOURCE_UNAVAILABLE";
        TARGET_UNAVAILABLE: "TARGET_UNAVAILABLE";
        UNCONFIRMED: "UNCONFIRMED";
    }>;
}, z.core.$strict>;
export type InstallFailure = z.infer<typeof failureSchema>;
export declare function parseInstallFailure(value: unknown): InstallFailure | undefined;
/** History can identify an existing operation but can never authorize a write. */
export declare function parseInstallResult(value: unknown): InstallResult | undefined;
declare const pendingSchema: z.ZodObject<{
    version: z.ZodString;
    kind: z.ZodLiteral<"skillhub-install">;
    slug: z.ZodString;
    namespace: z.ZodString;
    schemaVersion: z.ZodLiteral<1>;
    toolCallId: z.ZodString;
    sourceRevision: z.ZodUUID;
    sourceLabel: z.ZodString;
    createdAt: z.ZodISODateTime;
    status: z.ZodLiteral<"awaiting-confirmation">;
    selectionRef: z.ZodUUID;
}, z.core.$strict>;
export type PendingInstallResult = z.infer<typeof pendingSchema>;
/** A pending history snapshot can only open a still-valid Host choice, never restore authorization. */
export declare function parsePendingInstallResult(value: unknown): PendingInstallResult | undefined;
export declare function isCancelledInstallResult(value: unknown): boolean;
export {};
