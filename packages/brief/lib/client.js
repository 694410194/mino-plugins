window.__ModuleLoader__.load({
	id: "mino-brief",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
		let react_jsx_runtime = require("react/jsx-runtime");
		// src/client/api.ts
		async function getJson(path) {
			const res = await fetch(path, { credentials: "same-origin" });
			if (!res.ok) throw new Error(`${res.status}`);
			return res.json();
		}
		async function postJson(path, body) {
			const res = await fetch(path, {
				method: "POST",
				credentials: "same-origin",
				headers: { "content-type": "application/json" },
				body: JSON.stringify(body)
			});
			if (!res.ok) throw new Error(`${res.status}`);
			return res.json();
		}
		const api = {
			prefs: () => getJson("/mino-brief/api/prefs"),
			savePrefs: (body) => postJson("/mino-brief/api/prefs", body)
		};
		// \0dsh-css:D:\Projects\mino\mino-plugins\packages\brief\src\client\brief.module.css.mjs
		const css = ".KhX-sa_editor{-webkit-backdrop-filter:blur(30px);background:#fff9;border:.5px solid #fff6;border-radius:24px;padding:16px 18px;box-shadow:0 2px 10px #abacaf1f,inset 0 1px 1px #ffffff40}.KhX-sa_title{color:#26262ef2;margin:0 0 10px;font-size:14px;font-weight:600}.KhX-sa_hint{color:#26262e8c;margin:4px 0;font-size:12.5px}.KhX-sa_retry{color:#a55ee8;cursor:pointer;background:0 0;border:0;padding:0;font-size:12.5px}.KhX-sa_slot{border-top:.5px solid #26262e14;padding:12px 0}.KhX-sa_slot:first-of-type{border-top:0;padding-top:2px}.KhX-sa_slotHead{justify-content:space-between;align-items:center;display:flex}.KhX-sa_slotName{color:#26262ee6;font-size:13px;font-weight:600}.KhX-sa_slotDesc{color:#26262e8c;margin:6px 0 10px;font-size:12px;line-height:1.65}.KhX-sa_switch{cursor:pointer;align-items:center;gap:7px;display:inline-flex}.KhX-sa_switch input{opacity:0;width:0;height:0;position:absolute}.KhX-sa_switchTrack{background:#26262e24;border-radius:999px;width:34px;height:20px;transition:background .16s;position:relative}.KhX-sa_switchThumb{background:#fff;border-radius:50%;width:16px;height:16px;transition:transform .16s;position:absolute;top:2px;left:2px;box-shadow:0 1px 3px #0000002e}.KhX-sa_switch input:checked+.KhX-sa_switchTrack{background:#a55ee8}.KhX-sa_switch input:checked+.KhX-sa_switchTrack .KhX-sa_switchThumb{transform:translate(14px)}.KhX-sa_switchLabel{color:#26262e99;font-size:12px}.KhX-sa_field{flex-direction:column;gap:5px;margin-top:10px;display:flex}.KhX-sa_fieldLabel{color:#26262e8c;font-size:11.5px;font-weight:600}.KhX-sa_fieldInput{box-sizing:border-box;width:100%;font:inherit;color:#26262ee6;resize:vertical;background:#ffffffa6;border:.5px solid #26262e1a;border-radius:12px;outline:none;padding:9px 11px;font-size:12.5px;line-height:1.6}.KhX-sa_fieldInput:focus{border-color:#a55ee880}.KhX-sa_timeInput{font:inherit;color:#26262ee6;background:#ffffffa6;border:.5px solid #26262e1a;border-radius:10px;width:fit-content;padding:6px 9px;font-size:12.5px}.KhX-sa_fieldHint{color:#26262e73;font-size:11.5px}.KhX-sa_slotFoot{justify-content:flex-end;align-items:center;gap:10px;margin-top:12px;display:flex}.KhX-sa_savedHint{color:#26262e8c;font-size:12px}.KhX-sa_saveButton{color:#fff;cursor:pointer;background:#26262eeb;border:0;border-radius:12px;padding:7px 16px;font-size:12px;font-weight:600}.KhX-sa_saveButton:disabled{opacity:.45;cursor:default}body[data-ds-dark-theme] .KhX-sa_editor{background:#ffffff0f;border-color:#ffffff1a}body[data-ds-dark-theme] .KhX-sa_title,body[data-ds-dark-theme] .KhX-sa_slotName,body[data-ds-dark-theme] .KhX-sa_fieldInput,body[data-ds-dark-theme] .KhX-sa_timeInput{color:#ffffffeb}body[data-ds-dark-theme] .KhX-sa_slotDesc,body[data-ds-dark-theme] .KhX-sa_hint,body[data-ds-dark-theme] .KhX-sa_switchLabel,body[data-ds-dark-theme] .KhX-sa_fieldLabel,body[data-ds-dark-theme] .KhX-sa_fieldHint,body[data-ds-dark-theme] .KhX-sa_savedHint{color:#ffffff8c}body[data-ds-dark-theme] .KhX-sa_slot{border-top-color:#ffffff14}body[data-ds-dark-theme] .KhX-sa_fieldInput,body[data-ds-dark-theme] .KhX-sa_timeInput{background:#ffffff12;border-color:#ffffff1f}body[data-ds-dark-theme] .KhX-sa_switchTrack{background:#ffffff2e}body[data-ds-dark-theme] .KhX-sa_saveButton{color:#26262e;background:#ffffffe0}";
		const tagId = "mino-brief/brief.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "mino-brief";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var brief_module_css_default = {
			"switchTrack": "KhX-sa_switchTrack",
			"saveButton": "KhX-sa_saveButton",
			"fieldHint": "KhX-sa_fieldHint",
			"switchThumb": "KhX-sa_switchThumb",
			"retry": "KhX-sa_retry",
			"savedHint": "KhX-sa_savedHint",
			"hint": "KhX-sa_hint",
			"editor": "KhX-sa_editor",
			"timeInput": "KhX-sa_timeInput",
			"title": "KhX-sa_title",
			"slotName": "KhX-sa_slotName",
			"fieldInput": "KhX-sa_fieldInput",
			"field": "KhX-sa_field",
			"switch": "KhX-sa_switch",
			"slotDesc": "KhX-sa_slotDesc",
			"fieldLabel": "KhX-sa_fieldLabel",
			"switchLabel": "KhX-sa_switchLabel",
			"slotHead": "KhX-sa_slotHead",
			"slotFoot": "KhX-sa_slotFoot",
			"slot": "KhX-sa_slot"
		};
		// src/client/BriefEditor.tsx
		/** 早晚报偏好编辑卡（Today briefEditor 复刻）：内容偏好 + 推送开关 + 推送时间。 */
		function SlotEditor({ slot, t, onSaved }) {
			const [draft, setDraft] = (0, react.useState)({
				preference: slot.preference,
				enabled: slot.enabled,
				time: slot.time
			});
			const [saving, setSaving] = (0, react.useState)(false);
			const [savedHint, setSavedHint] = (0, react.useState)("");
			(0, react.useEffect)(() => setDraft({
				preference: slot.preference,
				enabled: slot.enabled,
				time: slot.time
			}), [slot]);
			const dirty = draft.preference !== slot.preference || draft.enabled !== slot.enabled || draft.time !== slot.time;
			const save = () => {
				setSaving(true);
				setSavedHint("");
				api.savePrefs({
					slot: slot.slot,
					preference: draft.preference,
					enabled: draft.enabled,
					time: draft.time
				}).then(() => {
					setSavedHint(t("editor.saved", { name: t(`editor.${slot.slot}`) }));
					onSaved();
				}).catch(() => setSavedHint(t("editor.failed"))).finally(() => setSaving(false));
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
				className: brief_module_css_default.slot,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", {
						className: brief_module_css_default.slotHead,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: brief_module_css_default.slotName,
							children: t(`editor.${slot.slot}`)
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
							className: brief_module_css_default.switch,
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
									type: "checkbox",
									checked: draft.enabled,
									onChange: (e) => setDraft((d) => ({
										...d,
										enabled: e.target.checked
									}))
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: brief_module_css_default.switchTrack,
									children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: brief_module_css_default.switchThumb })
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: brief_module_css_default.switchLabel,
									children: t("editor.pushEnabled")
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: brief_module_css_default.slotDesc,
						children: t(`editor.desc.${slot.slot}`)
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
						className: brief_module_css_default.field,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: brief_module_css_default.fieldLabel,
							children: t("editor.preferenceLabel")
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("textarea", {
							className: brief_module_css_default.fieldInput,
							rows: 3,
							value: draft.preference,
							placeholder: t("editor.preferencePlaceholder"),
							onChange: (e) => setDraft((d) => ({
								...d,
								preference: e.target.value
							}))
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
						className: brief_module_css_default.field,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: brief_module_css_default.fieldLabel,
								children: t("editor.pushTime")
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
								className: brief_module_css_default.timeInput,
								type: "time",
								value: draft.time,
								onChange: (e) => setDraft((d) => ({
									...d,
									time: e.target.value
								}))
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: brief_module_css_default.fieldHint,
								children: t("editor.dailyAt", { time: draft.time || "—" })
							})
						]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("footer", {
						className: brief_module_css_default.slotFoot,
						children: [savedHint ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: brief_module_css_default.savedHint,
							children: savedHint
						}) : null, /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: brief_module_css_default.saveButton,
							disabled: !dirty || saving,
							onClick: save,
							children: saving ? t("editor.saving") : t("editor.save")
						})]
					})
				]
			});
		}
		function BriefEditor({ t }) {
			const tr = t ?? ((k) => k);
			const [slots, setSlots] = (0, react.useState)(null);
			const [failed, setFailed] = (0, react.useState)(false);
			const load = () => {
				api.prefs().then((r) => {
					setSlots(r.slots);
					setFailed(false);
				}).catch(() => setFailed(true));
			};
			(0, react.useEffect)(load, []);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: brief_module_css_default.editor,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", {
					className: brief_module_css_default.title,
					children: tr("editor.title")
				}), failed ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("p", {
					className: brief_module_css_default.hint,
					children: [
						tr("editor.loadFailed"),
						" ",
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: brief_module_css_default.retry,
							onClick: load,
							children: tr("editor.retry")
						})
					]
				}) : slots === null ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
					className: brief_module_css_default.hint,
					children: tr("editor.loading")
				}) : slots.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
					className: brief_module_css_default.hint,
					children: tr("editor.empty")
				}) : slots.map((s) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(SlotEditor, {
					slot: s,
					t: tr,
					onSaved: load
				}, s.slot))]
			});
		}
		// src/client/locales.ts
		/** mino-brief 文案键（Today briefEditor 的 zh 原文对齐；英文 sentence case）。 */
		const zh = {
			"editor.title": "编辑早晚报",
			"editor.morning": "早报",
			"editor.evening": "晚报",
			"editor.desc.morning": "结合你的日程、待办和近期关注，梳理今天的重要安排、需要提前准备的事，以及值得留意的新信息，帮你更从容地开始一天。",
			"editor.desc.evening": "回顾今天重要事项的进展与尚未解决的问题，结合你的工作和学习提供复盘建议与新思路，并提醒明天需要提前准备的事。",
			"editor.preferenceLabel": "内容偏好",
			"editor.preferencePlaceholder": "添加你关注的内容和呈现偏好",
			"editor.pushEnabled": "开启推送",
			"editor.pushTime": "推送时间",
			"editor.dailyAt": "每天 {time}",
			"editor.save": "保存更改",
			"editor.saving": "保存中…",
			"editor.saved": "已保存，从下一次{name}起生效",
			"editor.failed": "保存失败，修改已保留",
			"editor.loading": "正在加载早晚报设置",
			"editor.loadFailed": "无法读取早晚报设置，请稍后重试。",
			"editor.retry": "重试",
			"editor.empty": "暂无可编辑的早晚报。"
		};
		const en = {
			"editor.title": "Edit briefs",
			"editor.morning": "Morning brief",
			"editor.evening": "Evening brief",
			"editor.desc.morning": "Pulls together your schedule, to-dos and recent focus — what matters today, what to prepare, and what’s new, so you can start the day calmly.",
			"editor.desc.evening": "Looks back on today’s progress and open threads, offers review ideas for your work and study, and reminds you what to prepare for tomorrow.",
			"editor.preferenceLabel": "Content preference",
			"editor.preferencePlaceholder": "Add the topics you care about and how you want them presented",
			"editor.pushEnabled": "Push enabled",
			"editor.pushTime": "Push time",
			"editor.dailyAt": "Daily at {time}",
			"editor.save": "Save changes",
			"editor.saving": "Saving…",
			"editor.saved": "Saved — applies from the next {name}",
			"editor.failed": "Save failed — your edits were kept",
			"editor.loading": "Loading brief settings",
			"editor.loadFailed": "Could not load brief settings. Please try again.",
			"editor.retry": "Retry",
			"editor.empty": "No briefs to edit right now."
		};
		// src/client/index.tsx
		const inject = ["slots", "locale"];
		const NS = "mino-brief";
		const SEAT = "today.page.customize";
		function apply(ctx) {
			const slots = ctx.get("slots");
			const locale = ctx.get("locale");
			if (!slots) return;
			let t = (key, params) => {
				let s = zh[key] ?? key;
				if (params) for (const [k, v] of Object.entries(params)) s = s.replace(`{${k}}`, String(v));
				return s;
			};
			if (locale) {
				ctx.effect(() => locale.register(NS, {
					zh,
					en
				}), "mino-brief: dictionaries");
				const bound = locale.bind(NS);
				t = (key, params) => bound(key, params);
			}
			ctx.effect(() => slots.inject(SEAT, () => slots.register({
				name: SEAT,
				id: "mino-brief",
				locale: NS,
				inject: () => ({ t })
			}, BriefEditor)));
		}
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map