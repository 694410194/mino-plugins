import type { InstalledProjectionItem, InstalledProjectionTarget } from './generated/native-contract.js';
export type InstalledPresentation = {
    displayName?: string;
    summary?: string;
};
export declare const MAX_PRESENTATION_BYTES: number;
/** Presentation only: never return the instruction body or treat these fields as identity. */
export declare function parseInstalledPresentation(prefix: Uint8Array): InstalledPresentation;
/** One bounded local read per valid target; no inventory traversal, discovery, or network call. */
export declare function readInstalledPresentations(items: readonly InstalledProjectionItem[], roots: readonly InstalledProjectionTarget[], signal: AbortSignal): Promise<InstalledPresentation[]>;
