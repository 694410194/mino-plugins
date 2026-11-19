window.__ModuleLoader__.load({
	id: "mino-today",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react_jsx_runtime = require("react/jsx-runtime");
		let react = require("react");
		// src/client/PanelIcon.tsx
		/** 侧栏「今日」图标：太阳从地平线升起的罗盘式字形，壳层给尺寸和选中态。 */
		function PanelIcon({ size }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
				"data-dsh-panel-entry": "today",
				viewBox: "0 0 16 16",
				width: size,
				height: size,
				fill: "none",
				stroke: "currentColor",
				strokeWidth: "1.3",
				strokeLinecap: "round",
				strokeLinejoin: "round",
				"aria-hidden": "true",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
						cx: "8",
						cy: "9",
						r: "3.2"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M8 2.4v1.6" }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M3.4 5.1l1.1 1.1" }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M12.6 5.1l-1.1 1.1" }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M2 12.8h12" }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M4.4 14.6h7.2" })
				]
			});
		}
		// src/client/api.ts
		async function getJson(url) {
			const res = await fetch(url, { cache: "no-store" });
			if (!res.ok) throw new Error(`${res.status}`);
			return await res.json();
		}
		async function postJson(url, body) {
			const res = await fetch(url, {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify(body)
			});
			if (!res.ok) throw new Error(`${res.status}`);
			return await res.json();
		}
		const api = {
			summary: () => getJson("/mino-today/api/summary"),
			postItem: (title, kind = "note") => postJson("/mino-today/api/item", {
				title,
				kind
			}),
			dismiss: (id) => postJson("/mino-today/api/dismiss", { id }),
			/** 真删一条动态（dismiss 只是划出视野）。 */
			deleteItem: (id) => postJson("/mino-today/api/item/delete", { id }),
			/** 卡片反馈：up/down 留信号；not_interested 顺带划掉。 */
			feedback: (id, signal) => postJson("/mino-today/api/item/feedback", {
				id,
				signal
			}),
			/** 「调整卡片」自由文本：生成方按 source 取回并折进下次产出。 */
			adjust: (id, note) => postJson("/mino-today/api/item/adjust", {
				id,
				note
			}),
			/** 置顶开关。 */
			setPin: (id, pinned) => postJson("/mino-today/api/item/pin", {
				id,
				pinned
			}),
			/** 标已读：单条或全部。 */
			markRead: (id) => postJson("/mino-today/api/item/read", id ? { id } : { all: true }),
			/** 定时任务暂停/恢复（id + 目标状态）。 */
			setScheduleActive: (id, active) => postJson("/mino-today/api/schedule/edit", {
				id,
				active
			}),
			diaries: () => getJson("/mino-today/api/diaries"),
			diary: (date) => getJson(`/mino-today/api/diary?date=${encodeURIComponent(date)}`),
			addDiary: (text, date) => postJson("/mino-today/api/diary", {
				text,
				date
			}),
			deleteDiaryEntry: (date, at) => postJson("/mino-today/api/diary/delete", {
				date,
				at
			}),
			/** 追踪中的主题（live widget 对应物）。 */
			watches: () => getJson("/mino-today/api/watches"),
			/** 撤掉一条追踪（连它的定时日程一起）。 */
			deleteWatch: (id) => postJson("/mino-today/api/watch/delete", { id }),
			/** fish-memory 自己的路由；插件不在 → fetch 抛错，由调用方转「未安装」态。 */
			memoryList: () => getJson("/dsh-fish-memory/list"),
			/** 日历连接器自己的路由（日程进展卡数据源）；插件不在 → 404 由调用方转「隐藏」态。 */
			calendarDay: (date) => getJson(`/mino-connector-calendar/api/day?date=${date}`),
			/** mino-brief 自己的路由（候简报行数据源）；插件不在 → 404 由调用方转「隐藏」态。 */
			briefPrefs: () => getJson("/mino-brief/api/prefs")
		};
		// src/client/shared.tsx
		/**
		* mino-today 的共享小组件：时钟 hook、相对时间格式化、chip/徽标。
		* 纯展示 —— 数据都从 props 进来。
		*/
		/** 每 30s 跳一次的本地时钟（相对时间、进行中任务时长用）。 */
		function useNow(stepMs = 3e4) {
			const [now, setNow] = (0, react.useState)(() => Date.now());
			(0, react.useEffect)(() => {
				const timer = setInterval(() => setNow(Date.now()), stepMs);
				return () => clearInterval(timer);
			}, [stepMs]);
			return now;
		}
		function pad2(n) {
			return String(n).padStart(2, "0");
		}
		/** HH:mm 本地时间。 */
		function hhmm(isoOrMs) {
			if (isoOrMs === void 0) return "";
			const d = typeof isoOrMs === "number" ? new Date(isoOrMs) : new Date(isoOrMs);
			if (Number.isNaN(d.getTime())) return "";
			return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
		}
		/** YYYY-MM-DD 本地日期键（与 host dayKey 一致）。 */
		function dayKey(d) {
			return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
		}
		/** 动态卡按 Today 的简报批次分桶：晨间（05-12）/下午（12-18）/晚间（18-05）。 */
		function batchOf(iso) {
			const h = new Date(iso).getHours();
			if (h >= 5 && h < 12) return "morning";
			if (h >= 12 && h < 18) return "afternoon";
			return "evening";
		}
		/** 相对时间：刚刚 / N 分钟前 / N 小时前 / HH:mm（跨天给日期）。 */
		function relTime(iso, nowMs) {
			const t = new Date(iso).getTime();
			if (Number.isNaN(t)) return "";
			const diff = nowMs - t;
			if (diff < 6e4) return "now";
			if (diff < 36e5) return `${Math.floor(diff / 6e4)}m`;
			if (diff < 864e5) return `${Math.floor(diff / 36e5)}h`;
			const d = new Date(iso);
			return `${d.getMonth() + 1}/${d.getDate()} ${hhmm(iso)}`;
		}
		/** 任务时长：Ns / N分Ns / N时N分Ns。 */
		function durationText(ms) {
			const s = Math.max(0, Math.floor(ms / 1e3));
			if (s < 60) return `${s}s`;
			const m = Math.floor(s / 60);
			if (m < 60) return `${m}m${s % 60 ? `${s % 60}s` : ""}`;
			return `${Math.floor(m / 60)}h${m % 60 ? `${m % 60}m` : ""}`;
		}
		/**
		* Today 卡片的指针追光（解包 TOHVBq 协议）：pointer 相对卡心求方位角写
		* --cursor-angle，按到最近边的归一化距离写 --edge-proximity（>0.3 才显光，
		* 离开归零）。事件挂在卡根元素上，CSS 里 .edgeLight 子层消费这两个 var。
		*/
		function edgeGlowHandlers() {
			return {
				onPointerMove(e) {
					const el = e.currentTarget;
					const r = el.getBoundingClientRect();
					const x = e.clientX - r.left;
					const y = e.clientY - r.top;
					const deg = Math.atan2(y - r.height / 2, x - r.width / 2) * 180 / Math.PI;
					const edge = Math.min(x, r.width - x, y, r.height - y);
					const proximity = Math.max(0, 1 - edge / (.45 * Math.min(r.width, r.height)));
					el.style.setProperty("--cursor-angle", `${deg}deg`);
					el.style.setProperty("--edge-proximity", String(Math.max(0, (proximity - .3) / .7)));
				},
				onPointerLeave(e) {
					e.currentTarget.style.setProperty("--edge-proximity", "0");
				}
			};
		}
		// \0dsh-css:D:\Projects\mino\mino-plugins\packages\today\src\client\today.module.css.mjs
		const css = ".tBHptq_page{height:100%;color:var(--dsw-alias-label-primary);font-family:var(--dsw-font-family,var(--dsh-font-family-text));--t-ink:#26262e;--t-ink-2:#26262eb8;--t-ink-3:#26262e73;--t-ink-fill:#26262e14;--t-ink-fill-2:#26262e0a;--today-accent:#a55ee8;--today-accent-soft:#a55ee81c;--today-accent-ink:#8b4ad0;--brand-pink:#ec6fb8;--today-warn:#b87900;--today-warn-soft:#ffc53d47;--today-warn-ink:#8a5d00;--dawn-1:#b7ddfb;--dawn-2:#dfeafd;--dawn-3:#ffe2c3;--glass-bg:#ffffff5c;--glass-border:#fff6;--glass-inset:inset 0 1px 1px #ffffff40;--glass-e-bg:#fffc;--glass-e-border:#0000001a;--glass-e-shadow:-4px 8px 28px #6868680a, 0 2px 8px #6464640f;background:linear-gradient(#dcd9f6 0%,#e9e4f7 32%,#f3ecf4 60%,#f9e3ef 84%,#fadbec 100%);overflow-y:auto}body[data-ds-dark-theme] .tBHptq_page{--t-ink:#e8e8ec;--t-ink-2:#e8e8ecad;--t-ink-3:#e8e8ec6b;--t-ink-fill:#ffffff14;--t-ink-fill-2:#ffffff0a;--today-accent:#b983f0;--today-accent-soft:#b983f024;--today-accent-ink:#cfa5f7;--brand-pink:#f08cc4;--today-warn:#fbbf24;--today-warn-soft:#fbbf2426;--today-warn-ink:#fcd34d;--dawn-1:#16324e;--dawn-2:#20293f;--dawn-3:#3d2b1f;--glass-bg:#ffffff0f;--glass-border:#ffffff1a;--glass-inset:inset 0 1px 1px #ffffff0d;--glass-e-bg:#ffffff12;--glass-e-border:#ffffff14;--glass-e-shadow:-4px 8px 28px #0003, 0 2px 8px #00000026;background:linear-gradient(#221f33 0%,#1e1b2c 32%,#1f1a24 60%,#291d29 84%,#2b1c28 100%)}.tBHptq_hero{padding:26px 0 18px;position:relative}.tBHptq_heroMain{z-index:1;position:relative}.tBHptq_heroDate{color:var(--t-ink-2);letter-spacing:.2px;margin-bottom:6px;font-size:13px}.tBHptq_heroGreeting{font-family:var(--font-sentient,\"Sentient\", Georgia, \"Times New Roman\", \"Songti SC\", \"STSong\", serif);letter-spacing:-.3px;background:linear-gradient(100deg, var(--t-ink) 55%, var(--brand-pink) 85%, var(--today-accent) 100%);color:#0000;-webkit-background-clip:text;background-clip:text;margin:0;font-size:32px;font-weight:500;line-height:1.2}.tBHptq_heroStats{flex-wrap:wrap;gap:8px;margin-top:16px;display:flex}.tBHptq_statChip{background:var(--glass-bg);border:.5px solid var(--glass-border);box-shadow:var(--glass-inset);-webkit-backdrop-filter:blur(40px)saturate(1.4);color:var(--t-ink-2);border-radius:999px;padding:7px 12px;font-size:12px;line-height:1}button.tBHptq_statChip{cursor:pointer;font-family:inherit;transition:color .16s,border-color .16s}button.tBHptq_statChip:hover{color:var(--t-ink);border-color:var(--t-ink-3)}.tBHptq_heroSide{z-index:1;flex-direction:column;align-items:flex-end;gap:10px;display:flex;position:absolute;top:26px;right:0}.tBHptq_chatButton{cursor:pointer;color:#fff;background:var(--t-ink);border:0;border-radius:999px;padding:10px 20px;font-size:13px;font-weight:500;transition:opacity .14s,transform .14s}.tBHptq_chatButton:hover{opacity:.85;transform:translateY(-1px)}body[data-ds-dark-theme] .tBHptq_chatButton{color:#1a1a1c;background:#e8e8ec}.tBHptq_updatedAt{color:var(--t-ink-2);cursor:pointer;background:0 0;border:0;border-radius:6px;padding:2px 4px;font-size:11px}.tBHptq_updatedAt:hover{background:var(--t-ink-fill)}.tBHptq_workingBar{z-index:1;text-align:left;border:.5px solid var(--glass-border);background:var(--glass-e-bg);width:100%;max-width:860px;box-shadow:var(--glass-e-shadow);-webkit-backdrop-filter:blur(24px)saturate(1.2);color:var(--t-ink);cursor:pointer;border-radius:14px;align-items:center;gap:8px;margin:20px auto 0;padding:10px 14px;font-size:13px;animation:.3s both tBHptq_today-fade-up;display:flex;position:relative}.tBHptq_workingBar:hover{border-color:var(--today-accent)}.tBHptq_workingDot{background:var(--today-accent);border-radius:50%;flex:none;width:8px;height:8px;animation:1.6s ease-in-out infinite tBHptq_today-pulse}@keyframes tBHptq_today-pulse{0%,to{opacity:1;transform:scale(1)}50%{opacity:.45;transform:scale(.82)}}@keyframes tBHptq_today-fade-up{0%{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}.tBHptq_tabs{z-index:6;border:.5px solid var(--glass-border);width:fit-content;max-width:calc(100% - 24px);box-shadow:var(--glass-inset), 0 8px 24px #58688c24;-webkit-backdrop-filter:blur(40px)saturate(1.4);scrollbar-width:none;background:#ffffff6b;border-radius:999px;gap:2px;margin:14px auto 0;padding:5px;display:flex;position:sticky;top:12px;overflow-x:auto}.tBHptq_tabs::-webkit-scrollbar{display:none}.tBHptq_tab{color:var(--t-ink-2);cursor:pointer;white-space:nowrap;background:0 0;border:0;border-radius:999px;flex-shrink:0;align-items:center;gap:6px;height:30px;padding:4px 18px;font-size:14px;line-height:22px;transition:background-color .15s,color .15s,box-shadow .15s;display:inline-flex}.tBHptq_tab:hover{color:var(--t-ink)}.tBHptq_tab[data-active=true]{color:var(--t-ink);background:#ffffffeb;font-weight:500;box-shadow:0 1px 4px #3c3b411f}body[data-ds-dark-theme] .tBHptq_tabs{background:#1c1c228c}body[data-ds-dark-theme] .tBHptq_tab[data-active=true]{color:#ececf0;box-shadow:none;background:#ffffff24}.tBHptq_tabBadge{text-align:center;color:#fff;background:var(--today-accent);border-radius:999px;min-width:15px;padding:3px 5px;font-size:10px;line-height:1}.tBHptq_body{max-width:860px;margin:0 auto;padding:8px 32px 72px}.tBHptq_sectionTitle{color:var(--t-ink-2);align-items:baseline;gap:8px;margin:30px 0 12px;font-size:14px;font-weight:500;display:flex}.tBHptq_sectionRow{flex-wrap:wrap;justify-content:space-between;align-items:center;gap:12px;display:flex}.tBHptq_sectionHint{color:var(--t-ink-3);margin:4px 0 0;font-size:13px;line-height:1.7}.tBHptq_countNote{color:var(--t-ink-3);font-size:12px;font-weight:400}.tBHptq_linkButton{color:var(--today-accent-ink);cursor:pointer;background:0 0;border:0;border-radius:6px;margin-left:auto;padding:2px 4px;font-size:12px}.tBHptq_linkButton:hover{background:var(--today-accent-soft)}.tBHptq_loading{padding:56px 0}.tBHptq_errorBox{border:.5px solid var(--glass-e-border);background:var(--glass-e-bg);width:100%;box-shadow:var(--glass-e-shadow);color:var(--dsw-alias-state-error-primary);cursor:pointer;text-align:center;border-radius:16px;margin-top:24px;padding:14px;font-size:13px;display:block}.tBHptq_emptyPanel{background:var(--t-ink-fill-2);text-align:center;border-radius:16px;margin-top:20px;padding:44px 28px}.tBHptq_emptyTitle{color:var(--t-ink);margin-bottom:8px;font-size:15px;font-weight:500}.tBHptq_emptyText{color:var(--t-ink-3);margin:0;font-size:13px;line-height:1.7}.tBHptq_eventsCard{margin-top:10px}.tBHptq_eventsCard .tBHptq_sectionTitle{margin-top:0}.tBHptq_eventLoc{text-overflow:ellipsis;white-space:nowrap;max-width:140px;color:var(--t-ink-3);flex:none;font-size:11.5px;overflow:hidden}.tBHptq_latestBrief{border-top:.5px solid var(--glass-e-border);border-bottom:.5px solid var(--glass-e-border);text-align:center;flex-direction:column;align-items:center;gap:10px;margin:26px 0 4px;padding:18px 20px;display:flex}.tBHptq_latestBriefText{color:var(--t-ink-2);margin:0;font-size:13px;line-height:1.7}.tBHptq_latestBriefCta{color:var(--today-accent-ink);background:var(--today-accent-soft);cursor:pointer;border:0;border-radius:999px;padding:8px 18px;font-size:12.5px;font-weight:600}.tBHptq_latestBriefCta:hover{filter:brightness(1.05)}.tBHptq_creatingCard{border:.5px solid var(--glass-e-border);background:var(--glass-e-bg);color:var(--t-ink-3);border-radius:16px;margin-top:10px;padding:16px 18px;font-size:13px;animation:1.6s ease-in-out infinite tBHptq_todayPulse}@keyframes tBHptq_todayPulse{0%,to{opacity:.55}50%{opacity:1}}.tBHptq_feedDay{margin-top:22px}.tBHptq_feedDay:first-of-type{margin-top:10px}.tBHptq_dayHead{letter-spacing:.4px;color:var(--t-ink-3);align-items:center;gap:14px;margin:0 0 6px;font-size:11.5px;font-weight:500;display:flex}.tBHptq_dayHead:before,.tBHptq_dayHead:after{content:\"\";background:var(--t-ink-fill);flex:1;height:.5px}.tBHptq_feedGroup{margin-top:16px;transition:opacity .38s,transform .38s}.tBHptq_feedGroup[data-batch-revealed=false]{opacity:0;transform:translateY(14px)}.tBHptq_feedGroup[data-batch-revealed=true]{opacity:1;transform:none}.tBHptq_batchHead{z-index:4;text-align:center;flex-direction:column;align-items:center;padding:8px 4px 10px;display:flex;position:sticky;top:54px}.tBHptq_batchHead:before{content:\"\";z-index:-1;background:linear-gradient(to bottom, var(--page-bg-a,#dcd9f600) 30%, transparent);-webkit-backdrop-filter:blur(14px);position:absolute;inset:0 -30px -6px;-webkit-mask-image:linear-gradient(#000 55%,#0000);mask-image:linear-gradient(#000 55%,#0000)}.tBHptq_batchHeadTime{color:var(--t-ink-3);font-variant-numeric:tabular-nums;font-size:12px;font-weight:500;line-height:20px}.tBHptq_batchHeadTitle{letter-spacing:0;color:var(--t-ink);margin:0;font-size:14px;font-weight:500;line-height:20px;display:inline-block;position:relative}.tBHptq_titleAmbient{pointer-events:none;position:absolute;inset:-6px}.tBHptq_sparkle{opacity:0;will-change:transform, opacity;animation:ease-in-out infinite tBHptq_today-sparkle-pop;position:absolute}@keyframes tBHptq_today-sparkle-pop{0%,to{opacity:0;transform:scale(0)rotate(75deg)}35%,55%{opacity:var(--sp-op,.7);transform:scale(1)rotate(150deg)}}.tBHptq_bokeh{pointer-events:none;width:96px;height:96px;position:absolute;top:50%;left:50%;transform:translate(-50%,-56%)}.tBHptq_bokehSpin{animation:32s linear infinite tBHptq_today-bokeh-spin;position:absolute;inset:0}.tBHptq_bokehHalo{filter:blur(6px);background:radial-gradient(circle,#ffbe6466,#ffbe6400 70%);border-radius:50%;width:72px;height:72px;animation:4.5s ease-in-out infinite tBHptq_today-bokeh-halo;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%)}.tBHptq_bokehCore{background:#ffba5ce6;border-radius:50%;width:10px;height:10px;animation:4.5s ease-in-out infinite tBHptq_today-bokeh-core;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%)}@keyframes tBHptq_today-bokeh-spin{to{transform:rotate(360deg)}}@keyframes tBHptq_today-bokeh-halo{0%,to{opacity:.55;transform:translate(-50%,-50%)scale(.92)}50%{opacity:.9;transform:translate(-50%,-50%)scale(1.08)}}@keyframes tBHptq_today-bokeh-core{0%,to{opacity:.85}50%{opacity:1}}@media (prefers-reduced-motion:reduce){.tBHptq_sparkle,.tBHptq_bokehSpin,.tBHptq_bokehHalo,.tBHptq_bokehCore{animation:none!important}}.tBHptq_guidanceMark{width:20px;height:20px;color:var(--today-accent);justify-content:center;align-items:center;margin-bottom:2px;font-size:14px;display:inline-flex}.tBHptq_unreadPill{z-index:12;border:.5px solid var(--glass-e-border);background:var(--glass-e-bg);box-shadow:var(--glass-e-shadow);-webkit-backdrop-filter:blur(24px)saturate(1.4);color:var(--today-accent);cursor:pointer;border-radius:999px;margin:0 auto 10px;padding:7px 16px;font-size:12px;font-weight:500;display:block;position:sticky;top:54px}.tBHptq_customizeRow{justify-content:flex-end;margin:4px 0 2px;display:flex}.tBHptq_customizePanel{margin-top:6px}.tBHptq_watchHint{border:.5px dashed var(--glass-e-border);background:#ffffff59;border-radius:20px;align-items:flex-start;gap:12px;margin-top:8px;padding:14px 16px;display:flex}.tBHptq_watchHintIcon{color:var(--today-accent);margin-top:2px;font-size:18px}.tBHptq_watchHintText{flex:1;min-width:0}.tBHptq_watchHintTitle{color:var(--t-ink);font-size:13px;font-weight:600}.tBHptq_watchHintBody{color:var(--t-ink-2);margin:4px 0 10px;font-size:12px;line-height:1.6}.tBHptq_watchHintClose{color:var(--t-ink-3);cursor:pointer;background:0 0;border:0;padding:2px 4px;font-size:12px}.tBHptq_watchActions{align-items:center;gap:2px;margin-left:auto;display:none}.tBHptq_watchRow:hover .tBHptq_watchActions,.tBHptq_watchRow:focus-within .tBHptq_watchActions{display:inline-flex}.tBHptq_watchAction{width:24px;height:24px;color:var(--t-ink-2);cursor:pointer;background:0 0;border:0;border-radius:50%;font-size:12px}.tBHptq_watchAction:hover{background:var(--t-ink-fill);color:var(--t-ink)}@media (hover:none){.tBHptq_watchActions{display:inline-flex}}body[data-ds-dark-theme] .tBHptq_watchHint{background:#ffffff0d}.tBHptq_scheduleList{border:.5px solid var(--glass-e-border);background:var(--glass-e-bg);box-shadow:var(--glass-e-shadow);-webkit-backdrop-filter:blur(24px)saturate(1.2);border-radius:16px;margin:0;padding:0;list-style:none;overflow:hidden}.tBHptq_scheduleRow{align-items:center;gap:10px;padding:11px 14px;font-size:13px;display:flex}.tBHptq_scheduleRow+.tBHptq_scheduleRow{border-top:.5px solid var(--glass-e-border)}.tBHptq_scheduleDot{background:var(--t-ink-3);border-radius:50%;flex:none;width:7px;height:7px}.tBHptq_scheduleDot[data-status=active]{background:var(--today-accent)}.tBHptq_scheduleDot[data-status=paused]{background:var(--today-warn)}.tBHptq_scheduleDot[data-status=ended]{opacity:.4}.tBHptq_scheduleRow[data-status=paused] .tBHptq_scheduleTitle,.tBHptq_scheduleRow[data-status=ended] .tBHptq_scheduleTitle{color:var(--t-ink-3)}.tBHptq_scheduleTitle{text-overflow:ellipsis;white-space:nowrap;min-width:0;color:var(--t-ink);flex:1;overflow:hidden}.tBHptq_scheduleTime{color:var(--t-ink-3);flex:none;font-size:12px}.tBHptq_chip{border:.5px solid var(--glass-e-border);color:var(--t-ink-2);border-radius:999px;flex:none;padding:4px 8px;font-size:11px;line-height:1}.tBHptq_chip[data-tone=active],.tBHptq_chip[data-tone=run]{color:var(--today-accent-ink);background:var(--today-accent-soft);border-color:#0000}.tBHptq_chip[data-tone=paused]{color:var(--today-warn-ink);background:var(--today-warn-soft);border-color:#0000}.tBHptq_chip[data-tone=ended]{opacity:.6}.tBHptq_chip[data-tone=soon]{color:#b0722a;background:#ffc46e3d}body[data-ds-dark-theme] .tBHptq_chip[data-tone=soon]{color:#f0c68a;background:#ffc46e24}.tBHptq_chip[data-tone=kind]{color:var(--t-ink-3)}.tBHptq_chip[data-tone=source]{color:var(--t-ink-3);border-style:dashed}.tBHptq_edgeLight{z-index:2;pointer-events:none;border-radius:inherit;mask-image:conic-gradient(from var(--cursor-angle,45deg) at center, black 3%, transparent 12%, transparent 88%, black 97%);-webkit-mask-image:conic-gradient(from var(--cursor-angle,45deg) at center, black 3%, transparent 12%, transparent 88%, black 97%);opacity:var(--edge-proximity,0);transition:opacity .25s cubic-bezier(.8,0,0,1);position:absolute;inset:-30px}.tBHptq_edgeLight:before{content:\"\";border-radius:inherit;position:absolute;inset:30px;box-shadow:inset 0 0 0 1px #f5daa3d9,inset 0 0 2px #f5daa399,inset 0 0 8px #f5daa373,inset 0 0 22px 2px #f5daa347,0 0 2px #f5daa380,0 0 14px #f5daa34d}.tBHptq_menuWrap{flex:none;position:relative}.tBHptq_feedMenu{z-index:30;border:.5px solid var(--glass-e-border);background:var(--glass-e-bg);min-width:132px;box-shadow:var(--glass-e-shadow), 0 8px 24px #00000014;-webkit-backdrop-filter:blur(40px)saturate(1.4);border-radius:14px;flex-direction:column;padding:5px;animation:.16s both tBHptq_today-fade-up;display:flex;position:absolute;top:calc(100% + 6px);right:-6px}.tBHptq_menuItem{text-align:left;color:var(--t-ink-2);cursor:pointer;white-space:nowrap;background:0 0;border:0;border-radius:9px;padding:9px 12px;font-size:13px;line-height:1}.tBHptq_menuItem:hover{background:var(--t-ink-fill);color:var(--t-ink)}.tBHptq_menuItem[data-active]{color:var(--today-accent-ink)}.tBHptq_menuItemDanger{color:#e5484d}.tBHptq_menuItemDanger:hover{color:#e5484d;background:#e5484d17}.tBHptq_feedEnd{text-align:center;color:var(--t-ink-3);margin:26px 0 0;font-size:12px;line-height:1.7}.tBHptq_feedLoading{text-align:center;color:var(--t-ink-3);margin:18px 0 0;font-size:12px;line-height:1.7}.tBHptq_feedList{flex-direction:column;gap:10px;margin:0;padding:0;list-style:none;display:flex}.tBHptq_feedCard{border:.5px solid var(--glass-e-border);background:var(--glass-e-bg);box-shadow:var(--glass-e-shadow);-webkit-backdrop-filter:blur(30px);border-radius:24px;padding:14px 16px;transition:border-color .14s,transform .14s;animation:.26s both tBHptq_today-fade-up;position:relative}.tBHptq_feedCard:hover{border-color:var(--t-ink-fill);transform:translateY(-1px)}.tBHptq_feedCard[data-nav]{cursor:pointer}.tBHptq_feedCard:has(.tBHptq_feedMenu){z-index:10}.tBHptq_feedHead{align-items:center;gap:10px;margin-bottom:6px;display:flex}.tBHptq_feedProvider{letter-spacing:.6px;color:var(--t-ink-2);align-items:center;gap:6px;font-size:11px;font-weight:700;line-height:1.5;display:inline-flex}.tBHptq_feedProvider[data-kind=result] .tBHptq_feedKindIcon{color:var(--today-accent)}.tBHptq_feedProvider[data-kind=moment] .tBHptq_feedKindIcon{color:var(--today-warn)}.tBHptq_newBadge{color:#fff;background:var(--today-accent);border-radius:999px;padding:3px 7px;font-size:10px;font-weight:600;line-height:1}.tBHptq_feedKind{color:var(--t-ink-3);align-items:center;gap:5px;font-size:11px;display:inline-flex}.tBHptq_feedKindIcon{font-size:11px}.tBHptq_feedKind[data-kind=result]{color:var(--today-accent-ink)}.tBHptq_feedKind[data-kind=moment]{color:var(--today-warn-ink)}.tBHptq_feedTime{color:var(--t-ink-3);margin-left:auto;font-size:11px}.tBHptq_feedTitle{color:var(--t-ink);-webkit-line-clamp:2;-webkit-box-orient:vertical;font-size:15px;font-weight:600;line-height:1.5;display:-webkit-box;overflow:hidden}.tBHptq_feedBody{color:var(--t-ink-2);white-space:pre-wrap;word-break:break-word;margin-top:6px;font-size:13px;line-height:1.7}.tBHptq_feedBodyClamped{-webkit-line-clamp:4;-webkit-box-orient:vertical;display:-webkit-box;overflow:hidden}.tBHptq_feedExpand{color:var(--t-ink-3);cursor:pointer;background:0 0;border:0;margin-top:4px;padding:0;font-size:12px;line-height:1.5}.tBHptq_feedExpand:hover{color:var(--today-accent)}.tBHptq_scheduleMore{color:var(--t-ink-3);cursor:pointer;background:0 0;border:0;margin:6px auto 0;padding:0;font-size:12px;line-height:1.5;display:block}.tBHptq_scheduleMore:hover{color:var(--today-accent)}.tBHptq_adjustBox{border:.5px solid var(--glass-e-border);background:#ffffff8c;border-radius:14px;margin-top:10px;padding:10px 12px}.tBHptq_adjustInput{box-sizing:border-box;resize:none;width:100%;font:inherit;color:var(--t-ink);background:0 0;border:0;outline:none;font-size:13px;line-height:1.6}.tBHptq_adjustRow{justify-content:flex-end;align-items:center;gap:10px;margin-top:6px;display:flex}.tBHptq_adjustSaved{color:var(--t-ink-3);margin:8px 0 0;font-size:12px}body[data-ds-dark-theme] .tBHptq_adjustBox{background:#ffffff0f}.tBHptq_suggestRow{flex-wrap:wrap;gap:8px;margin-top:12px;display:flex}.tBHptq_suggestChip{color:var(--t-ink-2);cursor:pointer;background:#26262e0f;border:0;border-radius:12px;padding:8px 14px;font-size:13px;font-weight:600;line-height:1;transition:border-color .12s,color .12s,background .12s}.tBHptq_suggestChip:hover:not(:disabled){border-color:var(--today-accent);color:var(--today-accent-ink);background:var(--today-accent-soft)}.tBHptq_suggestChip:disabled{opacity:.6;cursor:default}.tBHptq_iconButton{color:var(--t-ink-3);cursor:pointer;opacity:0;background:0 0;border:0;border-radius:6px;padding:2px 6px;font-size:15px;line-height:1;transition:opacity .12s}@media (hover:none){.tBHptq_iconButton{opacity:1}}.tBHptq_feedCard:hover .tBHptq_iconButton,.tBHptq_diaryEntry:hover .tBHptq_iconButton,.tBHptq_iconButton:focus-visible{opacity:1}.tBHptq_iconButton:hover{color:var(--t-ink);background:var(--t-ink-fill)}.tBHptq_miniButton{border:.5px solid var(--glass-e-border);color:var(--t-ink-2);cursor:pointer;background:0 0;border-radius:999px;flex:none;padding:5px 10px;font-size:11px;line-height:1}.tBHptq_miniButton:hover:not(:disabled){color:var(--today-accent-ink);border-color:var(--today-accent);background:var(--today-accent-soft)}.tBHptq_miniButton:disabled{opacity:.5;cursor:default}.tBHptq_miniButton[data-active]{color:var(--today-accent-ink);border-color:var(--today-accent);background:var(--today-accent-soft)}.tBHptq_feedCard[data-pinned]{border-color:var(--today-accent)}.tBHptq_unreadDot{background:var(--today-accent);border-radius:50%;flex:none;width:7px;height:7px}.tBHptq_cardList{color:var(--t-ink-2);flex-direction:column;gap:3px;margin:6px 0 0;padding:0 0 0 18px;font-size:12.5px;display:flex}.tBHptq_cardMetric{align-items:baseline;gap:6px;margin-top:8px;display:flex}.tBHptq_cardMetricValue{color:var(--t-ink);font-size:22px;font-weight:500}.tBHptq_cardMetricUnit{color:var(--t-ink-3);font-size:12px}.tBHptq_cardMetricDelta{color:var(--today-accent-ink);font-size:12px}.tBHptq_cardProgress{align-items:center;gap:8px;margin-top:8px;display:flex}.tBHptq_cardProgressBar{background:var(--t-ink-fill);border-radius:3px;flex:1;height:6px;overflow:hidden}.tBHptq_cardProgressBar>span{background:var(--today-accent);border-radius:3px;height:100%;display:block}.tBHptq_cardProgressText{color:var(--t-ink-3);flex:none;font-size:11px}.tBHptq_jobList{flex-direction:column;gap:10px;margin:0;padding:0;list-style:none;display:flex}.tBHptq_jobCard{border:.5px solid var(--glass-e-border);background:var(--glass-e-bg);box-shadow:var(--glass-e-shadow);-webkit-backdrop-filter:blur(30px);border-radius:16px;padding:14px 16px;animation:.26s both tBHptq_today-fade-up}.tBHptq_jobCard[data-status=running]{border-left:3px solid var(--today-accent)}.tBHptq_jobCard[data-status=failed],.tBHptq_jobCard[data-status=killed]{border-left:3px solid var(--dsw-alias-state-error-primary)}.tBHptq_jobHead{align-items:center;gap:10px;display:flex}.tBHptq_jobStatus{background:var(--t-ink-3);border-radius:50%;flex:none;width:8px;height:8px}.tBHptq_jobStatus[data-status=running],.tBHptq_jobStatus[data-status=stopping]{background:var(--today-accent);animation:1.6s ease-in-out infinite tBHptq_today-pulse}.tBHptq_jobStatus[data-status=completed]{background:#30a46c}.tBHptq_jobStatus[data-status=failed],.tBHptq_jobStatus[data-status=killed]{background:var(--dsw-alias-state-error-primary)}.tBHptq_jobLabel{min-width:0;color:var(--t-ink);text-overflow:ellipsis;white-space:nowrap;flex:1;font-size:13px;font-weight:500;overflow:hidden}.tBHptq_jobTime{color:var(--t-ink-3);font-variant-numeric:tabular-nums;flex:none;font-size:11px}.tBHptq_jobDetail{color:var(--t-ink-3);word-break:break-word;margin-top:6px;font-size:12px;line-height:1.6}.tBHptq_jobFoot{align-items:center;gap:8px;margin-top:10px;display:flex}.tBHptq_quickAdd{gap:8px;display:flex}.tBHptq_quickInput{min-width:160px;height:32px;color:var(--t-ink);background:var(--glass-e-bg);border:.5px solid var(--glass-e-border);border-radius:9px;outline:none;flex:1;padding:0 12px;font-size:13px}.tBHptq_quickInput::placeholder{color:var(--t-ink-3)}.tBHptq_quickInput:focus{border-color:var(--today-accent)}.tBHptq_searchInput{min-width:180px;height:32px;color:var(--t-ink);background:var(--glass-e-bg);border:.5px solid var(--glass-e-border);border-radius:999px;outline:none;padding:0 12px;font-size:13px}.tBHptq_searchInput::placeholder{color:var(--t-ink-3)}.tBHptq_searchInput:focus{border-color:var(--today-accent)}.tBHptq_quickButton{cursor:pointer;color:#fff;background:var(--t-ink);border:0;border-radius:999px;height:32px;padding:0 14px;font-size:13px}body[data-ds-dark-theme] .tBHptq_quickButton{color:#1a1a1c}.tBHptq_quickButton:disabled{opacity:.45;cursor:default}.tBHptq_aboutCard{border:.5px solid var(--glass-e-border);background:linear-gradient(160deg, var(--today-accent-soft), transparent 70%), var(--glass-e-bg);box-shadow:var(--glass-e-shadow);-webkit-backdrop-filter:blur(30px);border-radius:16px;margin-top:18px;padding:18px 20px}.tBHptq_aboutTitle{color:var(--t-ink);margin:0 0 4px;font-size:14px;font-weight:500}.tBHptq_aboutHint{color:var(--t-ink-3);margin:0;font-size:12px;line-height:1.7}.tBHptq_aboutList{gap:8px;margin:10px 0 0;padding:0;list-style:none;display:grid}.tBHptq_aboutItem{color:var(--t-ink-2);padding-left:14px;font-size:13px;line-height:1.65;position:relative}.tBHptq_aboutItem:before{content:\"\";background:var(--today-accent);border-radius:50%;width:5px;height:5px;position:absolute;top:9px;left:0}.tBHptq_memoryList{border:.5px solid var(--glass-e-border);background:var(--glass-e-bg);box-shadow:var(--glass-e-shadow);-webkit-backdrop-filter:blur(24px)saturate(1.2);border-radius:16px;margin:0;padding:0;list-style:none;overflow:hidden}.tBHptq_memoryRow{padding:12px 14px}.tBHptq_memoryRow+.tBHptq_memoryRow{border-top:.5px solid var(--glass-e-border)}.tBHptq_memoryText{color:var(--t-ink);-webkit-line-clamp:3;-webkit-box-orient:vertical;font-size:13px;line-height:1.65;display:-webkit-box;overflow:hidden}.tBHptq_memoryMeta{color:var(--t-ink-3);flex-wrap:wrap;align-items:center;gap:12px;margin-top:6px;font-size:11px;display:flex}.tBHptq_memorySession{text-overflow:ellipsis;white-space:nowrap;max-width:220px;overflow:hidden}.tBHptq_fresh{align-items:center;gap:6px;display:inline-flex}.tBHptq_freshBar{background:var(--t-ink-fill);border-radius:2px;width:44px;height:4px;overflow:hidden}.tBHptq_freshFill{background:var(--today-accent);border-radius:2px;height:100%;display:block}.tBHptq_diaryLayout{grid-template-columns:200px 1fr;align-items:start;gap:20px;margin-top:18px;display:grid}.tBHptq_diaryList{flex-direction:column;gap:4px;margin:0;padding:0;list-style:none;display:flex}.tBHptq_diaryDate{cursor:pointer;text-align:left;background:0 0;border:.5px solid #0000;border-radius:12px;flex-direction:column;align-items:flex-start;gap:2px;width:100%;padding:10px 12px;display:flex}.tBHptq_diaryDate:hover{background:var(--t-ink-fill-2)}.tBHptq_diaryDate[data-active=true]{background:var(--today-accent-soft);border-color:var(--today-accent)}.tBHptq_diaryDateNum{color:var(--t-ink);font-size:14px;font-weight:500}.tBHptq_diaryPreview{color:var(--t-ink-3);text-overflow:ellipsis;white-space:nowrap;max-width:100%;font-size:12px;overflow:hidden}.tBHptq_diaryCount{color:var(--t-ink-3);font-size:11px}.tBHptq_diaryDetail{border:.5px solid var(--glass-e-border);background:var(--glass-e-bg);box-shadow:var(--glass-e-shadow);-webkit-backdrop-filter:blur(30px);border-radius:16px;min-height:200px;padding:18px 20px}.tBHptq_diaryEntries{margin:0 0 14px;padding:0;list-style:none}.tBHptq_diaryEntry{align-items:baseline;gap:10px;padding:9px 0;display:flex}.tBHptq_diaryEntry+.tBHptq_diaryEntry{border-top:.5px solid var(--glass-e-border)}.tBHptq_diaryTime{color:var(--t-ink-3);font-variant-numeric:tabular-nums;flex:none;padding-top:2px;font-size:12px}.tBHptq_diaryBody{flex:1;min-width:0}.tBHptq_authorBadge{vertical-align:1px;border-radius:999px;margin-right:8px;padding:3px 7px;font-size:10px;line-height:1;display:inline-block}.tBHptq_authorBadge[data-author=agent]{color:var(--today-accent-ink);background:var(--today-accent-soft)}.tBHptq_authorBadge[data-author=me]{color:var(--t-ink-3);background:var(--t-ink-fill)}.tBHptq_diaryText{color:var(--t-ink);white-space:pre-wrap;word-break:break-word;font-family:Kaiti SC,STKaiti,KaiTi,楷体,Georgia,serif;font-size:14px;line-height:1.85}.tBHptq_diaryEntry .tBHptq_iconButton{flex:none;align-self:center}.tBHptq_pageTitleRow{justify-content:space-between;align-items:center;gap:12px;margin-top:26px;display:flex}.tBHptq_pageTitle{letter-spacing:-.2px;color:var(--t-ink);margin:0;font-size:22px;font-weight:500}.tBHptq_createButton{cursor:pointer;height:34px;color:var(--t-ink);border:0;border:.5px solid var(--glass-border);background:#ffffffd9;border-radius:999px;padding:0 16px;font-size:13px;font-weight:500;transition:transform .14s,box-shadow .14s;box-shadow:0 1px 4px #3c3b411a}.tBHptq_createButton:hover{transform:translateY(-1px);box-shadow:0 4px 12px #3c3b4129}body[data-ds-dark-theme] .tBHptq_createButton{background:#ffffff1f}.tBHptq_backButton{cursor:pointer;width:34px;height:34px;color:var(--t-ink-2);border:0;border:.5px solid var(--glass-border);background:#ffffffbf;border-radius:50%;flex:none;font-size:20px;line-height:1;box-shadow:0 1px 4px #3c3b411a}.tBHptq_backButton:hover{background:#fffffff2}body[data-ds-dark-theme] .tBHptq_backButton{background:#ffffff1a}.tBHptq_segmented{border:.5px solid var(--glass-border);box-shadow:var(--glass-inset);-webkit-backdrop-filter:blur(24px)saturate(1.2);background:#ffffff57;border-radius:16px;gap:4px;margin-top:18px;padding:5px;display:flex}.tBHptq_seg{height:36px;color:var(--t-ink-2);cursor:pointer;background:0 0;border:0;border-radius:12px;flex:1;justify-content:center;align-items:center;gap:7px;font-size:14px;transition:background-color .15s,color .15s,box-shadow .15s;display:flex}.tBHptq_seg:hover{color:var(--t-ink)}.tBHptq_seg[data-active=true]{color:var(--t-ink);background:#fffffff2;font-weight:500;box-shadow:0 1px 4px #3c3b411f}.tBHptq_segIcon{font-size:15px;line-height:1}body[data-ds-dark-theme] .tBHptq_segmented{background:#ffffff0f}body[data-ds-dark-theme] .tBHptq_seg[data-active=true]{color:#ececf0;box-shadow:none;background:#ffffff24}.tBHptq_recoTitle{color:var(--t-ink);margin:22px 0 12px;font-size:16px;font-weight:500}.tBHptq_recoList{gap:10px;margin:0;padding:0;list-style:none;display:grid}.tBHptq_recoCard{border:.5px solid var(--glass-border);box-shadow:var(--glass-inset);-webkit-backdrop-filter:blur(24px)saturate(1.2);background:#ffffff85;border-radius:18px;align-items:center;gap:14px;padding:14px 16px;transition:background-color .15s;display:flex}.tBHptq_recoCard:hover{background:#ffffffad}body[data-ds-dark-theme] .tBHptq_recoCard{background:#ffffff0f}body[data-ds-dark-theme] .tBHptq_recoCard:hover{background:#ffffff17}.tBHptq_recoIcon{border-radius:10px;flex:none;justify-content:center;align-items:center;width:34px;height:34px;font-size:16px;display:flex}.tBHptq_recoIcon[data-tone=blue]{color:#8b4ad0;background:#a55ee824}.tBHptq_recoIcon[data-tone=violet]{color:#7c4de8;background:#8b5cf621}.tBHptq_recoIcon[data-tone=green]{color:#1e8a54;background:#30a46c21}.tBHptq_recoIcon[data-tone=amber]{color:#8a5d00;background:#ffc53d33}.tBHptq_recoIcon[data-tone=red]{color:#c93a3f;background:#e5484d1c}.tBHptq_recoIcon[data-tone=pink]{color:#d44d82;background:#ec5b8d21}body[data-ds-dark-theme] .tBHptq_recoIcon[data-tone=blue]{color:#cfa5f7}body[data-ds-dark-theme] .tBHptq_recoIcon[data-tone=violet]{color:#b39afb}body[data-ds-dark-theme] .tBHptq_recoIcon[data-tone=green]{color:#52c98a}body[data-ds-dark-theme] .tBHptq_recoIcon[data-tone=amber]{color:#fbbf24}body[data-ds-dark-theme] .tBHptq_recoIcon[data-tone=red]{color:#f07f83}body[data-ds-dark-theme] .tBHptq_recoIcon[data-tone=pink]{color:#f48ab3}.tBHptq_recoText{flex-direction:column;flex:1;gap:3px;min-width:0;display:flex}.tBHptq_recoName{color:var(--t-ink);font-size:14px;font-weight:500}.tBHptq_recoDesc{color:var(--t-ink-3);-webkit-line-clamp:2;-webkit-box-orient:vertical;font-size:12px;line-height:1.55;display:-webkit-box;overflow:hidden}.tBHptq_recoAdd{cursor:pointer;width:30px;height:30px;color:var(--t-ink-2);background:#ffffffe6;border:0;border-radius:50%;flex:none;font-size:16px;line-height:1;transition:transform .14s,color .14s;box-shadow:0 1px 4px #3c3b4124}.tBHptq_recoAdd:hover{color:var(--t-ink);transform:scale(1.08)}.tBHptq_recoAdd:disabled{color:var(--today-accent)}body[data-ds-dark-theme] .tBHptq_recoAdd{background:#ffffff24}.tBHptq_catGrid{grid-template-columns:repeat(3,1fr);gap:12px;margin:0;padding:0;list-style:none;display:grid}.tBHptq_catCard{text-align:left;cursor:pointer;border:0;border:.5px solid var(--glass-border);width:100%;box-shadow:var(--glass-inset);-webkit-backdrop-filter:blur(24px)saturate(1.2);background:#ffffff85;border-radius:18px;flex-direction:column;align-items:flex-start;gap:8px;padding:16px;transition:background-color .15s,transform .15s;display:flex}.tBHptq_catCard:hover{background:#ffffffb3;transform:translateY(-1px)}body[data-ds-dark-theme] .tBHptq_catCard{background:#ffffff0f}body[data-ds-dark-theme] .tBHptq_catCard:hover{background:#ffffff17}.tBHptq_catIcon{border-radius:10px;justify-content:center;align-items:center;width:34px;height:34px;font-size:16px;display:flex}.tBHptq_catIcon[data-tone=pink]{color:#d44d82;background:#ec5b8d26}.tBHptq_catIcon[data-tone=blue]{color:#8b4ad0;background:#a55ee824}.tBHptq_catIcon[data-tone=amber]{color:#8a5d00;background:#ffc53d33}.tBHptq_catIcon[data-tone=green]{color:#1e8a54;background:#30a46c21}.tBHptq_catIcon[data-tone=violet]{color:#7c4de8;background:#8b5cf621}.tBHptq_catIcon[data-tone=red]{color:#c93a3f;background:#e5484d1c}body[data-ds-dark-theme] .tBHptq_catIcon[data-tone=pink]{color:#f48ab3}body[data-ds-dark-theme] .tBHptq_catIcon[data-tone=blue]{color:#cfa5f7}body[data-ds-dark-theme] .tBHptq_catIcon[data-tone=amber]{color:#fbbf24}body[data-ds-dark-theme] .tBHptq_catIcon[data-tone=green]{color:#52c98a}body[data-ds-dark-theme] .tBHptq_catIcon[data-tone=violet]{color:#b39afb}body[data-ds-dark-theme] .tBHptq_catIcon[data-tone=red]{color:#f07f83}.tBHptq_catName{color:var(--t-ink);text-overflow:ellipsis;white-space:nowrap;max-width:100%;font-size:14px;font-weight:500;overflow:hidden}.tBHptq_catCount{color:var(--t-ink-3);font-size:12px}.tBHptq_aboutCrown{color:#f5a623;font-size:18px}.tBHptq_aboutMeta{color:var(--t-ink-3);margin-top:2px;font-size:12px}.tBHptq_aboutLabel{color:var(--t-ink-3);margin-top:14px;font-size:12px;font-weight:500}.tBHptq_monthHead{text-align:center;color:var(--t-ink-3);margin:26px 0 14px;font-size:13px;font-weight:500}.tBHptq_diaryGrid{columns:2;column-gap:14px;margin:0;padding:0;list-style:none}.tBHptq_diaryGrid>li{break-inside:avoid;margin-bottom:14px}.tBHptq_diaryCard{text-align:left;cursor:pointer;border:0;border:.5px solid var(--glass-border);width:100%;box-shadow:var(--glass-inset);-webkit-backdrop-filter:blur(24px)saturate(1.2);background:#ffffff8c;border-radius:20px;flex-direction:column;align-items:flex-start;gap:8px;padding:16px;transition:background-color .15s,transform .15s;display:flex}.tBHptq_diaryCard:hover{background:#ffffffb8;transform:translateY(-1px)}body[data-ds-dark-theme] .tBHptq_diaryCard{background:#ffffff0f}body[data-ds-dark-theme] .tBHptq_diaryCard:hover{background:#ffffff17}.tBHptq_diaryBadge{background:#ffffffd9;border-radius:10px;flex-direction:column;align-items:center;width:40px;display:flex;overflow:hidden;box-shadow:0 1px 3px #3c3b411a}.tBHptq_diaryBadgeWeek{text-align:center;color:#fff;width:100%;padding:4px 0;font-size:10px;line-height:1}.tBHptq_diaryBadge[data-tone=blue] .tBHptq_diaryBadgeWeek{background:#7ea9e8}.tBHptq_diaryBadge[data-tone=peach] .tBHptq_diaryBadgeWeek{background:#f0a869}.tBHptq_diaryBadge[data-tone=violet] .tBHptq_diaryBadgeWeek{background:#a78bfa}.tBHptq_diaryBadge[data-tone=green] .tBHptq_diaryBadgeWeek{background:#6bbf92}.tBHptq_diaryBadge[data-tone=pink] .tBHptq_diaryBadgeWeek{background:#ec8fb4}.tBHptq_diaryBadge[data-tone=amber] .tBHptq_diaryBadgeWeek{background:#dfa94e}.tBHptq_diaryBadgeDay{color:var(--t-ink);padding:6px 0 7px;font-size:17px;font-weight:500;line-height:1}.tBHptq_diaryCardTitle{color:var(--t-ink);-webkit-line-clamp:2;-webkit-box-orient:vertical;font-size:15px;font-weight:500;line-height:1.4;display:-webkit-box;overflow:hidden}.tBHptq_diaryCardBody{color:var(--t-ink-3);-webkit-line-clamp:4;-webkit-box-orient:vertical;font-size:13px;line-height:1.6;display:-webkit-box;overflow:hidden}.tBHptq_diaryCardCount{color:var(--t-ink-3);font-size:11px}@media (width<=760px){.tBHptq_hero{padding:20px 0 14px}.tBHptq_heroGreeting{font-size:26px}.tBHptq_heroSide{flex-direction:row;align-items:center;margin-top:16px;position:static}.tBHptq_body{padding:8px 20px 56px}.tBHptq_catGrid{grid-template-columns:repeat(2,1fr)}}@media (width<=640px){.tBHptq_diaryLayout{grid-template-columns:1fr}.tBHptq_diaryGrid{columns:1}.tBHptq_pageTitle{font-size:19px}}.tBHptq_tvRow{border:1px solid var(--dsh-border,#e3e3e3);background:var(--dsh-bg-elevated,#fff);border-radius:10px;max-width:560px;margin:4px 0;padding:10px 14px}.tBHptq_tvRow[data-error]{border-color:var(--dsh-danger,#c0392b)}.tBHptq_tvHead{align-items:center;gap:8px;display:flex}.tBHptq_tvBadge{background:var(--dsh-accent-soft,#eef4ff);color:var(--dsh-accent,#2f6fed);border-radius:4px;flex-shrink:0;padding:1px 6px;font-size:11px}.tBHptq_tvTitle{text-overflow:ellipsis;white-space:nowrap;font-size:13px;font-weight:500;overflow:hidden}.tBHptq_tvBatch{opacity:.55;flex-shrink:0;font-size:11px}.tBHptq_tvState{opacity:.6;flex-shrink:0;margin-left:auto;font-size:11px}.tBHptq_tvSummary{opacity:.8;white-space:pre-wrap;margin-top:6px;font-size:12px}.tBHptq_tvList{margin:6px 0 0;padding-left:18px;font-size:12px}.tBHptq_tvList li{margin:2px 0}.tBHptq_tvMetric{align-items:baseline;gap:8px;margin-top:6px;display:flex}.tBHptq_tvMetricValue{font-size:20px;font-weight:500}.tBHptq_tvMetricLabel{opacity:.7;font-size:12px}.tBHptq_tvProgress{margin-top:8px}.tBHptq_tvProgressBar{background:var(--dsh-border,#e3e3e3);border-radius:3px;height:6px;overflow:hidden}.tBHptq_tvProgressFill{background:var(--dsh-accent,#2f6fed);border-radius:3px;height:100%}.tBHptq_tvProgressText{opacity:.7;font-size:11px}.tBHptq_tvError{color:var(--dsh-danger,#c0392b);margin-top:6px;font-size:12px}";
		const tagId = "mino-today/today.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "mino-today";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var today_module_css_default = {
			"sectionTitle": "tBHptq_sectionTitle",
			"eventLoc": "tBHptq_eventLoc",
			"cardMetricUnit": "tBHptq_cardMetricUnit",
			"diaryCount": "tBHptq_diaryCount",
			"searchInput": "tBHptq_searchInput",
			"cardMetric": "tBHptq_cardMetric",
			"todayPulse": "tBHptq_todayPulse",
			"recoAdd": "tBHptq_recoAdd",
			"tvList": "tBHptq_tvList",
			"tvProgress": "tBHptq_tvProgress",
			"tvProgressText": "tBHptq_tvProgressText",
			"feedList": "tBHptq_feedList",
			"diaryCardCount": "tBHptq_diaryCardCount",
			"memorySession": "tBHptq_memorySession",
			"heroGreeting": "tBHptq_heroGreeting",
			"today-bokeh-core": "tBHptq_today-bokeh-core",
			"feedKindIcon": "tBHptq_feedKindIcon",
			"aboutCard": "tBHptq_aboutCard",
			"updatedAt": "tBHptq_updatedAt",
			"workingDot": "tBHptq_workingDot",
			"emptyText": "tBHptq_emptyText",
			"watchHint": "tBHptq_watchHint",
			"tvSummary": "tBHptq_tvSummary",
			"bokehCore": "tBHptq_bokehCore",
			"cardMetricDelta": "tBHptq_cardMetricDelta",
			"quickInput": "tBHptq_quickInput",
			"tvMetric": "tBHptq_tvMetric",
			"tvError": "tBHptq_tvError",
			"tvTitle": "tBHptq_tvTitle",
			"segIcon": "tBHptq_segIcon",
			"heroDate": "tBHptq_heroDate",
			"linkButton": "tBHptq_linkButton",
			"emptyTitle": "tBHptq_emptyTitle",
			"scheduleTitle": "tBHptq_scheduleTitle",
			"aboutList": "tBHptq_aboutList",
			"fresh": "tBHptq_fresh",
			"recoText": "tBHptq_recoText",
			"catName": "tBHptq_catName",
			"diaryCardBody": "tBHptq_diaryCardBody",
			"errorBox": "tBHptq_errorBox",
			"memoryMeta": "tBHptq_memoryMeta",
			"customizePanel": "tBHptq_customizePanel",
			"jobFoot": "tBHptq_jobFoot",
			"bokehHalo": "tBHptq_bokehHalo",
			"adjustRow": "tBHptq_adjustRow",
			"sparkle": "tBHptq_sparkle",
			"batchHead": "tBHptq_batchHead",
			"menuWrap": "tBHptq_menuWrap",
			"feedMenu": "tBHptq_feedMenu",
			"freshBar": "tBHptq_freshBar",
			"watchAction": "tBHptq_watchAction",
			"statChip": "tBHptq_statChip",
			"edgeLight": "tBHptq_edgeLight",
			"chip": "tBHptq_chip",
			"recoDesc": "tBHptq_recoDesc",
			"aboutLabel": "tBHptq_aboutLabel",
			"tvBatch": "tBHptq_tvBatch",
			"heroStats": "tBHptq_heroStats",
			"recoName": "tBHptq_recoName",
			"countNote": "tBHptq_countNote",
			"jobHead": "tBHptq_jobHead",
			"today-pulse": "tBHptq_today-pulse",
			"today-bokeh-halo": "tBHptq_today-bokeh-halo",
			"latestBriefCta": "tBHptq_latestBriefCta",
			"jobTime": "tBHptq_jobTime",
			"tvProgressFill": "tBHptq_tvProgressFill",
			"scheduleTime": "tBHptq_scheduleTime",
			"suggestChip": "tBHptq_suggestChip",
			"recoCard": "tBHptq_recoCard",
			"hero": "tBHptq_hero",
			"cardProgressText": "tBHptq_cardProgressText",
			"feedBody": "tBHptq_feedBody",
			"tab": "tBHptq_tab",
			"sectionRow": "tBHptq_sectionRow",
			"tabBadge": "tBHptq_tabBadge",
			"eventsCard": "tBHptq_eventsCard",
			"batchHeadTitle": "tBHptq_batchHeadTitle",
			"sectionHint": "tBHptq_sectionHint",
			"feedProvider": "tBHptq_feedProvider",
			"cardProgressBar": "tBHptq_cardProgressBar",
			"today-bokeh-spin": "tBHptq_today-bokeh-spin",
			"aboutItem": "tBHptq_aboutItem",
			"pageTitleRow": "tBHptq_pageTitleRow",
			"diaryCardTitle": "tBHptq_diaryCardTitle",
			"tvHead": "tBHptq_tvHead",
			"watchRow": "tBHptq_watchRow",
			"tvBadge": "tBHptq_tvBadge",
			"feedKind": "tBHptq_feedKind",
			"diaryList": "tBHptq_diaryList",
			"tvState": "tBHptq_tvState",
			"feedDay": "tBHptq_feedDay",
			"tvMetricLabel": "tBHptq_tvMetricLabel",
			"watchHintClose": "tBHptq_watchHintClose",
			"heroMain": "tBHptq_heroMain",
			"diaryDate": "tBHptq_diaryDate",
			"feedCard": "tBHptq_feedCard",
			"feedGroup": "tBHptq_feedGroup",
			"memoryText": "tBHptq_memoryText",
			"recoTitle": "tBHptq_recoTitle",
			"recoIcon": "tBHptq_recoIcon",
			"aboutCrown": "tBHptq_aboutCrown",
			"jobCard": "tBHptq_jobCard",
			"diaryTime": "tBHptq_diaryTime",
			"monthHead": "tBHptq_monthHead",
			"body": "tBHptq_body",
			"suggestRow": "tBHptq_suggestRow",
			"bokeh": "tBHptq_bokeh",
			"scheduleRow": "tBHptq_scheduleRow",
			"page": "tBHptq_page",
			"batchHeadTime": "tBHptq_batchHeadTime",
			"adjustInput": "tBHptq_adjustInput",
			"feedExpand": "tBHptq_feedExpand",
			"feedHead": "tBHptq_feedHead",
			"unreadPill": "tBHptq_unreadPill",
			"diaryText": "tBHptq_diaryText",
			"aboutMeta": "tBHptq_aboutMeta",
			"diaryPreview": "tBHptq_diaryPreview",
			"diaryBody": "tBHptq_diaryBody",
			"tabs": "tBHptq_tabs",
			"backButton": "tBHptq_backButton",
			"today-sparkle-pop": "tBHptq_today-sparkle-pop",
			"quickButton": "tBHptq_quickButton",
			"memoryRow": "tBHptq_memoryRow",
			"bokehSpin": "tBHptq_bokehSpin",
			"segmented": "tBHptq_segmented",
			"diaryGrid": "tBHptq_diaryGrid",
			"scheduleMore": "tBHptq_scheduleMore",
			"tvProgressBar": "tBHptq_tvProgressBar",
			"memoryList": "tBHptq_memoryList",
			"newBadge": "tBHptq_newBadge",
			"watchActions": "tBHptq_watchActions",
			"adjustBox": "tBHptq_adjustBox",
			"latestBriefText": "tBHptq_latestBriefText",
			"latestBrief": "tBHptq_latestBrief",
			"cardProgress": "tBHptq_cardProgress",
			"diaryEntries": "tBHptq_diaryEntries",
			"watchHintBody": "tBHptq_watchHintBody",
			"diaryCard": "tBHptq_diaryCard",
			"diaryBadgeWeek": "tBHptq_diaryBadgeWeek",
			"iconButton": "tBHptq_iconButton",
			"diaryBadge": "tBHptq_diaryBadge",
			"customizeRow": "tBHptq_customizeRow",
			"watchHintText": "tBHptq_watchHintText",
			"miniButton": "tBHptq_miniButton",
			"quickAdd": "tBHptq_quickAdd",
			"seg": "tBHptq_seg",
			"workingBar": "tBHptq_workingBar",
			"titleAmbient": "tBHptq_titleAmbient",
			"adjustSaved": "tBHptq_adjustSaved",
			"recoList": "tBHptq_recoList",
			"catCount": "tBHptq_catCount",
			"chatButton": "tBHptq_chatButton",
			"feedTime": "tBHptq_feedTime",
			"cardList": "tBHptq_cardList",
			"guidanceMark": "tBHptq_guidanceMark",
			"scheduleList": "tBHptq_scheduleList",
			"tvMetricValue": "tBHptq_tvMetricValue",
			"unreadDot": "tBHptq_unreadDot",
			"freshFill": "tBHptq_freshFill",
			"menuItemDanger": "tBHptq_menuItemDanger",
			"catGrid": "tBHptq_catGrid",
			"watchHintTitle": "tBHptq_watchHintTitle",
			"menuItem": "tBHptq_menuItem",
			"catIcon": "tBHptq_catIcon",
			"createButton": "tBHptq_createButton",
			"heroSide": "tBHptq_heroSide",
			"emptyPanel": "tBHptq_emptyPanel",
			"watchHintIcon": "tBHptq_watchHintIcon",
			"scheduleDot": "tBHptq_scheduleDot",
			"feedTitle": "tBHptq_feedTitle",
			"aboutHint": "tBHptq_aboutHint",
			"diaryDateNum": "tBHptq_diaryDateNum",
			"authorBadge": "tBHptq_authorBadge",
			"catCard": "tBHptq_catCard",
			"jobDetail": "tBHptq_jobDetail",
			"loading": "tBHptq_loading",
			"diaryLayout": "tBHptq_diaryLayout",
			"pageTitle": "tBHptq_pageTitle",
			"jobList": "tBHptq_jobList",
			"feedBodyClamped": "tBHptq_feedBodyClamped",
			"feedEnd": "tBHptq_feedEnd",
			"feedLoading": "tBHptq_feedLoading",
			"today-fade-up": "tBHptq_today-fade-up",
			"dayHead": "tBHptq_dayHead",
			"cardMetricValue": "tBHptq_cardMetricValue",
			"jobStatus": "tBHptq_jobStatus",
			"jobLabel": "tBHptq_jobLabel",
			"diaryDetail": "tBHptq_diaryDetail",
			"creatingCard": "tBHptq_creatingCard",
			"tvRow": "tBHptq_tvRow",
			"aboutTitle": "tBHptq_aboutTitle",
			"diaryEntry": "tBHptq_diaryEntry",
			"diaryBadgeDay": "tBHptq_diaryBadgeDay"
		};
		// src/client/DiaryTab.tsx
		/**
		* 「日记」视图：按月分组的双列瀑布卡（周几+日号徽章 + 标题 + 摘要，
		* 对齐 Today 的日记页）；点卡进当天详情（回退圆钮 + 条目列表 + 写入框）。
		* 条目的作者徽标区分米洛写的（带 sessionId）和我写的。
		*/
		/** 徽章顶部条的淡彩轮转（视觉，不是文案）。 */
		const BADGE_TONES = [
			"blue",
			"peach",
			"violet",
			"green",
			"pink",
			"amber"
		];
		function weekdayShort(dateKey) {
			return (/* @__PURE__ */ new Date(`${dateKey}T00:00:00`)).toLocaleDateString(void 0, { weekday: "short" });
		}
		function monthLabel(dateKey) {
			const [y = 0, m = 1] = dateKey.split("-").map(Number);
			return new Date(y, m - 1).toLocaleDateString(void 0, {
				year: "numeric",
				month: "long"
			});
		}
		/** 预览文本拆「标题 + 摘要」：第一处分句前当标题，余下当摘要。 */
		function splitPreview(preview) {
			const text = preview.trim();
			const cut = text.search(/[。！？!?\n]/);
			if (cut <= 0 || cut > 24) return {
				title: text.slice(0, 24),
				body: text.slice(24).trim()
			};
			return {
				title: text.slice(0, cut),
				body: text.slice(cut + 1).trim()
			};
		}
		function DiaryGrid({ dates, t, onOpen }) {
			const months = (0, react.useMemo)(() => {
				const map = /* @__PURE__ */ new Map();
				for (const row of dates) {
					const key = row.date.slice(0, 7);
					const list = map.get(key) ?? [];
					list.push(row);
					map.set(key, list);
				}
				return [...map.entries()].sort((a, b) => b[0].localeCompare(a[0]));
			}, [dates]);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(react_jsx_runtime.Fragment, { children: months.map(([month, rows]) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", {
				className: today_module_css_default.monthHead,
				children: monthLabel(`${month}-01`)
			}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
				className: today_module_css_default.diaryGrid,
				children: [...rows].sort((a, b) => b.date.localeCompare(a.date)).map((row, i) => {
					const { title, body } = splitPreview(row.preview);
					return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
						type: "button",
						className: today_module_css_default.diaryCard,
						onClick: () => onOpen(row.date),
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
								className: today_module_css_default.diaryBadge,
								"data-tone": BADGE_TONES[i % BADGE_TONES.length],
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: today_module_css_default.diaryBadgeWeek,
									children: weekdayShort(row.date)
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: today_module_css_default.diaryBadgeDay,
									children: Number(row.date.slice(8, 10))
								})]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: today_module_css_default.diaryCardTitle,
								children: row.date === dayKey(/* @__PURE__ */ new Date()) ? t("diary.today") : title
							}),
							body ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: today_module_css_default.diaryCardBody,
								children: body
							}) : null,
							row.count > 1 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: today_module_css_default.diaryCardCount,
								children: t("diary.entries", { count: row.count })
							}) : null
						]
					}) }, row.date);
				})
			})] }, month)) });
		}
		function DiaryTab({ t }) {
			const [dates, setDates] = (0, react.useState)(null);
			const [failed, setFailed] = (0, react.useState)(false);
			const [selected, setSelected] = (0, react.useState)(null);
			const [entries, setEntries] = (0, react.useState)(null);
			const [draft, setDraft] = (0, react.useState)("");
			const [posting, setPosting] = (0, react.useState)(false);
			const loadDates = (0, react.useCallback)(() => {
				setFailed(false);
				api.diaries().then((res) => {
					setDates(res.dates);
				}).catch(() => setFailed(true));
			}, []);
			(0, react.useEffect)(loadDates, [loadDates]);
			(0, react.useEffect)(() => {
				if (!selected) {
					setEntries(null);
					return;
				}
				setEntries(null);
				api.diary(selected).then((res) => setEntries(res.entries)).catch(() => setEntries([]));
			}, [selected]);
			const submit = async () => {
				const text = draft.trim();
				if (!text || posting) return;
				setPosting(true);
				try {
					const res = await api.addDiary(text, selected ?? void 0);
					setDraft("");
					setSelected(res.date);
					loadDates();
					const detail = await api.diary(res.date);
					setEntries(detail.entries);
				} catch {} finally {
					setPosting(false);
				}
			};
			const composer = /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: today_module_css_default.quickAdd,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
					className: today_module_css_default.quickInput,
					value: draft,
					placeholder: t("diary.addPlaceholder"),
					onChange: (e) => setDraft(e.target.value),
					onKeyDown: (e) => {
						if (e.key === "Enter") submit();
					}
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
					type: "button",
					className: today_module_css_default.quickButton,
					disabled: !draft.trim() || posting,
					onClick: () => void submit(),
					children: t("diary.add")
				})]
			});
			if (failed) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
				type: "button",
				className: today_module_css_default.errorBox,
				onClick: loadDates,
				children: t("error.load")
			});
			if (!dates) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", { className: today_module_css_default.loading });
			if (dates.length === 0) return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: today_module_css_default.emptyPanel,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: today_module_css_default.emptyTitle,
						children: t("diary.empty.title")
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: today_module_css_default.emptyText,
						children: t("diary.empty.body")
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						style: { marginTop: 12 },
						children: composer
					})
				]
			});
			if (selected) return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: today_module_css_default.pageTitleRow,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
					type: "button",
					className: today_module_css_default.backButton,
					"aria-label": t("diary.back"),
					onClick: () => setSelected(null),
					children: "‹"
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", {
					className: today_module_css_default.pageTitle,
					children: monthLabel(`${selected.slice(0, 7)}-01`)
				})]
			}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: today_module_css_default.diaryDetail,
				children: entries === null ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", { className: today_module_css_default.loading }) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [entries.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
					className: today_module_css_default.sectionHint,
					children: t("diary.empty.body")
				}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
					className: today_module_css_default.diaryEntries,
					children: entries.map((entry) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", {
						className: today_module_css_default.diaryEntry,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: today_module_css_default.diaryTime,
								children: hhmm(entry.at)
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: today_module_css_default.diaryBody,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: today_module_css_default.authorBadge,
									"data-author": entry.sessionId ? "agent" : "me",
									children: entry.sessionId ? t("diary.author.agent") : t("diary.author.me")
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: today_module_css_default.diaryText,
									children: entry.text
								})]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: today_module_css_default.iconButton,
								title: t("diary.delete"),
								onClick: () => {
									if (!selected) return;
									api.deleteDiaryEntry(selected, entry.at).then(() => {
										setEntries((cur) => cur ? cur.filter((e) => e.at !== entry.at) : cur);
										loadDates();
									}).catch(() => {});
								},
								children: "×"
							})
						]
					}, entry.at))
				}), composer] })
			})] });
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: today_module_css_default.pageTitleRow,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", {
					className: today_module_css_default.pageTitle,
					children: t("tab.diary")
				})
			}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(DiaryGrid, {
				dates,
				t,
				onOpen: setSelected
			})] });
		}
		// src/client/FeedTab.tsx
		/**
		* 「今日」视图：接下来的安排（定时任务，可暂停/恢复）+ 批次分组的动态卡。
		* 卡片带类型左条、来源 chip、建议 chips（点了把 prompt 发回给写卡片的会话）、
		* 会话跳转和划掉。
		*/
		/** 对齐 todayV3.feed.window「这里只展示最近 14 天的内容」。 */
		const WINDOW_DAYS = 14;
		/** 每次露出的条数（对应 today-feed-sentinel 的增量加载）。 */
		const PAGE = 12;
		const KIND_ICON = {
			note: "✎",
			result: "✓",
			moment: "◆"
		};
		/** 定时任务行的「下次」标签。 */
		function nextRunLabel(card, t) {
			if (!card.nextAt) return "";
			const d = new Date(card.nextAt);
			const now = /* @__PURE__ */ new Date();
			const startOfDay = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
			const days = Math.round((startOfDay(d) - startOfDay(now)) / 864e5);
			if (days <= 0) return t("schedule.nextToday", { time: hhmm(card.nextAt) });
			if (days === 1) return t("schedule.nextTomorrow", { time: hhmm(card.nextAt) });
			return `${d.getMonth() + 1}/${d.getDate()} ${hhmm(card.nextAt)}`;
		}
		function kindLabel(card, t) {
			switch (card.kind) {
				case "daily": return t("schedule.daily", { time: card.nextAt ? hhmm(card.nextAt) : "—" });
				case "weekly": return t("schedule.weekly", { time: card.nextAt ? `${new Date(card.nextAt).getMonth() + 1}/${new Date(card.nextAt).getDate()}` : "—" });
				case "after":
				case "at": return t("schedule.once");
				default: return t("schedule.repeating");
			}
		}
		/** dayInProgress.startingSoon：active 且下次运行在未来 30 分钟内。 */
		function startingSoon(card) {
			if (!card.nextAt || card.running || card.status !== "active") return false;
			const diff = new Date(card.nextAt).getTime() - Date.now();
			return diff > 0 && diff <= 18e5;
		}
		function ScheduleRow({ card, t, onToggle }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", {
				className: today_module_css_default.scheduleRow,
				"data-status": card.status,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: today_module_css_default.scheduleDot,
						"data-status": card.status
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: today_module_css_default.scheduleTitle,
						children: card.title
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: today_module_css_default.chip,
						"data-tone": "kind",
						children: kindLabel(card, t)
					}),
					card.running ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: today_module_css_default.chip,
						"data-tone": "run",
						children: t("schedule.running")
					}) : null,
					startingSoon(card) ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: today_module_css_default.chip,
						"data-tone": "soon",
						children: t("schedule.startingSoon")
					}) : null,
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: today_module_css_default.chip,
						"data-tone": card.status,
						children: t(`schedule.status.${card.status}`)
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: today_module_css_default.scheduleTime,
						children: card.status === "active" && card.nextAt ? nextRunLabel(card, t) : card.lastDeliveredAt ? t("schedule.lastRun", { time: relTime(card.lastDeliveredAt, Date.now()) }) : ""
					}),
					card.status !== "ended" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: today_module_css_default.miniButton,
						onClick: () => onToggle(card),
						children: card.status === "active" ? t("schedule.pause") : t("schedule.resume")
					}) : null
				]
			});
		}
		/** 定时任务列表：今日页 strip 与任务页「定时任务」段共用。limit=预览条数（对齐 day-in-progress 的 3+more）。 */
		function ScheduleList({ cards, t, onChanged, limit }) {
			const [showAll, setShowAll] = (0, react.useState)(false);
			const toggle = (card) => {
				api.setScheduleActive(card.id, card.status !== "active").then(onChanged).catch(() => {});
			};
			if (cards.length === 0) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
				className: today_module_css_default.sectionHint,
				children: t("schedule.empty")
			});
			const sorted = [...cards].sort((a, b) => ({
				active: 0,
				paused: 1,
				ended: 2
			})[a.status] - {
				active: 0,
				paused: 1,
				ended: 2
			}[b.status]);
			const hidden = limit && !showAll ? Math.max(0, sorted.length - limit) : 0;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
				className: today_module_css_default.scheduleList,
				children: (hidden ? sorted.slice(0, limit) : sorted).map((card) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ScheduleRow, {
					card,
					t,
					onToggle: toggle
				}, card.id))
			}), limit && sorted.length > limit ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
				type: "button",
				className: today_module_css_default.scheduleMore,
				onClick: () => setShowAll((v) => !v),
				children: showAll ? t("schedule.showLess") : t("schedule.showMore", { count: sorted.length - limit })
			}) : null] });
		}
		/** 'YYYY-MM-DD HH:MM' → 当日分钟数；全日返回 null。 */
		function minutesOf(start) {
			const m = start.match(/\d{4}-\d{2}-\d{2} (\d{2}):(\d{2})/);
			return m ? Number(m[1]) * 60 + Number(m[2]) : null;
		}
		/**
		* 日程进展卡（Today day_in_progress@1 复刻）：今日日历事件按时间列，
		* 状态 = 已过去/进行中/即将开始(30min)/未到；3 条起步 + 「还有 N 条」。
		* 数据走日历连接器自己的 /api/day——插件没装整条卡消失（events=null）。
		*/
		function EventsCard({ events, t, now }) {
			const [showAll, setShowAll] = (0, react.useState)(false);
			const statusOf = (e) => {
				if (e.allDay) return "allDay";
				const start = minutesOf(e.start);
				const end = minutesOf(e.end) ?? (start !== null ? start + 60 : null);
				const cur = new Date(now).getHours() * 60 + new Date(now).getMinutes();
				if (start === null) return "later";
				if (end !== null && cur >= end) return "past";
				if (cur >= start && (end === null || cur < end)) return "now";
				return start - cur <= 30 ? "soon" : "later";
			};
			const list = showAll ? events : events.slice(0, 3);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
				className: today_module_css_default.eventsCard,
				"data-client-card": "day_in_progress",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", {
						className: today_module_css_default.sectionTitle,
						children: t("section.schedule")
					}),
					events.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: today_module_css_default.sectionHint,
						children: t("events.empty")
					}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
						className: today_module_css_default.scheduleList,
						children: list.map((e, i) => {
							const st = statusOf(e);
							const endMin = minutesOf(e.end);
							const cur = new Date(now).getHours() * 60 + new Date(now).getMinutes();
							return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", {
								className: today_module_css_default.scheduleRow,
								"data-status": st === "past" ? "ended" : "active",
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: today_module_css_default.scheduleDot,
										"data-status": st === "past" ? "ended" : st === "now" ? "active" : "paused"
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: today_module_css_default.scheduleTitle,
										children: e.summary
									}),
									st === "allDay" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: today_module_css_default.chip,
										"data-tone": "kind",
										children: t("events.allDay")
									}) : null,
									st === "past" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: today_module_css_default.chip,
										"data-tone": "ended",
										children: t("events.past")
									}) : null,
									st === "now" ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
										className: today_module_css_default.chip,
										"data-tone": "run",
										children: [t("events.now"), endMin !== null && endMin > cur ? ` · ${t("events.endsIn", { count: endMin - cur })}` : ""]
									}) : null,
									st === "soon" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: today_module_css_default.chip,
										"data-tone": "soon",
										children: t("schedule.startingSoon")
									}) : null,
									e.location ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: today_module_css_default.eventLoc,
										children: e.location
									}) : null,
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: today_module_css_default.scheduleTime,
										children: e.allDay ? "" : `${e.start.slice(11)}${e.end ? `–${e.end.slice(11) || "…"}` : ""}`
									})
								]
							}, i);
						})
					}),
					events.length > 3 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: today_module_css_default.scheduleMore,
						onClick: () => setShowAll((v) => !v),
						children: showAll ? t("schedule.showLess") : t("schedule.showMore", { count: events.length - 3 })
					}) : null
				]
			});
		}
		/** 槽位 → 对应批次 kind（与 brief 约定：早= morning_brief，晚= evening_brief）。 */
		const BRIEF_KIND = {
			morning: "morning_brief",
			evening: "evening_brief"
		};
		/**
		* 候简报行（Today latestBriefCard 复刻）：该出的简报还没落地时，
		* 上下发丝线之间放「你的简报已在这里等候」+ 取稿 CTA；点击→生成态卡。
		* 数据走 mino-brief 自己的 /api/prefs——插件没装整条消失（slots=null）。
		*/
		function LatestBrief({ t, slots, items, creating, onFetch }) {
			const now = /* @__PURE__ */ new Date();
			const nowHM = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
			const today = dayKey(now);
			const pending = slots.find((s) => s.enabled && s.hasEntry && s.time <= nowHM && !items.some((i) => i.batchKind === BRIEF_KIND[s.slot] && dayKey(new Date(i.at)) === today));
			if (creating) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: today_module_css_default.latestBrief,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
					className: today_module_css_default.latestBriefText,
					children: t("brief.fetching")
				})
			});
			if (!pending) return null;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: today_module_css_default.latestBrief,
				"data-batch-kind": "latest_brief",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
					className: today_module_css_default.latestBriefText,
					children: t("brief.waiting")
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
					type: "button",
					className: today_module_css_default.latestBriefCta,
					onClick: onFetch,
					children: t("brief.fetch")
				})]
			});
		}
		function SuggestionChips({ item, t, actions }) {
			const [sent, setSent] = (0, react.useState)(null);
			const [busy, setBusy] = (0, react.useState)(false);
			if (!item.suggestions?.length) return null;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: today_module_css_default.suggestRow,
				children: item.suggestions.map((s, i) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
					type: "button",
					className: today_module_css_default.suggestChip,
					disabled: busy || sent === s.label,
					onClick: () => {
						setBusy(true);
						actions.sendPrompt(item.sessionId, s.prompt).then((ok) => {
							if (ok) setSent(s.label);
						}).finally(() => setBusy(false));
					},
					children: sent === s.label ? t("feed.sent") : s.label
				}, i))
			});
		}
		/** 结构化卡体渲染：list 清单 / metric 指标 / progress 进度条。 */
		function CardBody$1({ card }) {
			switch (card.type) {
				case "list": return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
					className: today_module_css_default.cardList,
					children: card.items.map((it, i) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("li", { children: it }, i))
				});
				case "metric": return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: today_module_css_default.cardMetric,
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: today_module_css_default.cardMetricValue,
							children: card.value
						}),
						card.unit ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: today_module_css_default.cardMetricUnit,
							children: card.unit
						}) : null,
						card.delta ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: today_module_css_default.cardMetricDelta,
							children: card.delta
						}) : null
					]
				});
				case "progress": {
					const pct = Math.round(card.done / card.total * 100);
					return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: today_module_css_default.cardProgress,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: today_module_css_default.cardProgressBar,
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { style: { width: `${pct}%` } })
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
							className: today_module_css_default.cardProgressText,
							children: [
								card.label ? `${card.label} ` : "",
								card.done,
								"/",
								card.total
							]
						})]
					});
				}
			}
		}
		/**
		* 卡片溢出菜单：Today 的 more 菜单（briefFeedback.more=更多）——
		* 置顶/反馈/不感兴趣/打开会话/删除全部收进一个 ⋯，外点与 Esc 关闭。
		*/
		function CardMenu({ item, t, actions, onDelete, onFeedback, onPin, onAdjust }) {
			const [open, setOpen] = (0, react.useState)(false);
			const [confirming, setConfirming] = (0, react.useState)(false);
			const rootRef = (0, react.useRef)(null);
			(0, react.useEffect)(() => {
				if (!open) return;
				const onPointerDown = (e) => {
					if (!rootRef.current?.contains(e.target)) {
						setOpen(false);
						setConfirming(false);
					}
				};
				const onKey = (e) => {
					if (e.key === "Escape") {
						setOpen(false);
						setConfirming(false);
					}
				};
				document.addEventListener("pointerdown", onPointerDown);
				document.addEventListener("keydown", onKey);
				return () => {
					document.removeEventListener("pointerdown", onPointerDown);
					document.removeEventListener("keydown", onKey);
				};
			}, [open]);
			const act = (fn) => () => {
				fn();
				setOpen(false);
				setConfirming(false);
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
				className: today_module_css_default.menuWrap,
				ref: rootRef,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
					type: "button",
					className: today_module_css_default.iconButton,
					title: t("feed.more"),
					"aria-expanded": open,
					onClick: () => {
						setOpen((v) => !v);
						setConfirming(false);
					},
					children: "⋯"
				}), open ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
					className: today_module_css_default.feedMenu,
					role: "menu",
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							role: "menuitem",
							className: today_module_css_default.menuItem,
							onClick: act(() => onPin(item.id, !item.pinned)),
							children: item.pinned ? t("feed.unpin") : t("feed.pin")
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							role: "menuitem",
							className: today_module_css_default.menuItem,
							"data-active": item.feedback === "up" || void 0,
							onClick: act(() => onFeedback(item.id, "up")),
							children: t("feed.up")
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							role: "menuitem",
							className: today_module_css_default.menuItem,
							"data-active": item.feedback === "down" || void 0,
							onClick: act(() => onFeedback(item.id, "down")),
							children: t("feed.down")
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							role: "menuitem",
							className: today_module_css_default.menuItem,
							onClick: act(() => onFeedback(item.id, "not_interested")),
							children: t("feed.notInterested")
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							role: "menuitem",
							className: today_module_css_default.menuItem,
							onClick: act(onAdjust),
							children: t("feed.adjust")
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							role: "menuitem",
							className: today_module_css_default.menuItem,
							onClick: act(() => {
								actions.sendPrompt(item.sessionId, t("feed.askPrompt", { title: item.title }));
							}),
							children: t("feed.askAgent")
						}),
						item.sessionId ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							role: "menuitem",
							className: today_module_css_default.menuItem,
							onClick: act(() => actions.openSession(item.sessionId)),
							children: t("feed.openSession")
						}) : null,
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							role: "menuitem",
							className: `${today_module_css_default.menuItem} ${today_module_css_default.menuItemDanger}`,
							onClick: confirming ? act(() => onDelete(item.id)) : () => setConfirming(true),
							children: confirming ? t("feed.confirmDelete") : t("feed.dismiss")
						})
					]
				}) : null]
			});
		}
		/**
		* 卡正文按 Today 信息流卡做紧凑预览（4 行），量出溢出挂「展开/收起」。
		*/
		function FeedBody({ body, t }) {
			const ref = (0, react.useRef)(null);
			const [overflow, setOverflow] = (0, react.useState)(false);
			const [open, setOpen] = (0, react.useState)(false);
			(0, react.useEffect)(() => {
				const el = ref.current;
				if (el) setOverflow(el.scrollHeight > el.clientHeight + 1);
			}, [body]);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				ref,
				className: `${today_module_css_default.feedBody} ${!open ? today_module_css_default.feedBodyClamped : ""}`,
				children: body
			}), overflow ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
				type: "button",
				className: today_module_css_default.feedExpand,
				onClick: () => setOpen((v) => !v),
				children: open ? t("feed.collapse") : t("feed.expand")
			}) : null] });
		}
		/**
		* feed 卡 = 导航卡（对齐 data-today-v3-navigation-card）：点卡标记已读并进来源会话，
		* 正文只做紧凑预览；按钮/划词不误触。
		*/
		/** 卡头时间用 Today 的 updatedAt 句式：刚刚更新 / N分钟前更新 / 今天HH:mm更新 / 昨天HH:mm更新 / M/D更新。 */
		function updatedLabel(iso, now, t) {
			const ms = new Date(iso).getTime();
			if (Number.isNaN(ms)) return "";
			const diff = now - ms;
			if (diff < 6e4) return t("feed.updated.now");
			if (diff < 36e5) return t("feed.updated.minutes", { count: Math.floor(diff / 6e4) });
			const d = new Date(iso), n = new Date(now);
			const day = (x) => x.getFullYear() * 1e3 + x.getMonth() * 40 + x.getDate();
			if (day(d) === day(n)) return t("feed.updated.today", { time: hhmm(iso) });
			if (day(d) === day(n) - 1) return t("feed.updated.yesterday", { time: hhmm(iso) });
			return t("feed.updated.date", { date: `${d.getMonth() + 1}/${d.getDate()}` });
		}
		/**
		* 实时组件区（Today liveWidgets 复刻）：追踪中的主题卡片 + 悬停刷新/编辑/删除 +
		* 空态建议卡（可关闭）+ 添加入口（经会话让 agent 建 watch）。
		*/
		function WidgetSection({ t, watches, schedules, actions, hintDismissed, onDismissHint, onChanged }) {
			const [adding, setAdding] = (0, react.useState)(false);
			const [topic, setTopic] = (0, react.useState)("");
			const [sending, setSending] = (0, react.useState)(false);
			/** generationState==="creating" 对应物：add 发出后到 watch 落地（或超时）期间的占位卡。 */
			const [pendingTopic, setPendingTopic] = (0, react.useState)(null);
			(0, react.useEffect)(() => {
				if (!pendingTopic) return;
				if (watches.some((w) => w.topic === pendingTopic)) {
					setPendingTopic(null);
					return;
				}
				const timer = setTimeout(() => setPendingTopic(null), 9e4);
				return () => clearTimeout(timer);
			}, [watches, pendingTopic]);
			const send = (text) => {
				setSending(true);
				actions.sendPrompt(void 0, text, { navigate: false }).finally(() => setSending(false));
			};
			const askAdd = () => {
				const v = topic.trim();
				if (!v) return;
				send(t("watch.addPrompt", { topic: v }));
				setPendingTopic(v);
				setAdding(false);
				setTopic("");
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
				className: today_module_css_default.widgetSection,
				"data-batch-kind": "live_widget",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("h2", {
						className: today_module_css_default.sectionTitle,
						children: [t("section.watches"), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
							type: "button",
							className: today_module_css_default.linkButton,
							onClick: () => setAdding((v) => !v),
							children: [t("watch.add"), " +"]
						})]
					}),
					adding ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: today_module_css_default.quickAdd,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
							className: today_module_css_default.quickInput,
							value: topic,
							placeholder: t("watch.addPlaceholder"),
							autoFocus: true,
							onChange: (e) => setTopic(e.target.value),
							onKeyDown: (e) => {
								if (e.key === "Enter") askAdd();
							}
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: today_module_css_default.quickButton,
							disabled: !topic.trim() || sending,
							onClick: askAdd,
							children: t("watch.addSend")
						})]
					}) : null,
					watches.length === 0 && !hintDismissed && !adding ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: today_module_css_default.watchHint,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: today_module_css_default.watchHintIcon,
								children: "◉"
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: today_module_css_default.watchHintText,
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
										className: today_module_css_default.watchHintTitle,
										children: t("watch.hintTitle")
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
										className: today_module_css_default.watchHintBody,
										children: t("watch.hintBody")
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: today_module_css_default.miniButton,
										onClick: () => setAdding(true),
										children: t("watch.add")
									})
								]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: today_module_css_default.watchHintClose,
								title: t("watch.hintDismiss"),
								onClick: onDismissHint,
								children: "✕"
							})
						]
					}) : null,
					pendingTopic ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: today_module_css_default.creatingCard,
						children: t("watch.creating", { topic: pendingTopic })
					}) : null,
					watches.length ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
						className: today_module_css_default.scheduleList,
						children: watches.map((w) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(WatchRow, {
							w,
							t,
							schedules,
							send,
							sending,
							onChanged
						}, w.id))
					}) : null
				]
			});
		}
		/** 单个追踪组件：hover 露操作（刷新/编辑/删除），删除走两步确认（deleteConfirm 语义）。 */
		function WatchRow({ w, t, schedules, send, sending, onChanged }) {
			const [confirming, setConfirming] = (0, react.useState)(false);
			const [removing, setRemoving] = (0, react.useState)(false);
			const sched = schedules.find((s) => s.id === w.scheduleId);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", {
				className: `${today_module_css_default.scheduleRow} ${today_module_css_default.watchRow}`,
				"data-status": w.enabled ? "active" : "paused",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: today_module_css_default.scheduleDot,
						"data-status": w.enabled ? "active" : "paused"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: today_module_css_default.scheduleTitle,
						children: w.topic
					}),
					!w.enabled ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: today_module_css_default.chip,
						"data-tone": "paused",
						children: t("schedule.status.paused")
					}) : null,
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: today_module_css_default.scheduleTime,
						children: sched?.nextAt ? t("watch.next", { time: nextRunLabel(sched, t) }) : t("watch.manual")
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: today_module_css_default.watchActions,
						children: confirming ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: today_module_css_default.linkButton,
							onClick: () => setConfirming(false),
							children: t("feed.cancel")
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: today_module_css_default.miniButton,
							disabled: removing,
							onClick: () => {
								setRemoving(true);
								api.deleteWatch(w.id).then(onChanged).catch(() => setRemoving(false));
							},
							children: removing ? t("watch.deleting") : t("watch.deleteConfirm")
						})] }) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: today_module_css_default.watchAction,
								title: t("watch.refresh"),
								disabled: sending,
								onClick: () => send(t("watch.refreshPrompt", { topic: w.topic })),
								children: "⟳"
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: today_module_css_default.watchAction,
								title: t("watch.edit"),
								disabled: sending,
								onClick: () => send(t("watch.editPrompt", { topic: w.topic })),
								children: "✎"
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: today_module_css_default.watchAction,
								title: t("watch.delete"),
								onClick: () => setConfirming(true),
								children: "✕"
							})
						] })
					})
				]
			});
		}
		/** 「调整卡片」卡内编辑区：自由文本 → item.adjustNotes → 生成方按 source 取回。 */
		function AdjustEditor({ item, t, onClose }) {
			const [note, setNote] = (0, react.useState)("");
			const [saving, setSaving] = (0, react.useState)(false);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: today_module_css_default.adjustBox,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("textarea", {
					className: today_module_css_default.adjustInput,
					value: note,
					placeholder: t("feed.adjustPlaceholder"),
					rows: 2,
					autoFocus: true,
					onChange: (e) => setNote(e.target.value)
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: today_module_css_default.adjustRow,
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: today_module_css_default.linkButton,
						onClick: () => onClose(false),
						children: t("feed.cancel")
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: today_module_css_default.quickButton,
						disabled: !note.trim() || saving,
						onClick: () => {
							setSaving(true);
							api.adjust(item.id, note.trim()).then(() => onClose(true)).catch(() => setSaving(false));
						},
						children: t("feed.adjustSave")
					})]
				})]
			});
		}
		/** 滚动已读：卡滚进视口（≥50% 露出）即标已读，对齐 Today 的 batch scroll-spy。 */
		function seenRef(onSeen) {
			return (el) => {
				if (!el || el.dataset.seenBound) return;
				el.dataset.seenBound = "1";
				const io = new IntersectionObserver((entries) => {
					if (entries.some((e) => e.intersectionRatio >= .5)) {
						onSeen();
						io.disconnect();
					}
				}, { threshold: .5 });
				io.observe(el);
			};
		}
		function FeedCard({ item, t, now, actions, onDelete, onFeedback, onPin, onSeen, read }) {
			const [adjusting, setAdjusting] = (0, react.useState)(false);
			const [adjusted, setAdjusted] = (0, react.useState)(false);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", {
				className: today_module_css_default.feedCard,
				"data-kind": item.kind,
				"data-pinned": item.pinned || void 0,
				"data-unread": read ? void 0 : true,
				"data-nav": item.sessionId || void 0,
				ref: read ? void 0 : seenRef(() => onSeen(item.id)),
				onClick: (e) => {
					if (e.target.closest("button, input, a, textarea")) return;
					if (window.getSelection()?.toString()) return;
					if (!read) onSeen(item.id);
					if (item.sessionId) actions.openSession(item.sessionId);
				},
				...edgeGlowHandlers(),
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: today_module_css_default.edgeLight }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: today_module_css_default.feedHead,
						children: [
							!read ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: today_module_css_default.unreadDot,
								title: t("feed.unread")
							}) : null,
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
								className: today_module_css_default.feedProvider,
								"data-kind": item.kind,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: today_module_css_default.feedKindIcon,
									children: KIND_ICON[item.kind]
								}), item.source ?? t(`feed.kind.${item.kind}`)]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: today_module_css_default.feedTime,
								children: updatedLabel(item.at, now, t)
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(CardMenu, {
								item,
								t,
								actions,
								onDelete,
								onFeedback,
								onPin,
								onAdjust: () => setAdjusting(true)
							})
						]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: today_module_css_default.feedTitle,
						children: item.title
					}),
					item.body ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(FeedBody, {
						body: item.body,
						t
					}) : null,
					item.card ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CardBody$1, { card: item.card }) : null,
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(SuggestionChips, {
						item,
						t,
						actions
					}),
					adjusting ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(AdjustEditor, {
						item,
						t,
						onClose: (saved) => {
							setAdjusting(false);
							if (saved) setAdjusted(true);
						}
					}) : adjusted ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: today_module_css_default.adjustSaved,
						children: t("feed.adjustSaved")
					}) : null
				]
			});
		}
		/** 批次 kind → section-title 氛围类别（Today e7 映射表同款）。 */
		const KIND_AMBIENT = {
			morning_brief: "morning",
			evening_brief: "evening",
			diary: "evening",
			health_brief: "evening",
			first_health_report: "evening",
			weekly_health_report: "evening",
			welcome: "welcome",
			feature_intro: "guidance"
		};
		/** 批次 kind → 本地化标题键（Today e_ 映射表同款；未知 kind 回落 batchId 原文）。 */
		const KIND_TITLE = {
			morning_brief: "batch.title.morning",
			evening_brief: "batch.title.evening",
			diary: "batch.title.diary",
			health_brief: "batch.title.healthBrief",
			first_health_report: "batch.title.firstHealth",
			weekly_health_report: "batch.title.weeklyHealth",
			welcome: "batch.title.welcome",
			feature_intro: "batch.title.featureIntro"
		};
		/** 闪光粒子布局（解包 el[] 原值：位置/大小/延迟/时长/不透明度）。 */
		const SPARKLES = [
			{
				left: "-4%",
				top: "-20%",
				size: 11,
				delay: .2,
				dur: 2.6,
				op: .75
			},
			{
				left: "76%",
				top: "-22%",
				size: 13,
				delay: 1.1,
				dur: 2.8,
				op: .7
			},
			{
				left: "90%",
				top: "62%",
				size: 10,
				delay: 1.9,
				dur: 2.5,
				op: .7
			},
			{
				left: "18%",
				top: "82%",
				size: 9,
				delay: 2.6,
				dur: 2.4,
				op: .65
			}
		];
		/** 氛围色组：morning=暖金（解包实值）；evening/guidance 走品牌紫粉（Mino 品牌对应）；welcome 无氛围。 */
		const AMBIENT_COLORS = {
			morning: [
				"rgba(255,212,120,1)",
				"rgba(255,180,90,1)",
				"rgba(255,232,160,1)",
				"rgba(255,196,110,1)"
			],
			evening: [
				"rgba(165,94,232,0.85)",
				"rgba(236,111,184,0.8)",
				"rgba(200,150,245,0.75)",
				"rgba(180,110,220,0.8)"
			],
			guidance: [
				"rgba(120,178,255,1)",
				"rgba(150,205,255,1)",
				"rgba(90,160,255,1)",
				"rgba(170,210,250,1)"
			]
		};
		/** 批次头闪光粒子（Today today-section-title-sparkle 同款 pop 动效）。 */
		function Sparkles({ kind }) {
			const colors = AMBIENT_COLORS[kind] ?? AMBIENT_COLORS.evening;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
				className: today_module_css_default.titleAmbient,
				"aria-hidden": "true",
				children: SPARKLES.map((p, i) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
					className: today_module_css_default.sparkle,
					viewBox: "0 0 21 21",
					width: p.size,
					height: p.size,
					style: {
						left: p.left,
						top: p.top,
						animationDelay: `${p.delay}s`,
						animationDuration: `${p.dur}s`,
						["--sp-op"]: p.op
					},
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
						fill: colors[i % colors.length],
						d: "M10.5 0.8 L11.9 7.2 C12.4 9.6 13.9 11.1 16.3 11.6 L20.2 10.5 L16.3 13 C13.9 13.5 12.4 15 11.9 17.4 L10.5 20.2 L9.1 17.4 C8.6 15 7.1 13.5 4.7 13 L0.8 10.5 L4.7 11.6 C7.1 11.1 8.6 9.6 9.1 7.2 Z",
						transform: "rotate(10 10.5 10.5)"
					})
				}, i))
			});
		}
		/** 晨间太阳氛围（Today morning-bokeh：光晕脉动 + 11 道旋转光线 + 核心，32s 一圈）。 */
		function MorningBokeh() {
			const rays = Array.from({ length: 11 }, (_, i) => i * (360 / 11));
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
				className: today_module_css_default.bokeh,
				"aria-hidden": "true",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
						viewBox: "0 0 96 96",
						className: today_module_css_default.bokehSpin,
						children: rays.map((a) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("line", {
							x1: "48",
							y1: "14",
							x2: "48",
							y2: "4",
							stroke: "rgba(255,180,90,.55)",
							strokeWidth: "2.4",
							strokeLinecap: "round",
							transform: `rotate(${a} 48 48)`
						}, a))
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: today_module_css_default.bokehHalo }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: today_module_css_default.bokehCore })
				]
			});
		}
		/** 批次区标题（Today section-title 复刻：居中时间小字 + 标题 + 氛围粒子；guidance 用引导标）。 */
		function BatchTitle({ ambient, title, time }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: today_module_css_default.batchHead,
				"data-ambient": ambient || void 0,
				children: [ambient === "guidance" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					className: today_module_css_default.guidanceMark,
					"aria-hidden": "true",
					children: "◈"
				}) : time ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					className: today_module_css_default.batchHeadTime,
					children: time
				}) : null, /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("h3", {
					className: today_module_css_default.batchHeadTitle,
					children: [title, ambient === "morning" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(MorningBokeh, {}) : ambient && ambient !== "welcome" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Sparkles, { kind: ambient }) : null]
				})]
			});
		}
		/** 批次入场：对齐 data-batch-revealed——滚入视口才置 true，CSS 做上浮淡入。 */
		function revealRef(el) {
			if (!el || el.dataset.batchRevealed !== void 0) return;
			el.dataset.batchRevealed = "false";
			const io = new IntersectionObserver((entries) => {
				if (entries.some((e) => e.isIntersecting)) {
					el.dataset.batchRevealed = "true";
					io.disconnect();
				}
			}, { rootMargin: "60px" });
			io.observe(el);
		}
		function FeedTab({ t, summary, onChanged, actions, renderSlot }) {
			const [draft, setDraft] = (0, react.useState)("");
			const [posting, setPosting] = (0, react.useState)(false);
			const [visible, setVisible] = (0, react.useState)(PAGE);
			const [seenIds, setSeenIds] = (0, react.useState)(/* @__PURE__ */ new Set());
			const [watches, setWatches] = (0, react.useState)([]);
			const [editing, setEditing] = (0, react.useState)(false);
			/** null=日历连接器没装（路由 404）——日程进展卡整条隐藏。 */
			const [events, setEvents] = (0, react.useState)(null);
			/** null=mino-brief 没装——候简报行整条隐藏。 */
			const [briefSlots, setBriefSlots] = (0, react.useState)(null);
			/** getLatestBriefPending 对应物：CTA 点到新简报落地（或超时）期间。 */
			const [briefFetching, setBriefFetching] = (0, react.useState)(false);
			const [hintDismissed, setHintDismissed] = (0, react.useState)(() => {
				try {
					return localStorage.getItem("mino-today.widgetHint.dismissed") === "1";
				} catch {
					return false;
				}
			});
			const groupRefs = (0, react.useRef)(/* @__PURE__ */ new Map());
			const [inView, setInView] = (0, react.useState)(/* @__PURE__ */ new Set());
			const sentinelRef = (0, react.useRef)(null);
			const now = useNow();
			/** 静默已读：本地记 seenIds 即时消点，后台标读不拉全量刷新。 */
			const markSeen = (id) => {
				setSeenIds((prev) => {
					if (prev.has(id)) return prev;
					const next = new Set(prev);
					next.add(id);
					return next;
				});
				api.markRead(id).catch(() => {});
			};
			const readOf = (item) => !!item.read || seenIds.has(item.id);
			(0, react.useEffect)(() => {
				api.watches().then((r) => setWatches(r.watches)).catch(() => {});
				api.calendarDay(dayKey(/* @__PURE__ */ new Date())).then((r) => setEvents(r.events)).catch(() => setEvents(null));
				api.briefPrefs().then((r) => setBriefSlots(r.slots)).catch(() => setBriefSlots(null));
			}, [summary]);
			/** 取稿等待态：新简报卡落地（对应 kind 出现在今日 items）或 120s 超时后清掉。 */
			(0, react.useEffect)(() => {
				if (!briefFetching) return;
				const today = dayKey(/* @__PURE__ */ new Date());
				if (summary?.items.some((i) => i.batchKind && Object.values(BRIEF_KIND).includes(i.batchKind) && dayKey(new Date(i.at)) === today)) {
					setBriefFetching(false);
					return;
				}
				const timer = setTimeout(() => setBriefFetching(false), 12e4);
				return () => clearTimeout(timer);
			}, [briefFetching, summary]);
			const { days, total, windowed } = (0, react.useMemo)(() => {
				if (!summary) return {
					days: [],
					total: 0,
					windowed: false
				};
				const cutoff = Date.now() - WINDOW_DAYS * 864e5;
				const items = summary.items.filter((i) => new Date(i.at).getTime() >= cutoff);
				const dayMap = /* @__PURE__ */ new Map();
				const groupMap = /* @__PURE__ */ new Map();
				for (const item of items) {
					const day = dayKey(new Date(item.at));
					const batch = batchOf(item.at);
					const gkey = item.batchId || item.batchKind ? `批|${item.batchKind ?? ""}|${item.batchId ?? ""}` : batch;
					const kindTitle = item.batchKind ? KIND_TITLE[item.batchKind] : void 0;
					const label = item.batchKind ? kindTitle ? t(kindTitle) : item.batchKind : item.batchId ?? t(`feed.group.${batch}`);
					const ambient = item.batchKind ? KIND_AMBIENT[item.batchKind] : void 0;
					let groups = groupMap.get(day);
					if (!groups) {
						groups = /* @__PURE__ */ new Map();
						groupMap.set(day, groups);
					}
					const g = groups.get(gkey) ?? {
						key: gkey,
						label,
						ambient,
						items: []
					};
					g.items.push(item);
					const at = hhmm(item.at);
					if (!g.time || at > g.time) g.time = at;
					groups.set(gkey, g);
				}
				for (const [day, groups] of groupMap) {
					const d = /* @__PURE__ */ new Date(`${day}T00:00:00`);
					const weekday = t(`date.weekday.${[
						"sun",
						"mon",
						"tue",
						"wed",
						"thu",
						"fri",
						"sat"
					][d.getDay()]}`);
					const list = [...groups.values()];
					for (const g of list) g.items.sort((a, b) => Number(!!b.pinned) - Number(!!a.pinned));
					list.sort((a, b) => Number(!!b.ambient) - Number(!!a.ambient) || (b.time ?? "").localeCompare(a.time ?? ""));
					dayMap.set(day, {
						day,
						label: t("date.dayHeader", {
							month: d.getMonth() + 1,
							day: d.getDate(),
							weekday
						}),
						groups: list
					});
				}
				return {
					days: [...dayMap.values()].sort((a, b) => b.day.localeCompare(a.day)),
					total: items.length,
					windowed: items.length < summary.items.length
				};
			}, [summary, t]);
			const shown = (0, react.useMemo)(() => {
				let budget = visible;
				return days.map((day) => {
					const groups = day.groups.map((g) => {
						const take = Math.min(g.items.length, budget);
						budget -= take;
						return take > 0 ? {
							...g,
							items: g.items.slice(0, take)
						} : null;
					}).filter((g) => g !== null);
					return groups.length ? {
						...day,
						groups
					} : null;
				}).filter((d) => d !== null);
			}, [days, visible]);
			const hasMore = total > visible;
			(0, react.useEffect)(() => {
				const el = sentinelRef.current;
				if (!el || !hasMore) return;
				const io = new IntersectionObserver((entries) => {
					if (entries.some((e) => e.isIntersecting)) setVisible((v) => v + PAGE);
				}, { rootMargin: "240px" });
				io.observe(el);
				return () => io.disconnect();
			}, [hasMore]);
			/** 批次在视口集合——未读批次胶囊只在对应批次滚出视口时浮现（unreadBatch 语义）。 */
			(0, react.useEffect)(() => {
				const io = new IntersectionObserver((entries) => {
					setInView((prev) => {
						const next = new Set(prev);
						for (const e of entries) {
							const k = e.target.dataset.groupKey;
							if (k) e.isIntersecting ? next.add(k) : next.delete(k);
						}
						return next;
					});
				}, { rootMargin: "-72px 0px 0px 0px" });
				for (const el of groupRefs.current.values()) io.observe(el);
				return () => io.disconnect();
			}, [shown]);
			const unreadGroup = shown.flatMap((d) => d.groups).find((g) => g.items.some((i) => !readOf(i)) && !inView.has(g.key));
			const submit = async () => {
				const title = draft.trim();
				if (!title || posting) return;
				setPosting(true);
				try {
					await api.postItem(title);
					setDraft("");
					onChanged();
				} catch {} finally {
					setPosting(false);
				}
			};
			if (!summary) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", { className: today_module_css_default.loading });
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [
				events !== null ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(EventsCard, {
					events,
					t,
					now
				}) : null,
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("h2", {
					className: today_module_css_default.sectionTitle,
					id: "today-schedule",
					children: [t("section.routines"), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
						type: "button",
						className: today_module_css_default.linkButton,
						onClick: actions.openSchedules,
						children: [t("section.scheduleAll"), " →"]
					})]
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)(ScheduleList, {
					cards: summary.schedules,
					t,
					onChanged,
					limit: 3
				}),
				briefSlots !== null ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(LatestBrief, {
					t,
					slots: briefSlots,
					items: summary.items,
					creating: briefFetching,
					onFetch: () => {
						setBriefFetching(true);
						actions.sendPrompt("mino-brief", t("brief.fetchPrompt")).then((ok) => {
							if (!ok) setBriefFetching(false);
						});
					}
				}) : null,
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)(WidgetSection, {
					t,
					watches,
					schedules: summary.schedules,
					actions,
					hintDismissed,
					onDismissHint: () => {
						setHintDismissed(true);
						try {
							localStorage.setItem("mino-today.widgetHint.dismissed", "1");
						} catch {}
					},
					onChanged: () => {
						api.watches().then((r) => setWatches(r.watches)).catch(() => {});
					}
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: today_module_css_default.sectionRow,
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("h2", {
						className: today_module_css_default.sectionTitle,
						id: "today-feed",
						children: [t("section.feed"), summary.items.some((i) => !i.read) ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: today_module_css_default.linkButton,
							onClick: () => {
								api.markRead().then(onChanged).catch(() => {});
							},
							children: t("feed.readAll")
						}) : null]
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: today_module_css_default.quickAdd,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
							className: today_module_css_default.quickInput,
							value: draft,
							placeholder: t("feed.addPlaceholder"),
							onChange: (e) => setDraft(e.target.value),
							onKeyDown: (e) => {
								if (e.key === "Enter") submit();
							}
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: today_module_css_default.quickButton,
							disabled: !draft.trim() || posting,
							onClick: () => void submit(),
							children: t("feed.add")
						})]
					})]
				}),
				unreadGroup && !editing ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
					type: "button",
					className: today_module_css_default.unreadPill,
					onClick: () => {
						groupRefs.current.get(unreadGroup.key)?.scrollIntoView({
							behavior: "smooth",
							block: "start"
						});
						for (const i of unreadGroup.items) if (!readOf(i)) markSeen(i.id);
					},
					children: t("feed.newBatchOf", { label: unreadGroup.label })
				}) : null,
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: today_module_css_default.customizeRow,
					children: editing ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: today_module_css_default.miniButton,
						"data-active": true,
						onClick: () => setEditing(false),
						children: t("customize.done")
					}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: today_module_css_default.miniButton,
						onClick: () => setEditing(true),
						children: t("customize.edit")
					})
				}),
				editing ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: today_module_css_default.customizePanel,
					children: renderSlot?.("today.page.customize", {}, { fallback: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: today_module_css_default.emptyPanel,
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
							className: today_module_css_default.emptyText,
							children: t("customize.empty")
						})
					}) }) ?? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: today_module_css_default.emptyPanel,
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
							className: today_module_css_default.emptyText,
							children: t("customize.empty")
						})
					})
				}) : summary.items.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: today_module_css_default.emptyPanel,
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: today_module_css_default.emptyTitle,
						children: t("feed.empty.title")
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: today_module_css_default.emptyText,
						children: t("feed.empty.body")
					})]
				}) : shown.map((day) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: today_module_css_default.feedDay,
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", {
						className: today_module_css_default.dayHead,
						children: day.label
					}), day.groups.map((group) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
						className: today_module_css_default.feedGroup,
						"data-group-key": group.key,
						"data-batch-id": group.key,
						"data-batch-kind": group.ambient,
						ref: (el) => {
							revealRef(el);
							if (el) groupRefs.current.set(group.key, el);
						},
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(BatchTitle, {
							ambient: group.ambient,
							title: group.label,
							time: group.time
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
							className: today_module_css_default.feedList,
							children: group.items.map((item) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(FeedCard, {
								item,
								t,
								now,
								actions,
								read: readOf(item),
								onSeen: markSeen,
								onDelete: (id) => {
									api.deleteItem(id).then(onChanged).catch(() => {});
								},
								onFeedback: (id, signal) => {
									api.feedback(id, signal).then(onChanged).catch(() => {});
								},
								onPin: (id, pinned) => {
									api.setPin(id, pinned).then(onChanged).catch(() => {});
								}
							}, item.id))
						})]
					}, group.key))]
				}, day.day)),
				summary.items.length > 0 ? hasMore ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					ref: sentinelRef,
					className: today_module_css_default.feedLoading,
					children: t("feed.loadingMore")
				}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
					className: today_module_css_default.feedEnd,
					children: t(windowed ? "feed.window" : "feed.end")
				}) : null
			] });
		}
		// src/client/MemoryTab.tsx
		/**
		* 「记忆」视图：皇冠「我对你的了解」卡 + 「全部」分类网格（对齐 Today 记忆页）——
		* 点分类卡=按类筛选出下面的记忆列表。数据仍走 fish-memory 自己的
		* /dsh-fish-memory/list —— 不读它的存储、不 import 它的代码。
		*/
		/** 常见分类的图标映射；没见过的类用文件夹。 */
		const CAT_ICONS = [
			[/健康|health|运动|身体/i, "♥"],
			[/工作|work|job|career/i, "⌂"],
			[/财务|finance|钱|账/i, "￥"],
			[/家庭|family|家人/i, "⌂"],
			[/学习|learn|study|读书/i, "✎"],
			[/人际|朋友|social|关系/i, "☺"],
			[/兴趣|hobby|爱好/i, "✦"],
			[/出行|travel|trip|行程/i, "✈"],
			[/信息|偏好|preference|习惯/i, "☰"]
		];
		const CAT_TONES = [
			"pink",
			"blue",
			"amber",
			"green",
			"violet",
			"red"
		];
		function catIcon(category) {
			for (const [re, icon] of CAT_ICONS) if (re.test(category)) return icon;
			return "▤";
		}
		function catTone(category) {
			let h = 0;
			for (const ch of category) h = h * 31 + ch.charCodeAt(0) >>> 0;
			return CAT_TONES[h % CAT_TONES.length] ?? "blue";
		}
		function MemoryRowView({ row, t, now }) {
			const pct = row.activation === null ? null : Math.round(row.activation * 100);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", {
				className: today_module_css_default.memoryRow,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: today_module_css_default.memoryText,
					children: row.text
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: today_module_css_default.memoryMeta,
					children: [
						row.sessionTitle ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: today_module_css_default.memorySession,
							children: row.sessionTitle
						}) : null,
						row.at ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: relTime(row.at, now) }) : null,
						pct !== null ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
							className: today_module_css_default.fresh,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: today_module_css_default.freshBar,
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: today_module_css_default.freshFill,
									style: { width: `${pct}%` }
								})
							}), t("memory.freshness", { pct })]
						}) : null
					]
				})]
			});
		}
		function MemoryTab({ t }) {
			const [state, setState] = (0, react.useState)("loading");
			const [query, setQuery] = (0, react.useState)("");
			const now = useNow();
			const load = (0, react.useCallback)(() => {
				setState("loading");
				api.memoryList().then((res) => {
					const rows = [];
					for (const s of res.sessions || []) for (const m of s.memories || []) rows.push({
						...m,
						sessionTitle: s.title || ""
					});
					setState(rows);
				}).catch((error) => setState(error instanceof Error && error.message === "404" ? "missing" : "error"));
			}, []);
			(0, react.useEffect)(load, [load]);
			const { stable, fading, about, cats, latestAt } = (0, react.useMemo)(() => {
				if (!Array.isArray(state)) return {
					stable: [],
					fading: [],
					about: [],
					cats: [],
					latestAt: void 0
				};
				const q = query.trim().toLowerCase();
				const match = (r) => !q || r.text.toLowerCase().includes(q) || (r.category ?? "").toLowerCase().includes(q) || (r.sessionTitle ?? "").toLowerCase().includes(q);
				const filtered = state.filter(match);
				const stable = filtered.filter((r) => r.freshKind === "fact");
				const fading = filtered.filter((r) => r.freshKind !== "fact").sort((a, b) => (b.activation ?? 0) - (a.activation ?? 0));
				const about = [...state].sort((a, b) => (b.importance ?? 0) - (a.importance ?? 0)).slice(0, 6);
				const byCat = /* @__PURE__ */ new Map();
				for (const r of state) {
					const c = (r.category ?? "").trim() || "—";
					byCat.set(c, (byCat.get(c) ?? 0) + 1);
				}
				const cats = [...byCat.entries()].map(([name, count]) => ({
					name,
					count
				}));
				cats.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
				return {
					stable,
					fading,
					about,
					cats,
					latestAt: state.map((r) => r.at).filter((a) => Boolean(a)).sort().at(-1)
				};
			}, [state, query]);
			const titleRow = /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: today_module_css_default.pageTitleRow,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", {
					className: today_module_css_default.pageTitle,
					children: t("tab.memory")
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
					className: today_module_css_default.searchInput,
					value: query,
					placeholder: t("memory.search"),
					onChange: (e) => setQuery(e.target.value)
				})]
			});
			if (state === "loading") return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [titleRow, /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
				className: today_module_css_default.sectionHint,
				children: t("memory.loading")
			})] });
			if (state === "missing") return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [titleRow, /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: today_module_css_default.emptyPanel,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: today_module_css_default.emptyTitle,
					children: t("memory.missing.title")
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
					className: today_module_css_default.emptyText,
					children: t("memory.missing.body")
				})]
			})] });
			if (state === "error") return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [titleRow, /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
				type: "button",
				className: today_module_css_default.errorBox,
				onClick: load,
				children: t("error.load")
			})] });
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [
				titleRow,
				state.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
					className: today_module_css_default.sectionHint,
					children: t("memory.empty")
				}) : null,
				!query && about.length > 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
					className: today_module_css_default.aboutCard,
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: today_module_css_default.aboutCrown,
							children: "♛"
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", {
							className: today_module_css_default.aboutTitle,
							children: t("memory.about")
						}),
						latestAt ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: today_module_css_default.aboutMeta,
							children: t("memory.updated", { time: relTime(latestAt, now) })
						}) : null,
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: today_module_css_default.aboutLabel,
							children: t("memory.summary")
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
							className: today_module_css_default.aboutList,
							children: about.map((r) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("li", {
								className: today_module_css_default.aboutItem,
								children: r.text
							}, r.id))
						})
					]
				}) : null,
				!query && about.length === 0 && state.length > 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
					className: today_module_css_default.sectionHint,
					children: t("memory.aboutEmpty")
				}) : null,
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: today_module_css_default.sectionRow,
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("h3", {
						className: today_module_css_default.recoTitle,
						children: [
							t("memory.all"),
							" ",
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: today_module_css_default.countNote,
								children: t("memory.count", { count: state.length })
							})
						]
					})
				}),
				!query && cats.length > 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
					className: today_module_css_default.catGrid,
					children: cats.map((c) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
						type: "button",
						className: today_module_css_default.catCard,
						onClick: () => setQuery(c.name === "—" ? "" : c.name),
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: today_module_css_default.catIcon,
								"data-tone": catTone(c.name),
								children: catIcon(c.name)
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: today_module_css_default.catName,
								children: c.name === "—" ? t("memory.catOther") : c.name
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: today_module_css_default.catCount,
								children: t("memory.catCount", { count: c.count })
							})
						]
					}) }, c.name))
				}) : null,
				query && stable.length === 0 && fading.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
					className: today_module_css_default.sectionHint,
					children: t("memory.noMatch")
				}) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [stable.length > 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
					className: today_module_css_default.feedGroup,
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", {
						className: today_module_css_default.feedGroupHead,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: today_module_css_default.feedGroupKind,
								children: t("memory.stable")
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: today_module_css_default.feedGroupDivider,
								children: "·"
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: today_module_css_default.feedGroupCount,
								children: t("memory.count", { count: stable.length })
							})
						]
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
						className: today_module_css_default.memoryList,
						children: stable.map((r) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(MemoryRowView, {
							row: r,
							t,
							now
						}, r.id))
					})]
				}) : null, fading.length > 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
					className: today_module_css_default.feedGroup,
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", {
						className: today_module_css_default.feedGroupHead,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: today_module_css_default.feedGroupKind,
								children: t("memory.fading")
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: today_module_css_default.feedGroupDivider,
								children: "·"
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: today_module_css_default.feedGroupCount,
								children: t("memory.count", { count: fading.length })
							})
						]
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
						className: today_module_css_default.memoryList,
						children: fading.map((r) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(MemoryRowView, {
							row: r,
							t,
							now
						}, r.id))
					})]
				}) : null] })
			] });
		}
		// src/client/TasksTab.tsx
		/**
		* 「任务」视图：分段开关「任务 | 定时任务」（对齐 Today 的任务页骨架）——
		* 任务段 = 为你推荐（推荐卡把 prompt 发给米洛/开新会话）+ 活跃会话后台 job 分组；
		* 定时任务段 = 定时版推荐 + 自有 schedule 列表（可暂停/恢复）。
		*/
		/** 推荐卡的图标：按序号轮转一组彩色字形（图标不是文案，不进 locales）。 */
		const RECO_ICONS = [
			"☰",
			"✉",
			"⌕",
			"◫",
			"☂",
			"✦",
			"↻",
			"⏱"
		];
		const RECO_TONES = [
			"blue",
			"violet",
			"green",
			"amber",
			"red",
			"pink"
		];
		/** 每段的推荐条数；文案全部走 locales 的 tasks.reco.{seg}.{i}.*。 */
		const RECO_COUNT = 6;
		function RecoList({ seg, t, actions }) {
			const [sent, setSent] = (0, react.useState)(null);
			const [busy, setBusy] = (0, react.useState)(false);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", {
				className: today_module_css_default.recoTitle,
				children: t("tasks.reco.title")
			}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
				className: today_module_css_default.recoList,
				children: Array.from({ length: RECO_COUNT }, (_, i) => {
					const title = t(`tasks.reco.${seg}.${i}.title`);
					if (!title || title === `tasks.reco.${seg}.${i}.title`) return null;
					return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", {
						className: today_module_css_default.recoCard,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: today_module_css_default.recoIcon,
								"data-tone": RECO_TONES[i % RECO_TONES.length],
								children: RECO_ICONS[i % RECO_ICONS.length]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
								className: today_module_css_default.recoText,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: today_module_css_default.recoName,
									children: title
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: today_module_css_default.recoDesc,
									children: t(`tasks.reco.${seg}.${i}.desc`)
								})]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: today_module_css_default.recoAdd,
								"aria-label": title,
								disabled: busy || sent === i,
								onClick: () => {
									setBusy(true);
									actions.sendPrompt(void 0, t(`tasks.reco.${seg}.${i}.prompt`)).then((ok) => {
										if (ok) setSent(i);
									}).finally(() => setBusy(false));
								},
								children: sent === i ? "✓" : "+"
							})
						]
					}, i);
				})
			})] });
		}
		function JobCard({ row, t, now, actions }) {
			const { job } = row;
			const [busy, setBusy] = (0, react.useState)(false);
			const running = job.status === "running" || job.status === "stopping";
			const end = job.finishedAt ?? now;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", {
				className: today_module_css_default.jobCard,
				"data-status": job.status,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: today_module_css_default.jobHead,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: today_module_css_default.jobStatus,
								"data-status": job.status
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: today_module_css_default.jobLabel,
								children: job.label || job.kind
							}),
							job.progress ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: today_module_css_default.chip,
								"data-tone": "run",
								children: t("tasks.progress", { progress: job.progress })
							}) : null,
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: today_module_css_default.jobTime,
								children: running ? t("tasks.duration", { duration: durationText(end - job.startedAt) }) : ""
							})
						]
					}),
					job.detail ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: today_module_css_default.jobDetail,
						children: job.detail
					}) : null,
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: today_module_css_default.jobFoot,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: today_module_css_default.miniButton,
							onClick: () => actions.openSession(row.sessionId),
							children: row.sessionTitle || t("tasks.openSession")
						}), running ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: today_module_css_default.miniButton,
							disabled: busy,
							onClick: () => {
								setBusy(true);
								actions.killJob(row.sessionId, job.id).finally(() => setBusy(false));
							},
							children: t("tasks.kill")
						}) : null]
					})
				]
			});
		}
		function JobGroup({ title, rows, t, now, actions }) {
			if (rows.length === 0) return null;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
				className: today_module_css_default.feedGroup,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", {
					className: today_module_css_default.feedGroupHead,
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: today_module_css_default.feedGroupKind,
							children: title
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: today_module_css_default.feedGroupDivider,
							children: "·"
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: today_module_css_default.feedGroupCount,
							children: t("memory.count", { count: rows.length })
						})
					]
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
					className: today_module_css_default.jobList,
					children: rows.map((row) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(JobCard, {
						row,
						t,
						now,
						actions
					}, `${row.sessionId}:${row.job.id}`))
				})]
			});
		}
		/** 订了哪些会话的 job 流：正在跑的全部 + 最近活跃的 5 个。 */
		const MAX_WATCHED_SESSIONS = 8;
		function TasksTab({ t, actions, sessions, useJobs, now, summary, onChanged }) {
			const [seg, setSeg] = (0, react.useState)("task");
			const jobsState = useJobs?.((s) => s) ?? { rows: {} };
			/** 订阅范围：running 会话优先，剩下按最近活跃补齐。 */
			const watchIds = (0, react.useMemo)(() => {
				const rows = sessions.ids.map((id) => sessions.byId[id]).filter((r) => Boolean(r));
				const running = rows.filter((r) => r.running).map((r) => r.id);
				const recent = rows.filter((r) => !r.running).sort((a, b) => b.updatedAt - a.updatedAt).map((r) => r.id);
				return [...running, ...recent].slice(0, MAX_WATCHED_SESSIONS);
			}, [sessions]);
			const heldRef = (0, react.useRef)(/* @__PURE__ */ new Map());
			(0, react.useEffect)(() => {
				const held = heldRef.current;
				const wanted = new Set(watchIds);
				for (const id of wanted) if (!held.has(id)) held.set(id, actions.watchJobs(id));
				for (const [id, release] of held) if (!wanted.has(id)) {
					release();
					held.delete(id);
				}
			}, [watchIds, actions]);
			(0, react.useEffect)(() => () => {
				for (const [, release] of heldRef.current) release();
				heldRef.current.clear();
			}, []);
			const { running, done, failed } = (0, react.useMemo)(() => {
				const running = [];
				const done = [];
				const failed = [];
				for (const [sessionId, rows] of Object.entries(jobsState.rows)) for (const job of rows) {
					const row = {
						job,
						sessionId,
						sessionTitle: sessions.byId[sessionId]?.displayTitle ?? ""
					};
					if (job.status === "running" || job.status === "stopping") running.push(row);
					else if (job.status === "completed") done.push(row);
					else failed.push(row);
				}
				const byEnd = (a, b) => (b.job.finishedAt ?? b.job.startedAt) - (a.job.finishedAt ?? a.job.startedAt);
				running.sort((a, b) => a.job.startedAt - b.job.startedAt);
				done.sort(byEnd);
				failed.sort(byEnd);
				return {
					running,
					done,
					failed
				};
			}, [jobsState, sessions]);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: today_module_css_default.pageTitleRow,
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", {
						className: today_module_css_default.pageTitle,
						children: t("tab.tasks")
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: today_module_css_default.createButton,
						onClick: () => {
							if (seg === "task") actions.newChat();
							else actions.openSchedules();
						},
						children: seg === "task" ? t("tasks.create") : t("tasks.createSchedule")
					})]
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: today_module_css_default.segmented,
					role: "tablist",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
						type: "button",
						role: "tab",
						className: today_module_css_default.seg,
						"data-active": seg === "task",
						onClick: () => setSeg("task"),
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: today_module_css_default.segIcon,
							children: "☰"
						}), t("tasks.seg.task")]
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
						type: "button",
						role: "tab",
						className: today_module_css_default.seg,
						"data-active": seg === "schedule",
						onClick: () => setSeg("schedule"),
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: today_module_css_default.segIcon,
							children: "◷"
						}), t("tasks.seg.schedule")]
					})]
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)(RecoList, {
					seg,
					t,
					actions
				}),
				seg === "task" ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: today_module_css_default.sectionHint,
						children: t("tasks.note")
					}),
					running.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: today_module_css_default.sectionHint,
						children: t("tasks.empty.running")
					}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(JobGroup, {
						title: t("tasks.running"),
						rows: running,
						t,
						now,
						actions
					}),
					done.length === 0 && failed.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: today_module_css_default.sectionHint,
						children: t("tasks.empty.done")
					}) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(JobGroup, {
						title: t("tasks.done"),
						rows: done,
						t,
						now,
						actions
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(JobGroup, {
						title: t("tasks.failed"),
						rows: failed,
						t,
						now,
						actions
					})] })
				] }) : summary ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ScheduleList, {
					cards: summary.schedules,
					t,
					onChanged
				}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", { className: today_module_css_default.loading })
			] });
		}
		// src/client/TodayPage.tsx
		/**
		* 「今日」主页面：晨曦渐变 hero（问候 + 正在处理 + 陪伴统计 + 和米洛聊聊）
		* 下面挂四个视图 —— 今日动态 / 任务 / 记忆 / 日记。
		* 数据：自有路由 /mino-today/api/* + fish-memory /dsh-fish-memory/list
		* + 官方缝（sessions.list / jobs.state / uiWorkspace / schedule）。
		*/
		const EMPTY_SESSIONS = {
			ids: [],
			byId: {}
		};
		function greetingKey(hour) {
			if (hour < 5) return "greeting.night";
			if (hour < 9) return "greeting.morning";
			if (hour < 12) return "greeting.forenoon";
			if (hour < 14) return "greeting.noon";
			if (hour < 18) return "greeting.afternoon";
			if (hour < 23) return "greeting.evening";
			return "greeting.night";
		}
		/** 陪伴天数：从最早一条记录算到今天（至少 1）。 */
		function daysSince(iso) {
			if (!iso) return 1;
			const start = new Date(iso.slice(0, 10));
			if (Number.isNaN(start.getTime())) return 1;
			const days = Math.floor((new Date(dayKey(/* @__PURE__ */ new Date())).getTime() - start.getTime()) / 864e5) + 1;
			return Math.max(1, days);
		}
		function TodayPage({ t, actions, useSessionList, useJobs, renderSlot }) {
			const [tab, setTab] = (0, react.useState)("feed");
			const [summary, setSummary] = (0, react.useState)(null);
			const [summaryFailed, setSummaryFailed] = (0, react.useState)(false);
			const [loadedAt, setLoadedAt] = (0, react.useState)(null);
			const now = useNow();
			const loadSummary = (0, react.useCallback)(() => {
				setSummaryFailed(false);
				api.summary().then((res) => {
					setSummary(res);
					setLoadedAt(Date.now());
				}).catch(() => setSummaryFailed(true));
			}, []);
			(0, react.useEffect)(() => {
				actions.refreshSessions();
				loadSummary();
			}, [actions, loadSummary]);
			const sessions = useSessionList?.((s) => s) ?? EMPTY_SESSIONS;
			const runningSessions = (0, react.useMemo)(() => sessions.ids.map((id) => sessions.byId[id]).filter((s) => Boolean(s?.running)), [sessions]);
			const runningCount = runningSessions.length;
			const today = /* @__PURE__ */ new Date();
			const dateLine = today.toLocaleDateString(void 0, {
				month: "long",
				day: "numeric",
				weekday: "long"
			});
			const stats = summary?.stats;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: today_module_css_default.page,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("nav", {
					className: today_module_css_default.tabs,
					children: [
						"feed",
						"tasks",
						"memory",
						"diary",
						"voice"
					].map((key) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
						type: "button",
						className: today_module_css_default.tab,
						"data-active": tab === key,
						onClick: () => setTab(key),
						children: [t(`tab.${key}`), key === "tasks" && runningCount > 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: today_module_css_default.tabBadge,
							children: runningCount
						}) : null]
					}, key))
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("main", {
					className: today_module_css_default.body,
					children: [
						tab === "feed" ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", {
							className: today_module_css_default.hero,
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: today_module_css_default.heroMain,
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
											className: today_module_css_default.heroDate,
											children: dateLine
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h1", {
											className: today_module_css_default.heroGreeting,
											children: t(greetingKey(today.getHours()))
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
											className: today_module_css_default.heroStats,
											children: [
												stats ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
													className: today_module_css_default.statChip,
													children: t("hero.stat.days", { count: daysSince(stats.oldestAt) })
												}) : null,
												stats ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
													type: "button",
													className: today_module_css_default.statChip,
													title: t("section.feed"),
													onClick: () => document.getElementById("today-feed")?.scrollIntoView({
														behavior: "smooth",
														block: "start"
													}),
													children: t("hero.stat.feed", { count: stats.feedCount })
												}) : null,
												stats ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
													type: "button",
													className: today_module_css_default.statChip,
													title: t("tab.diary"),
													onClick: () => setTab("diary"),
													children: t("hero.stat.diary", { count: stats.diaryDays })
												}) : null,
												summary ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
													type: "button",
													className: today_module_css_default.statChip,
													title: t("section.routines"),
													onClick: () => document.getElementById("today-schedule")?.scrollIntoView({
														behavior: "smooth",
														block: "start"
													}),
													children: t("hero.stat.schedule", { count: summary.schedules.length })
												}) : null
											]
										})
									]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: today_module_css_default.heroSide,
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: today_module_css_default.chatButton,
										onClick: () => void actions.newChat(),
										children: t("hero.chat")
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: today_module_css_default.updatedAt,
										title: t("hero.updated", { time: loadedAt ? hhmm(loadedAt) : "—" }),
										onClick: loadSummary,
										children: t("hero.updated", { time: loadedAt ? hhmm(loadedAt) : "—" })
									})]
								}),
								runningCount > 0 && runningSessions[0] ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
									type: "button",
									className: today_module_css_default.workingBar,
									onClick: () => {
										const s = runningSessions[0];
										if (s) actions.openSession(s.id);
									},
									...edgeGlowHandlers(),
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: today_module_css_default.edgeLight }),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: today_module_css_default.workingDot }),
										runningCount === 1 ? t("hero.working", { title: runningSessions[0]?.displayTitle ?? "" }) : t("hero.workingMore", {
											title: runningSessions[0]?.displayTitle ?? "",
											count: runningCount
										})
									]
								}) : null
							]
						}) : null,
						summaryFailed && tab === "feed" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: today_module_css_default.errorBox,
							onClick: loadSummary,
							children: t("error.load")
						}) : null,
						tab === "feed" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(FeedTab, {
							t,
							summary,
							onChanged: loadSummary,
							actions,
							renderSlot
						}) : null,
						tab === "tasks" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(TasksTab, {
							t,
							actions,
							sessions,
							useJobs,
							now,
							summary,
							onChanged: loadSummary
						}) : null,
						tab === "memory" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(MemoryTab, { t }) : null,
						tab === "diary" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(DiaryTab, { t }) : null,
						tab === "voice" ? renderSlot?.("today.page.voice", {}, { fallback: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: today_module_css_default.emptyPanel,
							children: t("tab.voiceEmpty")
						}) }) ?? null : null
					]
				})]
			});
		}
		// src/client/TodayPostRow.tsx
		function parseArgs(raw) {
			if (!raw) return null;
			try {
				const v = JSON.parse(raw);
				return v && typeof v === "object" ? v : null;
			} catch {
				return null;
			}
		}
		function CardBody({ card }) {
			if (card.type === "list" && Array.isArray(card.items)) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
				className: today_module_css_default.tvList,
				children: card.items.slice(0, 5).map((it, i) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("li", { children: it }, i))
			});
			if (card.type === "metric" && card.value !== void 0) return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: today_module_css_default.tvMetric,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					className: today_module_css_default.tvMetricValue,
					children: String(card.value)
				}), card.label ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					className: today_module_css_default.tvMetricLabel,
					children: card.label
				}) : null]
			});
			if (card.type === "progress" && typeof card.done === "number" && typeof card.total === "number" && card.total > 0) {
				const pct = Math.min(100, Math.round(card.done / card.total * 100));
				return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: today_module_css_default.tvProgress,
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: today_module_css_default.tvProgressBar,
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: today_module_css_default.tvProgressFill,
							style: { width: `${pct}%` }
						})
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
						className: today_module_css_default.tvProgressText,
						children: [
							card.done,
							"/",
							card.total,
							card.label ? ` · ${card.label}` : ""
						]
					})]
				});
			}
			return null;
		}
		function TodayPostRow(props) {
			const { t } = props;
			const args = parseArgs(props.phase === "result" ? props.block.call?.argsRaw : props.block.argsRaw);
			const failed = props.phase === "result" && props.block.isError === true;
			const errorText = failed ? (props.block.content ?? []).map((b) => b.text ?? "").join(" ").trim() : "";
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: today_module_css_default.tvRow,
				"data-error": failed || void 0,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: today_module_css_default.tvHead,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: today_module_css_default.tvBadge,
								children: t("tv.badge")
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: today_module_css_default.tvTitle,
								children: args?.title ?? t("tv.untitled")
							}),
							args?.batch ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: today_module_css_default.tvBatch,
								children: args.batch
							}) : null,
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: today_module_css_default.tvState,
								children: failed ? t("tv.failed") : props.phase === "result" ? t("tv.posted") : t("tv.posting")
							})
						]
					}),
					args?.summary ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: today_module_css_default.tvSummary,
						children: args.summary
					}) : null,
					Array.isArray(args?.items) && args.items.length > 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
						className: today_module_css_default.tvList,
						children: args.items.slice(0, 5).map((it, i) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("li", { children: it }, i))
					}) : null,
					args?.card ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CardBody, { card: args.card }) : null,
					failed && errorText ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: today_module_css_default.tvError,
						children: errorText
					}) : null
				]
			});
		}
		// src/client/locales.ts
		/**
		* mino-today 的文案：注册进 ctx.locale 的 'mino-today' 命名空间，
		* 组件经 slot inject face 拿到 bind() 出来的 t()。zh 为主语言，en 兜底。
		*/
		const zh = {
			"entry.label": "今日",
			"tab.feed": "今日",
			"tab.tasks": "任务",
			"tab.memory": "记忆",
			"tab.diary": "日记",
			"tab.voice": "语音",
			"tab.voiceEmpty": "语音笔记插件未安装",
			"greeting.morning": "早",
			"greeting.forenoon": "上午好",
			"greeting.noon": "中午好",
			"greeting.afternoon": "下午好",
			"greeting.evening": "晚上好",
			"greeting.night": "夜深了",
			"hero.tagline": "今天 {date}",
			"hero.working": "正在处理：{title}",
			"hero.workingMore": "正在处理：{title} 等 {count} 件",
			"hero.updated": "更新于 · {time}",
			"hero.chat": "和米洛聊聊",
			"hero.stat.feed": "{count} 条动态",
			"hero.stat.diary": "{count} 篇日记",
			"hero.stat.days": "陪伴 {count} 天",
			"hero.stat.schedule": "{count} 个定时任务",
			"section.schedule": "日程进展",
			"section.scheduleAll": "全部定时任务",
			"schedule.empty": "还没有定时任务 —— 在对话里说「每天早上提醒我…」就能建一个",
			"schedule.status.active": "进行中",
			"schedule.status.paused": "已暂停",
			"schedule.status.ended": "已结束",
			"schedule.running": "正在执行",
			"schedule.nextToday": "今天 {time}",
			"schedule.nextTomorrow": "明天 {time}",
			"schedule.lastRun": "上次 {time}",
			"schedule.pause": "暂停",
			"schedule.resume": "恢复",
			"schedule.every": "每 {interval}",
			"schedule.daily": "每天 {time}",
			"schedule.weekly": "每周 {time}",
			"schedule.once": "单次",
			"schedule.repeating": "重复",
			"schedule.showMore": "还有 {count} 条",
			"schedule.showLess": "收起",
			"section.feed": "动态",
			"feed.empty.title": "今天还没有新动态",
			"feed.empty.body": "让米洛帮你做点什么 —— 做完的事会记在这里。",
			"feed.group.morning": "晨间",
			"feed.group.afternoon": "下午",
			"feed.group.evening": "晚间",
			"feed.addPlaceholder": "给自己记一条…",
			"feed.add": "记下",
			"feed.dismiss": "划掉",
			"feed.delete": "删除",
			"feed.pin": "置顶",
			"feed.unpin": "取消置顶",
			"feed.up": "有用",
			"feed.down": "没用",
			"feed.notInterested": "不感兴趣",
			"feed.unread": "未读",
			"feed.readAll": "全部已读",
			"feed.openSession": "打开会话",
			"feed.more": "更多",
			"feed.confirmDelete": "确认删除？",
			"feed.end": "已看完全部内容，晚点再来看看吧",
			"feed.window": "这里只展示最近 14 天的内容",
			"feed.loadingMore": "加载更多",
			"feed.kind.note": "便签",
			"feed.kind.result": "交付",
			"feed.kind.moment": "留意",
			"feed.sent": "已发给米洛",
			"feed.expand": "展开",
			"feed.collapse": "收起",
			"feed.newBatch": "新的",
			"feed.newBatchOf": "新的{label}",
			"feed.askAgent": "问问米洛",
			"feed.askPrompt": "请帮我了解这则更新：{title}",
			"batch.title.morning": "早间简报",
			"batch.title.evening": "晚间简报",
			"batch.title.diary": "日记",
			"batch.title.healthBrief": "健康报告",
			"batch.title.firstHealth": "首次健康分析报告",
			"batch.title.weeklyHealth": "健康周报",
			"batch.title.welcome": "欢迎",
			"batch.title.featureIntro": "新功能",
			"date.dayHeader": "{month}月{day}日 · {weekday}",
			"date.weekday.sun": "周日",
			"date.weekday.mon": "周一",
			"date.weekday.tue": "周二",
			"date.weekday.wed": "周三",
			"date.weekday.thu": "周四",
			"date.weekday.fri": "周五",
			"date.weekday.sat": "周六",
			"schedule.startingSoon": "即将开始",
			"customize.edit": "自定义",
			"customize.done": "完成",
			"customize.empty": "没有可自定义的内容——装了早晚报之类的生成方插件后，它们的偏好会出现在这里。",
			"watch.add": "添加组件",
			"watch.addPlaceholder": "想一直盯着点什么？比如追踪一只股票、盯住开销…",
			"watch.addSend": "创建",
			"watch.addPrompt": "帮我创建一个实时组件，长期追踪「{topic}」——用 watch_add 建追踪。",
			"watch.hintTitle": "想一直盯着点什么？",
			"watch.hintBody": "在这里创建一个任务——比如追踪一只股票、盯住开销，或者关注竞品……",
			"watch.hintDismiss": "关闭实时组件建议",
			"watch.next": "下次更新 {time}",
			"watch.refresh": "获取最新更新",
			"watch.refreshPrompt": "现在帮我查一下「{topic}」的最新进展，有值得留意的就投一条今日卡。",
			"watch.edit": "编辑组件",
			"watch.editPrompt": "我想修改「{topic}」这个追踪组件，可以帮我更新吗？",
			"watch.delete": "删除组件",
			"watch.deleteConfirm": "确认删除",
			"watch.deleting": "删除中…",
			"feed.adjust": "调整卡片",
			"feed.adjustPlaceholder": "希望这张卡片怎么调整？例如：每天展示，只保留会议名称和时间",
			"feed.adjustSave": "记住",
			"feed.adjustSaved": "已记住，下次生成时生效",
			"feed.cancel": "取消",
			"section.watches": "实时组件",
			"watch.manual": "手动触发",
			"feed.updated.now": "刚刚更新",
			"feed.updated.minutes": "{count} 分钟前更新",
			"feed.updated.today": "今天 {time} 更新",
			"feed.updated.yesterday": "昨天 {time} 更新",
			"feed.updated.date": "{date} 更新",
			"section.routines": "定时任务",
			"events.empty": "今天还没有日程",
			"events.allDay": "全天",
			"events.past": "已过去",
			"events.now": "进行中",
			"events.endsIn": "{count} 分钟后结束",
			"brief.waiting": "你的简报已在这里等候，随时可以查看。",
			"brief.fetch": "获取我的最新简报",
			"brief.fetching": "正在获取你的最新简报…",
			"brief.fetchPrompt": "现在生成我的最新简报，并用 today_post 投到今日页（batchKind 用对应的 morning_brief / evening_brief）。",
			"watch.creating": "正在为你生成{topic}…",
			"tasks.create": "+ 创建任务",
			"tasks.createSchedule": "+ 创建定时任务",
			"tasks.seg.task": "任务",
			"tasks.seg.schedule": "定时任务",
			"tasks.reco.title": "为你推荐",
			"tasks.reco.task.0.title": "先看今天的优先清单",
			"tasks.reco.task.0.desc": "先整理一份今天的清单，看看哪些最值得现在做。",
			"tasks.reco.task.0.prompt": "先整理一份今天的清单，看看哪些最值得现在做。",
			"tasks.reco.task.1.title": "邮件今日速览",
			"tasks.reco.task.1.desc": "把新邮件按需要回复、需要行动、等待结果和仅供了解分好。",
			"tasks.reco.task.1.prompt": "把新邮件按需要回复、需要行动、等待结果和仅供了解分好。",
			"tasks.reco.task.2.title": "待回邮件清单",
			"tasks.reco.task.2.desc": "找出已经读过但仍需要回复、确认或补充材料的邮件。",
			"tasks.reco.task.2.prompt": "找出已经读过但仍需要回复、确认或补充材料的邮件。",
			"tasks.reco.task.3.title": "日程冲突检查",
			"tasks.reco.task.3.desc": "提前找出重叠安排、连续会议和来不及赶路的日程。",
			"tasks.reco.task.3.prompt": "提前找出重叠安排、连续会议和来不及赶路的日程。",
			"tasks.reco.task.4.title": "出门前清单",
			"tasks.reco.task.4.desc": "结合日程和地点，提醒我当天需要带什么。",
			"tasks.reco.task.4.prompt": "结合日程和地点，提醒我当天需要带什么。",
			"tasks.reco.task.5.title": "今日活动灵感",
			"tasks.reco.task.5.desc": "找到今天的空档，推荐一个时间和地点都合适的有趣活动。",
			"tasks.reco.task.5.prompt": "找到今天的空档，推荐一个时间和地点都合适的有趣活动。",
			"tasks.reco.schedule.0.title": "每日优先事项简报",
			"tasks.reco.schedule.0.desc": "每天早上从日程、待办和消息里整理最重要的几件事。",
			"tasks.reco.schedule.0.prompt": "建一个定时任务：每天早上从日程、待办和消息里整理最重要的几件事。",
			"tasks.reco.schedule.1.title": "邮件今日速览",
			"tasks.reco.schedule.1.desc": "每天早上把新邮件按需要回复、需要行动、等待结果分类。",
			"tasks.reco.schedule.1.prompt": "建一个定时任务：每天早上把新邮件按需要回复、需要行动、等待结果分类。",
			"tasks.reco.schedule.2.title": "待回复事项检查",
			"tasks.reco.schedule.2.desc": "定时找出邮件和消息里仍需要回复、确认或补材料的对话。",
			"tasks.reco.schedule.2.prompt": "建一个定时任务：定时找出邮件和消息里仍需要回复、确认或补材料的对话。",
			"tasks.reco.schedule.3.title": "今日会议准备",
			"tasks.reco.schedule.3.desc": "每天早上整理当天重要会议的背景、议程和要确认的问题。",
			"tasks.reco.schedule.3.prompt": "建一个定时任务：每天早上整理当天重要会议的背景、议程和要确认的问题。",
			"tasks.reco.schedule.4.title": "每周项目进展汇总",
			"tasks.reco.schedule.4.desc": "每周整理重点项目的进展、风险、阻塞和下一步。",
			"tasks.reco.schedule.4.prompt": "建一个定时任务：每周整理重点项目的进展、风险、阻塞和下一步。",
			"tasks.reco.schedule.5.title": "截止事项提前检查",
			"tasks.reco.schedule.5.desc": "每周发现未来两周的重要截止项，整理材料、依赖和风险。",
			"tasks.reco.schedule.5.prompt": "建一个定时任务：每周发现未来两周的重要截止项，整理材料、依赖和风险。",
			"tasks.running": "进行中",
			"tasks.done": "已完成",
			"tasks.failed": "失败 / 已终止",
			"tasks.empty.running": "现在没有在跑的任务",
			"tasks.empty.done": "今天还没有完成的任务",
			"tasks.progress": "{progress}",
			"tasks.duration": "已执行 {duration}",
			"tasks.kill": "停止",
			"tasks.openSession": "打开会话",
			"tasks.note": "显示最近活跃会话的后台任务",
			"tasks.waiting": "等待回复",
			"memory.about": "我对你的了解",
			"memory.summary": "摘要",
			"memory.updated": "更新于 {time}",
			"memory.catOther": "未分类",
			"memory.catCount": "{count} 条记忆",
			"memory.aboutEmpty": "米洛还没形成对你的印象 —— 聊着聊着就有了。",
			"memory.all": "全部记忆",
			"memory.search": "搜索记忆…",
			"memory.loading": "正在读取记忆…",
			"memory.missing.title": "这里还没有记忆可显示",
			"memory.missing.body": "装上「鱼的记忆」插件后，它替米洛记下的事会列在这里 —— 长期记得的、慢慢变淡的，都看得见。",
			"memory.empty": "米洛还没有记住任何事 —— 聊着聊着就有了。",
			"memory.noMatch": "没有匹配的记忆",
			"memory.stable": "一直记得",
			"memory.fading": "还记得的事",
			"memory.count": "{count} 条",
			"memory.freshness": "鲜活 {pct}%",
			"diary.empty.title": "还没有日记",
			"diary.empty.body": "做完值得记的事，米洛会写在这里 —— 你也可以在对话里让它「记到今天的日记里」。",
			"diary.entries": "{count} 条",
			"diary.addPlaceholder": "今天值得记下的…",
			"diary.add": "写一条",
			"diary.delete": "删除",
			"diary.author.agent": "米洛",
			"diary.author.me": "我",
			"diary.today": "今天",
			"diary.back": "返回",
			"time.today": "今天 {time}",
			"time.yesterday": "昨天 {time}",
			"error.load": "加载失败了，点这里重试",
			"tv.badge": "今日",
			"tv.untitled": "未命名卡片",
			"tv.posting": "投递中…",
			"tv.posted": "已投递",
			"tv.failed": "投递失败"
		};
		const en = {
			"entry.label": "Today",
			"tab.feed": "Today",
			"tab.tasks": "Tasks",
			"tab.memory": "Memories",
			"tab.diary": "Diary",
			"tab.voice": "Voice",
			"tab.voiceEmpty": "Voice Notes plugin is not installed",
			"greeting.morning": "Morning",
			"greeting.forenoon": "Good morning",
			"greeting.noon": "Good afternoon",
			"greeting.afternoon": "Good afternoon",
			"greeting.evening": "Good evening",
			"greeting.night": "Up late",
			"hero.tagline": "Today {date}",
			"hero.working": "Working: {title}",
			"hero.workingMore": "Working: {title} +{count}",
			"hero.updated": "Updated · {time}",
			"hero.chat": "Chat with Mino",
			"hero.stat.feed": "{count} updates",
			"hero.stat.diary": "{count} diary days",
			"hero.stat.days": "{count} days together",
			"hero.stat.schedule": "{count} routines",
			"section.schedule": "Coming up",
			"section.scheduleAll": "All routines",
			"schedule.empty": "No scheduled tasks yet — say \"remind me every morning…\" in a chat to create one",
			"schedule.status.active": "Active",
			"schedule.status.paused": "Paused",
			"schedule.status.ended": "Ended",
			"schedule.running": "Running",
			"schedule.nextToday": "Today {time}",
			"schedule.nextTomorrow": "Tomorrow {time}",
			"schedule.lastRun": "Last {time}",
			"schedule.pause": "Pause",
			"schedule.resume": "Resume",
			"schedule.every": "Every {interval}",
			"schedule.daily": "Daily {time}",
			"schedule.weekly": "Weekly {time}",
			"schedule.once": "Once",
			"schedule.repeating": "Repeating",
			"schedule.showMore": "{count} more",
			"schedule.showLess": "Show less",
			"section.feed": "Updates",
			"feed.empty.title": "Nothing new yet",
			"feed.empty.body": "Ask Mino to do something — finished work lands here.",
			"feed.group.morning": "Morning",
			"feed.group.afternoon": "Afternoon",
			"feed.group.evening": "Evening",
			"feed.addPlaceholder": "Note to self…",
			"feed.add": "Add",
			"feed.dismiss": "Dismiss",
			"feed.delete": "Delete",
			"feed.pin": "Pin",
			"feed.unpin": "Unpin",
			"feed.up": "Useful",
			"feed.down": "Not useful",
			"feed.notInterested": "Not interested",
			"feed.unread": "Unread",
			"feed.readAll": "Mark all read",
			"feed.openSession": "Open chat",
			"feed.more": "More",
			"feed.confirmDelete": "Delete this card?",
			"feed.end": "All caught up — check back later",
			"feed.window": "Only the last 14 days are shown here",
			"feed.loadingMore": "Loading more",
			"feed.kind.note": "Note",
			"feed.kind.result": "Done",
			"feed.kind.moment": "Heads-up",
			"feed.sent": "Sent to Mino",
			"feed.expand": "Expand",
			"feed.collapse": "Collapse",
			"feed.newBatch": "New",
			"feed.newBatchOf": "New {label}",
			"feed.askAgent": "Ask Mino",
			"feed.askPrompt": "Help me understand this update: {title}",
			"batch.title.morning": "Morning brief",
			"batch.title.evening": "Evening brief",
			"batch.title.diary": "Diary",
			"batch.title.healthBrief": "Health report",
			"batch.title.firstHealth": "First health report",
			"batch.title.weeklyHealth": "Weekly health report",
			"batch.title.welcome": "Welcome",
			"batch.title.featureIntro": "What's new",
			"date.dayHeader": "{month}/{day} · {weekday}",
			"date.weekday.sun": "Sun",
			"date.weekday.mon": "Mon",
			"date.weekday.tue": "Tue",
			"date.weekday.wed": "Wed",
			"date.weekday.thu": "Thu",
			"date.weekday.fri": "Fri",
			"date.weekday.sat": "Sat",
			"schedule.startingSoon": "Starting soon",
			"customize.edit": "Customize",
			"customize.done": "Done",
			"customize.empty": "Nothing to customize yet — install a generator like the morning/evening brief and its preferences will show up here.",
			"watch.add": "Add widget",
			"watch.addPlaceholder": "Something to keep an eye on? A stock, your spending…",
			"watch.addSend": "Create",
			"watch.addPrompt": "Create a live widget that keeps watching \"{topic}\" — use watch_add.",
			"watch.hintTitle": "Want to keep an eye on something?",
			"watch.hintBody": "Create a task here — like tracking a stock, watching costs, or monitoring competitors…",
			"watch.hintDismiss": "Dismiss live widget suggestion",
			"watch.next": "Next update {time}",
			"watch.refresh": "Get latest updates",
			"watch.refreshPrompt": "Check \"{topic}\" for the latest progress right now — post a today card if anything is worth noticing.",
			"watch.edit": "Edit widget",
			"watch.editPrompt": "I want to change the \"{topic}\" watch widget — can you help me update it?",
			"watch.delete": "Delete widget",
			"watch.deleteConfirm": "Confirm delete",
			"watch.deleting": "Deleting…",
			"feed.adjust": "Adjust card",
			"feed.adjustPlaceholder": "How should this card change? e.g. show daily, keep only meeting names and times",
			"feed.adjustSave": "Remember",
			"feed.adjustSaved": "Noted — applies to the next generation",
			"feed.cancel": "Cancel",
			"section.watches": "Live widgets",
			"watch.manual": "Manual",
			"feed.updated.now": "Updated just now",
			"feed.updated.minutes": "Updated {count}m ago",
			"feed.updated.today": "Updated today {time}",
			"feed.updated.yesterday": "Updated yesterday {time}",
			"feed.updated.date": "Updated {date}",
			"section.routines": "Routines",
			"events.empty": "No events today",
			"events.allDay": "All day",
			"events.past": "Past",
			"events.now": "Now",
			"events.endsIn": "ends in {count}m",
			"brief.waiting": "Your brief is waiting here — take a look whenever you’re ready.",
			"brief.fetch": "Get my latest brief",
			"brief.fetching": "Getting your latest brief…",
			"brief.fetchPrompt": "Generate my latest brief now and post it to the today page via today_post (use the matching morning_brief / evening_brief batchKind).",
			"watch.creating": "Creating {topic} for you…",
			"tasks.create": "+ New task",
			"tasks.createSchedule": "+ New routine",
			"tasks.seg.task": "Tasks",
			"tasks.seg.schedule": "Routines",
			"tasks.reco.title": "Recommended for you",
			"tasks.reco.task.0.title": "Today’s priority list",
			"tasks.reco.task.0.desc": "Sort out today’s list and see what’s worth doing right now.",
			"tasks.reco.task.0.prompt": "Sort out today’s list and see what’s worth doing right now.",
			"tasks.reco.task.1.title": "Today’s mail digest",
			"tasks.reco.task.1.desc": "Sort new mail into needs-reply, needs-action, waiting, and FYI.",
			"tasks.reco.task.1.prompt": "Sort new mail into needs-reply, needs-action, waiting, and FYI.",
			"tasks.reco.task.2.title": "Pending replies",
			"tasks.reco.task.2.desc": "Find mail that still needs a reply, confirmation, or extra material.",
			"tasks.reco.task.2.prompt": "Find mail that still needs a reply, confirmation, or extra material.",
			"tasks.reco.task.3.title": "Schedule conflict check",
			"tasks.reco.task.3.desc": "Spot overlapping events, back-to-back meetings, and tight transfers.",
			"tasks.reco.task.3.prompt": "Spot overlapping events, back-to-back meetings, and tight transfers.",
			"tasks.reco.task.4.title": "Before you head out",
			"tasks.reco.task.4.desc": "Remind me what to bring today based on my schedule and places.",
			"tasks.reco.task.4.prompt": "Remind me what to bring today based on my schedule and places.",
			"tasks.reco.task.5.title": "Today’s activity idea",
			"tasks.reco.task.5.desc": "Find a gap today and suggest a well-timed, well-placed activity.",
			"tasks.reco.task.5.prompt": "Find a gap today and suggest a well-timed, well-placed activity.",
			"tasks.reco.schedule.0.title": "Daily priority brief",
			"tasks.reco.schedule.0.desc": "Every morning, pull the most important items from schedule, todos, and messages.",
			"tasks.reco.schedule.0.prompt": "Create a routine: every morning, pull the most important items from schedule, todos, and messages.",
			"tasks.reco.schedule.1.title": "Daily mail digest",
			"tasks.reco.schedule.1.desc": "Every morning, sort new mail into needs-reply, needs-action, and waiting.",
			"tasks.reco.schedule.1.prompt": "Create a routine: every morning, sort new mail into needs-reply, needs-action, and waiting.",
			"tasks.reco.schedule.2.title": "Pending reply check",
			"tasks.reco.schedule.2.desc": "Regularly find mail and chats still needing reply or confirmation.",
			"tasks.reco.schedule.2.prompt": "Create a routine: regularly find mail and chats still needing reply or confirmation.",
			"tasks.reco.schedule.3.title": "Meeting prep",
			"tasks.reco.schedule.3.desc": "Every morning, prep background, agenda, and questions for today’s meetings.",
			"tasks.reco.schedule.3.prompt": "Create a routine: every morning, prep background, agenda, and questions for today’s meetings.",
			"tasks.reco.schedule.4.title": "Weekly project roundup",
			"tasks.reco.schedule.4.desc": "Each week, summarize progress, risks, blockers, and next steps.",
			"tasks.reco.schedule.4.prompt": "Create a routine: each week, summarize progress, risks, blockers, and next steps.",
			"tasks.reco.schedule.5.title": "Deadline early check",
			"tasks.reco.schedule.5.desc": "Each week, surface major deadlines in the next two weeks with material and risks.",
			"tasks.reco.schedule.5.prompt": "Create a routine: each week, surface major deadlines in the next two weeks with material and risks.",
			"tasks.running": "Running",
			"tasks.done": "Completed",
			"tasks.failed": "Failed / killed",
			"tasks.empty.running": "Nothing running right now",
			"tasks.empty.done": "Nothing finished today yet",
			"tasks.progress": "{progress}",
			"tasks.duration": "Ran {duration}",
			"tasks.kill": "Stop",
			"tasks.openSession": "Open chat",
			"tasks.note": "Background jobs of recently active sessions",
			"tasks.waiting": "Waiting for you",
			"memory.about": "What Mino knows about you",
			"memory.summary": "Summary",
			"memory.updated": "Updated {time}",
			"memory.catOther": "Uncategorized",
			"memory.catCount": "{count} memories",
			"memory.aboutEmpty": "No picture of you yet — it forms as you chat.",
			"memory.all": "All memories",
			"memory.search": "Search memories…",
			"memory.loading": "Loading memories…",
			"memory.missing.title": "No memories to show yet",
			"memory.missing.body": "Install the fish-memory plugin and everything it remembers for Mino shows up here.",
			"memory.empty": "Nothing remembered yet — Mino picks things up as you work together.",
			"memory.noMatch": "No matching memories",
			"memory.stable": "Always kept",
			"memory.fading": "Still remembered",
			"memory.count": "{count}",
			"memory.freshness": "{pct}% fresh",
			"diary.empty.title": "No diary yet",
			"diary.empty.body": "Mino writes here when something worth keeping happens — or ask it to \"write this in today's diary\".",
			"diary.entries": "{count}",
			"diary.addPlaceholder": "Worth remembering today…",
			"diary.add": "Write",
			"diary.delete": "Delete",
			"diary.author.agent": "Mino",
			"diary.author.me": "Me",
			"diary.today": "Today",
			"diary.back": "Back",
			"time.today": "Today {time}",
			"time.yesterday": "Yesterday {time}",
			"error.load": "Could not load — click to retry",
			"tv.badge": "Today",
			"tv.untitled": "Untitled card",
			"tv.posting": "Posting…",
			"tv.posted": "Posted",
			"tv.failed": "Post failed"
		};
		// src/client/index.tsx
		const inject = [
			"slots",
			"locale",
			"sessions",
			"jobs",
			"uiWorkspace",
			"layout"
		];
		const NS = "mino-today";
		const PANEL_ID = "today";
		/** 排在会话下面、官方面板前面（Plugins 是 0，Schedule 是 10）。 */
		const PANEL_ORDER = 5;
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
				}), "mino-today: dictionaries");
				const bound = locale.bind(NS);
				t = (key, params) => bound(key, params);
			}
			const sessions = ctx.get("sessions");
			const jobs = ctx.get("jobs");
			const uiWorkspace = ctx.get("uiWorkspace");
			const layout = ctx.get("layout");
			/** 把一句话发进指定会话；没给会话就开一个新的再发。navigate=false 时新会话不抢前台（feed 内嵌生成态用）。 */
			const sendPrompt = async (sessionId, text, options) => {
				if (!sessions) return false;
				try {
					let target = sessionId;
					if (!target) {
						target = await sessions.create();
						if (options?.navigate !== false) uiWorkspace?.openSession(target);
					}
					await sessions.using(target, { source: "minoToday" }, async (reference) => {
						const session = reference.binding.session;
						const handle = session.beginSubmission({
							mode: "queue",
							text,
							attachments: []
						});
						if (!(await session.prompt([{
							type: "text",
							text
						}], "queue", void 0, handle.requestId))?.ok) throw new Error("prompt rejected");
					});
					return true;
				} catch {
					return false;
				}
			};
			const actions = {
				openSession: (sessionId) => {
					if (sessionId) uiWorkspace?.openSession(sessionId);
				},
				sendPrompt,
				newChat: async () => {
					if (!sessions) return;
					const id = await sessions.create().catch(() => void 0);
					if (id) uiWorkspace?.openSession(id);
				},
				watchJobs: (sessionId) => jobs?.watchRows(sessionId) ?? (() => {}),
				killJob: (sessionId, jobId) => jobs ? jobs.kill(sessionId, jobId).then((r) => !!r?.ok).catch(() => false) : Promise.resolve(false),
				openSchedules: () => layout?.selectPanel("schedules"),
				refreshSessions: () => {
					sessions?.refresh().catch(() => {});
				}
			};
			ctx.effect(() => slots.inject("sidebar.panellist", () => slots.register({
				name: "sidebar.panellist",
				id: PANEL_ID,
				order: PANEL_ORDER,
				locale: NS,
				label: () => t("entry.label")
			}, PanelIcon)));
			ctx.effect(() => slots.inject("main", () => slots.register({
				name: "main",
				key: PANEL_ID,
				locale: NS,
				children: {
					"today.page.voice": {
						kind: "list",
						scope: "root"
					},
					"today.page.customize": {
						kind: "list",
						scope: "root"
					}
				},
				inject: () => ({
					t,
					actions,
					hooks: {
						...sessions ? { sessionList: sessions.list } : {},
						...jobs ? { jobs: jobs.state } : {}
					}
				})
			}, TodayPage)));
			ctx.effect(() => slots.inject("tool.call.toolview", () => slots.register({
				name: "tool.call.toolview",
				key: "today_post",
				locale: NS,
				inject: () => ({ t })
			}, TodayPostRow)));
		}
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map