window.__ModuleLoader__.load({
	id: "mino-drawio",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
		let react_jsx_runtime = require("react/jsx-runtime");
		let react_dom_client = require("react-dom/client");
		//#region src/client/controller.ts
		/** Minimal observable open/close controller. */
		var DrawioController = class {
			open = false;
			listeners = /* @__PURE__ */ new Set();
			getSnapshot() {
				return { open: this.open };
			}
			toggle() {
				this.open = !this.open;
				this.notify();
			}
			closeBoard() {
				if (!this.open) return;
				this.open = false;
				this.notify();
			}
			subscribe(listener) {
				this.listeners.add(listener);
				return () => {
					this.listeners.delete(listener);
				};
			}
			notify() {
				for (const listener of this.listeners) listener();
			}
		};
		//#endregion
		//#region src/client/drawio-col.ts
		/** Width persistence key. */
		const COL_WIDTH_KEY = "dsh-drawio-col-width-px";
		const DEFAULT_WIDTH = 520;
		const MIN_WIDTH = 300;
		const MAX_WIDTH = 1e3;
		/** Locate the frame grid: the `data-dsh-frame` stamp or the sidebar parent. */
		function findFrame() {
			const stamped = document.querySelector("[data-dsh-frame]");
			if (stamped !== null) return stamped;
			return document.querySelector("[class*=\"sidebarCol\"]")?.parentElement ?? null;
		}
		/** The persisted width (bounded), or the default. */
		function persistedWidth() {
			try {
				const raw = Number(localStorage.getItem(COL_WIDTH_KEY));
				if (Number.isFinite(raw)) return Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, raw));
			} catch {}
			return DEFAULT_WIDTH;
		}
		/**
		* The drawio column controller: owns the column element, its width, the drag
		* handle, and the open/closed state (collapsed = width 0, kept mounted).
		*/
		var DrawioCol = class {
			frame = null;
			col = null;
			handle = null;
			waitObserver = null;
			width = persistedWidth();
			open = false;
			/** The column element once attached (null while the shell is not mounted). */
			get element() {
				return this.col;
			}
			/** Whether the column is currently visible. */
			get isOpen() {
				return this.open;
			}
			/** Attach to the frame once it appears (self-healing on shell rebuilds). */
			mount() {
				const tryAttach = () => {
					if (this.frame !== null && this.frame.isConnected) {
						if (!this.frame.contains(this.col)) this.attach(this.frame);
						return;
					}
					const frame = findFrame();
					if (frame === null) return;
					this.attach(frame);
				};
				this.waitObserver = new MutationObserver(() => {
					tryAttach();
				});
				this.waitObserver.observe(document.body, {
					childList: true,
					subtree: true
				});
				tryAttach();
			}
			/** Toggle the column (open ⇄ collapsed-to-zero). */
			toggle() {
				this.setOpen(!this.open);
			}
			/** Open or collapse the column (kept mounted either way). */
			setOpen(open) {
				this.open = open;
				if (this.col === null) return;
				if (open) {
					this.col.style.width = `${this.width}px`;
					this.col.style.display = "flex";
					if (this.handle !== null) this.handle.style.display = "block";
				} else {
					this.col.style.width = "0px";
					this.col.style.display = "none";
					if (this.handle !== null) this.handle.style.display = "none";
				}
			}
			/** Create the column, handle, and drag wiring. */
			attach(frame) {
				this.frame = frame;
				const col = document.createElement("div");
				col.dataset.dshDrawioCol = "";
				col.style.width = "0px";
				col.style.display = "none";
				col.style.minWidth = "0";
				col.style.overflow = "hidden";
				col.style.position = "relative";
				col.style.height = "100%";
				col.style.gridRow = "1";
				col.style.gridColumn = "6";
				frame.appendChild(col);
				this.col = col;
				const handle = document.createElement("div");
				handle.dataset.dshDrawioColHandle = "";
				handle.style.cssText = [
					"position:absolute",
					"left:-5px",
					"top:0",
					"bottom:0",
					"width:10px",
					"cursor:col-resize",
					"z-index:80",
					"display:none"
				].join(";");
				handle.addEventListener("pointerdown", (event) => {
					event.preventDefault();
					event.clientX;
					this.width;
					const frameRight = frame.getBoundingClientRect().right;
					const onMove = (move) => {
						const next = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, frameRight - move.clientX));
						this.width = next;
						col.style.width = `${next}px`;
						try {
							localStorage.setItem(COL_WIDTH_KEY, String(Math.round(next)));
						} catch {}
					};
					const onUp = () => {
						window.removeEventListener("pointermove", onMove);
						window.removeEventListener("pointerup", onUp);
					};
					window.addEventListener("pointermove", onMove);
					window.addEventListener("pointerup", onUp);
				});
				col.appendChild(handle);
				this.handle = handle;
				this.setOpen(this.open);
			}
			/** Detach observers and the column. */
			dispose() {
				this.waitObserver?.disconnect();
				this.col?.remove();
				this.col = null;
				this.handle = null;
				this.frame = null;
			}
		};
		//#endregion
		//#region src/client/events.ts
		/** Open the EventSource; returns a disposer. */
		function subscribeDrawioEvents(onActivity) {
			const source = new EventSource("/dsh-drawio/events");
			source.onmessage = (event) => {
				try {
					onActivity(JSON.parse(event.data));
				} catch {}
			};
			return () => {
				source.close();
			};
		}
		//#endregion
		//#region src/client/locales.ts
		/**
		* dsh-drawio surface copy (zh/en).
		*
		* @module dsh-drawio/client/locales
		*/
		const ZH = {
			"entry.label": "Drawio 画板",
			"panel.title": "Drawio 画板",
			"panel.subtitle": "工作区图表 · 实时渲染",
			"panel.noRoot": "未打开项目工作区，请先打开一个会话项目。",
			"files.empty": "未找到 .drawio / .xml 图表文件",
			"files.loading": "加载中…",
			"files.refresh": "刷新列表",
			"files.toggle": "文件",
			"files.tip": "显示/隐藏工作区文件列表",
			"editor.placeholder": "在此粘贴或编辑 drawio XML（mxfile / mxGraphModel）…",
			"editor.newFile": "新建空白图",
			"action.render": "渲染",
			"action.save": "保存到项目",
			"action.saveAs": "另存为…",
			"action.exportPng": "导出 PNG",
			"action.copySvg": "复制 SVG",
			"action.editor": "在编辑器中打开",
			"action.source": "源码",
			"source.tip": "显示/隐藏 XML 源码",
			"action.editorClose": "关闭编辑器",
			"action.reload": "重新加载",
			"editor.externalReload": "检测到外部修改，已刷新编辑器",
			"follow.on": "自动跟随:开",
			"follow.off": "自动跟随:关",
			"follow.tip": "AI 改动文件时自动刷新预览/编辑器",
			"follow.synced": "已同步 AI 改动",
			"save.nameHint": "文件名（.drawio）",
			"save.placeholder": "diagram.drawio",
			"save.busy": "保存中…",
			"save.ok": "已保存",
			"save.err": "保存失败",
			"render.err": "渲染失败",
			"parse.err": "XML 解析错误",
			"preview.stats": "节点 {vertices} · 连线 {edges}",
			"preview.empty": "输入 XML 后点击「渲染」，或从左侧选择一个文件。",
			"preview.pending": "渲染中…",
			"export.done": "PNG 已导出",
			"export.err": "导出失败",
			"copied": "SVG 已复制"
		};
		const EN = {
			"entry.label": "Drawio Board",
			"panel.title": "Drawio Board",
			"panel.subtitle": "Workspace diagrams · live render",
			"panel.noRoot": "No project workspace open — open a session project first.",
			"files.empty": "No .drawio / .xml diagram files found",
			"files.loading": "Loading…",
			"files.refresh": "Refresh",
			"files.toggle": "Files",
			"files.tip": "Toggle workspace file list",
			"editor.placeholder": "Paste or edit drawio XML (mxfile / mxGraphModel) here…",
			"editor.newFile": "New blank diagram",
			"action.render": "Render",
			"action.save": "Save to project",
			"action.saveAs": "Save as…",
			"action.exportPng": "Export PNG",
			"action.copySvg": "Copy SVG",
			"action.editor": "Open in editor",
			"action.source": "Source",
			"source.tip": "Toggle XML source",
			"action.editorClose": "Close editor",
			"action.reload": "Reload",
			"editor.externalReload": "External change detected, editor reloaded",
			"follow.on": "Follow:ON",
			"follow.off": "Follow:OFF",
			"follow.tip": "Auto-refresh preview/editor when the agent changes files",
			"follow.synced": "Synced agent changes",
			"save.nameHint": "File name (.drawio)",
			"save.placeholder": "diagram.drawio",
			"save.busy": "Saving…",
			"save.ok": "Saved",
			"save.err": "Save failed",
			"render.err": "Render failed",
			"parse.err": "XML parse error",
			"preview.stats": "{vertices} vertices · {edges} edges",
			"preview.empty": "Enter XML and hit Render, or pick a file from the list.",
			"preview.pending": "Rendering…",
			"export.done": "PNG exported",
			"export.err": "Export failed",
			"copied": "SVG copied"
		};
		//#endregion
		//#region src/client/i18n.ts
		/**
		* 画板 surface copy lookup (mirrors the toolbox i18n helper).
		*
		* @module dsh-drawio/client/i18n
		*/
		const DICTS = {
			zh: ZH,
			en: EN
		};
		/** The current UI language (document lang or zh fallback). */
		function currentLang() {
			return typeof document !== "undefined" && document.documentElement.lang === "en" ? "en" : "zh";
		}
		/** Look up one copy string, substituting {placeholders}. */
		function lookup(lang, key, params = {}) {
			let text = DICTS[lang][key] ?? DICTS.zh[key] ?? key;
			for (const [name, value] of Object.entries(params)) text = text.replaceAll(`{${name}}`, String(value));
			return text;
		}
		/** Look up in the current UI language. */
		function t(key, params = {}) {
			return lookup(currentLang(), key, params);
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
		//#region \0dsh-css:/home/runner/work/dsh-drawio/dsh-drawio/src/client/board.module.css.mjs
		const css = ".cI3ikG_board{background:var(--dsh-color-bg,#fff);height:100%;min-height:0;color:var(--dsh-color-text,#1d2129);flex-direction:column;font-size:13px;display:flex}.cI3ikG_empty{height:100%;color:var(--dsh-color-text-2,#86909c);text-align:center;justify-content:center;align-items:center;padding:24px;display:flex}.cI3ikG_toolbar{border-bottom:1px solid var(--dsh-color-border,#e5e6eb);flex-wrap:wrap;align-items:center;gap:6px;padding:6px 8px;display:flex}.cI3ikG_title{white-space:nowrap;font-size:14px;font-weight:600}.cI3ikG_root{color:var(--dsh-color-text-2,#86909c);text-overflow:ellipsis;white-space:nowrap;max-width:120px;font-size:11px;overflow:hidden}.cI3ikG_spacer{flex:1}.cI3ikG_btn{border:1px solid var(--dsh-color-border,#e5e6eb);background:var(--dsh-color-fill,#f7f8fa);color:inherit;cursor:pointer;white-space:nowrap;border-radius:4px;padding:3px 10px;font-size:12px}.cI3ikG_btn:hover:not(:disabled){border-color:var(--dsh-color-primary,#4080ff);color:var(--dsh-color-primary,#4080ff)}.cI3ikG_btn:disabled{opacity:.45;cursor:default}.cI3ikG_btnPrimary{border:1px solid var(--dsh-color-primary,#4080ff);background:var(--dsh-color-primary,#4080ff);color:#fff;cursor:pointer;white-space:nowrap;border-radius:4px;padding:3px 12px;font-size:12px}.cI3ikG_btnPrimary:disabled{opacity:.6;cursor:default}.cI3ikG_nameInput{border:1px solid var(--dsh-color-border,#e5e6eb);color:inherit;background:0 0;border-radius:4px;outline:none;width:170px;padding:3px 8px;font-size:12px}.cI3ikG_nameInput:focus{border-color:var(--dsh-color-primary,#4080ff)}.cI3ikG_main{flex:1;min-height:0;display:flex}.cI3ikG_filePane{border-right:1px solid var(--dsh-color-border,#e5e6eb);flex-direction:column;width:150px;min-width:120px;min-height:0;display:flex}.cI3ikG_fileHeader{color:var(--dsh-color-text-2,#86909c);border-bottom:1px solid var(--dsh-color-border,#e5e6eb);padding:6px 12px;font-size:12px}.cI3ikG_fileList{flex:1;min-height:0;padding:4px;overflow:auto}.cI3ikG_file{text-align:left;width:100%;color:inherit;cursor:pointer;background:0 0;border:none;border-radius:4px;align-items:center;gap:6px;padding:5px 8px;font-size:12px;display:flex}.cI3ikG_file:hover{background:var(--dsh-color-fill,#f7f8fa)}.cI3ikG_fileActive{background:color-mix(in srgb, var(--dsh-color-primary,#4080ff) 14%, transparent)}.cI3ikG_fileIcon{color:var(--dsh-color-primary,#4080ff);flex:none;display:inline-flex}.cI3ikG_fileName{text-overflow:ellipsis;white-space:nowrap;overflow:hidden}.cI3ikG_editPane{flex-direction:column;flex:1;min-width:0;min-height:0;display:flex}.cI3ikG_editorHeader,.cI3ikG_previewHeader{color:var(--dsh-color-text-2,#86909c);border-bottom:1px solid var(--dsh-color-border,#e5e6eb);background:var(--dsh-color-fill,#f7f8fa);flex:none;align-items:center;gap:10px;padding:5px 12px;font-size:12px;display:flex}.cI3ikG_editor{resize:none;min-height:80px;color:inherit;box-sizing:border-box;background:0 0;border:none;outline:none;flex:0 0 160px;width:100%;padding:10px 12px;font-family:SFMono-Regular,Consolas,Liberation Mono,Menlo,monospace;font-size:12px;line-height:1.5}.cI3ikG_preview{background:var(--dsh-color-bg,#fff);flex:1;min-height:0;position:relative}.cI3ikG_previewFrame{border:none;width:100%;height:100%;display:block}.cI3ikG_hint{color:var(--dsh-color-text-3,#c9cdd4);text-align:center;padding:24px;font-size:12px}.cI3ikG_error{color:#d4380d;white-space:pre-wrap;word-break:break-all;padding:10px 12px;font-family:SFMono-Regular,Consolas,monospace;font-size:12px}.cI3ikG_errorInline{color:#d4380d}.cI3ikG_errorBar{color:#d4380d;background:#d4380d0f;border-top:1px solid #d4380d4d;padding:4px 12px;font-size:12px}.cI3ikG_okBar{color:#389e0d;background:#389e0d0f;border-top:1px solid #389e0d4d;padding:4px 12px;font-size:12px}.cI3ikG_stats{margin-left:auto}.cI3ikG_entry{width:100%;color:inherit;cursor:pointer;text-align:left;background:0 0;border:none;border-radius:4px;align-items:center;gap:8px;padding:7px 12px;font-size:13px;display:flex}.cI3ikG_entry:hover{background:var(--dsh-color-fill,#f2f3f5)}.cI3ikG_entry[data-active=true]{background:color-mix(in srgb, var(--dsh-color-primary,#4080ff) 14%, transparent)}.cI3ikG_entryIcon{color:var(--dsh-color-primary,#4080ff);display:inline-flex}.cI3ikG_editorFrame{background:#fff;border:none;flex:1;width:100%;min-height:0;display:block}.cI3ikG_btnActive{border:1px solid var(--dsh-color-primary,#4080ff);background:color-mix(in srgb, var(--dsh-color-primary,#4080ff) 14%, transparent);color:var(--dsh-color-primary,#4080ff);cursor:pointer;white-space:nowrap;border-radius:4px;padding:3px 10px;font-size:12px}.cI3ikG_btnDisabled{border:1px solid var(--dsh-color-border,#e5e6eb);background:var(--dsh-color-fill,#f7f8fa);color:var(--dsh-color-text-3,#c9cdd4);white-space:nowrap;border-radius:4px;padding:3px 10px;font-size:12px}.cI3ikG_okInline{color:#389e0d;text-overflow:ellipsis;white-space:nowrap;margin-left:auto;font-size:12px;overflow:hidden}.cI3ikG_previewSvg{box-sizing:border-box;background:#fff;padding:12px;position:absolute;inset:0;overflow:auto}.cI3ikG_previewSvg svg{width:100%;min-width:640px;height:100%;min-height:420px}";
		const tagId = "dsh-drawio/board.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-drawio";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var board_module_css_default = {
			"board": "cI3ikG_board",
			"editPane": "cI3ikG_editPane",
			"previewHeader": "cI3ikG_previewHeader",
			"spacer": "cI3ikG_spacer",
			"btn": "cI3ikG_btn",
			"title": "cI3ikG_title",
			"filePane": "cI3ikG_filePane",
			"btnDisabled": "cI3ikG_btnDisabled",
			"stats": "cI3ikG_stats",
			"toolbar": "cI3ikG_toolbar",
			"fileIcon": "cI3ikG_fileIcon",
			"nameInput": "cI3ikG_nameInput",
			"btnPrimary": "cI3ikG_btnPrimary",
			"errorBar": "cI3ikG_errorBar",
			"fileActive": "cI3ikG_fileActive",
			"entry": "cI3ikG_entry",
			"previewSvg": "cI3ikG_previewSvg",
			"okInline": "cI3ikG_okInline",
			"entryIcon": "cI3ikG_entryIcon",
			"btnActive": "cI3ikG_btnActive",
			"hint": "cI3ikG_hint",
			"editorFrame": "cI3ikG_editorFrame",
			"root": "cI3ikG_root",
			"fileList": "cI3ikG_fileList",
			"empty": "cI3ikG_empty",
			"preview": "cI3ikG_preview",
			"main": "cI3ikG_main",
			"error": "cI3ikG_error",
			"file": "cI3ikG_file",
			"errorInline": "cI3ikG_errorInline",
			"fileName": "cI3ikG_fileName",
			"previewFrame": "cI3ikG_previewFrame",
			"editor": "cI3ikG_editor",
			"fileHeader": "cI3ikG_fileHeader",
			"okBar": "cI3ikG_okBar",
			"editorHeader": "cI3ikG_editorHeader"
		};
		//#endregion
		//#region src/client/board.tsx
		/**
		* The 画板 view: workspace diagram file list + XML editor + live SVG preview
		* (the shared zero-dependency translator runs right in the browser), with
		* save-to-workspace, PNG export and SVG copy.
		*
		* @module dsh-drawio/client/board
		*/
		const ICON_SVG = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 4h16v13H4z"/><path d="M4 9h16"/><circle cx="7.5" cy="12.5" r="1.2" fill="currentColor" stroke="none"/><circle cx="12" cy="12.5" r="1.2" fill="currentColor" stroke="none"/><path d="M9 17l3-3 2 2 2-3"/></svg>`;
		function BoardView({ makeApi, sessions, fontFamily }) {
			const root = useSyncExternalStoreSafe(sessions);
			const api = (0, react.useMemo)(() => root === "" ? null : makeApi(root), [root, makeApi]);
			const [entries, setEntries] = (0, react.useState)(null);
			const [listError, setListError] = (0, react.useState)(null);
			const [selected, setSelected] = (0, react.useState)(null);
			const [xml, setXml] = (0, react.useState)("");
			const [draftName, setDraftName] = (0, react.useState)("");
			const [saveState, setSaveState] = (0, react.useState)({ kind: "idle" });
			const [renderResult, setRenderResult] = (0, react.useState)(null);
			const [renderError, setRenderError] = (0, react.useState)(null);
			const [renderPending, setRenderPending] = (0, react.useState)(false);
			const previewRef = (0, react.useRef)(null);
			const [showSource, setShowSource] = (0, react.useState)(false);
			const [showFiles, setShowFiles] = (0, react.useState)(false);
			const [followEnabled, setFollowEnabled] = (0, react.useState)(true);
			const [userEditing, setUserEditing] = (0, react.useState)(false);
			const [fileMtime, setFileMtime] = (0, react.useState)(null);
			const userEditingRef = (0, react.useRef)(false);
			userEditingRef.current = userEditing;
			const followRef = (0, react.useRef)(true);
			followRef.current = followEnabled;
			const refresh = (0, react.useCallback)(async () => {
				if (root === "" || api === null) {
					setEntries(null);
					return;
				}
				setListError(null);
				setEntries(null);
				try {
					const result = await api.list({ root });
					setEntries(result.entries);
				} catch (error) {
					setListError(error instanceof Error ? error.message : String(error));
					setEntries([]);
				}
			}, [root, api]);
			(0, react.useEffect)(() => {
				refresh();
			}, [refresh]);
			const openFile = (0, react.useCallback)(async (path) => {
				if (root === "" || api === null) return;
				try {
					const result = await api.read({
						root,
						path
					});
					setSelected(path);
					setDraftName(path.split("/").pop() ?? path);
					setXml(result.content);
					setFileMtime(result.mtime);
					setSaveState({ kind: "idle" });
				} catch (error) {
					setRenderError(error instanceof Error ? error.message : String(error));
				}
			}, [root, api]);
			(0, react.useEffect)(() => {
				if (xml.trim() === "") {
					setRenderResult(null);
					setRenderError(null);
					return;
				}
				setRenderPending(true);
				const timer = setTimeout(() => {
					try {
						const diagram = parseDiagrams(xml)[0];
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
						const svg = diagramToSvg(diagram, { fontFamily });
						setRenderResult({
							svg,
							vertices,
							edges
						});
						setRenderError(null);
					} catch (error) {
						setRenderResult(null);
						setRenderError(error instanceof Error ? error.message : String(error));
					} finally {
						setRenderPending(false);
					}
				}, 350);
				return () => {
					clearTimeout(timer);
					setRenderPending(false);
				};
			}, [xml, fontFamily]);
			const saveFile = (0, react.useCallback)(async () => {
				if (root === "" || api === null || xml.trim() === "") return;
				const name = draftName.trim() === "" ? "diagram.drawio" : draftName.trim();
				const target = name.endsWith(".drawio") || name.endsWith(".xml") || name.endsWith(".svg") ? name : `${name}.drawio`;
				const dir = selected === null ? "" : selected.split("/").slice(0, -1).join("/");
				const path = dir === "" ? target : `${dir}/${target}`;
				setSaveState({ kind: "busy" });
				try {
					const result = await api.save({
						root,
						path,
						content: xml
					});
					setSelected(result.path);
					setSaveState({
						kind: "ok",
						message: `${t("save.ok")}: ${result.path}`
					});
					refresh();
				} catch (error) {
					setSaveState({
						kind: "err",
						message: error instanceof Error ? error.message : String(error)
					});
				}
			}, [
				root,
				api,
				xml,
				draftName,
				selected,
				refresh
			]);
			const exportPng = (0, react.useCallback)(async () => {
				if (renderResult === null) return;
				try {
					const blob = new Blob([renderResult.svg], { type: "image/svg+xml;charset=utf-8" });
					const url = URL.createObjectURL(blob);
					const image = new Image();
					await new Promise((resolveImage, reject) => {
						image.onload = () => resolveImage();
						image.onerror = () => reject(/* @__PURE__ */ new Error("SVG decode failed"));
						image.src = url;
					});
					const canvas = document.createElement("canvas");
					const scale = 2;
					canvas.width = image.naturalWidth * scale;
					canvas.height = image.naturalHeight * scale;
					const ctx2d = canvas.getContext("2d");
					if (ctx2d === null) throw new Error("canvas unavailable");
					ctx2d.fillStyle = "#ffffff";
					ctx2d.fillRect(0, 0, canvas.width, canvas.height);
					ctx2d.drawImage(image, 0, 0, canvas.width, canvas.height);
					URL.revokeObjectURL(url);
					const pngUrl = canvas.toDataURL("image/png");
					const anchor = document.createElement("a");
					anchor.href = pngUrl;
					anchor.download = `${(draftName || "diagram").replace(/\.(drawio|xml|svg)$/i, "")}.png`;
					anchor.click();
					setSaveState({
						kind: "ok",
						message: t("export.done")
					});
				} catch (error) {
					setSaveState({
						kind: "err",
						message: `${t("export.err")}: ${error instanceof Error ? error.message : String(error)}`
					});
				}
			}, [renderResult, draftName]);
			const copySvg = (0, react.useCallback)(async () => {
				if (renderResult === null) return;
				try {
					await navigator.clipboard.writeText(renderResult.svg);
					setSaveState({
						kind: "ok",
						message: t("copied")
					});
				} catch (error) {
					setSaveState({
						kind: "err",
						message: error instanceof Error ? error.message : String(error)
					});
				}
			}, [renderResult]);
			const [editorOpen, setEditorOpen] = (0, react.useState)(false);
			const [editorNonce, setEditorNonce] = (0, react.useState)(0);
			const [lastKnownMtime, setLastKnownMtime] = (0, react.useState)(null);
			const editorRef = (0, react.useRef)(null);
			const buildEditorUrl = (0, react.useCallback)((root, path) => {
				const raw = `/dsh-drawio/raw?root=${encodeURIComponent(root)}&path=${encodeURIComponent(path)}`;
				return `/drawio/index.html?${new URLSearchParams({
					embed: "1",
					spin: "1",
					proto: "json",
					ui: "min",
					mod: "0"
				}).toString()}&url=${encodeURIComponent(raw)}`;
			}, []);
			const openEditor = (0, react.useCallback)(async () => {
				if (root === "" || api === null || selected === null) return;
				try {
					const info = await api.read({
						root,
						path: selected
					});
					setLastKnownMtime(info.mtime);
					setEditorNonce((n) => n + 1);
					setEditorOpen(true);
					setSaveState({ kind: "idle" });
				} catch (error) {
					setSaveState({
						kind: "err",
						message: `${t("action.editor")}: ${error instanceof Error ? error.message : String(error)}`
					});
				}
			}, [
				root,
				api,
				selected
			]);
			const persistFromEditor = (0, react.useCallback)(async (xml) => {
				if (root === "" || api === null || selected === null) return;
				setSaveState({ kind: "busy" });
				try {
					const result = await api.save({
						root,
						path: selected,
						content: xml
					});
					setLastKnownMtime(result.mtime);
					setXml(xml);
					setSaveState({
						kind: "ok",
						message: `${t("save.ok")}: ${result.path}`
					});
					refresh();
				} catch (error) {
					setSaveState({
						kind: "err",
						message: error instanceof Error ? error.message : String(error)
					});
				}
			}, [
				root,
				api,
				selected,
				refresh
			]);
			const injectEditorXml = (0, react.useCallback)(async () => {
				if (root === "" || api === null || selected === null || !editorOpen) return;
				for (let attempt = 0; attempt < 14; attempt += 1) {
					if (!editorOpen) return;
					const iframe = editorRef.current;
					if (iframe === void 0 || iframe === null) {
						await new Promise((resolve) => window.setTimeout(resolve, 1500));
						continue;
					}
					try {
						const doc = iframe.contentDocument;
						if (doc !== null && doc.querySelectorAll(".geDiagramContainer svg path, .geDiagramContainer svg rect, .geDiagramContainer foreignObject").length > 0) return;
					} catch {}
					try {
						const info = await api.read({
							root,
							path: selected
						});
						const target = iframe.contentWindow;
						if (target !== null) {
							target.postMessage({
								event: "load",
								data: { xml: info.content }
							}, window.location.origin);
							target.postMessage(JSON.stringify({
								action: "load",
								xml: info.content
							}), window.location.origin);
						}
					} catch {}
					await new Promise((resolve) => window.setTimeout(resolve, 2e3));
				}
			}, [
				editorOpen,
				root,
				api,
				selected
			]);
			(0, react.useEffect)(() => {
				if (!editorOpen) return;
				injectEditorXml();
				const onMessage = (event) => {
					const frame = editorRef.current?.contentWindow;
					if (frame === void 0 || event.source !== frame) return;
					let data = event.data;
					if (typeof data === "string") try {
						data = JSON.parse(data);
					} catch {
						return;
					}
					if (typeof data !== "object" || data === null) return;
					const message = data;
					if (message.event === "init") {
						injectEditorXml();
						return;
					}
					if (message.event === "save" && typeof message.xml === "string") persistFromEditor(message.xml);
				};
				window.addEventListener("message", onMessage);
				return () => window.removeEventListener("message", onMessage);
			}, [
				editorOpen,
				root,
				api,
				selected,
				persistFromEditor,
				injectEditorXml
			]);
			(0, react.useEffect)(() => {
				if (!editorOpen || root === "" || api === null || selected === null) return;
				const timer = setInterval(async () => {
					try {
						const info = await api.read({
							root,
							path: selected
						});
						if (info.mtime !== lastKnownMtime) {
							const wasEditorSave = lastKnownMtime !== null && info.mtime > lastKnownMtime;
							setLastKnownMtime(info.mtime);
							if (wasEditorSave) {
								setEditorNonce((n) => n + 1);
								setSaveState({
									kind: "ok",
									message: t("editor.externalReload")
								});
							}
						}
					} catch {}
				}, 2500);
				return () => clearInterval(timer);
			}, [
				editorOpen,
				root,
				api,
				selected,
				lastKnownMtime
			]);
			const closeEditor = () => {
				setEditorOpen(false);
			};
			(0, react.useEffect)(() => {
				const onOpenPath = (event) => {
					const path = event.detail;
					if (typeof path !== "string" || path === "") return;
					setSelected((prev) => {
						if (prev !== path) openFile(path);
						return prev;
					});
				};
				window.addEventListener("dsh-drawio:open-path", onOpenPath);
				return () => window.removeEventListener("dsh-drawio:open-path", onOpenPath);
			}, [openFile]);
			(0, react.useEffect)(() => {
				if (root === "" || api === null || selected === null || editorOpen) return;
				let last = fileMtime;
				const timer = window.setInterval(async () => {
					if (!followRef.current || userEditingRef.current) {
						try {
							const info = await api.read({
								root,
								path: selected
							});
							last = info.mtime;
							setFileMtime(info.mtime);
						} catch {}
						return;
					}
					try {
						const info = await api.read({
							root,
							path: selected
						});
						if (info.mtime !== last) {
							last = info.mtime;
							setFileMtime(info.mtime);
							setXml(info.content);
							setSaveState({
								kind: "ok",
								message: t("follow.synced")
							});
						}
					} catch {}
				}, 1500);
				return () => window.clearInterval(timer);
			}, [
				root,
				api,
				selected,
				editorOpen,
				fileMtime
			]);
			(0, react.useEffect)(() => {
				if (root === "" || api === null) return;
				const timer = window.setInterval(() => {
					if (!followRef.current) return;
					api.list({ root }).then((result) => {
						setEntries((prev) => {
							if (prev === null) return prev;
							const key = (list) => list.map((e) => `${e.path}:${e.mtime}`).join("|");
							return key(result.entries) === key(prev) ? prev : result.entries;
						});
					}).catch(() => {});
				}, 5e3);
				return () => window.clearInterval(timer);
			}, [root, api]);
			const newFile = () => {
				setSelected(null);
				setDraftName(`diagram-${Date.now().toString(36)}.drawio`);
				setXml("");
				setRenderResult(null);
				setRenderError(null);
				setSaveState({ kind: "idle" });
			};
			if (root === "") return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: board_module_css_default.board,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: board_module_css_default.empty,
					children: t("panel.noRoot")
				})
			});
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: board_module_css_default.board,
				"data-dsh-drawio-board": true,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: board_module_css_default.toolbar,
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: board_module_css_default.title,
							children: t("panel.title")
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: board_module_css_default.root,
							title: root,
							children: root
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: board_module_css_default.btn,
							onClick: () => void refresh(),
							children: t("files.refresh")
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: board_module_css_default.btn,
							onClick: newFile,
							children: t("editor.newFile")
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: showFiles ? board_module_css_default.btnActive : board_module_css_default.btn,
							title: t("files.tip"),
							onClick: () => setShowFiles((v) => !v),
							children: t("files.toggle")
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: board_module_css_default.spacer }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
							className: board_module_css_default.nameInput,
							value: draftName,
							placeholder: t("save.placeholder"),
							spellCheck: false,
							onChange: (event) => setDraftName(event.target.value)
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: board_module_css_default.btnPrimary,
							disabled: saveState.kind === "busy",
							onClick: () => void saveFile(),
							children: saveState.kind === "busy" ? t("save.busy") : t("action.save")
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: board_module_css_default.btn,
							disabled: renderResult === null,
							onClick: () => void exportPng(),
							children: t("action.exportPng")
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: board_module_css_default.btn,
							disabled: renderResult === null,
							onClick: () => void copySvg(),
							children: t("action.copySvg")
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: showSource ? board_module_css_default.btnActive : board_module_css_default.btn,
							title: t("source.tip"),
							onClick: () => setShowSource((v) => !v),
							children: t("action.source")
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: followEnabled ? board_module_css_default.btnActive : board_module_css_default.btn,
							title: t("follow.tip"),
							onClick: () => setFollowEnabled((v) => !v),
							children: followEnabled ? t("follow.on") : t("follow.off")
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: selected === null || root === "" ? board_module_css_default.btnDisabled : editorOpen ? board_module_css_default.btnActive : board_module_css_default.btnPrimary,
							disabled: selected === null || root === "",
							onClick: () => {
								if (editorOpen) closeEditor();
								else openEditor();
							},
							children: editorOpen ? t("action.editorClose") : t("action.editor")
						})
					]
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: board_module_css_default.main,
					children: [showFiles && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: board_module_css_default.filePane,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: board_module_css_default.fileHeader,
							children: entries === null ? t("files.loading") : `${entries.length} files`
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: board_module_css_default.fileList,
							children: [
								listError !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									className: board_module_css_default.error,
									children: listError
								}),
								entries === null && listError === null && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									className: board_module_css_default.hint,
									children: t("files.loading")
								}),
								entries !== null && entries.length === 0 && listError === null && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									className: board_module_css_default.hint,
									children: t("files.empty")
								}),
								entries?.map((entry) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
									type: "button",
									className: selected === entry.path ? `${board_module_css_default.file} ${board_module_css_default.fileActive}` : board_module_css_default.file,
									title: `${entry.path} · ${entry.size} B`,
									onClick: () => void openFile(entry.path),
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: board_module_css_default.fileIcon,
										dangerouslySetInnerHTML: { __html: ICON_SVG }
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: board_module_css_default.fileName,
										children: entry.path
									})]
								}, entry.path))
							]
						})]
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: board_module_css_default.editPane,
						children: editorOpen && selected !== null ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: board_module_css_default.editorHeader,
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [
									selected,
									" · ",
									t("action.editor")
								] }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: board_module_css_default.btn,
									onClick: () => setEditorNonce((n) => n + 1),
									children: t("action.reload")
								}),
								saveState.kind === "ok" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: board_module_css_default.okInline,
									children: saveState.message
								}),
								saveState.kind === "err" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: board_module_css_default.errorInline,
									children: saveState.message
								})
							]
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("iframe", {
							ref: editorRef,
							className: board_module_css_default.editorFrame,
							src: buildEditorUrl(root, selected),
							title: "drawio editor"
						}, editorNonce)] }) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: board_module_css_default.previewHeader,
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: selected ?? t("editor.newFile") }),
									renderError !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: board_module_css_default.errorInline,
										children: t("render.err")
									}),
									renderResult !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: board_module_css_default.stats,
										children: t("preview.stats", {
											vertices: renderResult.vertices,
											edges: renderResult.edges
										})
									})
								]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: board_module_css_default.preview,
								ref: previewRef,
								children: [
									renderResult === null && renderError === null && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
										className: board_module_css_default.hint,
										children: t("preview.empty")
									}),
									renderError !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
										className: board_module_css_default.error,
										children: renderError
									}),
									renderResult !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
										className: board_module_css_default.previewSvg,
										dangerouslySetInnerHTML: { __html: renderResult.svg }
									})
								]
							}),
							showSource && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("textarea", {
									className: board_module_css_default.editor,
									value: xml,
									spellCheck: false,
									placeholder: t("editor.placeholder"),
									onFocus: () => setUserEditing(true),
									onBlur: () => setUserEditing(false),
									onChange: (event) => setXml(event.target.value)
								}),
								saveState.kind === "err" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									className: board_module_css_default.errorBar,
									children: saveState.message
								}),
								saveState.kind === "ok" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									className: board_module_css_default.okBar,
									children: saveState.message
								})
							] })
						] })
					})]
				})]
			});
		}
		/** Subscribe the workspace root to the session store ('' when none). */
		function useSyncExternalStoreSafe(sessions) {
			const [root, setRoot] = (0, react.useState)(() => currentRoot(sessions));
			(0, react.useEffect)(() => {
				return sessions.subscribe(() => {
					setRoot(currentRoot(sessions));
				});
			}, [sessions]);
			return root;
		}
		function currentRoot(sessions) {
			try {
				const snapshot = sessions.getSnapshot();
				const id = snapshot.current;
				const cwd = id === void 0 ? void 0 : snapshot.byId[id]?.cwd;
				return typeof cwd === "string" && cwd !== "" ? cwd : "";
			} catch {
				return "";
			}
		}
		//#endregion
		//#region src/client/sidebar-entry.ts
		/** Family rows injected by sibling plugins (kept in stable relative order). */
		const FAMILY_SELECTOR = "[data-dsh-taskboard-entry], [data-dsh-ssh-entry], [data-dsh-devtoolbox-entry]";
		/** Find the sidebar shell root element, or undefined while not yet mounted. */
		function sidebarRoot() {
			const column = document.querySelector("[data-pane=\"sidebar\"], [class*=\"sidebarCol\"]");
			if (column === null) return void 0;
			return column.querySelector("[class*=\"logoRow\"]")?.parentElement ?? column.firstElementChild;
		}
		/** The New Session button: nested in the logo row on current shells. */
		function newSessionButton(root) {
			const nested = root.querySelector("button[class*=\"newSession\"]");
			if (nested !== null) return nested;
			for (const child of Array.from(root.children)) if (child.tagName === "BUTTON") return child;
		}
		/** Build the entry row (a detached button; inserted once the shell is up). */
		function createEntry(controller) {
			const label = t("entry.label");
			const entry = document.createElement("button");
			entry.type = "button";
			entry.dataset.dshDrawioEntry = "";
			entry.className = board_module_css_default.entry;
			entry.setAttribute("aria-label", label);
			entry.innerHTML = `<span class="${board_module_css_default.entryIcon}">${ICON_SVG}</span><span>${label}</span>`;
			entry.addEventListener("click", () => {
				controller.toggle();
			});
			return entry;
		}
		/** Re-insert the entry after the New Session row / sibling family block. */
		function placeEntry(root, entry) {
			const button = newSessionButton(root);
			if (button === void 0) return false;
			if (entry.parentElement === root) return true;
			const row = button.closest("[class*=\"logoRow\"]");
			const base = row !== null && row.parentElement === root ? row : button;
			const family = Array.from(root.children).filter((el) => el instanceof HTMLElement && el.matches(FAMILY_SELECTOR));
			const anchor = family.length > 0 ? family[family.length - 1].nextElementSibling : base.nextElementSibling;
			root.insertBefore(entry, anchor);
			return true;
		}
		/**
		* Mount the sidebar entry, waiting for the shell to render and self-healing
		* on later React re-renders.
		* @param controller - the controller the entry toggles.
		* @returns disposer removing the entry and its observers.
		*/
		function mountSidebarEntry(controller) {
			const entry = createEntry(controller);
			let root;
			let placed = false;
			let rootObserver;
			const tryPlace = () => {
				if (root !== void 0 && !root.isConnected) {
					rootObserver?.disconnect();
					root = void 0;
					placed = false;
				}
				if (placed) {
					if (document.body.contains(entry)) return;
					rootObserver?.disconnect();
					root = void 0;
					placed = false;
				}
				root ??= sidebarRoot();
				if (root === void 0) return;
				placed = placeEntry(root, entry);
				if (placed) {
					rootObserver ??= new MutationObserver(() => {
						if (root === void 0 || !root.isConnected) {
							placed = false;
							tryPlace();
							return;
						}
						if (!root.contains(entry)) placeEntry(root, entry);
					});
					rootObserver.observe(root, {
						childList: true,
						subtree: true
					});
				}
			};
			const waitObserver = new MutationObserver(() => {
				tryPlace();
			});
			waitObserver.observe(document.body, {
				childList: true,
				subtree: true
			});
			const syncActive = () => {
				if (controller.getSnapshot().open) entry.dataset.active = "true";
				else delete entry.dataset.active;
			};
			const unsubscribe = controller.subscribe(syncActive);
			syncActive();
			tryPlace();
			return () => {
				waitObserver.disconnect();
				rootObserver?.disconnect();
				unsubscribe();
				entry.remove();
			};
		}
		//#endregion
		//#region src/client/view-mount.tsx
		/**
		* 画板 view mounting, side-column mode: the board lives in the drawio column
		* (a trailing grid item beside the conversation), so the user keeps the chat
		* visible while looking at the diagram. The conversation is never hidden or
		* unmounted — opening the board only widens the column.
		*
		* @module dsh-drawio/client/view-mount
		*/
		/**
		* Mount the 画板 React tree into the drawio column and bind its visibility to
		* the column controller.
		* @param col - the side-column controller (owns the container element).
		* @param makeApi - binds one workspace root to a fresh /dsh-drawio API client.
		* @param sessions - the session store (workspace root).
		* @param fontFamily - label font family list.
		* @returns disposer unmounting the tree.
		*/
		function mountDrawioView(col, makeApi, sessions, fontFamily) {
			let root;
			let container = null;
			const ensure = () => {
				const column = col.element;
				if (column === null) return;
				if (container !== null && column.contains(container)) return;
				container = document.createElement("div");
				container.dataset.dshDrawioView = "";
				container.style.cssText = "display:flex;flex-direction:column;height:100%;min-width:0;";
				column.appendChild(container);
				root = (0, react_dom_client.createRoot)(container);
				root.render(/* @__PURE__ */ (0, react_jsx_runtime.jsx)(BoardView, {
					makeApi,
					sessions,
					fontFamily
				}));
			};
			const waitObserver = new MutationObserver(() => {
				ensure();
			});
			waitObserver.observe(document.body, {
				childList: true,
				subtree: true
			});
			ensure();
			return () => {
				waitObserver.disconnect();
				root?.unmount();
				root = void 0;
				container?.remove();
				container = null;
			};
		}
		//#endregion
		//#region src/client/api.ts
		/** Error carrying the route's JSON error message. */
		var DrawioApiError = class extends Error {
			constructor(message) {
				super(message);
				this.name = "DrawioApiError";
			}
		};
		/** Parse a JSON envelope response or throw a DrawioApiError. */
		async function post(path, body) {
			let response;
			try {
				response = await fetch(path, {
					method: "POST",
					headers: { "content-type": "application/json" },
					body: JSON.stringify(body)
				});
			} catch (error) {
				throw new DrawioApiError(`network error: ${error instanceof Error ? error.message : String(error)}`);
			}
			let envelope;
			try {
				envelope = await response.json();
			} catch {
				throw new DrawioApiError(`HTTP ${response.status}: invalid JSON response`);
			}
			if (!envelope.ok) throw new DrawioApiError(`${envelope.error.code}: ${envelope.error.message}`);
			return envelope.value;
		}
		/** Fetch-based implementation of {@link DrawioRemote}. */
		var DrawioApi = class {
			root;
			/** @param root - the workspace root (session cwd) every call is bound to. */
			constructor(root) {
				this.root = root;
			}
			list(request) {
				return post("/dsh-drawio/list", {
					root: this.root,
					dir: request.dir
				});
			}
			read(request) {
				return post("/dsh-drawio/read", {
					root: this.root,
					path: request.path
				});
			}
			save(request) {
				return post("/dsh-drawio/save", {
					root: this.root,
					path: request.path,
					content: request.content
				});
			}
		};
		//#endregion
		//#region src/client/index.ts
		/** Dictionary namespace owned by this plugin. */
		const NS = "drawio";
		/** Plugin name: matches the package name, the graph row id, and the bundle id. */
		const name = "dsh-drawio";
		/** Services the surfaces read. */
		const inject = [
			"slots",
			"locale",
			"sessions"
		];
		/** Bind one workspace root to a fresh API client (rebuilt on session switch). */
		function makeApi(root) {
			return new DrawioApi(root);
		}
		/**
		* Browser plugin body: dictionaries, the sidebar entry, and the center-column
		* 画板 view.
		*
		* @param ctx - client root context.
		*/
		async function apply(ctx) {
			ctx.effect(() => ctx.locale.register(NS, {
				zh: ZH,
				en: EN
			}), "dsh-drawio: dictionaries");
			const controller = new DrawioController();
			const col = new DrawioCol();
			col.mount();
			const syncCol = () => {
				col.setOpen(controller.getSnapshot().open);
			};
			const unsubscribeCol = controller.subscribe(syncCol);
			syncCol();
			const disposers = [];
			disposers.push(subscribeDrawioEvents((activity) => {
				col.setOpen(true);
				if (typeof activity.path === "string" && activity.path !== "") window.dispatchEvent(new CustomEvent("dsh-drawio:open-path", { detail: activity.path }));
			}));
			try {
				const fontFamily = typeof document !== "undefined" ? getComputedStyle(document.documentElement).getPropertyValue("--dsh-drawio-font")?.trim() || void 0 : void 0;
				disposers.push(mountSidebarEntry(controller));
				disposers.push(mountDrawioView(col, makeApi, ctx.sessions.list, fontFamily ?? "Helvetica, Arial, 'PingFang SC', 'Microsoft YaHei', sans-serif"));
			} catch (error) {
				console.error("[dsh-drawio] mount failed:", error);
			}
			ctx.effect(() => () => {
				unsubscribeCol();
				for (const dispose of disposers.splice(0)) dispose();
				col.dispose();
			}, "dsh-drawio: surfaces");
		}
		//#endregion
		exports.NS = NS;
		exports.apply = apply;
		exports.inject = inject;
		exports.name = name;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map