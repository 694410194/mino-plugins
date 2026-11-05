import type { Context } from '@deepseek-ai/cordis';
import { type LoadedSkill } from './skill-discovery.js';
import type { RemovalBaseline } from './generated/native-contract.js';
import type { SkillAvailability } from './types.js';
export interface AvailabilityReader {
    snapshot?(signal?: AbortSignal): Promise<{
        complete: boolean;
        skills: readonly {
            name: string;
        }[];
    }>;
    get(name: string, signal?: AbortSignal): Promise<LoadedSkill | undefined>;
}
export declare const skillNamePattern: RegExp;
/** Whitelisted observations only. Neither a successful check nor a name lookup authorizes changes. */
export declare function inspectSkillAvailability(input: {
    ctx: Context;
    reader?: AvailabilityReader;
    signal: AbortSignal;
    valid(): void;
    name?: string;
    managed?: {
        directory: string;
        fingerprint?: string;
        baseline(): Promise<RemovalBaseline>;
    };
}): Promise<SkillAvailability>;
/** Conservative routing-name extraction, not a replacement YAML parser. Ambiguous syntax stays unknown. */
export declare function installationEntryName(content: string): string | undefined;
/** Disabled state does not establish discovery exclusion: observe the real current-session winner. */
export declare function inspectDisabledSkillAvailability(input: {
    directory: string;
    fingerprint?: string;
    signal: AbortSignal;
    valid(): void;
    baseline(): Promise<RemovalBaseline>;
    entry(): Promise<string | undefined>;
    reader?: AvailabilityReader;
}): Promise<SkillAvailability>;
