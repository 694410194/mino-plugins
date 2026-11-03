import { z } from 'zod';
import type { RemoteResult } from '@deepseek-ai/dsh-typert-protocol';
export declare const skillName: z.ZodString;
export declare const capabilityRequest: z.ZodDiscriminatedUnion<[z.ZodObject<{
    action: z.ZodLiteral<"models">;
}, z.core.$strict>, z.ZodObject<{
    action: z.ZodLiteral<"modelInfo">;
    provider: z.ZodString;
    model: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    action: z.ZodLiteral<"inspect">;
    bot: z.ZodObject<{
        botId: z.ZodString;
        botCreatedAt: z.ZodNumber;
    }, z.core.$strict>;
}, z.core.$strict>, z.ZodObject<{
    action: z.ZodLiteral<"freshConversation">;
    bot: z.ZodObject<{
        botId: z.ZodString;
        botCreatedAt: z.ZodNumber;
    }, z.core.$strict>;
    expectedSessionId: z.ZodNullable<z.ZodString>;
}, z.core.$strict>, z.ZodObject<{
    action: z.ZodLiteral<"skillRead">;
    bot: z.ZodObject<{
        botId: z.ZodString;
        botCreatedAt: z.ZodNumber;
    }, z.core.$strict>;
    name: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    action: z.ZodLiteral<"skillWrite">;
    bot: z.ZodObject<{
        botId: z.ZodString;
        botCreatedAt: z.ZodNumber;
    }, z.core.$strict>;
    name: z.ZodString;
    content: z.ZodString;
    expectedHash: z.ZodNullable<z.ZodString>;
}, z.core.$strict>, z.ZodObject<{
    action: z.ZodLiteral<"skillRemove">;
    bot: z.ZodObject<{
        botId: z.ZodString;
        botCreatedAt: z.ZodNumber;
    }, z.core.$strict>;
    name: z.ZodString;
    expectedHash: z.ZodString;
}, z.core.$strict>], "action">;
export declare const platformSchema: z.ZodDefault<z.ZodObject<{
    browser: z.ZodDefault<z.ZodObject<{
        provider: z.ZodOptional<z.ZodString>;
        toolBridge: z.ZodDefault<z.ZodLiteral<false>>;
    }, z.core.$strip>>;
    voice: z.ZodDefault<z.ZodObject<{
        available: z.ZodBoolean;
        selectedProvider: z.ZodOptional<z.ZodString>;
        providers: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            phase: z.ZodString;
        }, z.core.$strip>>;
    }, z.core.$strip>>;
}, z.core.$strip>>;
export declare const dataFlowDiagnosticSchema: z.ZodObject<{
    state: z.ZodEnum<{
        unknown: "unknown";
        restricted: "restricted";
        clear: "clear";
    }>;
    reasons: z.ZodArray<z.ZodEnum<{
        unavailable: "unavailable";
        secret: "secret";
        "no-egress": "no-egress";
        "pending-cleanup": "pending-cleanup";
        revoked: "revoked";
        "unknown-lineage": "unknown-lineage";
        "reader-mismatch": "reader-mismatch";
    }>>;
}, z.core.$strict>;
export declare const capabilityResult: z.ZodDiscriminatedUnion<[z.ZodObject<{
    kind: z.ZodLiteral<"models">;
    providers: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        available: z.ZodBoolean;
        models: z.ZodArray<z.ZodObject<{
            provider: z.ZodString;
            id: z.ZodString;
            name: z.ZodString;
            inputModalities: z.ZodOptional<z.ZodArray<z.ZodString>>;
        }, z.core.$strip>>;
    }, z.core.$strip>>;
}, z.core.$strip>, z.ZodObject<{
    kind: z.ZodLiteral<"modelInfo">;
    model: z.ZodObject<{
        provider: z.ZodString;
        id: z.ZodString;
        name: z.ZodString;
        inputModalities: z.ZodOptional<z.ZodArray<z.ZodString>>;
        reasoning: z.ZodOptional<z.ZodObject<{
            efforts: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                name: z.ZodString;
            }, z.core.$strip>>;
        }, z.core.$strip>>;
    }, z.core.$strip>;
}, z.core.$strip>, z.ZodObject<{
    kind: z.ZodLiteral<"conversation">;
    sessionId: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    kind: z.ZodLiteral<"inspect">;
    mainSessionId: z.ZodOptional<z.ZodString>;
    dataFlow: z.ZodDefault<z.ZodObject<{
        state: z.ZodEnum<{
            unknown: "unknown";
            restricted: "restricted";
            clear: "clear";
        }>;
        reasons: z.ZodArray<z.ZodEnum<{
            unavailable: "unavailable";
            secret: "secret";
            "no-egress": "no-egress";
            "pending-cleanup": "pending-cleanup";
            revoked: "revoked";
            "unknown-lineage": "unknown-lineage";
            "reader-mismatch": "reader-mismatch";
        }>>;
    }, z.core.$strict>>;
    platform: z.ZodDefault<z.ZodObject<{
        browser: z.ZodDefault<z.ZodObject<{
            provider: z.ZodOptional<z.ZodString>;
            toolBridge: z.ZodDefault<z.ZodLiteral<false>>;
        }, z.core.$strip>>;
        voice: z.ZodDefault<z.ZodObject<{
            available: z.ZodBoolean;
            selectedProvider: z.ZodOptional<z.ZodString>;
            providers: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                name: z.ZodString;
                phase: z.ZodString;
            }, z.core.$strip>>;
        }, z.core.$strip>>;
    }, z.core.$strip>>;
    online: z.ZodBoolean;
    skillsAvailable: z.ZodBoolean;
    skills: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        description: z.ZodString;
        provider: z.ZodString;
    }, z.core.$strip>>;
    ownSkills: z.ZodArray<z.ZodString>;
    tools: z.ZodArray<z.ZodString>;
    extraDirs: z.ZodArray<z.ZodString>;
}, z.core.$strip>, z.ZodObject<{
    kind: z.ZodLiteral<"skill">;
    name: z.ZodString;
    content: z.ZodOptional<z.ZodString>;
    hash: z.ZodNullable<z.ZodString>;
}, z.core.$strip>, z.ZodObject<{
    kind: z.ZodLiteral<"removed">;
}, z.core.$strip>], "kind">;
export declare const capabilitiesSpec: {
    readonly package: "dsh-bot/capabilities";
    readonly methods: {
        readonly 'dshBot.capabilities/request': {
            readonly service: "dshBotCapabilitiesRemote";
            readonly invocation: {
                readonly kind: "direct";
            };
            readonly parameters: readonly [{
                readonly name: "input";
                readonly source: "json";
                readonly codec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodDiscriminatedUnion<[z.ZodObject<{
                        action: z.ZodLiteral<"models">;
                    }, z.core.$strict>, z.ZodObject<{
                        action: z.ZodLiteral<"modelInfo">;
                        provider: z.ZodString;
                        model: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        action: z.ZodLiteral<"inspect">;
                        bot: z.ZodObject<{
                            botId: z.ZodString;
                            botCreatedAt: z.ZodNumber;
                        }, z.core.$strict>;
                    }, z.core.$strict>, z.ZodObject<{
                        action: z.ZodLiteral<"freshConversation">;
                        bot: z.ZodObject<{
                            botId: z.ZodString;
                            botCreatedAt: z.ZodNumber;
                        }, z.core.$strict>;
                        expectedSessionId: z.ZodNullable<z.ZodString>;
                    }, z.core.$strict>, z.ZodObject<{
                        action: z.ZodLiteral<"skillRead">;
                        bot: z.ZodObject<{
                            botId: z.ZodString;
                            botCreatedAt: z.ZodNumber;
                        }, z.core.$strict>;
                        name: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        action: z.ZodLiteral<"skillWrite">;
                        bot: z.ZodObject<{
                            botId: z.ZodString;
                            botCreatedAt: z.ZodNumber;
                        }, z.core.$strict>;
                        name: z.ZodString;
                        content: z.ZodString;
                        expectedHash: z.ZodNullable<z.ZodString>;
                    }, z.core.$strict>, z.ZodObject<{
                        action: z.ZodLiteral<"skillRemove">;
                        bot: z.ZodObject<{
                            botId: z.ZodString;
                            botCreatedAt: z.ZodNumber;
                        }, z.core.$strict>;
                        name: z.ZodString;
                        expectedHash: z.ZodString;
                    }, z.core.$strict>], "action">;
                    encode: (v: unknown) => {
                        action: "models";
                    } | {
                        action: "modelInfo";
                        provider: string;
                        model: string;
                    } | {
                        action: "inspect";
                        bot: {
                            botId: string;
                            botCreatedAt: number;
                        };
                    } | {
                        action: "freshConversation";
                        bot: {
                            botId: string;
                            botCreatedAt: number;
                        };
                        expectedSessionId: string | null;
                    } | {
                        action: "skillRead";
                        bot: {
                            botId: string;
                            botCreatedAt: number;
                        };
                        name: string;
                    } | {
                        action: "skillWrite";
                        bot: {
                            botId: string;
                            botCreatedAt: number;
                        };
                        name: string;
                        content: string;
                        expectedHash: string | null;
                    } | {
                        action: "skillRemove";
                        bot: {
                            botId: string;
                            botCreatedAt: number;
                        };
                        name: string;
                        expectedHash: string;
                    };
                    decode: (v: unknown) => {
                        action: "models";
                    } | {
                        action: "modelInfo";
                        provider: string;
                        model: string;
                    } | {
                        action: "inspect";
                        bot: {
                            botId: string;
                            botCreatedAt: number;
                        };
                    } | {
                        action: "freshConversation";
                        bot: {
                            botId: string;
                            botCreatedAt: number;
                        };
                        expectedSessionId: string | null;
                    } | {
                        action: "skillRead";
                        bot: {
                            botId: string;
                            botCreatedAt: number;
                        };
                        name: string;
                    } | {
                        action: "skillWrite";
                        bot: {
                            botId: string;
                            botCreatedAt: number;
                        };
                        name: string;
                        content: string;
                        expectedHash: string | null;
                    } | {
                        action: "skillRemove";
                        bot: {
                            botId: string;
                            botCreatedAt: number;
                        };
                        name: string;
                        expectedHash: string;
                    };
                };
                readonly strictCodec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodDiscriminatedUnion<[z.ZodObject<{
                        action: z.ZodLiteral<"models">;
                    }, z.core.$strict>, z.ZodObject<{
                        action: z.ZodLiteral<"modelInfo">;
                        provider: z.ZodString;
                        model: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        action: z.ZodLiteral<"inspect">;
                        bot: z.ZodObject<{
                            botId: z.ZodString;
                            botCreatedAt: z.ZodNumber;
                        }, z.core.$strict>;
                    }, z.core.$strict>, z.ZodObject<{
                        action: z.ZodLiteral<"freshConversation">;
                        bot: z.ZodObject<{
                            botId: z.ZodString;
                            botCreatedAt: z.ZodNumber;
                        }, z.core.$strict>;
                        expectedSessionId: z.ZodNullable<z.ZodString>;
                    }, z.core.$strict>, z.ZodObject<{
                        action: z.ZodLiteral<"skillRead">;
                        bot: z.ZodObject<{
                            botId: z.ZodString;
                            botCreatedAt: z.ZodNumber;
                        }, z.core.$strict>;
                        name: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        action: z.ZodLiteral<"skillWrite">;
                        bot: z.ZodObject<{
                            botId: z.ZodString;
                            botCreatedAt: z.ZodNumber;
                        }, z.core.$strict>;
                        name: z.ZodString;
                        content: z.ZodString;
                        expectedHash: z.ZodNullable<z.ZodString>;
                    }, z.core.$strict>, z.ZodObject<{
                        action: z.ZodLiteral<"skillRemove">;
                        bot: z.ZodObject<{
                            botId: z.ZodString;
                            botCreatedAt: z.ZodNumber;
                        }, z.core.$strict>;
                        name: z.ZodString;
                        expectedHash: z.ZodString;
                    }, z.core.$strict>], "action">;
                    encode: (v: unknown) => {
                        action: "models";
                    } | {
                        action: "modelInfo";
                        provider: string;
                        model: string;
                    } | {
                        action: "inspect";
                        bot: {
                            botId: string;
                            botCreatedAt: number;
                        };
                    } | {
                        action: "freshConversation";
                        bot: {
                            botId: string;
                            botCreatedAt: number;
                        };
                        expectedSessionId: string | null;
                    } | {
                        action: "skillRead";
                        bot: {
                            botId: string;
                            botCreatedAt: number;
                        };
                        name: string;
                    } | {
                        action: "skillWrite";
                        bot: {
                            botId: string;
                            botCreatedAt: number;
                        };
                        name: string;
                        content: string;
                        expectedHash: string | null;
                    } | {
                        action: "skillRemove";
                        bot: {
                            botId: string;
                            botCreatedAt: number;
                        };
                        name: string;
                        expectedHash: string;
                    };
                    decode: (v: unknown) => {
                        action: "models";
                    } | {
                        action: "modelInfo";
                        provider: string;
                        model: string;
                    } | {
                        action: "inspect";
                        bot: {
                            botId: string;
                            botCreatedAt: number;
                        };
                    } | {
                        action: "freshConversation";
                        bot: {
                            botId: string;
                            botCreatedAt: number;
                        };
                        expectedSessionId: string | null;
                    } | {
                        action: "skillRead";
                        bot: {
                            botId: string;
                            botCreatedAt: number;
                        };
                        name: string;
                    } | {
                        action: "skillWrite";
                        bot: {
                            botId: string;
                            botCreatedAt: number;
                        };
                        name: string;
                        content: string;
                        expectedHash: string | null;
                    } | {
                        action: "skillRemove";
                        bot: {
                            botId: string;
                            botCreatedAt: number;
                        };
                        name: string;
                        expectedHash: string;
                    };
                };
            }];
            readonly result: {
                mode: "strict";
                typeSymbol: string;
                create: () => z.ZodDiscriminatedUnion<[z.ZodObject<{
                    kind: z.ZodLiteral<"models">;
                    providers: z.ZodArray<z.ZodObject<{
                        id: z.ZodString;
                        name: z.ZodString;
                        available: z.ZodBoolean;
                        models: z.ZodArray<z.ZodObject<{
                            provider: z.ZodString;
                            id: z.ZodString;
                            name: z.ZodString;
                            inputModalities: z.ZodOptional<z.ZodArray<z.ZodString>>;
                        }, z.core.$strip>>;
                    }, z.core.$strip>>;
                }, z.core.$strip>, z.ZodObject<{
                    kind: z.ZodLiteral<"modelInfo">;
                    model: z.ZodObject<{
                        provider: z.ZodString;
                        id: z.ZodString;
                        name: z.ZodString;
                        inputModalities: z.ZodOptional<z.ZodArray<z.ZodString>>;
                        reasoning: z.ZodOptional<z.ZodObject<{
                            efforts: z.ZodArray<z.ZodObject<{
                                id: z.ZodString;
                                name: z.ZodString;
                            }, z.core.$strip>>;
                        }, z.core.$strip>>;
                    }, z.core.$strip>;
                }, z.core.$strip>, z.ZodObject<{
                    kind: z.ZodLiteral<"conversation">;
                    sessionId: z.ZodString;
                }, z.core.$strip>, z.ZodObject<{
                    kind: z.ZodLiteral<"inspect">;
                    mainSessionId: z.ZodOptional<z.ZodString>;
                    dataFlow: z.ZodDefault<z.ZodObject<{
                        state: z.ZodEnum<{
                            unknown: "unknown";
                            restricted: "restricted";
                            clear: "clear";
                        }>;
                        reasons: z.ZodArray<z.ZodEnum<{
                            unavailable: "unavailable";
                            secret: "secret";
                            "no-egress": "no-egress";
                            "pending-cleanup": "pending-cleanup";
                            revoked: "revoked";
                            "unknown-lineage": "unknown-lineage";
                            "reader-mismatch": "reader-mismatch";
                        }>>;
                    }, z.core.$strict>>;
                    platform: z.ZodDefault<z.ZodObject<{
                        browser: z.ZodDefault<z.ZodObject<{
                            provider: z.ZodOptional<z.ZodString>;
                            toolBridge: z.ZodDefault<z.ZodLiteral<false>>;
                        }, z.core.$strip>>;
                        voice: z.ZodDefault<z.ZodObject<{
                            available: z.ZodBoolean;
                            selectedProvider: z.ZodOptional<z.ZodString>;
                            providers: z.ZodArray<z.ZodObject<{
                                id: z.ZodString;
                                name: z.ZodString;
                                phase: z.ZodString;
                            }, z.core.$strip>>;
                        }, z.core.$strip>>;
                    }, z.core.$strip>>;
                    online: z.ZodBoolean;
                    skillsAvailable: z.ZodBoolean;
                    skills: z.ZodArray<z.ZodObject<{
                        name: z.ZodString;
                        description: z.ZodString;
                        provider: z.ZodString;
                    }, z.core.$strip>>;
                    ownSkills: z.ZodArray<z.ZodString>;
                    tools: z.ZodArray<z.ZodString>;
                    extraDirs: z.ZodArray<z.ZodString>;
                }, z.core.$strip>, z.ZodObject<{
                    kind: z.ZodLiteral<"skill">;
                    name: z.ZodString;
                    content: z.ZodOptional<z.ZodString>;
                    hash: z.ZodNullable<z.ZodString>;
                }, z.core.$strip>, z.ZodObject<{
                    kind: z.ZodLiteral<"removed">;
                }, z.core.$strip>], "kind">;
                encode: (v: unknown) => {
                    kind: "models";
                    providers: {
                        id: string;
                        name: string;
                        available: boolean;
                        models: {
                            provider: string;
                            id: string;
                            name: string;
                            inputModalities?: string[] | undefined;
                        }[];
                    }[];
                } | {
                    kind: "modelInfo";
                    model: {
                        provider: string;
                        id: string;
                        name: string;
                        inputModalities?: string[] | undefined;
                        reasoning?: {
                            efforts: {
                                id: string;
                                name: string;
                            }[];
                        } | undefined;
                    };
                } | {
                    kind: "conversation";
                    sessionId: string;
                } | {
                    kind: "inspect";
                    dataFlow: {
                        state: "unknown" | "restricted" | "clear";
                        reasons: ("unavailable" | "secret" | "no-egress" | "pending-cleanup" | "revoked" | "unknown-lineage" | "reader-mismatch")[];
                    };
                    platform: {
                        browser: {
                            toolBridge: false;
                            provider?: string | undefined;
                        };
                        voice: {
                            available: boolean;
                            providers: {
                                id: string;
                                name: string;
                                phase: string;
                            }[];
                            selectedProvider?: string | undefined;
                        };
                    };
                    online: boolean;
                    skillsAvailable: boolean;
                    skills: {
                        name: string;
                        description: string;
                        provider: string;
                    }[];
                    ownSkills: string[];
                    tools: string[];
                    extraDirs: string[];
                    mainSessionId?: string | undefined;
                } | {
                    kind: "skill";
                    name: string;
                    hash: string | null;
                    content?: string | undefined;
                } | {
                    kind: "removed";
                };
                decode: (v: unknown) => {
                    kind: "models";
                    providers: {
                        id: string;
                        name: string;
                        available: boolean;
                        models: {
                            provider: string;
                            id: string;
                            name: string;
                            inputModalities?: string[] | undefined;
                        }[];
                    }[];
                } | {
                    kind: "modelInfo";
                    model: {
                        provider: string;
                        id: string;
                        name: string;
                        inputModalities?: string[] | undefined;
                        reasoning?: {
                            efforts: {
                                id: string;
                                name: string;
                            }[];
                        } | undefined;
                    };
                } | {
                    kind: "conversation";
                    sessionId: string;
                } | {
                    kind: "inspect";
                    dataFlow: {
                        state: "unknown" | "restricted" | "clear";
                        reasons: ("unavailable" | "secret" | "no-egress" | "pending-cleanup" | "revoked" | "unknown-lineage" | "reader-mismatch")[];
                    };
                    platform: {
                        browser: {
                            toolBridge: false;
                            provider?: string | undefined;
                        };
                        voice: {
                            available: boolean;
                            providers: {
                                id: string;
                                name: string;
                                phase: string;
                            }[];
                            selectedProvider?: string | undefined;
                        };
                    };
                    online: boolean;
                    skillsAvailable: boolean;
                    skills: {
                        name: string;
                        description: string;
                        provider: string;
                    }[];
                    ownSkills: string[];
                    tools: string[];
                    extraDirs: string[];
                    mainSessionId?: string | undefined;
                } | {
                    kind: "skill";
                    name: string;
                    hash: string | null;
                    content?: string | undefined;
                } | {
                    kind: "removed";
                };
            };
        };
    };
};
export interface CapabilitiesMethods {
    request(input: z.input<typeof capabilityRequest>): Promise<RemoteResult<z.output<typeof capabilityResult>>>;
}
declare module '@deepseek-ai/dsh-typert-protocol' {
    interface TypertRemoteNamespaceMap {
        'dshBot.capabilities': CapabilitiesMethods;
    }
    interface TypertRemoteMap {
        'dshBot.capabilities/request': CapabilitiesMethods['request'];
    }
}
export declare const CAPABILITIES_REMOTE: import("@deepseek-ai/dsh-typert-protocol").TypertRemoteInfo<Readonly<Record<string, import("@deepseek-ai/dsh-typert-protocol").TypertRemoteMethod<object, unknown, "unary", never, unknown> | import("@deepseek-ai/dsh-typert-protocol").TypertRemoteMethod<object, unknown, "stream", unknown, unknown>>>>;
