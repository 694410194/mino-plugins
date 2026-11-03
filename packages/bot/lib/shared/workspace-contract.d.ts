import { z } from 'zod';
import type { RemoteResult } from '@deepseek-ai/dsh-typert-protocol';
import { graphRequestSchema, graphResultSchema } from './reference-memory.js';
import { workspaceRequestSchema, workspaceResultSchema } from './workspace.js';
export declare const workspaceSpec: {
    readonly package: "dsh-bot/workspace";
    readonly methods: {
        readonly 'dshBot.workspace/request': {
            readonly service: "dshBotWorkspaceRemote";
            readonly invocation: {
                readonly kind: "direct";
            };
            readonly parameters: readonly [{
                name: string;
                source: "json";
                codec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodDiscriminatedUnion<[z.ZodObject<{
                        action: z.ZodLiteral<"summary">;
                    }, z.core.$strict>, z.ZodObject<{
                        action: z.ZodLiteral<"export">;
                        bot: z.ZodObject<{
                            botId: z.ZodString;
                            botCreatedAt: z.ZodNumber;
                        }, z.core.$strict>;
                        includeSkills: z.ZodBoolean;
                        includeMemories: z.ZodBoolean;
                    }, z.core.$strict>, z.ZodObject<{
                        action: z.ZodLiteral<"preview">;
                        newId: z.ZodString;
                        document: z.ZodObject<{
                            format: z.ZodLiteral<"dsh-bot-export">;
                            version: z.ZodLiteral<1>;
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
                                model: z.ZodOptional<z.ZodObject<{
                                    provider: z.ZodString;
                                    model: z.ZodString;
                                    reasoningEffort: z.ZodOptional<z.ZodString>;
                                }, z.core.$strict>>;
                                tools: z.ZodDefault<z.ZodObject<{
                                    deny: z.ZodArray<z.ZodString>;
                                }, z.core.$strict>>;
                                memory: z.ZodDefault<z.ZodObject<{
                                    enabled: z.ZodBoolean;
                                    injectLimit: z.ZodNumber;
                                }, z.core.$strict>>;
                                order: z.ZodOptional<z.ZodNumber>;
                            }, z.core.$strict>;
                            skillsManifest: z.ZodDefault<z.ZodArray<z.ZodObject<{
                                path: z.ZodString;
                                content: z.ZodString;
                            }, z.core.$strict>>>;
                            connectorTemplates: z.ZodDefault<z.ZodArray<z.ZodObject<{
                                connectorId: z.ZodString;
                                enabled: z.ZodLiteral<false>;
                            }, z.core.$strict>>>;
                            channelTemplates: z.ZodDefault<z.ZodArray<z.ZodObject<{
                                kind: z.ZodEnum<{
                                    feishu: "feishu";
                                    telegram: "telegram";
                                    slack: "slack";
                                    email: "email";
                                    desktop: "desktop";
                                }>;
                                enabled: z.ZodLiteral<false>;
                            }, z.core.$strict>>>;
                            memoryRecords: z.ZodDefault<z.ZodArray<z.ZodObject<{
                                kind: z.ZodDefault<z.ZodEnum<{
                                    profile: "profile";
                                    preference: "preference";
                                    fact: "fact";
                                    note: "note";
                                }>>;
                                content: z.ZodString;
                                tags: z.ZodDefault<z.ZodArray<z.ZodString>>;
                                pinned: z.ZodDefault<z.ZodBoolean>;
                            }, z.core.$strict>>>;
                        }, z.core.$strict>;
                    }, z.core.$strict>, z.ZodObject<{
                        action: z.ZodLiteral<"previewMemories">;
                        bot: z.ZodObject<{
                            botId: z.ZodString;
                            botCreatedAt: z.ZodNumber;
                        }, z.core.$strict>;
                        document: z.ZodObject<{
                            format: z.ZodLiteral<"dsh-bot-export">;
                            version: z.ZodLiteral<1>;
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
                                model: z.ZodOptional<z.ZodObject<{
                                    provider: z.ZodString;
                                    model: z.ZodString;
                                    reasoningEffort: z.ZodOptional<z.ZodString>;
                                }, z.core.$strict>>;
                                tools: z.ZodDefault<z.ZodObject<{
                                    deny: z.ZodArray<z.ZodString>;
                                }, z.core.$strict>>;
                                memory: z.ZodDefault<z.ZodObject<{
                                    enabled: z.ZodBoolean;
                                    injectLimit: z.ZodNumber;
                                }, z.core.$strict>>;
                                order: z.ZodOptional<z.ZodNumber>;
                            }, z.core.$strict>;
                            skillsManifest: z.ZodDefault<z.ZodArray<z.ZodObject<{
                                path: z.ZodString;
                                content: z.ZodString;
                            }, z.core.$strict>>>;
                            connectorTemplates: z.ZodDefault<z.ZodArray<z.ZodObject<{
                                connectorId: z.ZodString;
                                enabled: z.ZodLiteral<false>;
                            }, z.core.$strict>>>;
                            channelTemplates: z.ZodDefault<z.ZodArray<z.ZodObject<{
                                kind: z.ZodEnum<{
                                    feishu: "feishu";
                                    telegram: "telegram";
                                    slack: "slack";
                                    email: "email";
                                    desktop: "desktop";
                                }>;
                                enabled: z.ZodLiteral<false>;
                            }, z.core.$strict>>>;
                            memoryRecords: z.ZodDefault<z.ZodArray<z.ZodObject<{
                                kind: z.ZodDefault<z.ZodEnum<{
                                    profile: "profile";
                                    preference: "preference";
                                    fact: "fact";
                                    note: "note";
                                }>>;
                                content: z.ZodString;
                                tags: z.ZodDefault<z.ZodArray<z.ZodString>>;
                                pinned: z.ZodDefault<z.ZodBoolean>;
                            }, z.core.$strict>>>;
                        }, z.core.$strict>;
                    }, z.core.$strict>, z.ZodObject<{
                        action: z.ZodLiteral<"inspect">;
                        previewId: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        action: z.ZodLiteral<"import">;
                        previewId: z.ZodString;
                        confirmed: z.ZodLiteral<true>;
                    }, z.core.$strict>], "action">;
                    encode: (v: unknown) => {
                        action: "summary";
                    } | {
                        action: "export";
                        bot: {
                            botId: string;
                            botCreatedAt: number;
                        };
                        includeSkills: boolean;
                        includeMemories: boolean;
                    } | {
                        action: "preview";
                        newId: string;
                        document: {
                            format: "dsh-bot-export";
                            version: 1;
                            bot: {
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
                                memory: {
                                    enabled: boolean;
                                    injectLimit: number;
                                };
                                avatar?: string | undefined;
                                avatarColor?: "--dsw-alias-state-business-primary" | "--dsw-alias-state-success-primary" | "--dsw-alias-state-warn-label" | "--dsw-alias-state-error-primary" | "teal" | "cyan" | "indigo" | "purple" | "rose" | "orange" | "olive" | "slate" | undefined;
                                avatarVariant?: "classic" | "glasses" | "spout" | "baby" | "hat" | "sleeping" | "auto" | undefined;
                                model?: {
                                    provider: string;
                                    model: string;
                                    reasoningEffort?: string | undefined;
                                } | undefined;
                                order?: number | undefined;
                            };
                            skillsManifest: {
                                path: string;
                                content: string;
                            }[];
                            connectorTemplates: {
                                connectorId: string;
                                enabled: false;
                            }[];
                            channelTemplates: {
                                kind: "feishu" | "telegram" | "slack" | "email" | "desktop";
                                enabled: false;
                            }[];
                            memoryRecords: {
                                kind: "profile" | "preference" | "fact" | "note";
                                content: string;
                                tags: string[];
                                pinned: boolean;
                            }[];
                        };
                    } | {
                        action: "previewMemories";
                        bot: {
                            botId: string;
                            botCreatedAt: number;
                        };
                        document: {
                            format: "dsh-bot-export";
                            version: 1;
                            bot: {
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
                                memory: {
                                    enabled: boolean;
                                    injectLimit: number;
                                };
                                avatar?: string | undefined;
                                avatarColor?: "--dsw-alias-state-business-primary" | "--dsw-alias-state-success-primary" | "--dsw-alias-state-warn-label" | "--dsw-alias-state-error-primary" | "teal" | "cyan" | "indigo" | "purple" | "rose" | "orange" | "olive" | "slate" | undefined;
                                avatarVariant?: "classic" | "glasses" | "spout" | "baby" | "hat" | "sleeping" | "auto" | undefined;
                                model?: {
                                    provider: string;
                                    model: string;
                                    reasoningEffort?: string | undefined;
                                } | undefined;
                                order?: number | undefined;
                            };
                            skillsManifest: {
                                path: string;
                                content: string;
                            }[];
                            connectorTemplates: {
                                connectorId: string;
                                enabled: false;
                            }[];
                            channelTemplates: {
                                kind: "feishu" | "telegram" | "slack" | "email" | "desktop";
                                enabled: false;
                            }[];
                            memoryRecords: {
                                kind: "profile" | "preference" | "fact" | "note";
                                content: string;
                                tags: string[];
                                pinned: boolean;
                            }[];
                        };
                    } | {
                        action: "inspect";
                        previewId: string;
                    } | {
                        action: "import";
                        previewId: string;
                        confirmed: true;
                    };
                    decode: (v: unknown) => {
                        action: "summary";
                    } | {
                        action: "export";
                        bot: {
                            botId: string;
                            botCreatedAt: number;
                        };
                        includeSkills: boolean;
                        includeMemories: boolean;
                    } | {
                        action: "preview";
                        newId: string;
                        document: {
                            format: "dsh-bot-export";
                            version: 1;
                            bot: {
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
                                memory: {
                                    enabled: boolean;
                                    injectLimit: number;
                                };
                                avatar?: string | undefined;
                                avatarColor?: "--dsw-alias-state-business-primary" | "--dsw-alias-state-success-primary" | "--dsw-alias-state-warn-label" | "--dsw-alias-state-error-primary" | "teal" | "cyan" | "indigo" | "purple" | "rose" | "orange" | "olive" | "slate" | undefined;
                                avatarVariant?: "classic" | "glasses" | "spout" | "baby" | "hat" | "sleeping" | "auto" | undefined;
                                model?: {
                                    provider: string;
                                    model: string;
                                    reasoningEffort?: string | undefined;
                                } | undefined;
                                order?: number | undefined;
                            };
                            skillsManifest: {
                                path: string;
                                content: string;
                            }[];
                            connectorTemplates: {
                                connectorId: string;
                                enabled: false;
                            }[];
                            channelTemplates: {
                                kind: "feishu" | "telegram" | "slack" | "email" | "desktop";
                                enabled: false;
                            }[];
                            memoryRecords: {
                                kind: "profile" | "preference" | "fact" | "note";
                                content: string;
                                tags: string[];
                                pinned: boolean;
                            }[];
                        };
                    } | {
                        action: "previewMemories";
                        bot: {
                            botId: string;
                            botCreatedAt: number;
                        };
                        document: {
                            format: "dsh-bot-export";
                            version: 1;
                            bot: {
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
                                memory: {
                                    enabled: boolean;
                                    injectLimit: number;
                                };
                                avatar?: string | undefined;
                                avatarColor?: "--dsw-alias-state-business-primary" | "--dsw-alias-state-success-primary" | "--dsw-alias-state-warn-label" | "--dsw-alias-state-error-primary" | "teal" | "cyan" | "indigo" | "purple" | "rose" | "orange" | "olive" | "slate" | undefined;
                                avatarVariant?: "classic" | "glasses" | "spout" | "baby" | "hat" | "sleeping" | "auto" | undefined;
                                model?: {
                                    provider: string;
                                    model: string;
                                    reasoningEffort?: string | undefined;
                                } | undefined;
                                order?: number | undefined;
                            };
                            skillsManifest: {
                                path: string;
                                content: string;
                            }[];
                            connectorTemplates: {
                                connectorId: string;
                                enabled: false;
                            }[];
                            channelTemplates: {
                                kind: "feishu" | "telegram" | "slack" | "email" | "desktop";
                                enabled: false;
                            }[];
                            memoryRecords: {
                                kind: "profile" | "preference" | "fact" | "note";
                                content: string;
                                tags: string[];
                                pinned: boolean;
                            }[];
                        };
                    } | {
                        action: "inspect";
                        previewId: string;
                    } | {
                        action: "import";
                        previewId: string;
                        confirmed: true;
                    };
                };
                strictCodec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodDiscriminatedUnion<[z.ZodObject<{
                        action: z.ZodLiteral<"summary">;
                    }, z.core.$strict>, z.ZodObject<{
                        action: z.ZodLiteral<"export">;
                        bot: z.ZodObject<{
                            botId: z.ZodString;
                            botCreatedAt: z.ZodNumber;
                        }, z.core.$strict>;
                        includeSkills: z.ZodBoolean;
                        includeMemories: z.ZodBoolean;
                    }, z.core.$strict>, z.ZodObject<{
                        action: z.ZodLiteral<"preview">;
                        newId: z.ZodString;
                        document: z.ZodObject<{
                            format: z.ZodLiteral<"dsh-bot-export">;
                            version: z.ZodLiteral<1>;
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
                                model: z.ZodOptional<z.ZodObject<{
                                    provider: z.ZodString;
                                    model: z.ZodString;
                                    reasoningEffort: z.ZodOptional<z.ZodString>;
                                }, z.core.$strict>>;
                                tools: z.ZodDefault<z.ZodObject<{
                                    deny: z.ZodArray<z.ZodString>;
                                }, z.core.$strict>>;
                                memory: z.ZodDefault<z.ZodObject<{
                                    enabled: z.ZodBoolean;
                                    injectLimit: z.ZodNumber;
                                }, z.core.$strict>>;
                                order: z.ZodOptional<z.ZodNumber>;
                            }, z.core.$strict>;
                            skillsManifest: z.ZodDefault<z.ZodArray<z.ZodObject<{
                                path: z.ZodString;
                                content: z.ZodString;
                            }, z.core.$strict>>>;
                            connectorTemplates: z.ZodDefault<z.ZodArray<z.ZodObject<{
                                connectorId: z.ZodString;
                                enabled: z.ZodLiteral<false>;
                            }, z.core.$strict>>>;
                            channelTemplates: z.ZodDefault<z.ZodArray<z.ZodObject<{
                                kind: z.ZodEnum<{
                                    feishu: "feishu";
                                    telegram: "telegram";
                                    slack: "slack";
                                    email: "email";
                                    desktop: "desktop";
                                }>;
                                enabled: z.ZodLiteral<false>;
                            }, z.core.$strict>>>;
                            memoryRecords: z.ZodDefault<z.ZodArray<z.ZodObject<{
                                kind: z.ZodDefault<z.ZodEnum<{
                                    profile: "profile";
                                    preference: "preference";
                                    fact: "fact";
                                    note: "note";
                                }>>;
                                content: z.ZodString;
                                tags: z.ZodDefault<z.ZodArray<z.ZodString>>;
                                pinned: z.ZodDefault<z.ZodBoolean>;
                            }, z.core.$strict>>>;
                        }, z.core.$strict>;
                    }, z.core.$strict>, z.ZodObject<{
                        action: z.ZodLiteral<"previewMemories">;
                        bot: z.ZodObject<{
                            botId: z.ZodString;
                            botCreatedAt: z.ZodNumber;
                        }, z.core.$strict>;
                        document: z.ZodObject<{
                            format: z.ZodLiteral<"dsh-bot-export">;
                            version: z.ZodLiteral<1>;
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
                                model: z.ZodOptional<z.ZodObject<{
                                    provider: z.ZodString;
                                    model: z.ZodString;
                                    reasoningEffort: z.ZodOptional<z.ZodString>;
                                }, z.core.$strict>>;
                                tools: z.ZodDefault<z.ZodObject<{
                                    deny: z.ZodArray<z.ZodString>;
                                }, z.core.$strict>>;
                                memory: z.ZodDefault<z.ZodObject<{
                                    enabled: z.ZodBoolean;
                                    injectLimit: z.ZodNumber;
                                }, z.core.$strict>>;
                                order: z.ZodOptional<z.ZodNumber>;
                            }, z.core.$strict>;
                            skillsManifest: z.ZodDefault<z.ZodArray<z.ZodObject<{
                                path: z.ZodString;
                                content: z.ZodString;
                            }, z.core.$strict>>>;
                            connectorTemplates: z.ZodDefault<z.ZodArray<z.ZodObject<{
                                connectorId: z.ZodString;
                                enabled: z.ZodLiteral<false>;
                            }, z.core.$strict>>>;
                            channelTemplates: z.ZodDefault<z.ZodArray<z.ZodObject<{
                                kind: z.ZodEnum<{
                                    feishu: "feishu";
                                    telegram: "telegram";
                                    slack: "slack";
                                    email: "email";
                                    desktop: "desktop";
                                }>;
                                enabled: z.ZodLiteral<false>;
                            }, z.core.$strict>>>;
                            memoryRecords: z.ZodDefault<z.ZodArray<z.ZodObject<{
                                kind: z.ZodDefault<z.ZodEnum<{
                                    profile: "profile";
                                    preference: "preference";
                                    fact: "fact";
                                    note: "note";
                                }>>;
                                content: z.ZodString;
                                tags: z.ZodDefault<z.ZodArray<z.ZodString>>;
                                pinned: z.ZodDefault<z.ZodBoolean>;
                            }, z.core.$strict>>>;
                        }, z.core.$strict>;
                    }, z.core.$strict>, z.ZodObject<{
                        action: z.ZodLiteral<"inspect">;
                        previewId: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        action: z.ZodLiteral<"import">;
                        previewId: z.ZodString;
                        confirmed: z.ZodLiteral<true>;
                    }, z.core.$strict>], "action">;
                    encode: (v: unknown) => {
                        action: "summary";
                    } | {
                        action: "export";
                        bot: {
                            botId: string;
                            botCreatedAt: number;
                        };
                        includeSkills: boolean;
                        includeMemories: boolean;
                    } | {
                        action: "preview";
                        newId: string;
                        document: {
                            format: "dsh-bot-export";
                            version: 1;
                            bot: {
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
                                memory: {
                                    enabled: boolean;
                                    injectLimit: number;
                                };
                                avatar?: string | undefined;
                                avatarColor?: "--dsw-alias-state-business-primary" | "--dsw-alias-state-success-primary" | "--dsw-alias-state-warn-label" | "--dsw-alias-state-error-primary" | "teal" | "cyan" | "indigo" | "purple" | "rose" | "orange" | "olive" | "slate" | undefined;
                                avatarVariant?: "classic" | "glasses" | "spout" | "baby" | "hat" | "sleeping" | "auto" | undefined;
                                model?: {
                                    provider: string;
                                    model: string;
                                    reasoningEffort?: string | undefined;
                                } | undefined;
                                order?: number | undefined;
                            };
                            skillsManifest: {
                                path: string;
                                content: string;
                            }[];
                            connectorTemplates: {
                                connectorId: string;
                                enabled: false;
                            }[];
                            channelTemplates: {
                                kind: "feishu" | "telegram" | "slack" | "email" | "desktop";
                                enabled: false;
                            }[];
                            memoryRecords: {
                                kind: "profile" | "preference" | "fact" | "note";
                                content: string;
                                tags: string[];
                                pinned: boolean;
                            }[];
                        };
                    } | {
                        action: "previewMemories";
                        bot: {
                            botId: string;
                            botCreatedAt: number;
                        };
                        document: {
                            format: "dsh-bot-export";
                            version: 1;
                            bot: {
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
                                memory: {
                                    enabled: boolean;
                                    injectLimit: number;
                                };
                                avatar?: string | undefined;
                                avatarColor?: "--dsw-alias-state-business-primary" | "--dsw-alias-state-success-primary" | "--dsw-alias-state-warn-label" | "--dsw-alias-state-error-primary" | "teal" | "cyan" | "indigo" | "purple" | "rose" | "orange" | "olive" | "slate" | undefined;
                                avatarVariant?: "classic" | "glasses" | "spout" | "baby" | "hat" | "sleeping" | "auto" | undefined;
                                model?: {
                                    provider: string;
                                    model: string;
                                    reasoningEffort?: string | undefined;
                                } | undefined;
                                order?: number | undefined;
                            };
                            skillsManifest: {
                                path: string;
                                content: string;
                            }[];
                            connectorTemplates: {
                                connectorId: string;
                                enabled: false;
                            }[];
                            channelTemplates: {
                                kind: "feishu" | "telegram" | "slack" | "email" | "desktop";
                                enabled: false;
                            }[];
                            memoryRecords: {
                                kind: "profile" | "preference" | "fact" | "note";
                                content: string;
                                tags: string[];
                                pinned: boolean;
                            }[];
                        };
                    } | {
                        action: "inspect";
                        previewId: string;
                    } | {
                        action: "import";
                        previewId: string;
                        confirmed: true;
                    };
                    decode: (v: unknown) => {
                        action: "summary";
                    } | {
                        action: "export";
                        bot: {
                            botId: string;
                            botCreatedAt: number;
                        };
                        includeSkills: boolean;
                        includeMemories: boolean;
                    } | {
                        action: "preview";
                        newId: string;
                        document: {
                            format: "dsh-bot-export";
                            version: 1;
                            bot: {
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
                                memory: {
                                    enabled: boolean;
                                    injectLimit: number;
                                };
                                avatar?: string | undefined;
                                avatarColor?: "--dsw-alias-state-business-primary" | "--dsw-alias-state-success-primary" | "--dsw-alias-state-warn-label" | "--dsw-alias-state-error-primary" | "teal" | "cyan" | "indigo" | "purple" | "rose" | "orange" | "olive" | "slate" | undefined;
                                avatarVariant?: "classic" | "glasses" | "spout" | "baby" | "hat" | "sleeping" | "auto" | undefined;
                                model?: {
                                    provider: string;
                                    model: string;
                                    reasoningEffort?: string | undefined;
                                } | undefined;
                                order?: number | undefined;
                            };
                            skillsManifest: {
                                path: string;
                                content: string;
                            }[];
                            connectorTemplates: {
                                connectorId: string;
                                enabled: false;
                            }[];
                            channelTemplates: {
                                kind: "feishu" | "telegram" | "slack" | "email" | "desktop";
                                enabled: false;
                            }[];
                            memoryRecords: {
                                kind: "profile" | "preference" | "fact" | "note";
                                content: string;
                                tags: string[];
                                pinned: boolean;
                            }[];
                        };
                    } | {
                        action: "previewMemories";
                        bot: {
                            botId: string;
                            botCreatedAt: number;
                        };
                        document: {
                            format: "dsh-bot-export";
                            version: 1;
                            bot: {
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
                                memory: {
                                    enabled: boolean;
                                    injectLimit: number;
                                };
                                avatar?: string | undefined;
                                avatarColor?: "--dsw-alias-state-business-primary" | "--dsw-alias-state-success-primary" | "--dsw-alias-state-warn-label" | "--dsw-alias-state-error-primary" | "teal" | "cyan" | "indigo" | "purple" | "rose" | "orange" | "olive" | "slate" | undefined;
                                avatarVariant?: "classic" | "glasses" | "spout" | "baby" | "hat" | "sleeping" | "auto" | undefined;
                                model?: {
                                    provider: string;
                                    model: string;
                                    reasoningEffort?: string | undefined;
                                } | undefined;
                                order?: number | undefined;
                            };
                            skillsManifest: {
                                path: string;
                                content: string;
                            }[];
                            connectorTemplates: {
                                connectorId: string;
                                enabled: false;
                            }[];
                            channelTemplates: {
                                kind: "feishu" | "telegram" | "slack" | "email" | "desktop";
                                enabled: false;
                            }[];
                            memoryRecords: {
                                kind: "profile" | "preference" | "fact" | "note";
                                content: string;
                                tags: string[];
                                pinned: boolean;
                            }[];
                        };
                    } | {
                        action: "inspect";
                        previewId: string;
                    } | {
                        action: "import";
                        previewId: string;
                        confirmed: true;
                    };
                };
            }];
            readonly result: {
                mode: "strict";
                typeSymbol: string;
                create: () => z.ZodDiscriminatedUnion<[z.ZodObject<{
                    kind: z.ZodLiteral<"summary">;
                    summary: z.ZodObject<{
                        available: z.ZodBoolean;
                        sampleSize: z.ZodNumber;
                        accepted: z.ZodNumber;
                        completed: z.ZodNumber;
                        failed: z.ZodNumber;
                        unknown: z.ZodNumber;
                    }, z.core.$strict>;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"export">;
                    document: z.ZodObject<{
                        format: z.ZodLiteral<"dsh-bot-export">;
                        version: z.ZodLiteral<1>;
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
                            model: z.ZodOptional<z.ZodObject<{
                                provider: z.ZodString;
                                model: z.ZodString;
                                reasoningEffort: z.ZodOptional<z.ZodString>;
                            }, z.core.$strict>>;
                            tools: z.ZodDefault<z.ZodObject<{
                                deny: z.ZodArray<z.ZodString>;
                            }, z.core.$strict>>;
                            memory: z.ZodDefault<z.ZodObject<{
                                enabled: z.ZodBoolean;
                                injectLimit: z.ZodNumber;
                            }, z.core.$strict>>;
                            order: z.ZodOptional<z.ZodNumber>;
                        }, z.core.$strict>;
                        skillsManifest: z.ZodDefault<z.ZodArray<z.ZodObject<{
                            path: z.ZodString;
                            content: z.ZodString;
                        }, z.core.$strict>>>;
                        connectorTemplates: z.ZodDefault<z.ZodArray<z.ZodObject<{
                            connectorId: z.ZodString;
                            enabled: z.ZodLiteral<false>;
                        }, z.core.$strict>>>;
                        channelTemplates: z.ZodDefault<z.ZodArray<z.ZodObject<{
                            kind: z.ZodEnum<{
                                feishu: "feishu";
                                telegram: "telegram";
                                slack: "slack";
                                email: "email";
                                desktop: "desktop";
                            }>;
                            enabled: z.ZodLiteral<false>;
                        }, z.core.$strict>>>;
                        memoryRecords: z.ZodDefault<z.ZodArray<z.ZodObject<{
                            kind: z.ZodDefault<z.ZodEnum<{
                                profile: "profile";
                                preference: "preference";
                                fact: "fact";
                                note: "note";
                            }>>;
                            content: z.ZodString;
                            tags: z.ZodDefault<z.ZodArray<z.ZodString>>;
                            pinned: z.ZodDefault<z.ZodBoolean>;
                        }, z.core.$strict>>>;
                    }, z.core.$strict>;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"preview">;
                    preview: z.ZodObject<{
                        id: z.ZodString;
                        newId: z.ZodString;
                        digest: z.ZodString;
                        files: z.ZodArray<z.ZodString>;
                        memories: z.ZodNumber;
                        connectorRefs: z.ZodArray<z.ZodString>;
                        missingConnectorRefs: z.ZodArray<z.ZodString>;
                        conflict: z.ZodBoolean;
                        phase: z.ZodEnum<{
                            failed: "failed";
                            preview: "preview";
                            committed: "committed";
                            applying: "applying";
                        }>;
                        createdBot: z.ZodOptional<z.ZodObject<{
                            botId: z.ZodString;
                            botCreatedAt: z.ZodNumber;
                        }, z.core.$strict>>;
                        scope: z.ZodDefault<z.ZodEnum<{
                            bot: "bot";
                            memories: "memories";
                        }>>;
                        targetBot: z.ZodOptional<z.ZodObject<{
                            botId: z.ZodString;
                            botCreatedAt: z.ZodNumber;
                        }, z.core.$strict>>;
                        targetDigest: z.ZodOptional<z.ZodString>;
                    }, z.core.$strict>;
                }, z.core.$strict>], "kind">;
                encode: (v: unknown) => {
                    kind: "summary";
                    summary: {
                        available: boolean;
                        sampleSize: number;
                        accepted: number;
                        completed: number;
                        failed: number;
                        unknown: number;
                    };
                } | {
                    kind: "export";
                    document: {
                        format: "dsh-bot-export";
                        version: 1;
                        bot: {
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
                            memory: {
                                enabled: boolean;
                                injectLimit: number;
                            };
                            avatar?: string | undefined;
                            avatarColor?: "--dsw-alias-state-business-primary" | "--dsw-alias-state-success-primary" | "--dsw-alias-state-warn-label" | "--dsw-alias-state-error-primary" | "teal" | "cyan" | "indigo" | "purple" | "rose" | "orange" | "olive" | "slate" | undefined;
                            avatarVariant?: "classic" | "glasses" | "spout" | "baby" | "hat" | "sleeping" | "auto" | undefined;
                            model?: {
                                provider: string;
                                model: string;
                                reasoningEffort?: string | undefined;
                            } | undefined;
                            order?: number | undefined;
                        };
                        skillsManifest: {
                            path: string;
                            content: string;
                        }[];
                        connectorTemplates: {
                            connectorId: string;
                            enabled: false;
                        }[];
                        channelTemplates: {
                            kind: "feishu" | "telegram" | "slack" | "email" | "desktop";
                            enabled: false;
                        }[];
                        memoryRecords: {
                            kind: "profile" | "preference" | "fact" | "note";
                            content: string;
                            tags: string[];
                            pinned: boolean;
                        }[];
                    };
                } | {
                    kind: "preview";
                    preview: {
                        id: string;
                        newId: string;
                        digest: string;
                        files: string[];
                        memories: number;
                        connectorRefs: string[];
                        missingConnectorRefs: string[];
                        conflict: boolean;
                        phase: "failed" | "preview" | "committed" | "applying";
                        scope: "bot" | "memories";
                        createdBot?: {
                            botId: string;
                            botCreatedAt: number;
                        } | undefined;
                        targetBot?: {
                            botId: string;
                            botCreatedAt: number;
                        } | undefined;
                        targetDigest?: string | undefined;
                    };
                };
                decode: (v: unknown) => {
                    kind: "summary";
                    summary: {
                        available: boolean;
                        sampleSize: number;
                        accepted: number;
                        completed: number;
                        failed: number;
                        unknown: number;
                    };
                } | {
                    kind: "export";
                    document: {
                        format: "dsh-bot-export";
                        version: 1;
                        bot: {
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
                            memory: {
                                enabled: boolean;
                                injectLimit: number;
                            };
                            avatar?: string | undefined;
                            avatarColor?: "--dsw-alias-state-business-primary" | "--dsw-alias-state-success-primary" | "--dsw-alias-state-warn-label" | "--dsw-alias-state-error-primary" | "teal" | "cyan" | "indigo" | "purple" | "rose" | "orange" | "olive" | "slate" | undefined;
                            avatarVariant?: "classic" | "glasses" | "spout" | "baby" | "hat" | "sleeping" | "auto" | undefined;
                            model?: {
                                provider: string;
                                model: string;
                                reasoningEffort?: string | undefined;
                            } | undefined;
                            order?: number | undefined;
                        };
                        skillsManifest: {
                            path: string;
                            content: string;
                        }[];
                        connectorTemplates: {
                            connectorId: string;
                            enabled: false;
                        }[];
                        channelTemplates: {
                            kind: "feishu" | "telegram" | "slack" | "email" | "desktop";
                            enabled: false;
                        }[];
                        memoryRecords: {
                            kind: "profile" | "preference" | "fact" | "note";
                            content: string;
                            tags: string[];
                            pinned: boolean;
                        }[];
                    };
                } | {
                    kind: "preview";
                    preview: {
                        id: string;
                        newId: string;
                        digest: string;
                        files: string[];
                        memories: number;
                        connectorRefs: string[];
                        missingConnectorRefs: string[];
                        conflict: boolean;
                        phase: "failed" | "preview" | "committed" | "applying";
                        scope: "bot" | "memories";
                        createdBot?: {
                            botId: string;
                            botCreatedAt: number;
                        } | undefined;
                        targetBot?: {
                            botId: string;
                            botCreatedAt: number;
                        } | undefined;
                        targetDigest?: string | undefined;
                    };
                };
            };
        };
        readonly 'dshBot.referenceMemory/request': {
            readonly service: "dshBotReferenceMemoryRemote";
            readonly invocation: {
                readonly kind: "direct";
            };
            readonly parameters: readonly [{
                name: string;
                source: "json";
                codec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodDiscriminatedUnion<[z.ZodObject<{
                        action: z.ZodLiteral<"status">;
                        bot: z.ZodObject<{
                            botId: z.ZodString;
                            botCreatedAt: z.ZodNumber;
                        }, z.core.$strict>;
                    }, z.core.$strict>, z.ZodObject<{
                        action: z.ZodLiteral<"configure">;
                        bot: z.ZodObject<{
                            botId: z.ZodString;
                            botCreatedAt: z.ZodNumber;
                        }, z.core.$strict>;
                        mode: z.ZodEnum<{
                            internal: "internal";
                            "internal+reference-graph": "internal+reference-graph";
                        }>;
                        expectedRevision: z.ZodNumber;
                    }, z.core.$strict>, z.ZodObject<{
                        action: z.ZodLiteral<"apply">;
                        bot: z.ZodObject<{
                            botId: z.ZodString;
                            botCreatedAt: z.ZodNumber;
                        }, z.core.$strict>;
                    }, z.core.$strict>, z.ZodObject<{
                        action: z.ZodLiteral<"tool">;
                        bot: z.ZodObject<{
                            botId: z.ZodString;
                            botCreatedAt: z.ZodNumber;
                        }, z.core.$strict>;
                        call: z.ZodDiscriminatedUnion<[z.ZodObject<{
                            tool: z.ZodLiteral<"read_graph">;
                            arguments: z.ZodObject<{}, z.core.$strict>;
                        }, z.core.$strict>, z.ZodObject<{
                            tool: z.ZodLiteral<"search_nodes">;
                            arguments: z.ZodObject<{
                                query: z.ZodString;
                            }, z.core.$strict>;
                        }, z.core.$strict>, z.ZodObject<{
                            tool: z.ZodLiteral<"create_entities">;
                            arguments: z.ZodObject<{
                                entities: z.ZodArray<z.ZodObject<{
                                    name: z.ZodString;
                                    entityType: z.ZodString;
                                    observations: z.ZodArray<z.ZodString>;
                                }, z.core.$strict>>;
                            }, z.core.$strict>;
                        }, z.core.$strict>, z.ZodObject<{
                            tool: z.ZodLiteral<"delete_entities">;
                            arguments: z.ZodObject<{
                                entityNames: z.ZodArray<z.ZodString>;
                            }, z.core.$strict>;
                        }, z.core.$strict>, z.ZodObject<{
                            tool: z.ZodLiteral<"open_nodes">;
                            arguments: z.ZodObject<{
                                names: z.ZodArray<z.ZodString>;
                            }, z.core.$strict>;
                        }, z.core.$strict>, z.ZodObject<{
                            tool: z.ZodLiteral<"create_relations">;
                            arguments: z.ZodObject<{
                                relations: z.ZodArray<z.ZodObject<{
                                    from: z.ZodString;
                                    to: z.ZodString;
                                    relationType: z.ZodString;
                                }, z.core.$strict>>;
                            }, z.core.$strict>;
                        }, z.core.$strict>, z.ZodObject<{
                            tool: z.ZodLiteral<"delete_relations">;
                            arguments: z.ZodObject<{
                                relations: z.ZodArray<z.ZodObject<{
                                    from: z.ZodString;
                                    to: z.ZodString;
                                    relationType: z.ZodString;
                                }, z.core.$strict>>;
                            }, z.core.$strict>;
                        }, z.core.$strict>, z.ZodObject<{
                            tool: z.ZodLiteral<"add_observations">;
                            arguments: z.ZodObject<{
                                observations: z.ZodArray<z.ZodObject<{
                                    entityName: z.ZodString;
                                    observations: z.ZodArray<z.ZodString>;
                                }, z.core.$strict>>;
                            }, z.core.$strict>;
                        }, z.core.$strict>, z.ZodObject<{
                            tool: z.ZodLiteral<"delete_observations">;
                            arguments: z.ZodObject<{
                                deletions: z.ZodArray<z.ZodObject<{
                                    entityName: z.ZodString;
                                    observations: z.ZodArray<z.ZodString>;
                                }, z.core.$strict>>;
                            }, z.core.$strict>;
                        }, z.core.$strict>], "tool">;
                    }, z.core.$strict>, z.ZodObject<{
                        action: z.ZodLiteral<"preview">;
                        bot: z.ZodObject<{
                            botId: z.ZodString;
                            botCreatedAt: z.ZodNumber;
                        }, z.core.$strict>;
                    }, z.core.$strict>, z.ZodObject<{
                        action: z.ZodLiteral<"stage">;
                        bot: z.ZodObject<{
                            botId: z.ZodString;
                            botCreatedAt: z.ZodNumber;
                        }, z.core.$strict>;
                        copyId: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        action: z.ZodLiteral<"commit">;
                        bot: z.ZodObject<{
                            botId: z.ZodString;
                            botCreatedAt: z.ZodNumber;
                        }, z.core.$strict>;
                        copyId: z.ZodString;
                        confirmed: z.ZodLiteral<true>;
                    }, z.core.$strict>, z.ZodObject<{
                        action: z.ZodLiteral<"rollback">;
                        bot: z.ZodObject<{
                            botId: z.ZodString;
                            botCreatedAt: z.ZodNumber;
                        }, z.core.$strict>;
                        copyId: z.ZodString;
                        confirmed: z.ZodLiteral<true>;
                    }, z.core.$strict>, z.ZodObject<{
                        action: z.ZodLiteral<"cancel">;
                        bot: z.ZodObject<{
                            botId: z.ZodString;
                            botCreatedAt: z.ZodNumber;
                        }, z.core.$strict>;
                        copyId: z.ZodString;
                        confirmed: z.ZodLiteral<true>;
                    }, z.core.$strict>], "action">;
                    encode: (v: unknown) => {
                        action: "status";
                        bot: {
                            botId: string;
                            botCreatedAt: number;
                        };
                    } | {
                        action: "configure";
                        bot: {
                            botId: string;
                            botCreatedAt: number;
                        };
                        mode: "internal" | "internal+reference-graph";
                        expectedRevision: number;
                    } | {
                        action: "apply";
                        bot: {
                            botId: string;
                            botCreatedAt: number;
                        };
                    } | {
                        action: "tool";
                        bot: {
                            botId: string;
                            botCreatedAt: number;
                        };
                        call: {
                            tool: "read_graph";
                            arguments: Record<string, never>;
                        } | {
                            tool: "search_nodes";
                            arguments: {
                                query: string;
                            };
                        } | {
                            tool: "create_entities";
                            arguments: {
                                entities: {
                                    name: string;
                                    entityType: string;
                                    observations: string[];
                                }[];
                            };
                        } | {
                            tool: "delete_entities";
                            arguments: {
                                entityNames: string[];
                            };
                        } | {
                            tool: "open_nodes";
                            arguments: {
                                names: string[];
                            };
                        } | {
                            tool: "create_relations";
                            arguments: {
                                relations: {
                                    from: string;
                                    to: string;
                                    relationType: string;
                                }[];
                            };
                        } | {
                            tool: "delete_relations";
                            arguments: {
                                relations: {
                                    from: string;
                                    to: string;
                                    relationType: string;
                                }[];
                            };
                        } | {
                            tool: "add_observations";
                            arguments: {
                                observations: {
                                    entityName: string;
                                    observations: string[];
                                }[];
                            };
                        } | {
                            tool: "delete_observations";
                            arguments: {
                                deletions: {
                                    entityName: string;
                                    observations: string[];
                                }[];
                            };
                        };
                    } | {
                        action: "preview";
                        bot: {
                            botId: string;
                            botCreatedAt: number;
                        };
                    } | {
                        action: "stage";
                        bot: {
                            botId: string;
                            botCreatedAt: number;
                        };
                        copyId: string;
                    } | {
                        action: "commit";
                        bot: {
                            botId: string;
                            botCreatedAt: number;
                        };
                        copyId: string;
                        confirmed: true;
                    } | {
                        action: "rollback";
                        bot: {
                            botId: string;
                            botCreatedAt: number;
                        };
                        copyId: string;
                        confirmed: true;
                    } | {
                        action: "cancel";
                        bot: {
                            botId: string;
                            botCreatedAt: number;
                        };
                        copyId: string;
                        confirmed: true;
                    };
                    decode: (v: unknown) => {
                        action: "status";
                        bot: {
                            botId: string;
                            botCreatedAt: number;
                        };
                    } | {
                        action: "configure";
                        bot: {
                            botId: string;
                            botCreatedAt: number;
                        };
                        mode: "internal" | "internal+reference-graph";
                        expectedRevision: number;
                    } | {
                        action: "apply";
                        bot: {
                            botId: string;
                            botCreatedAt: number;
                        };
                    } | {
                        action: "tool";
                        bot: {
                            botId: string;
                            botCreatedAt: number;
                        };
                        call: {
                            tool: "read_graph";
                            arguments: Record<string, never>;
                        } | {
                            tool: "search_nodes";
                            arguments: {
                                query: string;
                            };
                        } | {
                            tool: "create_entities";
                            arguments: {
                                entities: {
                                    name: string;
                                    entityType: string;
                                    observations: string[];
                                }[];
                            };
                        } | {
                            tool: "delete_entities";
                            arguments: {
                                entityNames: string[];
                            };
                        } | {
                            tool: "open_nodes";
                            arguments: {
                                names: string[];
                            };
                        } | {
                            tool: "create_relations";
                            arguments: {
                                relations: {
                                    from: string;
                                    to: string;
                                    relationType: string;
                                }[];
                            };
                        } | {
                            tool: "delete_relations";
                            arguments: {
                                relations: {
                                    from: string;
                                    to: string;
                                    relationType: string;
                                }[];
                            };
                        } | {
                            tool: "add_observations";
                            arguments: {
                                observations: {
                                    entityName: string;
                                    observations: string[];
                                }[];
                            };
                        } | {
                            tool: "delete_observations";
                            arguments: {
                                deletions: {
                                    entityName: string;
                                    observations: string[];
                                }[];
                            };
                        };
                    } | {
                        action: "preview";
                        bot: {
                            botId: string;
                            botCreatedAt: number;
                        };
                    } | {
                        action: "stage";
                        bot: {
                            botId: string;
                            botCreatedAt: number;
                        };
                        copyId: string;
                    } | {
                        action: "commit";
                        bot: {
                            botId: string;
                            botCreatedAt: number;
                        };
                        copyId: string;
                        confirmed: true;
                    } | {
                        action: "rollback";
                        bot: {
                            botId: string;
                            botCreatedAt: number;
                        };
                        copyId: string;
                        confirmed: true;
                    } | {
                        action: "cancel";
                        bot: {
                            botId: string;
                            botCreatedAt: number;
                        };
                        copyId: string;
                        confirmed: true;
                    };
                };
                strictCodec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodDiscriminatedUnion<[z.ZodObject<{
                        action: z.ZodLiteral<"status">;
                        bot: z.ZodObject<{
                            botId: z.ZodString;
                            botCreatedAt: z.ZodNumber;
                        }, z.core.$strict>;
                    }, z.core.$strict>, z.ZodObject<{
                        action: z.ZodLiteral<"configure">;
                        bot: z.ZodObject<{
                            botId: z.ZodString;
                            botCreatedAt: z.ZodNumber;
                        }, z.core.$strict>;
                        mode: z.ZodEnum<{
                            internal: "internal";
                            "internal+reference-graph": "internal+reference-graph";
                        }>;
                        expectedRevision: z.ZodNumber;
                    }, z.core.$strict>, z.ZodObject<{
                        action: z.ZodLiteral<"apply">;
                        bot: z.ZodObject<{
                            botId: z.ZodString;
                            botCreatedAt: z.ZodNumber;
                        }, z.core.$strict>;
                    }, z.core.$strict>, z.ZodObject<{
                        action: z.ZodLiteral<"tool">;
                        bot: z.ZodObject<{
                            botId: z.ZodString;
                            botCreatedAt: z.ZodNumber;
                        }, z.core.$strict>;
                        call: z.ZodDiscriminatedUnion<[z.ZodObject<{
                            tool: z.ZodLiteral<"read_graph">;
                            arguments: z.ZodObject<{}, z.core.$strict>;
                        }, z.core.$strict>, z.ZodObject<{
                            tool: z.ZodLiteral<"search_nodes">;
                            arguments: z.ZodObject<{
                                query: z.ZodString;
                            }, z.core.$strict>;
                        }, z.core.$strict>, z.ZodObject<{
                            tool: z.ZodLiteral<"create_entities">;
                            arguments: z.ZodObject<{
                                entities: z.ZodArray<z.ZodObject<{
                                    name: z.ZodString;
                                    entityType: z.ZodString;
                                    observations: z.ZodArray<z.ZodString>;
                                }, z.core.$strict>>;
                            }, z.core.$strict>;
                        }, z.core.$strict>, z.ZodObject<{
                            tool: z.ZodLiteral<"delete_entities">;
                            arguments: z.ZodObject<{
                                entityNames: z.ZodArray<z.ZodString>;
                            }, z.core.$strict>;
                        }, z.core.$strict>, z.ZodObject<{
                            tool: z.ZodLiteral<"open_nodes">;
                            arguments: z.ZodObject<{
                                names: z.ZodArray<z.ZodString>;
                            }, z.core.$strict>;
                        }, z.core.$strict>, z.ZodObject<{
                            tool: z.ZodLiteral<"create_relations">;
                            arguments: z.ZodObject<{
                                relations: z.ZodArray<z.ZodObject<{
                                    from: z.ZodString;
                                    to: z.ZodString;
                                    relationType: z.ZodString;
                                }, z.core.$strict>>;
                            }, z.core.$strict>;
                        }, z.core.$strict>, z.ZodObject<{
                            tool: z.ZodLiteral<"delete_relations">;
                            arguments: z.ZodObject<{
                                relations: z.ZodArray<z.ZodObject<{
                                    from: z.ZodString;
                                    to: z.ZodString;
                                    relationType: z.ZodString;
                                }, z.core.$strict>>;
                            }, z.core.$strict>;
                        }, z.core.$strict>, z.ZodObject<{
                            tool: z.ZodLiteral<"add_observations">;
                            arguments: z.ZodObject<{
                                observations: z.ZodArray<z.ZodObject<{
                                    entityName: z.ZodString;
                                    observations: z.ZodArray<z.ZodString>;
                                }, z.core.$strict>>;
                            }, z.core.$strict>;
                        }, z.core.$strict>, z.ZodObject<{
                            tool: z.ZodLiteral<"delete_observations">;
                            arguments: z.ZodObject<{
                                deletions: z.ZodArray<z.ZodObject<{
                                    entityName: z.ZodString;
                                    observations: z.ZodArray<z.ZodString>;
                                }, z.core.$strict>>;
                            }, z.core.$strict>;
                        }, z.core.$strict>], "tool">;
                    }, z.core.$strict>, z.ZodObject<{
                        action: z.ZodLiteral<"preview">;
                        bot: z.ZodObject<{
                            botId: z.ZodString;
                            botCreatedAt: z.ZodNumber;
                        }, z.core.$strict>;
                    }, z.core.$strict>, z.ZodObject<{
                        action: z.ZodLiteral<"stage">;
                        bot: z.ZodObject<{
                            botId: z.ZodString;
                            botCreatedAt: z.ZodNumber;
                        }, z.core.$strict>;
                        copyId: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        action: z.ZodLiteral<"commit">;
                        bot: z.ZodObject<{
                            botId: z.ZodString;
                            botCreatedAt: z.ZodNumber;
                        }, z.core.$strict>;
                        copyId: z.ZodString;
                        confirmed: z.ZodLiteral<true>;
                    }, z.core.$strict>, z.ZodObject<{
                        action: z.ZodLiteral<"rollback">;
                        bot: z.ZodObject<{
                            botId: z.ZodString;
                            botCreatedAt: z.ZodNumber;
                        }, z.core.$strict>;
                        copyId: z.ZodString;
                        confirmed: z.ZodLiteral<true>;
                    }, z.core.$strict>, z.ZodObject<{
                        action: z.ZodLiteral<"cancel">;
                        bot: z.ZodObject<{
                            botId: z.ZodString;
                            botCreatedAt: z.ZodNumber;
                        }, z.core.$strict>;
                        copyId: z.ZodString;
                        confirmed: z.ZodLiteral<true>;
                    }, z.core.$strict>], "action">;
                    encode: (v: unknown) => {
                        action: "status";
                        bot: {
                            botId: string;
                            botCreatedAt: number;
                        };
                    } | {
                        action: "configure";
                        bot: {
                            botId: string;
                            botCreatedAt: number;
                        };
                        mode: "internal" | "internal+reference-graph";
                        expectedRevision: number;
                    } | {
                        action: "apply";
                        bot: {
                            botId: string;
                            botCreatedAt: number;
                        };
                    } | {
                        action: "tool";
                        bot: {
                            botId: string;
                            botCreatedAt: number;
                        };
                        call: {
                            tool: "read_graph";
                            arguments: Record<string, never>;
                        } | {
                            tool: "search_nodes";
                            arguments: {
                                query: string;
                            };
                        } | {
                            tool: "create_entities";
                            arguments: {
                                entities: {
                                    name: string;
                                    entityType: string;
                                    observations: string[];
                                }[];
                            };
                        } | {
                            tool: "delete_entities";
                            arguments: {
                                entityNames: string[];
                            };
                        } | {
                            tool: "open_nodes";
                            arguments: {
                                names: string[];
                            };
                        } | {
                            tool: "create_relations";
                            arguments: {
                                relations: {
                                    from: string;
                                    to: string;
                                    relationType: string;
                                }[];
                            };
                        } | {
                            tool: "delete_relations";
                            arguments: {
                                relations: {
                                    from: string;
                                    to: string;
                                    relationType: string;
                                }[];
                            };
                        } | {
                            tool: "add_observations";
                            arguments: {
                                observations: {
                                    entityName: string;
                                    observations: string[];
                                }[];
                            };
                        } | {
                            tool: "delete_observations";
                            arguments: {
                                deletions: {
                                    entityName: string;
                                    observations: string[];
                                }[];
                            };
                        };
                    } | {
                        action: "preview";
                        bot: {
                            botId: string;
                            botCreatedAt: number;
                        };
                    } | {
                        action: "stage";
                        bot: {
                            botId: string;
                            botCreatedAt: number;
                        };
                        copyId: string;
                    } | {
                        action: "commit";
                        bot: {
                            botId: string;
                            botCreatedAt: number;
                        };
                        copyId: string;
                        confirmed: true;
                    } | {
                        action: "rollback";
                        bot: {
                            botId: string;
                            botCreatedAt: number;
                        };
                        copyId: string;
                        confirmed: true;
                    } | {
                        action: "cancel";
                        bot: {
                            botId: string;
                            botCreatedAt: number;
                        };
                        copyId: string;
                        confirmed: true;
                    };
                    decode: (v: unknown) => {
                        action: "status";
                        bot: {
                            botId: string;
                            botCreatedAt: number;
                        };
                    } | {
                        action: "configure";
                        bot: {
                            botId: string;
                            botCreatedAt: number;
                        };
                        mode: "internal" | "internal+reference-graph";
                        expectedRevision: number;
                    } | {
                        action: "apply";
                        bot: {
                            botId: string;
                            botCreatedAt: number;
                        };
                    } | {
                        action: "tool";
                        bot: {
                            botId: string;
                            botCreatedAt: number;
                        };
                        call: {
                            tool: "read_graph";
                            arguments: Record<string, never>;
                        } | {
                            tool: "search_nodes";
                            arguments: {
                                query: string;
                            };
                        } | {
                            tool: "create_entities";
                            arguments: {
                                entities: {
                                    name: string;
                                    entityType: string;
                                    observations: string[];
                                }[];
                            };
                        } | {
                            tool: "delete_entities";
                            arguments: {
                                entityNames: string[];
                            };
                        } | {
                            tool: "open_nodes";
                            arguments: {
                                names: string[];
                            };
                        } | {
                            tool: "create_relations";
                            arguments: {
                                relations: {
                                    from: string;
                                    to: string;
                                    relationType: string;
                                }[];
                            };
                        } | {
                            tool: "delete_relations";
                            arguments: {
                                relations: {
                                    from: string;
                                    to: string;
                                    relationType: string;
                                }[];
                            };
                        } | {
                            tool: "add_observations";
                            arguments: {
                                observations: {
                                    entityName: string;
                                    observations: string[];
                                }[];
                            };
                        } | {
                            tool: "delete_observations";
                            arguments: {
                                deletions: {
                                    entityName: string;
                                    observations: string[];
                                }[];
                            };
                        };
                    } | {
                        action: "preview";
                        bot: {
                            botId: string;
                            botCreatedAt: number;
                        };
                    } | {
                        action: "stage";
                        bot: {
                            botId: string;
                            botCreatedAt: number;
                        };
                        copyId: string;
                    } | {
                        action: "commit";
                        bot: {
                            botId: string;
                            botCreatedAt: number;
                        };
                        copyId: string;
                        confirmed: true;
                    } | {
                        action: "rollback";
                        bot: {
                            botId: string;
                            botCreatedAt: number;
                        };
                        copyId: string;
                        confirmed: true;
                    } | {
                        action: "cancel";
                        bot: {
                            botId: string;
                            botCreatedAt: number;
                        };
                        copyId: string;
                        confirmed: true;
                    };
                };
            }];
            readonly result: {
                mode: "strict";
                typeSymbol: string;
                create: () => z.ZodObject<{
                    status: z.ZodObject<{
                        bot: z.ZodObject<{
                            botId: z.ZodString;
                            botCreatedAt: z.ZodNumber;
                        }, z.core.$strict>;
                        binding: z.ZodOptional<z.ZodObject<{
                            bot: z.ZodObject<{
                                botId: z.ZodString;
                                botCreatedAt: z.ZodNumber;
                            }, z.core.$strict>;
                            mode: z.ZodEnum<{
                                internal: "internal";
                                "internal+reference-graph": "internal+reference-graph";
                            }>;
                            provider: z.ZodLiteral<"mcp-reference">;
                            packageVersion: z.ZodLiteral<"2026.7.4">;
                            sourceCommit: z.ZodLiteral<"6dd0a683e198783e30feabf7abaf42f925bd18b1">;
                            fileIdentity: z.ZodString;
                            scope: z.ZodLiteral<"main-only">;
                            revision: z.ZodNumber;
                            importId: z.ZodOptional<z.ZodString>;
                        }, z.core.$strict>>;
                        state: z.ZodEnum<{
                            pending: "pending";
                            unavailable: "unavailable";
                            ready: "ready";
                            internal: "internal";
                        }>;
                        reason: z.ZodOptional<z.ZodEnum<{
                            unsupported: "unsupported";
                            busy: "busy";
                            "initialization-failed": "initialization-failed";
                            stopping: "stopping";
                            "main-only": "main-only";
                            "writer-conflict": "writer-conflict";
                            "invalid-file": "invalid-file";
                            "copy-in-progress": "copy-in-progress";
                        }>>;
                        toolCount: z.ZodNumber;
                        writer: z.ZodBoolean;
                        copies: z.ZodArray<z.ZodObject<{
                            id: z.ZodString;
                            bot: z.ZodObject<{
                                botId: z.ZodString;
                                botCreatedAt: z.ZodNumber;
                            }, z.core.$strict>;
                            sourceDigest: z.ZodString;
                            targetFileIdentity: z.ZodString;
                            previousFileIdentity: z.ZodString;
                            bindingRevision: z.ZodNumber;
                            phase: z.ZodEnum<{
                                failed: "failed";
                                verified: "verified";
                                preview: "preview";
                                staging: "staging";
                                committed: "committed";
                                "rolled-back": "rolled-back";
                            }>;
                            records: z.ZodArray<z.ZodObject<{
                                memoryId: z.ZodString;
                                digest: z.ZodString;
                                targetEntityName: z.ZodString;
                                status: z.ZodEnum<{
                                    pending: "pending";
                                    verified: "verified";
                                    written: "written";
                                }>;
                            }, z.core.$strict>>;
                            startedAt: z.ZodNumber;
                            verifiedAt: z.ZodOptional<z.ZodNumber>;
                            committedAt: z.ZodOptional<z.ZodNumber>;
                        }, z.core.$strict>>;
                    }, z.core.$strict>;
                    graph: z.ZodOptional<z.ZodObject<{
                        entities: z.ZodArray<z.ZodObject<{
                            name: z.ZodString;
                            entityType: z.ZodString;
                            observations: z.ZodArray<z.ZodString>;
                        }, z.core.$strict>>;
                        relations: z.ZodArray<z.ZodObject<{
                            from: z.ZodString;
                            to: z.ZodString;
                            relationType: z.ZodString;
                        }, z.core.$strict>>;
                    }, z.core.$strict>>;
                    copy: z.ZodOptional<z.ZodObject<{
                        id: z.ZodString;
                        bot: z.ZodObject<{
                            botId: z.ZodString;
                            botCreatedAt: z.ZodNumber;
                        }, z.core.$strict>;
                        sourceDigest: z.ZodString;
                        targetFileIdentity: z.ZodString;
                        previousFileIdentity: z.ZodString;
                        bindingRevision: z.ZodNumber;
                        phase: z.ZodEnum<{
                            failed: "failed";
                            verified: "verified";
                            preview: "preview";
                            staging: "staging";
                            committed: "committed";
                            "rolled-back": "rolled-back";
                        }>;
                        records: z.ZodArray<z.ZodObject<{
                            memoryId: z.ZodString;
                            digest: z.ZodString;
                            targetEntityName: z.ZodString;
                            status: z.ZodEnum<{
                                pending: "pending";
                                verified: "verified";
                                written: "written";
                            }>;
                        }, z.core.$strict>>;
                        startedAt: z.ZodNumber;
                        verifiedAt: z.ZodOptional<z.ZodNumber>;
                        committedAt: z.ZodOptional<z.ZodNumber>;
                    }, z.core.$strict>>;
                }, z.core.$strict>;
                encode: (v: unknown) => {
                    status: {
                        bot: {
                            botId: string;
                            botCreatedAt: number;
                        };
                        state: "pending" | "unavailable" | "ready" | "internal";
                        toolCount: number;
                        writer: boolean;
                        copies: {
                            id: string;
                            bot: {
                                botId: string;
                                botCreatedAt: number;
                            };
                            sourceDigest: string;
                            targetFileIdentity: string;
                            previousFileIdentity: string;
                            bindingRevision: number;
                            phase: "failed" | "verified" | "preview" | "staging" | "committed" | "rolled-back";
                            records: {
                                memoryId: string;
                                digest: string;
                                targetEntityName: string;
                                status: "pending" | "verified" | "written";
                            }[];
                            startedAt: number;
                            verifiedAt?: number | undefined;
                            committedAt?: number | undefined;
                        }[];
                        binding?: {
                            bot: {
                                botId: string;
                                botCreatedAt: number;
                            };
                            mode: "internal" | "internal+reference-graph";
                            provider: "mcp-reference";
                            packageVersion: "2026.7.4";
                            sourceCommit: "6dd0a683e198783e30feabf7abaf42f925bd18b1";
                            fileIdentity: string;
                            scope: "main-only";
                            revision: number;
                            importId?: string | undefined;
                        } | undefined;
                        reason?: "unsupported" | "busy" | "initialization-failed" | "stopping" | "main-only" | "writer-conflict" | "invalid-file" | "copy-in-progress" | undefined;
                    };
                    graph?: {
                        entities: {
                            name: string;
                            entityType: string;
                            observations: string[];
                        }[];
                        relations: {
                            from: string;
                            to: string;
                            relationType: string;
                        }[];
                    } | undefined;
                    copy?: {
                        id: string;
                        bot: {
                            botId: string;
                            botCreatedAt: number;
                        };
                        sourceDigest: string;
                        targetFileIdentity: string;
                        previousFileIdentity: string;
                        bindingRevision: number;
                        phase: "failed" | "verified" | "preview" | "staging" | "committed" | "rolled-back";
                        records: {
                            memoryId: string;
                            digest: string;
                            targetEntityName: string;
                            status: "pending" | "verified" | "written";
                        }[];
                        startedAt: number;
                        verifiedAt?: number | undefined;
                        committedAt?: number | undefined;
                    } | undefined;
                };
                decode: (v: unknown) => {
                    status: {
                        bot: {
                            botId: string;
                            botCreatedAt: number;
                        };
                        state: "pending" | "unavailable" | "ready" | "internal";
                        toolCount: number;
                        writer: boolean;
                        copies: {
                            id: string;
                            bot: {
                                botId: string;
                                botCreatedAt: number;
                            };
                            sourceDigest: string;
                            targetFileIdentity: string;
                            previousFileIdentity: string;
                            bindingRevision: number;
                            phase: "failed" | "verified" | "preview" | "staging" | "committed" | "rolled-back";
                            records: {
                                memoryId: string;
                                digest: string;
                                targetEntityName: string;
                                status: "pending" | "verified" | "written";
                            }[];
                            startedAt: number;
                            verifiedAt?: number | undefined;
                            committedAt?: number | undefined;
                        }[];
                        binding?: {
                            bot: {
                                botId: string;
                                botCreatedAt: number;
                            };
                            mode: "internal" | "internal+reference-graph";
                            provider: "mcp-reference";
                            packageVersion: "2026.7.4";
                            sourceCommit: "6dd0a683e198783e30feabf7abaf42f925bd18b1";
                            fileIdentity: string;
                            scope: "main-only";
                            revision: number;
                            importId?: string | undefined;
                        } | undefined;
                        reason?: "unsupported" | "busy" | "initialization-failed" | "stopping" | "main-only" | "writer-conflict" | "invalid-file" | "copy-in-progress" | undefined;
                    };
                    graph?: {
                        entities: {
                            name: string;
                            entityType: string;
                            observations: string[];
                        }[];
                        relations: {
                            from: string;
                            to: string;
                            relationType: string;
                        }[];
                    } | undefined;
                    copy?: {
                        id: string;
                        bot: {
                            botId: string;
                            botCreatedAt: number;
                        };
                        sourceDigest: string;
                        targetFileIdentity: string;
                        previousFileIdentity: string;
                        bindingRevision: number;
                        phase: "failed" | "verified" | "preview" | "staging" | "committed" | "rolled-back";
                        records: {
                            memoryId: string;
                            digest: string;
                            targetEntityName: string;
                            status: "pending" | "verified" | "written";
                        }[];
                        startedAt: number;
                        verifiedAt?: number | undefined;
                        committedAt?: number | undefined;
                    } | undefined;
                };
            };
        };
    };
};
export interface WorkspaceMethods {
    request(input: z.input<typeof workspaceRequestSchema>): Promise<RemoteResult<z.output<typeof workspaceResultSchema>>>;
}
export interface ReferenceMemoryMethods {
    request(input: z.input<typeof graphRequestSchema>): Promise<RemoteResult<z.output<typeof graphResultSchema>>>;
}
declare module '@deepseek-ai/dsh-typert-protocol' {
    interface TypertRemoteMap {
        'dshBot.workspace/request': WorkspaceMethods['request'];
        'dshBot.referenceMemory/request': ReferenceMemoryMethods['request'];
    }
    interface TypertRemoteNamespaceMap {
        'dshBot.workspace': WorkspaceMethods;
        'dshBot.referenceMemory': ReferenceMemoryMethods;
    }
}
export declare const WORKSPACE_REMOTE: import("@deepseek-ai/dsh-typert-protocol").TypertRemoteInfo<Readonly<Record<string, import("@deepseek-ai/dsh-typert-protocol").TypertRemoteMethod<object, unknown, "unary", never, unknown> | import("@deepseek-ai/dsh-typert-protocol").TypertRemoteMethod<object, unknown, "stream", unknown, unknown>>>>;
