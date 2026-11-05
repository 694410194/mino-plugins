import type { InstalledSkillList } from '../host/types.js';
import { type ManagementViewServices } from './management-tool-view.js';
type Item = InstalledSkillList['items'][number];
/** Both page and conversation actions use the same native confirmation and exact Host plan. */
export declare function ToggleControl({ services, revision, item, onRefreshed, eligible, presentation, title }: {
    services?: ManagementViewServices;
    revision: string;
    item: Item;
    eligible?: boolean;
    presentation?: 'menu' | 'button';
    title?: string;
    onRefreshed?(item: Item): void;
}): import("react/jsx-runtime").JSX.Element | null;
export {};
