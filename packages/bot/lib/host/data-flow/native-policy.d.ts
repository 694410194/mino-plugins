import type { Agent } from '@deepseek-ai/dsh-agent';
import type { ToolExecution } from '@deepseek-ai/dsh-tools';
import type { BotKey } from '../../shared/identity.js';
import type { DshBotRegistry } from '../registry.js';
import type { ManagedOutlets } from './outlets.js';
/** Browser provider registration only publishes a name in rc.2; it exposes no exact
 * Session-owned ToolDefinition catalog. Never infer browser authority from providerName,
 * mcp__ prefix, description or schema. Per-Bot browser MCP may instead use the existing
 * explicitly assigned managed connector boundary.
 */
/** Closed catalog verified against the rc.2 preset's public tools. No namespace/prefix admission.
 * Creation of children remains managed by bot_delegate, which records their audience before startup.
 * run_code remains closed: its transport and all nested dispatches need a separate audit.
 */
export declare const NATIVE_TOOL_NAMES: readonly ["read", "write", "edit", "read_image", "glob", "grep", "bash", "pwsh", "web_search", "web_fetch", "skill", "present", "job_output", "job_list", "job_kill", "schedule_create", "schedule_list", "schedule_update", "schedule_delete", "list_agents", "send_message", "interrupt_agent", "ask_user_question", "todo_write", "get_goal", "create_goal", "update_goal", "bot_manage"];
/** Host registration is trusted, not third-party plugin isolation. rc.2 exposes exact definitions
 * via tools.get, but no public publisher identity. Pin all visible definitions once after preset
 * initialization (first pre-step, or first direct dispatch); reject subsequent shadow/replacements.
 */
export declare function nativePolicy(agent: Agent, bot: BotKey, registry: DshBotRegistry, flow: ManagedOutlets): {
    capture: () => void;
    owns: (name: string) => boolean;
    candidate: (name: string) => boolean;
    reason(exec: ToolExecution): string | undefined;
    dispatch<T>(exec: ToolExecution, next: () => Promise<T>): Promise<T>;
};
