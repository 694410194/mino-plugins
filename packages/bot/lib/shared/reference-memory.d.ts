import { z } from 'zod';
export declare const REFERENCE_VERSION = "2026.7.4";
export declare const REFERENCE_SOURCE = "6dd0a683e198783e30feabf7abaf42f925bd18b1";
export declare const GRAPH_NAMESPACE = "bot_memory_graph";
export declare const GRAPH_PREFIX = "mcp__bot_memory_graph__";
export declare const graphEntitySchema: z.ZodObject<{
    name: z.ZodString;
    entityType: z.ZodString;
    observations: z.ZodArray<z.ZodString>;
}, z.core.$strict>;
export declare const graphSchema: z.ZodObject<{
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
}, z.core.$strict>;
export declare const graphToolSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
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
export declare const memoryEnvelopeSchema: z.ZodObject<{
    format: z.ZodLiteral<"dsh-bot-memory-record">;
    version: z.ZodLiteral<1>;
    bot: z.ZodObject<{
        botId: z.ZodString;
        botCreatedAt: z.ZodNumber;
    }, z.core.$strict>;
    record: z.ZodPipe<z.ZodObject<{
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
    recordDigest: z.ZodString;
}, z.core.$strict>;
export declare const graphBindingSchema: z.ZodObject<{
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
}, z.core.$strict>;
export type GraphBinding = z.output<typeof graphBindingSchema>;
export declare const copyReceiptSchema: z.ZodObject<{
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
}, z.core.$strict>;
export type CopyReceipt = z.output<typeof copyReceiptSchema>;
export declare const graphStatusSchema: z.ZodObject<{
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
export type GraphStatus = z.output<typeof graphStatusSchema>;
export declare const graphRequestSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
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
export declare const graphResultSchema: z.ZodObject<{
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
