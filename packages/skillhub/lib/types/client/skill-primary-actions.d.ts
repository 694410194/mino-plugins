import type { InstalledSkillList, SkillUseSelection } from '../host/types.js';
import type { RemoteResult } from '@deepseek-ai/dsh-typert-protocol';
import { type SkillUseServices } from './use-skill.js';
type Item = InstalledSkillList['items'][number];
export type SelectSkillUse = (revision: string, namespace: string, slug: string, signal: AbortSignal) => Promise<RemoteResult<SkillUseSelection>>;
export declare function selectSkillItem(select: SelectSkillUse, revision: string, namespace: string, slug: string, signal: AbortSignal): Promise<string>;
/** A local summary is not a claim that DSH can call any particular installation. */
export declare function skillInstallationSummary(items: Item[]): string;
export declare function SkillPrimaryActions({ items, revision, verified, select, useSkill, onManage, label, summaryVisible, onUsed }: {
    items: Item[];
    revision: string;
    verified: boolean;
    select?: SelectSkillUse;
    useSkill?: SkillUseServices;
    onManage?(): void;
    label?: string;
    summaryVisible?: boolean;
    onUsed?(): void;
}): import("react/jsx-runtime").JSX.Element;
export {};
