import type { MemoryRecord } from '../../shared/schema.js';
import type { Agent } from '@deepseek-ai/dsh-agent';
import type { BotMemoryService } from './service.js';
export declare const MEMORY_TOOL_NAMES: readonly string[];
/** Definitions bind both the trusted Bot service and the owning Agent, never model arguments. */
export declare function createMemoryTools(memory: BotMemoryService, owner: Agent, observed?: (rows: MemoryRecord[]) => Promise<void>): import("@deepseek-ai/dsh-tools").ToolDefinition[];
