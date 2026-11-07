window.__ModuleLoader__.load({
	id: "dsh-knowledge-studio",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		//#region \0rolldown/runtime.js
		var __create = Object.create;
		var __defProp = Object.defineProperty;
		var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
		var __getOwnPropNames = Object.getOwnPropertyNames;
		var __getProtoOf = Object.getPrototypeOf;
		var __hasOwnProp = Object.prototype.hasOwnProperty;
		var __esmMin = (fn, res, err) => () => {
			if (err) throw err[0];
			try {
				return fn && (res = fn(fn = 0)), res;
			} catch (e) {
				throw err = [e], e;
			}
		};
		var __commonJSMin = (cb, mod) => () => (mod || (cb((mod = { exports: {} }).exports, mod), cb = null), mod.exports);
		var __exportAll = (all, no_symbols) => {
			let target = {};
			for (var name in all) __defProp(target, name, {
				get: all[name],
				enumerable: true
			});
			if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
			return target;
		};
		var __copyProps = (to, from, except, desc) => {
			if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
				key = keys[i];
				if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
					get: ((k) => from[k]).bind(null, key),
					enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
				});
			}
			return to;
		};
		var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule || !__hasOwnProp.call(mod, "default") ? __defProp(target, "default", {
			value: mod,
			enumerable: true
		}) : target, mod));
		var __toCommonJS = (mod) => __hasOwnProp.call(mod, "module.exports") ? mod["module.exports"] : __copyProps(__defProp({}, "__esModule", { value: true }), mod);
		//#endregion
		let react = require("react");
		react = __toESM(react, 1);
		let react_jsx_runtime = require("react/jsx-runtime");
		let react_dom = require("react-dom");
		//#region src/client/locale.ts
		const NS = "eduwork.studio";
		const dictionaries = {
			"zh": {
				"loading": "正在读取…",
				"noWorkspace": "当前会话不属于任何工作区。",
				"failed": "生成失败",
				"cancel": "取消任务",
				"openSource": "打开原文",
				"back": "返回",
				"close": "关闭 Studio",
				"working": "处理中",
				"error": "操作失败",
				"generate": "开始生成",
				"generating": "正在生成",
				"interruptedArtifact": "生成被中断",
				"askAI": "问问 AI",
				"evidence": "查看依据",
				"submitAnswer": "提交答案",
				"next": "下一个",
				"previous": "上一个",
				"correct": "回答正确",
				"incorrect": "回答错误",
				"flip": "翻到背面",
				"known": "已掌握",
				"review": "再复习",
				"reset": "重新开始",
				"workspaceSlow": "工作区服务响应较慢，基础创作仍可使用。",
				"workspaceUnavailable": "无法连接工作区服务，请重试。",
				"sidebarDescription": "从工作区资料创建成果",
				"previewFile": "打开文件预览",
				"previewFileHint": "在文件标签页查看原文件，可缩放或与 Studio 并排查看。",
				"openingPreview": "正在打开预览…"
			},
			"en": {
				"loading": "Loading…",
				"noWorkspace": "This session is not attached to a workspace.",
				"failed": "Generation failed",
				"cancel": "Cancel task",
				"openSource": "Open source",
				"back": "Back",
				"close": "Close Studio",
				"working": "Working",
				"error": "Operation failed",
				"generate": "Generate",
				"generating": "Generating",
				"interruptedArtifact": "Generation interrupted",
				"askAI": "Ask AI",
				"evidence": "View evidence",
				"submitAnswer": "Submit answer",
				"next": "Next",
				"previous": "Previous",
				"correct": "Correct",
				"incorrect": "Incorrect",
				"flip": "Show answer",
				"known": "Got it",
				"review": "Review again",
				"reset": "Start over",
				"workspaceSlow": "Workspace service is slow. Basic creation remains available.",
				"workspaceUnavailable": "Cannot connect to workspace service. Retry.",
				"sidebarDescription": "Create artifacts from workspace sources",
				"previewFile": "Open file preview",
				"previewFileHint": "View the saved file in a file tab. Zoom or view it alongside Studio.",
				"openingPreview": "Opening preview…"
			}
		};
		const StudioLocale = (0, react.createContext)(null);
		function useStudioLocale() {
			const t = (0, react.useContext)(StudioLocale);
			if (!t) throw new Error("Studio locale is unavailable outside its registered surface");
			return t;
		}
		//#endregion
		//#region src/client/KnowledgeSurface.ts
		var KnowledgeSurface = class {
			layout;
			canUseDetails;
			savePreference;
			canRestoreDetails;
			snapshot = Object.freeze({
				open: false,
				sessionId: ""
			});
			listeners = /* @__PURE__ */ new Set();
			activation;
			memory = /* @__PURE__ */ new Map();
			preferredOpen = false;
			preferenceEdited = false;
			automaticOpen = false;
			target = null;
			constructor(layout, canUseDetails = () => true, savePreference = () => {}, canRestoreDetails = canUseDetails) {
				this.layout = layout;
				this.canUseDetails = canUseDetails;
				this.savePreference = savePreference;
				this.canRestoreDetails = canRestoreDetails;
			}
			restorePreference = (open) => {
				if (this.preferenceEdited) return;
				this.preferredOpen = open;
				this.restoreSidebar();
			};
			choose = (open) => {
				this.preferenceEdited = true;
				this.preferredOpen = open;
				this.savePreference(open);
			};
			supportsDetails = (sessionId) => this.canUseDetails(sessionId);
			subscribe = (listener) => {
				this.listeners.add(listener);
				return () => this.listeners.delete(listener);
			};
			getSnapshot = () => this.snapshot;
			setHeaderSession = (sessionId) => {
				if (this.snapshot.headerSessionId === sessionId) return;
				this.snapshot = Object.freeze({
					...this.snapshot,
					headerSessionId: sessionId
				});
				this.listeners.forEach((listener) => listener());
			};
			clearHeaderSession = (sessionId) => {
				if (this.snapshot.headerSessionId === sessionId) this.setHeaderSession("");
			};
			setDetailsCollapsed = (detailsCollapsed) => {
				if (this.snapshot.detailsCollapsed !== detailsCollapsed) {
					this.snapshot = Object.freeze({
						...this.snapshot,
						detailsCollapsed
					});
					this.listeners.forEach((listener) => listener());
				}
				if (detailsCollapsed && this.snapshot.open && !this.snapshot.reading) {
					if (this.automaticOpen) {
						const target = this.target;
						this.close();
						this.target = target;
					} else this.setReading(true);
				}
			};
			setReading = (reading) => {
				if (!reading && this.snapshot.open && (!this.canUseDetails(this.snapshot.sessionId) || this.snapshot.detailsCollapsed)) {
					this.dismiss();
					return;
				}
				if (reading) this.automaticOpen = false;
				this.snapshot = Object.freeze({
					...this.snapshot,
					reading
				});
				this.listeners.forEach((listener) => listener());
			};
			setReadingTarget = (readingTarget) => {
				if (this.snapshot.readingTarget === readingTarget) return;
				this.snapshot = Object.freeze({
					...this.snapshot,
					readingTarget
				});
				this.listeners.forEach((listener) => listener());
			};
			bind = (activation) => {
				this.activation = activation;
				if (activation && this.snapshot.open) activation.activate();
			};
			currentTarget = () => this.target;
			adoptTab = (target, visible) => {
				if (!visible && this.snapshot.sessionId !== target.sessionId) return;
				this.target = target;
				this.snapshot = Object.freeze({
					...this.snapshot,
					open: visible,
					sessionId: target.sessionId,
					reading: visible && this.snapshot.sessionId === target.sessionId ? this.snapshot.reading : false
				});
				this.listeners.forEach((listener) => listener());
			};
			tabClosed = (sessionId) => {
				if (this.snapshot.sessionId !== sessionId) return;
				this.automaticOpen = false;
				this.snapshot = Object.freeze({
					...this.snapshot,
					open: false,
					sessionId: "",
					reading: false
				});
				this.listeners.forEach((listener) => listener());
			};
			sessionState = (sessionId) => {
				const state = this.memory.get(sessionId);
				if (!state) return {};
				if (state.view && state.view !== "home") {
					const migrated = {
						view: "home",
						mindmaps: state.mindmaps,
						awaitingArtifactSince: state.awaitingArtifactSince
					};
					this.memory.set(sessionId, migrated);
					return migrated;
				}
				return state;
			};
			remember = (sessionId, patch) => this.memory.set(sessionId, {
				...this.sessionState(sessionId),
				...patch
			});
			show = (target, automatic = false) => {
				this.target = target;
				this.automaticOpen = automatic;
				const reading = !automatic && (!this.canUseDetails(target.sessionId) || this.snapshot.open && this.snapshot.sessionId === target.sessionId && this.snapshot.reading);
				this.snapshot = Object.freeze({
					...this.snapshot,
					open: true,
					sessionId: target.sessionId,
					reading: Boolean(reading)
				});
				this.activation?.activate();
				this.layout.openDetails();
				this.listeners.forEach((listener) => listener());
			};
			open = (target) => {
				this.show(target);
			};
			enter = (target) => {
				this.target = target;
				if (this.snapshot.open && this.snapshot.sessionId !== target.sessionId) {
					this.close();
					this.target = target;
				}
				this.restoreSidebar();
			};
			restoreSidebar = () => {
				if (this.snapshot.open || !this.preferredOpen || !this.target || !this.canRestoreDetails(this.target.sessionId)) return;
				this.show(this.target, true);
			};
			close = () => {
				this.automaticOpen = false;
				this.layout.closeDetails();
				this.activation?.deactivate();
				this.target = null;
				this.snapshot = Object.freeze({
					...this.snapshot,
					open: false,
					sessionId: "",
					reading: false
				});
				this.listeners.forEach((listener) => listener());
			};
			dismiss = (target = this.target) => {
				this.choose(false);
				this.close();
			};
			toggle = (target) => {
				if (this.snapshot.open && this.snapshot.sessionId === target.sessionId) this.dismiss(target);
				else {
					this.choose(true);
					this.open(target);
				}
			};
		};
		//#endregion
		//#region src/client/StudioIcon.tsx
		const primaryFormats = {
			report: "docx",
			slides: "pptx",
			table: "xlsx",
			audio: "wav",
			video: "mp4",
			mindmap: "png"
		};
		function StudioIcon({ kind, size = 20, tile = false }) {
			const paths = {
				report: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M6 3h8l4 4v14H6zM14 3v5h4M9 12h6M9 16h6" }),
				slides: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("rect", {
					x: "3",
					y: "4",
					width: "18",
					height: "13",
					rx: "2"
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M12 17v4M8 21h8M7 8h10M7 12h6" })] }),
				table: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("rect", {
					x: "3",
					y: "4",
					width: "18",
					height: "16",
					rx: "2"
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M3 9h18M3 14h18M9 9v11M15 9v11" })] }),
				audio: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M4 14v-2a8 8 0 0 1 16 0v2" }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("rect", {
						x: "3",
						y: "12",
						width: "4",
						height: "8",
						rx: "2"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("rect", {
						x: "17",
						y: "12",
						width: "4",
						height: "8",
						rx: "2"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M10 10v6M14 8v10" })
				] }),
				video: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("rect", {
					x: "3",
					y: "5",
					width: "18",
					height: "15",
					rx: "2"
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "m10 10 5 3-5 3zM7 2h10" })] }),
				mindmap: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("rect", {
						x: "2",
						y: "9",
						width: "6",
						height: "6",
						rx: "1"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("rect", {
						x: "16",
						y: "3",
						width: "6",
						height: "6",
						rx: "1"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("rect", {
						x: "16",
						y: "15",
						width: "6",
						height: "6",
						rx: "1"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M8 12h4M16 6h-4v12h4" })
				] }),
				quiz: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M8 4H6v17h12V4h-2M9 3h6v4H9zM9 11h6m-6 5 2 2 4-4" }),
				flashcards: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("rect", {
					x: "7",
					y: "3",
					width: "13",
					height: "16",
					rx: "2"
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M7 7H4v14h12v-2M11 8h5M11 12h3" })] })
			};
			const icon = /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
				"data-studio-icon": kind,
				"aria-hidden": "true",
				width: size,
				height: size,
				viewBox: "0 0 24 24",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: "1.7",
				strokeLinecap: "round",
				strokeLinejoin: "round",
				style: { flexShrink: 0 },
				children: paths[kind] || paths.report
			});
			return tile ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
				style: {
					display: "inline-flex",
					alignItems: "center",
					justifyContent: "center",
					width: size + 18,
					height: size + 18,
					borderRadius: 10,
					background: "color-mix(in srgb,var(--dsw-alias-state-business-primary,#3777ba) 9%,transparent)",
					color: "var(--dsw-alias-state-business-primary,#3777ba)",
					flexShrink: 0
				},
				children: icon
			}) : icon;
		}
		//#endregion
		//#region lib/studio-instructions.js
		const canonical = (value) => value === true ? "on" : value === false ? "off" : String(value);
		/** Keep the form and its generated request in sync, including hidden defaults. */
		function parameterVisible(parameter, values = {}) {
			return (!parameter.when || Object.entries(parameter.when).every(([key, value]) => canonical(values[key]) === canonical(value))) && (!parameter.whenNot || Object.entries(parameter.whenNot).every(([key, value]) => canonical(values[key]) !== canonical(value))) && (!parameter.whenNonempty || Boolean(values[parameter.whenNonempty]));
		}
		/** Human-readable Studio request; only options relevant to this capability. */
		function artifactRequest(capability, parameters = {}) {
			const lines = [];
			for (const parameter of capability.parameters || []) {
				const value = parameters[parameter.id];
				if (value == null || !parameterVisible(parameter, parameters)) continue;
				const option = parameter.options?.find((option) => canonical(option.value) === canonical(value) && parameterVisible(option, parameters));
				if (value === "" && !option) continue;
				lines.push(`${parameter.label}：${option?.label || String(value)}`);
			}
			return `请基于当前工作区生成${capability.title}，并将成果保存在 Studio。${lines.length ? "\n\n" + lines.join("\n") : ""}\n\n按 knowledge-studio 技能创建并登记成果，完成后确认其出现在 Studio 最近成果中。保留可核验的资料来源。资料不足时请明确说明。直接使用工作区原始资料。`;
		}
		//#endregion
		//#region src/client/StudioEntry.tsx
		/** One toggle shared by the public header slot, blank-page fallback and reader. */
		function StudioEntry({ surface, target, placement = "utilities" }) {
			const state = (0, react.useSyncExternalStore)(surface.subscribe, surface.getSnapshot, surface.getSnapshot);
			const active = state.open && state.sessionId === target.sessionId;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("style", { children: `
      .ks-studio-entry{box-sizing:border-box;display:inline-flex;flex:none;align-items:center;justify-content:center;gap:6px;height:32px;min-width:32px;padding:0 10px;border:1px solid var(--dsw-alias-border-l3,#ded7cf);border-radius:8px;background:var(--dsw-alias-bg-base,#fffdf9);color:var(--dsw-alias-label-primary,#514337);font:inherit;font-size:12px;line-height:1;cursor:pointer;white-space:nowrap;pointer-events:auto}
      .ks-studio-entry:hover{background:var(--dsw-alias-interactive-bg-hover,#f4eee5)}
      .ks-studio-entry[aria-pressed=true]{background:var(--dsw-alias-interactive-bg-active,#eee4d5);border-color:var(--dsw-alias-label-tertiary,#9b876e)}
      .ks-studio-entry:focus-visible{outline:2px solid currentColor;outline-offset:2px}
      @media(max-width:780px){.ks-studio-entry{width:32px;padding:0}.ks-studio-entry-label{display:none}}
    ` }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
				className: "ks-studio-entry",
				type: "button",
				"data-knowledge-studio-entry": "true",
				"data-studio-entry-placement": placement,
				"aria-label": "Studio 工作区",
				"aria-pressed": active,
				title: active ? "关闭 Studio 工作区" : "打开 Studio 工作区",
				onClick: () => surface.toggle(target),
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
					width: "16",
					height: "16",
					viewBox: "0 0 24 24",
					fill: "none",
					stroke: "currentColor",
					strokeWidth: "1.6",
					"aria-hidden": "true",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("rect", {
						x: "3",
						y: "4",
						width: "18",
						height: "16",
						rx: "2"
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M15 4v16M6.5 8h5M6.5 12h5M6.5 16h3" })]
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					className: "ks-studio-entry-label",
					children: "Studio"
				})]
			})] });
		}
		function StudioHeaderEntry({ surface, sessions, useSession, sessionId: providedSessionId }) {
			const sessionId = providedSessionId ?? useSession((state) => state.sessionId);
			const list = (0, react.useSyncExternalStore)(sessions.list.subscribe, sessions.list.getSnapshot, sessions.list.getSnapshot);
			const state = (0, react.useSyncExternalStore)(surface.subscribe, surface.getSnapshot, surface.getSnapshot);
			const current = sessionId === list.current, cwd = list.byId[sessionId]?.cwd;
			(0, react.useLayoutEffect)(() => {
				if (!current || !cwd) return;
				surface.setHeaderSession(sessionId);
				return () => surface.clearHeaderSession(sessionId);
			}, [
				surface,
				sessionId,
				current,
				cwd
			]);
			if (!current || !cwd || state.reading) return null;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(StudioEntry, {
				surface,
				target: {
					sessionId,
					cwd
				}
			});
		}
		function StudioBlankEntry({ surface, sessions }) {
			const list = (0, react.useSyncExternalStore)(sessions.list.subscribe, sessions.list.getSnapshot, sessions.list.getSnapshot);
			const state = (0, react.useSyncExternalStore)(surface.subscribe, surface.getSnapshot, surface.getSnapshot);
			const sessionId = list.current, cwd = list.byId[sessionId]?.cwd;
			if (!sessionId || !cwd || state.reading || state.headerSessionId === sessionId) return null;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				style: {
					position: "absolute",
					right: 28,
					top: 12,
					pointerEvents: "none"
				},
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(StudioEntry, {
					surface,
					target: {
						sessionId,
						cwd
					},
					placement: "blank"
				})
			});
		}
		//#endregion
		//#region node_modules/comma-separated-tokens/index.js
		/**
		* Serialize an array of strings or numbers to comma-separated tokens.
		*
		* @param {Array<string|number>} values
		*   List of tokens.
		* @param {Options} [options]
		*   Configuration for `stringify` (optional).
		* @returns {string}
		*   Comma-separated tokens.
		*/
		function stringify$1(values, options) {
			const settings = options || {};
			return (values[values.length - 1] === "" ? [...values, ""] : values).join((settings.padRight ? " " : "") + "," + (settings.padLeft === false ? "" : " ")).trim();
		}
		//#endregion
		//#region node_modules/estree-util-is-identifier-name/lib/index.js
		const nameRe = /^[$_\p{ID_Start}][$_\u{200C}\u{200D}\p{ID_Continue}]*$/u;
		const nameReJsx = /^[$_\p{ID_Start}][-$_\u{200C}\u{200D}\p{ID_Continue}]*$/u;
		/** @type {Options} */
		const emptyOptions$3 = {};
		/**
		* Checks if the given value is a valid identifier name.
		*
		* @param {string} name
		*   Identifier to check.
		* @param {Options | null | undefined} [options]
		*   Configuration (optional).
		* @returns {boolean}
		*   Whether `name` can be an identifier.
		*/
		function name(name, options) {
			return ((options || emptyOptions$3).jsx ? nameReJsx : nameRe).test(name);
		}
		//#endregion
		//#region node_modules/hast-util-whitespace/lib/index.js
		/**
		* @typedef {import('hast').Nodes} Nodes
		*/
		const re = /[ \t\n\f\r]/g;
		/**
		* Check if the given value is *inter-element whitespace*.
		*
		* @param {Nodes | string} thing
		*   Thing to check (`Node` or `string`).
		* @returns {boolean}
		*   Whether the `value` is inter-element whitespace (`boolean`): consisting of
		*   zero or more of space, tab (`\t`), line feed (`\n`), carriage return
		*   (`\r`), or form feed (`\f`); if a node is passed it must be a `Text` node,
		*   whose `value` field is checked.
		*/
		function whitespace(thing) {
			return typeof thing === "object" ? thing.type === "text" ? empty$1(thing.value) : false : empty$1(thing);
		}
		/**
		* @param {string} value
		* @returns {boolean}
		*/
		function empty$1(value) {
			return value.replace(re, "") === "";
		}
		//#endregion
		//#region node_modules/property-information/lib/util/schema.js
		/**
		* @import {Schema as SchemaType, Space} from 'property-information'
		*/
		/** @type {SchemaType} */
		var Schema = class {
			/**
			* @param {SchemaType['property']} property
			*   Property.
			* @param {SchemaType['normal']} normal
			*   Normal.
			* @param {Space | undefined} [space]
			*   Space.
			* @returns
			*   Schema.
			*/
			constructor(property, normal, space) {
				this.normal = normal;
				this.property = property;
				if (space) this.space = space;
			}
		};
		Schema.prototype.normal = {};
		Schema.prototype.property = {};
		Schema.prototype.space = void 0;
		//#endregion
		//#region node_modules/property-information/lib/util/merge.js
		/**
		* @import {Info, Space} from 'property-information'
		*/
		/**
		* @param {ReadonlyArray<Schema>} definitions
		*   Definitions.
		* @param {Space | undefined} [space]
		*   Space.
		* @returns {Schema}
		*   Schema.
		*/
		function merge(definitions, space) {
			/** @type {Record<string, Info>} */
			const property = {};
			/** @type {Record<string, string>} */
			const normal = {};
			for (const definition of definitions) {
				Object.assign(property, definition.property);
				Object.assign(normal, definition.normal);
			}
			return new Schema(property, normal, space);
		}
		//#endregion
		//#region node_modules/property-information/lib/normalize.js
		/**
		* Get the cleaned case insensitive form of an attribute or property.
		*
		* @param {string} value
		*   An attribute-like or property-like name.
		* @returns {string}
		*   Value that can be used to look up the properly cased property on a
		*   `Schema`.
		*/
		function normalize$1(value) {
			return value.toLowerCase();
		}
		//#endregion
		//#region node_modules/property-information/lib/util/info.js
		/**
		* @import {Info as InfoType} from 'property-information'
		*/
		/** @type {InfoType} */
		var Info = class {
			/**
			* @param {string} property
			*   Property.
			* @param {string} attribute
			*   Attribute.
			* @returns
			*   Info.
			*/
			constructor(property, attribute) {
				this.attribute = attribute;
				this.property = property;
			}
		};
		Info.prototype.attribute = "";
		Info.prototype.booleanish = false;
		Info.prototype.boolean = false;
		Info.prototype.commaOrSpaceSeparated = false;
		Info.prototype.commaSeparated = false;
		Info.prototype.defined = false;
		Info.prototype.mustUseProperty = false;
		Info.prototype.number = false;
		Info.prototype.overloadedBoolean = false;
		Info.prototype.property = "";
		Info.prototype.spaceSeparated = false;
		Info.prototype.space = void 0;
		//#endregion
		//#region node_modules/property-information/lib/util/types.js
		var types_exports = /* @__PURE__ */ __exportAll({
			boolean: () => boolean$2,
			booleanish: () => booleanish,
			commaOrSpaceSeparated: () => commaOrSpaceSeparated,
			commaSeparated: () => commaSeparated,
			number: () => number,
			overloadedBoolean: () => overloadedBoolean,
			spaceSeparated: () => spaceSeparated
		});
		let powers = 0;
		const boolean$2 = increment();
		const booleanish = increment();
		const overloadedBoolean = increment();
		const number = increment();
		const spaceSeparated = increment();
		const commaSeparated = increment();
		const commaOrSpaceSeparated = increment();
		function increment() {
			return 2 ** ++powers;
		}
		//#endregion
		//#region node_modules/property-information/lib/util/defined-info.js
		/**
		* @import {Space} from 'property-information'
		*/
		const checks = Object.keys(types_exports);
		var DefinedInfo = class extends Info {
			/**
			* @constructor
			* @param {string} property
			*   Property.
			* @param {string} attribute
			*   Attribute.
			* @param {number | null | undefined} [mask]
			*   Mask.
			* @param {Space | undefined} [space]
			*   Space.
			* @returns
			*   Info.
			*/
			constructor(property, attribute, mask, space) {
				let index = -1;
				super(property, attribute);
				mark(this, "space", space);
				if (typeof mask === "number") while (++index < checks.length) {
					const check = checks[index];
					mark(this, checks[index], (mask & types_exports[check]) === types_exports[check]);
				}
			}
		};
		DefinedInfo.prototype.defined = true;
		/**
		* @template {keyof DefinedInfo} Key
		*   Key type.
		* @param {DefinedInfo} values
		*   Info.
		* @param {Key} key
		*   Key.
		* @param {DefinedInfo[Key]} value
		*   Value.
		* @returns {undefined}
		*   Nothing.
		*/
		function mark(values, key, value) {
			if (value) values[key] = value;
		}
		//#endregion
		//#region node_modules/property-information/lib/util/create.js
		/**
		* @import {Info, Space} from 'property-information'
		*/
		/**
		* @typedef Definition
		*   Definition of a schema.
		* @property {Record<string, string> | undefined} [attributes]
		*   Normalzed names to special attribute case.
		* @property {ReadonlyArray<string> | undefined} [mustUseProperty]
		*   Normalized names that must be set as properties.
		* @property {Record<string, number | null>} properties
		*   Property names to their types.
		* @property {Space | undefined} [space]
		*   Space.
		* @property {Transform} transform
		*   Transform a property name.
		*/
		/**
		* @callback Transform
		*   Transform.
		* @param {Record<string, string>} attributes
		*   Attributes.
		* @param {string} property
		*   Property.
		* @returns {string}
		*   Attribute.
		*/
		/**
		* @param {Definition} definition
		*   Definition.
		* @returns {Schema}
		*   Schema.
		*/
		function create$1(definition) {
			/** @type {Record<string, Info>} */
			const properties = {};
			/** @type {Record<string, string>} */
			const normals = {};
			for (const [property, value] of Object.entries(definition.properties)) {
				const info = new DefinedInfo(property, definition.transform(definition.attributes || {}, property), value, definition.space);
				if (definition.mustUseProperty && definition.mustUseProperty.includes(property)) info.mustUseProperty = true;
				properties[property] = info;
				normals[normalize$1(property)] = property;
				normals[normalize$1(info.attribute)] = property;
			}
			return new Schema(properties, normals, definition.space);
		}
		//#endregion
		//#region node_modules/property-information/lib/aria.js
		const aria = create$1({
			properties: {
				ariaActiveDescendant: null,
				ariaAtomic: booleanish,
				ariaAutoComplete: null,
				ariaBusy: booleanish,
				ariaChecked: booleanish,
				ariaColCount: number,
				ariaColIndex: number,
				ariaColSpan: number,
				ariaControls: spaceSeparated,
				ariaCurrent: null,
				ariaDescribedBy: spaceSeparated,
				ariaDetails: null,
				ariaDisabled: booleanish,
				ariaDropEffect: spaceSeparated,
				ariaErrorMessage: null,
				ariaExpanded: booleanish,
				ariaFlowTo: spaceSeparated,
				ariaGrabbed: booleanish,
				ariaHasPopup: null,
				ariaHidden: booleanish,
				ariaInvalid: null,
				ariaKeyShortcuts: null,
				ariaLabel: null,
				ariaLabelledBy: spaceSeparated,
				ariaLevel: number,
				ariaLive: null,
				ariaModal: booleanish,
				ariaMultiLine: booleanish,
				ariaMultiSelectable: booleanish,
				ariaOrientation: null,
				ariaOwns: spaceSeparated,
				ariaPlaceholder: null,
				ariaPosInSet: number,
				ariaPressed: booleanish,
				ariaReadOnly: booleanish,
				ariaRelevant: null,
				ariaRequired: booleanish,
				ariaRoleDescription: spaceSeparated,
				ariaRowCount: number,
				ariaRowIndex: number,
				ariaRowSpan: number,
				ariaSelected: booleanish,
				ariaSetSize: number,
				ariaSort: null,
				ariaValueMax: number,
				ariaValueMin: number,
				ariaValueNow: number,
				ariaValueText: null,
				role: null
			},
			transform(_, property) {
				return property === "role" ? property : "aria-" + property.slice(4).toLowerCase();
			}
		});
		//#endregion
		//#region node_modules/property-information/lib/util/case-sensitive-transform.js
		/**
		* @param {Record<string, string>} attributes
		*   Attributes.
		* @param {string} attribute
		*   Attribute.
		* @returns {string}
		*   Transformed attribute.
		*/
		function caseSensitiveTransform(attributes, attribute) {
			return attribute in attributes ? attributes[attribute] : attribute;
		}
		//#endregion
		//#region node_modules/property-information/lib/util/case-insensitive-transform.js
		/**
		* @param {Record<string, string>} attributes
		*   Attributes.
		* @param {string} property
		*   Property.
		* @returns {string}
		*   Transformed property.
		*/
		function caseInsensitiveTransform(attributes, property) {
			return caseSensitiveTransform(attributes, property.toLowerCase());
		}
		//#endregion
		//#region node_modules/property-information/lib/html.js
		const html$3 = create$1({
			attributes: {
				acceptcharset: "accept-charset",
				classname: "class",
				htmlfor: "for",
				httpequiv: "http-equiv"
			},
			mustUseProperty: [
				"checked",
				"multiple",
				"muted",
				"selected"
			],
			properties: {
				abbr: null,
				accept: commaSeparated,
				acceptCharset: spaceSeparated,
				accessKey: spaceSeparated,
				action: null,
				allow: null,
				allowFullScreen: boolean$2,
				allowPaymentRequest: boolean$2,
				allowUserMedia: boolean$2,
				alpha: boolean$2,
				alt: null,
				as: null,
				async: boolean$2,
				autoCapitalize: null,
				autoComplete: spaceSeparated,
				autoFocus: boolean$2,
				autoPlay: boolean$2,
				blocking: spaceSeparated,
				capture: null,
				charSet: null,
				checked: boolean$2,
				cite: null,
				className: spaceSeparated,
				closedBy: null,
				colorSpace: null,
				cols: number,
				colSpan: number,
				command: null,
				commandFor: null,
				content: null,
				contentEditable: booleanish,
				controls: boolean$2,
				controlsList: spaceSeparated,
				coords: number | commaSeparated,
				crossOrigin: null,
				data: null,
				dateTime: null,
				decoding: null,
				default: boolean$2,
				defer: boolean$2,
				dir: null,
				dirName: null,
				disabled: boolean$2,
				download: overloadedBoolean,
				draggable: booleanish,
				encType: null,
				enterKeyHint: null,
				fetchPriority: null,
				form: null,
				formAction: null,
				formEncType: null,
				formMethod: null,
				formNoValidate: boolean$2,
				formTarget: null,
				headers: spaceSeparated,
				height: number,
				hidden: overloadedBoolean,
				high: number,
				href: null,
				hrefLang: null,
				htmlFor: spaceSeparated,
				httpEquiv: spaceSeparated,
				id: null,
				imageSizes: null,
				imageSrcSet: null,
				inert: boolean$2,
				inputMode: null,
				integrity: null,
				is: null,
				isMap: boolean$2,
				itemId: null,
				itemProp: spaceSeparated,
				itemRef: spaceSeparated,
				itemScope: boolean$2,
				itemType: spaceSeparated,
				kind: null,
				label: null,
				lang: null,
				language: null,
				list: null,
				loading: null,
				loop: boolean$2,
				low: number,
				manifest: null,
				max: null,
				maxLength: number,
				media: null,
				method: null,
				min: null,
				minLength: number,
				multiple: boolean$2,
				muted: boolean$2,
				name: null,
				nonce: null,
				noModule: boolean$2,
				noValidate: boolean$2,
				onAbort: null,
				onAfterPrint: null,
				onAuxClick: null,
				onBeforeMatch: null,
				onBeforePrint: null,
				onBeforeToggle: null,
				onBeforeUnload: null,
				onBlur: null,
				onCancel: null,
				onCanPlay: null,
				onCanPlayThrough: null,
				onChange: null,
				onClick: null,
				onClose: null,
				onContextLost: null,
				onContextMenu: null,
				onContextRestored: null,
				onCopy: null,
				onCueChange: null,
				onCut: null,
				onDblClick: null,
				onDrag: null,
				onDragEnd: null,
				onDragEnter: null,
				onDragExit: null,
				onDragLeave: null,
				onDragOver: null,
				onDragStart: null,
				onDrop: null,
				onDurationChange: null,
				onEmptied: null,
				onEnded: null,
				onError: null,
				onFocus: null,
				onFormData: null,
				onHashChange: null,
				onInput: null,
				onInvalid: null,
				onKeyDown: null,
				onKeyPress: null,
				onKeyUp: null,
				onLanguageChange: null,
				onLoad: null,
				onLoadedData: null,
				onLoadedMetadata: null,
				onLoadEnd: null,
				onLoadStart: null,
				onMessage: null,
				onMessageError: null,
				onMouseDown: null,
				onMouseEnter: null,
				onMouseLeave: null,
				onMouseMove: null,
				onMouseOut: null,
				onMouseOver: null,
				onMouseUp: null,
				onOffline: null,
				onOnline: null,
				onPageHide: null,
				onPageShow: null,
				onPaste: null,
				onPause: null,
				onPlay: null,
				onPlaying: null,
				onPopState: null,
				onProgress: null,
				onRateChange: null,
				onRejectionHandled: null,
				onReset: null,
				onResize: null,
				onScroll: null,
				onScrollEnd: null,
				onSecurityPolicyViolation: null,
				onSeeked: null,
				onSeeking: null,
				onSelect: null,
				onSlotChange: null,
				onStalled: null,
				onStorage: null,
				onSubmit: null,
				onSuspend: null,
				onTimeUpdate: null,
				onToggle: null,
				onUnhandledRejection: null,
				onUnload: null,
				onVolumeChange: null,
				onWaiting: null,
				onWheel: null,
				open: boolean$2,
				optimum: number,
				pattern: null,
				ping: spaceSeparated,
				placeholder: null,
				playsInline: boolean$2,
				popover: null,
				popoverTarget: null,
				popoverTargetAction: null,
				poster: null,
				preload: null,
				readOnly: boolean$2,
				referrerPolicy: null,
				rel: spaceSeparated,
				required: boolean$2,
				reversed: boolean$2,
				rows: number,
				rowSpan: number,
				sandbox: spaceSeparated,
				scope: null,
				scoped: boolean$2,
				seamless: boolean$2,
				selected: boolean$2,
				shadowRootClonable: boolean$2,
				shadowRootCustomElementRegistry: boolean$2,
				shadowRootDelegatesFocus: boolean$2,
				shadowRootMode: null,
				shadowRootSerializable: boolean$2,
				shape: null,
				size: number,
				sizes: null,
				slot: null,
				span: number,
				spellCheck: booleanish,
				src: null,
				srcDoc: null,
				srcLang: null,
				srcSet: null,
				start: number,
				step: null,
				style: null,
				tabIndex: number,
				target: null,
				title: null,
				translate: null,
				type: null,
				typeMustMatch: boolean$2,
				useMap: null,
				value: booleanish,
				width: number,
				wrap: null,
				writingSuggestions: null,
				align: null,
				aLink: null,
				archive: spaceSeparated,
				axis: null,
				background: null,
				bgColor: null,
				border: number,
				borderColor: null,
				bottomMargin: number,
				cellPadding: null,
				cellSpacing: null,
				char: null,
				charOff: null,
				classId: null,
				clear: null,
				code: null,
				codeBase: null,
				codeType: null,
				color: null,
				compact: boolean$2,
				declare: boolean$2,
				event: null,
				face: null,
				frame: null,
				frameBorder: null,
				hSpace: number,
				leftMargin: number,
				link: null,
				longDesc: null,
				lowSrc: null,
				marginHeight: number,
				marginWidth: number,
				noResize: boolean$2,
				noHref: boolean$2,
				noShade: boolean$2,
				noWrap: boolean$2,
				object: null,
				profile: null,
				prompt: null,
				rev: null,
				rightMargin: number,
				rules: null,
				scheme: null,
				scrolling: booleanish,
				standby: null,
				summary: null,
				text: null,
				topMargin: number,
				valueType: null,
				version: null,
				vAlign: null,
				vLink: null,
				vSpace: number,
				allowTransparency: null,
				autoCorrect: null,
				autoSave: null,
				credentialless: boolean$2,
				disablePictureInPicture: boolean$2,
				disableRemotePlayback: boolean$2,
				exportParts: commaSeparated,
				part: spaceSeparated,
				prefix: null,
				property: null,
				results: number,
				security: null,
				unselectable: null
			},
			space: "html",
			transform: caseInsensitiveTransform
		});
		//#endregion
		//#region node_modules/property-information/lib/svg.js
		const svg$1 = create$1({
			attributes: {
				accentHeight: "accent-height",
				alignmentBaseline: "alignment-baseline",
				arabicForm: "arabic-form",
				baselineShift: "baseline-shift",
				capHeight: "cap-height",
				className: "class",
				clipPath: "clip-path",
				clipRule: "clip-rule",
				colorInterpolation: "color-interpolation",
				colorInterpolationFilters: "color-interpolation-filters",
				colorProfile: "color-profile",
				colorRendering: "color-rendering",
				crossOrigin: "crossorigin",
				dataType: "datatype",
				dominantBaseline: "dominant-baseline",
				enableBackground: "enable-background",
				fillOpacity: "fill-opacity",
				fillRule: "fill-rule",
				floodColor: "flood-color",
				floodOpacity: "flood-opacity",
				fontFamily: "font-family",
				fontSize: "font-size",
				fontSizeAdjust: "font-size-adjust",
				fontStretch: "font-stretch",
				fontStyle: "font-style",
				fontVariant: "font-variant",
				fontWeight: "font-weight",
				glyphName: "glyph-name",
				glyphOrientationHorizontal: "glyph-orientation-horizontal",
				glyphOrientationVertical: "glyph-orientation-vertical",
				hrefLang: "hreflang",
				horizAdvX: "horiz-adv-x",
				horizOriginX: "horiz-origin-x",
				horizOriginY: "horiz-origin-y",
				imageRendering: "image-rendering",
				letterSpacing: "letter-spacing",
				lightingColor: "lighting-color",
				markerEnd: "marker-end",
				markerMid: "marker-mid",
				markerStart: "marker-start",
				maskType: "mask-type",
				navDown: "nav-down",
				navDownLeft: "nav-down-left",
				navDownRight: "nav-down-right",
				navLeft: "nav-left",
				navNext: "nav-next",
				navPrev: "nav-prev",
				navRight: "nav-right",
				navUp: "nav-up",
				navUpLeft: "nav-up-left",
				navUpRight: "nav-up-right",
				onAbort: "onabort",
				onActivate: "onactivate",
				onAfterPrint: "onafterprint",
				onBeforePrint: "onbeforeprint",
				onBegin: "onbegin",
				onCancel: "oncancel",
				onCanPlay: "oncanplay",
				onCanPlayThrough: "oncanplaythrough",
				onChange: "onchange",
				onClick: "onclick",
				onClose: "onclose",
				onCopy: "oncopy",
				onCueChange: "oncuechange",
				onCut: "oncut",
				onDblClick: "ondblclick",
				onDrag: "ondrag",
				onDragEnd: "ondragend",
				onDragEnter: "ondragenter",
				onDragExit: "ondragexit",
				onDragLeave: "ondragleave",
				onDragOver: "ondragover",
				onDragStart: "ondragstart",
				onDrop: "ondrop",
				onDurationChange: "ondurationchange",
				onEmptied: "onemptied",
				onEnd: "onend",
				onEnded: "onended",
				onError: "onerror",
				onFocus: "onfocus",
				onFocusIn: "onfocusin",
				onFocusOut: "onfocusout",
				onHashChange: "onhashchange",
				onInput: "oninput",
				onInvalid: "oninvalid",
				onKeyDown: "onkeydown",
				onKeyPress: "onkeypress",
				onKeyUp: "onkeyup",
				onLoad: "onload",
				onLoadedData: "onloadeddata",
				onLoadedMetadata: "onloadedmetadata",
				onLoadStart: "onloadstart",
				onMessage: "onmessage",
				onMouseDown: "onmousedown",
				onMouseEnter: "onmouseenter",
				onMouseLeave: "onmouseleave",
				onMouseMove: "onmousemove",
				onMouseOut: "onmouseout",
				onMouseOver: "onmouseover",
				onMouseUp: "onmouseup",
				onMouseWheel: "onmousewheel",
				onOffline: "onoffline",
				onOnline: "ononline",
				onPageHide: "onpagehide",
				onPageShow: "onpageshow",
				onPaste: "onpaste",
				onPause: "onpause",
				onPlay: "onplay",
				onPlaying: "onplaying",
				onPopState: "onpopstate",
				onProgress: "onprogress",
				onRateChange: "onratechange",
				onRepeat: "onrepeat",
				onReset: "onreset",
				onResize: "onresize",
				onScroll: "onscroll",
				onSeeked: "onseeked",
				onSeeking: "onseeking",
				onSelect: "onselect",
				onShow: "onshow",
				onStalled: "onstalled",
				onStorage: "onstorage",
				onSubmit: "onsubmit",
				onSuspend: "onsuspend",
				onTimeUpdate: "ontimeupdate",
				onToggle: "ontoggle",
				onUnload: "onunload",
				onVolumeChange: "onvolumechange",
				onWaiting: "onwaiting",
				onZoom: "onzoom",
				overlinePosition: "overline-position",
				overlineThickness: "overline-thickness",
				paintOrder: "paint-order",
				panose1: "panose-1",
				pointerEvents: "pointer-events",
				referrerPolicy: "referrerpolicy",
				renderingIntent: "rendering-intent",
				shapeRendering: "shape-rendering",
				stopColor: "stop-color",
				stopOpacity: "stop-opacity",
				strikethroughPosition: "strikethrough-position",
				strikethroughThickness: "strikethrough-thickness",
				strokeDashArray: "stroke-dasharray",
				strokeDashOffset: "stroke-dashoffset",
				strokeLineCap: "stroke-linecap",
				strokeLineJoin: "stroke-linejoin",
				strokeMiterLimit: "stroke-miterlimit",
				strokeOpacity: "stroke-opacity",
				strokeWidth: "stroke-width",
				tabIndex: "tabindex",
				textAnchor: "text-anchor",
				textDecoration: "text-decoration",
				textRendering: "text-rendering",
				transformOrigin: "transform-origin",
				typeOf: "typeof",
				underlinePosition: "underline-position",
				underlineThickness: "underline-thickness",
				unicodeBidi: "unicode-bidi",
				unicodeRange: "unicode-range",
				unitsPerEm: "units-per-em",
				vAlphabetic: "v-alphabetic",
				vHanging: "v-hanging",
				vIdeographic: "v-ideographic",
				vMathematical: "v-mathematical",
				vectorEffect: "vector-effect",
				vertAdvY: "vert-adv-y",
				vertOriginX: "vert-origin-x",
				vertOriginY: "vert-origin-y",
				wordSpacing: "word-spacing",
				writingMode: "writing-mode",
				xHeight: "x-height",
				playbackOrder: "playbackorder",
				timelineBegin: "timelinebegin"
			},
			properties: {
				about: commaOrSpaceSeparated,
				accentHeight: number,
				accumulate: null,
				additive: null,
				alignmentBaseline: null,
				alphabetic: number,
				amplitude: number,
				arabicForm: null,
				ascent: number,
				attributeName: null,
				attributeType: null,
				azimuth: number,
				bandwidth: null,
				baselineShift: null,
				baseFrequency: null,
				baseProfile: null,
				bbox: null,
				begin: null,
				bias: number,
				by: null,
				calcMode: null,
				capHeight: number,
				className: spaceSeparated,
				clip: null,
				clipPath: null,
				clipPathUnits: null,
				clipRule: null,
				color: null,
				colorInterpolation: null,
				colorInterpolationFilters: null,
				colorProfile: null,
				colorRendering: null,
				content: null,
				contentScriptType: null,
				contentStyleType: null,
				crossOrigin: null,
				cursor: null,
				cx: null,
				cy: null,
				d: null,
				dataType: null,
				defaultAction: null,
				descent: number,
				diffuseConstant: number,
				direction: null,
				display: null,
				dur: null,
				divisor: number,
				dominantBaseline: null,
				download: boolean$2,
				dx: null,
				dy: null,
				edgeMode: null,
				editable: null,
				elevation: number,
				enableBackground: null,
				end: null,
				event: null,
				exponent: number,
				externalResourcesRequired: null,
				fill: null,
				fillOpacity: number,
				fillRule: null,
				filter: null,
				filterRes: null,
				filterUnits: null,
				floodColor: null,
				floodOpacity: null,
				focusable: null,
				focusHighlight: null,
				fontFamily: null,
				fontSize: null,
				fontSizeAdjust: null,
				fontStretch: null,
				fontStyle: null,
				fontVariant: null,
				fontWeight: null,
				format: null,
				fr: null,
				from: null,
				fx: null,
				fy: null,
				g1: commaSeparated,
				g2: commaSeparated,
				glyphName: commaSeparated,
				glyphOrientationHorizontal: null,
				glyphOrientationVertical: null,
				glyphRef: null,
				gradientTransform: null,
				gradientUnits: null,
				handler: null,
				hanging: number,
				hatchContentUnits: null,
				hatchUnits: null,
				height: null,
				href: null,
				hrefLang: null,
				horizAdvX: number,
				horizOriginX: number,
				horizOriginY: number,
				id: null,
				ideographic: number,
				imageRendering: null,
				initialVisibility: null,
				in: null,
				in2: null,
				intercept: number,
				k: number,
				k1: number,
				k2: number,
				k3: number,
				k4: number,
				kernelMatrix: commaOrSpaceSeparated,
				kernelUnitLength: null,
				keyPoints: null,
				keySplines: null,
				keyTimes: null,
				kerning: null,
				lang: null,
				lengthAdjust: null,
				letterSpacing: null,
				lightingColor: null,
				limitingConeAngle: number,
				local: null,
				markerEnd: null,
				markerMid: null,
				markerStart: null,
				markerHeight: null,
				markerUnits: null,
				markerWidth: null,
				mask: null,
				maskContentUnits: null,
				maskType: null,
				maskUnits: null,
				mathematical: null,
				max: null,
				media: null,
				mediaCharacterEncoding: null,
				mediaContentEncodings: null,
				mediaSize: number,
				mediaTime: null,
				method: null,
				min: null,
				mode: null,
				name: null,
				navDown: null,
				navDownLeft: null,
				navDownRight: null,
				navLeft: null,
				navNext: null,
				navPrev: null,
				navRight: null,
				navUp: null,
				navUpLeft: null,
				navUpRight: null,
				numOctaves: null,
				observer: null,
				offset: null,
				onAbort: null,
				onActivate: null,
				onAfterPrint: null,
				onBeforePrint: null,
				onBegin: null,
				onCancel: null,
				onCanPlay: null,
				onCanPlayThrough: null,
				onChange: null,
				onClick: null,
				onClose: null,
				onCopy: null,
				onCueChange: null,
				onCut: null,
				onDblClick: null,
				onDrag: null,
				onDragEnd: null,
				onDragEnter: null,
				onDragExit: null,
				onDragLeave: null,
				onDragOver: null,
				onDragStart: null,
				onDrop: null,
				onDurationChange: null,
				onEmptied: null,
				onEnd: null,
				onEnded: null,
				onError: null,
				onFocus: null,
				onFocusIn: null,
				onFocusOut: null,
				onHashChange: null,
				onInput: null,
				onInvalid: null,
				onKeyDown: null,
				onKeyPress: null,
				onKeyUp: null,
				onLoad: null,
				onLoadedData: null,
				onLoadedMetadata: null,
				onLoadStart: null,
				onMessage: null,
				onMouseDown: null,
				onMouseEnter: null,
				onMouseLeave: null,
				onMouseMove: null,
				onMouseOut: null,
				onMouseOver: null,
				onMouseUp: null,
				onMouseWheel: null,
				onOffline: null,
				onOnline: null,
				onPageHide: null,
				onPageShow: null,
				onPaste: null,
				onPause: null,
				onPlay: null,
				onPlaying: null,
				onPopState: null,
				onProgress: null,
				onRateChange: null,
				onRepeat: null,
				onReset: null,
				onResize: null,
				onScroll: null,
				onSeeked: null,
				onSeeking: null,
				onSelect: null,
				onShow: null,
				onStalled: null,
				onStorage: null,
				onSubmit: null,
				onSuspend: null,
				onTimeUpdate: null,
				onToggle: null,
				onUnload: null,
				onVolumeChange: null,
				onWaiting: null,
				onZoom: null,
				opacity: null,
				operator: null,
				order: null,
				orient: null,
				orientation: null,
				origin: null,
				overflow: null,
				overlay: null,
				overlinePosition: number,
				overlineThickness: number,
				paintOrder: null,
				panose1: null,
				path: null,
				pathLength: number,
				patternContentUnits: null,
				patternTransform: null,
				patternUnits: null,
				phase: null,
				ping: spaceSeparated,
				pitch: null,
				playbackOrder: null,
				pointerEvents: null,
				points: null,
				pointsAtX: number,
				pointsAtY: number,
				pointsAtZ: number,
				preserveAlpha: null,
				preserveAspectRatio: null,
				primitiveUnits: null,
				propagate: null,
				property: commaOrSpaceSeparated,
				r: null,
				radius: null,
				referrerPolicy: null,
				refX: null,
				refY: null,
				rel: commaOrSpaceSeparated,
				rev: commaOrSpaceSeparated,
				renderingIntent: null,
				repeatCount: null,
				repeatDur: null,
				requiredExtensions: commaOrSpaceSeparated,
				requiredFeatures: commaOrSpaceSeparated,
				requiredFonts: commaOrSpaceSeparated,
				requiredFormats: commaOrSpaceSeparated,
				resource: null,
				restart: null,
				result: null,
				rotate: null,
				rx: null,
				ry: null,
				scale: null,
				seed: null,
				shapeRendering: null,
				side: null,
				slope: null,
				snapshotTime: null,
				specularConstant: number,
				specularExponent: number,
				spreadMethod: null,
				spacing: null,
				startOffset: null,
				stdDeviation: null,
				stemh: null,
				stemv: null,
				stitchTiles: null,
				stopColor: null,
				stopOpacity: null,
				strikethroughPosition: number,
				strikethroughThickness: number,
				string: null,
				stroke: null,
				strokeDashArray: commaOrSpaceSeparated,
				strokeDashOffset: null,
				strokeLineCap: null,
				strokeLineJoin: null,
				strokeMiterLimit: number,
				strokeOpacity: number,
				strokeWidth: null,
				style: null,
				surfaceScale: number,
				syncBehavior: null,
				syncBehaviorDefault: null,
				syncMaster: null,
				syncTolerance: null,
				syncToleranceDefault: null,
				systemLanguage: commaOrSpaceSeparated,
				tabIndex: number,
				tableValues: null,
				target: null,
				targetX: number,
				targetY: number,
				textAnchor: null,
				textDecoration: null,
				textRendering: null,
				textLength: null,
				timelineBegin: null,
				title: null,
				transformBehavior: null,
				type: null,
				typeOf: commaOrSpaceSeparated,
				to: null,
				transform: null,
				transformOrigin: null,
				u1: null,
				u2: null,
				underlinePosition: number,
				underlineThickness: number,
				unicode: null,
				unicodeBidi: null,
				unicodeRange: null,
				unitsPerEm: number,
				values: null,
				vAlphabetic: number,
				vMathematical: number,
				vectorEffect: null,
				vHanging: number,
				vIdeographic: number,
				version: null,
				vertAdvY: number,
				vertOriginX: number,
				vertOriginY: number,
				viewBox: null,
				viewTarget: null,
				visibility: null,
				width: null,
				widths: null,
				wordSpacing: null,
				writingMode: null,
				x: null,
				x1: null,
				x2: null,
				xChannelSelector: null,
				xHeight: number,
				y: null,
				y1: null,
				y2: null,
				yChannelSelector: null,
				z: null,
				zoomAndPan: null
			},
			space: "svg",
			transform: caseSensitiveTransform
		});
		//#endregion
		//#region node_modules/property-information/lib/xlink.js
		const xlink = create$1({
			properties: {
				xLinkActuate: null,
				xLinkArcRole: null,
				xLinkHref: null,
				xLinkRole: null,
				xLinkShow: null,
				xLinkTitle: null,
				xLinkType: null
			},
			space: "xlink",
			transform(_, property) {
				return "xlink:" + property.slice(5).toLowerCase();
			}
		});
		//#endregion
		//#region node_modules/property-information/lib/xmlns.js
		const xmlns = create$1({
			attributes: { xmlnsxlink: "xmlns:xlink" },
			properties: {
				xmlnsXLink: null,
				xmlns: null
			},
			space: "xmlns",
			transform: caseInsensitiveTransform
		});
		//#endregion
		//#region node_modules/property-information/lib/xml.js
		const xml = create$1({
			properties: {
				xmlBase: null,
				xmlLang: null,
				xmlSpace: null
			},
			space: "xml",
			transform(_, property) {
				return "xml:" + property.slice(3).toLowerCase();
			}
		});
		//#endregion
		//#region node_modules/property-information/lib/hast-to-react.js
		/**
		* Special cases for React (`Record<string, string>`).
		*
		* `hast` is close to `React` but differs in a couple of cases.
		* To get a React property from a hast property,
		* check if it is in `hastToReact`.
		* If it is, use the corresponding value;
		* otherwise, use the hast property.
		*
		* @type {Record<string, string>}
		*/
		const hastToReact = {
			classId: "classID",
			dataType: "datatype",
			itemId: "itemID",
			strokeDashArray: "strokeDasharray",
			strokeDashOffset: "strokeDashoffset",
			strokeLineCap: "strokeLinecap",
			strokeLineJoin: "strokeLinejoin",
			strokeMiterLimit: "strokeMiterlimit",
			typeOf: "typeof",
			xLinkActuate: "xlinkActuate",
			xLinkArcRole: "xlinkArcrole",
			xLinkHref: "xlinkHref",
			xLinkRole: "xlinkRole",
			xLinkShow: "xlinkShow",
			xLinkTitle: "xlinkTitle",
			xLinkType: "xlinkType",
			xmlnsXLink: "xmlnsXlink"
		};
		//#endregion
		//#region node_modules/property-information/lib/find.js
		/**
		* @import {Schema} from 'property-information'
		*/
		const cap$1 = /[A-Z]/g;
		const dash = /-[a-z]/g;
		const valid = /^data[-\w.:]+$/i;
		/**
		* Look up info on a property.
		*
		* In most cases the given `schema` contains info on the property.
		* All standard,
		* most legacy,
		* and some non-standard properties are supported.
		* For these cases,
		* the returned `Info` has hints about the value of the property.
		*
		* `name` can also be a valid data attribute or property,
		* in which case an `Info` object with the correctly cased `attribute` and
		* `property` is returned.
		*
		* `name` can be an unknown attribute,
		* in which case an `Info` object with `attribute` and `property` set to the
		* given name is returned.
		* It is not recommended to provide unsupported legacy or recently specced
		* properties.
		*
		*
		* @param {Schema} schema
		*   Schema;
		*   either the `html` or `svg` export.
		* @param {string} value
		*   An attribute-like or property-like name;
		*   it will be passed through `normalize` to hopefully find the correct info.
		* @returns {Info}
		*   Info.
		*/
		function find(schema, value) {
			const normal = normalize$1(value);
			let property = value;
			let Type = Info;
			if (normal in schema.normal) return schema.property[schema.normal[normal]];
			if (normal.length > 4 && normal.slice(0, 4) === "data" && valid.test(value)) {
				if (value.charAt(4) === "-") {
					const rest = value.slice(5).replace(dash, camelcase);
					property = "data" + rest.charAt(0).toUpperCase() + rest.slice(1);
				} else {
					const rest = value.slice(4);
					if (!dash.test(rest)) {
						let dashes = rest.replace(cap$1, kebab);
						if (dashes.charAt(0) !== "-") dashes = "-" + dashes;
						value = "data" + dashes;
					}
				}
				Type = DefinedInfo;
			}
			return new Type(property, value);
		}
		/**
		* @param {string} $0
		*   Value.
		* @returns {string}
		*   Kebab.
		*/
		function kebab($0) {
			return "-" + $0.toLowerCase();
		}
		/**
		* @param {string} $0
		*   Value.
		* @returns {string}
		*   Camel.
		*/
		function camelcase($0) {
			return $0.charAt(1).toUpperCase();
		}
		//#endregion
		//#region node_modules/property-information/index.js
		const html$2 = merge([
			aria,
			html$3,
			xlink,
			xmlns,
			xml
		], "html");
		const svg = merge([
			aria,
			svg$1,
			xlink,
			xmlns,
			xml
		], "svg");
		//#endregion
		//#region node_modules/space-separated-tokens/index.js
		/**
		* Serialize an array of strings as space separated-tokens.
		*
		* @param {Array<string|number>} values
		*   List of tokens.
		* @returns {string}
		*   Space-separated tokens.
		*/
		function stringify(values) {
			return values.join(" ").trim();
		}
		//#endregion
		//#region node_modules/inline-style-parser/esm/index.mjs
		/**
		* @param {String} style
		* @param {Object} [options]
		* @return {Object[]}
		* @throws {TypeError}
		* @throws {Error}
		*/
		function index$1(style, options) {
			if (typeof style !== "string") throw new TypeError("First argument must be a string");
			if (!style) return [];
			options = options || {};
			/**
			* Positional.
			*/
			var lineno = 1;
			var column = 1;
			/**
			* Update lineno and column based on `str`.
			*
			* @param {String} str
			*/
			function updatePosition(str) {
				var lines = str.match(NEWLINE_REGEX);
				if (lines) lineno += lines.length;
				var i = str.lastIndexOf(NEWLINE);
				column = ~i ? str.length - i : column + str.length;
			}
			/**
			* Mark position and patch `node.position`.
			*
			* @return {Function}
			*/
			function position() {
				var start = {
					line: lineno,
					column
				};
				return function(node) {
					node.position = new Position(start);
					whitespace();
					return node;
				};
			}
			/**
			* Store position information for a node.
			*
			* @constructor
			* @property {Object} start
			* @property {Object} end
			* @property {undefined|String} source
			*/
			function Position(start) {
				this.start = start;
				this.end = {
					line: lineno,
					column
				};
				this.source = options.source;
			}
			/**
			* Non-enumerable source string.
			*/
			Position.prototype.content = style;
			/**
			* Error `msg`.
			*
			* @param {String} msg
			* @throws {Error}
			*/
			function error(msg) {
				var err = /* @__PURE__ */ new Error(options.source + ":" + lineno + ":" + column + ": " + msg);
				err.reason = msg;
				err.filename = options.source;
				err.line = lineno;
				err.column = column;
				err.source = style;
				if (options.silent);
				else throw err;
			}
			/**
			* Match `re` and return captures.
			*
			* @param {RegExp} re
			* @return {undefined|Array}
			*/
			function match(re) {
				var m = re.exec(style);
				if (!m) return;
				var str = m[0];
				updatePosition(str);
				style = style.slice(str.length);
				return m;
			}
			/**
			* Parse whitespace.
			*/
			function whitespace() {
				match(WHITESPACE_REGEX);
			}
			/**
			* Parse comments.
			*
			* @param {Object[]} [rules]
			* @return {Object[]}
			*/
			function comments(rules) {
				var c;
				rules = rules || [];
				while (c = comment()) if (c !== false) rules.push(c);
				return rules;
			}
			/**
			* Parse comment.
			*
			* @return {Object}
			* @throws {Error}
			*/
			function comment() {
				var pos = position();
				if (FORWARD_SLASH != style.charAt(0) || ASTERISK != style.charAt(1)) return;
				var i = 2;
				while (EMPTY_STRING != style.charAt(i) && (ASTERISK != style.charAt(i) || FORWARD_SLASH != style.charAt(i + 1))) ++i;
				i += 2;
				if (EMPTY_STRING === style.charAt(i - 1)) return error("End of comment missing");
				var str = style.slice(2, i - 2);
				column += 2;
				updatePosition(str);
				style = style.slice(i);
				column += 2;
				return pos({
					type: TYPE_COMMENT,
					comment: str
				});
			}
			/**
			* Parse declaration.
			*
			* @return {Object}
			* @throws {Error}
			*/
			function declaration() {
				var pos = position();
				var prop = match(PROPERTY_REGEX);
				if (!prop) return;
				comment();
				if (!match(COLON_REGEX)) return error("property missing ':'");
				var val = match(VALUE_REGEX);
				var ret = pos({
					type: TYPE_DECLARATION,
					property: trim(prop[0].replace(COMMENT_REGEX, EMPTY_STRING)),
					value: val ? trim(val[0].replace(COMMENT_REGEX, EMPTY_STRING)) : EMPTY_STRING
				});
				match(SEMICOLON_REGEX);
				return ret;
			}
			/**
			* Parse declarations.
			*
			* @return {Object[]}
			*/
			function declarations() {
				var decls = [];
				comments(decls);
				var decl;
				while (decl = declaration()) if (decl !== false) {
					decls.push(decl);
					comments(decls);
				}
				return decls;
			}
			whitespace();
			return declarations();
		}
		/**
		* Trim `str`.
		*
		* @param {String} str
		* @return {String}
		*/
		function trim(str) {
			return str ? str.replace(TRIM_REGEX, EMPTY_STRING) : EMPTY_STRING;
		}
		var COMMENT_REGEX, NEWLINE_REGEX, WHITESPACE_REGEX, PROPERTY_REGEX, COLON_REGEX, VALUE_REGEX, SEMICOLON_REGEX, TRIM_REGEX, NEWLINE, FORWARD_SLASH, ASTERISK, EMPTY_STRING, TYPE_COMMENT, TYPE_DECLARATION;
		var init_esm$1 = __esmMin((() => {
			COMMENT_REGEX = /\/\*[^*]*\*+([^/*][^*]*\*+)*\//g;
			NEWLINE_REGEX = /\n/g;
			WHITESPACE_REGEX = /^\s*/;
			PROPERTY_REGEX = /^(\*?[-#/*\\\w]+(\[[0-9a-z_-]+\])?)\s*/;
			COLON_REGEX = /^:\s*/;
			VALUE_REGEX = /^((?:'(?:\\'|.)*?'|"(?:\\"|.)*?"|\([^)]*?\)|[^};])+)/;
			SEMICOLON_REGEX = /^[;\s]*/;
			TRIM_REGEX = /^\s+|\s+$/g;
			NEWLINE = "\n";
			FORWARD_SLASH = "/";
			ASTERISK = "*";
			EMPTY_STRING = "";
			TYPE_COMMENT = "comment";
			TYPE_DECLARATION = "declaration";
		}));
		//#endregion
		//#region node_modules/style-to-object/esm/index.mjs
		var esm_exports = /* @__PURE__ */ __exportAll({ default: () => StyleToObject });
		/**
		* Parses inline style to object.
		*
		* @param style - Inline style.
		* @param iterator - Iterator.
		* @returns - Style object or null.
		*
		* @example Parsing inline style to object:
		*
		* ```js
		* import parse from 'style-to-object';
		* parse('line-height: 42;'); // { 'line-height': '42' }
		* ```
		*/
		function StyleToObject(style, iterator) {
			let styleObject = null;
			if (!style || typeof style !== "string") return styleObject;
			const declarations = index$1(style);
			const hasIterator = typeof iterator === "function";
			declarations.forEach((declaration) => {
				if (declaration.type !== "declaration") return;
				const { property, value } = declaration;
				if (hasIterator) iterator(property, value, declaration);
				else if (value) {
					styleObject = styleObject || {};
					styleObject[property] = value;
				}
			});
			return styleObject;
		}
		var init_esm = __esmMin((() => {
			init_esm$1();
		}));
		//#endregion
		//#region node_modules/style-to-js/cjs/utilities.js
		var require_utilities = /* @__PURE__ */ __commonJSMin(((exports) => {
			Object.defineProperty(exports, "__esModule", { value: true });
			exports.camelCase = void 0;
			var CUSTOM_PROPERTY_REGEX = /^--[a-zA-Z0-9_-]+$/;
			var HYPHEN_REGEX = /-([a-z])/g;
			var NO_HYPHEN_REGEX = /^[^-]+$/;
			var VENDOR_PREFIX_REGEX = /^-(webkit|moz|ms|o|khtml)-/;
			var MS_VENDOR_PREFIX_REGEX = /^-(ms)-/;
			/**
			* Checks whether to skip camelCase.
			*/
			var skipCamelCase = function(property) {
				return !property || NO_HYPHEN_REGEX.test(property) || CUSTOM_PROPERTY_REGEX.test(property);
			};
			/**
			* Replacer that capitalizes first character.
			*/
			var capitalize = function(match, character) {
				return character.toUpperCase();
			};
			/**
			* Replacer that removes beginning hyphen of vendor prefix property.
			*/
			var trimHyphen = function(match, prefix) {
				return "".concat(prefix, "-");
			};
			/**
			* CamelCases a CSS property.
			*/
			var camelCase = function(property, options) {
				if (options === void 0) options = {};
				if (skipCamelCase(property)) return property;
				property = property.toLowerCase();
				if (options.reactCompat) property = property.replace(MS_VENDOR_PREFIX_REGEX, trimHyphen);
				else property = property.replace(VENDOR_PREFIX_REGEX, trimHyphen);
				return property.replace(HYPHEN_REGEX, capitalize);
			};
			exports.camelCase = camelCase;
		}));
		//#endregion
		//#region node_modules/style-to-js/cjs/index.js
		var require_cjs = /* @__PURE__ */ __commonJSMin(((exports, module) => {
			var style_to_object_1 = (exports && exports.__importDefault || function(mod) {
				return mod && mod.__esModule ? mod : { "default": mod };
			})((init_esm(), __toCommonJS(esm_exports)));
			var utilities_1 = require_utilities();
			/**
			* Parses CSS inline style to JavaScript object (camelCased).
			*/
			function StyleToJS(style, options) {
				var output = {};
				if (!style || typeof style !== "string") return output;
				(0, style_to_object_1.default)(style, function(property, value) {
					if (property && value) output[(0, utilities_1.camelCase)(property, options)] = value;
				});
				return output;
			}
			StyleToJS.default = StyleToJS;
			module.exports = StyleToJS;
		}));
		//#endregion
		//#region node_modules/unist-util-position/lib/index.js
		/**
		* @typedef {import('unist').Node} Node
		* @typedef {import('unist').Point} Point
		* @typedef {import('unist').Position} Position
		*/
		/**
		* @typedef NodeLike
		* @property {string} type
		* @property {PositionLike | null | undefined} [position]
		*
		* @typedef PositionLike
		* @property {PointLike | null | undefined} [start]
		* @property {PointLike | null | undefined} [end]
		*
		* @typedef PointLike
		* @property {number | null | undefined} [line]
		* @property {number | null | undefined} [column]
		* @property {number | null | undefined} [offset]
		*/
		/**
		* Get the ending point of `node`.
		*
		* @param node
		*   Node.
		* @returns
		*   Point.
		*/
		const pointEnd = point$2("end");
		/**
		* Get the starting point of `node`.
		*
		* @param node
		*   Node.
		* @returns
		*   Point.
		*/
		const pointStart = point$2("start");
		/**
		* Get the positional info of `node`.
		*
		* @param {'end' | 'start'} type
		*   Side.
		* @returns
		*   Getter.
		*/
		function point$2(type) {
			return point;
			/**
			* Get the point info of `node` at a bound side.
			*
			* @param {Node | NodeLike | null | undefined} [node]
			* @returns {Point | undefined}
			*/
			function point(node) {
				const point = node && node.position && node.position[type] || {};
				if (typeof point.line === "number" && point.line > 0 && typeof point.column === "number" && point.column > 0) return {
					line: point.line,
					column: point.column,
					offset: typeof point.offset === "number" && point.offset > -1 ? point.offset : void 0
				};
			}
		}
		/**
		* Get the positional info of `node`.
		*
		* @param {Node | NodeLike | null | undefined} [node]
		*   Node.
		* @returns {Position | undefined}
		*   Position.
		*/
		function position$1(node) {
			const start = pointStart(node);
			const end = pointEnd(node);
			if (start && end) return {
				start,
				end
			};
		}
		//#endregion
		//#region node_modules/unist-util-stringify-position/lib/index.js
		/**
		* @typedef {import('unist').Node} Node
		* @typedef {import('unist').Point} Point
		* @typedef {import('unist').Position} Position
		*/
		/**
		* @typedef NodeLike
		* @property {string} type
		* @property {PositionLike | null | undefined} [position]
		*
		* @typedef PointLike
		* @property {number | null | undefined} [line]
		* @property {number | null | undefined} [column]
		* @property {number | null | undefined} [offset]
		*
		* @typedef PositionLike
		* @property {PointLike | null | undefined} [start]
		* @property {PointLike | null | undefined} [end]
		*/
		/**
		* Serialize the positional info of a point, position (start and end points),
		* or node.
		*
		* @param {Node | NodeLike | Point | PointLike | Position | PositionLike | null | undefined} [value]
		*   Node, position, or point.
		* @returns {string}
		*   Pretty printed positional info of a node (`string`).
		*
		*   In the format of a range `ls:cs-le:ce` (when given `node` or `position`)
		*   or a point `l:c` (when given `point`), where `l` stands for line, `c` for
		*   column, `s` for `start`, and `e` for end.
		*   An empty string (`''`) is returned if the given value is neither `node`,
		*   `position`, nor `point`.
		*/
		function stringifyPosition(value) {
			if (!value || typeof value !== "object") return "";
			if ("position" in value || "type" in value) return position(value.position);
			if ("start" in value || "end" in value) return position(value);
			if ("line" in value || "column" in value) return point$1(value);
			return "";
		}
		/**
		* @param {Point | PointLike | null | undefined} point
		* @returns {string}
		*/
		function point$1(point) {
			return index(point && point.line) + ":" + index(point && point.column);
		}
		/**
		* @param {Position | PositionLike | null | undefined} pos
		* @returns {string}
		*/
		function position(pos) {
			return point$1(pos && pos.start) + "-" + point$1(pos && pos.end);
		}
		/**
		* @param {number | null | undefined} value
		* @returns {number}
		*/
		function index(value) {
			return value && typeof value === "number" ? value : 1;
		}
		//#endregion
		//#region node_modules/vfile-message/lib/index.js
		/**
		* @import {Node, Point, Position} from 'unist'
		*/
		/**
		* @typedef {object & {type: string, position?: Position | undefined}} NodeLike
		*
		* @typedef Options
		*   Configuration.
		* @property {Array<Node> | null | undefined} [ancestors]
		*   Stack of (inclusive) ancestor nodes surrounding the message (optional).
		* @property {Error | null | undefined} [cause]
		*   Original error cause of the message (optional).
		* @property {Point | Position | null | undefined} [place]
		*   Place of message (optional).
		* @property {string | null | undefined} [ruleId]
		*   Category of message (optional, example: `'my-rule'`).
		* @property {string | null | undefined} [source]
		*   Namespace of who sent the message (optional, example: `'my-package'`).
		*/
		/**
		* Message.
		*/
		var VFileMessage = class extends Error {
			/**
			* Create a message for `reason`.
			*
			* > 🪦 **Note**: also has obsolete signatures.
			*
			* @overload
			* @param {string} reason
			* @param {Options | null | undefined} [options]
			* @returns
			*
			* @overload
			* @param {string} reason
			* @param {Node | NodeLike | null | undefined} parent
			* @param {string | null | undefined} [origin]
			* @returns
			*
			* @overload
			* @param {string} reason
			* @param {Point | Position | null | undefined} place
			* @param {string | null | undefined} [origin]
			* @returns
			*
			* @overload
			* @param {string} reason
			* @param {string | null | undefined} [origin]
			* @returns
			*
			* @overload
			* @param {Error | VFileMessage} cause
			* @param {Node | NodeLike | null | undefined} parent
			* @param {string | null | undefined} [origin]
			* @returns
			*
			* @overload
			* @param {Error | VFileMessage} cause
			* @param {Point | Position | null | undefined} place
			* @param {string | null | undefined} [origin]
			* @returns
			*
			* @overload
			* @param {Error | VFileMessage} cause
			* @param {string | null | undefined} [origin]
			* @returns
			*
			* @param {Error | VFileMessage | string} causeOrReason
			*   Reason for message, should use markdown.
			* @param {Node | NodeLike | Options | Point | Position | string | null | undefined} [optionsOrParentOrPlace]
			*   Configuration (optional).
			* @param {string | null | undefined} [origin]
			*   Place in code where the message originates (example:
			*   `'my-package:my-rule'` or `'my-rule'`).
			* @returns
			*   Instance of `VFileMessage`.
			*/
			constructor(causeOrReason, optionsOrParentOrPlace, origin) {
				super();
				if (typeof optionsOrParentOrPlace === "string") {
					origin = optionsOrParentOrPlace;
					optionsOrParentOrPlace = void 0;
				}
				/** @type {string} */
				let reason = "";
				/** @type {Options} */
				let options = {};
				let legacyCause = false;
				if (optionsOrParentOrPlace) {
					if ("line" in optionsOrParentOrPlace && "column" in optionsOrParentOrPlace) options = { place: optionsOrParentOrPlace };
					else if ("start" in optionsOrParentOrPlace && "end" in optionsOrParentOrPlace) options = { place: optionsOrParentOrPlace };
					else if ("type" in optionsOrParentOrPlace) options = {
						ancestors: [optionsOrParentOrPlace],
						place: optionsOrParentOrPlace.position
					};
					else options = { ...optionsOrParentOrPlace };
				}
				if (typeof causeOrReason === "string") reason = causeOrReason;
				else if (!options.cause && causeOrReason) {
					legacyCause = true;
					reason = causeOrReason.message;
					options.cause = causeOrReason;
				}
				if (!options.ruleId && !options.source && typeof origin === "string") {
					const index = origin.indexOf(":");
					if (index === -1) options.ruleId = origin;
					else {
						options.source = origin.slice(0, index);
						options.ruleId = origin.slice(index + 1);
					}
				}
				if (!options.place && options.ancestors && options.ancestors) {
					const parent = options.ancestors[options.ancestors.length - 1];
					if (parent) options.place = parent.position;
				}
				const start = options.place && "start" in options.place ? options.place.start : options.place;
				/**
				* Stack of ancestor nodes surrounding the message.
				*
				* @type {Array<Node> | undefined}
				*/
				this.ancestors = options.ancestors || void 0;
				/**
				* Original error cause of the message.
				*
				* @type {Error | undefined}
				*/
				this.cause = options.cause || void 0;
				/**
				* Starting column of message.
				*
				* @type {number | undefined}
				*/
				this.column = start ? start.column : void 0;
				/**
				* State of problem.
				*
				* * `true` — error, file not usable
				* * `false` — warning, change may be needed
				* * `undefined` — change likely not needed
				*
				* @type {boolean | null | undefined}
				*/
				this.fatal = void 0;
				/**
				* Path of a file (used throughout the `VFile` ecosystem).
				*
				* @type {string | undefined}
				*/
				this.file = "";
				/**
				* Reason for message.
				*
				* @type {string}
				*/
				this.message = reason;
				/**
				* Starting line of error.
				*
				* @type {number | undefined}
				*/
				this.line = start ? start.line : void 0;
				/**
				* Serialized positional info of message.
				*
				* On normal errors, this would be something like `ParseError`, buit in
				* `VFile` messages we use this space to show where an error happened.
				*/
				this.name = stringifyPosition(options.place) || "1:1";
				/**
				* Place of message.
				*
				* @type {Point | Position | undefined}
				*/
				this.place = options.place || void 0;
				/**
				* Reason for message, should use markdown.
				*
				* @type {string}
				*/
				this.reason = this.message;
				/**
				* Category of message (example: `'my-rule'`).
				*
				* @type {string | undefined}
				*/
				this.ruleId = options.ruleId || void 0;
				/**
				* Namespace of message (example: `'my-package'`).
				*
				* @type {string | undefined}
				*/
				this.source = options.source || void 0;
				/**
				* Stack of message.
				*
				* This is used by normal errors to show where something happened in
				* programming code, irrelevant for `VFile` messages,
				*
				* @type {string}
				*/
				this.stack = legacyCause && options.cause && typeof options.cause.stack === "string" ? options.cause.stack : "";
				/**
				* Specify the source value that’s being reported, which is deemed
				* incorrect.
				*
				* @type {string | undefined}
				*/
				this.actual = void 0;
				/**
				* Suggest acceptable values that can be used instead of `actual`.
				*
				* @type {Array<string> | undefined}
				*/
				this.expected = void 0;
				/**
				* Long form description of the message (you should use markdown).
				*
				* @type {string | undefined}
				*/
				this.note = void 0;
				/**
				* Link to docs for the message.
				*
				* > 👉 **Note**: this must be an absolute URL that can be passed as `x`
				* > to `new URL(x)`.
				*
				* @type {string | undefined}
				*/
				this.url = void 0;
			}
		};
		VFileMessage.prototype.file = "";
		VFileMessage.prototype.name = "";
		VFileMessage.prototype.reason = "";
		VFileMessage.prototype.message = "";
		VFileMessage.prototype.stack = "";
		VFileMessage.prototype.column = void 0;
		VFileMessage.prototype.line = void 0;
		VFileMessage.prototype.ancestors = void 0;
		VFileMessage.prototype.cause = void 0;
		VFileMessage.prototype.fatal = void 0;
		VFileMessage.prototype.place = void 0;
		VFileMessage.prototype.ruleId = void 0;
		VFileMessage.prototype.source = void 0;
		//#endregion
		//#region node_modules/hast-util-to-jsx-runtime/lib/index.js
		/**
		* @import {Identifier, Literal, MemberExpression} from 'estree'
		* @import {Jsx, JsxDev, Options, Props} from 'hast-util-to-jsx-runtime'
		* @import {Element, Nodes, Parents, Root, Text} from 'hast'
		* @import {MdxFlowExpressionHast, MdxTextExpressionHast} from 'mdast-util-mdx-expression'
		* @import {MdxJsxFlowElementHast, MdxJsxTextElementHast} from 'mdast-util-mdx-jsx'
		* @import {MdxjsEsmHast} from 'mdast-util-mdxjs-esm'
		* @import {Position} from 'unist'
		* @import {Child, Create, Field, JsxElement, State, Style} from './types.js'
		*/
		var import_cjs = /* @__PURE__ */ __toESM(require_cjs(), 1);
		const own$4 = {}.hasOwnProperty;
		/** @type {Map<string, number>} */
		const emptyMap = /* @__PURE__ */ new Map();
		const cap = /[A-Z]/g;
		const tableElements = /* @__PURE__ */ new Set([
			"table",
			"tbody",
			"thead",
			"tfoot",
			"tr"
		]);
		const tableCellElement = /* @__PURE__ */ new Set(["td", "th"]);
		const docs = "https://github.com/syntax-tree/hast-util-to-jsx-runtime";
		/**
		* Transform a hast tree to preact, react, solid, svelte, vue, etc.,
		* with an automatic JSX runtime.
		*
		* @param {Nodes} tree
		*   Tree to transform.
		* @param {Options} options
		*   Configuration (required).
		* @returns {JsxElement}
		*   JSX element.
		*/
		function toJsxRuntime(tree, options) {
			if (!options || options.Fragment === void 0) throw new TypeError("Expected `Fragment` in options");
			const filePath = options.filePath || void 0;
			/** @type {Create} */
			let create;
			if (options.development) {
				if (typeof options.jsxDEV !== "function") throw new TypeError("Expected `jsxDEV` in options when `development: true`");
				create = developmentCreate(filePath, options.jsxDEV);
			} else {
				if (typeof options.jsx !== "function") throw new TypeError("Expected `jsx` in production options");
				if (typeof options.jsxs !== "function") throw new TypeError("Expected `jsxs` in production options");
				create = productionCreate(filePath, options.jsx, options.jsxs);
			}
			/** @type {State} */
			const state = {
				Fragment: options.Fragment,
				ancestors: [],
				components: options.components || {},
				create,
				elementAttributeNameCase: options.elementAttributeNameCase || "react",
				evaluater: options.createEvaluater ? options.createEvaluater() : void 0,
				filePath,
				ignoreInvalidStyle: options.ignoreInvalidStyle || false,
				passKeys: options.passKeys !== false,
				passNode: options.passNode || false,
				schema: options.space === "svg" ? svg : html$2,
				stylePropertyNameCase: options.stylePropertyNameCase || "dom",
				tableCellAlignToStyle: options.tableCellAlignToStyle !== false
			};
			const result = one$1(state, tree, void 0);
			if (result && typeof result !== "string") return result;
			return state.create(tree, state.Fragment, { children: result || void 0 }, void 0);
		}
		/**
		* Transform a node.
		*
		* @param {State} state
		*   Info passed around.
		* @param {Nodes} node
		*   Current node.
		* @param {string | undefined} key
		*   Key.
		* @returns {Child | undefined}
		*   Child, optional.
		*/
		function one$1(state, node, key) {
			if (node.type === "element") return element$1(state, node, key);
			if (node.type === "mdxFlowExpression" || node.type === "mdxTextExpression") return mdxExpression(state, node);
			if (node.type === "mdxJsxFlowElement" || node.type === "mdxJsxTextElement") return mdxJsxElement(state, node, key);
			if (node.type === "mdxjsEsm") return mdxEsm(state, node);
			if (node.type === "root") return root$2(state, node, key);
			if (node.type === "text") return text$5(state, node);
		}
		/**
		* Handle element.
		*
		* @param {State} state
		*   Info passed around.
		* @param {Element} node
		*   Current node.
		* @param {string | undefined} key
		*   Key.
		* @returns {Child | undefined}
		*   Child, optional.
		*/
		function element$1(state, node, key) {
			const parentSchema = state.schema;
			let schema = parentSchema;
			if (node.tagName.toLowerCase() === "svg" && parentSchema.space === "html") {
				schema = svg;
				state.schema = schema;
			}
			state.ancestors.push(node);
			const type = findComponentFromName(state, node.tagName, false);
			const props = createElementProps(state, node);
			let children = createChildren(state, node);
			if (tableElements.has(node.tagName)) children = children.filter(function(child) {
				return typeof child === "string" ? !whitespace(child) : true;
			});
			addNode(state, props, type, node);
			addChildren(props, children);
			state.ancestors.pop();
			state.schema = parentSchema;
			return state.create(node, type, props, key);
		}
		/**
		* Handle MDX expression.
		*
		* @param {State} state
		*   Info passed around.
		* @param {MdxFlowExpressionHast | MdxTextExpressionHast} node
		*   Current node.
		* @returns {Child | undefined}
		*   Child, optional.
		*/
		function mdxExpression(state, node) {
			if (node.data && node.data.estree && state.evaluater) {
				const expression = node.data.estree.body[0];
				expression.type;
				return state.evaluater.evaluateExpression(expression.expression);
			}
			crashEstree(state, node.position);
		}
		/**
		* Handle MDX ESM.
		*
		* @param {State} state
		*   Info passed around.
		* @param {MdxjsEsmHast} node
		*   Current node.
		* @returns {Child | undefined}
		*   Child, optional.
		*/
		function mdxEsm(state, node) {
			if (node.data && node.data.estree && state.evaluater) return state.evaluater.evaluateProgram(node.data.estree);
			crashEstree(state, node.position);
		}
		/**
		* Handle MDX JSX.
		*
		* @param {State} state
		*   Info passed around.
		* @param {MdxJsxFlowElementHast | MdxJsxTextElementHast} node
		*   Current node.
		* @param {string | undefined} key
		*   Key.
		* @returns {Child | undefined}
		*   Child, optional.
		*/
		function mdxJsxElement(state, node, key) {
			const parentSchema = state.schema;
			let schema = parentSchema;
			if (node.name === "svg" && parentSchema.space === "html") {
				schema = svg;
				state.schema = schema;
			}
			state.ancestors.push(node);
			const type = node.name === null ? state.Fragment : findComponentFromName(state, node.name, true);
			const props = createJsxElementProps(state, node);
			const children = createChildren(state, node);
			addNode(state, props, type, node);
			addChildren(props, children);
			state.ancestors.pop();
			state.schema = parentSchema;
			return state.create(node, type, props, key);
		}
		/**
		* Handle root.
		*
		* @param {State} state
		*   Info passed around.
		* @param {Root} node
		*   Current node.
		* @param {string | undefined} key
		*   Key.
		* @returns {Child | undefined}
		*   Child, optional.
		*/
		function root$2(state, node, key) {
			/** @type {Props} */
			const props = {};
			addChildren(props, createChildren(state, node));
			return state.create(node, state.Fragment, props, key);
		}
		/**
		* Handle text.
		*
		* @param {State} _
		*   Info passed around.
		* @param {Text} node
		*   Current node.
		* @returns {Child | undefined}
		*   Child, optional.
		*/
		function text$5(_, node) {
			return node.value;
		}
		/**
		* Add `node` to props.
		*
		* @param {State} state
		*   Info passed around.
		* @param {Props} props
		*   Props.
		* @param {unknown} type
		*   Type.
		* @param {Element | MdxJsxFlowElementHast | MdxJsxTextElementHast} node
		*   Node.
		* @returns {undefined}
		*   Nothing.
		*/
		function addNode(state, props, type, node) {
			if (typeof type !== "string" && type !== state.Fragment && state.passNode) props.node = node;
		}
		/**
		* Add children to props.
		*
		* @param {Props} props
		*   Props.
		* @param {Array<Child>} children
		*   Children.
		* @returns {undefined}
		*   Nothing.
		*/
		function addChildren(props, children) {
			if (children.length > 0) {
				const value = children.length > 1 ? children : children[0];
				if (value) props.children = value;
			}
		}
		/**
		* @param {string | undefined} _
		*   Path to file.
		* @param {Jsx} jsx
		*   Dynamic.
		* @param {Jsx} jsxs
		*   Static.
		* @returns {Create}
		*   Create a production element.
		*/
		function productionCreate(_, jsx, jsxs) {
			return create;
			/** @type {Create} */
			function create(_, type, props, key) {
				const fn = Array.isArray(props.children) ? jsxs : jsx;
				return key ? fn(type, props, key) : fn(type, props);
			}
		}
		/**
		* @param {string | undefined} filePath
		*   Path to file.
		* @param {JsxDev} jsxDEV
		*   Development.
		* @returns {Create}
		*   Create a development element.
		*/
		function developmentCreate(filePath, jsxDEV) {
			return create;
			/** @type {Create} */
			function create(node, type, props, key) {
				const isStaticChildren = Array.isArray(props.children);
				const point = pointStart(node);
				return jsxDEV(type, props, key, isStaticChildren, {
					columnNumber: point ? point.column - 1 : void 0,
					fileName: filePath,
					lineNumber: point ? point.line : void 0
				}, void 0);
			}
		}
		/**
		* Create props from an element.
		*
		* @param {State} state
		*   Info passed around.
		* @param {Element} node
		*   Current element.
		* @returns {Props}
		*   Props.
		*/
		function createElementProps(state, node) {
			/** @type {Props} */
			const props = {};
			/** @type {string | undefined} */
			let alignValue;
			/** @type {string} */
			let prop;
			for (prop in node.properties) if (prop !== "children" && own$4.call(node.properties, prop)) {
				const result = createProperty(state, prop, node.properties[prop]);
				if (result) {
					const [key, value] = result;
					if (state.tableCellAlignToStyle && key === "align" && typeof value === "string" && tableCellElement.has(node.tagName)) alignValue = value;
					else props[key] = value;
				}
			}
			if (alignValue) {
				const style = props.style || (props.style = {});
				style[state.stylePropertyNameCase === "css" ? "text-align" : "textAlign"] = alignValue;
			}
			return props;
		}
		/**
		* Create props from a JSX element.
		*
		* @param {State} state
		*   Info passed around.
		* @param {MdxJsxFlowElementHast | MdxJsxTextElementHast} node
		*   Current JSX element.
		* @returns {Props}
		*   Props.
		*/
		function createJsxElementProps(state, node) {
			/** @type {Props} */
			const props = {};
			for (const attribute of node.attributes) if (attribute.type === "mdxJsxExpressionAttribute") {
				if (attribute.data && attribute.data.estree && state.evaluater) {
					const expression = attribute.data.estree.body[0];
					expression.type;
					const objectExpression = expression.expression;
					objectExpression.type;
					const property = objectExpression.properties[0];
					property.type;
					Object.assign(props, state.evaluater.evaluateExpression(property.argument));
				} else crashEstree(state, node.position);
			} else {
				const name = attribute.name;
				/** @type {unknown} */
				let value;
				if (attribute.value && typeof attribute.value === "object") {
					if (attribute.value.data && attribute.value.data.estree && state.evaluater) {
						const expression = attribute.value.data.estree.body[0];
						expression.type;
						value = state.evaluater.evaluateExpression(expression.expression);
					} else crashEstree(state, node.position);
				} else value = attribute.value === null ? true : attribute.value;
				props[name] = value;
			}
			return props;
		}
		/**
		* Create children.
		*
		* @param {State} state
		*   Info passed around.
		* @param {Parents} node
		*   Current element.
		* @returns {Array<Child>}
		*   Children.
		*/
		function createChildren(state, node) {
			/** @type {Array<Child>} */
			const children = [];
			let index = -1;
			/** @type {Map<string, number>} */
			/* c8 ignore next */
			const countsByName = state.passKeys ? /* @__PURE__ */ new Map() : emptyMap;
			while (++index < node.children.length) {
				const child = node.children[index];
				/** @type {string | undefined} */
				let key;
				if (state.passKeys) {
					const name = child.type === "element" ? child.tagName : child.type === "mdxJsxFlowElement" || child.type === "mdxJsxTextElement" ? child.name : void 0;
					if (name) {
						const count = countsByName.get(name) || 0;
						key = name + "-" + count;
						countsByName.set(name, count + 1);
					}
				}
				const result = one$1(state, child, key);
				if (result !== void 0) children.push(result);
			}
			return children;
		}
		/**
		* Handle a property.
		*
		* @param {State} state
		*   Info passed around.
		* @param {string} prop
		*   Key.
		* @param {Array<number | string> | boolean | number | string | null | undefined} value
		*   hast property value.
		* @returns {Field | undefined}
		*   Field for runtime, optional.
		*/
		function createProperty(state, prop, value) {
			const info = find(state.schema, prop);
			if (value === null || value === void 0 || typeof value === "number" && Number.isNaN(value)) return;
			if (Array.isArray(value)) value = info.commaSeparated ? stringify$1(value) : stringify(value);
			if (info.property === "style") {
				let styleObject = typeof value === "object" ? value : parseStyle(state, String(value));
				if (state.stylePropertyNameCase === "css") styleObject = transformStylesToCssCasing(styleObject);
				return ["style", styleObject];
			}
			return [state.elementAttributeNameCase === "react" && info.space ? hastToReact[info.property] || info.property : info.attribute, value];
		}
		/**
		* Parse a CSS declaration to an object.
		*
		* @param {State} state
		*   Info passed around.
		* @param {string} value
		*   CSS declarations.
		* @returns {Style}
		*   Properties.
		* @throws
		*   Throws `VFileMessage` when CSS cannot be parsed.
		*/
		function parseStyle(state, value) {
			try {
				return (0, import_cjs.default)(value, { reactCompat: true });
			} catch (error) {
				if (state.ignoreInvalidStyle) return {};
				const cause = error;
				const message = new VFileMessage("Cannot parse `style` attribute", {
					ancestors: state.ancestors,
					cause,
					ruleId: "style",
					source: "hast-util-to-jsx-runtime"
				});
				message.file = state.filePath || void 0;
				message.url = docs + "#cannot-parse-style-attribute";
				throw message;
			}
		}
		/**
		* Create a JSX name from a string.
		*
		* @param {State} state
		*   To do.
		* @param {string} name
		*   Name.
		* @param {boolean} allowExpression
		*   Allow member expressions and identifiers.
		* @returns {unknown}
		*   To do.
		*/
		function findComponentFromName(state, name$1, allowExpression) {
			/** @type {Identifier | Literal | MemberExpression} */
			let result;
			if (!allowExpression) result = {
				type: "Literal",
				value: name$1
			};
			else if (name$1.includes(".")) {
				const identifiers = name$1.split(".");
				let index = -1;
				/** @type {Identifier | Literal | MemberExpression | undefined} */
				let node;
				while (++index < identifiers.length) {
					/** @type {Identifier | Literal} */
					const prop = name(identifiers[index]) ? {
						type: "Identifier",
						name: identifiers[index]
					} : {
						type: "Literal",
						value: identifiers[index]
					};
					node = node ? {
						type: "MemberExpression",
						object: node,
						property: prop,
						computed: Boolean(index && prop.type === "Literal"),
						optional: false
					} : prop;
				}
				result = node;
			} else result = name(name$1) && !/^[a-z]/.test(name$1) ? {
				type: "Identifier",
				name: name$1
			} : {
				type: "Literal",
				value: name$1
			};
			if (result.type === "Literal") {
				const name = result.value;
				return own$4.call(state.components, name) ? state.components[name] : name;
			}
			if (state.evaluater) return state.evaluater.evaluateExpression(result);
			crashEstree(state);
		}
		/**
		* @param {State} state
		* @param {Position | undefined} [place]
		* @returns {never}
		*/
		function crashEstree(state, place) {
			const message = new VFileMessage("Cannot handle MDX estrees without `createEvaluater`", {
				ancestors: state.ancestors,
				place,
				ruleId: "mdx-estree",
				source: "hast-util-to-jsx-runtime"
			});
			message.file = state.filePath || void 0;
			message.url = docs + "#cannot-handle-mdx-estrees-without-createevaluater";
			throw message;
		}
		/**
		* Transform a DOM casing style object to a CSS casing style object.
		*
		* @param {Style} domCasing
		* @returns {Style}
		*/
		function transformStylesToCssCasing(domCasing) {
			/** @type {Style} */
			const cssCasing = {};
			/** @type {string} */
			let from;
			for (from in domCasing) if (own$4.call(domCasing, from)) cssCasing[transformStyleToCssCasing(from)] = domCasing[from];
			return cssCasing;
		}
		/**
		* Transform a DOM casing style field to a CSS casing style field.
		*
		* @param {string} from
		* @returns {string}
		*/
		function transformStyleToCssCasing(from) {
			let to = from.replace(cap, toDash);
			if (to.slice(0, 3) === "ms-") to = "-" + to;
			return to;
		}
		/**
		* Make `$0` dash cased.
		*
		* @param {string} $0
		*   Capitalized ASCII leter.
		* @returns {string}
		*   Dash and lower letter.
		*/
		function toDash($0) {
			return "-" + $0.toLowerCase();
		}
		//#endregion
		//#region node_modules/html-url-attributes/lib/index.js
		/**
		* HTML URL properties.
		*
		* Each key is a property name and each value is a list of tag names it applies
		* to or `null` if it applies to all elements.
		*
		* @type {Record<string, Array<string> | null>}
		*/
		const urlAttributes = {
			action: ["form"],
			cite: [
				"blockquote",
				"del",
				"ins",
				"q"
			],
			data: ["object"],
			formAction: ["button", "input"],
			href: [
				"a",
				"area",
				"base",
				"link"
			],
			icon: ["menuitem"],
			itemId: null,
			manifest: ["html"],
			ping: ["a", "area"],
			poster: ["video"],
			src: [
				"audio",
				"embed",
				"iframe",
				"img",
				"input",
				"script",
				"source",
				"track",
				"video"
			]
		};
		//#endregion
		//#region node_modules/mdast-util-to-string/lib/index.js
		/**
		* @typedef {import('mdast').Nodes} Nodes
		*
		* @typedef Options
		*   Configuration (optional).
		* @property {boolean | null | undefined} [includeImageAlt=true]
		*   Whether to use `alt` for `image`s (default: `true`).
		* @property {boolean | null | undefined} [includeHtml=true]
		*   Whether to use `value` of HTML (default: `true`).
		*/
		/** @type {Options} */
		const emptyOptions$2 = {};
		/**
		* Get the text content of a node or list of nodes.
		*
		* Prefers the node’s plain-text fields, otherwise serializes its children,
		* and if the given value is an array, serialize the nodes in it.
		*
		* @param {unknown} [value]
		*   Thing to serialize, typically `Node`.
		* @param {Options | null | undefined} [options]
		*   Configuration (optional).
		* @returns {string}
		*   Serialized `value`.
		*/
		function toString$1(value, options) {
			const settings = options || emptyOptions$2;
			return one(value, typeof settings.includeImageAlt === "boolean" ? settings.includeImageAlt : true, typeof settings.includeHtml === "boolean" ? settings.includeHtml : true);
		}
		/**
		* One node or several nodes.
		*
		* @param {unknown} value
		*   Thing to serialize.
		* @param {boolean} includeImageAlt
		*   Include image `alt`s.
		* @param {boolean} includeHtml
		*   Include HTML.
		* @returns {string}
		*   Serialized node.
		*/
		function one(value, includeImageAlt, includeHtml) {
			if (node$1(value)) {
				if ("value" in value) return value.type === "html" && !includeHtml ? "" : value.value;
				if (includeImageAlt && "alt" in value && value.alt) return value.alt;
				if ("children" in value) return all(value.children, includeImageAlt, includeHtml);
			}
			if (Array.isArray(value)) return all(value, includeImageAlt, includeHtml);
			return "";
		}
		/**
		* Serialize a list of nodes.
		*
		* @param {Array<unknown>} values
		*   Thing to serialize.
		* @param {boolean} includeImageAlt
		*   Include image `alt`s.
		* @param {boolean} includeHtml
		*   Include HTML.
		* @returns {string}
		*   Serialized nodes.
		*/
		function all(values, includeImageAlt, includeHtml) {
			/** @type {Array<string>} */
			const result = [];
			let index = -1;
			while (++index < values.length) result[index] = one(values[index], includeImageAlt, includeHtml);
			return result.join("");
		}
		/**
		* Check if `value` looks like a node.
		*
		* @param {unknown} value
		*   Thing.
		* @returns {value is Nodes}
		*   Whether `value` is a node.
		*/
		function node$1(value) {
			return Boolean(value && typeof value === "object");
		}
		//#endregion
		//#region node_modules/decode-named-character-reference/index.dom.js
		const element = document.createElement("i");
		/**
		* @param {string} value
		* @returns {string | false}
		*/
		function decodeNamedCharacterReference(value) {
			const characterReference = "&" + value + ";";
			element.innerHTML = characterReference;
			const character = element.textContent;
			if (character.charCodeAt(character.length - 1) === 59 && value !== "semi") return false;
			return character === characterReference ? false : character;
		}
		//#endregion
		//#region node_modules/micromark-util-chunked/index.js
		/**
		* Like `Array#splice`, but smarter for giant arrays.
		*
		* `Array#splice` takes all items to be inserted as individual argument which
		* causes a stack overflow in V8 when trying to insert 100k items for instance.
		*
		* Otherwise, this does not return the removed items, and takes `items` as an
		* array instead of rest parameters.
		*
		* @template {unknown} T
		*   Item type.
		* @param {Array<T>} list
		*   List to operate on.
		* @param {number} start
		*   Index to remove/insert at (can be negative).
		* @param {number} remove
		*   Number of items to remove.
		* @param {Array<T>} items
		*   Items to inject into `list`.
		* @returns {undefined}
		*   Nothing.
		*/
		function splice(list, start, remove, items) {
			const end = list.length;
			let chunkStart = 0;
			/** @type {Array<unknown>} */
			let parameters;
			if (start < 0) start = -start > end ? 0 : end + start;
			else start = start > end ? end : start;
			remove = remove > 0 ? remove : 0;
			if (items.length < 1e4) {
				parameters = Array.from(items);
				parameters.unshift(start, remove);
				list.splice(...parameters);
			} else {
				if (remove) list.splice(start, remove);
				while (chunkStart < items.length) {
					parameters = items.slice(chunkStart, chunkStart + 1e4);
					parameters.unshift(start, 0);
					list.splice(...parameters);
					chunkStart += 1e4;
					start += 1e4;
				}
			}
		}
		/**
		* Append `items` (an array) at the end of `list` (another array).
		* When `list` was empty, returns `items` instead.
		*
		* This prevents a potentially expensive operation when `list` is empty,
		* and adds items in batches to prevent V8 from hanging.
		*
		* @template {unknown} T
		*   Item type.
		* @param {Array<T>} list
		*   List to operate on.
		* @param {Array<T>} items
		*   Items to add to `list`.
		* @returns {Array<T>}
		*   Either `list` or `items`.
		*/
		function push(list, items) {
			if (list.length > 0) {
				splice(list, list.length, 0, items);
				return list;
			}
			return items;
		}
		//#endregion
		//#region node_modules/micromark-util-combine-extensions/index.js
		/**
		* @import {
		*   Extension,
		*   Handles,
		*   HtmlExtension,
		*   NormalizedExtension
		* } from 'micromark-util-types'
		*/
		const hasOwnProperty = {}.hasOwnProperty;
		/**
		* Combine multiple syntax extensions into one.
		*
		* @param {ReadonlyArray<Extension>} extensions
		*   List of syntax extensions.
		* @returns {NormalizedExtension}
		*   A single combined extension.
		*/
		function combineExtensions(extensions) {
			/** @type {NormalizedExtension} */
			const all = {};
			let index = -1;
			while (++index < extensions.length) syntaxExtension(all, extensions[index]);
			return all;
		}
		/**
		* Merge `extension` into `all`.
		*
		* @param {NormalizedExtension} all
		*   Extension to merge into.
		* @param {Extension} extension
		*   Extension to merge.
		* @returns {undefined}
		*   Nothing.
		*/
		function syntaxExtension(all, extension) {
			/** @type {keyof Extension} */
			let hook;
			for (hook in extension) {
				/** @type {Record<string, unknown>} */
				const left = (hasOwnProperty.call(all, hook) ? all[hook] : void 0) || (all[hook] = {});
				/** @type {Record<string, unknown> | undefined} */
				const right = extension[hook];
				/** @type {string} */
				let code;
				if (right) for (code in right) {
					if (!hasOwnProperty.call(left, code)) left[code] = [];
					const value = right[code];
					constructs(left[code], Array.isArray(value) ? value : value ? [value] : []);
				}
			}
		}
		/**
		* Merge `list` into `existing` (both lists of constructs).
		* Mutates `existing`.
		*
		* @param {Array<unknown>} existing
		*   List of constructs to merge into.
		* @param {Array<unknown>} list
		*   List of constructs to merge.
		* @returns {undefined}
		*   Nothing.
		*/
		function constructs(existing, list) {
			let index = -1;
			/** @type {Array<unknown>} */
			const before = [];
			while (++index < list.length) (list[index].add === "after" ? existing : before).push(list[index]);
			splice(existing, 0, 0, before);
		}
		//#endregion
		//#region node_modules/micromark-util-decode-numeric-character-reference/index.js
		/**
		* Turn the number (in string form as either hexa- or plain decimal) coming from
		* a numeric character reference into a character.
		*
		* Sort of like `String.fromCodePoint(Number.parseInt(value, base))`, but makes
		* non-characters and control characters safe.
		*
		* @param {string} value
		*   Value to decode.
		* @param {number} base
		*   Numeric base.
		* @returns {string}
		*   Character.
		*/
		function decodeNumericCharacterReference(value, base) {
			const code = Number.parseInt(value, base);
			if (code < 9 || code === 11 || code > 13 && code < 32 || code > 126 && code < 160 || code > 55295 && code < 57344 || code > 64975 && code < 65008 || (code & 65535) === 65535 || (code & 65535) === 65534 || code > 1114111) return "�";
			return String.fromCodePoint(code);
		}
		//#endregion
		//#region node_modules/micromark-util-normalize-identifier/index.js
		/**
		* Normalize an identifier (as found in references, definitions).
		*
		* Collapses markdown whitespace, trim, and then lower- and uppercase.
		*
		* Some characters are considered “uppercase”, such as U+03F4 (`ϴ`), but if their
		* lowercase counterpart (U+03B8 (`θ`)) is uppercased will result in a different
		* uppercase character (U+0398 (`Θ`)).
		* So, to get a canonical form, we perform both lower- and uppercase.
		*
		* Using uppercase last makes sure keys will never interact with default
		* prototypal values (such as `constructor`): nothing in the prototype of
		* `Object` is uppercase.
		*
		* @param {string} value
		*   Identifier to normalize.
		* @returns {string}
		*   Normalized identifier.
		*/
		function normalizeIdentifier(value) {
			return value.replace(/[\t\n\r ]+/g, " ").replace(/^ | $/g, "").toLowerCase().toUpperCase();
		}
		//#endregion
		//#region node_modules/micromark-util-character/index.js
		/**
		* @import {Code} from 'micromark-util-types'
		*/
		/**
		* Check whether the character code represents an ASCII alpha (`a` through `z`,
		* case insensitive).
		*
		* An **ASCII alpha** is an ASCII upper alpha or ASCII lower alpha.
		*
		* An **ASCII upper alpha** is a character in the inclusive range U+0041 (`A`)
		* to U+005A (`Z`).
		*
		* An **ASCII lower alpha** is a character in the inclusive range U+0061 (`a`)
		* to U+007A (`z`).
		*
		* @param code
		*   Code.
		* @returns {boolean}
		*   Whether it matches.
		*/
		const asciiAlpha = regexCheck(/[A-Za-z]/);
		/**
		* Check whether the character code represents an ASCII alphanumeric (`a`
		* through `z`, case insensitive, or `0` through `9`).
		*
		* An **ASCII alphanumeric** is an ASCII digit (see `asciiDigit`) or ASCII alpha
		* (see `asciiAlpha`).
		*
		* @param code
		*   Code.
		* @returns {boolean}
		*   Whether it matches.
		*/
		const asciiAlphanumeric = regexCheck(/[\dA-Za-z]/);
		/**
		* Check whether the character code represents an ASCII atext.
		*
		* atext is an ASCII alphanumeric (see `asciiAlphanumeric`), or a character in
		* the inclusive ranges U+0023 NUMBER SIGN (`#`) to U+0027 APOSTROPHE (`'`),
		* U+002A ASTERISK (`*`), U+002B PLUS SIGN (`+`), U+002D DASH (`-`), U+002F
		* SLASH (`/`), U+003D EQUALS TO (`=`), U+003F QUESTION MARK (`?`), U+005E
		* CARET (`^`) to U+0060 GRAVE ACCENT (`` ` ``), or U+007B LEFT CURLY BRACE
		* (`{`) to U+007E TILDE (`~`).
		*
		* See:
		* **\[RFC5322]**:
		* [Internet Message Format](https://tools.ietf.org/html/rfc5322).
		* P. Resnick.
		* IETF.
		*
		* @param code
		*   Code.
		* @returns {boolean}
		*   Whether it matches.
		*/
		const asciiAtext = regexCheck(/[#-'*+\--9=?A-Z^-~]/);
		/**
		* Check whether a character code is an ASCII control character.
		*
		* An **ASCII control** is a character in the inclusive range U+0000 NULL (NUL)
		* to U+001F (US), or U+007F (DEL).
		*
		* @param {Code} code
		*   Code.
		* @returns {boolean}
		*   Whether it matches.
		*/
		function asciiControl(code) {
			return code !== null && (code < 32 || code === 127);
		}
		/**
		* Check whether the character code represents an ASCII digit (`0` through `9`).
		*
		* An **ASCII digit** is a character in the inclusive range U+0030 (`0`) to
		* U+0039 (`9`).
		*
		* @param code
		*   Code.
		* @returns {boolean}
		*   Whether it matches.
		*/
		const asciiDigit = regexCheck(/\d/);
		/**
		* Check whether the character code represents an ASCII hex digit (`a` through
		* `f`, case insensitive, or `0` through `9`).
		*
		* An **ASCII hex digit** is an ASCII digit (see `asciiDigit`), ASCII upper hex
		* digit, or an ASCII lower hex digit.
		*
		* An **ASCII upper hex digit** is a character in the inclusive range U+0041
		* (`A`) to U+0046 (`F`).
		*
		* An **ASCII lower hex digit** is a character in the inclusive range U+0061
		* (`a`) to U+0066 (`f`).
		*
		* @param code
		*   Code.
		* @returns {boolean}
		*   Whether it matches.
		*/
		const asciiHexDigit = regexCheck(/[\dA-Fa-f]/);
		/**
		* Check whether the character code represents ASCII punctuation.
		*
		* An **ASCII punctuation** is a character in the inclusive ranges U+0021
		* EXCLAMATION MARK (`!`) to U+002F SLASH (`/`), U+003A COLON (`:`) to U+0040 AT
		* SIGN (`@`), U+005B LEFT SQUARE BRACKET (`[`) to U+0060 GRAVE ACCENT
		* (`` ` ``), or U+007B LEFT CURLY BRACE (`{`) to U+007E TILDE (`~`).
		*
		* @param code
		*   Code.
		* @returns {boolean}
		*   Whether it matches.
		*/
		const asciiPunctuation = regexCheck(/[!-/:-@[-`{-~]/);
		/**
		* Check whether a character code is a markdown line ending.
		*
		* A **markdown line ending** is the virtual characters M-0003 CARRIAGE RETURN
		* LINE FEED (CRLF), M-0004 LINE FEED (LF) and M-0005 CARRIAGE RETURN (CR).
		*
		* In micromark, the actual character U+000A LINE FEED (LF) and U+000D CARRIAGE
		* RETURN (CR) are replaced by these virtual characters depending on whether
		* they occurred together.
		*
		* @param {Code} code
		*   Code.
		* @returns {boolean}
		*   Whether it matches.
		*/
		function markdownLineEnding(code) {
			return code !== null && code < -2;
		}
		/**
		* Check whether a character code is a markdown line ending (see
		* `markdownLineEnding`) or markdown space (see `markdownSpace`).
		*
		* @param {Code} code
		*   Code.
		* @returns {boolean}
		*   Whether it matches.
		*/
		function markdownLineEndingOrSpace(code) {
			return code !== null && (code < 0 || code === 32);
		}
		/**
		* Check whether a character code is a markdown space.
		*
		* A **markdown space** is the concrete character U+0020 SPACE (SP) and the
		* virtual characters M-0001 VIRTUAL SPACE (VS) and M-0002 HORIZONTAL TAB (HT).
		*
		* In micromark, the actual character U+0009 CHARACTER TABULATION (HT) is
		* replaced by one M-0002 HORIZONTAL TAB (HT) and between 0 and 3 M-0001 VIRTUAL
		* SPACE (VS) characters, depending on the column at which the tab occurred.
		*
		* @param {Code} code
		*   Code.
		* @returns {boolean}
		*   Whether it matches.
		*/
		function markdownSpace(code) {
			return code === -2 || code === -1 || code === 32;
		}
		/**
		* Check whether the character code represents Unicode punctuation.
		*
		* A **Unicode punctuation** is a character in the Unicode `Pc` (Punctuation,
		* Connector), `Pd` (Punctuation, Dash), `Pe` (Punctuation, Close), `Pf`
		* (Punctuation, Final quote), `Pi` (Punctuation, Initial quote), `Po`
		* (Punctuation, Other), or `Ps` (Punctuation, Open) categories, or an ASCII
		* punctuation (see `asciiPunctuation`).
		*
		* See:
		* **\[UNICODE]**:
		* [The Unicode Standard](https://www.unicode.org/versions/).
		* Unicode Consortium.
		*
		* @param code
		*   Code.
		* @returns
		*   Whether it matches.
		*/
		const unicodePunctuation = regexCheck(/\p{P}|\p{S}/u);
		/**
		* Check whether the character code represents Unicode whitespace.
		*
		* Note that this does handle micromark specific markdown whitespace characters.
		* See `markdownLineEndingOrSpace` to check that.
		*
		* A **Unicode whitespace** is a character in the Unicode `Zs` (Separator,
		* Space) category, or U+0009 CHARACTER TABULATION (HT), U+000A LINE FEED (LF),
		* U+000C (FF), or U+000D CARRIAGE RETURN (CR) (**\[UNICODE]**).
		*
		* See:
		* **\[UNICODE]**:
		* [The Unicode Standard](https://www.unicode.org/versions/).
		* Unicode Consortium.
		*
		* @param code
		*   Code.
		* @returns
		*   Whether it matches.
		*/
		const unicodeWhitespace = regexCheck(/\s/);
		/**
		* Create a code check from a regex.
		*
		* @param {RegExp} regex
		*   Expression.
		* @returns {(code: Code) => boolean}
		*   Check.
		*/
		function regexCheck(regex) {
			return check;
			/**
			* Check whether a code matches the bound regex.
			*
			* @param {Code} code
			*   Character code.
			* @returns {boolean}
			*   Whether the character code matches the bound regex.
			*/
			function check(code) {
				return code !== null && code > -1 && regex.test(String.fromCharCode(code));
			}
		}
		//#endregion
		//#region node_modules/micromark-util-sanitize-uri/index.js
		/**
		* Normalize a URL.
		*
		* Encode unsafe characters with percent-encoding, skipping already encoded
		* sequences.
		*
		* @param {string} value
		*   URI to normalize.
		* @returns {string}
		*   Normalized URI.
		*/
		function normalizeUri(value) {
			/** @type {Array<string>} */
			const result = [];
			let index = -1;
			let start = 0;
			let skip = 0;
			while (++index < value.length) {
				const code = value.charCodeAt(index);
				/** @type {string} */
				let replace = "";
				if (code === 37 && asciiAlphanumeric(value.charCodeAt(index + 1)) && asciiAlphanumeric(value.charCodeAt(index + 2))) skip = 2;
				else if (code < 128) {
					if (!/[!#$&-;=?-Z_a-z~]/.test(String.fromCharCode(code))) replace = String.fromCharCode(code);
				} else if (code > 55295 && code < 57344) {
					const next = value.charCodeAt(index + 1);
					if (code < 56320 && next > 56319 && next < 57344) {
						replace = String.fromCharCode(code, next);
						skip = 1;
					} else replace = "�";
				} else replace = String.fromCharCode(code);
				if (replace) {
					result.push(value.slice(start, index), encodeURIComponent(replace));
					start = index + skip + 1;
					replace = "";
				}
				if (skip) {
					index += skip;
					skip = 0;
				}
			}
			return result.join("") + value.slice(start);
		}
		//#endregion
		//#region node_modules/micromark-factory-space/index.js
		/**
		* @import {Effects, State, TokenType} from 'micromark-util-types'
		*/
		/**
		* Parse spaces and tabs.
		*
		* There is no `nok` parameter:
		*
		* *   spaces in markdown are often optional, in which case this factory can be
		*     used and `ok` will be switched to whether spaces were found or not
		* *   one line ending or space can be detected with `markdownSpace(code)` right
		*     before using `factorySpace`
		*
		* ###### Examples
		*
		* Where `␉` represents a tab (plus how much it expands) and `␠` represents a
		* single space.
		*
		* ```markdown
		* ␉
		* ␠␠␠␠
		* ␉␠
		* ```
		*
		* @param {Effects} effects
		*   Context.
		* @param {State} ok
		*   State switched to when successful.
		* @param {TokenType} type
		*   Type (`' \t'`).
		* @param {number | undefined} [max=Infinity]
		*   Max (exclusive).
		* @returns {State}
		*   Start state.
		*/
		function factorySpace(effects, ok, type, max) {
			const limit = max ? max - 1 : Number.POSITIVE_INFINITY;
			let size = 0;
			return start;
			/** @type {State} */
			function start(code) {
				if (markdownSpace(code)) {
					effects.enter(type);
					return prefix(code);
				}
				return ok(code);
			}
			/** @type {State} */
			function prefix(code) {
				if (markdownSpace(code) && size++ < limit) {
					effects.consume(code);
					return prefix;
				}
				effects.exit(type);
				return ok(code);
			}
		}
		//#endregion
		//#region node_modules/micromark/lib/initialize/content.js
		/**
		* @import {
		*   InitialConstruct,
		*   Initializer,
		*   State,
		*   TokenizeContext,
		*   Token
		* } from 'micromark-util-types'
		*/
		/** @type {InitialConstruct} */
		const content$1 = { tokenize: initializeContent };
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Initializer}
		*   Content.
		*/
		function initializeContent(effects) {
			const contentStart = effects.attempt(this.parser.constructs.contentInitial, afterContentStartConstruct, paragraphInitial);
			/** @type {Token} */
			let previous;
			return contentStart;
			/** @type {State} */
			function afterContentStartConstruct(code) {
				if (code === null) {
					effects.consume(code);
					return;
				}
				effects.enter("lineEnding");
				effects.consume(code);
				effects.exit("lineEnding");
				return factorySpace(effects, contentStart, "linePrefix");
			}
			/** @type {State} */
			function paragraphInitial(code) {
				effects.enter("paragraph");
				return lineStart(code);
			}
			/** @type {State} */
			function lineStart(code) {
				const token = effects.enter("chunkText", {
					contentType: "text",
					previous
				});
				if (previous) previous.next = token;
				previous = token;
				return data(code);
			}
			/** @type {State} */
			function data(code) {
				if (code === null) {
					effects.exit("chunkText");
					effects.exit("paragraph");
					effects.consume(code);
					return;
				}
				if (markdownLineEnding(code)) {
					effects.consume(code);
					effects.exit("chunkText");
					return lineStart;
				}
				effects.consume(code);
				return data;
			}
		}
		//#endregion
		//#region node_modules/micromark/lib/initialize/document.js
		/**
		* @import {
		*   Construct,
		*   ContainerState,
		*   InitialConstruct,
		*   Initializer,
		*   Point,
		*   State,
		*   TokenizeContext,
		*   Tokenizer,
		*   Token
		* } from 'micromark-util-types'
		*/
		/**
		* @typedef {[Construct, ContainerState]} StackItem
		*   Construct and its state.
		*/
		/** @type {InitialConstruct} */
		const document$2 = { tokenize: initializeDocument };
		/** @type {Construct} */
		const containerConstruct = { tokenize: tokenizeContainer };
		/**
		* @this {TokenizeContext}
		*   Self.
		* @type {Initializer}
		*   Initializer.
		*/
		function initializeDocument(effects) {
			const self = this;
			/** @type {Array<StackItem>} */
			const stack = [];
			let continued = 0;
			/** @type {TokenizeContext | undefined} */
			let childFlow;
			/** @type {Token | undefined} */
			let childToken;
			/** @type {number} */
			let lineStartOffset;
			return start;
			/** @type {State} */
			function start(code) {
				if (continued < stack.length) {
					const item = stack[continued];
					self.containerState = item[1];
					return effects.attempt(item[0].continuation, documentContinue, checkNewContainers)(code);
				}
				return checkNewContainers(code);
			}
			/** @type {State} */
			function documentContinue(code) {
				continued++;
				if (self.containerState._closeFlow) {
					self.containerState._closeFlow = void 0;
					if (childFlow) closeFlow();
					const indexBeforeExits = self.events.length;
					let indexBeforeFlow = indexBeforeExits;
					/** @type {Point | undefined} */
					let point;
					while (indexBeforeFlow--) if (self.events[indexBeforeFlow][0] === "exit" && self.events[indexBeforeFlow][1].type === "chunkFlow") {
						point = self.events[indexBeforeFlow][1].end;
						break;
					}
					exitContainers(continued);
					let index = indexBeforeExits;
					while (index < self.events.length) {
						self.events[index][1].end = { ...point };
						index++;
					}
					splice(self.events, indexBeforeFlow + 1, 0, self.events.slice(indexBeforeExits));
					self.events.length = index;
					return checkNewContainers(code);
				}
				return start(code);
			}
			/** @type {State} */
			function checkNewContainers(code) {
				if (continued === stack.length) {
					if (!childFlow) return documentContinued(code);
					if (childFlow.currentConstruct && childFlow.currentConstruct.concrete) return flowStart(code);
					self.interrupt = Boolean(childFlow.currentConstruct && !childFlow._gfmTableDynamicInterruptHack);
				}
				self.containerState = {};
				return effects.check(containerConstruct, thereIsANewContainer, thereIsNoNewContainer)(code);
			}
			/** @type {State} */
			function thereIsANewContainer(code) {
				if (childFlow) closeFlow();
				exitContainers(continued);
				return documentContinued(code);
			}
			/** @type {State} */
			function thereIsNoNewContainer(code) {
				self.parser.lazy[self.now().line] = continued !== stack.length;
				lineStartOffset = self.now().offset;
				return flowStart(code);
			}
			/** @type {State} */
			function documentContinued(code) {
				self.containerState = {};
				return effects.attempt(containerConstruct, containerContinue, flowStart)(code);
			}
			/** @type {State} */
			function containerContinue(code) {
				continued++;
				stack.push([self.currentConstruct, self.containerState]);
				return documentContinued(code);
			}
			/** @type {State} */
			function flowStart(code) {
				if (code === null) {
					if (childFlow) closeFlow();
					exitContainers(0);
					effects.consume(code);
					return;
				}
				childFlow = childFlow || self.parser.flow(self.now());
				effects.enter("chunkFlow", {
					_tokenizer: childFlow,
					contentType: "flow",
					previous: childToken
				});
				return flowContinue(code);
			}
			/** @type {State} */
			function flowContinue(code) {
				if (code === null) {
					writeToChild(effects.exit("chunkFlow"), true);
					exitContainers(0);
					effects.consume(code);
					return;
				}
				if (markdownLineEnding(code)) {
					effects.consume(code);
					writeToChild(effects.exit("chunkFlow"));
					continued = 0;
					self.interrupt = void 0;
					return start;
				}
				effects.consume(code);
				return flowContinue;
			}
			/**
			* @param {Token} token
			*   Token.
			* @param {boolean | undefined} [endOfFile]
			*   Whether the token is at the end of the file (default: `false`).
			* @returns {undefined}
			*   Nothing.
			*/
			function writeToChild(token, endOfFile) {
				const stream = self.sliceStream(token);
				if (endOfFile) stream.push(null);
				token.previous = childToken;
				if (childToken) childToken.next = token;
				childToken = token;
				childFlow.defineSkip(token.start);
				childFlow.write(stream);
				if (self.parser.lazy[token.start.line]) {
					let index = childFlow.events.length;
					while (index--) if (childFlow.events[index][1].start.offset < lineStartOffset && (!childFlow.events[index][1].end || childFlow.events[index][1].end.offset > lineStartOffset)) return;
					const indexBeforeExits = self.events.length;
					let indexBeforeFlow = indexBeforeExits;
					/** @type {boolean | undefined} */
					let seen;
					/** @type {Point | undefined} */
					let point;
					while (indexBeforeFlow--) if (self.events[indexBeforeFlow][0] === "exit" && self.events[indexBeforeFlow][1].type === "chunkFlow") {
						if (seen) {
							point = self.events[indexBeforeFlow][1].end;
							break;
						}
						seen = true;
					}
					exitContainers(continued);
					index = indexBeforeExits;
					while (index < self.events.length) {
						self.events[index][1].end = { ...point };
						index++;
					}
					splice(self.events, indexBeforeFlow + 1, 0, self.events.slice(indexBeforeExits));
					self.events.length = index;
				}
			}
			/**
			* @param {number} size
			*   Size.
			* @returns {undefined}
			*   Nothing.
			*/
			function exitContainers(size) {
				let index = stack.length;
				while (index-- > size) {
					const entry = stack[index];
					self.containerState = entry[1];
					entry[0].exit.call(self, effects);
				}
				stack.length = size;
			}
			function closeFlow() {
				childFlow.write([null]);
				childToken = void 0;
				childFlow = void 0;
				self.containerState._closeFlow = void 0;
			}
		}
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*   Tokenizer.
		*/
		function tokenizeContainer(effects, ok, nok) {
			return factorySpace(effects, effects.attempt(this.parser.constructs.document, ok, nok), "linePrefix", this.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 4);
		}
		//#endregion
		//#region node_modules/micromark-util-classify-character/index.js
		/**
		* @import {Code} from 'micromark-util-types'
		*/
		/**
		* Classify whether a code represents whitespace, punctuation, or something
		* else.
		*
		* Used for attention (emphasis, strong), whose sequences can open or close
		* based on the class of surrounding characters.
		*
		* > 👉 **Note**: eof (`null`) is seen as whitespace.
		*
		* @param {Code} code
		*   Code.
		* @returns {typeof constants.characterGroupWhitespace | typeof constants.characterGroupPunctuation | undefined}
		*   Group.
		*/
		function classifyCharacter(code) {
			if (code === null || markdownLineEndingOrSpace(code) || unicodeWhitespace(code)) return 1;
			if (unicodePunctuation(code)) return 2;
		}
		//#endregion
		//#region node_modules/micromark-util-resolve-all/index.js
		/**
		* @import {Event, Resolver, TokenizeContext} from 'micromark-util-types'
		*/
		/**
		* Call all `resolveAll`s.
		*
		* @param {ReadonlyArray<{resolveAll?: Resolver | undefined}>} constructs
		*   List of constructs, optionally with `resolveAll`s.
		* @param {Array<Event>} events
		*   List of events.
		* @param {TokenizeContext} context
		*   Context used by `tokenize`.
		* @returns {Array<Event>}
		*   Changed events.
		*/
		function resolveAll(constructs, events, context) {
			/** @type {Array<Resolver>} */
			const called = [];
			let index = -1;
			while (++index < constructs.length) {
				const resolve = constructs[index].resolveAll;
				if (resolve && !called.includes(resolve)) {
					events = resolve(events, context);
					called.push(resolve);
				}
			}
			return events;
		}
		//#endregion
		//#region node_modules/micromark-core-commonmark/lib/attention.js
		/**
		* @import {
		*   Code,
		*   Construct,
		*   Event,
		*   Point,
		*   Resolver,
		*   State,
		*   TokenizeContext,
		*   Tokenizer,
		*   Token
		* } from 'micromark-util-types'
		*/
		/** @type {Construct} */
		const attention = {
			name: "attention",
			resolveAll: resolveAllAttention,
			tokenize: tokenizeAttention
		};
		/**
		* Take all events and resolve attention to emphasis or strong.
		*
		* @type {Resolver}
		*/
		function resolveAllAttention(events, context) {
			let index = -1;
			/** @type {number} */
			let open;
			/** @type {Token} */
			let group;
			/** @type {Token} */
			let text;
			/** @type {Token} */
			let openingSequence;
			/** @type {Token} */
			let closingSequence;
			/** @type {number} */
			let use;
			/** @type {Array<Event>} */
			let nextEvents;
			/** @type {number} */
			let offset;
			while (++index < events.length) if (events[index][0] === "enter" && events[index][1].type === "attentionSequence" && events[index][1]._close) {
				open = index;
				while (open--) if (events[open][0] === "exit" && events[open][1].type === "attentionSequence" && events[open][1]._open && context.sliceSerialize(events[open][1]).charCodeAt(0) === context.sliceSerialize(events[index][1]).charCodeAt(0)) {
					if ((events[open][1]._close || events[index][1]._open) && (events[index][1].end.offset - events[index][1].start.offset) % 3 && !((events[open][1].end.offset - events[open][1].start.offset + events[index][1].end.offset - events[index][1].start.offset) % 3)) continue;
					use = events[open][1].end.offset - events[open][1].start.offset > 1 && events[index][1].end.offset - events[index][1].start.offset > 1 ? 2 : 1;
					const start = { ...events[open][1].end };
					const end = { ...events[index][1].start };
					movePoint(start, -use);
					movePoint(end, use);
					openingSequence = {
						type: use > 1 ? "strongSequence" : "emphasisSequence",
						start,
						end: { ...events[open][1].end }
					};
					closingSequence = {
						type: use > 1 ? "strongSequence" : "emphasisSequence",
						start: { ...events[index][1].start },
						end
					};
					text = {
						type: use > 1 ? "strongText" : "emphasisText",
						start: { ...events[open][1].end },
						end: { ...events[index][1].start }
					};
					group = {
						type: use > 1 ? "strong" : "emphasis",
						start: { ...openingSequence.start },
						end: { ...closingSequence.end }
					};
					events[open][1].end = { ...openingSequence.start };
					events[index][1].start = { ...closingSequence.end };
					nextEvents = [];
					if (events[open][1].end.offset - events[open][1].start.offset) nextEvents = push(nextEvents, [[
						"enter",
						events[open][1],
						context
					], [
						"exit",
						events[open][1],
						context
					]]);
					nextEvents = push(nextEvents, [
						[
							"enter",
							group,
							context
						],
						[
							"enter",
							openingSequence,
							context
						],
						[
							"exit",
							openingSequence,
							context
						],
						[
							"enter",
							text,
							context
						]
					]);
					nextEvents = push(nextEvents, resolveAll(context.parser.constructs.insideSpan.null, events.slice(open + 1, index), context));
					nextEvents = push(nextEvents, [
						[
							"exit",
							text,
							context
						],
						[
							"enter",
							closingSequence,
							context
						],
						[
							"exit",
							closingSequence,
							context
						],
						[
							"exit",
							group,
							context
						]
					]);
					if (events[index][1].end.offset - events[index][1].start.offset) {
						offset = 2;
						nextEvents = push(nextEvents, [[
							"enter",
							events[index][1],
							context
						], [
							"exit",
							events[index][1],
							context
						]]);
					} else offset = 0;
					splice(events, open - 1, index - open + 3, nextEvents);
					index = open + nextEvents.length - offset - 2;
					break;
				}
			}
			index = -1;
			while (++index < events.length) if (events[index][1].type === "attentionSequence") events[index][1].type = "data";
			return events;
		}
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeAttention(effects, ok) {
			const attentionMarkers = this.parser.constructs.attentionMarkers.null;
			const previous = this.previous;
			const before = classifyCharacter(previous);
			/** @type {NonNullable<Code>} */
			let marker;
			return start;
			/**
			* Before a sequence.
			*
			* ```markdown
			* > | **
			*     ^
			* ```
			*
			* @type {State}
			*/
			function start(code) {
				marker = code;
				effects.enter("attentionSequence");
				return inside(code);
			}
			/**
			* In a sequence.
			*
			* ```markdown
			* > | **
			*     ^^
			* ```
			*
			* @type {State}
			*/
			function inside(code) {
				if (code === marker) {
					effects.consume(code);
					return inside;
				}
				const token = effects.exit("attentionSequence");
				const after = classifyCharacter(code);
				const open = !after || after === 2 && before || attentionMarkers.includes(code);
				const close = !before || before === 2 && after || attentionMarkers.includes(previous);
				token._open = Boolean(marker === 42 ? open : open && (before || !close));
				token._close = Boolean(marker === 42 ? close : close && (after || !open));
				return ok(code);
			}
		}
		/**
		* Move a point a bit.
		*
		* Note: `move` only works inside lines! It’s not possible to move past other
		* chunks (replacement characters, tabs, or line endings).
		*
		* @param {Point} point
		*   Point.
		* @param {number} offset
		*   Amount to move.
		* @returns {undefined}
		*   Nothing.
		*/
		function movePoint(point, offset) {
			point.column += offset;
			point.offset += offset;
			point._bufferIndex += offset;
		}
		//#endregion
		//#region node_modules/micromark-core-commonmark/lib/autolink.js
		/**
		* @import {
		*   Construct,
		*   State,
		*   TokenizeContext,
		*   Tokenizer
		* } from 'micromark-util-types'
		*/
		/** @type {Construct} */
		const autolink = {
			name: "autolink",
			tokenize: tokenizeAutolink
		};
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeAutolink(effects, ok, nok) {
			let size = 0;
			return start;
			/**
			* Start of an autolink.
			*
			* ```markdown
			* > | a<https://example.com>b
			*      ^
			* > | a<user@example.com>b
			*      ^
			* ```
			*
			* @type {State}
			*/
			function start(code) {
				effects.enter("autolink");
				effects.enter("autolinkMarker");
				effects.consume(code);
				effects.exit("autolinkMarker");
				effects.enter("autolinkProtocol");
				return open;
			}
			/**
			* After `<`, at protocol or atext.
			*
			* ```markdown
			* > | a<https://example.com>b
			*       ^
			* > | a<user@example.com>b
			*       ^
			* ```
			*
			* @type {State}
			*/
			function open(code) {
				if (asciiAlpha(code)) {
					effects.consume(code);
					return schemeOrEmailAtext;
				}
				if (code === 64) return nok(code);
				return emailAtext(code);
			}
			/**
			* At second byte of protocol or atext.
			*
			* ```markdown
			* > | a<https://example.com>b
			*        ^
			* > | a<user@example.com>b
			*        ^
			* ```
			*
			* @type {State}
			*/
			function schemeOrEmailAtext(code) {
				if (code === 43 || code === 45 || code === 46 || asciiAlphanumeric(code)) {
					size = 1;
					return schemeInsideOrEmailAtext(code);
				}
				return emailAtext(code);
			}
			/**
			* In ambiguous protocol or atext.
			*
			* ```markdown
			* > | a<https://example.com>b
			*        ^
			* > | a<user@example.com>b
			*        ^
			* ```
			*
			* @type {State}
			*/
			function schemeInsideOrEmailAtext(code) {
				if (code === 58) {
					effects.consume(code);
					size = 0;
					return urlInside;
				}
				if ((code === 43 || code === 45 || code === 46 || asciiAlphanumeric(code)) && size++ < 32) {
					effects.consume(code);
					return schemeInsideOrEmailAtext;
				}
				size = 0;
				return emailAtext(code);
			}
			/**
			* After protocol, in URL.
			*
			* ```markdown
			* > | a<https://example.com>b
			*             ^
			* ```
			*
			* @type {State}
			*/
			function urlInside(code) {
				if (code === 62) {
					effects.exit("autolinkProtocol");
					effects.enter("autolinkMarker");
					effects.consume(code);
					effects.exit("autolinkMarker");
					effects.exit("autolink");
					return ok;
				}
				if (code === null || code === 32 || code === 60 || asciiControl(code)) return nok(code);
				effects.consume(code);
				return urlInside;
			}
			/**
			* In email atext.
			*
			* ```markdown
			* > | a<user.name@example.com>b
			*              ^
			* ```
			*
			* @type {State}
			*/
			function emailAtext(code) {
				if (code === 64) {
					effects.consume(code);
					return emailAtSignOrDot;
				}
				if (asciiAtext(code)) {
					effects.consume(code);
					return emailAtext;
				}
				return nok(code);
			}
			/**
			* In label, after at-sign or dot.
			*
			* ```markdown
			* > | a<user.name@example.com>b
			*                 ^       ^
			* ```
			*
			* @type {State}
			*/
			function emailAtSignOrDot(code) {
				return asciiAlphanumeric(code) ? emailLabel(code) : nok(code);
			}
			/**
			* In label, where `.` and `>` are allowed.
			*
			* ```markdown
			* > | a<user.name@example.com>b
			*                   ^
			* ```
			*
			* @type {State}
			*/
			function emailLabel(code) {
				if (code === 46) {
					effects.consume(code);
					size = 0;
					return emailAtSignOrDot;
				}
				if (code === 62) {
					effects.exit("autolinkProtocol").type = "autolinkEmail";
					effects.enter("autolinkMarker");
					effects.consume(code);
					effects.exit("autolinkMarker");
					effects.exit("autolink");
					return ok;
				}
				return emailValue(code);
			}
			/**
			* In label, where `.` and `>` are *not* allowed.
			*
			* Though, this is also used in `emailLabel` to parse other values.
			*
			* ```markdown
			* > | a<user.name@ex-ample.com>b
			*                    ^
			* ```
			*
			* @type {State}
			*/
			function emailValue(code) {
				if ((code === 45 || asciiAlphanumeric(code)) && size++ < 63) {
					const next = code === 45 ? emailValue : emailLabel;
					effects.consume(code);
					return next;
				}
				return nok(code);
			}
		}
		//#endregion
		//#region node_modules/micromark-core-commonmark/lib/blank-line.js
		/**
		* @import {
		*   Construct,
		*   State,
		*   TokenizeContext,
		*   Tokenizer
		* } from 'micromark-util-types'
		*/
		/** @type {Construct} */
		const blankLine = {
			partial: true,
			tokenize: tokenizeBlankLine
		};
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeBlankLine(effects, ok, nok) {
			return start;
			/**
			* Start of blank line.
			*
			* > 👉 **Note**: `␠` represents a space character.
			*
			* ```markdown
			* > | ␠␠␊
			*     ^
			* > | ␊
			*     ^
			* ```
			*
			* @type {State}
			*/
			function start(code) {
				return markdownSpace(code) ? factorySpace(effects, after, "linePrefix")(code) : after(code);
			}
			/**
			* At eof/eol, after optional whitespace.
			*
			* > 👉 **Note**: `␠` represents a space character.
			*
			* ```markdown
			* > | ␠␠␊
			*       ^
			* > | ␊
			*     ^
			* ```
			*
			* @type {State}
			*/
			function after(code) {
				return code === null || markdownLineEnding(code) ? ok(code) : nok(code);
			}
		}
		//#endregion
		//#region node_modules/micromark-core-commonmark/lib/block-quote.js
		/**
		* @import {
		*   Construct,
		*   Exiter,
		*   State,
		*   TokenizeContext,
		*   Tokenizer
		* } from 'micromark-util-types'
		*/
		/** @type {Construct} */
		const blockQuote = {
			continuation: { tokenize: tokenizeBlockQuoteContinuation },
			exit: exit$1,
			name: "blockQuote",
			tokenize: tokenizeBlockQuoteStart
		};
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeBlockQuoteStart(effects, ok, nok) {
			const self = this;
			return start;
			/**
			* Start of block quote.
			*
			* ```markdown
			* > | > a
			*     ^
			* ```
			*
			* @type {State}
			*/
			function start(code) {
				if (code === 62) {
					const state = self.containerState;
					if (!state.open) {
						effects.enter("blockQuote", { _container: true });
						state.open = true;
					}
					effects.enter("blockQuotePrefix");
					effects.enter("blockQuoteMarker");
					effects.consume(code);
					effects.exit("blockQuoteMarker");
					return after;
				}
				return nok(code);
			}
			/**
			* After `>`, before optional whitespace.
			*
			* ```markdown
			* > | > a
			*      ^
			* ```
			*
			* @type {State}
			*/
			function after(code) {
				if (markdownSpace(code)) {
					effects.enter("blockQuotePrefixWhitespace");
					effects.consume(code);
					effects.exit("blockQuotePrefixWhitespace");
					effects.exit("blockQuotePrefix");
					return ok;
				}
				effects.exit("blockQuotePrefix");
				return ok(code);
			}
		}
		/**
		* Start of block quote continuation.
		*
		* ```markdown
		*   | > a
		* > | > b
		*     ^
		* ```
		*
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeBlockQuoteContinuation(effects, ok, nok) {
			const self = this;
			return contStart;
			/**
			* Start of block quote continuation.
			*
			* Also used to parse the first block quote opening.
			*
			* ```markdown
			*   | > a
			* > | > b
			*     ^
			* ```
			*
			* @type {State}
			*/
			function contStart(code) {
				if (markdownSpace(code)) return factorySpace(effects, contBefore, "linePrefix", self.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 4)(code);
				return contBefore(code);
			}
			/**
			* At `>`, after optional whitespace.
			*
			* Also used to parse the first block quote opening.
			*
			* ```markdown
			*   | > a
			* > | > b
			*     ^
			* ```
			*
			* @type {State}
			*/
			function contBefore(code) {
				return effects.attempt(blockQuote, ok, nok)(code);
			}
		}
		/** @type {Exiter} */
		function exit$1(effects) {
			effects.exit("blockQuote");
		}
		//#endregion
		//#region node_modules/micromark-core-commonmark/lib/character-escape.js
		/**
		* @import {
		*   Construct,
		*   State,
		*   TokenizeContext,
		*   Tokenizer
		* } from 'micromark-util-types'
		*/
		/** @type {Construct} */
		const characterEscape = {
			name: "characterEscape",
			tokenize: tokenizeCharacterEscape
		};
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeCharacterEscape(effects, ok, nok) {
			return start;
			/**
			* Start of character escape.
			*
			* ```markdown
			* > | a\*b
			*      ^
			* ```
			*
			* @type {State}
			*/
			function start(code) {
				effects.enter("characterEscape");
				effects.enter("escapeMarker");
				effects.consume(code);
				effects.exit("escapeMarker");
				return inside;
			}
			/**
			* After `\`, at punctuation.
			*
			* ```markdown
			* > | a\*b
			*       ^
			* ```
			*
			* @type {State}
			*/
			function inside(code) {
				if (asciiPunctuation(code)) {
					effects.enter("characterEscapeValue");
					effects.consume(code);
					effects.exit("characterEscapeValue");
					effects.exit("characterEscape");
					return ok;
				}
				return nok(code);
			}
		}
		//#endregion
		//#region node_modules/micromark-core-commonmark/lib/character-reference.js
		/**
		* @import {
		*   Code,
		*   Construct,
		*   State,
		*   TokenizeContext,
		*   Tokenizer
		* } from 'micromark-util-types'
		*/
		/** @type {Construct} */
		const characterReference = {
			name: "characterReference",
			tokenize: tokenizeCharacterReference
		};
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeCharacterReference(effects, ok, nok) {
			const self = this;
			let size = 0;
			/** @type {number} */
			let max;
			/** @type {(code: Code) => boolean} */
			let test;
			return start;
			/**
			* Start of character reference.
			*
			* ```markdown
			* > | a&amp;b
			*      ^
			* > | a&#123;b
			*      ^
			* > | a&#x9;b
			*      ^
			* ```
			*
			* @type {State}
			*/
			function start(code) {
				effects.enter("characterReference");
				effects.enter("characterReferenceMarker");
				effects.consume(code);
				effects.exit("characterReferenceMarker");
				return open;
			}
			/**
			* After `&`, at `#` for numeric references or alphanumeric for named
			* references.
			*
			* ```markdown
			* > | a&amp;b
			*       ^
			* > | a&#123;b
			*       ^
			* > | a&#x9;b
			*       ^
			* ```
			*
			* @type {State}
			*/
			function open(code) {
				if (code === 35) {
					effects.enter("characterReferenceMarkerNumeric");
					effects.consume(code);
					effects.exit("characterReferenceMarkerNumeric");
					return numeric;
				}
				effects.enter("characterReferenceValue");
				max = 31;
				test = asciiAlphanumeric;
				return value(code);
			}
			/**
			* After `#`, at `x` for hexadecimals or digit for decimals.
			*
			* ```markdown
			* > | a&#123;b
			*        ^
			* > | a&#x9;b
			*        ^
			* ```
			*
			* @type {State}
			*/
			function numeric(code) {
				if (code === 88 || code === 120) {
					effects.enter("characterReferenceMarkerHexadecimal");
					effects.consume(code);
					effects.exit("characterReferenceMarkerHexadecimal");
					effects.enter("characterReferenceValue");
					max = 6;
					test = asciiHexDigit;
					return value;
				}
				effects.enter("characterReferenceValue");
				max = 7;
				test = asciiDigit;
				return value(code);
			}
			/**
			* After markers (`&#x`, `&#`, or `&`), in value, before `;`.
			*
			* The character reference kind defines what and how many characters are
			* allowed.
			*
			* ```markdown
			* > | a&amp;b
			*       ^^^
			* > | a&#123;b
			*        ^^^
			* > | a&#x9;b
			*         ^
			* ```
			*
			* @type {State}
			*/
			function value(code) {
				if (code === 59 && size) {
					const token = effects.exit("characterReferenceValue");
					if (test === asciiAlphanumeric && !decodeNamedCharacterReference(self.sliceSerialize(token))) return nok(code);
					effects.enter("characterReferenceMarker");
					effects.consume(code);
					effects.exit("characterReferenceMarker");
					effects.exit("characterReference");
					return ok;
				}
				if (test(code) && size++ < max) {
					effects.consume(code);
					return value;
				}
				return nok(code);
			}
		}
		//#endregion
		//#region node_modules/micromark-core-commonmark/lib/code-fenced.js
		/**
		* @import {
		*   Code,
		*   Construct,
		*   State,
		*   TokenizeContext,
		*   Tokenizer
		* } from 'micromark-util-types'
		*/
		/** @type {Construct} */
		const nonLazyContinuation = {
			partial: true,
			tokenize: tokenizeNonLazyContinuation
		};
		/** @type {Construct} */
		const codeFenced = {
			concrete: true,
			name: "codeFenced",
			tokenize: tokenizeCodeFenced
		};
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeCodeFenced(effects, ok, nok) {
			const self = this;
			/** @type {Construct} */
			const closeStart = {
				partial: true,
				tokenize: tokenizeCloseStart
			};
			let initialPrefix = 0;
			let sizeOpen = 0;
			/** @type {NonNullable<Code>} */
			let marker;
			return start;
			/**
			* Start of code.
			*
			* ```markdown
			* > | ~~~js
			*     ^
			*   | alert(1)
			*   | ~~~
			* ```
			*
			* @type {State}
			*/
			function start(code) {
				return beforeSequenceOpen(code);
			}
			/**
			* In opening fence, after prefix, at sequence.
			*
			* ```markdown
			* > | ~~~js
			*     ^
			*   | alert(1)
			*   | ~~~
			* ```
			*
			* @type {State}
			*/
			function beforeSequenceOpen(code) {
				const tail = self.events[self.events.length - 1];
				initialPrefix = tail && tail[1].type === "linePrefix" ? tail[2].sliceSerialize(tail[1], true).length : 0;
				marker = code;
				effects.enter("codeFenced");
				effects.enter("codeFencedFence");
				effects.enter("codeFencedFenceSequence");
				return sequenceOpen(code);
			}
			/**
			* In opening fence sequence.
			*
			* ```markdown
			* > | ~~~js
			*      ^
			*   | alert(1)
			*   | ~~~
			* ```
			*
			* @type {State}
			*/
			function sequenceOpen(code) {
				if (code === marker) {
					sizeOpen++;
					effects.consume(code);
					return sequenceOpen;
				}
				if (sizeOpen < 3) return nok(code);
				effects.exit("codeFencedFenceSequence");
				return markdownSpace(code) ? factorySpace(effects, infoBefore, "whitespace")(code) : infoBefore(code);
			}
			/**
			* In opening fence, after the sequence (and optional whitespace), before info.
			*
			* ```markdown
			* > | ~~~js
			*        ^
			*   | alert(1)
			*   | ~~~
			* ```
			*
			* @type {State}
			*/
			function infoBefore(code) {
				if (code === null || markdownLineEnding(code)) {
					effects.exit("codeFencedFence");
					return self.interrupt ? ok(code) : effects.check(nonLazyContinuation, atNonLazyBreak, after)(code);
				}
				effects.enter("codeFencedFenceInfo");
				effects.enter("chunkString", { contentType: "string" });
				return info(code);
			}
			/**
			* In info.
			*
			* ```markdown
			* > | ~~~js
			*        ^
			*   | alert(1)
			*   | ~~~
			* ```
			*
			* @type {State}
			*/
			function info(code) {
				if (code === null || markdownLineEnding(code)) {
					effects.exit("chunkString");
					effects.exit("codeFencedFenceInfo");
					return infoBefore(code);
				}
				if (markdownSpace(code)) {
					effects.exit("chunkString");
					effects.exit("codeFencedFenceInfo");
					return factorySpace(effects, metaBefore, "whitespace")(code);
				}
				if (code === 96 && code === marker) return nok(code);
				effects.consume(code);
				return info;
			}
			/**
			* In opening fence, after info and whitespace, before meta.
			*
			* ```markdown
			* > | ~~~js eval
			*           ^
			*   | alert(1)
			*   | ~~~
			* ```
			*
			* @type {State}
			*/
			function metaBefore(code) {
				if (code === null || markdownLineEnding(code)) return infoBefore(code);
				effects.enter("codeFencedFenceMeta");
				effects.enter("chunkString", { contentType: "string" });
				return meta(code);
			}
			/**
			* In meta.
			*
			* ```markdown
			* > | ~~~js eval
			*           ^
			*   | alert(1)
			*   | ~~~
			* ```
			*
			* @type {State}
			*/
			function meta(code) {
				if (code === null || markdownLineEnding(code)) {
					effects.exit("chunkString");
					effects.exit("codeFencedFenceMeta");
					return infoBefore(code);
				}
				if (code === 96 && code === marker) return nok(code);
				effects.consume(code);
				return meta;
			}
			/**
			* At eol/eof in code, before a non-lazy closing fence or content.
			*
			* ```markdown
			* > | ~~~js
			*          ^
			* > | alert(1)
			*             ^
			*   | ~~~
			* ```
			*
			* @type {State}
			*/
			function atNonLazyBreak(code) {
				return effects.attempt(closeStart, after, contentBefore)(code);
			}
			/**
			* Before code content, not a closing fence, at eol.
			*
			* ```markdown
			*   | ~~~js
			* > | alert(1)
			*             ^
			*   | ~~~
			* ```
			*
			* @type {State}
			*/
			function contentBefore(code) {
				effects.enter("lineEnding");
				effects.consume(code);
				effects.exit("lineEnding");
				return contentStart;
			}
			/**
			* Before code content, not a closing fence.
			*
			* ```markdown
			*   | ~~~js
			* > | alert(1)
			*     ^
			*   | ~~~
			* ```
			*
			* @type {State}
			*/
			function contentStart(code) {
				return initialPrefix > 0 && markdownSpace(code) ? factorySpace(effects, beforeContentChunk, "linePrefix", initialPrefix + 1)(code) : beforeContentChunk(code);
			}
			/**
			* Before code content, after optional prefix.
			*
			* ```markdown
			*   | ~~~js
			* > | alert(1)
			*     ^
			*   | ~~~
			* ```
			*
			* @type {State}
			*/
			function beforeContentChunk(code) {
				if (code === null || markdownLineEnding(code)) return effects.check(nonLazyContinuation, atNonLazyBreak, after)(code);
				effects.enter("codeFlowValue");
				return contentChunk(code);
			}
			/**
			* In code content.
			*
			* ```markdown
			*   | ~~~js
			* > | alert(1)
			*     ^^^^^^^^
			*   | ~~~
			* ```
			*
			* @type {State}
			*/
			function contentChunk(code) {
				if (code === null || markdownLineEnding(code)) {
					effects.exit("codeFlowValue");
					return beforeContentChunk(code);
				}
				effects.consume(code);
				return contentChunk;
			}
			/**
			* After code.
			*
			* ```markdown
			*   | ~~~js
			*   | alert(1)
			* > | ~~~
			*        ^
			* ```
			*
			* @type {State}
			*/
			function after(code) {
				effects.exit("codeFenced");
				return ok(code);
			}
			/**
			* @this {TokenizeContext}
			*   Context.
			* @type {Tokenizer}
			*/
			function tokenizeCloseStart(effects, ok, nok) {
				let size = 0;
				return startBefore;
				/**
				*
				*
				* @type {State}
				*/
				function startBefore(code) {
					effects.enter("lineEnding");
					effects.consume(code);
					effects.exit("lineEnding");
					return start;
				}
				/**
				* Before closing fence, at optional whitespace.
				*
				* ```markdown
				*   | ~~~js
				*   | alert(1)
				* > | ~~~
				*     ^
				* ```
				*
				* @type {State}
				*/
				function start(code) {
					effects.enter("codeFencedFence");
					return markdownSpace(code) ? factorySpace(effects, beforeSequenceClose, "linePrefix", self.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 4)(code) : beforeSequenceClose(code);
				}
				/**
				* In closing fence, after optional whitespace, at sequence.
				*
				* ```markdown
				*   | ~~~js
				*   | alert(1)
				* > | ~~~
				*     ^
				* ```
				*
				* @type {State}
				*/
				function beforeSequenceClose(code) {
					if (code === marker) {
						effects.enter("codeFencedFenceSequence");
						return sequenceClose(code);
					}
					return nok(code);
				}
				/**
				* In closing fence sequence.
				*
				* ```markdown
				*   | ~~~js
				*   | alert(1)
				* > | ~~~
				*     ^
				* ```
				*
				* @type {State}
				*/
				function sequenceClose(code) {
					if (code === marker) {
						size++;
						effects.consume(code);
						return sequenceClose;
					}
					if (size >= sizeOpen) {
						effects.exit("codeFencedFenceSequence");
						return markdownSpace(code) ? factorySpace(effects, sequenceCloseAfter, "whitespace")(code) : sequenceCloseAfter(code);
					}
					return nok(code);
				}
				/**
				* After closing fence sequence, after optional whitespace.
				*
				* ```markdown
				*   | ~~~js
				*   | alert(1)
				* > | ~~~
				*        ^
				* ```
				*
				* @type {State}
				*/
				function sequenceCloseAfter(code) {
					if (code === null || markdownLineEnding(code)) {
						effects.exit("codeFencedFence");
						return ok(code);
					}
					return nok(code);
				}
			}
		}
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeNonLazyContinuation(effects, ok, nok) {
			const self = this;
			return start;
			/**
			*
			*
			* @type {State}
			*/
			function start(code) {
				if (code === null) return nok(code);
				effects.enter("lineEnding");
				effects.consume(code);
				effects.exit("lineEnding");
				return lineStart;
			}
			/**
			*
			*
			* @type {State}
			*/
			function lineStart(code) {
				return self.parser.lazy[self.now().line] ? nok(code) : ok(code);
			}
		}
		//#endregion
		//#region node_modules/micromark-core-commonmark/lib/code-indented.js
		/**
		* @import {
		*   Construct,
		*   State,
		*   TokenizeContext,
		*   Tokenizer
		* } from 'micromark-util-types'
		*/
		/** @type {Construct} */
		const codeIndented = {
			name: "codeIndented",
			tokenize: tokenizeCodeIndented
		};
		/** @type {Construct} */
		const furtherStart = {
			partial: true,
			tokenize: tokenizeFurtherStart
		};
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeCodeIndented(effects, ok, nok) {
			const self = this;
			return start;
			/**
			* Start of code (indented).
			*
			* > **Parsing note**: it is not needed to check if this first line is a
			* > filled line (that it has a non-whitespace character), because blank lines
			* > are parsed already, so we never run into that.
			*
			* ```markdown
			* > |     aaa
			*     ^
			* ```
			*
			* @type {State}
			*/
			function start(code) {
				effects.enter("codeIndented");
				return factorySpace(effects, afterPrefix, "linePrefix", 5)(code);
			}
			/**
			* At start, after 1 or 4 spaces.
			*
			* ```markdown
			* > |     aaa
			*         ^
			* ```
			*
			* @type {State}
			*/
			function afterPrefix(code) {
				const tail = self.events[self.events.length - 1];
				return tail && tail[1].type === "linePrefix" && tail[2].sliceSerialize(tail[1], true).length >= 4 ? atBreak(code) : nok(code);
			}
			/**
			* At a break.
			*
			* ```markdown
			* > |     aaa
			*         ^  ^
			* ```
			*
			* @type {State}
			*/
			function atBreak(code) {
				if (code === null) return after(code);
				if (markdownLineEnding(code)) return effects.attempt(furtherStart, atBreak, after)(code);
				effects.enter("codeFlowValue");
				return inside(code);
			}
			/**
			* In code content.
			*
			* ```markdown
			* > |     aaa
			*         ^^^^
			* ```
			*
			* @type {State}
			*/
			function inside(code) {
				if (code === null || markdownLineEnding(code)) {
					effects.exit("codeFlowValue");
					return atBreak(code);
				}
				effects.consume(code);
				return inside;
			}
			/** @type {State} */
			function after(code) {
				effects.exit("codeIndented");
				return ok(code);
			}
		}
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeFurtherStart(effects, ok, nok) {
			const self = this;
			return furtherStart;
			/**
			* At eol, trying to parse another indent.
			*
			* ```markdown
			* > |     aaa
			*            ^
			*   |     bbb
			* ```
			*
			* @type {State}
			*/
			function furtherStart(code) {
				if (self.parser.lazy[self.now().line]) return nok(code);
				if (markdownLineEnding(code)) {
					effects.enter("lineEnding");
					effects.consume(code);
					effects.exit("lineEnding");
					return furtherStart;
				}
				return factorySpace(effects, afterPrefix, "linePrefix", 5)(code);
			}
			/**
			* At start, after 1 or 4 spaces.
			*
			* ```markdown
			* > |     aaa
			*         ^
			* ```
			*
			* @type {State}
			*/
			function afterPrefix(code) {
				const tail = self.events[self.events.length - 1];
				return tail && tail[1].type === "linePrefix" && tail[2].sliceSerialize(tail[1], true).length >= 4 ? ok(code) : markdownLineEnding(code) ? furtherStart(code) : nok(code);
			}
		}
		//#endregion
		//#region node_modules/micromark-core-commonmark/lib/code-text.js
		/**
		* @import {
		*   Construct,
		*   Previous,
		*   Resolver,
		*   State,
		*   TokenizeContext,
		*   Tokenizer,
		*   Token
		* } from 'micromark-util-types'
		*/
		/** @type {Construct} */
		const codeText = {
			name: "codeText",
			previous: previous$1,
			resolve: resolveCodeText,
			tokenize: tokenizeCodeText
		};
		/** @type {Resolver} */
		function resolveCodeText(events) {
			let tailExitIndex = events.length - 4;
			let headEnterIndex = 3;
			/** @type {number} */
			let index;
			/** @type {number | undefined} */
			let enter;
			if ((events[headEnterIndex][1].type === "lineEnding" || events[headEnterIndex][1].type === "space") && (events[tailExitIndex][1].type === "lineEnding" || events[tailExitIndex][1].type === "space")) {
				index = headEnterIndex;
				while (++index < tailExitIndex) if (events[index][1].type === "codeTextData") {
					events[headEnterIndex][1].type = "codeTextPadding";
					events[tailExitIndex][1].type = "codeTextPadding";
					headEnterIndex += 2;
					tailExitIndex -= 2;
					break;
				}
			}
			index = headEnterIndex - 1;
			tailExitIndex++;
			while (++index <= tailExitIndex) if (enter === void 0) {
				if (index !== tailExitIndex && events[index][1].type !== "lineEnding") enter = index;
			} else if (index === tailExitIndex || events[index][1].type === "lineEnding") {
				events[enter][1].type = "codeTextData";
				if (index !== enter + 2) {
					events[enter][1].end = events[index - 1][1].end;
					events.splice(enter + 2, index - enter - 2);
					tailExitIndex -= index - enter - 2;
					index = enter + 2;
				}
				enter = void 0;
			}
			return events;
		}
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Previous}
		*/
		function previous$1(code) {
			return code !== 96 || this.events[this.events.length - 1][1].type === "characterEscape";
		}
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeCodeText(effects, ok, nok) {
			let sizeOpen = 0;
			/** @type {number} */
			let size;
			/** @type {Token} */
			let token;
			return start;
			/**
			* Start of code (text).
			*
			* ```markdown
			* > | `a`
			*     ^
			* > | \`a`
			*      ^
			* ```
			*
			* @type {State}
			*/
			function start(code) {
				effects.enter("codeText");
				effects.enter("codeTextSequence");
				return sequenceOpen(code);
			}
			/**
			* In opening sequence.
			*
			* ```markdown
			* > | `a`
			*     ^
			* ```
			*
			* @type {State}
			*/
			function sequenceOpen(code) {
				if (code === 96) {
					effects.consume(code);
					sizeOpen++;
					return sequenceOpen;
				}
				effects.exit("codeTextSequence");
				return between(code);
			}
			/**
			* Between something and something else.
			*
			* ```markdown
			* > | `a`
			*      ^^
			* ```
			*
			* @type {State}
			*/
			function between(code) {
				if (code === null) return nok(code);
				if (code === 32) {
					effects.enter("space");
					effects.consume(code);
					effects.exit("space");
					return between;
				}
				if (code === 96) {
					token = effects.enter("codeTextSequence");
					size = 0;
					return sequenceClose(code);
				}
				if (markdownLineEnding(code)) {
					effects.enter("lineEnding");
					effects.consume(code);
					effects.exit("lineEnding");
					return between;
				}
				effects.enter("codeTextData");
				return data(code);
			}
			/**
			* In data.
			*
			* ```markdown
			* > | `a`
			*      ^
			* ```
			*
			* @type {State}
			*/
			function data(code) {
				if (code === null || code === 32 || code === 96 || markdownLineEnding(code)) {
					effects.exit("codeTextData");
					return between(code);
				}
				effects.consume(code);
				return data;
			}
			/**
			* In closing sequence.
			*
			* ```markdown
			* > | `a`
			*       ^
			* ```
			*
			* @type {State}
			*/
			function sequenceClose(code) {
				if (code === 96) {
					effects.consume(code);
					size++;
					return sequenceClose;
				}
				if (size === sizeOpen) {
					effects.exit("codeTextSequence");
					effects.exit("codeText");
					return ok(code);
				}
				token.type = "codeTextData";
				return data(code);
			}
		}
		//#endregion
		//#region node_modules/micromark-util-subtokenize/lib/splice-buffer.js
		/**
		* Some of the internal operations of micromark do lots of editing
		* operations on very large arrays. This runs into problems with two
		* properties of most circa-2020 JavaScript interpreters:
		*
		*  - Array-length modifications at the high end of an array (push/pop) are
		*    expected to be common and are implemented in (amortized) time
		*    proportional to the number of elements added or removed, whereas
		*    other operations (shift/unshift and splice) are much less efficient.
		*  - Function arguments are passed on the stack, so adding tens of thousands
		*    of elements to an array with `arr.push(...newElements)` will frequently
		*    cause stack overflows. (see <https://stackoverflow.com/questions/22123769/rangeerror-maximum-call-stack-size-exceeded-why>)
		*
		* SpliceBuffers are an implementation of gap buffers, which are a
		* generalization of the "queue made of two stacks" idea. The splice buffer
		* maintains a cursor, and moving the cursor has cost proportional to the
		* distance the cursor moves, but inserting, deleting, or splicing in
		* new information at the cursor is as efficient as the push/pop operation.
		* This allows for an efficient sequence of splices (or pushes, pops, shifts,
		* or unshifts) as long such edits happen at the same part of the array or
		* generally sweep through the array from the beginning to the end.
		*
		* The interface for splice buffers also supports large numbers of inputs by
		* passing a single array argument rather passing multiple arguments on the
		* function call stack.
		*
		* @template T
		*   Item type.
		*/
		var SpliceBuffer = class {
			/**
			* @param {ReadonlyArray<T> | null | undefined} [initial]
			*   Initial items (optional).
			* @returns
			*   Splice buffer.
			*/
			constructor(initial) {
				/** @type {Array<T>} */
				this.left = initial ? [...initial] : [];
				/** @type {Array<T>} */
				this.right = [];
			}
			/**
			* Array access;
			* does not move the cursor.
			*
			* @param {number} index
			*   Index.
			* @return {T}
			*   Item.
			*/
			get(index) {
				if (index < 0 || index >= this.left.length + this.right.length) throw new RangeError("Cannot access index `" + index + "` in a splice buffer of size `" + (this.left.length + this.right.length) + "`");
				if (index < this.left.length) return this.left[index];
				return this.right[this.right.length - index + this.left.length - 1];
			}
			/**
			* The length of the splice buffer, one greater than the largest index in the
			* array.
			*/
			get length() {
				return this.left.length + this.right.length;
			}
			/**
			* Remove and return `list[0]`;
			* moves the cursor to `0`.
			*
			* @returns {T | undefined}
			*   Item, optional.
			*/
			shift() {
				this.setCursor(0);
				return this.right.pop();
			}
			/**
			* Slice the buffer to get an array;
			* does not move the cursor.
			*
			* @param {number} start
			*   Start.
			* @param {number | null | undefined} [end]
			*   End (optional).
			* @returns {Array<T>}
			*   Array of items.
			*/
			slice(start, end) {
				/** @type {number} */
				const stop = end === null || end === void 0 ? Number.POSITIVE_INFINITY : end;
				if (stop < this.left.length) return this.left.slice(start, stop);
				if (start > this.left.length) return this.right.slice(this.right.length - stop + this.left.length, this.right.length - start + this.left.length).reverse();
				return this.left.slice(start).concat(this.right.slice(this.right.length - stop + this.left.length).reverse());
			}
			/**
			* Mimics the behavior of Array.prototype.splice() except for the change of
			* interface necessary to avoid segfaults when patching in very large arrays.
			*
			* This operation moves cursor is moved to `start` and results in the cursor
			* placed after any inserted items.
			*
			* @param {number} start
			*   Start;
			*   zero-based index at which to start changing the array;
			*   negative numbers count backwards from the end of the array and values
			*   that are out-of bounds are clamped to the appropriate end of the array.
			* @param {number | null | undefined} [deleteCount=0]
			*   Delete count (default: `0`);
			*   maximum number of elements to delete, starting from start.
			* @param {Array<T> | null | undefined} [items=[]]
			*   Items to include in place of the deleted items (default: `[]`).
			* @return {Array<T>}
			*   Any removed items.
			*/
			splice(start, deleteCount, items) {
				/** @type {number} */
				const count = deleteCount || 0;
				this.setCursor(Math.trunc(start));
				const removed = this.right.splice(this.right.length - count, Number.POSITIVE_INFINITY);
				if (items) chunkedPush(this.left, items);
				return removed.reverse();
			}
			/**
			* Remove and return the highest-numbered item in the array, so
			* `list[list.length - 1]`;
			* Moves the cursor to `length`.
			*
			* @returns {T | undefined}
			*   Item, optional.
			*/
			pop() {
				this.setCursor(Number.POSITIVE_INFINITY);
				return this.left.pop();
			}
			/**
			* Inserts a single item to the high-numbered side of the array;
			* moves the cursor to `length`.
			*
			* @param {T} item
			*   Item.
			* @returns {undefined}
			*   Nothing.
			*/
			push(item) {
				this.setCursor(Number.POSITIVE_INFINITY);
				this.left.push(item);
			}
			/**
			* Inserts many items to the high-numbered side of the array.
			* Moves the cursor to `length`.
			*
			* @param {Array<T>} items
			*   Items.
			* @returns {undefined}
			*   Nothing.
			*/
			pushMany(items) {
				this.setCursor(Number.POSITIVE_INFINITY);
				chunkedPush(this.left, items);
			}
			/**
			* Inserts a single item to the low-numbered side of the array;
			* Moves the cursor to `0`.
			*
			* @param {T} item
			*   Item.
			* @returns {undefined}
			*   Nothing.
			*/
			unshift(item) {
				this.setCursor(0);
				this.right.push(item);
			}
			/**
			* Inserts many items to the low-numbered side of the array;
			* moves the cursor to `0`.
			*
			* @param {Array<T>} items
			*   Items.
			* @returns {undefined}
			*   Nothing.
			*/
			unshiftMany(items) {
				this.setCursor(0);
				chunkedPush(this.right, items.reverse());
			}
			/**
			* Move the cursor to a specific position in the array. Requires
			* time proportional to the distance moved.
			*
			* If `n < 0`, the cursor will end up at the beginning.
			* If `n > length`, the cursor will end up at the end.
			*
			* @param {number} n
			*   Position.
			* @return {undefined}
			*   Nothing.
			*/
			setCursor(n) {
				if (n === this.left.length || n > this.left.length && this.right.length === 0 || n < 0 && this.left.length === 0) return;
				if (n < this.left.length) {
					const removed = this.left.splice(n, Number.POSITIVE_INFINITY);
					chunkedPush(this.right, removed.reverse());
				} else {
					const removed = this.right.splice(this.left.length + this.right.length - n, Number.POSITIVE_INFINITY);
					chunkedPush(this.left, removed.reverse());
				}
			}
		};
		/**
		* Avoid stack overflow by pushing items onto the stack in segments
		*
		* @template T
		*   Item type.
		* @param {Array<T>} list
		*   List to inject into.
		* @param {ReadonlyArray<T>} right
		*   Items to inject.
		* @return {undefined}
		*   Nothing.
		*/
		function chunkedPush(list, right) {
			/** @type {number} */
			let chunkStart = 0;
			if (right.length < 1e4) list.push(...right);
			else while (chunkStart < right.length) {
				list.push(...right.slice(chunkStart, chunkStart + 1e4));
				chunkStart += 1e4;
			}
		}
		//#endregion
		//#region node_modules/micromark-util-subtokenize/index.js
		/**
		* @import {Chunk, Event, Token} from 'micromark-util-types'
		*/
		/**
		* Tokenize subcontent.
		*
		* @param {Array<Event>} eventsArray
		*   List of events.
		* @returns {boolean}
		*   Whether subtokens were found.
		*/
		function subtokenize(eventsArray) {
			/** @type {Record<string, number>} */
			const jumps = {};
			let index = -1;
			/** @type {Event} */
			let event;
			/** @type {number | undefined} */
			let lineIndex;
			/** @type {number} */
			let otherIndex;
			/** @type {Event} */
			let otherEvent;
			/** @type {Array<Event>} */
			let parameters;
			/** @type {Array<Event>} */
			let subevents;
			/** @type {boolean | undefined} */
			let more;
			const events = new SpliceBuffer(eventsArray);
			while (++index < events.length) {
				while (index in jumps) index = jumps[index];
				event = events.get(index);
				if (index && event[1].type === "chunkFlow" && events.get(index - 1)[1].type === "listItemPrefix") {
					subevents = event[1]._tokenizer.events;
					otherIndex = 0;
					if (otherIndex < subevents.length && subevents[otherIndex][1].type === "lineEndingBlank") otherIndex += 2;
					if (otherIndex < subevents.length && subevents[otherIndex][1].type === "content") while (++otherIndex < subevents.length) {
						if (subevents[otherIndex][1].type === "content") break;
						if (subevents[otherIndex][1].type === "chunkText") {
							subevents[otherIndex][1]._isInFirstContentOfListItem = true;
							otherIndex++;
						}
					}
				}
				if (event[0] === "enter") {
					if (event[1].contentType) {
						Object.assign(jumps, subcontent(events, index));
						index = jumps[index];
						more = true;
					}
				} else if (event[1]._container) {
					otherIndex = index;
					lineIndex = void 0;
					while (otherIndex--) {
						otherEvent = events.get(otherIndex);
						if (otherEvent[1].type === "lineEnding" || otherEvent[1].type === "lineEndingBlank") {
							if (otherEvent[0] === "enter") {
								if (lineIndex) events.get(lineIndex)[1].type = "lineEndingBlank";
								otherEvent[1].type = "lineEnding";
								lineIndex = otherIndex;
							}
						} else if (otherEvent[1].type === "linePrefix" || otherEvent[1].type === "listItemIndent") {} else break;
					}
					if (lineIndex) {
						event[1].end = { ...events.get(lineIndex)[1].start };
						parameters = events.slice(lineIndex, index);
						parameters.unshift(event);
						events.splice(lineIndex, index - lineIndex + 1, parameters);
					}
				}
			}
			splice(eventsArray, 0, Number.POSITIVE_INFINITY, events.slice(0));
			return !more;
		}
		/**
		* Tokenize embedded tokens.
		*
		* @param {SpliceBuffer<Event>} events
		*   Events.
		* @param {number} eventIndex
		*   Index.
		* @returns {Record<string, number>}
		*   Gaps.
		*/
		function subcontent(events, eventIndex) {
			const token = events.get(eventIndex)[1];
			const context = events.get(eventIndex)[2];
			let startPosition = eventIndex - 1;
			/** @type {Array<number>} */
			const startPositions = [];
			let tokenizer = token._tokenizer;
			if (!tokenizer) {
				tokenizer = context.parser[token.contentType](token.start);
				if (token._contentTypeTextTrailing) tokenizer._contentTypeTextTrailing = true;
			}
			const childEvents = tokenizer.events;
			/** @type {Array<[number, number]>} */
			const jumps = [];
			/** @type {Record<string, number>} */
			const gaps = {};
			/** @type {Array<Chunk>} */
			let stream;
			/** @type {Token | undefined} */
			let previous;
			let index = -1;
			/** @type {Token | undefined} */
			let current = token;
			let adjust = 0;
			let start = 0;
			const breaks = [start];
			while (current) {
				while (events.get(++startPosition)[1] !== current);
				startPositions.push(startPosition);
				if (!current._tokenizer) {
					stream = context.sliceStream(current);
					if (!current.next) stream.push(null);
					if (previous) tokenizer.defineSkip(current.start);
					if (current._isInFirstContentOfListItem) tokenizer._gfmTasklistFirstContentOfListItem = true;
					tokenizer.write(stream);
					if (current._isInFirstContentOfListItem) tokenizer._gfmTasklistFirstContentOfListItem = void 0;
				}
				previous = current;
				current = current.next;
			}
			current = token;
			while (++index < childEvents.length) if (childEvents[index][0] === "exit" && childEvents[index - 1][0] === "enter" && childEvents[index][1].type === childEvents[index - 1][1].type && childEvents[index][1].start.line !== childEvents[index][1].end.line) {
				start = index + 1;
				breaks.push(start);
				current._tokenizer = void 0;
				current.previous = void 0;
				current = current.next;
			}
			tokenizer.events = [];
			if (current) {
				current._tokenizer = void 0;
				current.previous = void 0;
			} else breaks.pop();
			index = breaks.length;
			while (index--) {
				const slice = childEvents.slice(breaks[index], breaks[index + 1]);
				const start = startPositions.pop();
				jumps.push([start, start + slice.length - 1]);
				events.splice(start, 2, slice);
			}
			jumps.reverse();
			index = -1;
			while (++index < jumps.length) {
				gaps[adjust + jumps[index][0]] = adjust + jumps[index][1];
				adjust += jumps[index][1] - jumps[index][0] - 1;
			}
			return gaps;
		}
		//#endregion
		//#region node_modules/micromark-core-commonmark/lib/content.js
		/**
		* @import {
		*   Construct,
		*   Resolver,
		*   State,
		*   TokenizeContext,
		*   Tokenizer,
		*   Token
		* } from 'micromark-util-types'
		*/
		/**
		* No name because it must not be turned off.
		* @type {Construct}
		*/
		const content = {
			resolve: resolveContent,
			tokenize: tokenizeContent
		};
		/** @type {Construct} */
		const continuationConstruct = {
			partial: true,
			tokenize: tokenizeContinuation
		};
		/**
		* Content is transparent: it’s parsed right now. That way, definitions are also
		* parsed right now: before text in paragraphs (specifically, media) are parsed.
		*
		* @type {Resolver}
		*/
		function resolveContent(events) {
			subtokenize(events);
			return events;
		}
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeContent(effects, ok) {
			/** @type {Token | undefined} */
			let previous;
			return chunkStart;
			/**
			* Before a content chunk.
			*
			* ```markdown
			* > | abc
			*     ^
			* ```
			*
			* @type {State}
			*/
			function chunkStart(code) {
				effects.enter("content");
				previous = effects.enter("chunkContent", { contentType: "content" });
				return chunkInside(code);
			}
			/**
			* In a content chunk.
			*
			* ```markdown
			* > | abc
			*     ^^^
			* ```
			*
			* @type {State}
			*/
			function chunkInside(code) {
				if (code === null) return contentEnd(code);
				if (markdownLineEnding(code)) return effects.check(continuationConstruct, contentContinue, contentEnd)(code);
				effects.consume(code);
				return chunkInside;
			}
			/**
			*
			*
			* @type {State}
			*/
			function contentEnd(code) {
				effects.exit("chunkContent");
				effects.exit("content");
				return ok(code);
			}
			/**
			*
			*
			* @type {State}
			*/
			function contentContinue(code) {
				effects.consume(code);
				effects.exit("chunkContent");
				previous.next = effects.enter("chunkContent", {
					contentType: "content",
					previous
				});
				previous = previous.next;
				return chunkInside;
			}
		}
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeContinuation(effects, ok, nok) {
			const self = this;
			return startLookahead;
			/**
			*
			*
			* @type {State}
			*/
			function startLookahead(code) {
				effects.exit("chunkContent");
				effects.enter("lineEnding");
				effects.consume(code);
				effects.exit("lineEnding");
				return factorySpace(effects, prefixed, "linePrefix");
			}
			/**
			*
			*
			* @type {State}
			*/
			function prefixed(code) {
				if (code === null || markdownLineEnding(code)) return nok(code);
				const tail = self.events[self.events.length - 1];
				if (!self.parser.constructs.disable.null.includes("codeIndented") && tail && tail[1].type === "linePrefix" && tail[2].sliceSerialize(tail[1], true).length >= 4) return ok(code);
				return effects.interrupt(self.parser.constructs.flow, nok, ok)(code);
			}
		}
		//#endregion
		//#region node_modules/micromark-factory-destination/index.js
		/**
		* @import {Effects, State, TokenType} from 'micromark-util-types'
		*/
		/**
		* Parse destinations.
		*
		* ###### Examples
		*
		* ```markdown
		* <a>
		* <a\>b>
		* <a b>
		* <a)>
		* a
		* a\)b
		* a(b)c
		* a(b)
		* ```
		*
		* @param {Effects} effects
		*   Context.
		* @param {State} ok
		*   State switched to when successful.
		* @param {State} nok
		*   State switched to when unsuccessful.
		* @param {TokenType} type
		*   Type for whole (`<a>` or `b`).
		* @param {TokenType} literalType
		*   Type when enclosed (`<a>`).
		* @param {TokenType} literalMarkerType
		*   Type for enclosing (`<` and `>`).
		* @param {TokenType} rawType
		*   Type when not enclosed (`b`).
		* @param {TokenType} stringType
		*   Type for the value (`a` or `b`).
		* @param {number | undefined} [max=Infinity]
		*   Depth of nested parens (inclusive).
		* @returns {State}
		*   Start state.
		*/
		function factoryDestination(effects, ok, nok, type, literalType, literalMarkerType, rawType, stringType, max) {
			const limit = max || Number.POSITIVE_INFINITY;
			let balance = 0;
			return start;
			/**
			* Start of destination.
			*
			* ```markdown
			* > | <aa>
			*     ^
			* > | aa
			*     ^
			* ```
			*
			* @type {State}
			*/
			function start(code) {
				if (code === 60) {
					effects.enter(type);
					effects.enter(literalType);
					effects.enter(literalMarkerType);
					effects.consume(code);
					effects.exit(literalMarkerType);
					return enclosedBefore;
				}
				if (code === null || code === 32 || code === 41 || asciiControl(code)) return nok(code);
				effects.enter(type);
				effects.enter(rawType);
				effects.enter(stringType);
				effects.enter("chunkString", { contentType: "string" });
				return raw(code);
			}
			/**
			* After `<`, at an enclosed destination.
			*
			* ```markdown
			* > | <aa>
			*      ^
			* ```
			*
			* @type {State}
			*/
			function enclosedBefore(code) {
				if (code === 62) {
					effects.enter(literalMarkerType);
					effects.consume(code);
					effects.exit(literalMarkerType);
					effects.exit(literalType);
					effects.exit(type);
					return ok;
				}
				effects.enter(stringType);
				effects.enter("chunkString", { contentType: "string" });
				return enclosed(code);
			}
			/**
			* In enclosed destination.
			*
			* ```markdown
			* > | <aa>
			*      ^
			* ```
			*
			* @type {State}
			*/
			function enclosed(code) {
				if (code === 62) {
					effects.exit("chunkString");
					effects.exit(stringType);
					return enclosedBefore(code);
				}
				if (code === null || code === 60 || markdownLineEnding(code)) return nok(code);
				effects.consume(code);
				return code === 92 ? enclosedEscape : enclosed;
			}
			/**
			* After `\`, at a special character.
			*
			* ```markdown
			* > | <a\*a>
			*        ^
			* ```
			*
			* @type {State}
			*/
			function enclosedEscape(code) {
				if (code === 60 || code === 62 || code === 92) {
					effects.consume(code);
					return enclosed;
				}
				return enclosed(code);
			}
			/**
			* In raw destination.
			*
			* ```markdown
			* > | aa
			*     ^
			* ```
			*
			* @type {State}
			*/
			function raw(code) {
				if (!balance && (code === null || code === 41 || markdownLineEndingOrSpace(code))) {
					effects.exit("chunkString");
					effects.exit(stringType);
					effects.exit(rawType);
					effects.exit(type);
					return ok(code);
				}
				if (balance < limit && code === 40) {
					effects.consume(code);
					balance++;
					return raw;
				}
				if (code === 41) {
					effects.consume(code);
					balance--;
					return raw;
				}
				if (code === null || code === 32 || code === 40 || asciiControl(code)) return nok(code);
				effects.consume(code);
				return code === 92 ? rawEscape : raw;
			}
			/**
			* After `\`, at special character.
			*
			* ```markdown
			* > | a\*a
			*       ^
			* ```
			*
			* @type {State}
			*/
			function rawEscape(code) {
				if (code === 40 || code === 41 || code === 92) {
					effects.consume(code);
					return raw;
				}
				return raw(code);
			}
		}
		//#endregion
		//#region node_modules/micromark-factory-label/index.js
		/**
		* @import {
		*   Effects,
		*   State,
		*   TokenizeContext,
		*   TokenType
		* } from 'micromark-util-types'
		*/
		/**
		* Parse labels.
		*
		* > 👉 **Note**: labels in markdown are capped at 999 characters in the string.
		*
		* ###### Examples
		*
		* ```markdown
		* [a]
		* [a
		* b]
		* [a\]b]
		* ```
		*
		* @this {TokenizeContext}
		*   Tokenize context.
		* @param {Effects} effects
		*   Context.
		* @param {State} ok
		*   State switched to when successful.
		* @param {State} nok
		*   State switched to when unsuccessful.
		* @param {TokenType} type
		*   Type of the whole label (`[a]`).
		* @param {TokenType} markerType
		*   Type for the markers (`[` and `]`).
		* @param {TokenType} stringType
		*   Type for the identifier (`a`).
		* @returns {State}
		*   Start state.
		*/
		function factoryLabel(effects, ok, nok, type, markerType, stringType) {
			const self = this;
			let size = 0;
			/** @type {boolean} */
			let seen;
			return start;
			/**
			* Start of label.
			*
			* ```markdown
			* > | [a]
			*     ^
			* ```
			*
			* @type {State}
			*/
			function start(code) {
				effects.enter(type);
				effects.enter(markerType);
				effects.consume(code);
				effects.exit(markerType);
				effects.enter(stringType);
				return atBreak;
			}
			/**
			* In label, at something, before something else.
			*
			* ```markdown
			* > | [a]
			*      ^
			* ```
			*
			* @type {State}
			*/
			function atBreak(code) {
				if (size > 999 || code === null || code === 91 || code === 93 && !seen || 
				/* c8 ignore next 3 */
				code === 94 && !size && "_hiddenFootnoteSupport" in self.parser.constructs) return nok(code);
				if (code === 93) {
					effects.exit(stringType);
					effects.enter(markerType);
					effects.consume(code);
					effects.exit(markerType);
					effects.exit(type);
					return ok;
				}
				if (markdownLineEnding(code)) {
					effects.enter("lineEnding");
					effects.consume(code);
					effects.exit("lineEnding");
					return atBreak;
				}
				effects.enter("chunkString", { contentType: "string" });
				return labelInside(code);
			}
			/**
			* In label, in text.
			*
			* ```markdown
			* > | [a]
			*      ^
			* ```
			*
			* @type {State}
			*/
			function labelInside(code) {
				if (code === null || code === 91 || code === 93 || markdownLineEnding(code) || size++ > 999) {
					effects.exit("chunkString");
					return atBreak(code);
				}
				effects.consume(code);
				if (!seen) seen = !markdownSpace(code);
				return code === 92 ? labelEscape : labelInside;
			}
			/**
			* After `\`, at a special character.
			*
			* ```markdown
			* > | [a\*a]
			*        ^
			* ```
			*
			* @type {State}
			*/
			function labelEscape(code) {
				if (code === 91 || code === 92 || code === 93) {
					effects.consume(code);
					size++;
					return labelInside;
				}
				return labelInside(code);
			}
		}
		//#endregion
		//#region node_modules/micromark-factory-title/index.js
		/**
		* @import {
		*   Code,
		*   Effects,
		*   State,
		*   TokenType
		* } from 'micromark-util-types'
		*/
		/**
		* Parse titles.
		*
		* ###### Examples
		*
		* ```markdown
		* "a"
		* 'b'
		* (c)
		* "a
		* b"
		* 'a
		*     b'
		* (a\)b)
		* ```
		*
		* @param {Effects} effects
		*   Context.
		* @param {State} ok
		*   State switched to when successful.
		* @param {State} nok
		*   State switched to when unsuccessful.
		* @param {TokenType} type
		*   Type of the whole title (`"a"`, `'b'`, `(c)`).
		* @param {TokenType} markerType
		*   Type for the markers (`"`, `'`, `(`, and `)`).
		* @param {TokenType} stringType
		*   Type for the value (`a`).
		* @returns {State}
		*   Start state.
		*/
		function factoryTitle(effects, ok, nok, type, markerType, stringType) {
			/** @type {NonNullable<Code>} */
			let marker;
			return start;
			/**
			* Start of title.
			*
			* ```markdown
			* > | "a"
			*     ^
			* ```
			*
			* @type {State}
			*/
			function start(code) {
				if (code === 34 || code === 39 || code === 40) {
					effects.enter(type);
					effects.enter(markerType);
					effects.consume(code);
					effects.exit(markerType);
					marker = code === 40 ? 41 : code;
					return begin;
				}
				return nok(code);
			}
			/**
			* After opening marker.
			*
			* This is also used at the closing marker.
			*
			* ```markdown
			* > | "a"
			*      ^
			* ```
			*
			* @type {State}
			*/
			function begin(code) {
				if (code === marker) {
					effects.enter(markerType);
					effects.consume(code);
					effects.exit(markerType);
					effects.exit(type);
					return ok;
				}
				effects.enter(stringType);
				return atBreak(code);
			}
			/**
			* At something, before something else.
			*
			* ```markdown
			* > | "a"
			*      ^
			* ```
			*
			* @type {State}
			*/
			function atBreak(code) {
				if (code === marker) {
					effects.exit(stringType);
					return begin(marker);
				}
				if (code === null) return nok(code);
				if (markdownLineEnding(code)) {
					effects.enter("lineEnding");
					effects.consume(code);
					effects.exit("lineEnding");
					return factorySpace(effects, atBreak, "linePrefix");
				}
				effects.enter("chunkString", { contentType: "string" });
				return inside(code);
			}
			/**
			*
			*
			* @type {State}
			*/
			function inside(code) {
				if (code === marker || code === null || markdownLineEnding(code)) {
					effects.exit("chunkString");
					return atBreak(code);
				}
				effects.consume(code);
				return code === 92 ? escape : inside;
			}
			/**
			* After `\`, at a special character.
			*
			* ```markdown
			* > | "a\*b"
			*      ^
			* ```
			*
			* @type {State}
			*/
			function escape(code) {
				if (code === marker || code === 92) {
					effects.consume(code);
					return inside;
				}
				return inside(code);
			}
		}
		//#endregion
		//#region node_modules/micromark-factory-whitespace/index.js
		/**
		* @import {Effects, State} from 'micromark-util-types'
		*/
		/**
		* Parse spaces and tabs.
		*
		* There is no `nok` parameter:
		*
		* *   line endings or spaces in markdown are often optional, in which case this
		*     factory can be used and `ok` will be switched to whether spaces were found
		*     or not
		* *   one line ending or space can be detected with
		*     `markdownLineEndingOrSpace(code)` right before using `factoryWhitespace`
		*
		* @param {Effects} effects
		*   Context.
		* @param {State} ok
		*   State switched to when successful.
		* @returns {State}
		*   Start state.
		*/
		function factoryWhitespace(effects, ok) {
			/** @type {boolean} */
			let seen;
			return start;
			/** @type {State} */
			function start(code) {
				if (markdownLineEnding(code)) {
					effects.enter("lineEnding");
					effects.consume(code);
					effects.exit("lineEnding");
					seen = true;
					return start;
				}
				if (markdownSpace(code)) return factorySpace(effects, start, seen ? "linePrefix" : "lineSuffix")(code);
				return ok(code);
			}
		}
		//#endregion
		//#region node_modules/micromark-core-commonmark/lib/definition.js
		/**
		* @import {
		*   Construct,
		*   State,
		*   TokenizeContext,
		*   Tokenizer
		* } from 'micromark-util-types'
		*/
		/** @type {Construct} */
		const definition$1 = {
			name: "definition",
			tokenize: tokenizeDefinition
		};
		/** @type {Construct} */
		const titleBefore = {
			partial: true,
			tokenize: tokenizeTitleBefore
		};
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeDefinition(effects, ok, nok) {
			const self = this;
			/** @type {string} */
			let identifier;
			return start;
			/**
			* At start of a definition.
			*
			* ```markdown
			* > | [a]: b "c"
			*     ^
			* ```
			*
			* @type {State}
			*/
			function start(code) {
				effects.enter("definition");
				return before(code);
			}
			/**
			* After optional whitespace, at `[`.
			*
			* ```markdown
			* > | [a]: b "c"
			*     ^
			* ```
			*
			* @type {State}
			*/
			function before(code) {
				return factoryLabel.call(self, effects, labelAfter, nok, "definitionLabel", "definitionLabelMarker", "definitionLabelString")(code);
			}
			/**
			* After label.
			*
			* ```markdown
			* > | [a]: b "c"
			*        ^
			* ```
			*
			* @type {State}
			*/
			function labelAfter(code) {
				identifier = normalizeIdentifier(self.sliceSerialize(self.events[self.events.length - 1][1]).slice(1, -1));
				if (code === 58) {
					effects.enter("definitionMarker");
					effects.consume(code);
					effects.exit("definitionMarker");
					return markerAfter;
				}
				return nok(code);
			}
			/**
			* After marker.
			*
			* ```markdown
			* > | [a]: b "c"
			*         ^
			* ```
			*
			* @type {State}
			*/
			function markerAfter(code) {
				return markdownLineEndingOrSpace(code) ? factoryWhitespace(effects, destinationBefore)(code) : destinationBefore(code);
			}
			/**
			* Before destination.
			*
			* ```markdown
			* > | [a]: b "c"
			*          ^
			* ```
			*
			* @type {State}
			*/
			function destinationBefore(code) {
				return factoryDestination(effects, destinationAfter, nok, "definitionDestination", "definitionDestinationLiteral", "definitionDestinationLiteralMarker", "definitionDestinationRaw", "definitionDestinationString")(code);
			}
			/**
			* After destination.
			*
			* ```markdown
			* > | [a]: b "c"
			*           ^
			* ```
			*
			* @type {State}
			*/
			function destinationAfter(code) {
				return effects.attempt(titleBefore, after, after)(code);
			}
			/**
			* After definition.
			*
			* ```markdown
			* > | [a]: b
			*           ^
			* > | [a]: b "c"
			*               ^
			* ```
			*
			* @type {State}
			*/
			function after(code) {
				return markdownSpace(code) ? factorySpace(effects, afterWhitespace, "whitespace")(code) : afterWhitespace(code);
			}
			/**
			* After definition, after optional whitespace.
			*
			* ```markdown
			* > | [a]: b
			*           ^
			* > | [a]: b "c"
			*               ^
			* ```
			*
			* @type {State}
			*/
			function afterWhitespace(code) {
				if (code === null || markdownLineEnding(code)) {
					effects.exit("definition");
					self.parser.defined.push(identifier);
					return ok(code);
				}
				return nok(code);
			}
		}
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeTitleBefore(effects, ok, nok) {
			return titleBefore;
			/**
			* After destination, at whitespace.
			*
			* ```markdown
			* > | [a]: b
			*           ^
			* > | [a]: b "c"
			*           ^
			* ```
			*
			* @type {State}
			*/
			function titleBefore(code) {
				return markdownLineEndingOrSpace(code) ? factoryWhitespace(effects, beforeMarker)(code) : nok(code);
			}
			/**
			* At title.
			*
			* ```markdown
			*   | [a]: b
			* > | "c"
			*     ^
			* ```
			*
			* @type {State}
			*/
			function beforeMarker(code) {
				return factoryTitle(effects, titleAfter, nok, "definitionTitle", "definitionTitleMarker", "definitionTitleString")(code);
			}
			/**
			* After title.
			*
			* ```markdown
			* > | [a]: b "c"
			*               ^
			* ```
			*
			* @type {State}
			*/
			function titleAfter(code) {
				return markdownSpace(code) ? factorySpace(effects, titleAfterOptionalWhitespace, "whitespace")(code) : titleAfterOptionalWhitespace(code);
			}
			/**
			* After title, after optional whitespace.
			*
			* ```markdown
			* > | [a]: b "c"
			*               ^
			* ```
			*
			* @type {State}
			*/
			function titleAfterOptionalWhitespace(code) {
				return code === null || markdownLineEnding(code) ? ok(code) : nok(code);
			}
		}
		//#endregion
		//#region node_modules/micromark-core-commonmark/lib/hard-break-escape.js
		/**
		* @import {
		*   Construct,
		*   State,
		*   TokenizeContext,
		*   Tokenizer
		* } from 'micromark-util-types'
		*/
		/** @type {Construct} */
		const hardBreakEscape = {
			name: "hardBreakEscape",
			tokenize: tokenizeHardBreakEscape
		};
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeHardBreakEscape(effects, ok, nok) {
			return start;
			/**
			* Start of a hard break (escape).
			*
			* ```markdown
			* > | a\
			*      ^
			*   | b
			* ```
			*
			* @type {State}
			*/
			function start(code) {
				effects.enter("hardBreakEscape");
				effects.consume(code);
				return after;
			}
			/**
			* After `\`, at eol.
			*
			* ```markdown
			* > | a\
			*       ^
			*   | b
			* ```
			*
			*  @type {State}
			*/
			function after(code) {
				if (markdownLineEnding(code)) {
					effects.exit("hardBreakEscape");
					return ok(code);
				}
				return nok(code);
			}
		}
		//#endregion
		//#region node_modules/micromark-core-commonmark/lib/heading-atx.js
		/**
		* @import {
		*   Construct,
		*   Resolver,
		*   State,
		*   TokenizeContext,
		*   Tokenizer,
		*   Token
		* } from 'micromark-util-types'
		*/
		/** @type {Construct} */
		const headingAtx = {
			name: "headingAtx",
			resolve: resolveHeadingAtx,
			tokenize: tokenizeHeadingAtx
		};
		/** @type {Resolver} */
		function resolveHeadingAtx(events, context) {
			let contentEnd = events.length - 2;
			let contentStart = 3;
			/** @type {Token} */
			let content;
			/** @type {Token} */
			let text;
			if (events[contentStart][1].type === "whitespace") contentStart += 2;
			if (contentEnd - 2 > contentStart && events[contentEnd][1].type === "whitespace") contentEnd -= 2;
			if (events[contentEnd][1].type === "atxHeadingSequence" && (contentStart === contentEnd - 1 || contentEnd - 4 > contentStart && events[contentEnd - 2][1].type === "whitespace")) contentEnd -= contentStart + 1 === contentEnd ? 2 : 4;
			if (contentEnd > contentStart) {
				content = {
					type: "atxHeadingText",
					start: events[contentStart][1].start,
					end: events[contentEnd][1].end
				};
				text = {
					type: "chunkText",
					start: events[contentStart][1].start,
					end: events[contentEnd][1].end,
					contentType: "text"
				};
				splice(events, contentStart, contentEnd - contentStart + 1, [
					[
						"enter",
						content,
						context
					],
					[
						"enter",
						text,
						context
					],
					[
						"exit",
						text,
						context
					],
					[
						"exit",
						content,
						context
					]
				]);
			}
			return events;
		}
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeHeadingAtx(effects, ok, nok) {
			let size = 0;
			return start;
			/**
			* Start of a heading (atx).
			*
			* ```markdown
			* > | ## aa
			*     ^
			* ```
			*
			* @type {State}
			*/
			function start(code) {
				effects.enter("atxHeading");
				return before(code);
			}
			/**
			* After optional whitespace, at `#`.
			*
			* ```markdown
			* > | ## aa
			*     ^
			* ```
			*
			* @type {State}
			*/
			function before(code) {
				effects.enter("atxHeadingSequence");
				return sequenceOpen(code);
			}
			/**
			* In opening sequence.
			*
			* ```markdown
			* > | ## aa
			*     ^
			* ```
			*
			* @type {State}
			*/
			function sequenceOpen(code) {
				if (code === 35 && size++ < 6) {
					effects.consume(code);
					return sequenceOpen;
				}
				if (code === null || markdownLineEndingOrSpace(code)) {
					effects.exit("atxHeadingSequence");
					return atBreak(code);
				}
				return nok(code);
			}
			/**
			* After something, before something else.
			*
			* ```markdown
			* > | ## aa
			*       ^
			* ```
			*
			* @type {State}
			*/
			function atBreak(code) {
				if (code === 35) {
					effects.enter("atxHeadingSequence");
					return sequenceFurther(code);
				}
				if (code === null || markdownLineEnding(code)) {
					effects.exit("atxHeading");
					return ok(code);
				}
				if (markdownSpace(code)) return factorySpace(effects, atBreak, "whitespace")(code);
				effects.enter("atxHeadingText");
				return data(code);
			}
			/**
			* In further sequence (after whitespace).
			*
			* Could be normal “visible” hashes in the heading or a final sequence.
			*
			* ```markdown
			* > | ## aa ##
			*           ^
			* ```
			*
			* @type {State}
			*/
			function sequenceFurther(code) {
				if (code === 35) {
					effects.consume(code);
					return sequenceFurther;
				}
				effects.exit("atxHeadingSequence");
				return atBreak(code);
			}
			/**
			* In text.
			*
			* ```markdown
			* > | ## aa
			*        ^
			* ```
			*
			* @type {State}
			*/
			function data(code) {
				if (code === null || code === 35 || markdownLineEndingOrSpace(code)) {
					effects.exit("atxHeadingText");
					return atBreak(code);
				}
				effects.consume(code);
				return data;
			}
		}
		//#endregion
		//#region node_modules/micromark-util-html-tag-name/index.js
		/**
		* List of lowercase HTML “block” tag names.
		*
		* The list, when parsing HTML (flow), results in more relaxed rules (condition
		* 6).
		* Because they are known blocks, the HTML-like syntax doesn’t have to be
		* strictly parsed.
		* For tag names not in this list, a more strict algorithm (condition 7) is used
		* to detect whether the HTML-like syntax is seen as HTML (flow) or not.
		*
		* This is copied from:
		* <https://spec.commonmark.org/0.30/#html-blocks>.
		*
		* > 👉 **Note**: `search` was added in `CommonMark@0.31`.
		*/
		const htmlBlockNames = [
			"address",
			"article",
			"aside",
			"base",
			"basefont",
			"blockquote",
			"body",
			"caption",
			"center",
			"col",
			"colgroup",
			"dd",
			"details",
			"dialog",
			"dir",
			"div",
			"dl",
			"dt",
			"fieldset",
			"figcaption",
			"figure",
			"footer",
			"form",
			"frame",
			"frameset",
			"h1",
			"h2",
			"h3",
			"h4",
			"h5",
			"h6",
			"head",
			"header",
			"hr",
			"html",
			"iframe",
			"legend",
			"li",
			"link",
			"main",
			"menu",
			"menuitem",
			"nav",
			"noframes",
			"ol",
			"optgroup",
			"option",
			"p",
			"param",
			"search",
			"section",
			"summary",
			"table",
			"tbody",
			"td",
			"tfoot",
			"th",
			"thead",
			"title",
			"tr",
			"track",
			"ul"
		];
		/**
		* List of lowercase HTML “raw” tag names.
		*
		* The list, when parsing HTML (flow), results in HTML that can include lines
		* without exiting, until a closing tag also in this list is found (condition
		* 1).
		*
		* This module is copied from:
		* <https://spec.commonmark.org/0.30/#html-blocks>.
		*
		* > 👉 **Note**: `textarea` was added in `CommonMark@0.30`.
		*/
		const htmlRawNames = [
			"pre",
			"script",
			"style",
			"textarea"
		];
		//#endregion
		//#region node_modules/micromark-core-commonmark/lib/html-flow.js
		/**
		* @import {
		*   Code,
		*   Construct,
		*   Resolver,
		*   State,
		*   TokenizeContext,
		*   Tokenizer
		* } from 'micromark-util-types'
		*/
		/** @type {Construct} */
		const htmlFlow = {
			concrete: true,
			name: "htmlFlow",
			resolveTo: resolveToHtmlFlow,
			tokenize: tokenizeHtmlFlow
		};
		/** @type {Construct} */
		const blankLineBefore = {
			partial: true,
			tokenize: tokenizeBlankLineBefore
		};
		const nonLazyContinuationStart = {
			partial: true,
			tokenize: tokenizeNonLazyContinuationStart
		};
		/** @type {Resolver} */
		function resolveToHtmlFlow(events) {
			let index = events.length;
			while (index--) if (events[index][0] === "enter" && events[index][1].type === "htmlFlow") break;
			if (index > 1 && events[index - 2][1].type === "linePrefix") {
				events[index][1].start = events[index - 2][1].start;
				events[index + 1][1].start = events[index - 2][1].start;
				events.splice(index - 2, 2);
			}
			return events;
		}
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeHtmlFlow(effects, ok, nok) {
			const self = this;
			/** @type {number} */
			let marker;
			/** @type {boolean} */
			let closingTag;
			/** @type {string} */
			let buffer;
			/** @type {number} */
			let index;
			/** @type {Code} */
			let markerB;
			return start;
			/**
			* Start of HTML (flow).
			*
			* ```markdown
			* > | <x />
			*     ^
			* ```
			*
			* @type {State}
			*/
			function start(code) {
				return before(code);
			}
			/**
			* At `<`, after optional whitespace.
			*
			* ```markdown
			* > | <x />
			*     ^
			* ```
			*
			* @type {State}
			*/
			function before(code) {
				effects.enter("htmlFlow");
				effects.enter("htmlFlowData");
				effects.consume(code);
				return open;
			}
			/**
			* After `<`, at tag name or other stuff.
			*
			* ```markdown
			* > | <x />
			*      ^
			* > | <!doctype>
			*      ^
			* > | <!--xxx-->
			*      ^
			* ```
			*
			* @type {State}
			*/
			function open(code) {
				if (code === 33) {
					effects.consume(code);
					return declarationOpen;
				}
				if (code === 47) {
					effects.consume(code);
					closingTag = true;
					return tagCloseStart;
				}
				if (code === 63) {
					effects.consume(code);
					marker = 3;
					return self.interrupt ? ok : continuationDeclarationInside;
				}
				if (asciiAlpha(code)) {
					effects.consume(code);
					buffer = String.fromCharCode(code);
					return tagName;
				}
				return nok(code);
			}
			/**
			* After `<!`, at declaration, comment, or CDATA.
			*
			* ```markdown
			* > | <!doctype>
			*       ^
			* > | <!--xxx-->
			*       ^
			* > | <![CDATA[>&<]]>
			*       ^
			* ```
			*
			* @type {State}
			*/
			function declarationOpen(code) {
				if (code === 45) {
					effects.consume(code);
					marker = 2;
					return commentOpenInside;
				}
				if (code === 91) {
					effects.consume(code);
					marker = 5;
					index = 0;
					return cdataOpenInside;
				}
				if (asciiAlpha(code)) {
					effects.consume(code);
					marker = 4;
					return self.interrupt ? ok : continuationDeclarationInside;
				}
				return nok(code);
			}
			/**
			* After `<!-`, inside a comment, at another `-`.
			*
			* ```markdown
			* > | <!--xxx-->
			*        ^
			* ```
			*
			* @type {State}
			*/
			function commentOpenInside(code) {
				if (code === 45) {
					effects.consume(code);
					return self.interrupt ? ok : continuationDeclarationInside;
				}
				return nok(code);
			}
			/**
			* After `<![`, inside CDATA, expecting `CDATA[`.
			*
			* ```markdown
			* > | <![CDATA[>&<]]>
			*        ^^^^^^
			* ```
			*
			* @type {State}
			*/
			function cdataOpenInside(code) {
				if (code === "CDATA[".charCodeAt(index++)) {
					effects.consume(code);
					if (index === 6) return self.interrupt ? ok : continuation;
					return cdataOpenInside;
				}
				return nok(code);
			}
			/**
			* After `</`, in closing tag, at tag name.
			*
			* ```markdown
			* > | </x>
			*       ^
			* ```
			*
			* @type {State}
			*/
			function tagCloseStart(code) {
				if (asciiAlpha(code)) {
					effects.consume(code);
					buffer = String.fromCharCode(code);
					return tagName;
				}
				return nok(code);
			}
			/**
			* In tag name.
			*
			* ```markdown
			* > | <ab>
			*      ^^
			* > | </ab>
			*       ^^
			* ```
			*
			* @type {State}
			*/
			function tagName(code) {
				if (code === null || code === 47 || code === 62 || markdownLineEndingOrSpace(code)) {
					const slash = code === 47;
					const name = buffer.toLowerCase();
					if (!slash && !closingTag && htmlRawNames.includes(name)) {
						marker = 1;
						return self.interrupt ? ok(code) : continuation(code);
					}
					if (htmlBlockNames.includes(buffer.toLowerCase())) {
						marker = 6;
						if (slash) {
							effects.consume(code);
							return basicSelfClosing;
						}
						return self.interrupt ? ok(code) : continuation(code);
					}
					marker = 7;
					return self.interrupt && !self.parser.lazy[self.now().line] ? nok(code) : closingTag ? completeClosingTagAfter(code) : completeAttributeNameBefore(code);
				}
				if (code === 45 || asciiAlphanumeric(code)) {
					effects.consume(code);
					buffer += String.fromCharCode(code);
					return tagName;
				}
				return nok(code);
			}
			/**
			* After closing slash of a basic tag name.
			*
			* ```markdown
			* > | <div/>
			*          ^
			* ```
			*
			* @type {State}
			*/
			function basicSelfClosing(code) {
				if (code === 62) {
					effects.consume(code);
					return self.interrupt ? ok : continuation;
				}
				return nok(code);
			}
			/**
			* After closing slash of a complete tag name.
			*
			* ```markdown
			* > | <x/>
			*        ^
			* ```
			*
			* @type {State}
			*/
			function completeClosingTagAfter(code) {
				if (markdownSpace(code)) {
					effects.consume(code);
					return completeClosingTagAfter;
				}
				return completeEnd(code);
			}
			/**
			* At an attribute name.
			*
			* At first, this state is used after a complete tag name, after whitespace,
			* where it expects optional attributes or the end of the tag.
			* It is also reused after attributes, when expecting more optional
			* attributes.
			*
			* ```markdown
			* > | <a />
			*        ^
			* > | <a :b>
			*        ^
			* > | <a _b>
			*        ^
			* > | <a b>
			*        ^
			* > | <a >
			*        ^
			* ```
			*
			* @type {State}
			*/
			function completeAttributeNameBefore(code) {
				if (code === 47) {
					effects.consume(code);
					return completeEnd;
				}
				if (code === 58 || code === 95 || asciiAlpha(code)) {
					effects.consume(code);
					return completeAttributeName;
				}
				if (markdownSpace(code)) {
					effects.consume(code);
					return completeAttributeNameBefore;
				}
				return completeEnd(code);
			}
			/**
			* In attribute name.
			*
			* ```markdown
			* > | <a :b>
			*         ^
			* > | <a _b>
			*         ^
			* > | <a b>
			*         ^
			* ```
			*
			* @type {State}
			*/
			function completeAttributeName(code) {
				if (code === 45 || code === 46 || code === 58 || code === 95 || asciiAlphanumeric(code)) {
					effects.consume(code);
					return completeAttributeName;
				}
				return completeAttributeNameAfter(code);
			}
			/**
			* After attribute name, at an optional initializer, the end of the tag, or
			* whitespace.
			*
			* ```markdown
			* > | <a b>
			*         ^
			* > | <a b=c>
			*         ^
			* ```
			*
			* @type {State}
			*/
			function completeAttributeNameAfter(code) {
				if (code === 61) {
					effects.consume(code);
					return completeAttributeValueBefore;
				}
				if (markdownSpace(code)) {
					effects.consume(code);
					return completeAttributeNameAfter;
				}
				return completeAttributeNameBefore(code);
			}
			/**
			* Before unquoted, double quoted, or single quoted attribute value, allowing
			* whitespace.
			*
			* ```markdown
			* > | <a b=c>
			*          ^
			* > | <a b="c">
			*          ^
			* ```
			*
			* @type {State}
			*/
			function completeAttributeValueBefore(code) {
				if (code === null || code === 60 || code === 61 || code === 62 || code === 96) return nok(code);
				if (code === 34 || code === 39) {
					effects.consume(code);
					markerB = code;
					return completeAttributeValueQuoted;
				}
				if (markdownSpace(code)) {
					effects.consume(code);
					return completeAttributeValueBefore;
				}
				return completeAttributeValueUnquoted(code);
			}
			/**
			* In double or single quoted attribute value.
			*
			* ```markdown
			* > | <a b="c">
			*           ^
			* > | <a b='c'>
			*           ^
			* ```
			*
			* @type {State}
			*/
			function completeAttributeValueQuoted(code) {
				if (code === markerB) {
					effects.consume(code);
					markerB = null;
					return completeAttributeValueQuotedAfter;
				}
				if (code === null || markdownLineEnding(code)) return nok(code);
				effects.consume(code);
				return completeAttributeValueQuoted;
			}
			/**
			* In unquoted attribute value.
			*
			* ```markdown
			* > | <a b=c>
			*          ^
			* ```
			*
			* @type {State}
			*/
			function completeAttributeValueUnquoted(code) {
				if (code === null || code === 34 || code === 39 || code === 47 || code === 60 || code === 61 || code === 62 || code === 96 || markdownLineEndingOrSpace(code)) return completeAttributeNameAfter(code);
				effects.consume(code);
				return completeAttributeValueUnquoted;
			}
			/**
			* After double or single quoted attribute value, before whitespace or the
			* end of the tag.
			*
			* ```markdown
			* > | <a b="c">
			*            ^
			* ```
			*
			* @type {State}
			*/
			function completeAttributeValueQuotedAfter(code) {
				if (code === 47 || code === 62 || markdownSpace(code)) return completeAttributeNameBefore(code);
				return nok(code);
			}
			/**
			* In certain circumstances of a complete tag where only an `>` is allowed.
			*
			* ```markdown
			* > | <a b="c">
			*             ^
			* ```
			*
			* @type {State}
			*/
			function completeEnd(code) {
				if (code === 62) {
					effects.consume(code);
					return completeAfter;
				}
				return nok(code);
			}
			/**
			* After `>` in a complete tag.
			*
			* ```markdown
			* > | <x>
			*        ^
			* ```
			*
			* @type {State}
			*/
			function completeAfter(code) {
				if (code === null || markdownLineEnding(code)) return continuation(code);
				if (markdownSpace(code)) {
					effects.consume(code);
					return completeAfter;
				}
				return nok(code);
			}
			/**
			* In continuation of any HTML kind.
			*
			* ```markdown
			* > | <!--xxx-->
			*          ^
			* ```
			*
			* @type {State}
			*/
			function continuation(code) {
				if (code === 45 && marker === 2) {
					effects.consume(code);
					return continuationCommentInside;
				}
				if (code === 60 && marker === 1) {
					effects.consume(code);
					return continuationRawTagOpen;
				}
				if (code === 62 && marker === 4) {
					effects.consume(code);
					return continuationClose;
				}
				if (code === 63 && marker === 3) {
					effects.consume(code);
					return continuationDeclarationInside;
				}
				if (code === 93 && marker === 5) {
					effects.consume(code);
					return continuationCdataInside;
				}
				if (markdownLineEnding(code) && (marker === 6 || marker === 7)) {
					effects.exit("htmlFlowData");
					return effects.check(blankLineBefore, continuationAfter, continuationStart)(code);
				}
				if (code === null || markdownLineEnding(code)) {
					effects.exit("htmlFlowData");
					return continuationStart(code);
				}
				effects.consume(code);
				return continuation;
			}
			/**
			* In continuation, at eol.
			*
			* ```markdown
			* > | <x>
			*        ^
			*   | asd
			* ```
			*
			* @type {State}
			*/
			function continuationStart(code) {
				return effects.check(nonLazyContinuationStart, continuationStartNonLazy, continuationAfter)(code);
			}
			/**
			* In continuation, at eol, before non-lazy content.
			*
			* ```markdown
			* > | <x>
			*        ^
			*   | asd
			* ```
			*
			* @type {State}
			*/
			function continuationStartNonLazy(code) {
				effects.enter("lineEnding");
				effects.consume(code);
				effects.exit("lineEnding");
				return continuationBefore;
			}
			/**
			* In continuation, before non-lazy content.
			*
			* ```markdown
			*   | <x>
			* > | asd
			*     ^
			* ```
			*
			* @type {State}
			*/
			function continuationBefore(code) {
				if (code === null || markdownLineEnding(code)) return continuationStart(code);
				effects.enter("htmlFlowData");
				return continuation(code);
			}
			/**
			* In comment continuation, after one `-`, expecting another.
			*
			* ```markdown
			* > | <!--xxx-->
			*             ^
			* ```
			*
			* @type {State}
			*/
			function continuationCommentInside(code) {
				if (code === 45) {
					effects.consume(code);
					return continuationDeclarationInside;
				}
				return continuation(code);
			}
			/**
			* In raw continuation, after `<`, at `/`.
			*
			* ```markdown
			* > | <script>console.log(1)<\/script>
			*                            ^
			* ```
			*
			* @type {State}
			*/
			function continuationRawTagOpen(code) {
				if (code === 47) {
					effects.consume(code);
					buffer = "";
					return continuationRawEndTag;
				}
				return continuation(code);
			}
			/**
			* In raw continuation, after `</`, in a raw tag name.
			*
			* ```markdown
			* > | <script>console.log(1)<\/script>
			*                             ^^^^^^
			* ```
			*
			* @type {State}
			*/
			function continuationRawEndTag(code) {
				if (code === 62) {
					const name = buffer.toLowerCase();
					if (htmlRawNames.includes(name)) {
						effects.consume(code);
						return continuationClose;
					}
					return continuation(code);
				}
				if (asciiAlpha(code) && buffer.length < 8) {
					effects.consume(code);
					buffer += String.fromCharCode(code);
					return continuationRawEndTag;
				}
				return continuation(code);
			}
			/**
			* In cdata continuation, after `]`, expecting `]>`.
			*
			* ```markdown
			* > | <![CDATA[>&<]]>
			*                  ^
			* ```
			*
			* @type {State}
			*/
			function continuationCdataInside(code) {
				if (code === 93) {
					effects.consume(code);
					return continuationDeclarationInside;
				}
				return continuation(code);
			}
			/**
			* In declaration or instruction continuation, at `>`.
			*
			* ```markdown
			* > | <!-->
			*         ^
			* > | <?>
			*       ^
			* > | <!q>
			*        ^
			* > | <!--ab-->
			*             ^
			* > | <![CDATA[>&<]]>
			*                   ^
			* ```
			*
			* @type {State}
			*/
			function continuationDeclarationInside(code) {
				if (code === 62) {
					effects.consume(code);
					return continuationClose;
				}
				if (code === 45 && marker === 2) {
					effects.consume(code);
					return continuationDeclarationInside;
				}
				return continuation(code);
			}
			/**
			* In closed continuation: everything we get until the eol/eof is part of it.
			*
			* ```markdown
			* > | <!doctype>
			*               ^
			* ```
			*
			* @type {State}
			*/
			function continuationClose(code) {
				if (code === null || markdownLineEnding(code)) {
					effects.exit("htmlFlowData");
					return continuationAfter(code);
				}
				effects.consume(code);
				return continuationClose;
			}
			/**
			* Done.
			*
			* ```markdown
			* > | <!doctype>
			*               ^
			* ```
			*
			* @type {State}
			*/
			function continuationAfter(code) {
				effects.exit("htmlFlow");
				return ok(code);
			}
		}
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeNonLazyContinuationStart(effects, ok, nok) {
			const self = this;
			return start;
			/**
			* At eol, before continuation.
			*
			* ```markdown
			* > | * ```js
			*            ^
			*   | b
			* ```
			*
			* @type {State}
			*/
			function start(code) {
				if (markdownLineEnding(code)) {
					effects.enter("lineEnding");
					effects.consume(code);
					effects.exit("lineEnding");
					return after;
				}
				return nok(code);
			}
			/**
			* A continuation.
			*
			* ```markdown
			*   | * ```js
			* > | b
			*     ^
			* ```
			*
			* @type {State}
			*/
			function after(code) {
				return self.parser.lazy[self.now().line] ? nok(code) : ok(code);
			}
		}
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeBlankLineBefore(effects, ok, nok) {
			return start;
			/**
			* Before eol, expecting blank line.
			*
			* ```markdown
			* > | <div>
			*          ^
			*   |
			* ```
			*
			* @type {State}
			*/
			function start(code) {
				effects.enter("lineEnding");
				effects.consume(code);
				effects.exit("lineEnding");
				return effects.attempt(blankLine, ok, nok);
			}
		}
		//#endregion
		//#region node_modules/micromark-core-commonmark/lib/html-text.js
		/**
		* @import {
		*   Code,
		*   Construct,
		*   State,
		*   TokenizeContext,
		*   Tokenizer
		* } from 'micromark-util-types'
		*/
		/** @type {Construct} */
		const htmlText = {
			name: "htmlText",
			tokenize: tokenizeHtmlText
		};
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeHtmlText(effects, ok, nok) {
			const self = this;
			/** @type {NonNullable<Code> | undefined} */
			let marker;
			/** @type {number} */
			let index;
			/** @type {State} */
			let returnState;
			return start;
			/**
			* Start of HTML (text).
			*
			* ```markdown
			* > | a <b> c
			*       ^
			* ```
			*
			* @type {State}
			*/
			function start(code) {
				effects.enter("htmlText");
				effects.enter("htmlTextData");
				effects.consume(code);
				return open;
			}
			/**
			* After `<`, at tag name or other stuff.
			*
			* ```markdown
			* > | a <b> c
			*        ^
			* > | a <!doctype> c
			*        ^
			* > | a <!--b--> c
			*        ^
			* ```
			*
			* @type {State}
			*/
			function open(code) {
				if (code === 33) {
					effects.consume(code);
					return declarationOpen;
				}
				if (code === 47) {
					effects.consume(code);
					return tagCloseStart;
				}
				if (code === 63) {
					effects.consume(code);
					return instruction;
				}
				if (asciiAlpha(code)) {
					effects.consume(code);
					return tagOpen;
				}
				return nok(code);
			}
			/**
			* After `<!`, at declaration, comment, or CDATA.
			*
			* ```markdown
			* > | a <!doctype> c
			*         ^
			* > | a <!--b--> c
			*         ^
			* > | a <![CDATA[>&<]]> c
			*         ^
			* ```
			*
			* @type {State}
			*/
			function declarationOpen(code) {
				if (code === 45) {
					effects.consume(code);
					return commentOpenInside;
				}
				if (code === 91) {
					effects.consume(code);
					index = 0;
					return cdataOpenInside;
				}
				if (asciiAlpha(code)) {
					effects.consume(code);
					return declaration;
				}
				return nok(code);
			}
			/**
			* In a comment, after `<!-`, at another `-`.
			*
			* ```markdown
			* > | a <!--b--> c
			*          ^
			* ```
			*
			* @type {State}
			*/
			function commentOpenInside(code) {
				if (code === 45) {
					effects.consume(code);
					return commentEnd;
				}
				return nok(code);
			}
			/**
			* In comment.
			*
			* ```markdown
			* > | a <!--b--> c
			*           ^
			* ```
			*
			* @type {State}
			*/
			function comment(code) {
				if (code === null) return nok(code);
				if (code === 45) {
					effects.consume(code);
					return commentClose;
				}
				if (markdownLineEnding(code)) {
					returnState = comment;
					return lineEndingBefore(code);
				}
				effects.consume(code);
				return comment;
			}
			/**
			* In comment, after `-`.
			*
			* ```markdown
			* > | a <!--b--> c
			*             ^
			* ```
			*
			* @type {State}
			*/
			function commentClose(code) {
				if (code === 45) {
					effects.consume(code);
					return commentEnd;
				}
				return comment(code);
			}
			/**
			* In comment, after `--`.
			*
			* ```markdown
			* > | a <!--b--> c
			*              ^
			* ```
			*
			* @type {State}
			*/
			function commentEnd(code) {
				return code === 62 ? end(code) : code === 45 ? commentClose(code) : comment(code);
			}
			/**
			* After `<![`, in CDATA, expecting `CDATA[`.
			*
			* ```markdown
			* > | a <![CDATA[>&<]]> b
			*          ^^^^^^
			* ```
			*
			* @type {State}
			*/
			function cdataOpenInside(code) {
				if (code === "CDATA[".charCodeAt(index++)) {
					effects.consume(code);
					return index === 6 ? cdata : cdataOpenInside;
				}
				return nok(code);
			}
			/**
			* In CDATA.
			*
			* ```markdown
			* > | a <![CDATA[>&<]]> b
			*                ^^^
			* ```
			*
			* @type {State}
			*/
			function cdata(code) {
				if (code === null) return nok(code);
				if (code === 93) {
					effects.consume(code);
					return cdataClose;
				}
				if (markdownLineEnding(code)) {
					returnState = cdata;
					return lineEndingBefore(code);
				}
				effects.consume(code);
				return cdata;
			}
			/**
			* In CDATA, after `]`, at another `]`.
			*
			* ```markdown
			* > | a <![CDATA[>&<]]> b
			*                    ^
			* ```
			*
			* @type {State}
			*/
			function cdataClose(code) {
				if (code === 93) {
					effects.consume(code);
					return cdataEnd;
				}
				return cdata(code);
			}
			/**
			* In CDATA, after `]]`, at `>`.
			*
			* ```markdown
			* > | a <![CDATA[>&<]]> b
			*                     ^
			* ```
			*
			* @type {State}
			*/
			function cdataEnd(code) {
				if (code === 62) return end(code);
				if (code === 93) {
					effects.consume(code);
					return cdataEnd;
				}
				return cdata(code);
			}
			/**
			* In declaration.
			*
			* ```markdown
			* > | a <!b> c
			*          ^
			* ```
			*
			* @type {State}
			*/
			function declaration(code) {
				if (code === null || code === 62) return end(code);
				if (markdownLineEnding(code)) {
					returnState = declaration;
					return lineEndingBefore(code);
				}
				effects.consume(code);
				return declaration;
			}
			/**
			* In instruction.
			*
			* ```markdown
			* > | a <?b?> c
			*         ^
			* ```
			*
			* @type {State}
			*/
			function instruction(code) {
				if (code === null) return nok(code);
				if (code === 63) {
					effects.consume(code);
					return instructionClose;
				}
				if (markdownLineEnding(code)) {
					returnState = instruction;
					return lineEndingBefore(code);
				}
				effects.consume(code);
				return instruction;
			}
			/**
			* In instruction, after `?`, at `>`.
			*
			* ```markdown
			* > | a <?b?> c
			*           ^
			* ```
			*
			* @type {State}
			*/
			function instructionClose(code) {
				return code === 62 ? end(code) : instruction(code);
			}
			/**
			* After `</`, in closing tag, at tag name.
			*
			* ```markdown
			* > | a </b> c
			*         ^
			* ```
			*
			* @type {State}
			*/
			function tagCloseStart(code) {
				if (asciiAlpha(code)) {
					effects.consume(code);
					return tagClose;
				}
				return nok(code);
			}
			/**
			* After `</x`, in a tag name.
			*
			* ```markdown
			* > | a </b> c
			*          ^
			* ```
			*
			* @type {State}
			*/
			function tagClose(code) {
				if (code === 45 || asciiAlphanumeric(code)) {
					effects.consume(code);
					return tagClose;
				}
				return tagCloseBetween(code);
			}
			/**
			* In closing tag, after tag name.
			*
			* ```markdown
			* > | a </b> c
			*          ^
			* ```
			*
			* @type {State}
			*/
			function tagCloseBetween(code) {
				if (markdownLineEnding(code)) {
					returnState = tagCloseBetween;
					return lineEndingBefore(code);
				}
				if (markdownSpace(code)) {
					effects.consume(code);
					return tagCloseBetween;
				}
				return end(code);
			}
			/**
			* After `<x`, in opening tag name.
			*
			* ```markdown
			* > | a <b> c
			*         ^
			* ```
			*
			* @type {State}
			*/
			function tagOpen(code) {
				if (code === 45 || asciiAlphanumeric(code)) {
					effects.consume(code);
					return tagOpen;
				}
				if (code === 47 || code === 62 || markdownLineEndingOrSpace(code)) return tagOpenBetween(code);
				return nok(code);
			}
			/**
			* In opening tag, after tag name.
			*
			* ```markdown
			* > | a <b> c
			*         ^
			* ```
			*
			* @type {State}
			*/
			function tagOpenBetween(code) {
				if (code === 47) {
					effects.consume(code);
					return end;
				}
				if (code === 58 || code === 95 || asciiAlpha(code)) {
					effects.consume(code);
					return tagOpenAttributeName;
				}
				if (markdownLineEnding(code)) {
					returnState = tagOpenBetween;
					return lineEndingBefore(code);
				}
				if (markdownSpace(code)) {
					effects.consume(code);
					return tagOpenBetween;
				}
				return end(code);
			}
			/**
			* In attribute name.
			*
			* ```markdown
			* > | a <b c> d
			*          ^
			* ```
			*
			* @type {State}
			*/
			function tagOpenAttributeName(code) {
				if (code === 45 || code === 46 || code === 58 || code === 95 || asciiAlphanumeric(code)) {
					effects.consume(code);
					return tagOpenAttributeName;
				}
				return tagOpenAttributeNameAfter(code);
			}
			/**
			* After attribute name, before initializer, the end of the tag, or
			* whitespace.
			*
			* ```markdown
			* > | a <b c> d
			*           ^
			* ```
			*
			* @type {State}
			*/
			function tagOpenAttributeNameAfter(code) {
				if (code === 61) {
					effects.consume(code);
					return tagOpenAttributeValueBefore;
				}
				if (markdownLineEnding(code)) {
					returnState = tagOpenAttributeNameAfter;
					return lineEndingBefore(code);
				}
				if (markdownSpace(code)) {
					effects.consume(code);
					return tagOpenAttributeNameAfter;
				}
				return tagOpenBetween(code);
			}
			/**
			* Before unquoted, double quoted, or single quoted attribute value, allowing
			* whitespace.
			*
			* ```markdown
			* > | a <b c=d> e
			*            ^
			* ```
			*
			* @type {State}
			*/
			function tagOpenAttributeValueBefore(code) {
				if (code === null || code === 60 || code === 61 || code === 62 || code === 96) return nok(code);
				if (code === 34 || code === 39) {
					effects.consume(code);
					marker = code;
					return tagOpenAttributeValueQuoted;
				}
				if (markdownLineEnding(code)) {
					returnState = tagOpenAttributeValueBefore;
					return lineEndingBefore(code);
				}
				if (markdownSpace(code)) {
					effects.consume(code);
					return tagOpenAttributeValueBefore;
				}
				effects.consume(code);
				return tagOpenAttributeValueUnquoted;
			}
			/**
			* In double or single quoted attribute value.
			*
			* ```markdown
			* > | a <b c="d"> e
			*             ^
			* ```
			*
			* @type {State}
			*/
			function tagOpenAttributeValueQuoted(code) {
				if (code === marker) {
					effects.consume(code);
					marker = void 0;
					return tagOpenAttributeValueQuotedAfter;
				}
				if (code === null) return nok(code);
				if (markdownLineEnding(code)) {
					returnState = tagOpenAttributeValueQuoted;
					return lineEndingBefore(code);
				}
				effects.consume(code);
				return tagOpenAttributeValueQuoted;
			}
			/**
			* In unquoted attribute value.
			*
			* ```markdown
			* > | a <b c=d> e
			*            ^
			* ```
			*
			* @type {State}
			*/
			function tagOpenAttributeValueUnquoted(code) {
				if (code === null || code === 34 || code === 39 || code === 60 || code === 61 || code === 96) return nok(code);
				if (code === 47 || code === 62 || markdownLineEndingOrSpace(code)) return tagOpenBetween(code);
				effects.consume(code);
				return tagOpenAttributeValueUnquoted;
			}
			/**
			* After double or single quoted attribute value, before whitespace or the end
			* of the tag.
			*
			* ```markdown
			* > | a <b c="d"> e
			*               ^
			* ```
			*
			* @type {State}
			*/
			function tagOpenAttributeValueQuotedAfter(code) {
				if (code === 47 || code === 62 || markdownLineEndingOrSpace(code)) return tagOpenBetween(code);
				return nok(code);
			}
			/**
			* In certain circumstances of a tag where only an `>` is allowed.
			*
			* ```markdown
			* > | a <b c="d"> e
			*               ^
			* ```
			*
			* @type {State}
			*/
			function end(code) {
				if (code === 62) {
					effects.consume(code);
					effects.exit("htmlTextData");
					effects.exit("htmlText");
					return ok;
				}
				return nok(code);
			}
			/**
			* At eol.
			*
			* > 👉 **Note**: we can’t have blank lines in text, so no need to worry about
			* > empty tokens.
			*
			* ```markdown
			* > | a <!--a
			*            ^
			*   | b-->
			* ```
			*
			* @type {State}
			*/
			function lineEndingBefore(code) {
				effects.exit("htmlTextData");
				effects.enter("lineEnding");
				effects.consume(code);
				effects.exit("lineEnding");
				return lineEndingAfter;
			}
			/**
			* After eol, at optional whitespace.
			*
			* > 👉 **Note**: we can’t have blank lines in text, so no need to worry about
			* > empty tokens.
			*
			* ```markdown
			*   | a <!--a
			* > | b-->
			*     ^
			* ```
			*
			* @type {State}
			*/
			function lineEndingAfter(code) {
				return markdownSpace(code) ? factorySpace(effects, lineEndingAfterPrefix, "linePrefix", self.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 4)(code) : lineEndingAfterPrefix(code);
			}
			/**
			* After eol, after optional whitespace.
			*
			* > 👉 **Note**: we can’t have blank lines in text, so no need to worry about
			* > empty tokens.
			*
			* ```markdown
			*   | a <!--a
			* > | b-->
			*     ^
			* ```
			*
			* @type {State}
			*/
			function lineEndingAfterPrefix(code) {
				effects.enter("htmlTextData");
				return returnState(code);
			}
		}
		//#endregion
		//#region node_modules/micromark-core-commonmark/lib/label-end.js
		/**
		* @import {
		*   Construct,
		*   Event,
		*   Resolver,
		*   State,
		*   TokenizeContext,
		*   Tokenizer,
		*   Token
		* } from 'micromark-util-types'
		*/
		/** @type {Construct} */
		const labelEnd = {
			name: "labelEnd",
			resolveAll: resolveAllLabelEnd,
			resolveTo: resolveToLabelEnd,
			tokenize: tokenizeLabelEnd
		};
		/** @type {Construct} */
		const resourceConstruct = { tokenize: tokenizeResource };
		/** @type {Construct} */
		const referenceFullConstruct = { tokenize: tokenizeReferenceFull };
		/** @type {Construct} */
		const referenceCollapsedConstruct = { tokenize: tokenizeReferenceCollapsed };
		/** @type {Resolver} */
		function resolveAllLabelEnd(events) {
			let index = -1;
			/** @type {Array<Event>} */
			const newEvents = [];
			while (++index < events.length) {
				const token = events[index][1];
				newEvents.push(events[index]);
				if (token.type === "labelImage" || token.type === "labelLink" || token.type === "labelEnd") {
					const offset = token.type === "labelImage" ? 4 : 2;
					token.type = "data";
					index += offset;
				}
			}
			if (events.length !== newEvents.length) splice(events, 0, events.length, newEvents);
			return events;
		}
		/** @type {Resolver} */
		function resolveToLabelEnd(events, context) {
			let index = events.length;
			let offset = 0;
			/** @type {Token} */
			let token;
			/** @type {number | undefined} */
			let open;
			/** @type {number | undefined} */
			let close;
			/** @type {Array<Event>} */
			let media;
			while (index--) {
				token = events[index][1];
				if (open) {
					if (token.type === "link" || token.type === "labelLink" && token._inactive) break;
					if (events[index][0] === "enter" && token.type === "labelLink") token._inactive = true;
				} else if (close) {
					if (events[index][0] === "enter" && (token.type === "labelImage" || token.type === "labelLink") && !token._balanced) {
						open = index;
						if (token.type !== "labelLink") {
							offset = 2;
							break;
						}
					}
				} else if (token.type === "labelEnd") close = index;
			}
			const group = {
				type: events[open][1].type === "labelLink" ? "link" : "image",
				start: { ...events[open][1].start },
				end: { ...events[events.length - 1][1].end }
			};
			const label = {
				type: "label",
				start: { ...events[open][1].start },
				end: { ...events[close][1].end }
			};
			const text = {
				type: "labelText",
				start: { ...events[open + offset + 2][1].end },
				end: { ...events[close - 2][1].start }
			};
			media = [[
				"enter",
				group,
				context
			], [
				"enter",
				label,
				context
			]];
			media = push(media, events.slice(open + 1, open + offset + 3));
			media = push(media, [[
				"enter",
				text,
				context
			]]);
			media = push(media, resolveAll(context.parser.constructs.insideSpan.null, events.slice(open + offset + 4, close - 3), context));
			media = push(media, [
				[
					"exit",
					text,
					context
				],
				events[close - 2],
				events[close - 1],
				[
					"exit",
					label,
					context
				]
			]);
			media = push(media, events.slice(close + 1));
			media = push(media, [[
				"exit",
				group,
				context
			]]);
			splice(events, open, events.length, media);
			return events;
		}
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeLabelEnd(effects, ok, nok) {
			const self = this;
			let index = self.events.length;
			/** @type {Token} */
			let labelStart;
			/** @type {boolean} */
			let defined;
			while (index--) if ((self.events[index][1].type === "labelImage" || self.events[index][1].type === "labelLink") && !self.events[index][1]._balanced) {
				labelStart = self.events[index][1];
				break;
			}
			return start;
			/**
			* Start of label end.
			*
			* ```markdown
			* > | [a](b) c
			*       ^
			* > | [a][b] c
			*       ^
			* > | [a][] b
			*       ^
			* > | [a] b
			* ```
			*
			* @type {State}
			*/
			function start(code) {
				if (!labelStart) return nok(code);
				if (labelStart._inactive) return labelEndNok(code);
				defined = self.parser.defined.includes(normalizeIdentifier(self.sliceSerialize({
					start: labelStart.end,
					end: self.now()
				})));
				effects.enter("labelEnd");
				effects.enter("labelMarker");
				effects.consume(code);
				effects.exit("labelMarker");
				effects.exit("labelEnd");
				return after;
			}
			/**
			* After `]`.
			*
			* ```markdown
			* > | [a](b) c
			*       ^
			* > | [a][b] c
			*       ^
			* > | [a][] b
			*       ^
			* > | [a] b
			*       ^
			* ```
			*
			* @type {State}
			*/
			function after(code) {
				if (code === 40) return effects.attempt(resourceConstruct, labelEndOk, defined ? labelEndOk : labelEndNok)(code);
				if (code === 91) return effects.attempt(referenceFullConstruct, labelEndOk, defined ? referenceNotFull : labelEndNok)(code);
				return defined ? labelEndOk(code) : labelEndNok(code);
			}
			/**
			* After `]`, at `[`, but not at a full reference.
			*
			* > 👉 **Note**: we only get here if the label is defined.
			*
			* ```markdown
			* > | [a][] b
			*        ^
			* > | [a] b
			*        ^
			* ```
			*
			* @type {State}
			*/
			function referenceNotFull(code) {
				return effects.attempt(referenceCollapsedConstruct, labelEndOk, labelEndNok)(code);
			}
			/**
			* Done, we found something.
			*
			* ```markdown
			* > | [a](b) c
			*           ^
			* > | [a][b] c
			*           ^
			* > | [a][] b
			*          ^
			* > | [a] b
			*        ^
			* ```
			*
			* @type {State}
			*/
			function labelEndOk(code) {
				return ok(code);
			}
			/**
			* Done, it’s nothing.
			*
			* There was an okay opening, but we didn’t match anything.
			*
			* ```markdown
			* > | [a](b c
			*        ^
			* > | [a][b c
			*        ^
			* > | [a] b
			*        ^
			* ```
			*
			* @type {State}
			*/
			function labelEndNok(code) {
				labelStart._balanced = true;
				return nok(code);
			}
		}
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeResource(effects, ok, nok) {
			return resourceStart;
			/**
			* At a resource.
			*
			* ```markdown
			* > | [a](b) c
			*        ^
			* ```
			*
			* @type {State}
			*/
			function resourceStart(code) {
				effects.enter("resource");
				effects.enter("resourceMarker");
				effects.consume(code);
				effects.exit("resourceMarker");
				return resourceBefore;
			}
			/**
			* In resource, after `(`, at optional whitespace.
			*
			* ```markdown
			* > | [a](b) c
			*         ^
			* ```
			*
			* @type {State}
			*/
			function resourceBefore(code) {
				return markdownLineEndingOrSpace(code) ? factoryWhitespace(effects, resourceOpen)(code) : resourceOpen(code);
			}
			/**
			* In resource, after optional whitespace, at `)` or a destination.
			*
			* ```markdown
			* > | [a](b) c
			*         ^
			* ```
			*
			* @type {State}
			*/
			function resourceOpen(code) {
				if (code === 41) return resourceEnd(code);
				return factoryDestination(effects, resourceDestinationAfter, resourceDestinationMissing, "resourceDestination", "resourceDestinationLiteral", "resourceDestinationLiteralMarker", "resourceDestinationRaw", "resourceDestinationString", 32)(code);
			}
			/**
			* In resource, after destination, at optional whitespace.
			*
			* ```markdown
			* > | [a](b) c
			*          ^
			* ```
			*
			* @type {State}
			*/
			function resourceDestinationAfter(code) {
				return markdownLineEndingOrSpace(code) ? factoryWhitespace(effects, resourceBetween)(code) : resourceEnd(code);
			}
			/**
			* At invalid destination.
			*
			* ```markdown
			* > | [a](<<) b
			*         ^
			* ```
			*
			* @type {State}
			*/
			function resourceDestinationMissing(code) {
				return nok(code);
			}
			/**
			* In resource, after destination and whitespace, at `(` or title.
			*
			* ```markdown
			* > | [a](b ) c
			*           ^
			* ```
			*
			* @type {State}
			*/
			function resourceBetween(code) {
				if (code === 34 || code === 39 || code === 40) return factoryTitle(effects, resourceTitleAfter, nok, "resourceTitle", "resourceTitleMarker", "resourceTitleString")(code);
				return resourceEnd(code);
			}
			/**
			* In resource, after title, at optional whitespace.
			*
			* ```markdown
			* > | [a](b "c") d
			*              ^
			* ```
			*
			* @type {State}
			*/
			function resourceTitleAfter(code) {
				return markdownLineEndingOrSpace(code) ? factoryWhitespace(effects, resourceEnd)(code) : resourceEnd(code);
			}
			/**
			* In resource, at `)`.
			*
			* ```markdown
			* > | [a](b) d
			*          ^
			* ```
			*
			* @type {State}
			*/
			function resourceEnd(code) {
				if (code === 41) {
					effects.enter("resourceMarker");
					effects.consume(code);
					effects.exit("resourceMarker");
					effects.exit("resource");
					return ok;
				}
				return nok(code);
			}
		}
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeReferenceFull(effects, ok, nok) {
			const self = this;
			return referenceFull;
			/**
			* In a reference (full), at the `[`.
			*
			* ```markdown
			* > | [a][b] d
			*        ^
			* ```
			*
			* @type {State}
			*/
			function referenceFull(code) {
				return factoryLabel.call(self, effects, referenceFullAfter, referenceFullMissing, "reference", "referenceMarker", "referenceString")(code);
			}
			/**
			* In a reference (full), after `]`.
			*
			* ```markdown
			* > | [a][b] d
			*          ^
			* ```
			*
			* @type {State}
			*/
			function referenceFullAfter(code) {
				return self.parser.defined.includes(normalizeIdentifier(self.sliceSerialize(self.events[self.events.length - 1][1]).slice(1, -1))) ? ok(code) : nok(code);
			}
			/**
			* In reference (full) that was missing.
			*
			* ```markdown
			* > | [a][b d
			*        ^
			* ```
			*
			* @type {State}
			*/
			function referenceFullMissing(code) {
				return nok(code);
			}
		}
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeReferenceCollapsed(effects, ok, nok) {
			return referenceCollapsedStart;
			/**
			* In reference (collapsed), at `[`.
			*
			* > 👉 **Note**: we only get here if the label is defined.
			*
			* ```markdown
			* > | [a][] d
			*        ^
			* ```
			*
			* @type {State}
			*/
			function referenceCollapsedStart(code) {
				effects.enter("reference");
				effects.enter("referenceMarker");
				effects.consume(code);
				effects.exit("referenceMarker");
				return referenceCollapsedOpen;
			}
			/**
			* In reference (collapsed), at `]`.
			*
			* > 👉 **Note**: we only get here if the label is defined.
			*
			* ```markdown
			* > | [a][] d
			*         ^
			* ```
			*
			*  @type {State}
			*/
			function referenceCollapsedOpen(code) {
				if (code === 93) {
					effects.enter("referenceMarker");
					effects.consume(code);
					effects.exit("referenceMarker");
					effects.exit("reference");
					return ok;
				}
				return nok(code);
			}
		}
		//#endregion
		//#region node_modules/micromark-core-commonmark/lib/label-start-image.js
		/**
		* @import {
		*   Construct,
		*   State,
		*   TokenizeContext,
		*   Tokenizer
		* } from 'micromark-util-types'
		*/
		/** @type {Construct} */
		const labelStartImage = {
			name: "labelStartImage",
			resolveAll: labelEnd.resolveAll,
			tokenize: tokenizeLabelStartImage
		};
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeLabelStartImage(effects, ok, nok) {
			const self = this;
			return start;
			/**
			* Start of label (image) start.
			*
			* ```markdown
			* > | a ![b] c
			*       ^
			* ```
			*
			* @type {State}
			*/
			function start(code) {
				effects.enter("labelImage");
				effects.enter("labelImageMarker");
				effects.consume(code);
				effects.exit("labelImageMarker");
				return open;
			}
			/**
			* After `!`, at `[`.
			*
			* ```markdown
			* > | a ![b] c
			*        ^
			* ```
			*
			* @type {State}
			*/
			function open(code) {
				if (code === 91) {
					effects.enter("labelMarker");
					effects.consume(code);
					effects.exit("labelMarker");
					effects.exit("labelImage");
					return after;
				}
				return nok(code);
			}
			/**
			* After `![`.
			*
			* ```markdown
			* > | a ![b] c
			*         ^
			* ```
			*
			* This is needed in because, when GFM footnotes are enabled, images never
			* form when started with a `^`.
			* Instead, links form:
			*
			* ```markdown
			* ![^a](b)
			*
			* ![^a][b]
			*
			* [b]: c
			* ```
			*
			* ```html
			* <p>!<a href=\"b\">^a</a></p>
			* <p>!<a href=\"c\">^a</a></p>
			* ```
			*
			* @type {State}
			*/
			function after(code) {
				/* c8 ignore next 3 */
				return code === 94 && "_hiddenFootnoteSupport" in self.parser.constructs ? nok(code) : ok(code);
			}
		}
		//#endregion
		//#region node_modules/micromark-core-commonmark/lib/label-start-link.js
		/**
		* @import {
		*   Construct,
		*   State,
		*   TokenizeContext,
		*   Tokenizer
		* } from 'micromark-util-types'
		*/
		/** @type {Construct} */
		const labelStartLink = {
			name: "labelStartLink",
			resolveAll: labelEnd.resolveAll,
			tokenize: tokenizeLabelStartLink
		};
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeLabelStartLink(effects, ok, nok) {
			const self = this;
			return start;
			/**
			* Start of label (link) start.
			*
			* ```markdown
			* > | a [b] c
			*       ^
			* ```
			*
			* @type {State}
			*/
			function start(code) {
				effects.enter("labelLink");
				effects.enter("labelMarker");
				effects.consume(code);
				effects.exit("labelMarker");
				effects.exit("labelLink");
				return after;
			}
			/** @type {State} */
			function after(code) {
				/* c8 ignore next 3 */
				return code === 94 && "_hiddenFootnoteSupport" in self.parser.constructs ? nok(code) : ok(code);
			}
		}
		//#endregion
		//#region node_modules/micromark-core-commonmark/lib/line-ending.js
		/**
		* @import {
		*   Construct,
		*   State,
		*   TokenizeContext,
		*   Tokenizer
		* } from 'micromark-util-types'
		*/
		/** @type {Construct} */
		const lineEnding = {
			name: "lineEnding",
			tokenize: tokenizeLineEnding
		};
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeLineEnding(effects, ok) {
			return start;
			/** @type {State} */
			function start(code) {
				effects.enter("lineEnding");
				effects.consume(code);
				effects.exit("lineEnding");
				return factorySpace(effects, ok, "linePrefix");
			}
		}
		//#endregion
		//#region node_modules/micromark-core-commonmark/lib/thematic-break.js
		/**
		* @import {
		*   Code,
		*   Construct,
		*   State,
		*   TokenizeContext,
		*   Tokenizer
		* } from 'micromark-util-types'
		*/
		/** @type {Construct} */
		const thematicBreak$2 = {
			name: "thematicBreak",
			tokenize: tokenizeThematicBreak
		};
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeThematicBreak(effects, ok, nok) {
			let size = 0;
			/** @type {NonNullable<Code>} */
			let marker;
			return start;
			/**
			* Start of thematic break.
			*
			* ```markdown
			* > | ***
			*     ^
			* ```
			*
			* @type {State}
			*/
			function start(code) {
				effects.enter("thematicBreak");
				return before(code);
			}
			/**
			* After optional whitespace, at marker.
			*
			* ```markdown
			* > | ***
			*     ^
			* ```
			*
			* @type {State}
			*/
			function before(code) {
				marker = code;
				return atBreak(code);
			}
			/**
			* After something, before something else.
			*
			* ```markdown
			* > | ***
			*     ^
			* ```
			*
			* @type {State}
			*/
			function atBreak(code) {
				if (code === marker) {
					effects.enter("thematicBreakSequence");
					return sequence(code);
				}
				if (size >= 3 && (code === null || markdownLineEnding(code))) {
					effects.exit("thematicBreak");
					return ok(code);
				}
				return nok(code);
			}
			/**
			* In sequence.
			*
			* ```markdown
			* > | ***
			*     ^
			* ```
			*
			* @type {State}
			*/
			function sequence(code) {
				if (code === marker) {
					effects.consume(code);
					size++;
					return sequence;
				}
				effects.exit("thematicBreakSequence");
				return markdownSpace(code) ? factorySpace(effects, atBreak, "whitespace")(code) : atBreak(code);
			}
		}
		//#endregion
		//#region node_modules/micromark-core-commonmark/lib/list.js
		/**
		* @import {
		*   Code,
		*   Construct,
		*   Exiter,
		*   State,
		*   TokenizeContext,
		*   Tokenizer
		* } from 'micromark-util-types'
		*/
		/** @type {Construct} */
		const list$2 = {
			continuation: { tokenize: tokenizeListContinuation },
			exit: tokenizeListEnd,
			name: "list",
			tokenize: tokenizeListStart
		};
		/** @type {Construct} */
		const listItemPrefixWhitespaceConstruct = {
			partial: true,
			tokenize: tokenizeListItemPrefixWhitespace
		};
		/** @type {Construct} */
		const indentConstruct = {
			partial: true,
			tokenize: tokenizeIndent$1
		};
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeListStart(effects, ok, nok) {
			const self = this;
			const tail = self.events[self.events.length - 1];
			let initialSize = tail && tail[1].type === "linePrefix" ? tail[2].sliceSerialize(tail[1], true).length : 0;
			let size = 0;
			return start;
			/** @type {State} */
			function start(code) {
				const kind = self.containerState.type || (code === 42 || code === 43 || code === 45 ? "listUnordered" : "listOrdered");
				if (kind === "listUnordered" ? !self.containerState.marker || code === self.containerState.marker : asciiDigit(code)) {
					if (!self.containerState.type) {
						self.containerState.type = kind;
						effects.enter(kind, { _container: true });
					}
					if (kind === "listUnordered") {
						effects.enter("listItemPrefix");
						return code === 42 || code === 45 ? effects.check(thematicBreak$2, nok, atMarker)(code) : atMarker(code);
					}
					if (!self.interrupt || code === 49) {
						effects.enter("listItemPrefix");
						effects.enter("listItemValue");
						return inside(code);
					}
				}
				return nok(code);
			}
			/** @type {State} */
			function inside(code) {
				if (asciiDigit(code) && ++size < 10) {
					effects.consume(code);
					return inside;
				}
				if ((!self.interrupt || size < 2) && (self.containerState.marker ? code === self.containerState.marker : code === 41 || code === 46)) {
					effects.exit("listItemValue");
					return atMarker(code);
				}
				return nok(code);
			}
			/**
			* @type {State}
			**/
			function atMarker(code) {
				effects.enter("listItemMarker");
				effects.consume(code);
				effects.exit("listItemMarker");
				self.containerState.marker = self.containerState.marker || code;
				return effects.check(blankLine, self.interrupt ? nok : onBlank, effects.attempt(listItemPrefixWhitespaceConstruct, endOfPrefix, otherPrefix));
			}
			/** @type {State} */
			function onBlank(code) {
				self.containerState.initialBlankLine = true;
				initialSize++;
				return endOfPrefix(code);
			}
			/** @type {State} */
			function otherPrefix(code) {
				if (markdownSpace(code)) {
					effects.enter("listItemPrefixWhitespace");
					effects.consume(code);
					effects.exit("listItemPrefixWhitespace");
					return endOfPrefix;
				}
				return nok(code);
			}
			/** @type {State} */
			function endOfPrefix(code) {
				self.containerState.size = initialSize + self.sliceSerialize(effects.exit("listItemPrefix"), true).length;
				return ok(code);
			}
		}
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeListContinuation(effects, ok, nok) {
			const self = this;
			self.containerState._closeFlow = void 0;
			return effects.check(blankLine, onBlank, notBlank);
			/** @type {State} */
			function onBlank(code) {
				self.containerState.furtherBlankLines = self.containerState.furtherBlankLines || self.containerState.initialBlankLine;
				return factorySpace(effects, ok, "listItemIndent", self.containerState.size + 1)(code);
			}
			/** @type {State} */
			function notBlank(code) {
				if (self.containerState.furtherBlankLines || !markdownSpace(code)) {
					self.containerState.furtherBlankLines = void 0;
					self.containerState.initialBlankLine = void 0;
					return notInCurrentItem(code);
				}
				self.containerState.furtherBlankLines = void 0;
				self.containerState.initialBlankLine = void 0;
				return effects.attempt(indentConstruct, ok, notInCurrentItem)(code);
			}
			/** @type {State} */
			function notInCurrentItem(code) {
				self.containerState._closeFlow = true;
				self.interrupt = void 0;
				return factorySpace(effects, effects.attempt(list$2, ok, nok), "linePrefix", self.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 4)(code);
			}
		}
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeIndent$1(effects, ok, nok) {
			const self = this;
			return factorySpace(effects, afterPrefix, "listItemIndent", self.containerState.size + 1);
			/** @type {State} */
			function afterPrefix(code) {
				const tail = self.events[self.events.length - 1];
				return tail && tail[1].type === "listItemIndent" && tail[2].sliceSerialize(tail[1], true).length === self.containerState.size ? ok(code) : nok(code);
			}
		}
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Exiter}
		*/
		function tokenizeListEnd(effects) {
			effects.exit(this.containerState.type);
		}
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeListItemPrefixWhitespace(effects, ok, nok) {
			const self = this;
			return factorySpace(effects, afterPrefix, "listItemPrefixWhitespace", self.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 5);
			/** @type {State} */
			function afterPrefix(code) {
				const tail = self.events[self.events.length - 1];
				return !markdownSpace(code) && tail && tail[1].type === "listItemPrefixWhitespace" ? ok(code) : nok(code);
			}
		}
		//#endregion
		//#region node_modules/micromark-core-commonmark/lib/setext-underline.js
		/**
		* @import {
		*   Code,
		*   Construct,
		*   Resolver,
		*   State,
		*   TokenizeContext,
		*   Tokenizer
		* } from 'micromark-util-types'
		*/
		/** @type {Construct} */
		const setextUnderline = {
			name: "setextUnderline",
			resolveTo: resolveToSetextUnderline,
			tokenize: tokenizeSetextUnderline
		};
		/** @type {Resolver} */
		function resolveToSetextUnderline(events, context) {
			let index = events.length;
			/** @type {number | undefined} */
			let content;
			/** @type {number | undefined} */
			let text;
			/** @type {number | undefined} */
			let definition;
			while (index--) if (events[index][0] === "enter") {
				if (events[index][1].type === "content") {
					content = index;
					break;
				}
				if (events[index][1].type === "paragraph") text = index;
			} else {
				if (events[index][1].type === "content") events.splice(index, 1);
				if (!definition && events[index][1].type === "definition") definition = index;
			}
			const heading = {
				type: "setextHeading",
				start: { ...events[content][1].start },
				end: { ...events[events.length - 1][1].end }
			};
			events[text][1].type = "setextHeadingText";
			if (definition) {
				events.splice(text, 0, [
					"enter",
					heading,
					context
				]);
				events.splice(definition + 1, 0, [
					"exit",
					events[content][1],
					context
				]);
				events[content][1].end = { ...events[definition][1].end };
			} else events[content][1] = heading;
			events.push([
				"exit",
				heading,
				context
			]);
			return events;
		}
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeSetextUnderline(effects, ok, nok) {
			const self = this;
			/** @type {NonNullable<Code>} */
			let marker;
			return start;
			/**
			* At start of heading (setext) underline.
			*
			* ```markdown
			*   | aa
			* > | ==
			*     ^
			* ```
			*
			* @type {State}
			*/
			function start(code) {
				let index = self.events.length;
				/** @type {boolean | undefined} */
				let paragraph;
				while (index--) if (self.events[index][1].type !== "lineEnding" && self.events[index][1].type !== "linePrefix" && self.events[index][1].type !== "content") {
					paragraph = self.events[index][1].type === "paragraph";
					break;
				}
				if (!self.parser.lazy[self.now().line] && (self.interrupt || paragraph)) {
					effects.enter("setextHeadingLine");
					marker = code;
					return before(code);
				}
				return nok(code);
			}
			/**
			* After optional whitespace, at `-` or `=`.
			*
			* ```markdown
			*   | aa
			* > | ==
			*     ^
			* ```
			*
			* @type {State}
			*/
			function before(code) {
				effects.enter("setextHeadingLineSequence");
				return inside(code);
			}
			/**
			* In sequence.
			*
			* ```markdown
			*   | aa
			* > | ==
			*     ^
			* ```
			*
			* @type {State}
			*/
			function inside(code) {
				if (code === marker) {
					effects.consume(code);
					return inside;
				}
				effects.exit("setextHeadingLineSequence");
				return markdownSpace(code) ? factorySpace(effects, after, "lineSuffix")(code) : after(code);
			}
			/**
			* After sequence, after optional whitespace.
			*
			* ```markdown
			*   | aa
			* > | ==
			*       ^
			* ```
			*
			* @type {State}
			*/
			function after(code) {
				if (code === null || markdownLineEnding(code)) {
					effects.exit("setextHeadingLine");
					return ok(code);
				}
				return nok(code);
			}
		}
		//#endregion
		//#region node_modules/micromark/lib/initialize/flow.js
		/**
		* @import {
		*   InitialConstruct,
		*   Initializer,
		*   State,
		*   TokenizeContext
		* } from 'micromark-util-types'
		*/
		/** @type {InitialConstruct} */
		const flow$1 = { tokenize: initializeFlow };
		/**
		* @this {TokenizeContext}
		*   Self.
		* @type {Initializer}
		*   Initializer.
		*/
		function initializeFlow(effects) {
			const self = this;
			const initial = effects.attempt(blankLine, atBlankEnding, effects.attempt(this.parser.constructs.flowInitial, afterConstruct, factorySpace(effects, effects.attempt(this.parser.constructs.flow, afterConstruct, effects.attempt(content, afterConstruct)), "linePrefix")));
			return initial;
			/** @type {State} */
			function atBlankEnding(code) {
				if (code === null) {
					effects.consume(code);
					return;
				}
				effects.enter("lineEndingBlank");
				effects.consume(code);
				effects.exit("lineEndingBlank");
				self.currentConstruct = void 0;
				return initial;
			}
			/** @type {State} */
			function afterConstruct(code) {
				if (code === null) {
					effects.consume(code);
					return;
				}
				effects.enter("lineEnding");
				effects.consume(code);
				effects.exit("lineEnding");
				self.currentConstruct = void 0;
				return initial;
			}
		}
		//#endregion
		//#region node_modules/micromark/lib/initialize/text.js
		/**
		* @import {
		*   Code,
		*   InitialConstruct,
		*   Initializer,
		*   Resolver,
		*   State,
		*   TokenizeContext
		* } from 'micromark-util-types'
		*/
		const resolver = { resolveAll: createResolver() };
		const string$3 = initializeFactory("string");
		const text$4 = initializeFactory("text");
		/**
		* @param {'string' | 'text'} field
		*   Field.
		* @returns {InitialConstruct}
		*   Construct.
		*/
		function initializeFactory(field) {
			return {
				resolveAll: createResolver(field === "text" ? resolveAllLineSuffixes : void 0),
				tokenize: initializeText
			};
			/**
			* @this {TokenizeContext}
			*   Context.
			* @type {Initializer}
			*/
			function initializeText(effects) {
				const self = this;
				const constructs = this.parser.constructs[field];
				const text = effects.attempt(constructs, start, notText);
				return start;
				/** @type {State} */
				function start(code) {
					return atBreak(code) ? text(code) : notText(code);
				}
				/** @type {State} */
				function notText(code) {
					if (code === null) {
						effects.consume(code);
						return;
					}
					effects.enter("data");
					effects.consume(code);
					return data;
				}
				/** @type {State} */
				function data(code) {
					if (atBreak(code)) {
						effects.exit("data");
						return text(code);
					}
					effects.consume(code);
					return data;
				}
				/**
				* @param {Code} code
				*   Code.
				* @returns {boolean}
				*   Whether the code is a break.
				*/
				function atBreak(code) {
					if (code === null) return true;
					const list = constructs[code];
					let index = -1;
					if (list) while (++index < list.length) {
						const item = list[index];
						if (!item.previous || item.previous.call(self, self.previous)) return true;
					}
					return false;
				}
			}
		}
		/**
		* @param {Resolver | undefined} [extraResolver]
		*   Resolver.
		* @returns {Resolver}
		*   Resolver.
		*/
		function createResolver(extraResolver) {
			return resolveAllText;
			/** @type {Resolver} */
			function resolveAllText(events, context) {
				let index = -1;
				/** @type {number | undefined} */
				let enter;
				while (++index <= events.length) if (enter === void 0) {
					if (events[index] && events[index][1].type === "data") {
						enter = index;
						index++;
					}
				} else if (!events[index] || events[index][1].type !== "data") {
					if (index !== enter + 2) {
						events[enter][1].end = events[index - 1][1].end;
						events.splice(enter + 2, index - enter - 2);
						index = enter + 2;
					}
					enter = void 0;
				}
				return extraResolver ? extraResolver(events, context) : events;
			}
		}
		/**
		* A rather ugly set of instructions which again looks at chunks in the input
		* stream.
		* The reason to do this here is that it is *much* faster to parse in reverse.
		* And that we can’t hook into `null` to split the line suffix before an EOF.
		* To do: figure out if we can make this into a clean utility, or even in core.
		* As it will be useful for GFMs literal autolink extension (and maybe even
		* tables?)
		*
		* @type {Resolver}
		*/
		function resolveAllLineSuffixes(events, context) {
			let eventIndex = 0;
			while (++eventIndex <= events.length) if ((eventIndex === events.length || events[eventIndex][1].type === "lineEnding") && events[eventIndex - 1][1].type === "data") {
				const data = events[eventIndex - 1][1];
				const chunks = context.sliceStream(data);
				let index = chunks.length;
				let bufferIndex = -1;
				let size = 0;
				/** @type {boolean | undefined} */
				let tabs;
				while (index--) {
					const chunk = chunks[index];
					if (typeof chunk === "string") {
						bufferIndex = chunk.length;
						while (chunk.charCodeAt(bufferIndex - 1) === 32) {
							size++;
							bufferIndex--;
						}
						if (bufferIndex) break;
						bufferIndex = -1;
					} else if (chunk === -2) {
						tabs = true;
						size++;
					} else if (chunk === -1) {} else {
						index++;
						break;
					}
				}
				if (context._contentTypeTextTrailing && eventIndex === events.length) size = 0;
				if (size) {
					const token = {
						type: eventIndex === events.length || tabs || size < 2 ? "lineSuffix" : "hardBreakTrailing",
						start: {
							_bufferIndex: index ? bufferIndex : data.start._bufferIndex + bufferIndex,
							_index: data.start._index + index,
							line: data.end.line,
							column: data.end.column - size,
							offset: data.end.offset - size
						},
						end: { ...data.end }
					};
					data.end = { ...token.start };
					if (data.start.offset === data.end.offset) Object.assign(data, token);
					else {
						events.splice(eventIndex, 0, [
							"enter",
							token,
							context
						], [
							"exit",
							token,
							context
						]);
						eventIndex += 2;
					}
				}
				eventIndex++;
			}
			return events;
		}
		//#endregion
		//#region node_modules/micromark/lib/constructs.js
		/**
		* @import {Extension} from 'micromark-util-types'
		*/
		var constructs_exports = /* @__PURE__ */ __exportAll({
			attentionMarkers: () => attentionMarkers,
			contentInitial: () => contentInitial,
			disable: () => disable,
			document: () => document$1,
			flow: () => flow,
			flowInitial: () => flowInitial,
			insideSpan: () => insideSpan,
			string: () => string$2,
			text: () => text$3
		});
		/** @satisfies {Extension['document']} */
		const document$1 = {
			[42]: list$2,
			[43]: list$2,
			[45]: list$2,
			[48]: list$2,
			[49]: list$2,
			[50]: list$2,
			[51]: list$2,
			[52]: list$2,
			[53]: list$2,
			[54]: list$2,
			[55]: list$2,
			[56]: list$2,
			[57]: list$2,
			[62]: blockQuote
		};
		/** @satisfies {Extension['contentInitial']} */
		const contentInitial = { [91]: definition$1 };
		/** @satisfies {Extension['flowInitial']} */
		const flowInitial = {
			[-2]: codeIndented,
			[-1]: codeIndented,
			[32]: codeIndented
		};
		/** @satisfies {Extension['flow']} */
		const flow = {
			[35]: headingAtx,
			[42]: thematicBreak$2,
			[45]: [setextUnderline, thematicBreak$2],
			[60]: htmlFlow,
			[61]: setextUnderline,
			[95]: thematicBreak$2,
			[96]: codeFenced,
			[126]: codeFenced
		};
		/** @satisfies {Extension['string']} */
		const string$2 = {
			[38]: characterReference,
			[92]: characterEscape
		};
		/** @satisfies {Extension['text']} */
		const text$3 = {
			[-5]: lineEnding,
			[-4]: lineEnding,
			[-3]: lineEnding,
			[33]: labelStartImage,
			[38]: characterReference,
			[42]: attention,
			[60]: [autolink, htmlText],
			[91]: labelStartLink,
			[92]: [hardBreakEscape, characterEscape],
			[93]: labelEnd,
			[95]: attention,
			[96]: codeText
		};
		/** @satisfies {Extension['insideSpan']} */
		const insideSpan = { null: [attention, resolver] };
		/** @satisfies {Extension['attentionMarkers']} */
		const attentionMarkers = { null: [42, 95] };
		/** @satisfies {Extension['disable']} */
		const disable = { null: [] };
		//#endregion
		//#region node_modules/micromark/lib/create-tokenizer.js
		/**
		* @import {
		*   Chunk,
		*   Code,
		*   ConstructRecord,
		*   Construct,
		*   Effects,
		*   InitialConstruct,
		*   ParseContext,
		*   Point,
		*   State,
		*   TokenizeContext,
		*   Token
		* } from 'micromark-util-types'
		*/
		/**
		* @callback Restore
		*   Restore the state.
		* @returns {undefined}
		*   Nothing.
		*
		* @typedef Info
		*   Info.
		* @property {Restore} restore
		*   Restore.
		* @property {number} from
		*   From.
		*
		* @callback ReturnHandle
		*   Handle a successful run.
		* @param {Construct} construct
		*   Construct.
		* @param {Info} info
		*   Info.
		* @returns {undefined}
		*   Nothing.
		*/
		/**
		* Create a tokenizer.
		* Tokenizers deal with one type of data (e.g., containers, flow, text).
		* The parser is the object dealing with it all.
		* `initialize` works like other constructs, except that only its `tokenize`
		* function is used, in which case it doesn’t receive an `ok` or `nok`.
		* `from` can be given to set the point before the first character, although
		* when further lines are indented, they must be set with `defineSkip`.
		*
		* @param {ParseContext} parser
		*   Parser.
		* @param {InitialConstruct} initialize
		*   Construct.
		* @param {Omit<Point, '_bufferIndex' | '_index'> | undefined} [from]
		*   Point (optional).
		* @returns {TokenizeContext}
		*   Context.
		*/
		function createTokenizer(parser, initialize, from) {
			/** @type {Point} */
			let point = {
				_bufferIndex: -1,
				_index: 0,
				line: from && from.line || 1,
				column: from && from.column || 1,
				offset: from && from.offset || 0
			};
			/** @type {Record<string, number>} */
			const columnStart = {};
			/** @type {Array<Construct>} */
			const resolveAllConstructs = [];
			/** @type {Array<Chunk>} */
			let chunks = [];
			/** @type {Array<Token>} */
			let stack = [];
			/**
			* Tools used for tokenizing.
			*
			* @type {Effects}
			*/
			const effects = {
				attempt: constructFactory(onsuccessfulconstruct),
				check: constructFactory(onsuccessfulcheck),
				consume,
				enter,
				exit,
				interrupt: constructFactory(onsuccessfulcheck, { interrupt: true })
			};
			/**
			* State and tools for resolving and serializing.
			*
			* @type {TokenizeContext}
			*/
			const context = {
				code: null,
				containerState: {},
				defineSkip,
				events: [],
				now,
				parser,
				previous: null,
				sliceSerialize,
				sliceStream,
				write
			};
			/**
			* The state function.
			*
			* @type {State | undefined}
			*/
			let state = initialize.tokenize.call(context, effects);
			if (initialize.resolveAll) resolveAllConstructs.push(initialize);
			return context;
			/** @type {TokenizeContext['write']} */
			function write(slice) {
				chunks = push(chunks, slice);
				main();
				if (chunks[chunks.length - 1] !== null) return [];
				addResult(initialize, 0);
				context.events = resolveAll(resolveAllConstructs, context.events, context);
				return context.events;
			}
			/** @type {TokenizeContext['sliceSerialize']} */
			function sliceSerialize(token, expandTabs) {
				return serializeChunks(sliceStream(token), expandTabs);
			}
			/** @type {TokenizeContext['sliceStream']} */
			function sliceStream(token) {
				return sliceChunks(chunks, token);
			}
			/** @type {TokenizeContext['now']} */
			function now() {
				const { _bufferIndex, _index, line, column, offset } = point;
				return {
					_bufferIndex,
					_index,
					line,
					column,
					offset
				};
			}
			/** @type {TokenizeContext['defineSkip']} */
			function defineSkip(value) {
				columnStart[value.line] = value.column;
				accountForPotentialSkip();
			}
			/**
			* Main loop (note that `_index` and `_bufferIndex` in `point` are modified by
			* `consume`).
			* Here is where we walk through the chunks, which either include strings of
			* several characters, or numerical character codes.
			* The reason to do this in a loop instead of a call is so the stack can
			* drain.
			*
			* @returns {undefined}
			*   Nothing.
			*/
			function main() {
				/** @type {number} */
				let chunkIndex;
				while (point._index < chunks.length) {
					const chunk = chunks[point._index];
					if (typeof chunk === "string") {
						chunkIndex = point._index;
						if (point._bufferIndex < 0) point._bufferIndex = 0;
						while (point._index === chunkIndex && point._bufferIndex < chunk.length) go(chunk.charCodeAt(point._bufferIndex));
					} else go(chunk);
				}
			}
			/**
			* Deal with one code.
			*
			* @param {Code} code
			*   Code.
			* @returns {undefined}
			*   Nothing.
			*/
			function go(code) {
				state = state(code);
			}
			/** @type {Effects['consume']} */
			function consume(code) {
				if (markdownLineEnding(code)) {
					point.line++;
					point.column = 1;
					point.offset += code === -3 ? 2 : 1;
					accountForPotentialSkip();
				} else if (code !== -1) {
					point.column++;
					point.offset++;
				}
				if (point._bufferIndex < 0) point._index++;
				else {
					point._bufferIndex++;
					if (point._bufferIndex === chunks[point._index].length) {
						point._bufferIndex = -1;
						point._index++;
					}
				}
				context.previous = code;
			}
			/** @type {Effects['enter']} */
			function enter(type, fields) {
				/** @type {Token} */
				const token = fields || {};
				token.type = type;
				token.start = now();
				context.events.push([
					"enter",
					token,
					context
				]);
				stack.push(token);
				return token;
			}
			/** @type {Effects['exit']} */
			function exit(type) {
				const token = stack.pop();
				token.end = now();
				context.events.push([
					"exit",
					token,
					context
				]);
				return token;
			}
			/**
			* Use results.
			*
			* @type {ReturnHandle}
			*/
			function onsuccessfulconstruct(construct, info) {
				addResult(construct, info.from);
			}
			/**
			* Discard results.
			*
			* @type {ReturnHandle}
			*/
			function onsuccessfulcheck(_, info) {
				info.restore();
			}
			/**
			* Factory to attempt/check/interrupt.
			*
			* @param {ReturnHandle} onreturn
			*   Callback.
			* @param {{interrupt?: boolean | undefined} | undefined} [fields]
			*   Fields.
			*/
			function constructFactory(onreturn, fields) {
				return hook;
				/**
				* Handle either an object mapping codes to constructs, a list of
				* constructs, or a single construct.
				*
				* @param {Array<Construct> | ConstructRecord | Construct} constructs
				*   Constructs.
				* @param {State} returnState
				*   State.
				* @param {State | undefined} [bogusState]
				*   State.
				* @returns {State}
				*   State.
				*/
				function hook(constructs, returnState, bogusState) {
					/** @type {ReadonlyArray<Construct>} */
					let listOfConstructs;
					/** @type {number} */
					let constructIndex;
					/** @type {Construct} */
					let currentConstruct;
					/** @type {Info} */
					let info;
					return Array.isArray(constructs) ? handleListOfConstructs(constructs) : "tokenize" in constructs ? handleListOfConstructs([constructs]) : handleMapOfConstructs(constructs);
					/**
					* Handle a list of construct.
					*
					* @param {ConstructRecord} map
					*   Constructs.
					* @returns {State}
					*   State.
					*/
					function handleMapOfConstructs(map) {
						return start;
						/** @type {State} */
						function start(code) {
							const left = code !== null && map[code];
							const all = code !== null && map.null;
							return handleListOfConstructs([...Array.isArray(left) ? left : left ? [left] : [], ...Array.isArray(all) ? all : all ? [all] : []])(code);
						}
					}
					/**
					* Handle a list of construct.
					*
					* @param {ReadonlyArray<Construct>} list
					*   Constructs.
					* @returns {State}
					*   State.
					*/
					function handleListOfConstructs(list) {
						listOfConstructs = list;
						constructIndex = 0;
						if (list.length === 0) return bogusState;
						return handleConstruct(list[constructIndex]);
					}
					/**
					* Handle a single construct.
					*
					* @param {Construct} construct
					*   Construct.
					* @returns {State}
					*   State.
					*/
					function handleConstruct(construct) {
						return start;
						/** @type {State} */
						function start(code) {
							info = store();
							currentConstruct = construct;
							if (!construct.partial) context.currentConstruct = construct;
							if (construct.name && context.parser.constructs.disable.null.includes(construct.name)) return nok(code);
							return construct.tokenize.call(fields ? Object.assign(Object.create(context), fields) : context, effects, ok, nok)(code);
						}
					}
					/** @type {State} */
					function ok(code) {
						onreturn(currentConstruct, info);
						return returnState;
					}
					/** @type {State} */
					function nok(code) {
						info.restore();
						if (++constructIndex < listOfConstructs.length) return handleConstruct(listOfConstructs[constructIndex]);
						return bogusState;
					}
				}
			}
			/**
			* @param {Construct} construct
			*   Construct.
			* @param {number} from
			*   From.
			* @returns {undefined}
			*   Nothing.
			*/
			function addResult(construct, from) {
				if (construct.resolveAll && !resolveAllConstructs.includes(construct)) resolveAllConstructs.push(construct);
				if (construct.resolve) splice(context.events, from, context.events.length - from, construct.resolve(context.events.slice(from), context));
				if (construct.resolveTo) context.events = construct.resolveTo(context.events, context);
			}
			/**
			* Store state.
			*
			* @returns {Info}
			*   Info.
			*/
			function store() {
				const startPoint = now();
				const startPrevious = context.previous;
				const startCurrentConstruct = context.currentConstruct;
				const startEventsIndex = context.events.length;
				const startStack = Array.from(stack);
				return {
					from: startEventsIndex,
					restore
				};
				/**
				* Restore state.
				*
				* @returns {undefined}
				*   Nothing.
				*/
				function restore() {
					point = startPoint;
					context.previous = startPrevious;
					context.currentConstruct = startCurrentConstruct;
					context.events.length = startEventsIndex;
					stack = startStack;
					accountForPotentialSkip();
				}
			}
			/**
			* Move the current point a bit forward in the line when it’s on a column
			* skip.
			*
			* @returns {undefined}
			*   Nothing.
			*/
			function accountForPotentialSkip() {
				if (point.line in columnStart && point.column < 2) {
					point.column = columnStart[point.line];
					point.offset += columnStart[point.line] - 1;
				}
			}
		}
		/**
		* Get the chunks from a slice of chunks in the range of a token.
		*
		* @param {ReadonlyArray<Chunk>} chunks
		*   Chunks.
		* @param {Pick<Token, 'end' | 'start'>} token
		*   Token.
		* @returns {Array<Chunk>}
		*   Chunks.
		*/
		function sliceChunks(chunks, token) {
			const startIndex = token.start._index;
			const startBufferIndex = token.start._bufferIndex;
			const endIndex = token.end._index;
			const endBufferIndex = token.end._bufferIndex;
			/** @type {Array<Chunk>} */
			let view;
			if (startIndex === endIndex) view = [chunks[startIndex].slice(startBufferIndex, endBufferIndex)];
			else {
				view = chunks.slice(startIndex, endIndex);
				if (startBufferIndex > -1) {
					const head = view[0];
					if (typeof head === "string") view[0] = head.slice(startBufferIndex);
					else view.shift();
				}
				if (endBufferIndex > 0) view.push(chunks[endIndex].slice(0, endBufferIndex));
			}
			return view;
		}
		/**
		* Get the string value of a slice of chunks.
		*
		* @param {ReadonlyArray<Chunk>} chunks
		*   Chunks.
		* @param {boolean | undefined} [expandTabs=false]
		*   Whether to expand tabs (default: `false`).
		* @returns {string}
		*   Result.
		*/
		function serializeChunks(chunks, expandTabs) {
			let index = -1;
			/** @type {Array<string>} */
			const result = [];
			/** @type {boolean | undefined} */
			let atTab;
			while (++index < chunks.length) {
				const chunk = chunks[index];
				/** @type {string} */
				let value;
				if (typeof chunk === "string") value = chunk;
				else switch (chunk) {
					case -5:
						value = "\r";
						break;
					case -4:
						value = "\n";
						break;
					case -3:
						value = "\r\n";
						break;
					case -2:
						value = expandTabs ? " " : "	";
						break;
					case -1:
						if (!expandTabs && atTab) continue;
						value = " ";
						break;
					default: value = String.fromCharCode(chunk);
				}
				atTab = chunk === -2;
				result.push(value);
			}
			return result.join("");
		}
		//#endregion
		//#region node_modules/micromark/lib/parse.js
		/**
		* @import {
		*   Create,
		*   FullNormalizedExtension,
		*   InitialConstruct,
		*   ParseContext,
		*   ParseOptions
		* } from 'micromark-util-types'
		*/
		/**
		* @param {ParseOptions | null | undefined} [options]
		*   Configuration (optional).
		* @returns {ParseContext}
		*   Parser.
		*/
		function parse$1(options) {
			/** @type {ParseContext} */
			const parser = {
				constructs: combineExtensions([constructs_exports, ...(options || {}).extensions || []]),
				content: create(content$1),
				defined: [],
				document: create(document$2),
				flow: create(flow$1),
				lazy: {},
				string: create(string$3),
				text: create(text$4)
			};
			return parser;
			/**
			* @param {InitialConstruct} initial
			*   Construct to start with.
			* @returns {Create}
			*   Create a tokenizer.
			*/
			function create(initial) {
				return creator;
				/** @type {Create} */
				function creator(from) {
					return createTokenizer(parser, initial, from);
				}
			}
		}
		//#endregion
		//#region node_modules/micromark/lib/postprocess.js
		/**
		* @import {Event} from 'micromark-util-types'
		*/
		/**
		* @param {Array<Event>} events
		*   Events.
		* @returns {Array<Event>}
		*   Events.
		*/
		function postprocess(events) {
			while (!subtokenize(events));
			return events;
		}
		//#endregion
		//#region node_modules/micromark/lib/preprocess.js
		/**
		* @import {Chunk, Code, Encoding, Value} from 'micromark-util-types'
		*/
		/**
		* @callback Preprocessor
		*   Preprocess a value.
		* @param {Value} value
		*   Value.
		* @param {Encoding | null | undefined} [encoding]
		*   Encoding when `value` is a typed array (optional).
		* @param {boolean | null | undefined} [end=false]
		*   Whether this is the last chunk (default: `false`).
		* @returns {Array<Chunk>}
		*   Chunks.
		*/
		const search = /[\0\t\n\r]/g;
		/**
		* @returns {Preprocessor}
		*   Preprocess a value.
		*/
		function preprocess() {
			let column = 1;
			let buffer = "";
			/** @type {boolean | undefined} */
			let start = true;
			/** @type {boolean | undefined} */
			let atCarriageReturn;
			return preprocessor;
			/** @type {Preprocessor} */
			function preprocessor(value, encoding, end) {
				/** @type {Array<Chunk>} */
				const chunks = [];
				/** @type {RegExpMatchArray | null} */
				let match;
				/** @type {number} */
				let next;
				/** @type {number} */
				let startPosition;
				/** @type {number} */
				let endPosition;
				/** @type {Code} */
				let code;
				value = buffer + (typeof value === "string" ? value.toString() : new TextDecoder(encoding || void 0).decode(value));
				startPosition = 0;
				buffer = "";
				if (start) {
					if (value.charCodeAt(0) === 65279) startPosition++;
					start = void 0;
				}
				while (startPosition < value.length) {
					search.lastIndex = startPosition;
					match = search.exec(value);
					endPosition = match && match.index !== void 0 ? match.index : value.length;
					code = value.charCodeAt(endPosition);
					if (!match) {
						buffer = value.slice(startPosition);
						break;
					}
					if (code === 10 && startPosition === endPosition && atCarriageReturn) {
						chunks.push(-3);
						atCarriageReturn = void 0;
					} else {
						if (atCarriageReturn) {
							chunks.push(-5);
							atCarriageReturn = void 0;
						}
						if (startPosition < endPosition) {
							chunks.push(value.slice(startPosition, endPosition));
							column += endPosition - startPosition;
						}
						switch (code) {
							case 0:
								chunks.push(65533);
								column++;
								break;
							case 9:
								next = Math.ceil(column / 4) * 4;
								chunks.push(-2);
								while (column++ < next) chunks.push(-1);
								break;
							case 10:
								chunks.push(-4);
								column = 1;
								break;
							default:
								atCarriageReturn = true;
								column = 1;
						}
					}
					startPosition = endPosition + 1;
				}
				if (end) {
					if (atCarriageReturn) chunks.push(-5);
					if (buffer) chunks.push(buffer);
					chunks.push(null);
				}
				return chunks;
			}
		}
		//#endregion
		//#region node_modules/micromark-util-decode-string/index.js
		const characterEscapeOrReference = /\\([!-/:-@[-`{-~])|&(#(?:\d{1,7}|x[\da-f]{1,6})|[\da-z]{1,31});/gi;
		/**
		* Decode markdown strings (which occur in places such as fenced code info
		* strings, destinations, labels, and titles).
		*
		* The “string” content type allows character escapes and -references.
		* This decodes those.
		*
		* @param {string} value
		*   Value to decode.
		* @returns {string}
		*   Decoded value.
		*/
		function decodeString(value) {
			return value.replace(characterEscapeOrReference, decode$1);
		}
		/**
		* @param {string} $0
		*   Match.
		* @param {string} $1
		*   Character escape.
		* @param {string} $2
		*   Character reference.
		* @returns {string}
		*   Decoded value
		*/
		function decode$1($0, $1, $2) {
			if ($1) return $1;
			if ($2.charCodeAt(0) === 35) {
				const head = $2.charCodeAt(1);
				const hex = head === 120 || head === 88;
				return decodeNumericCharacterReference($2.slice(hex ? 2 : 1), hex ? 16 : 10);
			}
			return decodeNamedCharacterReference($2) || $0;
		}
		//#endregion
		//#region node_modules/mdast-util-from-markdown/lib/index.js
		/**
		* @import {
		*   Break,
		*   Blockquote,
		*   Code,
		*   Definition,
		*   Emphasis,
		*   Heading,
		*   Html,
		*   Image,
		*   InlineCode,
		*   Link,
		*   ListItem,
		*   List,
		*   Nodes,
		*   Paragraph,
		*   PhrasingContent,
		*   ReferenceType,
		*   Root,
		*   Strong,
		*   Text,
		*   ThematicBreak
		* } from 'mdast'
		* @import {
		*   Encoding,
		*   Event,
		*   Token,
		*   Value
		* } from 'micromark-util-types'
		* @import {Point} from 'unist'
		* @import {
		*   CompileContext,
		*   CompileData,
		*   Config,
		*   Extension,
		*   Handle,
		*   OnEnterError,
		*   Options
		* } from './types.js'
		*/
		const own$3 = {}.hasOwnProperty;
		/**
		* Turn markdown into a syntax tree.
		*
		* @overload
		* @param {Value} value
		* @param {Encoding | null | undefined} [encoding]
		* @param {Options | null | undefined} [options]
		* @returns {Root}
		*
		* @overload
		* @param {Value} value
		* @param {Options | null | undefined} [options]
		* @returns {Root}
		*
		* @param {Value} value
		*   Markdown to parse.
		* @param {Encoding | Options | null | undefined} [encoding]
		*   Character encoding for when `value` is `Buffer`.
		* @param {Options | null | undefined} [options]
		*   Configuration.
		* @returns {Root}
		*   mdast tree.
		*/
		function fromMarkdown(value, encoding, options) {
			if (encoding && typeof encoding === "object") {
				options = encoding;
				encoding = void 0;
			}
			return compiler(options)(postprocess(parse$1(options).document().write(preprocess()(value, encoding, true))));
		}
		/**
		* Note this compiler only understand complete buffering, not streaming.
		*
		* @param {Options | null | undefined} [options]
		*/
		function compiler(options) {
			/** @type {Config} */
			const config = {
				transforms: [],
				canContainEols: [
					"emphasis",
					"fragment",
					"heading",
					"paragraph",
					"strong"
				],
				enter: {
					autolink: opener(link),
					autolinkProtocol: onenterdata,
					autolinkEmail: onenterdata,
					atxHeading: opener(heading),
					blockQuote: opener(blockQuote),
					characterEscape: onenterdata,
					characterReference: onenterdata,
					codeFenced: opener(codeFlow),
					codeFencedFenceInfo: buffer,
					codeFencedFenceMeta: buffer,
					codeIndented: opener(codeFlow, buffer),
					codeText: opener(codeText, buffer),
					codeTextData: onenterdata,
					data: onenterdata,
					codeFlowValue: onenterdata,
					definition: opener(definition),
					definitionDestinationString: buffer,
					definitionLabelString: buffer,
					definitionTitleString: buffer,
					emphasis: opener(emphasis),
					hardBreakEscape: opener(hardBreak),
					hardBreakTrailing: opener(hardBreak),
					htmlFlow: opener(html, buffer),
					htmlFlowData: onenterdata,
					htmlText: opener(html, buffer),
					htmlTextData: onenterdata,
					image: opener(image),
					label: buffer,
					link: opener(link),
					listItem: opener(listItem),
					listItemValue: onenterlistitemvalue,
					listOrdered: opener(list, onenterlistordered),
					listUnordered: opener(list),
					paragraph: opener(paragraph),
					reference: onenterreference,
					referenceString: buffer,
					resourceDestinationString: buffer,
					resourceTitleString: buffer,
					setextHeading: opener(heading),
					strong: opener(strong),
					thematicBreak: opener(thematicBreak)
				},
				exit: {
					atxHeading: closer(),
					atxHeadingSequence: onexitatxheadingsequence,
					autolink: closer(),
					autolinkEmail: onexitautolinkemail,
					autolinkProtocol: onexitautolinkprotocol,
					blockQuote: closer(),
					characterEscapeValue: onexitdata,
					characterReferenceMarkerHexadecimal: onexitcharacterreferencemarker,
					characterReferenceMarkerNumeric: onexitcharacterreferencemarker,
					characterReferenceValue: onexitcharacterreferencevalue,
					characterReference: onexitcharacterreference,
					codeFenced: closer(onexitcodefenced),
					codeFencedFence: onexitcodefencedfence,
					codeFencedFenceInfo: onexitcodefencedfenceinfo,
					codeFencedFenceMeta: onexitcodefencedfencemeta,
					codeFlowValue: onexitdata,
					codeIndented: closer(onexitcodeindented),
					codeText: closer(onexitcodetext),
					codeTextData: onexitdata,
					data: onexitdata,
					definition: closer(),
					definitionDestinationString: onexitdefinitiondestinationstring,
					definitionLabelString: onexitdefinitionlabelstring,
					definitionTitleString: onexitdefinitiontitlestring,
					emphasis: closer(),
					hardBreakEscape: closer(onexithardbreak),
					hardBreakTrailing: closer(onexithardbreak),
					htmlFlow: closer(onexithtmlflow),
					htmlFlowData: onexitdata,
					htmlText: closer(onexithtmltext),
					htmlTextData: onexitdata,
					image: closer(onexitimage),
					label: onexitlabel,
					labelText: onexitlabeltext,
					lineEnding: onexitlineending,
					link: closer(onexitlink),
					listItem: closer(),
					listOrdered: closer(),
					listUnordered: closer(),
					paragraph: closer(),
					referenceString: onexitreferencestring,
					resourceDestinationString: onexitresourcedestinationstring,
					resourceTitleString: onexitresourcetitlestring,
					resource: onexitresource,
					setextHeading: closer(onexitsetextheading),
					setextHeadingLineSequence: onexitsetextheadinglinesequence,
					setextHeadingText: onexitsetextheadingtext,
					strong: closer(),
					thematicBreak: closer()
				}
			};
			configure(config, (options || {}).mdastExtensions || []);
			/** @type {CompileData} */
			const data = {};
			return compile;
			/**
			* Turn micromark events into an mdast tree.
			*
			* @param {Array<Event>} events
			*   Events.
			* @returns {Root}
			*   mdast tree.
			*/
			function compile(events) {
				/** @type {Root} */
				let tree = {
					type: "root",
					children: []
				};
				/** @type {Omit<CompileContext, 'sliceSerialize'>} */
				const context = {
					stack: [tree],
					tokenStack: [],
					config,
					enter,
					exit,
					buffer,
					resume,
					data
				};
				/** @type {Array<number>} */
				const listStack = [];
				let index = -1;
				while (++index < events.length) if (events[index][1].type === "listOrdered" || events[index][1].type === "listUnordered") {
					if (events[index][0] === "enter") listStack.push(index);
					else index = prepareList(events, listStack.pop(), index);
				}
				index = -1;
				while (++index < events.length) {
					const handler = config[events[index][0]];
					if (own$3.call(handler, events[index][1].type)) handler[events[index][1].type].call(Object.assign({ sliceSerialize: events[index][2].sliceSerialize }, context), events[index][1]);
				}
				if (context.tokenStack.length > 0) {
					const tail = context.tokenStack[context.tokenStack.length - 1];
					(tail[1] || defaultOnError).call(context, void 0, tail[0]);
				}
				tree.position = {
					start: point(events.length > 0 ? events[0][1].start : {
						line: 1,
						column: 1,
						offset: 0
					}),
					end: point(events.length > 0 ? events[events.length - 2][1].end : {
						line: 1,
						column: 1,
						offset: 0
					})
				};
				index = -1;
				while (++index < config.transforms.length) tree = config.transforms[index](tree) || tree;
				return tree;
			}
			/**
			* @param {Array<Event>} events
			* @param {number} start
			* @param {number} length
			* @returns {number}
			*/
			function prepareList(events, start, length) {
				let index = start - 1;
				let containerBalance = -1;
				let listSpread = false;
				/** @type {Token | undefined} */
				let listItem;
				/** @type {number | undefined} */
				let lineIndex;
				/** @type {number | undefined} */
				let firstBlankLineIndex;
				/** @type {boolean | undefined} */
				let atMarker;
				while (++index <= length) {
					const event = events[index];
					switch (event[1].type) {
						case "listUnordered":
						case "listOrdered":
						case "blockQuote":
							if (event[0] === "enter") containerBalance++;
							else containerBalance--;
							atMarker = void 0;
							break;
						case "lineEndingBlank":
							if (event[0] === "enter") {
								if (listItem && !atMarker && !containerBalance && !firstBlankLineIndex) firstBlankLineIndex = index;
								atMarker = void 0;
							}
							break;
						case "linePrefix":
						case "listItemValue":
						case "listItemMarker":
						case "listItemPrefix":
						case "listItemPrefixWhitespace": break;
						default: atMarker = void 0;
					}
					if (!containerBalance && event[0] === "enter" && event[1].type === "listItemPrefix" || containerBalance === -1 && event[0] === "exit" && (event[1].type === "listUnordered" || event[1].type === "listOrdered")) {
						if (listItem) {
							let tailIndex = index;
							lineIndex = void 0;
							while (tailIndex--) {
								const tailEvent = events[tailIndex];
								if (tailEvent[1].type === "lineEnding" || tailEvent[1].type === "lineEndingBlank") {
									if (tailEvent[0] === "exit") continue;
									if (lineIndex) {
										events[lineIndex][1].type = "lineEndingBlank";
										listSpread = true;
									}
									tailEvent[1].type = "lineEnding";
									lineIndex = tailIndex;
								} else if (tailEvent[1].type === "linePrefix" || tailEvent[1].type === "blockQuotePrefix" || tailEvent[1].type === "blockQuotePrefixWhitespace" || tailEvent[1].type === "blockQuoteMarker" || tailEvent[1].type === "listItemIndent") {} else break;
							}
							if (firstBlankLineIndex && (!lineIndex || firstBlankLineIndex < lineIndex)) listItem._spread = true;
							listItem.end = Object.assign({}, lineIndex ? events[lineIndex][1].start : event[1].end);
							events.splice(lineIndex || index, 0, [
								"exit",
								listItem,
								event[2]
							]);
							index++;
							length++;
						}
						if (event[1].type === "listItemPrefix") {
							/** @type {Token} */
							const item = {
								type: "listItem",
								_spread: false,
								start: Object.assign({}, event[1].start),
								end: void 0
							};
							listItem = item;
							events.splice(index, 0, [
								"enter",
								item,
								event[2]
							]);
							index++;
							length++;
							firstBlankLineIndex = void 0;
							atMarker = true;
						}
					}
				}
				events[start][1]._spread = listSpread;
				return length;
			}
			/**
			* Create an opener handle.
			*
			* @param {(token: Token) => Nodes} create
			*   Create a node.
			* @param {Handle | undefined} [and]
			*   Optional function to also run.
			* @returns {Handle}
			*   Handle.
			*/
			function opener(create, and) {
				return open;
				/**
				* @this {CompileContext}
				* @param {Token} token
				* @returns {undefined}
				*/
				function open(token) {
					enter.call(this, create(token), token);
					if (and) and.call(this, token);
				}
			}
			/**
			* @type {CompileContext['buffer']}
			*/
			function buffer() {
				this.stack.push({
					type: "fragment",
					children: []
				});
			}
			/**
			* @type {CompileContext['enter']}
			*/
			function enter(node, token, errorHandler) {
				this.stack[this.stack.length - 1].children.push(node);
				this.stack.push(node);
				this.tokenStack.push([token, errorHandler || void 0]);
				node.position = {
					start: point(token.start),
					end: void 0
				};
			}
			/**
			* Create a closer handle.
			*
			* @param {Handle | undefined} [and]
			*   Optional function to also run.
			* @returns {Handle}
			*   Handle.
			*/
			function closer(and) {
				return close;
				/**
				* @this {CompileContext}
				* @param {Token} token
				* @returns {undefined}
				*/
				function close(token) {
					if (and) and.call(this, token);
					exit.call(this, token);
				}
			}
			/**
			* @type {CompileContext['exit']}
			*/
			function exit(token, onExitError) {
				const node = this.stack.pop();
				const open = this.tokenStack.pop();
				if (!open) throw new Error("Cannot close `" + token.type + "` (" + stringifyPosition({
					start: token.start,
					end: token.end
				}) + "): it’s not open");
				else if (open[0].type !== token.type) {
					if (onExitError) onExitError.call(this, token, open[0]);
					else (open[1] || defaultOnError).call(this, token, open[0]);
				}
				node.position.end = point(token.end);
			}
			/**
			* @type {CompileContext['resume']}
			*/
			function resume() {
				return toString$1(this.stack.pop());
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onenterlistordered() {
				this.data.expectingFirstListItemValue = true;
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onenterlistitemvalue(token) {
				if (this.data.expectingFirstListItemValue) {
					const ancestor = this.stack[this.stack.length - 2];
					ancestor.start = Number.parseInt(this.sliceSerialize(token), 10);
					this.data.expectingFirstListItemValue = void 0;
				}
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onexitcodefencedfenceinfo() {
				const data = this.resume();
				const node = this.stack[this.stack.length - 1];
				node.lang = data;
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onexitcodefencedfencemeta() {
				const data = this.resume();
				const node = this.stack[this.stack.length - 1];
				node.meta = data;
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onexitcodefencedfence() {
				if (this.data.flowCodeInside) return;
				this.buffer();
				this.data.flowCodeInside = true;
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onexitcodefenced() {
				const data = this.resume();
				const node = this.stack[this.stack.length - 1];
				node.value = data.replace(/^(\r?\n|\r)|(\r?\n|\r)$/g, "");
				this.data.flowCodeInside = void 0;
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onexitcodeindented() {
				const data = this.resume();
				const node = this.stack[this.stack.length - 1];
				node.value = data.replace(/(\r?\n|\r)$/g, "");
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onexitdefinitionlabelstring(token) {
				const label = this.resume();
				const node = this.stack[this.stack.length - 1];
				node.label = label;
				node.identifier = normalizeIdentifier(this.sliceSerialize(token)).toLowerCase();
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onexitdefinitiontitlestring() {
				const data = this.resume();
				const node = this.stack[this.stack.length - 1];
				node.title = data;
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onexitdefinitiondestinationstring() {
				const data = this.resume();
				const node = this.stack[this.stack.length - 1];
				node.url = data;
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onexitatxheadingsequence(token) {
				const node = this.stack[this.stack.length - 1];
				if (!node.depth) node.depth = this.sliceSerialize(token).length;
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onexitsetextheadingtext() {
				this.data.setextHeadingSlurpLineEnding = true;
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onexitsetextheadinglinesequence(token) {
				const node = this.stack[this.stack.length - 1];
				node.depth = this.sliceSerialize(token).codePointAt(0) === 61 ? 1 : 2;
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onexitsetextheading() {
				this.data.setextHeadingSlurpLineEnding = void 0;
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onenterdata(token) {
				/** @type {Array<Nodes>} */
				const siblings = this.stack[this.stack.length - 1].children;
				let tail = siblings[siblings.length - 1];
				if (!tail || tail.type !== "text") {
					tail = text();
					tail.position = {
						start: point(token.start),
						end: void 0
					};
					siblings.push(tail);
				}
				this.stack.push(tail);
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onexitdata(token) {
				const tail = this.stack.pop();
				tail.value += this.sliceSerialize(token);
				tail.position.end = point(token.end);
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onexitlineending(token) {
				const context = this.stack[this.stack.length - 1];
				if (this.data.atHardBreak) {
					const tail = context.children[context.children.length - 1];
					tail.position.end = point(token.end);
					this.data.atHardBreak = void 0;
					return;
				}
				if (!this.data.setextHeadingSlurpLineEnding && config.canContainEols.includes(context.type)) {
					onenterdata.call(this, token);
					onexitdata.call(this, token);
				}
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onexithardbreak() {
				this.data.atHardBreak = true;
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onexithtmlflow() {
				const data = this.resume();
				const node = this.stack[this.stack.length - 1];
				node.value = data;
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onexithtmltext() {
				const data = this.resume();
				const node = this.stack[this.stack.length - 1];
				node.value = data;
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onexitcodetext() {
				const data = this.resume();
				const node = this.stack[this.stack.length - 1];
				node.value = data;
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onexitlink() {
				const node = this.stack[this.stack.length - 1];
				if (this.data.inReference) {
					/** @type {ReferenceType} */
					const referenceType = this.data.referenceType || "shortcut";
					node.type += "Reference";
					node.referenceType = referenceType;
					delete node.url;
					delete node.title;
				} else {
					delete node.identifier;
					delete node.label;
				}
				this.data.referenceType = void 0;
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onexitimage() {
				const node = this.stack[this.stack.length - 1];
				if (this.data.inReference) {
					/** @type {ReferenceType} */
					const referenceType = this.data.referenceType || "shortcut";
					node.type += "Reference";
					node.referenceType = referenceType;
					delete node.url;
					delete node.title;
				} else {
					delete node.identifier;
					delete node.label;
				}
				this.data.referenceType = void 0;
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onexitlabeltext(token) {
				const string = this.sliceSerialize(token);
				const ancestor = this.stack[this.stack.length - 2];
				ancestor.label = decodeString(string);
				ancestor.identifier = normalizeIdentifier(string).toLowerCase();
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onexitlabel() {
				const fragment = this.stack[this.stack.length - 1];
				const value = this.resume();
				const node = this.stack[this.stack.length - 1];
				this.data.inReference = true;
				if (node.type === "link") node.children = fragment.children;
				else node.alt = value;
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onexitresourcedestinationstring() {
				const data = this.resume();
				const node = this.stack[this.stack.length - 1];
				node.url = data;
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onexitresourcetitlestring() {
				const data = this.resume();
				const node = this.stack[this.stack.length - 1];
				node.title = data;
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onexitresource() {
				this.data.inReference = void 0;
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onenterreference() {
				this.data.referenceType = "collapsed";
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onexitreferencestring(token) {
				const label = this.resume();
				const node = this.stack[this.stack.length - 1];
				node.label = label;
				node.identifier = normalizeIdentifier(this.sliceSerialize(token)).toLowerCase();
				this.data.referenceType = "full";
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onexitcharacterreferencemarker(token) {
				this.data.characterReferenceType = token.type;
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onexitcharacterreferencevalue(token) {
				const data = this.sliceSerialize(token);
				const type = this.data.characterReferenceType;
				/** @type {string} */
				let value;
				if (type) {
					value = decodeNumericCharacterReference(data, type === "characterReferenceMarkerNumeric" ? 10 : 16);
					this.data.characterReferenceType = void 0;
				} else value = decodeNamedCharacterReference(data);
				const tail = this.stack[this.stack.length - 1];
				tail.value += value;
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onexitcharacterreference(token) {
				const tail = this.stack.pop();
				tail.position.end = point(token.end);
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onexitautolinkprotocol(token) {
				onexitdata.call(this, token);
				const node = this.stack[this.stack.length - 1];
				node.url = this.sliceSerialize(token);
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onexitautolinkemail(token) {
				onexitdata.call(this, token);
				const node = this.stack[this.stack.length - 1];
				node.url = "mailto:" + this.sliceSerialize(token);
			}
			/** @returns {Blockquote} */
			function blockQuote() {
				return {
					type: "blockquote",
					children: []
				};
			}
			/** @returns {Code} */
			function codeFlow() {
				return {
					type: "code",
					lang: null,
					meta: null,
					value: ""
				};
			}
			/** @returns {InlineCode} */
			function codeText() {
				return {
					type: "inlineCode",
					value: ""
				};
			}
			/** @returns {Definition} */
			function definition() {
				return {
					type: "definition",
					identifier: "",
					label: null,
					title: null,
					url: ""
				};
			}
			/** @returns {Emphasis} */
			function emphasis() {
				return {
					type: "emphasis",
					children: []
				};
			}
			/** @returns {Heading} */
			function heading() {
				return {
					type: "heading",
					depth: 0,
					children: []
				};
			}
			/** @returns {Break} */
			function hardBreak() {
				return { type: "break" };
			}
			/** @returns {Html} */
			function html() {
				return {
					type: "html",
					value: ""
				};
			}
			/** @returns {Image} */
			function image() {
				return {
					type: "image",
					title: null,
					url: "",
					alt: null
				};
			}
			/** @returns {Link} */
			function link() {
				return {
					type: "link",
					title: null,
					url: "",
					children: []
				};
			}
			/**
			* @param {Token} token
			* @returns {List}
			*/
			function list(token) {
				return {
					type: "list",
					ordered: token.type === "listOrdered",
					start: null,
					spread: token._spread,
					children: []
				};
			}
			/**
			* @param {Token} token
			* @returns {ListItem}
			*/
			function listItem(token) {
				return {
					type: "listItem",
					spread: token._spread,
					checked: null,
					children: []
				};
			}
			/** @returns {Paragraph} */
			function paragraph() {
				return {
					type: "paragraph",
					children: []
				};
			}
			/** @returns {Strong} */
			function strong() {
				return {
					type: "strong",
					children: []
				};
			}
			/** @returns {Text} */
			function text() {
				return {
					type: "text",
					value: ""
				};
			}
			/** @returns {ThematicBreak} */
			function thematicBreak() {
				return { type: "thematicBreak" };
			}
		}
		/**
		* Copy a point-like value.
		*
		* @param {Point} d
		*   Point-like value.
		* @returns {Point}
		*   unist point.
		*/
		function point(d) {
			return {
				line: d.line,
				column: d.column,
				offset: d.offset
			};
		}
		/**
		* @param {Config} combined
		* @param {Array<Array<Extension> | Extension>} extensions
		* @returns {undefined}
		*/
		function configure(combined, extensions) {
			let index = -1;
			while (++index < extensions.length) {
				const value = extensions[index];
				if (Array.isArray(value)) configure(combined, value);
				else extension(combined, value);
			}
		}
		/**
		* @param {Config} combined
		* @param {Extension} extension
		* @returns {undefined}
		*/
		function extension(combined, extension) {
			/** @type {keyof Extension} */
			let key;
			for (key in extension) if (own$3.call(extension, key)) switch (key) {
				case "canContainEols": {
					const right = extension[key];
					if (right) combined[key].push(...right);
					break;
				}
				case "transforms": {
					const right = extension[key];
					if (right) combined[key].push(...right);
					break;
				}
				case "enter":
				case "exit": {
					const right = extension[key];
					if (right) Object.assign(combined[key], right);
					break;
				}
			}
		}
		/** @type {OnEnterError} */
		function defaultOnError(left, right) {
			if (left) throw new Error("Cannot close `" + left.type + "` (" + stringifyPosition({
				start: left.start,
				end: left.end
			}) + "): a different token (`" + right.type + "`, " + stringifyPosition({
				start: right.start,
				end: right.end
			}) + ") is open");
			else throw new Error("Cannot close document, a token (`" + right.type + "`, " + stringifyPosition({
				start: right.start,
				end: right.end
			}) + ") is still open");
		}
		//#endregion
		//#region node_modules/remark-parse/lib/index.js
		/**
		* @typedef {import('mdast').Root} Root
		* @typedef {import('mdast-util-from-markdown').Options} FromMarkdownOptions
		* @typedef {import('unified').Parser<Root>} Parser
		* @typedef {import('unified').Processor<Root>} Processor
		*/
		/**
		* @typedef {Omit<FromMarkdownOptions, 'extensions' | 'mdastExtensions'>} Options
		*/
		/**
		* Aadd support for parsing from markdown.
		*
		* @param {Readonly<Options> | null | undefined} [options]
		*   Configuration (optional).
		* @returns {undefined}
		*   Nothing.
		*/
		function remarkParse(options) {
			/** @type {Processor} */
			const self = this;
			self.parser = parser;
			/**
			* @type {Parser}
			*/
			function parser(doc) {
				return fromMarkdown(doc, {
					...self.data("settings"),
					...options,
					extensions: self.data("micromarkExtensions") || [],
					mdastExtensions: self.data("fromMarkdownExtensions") || []
				});
			}
		}
		//#endregion
		//#region node_modules/mdast-util-to-hast/lib/handlers/blockquote.js
		/**
		* @import {Element} from 'hast'
		* @import {Blockquote} from 'mdast'
		* @import {State} from '../state.js'
		*/
		/**
		* Turn an mdast `blockquote` node into hast.
		*
		* @param {State} state
		*   Info passed around.
		* @param {Blockquote} node
		*   mdast node.
		* @returns {Element}
		*   hast node.
		*/
		function blockquote$1(state, node) {
			/** @type {Element} */
			const result = {
				type: "element",
				tagName: "blockquote",
				properties: {},
				children: state.wrap(state.all(node), true)
			};
			state.patch(node, result);
			return state.applyData(node, result);
		}
		//#endregion
		//#region node_modules/mdast-util-to-hast/lib/handlers/break.js
		/**
		* @import {Element, Text} from 'hast'
		* @import {Break} from 'mdast'
		* @import {State} from '../state.js'
		*/
		/**
		* Turn an mdast `break` node into hast.
		*
		* @param {State} state
		*   Info passed around.
		* @param {Break} node
		*   mdast node.
		* @returns {Array<Element | Text>}
		*   hast element content.
		*/
		function hardBreak$1(state, node) {
			/** @type {Element} */
			const result = {
				type: "element",
				tagName: "br",
				properties: {},
				children: []
			};
			state.patch(node, result);
			return [state.applyData(node, result), {
				type: "text",
				value: "\n"
			}];
		}
		//#endregion
		//#region node_modules/mdast-util-to-hast/lib/handlers/code.js
		/**
		* @import {Element, Properties} from 'hast'
		* @import {Code} from 'mdast'
		* @import {State} from '../state.js'
		*/
		/**
		* Turn an mdast `code` node into hast.
		*
		* @param {State} state
		*   Info passed around.
		* @param {Code} node
		*   mdast node.
		* @returns {Element}
		*   hast node.
		*/
		function code$2(state, node) {
			const value = node.value ? node.value + "\n" : "";
			/** @type {Properties} */
			const properties = {};
			const language = node.lang ? node.lang.split(/\s+/) : [];
			if (language.length > 0) properties.className = ["language-" + language[0]];
			/** @type {Element} */
			let result = {
				type: "element",
				tagName: "code",
				properties,
				children: [{
					type: "text",
					value
				}]
			};
			if (node.meta) result.data = { meta: node.meta };
			state.patch(node, result);
			result = state.applyData(node, result);
			result = {
				type: "element",
				tagName: "pre",
				properties: {},
				children: [result]
			};
			state.patch(node, result);
			return result;
		}
		//#endregion
		//#region node_modules/mdast-util-to-hast/lib/handlers/delete.js
		/**
		* @import {Element} from 'hast'
		* @import {Delete} from 'mdast'
		* @import {State} from '../state.js'
		*/
		/**
		* Turn an mdast `delete` node into hast.
		*
		* @param {State} state
		*   Info passed around.
		* @param {Delete} node
		*   mdast node.
		* @returns {Element}
		*   hast node.
		*/
		function strikethrough(state, node) {
			/** @type {Element} */
			const result = {
				type: "element",
				tagName: "del",
				properties: {},
				children: state.all(node)
			};
			state.patch(node, result);
			return state.applyData(node, result);
		}
		//#endregion
		//#region node_modules/mdast-util-to-hast/lib/handlers/emphasis.js
		/**
		* @import {Element} from 'hast'
		* @import {Emphasis} from 'mdast'
		* @import {State} from '../state.js'
		*/
		/**
		* Turn an mdast `emphasis` node into hast.
		*
		* @param {State} state
		*   Info passed around.
		* @param {Emphasis} node
		*   mdast node.
		* @returns {Element}
		*   hast node.
		*/
		function emphasis$1(state, node) {
			/** @type {Element} */
			const result = {
				type: "element",
				tagName: "em",
				properties: {},
				children: state.all(node)
			};
			state.patch(node, result);
			return state.applyData(node, result);
		}
		//#endregion
		//#region node_modules/mdast-util-to-hast/lib/handlers/footnote-reference.js
		/**
		* @import {Element} from 'hast'
		* @import {FootnoteReference} from 'mdast'
		* @import {State} from '../state.js'
		*/
		/**
		* Turn an mdast `footnoteReference` node into hast.
		*
		* @param {State} state
		*   Info passed around.
		* @param {FootnoteReference} node
		*   mdast node.
		* @returns {Element}
		*   hast node.
		*/
		function footnoteReference$1(state, node) {
			const clobberPrefix = typeof state.options.clobberPrefix === "string" ? state.options.clobberPrefix : "user-content-";
			const id = String(node.identifier).toUpperCase();
			const safeId = normalizeUri(id.toLowerCase());
			const index = state.footnoteOrder.indexOf(id);
			/** @type {number} */
			let counter;
			let reuseCounter = state.footnoteCounts.get(id);
			if (reuseCounter === void 0) {
				reuseCounter = 0;
				state.footnoteOrder.push(id);
				counter = state.footnoteOrder.length;
			} else counter = index + 1;
			reuseCounter += 1;
			state.footnoteCounts.set(id, reuseCounter);
			/** @type {Element} */
			const link = {
				type: "element",
				tagName: "a",
				properties: {
					href: "#" + clobberPrefix + "fn-" + safeId,
					id: clobberPrefix + "fnref-" + safeId + (reuseCounter > 1 ? "-" + reuseCounter : ""),
					dataFootnoteRef: true,
					ariaDescribedBy: ["footnote-label"]
				},
				children: [{
					type: "text",
					value: String(counter)
				}]
			};
			state.patch(node, link);
			/** @type {Element} */
			const sup = {
				type: "element",
				tagName: "sup",
				properties: {},
				children: [link]
			};
			state.patch(node, sup);
			return state.applyData(node, sup);
		}
		//#endregion
		//#region node_modules/mdast-util-to-hast/lib/handlers/heading.js
		/**
		* @import {Element} from 'hast'
		* @import {Heading} from 'mdast'
		* @import {State} from '../state.js'
		*/
		/**
		* Turn an mdast `heading` node into hast.
		*
		* @param {State} state
		*   Info passed around.
		* @param {Heading} node
		*   mdast node.
		* @returns {Element}
		*   hast node.
		*/
		function heading$1(state, node) {
			/** @type {Element} */
			const result = {
				type: "element",
				tagName: "h" + node.depth,
				properties: {},
				children: state.all(node)
			};
			state.patch(node, result);
			return state.applyData(node, result);
		}
		//#endregion
		//#region node_modules/mdast-util-to-hast/lib/handlers/html.js
		/**
		* @import {Element} from 'hast'
		* @import {Html} from 'mdast'
		* @import {State} from '../state.js'
		* @import {Raw} from '../../index.js'
		*/
		/**
		* Turn an mdast `html` node into hast (`raw` node in dangerous mode, otherwise
		* nothing).
		*
		* @param {State} state
		*   Info passed around.
		* @param {Html} node
		*   mdast node.
		* @returns {Element | Raw | undefined}
		*   hast node.
		*/
		function html$1(state, node) {
			if (state.options.allowDangerousHtml) {
				/** @type {Raw} */
				const result = {
					type: "raw",
					value: node.value
				};
				state.patch(node, result);
				return state.applyData(node, result);
			}
		}
		//#endregion
		//#region node_modules/mdast-util-to-hast/lib/revert.js
		/**
		* @import {ElementContent} from 'hast'
		* @import {Reference, Nodes} from 'mdast'
		* @import {State} from './state.js'
		*/
		/**
		* Return the content of a reference without definition as plain text.
		*
		* @param {State} state
		*   Info passed around.
		* @param {Extract<Nodes, Reference>} node
		*   Reference node (image, link).
		* @returns {Array<ElementContent>}
		*   hast content.
		*/
		function revert(state, node) {
			const subtype = node.referenceType;
			let suffix = "]";
			if (subtype === "collapsed") suffix += "[]";
			else if (subtype === "full") suffix += "[" + (node.label || node.identifier) + "]";
			if (node.type === "imageReference") return [{
				type: "text",
				value: "![" + node.alt + suffix
			}];
			const contents = state.all(node);
			const head = contents[0];
			if (head && head.type === "text") head.value = "[" + head.value;
			else contents.unshift({
				type: "text",
				value: "["
			});
			const tail = contents[contents.length - 1];
			if (tail && tail.type === "text") tail.value += suffix;
			else contents.push({
				type: "text",
				value: suffix
			});
			return contents;
		}
		//#endregion
		//#region node_modules/mdast-util-to-hast/lib/handlers/image-reference.js
		/**
		* @import {ElementContent, Element, Properties} from 'hast'
		* @import {ImageReference} from 'mdast'
		* @import {State} from '../state.js'
		*/
		/**
		* Turn an mdast `imageReference` node into hast.
		*
		* @param {State} state
		*   Info passed around.
		* @param {ImageReference} node
		*   mdast node.
		* @returns {Array<ElementContent> | ElementContent}
		*   hast node.
		*/
		function imageReference$1(state, node) {
			const id = String(node.identifier).toUpperCase();
			const definition = state.definitionById.get(id);
			if (!definition) return revert(state, node);
			/** @type {Properties} */
			const properties = {
				src: normalizeUri(definition.url || ""),
				alt: node.alt
			};
			if (definition.title !== null && definition.title !== void 0) properties.title = definition.title;
			/** @type {Element} */
			const result = {
				type: "element",
				tagName: "img",
				properties,
				children: []
			};
			state.patch(node, result);
			return state.applyData(node, result);
		}
		//#endregion
		//#region node_modules/mdast-util-to-hast/lib/handlers/image.js
		/**
		* @import {Element, Properties} from 'hast'
		* @import {Image} from 'mdast'
		* @import {State} from '../state.js'
		*/
		/**
		* Turn an mdast `image` node into hast.
		*
		* @param {State} state
		*   Info passed around.
		* @param {Image} node
		*   mdast node.
		* @returns {Element}
		*   hast node.
		*/
		function image$1(state, node) {
			/** @type {Properties} */
			const properties = { src: normalizeUri(node.url) };
			if (node.alt !== null && node.alt !== void 0) properties.alt = node.alt;
			if (node.title !== null && node.title !== void 0) properties.title = node.title;
			/** @type {Element} */
			const result = {
				type: "element",
				tagName: "img",
				properties,
				children: []
			};
			state.patch(node, result);
			return state.applyData(node, result);
		}
		//#endregion
		//#region node_modules/mdast-util-to-hast/lib/handlers/inline-code.js
		/**
		* @import {Element, Text} from 'hast'
		* @import {InlineCode} from 'mdast'
		* @import {State} from '../state.js'
		*/
		/**
		* Turn an mdast `inlineCode` node into hast.
		*
		* @param {State} state
		*   Info passed around.
		* @param {InlineCode} node
		*   mdast node.
		* @returns {Element}
		*   hast node.
		*/
		function inlineCode$1(state, node) {
			/** @type {Text} */
			const text = {
				type: "text",
				value: node.value.replace(/\r?\n|\r/g, " ")
			};
			state.patch(node, text);
			/** @type {Element} */
			const result = {
				type: "element",
				tagName: "code",
				properties: {},
				children: [text]
			};
			state.patch(node, result);
			return state.applyData(node, result);
		}
		//#endregion
		//#region node_modules/mdast-util-to-hast/lib/handlers/link-reference.js
		/**
		* @import {ElementContent, Element, Properties} from 'hast'
		* @import {LinkReference} from 'mdast'
		* @import {State} from '../state.js'
		*/
		/**
		* Turn an mdast `linkReference` node into hast.
		*
		* @param {State} state
		*   Info passed around.
		* @param {LinkReference} node
		*   mdast node.
		* @returns {Array<ElementContent> | ElementContent}
		*   hast node.
		*/
		function linkReference$1(state, node) {
			const id = String(node.identifier).toUpperCase();
			const definition = state.definitionById.get(id);
			if (!definition) return revert(state, node);
			/** @type {Properties} */
			const properties = { href: normalizeUri(definition.url || "") };
			if (definition.title !== null && definition.title !== void 0) properties.title = definition.title;
			/** @type {Element} */
			const result = {
				type: "element",
				tagName: "a",
				properties,
				children: state.all(node)
			};
			state.patch(node, result);
			return state.applyData(node, result);
		}
		//#endregion
		//#region node_modules/mdast-util-to-hast/lib/handlers/link.js
		/**
		* @import {Element, Properties} from 'hast'
		* @import {Link} from 'mdast'
		* @import {State} from '../state.js'
		*/
		/**
		* Turn an mdast `link` node into hast.
		*
		* @param {State} state
		*   Info passed around.
		* @param {Link} node
		*   mdast node.
		* @returns {Element}
		*   hast node.
		*/
		function link$1(state, node) {
			/** @type {Properties} */
			const properties = { href: normalizeUri(node.url) };
			if (node.title !== null && node.title !== void 0) properties.title = node.title;
			/** @type {Element} */
			const result = {
				type: "element",
				tagName: "a",
				properties,
				children: state.all(node)
			};
			state.patch(node, result);
			return state.applyData(node, result);
		}
		//#endregion
		//#region node_modules/mdast-util-to-hast/lib/handlers/list-item.js
		/**
		* @import {ElementContent, Element, Properties} from 'hast'
		* @import {ListItem, Parents} from 'mdast'
		* @import {State} from '../state.js'
		*/
		/**
		* Turn an mdast `listItem` node into hast.
		*
		* @param {State} state
		*   Info passed around.
		* @param {ListItem} node
		*   mdast node.
		* @param {Parents | undefined} parent
		*   Parent of `node`.
		* @returns {Element}
		*   hast node.
		*/
		function listItem$1(state, node, parent) {
			const results = state.all(node);
			const loose = parent ? listLoose(parent) : listItemLoose(node);
			/** @type {Properties} */
			const properties = {};
			/** @type {Array<ElementContent>} */
			const children = [];
			if (typeof node.checked === "boolean") {
				const head = results[0];
				/** @type {Element} */
				let paragraph;
				if (head && head.type === "element" && head.tagName === "p") paragraph = head;
				else {
					paragraph = {
						type: "element",
						tagName: "p",
						properties: {},
						children: []
					};
					results.unshift(paragraph);
				}
				if (paragraph.children.length > 0) paragraph.children.unshift({
					type: "text",
					value: " "
				});
				paragraph.children.unshift({
					type: "element",
					tagName: "input",
					properties: {
						type: "checkbox",
						checked: node.checked,
						disabled: true
					},
					children: []
				});
				properties.className = ["task-list-item"];
			}
			let index = -1;
			while (++index < results.length) {
				const child = results[index];
				if (loose || index !== 0 || child.type !== "element" || child.tagName !== "p") children.push({
					type: "text",
					value: "\n"
				});
				if (child.type === "element" && child.tagName === "p" && !loose) children.push(...child.children);
				else children.push(child);
			}
			const tail = results[results.length - 1];
			if (tail && (loose || tail.type !== "element" || tail.tagName !== "p")) children.push({
				type: "text",
				value: "\n"
			});
			/** @type {Element} */
			const result = {
				type: "element",
				tagName: "li",
				properties,
				children
			};
			state.patch(node, result);
			return state.applyData(node, result);
		}
		/**
		* @param {Parents} node
		* @return {Boolean}
		*/
		function listLoose(node) {
			let loose = false;
			if (node.type === "list") {
				loose = node.spread || false;
				const children = node.children;
				let index = -1;
				while (!loose && ++index < children.length) loose = listItemLoose(children[index]);
			}
			return loose;
		}
		/**
		* @param {ListItem} node
		* @return {Boolean}
		*/
		function listItemLoose(node) {
			const spread = node.spread;
			return spread === null || spread === void 0 ? node.children.length > 1 : spread;
		}
		//#endregion
		//#region node_modules/mdast-util-to-hast/lib/handlers/list.js
		/**
		* @import {Element, Properties} from 'hast'
		* @import {List} from 'mdast'
		* @import {State} from '../state.js'
		*/
		/**
		* Turn an mdast `list` node into hast.
		*
		* @param {State} state
		*   Info passed around.
		* @param {List} node
		*   mdast node.
		* @returns {Element}
		*   hast node.
		*/
		function list$1(state, node) {
			/** @type {Properties} */
			const properties = {};
			const results = state.all(node);
			let index = -1;
			if (typeof node.start === "number" && node.start !== 1) properties.start = node.start;
			while (++index < results.length) {
				const child = results[index];
				if (child.type === "element" && child.tagName === "li" && child.properties && Array.isArray(child.properties.className) && child.properties.className.includes("task-list-item")) {
					properties.className = ["contains-task-list"];
					break;
				}
			}
			/** @type {Element} */
			const result = {
				type: "element",
				tagName: node.ordered ? "ol" : "ul",
				properties,
				children: state.wrap(results, true)
			};
			state.patch(node, result);
			return state.applyData(node, result);
		}
		//#endregion
		//#region node_modules/mdast-util-to-hast/lib/handlers/paragraph.js
		/**
		* @import {Element} from 'hast'
		* @import {Paragraph} from 'mdast'
		* @import {State} from '../state.js'
		*/
		/**
		* Turn an mdast `paragraph` node into hast.
		*
		* @param {State} state
		*   Info passed around.
		* @param {Paragraph} node
		*   mdast node.
		* @returns {Element}
		*   hast node.
		*/
		function paragraph$1(state, node) {
			/** @type {Element} */
			const result = {
				type: "element",
				tagName: "p",
				properties: {},
				children: state.all(node)
			};
			state.patch(node, result);
			return state.applyData(node, result);
		}
		//#endregion
		//#region node_modules/mdast-util-to-hast/lib/handlers/root.js
		/**
		* @import {Parents as HastParents, Root as HastRoot} from 'hast'
		* @import {Root as MdastRoot} from 'mdast'
		* @import {State} from '../state.js'
		*/
		/**
		* Turn an mdast `root` node into hast.
		*
		* @param {State} state
		*   Info passed around.
		* @param {MdastRoot} node
		*   mdast node.
		* @returns {HastParents}
		*   hast node.
		*/
		function root$1(state, node) {
			/** @type {HastRoot} */
			const result = {
				type: "root",
				children: state.wrap(state.all(node))
			};
			state.patch(node, result);
			return state.applyData(node, result);
		}
		//#endregion
		//#region node_modules/mdast-util-to-hast/lib/handlers/strong.js
		/**
		* @import {Element} from 'hast'
		* @import {Strong} from 'mdast'
		* @import {State} from '../state.js'
		*/
		/**
		* Turn an mdast `strong` node into hast.
		*
		* @param {State} state
		*   Info passed around.
		* @param {Strong} node
		*   mdast node.
		* @returns {Element}
		*   hast node.
		*/
		function strong$1(state, node) {
			/** @type {Element} */
			const result = {
				type: "element",
				tagName: "strong",
				properties: {},
				children: state.all(node)
			};
			state.patch(node, result);
			return state.applyData(node, result);
		}
		//#endregion
		//#region node_modules/mdast-util-to-hast/lib/handlers/table.js
		/**
		* @import {Table} from 'mdast'
		* @import {Element} from 'hast'
		* @import {State} from '../state.js'
		*/
		/**
		* Turn an mdast `table` node into hast.
		*
		* @param {State} state
		*   Info passed around.
		* @param {Table} node
		*   mdast node.
		* @returns {Element}
		*   hast node.
		*/
		function table(state, node) {
			const rows = state.all(node);
			const firstRow = rows.shift();
			/** @type {Array<Element>} */
			const tableContent = [];
			if (firstRow) {
				/** @type {Element} */
				const head = {
					type: "element",
					tagName: "thead",
					properties: {},
					children: state.wrap([firstRow], true)
				};
				state.patch(node.children[0], head);
				tableContent.push(head);
			}
			if (rows.length > 0) {
				/** @type {Element} */
				const body = {
					type: "element",
					tagName: "tbody",
					properties: {},
					children: state.wrap(rows, true)
				};
				const start = pointStart(node.children[1]);
				const end = pointEnd(node.children[node.children.length - 1]);
				if (start && end) body.position = {
					start,
					end
				};
				tableContent.push(body);
			}
			/** @type {Element} */
			const result = {
				type: "element",
				tagName: "table",
				properties: {},
				children: state.wrap(tableContent, true)
			};
			state.patch(node, result);
			return state.applyData(node, result);
		}
		//#endregion
		//#region node_modules/mdast-util-to-hast/lib/handlers/table-row.js
		/**
		* @import {Element, ElementContent, Properties} from 'hast'
		* @import {Parents, TableRow} from 'mdast'
		* @import {State} from '../state.js'
		*/
		/**
		* Turn an mdast `tableRow` node into hast.
		*
		* @param {State} state
		*   Info passed around.
		* @param {TableRow} node
		*   mdast node.
		* @param {Parents | undefined} parent
		*   Parent of `node`.
		* @returns {Element}
		*   hast node.
		*/
		function tableRow(state, node, parent) {
			const siblings = parent ? parent.children : void 0;
			const tagName = (siblings ? siblings.indexOf(node) : 1) === 0 ? "th" : "td";
			const align = parent && parent.type === "table" ? parent.align : void 0;
			const length = align ? align.length : node.children.length;
			let cellIndex = -1;
			/** @type {Array<ElementContent>} */
			const cells = [];
			while (++cellIndex < length) {
				const cell = node.children[cellIndex];
				/** @type {Properties} */
				const properties = {};
				const alignValue = align ? align[cellIndex] : void 0;
				if (alignValue) properties.align = alignValue;
				/** @type {Element} */
				let result = {
					type: "element",
					tagName,
					properties,
					children: []
				};
				if (cell) {
					result.children = state.all(cell);
					state.patch(cell, result);
					result = state.applyData(cell, result);
				}
				cells.push(result);
			}
			/** @type {Element} */
			const result = {
				type: "element",
				tagName: "tr",
				properties: {},
				children: state.wrap(cells, true)
			};
			state.patch(node, result);
			return state.applyData(node, result);
		}
		//#endregion
		//#region node_modules/mdast-util-to-hast/lib/handlers/table-cell.js
		/**
		* @import {Element} from 'hast'
		* @import {TableCell} from 'mdast'
		* @import {State} from '../state.js'
		*/
		/**
		* Turn an mdast `tableCell` node into hast.
		*
		* @param {State} state
		*   Info passed around.
		* @param {TableCell} node
		*   mdast node.
		* @returns {Element}
		*   hast node.
		*/
		function tableCell(state, node) {
			/** @type {Element} */
			const result = {
				type: "element",
				tagName: "td",
				properties: {},
				children: state.all(node)
			};
			state.patch(node, result);
			return state.applyData(node, result);
		}
		//#endregion
		//#region node_modules/trim-lines/index.js
		const tab = 9;
		const space = 32;
		/**
		* Remove initial and final spaces and tabs at the line breaks in `value`.
		* Does not trim initial and final spaces and tabs of the value itself.
		*
		* @param {string} value
		*   Value to trim.
		* @returns {string}
		*   Trimmed value.
		*/
		function trimLines(value) {
			const source = String(value);
			const search = /\r?\n|\r/g;
			let match = search.exec(source);
			let last = 0;
			/** @type {Array<string>} */
			const lines = [];
			while (match) {
				lines.push(trimLine(source.slice(last, match.index), last > 0, true), match[0]);
				last = match.index + match[0].length;
				match = search.exec(source);
			}
			lines.push(trimLine(source.slice(last), last > 0, false));
			return lines.join("");
		}
		/**
		* @param {string} value
		*   Line to trim.
		* @param {boolean} start
		*   Whether to trim the start of the line.
		* @param {boolean} end
		*   Whether to trim the end of the line.
		* @returns {string}
		*   Trimmed line.
		*/
		function trimLine(value, start, end) {
			let startIndex = 0;
			let endIndex = value.length;
			if (start) {
				let code = value.codePointAt(startIndex);
				while (code === tab || code === space) {
					startIndex++;
					code = value.codePointAt(startIndex);
				}
			}
			if (end) {
				let code = value.codePointAt(endIndex - 1);
				while (code === tab || code === space) {
					endIndex--;
					code = value.codePointAt(endIndex - 1);
				}
			}
			return endIndex > startIndex ? value.slice(startIndex, endIndex) : "";
		}
		//#endregion
		//#region node_modules/mdast-util-to-hast/lib/handlers/text.js
		/**
		* @import {Element as HastElement, Text as HastText} from 'hast'
		* @import {Text as MdastText} from 'mdast'
		* @import {State} from '../state.js'
		*/
		/**
		* Turn an mdast `text` node into hast.
		*
		* @param {State} state
		*   Info passed around.
		* @param {MdastText} node
		*   mdast node.
		* @returns {HastElement | HastText}
		*   hast node.
		*/
		function text$2(state, node) {
			/** @type {HastText} */
			const result = {
				type: "text",
				value: trimLines(String(node.value))
			};
			state.patch(node, result);
			return state.applyData(node, result);
		}
		//#endregion
		//#region node_modules/mdast-util-to-hast/lib/handlers/thematic-break.js
		/**
		* @import {Element} from 'hast'
		* @import {ThematicBreak} from 'mdast'
		* @import {State} from '../state.js'
		*/
		/**
		* Turn an mdast `thematicBreak` node into hast.
		*
		* @param {State} state
		*   Info passed around.
		* @param {ThematicBreak} node
		*   mdast node.
		* @returns {Element}
		*   hast node.
		*/
		function thematicBreak$1(state, node) {
			/** @type {Element} */
			const result = {
				type: "element",
				tagName: "hr",
				properties: {},
				children: []
			};
			state.patch(node, result);
			return state.applyData(node, result);
		}
		//#endregion
		//#region node_modules/mdast-util-to-hast/lib/handlers/index.js
		/**
		* @import {Handlers} from '../state.js'
		*/
		/**
		* Default handlers for nodes.
		*
		* @satisfies {Handlers}
		*/
		const handlers = {
			blockquote: blockquote$1,
			break: hardBreak$1,
			code: code$2,
			delete: strikethrough,
			emphasis: emphasis$1,
			footnoteReference: footnoteReference$1,
			heading: heading$1,
			html: html$1,
			imageReference: imageReference$1,
			image: image$1,
			inlineCode: inlineCode$1,
			linkReference: linkReference$1,
			link: link$1,
			listItem: listItem$1,
			list: list$1,
			paragraph: paragraph$1,
			root: root$1,
			strong: strong$1,
			table,
			tableCell,
			tableRow,
			text: text$2,
			thematicBreak: thematicBreak$1,
			toml: ignore,
			yaml: ignore,
			definition: ignore,
			footnoteDefinition: ignore
		};
		function ignore() {}
		//#endregion
		//#region node_modules/@ungap/structured-clone/esm/deserialize.js
		const { defineProperty } = Object;
		const env = typeof self === "object" ? self : globalThis;
		const guard = (name, init) => {
			switch (name) {
				case "Function":
				case "SharedWorker":
				case "Worker":
				case "eval":
				case "setInterval":
				case "setTimeout": throw new TypeError("unable to deserialize " + name);
			}
			return new env[name](init);
		};
		const deserializer = ($, _) => {
			const as = (out, index) => {
				$.set(index, out);
				return out;
			};
			const unpair = (index) => {
				if ($.has(index)) return $.get(index);
				const [type, value] = _[index];
				switch (type) {
					case 0:
					case -1: return as(value, index);
					case 1: {
						const arr = as([], index);
						for (const index of value) arr.push(unpair(index));
						return arr;
					}
					case 2: {
						const object = as({}, index);
						for (const [key, index] of value) {
							const k = unpair(key), value = unpair(index);
							if (k === "__proto__") defineProperty(object, k, {
								value,
								configurable: true,
								enumerable: true,
								writable: true
							});
							else object[k] = value;
						}
						return object;
					}
					case 3: return as(new Date(value), index);
					case 4: {
						const { source, flags } = value;
						return as(new RegExp(source, flags), index);
					}
					case 5: {
						const map = as(/* @__PURE__ */ new Map(), index);
						for (const [key, index] of value) map.set(unpair(key), unpair(index));
						return map;
					}
					case 6: {
						const set = as(/* @__PURE__ */ new Set(), index);
						for (const index of value) set.add(unpair(index));
						return set;
					}
					case 7: {
						const { name, message } = value;
						return as(typeof env[name] === "function" ? guard(name, message) : new Error(message), index);
					}
					case 8: return as(BigInt(value), index);
					case "BigInt": return as(Object(BigInt(value)), index);
					case "ArrayBuffer": return as(new Uint8Array(value).buffer, value);
					case "DataView": {
						const { buffer } = new Uint8Array(value);
						return as(new DataView(buffer), value);
					}
					case "-0": return -0;
				}
				return as(guard(type, value), index);
			};
			return unpair;
		};
		/**
		* @typedef {Array<string,any>} Record a type representation
		*/
		/**
		* Returns a deserialized value from a serialized array of Records.
		* @param {Record[]} serialized a previously serialized value.
		* @returns {any}
		*/
		const deserialize = (serialized) => deserializer(/* @__PURE__ */ new Map(), serialized)(0);
		//#endregion
		//#region node_modules/@ungap/structured-clone/esm/serialize.js
		const EMPTY = "";
		const { toString } = {};
		const { keys, is } = Object;
		const typeOf = (value) => {
			const type = typeof value;
			if (type !== "object" || !value) return [0, type];
			const asString = toString.call(value).slice(8, -1);
			switch (asString) {
				case "Array": return [1, EMPTY];
				case "Object": return [2, EMPTY];
				case "Date": return [3, EMPTY];
				case "RegExp": return [4, EMPTY];
				case "Map": return [5, EMPTY];
				case "Set": return [6, EMPTY];
				case "DataView": return [1, asString];
			}
			if (asString.includes("Array")) return [1, asString];
			if (value instanceof Error) return [7, value.name || "Error"];
			return [2, asString];
		};
		const shouldSkip = ([TYPE, type]) => TYPE === 0 && (type === "function" || type === "symbol");
		const serializer = (strict, json, $, _) => {
			const as = (out, value) => {
				const index = _.push(out) - 1;
				$.set(value, index);
				return index;
			};
			const pair = (value) => {
				if ($.has(value)) return $.get(value);
				let [TYPE, type] = typeOf(value);
				switch (TYPE) {
					case 0: {
						let entry = value;
						switch (type) {
							case "bigint":
								TYPE = 8;
								entry = value.toString();
								break;
							case "number":
								if (!value && is(value, -0)) return _.push(["-0"]) - 1;
								break;
							case "function":
							case "symbol":
								if (strict) throw new TypeError("unable to serialize " + type);
								entry = null;
								break;
							case "undefined": return as([-1], value);
						}
						return as([TYPE, entry], value);
					}
					case 1: {
						if (type) {
							let spread = value;
							if (type === "DataView") spread = new Uint8Array(value.buffer);
							else if (type === "ArrayBuffer") spread = new Uint8Array(value);
							return as([type, [...spread]], value);
						}
						const arr = [];
						const index = as([TYPE, arr], value);
						for (const entry of value) arr.push(pair(entry));
						return index;
					}
					case 2: {
						if (type) switch (type) {
							case "BigInt": return as([type, value.toString()], value);
							case "Boolean":
							case "Number":
							case "String": return as([type, value.valueOf()], value);
						}
						if (json && "toJSON" in value) return pair(value.toJSON());
						const entries = [];
						const index = as([TYPE, entries], value);
						for (const key of keys(value)) if (strict || !shouldSkip(typeOf(value[key]))) entries.push([pair(key), pair(value[key])]);
						return index;
					}
					case 3: return as([TYPE, isNaN(value.getTime()) ? EMPTY : value.toISOString()], value);
					case 4: {
						const { source, flags } = value;
						return as([TYPE, {
							source,
							flags
						}], value);
					}
					case 5: {
						const entries = [];
						const index = as([TYPE, entries], value);
						for (const [key, entry] of value) if (strict || !(shouldSkip(typeOf(key)) || shouldSkip(typeOf(entry)))) entries.push([pair(key), pair(entry)]);
						return index;
					}
					case 6: {
						const entries = [];
						const index = as([TYPE, entries], value);
						for (const entry of value) if (strict || !shouldSkip(typeOf(entry))) entries.push(pair(entry));
						return index;
					}
				}
				const { message } = value;
				return as([TYPE, {
					name: type,
					message
				}], value);
			};
			return pair;
		};
		/**
		* @typedef {Array<string,any>} Record a type representation
		*/
		/**
		* Returns an array of serialized Records.
		* @param {any} value a serializable value.
		* @param {{json?: boolean, lossy?: boolean}?} options an object with a `lossy` or `json` property that,
		*  if `true`, will not throw errors on incompatible types, and behave more
		*  like JSON stringify would behave. Symbol and Function will be discarded.
		* @returns {Record[]}
		*/
		const serialize$1 = (value, { json, lossy } = {}) => {
			const _ = [];
			return serializer(!(json || lossy), !!json, /* @__PURE__ */ new Map(), _)(value), _;
		};
		//#endregion
		//#region node_modules/@ungap/structured-clone/esm/index.js
		/**
		* @typedef {Array<string,any>} Record a type representation
		*/
		/**
		* Returns an array of serialized Records.
		* @param {any} any a serializable value.
		* @param {{transfer?: any[], json?: boolean, lossy?: boolean}?} options an object with
		* a transfer option (ignored when polyfilled) and/or non standard fields that
		* fallback to the polyfill if present.
		* @returns {Record[]}
		*/
		var esm_default = typeof structuredClone === "function" ? 
		/* c8 ignore start */
		(any, options) => options && ("json" in options || "lossy" in options) ? deserialize(serialize$1(any, options)) : structuredClone(any) : (any, options) => deserialize(serialize$1(any, options));
		//#endregion
		//#region node_modules/mdast-util-to-hast/lib/footer.js
		/**
		* @import {ElementContent, Element} from 'hast'
		* @import {State} from './state.js'
		*/
		/**
		* @callback FootnoteBackContentTemplate
		*   Generate content for the backreference dynamically.
		*
		*   For the following markdown:
		*
		*   ```markdown
		*   Alpha[^micromark], bravo[^micromark], and charlie[^remark].
		*
		*   [^remark]: things about remark
		*   [^micromark]: things about micromark
		*   ```
		*
		*   This function will be called with:
		*
		*   *  `0` and `0` for the backreference from `things about micromark` to
		*      `alpha`, as it is the first used definition, and the first call to it
		*   *  `0` and `1` for the backreference from `things about micromark` to
		*      `bravo`, as it is the first used definition, and the second call to it
		*   *  `1` and `0` for the backreference from `things about remark` to
		*      `charlie`, as it is the second used definition
		* @param {number} referenceIndex
		*   Index of the definition in the order that they are first referenced,
		*   0-indexed.
		* @param {number} rereferenceIndex
		*   Index of calls to the same definition, 0-indexed.
		* @returns {Array<ElementContent> | ElementContent | string}
		*   Content for the backreference when linking back from definitions to their
		*   reference.
		*
		* @callback FootnoteBackLabelTemplate
		*   Generate a back label dynamically.
		*
		*   For the following markdown:
		*
		*   ```markdown
		*   Alpha[^micromark], bravo[^micromark], and charlie[^remark].
		*
		*   [^remark]: things about remark
		*   [^micromark]: things about micromark
		*   ```
		*
		*   This function will be called with:
		*
		*   *  `0` and `0` for the backreference from `things about micromark` to
		*      `alpha`, as it is the first used definition, and the first call to it
		*   *  `0` and `1` for the backreference from `things about micromark` to
		*      `bravo`, as it is the first used definition, and the second call to it
		*   *  `1` and `0` for the backreference from `things about remark` to
		*      `charlie`, as it is the second used definition
		* @param {number} referenceIndex
		*   Index of the definition in the order that they are first referenced,
		*   0-indexed.
		* @param {number} rereferenceIndex
		*   Index of calls to the same definition, 0-indexed.
		* @returns {string}
		*   Back label to use when linking back from definitions to their reference.
		*/
		/**
		* Generate the default content that GitHub uses on backreferences.
		*
		* @param {number} _
		*   Index of the definition in the order that they are first referenced,
		*   0-indexed.
		* @param {number} rereferenceIndex
		*   Index of calls to the same definition, 0-indexed.
		* @returns {Array<ElementContent>}
		*   Content.
		*/
		function defaultFootnoteBackContent(_, rereferenceIndex) {
			/** @type {Array<ElementContent>} */
			const result = [{
				type: "text",
				value: "↩"
			}];
			if (rereferenceIndex > 1) result.push({
				type: "element",
				tagName: "sup",
				properties: {},
				children: [{
					type: "text",
					value: String(rereferenceIndex)
				}]
			});
			return result;
		}
		/**
		* Generate the default label that GitHub uses on backreferences.
		*
		* @param {number} referenceIndex
		*   Index of the definition in the order that they are first referenced,
		*   0-indexed.
		* @param {number} rereferenceIndex
		*   Index of calls to the same definition, 0-indexed.
		* @returns {string}
		*   Label.
		*/
		function defaultFootnoteBackLabel(referenceIndex, rereferenceIndex) {
			return "Back to reference " + (referenceIndex + 1) + (rereferenceIndex > 1 ? "-" + rereferenceIndex : "");
		}
		/**
		* Generate a hast footer for called footnote definitions.
		*
		* @param {State} state
		*   Info passed around.
		* @returns {Element | undefined}
		*   `section` element or `undefined`.
		*/
		function footer(state) {
			const clobberPrefix = typeof state.options.clobberPrefix === "string" ? state.options.clobberPrefix : "user-content-";
			const footnoteBackContent = state.options.footnoteBackContent || defaultFootnoteBackContent;
			const footnoteBackLabel = state.options.footnoteBackLabel || defaultFootnoteBackLabel;
			const footnoteLabel = state.options.footnoteLabel || "Footnotes";
			const footnoteLabelTagName = state.options.footnoteLabelTagName || "h2";
			const footnoteLabelProperties = state.options.footnoteLabelProperties || { className: ["sr-only"] };
			/** @type {Array<ElementContent>} */
			const listItems = [];
			let referenceIndex = -1;
			while (++referenceIndex < state.footnoteOrder.length) {
				const definition = state.footnoteById.get(state.footnoteOrder[referenceIndex]);
				if (!definition) continue;
				const content = state.all(definition);
				const id = String(definition.identifier).toUpperCase();
				const safeId = normalizeUri(id.toLowerCase());
				let rereferenceIndex = 0;
				/** @type {Array<ElementContent>} */
				const backReferences = [];
				const counts = state.footnoteCounts.get(id);
				while (counts !== void 0 && ++rereferenceIndex <= counts) {
					if (backReferences.length > 0) backReferences.push({
						type: "text",
						value: " "
					});
					let children = typeof footnoteBackContent === "string" ? footnoteBackContent : footnoteBackContent(referenceIndex, rereferenceIndex);
					if (typeof children === "string") children = {
						type: "text",
						value: children
					};
					backReferences.push({
						type: "element",
						tagName: "a",
						properties: {
							href: "#" + clobberPrefix + "fnref-" + safeId + (rereferenceIndex > 1 ? "-" + rereferenceIndex : ""),
							dataFootnoteBackref: "",
							ariaLabel: typeof footnoteBackLabel === "string" ? footnoteBackLabel : footnoteBackLabel(referenceIndex, rereferenceIndex),
							className: ["data-footnote-backref"]
						},
						children: Array.isArray(children) ? children : [children]
					});
				}
				const tail = content[content.length - 1];
				if (tail && tail.type === "element" && tail.tagName === "p") {
					const tailTail = tail.children[tail.children.length - 1];
					if (tailTail && tailTail.type === "text") tailTail.value += " ";
					else tail.children.push({
						type: "text",
						value: " "
					});
					tail.children.push(...backReferences);
				} else content.push(...backReferences);
				/** @type {Element} */
				const listItem = {
					type: "element",
					tagName: "li",
					properties: { id: clobberPrefix + "fn-" + safeId },
					children: state.wrap(content, true)
				};
				state.patch(definition, listItem);
				listItems.push(listItem);
			}
			if (listItems.length === 0) return;
			return {
				type: "element",
				tagName: "section",
				properties: {
					dataFootnotes: true,
					className: ["footnotes"]
				},
				children: [
					{
						type: "element",
						tagName: footnoteLabelTagName,
						properties: {
							...esm_default(footnoteLabelProperties),
							id: "footnote-label"
						},
						children: [{
							type: "text",
							value: footnoteLabel
						}]
					},
					{
						type: "text",
						value: "\n"
					},
					{
						type: "element",
						tagName: "ol",
						properties: {},
						children: state.wrap(listItems, true)
					},
					{
						type: "text",
						value: "\n"
					}
				]
			};
		}
		//#endregion
		//#region node_modules/unist-util-is/lib/index.js
		/**
		* Generate an assertion from a test.
		*
		* Useful if you’re going to test many nodes, for example when creating a
		* utility where something else passes a compatible test.
		*
		* The created function is a bit faster because it expects valid input only:
		* a `node`, `index`, and `parent`.
		*
		* @param {Test} test
		*   *   when nullish, checks if `node` is a `Node`.
		*   *   when `string`, works like passing `(node) => node.type === test`.
		*   *   when `function` checks if function passed the node is true.
		*   *   when `object`, checks that all keys in test are in node, and that they have (strictly) equal values.
		*   *   when `array`, checks if any one of the subtests pass.
		* @returns {Check}
		*   An assertion.
		*/
		const convert = (
		/**
		* @param {Test} [test]
		* @returns {Check}
		*/
		function(test) {
			if (test === null || test === void 0) return ok;
			if (typeof test === "function") return castFactory(test);
			if (typeof test === "object") return Array.isArray(test) ? anyFactory(test) : propertiesFactory(test);
			if (typeof test === "string") return typeFactory(test);
			throw new Error("Expected function, string, or object as test");
		});
		/**
		* @param {Array<Props | TestFunction | string>} tests
		* @returns {Check}
		*/
		function anyFactory(tests) {
			/** @type {Array<Check>} */
			const checks = [];
			let index = -1;
			while (++index < tests.length) checks[index] = convert(tests[index]);
			return castFactory(any);
			/**
			* @this {unknown}
			* @type {TestFunction}
			*/
			function any(...parameters) {
				let index = -1;
				while (++index < checks.length) if (checks[index].apply(this, parameters)) return true;
				return false;
			}
		}
		/**
		* Turn an object into a test for a node with a certain fields.
		*
		* @param {Props} check
		* @returns {Check}
		*/
		function propertiesFactory(check) {
			const checkAsRecord = check;
			return castFactory(all);
			/**
			* @param {Node} node
			* @returns {boolean}
			*/
			function all(node) {
				const nodeAsRecord = node;
				/** @type {string} */
				let key;
				for (key in check) if (nodeAsRecord[key] !== checkAsRecord[key]) return false;
				return true;
			}
		}
		/**
		* Turn a string into a test for a node with a certain type.
		*
		* @param {string} check
		* @returns {Check}
		*/
		function typeFactory(check) {
			return castFactory(type);
			/**
			* @param {Node} node
			*/
			function type(node) {
				return node && node.type === check;
			}
		}
		/**
		* Turn a custom test into a test for a node that passes that test.
		*
		* @param {TestFunction} testFunction
		* @returns {Check}
		*/
		function castFactory(testFunction) {
			return check;
			/**
			* @this {unknown}
			* @type {Check}
			*/
			function check(value, index, parent) {
				return Boolean(looksLikeANode(value) && testFunction.call(this, value, typeof index === "number" ? index : void 0, parent || void 0));
			}
		}
		function ok() {
			return true;
		}
		/**
		* @param {unknown} value
		* @returns {value is Node}
		*/
		function looksLikeANode(value) {
			return value !== null && typeof value === "object" && "type" in value;
		}
		//#endregion
		//#region node_modules/unist-util-visit-parents/lib/color.node.js
		/**
		* @param {string} d
		* @returns {string}
		*/
		function color(d) {
			return "\x1B[33m" + d + "\x1B[39m";
		}
		//#endregion
		//#region node_modules/unist-util-visit-parents/lib/index.js
		/**
		* @import {Node as UnistNode, Parent as UnistParent} from 'unist'
		*/
		/**
		* @typedef {Exclude<import('unist-util-is').Test, undefined> | undefined} Test
		*   Test from `unist-util-is`.
		*
		*   Note: we have remove and add `undefined`, because otherwise when generating
		*   automatic `.d.ts` files, TS tries to flatten paths from a local perspective,
		*   which doesn’t work when publishing on npm.
		*/
		/**
		* @typedef {(
		*   Fn extends (value: any) => value is infer Thing
		*   ? Thing
		*   : Fallback
		* )} Predicate
		*   Get the value of a type guard `Fn`.
		* @template Fn
		*   Value; typically function that is a type guard (such as `(x): x is Y`).
		* @template Fallback
		*   Value to yield if `Fn` is not a type guard.
		*/
		/**
		* @typedef {(
		*   Check extends null | undefined // No test.
		*   ? Value
		*   : Value extends {type: Check} // String (type) test.
		*   ? Value
		*   : Value extends Check // Partial test.
		*   ? Value
		*   : Check extends Function // Function test.
		*   ? Predicate<Check, Value> extends Value
		*     ? Predicate<Check, Value>
		*     : never
		*   : never // Some other test?
		* )} MatchesOne
		*   Check whether a node matches a primitive check in the type system.
		* @template Value
		*   Value; typically unist `Node`.
		* @template Check
		*   Value; typically `unist-util-is`-compatible test, but not arrays.
		*/
		/**
		* @typedef {(
		*   Check extends ReadonlyArray<infer T>
		*   ? MatchesOne<Value, T>
		*   : Check extends Array<infer T>
		*   ? MatchesOne<Value, T>
		*   : MatchesOne<Value, Check>
		* )} Matches
		*   Check whether a node matches a check in the type system.
		* @template Value
		*   Value; typically unist `Node`.
		* @template Check
		*   Value; typically `unist-util-is`-compatible test.
		*/
		/**
		* @typedef {0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10} Uint
		*   Number; capped reasonably.
		*/
		/**
		* @typedef {I extends 0 ? 1 : I extends 1 ? 2 : I extends 2 ? 3 : I extends 3 ? 4 : I extends 4 ? 5 : I extends 5 ? 6 : I extends 6 ? 7 : I extends 7 ? 8 : I extends 8 ? 9 : 10} Increment
		*   Increment a number in the type system.
		* @template {Uint} [I=0]
		*   Index.
		*/
		/**
		* @typedef {(
		*   Node extends UnistParent
		*   ? Node extends {children: Array<infer Children>}
		*     ? Child extends Children ? Node : never
		*     : never
		*   : never
		* )} InternalParent
		*   Collect nodes that can be parents of `Child`.
		* @template {UnistNode} Node
		*   All node types in a tree.
		* @template {UnistNode} Child
		*   Node to search for.
		*/
		/**
		* @typedef {InternalParent<InclusiveDescendant<Tree>, Child>} Parent
		*   Collect nodes in `Tree` that can be parents of `Child`.
		* @template {UnistNode} Tree
		*   All node types in a tree.
		* @template {UnistNode} Child
		*   Node to search for.
		*/
		/**
		* @typedef {(
		*   Depth extends Max
		*   ? never
		*   :
		*     | InternalParent<Node, Child>
		*     | InternalAncestor<Node, InternalParent<Node, Child>, Max, Increment<Depth>>
		* )} InternalAncestor
		*   Collect nodes in `Tree` that can be ancestors of `Child`.
		* @template {UnistNode} Node
		*   All node types in a tree.
		* @template {UnistNode} Child
		*   Node to search for.
		* @template {Uint} [Max=10]
		*   Max; searches up to this depth.
		* @template {Uint} [Depth=0]
		*   Current depth.
		*/
		/**
		* @typedef {InternalAncestor<InclusiveDescendant<Tree>, Child>} Ancestor
		*   Collect nodes in `Tree` that can be ancestors of `Child`.
		* @template {UnistNode} Tree
		*   All node types in a tree.
		* @template {UnistNode} Child
		*   Node to search for.
		*/
		/**
		* @typedef {(
		*   Tree extends UnistParent
		*     ? Depth extends Max
		*       ? Tree
		*       : Tree | InclusiveDescendant<Tree['children'][number], Max, Increment<Depth>>
		*     : Tree
		* )} InclusiveDescendant
		*   Collect all (inclusive) descendants of `Tree`.
		*
		*   > 👉 **Note**: for performance reasons, this seems to be the fastest way to
		*   > recurse without actually running into an infinite loop, which the
		*   > previous version did.
		*   >
		*   > Practically, a max of `2` is typically enough assuming a `Root` is
		*   > passed, but it doesn’t improve performance.
		*   > It gets higher with `List > ListItem > Table > TableRow > TableCell`.
		*   > Using up to `10` doesn’t hurt or help either.
		* @template {UnistNode} Tree
		*   Tree type.
		* @template {Uint} [Max=10]
		*   Max; searches up to this depth.
		* @template {Uint} [Depth=0]
		*   Current depth.
		*/
		/**
		* @typedef {'skip' | boolean} Action
		*   Union of the action types.
		*
		* @typedef {number} Index
		*   Move to the sibling at `index` next (after node itself is completely
		*   traversed).
		*
		*   Useful if mutating the tree, such as removing the node the visitor is
		*   currently on, or any of its previous siblings.
		*   Results less than 0 or greater than or equal to `children.length` stop
		*   traversing the parent.
		*
		* @typedef {[(Action | null | undefined | void)?, (Index | null | undefined)?]} ActionTuple
		*   List with one or two values, the first an action, the second an index.
		*
		* @typedef {Action | ActionTuple | Index | null | undefined | void} VisitorResult
		*   Any value that can be returned from a visitor.
		*/
		/**
		* @callback Visitor
		*   Handle a node (matching `test`, if given).
		*
		*   Visitors are free to transform `node`.
		*   They can also transform the parent of node (the last of `ancestors`).
		*
		*   Replacing `node` itself, if `SKIP` is not returned, still causes its
		*   descendants to be walked (which is a bug).
		*
		*   When adding or removing previous siblings of `node` (or next siblings, in
		*   case of reverse), the `Visitor` should return a new `Index` to specify the
		*   sibling to traverse after `node` is traversed.
		*   Adding or removing next siblings of `node` (or previous siblings, in case
		*   of reverse) is handled as expected without needing to return a new `Index`.
		*
		*   Removing the children property of an ancestor still results in them being
		*   traversed.
		* @param {Visited} node
		*   Found node.
		* @param {Array<VisitedParents>} ancestors
		*   Ancestors of `node`.
		* @returns {VisitorResult}
		*   What to do next.
		*
		*   An `Index` is treated as a tuple of `[CONTINUE, Index]`.
		*   An `Action` is treated as a tuple of `[Action]`.
		*
		*   Passing a tuple back only makes sense if the `Action` is `SKIP`.
		*   When the `Action` is `EXIT`, that action can be returned.
		*   When the `Action` is `CONTINUE`, `Index` can be returned.
		* @template {UnistNode} [Visited=UnistNode]
		*   Visited node type.
		* @template {UnistParent} [VisitedParents=UnistParent]
		*   Ancestor type.
		*/
		/**
		* @typedef {Visitor<Matches<InclusiveDescendant<Tree>, Check>, Ancestor<Tree, Matches<InclusiveDescendant<Tree>, Check>>>} BuildVisitor
		*   Build a typed `Visitor` function from a tree and a test.
		*
		*   It will infer which values are passed as `node` and which as `parents`.
		* @template {UnistNode} [Tree=UnistNode]
		*   Tree type.
		* @template {Test} [Check=Test]
		*   Test type.
		*/
		/** @type {Readonly<ActionTuple>} */
		const empty = [];
		/**
		* Visit nodes, with ancestral information.
		*
		* This algorithm performs *depth-first* *tree traversal* in *preorder*
		* (**NLR**) or if `reverse` is given, in *reverse preorder* (**NRL**).
		*
		* You can choose for which nodes `visitor` is called by passing a `test`.
		* For complex tests, you should test yourself in `visitor`, as it will be
		* faster and will have improved type information.
		*
		* Walking the tree is an intensive task.
		* Make use of the return values of the visitor when possible.
		* Instead of walking a tree multiple times, walk it once, use `unist-util-is`
		* to check if a node matches, and then perform different operations.
		*
		* You can change the tree.
		* See `Visitor` for more info.
		*
		* @overload
		* @param {Tree} tree
		* @param {Check} check
		* @param {BuildVisitor<Tree, Check>} visitor
		* @param {boolean | null | undefined} [reverse]
		* @returns {undefined}
		*
		* @overload
		* @param {Tree} tree
		* @param {BuildVisitor<Tree>} visitor
		* @param {boolean | null | undefined} [reverse]
		* @returns {undefined}
		*
		* @param {UnistNode} tree
		*   Tree to traverse.
		* @param {Visitor | Test} test
		*   `unist-util-is`-compatible test
		* @param {Visitor | boolean | null | undefined} [visitor]
		*   Handle each node.
		* @param {boolean | null | undefined} [reverse]
		*   Traverse in reverse preorder (NRL) instead of the default preorder (NLR).
		* @returns {undefined}
		*   Nothing.
		*
		* @template {UnistNode} Tree
		*   Node type.
		* @template {Test} Check
		*   `unist-util-is`-compatible test.
		*/
		function visitParents(tree, test, visitor, reverse) {
			/** @type {Test} */
			let check;
			if (typeof test === "function" && typeof visitor !== "function") {
				reverse = visitor;
				visitor = test;
			} else check = test;
			const is = convert(check);
			const step = reverse ? -1 : 1;
			factory(tree, void 0, [])();
			/**
			* @param {UnistNode} node
			* @param {number | undefined} index
			* @param {Array<UnistParent>} parents
			*/
			function factory(node, index, parents) {
				const value = node && typeof node === "object" ? node : {};
				if (typeof value.type === "string") {
					const name = typeof value.tagName === "string" ? value.tagName : typeof value.name === "string" ? value.name : void 0;
					Object.defineProperty(visit, "name", { value: "node (" + color(node.type + (name ? "<" + name + ">" : "")) + ")" });
				}
				return visit;
				function visit() {
					/** @type {Readonly<ActionTuple>} */
					let result = empty;
					/** @type {Readonly<ActionTuple>} */
					let subresult;
					/** @type {number} */
					let offset;
					/** @type {Array<UnistParent>} */
					let grandparents;
					if (!test || is(node, index, parents[parents.length - 1] || void 0)) {
						result = toResult(visitor(node, parents));
						if (result[0] === false) return result;
					}
					if ("children" in node && node.children) {
						const nodeAsParent = node;
						if (nodeAsParent.children && result[0] !== "skip") {
							offset = (reverse ? nodeAsParent.children.length : -1) + step;
							grandparents = parents.concat(nodeAsParent);
							while (offset > -1 && offset < nodeAsParent.children.length) {
								const child = nodeAsParent.children[offset];
								subresult = factory(child, offset, grandparents)();
								if (subresult[0] === false) return subresult;
								offset = typeof subresult[1] === "number" ? subresult[1] : offset + step;
							}
						}
					}
					return result;
				}
			}
		}
		/**
		* Turn a return value into a clean result.
		*
		* @param {VisitorResult} value
		*   Valid return values from visitors.
		* @returns {Readonly<ActionTuple>}
		*   Clean result.
		*/
		function toResult(value) {
			if (Array.isArray(value)) return value;
			if (typeof value === "number") return [true, value];
			return value === null || value === void 0 ? empty : [value];
		}
		//#endregion
		//#region node_modules/unist-util-visit/lib/index.js
		/**
		* @import {Node as UnistNode, Parent as UnistParent} from 'unist'
		* @import {VisitorResult} from 'unist-util-visit-parents'
		*/
		/**
		* @typedef {Exclude<import('unist-util-is').Test, undefined> | undefined} Test
		*   Test from `unist-util-is`.
		*
		*   Note: we have remove and add `undefined`, because otherwise when generating
		*   automatic `.d.ts` files, TS tries to flatten paths from a local perspective,
		*   which doesn’t work when publishing on npm.
		*/
		/**
		* @typedef {(
		*   Fn extends (value: any) => value is infer Thing
		*   ? Thing
		*   : Fallback
		* )} Predicate
		*   Get the value of a type guard `Fn`.
		* @template Fn
		*   Value; typically function that is a type guard (such as `(x): x is Y`).
		* @template Fallback
		*   Value to yield if `Fn` is not a type guard.
		*/
		/**
		* @typedef {(
		*   Check extends null | undefined // No test.
		*   ? Value
		*   : Value extends {type: Check} // String (type) test.
		*   ? Value
		*   : Value extends Check // Partial test.
		*   ? Value
		*   : Check extends Function // Function test.
		*   ? Predicate<Check, Value> extends Value
		*     ? Predicate<Check, Value>
		*     : never
		*   : never // Some other test?
		* )} MatchesOne
		*   Check whether a node matches a primitive check in the type system.
		* @template Value
		*   Value; typically unist `Node`.
		* @template Check
		*   Value; typically `unist-util-is`-compatible test, but not arrays.
		*/
		/**
		* @typedef {(
		*   Check extends ReadonlyArray<any>
		*   ? MatchesOne<Value, Check[number]>
		*   : MatchesOne<Value, Check>
		* )} Matches
		*   Check whether a node matches a check in the type system.
		* @template Value
		*   Value; typically unist `Node`.
		* @template Check
		*   Value; typically `unist-util-is`-compatible test.
		*/
		/**
		* @typedef {0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10} Uint
		*   Number; capped reasonably.
		*/
		/**
		* @typedef {I extends 0 ? 1 : I extends 1 ? 2 : I extends 2 ? 3 : I extends 3 ? 4 : I extends 4 ? 5 : I extends 5 ? 6 : I extends 6 ? 7 : I extends 7 ? 8 : I extends 8 ? 9 : 10} Increment
		*   Increment a number in the type system.
		* @template {Uint} [I=0]
		*   Index.
		*/
		/**
		* @typedef {(
		*   Node extends UnistParent
		*   ? Node extends {children: Array<infer Children>}
		*     ? Child extends Children ? Node : never
		*     : never
		*   : never
		* )} InternalParent
		*   Collect nodes that can be parents of `Child`.
		* @template {UnistNode} Node
		*   All node types in a tree.
		* @template {UnistNode} Child
		*   Node to search for.
		*/
		/**
		* @typedef {InternalParent<InclusiveDescendant<Tree>, Child>} Parent
		*   Collect nodes in `Tree` that can be parents of `Child`.
		* @template {UnistNode} Tree
		*   All node types in a tree.
		* @template {UnistNode} Child
		*   Node to search for.
		*/
		/**
		* @typedef {(
		*   Depth extends Max
		*   ? never
		*   :
		*     | InternalParent<Node, Child>
		*     | InternalAncestor<Node, InternalParent<Node, Child>, Max, Increment<Depth>>
		* )} InternalAncestor
		*   Collect nodes in `Tree` that can be ancestors of `Child`.
		* @template {UnistNode} Node
		*   All node types in a tree.
		* @template {UnistNode} Child
		*   Node to search for.
		* @template {Uint} [Max=10]
		*   Max; searches up to this depth.
		* @template {Uint} [Depth=0]
		*   Current depth.
		*/
		/**
		* @typedef {(
		*   Tree extends UnistParent
		*     ? Depth extends Max
		*       ? Tree
		*       : Tree | InclusiveDescendant<Tree['children'][number], Max, Increment<Depth>>
		*     : Tree
		* )} InclusiveDescendant
		*   Collect all (inclusive) descendants of `Tree`.
		*
		*   > 👉 **Note**: for performance reasons, this seems to be the fastest way to
		*   > recurse without actually running into an infinite loop, which the
		*   > previous version did.
		*   >
		*   > Practically, a max of `2` is typically enough assuming a `Root` is
		*   > passed, but it doesn’t improve performance.
		*   > It gets higher with `List > ListItem > Table > TableRow > TableCell`.
		*   > Using up to `10` doesn’t hurt or help either.
		* @template {UnistNode} Tree
		*   Tree type.
		* @template {Uint} [Max=10]
		*   Max; searches up to this depth.
		* @template {Uint} [Depth=0]
		*   Current depth.
		*/
		/**
		* @callback Visitor
		*   Handle a node (matching `test`, if given).
		*
		*   Visitors are free to transform `node`.
		*   They can also transform `parent`.
		*
		*   Replacing `node` itself, if `SKIP` is not returned, still causes its
		*   descendants to be walked (which is a bug).
		*
		*   When adding or removing previous siblings of `node` (or next siblings, in
		*   case of reverse), the `Visitor` should return a new `Index` to specify the
		*   sibling to traverse after `node` is traversed.
		*   Adding or removing next siblings of `node` (or previous siblings, in case
		*   of reverse) is handled as expected without needing to return a new `Index`.
		*
		*   Removing the children property of `parent` still results in them being
		*   traversed.
		* @param {Visited} node
		*   Found node.
		* @param {Visited extends UnistNode ? number | undefined : never} index
		*   Index of `node` in `parent`.
		* @param {Ancestor extends UnistParent ? Ancestor | undefined : never} parent
		*   Parent of `node`.
		* @returns {VisitorResult}
		*   What to do next.
		*
		*   An `Index` is treated as a tuple of `[CONTINUE, Index]`.
		*   An `Action` is treated as a tuple of `[Action]`.
		*
		*   Passing a tuple back only makes sense if the `Action` is `SKIP`.
		*   When the `Action` is `EXIT`, that action can be returned.
		*   When the `Action` is `CONTINUE`, `Index` can be returned.
		* @template {UnistNode} [Visited=UnistNode]
		*   Visited node type.
		* @template {UnistParent} [Ancestor=UnistParent]
		*   Ancestor type.
		*/
		/**
		* @typedef {Visitor<Visited, Parent<Ancestor, Visited>>} BuildVisitorFromMatch
		*   Build a typed `Visitor` function from a node and all possible parents.
		*
		*   It will infer which values are passed as `node` and which as `parent`.
		* @template {UnistNode} Visited
		*   Node type.
		* @template {UnistParent} Ancestor
		*   Parent type.
		*/
		/**
		* @typedef {(
		*   BuildVisitorFromMatch<
		*     Matches<Descendant, Check>,
		*     Extract<Descendant, UnistParent>
		*   >
		* )} BuildVisitorFromDescendants
		*   Build a typed `Visitor` function from a list of descendants and a test.
		*
		*   It will infer which values are passed as `node` and which as `parent`.
		* @template {UnistNode} Descendant
		*   Node type.
		* @template {Test} Check
		*   Test type.
		*/
		/**
		* @typedef {(
		*   BuildVisitorFromDescendants<
		*     InclusiveDescendant<Tree>,
		*     Check
		*   >
		* )} BuildVisitor
		*   Build a typed `Visitor` function from a tree and a test.
		*
		*   It will infer which values are passed as `node` and which as `parent`.
		* @template {UnistNode} [Tree=UnistNode]
		*   Node type.
		* @template {Test} [Check=Test]
		*   Test type.
		*/
		/**
		* Visit nodes.
		*
		* This algorithm performs *depth-first* *tree traversal* in *preorder*
		* (**NLR**) or if `reverse` is given, in *reverse preorder* (**NRL**).
		*
		* You can choose for which nodes `visitor` is called by passing a `test`.
		* For complex tests, you should test yourself in `visitor`, as it will be
		* faster and will have improved type information.
		*
		* Walking the tree is an intensive task.
		* Make use of the return values of the visitor when possible.
		* Instead of walking a tree multiple times, walk it once, use `unist-util-is`
		* to check if a node matches, and then perform different operations.
		*
		* You can change the tree.
		* See `Visitor` for more info.
		*
		* @overload
		* @param {Tree} tree
		* @param {Check} check
		* @param {BuildVisitor<Tree, Check>} visitor
		* @param {boolean | null | undefined} [reverse]
		* @returns {undefined}
		*
		* @overload
		* @param {Tree} tree
		* @param {BuildVisitor<Tree>} visitor
		* @param {boolean | null | undefined} [reverse]
		* @returns {undefined}
		*
		* @param {UnistNode} tree
		*   Tree to traverse.
		* @param {Visitor | Test} testOrVisitor
		*   `unist-util-is`-compatible test (optional, omit to pass a visitor).
		* @param {Visitor | boolean | null | undefined} [visitorOrReverse]
		*   Handle each node (when test is omitted, pass `reverse`).
		* @param {boolean | null | undefined} [maybeReverse=false]
		*   Traverse in reverse preorder (NRL) instead of the default preorder (NLR).
		* @returns {undefined}
		*   Nothing.
		*
		* @template {UnistNode} Tree
		*   Node type.
		* @template {Test} Check
		*   `unist-util-is`-compatible test.
		*/
		function visit(tree, testOrVisitor, visitorOrReverse, maybeReverse) {
			/** @type {boolean | null | undefined} */
			let reverse;
			/** @type {Test} */
			let test;
			/** @type {Visitor} */
			let visitor;
			if (typeof testOrVisitor === "function" && typeof visitorOrReverse !== "function") {
				test = void 0;
				visitor = testOrVisitor;
				reverse = visitorOrReverse;
			} else {
				test = testOrVisitor;
				visitor = visitorOrReverse;
				reverse = maybeReverse;
			}
			visitParents(tree, test, overload, reverse);
			/**
			* @param {UnistNode} node
			* @param {Array<UnistParent>} parents
			*/
			function overload(node, parents) {
				const parent = parents[parents.length - 1];
				const index = parent ? parent.children.indexOf(node) : void 0;
				return visitor(node, index, parent);
			}
		}
		//#endregion
		//#region node_modules/mdast-util-to-hast/lib/state.js
		/**
		* @import {
		*   ElementContent as HastElementContent,
		*   Element as HastElement,
		*   Nodes as HastNodes,
		*   Properties as HastProperties,
		*   RootContent as HastRootContent,
		*   Text as HastText
		* } from 'hast'
		* @import {
		*   Definition as MdastDefinition,
		*   FootnoteDefinition as MdastFootnoteDefinition,
		*   Nodes as MdastNodes,
		*   Parents as MdastParents
		* } from 'mdast'
		* @import {VFile} from 'vfile'
		* @import {
		*   FootnoteBackContentTemplate,
		*   FootnoteBackLabelTemplate
		* } from './footer.js'
		*/
		/**
		* @callback Handler
		*   Handle a node.
		* @param {State} state
		*   Info passed around.
		* @param {any} node
		*   mdast node to handle.
		* @param {MdastParents | undefined} parent
		*   Parent of `node`.
		* @returns {Array<HastElementContent> | HastElementContent | undefined}
		*   hast node.
		*
		* @typedef {Partial<Record<MdastNodes['type'], Handler>>} Handlers
		*   Handle nodes.
		*
		* @typedef Options
		*   Configuration (optional).
		* @property {boolean | null | undefined} [allowDangerousHtml=false]
		*   Whether to persist raw HTML in markdown in the hast tree (default:
		*   `false`).
		* @property {string | null | undefined} [clobberPrefix='user-content-']
		*   Prefix to use before the `id` property on footnotes to prevent them from
		*   *clobbering* (default: `'user-content-'`).
		*
		*   Pass `''` for trusted markdown and when you are careful with
		*   polyfilling.
		*   You could pass a different prefix.
		*
		*   DOM clobbering is this:
		*
		*   ```html
		*   <p id="x"></p>
		*   <script>alert(x) // `x` now refers to the `p#x` DOM element<\/script>
		*   ```
		*
		*   The above example shows that elements are made available by browsers, by
		*   their ID, on the `window` object.
		*   This is a security risk because you might be expecting some other variable
		*   at that place.
		*   It can also break polyfills.
		*   Using a prefix solves these problems.
		* @property {VFile | null | undefined} [file]
		*   Corresponding virtual file representing the input document (optional).
		* @property {FootnoteBackContentTemplate | string | null | undefined} [footnoteBackContent]
		*   Content of the backreference back to references (default: `defaultFootnoteBackContent`).
		*
		*   The default value is:
		*
		*   ```js
		*   function defaultFootnoteBackContent(_, rereferenceIndex) {
		*     const result = [{type: 'text', value: '↩'}]
		*
		*     if (rereferenceIndex > 1) {
		*       result.push({
		*         type: 'element',
		*         tagName: 'sup',
		*         properties: {},
		*         children: [{type: 'text', value: String(rereferenceIndex)}]
		*       })
		*     }
		*
		*     return result
		*   }
		*   ```
		*
		*   This content is used in the `a` element of each backreference (the `↩`
		*   links).
		* @property {FootnoteBackLabelTemplate | string | null | undefined} [footnoteBackLabel]
		*   Label to describe the backreference back to references (default:
		*   `defaultFootnoteBackLabel`).
		*
		*   The default value is:
		*
		*   ```js
		*   function defaultFootnoteBackLabel(referenceIndex, rereferenceIndex) {
		*    return (
		*      'Back to reference ' +
		*      (referenceIndex + 1) +
		*      (rereferenceIndex > 1 ? '-' + rereferenceIndex : '')
		*    )
		*   }
		*   ```
		*
		*   Change it when the markdown is not in English.
		*
		*   This label is used in the `ariaLabel` property on each backreference
		*   (the `↩` links).
		*   It affects users of assistive technology.
		* @property {string | null | undefined} [footnoteLabel='Footnotes']
		*   Textual label to use for the footnotes section (default: `'Footnotes'`).
		*
		*   Change it when the markdown is not in English.
		*
		*   This label is typically hidden visually (assuming a `sr-only` CSS class
		*   is defined that does that) and so affects screen readers only.
		*   If you do have such a class, but want to show this section to everyone,
		*   pass different properties with the `footnoteLabelProperties` option.
		* @property {HastProperties | null | undefined} [footnoteLabelProperties={className: ['sr-only']}]
		*   Properties to use on the footnote label (default: `{className:
		*   ['sr-only']}`).
		*
		*   Change it to show the label and add other properties.
		*
		*   This label is typically hidden visually (assuming an `sr-only` CSS class
		*   is defined that does that) and so affects screen readers only.
		*   If you do have such a class, but want to show this section to everyone,
		*   pass an empty string.
		*   You can also add different properties.
		*
		*   > **Note**: `id: 'footnote-label'` is always added, because footnote
		*   > calls use it with `aria-describedby` to provide an accessible label.
		* @property {string | null | undefined} [footnoteLabelTagName='h2']
		*   HTML tag name to use for the footnote label element (default: `'h2'`).
		*
		*   Change it to match your document structure.
		*
		*   This label is typically hidden visually (assuming a `sr-only` CSS class
		*   is defined that does that) and so affects screen readers only.
		*   If you do have such a class, but want to show this section to everyone,
		*   pass different properties with the `footnoteLabelProperties` option.
		* @property {Handlers | null | undefined} [handlers]
		*   Extra handlers for nodes (optional).
		* @property {Array<MdastNodes['type']> | null | undefined} [passThrough]
		*   List of custom mdast node types to pass through (keep) in hast (note that
		*   the node itself is passed, but eventual children are transformed)
		*   (optional).
		* @property {Handler | null | undefined} [unknownHandler]
		*   Handler for all unknown nodes (optional).
		*
		* @typedef State
		*   Info passed around.
		* @property {(node: MdastNodes) => Array<HastElementContent>} all
		*   Transform the children of an mdast parent to hast.
		* @property {<Type extends HastNodes>(from: MdastNodes, to: Type) => HastElement | Type} applyData
		*   Honor the `data` of `from`, and generate an element instead of `node`.
		* @property {Map<string, MdastDefinition>} definitionById
		*   Definitions by their identifier.
		* @property {Map<string, MdastFootnoteDefinition>} footnoteById
		*   Footnote definitions by their identifier.
		* @property {Map<string, number>} footnoteCounts
		*   Counts for how often the same footnote was called.
		* @property {Array<string>} footnoteOrder
		*   Identifiers of order when footnote calls first appear in tree order.
		* @property {Handlers} handlers
		*   Applied handlers.
		* @property {(node: MdastNodes, parent: MdastParents | undefined) => Array<HastElementContent> | HastElementContent | undefined} one
		*   Transform an mdast node to hast.
		* @property {Options} options
		*   Configuration.
		* @property {(from: MdastNodes, node: HastNodes) => undefined} patch
		*   Copy a node’s positional info.
		* @property {<Type extends HastRootContent>(nodes: Array<Type>, loose?: boolean | undefined) => Array<HastText | Type>} wrap
		*   Wrap `nodes` with line endings between each node, adds initial/final line endings when `loose`.
		*/
		const own$2 = {}.hasOwnProperty;
		/** @type {Options} */
		const emptyOptions$1 = {};
		/**
		* Create `state` from an mdast tree.
		*
		* @param {MdastNodes} tree
		*   mdast node to transform.
		* @param {Options | null | undefined} [options]
		*   Configuration (optional).
		* @returns {State}
		*   `state` function.
		*/
		function createState(tree, options) {
			const settings = options || emptyOptions$1;
			/** @type {Map<string, MdastDefinition>} */
			const definitionById = /* @__PURE__ */ new Map();
			/** @type {Map<string, MdastFootnoteDefinition>} */
			const footnoteById = /* @__PURE__ */ new Map();
			/** @type {State} */
			const state = {
				all,
				applyData,
				definitionById,
				footnoteById,
				footnoteCounts: /* @__PURE__ */ new Map(),
				footnoteOrder: [],
				handlers: {
					...handlers,
					...settings.handlers
				},
				one,
				options: settings,
				patch,
				wrap: wrap$1
			};
			visit(tree, function(node) {
				if (node.type === "definition" || node.type === "footnoteDefinition") {
					const map = node.type === "definition" ? definitionById : footnoteById;
					const id = String(node.identifier).toUpperCase();
					if (!map.has(id)) map.set(id, node);
				}
			});
			return state;
			/**
			* Transform an mdast node into a hast node.
			*
			* @param {MdastNodes} node
			*   mdast node.
			* @param {MdastParents | undefined} [parent]
			*   Parent of `node`.
			* @returns {Array<HastElementContent> | HastElementContent | undefined}
			*   Resulting hast node.
			*/
			function one(node, parent) {
				const type = node.type;
				const handle = state.handlers[type];
				if (own$2.call(state.handlers, type) && handle) return handle(state, node, parent);
				if (state.options.passThrough && state.options.passThrough.includes(type)) {
					if ("children" in node) {
						const { children, ...shallow } = node;
						const result = esm_default(shallow);
						result.children = state.all(node);
						return result;
					}
					return esm_default(node);
				}
				return (state.options.unknownHandler || defaultUnknownHandler)(state, node, parent);
			}
			/**
			* Transform the children of an mdast node into hast nodes.
			*
			* @param {MdastNodes} parent
			*   mdast node to compile
			* @returns {Array<HastElementContent>}
			*   Resulting hast nodes.
			*/
			function all(parent) {
				/** @type {Array<HastElementContent>} */
				const values = [];
				if ("children" in parent) {
					const nodes = parent.children;
					let index = -1;
					while (++index < nodes.length) {
						const result = state.one(nodes[index], parent);
						if (result) {
							if (index && nodes[index - 1].type === "break") {
								if (!Array.isArray(result) && result.type === "text") result.value = trimMarkdownSpaceStart(result.value);
								if (!Array.isArray(result) && result.type === "element") {
									const head = result.children[0];
									if (head && head.type === "text") head.value = trimMarkdownSpaceStart(head.value);
								}
							}
							if (Array.isArray(result)) values.push(...result);
							else values.push(result);
						}
					}
				}
				return values;
			}
		}
		/**
		* Copy a node’s positional info.
		*
		* @param {MdastNodes} from
		*   mdast node to copy from.
		* @param {HastNodes} to
		*   hast node to copy into.
		* @returns {undefined}
		*   Nothing.
		*/
		function patch(from, to) {
			if (from.position) to.position = position$1(from);
		}
		/**
		* Honor the `data` of `from` and maybe generate an element instead of `to`.
		*
		* @template {HastNodes} Type
		*   Node type.
		* @param {MdastNodes} from
		*   mdast node to use data from.
		* @param {Type} to
		*   hast node to change.
		* @returns {HastElement | Type}
		*   Nothing.
		*/
		function applyData(from, to) {
			/** @type {HastElement | Type} */
			let result = to;
			if (from && from.data) {
				const hName = from.data.hName;
				const hChildren = from.data.hChildren;
				const hProperties = from.data.hProperties;
				if (typeof hName === "string") {
					if (result.type === "element") result.tagName = hName;
					else result = {
						type: "element",
						tagName: hName,
						properties: {},
						children: "children" in result ? result.children : [result]
					};
				}
				if (result.type === "element" && hProperties) Object.assign(result.properties, esm_default(hProperties));
				if ("children" in result && result.children && hChildren !== null && hChildren !== void 0) result.children = hChildren;
			}
			return result;
		}
		/**
		* Transform an unknown node.
		*
		* @param {State} state
		*   Info passed around.
		* @param {MdastNodes} node
		*   Unknown mdast node.
		* @returns {HastElement | HastText}
		*   Resulting hast node.
		*/
		function defaultUnknownHandler(state, node) {
			const data = node.data || {};
			/** @type {HastElement | HastText} */
			const result = "value" in node && !(own$2.call(data, "hProperties") || own$2.call(data, "hChildren")) ? {
				type: "text",
				value: node.value
			} : {
				type: "element",
				tagName: "div",
				properties: {},
				children: state.all(node)
			};
			state.patch(node, result);
			return state.applyData(node, result);
		}
		/**
		* Wrap `nodes` with line endings between each node.
		*
		* @template {HastRootContent} Type
		*   Node type.
		* @param {Array<Type>} nodes
		*   List of nodes to wrap.
		* @param {boolean | undefined} [loose=false]
		*   Whether to add line endings at start and end (default: `false`).
		* @returns {Array<HastText | Type>}
		*   Wrapped nodes.
		*/
		function wrap$1(nodes, loose) {
			/** @type {Array<HastText | Type>} */
			const result = [];
			let index = -1;
			if (loose) result.push({
				type: "text",
				value: "\n"
			});
			while (++index < nodes.length) {
				if (index) result.push({
					type: "text",
					value: "\n"
				});
				result.push(nodes[index]);
			}
			if (loose && nodes.length > 0) result.push({
				type: "text",
				value: "\n"
			});
			return result;
		}
		/**
		* Trim spaces and tabs at the start of `value`.
		*
		* @param {string} value
		*   Value to trim.
		* @returns {string}
		*   Result.
		*/
		function trimMarkdownSpaceStart(value) {
			let index = 0;
			let code = value.charCodeAt(index);
			while (code === 9 || code === 32) {
				index++;
				code = value.charCodeAt(index);
			}
			return value.slice(index);
		}
		//#endregion
		//#region node_modules/mdast-util-to-hast/lib/index.js
		/**
		* @import {Nodes as HastNodes} from 'hast'
		* @import {Nodes as MdastNodes} from 'mdast'
		* @import {Options} from './state.js'
		*/
		/**
		* Transform mdast to hast.
		*
		* ##### Notes
		*
		* ###### HTML
		*
		* Raw HTML is available in mdast as `html` nodes and can be embedded in hast
		* as semistandard `raw` nodes.
		* Most utilities ignore `raw` nodes but two notable ones don’t:
		*
		* *   `hast-util-to-html` also has an option `allowDangerousHtml` which will
		*     output the raw HTML.
		*     This is typically discouraged as noted by the option name but is useful
		*     if you completely trust authors
		* *   `hast-util-raw` can handle the raw embedded HTML strings by parsing them
		*     into standard hast nodes (`element`, `text`, etc).
		*     This is a heavy task as it needs a full HTML parser, but it is the only
		*     way to support untrusted content
		*
		* ###### Footnotes
		*
		* Many options supported here relate to footnotes.
		* Footnotes are not specified by CommonMark, which we follow by default.
		* They are supported by GitHub, so footnotes can be enabled in markdown with
		* `mdast-util-gfm`.
		*
		* The options `footnoteBackLabel` and `footnoteLabel` define natural language
		* that explains footnotes, which is hidden for sighted users but shown to
		* assistive technology.
		* When your page is not in English, you must define translated values.
		*
		* Back references use ARIA attributes, but the section label itself uses a
		* heading that is hidden with an `sr-only` class.
		* To show it to sighted users, define different attributes in
		* `footnoteLabelProperties`.
		*
		* ###### Clobbering
		*
		* Footnotes introduces a problem, as it links footnote calls to footnote
		* definitions on the page through `id` attributes generated from user content,
		* which results in DOM clobbering.
		*
		* DOM clobbering is this:
		*
		* ```html
		* <p id=x></p>
		* <script>alert(x) // `x` now refers to the DOM `p#x` element<\/script>
		* ```
		*
		* Elements by their ID are made available by browsers on the `window` object,
		* which is a security risk.
		* Using a prefix solves this problem.
		*
		* More information on how to handle clobbering and the prefix is explained in
		* Example: headings (DOM clobbering) in `rehype-sanitize`.
		*
		* ###### Unknown nodes
		*
		* Unknown nodes are nodes with a type that isn’t in `handlers` or `passThrough`.
		* The default behavior for unknown nodes is:
		*
		* *   when the node has a `value` (and doesn’t have `data.hName`,
		*     `data.hProperties`, or `data.hChildren`, see later), create a hast `text`
		*     node
		* *   otherwise, create a `<div>` element (which could be changed with
		*     `data.hName`), with its children mapped from mdast to hast as well
		*
		* This behavior can be changed by passing an `unknownHandler`.
		*
		* @param {MdastNodes} tree
		*   mdast tree.
		* @param {Options | null | undefined} [options]
		*   Configuration (optional).
		* @returns {HastNodes}
		*   hast tree.
		*/
		function toHast(tree, options) {
			const state = createState(tree, options);
			const node = state.one(tree, void 0);
			const foot = footer(state);
			/** @type {HastNodes} */
			const result = Array.isArray(node) ? {
				type: "root",
				children: node
			} : node || {
				type: "root",
				children: []
			};
			if (foot) {
				"children" in result;
				result.children.push({
					type: "text",
					value: "\n"
				}, foot);
			}
			return result;
		}
		//#endregion
		//#region node_modules/remark-rehype/lib/index.js
		/**
		* @import {Root as HastRoot} from 'hast'
		* @import {Root as MdastRoot} from 'mdast'
		* @import {Options as ToHastOptions} from 'mdast-util-to-hast'
		* @import {Processor} from 'unified'
		* @import {VFile} from 'vfile'
		*/
		/**
		* @typedef {Omit<ToHastOptions, 'file'>} Options
		*
		* @callback TransformBridge
		*   Bridge-mode.
		*
		*   Runs the destination with the new hast tree.
		*   Discards result.
		* @param {MdastRoot} tree
		*   Tree.
		* @param {VFile} file
		*   File.
		* @returns {Promise<undefined>}
		*   Nothing.
		*
		* @callback TransformMutate
		*  Mutate-mode.
		*
		*  Further transformers run on the hast tree.
		* @param {MdastRoot} tree
		*   Tree.
		* @param {VFile} file
		*   File.
		* @returns {HastRoot}
		*   Tree (hast).
		*/
		/**
		* Turn markdown into HTML.
		*
		* ##### Notes
		*
		* ###### Signature
		*
		* * if a processor is given,
		*   runs the (rehype) plugins used on it with a hast tree,
		*   then discards the result (*bridge mode*)
		* * otherwise,
		*   returns a hast tree,
		*   the plugins used after `remarkRehype` are rehype plugins (*mutate mode*)
		*
		* > 👉 **Note**:
		* > It’s highly unlikely that you want to pass a `processor`.
		*
		* ###### HTML
		*
		* Raw HTML is available in mdast as `html` nodes and can be embedded in hast
		* as semistandard `raw` nodes.
		* Most plugins ignore `raw` nodes but two notable ones don’t:
		*
		* * `rehype-stringify` also has an option `allowDangerousHtml` which will
		*   output the raw HTML.
		*   This is typically discouraged as noted by the option name but is useful if
		*   you completely trust authors
		* * `rehype-raw` can handle the raw embedded HTML strings by parsing them
		*   into standard hast nodes (`element`, `text`, etc);
		*   this is a heavy task as it needs a full HTML parser,
		*   but it is the only way to support untrusted content
		*
		* ###### Footnotes
		*
		* Many options supported here relate to footnotes.
		* Footnotes are not specified by CommonMark,
		* which we follow by default.
		* They are supported by GitHub,
		* so footnotes can be enabled in markdown with `remark-gfm`.
		*
		* The options `footnoteBackLabel` and `footnoteLabel` define natural language
		* that explains footnotes,
		* which is hidden for sighted users but shown to assistive technology.
		* When your page is not in English,
		* you must define translated values.
		*
		* Back references use ARIA attributes,
		* but the section label itself uses a heading that is hidden with an
		* `sr-only` class.
		* To show it to sighted users,
		* define different attributes in `footnoteLabelProperties`.
		*
		* ###### Clobbering
		*
		* Footnotes introduces a problem,
		* as it links footnote calls to footnote definitions on the page through `id`
		* attributes generated from user content,
		* which results in DOM clobbering.
		*
		* DOM clobbering is this:
		*
		* ```html
		* <p id=x></p>
		* <script>alert(x) // `x` now refers to the DOM `p#x` element<\/script>
		* ```
		*
		* Elements by their ID are made available by browsers on the `window` object,
		* which is a security risk.
		* Using a prefix solves this problem.
		*
		* More information on how to handle clobbering and the prefix is explained in
		* *Example: headings (DOM clobbering)* in `rehype-sanitize`.
		*
		* ###### Unknown nodes
		*
		* Unknown nodes are nodes with a type that isn’t in `handlers` or `passThrough`.
		* The default behavior for unknown nodes is:
		*
		* * when the node has a `value`
		*   (and doesn’t have `data.hName`, `data.hProperties`, or `data.hChildren`,
		*   see later),
		*   create a hast `text` node
		* * otherwise,
		*   create a `<div>` element (which could be changed with `data.hName`),
		*   with its children mapped from mdast to hast as well
		*
		* This behavior can be changed by passing an `unknownHandler`.
		*
		* @overload
		* @param {Processor} processor
		* @param {Readonly<Options> | null | undefined} [options]
		* @returns {TransformBridge}
		*
		* @overload
		* @param {Readonly<Options> | null | undefined} [options]
		* @returns {TransformMutate}
		*
		* @overload
		* @param {Readonly<Options> | Processor | null | undefined} [destination]
		* @param {Readonly<Options> | null | undefined} [options]
		* @returns {TransformBridge | TransformMutate}
		*
		* @param {Readonly<Options> | Processor | null | undefined} [destination]
		*   Processor or configuration (optional).
		* @param {Readonly<Options> | null | undefined} [options]
		*   When a processor was given,
		*   configuration (optional).
		* @returns {TransformBridge | TransformMutate}
		*   Transform.
		*/
		function remarkRehype(destination, options) {
			if (destination && "run" in destination)
 /**
			* @type {TransformBridge}
			*/
			return async function(tree, file) {
				const hastTree = toHast(tree, {
					file,
					...options
				});
				await destination.run(hastTree, file);
			};
			/**
			* @type {TransformMutate}
			*/
			return function(tree, file) {
				return toHast(tree, {
					file,
					...destination || options
				});
			};
		}
		//#endregion
		//#region node_modules/bail/index.js
		/**
		* Throw a given error.
		*
		* @param {Error|null|undefined} [error]
		*   Maybe error.
		* @returns {asserts error is null|undefined}
		*/
		function bail(error) {
			if (error) throw error;
		}
		//#endregion
		//#region node_modules/extend/index.js
		var require_extend = /* @__PURE__ */ __commonJSMin(((exports, module) => {
			var hasOwn = Object.prototype.hasOwnProperty;
			var toStr = Object.prototype.toString;
			var defineProperty = Object.defineProperty;
			var gOPD = Object.getOwnPropertyDescriptor;
			var isArray = function isArray(arr) {
				if (typeof Array.isArray === "function") return Array.isArray(arr);
				return toStr.call(arr) === "[object Array]";
			};
			var isPlainObject = function isPlainObject(obj) {
				if (!obj || toStr.call(obj) !== "[object Object]") return false;
				var hasOwnConstructor = hasOwn.call(obj, "constructor");
				var hasIsPrototypeOf = obj.constructor && obj.constructor.prototype && hasOwn.call(obj.constructor.prototype, "isPrototypeOf");
				if (obj.constructor && !hasOwnConstructor && !hasIsPrototypeOf) return false;
				var key;
				for (key in obj);
				return typeof key === "undefined" || hasOwn.call(obj, key);
			};
			var setProperty = function setProperty(target, options) {
				if (defineProperty && options.name === "__proto__") defineProperty(target, options.name, {
					enumerable: true,
					configurable: true,
					value: options.newValue,
					writable: true
				});
				else target[options.name] = options.newValue;
			};
			var getProperty = function getProperty(obj, name) {
				if (name === "__proto__") {
					if (!hasOwn.call(obj, name)) return;
					else if (gOPD) return gOPD(obj, name).value;
				}
				return obj[name];
			};
			module.exports = function extend() {
				var options, name, src, copy, copyIsArray, clone;
				var target = arguments[0];
				var i = 1;
				var length = arguments.length;
				var deep = false;
				if (typeof target === "boolean") {
					deep = target;
					target = arguments[1] || {};
					i = 2;
				}
				if (target == null || typeof target !== "object" && typeof target !== "function") target = {};
				for (; i < length; ++i) {
					options = arguments[i];
					if (options != null) for (name in options) {
						src = getProperty(target, name);
						copy = getProperty(options, name);
						if (target !== copy) {
							if (deep && copy && (isPlainObject(copy) || (copyIsArray = isArray(copy)))) {
								if (copyIsArray) {
									copyIsArray = false;
									clone = src && isArray(src) ? src : [];
								} else clone = src && isPlainObject(src) ? src : {};
								setProperty(target, {
									name,
									newValue: extend(deep, clone, copy)
								});
							} else if (typeof copy !== "undefined") setProperty(target, {
								name,
								newValue: copy
							});
						}
					}
				}
				return target;
			};
		}));
		//#endregion
		//#region node_modules/is-plain-obj/index.js
		function isPlainObject$1(value) {
			if (typeof value !== "object" || value === null) return false;
			const prototype = Object.getPrototypeOf(value);
			return (prototype === null || prototype === Object.prototype || Object.getPrototypeOf(prototype) === null) && !(Symbol.toStringTag in value) && !(Symbol.iterator in value);
		}
		//#endregion
		//#region node_modules/trough/lib/index.js
		/**
		* @typedef {(error?: Error | null | undefined, ...output: Array<any>) => void} Callback
		*   Callback.
		*
		* @typedef {(...input: Array<any>) => any} Middleware
		*   Ware.
		*
		* @typedef Pipeline
		*   Pipeline.
		* @property {Run} run
		*   Run the pipeline.
		* @property {Use} use
		*   Add middleware.
		*
		* @typedef {(...input: Array<any>) => void} Run
		*   Call all middleware.
		*
		*   Calls `done` on completion with either an error or the output of the
		*   last middleware.
		*
		*   > 👉 **Note**: as the length of input defines whether async functions get a
		*   > `next` function,
		*   > it’s recommended to keep `input` at one value normally.
		
		*
		* @typedef {(fn: Middleware) => Pipeline} Use
		*   Add middleware.
		*/
		/**
		* Create new middleware.
		*
		* @returns {Pipeline}
		*   Pipeline.
		*/
		function trough() {
			/** @type {Array<Middleware>} */
			const fns = [];
			/** @type {Pipeline} */
			const pipeline = {
				run,
				use
			};
			return pipeline;
			/** @type {Run} */
			function run(...values) {
				let middlewareIndex = -1;
				/** @type {Callback} */
				const callback = values.pop();
				if (typeof callback !== "function") throw new TypeError("Expected function as last argument, not " + callback);
				next(null, ...values);
				/**
				* Run the next `fn`, or we’re done.
				*
				* @param {Error | null | undefined} error
				* @param {Array<any>} output
				*/
				function next(error, ...output) {
					const fn = fns[++middlewareIndex];
					let index = -1;
					if (error) {
						callback(error);
						return;
					}
					while (++index < values.length) if (output[index] === null || output[index] === void 0) output[index] = values[index];
					values = output;
					if (fn) wrap(fn, next)(...output);
					else callback(null, ...output);
				}
			}
			/** @type {Use} */
			function use(middelware) {
				if (typeof middelware !== "function") throw new TypeError("Expected `middelware` to be a function, not " + middelware);
				fns.push(middelware);
				return pipeline;
			}
		}
		/**
		* Wrap `middleware` into a uniform interface.
		*
		* You can pass all input to the resulting function.
		* `callback` is then called with the output of `middleware`.
		*
		* If `middleware` accepts more arguments than the later given in input,
		* an extra `done` function is passed to it after that input,
		* which must be called by `middleware`.
		*
		* The first value in `input` is the main input value.
		* All other input values are the rest input values.
		* The values given to `callback` are the input values,
		* merged with every non-nullish output value.
		*
		* * if `middleware` throws an error,
		*   returns a promise that is rejected,
		*   or calls the given `done` function with an error,
		*   `callback` is called with that error
		* * if `middleware` returns a value or returns a promise that is resolved,
		*   that value is the main output value
		* * if `middleware` calls `done`,
		*   all non-nullish values except for the first one (the error) overwrite the
		*   output values
		*
		* @param {Middleware} middleware
		*   Function to wrap.
		* @param {Callback} callback
		*   Callback called with the output of `middleware`.
		* @returns {Run}
		*   Wrapped middleware.
		*/
		function wrap(middleware, callback) {
			/** @type {boolean} */
			let called;
			return wrapped;
			/**
			* Call `middleware`.
			* @this {any}
			* @param {Array<any>} parameters
			* @returns {void}
			*/
			function wrapped(...parameters) {
				const fnExpectsCallback = middleware.length > parameters.length;
				/** @type {any} */
				let result;
				if (fnExpectsCallback) parameters.push(done);
				try {
					result = middleware.apply(this, parameters);
				} catch (error) {
					const exception = error;
					if (fnExpectsCallback && called) throw exception;
					return done(exception);
				}
				if (!fnExpectsCallback) {
					if (result && result.then && typeof result.then === "function") result.then(then, done);
					else if (result instanceof Error) done(result);
					else then(result);
				}
			}
			/**
			* Call `callback`, only once.
			*
			* @type {Callback}
			*/
			function done(error, ...output) {
				if (!called) {
					called = true;
					callback(error, ...output);
				}
			}
			/**
			* Call `done` with one value.
			*
			* @param {any} [value]
			*/
			function then(value) {
				done(null, value);
			}
		}
		//#endregion
		//#region node_modules/vfile/lib/minpath.browser.js
		const minpath = {
			basename,
			dirname,
			extname,
			join,
			sep: "/"
		};
		/**
		* Get the basename from a path.
		*
		* @param {string} path
		*   File path.
		* @param {string | null | undefined} [extname]
		*   Extension to strip.
		* @returns {string}
		*   Stem or basename.
		*/
		function basename(path, extname) {
			if (extname !== void 0 && typeof extname !== "string") throw new TypeError("\"ext\" argument must be a string");
			assertPath$1(path);
			let start = 0;
			let end = -1;
			let index = path.length;
			/** @type {boolean | undefined} */
			let seenNonSlash;
			if (extname === void 0 || extname.length === 0 || extname.length > path.length) {
				while (index--) if (path.codePointAt(index) === 47) {
					if (seenNonSlash) {
						start = index + 1;
						break;
					}
				} else if (end < 0) {
					seenNonSlash = true;
					end = index + 1;
				}
				return end < 0 ? "" : path.slice(start, end);
			}
			if (extname === path) return "";
			let firstNonSlashEnd = -1;
			let extnameIndex = extname.length - 1;
			while (index--) if (path.codePointAt(index) === 47) {
				if (seenNonSlash) {
					start = index + 1;
					break;
				}
			} else {
				if (firstNonSlashEnd < 0) {
					seenNonSlash = true;
					firstNonSlashEnd = index + 1;
				}
				if (extnameIndex > -1) {
					if (path.codePointAt(index) === extname.codePointAt(extnameIndex--)) {
						if (extnameIndex < 0) end = index;
					} else {
						extnameIndex = -1;
						end = firstNonSlashEnd;
					}
				}
			}
			if (start === end) end = firstNonSlashEnd;
			else if (end < 0) end = path.length;
			return path.slice(start, end);
		}
		/**
		* Get the dirname from a path.
		*
		* @param {string} path
		*   File path.
		* @returns {string}
		*   File path.
		*/
		function dirname(path) {
			assertPath$1(path);
			if (path.length === 0) return ".";
			let end = -1;
			let index = path.length;
			/** @type {boolean | undefined} */
			let unmatchedSlash;
			while (--index) if (path.codePointAt(index) === 47) {
				if (unmatchedSlash) {
					end = index;
					break;
				}
			} else if (!unmatchedSlash) unmatchedSlash = true;
			return end < 0 ? path.codePointAt(0) === 47 ? "/" : "." : end === 1 && path.codePointAt(0) === 47 ? "//" : path.slice(0, end);
		}
		/**
		* Get an extname from a path.
		*
		* @param {string} path
		*   File path.
		* @returns {string}
		*   Extname.
		*/
		function extname(path) {
			assertPath$1(path);
			let index = path.length;
			let end = -1;
			let startPart = 0;
			let startDot = -1;
			let preDotState = 0;
			/** @type {boolean | undefined} */
			let unmatchedSlash;
			while (index--) {
				const code = path.codePointAt(index);
				if (code === 47) {
					if (unmatchedSlash) {
						startPart = index + 1;
						break;
					}
					continue;
				}
				if (end < 0) {
					unmatchedSlash = true;
					end = index + 1;
				}
				if (code === 46) {
					if (startDot < 0) startDot = index;
					else if (preDotState !== 1) preDotState = 1;
				} else if (startDot > -1) preDotState = -1;
			}
			if (startDot < 0 || end < 0 || preDotState === 0 || preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) return "";
			return path.slice(startDot, end);
		}
		/**
		* Join segments from a path.
		*
		* @param {Array<string>} segments
		*   Path segments.
		* @returns {string}
		*   File path.
		*/
		function join(...segments) {
			let index = -1;
			/** @type {string | undefined} */
			let joined;
			while (++index < segments.length) {
				assertPath$1(segments[index]);
				if (segments[index]) joined = joined === void 0 ? segments[index] : joined + "/" + segments[index];
			}
			return joined === void 0 ? "." : normalize(joined);
		}
		/**
		* Normalize a basic file path.
		*
		* @param {string} path
		*   File path.
		* @returns {string}
		*   File path.
		*/
		function normalize(path) {
			assertPath$1(path);
			const absolute = path.codePointAt(0) === 47;
			let value = normalizeString(path, !absolute);
			if (value.length === 0 && !absolute) value = ".";
			if (value.length > 0 && path.codePointAt(path.length - 1) === 47) value += "/";
			return absolute ? "/" + value : value;
		}
		/**
		* Resolve `.` and `..` elements in a path with directory names.
		*
		* @param {string} path
		*   File path.
		* @param {boolean} allowAboveRoot
		*   Whether `..` can move above root.
		* @returns {string}
		*   File path.
		*/
		function normalizeString(path, allowAboveRoot) {
			let result = "";
			let lastSegmentLength = 0;
			let lastSlash = -1;
			let dots = 0;
			let index = -1;
			/** @type {number | undefined} */
			let code;
			/** @type {number} */
			let lastSlashIndex;
			while (++index <= path.length) {
				if (index < path.length) code = path.codePointAt(index);
				else if (code === 47) break;
				else code = 47;
				if (code === 47) {
					if (lastSlash === index - 1 || dots === 1) {} else if (lastSlash !== index - 1 && dots === 2) {
						if (result.length < 2 || lastSegmentLength !== 2 || result.codePointAt(result.length - 1) !== 46 || result.codePointAt(result.length - 2) !== 46) {
							if (result.length > 2) {
								lastSlashIndex = result.lastIndexOf("/");
								if (lastSlashIndex !== result.length - 1) {
									if (lastSlashIndex < 0) {
										result = "";
										lastSegmentLength = 0;
									} else {
										result = result.slice(0, lastSlashIndex);
										lastSegmentLength = result.length - 1 - result.lastIndexOf("/");
									}
									lastSlash = index;
									dots = 0;
									continue;
								}
							} else if (result.length > 0) {
								result = "";
								lastSegmentLength = 0;
								lastSlash = index;
								dots = 0;
								continue;
							}
						}
						if (allowAboveRoot) {
							result = result.length > 0 ? result + "/.." : "..";
							lastSegmentLength = 2;
						}
					} else {
						if (result.length > 0) result += "/" + path.slice(lastSlash + 1, index);
						else result = path.slice(lastSlash + 1, index);
						lastSegmentLength = index - lastSlash - 1;
					}
					lastSlash = index;
					dots = 0;
				} else if (code === 46 && dots > -1) dots++;
				else dots = -1;
			}
			return result;
		}
		/**
		* Make sure `path` is a string.
		*
		* @param {string} path
		*   File path.
		* @returns {asserts path is string}
		*   Nothing.
		*/
		function assertPath$1(path) {
			if (typeof path !== "string") throw new TypeError("Path must be a string. Received " + JSON.stringify(path));
		}
		//#endregion
		//#region src/client/shims/path.ts
		var path_default = minpath;
		//#endregion
		//#region node_modules/vfile/lib/minproc.browser.js
		const minproc = { cwd };
		function cwd() {
			return "/";
		}
		//#endregion
		//#region src/client/shims/process.ts
		var process_default = minproc;
		//#endregion
		//#region node_modules/vfile/lib/minurl.shared.js
		/**
		* Checks if a value has the shape of a WHATWG URL object.
		*
		* Using a symbol or instanceof would not be able to recognize URL objects
		* coming from other implementations (e.g. in Electron), so instead we are
		* checking some well known properties for a lack of a better test.
		*
		* We use `href` and `protocol` as they are the only properties that are
		* easy to retrieve and calculate due to the lazy nature of the getters.
		*
		* We check for auth attribute to distinguish legacy url instance with
		* WHATWG URL instance.
		*
		* @param {unknown} fileUrlOrPath
		*   File path or URL.
		* @returns {fileUrlOrPath is URL}
		*   Whether it’s a URL.
		*/
		function isUrl(fileUrlOrPath) {
			return Boolean(fileUrlOrPath !== null && typeof fileUrlOrPath === "object" && "href" in fileUrlOrPath && fileUrlOrPath.href && "protocol" in fileUrlOrPath && fileUrlOrPath.protocol && fileUrlOrPath.auth === void 0);
		}
		//#endregion
		//#region node_modules/vfile/lib/minurl.browser.js
		/**
		* @param {URL | string} path
		*   File URL.
		* @returns {string}
		*   File URL.
		*/
		function urlToPath(path) {
			if (typeof path === "string") path = new URL(path);
			else if (!isUrl(path)) {
				/** @type {NodeJS.ErrnoException} */
				const error = /* @__PURE__ */ new TypeError("The \"path\" argument must be of type string or an instance of URL. Received `" + path + "`");
				error.code = "ERR_INVALID_ARG_TYPE";
				throw error;
			}
			if (path.protocol !== "file:") {
				/** @type {NodeJS.ErrnoException} */
				const error = /* @__PURE__ */ new TypeError("The URL must be of scheme file");
				error.code = "ERR_INVALID_URL_SCHEME";
				throw error;
			}
			return getPathFromURLPosix(path);
		}
		/**
		* Get a path from a POSIX URL.
		*
		* @param {URL} url
		*   URL.
		* @returns {string}
		*   File path.
		*/
		function getPathFromURLPosix(url) {
			if (url.hostname !== "") {
				/** @type {NodeJS.ErrnoException} */
				const error = /* @__PURE__ */ new TypeError("File URL host must be \"localhost\" or empty on darwin");
				error.code = "ERR_INVALID_FILE_URL_HOST";
				throw error;
			}
			const pathname = url.pathname;
			let index = -1;
			while (++index < pathname.length) if (pathname.codePointAt(index) === 37 && pathname.codePointAt(index + 1) === 50) {
				const third = pathname.codePointAt(index + 2);
				if (third === 70 || third === 102) {
					/** @type {NodeJS.ErrnoException} */
					const error = /* @__PURE__ */ new TypeError("File URL path must not include encoded / characters");
					error.code = "ERR_INVALID_FILE_URL_PATH";
					throw error;
				}
			}
			return decodeURIComponent(pathname);
		}
		//#endregion
		//#region node_modules/vfile/lib/index.js
		/**
		* @import {Node, Point, Position} from 'unist'
		* @import {Options as MessageOptions} from 'vfile-message'
		* @import {Compatible, Data, Map, Options, Value} from 'vfile'
		*/
		/**
		* @typedef {object & {type: string, position?: Position | undefined}} NodeLike
		*/
		/**
		* Order of setting (least specific to most), we need this because otherwise
		* `{stem: 'a', path: '~/b.js'}` would throw, as a path is needed before a
		* stem can be set.
		*/
		const order = [
			"history",
			"path",
			"basename",
			"stem",
			"extname",
			"dirname"
		];
		var VFile = class {
			/**
			* Create a new virtual file.
			*
			* `options` is treated as:
			*
			* *   `string` or `Uint8Array` — `{value: options}`
			* *   `URL` — `{path: options}`
			* *   `VFile` — shallow copies its data over to the new file
			* *   `object` — all fields are shallow copied over to the new file
			*
			* Path related fields are set in the following order (least specific to
			* most specific): `history`, `path`, `basename`, `stem`, `extname`,
			* `dirname`.
			*
			* You cannot set `dirname` or `extname` without setting either `history`,
			* `path`, `basename`, or `stem` too.
			*
			* @param {Compatible | null | undefined} [value]
			*   File value.
			* @returns
			*   New instance.
			*/
			constructor(value) {
				/** @type {Options | VFile} */
				let options;
				if (!value) options = {};
				else if (isUrl(value)) options = { path: value };
				else if (typeof value === "string" || isUint8Array$1(value)) options = { value };
				else options = value;
				/**
				* Base of `path` (default: `process.cwd()` or `'/'` in browsers).
				*
				* @type {string}
				*/
				this.cwd = "cwd" in options ? "" : process_default.cwd();
				/**
				* Place to store custom info (default: `{}`).
				*
				* It’s OK to store custom data directly on the file but moving it to
				* `data` is recommended.
				*
				* @type {Data}
				*/
				this.data = {};
				/**
				* List of file paths the file moved between.
				*
				* The first is the original path and the last is the current path.
				*
				* @type {Array<string>}
				*/
				this.history = [];
				/**
				* List of messages associated with the file.
				*
				* @type {Array<VFileMessage>}
				*/
				this.messages = [];
				/**
				* Raw value.
				*
				* @type {Value}
				*/
				this.value;
				/**
				* Source map.
				*
				* This type is equivalent to the `RawSourceMap` type from the `source-map`
				* module.
				*
				* @type {Map | null | undefined}
				*/
				this.map;
				/**
				* Custom, non-string, compiled, representation.
				*
				* This is used by unified to store non-string results.
				* One example is when turning markdown into React nodes.
				*
				* @type {unknown}
				*/
				this.result;
				/**
				* Whether a file was saved to disk.
				*
				* This is used by vfile reporters.
				*
				* @type {boolean}
				*/
				this.stored;
				let index = -1;
				while (++index < order.length) {
					const field = order[index];
					if (field in options && options[field] !== void 0 && options[field] !== null) this[field] = field === "history" ? [...options[field]] : options[field];
				}
				/** @type {string} */
				let field;
				for (field in options) if (!order.includes(field)) this[field] = options[field];
			}
			/**
			* Get the basename (including extname) (example: `'index.min.js'`).
			*
			* @returns {string | undefined}
			*   Basename.
			*/
			get basename() {
				return typeof this.path === "string" ? path_default.basename(this.path) : void 0;
			}
			/**
			* Set basename (including extname) (`'index.min.js'`).
			*
			* Cannot contain path separators (`'/'` on unix, macOS, and browsers, `'\'`
			* on windows).
			* Cannot be nullified (use `file.path = file.dirname` instead).
			*
			* @param {string} basename
			*   Basename.
			* @returns {undefined}
			*   Nothing.
			*/
			set basename(basename) {
				assertNonEmpty(basename, "basename");
				assertPart(basename, "basename");
				this.path = path_default.join(this.dirname || "", basename);
			}
			/**
			* Get the parent path (example: `'~'`).
			*
			* @returns {string | undefined}
			*   Dirname.
			*/
			get dirname() {
				return typeof this.path === "string" ? path_default.dirname(this.path) : void 0;
			}
			/**
			* Set the parent path (example: `'~'`).
			*
			* Cannot be set if there’s no `path` yet.
			*
			* @param {string | undefined} dirname
			*   Dirname.
			* @returns {undefined}
			*   Nothing.
			*/
			set dirname(dirname) {
				assertPath(this.basename, "dirname");
				this.path = path_default.join(dirname || "", this.basename);
			}
			/**
			* Get the extname (including dot) (example: `'.js'`).
			*
			* @returns {string | undefined}
			*   Extname.
			*/
			get extname() {
				return typeof this.path === "string" ? path_default.extname(this.path) : void 0;
			}
			/**
			* Set the extname (including dot) (example: `'.js'`).
			*
			* Cannot contain path separators (`'/'` on unix, macOS, and browsers, `'\'`
			* on windows).
			* Cannot be set if there’s no `path` yet.
			*
			* @param {string | undefined} extname
			*   Extname.
			* @returns {undefined}
			*   Nothing.
			*/
			set extname(extname) {
				assertPart(extname, "extname");
				assertPath(this.dirname, "extname");
				if (extname) {
					if (extname.codePointAt(0) !== 46) throw new Error("`extname` must start with `.`");
					if (extname.includes(".", 1)) throw new Error("`extname` cannot contain multiple dots");
				}
				this.path = path_default.join(this.dirname, this.stem + (extname || ""));
			}
			/**
			* Get the full path (example: `'~/index.min.js'`).
			*
			* @returns {string}
			*   Path.
			*/
			get path() {
				return this.history[this.history.length - 1];
			}
			/**
			* Set the full path (example: `'~/index.min.js'`).
			*
			* Cannot be nullified.
			* You can set a file URL (a `URL` object with a `file:` protocol) which will
			* be turned into a path with `url.fileURLToPath`.
			*
			* @param {URL | string} path
			*   Path.
			* @returns {undefined}
			*   Nothing.
			*/
			set path(path) {
				if (isUrl(path)) path = urlToPath(path);
				assertNonEmpty(path, "path");
				if (this.path !== path) this.history.push(path);
			}
			/**
			* Get the stem (basename w/o extname) (example: `'index.min'`).
			*
			* @returns {string | undefined}
			*   Stem.
			*/
			get stem() {
				return typeof this.path === "string" ? path_default.basename(this.path, this.extname) : void 0;
			}
			/**
			* Set the stem (basename w/o extname) (example: `'index.min'`).
			*
			* Cannot contain path separators (`'/'` on unix, macOS, and browsers, `'\'`
			* on windows).
			* Cannot be nullified (use `file.path = file.dirname` instead).
			*
			* @param {string} stem
			*   Stem.
			* @returns {undefined}
			*   Nothing.
			*/
			set stem(stem) {
				assertNonEmpty(stem, "stem");
				assertPart(stem, "stem");
				this.path = path_default.join(this.dirname || "", stem + (this.extname || ""));
			}
			/**
			* Create a fatal message for `reason` associated with the file.
			*
			* The `fatal` field of the message is set to `true` (error; file not usable)
			* and the `file` field is set to the current file path.
			* The message is added to the `messages` field on `file`.
			*
			* > 🪦 **Note**: also has obsolete signatures.
			*
			* @overload
			* @param {string} reason
			* @param {MessageOptions | null | undefined} [options]
			* @returns {never}
			*
			* @overload
			* @param {string} reason
			* @param {Node | NodeLike | null | undefined} parent
			* @param {string | null | undefined} [origin]
			* @returns {never}
			*
			* @overload
			* @param {string} reason
			* @param {Point | Position | null | undefined} place
			* @param {string | null | undefined} [origin]
			* @returns {never}
			*
			* @overload
			* @param {string} reason
			* @param {string | null | undefined} [origin]
			* @returns {never}
			*
			* @overload
			* @param {Error | VFileMessage} cause
			* @param {Node | NodeLike | null | undefined} parent
			* @param {string | null | undefined} [origin]
			* @returns {never}
			*
			* @overload
			* @param {Error | VFileMessage} cause
			* @param {Point | Position | null | undefined} place
			* @param {string | null | undefined} [origin]
			* @returns {never}
			*
			* @overload
			* @param {Error | VFileMessage} cause
			* @param {string | null | undefined} [origin]
			* @returns {never}
			*
			* @param {Error | VFileMessage | string} causeOrReason
			*   Reason for message, should use markdown.
			* @param {Node | NodeLike | MessageOptions | Point | Position | string | null | undefined} [optionsOrParentOrPlace]
			*   Configuration (optional).
			* @param {string | null | undefined} [origin]
			*   Place in code where the message originates (example:
			*   `'my-package:my-rule'` or `'my-rule'`).
			* @returns {never}
			*   Never.
			* @throws {VFileMessage}
			*   Message.
			*/
			fail(causeOrReason, optionsOrParentOrPlace, origin) {
				const message = this.message(causeOrReason, optionsOrParentOrPlace, origin);
				message.fatal = true;
				throw message;
			}
			/**
			* Create an info message for `reason` associated with the file.
			*
			* The `fatal` field of the message is set to `undefined` (info; change
			* likely not needed) and the `file` field is set to the current file path.
			* The message is added to the `messages` field on `file`.
			*
			* > 🪦 **Note**: also has obsolete signatures.
			*
			* @overload
			* @param {string} reason
			* @param {MessageOptions | null | undefined} [options]
			* @returns {VFileMessage}
			*
			* @overload
			* @param {string} reason
			* @param {Node | NodeLike | null | undefined} parent
			* @param {string | null | undefined} [origin]
			* @returns {VFileMessage}
			*
			* @overload
			* @param {string} reason
			* @param {Point | Position | null | undefined} place
			* @param {string | null | undefined} [origin]
			* @returns {VFileMessage}
			*
			* @overload
			* @param {string} reason
			* @param {string | null | undefined} [origin]
			* @returns {VFileMessage}
			*
			* @overload
			* @param {Error | VFileMessage} cause
			* @param {Node | NodeLike | null | undefined} parent
			* @param {string | null | undefined} [origin]
			* @returns {VFileMessage}
			*
			* @overload
			* @param {Error | VFileMessage} cause
			* @param {Point | Position | null | undefined} place
			* @param {string | null | undefined} [origin]
			* @returns {VFileMessage}
			*
			* @overload
			* @param {Error | VFileMessage} cause
			* @param {string | null | undefined} [origin]
			* @returns {VFileMessage}
			*
			* @param {Error | VFileMessage | string} causeOrReason
			*   Reason for message, should use markdown.
			* @param {Node | NodeLike | MessageOptions | Point | Position | string | null | undefined} [optionsOrParentOrPlace]
			*   Configuration (optional).
			* @param {string | null | undefined} [origin]
			*   Place in code where the message originates (example:
			*   `'my-package:my-rule'` or `'my-rule'`).
			* @returns {VFileMessage}
			*   Message.
			*/
			info(causeOrReason, optionsOrParentOrPlace, origin) {
				const message = this.message(causeOrReason, optionsOrParentOrPlace, origin);
				message.fatal = void 0;
				return message;
			}
			/**
			* Create a message for `reason` associated with the file.
			*
			* The `fatal` field of the message is set to `false` (warning; change may be
			* needed) and the `file` field is set to the current file path.
			* The message is added to the `messages` field on `file`.
			*
			* > 🪦 **Note**: also has obsolete signatures.
			*
			* @overload
			* @param {string} reason
			* @param {MessageOptions | null | undefined} [options]
			* @returns {VFileMessage}
			*
			* @overload
			* @param {string} reason
			* @param {Node | NodeLike | null | undefined} parent
			* @param {string | null | undefined} [origin]
			* @returns {VFileMessage}
			*
			* @overload
			* @param {string} reason
			* @param {Point | Position | null | undefined} place
			* @param {string | null | undefined} [origin]
			* @returns {VFileMessage}
			*
			* @overload
			* @param {string} reason
			* @param {string | null | undefined} [origin]
			* @returns {VFileMessage}
			*
			* @overload
			* @param {Error | VFileMessage} cause
			* @param {Node | NodeLike | null | undefined} parent
			* @param {string | null | undefined} [origin]
			* @returns {VFileMessage}
			*
			* @overload
			* @param {Error | VFileMessage} cause
			* @param {Point | Position | null | undefined} place
			* @param {string | null | undefined} [origin]
			* @returns {VFileMessage}
			*
			* @overload
			* @param {Error | VFileMessage} cause
			* @param {string | null | undefined} [origin]
			* @returns {VFileMessage}
			*
			* @param {Error | VFileMessage | string} causeOrReason
			*   Reason for message, should use markdown.
			* @param {Node | NodeLike | MessageOptions | Point | Position | string | null | undefined} [optionsOrParentOrPlace]
			*   Configuration (optional).
			* @param {string | null | undefined} [origin]
			*   Place in code where the message originates (example:
			*   `'my-package:my-rule'` or `'my-rule'`).
			* @returns {VFileMessage}
			*   Message.
			*/
			message(causeOrReason, optionsOrParentOrPlace, origin) {
				const message = new VFileMessage(causeOrReason, optionsOrParentOrPlace, origin);
				if (this.path) {
					message.name = this.path + ":" + message.name;
					message.file = this.path;
				}
				message.fatal = false;
				this.messages.push(message);
				return message;
			}
			/**
			* Serialize the file.
			*
			* > **Note**: which encodings are supported depends on the engine.
			* > For info on Node.js, see:
			* > <https://nodejs.org/api/util.html#whatwg-supported-encodings>.
			*
			* @param {string | null | undefined} [encoding='utf8']
			*   Character encoding to understand `value` as when it’s a `Uint8Array`
			*   (default: `'utf-8'`).
			* @returns {string}
			*   Serialized file.
			*/
			toString(encoding) {
				if (this.value === void 0) return "";
				if (typeof this.value === "string") return this.value;
				return new TextDecoder(encoding || void 0).decode(this.value);
			}
		};
		/**
		* Assert that `part` is not a path (as in, does not contain `path.sep`).
		*
		* @param {string | null | undefined} part
		*   File path part.
		* @param {string} name
		*   Part name.
		* @returns {undefined}
		*   Nothing.
		*/
		function assertPart(part, name) {
			if (part && part.includes(path_default.sep)) throw new Error("`" + name + "` cannot be a path: did not expect `" + path_default.sep + "`");
		}
		/**
		* Assert that `part` is not empty.
		*
		* @param {string | undefined} part
		*   Thing.
		* @param {string} name
		*   Part name.
		* @returns {asserts part is string}
		*   Nothing.
		*/
		function assertNonEmpty(part, name) {
			if (!part) throw new Error("`" + name + "` cannot be empty");
		}
		/**
		* Assert `path` exists.
		*
		* @param {string | undefined} path
		*   Path.
		* @param {string} name
		*   Dependency name.
		* @returns {asserts path is string}
		*   Nothing.
		*/
		function assertPath(path, name) {
			if (!path) throw new Error("Setting `" + name + "` requires `path` to be set too");
		}
		/**
		* Assert `value` is an `Uint8Array`.
		*
		* @param {unknown} value
		*   thing.
		* @returns {value is Uint8Array}
		*   Whether `value` is an `Uint8Array`.
		*/
		function isUint8Array$1(value) {
			return Boolean(value && typeof value === "object" && "byteLength" in value && "byteOffset" in value);
		}
		//#endregion
		//#region node_modules/unified/lib/callable-instance.js
		const CallableInstance = (
		/**
		* @this {Function}
		* @param {string | symbol} property
		* @returns {(...parameters: Array<unknown>) => unknown}
		*/
		function(property) {
			const proto = this.constructor.prototype;
			const value = proto[property];
			/** @type {(...parameters: Array<unknown>) => unknown} */
			const apply = function() {
				return value.apply(apply, arguments);
			};
			Object.setPrototypeOf(apply, proto);
			return apply;
		});
		//#endregion
		//#region node_modules/unified/lib/index.js
		/**
		* @typedef {import('trough').Pipeline} Pipeline
		*
		* @typedef {import('unist').Node} Node
		*
		* @typedef {import('vfile').Compatible} Compatible
		* @typedef {import('vfile').Value} Value
		*
		* @typedef {import('../index.js').CompileResultMap} CompileResultMap
		* @typedef {import('../index.js').Data} Data
		* @typedef {import('../index.js').Settings} Settings
		*/
		/**
		* @typedef {CompileResultMap[keyof CompileResultMap]} CompileResults
		*   Acceptable results from compilers.
		*
		*   To register custom results, add them to
		*   {@linkcode CompileResultMap}.
		*/
		/**
		* @template {Node} [Tree=Node]
		*   The node that the compiler receives (default: `Node`).
		* @template {CompileResults} [Result=CompileResults]
		*   The thing that the compiler yields (default: `CompileResults`).
		* @callback Compiler
		*   A **compiler** handles the compiling of a syntax tree to something else
		*   (in most cases, text) (TypeScript type).
		*
		*   It is used in the stringify phase and called with a {@linkcode Node}
		*   and {@linkcode VFile} representation of the document to compile.
		*   It should return the textual representation of the given tree (typically
		*   `string`).
		*
		*   > **Note**: unified typically compiles by serializing: most compilers
		*   > return `string` (or `Uint8Array`).
		*   > Some compilers, such as the one configured with
		*   > [`rehype-react`][rehype-react], return other values (in this case, a
		*   > React tree).
		*   > If you’re using a compiler that doesn’t serialize, expect different
		*   > result values.
		*   >
		*   > To register custom results in TypeScript, add them to
		*   > {@linkcode CompileResultMap}.
		*
		*   [rehype-react]: https://github.com/rehypejs/rehype-react
		* @param {Tree} tree
		*   Tree to compile.
		* @param {VFile} file
		*   File associated with `tree`.
		* @returns {Result}
		*   New content: compiled text (`string` or `Uint8Array`, for `file.value`) or
		*   something else (for `file.result`).
		*/
		/**
		* @template {Node} [Tree=Node]
		*   The node that the parser yields (default: `Node`)
		* @callback Parser
		*   A **parser** handles the parsing of text to a syntax tree.
		*
		*   It is used in the parse phase and is called with a `string` and
		*   {@linkcode VFile} of the document to parse.
		*   It must return the syntax tree representation of the given file
		*   ({@linkcode Node}).
		* @param {string} document
		*   Document to parse.
		* @param {VFile} file
		*   File associated with `document`.
		* @returns {Tree}
		*   Node representing the given file.
		*/
		/**
		* @typedef {(
		*   Plugin<Array<any>, any, any> |
		*   PluginTuple<Array<any>, any, any> |
		*   Preset
		* )} Pluggable
		*   Union of the different ways to add plugins and settings.
		*/
		/**
		* @typedef {Array<Pluggable>} PluggableList
		*   List of plugins and presets.
		*/
		/**
		* @template {Array<unknown>} [PluginParameters=[]]
		*   Arguments passed to the plugin (default: `[]`, the empty tuple).
		* @template {Node | string | undefined} [Input=Node]
		*   Value that is expected as input (default: `Node`).
		*
		*   *   If the plugin returns a {@linkcode Transformer}, this
		*       should be the node it expects.
		*   *   If the plugin sets a {@linkcode Parser}, this should be
		*       `string`.
		*   *   If the plugin sets a {@linkcode Compiler}, this should be the
		*       node it expects.
		* @template [Output=Input]
		*   Value that is yielded as output (default: `Input`).
		*
		*   *   If the plugin returns a {@linkcode Transformer}, this
		*       should be the node that that yields.
		*   *   If the plugin sets a {@linkcode Parser}, this should be the
		*       node that it yields.
		*   *   If the plugin sets a {@linkcode Compiler}, this should be
		*       result it yields.
		* @typedef {(
		*   (this: Processor, ...parameters: PluginParameters) =>
		*     Input extends string ? // Parser.
		*        Output extends Node | undefined ? undefined | void : never :
		*     Output extends CompileResults ? // Compiler.
		*        Input extends Node | undefined ? undefined | void : never :
		*     Transformer<
		*       Input extends Node ? Input : Node,
		*       Output extends Node ? Output : Node
		*     > | undefined | void
		* )} Plugin
		*   Single plugin.
		*
		*   Plugins configure the processors they are applied on in the following
		*   ways:
		*
		*   *   they change the processor, such as the parser, the compiler, or by
		*       configuring data
		*   *   they specify how to handle trees and files
		*
		*   In practice, they are functions that can receive options and configure the
		*   processor (`this`).
		*
		*   > **Note**: plugins are called when the processor is *frozen*, not when
		*   > they are applied.
		*/
		/**
		* Tuple of a plugin and its configuration.
		*
		* The first item is a plugin, the rest are its parameters.
		*
		* @template {Array<unknown>} [TupleParameters=[]]
		*   Arguments passed to the plugin (default: `[]`, the empty tuple).
		* @template {Node | string | undefined} [Input=undefined]
		*   Value that is expected as input (optional).
		*
		*   *   If the plugin returns a {@linkcode Transformer}, this
		*       should be the node it expects.
		*   *   If the plugin sets a {@linkcode Parser}, this should be
		*       `string`.
		*   *   If the plugin sets a {@linkcode Compiler}, this should be the
		*       node it expects.
		* @template [Output=undefined] (optional).
		*   Value that is yielded as output.
		*
		*   *   If the plugin returns a {@linkcode Transformer}, this
		*       should be the node that that yields.
		*   *   If the plugin sets a {@linkcode Parser}, this should be the
		*       node that it yields.
		*   *   If the plugin sets a {@linkcode Compiler}, this should be
		*       result it yields.
		* @typedef {(
		*   [
		*     plugin: Plugin<TupleParameters, Input, Output>,
		*     ...parameters: TupleParameters
		*   ]
		* )} PluginTuple
		*/
		/**
		* @typedef Preset
		*   Sharable configuration.
		*
		*   They can contain plugins and settings.
		* @property {PluggableList | undefined} [plugins]
		*   List of plugins and presets (optional).
		* @property {Settings | undefined} [settings]
		*   Shared settings for parsers and compilers (optional).
		*/
		/**
		* @template {VFile} [File=VFile]
		*   The file that the callback receives (default: `VFile`).
		* @callback ProcessCallback
		*   Callback called when the process is done.
		*
		*   Called with either an error or a result.
		* @param {Error | undefined} [error]
		*   Fatal error (optional).
		* @param {File | undefined} [file]
		*   Processed file (optional).
		* @returns {undefined}
		*   Nothing.
		*/
		/**
		* @template {Node} [Tree=Node]
		*   The tree that the callback receives (default: `Node`).
		* @callback RunCallback
		*   Callback called when transformers are done.
		*
		*   Called with either an error or results.
		* @param {Error | undefined} [error]
		*   Fatal error (optional).
		* @param {Tree | undefined} [tree]
		*   Transformed tree (optional).
		* @param {VFile | undefined} [file]
		*   File (optional).
		* @returns {undefined}
		*   Nothing.
		*/
		/**
		* @template {Node} [Output=Node]
		*   Node type that the transformer yields (default: `Node`).
		* @callback TransformCallback
		*   Callback passed to transforms.
		*
		*   If the signature of a `transformer` accepts a third argument, the
		*   transformer may perform asynchronous operations, and must call it.
		* @param {Error | undefined} [error]
		*   Fatal error to stop the process (optional).
		* @param {Output | undefined} [tree]
		*   New, changed, tree (optional).
		* @param {VFile | undefined} [file]
		*   New, changed, file (optional).
		* @returns {undefined}
		*   Nothing.
		*/
		/**
		* @template {Node} [Input=Node]
		*   Node type that the transformer expects (default: `Node`).
		* @template {Node} [Output=Input]
		*   Node type that the transformer yields (default: `Input`).
		* @callback Transformer
		*   Transformers handle syntax trees and files.
		*
		*   They are functions that are called each time a syntax tree and file are
		*   passed through the run phase.
		*   When an error occurs in them (either because it’s thrown, returned,
		*   rejected, or passed to `next`), the process stops.
		*
		*   The run phase is handled by [`trough`][trough], see its documentation for
		*   the exact semantics of these functions.
		*
		*   > **Note**: you should likely ignore `next`: don’t accept it.
		*   > it supports callback-style async work.
		*   > But promises are likely easier to reason about.
		*
		*   [trough]: https://github.com/wooorm/trough#function-fninput-next
		* @param {Input} tree
		*   Tree to handle.
		* @param {VFile} file
		*   File to handle.
		* @param {TransformCallback<Output>} next
		*   Callback.
		* @returns {(
		*   Promise<Output | undefined | void> |
		*   Promise<never> | // For some reason this is needed separately.
		*   Output |
		*   Error |
		*   undefined |
		*   void
		* )}
		*   If you accept `next`, nothing.
		*   Otherwise:
		*
		*   *   `Error` — fatal error to stop the process
		*   *   `Promise<undefined>` or `undefined` — the next transformer keeps using
		*       same tree
		*   *   `Promise<Node>` or `Node` — new, changed, tree
		*/
		/**
		* @template {Node | undefined} ParseTree
		*   Output of `parse`.
		* @template {Node | undefined} HeadTree
		*   Input for `run`.
		* @template {Node | undefined} TailTree
		*   Output for `run`.
		* @template {Node | undefined} CompileTree
		*   Input of `stringify`.
		* @template {CompileResults | undefined} CompileResult
		*   Output of `stringify`.
		* @template {Node | string | undefined} Input
		*   Input of plugin.
		* @template Output
		*   Output of plugin (optional).
		* @typedef {(
		*   Input extends string
		*     ? Output extends Node | undefined
		*       ? // Parser.
		*         Processor<
		*           Output extends undefined ? ParseTree : Output,
		*           HeadTree,
		*           TailTree,
		*           CompileTree,
		*           CompileResult
		*         >
		*       : // Unknown.
		*         Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>
		*     : Output extends CompileResults
		*     ? Input extends Node | undefined
		*       ? // Compiler.
		*         Processor<
		*           ParseTree,
		*           HeadTree,
		*           TailTree,
		*           Input extends undefined ? CompileTree : Input,
		*           Output extends undefined ? CompileResult : Output
		*         >
		*       : // Unknown.
		*         Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>
		*     : Input extends Node | undefined
		*     ? Output extends Node | undefined
		*       ? // Transform.
		*         Processor<
		*           ParseTree,
		*           HeadTree extends undefined ? Input : HeadTree,
		*           Output extends undefined ? TailTree : Output,
		*           CompileTree,
		*           CompileResult
		*         >
		*       : // Unknown.
		*         Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>
		*     : // Unknown.
		*       Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>
		* )} UsePlugin
		*   Create a processor based on the input/output of a {@link Plugin plugin}.
		*/
		/**
		* @template {CompileResults | undefined} Result
		*   Node type that the transformer yields.
		* @typedef {(
		*   Result extends Value | undefined ?
		*     VFile :
		*     VFile & {result: Result}
		*   )} VFileWithOutput
		*   Type to generate a {@linkcode VFile} corresponding to a compiler result.
		*
		*   If a result that is not acceptable on a `VFile` is used, that will
		*   be stored on the `result` field of {@linkcode VFile}.
		*/
		var import_extend = /* @__PURE__ */ __toESM(require_extend(), 1);
		const own$1 = {}.hasOwnProperty;
		/**
		* Create a new processor.
		*
		* @example
		*   This example shows how a new processor can be created (from `remark`) and linked
		*   to **stdin**(4) and **stdout**(4).
		*
		*   ```js
		*   import process from 'node:process'
		*   import concatStream from 'concat-stream'
		*   import {remark} from 'remark'
		*
		*   process.stdin.pipe(
		*     concatStream(function (buf) {
		*       process.stdout.write(String(remark().processSync(buf)))
		*     })
		*   )
		*   ```
		*
		* @returns
		*   New *unfrozen* processor (`processor`).
		*
		*   This processor is configured to work the same as its ancestor.
		*   When the descendant processor is configured in the future it does not
		*   affect the ancestral processor.
		*/
		const unified = new class Processor extends CallableInstance {
			/**
			* Create a processor.
			*/
			constructor() {
				super("copy");
				/**
				* Compiler to use (deprecated).
				*
				* @deprecated
				*   Use `compiler` instead.
				* @type {(
				*   Compiler<
				*     CompileTree extends undefined ? Node : CompileTree,
				*     CompileResult extends undefined ? CompileResults : CompileResult
				*   > |
				*   undefined
				* )}
				*/
				this.Compiler = void 0;
				/**
				* Parser to use (deprecated).
				*
				* @deprecated
				*   Use `parser` instead.
				* @type {(
				*   Parser<ParseTree extends undefined ? Node : ParseTree> |
				*   undefined
				* )}
				*/
				this.Parser = void 0;
				/**
				* Internal list of configured plugins.
				*
				* @deprecated
				*   This is a private internal property and should not be used.
				* @type {Array<PluginTuple<Array<unknown>>>}
				*/
				this.attachers = [];
				/**
				* Compiler to use.
				*
				* @type {(
				*   Compiler<
				*     CompileTree extends undefined ? Node : CompileTree,
				*     CompileResult extends undefined ? CompileResults : CompileResult
				*   > |
				*   undefined
				* )}
				*/
				this.compiler = void 0;
				/**
				* Internal state to track where we are while freezing.
				*
				* @deprecated
				*   This is a private internal property and should not be used.
				* @type {number}
				*/
				this.freezeIndex = -1;
				/**
				* Internal state to track whether we’re frozen.
				*
				* @deprecated
				*   This is a private internal property and should not be used.
				* @type {boolean | undefined}
				*/
				this.frozen = void 0;
				/**
				* Internal state.
				*
				* @deprecated
				*   This is a private internal property and should not be used.
				* @type {Data}
				*/
				this.namespace = {};
				/**
				* Parser to use.
				*
				* @type {(
				*   Parser<ParseTree extends undefined ? Node : ParseTree> |
				*   undefined
				* )}
				*/
				this.parser = void 0;
				/**
				* Internal list of configured transformers.
				*
				* @deprecated
				*   This is a private internal property and should not be used.
				* @type {Pipeline}
				*/
				this.transformers = trough();
			}
			/**
			* Copy a processor.
			*
			* @deprecated
			*   This is a private internal method and should not be used.
			* @returns {Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>}
			*   New *unfrozen* processor ({@linkcode Processor}) that is
			*   configured to work the same as its ancestor.
			*   When the descendant processor is configured in the future it does not
			*   affect the ancestral processor.
			*/
			copy() {
				const destination = new Processor();
				let index = -1;
				while (++index < this.attachers.length) {
					const attacher = this.attachers[index];
					destination.use(...attacher);
				}
				destination.data((0, import_extend.default)(true, {}, this.namespace));
				return destination;
			}
			/**
			* Configure the processor with info available to all plugins.
			* Information is stored in an object.
			*
			* Typically, options can be given to a specific plugin, but sometimes it
			* makes sense to have information shared with several plugins.
			* For example, a list of HTML elements that are self-closing, which is
			* needed during all phases.
			*
			* > **Note**: setting information cannot occur on *frozen* processors.
			* > Call the processor first to create a new unfrozen processor.
			*
			* > **Note**: to register custom data in TypeScript, augment the
			* > {@linkcode Data} interface.
			*
			* @example
			*   This example show how to get and set info:
			*
			*   ```js
			*   import {unified} from 'unified'
			*
			*   const processor = unified().data('alpha', 'bravo')
			*
			*   processor.data('alpha') // => 'bravo'
			*
			*   processor.data() // => {alpha: 'bravo'}
			*
			*   processor.data({charlie: 'delta'})
			*
			*   processor.data() // => {charlie: 'delta'}
			*   ```
			*
			* @template {keyof Data} Key
			*
			* @overload
			* @returns {Data}
			*
			* @overload
			* @param {Data} dataset
			* @returns {Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>}
			*
			* @overload
			* @param {Key} key
			* @returns {Data[Key]}
			*
			* @overload
			* @param {Key} key
			* @param {Data[Key]} value
			* @returns {Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>}
			*
			* @param {Data | Key} [key]
			*   Key to get or set, or entire dataset to set, or nothing to get the
			*   entire dataset (optional).
			* @param {Data[Key]} [value]
			*   Value to set (optional).
			* @returns {unknown}
			*   The current processor when setting, the value at `key` when getting, or
			*   the entire dataset when getting without key.
			*/
			data(key, value) {
				if (typeof key === "string") {
					if (arguments.length === 2) {
						assertUnfrozen("data", this.frozen);
						this.namespace[key] = value;
						return this;
					}
					return own$1.call(this.namespace, key) && this.namespace[key] || void 0;
				}
				if (key) {
					assertUnfrozen("data", this.frozen);
					this.namespace = key;
					return this;
				}
				return this.namespace;
			}
			/**
			* Freeze a processor.
			*
			* Frozen processors are meant to be extended and not to be configured
			* directly.
			*
			* When a processor is frozen it cannot be unfrozen.
			* New processors working the same way can be created by calling the
			* processor.
			*
			* It’s possible to freeze processors explicitly by calling `.freeze()`.
			* Processors freeze automatically when `.parse()`, `.run()`, `.runSync()`,
			* `.stringify()`, `.process()`, or `.processSync()` are called.
			*
			* @returns {Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>}
			*   The current processor.
			*/
			freeze() {
				if (this.frozen) return this;
				const self = this;
				while (++this.freezeIndex < this.attachers.length) {
					const [attacher, ...options] = this.attachers[this.freezeIndex];
					if (options[0] === false) continue;
					if (options[0] === true) options[0] = void 0;
					const transformer = attacher.call(self, ...options);
					if (typeof transformer === "function") this.transformers.use(transformer);
				}
				this.frozen = true;
				this.freezeIndex = Number.POSITIVE_INFINITY;
				return this;
			}
			/**
			* Parse text to a syntax tree.
			*
			* > **Note**: `parse` freezes the processor if not already *frozen*.
			*
			* > **Note**: `parse` performs the parse phase, not the run phase or other
			* > phases.
			*
			* @param {Compatible | undefined} [file]
			*   file to parse (optional); typically `string` or `VFile`; any value
			*   accepted as `x` in `new VFile(x)`.
			* @returns {ParseTree extends undefined ? Node : ParseTree}
			*   Syntax tree representing `file`.
			*/
			parse(file) {
				this.freeze();
				const realFile = vfile(file);
				const parser = this.parser || this.Parser;
				assertParser("parse", parser);
				return parser(String(realFile), realFile);
			}
			/**
			* Process the given file as configured on the processor.
			*
			* > **Note**: `process` freezes the processor if not already *frozen*.
			*
			* > **Note**: `process` performs the parse, run, and stringify phases.
			*
			* @overload
			* @param {Compatible | undefined} file
			* @param {ProcessCallback<VFileWithOutput<CompileResult>>} done
			* @returns {undefined}
			*
			* @overload
			* @param {Compatible | undefined} [file]
			* @returns {Promise<VFileWithOutput<CompileResult>>}
			*
			* @param {Compatible | undefined} [file]
			*   File (optional); typically `string` or `VFile`]; any value accepted as
			*   `x` in `new VFile(x)`.
			* @param {ProcessCallback<VFileWithOutput<CompileResult>> | undefined} [done]
			*   Callback (optional).
			* @returns {Promise<VFile> | undefined}
			*   Nothing if `done` is given.
			*   Otherwise a promise, rejected with a fatal error or resolved with the
			*   processed file.
			*
			*   The parsed, transformed, and compiled value is available at
			*   `file.value` (see note).
			*
			*   > **Note**: unified typically compiles by serializing: most
			*   > compilers return `string` (or `Uint8Array`).
			*   > Some compilers, such as the one configured with
			*   > [`rehype-react`][rehype-react], return other values (in this case, a
			*   > React tree).
			*   > If you’re using a compiler that doesn’t serialize, expect different
			*   > result values.
			*   >
			*   > To register custom results in TypeScript, add them to
			*   > {@linkcode CompileResultMap}.
			*
			*   [rehype-react]: https://github.com/rehypejs/rehype-react
			*/
			process(file, done) {
				const self = this;
				this.freeze();
				assertParser("process", this.parser || this.Parser);
				assertCompiler("process", this.compiler || this.Compiler);
				return done ? executor(void 0, done) : new Promise(executor);
				/**
				* @param {((file: VFileWithOutput<CompileResult>) => undefined | void) | undefined} resolve
				* @param {(error: Error | undefined) => undefined | void} reject
				* @returns {undefined}
				*/
				function executor(resolve, reject) {
					const realFile = vfile(file);
					const parseTree = self.parse(realFile);
					self.run(parseTree, realFile, function(error, tree, file) {
						if (error || !tree || !file) return realDone(error);
						const compileTree = tree;
						const compileResult = self.stringify(compileTree, file);
						if (looksLikeAValue(compileResult)) file.value = compileResult;
						else file.result = compileResult;
						realDone(error, file);
					});
					/**
					* @param {Error | undefined} error
					* @param {VFileWithOutput<CompileResult> | undefined} [file]
					* @returns {undefined}
					*/
					function realDone(error, file) {
						if (error || !file) reject(error);
						else if (resolve) resolve(file);
						else done(void 0, file);
					}
				}
			}
			/**
			* Process the given file as configured on the processor.
			*
			* An error is thrown if asynchronous transforms are configured.
			*
			* > **Note**: `processSync` freezes the processor if not already *frozen*.
			*
			* > **Note**: `processSync` performs the parse, run, and stringify phases.
			*
			* @param {Compatible | undefined} [file]
			*   File (optional); typically `string` or `VFile`; any value accepted as
			*   `x` in `new VFile(x)`.
			* @returns {VFileWithOutput<CompileResult>}
			*   The processed file.
			*
			*   The parsed, transformed, and compiled value is available at
			*   `file.value` (see note).
			*
			*   > **Note**: unified typically compiles by serializing: most
			*   > compilers return `string` (or `Uint8Array`).
			*   > Some compilers, such as the one configured with
			*   > [`rehype-react`][rehype-react], return other values (in this case, a
			*   > React tree).
			*   > If you’re using a compiler that doesn’t serialize, expect different
			*   > result values.
			*   >
			*   > To register custom results in TypeScript, add them to
			*   > {@linkcode CompileResultMap}.
			*
			*   [rehype-react]: https://github.com/rehypejs/rehype-react
			*/
			processSync(file) {
				/** @type {boolean} */
				let complete = false;
				/** @type {VFileWithOutput<CompileResult> | undefined} */
				let result;
				this.freeze();
				assertParser("processSync", this.parser || this.Parser);
				assertCompiler("processSync", this.compiler || this.Compiler);
				this.process(file, realDone);
				assertDone("processSync", "process", complete);
				return result;
				/**
				* @type {ProcessCallback<VFileWithOutput<CompileResult>>}
				*/
				function realDone(error, file) {
					complete = true;
					bail(error);
					result = file;
				}
			}
			/**
			* Run *transformers* on a syntax tree.
			*
			* > **Note**: `run` freezes the processor if not already *frozen*.
			*
			* > **Note**: `run` performs the run phase, not other phases.
			*
			* @overload
			* @param {HeadTree extends undefined ? Node : HeadTree} tree
			* @param {RunCallback<TailTree extends undefined ? Node : TailTree>} done
			* @returns {undefined}
			*
			* @overload
			* @param {HeadTree extends undefined ? Node : HeadTree} tree
			* @param {Compatible | undefined} file
			* @param {RunCallback<TailTree extends undefined ? Node : TailTree>} done
			* @returns {undefined}
			*
			* @overload
			* @param {HeadTree extends undefined ? Node : HeadTree} tree
			* @param {Compatible | undefined} [file]
			* @returns {Promise<TailTree extends undefined ? Node : TailTree>}
			*
			* @param {HeadTree extends undefined ? Node : HeadTree} tree
			*   Tree to transform and inspect.
			* @param {(
			*   RunCallback<TailTree extends undefined ? Node : TailTree> |
			*   Compatible
			* )} [file]
			*   File associated with `node` (optional); any value accepted as `x` in
			*   `new VFile(x)`.
			* @param {RunCallback<TailTree extends undefined ? Node : TailTree>} [done]
			*   Callback (optional).
			* @returns {Promise<TailTree extends undefined ? Node : TailTree> | undefined}
			*   Nothing if `done` is given.
			*   Otherwise, a promise rejected with a fatal error or resolved with the
			*   transformed tree.
			*/
			run(tree, file, done) {
				assertNode(tree);
				this.freeze();
				const transformers = this.transformers;
				if (!done && typeof file === "function") {
					done = file;
					file = void 0;
				}
				return done ? executor(void 0, done) : new Promise(executor);
				/**
				* @param {(
				*   ((tree: TailTree extends undefined ? Node : TailTree) => undefined | void) |
				*   undefined
				* )} resolve
				* @param {(error: Error) => undefined | void} reject
				* @returns {undefined}
				*/
				function executor(resolve, reject) {
					const realFile = vfile(file);
					transformers.run(tree, realFile, realDone);
					/**
					* @param {Error | undefined} error
					* @param {Node} outputTree
					* @param {VFile} file
					* @returns {undefined}
					*/
					function realDone(error, outputTree, file) {
						const resultingTree = outputTree || tree;
						if (error) reject(error);
						else if (resolve) resolve(resultingTree);
						else done(void 0, resultingTree, file);
					}
				}
			}
			/**
			* Run *transformers* on a syntax tree.
			*
			* An error is thrown if asynchronous transforms are configured.
			*
			* > **Note**: `runSync` freezes the processor if not already *frozen*.
			*
			* > **Note**: `runSync` performs the run phase, not other phases.
			*
			* @param {HeadTree extends undefined ? Node : HeadTree} tree
			*   Tree to transform and inspect.
			* @param {Compatible | undefined} [file]
			*   File associated with `node` (optional); any value accepted as `x` in
			*   `new VFile(x)`.
			* @returns {TailTree extends undefined ? Node : TailTree}
			*   Transformed tree.
			*/
			runSync(tree, file) {
				/** @type {boolean} */
				let complete = false;
				/** @type {(TailTree extends undefined ? Node : TailTree) | undefined} */
				let result;
				this.run(tree, file, realDone);
				assertDone("runSync", "run", complete);
				return result;
				/**
				* @type {RunCallback<TailTree extends undefined ? Node : TailTree>}
				*/
				function realDone(error, tree) {
					bail(error);
					result = tree;
					complete = true;
				}
			}
			/**
			* Compile a syntax tree.
			*
			* > **Note**: `stringify` freezes the processor if not already *frozen*.
			*
			* > **Note**: `stringify` performs the stringify phase, not the run phase
			* > or other phases.
			*
			* @param {CompileTree extends undefined ? Node : CompileTree} tree
			*   Tree to compile.
			* @param {Compatible | undefined} [file]
			*   File associated with `node` (optional); any value accepted as `x` in
			*   `new VFile(x)`.
			* @returns {CompileResult extends undefined ? Value : CompileResult}
			*   Textual representation of the tree (see note).
			*
			*   > **Note**: unified typically compiles by serializing: most compilers
			*   > return `string` (or `Uint8Array`).
			*   > Some compilers, such as the one configured with
			*   > [`rehype-react`][rehype-react], return other values (in this case, a
			*   > React tree).
			*   > If you’re using a compiler that doesn’t serialize, expect different
			*   > result values.
			*   >
			*   > To register custom results in TypeScript, add them to
			*   > {@linkcode CompileResultMap}.
			*
			*   [rehype-react]: https://github.com/rehypejs/rehype-react
			*/
			stringify(tree, file) {
				this.freeze();
				const realFile = vfile(file);
				const compiler = this.compiler || this.Compiler;
				assertCompiler("stringify", compiler);
				assertNode(tree);
				return compiler(tree, realFile);
			}
			/**
			* Configure the processor to use a plugin, a list of usable values, or a
			* preset.
			*
			* If the processor is already using a plugin, the previous plugin
			* configuration is changed based on the options that are passed in.
			* In other words, the plugin is not added a second time.
			*
			* > **Note**: `use` cannot be called on *frozen* processors.
			* > Call the processor first to create a new unfrozen processor.
			*
			* @example
			*   There are many ways to pass plugins to `.use()`.
			*   This example gives an overview:
			*
			*   ```js
			*   import {unified} from 'unified'
			*
			*   unified()
			*     // Plugin with options:
			*     .use(pluginA, {x: true, y: true})
			*     // Passing the same plugin again merges configuration (to `{x: true, y: false, z: true}`):
			*     .use(pluginA, {y: false, z: true})
			*     // Plugins:
			*     .use([pluginB, pluginC])
			*     // Two plugins, the second with options:
			*     .use([pluginD, [pluginE, {}]])
			*     // Preset with plugins and settings:
			*     .use({plugins: [pluginF, [pluginG, {}]], settings: {position: false}})
			*     // Settings only:
			*     .use({settings: {position: false}})
			*   ```
			*
			* @template {Array<unknown>} [Parameters=[]]
			* @template {Node | string | undefined} [Input=undefined]
			* @template [Output=Input]
			*
			* @overload
			* @param {Preset | null | undefined} [preset]
			* @returns {Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>}
			*
			* @overload
			* @param {PluggableList} list
			* @returns {Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>}
			*
			* @overload
			* @param {Plugin<Parameters, Input, Output>} plugin
			* @param {...(Parameters | [boolean])} parameters
			* @returns {UsePlugin<ParseTree, HeadTree, TailTree, CompileTree, CompileResult, Input, Output>}
			*
			* @param {PluggableList | Plugin | Preset | null | undefined} value
			*   Usable value.
			* @param {...unknown} parameters
			*   Parameters, when a plugin is given as a usable value.
			* @returns {Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>}
			*   Current processor.
			*/
			use(value, ...parameters) {
				const attachers = this.attachers;
				const namespace = this.namespace;
				assertUnfrozen("use", this.frozen);
				if (value === null || value === void 0) {} else if (typeof value === "function") addPlugin(value, parameters);
				else if (typeof value === "object") {
					if (Array.isArray(value)) addList(value);
					else addPreset(value);
				} else throw new TypeError("Expected usable value, not `" + value + "`");
				return this;
				/**
				* @param {Pluggable} value
				* @returns {undefined}
				*/
				function add(value) {
					if (typeof value === "function") addPlugin(value, []);
					else if (typeof value === "object") {
						if (Array.isArray(value)) {
							const [plugin, ...parameters] = value;
							addPlugin(plugin, parameters);
						} else addPreset(value);
					} else throw new TypeError("Expected usable value, not `" + value + "`");
				}
				/**
				* @param {Preset} result
				* @returns {undefined}
				*/
				function addPreset(result) {
					if (!("plugins" in result) && !("settings" in result)) throw new Error("Expected usable value but received an empty preset, which is probably a mistake: presets typically come with `plugins` and sometimes with `settings`, but this has neither");
					addList(result.plugins);
					if (result.settings) namespace.settings = (0, import_extend.default)(true, namespace.settings, result.settings);
				}
				/**
				* @param {PluggableList | null | undefined} plugins
				* @returns {undefined}
				*/
				function addList(plugins) {
					let index = -1;
					if (plugins === null || plugins === void 0) {} else if (Array.isArray(plugins)) while (++index < plugins.length) {
						const thing = plugins[index];
						add(thing);
					}
					else throw new TypeError("Expected a list of plugins, not `" + plugins + "`");
				}
				/**
				* @param {Plugin} plugin
				* @param {Array<unknown>} parameters
				* @returns {undefined}
				*/
				function addPlugin(plugin, parameters) {
					let index = -1;
					let entryIndex = -1;
					while (++index < attachers.length) if (attachers[index][0] === plugin) {
						entryIndex = index;
						break;
					}
					if (entryIndex === -1) attachers.push([plugin, ...parameters]);
					else if (parameters.length > 0) {
						let [primary, ...rest] = parameters;
						const currentPrimary = attachers[entryIndex][1];
						if (isPlainObject$1(currentPrimary) && isPlainObject$1(primary)) primary = (0, import_extend.default)(true, currentPrimary, primary);
						attachers[entryIndex] = [
							plugin,
							primary,
							...rest
						];
					}
				}
			}
		}().freeze();
		/**
		* Assert a parser is available.
		*
		* @param {string} name
		* @param {unknown} value
		* @returns {asserts value is Parser}
		*/
		function assertParser(name, value) {
			if (typeof value !== "function") throw new TypeError("Cannot `" + name + "` without `parser`");
		}
		/**
		* Assert a compiler is available.
		*
		* @param {string} name
		* @param {unknown} value
		* @returns {asserts value is Compiler}
		*/
		function assertCompiler(name, value) {
			if (typeof value !== "function") throw new TypeError("Cannot `" + name + "` without `compiler`");
		}
		/**
		* Assert the processor is not frozen.
		*
		* @param {string} name
		* @param {unknown} frozen
		* @returns {asserts frozen is false}
		*/
		function assertUnfrozen(name, frozen) {
			if (frozen) throw new Error("Cannot call `" + name + "` on a frozen processor.\nCreate a new processor first, by calling it: use `processor()` instead of `processor`.");
		}
		/**
		* Assert `node` is a unist node.
		*
		* @param {unknown} node
		* @returns {asserts node is Node}
		*/
		function assertNode(node) {
			if (!isPlainObject$1(node) || typeof node.type !== "string") throw new TypeError("Expected node, got `" + node + "`");
		}
		/**
		* Assert that `complete` is `true`.
		*
		* @param {string} name
		* @param {string} asyncName
		* @param {unknown} complete
		* @returns {asserts complete is true}
		*/
		function assertDone(name, asyncName, complete) {
			if (!complete) throw new Error("`" + name + "` finished async. Use `" + asyncName + "` instead");
		}
		/**
		* @param {Compatible | undefined} [value]
		* @returns {VFile}
		*/
		function vfile(value) {
			return looksLikeAVFile(value) ? value : new VFile(value);
		}
		/**
		* @param {Compatible | undefined} [value]
		* @returns {value is VFile}
		*/
		function looksLikeAVFile(value) {
			return Boolean(value && typeof value === "object" && "message" in value && "messages" in value);
		}
		/**
		* @param {unknown} [value]
		* @returns {value is Value}
		*/
		function looksLikeAValue(value) {
			return typeof value === "string" || isUint8Array(value);
		}
		/**
		* Assert `value` is an `Uint8Array`.
		*
		* @param {unknown} value
		*   thing.
		* @returns {value is Uint8Array}
		*   Whether `value` is an `Uint8Array`.
		*/
		function isUint8Array(value) {
			return Boolean(value && typeof value === "object" && "byteLength" in value && "byteOffset" in value);
		}
		//#endregion
		//#region node_modules/react-markdown/lib/index.js
		/**
		* @import {Element, Nodes, Parents, Root} from 'hast'
		* @import {Root as MdastRoot} from 'mdast'
		* @import {ComponentType, JSX, ReactElement, ReactNode} from 'react'
		* @import {Options as RemarkRehypeOptions} from 'remark-rehype'
		* @import {BuildVisitor} from 'unist-util-visit'
		* @import {PluggableList, Processor} from 'unified'
		*/
		/**
		* @callback AllowElement
		*   Filter elements.
		* @param {Readonly<Element>} element
		*   Element to check.
		* @param {number} index
		*   Index of `element` in `parent`.
		* @param {Readonly<Parents> | undefined} parent
		*   Parent of `element`.
		* @returns {boolean | null | undefined}
		*   Whether to allow `element` (default: `false`).
		*/
		/**
		* @typedef ExtraProps
		*   Extra fields we pass.
		* @property {Element | undefined} [node]
		*   passed when `passNode` is on.
		*/
		/**
		* @typedef {{
		*   [Key in keyof JSX.IntrinsicElements]?: ComponentType<JSX.IntrinsicElements[Key] & ExtraProps> | keyof JSX.IntrinsicElements
		* }} Components
		*   Map tag names to components.
		*/
		/**
		* @typedef Deprecation
		*   Deprecation.
		* @property {string} from
		*   Old field.
		* @property {string} id
		*   ID in readme.
		* @property {keyof Options} [to]
		*   New field.
		*/
		/**
		* @typedef Options
		*   Configuration.
		* @property {AllowElement | null | undefined} [allowElement]
		*   Filter elements (optional);
		*   `allowedElements` / `disallowedElements` is used first.
		* @property {ReadonlyArray<string> | null | undefined} [allowedElements]
		*   Tag names to allow (default: all tag names);
		*   cannot combine w/ `disallowedElements`.
		* @property {string | null | undefined} [children]
		*   Markdown.
		* @property {Components | null | undefined} [components]
		*   Map tag names to components.
		* @property {ReadonlyArray<string> | null | undefined} [disallowedElements]
		*   Tag names to disallow (default: `[]`);
		*   cannot combine w/ `allowedElements`.
		* @property {PluggableList | null | undefined} [rehypePlugins]
		*   List of rehype plugins to use.
		* @property {PluggableList | null | undefined} [remarkPlugins]
		*   List of remark plugins to use.
		* @property {Readonly<RemarkRehypeOptions> | null | undefined} [remarkRehypeOptions]
		*   Options to pass through to `remark-rehype`.
		* @property {boolean | null | undefined} [skipHtml=false]
		*   Ignore HTML in markdown completely (default: `false`).
		* @property {boolean | null | undefined} [unwrapDisallowed=false]
		*   Extract (unwrap) what’s in disallowed elements (default: `false`);
		*   normally when say `strong` is not allowed, it and it’s children are dropped,
		*   with `unwrapDisallowed` the element itself is replaced by its children.
		* @property {UrlTransform | null | undefined} [urlTransform]
		*   Change URLs (default: `defaultUrlTransform`)
		*/
		/**
		* @typedef HooksOptionsOnly
		*   Configuration specifically for {@linkcode MarkdownHooks}.
		* @property {ReactNode | null | undefined} [fallback]
		*   Content to render while the processor processing the markdown (optional).
		*/
		/**
		* @typedef {Options & HooksOptionsOnly} HooksOptions
		*   Configuration for {@linkcode MarkdownHooks};
		*   extends the regular {@linkcode Options} with a `fallback` prop.
		*/
		/**
		* @callback UrlTransform
		*   Transform all URLs.
		* @param {string} url
		*   URL.
		* @param {string} key
		*   Property name (example: `'href'`).
		* @param {Readonly<Element>} node
		*   Node.
		* @returns {string | null | undefined}
		*   Transformed URL (optional).
		*/
		/** @type {PluggableList} */
		const emptyPlugins = [];
		/** @type {Readonly<RemarkRehypeOptions>} */
		const emptyRemarkRehypeOptions = { allowDangerousHtml: true };
		const safeProtocol = /^(https?|ircs?|mailto|xmpp)$/i;
		/** @type {ReadonlyArray<Readonly<Deprecation>>} */
		const deprecations = [
			{
				from: "astPlugins",
				id: "remove-buggy-html-in-markdown-parser"
			},
			{
				from: "allowDangerousHtml",
				id: "remove-buggy-html-in-markdown-parser"
			},
			{
				from: "allowNode",
				id: "replace-allownode-allowedtypes-and-disallowedtypes",
				to: "allowElement"
			},
			{
				from: "allowedTypes",
				id: "replace-allownode-allowedtypes-and-disallowedtypes",
				to: "allowedElements"
			},
			{
				from: "className",
				id: "remove-classname"
			},
			{
				from: "disallowedTypes",
				id: "replace-allownode-allowedtypes-and-disallowedtypes",
				to: "disallowedElements"
			},
			{
				from: "escapeHtml",
				id: "remove-buggy-html-in-markdown-parser"
			},
			{
				from: "includeElementIndex",
				id: "#remove-includeelementindex"
			},
			{
				from: "includeNodeIndex",
				id: "change-includenodeindex-to-includeelementindex"
			},
			{
				from: "linkTarget",
				id: "remove-linktarget"
			},
			{
				from: "plugins",
				id: "change-plugins-to-remarkplugins",
				to: "remarkPlugins"
			},
			{
				from: "rawSourcePos",
				id: "#remove-rawsourcepos"
			},
			{
				from: "renderers",
				id: "change-renderers-to-components",
				to: "components"
			},
			{
				from: "source",
				id: "change-source-to-children",
				to: "children"
			},
			{
				from: "sourcePos",
				id: "#remove-sourcepos"
			},
			{
				from: "transformImageUri",
				id: "#add-urltransform",
				to: "urlTransform"
			},
			{
				from: "transformLinkUri",
				id: "#add-urltransform",
				to: "urlTransform"
			}
		];
		/**
		* Component to render markdown.
		*
		* This is a synchronous component.
		* When using async plugins,
		* see {@linkcode MarkdownAsync} or {@linkcode MarkdownHooks}.
		*
		* @param {Readonly<Options>} options
		*   Props.
		* @returns {ReactElement}
		*   React element.
		*/
		function Markdown(options) {
			const processor = createProcessor(options);
			const file = createFile(options);
			return post(processor.runSync(processor.parse(file), file), options);
		}
		/**
		* Set up the `unified` processor.
		*
		* @param {Readonly<Options>} options
		*   Props.
		* @returns {Processor<MdastRoot, MdastRoot, Root, undefined, undefined>}
		*   Result.
		*/
		function createProcessor(options) {
			const rehypePlugins = options.rehypePlugins || emptyPlugins;
			const remarkPlugins = options.remarkPlugins || emptyPlugins;
			const remarkRehypeOptions = options.remarkRehypeOptions ? {
				...options.remarkRehypeOptions,
				...emptyRemarkRehypeOptions
			} : emptyRemarkRehypeOptions;
			return unified().use(remarkParse).use(remarkPlugins).use(remarkRehype, remarkRehypeOptions).use(rehypePlugins);
		}
		/**
		* Set up the virtual file.
		*
		* @param {Readonly<Options>} options
		*   Props.
		* @returns {VFile}
		*   Result.
		*/
		function createFile(options) {
			const children = options.children || "";
			const file = new VFile();
			if (typeof children === "string") file.value = children;
			else "" + children;
			return file;
		}
		/**
		* Process the result from unified some more.
		*
		* @param {Nodes} tree
		*   Tree.
		* @param {Readonly<Options>} options
		*   Props.
		* @returns {ReactElement}
		*   React element.
		*/
		function post(tree, options) {
			const allowedElements = options.allowedElements;
			const allowElement = options.allowElement;
			const components = options.components;
			const disallowedElements = options.disallowedElements;
			const skipHtml = options.skipHtml;
			const unwrapDisallowed = options.unwrapDisallowed;
			const urlTransform = options.urlTransform || defaultUrlTransform;
			for (const deprecation of deprecations) if (Object.hasOwn(options, deprecation.from)) "" + deprecation.from + (deprecation.to ? "use `" + deprecation.to + "` instead" : "remove it") + deprecation.id;
			if (allowedElements && disallowedElements);
			visit(tree, transform);
			return toJsxRuntime(tree, {
				Fragment: react_jsx_runtime.Fragment,
				components,
				ignoreInvalidStyle: true,
				jsx: react_jsx_runtime.jsx,
				jsxs: react_jsx_runtime.jsxs,
				passKeys: true,
				passNode: true
			});
			/** @type {BuildVisitor<Root>} */
			function transform(node, index, parent) {
				if (node.type === "raw" && parent && typeof index === "number") {
					if (skipHtml) parent.children.splice(index, 1);
					else parent.children[index] = {
						type: "text",
						value: node.value
					};
					return index;
				}
				if (node.type === "element") {
					/** @type {string} */
					let key;
					for (key in urlAttributes) if (Object.hasOwn(urlAttributes, key) && Object.hasOwn(node.properties, key)) {
						const value = node.properties[key];
						const test = urlAttributes[key];
						if (test === null || test.includes(node.tagName)) node.properties[key] = urlTransform(String(value || ""), key, node);
					}
				}
				if (node.type === "element") {
					let remove = allowedElements ? !allowedElements.includes(node.tagName) : disallowedElements ? disallowedElements.includes(node.tagName) : false;
					if (!remove && allowElement && typeof index === "number") remove = !allowElement(node, index, parent);
					if (remove && parent && typeof index === "number") {
						if (unwrapDisallowed && node.children) parent.children.splice(index, 1, ...node.children);
						else parent.children.splice(index, 1);
						return index;
					}
				}
			}
		}
		/**
		* Make a URL safe.
		*
		* @satisfies {UrlTransform}
		* @param {string} value
		*   URL.
		* @returns {string}
		*   Safe URL.
		*/
		function defaultUrlTransform(value) {
			const colon = value.indexOf(":");
			const questionMark = value.indexOf("?");
			const numberSign = value.indexOf("#");
			const slash = value.indexOf("/");
			if (colon === -1 || slash !== -1 && colon > slash || questionMark !== -1 && colon > questionMark || numberSign !== -1 && colon > numberSign || safeProtocol.test(value.slice(0, colon))) return value;
			return "";
		}
		//#endregion
		//#region node_modules/ccount/index.js
		/**
		* Count how often a character (or substring) is used in a string.
		*
		* @param {string} value
		*   Value to search in.
		* @param {string} character
		*   Character (or substring) to look for.
		* @return {number}
		*   Number of times `character` occurred in `value`.
		*/
		function ccount(value, character) {
			const source = String(value);
			if (typeof character !== "string") throw new TypeError("Expected character");
			let count = 0;
			let index = source.indexOf(character);
			while (index !== -1) {
				count++;
				index = source.indexOf(character, index + character.length);
			}
			return count;
		}
		//#endregion
		//#region node_modules/escape-string-regexp/index.js
		function escapeStringRegexp(string) {
			if (typeof string !== "string") throw new TypeError("Expected a string");
			return string.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&").replace(/-/g, "\\x2d");
		}
		//#endregion
		//#region node_modules/mdast-util-find-and-replace/lib/index.js
		/**
		* @import {Nodes, Parents, PhrasingContent, Root, Text} from 'mdast'
		* @import {BuildVisitor, Test, VisitorResult} from 'unist-util-visit-parents'
		*/
		/**
		* @typedef RegExpMatchObject
		*   Info on the match.
		* @property {number} index
		*   The index of the search at which the result was found.
		* @property {string} input
		*   A copy of the search string in the text node.
		* @property {[...Array<Parents>, Text]} stack
		*   All ancestors of the text node, where the last node is the text itself.
		*
		* @typedef {RegExp | string} Find
		*   Pattern to find.
		*
		*   Strings are escaped and then turned into global expressions.
		*
		* @typedef {Array<FindAndReplaceTuple>} FindAndReplaceList
		*   Several find and replaces, in array form.
		*
		* @typedef {[Find, Replace?]} FindAndReplaceTuple
		*   Find and replace in tuple form.
		*
		* @typedef {ReplaceFunction | string | null | undefined} Replace
		*   Thing to replace with.
		*
		* @callback ReplaceFunction
		*   Callback called when a search matches.
		* @param {...any} parameters
		*   The parameters are the result of corresponding search expression:
		*
		*   * `value` (`string`) — whole match
		*   * `...capture` (`Array<string>`) — matches from regex capture groups
		*   * `match` (`RegExpMatchObject`) — info on the match
		* @returns {Array<PhrasingContent> | PhrasingContent | string | false | null | undefined}
		*   Thing to replace with.
		*
		*   * when `null`, `undefined`, `''`, remove the match
		*   * …or when `false`, do not replace at all
		*   * …or when `string`, replace with a text node of that value
		*   * …or when `Node` or `Array<Node>`, replace with those nodes
		*
		* @typedef {[RegExp, ReplaceFunction]} Pair
		*   Normalized find and replace.
		*
		* @typedef {Array<Pair>} Pairs
		*   All find and replaced.
		*
		* @typedef Options
		*   Configuration.
		* @property {Test | null | undefined} [ignore]
		*   Test for which nodes to ignore (optional).
		*/
		/**
		* Find patterns in a tree and replace them.
		*
		* The algorithm searches the tree in *preorder* for complete values in `Text`
		* nodes.
		* Partial matches are not supported.
		*
		* @param {Nodes} tree
		*   Tree to change.
		* @param {FindAndReplaceList | FindAndReplaceTuple} list
		*   Patterns to find.
		* @param {Options | null | undefined} [options]
		*   Configuration (when `find` is not `Find`).
		* @returns {undefined}
		*   Nothing.
		*/
		function findAndReplace(tree, list, options) {
			const ignored = convert((options || {}).ignore || []);
			const pairs = toPairs(list);
			let pairIndex = -1;
			while (++pairIndex < pairs.length) visitParents(tree, "text", visitor);
			/** @type {BuildVisitor<Root, 'text'>} */
			function visitor(node, parents) {
				let index = -1;
				/** @type {Parents | undefined} */
				let grandparent;
				while (++index < parents.length) {
					const parent = parents[index];
					/** @type {Array<Nodes> | undefined} */
					const siblings = grandparent ? grandparent.children : void 0;
					if (ignored(parent, siblings ? siblings.indexOf(parent) : void 0, grandparent)) return;
					grandparent = parent;
				}
				if (grandparent) return handler(node, parents);
			}
			/**
			* Handle a text node which is not in an ignored parent.
			*
			* @param {Text} node
			*   Text node.
			* @param {Array<Parents>} parents
			*   Parents.
			* @returns {VisitorResult}
			*   Result.
			*/
			function handler(node, parents) {
				const parent = parents[parents.length - 1];
				const find = pairs[pairIndex][0];
				const replace = pairs[pairIndex][1];
				let start = 0;
				const index = parent.children.indexOf(node);
				let change = false;
				/** @type {Array<PhrasingContent>} */
				let nodes = [];
				find.lastIndex = 0;
				let match = find.exec(node.value);
				while (match) {
					const position = match.index;
					/** @type {RegExpMatchObject} */
					const matchObject = {
						index: match.index,
						input: match.input,
						stack: [...parents, node]
					};
					let value = replace(...match, matchObject);
					if (typeof value === "string") value = value.length > 0 ? {
						type: "text",
						value
					} : void 0;
					if (value === false) find.lastIndex = position + 1;
					else {
						if (start !== position) nodes.push({
							type: "text",
							value: node.value.slice(start, position)
						});
						if (Array.isArray(value)) nodes.push(...value);
						else if (value) nodes.push(value);
						start = position + match[0].length;
						change = true;
					}
					if (!find.global) break;
					match = find.exec(node.value);
				}
				if (change) {
					if (start < node.value.length) nodes.push({
						type: "text",
						value: node.value.slice(start)
					});
					parent.children.splice(index, 1, ...nodes);
				} else nodes = [node];
				return index + nodes.length;
			}
		}
		/**
		* Turn a tuple or a list of tuples into pairs.
		*
		* @param {FindAndReplaceList | FindAndReplaceTuple} tupleOrList
		*   Schema.
		* @returns {Pairs}
		*   Clean pairs.
		*/
		function toPairs(tupleOrList) {
			/** @type {Pairs} */
			const result = [];
			if (!Array.isArray(tupleOrList)) throw new TypeError("Expected find and replace tuple or list of tuples");
			/** @type {FindAndReplaceList} */
			const list = !tupleOrList[0] || Array.isArray(tupleOrList[0]) ? tupleOrList : [tupleOrList];
			let index = -1;
			while (++index < list.length) {
				const tuple = list[index];
				result.push([toExpression(tuple[0]), toFunction(tuple[1])]);
			}
			return result;
		}
		/**
		* Turn a find into an expression.
		*
		* @param {Find} find
		*   Find.
		* @returns {RegExp}
		*   Expression.
		*/
		function toExpression(find) {
			return typeof find === "string" ? new RegExp(escapeStringRegexp(find), "g") : find;
		}
		/**
		* Turn a replace into a function.
		*
		* @param {Replace} replace
		*   Replace.
		* @returns {ReplaceFunction}
		*   Function.
		*/
		function toFunction(replace) {
			return typeof replace === "function" ? replace : function() {
				return replace;
			};
		}
		//#endregion
		//#region node_modules/mdast-util-gfm-autolink-literal/lib/index.js
		/**
		* @import {RegExpMatchObject, ReplaceFunction} from 'mdast-util-find-and-replace'
		* @import {CompileContext, Extension as FromMarkdownExtension, Handle as FromMarkdownHandle, Transform as FromMarkdownTransform} from 'mdast-util-from-markdown'
		* @import {ConstructName, Options as ToMarkdownExtension} from 'mdast-util-to-markdown'
		* @import {Link, PhrasingContent} from 'mdast'
		*/
		/** @type {ConstructName} */
		const inConstruct = "phrasing";
		/** @type {Array<ConstructName>} */
		const notInConstruct = [
			"autolink",
			"link",
			"image",
			"label"
		];
		/**
		* Create an extension for `mdast-util-from-markdown` to enable GFM autolink
		* literals in markdown.
		*
		* @returns {FromMarkdownExtension}
		*   Extension for `mdast-util-to-markdown` to enable GFM autolink literals.
		*/
		function gfmAutolinkLiteralFromMarkdown() {
			return {
				transforms: [transformGfmAutolinkLiterals],
				enter: {
					literalAutolink: enterLiteralAutolink,
					literalAutolinkEmail: enterLiteralAutolinkValue,
					literalAutolinkHttp: enterLiteralAutolinkValue,
					literalAutolinkWww: enterLiteralAutolinkValue
				},
				exit: {
					literalAutolink: exitLiteralAutolink,
					literalAutolinkEmail: exitLiteralAutolinkEmail,
					literalAutolinkHttp: exitLiteralAutolinkHttp,
					literalAutolinkWww: exitLiteralAutolinkWww
				}
			};
		}
		/**
		* Create an extension for `mdast-util-to-markdown` to enable GFM autolink
		* literals in markdown.
		*
		* @returns {ToMarkdownExtension}
		*   Extension for `mdast-util-to-markdown` to enable GFM autolink literals.
		*/
		function gfmAutolinkLiteralToMarkdown() {
			return { unsafe: [
				{
					character: "@",
					before: "[+\\-.\\w]",
					after: "[\\-.\\w]",
					inConstruct,
					notInConstruct
				},
				{
					character: ".",
					before: "[Ww]",
					after: "[\\-.\\w]",
					inConstruct,
					notInConstruct
				},
				{
					character: ":",
					before: "[ps]",
					after: "\\/",
					inConstruct,
					notInConstruct
				}
			] };
		}
		/**
		* @this {CompileContext}
		* @type {FromMarkdownHandle}
		*/
		function enterLiteralAutolink(token) {
			this.enter({
				type: "link",
				title: null,
				url: "",
				children: []
			}, token);
		}
		/**
		* @this {CompileContext}
		* @type {FromMarkdownHandle}
		*/
		function enterLiteralAutolinkValue(token) {
			this.config.enter.autolinkProtocol.call(this, token);
		}
		/**
		* @this {CompileContext}
		* @type {FromMarkdownHandle}
		*/
		function exitLiteralAutolinkHttp(token) {
			this.config.exit.autolinkProtocol.call(this, token);
		}
		/**
		* @this {CompileContext}
		* @type {FromMarkdownHandle}
		*/
		function exitLiteralAutolinkWww(token) {
			this.config.exit.data.call(this, token);
			const node = this.stack[this.stack.length - 1];
			node.type;
			node.url = "http://" + this.sliceSerialize(token);
		}
		/**
		* @this {CompileContext}
		* @type {FromMarkdownHandle}
		*/
		function exitLiteralAutolinkEmail(token) {
			this.config.exit.autolinkEmail.call(this, token);
		}
		/**
		* @this {CompileContext}
		* @type {FromMarkdownHandle}
		*/
		function exitLiteralAutolink(token) {
			this.exit(token);
		}
		/** @type {FromMarkdownTransform} */
		function transformGfmAutolinkLiterals(tree) {
			findAndReplace(tree, [[/(https?:\/\/|www(?=\.))([-.\w]+)([^ \t\r\n]*)/gi, findUrl], [/(?<=^|\s|\p{P}|\p{S})([-.\w+]+)@([-\w]+(?:\.[-\w]+)+)/gu, findEmail]], { ignore: ["link", "linkReference"] });
		}
		/**
		* @type {ReplaceFunction}
		* @param {string} _
		* @param {string} protocol
		* @param {string} domain
		* @param {string} path
		* @param {RegExpMatchObject} match
		* @returns {Array<PhrasingContent> | Link | false}
		*/
		function findUrl(_, protocol, domain, path, match) {
			let prefix = "";
			if (!previous(match)) return false;
			if (/^w/i.test(protocol)) {
				domain = protocol + domain;
				protocol = "";
				prefix = "http://";
			}
			if (!isCorrectDomain(domain)) return false;
			const parts = splitUrl(domain + path);
			if (!parts[0]) return false;
			/** @type {Link} */
			const result = {
				type: "link",
				title: null,
				url: prefix + protocol + parts[0],
				children: [{
					type: "text",
					value: protocol + parts[0]
				}]
			};
			if (parts[1]) return [result, {
				type: "text",
				value: parts[1]
			}];
			return result;
		}
		/**
		* @type {ReplaceFunction}
		* @param {string} _
		* @param {string} atext
		* @param {string} label
		* @param {RegExpMatchObject} match
		* @returns {Link | false}
		*/
		function findEmail(_, atext, label, match) {
			if (!previous(match, true) || /[-\d_]$/.test(label)) return false;
			return {
				type: "link",
				title: null,
				url: "mailto:" + atext + "@" + label,
				children: [{
					type: "text",
					value: atext + "@" + label
				}]
			};
		}
		/**
		* @param {string} domain
		* @returns {boolean}
		*/
		function isCorrectDomain(domain) {
			const parts = domain.split(".");
			if (parts.length < 2 || parts[parts.length - 1] && (/_/.test(parts[parts.length - 1]) || !/[a-zA-Z\d]/.test(parts[parts.length - 1])) || parts[parts.length - 2] && (/_/.test(parts[parts.length - 2]) || !/[a-zA-Z\d]/.test(parts[parts.length - 2]))) return false;
			return true;
		}
		/**
		* @param {string} url
		* @returns {[string, string | undefined]}
		*/
		function splitUrl(url) {
			const trailExec = /[!"&'),.:;<>?\]}]+$/.exec(url);
			if (!trailExec) return [url, void 0];
			url = url.slice(0, trailExec.index);
			let trail = trailExec[0];
			let closingParenIndex = trail.indexOf(")");
			const openingParens = ccount(url, "(");
			let closingParens = ccount(url, ")");
			while (closingParenIndex !== -1 && openingParens > closingParens) {
				url += trail.slice(0, closingParenIndex + 1);
				trail = trail.slice(closingParenIndex + 1);
				closingParenIndex = trail.indexOf(")");
				closingParens++;
			}
			return [url, trail];
		}
		/**
		* @param {RegExpMatchObject} match
		* @param {boolean | null | undefined} [email=false]
		* @returns {boolean}
		*/
		function previous(match, email) {
			const code = match.input.charCodeAt(match.index - 1);
			return (match.index === 0 || unicodeWhitespace(code) || unicodePunctuation(code)) && (!email || code !== 47);
		}
		//#endregion
		//#region node_modules/mdast-util-gfm-footnote/lib/index.js
		/**
		* @import {
		*   CompileContext,
		*   Extension as FromMarkdownExtension,
		*   Handle as FromMarkdownHandle
		* } from 'mdast-util-from-markdown'
		* @import {ToMarkdownOptions} from 'mdast-util-gfm-footnote'
		* @import {
		*   Handle as ToMarkdownHandle,
		*   Map,
		*   Options as ToMarkdownExtension
		* } from 'mdast-util-to-markdown'
		* @import {FootnoteDefinition, FootnoteReference} from 'mdast'
		*/
		footnoteReference.peek = footnoteReferencePeek;
		/**
		* @this {CompileContext}
		* @type {FromMarkdownHandle}
		*/
		function enterFootnoteCallString() {
			this.buffer();
		}
		/**
		* @this {CompileContext}
		* @type {FromMarkdownHandle}
		*/
		function enterFootnoteCall(token) {
			this.enter({
				type: "footnoteReference",
				identifier: "",
				label: ""
			}, token);
		}
		/**
		* @this {CompileContext}
		* @type {FromMarkdownHandle}
		*/
		function enterFootnoteDefinitionLabelString() {
			this.buffer();
		}
		/**
		* @this {CompileContext}
		* @type {FromMarkdownHandle}
		*/
		function enterFootnoteDefinition(token) {
			this.enter({
				type: "footnoteDefinition",
				identifier: "",
				label: "",
				children: []
			}, token);
		}
		/**
		* @this {CompileContext}
		* @type {FromMarkdownHandle}
		*/
		function exitFootnoteCallString(token) {
			const label = this.resume();
			const node = this.stack[this.stack.length - 1];
			node.type;
			node.identifier = normalizeIdentifier(this.sliceSerialize(token)).toLowerCase();
			node.label = label;
		}
		/**
		* @this {CompileContext}
		* @type {FromMarkdownHandle}
		*/
		function exitFootnoteCall(token) {
			this.exit(token);
		}
		/**
		* @this {CompileContext}
		* @type {FromMarkdownHandle}
		*/
		function exitFootnoteDefinitionLabelString(token) {
			const label = this.resume();
			const node = this.stack[this.stack.length - 1];
			node.type;
			node.identifier = normalizeIdentifier(this.sliceSerialize(token)).toLowerCase();
			node.label = label;
		}
		/**
		* @this {CompileContext}
		* @type {FromMarkdownHandle}
		*/
		function exitFootnoteDefinition(token) {
			this.exit(token);
		}
		/** @type {ToMarkdownHandle} */
		function footnoteReferencePeek() {
			return "[";
		}
		/**
		* @type {ToMarkdownHandle}
		* @param {FootnoteReference} node
		*/
		function footnoteReference(node, _, state, info) {
			const tracker = state.createTracker(info);
			let value = tracker.move("[^");
			const exit = state.enter("footnoteReference");
			const subexit = state.enter("reference");
			value += tracker.move(state.safe(state.associationId(node), {
				after: "]",
				before: value
			}));
			subexit();
			exit();
			value += tracker.move("]");
			return value;
		}
		/**
		* Create an extension for `mdast-util-from-markdown` to enable GFM footnotes
		* in markdown.
		*
		* @returns {FromMarkdownExtension}
		*   Extension for `mdast-util-from-markdown`.
		*/
		function gfmFootnoteFromMarkdown() {
			return {
				enter: {
					gfmFootnoteCallString: enterFootnoteCallString,
					gfmFootnoteCall: enterFootnoteCall,
					gfmFootnoteDefinitionLabelString: enterFootnoteDefinitionLabelString,
					gfmFootnoteDefinition: enterFootnoteDefinition
				},
				exit: {
					gfmFootnoteCallString: exitFootnoteCallString,
					gfmFootnoteCall: exitFootnoteCall,
					gfmFootnoteDefinitionLabelString: exitFootnoteDefinitionLabelString,
					gfmFootnoteDefinition: exitFootnoteDefinition
				}
			};
		}
		/**
		* Create an extension for `mdast-util-to-markdown` to enable GFM footnotes
		* in markdown.
		*
		* @param {ToMarkdownOptions | null | undefined} [options]
		*   Configuration (optional).
		* @returns {ToMarkdownExtension}
		*   Extension for `mdast-util-to-markdown`.
		*/
		function gfmFootnoteToMarkdown(options) {
			let firstLineBlank = false;
			if (options && options.firstLineBlank) firstLineBlank = true;
			return {
				handlers: {
					footnoteDefinition,
					footnoteReference
				},
				unsafe: [{
					character: "[",
					inConstruct: [
						"label",
						"phrasing",
						"reference"
					]
				}]
			};
			/**
			* @type {ToMarkdownHandle}
			* @param {FootnoteDefinition} node
			*/
			function footnoteDefinition(node, _, state, info) {
				const tracker = state.createTracker(info);
				let value = tracker.move("[^");
				const exit = state.enter("footnoteDefinition");
				const subexit = state.enter("label");
				value += tracker.move(state.safe(state.associationId(node), {
					before: value,
					after: "]"
				}));
				subexit();
				value += tracker.move("]:");
				if (node.children && node.children.length > 0) {
					tracker.shift(4);
					value += tracker.move((firstLineBlank ? "\n" : " ") + state.indentLines(state.containerFlow(node, tracker.current()), firstLineBlank ? mapAll : mapExceptFirst));
				}
				exit();
				return value;
			}
		}
		/** @type {Map} */
		function mapExceptFirst(line, index, blank) {
			return index === 0 ? line : mapAll(line, index, blank);
		}
		/** @type {Map} */
		function mapAll(line, index, blank) {
			return (blank ? "" : "    ") + line;
		}
		//#endregion
		//#region node_modules/mdast-util-gfm-strikethrough/lib/index.js
		/**
		* @typedef {import('mdast').Delete} Delete
		*
		* @typedef {import('mdast-util-from-markdown').CompileContext} CompileContext
		* @typedef {import('mdast-util-from-markdown').Extension} FromMarkdownExtension
		* @typedef {import('mdast-util-from-markdown').Handle} FromMarkdownHandle
		*
		* @typedef {import('mdast-util-to-markdown').ConstructName} ConstructName
		* @typedef {import('mdast-util-to-markdown').Handle} ToMarkdownHandle
		* @typedef {import('mdast-util-to-markdown').Options} ToMarkdownExtension
		*/
		/**
		* List of constructs that occur in phrasing (paragraphs, headings), but cannot
		* contain strikethrough.
		* So they sort of cancel each other out.
		* Note: could use a better name.
		*
		* Note: keep in sync with: <https://github.com/syntax-tree/mdast-util-to-markdown/blob/8ce8dbf/lib/unsafe.js#L14>
		*
		* @type {Array<ConstructName>}
		*/
		const constructsWithoutStrikethrough = [
			"autolink",
			"destinationLiteral",
			"destinationRaw",
			"reference",
			"titleQuote",
			"titleApostrophe"
		];
		handleDelete.peek = peekDelete;
		/**
		* Create an extension for `mdast-util-from-markdown` to enable GFM
		* strikethrough in markdown.
		*
		* @returns {FromMarkdownExtension}
		*   Extension for `mdast-util-from-markdown` to enable GFM strikethrough.
		*/
		function gfmStrikethroughFromMarkdown() {
			return {
				canContainEols: ["delete"],
				enter: { strikethrough: enterStrikethrough },
				exit: { strikethrough: exitStrikethrough }
			};
		}
		/**
		* Create an extension for `mdast-util-to-markdown` to enable GFM
		* strikethrough in markdown.
		*
		* @returns {ToMarkdownExtension}
		*   Extension for `mdast-util-to-markdown` to enable GFM strikethrough.
		*/
		function gfmStrikethroughToMarkdown() {
			return {
				unsafe: [{
					character: "~",
					inConstruct: "phrasing",
					notInConstruct: constructsWithoutStrikethrough
				}],
				handlers: { delete: handleDelete }
			};
		}
		/**
		* @this {CompileContext}
		* @type {FromMarkdownHandle}
		*/
		function enterStrikethrough(token) {
			this.enter({
				type: "delete",
				children: []
			}, token);
		}
		/**
		* @this {CompileContext}
		* @type {FromMarkdownHandle}
		*/
		function exitStrikethrough(token) {
			this.exit(token);
		}
		/**
		* @type {ToMarkdownHandle}
		* @param {Delete} node
		*/
		function handleDelete(node, _, state, info) {
			const tracker = state.createTracker(info);
			const exit = state.enter("strikethrough");
			let value = tracker.move("~~");
			value += state.containerPhrasing(node, {
				...tracker.current(),
				before: value,
				after: "~"
			});
			value += tracker.move("~~");
			exit();
			return value;
		}
		/** @type {ToMarkdownHandle} */
		function peekDelete() {
			return "~";
		}
		//#endregion
		//#region node_modules/markdown-table/index.js
		/**
		* @typedef {Options} MarkdownTableOptions
		*   Configuration.
		*/
		/**
		* @typedef Options
		*   Configuration.
		* @property {boolean | null | undefined} [alignDelimiters=true]
		*   Whether to align the delimiters (default: `true`);
		*   they are aligned by default:
		*
		*   ```markdown
		*   | Alpha | B     |
		*   | ----- | ----- |
		*   | C     | Delta |
		*   ```
		*
		*   Pass `false` to make them staggered:
		*
		*   ```markdown
		*   | Alpha | B |
		*   | - | - |
		*   | C | Delta |
		*   ```
		* @property {ReadonlyArray<string | null | undefined> | string | null | undefined} [align]
		*   How to align columns (default: `''`);
		*   one style for all columns or styles for their respective columns;
		*   each style is either `'l'` (left), `'r'` (right), or `'c'` (center);
		*   other values are treated as `''`, which doesn’t place the colon in the
		*   alignment row but does align left;
		*   *only the lowercased first character is used, so `Right` is fine.*
		* @property {boolean | null | undefined} [delimiterEnd=true]
		*   Whether to end each row with the delimiter (default: `true`).
		*
		*   > 👉 **Note**: please don’t use this: it could create fragile structures
		*   > that aren’t understandable to some markdown parsers.
		*
		*   When `true`, there are ending delimiters:
		*
		*   ```markdown
		*   | Alpha | B     |
		*   | ----- | ----- |
		*   | C     | Delta |
		*   ```
		*
		*   When `false`, there are no ending delimiters:
		*
		*   ```markdown
		*   | Alpha | B
		*   | ----- | -----
		*   | C     | Delta
		*   ```
		* @property {boolean | null | undefined} [delimiterStart=true]
		*   Whether to begin each row with the delimiter (default: `true`).
		*
		*   > 👉 **Note**: please don’t use this: it could create fragile structures
		*   > that aren’t understandable to some markdown parsers.
		*
		*   When `true`, there are starting delimiters:
		*
		*   ```markdown
		*   | Alpha | B     |
		*   | ----- | ----- |
		*   | C     | Delta |
		*   ```
		*
		*   When `false`, there are no starting delimiters:
		*
		*   ```markdown
		*   Alpha | B     |
		*   ----- | ----- |
		*   C     | Delta |
		*   ```
		* @property {boolean | null | undefined} [padding=true]
		*   Whether to add a space of padding between delimiters and cells
		*   (default: `true`).
		*
		*   When `true`, there is padding:
		*
		*   ```markdown
		*   | Alpha | B     |
		*   | ----- | ----- |
		*   | C     | Delta |
		*   ```
		*
		*   When `false`, there is no padding:
		*
		*   ```markdown
		*   |Alpha|B    |
		*   |-----|-----|
		*   |C    |Delta|
		*   ```
		* @property {((value: string) => number) | null | undefined} [stringLength]
		*   Function to detect the length of table cell content (optional);
		*   this is used when aligning the delimiters (`|`) between table cells;
		*   full-width characters and emoji mess up delimiter alignment when viewing
		*   the markdown source;
		*   to fix this, you can pass this function,
		*   which receives the cell content and returns its “visible” size;
		*   note that what is and isn’t visible depends on where the text is displayed.
		*
		*   Without such a function, the following:
		*
		*   ```js
		*   markdownTable([
		*     ['Alpha', 'Bravo'],
		*     ['中文', 'Charlie'],
		*     ['👩‍❤️‍👩', 'Delta']
		*   ])
		*   ```
		*
		*   Yields:
		*
		*   ```markdown
		*   | Alpha | Bravo |
		*   | - | - |
		*   | 中文 | Charlie |
		*   | 👩‍❤️‍👩 | Delta |
		*   ```
		*
		*   With [`string-width`](https://github.com/sindresorhus/string-width):
		*
		*   ```js
		*   import stringWidth from 'string-width'
		*
		*   markdownTable(
		*     [
		*       ['Alpha', 'Bravo'],
		*       ['中文', 'Charlie'],
		*       ['👩‍❤️‍👩', 'Delta']
		*     ],
		*     {stringLength: stringWidth}
		*   )
		*   ```
		*
		*   Yields:
		*
		*   ```markdown
		*   | Alpha | Bravo   |
		*   | ----- | ------- |
		*   | 中文  | Charlie |
		*   | 👩‍❤️‍👩    | Delta   |
		*   ```
		*/
		/**
		* @param {string} value
		*   Cell value.
		* @returns {number}
		*   Cell size.
		*/
		function defaultStringLength(value) {
			return value.length;
		}
		/**
		* Generate a markdown
		* ([GFM](https://docs.github.com/en/github/writing-on-github/working-with-advanced-formatting/organizing-information-with-tables))
		* table.
		*
		* @param {ReadonlyArray<ReadonlyArray<string | null | undefined>>} table
		*   Table data (matrix of strings).
		* @param {Readonly<Options> | null | undefined} [options]
		*   Configuration (optional).
		* @returns {string}
		*   Result.
		*/
		function markdownTable(table, options) {
			const settings = options || {};
			const align = (settings.align || []).concat();
			const stringLength = settings.stringLength || defaultStringLength;
			/** @type {Array<number>} Character codes as symbols for alignment per column. */
			const alignments = [];
			/** @type {Array<Array<string>>} Cells per row. */
			const cellMatrix = [];
			/** @type {Array<Array<number>>} Sizes of each cell per row. */
			const sizeMatrix = [];
			/** @type {Array<number>} */
			const longestCellByColumn = [];
			let mostCellsPerRow = 0;
			let rowIndex = -1;
			while (++rowIndex < table.length) {
				/** @type {Array<string>} */
				const row = [];
				/** @type {Array<number>} */
				const sizes = [];
				let columnIndex = -1;
				if (table[rowIndex].length > mostCellsPerRow) mostCellsPerRow = table[rowIndex].length;
				while (++columnIndex < table[rowIndex].length) {
					const cell = serialize(table[rowIndex][columnIndex]);
					if (settings.alignDelimiters !== false) {
						const size = stringLength(cell);
						sizes[columnIndex] = size;
						if (longestCellByColumn[columnIndex] === void 0 || size > longestCellByColumn[columnIndex]) longestCellByColumn[columnIndex] = size;
					}
					row.push(cell);
				}
				cellMatrix[rowIndex] = row;
				sizeMatrix[rowIndex] = sizes;
			}
			let columnIndex = -1;
			if (typeof align === "object" && "length" in align) while (++columnIndex < mostCellsPerRow) alignments[columnIndex] = toAlignment(align[columnIndex]);
			else {
				const code = toAlignment(align);
				while (++columnIndex < mostCellsPerRow) alignments[columnIndex] = code;
			}
			columnIndex = -1;
			/** @type {Array<string>} */
			const row = [];
			/** @type {Array<number>} */
			const sizes = [];
			while (++columnIndex < mostCellsPerRow) {
				const code = alignments[columnIndex];
				let before = "";
				let after = "";
				if (code === 99) {
					before = ":";
					after = ":";
				} else if (code === 108) before = ":";
				else if (code === 114) after = ":";
				let size = settings.alignDelimiters === false ? 1 : Math.max(1, longestCellByColumn[columnIndex] - before.length - after.length);
				const cell = before + "-".repeat(size) + after;
				if (settings.alignDelimiters !== false) {
					size = before.length + size + after.length;
					if (size > longestCellByColumn[columnIndex]) longestCellByColumn[columnIndex] = size;
					sizes[columnIndex] = size;
				}
				row[columnIndex] = cell;
			}
			cellMatrix.splice(1, 0, row);
			sizeMatrix.splice(1, 0, sizes);
			rowIndex = -1;
			/** @type {Array<string>} */
			const lines = [];
			while (++rowIndex < cellMatrix.length) {
				const row = cellMatrix[rowIndex];
				const sizes = sizeMatrix[rowIndex];
				columnIndex = -1;
				/** @type {Array<string>} */
				const line = [];
				while (++columnIndex < mostCellsPerRow) {
					const cell = row[columnIndex] || "";
					let before = "";
					let after = "";
					if (settings.alignDelimiters !== false) {
						const size = longestCellByColumn[columnIndex] - (sizes[columnIndex] || 0);
						const code = alignments[columnIndex];
						if (code === 114) before = " ".repeat(size);
						else if (code === 99) {
							if (size % 2) {
								before = " ".repeat(size / 2 + .5);
								after = " ".repeat(size / 2 - .5);
							} else {
								before = " ".repeat(size / 2);
								after = before;
							}
						} else after = " ".repeat(size);
					}
					if (settings.delimiterStart !== false && !columnIndex) line.push("|");
					if (settings.padding !== false && !(settings.alignDelimiters === false && cell === "") && (settings.delimiterStart !== false || columnIndex)) line.push(" ");
					if (settings.alignDelimiters !== false) line.push(before);
					line.push(cell);
					if (settings.alignDelimiters !== false) line.push(after);
					if (settings.padding !== false) line.push(" ");
					if (settings.delimiterEnd !== false || columnIndex !== mostCellsPerRow - 1) line.push("|");
				}
				lines.push(settings.delimiterEnd === false ? line.join("").replace(/ +$/, "") : line.join(""));
			}
			return lines.join("\n");
		}
		/**
		* @param {string | null | undefined} [value]
		*   Value to serialize.
		* @returns {string}
		*   Result.
		*/
		function serialize(value) {
			return value === null || value === void 0 ? "" : String(value);
		}
		/**
		* @param {string | null | undefined} value
		*   Value.
		* @returns {number}
		*   Alignment.
		*/
		function toAlignment(value) {
			const code = typeof value === "string" ? value.codePointAt(0) : 0;
			return code === 67 || code === 99 ? 99 : code === 76 || code === 108 ? 108 : code === 82 || code === 114 ? 114 : 0;
		}
		//#endregion
		//#region node_modules/mdast-util-to-markdown/lib/handle/blockquote.js
		/**
		* @import {Blockquote, Parents} from 'mdast'
		* @import {Info, Map, State} from 'mdast-util-to-markdown'
		*/
		/**
		* @param {Blockquote} node
		* @param {Parents | undefined} _
		* @param {State} state
		* @param {Info} info
		* @returns {string}
		*/
		function blockquote(node, _, state, info) {
			const exit = state.enter("blockquote");
			const tracker = state.createTracker(info);
			tracker.move("> ");
			tracker.shift(2);
			const value = state.indentLines(state.containerFlow(node, tracker.current()), map$1);
			exit();
			return value;
		}
		/** @type {Map} */
		function map$1(line, _, blank) {
			return ">" + (blank ? "" : " ") + line;
		}
		//#endregion
		//#region node_modules/mdast-util-to-markdown/lib/util/pattern-in-scope.js
		/**
		* @import {ConstructName, Unsafe} from 'mdast-util-to-markdown'
		*/
		/**
		* @param {Array<ConstructName>} stack
		* @param {Unsafe} pattern
		* @returns {boolean}
		*/
		function patternInScope(stack, pattern) {
			return listInScope(stack, pattern.inConstruct, true) && !listInScope(stack, pattern.notInConstruct, false);
		}
		/**
		* @param {Array<ConstructName>} stack
		* @param {Unsafe['inConstruct']} list
		* @param {boolean} none
		* @returns {boolean}
		*/
		function listInScope(stack, list, none) {
			if (typeof list === "string") list = [list];
			if (!list || list.length === 0) return none;
			let index = -1;
			while (++index < list.length) if (stack.includes(list[index])) return true;
			return false;
		}
		//#endregion
		//#region node_modules/mdast-util-to-markdown/lib/handle/break.js
		/**
		* @import {Break, Parents} from 'mdast'
		* @import {Info, State} from 'mdast-util-to-markdown'
		*/
		/**
		* @param {Break} _
		* @param {Parents | undefined} _1
		* @param {State} state
		* @param {Info} info
		* @returns {string}
		*/
		function hardBreak(_, _1, state, info) {
			let index = -1;
			while (++index < state.unsafe.length) if (state.unsafe[index].character === "\n" && patternInScope(state.stack, state.unsafe[index])) return /[ \t]/.test(info.before) ? "" : " ";
			return "\\\n";
		}
		//#endregion
		//#region node_modules/longest-streak/index.js
		/**
		* Get the count of the longest repeating streak of `substring` in `value`.
		*
		* @param {string} value
		*   Content to search in.
		* @param {string} substring
		*   Substring to look for, typically one character.
		* @returns {number}
		*   Count of most frequent adjacent `substring`s in `value`.
		*/
		function longestStreak(value, substring) {
			const source = String(value);
			let index = source.indexOf(substring);
			let expected = index;
			let count = 0;
			let max = 0;
			if (typeof substring !== "string") throw new TypeError("Expected substring");
			while (index !== -1) {
				if (index === expected) {
					if (++count > max) max = count;
				} else count = 1;
				expected = index + substring.length;
				index = source.indexOf(substring, expected);
			}
			return max;
		}
		//#endregion
		//#region node_modules/mdast-util-to-markdown/lib/util/format-code-as-indented.js
		/**
		* @import {State} from 'mdast-util-to-markdown'
		* @import {Code} from 'mdast'
		*/
		/**
		* @param {Code} node
		* @param {State} state
		* @returns {boolean}
		*/
		function formatCodeAsIndented(node, state) {
			return Boolean(state.options.fences === false && node.value && !node.lang && /[^ \r\n]/.test(node.value) && !/^[\t ]*(?:[\r\n]|$)|(?:^|[\r\n])[\t ]*$/.test(node.value));
		}
		//#endregion
		//#region node_modules/mdast-util-to-markdown/lib/util/check-fence.js
		/**
		* @import {Options, State} from 'mdast-util-to-markdown'
		*/
		/**
		* @param {State} state
		* @returns {Exclude<Options['fence'], null | undefined>}
		*/
		function checkFence(state) {
			const marker = state.options.fence || "`";
			if (marker !== "`" && marker !== "~") throw new Error("Cannot serialize code with `" + marker + "` for `options.fence`, expected `` ` `` or `~`");
			return marker;
		}
		//#endregion
		//#region node_modules/mdast-util-to-markdown/lib/handle/code.js
		/**
		* @import {Info, Map, State} from 'mdast-util-to-markdown'
		* @import {Code, Parents} from 'mdast'
		*/
		/**
		* @param {Code} node
		* @param {Parents | undefined} _
		* @param {State} state
		* @param {Info} info
		* @returns {string}
		*/
		function code$1(node, _, state, info) {
			const marker = checkFence(state);
			const raw = node.value || "";
			const suffix = marker === "`" ? "GraveAccent" : "Tilde";
			if (formatCodeAsIndented(node, state)) {
				const exit = state.enter("codeIndented");
				const value = state.indentLines(raw, map);
				exit();
				return value;
			}
			const tracker = state.createTracker(info);
			const sequence = marker.repeat(Math.max(longestStreak(raw, marker) + 1, 3));
			const exit = state.enter("codeFenced");
			let value = tracker.move(sequence);
			if (node.lang) {
				const subexit = state.enter(`codeFencedLang${suffix}`);
				value += tracker.move(state.safe(node.lang, {
					before: value,
					after: " ",
					encode: ["`"],
					...tracker.current()
				}));
				subexit();
			}
			if (node.lang && node.meta) {
				const subexit = state.enter(`codeFencedMeta${suffix}`);
				value += tracker.move(" ");
				value += tracker.move(state.safe(node.meta, {
					before: value,
					after: "\n",
					encode: ["`"],
					...tracker.current()
				}));
				subexit();
			}
			value += tracker.move("\n");
			if (raw) value += tracker.move(raw + "\n");
			value += tracker.move(sequence);
			exit();
			return value;
		}
		/** @type {Map} */
		function map(line, _, blank) {
			return (blank ? "" : "    ") + line;
		}
		//#endregion
		//#region node_modules/mdast-util-to-markdown/lib/util/check-quote.js
		/**
		* @import {Options, State} from 'mdast-util-to-markdown'
		*/
		/**
		* @param {State} state
		* @returns {Exclude<Options['quote'], null | undefined>}
		*/
		function checkQuote(state) {
			const marker = state.options.quote || "\"";
			if (marker !== "\"" && marker !== "'") throw new Error("Cannot serialize title with `" + marker + "` for `options.quote`, expected `\"`, or `'`");
			return marker;
		}
		//#endregion
		//#region node_modules/mdast-util-to-markdown/lib/handle/definition.js
		/**
		* @import {Info, State} from 'mdast-util-to-markdown'
		* @import {Definition, Parents} from 'mdast'
		*/
		/**
		* @param {Definition} node
		* @param {Parents | undefined} _
		* @param {State} state
		* @param {Info} info
		* @returns {string}
		*/
		function definition(node, _, state, info) {
			const quote = checkQuote(state);
			const suffix = quote === "\"" ? "Quote" : "Apostrophe";
			const exit = state.enter("definition");
			let subexit = state.enter("label");
			const tracker = state.createTracker(info);
			let value = tracker.move("[");
			value += tracker.move(state.safe(state.associationId(node), {
				before: value,
				after: "]",
				...tracker.current()
			}));
			value += tracker.move("]: ");
			subexit();
			if (!node.url || /[\0- \u007F]/.test(node.url)) {
				subexit = state.enter("destinationLiteral");
				value += tracker.move("<");
				value += tracker.move(state.safe(node.url, {
					before: value,
					after: ">",
					...tracker.current()
				}));
				value += tracker.move(">");
			} else {
				subexit = state.enter("destinationRaw");
				value += tracker.move(state.safe(node.url, {
					before: value,
					after: node.title ? " " : "\n",
					...tracker.current()
				}));
			}
			subexit();
			if (node.title) {
				subexit = state.enter(`title${suffix}`);
				value += tracker.move(" " + quote);
				value += tracker.move(state.safe(node.title, {
					before: value,
					after: quote,
					...tracker.current()
				}));
				value += tracker.move(quote);
				subexit();
			}
			exit();
			return value;
		}
		//#endregion
		//#region node_modules/mdast-util-to-markdown/lib/util/check-emphasis.js
		/**
		* @import {Options, State} from 'mdast-util-to-markdown'
		*/
		/**
		* @param {State} state
		* @returns {Exclude<Options['emphasis'], null | undefined>}
		*/
		function checkEmphasis(state) {
			const marker = state.options.emphasis || "*";
			if (marker !== "*" && marker !== "_") throw new Error("Cannot serialize emphasis with `" + marker + "` for `options.emphasis`, expected `*`, or `_`");
			return marker;
		}
		//#endregion
		//#region node_modules/mdast-util-to-markdown/lib/util/encode-character-reference.js
		/**
		* Encode a code point as a character reference.
		*
		* @param {number} code
		*   Code point to encode.
		* @returns {string}
		*   Encoded character reference.
		*/
		function encodeCharacterReference(code) {
			return "&#x" + code.toString(16).toUpperCase() + ";";
		}
		//#endregion
		//#region node_modules/mdast-util-to-markdown/lib/util/encode-info.js
		/**
		* @import {EncodeSides} from '../types.js'
		*/
		/**
		* Check whether to encode (as a character reference) the characters
		* surrounding an attention run.
		*
		* Which characters are around an attention run influence whether it works or
		* not.
		*
		* See <https://github.com/orgs/syntax-tree/discussions/60> for more info.
		* See this markdown in a particular renderer to see what works:
		*
		* ```markdown
		* |                         | A (letter inside) | B (punctuation inside) | C (whitespace inside) | D (nothing inside) |
		* | ----------------------- | ----------------- | ---------------------- | --------------------- | ------------------ |
		* | 1 (letter outside)      | x*y*z             | x*.*z                  | x* *z                 | x**z               |
		* | 2 (punctuation outside) | .*y*.             | .*.*.                  | .* *.                 | .**.               |
		* | 3 (whitespace outside)  | x *y* z           | x *.* z                | x * * z               | x ** z             |
		* | 4 (nothing outside)     | *x*               | *.*                    | * *                   | **                 |
		* ```
		*
		* @param {number} outside
		*   Code point on the outer side of the run.
		* @param {number} inside
		*   Code point on the inner side of the run.
		* @param {'*' | '_'} marker
		*   Marker of the run.
		*   Underscores are handled more strictly (they form less often) than
		*   asterisks.
		* @returns {EncodeSides}
		*   Whether to encode characters.
		*/
		function encodeInfo(outside, inside, marker) {
			const outsideKind = classifyCharacter(outside);
			const insideKind = classifyCharacter(inside);
			if (outsideKind === void 0) return insideKind === void 0 ? marker === "_" ? {
				inside: true,
				outside: true
			} : {
				inside: false,
				outside: false
			} : insideKind === 1 ? {
				inside: true,
				outside: true
			} : {
				inside: false,
				outside: true
			};
			if (outsideKind === 1) return insideKind === void 0 ? {
				inside: false,
				outside: false
			} : insideKind === 1 ? {
				inside: true,
				outside: true
			} : {
				inside: false,
				outside: false
			};
			return insideKind === void 0 ? {
				inside: false,
				outside: false
			} : insideKind === 1 ? {
				inside: true,
				outside: false
			} : {
				inside: false,
				outside: false
			};
		}
		//#endregion
		//#region node_modules/mdast-util-to-markdown/lib/handle/emphasis.js
		/**
		* @import {Info, State} from 'mdast-util-to-markdown'
		* @import {Emphasis, Parents} from 'mdast'
		*/
		emphasis.peek = emphasisPeek;
		/**
		* @param {Emphasis} node
		* @param {Parents | undefined} _
		* @param {State} state
		* @param {Info} info
		* @returns {string}
		*/
		function emphasis(node, _, state, info) {
			const marker = checkEmphasis(state);
			const exit = state.enter("emphasis");
			const tracker = state.createTracker(info);
			const before = tracker.move(marker);
			let between = tracker.move(state.containerPhrasing(node, {
				after: marker,
				before,
				...tracker.current()
			}));
			const betweenHead = between.charCodeAt(0);
			const open = encodeInfo(info.before.charCodeAt(info.before.length - 1), betweenHead, marker);
			if (open.inside) between = encodeCharacterReference(betweenHead) + between.slice(1);
			const betweenTail = between.charCodeAt(between.length - 1);
			const close = encodeInfo(info.after.charCodeAt(0), betweenTail, marker);
			if (close.inside) between = between.slice(0, -1) + encodeCharacterReference(betweenTail);
			const after = tracker.move(marker);
			exit();
			state.attentionEncodeSurroundingInfo = {
				after: close.outside,
				before: open.outside
			};
			return before + between + after;
		}
		/**
		* @param {Emphasis} _
		* @param {Parents | undefined} _1
		* @param {State} state
		* @returns {string}
		*/
		function emphasisPeek(_, _1, state) {
			return state.options.emphasis || "*";
		}
		//#endregion
		//#region node_modules/mdast-util-to-markdown/lib/util/format-heading-as-setext.js
		/**
		* @import {State} from 'mdast-util-to-markdown'
		* @import {Heading} from 'mdast'
		*/
		/**
		* @param {Heading} node
		* @param {State} state
		* @returns {boolean}
		*/
		function formatHeadingAsSetext(node, state) {
			let literalWithBreak = false;
			visit(node, function(node) {
				if ("value" in node && /\r?\n|\r/.test(node.value) || node.type === "break") {
					literalWithBreak = true;
					return false;
				}
			});
			return Boolean((!node.depth || node.depth < 3) && toString$1(node) && (state.options.setext || literalWithBreak));
		}
		//#endregion
		//#region node_modules/mdast-util-to-markdown/lib/handle/heading.js
		/**
		* @import {Info, State} from 'mdast-util-to-markdown'
		* @import {Heading, Parents} from 'mdast'
		*/
		/**
		* @param {Heading} node
		* @param {Parents | undefined} _
		* @param {State} state
		* @param {Info} info
		* @returns {string}
		*/
		function heading(node, _, state, info) {
			const rank = Math.max(Math.min(6, node.depth || 1), 1);
			const tracker = state.createTracker(info);
			if (formatHeadingAsSetext(node, state)) {
				const exit = state.enter("headingSetext");
				const subexit = state.enter("phrasing");
				const value = state.containerPhrasing(node, {
					...tracker.current(),
					before: "\n",
					after: "\n"
				});
				subexit();
				exit();
				return value + "\n" + (rank === 1 ? "=" : "-").repeat(value.length - (Math.max(value.lastIndexOf("\r"), value.lastIndexOf("\n")) + 1));
			}
			const sequence = "#".repeat(rank);
			const exit = state.enter("headingAtx");
			const subexit = state.enter("phrasing");
			tracker.move(sequence + " ");
			let value = state.containerPhrasing(node, {
				before: "# ",
				after: "\n",
				...tracker.current()
			});
			if (/^[\t ]/.test(value)) value = encodeCharacterReference(value.charCodeAt(0)) + value.slice(1);
			value = value ? sequence + " " + value : sequence;
			if (state.options.closeAtx) value += " " + sequence;
			subexit();
			exit();
			return value;
		}
		//#endregion
		//#region node_modules/mdast-util-to-markdown/lib/handle/html.js
		/**
		* @import {Html} from 'mdast'
		*/
		html.peek = htmlPeek;
		/**
		* @param {Html} node
		* @returns {string}
		*/
		function html(node) {
			return node.value || "";
		}
		/**
		* @returns {string}
		*/
		function htmlPeek() {
			return "<";
		}
		//#endregion
		//#region node_modules/mdast-util-to-markdown/lib/handle/image.js
		/**
		* @import {Info, State} from 'mdast-util-to-markdown'
		* @import {Image, Parents} from 'mdast'
		*/
		image.peek = imagePeek;
		/**
		* @param {Image} node
		* @param {Parents | undefined} _
		* @param {State} state
		* @param {Info} info
		* @returns {string}
		*/
		function image(node, _, state, info) {
			const quote = checkQuote(state);
			const suffix = quote === "\"" ? "Quote" : "Apostrophe";
			const exit = state.enter("image");
			let subexit = state.enter("label");
			const tracker = state.createTracker(info);
			let value = tracker.move("![");
			value += tracker.move(state.safe(node.alt, {
				before: value,
				after: "]",
				...tracker.current()
			}));
			value += tracker.move("](");
			subexit();
			if (!node.url && node.title || /[\0- \u007F]/.test(node.url)) {
				subexit = state.enter("destinationLiteral");
				value += tracker.move("<");
				value += tracker.move(state.safe(node.url, {
					before: value,
					after: ">",
					...tracker.current()
				}));
				value += tracker.move(">");
			} else {
				subexit = state.enter("destinationRaw");
				value += tracker.move(state.safe(node.url, {
					before: value,
					after: node.title ? " " : ")",
					...tracker.current()
				}));
			}
			subexit();
			if (node.title) {
				subexit = state.enter(`title${suffix}`);
				value += tracker.move(" " + quote);
				value += tracker.move(state.safe(node.title, {
					before: value,
					after: quote,
					...tracker.current()
				}));
				value += tracker.move(quote);
				subexit();
			}
			value += tracker.move(")");
			exit();
			return value;
		}
		/**
		* @returns {string}
		*/
		function imagePeek() {
			return "!";
		}
		//#endregion
		//#region node_modules/mdast-util-to-markdown/lib/handle/image-reference.js
		/**
		* @import {Info, State} from 'mdast-util-to-markdown'
		* @import {ImageReference, Parents} from 'mdast'
		*/
		imageReference.peek = imageReferencePeek;
		/**
		* @param {ImageReference} node
		* @param {Parents | undefined} _
		* @param {State} state
		* @param {Info} info
		* @returns {string}
		*/
		function imageReference(node, _, state, info) {
			const type = node.referenceType;
			const exit = state.enter("imageReference");
			let subexit = state.enter("label");
			const tracker = state.createTracker(info);
			let value = tracker.move("![");
			const alt = state.safe(node.alt, {
				before: value,
				after: "]",
				...tracker.current()
			});
			value += tracker.move(alt + "][");
			subexit();
			const stack = state.stack;
			state.stack = [];
			subexit = state.enter("reference");
			const reference = state.safe(state.associationId(node), {
				before: value,
				after: "]",
				...tracker.current()
			});
			subexit();
			state.stack = stack;
			exit();
			if (type === "full" || !alt || alt !== reference) value += tracker.move(reference + "]");
			else if (type === "shortcut") value = value.slice(0, -1);
			else value += tracker.move("]");
			return value;
		}
		/**
		* @returns {string}
		*/
		function imageReferencePeek() {
			return "!";
		}
		//#endregion
		//#region node_modules/mdast-util-to-markdown/lib/handle/inline-code.js
		/**
		* @import {State} from 'mdast-util-to-markdown'
		* @import {InlineCode, Parents} from 'mdast'
		*/
		inlineCode.peek = inlineCodePeek;
		/**
		* @param {InlineCode} node
		* @param {Parents | undefined} _
		* @param {State} state
		* @returns {string}
		*/
		function inlineCode(node, _, state) {
			let value = node.value || "";
			let sequence = "`";
			let index = -1;
			while (new RegExp("(^|[^`])" + sequence + "([^`]|$)").test(value)) sequence += "`";
			if (/[^ \r\n]/.test(value) && (/^[ \r\n]/.test(value) && /[ \r\n]$/.test(value) || /^`|`$/.test(value))) value = " " + value + " ";
			while (++index < state.unsafe.length) {
				const pattern = state.unsafe[index];
				const expression = state.compilePattern(pattern);
				/** @type {RegExpExecArray | null} */
				let match;
				if (!pattern.atBreak) continue;
				while (match = expression.exec(value)) {
					let position = match.index;
					if (value.charCodeAt(position) === 10 && value.charCodeAt(position - 1) === 13) position--;
					value = value.slice(0, position) + " " + value.slice(match.index + 1);
				}
			}
			return sequence + value + sequence;
		}
		/**
		* @returns {string}
		*/
		function inlineCodePeek() {
			return "`";
		}
		//#endregion
		//#region node_modules/mdast-util-to-markdown/lib/util/format-link-as-autolink.js
		/**
		* @import {State} from 'mdast-util-to-markdown'
		* @import {Link} from 'mdast'
		*/
		/**
		* @param {Link} node
		* @param {State} state
		* @returns {boolean}
		*/
		function formatLinkAsAutolink(node, state) {
			const raw = toString$1(node);
			return Boolean(!state.options.resourceLink && node.url && !node.title && node.children && node.children.length === 1 && node.children[0].type === "text" && (raw === node.url || "mailto:" + raw === node.url) && /^[a-z][a-z+.-]+:/i.test(node.url) && !/[\0- <>\u007F]/.test(node.url));
		}
		//#endregion
		//#region node_modules/mdast-util-to-markdown/lib/handle/link.js
		/**
		* @import {Info, State} from 'mdast-util-to-markdown'
		* @import {Link, Parents} from 'mdast'
		* @import {Exit} from '../types.js'
		*/
		link.peek = linkPeek;
		/**
		* @param {Link} node
		* @param {Parents | undefined} _
		* @param {State} state
		* @param {Info} info
		* @returns {string}
		*/
		function link(node, _, state, info) {
			const quote = checkQuote(state);
			const suffix = quote === "\"" ? "Quote" : "Apostrophe";
			const tracker = state.createTracker(info);
			/** @type {Exit} */
			let exit;
			/** @type {Exit} */
			let subexit;
			if (formatLinkAsAutolink(node, state)) {
				const stack = state.stack;
				state.stack = [];
				exit = state.enter("autolink");
				let value = tracker.move("<");
				value += tracker.move(state.containerPhrasing(node, {
					before: value,
					after: ">",
					...tracker.current()
				}));
				value += tracker.move(">");
				exit();
				state.stack = stack;
				return value;
			}
			exit = state.enter("link");
			subexit = state.enter("label");
			let value = tracker.move("[");
			value += tracker.move(state.containerPhrasing(node, {
				before: value,
				after: "](",
				...tracker.current()
			}));
			value += tracker.move("](");
			subexit();
			if (!node.url && node.title || /[\0- \u007F]/.test(node.url)) {
				subexit = state.enter("destinationLiteral");
				value += tracker.move("<");
				value += tracker.move(state.safe(node.url, {
					before: value,
					after: ">",
					...tracker.current()
				}));
				value += tracker.move(">");
			} else {
				subexit = state.enter("destinationRaw");
				value += tracker.move(state.safe(node.url, {
					before: value,
					after: node.title ? " " : ")",
					...tracker.current()
				}));
			}
			subexit();
			if (node.title) {
				subexit = state.enter(`title${suffix}`);
				value += tracker.move(" " + quote);
				value += tracker.move(state.safe(node.title, {
					before: value,
					after: quote,
					...tracker.current()
				}));
				value += tracker.move(quote);
				subexit();
			}
			value += tracker.move(")");
			exit();
			return value;
		}
		/**
		* @param {Link} node
		* @param {Parents | undefined} _
		* @param {State} state
		* @returns {string}
		*/
		function linkPeek(node, _, state) {
			return formatLinkAsAutolink(node, state) ? "<" : "[";
		}
		//#endregion
		//#region node_modules/mdast-util-to-markdown/lib/handle/link-reference.js
		/**
		* @import {Info, State} from 'mdast-util-to-markdown'
		* @import {LinkReference, Parents} from 'mdast'
		*/
		linkReference.peek = linkReferencePeek;
		/**
		* @param {LinkReference} node
		* @param {Parents | undefined} _
		* @param {State} state
		* @param {Info} info
		* @returns {string}
		*/
		function linkReference(node, _, state, info) {
			const type = node.referenceType;
			const exit = state.enter("linkReference");
			let subexit = state.enter("label");
			const tracker = state.createTracker(info);
			let value = tracker.move("[");
			const text = state.containerPhrasing(node, {
				before: value,
				after: "]",
				...tracker.current()
			});
			value += tracker.move(text + "][");
			subexit();
			const stack = state.stack;
			state.stack = [];
			subexit = state.enter("reference");
			const reference = state.safe(state.associationId(node), {
				before: value,
				after: "]",
				...tracker.current()
			});
			subexit();
			state.stack = stack;
			exit();
			if (type === "full" || !text || text !== reference) value += tracker.move(reference + "]");
			else if (type === "shortcut") value = value.slice(0, -1);
			else value += tracker.move("]");
			return value;
		}
		/**
		* @returns {string}
		*/
		function linkReferencePeek() {
			return "[";
		}
		//#endregion
		//#region node_modules/mdast-util-to-markdown/lib/util/check-bullet.js
		/**
		* @import {Options, State} from 'mdast-util-to-markdown'
		*/
		/**
		* @param {State} state
		* @returns {Exclude<Options['bullet'], null | undefined>}
		*/
		function checkBullet(state) {
			const marker = state.options.bullet || "*";
			if (marker !== "*" && marker !== "+" && marker !== "-") throw new Error("Cannot serialize items with `" + marker + "` for `options.bullet`, expected `*`, `+`, or `-`");
			return marker;
		}
		//#endregion
		//#region node_modules/mdast-util-to-markdown/lib/util/check-bullet-other.js
		/**
		* @import {Options, State} from 'mdast-util-to-markdown'
		*/
		/**
		* @param {State} state
		* @returns {Exclude<Options['bullet'], null | undefined>}
		*/
		function checkBulletOther(state) {
			const bullet = checkBullet(state);
			const bulletOther = state.options.bulletOther;
			if (!bulletOther) return bullet === "*" ? "-" : "*";
			if (bulletOther !== "*" && bulletOther !== "+" && bulletOther !== "-") throw new Error("Cannot serialize items with `" + bulletOther + "` for `options.bulletOther`, expected `*`, `+`, or `-`");
			if (bulletOther === bullet) throw new Error("Expected `bullet` (`" + bullet + "`) and `bulletOther` (`" + bulletOther + "`) to be different");
			return bulletOther;
		}
		//#endregion
		//#region node_modules/mdast-util-to-markdown/lib/util/check-bullet-ordered.js
		/**
		* @import {Options, State} from 'mdast-util-to-markdown'
		*/
		/**
		* @param {State} state
		* @returns {Exclude<Options['bulletOrdered'], null | undefined>}
		*/
		function checkBulletOrdered(state) {
			const marker = state.options.bulletOrdered || ".";
			if (marker !== "." && marker !== ")") throw new Error("Cannot serialize items with `" + marker + "` for `options.bulletOrdered`, expected `.` or `)`");
			return marker;
		}
		//#endregion
		//#region node_modules/mdast-util-to-markdown/lib/util/check-rule.js
		/**
		* @import {Options, State} from 'mdast-util-to-markdown'
		*/
		/**
		* @param {State} state
		* @returns {Exclude<Options['rule'], null | undefined>}
		*/
		function checkRule(state) {
			const marker = state.options.rule || "*";
			if (marker !== "*" && marker !== "-" && marker !== "_") throw new Error("Cannot serialize rules with `" + marker + "` for `options.rule`, expected `*`, `-`, or `_`");
			return marker;
		}
		//#endregion
		//#region node_modules/mdast-util-to-markdown/lib/handle/list.js
		/**
		* @import {Info, State} from 'mdast-util-to-markdown'
		* @import {List, Parents} from 'mdast'
		*/
		/**
		* @param {List} node
		* @param {Parents | undefined} parent
		* @param {State} state
		* @param {Info} info
		* @returns {string}
		*/
		function list(node, parent, state, info) {
			const exit = state.enter("list");
			const bulletCurrent = state.bulletCurrent;
			/** @type {string} */
			let bullet = node.ordered ? checkBulletOrdered(state) : checkBullet(state);
			/** @type {string} */
			const bulletOther = node.ordered ? bullet === "." ? ")" : "." : checkBulletOther(state);
			let useDifferentMarker = parent && state.bulletLastUsed ? bullet === state.bulletLastUsed : false;
			if (!node.ordered) {
				const firstListItem = node.children ? node.children[0] : void 0;
				if ((bullet === "*" || bullet === "-") && firstListItem && (!firstListItem.children || !firstListItem.children[0]) && state.stack[state.stack.length - 1] === "list" && state.stack[state.stack.length - 2] === "listItem" && state.stack[state.stack.length - 3] === "list" && state.stack[state.stack.length - 4] === "listItem" && state.indexStack[state.indexStack.length - 1] === 0 && state.indexStack[state.indexStack.length - 2] === 0 && state.indexStack[state.indexStack.length - 3] === 0) useDifferentMarker = true;
				if (checkRule(state) === bullet && firstListItem) {
					let index = -1;
					while (++index < node.children.length) {
						const item = node.children[index];
						if (item && item.type === "listItem" && item.children && item.children[0] && item.children[0].type === "thematicBreak") {
							useDifferentMarker = true;
							break;
						}
					}
				}
			}
			if (useDifferentMarker) bullet = bulletOther;
			state.bulletCurrent = bullet;
			const value = state.containerFlow(node, info);
			state.bulletLastUsed = bullet;
			state.bulletCurrent = bulletCurrent;
			exit();
			return value;
		}
		//#endregion
		//#region node_modules/mdast-util-to-markdown/lib/util/check-list-item-indent.js
		/**
		* @import {Options, State} from 'mdast-util-to-markdown'
		*/
		/**
		* @param {State} state
		* @returns {Exclude<Options['listItemIndent'], null | undefined>}
		*/
		function checkListItemIndent(state) {
			const style = state.options.listItemIndent || "one";
			if (style !== "tab" && style !== "one" && style !== "mixed") throw new Error("Cannot serialize items with `" + style + "` for `options.listItemIndent`, expected `tab`, `one`, or `mixed`");
			return style;
		}
		//#endregion
		//#region node_modules/mdast-util-to-markdown/lib/handle/list-item.js
		/**
		* @import {Info, Map, State} from 'mdast-util-to-markdown'
		* @import {ListItem, Parents} from 'mdast'
		*/
		/**
		* @param {ListItem} node
		* @param {Parents | undefined} parent
		* @param {State} state
		* @param {Info} info
		* @returns {string}
		*/
		function listItem(node, parent, state, info) {
			const listItemIndent = checkListItemIndent(state);
			let bullet = state.bulletCurrent || checkBullet(state);
			if (parent && parent.type === "list" && parent.ordered) bullet = (typeof parent.start === "number" && parent.start > -1 ? parent.start : 1) + (state.options.incrementListMarker === false ? 0 : parent.children.indexOf(node)) + bullet;
			let size = bullet.length + 1;
			if (listItemIndent === "tab" || listItemIndent === "mixed" && (parent && parent.type === "list" && parent.spread || node.spread)) size = Math.ceil(size / 4) * 4;
			const tracker = state.createTracker(info);
			tracker.move(bullet + " ".repeat(size - bullet.length));
			tracker.shift(size);
			const exit = state.enter("listItem");
			const value = state.indentLines(state.containerFlow(node, tracker.current()), map);
			exit();
			return value;
			/** @type {Map} */
			function map(line, index, blank) {
				if (index) return (blank ? "" : " ".repeat(size)) + line;
				return (blank ? bullet : bullet + " ".repeat(size - bullet.length)) + line;
			}
		}
		//#endregion
		//#region node_modules/mdast-util-to-markdown/lib/handle/paragraph.js
		/**
		* @import {Info, State} from 'mdast-util-to-markdown'
		* @import {Paragraph, Parents} from 'mdast'
		*/
		/**
		* @param {Paragraph} node
		* @param {Parents | undefined} _
		* @param {State} state
		* @param {Info} info
		* @returns {string}
		*/
		function paragraph(node, _, state, info) {
			const exit = state.enter("paragraph");
			const subexit = state.enter("phrasing");
			const value = state.containerPhrasing(node, info);
			subexit();
			exit();
			return value;
		}
		//#endregion
		//#region node_modules/mdast-util-phrasing/lib/index.js
		/**
		* @typedef {import('mdast').Html} Html
		* @typedef {import('mdast').PhrasingContent} PhrasingContent
		*/
		/**
		* Check if the given value is *phrasing content*.
		*
		* > 👉 **Note**: Excludes `html`, which can be both phrasing or flow.
		*
		* @param node
		*   Thing to check, typically `Node`.
		* @returns
		*   Whether `value` is phrasing content.
		*/
		const phrasing = convert([
			"break",
			"delete",
			"emphasis",
			"footnote",
			"footnoteReference",
			"image",
			"imageReference",
			"inlineCode",
			"inlineMath",
			"link",
			"linkReference",
			"mdxJsxTextElement",
			"mdxTextExpression",
			"strong",
			"text",
			"textDirective"
		]);
		//#endregion
		//#region node_modules/mdast-util-to-markdown/lib/handle/root.js
		/**
		* @import {Info, State} from 'mdast-util-to-markdown'
		* @import {Parents, Root} from 'mdast'
		*/
		/**
		* @param {Root} node
		* @param {Parents | undefined} _
		* @param {State} state
		* @param {Info} info
		* @returns {string}
		*/
		function root(node, _, state, info) {
			return (node.children.some(function(d) {
				return phrasing(d);
			}) ? state.containerPhrasing : state.containerFlow).call(state, node, info);
		}
		//#endregion
		//#region node_modules/mdast-util-to-markdown/lib/util/check-strong.js
		/**
		* @import {Options, State} from 'mdast-util-to-markdown'
		*/
		/**
		* @param {State} state
		* @returns {Exclude<Options['strong'], null | undefined>}
		*/
		function checkStrong(state) {
			const marker = state.options.strong || "*";
			if (marker !== "*" && marker !== "_") throw new Error("Cannot serialize strong with `" + marker + "` for `options.strong`, expected `*`, or `_`");
			return marker;
		}
		//#endregion
		//#region node_modules/mdast-util-to-markdown/lib/handle/strong.js
		/**
		* @import {Info, State} from 'mdast-util-to-markdown'
		* @import {Parents, Strong} from 'mdast'
		*/
		strong.peek = strongPeek;
		/**
		* @param {Strong} node
		* @param {Parents | undefined} _
		* @param {State} state
		* @param {Info} info
		* @returns {string}
		*/
		function strong(node, _, state, info) {
			const marker = checkStrong(state);
			const exit = state.enter("strong");
			const tracker = state.createTracker(info);
			const before = tracker.move(marker + marker);
			let between = tracker.move(state.containerPhrasing(node, {
				after: marker,
				before,
				...tracker.current()
			}));
			const betweenHead = between.charCodeAt(0);
			const open = encodeInfo(info.before.charCodeAt(info.before.length - 1), betweenHead, marker);
			if (open.inside) between = encodeCharacterReference(betweenHead) + between.slice(1);
			const betweenTail = between.charCodeAt(between.length - 1);
			const close = encodeInfo(info.after.charCodeAt(0), betweenTail, marker);
			if (close.inside) between = between.slice(0, -1) + encodeCharacterReference(betweenTail);
			const after = tracker.move(marker + marker);
			exit();
			state.attentionEncodeSurroundingInfo = {
				after: close.outside,
				before: open.outside
			};
			return before + between + after;
		}
		/**
		* @param {Strong} _
		* @param {Parents | undefined} _1
		* @param {State} state
		* @returns {string}
		*/
		function strongPeek(_, _1, state) {
			return state.options.strong || "*";
		}
		//#endregion
		//#region node_modules/mdast-util-to-markdown/lib/handle/text.js
		/**
		* @import {Info, State} from 'mdast-util-to-markdown'
		* @import {Parents, Text} from 'mdast'
		*/
		/**
		* @param {Text} node
		* @param {Parents | undefined} _
		* @param {State} state
		* @param {Info} info
		* @returns {string}
		*/
		function text$1(node, _, state, info) {
			return state.safe(node.value, info);
		}
		//#endregion
		//#region node_modules/mdast-util-to-markdown/lib/util/check-rule-repetition.js
		/**
		* @import {Options, State} from 'mdast-util-to-markdown'
		*/
		/**
		* @param {State} state
		* @returns {Exclude<Options['ruleRepetition'], null | undefined>}
		*/
		function checkRuleRepetition(state) {
			const repetition = state.options.ruleRepetition || 3;
			if (repetition < 3) throw new Error("Cannot serialize rules with repetition `" + repetition + "` for `options.ruleRepetition`, expected `3` or more");
			return repetition;
		}
		//#endregion
		//#region node_modules/mdast-util-to-markdown/lib/handle/thematic-break.js
		/**
		* @import {State} from 'mdast-util-to-markdown'
		* @import {Parents, ThematicBreak} from 'mdast'
		*/
		/**
		* @param {ThematicBreak} _
		* @param {Parents | undefined} _1
		* @param {State} state
		* @returns {string}
		*/
		function thematicBreak(_, _1, state) {
			const value = (checkRule(state) + (state.options.ruleSpaces ? " " : "")).repeat(checkRuleRepetition(state));
			return state.options.ruleSpaces ? value.slice(0, -1) : value;
		}
		//#endregion
		//#region node_modules/mdast-util-to-markdown/lib/handle/index.js
		/**
		* Default (CommonMark) handlers.
		*/
		const handle = {
			blockquote,
			break: hardBreak,
			code: code$1,
			definition,
			emphasis,
			hardBreak,
			heading,
			html,
			image,
			imageReference,
			inlineCode,
			link,
			linkReference,
			list,
			listItem,
			paragraph,
			root,
			strong,
			text: text$1,
			thematicBreak
		};
		//#endregion
		//#region node_modules/mdast-util-gfm-table/lib/index.js
		/**
		* @typedef {import('mdast').InlineCode} InlineCode
		* @typedef {import('mdast').Table} Table
		* @typedef {import('mdast').TableCell} TableCell
		* @typedef {import('mdast').TableRow} TableRow
		*
		* @typedef {import('markdown-table').Options} MarkdownTableOptions
		*
		* @typedef {import('mdast-util-from-markdown').CompileContext} CompileContext
		* @typedef {import('mdast-util-from-markdown').Extension} FromMarkdownExtension
		* @typedef {import('mdast-util-from-markdown').Handle} FromMarkdownHandle
		*
		* @typedef {import('mdast-util-to-markdown').Options} ToMarkdownExtension
		* @typedef {import('mdast-util-to-markdown').Handle} ToMarkdownHandle
		* @typedef {import('mdast-util-to-markdown').State} State
		* @typedef {import('mdast-util-to-markdown').Info} Info
		*/
		/**
		* @typedef Options
		*   Configuration.
		* @property {boolean | null | undefined} [tableCellPadding=true]
		*   Whether to add a space of padding between delimiters and cells (default:
		*   `true`).
		* @property {boolean | null | undefined} [tablePipeAlign=true]
		*   Whether to align the delimiters (default: `true`).
		* @property {MarkdownTableOptions['stringLength'] | null | undefined} [stringLength]
		*   Function to detect the length of table cell content, used when aligning
		*   the delimiters between cells (optional).
		*/
		/**
		* Create an extension for `mdast-util-from-markdown` to enable GFM tables in
		* markdown.
		*
		* @returns {FromMarkdownExtension}
		*   Extension for `mdast-util-from-markdown` to enable GFM tables.
		*/
		function gfmTableFromMarkdown() {
			return {
				enter: {
					table: enterTable,
					tableData: enterCell,
					tableHeader: enterCell,
					tableRow: enterRow
				},
				exit: {
					codeText: exitCodeText,
					table: exitTable,
					tableData: exit,
					tableHeader: exit,
					tableRow: exit
				}
			};
		}
		/**
		* @this {CompileContext}
		* @type {FromMarkdownHandle}
		*/
		function enterTable(token) {
			const align = token._align;
			this.enter({
				type: "table",
				align: align.map(function(d) {
					return d === "none" ? null : d;
				}),
				children: []
			}, token);
			this.data.inTable = true;
		}
		/**
		* @this {CompileContext}
		* @type {FromMarkdownHandle}
		*/
		function exitTable(token) {
			this.exit(token);
			this.data.inTable = void 0;
		}
		/**
		* @this {CompileContext}
		* @type {FromMarkdownHandle}
		*/
		function enterRow(token) {
			this.enter({
				type: "tableRow",
				children: []
			}, token);
		}
		/**
		* @this {CompileContext}
		* @type {FromMarkdownHandle}
		*/
		function exit(token) {
			this.exit(token);
		}
		/**
		* @this {CompileContext}
		* @type {FromMarkdownHandle}
		*/
		function enterCell(token) {
			this.enter({
				type: "tableCell",
				children: []
			}, token);
		}
		/**
		* @this {CompileContext}
		* @type {FromMarkdownHandle}
		*/
		function exitCodeText(token) {
			let value = this.resume();
			if (this.data.inTable) value = value.replace(/\\([\\|])/g, replace);
			const node = this.stack[this.stack.length - 1];
			node.type;
			node.value = value;
			this.exit(token);
		}
		/**
		* @param {string} $0
		* @param {string} $1
		* @returns {string}
		*/
		function replace($0, $1) {
			return $1 === "|" ? $1 : $0;
		}
		/**
		* Create an extension for `mdast-util-to-markdown` to enable GFM tables in
		* markdown.
		*
		* @param {Options | null | undefined} [options]
		*   Configuration.
		* @returns {ToMarkdownExtension}
		*   Extension for `mdast-util-to-markdown` to enable GFM tables.
		*/
		function gfmTableToMarkdown(options) {
			const settings = options || {};
			const padding = settings.tableCellPadding;
			const alignDelimiters = settings.tablePipeAlign;
			const stringLength = settings.stringLength;
			const around = padding ? " " : "|";
			return {
				unsafe: [
					{
						character: "\r",
						inConstruct: "tableCell"
					},
					{
						character: "\n",
						inConstruct: "tableCell"
					},
					{
						atBreak: true,
						character: "|",
						after: "[	 :-]"
					},
					{
						character: "|",
						inConstruct: "tableCell"
					},
					{
						atBreak: true,
						character: ":",
						after: "-"
					},
					{
						atBreak: true,
						character: "-",
						after: "[:|-]"
					}
				],
				handlers: {
					inlineCode: inlineCodeWithTable,
					table: handleTable,
					tableCell: handleTableCell,
					tableRow: handleTableRow
				}
			};
			/**
			* @type {ToMarkdownHandle}
			* @param {Table} node
			*/
			function handleTable(node, _, state, info) {
				return serializeData(handleTableAsData(node, state, info), node.align);
			}
			/**
			* This function isn’t really used normally, because we handle rows at the
			* table level.
			* But, if someone passes in a table row, this ensures we make somewhat sense.
			*
			* @type {ToMarkdownHandle}
			* @param {TableRow} node
			*/
			function handleTableRow(node, _, state, info) {
				const value = serializeData([handleTableRowAsData(node, state, info)]);
				return value.slice(0, value.indexOf("\n"));
			}
			/**
			* @type {ToMarkdownHandle}
			* @param {TableCell} node
			*/
			function handleTableCell(node, _, state, info) {
				const exit = state.enter("tableCell");
				const subexit = state.enter("phrasing");
				const value = state.containerPhrasing(node, {
					...info,
					before: around,
					after: around
				});
				subexit();
				exit();
				return value;
			}
			/**
			* @param {Array<Array<string>>} matrix
			* @param {Array<string | null | undefined> | null | undefined} [align]
			*/
			function serializeData(matrix, align) {
				return markdownTable(matrix, {
					align,
					alignDelimiters,
					padding,
					stringLength
				});
			}
			/**
			* @param {Table} node
			* @param {State} state
			* @param {Info} info
			*/
			function handleTableAsData(node, state, info) {
				const children = node.children;
				let index = -1;
				/** @type {Array<Array<string>>} */
				const result = [];
				const subexit = state.enter("table");
				while (++index < children.length) result[index] = handleTableRowAsData(children[index], state, info);
				subexit();
				return result;
			}
			/**
			* @param {TableRow} node
			* @param {State} state
			* @param {Info} info
			*/
			function handleTableRowAsData(node, state, info) {
				const children = node.children;
				let index = -1;
				/** @type {Array<string>} */
				const result = [];
				const subexit = state.enter("tableRow");
				while (++index < children.length) result[index] = handleTableCell(children[index], node, state, info);
				subexit();
				return result;
			}
			/**
			* @type {ToMarkdownHandle}
			* @param {InlineCode} node
			*/
			function inlineCodeWithTable(node, parent, state) {
				let value = handle.inlineCode(node, parent, state);
				if (state.stack.includes("tableCell")) value = value.replace(/\|/g, "\\$&");
				return value;
			}
		}
		//#endregion
		//#region node_modules/mdast-util-gfm-task-list-item/lib/index.js
		/**
		* @typedef {import('mdast').ListItem} ListItem
		* @typedef {import('mdast').Paragraph} Paragraph
		* @typedef {import('mdast-util-from-markdown').CompileContext} CompileContext
		* @typedef {import('mdast-util-from-markdown').Extension} FromMarkdownExtension
		* @typedef {import('mdast-util-from-markdown').Handle} FromMarkdownHandle
		* @typedef {import('mdast-util-to-markdown').Options} ToMarkdownExtension
		* @typedef {import('mdast-util-to-markdown').Handle} ToMarkdownHandle
		*/
		/**
		* Create an extension for `mdast-util-from-markdown` to enable GFM task
		* list items in markdown.
		*
		* @returns {FromMarkdownExtension}
		*   Extension for `mdast-util-from-markdown` to enable GFM task list items.
		*/
		function gfmTaskListItemFromMarkdown() {
			return { exit: {
				taskListCheckValueChecked: exitCheck,
				taskListCheckValueUnchecked: exitCheck,
				paragraph: exitParagraphWithTaskListItem
			} };
		}
		/**
		* Create an extension for `mdast-util-to-markdown` to enable GFM task list
		* items in markdown.
		*
		* @returns {ToMarkdownExtension}
		*   Extension for `mdast-util-to-markdown` to enable GFM task list items.
		*/
		function gfmTaskListItemToMarkdown() {
			return {
				unsafe: [{
					atBreak: true,
					character: "-",
					after: "[:|-]"
				}],
				handlers: { listItem: listItemWithTaskListItem }
			};
		}
		/**
		* @this {CompileContext}
		* @type {FromMarkdownHandle}
		*/
		function exitCheck(token) {
			const node = this.stack[this.stack.length - 2];
			node.type;
			node.checked = token.type === "taskListCheckValueChecked";
		}
		/**
		* @this {CompileContext}
		* @type {FromMarkdownHandle}
		*/
		function exitParagraphWithTaskListItem(token) {
			const parent = this.stack[this.stack.length - 2];
			if (parent && parent.type === "listItem" && typeof parent.checked === "boolean") {
				const node = this.stack[this.stack.length - 1];
				node.type;
				const head = node.children[0];
				if (head && head.type === "text") {
					const siblings = parent.children;
					let index = -1;
					/** @type {Paragraph | undefined} */
					let firstParaghraph;
					while (++index < siblings.length) {
						const sibling = siblings[index];
						if (sibling.type === "paragraph") {
							firstParaghraph = sibling;
							break;
						}
					}
					if (firstParaghraph === node) {
						head.value = head.value.slice(1);
						if (head.value.length === 0) node.children.shift();
						else if (node.position && head.position && typeof head.position.start.offset === "number") {
							head.position.start.column++;
							head.position.start.offset++;
							node.position.start = Object.assign({}, head.position.start);
						}
					}
				}
			}
			this.exit(token);
		}
		/**
		* @type {ToMarkdownHandle}
		* @param {ListItem} node
		*/
		function listItemWithTaskListItem(node, parent, state, info) {
			const head = node.children[0];
			const checkable = typeof node.checked === "boolean" && head && head.type === "paragraph";
			const checkbox = "[" + (node.checked ? "x" : " ") + "] ";
			const tracker = state.createTracker(info);
			if (checkable) tracker.move(checkbox);
			let value = handle.listItem(node, parent, state, {
				...info,
				...tracker.current()
			});
			if (checkable) value = value.replace(/^(?:[*+-]|\d+\.)([\r\n]| {1,3})/, check);
			return value;
			/**
			* @param {string} $0
			* @returns {string}
			*/
			function check($0) {
				return $0 + checkbox;
			}
		}
		//#endregion
		//#region node_modules/mdast-util-gfm/lib/index.js
		/**
		* @import {Extension as FromMarkdownExtension} from 'mdast-util-from-markdown'
		* @import {Options} from 'mdast-util-gfm'
		* @import {Options as ToMarkdownExtension} from 'mdast-util-to-markdown'
		*/
		/**
		* Create an extension for `mdast-util-from-markdown` to enable GFM (autolink
		* literals, footnotes, strikethrough, tables, tasklists).
		*
		* @returns {Array<FromMarkdownExtension>}
		*   Extension for `mdast-util-from-markdown` to enable GFM (autolink literals,
		*   footnotes, strikethrough, tables, tasklists).
		*/
		function gfmFromMarkdown() {
			return [
				gfmAutolinkLiteralFromMarkdown(),
				gfmFootnoteFromMarkdown(),
				gfmStrikethroughFromMarkdown(),
				gfmTableFromMarkdown(),
				gfmTaskListItemFromMarkdown()
			];
		}
		/**
		* Create an extension for `mdast-util-to-markdown` to enable GFM (autolink
		* literals, footnotes, strikethrough, tables, tasklists).
		*
		* @param {Options | null | undefined} [options]
		*   Configuration (optional).
		* @returns {ToMarkdownExtension}
		*   Extension for `mdast-util-to-markdown` to enable GFM (autolink literals,
		*   footnotes, strikethrough, tables, tasklists).
		*/
		function gfmToMarkdown(options) {
			return { extensions: [
				gfmAutolinkLiteralToMarkdown(),
				gfmFootnoteToMarkdown(options),
				gfmStrikethroughToMarkdown(),
				gfmTableToMarkdown(options),
				gfmTaskListItemToMarkdown()
			] };
		}
		//#endregion
		//#region node_modules/micromark-extension-gfm-autolink-literal/lib/syntax.js
		/**
		* @import {Code, ConstructRecord, Event, Extension, Previous, State, TokenizeContext, Tokenizer} from 'micromark-util-types'
		*/
		const wwwPrefix = {
			tokenize: tokenizeWwwPrefix,
			partial: true
		};
		const domain = {
			tokenize: tokenizeDomain,
			partial: true
		};
		const path = {
			tokenize: tokenizePath,
			partial: true
		};
		const trail = {
			tokenize: tokenizeTrail,
			partial: true
		};
		const emailDomainDotTrail = {
			tokenize: tokenizeEmailDomainDotTrail,
			partial: true
		};
		const wwwAutolink = {
			name: "wwwAutolink",
			tokenize: tokenizeWwwAutolink,
			previous: previousWww
		};
		const protocolAutolink = {
			name: "protocolAutolink",
			tokenize: tokenizeProtocolAutolink,
			previous: previousProtocol
		};
		const emailAutolink = {
			name: "emailAutolink",
			tokenize: tokenizeEmailAutolink,
			previous: previousEmail
		};
		/** @type {ConstructRecord} */
		const text = {};
		/**
		* Create an extension for `micromark` to support GitHub autolink literal
		* syntax.
		*
		* @returns {Extension}
		*   Extension for `micromark` that can be passed in `extensions` to enable GFM
		*   autolink literal syntax.
		*/
		function gfmAutolinkLiteral() {
			return { text };
		}
		/** @type {Code} */
		let code = 48;
		while (code < 123) {
			text[code] = emailAutolink;
			code++;
			if (code === 58) code = 65;
			else if (code === 91) code = 97;
		}
		text[43] = emailAutolink;
		text[45] = emailAutolink;
		text[46] = emailAutolink;
		text[95] = emailAutolink;
		text[72] = [emailAutolink, protocolAutolink];
		text[104] = [emailAutolink, protocolAutolink];
		text[87] = [emailAutolink, wwwAutolink];
		text[119] = [emailAutolink, wwwAutolink];
		/**
		* Email autolink literal.
		*
		* ```markdown
		* > | a contact@example.org b
		*       ^^^^^^^^^^^^^^^^^^^
		* ```
		*
		* @this {TokenizeContext}
		* @type {Tokenizer}
		*/
		function tokenizeEmailAutolink(effects, ok, nok) {
			const self = this;
			/** @type {boolean | undefined} */
			let dot;
			/** @type {boolean} */
			let data;
			return start;
			/**
			* Start of email autolink literal.
			*
			* ```markdown
			* > | a contact@example.org b
			*       ^
			* ```
			*
			* @type {State}
			*/
			function start(code) {
				if (!gfmAtext(code) || !previousEmail.call(self, self.previous) || previousUnbalanced(self.events)) return nok(code);
				effects.enter("literalAutolink");
				effects.enter("literalAutolinkEmail");
				return atext(code);
			}
			/**
			* In email atext.
			*
			* ```markdown
			* > | a contact@example.org b
			*       ^
			* ```
			*
			* @type {State}
			*/
			function atext(code) {
				if (gfmAtext(code)) {
					effects.consume(code);
					return atext;
				}
				if (code === 64) {
					effects.consume(code);
					return emailDomain;
				}
				return nok(code);
			}
			/**
			* In email domain.
			*
			* The reference code is a bit overly complex as it handles the `@`, of which
			* there may be just one.
			* Source: <https://github.com/github/cmark-gfm/blob/ef1cfcb/extensions/autolink.c#L318>
			*
			* ```markdown
			* > | a contact@example.org b
			*               ^
			* ```
			*
			* @type {State}
			*/
			function emailDomain(code) {
				if (code === 46) return effects.check(emailDomainDotTrail, emailDomainAfter, emailDomainDot)(code);
				if (code === 45 || code === 95 || asciiAlphanumeric(code)) {
					data = true;
					effects.consume(code);
					return emailDomain;
				}
				return emailDomainAfter(code);
			}
			/**
			* In email domain, on dot that is not a trail.
			*
			* ```markdown
			* > | a contact@example.org b
			*                      ^
			* ```
			*
			* @type {State}
			*/
			function emailDomainDot(code) {
				effects.consume(code);
				dot = true;
				return emailDomain;
			}
			/**
			* After email domain.
			*
			* ```markdown
			* > | a contact@example.org b
			*                          ^
			* ```
			*
			* @type {State}
			*/
			function emailDomainAfter(code) {
				if (data && dot && asciiAlpha(self.previous)) {
					effects.exit("literalAutolinkEmail");
					effects.exit("literalAutolink");
					return ok(code);
				}
				return nok(code);
			}
		}
		/**
		* `www` autolink literal.
		*
		* ```markdown
		* > | a www.example.org b
		*       ^^^^^^^^^^^^^^^
		* ```
		*
		* @this {TokenizeContext}
		* @type {Tokenizer}
		*/
		function tokenizeWwwAutolink(effects, ok, nok) {
			const self = this;
			return wwwStart;
			/**
			* Start of www autolink literal.
			*
			* ```markdown
			* > | www.example.com/a?b#c
			*     ^
			* ```
			*
			* @type {State}
			*/
			function wwwStart(code) {
				if (code !== 87 && code !== 119 || !previousWww.call(self, self.previous) || previousUnbalanced(self.events)) return nok(code);
				effects.enter("literalAutolink");
				effects.enter("literalAutolinkWww");
				return effects.check(wwwPrefix, effects.attempt(domain, effects.attempt(path, wwwAfter), nok), nok)(code);
			}
			/**
			* After a www autolink literal.
			*
			* ```markdown
			* > | www.example.com/a?b#c
			*                          ^
			* ```
			*
			* @type {State}
			*/
			function wwwAfter(code) {
				effects.exit("literalAutolinkWww");
				effects.exit("literalAutolink");
				return ok(code);
			}
		}
		/**
		* Protocol autolink literal.
		*
		* ```markdown
		* > | a https://example.org b
		*       ^^^^^^^^^^^^^^^^^^^
		* ```
		*
		* @this {TokenizeContext}
		* @type {Tokenizer}
		*/
		function tokenizeProtocolAutolink(effects, ok, nok) {
			const self = this;
			let buffer = "";
			let seen = false;
			return protocolStart;
			/**
			* Start of protocol autolink literal.
			*
			* ```markdown
			* > | https://example.com/a?b#c
			*     ^
			* ```
			*
			* @type {State}
			*/
			function protocolStart(code) {
				if ((code === 72 || code === 104) && previousProtocol.call(self, self.previous) && !previousUnbalanced(self.events)) {
					effects.enter("literalAutolink");
					effects.enter("literalAutolinkHttp");
					buffer += String.fromCodePoint(code);
					effects.consume(code);
					return protocolPrefixInside;
				}
				return nok(code);
			}
			/**
			* In protocol.
			*
			* ```markdown
			* > | https://example.com/a?b#c
			*     ^^^^^
			* ```
			*
			* @type {State}
			*/
			function protocolPrefixInside(code) {
				if (asciiAlpha(code) && buffer.length < 5) {
					buffer += String.fromCodePoint(code);
					effects.consume(code);
					return protocolPrefixInside;
				}
				if (code === 58) {
					const protocol = buffer.toLowerCase();
					if (protocol === "http" || protocol === "https") {
						effects.consume(code);
						return protocolSlashesInside;
					}
				}
				return nok(code);
			}
			/**
			* In slashes.
			*
			* ```markdown
			* > | https://example.com/a?b#c
			*           ^^
			* ```
			*
			* @type {State}
			*/
			function protocolSlashesInside(code) {
				if (code === 47) {
					effects.consume(code);
					if (seen) return afterProtocol;
					seen = true;
					return protocolSlashesInside;
				}
				return nok(code);
			}
			/**
			* After protocol, before domain.
			*
			* ```markdown
			* > | https://example.com/a?b#c
			*             ^
			* ```
			*
			* @type {State}
			*/
			function afterProtocol(code) {
				return code === null || asciiControl(code) || markdownLineEndingOrSpace(code) || unicodeWhitespace(code) || unicodePunctuation(code) ? nok(code) : effects.attempt(domain, effects.attempt(path, protocolAfter), nok)(code);
			}
			/**
			* After a protocol autolink literal.
			*
			* ```markdown
			* > | https://example.com/a?b#c
			*                              ^
			* ```
			*
			* @type {State}
			*/
			function protocolAfter(code) {
				effects.exit("literalAutolinkHttp");
				effects.exit("literalAutolink");
				return ok(code);
			}
		}
		/**
		* `www` prefix.
		*
		* ```markdown
		* > | a www.example.org b
		*       ^^^^
		* ```
		*
		* @this {TokenizeContext}
		* @type {Tokenizer}
		*/
		function tokenizeWwwPrefix(effects, ok, nok) {
			let size = 0;
			return wwwPrefixInside;
			/**
			* In www prefix.
			*
			* ```markdown
			* > | www.example.com
			*     ^^^^
			* ```
			*
			* @type {State}
			*/
			function wwwPrefixInside(code) {
				if ((code === 87 || code === 119) && size < 3) {
					size++;
					effects.consume(code);
					return wwwPrefixInside;
				}
				if (code === 46 && size === 3) {
					effects.consume(code);
					return wwwPrefixAfter;
				}
				return nok(code);
			}
			/**
			* After www prefix.
			*
			* ```markdown
			* > | www.example.com
			*         ^
			* ```
			*
			* @type {State}
			*/
			function wwwPrefixAfter(code) {
				return code === null ? nok(code) : ok(code);
			}
		}
		/**
		* Domain.
		*
		* ```markdown
		* > | a https://example.org b
		*               ^^^^^^^^^^^
		* ```
		*
		* @this {TokenizeContext}
		* @type {Tokenizer}
		*/
		function tokenizeDomain(effects, ok, nok) {
			/** @type {boolean | undefined} */
			let underscoreInLastSegment;
			/** @type {boolean | undefined} */
			let underscoreInLastLastSegment;
			/** @type {boolean | undefined} */
			let seen;
			return domainInside;
			/**
			* In domain.
			*
			* ```markdown
			* > | https://example.com/a
			*             ^^^^^^^^^^^
			* ```
			*
			* @type {State}
			*/
			function domainInside(code) {
				if (code === 46 || code === 95) return effects.check(trail, domainAfter, domainAtPunctuation)(code);
				if (code === null || markdownLineEndingOrSpace(code) || unicodeWhitespace(code) || code !== 45 && unicodePunctuation(code)) return domainAfter(code);
				seen = true;
				effects.consume(code);
				return domainInside;
			}
			/**
			* In domain, at potential trailing punctuation, that was not trailing.
			*
			* ```markdown
			* > | https://example.com
			*                    ^
			* ```
			*
			* @type {State}
			*/
			function domainAtPunctuation(code) {
				if (code === 95) underscoreInLastSegment = true;
				else {
					underscoreInLastLastSegment = underscoreInLastSegment;
					underscoreInLastSegment = void 0;
				}
				effects.consume(code);
				return domainInside;
			}
			/**
			* After domain.
			*
			* ```markdown
			* > | https://example.com/a
			*                        ^
			* ```
			*
			* @type {State} */
			function domainAfter(code) {
				if (underscoreInLastLastSegment || underscoreInLastSegment || !seen) return nok(code);
				return ok(code);
			}
		}
		/**
		* Path.
		*
		* ```markdown
		* > | a https://example.org/stuff b
		*                          ^^^^^^
		* ```
		*
		* @this {TokenizeContext}
		* @type {Tokenizer}
		*/
		function tokenizePath(effects, ok) {
			let sizeOpen = 0;
			let sizeClose = 0;
			return pathInside;
			/**
			* In path.
			*
			* ```markdown
			* > | https://example.com/a
			*                        ^^
			* ```
			*
			* @type {State}
			*/
			function pathInside(code) {
				if (code === 40) {
					sizeOpen++;
					effects.consume(code);
					return pathInside;
				}
				if (code === 41 && sizeClose < sizeOpen) return pathAtPunctuation(code);
				if (code === 33 || code === 34 || code === 38 || code === 39 || code === 41 || code === 42 || code === 44 || code === 46 || code === 58 || code === 59 || code === 60 || code === 63 || code === 93 || code === 95 || code === 126) return effects.check(trail, ok, pathAtPunctuation)(code);
				if (code === null || markdownLineEndingOrSpace(code) || unicodeWhitespace(code)) return ok(code);
				effects.consume(code);
				return pathInside;
			}
			/**
			* In path, at potential trailing punctuation, that was not trailing.
			*
			* ```markdown
			* > | https://example.com/a"b
			*                          ^
			* ```
			*
			* @type {State}
			*/
			function pathAtPunctuation(code) {
				if (code === 41) sizeClose++;
				effects.consume(code);
				return pathInside;
			}
		}
		/**
		* Trail.
		*
		* This calls `ok` if this *is* the trail, followed by an end, which means
		* the entire trail is not part of the link.
		* It calls `nok` if this *is* part of the link.
		*
		* ```markdown
		* > | https://example.com").
		*                        ^^^
		* ```
		*
		* @this {TokenizeContext}
		* @type {Tokenizer}
		*/
		function tokenizeTrail(effects, ok, nok) {
			return trail;
			/**
			* In trail of domain or path.
			*
			* ```markdown
			* > | https://example.com").
			*                        ^
			* ```
			*
			* @type {State}
			*/
			function trail(code) {
				if (code === 33 || code === 34 || code === 39 || code === 41 || code === 42 || code === 44 || code === 46 || code === 58 || code === 59 || code === 63 || code === 95 || code === 126) {
					effects.consume(code);
					return trail;
				}
				if (code === 38) {
					effects.consume(code);
					return trailCharacterReferenceStart;
				}
				if (code === 93) {
					effects.consume(code);
					return trailBracketAfter;
				}
				if (code === 60 || code === null || markdownLineEndingOrSpace(code) || unicodeWhitespace(code)) return ok(code);
				return nok(code);
			}
			/**
			* In trail, after `]`.
			*
			* > 👉 **Note**: this deviates from `cmark-gfm` to fix a bug.
			* > See end of <https://github.com/github/cmark-gfm/issues/278> for more.
			*
			* ```markdown
			* > | https://example.com](
			*                         ^
			* ```
			*
			* @type {State}
			*/
			function trailBracketAfter(code) {
				if (code === null || code === 40 || code === 91 || markdownLineEndingOrSpace(code) || unicodeWhitespace(code)) return ok(code);
				return trail(code);
			}
			/**
			* In character-reference like trail, after `&`.
			*
			* ```markdown
			* > | https://example.com&amp;).
			*                         ^
			* ```
			*
			* @type {State}
			*/
			function trailCharacterReferenceStart(code) {
				return asciiAlpha(code) ? trailCharacterReferenceInside(code) : nok(code);
			}
			/**
			* In character-reference like trail.
			*
			* ```markdown
			* > | https://example.com&amp;).
			*                         ^
			* ```
			*
			* @type {State}
			*/
			function trailCharacterReferenceInside(code) {
				if (code === 59) {
					effects.consume(code);
					return trail;
				}
				if (asciiAlpha(code)) {
					effects.consume(code);
					return trailCharacterReferenceInside;
				}
				return nok(code);
			}
		}
		/**
		* Dot in email domain trail.
		*
		* This calls `ok` if this *is* the trail, followed by an end, which means
		* the trail is not part of the link.
		* It calls `nok` if this *is* part of the link.
		*
		* ```markdown
		* > | contact@example.org.
		*                        ^
		* ```
		*
		* @this {TokenizeContext}
		* @type {Tokenizer}
		*/
		function tokenizeEmailDomainDotTrail(effects, ok, nok) {
			return start;
			/**
			* Dot.
			*
			* ```markdown
			* > | contact@example.org.
			*                    ^   ^
			* ```
			*
			* @type {State}
			*/
			function start(code) {
				effects.consume(code);
				return after;
			}
			/**
			* After dot.
			*
			* ```markdown
			* > | contact@example.org.
			*                     ^   ^
			* ```
			*
			* @type {State}
			*/
			function after(code) {
				return asciiAlphanumeric(code) ? nok(code) : ok(code);
			}
		}
		/**
		* See:
		* <https://github.com/github/cmark-gfm/blob/ef1cfcb/extensions/autolink.c#L156>.
		*
		* @type {Previous}
		*/
		function previousWww(code) {
			return code === null || code === 40 || code === 42 || code === 95 || code === 91 || code === 93 || code === 126 || markdownLineEndingOrSpace(code);
		}
		/**
		* See:
		* <https://github.com/github/cmark-gfm/blob/ef1cfcb/extensions/autolink.c#L214>.
		*
		* @type {Previous}
		*/
		function previousProtocol(code) {
			return !asciiAlpha(code);
		}
		/**
		* @this {TokenizeContext}
		* @type {Previous}
		*/
		function previousEmail(code) {
			return !(code === 47 || gfmAtext(code));
		}
		/**
		* @param {Code} code
		* @returns {boolean}
		*/
		function gfmAtext(code) {
			return code === 43 || code === 45 || code === 46 || code === 95 || asciiAlphanumeric(code);
		}
		/**
		* @param {Array<Event>} events
		* @returns {boolean}
		*/
		function previousUnbalanced(events) {
			let index = events.length;
			let result = false;
			while (index--) {
				const token = events[index][1];
				if ((token.type === "labelLink" || token.type === "labelImage") && !token._balanced) {
					result = true;
					break;
				}
				if (token._gfmAutolinkLiteralWalkedInto) {
					result = false;
					break;
				}
			}
			if (events.length > 0 && !result) events[events.length - 1][1]._gfmAutolinkLiteralWalkedInto = true;
			return result;
		}
		//#endregion
		//#region node_modules/micromark-extension-gfm-footnote/lib/syntax.js
		/**
		* @import {Event, Exiter, Extension, Resolver, State, Token, TokenizeContext, Tokenizer} from 'micromark-util-types'
		*/
		const indent = {
			tokenize: tokenizeIndent,
			partial: true
		};
		/**
		* Create an extension for `micromark` to enable GFM footnote syntax.
		*
		* @returns {Extension}
		*   Extension for `micromark` that can be passed in `extensions` to
		*   enable GFM footnote syntax.
		*/
		function gfmFootnote() {
			/** @type {Extension} */
			return {
				document: { [91]: {
					name: "gfmFootnoteDefinition",
					tokenize: tokenizeDefinitionStart,
					continuation: { tokenize: tokenizeDefinitionContinuation },
					exit: gfmFootnoteDefinitionEnd
				} },
				text: {
					[91]: {
						name: "gfmFootnoteCall",
						tokenize: tokenizeGfmFootnoteCall
					},
					[93]: {
						name: "gfmPotentialFootnoteCall",
						add: "after",
						tokenize: tokenizePotentialGfmFootnoteCall,
						resolveTo: resolveToPotentialGfmFootnoteCall
					}
				}
			};
		}
		/**
		* @this {TokenizeContext}
		* @type {Tokenizer}
		*/
		function tokenizePotentialGfmFootnoteCall(effects, ok, nok) {
			const self = this;
			let index = self.events.length;
			const defined = self.parser.gfmFootnotes || (self.parser.gfmFootnotes = []);
			/** @type {Token} */
			let labelStart;
			while (index--) {
				const token = self.events[index][1];
				if (token.type === "labelImage") {
					labelStart = token;
					break;
				}
				if (token.type === "gfmFootnoteCall" || token.type === "labelLink" || token.type === "label" || token.type === "image" || token.type === "link") break;
			}
			return start;
			/**
			* @type {State}
			*/
			function start(code) {
				if (!labelStart || !labelStart._balanced) return nok(code);
				const id = normalizeIdentifier(self.sliceSerialize({
					start: labelStart.end,
					end: self.now()
				}));
				if (id.codePointAt(0) !== 94 || !defined.includes(id.slice(1))) return nok(code);
				effects.enter("gfmFootnoteCallLabelMarker");
				effects.consume(code);
				effects.exit("gfmFootnoteCallLabelMarker");
				return ok(code);
			}
		}
		/** @type {Resolver} */
		function resolveToPotentialGfmFootnoteCall(events, context) {
			let index = events.length;
			while (index--) if (events[index][1].type === "labelImage" && events[index][0] === "enter") {
				events[index][1];
				break;
			}
			events[index + 1][1].type = "data";
			events[index + 3][1].type = "gfmFootnoteCallLabelMarker";
			/** @type {Token} */
			const call = {
				type: "gfmFootnoteCall",
				start: Object.assign({}, events[index + 3][1].start),
				end: Object.assign({}, events[events.length - 1][1].end)
			};
			/** @type {Token} */
			const marker = {
				type: "gfmFootnoteCallMarker",
				start: Object.assign({}, events[index + 3][1].end),
				end: Object.assign({}, events[index + 3][1].end)
			};
			marker.end.column++;
			marker.end.offset++;
			marker.end._bufferIndex++;
			/** @type {Token} */
			const string = {
				type: "gfmFootnoteCallString",
				start: Object.assign({}, marker.end),
				end: Object.assign({}, events[events.length - 1][1].start)
			};
			/** @type {Token} */
			const chunk = {
				type: "chunkString",
				contentType: "string",
				start: Object.assign({}, string.start),
				end: Object.assign({}, string.end)
			};
			/** @type {Array<Event>} */
			const replacement = [
				events[index + 1],
				events[index + 2],
				[
					"enter",
					call,
					context
				],
				events[index + 3],
				events[index + 4],
				[
					"enter",
					marker,
					context
				],
				[
					"exit",
					marker,
					context
				],
				[
					"enter",
					string,
					context
				],
				[
					"enter",
					chunk,
					context
				],
				[
					"exit",
					chunk,
					context
				],
				[
					"exit",
					string,
					context
				],
				events[events.length - 2],
				events[events.length - 1],
				[
					"exit",
					call,
					context
				]
			];
			events.splice(index, events.length - index + 1, ...replacement);
			return events;
		}
		/**
		* @this {TokenizeContext}
		* @type {Tokenizer}
		*/
		function tokenizeGfmFootnoteCall(effects, ok, nok) {
			const self = this;
			const defined = self.parser.gfmFootnotes || (self.parser.gfmFootnotes = []);
			let size = 0;
			/** @type {boolean} */
			let data;
			return start;
			/**
			* Start of footnote label.
			*
			* ```markdown
			* > | a [^b] c
			*       ^
			* ```
			*
			* @type {State}
			*/
			function start(code) {
				effects.enter("gfmFootnoteCall");
				effects.enter("gfmFootnoteCallLabelMarker");
				effects.consume(code);
				effects.exit("gfmFootnoteCallLabelMarker");
				return callStart;
			}
			/**
			* After `[`, at `^`.
			*
			* ```markdown
			* > | a [^b] c
			*        ^
			* ```
			*
			* @type {State}
			*/
			function callStart(code) {
				if (code !== 94) return nok(code);
				effects.enter("gfmFootnoteCallMarker");
				effects.consume(code);
				effects.exit("gfmFootnoteCallMarker");
				effects.enter("gfmFootnoteCallString");
				effects.enter("chunkString").contentType = "string";
				return callData;
			}
			/**
			* In label.
			*
			* ```markdown
			* > | a [^b] c
			*         ^
			* ```
			*
			* @type {State}
			*/
			function callData(code) {
				if (size > 999 || code === 93 && !data || code === null || code === 91 || markdownLineEndingOrSpace(code)) return nok(code);
				if (code === 93) {
					effects.exit("chunkString");
					const token = effects.exit("gfmFootnoteCallString");
					if (!defined.includes(normalizeIdentifier(self.sliceSerialize(token)))) return nok(code);
					effects.enter("gfmFootnoteCallLabelMarker");
					effects.consume(code);
					effects.exit("gfmFootnoteCallLabelMarker");
					effects.exit("gfmFootnoteCall");
					return ok;
				}
				if (!markdownLineEndingOrSpace(code)) data = true;
				size++;
				effects.consume(code);
				return code === 92 ? callEscape : callData;
			}
			/**
			* On character after escape.
			*
			* ```markdown
			* > | a [^b\c] d
			*           ^
			* ```
			*
			* @type {State}
			*/
			function callEscape(code) {
				if (code === 91 || code === 92 || code === 93) {
					effects.consume(code);
					size++;
					return callData;
				}
				return callData(code);
			}
		}
		/**
		* @this {TokenizeContext}
		* @type {Tokenizer}
		*/
		function tokenizeDefinitionStart(effects, ok, nok) {
			const self = this;
			const defined = self.parser.gfmFootnotes || (self.parser.gfmFootnotes = []);
			/** @type {string} */
			let identifier;
			let size = 0;
			/** @type {boolean | undefined} */
			let data;
			return start;
			/**
			* Start of GFM footnote definition.
			*
			* ```markdown
			* > | [^a]: b
			*     ^
			* ```
			*
			* @type {State}
			*/
			function start(code) {
				effects.enter("gfmFootnoteDefinition")._container = true;
				effects.enter("gfmFootnoteDefinitionLabel");
				effects.enter("gfmFootnoteDefinitionLabelMarker");
				effects.consume(code);
				effects.exit("gfmFootnoteDefinitionLabelMarker");
				return labelAtMarker;
			}
			/**
			* In label, at caret.
			*
			* ```markdown
			* > | [^a]: b
			*      ^
			* ```
			*
			* @type {State}
			*/
			function labelAtMarker(code) {
				if (code === 94) {
					effects.enter("gfmFootnoteDefinitionMarker");
					effects.consume(code);
					effects.exit("gfmFootnoteDefinitionMarker");
					effects.enter("gfmFootnoteDefinitionLabelString");
					effects.enter("chunkString").contentType = "string";
					return labelInside;
				}
				return nok(code);
			}
			/**
			* In label.
			*
			* > 👉 **Note**: `cmark-gfm` prevents whitespace from occurring in footnote
			* > definition labels.
			*
			* ```markdown
			* > | [^a]: b
			*       ^
			* ```
			*
			* @type {State}
			*/
			function labelInside(code) {
				if (size > 999 || code === 93 && !data || code === null || code === 91 || markdownLineEndingOrSpace(code)) return nok(code);
				if (code === 93) {
					effects.exit("chunkString");
					const token = effects.exit("gfmFootnoteDefinitionLabelString");
					identifier = normalizeIdentifier(self.sliceSerialize(token));
					effects.enter("gfmFootnoteDefinitionLabelMarker");
					effects.consume(code);
					effects.exit("gfmFootnoteDefinitionLabelMarker");
					effects.exit("gfmFootnoteDefinitionLabel");
					return labelAfter;
				}
				if (!markdownLineEndingOrSpace(code)) data = true;
				size++;
				effects.consume(code);
				return code === 92 ? labelEscape : labelInside;
			}
			/**
			* After `\`, at a special character.
			*
			* > 👉 **Note**: `cmark-gfm` currently does not support escaped brackets:
			* > <https://github.com/github/cmark-gfm/issues/240>
			*
			* ```markdown
			* > | [^a\*b]: c
			*         ^
			* ```
			*
			* @type {State}
			*/
			function labelEscape(code) {
				if (code === 91 || code === 92 || code === 93) {
					effects.consume(code);
					size++;
					return labelInside;
				}
				return labelInside(code);
			}
			/**
			* After definition label.
			*
			* ```markdown
			* > | [^a]: b
			*         ^
			* ```
			*
			* @type {State}
			*/
			function labelAfter(code) {
				if (code === 58) {
					effects.enter("definitionMarker");
					effects.consume(code);
					effects.exit("definitionMarker");
					if (!defined.includes(identifier)) defined.push(identifier);
					return factorySpace(effects, whitespaceAfter, "gfmFootnoteDefinitionWhitespace");
				}
				return nok(code);
			}
			/**
			* After definition prefix.
			*
			* ```markdown
			* > | [^a]: b
			*           ^
			* ```
			*
			* @type {State}
			*/
			function whitespaceAfter(code) {
				return ok(code);
			}
		}
		/**
		* @this {TokenizeContext}
		* @type {Tokenizer}
		*/
		function tokenizeDefinitionContinuation(effects, ok, nok) {
			return effects.check(blankLine, ok, effects.attempt(indent, ok, nok));
		}
		/** @type {Exiter} */
		function gfmFootnoteDefinitionEnd(effects) {
			effects.exit("gfmFootnoteDefinition");
		}
		/**
		* @this {TokenizeContext}
		* @type {Tokenizer}
		*/
		function tokenizeIndent(effects, ok, nok) {
			const self = this;
			return factorySpace(effects, afterPrefix, "gfmFootnoteDefinitionIndent", 5);
			/**
			* @type {State}
			*/
			function afterPrefix(code) {
				const tail = self.events[self.events.length - 1];
				return tail && tail[1].type === "gfmFootnoteDefinitionIndent" && tail[2].sliceSerialize(tail[1], true).length === 4 ? ok(code) : nok(code);
			}
		}
		//#endregion
		//#region node_modules/micromark-extension-gfm-strikethrough/lib/syntax.js
		/**
		* @import {Options} from 'micromark-extension-gfm-strikethrough'
		* @import {Event, Extension, Resolver, State, Token, TokenizeContext, Tokenizer} from 'micromark-util-types'
		*/
		/**
		* Create an extension for `micromark` to enable GFM strikethrough syntax.
		*
		* @param {Options | null | undefined} [options={}]
		*   Configuration.
		* @returns {Extension}
		*   Extension for `micromark` that can be passed in `extensions`, to
		*   enable GFM strikethrough syntax.
		*/
		function gfmStrikethrough(options) {
			let single = (options || {}).singleTilde;
			const tokenizer = {
				name: "strikethrough",
				tokenize: tokenizeStrikethrough,
				resolveAll: resolveAllStrikethrough
			};
			if (single === null || single === void 0) single = true;
			return {
				text: { [126]: tokenizer },
				insideSpan: { null: [tokenizer] },
				attentionMarkers: { null: [126] }
			};
			/**
			* Take events and resolve strikethrough.
			*
			* @type {Resolver}
			*/
			function resolveAllStrikethrough(events, context) {
				let index = -1;
				while (++index < events.length) if (events[index][0] === "enter" && events[index][1].type === "strikethroughSequenceTemporary" && events[index][1]._close) {
					let open = index;
					while (open--) if (events[open][0] === "exit" && events[open][1].type === "strikethroughSequenceTemporary" && events[open][1]._open && events[index][1].end.offset - events[index][1].start.offset === events[open][1].end.offset - events[open][1].start.offset) {
						events[index][1].type = "strikethroughSequence";
						events[open][1].type = "strikethroughSequence";
						/** @type {Token} */
						const strikethrough = {
							type: "strikethrough",
							start: Object.assign({}, events[open][1].start),
							end: Object.assign({}, events[index][1].end)
						};
						/** @type {Token} */
						const text = {
							type: "strikethroughText",
							start: Object.assign({}, events[open][1].end),
							end: Object.assign({}, events[index][1].start)
						};
						/** @type {Array<Event>} */
						const nextEvents = [
							[
								"enter",
								strikethrough,
								context
							],
							[
								"enter",
								events[open][1],
								context
							],
							[
								"exit",
								events[open][1],
								context
							],
							[
								"enter",
								text,
								context
							]
						];
						const insideSpan = context.parser.constructs.insideSpan.null;
						if (insideSpan) splice(nextEvents, nextEvents.length, 0, resolveAll(insideSpan, events.slice(open + 1, index), context));
						splice(nextEvents, nextEvents.length, 0, [
							[
								"exit",
								text,
								context
							],
							[
								"enter",
								events[index][1],
								context
							],
							[
								"exit",
								events[index][1],
								context
							],
							[
								"exit",
								strikethrough,
								context
							]
						]);
						splice(events, open - 1, index - open + 3, nextEvents);
						index = open + nextEvents.length - 2;
						break;
					}
				}
				index = -1;
				while (++index < events.length) if (events[index][1].type === "strikethroughSequenceTemporary") events[index][1].type = "data";
				return events;
			}
			/**
			* @this {TokenizeContext}
			* @type {Tokenizer}
			*/
			function tokenizeStrikethrough(effects, ok, nok) {
				const previous = this.previous;
				const events = this.events;
				let size = 0;
				return start;
				/** @type {State} */
				function start(code) {
					if (previous === 126 && events[events.length - 1][1].type !== "characterEscape") return nok(code);
					effects.enter("strikethroughSequenceTemporary");
					return more(code);
				}
				/** @type {State} */
				function more(code) {
					const before = classifyCharacter(previous);
					if (code === 126) {
						if (size > 1) return nok(code);
						effects.consume(code);
						size++;
						return more;
					}
					if (size < 2 && !single) return nok(code);
					const token = effects.exit("strikethroughSequenceTemporary");
					const after = classifyCharacter(code);
					token._open = !after || after === 2 && Boolean(before);
					token._close = !before || before === 2 && Boolean(after);
					return ok(code);
				}
			}
		}
		//#endregion
		//#region node_modules/micromark-extension-gfm-table/lib/edit-map.js
		/**
		* @import {Event} from 'micromark-util-types'
		*/
		/**
		* @typedef {[number, number, Array<Event>]} Change
		* @typedef {[number, number, number]} Jump
		*/
		/**
		* Tracks a bunch of edits.
		*/
		var EditMap = class {
			/**
			* Create a new edit map.
			*/
			constructor() {
				/**
				* Record of changes.
				*
				* @type {Array<Change>}
				*/
				this.map = [];
			}
			/**
			* Create an edit: a remove and/or add at a certain place.
			*
			* @param {number} index
			* @param {number} remove
			* @param {Array<Event>} add
			* @returns {undefined}
			*/
			add(index, remove, add) {
				addImplementation(this, index, remove, add);
			}
			/**
			* Done, change the events.
			*
			* @param {Array<Event>} events
			* @returns {undefined}
			*/
			consume(events) {
				this.map.sort(function(a, b) {
					return a[0] - b[0];
				});
				/* c8 ignore next 3 -- `resolve` is never called without tables, so without edits. */
				if (this.map.length === 0) return;
				let index = this.map.length;
				/** @type {Array<Array<Event>>} */
				const vecs = [];
				while (index > 0) {
					index -= 1;
					vecs.push(events.slice(this.map[index][0] + this.map[index][1]), this.map[index][2]);
					events.length = this.map[index][0];
				}
				vecs.push(events.slice());
				events.length = 0;
				let slice = vecs.pop();
				while (slice) {
					for (const element of slice) events.push(element);
					slice = vecs.pop();
				}
				this.map.length = 0;
			}
		};
		/**
		* Create an edit.
		*
		* @param {EditMap} editMap
		* @param {number} at
		* @param {number} remove
		* @param {Array<Event>} add
		* @returns {undefined}
		*/
		function addImplementation(editMap, at, remove, add) {
			let index = 0;
			/* c8 ignore next 3 -- `resolve` is never called without tables, so without edits. */
			if (remove === 0 && add.length === 0) return;
			while (index < editMap.map.length) {
				if (editMap.map[index][0] === at) {
					editMap.map[index][1] += remove;
					editMap.map[index][2].push(...add);
					return;
				}
				index += 1;
			}
			editMap.map.push([
				at,
				remove,
				add
			]);
		}
		//#endregion
		//#region node_modules/micromark-extension-gfm-table/lib/infer.js
		/**
		* @import {Event} from 'micromark-util-types'
		*/
		/**
		* @typedef {'center' | 'left' | 'none' | 'right'} Align
		*/
		/**
		* Figure out the alignment of a GFM table.
		*
		* @param {Readonly<Array<Event>>} events
		*   List of events.
		* @param {number} index
		*   Table enter event.
		* @returns {Array<Align>}
		*   List of aligns.
		*/
		function gfmTableAlign(events, index) {
			let inDelimiterRow = false;
			/** @type {Array<Align>} */
			const align = [];
			while (index < events.length) {
				const event = events[index];
				if (inDelimiterRow) {
					if (event[0] === "enter") {
						if (event[1].type === "tableContent") align.push(events[index + 1][1].type === "tableDelimiterMarker" ? "left" : "none");
					} else if (event[1].type === "tableContent") {
						if (events[index - 1][1].type === "tableDelimiterMarker") {
							const alignIndex = align.length - 1;
							align[alignIndex] = align[alignIndex] === "left" ? "center" : "right";
						}
					} else if (event[1].type === "tableDelimiterRow") break;
				} else if (event[0] === "enter" && event[1].type === "tableDelimiterRow") inDelimiterRow = true;
				index += 1;
			}
			return align;
		}
		//#endregion
		//#region node_modules/micromark-extension-gfm-table/lib/syntax.js
		/**
		* @import {Event, Extension, Point, Resolver, State, Token, TokenizeContext, Tokenizer} from 'micromark-util-types'
		*/
		/**
		* @typedef {[number, number, number, number]} Range
		*   Cell info.
		*
		* @typedef {0 | 1 | 2 | 3} RowKind
		*   Where we are: `1` for head row, `2` for delimiter row, `3` for body row.
		*/
		/**
		* Create an HTML extension for `micromark` to support GitHub tables syntax.
		*
		* @returns {Extension}
		*   Extension for `micromark` that can be passed in `extensions` to enable GFM
		*   table syntax.
		*/
		function gfmTable() {
			return { flow: { null: {
				name: "table",
				tokenize: tokenizeTable,
				resolveAll: resolveTable
			} } };
		}
		/**
		* @this {TokenizeContext}
		* @type {Tokenizer}
		*/
		function tokenizeTable(effects, ok, nok) {
			const self = this;
			let size = 0;
			let sizeB = 0;
			/** @type {boolean | undefined} */
			let seen;
			return start;
			/**
			* Start of a GFM table.
			*
			* If there is a valid table row or table head before, then we try to parse
			* another row.
			* Otherwise, we try to parse a head.
			*
			* ```markdown
			* > | | a |
			*     ^
			*   | | - |
			* > | | b |
			*     ^
			* ```
			* @type {State}
			*/
			function start(code) {
				let index = self.events.length - 1;
				while (index > -1) {
					const type = self.events[index][1].type;
					if (type === "lineEnding" || type === "linePrefix") index--;
					else break;
				}
				const tail = index > -1 ? self.events[index][1].type : null;
				const next = tail === "tableHead" || tail === "tableRow" ? bodyRowStart : headRowBefore;
				if (next === bodyRowStart && self.parser.lazy[self.now().line]) return nok(code);
				return next(code);
			}
			/**
			* Before table head row.
			*
			* ```markdown
			* > | | a |
			*     ^
			*   | | - |
			*   | | b |
			* ```
			*
			* @type {State}
			*/
			function headRowBefore(code) {
				effects.enter("tableHead");
				effects.enter("tableRow");
				return headRowStart(code);
			}
			/**
			* Before table head row, after whitespace.
			*
			* ```markdown
			* > | | a |
			*     ^
			*   | | - |
			*   | | b |
			* ```
			*
			* @type {State}
			*/
			function headRowStart(code) {
				if (code === 124) return headRowBreak(code);
				seen = true;
				sizeB += 1;
				return headRowBreak(code);
			}
			/**
			* At break in table head row.
			*
			* ```markdown
			* > | | a |
			*     ^
			*       ^
			*         ^
			*   | | - |
			*   | | b |
			* ```
			*
			* @type {State}
			*/
			function headRowBreak(code) {
				if (code === null) return nok(code);
				if (markdownLineEnding(code)) {
					if (sizeB > 1) {
						sizeB = 0;
						self.interrupt = true;
						effects.exit("tableRow");
						effects.enter("lineEnding");
						effects.consume(code);
						effects.exit("lineEnding");
						return headDelimiterStart;
					}
					return nok(code);
				}
				if (markdownSpace(code)) return factorySpace(effects, headRowBreak, "whitespace")(code);
				sizeB += 1;
				if (seen) {
					seen = false;
					size += 1;
				}
				if (code === 124) {
					effects.enter("tableCellDivider");
					effects.consume(code);
					effects.exit("tableCellDivider");
					seen = true;
					return headRowBreak;
				}
				effects.enter("data");
				return headRowData(code);
			}
			/**
			* In table head row data.
			*
			* ```markdown
			* > | | a |
			*       ^
			*   | | - |
			*   | | b |
			* ```
			*
			* @type {State}
			*/
			function headRowData(code) {
				if (code === null || code === 124 || markdownLineEndingOrSpace(code)) {
					effects.exit("data");
					return headRowBreak(code);
				}
				effects.consume(code);
				return code === 92 ? headRowEscape : headRowData;
			}
			/**
			* In table head row escape.
			*
			* ```markdown
			* > | | a\-b |
			*         ^
			*   | | ---- |
			*   | | c    |
			* ```
			*
			* @type {State}
			*/
			function headRowEscape(code) {
				if (code === 92 || code === 124) {
					effects.consume(code);
					return headRowData;
				}
				return headRowData(code);
			}
			/**
			* Before delimiter row.
			*
			* ```markdown
			*   | | a |
			* > | | - |
			*     ^
			*   | | b |
			* ```
			*
			* @type {State}
			*/
			function headDelimiterStart(code) {
				self.interrupt = false;
				if (self.parser.lazy[self.now().line]) return nok(code);
				effects.enter("tableDelimiterRow");
				seen = false;
				if (markdownSpace(code)) return factorySpace(effects, headDelimiterBefore, "linePrefix", self.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 4)(code);
				return headDelimiterBefore(code);
			}
			/**
			* Before delimiter row, after optional whitespace.
			*
			* Reused when a `|` is found later, to parse another cell.
			*
			* ```markdown
			*   | | a |
			* > | | - |
			*     ^
			*   | | b |
			* ```
			*
			* @type {State}
			*/
			function headDelimiterBefore(code) {
				if (code === 45 || code === 58) return headDelimiterValueBefore(code);
				if (code === 124) {
					seen = true;
					effects.enter("tableCellDivider");
					effects.consume(code);
					effects.exit("tableCellDivider");
					return headDelimiterCellBefore;
				}
				return headDelimiterNok(code);
			}
			/**
			* After `|`, before delimiter cell.
			*
			* ```markdown
			*   | | a |
			* > | | - |
			*      ^
			* ```
			*
			* @type {State}
			*/
			function headDelimiterCellBefore(code) {
				if (markdownSpace(code)) return factorySpace(effects, headDelimiterValueBefore, "whitespace")(code);
				return headDelimiterValueBefore(code);
			}
			/**
			* Before delimiter cell value.
			*
			* ```markdown
			*   | | a |
			* > | | - |
			*       ^
			* ```
			*
			* @type {State}
			*/
			function headDelimiterValueBefore(code) {
				if (code === 58) {
					sizeB += 1;
					seen = true;
					effects.enter("tableDelimiterMarker");
					effects.consume(code);
					effects.exit("tableDelimiterMarker");
					return headDelimiterLeftAlignmentAfter;
				}
				if (code === 45) {
					sizeB += 1;
					return headDelimiterLeftAlignmentAfter(code);
				}
				if (code === null || markdownLineEnding(code)) return headDelimiterCellAfter(code);
				return headDelimiterNok(code);
			}
			/**
			* After delimiter cell left alignment marker.
			*
			* ```markdown
			*   | | a  |
			* > | | :- |
			*        ^
			* ```
			*
			* @type {State}
			*/
			function headDelimiterLeftAlignmentAfter(code) {
				if (code === 45) {
					effects.enter("tableDelimiterFiller");
					return headDelimiterFiller(code);
				}
				return headDelimiterNok(code);
			}
			/**
			* In delimiter cell filler.
			*
			* ```markdown
			*   | | a |
			* > | | - |
			*       ^
			* ```
			*
			* @type {State}
			*/
			function headDelimiterFiller(code) {
				if (code === 45) {
					effects.consume(code);
					return headDelimiterFiller;
				}
				if (code === 58) {
					seen = true;
					effects.exit("tableDelimiterFiller");
					effects.enter("tableDelimiterMarker");
					effects.consume(code);
					effects.exit("tableDelimiterMarker");
					return headDelimiterRightAlignmentAfter;
				}
				effects.exit("tableDelimiterFiller");
				return headDelimiterRightAlignmentAfter(code);
			}
			/**
			* After delimiter cell right alignment marker.
			*
			* ```markdown
			*   | |  a |
			* > | | -: |
			*         ^
			* ```
			*
			* @type {State}
			*/
			function headDelimiterRightAlignmentAfter(code) {
				if (markdownSpace(code)) return factorySpace(effects, headDelimiterCellAfter, "whitespace")(code);
				return headDelimiterCellAfter(code);
			}
			/**
			* After delimiter cell.
			*
			* ```markdown
			*   | |  a |
			* > | | -: |
			*          ^
			* ```
			*
			* @type {State}
			*/
			function headDelimiterCellAfter(code) {
				if (code === 124) return headDelimiterBefore(code);
				if (code === null || markdownLineEnding(code)) {
					if (!seen || size !== sizeB) return headDelimiterNok(code);
					effects.exit("tableDelimiterRow");
					effects.exit("tableHead");
					return ok(code);
				}
				return headDelimiterNok(code);
			}
			/**
			* In delimiter row, at a disallowed byte.
			*
			* ```markdown
			*   | | a |
			* > | | x |
			*       ^
			* ```
			*
			* @type {State}
			*/
			function headDelimiterNok(code) {
				return nok(code);
			}
			/**
			* Before table body row.
			*
			* ```markdown
			*   | | a |
			*   | | - |
			* > | | b |
			*     ^
			* ```
			*
			* @type {State}
			*/
			function bodyRowStart(code) {
				effects.enter("tableRow");
				return bodyRowBreak(code);
			}
			/**
			* At break in table body row.
			*
			* ```markdown
			*   | | a |
			*   | | - |
			* > | | b |
			*     ^
			*       ^
			*         ^
			* ```
			*
			* @type {State}
			*/
			function bodyRowBreak(code) {
				if (code === 124) {
					effects.enter("tableCellDivider");
					effects.consume(code);
					effects.exit("tableCellDivider");
					return bodyRowBreak;
				}
				if (code === null || markdownLineEnding(code)) {
					effects.exit("tableRow");
					return ok(code);
				}
				if (markdownSpace(code)) return factorySpace(effects, bodyRowBreak, "whitespace")(code);
				effects.enter("data");
				return bodyRowData(code);
			}
			/**
			* In table body row data.
			*
			* ```markdown
			*   | | a |
			*   | | - |
			* > | | b |
			*       ^
			* ```
			*
			* @type {State}
			*/
			function bodyRowData(code) {
				if (code === null || code === 124 || markdownLineEndingOrSpace(code)) {
					effects.exit("data");
					return bodyRowBreak(code);
				}
				effects.consume(code);
				return code === 92 ? bodyRowEscape : bodyRowData;
			}
			/**
			* In table body row escape.
			*
			* ```markdown
			*   | | a    |
			*   | | ---- |
			* > | | b\-c |
			*         ^
			* ```
			*
			* @type {State}
			*/
			function bodyRowEscape(code) {
				if (code === 92 || code === 124) {
					effects.consume(code);
					return bodyRowData;
				}
				return bodyRowData(code);
			}
		}
		/** @type {Resolver} */
		function resolveTable(events, context) {
			let index = -1;
			let inFirstCellAwaitingPipe = true;
			/** @type {RowKind} */
			let rowKind = 0;
			/** @type {Range} */
			let lastCell = [
				0,
				0,
				0,
				0
			];
			/** @type {Range} */
			let cell = [
				0,
				0,
				0,
				0
			];
			let afterHeadAwaitingFirstBodyRow = false;
			let lastTableEnd = 0;
			/** @type {Token | undefined} */
			let currentTable;
			/** @type {Token | undefined} */
			let currentBody;
			/** @type {Token | undefined} */
			let currentCell;
			const map = new EditMap();
			while (++index < events.length) {
				const event = events[index];
				const token = event[1];
				if (event[0] === "enter") {
					if (token.type === "tableHead") {
						afterHeadAwaitingFirstBodyRow = false;
						if (lastTableEnd !== 0) {
							flushTableEnd(map, context, lastTableEnd, currentTable, currentBody);
							currentBody = void 0;
							lastTableEnd = 0;
						}
						currentTable = {
							type: "table",
							start: Object.assign({}, token.start),
							end: Object.assign({}, token.end)
						};
						map.add(index, 0, [[
							"enter",
							currentTable,
							context
						]]);
					} else if (token.type === "tableRow" || token.type === "tableDelimiterRow") {
						inFirstCellAwaitingPipe = true;
						currentCell = void 0;
						lastCell = [
							0,
							0,
							0,
							0
						];
						cell = [
							0,
							index + 1,
							0,
							0
						];
						if (afterHeadAwaitingFirstBodyRow) {
							afterHeadAwaitingFirstBodyRow = false;
							currentBody = {
								type: "tableBody",
								start: Object.assign({}, token.start),
								end: Object.assign({}, token.end)
							};
							map.add(index, 0, [[
								"enter",
								currentBody,
								context
							]]);
						}
						rowKind = token.type === "tableDelimiterRow" ? 2 : currentBody ? 3 : 1;
					} else if (rowKind && (token.type === "data" || token.type === "tableDelimiterMarker" || token.type === "tableDelimiterFiller")) {
						inFirstCellAwaitingPipe = false;
						if (cell[2] === 0) {
							if (lastCell[1] !== 0) {
								cell[0] = cell[1];
								currentCell = flushCell(map, context, lastCell, rowKind, void 0, currentCell);
								lastCell = [
									0,
									0,
									0,
									0
								];
							}
							cell[2] = index;
						}
					} else if (token.type === "tableCellDivider") {
						if (inFirstCellAwaitingPipe) inFirstCellAwaitingPipe = false;
						else {
							if (lastCell[1] !== 0) {
								cell[0] = cell[1];
								currentCell = flushCell(map, context, lastCell, rowKind, void 0, currentCell);
							}
							lastCell = cell;
							cell = [
								lastCell[1],
								index,
								0,
								0
							];
						}
					}
				} else if (token.type === "tableHead") {
					afterHeadAwaitingFirstBodyRow = true;
					lastTableEnd = index;
				} else if (token.type === "tableRow" || token.type === "tableDelimiterRow") {
					lastTableEnd = index;
					if (lastCell[1] !== 0) {
						cell[0] = cell[1];
						currentCell = flushCell(map, context, lastCell, rowKind, index, currentCell);
					} else if (cell[1] !== 0) currentCell = flushCell(map, context, cell, rowKind, index, currentCell);
					rowKind = 0;
				} else if (rowKind && (token.type === "data" || token.type === "tableDelimiterMarker" || token.type === "tableDelimiterFiller")) cell[3] = index;
			}
			if (lastTableEnd !== 0) flushTableEnd(map, context, lastTableEnd, currentTable, currentBody);
			map.consume(context.events);
			index = -1;
			while (++index < context.events.length) {
				const event = context.events[index];
				if (event[0] === "enter" && event[1].type === "table") event[1]._align = gfmTableAlign(context.events, index);
			}
			return events;
		}
		/**
		* Generate a cell.
		*
		* @param {EditMap} map
		* @param {Readonly<TokenizeContext>} context
		* @param {Readonly<Range>} range
		* @param {RowKind} rowKind
		* @param {number | undefined} rowEnd
		* @param {Token | undefined} previousCell
		* @returns {Token | undefined}
		*/
		function flushCell(map, context, range, rowKind, rowEnd, previousCell) {
			const groupName = rowKind === 1 ? "tableHeader" : rowKind === 2 ? "tableDelimiter" : "tableData";
			const valueName = "tableContent";
			if (range[0] !== 0) {
				previousCell.end = Object.assign({}, getPoint(context.events, range[0]));
				map.add(range[0], 0, [[
					"exit",
					previousCell,
					context
				]]);
			}
			const now = getPoint(context.events, range[1]);
			previousCell = {
				type: groupName,
				start: Object.assign({}, now),
				end: Object.assign({}, now)
			};
			map.add(range[1], 0, [[
				"enter",
				previousCell,
				context
			]]);
			if (range[2] !== 0) {
				const relatedStart = getPoint(context.events, range[2]);
				const relatedEnd = getPoint(context.events, range[3]);
				/** @type {Token} */
				const valueToken = {
					type: valueName,
					start: Object.assign({}, relatedStart),
					end: Object.assign({}, relatedEnd)
				};
				map.add(range[2], 0, [[
					"enter",
					valueToken,
					context
				]]);
				if (rowKind !== 2) {
					const start = context.events[range[2]];
					const end = context.events[range[3]];
					start[1].end = Object.assign({}, end[1].end);
					start[1].type = "chunkText";
					start[1].contentType = "text";
					if (range[3] > range[2] + 1) {
						const a = range[2] + 1;
						const b = range[3] - range[2] - 1;
						map.add(a, b, []);
					}
				}
				map.add(range[3] + 1, 0, [[
					"exit",
					valueToken,
					context
				]]);
			}
			if (rowEnd !== void 0) {
				previousCell.end = Object.assign({}, getPoint(context.events, rowEnd));
				map.add(rowEnd, 0, [[
					"exit",
					previousCell,
					context
				]]);
				previousCell = void 0;
			}
			return previousCell;
		}
		/**
		* Generate table end (and table body end).
		*
		* @param {Readonly<EditMap>} map
		* @param {Readonly<TokenizeContext>} context
		* @param {number} index
		* @param {Token} table
		* @param {Token | undefined} tableBody
		*/
		function flushTableEnd(map, context, index, table, tableBody) {
			/** @type {Array<Event>} */
			const exits = [];
			const related = getPoint(context.events, index);
			if (tableBody) {
				tableBody.end = Object.assign({}, related);
				exits.push([
					"exit",
					tableBody,
					context
				]);
			}
			table.end = Object.assign({}, related);
			exits.push([
				"exit",
				table,
				context
			]);
			map.add(index + 1, 0, exits);
		}
		/**
		* @param {Readonly<Array<Event>>} events
		* @param {number} index
		* @returns {Readonly<Point>}
		*/
		function getPoint(events, index) {
			const event = events[index];
			const side = event[0] === "enter" ? "start" : "end";
			return event[1][side];
		}
		//#endregion
		//#region node_modules/micromark-extension-gfm-task-list-item/lib/syntax.js
		/**
		* @import {Extension, State, TokenizeContext, Tokenizer} from 'micromark-util-types'
		*/
		const tasklistCheck = {
			name: "tasklistCheck",
			tokenize: tokenizeTasklistCheck
		};
		/**
		* Create an HTML extension for `micromark` to support GFM task list items
		* syntax.
		*
		* @returns {Extension}
		*   Extension for `micromark` that can be passed in `htmlExtensions` to
		*   support GFM task list items when serializing to HTML.
		*/
		function gfmTaskListItem() {
			return { text: { [91]: tasklistCheck } };
		}
		/**
		* @this {TokenizeContext}
		* @type {Tokenizer}
		*/
		function tokenizeTasklistCheck(effects, ok, nok) {
			const self = this;
			return open;
			/**
			* At start of task list item check.
			*
			* ```markdown
			* > | * [x] y.
			*       ^
			* ```
			*
			* @type {State}
			*/
			function open(code) {
				if (self.previous !== null || !self._gfmTasklistFirstContentOfListItem) return nok(code);
				effects.enter("taskListCheck");
				effects.enter("taskListCheckMarker");
				effects.consume(code);
				effects.exit("taskListCheckMarker");
				return inside;
			}
			/**
			* In task list item check.
			*
			* ```markdown
			* > | * [x] y.
			*        ^
			* ```
			*
			* @type {State}
			*/
			function inside(code) {
				if (markdownLineEndingOrSpace(code)) {
					effects.enter("taskListCheckValueUnchecked");
					effects.consume(code);
					effects.exit("taskListCheckValueUnchecked");
					return close;
				}
				if (code === 88 || code === 120) {
					effects.enter("taskListCheckValueChecked");
					effects.consume(code);
					effects.exit("taskListCheckValueChecked");
					return close;
				}
				return nok(code);
			}
			/**
			* At close of task list item check.
			*
			* ```markdown
			* > | * [x] y.
			*         ^
			* ```
			*
			* @type {State}
			*/
			function close(code) {
				if (code === 93) {
					effects.enter("taskListCheckMarker");
					effects.consume(code);
					effects.exit("taskListCheckMarker");
					effects.exit("taskListCheck");
					return after;
				}
				return nok(code);
			}
			/**
			* @type {State}
			*/
			function after(code) {
				if (markdownLineEnding(code)) return ok(code);
				if (markdownSpace(code)) return effects.check({ tokenize: spaceThenNonSpace }, ok, nok)(code);
				return nok(code);
			}
		}
		/**
		* @this {TokenizeContext}
		* @type {Tokenizer}
		*/
		function spaceThenNonSpace(effects, ok, nok) {
			return factorySpace(effects, after, "whitespace");
			/**
			* After whitespace, after task list item check.
			*
			* ```markdown
			* > | * [x] y.
			*           ^
			* ```
			*
			* @type {State}
			*/
			function after(code) {
				return code === null ? nok(code) : ok(code);
			}
		}
		//#endregion
		//#region node_modules/micromark-extension-gfm/index.js
		/**
		* @typedef {import('micromark-extension-gfm-footnote').HtmlOptions} HtmlOptions
		* @typedef {import('micromark-extension-gfm-strikethrough').Options} Options
		* @typedef {import('micromark-util-types').Extension} Extension
		* @typedef {import('micromark-util-types').HtmlExtension} HtmlExtension
		*/
		/**
		* Create an extension for `micromark` to enable GFM syntax.
		*
		* @param {Options | null | undefined} [options]
		*   Configuration (optional).
		*
		*   Passed to `micromark-extens-gfm-strikethrough`.
		* @returns {Extension}
		*   Extension for `micromark` that can be passed in `extensions` to enable GFM
		*   syntax.
		*/
		function gfm(options) {
			return combineExtensions([
				gfmAutolinkLiteral(),
				gfmFootnote(),
				gfmStrikethrough(options),
				gfmTable(),
				gfmTaskListItem()
			]);
		}
		//#endregion
		//#region node_modules/remark-gfm/lib/index.js
		/**
		* @import {Root} from 'mdast'
		* @import {Options} from 'remark-gfm'
		* @import {} from 'remark-parse'
		* @import {} from 'remark-stringify'
		* @import {Processor} from 'unified'
		*/
		/** @type {Options} */
		const emptyOptions = {};
		/**
		* Add support GFM (autolink literals, footnotes, strikethrough, tables,
		* tasklists).
		*
		* @param {Options | null | undefined} [options]
		*   Configuration (optional).
		* @returns {undefined}
		*   Nothing.
		*/
		function remarkGfm(options) {
			const self = this;
			const settings = options || emptyOptions;
			const data = self.data();
			const micromarkExtensions = data.micromarkExtensions || (data.micromarkExtensions = []);
			const fromMarkdownExtensions = data.fromMarkdownExtensions || (data.fromMarkdownExtensions = []);
			const toMarkdownExtensions = data.toMarkdownExtensions || (data.toMarkdownExtensions = []);
			micromarkExtensions.push(gfm(settings));
			fromMarkdownExtensions.push(gfmFromMarkdown());
			toMarkdownExtensions.push(gfmToMarkdown(settings));
		}
		//#endregion
		//#region src/client/KnowledgeMarkdown.tsx
		/** Safe Markdown for the source snapshot opened from an artifact citation. */
		function KnowledgeMarkdown({ page }) {
			const content = String(page?.content ?? "");
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "ks-knowledge-markdown",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("style", { children: `
      .ks-knowledge-markdown{min-width:0;overflow-wrap:anywhere;line-height:1.75}
      .ks-knowledge-markdown h1{margin:0 0 16px;font-size:23px;line-height:1.4}
      .ks-knowledge-markdown h2{margin:24px 0 9px;font-size:18px;line-height:1.45}
      .ks-knowledge-markdown h3{margin:18px 0 7px;font-size:15px;line-height:1.5}
      .ks-knowledge-markdown p{margin:8px 0}.ks-knowledge-markdown ul,.ks-knowledge-markdown ol{padding-left:24px}
      .ks-knowledge-markdown a{color:var(--dsw-alias-state-business-primary,#963442);text-underline-offset:3px}
      .ks-knowledge-markdown pre{max-width:100%;overflow:auto;white-space:pre;padding:12px 14px;border-radius:7px;background:var(--dsw-alias-bg-layer-2,#f7f3f1);font-size:12px;line-height:1.65}
      .ks-knowledge-markdown code{font-family:ui-monospace,Consolas,monospace}.ks-knowledge-markdown :not(pre)>code{background:var(--dsw-alias-bg-layer-2,#f7f3f1);padding:1px 4px;border-radius:4px}
      .ks-knowledge-markdown blockquote{margin:16px 0;padding:2px 14px;border-left:3px solid var(--dsw-alias-border-l2,#e3d9d4);color:var(--dsw-alias-label-secondary,#746965)}
      .ks-knowledge-markdown table{width:100%;border-collapse:collapse;font-size:13px}.ks-knowledge-markdown th,.ks-knowledge-markdown td{border:1px solid var(--dsw-alias-border-l2,#e3d9d4);padding:7px;text-align:left}
      .ks-knowledge-markdown th{background:var(--dsw-alias-bg-layer-2,#f7f3f1)}.ks-markdown-image{font-size:12px;color:var(--dsw-alias-label-secondary,#746965)}
    ` }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Markdown, {
					remarkPlugins: [remarkGfm],
					skipHtml: true,
					urlTransform: defaultUrlTransform,
					components: {
						a: ({ href = "", children, node: _node, ...props }) => {
							return href ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("a", {
								href,
								...props,
								children
							}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children });
						},
						img: ({ alt }) => alt ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
							className: "ks-markdown-image",
							children: [
								"[图片：",
								alt,
								"]"
							]
						}) : null,
						table: ({ children }) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							style: { overflowX: "auto" },
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("table", { children })
						})
					},
					children: content
				})]
			});
		}
		//#endregion
		//#region node_modules/zod/v4/core/util.js
		function joinValues(array, separator = "|") {
			return array.map((val) => stringifyPrimitive(val)).join(separator);
		}
		function jsonStringifyReplacer(_, value) {
			if (typeof value === "bigint") return value.toString();
			return value;
		}
		function nullish(input) {
			return input === null || input === void 0;
		}
		function cleanRegex(source) {
			const start = source.startsWith("^") ? 1 : 0;
			const end = source.endsWith("$") ? source.length - 1 : source.length;
			return source.slice(start, end);
		}
		function assignProp(target, prop, value) {
			Object.defineProperty(target, prop, {
				value,
				writable: true,
				enumerable: true,
				configurable: true
			});
		}
		function mergeDefs(...defs) {
			const mergedDescriptors = {};
			for (const def of defs) {
				const descriptors = Object.getOwnPropertyDescriptors(def);
				Object.assign(mergedDescriptors, descriptors);
			}
			return Object.defineProperties({}, mergedDescriptors);
		}
		function slugify(input) {
			return input.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
		}
		const captureStackTrace = "captureStackTrace" in Error ? Error.captureStackTrace : (..._args) => {};
		function isObject(data) {
			return typeof data === "object" && data !== null && !Array.isArray(data);
		}
		function isPlainObject(o) {
			if (isObject(o) === false) return false;
			const ctor = o.constructor;
			if (ctor === void 0) return true;
			if (typeof ctor !== "function") return true;
			const prot = ctor.prototype;
			if (isObject(prot) === false) return false;
			if (Object.prototype.hasOwnProperty.call(prot, "isPrototypeOf") === false) return false;
			return true;
		}
		function shallowClone(o) {
			if (isPlainObject(o)) return { ...o };
			if (Array.isArray(o)) return [...o];
			if (o instanceof Map) return new Map(o);
			if (o instanceof Set) return new Set(o);
			return o;
		}
		function escapeRegex(str) {
			return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
		}
		function clone(inst, def, params) {
			const cl = new inst._zod.constr(def ?? inst._zod.def);
			if (!def || params?.parent) cl._zod.parent = inst;
			return cl;
		}
		function normalizeParams(_params) {
			const params = _params;
			if (!params) return {};
			if (typeof params === "string") return { error: () => params };
			if (params?.message !== void 0) {
				if (params?.error !== void 0) throw new Error("Cannot specify both `message` and `error` params");
				params.error = params.message;
			}
			delete params.message;
			if (typeof params.error === "string") return {
				...params,
				error: () => params.error
			};
			return params;
		}
		function stringifyPrimitive(value) {
			if (typeof value === "bigint") return value.toString() + "n";
			if (typeof value === "string") return `"${value}"`;
			return `${value}`;
		}
		function aborted(x, startIndex = 0) {
			if (x.aborted === true) return true;
			for (let i = startIndex; i < x.issues.length; i++) if (x.issues[i]?.continue !== true) return true;
			return false;
		}
		function explicitlyAborted(x, startIndex = 0) {
			if (x.aborted === true) return true;
			for (let i = startIndex; i < x.issues.length; i++) if (x.issues[i]?.continue === false) return true;
			return false;
		}
		function prefixIssues(path, issues) {
			return issues.map((iss) => {
				var _a;
				(_a = iss).path ?? (_a.path = []);
				iss.path.unshift(path);
				return iss;
			});
		}
		function unwrapMessage(message) {
			return typeof message === "string" ? message : message?.message;
		}
		function attachSchema(issues, start, inst) {
			var _a;
			for (let i = start; i < issues.length; i++) (_a = issues[i]).schema ?? (_a.schema = inst);
		}
		function finalizeIssue(iss, ctx, config) {
			var _a;
			const traits = iss.inst?._zod?.traits;
			if (traits?.has("$ZodType")) {
				if (traits.has("$ZodCheck")) (_a = iss).schema ?? (_a.schema = iss.inst);
				else iss.schema = iss.inst;
			}
			const schemaError = iss.schema !== iss.inst ? iss.schema?._zod.def?.error : void 0;
			const message = iss.message ? iss.message : unwrapMessage(iss.inst?._zod.def?.error?.(iss)) ?? unwrapMessage(schemaError?.(iss)) ?? unwrapMessage(ctx?.error?.(iss)) ?? unwrapMessage(config.customError?.(iss)) ?? unwrapMessage(config.localeError?.(iss)) ?? "Invalid input";
			const { inst: _inst, schema: _schema, continue: _continue, input: _input, ...rest } = iss;
			rest.path ?? (rest.path = []);
			rest.message = message;
			if (ctx?.reportInput) rest.input = _input;
			return rest;
		}
		const highSurrogate = /[\uD800-\uDBFF]/;
		function codePointLength(str) {
			const units = str.length;
			if (!highSurrogate.test(str)) return units;
			let count = units;
			for (let i = 0; i < units - 1; i++) if ((str.charCodeAt(i) & 64512) === 55296 && (str.charCodeAt(i + 1) & 64512) === 56320) {
				count--;
				i++;
			}
			return count;
		}
		function getLengthableOrigin(input) {
			if (Array.isArray(input)) return "array";
			if (typeof input === "string") return "string";
			return "unknown";
		}
		function parsedType(data) {
			const t = typeof data;
			switch (t) {
				case "number": return Number.isNaN(data) ? "nan" : "number";
				case "object": {
					if (data === null) return "null";
					if (Array.isArray(data)) return "array";
					const obj = data;
					if (obj && Object.getPrototypeOf(obj) !== Object.prototype && "constructor" in obj && obj.constructor) return obj.constructor.name;
				}
			}
			return t;
		}
		function issue(...args) {
			const [iss, input, inst] = args;
			if (typeof iss === "string") return {
				message: iss,
				code: "custom",
				input,
				inst
			};
			return { ...iss };
		}
		/**
		* Installs a trait's members on its prototype. Each value builds that member for the instance on first read; the built value shadows the accessor as an own property, so a detached `const { parse } = schema` keeps working.
		*
		* Call this from a `proto` initializer, which runs once per prototype — never per instance.
		*/
		function members(proto, table) {
			for (const key in table) {
				const desc = Object.getOwnPropertyDescriptor(table, key);
				if (desc.get) Object.defineProperty(proto, key, {
					...desc,
					enumerable: false
				});
				else defineBound(proto, key, desc.value);
			}
		}
		/** Shadows a prototype member with an own value, so a getter that builds from the instance runs once. */
		function own(inst, key, value, enumerable = true) {
			Object.defineProperty(inst, key, {
				configurable: true,
				writable: true,
				enumerable,
				value
			});
			return value;
		}
		/** Like {@link own}, for a member that was never an own data property and has to stay out of `Object.keys`. */
		function hide(inst, key, value) {
			return own(inst, key, value, false);
		}
		function defineBound(proto, key, fn) {
			Object.defineProperty(proto, key, {
				configurable: true,
				get() {
					return this == null ? fn : own(this, key, fn.bind(this));
				},
				set(value) {
					own(this, key, value);
				}
			});
		}
		let installing;
		let broke = false;
		const breaker = {
			configurable: true,
			get() {
				broke = true;
			}
		};
		/**
		* Installs a lazily-derived internal on the `_zod` prototype of `inst`'s
		* constructor, computed from the internals object itself and cached there on
		* first read. One accessor per constructor rather than one per instance.
		*/
		function defineLazyInternal(inst, key, compute) {
			const proto = Object.getPrototypeOf(inst._zod);
			if (key in proto && installing !== inst._zod) {
				installing = void 0;
				return;
			}
			installing = inst._zod;
			Object.defineProperty(proto, key, {
				configurable: true,
				get() {
					Object.defineProperty(this, key, breaker);
					const outer = broke;
					broke = false;
					try {
						const value = compute(this);
						if (broke) delete this[key];
						else Object.defineProperty(this, key, {
							configurable: true,
							writable: true,
							value
						});
						broke = broke || outer;
						return value;
					} catch (err) {
						delete this[key];
						broke = broke || outer;
						throw err;
					}
				},
				set(value) {
					Object.defineProperty(this, key, {
						configurable: true,
						writable: true,
						value
					});
				}
			});
		}
		/** Marks the thunk `_catch` synthesises for a constant catch value. `Function.length` cannot tell that thunk from a user callback — rest and defaulted parameters both report arity 0 — and a user callback reads `ctx.error`, whose issues only finalize correctly against the caller's per-parse error map. Provenance can say what arity cannot. A plain string key rather than `Symbol.for`, whose call at module scope no bundler can prove pure — the same shape that anchored `urlCanParse` into every build. */
		const CONSTANT_CATCH = "~constantCatch";
		/** Wraps a constant catch value in a thunk tagged with {@link CONSTANT_CATCH}. */
		function constantCatch(value) {
			const fn = () => value;
			fn[CONSTANT_CATCH] = true;
			return fn;
		}
		//#endregion
		//#region node_modules/zod/v4/core/core.js
		var _a$1;
		const _zodDesc$1 = {
			value: void 0,
			enumerable: false
		};
		let _E = "captureStackTrace" in Error ? Error : null;
		function newError(Definition) {
			const E = _E;
			if (E) {
				const saved = E.stackTraceLimit;
				if (typeof saved === "number") {
					try {
						E.stackTraceLimit = 0;
					} catch {
						_E = null;
						return new Definition();
					}
					try {
						return new Definition();
					} finally {
						E.stackTraceLimit = saved;
					}
				}
			}
			return new Definition();
		}
		function $constructor(name, initializer, proto, params) {
			const zodProto = {};
			function Internals(def) {
				this.def = def;
				this.constr = _;
				this.traits = /* @__PURE__ */ new Set();
			}
			Internals.prototype = zodProto;
			const protoMembers = proto;
			const initialized = protoMembers && /* @__PURE__ */ new WeakSet();
			function init(inst, def) {
				if (!inst._zod) {
					_zodDesc$1.value = new Internals(def);
					try {
						Object.defineProperty(inst, "_zod", _zodDesc$1);
					} finally {
						_zodDesc$1.value = void 0;
					}
				}
				if (inst._zod.traits.has(name)) return;
				inst._zod.traits.add(name);
				initializer(inst, def);
				if (initialized) {
					const own = Object.getPrototypeOf(inst);
					const ctorProto = inst._zod.constr.prototype;
					let up = own;
					while (up && up !== ctorProto) up = Object.getPrototypeOf(up);
					const target = up ?? own;
					if (!initialized.has(target)) {
						initialized.add(target);
						members(target, protoMembers);
					}
				}
				const proto = _.prototype;
				for (const k in proto) {
					if (!Object.prototype.hasOwnProperty.call(proto, k)) continue;
					if (!(k in inst)) inst[k] = proto[k].bind(inst);
				}
			}
			const Parent = params?.Parent ?? Object;
			class Definition extends Parent {}
			Object.defineProperty(Definition, "name", { value: name });
			function _(def) {
				const inst = params?.Parent ? newError(Definition) : this;
				init(inst, def);
				const deferred = inst._zod.deferred;
				if (deferred) {
					for (const fn of deferred) fn();
					inst._zod.deferred = void 0;
				}
				const pp = globalThis.__zod_globalConfig?.postProcessor;
				if (pp) pp(inst);
				return inst;
			}
			Object.defineProperty(_, "init", { value: init });
			Object.defineProperty(_, Symbol.hasInstance, { value: (inst) => {
				if (params?.Parent && inst instanceof params.Parent) return true;
				return inst?._zod?.traits?.has(name);
			} });
			Object.defineProperty(_, "name", { value: name });
			return _;
		}
		var $ZodAsyncError = class extends Error {
			constructor() {
				super(`Encountered Promise during synchronous parse. Use .parseAsync() instead.`);
			}
		};
		var $ZodEncodeError = class extends Error {
			constructor(name) {
				super(`Encountered unidirectional transform during encode: ${name}`);
				this.name = "ZodEncodeError";
			}
		};
		(_a$1 = globalThis).__zod_globalConfig ?? (_a$1.__zod_globalConfig = {});
		const globalConfig = globalThis.__zod_globalConfig;
		function config(newConfig) {
			if (newConfig) Object.assign(globalConfig, newConfig);
			return globalConfig;
		}
		//#endregion
		//#region node_modules/zod/v4/core/errors.js
		function _getMessage() {
			const internals = this._zod;
			internals.message ?? (internals.message = JSON.stringify(internals.def, jsonStringifyReplacer, 2));
			return internals.message;
		}
		function _setMessage(value) {
			this._zod.message = value;
		}
		const _messageDesc = {
			get: _getMessage,
			set: _setMessage,
			enumerable: true,
			configurable: true
		};
		const _zodDesc = {
			value: void 0,
			enumerable: false
		};
		const _issuesDesc = {
			value: void 0,
			enumerable: false
		};
		const _installedToString = /* @__PURE__ */ new WeakSet([Object.prototype, Error.prototype]);
		const initializer$1 = (inst, def) => {
			inst.name = "$ZodError";
			_zodDesc.value = inst._zod;
			Object.defineProperty(inst, "_zod", _zodDesc);
			_issuesDesc.value = def;
			Object.defineProperty(inst, "issues", _issuesDesc);
			_zodDesc.value = void 0;
			_issuesDesc.value = void 0;
			Object.defineProperty(inst, "message", _messageDesc);
			const proto = Object.getPrototypeOf(inst);
			if (!_installedToString.has(proto)) {
				_installedToString.add(proto);
				Object.defineProperty(proto, "toString", {
					configurable: true,
					enumerable: false,
					get() {
						const value = () => this.message;
						Object.defineProperty(this, "toString", {
							value,
							configurable: true,
							writable: true
						});
						return value;
					},
					set(value) {
						Object.defineProperty(this, "toString", {
							value,
							configurable: true,
							writable: true
						});
					}
				});
			}
		};
		const $ZodError = $constructor("$ZodError", initializer$1);
		const $ZodRealError = $constructor("$ZodError", initializer$1, void 0, { Parent: Error });
		/** Get-or-create `obj[key]` as an own data property. A path segment naming an inherited member
		* ("toString", "constructor") would otherwise read through to the prototype, and assigning
		* "__proto__" would hit the setter instead of creating a key. */
		function node(obj, key, make) {
			if (!Object.prototype.hasOwnProperty.call(obj, key)) {
				if (key === "__proto__") Object.defineProperty(obj, key, {
					value: make(),
					writable: true,
					enumerable: true,
					configurable: true
				});
				else obj[key] = make();
			}
			return obj[key];
		}
		function flattenError(error, mapper = (issue) => issue.message) {
			const fieldErrors = {};
			const formErrors = [];
			for (const sub of error.issues) if (sub.path.length > 0) node(fieldErrors, sub.path[0], () => []).push(mapper(sub));
			else formErrors.push(mapper(sub));
			return {
				formErrors,
				fieldErrors
			};
		}
		function formatError(error, mapper = (issue) => issue.message) {
			const fieldErrors = { _errors: [] };
			const processError = (error, path = []) => {
				for (const issue of error.issues) if (issue.code === "invalid_union" && issue.errors.length) issue.errors.map((issues) => processError({ issues }, [...path, ...issue.path]));
				else if (issue.code === "invalid_key") processError({ issues: issue.issues }, [...path, ...issue.path]);
				else if (issue.code === "invalid_element") processError({ issues: issue.issues }, [...path, ...issue.path]);
				else {
					const fullpath = [...path, ...issue.path];
					if (fullpath.length === 0) fieldErrors._errors.push(mapper(issue));
					else {
						let curr = fieldErrors;
						let i = 0;
						while (i < fullpath.length) {
							const el = fullpath[i];
							const terminal = i === fullpath.length - 1;
							if (el === "_errors") {
								if (terminal) curr._errors.push(mapper(issue));
								i++;
								continue;
							}
							if (!Object.prototype.hasOwnProperty.call(curr, el)) Object.defineProperty(curr, el, {
								value: { _errors: [] },
								enumerable: true,
								writable: true,
								configurable: true
							});
							const node = curr[el];
							if (terminal) node._errors.push(mapper(issue));
							curr = node;
							i++;
						}
					}
				}
			};
			processError(error);
			return fieldErrors;
		}
		//#endregion
		//#region node_modules/zod/v4/core/parse.js
		function finalizeParams(callee, params) {
			return {
				callee: params?.callee ?? callee,
				Err: params?.Err
			};
		}
		const _parse = (_Err) => {
			const fn = (schema, value, _ctx, _params) => {
				const ctx = _ctx ? {
					..._ctx,
					async: false
				} : { async: false };
				const result = schema._zod.run({
					value,
					issues: []
				}, ctx);
				if (result instanceof Promise) throw new $ZodAsyncError();
				if (result.issues.length) {
					const e = new ((_params?.Err) ?? _Err)(result.issues.map((iss) => finalizeIssue(iss, ctx, config())));
					captureStackTrace(e, _params?.callee ?? fn);
					throw e;
				}
				return result.value;
			};
			return fn;
		};
		const _parseAsync = (_Err) => {
			const fn = async (schema, value, _ctx, params) => {
				const ctx = _ctx ? {
					..._ctx,
					async: true
				} : { async: true };
				let result = schema._zod.run({
					value,
					issues: []
				}, ctx);
				if (result instanceof Promise) result = await result;
				if (result.issues.length) {
					const e = new ((params?.Err) ?? _Err)(result.issues.map((iss) => finalizeIssue(iss, ctx, config())));
					captureStackTrace(e, params?.callee ?? fn);
					throw e;
				}
				return result.value;
			};
			return fn;
		};
		const _safeParse = (_Err) => (schema, value, _ctx) => {
			const ctx = _ctx ? {
				..._ctx,
				async: false
			} : { async: false };
			const result = schema._zod.run({
				value,
				issues: []
			}, ctx);
			if (result instanceof Promise) throw new $ZodAsyncError();
			return result.issues.length ? {
				success: false,
				error: new (_Err ?? $ZodError)(result.issues.map((iss) => finalizeIssue(iss, ctx, config())))
			} : {
				success: true,
				data: result.value
			};
		};
		const safeParse$1 = /* @__PURE__*/ _safeParse($ZodRealError);
		const _safeParseAsync = (_Err) => async (schema, value, _ctx) => {
			const ctx = _ctx ? {
				..._ctx,
				async: true
			} : { async: true };
			let result = schema._zod.run({
				value,
				issues: []
			}, ctx);
			if (result instanceof Promise) result = await result;
			return result.issues.length ? {
				success: false,
				error: new _Err(result.issues.map((iss) => finalizeIssue(iss, ctx, config())))
			} : {
				success: true,
				data: result.value
			};
		};
		const safeParseAsync$1 = /* @__PURE__*/ _safeParseAsync($ZodRealError);
		const _encode = (_Err) => {
			const parse = _parse(_Err);
			const fn = (schema, value, _ctx, _params) => {
				const ctx = _ctx ? {
					..._ctx,
					direction: "backward"
				} : { direction: "backward" };
				return parse(schema, value, ctx, finalizeParams(fn, _params));
			};
			return fn;
		};
		const _decode = (_Err) => {
			const parse = _parse(_Err);
			const fn = (schema, value, _ctx, _params) => {
				return parse(schema, value, _ctx, finalizeParams(fn, _params));
			};
			return fn;
		};
		const _encodeAsync = (_Err) => {
			const parseAsync = _parseAsync(_Err);
			const fn = async (schema, value, _ctx, _params) => {
				const ctx = _ctx ? {
					..._ctx,
					direction: "backward"
				} : { direction: "backward" };
				return await parseAsync(schema, value, ctx, finalizeParams(fn, _params));
			};
			return fn;
		};
		const _decodeAsync = (_Err) => {
			const parseAsync = _parseAsync(_Err);
			const fn = async (schema, value, _ctx, _params) => {
				return await parseAsync(schema, value, _ctx, finalizeParams(fn, _params));
			};
			return fn;
		};
		const _safeEncode = (_Err) => (schema, value, _ctx) => {
			const ctx = _ctx ? {
				..._ctx,
				direction: "backward"
			} : { direction: "backward" };
			return _safeParse(_Err)(schema, value, ctx);
		};
		const _safeDecode = (_Err) => (schema, value, _ctx) => {
			return _safeParse(_Err)(schema, value, _ctx);
		};
		const _safeEncodeAsync = (_Err) => async (schema, value, _ctx) => {
			const ctx = _ctx ? {
				..._ctx,
				direction: "backward"
			} : { direction: "backward" };
			return _safeParseAsync(_Err)(schema, value, ctx);
		};
		const _safeDecodeAsync = (_Err) => async (schema, value, _ctx) => {
			return _safeParseAsync(_Err)(schema, value, _ctx);
		};
		//#endregion
		//#region node_modules/zod/v4/core/regexes.js
		/**
		* @deprecated CUID v1 is deprecated by its authors due to information leakage
		* (timestamps embedded in the id). Use {@link cuid2} instead.
		* See https://github.com/paralleldrive/cuid.
		*/
		const cuid = /^[cC][0-9a-z]{6,}$/;
		const cuid2 = /^[0-9a-z]+$/;
		const ulid = /^[0-7][0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{25}$/;
		const xid = /^[0-9a-vA-V]{20}$/;
		const ksuid = /^[A-Za-z0-9]{27}$/;
		const nanoid = /^[a-zA-Z0-9_-]{21}$/;
		function nanoidOfLength(length) {
			return new RegExp(`^[a-zA-Z0-9_-]{${length}}$`);
		}
		/** ISO 8601-1 duration regex. Does not support the 8601-2 extensions like negative durations or fractional/negative components. */
		const duration = /^P(?:(\d+W)|(?!.*W)(?=\d|T\d)(\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+([.,]\d+)?S)?)?)$/;
		/** A regex for any UUID-like identifier: 8-4-4-4-12 hex pattern */
		const guid = /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/;
		/** Returns a regex for validating an RFC 9562/4122 UUID.
		*
		* @param version Optionally specify a version 1-8. If no version is specified, all versions are supported. */
		const uuid = (version) => {
			if (!version) return /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/;
			return new RegExp(`^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-${version}[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})$`);
		};
		/** Practical email validation */
		const email = /^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/;
		const _emoji$1 = `^[\\p{Extended_Pictographic}\\p{Emoji_Component}]+$`;
		function emoji() {
			return new RegExp(_emoji$1, "u");
		}
		const ipv4 = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/;
		const ipv6 = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))$/;
		const cidrv4 = /^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/([0-9]|[1-2][0-9]|3[0-2])$/;
		const cidrv6 = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/;
		const base64 = /^$|^(?:[0-9a-zA-Z+/]{4})*(?:(?:[0-9a-zA-Z+/]{2}==)|(?:[0-9a-zA-Z+/]{3}=))?$/;
		const base64url = /^[A-Za-z0-9_-]*$/;
		const httpProtocol = /^https?$/;
		const e164 = /^\+[1-9]\d{6,14}$/;
		const dateSource = `(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))`;
		/** Anchors a pattern source. The interpolation lives here rather than at the call site because
		* esbuild will not drop a `@__PURE__` call whose own argument interpolates a variable, but it
		* will drop `anchor(dateSource)`. Keeping it inline pinned `date` into every bundle. */
		function anchor(source) {
			return new RegExp(`^${source}$`);
		}
		const date = /*@__PURE__*/ anchor(dateSource);
		function timeSource(args) {
			const hhmm = `(?:[01]\\d|2[0-3]):[0-5]\\d`;
			return typeof args.precision === "number" ? args.precision === -1 ? `${hhmm}` : args.precision === 0 ? `${hhmm}:[0-5]\\d` : `${hhmm}:[0-5]\\d\\.\\d{${args.precision}}` : args.seconds ? `${hhmm}:[0-5]\\d(?:\\.\\d+)?` : `${hhmm}(?::[0-5]\\d(?:\\.\\d+)?)?`;
		}
		function time(args) {
			return new RegExp(`^${timeSource(args)}$`);
		}
		function datetime(args) {
			const opts = ["Z"];
			if (args.offset) opts.push(`([+-](?:[01]\\d|2[0-3]):[0-5]\\d)`);
			const qualified = `${timeSource({
				precision: args.precision,
				seconds: true
			})}(?:${opts.join("|")})`;
			const timeRegex = args.local ? `${qualified}|${timeSource({ precision: args.precision })}` : qualified;
			return new RegExp(`^${dateSource}T(?:${timeRegex})$`);
		}
		const string$1 = (params) => {
			const regex = params ? `[\\s\\S]{${params?.minimum ?? 0},${params?.maximum ?? ""}}` : `[\\s\\S]*`;
			return new RegExp(`^${regex}$`);
		};
		const boolean$1 = /^(?:true|false)$/i;
		const lowercase = /^[^A-Z]*$/;
		const uppercase = /^[^a-z]*$/;
		//#endregion
		//#region node_modules/zod/v4/core/checks.js
		const $ZodCheck = /*@__PURE__*/ $constructor("$ZodCheck", (inst, def) => {
			var _a;
			inst._zod ?? (inst._zod = {});
			inst._zod.def = def;
			(_a = inst._zod).onattach ?? (_a.onattach = []);
		});
		/** Default `when` for length-based checks: run only on non-nullish values with a `length`. */
		const _whenHasLength = (payload) => {
			const val = payload.value;
			return !nullish(val) && val.length !== void 0;
		};
		const $ZodCheckMaxLength = /*@__PURE__*/ $constructor("$ZodCheckMaxLength", (inst, def) => {
			var _a;
			$ZodCheck.init(inst, def);
			(_a = inst._zod.def).when ?? (_a.when = _whenHasLength);
			inst._zod.onattach.push((inst) => {
				const curr = inst._zod.bag.maximum ?? Number.POSITIVE_INFINITY;
				if (def.maximum < curr) inst._zod.bag.maximum = def.maximum;
			});
			inst._zod.check = (payload) => {
				const input = payload.value;
				const units = input.length;
				if ((typeof input === "string" && units > def.maximum ? codePointLength(input) : units) <= def.maximum) return;
				const origin = getLengthableOrigin(input);
				payload.issues.push({
					origin,
					code: "too_big",
					maximum: def.maximum,
					inclusive: true,
					input,
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodCheckMinLength = /*@__PURE__*/ $constructor("$ZodCheckMinLength", (inst, def) => {
			var _a;
			$ZodCheck.init(inst, def);
			(_a = inst._zod.def).when ?? (_a.when = _whenHasLength);
			inst._zod.onattach.push((inst) => {
				const curr = inst._zod.bag.minimum ?? Number.NEGATIVE_INFINITY;
				if (def.minimum > curr) inst._zod.bag.minimum = def.minimum;
			});
			inst._zod.check = (payload) => {
				const input = payload.value;
				const units = input.length;
				if ((typeof input === "string" && units >= def.minimum && units < def.minimum * 2 ? codePointLength(input) : units) >= def.minimum) return;
				const origin = getLengthableOrigin(input);
				payload.issues.push({
					origin,
					code: "too_small",
					minimum: def.minimum,
					inclusive: true,
					input,
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodCheckLengthEquals = /*@__PURE__*/ $constructor("$ZodCheckLengthEquals", (inst, def) => {
			var _a;
			$ZodCheck.init(inst, def);
			(_a = inst._zod.def).when ?? (_a.when = _whenHasLength);
			inst._zod.onattach.push((inst) => {
				const bag = inst._zod.bag;
				bag.minimum = def.length;
				bag.maximum = def.length;
				bag.length = def.length;
			});
			inst._zod.check = (payload) => {
				const input = payload.value;
				const units = input.length;
				const length = typeof input === "string" && units >= def.length && units <= def.length * 2 ? codePointLength(input) : units;
				if (length === def.length) return;
				const origin = getLengthableOrigin(input);
				const tooBig = length > def.length;
				payload.issues.push({
					origin,
					...tooBig ? {
						code: "too_big",
						maximum: def.length
					} : {
						code: "too_small",
						minimum: def.length
					},
					inclusive: true,
					exact: true,
					input: payload.value,
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodCheckStringFormat = /*@__PURE__*/ $constructor("$ZodCheckStringFormat", (inst, def) => {
			var _a, _b;
			$ZodCheck.init(inst, def);
			inst._zod.onattach.push((inst) => {
				const bag = inst._zod.bag;
				bag.format = def.format;
				if (def.pattern) {
					bag.patterns ?? (bag.patterns = /* @__PURE__ */ new Set());
					bag.patterns.add(def.pattern);
				}
			});
			if (def.pattern) (_a = inst._zod).check ?? (_a.check = (payload) => {
				def.pattern.lastIndex = 0;
				if (def.pattern.test(payload.value)) return;
				payload.issues.push({
					origin: "string",
					code: "invalid_format",
					format: def.format,
					input: payload.value,
					...def.pattern ? { pattern: def.pattern.toString() } : {},
					inst,
					continue: !def.abort
				});
			});
			else (_b = inst._zod).check ?? (_b.check = () => {});
		});
		const $ZodCheckRegex = /*@__PURE__*/ $constructor("$ZodCheckRegex", (inst, def) => {
			$ZodCheckStringFormat.init(inst, def);
			inst._zod.check = (payload) => {
				def.pattern.lastIndex = 0;
				if (def.pattern.test(payload.value)) return;
				payload.issues.push({
					origin: "string",
					code: "invalid_format",
					format: "regex",
					input: payload.value,
					pattern: def.pattern.toString(),
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodCheckLowerCase = /*@__PURE__*/ $constructor("$ZodCheckLowerCase", (inst, def) => {
			def.pattern ?? (def.pattern = lowercase);
			$ZodCheckStringFormat.init(inst, def);
		});
		const $ZodCheckUpperCase = /*@__PURE__*/ $constructor("$ZodCheckUpperCase", (inst, def) => {
			def.pattern ?? (def.pattern = uppercase);
			$ZodCheckStringFormat.init(inst, def);
		});
		const $ZodCheckIncludes = /*@__PURE__*/ $constructor("$ZodCheckIncludes", (inst, def) => {
			$ZodCheck.init(inst, def);
			const escapedRegex = escapeRegex(def.includes);
			const pattern = new RegExp(typeof def.position === "number" ? `^.{${def.position},}${escapedRegex}` : escapedRegex);
			def.pattern = pattern;
			inst._zod.onattach.push((inst) => {
				const bag = inst._zod.bag;
				bag.patterns ?? (bag.patterns = /* @__PURE__ */ new Set());
				bag.patterns.add(pattern);
			});
			inst._zod.check = (payload) => {
				if (payload.value.includes(def.includes, def.position)) return;
				payload.issues.push({
					origin: "string",
					code: "invalid_format",
					format: "includes",
					includes: def.includes,
					input: payload.value,
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodCheckStartsWith = /*@__PURE__*/ $constructor("$ZodCheckStartsWith", (inst, def) => {
			$ZodCheck.init(inst, def);
			const pattern = new RegExp(`^${escapeRegex(def.prefix)}.*`);
			def.pattern ?? (def.pattern = pattern);
			inst._zod.onattach.push((inst) => {
				const bag = inst._zod.bag;
				bag.patterns ?? (bag.patterns = /* @__PURE__ */ new Set());
				bag.patterns.add(pattern);
			});
			inst._zod.check = (payload) => {
				if (payload.value.startsWith(def.prefix)) return;
				payload.issues.push({
					origin: "string",
					code: "invalid_format",
					format: "starts_with",
					prefix: def.prefix,
					input: payload.value,
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodCheckEndsWith = /*@__PURE__*/ $constructor("$ZodCheckEndsWith", (inst, def) => {
			$ZodCheck.init(inst, def);
			const pattern = new RegExp(`.*${escapeRegex(def.suffix)}$`);
			def.pattern ?? (def.pattern = pattern);
			inst._zod.onattach.push((inst) => {
				const bag = inst._zod.bag;
				bag.patterns ?? (bag.patterns = /* @__PURE__ */ new Set());
				bag.patterns.add(pattern);
			});
			inst._zod.check = (payload) => {
				if (payload.value.endsWith(def.suffix)) return;
				payload.issues.push({
					origin: "string",
					code: "invalid_format",
					format: "ends_with",
					suffix: def.suffix,
					input: payload.value,
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodCheckOverwrite = /*@__PURE__*/ $constructor("$ZodCheckOverwrite", (inst, def) => {
			$ZodCheck.init(inst, def);
			inst._zod.check = (payload) => {
				payload.value = def.tx(payload.value);
			};
		});
		//#endregion
		//#region node_modules/zod/v4/core/versions.js
		const version$1 = {
			major: 4,
			minor: 5,
			patch: 4
		};
		//#endregion
		//#region node_modules/zod/v4/core/schemas.js
		const $ZodType = /*@__PURE__*/ $constructor("$ZodType", (inst, def) => {
			var _a;
			inst ?? (inst = {});
			inst._zod.def = def;
			inst._zod.bag = inst._zod.bag || {};
			inst._zod.version = version$1;
			const defChecks = inst._zod.def.checks;
			const checks = inst._zod.traits.has("$ZodCheck") ? [inst, ...defChecks ?? []] : defChecks?.length ? [...defChecks] : [];
			for (const ch of checks) for (const fn of ch._zod.onattach) fn(inst);
			if (checks.length === 0) {
				(_a = inst._zod).deferred ?? (_a.deferred = []);
				inst._zod.deferred?.push(() => {
					inst._zod.run = inst._zod.parse;
				});
			} else {
				const runChecks = (payload, checks, ctx) => {
					if (payload.memo) return payload;
					let isAborted = aborted(payload);
					let asyncResult;
					for (const ch of checks) {
						if (ch._zod.def.when) {
							if (explicitlyAborted(payload)) continue;
							if (!ch._zod.def.when(payload)) continue;
						} else if (isAborted) continue;
						const currLen = payload.issues.length;
						const _ = ch._zod.check(payload);
						if (_ instanceof Promise && ctx?.async === false) throw new $ZodAsyncError();
						if (asyncResult || _ instanceof Promise) asyncResult = (asyncResult ?? Promise.resolve()).then(async () => {
							await _;
							if (payload.issues.length === currLen) return;
							attachSchema(payload.issues, currLen, inst);
							if (!isAborted) isAborted = aborted(payload, currLen);
						});
						else {
							if (payload.issues.length === currLen) continue;
							attachSchema(payload.issues, currLen, inst);
							if (!isAborted) isAborted = aborted(payload, currLen);
						}
					}
					if (asyncResult) return asyncResult.then(() => {
						return payload;
					});
					return payload;
				};
				const handleCanaryResult = (canary, payload, ctx) => {
					if (aborted(canary)) {
						canary.aborted = true;
						return canary;
					}
					const checkResult = runChecks(payload, checks, ctx);
					if (checkResult instanceof Promise) {
						if (ctx.async === false) throw new $ZodAsyncError();
						return checkResult.then((checkResult) => inst._zod.parse(checkResult, ctx));
					}
					return inst._zod.parse(checkResult, ctx);
				};
				inst._zod.run = (payload, ctx) => {
					if (ctx.skipChecks) return inst._zod.parse(payload, ctx);
					if (ctx.direction === "backward") {
						const canary = inst._zod.parse({
							value: payload.value,
							issues: []
						}, {
							...ctx,
							skipChecks: true
						});
						if (canary instanceof Promise) return canary.then((canary) => {
							return handleCanaryResult(canary, payload, ctx);
						});
						return handleCanaryResult(canary, payload, ctx);
					}
					const result = inst._zod.parse(payload, ctx);
					if (result instanceof Promise) {
						if (ctx.async === false) throw new $ZodAsyncError();
						return result.then((result) => runChecks(result, checks, ctx));
					}
					return runChecks(result, checks, ctx);
				};
			}
		}, {
			get "~standard"() {
				return hide(this, "~standard", standardProps(this));
			},
			set "~standard"(value) {
				own(this, "~standard", value);
			}
		});
		/** The Standard Schema surface for `inst`. Shared so wrappers can extend it without forcing it. */
		const toStandardResult = (r) => r.success ? { value: r.data } : { issues: r.error?.issues };
		function standardProps(inst) {
			return {
				validate: (value) => {
					try {
						return toStandardResult(safeParse$1(inst, value));
					} catch (_) {
						return safeParseAsync$1(inst, value).then(toStandardResult);
					}
				},
				vendor: "zod",
				version: 1
			};
		}
		const $ZodString = /*@__PURE__*/ $constructor("$ZodString", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.pattern = [...inst?._zod.bag?.patterns ?? []].pop() ?? string$1(inst._zod.bag);
			inst._zod.parse = (payload, _) => {
				if (def.coerce) try {
					payload.value = String(payload.value);
				} catch (_) {}
				if (typeof payload.value === "string") return payload;
				payload.issues.push({
					expected: "string",
					code: "invalid_type",
					input: payload.value,
					inst
				});
				return payload;
			};
		});
		const $ZodStringFormat = /*@__PURE__*/ $constructor("$ZodStringFormat", (inst, def) => {
			$ZodCheckStringFormat.init(inst, def);
			$ZodString.init(inst, def);
		});
		const $ZodGUID = /*@__PURE__*/ $constructor("$ZodGUID", (inst, def) => {
			def.pattern ?? (def.pattern = guid);
			$ZodStringFormat.init(inst, def);
		});
		const $ZodUUID = /*@__PURE__*/ $constructor("$ZodUUID", (inst, def) => {
			if (def.version) {
				const v = {
					v1: 1,
					v2: 2,
					v3: 3,
					v4: 4,
					v5: 5,
					v6: 6,
					v7: 7,
					v8: 8
				}[def.version];
				if (v === void 0) throw new Error(`Invalid UUID version: "${def.version}"`);
				def.pattern ?? (def.pattern = uuid(v));
			} else def.pattern ?? (def.pattern = uuid());
			$ZodStringFormat.init(inst, def);
		});
		const $ZodEmail = /*@__PURE__*/ $constructor("$ZodEmail", (inst, def) => {
			def.pattern ?? (def.pattern = email);
			$ZodStringFormat.init(inst, def);
		});
		/** Parses a URL for `$ZodURL`, applying the one guard the URL constructor cannot express. Returns the parsed URL, or a code naming the stage that rejected it — the runtime needs that distinction to pick an issue note, and compiled code only needs to know it is not a URL. */
		function parseURLObject(trimmed, def) {
			if (!def.normalize && def.protocol?.source === httpProtocol.source && !/^https?:\/\//i.test(trimmed)) return 1;
			try {
				return new URL(trimmed);
			} catch {
				return 2;
			}
		}
		const asciiTabOrNewline = /[\t\n\r]/g;
		/** The URL parser deletes every ASCII tab, LF and CR from its input before it parses, so `new URL("https://exa\nmple.com")` reports on `example.com`. Applying the same deletion to the returned value closes the half of that divergence which can move the host; the parser's other rewrite, stripping C0 controls at the edges, cannot. */
		function stripTabAndNewline(value) {
			return value.replace(asciiTabOrNewline, "");
		}
		function urlHostnameOk(url, hostname) {
			hostname.lastIndex = 0;
			return hostname.test(url.hostname);
		}
		function urlProtocolOk(url, protocol) {
			protocol.lastIndex = 0;
			return protocol.test(url.protocol.endsWith(":") ? url.protocol.slice(0, -1) : url.protocol);
		}
		const $ZodURL = /*@__PURE__*/ $constructor("$ZodURL", (inst, def) => {
			$ZodStringFormat.init(inst, def);
			inst._zod.check = (payload) => {
				try {
					const trimmed = payload.value.trim();
					const url = parseURLObject(trimmed, def);
					if (url === 1) {
						payload.issues.push({
							code: "invalid_format",
							format: "url",
							note: "Invalid URL format",
							input: payload.value,
							inst,
							continue: !def.abort
						});
						return;
					}
					if (url === 2) {
						payload.issues.push({
							code: "invalid_format",
							format: "url",
							input: payload.value,
							inst,
							continue: !def.abort
						});
						return;
					}
					if (def.hostname && !urlHostnameOk(url, def.hostname)) payload.issues.push({
						code: "invalid_format",
						format: "url",
						note: "Invalid hostname",
						pattern: def.hostname.source,
						input: payload.value,
						inst,
						continue: !def.abort
					});
					if (def.protocol && !urlProtocolOk(url, def.protocol)) payload.issues.push({
						code: "invalid_format",
						format: "url",
						note: "Invalid protocol",
						pattern: def.protocol.source,
						input: payload.value,
						inst,
						continue: !def.abort
					});
					payload.value = def.normalize ? url.href : stripTabAndNewline(trimmed);
					return;
				} catch (_) {
					payload.issues.push({
						code: "invalid_format",
						format: "url",
						input: payload.value,
						inst,
						continue: !def.abort
					});
				}
			};
		});
		const $ZodEmoji = /*@__PURE__*/ $constructor("$ZodEmoji", (inst, def) => {
			def.pattern ?? (def.pattern = emoji());
			$ZodStringFormat.init(inst, def);
		});
		const $ZodNanoID = /*@__PURE__*/ $constructor("$ZodNanoID", (inst, def) => {
			if (def.length !== void 0 && (!Number.isInteger(def.length) || def.length < 1)) throw new Error(`Invalid nanoid length: ${def.length}`);
			def.pattern ?? (def.pattern = def.length === void 0 ? nanoid : nanoidOfLength(def.length));
			$ZodStringFormat.init(inst, def);
		});
		/**
		* @deprecated CUID v1 is deprecated by its authors due to information leakage
		* (timestamps embedded in the id). Use {@link $ZodCUID2} instead.
		* See https://github.com/paralleldrive/cuid.
		*/
		const $ZodCUID = /*@__PURE__*/ $constructor("$ZodCUID", (inst, def) => {
			def.pattern ?? (def.pattern = cuid);
			$ZodStringFormat.init(inst, def);
		});
		const $ZodCUID2 = /*@__PURE__*/ $constructor("$ZodCUID2", (inst, def) => {
			def.pattern ?? (def.pattern = cuid2);
			$ZodStringFormat.init(inst, def);
		});
		const $ZodULID = /*@__PURE__*/ $constructor("$ZodULID", (inst, def) => {
			def.pattern ?? (def.pattern = ulid);
			$ZodStringFormat.init(inst, def);
		});
		const $ZodXID = /*@__PURE__*/ $constructor("$ZodXID", (inst, def) => {
			def.pattern ?? (def.pattern = xid);
			$ZodStringFormat.init(inst, def);
		});
		const $ZodKSUID = /*@__PURE__*/ $constructor("$ZodKSUID", (inst, def) => {
			def.pattern ?? (def.pattern = ksuid);
			$ZodStringFormat.init(inst, def);
		});
		const $ZodISODateTime = /*@__PURE__*/ $constructor("$ZodISODateTime", (inst, def) => {
			def.pattern ?? (def.pattern = datetime(def));
			$ZodStringFormat.init(inst, def);
			if (def.local || def.precision === -1) {
				inst._zod.bag.laxFormat = true;
				inst._zod.onattach.push((s) => {
					s._zod.bag.laxFormat = true;
				});
			}
		});
		const $ZodISODate = /*@__PURE__*/ $constructor("$ZodISODate", (inst, def) => {
			def.pattern ?? (def.pattern = date);
			$ZodStringFormat.init(inst, def);
		});
		const $ZodISOTime = /*@__PURE__*/ $constructor("$ZodISOTime", (inst, def) => {
			def.pattern ?? (def.pattern = time(def));
			$ZodStringFormat.init(inst, def);
		});
		const $ZodISODuration = /*@__PURE__*/ $constructor("$ZodISODuration", (inst, def) => {
			def.pattern ?? (def.pattern = duration);
			$ZodStringFormat.init(inst, def);
		});
		const $ZodIPv4 = /*@__PURE__*/ $constructor("$ZodIPv4", (inst, def) => {
			def.pattern ?? (def.pattern = ipv4);
			$ZodStringFormat.init(inst, def);
			inst._zod.bag.format = `ipv4`;
		});
		/** An IPv6 address is written with hex digits, colons and dots, and nothing else. The guard is what makes the check below an IPv6 check: `new URL("http://[...]")` parses an authority, not an address, so `@` and `\` re-delimit it and `"::@1\\"` validates against the host `0.0.0.1`. The URL parser also deletes ASCII tab, LF and CR rather than failing, which is how `"::1\n"` validated as `::1`. */
		const ipv6Alphabet = /^[0-9a-fA-F:.]+$/;
		function isValidIPv6(value) {
			if (!ipv6Alphabet.test(value)) return false;
			try {
				new URL(`http://[${value}]`);
				return true;
			} catch {
				return false;
			}
		}
		const $ZodIPv6 = /*@__PURE__*/ $constructor("$ZodIPv6", (inst, def) => {
			def.pattern ?? (def.pattern = ipv6);
			$ZodStringFormat.init(inst, def);
			inst._zod.bag.format = `ipv6`;
			inst._zod.check = (payload) => {
				if (!isValidIPv6(payload.value)) payload.issues.push({
					code: "invalid_format",
					format: "ipv6",
					input: payload.value,
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodCIDRv4 = /*@__PURE__*/ $constructor("$ZodCIDRv4", (inst, def) => {
			def.pattern ?? (def.pattern = cidrv4);
			$ZodStringFormat.init(inst, def);
		});
		function isValidCIDRv6(value) {
			const parts = value.split("/");
			if (parts.length !== 2) return false;
			const [address, prefix] = parts;
			if (!prefix) return false;
			const prefixNum = Number(prefix);
			if (`${prefixNum}` !== prefix) return false;
			if (prefixNum < 0 || prefixNum > 128) return false;
			return isValidIPv6(address);
		}
		const $ZodCIDRv6 = /*@__PURE__*/ $constructor("$ZodCIDRv6", (inst, def) => {
			def.pattern ?? (def.pattern = cidrv6);
			$ZodStringFormat.init(inst, def);
			inst._zod.check = (payload) => {
				if (!isValidCIDRv6(payload.value)) payload.issues.push({
					code: "invalid_format",
					format: "cidrv6",
					input: payload.value,
					inst,
					continue: !def.abort
				});
			};
		});
		function isValidBase64(data) {
			if (data === "") return true;
			if (/\s/.test(data)) return false;
			if (data.length % 4 !== 0) return false;
			try {
				atob(data);
				return true;
			} catch {
				return false;
			}
		}
		const $ZodBase64 = /*@__PURE__*/ $constructor("$ZodBase64", (inst, def) => {
			def.pattern ?? (def.pattern = base64);
			$ZodStringFormat.init(inst, def);
			inst._zod.bag.contentEncoding = "base64";
			inst._zod.check = (payload) => {
				if (isValidBase64(payload.value)) return;
				payload.issues.push({
					code: "invalid_format",
					format: "base64",
					input: payload.value,
					inst,
					continue: !def.abort
				});
			};
		});
		function isValidBase64URL(data) {
			if (!base64url.test(data)) return false;
			const base64 = data.replace(/[-_]/g, (c) => c === "-" ? "+" : "/");
			return isValidBase64(base64.padEnd(Math.ceil(base64.length / 4) * 4, "="));
		}
		const $ZodBase64URL = /*@__PURE__*/ $constructor("$ZodBase64URL", (inst, def) => {
			def.pattern ?? (def.pattern = base64url);
			$ZodStringFormat.init(inst, def);
			inst._zod.bag.contentEncoding = "base64url";
			inst._zod.check = (payload) => {
				if (isValidBase64URL(payload.value)) return;
				payload.issues.push({
					code: "invalid_format",
					format: "base64url",
					input: payload.value,
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodE164 = /*@__PURE__*/ $constructor("$ZodE164", (inst, def) => {
			def.pattern ?? (def.pattern = e164);
			$ZodStringFormat.init(inst, def);
		});
		function isValidJWT(token, algorithm = null) {
			try {
				const tokensParts = token.split(".");
				if (tokensParts.length !== 3) return false;
				const [header] = tokensParts;
				if (!header) return false;
				const parsedHeader = JSON.parse(atob(header));
				if ("typ" in parsedHeader && parsedHeader?.typ !== "JWT") return false;
				if (!parsedHeader.alg) return false;
				if (algorithm && (!("alg" in parsedHeader) || parsedHeader.alg !== algorithm)) return false;
				return true;
			} catch {
				return false;
			}
		}
		const $ZodJWT = /*@__PURE__*/ $constructor("$ZodJWT", (inst, def) => {
			$ZodStringFormat.init(inst, def);
			inst._zod.check = (payload) => {
				if (isValidJWT(payload.value, def.alg)) return;
				payload.issues.push({
					code: "invalid_format",
					format: "jwt",
					input: payload.value,
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodBoolean = /*@__PURE__*/ $constructor("$ZodBoolean", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.pattern = boolean$1;
			inst._zod.parse = (payload, _ctx) => {
				if (def.coerce) try {
					payload.value = Boolean(payload.value);
				} catch (_) {}
				const input = payload.value;
				if (typeof input === "boolean") return payload;
				payload.issues.push({
					expected: "boolean",
					code: "invalid_type",
					input,
					inst
				});
				return payload;
			};
		});
		const $ZodUnknown = /*@__PURE__*/ $constructor("$ZodUnknown", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.parse = (payload) => payload;
		});
		function handleArrayResult(result, final, index) {
			if (result.issues.length) final.issues.push(...prefixIssues(index, result.issues));
			final.value[index] = result.value;
		}
		const $ZodArray = /*@__PURE__*/ $constructor("$ZodArray", (inst, def) => {
			$ZodType.init(inst, def);
			const memo = globalConfig.memoizer;
			memo?.attach(inst);
			inst._zod.parse = (payload, ctx) => {
				const input = payload.value;
				if (!Array.isArray(input)) {
					payload.issues.push({
						expected: "array",
						code: "invalid_type",
						input,
						inst
					});
					return payload;
				}
				payload.value = memo ? memo.alloc(inst, payload, Array(input.length), ctx) : Array(input.length);
				const proms = [];
				for (let i = 0; i < input.length; i++) {
					const item = input[i];
					const result = def.element._zod.run({
						value: item,
						issues: []
					}, ctx);
					if (result instanceof Promise) proms.push(result.then((result) => handleArrayResult(result, payload, i)));
					else handleArrayResult(result, payload, i);
				}
				if (proms.length) return Promise.all(proms).then(() => payload);
				return payload;
			};
		});
		function handleUnionResults(results, final, inst, ctx) {
			for (const result of results) if (result.issues.length === 0) {
				final.value = result.value;
				return final;
			}
			const nonaborted = results.filter((r) => !aborted(r));
			if (nonaborted.length === 1) {
				final.value = nonaborted[0].value;
				return nonaborted[0];
			}
			final.issues.push({
				code: "invalid_union",
				input: final.value,
				inst,
				errors: results.map((result) => result.issues.map((iss) => finalizeIssue(iss, ctx, config())))
			});
			return final;
		}
		const $ZodUnion = /*@__PURE__*/ $constructor("$ZodUnion", (inst, def) => {
			$ZodType.init(inst, def);
			defineLazyInternal(inst, "optin", (zod) => zod.def.options.some((o) => o._zod.optin === "defaulted") ? "defaulted" : zod.def.options.some((o) => o._zod.optin !== void 0) ? "optional" : void 0);
			defineLazyInternal(inst, "optout", (zod) => zod.def.options.some((o) => o._zod.optout === "optional") ? "optional" : void 0);
			defineLazyInternal(inst, "values", (zod) => {
				if (zod.def.options.every((o) => o._zod.values)) return new Set(zod.def.options.flatMap((option) => Array.from(option._zod.values)));
			});
			defineLazyInternal(inst, "pattern", (zod) => {
				if (zod.def.options.every((o) => o._zod.pattern)) {
					const patterns = zod.def.options.map((o) => o._zod.pattern);
					return new RegExp(`^(${patterns.map((p) => cleanRegex(p.source)).join("|")})$`);
				}
			});
			const first = def.options.length === 1 ? def.options[0]._zod.run : null;
			inst._zod.parse = (payload, ctx) => {
				if (first) return first(payload, ctx);
				let async = false;
				const results = [];
				for (const option of def.options) {
					const result = option._zod.run({
						value: payload.value,
						issues: []
					}, ctx);
					if (result instanceof Promise) {
						results.push(result);
						async = true;
					} else {
						if (result.issues.length === 0) return result;
						results.push(result);
					}
				}
				if (!async) return handleUnionResults(results, payload, inst, ctx);
				return Promise.all(results).then((results) => {
					return handleUnionResults(results, payload, inst, ctx);
				});
			};
		});
		const $ZodIntersection = /*@__PURE__*/ $constructor("$ZodIntersection", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.parse = (payload, ctx) => {
				const input = payload.value;
				const left = def.left._zod.run({
					value: input,
					issues: []
				}, ctx);
				const right = def.right._zod.run({
					value: input,
					issues: []
				}, ctx);
				if (left instanceof Promise || right instanceof Promise) return Promise.all([left, right]).then(([left, right]) => {
					return handleIntersectionResults(payload, left, right);
				});
				return handleIntersectionResults(payload, left, right);
			};
		});
		function mergeValues(a, b) {
			if (a === b) return {
				valid: true,
				data: a
			};
			if (a instanceof Date && b instanceof Date && +a === +b) return {
				valid: true,
				data: a
			};
			if (isPlainObject(a) && isPlainObject(b)) {
				const bKeys = Object.keys(b);
				const sharedKeys = Object.keys(a).filter((key) => bKeys.indexOf(key) !== -1);
				const newObj = {
					...a,
					...b
				};
				if (Object.prototype.hasOwnProperty.call(newObj, "__proto__")) delete newObj.__proto__;
				for (const key of sharedKeys) {
					if (key === "__proto__") continue;
					const sharedValue = mergeValues(a[key], b[key]);
					if (!sharedValue.valid) return {
						valid: false,
						mergeErrorPath: [key, ...sharedValue.mergeErrorPath]
					};
					newObj[key] = sharedValue.data;
				}
				return {
					valid: true,
					data: newObj
				};
			}
			if (Array.isArray(a) && Array.isArray(b)) {
				if (a.length !== b.length) return {
					valid: false,
					mergeErrorPath: []
				};
				const newArray = [];
				for (let index = 0; index < a.length; index++) {
					const itemA = a[index];
					const itemB = b[index];
					const sharedValue = mergeValues(itemA, itemB);
					if (!sharedValue.valid) return {
						valid: false,
						mergeErrorPath: [index, ...sharedValue.mergeErrorPath]
					};
					newArray.push(sharedValue.data);
				}
				return {
					valid: true,
					data: newArray
				};
			}
			return {
				valid: false,
				mergeErrorPath: []
			};
		}
		function handleIntersectionResults(result, left, right) {
			const unrecKeys = /* @__PURE__ */ new Map();
			let unrecIssue;
			const keyIssues = /* @__PURE__ */ new Map();
			const collect = (iss, side) => {
				let keys;
				if (iss.code === "unrecognized_keys" && !iss.path?.length) {
					unrecIssue ?? (unrecIssue = iss);
					keys = iss.keys;
				} else if (iss.code === "invalid_key" && iss.origin === "record" && iss.path?.length === 1) {
					const k = String(iss.path[0]);
					if (!keyIssues.has(k)) keyIssues.set(k, iss);
					keys = [k];
				} else return false;
				for (const k of keys) {
					if (!unrecKeys.has(k)) unrecKeys.set(k, {});
					unrecKeys.get(k)[side] = true;
				}
				return true;
			};
			for (const iss of left.issues) if (!collect(iss, "l")) result.issues.push(iss);
			for (const iss of right.issues) if (!collect(iss, "r")) result.issues.push(iss);
			const bothKeys = [...unrecKeys].filter(([, f]) => f.l && f.r).map(([k]) => k);
			if (bothKeys.length) {
				const aggregated = unrecIssue ? bothKeys.filter((k) => unrecIssue.keys.includes(k)) : [];
				if (aggregated.length) result.issues.push({
					...unrecIssue,
					keys: aggregated
				});
				for (const k of bothKeys) if (!aggregated.includes(k) && keyIssues.has(k)) result.issues.push(keyIssues.get(k));
			}
			const merged = mergeValues(left.value, right.value);
			if (!merged.valid) {
				if (aborted(result)) return result;
				throw new Error(`Unmergable intersection. Error path: ${JSON.stringify(merged.mergeErrorPath)}`);
			}
			result.value = merged.data;
			return result;
		}
		const $ZodTransform = /*@__PURE__*/ $constructor("$ZodTransform", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.optin = "optional";
			globalConfig.memoizer?.guard(inst);
			inst._zod.parse = (payload, ctx) => {
				if (ctx.direction === "backward") throw new $ZodEncodeError(inst.constructor.name);
				const _out = def.transform(payload.value, payload);
				if (ctx.async) return (_out instanceof Promise ? _out : Promise.resolve(_out)).then((output) => {
					payload.value = output;
					return payload;
				});
				if (_out instanceof Promise) throw new $ZodAsyncError();
				payload.value = _out;
				return payload;
			};
		});
		function handleOptionalResult(payload, result) {
			payload.value = result.issues.length ? void 0 : result.value;
			return payload;
		}
		const $ZodOptional = /*@__PURE__*/ $constructor("$ZodOptional", (inst, def) => {
			$ZodType.init(inst, def);
			defineLazyInternal(inst, "optin", (zod) => zod.def.innerType._zod.optin === "defaulted" ? "defaulted" : "optional");
			inst._zod.optout = "optional";
			defineLazyInternal(inst, "values", (zod) => {
				const values = zod.def.innerType._zod.values;
				return values ? /* @__PURE__ */ new Set([...values, void 0]) : void 0;
			});
			defineLazyInternal(inst, "pattern", (zod) => {
				const pattern = zod.def.innerType._zod.pattern;
				return pattern ? new RegExp(`^(${cleanRegex(pattern.source)})?$`) : void 0;
			});
			inst._zod.parse = (payload, ctx) => {
				if (payload.value === void 0) {
					if (def.innerType._zod.optin !== "defaulted") return payload;
					const result = def.innerType._zod.run({
						value: payload.value,
						issues: []
					}, ctx);
					if (result instanceof Promise) return result.then((result) => handleOptionalResult(payload, result));
					return handleOptionalResult(payload, result);
				}
				return def.innerType._zod.run(payload, ctx);
			};
		});
		const $ZodExactOptional = /*@__PURE__*/ $constructor("$ZodExactOptional", (inst, def) => {
			$ZodOptional.init(inst, def);
			defineLazyInternal(inst, "values", (zod) => zod.def.innerType._zod.values);
			defineLazyInternal(inst, "pattern", (zod) => zod.def.innerType._zod.pattern);
			inst._zod.parse = (payload, ctx) => {
				return def.innerType._zod.run(payload, ctx);
			};
		});
		const $ZodNullable = /*@__PURE__*/ $constructor("$ZodNullable", (inst, def) => {
			$ZodType.init(inst, def);
			defineLazyInternal(inst, "optin", (zod) => zod.def.innerType._zod.optin);
			defineLazyInternal(inst, "optout", (zod) => zod.def.innerType._zod.optout);
			defineLazyInternal(inst, "pattern", (zod) => {
				const pattern = zod.def.innerType._zod.pattern;
				return pattern ? new RegExp(`^(${cleanRegex(pattern.source)}|null)$`) : void 0;
			});
			defineLazyInternal(inst, "values", (zod) => {
				return zod.def.innerType._zod.values ? /* @__PURE__ */ new Set([...zod.def.innerType._zod.values, null]) : void 0;
			});
			inst._zod.parse = (payload, ctx) => {
				if (payload.value === null) return payload;
				return def.innerType._zod.run(payload, ctx);
			};
		});
		const $ZodDefault = /*@__PURE__*/ $constructor("$ZodDefault", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.optin = "defaulted";
			defineLazyInternal(inst, "values", (zod) => zod.def.innerType._zod.values);
			inst._zod.parse = (payload, ctx) => {
				if (ctx.direction === "backward") return def.innerType._zod.run(payload, ctx);
				if (payload.value === void 0) {
					payload.value = def.defaultValue;
					/**
					* $ZodDefault returns the default value immediately in forward direction.
					* It doesn't pass the default value into the validator ("prefault"). There's no reason to pass the default value through validation. The validity of the default is enforced by TypeScript statically. Otherwise, it's the responsibility of the user to ensure the default is valid. In the case of pipes with divergent in/out types, you can specify the default on the `in` schema of your ZodPipe to set a "prefault" for the pipe.   */
					return payload;
				}
				const result = def.innerType._zod.run(payload, ctx);
				if (result instanceof Promise) return result.then((result) => handleDefaultResult(result, def));
				return handleDefaultResult(result, def);
			};
		});
		function handleDefaultResult(payload, def) {
			if (payload.value === void 0) payload.value = def.defaultValue;
			return payload;
		}
		const $ZodPrefault = /*@__PURE__*/ $constructor("$ZodPrefault", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.optin = "defaulted";
			defineLazyInternal(inst, "values", (zod) => zod.def.innerType._zod.values);
			inst._zod.parse = (payload, ctx) => {
				if (ctx.direction === "backward") return def.innerType._zod.run(payload, ctx);
				if (payload.value === void 0) payload.value = def.defaultValue;
				return def.innerType._zod.run(payload, ctx);
			};
		});
		const $ZodNonOptional = /*@__PURE__*/ $constructor("$ZodNonOptional", (inst, def) => {
			$ZodType.init(inst, def);
			defineLazyInternal(inst, "values", (zod) => {
				const v = zod.def.innerType._zod.values;
				return v ? new Set([...v].filter((x) => x !== void 0)) : void 0;
			});
			inst._zod.parse = (payload, ctx) => {
				const result = def.innerType._zod.run(payload, ctx);
				if (result instanceof Promise) return result.then((result) => handleNonOptionalResult(result, inst));
				return handleNonOptionalResult(result, inst);
			};
		});
		function handleNonOptionalResult(payload, inst) {
			if (!payload.issues.length && payload.value === void 0) payload.issues.push({
				code: "invalid_type",
				expected: "nonoptional",
				input: payload.value,
				inst
			});
			return payload;
		}
		function handleCatchResult(payload, result, def, ctx) {
			if (!result.issues.length) {
				payload.value = result.value;
				if (result.memo) payload.memo = true;
				return payload;
			}
			payload.value = def.catchValue({
				...result,
				value: payload.value,
				error: { issues: result.issues.map((iss) => finalizeIssue(iss, ctx, config())) },
				input: payload.value
			});
			return payload;
		}
		const $ZodCatch = /*@__PURE__*/ $constructor("$ZodCatch", (inst, def) => {
			$ZodType.init(inst, def);
			defineLazyInternal(inst, "optin", (zod) => zod.def.innerType._zod.optin === "defaulted" ? "defaulted" : "optional");
			defineLazyInternal(inst, "optout", (zod) => zod.def.innerType._zod.optout);
			defineLazyInternal(inst, "values", (zod) => zod.def.innerType._zod.values);
			inst._zod.parse = (payload, ctx) => {
				if (ctx.direction === "backward") return def.innerType._zod.run(payload, ctx);
				const result = def.innerType._zod.run({
					value: payload.value,
					issues: []
				}, ctx);
				if (result instanceof Promise) return result.then((result) => handleCatchResult(payload, result, def, ctx));
				return handleCatchResult(payload, result, def, ctx);
			};
		});
		const $ZodPipe = /*@__PURE__*/ $constructor("$ZodPipe", (inst, def) => {
			$ZodType.init(inst, def);
			defineLazyInternal(inst, "values", (zod) => zod.def.in._zod.values);
			defineLazyInternal(inst, "optin", (zod) => zod.def.in._zod.optin);
			defineLazyInternal(inst, "optout", (zod) => zod.def.out._zod.optout);
			defineLazyInternal(inst, "propValues", (zod) => zod.def.in._zod.propValues);
			inst._zod.parse = (payload, ctx) => {
				if (ctx.direction === "backward") {
					const right = def.out._zod.run(payload, ctx);
					if (right instanceof Promise) return right.then((right) => handlePipeResult(right, def.in, ctx));
					return handlePipeResult(right, def.in, ctx);
				}
				const left = def.in._zod.run(payload, ctx);
				if (left instanceof Promise) return left.then((left) => handlePipeResult(left, def.out, ctx));
				return handlePipeResult(left, def.out, ctx);
			};
		});
		function handlePipeResult(left, next, ctx) {
			if (left.issues.some((iss) => iss.code !== "unrecognized_keys")) {
				left.aborted = true;
				return left;
			}
			return next._zod.run({
				value: left.value,
				issues: left.issues
			}, ctx);
		}
		const $ZodReadonly = /*@__PURE__*/ $constructor("$ZodReadonly", (inst, def) => {
			$ZodType.init(inst, def);
			defineLazyInternal(inst, "propValues", (zod) => zod.def.innerType._zod.propValues);
			defineLazyInternal(inst, "values", (zod) => zod.def.innerType._zod.values);
			defineLazyInternal(inst, "optin", (zod) => zod.def.innerType?._zod?.optin);
			defineLazyInternal(inst, "optout", (zod) => zod.def.innerType?._zod?.optout);
			inst._zod.parse = (payload, ctx) => {
				if (ctx.direction === "backward") return def.innerType._zod.run(payload, ctx);
				const result = def.innerType._zod.run(payload, ctx);
				if (result instanceof Promise) return result.then(handleReadonlyResult);
				return handleReadonlyResult(result);
			};
		});
		function handleReadonlyResult(payload) {
			if (!payload.memo) payload.value = Object.freeze(payload.value);
			return payload;
		}
		const $ZodCustom = /*@__PURE__*/ $constructor("$ZodCustom", (inst, def) => {
			$ZodCheck.init(inst, def);
			$ZodType.init(inst, def);
			inst._zod.parse = (payload, _) => {
				return payload;
			};
			inst._zod.check = (payload) => {
				const input = payload.value;
				const r = def.fn(input);
				if (r instanceof Promise) return r.then((r) => handleRefineResult(r, payload, input, inst));
				handleRefineResult(r, payload, input, inst);
			};
		});
		function handleRefineResult(result, payload, input, inst) {
			if (!result) {
				const _iss = {
					code: "custom",
					input,
					inst,
					path: [...inst._zod.def.path ?? []],
					continue: !inst._zod.def.abort
				};
				if (inst._zod.def.params) _iss.params = inst._zod.def.params;
				payload.issues.push(issue(_iss));
			}
		}
		//#endregion
		//#region node_modules/zod/v4/core/memoizer.js
		var $ZodCyclicError = class extends Error {
			constructor() {
				super(`Cannot parse a reference cycle that closes through a transform`);
				this.name = "ZodCyclicError";
			}
		};
		/** Keyed off the context object every schema in one parse call already shares. */
		const STATE = "~memo";
		const NO_ISSUES = [];
		function cloneIssues(issues) {
			return issues.map((iss) => iss.path ? {
				...iss,
				path: iss.path.slice()
			} : { ...iss });
		}
		const recursive = /*@__PURE__*/ new WeakMap();
		/** Whether this schema's subtree contains a cycle, so one parse can re-enter it. */
		function isRecursive(inst, stack) {
			const cached = recursive.get(inst);
			if (cached !== void 0) return cached;
			if (stack.has(inst)) return true;
			stack.add(inst);
			let result = false;
			const check = (child) => {
				if (!result && child?._zod && isRecursive(child, stack)) result = true;
			};
			const def = inst._zod.def;
			switch (def.type) {
				case "object":
					for (const key of Reflect.ownKeys(def.shape)) check(def.shape[key]);
					check(def.catchall);
					break;
				case "array":
					check(def.element);
					break;
				case "tuple":
					for (const el of def.items) check(el);
					check(def.rest);
					break;
				case "record":
				case "map":
					check(def.keyType);
					check(def.valueType);
					break;
				case "set":
					check(def.valueType);
					break;
				case "union":
					for (const el of def.options) check(el);
					break;
				case "intersection":
					check(def.left);
					check(def.right);
					break;
				case "optional":
				case "nullable":
				case "default":
				case "prefault":
				case "catch":
				case "readonly":
				case "nonoptional":
				case "promise":
				case "success":
					check(def.innerType);
					break;
				case "pipe":
					check(def.in);
					check(def.out);
					break;
				case "function":
					check(def.input);
					check(def.output);
					break;
				case "lazy":
					check(inst._zod.innerType);
					break;
				case "template_literal":
				case "string":
				case "number":
				case "int":
				case "boolean":
				case "bigint":
				case "symbol":
				case "undefined":
				case "null":
				case "void":
				case "never":
				case "any":
				case "unknown":
				case "date":
				case "nan":
				case "enum":
				case "literal":
				case "file":
				case "transform":
				case "custom": break;
				default: for (const key in def) {
					const desc = Object.getOwnPropertyDescriptor(def, key);
					if (!desc || desc.get) continue;
					const value = desc.value;
					if (!value || typeof value !== "object") continue;
					if (value._zod) check(value);
					else if (Array.isArray(value)) for (const el of value) check(el);
				}
			}
			stack.delete(inst);
			recursive.set(inst, result);
			return result;
		}
		function bucketFor(state, inst) {
			let bucket = state.buckets.get(inst);
			if (!bucket) {
				bucket = /* @__PURE__ */ new Map();
				state.buckets.set(inst, bucket);
			}
			return bucket;
		}
		let handoff;
		const open = [];
		const memo = {
			alloc(_inst, payload, empty) {
				const bucket = handoff;
				if (!bucket) return empty;
				handoff = void 0;
				const entry = {
					value: empty,
					issues: null
				};
				bucket.set(payload.value, entry);
				open.push(entry);
				return empty;
			},
			guard(inst) {
				var _a;
				(_a = inst._zod).deferred ?? (_a.deferred = []);
				inst._zod.deferred.push(() => {
					const base = inst._zod.parse;
					const wrapped = (payload, ctx) => {
						if (ctx.direction !== "backward" && isBackEdge(ctx, payload.value)) throw new $ZodCyclicError();
						return base(payload, ctx);
					};
					inst._zod.parse = wrapped;
					if (inst._zod.run === base) inst._zod.run = wrapped;
				});
			},
			attach(inst) {
				var _a;
				let isRecursiveInst;
				let lastCtx;
				let lastBucket;
				(_a = inst._zod).deferred ?? (_a.deferred = []);
				inst._zod.deferred.push(() => {
					const base = inst._zod.parse;
					const wrapped = (payload, ctx) => {
						if (isRecursiveInst === void 0) {
							isRecursiveInst = isRecursive(inst, /* @__PURE__ */ new Set());
							if (!isRecursiveInst) {
								inst._zod.parse = base;
								if (inst._zod.run === wrapped) inst._zod.run = base;
								return base(payload, ctx);
							}
						}
						const input = payload.value;
						if (input === null || typeof input !== "object") return base(payload, ctx);
						let state = ctx[STATE];
						if (!state) {
							state = {
								buckets: /* @__PURE__ */ new Map(),
								backEdges: void 0
							};
							ctx[STATE] = state;
						}
						let bucket;
						if (lastCtx === ctx) bucket = lastBucket;
						else {
							bucket = bucketFor(state, inst);
							lastCtx = ctx;
							lastBucket = bucket;
						}
						const hit = bucket.get(input);
						if (hit) {
							payload.value = hit.value;
							if (hit.issues) {
								if (hit.issues.length) payload.issues.push(...cloneIssues(hit.issues));
							} else {
								payload.memo = true;
								state.backEdges ?? (state.backEdges = /* @__PURE__ */ new Set());
								state.backEdges.add(hit.value);
							}
							return payload;
						}
						handoff = bucket;
						const depth = open.length;
						const result = base(payload, ctx);
						handoff = void 0;
						const entry = open.length > depth ? open.pop() : void 0;
						if (result instanceof Promise) return result.then((r) => {
							if (entry) entry.issues = r.issues.length ? cloneIssues(r.issues) : NO_ISSUES;
							return r;
						});
						if (entry) entry.issues = result.issues.length ? cloneIssues(result.issues) : NO_ISSUES;
						return result;
					};
					inst._zod.parse = wrapped;
					if (inst._zod.run === base) inst._zod.run = wrapped;
				});
			}
		};
		/** The memoizer that gives containers cycle support. `zod` installs it by default; `zod/mini` opts in with `config({ memoizer: memoizer() })`. */
		function memoizer() {
			return memo;
		}
		/** Whether this value is a node a back-edge resolved to before it finished. */
		function isBackEdge(ctx, value) {
			const backEdges = ctx[STATE]?.backEdges;
			return backEdges !== void 0 && value !== null && typeof value === "object" && backEdges.has(value);
		}
		//#endregion
		//#region node_modules/zod/v4/locales/en.js
		const error = () => {
			const Sizable = {
				string: {
					unit: "characters",
					verb: "to have"
				},
				file: {
					unit: "bytes",
					verb: "to have"
				},
				array: {
					unit: "items",
					verb: "to have"
				},
				set: {
					unit: "items",
					verb: "to have"
				},
				map: {
					unit: "entries",
					verb: "to have"
				}
			};
			function getSizing(origin) {
				return Sizable[origin] ?? null;
			}
			const FormatDictionary = {
				regex: "input",
				email: "email address",
				url: "URL",
				emoji: "emoji",
				uuid: "UUID",
				uuidv4: "UUIDv4",
				uuidv6: "UUIDv6",
				nanoid: "nanoid",
				guid: "GUID",
				cuid: "cuid",
				cuid2: "cuid2",
				ulid: "ULID",
				xid: "XID",
				ksuid: "KSUID",
				datetime: "ISO datetime",
				date: "ISO date",
				time: "ISO time",
				duration: "ISO duration",
				ipv4: "IPv4 address",
				ipv6: "IPv6 address",
				mac: "MAC address",
				cidrv4: "IPv4 range",
				cidrv6: "IPv6 range",
				base64: "base64-encoded string",
				base64url: "base64url-encoded string",
				json_string: "JSON string",
				e164: "E.164 number",
				credit_card: "credit card number",
				jwt: "JWT",
				template_literal: "input"
			};
			const TypeDictionary = { nan: "NaN" };
			function getTypeName(type, input) {
				if (type === "number" && typeof input === "number" && !Number.isFinite(input)) return String(input);
				return TypeDictionary[type] ?? type;
			}
			return (issue) => {
				switch (issue.code) {
					case "invalid_type": return `Invalid input: expected ${getTypeName(issue.expected)}, received ${getTypeName(parsedType(issue.input), issue.input)}`;
					case "invalid_value":
						if (issue.values.length === 1) return `Invalid input: expected ${stringifyPrimitive(issue.values[0])}`;
						return `Invalid option: expected one of ${joinValues(issue.values, "|")}`;
					case "too_big": {
						const adj = issue.exact ? "exactly " : issue.inclusive ? "<=" : "<";
						const sizing = getSizing(issue.origin);
						if (sizing) return `Too big: expected ${issue.origin ?? "value"} to have ${adj}${issue.maximum.toString()} ${sizing.unit ?? "elements"}`;
						return `Too big: expected ${issue.origin ?? "value"} to be ${adj}${issue.maximum.toString()}`;
					}
					case "too_small": {
						const adj = issue.exact ? "exactly " : issue.inclusive ? ">=" : ">";
						const sizing = getSizing(issue.origin);
						if (sizing) return `Too small: expected ${issue.origin} to have ${adj}${issue.minimum.toString()} ${sizing.unit}`;
						return `Too small: expected ${issue.origin} to be ${adj}${issue.minimum.toString()}`;
					}
					case "invalid_format": {
						const _issue = issue;
						if (_issue.format === "starts_with") return `Invalid string: must start with "${_issue.prefix}"`;
						if (_issue.format === "ends_with") return `Invalid string: must end with "${_issue.suffix}"`;
						if (_issue.format === "includes") return `Invalid string: must include "${_issue.includes}"`;
						if (_issue.format === "regex") return `Invalid string: must match pattern ${_issue.pattern}`;
						return `Invalid ${FormatDictionary[_issue.format] ?? issue.format}`;
					}
					case "not_multiple_of": return `Invalid number: must be a multiple of ${issue.divisor}`;
					case "unrecognized_keys": return `Unrecognized key${issue.keys.length > 1 ? "s" : ""}: ${joinValues(issue.keys, ", ")}`;
					case "invalid_key": return `Invalid key in ${issue.origin}`;
					case "invalid_union":
						if (issue.options && Array.isArray(issue.options) && issue.options.length > 0) return `Invalid discriminator value. Expected ${issue.options.map((o) => `'${o}'`).join(" | ")}`;
						if (issue.inclusive === false) return "Invalid input: more than one option matched";
						return "Invalid input";
					case "invalid_element": return `Invalid value in ${issue.origin}`;
					default: return `Invalid input`;
				}
			};
		};
		function en_default() {
			return { localeError: error() };
		}
		//#endregion
		//#region node_modules/zod/v4/core/registries.js
		var _a;
		var $ZodRegistry = class {
			constructor() {
				this._map = /* @__PURE__ */ new WeakMap();
				this._idmap = /* @__PURE__ */ new Map();
			}
			add(schema, ..._meta) {
				const meta = _meta[0];
				this._map.set(schema, meta);
				if (meta && typeof meta === "object" && "id" in meta) this._idmap.set(meta.id, schema);
				return this;
			}
			clear() {
				this._map = /* @__PURE__ */ new WeakMap();
				this._idmap = /* @__PURE__ */ new Map();
				return this;
			}
			remove(schema) {
				const meta = this._map.get(schema);
				if (meta && typeof meta === "object" && "id" in meta) this._idmap.delete(meta.id);
				this._map.delete(schema);
				return this;
			}
			get(schema) {
				const p = schema._zod.parent;
				if (p) {
					const pm = { ...this.get(p) ?? {} };
					delete pm.id;
					const f = {
						...pm,
						...this._map.get(schema)
					};
					return Object.keys(f).length ? f : void 0;
				}
				return this._map.get(schema);
			}
			has(schema) {
				return this._map.has(schema);
			}
		};
		function registry() {
			return new $ZodRegistry();
		}
		(_a = globalThis).__zod_globalRegistry ?? (_a.__zod_globalRegistry = registry());
		const globalRegistry = globalThis.__zod_globalRegistry;
		//#endregion
		//#region node_modules/zod/v4/core/api.js
		// @__NO_SIDE_EFFECTS__
		function _string(Class, params) {
			return new Class({
				type: "string",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _email(Class, params) {
			return new Class({
				type: "string",
				format: "email",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _guid(Class, params) {
			return new Class({
				type: "string",
				format: "guid",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _uuid(Class, params) {
			return new Class({
				type: "string",
				format: "uuid",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _uuidv4(Class, params) {
			return new Class({
				type: "string",
				format: "uuid",
				check: "string_format",
				abort: false,
				version: "v4",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _uuidv6(Class, params) {
			return new Class({
				type: "string",
				format: "uuid",
				check: "string_format",
				abort: false,
				version: "v6",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _uuidv7(Class, params) {
			return new Class({
				type: "string",
				format: "uuid",
				check: "string_format",
				abort: false,
				version: "v7",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _url(Class, params) {
			return new Class({
				type: "string",
				format: "url",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _emoji(Class, params) {
			return new Class({
				type: "string",
				format: "emoji",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _nanoid(Class, params) {
			return new Class({
				type: "string",
				format: "nanoid",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		/**
		* @deprecated CUID v1 is deprecated by its authors due to information leakage
		* (timestamps embedded in the id). Use {@link _cuid2} instead.
		* See https://github.com/paralleldrive/cuid.
		*/
		// @__NO_SIDE_EFFECTS__
		function _cuid(Class, params) {
			return new Class({
				type: "string",
				format: "cuid",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _cuid2(Class, params) {
			return new Class({
				type: "string",
				format: "cuid2",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _ulid(Class, params) {
			return new Class({
				type: "string",
				format: "ulid",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _xid(Class, params) {
			return new Class({
				type: "string",
				format: "xid",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _ksuid(Class, params) {
			return new Class({
				type: "string",
				format: "ksuid",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _ipv4(Class, params) {
			return new Class({
				type: "string",
				format: "ipv4",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _ipv6(Class, params) {
			return new Class({
				type: "string",
				format: "ipv6",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _cidrv4(Class, params) {
			return new Class({
				type: "string",
				format: "cidrv4",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _cidrv6(Class, params) {
			return new Class({
				type: "string",
				format: "cidrv6",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _base64(Class, params) {
			return new Class({
				type: "string",
				format: "base64",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _base64url(Class, params) {
			return new Class({
				type: "string",
				format: "base64url",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _e164(Class, params) {
			return new Class({
				type: "string",
				format: "e164",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _jwt(Class, params) {
			return new Class({
				type: "string",
				format: "jwt",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _isoDateTime(Class, params) {
			return new Class({
				type: "string",
				format: "datetime",
				check: "string_format",
				offset: false,
				local: false,
				precision: null,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _isoDate(Class, params) {
			return new Class({
				type: "string",
				format: "date",
				check: "string_format",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _isoTime(Class, params) {
			return new Class({
				type: "string",
				format: "time",
				check: "string_format",
				precision: null,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _isoDuration(Class, params) {
			return new Class({
				type: "string",
				format: "duration",
				check: "string_format",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _boolean(Class, params) {
			return new Class({
				type: "boolean",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _unknown(Class) {
			return new Class({ type: "unknown" });
		}
		// @__NO_SIDE_EFFECTS__
		function _maxLength(maximum, params) {
			return new $ZodCheckMaxLength({
				check: "max_length",
				...normalizeParams(params),
				maximum
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _minLength(minimum, params) {
			return new $ZodCheckMinLength({
				check: "min_length",
				...normalizeParams(params),
				minimum
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _length(length, params) {
			return new $ZodCheckLengthEquals({
				check: "length_equals",
				...normalizeParams(params),
				length
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _regex(pattern, params) {
			return new $ZodCheckRegex({
				check: "string_format",
				format: "regex",
				...normalizeParams(params),
				pattern
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _lowercase(params) {
			return new $ZodCheckLowerCase({
				check: "string_format",
				format: "lowercase",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _uppercase(params) {
			return new $ZodCheckUpperCase({
				check: "string_format",
				format: "uppercase",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _includes(includes, params) {
			return new $ZodCheckIncludes({
				check: "string_format",
				format: "includes",
				...normalizeParams(params),
				includes
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _startsWith(prefix, params) {
			return new $ZodCheckStartsWith({
				check: "string_format",
				format: "starts_with",
				...normalizeParams(params),
				prefix
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _endsWith(suffix, params) {
			return new $ZodCheckEndsWith({
				check: "string_format",
				format: "ends_with",
				...normalizeParams(params),
				suffix
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _overwrite(tx) {
			return new $ZodCheckOverwrite({
				check: "overwrite",
				tx
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _normalize(form) {
			return /* @__PURE__ */ _overwrite((input) => input.normalize(form));
		}
		// @__NO_SIDE_EFFECTS__
		function _trim() {
			return /* @__PURE__ */ _overwrite((input) => input.trim());
		}
		// @__NO_SIDE_EFFECTS__
		function _toLowerCase() {
			return /* @__PURE__ */ _overwrite((input) => input.toLowerCase());
		}
		// @__NO_SIDE_EFFECTS__
		function _toUpperCase() {
			return /* @__PURE__ */ _overwrite((input) => input.toUpperCase());
		}
		// @__NO_SIDE_EFFECTS__
		function _slugify() {
			return /* @__PURE__ */ _overwrite((input) => slugify(input));
		}
		// @__NO_SIDE_EFFECTS__
		function _array(Class, element, params) {
			return new Class({
				type: "array",
				element,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _refine(Class, fn, _params) {
			return new Class({
				type: "custom",
				check: "custom",
				fn,
				...normalizeParams(_params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _superRefine(fn, params) {
			const ch = /* @__PURE__ */ _check((payload) => {
				payload.addIssue = (issue$2) => {
					if (typeof issue$2 === "string") payload.issues.push(issue(issue$2, payload.value, ch._zod.def));
					else {
						const _issue = issue$2;
						if (_issue.fatal) _issue.continue = false;
						_issue.code ?? (_issue.code = "custom");
						if (!("input" in _issue)) _issue.input = payload.value;
						_issue.inst ?? (_issue.inst = ch);
						_issue.continue ?? (_issue.continue = !ch._zod.def.abort);
						payload.issues.push(issue(_issue));
					}
				};
				return fn(payload.value, payload);
			}, params);
			return ch;
		}
		// @__NO_SIDE_EFFECTS__
		function _check(fn, params) {
			const ch = new $ZodCheck({
				check: "custom",
				...normalizeParams(params)
			});
			ch._zod.check = fn;
			return ch;
		}
		//#endregion
		//#region node_modules/zod/v4/core/to-json-schema.js
		function assignProps(target, ...sources) {
			for (const source of sources) for (const key of Reflect.ownKeys(source)) if (Object.prototype.propertyIsEnumerable.call(source, key)) assignProp(target, key, source[key]);
			return target;
		}
		function initializeContext(params) {
			let target = params?.target ?? "draft-2020-12";
			if (target === "draft-4") target = "draft-04";
			if (target === "draft-7") target = "draft-07";
			return {
				processors: params.processors ?? {},
				metadataRegistry: params?.metadata ?? globalRegistry,
				target,
				unrepresentable: params?.unrepresentable ?? "throw",
				override: params?.override ?? (() => {}),
				io: params?.io ?? "output",
				counter: 0,
				seen: /* @__PURE__ */ new Map(),
				sharedDefsExtractedFor: void 0,
				sharedEmitDoneFor: void 0,
				cycles: params?.cycles ?? "ref",
				reused: params?.reused ?? "inline",
				intersections: [],
				deferred: [],
				external: params?.external ?? void 0
			};
		}
		/**
		* Applies the `unrepresentable` setting at a site that has no JSON Schema equivalent. Throws
		* `message` unless the setting (or the handler's return value) says otherwise. Returns `true` if a
		* custom JSON Schema was written into `json`, in which case the caller must not write its own.
		*/
		function handleUnrepresentable(schema, ctx, json, params, message) {
			const result = typeof ctx.unrepresentable === "function" ? ctx.unrepresentable({
				zodSchema: schema,
				path: params.path,
				message
			}) : ctx.unrepresentable;
			if (result === "any") return false;
			if (result === void 0 || result === "throw") throw new Error(message);
			Object.assign(json, result);
			return true;
		}
		function process(schema, ctx, _params = {
			path: [],
			schemaPath: []
		}) {
			var _a;
			const def = schema._zod.def;
			const seen = ctx.seen.get(schema);
			if (seen) {
				seen.count++;
				if (_params.schemaPath.includes(schema)) seen.cycle = _params.path;
				return seen.schema;
			}
			const result = {
				schema: {},
				count: 1,
				cycle: void 0,
				path: _params.path
			};
			ctx.seen.set(schema, result);
			ctx.sharedDefsExtractedFor = void 0;
			ctx.sharedEmitDoneFor = void 0;
			const overrideSchema = schema._zod.toJSONSchema?.();
			if (overrideSchema) result.schema = overrideSchema;
			else {
				const params = {
					..._params,
					schemaPath: [..._params.schemaPath, schema],
					path: _params.path
				};
				if (schema._zod.processJSONSchema) schema._zod.processJSONSchema(ctx, result.schema, params);
				else {
					const _json = result.schema;
					const processor = ctx.processors[def.type];
					if (!processor) throw new Error(`[toJSONSchema]: Non-representable type encountered: ${def.type}`);
					processor(schema, ctx, _json, params);
				}
				const parent = schema._zod.parent;
				if (parent) {
					if (!result.ref) result.ref = parent;
					process(parent, ctx, params);
					ctx.seen.get(parent).isParent = true;
				}
			}
			const meta = ctx.metadataRegistry.get(schema);
			if (meta) assignProps(result.schema, meta);
			if (ctx.io === "input" && isTransforming(schema)) {
				delete result.schema.examples;
				delete result.schema.default;
			}
			if (ctx.io === "input" && "_prefault" in result.schema) (_a = result.schema).default ?? (_a.default = result.schema._prefault);
			delete result.schema._prefault;
			return ctx.seen.get(schema).schema;
		}
		function encodeJSONPointerSegment(segment) {
			return segment.replace(/~/g, "~0").replace(/\//g, "~1");
		}
		function extractDefs(ctx, schema) {
			const root = ctx.seen.get(schema);
			if (!root) throw new Error("Unprocessed schema. This is a bug in Zod.");
			if (ctx.external && ctx.sharedDefsExtractedFor === ctx.external) return;
			const idToSchema = /* @__PURE__ */ new Map();
			for (const entry of ctx.seen.entries()) {
				const id = ctx.metadataRegistry.get(entry[0])?.id;
				if (id) {
					const existing = idToSchema.get(id);
					if (existing && existing !== entry[0]) throw new Error(`Duplicate schema id "${id}" detected during JSON Schema conversion. Two different schemas cannot share the same id when converted together.`);
					idToSchema.set(id, entry[0]);
				}
			}
			const makeURI = (entry) => {
				const defsSegment = ctx.target === "draft-2020-12" ? "$defs" : "definitions";
				if (ctx.external) {
					const externalId = ctx.external.registry.get(entry[0])?.id;
					const uriGenerator = ctx.external.uri ?? ((id) => id);
					if (externalId) return { ref: uriGenerator(externalId) };
					const id = entry[1].defId ?? entry[1].schema.id ?? `schema${ctx.counter++}`;
					entry[1].defId = id;
					return {
						defId: id,
						ref: `${uriGenerator("__shared")}#/${defsSegment}/${encodeJSONPointerSegment(id)}`
					};
				}
				const uriPrefix = `#`;
				const defUriPrefix = `${uriPrefix}/${defsSegment}/`;
				if (entry[1] === root && !entry[1].schema.id) return { ref: uriPrefix };
				const defId = entry[1].schema.id ?? `__schema${ctx.counter++}`;
				return {
					defId,
					ref: defUriPrefix + encodeJSONPointerSegment(defId)
				};
			};
			const extractToDef = (entry) => {
				if (entry[1].schema.$ref) return;
				const seen = entry[1];
				const { ref, defId } = makeURI(entry);
				seen.def = { ...seen.schema };
				if (defId) seen.defId = defId;
				const schema = seen.schema;
				for (const key in schema) delete schema[key];
				schema.$ref = ref;
			};
			if (ctx.cycles === "throw") for (const entry of ctx.seen.entries()) {
				const seen = entry[1];
				if (seen.cycle) throw new Error(`Cycle detected: #/${seen.cycle?.join("/")}/<root>

Set the \`cycles\` parameter to \`"ref"\` to resolve cyclical schemas with defs.`);
			}
			for (const entry of ctx.seen.entries()) {
				const seen = entry[1];
				if (schema === entry[0]) {
					extractToDef(entry);
					continue;
				}
				if (ctx.external) {
					const ext = ctx.external.registry.get(entry[0])?.id;
					if (schema !== entry[0] && ext) {
						extractToDef(entry);
						continue;
					}
				}
				if (ctx.metadataRegistry.get(entry[0])?.id) {
					extractToDef(entry);
					continue;
				}
				if (seen.cycle) {
					extractToDef(entry);
					continue;
				}
				if (seen.count > 1) {
					if (ctx.reused === "ref") {
						extractToDef(entry);
						continue;
					}
				}
			}
			if (ctx.external) ctx.sharedDefsExtractedFor = ctx.external;
		}
		/** Rewrites `anyOf: [{type: "a"}, {type: "b"}]` to `type: ["a", "b"]`, which every JSON Schema draft treats as equivalent and most consumers render far better for the nullable case. Only branches that are a bare type assertion qualify — anything carrying a constraint, `$ref`, `const` or metadata is left alone. Runs after `flattenRef`, so a branch an override decorated or `$defs` extraction turned into a `$ref` is no longer bare and correctly stays in `anyOf`. `oneOf` is excluded: `integer` and `number` overlap, so "exactly one" and "at least one" are not the same there. OpenAPI 3.0 is excluded: its `type` must be a single string. */
		function compactTypeUnion(schema) {
			const options = schema.anyOf;
			if (!Array.isArray(options) || options.length === 0 || schema.type !== void 0) return;
			const types = [];
			for (const option of options) {
				if (!option || typeof option !== "object") return;
				compactTypeUnion(option);
				const keys = Object.keys(option);
				if (keys.length !== 1 || keys[0] !== "type") return;
				const type = option.type;
				for (const member of Array.isArray(type) ? type : [type]) {
					if (typeof member !== "string") return;
					if (!types.includes(member)) types.push(member);
				}
			}
			delete schema.anyOf;
			schema.type = types.length === 1 ? types[0] : types;
		}
		/** Keywords `foldIntersection` knows how to combine. Anything else — `$ref`, `patternProperties`,
		* an annotation like `description` — makes a member unfoldable, so a constraint this does not
		* understand leaves the `allOf` alone instead of being silently dropped or misattributed. */
		const FOLDABLE_KEYS = /* @__PURE__ */ new Set([
			"type",
			"properties",
			"required",
			"additionalProperties"
		]);
		const UNION_KEYS = ["oneOf", "anyOf"];
		/** A member's constraint on a key it does not declare itself. A `catchall` states one; `false`, an absent `additionalProperties`, and the empty schema a loose object emits state nothing. */
		function undeclaredConstraint(member) {
			const extra = member.additionalProperties;
			if (extra === void 0 || extra === false || typeof extra !== "object" || extra === null) return null;
			return Object.keys(extra).length ? extra : null;
		}
		/** Combines object members into the single object they describe together, or returns `null` if any of them carries a keyword outside {@link FOLDABLE_KEYS}. */
		function foldObjects(members) {
			const objects = [];
			for (const member of members) {
				if (typeof member !== "object" || member.type !== "object") return null;
				for (const key in member) if (!FOLDABLE_KEYS.has(key)) return null;
				objects.push(member);
			}
			const properties = {};
			const required = /* @__PURE__ */ new Set();
			for (const object of objects) {
				for (const key in object.properties) {
					if (Object.prototype.hasOwnProperty.call(properties, key)) continue;
					const parts = [];
					for (const other of objects) {
						const part = other.properties?.[key] ?? undeclaredConstraint(other);
						if (part === null || part === void 0) continue;
						if (!parts.some((seen) => JSON.stringify(seen) === JSON.stringify(part))) parts.push(part);
					}
					assignProp(properties, key, parts.length === 1 ? parts[0] : foldObjects(parts) ?? { allOf: parts });
				}
				for (const key of object.required ?? []) required.add(key);
			}
			const folded = {
				type: "object",
				properties
			};
			if (required.size) folded.required = [...required];
			if (objects.every((object) => object.additionalProperties === false)) folded.additionalProperties = false;
			else {
				const constraints = [];
				for (const object of objects) {
					const constraint = undeclaredConstraint(object);
					if (constraint && !constraints.some((seen) => JSON.stringify(seen) === JSON.stringify(constraint))) constraints.push(constraint);
				}
				if (constraints.length === 1) folded.additionalProperties = constraints[0];
				else if (constraints.length > 1) folded.additionalProperties = { allOf: constraints };
			}
			return folded;
		}
		/** `additionalProperties` in an `allOf` member sees only that member's own `properties`, so two
		* closed object members reject each other's keys and the schema validates nothing. Zod's parser
		* pools the key sets instead — `handleIntersectionResults` reports a key as unrecognized only when
		* *every* side rejects it — so the emitted schema has to pool them too, and folding the members
		* into one object is the encoding that says so on every target.
		*
		* This runs from `finalize`, after `extractDefs`, which is what keeps it clear of the `$ref`
		* machinery: a member extracted into `$defs` is already a `$ref` by now and declines to fold, so it
		* keeps its reference and its own closedness rather than being inlined as a stale copy. */
		function foldIntersection(json) {
			const allOf = json.allOf;
			if (!Array.isArray(allOf) || allOf.length < 2) return;
			for (const key of FOLDABLE_KEYS) if (key in json) return;
			const unions = allOf.filter((m) => UNION_KEYS.some((k) => Array.isArray(m[k])));
			let folded = null;
			if (!unions.length) folded = foldObjects(allOf);
			else {
				const union = unions[0];
				const keyword = UNION_KEYS.find((k) => Array.isArray(union[k]));
				if (Object.keys(union).length !== 1) return;
				const rest = allOf.filter((m) => m !== union);
				const branches = union[keyword].map((branch) => foldObjects([...rest, branch]));
				if (branches.some((b) => !b)) return;
				folded = { [keyword]: branches };
			}
			if (!folded) return;
			delete json.allOf;
			assignProps(json, folded);
		}
		function finalize(ctx, schema) {
			const root = ctx.seen.get(schema);
			if (!root) throw new Error("Unprocessed schema. This is a bug in Zod.");
			const flattenRef = (zodSchema) => {
				const seen = ctx.seen.get(zodSchema);
				if (seen.ref === null) return;
				const schema = seen.def ?? seen.schema;
				const _cached = { ...schema };
				const ref = seen.ref;
				seen.ref = null;
				if (ref) {
					flattenRef(ref);
					const refSeen = ctx.seen.get(ref);
					const refSchema = refSeen.schema;
					if (refSchema.$ref && (ctx.target === "draft-07" || ctx.target === "draft-04" || ctx.target === "openapi-3.0")) {
						schema.allOf = schema.allOf ?? [];
						schema.allOf.push(refSchema);
					} else assignProps(schema, refSchema);
					assignProps(schema, _cached);
					if (zodSchema._zod.parent === ref) for (const key in schema) {
						if (key === "$ref" || key === "allOf") continue;
						if (!(key in _cached)) delete schema[key];
					}
					if (refSchema.$ref && refSeen.def) for (const key in schema) {
						if (key === "$ref" || key === "allOf") continue;
						if (key in refSeen.def && JSON.stringify(schema[key]) === JSON.stringify(refSeen.def[key])) delete schema[key];
					}
				}
				const parent = zodSchema._zod.parent;
				if (parent && parent !== ref) {
					flattenRef(parent);
					const parentSeen = ctx.seen.get(parent);
					if (parentSeen?.schema.$ref) {
						schema.$ref = parentSeen.schema.$ref;
						if (parentSeen.def) for (const key in schema) {
							if (key === "$ref" || key === "allOf") continue;
							if (key in parentSeen.def && JSON.stringify(schema[key]) === JSON.stringify(parentSeen.def[key])) delete schema[key];
						}
					}
				}
				ctx.override({
					zodSchema,
					jsonSchema: schema,
					path: seen.path ?? []
				});
			};
			if (!ctx.external || ctx.sharedEmitDoneFor !== ctx.external) {
				for (const entry of [...ctx.seen.entries()].reverse()) flattenRef(entry[0]);
				if (ctx.target !== "openapi-3.0") for (const entry of ctx.seen.entries()) compactTypeUnion(entry[1].def ?? entry[1].schema);
				for (const rewrite of ctx.deferred) rewrite();
				if (ctx.intersections.length) {
					const carriers = /* @__PURE__ */ new Map();
					for (const seen of ctx.seen.values()) for (const json of [seen.schema, seen.def]) {
						const allOf = json?.allOf;
						if (!Array.isArray(allOf)) continue;
						const existing = carriers.get(allOf);
						if (existing) existing.push(json);
						else carriers.set(allOf, [json]);
					}
					for (const allOf of ctx.intersections) for (const json of carriers.get(allOf) ?? []) foldIntersection(json);
				}
			}
			const result = {};
			if (ctx.target === "draft-2020-12") result.$schema = "https://json-schema.org/draft/2020-12/schema";
			else if (ctx.target === "draft-07") result.$schema = "http://json-schema.org/draft-07/schema#";
			else if (ctx.target === "draft-04") result.$schema = "http://json-schema.org/draft-04/schema#";
			else if (ctx.target === "openapi-3.0") {}
			if (ctx.external?.uri) {
				const id = ctx.external.registry.get(schema)?.id;
				if (!id) throw new Error("Schema is missing an `id` property");
				result.$id = ctx.external.uri(id);
			}
			assignProps(result, root.defId ? root.schema : root.def ?? root.schema);
			const rootMetaId = ctx.metadataRegistry.get(schema)?.id;
			if (rootMetaId !== void 0 && result.id === rootMetaId) delete result.id;
			const defs = ctx.external?.defs ?? {};
			if (!ctx.external || ctx.sharedEmitDoneFor !== ctx.external) for (const entry of ctx.seen.entries()) {
				const seen = entry[1];
				if (seen.def && seen.defId) {
					if (seen.def.id === seen.defId) delete seen.def.id;
					assignProp(defs, seen.defId, seen.def);
				}
			}
			if (ctx.external) ctx.sharedEmitDoneFor = ctx.external;
			if (ctx.external) {} else if (Object.keys(defs).length > 0) {
				if (ctx.target === "draft-2020-12") result.$defs = defs;
				else result.definitions = defs;
			}
			try {
				const finalized = JSON.parse(JSON.stringify(result));
				Object.defineProperty(finalized, "~standard", {
					value: {
						...schema["~standard"],
						jsonSchema: {
							input: createStandardJSONSchemaMethod(schema, "input", ctx.processors),
							output: createStandardJSONSchemaMethod(schema, "output", ctx.processors)
						}
					},
					enumerable: false,
					writable: false
				});
				return finalized;
			} catch (_err) {
				throw new Error("Error converting schema to JSON.");
			}
		}
		function isTransforming(_schema, _ctx) {
			const ctx = _ctx ?? { seen: /* @__PURE__ */ new Set() };
			if (ctx.seen.has(_schema)) return false;
			ctx.seen.add(_schema);
			const def = _schema._zod.def;
			if (def.type === "transform") return true;
			if (def.type === "array") return isTransforming(def.element, ctx);
			if (def.type === "set") return isTransforming(def.valueType, ctx);
			if (def.type === "lazy") return isTransforming(def.getter(), ctx);
			if (def.type === "promise" || def.type === "optional" || def.type === "nonoptional" || def.type === "nullable" || def.type === "readonly" || def.type === "default" || def.type === "prefault" || def.type === "catch") return isTransforming(def.innerType, ctx);
			if (def.type === "intersection") return isTransforming(def.left, ctx) || isTransforming(def.right, ctx);
			if (def.type === "record" || def.type === "map") return isTransforming(def.keyType, ctx) || isTransforming(def.valueType, ctx);
			if (def.type === "pipe") {
				if (_schema._zod.traits.has("$ZodCodec")) return true;
				return isTransforming(def.in, ctx) || isTransforming(def.out, ctx);
			}
			if (def.type === "object") {
				for (const key in def.shape) if (isTransforming(def.shape[key], ctx)) return true;
				return false;
			}
			if (def.type === "union") {
				for (const option of def.options) if (isTransforming(option, ctx)) return true;
				return false;
			}
			if (def.type === "tuple") {
				for (const item of def.items) if (isTransforming(item, ctx)) return true;
				if (def.rest && isTransforming(def.rest, ctx)) return true;
				return false;
			}
			return false;
		}
		/**
		* Creates a toJSONSchema method for a schema instance.
		* This encapsulates the logic of initializing context, processing, extracting defs, and finalizing.
		*/
		const createToJSONSchemaMethod = (schema, processors = {}) => (params) => {
			const ctx = initializeContext({
				...params,
				processors
			});
			process(schema, ctx);
			extractDefs(ctx, schema);
			return finalize(ctx, schema);
		};
		const createStandardJSONSchemaMethod = (schema, io, processors = {}) => (params) => {
			const { libraryOptions, target } = params ?? {};
			const ctx = initializeContext({
				...libraryOptions ?? {},
				target,
				io,
				processors
			});
			process(schema, ctx);
			extractDefs(ctx, schema);
			return finalize(ctx, schema);
		};
		//#endregion
		//#region node_modules/zod/v4/core/json-schema-processors.js
		const formatMap = {
			guid: "uuid",
			url: "uri",
			datetime: "date-time",
			json_string: "json-string",
			regex: ""
		};
		const stringProcessor = (schema, ctx, _json, _params) => {
			const json = _json;
			json.type = "string";
			const { minimum, maximum, format, patterns, contentEncoding, laxFormat } = schema._zod.bag;
			if (typeof minimum === "number") json.minLength = minimum;
			if (typeof maximum === "number") json.maxLength = maximum;
			if (format) {
				json.format = formatMap[format] ?? format;
				if (json.format === "") delete json.format;
				if (format === "time" || laxFormat) delete json.format;
			}
			if (contentEncoding) json.contentEncoding = contentEncoding;
			if (patterns && patterns.size > 0) {
				const patternList = [...patterns];
				if (patternList.length === 1) json.pattern = patternList[0].source;
				else if (patternList.length > 1) json.allOf = [...patternList.map((regex) => ({
					...ctx.target === "draft-07" || ctx.target === "draft-04" || ctx.target === "openapi-3.0" ? { type: "string" } : {},
					pattern: regex.source
				}))];
			}
		};
		const booleanProcessor = (_schema, _ctx, json, _params) => {
			json.type = "boolean";
		};
		const customProcessor = (schema, ctx, json, params) => {
			handleUnrepresentable(schema, ctx, json, params, "Custom types cannot be represented in JSON Schema");
		};
		const transformProcessor = (schema, ctx, json, params) => {
			handleUnrepresentable(schema, ctx, json, params, "Transforms cannot be represented in JSON Schema");
		};
		const arrayProcessor = (schema, ctx, _json, params) => {
			const json = _json;
			const def = schema._zod.def;
			const { minimum, maximum } = schema._zod.bag;
			if (typeof minimum === "number") json.minItems = minimum;
			if (typeof maximum === "number") json.maxItems = maximum;
			json.type = "array";
			json.items = process(def.element, ctx, {
				...params,
				path: [...params.path, "items"]
			});
		};
		const unionProcessor = (schema, ctx, json, params) => {
			const def = schema._zod.def;
			const isExclusive = def.inclusive === false;
			const options = def.options.map((x, i) => process(x, ctx, {
				...params,
				path: [
					...params.path,
					isExclusive ? "oneOf" : "anyOf",
					i
				]
			}));
			if (isExclusive) json.oneOf = options;
			else json.anyOf = options;
		};
		const intersectionProcessor = (schema, ctx, json, params) => {
			const def = schema._zod.def;
			const a = process(def.left, ctx, {
				...params,
				path: [
					...params.path,
					"allOf",
					0
				]
			});
			const b = process(def.right, ctx, {
				...params,
				path: [
					...params.path,
					"allOf",
					1
				]
			});
			const isSimpleIntersection = (val) => "allOf" in val && Object.keys(val).length === 1;
			const allOf = [...isSimpleIntersection(a) ? a.allOf : [a], ...isSimpleIntersection(b) ? b.allOf : [b]];
			json.allOf = allOf;
			ctx.intersections.push(allOf);
		};
		const nullableProcessor = (schema, ctx, json, params) => {
			const def = schema._zod.def;
			const inner = process(def.innerType, ctx, params);
			const seen = ctx.seen.get(schema);
			if (ctx.target === "openapi-3.0") {
				seen.ref = def.innerType;
				json.nullable = true;
			} else json.anyOf = [inner, { type: "null" }];
		};
		const nonoptionalProcessor = (schema, ctx, _json, params) => {
			const def = schema._zod.def;
			process(def.innerType, ctx, params);
			const seen = ctx.seen.get(schema);
			seen.ref = def.innerType;
		};
		/** Round-trips a default value through JSON so the emitted schema is guaranteed to be valid JSON.
		* A BigInt has no reliable encoding, so it goes through `unrepresentable` like any other
		* unrepresentable value. Returns a sentinel when the caller must not write a default of its own. */
		const UNREPRESENTABLE_DEFAULT = Symbol();
		function serializeDefaultValue(value, schema, ctx, json, params) {
			let unrepresentable = false;
			const serialized = JSON.stringify(value, (_, val) => {
				if (typeof val !== "bigint") return val;
				unrepresentable = true;
				return null;
			});
			if (!unrepresentable) return JSON.parse(serialized);
			handleUnrepresentable(schema, ctx, json, params, "BigInt defaults cannot be represented in JSON Schema");
			return UNREPRESENTABLE_DEFAULT;
		}
		const defaultProcessor = (schema, ctx, json, params) => {
			const def = schema._zod.def;
			process(def.innerType, ctx, params);
			const seen = ctx.seen.get(schema);
			seen.ref = def.innerType;
			const value = serializeDefaultValue(def.defaultValue, schema, ctx, json, params);
			if (value !== UNREPRESENTABLE_DEFAULT) json.default = value;
		};
		const prefaultProcessor = (schema, ctx, json, params) => {
			const def = schema._zod.def;
			process(def.innerType, ctx, params);
			const seen = ctx.seen.get(schema);
			seen.ref = def.innerType;
			if (ctx.io !== "input") return;
			const value = serializeDefaultValue(def.defaultValue, schema, ctx, json, params);
			if (value !== UNREPRESENTABLE_DEFAULT) json._prefault = value;
		};
		const catchProcessor = (schema, ctx, json, params) => {
			const def = schema._zod.def;
			process(def.innerType, ctx, params);
			const seen = ctx.seen.get(schema);
			seen.ref = def.innerType;
			let catchValue;
			try {
				catchValue = def.catchValue(void 0);
			} catch {
				handleUnrepresentable(schema, ctx, json, params, "Dynamic catch values are not supported in JSON Schema");
				return;
			}
			json.default = catchValue;
		};
		const pipeProcessor = (schema, ctx, _json, params) => {
			const def = schema._zod.def;
			const inIsTransform = def.in._zod.traits.has("$ZodTransform");
			const innerType = ctx.io === "input" ? inIsTransform ? def.out : def.in : def.out;
			process(innerType, ctx, params);
			const seen = ctx.seen.get(schema);
			seen.ref = innerType;
		};
		const readonlyProcessor = (schema, ctx, json, params) => {
			const def = schema._zod.def;
			process(def.innerType, ctx, params);
			const seen = ctx.seen.get(schema);
			seen.ref = def.innerType;
			json.readOnly = true;
		};
		const optionalProcessor = (schema, ctx, _json, params) => {
			const def = schema._zod.def;
			process(def.innerType, ctx, params);
			const seen = ctx.seen.get(schema);
			seen.ref = def.innerType;
		};
		//#endregion
		//#region node_modules/zod/v4/classic/errors.js
		const _installedErrorProtos = /* @__PURE__ */ new WeakSet([Object.prototype, Error.prototype]);
		function _lazyMethod(proto, key, make) {
			Object.defineProperty(proto, key, {
				configurable: true,
				enumerable: false,
				get() {
					const value = make(this);
					Object.defineProperty(this, key, {
						value,
						configurable: true,
						writable: true
					});
					return value;
				},
				set(value) {
					Object.defineProperty(this, key, {
						value,
						configurable: true,
						writable: true
					});
				}
			});
		}
		const initializer = (inst, issues) => {
			$ZodError.init(inst, issues);
			inst.name = "ZodError";
			const proto = Object.getPrototypeOf(inst);
			if (_installedErrorProtos.has(proto)) return;
			_installedErrorProtos.add(proto);
			_lazyMethod(proto, "format", (self) => (mapper) => formatError(self, mapper));
			_lazyMethod(proto, "flatten", (self) => (mapper) => flattenError(self, mapper));
			_lazyMethod(proto, "addIssue", (self) => (issue) => {
				self.issues.push(issue);
				self.message = JSON.stringify(self.issues, jsonStringifyReplacer, 2);
			});
			_lazyMethod(proto, "addIssues", (self) => (issues) => {
				self.issues.push(...issues);
				self.message = JSON.stringify(self.issues, jsonStringifyReplacer, 2);
			});
			Object.defineProperty(proto, "isEmpty", {
				configurable: true,
				enumerable: false,
				get() {
					return this.issues.length === 0;
				}
			});
		};
		const ZodRealError = /*@__PURE__*/ $constructor("ZodError", initializer, void 0, { Parent: Error });
		//#endregion
		//#region node_modules/zod/v4/classic/parse.js
		const parse = /* @__PURE__ */ _parse(ZodRealError);
		const parseAsync = /* @__PURE__ */ _parseAsync(ZodRealError);
		const safeParse = /* @__PURE__ */ _safeParse(ZodRealError);
		const safeParseAsync = /* @__PURE__ */ _safeParseAsync(ZodRealError);
		const encode = /* @__PURE__ */ _encode(ZodRealError);
		const decode = /* @__PURE__ */ _decode(ZodRealError);
		const encodeAsync = /* @__PURE__ */ _encodeAsync(ZodRealError);
		const decodeAsync = /* @__PURE__ */ _decodeAsync(ZodRealError);
		const safeEncode = /* @__PURE__ */ _safeEncode(ZodRealError);
		const safeDecode = /* @__PURE__ */ _safeDecode(ZodRealError);
		const safeEncodeAsync = /* @__PURE__ */ _safeEncodeAsync(ZodRealError);
		const safeDecodeAsync = /* @__PURE__ */ _safeDecodeAsync(ZodRealError);
		//#endregion
		//#region node_modules/zod/v4/classic/schemas.js
		function _ensureDefaultLocale() {
			if (!globalConfig.localeError) config(en_default());
		}
		function _ensureDefaultMemoizer() {
			if (!globalConfig.memoizer) config({ memoizer: memoizer() });
		}
		const ZodType = /*@__PURE__*/ $constructor("ZodType", (inst, def) => {
			_ensureDefaultLocale();
			$ZodType.init(inst, def);
			inst.def = def;
			inst.type = def.type;
			return inst;
		}, {
			check(...chks) {
				const def = this.def;
				return this.clone(mergeDefs(def, { checks: [...def.checks ?? [], ...chks.map((ch) => typeof ch === "function" ? { _zod: {
					check: ch,
					def: { check: "custom" },
					onattach: []
				} } : ch)] }), { parent: true });
			},
			with(...chks) {
				return this.check(...chks);
			},
			clone(def, params) {
				return clone(this, def, params);
			},
			brand() {
				return this;
			},
			register(reg, meta) {
				reg.add(this, meta);
				return this;
			},
			refine(check, params) {
				return this.check(refine(check, params));
			},
			superRefine(refinement, params) {
				return this.check(superRefine(refinement, params));
			},
			overwrite(fn) {
				return this.check(/* @__PURE__ */ _overwrite(fn));
			},
			optional() {
				return optional(this);
			},
			exactOptional() {
				return exactOptional(this);
			},
			nullable() {
				return nullable(this);
			},
			nullish() {
				return optional(nullable(this));
			},
			nonoptional(params) {
				return nonoptional(this, params);
			},
			array() {
				return array(this);
			},
			or(arg) {
				return union([this, arg]);
			},
			and(arg) {
				return intersection(this, arg);
			},
			transform(tx) {
				return pipe(this, transform(tx));
			},
			default(d) {
				return _default(this, d);
			},
			prefault(d) {
				return prefault(this, d);
			},
			catch(params) {
				return _catch(this, params);
			},
			pipe(target) {
				return pipe(this, target);
			},
			readonly() {
				return readonly(this);
			},
			describe(description) {
				const cl = this.clone();
				globalRegistry.add(cl, { description });
				return cl;
			},
			meta(...args) {
				if (args.length === 0) return globalRegistry.get(this);
				const cl = this.clone();
				globalRegistry.add(cl, args[0]);
				return cl;
			},
			isOptional() {
				return this.safeParse(void 0).success;
			},
			isNullable() {
				return this.safeParse(null).success;
			},
			apply(fn, ...args) {
				return args.length === 0 ? fn(this) : fn(this, ...args);
			},
			get "~standard"() {
				return hide(this, "~standard", {
					...standardProps(this),
					jsonSchema: {
						input: createStandardJSONSchemaMethod(this, "input"),
						output: createStandardJSONSchemaMethod(this, "output")
					}
				});
			},
			set "~standard"(value) {
				own(this, "~standard", value);
			},
			parse: function _parse(data, params) {
				return parse(this, data, params, { callee: _parse });
			},
			parseAsync: async function _parseAsync(data, params) {
				return await parseAsync(this, data, params, { callee: _parseAsync });
			},
			safeParse(data, params) {
				return safeParse(this, data, params);
			},
			async safeParseAsync(data, params) {
				return safeParseAsync(this, data, params);
			},
			get spa() {
				return this?.safeParseAsync;
			},
			set spa(value) {
				own(this, "spa", value);
			},
			encode: function _encode(data, params) {
				return encode(this, data, params, { callee: _encode });
			},
			decode: function _decode(data, params) {
				return decode(this, data, params, { callee: _decode });
			},
			encodeAsync: async function _encodeAsync(data, params) {
				return await encodeAsync(this, data, params, { callee: _encodeAsync });
			},
			decodeAsync: async function _decodeAsync(data, params) {
				return await decodeAsync(this, data, params, { callee: _decodeAsync });
			},
			safeEncode(data, params) {
				return safeEncode(this, data, params);
			},
			safeDecode(data, params) {
				return safeDecode(this, data, params);
			},
			async safeEncodeAsync(data, params) {
				return safeEncodeAsync(this, data, params);
			},
			async safeDecodeAsync(data, params) {
				return safeDecodeAsync(this, data, params);
			},
			toJSONSchema(params) {
				return createToJSONSchemaMethod(this, {})(params);
			},
			get description() {
				return globalRegistry.get(this)?.description;
			},
			get _def() {
				return this._zod.def;
			}
		});
		/** @internal */
		const _ZodString = /*@__PURE__*/ $constructor("_ZodString", (inst, def) => {
			$ZodString.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => stringProcessor(inst, ctx, json, params);
			const bag = inst._zod.bag;
			inst.format = bag.format ?? null;
			inst.minLength = bag.minimum ?? null;
			inst.maxLength = bag.maximum ?? null;
		}, {
			regex(...args) {
				return this.check(/* @__PURE__ */ _regex(...args));
			},
			includes(...args) {
				return this.check(/* @__PURE__ */ _includes(...args));
			},
			startsWith(...args) {
				return this.check(/* @__PURE__ */ _startsWith(...args));
			},
			endsWith(...args) {
				return this.check(/* @__PURE__ */ _endsWith(...args));
			},
			min(...args) {
				return this.check(/* @__PURE__ */ _minLength(...args));
			},
			max(...args) {
				return this.check(/* @__PURE__ */ _maxLength(...args));
			},
			length(...args) {
				return this.check(/* @__PURE__ */ _length(...args));
			},
			nonempty(...args) {
				return this.check(/* @__PURE__ */ _minLength(1, ...args));
			},
			lowercase(params) {
				return this.check(/* @__PURE__ */ _lowercase(params));
			},
			uppercase(params) {
				return this.check(/* @__PURE__ */ _uppercase(params));
			},
			trim() {
				return this.check(/* @__PURE__ */ _trim());
			},
			normalize(...args) {
				return this.check(/* @__PURE__ */ _normalize(...args));
			},
			toLowerCase() {
				return this.check(/* @__PURE__ */ _toLowerCase());
			},
			toUpperCase() {
				return this.check(/* @__PURE__ */ _toUpperCase());
			},
			slugify() {
				return this.check(/* @__PURE__ */ _slugify());
			}
		});
		const ZodString = /*@__PURE__*/ $constructor("ZodString", (inst, def) => {
			$ZodString.init(inst, def);
			_ZodString.init(inst, def);
		}, {
			email(params) {
				return this.check(/* @__PURE__ */ _email(ZodEmail, params));
			},
			url(params) {
				return this.check(/* @__PURE__ */ _url(ZodURL, params));
			},
			jwt(params) {
				return this.check(/* @__PURE__ */ _jwt(ZodJWT, params));
			},
			emoji(params) {
				return this.check(/* @__PURE__ */ _emoji(ZodEmoji, params));
			},
			guid(params) {
				return this.check(/* @__PURE__ */ _guid(ZodGUID, params));
			},
			uuid(params) {
				return this.check(/* @__PURE__ */ _uuid(ZodUUID, params));
			},
			uuidv4(params) {
				return this.check(/* @__PURE__ */ _uuidv4(ZodUUID, params));
			},
			uuidv6(params) {
				return this.check(/* @__PURE__ */ _uuidv6(ZodUUID, params));
			},
			uuidv7(params) {
				return this.check(/* @__PURE__ */ _uuidv7(ZodUUID, params));
			},
			nanoid(params) {
				return this.check(/* @__PURE__ */ _nanoid(ZodNanoID, params));
			},
			cuid(params) {
				return this.check(/* @__PURE__ */ _cuid(ZodCUID, params));
			},
			cuid2(params) {
				return this.check(/* @__PURE__ */ _cuid2(ZodCUID2, params));
			},
			ulid(params) {
				return this.check(/* @__PURE__ */ _ulid(ZodULID, params));
			},
			base64(params) {
				return this.check(/* @__PURE__ */ _base64(ZodBase64, params));
			},
			base64url(params) {
				return this.check(/* @__PURE__ */ _base64url(ZodBase64URL, params));
			},
			xid(params) {
				return this.check(/* @__PURE__ */ _xid(ZodXID, params));
			},
			ksuid(params) {
				return this.check(/* @__PURE__ */ _ksuid(ZodKSUID, params));
			},
			ipv4(params) {
				return this.check(/* @__PURE__ */ _ipv4(ZodIPv4, params));
			},
			ipv6(params) {
				return this.check(/* @__PURE__ */ _ipv6(ZodIPv6, params));
			},
			cidrv4(params) {
				return this.check(/* @__PURE__ */ _cidrv4(ZodCIDRv4, params));
			},
			cidrv6(params) {
				return this.check(/* @__PURE__ */ _cidrv6(ZodCIDRv6, params));
			},
			e164(params) {
				return this.check(/* @__PURE__ */ _e164(ZodE164, params));
			},
			datetime(params) {
				return this.check(/* @__PURE__ */ _isoDateTime(ZodISODateTime, params));
			},
			date(params) {
				return this.check(/* @__PURE__ */ _isoDate(ZodISODate, params));
			},
			time(params) {
				return this.check(/* @__PURE__ */ _isoTime(ZodISOTime, params));
			},
			duration(params) {
				return this.check(/* @__PURE__ */ _isoDuration(ZodISODuration, params));
			}
		});
		function string(params) {
			return /* @__PURE__ */ _string(ZodString, params);
		}
		const ZodStringFormat = /*@__PURE__*/ $constructor("ZodStringFormat", (inst, def) => {
			$ZodStringFormat.init(inst, def);
			_ZodString.init(inst, def);
		});
		const ZodISODateTime = /*@__PURE__*/ $constructor("ZodISODateTime", (inst, def) => {
			$ZodISODateTime.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodISODate = /*@__PURE__*/ $constructor("ZodISODate", (inst, def) => {
			$ZodISODate.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodISOTime = /*@__PURE__*/ $constructor("ZodISOTime", (inst, def) => {
			$ZodISOTime.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodISODuration = /*@__PURE__*/ $constructor("ZodISODuration", (inst, def) => {
			$ZodISODuration.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodEmail = /*@__PURE__*/ $constructor("ZodEmail", (inst, def) => {
			$ZodEmail.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodGUID = /*@__PURE__*/ $constructor("ZodGUID", (inst, def) => {
			$ZodGUID.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodUUID = /*@__PURE__*/ $constructor("ZodUUID", (inst, def) => {
			$ZodUUID.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodURL = /*@__PURE__*/ $constructor("ZodURL", (inst, def) => {
			$ZodURL.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodEmoji = /*@__PURE__*/ $constructor("ZodEmoji", (inst, def) => {
			$ZodEmoji.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodNanoID = /*@__PURE__*/ $constructor("ZodNanoID", (inst, def) => {
			$ZodNanoID.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		/**
		* @deprecated CUID v1 is deprecated by its authors due to information leakage
		* (timestamps embedded in the id). Use {@link ZodCUID2} instead.
		* See https://github.com/paralleldrive/cuid.
		*/
		const ZodCUID = /*@__PURE__*/ $constructor("ZodCUID", (inst, def) => {
			$ZodCUID.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodCUID2 = /*@__PURE__*/ $constructor("ZodCUID2", (inst, def) => {
			$ZodCUID2.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodULID = /*@__PURE__*/ $constructor("ZodULID", (inst, def) => {
			$ZodULID.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodXID = /*@__PURE__*/ $constructor("ZodXID", (inst, def) => {
			$ZodXID.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodKSUID = /*@__PURE__*/ $constructor("ZodKSUID", (inst, def) => {
			$ZodKSUID.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodIPv4 = /*@__PURE__*/ $constructor("ZodIPv4", (inst, def) => {
			$ZodIPv4.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodIPv6 = /*@__PURE__*/ $constructor("ZodIPv6", (inst, def) => {
			$ZodIPv6.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodCIDRv4 = /*@__PURE__*/ $constructor("ZodCIDRv4", (inst, def) => {
			$ZodCIDRv4.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodCIDRv6 = /*@__PURE__*/ $constructor("ZodCIDRv6", (inst, def) => {
			$ZodCIDRv6.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodBase64 = /*@__PURE__*/ $constructor("ZodBase64", (inst, def) => {
			$ZodBase64.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodBase64URL = /*@__PURE__*/ $constructor("ZodBase64URL", (inst, def) => {
			$ZodBase64URL.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodE164 = /*@__PURE__*/ $constructor("ZodE164", (inst, def) => {
			$ZodE164.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodJWT = /*@__PURE__*/ $constructor("ZodJWT", (inst, def) => {
			$ZodJWT.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodBoolean = /*@__PURE__*/ $constructor("ZodBoolean", (inst, def) => {
			$ZodBoolean.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => booleanProcessor(inst, ctx, json, params);
		});
		function boolean(params) {
			return /* @__PURE__ */ _boolean(ZodBoolean, params);
		}
		const ZodUnknown = /*@__PURE__*/ $constructor("ZodUnknown", (inst, def) => {
			$ZodUnknown.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => void 0;
		});
		function unknown$1() {
			return /* @__PURE__ */ _unknown(ZodUnknown);
		}
		const ZodArray = /*@__PURE__*/ $constructor("ZodArray", (inst, def) => {
			_ensureDefaultMemoizer();
			$ZodArray.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => arrayProcessor(inst, ctx, json, params);
			inst.element = def.element;
		}, {
			min(n, params) {
				return this.check(/* @__PURE__ */ _minLength(n, params));
			},
			nonempty(params) {
				return this.check(/* @__PURE__ */ _minLength(1, params));
			},
			max(n, params) {
				return this.check(/* @__PURE__ */ _maxLength(n, params));
			},
			length(n, params) {
				return this.check(/* @__PURE__ */ _length(n, params));
			},
			unwrap() {
				return this.element;
			}
		});
		function array(element, params) {
			return /* @__PURE__ */ _array(ZodArray, element, params);
		}
		const ZodUnion = /*@__PURE__*/ $constructor("ZodUnion", (inst, def) => {
			$ZodUnion.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => unionProcessor(inst, ctx, json, params);
			inst.options = def.options;
		});
		function union(options, params) {
			return new ZodUnion({
				type: "union",
				options,
				...normalizeParams(params)
			});
		}
		const ZodIntersection = /*@__PURE__*/ $constructor("ZodIntersection", (inst, def) => {
			$ZodIntersection.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => intersectionProcessor(inst, ctx, json, params);
		});
		function intersection(left, right) {
			return new ZodIntersection({
				type: "intersection",
				left,
				right
			});
		}
		const ZodTransform = /*@__PURE__*/ $constructor("ZodTransform", (inst, def) => {
			_ensureDefaultMemoizer();
			$ZodTransform.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => transformProcessor(inst, ctx, json, params);
			inst._zod.parse = (payload, _ctx) => {
				if (_ctx.direction === "backward") throw new $ZodEncodeError(inst.constructor.name);
				payload.addIssue = (issue$1) => {
					if (typeof issue$1 === "string") payload.issues.push(issue(issue$1, payload.value, def));
					else {
						const _issue = issue$1;
						if (_issue.fatal) _issue.continue = false;
						_issue.code ?? (_issue.code = "custom");
						if (!("input" in _issue)) _issue.input = payload.value;
						_issue.inst ?? (_issue.inst = inst);
						payload.issues.push(issue(_issue));
					}
				};
				const output = def.transform(payload.value, payload);
				if (output instanceof Promise) return output.then((output) => {
					payload.value = output;
					return payload;
				});
				payload.value = output;
				return payload;
			};
		});
		function transform(fn) {
			return new ZodTransform({
				type: "transform",
				transform: fn
			});
		}
		const ZodOptional = /*@__PURE__*/ $constructor("ZodOptional", (inst, def) => {
			$ZodOptional.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => optionalProcessor(inst, ctx, json, params);
			inst.unwrap = () => inst._zod.def.innerType;
		});
		function optional(innerType) {
			return new ZodOptional({
				type: "optional",
				innerType
			});
		}
		const ZodExactOptional = /*@__PURE__*/ $constructor("ZodExactOptional", (inst, def) => {
			$ZodExactOptional.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => optionalProcessor(inst, ctx, json, params);
			inst.unwrap = () => inst._zod.def.innerType;
		});
		function exactOptional(innerType) {
			return new ZodExactOptional({
				type: "optional",
				innerType
			});
		}
		const ZodNullable = /*@__PURE__*/ $constructor("ZodNullable", (inst, def) => {
			$ZodNullable.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => nullableProcessor(inst, ctx, json, params);
			inst.unwrap = () => inst._zod.def.innerType;
		});
		function nullable(innerType) {
			return new ZodNullable({
				type: "nullable",
				innerType
			});
		}
		const ZodDefault = /*@__PURE__*/ $constructor("ZodDefault", (inst, def) => {
			$ZodDefault.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => defaultProcessor(inst, ctx, json, params);
			inst.unwrap = () => inst._zod.def.innerType;
			inst.removeDefault = inst.unwrap;
		});
		function _default(innerType, defaultValue) {
			return new ZodDefault({
				type: "default",
				innerType,
				get defaultValue() {
					return typeof defaultValue === "function" ? defaultValue() : shallowClone(defaultValue);
				}
			});
		}
		const ZodPrefault = /*@__PURE__*/ $constructor("ZodPrefault", (inst, def) => {
			$ZodPrefault.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => prefaultProcessor(inst, ctx, json, params);
			inst.unwrap = () => inst._zod.def.innerType;
		});
		function prefault(innerType, defaultValue) {
			return new ZodPrefault({
				type: "prefault",
				innerType,
				get defaultValue() {
					return typeof defaultValue === "function" ? defaultValue() : shallowClone(defaultValue);
				}
			});
		}
		const ZodNonOptional = /*@__PURE__*/ $constructor("ZodNonOptional", (inst, def) => {
			$ZodNonOptional.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => nonoptionalProcessor(inst, ctx, json, params);
			inst.unwrap = () => inst._zod.def.innerType;
		});
		function nonoptional(innerType, params) {
			return new ZodNonOptional({
				type: "nonoptional",
				innerType,
				...normalizeParams(params)
			});
		}
		const ZodCatch = /*@__PURE__*/ $constructor("ZodCatch", (inst, def) => {
			$ZodCatch.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => catchProcessor(inst, ctx, json, params);
			inst.unwrap = () => inst._zod.def.innerType;
			inst.removeCatch = inst.unwrap;
		});
		function _catch(innerType, catchValue) {
			return new ZodCatch({
				type: "catch",
				innerType,
				catchValue: typeof catchValue === "function" ? catchValue : constantCatch(catchValue)
			});
		}
		const ZodPipe = /*@__PURE__*/ $constructor("ZodPipe", (inst, def) => {
			$ZodPipe.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => pipeProcessor(inst, ctx, json, params);
			inst.in = def.in;
			inst.out = def.out;
		});
		function pipe(in_, out) {
			return new ZodPipe({
				type: "pipe",
				in: in_,
				out
			});
		}
		const ZodReadonly = /*@__PURE__*/ $constructor("ZodReadonly", (inst, def) => {
			$ZodReadonly.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => readonlyProcessor(inst, ctx, json, params);
			inst.unwrap = () => inst._zod.def.innerType;
		});
		function readonly(innerType) {
			return new ZodReadonly({
				type: "readonly",
				innerType
			});
		}
		const ZodCustom = /*@__PURE__*/ $constructor("ZodCustom", (inst, def) => {
			$ZodCustom.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => customProcessor(inst, ctx, json, params);
		});
		function refine(fn, _params = {}) {
			return /* @__PURE__ */ _refine(ZodCustom, fn, _params);
		}
		function superRefine(fn, params) {
			return /* @__PURE__ */ _superRefine(fn, params);
		}
		//#endregion
		//#region src/client/remote.ts
		const pkg = "@eduwork/dsh-knowledge-studio";
		const source = {
			file: "lib/index.js",
			line: 1,
			column: 1
		};
		const codec = (typeSymbol, schema = unknown$1()) => ({
			mode: "strict",
			create: () => schema,
			typeSymbol: `${pkg}#${typeSymbol}`,
			schema
		});
		const parameter = (name, schema = string()) => ({
			name,
			wire: name,
			source: "json",
			codec: codec(name, schema)
		});
		const descriptor = (method, parameters = []) => ({
			id: `${pkg}#knowledgeStudio/${method}`,
			service: "knowledgeStudio",
			namespace: "knowledgeStudio",
			method,
			invocation: { kind: "direct" },
			parameters,
			result: codec("Result"),
			sourceLocation: source
		});
		const p = parameter;
		const unknown = (name) => parameter(name, unknown$1());
		const knowledgeStudioRemote = {
			package: pkg,
			descriptors: [
				descriptor("readUIPreferences"),
				descriptor("setUIOpenPreference", [p("open", boolean())]),
				descriptor("workspaceForPath", [p("path")]),
				descriptor("workspaceStatus", [p("workspaceId")]),
				descriptor("listCapabilities"),
				descriptor("readEvidence", [p("workspaceId"), p("evidenceId")]),
				descriptor("invokeStudio", [
					p("workspaceId"),
					p("capabilityId"),
					unknown("parameters"),
					p("sessionId")
				]),
				descriptor("listArtifacts", [p("workspaceId")]),
				descriptor("readArtifact", [p("artifactId")]),
				descriptor("updateArtifactInteraction", [
					p("artifactId"),
					p("action"),
					p("itemId"),
					unknown("value")
				]),
				descriptor("artifactAskPrompt", [p("artifactId"), p("itemId")]),
				descriptor("manageArtifact", [
					p("artifactId"),
					p("action"),
					p("value"),
					p("sessionId")
				]),
				descriptor("exportArtifact", [p("artifactId"), p("format")])
			]
		};
		//#endregion
		//#region lib/mindmap.js
		const MINDMAP_FONT = "\"Microsoft YaHei\", \"PingFang SC\", \"Noto Sans CJK SC\", sans-serif";
		const colors$1 = [
			"#447d89",
			"#70619b",
			"#a36b38",
			"#4b8061",
			"#a25c78",
			"#5272a0"
		];
		/** Read legacy forests without mutating stored nodes, citations or parent IDs. */
		function mindmapTree(content) {
			const input = Array.isArray(content?.nodes) ? content.nodes : [];
			const used = /* @__PURE__ */ new Set(), nodes = input.map((source, index) => {
				let id = String(source.id || `node-${index + 1}`);
				while (used.has(id)) id += "-copy";
				used.add(id);
				return {
					...source,
					id,
					label: String(source.label || source.heading || "未命名节点"),
					body: String(source.body || ""),
					children: [],
					parentId: String(source.parentId || "")
				};
			});
			const byId = new Map(nodes.map((node) => [node.id, node]));
			for (const node of nodes) {
				const seen = /* @__PURE__ */ new Set([node.id]);
				let parent = node.parentId;
				while (parent) {
					if (!byId.has(parent) || seen.has(parent)) {
						node.parentId = "";
						break;
					}
					seen.add(parent);
					parent = byId.get(parent).parentId;
				}
			}
			for (const node of nodes) if (node.parentId) byId.get(node.parentId).children.push(node);
			return {
				nodes,
				roots: nodes.filter((node) => !node.parentId),
				byId
			};
		}
		function wrapLabel(label, budget) {
			const lines = [];
			let line = "", width = 0;
			for (const char of String(label)) {
				if (char === "\n") {
					lines.push(line);
					line = "";
					width = 0;
					continue;
				}
				const size = /[\u0020-\u007e]/u.test(char) ? .6 : 1;
				if (width + size > budget && line) {
					lines.push(line.trimEnd());
					line = "";
					width = 0;
				}
				line += char;
				width += size;
			}
			if (line || !lines.length) lines.push(line.trimEnd());
			return lines;
		}
		function layoutMindmap(content, { collapsed = [] } = {}) {
			const tree = mindmapTree(content), hidden = new Set(collapsed);
			let virtualId = "__studio_root__";
			while (tree.byId.has(virtualId)) virtualId += "_";
			const root = tree.roots.length === 1 ? tree.roots[0] : {
				id: virtualId,
				label: content?.title || "思维导图",
				body: "",
				children: tree.roots,
				parentId: "",
				virtual: true
			};
			const prepare = (node, depth = 0, color = "#344d60") => {
				const fontSize = depth === 0 ? 18 : 14, width = depth === 0 ? 232 : 220;
				const lines = wrapLabel(node.label, Math.floor((width - 28) / fontSize));
				const children = hidden.has(node.id) ? [] : node.children.map((child) => prepare(child, depth + 1, color));
				const height = Math.max(48, lines.length * (fontSize + 6) + 24);
				return {
					...node,
					children,
					depth,
					color,
					width,
					height,
					fontSize,
					lines,
					childCount: node.children.length,
					collapsed: hidden.has(node.id),
					span: Math.max(height, children.reduce((sum, child) => sum + child.span, 0) + Math.max(0, children.length - 1) * 20)
				};
			};
			const prepared = prepare(root), nodes = [], edges = [];
			const place = (node, x, y, direction, color) => {
				const placed = {
					...node,
					x,
					y,
					color
				};
				nodes.push(placed);
				let cursor = y - (node.children.reduce((sum, child) => sum + child.span, 0) + Math.max(0, node.children.length - 1) * 20) / 2;
				for (const child of node.children) {
					const cx = x + direction * (node.width / 2 + 72 + child.width / 2), cy = cursor + child.span / 2;
					edges.push({
						parentId: node.id,
						childId: child.id,
						color,
						from: {
							x: x + direction * node.width / 2,
							y
						},
						to: {
							x: cx - direction * child.width / 2,
							y: cy
						}
					});
					place(child, cx, cy, direction, color);
					cursor += child.span + 20;
				}
			};
			nodes.push({
				...prepared,
				x: 0,
				y: 0,
				color: "#344d60"
			});
			const sides = [[], []], heights = [0, 0];
			prepared.children.forEach((node, index) => {
				const side = heights[0] <= heights[1] ? 0 : 1;
				sides[side].push({
					...node,
					color: colors$1[index % colors$1.length]
				});
				heights[side] += node.span + 20;
			});
			sides.forEach((children, side) => {
				const direction = side === 0 ? 1 : -1;
				let cursor = -(heights[side] - 20) / 2;
				for (const child of children) {
					const x = direction * (prepared.width / 2 + 72 + child.width / 2), y = cursor + child.span / 2;
					edges.push({
						parentId: prepared.id,
						childId: child.id,
						color: child.color,
						from: {
							x: direction * prepared.width / 2,
							y: 0
						},
						to: {
							x: x - direction * child.width / 2,
							y
						}
					});
					place(child, x, y, direction, child.color);
					cursor += child.span + 20;
				}
			});
			const minX = Math.min(...nodes.map((n) => n.x - n.width / 2)) - 40, minY = Math.min(...nodes.map((n) => n.y - n.height / 2)) - 40;
			const width = Math.ceil(Math.max(...nodes.map((n) => n.x + n.width / 2)) - minX + 40), height = Math.ceil(Math.max(...nodes.map((n) => n.y + n.height / 2)) - minY + 40);
			for (const node of nodes) {
				node.x -= minX + node.width / 2;
				node.y -= minY + node.height / 2;
			}
			for (const edge of edges) {
				const a = {
					x: edge.from.x - minX,
					y: edge.from.y - minY
				}, b = {
					x: edge.to.x - minX,
					y: edge.to.y - minY
				}, middle = (a.x + b.x) / 2;
				edge.path = `M ${a.x} ${a.y} C ${middle} ${a.y}, ${middle} ${b.y}, ${b.x} ${b.y}`;
			}
			return {
				width,
				height,
				nodes,
				edges,
				rootId: prepared.id,
				total: tree.nodes.length
			};
		}
		function mindmapPNGSize(width, height) {
			const scale = Math.min(2, 8192 / width, 8192 / height, Math.sqrt(24e6 / (width * height)));
			return {
				width: Math.ceil(width * scale),
				height: Math.ceil(height * scale),
				scale
			};
		}
		//#endregion
		//#region src/client/MindMap.tsx
		const button$1 = {
			border: "1px solid var(--dsw-alias-border-l2, #d4dce1)",
			borderRadius: 7,
			background: "var(--dsw-alias-bg-base, #fff)",
			color: "var(--dsw-alias-state-business-primary, #344d60)",
			padding: "6px 9px",
			font: "inherit",
			fontSize: 12,
			cursor: "pointer",
			minHeight: 32
		};
		function MindMap({ artifact, showEvidence, askAI, expanded, expand, memory = {}, remember = () => {} }) {
			const content = artifact.content, signature = JSON.stringify(content);
			const [collapsed, setCollapsed] = (0, react.useState)(memory.collapsed || []), [selected, setSelected] = (0, react.useState)(memory.selected || ""), [mode, setMode] = (0, react.useState)(memory.mode || "map");
			const [camera, setCamera] = (0, react.useState)(memory.camera || {
				x: 0,
				y: 0,
				zoom: 1
			}), [size, setSize] = (0, react.useState)({
				width: 0,
				height: 0
			});
			const [error, setError] = (0, react.useState)("");
			const svg = (0, react.useRef)(null), container = (0, react.useRef)(null), restore = (0, react.useRef)(true), callbacks = (0, react.useRef)({
				remember,
				askAI,
				showEvidence
			});
			callbacks.current = {
				remember,
				askAI,
				showEvidence
			};
			const drag = (0, react.useRef)(null), suppress = (0, react.useRef)(false);
			const tree = (0, react.useMemo)(() => mindmapTree(content), [signature]);
			const layout = (0, react.useMemo)(() => layoutMindmap(content, { collapsed }), [signature, collapsed]);
			const selectedNode = tree.byId.get(selected);
			const focusId = layout.nodes.some((node) => node.id === selected) ? selected : layout.rootId;
			const fit = () => {
				const zoom = Math.max(.03, Math.min((size.width - 20) / layout.width, (size.height - 20) / layout.height, 1.2));
				return {
					zoom,
					x: (size.width - layout.width * zoom) / 2,
					y: (size.height - layout.height * zoom) / 2
				};
			};
			(0, react.useLayoutEffect)(() => {
				const element = container.current;
				if (!element) return;
				const measure = () => {
					const box = element.getBoundingClientRect();
					setSize((previous) => previous.width === box.width && previous.height === box.height ? previous : {
						width: box.width,
						height: box.height
					});
				};
				measure();
				const observer = new ResizeObserver(measure);
				observer.observe(element);
				return () => observer.disconnect();
			}, [mode]);
			(0, react.useEffect)(() => {
				if (!size.width || !size.height) return;
				if (restore.current && memory.camera && memory.width === size.width && memory.height === size.height) setCamera(memory.camera);
				else {
					const focus = layout.nodes.find((node) => node.id === focusId), zoom = Math.max(.8, Math.min(1, fit().zoom));
					setCamera({
						zoom,
						x: size.width / 2 - (focus.x + focus.width / 2) * zoom,
						y: size.height / 2 - (focus.y + focus.height / 2) * zoom
					});
				}
				restore.current = false;
			}, [layout, size]);
			(0, react.useEffect)(() => {
				if (size.width) callbacks.current.remember({
					selected,
					collapsed,
					mode,
					camera,
					width: size.width,
					height: size.height
				});
			}, [
				selected,
				collapsed,
				mode,
				camera,
				size
			]);
			const zoomAt = (factor, x = size.width / 2, y = size.height / 2) => setCamera((current) => {
				const zoom = Math.min(4, Math.max(.03, current.zoom * factor)), ratio = zoom / current.zoom;
				return {
					zoom,
					x: x - (x - current.x) * ratio,
					y: y - (y - current.y) * ratio
				};
			});
			(0, react.useEffect)(() => {
				const element = svg.current;
				if (!element) return;
				const wheel = (event) => {
					event.preventDefault();
					const box = element.getBoundingClientRect();
					zoomAt(event.deltaY < 0 ? 1.15 : 1 / 1.15, event.clientX - box.left, event.clientY - box.top);
				};
				element.addEventListener("wheel", wheel, { passive: false });
				return () => element.removeEventListener("wheel", wheel);
			}, [mode, size]);
			const toggle = (id) => setCollapsed((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id]);
			const choose = (id, focus = false) => {
				setSelected(id);
				if (focus) {
					const node = layout.nodes.find((node) => node.id === id);
					if (node) setCamera((current) => ({
						...current,
						x: size.width / 2 - (node.x + node.width / 2) * current.zoom,
						y: size.height / 2 - (node.y + node.height / 2) * current.zoom
					}));
					Array.from(svg.current?.querySelectorAll("[data-mindmap-node]") || []).find((node) => node.dataset.nodeId === id)?.focus({ preventScroll: true });
				}
			};
			const keyboard = (event, id) => {
				const node = tree.byId.get(id), index = layout.nodes.findIndex((item) => item.id === id);
				if (event.key === "Enter") {
					event.preventDefault();
					choose(id);
					return;
				}
				if (event.key === " ") {
					event.preventDefault();
					if (node?.children.length) toggle(id);
					return;
				}
				if (![
					"ArrowUp",
					"ArrowDown",
					"ArrowLeft",
					"ArrowRight",
					"Home"
				].includes(event.key)) return;
				event.preventDefault();
				if (event.key === "ArrowRight" && node?.children.length) {
					if (collapsed.includes(id)) toggle(id);
					else choose(node.children[0].id, true);
				} else if (event.key === "ArrowLeft" && node) {
					if (node.children.length && !collapsed.includes(id)) toggle(id);
					else if (node.parentId) choose(node.parentId, true);
				} else choose(event.key === "Home" ? layout.rootId : layout.nodes[Math.max(0, Math.min(layout.nodes.length - 1, index + (event.key === "ArrowUp" ? -1 : 1)))].id, true);
			};
			const run = async (fn) => {
				setError("");
				try {
					await fn();
				} catch (error) {
					setError(error.message || String(error));
				}
			};
			const outline = (node) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", {
				"data-outline-node": node.id,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
					style: {
						...button$1,
						border: 0,
						textAlign: "left",
						fontWeight: selected === node.id ? 700 : 400
					},
					"aria-pressed": selected === node.id,
					onClick: () => choose(node.id),
					children: node.label
				}), node.children.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", { children: node.children.map(outline) })]
			}, node.id);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				"data-mindmap-view": true,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						style: {
							display: "flex",
							gap: 6,
							flexWrap: "wrap",
							alignItems: "center",
							marginBottom: 10
						},
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								style: button$1,
								"aria-pressed": mode === "map",
								onClick: () => setMode("map"),
								children: "思维导图"
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								style: button$1,
								"aria-pressed": mode === "outline",
								onClick: () => setMode("outline"),
								children: "文字大纲"
							}),
							!expanded && expand && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								style: {
									...button$1,
									marginLeft: "auto"
								},
								onClick: expand,
								children: "展开阅读导图"
							})
						]
					}),
					mode === "map" ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							style: {
								display: "flex",
								gap: 6,
								flexWrap: "wrap",
								alignItems: "center",
								marginBottom: 8
							},
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									style: button$1,
									"aria-label": "缩小导图",
									onClick: () => zoomAt(1 / 1.25),
									children: "−"
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("output", {
									"aria-label": "导图缩放比例",
									style: {
										fontSize: 11,
										minWidth: 35,
										textAlign: "center"
									},
									children: [Math.round(camera.zoom * 100), "%"]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									style: button$1,
									"aria-label": "放大导图",
									onClick: () => zoomAt(1.25),
									children: "+"
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									style: button$1,
									onClick: () => setCamera(fit()),
									children: "适应视图"
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									style: button$1,
									onClick: () => setCollapsed([]),
									children: "展开全部"
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									style: button$1,
									onClick: () => {
										setCollapsed(tree.nodes.filter((node) => node.parentId && node.children.length).map((node) => node.id));
										setSelected("");
									},
									children: "收起分支"
								})
							]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							ref: container,
							style: {
								height: "clamp(300px,52vh,640px)",
								minWidth: 0,
								border: "1px solid var(--dsw-alias-border-l2,#dce3e8)",
								borderRadius: 10,
								overflow: "hidden",
								background: "var(--dsw-alias-bg-base,#fff)"
							},
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
								ref: svg,
								"data-mindmap-canvas": true,
								"data-zoom": camera.zoom,
								"data-pan-x": camera.x,
								"data-pan-y": camera.y,
								"data-visible-nodes": layout.nodes.length,
								"data-total-nodes": layout.total,
								role: "group",
								"aria-label": `${artifact.title}，思维导图。点击节点查看详情；方向键选择节点，空格折叠分支。`,
								viewBox: `0 0 ${size.width || 1} ${size.height || 1}`,
								style: {
									width: "100%",
									height: "100%",
									display: "block",
									touchAction: "none",
									cursor: "grab"
								},
								onPointerDown: (event) => {
									if (event.button !== 0) return;
									suppress.current = false;
									drag.current = {
										x: event.clientX,
										y: event.clientY,
										camera,
										pointer: event.pointerId,
										moved: false
									};
								},
								onPointerMove: (event) => {
									const start = drag.current;
									if (!start || event.pointerId !== start.pointer) return;
									const dx = event.clientX - start.x, dy = event.clientY - start.y;
									if (!start.moved && Math.hypot(dx, dy) < 4) return;
									start.moved = true;
									suppress.current = true;
									event.currentTarget.setPointerCapture(event.pointerId);
									setCamera({
										...start.camera,
										x: start.camera.x + dx,
										y: start.camera.y + dy
									});
								},
								onPointerUp: (event) => {
									if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
									drag.current = null;
								},
								onPointerCancel: () => {
									drag.current = null;
								},
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("g", {
									transform: `translate(${camera.x} ${camera.y}) scale(${camera.zoom})`,
									children: [layout.edges.map((edge) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
										"data-mindmap-edge": true,
										"data-parent-id": edge.parentId,
										"data-child-id": edge.childId,
										d: edge.path,
										stroke: "var(--dsw-alias-label-tertiary,#74818b)",
										strokeWidth: 2,
										fill: "none"
									}, edge.childId)), layout.nodes.map((node) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("g", {
										"data-mindmap-node": true,
										"data-node-id": node.id,
										"data-parent-id": node.parentId,
										role: "button",
										"aria-label": node.label,
										"aria-pressed": selected === node.id,
										"aria-expanded": node.childCount ? !node.collapsed : void 0,
										tabIndex: node.id === focusId ? 0 : -1,
										onClick: () => {
											if (!suppress.current) choose(node.id);
										},
										onDoubleClick: () => {
											if (node.childCount) toggle(node.id);
										},
										onKeyDown: (event) => keyboard(event, node.id),
										style: {
											cursor: "pointer",
											outlineOffset: 4
										},
										children: [
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("title", { children: node.label }),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("rect", {
												x: node.x,
												y: node.y,
												width: node.width,
												height: node.height,
												rx: 12,
												fill: node.depth === 0 ? "var(--dsw-alias-state-business-primary,#3777ba)" : selected === node.id ? "var(--dsw-alias-interactive-bg-active,#eaf2f7)" : "var(--dsw-alias-bg-layer-2,#f9fafb)",
												stroke: selected === node.id ? "var(--dsw-alias-state-business-primary,#3777ba)" : "var(--dsw-alias-border-l2,#74818b)",
												strokeWidth: selected === node.id ? 3 : 1.5
											}),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("text", {
												x: node.x + 14,
												y: node.y + 18 + node.fontSize,
												fill: node.depth === 0 ? "var(--dsw-alias-label-primary-inverted,#fff)" : "var(--dsw-alias-label-primary,#263642)",
												fontFamily: MINDMAP_FONT,
												fontSize: node.fontSize,
												fontWeight: node.depth < 2 ? 600 : 400,
												style: { userSelect: "none" },
												children: node.lines.map((line, index) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("tspan", {
													x: node.x + 14,
													dy: index ? node.fontSize + 6 : 0,
													children: line
												}, index))
											}),
											node.childCount > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("g", {
												"aria-hidden": "true",
												onClick: (event) => {
													event.stopPropagation();
													if (!suppress.current) toggle(node.id);
												},
												children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
													cx: node.x + node.width - 4,
													cy: node.y + node.height - 4,
													r: 10,
													fill: "var(--dsw-alias-bg-base,#fff)",
													stroke: "var(--dsw-alias-state-business-primary,#3777ba)"
												}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("text", {
													x: node.x + node.width - 4,
													y: node.y + node.height,
													textAnchor: "middle",
													fill: "var(--dsw-alias-state-business-primary,#3777ba)",
													fontSize: 14,
													children: node.collapsed ? "+" : "−"
												})]
											})
										]
									}, node.id))]
								})
							})
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("p", {
							style: {
								fontSize: 11,
								color: "var(--dsw-alias-label-secondary, #74818b)",
								margin: "7px 0"
							},
							children: [layout.total, " 个节点 · 拖动查看分支，滚轮缩放。“适应视图”查看全图概览；导出始终包含完整导图。"]
						})
					] }) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("nav", {
						"data-mindmap-outline": true,
						"aria-label": "思维导图文字大纲",
						style: {
							maxHeight: "60vh",
							overflow: "auto",
							background: "var(--dsw-alias-bg-layer-2, #f7f9fa)",
							borderRadius: 8,
							padding: 10
						},
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
							style: { paddingLeft: 16 },
							children: tree.roots.map(outline)
						})
					}),
					selectedNode ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
						"data-mindmap-node-detail": true,
						style: {
							border: "1px solid var(--dsw-alias-border-l2, #dce3e8)",
							borderRadius: 10,
							padding: 14,
							marginTop: 12,
							overflowWrap: "anywhere"
						},
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								style: {
									display: "flex",
									alignItems: "start",
									gap: 8
								},
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", {
									style: { flex: 1 },
									children: selectedNode.label
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									style: button$1,
									"aria-label": "关闭节点详情",
									onClick: () => setSelected(""),
									children: "×"
								})]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Markdown, {
								remarkPlugins: [remarkGfm],
								components: { img: () => null },
								children: selectedNode.body || "此节点暂无补充说明。"
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								style: {
									display: "flex",
									gap: 6,
									flexWrap: "wrap"
								},
								children: [selectedNode.children.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									style: button$1,
									onClick: () => toggle(selectedNode.id),
									children: collapsed.includes(selectedNode.id) ? "展开子节点" : "收起子节点"
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									style: button$1,
									onClick: () => void run(() => callbacks.current.askAI(selectedNode.id)),
									children: "围绕此节点提问"
								})]
							}),
							selectedNode.evidenceIds?.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								style: {
									marginTop: 12,
									fontSize: 12
								},
								children: ["节点来源", selectedNode.evidenceIds.map((id) => {
									const citation = artifact.citations?.find((item) => item.evidenceId === id);
									return citation ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
										style: {
											...button$1,
											display: "block",
											marginTop: 6,
											textAlign: "left",
											maxWidth: "100%",
											overflowWrap: "anywhere"
										},
										onClick: () => void run(() => callbacks.current.showEvidence(citation)),
										children: [
											citation.path,
											" · ",
											citation.locator === "page" ? "P" + citation.pageStart : "L" + citation.lineStart,
											citation.fresh === false ? " · 原文已变化" : ""
										]
									}, id) : null;
								})]
							})
						]
					}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						style: {
							fontSize: 12,
							color: "var(--dsw-alias-label-secondary, #74818b)"
						},
						children: "选择一个节点，查看正文、来源或继续提问。"
					}),
					error && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						role: "alert",
						style: { color: "var(--dsw-alias-state-error-primary, #a02932)" },
						children: error
					})
				]
			});
		}
		//#endregion
		//#region src/client/mindmap-export.ts
		/** Rasterize the full exported SVG, never the interactive viewport. */
		async function mindmapPNG(svg) {
			await document.fonts.ready;
			const url = URL.createObjectURL(svg);
			try {
				const image = new Image();
				await new Promise((resolve, reject) => {
					image.onload = () => resolve();
					image.onerror = () => reject(/* @__PURE__ */ new Error("无法读取思维导图 SVG，请重试或下载 SVG。"));
					image.src = url;
				});
				const size = mindmapPNGSize(image.naturalWidth, image.naturalHeight);
				const canvas = document.createElement("canvas");
				canvas.width = size.width;
				canvas.height = size.height;
				const context = canvas.getContext("2d");
				if (!context) throw new Error("浏览器无法创建导出画布，请下载 SVG。");
				context.fillStyle = "#ffffff";
				context.fillRect(0, 0, canvas.width, canvas.height);
				context.drawImage(image, 0, 0, canvas.width, canvas.height);
				return await new Promise((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(/* @__PURE__ */ new Error("PNG 导出失败，请下载 SVG。")), "image/png"));
			} finally {
				URL.revokeObjectURL(url);
			}
		}
		Object.freeze({
			version: 1,
			maximumValueCharacters: 24,
			minimumValueFontPoints: 12,
			minimumItems: 2,
			maximumItems: 4
		});
		JSON.stringify({
			title: "演示标题",
			slides: [
				{
					layout: "cover",
					title: "封面标题",
					subtitle: "简短副标题",
					notes: "完整讲稿",
					evidenceIds: ["S1"]
				},
				{
					layout: "two-column",
					title: "两方面比较",
					left: {
						heading: "方面一",
						bullets: ["要点"]
					},
					right: {
						heading: "方面二",
						bullets: ["要点"]
					},
					notes: "讲稿",
					evidenceIds: ["S1"]
				},
				{
					layout: "metrics",
					title: "关键指标",
					metrics: [{
						value: "真实数值",
						label: "指标名",
						detail: "口径"
					}, {
						value: "真实数值",
						label: "指标名",
						detail: "口径"
					}],
					notes: "讲稿",
					evidenceIds: ["S1"]
				},
				{
					layout: "timeline",
					title: "演进过程",
					events: [
						{
							period: "时间",
							title: "事件",
							detail: "说明"
						},
						{
							period: "时间",
							title: "事件",
							detail: "说明"
						},
						{
							period: "时间",
							title: "事件",
							detail: "说明"
						}
					],
					notes: "讲稿",
					evidenceIds: ["S1"]
				},
				{
					layout: "feature-grid",
					title: "主题组成",
					items: [
						{
							title: "主题一",
							detail: "说明"
						},
						{
							title: "主题二",
							detail: "说明"
						},
						{
							title: "主题三",
							detail: "说明"
						}
					],
					notes: "讲稿",
					evidenceIds: ["S1"]
				},
				{
					layout: "roadmap",
					title: "实施步骤",
					stages: [
						{
							stage: "阶段一",
							title: "行动",
							detail: "结果"
						},
						{
							stage: "阶段二",
							title: "行动",
							detail: "结果"
						},
						{
							stage: "阶段三",
							title: "行动",
							detail: "结果"
						}
					],
					notes: "讲稿",
					evidenceIds: ["S1"]
				},
				{
					layout: "bullets",
					title: "核心结论",
					bullets: ["简短要点"],
					notes: "讲稿",
					evidenceIds: ["S1"]
				},
				{
					layout: "closing",
					title: "下一步",
					subtitle: "核心行动",
					notes: "讲稿",
					evidenceIds: ["S1"]
				}
			]
		});
		/** Text-only companion to the file preview, preserving semantic fields. */
		function slideOutline(slide) {
			const bullet = (value) => typeof value === "string" ? value : value.text;
			return [
				slide.subtitle,
				slide.meta,
				slide.kicker,
				...(slide.bullets || []).map(bullet),
				...[slide.left, slide.right].filter(Boolean).map((column) => [column.heading, ...(column.bullets || []).map(bullet)].join("：")),
				...(slide.metrics || []).map((metric) => [
					metric.value,
					metric.label,
					metric.detail
				].filter(Boolean).join(" · ")),
				...(slide.events || []).map((event) => [
					event.period,
					event.title,
					event.detail
				].filter(Boolean).join(" · ")),
				...(slide.items || []).map((item) => [item.title, item.detail].filter(Boolean).join("：")),
				...(slide.stages || []).map((stage) => [
					stage.stage,
					stage.title,
					stage.detail
				].filter(Boolean).join(" · ")),
				slide.quote,
				slide.attribution,
				slide.note,
				slide.contact
			].filter(Boolean);
		}
		//#endregion
		//#region packages/artifact-services/lib/office-preview-client.js
		const STORE = Symbol.for("@eduwork/office-preview/view-state/v1");
		const EVENT = "eduwork-office-preview-state-v1";
		const STORAGE = "eduwork.office-preview.v1:";
		const LIMIT = 80;
		const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
		const css = `
:host{display:block;height:100%;min-height:260px;color:var(--dsw-alias-label-primary,#27303b);font:12px/1.4 system-ui,sans-serif}
*{box-sizing:border-box}.viewer{height:100%;display:flex;flex-direction:column;border:1px solid var(--dsw-alias-border-l2,#d8dde3);border-radius:8px;overflow:hidden;background:var(--dsw-alias-bg-layer-2,#eef0f4)}
.toolbar{display:flex;align-items:center;flex-wrap:wrap;gap:5px;padding:8px;background:var(--dsw-alias-bg-base,#fff);border-bottom:1px solid var(--dsw-alias-border-l2,#d8dde3);flex:none}
button,select,input{font:inherit;color:inherit;background:var(--dsw-alias-bg-base,#fff);border:1px solid var(--dsw-alias-border-l2,#ccd2d9);border-radius:5px;height:29px;padding:3px 7px;max-width:100%}
button{cursor:pointer}button:hover:enabled{background:var(--dsw-alias-interactive-bg-hover,#edf1f6)}button:disabled{opacity:.4;cursor:default}button:focus-visible,input:focus-visible,select:focus-visible,.viewport:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary,#3777ba);outline-offset:-2px}
.title{width:100%;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.page-number{width:49px;text-align:center;padding:3px}.page-count{white-space:nowrap}.expand{margin-left:auto}
.viewport{flex:1;min-height:0;min-width:0;overflow:auto;overscroll-behavior:contain;position:relative;padding:12px}
.stage{position:relative;margin:auto;flex:none;overflow:hidden;background:white;box-shadow:0 2px 10px #1f293722}.page-frame{display:block;position:absolute;top:0;left:0;border:0;transform-origin:0 0;background:white}
.warnings{flex:none;max-height:100px;overflow:auto;padding:6px 10px;background:var(--dsw-alias-bg-layer-2,#fff7e8);color:var(--dsw-alias-state-warn-label,#765324);font-size:11px}.warnings p{margin:3px 0}.error{padding:20px;color:var(--dsw-alias-state-error-primary,#9c2635);background:var(--dsw-alias-bg-base,#fff)}
`;
		function savedState(win, key, count) {
			let state = (win[STORE] || (win[STORE] = /* @__PURE__ */ new Map())).get(key);
			if (!state) try {
				state = JSON.parse(win.sessionStorage.getItem(STORAGE + key) || "null");
			} catch {}
			return normalizeState(state, count);
		}
		function normalizeState(state, count) {
			return {
				page: clamp(Math.trunc(Number(state?.page) || 1), 1, count),
				mode: [
					"fit-page",
					"fit-width",
					"manual"
				].includes(state?.mode) ? state.mode : "fit-page",
				scale: clamp(Number(state?.scale) || 1, .1, 4)
			};
		}
		function saveState(win, key, state) {
			const memory = win[STORE] || (win[STORE] = /* @__PURE__ */ new Map());
			memory.delete(key);
			memory.set(key, { ...state });
			while (memory.size > LIMIT) memory.delete(memory.keys().next().value);
			try {
				win.sessionStorage.setItem(STORAGE + key, JSON.stringify(state));
				const keys = [];
				for (let i = 0; i < win.sessionStorage.length; i++) {
					const item = win.sessionStorage.key(i);
					if (item?.startsWith(STORAGE)) keys.push(item);
				}
				while (keys.length > LIMIT) {
					const oldest = keys.shift();
					if (oldest !== STORAGE + key) win.sessionStorage.removeItem(oldest);
				}
			} catch {}
			win.dispatchEvent(new win.CustomEvent(EVENT, { detail: {
				key,
				state: { ...state }
			} }));
		}
		function readPages(doc, preview) {
			if (typeof preview?.html !== "string" || !preview.html.startsWith("<!doctype html>")) throw new Error("文件预览返回无效内容");
			const parsed = new doc.defaultView.DOMParser().parseFromString(preview.html, "text/html");
			parsed.querySelectorAll("script,iframe,object,embed,link,base,meta[http-equiv=\"refresh\"]").forEach((node) => node.remove());
			const policy = parsed.createElement("meta");
			policy.httpEquiv = "Content-Security-Policy";
			policy.content = "default-src 'none'; script-src 'none'; img-src data:; style-src 'unsafe-inline'; font-src data:; connect-src 'none'; frame-src 'none'; form-action 'none'; base-uri 'none'";
			parsed.head.prepend(policy);
			const main = parsed.querySelector("main.slides[data-slide-width][data-slide-height]");
			if (!main) return {
				fixed: false,
				pages: ["<!doctype html>" + parsed.documentElement.outerHTML],
				width: 900,
				height: 0
			};
			const width = Number(main.dataset.slideWidth), height = Number(main.dataset.slideHeight);
			const sections = [...main.querySelectorAll(":scope > section.slide-wrap")];
			const count = Number(main.dataset.slideCount);
			const declaredLimit = preview.description?.warnings?.some((warning) => warning.code === "page-limit");
			if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0 || width > 1e5 || height > 1e5 || !sections.length || !Number.isInteger(count) || sections.length > count || sections.length < count && !declaredLimit) throw new Error("文件预览的页面尺寸或页数不完整");
			const description = preview.description;
			if (description && (description.kind !== "slides" || description.pageCount !== count || Math.abs(description.pageWidth - width) > .01 || Math.abs(description.pageHeight - height) > .01)) throw new Error("预览描述与实际文件页面不一致");
			const style = parsed.createElement("style");
			style.textContent = `html,body{margin:0!important;padding:0!important;width:${width}px!important;height:${height}px!important;min-height:0!important;overflow:hidden!important}main.slides{display:block!important;margin:0!important;padding:0!important;width:${width}px!important;height:${height}px!important}main.slides>section.slide-wrap{margin:0!important;padding:0!important;width:${width}px!important;height:${height}px!important;max-width:none!important}.slide-label,.preview-meta,[data-office-warning]{display:none!important}`;
			parsed.head.append(style);
			parsed.body.replaceChildren(main);
			return {
				fixed: true,
				pages: sections,
				width,
				height,
				total: count,
				pageHTML(index) {
					main.replaceChildren(sections[index]);
					return "<!doctype html>" + parsed.documentElement.outerHTML;
				}
			};
		}
		/** Mount the same isolated file viewer in Studio or a conversation attachment. */
		function mountOfficePreview(container, initialOptions) {
			const doc = container.ownerDocument, win = doc.defaultView;
			let options = { ...initialOptions }, source, state, key, scale = 1, destroyed = false, lastPage = -1;
			const host = doc.createElement("div");
			host.dataset.officePreviewViewer = "";
			host.style.height = "100%";
			container.append(host);
			const root = host.attachShadow({ mode: "open" });
			const style = doc.createElement("style");
			style.textContent = css;
			root.append(style);
			const create = (tag, className, text) => {
				const element = doc.createElement(tag);
				if (className) element.className = className;
				if (text) element.textContent = text;
				return element;
			};
			const viewer = create("div", "viewer"), toolbar = create("div", "toolbar"), title = create("div", "title"), viewport = create("div", "viewport"), stage = create("div", "stage"), warnings = create("div", "warnings");
			toolbar.setAttribute("role", "toolbar");
			toolbar.setAttribute("aria-label", "文件预览工具栏");
			viewport.tabIndex = 0;
			viewport.setAttribute("aria-label", "文件页面");
			root.append(viewer);
			viewer.append(toolbar, viewport, warnings);
			viewport.append(stage);
			toolbar.append(title);
			const button = (text, label, action) => {
				const node = create("button", "", text);
				node.type = "button";
				node.setAttribute("aria-label", label);
				node.addEventListener("click", action);
				toolbar.append(node);
				return node;
			};
			const previous = button("‹", "上一页", () => change({ page: state.page - 1 }));
			const pageInput = create("input", "page-number");
			pageInput.type = "number";
			pageInput.min = "1";
			pageInput.setAttribute("aria-label", "当前页码");
			toolbar.append(pageInput);
			pageInput.addEventListener("change", () => change({ page: Number(pageInput.value) }));
			const count = create("span", "page-count");
			toolbar.append(count);
			const next = button("›", "下一页", () => change({ page: state.page + 1 }));
			const mode = create("select");
			mode.setAttribute("aria-label", "页面缩放模式");
			toolbar.append(mode);
			for (const [value, label] of [
				["fit-page", "适应页面"],
				["fit-width", "适应宽度"],
				["manual", "100%"]
			]) {
				const item = create("option", "", label);
				item.value = value;
				mode.append(item);
			}
			mode.addEventListener("change", () => change({
				mode: mode.value,
				scale: mode.value === "manual" ? scale : state.scale
			}));
			const minus = button("−", "缩小", () => change({
				mode: "manual",
				scale: scale / 1.2
			}));
			button("100%", "原始尺寸 100%", () => change({
				mode: "manual",
				scale: 1
			}));
			const plus = button("+", "放大", () => change({
				mode: "manual",
				scale: scale * 1.2
			}));
			const expand = button("展开阅读", "展开阅读", () => options.onExpand?.());
			expand.className = "expand";
			const frame = create("iframe", "page-frame");
			frame.setAttribute("sandbox", "");
			frame.setAttribute("referrerpolicy", "no-referrer");
			frame.dataset.officeFilePreview = "";
			stage.append(frame);
			function measure(entries) {
				if (destroyed || !source) return;
				const box = entries?.[0]?.contentRect, computed = box ? null : win.getComputedStyle(viewport);
				const width = Math.max(1, box?.width ?? (parseFloat(computed.width) || 0) - 24 - (viewport.offsetWidth - viewport.clientWidth));
				const height = Math.max(1, box?.height ?? (parseFloat(computed.height) || 0) - 24 - (viewport.offsetHeight - viewport.clientHeight));
				scale = state.mode === "manual" ? state.scale : !source.fixed ? Math.min(1, width / source.width) : state.mode === "fit-width" ? width / source.width : Math.min(width / source.width, height / source.height);
				scale = clamp(scale, .01, 8);
				const frameHeight = source.fixed ? source.height : height / scale;
				Object.assign(stage.style, {
					width: `${source.width * scale}px`,
					height: `${source.fixed ? frameHeight * scale : height}px`,
					marginTop: `${source.fixed ? Math.max(0, (height - frameHeight * scale) / 2) : 0}px`
				});
				Object.assign(frame.style, {
					width: `${source.width}px`,
					height: `${frameHeight}px`,
					transform: `scale(${scale})`
				});
				mode.options[2].textContent = `${Math.round(scale * 100)}%`;
				mode.value = state.mode;
				minus.disabled = scale <= .1;
				plus.disabled = scale >= 4;
				host.dataset.officeScale = String(scale);
				host.dataset.officeMode = state.mode;
			}
			function render() {
				title.textContent = options.title || "文件预览";
				frame.title = options.title || "Office 文件预览";
				expand.hidden = typeof options.onExpand !== "function";
				for (const item of [
					previous,
					pageInput,
					count,
					next
				]) item.hidden = !source.fixed;
				mode.options[0].textContent = source.fixed ? "适应页面" : "适应窗口";
				pageInput.value = String(state.page);
				pageInput.max = String(source.pages.length);
				count.textContent = `/ ${source.pages.length}${source.total > source.pages.length ? `（文件共 ${source.total} 页）` : ""}`;
				previous.disabled = state.page <= 1;
				next.disabled = state.page >= source.pages.length;
				host.dataset.officePage = String(state.page);
				host.dataset.officeCacheKey = key;
				host.dataset.officeSourceHash = options.preview.description?.sourceHash || "";
				if (lastPage !== state.page) {
					frame.srcdoc = source.fixed ? source.pageHTML(state.page - 1) : source.pages[0];
					lastPage = state.page;
					viewport.scrollTop = 0;
					viewport.scrollLeft = 0;
				}
				warnings.replaceChildren();
				for (const warning of options.preview.description?.warnings || []) {
					const text = create("p", "", warning.message);
					text.dataset.officeWarningCode = warning.code;
					warnings.append(text);
				}
				warnings.hidden = !warnings.childElementCount;
				measure();
			}
			function change(patch) {
				if (!source) return;
				state = normalizeState({
					...state,
					...patch
				}, source.pages.length);
				render();
				saveState(win, key, state);
				options.onStateChange?.({
					...state,
					scale
				});
			}
			function load() {
				source = readPages(doc, options.preview);
				key = options.preview.description?.cacheKey;
				if (typeof key !== "string" || !key) key = "legacy:" + Math.random().toString(36).slice(2);
				state = savedState(win, key, source.pages.length);
				lastPage = -1;
				render();
			}
			const receive = (event) => {
				if (event.detail?.key !== key) return;
				state = normalizeState(event.detail.state, source.pages.length);
				render();
			};
			win.addEventListener(EVENT, receive);
			viewport.addEventListener("keydown", (event) => {
				if (event.target !== viewport || !source?.fixed) return;
				if ([
					"ArrowRight",
					"PageDown",
					"ArrowLeft",
					"PageUp",
					"Home",
					"End"
				].includes(event.key)) {
					event.preventDefault();
					change({ page: event.key === "Home" ? 1 : event.key === "End" ? source.pages.length : state.page + (["ArrowRight", "PageDown"].includes(event.key) ? 1 : -1) });
				}
			});
			const observer = new win.ResizeObserver(measure);
			observer.observe(viewport);
			function report(error) {
				source = null;
				viewport.replaceChildren(create("div", "error", `文件已生成，但预览无法显示。${error.message || String(error)} 请打开或下载原文件。`));
				viewport.firstChild.setAttribute("role", "alert");
				toolbar.hidden = true;
				warnings.hidden = true;
				options.onError?.(error);
			}
			try {
				load();
			} catch (error) {
				report(error);
			}
			return {
				update(nextOptions) {
					if (destroyed) return;
					const old = options.preview;
					options = {
						...options,
						...nextOptions
					};
					try {
						if (options.preview !== old) {
							viewport.replaceChildren(stage);
							toolbar.hidden = false;
							load();
						} else if (source) render();
					} catch (error) {
						report(error);
					}
				},
				getState() {
					return state ? {
						...state,
						scale
					} : null;
				},
				destroy() {
					if (destroyed) return;
					destroyed = true;
					observer.disconnect();
					win.removeEventListener(EVENT, receive);
					frame.removeAttribute("srcdoc");
					host.remove();
				}
			};
		}
		//#endregion
		//#region lib/export-recovery.js
		const officeFormatFor = (kind) => ({
			report: "docx",
			slides: "pptx",
			table: "xlsx"
		})[kind];
		function isLegacyOfficeExportFailure(artifact) {
			if (artifact.exportState) return false;
			if (artifact.generation?.finishKind !== "stop" || artifact.status !== "failed") return false;
			if (!String(artifact.message || "").startsWith("office operation failed: ")) return false;
			try {
				const failure = JSON.parse(artifact.message.slice(25));
				return failure.ok === false && failure.operation === "create" && [
					"text_too_long",
					"invalid_metric",
					"metric_value_unreadable"
				].includes(failure.error?.code);
			} catch {
				return false;
			}
		}
		function canRetryOfficeExport(artifact) {
			return Boolean(artifact && !artifact.deletedAt && officeFormatFor(artifact.kind) && [
				"failed",
				"interrupted",
				"cancelled"
			].includes(artifact.status) && artifact.content && (artifact.exportState?.version === 1 && artifact.exportState.validatedContentHash && artifact.exportState.phase !== "complete" && !artifact.exportState.blocked && artifact.exportState.provider !== "office-tools" || isLegacyOfficeExportFailure(artifact)));
		}
		//#endregion
		//#region src/client/StudioArtifact.tsx
		const btn = {
			border: "1px solid var(--dsw-alias-border-l2, #ddd7d0)",
			background: "transparent",
			borderRadius: 7,
			padding: "6px 9px",
			font: "inherit",
			fontSize: 12,
			color: "inherit",
			cursor: "pointer"
		};
		const secondary = {
			borderTop: "1px solid var(--dsw-alias-border-l2, #e8e2da)",
			padding: "14px 0",
			marginTop: 12
		};
		const summaryStyle = {
			cursor: "pointer",
			color: "var(--dsw-alias-label-secondary, #6e655b)",
			fontSize: 12
		};
		const attemptStatus = {
			completed: "已生成（中间版本）",
			failed: "生成失败",
			cancelled: "已取消",
			killed: "已停止",
			interrupted: "已中断",
			queued: "等待生成",
			running: "生成中",
			stopping: "停止中"
		};
		const downloadFormats = {
			audio: [
				"wav",
				"md",
				"srt",
				"vtt"
			],
			video: [
				"mp4",
				"md",
				"srt",
				"vtt"
			],
			report: [
				"docx",
				"pdf",
				"md"
			],
			slides: [
				"pptx",
				"pdf",
				"md",
				"html"
			],
			table: ["xlsx", "csv"],
			mindmap: [
				"png",
				"svg",
				"md"
			],
			quiz: ["md", "pdf"],
			flashcards: ["md", "pdf"]
		};
		const textNames = {
			audio: "音频逐字稿",
			video: "视频分镜与旁白",
			report: "报告正文",
			slides: "幻灯片文字与讲稿",
			table: "表格内容",
			mindmap: "思维导图文字大纲",
			quiz: "测验题目与答案",
			flashcards: "抽认卡正反面"
		};
		function downloadLabel(kind, format) {
			if (format === "md") return `${textNames[kind] || "文稿"} MD`;
			if (format === "pdf") return `${{
				report: "报告",
				slides: "幻灯片",
				quiz: "测验题目与答案",
				flashcards: "抽认卡正反面"
			}[kind] || "文稿"} PDF`;
			return {
				wav: "音频 WAV",
				mp4: "视频 MP4",
				srt: "字幕 SRT",
				vtt: "网页字幕 VTT",
				docx: "报告 DOCX",
				pptx: "演示文稿 PPTX",
				xlsx: "数据表 XLSX",
				csv: "表格数据 CSV",
				png: "导图图片 PNG",
				svg: "导图矢量图 SVG",
				html: "网页预览 HTML"
			}[format] || format.toUpperCase();
		}
		const itemsOf = (c) => c?.sections ?? c?.nodes ?? c?.rows ?? c?.slides ?? c?.segments ?? c?.scenes ?? [];
		function fileBlob(result, format) {
			const bytes = Uint8Array.from(atob(result.data), (c) => c.charCodeAt(0));
			return new Blob([bytes], { type: {
				svg: "image/svg+xml;charset=utf-8",
				png: "image/png",
				md: "text/markdown;charset=utf-8",
				json: "application/json"
			}[format] || {
				poster: "image/jpeg",
				mp4: "video/mp4",
				wav: "audio/wav",
				docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
				pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
				xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
				pdf: "application/pdf"
			}[format] || "application/octet-stream" });
		}
		function MediaPreview({ id, format, exportFile }) {
			const [url, setURL] = (0, react.useState)(""), [poster, setPoster] = (0, react.useState)(""), [error, setError] = (0, react.useState)(""), [attempt, setAttempt] = (0, react.useState)(0);
			const exporter = (0, react.useRef)(exportFile);
			exporter.current = exportFile;
			(0, react.useEffect)(() => {
				let cancelled = false, objectURL = "", posterURL = "";
				setURL("");
				setPoster("");
				setError("");
				if (format === "mp4") exporter.current("poster").then((result) => {
					if (!cancelled) {
						posterURL = URL.createObjectURL(fileBlob(result, "poster"));
						setPoster(posterURL);
					}
				}).catch(() => {});
				(async () => {
					try {
						const result = await exporter.current(format);
						if (cancelled) return;
						objectURL = URL.createObjectURL(fileBlob(result, format));
						setURL(objectURL);
					} catch (e) {
						if (!cancelled) setError(e.message || String(e));
					}
				})();
				return () => {
					cancelled = true;
					if (objectURL) URL.revokeObjectURL(objectURL);
					if (posterURL) URL.revokeObjectURL(posterURL);
				};
			}, [
				id,
				format,
				attempt
			]);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				"data-studio-media-preview": true,
				style: { marginBottom: 20 },
				children: error ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					role: "alert",
					style: {
						padding: 24,
						background: "var(--dsw-alias-bg-layer-2, #f7f3ed)",
						borderRadius: 10
					},
					children: [
						"预览暂时不可用。",
						error,
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							style: btn,
							onClick: () => setAttempt((v) => v + 1),
							children: "重试预览"
						}) })
					]
				}) : !url ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					role: "status",
					style: {
						padding: 40,
						textAlign: "center",
						background: "var(--dsw-alias-bg-layer-2, #f3eee8)",
						borderRadius: 10
					},
					children: [
						"正在载入",
						format === "mp4" ? "视频" : "音频",
						"预览…"
					]
				}) : format === "mp4" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("video", {
					controls: true,
					preload: "auto",
					src: url,
					poster: poster || void 0,
					onError: () => setError("浏览器无法读取此视频，可下载文件查看。"),
					style: {
						width: "100%",
						maxHeight: "65vh",
						objectFit: "contain",
						display: "block",
						background: "#151515",
						borderRadius: 10
					}
				}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					style: {
						padding: 24,
						background: "var(--dsw-alias-bg-layer-2, #f2eef6)",
						borderRadius: 10
					},
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("audio", {
						controls: true,
						preload: "metadata",
						src: url,
						onError: () => setError("浏览器无法读取此音频，可下载文件收听。"),
						style: {
							width: "100%",
							display: "block"
						}
					})
				})
			});
		}
		function SavedFilePreview({ path, format, previewFile }) {
			const t = useStudioLocale();
			const [busy, setBusy] = (0, react.useState)(false), [error, setError] = (0, react.useState)("");
			const request = (0, react.useRef)(0);
			(0, react.useEffect)(() => {
				request.current++;
				setBusy(false);
				setError("");
				return () => {
					request.current++;
				};
			}, [path]);
			const open = async () => {
				const id = ++request.current;
				setBusy(true);
				setError("");
				try {
					await previewFile(path);
				} catch (error) {
					if (request.current === id) setError(error.message || String(error));
				} finally {
					if (request.current === id) setBusy(false);
				}
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				"data-studio-file-preview": true,
				"aria-busy": busy,
				style: {
					padding: 20,
					border: "1px solid var(--dsw-alias-border-l2)",
					borderRadius: 8
				},
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						style: btn,
						disabled: busy,
						onClick: () => void open(),
						children: busy ? t("openingPreview") : `${t("previewFile")} · ${format.toUpperCase()}`
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						style: {
							fontSize: 12,
							color: "var(--dsw-alias-label-secondary)"
						},
						children: t("previewFileHint")
					}),
					error && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						role: "alert",
						children: error
					})
				]
			});
		}
		function OfficeFilePreview({ artifact, exportFile, expanded, expand }) {
			const format = officeFormatFor(artifact.kind), label = format?.toUpperCase(), savedFile = artifact.exports?.find((file) => file.format === format)?.path;
			const [preview, setPreview] = (0, react.useState)(null), [error, setError] = (0, react.useState)(""), [attempt, setAttempt] = (0, react.useState)(0);
			const container = (0, react.useRef)(null), viewer = (0, react.useRef)(null);
			const exporter = (0, react.useRef)(exportFile);
			exporter.current = exportFile;
			(0, react.useEffect)(() => {
				let cancelled = false;
				setPreview(null);
				setError("");
				(async () => {
					try {
						const result = await exporter.current("preview");
						if (!cancelled) setPreview(result);
					} catch (error) {
						if (!cancelled) setError(error.message || String(error));
					}
				})();
				return () => {
					cancelled = true;
				};
			}, [
				artifact.id,
				artifact.status,
				savedFile,
				attempt
			]);
			(0, react.useEffect)(() => {
				if (!preview || !container.current) return;
				viewer.current = mountOfficePreview(container.current, {
					preview,
					title: `${label} 文件预览`,
					onExpand: expanded ? void 0 : expand
				});
				return () => {
					viewer.current?.destroy();
					viewer.current = null;
				};
			}, [preview]);
			(0, react.useEffect)(() => {
				viewer.current?.update({ onExpand: expanded ? void 0 : expand });
			}, [expanded, expand]);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				"data-studio-office-preview": true,
				children: [error ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					role: "alert",
					children: [
						error,
						savedFile && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: "可使用上方下载按钮读取原文件。" }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							style: btn,
							onClick: () => setAttempt((value) => value + 1),
							children: "重试预览"
						}) })
					]
				}) : preview ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					ref: container,
					style: {
						height: "65vh",
						minHeight: 300
					}
				}) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("p", {
					role: "status",
					children: [
						"正在读取 ",
						label,
						" 文件预览…"
					]
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("p", {
					style: {
						fontSize: 11,
						color: "var(--dsw-alias-label-secondary, #80766b)"
					},
					children: [
						"预览读取已生成的 ",
						label,
						" 文件；复杂排版请在 Office 或 WPS 中查看。"
					]
				})]
			});
		}
		function SlideNotes({ artifact }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(react_jsx_runtime.Fragment, { children: artifact.kind === "slides" && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("details", {
				style: secondary,
				"data-studio-slide-notes": true,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("summary", {
					style: summaryStyle,
					children: [
						"讲稿与文字大纲 · ",
						artifact.content?.slides?.length,
						" 页"
					]
				}), artifact.content?.slides?.map((slide, index) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("article", {
					style: { padding: "12px 0" },
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("h3", { children: [
							"第 ",
							index + 1,
							" 页",
							(slide.title || slide.heading || slide.quote) && ` · ${slide.title || slide.heading || slide.quote}`
						] }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", { children: slideOutline(slide).map((text, index) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("li", { children: text }, index)) }),
						(slide.notes || slide.speaker_notes) && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
							style: { whiteSpace: "pre-wrap" },
							children: slide.notes || slide.speaker_notes
						})
					]
				}, slide.id || index))]
			}) });
		}
		function StudioArtifact({ artifact, back, close, manage, exportFile, previewFile, askAI, showEvidence, expanded, expand, memory, remember, children }) {
			if (!artifact) return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				style: { padding: 20 },
				children: ["正在读取成果… ", /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
					style: btn,
					onClick: back,
					children: "返回"
				})]
			});
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ArtifactView, {
				artifact,
				back,
				close,
				manage,
				exportFile,
				previewFile,
				askAI,
				showEvidence,
				expanded,
				expand,
				memory,
				remember,
				children
			}, artifact.id);
		}
		function ArtifactView({ artifact, back, close, manage, exportFile, previewFile, askAI, showEvidence, expanded, expand, memory, remember, children }) {
			const [error, setError] = (0, react.useState)(""), [busy, setBusy] = (0, react.useState)(false), [rename, setRename] = (0, react.useState)(false), [title, setTitle] = (0, react.useState)(""), [remove, setRemove] = (0, react.useState)(false), [actions, setActions] = (0, react.useState)(false);
			const [download, setDownload] = (0, react.useState)(null);
			const identity = JSON.stringify([
				artifact.id,
				artifact.version ?? 0,
				(artifact.exports ?? []).map((file) => [file.format, file.path])
			]);
			const currentIdentity = (0, react.useRef)(identity);
			currentIdentity.current = identity;
			const mounted = (0, react.useRef)(true);
			(0, react.useEffect)(() => {
				mounted.current = true;
				return () => {
					mounted.current = false;
				};
			}, []);
			(0, react.useEffect)(() => () => {
				if (download) URL.revokeObjectURL(download.url);
			}, [download]);
			(0, react.useEffect)(() => {
				setDownload(null);
				setBusy(false);
				setError("");
			}, [identity]);
			const run = async (fn) => {
				const requestIdentity = currentIdentity.current;
				setBusy(true);
				setError("");
				try {
					await fn();
				} catch (e) {
					if (mounted.current && currentIdentity.current === requestIdentity) setError(e.message || String(e));
				} finally {
					if (mounted.current && currentIdentity.current === requestIdentity) setBusy(false);
				}
			};
			const active = ["queued", "running"].includes(artifact.status), content = artifact.content, primary = primaryFormats[artifact.kind], isMedia = ["audio", "video"].includes(artifact.kind);
			const retryExport = canRetryOfficeExport(artifact), hasPrimary = artifact.status === "completed" || artifact.exports?.some((file) => file.format === primary);
			const file = async (format) => {
				if (!format) return;
				const localPNG = artifact.kind === "mindmap" && format === "png";
				const result = await exportFile(localPNG ? "svg" : format);
				const blob = localPNG ? await mindmapPNG(fileBlob(result, "svg")) : fileBlob(result, format);
				if (!mounted.current || currentIdentity.current !== identity) return;
				const url = URL.createObjectURL(blob), name = localPNG ? result.fileName.replace(/\.svg$/i, ".png") : result.fileName;
				setDownload({
					url,
					name,
					format,
					identity
				});
				const link = document.createElement("a");
				link.href = url;
				link.download = name;
				document.body.appendChild(link);
				link.click();
				link.remove();
			};
			const formats = (downloadFormats[artifact.kind] || []).filter((format) => (!isMedia || format === "md" || artifact.exports?.some((file) => file.format === format)) && (!officeFormatFor(artifact.kind) || artifact.status === "completed" || ![
				"docx",
				"pptx",
				"xlsx",
				"html",
				"pdf"
			].includes(format)));
			const articles = itemsOf(content).map((item, index) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("article", {
				style: { padding: "8px 0 18px" },
				children: [
					(item.heading || isMedia) && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", {
						style: { fontSize: isMedia ? 14 : 18 },
						children: item.heading || (item.speaker ? `讲述者 ${item.speaker}` : `场景 ${index + 1}`)
					}),
					item.bullets && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", { children: item.bullets.map((b, i) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("li", { children: b }, i)) }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Markdown, {
						remarkPlugins: [remarkGfm],
						components: { img: () => null },
						children: item.body || item.text || item.narration || item.notes || ""
					})
				]
			}, item.id));
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
				"data-studio-artifact": artifact.kind,
				style: {
					height: "100%",
					minHeight: 0,
					display: "flex",
					flexDirection: "column",
					background: "var(--dsw-alias-bg-base, #fffdf9)",
					color: "var(--dsw-alias-label-primary, #302b28)"
				},
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", {
						style: {
							display: "flex",
							alignItems: "center",
							gap: 8,
							padding: 12,
							borderBottom: "1px solid var(--dsw-alias-border-l2, #e8e2da)"
						},
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								style: btn,
								"aria-label": "返回 Studio",
								onClick: back,
								children: "←"
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(StudioIcon, { kind: artifact.kind }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", {
								style: {
									fontSize: 14,
									flex: 1,
									overflow: "hidden",
									textOverflow: "ellipsis",
									whiteSpace: "nowrap"
								},
								children: artifact.title
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								style: btn,
								"aria-label": "关闭成果",
								onClick: close,
								children: "×"
							})
						]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						"data-studio-primary-actions": true,
						style: {
							display: "flex",
							gap: 6,
							padding: "10px 12px",
							flexWrap: "wrap",
							alignItems: "center",
							borderBottom: "1px solid var(--dsw-alias-border-l2, #eee)"
						},
						children: [
							content && primary && hasPrimary && (!isMedia || artifact.exports?.some((f) => f.format === primary)) && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
								"data-export-format": primary,
								style: {
									...btn,
									background: "var(--dsw-alias-state-business-primary, #344d60)",
									color: "var(--dsw-alias-label-primary-inverted, #fff)",
									borderColor: "var(--dsw-alias-state-business-primary, #344d60)",
									display: "inline-flex",
									alignItems: "center",
									gap: 6
								},
								disabled: busy || active,
								onClick: () => run(() => file(primary)),
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)(StudioIcon, {
										kind: artifact.kind,
										size: 15
									}),
									"下载 ",
									isMedia || artifact.kind === "mindmap" ? downloadLabel(artifact.kind, primary) : primary.toUpperCase()
								]
							}),
							retryExport && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								"data-studio-retry-export": true,
								style: {
									...btn,
									background: "var(--dsw-alias-state-business-primary, #344d60)",
									color: "var(--dsw-alias-label-primary-inverted, #fff)"
								},
								disabled: busy || active,
								onClick: () => run(() => manage("retry-export", "")),
								children: "重试导出"
							}),
							content && formats.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("select", {
								"data-studio-downloads": true,
								"aria-label": "下载成果",
								style: {
									...btn,
									maxWidth: "100%"
								},
								disabled: busy,
								value: "",
								onChange: (e) => run(() => file(e.target.value)),
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
									value: "",
									children: "下载…"
								}), formats.map((format) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
									value: format,
									children: downloadLabel(artifact.kind, format)
								}, format))]
							}),
							content && ![
								"quiz",
								"flashcards",
								"mindmap"
							].includes(artifact.kind) && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								style: btn,
								disabled: busy,
								onClick: () => run(() => askAI("")),
								children: "问问 AI"
							}),
							content && artifact.kind === "mindmap" && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								style: btn,
								"data-export-format": "md",
								disabled: busy || active,
								onClick: () => run(() => file("md")),
								children: "下载文字大纲 MD"
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								style: btn,
								"data-export-format": "svg",
								disabled: busy || active,
								onClick: () => run(() => file("svg")),
								children: "下载矢量图 SVG"
							})] }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								style: {
									...btn,
									marginLeft: "auto"
								},
								"aria-expanded": actions,
								disabled: busy,
								onClick: () => setActions(!actions),
								children: "更多操作"
							})
						]
					}),
					actions && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						style: {
							display: "flex",
							gap: 6,
							padding: "8px 12px",
							flexWrap: "wrap",
							background: "var(--dsw-alias-bg-layer-2, #f7f3ed)"
						},
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								style: btn,
								disabled: busy,
								onClick: () => {
									setTitle(artifact.title);
									setRename(!rename);
								},
								children: "重命名"
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								style: btn,
								disabled: busy,
								onClick: () => run(() => manage(active ? "cancel" : "retry", "")),
								children: active ? "取消生成" : "重新生成"
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								style: btn,
								disabled: busy,
								onClick: () => setRemove(!remove),
								children: "移除"
							})
						]
					}),
					download?.identity === identity && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						role: "status",
						style: {
							padding: "6px 12px",
							fontSize: 11,
							color: "var(--dsw-alias-label-secondary, #80766b)"
						},
						children: ["文件已准备 · ", /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("a", {
							style: { color: "var(--dsw-alias-state-business-primary, #344d60)" },
							href: download.url,
							download: download.name,
							children: ["保存 ", download.format.toUpperCase()]
						})]
					}),
					rename && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("form", {
						style: {
							display: "flex",
							padding: 12,
							gap: 6
						},
						onSubmit: (e) => {
							e.preventDefault();
							run(async () => {
								await manage("rename", title);
								setRename(false);
							});
						},
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
							"aria-label": "成果名称",
							value: title,
							onChange: (e) => setTitle(e.target.value),
							style: {
								minWidth: 0,
								flex: 1
							}
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							style: btn,
							children: "保存"
						})]
					}),
					remove && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						style: { padding: 12 },
						children: [
							"从成果列表移除？",
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								style: btn,
								onClick: () => run(() => manage("delete", "")),
								children: "移除"
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								style: btn,
								onClick: () => setRemove(false),
								children: "保留"
							})
						]
					}),
					error && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						role: "alert",
						style: {
							padding: "0 12px",
							color: "var(--dsw-alias-state-error-primary, #a02932)"
						},
						children: error
					}),
					active && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("p", {
						style: { padding: 16 },
						children: ["正在生成 · ", artifact.message || artifact.phase]
					}),
					artifact.exports?.find((f) => f.format === "pptx")?.pageCount && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("p", {
						"data-studio-file-pages": true,
						style: {
							padding: "0 16px",
							fontSize: 12
						},
						children: [
							"实际文件 · ",
							artifact.exports.find((f) => f.format === "pptx").pageCount,
							" 页",
							artifact.exports.find((f) => f.format === "pptx").adaptations?.length ? " · 已按内容自动换行或续页" : ""
						]
					}),
					artifact.status === "completed" && artifact.revisionWarning && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						"data-studio-revision-warning": true,
						role: "status",
						style: {
							margin: "8px 16px",
							padding: "10px 12px",
							border: "1px solid var(--dsw-alias-state-warn-primary, #decba9)",
							borderRadius: 7,
							background: "var(--dsw-alias-bg-layer-3, #fbf6e9)",
							color: "var(--dsw-alias-state-warn-label, #795b2f)",
							fontSize: 12,
							overflowWrap: "anywhere"
						},
						children: artifact.revisionWarning
					}),
					artifact.attempts?.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("details", {
						"data-studio-attempt-history": true,
						style: {
							padding: "8px 16px",
							fontSize: 12
						},
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("summary", { children: [
							"修改记录 · ",
							artifact.attempts.length,
							" 条"
						] }), artifact.attempts.map((attempt, index) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("p", {
							"data-studio-attempt-version": attempt.version,
							style: { overflowWrap: "anywhere" },
							children: [
								Number.isInteger(attempt.version) && attempt.version > 0 ? `第 ${attempt.version} 版` : "历史尝试",
								" · ",
								attemptStatus[attempt.status] || "未完成",
								attempt.message ? `：${attempt.message}` : ""
							]
						}, `${attempt.version ?? "legacy"}:${index}`))]
					}),
					!active && artifact.status !== "completed" && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						role: "alert",
						style: {
							padding: 16,
							color: "var(--dsw-alias-state-error-primary, #a02932)"
						},
						children: [
							artifact.status === "cancelled" ? "已取消。" : "生成未完成。",
							content ? "已保留生成的文本，可展开查看。" : "",
							artifact.message && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("details", {
								style: { marginTop: 8 },
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("summary", { children: "查看原因" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									style: {
										maxHeight: 140,
										overflow: "auto",
										overflowWrap: "anywhere",
										fontSize: 12
									},
									children: artifact.message
								})]
							})
						]
					}),
					retryExport && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						style: {
							padding: "0 16px",
							fontSize: 12
						},
						children: "正文已保存。重试导出会使用这份正文，不调用模型；“重新生成”会重新生成内容并消耗模型额度。"
					}),
					artifact.draft?.text && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("details", {
						"data-studio-draft": true,
						style: {
							padding: 14,
							borderBottom: "1px solid var(--dsw-alias-border-l2, #ddd)"
						},
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("summary", {
								style: summaryStyle,
								children: artifact.exportState?.validatedAt ? "生成原文 · 正文已校验" : retryExport ? "生成原文 · 导出未完成" : "未完成草稿 · 尚未校验"
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("p", {
								style: { fontSize: 12 },
								children: ["原始文本已保留，可下载查看。", artifact.draft.text.length > 1e4 ? "下方预览前 10000 字符，下载包含全部草稿。" : ""]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								style: btn,
								disabled: busy,
								onClick: () => run(() => file("draft")),
								children: "下载完整草稿"
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("pre", {
								style: {
									maxHeight: 240,
									overflow: "auto",
									whiteSpace: "pre-wrap",
									fontSize: 12
								},
								children: artifact.draft.text.slice(0, 1e4)
							})
						]
					}),
					["quiz", "flashcards"].includes(artifact.kind) ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						style: {
							flex: 1,
							minHeight: 0
						},
						children: artifact.status === "completed" ? children : null
					}) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						style: {
							overflow: "auto",
							padding: 18,
							flex: 1,
							fontSize: 13,
							lineHeight: 1.7
						},
						children: [
							isMedia && artifact.exports?.some((f) => f.format === primary) && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(MediaPreview, {
								id: `${artifact.id}:${artifact.version ?? 0}:${artifact.exports.find((f) => f.format === primary).path ?? ""}`,
								format: primary,
								exportFile
							}),
							isMedia && content ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("details", {
								style: secondary,
								"data-studio-script": true,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("summary", {
									style: summaryStyle,
									children: [
										artifact.kind === "video" ? "分镜与旁白" : "逐字稿",
										" · ",
										itemsOf(content).length,
										" ",
										artifact.kind === "video" ? "个场景" : "段"
									]
								}), articles]
							}) : officeFormatFor(artifact.kind) && artifact.exports?.some((file) => file.format === officeFormatFor(artifact.kind)) ? previewFile ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(SavedFilePreview, {
								path: artifact.exports.find((file) => file.format === officeFormatFor(artifact.kind)).path,
								format: officeFormatFor(artifact.kind),
								previewFile
							}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(OfficeFilePreview, {
								artifact,
								exportFile,
								expanded,
								expand
							}) : artifact.kind === "mindmap" ? content && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(MindMap, {
								artifact,
								askAI,
								showEvidence,
								expanded,
								expand,
								memory,
								remember
							}) : artifact.kind === "table" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								style: { overflowX: "auto" },
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("table", {
									style: {
										borderCollapse: "collapse",
										width: "100%"
									},
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("tr", { children: content?.columns.map((c, i) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("th", {
										style: {
											padding: 10,
											borderBottom: "2px solid var(--dsw-alias-border-l2, #ccc)",
											textAlign: "left",
											background: "var(--dsw-alias-bg-layer-2, #edf3ef)"
										},
										children: c
									}, i)) }) }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("tbody", { children: content?.rows.map((row) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("tr", { children: row.cells.map((cell, i) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("td", {
										style: {
											padding: 10,
											borderBottom: "1px solid var(--dsw-alias-border-l2, #e8e2da)",
											minWidth: 90
										},
										children: cell
									}, i)) }, row.id)) })]
								})
							}) : articles,
							officeFormatFor(artifact.kind) && artifact.exports?.some((file) => file.format === officeFormatFor(artifact.kind)) && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(SlideNotes, { artifact }),
							content && artifact.citations?.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("details", {
								style: secondary,
								"data-studio-sources": true,
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("summary", {
										style: summaryStyle,
										children: [
											"参考来源 · ",
											new Set(artifact.citations?.map((c) => c.path)).size,
											" 份资料"
										]
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
										style: {
											fontSize: 11,
											color: "var(--dsw-alias-label-secondary, #80766b)"
										},
										children: artifact.sourceScope
									}),
									artifact.citations?.map((c, index) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										style: {
											padding: "10px 0",
											borderBottom: "1px solid var(--dsw-alias-border-l2, #eee)",
											overflowWrap: "anywhere"
										},
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
											style: {
												...btn,
												textAlign: "left",
												border: 0,
												padding: 0
											},
											onClick: () => showEvidence(c),
											children: [
												"[",
												index + 1,
												"] ",
												c.path,
												" · ",
												c.locator === "page" ? `第 ${c.pageStart} 页` : `第 ${c.lineStart} 行`,
												c.fresh === false ? " · 原文已变化" : ""
											]
										}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
											style: {
												fontSize: 11,
												color: "var(--dsw-alias-label-secondary, #80766b)",
												margin: "5px 0"
											},
											children: itemsOf(content).filter((item) => item.evidenceIds?.includes(c.evidenceId)).map((item) => item.title || item.heading || item.label || (artifact.kind === "table" ? `第 ${content.rows.indexOf(item) + 1} 行` : artifact.kind === "audio" ? `第 ${content.segments.indexOf(item) + 1} 段` : item.id)).join("、")
										})]
									}, c.evidenceId))
								]
							})
						]
					})
				]
			});
		}
		//#endregion
		//#region node_modules/@deepseek-ai/dsh-util-workspace-path/lib/index.js
		/**
		* The `dsh-resource://file/…` address grammar: how a file is named across the
		* Sidebar and the resource model, built and parsed without touching a
		* filesystem.
		* @module
		*/
		/** The scheme and type every file address opens with. */
		const FILE_ADDRESS_PREFIX = "dsh-resource://file/";
		/** Component-encode one id or path segment, keeping `:` literal for drive letters. */
		function encodeSegment(segment) {
			return encodeURIComponent(segment).replace(/%3A/gi, ":");
		}
		/** Encode a `/`-separated path segment by segment. */
		function encodePath(path) {
			return path.split("/").map(encodeSegment).join("/");
		}
		/**
		* Build the address of a file read through one Session.
		* @param sessionId - the Session whose Host workspace resolves the path.
		* @param path - absolute or workspace-relative path; backslashes are normalized to `/`, and leading `./` prefixes are dropped.
		* @returns the `dsh-resource://file/session/<sessionId>/<path>` address.
		*/
		function sessionFileAddress(sessionId, path) {
			const normalized = path.replace(/\\/g, "/").replace(/^(?:\.\/)+/, "");
			return `${FILE_ADDRESS_PREFIX}session/${encodeSegment(sessionId)}/${encodePath(normalized)}`;
		}
		//#endregion
		//#region src/client/file-preview.ts
		function openStudioFilePreview(sidebar, sessionId, path) {
			if (!sessionId || !path) throw new Error("A Session and a saved file are required for preview");
			return sidebar.openResource(sessionFileAddress(sessionId, path));
		}
		//#endregion
		//#region src/client/WorkspaceHome.tsx
		const b = {
			border: "1px solid var(--dsw-alias-border-l2, #ded7cf)",
			borderRadius: 8,
			background: "transparent",
			padding: "7px 10px",
			font: "inherit",
			fontSize: 12,
			color: "inherit",
			cursor: "pointer"
		};
		function WorkspaceHome({ workspace, error, refresh, invoke, openArtifact, close, scrollPositions = {}, rememberScroll = () => {} }) {
			const scrollRef = (0, react.useRef)(null);
			(0, react.useEffect)(() => {
				if (scrollRef.current) scrollRef.current.scrollTop = scrollPositions.home || 0;
			}, []);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
				"data-knowledge-studio-details": "true",
				style: {
					height: "100%",
					minHeight: 0,
					display: "flex",
					flexDirection: "column",
					background: "var(--dsw-alias-bg-base, #fffdf9)",
					color: "var(--dsw-alias-label-primary, #302b28)",
					fontSize: 13
				},
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", {
					style: {
						display: "flex",
						alignItems: "center",
						gap: 9,
						padding: 15,
						borderBottom: "1px solid var(--dsw-alias-border-l2, #e6dfd6)"
					},
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", {
							style: { fontSize: 16 },
							children: "Studio"
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							style: {
								fontSize: 11,
								color: "var(--dsw-alias-label-secondary, #857a6d)",
								overflow: "hidden",
								textOverflow: "ellipsis",
								whiteSpace: "nowrap"
							},
							children: workspace.title
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							style: {
								...b,
								marginLeft: "auto",
								border: 0
							},
							"aria-label": "关闭面板",
							onClick: close,
							children: "×"
						})
					]
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					ref: scrollRef,
					onScroll: (e) => rememberScroll("home", e.currentTarget.scrollTop),
					style: {
						overflowY: "auto",
						padding: 16,
						flex: 1
					},
					children: [
						error && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("p", {
							role: "alert",
							style: { color: "var(--dsw-alias-state-error-primary, #ad333f)" },
							children: [
								error,
								" ",
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									style: b,
									onClick: refresh,
									children: "重试"
								})
							]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							style: {
								display: "grid",
								gridTemplateColumns: "repeat(2,minmax(0,1fr))",
								gap: 9
							},
							children: workspace.capabilities.filter((c) => c.available || c.unavailableReason).map((c) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
								disabled: !c.available,
								"data-knowledge-studio-capability": c.id,
								style: {
									...b,
									textAlign: "left",
									padding: "14px 12px",
									minHeight: 100,
									cursor: c.available ? "pointer" : "default",
									background: "var(--dsw-alias-bg-layer-2, #f7f3ed)"
								},
								onClick: () => invoke(c),
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
									style: {
										display: "flex",
										alignItems: "center",
										gap: 8
									},
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(StudioIcon, {
										kind: c.id,
										size: 22,
										tile: true
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", {
										style: { fontSize: 14 },
										children: c.title
									})]
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									style: {
										display: "block",
										fontSize: 11,
										color: "var(--dsw-alias-label-secondary, #84776a)",
										lineHeight: 1.5,
										marginTop: 6
									},
									children: c.unavailableReason || c.description
								})]
							}, c.id))
						}),
						[{
							label: "进行中",
							items: (workspace.artifacts || []).filter((item) => item.status === "running" || item.status === "queued")
						}, {
							label: "最近成果",
							items: (workspace.artifacts || []).filter((item) => item.status !== "running" && item.status !== "queued")
						}].filter((group) => group.label === "最近成果" || group.items.length).map((group) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							"data-studio-result-group": group.label,
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									style: {
										display: "flex",
										alignItems: "center",
										marginTop: 26,
										marginBottom: 10
									},
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: group.label }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
										style: {
											marginLeft: "auto",
											fontSize: 11,
											color: "var(--dsw-alias-label-secondary, #857a6d)"
										},
										children: [group.items.length, " 项"]
									})]
								}),
								!group.items.length && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
									style: {
										color: "var(--dsw-alias-label-secondary, #857a6d)",
										fontSize: 12
									},
									children: "选择一种形式开始，完成的成果会保存在这里。"
								}),
								group.items.map((item) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
									"data-studio-artifact-id": item.id,
									style: {
										...b,
										width: "100%",
										textAlign: "left",
										border: 0,
										borderBottom: "1px solid var(--dsw-alias-border-l2, #ece6de)",
										borderRadius: 0,
										padding: "12px 0",
										display: "flex",
										alignItems: "center",
										gap: 10
									},
									onClick: () => openArtifact(item.id),
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(StudioIcon, {
										kind: item.kind,
										tile: true
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
										style: {
											minWidth: 0,
											flex: 1
										},
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", {
											style: {
												display: "block",
												whiteSpace: "nowrap",
												overflow: "hidden",
												textOverflow: "ellipsis"
											},
											children: item.title
										}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
											style: {
												fontSize: 11,
												color: "var(--dsw-alias-label-secondary, #857a6d)"
											},
											children: [
												workspace.capabilities.find((c) => c.id === item.kind)?.title || item.kind,
												primaryFormats[item.kind] ? " · " + primaryFormats[item.kind].toUpperCase() : "",
												" · ",
												item.status === "completed" ? new Date(item.updatedAt).toLocaleString() : item.status === "running" ? "生成中" : item.status === "cancelled" ? "已取消" : "未完成"
											]
										})]
									})]
								}, item.id))
							]
						}, group.label))
					]
				})]
			});
		}
		//#endregion
		//#region src/client/ReadingFrame.tsx
		function ReadingLayer({ surface }) {
			const ref = (0, react.useRef)(null);
			const state = (0, react.useSyncExternalStore)(surface.subscribe, surface.getSnapshot, surface.getSnapshot);
			(0, react.useLayoutEffect)(() => {
				const node = ref.current, frame = node.closest("[data-shell-overlay]")?.parentElement;
				const measure = () => {
					const first = frame ? parseFloat(getComputedStyle(frame).gridTemplateColumns) : 0;
					node.style.left = `${Number.isFinite(first) ? first : 0}px`;
				};
				measure();
				const observer = new ResizeObserver(measure);
				if (frame) {
					observer.observe(frame);
					if (frame.firstElementChild) observer.observe(frame.firstElementChild);
				}
				surface.setReadingTarget(node);
				return () => {
					observer.disconnect();
					surface.setReadingTarget(null);
				};
			}, [surface]);
			(0, react.useLayoutEffect)(() => {
				const center = (ref.current?.closest("[data-shell-overlay]")?.parentElement)?.children[1];
				if (!center || !state.reading) return;
				const previous = center.inert;
				center.inert = true;
				return () => {
					center.inert = previous;
				};
			}, [state.open, state.reading]);
			(0, react.useLayoutEffect)(() => {
				const frame = ref.current?.closest("[data-shell-overlay]")?.parentElement;
				if (!frame || !surface.setDetailsCollapsed) return;
				let pending = 0, disposed = false;
				const measure = () => {
					if (disposed) return;
					const collapsed = frame.hasAttribute("data-details-collapsed");
					surface.setDetailsCollapsed(collapsed);
				};
				const schedule = () => {
					cancelAnimationFrame(pending);
					pending = requestAnimationFrame(() => {
						pending = requestAnimationFrame(measure);
					});
				};
				schedule();
				const observer = new MutationObserver(schedule);
				observer.observe(frame, {
					attributes: true,
					attributeFilter: ["data-details-collapsed"]
				});
				return () => {
					disposed = true;
					cancelAnimationFrame(pending);
					observer.disconnect();
				};
			}, [
				surface,
				state.open,
				state.reading
			]);
			(0, react.useLayoutEffect)(() => {
				const frame = ref.current?.closest("[data-shell-overlay]")?.parentElement;
				if (!frame || !surface.restoreSidebar) return;
				let width = frame.getBoundingClientRect().width, pending = 0;
				const observer = new ResizeObserver(() => {
					const next = frame.getBoundingClientRect().width;
					if (next === width) return;
					const wider = next > width;
					width = next;
					cancelAnimationFrame(pending);
					if (wider) pending = requestAnimationFrame(() => surface.restoreSidebar());
				});
				observer.observe(frame);
				return () => {
					observer.disconnect();
					cancelAnimationFrame(pending);
				};
			}, [surface]);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				ref,
				"data-studio-reading-layer": "true",
				"data-reading-active": Boolean(state.reading),
				style: {
					position: "absolute",
					top: 0,
					right: 0,
					bottom: 0,
					pointerEvents: "none"
				}
			});
		}
		function ReadingFrame({ expanded, target, toggle, toolbar, children }) {
			const inline = (0, react.useRef)(null);
			const [mount] = (0, react.useState)(() => {
				const node = document.createElement("div");
				node.style.cssText = "height:100%;min-height:0;display:flex;flex-direction:column;pointer-events:auto;background:var(--dsw-alias-bg-base, #fffdf9)";
				return node;
			});
			const lastMode = (0, react.useRef)(false);
			const positions = (0, react.useRef)(/* @__PURE__ */ new Map());
			(0, react.useLayoutEffect)(() => {
				const parent = expanded && target ? target : inline.current;
				const current = new Map(Array.from(mount.querySelectorAll("*")).map((node) => [node, {
					top: node.scrollTop,
					left: node.scrollLeft
				}]));
				positions.current.set(lastMode.current, current);
				const restore = positions.current.get(Boolean(expanded)) || current;
				const media = Array.from(mount.querySelectorAll("video,audio")).map((node) => ({
					node,
					playing: !node.paused
				}));
				parent?.appendChild(mount);
				for (const [node, value] of restore) node.scrollTo({
					top: value.top,
					left: value.left,
					behavior: "instant"
				});
				lastMode.current = Boolean(expanded);
				for (const item of media) if (item.playing) item.node.play().catch(() => {});
			}, [
				expanded,
				target,
				mount
			]);
			(0, react.useLayoutEffect)(() => () => mount.remove(), [mount]);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				ref: inline,
				style: {
					height: "100%",
					minHeight: 0
				},
				children: (0, react_dom.createPortal)(/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					style: {
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
						gap: 12,
						padding: "8px 14px",
						borderBottom: "1px solid var(--dsw-alias-border-l2, #e6dfd6)",
						background: "var(--dsw-alias-bg-layer-2, #f7f3ed)",
						fontSize: 12,
						color: "var(--dsw-alias-label-secondary, #786c60)"
					},
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: expanded ? "阅读模式" : "工作区内容" }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						"data-studio-reading-actions": true,
						style: {
							display: "flex",
							alignItems: "center",
							gap: 8
						},
						children: [toolbar, /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							onClick: toggle,
							style: {
								minHeight: 32,
								border: "1px solid var(--dsw-alias-border-l2, #d9d0c5)",
								borderRadius: 7,
								padding: "5px 10px",
								background: "var(--dsw-alias-bg-base, #fffdf9)",
								color: "var(--dsw-alias-label-primary, #514337)",
								cursor: "pointer"
							},
							children: expanded ? "返回对话" : "展开阅读"
						})]
					})]
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					style: {
						flex: 1,
						minHeight: 0
					},
					children
				})] }), mount)
			});
		}
		//#endregion
		//#region lib/capabilities.js
		const LEGACY_CAPABILITIES = Object.freeze([
			Object.freeze({
				id: "briefing",
				title: "生成简报",
				description: "提炼目标、现状、重点和下一步。",
				interaction: "none",
				execution: "conversation",
				output: "chat",
				available: true,
				prompt: "请基于当前工作区生成一份结构清晰的简报，覆盖目标、现状、关键发现、风险和下一步，并为重要判断提供可打开的工作区引用。"
			}),
			Object.freeze({
				id: "faq",
				title: "生成 FAQ",
				description: "整理常见问题和证据充分的回答。",
				interaction: "none",
				execution: "conversation",
				output: "chat",
				available: true,
				prompt: "请基于当前工作区整理一份 FAQ。优先覆盖新成员最可能遇到的问题，每个回答保持简洁，并为重要事实提供可打开的工作区引用。"
			}),
			Object.freeze({
				id: "study-guide",
				title: "生成学习指南",
				description: "按由浅入深的顺序组织核心知识。",
				interaction: "none",
				execution: "conversation",
				output: "chat",
				available: true,
				prompt: "请基于当前工作区生成一份学习指南，依次说明核心概念、推荐阅读顺序、实践任务和自测问题，并为重要内容提供可打开的工作区引用。"
			}),
			Object.freeze({
				id: "quiz",
				title: "测验",
				description: "生成可答题、判分和追问的交互测验。",
				interaction: "dialog",
				execution: "artifact",
				output: "interactive",
				rendererKey: "quiz",
				available: true,
				parameters: [
					{
						id: "count",
						label: "题目数量",
						type: "select",
						default: 8,
						options: [
							{
								value: 5,
								label: "少量 · 5 题"
							},
							{
								value: 8,
								label: "标准 · 8 题"
							},
							{
								value: 12,
								label: "较多 · 12 题"
							}
						]
					},
					{
						id: "difficulty",
						label: "难度",
						type: "select",
						default: "medium",
						options: [
							{
								value: "easy",
								label: "基础"
							},
							{
								value: "medium",
								label: "中等"
							},
							{
								value: "hard",
								label: "进阶"
							}
						]
					},
					{
						id: "focus",
						label: "希望重点考什么？",
						type: "textarea",
						default: "",
						placeholder: "留空则覆盖工作区最重要的内容"
					}
				]
			}),
			Object.freeze({
				id: "flashcards",
				title: "抽认卡",
				description: "生成可复习并记录进度的知识卡片。",
				interaction: "dialog",
				execution: "artifact",
				output: "interactive",
				rendererKey: "flashcards",
				available: true,
				parameters: [{
					id: "count",
					label: "卡片数量",
					type: "select",
					default: 15,
					options: [
						{
							value: 8,
							label: "精简 · 8 张"
						},
						{
							value: 15,
							label: "标准 · 15 张"
						},
						{
							value: 24,
							label: "深入 · 24 张"
						}
					]
				}, {
					id: "focus",
					label: "希望重点复习什么？",
					type: "textarea",
					default: "",
					placeholder: "留空则覆盖工作区最重要的内容"
				}]
			})
		]);
		const focus = {
			id: "focus",
			label: "主题与要求",
			type: "textarea",
			default: "",
			placeholder: "受众、重点、希望回答的问题"
		};
		const scope = {
			id: "pathPrefix",
			label: "资料范围（可选）",
			type: "text",
			default: "",
			placeholder: "工作区相对目录，例如 docs/"
		};
		const format = (id, label, values) => ({
			id,
			label,
			type: "select",
			default: values[0][0],
			options: values.map(([value, label]) => ({
				value,
				label
			}))
		});
		const language = format("language", "输出语言", [
			["zh-CN", "简体中文"],
			["en", "English"],
			["ja", "日本語"]
		]);
		const audience = {
			id: "audience",
			label: "面向谁？",
			type: "text",
			default: "",
			placeholder: "例如：新同事、学生、专业读者"
		};
		const create = (id, title, description, parameters = [], output = "document") => ({
			id,
			title,
			description,
			interaction: "dialog",
			execution: "artifact",
			output,
			rendererKey: id,
			available: true,
			parameters: [
				...parameters,
				language,
				audience,
				focus,
				scope
			]
		});
		const BUILTIN_CAPABILITIES = Object.freeze([
			create("report", "报告", "简报、学习指南与自定义 DOCX 报告。", [format("template", "报告类型", [
				["briefing", "简报"],
				["faq", "FAQ"],
				["study-guide", "学习指南"],
				["custom", "自定义"]
			])]),
			create("mindmap", "思维导图", "浏览主题分支、查看来源，导出完整导图。", [format("detail", "展开程度", [
				["auto", "按材料决定"],
				["overview", "简明概览"],
				["detailed", "深入展开"]
			])], "interactive"),
			...LEGACY_CAPABILITIES.filter((item) => ["quiz", "flashcards"].includes(item.id)).map((item) => ({
				...item,
				title: item.id === "flashcards" ? "闪卡" : item.title,
				parameters: [
					...item.parameters,
					...item.id === "flashcards" ? [format("difficulty", "难度", [
						["medium", "中等"],
						["easy", "基础"],
						["hard", "进阶"]
					])] : [],
					language,
					audience,
					scope
				]
			})),
			create("table", "数据表", "按字段抽取与比较，生成 XLSX 工作簿。", [{
				id: "columns",
				label: "需要的列",
				type: "text",
				default: "",
				placeholder: "例如：主题、负责人、要求、时间"
			}]),
			create("slides", "演示文稿", "生成含讲稿的 PPTX 演示文稿。", [
				format("theme", "视觉主题", [
					["modern-clean", "简洁现代"],
					["academic-editorial", "学术叙事"],
					["digital-tech", "数字科技"],
					["warm-education", "温暖教育"]
				]),
				format("delivery", "用途", [["presentation", "演讲配合 · 简洁要点"], ["reading", "独立阅读 · 详细讲稿"]]),
				format("count", "页数", [
					[6, "6 页"],
					[10, "10 页"],
					[14, "14 页"]
				])
			]),
			create("audio", "音频概览", "生成讲解或对谈音频与逐字稿。", [format("style", "形式", [
				["narration", "单人摘要"],
				["dialogue", "双人深入探讨"],
				["critique", "评论分析"],
				["debate", "双方辩论"]
			])], "media"),
			create("video", "视频概览", "生成配音讲解视频与分镜脚本。", [format("count", "场景数量", [
				[4, "4 个场景"],
				[6, "6 个场景"],
				[8, "8 个场景"]
			])], "media")
		]);
		//#endregion
		//#region src/client/index.tsx
		const inject = [
			"slots",
			"locale",
			"remote",
			"sessions",
			"layout"
		];
		async function unwrap(operation) {
			const result = await operation;
			if (result?.ok === true) return result.value;
			throw new Error(result?.error?.message || result?.error?.code || "Remote operation failed");
		}
		const workspaceRequests = /* @__PURE__ */ new WeakMap();
		function workspaceRequest(service, cwd) {
			let requests = workspaceRequests.get(service);
			if (!requests) workspaceRequests.set(service, requests = /* @__PURE__ */ new Map());
			let request = requests.get(cwd);
			if (!request) {
				request = unwrap(service.workspaceForPath(cwd));
				requests.set(cwd, request);
				request.finally(() => requests.delete(cwd)).catch(() => {});
			}
			return request;
		}
		function pendingWorkspace(cwd) {
			return {
				id: "",
				path: cwd,
				title: cwd.split(/[\\/]/).filter(Boolean).at(-1),
				unknown: true,
				capabilities: BUILTIN_CAPABILITIES,
				artifacts: []
			};
		}
		function useWorkspace(service, cwd) {
			const t = useStudioLocale();
			const [value, setValue] = (0, react.useState)(null);
			const [error, setError] = (0, react.useState)("");
			const [retry, setRetry] = (0, react.useState)(0);
			(0, react.useEffect)(() => {
				let disposed = false;
				let timer;
				setValue(null);
				setError("");
				const load = async () => {
					const warning = setTimeout(() => {
						if (!disposed) setError("workspaceSlow");
					}, 8e3);
					try {
						const result = await workspaceRequest(service, cwd);
						if (!disposed) {
							setValue(result ? {
								...result,
								requestedCwd: cwd
							} : result);
							setError(result ? "" : "noWorkspace");
						}
					} catch {
						if (!disposed) setError("workspaceUnavailable");
					} finally {
						clearTimeout(warning);
						if (!disposed) timer = setTimeout(load, 2e3);
					}
				};
				if (cwd) load();
				return () => {
					disposed = true;
					clearTimeout(timer);
				};
			}, [
				service,
				cwd,
				retry
			]);
			return {
				workspace: value?.requestedCwd === cwd ? value : pendingWorkspace(cwd),
				error: error ? t(error) : "",
				refresh: () => setRetry((value) => value + 1)
			};
		}
		const colors = {
			border: "var(--dsw-alias-border-l2, #e3d9d4)",
			bg: "var(--dsw-alias-bg-layer-1, #fff)",
			soft: "var(--dsw-alias-bg-layer-2, #f7f3f1)",
			text: "var(--dsw-alias-label-primary, #251c19)",
			muted: "var(--dsw-alias-label-secondary, #746965)",
			accent: "var(--dsw-alias-state-business-primary, #963442)",
			green: "var(--dsw-alias-state-success-primary, #397a56)",
			amber: "var(--dsw-alias-state-warn-label, #936d13)",
			red: "var(--dsw-alias-state-error-primary, #ad2c3b)"
		};
		const button = {
			minHeight: 32,
			border: `1px solid ${colors.border}`,
			borderRadius: 8,
			padding: "5px 10px",
			background: colors.bg,
			color: colors.text,
			cursor: "pointer",
			fontFamily: "inherit"
		};
		const primaryButton = {
			...button,
			borderColor: colors.accent,
			background: colors.accent,
			color: "var(--dsw-alias-label-primary-inverted, #fff)"
		};
		const field = {
			width: "100%",
			minHeight: 36,
			border: `1px solid ${colors.border}`,
			borderRadius: 9,
			padding: "7px 9px",
			color: colors.text,
			background: colors.bg,
			boxSizing: "border-box",
			fontFamily: "inherit"
		};
		function location(value) {
			if (value.locator === "page") return `p.${value.pageStart}${value.pageEnd && value.pageEnd !== value.pageStart ? `–${value.pageEnd}` : ""}`;
			return `L${value.lineStart ?? "?"}${value.lineEnd && value.lineEnd !== value.lineStart ? `–${value.lineEnd}` : ""}`;
		}
		function ParameterDialog({ capability, busy, close, submit }) {
			const t = useStudioLocale();
			const [values, setValues] = (0, react.useState)(() => Object.fromEntries((capability.parameters ?? []).map((parameter) => [parameter.id, parameter.default])));
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				role: "presentation",
				onMouseDown: (event) => {
					if (event.target === event.currentTarget) close();
				},
				style: {
					position: "fixed",
					inset: 0,
					zIndex: 2200,
					display: "grid",
					placeItems: "center",
					padding: 20,
					background: "rgba(32,24,22,.32)"
				},
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("form", {
					role: "dialog",
					"aria-modal": "true",
					"aria-label": capability.title,
					onSubmit: (event) => {
						event.preventDefault();
						submit(values);
					},
					style: {
						width: "min(640px, calc(100vw - 40px))",
						maxHeight: "min(720px, calc(100vh - 40px))",
						display: "grid",
						gridTemplateRows: "56px minmax(0,1fr) 60px",
						overflow: "hidden",
						border: `1px solid ${colors.border}`,
						borderRadius: 16,
						background: colors.bg,
						color: colors.text,
						boxShadow: "0 22px 70px rgba(36,23,20,.22)"
					},
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", {
							style: {
								display: "flex",
								alignItems: "center",
								gap: 10,
								padding: "0 18px",
								borderBottom: `1px solid ${colors.border}`
							},
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(StudioIcon, { kind: capability.id }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: capability.title }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									"aria-label": t("close"),
									onClick: close,
									style: {
										...button,
										marginLeft: "auto",
										border: 0,
										fontSize: 17
									},
									children: "×"
								})
							]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							style: {
								overflow: "auto",
								padding: "18px"
							},
							children: (capability.parameters ?? []).filter((p) => parameterVisible(p, values)).map((parameter) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
								style: {
									display: "block",
									marginBottom: 17
								},
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", {
									style: {
										display: "block",
										marginBottom: 7,
										fontSize: 12
									},
									children: parameter.label
								}), parameter.type === "select" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("select", {
									style: field,
									value: values[parameter.id],
									onChange: (event) => setValues((current) => ({
										...current,
										[parameter.id]: event.target.value,
										...parameter.id === "provider" ? {
											voice: "",
											voiceB: ""
										} : {}
									})),
									children: parameter.options.filter((o) => parameterVisible(o, values)).map((option) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
										value: option.value,
										children: option.label
									}, String(option.value)))
								}) : parameter.type === "text" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
									style: field,
									value: values[parameter.id] ?? "",
									placeholder: parameter.placeholder,
									onChange: (event) => setValues((current) => ({
										...current,
										[parameter.id]: event.target.value
									}))
								}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("textarea", {
									autoFocus: true,
									style: {
										...field,
										minHeight: 120,
										resize: "vertical"
									},
									value: values[parameter.id] ?? "",
									placeholder: parameter.placeholder,
									onChange: (event) => setValues((current) => ({
										...current,
										[parameter.id]: event.target.value
									}))
								})]
							}, parameter.id))
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("footer", {
							style: {
								display: "flex",
								justifyContent: "flex-end",
								alignItems: "center",
								gap: 8,
								padding: "0 18px",
								borderTop: `1px solid ${colors.border}`
							},
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								style: button,
								onClick: close,
								children: t("cancel")
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "submit",
								disabled: busy,
								style: primaryButton,
								children: busy ? t("working") : t("generate")
							})]
						})
					]
				})
			});
		}
		function ArtifactShell({ artifact, children }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
				"data-knowledge-studio-artifact": "true",
				style: {
					height: "100%",
					overflow: "auto",
					padding: "16px",
					boxSizing: "border-box",
					background: colors.bg,
					color: colors.text
				},
				children: [artifact?.sourceScope && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
					style: {
						color: colors.muted,
						fontSize: 11
					},
					children: artifact.sourceScope
				}), children]
			});
		}
		function ArtifactPanel({ artifact, back, close, update, askAI, showEvidence }) {
			const t = useStudioLocale();
			if (!artifact) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ArtifactShell, {
				artifact: null,
				back,
				close,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: t("loading") })
			});
			if (["running", "queued"].includes(artifact.status)) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ArtifactShell, {
				artifact,
				back,
				close,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					style: {
						marginTop: "20vh",
						textAlign: "center"
					},
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							style: {
								display: "inline-grid",
								width: 44,
								height: 44,
								placeItems: "center",
								borderRadius: 14,
								color: colors.accent,
								background: colors.soft
							},
							children: "◌"
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", {
							style: { fontSize: 18 },
							children: t("generating")
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("p", {
							style: {
								color: colors.muted,
								fontSize: 11
							},
							children: [artifact.phase === "retrieve" ? "正在检索可核验内容" : "正在组织交互内容", artifact.total ? ` · ${artifact.processed}/${artifact.total}` : ""]
						})
					]
				})
			});
			if ([
				"failed",
				"interrupted",
				"cancelled"
			].includes(artifact.status)) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ArtifactShell, {
				artifact,
				back,
				close,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					style: {
						marginTop: "16vh",
						textAlign: "center"
					},
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", {
						style: {
							color: colors.red,
							fontSize: 18
						},
						children: artifact.status === "interrupted" ? t("interruptedArtifact") : t("failed")
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						style: {
							color: colors.muted,
							fontSize: 11
						},
						children: artifact.message
					})]
				})
			});
			const citation = (id) => artifact.citations?.find((item) => item.evidenceId === id);
			if (artifact.kind === "quiz") {
				const questions = artifact.content?.questions ?? [];
				const current = Math.max(0, Math.min(questions.length - 1, Number(artifact.interaction?.current) || 0));
				const question = questions[current];
				if (!question) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ArtifactShell, {
					artifact,
					back,
					close,
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: t("error") })
				});
				const answer = artifact.interaction?.answers?.[question.id];
				const revealed = Boolean(artifact.interaction?.revealed?.[question.id]);
				const correct = revealed && Number(answer) === Number(question.correctIndex);
				const completed = questions.filter((item) => artifact.interaction?.revealed?.[item.id]).length;
				return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ArtifactShell, {
					artifact,
					back,
					close,
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						style: {
							maxWidth: 760,
							margin: "0 auto"
						},
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								style: {
									display: "flex",
									color: colors.muted,
									fontSize: 10
								},
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [
									current + 1,
									"/",
									questions.length
								] }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
									style: { marginLeft: "auto" },
									children: [
										completed,
										"/",
										questions.length
									]
								})]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								style: {
									height: 3,
									margin: "8px 0 24px",
									borderRadius: 3,
									overflow: "hidden",
									background: colors.soft
								},
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", { style: {
									width: `${(current + 1) / questions.length * 100}%`,
									height: "100%",
									background: colors.accent
								} })
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", {
								style: {
									fontSize: 18,
									lineHeight: 1.5
								},
								children: question.question
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								style: {
									display: "grid",
									gap: 9,
									marginTop: 18
								},
								children: question.options.map((option, index) => {
									const selected = Number(answer) === index;
									const isCorrect = revealed && index === question.correctIndex;
									const wrong = revealed && selected && !isCorrect;
									return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
										disabled: revealed,
										onClick: () => void update("answer", question.id, index),
										style: {
											...button,
											minHeight: 48,
											padding: "10px 12px",
											textAlign: "left",
											borderColor: isCorrect ? colors.green : wrong ? colors.red : selected ? colors.accent : colors.border,
											background: isCorrect ? "color-mix(in srgb, var(--dsw-alias-state-success-primary) 11%, transparent)" : wrong ? "color-mix(in srgb, var(--dsw-alias-state-error-primary) 9%, transparent)" : selected ? colors.soft : colors.bg
										},
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("strong", {
											style: { marginRight: 9 },
											children: [String.fromCharCode(65 + index), "."]
										}), option]
									}, index);
								})
							}),
							!revealed && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								disabled: answer == null,
								onClick: () => void update("reveal", question.id, true),
								style: {
									...primaryButton,
									marginTop: 16
								},
								children: t("submitAnswer")
							}),
							revealed && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
								style: {
									marginTop: 18,
									padding: 14,
									borderRadius: 11,
									border: `1px solid ${correct ? colors.green : colors.red}`,
									background: correct ? "color-mix(in srgb, var(--dsw-alias-state-success-primary) 8%, transparent)" : "color-mix(in srgb, var(--dsw-alias-state-error-primary) 7%, transparent)"
								},
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", {
										style: { color: correct ? colors.green : colors.red },
										children: correct ? `✓ ${t("correct")}` : `× ${t("incorrect")}`
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
										style: {
											margin: "8px 0 0",
											lineHeight: 1.65,
											fontSize: 12
										},
										children: question.explanation
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										style: {
											display: "flex",
											gap: 7,
											flexWrap: "wrap",
											marginTop: 11
										},
										children: [question.evidenceIds.map((id, index) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
											style: button,
											onClick: () => void showEvidence(citation(id)),
											children: [
												t("evidence"),
												" ",
												index + 1
											]
										}, id)), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
											style: button,
											onClick: () => void askAI(question.id),
											children: t("askAI")
										})]
									})
								]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								style: {
									display: "flex",
									gap: 8,
									marginTop: 22
								},
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									disabled: current === 0,
									style: button,
									onClick: () => void update("current", question.id, current - 1),
									children: t("previous")
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									disabled: current >= questions.length - 1,
									style: {
										...primaryButton,
										marginLeft: "auto"
									},
									onClick: () => void update("current", question.id, current + 1),
									children: t("next")
								})]
							}),
							completed === questions.length && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								style: {
									...button,
									width: "100%",
									marginTop: 12
								},
								onClick: () => void update("reset", "", true),
								children: t("reset")
							}),
							questions.some((q) => artifact.interaction?.revealed?.[q.id] && artifact.interaction?.answers?.[q.id] !== q.correctIndex) && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("details", {
								style: { marginTop: 18 },
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("summary", {
									style: { cursor: "pointer" },
									children: "错题回顾"
								}), questions.map((q, index) => artifact.interaction?.revealed?.[q.id] && artifact.interaction?.answers?.[q.id] !== q.correctIndex ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
									style: {
										...button,
										display: "block",
										textAlign: "left",
										marginTop: 8,
										width: "100%"
									},
									onClick: () => void update("current", q.id, index),
									children: [
										index + 1,
										". ",
										q.question
									]
								}, q.id) : null)]
							})
						]
					})
				});
			}
			const cards = artifact.content?.cards ?? [];
			const current = Math.max(0, Math.min(cards.length - 1, Number(artifact.interaction?.current) || 0));
			const card = cards[current];
			if (!card) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ArtifactShell, {
				artifact,
				back,
				close,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: t("error") })
			});
			const flipped = Boolean(artifact.interaction?.flipped);
			const grades = artifact.interaction?.grades ?? {};
			const known = Object.values(grades).filter(Boolean).length;
			const grade = async (value) => {
				await update("grade", card.id, value);
				if (current < cards.length - 1) await update("current", card.id, current + 1);
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ArtifactShell, {
				artifact,
				back,
				close,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					style: {
						maxWidth: 720,
						margin: "0 auto"
					},
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							style: {
								display: "flex",
								color: colors.muted,
								fontSize: 10
							},
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [
								current + 1,
								"/",
								cards.length
							] }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
								style: { marginLeft: "auto" },
								children: [
									known,
									" ",
									t("known")
								]
							})]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							onClick: () => void update("flip", card.id, !flipped),
							style: {
								width: "100%",
								minHeight: 300,
								display: "grid",
								placeItems: "center",
								marginTop: 16,
								padding: 30,
								border: `1px solid ${flipped ? colors.accent : colors.border}`,
								borderRadius: 18,
								background: flipped ? colors.soft : colors.bg,
								color: colors.text,
								cursor: "pointer",
								fontFamily: "inherit",
								boxShadow: "0 10px 30px rgba(36,23,20,.06)"
							},
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								style: {
									maxWidth: 560,
									fontSize: flipped ? 16 : 20,
									lineHeight: 1.7,
									whiteSpace: "pre-wrap"
								},
								children: flipped ? card.back : card.front
							})
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
							style: {
								textAlign: "center",
								color: colors.muted,
								fontSize: 10
							},
							children: flipped ? "" : t("flip")
						}),
						flipped && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							style: {
								display: "grid",
								gridTemplateColumns: "1fr 1fr",
								gap: 9,
								marginTop: 14
							},
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								style: button,
								onClick: () => void grade(false),
								children: t("review")
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								style: primaryButton,
								onClick: () => void grade(true),
								children: t("known")
							})]
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							style: {
								display: "flex",
								justifyContent: "center",
								gap: 7,
								flexWrap: "wrap",
								marginTop: 12
							},
							children: [card.evidenceIds.map((id, index) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
								style: button,
								onClick: () => void showEvidence(citation(id)),
								children: [
									t("evidence"),
									" ",
									index + 1
								]
							}, id)), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								style: button,
								onClick: () => void askAI(card.id),
								children: t("askAI")
							})]
						})] }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							style: {
								display: "flex",
								gap: 8,
								marginTop: 22
							},
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								disabled: current === 0,
								style: button,
								onClick: () => void update("current", card.id, current - 1),
								children: t("previous")
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								disabled: current >= cards.length - 1,
								style: {
									...button,
									marginLeft: "auto"
								},
								onClick: () => void update("current", card.id, current + 1),
								children: t("next")
							})]
						}),
						Object.keys(grades).length === cards.length && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							style: {
								...button,
								width: "100%",
								marginTop: 12
							},
							onClick: () => void update("reset", "", true),
							children: t("reset")
						})
					]
				})
			});
		}
		function DetailsPanel({ sessionId: providedSessionId, useSession, useInput, inputActions, surface, service, sessionMeta, openFile, previewFile, closePanel, officialSidebar, notificationNavigation, notificationVisible }) {
			const t = useStudioLocale();
			const sessionId = providedSessionId ?? useSession((snapshot) => snapshot.sessionId);
			const draft = useInput((snapshot) => snapshot.draft);
			const meta = sessionMeta(sessionId);
			const remembered = surface.sessionState(sessionId);
			const { workspace, error: workspaceError, refresh } = useWorkspace(service, meta.cwd);
			const [evidence, setEvidenceState] = (0, react.useState)(remembered.artifactId ? remembered.evidence || null : null);
			const [artifactId, setArtifactIdState] = (0, react.useState)(remembered.artifactId || "");
			const [artifact, setArtifact] = (0, react.useState)(null);
			const [dialog, setDialog] = (0, react.useState)(null);
			const [error, setError] = (0, react.useState)("");
			const [busy, setBusy] = (0, react.useState)(false);
			const remember = (patch) => surface.remember(sessionId, patch);
			const setEvidence = (value) => {
				setEvidenceState(value);
				remember({ evidence: value });
			};
			const setArtifactId = (value) => {
				setArtifactIdState(value);
				remember({ artifactId: value });
			};
			(0, react.useEffect)(() => {
				const id = notificationNavigation?.params?.artifactId;
				if (typeof id !== "string" || !/^artifact_[a-f0-9]{32}$/.test(id)) return;
				setEvidence(null);
				setDialog(null);
				setArtifactId(id);
			}, [notificationNavigation?.revision, sessionId]);
			(0, react.useEffect)(() => {
				const open = (event) => {
					if (event.detail?.sessionId !== sessionId || typeof event.detail.artifactId !== "string") return;
					setEvidence(null);
					setDialog(null);
					setArtifactId(event.detail.artifactId);
				};
				window.addEventListener("eduwork:studio-open-notification", open);
				return () => window.removeEventListener("eduwork:studio-open-notification", open);
			}, [sessionId]);
			(0, react.useEffect)(() => {
				if (!artifactId || notificationVisible !== true) return;
				const report = (visible) => window.dispatchEvent(new CustomEvent("eduwork:studio-visibility", { detail: {
					sessionId,
					artifactId,
					visible
				} }));
				report(true);
				return () => {
					report(false);
				};
			}, [
				sessionId,
				artifactId,
				notificationVisible
			]);
			(0, react.useEffect)(() => {
				let disposed = false;
				if (!artifactId) {
					setArtifact(null);
					return () => {
						disposed = true;
					};
				}
				let timer;
				const load = async () => {
					try {
						const value = await unwrap(service.readArtifact(artifactId));
						if (!disposed) setArtifact(value.artifact);
					} catch (cause) {
						if (!disposed) setError(cause?.message || String(cause));
					} finally {
						if (!disposed) timer = setTimeout(load, 2e3);
					}
				};
				load();
				return () => {
					disposed = true;
					clearTimeout(timer);
				};
			}, [artifactId]);
			(0, react.useEffect)(() => {
				const since = surface.sessionState(sessionId).awaitingArtifactSince;
				if (!since) return;
				const result = workspace.artifacts?.find((item) => item.sessionId === sessionId && item.createdAt >= since);
				if (result) {
					setArtifactId(result.id);
					surface.remember(sessionId, { awaitingArtifactSince: void 0 });
				}
			}, [workspace.artifacts, sessionId]);
			const run = async (operation) => {
				setBusy(true);
				setError("");
				try {
					await operation();
				} catch (cause) {
					setError(cause?.message || String(cause));
				} finally {
					setBusy(false);
				}
			};
			const showEvidence = (item) => run(async () => {
				const id = item.evidenceId;
				const value = id && !id.startsWith("file_") ? (await unwrap(service.readEvidence(workspace.id, id))).evidence : item;
				setEvidence(value ? {
					...value,
					path: value.path || item.path,
					content: value.content || value.excerpt || item.excerpt
				} : {
					...item,
					content: item.content || item.excerpt || "原始内容已经变化。"
				});
			});
			const invoke = (capability, parameters = {}) => run(async () => {
				if (capability.execution === "conversation") {
					inputActions.setDraft(capability.prompt || BUILTIN_CAPABILITIES.find((item) => item.id === capability.id)?.prompt);
					inputActions.submit();
					return;
				}
				if (capability.execution === "artifact") {
					surface.setReading(false);
					surface.remember(sessionId, {
						awaitingArtifactSince: (/* @__PURE__ */ new Date()).toISOString(),
						artifactId: ""
					});
					setDialog(null);
					setArtifactId("");
					inputActions.setDraft(artifactRequest(capability, parameters));
					inputActions.submit();
					return;
				}
				const target = workspace.id ? workspace : await workspaceRequest(service, meta.cwd);
				if (!target?.id) throw new Error(t("noWorkspace"));
				const result = await unwrap(service.invokeStudio(target.id, capability.id, parameters, sessionId));
				if (result.action === "compose") {
					inputActions.setDraft(result.prompt);
					inputActions.submit();
					surface.close();
					closePanel?.();
					return;
				}
				if (result.action === "artifact") {
					setDialog(null);
					setArtifact(result.artifact);
					setArtifactId(result.artifact.id);
					return;
				}
				await refresh();
			});
			const updateArtifact = async (action, itemId, value) => {
				const result = await unwrap(service.updateArtifactInteraction(artifact.id, action, itemId, value));
				setArtifact(result.artifact);
			};
			const askArtifact = async (itemId) => {
				const result = await unwrap(service.artifactAskPrompt(artifact.id, itemId));
				inputActions.setDraft(artifact.kind === "mindmap" ? `${draft ? draft + "\n\n" : ""}${result.prompt}\n\n我的问题：` : result.prompt);
				if (artifact.kind !== "mindmap") inputActions.submit();
				surface.setReading(false);
			};
			const close = () => closePanel ? closePanel() : surface.dismiss(meta);
			if (!meta.cwd) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				style: {
					padding: 20,
					color: colors.muted
				},
				children: t("noWorkspace")
			});
			if (evidence) return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
				style: {
					height: "100%",
					display: "grid",
					gridTemplateRows: "52px minmax(0,1fr)",
					background: colors.bg,
					color: colors.text
				},
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", {
					style: {
						display: "flex",
						alignItems: "center",
						gap: 8,
						padding: "0 13px",
						borderBottom: `1px solid ${colors.border}`
					},
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
							style: {
								...button,
								border: 0
							},
							onClick: () => setEvidence(null),
							children: ["← ", t("back")]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", {
							style: {
								overflow: "hidden",
								textOverflow: "ellipsis",
								whiteSpace: "nowrap"
							},
							children: evidence.heading || evidence.path
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							"aria-label": t("close"),
							style: {
								...button,
								marginLeft: "auto",
								border: 0
							},
							onClick: close,
							children: "×"
						})
					]
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					style: {
						padding: 18,
						overflow: "auto"
					},
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							style: {
								color: colors.muted,
								fontSize: 11
							},
							children: [
								evidence.path,
								" · ",
								location(evidence)
							]
						}),
						evidence.fresh === false && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
							role: "alert",
							children: "原文件已经变化或不可用，当前显示生成时的资料快照。"
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							"data-studio-evidence-content": true,
							style: {
								fontSize: 14,
								margin: "16px 0"
							},
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(KnowledgeMarkdown, { page: { content: evidence.content } })
						}),
						error && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
							role: "alert",
							children: error
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							style: button,
							onClick: () => void run(() => openFile(workspace.path, evidence.path)),
							children: t("openSource")
						})
					]
				})]
			});
			if (artifactId) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(StudioArtifact, {
				artifact: artifact?.id === artifactId ? artifact : null,
				back: () => setArtifactId(""),
				close,
				expanded: !officialSidebar && surface.getSnapshot().reading,
				expand: officialSidebar ? void 0 : () => surface.setReading(true),
				memory: surface.sessionState(sessionId).mindmaps?.[artifactId],
				remember: (value) => surface.remember(sessionId, { mindmaps: {
					...surface.sessionState(sessionId).mindmaps,
					[artifactId]: value
				} }),
				showEvidence,
				askAI: askArtifact,
				previewFile: previewFile ? (path) => previewFile(sessionId, path) : void 0,
				exportFile: async (format) => (await unwrap(service.exportArtifact(artifactId, format))).file,
				manage: async (action, value) => {
					if (action === "retry") {
						surface.setReading(false);
						const capability = workspace.capabilities.find((c) => c.id === artifact.kind);
						surface.remember(sessionId, {
							awaitingArtifactSince: (/* @__PURE__ */ new Date()).toISOString(),
							artifactId: ""
						});
						inputActions.setDraft(artifactRequest(capability, artifact.parameters));
						inputActions.submit();
						return;
					}
					const result = await unwrap(service.manageArtifact(artifactId, action, value, sessionId));
					if (action === "delete") setArtifactId("");
					else setArtifact(result.artifact);
					await refresh();
				},
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ArtifactPanel, {
					artifact,
					back: () => setArtifactId(""),
					close,
					update: updateArtifact,
					askAI: askArtifact,
					showEvidence
				})
			});
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(WorkspaceHome, {
				workspace,
				refresh,
				close,
				scrollPositions: surface.sessionState(sessionId).scrollPositions,
				rememberScroll: (key, value) => surface.remember(sessionId, { scrollPositions: {
					...surface.sessionState(sessionId).scrollPositions,
					[key]: value
				} }),
				error: error || workspaceError,
				invoke: (capability) => setDialog(capability),
				openArtifact: setArtifactId
			}), dialog && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ParameterDialog, {
				capability: dialog,
				busy,
				close: () => setDialog(null),
				submit: (parameters) => invoke(dialog, parameters)
			})] });
		}
		function SessionDetails(props) {
			const sessionId = props.sessionId ?? props.useSession((value) => value.sessionId);
			const state = (0, react.useSyncExternalStore)(props.surface.subscribe, props.surface.getSnapshot, props.surface.getSnapshot);
			const meta = props.sessionMeta(sessionId);
			if (props.officialSidebar) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(DetailsPanel, { ...props }, sessionId);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ReadingFrame, {
				expanded: Boolean(state.reading),
				target: state.readingTarget,
				toolbar: !props.officialSidebar && state.reading && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(StudioEntry, {
					surface: props.surface,
					target: meta,
					placement: "reading"
				}),
				toggle: () => props.surface.setReading(!state.reading),
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(DetailsPanel, { ...props }, sessionId)
			});
		}
		function SidebarStudio(props) {
			const { tab } = props.useTabInfo();
			const meta = props.sessionMeta(props.sessionId);
			(0, react.useEffect)(() => {
				props.tabHandles.set(props.sessionId, tab.actions);
				const closed = () => props.surface.tabClosed(props.sessionId);
				tab.signal.addEventListener("abort", closed, { once: true });
				return () => {
					tab.signal.removeEventListener("abort", closed);
					if (props.tabHandles.get(props.sessionId) === tab.actions) props.tabHandles.delete(props.sessionId);
					closed();
				};
			}, [
				props.surface,
				props.tabHandles,
				props.sessionId,
				tab.id,
				tab.signal
			]);
			(0, react.useEffect)(() => {
				if (!tab.signal.aborted) props.surface.adoptTab(meta, tab.visible);
			}, [
				props.surface,
				meta.sessionId,
				meta.cwd,
				tab.visible,
				tab.signal
			]);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(SessionDetails, {
				...props,
				notificationNavigation: tab.navigation,
				notificationVisible: tab.visible
			});
		}
		function LocalizedSessionDetails(props) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(StudioLocale.Provider, {
				value: props.t,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(SessionDetails, { ...props })
			});
		}
		function LocalizedSidebarStudio(props) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(StudioLocale.Provider, {
				value: props.t,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(SidebarStudio, { ...props })
			});
		}
		function absoluteWorkspacePath(root, relative) {
			if (/^[A-Za-z]:[\\/]/.test(relative) || relative.startsWith("/")) return relative;
			return `${String(root).replace(/[\\/]+$/, "")}/${String(relative).replace(/^[\\/]+/, "")}`;
		}
		async function apply(ctx) {
			ctx.effect(() => ctx.locale.register(NS, dictionaries), "studio: dictionaries");
			const t = ctx.locale.bind(NS);
			const disposeRemote = await ctx.remote.$mount(knowledgeStudioRemote);
			const officialSidebar = typeof ctx.layout.openDetails !== "function";
			ctx.inject([
				"remote.knowledgeStudio",
				"remote.session",
				...officialSidebar ? ["sidebarRight", "sidebarRightTabs"] : []
			], (surfaceCtx) => {
				const service = surfaceCtx.remote.knowledgeStudio;
				surfaceCtx.inject([
					"notificationActions",
					"uiWorkspace",
					...officialSidebar ? ["uiSession"] : []
				], (inner) => {
					let visible = null;
					const visibility = (event) => {
						const value = event.detail;
						if (value?.visible) visible = { target: {
							artifactId: value.artifactId,
							sessionId: value.sessionId
						} };
						else if (visible?.target.artifactId === value?.artifactId) visible = null;
					};
					window.addEventListener("eduwork:studio-visibility", visibility);
					inner.effect(() => () => window.removeEventListener("eduwork:studio-visibility", visibility));
					inner.effect(() => inner.notificationActions.register("studio", async ({ target, signal }) => {
						const { artifact } = await unwrap(service.readArtifact(target.artifactId));
						if (signal.aborted || artifact.deletedAt || artifact.sessionId !== target.sessionId) return false;
						inner.uiWorkspace.openSession(target.sessionId);
						for (let attempt = 0; attempt < 20; attempt++) {
							await new Promise((resolve) => setTimeout(resolve, 50));
							if (signal.aborted) return false;
							if ((officialSidebar ? inner.uiSession.adapter.current.getSnapshot().props?.sessionId : surfaceCtx.sessions.list.getSnapshot().current) !== target.sessionId) return false;
							try {
								if (officialSidebar) surfaceCtx.sidebarRight.openTab("knowledge-studio", { params: { artifactId: target.artifactId } });
								else {
									const current = surface.currentTarget();
									if (!current || current.sessionId !== target.sessionId) throw Error("Studio session not ready");
									surface.remember(target.sessionId, { artifactId: target.artifactId });
									surface.open(current);
									window.dispatchEvent(new CustomEvent("eduwork:studio-open-notification", { detail: target }));
								}
								return;
							} catch (error) {
								if (attempt === 19) throw error;
							}
						}
					}, () => visible));
				});
				let preferenceWrites = Promise.resolve();
				const tabHandles = /* @__PURE__ */ new Map();
				const layout = officialSidebar ? {
					openDetails: () => surfaceCtx.sidebarRight.openTab("knowledge-studio"),
					closeDetails: () => tabHandles.get(surface.currentTarget()?.sessionId ?? "")?.close()
				} : surfaceCtx.layout;
				const canRestoreDetails = (sessionId) => surfaceCtx.sessions.list.getSnapshot().byId[sessionId]?.blank === false;
				const surface = new KnowledgeSurface(layout, (sessionId) => officialSidebar || canRestoreDetails(sessionId), (open) => {
					if (officialSidebar) return;
					preferenceWrites = preferenceWrites.catch(() => {}).then(async () => {
						await unwrap(service.setUIOpenPreference(open));
					});
					preferenceWrites.catch((error) => console.error("Could not save Studio preference", error));
				}, officialSidebar ? () => false : canRestoreDetails);
				if (!officialSidebar) unwrap(service.readUIPreferences()).then((value) => surface.restorePreference(value.open === true)).catch((error) => console.error("Could not load Studio preference", error));
				const sessionMeta = (sessionId) => {
					return {
						sessionId,
						cwd: (0, react.useSyncExternalStore)(surfaceCtx.sessions.list.subscribe, surfaceCtx.sessions.list.getSnapshot, surfaceCtx.sessions.list.getSnapshot).byId[sessionId]?.cwd ?? ""
					};
				};
				const openFile = async (workspaceRoot, path) => {
					const result = await surfaceCtx.remote.session.openWorkspacePath({ path: absoluteWorkspacePath(workspaceRoot, path) });
					if (!result?.ok) throw new Error(result?.error?.message || "Failed to open workspace file");
				};
				const previewFile = officialSidebar ? (sessionId, path) => openStudioFilePreview(surfaceCtx.sidebarRight, sessionId, path) : void 0;
				const disposers = [...!officialSidebar ? [
					surfaceCtx.slots.inject("shell.overlay", () => surfaceCtx.slots.register({
						name: "shell.overlay",
						id: "knowledge-studio-reader",
						order: 0,
						inject: () => ({ surface })
					}, ReadingLayer)),
					surfaceCtx.slots.inject("shell.overlay", () => surfaceCtx.slots.register({
						name: "shell.overlay",
						id: "knowledge-studio-entry",
						order: 10,
						inject: () => ({
							surface,
							sessions: surfaceCtx.sessions
						})
					}, StudioBlankEntry)),
					surfaceCtx.slots.inject("conversation.session.header.utilities", () => surfaceCtx.slots.register({
						name: "conversation.session.header.utilities",
						id: "knowledge-studio-entry",
						order: 30,
						inject: () => ({
							surface,
							sessions: surfaceCtx.sessions
						})
					}, StudioHeaderEntry))
				] : [], ...officialSidebar ? [surfaceCtx.sidebarRightTabs.register({
					id: "@eduwork/dsh-knowledge-studio",
					kind: "knowledge-studio",
					title: () => "Studio",
					guide: [{
						order: 30,
						title: () => "Studio",
						description: () => t("sidebarDescription")
					}]
				}), surfaceCtx.slots.inject("sidebar.right.pane.tab", () => surfaceCtx.slots.register({
					name: "sidebar.right.pane.tab",
					locale: NS,
					key: "@eduwork/dsh-knowledge-studio",
					inject: () => ({
						surface,
						service,
						sessionMeta,
						openFile,
						previewFile,
						tabHandles,
						officialSidebar
					})
				}, LocalizedSidebarStudio))] : [surfaceCtx.slots.inject("details", () => {
					let disposeEntry;
					const activation = {
						activate() {
							if (disposeEntry) return;
							disposeEntry = surfaceCtx.slots.register({
								name: "details",
								locale: NS,
								priority: -50,
								inject: () => ({
									surface,
									service,
									sessionMeta,
									openFile
								})
							}, LocalizedSessionDetails);
						},
						deactivate() {
							disposeEntry?.();
							disposeEntry = void 0;
						}
					};
					surface.bind(activation);
					return () => {
						activation.deactivate();
						surface.bind(void 0);
					};
				})]];
				let syncTimer;
				let observedSessionState = "";
				const syncCurrentSession = () => {
					if (officialSidebar) return;
					const state = surfaceCtx.sessions.list.getSnapshot();
					const current = state.current;
					const summary = current ? state.byId[current] : void 0;
					const key = `${current ?? ""}|${summary?.cwd ?? ""}|${summary?.blank ?? ""}`;
					if (key === observedSessionState) return;
					observedSessionState = key;
					if (syncTimer !== void 0) window.clearTimeout(syncTimer);
					if (surface.getSnapshot().open && surface.getSnapshot().sessionId !== current) surface.close();
					if (!current || !summary?.cwd) {
						if (surface.getSnapshot().open || surface.getSnapshot().reading) surface.close();
						return;
					}
					syncTimer = window.setTimeout(() => {
						const latest = surfaceCtx.sessions.list.getSnapshot();
						if (latest.current === current && latest.byId[current]?.cwd) surface.enter({
							sessionId: current,
							cwd: latest.byId[current]?.cwd ?? ""
						});
					}, 16);
				};
				const disposeSessionSync = surfaceCtx.sessions.list.subscribe(syncCurrentSession);
				disposers.push(() => {
					disposeSessionSync();
					if (syncTimer !== void 0) window.clearTimeout(syncTimer);
				});
				syncCurrentSession();
				surfaceCtx.effect(() => () => {
					if (officialSidebar) surface.tabClosed(surface.getSnapshot().sessionId);
					else surface.close();
					for (const dispose of disposers.reverse()) dispose?.();
				}, "dsh-knowledge-studio: workspace details surface");
			});
			return async () => {
				await disposeRemote();
			};
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});
