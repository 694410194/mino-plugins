import type { InstalledSkillList } from '../host/types.js';
import type { InstalledServices } from './installed-skills.js';
export declare function MarketCardActions({ records, services, sourceRevision, verified, onInstall, onManage, label }: {
    records: InstalledSkillList['items'];
    services?: InstalledServices;
    sourceRevision: string;
    verified: boolean;
    onInstall(): void;
    onManage?(): void;
    label?: string;
}): import("react/jsx-runtime").JSX.Element;
