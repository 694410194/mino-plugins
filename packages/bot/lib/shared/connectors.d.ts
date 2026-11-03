import { z } from 'zod';
export declare const connectorInputSchema: z.ZodObject<{
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
export declare const connectorSchema: z.ZodObject<{
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
export type Connector = z.output<typeof connectorSchema>;
export declare const connectorOverridesSchema: z.ZodObject<{
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
}, z.core.$strict>;
export declare const assignmentInputSchema: z.ZodObject<{
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
export declare const assignmentSchema: z.ZodObject<{
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
export type Assignment = z.output<typeof assignmentSchema>;
export declare const connectorRuntimeSchema: z.ZodObject<{
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
}, z.core.$strict>;
export type ConnectorRuntime = z.output<typeof connectorRuntimeSchema>;
export declare const legacyImportSchema: z.ZodObject<{
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
export declare const CONNECTOR_TEMPLATES: readonly ["github", "filesystem", "browser", "notion"];
