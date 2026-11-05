import { type UpdateResult } from './update-overview.js';
import { type ManagementViewServices } from './management-tool-view.js';
import type { SkillUseServices } from './use-skill.js';
import { type RefObject } from 'react';
import type { RemoteResult, TypertRemoteNamespaceMap } from '@deepseek-ai/dsh-typert-protocol';
import type { InstalledSkillList, InstalledSkillDetail, InstalledUpdateCheck, SkillHubConfig } from '../host/types.js';
import { type UpgradeServices } from './upgrade-control.js';
import { type RemovalServices } from './removal-control.js';
import type { InstalledNavigation } from './installed-navigation.js';
export interface InstalledServices extends UpgradeServices, RemovalServices {
    management?: ManagementViewServices;
    sessionId: string;
    context?: {
        getSnapshot(): number;
        subscribe(listener: () => void): () => void;
    };
    skillUse?: SkillUseServices;
    list(sourceRevision: string, signal: AbortSignal): Promise<RemoteResult<InstalledSkillList>>;
    detail(sourceRevision: string, itemKey: string, signal: AbortSignal): Promise<RemoteResult<InstalledSkillDetail>>;
    beginInstalledUpdateScan(sourceRevision: string, signal: AbortSignal): Promise<RemoteResult<{
        scanId: string;
        itemKeys: string[];
    }>>;
    checkInstalledUpdateScan(sourceRevision: string, scanId: string, itemKey: string, signal: AbortSignal): Promise<RemoteResult<InstalledUpdateCheck>>;
    endInstalledUpdateScan(sourceRevision: string, scanId: string): Promise<RemoteResult<void>>;
    checkUpdate(sourceRevision: string, itemKey: string, signal: AbortSignal): Promise<RemoteResult<InstalledUpdateCheck>>;
}
type Item = InstalledSkillList['items'][number];
export declare function installedCardBadges(items: Item[], results: Record<string, UpdateResult>, verified: boolean): {
    label: string;
    tone: "neutral" | "warning" | "info";
}[];
export declare function installedCardVersions(items: Item[]): {
    label: string;
    title: string;
};
export declare function installedUpdateKeys(inventory: Item[], results: Record<string, UpdateResult>, retry: boolean, group?: Item[]): string[];
export declare function InstalledSkills({ services, sourceRevision, source, remote, modes, scrollContainer, navigation, onInstall }: {
    services: InstalledServices;
    sourceRevision: string;
    source: string;
    remote: TypertRemoteNamespaceMap['skillhub'];
    modes: SkillHubConfig['detailTabs'];
    scrollContainer: RefObject<HTMLElement>;
    navigation: InstalledNavigation;
    onInstall?(item: Item): void;
    onRemove?(item: Item): void;
    onUpgrade?(item: Item): void;
}): import("react/jsx-runtime").JSX.Element;
export {};
