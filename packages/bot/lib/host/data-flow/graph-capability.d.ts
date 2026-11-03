import type { Agent } from '@deepseek-ai/dsh-agent';
export declare const graphCapability: (agent: Agent, callId: string) => boolean;
export declare function withGraphCapability<T>(agent: Agent, callId: string, work: () => Promise<T>): Promise<T>;
