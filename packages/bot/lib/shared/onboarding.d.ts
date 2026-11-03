import { z } from 'zod';
export declare const createForChatSchema: z.ZodObject<{
    operationId: z.ZodUUID;
    bot: z.ZodObject<{
        name: z.ZodString;
        avatar: z.ZodOptional<z.ZodString>;
        avatarColor: z.ZodOptional<z.ZodEnum<{
            "--dsw-alias-state-business-primary": "--dsw-alias-state-business-primary";
            "--dsw-alias-state-success-primary": "--dsw-alias-state-success-primary";
            "--dsw-alias-state-warn-label": "--dsw-alias-state-warn-label";
            "--dsw-alias-state-error-primary": "--dsw-alias-state-error-primary";
            teal: "teal";
            cyan: "cyan";
            indigo: "indigo";
            purple: "purple";
            rose: "rose";
            orange: "orange";
            olive: "olive";
            slate: "slate";
        }>>;
        avatarVariant: z.ZodOptional<z.ZodEnum<{
            classic: "classic";
            glasses: "glasses";
            spout: "spout";
            baby: "baby";
            hat: "hat";
            sleeping: "sleeping";
            auto: "auto";
        }>>;
        model: z.ZodOptional<z.ZodObject<{
            provider: z.ZodString;
            model: z.ZodString;
            reasoningEffort: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>>;
        defaultCwd: z.ZodOptional<z.ZodString>;
        order: z.ZodOptional<z.ZodNumber>;
        id: z.ZodString;
        description: z.ZodDefault<z.ZodString>;
        persona: z.ZodDefault<z.ZodObject<{
            prefix: z.ZodString;
            suffix: z.ZodOptional<z.ZodString>;
            complete: z.ZodOptional<z.ZodBoolean>;
        }, z.core.$strict>>;
        template: z.ZodDefault<z.ZodEnum<{
            standard: "standard";
            minimal: "minimal";
        }>>;
        tools: z.ZodDefault<z.ZodObject<{
            deny: z.ZodArray<z.ZodString>;
        }, z.core.$strict>>;
        skills: z.ZodDefault<z.ZodObject<{
            extraDirs: z.ZodArray<z.ZodString>;
        }, z.core.$strict>>;
        memory: z.ZodDefault<z.ZodObject<{
            enabled: z.ZodBoolean;
            injectLimit: z.ZodNumber;
        }, z.core.$strict>>;
        mcpServers: z.ZodDefault<z.ZodArray<z.ZodObject<{
            serverName: z.ZodString;
            transport: z.ZodEnum<{
                stdio: "stdio";
                "streamable-http": "streamable-http";
            }>;
            command: z.ZodOptional<z.ZodString>;
            args: z.ZodOptional<z.ZodArray<z.ZodString>>;
            url: z.ZodOptional<z.ZodURL>;
            envRefs: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        }, z.core.$strict>>>;
        channels: z.ZodDefault<z.ZodArray<z.ZodObject<{
            kind: z.ZodEnum<{
                feishu: "feishu";
                telegram: "telegram";
                slack: "slack";
                email: "email";
                desktop: "desktop";
            }>;
            target: z.ZodString;
            credentialRef: z.ZodOptional<z.ZodString>;
            policy: z.ZodObject<{
                quietHours: z.ZodOptional<z.ZodTuple<[z.ZodString, z.ZodString], null>>;
                dailyLimit: z.ZodNumber;
                cooldownSec: z.ZodNumber;
            }, z.core.$strict>;
        }, z.core.$strict>>>;
    }, z.core.$strict>;
    language: z.ZodEnum<{
        en: "en";
        zh: "zh";
    }>;
}, z.core.$strict>;
export type CreateForChatInput = z.input<typeof createForChatSchema>;
export declare const startOnboardingSchema: z.ZodObject<{
    botId: z.ZodString;
    operationId: z.ZodUUID;
    sessionId: z.ZodString;
}, z.core.$strict>;
export type StartOnboardingInput = z.input<typeof startOnboardingSchema>;
export declare const onboardingStatusSchema: z.ZodObject<{
    botId: z.ZodString;
    operationId: z.ZodOptional<z.ZodUUID>;
    sessionId: z.ZodOptional<z.ZodString>;
    state: z.ZodEnum<{
        pending: "pending";
        unavailable: "unavailable";
        dispatching: "dispatching";
        submitted: "submitted";
        completed: "completed";
        skipped: "skipped";
        failed: "failed";
        uncertain: "uncertain";
    }>;
    retryable: z.ZodBoolean;
    reason: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export type OnboardingStatus = z.output<typeof onboardingStatusSchema>;
