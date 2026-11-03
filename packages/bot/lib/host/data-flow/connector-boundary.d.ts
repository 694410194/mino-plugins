import type { Agent } from '@deepseek-ai/dsh-agent';
import type { ToolExecution, ToolExecutionResult } from '@deepseek-ai/dsh-tools';
import type { BotKey } from '../../shared/identity.js';
import type { DshBotRegistry } from '../registry.js';
import type { ManagedOutlets } from './outlets.js';
export declare function connectorDestination(agent: Agent, name: string): string | undefined;
export declare function connectorDispatch(agent: Agent, bot: BotKey, registry: DshBotRegistry, flow: ManagedOutlets, exec: ToolExecution, next: () => Promise<ToolExecutionResult>): Promise<ToolExecutionResult>;
