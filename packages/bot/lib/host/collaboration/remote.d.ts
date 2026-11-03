import type { Context } from '@deepseek-ai/cordis';
import { TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol';
import type { BotKey } from '../../shared/integrations.js';
import type { Collaboration } from './service.js';
export declare const COLLABORATION_HOST: {
    package: string;
    face: "host";
    schemas: never[];
    readonly invocations: readonly import("@deepseek-ai/dsh-typert-protocol").InvocationDescriptor[];
    model: {
        services: never[];
        events: never[];
        objects: never[];
    };
};
export declare class CollaborationRemote extends TypertRemoteService {
    private collaboration;
    constructor(ctx: Context, collaboration: Collaboration);
    board(bot: BotKey): Promise<{
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
    }>;
    ensure(bot: BotKey, expectedRevision: number): Promise<{
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
    }>;
    createTask(bot: BotKey, input: unknown): Promise<import("@deepseek-ai/dsh-experimental-agent-team").TeamTaskView>;
    updateTask(bot: BotKey, input: unknown): Promise<import("@deepseek-ai/dsh-experimental-agent-team").TeamTaskView>;
}
export declare class ImRemote extends TypertRemoteService {
    constructor(ctx: Context);
    status(): Promise<{
        pin: "4645cf767257b4bc32c80f4f18e1f9f6cfbb5060";
        installed: boolean;
        contractDetected: boolean;
        inboundSupported: false;
        outboundSupported: false;
        reason: "plugin-missing" | "contract-unavailable" | "consumer-gate-unverified";
    }>;
}
declare module '@deepseek-ai/cordis' {
    interface Context {
        dshBotCollaborationRemote: CollaborationRemote;
        dshBotImRemote: ImRemote;
    }
}
