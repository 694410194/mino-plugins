import { type Context, Service } from '@deepseek-ai/cordis';
import type { PresetDefinition } from '@deepseek-ai/dsh-agent-preset-registry';
import { TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol';
import type { BotsWorkspace } from '../../shared/remote-contract.js';
import type { BotRecord } from '../../shared/schema.js';
import { BotHomes } from '../home.js';
import { openBotStores } from '../store.js';
import type { MainSessions } from '../main-session.js';
import { Config } from '../registry-config.js';
import type { Lease } from './types.js';
import { MemoryConfirmation } from '../memory/confirmation.js';
import { ManagedOutlets } from '../data-flow/outlets.js';
import { EgressChecker } from '../data-flow/egress.js';
import { MemoryAdmission } from '../memory/admission.js';
import type { MemoryForgetting } from '../memory/forget-service.js';
export declare abstract class RegistryLifecycle extends TypertRemoteService {
    protected readonly assertOwner: () => void;
    static inject: string[];
    static Config: import("@deepseek-ai/schemastery").default<Omit<Partial<Config>, "memoryRetrieval"> & {
        memoryRetrieval?: Partial<Config["memoryRetrieval"]>;
    }, Config>;
    readonly config: Config;
    readonly memoryAdmission: MemoryAdmission;
    memoryForget?: MemoryForgetting;
    memoryConfirmation?: MemoryConfirmation;
    memoryEgress?: EgressChecker;
    memoryOutlets?: ManagedOutlets;
    get memoryKernel(): import("../memory/op-log.js").MemoryKernel | undefined;
    mainSessions?: MainSessions;
    protected stores: Awaited<ReturnType<typeof openBotStores>>;
    protected readonly leases: Map<string, Lease>;
    protected readonly activating: Map<string, {
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
        skills: {
            extraDirs: string[];
        };
        memory: {
            enabled: boolean;
            injectLimit: number;
        };
        mcpServers: {
            serverName: string;
            transport: "stdio" | "streamable-http";
            command?: string | undefined;
            args?: string[] | undefined;
            url?: string | undefined;
            envRefs?: Record<string, string> | undefined;
        }[];
        channels: {
            kind: "feishu" | "telegram" | "slack" | "email" | "desktop";
            target: string;
            policy: {
                dailyLimit: number;
                cooldownSec: number;
                quietHours?: [string, string] | undefined;
            };
            credentialRef?: string | undefined;
        }[];
        id: string;
        createdAt: number;
        updatedAt: number;
        schemaVersion: 1;
        avatar?: string | undefined;
        avatarColor?: "--dsw-alias-state-business-primary" | "--dsw-alias-state-success-primary" | "--dsw-alias-state-warn-label" | "--dsw-alias-state-error-primary" | "teal" | "cyan" | "indigo" | "purple" | "rose" | "orange" | "olive" | "slate" | undefined;
        avatarVariant?: "classic" | "glasses" | "spout" | "baby" | "hat" | "sleeping" | "auto" | undefined;
        model?: {
            provider: string;
            model: string;
            reasoningEffort?: string | undefined;
        } | undefined;
        defaultCwd?: string | undefined;
        order?: number | undefined;
        onboarding?: {
            operationId: string;
            language: "en" | "zh";
            policyVersion: 1;
            inputDigest: string;
        } | undefined;
    }>;
    protected readonly ready: Promise<void>;
    protected tail: Promise<unknown>;
    protected stopping: boolean;
    protected failed: boolean;
    protected initialized: boolean;
    protected started: boolean;
    protected startupError?: string;
    protected creationTime: number;
    protected readonly diagnostics: Map<string, string>;
    protected changeRevision: number;
    protected readonly changeListeners: Set<() => void>;
    protected readonly watchOwner: Context;
    protected readonly homes: BotHomes;
    protected readonly memoryOwnerDir: string;
    protected releaseResources?: () => Promise<void>;
    protected closeTask?: Promise<void>;
    constructor(ctx: Context, config: Config, start?: () => Promise<void>, assertOwner?: () => void);
    [Service.init](): Promise<void>;
    waitUntilReady(): Promise<void>;
    /** Host coordinator joins this before releasing shared-storage ownership. */
    close(): Promise<void>;
    protected assertReady(): void;
    protected initialize(): Promise<void>;
    protected enqueue<T>(operation: () => Promise<T> | T, write?: boolean): Promise<T>;
    protected abstract reconcile(): Promise<void>;
    protected abstract ensureWorkspace(): Promise<BotsWorkspace>;
    protected abstract acquire(definition: PresetDefinition, bot: BotRecord): Promise<void>;
    protected abstract release(lease: Lease): Promise<void>;
}
