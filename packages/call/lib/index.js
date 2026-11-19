import { z } from "zod";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { MessageId, freezeMessage } from "@deepseek-ai/dsh-llm";
import { defineDomain, domainTable } from "@deepseek-ai/dsh-storage-domain";
// src/domain.ts
/**
* The `call` storage domain: durable entity tables behind the plugin's ports.
* Domain and table names must match UNIT_NAME_RE (`[a-z][a-z0-9_]*`).
*/
/** Attention urgency bands, mirroring Call's `decide` output. */
const MATTER_URGENCIES = [
	"critical",
	"high",
	"ask",
	"normal",
	"low"
];
const MATTER_STATUSES = [
	"open",
	"snoozed",
	"waiting",
	"done"
];
const TASK_STATUSES = [
	"open",
	"working",
	"needs_review",
	"done",
	"failed",
	"cancelled"
];
/** A task is the unit of proactive execution: work the router delegated to a worker. */
const Task = z.object({
	id: z.string(),
	title: z.string(),
	goal: z.string(),
	status: z.enum(TASK_STATUSES),
	/** 'dsh-session' = 起 preset worker 会话；'cli' = ctx.subprocess 起外部命令行 agent。 */
	workerKind: z.enum(["dsh-session", "cli"]),
	workerSessionId: z.string().optional(),
	/** needs_review 时等用户拍板的问题。 */
	question: z.string().optional(),
	/** done 时的交付摘要。 */
	result: z.string().optional(),
	failure: z.string().optional(),
	/** 来源 matter（信号→干活链路）。 */
	matterId: z.string().optional(),
	rounds: z.number(),
	createdAt: z.number(),
	updatedAt: z.number()
});
/** A matter is the unit of proactive attention: grouped source items needing a decision. */
const Matter = z.object({
	id: z.string(),
	/** Deterministic grouping key from the producing source (e.g. an IM thread). */
	groupKey: z.string(),
	title: z.string(),
	urgency: z.enum(MATTER_URGENCIES),
	status: z.enum(MATTER_STATUSES),
	/** Last decide outcome; re-judged whenever items arrive after `decidedAt`. */
	decision: z.enum([
		"notify",
		"quiet",
		"snooze"
	]).optional(),
	decidedAt: z.number().optional(),
	notifiedAt: z.number().optional(),
	sourceItemIds: z.array(z.string()),
	createdAt: z.number(),
	updatedAt: z.number(),
	snoozedUntil: z.number().optional()
});
/** A normalized item collected from a connected source before matter grouping. */
const SourceItem = z.object({
	/** `sourceKind:externalId` — deterministic, so redelivery dedupes idempotently. */
	id: z.string(),
	sourceKind: z.string(),
	externalId: z.string(),
	groupKey: z.string(),
	summary: z.string(),
	receivedAt: z.number(),
	matterId: z.string().optional()
});
/** A durable background Loop: a periodic watch that wakes the router Session. */
const Loop = z.object({
	id: z.string(),
	name: z.string(),
	everyMinutes: z.number(),
	prompt: z.string(),
	enabled: z.boolean(),
	/** 确定性前置闸：先跑这个公开工具，输出与 checkpoint 相同则本轮静默（零 LLM token）。 */
	checkTool: z.string().optional(),
	checkArgs: z.string().optional(),
	lastRunAt: z.number().optional(),
	checkpoint: z.string().optional()
});
/** Small singleton rows: router session id, per-source cursors, budget counters. */
const StateRow = z.object({
	key: z.string(),
	value: z.string()
});
const callDomain = defineDomain({
	name: "call",
	version: 1,
	tables: {
		matters: domainTable(Matter),
		source_items: domainTable(SourceItem),
		tasks: domainTable(Task),
		loops: domainTable(Loop),
		state: domainTable(StateRow)
	}
});
// src/decide.ts
const JUDGE_SYSTEM = `You judge how much each matter needs a person's attention. Reply with a JSON array only, no prose: [{"id":"<matter id>","urgency":"critical|high|ask|normal|low","title":"<short title>"}]. critical = act now, high = today, ask = needs an answer, normal = can wait, low = background noise.`;
function judgePrompt(matter, items) {
	const lines = items.map((item) => `- ${item.summary}`);
	return `Matter ${matter.id}\nCurrent title: ${matter.title}\nItems:\n${lines.join("\n")}`;
}
/** Parse the judge's JSON array into an id→urgency map; unparseable replies drop out. */
function parseJudgeResponse(text) {
	const out = /* @__PURE__ */ new Map();
	const match = text.match(/\[[\s\S]*\]/);
	if (!match) return out;
	try {
		for (const row of JSON.parse(match[0])) {
			const r = row;
			if (typeof r?.id === "string" && [
				"critical",
				"high",
				"ask",
				"normal",
				"low"
			].includes(r.urgency ?? "")) out.set(r.id, {
				urgency: r.urgency,
				...typeof r.title === "string" ? { title: r.title } : {}
			});
		}
	} catch {}
	return out;
}
const URGENT_RE = /urgent|asap|紧急|报警|宕机|失败|failed|down|critical|立即|马上|deadline/i;
const ASK_RE = /\?|？|请问|能不能|可以吗|帮忙|帮个忙/;
/** Deterministic fallback when no judge model is configured. */
function heuristicUrgency(matter, items) {
	const text = items.map((item) => item.summary).join("\n");
	if (URGENT_RE.test(text)) return "high";
	if (ASK_RE.test(text)) return "ask";
	return "normal";
}
/** One batched judge call for the sweep's pending matters; undefined when no model is set. */
async function judgeMatters(ctx, model, pending, signal, context) {
	const llm = ctx.get("llm");
	if (!llm?.stream || pending.length === 0) return void 0;
	const preamble = [
		context?.history.length ? `Matters already handled (an unchanged repeat stays quiet):\n${context.history.map((h) => `- ${h}`).join("\n")}` : "",
		context?.muted.length ? `Feed sources the person muted — judge these low unless truly urgent:\n${context.muted.map((m) => `- ${m}`).join("\n")}` : "",
		context?.adjustments?.length ? `Card adjustments the person asked for — fold them into how these cards are judged and worded:\n${context.adjustments.map((a) => `- ${a.source}: ${a.notes.join("；")}`).join("\n")}` : ""
	].filter(Boolean).join("\n\n");
	const prompt = (preamble ? `${preamble}\n\n` : "") + pending.map(({ matter, items }) => judgePrompt(matter, items)).join("\n\n");
	try {
		let text = "";
		for await (const chunk of llm.stream({
			provider: model.provider,
			model: model.model,
			system: JUDGE_SYSTEM,
			messages: [{
				role: "user",
				content: [{
					type: "text",
					text: prompt
				}]
			}],
			maxTokens: 1024,
			temperature: 0,
			signal
		})) if (chunk.type === "text-delta" && typeof chunk.text === "string") text += chunk.text;
		return parseJudgeResponse(text);
	} catch (error) {
		ctx.logger.warn("mino-call decide: judge call failed, falling back to heuristics: %s", String(error));
		return;
	}
}
/** Urgency bands that hand the matter to the router. */
const NOTIFY_URGENCIES = [
	"critical",
	"high",
	"ask"
];
const emptyBudget = () => ({
	day: "",
	count: 0,
	lastAt: 0
});
const dayOf = (now) => new Date(now).toISOString().slice(0, 10);
function budgetAllows(budget, now, perDay, minIntervalMinutes) {
	const today = dayOf(now);
	if ((budget.day === today ? budget.count : 0) >= perDay) return false;
	return now - budget.lastAt >= minIntervalMinutes * 6e4;
}
function budgetSpend(budget, now) {
	const today = dayOf(now);
	return {
		day: today,
		count: (budget.day === today ? budget.count : 0) + 1,
		lastAt: now
	};
}
// src/notebook.ts
const URGENCY_ORDER = {
	critical: 0,
	high: 1,
	ask: 2,
	normal: 3,
	low: 4
};
const stamp = (at) => new Date(at).toLocaleString();
function section(title, rows) {
	return rows.length === 0 ? [] : [
		`## ${title}`,
		"",
		...rows,
		""
	];
}
/** Render the whole notebook. `items` resolves each matter's latest evidence; `tasks` renders the worker board. */
function renderNotebook(matters, items, now = Date.now(), tasks = []) {
	const open = matters.filter((m) => m.status === "open").sort((a, b) => (URGENCY_ORDER[a.urgency] ?? 9) - (URGENCY_ORDER[b.urgency] ?? 9) || b.updatedAt - a.updatedAt);
	const needs = open.filter((m) => m.decision === "notify" || [
		"critical",
		"high",
		"ask"
	].includes(m.urgency));
	const waiting = open.filter((m) => !needs.includes(m) && m.status === "open" && m.decision !== "quiet");
	const quiet = open.filter((m) => m.decision === "quiet" || m.urgency === "low");
	const snoozed = matters.filter((m) => m.status === "snoozed");
	const done = matters.filter((m) => m.status === "done").sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 10);
	const latest = (m) => {
		const last = m.sourceItemIds.map((id) => items.get(id)).filter(Boolean).at(-1);
		return last ? ` — ${last.summary.slice(0, 80)}` : "";
	};
	const liveTasks = tasks.filter((t) => t.status !== "done" && t.status !== "cancelled").sort((a, b) => b.updatedAt - a.updatedAt);
	const taskRow = (t) => {
		const tail = t.status === "needs_review" && t.question ? ` — ${t.question.slice(0, 60)}` : "";
		return `- **[${t.status}]** ${t.title}${tail} · ${stamp(t.updatedAt)}`;
	};
	return [
		"# Call Notebook",
		"",
		`Rendered ${stamp(now)} · ${open.length} open · ${done.length} recently done`,
		"",
		...section("任务板", liveTasks.map(taskRow)),
		...section("需要你", needs.map((m) => `- **[${m.urgency}]** ${m.title}${latest(m)} · ${stamp(m.updatedAt)}`)),
		...section("等待中", waiting.map((m) => `- ${m.title}${latest(m)} · ${stamp(m.updatedAt)}`)),
		...section("静默中", quiet.map((m) => `- ${m.title}${latest(m)} · decided ${stamp(m.decidedAt ?? m.updatedAt)}`)),
		...section("已推迟", snoozed.map((m) => `- ${m.title} · until ${m.snoozedUntil ? stamp(m.snoozedUntil) : "?"}`)),
		...section("已完成", done.map((m) => `- ${m.title} · ${stamp(m.updatedAt)}`))
	].join("\n");
}
// src/resolve.ts
const SELECTED_BOT_KEY = "selected_bot";
const NOTIFY_TARGET_KEY = "notify_target";
const dshimOf = (ctx) => ctx.get("dshIm");
async function resolveBot(ctx, domain, configured) {
	if (configured !== "") return {
		kind: "resolved",
		botId: configured,
		origin: "config"
	};
	const remembered = domain.table("state").get(SELECTED_BOT_KEY)?.value;
	const dshim = dshimOf(ctx);
	const raw = dshim?.listBots !== void 0 ? await dshim.listBots() : void 0;
	const candidates = raw === void 0 ? void 0 : raw.map((b) => b?.botId).filter((v) => typeof v === "string" && v !== "");
	if (remembered !== void 0 && remembered !== "") {
		if (candidates === void 0 || candidates.length === 0 || candidates.includes(remembered)) return {
			kind: "resolved",
			botId: remembered,
			origin: "state"
		};
		await domain.table("state").put(SELECTED_BOT_KEY, {
			key: SELECTED_BOT_KEY,
			value: ""
		});
	}
	if (candidates === void 0) return { kind: "none" };
	if (candidates.length === 0) return { kind: "none" };
	if (candidates.length > 1) return {
		kind: "ambiguous",
		candidates
	};
	const botId = candidates[0];
	await domain.table("state").put(SELECTED_BOT_KEY, {
		key: SELECTED_BOT_KEY,
		value: botId
	});
	return {
		kind: "resolved",
		botId,
		origin: "auto"
	};
}
async function resolveNotifyTarget(ctx, domain, configured, sourceBotId) {
	if (configured.botId !== "" && configured.targetId !== "") return {
		kind: "resolved",
		botId: configured.botId,
		targetId: configured.targetId,
		origin: "config"
	};
	const remembered = domain.table("state").get(NOTIFY_TARGET_KEY)?.value;
	if (remembered !== void 0 && remembered !== "") {
		const parsed = JSON.parse(remembered);
		if (typeof parsed.botId === "string" && typeof parsed.targetId === "string") return {
			kind: "resolved",
			botId: parsed.botId,
			targetId: parsed.targetId,
			origin: "state"
		};
	}
	const botId = configured.botId !== "" ? configured.botId : sourceBotId;
	if (botId === void 0) return { kind: "none" };
	const dshim = dshimOf(ctx);
	if (dshim?.listTargets === void 0) return { kind: "none" };
	const targets = (await dshim.listTargets(botId)).map((t) => t.targetId);
	if (targets.length === 0) return { kind: "none" };
	if (targets.length > 1) return {
		kind: "ambiguous",
		botId,
		candidates: targets
	};
	const targetId = targets[0];
	await domain.table("state").put(NOTIFY_TARGET_KEY, {
		key: NOTIFY_TARGET_KEY,
		value: JSON.stringify({
			botId,
			targetId
		})
	});
	return {
		kind: "resolved",
		botId,
		targetId,
		origin: "auto"
	};
}
// src/tools.ts
const PAIRING_NAG_KEY = "pairing_nag";
const PAIRING_NAG_RESOLVED = "resolved";
const URGENCY_RANK = {
	critical: 0,
	high: 1,
	ask: 2,
	normal: 3,
	low: 4
};
/** Resolve a user- or model-supplied reference: exact id, then unique title substring. */
function findMatter(domain, ref) {
	const table = domain.table("matters");
	const byId = table.get(ref);
	if (byId !== void 0) return {
		key: ref,
		matter: byId
	};
	const needle = ref.toLowerCase();
	const hits = [...table.entries()].filter(([, m]) => m.title.toLowerCase().includes(needle));
	if (hits.length === 1) return {
		key: hits[0][0],
		matter: hits[0][1]
	};
	return {
		error: hits.length === 0 ? "not-found" : "ambiguous",
		candidates: hits.slice(0, 8).map(([id, m]) => ({
			id,
			title: m.title
		}))
	};
}
const openCandidates = (domain) => [...domain.table("matters").entries()].filter(([, m]) => m.status === "open").slice(0, 8).map(([id, m]) => ({
	id,
	title: m.title
}));
const json = (value) => [{
	type: "text",
	text: JSON.stringify(value)
}];
/** Registers the router tools on the agent scope; returns a disposer for plugin unload. */
function registerRouterTools(agentCtx, host) {
	const disposers = routerToolDefs(host).map((def) => agentCtx.tools.register({
		name: def.name,
		description: def.description,
		parameters: z.toJSONSchema(def.schema),
		output: {
			schema: {
				type: "object",
				additionalProperties: true
			},
			render: (_args, value) => json(value)
		},
		execute: async (raw) => {
			await host.ready();
			return def.execute(def.schema.parse(raw));
		}
	}));
	return () => {
		for (const d of disposers) d();
	};
}
/** The tool definitions; exported so tests can drive them without an agent. */
function routerToolDefs(host) {
	const domain = () => host.domain();
	const latestOf = (m) => m.sourceItemIds.slice(-2).map((id) => domain().table("source_items").get(id)?.summary).filter((s) => s !== void 0);
	const defs = [
		{
			name: "call_matters",
			description: "List companion matters grouped from incoming sources. Use to answer \"what is pending\" and to find a matter id before calling call_matter_done or call_matter_snooze.",
			schema: z.object({
				status: z.enum([
					"open",
					"snoozed",
					"waiting",
					"done",
					"all"
				]).default("open"),
				limit: z.number().int().min(1).max(50).default(20)
			}),
			async execute(args) {
				const all = [...domain().table("matters").entries()].map(([key, m]) => ({
					key,
					m
				}));
				const counts = {
					open: 0,
					snoozed: 0,
					waiting: 0,
					done: 0
				};
				for (const { m } of all) counts[m.status] += 1;
				return {
					counts,
					matters: all.filter(({ m }) => args.status === "all" || m.status === args.status).sort((a, b) => URGENCY_RANK[a.m.urgency] - URGENCY_RANK[b.m.urgency] || b.m.updatedAt - a.m.updatedAt).slice(0, args.limit).map(({ key, m }) => ({
						id: key,
						title: m.title,
						urgency: m.urgency,
						status: m.status,
						needsYou: NOTIFY_URGENCIES.includes(m.urgency),
						updatedAt: m.updatedAt,
						...m.snoozedUntil !== void 0 ? { snoozedUntil: m.snoozedUntil } : {},
						latest: latestOf(m)
					}))
				};
			}
		},
		{
			name: "call_matter_done",
			description: "Mark a companion matter as handled. Accepts the matter id or a unique substring of its title.",
			schema: z.object({ matter: z.string().min(1) }),
			async execute(args) {
				const found = findMatter(domain(), args.matter);
				if ("error" in found) return {
					error: found.error,
					candidates: found.candidates.length ? found.candidates : openCandidates(domain())
				};
				if (found.matter.status === "done") return {
					ok: true,
					already: true,
					matterId: found.key,
					title: found.matter.title
				};
				await domain().table("matters").update(found.key, (m) => ({
					...m,
					status: "done",
					updatedAt: Date.now()
				}));
				host.onChanged();
				return {
					ok: true,
					matterId: found.key,
					title: found.matter.title
				};
			}
		},
		{
			name: "call_matter_snooze",
			description: "Snooze a companion matter; it re-opens when the time passes. Accepts the matter id or a unique title substring, plus `minutes` from now or an ISO `until` timestamp.",
			schema: z.object({
				matter: z.string().min(1),
				minutes: z.number().int().min(1).optional(),
				until: z.string().optional()
			}).refine((v) => v.minutes !== void 0 !== (v.until !== void 0), { message: "pass exactly one of minutes/until" }),
			async execute(args) {
				const found = findMatter(domain(), args.matter);
				if ("error" in found) return {
					error: found.error,
					candidates: found.candidates.length ? found.candidates : openCandidates(domain())
				};
				const at = args.minutes !== void 0 ? Date.now() + args.minutes * 6e4 : Date.parse(args.until);
				if (!Number.isFinite(at)) return { error: "bad-until" };
				await domain().table("matters").update(found.key, (m) => ({
					...m,
					status: "snoozed",
					snoozedUntil: at,
					updatedAt: Date.now()
				}));
				host.onChanged();
				return {
					ok: true,
					matterId: found.key,
					title: found.matter.title,
					snoozedUntil: at
				};
			}
		},
		{
			name: "call_im_pair",
			description: "Show or choose which IM bot call watches. Without arguments returns the current pairing and the candidates from dshIm.listBots; pass a candidate botId to select it. Takes effect on the next source retry (~15s) for an unpaired source.",
			schema: z.object({ botId: z.string().min(1).optional() }),
			async execute(args) {
				const state = domain().table("state");
				const current = state.get("selected_bot")?.value ?? null;
				const dshim = host.ctx.get("dshIm");
				const candidates = (dshim?.listBots !== void 0 ? await dshim.listBots() : []).map((b) => b?.botId).filter((v) => typeof v === "string" && v !== "");
				if (args.botId === void 0) return {
					paired: current,
					candidates,
					hint: candidates.length ? "call again with botId to select one" : "no IM bot is configured in @xmanrui/dsh-im yet"
				};
				if (!candidates.includes(args.botId)) return {
					error: "unknown-bot",
					paired: current,
					candidates
				};
				await state.put(SELECTED_BOT_KEY, {
					key: SELECTED_BOT_KEY,
					value: args.botId
				});
				await state.put(PAIRING_NAG_KEY, {
					key: PAIRING_NAG_KEY,
					value: PAIRING_NAG_RESOLVED
				});
				return {
					ok: true,
					paired: args.botId,
					changed: current !== args.botId
				};
			}
		}
	];
	if (host.tasks !== void 0) {
		const ops = host.tasks;
		const openTaskCandidates = () => ops.list().filter((t) => t.status !== "done" && t.status !== "cancelled").slice(0, 8).map((t) => ({
			id: t.id,
			title: t.title
		}));
		const resolveTask = (ref) => {
			const found = ops.find(ref);
			return "key" in found ? found.key : void 0;
		};
		const taskErr = (ref) => {
			const found = ops.find(ref);
			return "error" in found ? {
				error: found.error,
				candidates: found.candidates.length ? found.candidates : openTaskCandidates()
			} : {
				error: "not-found",
				candidates: openTaskCandidates()
			};
		};
		const taskAdd = {
			name: "call_task_add",
			description: "Delegate real work to a call task worker: give it a goal and it runs in its own session, reports back, and pauses for your decision when it truly needs one. Use when a matter or request needs hands-on work, not just a reminder.",
			schema: z.object({
				title: z.string().min(1).describe("Short task title"),
				goal: z.string().min(1).describe("What done looks like, with enough context for the worker to act"),
				matterId: z.string().optional().describe("Originating matter id when the task comes from a signal")
			}),
			async execute(args) {
				const task = await ops.add(args);
				return {
					ok: true,
					taskId: task.id,
					status: task.status
				};
			}
		};
		const taskList = {
			name: "call_tasks",
			description: "List delegated tasks on the board: working, needs_review, done, failed.",
			schema: z.object({
				status: z.enum([
					"open",
					"working",
					"needs_review",
					"done",
					"failed",
					"cancelled",
					"all"
				]).default("all"),
				limit: z.number().int().min(1).max(50).default(20)
			}),
			async execute(args) {
				const all = ops.list();
				const counts = {};
				for (const t of all) counts[t.status] = (counts[t.status] ?? 0) + 1;
				return {
					counts,
					tasks: all.filter((t) => args.status === "all" || t.status === args.status).sort((a, b) => b.updatedAt - a.updatedAt).slice(0, args.limit).map((t) => ({
						id: t.id,
						title: t.title,
						status: t.status,
						question: t.question,
						result: t.result,
						rounds: t.rounds,
						updatedAt: t.updatedAt
					}))
				};
			}
		};
		const taskAnswer = {
			name: "call_task_answer",
			description: "Answer a task that is waiting for a decision (status needs_review); the worker resumes with your answer.",
			schema: z.object({
				task: z.string().min(1).describe("Task id or unique title substring"),
				answer: z.string().min(1).describe("Your decision / answer to the worker's question")
			}),
			async execute(args) {
				const key = resolveTask(args.task);
				if (key === void 0) return taskErr(args.task);
				return ops.answer(key, args.answer);
			}
		};
		const taskCancel = {
			name: "call_task_cancel",
			description: "Cancel a delegated task.",
			schema: z.object({ task: z.string().min(1).describe("Task id or unique title substring") }),
			async execute(args) {
				const key = resolveTask(args.task);
				if (key === void 0) return taskErr(args.task);
				return ops.cancel(key);
			}
		};
		defs.push(taskAdd, taskList, taskAnswer, taskCancel);
	}
	if (host.loops !== void 0) {
		const ops = host.loops;
		const loopAdd = {
			name: "call_loop_add",
			description: "Write a watch loop: runs your prompt on a schedule. Give checkTool+checkArgs (a public tool like mail_recent/cal_upcoming) to make quiet polls cost zero model calls — the prompt only fires when the check output changes.",
			schema: z.object({
				name: z.string().min(1).describe("Loop name (unique)"),
				everyMinutes: z.number().min(5).describe("Poll cadence, min 5"),
				prompt: z.string().min(1).describe("Instruction delivered to the router when the loop fires"),
				checkTool: z.string().optional().describe("Public tool to run each tick; prompt fires only when its output changes"),
				checkArgs: z.string().optional().describe("JSON arguments for checkTool")
			}),
			async execute(args) {
				return ops.add(args);
			}
		};
		const loopList = {
			name: "call_loops",
			description: "List watch loops.",
			schema: z.object({}),
			async execute() {
				return { loops: ops.list().map((l) => ({
					id: l.id,
					name: l.name,
					everyMinutes: l.everyMinutes,
					enabled: l.enabled,
					checkTool: l.checkTool,
					lastRunAt: l.lastRunAt
				})) };
			}
		};
		const loopRemove = {
			name: "call_loop_remove",
			description: "Remove a watch loop by name.",
			schema: z.object({ name: z.string().min(1) }),
			async execute(args) {
				return ops.remove(args.name);
			}
		};
		defs.push(loopAdd, loopList, loopRemove);
	}
	return defs;
}
// src/tasks.ts
const WORKER_PRESET = "mino-call-worker";
const WORKER_SESSION_PREFIX = "call-task-";
/** Worker 输出契约：每轮回复末尾的状态块。 */
const STATUS_BLOCK_RE = /\[CALL-STATUS\]\s*(done|needs_review|failed)\s*:\s*([^\n]+)/g;
/**
* Loop 闸的 checkpoint 面：只序列化每次调用的业务结果——ToolBatchResult 封套回显
* 本次随机 callId，整包比对永不相等（修过的真 bug：确定性闸会永远放行）。
*/
function loopCheckpointOf(out) {
	return JSON.stringify((out?.results ?? []).map((entry) => entry?.result));
}
/** 取最后一个状态块（一轮里只认收尾那条）。 */
function parseStatusBlock(text) {
	let last;
	for (const m of text.matchAll(STATUS_BLOCK_RE)) last = {
		status: m[1],
		detail: m[2].trim()
	};
	return last;
}
const table = (host) => host.callDomain().table("tasks");
const newSessionId = (taskId) => `${WORKER_SESSION_PREFIX}${taskId.replace(/^task:/, "").slice(0, 12)}`;
const briefOf = (task) => [
	`[call task] ${task.title}`,
	``,
	task.goal,
	``,
	`完成后用状态块收尾：[CALL-STATUS] done: <一句话交付>`,
	`需要你拍板时：[CALL-STATUS] needs_review: <具体问题>`,
	`干不下去时：[CALL-STATUS] failed: <原因>`
].join("\n");
async function injectToSession(host, sessionId, text) {
	const resolved = await host.ctx.sessionController.resolveAgent(sessionId);
	if ("error" in resolved) return false;
	const message = freezeMessage({
		id: MessageId(`mino-call:${crypto.randomUUID()}`),
		role: "user",
		content: [{
			type: "text",
			text
		}],
		source: { kind: "mino-call" }
	});
	resolved.agent.followup(message);
	return true;
}
/**
* 原子转移：mutate 在 update 闭包内执行（读-改-写一体），返回 no-op 时同一对象 →
* 不记 changed、不通知。终态（done/cancelled）粘性由 mutate 自行守卫——
* session/event 与 agent/status idle 兜底会并发，后写不得回退前者。
*/
async function transition(host, taskId, mutate) {
	let changed = false;
	const task = await table(host).update(taskId, (t) => {
		const next = mutate(t);
		changed = next !== t;
		return next;
	});
	if (changed) host.onChanged();
	return task === void 0 ? void 0 : {
		task,
		changed
	};
}
const STICKY = ["done", "cancelled"];
async function applyStatus(host, task, parsed) {
	const now = Date.now();
	const guard = (t, patch) => STICKY.includes(t.status) ? t : {
		...t,
		...patch,
		updatedAt: now
	};
	let out;
	if (parsed.status === "done") {
		out = await transition(host, task.id, (t) => guard(t, {
			status: "done",
			result: parsed.detail,
			question: void 0
		}));
		if (out?.changed) await host.notify(`[call 任务] 完成：${out.task.title} — ${parsed.detail}`, out.task);
	} else if (parsed.status === "needs_review") {
		out = await transition(host, task.id, (t) => guard(t, {
			status: "needs_review",
			question: parsed.detail
		}));
		if (out?.changed) await host.notify(`[call 任务] 等你拍板：${out.task.title} — ${parsed.detail}（用 call_task_answer 答复）`, out.task);
	} else {
		out = await transition(host, task.id, (t) => guard(t, {
			status: "failed",
			failure: parsed.detail
		}));
		if (out?.changed) await host.notify(`[call 任务] 失败：${out.task.title} — ${parsed.detail}`, out.task);
	}
}
/** 任务文本（worker 一轮回复/CLI stdout）→ 状态机。无状态块且仍在 working 才推 needs_review。 */
async function handleWorkerOutput(host, task, text) {
	const parsed = parseStatusBlock(text);
	if (parsed === void 0) {
		const out = await transition(host, task.id, (t) => t.status === "working" ? {
			...t,
			status: "needs_review",
			question: "worker 未按契约输出状态块，请人工看一眼会话",
			updatedAt: Date.now()
		} : t);
		if (out?.changed) await host.notify(`[call 任务] 异常：${out.task.title} — worker 未输出状态块`, out.task);
		return;
	}
	await applyStatus(host, task, parsed);
}
async function launchSessionWorker(host, task) {
	const sessionId = newSessionId(task.id);
	const launched = await transition(host, task.id, (cur) => ({
		...cur,
		workerSessionId: sessionId,
		status: "working",
		updatedAt: Date.now()
	}));
	try {
		if (!(await host.ctx.sessionController.list({}, host.signal)).items.some((item) => item.sessionId === sessionId)) await host.ctx.sessionController.create({
			sessionId,
			workspaceId: host.workspaceId(),
			agentPreset: WORKER_PRESET
		});
		if (!await injectToSession(host, sessionId, briefOf(launched?.task ?? task))) throw new Error("worker session did not materialize");
	} catch (error) {
		await transition(host, task.id, (cur) => ({
			...cur,
			status: "failed",
			failure: `worker 会话起不来: ${String(error)}`,
			updatedAt: Date.now()
		}));
	}
}
async function launchCliWorker(host, task, command) {
	const subprocess = host.ctx.get("subprocess");
	if (!subprocess?.spawn) {
		await transition(host, task.id, (cur) => ({
			...cur,
			status: "failed",
			failure: "subprocess 服务缝未挂载",
			updatedAt: Date.now()
		}));
		return;
	}
	await transition(host, task.id, (cur) => ({
		...cur,
		status: "working",
		updatedAt: Date.now()
	}));
	try {
		const proc = subprocess.spawn({
			argv: command.split(/\s+/).filter(Boolean),
			cwd: host.workspaceRoot(),
			stdio: {
				stdin: "pipe",
				stdout: "pipe",
				stderr: "pipe"
			},
			graceMs: 5e3,
			signal: host.signal
		});
		let output = "";
		proc.stdout?.on("data", (chunk) => {
			output += chunk.toString("utf8");
		});
		proc.stdin?.write(briefOf(task) + "\n");
		proc.stdin?.end();
		proc.done.then(() => handleWorkerOutput(host, table(host).get(task.id) ?? task, output)).catch((error) => transition(host, task.id, (cur) => ({
			...cur,
			status: "failed",
			failure: `cli worker 进程失败: ${String(error)}`,
			updatedAt: Date.now()
		})));
	} catch (error) {
		await transition(host, task.id, (cur) => ({
			...cur,
			status: "failed",
			failure: `cli worker 起不来: ${String(error)}`,
			updatedAt: Date.now()
		}));
	}
}
async function launchWorker(host, task) {
	if (task.workerKind === "cli") {
		const cmd = host.worker().command.trim();
		if (cmd === "") await transition(host, task.id, (cur) => ({
			...cur,
			status: "failed",
			failure: "worker.kind=cli 但 worker.command 为空",
			updatedAt: Date.now()
		}));
		else await launchCliWorker(host, task, cmd);
	} else await launchSessionWorker(host, task);
}
/** 建任务并委派 worker。workerKind 缺省随配置；matterId 记录来源事项。 */
async function createTask(host, input) {
	const now = Date.now();
	const task = {
		id: `task:${crypto.randomUUID()}`,
		title: input.title.slice(0, 80),
		goal: input.goal,
		status: "open",
		workerKind: host.worker().kind,
		rounds: 0,
		createdAt: now,
		updatedAt: now,
		...input.matterId !== void 0 ? { matterId: input.matterId } : {}
	};
	await table(host).put(task.id, task);
	host.onChanged();
	await launchWorker(host, task);
	return table(host).get(task.id) ?? task;
}
/** 用户答复 needs_review 任务 → 注回 worker 会话续跑。 */
async function answerTask(host, taskId, answer) {
	const task = table(host).get(taskId);
	if (task === void 0) return {
		ok: false,
		error: "not-found"
	};
	if (task.status !== "needs_review") return {
		ok: false,
		error: `not-awaiting-answer:${task.status}`
	};
	if (task.workerKind === "cli") return {
		ok: false,
		error: "cli worker 已退出，答复无法续跑——重建任务或换 dsh-session"
	};
	if (!await injectToSession(host, task.workerSessionId, `[call 用户答复] ${answer}\n\n（答复后继续任务，仍按状态块收尾）`)) return {
		ok: false,
		error: "worker-session-unavailable"
	};
	await transition(host, taskId, (t) => ({
		...t,
		status: "working",
		question: void 0,
		rounds: t.rounds + 1,
		updatedAt: Date.now()
	}));
	return { ok: true };
}
async function cancelTask(host, taskId) {
	const task = table(host).get(taskId);
	if (task === void 0) return {
		ok: false,
		error: "not-found"
	};
	if (task.status === "done" || task.status === "cancelled") return { ok: true };
	await transition(host, taskId, (t) => ({
		...t,
		status: "cancelled",
		updatedAt: Date.now()
	}));
	return { ok: true };
}
/**
* worker 会话的 assistant/message 事件入口：session.id → 任务 → 状态机。
* 只处理带状态块的收尾消息；中间叙述忽略。
*/
async function onSessionEvent(host, sessionId, eventType, data) {
	if (!sessionId.startsWith("call-task-") || eventType !== "assistant/message") return;
	const text = (data?.message?.content)?.filter((c) => c.type === "text").map((c) => c.text ?? "").join("\n") ?? "";
	if (!STATUS_BLOCK_RE.test(text)) return;
	STATUS_BLOCK_RE.lastIndex = 0;
	const task = [...table(host).entries()].find(([, t]) => t.workerSessionId === sessionId)?.[1];
	if (task === void 0 || task.status === "done" || task.status === "cancelled") return;
	await handleWorkerOutput(host, task, text);
}
/** 持久层读会话尾部：最后一条 assistant 消息的文本（冷会话兜底判定用）。 */
async function readSessionTail(host, sessionId) {
	const persistence = host.ctx.get("sessionPersistence");
	if (!persistence?.open) return "";
	try {
		const handle = await persistence.open(sessionId, "read", { signal: host.signal });
		for (let i = handle.events.length - 1; i >= 0; i -= 1) {
			const event = handle.events[i];
			if (event.type !== "assistant/message") continue;
			return (event.data?.message?.content)?.filter((c) => c.type === "text").map((c) => c.text ?? "").join("\n") ?? "";
		}
		return "";
	} catch {
		return "";
	}
}
/**
* agent/status idle 兜底：worker 转空闲但任务仍 working（事件监听丢块/契约违例）——
* 读持久层最后一条 assistant 消息重判，仍无状态块则按违例转 needs_review。
*/
async function onWorkerIdle(host, sessionId) {
	if (!sessionId.startsWith("call-task-")) return;
	const task = [...table(host).entries()].find(([, t]) => t.workerSessionId === sessionId)?.[1];
	if (task === void 0 || task.status !== "working") return;
	await handleWorkerOutput(host, task, await readSessionTail(host, sessionId));
}
/** worker 超时巡检：working 超过 worker.timeoutMinutes 无收尾 → needs_review 拍给人。 */
async function sweepTaskTimeouts(host) {
	const deadline = Date.now() - host.worker().timeoutMinutes * 6e4;
	for (const [, task] of table(host).entries()) {
		if (task.status !== "working" || task.updatedAt > deadline) continue;
		const out = await transition(host, task.id, (t) => t.status === "working" ? {
			...t,
			status: "needs_review",
			question: `worker 超过 ${host.worker().timeoutMinutes} 分钟无收尾，请人工看一眼会话`,
			updatedAt: Date.now()
		} : t);
		if (out?.changed) await host.notify(`[call 任务] 超时：${out.task.title} — worker 无收尾，请人工处置`, out.task);
	}
}
/**
* 开机恢复：working 任务的 worker 会话——持久层 stat 确认会话还在 →
* 经官方 schedule 投递「继续」唤醒（物化冷会话的官方缝）；会话真丢 → needs_review 拍给人。
*/
async function recoverTasks(host) {
	const schedule = host.ctx.get("schedule");
	const persistence = host.ctx.get("sessionPersistence");
	for (const [, task] of table(host).entries()) {
		if (task.status === "open") {
			await launchWorker(host, task);
			continue;
		}
		if (task.status !== "working" || task.workerKind !== "dsh-session" || task.workerSessionId === void 0) continue;
		const sessionId = task.workerSessionId;
		let exists = true;
		try {
			exists = await persistence?.stat(sessionId, { signal: host.signal }) !== void 0;
		} catch {}
		if (!exists) {
			await transition(host, task.id, (t) => ({
				...t,
				status: "needs_review",
				question: "worker 会话已不在持久层，任务无法续跑，请人工处置",
				updatedAt: Date.now()
			}));
			continue;
		}
		if (!schedule?.create) {
			await transition(host, task.id, (t) => ({
				...t,
				status: "needs_review",
				question: "schedule 服务缝未挂载，worker 无法唤醒，请人工确认",
				updatedAt: Date.now()
			}));
			continue;
		}
		try {
			await schedule.create({
				title: `call 恢复任务：${task.title.slice(0, 40)}`,
				prompt: `[call 恢复] 之前被中断，请继续任务：${task.title}，仍按状态块收尾。`,
				timing: {
					kind: "after",
					after_seconds: 3
				},
				target: {
					kind: "session",
					sessionId
				}
			}, void 0, host.signal);
		} catch (error) {
			host.logger.warn("mino-call: task %s recovery wake failed: %s", task.id, String(error));
		}
	}
}
// src/runtime.ts
/** The mino-call runtime: owns the storage domain, the router Session, source fibers, and the attention loop. */
const ROUTER_SESSION_ID = "call-router";
const ROUTER_PRESET = "mino-call-router";
const ROUTER_TITLE = "Mino 陪伴";
const ROUTER_STATE_KEY = "router_session";
const ROUTER_TITLE_KEY = "router_title";
const BUDGET_KEY = "notify_budget";
const BRIEFING_KEY = "briefing_last";
const MATTER_TITLE_MAX = 60;
const LOOP_TICK_MS = 6e4;
const RENDER_DEBOUNCE_MS = 2e3;
var Runtime = class {
	ctx;
	options;
	ready;
	logger;
	controller = new AbortController();
	domain;
	fibers = [];
	disposers = [];
	workspaceIdValue;
	notebookDirty = true;
	renderTimer;
	/** The bot the IM source is bound to once pairing resolves; the notify default falls back to it. */
	sourceBotId;
	/** Tool registration disposers keyed by agent id; agent disposal already rolls the scope back. */
	mountedTools = /* @__PURE__ */ new Map();
	constructor(ctx, sources, options) {
		this.ctx = ctx;
		this.options = options;
		this.logger = ctx.logger;
		this.ready = this.start(sources);
	}
	get signal() {
		return this.controller.signal;
	}
	callDomain() {
		return this.domain;
	}
	workspaceId() {
		return this.workspaceIdValue;
	}
	workspaceRoot() {
		return this.options.workspaceRoot ?? process.cwd();
	}
	worker() {
		return this.options.worker;
	}
	onChanged() {
		this.scheduleRender();
	}
	/** 任务生命周期消息：路由会话 + IM + feed 卡三通道投递。 */
	async notify(text, task) {
		await this.routerMessage(text);
		await this.notifyIm(text);
		const tools = this.ctx.get("tools");
		if (!this.options.postToFeed || !tools?.execute) return;
		try {
			await tools.execute({
				calls: [{
					type: "tool-call",
					id: `call-task:${task.id}:${Date.now()}`,
					name: "today_post",
					arguments: JSON.stringify({
						title: text.slice(0, MATTER_TITLE_MAX),
						kind: "moment",
						batch: "call-task",
						source: "call:task"
					})
				}],
				signal: this.controller.signal
			});
		} catch {}
	}
	async start(sources) {
		this.domain = await this.ctx.storageDomain.open(callDomain);
		const workspace = await this.ctx.workspaceRegistry.create(this.options.workspaceRoot ?? process.cwd());
		this.workspaceIdValue = workspace.id;
		if (!(await this.ctx.sessionController.list({}, this.controller.signal)).items.some((item) => item.sessionId === "call-router")) try {
			await this.ctx.sessionController.create({
				sessionId: ROUTER_SESSION_ID,
				workspaceId: workspace.id,
				agentPreset: ROUTER_PRESET
			});
			this.ctx.logger.info("mino-call router session created: %s", ROUTER_SESSION_ID);
		} catch (error) {
			this.ctx.logger.warn("mino-call: router session create skipped: %s", String(error));
		}
		await this.domain.table("state").put(ROUTER_STATE_KEY, {
			key: ROUTER_STATE_KEY,
			value: ROUTER_SESSION_ID
		});
		const router = await this.ctx.sessionController.resolveAgent(ROUTER_SESSION_ID);
		if (!("error" in router)) {
			this.decorateRouter(router.agent);
			if (this.domain.table("state").get(ROUTER_TITLE_KEY) === void 0) {
				router.agent.session.append("session/title", {
					title: ROUTER_TITLE,
					messageSeqs: [],
					source: { kind: "user" }
				});
				await this.domain.table("state").put(ROUTER_TITLE_KEY, {
					key: ROUTER_TITLE_KEY,
					value: ROUTER_TITLE
				});
			}
		}
		await this.seedLoops(this.options.seedLoops);
		await recoverTasks(this);
		const signal = this.controller.signal;
		this.disposers.push(this.ctx.on("session/event", (session, event) => {
			onSessionEvent(this, session.id, event.type, event.data).catch((error) => this.logger.warn("mino-call worker event failed: %s", String(error)));
		}, { global: true }));
		this.disposers.push(this.ctx.on("agent/status", ({ agent, status }) => {
			if (status !== "idle") return;
			onWorkerIdle(this, agent.id).catch((error) => this.logger.warn("mino-call worker idle check failed: %s", String(error)));
		}, { global: true }));
		this.fibers = [
			...sources.map((source) => source.run(this, signal).catch((error) => {
				if (!signal.aborted) this.ctx.logger.error("mino-call source %s exited: %s", source.kind, String(error));
			})),
			this.tickEvery(this.options.decideIntervalMinutes * 6e4, () => this.decideSweep()),
			this.tickEvery(LOOP_TICK_MS, () => this.loopTick())
		];
	}
	async tickEvery(ms, tick) {
		const signal = this.controller.signal;
		while (!signal.aborted) {
			try {
				await tick();
			} catch (error) {
				if (!signal.aborted) this.logger.warn("mino-call tick failed: %s", String(error));
			}
			await new Promise((resolve) => {
				if (signal.aborted) return resolve();
				const timer = setTimeout(resolve, ms);
				signal.addEventListener("abort", () => {
					clearTimeout(timer);
					resolve();
				}, { once: true });
			});
		}
	}
	/** Persist the item and group it onto the open matter sharing its groupKey. Idempotent on the item id. */
	async emit(item) {
		const items = this.domain.table("source_items");
		const matters = this.domain.table("matters");
		const id = `${item.sourceKind}:${item.externalId}`;
		if (items.get(id) !== void 0) return;
		const now = Date.now();
		let matterId;
		for (const [key, matter] of matters.entries()) if (matter.groupKey === item.groupKey && matter.status === "open") {
			matterId = key;
			break;
		}
		if (matterId === void 0) {
			matterId = `matter:${crypto.randomUUID()}`;
			const matter = {
				id: matterId,
				groupKey: item.groupKey,
				title: item.summary.slice(0, MATTER_TITLE_MAX),
				urgency: "normal",
				status: "open",
				sourceItemIds: [id],
				createdAt: now,
				updatedAt: now
			};
			await matters.put(matterId, matter);
		} else await matters.update(matterId, (matter) => ({
			...matter,
			sourceItemIds: [...matter.sourceItemIds, id],
			updatedAt: now
		}));
		await items.put(id, {
			id,
			...item,
			receivedAt: now,
			matterId
		});
		this.scheduleRender();
	}
	itemsOf(matter) {
		const items = this.domain.table("source_items");
		return matter.sourceItemIds.map((id) => items.get(id)).filter((i) => i !== void 0);
	}
	async routerMessage(text) {
		const resolved = await this.ctx.sessionController.resolveAgent(ROUTER_SESSION_ID);
		if ("error" in resolved) {
			this.logger.warn("mino-call: router session unavailable, message dropped");
			return;
		}
		const message = freezeMessage({
			id: MessageId(`mino-call:${crypto.randomUUID()}`),
			role: "user",
			content: [{
				type: "text",
				text
			}],
			source: { kind: "mino-call" }
		});
		resolved.agent.followup(message);
	}
	/** Explicit pairing step for the IM source; also records the bot the notify default falls back to. */
	async resolveBot() {
		const resolution = await resolveBot(this.ctx, this.domain, this.options.sourceBotId);
		if (resolution.kind === "resolved") {
			this.sourceBotId = resolution.botId;
			const state = this.domain.table("state");
			if (state.get("pairing_nag")?.value !== "resolved") await state.put(PAIRING_NAG_KEY, {
				key: PAIRING_NAG_KEY,
				value: "resolved"
			});
		}
		return resolution;
	}
	/** Surface a pairing blockage on the router session once per state fingerprint. */
	async pairingStatus(status, candidates = []) {
		const fingerprint = candidates.length ? `${status}:${[...candidates].sort().join(",")}` : status;
		const state = this.domain.table("state");
		if (state.get("pairing_nag")?.value === fingerprint) return;
		await state.put(PAIRING_NAG_KEY, {
			key: PAIRING_NAG_KEY,
			value: fingerprint
		});
		const text = status === "unavailable" ? "[call pairing] 还没有接入消息渠道（@xmanrui/dsh-im 未安装或没有可用 bot）。如果你想让我帮你盯消息，请提醒用户先装好并配好 IM 渠道，然后用 call_im_pair 工具完成接管。" : status === "none" ? "[call pairing] IM 渠道已就绪但还没有可接管的 bot。请在 @xmanrui/dsh-im 里配好一个 bot（external-consumer 模式），然后用 call_im_pair 完成接管。" : `[call pairing] 检测到多个可接管的 IM 账号：${candidates.join("、")}。请询问用户想让你盯哪一个，然后用 call_im_pair 工具完成配对。`;
		await this.routerMessage(text);
	}
	/** Attach the router tool surface to the materialized router agent; idempotent per agent id. */
	decorateRouter(agent) {
		if (agent.id !== "call-router" || this.mountedTools.has(agent.id)) return;
		this.mountedTools.set(agent.id, registerRouterTools(agent.ctx, {
			ctx: this.ctx,
			domain: () => this.domain,
			ready: () => this.ready,
			onChanged: () => this.scheduleRender(),
			tasks: this.taskOps,
			loops: this.loopOps
		}));
	}
	/** Forget a disposed router agent; its scoped registrations rolled back with the agent ctx. */
	dropRouter(agent) {
		this.mountedTools.delete(agent.id);
	}
	/** 任务执行面：router 会话的模型用这些工具把「该干的活」委派成 Task。 */
	taskOps = {
		add: async (input) => createTask(this, input),
		list: () => [...this.domain.table("tasks").entries()].map(([, t]) => t),
		answer: async (taskId, answer) => answerTask(this, taskId, answer),
		cancel: async (taskId) => cancelTask(this, taskId),
		find: (ref) => {
			const table = this.domain.table("tasks");
			if (table.get(ref) !== void 0) return { key: ref };
			const needle = ref.toLowerCase();
			const hits = [...table.entries()].filter(([, t]) => t.title.toLowerCase().includes(needle));
			return hits.length === 1 ? { key: hits[0][0] } : {
				error: hits.length === 0 ? "not-found" : "ambiguous",
				candidates: hits.slice(0, 8).map(([id, t]) => ({
					id,
					title: t.title
				}))
			};
		}
	};
	/** Loop 管理面：模型自写值守程序（可选 checkTool 确定性闸）。 */
	loopOps = {
		add: async (input) => {
			const id = `loop:${input.name}`;
			await this.domain.table("loops").put(id, {
				id,
				name: input.name,
				everyMinutes: input.everyMinutes,
				prompt: input.prompt,
				enabled: true,
				...input.checkTool !== void 0 ? { checkTool: input.checkTool } : {},
				...input.checkArgs !== void 0 ? { checkArgs: input.checkArgs } : {}
			});
			this.scheduleRender();
			return {
				ok: true,
				id
			};
		},
		list: () => [...this.domain.table("loops").entries()].map(([, l]) => l),
		remove: async (name) => {
			const id = `loop:${name}`;
			if (this.domain.table("loops").get(id) === void 0) return {
				ok: false,
				error: "not-found"
			};
			await this.domain.table("loops").delete(id);
			return { ok: true };
		}
	};
	async notifyIm(text) {
		const resolution = await resolveNotifyTarget(this.ctx, this.domain, this.options.notify, this.sourceBotId);
		if (resolution.kind !== "resolved") return;
		const dshim = this.ctx.get("dshIm");
		if (!dshim?.send) return;
		try {
			await dshim.send(resolution.botId, resolution.targetId, text);
		} catch (error) {
			this.logger.warn("mino-call: im notify failed: %s", String(error));
		}
	}
	/** The feed source label a matter's cards carry in mino-today (`call:<sourceKind>`). */
	feedSourceOf(items) {
		return `call:${items[0]?.sourceKind ?? "unknown"}`;
	}
	/** Feed feedback surface: muted sources plus the person's free-text card adjustments. */
	feedFeedback() {
		const today = this.ctx.get("mino-today");
		const muted = /* @__PURE__ */ new Set();
		const adjustments = [];
		for (const row of today?.feedbackSummary?.() ?? []) {
			if (row.notInterested > 0 || row.down > row.up) muted.add(row.source);
			if (row.adjustments?.length) adjustments.push({
				source: row.source,
				notes: row.adjustments
			});
		}
		return {
			muted,
			adjustments
		};
	}
	/** Hand a delivered notification to the feed so its card can gather feedback (soft dep). */
	async postFeed(matter, items, latest) {
		if (!this.options.postToFeed) return;
		const tools = this.ctx.get("tools");
		if (!tools?.execute) return;
		try {
			await tools.execute({
				calls: [{
					type: "tool-call",
					id: `call-feed:${matter.id}:${Date.now()}`,
					name: "today_post",
					arguments: JSON.stringify({
						title: matter.title.slice(0, MATTER_TITLE_MAX),
						...latest ? { body: latest } : {},
						kind: "moment",
						batch: "call",
						source: this.feedSourceOf(items)
					})
				}],
				signal: this.controller.signal
			});
		} catch (error) {
			this.logger.warn("mino-call: today_post handoff failed: %s", String(error));
		}
	}
	/** One attention sweep: judge pending matters, deliver owed notifications under budget, render the notebook. */
	async decideSweep() {
		const matters = this.domain.table("matters");
		const state = this.domain.table("state");
		const now = Date.now();
		for (const [key, matter] of matters.entries()) if (matter.status === "snoozed" && (matter.snoozedUntil ?? Number.POSITIVE_INFINITY) <= now) await matters.update(key, (m) => {
			const next = {
				...m,
				status: "open",
				updatedAt: now
			};
			delete next.snoozedUntil;
			delete next.decision;
			delete next.decidedAt;
			return next;
		});
		const pending = [];
		const undelivered = [];
		for (const [key, matter] of matters.entries()) {
			if (matter.status !== "open") continue;
			if (matter.decision === "notify" && matter.notifiedAt === void 0) undelivered.push({
				key,
				matter
			});
			else if (matter.decidedAt === void 0 || matter.updatedAt > matter.decidedAt) pending.push({
				key,
				matter,
				items: this.itemsOf(matter)
			});
		}
		const { muted, adjustments } = this.feedFeedback();
		const judged = this.options.decideModel ? await judgeMatters(this.ctx, this.options.decideModel, pending, this.controller.signal, {
			history: [...matters.entries()].filter(([, m]) => m.decidedAt !== void 0).sort((a, b) => (b[1].decidedAt ?? 0) - (a[1].decidedAt ?? 0)).slice(0, 10).map(([, m]) => `[${m.decision ?? m.status}] ${m.title}`),
			muted: [...muted],
			adjustments
		}) : void 0;
		const budgetRow = state.get(BUDGET_KEY);
		let budget = budgetRow ? {
			...emptyBudget(),
			...JSON.parse(budgetRow.value)
		} : emptyBudget();
		let budgetChanged = false;
		const deliver = async (matter, items) => {
			if (!budgetAllows(budget, now, this.options.notifyBudgetPerDay, this.options.notifyMinIntervalMinutes)) return void 0;
			const latest = items.slice(-3).map((i) => `- ${i.summary}`).join("\n");
			const text = `[call ${matter.urgency}] ${matter.title}${latest ? `\n${latest}` : ""}`;
			await this.routerMessage(text);
			await this.notifyIm(text);
			await this.postFeed(matter, items, latest);
			budget = budgetSpend(budget, now);
			budgetChanged = true;
			return now;
		};
		for (const { key, matter } of undelivered) {
			const notifiedAt = await deliver(matter, this.itemsOf(matter));
			if (notifiedAt !== void 0) await matters.update(key, (m) => ({
				...m,
				notifiedAt
			}));
		}
		for (const { key, matter, items } of pending) {
			const j = judged?.get(matter.id);
			const urgency = muted.has(this.feedSourceOf(items)) ? "low" : j?.urgency ?? heuristicUrgency(matter, items);
			const wantsNotify = NOTIFY_URGENCIES.includes(urgency);
			const notifiedAt = wantsNotify ? await deliver({
				...matter,
				urgency
			}, items) : void 0;
			await matters.update(key, (m) => ({
				...m,
				urgency,
				title: j?.title ?? m.title,
				decision: wantsNotify ? "notify" : "quiet",
				decidedAt: now,
				...notifiedAt !== void 0 ? { notifiedAt } : {}
			}));
		}
		if (budgetChanged) await state.put(BUDGET_KEY, {
			key: BUDGET_KEY,
			value: JSON.stringify(budget)
		});
		this.scheduleRender();
	}
	async seedLoops(loops) {
		const table = this.domain.table("loops");
		for (const seed of loops) {
			const id = `loop:${seed.name}`;
			const existing = table.get(id);
			await table.put(id, {
				id,
				name: seed.name,
				everyMinutes: seed.everyMinutes,
				prompt: seed.prompt,
				enabled: seed.enabled,
				...existing?.lastRunAt !== void 0 ? { lastRunAt: existing.lastRunAt } : {},
				...existing?.checkpoint !== void 0 ? { checkpoint: existing.checkpoint } : {}
			});
		}
	}
	/** 确定性前置闸：跑公开工具比对 checkpoint，输出没变则本轮静默（零 LLM token）。 */
	async loopCheckChanged(checkTool, checkArgs, checkpoint) {
		const tools = this.ctx.get("tools");
		if (!tools?.execute) return { changed: true };
		try {
			const next = loopCheckpointOf(await tools.execute({
				calls: [{
					type: "tool-call",
					id: `call-loop:${crypto.randomUUID()}`,
					name: checkTool,
					arguments: checkArgs ?? "{}"
				}],
				signal: this.controller.signal
			}));
			return next === checkpoint ? { changed: false } : {
				changed: true,
				next
			};
		} catch (error) {
			this.logger.warn("mino-call loop check %s failed: %s", checkTool, String(error));
			return { changed: true };
		}
	}
	/** Fire due loops into the router session and run the daily briefing check. */
	async loopTick() {
		const loops = this.domain.table("loops");
		const now = Date.now();
		for (const [key, loop] of loops.entries()) {
			if (!loop.enabled || now - (loop.lastRunAt ?? 0) < Math.max(loop.everyMinutes, 5) * 6e4) continue;
			if (loop.checkTool) {
				const gate = await this.loopCheckChanged(loop.checkTool, loop.checkArgs, loop.checkpoint);
				await loops.update(key, (l) => ({
					...l,
					lastRunAt: now,
					...gate.next !== void 0 ? { checkpoint: gate.next } : {}
				}));
				if (!gate.changed) continue;
			} else await loops.update(key, (l) => ({
				...l,
				lastRunAt: now
			}));
			await this.routerMessage(`[call loop:${loop.name}] ${loop.prompt}`);
		}
		await sweepTaskTimeouts(this);
		if (this.options.briefing.enabled) await this.briefingTick(now);
		if (this.notebookDirty) await this.renderNotebook();
	}
	async briefingTick(now) {
		const state = this.domain.table("state");
		const last = state.get(BRIEFING_KEY);
		const today = new Date(now).toISOString().slice(0, 10);
		if (new Date(now).getHours() < this.options.briefing.hour || last?.value === today) return;
		const open = [...this.domain.table("matters").entries()].map(([, m]) => m).filter((m) => m.status === "open");
		const needs = open.filter((m) => NOTIFY_URGENCIES.includes(m.urgency)).length;
		await state.put(BRIEFING_KEY, {
			key: BRIEFING_KEY,
			value: today
		});
		await this.notifyIm(`Call 简报: ${open.length} 项待处理，其中 ${needs} 项需要你。`);
		await this.routerMessage(`[call briefing] 今日待处理 ${open.length} 项（需要你 ${needs} 项）。Notebook 已刷新。`);
	}
	scheduleRender() {
		this.notebookDirty = true;
		if (this.renderTimer !== void 0) return;
		this.renderTimer = setTimeout(() => {
			this.renderTimer = void 0;
			this.renderNotebook().catch((error) => this.logger.warn("mino-call notebook render failed: %s", String(error)));
		}, RENDER_DEBOUNCE_MS);
	}
	async renderNotebook() {
		const matters = [...this.domain.table("matters").entries()].map(([, m]) => m);
		const items = new Map([...this.domain.table("source_items").entries()].map(([k, i]) => [i.id, i]));
		const tasks = [...this.domain.table("tasks").entries()].map(([, t]) => t);
		const path = this.options.notebookPath ?? join(this.workspaceRoot(), "Call", "Notebook.md");
		await mkdir(dirname(path), { recursive: true });
		await writeFile(path, renderNotebook(matters, items, Date.now(), tasks));
		this.notebookDirty = false;
	}
	async stop() {
		this.controller.abort();
		for (const dispose of this.mountedTools.values()) dispose();
		this.mountedTools.clear();
		if (this.renderTimer !== void 0) clearTimeout(this.renderTimer);
		await Promise.allSettled(this.fibers);
		if (this.notebookDirty) await this.renderNotebook().catch(() => {});
		await this.domain?.close();
	}
};
const RETRY_MS$4 = 15e3;
const EventSchema = z.looseObject({
	botId: z.string(),
	eventId: z.string(),
	messageId: z.string(),
	actor: z.looseObject({
		kind: z.string().default("user"),
		id: z.string()
	}),
	conversation: z.looseObject({
		kind: z.enum(["group", "dm"]),
		id: z.string()
	}),
	at: z.string(),
	text: z.string().default(""),
	reply: z.looseObject({
		rootId: z.string().optional(),
		threadId: z.string().optional()
	})
});
const pause$4 = (ms, signal) => new Promise((resolve) => {
	if (signal.aborted) return resolve();
	const timer = setTimeout(resolve, ms);
	signal.addEventListener("abort", () => {
		clearTimeout(timer);
		resolve();
	}, { once: true });
});
/** Group key: a DM is one thread; a group message groups under its root when present. */
const groupKeyOf = (event) => event.conversation.kind === "dm" ? `im:${event.conversation.id}` : `im:${event.conversation.id}:${event.reply.rootId ?? event.messageId}`;
/** Requires @xmanrui/dsh-im with the account in external-consumer exclusive mode. */
function imSource(ctx, config, resolveBot) {
	return {
		kind: "im",
		async run(host, signal) {
			while (!signal.aborted) {
				const dshim = ctx.get("dshIm");
				if (!dshim?.consumeInbound) {
					host.logger.info("mino-call im: @xmanrui/dsh-im not installed; retrying");
					await host.pairingStatus("unavailable");
					await pause$4(RETRY_MS$4, signal);
					continue;
				}
				const resolution = await resolveBot();
				if (resolution.kind === "none") {
					host.logger.info("mino-call im: no bot to consume; retrying");
					await host.pairingStatus("none");
					await pause$4(RETRY_MS$4, signal);
					continue;
				}
				if (resolution.kind === "ambiguous") {
					host.logger.warn("mino-call im: multiple bots (%s); set sources.im.botId", resolution.candidates.join(", "));
					await host.pairingStatus("ambiguous", resolution.candidates);
					await pause$4(RETRY_MS$4, signal);
					continue;
				}
				const botId = resolution.botId;
				if (resolution.origin === "auto") host.logger.info("mino-call im: auto-paired bot %s", botId);
				try {
					const { account } = await dshim.describeBot(botId);
					const selfIds = /* @__PURE__ */ new Set([botId, account.id ?? ""]);
					const release = await dshim.consumeInbound(botId, {
						expectedFingerprint: account.fingerprint,
						signal,
						async onEvent(raw, { signal: eventSignal }) {
							eventSignal?.throwIfAborted();
							try {
								const event = EventSchema.parse(raw);
								if (!selfIds.has(event.actor.id) && event.actor.kind !== "app") await host.emit({
									sourceKind: "im",
									externalId: event.messageId,
									groupKey: groupKeyOf(event),
									summary: event.text.slice(0, 500)
								});
							} catch (error) {
								host.logger.warn("mino-call im: dropped inbound event: %s", String(error));
							}
							return { accepted: true };
						}
					});
					host.logger.info("mino-call im: consuming bot %s", botId);
					await new Promise((resolve) => {
						if (signal.aborted) return resolve();
						signal.addEventListener("abort", () => resolve(), { once: true });
					});
					release();
				} catch (error) {
					if (signal.aborted) return;
					host.logger.warn("mino-call im: consumer error, retrying: %s", String(error));
					await pause$4(RETRY_MS$4, signal);
				}
			}
		}
	};
}
// src/sources/webwatch.ts
const WEBWATCH_SOURCE = "webwatch";
const RETRY_MS$3 = 15e3;
const pause$3 = (ms, signal) => new Promise((resolve) => {
	if (signal.aborted) return resolve();
	const timer = setTimeout(resolve, ms);
	signal.addEventListener("abort", () => {
		clearTimeout(timer);
		resolve();
	}, { once: true });
});
function webwatchSource(ctx, config) {
	let warnedMissing = false;
	return {
		kind: WEBWATCH_SOURCE,
		async run(host, signal) {
			while (!signal.aborted) {
				const tools = ctx.get("tools");
				if (!tools?.execute) {
					await pause$3(RETRY_MS$3, signal);
					continue;
				}
				try {
					const { results } = await tools.execute({
						calls: [{
							type: "tool-call",
							id: "mino-call-watch-scan",
							name: "watch_scan",
							arguments: JSON.stringify({ days: config.days })
						}],
						signal
					});
					const res = results[0]?.result;
					if (res && !res.isError) {
						warnedMissing = false;
						const hits = res.value?.hits ?? [];
						for (const hit of hits) await host.emit({
							sourceKind: WEBWATCH_SOURCE,
							externalId: `${hit.site}|${hit.url}`,
							groupKey: `webwatch:${hit.site}`,
							summary: `[${hit.site}] ${hit.when} ${hit.title || hit.url} — ${hit.hint}`.slice(0, 500)
						});
					} else if (!warnedMissing) {
						warnedMissing = true;
						host.logger.info("mino-call webwatch: watch_scan unavailable (%s)；装好 webwatch 插件后自动生效", res?.error?.message ?? "tool missing");
					}
				} catch (error) {
					if (!warnedMissing) {
						warnedMissing = true;
						host.logger.info("mino-call webwatch: scan failed, will retry silently: %s", String(error));
					}
				}
				await pause$3(config.intervalMinutes * 6e4, signal);
			}
		}
	};
}
// src/sources/mail.ts
const MAIL_SOURCE = "mail";
const RETRY_MS$2 = 15e3;
const pause$2 = (ms, signal) => new Promise((resolve) => {
	if (signal.aborted) return resolve();
	const timer = setTimeout(resolve, ms);
	signal.addEventListener("abort", () => {
		clearTimeout(timer);
		resolve();
	}, { once: true });
});
async function callTool$1(tools, signal, id, name, args) {
	const { results } = await tools.execute({
		calls: [{
			type: "tool-call",
			id,
			name,
			arguments: JSON.stringify(args)
		}],
		signal
	});
	return results[0]?.result;
}
const emitMail = async (host, mail, via, groupKey) => host.emit({
	sourceKind: MAIL_SOURCE,
	externalId: `${mail.date}|${mail.subject}`,
	groupKey,
	summary: `[邮件${via}] ${mail.date} ${mail.from} — ${mail.subject}`.slice(0, 500)
});
function mailSource(ctx, config) {
	let warnedMissing = false;
	const warnOnce = (host, why) => {
		if (warnedMissing) return;
		warnedMissing = true;
		host.logger.info("mino-call mail: mail_recent unavailable (%s)；装好 connector-mail 并填 IMAP 授权码后自动生效", why);
	};
	return {
		kind: MAIL_SOURCE,
		async run(host, signal) {
			while (!signal.aborted) {
				const tools = ctx.get("tools");
				if (!tools?.execute) {
					await pause$2(RETRY_MS$2, signal);
					continue;
				}
				try {
					const res = await callTool$1(tools, signal, "mino-call-mail-recent", "mail_recent", { limit: config.limit });
					if (res && !res.isError) {
						warnedMissing = false;
						const mails = res.value?.mails ?? [];
						for (const mail of mails) await emitMail(host, mail, "", `mail:${mail.from || "未知发件人"}`);
						for (const q of config.queries) {
							const sres = await callTool$1(tools, signal, `mino-call-mail-search-${q}`, "mail_search", {
								q,
								limit: config.limit
							});
							if (!sres || sres.isError) continue;
							for (const mail of sres.value?.mails ?? []) await emitMail(host, mail, `·${q}`, `mail-search:${q}`);
						}
					} else warnOnce(host, res?.error?.message ?? "tool missing");
				} catch (error) {
					warnOnce(host, String(error));
				}
				await pause$2(config.intervalMinutes * 6e4, signal);
			}
		}
	};
}
// src/sources/calendar.ts
const CALENDAR_SOURCE = "calendar";
const RETRY_MS$1 = 15e3;
const pause$1 = (ms, signal) => new Promise((resolve) => {
	if (signal.aborted) return resolve();
	const timer = setTimeout(resolve, ms);
	signal.addEventListener("abort", () => {
		clearTimeout(timer);
		resolve();
	}, { once: true });
});
async function callTool(tools, signal, id, name, args) {
	const { results } = await tools.execute({
		calls: [{
			type: "tool-call",
			id,
			name,
			arguments: JSON.stringify(args)
		}],
		signal
	});
	return results[0]?.result;
}
function calendarSource(ctx, config) {
	let warnedMissing = false;
	return {
		kind: CALENDAR_SOURCE,
		async run(host, signal) {
			while (!signal.aborted) {
				const tools = ctx.get("tools");
				if (!tools?.execute) {
					await pause$1(RETRY_MS$1, signal);
					continue;
				}
				try {
					if (config.sync) await callTool(tools, signal, "mino-call-cal-sync", "cal_sync", {});
					const res = await callTool(tools, signal, "mino-call-cal-upcoming", "cal_upcoming", { days: config.days });
					if (res && !res.isError) {
						warnedMissing = false;
						const events = res.value?.events ?? [];
						for (const ev of events) await host.emit({
							sourceKind: CALENDAR_SOURCE,
							externalId: `${ev.dtstart}|${ev.summary}`,
							groupKey: `calendar:${String(ev.dtstart).slice(0, 10)}`,
							summary: `[日程] ${ev.dtstart}${ev.dtend ? `→${ev.dtend}` : ""} ${ev.summary}${ev.location ? ` @${ev.location}` : ""}`.slice(0, 500)
						});
					} else if (!warnedMissing) {
						warnedMissing = true;
						host.logger.info("mino-call calendar: cal_upcoming unavailable (%s)；装好 connector-calendar 后自动生效", res?.error?.message ?? "tool missing");
					}
				} catch (error) {
					if (!warnedMissing) {
						warnedMissing = true;
						host.logger.info("mino-call calendar: poll failed, will retry silently: %s", String(error));
					}
				}
				await pause$1(config.intervalMinutes * 6e4, signal);
			}
		}
	};
}
// src/sources/tasks.ts
const TASK_SOURCE = "tasks";
const RETRY_MS = 15e3;
const pause = (ms, signal) => new Promise((resolve) => {
	if (signal.aborted) return resolve();
	const timer = setTimeout(resolve, ms);
	signal.addEventListener("abort", () => {
		clearTimeout(timer);
		resolve();
	}, { once: true });
});
function taskSource(ctx, config) {
	let warnedMissing = false;
	return {
		kind: TASK_SOURCE,
		async run(host, signal) {
			while (!signal.aborted) {
				const board = ctx.get("taskBoard");
				if (!board?.snapshot) {
					await pause(RETRY_MS, signal);
					continue;
				}
				try {
					const snap = board.snapshot();
					warnedMissing = false;
					const now = Date.now();
					for (const task of snap.tasks) {
						const dueAt = task.schedule?.nextRunAt;
						const overdue = task.status === "todo" && typeof dueAt === "number" && dueAt - now <= config.dueSoonMinutes * 6e4;
						if (task.status !== "failed" && !overdue) continue;
						await host.emit({
							sourceKind: TASK_SOURCE,
							externalId: `${task.id}@${task.updatedAt}`,
							groupKey: `tasks:${task.status}`,
							summary: task.status === "failed" ? `[任务失败] ${task.title}`.slice(0, 500) : `[任务到期] ${task.title}`.slice(0, 500)
						});
					}
				} catch (error) {
					if (!warnedMissing) {
						warnedMissing = true;
						host.logger.info("mino-call tasks: snapshot failed, will retry silently: %s", String(error));
					}
				}
				await pause(config.intervalMinutes * 6e4, signal);
			}
		}
	};
}
// src/index.ts
const name = "mino-call";
const inject = [
	"storageDomain",
	"sessionController",
	"workspaceRegistry",
	"sessionPersistence",
	"subprocess",
	"schedule"
];
const Config = z.object({
	/** Directory the router Workspace owns; defaults to the profile's working directory. */
	workspaceRoot: z.string().optional(),
	sources: z.object({
		im: z.object({
			/** Explicit off switch; when on, an empty botId auto-pairs through listBots(). */
			enabled: z.boolean().default(true),
			/** @xmanrui/dsh-im bot id in external-consumer exclusive mode; empty resolves config→state→listBots. */
			botId: z.string().default("")
		}).prefault({}),
		webwatch: z.object({
			/** Poll watch_scan through the tools executor; absent webwatch plugin idles harmlessly. */
			enabled: z.boolean().default(true),
			/** Poll interval in minutes. */
			intervalMinutes: z.number().min(1).default(60),
			/** Lookback days per scan. */
			days: z.number().min(1).max(365).default(1)
		}).prefault({}),
		mail: z.object({
			/** Poll mail_recent through the tools executor; absent connector-mail idles harmlessly. */
			enabled: z.boolean().default(true),
			intervalMinutes: z.number().min(1).default(30),
			/** How many recent mails per poll (tool clamps to 50). */
			limit: z.number().int().min(1).max(50).default(15),
			/** Extra keywords searched every poll (订票/发票/验证码 style hits). */
			queries: z.array(z.string()).default([])
		}).prefault({}),
		calendar: z.object({
			/** Poll cal_upcoming through the tools executor; absent connector-calendar idles harmlessly. */
			enabled: z.boolean().default(true),
			intervalMinutes: z.number().min(1).default(30),
			/** Lookahead days per poll. */
			days: z.number().min(1).max(90).default(3),
			/** Attempt cal_sync (CalDAV pull) first; absent creds error is ignored. */
			sync: z.boolean().default(true)
		}).prefault({}),
		tasks: z.object({
			/** Read the task-board service snapshot; absent board idles harmlessly. */
			enabled: z.boolean().default(true),
			intervalMinutes: z.number().min(1).default(10),
			/** A scheduled todo within this many minutes counts as due-soon signal. */
			dueSoonMinutes: z.number().min(0).default(30)
		}).prefault({})
	}).prefault({}),
	proactive: z.object({
		/** Minutes between attention sweeps. */
		intervalMinutes: z.number().min(1).default(15),
		/** Cheap judge model for matter urgency; falls back to heuristics while unset. */
		decideModel: z.object({
			provider: z.string(),
			model: z.string()
		}).optional(),
		/** Daily notification handoff cap and the minimum gap between two pushes. */
		notifyBudgetPerDay: z.number().int().min(0).default(12),
		notifyMinIntervalMinutes: z.number().min(0).default(30)
	}).prefault({}),
	notify: z.object({
		/** @xmanrui/dsh-im bot + saved delivery target for proactive pushes; both empty disables pushes. */
		botId: z.string().default(""),
		targetId: z.string().default(""),
		/** Also post each delivered notification to the mino-today feed; feed feedback can then mute that source. */
		postToFeed: z.boolean().default(true)
	}).prefault({}),
	notebook: z.object({ 
	/** Rendered notebook path; defaults to <workspaceRoot>/Call/Notebook.md. */
path: z.string().optional() }).prefault({}),
	briefing: z.object({
		/** Daily briefing push + router note at `hour` (local, 0-23). */
		enabled: z.boolean().default(true),
		hour: z.number().int().min(0).max(23).default(9)
	}).prefault({}),
	/** Worker 委派：任务执行载体。dsh-session=起 mino-call-worker preset 会话；cli=经 ctx.subprocess 起外部命令行 agent（autoloop 式）。 */
	worker: z.object({
		kind: z.enum(["dsh-session", "cli"]).default("dsh-session"),
		/** kind=cli 时的外部命令行（argv 形式，空格分隔）；任务目标经 stdin 喂入。 */
		command: z.string().default(""),
		/** worker 单轮超时（分钟），超时判失联。 */
		timeoutMinutes: z.number().min(1).default(30)
	}).prefault({}),
	/** Seed loops upserted by name at every boot; runtime edits survive reseeding. */
	loops: z.array(z.object({
		name: z.string().min(1),
		everyMinutes: z.number().min(5),
		prompt: z.string().min(1),
		enabled: z.boolean().default(true)
	})).default([])
}).prefault({});
async function apply(ctx, config) {
	let runtime;
	ctx.on("agent/created", ({ agent }) => {
		runtime?.decorateRouter(agent);
	});
	ctx.on("agent/disposed", ({ agent }) => {
		runtime?.dropRouter(agent);
	});
	const sources = [];
	if (config.sources.im.enabled) sources.push(imSource(ctx, config.sources.im, () => runtime.resolveBot()));
	if (config.sources.webwatch.enabled) sources.push(webwatchSource(ctx, config.sources.webwatch));
	if (config.sources.mail.enabled) sources.push(mailSource(ctx, config.sources.mail));
	if (config.sources.calendar.enabled) sources.push(calendarSource(ctx, config.sources.calendar));
	if (config.sources.tasks.enabled) sources.push(taskSource(ctx, config.sources.tasks));
	runtime = new Runtime(ctx, sources, {
		workspaceRoot: config.workspaceRoot,
		sourceBotId: config.sources.im.botId,
		decideModel: config.proactive.decideModel,
		decideIntervalMinutes: config.proactive.intervalMinutes,
		notify: config.notify,
		postToFeed: config.notify.postToFeed,
		notifyBudgetPerDay: config.proactive.notifyBudgetPerDay,
		notifyMinIntervalMinutes: config.proactive.notifyMinIntervalMinutes,
		notebookPath: config.notebook.path,
		briefing: config.briefing,
		worker: config.worker,
		seedLoops: config.loops
	});
	ctx.effect(() => async () => {
		await runtime.stop();
	});
	await runtime.ready;
	ctx.logger.info("mino-call ready (%d source%s)", sources.length, sources.length === 1 ? "" : "s");
}
export { Config, Loop, MATTER_STATUSES, MATTER_URGENCIES, Matter, NOTIFY_URGENCIES, ROUTER_PRESET, ROUTER_SESSION_ID, Runtime, STATUS_BLOCK_RE, SourceItem, StateRow, TASK_STATUSES, Task, WORKER_PRESET, WORKER_SESSION_PREFIX, answerTask, apply, budgetAllows, budgetSpend, callDomain, cancelTask, createTask, emptyBudget, handleWorkerOutput, heuristicUrgency, inject, judgeMatters, judgePrompt, loopCheckpointOf, name, onSessionEvent, onWorkerIdle, parseJudgeResponse, parseStatusBlock, recoverTasks, renderNotebook, sweepTaskTimeouts };
