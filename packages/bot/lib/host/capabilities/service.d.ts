import type { Context } from '@deepseek-ai/cordis';
import { capabilityRequest } from '../../shared/capabilities-contract.js';
import type { z } from 'zod';
import type { DshBotRegistry } from '../registry.js';
/** Thin native read bridge and bounded own-directory editor; never starts an Agent or model turn. */
export declare class Capabilities {
    private ctx;
    private registry;
    private queue;
    constructor(ctx: Context, registry: DshBotRegistry);
    close(): Promise<void>;
    request(input: z.input<typeof capabilityRequest>): Promise<{
        kind: "models";
        providers: {
            id: string;
            name: string;
            available: boolean;
            models: {
                provider: string;
                id: string;
                name: string;
                inputModalities?: string[] | undefined;
            }[];
        }[];
    } | {
        kind: "modelInfo";
        model: {
            provider: string;
            id: string;
            name: string;
            inputModalities?: string[] | undefined;
            reasoning?: {
                efforts: {
                    id: string;
                    name: string;
                }[];
            } | undefined;
        };
    } | {
        kind: "conversation";
        sessionId: string;
    } | {
        kind: "inspect";
        dataFlow: {
            state: "unknown" | "restricted" | "clear";
            reasons: ("unavailable" | "secret" | "no-egress" | "pending-cleanup" | "revoked" | "unknown-lineage" | "reader-mismatch")[];
        };
        platform: {
            browser: {
                toolBridge: false;
                provider?: string | undefined;
            };
            voice: {
                available: boolean;
                providers: {
                    id: string;
                    name: string;
                    phase: string;
                }[];
                selectedProvider?: string | undefined;
            };
        };
        online: boolean;
        skillsAvailable: boolean;
        skills: {
            name: string;
            description: string;
            provider: string;
        }[];
        ownSkills: string[];
        tools: string[];
        extraDirs: string[];
        mainSessionId?: string | undefined;
    } | {
        kind: "skill";
        name: string;
        hash: string | null;
        content?: string | undefined;
    } | {
        kind: "removed";
    }>;
}
