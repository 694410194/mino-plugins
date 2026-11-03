export * from './identity.js';
export * from './connectors.js';
export * from './notifications.js';
import { z } from 'zod';
export declare const integrationCatalogSchema: z.ZodObject<{
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
export type IntegrationCatalog = z.output<typeof integrationCatalogSchema>;
