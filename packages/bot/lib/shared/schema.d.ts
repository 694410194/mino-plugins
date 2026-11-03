import { z } from 'zod';
export declare const MEMORY_MAX_BYTES: number;
export declare const AVATAR_MAX_BYTES: number;
/** Reviewed palette IDs; the first four retain their legacy theme-alias IDs. */
export declare const AVATAR_COLOR_TOKENS: readonly ["--dsw-alias-state-business-primary", "--dsw-alias-state-success-primary", "--dsw-alias-state-warn-label", "--dsw-alias-state-error-primary", "teal", "cyan", "indigo", "purple", "rose", "orange", "olive", "slate"];
export declare const avatarColorSchema: z.ZodEnum<{
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
}>;
export type AvatarColor = z.infer<typeof avatarColorSchema>;
export declare const AVATAR_VARIANTS: readonly ["classic", "glasses", "spout", "baby", "hat", "sleeping"];
export type WhaleVariant = (typeof AVATAR_VARIANTS)[number];
export declare const avatarVariantSchema: z.ZodEnum<{
    classic: "classic";
    glasses: "glasses";
    spout: "spout";
    baby: "baby";
    hat: "hat";
    sleeping: "sleeping";
    auto: "auto";
}>;
export type AvatarVariant = z.infer<typeof avatarVariantSchema>;
export declare const MEMORY_LIST_MAX_LIMIT = 200;
export declare const BOT_NAME_MAX_CHARS = 64;
export declare const PERSONA_PREFIX_MAX_BYTES: number;
export declare const utf8Bytes: (text: string) => number;
/** Equality only: preserve the original text in storage, including its case. */
export declare const normalizeMemoryContent: (text: string) => string;
export interface MemorySaveResult {
    id: string;
    deduplicated: boolean;
}
export declare const timestampSchema: z.ZodNumber;
/** Existing example-seed rows remain valid; workspace identity is a separate row. */
export declare const botRegistryStateSchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<{
        pending: "pending";
        complete: "complete";
    }>>;
    botsWorkspaceId: z.ZodOptional<z.ZodString>;
    retiredCreationOperation: z.ZodOptional<z.ZodUUID>;
}, z.core.$strict>;
export declare const absoluteDirectorySchema: z.ZodString;
export declare const avatarSchema: z.ZodString;
export declare const mcpServerRefSchema: z.ZodObject<{
    serverName: z.ZodString;
    transport: z.ZodEnum<{
        stdio: "stdio";
        "streamable-http": "streamable-http";
    }>;
    command: z.ZodOptional<z.ZodString>;
    args: z.ZodOptional<z.ZodArray<z.ZodString>>;
    url: z.ZodOptional<z.ZodURL>;
    envRefs: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
}, z.core.$strict>;
export declare const channelBindingSchema: z.ZodObject<{
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
}, z.core.$strict>;
export declare const onboardingIntentSchema: z.ZodObject<{
    operationId: z.ZodUUID;
    language: z.ZodEnum<{
        en: "en";
        zh: "zh";
    }>;
    policyVersion: z.ZodLiteral<1>;
    inputDigest: z.ZodString;
}, z.core.$strict>;
export declare const botRecordFields: z.ZodObject<{
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
}, z.core.$strict>;
export declare const botSchema: z.ZodPipe<z.ZodObject<{
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
}, z.core.$strict>, z.ZodTransform<{
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
    avatar?: string | undefined;
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
}, {
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
    avatar?: string | undefined;
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
}>>;
export declare const botCreateSchema: z.ZodObject<{
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
/** Patches replace whole top-level fields; identity and metadata are never writable.
 * JSON cannot carry undefined properties, so optional top-level fields also accept
 * null as an explicit clear. Keep null on the wire and normalize only on the Host.
 */
declare const botPatchFields: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    avatar: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    avatarColor: z.ZodOptional<z.ZodOptional<z.ZodEnum<{
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
    }>>>;
    avatarVariant: z.ZodOptional<z.ZodOptional<z.ZodEnum<{
        classic: "classic";
        glasses: "glasses";
        spout: "spout";
        baby: "baby";
        hat: "hat";
        sleeping: "sleeping";
        auto: "auto";
    }>>>;
    description: z.ZodOptional<z.ZodString>;
    persona: z.ZodOptional<z.ZodObject<{
        prefix: z.ZodString;
        suffix: z.ZodOptional<z.ZodString>;
        complete: z.ZodOptional<z.ZodBoolean>;
    }, z.core.$strict>>;
    template: z.ZodOptional<z.ZodEnum<{
        standard: "standard";
        minimal: "minimal";
    }>>;
    model: z.ZodOptional<z.ZodOptional<z.ZodObject<{
        provider: z.ZodString;
        model: z.ZodString;
        reasoningEffort: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>>>;
    tools: z.ZodOptional<z.ZodObject<{
        deny: z.ZodArray<z.ZodString>;
    }, z.core.$strict>>;
    skills: z.ZodOptional<z.ZodObject<{
        extraDirs: z.ZodArray<z.ZodString>;
    }, z.core.$strict>>;
    memory: z.ZodOptional<z.ZodObject<{
        enabled: z.ZodBoolean;
        injectLimit: z.ZodNumber;
    }, z.core.$strict>>;
    defaultCwd: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    mcpServers: z.ZodOptional<z.ZodArray<z.ZodObject<{
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
    channels: z.ZodOptional<z.ZodArray<z.ZodObject<{
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
    order: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
}, z.core.$strict>;
export declare const botPatchSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    persona: z.ZodOptional<z.ZodObject<{
        prefix: z.ZodString;
        suffix: z.ZodOptional<z.ZodString>;
        complete: z.ZodOptional<z.ZodBoolean>;
    }, z.core.$strict>>;
    template: z.ZodOptional<z.ZodEnum<{
        standard: "standard";
        minimal: "minimal";
    }>>;
    tools: z.ZodOptional<z.ZodObject<{
        deny: z.ZodArray<z.ZodString>;
    }, z.core.$strict>>;
    skills: z.ZodOptional<z.ZodObject<{
        extraDirs: z.ZodArray<z.ZodString>;
    }, z.core.$strict>>;
    memory: z.ZodOptional<z.ZodObject<{
        enabled: z.ZodBoolean;
        injectLimit: z.ZodNumber;
    }, z.core.$strict>>;
    mcpServers: z.ZodOptional<z.ZodArray<z.ZodObject<{
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
    channels: z.ZodOptional<z.ZodArray<z.ZodObject<{
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
    expectedCreatedAt: z.ZodOptional<z.ZodNumber>;
    expectedUpdatedAt: z.ZodOptional<z.ZodNumber>;
    avatar: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    avatarColor: z.ZodNullable<z.ZodOptional<z.ZodEnum<{
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
    }>>>;
    avatarVariant: z.ZodNullable<z.ZodOptional<z.ZodEnum<{
        classic: "classic";
        glasses: "glasses";
        spout: "spout";
        baby: "baby";
        hat: "hat";
        sleeping: "sleeping";
        auto: "auto";
    }>>>;
    model: z.ZodNullable<z.ZodOptional<z.ZodObject<{
        provider: z.ZodString;
        model: z.ZodString;
        reasoningEffort: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>>>;
    defaultCwd: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    order: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
}, z.core.$strict>;
export declare const botRemoveOptionsSchema: z.ZodObject<{
    deleteMemories: z.ZodDefault<z.ZodBoolean>;
    deleteHome: z.ZodDefault<z.ZodBoolean>;
    expectedCreatedAt: z.ZodOptional<z.ZodNumber>;
    expectedUpdatedAt: z.ZodOptional<z.ZodNumber>;
}, z.core.$strict>;
export type BotRemoveOptions = z.input<typeof botRemoveOptionsSchema>;
export declare const memoryFields: z.ZodObject<{
    kind: z.ZodEnum<{
        profile: "profile";
        preference: "preference";
        fact: "fact";
        note: "note";
    }>;
    content: z.ZodString;
    tags: z.ZodArray<z.ZodString>;
    pinned: z.ZodBoolean;
    source: z.ZodOptional<z.ZodObject<{
        sessionId: z.ZodOptional<z.ZodString>;
        at: z.ZodNumber;
        by: z.ZodEnum<{
            model: "model";
            user: "user";
        }>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export declare const memorySchema: z.ZodPipe<z.ZodObject<{
    kind: z.ZodEnum<{
        profile: "profile";
        preference: "preference";
        fact: "fact";
        note: "note";
    }>;
    content: z.ZodString;
    tags: z.ZodArray<z.ZodString>;
    pinned: z.ZodBoolean;
    source: z.ZodOptional<z.ZodObject<{
        sessionId: z.ZodOptional<z.ZodString>;
        at: z.ZodNumber;
        by: z.ZodEnum<{
            model: "model";
            user: "user";
        }>;
    }, z.core.$strict>>;
    id: z.ZodString;
    botId: z.ZodString;
    createdAt: z.ZodNumber;
    updatedAt: z.ZodNumber;
}, z.core.$strict>, z.ZodTransform<{
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
}, {
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
}>>;
export declare const memoryAddSchema: z.ZodObject<{
    content: z.ZodString;
    source: z.ZodOptional<z.ZodObject<{
        sessionId: z.ZodOptional<z.ZodString>;
        at: z.ZodNumber;
        by: z.ZodEnum<{
            model: "model";
            user: "user";
        }>;
    }, z.core.$strict>>;
    botId: z.ZodString;
    kind: z.ZodDefault<z.ZodEnum<{
        profile: "profile";
        preference: "preference";
        fact: "fact";
        note: "note";
    }>>;
    tags: z.ZodDefault<z.ZodArray<z.ZodString>>;
    pinned: z.ZodDefault<z.ZodBoolean>;
}, z.core.$strict>;
export declare const memoryPatchSchema: z.ZodObject<{
    kind: z.ZodOptional<z.ZodEnum<{
        profile: "profile";
        preference: "preference";
        fact: "fact";
        note: "note";
    }>>;
    content: z.ZodOptional<z.ZodString>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString>>;
    pinned: z.ZodOptional<z.ZodBoolean>;
    source: z.ZodOptional<z.ZodOptional<z.ZodObject<{
        sessionId: z.ZodOptional<z.ZodString>;
        at: z.ZodNumber;
        by: z.ZodEnum<{
            model: "model";
            user: "user";
        }>;
    }, z.core.$strict>>>;
}, z.core.$strict>;
/** Stable descending pin/time order, with ascending id as a deterministic tie-break. */
export declare const memoryCursorSchema: z.ZodObject<{
    pinned: z.ZodBoolean;
    updatedAt: z.ZodNumber;
    id: z.ZodString;
}, z.core.$strict>;
export declare const memoryListOptionsSchema: z.ZodObject<{
    query: z.ZodOptional<z.ZodString>;
    tag: z.ZodOptional<z.ZodString>;
    pinned: z.ZodOptional<z.ZodBoolean>;
    limit: z.ZodNumber;
    before: z.ZodOptional<z.ZodObject<{
        pinned: z.ZodBoolean;
        updatedAt: z.ZodNumber;
        id: z.ZodString;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type BotRecord = z.infer<typeof botSchema>;
export type BotCreateInput = z.input<typeof botCreateSchema>;
export type BotPatch = z.input<typeof botPatchSchema>;
export declare function normalizeBotPatch(patch: BotPatch): z.output<typeof botPatchFields>;
export type MemoryRecord = z.infer<typeof memorySchema>;
export type MemoryAddInput = z.input<typeof memoryAddSchema>;
export type MemoryPatch = z.input<typeof memoryPatchSchema>;
export type MemoryCursor = z.infer<typeof memoryCursorSchema>;
export type MemoryListOptions = z.input<typeof memoryListOptionsSchema>;
export {};
