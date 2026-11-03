import type { Context } from '@deepseek-ai/cordis';
import { type Domain } from '@deepseek-ai/dsh-storage-domain';
import { type TeamBoard } from '../../shared/collaboration.js';
import { type BotKey } from '../../shared/integrations.js';
import type { DshBotRegistry } from '../registry.js';
export declare const collaborationDomain: {
    name: string;
    version: number;
    tables: {
        team_links: import("@deepseek-ai/dsh-storage-domain").DomainTableSpec<string, {
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
    };
};
/** Native Session is authoritative for roster/tasks. This sidecar only links identities. */
export declare class Collaboration {
    private ctx;
    private registry;
    private domain;
    private changed;
    private queue;
    private stopped;
    private closing?;
    private operations;
    constructor(ctx: Context, registry: DshBotRegistry, domain: Domain<typeof collaborationDomain>, changed: () => void);
    private service;
    private assertBot;
    private id;
    private link;
    private live;
    private operation;
    board(input: BotKey): Promise<TeamBoard>;
    ensure(input: BotKey, expectedRevision: number): Promise<{
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
    createTask(input: BotKey, raw: unknown): Promise<import("@deepseek-ai/dsh-experimental-agent-team").TeamTaskView>;
    updateTask(input: BotKey, raw: unknown): Promise<import("@deepseek-ai/dsh-experimental-agent-team").TeamTaskView>;
    close(): Promise<void>;
}
