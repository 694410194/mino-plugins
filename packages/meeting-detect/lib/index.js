import { z } from "zod";
import { defineDomain, domainTable } from "@deepseek-ai/dsh-storage-domain";
// src/domain.ts
/** meeting-detect storage domain: singleton state rows + reminded-event tombstones. */
const StateRow = z.object({
	key: z.string(),
	value: z.string()
});
const meetingDomain = defineDomain({
	name: "meeting_detect",
	version: 1,
	tables: { state: domainTable(StateRow) }
});
// src/index.ts
const name = "mino-meeting-detect";
const inject = [
	"storageDomain",
	"sessionController",
	"workspaceRegistry"
];
const Config = z.object({
	workspaceRoot: z.string().optional(),
	/** Poll interval in minutes. */
	pollMinutes: z.number().min(1).default(5),
	/** Meetings starting within this many minutes count as upcoming. */
	leadMinutes: z.number().min(1).default(15),
	/** cal_upcoming lookahead days. */
	lookaheadDays: z.number().min(1).max(30).default(2)
}).prefault({});
const SESSION_ID = "mino-meeting-detect";
const PRESET_ID = "mino-meeting-detect";
const SESSION_TITLE = "会议提醒";
const TITLE_KEY = "title";
/** '2026-11-19 09:30'（本地时区）→ epoch ms；解析失败返回 undefined。 */
function parseLocal(dt) {
	const ms = Date.parse(dt.replace(" ", "T"));
	return Number.isNaN(ms) ? void 0 : ms;
}
const pause = (ms, signal) => new Promise((resolve) => {
	if (signal.aborted) return resolve();
	const timer = setTimeout(resolve, ms);
	signal.addEventListener("abort", () => {
		clearTimeout(timer);
		resolve();
	}, { once: true });
});
async function apply(ctx, config) {
	const logger = ctx.logger("mino-meeting-detect");
	const state = (await ctx.storageDomain.open(meetingDomain)).table("state");
	const workspace = await ctx.workspaceRegistry.create(config.workspaceRoot ?? process.cwd());
	if (!(await ctx.sessionController.list({}, new AbortController().signal)).items.some((item) => item.sessionId === SESSION_ID)) try {
		await ctx.sessionController.create({
			sessionId: SESSION_ID,
			workspaceId: workspace.id,
			agentPreset: PRESET_ID
		});
		logger.info("meeting session created: %s", SESSION_ID);
	} catch (error) {
		logger.warn("meeting session reuse: %s", error instanceof Error ? error.message : String(error));
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
	const controller = new AbortController();
	ctx.effect(() => () => {
		controller.abort();
	});
	const remind = async (ev, startMs) => {
		const dedupKey = `reminded:${ev.dtstart}|${ev.summary}`;
		if (state.get(dedupKey) !== void 0) return;
		const now = Date.now();
		const remindAt = Math.max(now + 1e4, startMs - config.leadMinutes * 6e4);
		const timing = remindAt <= now + 3e4 ? {
			kind: "after",
			after_seconds: 10
		} : {
			kind: "at",
			at: new Date(remindAt).toISOString()
		};
		if (!schedule) {
			logger.warn("host schedule service unavailable — meeting reminder skipped");
			return;
		}
		const created = await schedule.create({
			title: `会议提醒：${ev.summary}`.slice(0, 120),
			prompt: `会议「${ev.summary}」${ev.dtstart}${ev.location ? ` 在 ${ev.location}` : ""} 即将开始（约 ${config.leadMinutes} 分钟后）。按你的人格指引问用户要不要录音记笔记。`,
			timing,
			target: {
				kind: "session",
				sessionId: SESSION_ID
			}
		});
		await state.put(dedupKey, {
			key: dedupKey,
			value: created.id
		});
		logger.info("meeting reminder scheduled: %s at %s", ev.summary, ev.dtstart);
	};
	const poll = async () => {
		const tools = ctx.get("tools");
		if (!tools?.execute) return;
		try {
			const { results } = await tools.execute({
				calls: [{
					type: "tool-call",
					id: "mino-meeting-detect-upcoming",
					name: "cal_upcoming",
					arguments: JSON.stringify({ days: config.lookaheadDays })
				}],
				signal: controller.signal
			});
			const res = results[0]?.result;
			if (!res || res.isError) return;
			const events = res.value?.events ?? [];
			const now = Date.now();
			for (const ev of events) {
				const startMs = parseLocal(ev.dtstart);
				if (startMs === void 0 || startMs <= now) continue;
				await remind(ev, startMs);
			}
		} catch (error) {
			logger.info("meeting-detect poll failed, will retry: %s", String(error));
		}
	};
	(async () => {
		while (!controller.signal.aborted) {
			await poll();
			await pause(config.pollMinutes * 6e4, controller.signal);
		}
	})();
}
export { Config, apply, inject, name };
