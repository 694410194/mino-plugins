import { type DramaDocumentTarget, type DramaEpisodeProduction, type DramaProductionSection } from "./drama-production.js";
import type { CanvasViewport } from "./canvas-viewport.js";
import { type CanvasPoint, type ProductionJob, type ProductionMediaVersion, type ProductionQueueEntry, type ProductionSequenceItem } from "./production-runtime.js";
interface Props {
    readonly sessionId: string;
    readonly production: DramaEpisodeProduction;
    readonly sessionRunning: boolean;
    readonly queue: readonly ProductionQueueEntry[];
    readonly section: DramaProductionSection;
    readonly selectedId: string | undefined;
    readonly jobs: readonly ProductionJob[];
    readonly versions: readonly ProductionMediaVersion[];
    readonly libraryVersions: readonly ProductionMediaVersion[];
    readonly selections: Readonly<Record<string, string>>;
    readonly manualReferences: Readonly<Record<string, readonly string[]>>;
    readonly sequence: readonly ProductionSequenceItem[];
    readonly canvas: Readonly<Record<string, CanvasPoint>>;
    readonly viewport: CanvasViewport | undefined;
    readonly onSectionChange: (section: DramaProductionSection) => void;
    readonly onSelect: (id: string | undefined) => void;
    readonly onNavigate: (target: DramaDocumentTarget) => void;
    readonly onJobsChange: (jobs: ProductionJob[]) => void;
    readonly onSelectionsChange: (selections: Record<string, string>) => void;
    readonly onManualReferencesChange: (references: Record<string, string[]>) => void;
    readonly onOpenMedia: (path: string) => void;
    readonly onSequenceChange: (sequence: ProductionSequenceItem[]) => void;
    readonly onCanvasChange: (canvas: Record<string, CanvasPoint>) => void;
    readonly onViewportChange: (viewport: CanvasViewport) => void;
    readonly onDispatchPrompt: (prompt: string) => Promise<void>;
    readonly onCancelTurn: () => Promise<void>;
    readonly onRemoveQueued: (itemId: string) => Promise<void>;
    readonly onRefresh: () => void;
}
export declare function compositionSources(production: DramaEpisodeProduction, sequence: readonly ProductionSequenceItem[], versions: readonly ProductionMediaVersion[]): {
    shotId: string;
    sourceId: string;
    kind: "image" | "video";
    path: string;
    durationSeconds: number | undefined;
}[];
export declare function DramaProductionView(props: Props): import("react/jsx-runtime").JSX.Element;
export declare function SequenceBoard(props: Pick<Props, "jobs" | "sequence" | "versions" | "onSequenceChange"> & {
    readonly episodeDirectory?: string;
    readonly onCompose: () => void;
}): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=drama-production-view.d.ts.map