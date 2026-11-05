import { type QueryClient } from '@tanstack/react-query';
import type { ToolCallViewProps } from '@deepseek-ai/dsh-client-ui-tool/client';
import type { RemoteResult } from '@deepseek-ai/dsh-typert-protocol';
import type { ConversationManagementResult, InstalledSkillList, InstalledUpdateCheck, SkillAvailability } from '../host/types.js';
import type { InstallationServices } from './install-control.js';
import { type ManagementViewResult, type ManagementReceipt } from './management-result.js';
import { type SelectSkillUse } from './skill-primary-actions.js';
export interface ManagementViewServices {
    selectSkillUse?: SelectSkillUse;
    client: QueryClient;
    installation: InstallationServices;
    refreshInstalled(signal: AbortSignal): Promise<{
        sourceRevision: string;
        list: InstalledSkillList;
    }>;
    availability?(revision: string, itemKey: string, signal: AbortSignal): Promise<RemoteResult<SkillAvailability>>;
    check(revision: string, itemKey: string, signal: AbortSignal): Promise<RemoteResult<InstalledUpdateCheck>>;
    begin(revision: string, itemKey: string, action: 'upgrade' | 'uninstall' | 'enable' | 'disable', version: string | null, requestKey: string, signal: AbortSignal): Promise<RemoteResult<ConversationManagementResult>>;
    confirm(ref: string, confirmed: boolean, signal: AbortSignal): Promise<RemoteResult<ConversationManagementResult>>;
    assertCurrent(): void;
}
type Item = InstalledSkillList['items'][number];
/** Validate the historical reference without rebinding it to a newer version or another scope. */
export declare function verifyManagementReference(services: ManagementViewServices, revision: string, itemKey: string, signal: AbortSignal): Promise<Item>;
/** Only reference validation retires a row; task selection cancellation belongs to UseSkillButton. */
export declare function verifiedManagementUse(services: ManagementViewServices, revision: string, itemKey: string, onInvalid: (message: string) => void): InstallationServices['skillUse'];
export declare function ManagementToolView(props: ToolCallViewProps & {
    services: ManagementViewServices;
}): import("react/jsx-runtime").JSX.Element;
export declare function ManagementContent({ result, services }: {
    result: ManagementViewResult;
    services: ManagementViewServices;
}): import("react/jsx-runtime").JSX.Element;
export declare function availabilityNotice(value: SkillAvailability): {
    message: string;
    success: boolean;
};
export declare function AvailabilityResult({ value, standalone }: {
    value: SkillAvailability;
    standalone?: boolean;
}): import("react/jsx-runtime").JSX.Element;
/** Input is already scoped to one verified Registry revision; no target is merged away. */
export declare function groupManagementItems(items: Item[]): Item[][];
export declare function managementTargetLabel(items: Item[], item: Item): string;
/** Refresh is allowed only after accepted success, using a stable Host location identity. */
export declare function refreshManagementLocation(services: ManagementViewServices, revision: string, item: Item): Promise<InstalledSkillList>;
/** Read-only position inventory rendered directly in a skill detail, never a management modal. */
export declare function InstallationManagement({ identity, revision, services, useSkill, onInstall, onUsed, updateChecks }: {
    updateChecks?: Record<string, InstalledUpdateCheck>;
    identity: Pick<Item, 'namespace' | 'slug'>;
    revision: string;
    services: ManagementViewServices;
    onInstall?(): void;
    onUsed?(): void;
    useSkill?: import('./use-skill.js').SkillUseServices;
}): import("react/jsx-runtime").JSX.Element;
export declare function ManagementLocations({ items, revision, services, onUsed, onManagement, updateChecks }: {
    items: Item[];
    updateChecks?: Record<string, InstalledUpdateCheck>;
    revision: string;
    services: ManagementViewServices;
    onUsed?(): void;
    onManagement?(result: ConversationManagementResult): void;
}): import("react/jsx-runtime").JSX.Element;
export declare function ManagementConfirmation({ initial, services, onCancelled, onCompleted, targetLabel, presentation, title }: {
    presentation?: 'card' | 'dialog';
    title?: string;
    initial: ManagementReceipt;
    services: ManagementViewServices;
    onCancelled?(): void;
    onCompleted?(): void;
    targetLabel?: string;
}): import("react/jsx-runtime").JSX.Element;
export {};
