import "@deepseek-ai/dsh-home-paths";
import "@deepseek-ai/dsh-llm";
//#region packages/util/token-monitor-contract/src/billing-rule-resolution.ts
const OFFICIAL_PROVIDER_ID = "deepseek-official";
const OFFICIAL_PROVIDER_IDS = [OFFICIAL_PROVIDER_ID, "deepseek-account"];
/** Known official billing identities; never infer identity from a model name. */
function isOfficialProvider(provider) {
	return OFFICIAL_PROVIDER_IDS.includes(provider);
}
//#endregion
//#region plugins/dsh-token-monitor/src/pricing.ts
/** 两个 provider 是否属于同一计费族（官方 API key 路由与账号路由同族）。
* @param left - 调用方给出的 provider；缺省或空串表示不按 provider 过滤。
* @param right - 记录自身携带的 provider。
* @returns 是否按同族对待。
*/
function sameProviderFamily(left, right) {
	if (left === null || left === void 0 || left === "") return true;
	return left === right || isOfficialProvider(left) && isOfficialProvider(right);
}
/** 展示用的稳定 provider id：官方族成员统一落到 OFFICIAL_PROVIDER_ID。
* @param provider - 记录或规则里携带的 provider。
* @returns 同族统一后的展示 id。
*/
function displayProviderId(provider) {
	return isOfficialProvider(provider) ? OFFICIAL_PROVIDER_ID : provider;
}
//#endregion
//#region plugins/dsh-token-monitor/src/http-trust.ts
function connectionOf(ctx) {
	try {
		return Reflect.get(ctx, "connection");
	} catch {
		return;
	}
}
/**
* Build the guard for routes registered by one context.
* @param ctx Context owning the routes; must expose the composition's connection.
* @returns Guard returning true when the caller may proceed.
*/
function createRouteGuard(ctx) {
	return (request, response) => {
		const connection = connectionOf(ctx);
		const rejection = connection === void 0 ? 403 : connection.requestRejection(request);
		if (rejection === void 0) return true;
		response.writeHead(rejection, {
			"Cache-Control": "no-store",
			"Content-Type": "text/plain; charset=utf-8"
		});
		response.end(rejection === 401 ? "unauthorized" : "forbidden");
		return false;
	};
}
//#endregion
//#region plugins/dsh-token-monitor/src/detail-query.ts
/** Freeze query membership while the user pages through incoming request history. */
var DetailQueries = class {
	ledger;
	store;
	snapshots = /* @__PURE__ */ new Map();
	generation = 0;
	constructor(ledger, store, _table) {
		this.ledger = ledger;
		this.store = store;
	}
	/** Query one bounded page; reject invalid time bounds and expired snapshots. */
	query(p, now = Date.now()) {
		const size = Number(p.get("size") ?? 20), page = Number(p.get("page") ?? 1), tab = p.get("tab") ?? "usage", range = p.get("range") ?? "today";
		if (![
			20,
			50,
			100
		].includes(size) || !Number.isSafeInteger(page) || page < 1 || !["usage", "errors"].includes(tab) || ![
			"all",
			"30d",
			"7d",
			"yesterday",
			"today",
			"custom"
		].includes(range)) throw new Error("INVALID_QUERY");
		let token = p.get("snapshot") ?? "", snapshot = this.snapshots.get(token);
		if (token && (!snapshot || now - snapshot.at > 18e5)) throw new Error("SNAPSHOT_EXPIRED");
		if (!snapshot) {
			const merged = /* @__PURE__ */ new Map();
			this.ledger.history().forEach((record, index) => {
				const id = record.sourceEventSeq === void 0 ? "legacy:" + index : record.sessionId + ":" + record.sourceEventSeq;
				const telemetry = this.store.attempts.get(id);
				const row = publicAttempt({
					...telemetry,
					...record,
					id,
					status: telemetry?.status ?? "success"
				});
				row.feeExplanation = {
					...record.billingRule ? { rule: structuredClone(record.billingRule) } : {},
					...record.billingApplied ? { applied: structuredClone(record.billingApplied) } : {},
					...record.billingReason ? { reason: record.billingReason } : {},
					costInput: record.costInput,
					costOutput: record.costOutput,
					...record.cacheBreakdownRecorded === false ? {} : {
						costCacheRead: record.costCacheRead,
						costCacheWrite: record.costCacheWrite
					}
				};
				merged.set(id, row);
			});
			for (const row of this.store.attempts.values()) if (!merged.has(row.id)) merged.set(row.id, row);
			snapshot = {
				at: now,
				sessions: [...this.store.sessions.values()],
				rows: [...merged.values()].sort((a, b) => b.timestamp - a.timestamp || b.id.localeCompare(a.id))
			};
			token = now + ":" + ++this.generation;
			if (this.snapshots.size >= 8) this.snapshots.delete(this.snapshots.keys().next().value);
			this.snapshots.set(token, snapshot);
		}
		const midnight = Math.floor((snapshot.at + 288e5) / 864e5) * 864e5 - 288e5;
		let from = range === "all" ? 0 : midnight - (range === "7d" ? 6 : range === "30d" ? 29 : 0) * 864e5, to = snapshot.at;
		if (range === "yesterday") {
			from = midnight - 864e5;
			to = midnight - 1;
		}
		if (range === "custom") {
			from = Number(p.get("from"));
			to = Number(p.get("to"));
			if (!p.has("from") || !p.has("to") || !Number.isFinite(from) || !Number.isFinite(to) || from < 0 || to < from) throw new Error("INVALID_TIME");
		}
		const sessions = new Map(snapshot.sessions.map((s) => [s.id, s])), session = p.get("session");
		const belongs = (id) => {
			const visited = /* @__PURE__ */ new Set();
			while (id && !visited.has(id)) {
				if (id === session) return true;
				visited.add(id);
				id = sessions.get(id)?.parent ?? "";
			}
			return false;
		};
		const rows = snapshot.rows.filter((row) => row.timestamp >= from && row.timestamp <= to && sameProviderFamily(p.get("provider"), row.provider) && (tab === "usage" ? row.status === "success" : row.status === "error" || p.get("cancelled") === "true" && row.status === "cancelled") && (!p.get("model") || row.model === p.get("model")) && (!p.get("project") || sessions.get(row.sessionId)?.project === p.get("project")) && (!p.get("sessionText") || ((sessions.get(row.sessionId)?.title ?? "") + " " + row.sessionId).toLowerCase().includes(p.get("sessionText").toLowerCase())) && (!session || belongs(row.sessionId)) && (tab === "usage" || !p.get("errorType") || (row.errorType ?? "unknown") === p.get("errorType")));
		const pages = Math.max(1, Math.ceil(rows.length / size)), actual = Math.min(page, pages);
		return {
			snapshot: token,
			capturedAt: snapshot.at,
			rows: rows.slice((actual - 1) * size, actual * size),
			total: rows.length,
			page: actual,
			pages,
			size,
			sessions: snapshot.sessions,
			models: [...new Set(snapshot.rows.filter((r) => sameProviderFamily(p.get("provider"), r.provider)).map((r) => r.model))].sort(),
			providers: [...new Set(snapshot.rows.map((r) => displayProviderId(r.provider)))].sort()
		};
	}
};
//#endregion
//#region plugins/dsh-token-monitor/src/details.ts
/** Load titles on demand once per persisted revision, only for recorded sessions. */
function createMetadataLoader(ctx, store, ids) {
	const revisions = /* @__PURE__ */ new Map();
	let pending;
	let active = true;
	ctx.effect(() => async () => {
		active = false;
		await pending;
	}, "token-monitor: metadata loading");
	return () => {
		if (!active) return Promise.resolve();
		return pending ??= (async () => {
			const persistence = ctx.get("sessionPersistence", false);
			if (!persistence) return;
			const listed = await persistence.list(), wanted = new Set(ids());
			for (let changed = true; changed;) {
				changed = false;
				for (const { header } of listed) if (wanted.has(header.id) && header.origin === "subagent" && header.parentSession && !wanted.has(header.parentSession)) {
					wanted.add(header.parentSession);
					changed = true;
				}
			}
			for (const { header, revision } of listed) {
				if (!active) return;
				if (!wanted.has(header.id) || revisions.get(header.id) === revision) continue;
				let title = store.sessions.get(header.id)?.title ?? header.id;
				try {
					const handle = await persistence.open(header.id, "read");
					try {
						const { events } = await handle.read(handle.inheritedEventCount);
						const latest = events.findLast((event) => event.type === "session/title");
						if (latest?.type === "session/title") title = latest.data.title.slice(0, 300);
						revisions.set(header.id, revision);
					} finally {
						await handle.close();
					}
				} catch {}
				if (active) store.remember({
					id: header.id,
					title,
					project: header.cwd ?? "",
					child: header.origin === "subagent",
					parent: header.origin === "subagent" ? header.parentSession : void 0
				});
			}
		})().finally(() => {
			pending = void 0;
		});
	};
}
/** Select only product-visible fields from durable rows, excluding unknown historical fields. */
function publicAttempt(v) {
	return {
		id: v.id,
		sessionId: v.sessionId,
		sourceEventSeq: v.sourceEventSeq,
		timestamp: v.timestamp,
		provider: v.provider,
		model: v.model,
		status: v.status,
		startedAt: v.startedAt,
		endedAt: v.endedAt,
		firstMs: v.firstMs,
		totalMs: v.totalMs,
		inputTokens: v.inputTokens,
		outputTokens: v.outputTokens,
		cacheReadTokens: v.cacheReadTokens,
		cacheWriteTokens: v.cacheWriteTokens,
		cost: v.cost,
		peak: v.peak,
		billingStatus: v.billingStatus,
		billingRuleVersion: v.billingRuleVersion,
		modelMultiplier: v.modelMultiplier,
		reasoningTokens: v.reasoningTokens,
		reasoningEffort: v.reasoningEffort,
		httpStatus: v.httpStatus,
		errorType: v.errorType === void 0 ? void 0 : [
			"rate_limit",
			"authentication",
			"server",
			"timeout",
			"network",
			"unknown"
		].includes(v.errorType) ? v.errorType : "unknown"
	};
}
/** Register the details endpoint for the lifetime of the web plugin. */
function registerDetailsRoute(ctx, queries, prepare = async () => {}) {
	const guard = createRouteGuard(ctx);
	ctx.effect(() => ctx.webServer.register({
		kind: "exact",
		path: "/api/token-monitor/details",
		handler: async (req, res) => {
			if (!guard(req, res)) return;
			if (req.method !== "GET") {
				res.writeHead(405);
				res.end();
				return;
			}
			try {
				const params = new URL(req.url ?? "/", "http://localhost").searchParams;
				if (!params.get("snapshot")) await prepare();
				const result = queries.query(params);
				res.writeHead(200, {
					"Content-Type": "application/json",
					"Cache-Control": "no-store"
				});
				res.end(JSON.stringify(result));
			} catch (error) {
				const code = error instanceof Error && [
					"INVALID_QUERY",
					"INVALID_TIME",
					"SNAPSHOT_EXPIRED"
				].includes(error.message) ? error.message : "DETAILS_UNAVAILABLE";
				res.writeHead(code === "SNAPSHOT_EXPIRED" ? 409 : 400, {
					"Content-Type": "application/json",
					"Cache-Control": "no-store"
				});
				res.end(JSON.stringify({ error: code }));
			}
		}
	}), "dsh-token-monitor: details");
}
/** Register the lightweight latest-request snapshot used by the balance widget. */
function registerOverviewRoute(ctx, store, prepare = async () => {}) {
	const guard = createRouteGuard(ctx);
	const handler = async (req, res) => {
		if (!guard(req, res)) return;
		if (req.method !== "GET") {
			res.writeHead(405);
			res.end();
			return;
		}
		await prepare();
		const params = new URL(req.url ?? "/", "http://localhost").searchParams;
		const sessionId = params.get("sessionId") || void 0;
		const provider = params.get("provider") || void 0;
		const model = params.get("model") || void 0;
		const scoped = sessionId !== void 0 || provider !== void 0 || model !== void 0;
		const row = store.latestSuccessful(scoped ? {
			...sessionId === void 0 ? {} : { sessionId },
			...provider === void 0 ? {} : { provider },
			...model === void 0 ? {} : { model }
		} : void 0);
		res.writeHead(200, {
			"Content-Type": "application/json",
			"Cache-Control": "no-store"
		});
		res.end(JSON.stringify(row === void 0 ? null : {
			timestamp: row.timestamp,
			sessionId: row.sessionId,
			provider: row.provider,
			inputTokens: row.inputTokens ?? null,
			outputTokens: row.outputTokens ?? null,
			cacheReadTokens: row.cacheReadTokens ?? null,
			firstMs: row.firstMs ?? null,
			totalMs: row.totalMs ?? null,
			model: row.model
		}));
	};
	ctx.effect(() => ctx.webServer.register({
		kind: "exact",
		path: "/api/token-monitor/overview",
		handler
	}), "dsh-token-monitor: overview");
	return handler;
}
//#endregion
//#region plugins/dsh-token-monitor/src/usage-summary.ts
/** Aggregate all usage identities; historical prices only contribute to monetary metrics. */
const BEIJING_DATE_FORMATTER = new Intl.DateTimeFormat("en-CA", {
	timeZone: "Asia/Shanghai",
	year: "numeric",
	month: "2-digit",
	day: "2-digit"
});
function beijingDate(timestamp) {
	if (!Number.isFinite(timestamp)) return void 0;
	const parts = BEIJING_DATE_FORMATTER.formatToParts(timestamp);
	const values = Object.fromEntries(parts.filter((part) => part.type !== "literal").map((part) => [part.type, part.value]));
	if (typeof values.year !== "string" || typeof values.month !== "string" || typeof values.day !== "string") return void 0;
	return `${values.year}-${values.month}-${values.day}`;
}
function beijingToday(timestamp) {
	return beijingDate(timestamp) ?? "1970-01-01";
}
function addDays(date, days) {
	const [year, month, day] = date.split("-").map(Number);
	const utc = Date.UTC(year, month - 1, day + days);
	const shifted = new Date(utc);
	return `${shifted.getUTCFullYear().toString().padStart(4, "0")}-${(shifted.getUTCMonth() + 1).toString().padStart(2, "0")}-${shifted.getUTCDate().toString().padStart(2, "0")}`;
}
function isFiniteNonNegative(value) {
	return typeof value === "number" && Number.isFinite(value) && value >= 0;
}
function isValidRecord(record) {
	return Number.isFinite(record.timestamp) && isFiniteNonNegative(record.cost) && isFiniteNonNegative(record.inputTokens) && isFiniteNonNegative(record.outputTokens) && isFiniteNonNegative(record.cacheReadTokens) && isFiniteNonNegative(record.cacheWriteTokens);
}
function rangeStart(range, today) {
	if (range === "all") return null;
	if (range === "today" || range === "yesterday") return today;
	if (range === "7d") return addDays(today, -6);
	return addDays(today, -29);
}
/** A custom range is only aggregatable with finite, ordered, non-negative millisecond bounds. */
function validWindow(window) {
	if (window === void 0) return void 0;
	return Number.isFinite(window.from) && Number.isFinite(window.to) && window.from >= 0 && window.to >= window.from ? window : void 0;
}
function summarizeUsage(records, range, now = Date.now(), provider, window) {
	if (![
		"all",
		"30d",
		"7d",
		"yesterday",
		"today",
		"custom"
	].includes(range)) return void 0;
	const custom = range === "custom" ? validWindow(window) : void 0;
	if (range === "custom" && custom === void 0) return void 0;
	const to = custom !== void 0 ? beijingDate(custom.to) ?? beijingToday(now) : range === "yesterday" ? addDays(beijingToday(now), -1) : beijingToday(now);
	const from = custom !== void 0 ? beijingDate(custom.from) ?? null : rangeStart(range, to);
	const selected = records.filter((record) => {
		if (!isValidRecord(record)) return false;
		if (provider && record.provider !== provider && !(isOfficialProvider(provider) && isOfficialProvider(record.provider))) return false;
		if (custom !== void 0) return record.timestamp >= custom.from && record.timestamp <= custom.to;
		if (record.timestamp > now) return false;
		const date = beijingDate(record.timestamp);
		if (date === void 0) return false;
		return (from === null || date >= from) && date <= to;
	});
	const priced = selected.filter((record) => record.billingStatus === void 0 || record.billingStatus === "priced");
	const spendCny = priced.reduce((sum, record) => sum + record.cost, 0);
	const pricedTokens = priced.reduce((sum, record) => sum + record.inputTokens + record.cacheReadTokens + record.cacheWriteTokens + record.outputTokens, 0);
	const inputTokens = selected.reduce((sum, record) => sum + record.inputTokens, 0);
	const outputTokens = selected.reduce((sum, record) => sum + record.outputTokens, 0);
	const cacheHitTokens = selected.reduce((sum, record) => sum + record.cacheReadTokens, 0);
	const cacheWriteTokens = selected.reduce((sum, record) => sum + record.cacheWriteTokens, 0);
	const activeDays = new Set(selected.map((record) => beijingDate(record.timestamp)).filter((date) => date !== void 0)).size;
	const totalTokens = inputTokens + cacheHitTokens + cacheWriteTokens + outputTokens;
	const roundedSpend = selected.length > 0 && priced.length === 0 ? null : Math.round(spendCny * 1e6) / 1e6;
	return {
		range,
		from: selected.length === 0 ? null : from ?? beijingDate(selected.reduce((earliest, record) => Math.min(earliest, record.timestamp), Infinity)) ?? null,
		to,
		spendCny: roundedSpend,
		requestCount: selected.length,
		totalTokens,
		cacheHitTokens,
		cacheHitRate: inputTokens + cacheHitTokens > 0 ? cacheHitTokens / (inputTokens + cacheHitTokens) : 0,
		activeDays,
		costPer100mTokensCny: pricedTokens > 0 && roundedSpend !== null ? roundedSpend / pricedTokens * 1e8 : null,
		activeDaySpendCny: activeDays > 0 && roundedSpend !== null ? roundedSpend / activeDays : null
	};
}
//#endregion
//#region plugins/dsh-token-monitor/src/features/overview.ts
/** 自定义范围必须带有限且有序的毫秒边界，与使用记录列表保持同一窗口。 */
function readWindow(params) {
	if (!params.has("from") || !params.has("to")) return void 0;
	const from = Number(params.get("from")), to = Number(params.get("to"));
	return Number.isFinite(from) && Number.isFinite(to) && from >= 0 && to >= from ? {
		from,
		to
	} : void 0;
}
function apply(ctx, services) {
	const { storage, details } = services;
	const queries = new DetailQueries(storage, details, services.priceTable());
	const metadata = createMetadataLoader(ctx, details, () => [...storage.history().map((row) => row.sessionId), ...[...details.attempts.values()].map((row) => row.sessionId)]);
	ctx.inject(["webServer", "connection"], (web) => {
		const guard = createRouteGuard(web);
		registerDetailsRoute(web, queries, metadata);
		const handler = registerOverviewRoute(web, details, metadata);
		web.effect(() => {
			services.overview = handler;
			return () => {
				if (services.overview === handler) delete services.overview;
			};
		}, "token-monitor: overview lifecycle");
		web.effect(() => web.webServer.register({
			kind: "exact",
			path: "/api/token-monitor/usage",
			handler: (req, res) => {
				if (!guard(req, res)) return;
				const url = new URL(req.url ?? "/", "http://localhost");
				res.writeHead(200, {
					"Content-Type": "application/json",
					"Cache-Control": "no-store"
				});
				res.end(JSON.stringify(storage.history(url.searchParams.get("sessionId") ?? void 0)));
			}
		}), "token-monitor: usage route");
		web.effect(() => web.webServer.register({
			kind: "exact",
			path: "/api/token-monitor/usage-summary",
			handler: (req, res) => {
				if (!guard(req, res)) return;
				const url = new URL(req.url ?? "/", "http://localhost");
				const range = url.searchParams.get("range") ?? "today";
				const window = readWindow(url.searchParams);
				const valid = [
					"all",
					"30d",
					"7d",
					"yesterday",
					"today",
					"custom"
				].includes(range) && (range !== "custom" || window !== void 0);
				res.writeHead(valid ? 200 : 400, {
					"Content-Type": "application/json",
					"Cache-Control": "no-store"
				});
				res.end(JSON.stringify(valid ? summarizeUsage(storage.history(), range, Date.now(), url.searchParams.get("provider") ?? void 0, window) : { error: { code: range === "custom" ? "INVALID_TIME" : "INVALID_RANGE" } }));
			}
		}), "token-monitor: usage summary route");
	});
}
//#endregion
export { apply };
