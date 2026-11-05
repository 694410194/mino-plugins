import { ToolDefinition } from "@deepseek-ai/dsh-tools";
import { Context } from "@deepseek-ai/cordis";
import { ImageAttachmentRef } from "@deepseek-ai/dsh-attachment";
//#region src/config.d.ts
/**
 * dsh-drawio plugin config: which agent tools are exposed and rendering
 * defaults. Unlike dsh-devtoolbox (tools off by default), the drawio tools are
 * the point of the plugin — they ship on unless the user opts out.
 *
 * @module dsh-drawio/config
 */
/** All agent-visible tool ids. */
declare const TOOL_IDS: readonly ["drawio_validate", "drawio_render", "drawio_edit", "drawio_template"];
type ToolId = (typeof TOOL_IDS)[number];
interface Config {
  /** Tool ids the model may call; '*' exposes all, [] exposes none. */
  agentTools: ToolId[] | '*';
  /** PNG preview scale factor for drawio_render. */
  pngScale: number;
  /** Label font family list. */
  fontFamily: string;
}
/** Raw loader config (all fields optional). */
interface RawConfig {
  agentTools?: unknown;
  pngScale?: unknown;
  fontFamily?: unknown;
}
/** Apply defaults to the raw loader config. */
declare function resolveConfig(raw: RawConfig | undefined): Config;
//#endregion
//#region src/protocol.d.ts
/**
 * Shared wire vocabulary between the /dsh-drawio HTTP routes and the 画板
 * browser client (plain JSON — no typert machinery, matching how dsh-ssh and
 * dsh-aionui-panel talk to their panels).
 *
 * @module dsh-drawio/protocol
 */
/** One diagram file entry (list result). */
interface ListEntry {
  /** Workspace-relative path (forward slashes). */
  path: string;
  /** File name (basename). */
  name: string;
  /** Byte size. */
  size: number;
  /** mtime epoch millis. */
  mtime: number;
}
/** List one workspace directory for diagram files. */
interface ListRequest {
  /** Absolute project root (session cwd); must be inside a registered workspace. */
  root: string;
  /** Optional subdirectory ('' = root); recursive scan with a depth cap. */
  dir?: string;
}
/** List response body. */
interface ListResult {
  entries: ListEntry[];
  /** Total files found (after the scan cap). */
  truncated: boolean;
}
/** Read one diagram file. */
interface ReadRequest {
  root: string;
  path: string;
}
/** Read response body. */
interface ReadResult {
  content: string;
  mtime: number;
}
/** Save one diagram file (create/overwrite inside the workspace). */
interface SaveRequest {
  root: string;
  /** Workspace-relative destination path; must end in .drawio/.xml/.svg. */
  path: string;
  content: string;
}
/** Save response body. */
interface SaveResult {
  path: string;
  bytes: number;
  mtime: number;
}
/** One route response envelope. */
type DrawioEnvelope<T> = {
  ok: true;
  value: T;
} | {
  ok: false;
  error: {
    code: string;
    message: string;
  };
};
//#endregion
//#region src/service.d.ts
/** Diagram file extensions the board lists. */
declare const DIAGRAM_EXTENSIONS: Set<string>;
/** The gate verdict for one project root. */
type GateVerdict = {
  ok: true;
  canonical: string;
} | {
  ok: false;
  error: string;
};
/**
 * Normalize a path for prefix comparison: collapse Windows separators to `/`
 * and drop any trailing slash; on win32 compare case-insensitively.
 */
declare function normalizeForPrefix(value: string): string;
/** The canonical prefix check: child must live inside (or equal) the root. */
declare function isPathInside(root: string, child: string): boolean;
/**
 * Verify a project root: canonicalize and require membership in a registered
 * workspace.
 * @param ctx - context carrying the workspace registry.
 * @param root - the requested project root (session cwd).
 */
declare function verifyWorkspaceRoot(ctx: Context, root: string): Promise<GateVerdict>;
/** One workspace-gated operation result. */
type DrawioOpResult = {
  kind: 'list';
  value: {
    entries: ListEntry[];
    truncated: boolean;
  };
} | {
  kind: 'read';
  value: ReadResult;
} | {
  kind: 'save';
  value: SaveResult;
} | {
  kind: 'error';
  error: {
    code: string;
    message: string;
  };
};
/** The drawio workspace file service (plain service; no typert). */
declare class DrawioService {
  private readonly ctx;
  static inject: readonly [];
  /** @param ctx - cordis context. */
  constructor(ctx: Context);
  /** List diagram files under a workspace directory (recursive, depth-capped). */
  list(rootArg: string, dirArg: string | undefined): Promise<DrawioOpResult>;
  /** Read one diagram file's content. */
  read(rootArg: string, path: string): Promise<DrawioOpResult>;
  /**
   * Save one diagram file into the workspace. The content must parse as a
   * drawio document (unless the extension is .svg), so the board can never
   * persist garbage the renderer would choke on.
   */
  save(rootArg: string, path: string, content: string): Promise<DrawioOpResult>;
}
//#endregion
//#region src/routes.d.ts
/**
 * Register the /dsh-drawio routes (POST JSON operations).
 * @param ctx - context carrying the webServer service.
 * @param service - the gated filesystem service.
 * @returns the route disposer.
 */
declare function registerDrawioRoutes(ctx: Context, service: DrawioService): () => void;
//#endregion
//#region src/static.d.ts
/**
 * Serve one prefix from a directory on disk. Paths resolve inside `dir`
 * (after normalization; '..' and absolute escapes are rejected).
 */
declare function serveStaticDir(ctx: Context, prefix: string, dir: string): () => void;
//#endregion
//#region src/tools.d.ts
/** The tool result contract (validated against the output schema). */
interface DrawioToolResult {
  ok: boolean;
  action: string;
  source: string;
  diagrams: number;
  vertices: number;
  edges: number;
  issues: string[];
  files: string[];
  error?: string;
  /** drawio_edit: ops applied / failed. */
  applied?: number;
  failed?: number;
  /** PNG preview committed to the attachment store (chat image block). */
  preview?: ImageAttachmentRef;
}
declare const KIND_DESCRIPTIONS: {
  readonly flowchart: "process flow with decision diamonds and orthogonal arrows";
  readonly architecture: "system architecture: layers of service boxes with grouped containers";
  readonly network: "network topology: nodes, switches and a router cloud";
  readonly orgchart: "organization chart: hierarchy of manager/report boxes";
};
/** Generate a ready-to-edit mxfile for a diagram kind (exported for tests). */
declare function buildTemplate(kind: keyof typeof KIND_DESCRIPTIONS, name: string): string;
/** Human-readable summary of a tool result (chat text block). */
declare function renderResultText(result: DrawioToolResult): string;
/** Build the tool set for the resolved config. */
declare function buildAgentTools(ctx: Context, config: Config): ToolDefinition[];
//#endregion
//#region src/translate.d.ts
/**
 * dsh-drawio core translator: diagrams.net (mxfile) XML → SVG.
 *
 * Pure TypeScript, ZERO dependencies, no DOM, no Node built-ins — the exact
 * same module is bundled into the host half (agent tools, PNG rasterization)
 * and the browser half (the 画板 live preview). The renderer covers the
 * drawio feature envelope the agent skill teaches (and the common hand-made
 * subset): rectangles / rounded / ellipse / rhombus / hexagon / triangle /
 * cylinder / swimlane / text shapes, orthogonal & curved edges with explicit
 * waypoints, HTML labels (b/i/u/font/br/span), per-cell styles, groups and
 * edge labels.
 *
 * @module dsh-drawio/translate
 */
/** One parsed XML element. */
interface XmlNode {
  name: string;
  attrs: Record<string, string>;
  children: XmlNode[];
  /** Decoded text content ('' when none). */
  text: string;
}
/** Decode one XML text/attribute value (named + numeric entities). */
declare function decodeXmlEntities(value: string): string;
/** A small recursive-descent XML parser: elements, attributes, CDATA, comments, prolog. */
declare function parseXml(input: string): XmlNode;
/** A parsed mxGeometry. */
interface CellGeometry {
  x: number;
  y: number;
  width: number;
  height: number;
  relative?: boolean;
  /** Edge waypoints (absolute coordinates). */
  points?: Array<{
    x: number;
    y: number;
  }>;
  /** Edge label offset (mxPoint as="offset"). */
  offset?: {
    x: number;
    y: number;
  };
  /** Edge source/target anchor points (mxPoint as="sourcePoint"/"targetPoint"). */
  sourcePoint?: {
    x: number;
    y: number;
  };
  targetPoint?: {
    x: number;
    y: number;
  };
}
/** One parsed mxCell. */
interface Cell {
  id: string;
  parentId: string | null;
  vertex: boolean;
  edge: boolean;
  /** Decoded label text ('' when the cell has no label). */
  value: string;
  style: Record<string, string>;
  geometry: CellGeometry | null;
  sourceId: string | null;
  targetId: string | null;
  collapsed: boolean;
  children: Cell[];
}
/** One parsed diagram (mxfile → diagram → mxGraphModel). */
interface Diagram {
  name: string;
  id: string;
  background: string | null;
  dx: number;
  dy: number;
  /** Top-level cells (children of the layer cell). */
  cells: Cell[];
  byId: Map<string, Cell>;
  /** Non-fatal notes collected while parsing/rendering. */
  notes: string[];
}
/** Split a drawio style string into key/value pairs. */
declare function parseStyle(raw: string): Record<string, string>;
/**
 * Parse a drawio XML document (a full `<mxfile>` document, or a bare
 * `<mxGraphModel>`) into diagrams.
 *
 * @param xml - the file content.
 * @param inflate - optional inflater for compressed mxfiles
 *   (`compressed="true"`, base64 → deflate → utf8). The host passes a
 *   zlib-based inflater; the browser half inflates before calling. Without an
 *   inflater, compressed files produce a descriptive error.
 * @returns the parsed diagrams.
 */
declare function parseDiagrams(xml: string, inflate?: (base64: string) => string): Diagram[];
/** Absolute geometry of a vertex (parent offsets accumulated). */
interface AbsRect {
  x: number;
  y: number;
  width: number;
  height: number;
}
/** Resolve the absolute rect of a vertex cell, walking parent offsets. */
declare function absoluteRect(cell: Cell, diagram: Diagram): AbsRect | null;
/** Font flags: bold=1, italic=2, underline=4. */
interface FontFace {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  color: string;
  size: number;
  family: string;
}
/** Basic font face from a style map. */
declare function fontFromStyle(style: Record<string, string>, family: string): FontFace;
/** One styled text run. */
interface TextRun {
  text: string;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  color: string;
  size: number;
}
/**
 * Parse a drawio HTML label (the restricted HTML subset drawio stores:
 * b / i / u / font / br / span style / h1..h6 / p / a) into styled runs,
 * splitting on line breaks.
 */
declare function parseHtmlLabel(value: string, base: FontFace): TextRun[][];
/** Wrap one styled line into sub-lines fitting `maxWidth` (px). */
declare function wrapRuns(line: TextRun[], maxWidth: number, fontSize: number): TextRun[][];
/** Total advance width of a run list (px). */
declare function runWidth(runs: TextRun[], baseSize?: number): number;
/** Total line height for a set of wrapped lines (px). */
declare function linesHeight(lines: TextRun[][], fontSize: number): number;
interface RenderOptions {
  /** Font fallback list (CSS font-family). */
  fontFamily?: string;
  /** Padding around the content bounds (default 24). */
  padding?: number;
  /** Render the page background color when the model declares one. */
  background?: boolean;
}
/** Escape text for XML attribute/text content. */
declare function xmlEscape(value: string): string;
/**
 * Render one diagram to an SVG document string.
 *
 * @param diagram - parsed diagram.
 * @param options - rendering options.
 * @returns the SVG markup (standalone document with a viewBox).
 */
declare function diagramToSvg(diagram: Diagram, options?: RenderOptions): string;
//#endregion
//#region src/edit.d.ts
/** One geometry/point pair. */
interface EditPoint {
  x: number;
  y: number;
}
/** A cell-level edit operation. */
type EditOp = {
  op: 'upsert_vertex';
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  value?: string;
  style?: string;
} | {
  op: 'upsert_edge';
  id: string;
  source: string;
  target: string;
  value?: string;
  style?: string;
  points?: EditPoint[];
} | {
  op: 'delete';
  id: string;
} | {
  op: 'update_style';
  id: string;
  style: string;
} | {
  op: 'update_value';
  id: string;
  value: string;
} | {
  op: 'move';
  id: string;
  dx: number;
  dy: number;
} | {
  op: 'resize';
  id: string;
  w: number;
  h: number;
};
/** The outcome of applying one op. */
interface EditOpResult {
  op: EditOp;
  ok: boolean;
  message?: string;
}
/** The outcome of an edit pass. */
interface EditResult {
  xml: string;
  applied: EditOpResult[];
  failed: number;
}
/** Serialize one XML node back to markup (attribute order preserved). */
declare function serializeXml(node: XmlNode): string;
/**
 * Apply a list of operations to a drawio document.
 *
 * @param xml - the .drawio/.xml file content.
 * @param ops - the cell-level operations (applied in order).
 * @returns the edited document plus per-op results.
 */
declare function applyEditOps(xml: string, ops: EditOp[]): EditResult;
//#endregion
//#region src/raster.d.ts
interface RasterResult {
  png: Uint8Array;
  width: number;
  height: number;
}
/**
 * Rasterize an SVG document to PNG bytes.
 *
 * @param svg - the SVG markup.
 * @param scale - width multiplier (2 = double resolution).
 * @returns PNG bytes plus the intrinsic pixel size.
 */
declare function svgToPng(svg: string, scale?: number): Promise<RasterResult>;
/**
 * Commit PNG bytes into the harness attachment store, returning a durable
 * reference that conversation UIs can render.
 *
 * @param ctx - context carrying the attachment service.
 * @param png - PNG bytes.
 * @param name - optional display name.
 */
declare function savePngAttachment(ctx: Context, png: Uint8Array, name?: string): Promise<ImageAttachmentRef>;
//#endregion
//#region src/index.d.ts
declare const name = "dsh-drawio";
/** Hard services: the tool registry + workspace registry + web server. */
declare const inject: string[];
/**
 * Mount the drawio plugin: the /dsh-drawio routes (board file ops) and the
 * agent tools (config-gated exposure).
 *
 * @param ctx - context carrying tools + workspaceRegistry + webServer + loader.
 * @param config - raw loader config; defaults applied through {@link resolveConfig}.
 */
declare function apply(ctx: Context, config: Config): Promise<void>;
//#endregion
export { AbsRect, Cell, CellGeometry, type Config, DIAGRAM_EXTENSIONS, Diagram, type DrawioEnvelope, DrawioService, type EditOp, type EditOpResult, type EditPoint, type EditResult, FontFace, type ListEntry, type ListRequest, type ListResult, type ReadRequest, type ReadResult, RenderOptions, type SaveRequest, type SaveResult, TextRun, XmlNode, absoluteRect, apply, applyEditOps, buildAgentTools, buildTemplate, decodeXmlEntities, diagramToSvg, fontFromStyle, inject, isPathInside, linesHeight, name, normalizeForPrefix, parseDiagrams, parseHtmlLabel, parseStyle, parseXml, registerDrawioRoutes, renderResultText, resolveConfig, runWidth, savePngAttachment, serializeXml, serveStaticDir, svgToPng, verifyWorkspaceRoot, wrapRuns, xmlEscape };