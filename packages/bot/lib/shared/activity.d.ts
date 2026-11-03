import { z } from 'zod';
export declare const ACTIVITY_PREVIEW_MAX_CHARS = 120;
/** Reserved wire/persistence sentinel. Clients localize this value, including
 * the legacy T08c Chinese marker, for both preview and sanitized titles. */
export declare const ACTIVITY_HIDDEN_PREVIEW = "[dsh-bot:hidden]";
export declare function isHiddenActivityPreview(value: string | undefined): boolean;
export declare const activitySessionIdSchema: z.ZodString;
export declare const activityMessageSchema: z.ZodObject<{
    role: z.ZodEnum<{
        user: "user";
        assistant: "assistant";
    }>;
    preview: z.ZodString;
    at: z.ZodNumber;
}, z.core.$strict>;
export declare const activityRecordSchema: z.ZodObject<{
    sessionId: z.ZodString;
    botId: z.ZodString;
    botCreatedAt: z.ZodOptional<z.ZodNumber>;
    title: z.ZodOptional<z.ZodString>;
    firstUserPreview: z.ZodOptional<z.ZodString>;
    lastMessage: z.ZodObject<{
        role: z.ZodEnum<{
            user: "user";
            assistant: "assistant";
        }>;
        preview: z.ZodString;
        at: z.ZodNumber;
    }, z.core.$strict>;
    updatedAt: z.ZodNumber;
    lastReadAt: z.ZodOptional<z.ZodNumber>;
}, z.core.$strict>;
export declare const activitySessionSchema: z.ZodObject<{
    sessionId: z.ZodString;
    botId: z.ZodString;
    botCreatedAt: z.ZodOptional<z.ZodNumber>;
    title: z.ZodOptional<z.ZodString>;
    firstUserPreview: z.ZodOptional<z.ZodString>;
    lastMessage: z.ZodObject<{
        role: z.ZodEnum<{
            user: "user";
            assistant: "assistant";
        }>;
        preview: z.ZodString;
        at: z.ZodNumber;
    }, z.core.$strict>;
    updatedAt: z.ZodNumber;
    lastReadAt: z.ZodOptional<z.ZodNumber>;
    unread: z.ZodBoolean;
}, z.core.$strict>;
export declare const activityListOptionsSchema: z.ZodObject<{
    botId: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export declare const activityBotSchema: z.ZodObject<{
    botId: z.ZodString;
    lastActivityAt: z.ZodNumber;
    unreadCount: z.ZodNumber;
    latest: z.ZodOptional<z.ZodObject<{
        role: z.ZodEnum<{
            user: "user";
            assistant: "assistant";
        }>;
        preview: z.ZodString;
        at: z.ZodNumber;
        sessionId: z.ZodString;
    }, z.core.$strict>>;
}, z.core.$strict>;
export declare const activityListResultSchema: z.ZodObject<{
    sessions: z.ZodArray<z.ZodObject<{
        sessionId: z.ZodString;
        botId: z.ZodString;
        botCreatedAt: z.ZodOptional<z.ZodNumber>;
        title: z.ZodOptional<z.ZodString>;
        firstUserPreview: z.ZodOptional<z.ZodString>;
        lastMessage: z.ZodObject<{
            role: z.ZodEnum<{
                user: "user";
                assistant: "assistant";
            }>;
            preview: z.ZodString;
            at: z.ZodNumber;
        }, z.core.$strict>;
        updatedAt: z.ZodNumber;
        lastReadAt: z.ZodOptional<z.ZodNumber>;
        unread: z.ZodBoolean;
    }, z.core.$strict>>;
    bots: z.ZodArray<z.ZodObject<{
        botId: z.ZodString;
        lastActivityAt: z.ZodNumber;
        unreadCount: z.ZodNumber;
        latest: z.ZodOptional<z.ZodObject<{
            role: z.ZodEnum<{
                user: "user";
                assistant: "assistant";
            }>;
            preview: z.ZodString;
            at: z.ZodNumber;
            sessionId: z.ZodString;
        }, z.core.$strict>>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type ActivityRecord = z.output<typeof activityRecordSchema>;
export type ActivitySession = z.output<typeof activitySessionSchema>;
export type BotActivity = z.output<typeof activityBotSchema>;
export type ActivityListOptions = z.input<typeof activityListOptionsSchema>;
export type ActivityListResult = z.output<typeof activityListResultSchema>;
export declare function isActivityUnread(record: Pick<ActivityRecord, 'lastMessage' | 'lastReadAt'>): boolean;
