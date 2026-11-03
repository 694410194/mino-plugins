import { z } from 'zod';
export declare const teamLinkSchema: z.ZodObject<{
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
export declare const teamMemberSchema: z.ZodObject<{
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
}, z.core.$strict>;
export declare const teamTaskSchema: z.ZodObject<{
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
export declare const teamBoardSchema: z.ZodObject<{
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
export declare const teamTaskInputSchema: z.ZodObject<{
    subject: z.ZodString;
    description: z.ZodString;
    blockedBy: z.ZodDefault<z.ZodArray<z.ZodString>>;
}, z.core.$strict>;
export declare const teamUpdateSchema: z.ZodObject<{
    taskId: z.ZodString;
    expectedRevision: z.ZodNumber;
    action: z.ZodEnum<{
        complete: "complete";
        claim: "claim";
    }>;
}, z.core.$strict>;
export type TeamLink = z.output<typeof teamLinkSchema>;
export type TeamBoard = z.output<typeof teamBoardSchema>;
export type TeamTaskInput = z.input<typeof teamTaskInputSchema>;
export type TeamUpdate = z.input<typeof teamUpdateSchema>;
export declare const IM_PIN = "4645cf767257b4bc32c80f4f18e1f9f6cfbb5060";
export declare const IM_RUNTIME_VERIFIED = false;
export declare const imStatusSchema: z.ZodObject<{
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
export type ImStatus = z.output<typeof imStatusSchema>;
