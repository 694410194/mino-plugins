import { z } from 'zod';
import type { RemoteResult } from '@deepseek-ai/dsh-typert-protocol';
export declare const integrationsSpec: {
    readonly package: "dsh-bot/integrations";
    readonly methods: {
        readonly 'dshBot.connectors/catalog': {
            readonly parameters: readonly [];
            readonly result: {
                mode: "strict";
                typeSymbol: string;
                create: () => z.ZodObject<{
                    definitions: z.ZodArray<z.ZodObject<{
                        id: z.ZodString;
                        label: z.ZodString;
                        templateId: z.ZodDefault<z.ZodEnum<{
                            custom: "custom";
                            github: "github";
                            filesystem: "filesystem";
                            browser: "browser";
                            notion: "notion";
                        }>>;
                        templateVersion: z.ZodDefault<z.ZodLiteral<1>>;
                        serverName: z.ZodString;
                        transport: z.ZodEnum<{
                            stdio: "stdio";
                            "streamable-http": "streamable-http";
                        }>;
                        command: z.ZodOptional<z.ZodString>;
                        args: z.ZodDefault<z.ZodArray<z.ZodString>>;
                        url: z.ZodOptional<z.ZodString>;
                        literalEnv: z.ZodDefault<z.ZodRecord<z.ZodEnum<{
                            LANG: "LANG";
                            LC_ALL: "LC_ALL";
                            TZ: "TZ";
                            NODE_ENV: "NODE_ENV";
                        }> & z.core.$partial, z.ZodString>>;
                        literalHeaders: z.ZodDefault<z.ZodRecord<z.ZodEnum<{
                            Accept: "Accept";
                            "Content-Type": "Content-Type";
                        }> & z.core.$partial, z.ZodEnum<{
                            "application/json": "application/json";
                            "text/event-stream": "text/event-stream";
                            "application/json, text/event-stream": "application/json, text/event-stream";
                        }>>>;
                        credentialBindings: z.ZodDefault<z.ZodArray<z.ZodObject<{
                            destination: z.ZodEnum<{
                                header: "header";
                                env: "env";
                            }>;
                            key: z.ZodString;
                            credentialRef: z.ZodString;
                            format: z.ZodEnum<{
                                raw: "raw";
                                bearer: "bearer";
                                "basic-token": "basic-token";
                            }>;
                        }, z.core.$strict>>>;
                        enabled: z.ZodDefault<z.ZodBoolean>;
                        revision: z.ZodNumber;
                        createdAt: z.ZodNumber;
                        updatedAt: z.ZodNumber;
                        schemaVersion: z.ZodLiteral<1>;
                    }, z.core.$strict>>;
                    assignments: z.ZodArray<z.ZodObject<{
                        id: z.ZodString;
                        bot: z.ZodObject<{
                            botId: z.ZodString;
                            botCreatedAt: z.ZodNumber;
                        }, z.core.$strict>;
                        connectorId: z.ZodString;
                        enabled: z.ZodBoolean;
                        overrides: z.ZodDefault<z.ZodObject<{
                            args: z.ZodOptional<z.ZodArray<z.ZodString>>;
                            literalEnv: z.ZodOptional<z.ZodDefault<z.ZodRecord<z.ZodEnum<{
                                LANG: "LANG";
                                LC_ALL: "LC_ALL";
                                TZ: "TZ";
                                NODE_ENV: "NODE_ENV";
                            }> & z.core.$partial, z.ZodString>>>;
                            literalHeaders: z.ZodOptional<z.ZodDefault<z.ZodRecord<z.ZodEnum<{
                                Accept: "Accept";
                                "Content-Type": "Content-Type";
                            }> & z.core.$partial, z.ZodEnum<{
                                "application/json": "application/json";
                                "text/event-stream": "text/event-stream";
                                "application/json, text/event-stream": "application/json, text/event-stream";
                            }>>>>;
                        }, z.core.$strict>>;
                        desiredRevision: z.ZodNumber;
                        revision: z.ZodNumber;
                        createdAt: z.ZodNumber;
                        updatedAt: z.ZodNumber;
                        schemaVersion: z.ZodLiteral<1>;
                    }, z.core.$strict>>;
                    runtime: z.ZodArray<z.ZodObject<{
                        assignmentId: z.ZodString;
                        sessionId: z.ZodString;
                        desiredRevision: z.ZodNumber;
                        appliedRevision: z.ZodOptional<z.ZodNumber>;
                        state: z.ZodEnum<{
                            pending: "pending";
                            unavailable: "unavailable";
                            ready: "ready";
                            disabled: "disabled";
                            connecting: "connecting";
                        }>;
                        reasonCode: z.ZodOptional<z.ZodEnum<{
                            revoked: "revoked";
                            saved: "saved";
                            busy: "busy";
                            "missing-credential": "missing-credential";
                            "initialization-failed": "initialization-failed";
                            "namespace-conflict": "namespace-conflict";
                            stopping: "stopping";
                            "agent-closed": "agent-closed";
                        }>>;
                        toolCount: z.ZodNumber;
                    }, z.core.$strict>>;
                    policies: z.ZodArray<z.ZodObject<{
                        id: z.ZodString;
                        owner: z.ZodObject<{
                            botId: z.ZodString;
                            botCreatedAt: z.ZodNumber;
                        }, z.core.$strict>;
                        channel: z.ZodEnum<{
                            "in-app": "in-app";
                            im: "im";
                        }>;
                        targetRef: z.ZodOptional<z.ZodString>;
                        enabled: z.ZodBoolean;
                        timezone: z.ZodString;
                        quietHours: z.ZodOptional<z.ZodObject<{
                            start: z.ZodString;
                            end: z.ZodString;
                        }, z.core.$strict>>;
                        dailyLimit: z.ZodNumber;
                        cooldownSec: z.ZodNumber;
                        authorization: z.ZodObject<{
                            mode: z.ZodEnum<{
                                ask: "ask";
                                preapproved: "preapproved";
                            }>;
                        }, z.core.$strict>;
                        scopeDigest: z.ZodString;
                        targetDigest: z.ZodString;
                        approvedAt: z.ZodOptional<z.ZodNumber>;
                        revision: z.ZodNumber;
                        createdAt: z.ZodNumber;
                        updatedAt: z.ZodNumber;
                        schemaVersion: z.ZodLiteral<1>;
                    }, z.core.$strict>>;
                    notifications: z.ZodArray<z.ZodObject<{
                        revision: z.ZodNumber;
                        createdAt: z.ZodNumber;
                        updatedAt: z.ZodNumber;
                        schemaVersion: z.ZodLiteral<1>;
                        id: z.ZodString;
                        operationId: z.ZodString;
                        flowId: z.ZodOptional<z.ZodUUID>;
                        owner: z.ZodObject<{
                            botId: z.ZodString;
                            botCreatedAt: z.ZodNumber;
                        }, z.core.$strict>;
                        policyId: z.ZodString;
                        policyRevision: z.ZodNumber;
                        targetDigest: z.ZodString;
                        scopeDigest: z.ZodString;
                        text: z.ZodString;
                        source: z.ZodObject<{
                            kind: z.ZodEnum<{
                                tool: "tool";
                                schedule: "schedule";
                                "manual-run": "manual-run";
                                "group-turn": "group-turn";
                            }>;
                            id: z.ZodString;
                            sessionId: z.ZodOptional<z.ZodString>;
                        }, z.core.$strict>;
                        state: z.ZodEnum<{
                            unknown: "unknown";
                            failed: "failed";
                            cancelled: "cancelled";
                            recorded: "recorded";
                            waiting_approval: "waiting_approval";
                            suppressed: "suppressed";
                            sending: "sending";
                            accepted: "accepted";
                        }>;
                        reasonCode: z.ZodOptional<z.ZodEnum<{
                            unsupported: "unsupported";
                            "approval-denied": "approval-denied";
                            "recovery-needed": "recovery-needed";
                            disabled: "disabled";
                            stopping: "stopping";
                            "quiet-hours": "quiet-hours";
                            "daily-limit": "daily-limit";
                            cooldown: "cooldown";
                            changed: "changed";
                            "transport-failed": "transport-failed";
                        }>>;
                        reservation: z.ZodOptional<z.ZodObject<{
                            at: z.ZodNumber;
                            day: z.ZodString;
                        }, z.core.$strict>>;
                        readAt: z.ZodOptional<z.ZodNumber>;
                        attemptId: z.ZodOptional<z.ZodString>;
                        platformMessageId: z.ZodOptional<z.ZodString>;
                    }, z.core.$strict>>;
                    unread: z.ZodNumber;
                    imSupported: z.ZodBoolean;
                    desktopSupported: z.ZodLiteral<false>;
                    defaults: z.ZodObject<{
                        dailyLimit: z.ZodNumber;
                        cooldownSec: z.ZodNumber;
                    }, z.core.$strict>;
                }, z.core.$strict>;
                encode: (v: unknown) => {
                    definitions: {
                        id: string;
                        label: string;
                        templateId: "custom" | "github" | "filesystem" | "browser" | "notion";
                        templateVersion: 1;
                        serverName: string;
                        transport: "stdio" | "streamable-http";
                        args: string[];
                        literalEnv: Partial<Record<"LANG" | "LC_ALL" | "TZ" | "NODE_ENV", string>>;
                        literalHeaders: Partial<Record<"Accept" | "Content-Type", "application/json" | "text/event-stream" | "application/json, text/event-stream">>;
                        credentialBindings: {
                            destination: "header" | "env";
                            key: string;
                            credentialRef: string;
                            format: "raw" | "bearer" | "basic-token";
                        }[];
                        enabled: boolean;
                        revision: number;
                        createdAt: number;
                        updatedAt: number;
                        schemaVersion: 1;
                        command?: string | undefined;
                        url?: string | undefined;
                    }[];
                    assignments: {
                        id: string;
                        bot: {
                            botId: string;
                            botCreatedAt: number;
                        };
                        connectorId: string;
                        enabled: boolean;
                        overrides: {
                            args?: string[] | undefined;
                            literalEnv?: Partial<Record<"LANG" | "LC_ALL" | "TZ" | "NODE_ENV", string>> | undefined;
                            literalHeaders?: Partial<Record<"Accept" | "Content-Type", "application/json" | "text/event-stream" | "application/json, text/event-stream">> | undefined;
                        };
                        desiredRevision: number;
                        revision: number;
                        createdAt: number;
                        updatedAt: number;
                        schemaVersion: 1;
                    }[];
                    runtime: {
                        assignmentId: string;
                        sessionId: string;
                        desiredRevision: number;
                        state: "pending" | "unavailable" | "ready" | "disabled" | "connecting";
                        toolCount: number;
                        appliedRevision?: number | undefined;
                        reasonCode?: "revoked" | "saved" | "busy" | "missing-credential" | "initialization-failed" | "namespace-conflict" | "stopping" | "agent-closed" | undefined;
                    }[];
                    policies: {
                        id: string;
                        owner: {
                            botId: string;
                            botCreatedAt: number;
                        };
                        channel: "in-app" | "im";
                        enabled: boolean;
                        timezone: string;
                        dailyLimit: number;
                        cooldownSec: number;
                        authorization: {
                            mode: "ask" | "preapproved";
                        };
                        scopeDigest: string;
                        targetDigest: string;
                        revision: number;
                        createdAt: number;
                        updatedAt: number;
                        schemaVersion: 1;
                        targetRef?: string | undefined;
                        quietHours?: {
                            start: string;
                            end: string;
                        } | undefined;
                        approvedAt?: number | undefined;
                    }[];
                    notifications: {
                        revision: number;
                        createdAt: number;
                        updatedAt: number;
                        schemaVersion: 1;
                        id: string;
                        operationId: string;
                        owner: {
                            botId: string;
                            botCreatedAt: number;
                        };
                        policyId: string;
                        policyRevision: number;
                        targetDigest: string;
                        scopeDigest: string;
                        text: string;
                        source: {
                            kind: "tool" | "schedule" | "manual-run" | "group-turn";
                            id: string;
                            sessionId?: string | undefined;
                        };
                        state: "unknown" | "failed" | "cancelled" | "recorded" | "waiting_approval" | "suppressed" | "sending" | "accepted";
                        flowId?: string | undefined;
                        reasonCode?: "unsupported" | "approval-denied" | "recovery-needed" | "disabled" | "stopping" | "quiet-hours" | "daily-limit" | "cooldown" | "changed" | "transport-failed" | undefined;
                        reservation?: {
                            at: number;
                            day: string;
                        } | undefined;
                        readAt?: number | undefined;
                        attemptId?: string | undefined;
                        platformMessageId?: string | undefined;
                    }[];
                    unread: number;
                    imSupported: boolean;
                    desktopSupported: false;
                    defaults: {
                        dailyLimit: number;
                        cooldownSec: number;
                    };
                };
                decode: (v: unknown) => {
                    definitions: {
                        id: string;
                        label: string;
                        templateId: "custom" | "github" | "filesystem" | "browser" | "notion";
                        templateVersion: 1;
                        serverName: string;
                        transport: "stdio" | "streamable-http";
                        args: string[];
                        literalEnv: Partial<Record<"LANG" | "LC_ALL" | "TZ" | "NODE_ENV", string>>;
                        literalHeaders: Partial<Record<"Accept" | "Content-Type", "application/json" | "text/event-stream" | "application/json, text/event-stream">>;
                        credentialBindings: {
                            destination: "header" | "env";
                            key: string;
                            credentialRef: string;
                            format: "raw" | "bearer" | "basic-token";
                        }[];
                        enabled: boolean;
                        revision: number;
                        createdAt: number;
                        updatedAt: number;
                        schemaVersion: 1;
                        command?: string | undefined;
                        url?: string | undefined;
                    }[];
                    assignments: {
                        id: string;
                        bot: {
                            botId: string;
                            botCreatedAt: number;
                        };
                        connectorId: string;
                        enabled: boolean;
                        overrides: {
                            args?: string[] | undefined;
                            literalEnv?: Partial<Record<"LANG" | "LC_ALL" | "TZ" | "NODE_ENV", string>> | undefined;
                            literalHeaders?: Partial<Record<"Accept" | "Content-Type", "application/json" | "text/event-stream" | "application/json, text/event-stream">> | undefined;
                        };
                        desiredRevision: number;
                        revision: number;
                        createdAt: number;
                        updatedAt: number;
                        schemaVersion: 1;
                    }[];
                    runtime: {
                        assignmentId: string;
                        sessionId: string;
                        desiredRevision: number;
                        state: "pending" | "unavailable" | "ready" | "disabled" | "connecting";
                        toolCount: number;
                        appliedRevision?: number | undefined;
                        reasonCode?: "revoked" | "saved" | "busy" | "missing-credential" | "initialization-failed" | "namespace-conflict" | "stopping" | "agent-closed" | undefined;
                    }[];
                    policies: {
                        id: string;
                        owner: {
                            botId: string;
                            botCreatedAt: number;
                        };
                        channel: "in-app" | "im";
                        enabled: boolean;
                        timezone: string;
                        dailyLimit: number;
                        cooldownSec: number;
                        authorization: {
                            mode: "ask" | "preapproved";
                        };
                        scopeDigest: string;
                        targetDigest: string;
                        revision: number;
                        createdAt: number;
                        updatedAt: number;
                        schemaVersion: 1;
                        targetRef?: string | undefined;
                        quietHours?: {
                            start: string;
                            end: string;
                        } | undefined;
                        approvedAt?: number | undefined;
                    }[];
                    notifications: {
                        revision: number;
                        createdAt: number;
                        updatedAt: number;
                        schemaVersion: 1;
                        id: string;
                        operationId: string;
                        owner: {
                            botId: string;
                            botCreatedAt: number;
                        };
                        policyId: string;
                        policyRevision: number;
                        targetDigest: string;
                        scopeDigest: string;
                        text: string;
                        source: {
                            kind: "tool" | "schedule" | "manual-run" | "group-turn";
                            id: string;
                            sessionId?: string | undefined;
                        };
                        state: "unknown" | "failed" | "cancelled" | "recorded" | "waiting_approval" | "suppressed" | "sending" | "accepted";
                        flowId?: string | undefined;
                        reasonCode?: "unsupported" | "approval-denied" | "recovery-needed" | "disabled" | "stopping" | "quiet-hours" | "daily-limit" | "cooldown" | "changed" | "transport-failed" | undefined;
                        reservation?: {
                            at: number;
                            day: string;
                        } | undefined;
                        readAt?: number | undefined;
                        attemptId?: string | undefined;
                        platformMessageId?: string | undefined;
                    }[];
                    unread: number;
                    imSupported: boolean;
                    desktopSupported: false;
                    defaults: {
                        dailyLimit: number;
                        cooldownSec: number;
                    };
                };
            };
            readonly service: string;
            readonly invocation: {
                kind: "direct";
            };
        };
        readonly 'dshBot.connectors/saveDefinition': {
            readonly parameters: readonly [{
                name: string;
                source: "json";
                codec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodObject<{
                        id: z.ZodString;
                        label: z.ZodString;
                        templateId: z.ZodDefault<z.ZodEnum<{
                            custom: "custom";
                            github: "github";
                            filesystem: "filesystem";
                            browser: "browser";
                            notion: "notion";
                        }>>;
                        templateVersion: z.ZodDefault<z.ZodLiteral<1>>;
                        serverName: z.ZodString;
                        transport: z.ZodEnum<{
                            stdio: "stdio";
                            "streamable-http": "streamable-http";
                        }>;
                        command: z.ZodOptional<z.ZodString>;
                        args: z.ZodDefault<z.ZodArray<z.ZodString>>;
                        url: z.ZodOptional<z.ZodString>;
                        literalEnv: z.ZodDefault<z.ZodRecord<z.ZodEnum<{
                            LANG: "LANG";
                            LC_ALL: "LC_ALL";
                            TZ: "TZ";
                            NODE_ENV: "NODE_ENV";
                        }> & z.core.$partial, z.ZodString>>;
                        literalHeaders: z.ZodDefault<z.ZodRecord<z.ZodEnum<{
                            Accept: "Accept";
                            "Content-Type": "Content-Type";
                        }> & z.core.$partial, z.ZodEnum<{
                            "application/json": "application/json";
                            "text/event-stream": "text/event-stream";
                            "application/json, text/event-stream": "application/json, text/event-stream";
                        }>>>;
                        credentialBindings: z.ZodDefault<z.ZodArray<z.ZodObject<{
                            destination: z.ZodEnum<{
                                header: "header";
                                env: "env";
                            }>;
                            key: z.ZodString;
                            credentialRef: z.ZodString;
                            format: z.ZodEnum<{
                                raw: "raw";
                                bearer: "bearer";
                                "basic-token": "basic-token";
                            }>;
                        }, z.core.$strict>>>;
                        enabled: z.ZodDefault<z.ZodBoolean>;
                    }, z.core.$strict>;
                    encode: (v: unknown) => {
                        id: string;
                        label: string;
                        templateId: "custom" | "github" | "filesystem" | "browser" | "notion";
                        templateVersion: 1;
                        serverName: string;
                        transport: "stdio" | "streamable-http";
                        args: string[];
                        literalEnv: Partial<Record<"LANG" | "LC_ALL" | "TZ" | "NODE_ENV", string>>;
                        literalHeaders: Partial<Record<"Accept" | "Content-Type", "application/json" | "text/event-stream" | "application/json, text/event-stream">>;
                        credentialBindings: {
                            destination: "header" | "env";
                            key: string;
                            credentialRef: string;
                            format: "raw" | "bearer" | "basic-token";
                        }[];
                        enabled: boolean;
                        command?: string | undefined;
                        url?: string | undefined;
                    };
                    decode: (v: unknown) => {
                        id: string;
                        label: string;
                        templateId: "custom" | "github" | "filesystem" | "browser" | "notion";
                        templateVersion: 1;
                        serverName: string;
                        transport: "stdio" | "streamable-http";
                        args: string[];
                        literalEnv: Partial<Record<"LANG" | "LC_ALL" | "TZ" | "NODE_ENV", string>>;
                        literalHeaders: Partial<Record<"Accept" | "Content-Type", "application/json" | "text/event-stream" | "application/json, text/event-stream">>;
                        credentialBindings: {
                            destination: "header" | "env";
                            key: string;
                            credentialRef: string;
                            format: "raw" | "bearer" | "basic-token";
                        }[];
                        enabled: boolean;
                        command?: string | undefined;
                        url?: string | undefined;
                    };
                };
                strictCodec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodObject<{
                        id: z.ZodString;
                        label: z.ZodString;
                        templateId: z.ZodDefault<z.ZodEnum<{
                            custom: "custom";
                            github: "github";
                            filesystem: "filesystem";
                            browser: "browser";
                            notion: "notion";
                        }>>;
                        templateVersion: z.ZodDefault<z.ZodLiteral<1>>;
                        serverName: z.ZodString;
                        transport: z.ZodEnum<{
                            stdio: "stdio";
                            "streamable-http": "streamable-http";
                        }>;
                        command: z.ZodOptional<z.ZodString>;
                        args: z.ZodDefault<z.ZodArray<z.ZodString>>;
                        url: z.ZodOptional<z.ZodString>;
                        literalEnv: z.ZodDefault<z.ZodRecord<z.ZodEnum<{
                            LANG: "LANG";
                            LC_ALL: "LC_ALL";
                            TZ: "TZ";
                            NODE_ENV: "NODE_ENV";
                        }> & z.core.$partial, z.ZodString>>;
                        literalHeaders: z.ZodDefault<z.ZodRecord<z.ZodEnum<{
                            Accept: "Accept";
                            "Content-Type": "Content-Type";
                        }> & z.core.$partial, z.ZodEnum<{
                            "application/json": "application/json";
                            "text/event-stream": "text/event-stream";
                            "application/json, text/event-stream": "application/json, text/event-stream";
                        }>>>;
                        credentialBindings: z.ZodDefault<z.ZodArray<z.ZodObject<{
                            destination: z.ZodEnum<{
                                header: "header";
                                env: "env";
                            }>;
                            key: z.ZodString;
                            credentialRef: z.ZodString;
                            format: z.ZodEnum<{
                                raw: "raw";
                                bearer: "bearer";
                                "basic-token": "basic-token";
                            }>;
                        }, z.core.$strict>>>;
                        enabled: z.ZodDefault<z.ZodBoolean>;
                    }, z.core.$strict>;
                    encode: (v: unknown) => {
                        id: string;
                        label: string;
                        templateId: "custom" | "github" | "filesystem" | "browser" | "notion";
                        templateVersion: 1;
                        serverName: string;
                        transport: "stdio" | "streamable-http";
                        args: string[];
                        literalEnv: Partial<Record<"LANG" | "LC_ALL" | "TZ" | "NODE_ENV", string>>;
                        literalHeaders: Partial<Record<"Accept" | "Content-Type", "application/json" | "text/event-stream" | "application/json, text/event-stream">>;
                        credentialBindings: {
                            destination: "header" | "env";
                            key: string;
                            credentialRef: string;
                            format: "raw" | "bearer" | "basic-token";
                        }[];
                        enabled: boolean;
                        command?: string | undefined;
                        url?: string | undefined;
                    };
                    decode: (v: unknown) => {
                        id: string;
                        label: string;
                        templateId: "custom" | "github" | "filesystem" | "browser" | "notion";
                        templateVersion: 1;
                        serverName: string;
                        transport: "stdio" | "streamable-http";
                        args: string[];
                        literalEnv: Partial<Record<"LANG" | "LC_ALL" | "TZ" | "NODE_ENV", string>>;
                        literalHeaders: Partial<Record<"Accept" | "Content-Type", "application/json" | "text/event-stream" | "application/json, text/event-stream">>;
                        credentialBindings: {
                            destination: "header" | "env";
                            key: string;
                            credentialRef: string;
                            format: "raw" | "bearer" | "basic-token";
                        }[];
                        enabled: boolean;
                        command?: string | undefined;
                        url?: string | undefined;
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
                    label: z.ZodString;
                    templateId: z.ZodDefault<z.ZodEnum<{
                        custom: "custom";
                        github: "github";
                        filesystem: "filesystem";
                        browser: "browser";
                        notion: "notion";
                    }>>;
                    templateVersion: z.ZodDefault<z.ZodLiteral<1>>;
                    serverName: z.ZodString;
                    transport: z.ZodEnum<{
                        stdio: "stdio";
                        "streamable-http": "streamable-http";
                    }>;
                    command: z.ZodOptional<z.ZodString>;
                    args: z.ZodDefault<z.ZodArray<z.ZodString>>;
                    url: z.ZodOptional<z.ZodString>;
                    literalEnv: z.ZodDefault<z.ZodRecord<z.ZodEnum<{
                        LANG: "LANG";
                        LC_ALL: "LC_ALL";
                        TZ: "TZ";
                        NODE_ENV: "NODE_ENV";
                    }> & z.core.$partial, z.ZodString>>;
                    literalHeaders: z.ZodDefault<z.ZodRecord<z.ZodEnum<{
                        Accept: "Accept";
                        "Content-Type": "Content-Type";
                    }> & z.core.$partial, z.ZodEnum<{
                        "application/json": "application/json";
                        "text/event-stream": "text/event-stream";
                        "application/json, text/event-stream": "application/json, text/event-stream";
                    }>>>;
                    credentialBindings: z.ZodDefault<z.ZodArray<z.ZodObject<{
                        destination: z.ZodEnum<{
                            header: "header";
                            env: "env";
                        }>;
                        key: z.ZodString;
                        credentialRef: z.ZodString;
                        format: z.ZodEnum<{
                            raw: "raw";
                            bearer: "bearer";
                            "basic-token": "basic-token";
                        }>;
                    }, z.core.$strict>>>;
                    enabled: z.ZodDefault<z.ZodBoolean>;
                    revision: z.ZodNumber;
                    createdAt: z.ZodNumber;
                    updatedAt: z.ZodNumber;
                    schemaVersion: z.ZodLiteral<1>;
                }, z.core.$strict>;
                encode: (v: unknown) => {
                    id: string;
                    label: string;
                    templateId: "custom" | "github" | "filesystem" | "browser" | "notion";
                    templateVersion: 1;
                    serverName: string;
                    transport: "stdio" | "streamable-http";
                    args: string[];
                    literalEnv: Partial<Record<"LANG" | "LC_ALL" | "TZ" | "NODE_ENV", string>>;
                    literalHeaders: Partial<Record<"Accept" | "Content-Type", "application/json" | "text/event-stream" | "application/json, text/event-stream">>;
                    credentialBindings: {
                        destination: "header" | "env";
                        key: string;
                        credentialRef: string;
                        format: "raw" | "bearer" | "basic-token";
                    }[];
                    enabled: boolean;
                    revision: number;
                    createdAt: number;
                    updatedAt: number;
                    schemaVersion: 1;
                    command?: string | undefined;
                    url?: string | undefined;
                };
                decode: (v: unknown) => {
                    id: string;
                    label: string;
                    templateId: "custom" | "github" | "filesystem" | "browser" | "notion";
                    templateVersion: 1;
                    serverName: string;
                    transport: "stdio" | "streamable-http";
                    args: string[];
                    literalEnv: Partial<Record<"LANG" | "LC_ALL" | "TZ" | "NODE_ENV", string>>;
                    literalHeaders: Partial<Record<"Accept" | "Content-Type", "application/json" | "text/event-stream" | "application/json, text/event-stream">>;
                    credentialBindings: {
                        destination: "header" | "env";
                        key: string;
                        credentialRef: string;
                        format: "raw" | "bearer" | "basic-token";
                    }[];
                    enabled: boolean;
                    revision: number;
                    createdAt: number;
                    updatedAt: number;
                    schemaVersion: 1;
                    command?: string | undefined;
                    url?: string | undefined;
                };
            };
            readonly service: string;
            readonly invocation: {
                kind: "direct";
            };
        };
        readonly 'dshBot.connectors/saveAssignment': {
            readonly parameters: readonly [{
                name: string;
                source: "json";
                codec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodObject<{
                        id: z.ZodString;
                        bot: z.ZodObject<{
                            botId: z.ZodString;
                            botCreatedAt: z.ZodNumber;
                        }, z.core.$strict>;
                        connectorId: z.ZodString;
                        enabled: z.ZodBoolean;
                        overrides: z.ZodDefault<z.ZodObject<{
                            args: z.ZodOptional<z.ZodArray<z.ZodString>>;
                            literalEnv: z.ZodOptional<z.ZodDefault<z.ZodRecord<z.ZodEnum<{
                                LANG: "LANG";
                                LC_ALL: "LC_ALL";
                                TZ: "TZ";
                                NODE_ENV: "NODE_ENV";
                            }> & z.core.$partial, z.ZodString>>>;
                            literalHeaders: z.ZodOptional<z.ZodDefault<z.ZodRecord<z.ZodEnum<{
                                Accept: "Accept";
                                "Content-Type": "Content-Type";
                            }> & z.core.$partial, z.ZodEnum<{
                                "application/json": "application/json";
                                "text/event-stream": "text/event-stream";
                                "application/json, text/event-stream": "application/json, text/event-stream";
                            }>>>>;
                        }, z.core.$strict>>;
                    }, z.core.$strict>;
                    encode: (v: unknown) => {
                        id: string;
                        bot: {
                            botId: string;
                            botCreatedAt: number;
                        };
                        connectorId: string;
                        enabled: boolean;
                        overrides: {
                            args?: string[] | undefined;
                            literalEnv?: Partial<Record<"LANG" | "LC_ALL" | "TZ" | "NODE_ENV", string>> | undefined;
                            literalHeaders?: Partial<Record<"Accept" | "Content-Type", "application/json" | "text/event-stream" | "application/json, text/event-stream">> | undefined;
                        };
                    };
                    decode: (v: unknown) => {
                        id: string;
                        bot: {
                            botId: string;
                            botCreatedAt: number;
                        };
                        connectorId: string;
                        enabled: boolean;
                        overrides: {
                            args?: string[] | undefined;
                            literalEnv?: Partial<Record<"LANG" | "LC_ALL" | "TZ" | "NODE_ENV", string>> | undefined;
                            literalHeaders?: Partial<Record<"Accept" | "Content-Type", "application/json" | "text/event-stream" | "application/json, text/event-stream">> | undefined;
                        };
                    };
                };
                strictCodec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodObject<{
                        id: z.ZodString;
                        bot: z.ZodObject<{
                            botId: z.ZodString;
                            botCreatedAt: z.ZodNumber;
                        }, z.core.$strict>;
                        connectorId: z.ZodString;
                        enabled: z.ZodBoolean;
                        overrides: z.ZodDefault<z.ZodObject<{
                            args: z.ZodOptional<z.ZodArray<z.ZodString>>;
                            literalEnv: z.ZodOptional<z.ZodDefault<z.ZodRecord<z.ZodEnum<{
                                LANG: "LANG";
                                LC_ALL: "LC_ALL";
                                TZ: "TZ";
                                NODE_ENV: "NODE_ENV";
                            }> & z.core.$partial, z.ZodString>>>;
                            literalHeaders: z.ZodOptional<z.ZodDefault<z.ZodRecord<z.ZodEnum<{
                                Accept: "Accept";
                                "Content-Type": "Content-Type";
                            }> & z.core.$partial, z.ZodEnum<{
                                "application/json": "application/json";
                                "text/event-stream": "text/event-stream";
                                "application/json, text/event-stream": "application/json, text/event-stream";
                            }>>>>;
                        }, z.core.$strict>>;
                    }, z.core.$strict>;
                    encode: (v: unknown) => {
                        id: string;
                        bot: {
                            botId: string;
                            botCreatedAt: number;
                        };
                        connectorId: string;
                        enabled: boolean;
                        overrides: {
                            args?: string[] | undefined;
                            literalEnv?: Partial<Record<"LANG" | "LC_ALL" | "TZ" | "NODE_ENV", string>> | undefined;
                            literalHeaders?: Partial<Record<"Accept" | "Content-Type", "application/json" | "text/event-stream" | "application/json, text/event-stream">> | undefined;
                        };
                    };
                    decode: (v: unknown) => {
                        id: string;
                        bot: {
                            botId: string;
                            botCreatedAt: number;
                        };
                        connectorId: string;
                        enabled: boolean;
                        overrides: {
                            args?: string[] | undefined;
                            literalEnv?: Partial<Record<"LANG" | "LC_ALL" | "TZ" | "NODE_ENV", string>> | undefined;
                            literalHeaders?: Partial<Record<"Accept" | "Content-Type", "application/json" | "text/event-stream" | "application/json, text/event-stream">> | undefined;
                        };
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
                    connectorId: z.ZodString;
                    enabled: z.ZodBoolean;
                    overrides: z.ZodDefault<z.ZodObject<{
                        args: z.ZodOptional<z.ZodArray<z.ZodString>>;
                        literalEnv: z.ZodOptional<z.ZodDefault<z.ZodRecord<z.ZodEnum<{
                            LANG: "LANG";
                            LC_ALL: "LC_ALL";
                            TZ: "TZ";
                            NODE_ENV: "NODE_ENV";
                        }> & z.core.$partial, z.ZodString>>>;
                        literalHeaders: z.ZodOptional<z.ZodDefault<z.ZodRecord<z.ZodEnum<{
                            Accept: "Accept";
                            "Content-Type": "Content-Type";
                        }> & z.core.$partial, z.ZodEnum<{
                            "application/json": "application/json";
                            "text/event-stream": "text/event-stream";
                            "application/json, text/event-stream": "application/json, text/event-stream";
                        }>>>>;
                    }, z.core.$strict>>;
                    desiredRevision: z.ZodNumber;
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
                    connectorId: string;
                    enabled: boolean;
                    overrides: {
                        args?: string[] | undefined;
                        literalEnv?: Partial<Record<"LANG" | "LC_ALL" | "TZ" | "NODE_ENV", string>> | undefined;
                        literalHeaders?: Partial<Record<"Accept" | "Content-Type", "application/json" | "text/event-stream" | "application/json, text/event-stream">> | undefined;
                    };
                    desiredRevision: number;
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
                    connectorId: string;
                    enabled: boolean;
                    overrides: {
                        args?: string[] | undefined;
                        literalEnv?: Partial<Record<"LANG" | "LC_ALL" | "TZ" | "NODE_ENV", string>> | undefined;
                        literalHeaders?: Partial<Record<"Accept" | "Content-Type", "application/json" | "text/event-stream" | "application/json, text/event-stream">> | undefined;
                    };
                    desiredRevision: number;
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
        readonly 'dshBot.connectors/applyIdle': {
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
                create: () => z.ZodArray<z.ZodObject<{
                    assignmentId: z.ZodString;
                    sessionId: z.ZodString;
                    desiredRevision: z.ZodNumber;
                    appliedRevision: z.ZodOptional<z.ZodNumber>;
                    state: z.ZodEnum<{
                        pending: "pending";
                        unavailable: "unavailable";
                        ready: "ready";
                        disabled: "disabled";
                        connecting: "connecting";
                    }>;
                    reasonCode: z.ZodOptional<z.ZodEnum<{
                        revoked: "revoked";
                        saved: "saved";
                        busy: "busy";
                        "missing-credential": "missing-credential";
                        "initialization-failed": "initialization-failed";
                        "namespace-conflict": "namespace-conflict";
                        stopping: "stopping";
                        "agent-closed": "agent-closed";
                    }>>;
                    toolCount: z.ZodNumber;
                }, z.core.$strict>>;
                encode: (v: unknown) => {
                    assignmentId: string;
                    sessionId: string;
                    desiredRevision: number;
                    state: "pending" | "unavailable" | "ready" | "disabled" | "connecting";
                    toolCount: number;
                    appliedRevision?: number | undefined;
                    reasonCode?: "revoked" | "saved" | "busy" | "missing-credential" | "initialization-failed" | "namespace-conflict" | "stopping" | "agent-closed" | undefined;
                }[];
                decode: (v: unknown) => {
                    assignmentId: string;
                    sessionId: string;
                    desiredRevision: number;
                    state: "pending" | "unavailable" | "ready" | "disabled" | "connecting";
                    toolCount: number;
                    appliedRevision?: number | undefined;
                    reasonCode?: "revoked" | "saved" | "busy" | "missing-credential" | "initialization-failed" | "namespace-conflict" | "stopping" | "agent-closed" | undefined;
                }[];
            };
            readonly service: string;
            readonly invocation: {
                kind: "direct";
            };
        };
        readonly 'dshBot.connectors/importLegacy': {
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
                    revision: z.ZodNumber;
                    createdAt: z.ZodNumber;
                    updatedAt: z.ZodNumber;
                    schemaVersion: z.ZodLiteral<1>;
                    id: z.ZodString;
                    bot: z.ZodObject<{
                        botId: z.ZodString;
                        botCreatedAt: z.ZodNumber;
                    }, z.core.$strict>;
                    digest: z.ZodString;
                    assignmentIds: z.ZodArray<z.ZodString>;
                }, z.core.$strict>;
                encode: (v: unknown) => {
                    revision: number;
                    createdAt: number;
                    updatedAt: number;
                    schemaVersion: 1;
                    id: string;
                    bot: {
                        botId: string;
                        botCreatedAt: number;
                    };
                    digest: string;
                    assignmentIds: string[];
                };
                decode: (v: unknown) => {
                    revision: number;
                    createdAt: number;
                    updatedAt: number;
                    schemaVersion: 1;
                    id: string;
                    bot: {
                        botId: string;
                        botCreatedAt: number;
                    };
                    digest: string;
                    assignmentIds: string[];
                };
            };
            readonly service: string;
            readonly invocation: {
                kind: "direct";
            };
        };
        readonly 'dshBot.notifications/savePolicy': {
            readonly service: "dshBotNotificationRemote";
            readonly parameters: readonly [{
                name: string;
                source: "json";
                codec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodObject<{
                        id: z.ZodString;
                        owner: z.ZodObject<{
                            botId: z.ZodString;
                            botCreatedAt: z.ZodNumber;
                        }, z.core.$strict>;
                        channel: z.ZodEnum<{
                            "in-app": "in-app";
                            im: "im";
                        }>;
                        targetRef: z.ZodOptional<z.ZodString>;
                        enabled: z.ZodBoolean;
                        timezone: z.ZodString;
                        quietHours: z.ZodOptional<z.ZodObject<{
                            start: z.ZodString;
                            end: z.ZodString;
                        }, z.core.$strict>>;
                        dailyLimit: z.ZodNumber;
                        cooldownSec: z.ZodNumber;
                        authorization: z.ZodObject<{
                            mode: z.ZodEnum<{
                                ask: "ask";
                                preapproved: "preapproved";
                            }>;
                        }, z.core.$strict>;
                    }, z.core.$strict>;
                    encode: (v: unknown) => {
                        id: string;
                        owner: {
                            botId: string;
                            botCreatedAt: number;
                        };
                        channel: "in-app" | "im";
                        enabled: boolean;
                        timezone: string;
                        dailyLimit: number;
                        cooldownSec: number;
                        authorization: {
                            mode: "ask" | "preapproved";
                        };
                        targetRef?: string | undefined;
                        quietHours?: {
                            start: string;
                            end: string;
                        } | undefined;
                    };
                    decode: (v: unknown) => {
                        id: string;
                        owner: {
                            botId: string;
                            botCreatedAt: number;
                        };
                        channel: "in-app" | "im";
                        enabled: boolean;
                        timezone: string;
                        dailyLimit: number;
                        cooldownSec: number;
                        authorization: {
                            mode: "ask" | "preapproved";
                        };
                        targetRef?: string | undefined;
                        quietHours?: {
                            start: string;
                            end: string;
                        } | undefined;
                    };
                };
                strictCodec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodObject<{
                        id: z.ZodString;
                        owner: z.ZodObject<{
                            botId: z.ZodString;
                            botCreatedAt: z.ZodNumber;
                        }, z.core.$strict>;
                        channel: z.ZodEnum<{
                            "in-app": "in-app";
                            im: "im";
                        }>;
                        targetRef: z.ZodOptional<z.ZodString>;
                        enabled: z.ZodBoolean;
                        timezone: z.ZodString;
                        quietHours: z.ZodOptional<z.ZodObject<{
                            start: z.ZodString;
                            end: z.ZodString;
                        }, z.core.$strict>>;
                        dailyLimit: z.ZodNumber;
                        cooldownSec: z.ZodNumber;
                        authorization: z.ZodObject<{
                            mode: z.ZodEnum<{
                                ask: "ask";
                                preapproved: "preapproved";
                            }>;
                        }, z.core.$strict>;
                    }, z.core.$strict>;
                    encode: (v: unknown) => {
                        id: string;
                        owner: {
                            botId: string;
                            botCreatedAt: number;
                        };
                        channel: "in-app" | "im";
                        enabled: boolean;
                        timezone: string;
                        dailyLimit: number;
                        cooldownSec: number;
                        authorization: {
                            mode: "ask" | "preapproved";
                        };
                        targetRef?: string | undefined;
                        quietHours?: {
                            start: string;
                            end: string;
                        } | undefined;
                    };
                    decode: (v: unknown) => {
                        id: string;
                        owner: {
                            botId: string;
                            botCreatedAt: number;
                        };
                        channel: "in-app" | "im";
                        enabled: boolean;
                        timezone: string;
                        dailyLimit: number;
                        cooldownSec: number;
                        authorization: {
                            mode: "ask" | "preapproved";
                        };
                        targetRef?: string | undefined;
                        quietHours?: {
                            start: string;
                            end: string;
                        } | undefined;
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
                    create: () => z.ZodBoolean;
                    encode: (v: unknown) => boolean;
                    decode: (v: unknown) => boolean;
                };
                strictCodec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodBoolean;
                    encode: (v: unknown) => boolean;
                    decode: (v: unknown) => boolean;
                };
            }];
            readonly result: {
                mode: "strict";
                typeSymbol: string;
                create: () => z.ZodObject<{
                    id: z.ZodString;
                    owner: z.ZodObject<{
                        botId: z.ZodString;
                        botCreatedAt: z.ZodNumber;
                    }, z.core.$strict>;
                    channel: z.ZodEnum<{
                        "in-app": "in-app";
                        im: "im";
                    }>;
                    targetRef: z.ZodOptional<z.ZodString>;
                    enabled: z.ZodBoolean;
                    timezone: z.ZodString;
                    quietHours: z.ZodOptional<z.ZodObject<{
                        start: z.ZodString;
                        end: z.ZodString;
                    }, z.core.$strict>>;
                    dailyLimit: z.ZodNumber;
                    cooldownSec: z.ZodNumber;
                    authorization: z.ZodObject<{
                        mode: z.ZodEnum<{
                            ask: "ask";
                            preapproved: "preapproved";
                        }>;
                    }, z.core.$strict>;
                    scopeDigest: z.ZodString;
                    targetDigest: z.ZodString;
                    approvedAt: z.ZodOptional<z.ZodNumber>;
                    revision: z.ZodNumber;
                    createdAt: z.ZodNumber;
                    updatedAt: z.ZodNumber;
                    schemaVersion: z.ZodLiteral<1>;
                }, z.core.$strict>;
                encode: (v: unknown) => {
                    id: string;
                    owner: {
                        botId: string;
                        botCreatedAt: number;
                    };
                    channel: "in-app" | "im";
                    enabled: boolean;
                    timezone: string;
                    dailyLimit: number;
                    cooldownSec: number;
                    authorization: {
                        mode: "ask" | "preapproved";
                    };
                    scopeDigest: string;
                    targetDigest: string;
                    revision: number;
                    createdAt: number;
                    updatedAt: number;
                    schemaVersion: 1;
                    targetRef?: string | undefined;
                    quietHours?: {
                        start: string;
                        end: string;
                    } | undefined;
                    approvedAt?: number | undefined;
                };
                decode: (v: unknown) => {
                    id: string;
                    owner: {
                        botId: string;
                        botCreatedAt: number;
                    };
                    channel: "in-app" | "im";
                    enabled: boolean;
                    timezone: string;
                    dailyLimit: number;
                    cooldownSec: number;
                    authorization: {
                        mode: "ask" | "preapproved";
                    };
                    scopeDigest: string;
                    targetDigest: string;
                    revision: number;
                    createdAt: number;
                    updatedAt: number;
                    schemaVersion: 1;
                    targetRef?: string | undefined;
                    quietHours?: {
                        start: string;
                        end: string;
                    } | undefined;
                    approvedAt?: number | undefined;
                };
            };
            readonly invocation: {
                kind: "direct";
            };
        };
        readonly 'dshBot.notifications/markRead': {
            readonly service: "dshBotNotificationRemote";
            readonly parameters: readonly [{
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
                    revision: z.ZodNumber;
                    createdAt: z.ZodNumber;
                    updatedAt: z.ZodNumber;
                    schemaVersion: z.ZodLiteral<1>;
                    id: z.ZodString;
                    operationId: z.ZodString;
                    flowId: z.ZodOptional<z.ZodUUID>;
                    owner: z.ZodObject<{
                        botId: z.ZodString;
                        botCreatedAt: z.ZodNumber;
                    }, z.core.$strict>;
                    policyId: z.ZodString;
                    policyRevision: z.ZodNumber;
                    targetDigest: z.ZodString;
                    scopeDigest: z.ZodString;
                    text: z.ZodString;
                    source: z.ZodObject<{
                        kind: z.ZodEnum<{
                            tool: "tool";
                            schedule: "schedule";
                            "manual-run": "manual-run";
                            "group-turn": "group-turn";
                        }>;
                        id: z.ZodString;
                        sessionId: z.ZodOptional<z.ZodString>;
                    }, z.core.$strict>;
                    state: z.ZodEnum<{
                        unknown: "unknown";
                        failed: "failed";
                        cancelled: "cancelled";
                        recorded: "recorded";
                        waiting_approval: "waiting_approval";
                        suppressed: "suppressed";
                        sending: "sending";
                        accepted: "accepted";
                    }>;
                    reasonCode: z.ZodOptional<z.ZodEnum<{
                        unsupported: "unsupported";
                        "approval-denied": "approval-denied";
                        "recovery-needed": "recovery-needed";
                        disabled: "disabled";
                        stopping: "stopping";
                        "quiet-hours": "quiet-hours";
                        "daily-limit": "daily-limit";
                        cooldown: "cooldown";
                        changed: "changed";
                        "transport-failed": "transport-failed";
                    }>>;
                    reservation: z.ZodOptional<z.ZodObject<{
                        at: z.ZodNumber;
                        day: z.ZodString;
                    }, z.core.$strict>>;
                    readAt: z.ZodOptional<z.ZodNumber>;
                    attemptId: z.ZodOptional<z.ZodString>;
                    platformMessageId: z.ZodOptional<z.ZodString>;
                }, z.core.$strict>;
                encode: (v: unknown) => {
                    revision: number;
                    createdAt: number;
                    updatedAt: number;
                    schemaVersion: 1;
                    id: string;
                    operationId: string;
                    owner: {
                        botId: string;
                        botCreatedAt: number;
                    };
                    policyId: string;
                    policyRevision: number;
                    targetDigest: string;
                    scopeDigest: string;
                    text: string;
                    source: {
                        kind: "tool" | "schedule" | "manual-run" | "group-turn";
                        id: string;
                        sessionId?: string | undefined;
                    };
                    state: "unknown" | "failed" | "cancelled" | "recorded" | "waiting_approval" | "suppressed" | "sending" | "accepted";
                    flowId?: string | undefined;
                    reasonCode?: "unsupported" | "approval-denied" | "recovery-needed" | "disabled" | "stopping" | "quiet-hours" | "daily-limit" | "cooldown" | "changed" | "transport-failed" | undefined;
                    reservation?: {
                        at: number;
                        day: string;
                    } | undefined;
                    readAt?: number | undefined;
                    attemptId?: string | undefined;
                    platformMessageId?: string | undefined;
                };
                decode: (v: unknown) => {
                    revision: number;
                    createdAt: number;
                    updatedAt: number;
                    schemaVersion: 1;
                    id: string;
                    operationId: string;
                    owner: {
                        botId: string;
                        botCreatedAt: number;
                    };
                    policyId: string;
                    policyRevision: number;
                    targetDigest: string;
                    scopeDigest: string;
                    text: string;
                    source: {
                        kind: "tool" | "schedule" | "manual-run" | "group-turn";
                        id: string;
                        sessionId?: string | undefined;
                    };
                    state: "unknown" | "failed" | "cancelled" | "recorded" | "waiting_approval" | "suppressed" | "sending" | "accepted";
                    flowId?: string | undefined;
                    reasonCode?: "unsupported" | "approval-denied" | "recovery-needed" | "disabled" | "stopping" | "quiet-hours" | "daily-limit" | "cooldown" | "changed" | "transport-failed" | undefined;
                    reservation?: {
                        at: number;
                        day: string;
                    } | undefined;
                    readAt?: number | undefined;
                    attemptId?: string | undefined;
                    platformMessageId?: string | undefined;
                };
            };
            readonly invocation: {
                kind: "direct";
            };
        };
        readonly 'dshBot.notifications/test': {
            readonly service: "dshBotNotificationRemote";
            readonly implementation: "testNotification";
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
                        operationId: z.ZodString;
                        policyId: z.ZodString;
                        text: z.ZodString;
                        relatedId: z.ZodOptional<z.ZodString>;
                    }, z.core.$strict>;
                    encode: (v: unknown) => {
                        operationId: string;
                        policyId: string;
                        text: string;
                        relatedId?: string | undefined;
                    };
                    decode: (v: unknown) => {
                        operationId: string;
                        policyId: string;
                        text: string;
                        relatedId?: string | undefined;
                    };
                };
                strictCodec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodObject<{
                        operationId: z.ZodString;
                        policyId: z.ZodString;
                        text: z.ZodString;
                        relatedId: z.ZodOptional<z.ZodString>;
                    }, z.core.$strict>;
                    encode: (v: unknown) => {
                        operationId: string;
                        policyId: string;
                        text: string;
                        relatedId?: string | undefined;
                    };
                    decode: (v: unknown) => {
                        operationId: string;
                        policyId: string;
                        text: string;
                        relatedId?: string | undefined;
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
                    create: () => z.ZodLiteral<true>;
                    encode: (v: unknown) => true;
                    decode: (v: unknown) => true;
                };
                strictCodec: {
                    mode: "strict";
                    typeSymbol: string;
                    create: () => z.ZodLiteral<true>;
                    encode: (v: unknown) => true;
                    decode: (v: unknown) => true;
                };
            }];
            readonly result: {
                mode: "strict";
                typeSymbol: string;
                create: () => z.ZodObject<{
                    revision: z.ZodNumber;
                    createdAt: z.ZodNumber;
                    updatedAt: z.ZodNumber;
                    schemaVersion: z.ZodLiteral<1>;
                    id: z.ZodString;
                    operationId: z.ZodString;
                    flowId: z.ZodOptional<z.ZodUUID>;
                    owner: z.ZodObject<{
                        botId: z.ZodString;
                        botCreatedAt: z.ZodNumber;
                    }, z.core.$strict>;
                    policyId: z.ZodString;
                    policyRevision: z.ZodNumber;
                    targetDigest: z.ZodString;
                    scopeDigest: z.ZodString;
                    text: z.ZodString;
                    source: z.ZodObject<{
                        kind: z.ZodEnum<{
                            tool: "tool";
                            schedule: "schedule";
                            "manual-run": "manual-run";
                            "group-turn": "group-turn";
                        }>;
                        id: z.ZodString;
                        sessionId: z.ZodOptional<z.ZodString>;
                    }, z.core.$strict>;
                    state: z.ZodEnum<{
                        unknown: "unknown";
                        failed: "failed";
                        cancelled: "cancelled";
                        recorded: "recorded";
                        waiting_approval: "waiting_approval";
                        suppressed: "suppressed";
                        sending: "sending";
                        accepted: "accepted";
                    }>;
                    reasonCode: z.ZodOptional<z.ZodEnum<{
                        unsupported: "unsupported";
                        "approval-denied": "approval-denied";
                        "recovery-needed": "recovery-needed";
                        disabled: "disabled";
                        stopping: "stopping";
                        "quiet-hours": "quiet-hours";
                        "daily-limit": "daily-limit";
                        cooldown: "cooldown";
                        changed: "changed";
                        "transport-failed": "transport-failed";
                    }>>;
                    reservation: z.ZodOptional<z.ZodObject<{
                        at: z.ZodNumber;
                        day: z.ZodString;
                    }, z.core.$strict>>;
                    readAt: z.ZodOptional<z.ZodNumber>;
                    attemptId: z.ZodOptional<z.ZodString>;
                    platformMessageId: z.ZodOptional<z.ZodString>;
                }, z.core.$strict>;
                encode: (v: unknown) => {
                    revision: number;
                    createdAt: number;
                    updatedAt: number;
                    schemaVersion: 1;
                    id: string;
                    operationId: string;
                    owner: {
                        botId: string;
                        botCreatedAt: number;
                    };
                    policyId: string;
                    policyRevision: number;
                    targetDigest: string;
                    scopeDigest: string;
                    text: string;
                    source: {
                        kind: "tool" | "schedule" | "manual-run" | "group-turn";
                        id: string;
                        sessionId?: string | undefined;
                    };
                    state: "unknown" | "failed" | "cancelled" | "recorded" | "waiting_approval" | "suppressed" | "sending" | "accepted";
                    flowId?: string | undefined;
                    reasonCode?: "unsupported" | "approval-denied" | "recovery-needed" | "disabled" | "stopping" | "quiet-hours" | "daily-limit" | "cooldown" | "changed" | "transport-failed" | undefined;
                    reservation?: {
                        at: number;
                        day: string;
                    } | undefined;
                    readAt?: number | undefined;
                    attemptId?: string | undefined;
                    platformMessageId?: string | undefined;
                };
                decode: (v: unknown) => {
                    revision: number;
                    createdAt: number;
                    updatedAt: number;
                    schemaVersion: 1;
                    id: string;
                    operationId: string;
                    owner: {
                        botId: string;
                        botCreatedAt: number;
                    };
                    policyId: string;
                    policyRevision: number;
                    targetDigest: string;
                    scopeDigest: string;
                    text: string;
                    source: {
                        kind: "tool" | "schedule" | "manual-run" | "group-turn";
                        id: string;
                        sessionId?: string | undefined;
                    };
                    state: "unknown" | "failed" | "cancelled" | "recorded" | "waiting_approval" | "suppressed" | "sending" | "accepted";
                    flowId?: string | undefined;
                    reasonCode?: "unsupported" | "approval-denied" | "recovery-needed" | "disabled" | "stopping" | "quiet-hours" | "daily-limit" | "cooldown" | "changed" | "transport-failed" | undefined;
                    reservation?: {
                        at: number;
                        day: string;
                    } | undefined;
                    readAt?: number | undefined;
                    attemptId?: string | undefined;
                    platformMessageId?: string | undefined;
                };
            };
            readonly invocation: {
                kind: "direct";
            };
        };
    };
};
type Methods = typeof integrationsSpec.methods;
type Args<P extends readonly unknown[]> = {
    -readonly [K in keyof P]: P[K] extends {
        codec: {
            create: () => infer S extends z.ZodType;
        };
    } ? z.input<S> : never;
};
type Result<K extends keyof Methods> = z.output<ReturnType<Methods[K]['result']['create']>>;
export type IntegrationMethods<N extends string> = {
    [K in keyof Methods as K extends `${N}/${infer M}` ? M : never]: (...args: Args<Methods[K]['parameters']>) => Promise<RemoteResult<Result<K>>>;
};
type Endpoints = {
    [K in keyof Methods]: (...args: Args<Methods[K]['parameters']>) => Promise<RemoteResult<Result<K>>>;
};
declare module '@deepseek-ai/dsh-typert-protocol' {
    interface TypertRemoteMap extends Endpoints {
    }
    interface TypertRemoteNamespaceMap {
        'dshBot.connectors': IntegrationMethods<'dshBot.connectors'>;
        'dshBot.notifications': IntegrationMethods<'dshBot.notifications'>;
    }
}
export declare const INTEGRATIONS_REMOTE: import("@deepseek-ai/dsh-typert-protocol").TypertRemoteInfo<Readonly<Record<string, import("@deepseek-ai/dsh-typert-protocol").TypertRemoteMethod<object, unknown, "unary", never, unknown> | import("@deepseek-ai/dsh-typert-protocol").TypertRemoteMethod<object, unknown, "stream", unknown, unknown>>>>;
export {};
