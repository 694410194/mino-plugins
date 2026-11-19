import { z } from "zod";
import { defineDomain, domainTable } from "@deepseek-ai/dsh-storage-domain";
// src/domain.ts
/**
* The `brief` storage domain: singleton state rows (session id, schedule ids,
* user-deletion tombstones). Names must match `[a-z][a-z0-9_]*`.
*/
/** Small singleton row: `schedule:morning` → schedule id, `gone:morning` → '1'. */
const StateRow = z.object({
	key: z.string(),
	value: z.string()
});
const briefDomain = defineDomain({
	name: "brief",
	version: 1,
	tables: { state: domainTable(StateRow) }
});
// src/index.ts
const name = "mino-brief";
const inject = [
	"storageDomain",
	"sessionController",
	"workspaceRegistry",
	"webServer",
	"schedule"
];
const TIME_RE = /^\d{2}:\d{2}(:\d{2}(\.\d{1,3})?)?$/;
const Config = z.object({
	/** Directory the brief Workspace owns; defaults to the profile's working directory. */
	workspaceRoot: z.string().optional(),
	/** IANA zone the daily entries fire in. */
	timeZone: z.string().default("Asia/Shanghai"),
	/** Morning brief entry; `HH:mm` or `HH:mm:ss` local. */
	morning: z.object({
		enabled: z.boolean().default(true),
		time: z.string().regex(TIME_RE).default("08:00"),
		prompt: z.string().default("生成今日早报：面向今天这一天——今天的日程线索、昨晚以来值得留意的变化、未完成事项的跟进提醒。产出用 today_post 投到今日页：batch=今日早报，batchKind=morning_brief。")
	}).prefault({}),
	/** Evening brief entry. */
	evening: z.object({
		enabled: z.boolean().default(true),
		time: z.string().regex(TIME_RE).default("21:00"),
		prompt: z.string().default("生成今日晚报：回顾这一天——今天完成和发生的事、明天要接续的线索。产出用 today_post 投到今日页：batch=今日晚报，batchKind=evening_brief。")
	}).prefault({})
}).prefault({});
const SESSION_ID = "mino-brief";
const PRESET_ID = "mino-brief";
const SESSION_TITLE = "简报";
const TITLE_KEY = "title";
const JSON_HEADERS = {
	"content-type": "application/json; charset=utf-8",
	"cache-control": "no-store"
};
const MAX_PREF = 600;
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
/** 偏好状态行键：`pref:morning`/`pref:evening` → 用户写的内容偏好文本。 */
const prefKey = (slot) => `pref:${slot}`;
/** 基础 prompt 合并偏好：重建定时条目时用这个全文。 */
const mergedPrompt = (spec, preference) => spec.prompt + (preference.trim() ? `\n\n她的内容偏好：${preference.trim()}` : "");
/** 条目记录里的 HH:mm:ss(.SSS) → 显示用 HH:mm。 */
const displayTime = (t) => t && /^\d{2}:\d{2}/.test(t) ? t.slice(0, 5) : "";
async function apply(ctx, config) {
	const logger = ctx.logger("mino-brief");
	const state = (await ctx.storageDomain.open(briefDomain)).table("state");
	const workspace = await ctx.workspaceRegistry.create(config.workspaceRoot ?? process.cwd());
	if (!(await ctx.sessionController.list({}, new AbortController().signal)).items.some((item) => item.sessionId === SESSION_ID)) try {
		await ctx.sessionController.create({
			sessionId: SESSION_ID,
			workspaceId: workspace.id,
			agentPreset: PRESET_ID
		});
		logger.info("brief session created: %s", SESSION_ID);
	} catch (error) {
		logger.warn("brief session reuse: %s", error instanceof Error ? error.message : String(error));
	}
	const resolved = await ctx.sessionController.resolveAgent(SESSION_ID);
	if (!("error" in resolved) && state.get(TITLE_KEY) === void 0) {
		resolved.agent.session.append("session/title", {
			title: SESSION_TITLE,
			messageSeqs: [],
			source: { kind: "user" }
		});
		await state.put(TITLE_KEY, {
			key: TITLE_KEY,
			value: "1"
		});
	}
	const schedule = ctx.get("schedule");
	if (!schedule) {
		logger.warn("host schedule service unavailable — brief slots not registered");
		return;
	}
	const webServer = ctx.get("webServer");
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
	const catalog = await schedule.catalog();
	const byId = new Map(catalog.map((entry) => [entry.id, entry]));
	for (const spec of slotSpecs(config)) {
		const idKey = `schedule:${spec.slot}`;
		const goneKey = `gone:${spec.slot}`;
		const storedId = state.get(idKey)?.value;
		if (storedId === void 0 ? void 0 : byId.get(storedId)) continue;
		if (storedId !== void 0) {
			await state.put(goneKey, {
				key: goneKey,
				value: "1"
			});
			continue;
		}
		if (state.get(goneKey) !== void 0 || !spec.enabled) continue;
		const adopted = catalog.find((entry) => entry.title === spec.title);
		if (adopted) {
			await state.put(idKey, {
				key: idKey,
				value: adopted.id
			});
			continue;
		}
		const created = await schedule.create({
			title: spec.title,
			prompt: mergedPrompt(spec, state.get(prefKey(spec.slot))?.value ?? ""),
			timing: {
				kind: "daily",
				daily: {
					time: normalizeTime(spec.time),
					time_zone: config.timeZone
				}
			},
			target: {
				kind: "session",
				sessionId: SESSION_ID
			}
		});
		await state.put(idKey, {
			key: idKey,
			value: created.id
		});
		logger.info("brief schedule created: %s at %s %s", spec.title, spec.time, config.timeZone);
	}
	/** 早晚报编辑器（Today briefEditor 语义）：读 = 各槽的偏好/开关/时间；写 = 偏好与改时重建条目、开关走 edit。 */
	route("/mino-brief/api/prefs", async (req, res) => {
		const specs = slotSpecs(config);
		const sched = schedule;
		const entries = sched ? await sched.catalog() : [];
		const entryOf = (slot) => {
			const id = state.get(`schedule:${slot}`)?.value;
			return id === void 0 ? void 0 : entries.find((e) => e.id === id);
		};
		if (req.method !== "POST") {
			sendJson(res, 200, {
				ok: true,
				slots: specs.map((spec) => {
					const entry = entryOf(spec.slot);
					return {
						slot: spec.slot,
						title: spec.title,
						enabled: entry ? entry.status === "active" : false,
						hasEntry: !!entry,
						time: displayTime(entry?.time) || spec.time.slice(0, 5),
						preference: state.get(prefKey(spec.slot))?.value ?? ""
					};
				})
			});
			return;
		}
		const body = await readBody(req);
		const spec = specs.find((s) => s.slot === body.slot);
		if (!spec || !sched) return sendJson(res, 400, {
			ok: false,
			error: "没这个槽位或调度服务缺席"
		});
		const idKey = `schedule:${spec.slot}`;
		const entry = entryOf(spec.slot);
		if (typeof body.enabled === "boolean" && entry && entry.status === "active" !== body.enabled) await sched.edit({
			id: entry.id,
			action: "update",
			patch: { active: body.enabled }
		});
		const pref = typeof body.preference === "string" ? body.preference.slice(0, MAX_PREF).trim() : void 0;
		const time = typeof body.time === "string" && TIME_RE.test(body.time) ? body.time.slice(0, 5) : void 0;
		const storedPref = state.get(prefKey(spec.slot))?.value ?? "";
		const prefChanged = pref !== void 0 && pref !== storedPref;
		const timeChanged = time !== void 0 && time !== displayTime(entry?.time);
		if (prefChanged) await state.put(prefKey(spec.slot), {
			key: prefKey(spec.slot),
			value: pref ?? ""
		});
		if (entry && (prefChanged || timeChanged)) await sched.edit({
			id: entry.id,
			action: "delete"
		});
		if (prefChanged || timeChanged || body.enabled === true && !entry) {
			const created = await sched.create({
				title: spec.title,
				prompt: mergedPrompt(spec, pref ?? storedPref),
				timing: {
					kind: "daily",
					daily: {
						time: normalizeTime(time ?? displayTime(entry?.time) ?? spec.time),
						time_zone: config.timeZone
					}
				},
				target: {
					kind: "session",
					sessionId: SESSION_ID
				}
			});
			await state.put(idKey, {
				key: idKey,
				value: created.id
			});
			if (state.get(`gone:${spec.slot}`) !== void 0) await state.delete(`gone:${spec.slot}`).catch(() => {});
		}
		sendJson(res, 200, { ok: true });
	});
}
function slotSpecs(config) {
	return [{
		slot: "morning",
		title: "Mino 早报",
		...config.morning
	}, {
		slot: "evening",
		title: "Mino 晚报",
		...config.evening
	}];
}
/** `HH:mm` → `HH:mm:00`; `HH:mm:ss(.SSS)` passes through. */
function normalizeTime(time) {
	return time.length === 5 ? `${time}:00` : time;
}
export { Config, apply, inject, name };
