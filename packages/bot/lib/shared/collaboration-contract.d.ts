import { z } from 'zod';
import type { RemoteResult } from '@deepseek-ai/dsh-typert-protocol';
import { imStatusSchema } from './collaboration.js';
export declare const collaborationSpec: {
    readonly package: "dsh-bot/collaboration";
    readonly methods: {
        readonly 'dshBot.collaboration/board': {
            readonly parameters: readonly [{
                name: string;
                source: "json";
                codec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodObject<{
                        botId: z.ZodString;
                        botCreatedAt: z.ZodNumber;
                    }, z.core.$strict>;
                    encode: (v: unknown) => {
                        botId: string;
                        botCreatedAt: number;
                    };
                    decode: (v: unknown) => {
                        botId: string;
                        botCreatedAt: number;
                    };
                };
                strictCodec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodObject<{
                        botId: z.ZodString;
                        botCreatedAt: z.ZodNumber;
                    }, z.core.$strict>;
                    encode: (v: unknown) => {
                        botId: string;
                        botCreatedAt: number;
                    };
                    decode: (v: unknown) => {
                        botId: string;
                        botCreatedAt: number;
                    };
                };
            }];
            readonly result: {
                mode: "strict";
                typeSymbol: string;
                create: () => z.ZodObject<{
                    supported: z.ZodBoolean;
                    reason: z.ZodOptional<z.ZodEnum<{
                        "native-service-missing": "native-service-missing";
                        "not-linked": "not-linked";
                    }>>;
                    link: z.ZodOptional<z.ZodObject<{
                        id: z.ZodString;
                        bot: z.ZodObject<{
                            botId: z.ZodString;
                            botCreatedAt: z.ZodNumber;
                        }, z.core.$strict>;
                        leadSessionId: z.ZodString;
                        nativeTeamId: z.ZodString;
                        enabled: z.ZodBoolean;
                        revision: z.ZodNumber;
                        createdAt: z.ZodNumber;
                        updatedAt: z.ZodNumber;
                        schemaVersion: z.ZodLiteral<1>;
                    }, z.core.$strict>>;
                    members: z.ZodArray<z.ZodObject<{
                        id: z.ZodString;
                        name: z.ZodString;
                        role: z.ZodEnum<{
                            lead: "lead";
                            teammate: "teammate";
                        }>;
                        status: z.ZodEnum<{
                            failed: "failed";
                            running: "running";
                            inactive: "inactive";
                            provisioning: "provisioning";
                        }>;
                        description: z.ZodOptional<z.ZodString>;
                    }, z.core.$strict>>;
                    tasks: z.ZodArray<z.ZodObject<{
                        id: z.ZodString;
                        revision: z.ZodNumber;
                        subject: z.ZodString;
                        description: z.ZodString;
                        status: z.ZodEnum<{
                            pending: "pending";
                            completed: "completed";
                            in_progress: "in_progress";
                            deleted: "deleted";
                        }>;
                        ownerName: z.ZodOptional<z.ZodString>;
                        blockedBy: z.ZodArray<z.ZodString>;
                        writeScopes: z.ZodArray<z.ZodString>;
                        ready: z.ZodBoolean;
                        writeScopeWarnings: z.ZodArray<z.ZodString>;
                    }, z.core.$strict>>;
                }, z.core.$strict>;
                encode: (v: unknown) => {
                    supported: boolean;
                    members: {
                        id: string;
                        name: string;
                        role: "lead" | "teammate";
                        status: "failed" | "running" | "inactive" | "provisioning";
                        description?: string | undefined;
                    }[];
                    tasks: {
                        id: string;
                        revision: number;
                        subject: string;
                        description: string;
                        status: "pending" | "completed" | "in_progress" | "deleted";
                        blockedBy: string[];
                        writeScopes: string[];
                        ready: boolean;
                        writeScopeWarnings: string[];
                        ownerName?: string | undefined;
                    }[];
                    reason?: "native-service-missing" | "not-linked" | undefined;
                    link?: {
                        id: string;
                        bot: {
                            botId: string;
                            botCreatedAt: number;
                        };
                        leadSessionId: string;
                        nativeTeamId: string;
                        enabled: boolean;
                        revision: number;
                        createdAt: number;
                        updatedAt: number;
                        schemaVersion: 1;
                    } | undefined;
                };
                decode: (v: unknown) => {
                    supported: boolean;
                    members: {
                        id: string;
                        name: string;
                        role: "lead" | "teammate";
                        status: "failed" | "running" | "inactive" | "provisioning";
                        description?: string | undefined;
                    }[];
                    tasks: {
                        id: string;
                        revision: number;
                        subject: string;
                        description: string;
                        status: "pending" | "completed" | "in_progress" | "deleted";
                        blockedBy: string[];
                        writeScopes: string[];
                        ready: boolean;
                        writeScopeWarnings: string[];
                        ownerName?: string | undefined;
                    }[];
                    reason?: "native-service-missing" | "not-linked" | undefined;
                    link?: {
                        id: string;
                        bot: {
                            botId: string;
                            botCreatedAt: number;
                        };
                        leadSessionId: string;
                        nativeTeamId: string;
                        enabled: boolean;
                        revision: number;
                        createdAt: number;
                        updatedAt: number;
                        schemaVersion: 1;
                    } | undefined;
                };
            };
            readonly service: string;
            readonly invocation: {
                kind: "direct";
            };
        };
        readonly 'dshBot.collaboration/ensure': {
            readonly parameters: readonly [{
                name: string;
                source: "json";
                codec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodObject<{
                        botId: z.ZodString;
                        botCreatedAt: z.ZodNumber;
                    }, z.core.$strict>;
                    encode: (v: unknown) => {
                        botId: string;
                        botCreatedAt: number;
                    };
                    decode: (v: unknown) => {
                        botId: string;
                        botCreatedAt: number;
                    };
                };
                strictCodec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodObject<{
                        botId: z.ZodString;
                        botCreatedAt: z.ZodNumber;
                    }, z.core.$strict>;
                    encode: (v: unknown) => {
                        botId: string;
                        botCreatedAt: number;
                    };
                    decode: (v: unknown) => {
                        botId: string;
                        botCreatedAt: number;
                    };
                };
            }, {
                name: string;
                source: "json";
                codec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodNumber;
                    encode: (v: unknown) => number;
                    decode: (v: unknown) => number;
                };
                strictCodec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodNumber;
                    encode: (v: unknown) => number;
                    decode: (v: unknown) => number;
                };
            }];
            readonly result: {
                mode: "strict";
                typeSymbol: string;
                create: () => z.ZodObject<{
                    id: z.ZodString;
                    bot: z.ZodObject<{
                        botId: z.ZodString;
                        botCreatedAt: z.ZodNumber;
                    }, z.core.$strict>;
                    leadSessionId: z.ZodString;
                    nativeTeamId: z.ZodString;
                    enabled: z.ZodBoolean;
                    revision: z.ZodNumber;
                    createdAt: z.ZodNumber;
                    updatedAt: z.ZodNumber;
                    schemaVersion: z.ZodLiteral<1>;
                }, z.core.$strict>;
                encode: (v: unknown) => {
                    id: string;
                    bot: {
                        botId: string;
                        botCreatedAt: number;
                    };
                    leadSessionId: string;
                    nativeTeamId: string;
                    enabled: boolean;
                    revision: number;
                    createdAt: number;
                    updatedAt: number;
                    schemaVersion: 1;
                };
                decode: (v: unknown) => {
                    id: string;
                    bot: {
                        botId: string;
                        botCreatedAt: number;
                    };
                    leadSessionId: string;
                    nativeTeamId: string;
                    enabled: boolean;
                    revision: number;
                    createdAt: number;
                    updatedAt: number;
                    schemaVersion: 1;
                };
            };
            readonly service: string;
            readonly invocation: {
                kind: "direct";
            };
        };
        readonly 'dshBot.collaboration/createTask': {
            readonly parameters: readonly [{
                name: string;
                source: "json";
                codec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodObject<{
                        botId: z.ZodString;
                        botCreatedAt: z.ZodNumber;
                    }, z.core.$strict>;
                    encode: (v: unknown) => {
                        botId: string;
                        botCreatedAt: number;
                    };
                    decode: (v: unknown) => {
                        botId: string;
                        botCreatedAt: number;
                    };
                };
                strictCodec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodObject<{
                        botId: z.ZodString;
                        botCreatedAt: z.ZodNumber;
                    }, z.core.$strict>;
                    encode: (v: unknown) => {
                        botId: string;
                        botCreatedAt: number;
                    };
                    decode: (v: unknown) => {
                        botId: string;
                        botCreatedAt: number;
                    };
                };
            }, {
                name: string;
                source: "json";
                codec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodObject<{
                        subject: z.ZodString;
                        description: z.ZodString;
                        blockedBy: z.ZodDefault<z.ZodArray<z.ZodString>>;
                    }, z.core.$strict>;
                    encode: (v: unknown) => {
                        subject: string;
                        description: string;
                        blockedBy: string[];
                    };
                    decode: (v: unknown) => {
                        subject: string;
                        description: string;
                        blockedBy: string[];
                    };
                };
                strictCodec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodObject<{
                        subject: z.ZodString;
                        description: z.ZodString;
                        blockedBy: z.ZodDefault<z.ZodArray<z.ZodString>>;
                    }, z.core.$strict>;
                    encode: (v: unknown) => {
                        subject: string;
                        description: string;
                        blockedBy: string[];
                    };
                    decode: (v: unknown) => {
                        subject: string;
                        description: string;
                        blockedBy: string[];
                    };
                };
            }];
            readonly result: {
                mode: "strict";
                typeSymbol: string;
                create: () => z.ZodObject<{
                    id: z.ZodString;
                    revision: z.ZodNumber;
                    subject: z.ZodString;
                    description: z.ZodString;
                    status: z.ZodEnum<{
                        pending: "pending";
                        completed: "completed";
                        in_progress: "in_progress";
                        deleted: "deleted";
                    }>;
                    ownerName: z.ZodOptional<z.ZodString>;
                    blockedBy: z.ZodArray<z.ZodString>;
                    writeScopes: z.ZodArray<z.ZodString>;
                    ready: z.ZodBoolean;
                    writeScopeWarnings: z.ZodArray<z.ZodString>;
                }, z.core.$strict>;
                encode: (v: unknown) => {
                    id: string;
                    revision: number;
                    subject: string;
                    description: string;
                    status: "pending" | "completed" | "in_progress" | "deleted";
                    blockedBy: string[];
                    writeScopes: string[];
                    ready: boolean;
                    writeScopeWarnings: string[];
                    ownerName?: string | undefined;
                };
                decode: (v: unknown) => {
                    id: string;
                    revision: number;
                    subject: string;
                    description: string;
                    status: "pending" | "completed" | "in_progress" | "deleted";
                    blockedBy: string[];
                    writeScopes: string[];
                    ready: boolean;
                    writeScopeWarnings: string[];
                    ownerName?: string | undefined;
                };
            };
            readonly service: string;
            readonly invocation: {
                kind: "direct";
            };
        };
        readonly 'dshBot.collaboration/updateTask': {
            readonly parameters: readonly [{
                name: string;
                source: "json";
                codec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodObject<{
                        botId: z.ZodString;
                        botCreatedAt: z.ZodNumber;
                    }, z.core.$strict>;
                    encode: (v: unknown) => {
                        botId: string;
                        botCreatedAt: number;
                    };
                    decode: (v: unknown) => {
                        botId: string;
                        botCreatedAt: number;
                    };
                };
                strictCodec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodObject<{
                        botId: z.ZodString;
                        botCreatedAt: z.ZodNumber;
                    }, z.core.$strict>;
                    encode: (v: unknown) => {
                        botId: string;
                        botCreatedAt: number;
                    };
                    decode: (v: unknown) => {
                        botId: string;
                        botCreatedAt: number;
                    };
                };
            }, {
                name: string;
                source: "json";
                codec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodObject<{
                        taskId: z.ZodString;
                        expectedRevision: z.ZodNumber;
                        action: z.ZodEnum<{
                            complete: "complete";
                            claim: "claim";
                        }>;
                    }, z.core.$strict>;
                    encode: (v: unknown) => {
                        taskId: string;
                        expectedRevision: number;
                        action: "complete" | "claim";
                    };
                    decode: (v: unknown) => {
                        taskId: string;
                        expectedRevision: number;
                        action: "complete" | "claim";
                    };
                };
                strictCodec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodObject<{
                        taskId: z.ZodString;
                        expectedRevision: z.ZodNumber;
                        action: z.ZodEnum<{
                            complete: "complete";
                            claim: "claim";
                        }>;
                    }, z.core.$strict>;
                    encode: (v: unknown) => {
                        taskId: string;
                        expectedRevision: number;
                        action: "complete" | "claim";
                    };
                    decode: (v: unknown) => {
                        taskId: string;
                        expectedRevision: number;
                        action: "complete" | "claim";
                    };
                };
            }];
            readonly result: {
                mode: "strict";
                typeSymbol: string;
                create: () => z.ZodObject<{
                    id: z.ZodString;
                    revision: z.ZodNumber;
                    subject: z.ZodString;
                    description: z.ZodString;
                    status: z.ZodEnum<{
                        pending: "pending";
                        completed: "completed";
                        in_progress: "in_progress";
                        deleted: "deleted";
                    }>;
                    ownerName: z.ZodOptional<z.ZodString>;
                    blockedBy: z.ZodArray<z.ZodString>;
                    writeScopes: z.ZodArray<z.ZodString>;
                    ready: z.ZodBoolean;
                    writeScopeWarnings: z.ZodArray<z.ZodString>;
                }, z.core.$strict>;
                encode: (v: unknown) => {
                    id: string;
                    revision: number;
                    subject: string;
                    description: string;
                    status: "pending" | "completed" | "in_progress" | "deleted";
                    blockedBy: string[];
                    writeScopes: string[];
                    ready: boolean;
                    writeScopeWarnings: string[];
                    ownerName?: string | undefined;
                };
                decode: (v: unknown) => {
                    id: string;
                    revision: number;
                    subject: string;
                    description: string;
                    status: "pending" | "completed" | "in_progress" | "deleted";
                    blockedBy: string[];
                    writeScopes: string[];
                    ready: boolean;
                    writeScopeWarnings: string[];
                    ownerName?: string | undefined;
                };
            };
            readonly service: string;
            readonly invocation: {
                kind: "direct";
            };
        };
        readonly 'dshBot.im/status': {
            readonly service: "dshBotImRemote";
            readonly parameters: readonly [];
            readonly result: {
                mode: "strict";
                typeSymbol: string;
                create: () => z.ZodObject<{
                    pin: z.ZodLiteral<"4645cf767257b4bc32c80f4f18e1f9f6cfbb5060">;
                    installed: z.ZodBoolean;
                    contractDetected: z.ZodBoolean;
                    inboundSupported: z.ZodLiteral<false>;
                    outboundSupported: z.ZodLiteral<false>;
                    reason: z.ZodEnum<{
                        "plugin-missing": "plugin-missing";
                        "contract-unavailable": "contract-unavailable";
                        "consumer-gate-unverified": "consumer-gate-unverified";
                    }>;
                }, z.core.$strict>;
                encode: (v: unknown) => {
                    pin: "4645cf767257b4bc32c80f4f18e1f9f6cfbb5060";
                    installed: boolean;
                    contractDetected: boolean;
                    inboundSupported: false;
                    outboundSupported: false;
                    reason: "plugin-missing" | "contract-unavailable" | "consumer-gate-unverified";
                };
                decode: (v: unknown) => {
                    pin: "4645cf767257b4bc32c80f4f18e1f9f6cfbb5060";
                    installed: boolean;
                    contractDetected: boolean;
                    inboundSupported: false;
                    outboundSupported: false;
                    reason: "plugin-missing" | "contract-unavailable" | "consumer-gate-unverified";
                };
            };
            readonly invocation: {
                kind: "direct";
            };
        };
    };
};
type Methods = typeof collaborationSpec.methods;
type Args<P extends readonly unknown[]> = {
    -readonly [K in keyof P]: P[K] extends {
        codec: {
            create: () => infer S extends z.ZodType;
        };
    } ? z.input<S> : never;
};
type Result<K extends keyof Methods> = z.output<ReturnType<Methods[K]['result']['create']>>;
export type CollaborationMethods = {
    [K in keyof Methods as K extends `dshBot.collaboration/${infer M}` ? M : never]: (...args: Args<Methods[K]['parameters']>) => Promise<RemoteResult<Result<K>>>;
};
type Endpoints = {
    [K in keyof Methods]: (...args: Args<Methods[K]['parameters']>) => Promise<RemoteResult<Result<K>>>;
};
declare module '@deepseek-ai/dsh-typert-protocol' {
    interface TypertRemoteMap extends Endpoints {
    }
    interface TypertRemoteNamespaceMap {
        'dshBot.collaboration': CollaborationMethods;
        'dshBot.im': {
            status(): Promise<RemoteResult<z.output<typeof imStatusSchema>>>;
        };
    }
}
export declare const COLLABORATION_REMOTE: import("@deepseek-ai/dsh-typert-protocol").TypertRemoteInfo<Readonly<Record<string, import("@deepseek-ai/dsh-typert-protocol").TypertRemoteMethod<object, unknown, "unary", never, unknown> | import("@deepseek-ai/dsh-typert-protocol").TypertRemoteMethod<object, unknown, "stream", unknown, unknown>>>>;
export {};
