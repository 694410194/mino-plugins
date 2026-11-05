import { z } from "zod";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { MessageId, freezeMessage } from "@deepseek-ai/dsh-llm";
import { defineDomain, domainTable } from "@deepseek-ai/dsh-storage-domain";
// src/domain.ts
/**
* The `comma` storage domain: durable entity tables behind the plugin's ports.
* Domain and table names must match UNIT_NAME_RE (`[a-z][a-z0-9_]*`).
*/
/** Attention urgency bands, mirroring Comma's `decide` output. */
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
	lastRunAt: z.number().optional(),
	checkpoint: z.string().optional()
});
/** Small singleton rows: router session id, per-source cursors, budget counters. */
const StateRow = z.object({
	key: z.string(),
	value: z.string()
});
const commaDomain = defineDomain({
	name: "comma",
	version: 1,
	tables: {
		matters: domainTable(Matter),
		source_items: domainTable(SourceItem),
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
async function judgeMatters(ctx, model, pending, signal) {
	const llm = ctx.get("llm");
	if (!llm?.stream || pending.length === 0) return void 0;
	const prompt = pending.map(({ matter, items }) => judgePrompt(matter, items)).join("\n\n");
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
		ctx.logger.warn("mino-comma decide: judge call failed, falling back to heuristics: %s", String(error));
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
/** Render the whole notebook. `items` resolves each matter's latest evidence. */
function renderNotebook(matters, items, now = Date.now()) {
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
	return [
		"# Comma Notebook",
		"",
		`Rendered ${stamp(now)} · ${open.length} open · ${done.length} recently done`,
		"",
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
	const candidates = dshim?.listBots !== void 0 ? await dshim.listBots() : void 0;
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
	return [
		{
			name: "comma_matters",
			description: "List companion matters grouped from incoming sources. Use to answer \"what is pending\" and to find a matter id before calling comma_matter_done or comma_matter_snooze.",
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
			name: "comma_matter_done",
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
			name: "comma_matter_snooze",
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
			name: "comma_im_pair",
			description: "Show or choose which IM bot comma watches. Without arguments returns the current pairing and the candidates from dshIm.listBots; pass a candidate botId to select it. Takes effect on the next source retry (~15s) for an unpaired source.",
			schema: z.object({ botId: z.string().min(1).optional() }),
			async execute(args) {
				const state = domain().table("state");
				const current = state.get("selected_bot")?.value ?? null;
				const dshim = host.ctx.get("dshIm");
				const candidates = dshim?.listBots !== void 0 ? await dshim.listBots() : [];
				if (args.botId === void 0) return {
					paired: current,
					candidates,
					hint: candidates.length ? "call again with botId to select one" : "no IM bot is configured in mino-im yet"
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
}
// src/runtime.ts
/** The mino-comma runtime: owns the storage domain, the router Session, source fibers, and the attention loop. */
const ROUTER_SESSION_ID = "comma-router";
const ROUTER_PRESET = "mino-comma-router";
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
	async start(sources) {
		this.domain = await this.ctx.storageDomain.open(commaDomain);
		const workspace = await this.ctx.workspaceRegistry.create(this.options.workspaceRoot ?? process.cwd());
		if ("error" in await this.ctx.sessionController.resolveAgent("comma-router")) {
			await this.ctx.sessionController.create({
				sessionId: ROUTER_SESSION_ID,
				workspaceId: workspace.id,
				agentPreset: ROUTER_PRESET
			});
			this.ctx.logger.info("mino-comma router session created: %s", ROUTER_SESSION_ID);
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
		const signal = this.controller.signal;
		this.fibers = [
			...sources.map((source) => source.run(this, signal).catch((error) => {
				if (!signal.aborted) this.ctx.logger.error("mino-comma source %s exited: %s", source.kind, String(error));
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
				if (!signal.aborted) this.logger.warn("mino-comma tick failed: %s", String(error));
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
			this.logger.warn("mino-comma: router session unavailable, message dropped");
			return;
		}
		const message = freezeMessage({
			id: MessageId(`mino-comma:${crypto.randomUUID()}`),
			role: "user",
			content: [{
				type: "text",
				text
			}],
			source: { kind: "mino-comma" }
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
		const text = status === "unavailable" ? "[comma pairing] 还没有接入消息渠道（mino-im 未安装或没有可用 bot）。如果你想让我帮你盯消息，请提醒用户先装好并配好 IM 渠道，然后用 comma_im_pair 工具完成接管。" : status === "none" ? "[comma pairing] IM 渠道已就绪但还没有可接管的 bot。请在 mino-im 里配好一个 bot（external-consumer 模式），然后用 comma_im_pair 完成接管。" : `[comma pairing] 检测到多个可接管的 IM 账号：${candidates.join("、")}。请询问用户想让你盯哪一个，然后用 comma_im_pair 工具完成配对。`;
		await this.routerMessage(text);
	}
	/** Attach the router tool surface to the materialized router agent; idempotent per agent id. */
	decorateRouter(agent) {
		if (agent.id !== "comma-router" || this.mountedTools.has(agent.id)) return;
		this.mountedTools.set(agent.id, registerRouterTools(agent.ctx, {
			ctx: this.ctx,
			domain: () => this.domain,
			ready: () => this.ready,
			onChanged: () => this.scheduleRender()
		}));
	}
	/** Forget a disposed router agent; its scoped registrations rolled back with the agent ctx. */
	dropRouter(agent) {
		this.mountedTools.delete(agent.id);
	}
	async notifyIm(text) {
		const resolution = await resolveNotifyTarget(this.ctx, this.domain, this.options.notify, this.sourceBotId);
		if (resolution.kind !== "resolved") return;
		const dshim = this.ctx.get("dshIm");
		if (!dshim?.send) return;
		try {
			await dshim.send(resolution.botId, resolution.targetId, text);
		} catch (error) {
			this.logger.warn("mino-comma: im notify failed: %s", String(error));
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
		const judged = this.options.decideModel ? await judgeMatters(this.ctx, this.options.decideModel, pending, this.controller.signal) : void 0;
		const budgetRow = state.get(BUDGET_KEY);
		let budget = budgetRow ? {
			...emptyBudget(),
			...JSON.parse(budgetRow.value)
		} : emptyBudget();
		let budgetChanged = false;
		const deliver = async (matter, items) => {
			if (!budgetAllows(budget, now, this.options.notifyBudgetPerDay, this.options.notifyMinIntervalMinutes)) return void 0;
			const latest = items.slice(-3).map((i) => `- ${i.summary}`).join("\n");
			const text = `[comma ${matter.urgency}] ${matter.title}${latest ? `\n${latest}` : ""}`;
			await this.routerMessage(text);
			await this.notifyIm(text);
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
			const urgency = j?.urgency ?? heuristicUrgency(matter, items);
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
	/** Fire due loops into the router session and run the daily briefing check. */
	async loopTick() {
		const loops = this.domain.table("loops");
		const now = Date.now();
		for (const [key, loop] of loops.entries()) {
			if (!loop.enabled || now - (loop.lastRunAt ?? 0) < Math.max(loop.everyMinutes, 5) * 6e4) continue;
			await this.routerMessage(`[comma loop:${loop.name}] ${loop.prompt}`);
			await loops.update(key, (l) => ({
				...l,
				lastRunAt: now
			}));
		}
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
		await this.notifyIm(`Comma 简报: ${open.length} 项待处理，其中 ${needs} 项需要你。`);
		await this.routerMessage(`[comma briefing] 今日待处理 ${open.length} 项（需要你 ${needs} 项）。Notebook 已刷新。`);
	}
	scheduleRender() {
		this.notebookDirty = true;
		if (this.renderTimer !== void 0) return;
		this.renderTimer = setTimeout(() => {
			this.renderTimer = void 0;
			this.renderNotebook().catch((error) => this.logger.warn("mino-comma notebook render failed: %s", String(error)));
		}, RENDER_DEBOUNCE_MS);
	}
	async renderNotebook() {
		const matters = [...this.domain.table("matters").entries()].map(([, m]) => m);
		const items = new Map([...this.domain.table("source_items").entries()].map(([k, i]) => [i.id, i]));
		const path = this.options.notebookPath ?? join(this.options.workspaceRoot ?? process.cwd(), "Comma", "Notebook.md");
		await mkdir(dirname(path), { recursive: true });
		await writeFile(path, renderNotebook(matters, items));
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
const RETRY_MS = 15e3;
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
const pause = (ms, signal) => new Promise((resolve) => {
	if (signal.aborted) return resolve();
	const timer = setTimeout(resolve, ms);
	signal.addEventListener("abort", () => {
		clearTimeout(timer);
		resolve();
	}, { once: true });
});
/** Group key: a DM is one thread; a group message groups under its root when present. */
const groupKeyOf = (event) => event.conversation.kind === "dm" ? `im:${event.conversation.id}` : `im:${event.conversation.id}:${event.reply.rootId ?? event.messageId}`;
/** Requires mino-im with the account in external-consumer exclusive mode. */
function imSource(ctx, config, resolveBot) {
	return {
		kind: "im",
		async run(host, signal) {
			while (!signal.aborted) {
				const dshim = ctx.get("dshIm");
				if (!dshim?.consumeInbound) {
					host.logger.info("mino-comma im: mino-im not installed; retrying");
					await host.pairingStatus("unavailable");
					await pause(RETRY_MS, signal);
					continue;
				}
				const resolution = await resolveBot();
				if (resolution.kind === "none") {
					host.logger.info("mino-comma im: no bot to consume; retrying");
					await host.pairingStatus("none");
					await pause(RETRY_MS, signal);
					continue;
				}
				if (resolution.kind === "ambiguous") {
					host.logger.warn("mino-comma im: multiple bots (%s); set sources.im.botId", resolution.candidates.join(", "));
					await host.pairingStatus("ambiguous", resolution.candidates);
					await pause(RETRY_MS, signal);
					continue;
				}
				const botId = resolution.botId;
				if (resolution.origin === "auto") host.logger.info("mino-comma im: auto-paired bot %s", botId);
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
								host.logger.warn("mino-comma im: dropped inbound event: %s", String(error));
							}
							return { accepted: true };
						}
					});
					host.logger.info("mino-comma im: consuming bot %s", botId);
					await new Promise((resolve) => {
						if (signal.aborted) return resolve();
						signal.addEventListener("abort", () => resolve(), { once: true });
					});
					release();
				} catch (error) {
					if (signal.aborted) return;
					host.logger.warn("mino-comma im: consumer error, retrying: %s", String(error));
					await pause(RETRY_MS, signal);
				}
			}
		}
	};
}
// src/index.ts
const name = "mino-comma";
const inject = [
	"storageDomain",
	"sessionController",
	"workspaceRegistry"
];
const Config = z.object({
	/** Directory the router Workspace owns; defaults to the profile's working directory. */
	workspaceRoot: z.string().optional(),
	sources: z.object({ im: z.object({
		/** Explicit off switch; when on, an empty botId auto-pairs through listBots(). */
		enabled: z.boolean().default(true),
		/** mino-im bot id in external-consumer exclusive mode; empty resolves config→state→listBots. */
		botId: z.string().default("")
	}).prefault({}) }).prefault({}),
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
		/** mino-im bot + saved delivery target for proactive pushes; both empty disables pushes. */
		botId: z.string().default(""),
		targetId: z.string().default("")
	}).prefault({}),
	notebook: z.object({ 
	/** Rendered notebook path; defaults to <workspaceRoot>/Comma/Notebook.md. */
path: z.string().optional() }).prefault({}),
	briefing: z.object({
		/** Daily briefing push + router note at `hour` (local, 0-23). */
		enabled: z.boolean().default(true),
		hour: z.number().int().min(0).max(23).default(9)
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
	runtime = new Runtime(ctx, sources, {
		workspaceRoot: config.workspaceRoot,
		sourceBotId: config.sources.im.botId,
		decideModel: config.proactive.decideModel,
		decideIntervalMinutes: config.proactive.intervalMinutes,
		notify: config.notify,
		notifyBudgetPerDay: config.proactive.notifyBudgetPerDay,
		notifyMinIntervalMinutes: config.proactive.notifyMinIntervalMinutes,
		notebookPath: config.notebook.path,
		briefing: config.briefing,
		seedLoops: config.loops
	});
	ctx.effect(() => async () => {
		await runtime.stop();
	});
	await runtime.ready;
	ctx.logger.info("mino-comma ready (%d source%s)", sources.length, sources.length === 1 ? "" : "s");
}
export { Config, Loop, MATTER_STATUSES, MATTER_URGENCIES, Matter, NOTIFY_URGENCIES, ROUTER_PRESET, ROUTER_SESSION_ID, Runtime, SourceItem, StateRow, apply, budgetAllows, budgetSpend, commaDomain, emptyBudget, heuristicUrgency, inject, judgeMatters, judgePrompt, name, parseJudgeResponse, renderNotebook };
