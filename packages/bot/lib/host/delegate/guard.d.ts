import type { Context } from '@deepseek-ai/cordis';
import type { Agent } from '@deepseek-ai/dsh-agent';
import type { RunService } from '../automation/store.js';
/** Use durable Host provenance, never model arguments or prompt text. */
export declare function assertInteractiveOrigin(agent: Agent, _runs: RunService): void;
/** Gate the explicit delegation entry. Native scheduling owns its own rules. */
export declare function registerAutomationGuard(ctx: Context, runs: RunService): void;
