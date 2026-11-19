import { mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
// src/store.ts
/**
* mino-today 的自有存储：`$DSH_HOME/mino-today/store.json`。
* 只有自己的动态卡片和日记——定时任务实时从宿主 schedule 服务读，
* 记忆由 fish-memory 自己的 /dsh-fish-memory/list 提供（客户端直取，不经手）。
*/
/** 存留的动态卡片上限；先丢最旧的已划掉卡片，再丢最旧的。 */
const MAX_ITEMS = 200;
/** 单篇日记的条数上限（防 runaway）。 */
const MAX_DIARY_ENTRIES = 200;
const STORE_DIR = join(process.env.DSH_HOME || join(homedir(), ".mino"), "mino-today");
const STORE_FILE = join(STORE_DIR, "store.json");
function emptyStore() {
	return {
		items: [],
		diaries: {},
		watches: []
	};
}
function loadStore() {
	try {
		const raw = JSON.parse(readFileSync(STORE_FILE, "utf8"));
		const store = emptyStore();
		if (Array.isArray(raw?.items)) store.items = raw.items;
		if (raw && typeof raw.diaries === "object" && raw.diaries !== null) store.diaries = raw.diaries;
		if (Array.isArray(raw?.watches)) store.watches = raw.watches;
		return store;
	} catch {
		return emptyStore();
	}
}
function saveStore(store) {
	mkdirSync(dirname(STORE_FILE), { recursive: true });
	const tmp = STORE_FILE + ".tmp";
	writeFileSync(tmp, JSON.stringify(store));
	renameSync(tmp, STORE_FILE);
}
/** 本地日期键 YYYY-MM-DD（日记按本地日子归档）。 */
function dayKey(date) {
	return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
const DAY_KEY_RE = /^\d{4}-\d{2}-\d{2}$/;
/** 加一张动态卡片，返回它的 id。 */
function addItem(store, item) {
	const full = {
		id: "td" + Date.now().toString(36) + Math.floor(Math.random() * 1e4).toString(36),
		at: item.at ?? (/* @__PURE__ */ new Date()).toISOString(),
		kind: item.kind,
		title: item.title
	};
	if (item.body) full.body = item.body;
	if (item.sessionId) full.sessionId = item.sessionId;
	if (item.source) full.source = item.source;
	if (item.batchId) full.batchId = item.batchId;
	if (item.batchKind) full.batchKind = item.batchKind;
	if (item.suggestions?.length) full.suggestions = item.suggestions;
	if (item.card) full.card = item.card;
	store.items.push(full);
	if (store.items.length > MAX_ITEMS) {
		const dismissed = store.items.filter((i) => i.dismissed);
		const kept = store.items.filter((i) => !i.dismissed);
		const overflow = store.items.length - MAX_ITEMS;
		store.items = dismissed.length >= overflow ? [...dismissed.slice(overflow), ...kept] : kept.slice(-200);
	}
	return full;
}
/** 往某天的日记追加一条。date 缺省/非法时归今天。 */
function addDiaryEntry(store, date, text, sessionId) {
	const key = date && DAY_KEY_RE.test(date) ? date : dayKey(/* @__PURE__ */ new Date());
	const diary = store.diaries[key] ?? {
		entries: [],
		updatedAt: ""
	};
	const entry = {
		at: (/* @__PURE__ */ new Date()).toISOString(),
		text
	};
	if (sessionId) entry.sessionId = sessionId;
	diary.entries.push(entry);
	if (diary.entries.length > MAX_DIARY_ENTRIES) diary.entries = diary.entries.slice(-200);
	diary.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
	store.diaries[key] = diary;
	return {
		date: key,
		entry
	};
}
/** 删掉某天日记里的一条（按 at 精确匹配）。 */
function deleteDiaryEntry(store, date, at) {
	const diary = store.diaries[date];
	if (!diary) return false;
	const before = diary.entries.length;
	diary.entries = diary.entries.filter((e) => e.at !== at);
	if (diary.entries.length === before) return false;
	if (diary.entries.length === 0) delete store.diaries[date];
	else diary.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
	return true;
}
/** 登记一条「关注」追踪，返回它的 id。 */
function addWatch(store, watch) {
	const full = {
		id: "wt" + Date.now().toString(36) + Math.floor(Math.random() * 1e4).toString(36),
		at: (/* @__PURE__ */ new Date()).toISOString(),
		...watch
	};
	store.watches.push(full);
	return full;
}
/** 按 id 摘一条 watch（返回被摘的，方便拿 scheduleId 去删宿主条目）。 */
function removeWatch(store, id) {
	const idx = store.watches.findIndex((w) => w.id === id);
	if (idx < 0) return void 0;
	return store.watches.splice(idx, 1)[0];
}
// src/index.ts
const name = "mino-today";
const inject = ["webServer", "tools"];
const JSON_HEADERS = {
	"content-type": "application/json; charset=utf-8",
	"cache-control": "no-store"
};
const MAX_TITLE = 120;
const MAX_BODY = 4e3;
const MAX_DIARY_TEXT = 4e3;
const MAX_SOURCE = 40;
const MAX_SUGGESTIONS = 4;
const MAX_SUGGESTION_LABEL = 40;
const MAX_SUGGESTION_PROMPT = 400;
const MAX_BATCH = 24;
const MAX_WATCH_TOPIC = 60;
const MAX_WATCH_PROMPT = 600;
const WATCH_TIME_RE = /^\d{2}:\d{2}(:\d{2})?$/;
const FEEDBACK_SIGNALS = /* @__PURE__ */ new Set([
	"up",
	"down",
	"not_interested"
]);
function sendJson(res, status, body) {
	res.writeHead(status, JSON_HEADERS);
	res.end(JSON.stringify(body));
}
async function readBody(req) {
	let raw = "";
	for await (const chunk of req) raw += String(chunk);
	if (!raw) return {};
	try {
		const parsed = JSON.parse(raw);
		return parsed && typeof parsed === "object" ? parsed : {};
	} catch {
		return {};
	}
}
/** 从工具执行上下文取会话 id（来源字段以宿主为准，取空容忍）。 */
function sessionIdFromExec(exec) {
	try {
		const a = exec?.agent ?? exec?.caller ?? exec?.agentRef;
		if (a && typeof a === "object") {
			const session = a.session;
			if (session && typeof session === "object") {
				const sid = session.id;
				if (typeof sid === "string" && sid) return sid;
			}
			for (const key of ["sessionId", "id"]) {
				const v = a[key];
				if (typeof v === "string" && v) return v;
			}
		}
	} catch {}
	return "";
}
function clip(text, max) {
	return text.length > max ? text.slice(0, max) : text;
}
/** 把模型给的 suggestions 参数钳成 Suggestion[]（超长裁剪，非法条目丢弃）。 */
function clipSuggestions(input) {
	if (!Array.isArray(input)) return void 0;
	const out = [];
	for (const raw of input) {
		if (out.length >= MAX_SUGGESTIONS) break;
		if (!raw || typeof raw !== "object") continue;
		const label = String(raw.label || "").trim();
		const prompt = String(raw.prompt || "").trim();
		if (!label || !prompt) continue;
		out.push({
			label: clip(label, MAX_SUGGESTION_LABEL),
			prompt: clip(prompt, MAX_SUGGESTION_PROMPT)
		});
	}
	return out.length ? out : void 0;
}
/** 把模型给的 card 参数钳成 FeedCard（非法形状整个丢弃，不存半残结构）。 */
function clipCard(input) {
	if (!input || typeof input !== "object") return void 0;
	const c = input;
	switch (String(c.type)) {
		case "list": {
			const items = Array.isArray(c.items) ? c.items.map((i) => clip(String(i).trim(), 80)).filter(Boolean).slice(0, 8) : [];
			return items.length ? {
				type: "list",
				items
			} : void 0;
		}
		case "metric": {
			const value = String(c.value || "").trim();
			if (!value) return void 0;
			const out = {
				type: "metric",
				value: clip(value, 40)
			};
			if (c.unit) out.unit = clip(String(c.unit).trim(), 20);
			if (c.delta) out.delta = clip(String(c.delta).trim(), 40);
			return out;
		}
		case "progress": {
			const done = Number(c.done);
			const total = Number(c.total);
			if (!Number.isFinite(done) || !Number.isFinite(total) || total <= 0) return void 0;
			const out = {
				type: "progress",
				done: Math.max(0, Math.min(done, total)),
				total
			};
			if (c.label) out.label = clip(String(c.label).trim(), 60);
			return out;
		}
	}
}
const KINDS = /* @__PURE__ */ new Set([
	"note",
	"result",
	"moment"
]);
/** 生成批次的语义类别（Today 批次 kind 表同款）；未列入的按普通标签处理。 */
const BATCH_KINDS = /* @__PURE__ */ new Set([
	"morning_brief",
	"evening_brief",
	"diary",
	"health_brief",
	"first_health_report",
	"weekly_health_report",
	"welcome",
	"feature_intro"
]);
/** 宿主 schedule 服务（可选，缺席时相关能力降级）。 */
function scheduleOf(ctx) {
	try {
		return ctx.get("schedule");
	} catch {
		return;
	}
}
function makeTools(ctx) {
	return [
		{
			name: "today_post",
			description: "把一条动态投到用户的「今日」页面（侧边栏「今日」图标）。什么时候用：完成了一件值得让她看到结果的事（比如做完了报表、搭好了网页）、发现了值得她留意的事、或者她让你「记到今日页」。日常闲聊不要投。投了就别在回复里再重复一遍。",
			parameters: {
				type: "object",
				additionalProperties: false,
				required: ["title"],
				properties: {
					title: {
						type: "string",
						description: "一句话标题，说明发生了什么（≤120字）。"
					},
					body: {
						type: "string",
						description: "可选。展开内容：结果摘要、文件位置、下一步建议。"
					},
					kind: {
						type: "string",
						enum: [
							"note",
							"result",
							"moment"
						],
						description: "note=随手记；result=做完的事交付；moment=值得留意。默认 note。"
					},
					source: {
						type: "string",
						description: "可选。这条动态来自哪（≤40字的小标签），比如「会话」「定时任务」「日报」。"
					},
					batch: {
						type: "string",
						description: "可选。批次标签（≤24字）——同一批产出的卡片传同一个标签（如「早报」「晚报」），feed 里会并成一组。散件别传。"
					},
					batchKind: {
						type: "string",
						enum: [
							"morning_brief",
							"evening_brief",
							"diary",
							"health_brief",
							"first_health_report",
							"weekly_health_report",
							"welcome",
							"feature_intro"
						],
						description: "可选。这一批的语义类别——早报用 morning_brief、晚报用 evening_brief、日记用 diary。传了 feed 批次头会显示对应的正式标题，不是简报类批次别传。"
					},
					card: {
						type: "object",
						additionalProperties: false,
						description: "可选。结构化卡体，标题正文不够用时再传：list（清单：{type,items:[]≤8条}）、metric（指标：{type,value,unit?,delta?}）、progress（进度：{type,done,total,label?}）。普通文字动态不要传。",
						properties: {
							type: {
								type: "string",
								enum: [
									"list",
									"metric",
									"progress"
								]
							},
							items: {
								type: "array",
								items: { type: "string" },
								description: "list 用：条目，每条≤80字。"
							},
							value: {
								type: "string",
								description: "metric 用：数值文字（≤40字）。"
							},
							unit: {
								type: "string",
								description: "metric 用：单位（≤20字）。"
							},
							delta: {
								type: "string",
								description: "metric 用：变化量说明（≤40字），如「+3 封」。"
							},
							done: {
								type: "number",
								description: "progress 用：已完成数。"
							},
							total: {
								type: "number",
								description: "progress 用：总数（>0）。"
							},
							label: {
								type: "string",
								description: "progress 用：进度说明（≤60字）。"
							}
						}
					},
					suggestions: {
						type: "array",
						description: "可选。卡片底部的建议按钮（≤4个）：她点一下就把 prompt 发回来找你。比如「展开说说」→展开讲。",
						items: {
							type: "object",
							additionalProperties: false,
							required: ["label", "prompt"],
							properties: {
								label: {
									type: "string",
									description: "按钮文字（≤40字）。"
								},
								prompt: {
									type: "string",
									description: "点按钮后发给你的话（≤400字）。"
								}
							}
						}
					}
				}
			},
			output: {
				schema: {
					type: "object",
					additionalProperties: false,
					properties: {
						ok: { type: "boolean" },
						message: { type: "string" },
						id: { type: "string" }
					}
				},
				render: (_args, value) => {
					return [{
						type: "text",
						text: value?.ok !== false ? "✓ 已投到今日页" : "✗ " + String(value?.message || "没投成")
					}];
				}
			},
			async execute(args, exec) {
				const title = String(args?.title || "").trim();
				if (!title) return {
					ok: false,
					message: "标题是空的"
				};
				const store = loadStore();
				const item = addItem(store, {
					kind: KINDS.has(String(args?.kind)) ? args.kind : "note",
					title: clip(title, MAX_TITLE),
					body: args?.body ? clip(String(args.body).trim(), MAX_BODY) : void 0,
					sessionId: sessionIdFromExec(exec) || void 0,
					source: args?.source ? clip(String(args.source).trim(), MAX_SOURCE) : void 0,
					batchId: args?.batch ? clip(String(args.batch).trim(), MAX_BATCH) : void 0,
					batchKind: BATCH_KINDS.has(String(args?.batchKind)) ? String(args.batchKind) : void 0,
					card: clipCard(args?.card),
					suggestions: clipSuggestions(args?.suggestions)
				});
				saveStore(store);
				return {
					ok: true,
					id: item.id
				};
			}
		},
		{
			name: "diary_write",
			description: "往用户的日记里写一条（「今日」页的「日记」标签）。什么时候用：今天发生了值得留下的事——一起做完的决定、她的状态、重要进展；或她让你「记到日记里」。像人写日记一样写，不要写成工作汇报。一天写几条就好，别事无巨细。",
			parameters: {
				type: "object",
				additionalProperties: false,
				required: ["text"],
				properties: {
					text: {
						type: "string",
						description: "日记内容，一两句话。"
					},
					date: {
						type: "string",
						description: "哪天（YYYY-MM-DD），默认今天。"
					}
				}
			},
			output: {
				schema: {
					type: "object",
					additionalProperties: false,
					properties: {
						ok: { type: "boolean" },
						message: { type: "string" },
						date: { type: "string" }
					}
				},
				render: (_args, value) => {
					return [{
						type: "text",
						text: value?.ok !== false ? "✓ 写进日记了" : "✗ " + String(value?.message || "没写成")
					}];
				}
			},
			async execute(args, exec) {
				const text = String(args?.text || "").trim();
				if (!text) return {
					ok: false,
					message: "内容是空的"
				};
				const store = loadStore();
				const { date } = addDiaryEntry(store, args?.date, clip(text, MAX_DIARY_TEXT), sessionIdFromExec(exec) || void 0);
				saveStore(store);
				return {
					ok: true,
					date
				};
			}
		},
		{
			name: "watch_add",
			description: "开始长期追踪一个主题——她说「关注一下 X」「以后帮我盯着 X」时用。会建一条每天定时去查的日程（出现在「定时」里，她可暂停可删），到点查到有新进展就 today_post 投给她。只追她明确说要长期关注的；一次性的查一下直接查，别建追踪。",
			parameters: {
				type: "object",
				additionalProperties: false,
				required: ["topic"],
				properties: {
					topic: {
						type: "string",
						description: "追什么（≤60字），比如「竞品的定价变化」。"
					},
					prompt: {
						type: "string",
						description: "可选。到点让查者做的事（≤600字）；缺省用「看看这个主题有没有新进展，有就投一条今日卡」。"
					},
					time: {
						type: "string",
						description: "可选。每天几点查（HH:mm，本地时区），默认 09:30。"
					},
					preset: {
						type: "string",
						description: "可选。让哪个 preset 会话去查，默认 mino-brief（简报员）。"
					}
				}
			},
			output: {
				schema: {
					type: "object",
					additionalProperties: false,
					properties: {
						ok: { type: "boolean" },
						message: { type: "string" },
						id: { type: "string" }
					}
				},
				render: (_args, value) => {
					const v = value;
					return [{
						type: "text",
						text: v?.ok !== false ? "✓ 已开始追踪" : "✗ " + String(v?.message || "没建成")
					}];
				}
			},
			async execute(args) {
				const topic = String(args?.topic || "").trim();
				if (!topic) return {
					ok: false,
					message: "主题为空"
				};
				const time = WATCH_TIME_RE.test(String(args?.time || "")) ? String(args.time) : "09:30";
				const custom = String(args?.prompt || "").trim();
				const prompt = (custom ? clip(custom, MAX_WATCH_PROMPT) : "") || `追踪主题「${clip(topic, MAX_WATCH_TOPIC)}」：看看有没有值得告诉她的新进展——有就 today_post 投一条（batch=关注，source=关注·${clip(topic, 20)}），没有就安静结束。`;
				const store = loadStore();
				const watch = addWatch(store, {
					topic: clip(topic, MAX_WATCH_TOPIC),
					prompt,
					enabled: true
				});
				const sched = scheduleOf(ctx);
				if (sched) try {
					watch.scheduleId = (await sched.create({
						title: `关注：${clip(topic, 40)}`,
						prompt,
						timing: {
							kind: "daily",
							daily: {
								time: time.length === 5 ? `${time}:00` : time,
								time_zone: "Asia/Shanghai"
							}
						},
						target: {
							kind: "new",
							create: { agentPreset: args?.preset ? clip(String(args.preset).trim(), 60) : "mino-brief" }
						}
					})).id;
				} catch {}
				saveStore(store);
				return {
					ok: true,
					id: watch.id,
					message: watch.scheduleId ? void 0 : "已记录，但宿主没有调度服务，不会自动跑"
				};
			}
		},
		{
			name: "watch_list",
			description: "列出正在长期追踪的主题（「关注 X」建的那些）。",
			parameters: {
				type: "object",
				additionalProperties: false,
				properties: {}
			},
			output: {
				schema: {
					type: "object",
					additionalProperties: false,
					properties: {
						ok: { type: "boolean" },
						watches: {
							type: "array",
							items: { type: "object" }
						}
					}
				},
				render: (_args, value) => {
					const ws = value?.watches ?? [];
					if (!ws.length) return [{
						type: "text",
						text: "没有在追的主题"
					}];
					const lines = ws.map((w) => `- ${w.topic}（id: ${w.id}${w.enabled ? "" : "，已暂停"}）`);
					return [{
						type: "text",
						text: `在追 ${ws.length} 个主题：\n${lines.join("\n")}`
					}];
				}
			},
			async execute() {
				return {
					ok: true,
					watches: loadStore().watches.map((w) => ({
						id: w.id,
						topic: w.topic,
						enabled: w.enabled,
						scheduled: !!w.scheduleId,
						at: w.at
					}))
				};
			}
		},
		{
			name: "watch_remove",
			description: "停止追踪一个主题（她说「别再看 X 了」时用）；连它的定时日程一起撤。先用 watch_list 拿 id。",
			parameters: {
				type: "object",
				additionalProperties: false,
				required: ["id"],
				properties: { id: {
					type: "string",
					description: "watch_list 里那条的 id；也可以直接给主题原文（唯一匹配才撤）。"
				} }
			},
			output: {
				schema: {
					type: "object",
					additionalProperties: false,
					properties: {
						ok: { type: "boolean" },
						message: { type: "string" }
					}
				},
				render: (_args, value) => {
					const v = value;
					return [{
						type: "text",
						text: v?.ok !== false ? "✓ 已撤掉" : "✗ " + String(v?.message || "没这条")
					}];
				}
			},
			async execute(args) {
				const id = String(args?.id || "").trim();
				const store = loadStore();
				let removed = removeWatch(store, id);
				if (!removed) {
					const hits = store.watches.filter((w) => w.topic === id || w.topic.includes(id));
					if (hits.length === 1 && hits[0]) removed = removeWatch(store, hits[0].id);
					else if (hits.length > 1) return {
						ok: false,
						message: `主题「${id}」对上 ${hits.length} 条，给具体 id：${hits.map((w) => w.id).join("、")}`
					};
				}
				if (!removed) return {
					ok: false,
					message: "没这条追踪，先 watch_list 看有哪些"
				};
				const sched = scheduleOf(ctx);
				if (sched && removed.scheduleId) try {
					await sched.edit({
						id: removed.scheduleId,
						action: "delete"
					});
				} catch {}
				saveStore(store);
				return {
					ok: true,
					message: `已撤「${removed.topic}」`
				};
			}
		}
	];
}
function apply(ctx) {
	const webServer = ctx.get("webServer");
	const tools = ctx.get("tools");
	const route = (path, handler) => {
		if (!webServer) return;
		ctx.effect(() => webServer.register({
			kind: "exact",
			path,
			handler: async (req, res) => {
				try {
					await handler(req, res);
				} catch (error) {
					sendJson(res, 500, {
						ok: false,
						error: String(error && error.message)
					});
				}
			}
		}));
	};
	route("/mino-today/api/summary", async (_req, res) => {
		const store = loadStore();
		const items = store.items.filter((i) => !i.dismissed).slice(-100).reverse();
		let schedules = [];
		const schedule = ctx.get("schedule");
		if (schedule) try {
			schedules = (await schedule.catalog()).map((e) => ({
				id: e.id,
				title: e.title,
				kind: e.kind,
				status: e.status,
				nextAt: e.status === "active" ? e.scheduledAt : void 0,
				running: e.executionActive === true,
				lastDeliveredAt: e.lastDelivery?.deliveredAt
			}));
		} catch {}
		const diaryDates = Object.keys(store.diaries).sort().reverse();
		const oldest = [...store.items.map((i) => i.at), ...diaryDates].sort()[0];
		sendJson(res, 200, {
			ok: true,
			now: (/* @__PURE__ */ new Date()).toISOString(),
			today: dayKey(/* @__PURE__ */ new Date()),
			items,
			schedules,
			diaries: {
				count: diaryDates.length,
				latest: diaryDates[0] ?? null,
				todayHasDiary: diaryDates.includes(dayKey(/* @__PURE__ */ new Date()))
			},
			stats: {
				feedCount: store.items.filter((i) => !i.dismissed).length,
				diaryDays: diaryDates.length,
				oldestAt: oldest ?? null
			}
		});
	});
	/** 定时任务的暂停/恢复（Today routines 同款操作）。 */
	route("/mino-today/api/schedule/edit", async (req, res) => {
		const schedule = ctx.get("schedule");
		if (!schedule) return sendJson(res, 503, {
			ok: false,
			error: "没有调度服务"
		});
		const body = await readBody(req);
		const id = String(body.id || "");
		if (!id || typeof body.active !== "boolean") return sendJson(res, 400, {
			ok: false,
			error: "参数不对"
		});
		const result = await schedule.edit({
			id,
			action: "update",
			patch: { active: body.active }
		});
		if (result?.code) return sendJson(res, result.code === "schedule_not_found" ? 404 : 409, {
			ok: false,
			error: result.code
		});
		sendJson(res, 200, {
			ok: true,
			result
		});
	});
	route("/mino-today/api/item", async (req, res) => {
		const body = await readBody(req);
		const title = String(body.title || "").trim();
		if (!title) return sendJson(res, 400, {
			ok: false,
			error: "标题是空的"
		});
		const store = loadStore();
		const item = addItem(store, {
			kind: KINDS.has(String(body.kind)) ? body.kind : "note",
			title: clip(title, MAX_TITLE),
			body: body.body ? clip(String(body.body).trim(), MAX_BODY) : void 0
		});
		saveStore(store);
		sendJson(res, 200, {
			ok: true,
			item
		});
	});
	route("/mino-today/api/dismiss", async (req, res) => {
		const body = await readBody(req);
		const id = String(body.id || "");
		const store = loadStore();
		const item = store.items.find((i) => i.id === id);
		if (!item) return sendJson(res, 404, {
			ok: false,
			error: "没这条"
		});
		item.dismissed = true;
		saveStore(store);
		sendJson(res, 200, { ok: true });
	});
	/** 卡片反馈：up/down 留信号；not_interested 顺带划掉（Today「不感兴趣」语义）。 */
	route("/mino-today/api/item/feedback", async (req, res) => {
		const body = await readBody(req);
		const id = String(body.id || "");
		const signal = String(body.signal || "");
		if (!FEEDBACK_SIGNALS.has(signal)) return sendJson(res, 400, {
			ok: false,
			error: "信号不对"
		});
		const store = loadStore();
		const item = store.items.find((i) => i.id === id);
		if (!item) return sendJson(res, 404, {
			ok: false,
			error: "没这条"
		});
		item.feedback = signal;
		if (signal === "not_interested") item.dismissed = true;
		saveStore(store);
		sendJson(res, 200, { ok: true });
	});
	/** 「调整卡片」自由文本：存进 item.adjustNotes，生成方经 feedbackSummary 按 source 取回。 */
	route("/mino-today/api/item/adjust", async (req, res) => {
		const body = await readBody(req);
		const id = String(body.id || "");
		const note = clip(String(body.note || "").trim(), 300);
		if (!note) return sendJson(res, 400, {
			ok: false,
			error: "内容是空的"
		});
		const store = loadStore();
		const item = store.items.find((i) => i.id === id);
		if (!item) return sendJson(res, 404, {
			ok: false,
			error: "没这条"
		});
		item.adjustNotes = [...item.adjustNotes ?? [], note].slice(-3);
		saveStore(store);
		sendJson(res, 200, { ok: true });
	});
	/** 已读标记：{id} 单条；{all:true} 全部标已读。 */
	route("/mino-today/api/item/read", async (req, res) => {
		const body = await readBody(req);
		const store = loadStore();
		const now = (/* @__PURE__ */ new Date()).toISOString();
		if (body.all === true) {
			for (const item of store.items) if (!item.read) item.read = now;
			saveStore(store);
			return sendJson(res, 200, { ok: true });
		}
		const id = String(body.id || "");
		const item = store.items.find((i) => i.id === id);
		if (!item) return sendJson(res, 404, {
			ok: false,
			error: "没这条"
		});
		if (!item.read) {
			item.read = now;
			saveStore(store);
		}
		sendJson(res, 200, { ok: true });
	});
	/** 置顶开关。 */
	route("/mino-today/api/item/pin", async (req, res) => {
		const body = await readBody(req);
		const id = String(body.id || "");
		const store = loadStore();
		const item = store.items.find((i) => i.id === id);
		if (!item) return sendJson(res, 404, {
			ok: false,
			error: "没这条"
		});
		item.pinned = body.pinned === void 0 ? !item.pinned : body.pinned === true;
		saveStore(store);
		sendJson(res, 200, {
			ok: true,
			pinned: item.pinned
		});
	});
	/** 正在追踪的主题清单。 */
	route("/mino-today/api/watches", async (_req, res) => {
		sendJson(res, 200, {
			ok: true,
			watches: loadStore().watches.map((w) => ({
				id: w.id,
				topic: w.topic,
				prompt: w.prompt,
				scheduleId: w.scheduleId ?? null,
				enabled: w.enabled,
				at: w.at
			}))
		});
	});
	/** 撤掉一条追踪：watch_remove 工具的 HTTP 对应物——连定时日程一起撤。 */
	route("/mino-today/api/watch/delete", async (req, res) => {
		const body = await readBody(req);
		const id = String(body.id || "");
		const store = loadStore();
		const watch = store.watches.find((w) => w.id === id);
		if (!watch) return sendJson(res, 404, {
			ok: false,
			error: "没这条追踪"
		});
		const sched = scheduleOf(ctx);
		if (sched && watch.scheduleId) await sched.edit({
			id: watch.scheduleId,
			action: "delete"
		}).catch(() => {});
		removeWatch(store, id);
		saveStore(store);
		sendJson(res, 200, { ok: true });
	});
	route("/mino-today/api/item/delete", async (req, res) => {
		const body = await readBody(req);
		const id = String(body.id || "");
		const store = loadStore();
		const before = store.items.length;
		store.items = store.items.filter((i) => i.id !== id);
		if (store.items.length === before) return sendJson(res, 404, {
			ok: false,
			error: "没这条"
		});
		saveStore(store);
		sendJson(res, 200, { ok: true });
	});
	route("/mino-today/api/diaries", async (_req, res) => {
		const store = loadStore();
		sendJson(res, 200, {
			ok: true,
			dates: Object.entries(store.diaries).map(([date, diary]) => ({
				date,
				updatedAt: diary.updatedAt,
				count: diary.entries.length,
				preview: diary.entries[diary.entries.length - 1]?.text.slice(0, 80) ?? ""
			})).sort((a, b) => b.date.localeCompare(a.date))
		});
	});
	route("/mino-today/api/diary", async (req, res) => {
		if ((req.method || "GET") === "POST") {
			const body = await readBody(req);
			const text = String(body.text || "").trim();
			if (!text) return sendJson(res, 400, {
				ok: false,
				error: "内容是空的"
			});
			const store = loadStore();
			const { date, entry } = addDiaryEntry(store, typeof body.date === "string" ? body.date : void 0, clip(text, MAX_DIARY_TEXT));
			saveStore(store);
			return sendJson(res, 200, {
				ok: true,
				date,
				entry
			});
		}
		const date = new URL(req.url || "", "http://127.0.0.1").searchParams.get("date") || dayKey(/* @__PURE__ */ new Date());
		const diary = loadStore().diaries[date];
		sendJson(res, 200, {
			ok: true,
			date,
			entries: diary?.entries ?? []
		});
	});
	route("/mino-today/api/diary/delete", async (req, res) => {
		const body = await readBody(req);
		const store = loadStore();
		if (!deleteDiaryEntry(store, String(body.date || ""), String(body.at || ""))) return sendJson(res, 404, {
			ok: false,
			error: "没这条"
		});
		saveStore(store);
		sendJson(res, 200, { ok: true });
	});
	ctx.provide("mino-today", { feedbackSummary() {
		const rows = /* @__PURE__ */ new Map();
		for (const item of loadStore().items) {
			if (!item.source) continue;
			const row = rows.get(item.source) ?? {
				source: item.source,
				up: 0,
				down: 0,
				notInterested: 0,
				adjustments: []
			};
			if (item.feedback === "up") row.up++;
			else if (item.feedback === "down") row.down++;
			else if (item.feedback === "not_interested") row.notInterested++;
			if (item.adjustNotes?.length) row.adjustments.push(...item.adjustNotes);
			row.adjustments = row.adjustments.slice(-5);
			rows.set(item.source, row);
		}
		return [...rows.values()].filter((r) => r.up + r.down + r.notInterested + r.adjustments.length > 0);
	} });
	if (tools) for (const tool of makeTools(ctx)) ctx.effect(() => tools.register(tool));
}
export { apply, inject, name };
