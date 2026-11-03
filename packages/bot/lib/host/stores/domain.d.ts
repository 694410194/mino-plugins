import type { Domain } from '@deepseek-ai/dsh-storage-domain';
import { z } from 'zod';
import { DshBotError, type DshBotErrorCode } from '../errors.js';
import type { BotRecord } from '../../shared/schema.js';
export declare const storedBotSchema: z.ZodObject<{
    name: z.ZodString;
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
    description: z.ZodString;
    persona: z.ZodObject<{
        prefix: z.ZodString;
        suffix: z.ZodOptional<z.ZodString>;
        complete: z.ZodOptional<z.ZodBoolean>;
    }, z.core.$strict>;
    template: z.ZodEnum<{
        standard: "standard";
        minimal: "minimal";
    }>;
    model: z.ZodOptional<z.ZodObject<{
        provider: z.ZodString;
        model: z.ZodString;
        reasoningEffort: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>>;
    tools: z.ZodObject<{
        deny: z.ZodArray<z.ZodString>;
    }, z.core.$strict>;
    skills: z.ZodObject<{
        extraDirs: z.ZodArray<z.ZodString>;
    }, z.core.$strict>;
    memory: z.ZodObject<{
        enabled: z.ZodBoolean;
        injectLimit: z.ZodNumber;
    }, z.core.$strict>;
    defaultCwd: z.ZodOptional<z.ZodString>;
    mcpServers: z.ZodArray<z.ZodObject<{
        serverName: z.ZodString;
        transport: z.ZodEnum<{
            stdio: "stdio";
            "streamable-http": "streamable-http";
        }>;
        command: z.ZodOptional<z.ZodString>;
        args: z.ZodOptional<z.ZodArray<z.ZodString>>;
        url: z.ZodOptional<z.ZodURL>;
        envRefs: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    }, z.core.$strict>>;
    channels: z.ZodArray<z.ZodObject<{
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
    }, z.core.$strict>>;
    order: z.ZodOptional<z.ZodNumber>;
    id: z.ZodString;
    createdAt: z.ZodNumber;
    updatedAt: z.ZodNumber;
    schemaVersion: z.ZodLiteral<1>;
    onboarding: z.ZodOptional<z.ZodObject<{
        operationId: z.ZodUUID;
        language: z.ZodEnum<{
            en: "en";
            zh: "zh";
        }>;
        policyVersion: z.ZodLiteral<1>;
        inputDigest: z.ZodString;
    }, z.core.$strict>>;
    avatar: z.ZodOptional<z.ZodUnknown>;
}, z.core.$strict>;
export type StoredBot = z.output<typeof storedBotSchema>;
export declare function publicBot(record: StoredBot): BotRecord;
export declare const invalidAvatar: (record: StoredBot) => boolean;
export declare const storedActivitySchema: z.ZodObject<{
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
    lastEventSeq: z.ZodOptional<z.ZodNumber>;
}, z.core.$strict>;
export type StoredActivity = z.output<typeof storedActivitySchema>;
export declare const botDomain: {
    name: string;
    version: number;
    tables: {
        bots: import("@deepseek-ai/dsh-storage-domain").DomainTableSpec<string, {
            name: string;
            description: string;
            persona: {
                prefix: string;
                suffix?: string | undefined;
                complete?: boolean | undefined;
            };
            template: "standard" | "minimal";
            tools: {
                deny: string[];
            };
            skills: {
                extraDirs: string[];
            };
            memory: {
                enabled: boolean;
                injectLimit: number;
            };
            mcpServers: {
                serverName: string;
                transport: "stdio" | "streamable-http";
                command?: string | undefined;
                args?: string[] | undefined;
                url?: string | undefined;
                envRefs?: Record<string, string> | undefined;
            }[];
            channels: {
                kind: "feishu" | "telegram" | "slack" | "email" | "desktop";
                target: string;
                policy: {
                    dailyLimit: number;
                    cooldownSec: number;
                    quietHours?: [string, string] | undefined;
                };
                credentialRef?: string | undefined;
            }[];
            id: string;
            createdAt: number;
            updatedAt: number;
            schemaVersion: 1;
            avatarColor?: "--dsw-alias-state-business-primary" | "--dsw-alias-state-success-primary" | "--dsw-alias-state-warn-label" | "--dsw-alias-state-error-primary" | "teal" | "cyan" | "indigo" | "purple" | "rose" | "orange" | "olive" | "slate" | undefined;
            avatarVariant?: "classic" | "glasses" | "spout" | "baby" | "hat" | "sleeping" | "auto" | undefined;
            model?: {
                provider: string;
                model: string;
                reasoningEffort?: string | undefined;
            } | undefined;
            defaultCwd?: string | undefined;
            order?: number | undefined;
            onboarding?: {
                operationId: string;
                language: "en" | "zh";
                policyVersion: 1;
                inputDigest: string;
            } | undefined;
            avatar?: unknown;
        }>;
        memories: import("@deepseek-ai/dsh-storage-domain").DomainTableSpec<string, {
            kind: "profile" | "preference" | "fact" | "note";
            content: string;
            tags: string[];
            pinned: boolean;
            id: string;
            botId: string;
            createdAt: number;
            updatedAt: number;
            source?: {
                at: number;
                by: "model" | "user";
                sessionId?: string | undefined;
            } | undefined;
        }>;
        registry_state: import("@deepseek-ai/dsh-storage-domain").DomainTableSpec<string, {
            status?: "pending" | "complete" | undefined;
            botsWorkspaceId?: string | undefined;
            retiredCreationOperation?: string | undefined;
        }>;
        activities: import("@deepseek-ai/dsh-storage-domain").DomainTableSpec<string, {
            sessionId: string;
            botId: string;
            lastMessage: {
                role: "user" | "assistant";
                preview: string;
                at: number;
            };
            updatedAt: number;
            botCreatedAt?: number | undefined;
            title?: string | undefined;
            firstUserPreview?: string | undefined;
            lastReadAt?: number | undefined;
            lastEventSeq?: number | undefined;
        }>;
    };
};
export declare const migrationBotDomain: {
    tables: {
        bots: import("@deepseek-ai/dsh-storage-domain").DomainTableSpec<string, {
            name: string;
            description: string;
            persona: {
                prefix: string;
                suffix?: string | undefined;
                complete?: boolean | undefined;
            };
            template: "standard" | "minimal";
            tools: {
                deny: string[];
            };
            skills: {
                extraDirs: string[];
            };
            memory: {
                enabled: boolean;
                injectLimit: number;
            };
            mcpServers: {
                serverName: string;
                transport: "stdio" | "streamable-http";
                command?: string | undefined;
                args?: string[] | undefined;
                url?: string | undefined;
                envRefs?: Record<string, string> | undefined;
            }[];
            channels: {
                kind: "feishu" | "telegram" | "slack" | "email" | "desktop";
                target: string;
                policy: {
                    dailyLimit: number;
                    cooldownSec: number;
                    quietHours?: [string, string] | undefined;
                };
                credentialRef?: string | undefined;
            }[];
            id: string;
            createdAt: number;
            updatedAt: number;
            schemaVersion: 1;
            avatarColor?: "--dsw-alias-state-business-primary" | "--dsw-alias-state-success-primary" | "--dsw-alias-state-warn-label" | "--dsw-alias-state-error-primary" | "teal" | "cyan" | "indigo" | "purple" | "rose" | "orange" | "olive" | "slate" | undefined;
            avatarVariant?: "classic" | "glasses" | "spout" | "baby" | "hat" | "sleeping" | "auto" | undefined;
            model?: {
                provider: string;
                model: string;
                reasoningEffort?: string | undefined;
            } | undefined;
            defaultCwd?: string | undefined;
            order?: number | undefined;
            onboarding?: {
                operationId: string;
                language: "en" | "zh";
                policyVersion: 1;
                inputDigest: string;
            } | undefined;
            avatar?: unknown;
        }>;
        memories: import("@deepseek-ai/dsh-storage-domain").DomainTableSpec<string, {
            kind: "profile" | "preference" | "fact" | "note";
            content: string;
            tags: string[];
            pinned: boolean;
            id: string;
            botId: string;
            createdAt: number;
            updatedAt: number;
            source?: {
                at: number;
                by: "model" | "user";
                sessionId?: string | undefined;
            } | undefined;
        } | {
            schemaVersion: 2;
            kind: "migration-fence";
            migrationId: string;
        }>;
        registry_state: import("@deepseek-ai/dsh-storage-domain").DomainTableSpec<string, {
            status?: "pending" | "complete" | undefined;
            botsWorkspaceId?: string | undefined;
            retiredCreationOperation?: string | undefined;
        }>;
        activities: import("@deepseek-ai/dsh-storage-domain").DomainTableSpec<string, {
            sessionId: string;
            botId: string;
            lastMessage: {
                role: "user" | "assistant";
                preview: string;
                at: number;
            };
            updatedAt: number;
            botCreatedAt?: number | undefined;
            title?: string | undefined;
            firstUserPreview?: string | undefined;
            lastReadAt?: number | undefined;
            lastEventSeq?: number | undefined;
        }>;
    };
    name: string;
    version: number;
};
export type MigrationBotDomain = Domain<typeof migrationBotDomain>;
export type BotDomain = Domain<typeof botDomain>;
export declare const writers: WeakMap<BotDomain, {
    tail: Promise<unknown>;
    closing: boolean;
    assertOwner?: () => void;
}>;
export declare function writer(domain: BotDomain): {
    tail: Promise<unknown>;
    closing: boolean;
    assertOwner?: () => void;
};
export declare function failure(error: unknown, missing?: DshBotErrorCode): DshBotError;
export declare function read<T>(operation: () => T): T;
export declare function write<T>(domain: BotDomain, operation: () => Promise<T>, missing?: DshBotErrorCode): Promise<T>;
export declare const nextTimestamp: (previous: number) => number;
export declare const compareId: (a: string, b: string) => 0 | 1 | -1;
export declare const missingBot: (id: string) => DshBotError;
export declare const missingMemory: () => DshBotError;
export declare function deleteBotMemories(domain: BotDomain, botId: string): Promise<number>;
export declare function deleteBotActivities(domain: BotDomain, botId: string): Promise<void>;
