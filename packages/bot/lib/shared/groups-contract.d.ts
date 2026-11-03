import { z } from 'zod';
import type { RemoteResult } from '@deepseek-ai/dsh-typert-protocol';
export declare const groupsSpec: {
    readonly package: "dsh-bot/groups";
    readonly methods: {
        readonly 'dshBot.groups/open': {
            readonly parameters: readonly [{
                name: string;
                source: "json";
                codec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodObject<{
                        groupId: z.ZodString;
                        groupCreatedAt: z.ZodNumber;
                    }, z.core.$strict>;
                    encode: (v: unknown) => {
                        groupId: string;
                        groupCreatedAt: number;
                    };
                    decode: (v: unknown) => {
                        groupId: string;
                        groupCreatedAt: number;
                    };
                };
                strictCodec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodObject<{
                        groupId: z.ZodString;
                        groupCreatedAt: z.ZodNumber;
                    }, z.core.$strict>;
                    encode: (v: unknown) => {
                        groupId: string;
                        groupCreatedAt: number;
                    };
                    decode: (v: unknown) => {
                        groupId: string;
                        groupCreatedAt: number;
                    };
                };
            }];
            readonly result: {
                mode: "strict";
                typeSymbol: string;
                create: () => z.ZodObject<{
                    sessionId: z.ZodString;
                    workspaceId: z.ZodString;
                }, z.core.$strict>;
                encode: (v: unknown) => {
                    sessionId: string;
                    workspaceId: string;
                };
                decode: (v: unknown) => {
                    sessionId: string;
                    workspaceId: string;
                };
            };
            readonly service: string;
            readonly invocation: {
                kind: "direct";
            };
        };
        readonly 'dshBot.groups/openAttachment': {
            readonly parameters: readonly [{
                name: string;
                source: "json";
                codec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodObject<{
                        groupId: z.ZodString;
                        groupCreatedAt: z.ZodNumber;
                    }, z.core.$strict>;
                    encode: (v: unknown) => {
                        groupId: string;
                        groupCreatedAt: number;
                    };
                    decode: (v: unknown) => {
                        groupId: string;
                        groupCreatedAt: number;
                    };
                };
                strictCodec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodObject<{
                        groupId: z.ZodString;
                        groupCreatedAt: z.ZodNumber;
                    }, z.core.$strict>;
                    encode: (v: unknown) => {
                        groupId: string;
                        groupCreatedAt: number;
                    };
                    decode: (v: unknown) => {
                        groupId: string;
                        groupCreatedAt: number;
                    };
                };
            }, {
                name: string;
                source: "json";
                codec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodString;
                    encode: (v: unknown) => string;
                    decode: (v: unknown) => string;
                };
                strictCodec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodString;
                    encode: (v: unknown) => string;
                    decode: (v: unknown) => string;
                };
            }, {
                name: string;
                source: "json";
                codec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodString;
                    encode: (v: unknown) => string;
                    decode: (v: unknown) => string;
                };
                strictCodec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodString;
                    encode: (v: unknown) => string;
                    decode: (v: unknown) => string;
                };
            }];
            readonly result: {
                mode: "strict";
                typeSymbol: string;
                create: () => z.ZodObject<{
                    opened: z.ZodLiteral<true>;
                }, z.core.$strict>;
                encode: (v: unknown) => {
                    opened: true;
                };
                decode: (v: unknown) => {
                    opened: true;
                };
            };
            readonly service: string;
            readonly invocation: {
                kind: "direct";
            };
        };
        readonly 'dshBot.groups/markRead': {
            readonly parameters: readonly [{
                name: string;
                source: "json";
                codec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodObject<{
                        groupId: z.ZodString;
                        groupCreatedAt: z.ZodNumber;
                    }, z.core.$strict>;
                    encode: (v: unknown) => {
                        groupId: string;
                        groupCreatedAt: number;
                    };
                    decode: (v: unknown) => {
                        groupId: string;
                        groupCreatedAt: number;
                    };
                };
                strictCodec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodObject<{
                        groupId: z.ZodString;
                        groupCreatedAt: z.ZodNumber;
                    }, z.core.$strict>;
                    encode: (v: unknown) => {
                        groupId: string;
                        groupCreatedAt: number;
                    };
                    decode: (v: unknown) => {
                        groupId: string;
                        groupCreatedAt: number;
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
                create: () => z.ZodBoolean;
                encode: (v: unknown) => boolean;
                decode: (v: unknown) => boolean;
            };
            readonly service: string;
            readonly invocation: {
                kind: "direct";
            };
        };
        readonly 'dshBot.groups/list': {
            readonly parameters: readonly [];
            readonly result: {
                mode: "strict";
                typeSymbol: string;
                create: () => z.ZodArray<z.ZodObject<{
                    latest: z.ZodOptional<z.ZodObject<{
                        seq: z.ZodNumber;
                        at: z.ZodNumber;
                        speaker: z.ZodOptional<z.ZodObject<{
                            bot: z.ZodObject<{
                                botId: z.ZodString;
                                botCreatedAt: z.ZodNumber;
                            }, z.core.$strict>;
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
                    }, z.core.$strict>>;
                    unread: z.ZodDefault<z.ZodBoolean>;
                    readRevision: z.ZodDefault<z.ZodNumber>;
                    group: z.ZodObject<{
                        id: z.ZodString;
                        operationId: z.ZodString;
                        createDigest: z.ZodString;
                        createdAt: z.ZodNumber;
                        updatedAt: z.ZodNumber;
                        schemaVersion: z.ZodLiteral<1>;
                        name: z.ZodString;
                        rootSessionId: z.ZodString;
                        rootPresetId: z.ZodLiteral<"dsh-bot-group-root">;
                        cwd: z.ZodString;
                        mode: z.ZodEnum<{
                            natural: "natural";
                            mention: "mention";
                            "round-robin": "round-robin";
                        }>;
                        modelSelection: z.ZodOptional<z.ZodObject<{
                            provider: z.ZodString;
                            model: z.ZodString;
                            reasoningEffort: z.ZodOptional<z.ZodString>;
                        }, z.core.$strict>>;
                        memberModelSelections: z.ZodOptional<z.ZodArray<z.ZodObject<{
                            memberId: z.ZodString;
                            modelSelection: z.ZodObject<{
                                provider: z.ZodString;
                                model: z.ZodString;
                                reasoningEffort: z.ZodOptional<z.ZodString>;
                            }, z.core.$strict>;
                        }, z.core.$strict>>>;
                        modelRevision: z.ZodOptional<z.ZodNumber>;
                        nextMemberId: z.ZodOptional<z.ZodString>;
                        membershipRevision: z.ZodNumber;
                        revision: z.ZodNumber;
                        archived: z.ZodBoolean;
                        state: z.ZodEnum<{
                            ready: "ready";
                            creating: "creating";
                            recovery_needed: "recovery_needed";
                        }>;
                    }, z.core.$strict>;
                    members: z.ZodArray<z.ZodObject<{
                        id: z.ZodString;
                        group: z.ZodObject<{
                            groupId: z.ZodString;
                            groupCreatedAt: z.ZodNumber;
                        }, z.core.$strict>;
                        bot: z.ZodObject<{
                            botId: z.ZodString;
                            botCreatedAt: z.ZodNumber;
                        }, z.core.$strict>;
                        order: z.ZodNumber;
                        joinedAt: z.ZodNumber;
                        removedAt: z.ZodOptional<z.ZodNumber>;
                        enabled: z.ZodBoolean;
                    }, z.core.$strict>>;
                    unavailableMemberIds: z.ZodArray<z.ZodString>;
                    running: z.ZodBoolean;
                    reason: z.ZodOptional<z.ZodEnum<{
                        "recovery-needed": "recovery-needed";
                        "root-owned-elsewhere": "root-owned-elsewhere";
                        "root-unavailable": "root-unavailable";
                    }>>;
                }, z.core.$strict>>;
                encode: (v: unknown) => {
                    unread: boolean;
                    readRevision: number;
                    group: {
                        id: string;
                        operationId: string;
                        createDigest: string;
                        createdAt: number;
                        updatedAt: number;
                        schemaVersion: 1;
                        name: string;
                        rootSessionId: string;
                        rootPresetId: "dsh-bot-group-root";
                        cwd: string;
                        mode: "natural" | "mention" | "round-robin";
                        membershipRevision: number;
                        revision: number;
                        archived: boolean;
                        state: "ready" | "creating" | "recovery_needed";
                        modelSelection?: {
                            provider: string;
                            model: string;
                            reasoningEffort?: string | undefined;
                        } | undefined;
                        memberModelSelections?: {
                            memberId: string;
                            modelSelection: {
                                provider: string;
                                model: string;
                                reasoningEffort?: string | undefined;
                            };
                        }[] | undefined;
                        modelRevision?: number | undefined;
                        nextMemberId?: string | undefined;
                    };
                    members: {
                        id: string;
                        group: {
                            groupId: string;
                            groupCreatedAt: number;
                        };
                        bot: {
                            botId: string;
                            botCreatedAt: number;
                        };
                        order: number;
                        joinedAt: number;
                        enabled: boolean;
                        removedAt?: number | undefined;
                    }[];
                    unavailableMemberIds: string[];
                    running: boolean;
                    latest?: {
                        seq: number;
                        at: number;
                        speaker?: {
                            bot: {
                                botId: string;
                                botCreatedAt: number;
                            };
                            name: string;
                            avatar?: string | undefined;
                            avatarColor?: "--dsw-alias-state-business-primary" | "--dsw-alias-state-success-primary" | "--dsw-alias-state-warn-label" | "--dsw-alias-state-error-primary" | "teal" | "cyan" | "indigo" | "purple" | "rose" | "orange" | "olive" | "slate" | undefined;
                            avatarVariant?: "classic" | "glasses" | "spout" | "baby" | "hat" | "sleeping" | "auto" | undefined;
                        } | undefined;
                    } | undefined;
                    reason?: "recovery-needed" | "root-owned-elsewhere" | "root-unavailable" | undefined;
                }[];
                decode: (v: unknown) => {
                    unread: boolean;
                    readRevision: number;
                    group: {
                        id: string;
                        operationId: string;
                        createDigest: string;
                        createdAt: number;
                        updatedAt: number;
                        schemaVersion: 1;
                        name: string;
                        rootSessionId: string;
                        rootPresetId: "dsh-bot-group-root";
                        cwd: string;
                        mode: "natural" | "mention" | "round-robin";
                        membershipRevision: number;
                        revision: number;
                        archived: boolean;
                        state: "ready" | "creating" | "recovery_needed";
                        modelSelection?: {
                            provider: string;
                            model: string;
                            reasoningEffort?: string | undefined;
                        } | undefined;
                        memberModelSelections?: {
                            memberId: string;
                            modelSelection: {
                                provider: string;
                                model: string;
                                reasoningEffort?: string | undefined;
                            };
                        }[] | undefined;
                        modelRevision?: number | undefined;
                        nextMemberId?: string | undefined;
                    };
                    members: {
                        id: string;
                        group: {
                            groupId: string;
                            groupCreatedAt: number;
                        };
                        bot: {
                            botId: string;
                            botCreatedAt: number;
                        };
                        order: number;
                        joinedAt: number;
                        enabled: boolean;
                        removedAt?: number | undefined;
                    }[];
                    unavailableMemberIds: string[];
                    running: boolean;
                    latest?: {
                        seq: number;
                        at: number;
                        speaker?: {
                            bot: {
                                botId: string;
                                botCreatedAt: number;
                            };
                            name: string;
                            avatar?: string | undefined;
                            avatarColor?: "--dsw-alias-state-business-primary" | "--dsw-alias-state-success-primary" | "--dsw-alias-state-warn-label" | "--dsw-alias-state-error-primary" | "teal" | "cyan" | "indigo" | "purple" | "rose" | "orange" | "olive" | "slate" | undefined;
                            avatarVariant?: "classic" | "glasses" | "spout" | "baby" | "hat" | "sleeping" | "auto" | undefined;
                        } | undefined;
                    } | undefined;
                    reason?: "recovery-needed" | "root-owned-elsewhere" | "root-unavailable" | undefined;
                }[];
            };
            readonly service: string;
            readonly invocation: {
                kind: "direct";
            };
        };
        readonly 'dshBot.groups/create': {
            readonly parameters: readonly [{
                name: string;
                source: "json";
                codec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodObject<{
                        operationId: z.ZodString;
                        name: z.ZodString;
                        members: z.ZodArray<z.ZodObject<{
                            botId: z.ZodString;
                            botCreatedAt: z.ZodNumber;
                        }, z.core.$strict>>;
                        mode: z.ZodEnum<{
                            natural: "natural";
                            mention: "mention";
                            "round-robin": "round-robin";
                        }>;
                        cwd: z.ZodOptional<z.ZodString>;
                        historyConfirmed: z.ZodLiteral<true>;
                    }, z.core.$strict>;
                    encode: (v: unknown) => {
                        operationId: string;
                        name: string;
                        members: {
                            botId: string;
                            botCreatedAt: number;
                        }[];
                        mode: "natural" | "mention" | "round-robin";
                        historyConfirmed: true;
                        cwd?: string | undefined;
                    };
                    decode: (v: unknown) => {
                        operationId: string;
                        name: string;
                        members: {
                            botId: string;
                            botCreatedAt: number;
                        }[];
                        mode: "natural" | "mention" | "round-robin";
                        historyConfirmed: true;
                        cwd?: string | undefined;
                    };
                };
                strictCodec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodObject<{
                        operationId: z.ZodString;
                        name: z.ZodString;
                        members: z.ZodArray<z.ZodObject<{
                            botId: z.ZodString;
                            botCreatedAt: z.ZodNumber;
                        }, z.core.$strict>>;
                        mode: z.ZodEnum<{
                            natural: "natural";
                            mention: "mention";
                            "round-robin": "round-robin";
                        }>;
                        cwd: z.ZodOptional<z.ZodString>;
                        historyConfirmed: z.ZodLiteral<true>;
                    }, z.core.$strict>;
                    encode: (v: unknown) => {
                        operationId: string;
                        name: string;
                        members: {
                            botId: string;
                            botCreatedAt: number;
                        }[];
                        mode: "natural" | "mention" | "round-robin";
                        historyConfirmed: true;
                        cwd?: string | undefined;
                    };
                    decode: (v: unknown) => {
                        operationId: string;
                        name: string;
                        members: {
                            botId: string;
                            botCreatedAt: number;
                        }[];
                        mode: "natural" | "mention" | "round-robin";
                        historyConfirmed: true;
                        cwd?: string | undefined;
                    };
                };
            }];
            readonly result: {
                mode: "strict";
                typeSymbol: string;
                create: () => z.ZodObject<{
                    id: z.ZodString;
                    operationId: z.ZodString;
                    createDigest: z.ZodString;
                    createdAt: z.ZodNumber;
                    updatedAt: z.ZodNumber;
                    schemaVersion: z.ZodLiteral<1>;
                    name: z.ZodString;
                    rootSessionId: z.ZodString;
                    rootPresetId: z.ZodLiteral<"dsh-bot-group-root">;
                    cwd: z.ZodString;
                    mode: z.ZodEnum<{
                        natural: "natural";
                        mention: "mention";
                        "round-robin": "round-robin";
                    }>;
                    modelSelection: z.ZodOptional<z.ZodObject<{
                        provider: z.ZodString;
                        model: z.ZodString;
                        reasoningEffort: z.ZodOptional<z.ZodString>;
                    }, z.core.$strict>>;
                    memberModelSelections: z.ZodOptional<z.ZodArray<z.ZodObject<{
                        memberId: z.ZodString;
                        modelSelection: z.ZodObject<{
                            provider: z.ZodString;
                            model: z.ZodString;
                            reasoningEffort: z.ZodOptional<z.ZodString>;
                        }, z.core.$strict>;
                    }, z.core.$strict>>>;
                    modelRevision: z.ZodOptional<z.ZodNumber>;
                    nextMemberId: z.ZodOptional<z.ZodString>;
                    membershipRevision: z.ZodNumber;
                    revision: z.ZodNumber;
                    archived: z.ZodBoolean;
                    state: z.ZodEnum<{
                        ready: "ready";
                        creating: "creating";
                        recovery_needed: "recovery_needed";
                    }>;
                }, z.core.$strict>;
                encode: (v: unknown) => {
                    id: string;
                    operationId: string;
                    createDigest: string;
                    createdAt: number;
                    updatedAt: number;
                    schemaVersion: 1;
                    name: string;
                    rootSessionId: string;
                    rootPresetId: "dsh-bot-group-root";
                    cwd: string;
                    mode: "natural" | "mention" | "round-robin";
                    membershipRevision: number;
                    revision: number;
                    archived: boolean;
                    state: "ready" | "creating" | "recovery_needed";
                    modelSelection?: {
                        provider: string;
                        model: string;
                        reasoningEffort?: string | undefined;
                    } | undefined;
                    memberModelSelections?: {
                        memberId: string;
                        modelSelection: {
                            provider: string;
                            model: string;
                            reasoningEffort?: string | undefined;
                        };
                    }[] | undefined;
                    modelRevision?: number | undefined;
                    nextMemberId?: string | undefined;
                };
                decode: (v: unknown) => {
                    id: string;
                    operationId: string;
                    createDigest: string;
                    createdAt: number;
                    updatedAt: number;
                    schemaVersion: 1;
                    name: string;
                    rootSessionId: string;
                    rootPresetId: "dsh-bot-group-root";
                    cwd: string;
                    mode: "natural" | "mention" | "round-robin";
                    membershipRevision: number;
                    revision: number;
                    archived: boolean;
                    state: "ready" | "creating" | "recovery_needed";
                    modelSelection?: {
                        provider: string;
                        model: string;
                        reasoningEffort?: string | undefined;
                    } | undefined;
                    memberModelSelections?: {
                        memberId: string;
                        modelSelection: {
                            provider: string;
                            model: string;
                            reasoningEffort?: string | undefined;
                        };
                    }[] | undefined;
                    modelRevision?: number | undefined;
                    nextMemberId?: string | undefined;
                };
            };
            readonly service: string;
            readonly invocation: {
                kind: "direct";
            };
        };
        readonly 'dshBot.groups/edit': {
            readonly parameters: readonly [{
                name: string;
                source: "json";
                codec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodObject<{
                        groupId: z.ZodString;
                        groupCreatedAt: z.ZodNumber;
                    }, z.core.$strict>;
                    encode: (v: unknown) => {
                        groupId: string;
                        groupCreatedAt: number;
                    };
                    decode: (v: unknown) => {
                        groupId: string;
                        groupCreatedAt: number;
                    };
                };
                strictCodec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodObject<{
                        groupId: z.ZodString;
                        groupCreatedAt: z.ZodNumber;
                    }, z.core.$strict>;
                    encode: (v: unknown) => {
                        groupId: string;
                        groupCreatedAt: number;
                    };
                    decode: (v: unknown) => {
                        groupId: string;
                        groupCreatedAt: number;
                    };
                };
            }, {
                name: string;
                source: "json";
                codec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodObject<{
                        expectedRevision: z.ZodNumber;
                        expectedMembershipRevision: z.ZodNumber;
                        name: z.ZodString;
                        mode: z.ZodEnum<{
                            natural: "natural";
                            mention: "mention";
                            "round-robin": "round-robin";
                        }>;
                        members: z.ZodArray<z.ZodObject<{
                            botId: z.ZodString;
                            botCreatedAt: z.ZodNumber;
                        }, z.core.$strict>>;
                        historyConfirmed: z.ZodLiteral<true>;
                    }, z.core.$strict>;
                    encode: (v: unknown) => {
                        expectedRevision: number;
                        expectedMembershipRevision: number;
                        name: string;
                        mode: "natural" | "mention" | "round-robin";
                        members: {
                            botId: string;
                            botCreatedAt: number;
                        }[];
                        historyConfirmed: true;
                    };
                    decode: (v: unknown) => {
                        expectedRevision: number;
                        expectedMembershipRevision: number;
                        name: string;
                        mode: "natural" | "mention" | "round-robin";
                        members: {
                            botId: string;
                            botCreatedAt: number;
                        }[];
                        historyConfirmed: true;
                    };
                };
                strictCodec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodObject<{
                        expectedRevision: z.ZodNumber;
                        expectedMembershipRevision: z.ZodNumber;
                        name: z.ZodString;
                        mode: z.ZodEnum<{
                            natural: "natural";
                            mention: "mention";
                            "round-robin": "round-robin";
                        }>;
                        members: z.ZodArray<z.ZodObject<{
                            botId: z.ZodString;
                            botCreatedAt: z.ZodNumber;
                        }, z.core.$strict>>;
                        historyConfirmed: z.ZodLiteral<true>;
                    }, z.core.$strict>;
                    encode: (v: unknown) => {
                        expectedRevision: number;
                        expectedMembershipRevision: number;
                        name: string;
                        mode: "natural" | "mention" | "round-robin";
                        members: {
                            botId: string;
                            botCreatedAt: number;
                        }[];
                        historyConfirmed: true;
                    };
                    decode: (v: unknown) => {
                        expectedRevision: number;
                        expectedMembershipRevision: number;
                        name: string;
                        mode: "natural" | "mention" | "round-robin";
                        members: {
                            botId: string;
                            botCreatedAt: number;
                        }[];
                        historyConfirmed: true;
                    };
                };
            }];
            readonly result: {
                mode: "strict";
                typeSymbol: string;
                create: () => z.ZodObject<{
                    id: z.ZodString;
                    operationId: z.ZodString;
                    createDigest: z.ZodString;
                    createdAt: z.ZodNumber;
                    updatedAt: z.ZodNumber;
                    schemaVersion: z.ZodLiteral<1>;
                    name: z.ZodString;
                    rootSessionId: z.ZodString;
                    rootPresetId: z.ZodLiteral<"dsh-bot-group-root">;
                    cwd: z.ZodString;
                    mode: z.ZodEnum<{
                        natural: "natural";
                        mention: "mention";
                        "round-robin": "round-robin";
                    }>;
                    modelSelection: z.ZodOptional<z.ZodObject<{
                        provider: z.ZodString;
                        model: z.ZodString;
                        reasoningEffort: z.ZodOptional<z.ZodString>;
                    }, z.core.$strict>>;
                    memberModelSelections: z.ZodOptional<z.ZodArray<z.ZodObject<{
                        memberId: z.ZodString;
                        modelSelection: z.ZodObject<{
                            provider: z.ZodString;
                            model: z.ZodString;
                            reasoningEffort: z.ZodOptional<z.ZodString>;
                        }, z.core.$strict>;
                    }, z.core.$strict>>>;
                    modelRevision: z.ZodOptional<z.ZodNumber>;
                    nextMemberId: z.ZodOptional<z.ZodString>;
                    membershipRevision: z.ZodNumber;
                    revision: z.ZodNumber;
                    archived: z.ZodBoolean;
                    state: z.ZodEnum<{
                        ready: "ready";
                        creating: "creating";
                        recovery_needed: "recovery_needed";
                    }>;
                }, z.core.$strict>;
                encode: (v: unknown) => {
                    id: string;
                    operationId: string;
                    createDigest: string;
                    createdAt: number;
                    updatedAt: number;
                    schemaVersion: 1;
                    name: string;
                    rootSessionId: string;
                    rootPresetId: "dsh-bot-group-root";
                    cwd: string;
                    mode: "natural" | "mention" | "round-robin";
                    membershipRevision: number;
                    revision: number;
                    archived: boolean;
                    state: "ready" | "creating" | "recovery_needed";
                    modelSelection?: {
                        provider: string;
                        model: string;
                        reasoningEffort?: string | undefined;
                    } | undefined;
                    memberModelSelections?: {
                        memberId: string;
                        modelSelection: {
                            provider: string;
                            model: string;
                            reasoningEffort?: string | undefined;
                        };
                    }[] | undefined;
                    modelRevision?: number | undefined;
                    nextMemberId?: string | undefined;
                };
                decode: (v: unknown) => {
                    id: string;
                    operationId: string;
                    createDigest: string;
                    createdAt: number;
                    updatedAt: number;
                    schemaVersion: 1;
                    name: string;
                    rootSessionId: string;
                    rootPresetId: "dsh-bot-group-root";
                    cwd: string;
                    mode: "natural" | "mention" | "round-robin";
                    membershipRevision: number;
                    revision: number;
                    archived: boolean;
                    state: "ready" | "creating" | "recovery_needed";
                    modelSelection?: {
                        provider: string;
                        model: string;
                        reasoningEffort?: string | undefined;
                    } | undefined;
                    memberModelSelections?: {
                        memberId: string;
                        modelSelection: {
                            provider: string;
                            model: string;
                            reasoningEffort?: string | undefined;
                        };
                    }[] | undefined;
                    modelRevision?: number | undefined;
                    nextMemberId?: string | undefined;
                };
            };
            readonly service: string;
            readonly invocation: {
                kind: "direct";
            };
        };
        readonly 'dshBot.groups/setModel': {
            readonly parameters: readonly [{
                name: string;
                source: "json";
                codec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodObject<{
                        groupId: z.ZodString;
                        groupCreatedAt: z.ZodNumber;
                    }, z.core.$strict>;
                    encode: (v: unknown) => {
                        groupId: string;
                        groupCreatedAt: number;
                    };
                    decode: (v: unknown) => {
                        groupId: string;
                        groupCreatedAt: number;
                    };
                };
                strictCodec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodObject<{
                        groupId: z.ZodString;
                        groupCreatedAt: z.ZodNumber;
                    }, z.core.$strict>;
                    encode: (v: unknown) => {
                        groupId: string;
                        groupCreatedAt: number;
                    };
                    decode: (v: unknown) => {
                        groupId: string;
                        groupCreatedAt: number;
                    };
                };
            }, {
                name: string;
                source: "json";
                codec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodObject<{
                        expectedModelRevision: z.ZodNumber;
                        memberId: z.ZodOptional<z.ZodString>;
                        modelSelection: z.ZodNullable<z.ZodObject<{
                            provider: z.ZodString;
                            model: z.ZodString;
                            reasoningEffort: z.ZodOptional<z.ZodString>;
                        }, z.core.$strict>>;
                    }, z.core.$strict>;
                    encode: (v: unknown) => {
                        expectedModelRevision: number;
                        modelSelection: {
                            provider: string;
                            model: string;
                            reasoningEffort?: string | undefined;
                        } | null;
                        memberId?: string | undefined;
                    };
                    decode: (v: unknown) => {
                        expectedModelRevision: number;
                        modelSelection: {
                            provider: string;
                            model: string;
                            reasoningEffort?: string | undefined;
                        } | null;
                        memberId?: string | undefined;
                    };
                };
                strictCodec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodObject<{
                        expectedModelRevision: z.ZodNumber;
                        memberId: z.ZodOptional<z.ZodString>;
                        modelSelection: z.ZodNullable<z.ZodObject<{
                            provider: z.ZodString;
                            model: z.ZodString;
                            reasoningEffort: z.ZodOptional<z.ZodString>;
                        }, z.core.$strict>>;
                    }, z.core.$strict>;
                    encode: (v: unknown) => {
                        expectedModelRevision: number;
                        modelSelection: {
                            provider: string;
                            model: string;
                            reasoningEffort?: string | undefined;
                        } | null;
                        memberId?: string | undefined;
                    };
                    decode: (v: unknown) => {
                        expectedModelRevision: number;
                        modelSelection: {
                            provider: string;
                            model: string;
                            reasoningEffort?: string | undefined;
                        } | null;
                        memberId?: string | undefined;
                    };
                };
            }];
            readonly result: {
                mode: "strict";
                typeSymbol: string;
                create: () => z.ZodObject<{
                    id: z.ZodString;
                    operationId: z.ZodString;
                    createDigest: z.ZodString;
                    createdAt: z.ZodNumber;
                    updatedAt: z.ZodNumber;
                    schemaVersion: z.ZodLiteral<1>;
                    name: z.ZodString;
                    rootSessionId: z.ZodString;
                    rootPresetId: z.ZodLiteral<"dsh-bot-group-root">;
                    cwd: z.ZodString;
                    mode: z.ZodEnum<{
                        natural: "natural";
                        mention: "mention";
                        "round-robin": "round-robin";
                    }>;
                    modelSelection: z.ZodOptional<z.ZodObject<{
                        provider: z.ZodString;
                        model: z.ZodString;
                        reasoningEffort: z.ZodOptional<z.ZodString>;
                    }, z.core.$strict>>;
                    memberModelSelections: z.ZodOptional<z.ZodArray<z.ZodObject<{
                        memberId: z.ZodString;
                        modelSelection: z.ZodObject<{
                            provider: z.ZodString;
                            model: z.ZodString;
                            reasoningEffort: z.ZodOptional<z.ZodString>;
                        }, z.core.$strict>;
                    }, z.core.$strict>>>;
                    modelRevision: z.ZodOptional<z.ZodNumber>;
                    nextMemberId: z.ZodOptional<z.ZodString>;
                    membershipRevision: z.ZodNumber;
                    revision: z.ZodNumber;
                    archived: z.ZodBoolean;
                    state: z.ZodEnum<{
                        ready: "ready";
                        creating: "creating";
                        recovery_needed: "recovery_needed";
                    }>;
                }, z.core.$strict>;
                encode: (v: unknown) => {
                    id: string;
                    operationId: string;
                    createDigest: string;
                    createdAt: number;
                    updatedAt: number;
                    schemaVersion: 1;
                    name: string;
                    rootSessionId: string;
                    rootPresetId: "dsh-bot-group-root";
                    cwd: string;
                    mode: "natural" | "mention" | "round-robin";
                    membershipRevision: number;
                    revision: number;
                    archived: boolean;
                    state: "ready" | "creating" | "recovery_needed";
                    modelSelection?: {
                        provider: string;
                        model: string;
                        reasoningEffort?: string | undefined;
                    } | undefined;
                    memberModelSelections?: {
                        memberId: string;
                        modelSelection: {
                            provider: string;
                            model: string;
                            reasoningEffort?: string | undefined;
                        };
                    }[] | undefined;
                    modelRevision?: number | undefined;
                    nextMemberId?: string | undefined;
                };
                decode: (v: unknown) => {
                    id: string;
                    operationId: string;
                    createDigest: string;
                    createdAt: number;
                    updatedAt: number;
                    schemaVersion: 1;
                    name: string;
                    rootSessionId: string;
                    rootPresetId: "dsh-bot-group-root";
                    cwd: string;
                    mode: "natural" | "mention" | "round-robin";
                    membershipRevision: number;
                    revision: number;
                    archived: boolean;
                    state: "ready" | "creating" | "recovery_needed";
                    modelSelection?: {
                        provider: string;
                        model: string;
                        reasoningEffort?: string | undefined;
                    } | undefined;
                    memberModelSelections?: {
                        memberId: string;
                        modelSelection: {
                            provider: string;
                            model: string;
                            reasoningEffort?: string | undefined;
                        };
                    }[] | undefined;
                    modelRevision?: number | undefined;
                    nextMemberId?: string | undefined;
                };
            };
            readonly service: string;
            readonly invocation: {
                kind: "direct";
            };
        };
        readonly 'dshBot.groups/view': {
            readonly parameters: readonly [{
                name: string;
                source: "json";
                codec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodObject<{
                        groupId: z.ZodString;
                        groupCreatedAt: z.ZodNumber;
                    }, z.core.$strict>;
                    encode: (v: unknown) => {
                        groupId: string;
                        groupCreatedAt: number;
                    };
                    decode: (v: unknown) => {
                        groupId: string;
                        groupCreatedAt: number;
                    };
                };
                strictCodec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodObject<{
                        groupId: z.ZodString;
                        groupCreatedAt: z.ZodNumber;
                    }, z.core.$strict>;
                    encode: (v: unknown) => {
                        groupId: string;
                        groupCreatedAt: number;
                    };
                    decode: (v: unknown) => {
                        groupId: string;
                        groupCreatedAt: number;
                    };
                };
            }, {
                name: string;
                source: "json";
                codec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodObject<{
                        beforeSeq: z.ZodOptional<z.ZodNumber>;
                        limit: z.ZodDefault<z.ZodNumber>;
                    }, z.core.$strict>;
                    encode: (v: unknown) => {
                        limit: number;
                        beforeSeq?: number | undefined;
                    };
                    decode: (v: unknown) => {
                        limit: number;
                        beforeSeq?: number | undefined;
                    };
                };
                strictCodec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodObject<{
                        beforeSeq: z.ZodOptional<z.ZodNumber>;
                        limit: z.ZodDefault<z.ZodNumber>;
                    }, z.core.$strict>;
                    encode: (v: unknown) => {
                        limit: number;
                        beforeSeq?: number | undefined;
                    };
                    decode: (v: unknown) => {
                        limit: number;
                        beforeSeq?: number | undefined;
                    };
                };
            }];
            readonly result: {
                mode: "strict";
                typeSymbol: string;
                create: () => z.ZodObject<{
                    latest: z.ZodOptional<z.ZodObject<{
                        seq: z.ZodNumber;
                        at: z.ZodNumber;
                        speaker: z.ZodOptional<z.ZodObject<{
                            bot: z.ZodObject<{
                                botId: z.ZodString;
                                botCreatedAt: z.ZodNumber;
                            }, z.core.$strict>;
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
                    }, z.core.$strict>>;
                    unread: z.ZodDefault<z.ZodBoolean>;
                    readRevision: z.ZodDefault<z.ZodNumber>;
                    group: z.ZodObject<{
                        id: z.ZodString;
                        operationId: z.ZodString;
                        createDigest: z.ZodString;
                        createdAt: z.ZodNumber;
                        updatedAt: z.ZodNumber;
                        schemaVersion: z.ZodLiteral<1>;
                        name: z.ZodString;
                        rootSessionId: z.ZodString;
                        rootPresetId: z.ZodLiteral<"dsh-bot-group-root">;
                        cwd: z.ZodString;
                        mode: z.ZodEnum<{
                            natural: "natural";
                            mention: "mention";
                            "round-robin": "round-robin";
                        }>;
                        modelSelection: z.ZodOptional<z.ZodObject<{
                            provider: z.ZodString;
                            model: z.ZodString;
                            reasoningEffort: z.ZodOptional<z.ZodString>;
                        }, z.core.$strict>>;
                        memberModelSelections: z.ZodOptional<z.ZodArray<z.ZodObject<{
                            memberId: z.ZodString;
                            modelSelection: z.ZodObject<{
                                provider: z.ZodString;
                                model: z.ZodString;
                                reasoningEffort: z.ZodOptional<z.ZodString>;
                            }, z.core.$strict>;
                        }, z.core.$strict>>>;
                        modelRevision: z.ZodOptional<z.ZodNumber>;
                        nextMemberId: z.ZodOptional<z.ZodString>;
                        membershipRevision: z.ZodNumber;
                        revision: z.ZodNumber;
                        archived: z.ZodBoolean;
                        state: z.ZodEnum<{
                            ready: "ready";
                            creating: "creating";
                            recovery_needed: "recovery_needed";
                        }>;
                    }, z.core.$strict>;
                    members: z.ZodArray<z.ZodObject<{
                        id: z.ZodString;
                        group: z.ZodObject<{
                            groupId: z.ZodString;
                            groupCreatedAt: z.ZodNumber;
                        }, z.core.$strict>;
                        bot: z.ZodObject<{
                            botId: z.ZodString;
                            botCreatedAt: z.ZodNumber;
                        }, z.core.$strict>;
                        order: z.ZodNumber;
                        joinedAt: z.ZodNumber;
                        removedAt: z.ZodOptional<z.ZodNumber>;
                        enabled: z.ZodBoolean;
                    }, z.core.$strict>>;
                    unavailableMemberIds: z.ZodArray<z.ZodString>;
                    running: z.ZodBoolean;
                    reason: z.ZodOptional<z.ZodEnum<{
                        "recovery-needed": "recovery-needed";
                        "root-owned-elsewhere": "root-owned-elsewhere";
                        "root-unavailable": "root-unavailable";
                    }>>;
                    turns: z.ZodArray<z.ZodObject<{
                        id: z.ZodString;
                        group: z.ZodObject<{
                            groupId: z.ZodString;
                            groupCreatedAt: z.ZodNumber;
                        }, z.core.$strict>;
                        operationId: z.ZodString;
                        requestDigest: z.ZodString;
                        inputMessageId: z.ZodString;
                        inputSeq: z.ZodOptional<z.ZodNumber>;
                        createdAt: z.ZodNumber;
                        updatedAt: z.ZodNumber;
                        revision: z.ZodNumber;
                        schemaVersion: z.ZodLiteral<1>;
                        membershipRevision: z.ZodNumber;
                        orderedMemberIds: z.ZodArray<z.ZodString>;
                        mode: z.ZodEnum<{
                            natural: "natural";
                            mention: "mention";
                            "round-robin": "round-robin";
                        }>;
                        contextThroughSeq: z.ZodNumber;
                        modelSelection: z.ZodOptional<z.ZodObject<{
                            provider: z.ZodString;
                            model: z.ZodString;
                            reasoningEffort: z.ZodOptional<z.ZodString>;
                        }, z.core.$strict>>;
                        memberModelSelections: z.ZodOptional<z.ZodArray<z.ZodObject<{
                            memberId: z.ZodString;
                            modelSelection: z.ZodObject<{
                                provider: z.ZodString;
                                model: z.ZodString;
                                reasoningEffort: z.ZodOptional<z.ZodString>;
                            }, z.core.$strict>;
                        }, z.core.$strict>>>;
                        predecessorTurnIds: z.ZodOptional<z.ZodArray<z.ZodString>>;
                        followups: z.ZodOptional<z.ZodArray<z.ZodObject<{
                            operationId: z.ZodString;
                            requestDigest: z.ZodString;
                            deliveryId: z.ZodString;
                            messageId: z.ZodString;
                            childMessageId: z.ZodOptional<z.ZodString>;
                            state: z.ZodEnum<{
                                unknown: "unknown";
                                dispatching: "dispatching";
                                accepted: "accepted";
                            }>;
                        }, z.core.$strict>>>;
                        replyTo: z.ZodOptional<z.ZodString>;
                        protocol: z.ZodOptional<z.ZodLiteral<2>>;
                        automaticExecutions: z.ZodOptional<z.ZodNumber>;
                        continuationAllowance: z.ZodOptional<z.ZodNumber>;
                        stoppedMemberIds: z.ZodOptional<z.ZodArray<z.ZodString>>;
                        state: z.ZodEnum<{
                            completed: "completed";
                            cancelled: "cancelled";
                            idle: "idle";
                            running: "running";
                            accepted: "accepted";
                            recovery_needed: "recovery_needed";
                            paused: "paused";
                            partial: "partial";
                        }>;
                    }, z.core.$strict>>;
                    deliveries: z.ZodArray<z.ZodObject<{
                        id: z.ZodString;
                        turnId: z.ZodString;
                        memberId: z.ZodString;
                        ordinal: z.ZodNumber;
                        bot: z.ZodObject<{
                            botId: z.ZodString;
                            botCreatedAt: z.ZodNumber;
                        }, z.core.$strict>;
                        botRevision: z.ZodNumber;
                        presetId: z.ZodString;
                        contextOutputMessageIds: z.ZodArray<z.ZodString>;
                        contextTruncated: z.ZodBoolean;
                        state: z.ZodEnum<{
                            pending: "pending";
                            unknown: "unknown";
                            completed: "completed";
                            skipped: "skipped";
                            failed: "failed";
                            cancelled: "cancelled";
                            running: "running";
                            starting: "starting";
                        }>;
                        automatic: z.ZodOptional<z.ZodBoolean>;
                        startedAt: z.ZodOptional<z.ZodNumber>;
                        endedAt: z.ZodOptional<z.ZodNumber>;
                        nativeRunId: z.ZodOptional<z.ZodString>;
                        childMessageId: z.ZodOptional<z.ZodString>;
                        joinedDeliveryId: z.ZodOptional<z.ZodString>;
                        childSessionId: z.ZodOptional<z.ZodString>;
                        triggerMessageId: z.ZodOptional<z.ZodString>;
                        returnMemberId: z.ZodOptional<z.ZodString>;
                        requestDigest: z.ZodOptional<z.ZodString>;
                        skipped: z.ZodOptional<z.ZodBoolean>;
                        outputMessageId: z.ZodOptional<z.ZodString>;
                        outputSeq: z.ZodOptional<z.ZodNumber>;
                        stopReason: z.ZodOptional<z.ZodString>;
                        reasonCode: z.ZodOptional<z.ZodString>;
                    }, z.core.$strict>>;
                    messages: z.ZodArray<z.ZodObject<{
                        id: z.ZodString;
                        seq: z.ZodNumber;
                        at: z.ZodNumber;
                        text: z.ZodString;
                        hasNonText: z.ZodOptional<z.ZodBoolean>;
                        attachments: z.ZodOptional<z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
                            type: z.ZodLiteral<"file">;
                            attachment: z.ZodObject<{
                                attachmentId: z.ZodString;
                                name: z.ZodString;
                                bytes: z.ZodNumber;
                            }, z.core.$strict>;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"image">;
                            attachment: z.ZodObject<{
                                attachmentId: z.ZodString;
                                mediaType: z.ZodEnum<{
                                    "image/png": "image/png";
                                    "image/jpeg": "image/jpeg";
                                    "image/webp": "image/webp";
                                    "image/gif": "image/gif";
                                }>;
                                bytes: z.ZodNumber;
                                width: z.ZodNumber;
                                height: z.ZodNumber;
                                name: z.ZodOptional<z.ZodString>;
                                originalDimensions: z.ZodOptional<z.ZodObject<{
                                    width: z.ZodNumber;
                                    height: z.ZodNumber;
                                }, z.core.$strict>>;
                            }, z.core.$strict>;
                            offloaded: z.ZodOptional<z.ZodLiteral<true>>;
                        }, z.core.$strict>], "type">>>;
                        turnId: z.ZodString;
                        replyTo: z.ZodOptional<z.ZodString>;
                        authorKind: z.ZodOptional<z.ZodEnum<{
                            user: "user";
                            bot: "bot";
                        }>>;
                        causeId: z.ZodOptional<z.ZodString>;
                        speaker: z.ZodOptional<z.ZodObject<{
                            bot: z.ZodObject<{
                                botId: z.ZodString;
                                botCreatedAt: z.ZodNumber;
                            }, z.core.$strict>;
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
                        childSessionId: z.ZodOptional<z.ZodString>;
                        stopReason: z.ZodOptional<z.ZodString>;
                    }, z.core.$strict>>;
                    hasEarlier: z.ZodBoolean;
                }, z.core.$strict>;
                encode: (v: unknown) => {
                    unread: boolean;
                    readRevision: number;
                    group: {
                        id: string;
                        operationId: string;
                        createDigest: string;
                        createdAt: number;
                        updatedAt: number;
                        schemaVersion: 1;
                        name: string;
                        rootSessionId: string;
                        rootPresetId: "dsh-bot-group-root";
                        cwd: string;
                        mode: "natural" | "mention" | "round-robin";
                        membershipRevision: number;
                        revision: number;
                        archived: boolean;
                        state: "ready" | "creating" | "recovery_needed";
                        modelSelection?: {
                            provider: string;
                            model: string;
                            reasoningEffort?: string | undefined;
                        } | undefined;
                        memberModelSelections?: {
                            memberId: string;
                            modelSelection: {
                                provider: string;
                                model: string;
                                reasoningEffort?: string | undefined;
                            };
                        }[] | undefined;
                        modelRevision?: number | undefined;
                        nextMemberId?: string | undefined;
                    };
                    members: {
                        id: string;
                        group: {
                            groupId: string;
                            groupCreatedAt: number;
                        };
                        bot: {
                            botId: string;
                            botCreatedAt: number;
                        };
                        order: number;
                        joinedAt: number;
                        enabled: boolean;
                        removedAt?: number | undefined;
                    }[];
                    unavailableMemberIds: string[];
                    running: boolean;
                    turns: {
                        id: string;
                        group: {
                            groupId: string;
                            groupCreatedAt: number;
                        };
                        operationId: string;
                        requestDigest: string;
                        inputMessageId: string;
                        createdAt: number;
                        updatedAt: number;
                        revision: number;
                        schemaVersion: 1;
                        membershipRevision: number;
                        orderedMemberIds: string[];
                        mode: "natural" | "mention" | "round-robin";
                        contextThroughSeq: number;
                        state: "completed" | "cancelled" | "idle" | "running" | "accepted" | "recovery_needed" | "paused" | "partial";
                        inputSeq?: number | undefined;
                        modelSelection?: {
                            provider: string;
                            model: string;
                            reasoningEffort?: string | undefined;
                        } | undefined;
                        memberModelSelections?: {
                            memberId: string;
                            modelSelection: {
                                provider: string;
                                model: string;
                                reasoningEffort?: string | undefined;
                            };
                        }[] | undefined;
                        predecessorTurnIds?: string[] | undefined;
                        followups?: {
                            operationId: string;
                            requestDigest: string;
                            deliveryId: string;
                            messageId: string;
                            state: "unknown" | "dispatching" | "accepted";
                            childMessageId?: string | undefined;
                        }[] | undefined;
                        replyTo?: string | undefined;
                        protocol?: 2 | undefined;
                        automaticExecutions?: number | undefined;
                        continuationAllowance?: number | undefined;
                        stoppedMemberIds?: string[] | undefined;
                    }[];
                    deliveries: {
                        id: string;
                        turnId: string;
                        memberId: string;
                        ordinal: number;
                        bot: {
                            botId: string;
                            botCreatedAt: number;
                        };
                        botRevision: number;
                        presetId: string;
                        contextOutputMessageIds: string[];
                        contextTruncated: boolean;
                        state: "pending" | "unknown" | "completed" | "skipped" | "failed" | "cancelled" | "running" | "starting";
                        automatic?: boolean | undefined;
                        startedAt?: number | undefined;
                        endedAt?: number | undefined;
                        nativeRunId?: string | undefined;
                        childMessageId?: string | undefined;
                        joinedDeliveryId?: string | undefined;
                        childSessionId?: string | undefined;
                        triggerMessageId?: string | undefined;
                        returnMemberId?: string | undefined;
                        requestDigest?: string | undefined;
                        skipped?: boolean | undefined;
                        outputMessageId?: string | undefined;
                        outputSeq?: number | undefined;
                        stopReason?: string | undefined;
                        reasonCode?: string | undefined;
                    }[];
                    messages: {
                        id: string;
                        seq: number;
                        at: number;
                        text: string;
                        turnId: string;
                        hasNonText?: boolean | undefined;
                        attachments?: ({
                            type: "file";
                            attachment: {
                                attachmentId: string;
                                name: string;
                                bytes: number;
                            };
                        } | {
                            type: "image";
                            attachment: {
                                attachmentId: string;
                                mediaType: "image/png" | "image/jpeg" | "image/webp" | "image/gif";
                                bytes: number;
                                width: number;
                                height: number;
                                name?: string | undefined;
                                originalDimensions?: {
                                    width: number;
                                    height: number;
                                } | undefined;
                            };
                            offloaded?: true | undefined;
                        })[] | undefined;
                        replyTo?: string | undefined;
                        authorKind?: "user" | "bot" | undefined;
                        causeId?: string | undefined;
                        speaker?: {
                            bot: {
                                botId: string;
                                botCreatedAt: number;
                            };
                            name: string;
                            avatar?: string | undefined;
                            avatarColor?: "--dsw-alias-state-business-primary" | "--dsw-alias-state-success-primary" | "--dsw-alias-state-warn-label" | "--dsw-alias-state-error-primary" | "teal" | "cyan" | "indigo" | "purple" | "rose" | "orange" | "olive" | "slate" | undefined;
                            avatarVariant?: "classic" | "glasses" | "spout" | "baby" | "hat" | "sleeping" | "auto" | undefined;
                        } | undefined;
                        childSessionId?: string | undefined;
                        stopReason?: string | undefined;
                    }[];
                    hasEarlier: boolean;
                    latest?: {
                        seq: number;
                        at: number;
                        speaker?: {
                            bot: {
                                botId: string;
                                botCreatedAt: number;
                            };
                            name: string;
                            avatar?: string | undefined;
                            avatarColor?: "--dsw-alias-state-business-primary" | "--dsw-alias-state-success-primary" | "--dsw-alias-state-warn-label" | "--dsw-alias-state-error-primary" | "teal" | "cyan" | "indigo" | "purple" | "rose" | "orange" | "olive" | "slate" | undefined;
                            avatarVariant?: "classic" | "glasses" | "spout" | "baby" | "hat" | "sleeping" | "auto" | undefined;
                        } | undefined;
                    } | undefined;
                    reason?: "recovery-needed" | "root-owned-elsewhere" | "root-unavailable" | undefined;
                };
                decode: (v: unknown) => {
                    unread: boolean;
                    readRevision: number;
                    group: {
                        id: string;
                        operationId: string;
                        createDigest: string;
                        createdAt: number;
                        updatedAt: number;
                        schemaVersion: 1;
                        name: string;
                        rootSessionId: string;
                        rootPresetId: "dsh-bot-group-root";
                        cwd: string;
                        mode: "natural" | "mention" | "round-robin";
                        membershipRevision: number;
                        revision: number;
                        archived: boolean;
                        state: "ready" | "creating" | "recovery_needed";
                        modelSelection?: {
                            provider: string;
                            model: string;
                            reasoningEffort?: string | undefined;
                        } | undefined;
                        memberModelSelections?: {
                            memberId: string;
                            modelSelection: {
                                provider: string;
                                model: string;
                                reasoningEffort?: string | undefined;
                            };
                        }[] | undefined;
                        modelRevision?: number | undefined;
                        nextMemberId?: string | undefined;
                    };
                    members: {
                        id: string;
                        group: {
                            groupId: string;
                            groupCreatedAt: number;
                        };
                        bot: {
                            botId: string;
                            botCreatedAt: number;
                        };
                        order: number;
                        joinedAt: number;
                        enabled: boolean;
                        removedAt?: number | undefined;
                    }[];
                    unavailableMemberIds: string[];
                    running: boolean;
                    turns: {
                        id: string;
                        group: {
                            groupId: string;
                            groupCreatedAt: number;
                        };
                        operationId: string;
                        requestDigest: string;
                        inputMessageId: string;
                        createdAt: number;
                        updatedAt: number;
                        revision: number;
                        schemaVersion: 1;
                        membershipRevision: number;
                        orderedMemberIds: string[];
                        mode: "natural" | "mention" | "round-robin";
                        contextThroughSeq: number;
                        state: "completed" | "cancelled" | "idle" | "running" | "accepted" | "recovery_needed" | "paused" | "partial";
                        inputSeq?: number | undefined;
                        modelSelection?: {
                            provider: string;
                            model: string;
                            reasoningEffort?: string | undefined;
                        } | undefined;
                        memberModelSelections?: {
                            memberId: string;
                            modelSelection: {
                                provider: string;
                                model: string;
                                reasoningEffort?: string | undefined;
                            };
                        }[] | undefined;
                        predecessorTurnIds?: string[] | undefined;
                        followups?: {
                            operationId: string;
                            requestDigest: string;
                            deliveryId: string;
                            messageId: string;
                            state: "unknown" | "dispatching" | "accepted";
                            childMessageId?: string | undefined;
                        }[] | undefined;
                        replyTo?: string | undefined;
                        protocol?: 2 | undefined;
                        automaticExecutions?: number | undefined;
                        continuationAllowance?: number | undefined;
                        stoppedMemberIds?: string[] | undefined;
                    }[];
                    deliveries: {
                        id: string;
                        turnId: string;
                        memberId: string;
                        ordinal: number;
                        bot: {
                            botId: string;
                            botCreatedAt: number;
                        };
                        botRevision: number;
                        presetId: string;
                        contextOutputMessageIds: string[];
                        contextTruncated: boolean;
                        state: "pending" | "unknown" | "completed" | "skipped" | "failed" | "cancelled" | "running" | "starting";
                        automatic?: boolean | undefined;
                        startedAt?: number | undefined;
                        endedAt?: number | undefined;
                        nativeRunId?: string | undefined;
                        childMessageId?: string | undefined;
                        joinedDeliveryId?: string | undefined;
                        childSessionId?: string | undefined;
                        triggerMessageId?: string | undefined;
                        returnMemberId?: string | undefined;
                        requestDigest?: string | undefined;
                        skipped?: boolean | undefined;
                        outputMessageId?: string | undefined;
                        outputSeq?: number | undefined;
                        stopReason?: string | undefined;
                        reasonCode?: string | undefined;
                    }[];
                    messages: {
                        id: string;
                        seq: number;
                        at: number;
                        text: string;
                        turnId: string;
                        hasNonText?: boolean | undefined;
                        attachments?: ({
                            type: "file";
                            attachment: {
                                attachmentId: string;
                                name: string;
                                bytes: number;
                            };
                        } | {
                            type: "image";
                            attachment: {
                                attachmentId: string;
                                mediaType: "image/png" | "image/jpeg" | "image/webp" | "image/gif";
                                bytes: number;
                                width: number;
                                height: number;
                                name?: string | undefined;
                                originalDimensions?: {
                                    width: number;
                                    height: number;
                                } | undefined;
                            };
                            offloaded?: true | undefined;
                        })[] | undefined;
                        replyTo?: string | undefined;
                        authorKind?: "user" | "bot" | undefined;
                        causeId?: string | undefined;
                        speaker?: {
                            bot: {
                                botId: string;
                                botCreatedAt: number;
                            };
                            name: string;
                            avatar?: string | undefined;
                            avatarColor?: "--dsw-alias-state-business-primary" | "--dsw-alias-state-success-primary" | "--dsw-alias-state-warn-label" | "--dsw-alias-state-error-primary" | "teal" | "cyan" | "indigo" | "purple" | "rose" | "orange" | "olive" | "slate" | undefined;
                            avatarVariant?: "classic" | "glasses" | "spout" | "baby" | "hat" | "sleeping" | "auto" | undefined;
                        } | undefined;
                        childSessionId?: string | undefined;
                        stopReason?: string | undefined;
                    }[];
                    hasEarlier: boolean;
                    latest?: {
                        seq: number;
                        at: number;
                        speaker?: {
                            bot: {
                                botId: string;
                                botCreatedAt: number;
                            };
                            name: string;
                            avatar?: string | undefined;
                            avatarColor?: "--dsw-alias-state-business-primary" | "--dsw-alias-state-success-primary" | "--dsw-alias-state-warn-label" | "--dsw-alias-state-error-primary" | "teal" | "cyan" | "indigo" | "purple" | "rose" | "orange" | "olive" | "slate" | undefined;
                            avatarVariant?: "classic" | "glasses" | "spout" | "baby" | "hat" | "sleeping" | "auto" | undefined;
                        } | undefined;
                    } | undefined;
                    reason?: "recovery-needed" | "root-owned-elsewhere" | "root-unavailable" | undefined;
                };
            };
            readonly service: string;
            readonly invocation: {
                kind: "direct";
            };
        };
        readonly 'dshBot.groups/send': {
            readonly parameters: readonly [{
                name: string;
                source: "json";
                codec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodObject<{
                        groupId: z.ZodString;
                        groupCreatedAt: z.ZodNumber;
                    }, z.core.$strict>;
                    encode: (v: unknown) => {
                        groupId: string;
                        groupCreatedAt: number;
                    };
                    decode: (v: unknown) => {
                        groupId: string;
                        groupCreatedAt: number;
                    };
                };
                strictCodec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodObject<{
                        groupId: z.ZodString;
                        groupCreatedAt: z.ZodNumber;
                    }, z.core.$strict>;
                    encode: (v: unknown) => {
                        groupId: string;
                        groupCreatedAt: number;
                    };
                    decode: (v: unknown) => {
                        groupId: string;
                        groupCreatedAt: number;
                    };
                };
            }, {
                name: string;
                source: "json";
                codec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodObject<{
                        operationId: z.ZodString;
                        expectedMembershipRevision: z.ZodNumber;
                        text: z.ZodDefault<z.ZodString>;
                        fileReceiptIds: z.ZodDefault<z.ZodArray<z.ZodString>>;
                        memberIds: z.ZodDefault<z.ZodArray<z.ZodString>>;
                        round: z.ZodDefault<z.ZodBoolean>;
                        followup: z.ZodOptional<z.ZodObject<{
                            turnId: z.ZodString;
                            deliveryId: z.ZodString;
                        }, z.core.$strict>>;
                        replyTo: z.ZodOptional<z.ZodString>;
                    }, z.core.$strict>;
                    encode: (v: unknown) => {
                        operationId: string;
                        expectedMembershipRevision: number;
                        text: string;
                        fileReceiptIds: string[];
                        memberIds: string[];
                        round: boolean;
                        followup?: {
                            turnId: string;
                            deliveryId: string;
                        } | undefined;
                        replyTo?: string | undefined;
                    };
                    decode: (v: unknown) => {
                        operationId: string;
                        expectedMembershipRevision: number;
                        text: string;
                        fileReceiptIds: string[];
                        memberIds: string[];
                        round: boolean;
                        followup?: {
                            turnId: string;
                            deliveryId: string;
                        } | undefined;
                        replyTo?: string | undefined;
                    };
                };
                strictCodec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodObject<{
                        operationId: z.ZodString;
                        expectedMembershipRevision: z.ZodNumber;
                        text: z.ZodDefault<z.ZodString>;
                        fileReceiptIds: z.ZodDefault<z.ZodArray<z.ZodString>>;
                        memberIds: z.ZodDefault<z.ZodArray<z.ZodString>>;
                        round: z.ZodDefault<z.ZodBoolean>;
                        followup: z.ZodOptional<z.ZodObject<{
                            turnId: z.ZodString;
                            deliveryId: z.ZodString;
                        }, z.core.$strict>>;
                        replyTo: z.ZodOptional<z.ZodString>;
                    }, z.core.$strict>;
                    encode: (v: unknown) => {
                        operationId: string;
                        expectedMembershipRevision: number;
                        text: string;
                        fileReceiptIds: string[];
                        memberIds: string[];
                        round: boolean;
                        followup?: {
                            turnId: string;
                            deliveryId: string;
                        } | undefined;
                        replyTo?: string | undefined;
                    };
                    decode: (v: unknown) => {
                        operationId: string;
                        expectedMembershipRevision: number;
                        text: string;
                        fileReceiptIds: string[];
                        memberIds: string[];
                        round: boolean;
                        followup?: {
                            turnId: string;
                            deliveryId: string;
                        } | undefined;
                        replyTo?: string | undefined;
                    };
                };
            }];
            readonly result: {
                mode: "strict";
                typeSymbol: string;
                create: () => z.ZodObject<{
                    id: z.ZodString;
                    group: z.ZodObject<{
                        groupId: z.ZodString;
                        groupCreatedAt: z.ZodNumber;
                    }, z.core.$strict>;
                    operationId: z.ZodString;
                    requestDigest: z.ZodString;
                    inputMessageId: z.ZodString;
                    inputSeq: z.ZodOptional<z.ZodNumber>;
                    createdAt: z.ZodNumber;
                    updatedAt: z.ZodNumber;
                    revision: z.ZodNumber;
                    schemaVersion: z.ZodLiteral<1>;
                    membershipRevision: z.ZodNumber;
                    orderedMemberIds: z.ZodArray<z.ZodString>;
                    mode: z.ZodEnum<{
                        natural: "natural";
                        mention: "mention";
                        "round-robin": "round-robin";
                    }>;
                    contextThroughSeq: z.ZodNumber;
                    modelSelection: z.ZodOptional<z.ZodObject<{
                        provider: z.ZodString;
                        model: z.ZodString;
                        reasoningEffort: z.ZodOptional<z.ZodString>;
                    }, z.core.$strict>>;
                    memberModelSelections: z.ZodOptional<z.ZodArray<z.ZodObject<{
                        memberId: z.ZodString;
                        modelSelection: z.ZodObject<{
                            provider: z.ZodString;
                            model: z.ZodString;
                            reasoningEffort: z.ZodOptional<z.ZodString>;
                        }, z.core.$strict>;
                    }, z.core.$strict>>>;
                    predecessorTurnIds: z.ZodOptional<z.ZodArray<z.ZodString>>;
                    followups: z.ZodOptional<z.ZodArray<z.ZodObject<{
                        operationId: z.ZodString;
                        requestDigest: z.ZodString;
                        deliveryId: z.ZodString;
                        messageId: z.ZodString;
                        childMessageId: z.ZodOptional<z.ZodString>;
                        state: z.ZodEnum<{
                            unknown: "unknown";
                            dispatching: "dispatching";
                            accepted: "accepted";
                        }>;
                    }, z.core.$strict>>>;
                    replyTo: z.ZodOptional<z.ZodString>;
                    protocol: z.ZodOptional<z.ZodLiteral<2>>;
                    automaticExecutions: z.ZodOptional<z.ZodNumber>;
                    continuationAllowance: z.ZodOptional<z.ZodNumber>;
                    stoppedMemberIds: z.ZodOptional<z.ZodArray<z.ZodString>>;
                    state: z.ZodEnum<{
                        completed: "completed";
                        cancelled: "cancelled";
                        idle: "idle";
                        running: "running";
                        accepted: "accepted";
                        recovery_needed: "recovery_needed";
                        paused: "paused";
                        partial: "partial";
                    }>;
                }, z.core.$strict>;
                encode: (v: unknown) => {
                    id: string;
                    group: {
                        groupId: string;
                        groupCreatedAt: number;
                    };
                    operationId: string;
                    requestDigest: string;
                    inputMessageId: string;
                    createdAt: number;
                    updatedAt: number;
                    revision: number;
                    schemaVersion: 1;
                    membershipRevision: number;
                    orderedMemberIds: string[];
                    mode: "natural" | "mention" | "round-robin";
                    contextThroughSeq: number;
                    state: "completed" | "cancelled" | "idle" | "running" | "accepted" | "recovery_needed" | "paused" | "partial";
                    inputSeq?: number | undefined;
                    modelSelection?: {
                        provider: string;
                        model: string;
                        reasoningEffort?: string | undefined;
                    } | undefined;
                    memberModelSelections?: {
                        memberId: string;
                        modelSelection: {
                            provider: string;
                            model: string;
                            reasoningEffort?: string | undefined;
                        };
                    }[] | undefined;
                    predecessorTurnIds?: string[] | undefined;
                    followups?: {
                        operationId: string;
                        requestDigest: string;
                        deliveryId: string;
                        messageId: string;
                        state: "unknown" | "dispatching" | "accepted";
                        childMessageId?: string | undefined;
                    }[] | undefined;
                    replyTo?: string | undefined;
                    protocol?: 2 | undefined;
                    automaticExecutions?: number | undefined;
                    continuationAllowance?: number | undefined;
                    stoppedMemberIds?: string[] | undefined;
                };
                decode: (v: unknown) => {
                    id: string;
                    group: {
                        groupId: string;
                        groupCreatedAt: number;
                    };
                    operationId: string;
                    requestDigest: string;
                    inputMessageId: string;
                    createdAt: number;
                    updatedAt: number;
                    revision: number;
                    schemaVersion: 1;
                    membershipRevision: number;
                    orderedMemberIds: string[];
                    mode: "natural" | "mention" | "round-robin";
                    contextThroughSeq: number;
                    state: "completed" | "cancelled" | "idle" | "running" | "accepted" | "recovery_needed" | "paused" | "partial";
                    inputSeq?: number | undefined;
                    modelSelection?: {
                        provider: string;
                        model: string;
                        reasoningEffort?: string | undefined;
                    } | undefined;
                    memberModelSelections?: {
                        memberId: string;
                        modelSelection: {
                            provider: string;
                            model: string;
                            reasoningEffort?: string | undefined;
                        };
                    }[] | undefined;
                    predecessorTurnIds?: string[] | undefined;
                    followups?: {
                        operationId: string;
                        requestDigest: string;
                        deliveryId: string;
                        messageId: string;
                        state: "unknown" | "dispatching" | "accepted";
                        childMessageId?: string | undefined;
                    }[] | undefined;
                    replyTo?: string | undefined;
                    protocol?: 2 | undefined;
                    automaticExecutions?: number | undefined;
                    continuationAllowance?: number | undefined;
                    stoppedMemberIds?: string[] | undefined;
                };
            };
            readonly service: string;
            readonly invocation: {
                kind: "direct";
            };
        };
        readonly 'dshBot.groups/cancel': {
            readonly parameters: readonly [{
                name: string;
                source: "json";
                codec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodObject<{
                        groupId: z.ZodString;
                        groupCreatedAt: z.ZodNumber;
                    }, z.core.$strict>;
                    encode: (v: unknown) => {
                        groupId: string;
                        groupCreatedAt: number;
                    };
                    decode: (v: unknown) => {
                        groupId: string;
                        groupCreatedAt: number;
                    };
                };
                strictCodec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodObject<{
                        groupId: z.ZodString;
                        groupCreatedAt: z.ZodNumber;
                    }, z.core.$strict>;
                    encode: (v: unknown) => {
                        groupId: string;
                        groupCreatedAt: number;
                    };
                    decode: (v: unknown) => {
                        groupId: string;
                        groupCreatedAt: number;
                    };
                };
            }, {
                name: string;
                source: "json";
                codec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodString;
                    encode: (v: unknown) => string;
                    decode: (v: unknown) => string;
                };
                strictCodec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodString;
                    encode: (v: unknown) => string;
                    decode: (v: unknown) => string;
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
                    group: z.ZodObject<{
                        groupId: z.ZodString;
                        groupCreatedAt: z.ZodNumber;
                    }, z.core.$strict>;
                    operationId: z.ZodString;
                    requestDigest: z.ZodString;
                    inputMessageId: z.ZodString;
                    inputSeq: z.ZodOptional<z.ZodNumber>;
                    createdAt: z.ZodNumber;
                    updatedAt: z.ZodNumber;
                    revision: z.ZodNumber;
                    schemaVersion: z.ZodLiteral<1>;
                    membershipRevision: z.ZodNumber;
                    orderedMemberIds: z.ZodArray<z.ZodString>;
                    mode: z.ZodEnum<{
                        natural: "natural";
                        mention: "mention";
                        "round-robin": "round-robin";
                    }>;
                    contextThroughSeq: z.ZodNumber;
                    modelSelection: z.ZodOptional<z.ZodObject<{
                        provider: z.ZodString;
                        model: z.ZodString;
                        reasoningEffort: z.ZodOptional<z.ZodString>;
                    }, z.core.$strict>>;
                    memberModelSelections: z.ZodOptional<z.ZodArray<z.ZodObject<{
                        memberId: z.ZodString;
                        modelSelection: z.ZodObject<{
                            provider: z.ZodString;
                            model: z.ZodString;
                            reasoningEffort: z.ZodOptional<z.ZodString>;
                        }, z.core.$strict>;
                    }, z.core.$strict>>>;
                    predecessorTurnIds: z.ZodOptional<z.ZodArray<z.ZodString>>;
                    followups: z.ZodOptional<z.ZodArray<z.ZodObject<{
                        operationId: z.ZodString;
                        requestDigest: z.ZodString;
                        deliveryId: z.ZodString;
                        messageId: z.ZodString;
                        childMessageId: z.ZodOptional<z.ZodString>;
                        state: z.ZodEnum<{
                            unknown: "unknown";
                            dispatching: "dispatching";
                            accepted: "accepted";
                        }>;
                    }, z.core.$strict>>>;
                    replyTo: z.ZodOptional<z.ZodString>;
                    protocol: z.ZodOptional<z.ZodLiteral<2>>;
                    automaticExecutions: z.ZodOptional<z.ZodNumber>;
                    continuationAllowance: z.ZodOptional<z.ZodNumber>;
                    stoppedMemberIds: z.ZodOptional<z.ZodArray<z.ZodString>>;
                    state: z.ZodEnum<{
                        completed: "completed";
                        cancelled: "cancelled";
                        idle: "idle";
                        running: "running";
                        accepted: "accepted";
                        recovery_needed: "recovery_needed";
                        paused: "paused";
                        partial: "partial";
                    }>;
                }, z.core.$strict>;
                encode: (v: unknown) => {
                    id: string;
                    group: {
                        groupId: string;
                        groupCreatedAt: number;
                    };
                    operationId: string;
                    requestDigest: string;
                    inputMessageId: string;
                    createdAt: number;
                    updatedAt: number;
                    revision: number;
                    schemaVersion: 1;
                    membershipRevision: number;
                    orderedMemberIds: string[];
                    mode: "natural" | "mention" | "round-robin";
                    contextThroughSeq: number;
                    state: "completed" | "cancelled" | "idle" | "running" | "accepted" | "recovery_needed" | "paused" | "partial";
                    inputSeq?: number | undefined;
                    modelSelection?: {
                        provider: string;
                        model: string;
                        reasoningEffort?: string | undefined;
                    } | undefined;
                    memberModelSelections?: {
                        memberId: string;
                        modelSelection: {
                            provider: string;
                            model: string;
                            reasoningEffort?: string | undefined;
                        };
                    }[] | undefined;
                    predecessorTurnIds?: string[] | undefined;
                    followups?: {
                        operationId: string;
                        requestDigest: string;
                        deliveryId: string;
                        messageId: string;
                        state: "unknown" | "dispatching" | "accepted";
                        childMessageId?: string | undefined;
                    }[] | undefined;
                    replyTo?: string | undefined;
                    protocol?: 2 | undefined;
                    automaticExecutions?: number | undefined;
                    continuationAllowance?: number | undefined;
                    stoppedMemberIds?: string[] | undefined;
                };
                decode: (v: unknown) => {
                    id: string;
                    group: {
                        groupId: string;
                        groupCreatedAt: number;
                    };
                    operationId: string;
                    requestDigest: string;
                    inputMessageId: string;
                    createdAt: number;
                    updatedAt: number;
                    revision: number;
                    schemaVersion: 1;
                    membershipRevision: number;
                    orderedMemberIds: string[];
                    mode: "natural" | "mention" | "round-robin";
                    contextThroughSeq: number;
                    state: "completed" | "cancelled" | "idle" | "running" | "accepted" | "recovery_needed" | "paused" | "partial";
                    inputSeq?: number | undefined;
                    modelSelection?: {
                        provider: string;
                        model: string;
                        reasoningEffort?: string | undefined;
                    } | undefined;
                    memberModelSelections?: {
                        memberId: string;
                        modelSelection: {
                            provider: string;
                            model: string;
                            reasoningEffort?: string | undefined;
                        };
                    }[] | undefined;
                    predecessorTurnIds?: string[] | undefined;
                    followups?: {
                        operationId: string;
                        requestDigest: string;
                        deliveryId: string;
                        messageId: string;
                        state: "unknown" | "dispatching" | "accepted";
                        childMessageId?: string | undefined;
                    }[] | undefined;
                    replyTo?: string | undefined;
                    protocol?: 2 | undefined;
                    automaticExecutions?: number | undefined;
                    continuationAllowance?: number | undefined;
                    stoppedMemberIds?: string[] | undefined;
                };
            };
            readonly service: string;
            readonly invocation: {
                kind: "direct";
            };
        };
        readonly 'dshBot.groups/continueTurn': {
            readonly parameters: readonly [{
                name: string;
                source: "json";
                codec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodObject<{
                        groupId: z.ZodString;
                        groupCreatedAt: z.ZodNumber;
                    }, z.core.$strict>;
                    encode: (v: unknown) => {
                        groupId: string;
                        groupCreatedAt: number;
                    };
                    decode: (v: unknown) => {
                        groupId: string;
                        groupCreatedAt: number;
                    };
                };
                strictCodec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodObject<{
                        groupId: z.ZodString;
                        groupCreatedAt: z.ZodNumber;
                    }, z.core.$strict>;
                    encode: (v: unknown) => {
                        groupId: string;
                        groupCreatedAt: number;
                    };
                    decode: (v: unknown) => {
                        groupId: string;
                        groupCreatedAt: number;
                    };
                };
            }, {
                name: string;
                source: "json";
                codec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodString;
                    encode: (v: unknown) => string;
                    decode: (v: unknown) => string;
                };
                strictCodec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodString;
                    encode: (v: unknown) => string;
                    decode: (v: unknown) => string;
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
                    group: z.ZodObject<{
                        groupId: z.ZodString;
                        groupCreatedAt: z.ZodNumber;
                    }, z.core.$strict>;
                    operationId: z.ZodString;
                    requestDigest: z.ZodString;
                    inputMessageId: z.ZodString;
                    inputSeq: z.ZodOptional<z.ZodNumber>;
                    createdAt: z.ZodNumber;
                    updatedAt: z.ZodNumber;
                    revision: z.ZodNumber;
                    schemaVersion: z.ZodLiteral<1>;
                    membershipRevision: z.ZodNumber;
                    orderedMemberIds: z.ZodArray<z.ZodString>;
                    mode: z.ZodEnum<{
                        natural: "natural";
                        mention: "mention";
                        "round-robin": "round-robin";
                    }>;
                    contextThroughSeq: z.ZodNumber;
                    modelSelection: z.ZodOptional<z.ZodObject<{
                        provider: z.ZodString;
                        model: z.ZodString;
                        reasoningEffort: z.ZodOptional<z.ZodString>;
                    }, z.core.$strict>>;
                    memberModelSelections: z.ZodOptional<z.ZodArray<z.ZodObject<{
                        memberId: z.ZodString;
                        modelSelection: z.ZodObject<{
                            provider: z.ZodString;
                            model: z.ZodString;
                            reasoningEffort: z.ZodOptional<z.ZodString>;
                        }, z.core.$strict>;
                    }, z.core.$strict>>>;
                    predecessorTurnIds: z.ZodOptional<z.ZodArray<z.ZodString>>;
                    followups: z.ZodOptional<z.ZodArray<z.ZodObject<{
                        operationId: z.ZodString;
                        requestDigest: z.ZodString;
                        deliveryId: z.ZodString;
                        messageId: z.ZodString;
                        childMessageId: z.ZodOptional<z.ZodString>;
                        state: z.ZodEnum<{
                            unknown: "unknown";
                            dispatching: "dispatching";
                            accepted: "accepted";
                        }>;
                    }, z.core.$strict>>>;
                    replyTo: z.ZodOptional<z.ZodString>;
                    protocol: z.ZodOptional<z.ZodLiteral<2>>;
                    automaticExecutions: z.ZodOptional<z.ZodNumber>;
                    continuationAllowance: z.ZodOptional<z.ZodNumber>;
                    stoppedMemberIds: z.ZodOptional<z.ZodArray<z.ZodString>>;
                    state: z.ZodEnum<{
                        completed: "completed";
                        cancelled: "cancelled";
                        idle: "idle";
                        running: "running";
                        accepted: "accepted";
                        recovery_needed: "recovery_needed";
                        paused: "paused";
                        partial: "partial";
                    }>;
                }, z.core.$strict>;
                encode: (v: unknown) => {
                    id: string;
                    group: {
                        groupId: string;
                        groupCreatedAt: number;
                    };
                    operationId: string;
                    requestDigest: string;
                    inputMessageId: string;
                    createdAt: number;
                    updatedAt: number;
                    revision: number;
                    schemaVersion: 1;
                    membershipRevision: number;
                    orderedMemberIds: string[];
                    mode: "natural" | "mention" | "round-robin";
                    contextThroughSeq: number;
                    state: "completed" | "cancelled" | "idle" | "running" | "accepted" | "recovery_needed" | "paused" | "partial";
                    inputSeq?: number | undefined;
                    modelSelection?: {
                        provider: string;
                        model: string;
                        reasoningEffort?: string | undefined;
                    } | undefined;
                    memberModelSelections?: {
                        memberId: string;
                        modelSelection: {
                            provider: string;
                            model: string;
                            reasoningEffort?: string | undefined;
                        };
                    }[] | undefined;
                    predecessorTurnIds?: string[] | undefined;
                    followups?: {
                        operationId: string;
                        requestDigest: string;
                        deliveryId: string;
                        messageId: string;
                        state: "unknown" | "dispatching" | "accepted";
                        childMessageId?: string | undefined;
                    }[] | undefined;
                    replyTo?: string | undefined;
                    protocol?: 2 | undefined;
                    automaticExecutions?: number | undefined;
                    continuationAllowance?: number | undefined;
                    stoppedMemberIds?: string[] | undefined;
                };
                decode: (v: unknown) => {
                    id: string;
                    group: {
                        groupId: string;
                        groupCreatedAt: number;
                    };
                    operationId: string;
                    requestDigest: string;
                    inputMessageId: string;
                    createdAt: number;
                    updatedAt: number;
                    revision: number;
                    schemaVersion: 1;
                    membershipRevision: number;
                    orderedMemberIds: string[];
                    mode: "natural" | "mention" | "round-robin";
                    contextThroughSeq: number;
                    state: "completed" | "cancelled" | "idle" | "running" | "accepted" | "recovery_needed" | "paused" | "partial";
                    inputSeq?: number | undefined;
                    modelSelection?: {
                        provider: string;
                        model: string;
                        reasoningEffort?: string | undefined;
                    } | undefined;
                    memberModelSelections?: {
                        memberId: string;
                        modelSelection: {
                            provider: string;
                            model: string;
                            reasoningEffort?: string | undefined;
                        };
                    }[] | undefined;
                    predecessorTurnIds?: string[] | undefined;
                    followups?: {
                        operationId: string;
                        requestDigest: string;
                        deliveryId: string;
                        messageId: string;
                        state: "unknown" | "dispatching" | "accepted";
                        childMessageId?: string | undefined;
                    }[] | undefined;
                    replyTo?: string | undefined;
                    protocol?: 2 | undefined;
                    automaticExecutions?: number | undefined;
                    continuationAllowance?: number | undefined;
                    stoppedMemberIds?: string[] | undefined;
                };
            };
            readonly service: string;
            readonly invocation: {
                kind: "direct";
            };
        };
        readonly 'dshBot.groups/stopMember': {
            readonly parameters: readonly [{
                name: string;
                source: "json";
                codec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodObject<{
                        groupId: z.ZodString;
                        groupCreatedAt: z.ZodNumber;
                    }, z.core.$strict>;
                    encode: (v: unknown) => {
                        groupId: string;
                        groupCreatedAt: number;
                    };
                    decode: (v: unknown) => {
                        groupId: string;
                        groupCreatedAt: number;
                    };
                };
                strictCodec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodObject<{
                        groupId: z.ZodString;
                        groupCreatedAt: z.ZodNumber;
                    }, z.core.$strict>;
                    encode: (v: unknown) => {
                        groupId: string;
                        groupCreatedAt: number;
                    };
                    decode: (v: unknown) => {
                        groupId: string;
                        groupCreatedAt: number;
                    };
                };
            }, {
                name: string;
                source: "json";
                codec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodString;
                    encode: (v: unknown) => string;
                    decode: (v: unknown) => string;
                };
                strictCodec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodString;
                    encode: (v: unknown) => string;
                    decode: (v: unknown) => string;
                };
            }, {
                name: string;
                source: "json";
                codec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodString;
                    encode: (v: unknown) => string;
                    decode: (v: unknown) => string;
                };
                strictCodec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodString;
                    encode: (v: unknown) => string;
                    decode: (v: unknown) => string;
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
                    group: z.ZodObject<{
                        groupId: z.ZodString;
                        groupCreatedAt: z.ZodNumber;
                    }, z.core.$strict>;
                    operationId: z.ZodString;
                    requestDigest: z.ZodString;
                    inputMessageId: z.ZodString;
                    inputSeq: z.ZodOptional<z.ZodNumber>;
                    createdAt: z.ZodNumber;
                    updatedAt: z.ZodNumber;
                    revision: z.ZodNumber;
                    schemaVersion: z.ZodLiteral<1>;
                    membershipRevision: z.ZodNumber;
                    orderedMemberIds: z.ZodArray<z.ZodString>;
                    mode: z.ZodEnum<{
                        natural: "natural";
                        mention: "mention";
                        "round-robin": "round-robin";
                    }>;
                    contextThroughSeq: z.ZodNumber;
                    modelSelection: z.ZodOptional<z.ZodObject<{
                        provider: z.ZodString;
                        model: z.ZodString;
                        reasoningEffort: z.ZodOptional<z.ZodString>;
                    }, z.core.$strict>>;
                    memberModelSelections: z.ZodOptional<z.ZodArray<z.ZodObject<{
                        memberId: z.ZodString;
                        modelSelection: z.ZodObject<{
                            provider: z.ZodString;
                            model: z.ZodString;
                            reasoningEffort: z.ZodOptional<z.ZodString>;
                        }, z.core.$strict>;
                    }, z.core.$strict>>>;
                    predecessorTurnIds: z.ZodOptional<z.ZodArray<z.ZodString>>;
                    followups: z.ZodOptional<z.ZodArray<z.ZodObject<{
                        operationId: z.ZodString;
                        requestDigest: z.ZodString;
                        deliveryId: z.ZodString;
                        messageId: z.ZodString;
                        childMessageId: z.ZodOptional<z.ZodString>;
                        state: z.ZodEnum<{
                            unknown: "unknown";
                            dispatching: "dispatching";
                            accepted: "accepted";
                        }>;
                    }, z.core.$strict>>>;
                    replyTo: z.ZodOptional<z.ZodString>;
                    protocol: z.ZodOptional<z.ZodLiteral<2>>;
                    automaticExecutions: z.ZodOptional<z.ZodNumber>;
                    continuationAllowance: z.ZodOptional<z.ZodNumber>;
                    stoppedMemberIds: z.ZodOptional<z.ZodArray<z.ZodString>>;
                    state: z.ZodEnum<{
                        completed: "completed";
                        cancelled: "cancelled";
                        idle: "idle";
                        running: "running";
                        accepted: "accepted";
                        recovery_needed: "recovery_needed";
                        paused: "paused";
                        partial: "partial";
                    }>;
                }, z.core.$strict>;
                encode: (v: unknown) => {
                    id: string;
                    group: {
                        groupId: string;
                        groupCreatedAt: number;
                    };
                    operationId: string;
                    requestDigest: string;
                    inputMessageId: string;
                    createdAt: number;
                    updatedAt: number;
                    revision: number;
                    schemaVersion: 1;
                    membershipRevision: number;
                    orderedMemberIds: string[];
                    mode: "natural" | "mention" | "round-robin";
                    contextThroughSeq: number;
                    state: "completed" | "cancelled" | "idle" | "running" | "accepted" | "recovery_needed" | "paused" | "partial";
                    inputSeq?: number | undefined;
                    modelSelection?: {
                        provider: string;
                        model: string;
                        reasoningEffort?: string | undefined;
                    } | undefined;
                    memberModelSelections?: {
                        memberId: string;
                        modelSelection: {
                            provider: string;
                            model: string;
                            reasoningEffort?: string | undefined;
                        };
                    }[] | undefined;
                    predecessorTurnIds?: string[] | undefined;
                    followups?: {
                        operationId: string;
                        requestDigest: string;
                        deliveryId: string;
                        messageId: string;
                        state: "unknown" | "dispatching" | "accepted";
                        childMessageId?: string | undefined;
                    }[] | undefined;
                    replyTo?: string | undefined;
                    protocol?: 2 | undefined;
                    automaticExecutions?: number | undefined;
                    continuationAllowance?: number | undefined;
                    stoppedMemberIds?: string[] | undefined;
                };
                decode: (v: unknown) => {
                    id: string;
                    group: {
                        groupId: string;
                        groupCreatedAt: number;
                    };
                    operationId: string;
                    requestDigest: string;
                    inputMessageId: string;
                    createdAt: number;
                    updatedAt: number;
                    revision: number;
                    schemaVersion: 1;
                    membershipRevision: number;
                    orderedMemberIds: string[];
                    mode: "natural" | "mention" | "round-robin";
                    contextThroughSeq: number;
                    state: "completed" | "cancelled" | "idle" | "running" | "accepted" | "recovery_needed" | "paused" | "partial";
                    inputSeq?: number | undefined;
                    modelSelection?: {
                        provider: string;
                        model: string;
                        reasoningEffort?: string | undefined;
                    } | undefined;
                    memberModelSelections?: {
                        memberId: string;
                        modelSelection: {
                            provider: string;
                            model: string;
                            reasoningEffort?: string | undefined;
                        };
                    }[] | undefined;
                    predecessorTurnIds?: string[] | undefined;
                    followups?: {
                        operationId: string;
                        requestDigest: string;
                        deliveryId: string;
                        messageId: string;
                        state: "unknown" | "dispatching" | "accepted";
                        childMessageId?: string | undefined;
                    }[] | undefined;
                    replyTo?: string | undefined;
                    protocol?: 2 | undefined;
                    automaticExecutions?: number | undefined;
                    continuationAllowance?: number | undefined;
                    stoppedMemberIds?: string[] | undefined;
                };
            };
            readonly service: string;
            readonly invocation: {
                kind: "direct";
            };
        };
        readonly 'dshBot.groups/archive': {
            readonly parameters: readonly [{
                name: string;
                source: "json";
                codec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodObject<{
                        groupId: z.ZodString;
                        groupCreatedAt: z.ZodNumber;
                    }, z.core.$strict>;
                    encode: (v: unknown) => {
                        groupId: string;
                        groupCreatedAt: number;
                    };
                    decode: (v: unknown) => {
                        groupId: string;
                        groupCreatedAt: number;
                    };
                };
                strictCodec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodObject<{
                        groupId: z.ZodString;
                        groupCreatedAt: z.ZodNumber;
                    }, z.core.$strict>;
                    encode: (v: unknown) => {
                        groupId: string;
                        groupCreatedAt: number;
                    };
                    decode: (v: unknown) => {
                        groupId: string;
                        groupCreatedAt: number;
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
                    operationId: z.ZodString;
                    createDigest: z.ZodString;
                    createdAt: z.ZodNumber;
                    updatedAt: z.ZodNumber;
                    schemaVersion: z.ZodLiteral<1>;
                    name: z.ZodString;
                    rootSessionId: z.ZodString;
                    rootPresetId: z.ZodLiteral<"dsh-bot-group-root">;
                    cwd: z.ZodString;
                    mode: z.ZodEnum<{
                        natural: "natural";
                        mention: "mention";
                        "round-robin": "round-robin";
                    }>;
                    modelSelection: z.ZodOptional<z.ZodObject<{
                        provider: z.ZodString;
                        model: z.ZodString;
                        reasoningEffort: z.ZodOptional<z.ZodString>;
                    }, z.core.$strict>>;
                    memberModelSelections: z.ZodOptional<z.ZodArray<z.ZodObject<{
                        memberId: z.ZodString;
                        modelSelection: z.ZodObject<{
                            provider: z.ZodString;
                            model: z.ZodString;
                            reasoningEffort: z.ZodOptional<z.ZodString>;
                        }, z.core.$strict>;
                    }, z.core.$strict>>>;
                    modelRevision: z.ZodOptional<z.ZodNumber>;
                    nextMemberId: z.ZodOptional<z.ZodString>;
                    membershipRevision: z.ZodNumber;
                    revision: z.ZodNumber;
                    archived: z.ZodBoolean;
                    state: z.ZodEnum<{
                        ready: "ready";
                        creating: "creating";
                        recovery_needed: "recovery_needed";
                    }>;
                }, z.core.$strict>;
                encode: (v: unknown) => {
                    id: string;
                    operationId: string;
                    createDigest: string;
                    createdAt: number;
                    updatedAt: number;
                    schemaVersion: 1;
                    name: string;
                    rootSessionId: string;
                    rootPresetId: "dsh-bot-group-root";
                    cwd: string;
                    mode: "natural" | "mention" | "round-robin";
                    membershipRevision: number;
                    revision: number;
                    archived: boolean;
                    state: "ready" | "creating" | "recovery_needed";
                    modelSelection?: {
                        provider: string;
                        model: string;
                        reasoningEffort?: string | undefined;
                    } | undefined;
                    memberModelSelections?: {
                        memberId: string;
                        modelSelection: {
                            provider: string;
                            model: string;
                            reasoningEffort?: string | undefined;
                        };
                    }[] | undefined;
                    modelRevision?: number | undefined;
                    nextMemberId?: string | undefined;
                };
                decode: (v: unknown) => {
                    id: string;
                    operationId: string;
                    createDigest: string;
                    createdAt: number;
                    updatedAt: number;
                    schemaVersion: 1;
                    name: string;
                    rootSessionId: string;
                    rootPresetId: "dsh-bot-group-root";
                    cwd: string;
                    mode: "natural" | "mention" | "round-robin";
                    membershipRevision: number;
                    revision: number;
                    archived: boolean;
                    state: "ready" | "creating" | "recovery_needed";
                    modelSelection?: {
                        provider: string;
                        model: string;
                        reasoningEffort?: string | undefined;
                    } | undefined;
                    memberModelSelections?: {
                        memberId: string;
                        modelSelection: {
                            provider: string;
                            model: string;
                            reasoningEffort?: string | undefined;
                        };
                    }[] | undefined;
                    modelRevision?: number | undefined;
                    nextMemberId?: string | undefined;
                };
            };
            readonly service: string;
            readonly invocation: {
                kind: "direct";
            };
        };
    };
};
type Methods = typeof groupsSpec.methods;
type Args<P extends readonly unknown[]> = {
    -readonly [K in keyof P]: P[K] extends {
        codec: {
            create: () => infer S extends z.ZodType;
        };
    } ? z.input<S> : never;
};
type Result<K extends keyof Methods> = z.output<ReturnType<Methods[K]['result']['create']>>;
export type GroupMethods = {
    [K in keyof Methods as K extends `dshBot.groups/${infer M}` ? M : never]: (...args: Args<Methods[K]['parameters']>) => Promise<RemoteResult<Result<K>>>;
};
type Endpoints = {
    [K in keyof Methods]: (...args: Args<Methods[K]['parameters']>) => Promise<RemoteResult<Result<K>>>;
};
declare module '@deepseek-ai/dsh-typert-protocol' {
    interface TypertRemoteMap extends Endpoints {
    }
    interface TypertRemoteNamespaceMap {
        'dshBot.groups': GroupMethods;
    }
}
export declare const GROUPS_REMOTE: import("@deepseek-ai/dsh-typert-protocol").TypertRemoteInfo<Readonly<Record<string, import("@deepseek-ai/dsh-typert-protocol").TypertRemoteMethod<object, unknown, "unary", never, unknown> | import("@deepseek-ai/dsh-typert-protocol").TypertRemoteMethod<object, unknown, "stream", unknown, unknown>>>>;
export {};
