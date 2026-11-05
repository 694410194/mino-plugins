import type { InstalledSkillList, SkillUsePreparation, SkillUseSelection } from './types.js';
/** A bounded observation of every managed candidate, never an invocation authorization. */
export declare function selectUsableInstallation(input: {
    namespace: string;
    slug: string;
    signal: AbortSignal;
    valid(): void;
    list(signal: AbortSignal): Promise<InstalledSkillList>;
    prepare(itemKey: string, signal: AbortSignal): Promise<SkillUsePreparation>;
}, timeoutMs?: number): Promise<SkillUseSelection>;
