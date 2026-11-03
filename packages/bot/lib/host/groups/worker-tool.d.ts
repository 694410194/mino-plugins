import type { BotKey } from '../../shared/identity.js';
import type { Agent } from '@deepseek-ai/dsh-agent';
import { z } from 'zod';
import type { GroupModelSelection } from '../../shared/groups.js';
import type { GroupState } from './state.js';
import type { GroupTurnRunner } from './turn-runner.js';
export interface WorkerBinding {
    turnId: string;
    deliveryId: string;
    childId: string;
    rootId: string;
    presetId: string;
    resumeAllowed?: boolean;
    approvedInputs?: Set<string>;
    modelSelection?: GroupModelSelection;
    audience: BotKey[];
    isActive?: () => boolean;
    agent?: Agent;
}
export declare const workerReservations: Map<string, WorkerBinding>;
export declare function getGroupWorkerBinding(agent: Agent): WorkerBinding | undefined;
export declare function isLiveGroupWorker(agent: Agent): boolean;
/** Only exact inputs admitted by the group bridge retain the shared label. */
export declare function isAdmittedGroupInput(agent: Agent, message: import('@deepseek-ai/dsh-llm').UserMessage): boolean;
export declare function admitGroupInput(binding: WorkerBinding, content: readonly import('@deepseek-ai/dsh-llm').ContentBlock[]): void;
export declare function isOwnedGroupTool(agent: Agent, name: string): boolean;
export declare const groupToolInput: z.ZodDiscriminatedUnion<[z.ZodObject<{
    action: z.ZodLiteral<"skip">;
}, z.core.$strict>, z.ZodObject<{
    action: z.ZodLiteral<"send">;
    to: z.ZodOptional<z.ZodString>;
    targets: z.ZodOptional<z.ZodArray<z.ZodString>>;
    kind: z.ZodOptional<z.ZodEnum<{
        request: "request";
        progress: "progress";
    }>>;
    text: z.ZodString;
    replyTo: z.ZodOptional<z.ZodString>;
    requestReply: z.ZodDefault<z.ZodBoolean>;
}, z.core.$strict>], "action">;
/** Only a pre-reserved local worker receives the tool; no address is model supplied. */
export declare function installWorkerTools(state: GroupState, runner: GroupTurnRunner): import("@deepseek-ai/cordis").Disposable<Promise<void>>;
