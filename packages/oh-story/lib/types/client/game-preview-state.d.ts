/** What the out-of-band probe learned about the build the frame is showing. */
export type PreviewProbeResult = "pending" | "ok" | "failed";
export interface GamePreviewObservation {
    /** The iframe fired `load`. It also fires for an HTTP error page, so it never proves the build works. */
    readonly frameLoaded: boolean;
    readonly frameError: boolean;
    readonly probe: PreviewProbeResult;
    /** The Agent is writing into this project's files right now. */
    readonly building: boolean;
    /** A newer build exists than the one the creator accepted. */
    readonly pending: boolean;
    readonly isolated: boolean;
}
export interface GamePreviewStatus {
    readonly tone: "error" | "building" | "ready" | "loading";
    readonly label: string;
}
/**
 * The status line describes the build on screen. A probe that failed while the Agent rewrote
 * the files, or for a build that a newer one has already replaced, says nothing about what to
 * do next, so building and a waiting new version take precedence over a failure.
 */
export declare function gamePreviewStatus(state: GamePreviewObservation): GamePreviewStatus;
/**
 * The preview runs on the other loopback alias (127.0.0.1 ↔ localhost) so its storage is
 * isolated from DSH. A `fetch` there is cross-site, and the route rightly refuses cross-site
 * reads, so the probe asks the same route on the page's own origin, which serves the same bytes.
 */
export declare function previewUrls(path: string, version: string, revision: number, origin: string): {
    readonly href: string;
    readonly probeHref: string;
    readonly isolated: boolean;
};
//# sourceMappingURL=game-preview-state.d.ts.map