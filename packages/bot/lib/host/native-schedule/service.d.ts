import type { Context } from '@deepseek-ai/cordis';
import type { ScheduleCatalogEntry } from '@deepseek-ai/dsh-schedule';
import { type ScheduleBinding, type NativeAggregate } from '../../shared/native-schedule.js';
import type { DshBotRegistry } from '../registry.js';
export declare const bindingDomain: {
    name: string;
    version: number;
    tables: {
        bindings: import("@deepseek-ai/dsh-storage-domain").DomainTableSpec<string, {
            botId: string;
            botCreatedAt: number;
            sessionId: string;
            nativeScheduleId: string;
        }>;
    };
};
export declare const legacyDomain: {
    name: string;
    version: number;
    tables: {
        routines: import("@deepseek-ai/dsh-storage-domain").DomainTableSpec<string, unknown>;
        runs: import("@deepseek-ai/dsh-storage-domain").DomainTableSpec<string, unknown>;
        control: import("@deepseek-ai/dsh-storage-domain").DomainTableSpec<string, unknown>;
    };
};
export declare class NativeSchedules {
    private readonly ctx;
    private readonly bots;
    private tail;
    private closed;
    private legacy?;
    private legacyUnavailable;
    private bindings;
    private closing?;
    private unsubscribe?;
    constructor(ctx: Context, bots: Pick<DshBotRegistry, 'list' | 'status'>);
    start(): Promise<void>;
    private serialize;
    private reconcile;
    aggregate(): Promise<NativeAggregate>;
    task(id: string): Promise<{
        binding: ScheduleBinding;
        task: ScheduleCatalogEntry;
    }>;
    deleteLegacy(id: string): Promise<void>;
    close(): Promise<void>;
}
