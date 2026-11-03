import type { Context } from '@deepseek-ai/cordis';
import { TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol';
import { type CapabilitiesMethods } from '../../shared/capabilities-contract.js';
import type { Capabilities } from './service.js';
export declare const CAPABILITIES_HOST: {
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
export declare class CapabilitiesRemote extends TypertRemoteService {
    private capabilities;
    constructor(ctx: Context, capabilities: Capabilities);
    request(input: Parameters<CapabilitiesMethods['request']>[0]): Promise<{
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
declare module '@deepseek-ai/cordis' {
    interface Context {
        dshBotCapabilitiesRemote: CapabilitiesRemote;
    }
}
