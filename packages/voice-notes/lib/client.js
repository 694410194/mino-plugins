window.__ModuleLoader__.load({
	id: "mino-voice-notes",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
		let react_jsx_runtime = require("react/jsx-runtime");
		// src/client/api.ts
		async function post(path, body) {
			const res = await fetch(path, {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify(body)
			});
			const data = await res.json().catch(() => ({}));
			if (!res.ok) throw new Error(String(data.error ?? res.status));
			return data;
		}
		async function listNotes() {
			return (await (await fetch("/mino-voice-notes/api/list", { cache: "no-store" })).json()).notes ?? [];
		}
		const startNote = (title) => post("/mino-voice-notes/api/start", title ? { title } : {});
		const stopNote = (id) => post("/mino-voice-notes/api/stop", { id });
		const getNote = async (id) => {
			const res = await fetch(`/mino-voice-notes/api/note?id=${encodeURIComponent(id)}`, { cache: "no-store" });
			if (!res.ok) return void 0;
			return (await res.json()).note;
		};
		const shareNote = (id) => post("/mino-voice-notes/api/share", { id });
		const deleteNote = (id) => post("/mino-voice-notes/api/delete", { id });
		const uploadSegment = (id, seq, wavBase64, durationMs) => post("/mino-voice-notes/api/segment", {
			id,
			seq,
			audio: wavBase64,
			durationMs
		});
		// src/client/recorder.ts
		/** 录音引擎：getUserMedia → AudioContext(16kHz mono) → ScriptProcessor → PCM16 →
		* WAV 编码，每 SEGMENT_MS 冲一段回调上传。官方 voice-input 同路径（16kHz mono PCM16 WAV），
		* 但用 ScriptProcessorNode（AudioWorklet 内联 worker 在 tsdown 单文件包里要多绕一层）。
		*/
		const SAMPLE_RATE = 16e3;
		const CHANNELS = 1;
		const SEGMENT_MS = 15e3;
		const BUFFER_SIZE = 4096;
		/** PCM16 WAV 封装（RIFF 头 + interleaved s16le）。 */
		function encodeWav(chunks, totalSamples, sampleRate = SAMPLE_RATE) {
			const pcm = new Int16Array(totalSamples);
			let off = 0;
			for (const chunk of chunks) {
				for (let i = 0; i < chunk.length && off + i < totalSamples; i++) {
					const s = Math.max(-1, Math.min(1, chunk[i]));
					pcm[off + i] = s < 0 ? s * 32768 : s * 32767;
				}
				off += chunk.length;
			}
			const buf = /* @__PURE__ */ new ArrayBuffer(44 + totalSamples * 2);
			const v = new DataView(buf);
			const wstr = (o, s) => {
				for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i));
			};
			wstr(0, "RIFF");
			v.setUint32(4, 36 + totalSamples * 2, true);
			wstr(8, "WAVE");
			wstr(12, "fmt ");
			v.setUint32(16, 16, true);
			v.setUint16(20, 1, true);
			v.setUint16(22, CHANNELS, true);
			v.setUint32(24, sampleRate, true);
			v.setUint32(28, sampleRate * CHANNELS * 2, true);
			v.setUint16(32, 2, true);
			v.setUint16(34, 16, true);
			wstr(36, "data");
			v.setUint32(40, totalSamples * 2, true);
			new Int16Array(buf, 44).set(pcm);
			return buf;
		}
		function wavToBase64(buf) {
			const bytes = new Uint8Array(buf);
			let bin = "";
			const CHUNK = 32768;
			for (let i = 0; i < bytes.length; i += CHUNK) bin += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
			return btoa(bin);
		}
		async function startRecording(onSegment) {
			const stream = await navigator.mediaDevices.getUserMedia({ audio: {
				channelCount: 1,
				sampleRate: SAMPLE_RATE,
				echoCancellation: true,
				noiseSuppression: true
			} });
			const ctx = new AudioContext({ sampleRate: SAMPLE_RATE });
			const source = ctx.createMediaStreamSource(stream);
			const proc = ctx.createScriptProcessor(BUFFER_SIZE, CHANNELS, CHANNELS);
			let chunks = [];
			let samples = 0;
			let segmentStart = performance.now();
			let flushed = false;
			const startedAt = performance.now();
			const flush = async () => {
				if (!samples) return;
				const wav = encodeWav(chunks, samples, ctx.sampleRate);
				const ms = Math.round(performance.now() - segmentStart);
				chunks = [];
				samples = 0;
				segmentStart = performance.now();
				await onSegment(wav, ms);
			};
			proc.onaudioprocess = (e) => {
				if (flushed) return;
				const input = e.inputBuffer.getChannelData(0);
				chunks.push(new Float32Array(input));
				samples += input.length;
				if (performance.now() - segmentStart >= SEGMENT_MS) flush();
			};
			source.connect(proc);
			proc.connect(ctx.destination);
			return {
				seconds: () => (performance.now() - startedAt) / 1e3,
				stop: async () => {
					flushed = true;
					proc.onaudioprocess = null;
					await flush();
				},
				dispose: () => {
					flushed = true;
					proc.onaudioprocess = null;
					try {
						proc.disconnect();
					} catch {}
					try {
						source.disconnect();
					} catch {}
					for (const track of stream.getTracks()) track.stop();
					ctx.close().catch(() => {});
				}
			};
		}
		// \0dsh-css:D:\Projects\mino\mino-plugins\packages\voice-notes\src\client\vnotes.module.css.mjs
		const css = "._2zw8gq_page{--vn-ink:#3c3b41;--vn-ink-2:#343451bf;--vn-ink-3:#34345173;--vn-ink-fill:#34345114;--vn-ink-fill-2:#3434510a;--vn-accent:#008aff;--vn-accent-soft:#008aff1a;--vn-accent-ink:#0071dd;--vn-glass-bg:#fffc;--vn-glass-border:#0000001a;--vn-glass-shadow:-4px 8px 28px #6868680a, 0 2px 8px #6464640f;height:100%;color:var(--vn-ink);flex-direction:column;gap:10px;padding:8px 0;display:flex;overflow:hidden}body[data-ds-dark-theme] ._2zw8gq_page{--vn-ink:#e8e8ec;--vn-ink-2:#e8e8ecad;--vn-ink-3:#e8e8ec6b;--vn-ink-fill:#ffffff14;--vn-ink-fill-2:#ffffff0a;--vn-accent:#38bdf8;--vn-accent-soft:#38bdf824;--vn-accent-ink:#66b8ff;--vn-glass-bg:#ffffff12;--vn-glass-border:#ffffff14;--vn-glass-shadow:-4px 8px 28px #0003, 0 2px 8px #00000026}._2zw8gq_head{align-items:center;gap:10px;display:flex}._2zw8gq_btn{background:var(--vn-ink);color:#fff;cursor:pointer;border:none;border-radius:999px;padding:8px 18px;font-size:13px;font-weight:500;transition:opacity .14s}._2zw8gq_btn:hover{opacity:.85}body[data-ds-dark-theme] ._2zw8gq_btn{color:#1a1a1c}._2zw8gq_btnStop{color:#fff;background:#e5484d}._2zw8gq_miniButton{border:.5px solid var(--vn-glass-border);cursor:pointer;color:var(--vn-ink-2);background:0 0;border-radius:999px;padding:6px 12px;font-size:12px}._2zw8gq_miniButton:hover{color:var(--vn-accent-ink);border-color:var(--vn-accent);background:var(--vn-accent-soft)}._2zw8gq_danger{color:#e5484d}._2zw8gq_danger:hover{color:#e5484d;background:#e5484d14;border-color:#e5484d}._2zw8gq_error{color:#e5484d;font-size:12px}._2zw8gq_share{background:var(--vn-ink-fill-2);color:var(--vn-ink-2);border-radius:10px;padding:8px 12px;font-size:12px}._2zw8gq_share a{color:var(--vn-accent-ink)}._2zw8gq_body{flex:1;gap:14px;min-height:0;display:flex}._2zw8gq_list{flex-direction:column;flex-shrink:0;gap:4px;width:300px;display:flex;overflow-y:auto}._2zw8gq_empty{color:var(--vn-ink-3);text-align:center;padding:28px 14px;font-size:13px}._2zw8gq_groupHead{letter-spacing:.3px;color:var(--vn-ink-3);padding:10px 14px 4px;font-size:11px;font-weight:500}._2zw8gq_row{cursor:pointer;border:.5px solid #0000;border-radius:12px;padding:10px 14px}._2zw8gq_row:hover{background:var(--vn-ink-fill-2)}._2zw8gq_rowActive{border-color:var(--vn-accent);background:var(--vn-accent-soft)}._2zw8gq_rowTitle{color:var(--vn-ink);text-overflow:ellipsis;white-space:nowrap;font-size:13px;font-weight:500;overflow:hidden}._2zw8gq_rowMeta{color:var(--vn-ink-3);align-items:center;gap:8px;margin-top:4px;font-size:11px;display:flex}._2zw8gq_badge{border-radius:999px;padding:3px 7px;font-size:10px;line-height:1}._2zw8gq_st_recording{color:#e5484d;background:#e5484d21}._2zw8gq_st_transcribing{color:#8a5d00;background:#ffc53d4d}._2zw8gq_st_ready{color:#30a46c;background:#30a46c26}._2zw8gq_st_failed{background:var(--vn-ink-fill);color:var(--vn-ink-3)}._2zw8gq_detail{border:.5px solid var(--vn-glass-border);background:var(--vn-glass-bg);box-shadow:var(--vn-glass-shadow);-webkit-backdrop-filter:blur(24px)saturate(1.2);border-radius:16px;flex:1;padding:16px 18px;overflow-y:auto}._2zw8gq_detailHead{justify-content:space-between;align-items:center;gap:10px;display:flex}._2zw8gq_detailHead>div{flex:none;gap:8px;display:flex}._2zw8gq_detailHead h2{color:var(--vn-ink);margin:0;font-size:15px;font-weight:500}._2zw8gq_detail h3{color:var(--vn-ink-3);margin:16px 0 6px;font-size:12px;font-weight:500}._2zw8gq_pre{white-space:pre-wrap;color:var(--vn-ink-2);background:var(--vn-ink-fill-2);border-radius:12px;max-height:300px;margin:0;padding:10px 12px;font-size:13px;line-height:1.7;overflow-y:auto}._2zw8gq_audio{width:100%;height:32px;margin-bottom:6px;display:block}@media (width<=640px){._2zw8gq_body{flex-direction:column;overflow-y:auto}._2zw8gq_list{flex-shrink:0;width:100%;max-height:40%}}";
		const tagId = "mino-voice-notes/vnotes.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "mino-voice-notes";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var vnotes_module_css_default = {
			"audio": "_2zw8gq_audio",
			"error": "_2zw8gq_error",
			"badge": "_2zw8gq_badge",
			"rowTitle": "_2zw8gq_rowTitle",
			"miniButton": "_2zw8gq_miniButton",
			"detailHead": "_2zw8gq_detailHead",
			"st_ready": "_2zw8gq_st_ready",
			"pre": "_2zw8gq_pre",
			"btn": "_2zw8gq_btn",
			"groupHead": "_2zw8gq_groupHead",
			"row": "_2zw8gq_row",
			"st_transcribing": "_2zw8gq_st_transcribing",
			"list": "_2zw8gq_list",
			"head": "_2zw8gq_head",
			"st_failed": "_2zw8gq_st_failed",
			"danger": "_2zw8gq_danger",
			"body": "_2zw8gq_body",
			"rowMeta": "_2zw8gq_rowMeta",
			"rowActive": "_2zw8gq_rowActive",
			"st_recording": "_2zw8gq_st_recording",
			"detail": "_2zw8gq_detail",
			"btnStop": "_2zw8gq_btnStop",
			"share": "_2zw8gq_share",
			"page": "_2zw8gq_page",
			"empty": "_2zw8gq_empty"
		};
		// src/client/VNotesPage.tsx
		/** 「语音笔记」main 页：录音控制 + 笔记列表 + 详情（转写/纪要/分享）。 */
		function VNotesPage({ t }) {
			const [notes, setNotes] = (0, react.useState)([]);
			const [selected, setSelected] = (0, react.useState)();
			const [recording, setRecording] = (0, react.useState)();
			const [error, setError] = (0, react.useState)();
			const [sharePath, setSharePath] = (0, react.useState)();
			const recorderRef = (0, react.useRef)();
			const seqRef = (0, react.useRef)(0);
			const timerRef = (0, react.useRef)();
			const refresh = (0, react.useCallback)(async () => {
				try {
					const list = await listNotes();
					setNotes(list);
					if (selected) setSelected(list.find((n) => n.id === selected.id) ?? selected);
				} catch {}
			}, [selected]);
			(0, react.useEffect)(() => {
				refresh();
				const poll = setInterval(() => void refresh(), 4e3);
				return () => clearInterval(poll);
			}, []);
			const begin = async () => {
				setError(void 0);
				try {
					const { id } = await startNote();
					seqRef.current = 0;
					const rec = await startRecording(async (wav, ms) => {
						const seq = seqRef.current++;
						await uploadSegment(id, seq, wavToBase64(wav), ms);
					});
					recorderRef.current = rec;
					setRecording({
						id,
						seconds: 0
					});
					timerRef.current = setInterval(() => {
						setRecording((r) => r ? {
							...r,
							seconds: rec.seconds()
						} : r);
					}, 500);
					refresh();
				} catch {
					setError(t("record.micDenied"));
				}
			};
			const finish = async () => {
				if (!recording) return;
				clearInterval(timerRef.current);
				try {
					await recorderRef.current?.stop();
					recorderRef.current?.dispose();
					recorderRef.current = void 0;
					await stopNote(recording.id);
				} catch {}
				setRecording(void 0);
				refresh();
			};
			const share = async (id) => {
				try {
					const data = await shareNote(id);
					if (data.path) {
						setSharePath(data.path);
						try {
							await navigator.clipboard.writeText(location.origin + data.path);
						} catch {}
					}
				} catch {}
			};
			const remove = async (id) => {
				try {
					await deleteNote(id);
				} catch {}
				if (selected?.id === id) setSelected(void 0);
				refresh();
			};
			const statusLabel = (s) => t(`list.status.${s}`);
			const grouped = (0, react.useMemo)(() => {
				const dayStart = (iso) => {
					const d = new Date(iso);
					return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
				};
				const today = dayStart((/* @__PURE__ */ new Date()).toISOString());
				const buckets = [
					{
						key: "group.today",
						items: []
					},
					{
						key: "group.yesterday",
						items: []
					},
					{
						key: "group.earlier",
						items: []
					}
				];
				for (const n of notes) {
					const d = dayStart(n.createdAt);
					buckets[d >= today ? 0 : d >= today - 864e5 ? 1 : 2].items.push(n);
				}
				return buckets.filter((b) => b.items.length > 0);
			}, [notes]);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: vnotes_module_css_default.page,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: vnotes_module_css_default.head,
						children: [recording ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
							className: `${vnotes_module_css_default.btn} ${vnotes_module_css_default.btnStop}`,
							onClick: () => void finish(),
							children: [
								"● ",
								t("record.recording"),
								" ",
								Math.floor(recording.seconds / 60),
								":",
								String(Math.floor(recording.seconds % 60)).padStart(2, "0"),
								" — ",
								t("record.stop")
							]
						}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							className: vnotes_module_css_default.btn,
							onClick: () => void begin(),
							children: t("record.start")
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							className: vnotes_module_css_default.miniButton,
							onClick: () => void refresh(),
							children: t("action.refresh")
						})]
					}),
					error && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: vnotes_module_css_default.error,
						children: error
					}),
					sharePath && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: vnotes_module_css_default.share,
						children: [
							t("share.path"),
							": ",
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("a", {
								href: sharePath,
								target: "_blank",
								rel: "noreferrer",
								children: sharePath
							}),
							" · ",
							t("share.copied")
						]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: vnotes_module_css_default.body,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: vnotes_module_css_default.list,
							children: [notes.length === 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: vnotes_module_css_default.empty,
								children: t("list.empty")
							}), grouped.map((g) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: vnotes_module_css_default.group,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									className: vnotes_module_css_default.groupHead,
									children: t(g.key)
								}), g.items.map((n) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: `${vnotes_module_css_default.row} ${selected?.id === n.id ? vnotes_module_css_default.rowActive : ""}`,
									onClick: () => {
										setSelected(n);
										getNote(n.id).then((d) => d && setSelected(d));
									},
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
										className: vnotes_module_css_default.rowTitle,
										children: n.title
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										className: vnotes_module_css_default.rowMeta,
										children: [
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
												className: `${vnotes_module_css_default.badge} ${vnotes_module_css_default[`st_${n.status}`]}`,
												children: statusLabel(n.status)
											}),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: n.createdAt.slice(0, 16).replace("T", " ") }),
											n.audioSeconds !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [n.audioSeconds.toFixed(0), "s"] })
										]
									})]
								}, n.id))]
							}, g.key))]
						}), selected && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: vnotes_module_css_default.detail,
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: vnotes_module_css_default.detailHead,
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", { children: selected.title }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										className: vnotes_module_css_default.miniButton,
										onClick: () => void share(selected.id),
										children: t("action.share")
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										className: `${vnotes_module_css_default.miniButton} ${vnotes_module_css_default.danger}`,
										onClick: () => void remove(selected.id),
										children: t("action.delete")
									})] })]
								}),
								selected.error && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									className: vnotes_module_css_default.error,
									children: selected.error
								}),
								selected.summary && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", { children: t("detail.summary") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("pre", {
									className: vnotes_module_css_default.pre,
									children: selected.summary
								})] }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", { children: t("detail.transcript") }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("pre", {
									className: vnotes_module_css_default.pre,
									children: selected.transcript || t("detail.noTranscript")
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("h3", { children: [
									t("detail.audio"),
									"（",
									selected.segments,
									"）"
								] }),
								Array.from({ length: selected.segments }, (_, i) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("audio", {
									controls: true,
									preload: "none",
									src: `/mino-voice-notes/api/audio?id=${selected.id}&seq=${i}`,
									className: vnotes_module_css_default.audio
								}, i))
							]
						})]
					})
				]
			});
		}
		// src/client/locales.ts
		const zh = {
			"entry.label": "语音笔记",
			"page.title": "语音笔记",
			"record.start": "开始录音",
			"record.stop": "结束并转写",
			"record.recording": "录音中",
			"record.micDenied": "麦克风不可用——检查浏览器授权",
			"list.empty": "还没有语音笔记。点「开始录音」录第一段。",
			"list.status.recording": "录制中",
			"list.status.transcribing": "转写中",
			"list.status.ready": "已完成",
			"list.status.failed": "失败",
			"detail.transcript": "转写",
			"detail.summary": "纪要",
			"detail.audio": "音频分段",
			"detail.noTranscript": "（暂无）",
			"action.share": "分享",
			"action.delete": "删除",
			"action.refresh": "刷新",
			"share.copied": "链接已复制",
			"share.path": "分享页",
			"group.today": "今天",
			"group.yesterday": "昨天",
			"group.earlier": "更早"
		};
		const en = {
			"entry.label": "Voice Notes",
			"page.title": "Voice Notes",
			"record.start": "Start recording",
			"record.stop": "Stop & transcribe",
			"record.recording": "Recording",
			"record.micDenied": "Microphone unavailable — check browser permission",
			"list.empty": "No voice notes yet. Hit \"Start recording\" for the first one.",
			"list.status.recording": "Recording",
			"list.status.transcribing": "Transcribing",
			"list.status.ready": "Ready",
			"list.status.failed": "Failed",
			"detail.transcript": "Transcript",
			"detail.summary": "Summary",
			"detail.audio": "Audio segments",
			"detail.noTranscript": "(none yet)",
			"action.share": "Share",
			"action.delete": "Delete",
			"action.refresh": "Refresh",
			"share.copied": "Link copied",
			"share.path": "Share page",
			"group.today": "Today",
			"group.yesterday": "Yesterday",
			"group.earlier": "Earlier"
		};
		// src/client/index.tsx
		const inject = ["slots", "locale"];
		const NS = "mino-voice-notes";
		const SEAT = "today.page.voice";
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
				}), "mino-voice-notes: dictionaries");
				const bound = locale.bind(NS);
				t = (key, params) => bound(key, params);
			}
			ctx.effect(() => slots.inject(SEAT, () => slots.register({
				name: SEAT,
				id: "mino-voice-notes",
				locale: NS,
				inject: () => ({ t })
			}, VNotesPage)));
		}
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map