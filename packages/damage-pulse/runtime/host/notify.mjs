import { createHash, randomUUID } from "node:crypto";
//#region plugins/dsh-token-monitor/src/cache-hit-anomaly.ts
function formatCacheHitAnomalyMessage(payload) {
	return [
		"【dsh-damage-pulse · 缓存小警报】",
		"",
		"鲸鱼娘发现缓存命中率有点低啦 (｡•́︿•̀｡)",
		"",
		`最近 ${String(payload.sampleCount)} 次合格调用的聚合命中率约为 ${(payload.observedRate * 100).toFixed(1)}%，低于设定阈值 ${(payload.threshold * 100).toFixed(0)}%。`,
		"",
		"建议检查一下最近调用的缓存复用情况哦～",
		"我会继续帮你认真盯着！"
	].join("\n");
}
/**
* Runtime-only detector for low cache hit rate. It deliberately has no disk
* state: a Host restart starts a fresh episode and never backfills alerts.
*/
function createCacheHitAnomalyDetector(readSettings) {
	let samples = [];
	let episodeLatched = false;
	let episodeId = 0;
	let settingsFingerprint = "";
	const reset = () => {
		samples = [];
		episodeLatched = false;
	};
	const observe = (record) => {
		const settings = readSettings();
		const fingerprint = `${String(settings.enabled)}:${String(settings.thresholdPercent)}:${String(settings.consecutiveCalls)}`;
		if (fingerprint !== settingsFingerprint) {
			settingsFingerprint = fingerprint;
			reset();
		}
		if (!settings.enabled) {
			reset();
			return;
		}
		if (!Number.isSafeInteger(settings.consecutiveCalls) || settings.consecutiveCalls < 2) {
			reset();
			return;
		}
		if (!Number.isSafeInteger(record.timestamp) || record.timestamp < 0) return void 0;
		if (!Number.isFinite(record.inputTokens) || !Number.isFinite(record.cacheReadTokens) || record.inputTokens < 0 || record.cacheReadTokens < 0) return void 0;
		const denominator = record.inputTokens + record.cacheReadTokens;
		if (!Number.isFinite(denominator) || denominator <= 0) return void 0;
		samples.push({
			inputTokens: record.inputTokens,
			cacheReadTokens: record.cacheReadTokens,
			observedAt: record.timestamp
		});
		if (samples.length > settings.consecutiveCalls) samples = samples.slice(-settings.consecutiveCalls);
		if (samples.length < settings.consecutiveCalls) return void 0;
		const inputTokens = samples.reduce((sum, sample) => sum + sample.inputTokens, 0);
		const cacheReadTokens = samples.reduce((sum, sample) => sum + sample.cacheReadTokens, 0);
		const total = inputTokens + cacheReadTokens;
		if (total <= 0) return void 0;
		const observedRate = cacheReadTokens / total;
		const threshold = Math.max(0, Math.min(100, settings.thresholdPercent)) / 100;
		if (observedRate >= threshold) {
			episodeLatched = false;
			return;
		}
		if (episodeLatched) return void 0;
		episodeLatched = true;
		episodeId += 1;
		return {
			episodeId,
			observedRate,
			threshold,
			sampleCount: samples.length,
			consecutiveCalls: settings.consecutiveCalls,
			observedAt: samples[samples.length - 1].observedAt
		};
	};
	return {
		observe,
		reset
	};
}
//#endregion
//#region plugins/dsh-token-monitor/src/budget.ts
/** Pure crossing rule used by both live delivery and replay-oriented tests. */
function crossedDailyBudget(previousSpend, currentSpend, budget) {
	return previousSpend < budget && currentSpend >= budget;
}
/**
* Tracks one current Beijing day. Cold-start state is seeded from authoritative
* usage, so replay/restart never re-sends an already crossed threshold.
*/
var DailyBudgetThresholdTracker = class {
	date;
	spend;
	notified;
	budget;
	enabled;
	constructor(initial, budget, enabled = true) {
		this.date = initial.date;
		this.spend = initial.cost;
		this.budget = budget;
		this.enabled = enabled;
		this.notified = initial.cost >= budget;
	}
	observe(current, budget = this.budget, enabled = this.enabled) {
		if (current.date !== this.date) {
			this.date = current.date;
			this.spend = 0;
			this.notified = false;
		}
		const previousSpend = this.spend;
		if (budget !== this.budget || enabled !== this.enabled) {
			this.budget = budget;
			this.enabled = enabled;
			this.notified = previousSpend >= budget;
		}
		this.spend = Math.max(this.spend, current.cost);
		if (!this.enabled || this.notified || !crossedDailyBudget(previousSpend, this.spend, this.budget)) return void 0;
		this.notified = true;
		return {
			date: current.date,
			budget: this.budget,
			previousSpend,
			currentSpend: this.spend,
			remaining: this.budget - this.spend
		};
	}
};
const DATE_FORMATTER = new Intl.DateTimeFormat("en-CA", {
	timeZone: "Asia/Shanghai",
	year: "numeric",
	month: "2-digit",
	day: "2-digit"
});
/** 返回指定时间戳对应的北京时间自然日键。 */
function beijingDateKey(timestamp) {
	const parts = DATE_FORMATTER.formatToParts(new Date(timestamp));
	const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
	return values.year + "-" + values.month + "-" + values.day;
}
//#endregion
//#region plugins/dsh-token-monitor/src/budget-notify.ts
function formatBudgetThresholdMessage(event) {
	return [
		"【dsh-damage-pulse · 今日预算】",
		"",
		`今天（${event.date}）已经花费 CNY ${event.currentSpend.toFixed(2)}，刚刚越过 CNY ${event.budget.toFixed(2)} 的预算线啦 (｡•́︿•̀｡)`,
		"",
		`当前剩余预算：CNY ${event.remaining.toFixed(2)}`,
		"",
		"别担心～鲸鱼娘只负责提醒，不会阻止或取消任何请求。"
	].join("\n");
}
function assertNonEmptyString(value, name) {
	if (typeof value !== "string" || value.trim() === "") throw new TypeError(`${name} must be a non-empty string`);
}
function assertFiniteNumber(value, name) {
	if (typeof value !== "number" || !Number.isFinite(value)) throw new TypeError(`${name} must be finite`);
}
function assertNonNegativeSafeInteger(value, name) {
	if (!Number.isSafeInteger(value) || value < 0) throw new TypeError(`${name} must be a non-negative safe integer`);
}
function stableNotificationKey(kind, identity) {
	return `token-monitor-notification:v1:${kind}:${createHash("sha256").update(JSON.stringify(identity)).digest("hex")}`;
}
function draft(kind, timestamp, priority, payload, identity, scope) {
	const dedupeKey = stableNotificationKey(kind, scope ? [
		scope.provider,
		scope.model ?? null,
		...identity
	] : identity);
	return {
		...scope,
		schemaVersion: 1,
		id: dedupeKey,
		dedupeKey,
		kind,
		timestamp,
		priority,
		payload
	};
}
function createBudgetThresholdNotification(crossing, timestamp, provider) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(crossing.date)) throw new TypeError("crossing.date must be YYYY-MM-DD");
	assertNonNegativeSafeInteger(timestamp, "timestamp");
	for (const [name, value] of Object.entries({
		budget: crossing.budget,
		previousSpend: crossing.previousSpend,
		currentSpend: crossing.currentSpend,
		remaining: crossing.remaining
	})) assertFiniteNumber(value, `crossing.${name}`);
	if (crossing.budget <= 0) throw new RangeError("crossing.budget must be positive");
	if (crossing.previousSpend < 0 || crossing.currentSpend < 0) throw new RangeError("crossing spend values must be non-negative");
	if (!(crossing.previousSpend < crossing.budget && crossing.currentSpend >= crossing.budget)) throw new RangeError("crossing must cross the configured budget");
	const budgetCents = Math.round(crossing.budget * 100);
	if (!Number.isSafeInteger(budgetCents)) throw new RangeError("crossing.budget is outside the supported range");
	return draft("budget-threshold", timestamp, "high", { ...crossing }, [crossing.date, budgetCents], provider ? { provider } : void 0);
}
function createPeakTransitionNotification(transition, provider) {
	assertNonNegativeSafeInteger(transition.observedAt, "transition.observedAt");
	assertNonEmptyString(transition.key, "transition.key");
	if (transition.from === transition.to) throw new RangeError("transition must change period");
	const kind = transition.to === "peak" ? "peak-enter" : "peak-exit";
	const payload = {
		from: transition.from,
		to: transition.to,
		periodKey: transition.key
	};
	return draft(kind, transition.observedAt, "normal", payload, [transition.key], provider ? { provider } : void 0);
}
function createCacheHitAnomalyNotification(payload, scope) {
	assertNonNegativeSafeInteger(payload.episodeId, "cache anomaly episodeId");
	assertFiniteNumber(payload.observedRate, "cache anomaly observedRate");
	assertFiniteNumber(payload.threshold, "cache anomaly threshold");
	assertNonNegativeSafeInteger(payload.sampleCount, "cache anomaly sampleCount");
	assertNonNegativeSafeInteger(payload.consecutiveCalls, "cache anomaly consecutiveCalls");
	assertNonNegativeSafeInteger(payload.observedAt, "cache anomaly observedAt");
	if (payload.observedRate < 0 || payload.observedRate > 1 || payload.threshold < 0 || payload.threshold > 1) throw new RangeError("cache anomaly rates must be within 0..1");
	if (payload.episodeId < 1 || payload.sampleCount < 2 || payload.consecutiveCalls < 2) throw new RangeError("cache anomaly counters are invalid");
	return draft("cache-hit-anomaly", payload.observedAt, "normal", payload, [payload.episodeId], scope);
}
function validateEvent(event) {
	if (typeof event !== "object" || event === null) throw new TypeError("notification event must be an object");
	const candidate = event;
	if (candidate.provider !== void 0) assertNonEmptyString(candidate.provider, "notification provider");
	if (candidate.model !== void 0) assertNonEmptyString(candidate.model, "notification model");
	if (candidate.schemaVersion !== 1) throw new TypeError("notification event schemaVersion is unsupported");
	assertNonNegativeSafeInteger(candidate.seq, "notification event seq");
	if (candidate.seq === 0) throw new RangeError("notification event seq must be positive");
	assertNonEmptyString(candidate.id, "notification event id");
	assertNonEmptyString(candidate.dedupeKey, "notification event dedupeKey");
	if (candidate.id !== candidate.dedupeKey) throw new TypeError("notification event id must equal dedupeKey");
	assertNonNegativeSafeInteger(candidate.timestamp, "notification event timestamp");
	if (candidate.priority !== "normal" && candidate.priority !== "high") throw new TypeError("notification event priority is invalid");
	if (![
		"charge",
		"budget-threshold",
		"peak-enter",
		"peak-exit",
		"cache-hit-anomaly"
	].includes(String(candidate.kind))) throw new TypeError("notification event kind is invalid");
	if (typeof candidate.payload !== "object" || candidate.payload === null) throw new TypeError("notification event payload must be an object");
	const payload = candidate.payload;
	if (candidate.kind === "charge") {
		assertFiniteNumber(payload.cost, "charge payload cost");
		if (payload.cost <= 0) throw new RangeError("charge payload cost must be positive");
		if (payload.damageKind !== "normal" && payload.damageKind !== "miss") throw new TypeError("charge payload damageKind is invalid");
		assertNonEmptyString(payload.sessionId, "charge payload sessionId");
		assertNonNegativeSafeInteger(payload.turn, "charge payload turn");
		assertNonNegativeSafeInteger(payload.step, "charge payload step");
		assertNonEmptyString(payload.provider, "charge payload provider");
		assertNonEmptyString(payload.model, "charge payload model");
		return;
	}
	if (candidate.kind === "budget-threshold") {
		if (typeof payload.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(payload.date)) throw new TypeError("budget payload date must be YYYY-MM-DD");
		assertFiniteNumber(payload.budget, "budget payload budget");
		assertFiniteNumber(payload.previousSpend, "budget payload previousSpend");
		assertFiniteNumber(payload.currentSpend, "budget payload currentSpend");
		assertFiniteNumber(payload.remaining, "budget payload remaining");
		return;
	}
	if (candidate.kind === "cache-hit-anomaly") {
		assertNonNegativeSafeInteger(payload.episodeId, "cache anomaly episodeId");
		assertFiniteNumber(payload.observedRate, "cache anomaly observedRate");
		assertFiniteNumber(payload.threshold, "cache anomaly threshold");
		assertNonNegativeSafeInteger(payload.sampleCount, "cache anomaly sampleCount");
		assertNonNegativeSafeInteger(payload.consecutiveCalls, "cache anomaly consecutiveCalls");
		assertNonNegativeSafeInteger(payload.observedAt, "cache anomaly observedAt");
		if (payload.observedRate < 0 || payload.observedRate > 1 || payload.threshold < 0 || payload.threshold > 1) throw new RangeError("cache anomaly rates must be within 0..1");
		if (payload.sampleCount < 2 || payload.consecutiveCalls < 2 || payload.episodeId < 1) throw new RangeError("cache anomaly counters are invalid");
		return;
	}
	if (payload.from !== "peak" && payload.from !== "offPeak") throw new TypeError("peak payload from is invalid");
	if (payload.to !== "peak" && payload.to !== "offPeak") throw new TypeError("peak payload to is invalid");
	if (payload.from === payload.to) throw new RangeError("peak payload must change period");
	assertNonEmptyString(payload.periodKey, "peak payload periodKey");
	if (candidate.kind === "peak-enter" !== (payload.to === "peak")) throw new TypeError("peak event kind does not match its destination period");
}
/** In-memory stream cursor plus a separate bounded business-key dedupe index. */
var NotificationEventBuffer = class {
	streamId;
	capacity;
	dedupeCapacity;
	events = [];
	seenKeys = /* @__PURE__ */ new Set();
	seenKeyOrder = [];
	seqCounter = 0;
	constructor(options = {}) {
		this.capacity = options.capacity ?? 500;
		this.dedupeCapacity = options.dedupeCapacity ?? 2e3;
		this.streamId = options.streamId ?? randomUUID();
		if (!Number.isSafeInteger(this.capacity) || this.capacity <= 0) throw new RangeError("capacity must be positive");
		if (!Number.isSafeInteger(this.dedupeCapacity) || this.dedupeCapacity < this.capacity) throw new RangeError("dedupeCapacity must be an integer at least as large as capacity");
		assertNonEmptyString(this.streamId, "streamId");
	}
	publish(value) {
		const nextSeq = this.seqCounter + 1;
		const event = {
			...value,
			seq: nextSeq
		};
		validateEvent(event);
		if (this.seenKeys.has(value.dedupeKey)) return void 0;
		this.seqCounter = nextSeq;
		this.seenKeys.add(event.dedupeKey);
		this.seenKeyOrder.push(event.dedupeKey);
		if (this.seenKeyOrder.length > this.dedupeCapacity) {
			const expired = this.seenKeyOrder.shift();
			if (expired !== void 0) this.seenKeys.delete(expired);
		}
		this.events.push(event);
		if (this.events.length > this.capacity) this.events.splice(0, this.events.length - this.capacity);
		return event;
	}
	currentSeq() {
		return this.seqCounter;
	}
	since(since) {
		assertNonNegativeSafeInteger(since, "since");
		if (since >= this.seqCounter) return [];
		return this.events.filter((event) => event.seq > since);
	}
	batchSince(since) {
		return {
			streamId: this.streamId,
			seq: this.seqCounter,
			events: this.since(since)
		};
	}
};
//#endregion
//#region plugins/dsh-token-monitor/src/provider-notifications.ts
/** Create isolated budget and cache episodes for concurrent providers.
* @param history Accepted ledger at startup; used only to seed budget totals.
* @param settings Current settings for the exact provider id.
* @param publish Delivery callback, including provider identity.
* @param now Clock for Beijing-day and future-record checks.
* @returns Observer for each newly accepted record.
*/
function createProviderNotificationObserver(history, settings, publish, now = Date.now) {
	const budgets = /* @__PURE__ */ new Map();
	const detectors = /* @__PURE__ */ new Map();
	const initialTime = now();
	const initialDate = beijingDateKey(initialTime);
	const initialTotals = /* @__PURE__ */ new Map();
	for (const record of history) {
		if (record.timestamp > initialTime || beijingDateKey(record.timestamp) !== initialDate || record.billingStatus !== void 0 && record.billingStatus !== "priced") continue;
		initialTotals.set(record.provider, (initialTotals.get(record.provider) ?? 0) + record.cost);
	}
	const budgetFor = (provider, timestamp) => {
		let state = budgets.get(provider);
		if (!state) {
			const config = settings(provider);
			const total = {
				date: initialDate,
				currency: "CNY",
				timeZone: "Asia/Shanghai",
				cost: initialTotals.get(provider) ?? 0,
				calls: 0,
				updatedAt: timestamp
			};
			state = {
				total,
				tracker: new DailyBudgetThresholdTracker(total, config.dailyBudgetCny, config.dailyBudgetEnabled)
			};
			budgets.set(provider, state);
		}
		return state;
	};
	return (record) => {
		const timestamp = now();
		if (record.timestamp > timestamp) return;
		const config = settings(record.provider);
		const key = JSON.stringify([record.provider, record.model]);
		let detector = detectors.get(key);
		if (!detector) {
			detector = createCacheHitAnomalyDetector(() => {
				const current = settings(record.provider);
				return {
					enabled: current.cacheHitAnomalyNotificationEnabled,
					thresholdPercent: current.cacheHitAnomalyThreshold,
					consecutiveCalls: current.cacheHitAnomalyConsecutiveCalls
				};
			});
			detectors.set(key, detector);
		}
		const anomaly = detector.observe(record);
		if (anomaly) publish(record.provider, createCacheHitAnomalyNotification(anomaly, record), formatCacheHitAnomalyMessage(anomaly));
		if (record.billingStatus !== void 0 && record.billingStatus !== "priced" || beijingDateKey(record.timestamp) !== beijingDateKey(timestamp)) return;
		const state = budgetFor(record.provider, timestamp);
		const date = beijingDateKey(timestamp);
		state.total = {
			...state.total,
			date,
			cost: (state.total.date === date ? state.total.cost : 0) + record.cost,
			updatedAt: timestamp
		};
		const crossing = state.tracker.observe(state.total, config.dailyBudgetCny, config.dailyBudgetEnabled);
		if (crossing && config.budgetExceededNotificationEnabled) publish(record.provider, createBudgetThresholdNotification(crossing, timestamp, record.provider), formatBudgetThresholdMessage(crossing));
	};
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
//#region plugins/dsh-token-monitor/src/notification-route.ts
const TOKEN_MONITOR_NOTIFICATION_EVENTS_PATH = "/api/token-monitor/notification-events";
function writeJson(res, status, body, headers = {}) {
	res.writeHead(status, {
		"Content-Type": "application/json",
		"Cache-Control": "no-store",
		...headers
	});
	res.end(JSON.stringify(body));
}
function routeError(code, message) {
	return { error: {
		code,
		message
	} };
}
function parseSince(request) {
	const value = new URL(request.url ?? "/api/token-monitor/notification-events", "http://localhost").searchParams.get("since");
	if (value === null) return 0;
	if (!/^(0|[1-9]\d*)$/.test(value)) return void 0;
	const since = Number(value);
	return Number.isSafeInteger(since) ? since : void 0;
}
function createNotificationEventsRouteHandler(buffer) {
	return (request, response) => {
		const method = request.method ?? "GET";
		if (method !== "GET" && method !== "HEAD") {
			writeJson(response, 405, routeError("METHOD_NOT_ALLOWED", "Only GET and HEAD are supported"), { Allow: "GET, HEAD" });
			return;
		}
		const since = parseSince(request);
		if (since === void 0) {
			writeJson(response, 400, routeError("INVALID_SINCE", "since must be a non-negative safe integer"));
			return;
		}
		response.writeHead(200, {
			"Content-Type": "application/json",
			"Cache-Control": "no-store"
		});
		response.end(method === "HEAD" ? void 0 : JSON.stringify(buffer.batchSince(since)));
	};
}
/** Register the Host-owned notification stream used by the whale bubble client. */
function registerNotificationEventsRoute(ctx, buffer) {
	const guard = createRouteGuard(ctx);
	const handler = createNotificationEventsRouteHandler(buffer);
	ctx.effect(() => ctx.webServer.register({
		kind: "exact",
		path: TOKEN_MONITOR_NOTIFICATION_EVENTS_PATH,
		handler: (request, response) => {
			if (!guard(request, response)) return;
			handler(request, response);
		}
	}), "token-monitor: notification events route");
}
//#endregion
//#region plugins/dsh-token-monitor/src/peak-transition.ts
const SHANGHAI_OFFSET_MS = 288e5;
const PEAK_BOUNDARY_MINUTES = [
	540,
	720,
	840,
	1080
];
const systemClock = {
	now: () => Date.now(),
	setTimeout: (callback, delayMs) => setTimeout(callback, delayMs),
	clearTimeout: (handle) => clearTimeout(handle)
};
function beijingDate(timestamp) {
	return new Date(timestamp + SHANGHAI_OFFSET_MS);
}
function isWeekday(day) {
	return day >= 1 && day <= 5;
}
function localTimestamp(date, minutes) {
	return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), Math.floor(minutes / 60), minutes % 60) - SHANGHAI_OFFSET_MS;
}
/** Return the effective billing period at an epoch timestamp. */
function peakPeriodAt(timestamp) {
	const local = beijingDate(timestamp);
	if (!isWeekday(local.getUTCDay())) return "offPeak";
	const minutes = local.getUTCHours() * 60 + local.getUTCMinutes();
	return minutes >= 540 && minutes < 720 || minutes >= 840 && minutes < 1080 ? "peak" : "offPeak";
}
/** Return the first genuine period boundary strictly after `timestamp`. */
function nextPeakBoundary(timestamp) {
	const local = beijingDate(timestamp);
	for (let dayOffset = 0; dayOffset <= 7; dayOffset++) {
		const day = new Date(Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate() + dayOffset));
		if (!isWeekday(day.getUTCDay())) continue;
		for (const minutes of PEAK_BOUNDARY_MINUTES) {
			const candidate = localTimestamp(day, minutes);
			if (candidate > timestamp) return candidate;
		}
	}
	throw new Error("peak transition: failed to find the next weekday boundary");
}
/** Stable idempotency key for the current effective period segment. */
function peakPeriodKey(timestamp) {
	const local = beijingDate(timestamp);
	let start;
	if (isWeekday(local.getUTCDay())) {
		const minutes = local.getUTCHours() * 60 + local.getUTCMinutes();
		if (minutes >= 1080) start = localTimestamp(local, 1080);
		else if (minutes >= 840) start = localTimestamp(local, 840);
		else if (minutes >= 720) start = localTimestamp(local, 720);
		else if (minutes >= 540) start = localTimestamp(local, 540);
	}
	if (start === void 0) for (let dayOffset = 1; dayOffset <= 7; dayOffset++) {
		const prior = new Date(Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate() - dayOffset));
		if (!isWeekday(prior.getUTCDay())) continue;
		start = localTimestamp(prior, 1080);
		break;
	}
	if (start === void 0) throw new Error("peak transition: failed to identify the current period");
	return `${peakPeriodAt(timestamp)}:${start}`;
}
/**
* Owns one timer and compares effective state, rather than replaying scheduled
* boundaries. A late callback after sleep therefore emits at most one useful
* transition and emits nothing when the current state still matches baseline.
*/
var PeakTransitionScheduler = class {
	onTransition;
	clock;
	onError;
	running = false;
	timer;
	period;
	lastEmittedKey;
	pending = /* @__PURE__ */ new Set();
	constructor(onTransition, options = {}) {
		this.onTransition = onTransition;
		this.clock = options.clock ?? systemClock;
		this.onError = options.onError ?? (() => {});
	}
	/** Start with a silent baseline. Repeated starts are no-ops. */
	start() {
		if (this.running) return;
		this.running = true;
		this.period = peakPeriodAt(this.clock.now());
		this.lastEmittedKey = void 0;
		this.scheduleNext();
	}
	/** Stop and release the owned timer. Repeated stops are no-ops. */
	async stop() {
		this.running = false;
		if (this.timer !== void 0) this.clock.clearTimeout(this.timer);
		this.timer = void 0;
		this.period = void 0;
		this.lastEmittedKey = void 0;
		await Promise.allSettled(this.pending);
	}
	/** Check current state immediately; useful for timer callbacks and tests. */
	check() {
		if (!this.running) return;
		const observedAt = this.clock.now();
		const nextPeriod = peakPeriodAt(observedAt);
		const previousPeriod = this.period;
		this.period = nextPeriod;
		if (previousPeriod !== void 0 && previousPeriod !== nextPeriod) {
			const key = peakPeriodKey(observedAt);
			if (key !== this.lastEmittedKey) {
				this.lastEmittedKey = key;
				const transition = {
					from: previousPeriod,
					to: nextPeriod,
					observedAt,
					key
				};
				try {
					const delivery = Promise.resolve(this.onTransition(transition)).catch((error) => this.report(error));
					this.pending.add(delivery);
					delivery.then(() => this.pending.delete(delivery));
				} catch (error) {
					this.report(error);
				}
			}
		}
		this.scheduleNext();
	}
	scheduleNext() {
		if (!this.running) return;
		if (this.timer !== void 0) this.clock.clearTimeout(this.timer);
		const now = this.clock.now();
		const delayMs = Math.max(1, nextPeakBoundary(now) - now);
		this.timer = this.clock.setTimeout(() => {
			this.timer = void 0;
			this.check();
		}, delayMs);
	}
	report(error) {
		try {
			this.onError(error);
		} catch {}
	}
};
//#endregion
//#region plugins/dsh-token-monitor/src/peak-reminder.ts
const DEFAULT_PEAK_REMINDER_SETTINGS = Object.freeze({
	peakReminderEnabled: false,
	peakReminderEnterPeak: false,
	peakReminderEnterValley: false
});
/** Fixed user-facing message for a genuine effective-period transition. */
function formatPeakTransitionMessage(transition) {
	const schedule = ["工作日峰时段：09:00–12:00、14:00–18:00", "其余工作日时段及周末全天为谷时段。"];
	if (transition.to === "peak") return [
		"【dsh-damage-pulse · 峰时提醒】",
		"",
		"叮咚～现在进入峰时段啦（北京时间）！( •̀ ω •́ )✧",
		"安排调用时记得留意峰时价格哦～",
		"",
		...schedule,
		"",
		"鲸鱼娘会继续帮你盯着余额和消耗～"
	].join("\n");
	return [
		"【dsh-damage-pulse · 谷时提醒】",
		"",
		"好消息～现在进入谷时段啦（北京时间）！ヾ(≧▽≦*)o",
		"想安排调用的话，可以留意一下现在的谷时价格哦～",
		"",
		...schedule,
		"",
		"鲸鱼娘会继续乖乖守着余额变化～"
	].join("\n");
}
/**
* Bind the scheduler to the plugin lifecycle. Notification failures are
* contained here and never enter accounting, persistence, or request paths.
*/
function attachPeakBoundaryReminder(ctx, sender, options = {}) {
	const warn = options.warn ?? ((message) => console.warn(message));
	const scheduler = new PeakTransitionScheduler(async (transition) => {
		options.onTransition?.(transition);
		const settings = options.settings?.() ?? DEFAULT_PEAK_REMINDER_SETTINGS;
		if (!settings.peakReminderEnabled) return;
		if (transition.to === "peak" && !settings.peakReminderEnterPeak) return;
		if (transition.to === "offPeak" && !settings.peakReminderEnterValley) return;
		const result = await sender.send(formatPeakTransitionMessage(transition));
		if (!result.ok) warn(`[dsh-token-monitor] 微信峰谷提醒发送失败（不影响计费/UI）: ${result.detail}`);
	}, {
		...options.clock === void 0 ? {} : { clock: options.clock },
		onError: (error) => warn(`[dsh-token-monitor] 微信峰谷提醒异常（不影响计费/UI）: ${String(error)}`)
	});
	ctx.effect(() => {
		scheduler.start();
		return () => scheduler.stop();
	}, "dsh-token-monitor: peak boundary reminder");
}
//#endregion
//#region plugins/dsh-token-monitor/src/wechat-gate.ts
/** 共享的总开关门禁：关闭或发送器缺失时 fail-soft（返回 ok，不抛错）。 */
function createGatedWechatSender(isEnabled, getSender) {
	return { async send(message) {
		const sender = getSender();
		if (!isEnabled() || sender === void 0) return { ok: true };
		return await sender.send(message);
	} };
}
//#endregion
//#region plugins/dsh-token-monitor/src/features/notify.ts
function apply(ctx, services) {
	const events = new NotificationEventBuffer();
	const handler = createNotificationEventsRouteHandler(events);
	ctx.effect(() => {
		services.notificationEvents = handler;
		return () => {
			if (services.notificationEvents === handler) delete services.notificationEvents;
		};
	}, "token-monitor: live notification stream");
	const pending = /* @__PURE__ */ new Set();
	const observe = createProviderNotificationObserver(services.storage.history(), services.readProvider, (provider, draft, message) => {
		if (!events.publish(draft) || !services.readProvider(provider).wechatNotificationsEnabled || !services.wechat) return;
		const delivery = services.wechat.send(`[${provider}] ${message}`).catch(() => void 0);
		pending.add(delivery);
		delivery.finally(() => pending.delete(delivery));
	});
	ctx.effect(() => {
		services.observeRecord = observe;
		return async () => {
			if (services.observeRecord === observe) delete services.observeRecord;
			await Promise.allSettled(pending);
		};
	}, "token-monitor: notification observer");
	attachPeakBoundaryReminder(ctx, createGatedWechatSender(() => services.settings.user().wechatNotificationsEnabled, () => services.wechat), {
		settings: () => services.settings.user(),
		onTransition: (transition) => {
			const settings = services.readProvider("deepseek-official");
			if (settings.peakReminderEnabled && (transition.to === "peak" ? settings.peakReminderEnterPeak : settings.peakReminderEnterValley)) events.publish(createPeakTransitionNotification(transition, "deepseek-official"));
		}
	});
	ctx.inject(["webServer", "connection"], (web) => registerNotificationEventsRoute(web, events));
}
//#endregion
export { apply };
