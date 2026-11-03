import type { RootInstructions } from '../../shared/memory-forget.js';
export declare const rootCandidates: readonly ["AGENTS.md", "CLAUDE.md", "AGENTS.local.md", "CLAUDE.local.md"];
export declare const rootInstructionNotice: string;
export declare function detectRootInstructions(root: string): Promise<RootInstructions>;
