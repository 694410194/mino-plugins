import type { CanvasPoint } from "./production-runtime.js";
/**
 * Screen = world * zoom + pan. The canvas has no edges: nodes and the pan offset take any
 * finite coordinate, so nothing can be pushed out of reach.
 */
export interface CanvasViewport {
    readonly x: number;
    readonly y: number;
    readonly zoom: number;
}
export interface CanvasSize {
    readonly width: number;
    readonly height: number;
}
export declare const CANVAS_NODE_WIDTH = 180;
export declare const CANVAS_NODE_HEIGHT = 76;
export declare const MIN_CANVAS_ZOOM = 0.1;
export declare const MAX_CANVAS_ZOOM = 3;
export declare const DEFAULT_CANVAS_VIEWPORT: CanvasViewport;
export declare function clampZoom(zoom: number): number;
/** Scales by `factor` while the world point under `anchor` (viewport pixels) stays put. */
export declare function zoomAt(viewport: CanvasViewport, factor: number, anchor: CanvasPoint): CanvasViewport;
/** Wheel deltas arrive in pixels, lines or pages depending on device; one notch is ~10%. */
export declare function wheelZoomFactor(deltaY: number, deltaMode: number): number;
export declare function screenToWorld(viewport: CanvasViewport, point: CanvasPoint): CanvasPoint;
/** Pans so the node's centre sits in the middle of the viewport, keeping the zoom. */
export declare function centerOn(viewport: CanvasViewport, node: CanvasPoint, size: CanvasSize): CanvasViewport;
export declare function nodeVisible(viewport: CanvasViewport, node: CanvasPoint, size: CanvasSize): boolean;
/** Frames every node; a single tall column fits its width rather than shrinking to dots. */
export declare function fitNodes(nodes: readonly CanvasPoint[], size: CanvasSize, fallback?: CanvasViewport): CanvasViewport;
//# sourceMappingURL=canvas-viewport.d.ts.map