import type { DramaDocumentTarget, DramaEpisodeProduction } from "./drama-production.js";
import type { CanvasPoint } from "./production-runtime.js";
import { type CanvasViewport } from "./canvas-viewport.js";
interface Props {
    readonly production: DramaEpisodeProduction;
    readonly selectedId: string | undefined;
    readonly canvas: Readonly<Record<string, CanvasPoint>>;
    /** Undefined until the creator pans or zooms this episode; the first view then frames the nodes. */
    readonly viewport: CanvasViewport | undefined;
    readonly onSelect: (id: string | undefined) => void;
    readonly onNavigate: (target: DramaDocumentTarget) => void;
    readonly onCanvasChange: (canvas: Record<string, CanvasPoint>) => void;
    readonly onViewportChange: (viewport: CanvasViewport) => void;
}
interface CanvasNode {
    readonly id: string;
    readonly label: string;
    readonly type: "asset" | "shot";
    readonly initial: CanvasPoint;
}
export declare function canvasNodes(production: DramaEpisodeProduction): CanvasNode[];
export declare function ProductionCanvas(props: Props): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=production-canvas.d.ts.map