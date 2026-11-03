/** Hand-authored, browser-safe contract for the locked DSH release's public Typert API. */
import type { RemoteResult, RemoteStreamHandle } from '@deepseek-ai/dsh-typert-protocol';
import { z } from 'zod';
export type { ActivityRecord, ActivitySession, ActivityListResult } from './activity.js';
export declare const botStatusSchema: z.ZodObject<{
    id: z.ZodString;
    presetId: z.ZodString;
    mainSessionId: z.ZodOptional<z.ZodString>;
    warnings: z.ZodOptional<z.ZodArray<z.ZodEnum<{
        "avatar/invalid": "avatar/invalid";
    }>>>;
    preset: z.ZodObject<{
        state: z.ZodEnum<{
            ok: "ok";
            broken: "broken";
            missing: "missing";
        }>;
        reason: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>;
}, z.core.$strict>;
export declare const catalogInfoSchema: z.ZodObject<{
    presetIdPrefix: z.ZodString;
}, z.core.$strict>;
export type CatalogInfo = z.output<typeof catalogInfoSchema>;
export type BotStatus = z.output<typeof botStatusSchema>;
export declare const botHomeSchema: z.ZodObject<{
    path: z.ZodString;
}, z.core.$strict>;
export type BotHome = z.output<typeof botHomeSchema>;
export declare const botsWorkspaceSchema: z.ZodObject<{
    workspaceId: z.ZodString;
    path: z.ZodString;
}, z.core.$strict>;
export type BotsWorkspace = z.output<typeof botsWorkspaceSchema>;
export declare const botChangeSchema: z.ZodObject<{
    revision: z.ZodNumber;
}, z.core.$strict>;
export type BotChange = z.output<typeof botChangeSchema>;
export declare const memoryRemoteSaveSchema: z.ZodObject<{
    kind: z.ZodDefault<z.ZodEnum<{
        profile: "profile";
        preference: "preference";
        fact: "fact";
        note: "note";
    }>>;
    content: z.ZodString;
    tags: z.ZodDefault<z.ZodArray<z.ZodString>>;
    pinned: z.ZodDefault<z.ZodBoolean>;
}, z.core.$strict>;
export declare const memoryRemotePatchSchema: z.ZodObject<{
    kind: z.ZodOptional<z.ZodEnum<{
        profile: "profile";
        preference: "preference";
        fact: "fact";
        note: "note";
    }>>;
    content: z.ZodOptional<z.ZodString>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString>>;
    pinned: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strict>;
export declare const memoryRemoteListSchema: z.ZodObject<{
    pinned: z.ZodOptional<z.ZodBoolean>;
    tag: z.ZodOptional<z.ZodString>;
    before: z.ZodOptional<z.ZodObject<{
        pinned: z.ZodBoolean;
        updatedAt: z.ZodNumber;
        id: z.ZodString;
    }, z.core.$strict>>;
    limit: z.ZodOptional<z.ZodNumber>;
}, z.core.$strict>;
export declare const memoryRemoteSearchSchema: z.ZodObject<{
    pinned: z.ZodOptional<z.ZodBoolean>;
    tag: z.ZodOptional<z.ZodString>;
    before: z.ZodOptional<z.ZodObject<{
        pinned: z.ZodBoolean;
        updatedAt: z.ZodNumber;
        id: z.ZodString;
    }, z.core.$strict>>;
    limit: z.ZodOptional<z.ZodNumber>;
    query: z.ZodString;
}, z.core.$strict>;
export type MemoryRemoteSaveInput = z.input<typeof memoryRemoteSaveSchema>;
export type MemoryRemotePatch = z.input<typeof memoryRemotePatchSchema>;
export type MemoryRemoteListInput = z.input<typeof memoryRemoteListSchema>;
export type MemoryRemoteSearchInput = z.input<typeof memoryRemoteSearchSchema>;
type ParameterInput<Parameter> = Parameter extends {
    readonly codec: {
        readonly create: () => infer Schema extends z.ZodType;
    };
} ? z.input<Schema> : never;
type RequiredParameters<Parameters extends readonly unknown[]> = {
    -readonly [Index in keyof Parameters]: ParameterInput<Parameters[Index]>;
};
/** Optional final wire parameters remain optional in the business call signature. */
type MethodParameters<Parameters extends readonly unknown[]> = Parameters extends readonly [
    ...infer Required,
    infer Last
] ? Last extends {
    readonly acceptsUndefined: true;
} ? [...RequiredParameters<Required>, options?: Exclude<ParameterInput<Last>, undefined>] : RequiredParameters<Parameters> : [];
/** Signatures are derived from the same ordered schema tuples used by the codec. */
type HostMethods<Namespace extends string> = {
    [Endpoint in keyof typeof dshBotRemoteSpec.methods as (typeof dshBotRemoteSpec.methods)[Endpoint] extends {
        readonly implementation: infer Implementation extends string;
    } ? Endpoint extends `${Namespace}/${string}` ? Implementation : never : Endpoint extends `${Namespace}/${infer Method}` ? Method : never]: (typeof dshBotRemoteSpec.methods)[Endpoint] extends {
        readonly mode: 'stream';
    } ? (signal: AbortSignal) => AsyncIterable<z.output<ReturnType<(typeof dshBotRemoteSpec.methods)[Endpoint]['result']['create']>>> : (...args: MethodParameters<(typeof dshBotRemoteSpec.methods)[Endpoint]['parameters']>) => Promise<z.output<ReturnType<(typeof dshBotRemoteSpec.methods)[Endpoint]['result']['create']>>>;
};
export type DshBotMethods = HostMethods<'dshBot'>;
export type DshBotMemoryMethods = HostMethods<'dshBot.memory'>;
export type DshBotActivityMethods = HostMethods<'dshBot.activity'>;
type RemoteMethods<Namespace extends string> = {
    [Endpoint in keyof typeof dshBotRemoteSpec.methods as Endpoint extends `${Namespace}/${infer Method}` ? Method : never]: (typeof dshBotRemoteSpec.methods)[Endpoint] extends {
        readonly mode: 'stream';
    } ? (signal?: AbortSignal) => RemoteStreamHandle<z.output<ReturnType<(typeof dshBotRemoteSpec.methods)[Endpoint]['result']['create']>>, never> : (...args: RequiredParameters<(typeof dshBotRemoteSpec.methods)[Endpoint]['parameters']>) => Promise<RemoteResult<z.output<ReturnType<(typeof dshBotRemoteSpec.methods)[Endpoint]['result']['create']>>>>;
};
export type DshBotMemoryRemoteMethods = RemoteMethods<'dshBot.memory'>;
export type DshBotActivityRemoteMethods = RemoteMethods<'dshBot.activity'>;
export type DshBotRemoteMethods = RemoteMethods<'dshBot'> & {
    memory: DshBotMemoryRemoteMethods;
    activity: DshBotActivityRemoteMethods;
};
type DshBotRemoteEndpoints = {
    [Method in keyof RemoteMethods<'dshBot'> as `dshBot/${Method}`]: RemoteMethods<'dshBot'>[Method];
} & {
    [Method in keyof DshBotMemoryRemoteMethods as `dshBot.memory/${Method}`]: DshBotMemoryRemoteMethods[Method];
} & {
    [Method in keyof DshBotActivityRemoteMethods as `dshBot.activity/${Method}`]: DshBotActivityRemoteMethods[Method];
};
declare module '@deepseek-ai/dsh-typert-protocol' {
    interface TypertRemoteMap extends DshBotRemoteEndpoints {
    }
    interface TypertRemoteNamespaceMap {
        dshBot: DshBotRemoteMethods;
        'dshBot.memory': DshBotMemoryRemoteMethods;
        'dshBot.activity': DshBotActivityRemoteMethods;
    }
    interface RemoteErrorDetailsMap {
        'bot/not-found': Record<string, never>;
        'bot/conflict': Record<string, never>;
        'bot/invalid': Record<string, never>;
        'bot/preset-failed': Record<string, never>;
        'bot/rollback-failed': Record<string, never>;
        'bot/unavailable': Record<string, never>;
        'bot/home-cleanup-failed': Record<string, never>;
        'memory/not-found': Record<string, never>;
        'memory/too-large': Record<string, never>;
        'memory/rejected': Record<string, never>;
        'store/unavailable': Record<string, never>;
        'activity/not-found': Record<string, never>;
    }
}
/** Both Host descriptors and Client codecs are assembled from this single spec. */
export declare const dshBotRemoteSpec: {
    readonly package: "dsh-bot";
    readonly methods: {
        readonly 'dshBot/watch': {
            readonly mode: "stream";
            readonly parameters: readonly [];
            readonly cancellation: {
                readonly parameter: "signal";
            };
            readonly result: {
                encode: (value: unknown) => {
                    revision: number;
                };
                decode: (value: unknown) => {
                    revision: number;
                };
                mode: "strict";
                typeSymbol: string;
                create: () => z.ZodObject<{
                    revision: z.ZodNumber;
                }, z.core.$strict>;
            };
            readonly service: string;
            readonly invocation: {
                kind: "direct";
            };
        };
        readonly 'dshBot.activity/list': {
            readonly parameters: readonly [];
            readonly result: {
                encode: (value: unknown) => {
                    sessions: {
                        sessionId: string;
                        botId: string;
                        lastMessage: {
                            role: "user" | "assistant";
                            preview: string;
                            at: number;
                        };
                        updatedAt: number;
                        unread: boolean;
                        botCreatedAt?: number | undefined;
                        title?: string | undefined;
                        firstUserPreview?: string | undefined;
                        lastReadAt?: number | undefined;
                    }[];
                    bots: {
                        botId: string;
                        lastActivityAt: number;
                        unreadCount: number;
                        latest?: {
                            role: "user" | "assistant";
                            preview: string;
                            at: number;
                            sessionId: string;
                        } | undefined;
                    }[];
                };
                decode: (value: unknown) => {
                    sessions: {
                        sessionId: string;
                        botId: string;
                        lastMessage: {
                            role: "user" | "assistant";
                            preview: string;
                            at: number;
                        };
                        updatedAt: number;
                        unread: boolean;
                        botCreatedAt?: number | undefined;
                        title?: string | undefined;
                        firstUserPreview?: string | undefined;
                        lastReadAt?: number | undefined;
                    }[];
                    bots: {
                        botId: string;
                        lastActivityAt: number;
                        unreadCount: number;
                        latest?: {
                            role: "user" | "assistant";
                            preview: string;
                            at: number;
                            sessionId: string;
                        } | undefined;
                    }[];
                };
                mode: "strict";
                typeSymbol: string;
                create: () => z.ZodObject<{
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
            };
            readonly service: string;
            readonly invocation: {
                kind: "direct";
            };
        };
        readonly 'dshBot.activity/markRead': {
            readonly parameters: readonly [{
                name: string;
                source: "json";
                codec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodString;
                };
                strictCodec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodString;
                };
            }];
            readonly result: {
                encode: (value: unknown) => {
                    sessionId: string;
                    botId: string;
                    lastMessage: {
                        role: "user" | "assistant";
                        preview: string;
                        at: number;
                    };
                    updatedAt: number;
                    unread: boolean;
                    botCreatedAt?: number | undefined;
                    title?: string | undefined;
                    firstUserPreview?: string | undefined;
                    lastReadAt?: number | undefined;
                };
                decode: (value: unknown) => {
                    sessionId: string;
                    botId: string;
                    lastMessage: {
                        role: "user" | "assistant";
                        preview: string;
                        at: number;
                    };
                    updatedAt: number;
                    unread: boolean;
                    botCreatedAt?: number | undefined;
                    title?: string | undefined;
                    firstUserPreview?: string | undefined;
                    lastReadAt?: number | undefined;
                };
                mode: "strict";
                typeSymbol: string;
                create: () => z.ZodObject<{
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
            };
            readonly service: string;
            readonly invocation: {
                kind: "direct";
            };
        };
        readonly 'dshBot/list': {
            readonly parameters: readonly [];
            readonly result: {
                mode: "strict";
                typeSymbol: string;
                create: () => z.ZodArray<z.ZodPipe<z.ZodObject<{
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
                }>>>;
            };
            readonly service: string;
            readonly invocation: {
                kind: "direct";
            };
        };
        readonly 'dshBot/catalogInfo': {
            readonly parameters: readonly [];
            readonly result: {
                mode: "strict";
                typeSymbol: string;
                create: () => z.ZodObject<{
                    presetIdPrefix: z.ZodString;
                }, z.core.$strict>;
            };
            readonly service: string;
            readonly invocation: {
                kind: "direct";
            };
        };
        readonly 'dshBot/status': {
            readonly parameters: readonly [];
            readonly result: {
                mode: "strict";
                typeSymbol: string;
                create: () => z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    presetId: z.ZodString;
                    mainSessionId: z.ZodOptional<z.ZodString>;
                    warnings: z.ZodOptional<z.ZodArray<z.ZodEnum<{
                        "avatar/invalid": "avatar/invalid";
                    }>>>;
                    preset: z.ZodObject<{
                        state: z.ZodEnum<{
                            ok: "ok";
                            broken: "broken";
                            missing: "missing";
                        }>;
                        reason: z.ZodOptional<z.ZodString>;
                    }, z.core.$strict>;
                }, z.core.$strict>>;
            };
            readonly service: string;
            readonly invocation: {
                kind: "direct";
            };
        };
        readonly 'dshBot/get': {
            readonly parameters: readonly [{
                name: string;
                source: "json";
                codec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodString;
                };
                strictCodec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodString;
                };
            }];
            readonly result: {
                mode: "strict";
                typeSymbol: string;
                create: () => z.ZodPipe<z.ZodObject<{
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
            };
            readonly service: string;
            readonly invocation: {
                kind: "direct";
            };
        };
        readonly 'dshBot/openConversation': {
            readonly parameters: readonly [{
                name: string;
                source: "json";
                codec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodString;
                };
                strictCodec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodString;
                };
            }];
            readonly result: {
                encode: (value: unknown) => {
                    sessionId: string;
                };
                decode: (value: unknown) => {
                    sessionId: string;
                };
                mode: "strict";
                typeSymbol: string;
                create: () => z.ZodObject<{
                    sessionId: z.ZodString;
                }, z.core.$strict>;
            };
            readonly service: string;
            readonly invocation: {
                kind: "direct";
            };
        };
        readonly 'dshBot/ensureHome': {
            readonly parameters: readonly [{
                name: string;
                source: "json";
                codec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodString;
                };
                strictCodec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodString;
                };
            }];
            readonly result: {
                encode: (value: unknown) => {
                    path: string;
                };
                decode: (value: unknown) => {
                    path: string;
                };
                mode: "strict";
                typeSymbol: string;
                create: () => z.ZodObject<{
                    path: z.ZodString;
                }, z.core.$strict>;
            };
            readonly service: string;
            readonly invocation: {
                kind: "direct";
            };
        };
        readonly 'dshBot/ensureBotsWorkspace': {
            readonly parameters: readonly [];
            readonly result: {
                encode: (value: unknown) => {
                    workspaceId: string;
                    path: string;
                };
                decode: (value: unknown) => {
                    workspaceId: string;
                    path: string;
                };
                mode: "strict";
                typeSymbol: string;
                create: () => z.ZodObject<{
                    workspaceId: z.ZodString;
                    path: z.ZodString;
                }, z.core.$strict>;
            };
            readonly service: string;
            readonly invocation: {
                kind: "direct";
            };
        };
        readonly 'dshBot/createForChat': {
            readonly parameters: readonly [{
                name: string;
                source: "json";
                codec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodObject<{
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
                };
                strictCodec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodObject<{
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
                };
            }];
            readonly result: {
                mode: "strict";
                typeSymbol: string;
                create: () => z.ZodPipe<z.ZodObject<{
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
            };
            readonly service: string;
            readonly invocation: {
                kind: "direct";
            };
        };
        readonly 'dshBot/startOnboarding': {
            readonly parameters: readonly [{
                name: string;
                source: "json";
                codec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodObject<{
                        botId: z.ZodString;
                        operationId: z.ZodUUID;
                        sessionId: z.ZodString;
                    }, z.core.$strict>;
                };
                strictCodec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodObject<{
                        botId: z.ZodString;
                        operationId: z.ZodUUID;
                        sessionId: z.ZodString;
                    }, z.core.$strict>;
                };
            }];
            readonly result: {
                encode: (value: unknown) => {
                    botId: string;
                    state: "pending" | "unavailable" | "dispatching" | "submitted" | "completed" | "skipped" | "failed" | "uncertain";
                    retryable: boolean;
                    operationId?: string | undefined;
                    sessionId?: string | undefined;
                    reason?: string | undefined;
                };
                decode: (value: unknown) => {
                    botId: string;
                    state: "pending" | "unavailable" | "dispatching" | "submitted" | "completed" | "skipped" | "failed" | "uncertain";
                    retryable: boolean;
                    operationId?: string | undefined;
                    sessionId?: string | undefined;
                    reason?: string | undefined;
                };
                mode: "strict";
                typeSymbol: string;
                create: () => z.ZodObject<{
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
            };
            readonly service: string;
            readonly invocation: {
                kind: "direct";
            };
        };
        readonly 'dshBot/retryOnboarding': {
            readonly parameters: readonly [{
                name: string;
                source: "json";
                codec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodObject<{
                        botId: z.ZodString;
                        operationId: z.ZodUUID;
                        sessionId: z.ZodString;
                    }, z.core.$strict>;
                };
                strictCodec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodObject<{
                        botId: z.ZodString;
                        operationId: z.ZodUUID;
                        sessionId: z.ZodString;
                    }, z.core.$strict>;
                };
            }];
            readonly result: {
                encode: (value: unknown) => {
                    botId: string;
                    state: "pending" | "unavailable" | "dispatching" | "submitted" | "completed" | "skipped" | "failed" | "uncertain";
                    retryable: boolean;
                    operationId?: string | undefined;
                    sessionId?: string | undefined;
                    reason?: string | undefined;
                };
                decode: (value: unknown) => {
                    botId: string;
                    state: "pending" | "unavailable" | "dispatching" | "submitted" | "completed" | "skipped" | "failed" | "uncertain";
                    retryable: boolean;
                    operationId?: string | undefined;
                    sessionId?: string | undefined;
                    reason?: string | undefined;
                };
                mode: "strict";
                typeSymbol: string;
                create: () => z.ZodObject<{
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
            };
            readonly service: string;
            readonly invocation: {
                kind: "direct";
            };
        };
        readonly 'dshBot/onboardingStatus': {
            readonly parameters: readonly [{
                name: string;
                source: "json";
                codec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodString;
                };
                strictCodec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodString;
                };
            }];
            readonly result: {
                encode: (value: unknown) => {
                    botId: string;
                    state: "pending" | "unavailable" | "dispatching" | "submitted" | "completed" | "skipped" | "failed" | "uncertain";
                    retryable: boolean;
                    operationId?: string | undefined;
                    sessionId?: string | undefined;
                    reason?: string | undefined;
                };
                decode: (value: unknown) => {
                    botId: string;
                    state: "pending" | "unavailable" | "dispatching" | "submitted" | "completed" | "skipped" | "failed" | "uncertain";
                    retryable: boolean;
                    operationId?: string | undefined;
                    sessionId?: string | undefined;
                    reason?: string | undefined;
                };
                mode: "strict";
                typeSymbol: string;
                create: () => z.ZodObject<{
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
            };
            readonly service: string;
            readonly invocation: {
                kind: "direct";
            };
        };
        readonly 'dshBot/create': {
            readonly parameters: readonly [{
                name: string;
                source: "json";
                codec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodObject<{
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
                };
                strictCodec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodObject<{
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
                };
            }];
            readonly result: {
                mode: "strict";
                typeSymbol: string;
                create: () => z.ZodPipe<z.ZodObject<{
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
            };
            readonly service: string;
            readonly invocation: {
                kind: "direct";
            };
        };
        readonly 'dshBot/update': {
            readonly parameters: readonly [{
                name: string;
                source: "json";
                codec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodString;
                };
                strictCodec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodString;
                };
            }, {
                name: string;
                source: "json";
                codec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodObject<{
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
                };
                strictCodec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodObject<{
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
                };
            }];
            readonly result: {
                mode: "strict";
                typeSymbol: string;
                create: () => z.ZodPipe<z.ZodObject<{
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
            };
            readonly service: string;
            readonly invocation: {
                kind: "direct";
            };
        };
        readonly 'dshBot/duplicate': {
            readonly parameters: readonly [{
                name: string;
                source: "json";
                codec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodString;
                };
                strictCodec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodString;
                };
            }, {
                name: string;
                source: "json";
                codec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodString;
                };
                strictCodec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodString;
                };
            }];
            readonly result: {
                mode: "strict";
                typeSymbol: string;
                create: () => z.ZodPipe<z.ZodObject<{
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
            };
            readonly service: string;
            readonly invocation: {
                kind: "direct";
            };
        };
        readonly 'dshBot/delete': {
            readonly implementation: "remove";
            readonly parameters: readonly [{
                name: string;
                source: "json";
                codec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodString;
                };
                strictCodec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodString;
                };
            }, {
                readonly acceptsUndefined: true;
                readonly name: string;
                readonly source: "json";
                readonly codec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodOptional<z.ZodObject<{
                        deleteMemories: z.ZodDefault<z.ZodBoolean>;
                        deleteHome: z.ZodDefault<z.ZodBoolean>;
                        expectedCreatedAt: z.ZodOptional<z.ZodNumber>;
                        expectedUpdatedAt: z.ZodOptional<z.ZodNumber>;
                    }, z.core.$strict>>;
                };
                readonly strictCodec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodOptional<z.ZodObject<{
                        deleteMemories: z.ZodDefault<z.ZodBoolean>;
                        deleteHome: z.ZodDefault<z.ZodBoolean>;
                        expectedCreatedAt: z.ZodOptional<z.ZodNumber>;
                        expectedUpdatedAt: z.ZodOptional<z.ZodNumber>;
                    }, z.core.$strict>>;
                };
            }];
            readonly result: {
                mode: "strict";
                typeSymbol: string;
                create: () => z.ZodVoid;
            };
            readonly service: string;
            readonly invocation: {
                kind: "direct";
            };
        };
        readonly 'dshBot.memory/autoShareStatus': {
            readonly parameters: readonly [];
            readonly result: {
                encode: (value: unknown) => {
                    configured: boolean;
                    effectiveAutoShare: false;
                    reason: "unverifiable-user-input";
                    botDaily: number;
                    domainDaily: number;
                    timeZone: string;
                    revision: number;
                    shadow?: {
                        mode: "offline-only";
                        shadowEnabled: boolean;
                        offlineOrganizeEnabled: boolean;
                        opportunities: number;
                        candidates: number;
                        modelRequests: 0;
                        notifications: 0;
                        memoryWrites: 0;
                    } | undefined;
                    domainUsed?: number | undefined;
                };
                decode: (value: unknown) => {
                    configured: boolean;
                    effectiveAutoShare: false;
                    reason: "unverifiable-user-input";
                    botDaily: number;
                    domainDaily: number;
                    timeZone: string;
                    revision: number;
                    shadow?: {
                        mode: "offline-only";
                        shadowEnabled: boolean;
                        offlineOrganizeEnabled: boolean;
                        opportunities: number;
                        candidates: number;
                        modelRequests: 0;
                        notifications: 0;
                        memoryWrites: 0;
                    } | undefined;
                    domainUsed?: number | undefined;
                };
                mode: "strict";
                typeSymbol: string;
                create: () => z.ZodObject<{
                    shadow: z.ZodOptional<z.ZodObject<{
                        mode: z.ZodLiteral<"offline-only">;
                        shadowEnabled: z.ZodBoolean;
                        offlineOrganizeEnabled: z.ZodBoolean;
                        opportunities: z.ZodNumber;
                        candidates: z.ZodNumber;
                        modelRequests: z.ZodLiteral<0>;
                        notifications: z.ZodLiteral<0>;
                        memoryWrites: z.ZodLiteral<0>;
                    }, z.core.$strict>>;
                    domainUsed: z.ZodOptional<z.ZodNumber>;
                    configured: z.ZodBoolean;
                    effectiveAutoShare: z.ZodLiteral<false>;
                    reason: z.ZodLiteral<"unverifiable-user-input">;
                    botDaily: z.ZodNumber;
                    domainDaily: z.ZodNumber;
                    timeZone: z.ZodString;
                    revision: z.ZodNumber;
                }, z.core.$strict>;
            };
            readonly service: string;
            readonly invocation: {
                kind: "direct";
            };
        };
        readonly 'dshBot.memory/setAutoShare': {
            readonly parameters: readonly [{
                name: string;
                source: "json";
                codec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodObject<{
                        enabled: z.ZodBoolean;
                        expectedRevision: z.ZodNumber;
                    }, z.core.$strict>;
                };
                strictCodec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodObject<{
                        enabled: z.ZodBoolean;
                        expectedRevision: z.ZodNumber;
                    }, z.core.$strict>;
                };
            }];
            readonly result: {
                encode: (value: unknown) => {
                    configured: boolean;
                    effectiveAutoShare: false;
                    reason: "unverifiable-user-input";
                    botDaily: number;
                    domainDaily: number;
                    timeZone: string;
                    revision: number;
                    shadow?: {
                        mode: "offline-only";
                        shadowEnabled: boolean;
                        offlineOrganizeEnabled: boolean;
                        opportunities: number;
                        candidates: number;
                        modelRequests: 0;
                        notifications: 0;
                        memoryWrites: 0;
                    } | undefined;
                    domainUsed?: number | undefined;
                };
                decode: (value: unknown) => {
                    configured: boolean;
                    effectiveAutoShare: false;
                    reason: "unverifiable-user-input";
                    botDaily: number;
                    domainDaily: number;
                    timeZone: string;
                    revision: number;
                    shadow?: {
                        mode: "offline-only";
                        shadowEnabled: boolean;
                        offlineOrganizeEnabled: boolean;
                        opportunities: number;
                        candidates: number;
                        modelRequests: 0;
                        notifications: 0;
                        memoryWrites: 0;
                    } | undefined;
                    domainUsed?: number | undefined;
                };
                mode: "strict";
                typeSymbol: string;
                create: () => z.ZodObject<{
                    shadow: z.ZodOptional<z.ZodObject<{
                        mode: z.ZodLiteral<"offline-only">;
                        shadowEnabled: z.ZodBoolean;
                        offlineOrganizeEnabled: z.ZodBoolean;
                        opportunities: z.ZodNumber;
                        candidates: z.ZodNumber;
                        modelRequests: z.ZodLiteral<0>;
                        notifications: z.ZodLiteral<0>;
                        memoryWrites: z.ZodLiteral<0>;
                    }, z.core.$strict>>;
                    domainUsed: z.ZodOptional<z.ZodNumber>;
                    configured: z.ZodBoolean;
                    effectiveAutoShare: z.ZodLiteral<false>;
                    reason: z.ZodLiteral<"unverifiable-user-input">;
                    botDaily: z.ZodNumber;
                    domainDaily: z.ZodNumber;
                    timeZone: z.ZodString;
                    revision: z.ZodNumber;
                }, z.core.$strict>;
            };
            readonly service: string;
            readonly invocation: {
                kind: "direct";
            };
        };
        readonly 'dshBot.memory/query': {
            readonly parameters: readonly [{
                name: string;
                source: "json";
                codec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodObject<{
                        botId: z.ZodString;
                        scope: z.ZodEnum<{
                            shared: "shared";
                            private: "private";
                            quarantine: "quarantine";
                        }>;
                        view: z.ZodEnum<{
                            candidates: "candidates";
                            facts: "facts";
                            journal: "journal";
                            conflicts: "conflicts";
                            all: "all";
                        }>;
                        query: z.ZodOptional<z.ZodString>;
                        cursor: z.ZodOptional<z.ZodUUID>;
                        revision: z.ZodOptional<z.ZodNumber>;
                        at: z.ZodOptional<z.ZodNumber>;
                        recordedBefore: z.ZodOptional<z.ZodNumber>;
                        commitBefore: z.ZodOptional<z.ZodNumber>;
                        limit: z.ZodOptional<z.ZodNumber>;
                    }, z.core.$strict>;
                };
                strictCodec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodObject<{
                        botId: z.ZodString;
                        scope: z.ZodEnum<{
                            shared: "shared";
                            private: "private";
                            quarantine: "quarantine";
                        }>;
                        view: z.ZodEnum<{
                            candidates: "candidates";
                            facts: "facts";
                            journal: "journal";
                            conflicts: "conflicts";
                            all: "all";
                        }>;
                        query: z.ZodOptional<z.ZodString>;
                        cursor: z.ZodOptional<z.ZodUUID>;
                        revision: z.ZodOptional<z.ZodNumber>;
                        at: z.ZodOptional<z.ZodNumber>;
                        recordedBefore: z.ZodOptional<z.ZodNumber>;
                        commitBefore: z.ZodOptional<z.ZodNumber>;
                        limit: z.ZodOptional<z.ZodNumber>;
                    }, z.core.$strict>;
                };
            }];
            readonly result: {
                encode: (value: unknown) => {
                    revision: number;
                    rows: {
                        version: {
                            scope: "private";
                            ownerBotKey: {
                                botId: string;
                                botCreatedAt: number;
                            };
                            shard: {
                                botId: string;
                                botCreatedAt: number;
                            };
                            schemaVersion: 2;
                            memoryId: string;
                            versionId: string;
                            userScope: string;
                            contentRef: string;
                            revision: number;
                            commitSeq: number;
                            kind: "user_fact" | "user_event" | "bot_role" | "how_to_work";
                            recordedAt: number;
                            sourceRefs: {
                                sessionId?: string | undefined;
                                eventSeq?: number | undefined;
                                callId?: string | undefined;
                                parentVersionId?: string | undefined;
                                entryReceiptId?: string | undefined;
                                managementOpId?: string | undefined;
                            }[];
                            provenance: {
                                channel: "model" | "legacy" | "management";
                                bot: {
                                    botId: string;
                                    botCreatedAt: number;
                                };
                            };
                            trust: "candidate" | "user_stated" | "user_confirmed";
                            status: "proposed" | "active" | "disputed" | "superseded" | "expired" | "rejected" | "forgotten";
                            labels: {
                                readers: "shared" | {
                                    botId: string;
                                    botCreatedAt: number;
                                }[];
                                originTrust: "candidate" | "user_stated" | "user_confirmed";
                                sourceVersions: string[];
                                restrictions: ("secret" | "no-egress" | "pending-cleanup" | "revoked")[];
                                grants: string[];
                            };
                            legacyKind?: "profile" | "preference" | "fact" | "note" | undefined;
                        } | {
                            scope: "shared";
                            shard: "user" | {
                                botId: string;
                                botCreatedAt: number;
                            };
                            schemaVersion: 2;
                            memoryId: string;
                            versionId: string;
                            userScope: string;
                            contentRef: string;
                            revision: number;
                            commitSeq: number;
                            kind: "user_fact" | "user_event" | "bot_role" | "how_to_work";
                            recordedAt: number;
                            sourceRefs: {
                                sessionId?: string | undefined;
                                eventSeq?: number | undefined;
                                callId?: string | undefined;
                                parentVersionId?: string | undefined;
                                entryReceiptId?: string | undefined;
                                managementOpId?: string | undefined;
                            }[];
                            provenance: {
                                channel: "model" | "legacy" | "management";
                                bot: {
                                    botId: string;
                                    botCreatedAt: number;
                                };
                            };
                            trust: "candidate" | "user_stated" | "user_confirmed";
                            status: "proposed" | "active" | "disputed" | "superseded" | "expired" | "rejected" | "forgotten";
                            labels: {
                                readers: "shared" | {
                                    botId: string;
                                    botCreatedAt: number;
                                }[];
                                originTrust: "candidate" | "user_stated" | "user_confirmed";
                                sourceVersions: string[];
                                restrictions: ("secret" | "no-egress" | "pending-cleanup" | "revoked")[];
                                grants: string[];
                            };
                            legacyKind?: "profile" | "preference" | "fact" | "note" | undefined;
                        };
                        payload: {
                            content: string;
                            valid: {
                                from: number | null;
                                to: number | null;
                                basis: "unknown" | "explicit" | "message-default";
                            };
                            subject?: string | undefined;
                            factKey?: string | undefined;
                            qualifiers?: Record<string, string> | undefined;
                            sourceExcerpt?: string | undefined;
                            confirmation?: string | undefined;
                            localException?: boolean | undefined;
                            botSnapshot?: {
                                name: string;
                                avatar?: string | undefined;
                                avatarColor?: "--dsw-alias-state-business-primary" | "--dsw-alias-state-success-primary" | "--dsw-alias-state-warn-label" | "--dsw-alias-state-error-primary" | "teal" | "cyan" | "indigo" | "purple" | "rose" | "orange" | "olive" | "slate" | undefined;
                                avatarVariant?: "classic" | "glasses" | "spout" | "baby" | "hat" | "sleeping" | "auto" | undefined;
                            } | undefined;
                            legacy?: {
                                kind: "profile" | "preference" | "fact" | "note";
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
                            } | undefined;
                        };
                        state: "proposed" | "active" | "disputed" | "superseded" | "expired" | "rejected" | "forgotten";
                        deletedBot: boolean;
                        supersededBy?: string | undefined;
                    }[];
                    total: number;
                    next?: string | undefined;
                };
                decode: (value: unknown) => {
                    revision: number;
                    rows: {
                        version: {
                            scope: "private";
                            ownerBotKey: {
                                botId: string;
                                botCreatedAt: number;
                            };
                            shard: {
                                botId: string;
                                botCreatedAt: number;
                            };
                            schemaVersion: 2;
                            memoryId: string;
                            versionId: string;
                            userScope: string;
                            contentRef: string;
                            revision: number;
                            commitSeq: number;
                            kind: "user_fact" | "user_event" | "bot_role" | "how_to_work";
                            recordedAt: number;
                            sourceRefs: {
                                sessionId?: string | undefined;
                                eventSeq?: number | undefined;
                                callId?: string | undefined;
                                parentVersionId?: string | undefined;
                                entryReceiptId?: string | undefined;
                                managementOpId?: string | undefined;
                            }[];
                            provenance: {
                                channel: "model" | "legacy" | "management";
                                bot: {
                                    botId: string;
                                    botCreatedAt: number;
                                };
                            };
                            trust: "candidate" | "user_stated" | "user_confirmed";
                            status: "proposed" | "active" | "disputed" | "superseded" | "expired" | "rejected" | "forgotten";
                            labels: {
                                readers: "shared" | {
                                    botId: string;
                                    botCreatedAt: number;
                                }[];
                                originTrust: "candidate" | "user_stated" | "user_confirmed";
                                sourceVersions: string[];
                                restrictions: ("secret" | "no-egress" | "pending-cleanup" | "revoked")[];
                                grants: string[];
                            };
                            legacyKind?: "profile" | "preference" | "fact" | "note" | undefined;
                        } | {
                            scope: "shared";
                            shard: "user" | {
                                botId: string;
                                botCreatedAt: number;
                            };
                            schemaVersion: 2;
                            memoryId: string;
                            versionId: string;
                            userScope: string;
                            contentRef: string;
                            revision: number;
                            commitSeq: number;
                            kind: "user_fact" | "user_event" | "bot_role" | "how_to_work";
                            recordedAt: number;
                            sourceRefs: {
                                sessionId?: string | undefined;
                                eventSeq?: number | undefined;
                                callId?: string | undefined;
                                parentVersionId?: string | undefined;
                                entryReceiptId?: string | undefined;
                                managementOpId?: string | undefined;
                            }[];
                            provenance: {
                                channel: "model" | "legacy" | "management";
                                bot: {
                                    botId: string;
                                    botCreatedAt: number;
                                };
                            };
                            trust: "candidate" | "user_stated" | "user_confirmed";
                            status: "proposed" | "active" | "disputed" | "superseded" | "expired" | "rejected" | "forgotten";
                            labels: {
                                readers: "shared" | {
                                    botId: string;
                                    botCreatedAt: number;
                                }[];
                                originTrust: "candidate" | "user_stated" | "user_confirmed";
                                sourceVersions: string[];
                                restrictions: ("secret" | "no-egress" | "pending-cleanup" | "revoked")[];
                                grants: string[];
                            };
                            legacyKind?: "profile" | "preference" | "fact" | "note" | undefined;
                        };
                        payload: {
                            content: string;
                            valid: {
                                from: number | null;
                                to: number | null;
                                basis: "unknown" | "explicit" | "message-default";
                            };
                            subject?: string | undefined;
                            factKey?: string | undefined;
                            qualifiers?: Record<string, string> | undefined;
                            sourceExcerpt?: string | undefined;
                            confirmation?: string | undefined;
                            localException?: boolean | undefined;
                            botSnapshot?: {
                                name: string;
                                avatar?: string | undefined;
                                avatarColor?: "--dsw-alias-state-business-primary" | "--dsw-alias-state-success-primary" | "--dsw-alias-state-warn-label" | "--dsw-alias-state-error-primary" | "teal" | "cyan" | "indigo" | "purple" | "rose" | "orange" | "olive" | "slate" | undefined;
                                avatarVariant?: "classic" | "glasses" | "spout" | "baby" | "hat" | "sleeping" | "auto" | undefined;
                            } | undefined;
                            legacy?: {
                                kind: "profile" | "preference" | "fact" | "note";
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
                            } | undefined;
                        };
                        state: "proposed" | "active" | "disputed" | "superseded" | "expired" | "rejected" | "forgotten";
                        deletedBot: boolean;
                        supersededBy?: string | undefined;
                    }[];
                    total: number;
                    next?: string | undefined;
                };
                mode: "strict";
                typeSymbol: string;
                create: () => z.ZodObject<{
                    revision: z.ZodNumber;
                    rows: z.ZodArray<z.ZodObject<{
                        version: z.ZodUnion<readonly [z.ZodObject<{
                            scope: z.ZodLiteral<"private">;
                            ownerBotKey: z.ZodObject<{
                                botId: z.ZodString;
                                botCreatedAt: z.ZodNumber;
                            }, z.core.$strict>;
                            shard: z.ZodObject<{
                                botId: z.ZodString;
                                botCreatedAt: z.ZodNumber;
                            }, z.core.$strict>;
                            schemaVersion: z.ZodLiteral<2>;
                            memoryId: z.ZodUUID;
                            versionId: z.ZodUUID;
                            userScope: z.ZodUUID;
                            contentRef: z.ZodUUID;
                            revision: z.ZodNumber;
                            commitSeq: z.ZodNumber;
                            kind: z.ZodEnum<{
                                user_fact: "user_fact";
                                user_event: "user_event";
                                bot_role: "bot_role";
                                how_to_work: "how_to_work";
                            }>;
                            legacyKind: z.ZodOptional<z.ZodEnum<{
                                profile: "profile";
                                preference: "preference";
                                fact: "fact";
                                note: "note";
                            }>>;
                            recordedAt: z.ZodNumber;
                            sourceRefs: z.ZodArray<z.ZodObject<{
                                sessionId: z.ZodOptional<z.ZodString>;
                                eventSeq: z.ZodOptional<z.ZodNumber>;
                                callId: z.ZodOptional<z.ZodString>;
                                parentVersionId: z.ZodOptional<z.ZodUUID>;
                                entryReceiptId: z.ZodOptional<z.ZodUUID>;
                                managementOpId: z.ZodOptional<z.ZodUUID>;
                            }, z.core.$strict>>;
                            provenance: z.ZodObject<{
                                channel: z.ZodEnum<{
                                    model: "model";
                                    legacy: "legacy";
                                    management: "management";
                                }>;
                                bot: z.ZodObject<{
                                    botId: z.ZodString;
                                    botCreatedAt: z.ZodNumber;
                                }, z.core.$strict>;
                            }, z.core.$strict>;
                            trust: z.ZodEnum<{
                                candidate: "candidate";
                                user_stated: "user_stated";
                                user_confirmed: "user_confirmed";
                            }>;
                            status: z.ZodEnum<{
                                proposed: "proposed";
                                active: "active";
                                disputed: "disputed";
                                superseded: "superseded";
                                expired: "expired";
                                rejected: "rejected";
                                forgotten: "forgotten";
                            }>;
                            labels: z.ZodObject<{
                                readers: z.ZodUnion<readonly [z.ZodLiteral<"shared">, z.ZodArray<z.ZodObject<{
                                    botId: z.ZodString;
                                    botCreatedAt: z.ZodNumber;
                                }, z.core.$strict>>]>;
                                originTrust: z.ZodEnum<{
                                    candidate: "candidate";
                                    user_stated: "user_stated";
                                    user_confirmed: "user_confirmed";
                                }>;
                                sourceVersions: z.ZodArray<z.ZodUUID>;
                                restrictions: z.ZodArray<z.ZodEnum<{
                                    secret: "secret";
                                    "no-egress": "no-egress";
                                    "pending-cleanup": "pending-cleanup";
                                    revoked: "revoked";
                                }>>;
                                grants: z.ZodArray<z.ZodUUID>;
                            }, z.core.$strict>;
                        }, z.core.$strict>, z.ZodObject<{
                            scope: z.ZodLiteral<"shared">;
                            shard: z.ZodUnion<readonly [z.ZodLiteral<"user">, z.ZodObject<{
                                botId: z.ZodString;
                                botCreatedAt: z.ZodNumber;
                            }, z.core.$strict>]>;
                            schemaVersion: z.ZodLiteral<2>;
                            memoryId: z.ZodUUID;
                            versionId: z.ZodUUID;
                            userScope: z.ZodUUID;
                            contentRef: z.ZodUUID;
                            revision: z.ZodNumber;
                            commitSeq: z.ZodNumber;
                            kind: z.ZodEnum<{
                                user_fact: "user_fact";
                                user_event: "user_event";
                                bot_role: "bot_role";
                                how_to_work: "how_to_work";
                            }>;
                            legacyKind: z.ZodOptional<z.ZodEnum<{
                                profile: "profile";
                                preference: "preference";
                                fact: "fact";
                                note: "note";
                            }>>;
                            recordedAt: z.ZodNumber;
                            sourceRefs: z.ZodArray<z.ZodObject<{
                                sessionId: z.ZodOptional<z.ZodString>;
                                eventSeq: z.ZodOptional<z.ZodNumber>;
                                callId: z.ZodOptional<z.ZodString>;
                                parentVersionId: z.ZodOptional<z.ZodUUID>;
                                entryReceiptId: z.ZodOptional<z.ZodUUID>;
                                managementOpId: z.ZodOptional<z.ZodUUID>;
                            }, z.core.$strict>>;
                            provenance: z.ZodObject<{
                                channel: z.ZodEnum<{
                                    model: "model";
                                    legacy: "legacy";
                                    management: "management";
                                }>;
                                bot: z.ZodObject<{
                                    botId: z.ZodString;
                                    botCreatedAt: z.ZodNumber;
                                }, z.core.$strict>;
                            }, z.core.$strict>;
                            trust: z.ZodEnum<{
                                candidate: "candidate";
                                user_stated: "user_stated";
                                user_confirmed: "user_confirmed";
                            }>;
                            status: z.ZodEnum<{
                                proposed: "proposed";
                                active: "active";
                                disputed: "disputed";
                                superseded: "superseded";
                                expired: "expired";
                                rejected: "rejected";
                                forgotten: "forgotten";
                            }>;
                            labels: z.ZodObject<{
                                readers: z.ZodUnion<readonly [z.ZodLiteral<"shared">, z.ZodArray<z.ZodObject<{
                                    botId: z.ZodString;
                                    botCreatedAt: z.ZodNumber;
                                }, z.core.$strict>>]>;
                                originTrust: z.ZodEnum<{
                                    candidate: "candidate";
                                    user_stated: "user_stated";
                                    user_confirmed: "user_confirmed";
                                }>;
                                sourceVersions: z.ZodArray<z.ZodUUID>;
                                restrictions: z.ZodArray<z.ZodEnum<{
                                    secret: "secret";
                                    "no-egress": "no-egress";
                                    "pending-cleanup": "pending-cleanup";
                                    revoked: "revoked";
                                }>>;
                                grants: z.ZodArray<z.ZodUUID>;
                            }, z.core.$strict>;
                        }, z.core.$strict>]>;
                        payload: z.ZodObject<{
                            content: z.ZodString;
                            subject: z.ZodOptional<z.ZodString>;
                            factKey: z.ZodOptional<z.ZodString>;
                            qualifiers: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
                            valid: z.ZodObject<{
                                from: z.ZodNullable<z.ZodNumber>;
                                to: z.ZodNullable<z.ZodNumber>;
                                basis: z.ZodEnum<{
                                    unknown: "unknown";
                                    explicit: "explicit";
                                    "message-default": "message-default";
                                }>;
                            }, z.core.$strict>;
                            sourceExcerpt: z.ZodOptional<z.ZodString>;
                            confirmation: z.ZodOptional<z.ZodString>;
                            localException: z.ZodOptional<z.ZodBoolean>;
                            botSnapshot: z.ZodOptional<z.ZodObject<{
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
                            }, z.core.$strict>>;
                            legacy: z.ZodOptional<z.ZodObject<{
                                kind: z.ZodEnum<{
                                    profile: "profile";
                                    preference: "preference";
                                    fact: "fact";
                                    note: "note";
                                }>;
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
                            }, z.core.$strict>>;
                        }, z.core.$strict>;
                        state: z.ZodEnum<{
                            proposed: "proposed";
                            active: "active";
                            disputed: "disputed";
                            superseded: "superseded";
                            expired: "expired";
                            rejected: "rejected";
                            forgotten: "forgotten";
                        }>;
                        supersededBy: z.ZodOptional<z.ZodUUID>;
                        deletedBot: z.ZodBoolean;
                    }, z.core.$strict>>;
                    next: z.ZodOptional<z.ZodUUID>;
                    total: z.ZodNumber;
                }, z.core.$strict>;
            };
            readonly service: string;
            readonly invocation: {
                kind: "direct";
            };
        };
        readonly 'dshBot.memory/createManaged': {
            readonly parameters: readonly [{
                name: string;
                source: "json";
                codec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodObject<{
                        content: z.ZodString;
                        subject: z.ZodOptional<z.ZodString>;
                        factKey: z.ZodOptional<z.ZodString>;
                        qualifiers: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
                        valid: z.ZodObject<{
                            from: z.ZodNullable<z.ZodNumber>;
                            to: z.ZodNullable<z.ZodNumber>;
                            basis: z.ZodEnum<{
                                unknown: "unknown";
                                explicit: "explicit";
                                "message-default": "message-default";
                            }>;
                        }, z.core.$strict>;
                        localException: z.ZodOptional<z.ZodBoolean>;
                        botId: z.ZodString;
                        scope: z.ZodEnum<{
                            shared: "shared";
                            private: "private";
                        }>;
                        kind: z.ZodEnum<{
                            user_fact: "user_fact";
                            user_event: "user_event";
                            bot_role: "bot_role";
                            how_to_work: "how_to_work";
                        }>;
                        expectedRevision: z.ZodNumber;
                    }, z.core.$strict>;
                };
                strictCodec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodObject<{
                        content: z.ZodString;
                        subject: z.ZodOptional<z.ZodString>;
                        factKey: z.ZodOptional<z.ZodString>;
                        qualifiers: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
                        valid: z.ZodObject<{
                            from: z.ZodNullable<z.ZodNumber>;
                            to: z.ZodNullable<z.ZodNumber>;
                            basis: z.ZodEnum<{
                                unknown: "unknown";
                                explicit: "explicit";
                                "message-default": "message-default";
                            }>;
                        }, z.core.$strict>;
                        localException: z.ZodOptional<z.ZodBoolean>;
                        botId: z.ZodString;
                        scope: z.ZodEnum<{
                            shared: "shared";
                            private: "private";
                        }>;
                        kind: z.ZodEnum<{
                            user_fact: "user_fact";
                            user_event: "user_event";
                            bot_role: "bot_role";
                            how_to_work: "how_to_work";
                        }>;
                        expectedRevision: z.ZodNumber;
                    }, z.core.$strict>;
                };
            }];
            readonly result: {
                encode: (value: unknown) => string;
                decode: (value: unknown) => string;
                mode: "strict";
                typeSymbol: string;
                create: () => z.ZodUUID;
            };
            readonly service: string;
            readonly invocation: {
                kind: "direct";
            };
        };
        readonly 'dshBot.memory/revise': {
            readonly parameters: readonly [{
                name: string;
                source: "json";
                codec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodObject<{
                        id: z.ZodUUID;
                        expectedRevision: z.ZodNumber;
                        patch: z.ZodObject<{
                            content: z.ZodOptional<z.ZodString>;
                            subject: z.ZodOptional<z.ZodOptional<z.ZodString>>;
                            factKey: z.ZodOptional<z.ZodOptional<z.ZodString>>;
                            qualifiers: z.ZodOptional<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>>;
                            valid: z.ZodOptional<z.ZodObject<{
                                from: z.ZodNullable<z.ZodNumber>;
                                to: z.ZodNullable<z.ZodNumber>;
                                basis: z.ZodEnum<{
                                    unknown: "unknown";
                                    explicit: "explicit";
                                    "message-default": "message-default";
                                }>;
                            }, z.core.$strict>>;
                            localException: z.ZodOptional<z.ZodOptional<z.ZodBoolean>>;
                        }, z.core.$strict>;
                    }, z.core.$strict>;
                };
                strictCodec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodObject<{
                        id: z.ZodUUID;
                        expectedRevision: z.ZodNumber;
                        patch: z.ZodObject<{
                            content: z.ZodOptional<z.ZodString>;
                            subject: z.ZodOptional<z.ZodOptional<z.ZodString>>;
                            factKey: z.ZodOptional<z.ZodOptional<z.ZodString>>;
                            qualifiers: z.ZodOptional<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>>;
                            valid: z.ZodOptional<z.ZodObject<{
                                from: z.ZodNullable<z.ZodNumber>;
                                to: z.ZodNullable<z.ZodNumber>;
                                basis: z.ZodEnum<{
                                    unknown: "unknown";
                                    explicit: "explicit";
                                    "message-default": "message-default";
                                }>;
                            }, z.core.$strict>>;
                            localException: z.ZodOptional<z.ZodOptional<z.ZodBoolean>>;
                        }, z.core.$strict>;
                    }, z.core.$strict>;
                };
            }];
            readonly result: {
                encode: (value: unknown) => void;
                decode: (value: unknown) => void;
                mode: "strict";
                typeSymbol: string;
                create: () => z.ZodVoid;
            };
            readonly service: string;
            readonly invocation: {
                kind: "direct";
            };
        };
        readonly 'dshBot.memory/confirm': {
            readonly parameters: readonly [{
                name: string;
                source: "json";
                codec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodObject<{
                        id: z.ZodUUID;
                        expectedRevision: z.ZodNumber;
                        scope: z.ZodEnum<{
                            shared: "shared";
                            private: "private";
                        }>;
                        botId: z.ZodString;
                    }, z.core.$strict>;
                };
                strictCodec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodObject<{
                        id: z.ZodUUID;
                        expectedRevision: z.ZodNumber;
                        scope: z.ZodEnum<{
                            shared: "shared";
                            private: "private";
                        }>;
                        botId: z.ZodString;
                    }, z.core.$strict>;
                };
            }];
            readonly result: {
                encode: (value: unknown) => string;
                decode: (value: unknown) => string;
                mode: "strict";
                typeSymbol: string;
                create: () => z.ZodUUID;
            };
            readonly service: string;
            readonly invocation: {
                kind: "direct";
            };
        };
        readonly 'dshBot.memory/resolve': {
            readonly parameters: readonly [{
                name: string;
                source: "json";
                codec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodObject<{
                        ids: z.ZodArray<z.ZodUUID>;
                        expectedRevision: z.ZodNumber;
                        choice: z.ZodEnum<{
                            select: "select";
                            coexist: "coexist";
                            reject: "reject";
                        }>;
                        selected: z.ZodOptional<z.ZodUUID>;
                        qualifiers: z.ZodOptional<z.ZodArray<z.ZodObject<{
                            id: z.ZodUUID;
                            values: z.ZodRecord<z.ZodString, z.ZodString>;
                        }, z.core.$strict>>>;
                    }, z.core.$strict>;
                };
                strictCodec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodObject<{
                        ids: z.ZodArray<z.ZodUUID>;
                        expectedRevision: z.ZodNumber;
                        choice: z.ZodEnum<{
                            select: "select";
                            coexist: "coexist";
                            reject: "reject";
                        }>;
                        selected: z.ZodOptional<z.ZodUUID>;
                        qualifiers: z.ZodOptional<z.ZodArray<z.ZodObject<{
                            id: z.ZodUUID;
                            values: z.ZodRecord<z.ZodString, z.ZodString>;
                        }, z.core.$strict>>>;
                    }, z.core.$strict>;
                };
            }];
            readonly result: {
                encode: (value: unknown) => void;
                decode: (value: unknown) => void;
                mode: "strict";
                typeSymbol: string;
                create: () => z.ZodVoid;
            };
            readonly service: string;
            readonly invocation: {
                kind: "direct";
            };
        };
        readonly 'dshBot.memory/previewContribution': {
            readonly parameters: readonly [{
                name: string;
                source: "json";
                codec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodUUID;
                };
                strictCodec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodUUID;
                };
            }];
            readonly result: {
                encode: (value: unknown) => {
                    previewRevision: string;
                    memoryId: string;
                    mode: "version" | "related";
                    revision: number;
                    targets: string[];
                    sessionIds: string[];
                    versions: number;
                    historyNodes: number;
                    summaries: number;
                    copies: number;
                    pendingMessages: number;
                    conservative: boolean;
                    rootInstructions: boolean;
                    affectedBots?: number | undefined;
                    derivatives?: number | undefined;
                };
                decode: (value: unknown) => {
                    previewRevision: string;
                    memoryId: string;
                    mode: "version" | "related";
                    revision: number;
                    targets: string[];
                    sessionIds: string[];
                    versions: number;
                    historyNodes: number;
                    summaries: number;
                    copies: number;
                    pendingMessages: number;
                    conservative: boolean;
                    rootInstructions: boolean;
                    affectedBots?: number | undefined;
                    derivatives?: number | undefined;
                };
                mode: "strict";
                typeSymbol: string;
                create: () => z.ZodObject<{
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
            };
            readonly service: string;
            readonly invocation: {
                kind: "direct";
            };
        };
        readonly 'dshBot.memory/previewShared': {
            readonly parameters: readonly [{
                name: string;
                source: "json";
                codec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodObject<{
                        memoryId: z.ZodUUID;
                        mode: z.ZodEnum<{
                            version: "version";
                            related: "related";
                        }>;
                    }, z.core.$strict>;
                };
                strictCodec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodObject<{
                        memoryId: z.ZodUUID;
                        mode: z.ZodEnum<{
                            version: "version";
                            related: "related";
                        }>;
                    }, z.core.$strict>;
                };
            }];
            readonly result: {
                encode: (value: unknown) => {
                    previewRevision: string;
                    memoryId: string;
                    mode: "version" | "related";
                    revision: number;
                    targets: string[];
                    sessionIds: string[];
                    versions: number;
                    historyNodes: number;
                    summaries: number;
                    copies: number;
                    pendingMessages: number;
                    conservative: boolean;
                    rootInstructions: boolean;
                    affectedBots?: number | undefined;
                    derivatives?: number | undefined;
                };
                decode: (value: unknown) => {
                    previewRevision: string;
                    memoryId: string;
                    mode: "version" | "related";
                    revision: number;
                    targets: string[];
                    sessionIds: string[];
                    versions: number;
                    historyNodes: number;
                    summaries: number;
                    copies: number;
                    pendingMessages: number;
                    conservative: boolean;
                    rootInstructions: boolean;
                    affectedBots?: number | undefined;
                    derivatives?: number | undefined;
                };
                mode: "strict";
                typeSymbol: string;
                create: () => z.ZodObject<{
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
            };
            readonly service: string;
            readonly invocation: {
                kind: "direct";
            };
        };
        readonly 'dshBot.memory/list': {
            readonly parameters: readonly [{
                name: string;
                source: "json";
                codec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodString;
                };
                strictCodec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodString;
                };
            }, {
                name: string;
                source: "json";
                codec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodObject<{
                        pinned: z.ZodOptional<z.ZodBoolean>;
                        tag: z.ZodOptional<z.ZodString>;
                        before: z.ZodOptional<z.ZodObject<{
                            pinned: z.ZodBoolean;
                            updatedAt: z.ZodNumber;
                            id: z.ZodString;
                        }, z.core.$strict>>;
                        limit: z.ZodOptional<z.ZodNumber>;
                    }, z.core.$strict>;
                };
                strictCodec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodObject<{
                        pinned: z.ZodOptional<z.ZodBoolean>;
                        tag: z.ZodOptional<z.ZodString>;
                        before: z.ZodOptional<z.ZodObject<{
                            pinned: z.ZodBoolean;
                            updatedAt: z.ZodNumber;
                            id: z.ZodString;
                        }, z.core.$strict>>;
                        limit: z.ZodOptional<z.ZodNumber>;
                    }, z.core.$strict>;
                };
            }];
            readonly result: {
                mode: "strict";
                typeSymbol: string;
                create: () => z.ZodArray<z.ZodPipe<z.ZodObject<{
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
                }>>>;
            };
            readonly service: string;
            readonly invocation: {
                kind: "direct";
            };
        };
        readonly 'dshBot.memory/search': {
            readonly parameters: readonly [{
                name: string;
                source: "json";
                codec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodString;
                };
                strictCodec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodString;
                };
            }, {
                name: string;
                source: "json";
                codec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodObject<{
                        pinned: z.ZodOptional<z.ZodBoolean>;
                        tag: z.ZodOptional<z.ZodString>;
                        before: z.ZodOptional<z.ZodObject<{
                            pinned: z.ZodBoolean;
                            updatedAt: z.ZodNumber;
                            id: z.ZodString;
                        }, z.core.$strict>>;
                        limit: z.ZodOptional<z.ZodNumber>;
                        query: z.ZodString;
                    }, z.core.$strict>;
                };
                strictCodec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodObject<{
                        pinned: z.ZodOptional<z.ZodBoolean>;
                        tag: z.ZodOptional<z.ZodString>;
                        before: z.ZodOptional<z.ZodObject<{
                            pinned: z.ZodBoolean;
                            updatedAt: z.ZodNumber;
                            id: z.ZodString;
                        }, z.core.$strict>>;
                        limit: z.ZodOptional<z.ZodNumber>;
                        query: z.ZodString;
                    }, z.core.$strict>;
                };
            }];
            readonly result: {
                mode: "strict";
                typeSymbol: string;
                create: () => z.ZodArray<z.ZodPipe<z.ZodObject<{
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
                }>>>;
            };
            readonly service: string;
            readonly invocation: {
                kind: "direct";
            };
        };
        readonly 'dshBot.memory/save': {
            readonly parameters: readonly [{
                name: string;
                source: "json";
                codec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodString;
                };
                strictCodec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodString;
                };
            }, {
                name: string;
                source: "json";
                codec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodObject<{
                        kind: z.ZodDefault<z.ZodEnum<{
                            profile: "profile";
                            preference: "preference";
                            fact: "fact";
                            note: "note";
                        }>>;
                        content: z.ZodString;
                        tags: z.ZodDefault<z.ZodArray<z.ZodString>>;
                        pinned: z.ZodDefault<z.ZodBoolean>;
                    }, z.core.$strict>;
                };
                strictCodec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodObject<{
                        kind: z.ZodDefault<z.ZodEnum<{
                            profile: "profile";
                            preference: "preference";
                            fact: "fact";
                            note: "note";
                        }>>;
                        content: z.ZodString;
                        tags: z.ZodDefault<z.ZodArray<z.ZodString>>;
                        pinned: z.ZodDefault<z.ZodBoolean>;
                    }, z.core.$strict>;
                };
            }];
            readonly result: {
                mode: "strict";
                typeSymbol: string;
                create: () => z.ZodObject<{
                    id: z.ZodString;
                    deduplicated: z.ZodBoolean;
                }, z.core.$strict>;
            };
            readonly service: string;
            readonly invocation: {
                kind: "direct";
            };
        };
        readonly 'dshBot.memory/update': {
            readonly parameters: readonly [{
                name: string;
                source: "json";
                codec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodString;
                };
                strictCodec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodString;
                };
            }, {
                name: string;
                source: "json";
                codec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodString;
                };
                strictCodec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodString;
                };
            }, {
                name: string;
                source: "json";
                codec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodObject<{
                        kind: z.ZodOptional<z.ZodEnum<{
                            profile: "profile";
                            preference: "preference";
                            fact: "fact";
                            note: "note";
                        }>>;
                        content: z.ZodOptional<z.ZodString>;
                        tags: z.ZodOptional<z.ZodArray<z.ZodString>>;
                        pinned: z.ZodOptional<z.ZodBoolean>;
                    }, z.core.$strict>;
                };
                strictCodec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodObject<{
                        kind: z.ZodOptional<z.ZodEnum<{
                            profile: "profile";
                            preference: "preference";
                            fact: "fact";
                            note: "note";
                        }>>;
                        content: z.ZodOptional<z.ZodString>;
                        tags: z.ZodOptional<z.ZodArray<z.ZodString>>;
                        pinned: z.ZodOptional<z.ZodBoolean>;
                    }, z.core.$strict>;
                };
            }];
            readonly result: {
                mode: "strict";
                typeSymbol: string;
                create: () => z.ZodPipe<z.ZodObject<{
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
            };
            readonly service: string;
            readonly invocation: {
                kind: "direct";
            };
        };
        readonly 'dshBot.memory/delete': {
            readonly implementation: "remove";
            readonly parameters: readonly [{
                name: string;
                source: "json";
                codec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodString;
                };
                strictCodec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodString;
                };
            }, {
                name: string;
                source: "json";
                codec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodString;
                };
                strictCodec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodString;
                };
            }];
            readonly result: {
                mode: "strict";
                typeSymbol: string;
                create: () => z.ZodVoid;
            };
            readonly service: string;
            readonly invocation: {
                kind: "direct";
            };
        };
        readonly 'dshBot.memory/quarantineCount': {
            readonly parameters: readonly [];
            readonly result: {
                encode: (value: unknown) => number;
                decode: (value: unknown) => number;
                mode: "strict";
                typeSymbol: string;
                create: () => z.ZodNumber;
            };
            readonly service: string;
            readonly invocation: {
                kind: "direct";
            };
        };
        readonly 'dshBot.memory/count': {
            readonly parameters: readonly [{
                name: string;
                source: "json";
                codec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodString;
                };
                strictCodec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodString;
                };
            }];
            readonly result: {
                mode: "strict";
                typeSymbol: string;
                create: () => z.ZodNumber;
            };
            readonly service: string;
            readonly invocation: {
                kind: "direct";
            };
        };
        readonly 'dshBot.memory/previewForget': {
            readonly parameters: readonly [{
                name: string;
                source: "json";
                codec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodString;
                };
                strictCodec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodString;
                };
            }, {
                name: string;
                source: "json";
                codec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodObject<{
                        memoryId: z.ZodUUID;
                        mode: z.ZodEnum<{
                            version: "version";
                            related: "related";
                        }>;
                    }, z.core.$strict>;
                };
                strictCodec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodObject<{
                        memoryId: z.ZodUUID;
                        mode: z.ZodEnum<{
                            version: "version";
                            related: "related";
                        }>;
                    }, z.core.$strict>;
                };
            }];
            readonly result: {
                encode: (value: unknown) => {
                    previewRevision: string;
                    memoryId: string;
                    mode: "version" | "related";
                    revision: number;
                    targets: string[];
                    sessionIds: string[];
                    versions: number;
                    historyNodes: number;
                    summaries: number;
                    copies: number;
                    pendingMessages: number;
                    conservative: boolean;
                    rootInstructions: boolean;
                    affectedBots?: number | undefined;
                    derivatives?: number | undefined;
                };
                decode: (value: unknown) => {
                    previewRevision: string;
                    memoryId: string;
                    mode: "version" | "related";
                    revision: number;
                    targets: string[];
                    sessionIds: string[];
                    versions: number;
                    historyNodes: number;
                    summaries: number;
                    copies: number;
                    pendingMessages: number;
                    conservative: boolean;
                    rootInstructions: boolean;
                    affectedBots?: number | undefined;
                    derivatives?: number | undefined;
                };
                mode: "strict";
                typeSymbol: string;
                create: () => z.ZodObject<{
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
            };
            readonly service: string;
            readonly invocation: {
                kind: "direct";
            };
        };
        readonly 'dshBot.memory/chooseForget': {
            readonly parameters: readonly [{
                name: string;
                source: "json";
                codec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodObject<{
                        previewRevision: z.ZodUUID;
                        choice: z.ZodEnum<{
                            stop: "stop";
                            clean: "clean";
                        }>;
                    }, z.core.$strict>;
                };
                strictCodec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodObject<{
                        previewRevision: z.ZodUUID;
                        choice: z.ZodEnum<{
                            stop: "stop";
                            clean: "clean";
                        }>;
                    }, z.core.$strict>;
                };
            }];
            readonly result: {
                encode: (value: unknown) => {
                    id: string;
                    stopped: boolean;
                    strong: boolean;
                    phase: "intent" | "stopped" | "cleaning" | "blocked" | "verified";
                    reasons: ("unavailable" | "copies" | "history" | "system-head" | "inbox" | "root-instructions" | "raw-read-policy" | "inventory" | "flush")[];
                    sessions: number;
                };
                decode: (value: unknown) => {
                    id: string;
                    stopped: boolean;
                    strong: boolean;
                    phase: "intent" | "stopped" | "cleaning" | "blocked" | "verified";
                    reasons: ("unavailable" | "copies" | "history" | "system-head" | "inbox" | "root-instructions" | "raw-read-policy" | "inventory" | "flush")[];
                    sessions: number;
                };
                mode: "strict";
                typeSymbol: string;
                create: () => z.ZodObject<{
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
            };
            readonly service: string;
            readonly invocation: {
                kind: "direct";
            };
        };
        readonly 'dshBot.memory/cleanupStatuses': {
            readonly parameters: readonly [];
            readonly result: {
                encode: (value: unknown) => {
                    id: string;
                    stopped: boolean;
                    strong: boolean;
                    phase: "intent" | "stopped" | "cleaning" | "blocked" | "verified";
                    reasons: ("unavailable" | "copies" | "history" | "system-head" | "inbox" | "root-instructions" | "raw-read-policy" | "inventory" | "flush")[];
                    sessions: number;
                }[];
                decode: (value: unknown) => {
                    id: string;
                    stopped: boolean;
                    strong: boolean;
                    phase: "intent" | "stopped" | "cleaning" | "blocked" | "verified";
                    reasons: ("unavailable" | "copies" | "history" | "system-head" | "inbox" | "root-instructions" | "raw-read-policy" | "inventory" | "flush")[];
                    sessions: number;
                }[];
                mode: "strict";
                typeSymbol: string;
                create: () => z.ZodArray<z.ZodObject<{
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
                }, z.core.$strict>>;
            };
            readonly service: string;
            readonly invocation: {
                kind: "direct";
            };
        };
        readonly 'dshBot.memory/retryCleanup': {
            readonly parameters: readonly [{
                name: string;
                source: "json";
                codec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodUUID;
                };
                strictCodec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodUUID;
                };
            }];
            readonly result: {
                encode: (value: unknown) => {
                    id: string;
                    stopped: boolean;
                    strong: boolean;
                    phase: "intent" | "stopped" | "cleaning" | "blocked" | "verified";
                    reasons: ("unavailable" | "copies" | "history" | "system-head" | "inbox" | "root-instructions" | "raw-read-policy" | "inventory" | "flush")[];
                    sessions: number;
                };
                decode: (value: unknown) => {
                    id: string;
                    stopped: boolean;
                    strong: boolean;
                    phase: "intent" | "stopped" | "cleaning" | "blocked" | "verified";
                    reasons: ("unavailable" | "copies" | "history" | "system-head" | "inbox" | "root-instructions" | "raw-read-policy" | "inventory" | "flush")[];
                    sessions: number;
                };
                mode: "strict";
                typeSymbol: string;
                create: () => z.ZodObject<{
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
            };
            readonly service: string;
            readonly invocation: {
                kind: "direct";
            };
        };
        readonly 'dshBot.memory/rootInstructions': {
            readonly parameters: readonly [];
            readonly result: {
                encode: (value: unknown) => {
                    root: string;
                    files: {
                        path: string;
                        state: "unknown" | "present" | "absent";
                    }[];
                };
                decode: (value: unknown) => {
                    root: string;
                    files: {
                        path: string;
                        state: "unknown" | "present" | "absent";
                    }[];
                };
                mode: "strict";
                typeSymbol: string;
                create: () => z.ZodObject<{
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
            };
            readonly service: string;
            readonly invocation: {
                kind: "direct";
            };
        };
    };
};
