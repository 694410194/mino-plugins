import type { Context } from "@deepseek-ai/cordis";
import type { Agent } from "@deepseek-ai/dsh-agent";
import type { ContentBlock } from "@deepseek-ai/dsh-llm";
import type { Session, SessionId } from "@deepseek-ai/dsh-session";
import type { SubagentResult } from "@deepseek-ai/dsh-subagent";
import { type ToolDefinition } from "@deepseek-ai/dsh-tools";
import { type OhStoryRoleName } from "./role-provider.js";
export declare const OH_STORY_ROLE_TOOL_NAME = "oh_story_role";
interface RoleStartRequest {
    readonly label: string;
    readonly prompt: ContentBlock[];
    readonly parent: Agent;
    readonly persona: string;
    readonly toolFilter: {
        readonly allow: readonly string[];
    };
    readonly maxDepth: number;
    readonly signal: AbortSignal;
}
interface RoleRun {
    readonly id: string;
    readonly localAgent?: {
        readonly session: Session;
    };
    readonly result: Promise<SubagentResult>;
    dispose(): Promise<void>;
}
interface ManagedRoleSpec {
    readonly provider: string;
    readonly label: string;
    readonly childId: SessionId;
    readonly request: Pick<RoleStartRequest, "parent" | "prompt" | "maxDepth">;
    readonly signal: AbortSignal;
    readonly delivery: "caller";
}
/** Local seam types also let TypeScript consumers use the older DSH declarations. */
export type OhStoryRoleSubagents = {
    startActivation(spec: ManagedRoleSpec): Promise<{
        readonly childId: SessionId;
        readonly result: Promise<SubagentResult>;
        dispose(): Promise<void>;
    }>;
} | {
    start(provider: string, request: RoleStartRequest): Promise<RoleRun>;
};
export declare function roleToolFilter(role: OhStoryRoleName): {
    readonly allow: readonly string[];
};
export declare function createOhStoryRoleTool(subagents?: OhStoryRoleSubagents): Promise<ToolDefinition>;
export declare function registerOhStoryRoleTool(context: Context): Promise<void>;
export {};
//# sourceMappingURL=role-tool.d.ts.map