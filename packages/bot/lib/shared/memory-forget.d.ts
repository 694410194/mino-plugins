import { z } from 'zod';
export declare const forgetSelectionSchema: z.ZodObject<{
    memoryId: z.ZodUUID;
    mode: z.ZodEnum<{
        version: "version";
        related: "related";
    }>;
}, z.core.$strict>;
export declare const forgetPreviewSchema: z.ZodObject<{
    previewRevision: z.ZodUUID;
    memoryId: z.ZodUUID;
    mode: z.ZodEnum<{
        version: "version";
        related: "related";
    }>;
    revision: z.ZodNumber;
    targets: z.ZodArray<z.ZodUUID>;
    sessionIds: z.ZodArray<z.ZodString>;
    affectedBots: z.ZodOptional<z.ZodNumber>;
    derivatives: z.ZodOptional<z.ZodNumber>;
    versions: z.ZodNumber;
    historyNodes: z.ZodNumber;
    summaries: z.ZodNumber;
    copies: z.ZodNumber;
    pendingMessages: z.ZodNumber;
    conservative: z.ZodBoolean;
    rootInstructions: z.ZodBoolean;
}, z.core.$strict>;
export declare const forgetChoiceSchema: z.ZodObject<{
    previewRevision: z.ZodUUID;
    choice: z.ZodEnum<{
        stop: "stop";
        clean: "clean";
    }>;
}, z.core.$strict>;
export declare const cleanupReasonSchema: z.ZodEnum<{
    unavailable: "unavailable";
    copies: "copies";
    history: "history";
    "system-head": "system-head";
    inbox: "inbox";
    "root-instructions": "root-instructions";
    "raw-read-policy": "raw-read-policy";
    inventory: "inventory";
    flush: "flush";
}>;
export declare const forgetJobSchema: z.ZodObject<{
    id: z.ZodUUID;
    targets: z.ZodArray<z.ZodUUID>;
    sessionIds: z.ZodArray<z.ZodString>;
    epoch: z.ZodNumber;
    revision: z.ZodNumber;
    choice: z.ZodEnum<{
        stop: "stop";
        clean: "clean";
    }>;
    phase: z.ZodEnum<{
        intent: "intent";
        stopped: "stopped";
        cleaning: "cleaning";
        blocked: "blocked";
        verified: "verified";
    }>;
    reasons: z.ZodArray<z.ZodEnum<{
        unavailable: "unavailable";
        copies: "copies";
        history: "history";
        "system-head": "system-head";
        inbox: "inbox";
        "root-instructions": "root-instructions";
        "raw-read-policy": "raw-read-policy";
        inventory: "inventory";
        flush: "flush";
    }>>;
    historyVerified: z.ZodArray<z.ZodString>;
    copiesVerified: z.ZodBoolean;
    verificationReceipt: z.ZodOptional<z.ZodUUID>;
    blockedHeads: z.ZodOptional<z.ZodArray<z.ZodString>>;
    pendingInbox: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strict>;
export declare const cleanupStatusSchema: z.ZodObject<{
    id: z.ZodUUID;
    stopped: z.ZodBoolean;
    strong: z.ZodBoolean;
    phase: z.ZodEnum<{
        intent: "intent";
        stopped: "stopped";
        cleaning: "cleaning";
        blocked: "blocked";
        verified: "verified";
    }>;
    reasons: z.ZodArray<z.ZodEnum<{
        unavailable: "unavailable";
        copies: "copies";
        history: "history";
        "system-head": "system-head";
        inbox: "inbox";
        "root-instructions": "root-instructions";
        "raw-read-policy": "raw-read-policy";
        inventory: "inventory";
        flush: "flush";
    }>>;
    sessions: z.ZodNumber;
}, z.core.$strict>;
export declare const rootInstructionsSchema: z.ZodObject<{
    root: z.ZodString;
    files: z.ZodArray<z.ZodObject<{
        path: z.ZodString;
        state: z.ZodEnum<{
            unknown: "unknown";
            present: "present";
            absent: "absent";
        }>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type ForgetPreview = z.output<typeof forgetPreviewSchema>;
export type ForgetChoice = z.output<typeof forgetChoiceSchema>;
export type ForgetSelection = z.output<typeof forgetSelectionSchema>;
export type ForgetJob = z.output<typeof forgetJobSchema>;
export type CleanupStatus = z.output<typeof cleanupStatusSchema>;
export type CleanupReason = z.output<typeof cleanupReasonSchema>;
export type RootInstructions = z.output<typeof rootInstructionsSchema>;
