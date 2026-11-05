import { fileURLToPath } from "node:url";
import { mkdir, readFile, readdir, realpath, stat, writeFile } from "node:fs/promises";
import { dirname, extname, isAbsolute, join, normalize, resolve, sep } from "node:path";
import { createReadStream } from "node:fs";
import { defineTool } from "@deepseek-ai/dsh-tools";
//#region src/config.ts
/**
* dsh-drawio plugin config: which agent tools are exposed and rendering
* defaults. Unlike dsh-devtoolbox (tools off by default), the drawio tools are
* the point of the plugin — they ship on unless the user opts out.
*
* @module dsh-drawio/config
*/
/** All agent-visible tool ids. */
const TOOL_IDS = [
	"drawio_validate",
	"drawio_render",
	"drawio_edit",
	"drawio_template"
];
const DEFAULT_FONT_FAMILY = "Helvetica, Arial, 'PingFang SC', 'Microsoft YaHei', sans-serif";
/** Apply defaults to the raw loader config. */
function resolveConfig(raw) {
	const agentTools = raw?.agentTools;
	return {
		agentTools: agentTools === "*" ? "*" : Array.isArray(agentTools) ? agentTools.filter((id) => TOOL_IDS.includes(id)) : [...TOOL_IDS],
		pngScale: typeof raw?.pngScale === "number" && Number.isFinite(raw.pngScale) ? Math.max(.5, Math.min(8, raw.pngScale)) : 2,
		fontFamily: typeof raw?.fontFamily === "string" && raw.fontFamily !== "" ? raw.fontFamily : DEFAULT_FONT_FAMILY
	};
}
/** Whether a tool id is exposed by the config. */
function exposed(config, id) {
	return config.agentTools === "*" || config.agentTools.includes(id);
}
//#endregion
//#region src/translate.ts
const ENTITIES = {
	amp: "&",
	lt: "<",
	gt: ">",
	quot: "\"",
	apos: "'",
	nbsp: "\xA0"
};
/** Decode one XML text/attribute value (named + numeric entities). */
function decodeXmlEntities(value) {
	if (value.indexOf("&") === -1) return value;
	return value.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z][a-zA-Z0-9]*);/g, (match, body) => {
		if (body.startsWith("#x") || body.startsWith("#X")) {
			const code = Number.parseInt(body.slice(2), 16);
			return Number.isFinite(code) ? String.fromCodePoint(code) : match;
		}
		if (body.startsWith("#")) {
			const code = Number.parseInt(body.slice(1), 10);
			return Number.isFinite(code) ? String.fromCodePoint(code) : match;
		}
		return ENTITIES[body] ?? match;
	});
}
/** A small recursive-descent XML parser: elements, attributes, CDATA, comments, prolog. */
function parseXml(input) {
	const src = input.replace(/^\uFEFF/, "");
	let pos = 0;
	const error = (message) => {
		const line = src.slice(0, pos).split("\n").length;
		throw new Error(`XML parse error at line ${line}: ${message}`);
	};
	const skipMisc = () => {
		for (;;) {
			while (pos < src.length && /\s/.test(src[pos] ?? "")) pos += 1;
			if (src.startsWith("<?", pos)) {
				const end = src.indexOf("?>", pos + 2);
				if (end === -1) error("unterminated processing instruction");
				pos = end + 2;
				continue;
			}
			if (src.startsWith("<!--", pos)) {
				const end = src.indexOf("-->", pos + 4);
				if (end === -1) error("unterminated comment");
				pos = end + 3;
				continue;
			}
			if (src.startsWith("<!DOCTYPE", pos) || src.startsWith("<!doctype", pos)) {
				let depth = 0;
				for (;;) {
					const ch = src[pos];
					if (ch === void 0) error("unterminated doctype");
					if (ch === "<") depth += 1;
					if (ch === ">" && depth === 1) {
						pos += 1;
						break;
					}
					if (ch === ">") depth -= 1;
					pos += 1;
				}
				continue;
			}
			break;
		}
	};
	const readName = () => {
		const start = pos;
		while (pos < src.length && /[A-Za-z0-9_:.-]/.test(src[pos] ?? "")) pos += 1;
		if (pos === start) error("expected a name");
		return src.slice(start, pos);
	};
	const skipSpace = () => {
		while (pos < src.length && /\s/.test(src[pos] ?? "")) pos += 1;
	};
	const readAttrs = () => {
		const attrs = {};
		for (;;) {
			skipSpace();
			const ch = src[pos];
			if (ch === void 0 || ch === ">" || ch === "/") return attrs;
			const name = readName();
			skipSpace();
			if (src[pos] !== "=") error(`attribute ${name} missing '='`);
			pos += 1;
			skipSpace();
			const quote = src[pos];
			if (quote !== "\"" && quote !== "'") error(`attribute ${name} missing quote`);
			pos += 1;
			const start = pos;
			while (pos < src.length && src[pos] !== quote) pos += 1;
			if (src[pos] !== quote) error(`unterminated attribute ${name}`);
			attrs[name] = decodeXmlEntities(src.slice(start, pos));
			pos += 1;
		}
	};
	const parseElement = () => {
		if (src[pos] !== "<") error("expected element");
		pos += 1;
		if (src.startsWith("![CDATA[", pos)) {
			const end = src.indexOf("]]>", pos + 9);
			if (end === -1) error("unterminated CDATA");
			const text = src.slice(pos + 9, end);
			pos = end + 3;
			return {
				name: "#cdata",
				attrs: {},
				children: [],
				text
			};
		}
		const name = readName();
		const attrs = readAttrs();
		if (src.startsWith("/>", pos)) {
			pos += 2;
			return {
				name,
				attrs,
				children: [],
				text: ""
			};
		}
		if (src[pos] !== ">") error(`malformed open tag <${name}>`);
		pos += 1;
		const children = [];
		let text = "";
		for (;;) {
			if (pos >= src.length) error(`unclosed element <${name}>`);
			if (src.startsWith("</", pos)) {
				pos += 2;
				const closeName = readName();
				skipSpace();
				if (src[pos] !== ">") error("malformed close tag");
				pos += 1;
				if (closeName !== name) error(`mismatched close tag </${closeName}> for <${name}>`);
				return {
					name,
					attrs,
					children,
					text
				};
			}
			if (src.startsWith("<![CDATA[", pos)) {
				const node = parseElement();
				children.push(node);
				text += node.text;
				continue;
			}
			if (src.startsWith("<!--", pos)) {
				const end = src.indexOf("-->", pos + 4);
				if (end === -1) error("unterminated comment");
				pos = end + 3;
				continue;
			}
			if (src[pos] === "<") {
				children.push(parseElement());
				continue;
			}
			const start = pos;
			while (pos < src.length && src[pos] !== "<") pos += 1;
			text += decodeXmlEntities(src.slice(start, pos));
		}
	};
	skipMisc();
	const root = parseElement();
	skipMisc();
	return root;
}
/** Split a drawio style string into key/value pairs. */
function parseStyle(raw) {
	const out = {};
	if (raw === "") return out;
	for (const part of raw.split(";")) {
		if (part === "") continue;
		const eq = part.indexOf("=");
		if (eq === -1) out[part] = "1";
		else out[part.slice(0, eq)] = part.slice(eq + 1);
	}
	return out;
}
const toNumber = (value, fallback) => {
	if (value === void 0 || value === "") return fallback;
	const n = Number(value);
	return Number.isFinite(n) ? n : fallback;
};
/** Index every cell into a flat map; return the renderable cells (all except layer markers). */
function indexDiagram(root, notes) {
	const byId = /* @__PURE__ */ new Map();
	const visit = (node, parentId) => {
		if (node.name !== "mxCell") {
			for (const child of node.children) visit(child, parentId);
			return null;
		}
		const attrs = node.attrs;
		const cell = {
			id: attrs.id ?? "",
			parentId: attrs.parent ?? parentId,
			vertex: attrs.vertex === "1",
			edge: attrs.edge === "1",
			value: attrs.value === void 0 ? "" : decodeXmlEntities(attrs.value),
			style: parseStyle(attrs.style ?? ""),
			geometry: null,
			sourceId: attrs.source ?? null,
			targetId: attrs.target ?? null,
			collapsed: attrs.collapsed === "1",
			children: []
		};
		for (const child of node.children) if (child.name === "mxGeometry") {
			const geometry = {
				x: toNumber(child.attrs.x, 0),
				y: toNumber(child.attrs.y, 0),
				width: toNumber(child.attrs.width, 0),
				height: toNumber(child.attrs.height, 0),
				relative: child.attrs.relative === "1"
			};
			for (const gp of child.children) {
				if (gp.name !== "mxPoint") continue;
				const as = gp.attrs.as;
				const point = {
					x: toNumber(gp.attrs.x, 0),
					y: toNumber(gp.attrs.y, 0)
				};
				if (as === "offset") geometry.offset = point;
				else if (as === "sourcePoint") geometry.sourcePoint = point;
				else if (as === "targetPoint") geometry.targetPoint = point;
				else (geometry.points ??= []).push(point);
			}
			cell.geometry = geometry;
		} else if (child.name === "mxCell") {
			const sub = visit(child, cell.id);
			if (sub !== null) cell.children.push(sub);
		}
		if (cell.id === "") {
			notes.push("found a cell without id; skipped");
			return null;
		}
		byId.set(cell.id, cell);
		return cell;
	};
	for (const child of root.children) visit(child, null);
	const isLayer = (cell) => cell.parentId === null || cell.parentId === "0" || cell.id === "0";
	return {
		cells: [...byId.values()].filter((cell) => !isLayer(cell)),
		byId
	};
}
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
function parseDiagrams(xml, inflate) {
	const root = parseXml(xml);
	const notes = [];
	if (root.name === "mxGraphModel") return [buildDiagram(root, "diagram", "", notes)];
	if (root.name !== "mxfile") throw new Error(`not a drawio file: expected <mxfile> or <mxGraphModel>, found <${root.name}>`);
	const diagrams = [];
	for (const node of root.children) {
		if (node.name !== "diagram") continue;
		let modelRoot = null;
		if (root.attrs.compressed === "true" || root.attrs.compressed === "1") {
			const raw = (node.text + node.children.map((c) => c.text).join("")).trim();
			if (raw === "") {
				notes.push("compressed diagram with empty payload; skipped");
				continue;
			}
			if (inflate === void 0) throw new Error("compressed drawio file: an inflater is required");
			modelRoot = parseXml(inflate(raw));
		} else {
			modelRoot = findModel(node);
			if (modelRoot === null) {
				notes.push(`diagram "${node.attrs.name ?? ""}" contains no mxGraphModel; skipped`);
				continue;
			}
		}
		diagrams.push(buildDiagram(modelRoot, node.attrs.name ?? "diagram", node.attrs.id ?? "", notes));
	}
	if (diagrams.length === 0) throw new Error("no parseable diagram found in the mxfile");
	return diagrams;
}
function findModel(node) {
	if (node.name === "mxGraphModel") return node;
	for (const child of node.children) {
		const found = findModel(child);
		if (found !== null) return found;
	}
	return null;
}
function buildDiagram(modelRoot, name, id, notes) {
	const { cells, byId } = indexDiagram(modelRoot, notes);
	const dx = toNumber(modelRoot.attrs.dx, 0);
	const dy = toNumber(modelRoot.attrs.dy, 0);
	return {
		name,
		id,
		background: modelRoot.attrs.background ?? null,
		dx,
		dy,
		cells,
		byId,
		notes
	};
}
/** Resolve the absolute rect of a vertex cell, walking parent offsets. */
function absoluteRect(cell, diagram) {
	if (!cell.vertex || cell.geometry === null) return null;
	let x = cell.geometry.x;
	let y = cell.geometry.y;
	const w = cell.geometry.width;
	const h = cell.geometry.height;
	let cursor = cell;
	let guard = 0;
	while (cursor.parentId !== null && cursor.parentId !== void 0 && guard < 64) {
		const parent = diagram.byId.get(cursor.parentId);
		if (parent === void 0) break;
		if (parent.edge) break;
		if (parent.vertex && parent.geometry !== null && !parent.collapsed) {
			x += parent.geometry.x;
			y += parent.geometry.y;
		}
		cursor = parent;
		guard += 1;
	}
	return {
		x,
		y,
		width: w,
		height: h
	};
}
const stNum = (style, key, fallback) => {
	const raw = style[key];
	if (raw === void 0 || raw === "") return fallback;
	const n = Number(raw);
	return Number.isFinite(n) ? n : fallback;
};
const stStr = (style, key, fallback) => {
	const raw = style[key];
	return raw === void 0 || raw === "" ? fallback : raw;
};
/** Basic font face from a style map. */
function fontFromStyle(style, family) {
	const flags = stNum(style, "fontStyle", 0);
	return {
		bold: (flags & 1) !== 0,
		italic: (flags & 2) !== 0,
		underline: (flags & 4) !== 0,
		color: stStr(style, "fontColor", "#000000"),
		size: stNum(style, "fontSize", 12),
		family: stStr(style, "fontFamily", family)
	};
}
/**
* Parse a drawio HTML label (the restricted HTML subset drawio stores:
* b / i / u / font / br / span style / h1..h6 / p / a) into styled runs,
* splitting on line breaks.
*/
function parseHtmlLabel(value, base) {
	const lines = [[]];
	const stack = [];
	let current = { ...base };
	const pushText = (text) => {
		if (text === "") return;
		const run = {
			text,
			bold: current.bold,
			italic: current.italic,
			underline: current.underline,
			color: current.color,
			size: current.size
		};
		const line = lines[lines.length - 1];
		const prev = line[line.length - 1];
		if (prev !== void 0 && prev.bold === run.bold && prev.italic === run.italic && prev.underline === run.underline && prev.color === run.color && prev.size === run.size) prev.text += text;
		else line.push(run);
	};
	const newline = () => {
		if (lines[lines.length - 1].length === 0) lines[lines.length - 1].push({
			...current,
			text: " "
		});
		lines.push([]);
	};
	/** Push a style frame; returns the frame to pop on the closing tag. */
	const open = (frame) => {
		stack.push(frame);
		if (frame.bold === true) current = {
			...current,
			bold: true
		};
		if (frame.italic === true) current = {
			...current,
			italic: true
		};
		if (frame.underline === true) current = {
			...current,
			underline: true
		};
		if (frame.color !== void 0) current = {
			...current,
			color: frame.color
		};
		if (frame.size !== void 0) current = {
			...current,
			size: frame.size
		};
	};
	const close = () => {
		const frame = stack.pop();
		if (frame === void 0) return;
		if (frame.bold === true) current = {
			...current,
			bold: false
		};
		if (frame.italic === true) current = {
			...current,
			italic: false
		};
		if (frame.underline === true) current = {
			...current,
			underline: false
		};
		if (frame.color !== void 0) current = {
			...current,
			color: base.color
		};
		if (frame.size !== void 0) current = {
			...current,
			size: base.size
		};
	};
	let i = 0;
	const src = value;
	while (i < src.length) {
		const ch = src[i];
		if (ch === "<") {
			const closeIdx = src.indexOf(">", i);
			if (closeIdx === -1) {
				pushText(src.slice(i));
				break;
			}
			const tag = src.slice(i + 1, closeIdx);
			const lower = tag.toLowerCase();
			if (lower === "br" || lower === "/p" || lower === "/div" || lower === "/h1" || lower === "/h2" || lower === "/h3" || lower === "/h4" || lower === "/li" || lower === "/tr") newline();
			else if (lower === "b" || lower === "strong") open({ bold: true });
			else if (lower === "i" || lower === "em") open({ italic: true });
			else if (lower === "u") open({ underline: true });
			else if (lower.startsWith("font")) {
				const frame = {};
				const color = /color\s*=\s*["']?([^"'\s>]+)/i.exec(tag);
				if (color !== null) frame.color = color[1];
				const size = /size\s*=\s*["']?([0-9]+)/i.exec(tag);
				if (size !== null) {
					const n = Number(size[1]);
					if (Number.isFinite(n)) frame.size = n;
				}
				open(frame);
			} else if (lower.startsWith("span")) {
				const frame = {};
				const styleMatch = /style\s*=\s*["']([^"']+)["']/i.exec(tag);
				if (styleMatch !== null) {
					const css = styleMatch[1];
					if (/font-weight\s*:\s*(bold|[6-9]00)/i.test(css)) frame.bold = true;
					if (/font-style\s*:\s*italic/i.test(css)) frame.italic = true;
					if (/text-decoration\s*:\s*underline/i.test(css)) frame.underline = true;
					const color = /color\s*:\s*(#[0-9a-fA-F]{3,8}|[a-zA-Z]+)/i.exec(css);
					if (color !== null) frame.color = color[1];
					const fontSize = /font-size\s*:\s*([0-9.]+)px/i.exec(css);
					if (fontSize !== null) {
						const n = Number(fontSize[1]);
						if (Number.isFinite(n)) frame.size = n;
					}
				}
				open(frame);
			} else if (lower.startsWith("a ")) open({});
			else if (/^h[1-6]$/.test(lower)) {
				const level = Number(lower[1]);
				open({
					size: Math.max(10, Math.round(base.size * (level <= 2 ? 1.4 : level === 3 ? 1.2 : 1.05))),
					bold: true
				});
			} else if (lower.startsWith("/b") || lower.startsWith("/strong") || lower.startsWith("/i") || lower.startsWith("/em") || lower.startsWith("/u") || lower.startsWith("/font") || lower.startsWith("/span") || lower.startsWith("/a") || /^\/h[1-6]$/.test(lower)) close();
			i = closeIdx + 1;
			continue;
		}
		if (ch === "&") {
			const semi = src.indexOf(";", i);
			if (semi !== -1 && semi - i < 12) {
				pushText(decodeXmlEntities(src.slice(i, semi + 1)));
				i = semi + 1;
				continue;
			}
		}
		pushText(ch ?? "");
		i += 1;
	}
	return lines;
}
/** Rough advance width of one character in em units (CJK ≈ 1.0, ASCII ≈ 0.55). */
function charAdvance(ch) {
	const code = ch.codePointAt(0) ?? 0;
	if (code >= 32 && code <= 126) return .55;
	if (code >= 11904 && code <= 40959 || code >= 63744 && code <= 64255 || code >= 65280 && code <= 65519) return 1;
	if (code >= 8192 && code <= 8303) return .55;
	return .8;
}
/** Wrap one styled line into sub-lines fitting `maxWidth` (px). */
function wrapRuns(line, maxWidth, fontSize) {
	if (maxWidth <= 0 || !Number.isFinite(maxWidth)) return [line];
	const out = [];
	let currentRow = [];
	let rowWidth = 0;
	const flush = () => {
		if (currentRow.length > 0) {
			out.push(currentRow);
			currentRow = [];
			rowWidth = 0;
		}
	};
	for (const run of line) {
		const size = run.size > 0 ? run.size : fontSize;
		let seg = "";
		let segWidth = 0;
		const flushSeg = () => {
			if (seg === "") return;
			if (rowWidth + segWidth > maxWidth && rowWidth > 0) flush();
			currentRow.push({
				...run,
				text: seg
			});
			rowWidth += segWidth;
			seg = "";
			segWidth = 0;
		};
		for (const ch of Array.from(run.text)) {
			const w = charAdvance(ch) * size;
			if (ch === " " && rowWidth + segWidth + w > maxWidth && rowWidth > 0) {
				flushSeg();
				flush();
				continue;
			}
			if (rowWidth + segWidth + w > maxWidth && rowWidth + segWidth > 0) {
				flushSeg();
				flush();
			}
			seg += ch;
			segWidth += w;
		}
		flushSeg();
	}
	flush();
	return out.length > 0 ? out : [line];
}
/** Total advance width of a run list (px). */
function runWidth(runs, baseSize = 12) {
	let width = 0;
	for (const run of runs) {
		const size = run.size > 0 ? run.size : baseSize;
		for (const ch of Array.from(run.text)) width += charAdvance(ch) * size;
	}
	return width;
}
/** Total line height for a set of wrapped lines (px). */
function linesHeight(lines, fontSize) {
	if (lines.length === 0) return fontSize * 1.2;
	let height = 0;
	for (const line of lines) {
		let size = fontSize;
		for (const run of line) if (run.size > 0) size = Math.max(size, run.size);
		height += size * 1.2;
	}
	return height;
}
/** Escape text for XML attribute/text content. */
function xmlEscape(value) {
	return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("\"", "&quot;");
}
const svg = (parts, ...values) => parts.map((part, index) => part + (values[index] ?? "")).join("");
/**
* Render one diagram to an SVG document string.
*
* @param diagram - parsed diagram.
* @param options - rendering options.
* @returns the SVG markup (standalone document with a viewBox).
*/
function diagramToSvg(diagram, options = {}) {
	const family = options.fontFamily ?? "Helvetica, Arial, 'PingFang SC', 'Microsoft YaHei', sans-serif";
	const padding = options.padding ?? 24;
	const dx = diagram.dx;
	const dy = diagram.dy;
	const vertices = [];
	const edges = [];
	for (const cell of diagram.cells) {
		if (cell.edge) {
			const geom = cell.geometry;
			if (geom === null) continue;
			let labelOffset = geom.offset ?? {
				x: 0,
				y: 0
			};
			for (const child of cell.children) if (child.vertex && child.geometry !== null) labelOffset = child.geometry.offset ?? {
				x: child.geometry.x,
				y: child.geometry.y
			};
			edges.push({
				cell,
				points: geom.points ?? [],
				labelOffset,
				sourceRect: cell.sourceId === null ? null : absoluteRectOf(diagram.byId.get(cell.sourceId), diagram),
				targetRect: cell.targetId === null ? null : absoluteRectOf(diagram.byId.get(cell.targetId), diagram)
			});
			continue;
		}
		if (!cell.vertex || cell.collapsed) continue;
		if (cell.parentId !== null && diagram.byId.get(cell.parentId)?.edge === true) continue;
		const abs = absoluteRect(cell, diagram);
		if (abs !== null) vertices.push({
			cell,
			abs
		});
	}
	let minX = Infinity;
	let minY = Infinity;
	let maxX = -Infinity;
	let maxY = -Infinity;
	const extend = (x, y) => {
		if (x < minX) minX = x;
		if (y < minY) minY = y;
		if (x > maxX) maxX = x;
		if (y > maxY) maxY = y;
	};
	for (const { abs } of vertices) {
		extend(abs.x + dx, abs.y + dy);
		extend(abs.x + abs.width + dx, abs.y + abs.height + dy);
	}
	for (const edge of edges) {
		for (const p of edge.points) extend(p.x + dx, p.y + dy);
		const geom = edge.cell.geometry;
		if (geom !== null) {
			if (geom.sourcePoint !== void 0) extend(geom.sourcePoint.x + dx, geom.sourcePoint.y + dy);
			if (geom.targetPoint !== void 0) extend(geom.targetPoint.x + dx, geom.targetPoint.y + dy);
		}
	}
	if (!Number.isFinite(minX)) {
		minX = 0;
		minY = 0;
		maxX = 100;
		maxY = 100;
	}
	const viewX = minX - padding;
	const viewY = minY - padding;
	const viewW = maxX - minX + padding * 2;
	const viewH = maxY - minY + padding * 2;
	const parts = [];
	parts.push(svg`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewX} ${viewY} ${viewW} ${viewH}" font-family="${xmlEscape(family)}">`);
	if (options.background !== false && diagram.background !== null && diagram.background !== "none" && diagram.background !== "") {
		const bg = diagram.background;
		if (/^(#[0-9a-fA-F]{3,8}|rgb\(|rgba\(|hsl\(|hsla\(|[a-zA-Z]+)$/.test(bg)) parts.push(svg`<rect x="${viewX}" y="${viewY}" width="${viewW}" height="${viewH}" fill="${xmlEscape(bg)}"/>`);
	}
	for (const edge of edges) renderEdge(edge, parts, dx, dy, family);
	for (const { cell, abs } of vertices) renderVertex(cell, abs, parts, dx, dy, family);
	parts.push("</svg>");
	return parts.join("");
}
function absoluteRectOf(cell, diagram) {
	if (cell === void 0 || !cell.vertex) return null;
	return absoluteRect(cell, diagram);
}
/** Resolve the drawio shape: explicit `shape=` wins; bare style flags follow. */
function resolveShape(style) {
	if (style.shape !== void 0 && style.shape !== "") return style.shape;
	for (const bare of [
		"rounded",
		"ellipse",
		"rhombus",
		"hexagon",
		"triangle",
		"cylinder",
		"cylinder3",
		"swimlane",
		"text",
		"image",
		"actor",
		"process",
		"parallelogram",
		"cloud"
	]) if (style[bare] === "1") return bare;
	return "rectangle";
}
function renderVertex(cell, abs, parts, dx, dy, family) {
	const style = cell.style;
	const shape = resolveShape(style);
	const x = abs.x + dx;
	const y = abs.y + dy;
	const w = abs.width;
	const h = abs.height;
	const fill = stStr(style, "fillColor", shape === "swimlane" ? "#dae8fc" : "#ffffff");
	const stroke = stStr(style, "strokeColor", "#000000");
	const strokeWidth = stNum(style, "strokeWidth", 1);
	const opacity = stNum(style, "opacity", 100);
	const dashed = style.dashed === "1";
	const font = fontFromStyle(style, family);
	const group = [];
	const opacityAttr = opacity < 100 ? ` opacity="${opacity / 100}"` : "";
	const dashAttr = dashed ? ` stroke-dasharray="${Math.max(3, strokeWidth * 2)} ${Math.max(3, strokeWidth * 2)}"` : "";
	const common = (d) => {
		group.push(svg`<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"${opacityAttr}${dashAttr}/>`);
	};
	switch (shape) {
		case "rounded":
			common(roundedRectPath(x, y, w, h, stNum(style, "arcSize", 10) / 100 * Math.min(w, h) / 2));
			break;
		case "ellipse":
			common(svg`M ${x + w / 2} ${y} A ${w / 2} ${h / 2} 0 1 1 ${x + w / 2} ${y + h} A ${w / 2} ${h / 2} 0 1 1 ${x + w / 2} ${y} Z`);
			break;
		case "rhombus":
			common(svg`M ${x + w / 2} ${y} L ${x + w} ${y + h / 2} L ${x + w / 2} ${y + h} L ${x} ${y + h / 2} Z`);
			break;
		case "hexagon":
			common(svg`M ${x + w / 2} ${y} L ${x + w} ${y + h * .25} L ${x + w} ${y + h * .75} L ${x + w / 2} ${y + h} L ${x} ${y + h * .75} L ${x} ${y + h * .25} Z`);
			break;
		case "triangle":
			common(svg`M ${x + w / 2} ${y} L ${x + w} ${y + h} L ${x} ${y + h} Z`);
			break;
		case "cylinder":
		case "cylinder3": {
			const rx = Math.min(w / 2, h * .18);
			group.push(svg`<path d="M ${x} ${y + rx} L ${x} ${y + h - rx} A ${w / 2} ${rx} 0 0 0 ${x + w} ${y + h - rx} L ${x + w} ${y + rx} A ${w / 2} ${rx} 0 0 1 ${x} ${y + rx} Z" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"${opacityAttr}${dashAttr}/>`);
			group.push(svg`<ellipse cx="${x + w / 2}" cy="${y + rx}" rx="${w / 2}" ry="${rx}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"${opacityAttr}/>`);
			break;
		}
		case "process":
			common(svg`M ${x} ${y} L ${x + w} ${y} L ${x + w} ${y + h} L ${x} ${y + h} Z`);
			break;
		case "swimlane": {
			const headerH = Math.min(Math.max(stNum(style, "fontSize", 12) * 2.2, 24), h * .55);
			const bodyFill = stStr(style, "swimlaneFillColor", "#ffffff");
			group.push(svg`<path d="${roundedRectPath(x, y, w, headerH, Math.min(8, w / 2, headerH / 2), false)}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"/>`);
			group.push(svg`<path d="M ${x} ${y + headerH} L ${x + w} ${y + headerH} L ${x + w} ${y + h} L ${x} ${y + h} Z" fill="${bodyFill}" stroke="${stroke}" stroke-width="${strokeWidth}"/>`);
			if (cell.value !== "") {
				const headerFont = {
					...font,
					bold: true
				};
				group.push(renderLabelText(cell.value, {
					x: x + w / 2,
					y: y + headerH / 2
				}, headerFont, "center", "middle", w - 8, 0, false));
			}
			break;
		}
		case "text":
			if (cell.value !== "") {
				const align = stStr(style, "align", "center");
				group.push(renderLabelText(cell.value, {
					x,
					y: y + stNum(style, "fontSize", 12) * .8
				}, font, align, "top", w, 0, false));
			}
			break;
		case "image":
			group.push(svg`<path d="${roundedRectPath(x, y, w, h, 4)}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-dasharray="4 3"/>`);
			if (cell.value !== "") {
				const align = stStr(style, "align", "center");
				group.push(renderLabelText(cell.value, {
					x: x + w / 2,
					y: y + h + 12
				}, font, align, "top", Math.max(120, w), 0, false));
			}
			break;
		default: common(svg`M ${x} ${y} L ${x + w} ${y} L ${x + w} ${y + h} L ${x} ${y + h} Z`);
	}
	if (shape !== "swimlane" && shape !== "text" && shape !== "image" && cell.value !== "") {
		const align = stStr(style, "align", "center");
		const valign = stStr(style, "verticalAlign", "middle");
		const wrap = style.whiteSpace === "wrap";
		const spacing = stNum(style, "spacing", 0);
		const labelPad = Math.max(4, spacing);
		const contentW = Math.max(0, w - labelPad * 2);
		const contentH = Math.max(0, h - labelPad * 2);
		const anchorX = align === "left" ? x + labelPad : align === "right" ? x + w - labelPad : x + w / 2;
		const anchorY = valign === "top" ? y + labelPad : valign === "bottom" ? y + h - labelPad : y + h / 2;
		group.push(renderLabelText(cell.value, {
			x: anchorX,
			y: anchorY
		}, font, align, valign, contentW, contentH, wrap));
	}
	if (group.length > 0) parts.push(svg`<g>${group.join("")}</g>`);
}
/** Rounded-rect path (drawio arcSize semantics). */
function roundedRectPath(x, y, w, h, rx, bottom = true) {
	const r = Math.max(0, Math.min(rx, w / 2, h / 2));
	if (r === 0) return `M ${x} ${y} L ${x + w} ${y} L ${x + w} ${y + h} L ${x} ${y + h} Z`;
	if (bottom) return `M ${x + r} ${y} L ${x + w - r} ${y} A ${r} ${r} 0 0 1 ${x + w} ${y + r} L ${x + w} ${y + h - r} A ${r} ${r} 0 0 1 ${x + w - r} ${y + h} L ${x + r} ${y + h} A ${r} ${r} 0 0 1 ${x} ${y + h - r} L ${x} ${y + r} A ${r} ${r} 0 0 1 ${x + r} ${y} Z`;
	return `M ${x + r} ${y} L ${x + w - r} ${y} A ${r} ${r} 0 0 1 ${x + w} ${y + r} L ${x + w} ${y + h} L ${x} ${y + h} L ${x} ${y + r} A ${r} ${r} 0 0 1 ${x + r} ${y} Z`;
}
/** Render a label (plain or HTML) as one <text> per line, tspans per run. */
function renderLabelText(value, anchor, font, align, valign, maxWidth, maxHeight, wrap) {
	const rawLines = parseHtmlLabel(value, font);
	const fontSize = font.size;
	const textAnchor = align === "left" ? "start" : align === "right" ? "end" : "middle";
	const wrapped = wrap ? rawLines.flatMap((line) => wrapRuns(line, maxWidth, fontSize)) : rawLines;
	const height = linesHeight(wrapped, fontSize);
	let baseY;
	if (valign === "top") baseY = anchor.y + fontSize * .8;
	else if (valign === "bottom") baseY = anchor.y - (height - fontSize * .8);
	else baseY = anchor.y - height / 2 + fontSize * .8;
	const lines = [];
	let lineY = baseY;
	for (const line of wrapped) {
		const width = runWidth(line, fontSize);
		const anchorX = align === "left" ? anchor.x : align === "right" ? anchor.x - width : anchor.x - width / 2;
		const runs = [];
		let cursor = 0;
		let size = fontSize;
		for (const run of line) {
			size = run.size > 0 ? run.size : fontSize;
			const runStyle = `${run.bold ? " font-weight=\"600\"" : ""}${run.italic ? " font-style=\"italic\"" : ""}${run.underline ? " text-decoration=\"underline\"" : ""}`;
			const fill = run.color !== font.color ? ` fill="${xmlEscape(run.color)}"` : "";
			runs.push(svg`<tspan x="${anchorX + cursor}" y="${lineY}" font-size="${run.size > 0 ? run.size : fontSize}"${runStyle}${fill}>${xmlEscape(run.text)}</tspan>`);
			cursor += runWidth([run], fontSize);
		}
		const body = runs.length > 0 ? runs.join("") : svg`<tspan x="${anchorX}" y="${lineY}" font-size="${fontSize}"> </tspan>`;
		lines.push(svg`<text text-anchor="${textAnchor}" font-size="${size}" font-family="${xmlEscape(font.family)}">${body}</text>`);
		lineY += size * 1.2;
	}
	return lines.join("");
}
/** Clamp a 0..1 fraction into a rect border point. */
function borderPoint(rect, fx, fy) {
	const px = rect.x + fx * rect.width;
	const py = rect.y + fy * rect.height;
	const cx = rect.x + rect.width / 2;
	const cy = rect.y + rect.height / 2;
	const vx = px - cx;
	const vy = py - cy;
	if (vx === 0 && vy === 0) return {
		x: px,
		y: py
	};
	const hScale = Math.abs(vx) > 0 ? rect.width / 2 / Math.abs(vx) : Infinity;
	const vScale = Math.abs(vy) > 0 ? rect.height / 2 / Math.abs(vy) : Infinity;
	const scale = Math.min(hScale, vScale);
	return {
		x: cx + vx * scale,
		y: cy + vy * scale
	};
}
/** The side of a rect a border point lies on (for orthogonal routing). */
function pointSide(rect, p) {
	const dl = p.x - rect.x;
	const dr = rect.x + rect.width - p.x;
	const dt = p.y - rect.y;
	const db = rect.y + rect.height - p.y;
	const min = Math.min(dl, dr, dt, db);
	if (min === dl) return "left";
	if (min === dr) return "right";
	if (min === dt) return "top";
	return "bottom";
}
function renderEdge(edge, parts, dx, dy, family) {
	const cell = edge.cell;
	const style = cell.style;
	const geom = cell.geometry;
	if (geom === null) return;
	const stroke = stStr(style, "strokeColor", "#000000");
	const strokeWidth = stNum(style, "strokeWidth", 1);
	const dashed = style.dashed === "1";
	const curved = style.curved === "1";
	const fontSize = stNum(style, "fontSize", 12);
	const font = fontFromStyle(style, family);
	const exitX = stNum(style, "exitX", -1);
	const exitY = stNum(style, "exitY", -1);
	const entryX = stNum(style, "entryX", -1);
	const entryY = stNum(style, "entryY", -1);
	const exitDx = stNum(style, "exitDx", 0);
	const exitDy = stNum(style, "exitDy", 0);
	const entryDx = stNum(style, "entryDx", 0);
	const entryDy = stNum(style, "entryDy", 0);
	const computeAnchor = (rect, otherRect, fx, fy, ddx, ddy, explicit) => {
		if (explicit !== void 0) return explicit;
		if (rect === null) return null;
		if (fx >= 0 && fx <= 1 && fy >= 0 && fy <= 1) {
			const px = rect.x + fx * rect.width + ddx;
			const py = rect.y + fy * rect.height + ddy;
			if (!(px >= rect.x && px <= rect.x + rect.width && py >= rect.y && py <= rect.y + rect.height)) return {
				x: px,
				y: py
			};
			return borderPoint(rect, (px - rect.x) / rect.width, (py - rect.y) / rect.height);
		}
		if (otherRect !== null) {
			const cx = otherRect.x + otherRect.width / 2;
			const cy = otherRect.y + otherRect.height / 2;
			return borderPoint(rect, (cx - rect.x) / rect.width, (cy - rect.y) / rect.height);
		}
		return null;
	};
	const sourceAnchor = computeAnchor(edge.sourceRect, edge.targetRect, exitX, exitY, exitDx, exitDy, geom.sourcePoint);
	const targetAnchor = computeAnchor(edge.targetRect, edge.sourceRect, entryX, entryY, entryDx, entryDy, geom.targetPoint);
	if (sourceAnchor === null || targetAnchor === null) return;
	const shift = (p) => ({
		x: p.x + dx,
		y: p.y + dy
	});
	let rawPoints;
	const isOrthogonal = style.edgeStyle === "orthogonalEdgeStyle" || style.edgeStyle === "elbowEdgeStyle";
	if (edge.points.length > 0) rawPoints = [
		sourceAnchor,
		...edge.points,
		targetAnchor
	];
	else if (isOrthogonal) {
		const exitSide = pointSide(edge.sourceRect ?? {
			x: sourceAnchor.x,
			y: sourceAnchor.y,
			width: .01,
			height: .01
		}, sourceAnchor);
		pointSide(edge.targetRect ?? {
			x: targetAnchor.x,
			y: targetAnchor.y,
			width: .01,
			height: .01
		}, targetAnchor);
		const midX = (sourceAnchor.x + targetAnchor.x) / 2;
		const midY = (sourceAnchor.y + targetAnchor.y) / 2;
		if (exitSide === "left" || exitSide === "right") rawPoints = [
			sourceAnchor,
			{
				x: midX,
				y: sourceAnchor.y
			},
			{
				x: midX,
				y: targetAnchor.y
			},
			targetAnchor
		];
		else rawPoints = [
			sourceAnchor,
			{
				x: sourceAnchor.x,
				y: midY
			},
			{
				x: targetAnchor.x,
				y: midY
			},
			targetAnchor
		];
	} else rawPoints = [sourceAnchor, targetAnchor];
	const points = rawPoints.map(shift);
	const d = curved ? smoothPath(points) : `M ${points.map((p) => `${p.x} ${p.y}`).join(" L ")}`;
	parts.push(svg`<path d="${d}" fill="none" stroke="${stroke}" stroke-width="${strokeWidth}"${dashed ? ` stroke-dasharray="${Math.max(3, strokeWidth * 2)} ${Math.max(3, strokeWidth * 2)}"` : ""}/>`);
	const endArrow = stStr(style, "endArrow", "classic");
	const startArrow = stStr(style, "startArrow", "none");
	const endSize = Math.max(6, stNum(style, "endSize", 10));
	const startSize = Math.max(6, stNum(style, "startSize", 10));
	if (endArrow !== "none" && endArrow !== "") {
		const marker = markerPath(points, true, endArrow, endSize, stroke, strokeWidth, stStr(style, "endFill", "1") === "1");
		if (marker !== "") parts.push(marker);
	}
	if (startArrow !== "none" && startArrow !== "") {
		const marker = markerPath(points, false, startArrow, startSize, stroke, strokeWidth, stStr(style, "startFill", "1") === "1");
		if (marker !== "") parts.push(marker);
	}
	if (cell.value !== "") {
		const midIndex = Math.floor((points.length - 1) / 2);
		const a = points[midIndex] ?? points[0];
		const b = points[Math.min(midIndex + 1, points.length - 1)] ?? a;
		const mid = {
			x: (a.x + b.x) / 2,
			y: (a.y + b.y) / 2
		};
		const labelX = mid.x + edge.labelOffset.x;
		const labelY = mid.y + edge.labelOffset.y;
		const bg = stStr(style, "labelBackgroundColor", "");
		const align = stStr(style, "align", "center");
		const width = runWidth(parseHtmlLabel(cell.value, font).flat(), fontSize);
		if (bg !== "") parts.push(svg`<rect x="${labelX - width / 2 - 3}" y="${labelY - fontSize * .6}" width="${width + 6}" height="${fontSize * 1.4}" fill="${xmlEscape(bg)}" stroke="none"/>`);
		parts.push(renderLabelText(cell.value, {
			x: labelX,
			y: labelY
		}, font, align, "middle", 2e3, 0, false));
	}
}
/** Smooth quadratic path through all points (drawio `curved=1` look). */
function smoothPath(points) {
	if (points.length === 0) return "";
	if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
	if (points.length === 2) return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;
	let d = `M ${points[0].x} ${points[0].y} Q ${points[1].x} ${points[1].y} ${points[2].x} ${points[2].y}`;
	for (let i = 3; i < points.length; i += 1) {
		const p = points[i];
		d += ` T ${p.x} ${p.y}`;
	}
	return d;
}
/** One arrowhead at the start or end of a polyline. */
function markerPath(points, atEnd, kind, size, stroke, strokeWidth, filled) {
	if (points.length < 2) return "";
	const tip = atEnd ? points[points.length - 1] : points[0];
	const prev = atEnd ? points[points.length - 2] : points[1];
	const dx = tip.x - prev.x;
	const dy = tip.y - prev.y;
	const len = Math.hypot(dx, dy);
	if (len === 0) return "";
	const ux = dx / len;
	const uy = dy / len;
	const nx = atEnd ? -ux : ux;
	const ny = atEnd ? -uy : uy;
	const px = -ny;
	const py = nx;
	const L = size;
	const backX = tip.x + nx * L;
	const backY = tip.y + ny * L;
	switch (kind) {
		case "classic": {
			const half = L * .45;
			const base = L * .55;
			const p1 = {
				x: backX + px * half,
				y: backY + py * half
			};
			const p2 = {
				x: backX - px * half,
				y: backY - py * half
			};
			const crossX = tip.x + nx * (base * .45);
			const crossY = tip.y + ny * (base * .45);
			const fillAttr = filled ? ` fill="${stroke}"` : " fill=\"none\"";
			return `<g>${svg`<path d="M ${p1.x} ${p1.y} L ${tip.x} ${tip.y} L ${p2.x} ${p2.y}"${fillAttr} stroke="${stroke}" stroke-width="${strokeWidth}"/>`}${svg`<path d="M ${crossX + px * half * .7} ${crossY + py * half * .7} L ${crossX - px * half * .7} ${crossY - py * half * .7}" stroke="${stroke}" stroke-width="${strokeWidth}"/>`}</g>`;
		}
		case "block": {
			const half = L * .4;
			const fillAttr = filled ? ` fill="${stroke}"` : " fill=\"none\"";
			return svg`<path d="M ${tip.x} ${tip.y} L ${backX + px * half} ${backY + py * half} L ${backX - px * half} ${backY - py * half} Z"${fillAttr} stroke="${stroke}" stroke-width="${strokeWidth}"/>`;
		}
		case "open": {
			const half = L * .45;
			const base = L * .6;
			const bx = tip.x + nx * base;
			const by = tip.y + ny * base;
			return svg`<path d="M ${bx + px * half} ${by + py * half} L ${tip.x} ${tip.y} L ${bx - px * half} ${by - py * half}" fill="none" stroke="${stroke}" stroke-width="${strokeWidth}"/>`;
		}
		case "oval": {
			const r = L * .5;
			return svg`<circle cx="${tip.x}" cy="${tip.y}" r="${r}" fill="${filled ? stroke : "none"}" stroke="${stroke}" stroke-width="${strokeWidth}"/>`;
		}
		case "diamond": {
			const half = L * .45;
			const base = L * .55;
			const sideX = tip.x + nx * (base / 2);
			const sideY = tip.y + ny * (base / 2);
			return svg`<path d="M ${tip.x} ${tip.y} L ${sideX + px * half} ${sideY + py * half} L ${backX} ${backY} L ${sideX - px * half} ${sideY - py * half} Z" fill="${filled ? stroke : "none"}" stroke="${stroke}" stroke-width="${strokeWidth}"/>`;
		}
		default: return "";
	}
}
//#endregion
//#region src/service.ts
/**
* The drawio host service: workspace-gated diagram file operations for the
* 画板 browser UI (list / read / save), served over the /dsh-drawio HTTP
* routes (see routes.ts). Every operation canonicalizes the requested root
* and requires it to be inside a registered workspace — the same security
* boundary the /aionui-panel routes enforce: the browser may only read and
* mutate files under registered workspace roots.
*
* @module dsh-drawio/service
*/
/** Diagram file extensions the board lists. */
const DIAGRAM_EXTENSIONS = /* @__PURE__ */ new Set([
	".drawio",
	".xml",
	".drawio.svg",
	".svg"
]);
/** Recursion depth cap for the recursive list scan. */
const MAX_SCAN_DEPTH = 6;
/** Cap on listed entries (browser trees must stay light). */
const MAX_ENTRIES = 500;
/** Cap on a single file read. */
const MAX_READ_BYTES = 8388608;
/**
* Normalize a path for prefix comparison: collapse Windows separators to `/`
* and drop any trailing slash; on win32 compare case-insensitively.
*/
function normalizeForPrefix(value) {
	const normalized = value.replaceAll("\\", "/").replace(/\/+$/, "");
	return process.platform === "win32" ? normalized.toLowerCase() : normalized;
}
/** The canonical prefix check: child must live inside (or equal) the root. */
function isPathInside(root, child) {
	if (root === "" || child === "") return false;
	const normRoot = normalizeForPrefix(root);
	const normChild = normalizeForPrefix(child);
	if (normChild === normRoot) return true;
	return normChild.startsWith(`${normRoot}/`);
}
/**
* Verify a project root: canonicalize and require membership in a registered
* workspace.
* @param ctx - context carrying the workspace registry.
* @param root - the requested project root (session cwd).
*/
async function verifyWorkspaceRoot(ctx, root) {
	if (typeof root !== "string" || root === "") return {
		ok: false,
		error: "empty project root"
	};
	let canonical;
	try {
		canonical = await realpath(root);
	} catch {
		return {
			ok: false,
			error: "path does not resolve on disk"
		};
	}
	const workspaces = ctx.workspaceRegistry.list();
	for (const workspace of workspaces) if (isPathInside(workspace.path, canonical)) return {
		ok: true,
		canonical
	};
	return {
		ok: false,
		error: "path is not inside a registered workspace"
	};
}
/** A workspace-relative path, validated for traversal safety. */
function safeRelative(root, path) {
	const clean = path.replaceAll("\\", "/").replace(/^\/+/, "");
	if (!isPathInside(root, resolve(root, clean))) return null;
	return clean;
}
/** The drawio workspace file service (plain service; no typert). */
var DrawioService = class {
	ctx;
	static inject = [];
	/** @param ctx - cordis context. */
	constructor(ctx) {
		this.ctx = ctx;
	}
	/** List diagram files under a workspace directory (recursive, depth-capped). */
	async list(rootArg, dirArg) {
		const gated = await verifyWorkspaceRoot(this.ctx, rootArg);
		if (!gated.ok) return {
			kind: "error",
			error: {
				code: "workspace",
				message: gated.error
			}
		};
		const root = gated.canonical;
		const dir = dirArg === void 0 || dirArg === "" ? "" : safeRelative(root, dirArg);
		if (dir === null) return {
			kind: "error",
			error: {
				code: "workspace",
				message: "path escapes the workspace"
			}
		};
		const base = dir === "" ? root : join(root, ...dir.split("/"));
		const entries = [];
		let truncated = false;
		const walk = async (abs, rel, depth) => {
			if (truncated || depth > MAX_SCAN_DEPTH) return;
			let handle;
			try {
				handle = await readdir(abs, { withFileTypes: true });
			} catch {
				return;
			}
			for (const entry of handle) {
				if (truncated || entries.length >= MAX_ENTRIES) {
					truncated = true;
					return;
				}
				const childRel = rel === "" ? entry.name : `${rel}/${entry.name}`;
				const childAbs = join(abs, entry.name);
				if (entry.isDirectory()) {
					if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
					await walk(childAbs, childRel, depth + 1);
					continue;
				}
				if (!entry.isFile()) continue;
				const lower = entry.name.toLowerCase();
				if (lower.endsWith(".drawio") || lower.endsWith(".drawio.svg")) try {
					const info = await stat(childAbs);
					entries.push({
						path: childRel,
						name: entry.name,
						size: info.size,
						mtime: Math.floor(info.mtimeMs)
					});
				} catch {}
			}
		};
		await walk(base, dir, 0);
		entries.sort((a, b) => a.path.localeCompare(b.path));
		return {
			kind: "list",
			value: {
				entries,
				truncated
			}
		};
	}
	/** Read one diagram file's content. */
	async read(rootArg, path) {
		const gated = await verifyWorkspaceRoot(this.ctx, rootArg);
		if (!gated.ok) return {
			kind: "error",
			error: {
				code: "workspace",
				message: gated.error
			}
		};
		const root = gated.canonical;
		const rel = safeRelative(root, path);
		if (rel === null) return {
			kind: "error",
			error: {
				code: "workspace",
				message: "path escapes the workspace"
			}
		};
		const target = join(root, ...rel.split("/"));
		let info;
		try {
			info = await stat(target);
		} catch {
			return {
				kind: "error",
				error: {
					code: "not-found",
					message: `no such file: ${rel}`
				}
			};
		}
		if (!info.isFile()) return {
			kind: "error",
			error: {
				code: "not-found",
				message: `not a file: ${rel}`
			}
		};
		if (info.size > MAX_READ_BYTES) return {
			kind: "error",
			error: {
				code: "too-large",
				message: `file too large (${info.size} bytes)`
			}
		};
		try {
			return {
				kind: "read",
				value: {
					content: await readFile(target, "utf8"),
					mtime: Math.floor(info.mtimeMs)
				}
			};
		} catch (error) {
			return {
				kind: "error",
				error: {
					code: "io",
					message: error instanceof Error ? error.message : String(error)
				}
			};
		}
	}
	/**
	* Save one diagram file into the workspace. The content must parse as a
	* drawio document (unless the extension is .svg), so the board can never
	* persist garbage the renderer would choke on.
	*/
	async save(rootArg, path, content) {
		const gated = await verifyWorkspaceRoot(this.ctx, rootArg);
		if (!gated.ok) return {
			kind: "error",
			error: {
				code: "workspace",
				message: gated.error
			}
		};
		const root = gated.canonical;
		const rel = safeRelative(root, path);
		if (rel === null) return {
			kind: "error",
			error: {
				code: "workspace",
				message: "path escapes the workspace"
			}
		};
		const lower = rel.toLowerCase();
		if (!lower.endsWith(".drawio") && !lower.endsWith(".xml") && !lower.endsWith(".svg")) return {
			kind: "error",
			error: {
				code: "invalid",
				message: "only .drawio/.xml/.svg files can be saved"
			}
		};
		if (!lower.endsWith(".svg")) try {
			parseDiagrams(content);
		} catch (error) {
			return {
				kind: "error",
				error: {
					code: "invalid",
					message: `content is not a valid drawio document: ${error instanceof Error ? error.message : String(error)}`
				}
			};
		}
		const target = join(root, ...rel.split("/"));
		try {
			await mkdir(dirname(target), { recursive: true });
			const bytes = Buffer.byteLength(content, "utf8");
			await writeFile(target, content, "utf8");
			const info = await stat(target);
			return {
				kind: "save",
				value: {
					path: rel,
					bytes,
					mtime: Math.floor(info.mtimeMs)
				}
			};
		} catch (error) {
			return {
				kind: "error",
				error: {
					code: "io",
					message: error instanceof Error ? error.message : String(error)
				}
			};
		}
	}
};
//#endregion
//#region src/events.ts
const subscribers = /* @__PURE__ */ new Set();
/** Register an SSE subscriber; returns its disposer. */
function subscribeDrawioEvents(res) {
	subscribers.add(res);
	return () => {
		subscribers.delete(res);
	};
}
/** Push one activity to every subscriber (dead connections are dropped). */
function broadcastDrawioActivity(activity) {
	const line = `data: ${JSON.stringify(activity)}\n\n`;
	for (const res of subscribers) try {
		res.write(line);
	} catch {
		subscribers.delete(res);
	}
}
//#endregion
//#region src/routes.ts
/** Loopback trust fence (mirrors dsh-ssh / dsh-aionui-panel). */
function isLoopbackRequest$1(request) {
	const address = request.socket.remoteAddress;
	if (address !== "127.0.0.1" && address !== "::1" && address !== "::ffff:127.0.0.1") return false;
	const host = request.headers.host;
	if (typeof host !== "string") return false;
	let hostUrl;
	try {
		hostUrl = new URL(`http://${host}`);
	} catch {
		return false;
	}
	if (hostUrl.hostname !== "127.0.0.1" && hostUrl.hostname !== "localhost" && hostUrl.hostname !== "[::1]") return false;
	if (request.headers["sec-fetch-site"] === "cross-site") return false;
	const origin = request.headers.origin;
	if (origin === void 0) return true;
	try {
		return new URL(origin).host === hostUrl.host;
	} catch {
		return false;
	}
}
function forbidden(res) {
	res.writeHead(403, { "content-type": "application/json; charset=utf-8" });
	res.end(JSON.stringify({ error: "forbidden: loopback-only" }));
}
/** Read a JSON request body into an unknown value; null when unparseable. */
async function readJsonBody(req) {
	const chunks = [];
	let total = 0;
	for await (const chunk of req) {
		const buffer = chunk;
		chunks.push(buffer);
		total += buffer.length;
		if (total > 1 << 20) return null;
	}
	const text = Buffer.concat(chunks).toString("utf8");
	if (text === "") return null;
	try {
		return JSON.parse(text);
	} catch {
		return null;
	}
}
/** Extract the required string field from a JSON object payload. */
function strField(payload, key) {
	if (typeof payload !== "object" || payload === null) return null;
	const value = payload[key];
	return typeof value === "string" && value !== "" ? value : null;
}
/** Extract a string field, accepting the empty string as a value. */
function strOrEmpty(payload, key) {
	if (typeof payload !== "object" || payload === null) return null;
	const value = payload[key];
	return typeof value === "string" ? value : null;
}
const BAD_REQUEST = {
	code: "internal",
	message: "malformed request"
};
function json(res, envelope, status = 200) {
	res.writeHead(status, { "content-type": "application/json; charset=utf-8" });
	res.end(JSON.stringify(envelope));
}
/** Map an operation result onto the HTTP envelope. */
function respond(res, result) {
	switch (result.kind) {
		case "list":
		case "read":
		case "save":
			json(res, {
				ok: true,
				value: result.value
			});
			return;
		case "error": {
			const status = result.error.code === "workspace" ? 403 : result.error.code === "not-found" ? 404 : result.error.code === "invalid" ? 422 : 500;
			json(res, {
				ok: false,
				error: result.error
			}, status);
			return;
		}
	}
}
/**
* Register the /dsh-drawio routes (POST JSON operations).
* @param ctx - context carrying the webServer service.
* @param service - the gated filesystem service.
* @returns the route disposer.
*/
function registerDrawioRoutes(ctx, service) {
	const handler = async (req, res) => {
		if (!isLoopbackRequest$1(req)) {
			forbidden(res);
			return;
		}
		if (req.method !== "POST" && req.method !== "GET") {
			res.writeHead(405);
			res.end();
			return;
		}
		if (req.method === "GET") {
			const url = new URL(req.url ?? "/", "http://x");
			if (url.pathname === "/dsh-drawio/events") {
				res.writeHead(200, {
					"content-type": "text/event-stream; charset=utf-8",
					"cache-control": "no-cache",
					connection: "keep-alive"
				});
				res.write("retry: 2000\n\n");
				const heartbeat = setInterval(() => {
					try {
						res.write(": ping\n\n");
					} catch {
						clearInterval(heartbeat);
					}
				}, 15e3);
				const unsubscribe = subscribeDrawioEvents(res);
				req.on("close", () => {
					unsubscribe();
					clearInterval(heartbeat);
				});
				return;
			}
			if (url.pathname === "/dsh-drawio/raw") {
				const root = url.searchParams.get("root");
				const path = url.searchParams.get("path");
				if (root === null || root === "" || path === null || path === "") {
					json(res, {
						ok: false,
						error: BAD_REQUEST
					}, 400);
					return;
				}
				const result = await service.read(root, path);
				if (result.kind !== "read") {
					const status = result.kind === "error" && result.error.code === "workspace" ? 403 : result.kind === "error" && result.error.code === "not-found" ? 404 : 500;
					json(res, {
						ok: false,
						error: result.kind === "error" ? result.error : BAD_REQUEST
					}, status);
					return;
				}
				res.writeHead(200, {
					"content-type": "application/xml; charset=utf-8",
					"cache-control": "no-cache",
					"x-content-type-options": "nosniff"
				});
				res.end(result.value.content);
				return;
			}
			res.writeHead(404);
			res.end();
			return;
		}
		if (!(req.headers["content-type"] ?? "").toLowerCase().startsWith("application/json")) {
			json(res, {
				ok: false,
				error: BAD_REQUEST
			}, 415);
			return;
		}
		const pathname = new URL(req.url ?? "/", "http://x").pathname;
		const payload = await readJsonBody(req);
		if (payload === null) {
			json(res, {
				ok: false,
				error: BAD_REQUEST
			});
			return;
		}
		switch (pathname) {
			case "/dsh-drawio/list": {
				const root = strField(payload, "root");
				if (root === null) {
					json(res, {
						ok: false,
						error: BAD_REQUEST
					});
					return;
				}
				respond(res, await service.list(root, strField(payload, "dir") ?? void 0));
				return;
			}
			case "/dsh-drawio/read": {
				const root = strField(payload, "root");
				const path = strField(payload, "path");
				if (root === null || path === null) {
					json(res, {
						ok: false,
						error: BAD_REQUEST
					});
					return;
				}
				respond(res, await service.read(root, path));
				return;
			}
			case "/dsh-drawio/save": {
				const root = strField(payload, "root");
				const path = strField(payload, "path");
				const content = strOrEmpty(payload, "content");
				if (root === null || path === null || content === null) {
					json(res, {
						ok: false,
						error: BAD_REQUEST
					});
					return;
				}
				respond(res, await service.save(root, path, content));
				return;
			}
			default:
				res.writeHead(404);
				res.end();
		}
	};
	const dispose = ctx.webServer.register({
		kind: "prefix",
		path: "/dsh-drawio",
		handler
	});
	return () => dispose();
}
//#endregion
//#region src/static.ts
/**
* Static file serving for bundled assets (the drawio webapp): mounts a
* `/drawio/*` prefix over a directory inside this package. Loopback-fenced
* like every other plugin route; paths are normalized and must stay inside
* the assets directory.
*
* @module dsh-drawio/static
*/
const MIME = {
	".html": "text/html; charset=utf-8",
	".js": "text/javascript; charset=utf-8",
	".mjs": "text/javascript; charset=utf-8",
	".css": "text/css; charset=utf-8",
	".json": "application/json; charset=utf-8",
	".svg": "image/svg+xml",
	".png": "image/png",
	".gif": "image/gif",
	".jpg": "image/jpeg",
	".jpeg": "image/jpeg",
	".webp": "image/webp",
	".ico": "image/x-icon",
	".woff": "font/woff",
	".woff2": "font/woff2",
	".ttf": "font/ttf",
	".map": "application/json",
	".txt": "text/plain; charset=utf-8",
	".xml": "application/xml; charset=utf-8",
	".wasm": "application/wasm"
};
/** Loopback trust fence (mirrors dsh-ssh / dsh-aionui-panel). */
function isLoopbackRequest(request) {
	const address = request.socket.remoteAddress;
	if (address !== "127.0.0.1" && address !== "::1" && address !== "::ffff:127.0.0.1") return false;
	const host = request.headers.host;
	if (typeof host !== "string") return false;
	let hostUrl;
	try {
		hostUrl = new URL(`http://${host}`);
	} catch {
		return false;
	}
	if (hostUrl.hostname !== "127.0.0.1" && hostUrl.hostname !== "localhost" && hostUrl.hostname !== "[::1]") return false;
	if (request.headers["sec-fetch-site"] === "cross-site") return false;
	const origin = request.headers.origin;
	if (origin === void 0) return true;
	try {
		return new URL(origin).host === hostUrl.host;
	} catch {
		return false;
	}
}
/**
* Serve one prefix from a directory on disk. Paths resolve inside `dir`
* (after normalization; '..' and absolute escapes are rejected).
*/
function serveStaticDir(ctx, prefix, dir) {
	const root = normalize(dir).replace(/[\\/]+$/, "");
	const handler = async (req, res) => {
		if (!isLoopbackRequest(req)) {
			res.writeHead(403, { "content-type": "text/plain; charset=utf-8" });
			res.end("forbidden: loopback-only");
			return;
		}
		if (req.method !== "GET" && req.method !== "HEAD") {
			res.writeHead(405);
			res.end();
			return;
		}
		const url = new URL(req.url ?? "/", "http://x");
		let rel = decodeURIComponent(url.pathname.slice(prefix.length));
		if (rel === "" || rel.endsWith("/")) rel += "index.html";
		if (rel.includes("\0")) {
			res.writeHead(400);
			res.end();
			return;
		}
		const target = normalize(join(root, rel.replace(/^[\\/]+/, "")));
		if (target !== root && !target.startsWith(`${root}${sep}`)) {
			res.writeHead(403);
			res.end();
			return;
		}
		let info;
		try {
			info = await stat(target);
		} catch {
			res.writeHead(404);
			res.end();
			return;
		}
		if (info.isDirectory()) {
			res.writeHead(404);
			res.end();
			return;
		}
		const type = MIME[extname(target).toLowerCase()] ?? "application/octet-stream";
		res.writeHead(200, {
			"content-type": type,
			"content-length": info.size,
			"cache-control": "public, max-age=3600"
		});
		if (req.method === "HEAD") {
			res.end();
			return;
		}
		const stream = createReadStream(target);
		stream.on("error", () => {
			res.destroy();
		});
		stream.pipe(res);
	};
	const dispose = ctx.webServer.register({
		kind: "prefix",
		path: prefix,
		handler
	});
	return () => dispose();
}
//#endregion
//#region src/watch.ts
/**
* Diagram file watcher: polls every registered workspace root for changes to
* .drawio files and broadcasts a drawio-activity event, so the board
* auto-opens no matter HOW the agent wrote the file (drawio tools, the plain
* file tools, or anything else). Filesystem watching is unreliable across
* platforms for recursive trees, so this is a cheap mtime poll.
*
* @module dsh-drawio/watch
*/
const POLL_MS = 2500;
const MAX_DEPTH = 4;
const MAX_FILES = 800;
/**
* Poll workspace roots for .drawio changes. Workspace registry membership is
* read fresh every tick, so newly opened workspaces join automatically.
*/
var DiagramWatchService = class {
	ctx;
	snapshots = /* @__PURE__ */ new Map();
	timer;
	/** @param ctx - context carrying the workspace registry. */
	constructor(ctx) {
		this.ctx = ctx;
	}
	/** Start polling (idempotent). */
	start() {
		if (this.timer !== void 0) return;
		this.timer = setInterval(() => {
			this.tick();
		}, POLL_MS);
	}
	/** Stop polling. */
	stop() {
		if (this.timer !== void 0) {
			clearInterval(this.timer);
			this.timer = void 0;
		}
	}
	/** One poll round: diff every registered workspace root. */
	async tick() {
		let workspaces = [];
		try {
			workspaces = this.ctx.workspaceRegistry.list();
		} catch {
			return;
		}
		for (const workspace of workspaces) try {
			await this.scanRoot(workspace.path);
		} catch {}
	}
	/** Scan one root and broadcast changes against the previous snapshot. */
	async scanRoot(root) {
		const current = /* @__PURE__ */ new Map();
		const walk = async (abs, rel, depth) => {
			if (depth > MAX_DEPTH || current.size >= MAX_FILES) return;
			let entries;
			try {
				entries = await readdir(abs, { withFileTypes: true });
			} catch {
				return;
			}
			for (const entry of entries) {
				if (current.size >= MAX_FILES) return;
				if (entry.name === "node_modules" || entry.name === ".git" || entry.name.startsWith(".")) continue;
				const childAbs = join(abs, entry.name);
				const childRel = rel === "" ? entry.name : `${rel}/${entry.name}`;
				if (entry.isDirectory()) {
					await walk(childAbs, childRel, depth + 1);
					continue;
				}
				if (!entry.isFile()) continue;
				if (!entry.name.toLowerCase().endsWith(".drawio")) continue;
				try {
					const info = await stat(childAbs);
					current.set(childRel, info.mtimeMs);
				} catch {}
			}
		};
		await walk(root, "", 0);
		const previous = this.snapshots.get(root);
		this.snapshots.set(root, current);
		if (previous === void 0) return;
		for (const [path, mtime] of current) if (previous.get(path) !== mtime) broadcastDrawioActivity({
			kind: "edit",
			path
		});
		for (const path of previous.keys()) if (!current.has(path)) broadcastDrawioActivity({
			kind: "edit",
			path
		});
	}
};
//#endregion
//#region src/edit.ts
/**
* Structured diagram editing: apply cell-level operations to a drawio
* document and re-serialize it. The agent describes WHAT to change
* (upsert/delete/move/restyle a cell), not raw XML surgery — the model never
* hand-edits mxGraph XML, so structure cannot break.
*
* The operations work on the parsed XML tree (from translate.ts), so unknown
* elements/attributes round-trip untouched.
*
* @module dsh-drawio/edit
*/
const num = (value, fallback) => {
	const n = typeof value === "number" ? value : Number(value);
	return Number.isFinite(n) ? n : fallback;
};
/** Serialize one XML node back to markup (attribute order preserved). */
function serializeXml(node) {
	if (node.name === "#cdata") return `<![CDATA[${node.text}]]>`;
	const attrs = Object.entries(node.attrs).map(([key, value]) => ` ${key}="${escapeAttr(value)}"`).join("");
	if (node.children.length === 0 && node.text === "") return `<${node.name}${attrs}/>`;
	const body = node.children.map(serializeXml).join("") + escapeText(node.text);
	return `<${node.name}${attrs}>${body}</${node.name}>`;
}
function escapeAttr(value) {
	return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("\"", "&quot;");
}
function escapeText(value) {
	return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}
/** Find the mxfile root (or wrap a bare mxGraphModel). */
function locateModel(root) {
	const find = (node) => {
		if (node.name === "mxGraphModel") return node;
		for (const child of node.children) {
			const found = find(child);
			if (found !== null) return found;
		}
		return null;
	};
	const model = find(root);
	if (model === null) throw new Error("no mxGraphModel found in the document");
	const rootEl = model.children.find((child) => child.name === "root");
	let layer = null;
	if (rootEl !== void 0) {
		for (const child of rootEl.children) if (child.name === "mxCell" && (child.attrs.parent === "0" || child.attrs.id === "1")) {
			layer = child;
			break;
		}
	}
	return {
		model,
		layer
	};
}
/** Find an mxCell by id anywhere under the model. */
function findCell(model, id) {
	const walk = (node) => {
		if (node.name === "mxCell" && node.attrs.id === id) return node;
		for (const child of node.children) {
			const found = walk(child);
			if (found !== null) return found;
		}
		return null;
	};
	return walk(model);
}
/** Build a vertex/edge mxCell node with a structured geometry child. */
function buildCell(attrs, geometry, children = []) {
	return {
		name: "mxCell",
		attrs,
		children: [...children, geometry],
		text: ""
	};
}
/** Structured geometry node for a vertex. */
function vertexGeometry(x, y, w, h) {
	return {
		name: "mxGeometry",
		attrs: {
			x: String(x),
			y: String(y),
			width: String(w),
			height: String(h),
			as: "geometry"
		},
		children: [],
		text: ""
	};
}
/** Structured geometry node for an edge (waypoints). */
function edgeGeometry(points) {
	return {
		name: "mxGeometry",
		attrs: {
			relative: "1",
			as: "geometry"
		},
		children: points.length === 0 ? [] : [{
			name: "Array",
			attrs: { as: "points" },
			children: points.map((p) => ({
				name: "mxPoint",
				attrs: {
					x: String(p.x),
					y: String(p.y)
				},
				children: [],
				text: ""
			})),
			text: ""
		}],
		text: ""
	};
}
/**
* Apply one op to the model tree. Returns the result; mutates `model`.
*/
function applyOp(model, layer, op) {
	switch (op.op) {
		case "upsert_vertex": {
			const existing = findCell(model, op.id);
			if (existing !== null) {
				const geom = existing.children.find((child) => child.name === "mxGeometry");
				if (geom !== void 0) {
					geom.attrs.x = String(num(op.x, Number(geom.attrs.x ?? 0)));
					geom.attrs.y = String(num(op.y, Number(geom.attrs.y ?? 0)));
					geom.attrs.width = String(num(op.w, Number(geom.attrs.width ?? 0)));
					geom.attrs.height = String(num(op.h, Number(geom.attrs.height ?? 0)));
				}
				if (op.value !== void 0) existing.attrs.value = op.value;
				if (op.style !== void 0) existing.attrs.style = op.style;
				return {
					op,
					ok: true,
					message: `updated vertex ${op.id}`
				};
			}
			if (layer === null) return {
				op,
				ok: false,
				message: "no layer cell to attach to"
			};
			const cell = buildCell({
				id: op.id,
				parent: layer.attrs.id ?? "1",
				...op.value === void 0 ? {} : { value: op.value },
				style: op.style ?? "rounded=1;whiteSpace=wrap;html=1;arcSize=12;",
				vertex: "1"
			}, vertexGeometry(op.x, op.y, op.w, op.h));
			layer.children.push(cell);
			return {
				op,
				ok: true,
				message: `created vertex ${op.id}`
			};
		}
		case "upsert_edge": {
			const existing = findCell(model, op.id);
			if (existing !== null) {
				if (op.source !== void 0) existing.attrs.source = op.source;
				if (op.target !== void 0) existing.attrs.target = op.target;
				if (op.value !== void 0) existing.attrs.value = op.value;
				if (op.style !== void 0) existing.attrs.style = op.style;
				if (op.points !== void 0) {
					const geom = existing.children.find((child) => child.name === "mxGeometry");
					if (geom !== void 0) {
						geom.children = geom.children.filter((child) => child.name !== "Array");
						if (op.points.length > 0) geom.children.push({
							name: "Array",
							attrs: { as: "points" },
							children: op.points.map((p) => ({
								name: "mxPoint",
								attrs: {
									x: String(p.x),
									y: String(p.y)
								},
								children: [],
								text: ""
							})),
							text: ""
						});
					}
				}
				return {
					op,
					ok: true,
					message: `updated edge ${op.id}`
				};
			}
			if (layer === null) return {
				op,
				ok: false,
				message: "no layer cell to attach to"
			};
			const cell = buildCell({
				id: op.id,
				parent: layer.attrs.id ?? "1",
				...op.value === void 0 ? {} : { value: op.value },
				style: op.style ?? "edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;endArrow=block;",
				edge: "1",
				source: op.source,
				target: op.target
			}, edgeGeometry(op.points ?? []));
			layer.children.push(cell);
			return {
				op,
				ok: true,
				message: `created edge ${op.id}`
			};
		}
		case "delete": {
			const walk = (node) => {
				const index = node.children.findIndex((child) => child.name === "mxCell" && child.attrs.id === op.id);
				if (index !== -1) {
					node.children.splice(index, 1);
					return true;
				}
				for (const child of node.children) if (walk(child)) return true;
				return false;
			};
			const removed = walk(model);
			const dropRefs = (node) => {
				for (const child of node.children) {
					if (child.name === "mxCell" && (child.attrs.source === op.id || child.attrs.target === op.id)) {
						node.children.splice(node.children.indexOf(child), 1);
						continue;
					}
					dropRefs(child);
				}
			};
			dropRefs(model);
			return removed ? {
				op,
				ok: true,
				message: `deleted ${op.id}`
			} : {
				op,
				ok: false,
				message: `no cell with id ${op.id}`
			};
		}
		case "update_style": {
			const cell = findCell(model, op.id);
			if (cell === null) return {
				op,
				ok: false,
				message: `no cell with id ${op.id}`
			};
			cell.attrs.style = op.style;
			return {
				op,
				ok: true,
				message: `restyled ${op.id}`
			};
		}
		case "update_value": {
			const cell = findCell(model, op.id);
			if (cell === null) return {
				op,
				ok: false,
				message: `no cell with id ${op.id}`
			};
			if (cell.attrs.value === void 0) cell.attrs.value = op.value;
			else cell.attrs.value = op.value;
			return {
				op,
				ok: true,
				message: `relabelled ${op.id}`
			};
		}
		case "move": {
			const cell = findCell(model, op.id);
			if (cell === null) return {
				op,
				ok: false,
				message: `no cell with id ${op.id}`
			};
			const geom = cell.children.find((child) => child.name === "mxGeometry");
			if (geom === void 0) return {
				op,
				ok: false,
				message: `${op.id} has no geometry`
			};
			geom.attrs.x = String(num(geom.attrs.x, 0) + num(op.dx, 0));
			geom.attrs.y = String(num(geom.attrs.y, 0) + num(op.dy, 0));
			return {
				op,
				ok: true,
				message: `moved ${op.id}`
			};
		}
		case "resize": {
			const cell = findCell(model, op.id);
			if (cell === null) return {
				op,
				ok: false,
				message: `no cell with id ${op.id}`
			};
			const geom = cell.children.find((child) => child.name === "mxGeometry");
			if (geom === void 0) return {
				op,
				ok: false,
				message: `${op.id} has no geometry`
			};
			geom.attrs.width = String(num(op.w, Number(geom.attrs.width ?? 0)));
			geom.attrs.height = String(num(op.h, Number(geom.attrs.height ?? 0)));
			return {
				op,
				ok: true,
				message: `resized ${op.id}`
			};
		}
	}
}
/**
* Apply a list of operations to a drawio document.
*
* @param xml - the .drawio/.xml file content.
* @param ops - the cell-level operations (applied in order).
* @returns the edited document plus per-op results.
*/
function applyEditOps(xml, ops) {
	if (ops.length === 0) throw new Error("no operations provided");
	const root = parseXml(xml);
	const { model, layer } = locateModel(root);
	const applied = [];
	for (const op of ops) applied.push(applyOp(model, layer, op));
	return {
		xml: serializeXml(root),
		applied,
		failed: applied.filter((result) => !result.ok).length
	};
}
//#endregion
//#region src/raster.ts
/** Dynamic import keeps the native module out of the client bundle. */
async function loadResvg() {
	return import("@resvg/resvg-js");
}
/**
* Rasterize an SVG document to PNG bytes.
*
* @param svg - the SVG markup.
* @param scale - width multiplier (2 = double resolution).
* @returns PNG bytes plus the intrinsic pixel size.
*/
async function svgToPng(svg, scale = 2) {
	const { Resvg } = await loadResvg();
	const rendered = new Resvg(svg, {
		fitTo: {
			mode: "zoom",
			value: Math.max(.25, Math.min(8, scale))
		},
		font: {
			fontFiles: [],
			loadSystemFonts: true,
			defaultFontFamily: "sans-serif"
		}
	}).render();
	return {
		png: rendered.asPng(),
		width: rendered.width,
		height: rendered.height
	};
}
/**
* Commit PNG bytes into the harness attachment store, returning a durable
* reference that conversation UIs can render.
*
* @param ctx - context carrying the attachment service.
* @param png - PNG bytes.
* @param name - optional display name.
*/
async function savePngAttachment(ctx, png, name) {
	return await ctx.attachments.saveImage({
		data: png,
		mediaType: "image/png",
		...name === void 0 ? {} : { name }
	});
}
//#endregion
//#region src/tools.ts
/**
* The three agent-visible drawio tools: validate, render, and template.
*
* - `drawio_validate`: parse a workspace .drawio file or inline XML; report
*   diagrams/cells/edges and any structural notes.
* - `drawio_render`: parse and render to SVG (and optionally PNG), write the
*   outputs next to the source file inside the workspace, and — when the
*   attachment store is available — commit a PNG preview so the diagram
*   appears inline in the conversation.
* - `drawio_template`: emit a ready-to-edit mxfile skeleton for common
*   diagram kinds (flowchart / architecture / network / orgchart).
*
* @module dsh-drawio/tools
*/
/** Output JSON schema (author-style annotations; matches dsh-tools). */
const RESULT_SCHEMA = {
	type: "object",
	additionalProperties: false,
	properties: {
		ok: {
			type: "boolean",
			required: true
		},
		action: {
			type: "string",
			required: true
		},
		source: {
			type: "string",
			required: true
		},
		diagrams: {
			type: "integer",
			required: true
		},
		vertices: {
			type: "integer",
			required: true
		},
		edges: {
			type: "integer",
			required: true
		},
		issues: {
			type: "array",
			items: { type: "string" },
			required: true
		},
		files: {
			type: "array",
			items: { type: "string" },
			required: true
		},
		error: { type: "string" },
		applied: { type: "integer" },
		failed: { type: "integer" },
		preview: {
			type: "object",
			additionalProperties: false,
			properties: {
				attachmentId: { type: "string" },
				mediaType: { type: "string" },
				bytes: { type: "integer" },
				width: { type: "integer" },
				height: { type: "integer" },
				name: { type: "string" }
			}
		}
	}
};
/** Count vertices/edges across the whole cell tree. */
function countCells(diagram) {
	let vertices = 0;
	let edges = 0;
	const walk = (cells) => {
		for (const cell of cells) {
			if (cell.edge) edges += 1;
			else if (cell.vertex) vertices += 1;
			walk(cell.children);
		}
	};
	walk(diagram.cells);
	return {
		vertices,
		edges
	};
}
/** The current session's cwd, best effort ('' when unknown). */
function sessionCwd(ctx) {
	try {
		const sessions = ctx.sessions.list();
		for (let i = sessions.length - 1; i >= 0; i -= 1) {
			const session = sessions[i];
			const cwd = session.meta?.cwd ?? session.cwd;
			if (typeof cwd === "string" && cwd !== "") return cwd;
		}
	} catch {}
	return "";
}
/** Resolve a tool path argument to an absolute path ('' when unresolvable). */
function resolvePathArg(ctx, path) {
	if (path === void 0 || path === "") return "";
	if (isAbsolute(path)) return path;
	const cwd = sessionCwd(ctx);
	return cwd === "" ? "" : resolve(cwd, path);
}
/** Read a source (path or inline xml); returns content + label or an error. */
async function resolveSource(ctx, path, xml) {
	if ((path === void 0 || path === "") && (xml === void 0 || xml === "")) return {
		ok: false,
		error: "provide one of path (workspace .drawio file) or xml (inline diagram content)"
	};
	if (path !== void 0 && path !== "" && xml !== void 0 && xml !== "") return {
		ok: false,
		error: "provide only one of path or xml, not both"
	};
	if (xml !== void 0 && xml !== "") return {
		ok: true,
		content: xml,
		label: "inline xml",
		absPath: ""
	};
	const abs = resolvePathArg(ctx, path);
	if (abs === "") return {
		ok: false,
		error: `cannot resolve path "${path}": no session workspace known; pass an absolute path`
	};
	const { readFile } = await import("node:fs/promises");
	try {
		return {
			ok: true,
			content: await readFile(abs, "utf8"),
			label: abs,
			absPath: abs
		};
	} catch (error) {
		return {
			ok: false,
			error: `cannot read "${abs}": ${error instanceof Error ? error.message : String(error)}`
		};
	}
}
/** Shared parse step; returns diagrams or a structured failure. */
function parseSource(content) {
	try {
		return {
			ok: true,
			diagrams: parseDiagrams(content)
		};
	} catch (error) {
		return {
			ok: false,
			error: error instanceof Error ? error.message : String(error)
		};
	}
}
/** Build the shared result skeleton for a parsed source. */
function baseResult(ctx, action, label, parsed) {
	if (!parsed.ok) return {
		ok: false,
		action,
		source: label,
		diagrams: 0,
		vertices: 0,
		edges: 0,
		issues: [],
		files: [],
		error: parsed.error
	};
	const issues = [];
	let vertices = 0;
	let edges = 0;
	for (const diagram of parsed.diagrams) {
		issues.push(...diagram.notes);
		const counts = countCells(diagram);
		vertices += counts.vertices;
		edges += counts.edges;
	}
	return {
		ok: true,
		action,
		source: label,
		diagrams: parsed.diagrams.length,
		vertices,
		edges,
		issues,
		files: []
	};
}
/** Write a file next to the source (workspace-gated; skipped when not writable). */
async function writeOutput(ctx, absSource, suffix, content) {
	if (absSource === "") return null;
	const target = `${absSource.replace(/\.(drawio|xml|svg)$/i, "")}${suffix}`;
	if (!(await verifyWorkspaceRoot(ctx, dirname(target))).ok) return null;
	await mkdir(dirname(target), { recursive: true });
	await writeFile(target, content);
	return target;
}
function validateTool(ctx) {
	return defineTool({
		name: "drawio_validate",
		description: "[dsh-drawio] Validate a drawio diagram: parse a workspace .drawio/.xml file (path) or inline diagram XML (xml) and report diagram/cell/edge counts plus any structural notes. Use before editing an existing diagram or after generating one.",
		parameters: {
			path: {
				type: "string",
				description: "Absolute or workspace-relative path of a .drawio/.xml file"
			},
			xml: {
				type: "string",
				description: "Inline drawio XML (mxfile or mxGraphModel)"
			}
		},
		output: {
			schema: RESULT_SCHEMA,
			render: (_args, value) => [{
				type: "text",
				text: renderResultText(value)
			}]
		},
		async execute(args) {
			const { path, xml } = args;
			const source = await resolveSource(ctx, path, xml);
			if (!source.ok) return {
				ok: false,
				action: "validate",
				source: "",
				diagrams: 0,
				vertices: 0,
				edges: 0,
				issues: [],
				files: [],
				error: source.error
			};
			const parsed = parseSource(source.content);
			return baseResult(ctx, "validate", source.label, parsed);
		}
	});
}
function renderTool(ctx, config) {
	return defineTool({
		name: "drawio_render",
		description: "[dsh-drawio] Render a drawio diagram to SVG/PNG. Parses a workspace .drawio/.xml file (path) or inline XML (xml), writes <name>.svg (and .png when out includes png) next to the source inside the workspace, and shows a PNG preview inline in the chat. Use after generating or editing a diagram to visualize it.",
		parameters: {
			path: {
				type: "string",
				description: "Absolute or workspace-relative path of a .drawio/.xml file"
			},
			xml: {
				type: "string",
				description: "Inline drawio XML (mxfile or mxGraphModel)"
			},
			out: {
				type: "string",
				enum: [
					"svg",
					"png",
					"both"
				],
				description: "Which files to write (default svg)"
			},
			preview: {
				type: "boolean",
				description: "Show a PNG preview inline in the chat (default true)"
			}
		},
		output: {
			schema: RESULT_SCHEMA,
			render: (_args, value) => {
				const result = value;
				const blocks = [{
					type: "text",
					text: renderResultText(result)
				}];
				if (result.preview !== void 0) blocks.push({
					type: "image",
					attachment: result.preview
				});
				return blocks;
			}
		},
		async execute(args) {
			const { path, xml, out, preview } = args;
			const source = await resolveSource(ctx, path, xml);
			if (!source.ok) return {
				ok: false,
				action: "render",
				source: "",
				diagrams: 0,
				vertices: 0,
				edges: 0,
				issues: [],
				files: [],
				error: source.error
			};
			const parsed = parseSource(source.content);
			const result = baseResult(ctx, "render", source.label, parsed);
			if (!result.ok || !parsed.ok) return result;
			const diagram = parsed.diagrams[0];
			const wantPng = out === "png" || out === "both";
			const wantSvg = out === "svg" || out === "both" || out === void 0;
			const files = [];
			try {
				const svg = diagramToSvg(diagram, { fontFamily: config.fontFamily });
				if (wantSvg) {
					const svgPath = await writeOutput(ctx, source.absPath, ".svg", svg);
					if (svgPath !== null) files.push(svgPath);
				}
				if (wantPng) {
					const { png } = await svgToPng(svg, config.pngScale);
					const pngPath = await writeOutput(ctx, source.absPath, ".png", png);
					if (pngPath !== null) files.push(pngPath);
				}
				broadcastDrawioActivity({
					kind: "render",
					path
				});
				if (preview !== true) return {
					...result,
					files
				};
				const raster = await svgToPng(svg, config.pngScale);
				if (wantPng) {
					const pngPath = await writeOutput(ctx, source.absPath, ".png", raster.png);
					if (pngPath !== null) files.push(pngPath);
				}
				try {
					const ref = await savePngAttachment(ctx, raster.png, `${diagram.name}.png`);
					return {
						...result,
						files,
						preview: ref
					};
				} catch (error) {
					return {
						...result,
						files,
						issues: [...result.issues, `preview unavailable: ${error instanceof Error ? error.message : String(error)}`]
					};
				}
			} catch (error) {
				return {
					...result,
					ok: false,
					error: `render failed: ${error instanceof Error ? error.message : String(error)}`,
					files
				};
			}
		}
	});
}
const EDIT_OP_SCHEMA = {
	type: "object",
	additionalProperties: false,
	properties: {
		op: {
			type: "string",
			enum: [
				"upsert_vertex",
				"upsert_edge",
				"delete",
				"update_style",
				"update_value",
				"move",
				"resize"
			],
			required: true
		},
		id: {
			type: "string",
			required: true,
			description: "Cell id (e.g. \"n1\")"
		},
		x: { type: "number" },
		y: { type: "number" },
		w: { type: "number" },
		h: { type: "number" },
		dx: { type: "number" },
		dy: { type: "number" },
		source: { type: "string" },
		target: { type: "string" },
		value: { type: "string" },
		style: { type: "string" },
		points: {
			type: "array",
			items: {
				type: "object",
				additionalProperties: false,
				properties: {
					x: { type: "number" },
					y: { type: "number" }
				}
			}
		}
	}
};
/** Coerce raw model arguments into EditOp[] (lenient: bad ops become failures). */
function coerceEditOps(raw) {
	if (!Array.isArray(raw)) return {
		ops: [],
		errors: ["ops must be an array"]
	};
	const ops = [];
	const errors = [];
	const num = (value, fallback) => {
		const n = typeof value === "number" ? value : Number(value);
		return Number.isFinite(n) ? n : fallback;
	};
	const str = (value) => typeof value === "string" && value !== "" ? value : void 0;
	const points = (value) => {
		if (!Array.isArray(value)) return void 0;
		const out = [];
		for (const item of value) {
			if (typeof item !== "object" || item === null) continue;
			const record = item;
			out.push({
				x: num(record.x, 0),
				y: num(record.y, 0)
			});
		}
		return out;
	};
	for (const item of raw) {
		if (typeof item !== "object" || item === null) {
			errors.push("an op item is not an object");
			continue;
		}
		const record = item;
		const id = typeof record.id === "string" && record.id !== "" ? record.id : "";
		switch (record.op) {
			case "upsert_vertex":
				if (id === "") {
					errors.push("upsert_vertex requires id");
					continue;
				}
				ops.push({
					op: "upsert_vertex",
					id,
					x: num(record.x, 0),
					y: num(record.y, 0),
					w: num(record.w, 120),
					h: num(record.h, 48),
					value: str(record.value),
					style: str(record.style)
				});
				break;
			case "upsert_edge":
				if (id === "" || typeof record.source !== "string" || typeof record.target !== "string") {
					errors.push("upsert_edge requires id/source/target");
					continue;
				}
				ops.push({
					op: "upsert_edge",
					id,
					source: record.source,
					target: record.target,
					value: str(record.value),
					style: str(record.style),
					points: points(record.points)
				});
				break;
			case "delete":
				if (id === "") {
					errors.push("delete requires id");
					continue;
				}
				ops.push({
					op: "delete",
					id
				});
				break;
			case "update_style":
				if (id === "" || typeof record.style !== "string") {
					errors.push("update_style requires id/style");
					continue;
				}
				ops.push({
					op: "update_style",
					id,
					style: record.style
				});
				break;
			case "update_value":
				if (id === "" || typeof record.value !== "string") {
					errors.push("update_value requires id/value");
					continue;
				}
				ops.push({
					op: "update_value",
					id,
					value: record.value
				});
				break;
			case "move":
				if (id === "") {
					errors.push("move requires id");
					continue;
				}
				ops.push({
					op: "move",
					id,
					dx: num(record.dx, 0),
					dy: num(record.dy, 0)
				});
				break;
			case "resize":
				if (id === "") {
					errors.push("resize requires id");
					continue;
				}
				ops.push({
					op: "resize",
					id,
					w: num(record.w, 0),
					h: num(record.h, 0)
				});
				break;
			default: errors.push(`unknown op: ${String(record.op)}`);
		}
	}
	return {
		ops,
		errors
	};
}
function editTool(ctx, config) {
	return defineTool({
		name: "drawio_edit",
		description: "[dsh-drawio] Edit a workspace .drawio/.xml file with structured cell operations — upsert_vertex / upsert_edge / delete / update_style / update_value / move / resize. Pass path plus an ops array (applied in order); the file is rewritten in place and a PNG preview is shown. Never hand-edit mxGraph XML: describe changes as ops. Read the file first to learn its cell ids.",
		parameters: {
			path: {
				type: "string",
				description: "Absolute or workspace-relative path of the .drawio/.xml file to edit"
			},
			ops: {
				type: "array",
				items: EDIT_OP_SCHEMA,
				required: true,
				description: "Cell operations, applied in order"
			},
			preview: {
				type: "boolean",
				description: "Show a PNG preview inline in the chat (default true)"
			}
		},
		output: {
			schema: RESULT_SCHEMA,
			render: (_args, value) => {
				const result = value;
				const blocks = [{
					type: "text",
					text: renderResultText(result)
				}];
				if (result.preview !== void 0) blocks.push({
					type: "image",
					attachment: result.preview
				});
				return blocks;
			}
		},
		async execute(args) {
			const { path, ops: rawOps, preview } = args;
			if (typeof path !== "string" || path === "") return {
				ok: false,
				action: "edit",
				source: "",
				diagrams: 0,
				vertices: 0,
				edges: 0,
				issues: [],
				files: [],
				error: "path is required"
			};
			const source = await resolveSource(ctx, path, void 0);
			if (!source.ok) return {
				ok: false,
				action: "edit",
				source: path,
				diagrams: 0,
				vertices: 0,
				edges: 0,
				issues: [],
				files: [],
				error: source.error
			};
			const coerced = coerceEditOps(rawOps);
			if (coerced.ops.length === 0) return {
				ok: false,
				action: "edit",
				source: source.label,
				diagrams: 0,
				vertices: 0,
				edges: 0,
				issues: [],
				files: [],
				error: `no valid operations: ${coerced.errors.join("; ") || "empty ops"}`
			};
			let edited;
			try {
				edited = applyEditOps(source.content, coerced.ops);
			} catch (error) {
				return {
					ok: false,
					action: "edit",
					source: source.label,
					diagrams: 0,
					vertices: 0,
					edges: 0,
					issues: [],
					files: [],
					error: `edit failed: ${error instanceof Error ? error.message : String(error)}`
				};
			}
			const parsed = parseSource(edited.xml);
			const result = baseResult(ctx, "edit", source.label, parsed);
			result.applied = edited.applied.filter((r) => r.ok).length;
			result.failed = edited.failed;
			const failures = edited.applied.filter((r) => !r.ok);
			if (failures.length > 0) result.issues.push(...failures.map((r) => `${r.op.op} ${r.op.id ?? ""}: ${r.message ?? "failed"}`));
			if (!result.ok) return {
				...result,
				error: `edited document is invalid: ${result.error ?? ""}`
			};
			const gated = await verifyWorkspaceRoot(ctx, dirname(source.absPath));
			if (!gated.ok) return {
				...result,
				ok: false,
				error: `refusing to write outside a registered workspace: ${gated.error}`
			};
			try {
				await mkdir(dirname(source.absPath), { recursive: true });
				await writeFile(source.absPath, edited.xml, "utf8");
			} catch (error) {
				return {
					...result,
					ok: false,
					error: `write failed: ${error instanceof Error ? error.message : String(error)}`
				};
			}
			result.files.push(source.absPath);
			broadcastDrawioActivity({
				kind: "edit",
				path
			});
			if (preview !== false && parsed.ok) try {
				const diagram = parsed.diagrams[0];
				result.preview = await savePngAttachment(ctx, (await svgToPng(diagramToSvg(diagram, { fontFamily: config.fontFamily }), config.pngScale)).png, `${diagram.name}.png`);
			} catch (error) {
				result.issues.push(`preview unavailable: ${error instanceof Error ? error.message : String(error)}`);
			}
			return result;
		}
	});
}
const KIND_DESCRIPTIONS = {
	flowchart: "process flow with decision diamonds and orthogonal arrows",
	architecture: "system architecture: layers of service boxes with grouped containers",
	network: "network topology: nodes, switches and a router cloud",
	orgchart: "organization chart: hierarchy of manager/report boxes"
};
function templateTool() {
	return defineTool({
		name: "drawio_template",
		description: "[dsh-drawio] Generate a ready-to-edit drawio mxfile skeleton for a common diagram kind. Returns the XML; write it to a .drawio file in the workspace, then use drawio_render to visualize and refine it.",
		parameters: {
			kind: {
				type: "string",
				enum: [
					"flowchart",
					"architecture",
					"network",
					"orgchart"
				],
				description: "Diagram kind"
			},
			title: {
				type: "string",
				description: "Optional diagram name (defaults to the kind)"
			}
		},
		output: {
			schema: RESULT_SCHEMA,
			render: (_args, value) => [{
				type: "text",
				text: renderResultText(value)
			}]
		},
		async execute(args) {
			const { kind, title } = args;
			const safeKind = KIND_DESCRIPTIONS[kind ?? ""] !== void 0 ? kind : "flowchart";
			buildTemplate(safeKind, typeof title === "string" && title !== "" ? title : safeKind);
			broadcastDrawioActivity({ kind: "template" });
			return {
				ok: true,
				action: "template",
				source: `template:${safeKind}`,
				diagrams: 1,
				vertices: 0,
				edges: 0,
				issues: [`${KIND_DESCRIPTIONS[safeKind]} — write the XML to a .drawio file, then run drawio_render to see it`],
				files: []
			};
		}
	});
}
const ROUNDED = "rounded=1;whiteSpace=wrap;html=1;arcSize=12;";
const BOX = "whiteSpace=wrap;html=1;";
/** Generate a ready-to-edit mxfile for a diagram kind (exported for tests). */
function buildTemplate(kind, name) {
	let vertices = [];
	let edges = [];
	let n = 0;
	const vid = () => `cell-${++n}`;
	const eid = () => `edge-${++n}`;
	const layout = (rows, colGap = 60, rowGap = 60) => {
		const vs = [];
		const es = [];
		const ids = [];
		const cellW = 140;
		const cellH = 48;
		rows.forEach((row, r) => {
			const x0 = 40 + (1200 - (row.length * cellW + (row.length - 1) * colGap)) / 2;
			const rowIds = [];
			row.forEach((item, c) => {
				const id = vid();
				const w = item.w ?? cellW;
				const h = item.h ?? cellH;
				const x = x0 + c * (cellW + colGap) + (cellW - w) / 2;
				vs.push({
					id,
					x,
					y: 40 + r * (rowGap + cellH),
					w,
					h,
					value: item.value,
					style: item.style ?? ROUNDED
				});
				rowIds.push(id);
			});
			ids.push(rowIds);
		});
		for (let r = 0; r + 1 < ids.length; r += 1) for (const from of ids[r]) for (const to of ids[r + 1]) {
			const fromCell = vs.find((v) => v.id === from);
			const toCell = vs.find((v) => v.id === to);
			const fromX = fromCell.x + fromCell.w / 2;
			const toX = toCell.x + toCell.w / 2;
			const midY = (fromCell.y + fromCell.h + toCell.y) / 2;
			es.push({
				id: eid(),
				from,
				to,
				points: [{
					x: fromX,
					y: midY
				}, {
					x: toX,
					y: midY
				}]
			});
		}
		return {
			vertices: vs,
			edges: es
		};
	};
	switch (kind) {
		case "flowchart": {
			const built = layout([
				[{ value: "开始" }],
				[{ value: "获取输入" }],
				[{
					value: "条件满足？",
					style: `rhombus;whiteSpace=wrap;html=1;`
				}],
				[{ value: "处理 A" }, { value: "处理 B" }],
				[{ value: "结束" }]
			]);
			vertices = built.vertices;
			edges = built.edges;
			break;
		}
		case "architecture": {
			const container = "rounded=1;whiteSpace=wrap;html=1;arcSize=8;verticalAlign=top;fontStyle=1;";
			const service = "rounded=1;whiteSpace=wrap;html=1;arcSize=8;";
			vertices = [
				{
					id: vid(),
					x: 40,
					y: 40,
					w: 1120,
					h: 210,
					value: "客户端层",
					style: `${container}fillColor=#dae8fc;strokeColor=#6c8ebf;`
				},
				{
					id: vid(),
					x: 60,
					y: 90,
					w: 200,
					h: 130,
					value: "Web 应用",
					style: `${service}fillColor=#ffffff;strokeColor=#6c8ebf;`
				},
				{
					id: vid(),
					x: 300,
					y: 90,
					w: 200,
					h: 130,
					value: "移动端",
					style: `${service}fillColor=#ffffff;strokeColor=#6c8ebf;`
				},
				{
					id: vid(),
					x: 540,
					y: 90,
					w: 200,
					h: 130,
					value: "桌面端",
					style: `${service}fillColor=#ffffff;strokeColor=#6c8ebf;`
				},
				{
					id: vid(),
					x: 40,
					y: 300,
					w: 1120,
					h: 210,
					value: "服务层",
					style: `${container}fillColor=#d5e8d4;strokeColor=#82b366;`
				},
				{
					id: vid(),
					x: 60,
					y: 350,
					w: 240,
					h: 130,
					value: "API 网关",
					style: `${service}fillColor=#ffffff;strokeColor=#82b366;`
				},
				{
					id: vid(),
					x: 340,
					y: 350,
					w: 240,
					h: 130,
					value: "用户服务",
					style: `${service}fillColor=#ffffff;strokeColor=#82b366;`
				},
				{
					id: vid(),
					x: 620,
					y: 350,
					w: 240,
					h: 130,
					value: "订单服务",
					style: `${service}fillColor=#ffffff;strokeColor=#82b366;`
				},
				{
					id: vid(),
					x: 900,
					y: 350,
					w: 240,
					h: 130,
					value: "支付服务",
					style: `${service}fillColor=#ffffff;strokeColor=#82b366;`
				},
				{
					id: vid(),
					x: 40,
					y: 560,
					w: 1120,
					h: 170,
					value: "数据层",
					style: `${container}fillColor=#ffe6cc;strokeColor=#d79b00;`
				},
				{
					id: vid(),
					x: 60,
					y: 610,
					w: 320,
					h: 90,
					value: "MySQL 主库",
					style: `shape=cylinder3;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#d79b00;`
				},
				{
					id: vid(),
					x: 420,
					y: 610,
					w: 320,
					h: 90,
					value: "Redis 缓存",
					style: `shape=cylinder3;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#d79b00;`
				},
				{
					id: vid(),
					x: 780,
					y: 610,
					w: 360,
					h: 90,
					value: "对象存储",
					style: `shape=cylinder3;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#d79b00;`
				}
			];
			edges = [
				{
					id: eid(),
					from: "cell-2",
					to: "cell-6",
					points: [{
						x: 160,
						y: 220
					}, {
						x: 160,
						y: 350
					}]
				},
				{
					id: eid(),
					from: "cell-3",
					to: "cell-6",
					points: [{
						x: 400,
						y: 220
					}, {
						x: 400,
						y: 350
					}]
				},
				{
					id: eid(),
					from: "cell-4",
					to: "cell-6",
					points: [{
						x: 640,
						y: 220
					}, {
						x: 640,
						y: 350
					}]
				},
				{
					id: eid(),
					from: "cell-6",
					to: "cell-8",
					points: [{
						x: 460,
						y: 480
					}, {
						x: 460,
						y: 610
					}]
				},
				{
					id: eid(),
					from: "cell-7",
					to: "cell-9",
					points: [{
						x: 740,
						y: 480
					}, {
						x: 740,
						y: 610
					}]
				},
				{
					id: eid(),
					from: "cell-8",
					to: "cell-11",
					points: [{
						x: 940,
						y: 480
					}, {
						x: 940,
						y: 610
					}]
				}
			];
			break;
		}
		case "network":
			vertices = [
				{
					id: vid(),
					x: 480,
					y: 20,
					w: 240,
					h: 70,
					value: "Internet",
					style: `ellipse;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;`
				},
				{
					id: vid(),
					x: 470,
					y: 150,
					w: 260,
					h: 60,
					value: "防火墙",
					style: ROUNDED
				},
				{
					id: vid(),
					x: 100,
					y: 280,
					w: 220,
					h: 60,
					value: "核心交换机",
					style: ROUNDED
				},
				{
					id: vid(),
					x: 480,
					y: 280,
					w: 240,
					h: 60,
					value: "核心交换机",
					style: ROUNDED
				},
				{
					id: vid(),
					x: 860,
					y: 280,
					w: 220,
					h: 60,
					value: "核心交换机",
					style: ROUNDED
				},
				{
					id: vid(),
					x: 60,
					y: 420,
					w: 160,
					h: 120,
					value: "Web 服务器",
					style: BOX
				},
				{
					id: vid(),
					x: 260,
					y: 420,
					w: 160,
					h: 120,
					value: "应用服务器",
					style: BOX
				},
				{
					id: vid(),
					x: 460,
					y: 420,
					w: 160,
					h: 120,
					value: "数据库服务器",
					style: BOX
				},
				{
					id: vid(),
					x: 660,
					y: 420,
					w: 160,
					h: 120,
					value: "缓存服务器",
					style: BOX
				},
				{
					id: vid(),
					x: 860,
					y: 420,
					w: 160,
					h: 120,
					value: "备份服务器",
					style: BOX
				}
			];
			edges = [
				{
					id: eid(),
					from: "cell-1",
					to: "cell-2"
				},
				{
					id: eid(),
					from: "cell-2",
					to: "cell-3"
				},
				{
					id: eid(),
					from: "cell-2",
					to: "cell-4"
				},
				{
					id: eid(),
					from: "cell-2",
					to: "cell-5"
				},
				{
					id: eid(),
					from: "cell-3",
					to: "cell-6"
				},
				{
					id: eid(),
					from: "cell-3",
					to: "cell-7"
				},
				{
					id: eid(),
					from: "cell-4",
					to: "cell-8"
				},
				{
					id: eid(),
					from: "cell-4",
					to: "cell-9"
				},
				{
					id: eid(),
					from: "cell-5",
					to: "cell-10"
				}
			];
			break;
		case "orgchart":
			vertices = [
				{
					id: vid(),
					x: 440,
					y: 40,
					w: 320,
					h: 50,
					value: "CEO",
					style: `${BOX}fontStyle=1;`
				},
				{
					id: vid(),
					x: 140,
					y: 160,
					w: 240,
					h: 50,
					value: "技术 VP",
					style: BOX
				},
				{
					id: vid(),
					x: 480,
					y: 160,
					w: 240,
					h: 50,
					value: "产品 VP",
					style: BOX
				},
				{
					id: vid(),
					x: 820,
					y: 160,
					w: 240,
					h: 50,
					value: "运营 VP",
					style: BOX
				},
				{
					id: vid(),
					x: 60,
					y: 290,
					w: 180,
					h: 50,
					value: "前端组",
					style: BOX
				},
				{
					id: vid(),
					x: 270,
					y: 290,
					w: 180,
					h: 50,
					value: "后端组",
					style: BOX
				},
				{
					id: vid(),
					x: 480,
					y: 290,
					w: 180,
					h: 50,
					value: "设计组",
					style: BOX
				},
				{
					id: vid(),
					x: 690,
					y: 290,
					w: 180,
					h: 50,
					value: "测试组",
					style: BOX
				},
				{
					id: vid(),
					x: 900,
					y: 290,
					w: 180,
					h: 50,
					value: "市场组",
					style: BOX
				}
			];
			edges = [
				{
					id: eid(),
					from: "cell-1",
					to: "cell-2"
				},
				{
					id: eid(),
					from: "cell-1",
					to: "cell-3"
				},
				{
					id: eid(),
					from: "cell-1",
					to: "cell-4"
				},
				{
					id: eid(),
					from: "cell-2",
					to: "cell-5"
				},
				{
					id: eid(),
					from: "cell-2",
					to: "cell-6"
				},
				{
					id: eid(),
					from: "cell-3",
					to: "cell-7"
				},
				{
					id: eid(),
					from: "cell-3",
					to: "cell-8"
				},
				{
					id: eid(),
					from: "cell-4",
					to: "cell-9"
				}
			];
	}
	const cellXml = (v) => `      <mxCell id="${v.id}" value="${xmlAttr(v.value)}" style="${v.style}" vertex="1" parent="1"><mxGeometry x="${v.x}" y="${v.y}" width="${v.w}" height="${v.h}" as="geometry"/></mxCell>`;
	const edgeXml = (e) => {
		const points = (e.points ?? []).map((p) => `<mxPoint x="${p.x}" y="${p.y}" as="points"/>`).join("");
		const value = e.value === void 0 ? "" : ` value="${xmlAttr(e.value)}"`;
		const geometry = e.points !== void 0 && e.points.length > 0 ? `<mxGeometry relative="1" as="geometry"><Array as="points">${points}</Array></mxGeometry>` : "<mxGeometry relative=\"1\" as=\"geometry\"/>";
		return `      <mxCell id="${e.id}"${value} style="edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;endArrow=block;" edge="1" parent="1" source="${e.from}" target="${e.to}">${geometry}</mxCell>`;
	};
	const cells = [...vertices.map(cellXml), ...edges.map(edgeXml)].join("\n");
	return `<?xml version="1.0" encoding="UTF-8"?>
<mxfile host="dsh-drawio" version="0.1.0">
  <diagram id="${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}" name="${xmlAttr(name)}">
    <mxGraphModel dx="0" dy="0" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1169" pageHeight="827" math="0" shadow="0">
      <root>
        <mxCell id="0"/>
        <mxCell id="1" parent="0"/>
${cells}
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>`;
}
/** Escape a value for an XML attribute (template generation). */
function xmlAttr(value) {
	return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("\"", "&quot;");
}
/** Human-readable summary of a tool result (chat text block). */
function renderResultText(result) {
	const lines = [];
	if (!result.ok) {
		lines.push(`❌ drawio ${result.action} 失败: ${result.error ?? "unknown error"}`);
		return lines.join("\n");
	}
	lines.push(`${{
		validate: "✅ 校验通过",
		render: "✅ 渲染完成",
		template: "✅ 模板已生成"
	}[result.action] ?? "✅"} · ${result.source}`);
	lines.push(`图 ${result.diagrams} 张 · 节点 ${result.vertices} · 连线 ${result.edges}`);
	for (const issue of result.issues.slice(0, 8)) lines.push(`· ${issue}`);
	if (result.issues.length > 8) lines.push(`· …还有 ${result.issues.length - 8} 条备注`);
	for (const file of result.files) lines.push(`📄 ${file}`);
	if (result.preview !== void 0) lines.push("🖼️ 预览已插入对话（PNG）");
	return lines.join("\n");
}
/** Build the tool set for the resolved config. */
function buildAgentTools(ctx, config) {
	const out = [];
	if (exposed(config, "drawio_validate")) out.push(validateTool(ctx));
	if (exposed(config, "drawio_render")) out.push(renderTool(ctx, config));
	if (exposed(config, "drawio_edit")) out.push(editTool(ctx, config));
	if (exposed(config, "drawio_template")) out.push(templateTool());
	return out;
}
//#endregion
//#region src/index.ts
const name = "dsh-drawio";
/** Hard services: the tool registry + workspace registry + web server. */
const inject = [
	"tools",
	"workspaceRegistry",
	"webServer",
	"loader"
];
/**
* Mount the drawio plugin: the /dsh-drawio routes (board file ops) and the
* agent tools (config-gated exposure).
*
* @param ctx - context carrying tools + workspaceRegistry + webServer + loader.
* @param config - raw loader config; defaults applied through {@link resolveConfig}.
*/
async function apply(ctx, config) {
	const resolved = resolveConfig(config);
	const disposeRoutes = registerDrawioRoutes(ctx, new DrawioService(ctx));
	ctx.effect(() => () => disposeRoutes(), "dsh-drawio: /dsh-drawio routes");
	const disposeStatic = serveStaticDir(ctx, "/drawio", fileURLToPath(new URL("../assets/drawio-webapp", import.meta.url)));
	ctx.effect(() => () => disposeStatic(), "dsh-drawio: /drawio static");
	const watcher = new DiagramWatchService(ctx);
	watcher.start();
	ctx.effect(() => () => watcher.stop(), "dsh-drawio: diagram watcher");
	ctx.inject(["tools"], (scope) => {
		const defs = buildAgentTools(ctx, resolved);
		scope.effect(() => {
			const disposers = defs.map((def) => scope.tools.register(def));
			return () => {
				for (const dispose of disposers) dispose();
			};
		}, `dsh-drawio: ${defs.length} agent tool(s)`);
	});
}
//#endregion
export { DIAGRAM_EXTENSIONS, DrawioService, absoluteRect, apply, applyEditOps, buildAgentTools, buildTemplate, decodeXmlEntities, diagramToSvg, fontFromStyle, inject, isPathInside, linesHeight, name, normalizeForPrefix, parseDiagrams, parseHtmlLabel, parseStyle, parseXml, registerDrawioRoutes, renderResultText, resolveConfig, runWidth, savePngAttachment, serializeXml, serveStaticDir, svgToPng, verifyWorkspaceRoot, wrapRuns, xmlEscape };
