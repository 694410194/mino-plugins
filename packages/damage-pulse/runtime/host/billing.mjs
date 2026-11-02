import { createRequire } from "node:module";
import { getQuickJS } from "quickjs-emscripten";
import "@deepseek-ai/dsh-atomic-write";
import { createHash, randomUUID } from "node:crypto";
import { lookup } from "node:dns/promises";
import { request } from "node:https";
import ipaddr from "ipaddr.js";
import { credentialRef } from "@deepseek-ai/dsh-credentials";
import { launchEnvironmentOf } from "@deepseek-ai/dsh-launch-environment";
import { defineTool } from "@deepseek-ai/dsh-tools";
import "@deepseek-ai/dsh-settings";
import "@deepseek-ai/cosmokit";
import z from "@deepseek-ai/schemastery";
//#region plugins/dsh-token-monitor/src/balance-path.ts
/** Validate a stored relative path without loading the optional script interpreter.
* @param value Untrusted request path.
* @returns Origin-free relative request path.
*/
function validateBalancePath(value) {
	if (typeof value !== "string" || value.length > 2048 || !value.startsWith("/") || value.startsWith("//") || value.includes("\\") || value.includes("?") || value.includes("#")) throw new Error("Balance request path must be absolute and contain no origin, query, fragment or backslash");
	return value;
}
const MAX_BALANCE_WINDOWS = 8;
/** Coerce one flexible window figure: plain or decimal-string numbers only. */
function windowNumber(value, message) {
	if (value === void 0) return void 0;
	const result = amount(value);
	if (result < 0) throw new Error(message);
	return result;
}
/** Accept an epoch-milliseconds number or an ISO-8601 date string. */
function coerceResetAt(value) {
	if (value === void 0) return void 0;
	if (typeof value === "number" && Number.isFinite(value)) return value;
	if (typeof value === "string" && value.trim()) {
		const parsed = Date.parse(value);
		if (Number.isFinite(parsed)) return parsed;
	}
	throw new Error("Invalid balance window reset time");
}
function balanceWindows(value) {
	if (value === void 0) return void 0;
	if (!Array.isArray(value) || value.length > MAX_BALANCE_WINDOWS) throw new Error("Invalid balance windows");
	return value.map((item, index) => {
		const entry = object$1(item);
		const label = entry.label === void 0 ? `Window ${index + 1}` : entry.label;
		if (typeof label !== "string" || !label.trim() || label.length > 16) throw new Error("Invalid balance window label");
		const total = windowNumber(entry.total, "Invalid balance window total");
		if (total === void 0) throw new Error("Invalid balance window total");
		const percent = windowNumber(entry.percent, "Invalid balance window percent");
		if (percent !== void 0 && percent > 100) throw new Error("Invalid balance window percent");
		let used;
		if (entry.used !== void 0) used = windowNumber(entry.used, "Invalid balance window usage") ?? NaN;
		else if (entry.remaining !== void 0) used = Math.max(total - (windowNumber(entry.remaining, "Invalid balance window remaining") ?? -1), 0);
		else if (percent !== void 0) used = total * percent / 100;
		else throw new Error("Invalid balance window usage");
		if (!Number.isFinite(used) || used < 0) throw new Error("Invalid balance window usage");
		const rounded = Math.round(used * 100) / 100;
		const resetAt = coerceResetAt(entry.resetAt);
		return resetAt === void 0 ? {
			label,
			used: rounded,
			total
		} : {
			label,
			used: rounded,
			total,
			resetAt
		};
	});
}
function object$1(value) {
	if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Expected an object");
	return value;
}
/** Run one adapter phase with no Node, environment, module loader, timers or network globals.
* @param script Complete expression returning { request, parse(response) }.
* @param response JSON response for parsing; omitted when inspecting the request.
* @returns JSON copied out of the isolated interpreter.
*/
async function evaluateBalanceScript(script, response) {
	if (Buffer.byteLength(script, "utf8") > 32768) throw new Error("Balance script exceeds 32 KiB");
	const runtime = (await getQuickJS()).newRuntime();
	runtime.setMemoryLimit(8388608);
	runtime.setMaxStackSize(262144);
	const deadline = Date.now() + 100;
	runtime.setInterruptHandler(() => Date.now() >= deadline);
	const vm = runtime.newContext();
	try {
		const responseJson = response === void 0 ? void 0 : JSON.stringify(response);
		if (responseJson !== void 0 && Buffer.byteLength(responseJson) > 262144) throw new Error("Balance response exceeds 256 KiB");
		const value = vm.evalCode(`"use strict"; (() => {
      const adapter = (${script}\n);
      if (!adapter || typeof adapter.parse !== 'function') throw new Error('Expected request and parse(response)');
      const result = ${responseJson === void 0 ? "adapter.request" : `adapter.parse(${responseJson})`};
      if (result && typeof result.then === 'function') throw new Error('Async adapters are unsupported');
      return JSON.stringify(result);
    })()`, "balance-adapter.js");
		if (value.error) {
			value.error.dispose();
			throw new Error("Balance script failed validation or exceeded execution limits");
		}
		try {
			const json = vm.getString(value.value);
			if (Buffer.byteLength(json) > 262144) throw new Error("Balance script output is too large");
			return JSON.parse(json);
		} finally {
			value.value.dispose();
		}
	} finally {
		vm.dispose();
		runtime.dispose();
	}
}
/** Validate the relative request path before Host resolves its private HTTPS endpoint.
* @param value Untrusted request descriptor from the interpreter.
* @returns Canonical bounded request.
*/
function validateBalanceRequest(value) {
	const item = object$1(value);
	if (Object.keys(item).some((key) => ![
		"path",
		"method",
		"auth",
		"body"
	].includes(key))) throw new Error("Unsupported balance request field");
	const path = validateBalancePath(item.path);
	if (item.method !== "GET" && item.method !== "POST") throw new Error("Balance request must use GET or POST");
	if (item.auth !== "bearer" && item.auth !== "x-api-key") throw new Error("Unsupported balance authentication");
	if (item.body !== void 0 && (typeof item.body !== "string" || Buffer.byteLength(item.body) > 8192 || item.method !== "POST")) throw new Error("Invalid balance request body");
	return {
		path,
		method: item.method,
		auth: item.auth,
		...item.body === void 0 ? {} : { body: item.body }
	};
}
function amount(value) {
	if (typeof value !== "number" && typeof value !== "string" || typeof value === "string" && !/^-?\d+(?:\.\d+)?$/.test(value)) throw new Error("Balance amount must be a decimal number");
	const result = Number(value);
	if (!Number.isFinite(result) || Math.abs(result) > 0xe8d4a51000) throw new Error("Balance amount is out of range");
	return result;
}
/** Validate amounts without coercing credits into a monetary currency.
*
* Flexible shape: when valid `windows` are present, `currency` and
* `totalBalance` may be omitted (they default to `credits` and the primary
* window's remaining credits), so a window-only script stays short.
* @param value Untrusted adapter result.
* @returns Bounded balance fields for the UI.
*/
function validateScriptBalance(value) {
	const item = object$1(value);
	const windows = balanceWindows(item.windows);
	const hasWindows = !!windows?.length;
	const currency = item.currency === void 0 ? hasWindows ? "credits" : void 0 : item.currency;
	if (typeof currency !== "string" || !/^(?:[A-Z]{3}|credits)$/.test(currency)) throw new Error("Balance currency must be an ISO code or credits");
	if (item.isAvailable !== void 0 && typeof item.isAvailable !== "boolean") throw new Error("Invalid balance availability");
	if (item.totalBalance === void 0 && !hasWindows) throw new Error("Balance amount must be a decimal number");
	const totalBalance = item.totalBalance === void 0 ? Math.max(windows[0].total - windows[0].used, 0) : amount(item.totalBalance);
	const rawDisplay = typeof item.display === "string" ? item.display.trim().slice(0, 48) : void 0;
	const display = rawDisplay ? rawDisplay : void 0;
	return {
		currency,
		totalBalance,
		grantedBalance: item.grantedBalance === void 0 ? 0 : amount(item.grantedBalance),
		toppedUpBalance: item.toppedUpBalance === void 0 ? 0 : amount(item.toppedUpBalance),
		isAvailable: item.isAvailable !== false,
		...display ? { display } : {},
		...windows ? { windows } : {}
	};
}
/** Official adapter seed; an explicitly empty saved script disables it. */
const OFFICIAL_BALANCE_SCRIPT = `({
  request: { path: "/user/balance", method: "GET", auth: "bearer" },
  parse(response) {
    const rows = response.balance_infos.filter(item => item && typeof item.currency === "string"
      && [item.total_balance, item.granted_balance, item.topped_up_balance].every(value => typeof value === "string" && value.trim() && Number.isFinite(Number(value))));
    rows.sort((a, b) => Number(Number(b.total_balance) > 0) - Number(Number(a.total_balance) > 0)
      || Number(b.currency === "CNY") - Number(a.currency === "CNY")
      || Number(b.total_balance) - Number(a.total_balance) || a.currency.localeCompare(b.currency));
    const row = rows[0];
    return { currency: row.currency, totalBalance: row.total_balance,
      grantedBalance: row.granted_balance, toppedUpBalance: row.topped_up_balance,
      isAvailable: response.is_available !== false };
  }
})`;
//#endregion
//#region plugins/dsh-token-monitor/src/balance-storage.ts
/** Stable identity of one approved endpoint, used for de-duplication and comparison. */
function endpointKey(endpoint) {
	return endpoint.method + " " + endpoint.path;
}
/** Validate one approved endpoint before it can authorize a credential-bearing request.
* @param value Untrusted policy entry from settings or a route body.
* @returns Canonical endpoint.
*/
function validateBalanceEndpoint(value) {
	if (!value || typeof value !== "object" || Array.isArray(value)) throw new TypeError("Invalid balance endpoint");
	const entry = value;
	if (Object.keys(entry).some((key) => !["path", "method"].includes(key))) throw new TypeError("Invalid balance endpoint");
	if (entry.method !== "GET" && entry.method !== "POST") throw new TypeError("Balance endpoint must use GET or POST");
	return {
		path: validateBalancePath(entry.path),
		method: entry.method
	};
}
function validProviderId(provider) {
	return provider.trim() === provider && provider.length > 0 && provider.length <= 256 && ![
		"__proto__",
		"constructor",
		"prototype"
	].includes(provider);
}
/** Validate script storage before accepting settings.
* @param value Untrusted persisted section.
*/
function validateBalanceScripts(value) {
	if (!value || typeof value !== "object" || Array.isArray(value)) throw new TypeError("Invalid balance scripts");
	for (const [provider, raw] of Object.entries(value)) {
		if (!validProviderId(provider) || !raw || typeof raw !== "object" || Array.isArray(raw)) throw new TypeError("Invalid balance script provider");
		const entry = raw;
		if (!Number.isSafeInteger(entry.revision) || entry.revision < 1 || typeof entry.script !== "string" || Buffer.byteLength(entry.script) > 32768 || entry.enabled !== void 0 && (provider !== "deepseek-account" || typeof entry.enabled !== "boolean") || Object.keys(entry).some((key) => ![
			"revision",
			"script",
			"enabled"
		].includes(key))) throw new TypeError("Invalid balance script entry");
	}
}
/** Concurrent edits to the same provider must be reviewed before replacement. */
var BalanceScriptConflictError = class extends Error {
	constructor() {
		super("Balance script revision conflict");
	}
};
//#endregion
//#region packages/util/token-monitor-contract/src/billing-rule-resolution.ts
const OFFICIAL_PROVIDER_ID = "deepseek-official";
const OFFICIAL_PROVIDER_IDS = [OFFICIAL_PROVIDER_ID, "deepseek-account"];
/** Known official billing identities; never infer identity from a model name. */
function isOfficialProvider(provider) {
	return OFFICIAL_PROVIDER_IDS.includes(provider);
}
/** An explicit provider owns its whole model list, even when empty or disabled. */
function resolveBillingProvider(rules, providerId) {
	const explicit = rules.providers.find((item) => item.provider === providerId);
	if (explicit) return {
		owner: explicit,
		source: "explicit"
	};
	if (!isOfficialProvider(providerId)) return {
		owner: void 0,
		source: "none"
	};
	const official = rules.providers.find((item) => item.provider === OFFICIAL_PROVIDER_ID);
	return official ? {
		owner: official,
		source: "official-family"
	} : {
		owner: void 0,
		source: "none"
	};
}
//#endregion
//#region plugins/dsh-token-monitor/src/pricing.ts
/** 2026-09-10 生效规则：V4.1 Flash 与两个旧名称共用新价；V4 Pro 计费方式不变（官网已取消 9-14 起按 Flash 价计费）。 */
const PRICE_TABLE = {
	version: "2026-09-27",
	peakHours: [[9, 12], [14, 18]],
	models: {
		"deepseek-flash": {
			offPeak: {
				input: 1,
				cacheHit: .02,
				output: 4
			},
			peak: {
				input: 2,
				cacheHit: .04,
				output: 8
			}
		},
		"deepseek-v4-flash-vision-exp": {
			offPeak: {
				input: 1,
				cacheHit: .02,
				output: 4
			},
			peak: {
				input: 2,
				cacheHit: .04,
				output: 8
			}
		},
		"deepseek-v4-flash": {
			offPeak: {
				input: 1,
				cacheHit: .02,
				output: 4
			},
			peak: {
				input: 2,
				cacheHit: .04,
				output: 8
			}
		},
		"deepseek-v4-pro": {
			offPeak: {
				input: 4.5,
				cacheHit: .15,
				output: 13.5
			},
			peak: {
				input: 9,
				cacheHit: .3,
				output: 27
			}
		}
	}
};
/**
* 2026-08-17 00:00（北京时间）前的旧价格：统一价，无峰谷。
* 峰值/谷值填同一组价格 + 空 peakHours，使 `isPeakHour` 恒为假、始终按 offPeak 计价。
*/
const LEGACY_PRICE_TABLE = {
	version: "legacy-before-2026-08-17",
	peakHours: [],
	models: {
		"deepseek-v4-flash-vision-exp": {
			offPeak: {
				input: 1,
				cacheHit: .02,
				output: 2
			},
			peak: {
				input: 1,
				cacheHit: .02,
				output: 2
			}
		},
		"deepseek-v4-flash": {
			offPeak: {
				input: 1,
				cacheHit: .02,
				output: 2
			},
			peak: {
				input: 1,
				cacheHit: .02,
				output: 2
			}
		},
		"deepseek-v4-pro": {
			offPeak: {
				input: 3,
				cacheHit: .025,
				output: 6
			},
			peak: {
				input: 3,
				cacheHit: .025,
				output: 6
			}
		}
	}
};
/** 2026-08-17 至 2026-09-10 12:00（北京时间）的旧峰谷价格。 */
const PRE_FLASH_PRICE_TABLE = {
	version: "2026-08-23",
	peakHours: [[9, 12], [14, 18]],
	models: {
		"deepseek-v4-flash-vision-exp": {
			offPeak: {
				input: 1.5,
				cacheHit: .05,
				output: 4.5
			},
			peak: {
				input: 3,
				cacheHit: .1,
				output: 9
			}
		},
		"deepseek-v4-flash": {
			offPeak: {
				input: 1.5,
				cacheHit: .05,
				output: 4.5
			},
			peak: {
				input: 3,
				cacheHit: .1,
				output: 9
			}
		},
		"deepseek-v4-pro": {
			offPeak: {
				input: 4.5,
				cacheHit: .15,
				output: 13.5
			},
			peak: {
				input: 9,
				cacheHit: .3,
				output: 27
			}
		}
	}
};
/**
* 峰谷新价格生效时刻：2026-08-17 00:00 北京时间 = 2026-08-16 16:00 UTC。
* 此前的调用按旧统一价计价，此后按峰谷价计价。
*/
const PEAK_PRICING_START = Date.UTC(2026, 7, 16, 16, 0, 0);
/** Flash 调价生效时刻：2026-09-10 12:00 北京时间 = 04:00 UTC。 */
const FLASH_PRICING_START = Date.UTC(2026, 8, 10, 4, 0, 0);
/**
* 节假日并入空闲时段的生效时刻：官方 2026-09-25 起执行
* （北京时间 2026-09-25 00:00 = 2026-09-24 16:00 UTC）。
* 之前的调用按原规则（工作日峰谷窗口 + 周末空闲）计算，历史重算不得回改。
*/
const STATUTORY_HOLIDAY_PRICING_START = Date.UTC(2026, 8, 24, 16, 0, 0);
/** 默认价格按历史生效时间选择；显式自定义表保留原覆盖行为。 */
function selectPriceTable(ts, table = PRICE_TABLE) {
	if (ts < PEAK_PRICING_START) return LEGACY_PRICE_TABLE;
	if (table !== PRICE_TABLE) return table;
	if (ts < FLASH_PRICING_START) return PRE_FLASH_PRICE_TABLE;
	return table;
}
/** 取时间戳对应的北京时间小时（0-23）；解析失败返回 -1。 */
function beijingHour(ts) {
	const hour = new Intl.DateTimeFormat("en-GB", {
		timeZone: "Asia/Shanghai",
		hour: "2-digit",
		hour12: false
	}).formatToParts(new Date(ts)).find((p) => p.type === "hour")?.value;
	return hour === void 0 ? -1 : Number(hour);
}
/** 取时间戳对应的北京时间星期（0=周日，6=周六）；解析失败返回 -1。 */
function beijingWeekday(ts) {
	const weekday = new Intl.DateTimeFormat("en-GB", {
		timeZone: "Asia/Shanghai",
		weekday: "short"
	}).formatToParts(new Date(ts)).find((p) => p.type === "weekday")?.value;
	return weekday === void 0 ? -1 : [
		"Sun",
		"Mon",
		"Tue",
		"Wed",
		"Thu",
		"Fri",
		"Sat"
	].indexOf(weekday);
}
/**
* 中国法定节假日（北京时间日期，YYYY-MM-DD）。
*
* 官方计费说明：北京时间周一至周五（不含中国法定节假日）9:00 - 12:00、14:00 - 18:00
* 为高峰时段；其余时段，包括周末及中国法定节假日全天均为空闲时段。
* 来源：https://api-docs.deepseek.com/zh-cn/quick_start/pricing/
* 数据：国务院办公厅 2026 年部分节假日安排。该年度的调休上班日（2026-01-04、02-14、
* 02-28、05-09、09-20、10-10）按官方口径仍属「周一至周五」之外，因此不收进本表；
* 新年度安排公布后需要同步更新，未收录的年份按周末规则处理。
*/
const CHINA_STATUTORY_HOLIDAYS = /* @__PURE__ */ new Set([
	"2026-01-01",
	"2026-01-02",
	"2026-01-03",
	"2026-02-15",
	"2026-02-16",
	"2026-02-17",
	"2026-02-18",
	"2026-02-19",
	"2026-02-20",
	"2026-02-21",
	"2026-02-22",
	"2026-02-23",
	"2026-04-04",
	"2026-04-05",
	"2026-04-06",
	"2026-05-01",
	"2026-05-02",
	"2026-05-03",
	"2026-05-04",
	"2026-05-05",
	"2026-06-19",
	"2026-06-20",
	"2026-06-21",
	"2026-09-25",
	"2026-09-26",
	"2026-09-27",
	"2026-10-01",
	"2026-10-02",
	"2026-10-03",
	"2026-10-04",
	"2026-10-05",
	"2026-10-06",
	"2026-10-07"
]);
/** 取时间戳对应的北京时间日期（YYYY-MM-DD）；解析失败返回空串。 */
function beijingDate(ts) {
	const parts = new Intl.DateTimeFormat("en-CA", {
		timeZone: "Asia/Shanghai",
		year: "numeric",
		month: "2-digit",
		day: "2-digit"
	}).formatToParts(new Date(ts));
	const pick = (type) => parts.find((p) => p.type === type)?.value;
	const year = pick("year");
	const month = pick("month");
	const day = pick("day");
	return year === void 0 || month === void 0 || day === void 0 ? "" : `${year}-${month}-${day}`;
}
/**
* 是否为北京时间当天的中国法定节假日；未收录年份、解析失败或早于生效时刻返回 false。
* @param ts - Epoch timestamp in milliseconds.
* @param holidays - Beijing-time statutory holiday dates.
* @returns True when the timestamp lands on a statutory holiday inside the effective window.
*/
function isStatutoryHoliday(ts, holidays = CHINA_STATUTORY_HOLIDAYS) {
	if (ts < STATUTORY_HOLIDAY_PRICING_START) return false;
	const date = beijingDate(ts);
	return date !== "" && holidays.has(date);
}
/**
* 高峰时段判定：周一至周五（不含中国法定节假日）按配置窗口为高峰；
* 周末与中国法定节假日全天为空闲时段。
*/
function isPeakHour(ts, peakHours, holidays = CHINA_STATUTORY_HOLIDAYS) {
	const weekday = beijingWeekday(ts);
	if (weekday === 0 || weekday === 6) return false;
	if (isStatutoryHoliday(ts, holidays)) return false;
	const hour = beijingHour(ts);
	return peakHours.some(([start, end]) => hour >= start && hour < end);
}
/**
* 计费资格统一入口：必须同时来自 DeepSeek 官方供应商并明确命中价格表。
* 允许已登记模型的版本后缀按最长前缀匹配；未知模型不再按 Flash 猜价。
*/
function resolvePricingEligibility(provider, model, ts, table = PRICE_TABLE) {
	if (!isOfficialProvider(provider) || typeof model !== "string") return void 0;
	const active = selectPriceTable(ts, table);
	const matched = Object.entries(active.models).sort(([a], [b]) => b.length - a.length).find(([name]) => model === name || model.startsWith(`${name}-`));
	if (matched === void 0) return void 0;
	return {
		provider: OFFICIAL_PROVIDER_ID,
		model,
		matchedModel: matched[0],
		price: matched[1]
	};
}
/**
* 按 (token 数, provider, 模型, 时间戳) 计算一次调用的费用。
* 缓存命中（cacheReadTokens）按 cacheHit 价；缓存写入（cacheWriteTokens）并入缓存未命中价。
* 未通过 provider + model 资格门禁时返回 undefined，调用方不得记录或展示费用。
*/
function priceUsage(inputTokens, cacheReadTokens, cacheWriteTokens, outputTokens, provider, model, ts, table = PRICE_TABLE) {
	if (![
		inputTokens,
		cacheReadTokens,
		cacheWriteTokens,
		outputTokens
	].every((value) => Number.isSafeInteger(value) && value >= 0)) return void 0;
	if (!Number.isSafeInteger(ts) || ts < 0) return void 0;
	const active = selectPriceTable(ts, table);
	const eligibility = resolvePricingEligibility(provider, model, ts, table);
	if (eligibility === void 0) return void 0;
	const peak = isPeakHour(ts, active.peakHours);
	const rate = peak ? eligibility.price.peak : eligibility.price.offPeak;
	const costInput = inputTokens / 1e6 * rate.input;
	const costCacheRead = cacheReadTokens / 1e6 * rate.cacheHit;
	const costCacheWrite = cacheWriteTokens / 1e6 * rate.input;
	const costCache = costCacheRead + costCacheWrite;
	const costOutput = outputTokens / 1e6 * rate.output;
	if (![
		costInput,
		costCacheRead,
		costCacheWrite,
		costCache,
		costOutput
	].every((value) => Number.isFinite(value) && value >= 0)) return void 0;
	const cost = costInput + costCache + costOutput;
	if (!Number.isFinite(cost) || cost < 0) return void 0;
	return {
		costInput,
		costCache,
		costCacheRead,
		costCacheWrite,
		costOutput,
		cost,
		peak
	};
}
//#endregion
//#region plugins/dsh-token-monitor/src/script-literals.ts
/** Literal values the adapter contract itself defines. */
const ALLOWED_TOKENS = /* @__PURE__ */ new Set([
	"GET",
	"POST",
	"bearer",
	"x-api-key",
	"credits"
]);
/** Credential-bearing property names an adapter never needs. */
const REFUSED_NAMES = /* @__PURE__ */ new Set([
	"authorization",
	"cookie",
	"set-cookie",
	"proxy-authorization",
	"apikey",
	"api_key",
	"api-key",
	"access_token",
	"refresh_token",
	"token",
	"secret",
	"client_secret",
	"password",
	"passwd",
	"signature",
	"credential",
	"credentials",
	"session",
	"sessionid",
	"session_id",
	"session_token"
]);
/** Short codes: currency, unit, HTTP status and similar bounded tokens. */
const SHORT_TOKEN = /^[A-Za-z0-9]{1,3}$/;
/** The relative request path an adapter may name. */
const PATH_LITERAL = /^\/[A-Za-z0-9._~%/-]*$/;
/** A response field name used with bracket access. */
const FIELD_NAME = /^[A-Za-z_][A-Za-z0-9_]{0,13}$/;
/** Prefix characters after which a slash opens a regular expression. */
const REGEX_PREFIX = /* @__PURE__ */ new Set([
	"",
	"(",
	",",
	"=",
	":",
	"[",
	"!",
	"&",
	"|",
	"?",
	"{",
	"}",
	";",
	"+",
	"-",
	"*",
	"%",
	"^",
	"<",
	">",
	"~"
]);
const MAX_JSON_DEPTH = 4;
/** An unbroken token-like run inside a comment: the shape a pasted credential leaves behind. */
const COMMENT_RUN = /[A-Za-z0-9_+=\-]{20,}/;
function regexCanStart(previous) {
	return REGEX_PREFIX.has(previous);
}
/** Skip one regular-expression literal, honouring escapes and character classes. */
function skipRegex(source, start) {
	let index = start + 1;
	let inClass = false;
	while (index < source.length) {
		const character = source[index];
		if (character === "\\") {
			index += 2;
			continue;
		}
		if (character === "[") inClass = true;
		else if (character === "]") inClass = false;
		else if (character === "/" && !inClass) return index + 1;
		else if (character === "\n") return index;
		index += 1;
	}
	return index;
}
/** Collect every string literal; comments are skipped and regexes are not literals. */
function literalsOf(source) {
	const literals = [];
	const comments = [];
	let index = 0;
	let previous = "";
	while (index < source.length) {
		const character = source[index];
		if (character === "/" && source[index + 1] === "/") {
			const end = source.indexOf("\n", index);
			comments.push(source.slice(index + 2, end === -1 ? source.length : end));
			index = end === -1 ? source.length : end + 1;
			continue;
		}
		if (character === "/" && source[index + 1] === "*") {
			const end = source.indexOf("*/", index + 2);
			comments.push(source.slice(index + 2, end === -1 ? source.length : end));
			index = end === -1 ? source.length : end + 2;
			continue;
		}
		if (character === "/" && regexCanStart(previous)) {
			index = skipRegex(source, index);
			previous = ")";
			continue;
		}
		if (character === "\"" || character === "'" || character === "`") {
			const quote = character;
			let cursor = index + 1;
			let escaped = false;
			let template = false;
			let closed = false;
			while (cursor < source.length) {
				const inner = source[cursor];
				if (inner === "\\") {
					cursor += 2;
					continue;
				}
				if (inner === "\n") break;
				if (quote === "`" && inner === "$" && source[cursor + 1] === "{") {
					template = true;
					break;
				}
				if (inner === quote) {
					closed = true;
					break;
				}
				cursor += 1;
			}
			const raw = source.slice(index + 1, Math.min(cursor, source.length));
			if (raw.includes("\\")) escaped = true;
			literals.push({
				value: raw,
				index: literals.length + 1,
				escaped,
				template
			});
			if (!closed) return {
				literals,
				comments
			};
			index = cursor + 1;
			previous = ")";
			continue;
		}
		if (!/\s/.test(character)) previous = character;
		index += 1;
	}
	return {
		literals,
		comments
	};
}
/** Whether every string inside a parsed JSON literal satisfies the policy. */
function jsonLiteralAllowed(value, depth) {
	if (depth > MAX_JSON_DEPTH) return false;
	if (typeof value === "string") return valueAllowed(value);
	if (Array.isArray(value)) return value.every((entry) => jsonLiteralAllowed(entry, depth + 1));
	if (value !== null && typeof value === "object") return Object.values(value).every((entry) => jsonLiteralAllowed(entry, depth + 1));
	return true;
}
/** Whether one literal value may appear in a saved adapter. */
function valueAllowed(value) {
	if (value.length === 0) return true;
	if (ALLOWED_TOKENS.has(value)) return true;
	if (SHORT_TOKEN.test(value)) return true;
	if (PATH_LITERAL.test(value)) return true;
	if (FIELD_NAME.test(value)) return !REFUSED_NAMES.has(value.toLowerCase());
	if (value.startsWith("{") && value.endsWith("}") || value.startsWith("[") && value.endsWith("]")) try {
		return jsonLiteralAllowed(JSON.parse(value), 0);
	} catch {
		return false;
	}
	if (value.startsWith("\"") && value.endsWith("\"") && value.length > 2) try {
		return jsonLiteralAllowed(JSON.parse(value), 0);
	} catch {
		return false;
	}
	return false;
}
/**
* Check one adapter source against the literal policy.
* @param source Complete keyless adapter source as saved by an editor or tool.
* @returns The first refused literal, or undefined when the source may be saved.
*/
function refuseScriptLiteral(source) {
	const { literals, comments } = literalsOf(source);
	for (const comment of comments) {
		const run = COMMENT_RUN.exec(comment);
		if (run !== null) return {
			index: 0,
			length: run[0].length,
			reason: "comment"
		};
	}
	for (const literal of literals) {
		const refused = literal.template ? "template" : literal.escaped ? "escape" : valueAllowed(literal.value) ? void 0 : "literal";
		if (refused !== void 0) return {
			index: literal.index,
			length: literal.value.length,
			reason: refused
		};
	}
}
//#endregion
//#region packages/util/token-monitor-contract/src/billing.ts
/** Normalize an empty multiplier; reject zero, negative and non-finite values.
* @param value Numeric multiplier or empty editor value.
* @returns Positive multiplier.
*/
function normalizeMultiplier(value) {
	if (value === "" || value === void 0 || value === null) return 1;
	if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) throw new TypeError("Invalid model multiplier");
	return value;
}
function object(value, keys) {
	if (!value || typeof value !== "object" || Array.isArray(value)) throw new TypeError("Expected object");
	const row = value;
	if (Object.keys(row).some((key) => !keys.includes(key))) throw new TypeError("Unknown billing field");
	return row;
}
function bool(value) {
	if (typeof value !== "boolean") throw new TypeError("Expected boolean");
	return value;
}
function id(value) {
	if (typeof value !== "string" || !value.trim() || value.length > 512) throw new TypeError("Invalid billing identifier");
	return value;
}
function price(value) {
	const row = object(value, [
		"input",
		"cacheHit",
		"cacheWrite",
		"output"
	]);
	for (const [key, item] of Object.entries(row)) {
		if (key === "cacheWrite" && item === "input") continue;
		if (item !== null && (typeof item !== "number" || !Number.isFinite(item) || item < 0 || item > 1e9)) throw new TypeError("Invalid unit price");
	}
	if (![
		"input",
		"cacheHit",
		"output"
	].every((key) => key in row)) throw new TypeError("Missing price field");
	return {
		input: row.input,
		cacheHit: row.cacheHit,
		output: row.output,
		..."cacheWrite" in row ? { cacheWrite: row.cacheWrite } : {}
	};
}
function source(value) {
	const row = object(value, [
		"templateId",
		"version",
		"name",
		"url",
		"verifiedAt",
		"effectiveAt",
		"originalCurrency",
		"originalUnit",
		"conversionBasis",
		"modified"
	]);
	const date = (value) => {
		if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value) || !Number.isFinite(Date.parse(value)) || new Date(value).toISOString().slice(0, 10) !== value) throw new TypeError("Invalid source date");
		return value;
	};
	const url = row.url === void 0 ? void 0 : id(row.url);
	if (url && !/^https?:\/\//i.test(url)) throw new TypeError("Invalid source URL");
	return {
		templateId: id(row.templateId),
		version: id(row.version),
		name: id(row.name),
		...url ? { url } : {},
		verifiedAt: row.verifiedAt === null ? null : date(row.verifiedAt),
		...row.effectiveAt === void 0 ? {} : { effectiveAt: date(row.effectiveAt) },
		originalCurrency: id(row.originalCurrency),
		originalUnit: id(row.originalUnit),
		conversionBasis: id(row.conversionBasis),
		modified: bool(row.modified)
	};
}
function unique(values, key) {
	if (new Set(values.map(key)).size !== values.length) throw new TypeError("Duplicate billing identifier");
	return values;
}
/** Validate and copy a complete configuration from disk or HTTP.
* @param value Untrusted decoded JSON.
* @returns Canonical configuration with normalized multipliers.
*/
function validateBillingRules(value) {
	const row = object(value, ["version", "providers"]);
	if (row.version !== 1 || !Array.isArray(row.providers) || row.providers.length > 500) throw new TypeError("Invalid billing version or providers");
	return {
		version: 1,
		providers: unique(row.providers.map((value) => {
			const provider = object(value, [
				"provider",
				"enabled",
				"models"
			]);
			if (!Array.isArray(provider.models) || provider.models.length > 5e3) throw new TypeError("Invalid models");
			return {
				provider: id(provider.provider),
				enabled: bool(provider.enabled),
				models: unique(provider.models.map((value) => {
					const model = object(value, [
						"model",
						"enabled",
						"multiplier",
						"mode",
						"fixed",
						"peak",
						"offPeak",
						"periods",
						"tiers",
						"peakTiers",
						"offPeakTiers",
						"source"
					]);
					if (model.mode !== "fixed" && model.mode !== "peak") throw new TypeError("Invalid price mode");
					if (!Array.isArray(model.periods) || model.periods.length > 50) throw new TypeError("Invalid peak periods");
					const periods = model.periods.map((value) => {
						const period = object(value, [
							"days",
							"start",
							"end"
						]);
						if (!Array.isArray(period.days) || !period.days.length || period.days.some((day) => !Number.isInteger(day) || day < 0 || day > 6)) throw new TypeError("Invalid weekdays");
						if (!Number.isInteger(period.start) || !Number.isInteger(period.end) || period.start < 0 || period.end > 1440 || period.start >= period.end) throw new TypeError("Invalid peak interval");
						return {
							days: [...new Set(period.days)],
							start: period.start,
							end: period.end
						};
					});
					const tierFields = {};
					for (const key of [
						"tiers",
						"peakTiers",
						"offPeakTiers"
					]) {
						const values = model[key];
						if (values === void 0) continue;
						if (!Array.isArray(values) || values.length > 50) throw new TypeError("Invalid price tiers");
						let previous = 0;
						const tiers = values.map((value, index, values) => {
							const tier = object(value, [
								"maxInputTokens",
								"input",
								"cacheHit",
								"cacheWrite",
								"output"
							]);
							const max = tier.maxInputTokens;
							if (max === null && index !== values.length - 1) throw new TypeError("Invalid price tier boundary");
							if (max !== null && (!Number.isSafeInteger(max) || max <= previous)) throw new TypeError("Invalid price tier boundary");
							previous = max === null ? Number.MAX_SAFE_INTEGER : max;
							const { maxInputTokens: _max, ...rates } = tier;
							return {
								maxInputTokens: max,
								...price(rates)
							};
						});
						if (tiers.length > 0 && tiers.at(-1)?.maxInputTokens !== null) throw new TypeError("Final price tier must be open ended");
						tierFields[key] = tiers;
					}
					return {
						model: id(model.model),
						enabled: bool(model.enabled),
						multiplier: normalizeMultiplier(model.multiplier),
						mode: model.mode,
						fixed: price(model.fixed),
						peak: price(model.peak),
						offPeak: price(model.offPeak),
						periods,
						...tierFields,
						...model.source === void 0 ? {} : { source: source(model.source) }
					};
				}), (rule) => rule.model)
			};
		}), (rule) => rule.provider)
	};
}
/** Create an editable, unpriced model rule.
* @param model Exact catalog model identifier.
* @returns Independent draft.
*/
function emptyBillingRule(model) {
	return {
		model,
		enabled: true,
		multiplier: 1,
		mode: "fixed",
		fixed: {
			input: null,
			cacheHit: null,
			output: null
		},
		peak: {
			input: null,
			cacheHit: null,
			output: null
		},
		offPeak: {
			input: null,
			cacheHit: null,
			output: null
		},
		periods: [{
			days: [
				1,
				2,
				3,
				4,
				5
			],
			start: 540,
			end: 720
		}, {
			days: [
				1,
				2,
				3,
				4,
				5
			],
			start: 840,
			end: 1080
		}],
		tiers: []
	};
}
//#endregion
//#region packages/util/token-monitor-contract/src/index.ts
/** Maximum daily budget accepted by Token Monitor settings validation. */
const TOKEN_MONITOR_MAX_DAILY_BUDGET_CNY = 1e6;
/** Default values applied when no persisted Token Monitor settings exist. */
const DEFAULT_TOKEN_MONITOR_SETTINGS = Object.freeze({
	displayMode: "balance",
	showWhaleGirl: true,
	animationScale: .8,
	dailyBudgetEnabled: true,
	dailyBudgetCny: 10,
	budgetExceededNotificationEnabled: false,
	peakReminderEnabled: true,
	peakReminderEnterPeak: true,
	peakReminderEnterValley: true,
	notifyOncePerTransition: false,
	whaleBubbleEnabled: true,
	wechatNotificationsEnabled: true,
	cacheHitAnomalyNotificationEnabled: false,
	cacheHitAnomalyThreshold: 30,
	cacheHitAnomalyConsecutiveCalls: 3
});
Object.freeze([
	"displayMode",
	"showWhaleGirl",
	"animationScale",
	"dailyBudgetEnabled",
	"dailyBudgetCny",
	"budgetExceededNotificationEnabled",
	"peakReminderEnabled",
	"peakReminderEnterPeak",
	"peakReminderEnterValley",
	"notifyOncePerTransition",
	"whaleBubbleEnabled",
	"wechatNotificationsEnabled",
	"cacheHitAnomalyNotificationEnabled",
	"cacheHitAnomalyThreshold",
	"cacheHitAnomalyConsecutiveCalls"
]);
//#endregion
//#region plugins/dsh-token-monitor/src/billing.ts
/** Freeze exact model rules and CNY costs at collection time. */
/** Rule identity and settlement facts stored with each usage ledger record. */
/**
* 官方峰谷口径的适用范围：DeepSeek 模型无论由官方供应商还是第三方接入，
* 都在中国法定节假日整天空闲、工作日按配置窗口计高峰。
*/
function isDeepseekBillingModel(provider, model) {
	return isOfficialProvider(provider) || /deepseek/i.test(model);
}
/** Seed official exact model ids from the installed source-cited table.
* @param table Existing deployment price override.
* @returns Editable Host defaults.
*/
function defaultBillingRules(table = PRICE_TABLE) {
	const periods = table.peakHours.map(([start, end]) => ({
		days: [
			1,
			2,
			3,
			4,
			5
		],
		start: start * 60,
		end: end * 60
	}));
	const fromPrice = (model, price) => ({
		...emptyBillingRule(model),
		mode: "peak",
		peak: { ...price },
		offPeak: { ...price },
		periods: structuredClone(periods)
	});
	const deepseek = Object.entries(table.models).map(([model, price]) => ({
		...emptyBillingRule(model),
		mode: "peak",
		peak: { ...price.peak },
		offPeak: { ...price.offPeak },
		periods: structuredClone(periods)
	}));
	const openaiPrices = {
		"gpt-5.4": {
			input: 2.5,
			cacheHit: .25,
			output: 15
		},
		"gpt-5.4-mini": {
			input: .75,
			cacheHit: .075,
			output: 4.5
		},
		"gpt-5.5": {
			input: 5,
			cacheHit: .5,
			output: 30
		},
		"gpt-5.6-luna": {
			input: 2,
			cacheHit: .2,
			output: 12
		},
		"gpt-5.6-sol": {
			input: 5,
			cacheHit: .5,
			output: 30
		},
		"gpt-5.6-terra": {
			input: 2,
			cacheHit: .2,
			output: 12
		},
		"gpt-6-astra": {
			input: 10,
			cacheHit: 1,
			output: 50
		}
	};
	const zhipuPrices = {
		"glm-5": {
			input: 4,
			cacheHit: 1,
			output: 18
		},
		"glm-5-turbo": {
			input: 5,
			cacheHit: 1.2,
			output: 22
		},
		"glm-5.1": {
			input: 3.6,
			cacheHit: .78,
			output: 14.4
		},
		"glm-5.2": {
			input: 5.6,
			cacheHit: 1.4,
			output: 19.6
		},
		"glm-5.3": {
			input: 6.4,
			cacheHit: 1.6,
			output: 22.4
		},
		"glm-5.3-flash": {
			input: .4,
			cacheHit: .115,
			output: 1.4
		}
	};
	const zhipuTiers = {
		"glm-5": [{
			maxInputTokens: 32e3,
			input: 4,
			cacheHit: 1,
			output: 18
		}, {
			maxInputTokens: null,
			input: 6,
			cacheHit: 1,
			output: 22
		}],
		"glm-5-turbo": [{
			maxInputTokens: 32e3,
			input: 5,
			cacheHit: 1.2,
			output: 22
		}, {
			maxInputTokens: null,
			input: 7,
			cacheHit: 1.2,
			output: 26
		}],
		"glm-5.1": [{
			maxInputTokens: 32e3,
			input: 3.6,
			cacheHit: .78,
			output: 14.4
		}, {
			maxInputTokens: null,
			input: 4.8,
			cacheHit: .78,
			output: 16.8
		}]
	};
	const rules = {
		version: 1,
		providers: [
			{
				provider: "deepseek-official",
				enabled: true,
				models: deepseek
			},
			{
				provider: "openai",
				enabled: true,
				models: Object.entries(openaiPrices).map(([model, price]) => fromPrice(model, price))
			},
			{
				provider: "zhipu",
				enabled: true,
				models: Object.entries(zhipuPrices).map(([model, price]) => ({
					...fromPrice(model, price),
					...zhipuTiers[model] ? { tiers: zhipuTiers[model].map((tier) => ({ ...tier })) } : {}
				}))
			},
			{
				provider: "kimi",
				enabled: true,
				models: Object.entries({ "kimi-k3": {
					input: 19,
					cacheHit: 1.9,
					output: 95
				} }).map(([model, price]) => fromPrice(model, price))
			}
		]
	};
	for (const provider of rules.providers) for (const rule of provider.models) rule.source = {
		templateId: `${provider.provider}/${rule.model}`,
		version: isOfficialProvider(provider.provider) ? table.version : "legacy-2026-09-15",
		name: "Installed pricing table",
		...isOfficialProvider(provider.provider) ? { url: "https://api-docs.deepseek.com/zh-cn/quick_start/pricing/" } : {},
		verifiedAt: null,
		originalCurrency: isOfficialProvider(provider.provider) ? "CNY" : "unknown",
		originalUnit: "per million tokens",
		conversionBasis: isOfficialProvider(provider.provider) ? "CNY; no conversion" : "Legacy numeric values interpreted as CNY; original currency and conversion not verified",
		modified: false
	};
	return rules;
}
/** Select tiers by total input context and charge disjoint categories; image input is already included.
* @param snapshot Validated Host configuration and revision.
* @param usage Disjoint token counts.
* @param provider Exact provider id.
* @param model Exact model id.
* @param timestamp Settlement time.
* @returns Frozen costs and explicit billing state.
*/
function billUsage(snapshot, usage, provider, model, timestamp) {
	const { owner } = resolveBillingProvider(snapshot.rules, provider);
	const rule = owner?.models.find((item) => item.model === model);
	const result = {
		cost: 0,
		costInput: 0,
		costCache: 0,
		costCacheRead: 0,
		costCacheWrite: 0,
		costOutput: 0,
		peak: false,
		billingStatus: "unpriced",
		billingRuleVersion: snapshot.revision,
		modelMultiplier: rule?.multiplier ?? 1,
		...rule ? { billingRule: structuredClone(rule) } : {}
	};
	if (owner?.enabled === false || rule?.enabled === false) return {
		...result,
		billingStatus: "disabled",
		billingReason: owner?.enabled === false ? "provider-disabled" : "model-disabled"
	};
	if (!rule) return {
		...result,
		billingReason: "rule-missing"
	};
	const date = new Date(timestamp + 288e5);
	const minute = date.getUTCHours() * 60 + date.getUTCMinutes();
	const statutoryHoliday = isDeepseekBillingModel(provider, rule.model) && isStatutoryHoliday(timestamp);
	const peak = rule.mode === "peak" && !statutoryHoliday && rule.periods.some((period) => period.days.includes(date.getUTCDay()) && minute >= period.start && minute < period.end);
	const baseRate = rule.mode === "fixed" ? rule.fixed : peak ? rule.peak : rule.offPeak;
	const contextTokens = usage.inputTokens + usage.cacheReadTokens + usage.cacheWriteTokens;
	const tier = (rule.mode === "fixed" ? rule.tiers : (peak ? rule.peakTiers : rule.offPeakTiers) ?? rule.tiers)?.find((item) => item.maxInputTokens === null || contextTokens <= item.maxInputTokens);
	const selectedRate = tier ?? baseRate;
	const rate = {
		input: selectedRate.input,
		cacheHit: selectedRate.cacheHit,
		output: selectedRate.output,
		cacheWrite: selectedRate.cacheWrite === void 0 || selectedRate.cacheWrite === "input" ? selectedRate.input : selectedRate.cacheWrite
	};
	const ruleJson = JSON.stringify([provider, rule], (_key, value) => value && typeof value === "object" && !Array.isArray(value) ? Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b))) : value);
	result.billingApplied = {
		ruleId: createHash("sha256").update(ruleJson).digest("hex"),
		mode: rule.mode === "fixed" ? "fixed" : peak ? "peak" : "offPeak",
		...tier ? { tierMax: tier.maxInputTokens } : {},
		rate
	};
	if (Object.values(rate).every((value) => value === null) || usage.inputTokens > 0 && rate.input === null || usage.cacheWriteTokens > 0 && rate.cacheWrite === null || usage.cacheReadTokens > 0 && rate.cacheHit === null || usage.outputTokens > 0 && rate.output === null) return {
		...result,
		peak,
		billingReason: "rate-missing"
	};
	const costInput = usage.inputTokens / 1e6 * (rate.input ?? 0) * rule.multiplier;
	const costCacheRead = usage.cacheReadTokens / 1e6 * (rate.cacheHit ?? 0) * rule.multiplier;
	const costCacheWrite = usage.cacheWriteTokens / 1e6 * (rate.cacheWrite ?? 0) * rule.multiplier;
	const costOutput = usage.outputTokens / 1e6 * (rate.output ?? 0) * rule.multiplier;
	const costCache = costCacheRead + costCacheWrite, cost = costInput + costCache + costOutput;
	if (![
		cost,
		timestamp,
		...Object.values(usage)
	].every(Number.isFinite)) return {
		...result,
		peak,
		billingReason: "invalid-usage"
	};
	return {
		...result,
		costInput,
		costCacheRead,
		costCacheWrite,
		costOutput,
		costCache,
		cost,
		peak,
		billingStatus: "priced"
	};
}
//#endregion
//#region plugins/dsh-token-monitor/src/plugin-store.ts
/** 同一进程内并发写同一文件的冲突。 */
var PluginStoreConflictError = class extends Error {
	expected;
	actual;
	constructor(expected, actual) {
		super("Plugin state revision conflict");
		this.expected = expected;
		this.actual = actual;
	}
};
//#endregion
//#region plugins/dsh-token-monitor/src/balance-config.ts
/** Provider-owned script persistence, endpoint approval and independent revisions. */
/** Endpoints the built-in official adapter may use without an explicit approval. */
const OFFICIAL_BALANCE_ENDPOINTS = Object.freeze([{
	path: "/user/balance",
	method: "GET"
}]);
const SENSITIVE_SCRIPT_ERROR = "Balance scripts stay keyless: only a request path, GET/POST, an auth kind, response field names and a JSON body may appear";
const UNAPPROVED_SCRIPT_ERROR = "Endpoint not approved: querying stays paused until this exact path and method are approved";
/** A script carries material that must never enter settings or a model context. */
var SensitiveBalanceScriptError = class extends Error {
	constructor() {
		super(SENSITIVE_SCRIPT_ERROR);
	}
};
/** Approval may only name the endpoint the saved adapter actually declares. */
var BalanceEndpointMismatchError = class extends Error {
	constructor() {
		super("Balance endpoint approval must match the saved adapter request");
	}
};
/** Describe a refused literal without echoing its value. */
function refusedError(refused) {
	if (refused.reason === "comment") return "Balance script comments contain a " + String(refused.length) + "-character token-like run; keep credentials out of comments";
	if (refused.reason === "template") return "Balance script literal " + String(refused.index) + " uses template substitution; adapters must be plain keyless source";
	if (refused.reason === "escape") return "Balance script literal " + String(refused.index) + " uses an escape sequence; adapters must be plain keyless source";
	return "Balance script literal " + String(refused.index) + " (" + String(refused.length) + " characters) is outside the allowed vocabulary; an adapter may only name a request path, GET/POST, an auth kind, response field names and a JSON body";
}
/** Refuse source that could carry a pasted credential, endpoint or generated code. */
function assertKeylessBalanceScript(script) {
	if (refuseScriptLiteral(script) !== void 0) throw new SensitiveBalanceScriptError();
}
/** Saved script edits do not require a separate activation operation. */
var BalanceScriptConfig = class {
	store;
	resolveAdapter;
	validations = /* @__PURE__ */ new Map();
	constructor(store, resolveAdapter = async () => void 0) {
		this.store = store;
		this.resolveAdapter = resolveAdapter;
	}
	/** Read the provider's saved text and validation state, without querying its API.
	* @param provider Exact configured provider id.
	* @returns Keyless state of the currently saved script.
	*/
	async read(provider) {
		if (provider !== "deepseek-account") return this.readScript(provider);
		const saved = this.store.get().balanceScripts?.[provider];
		const legacy = saved !== void 0 && saved.enabled === void 0 ? await this.readScript(provider) : void 0;
		const enabled = saved?.enabled ?? (legacy === void 0 || legacy.status === "valid");
		return {
			provider,
			revision: saved?.revision ?? 0,
			script: "",
			source: "native-account",
			enabled,
			status: enabled ? "valid" : legacy?.status ?? "unconfigured"
		};
	}
	async readScript(provider) {
		const saved = this.store.get().balanceScripts?.[provider];
		const adapter = saved === void 0 ? await this.resolveAdapter(provider) : void 0;
		const entry = saved ?? {
			revision: 0,
			script: adapter?.script ?? (isOfficialProvider(provider) ? OFFICIAL_BALANCE_SCRIPT : "")
		};
		const key = adapter === void 0 ? "saved" : "built-in";
		const cached = this.validations.get(provider);
		if (cached?.key === key && cached.script === entry.script) return {
			...await cached.value,
			revision: entry.revision
		};
		const value = (async () => {
			if (!entry.script.trim()) return {
				provider,
				...entry,
				status: "unconfigured"
			};
			const refused = refuseScriptLiteral(entry.script);
			if (refused !== void 0) return {
				provider,
				revision: entry.revision,
				script: "",
				status: "invalid",
				error: refusedError(refused)
			};
			try {
				const request = validateBalanceRequest(await evaluateBalanceScript(entry.script));
				if (!this.approvedEndpoints(provider, adapter).some((endpoint) => endpointKey(endpoint) === endpointKey(request))) return {
					provider,
					...entry,
					status: "unapproved",
					request,
					error: UNAPPROVED_SCRIPT_ERROR
				};
				return {
					provider,
					...entry,
					status: "valid",
					request,
					...adapter === void 0 ? {} : {
						source: "built-in",
						adapter: adapter.label
					}
				};
			} catch (error) {
				return {
					provider,
					...entry,
					status: "invalid",
					error: error instanceof Error ? error.message : "Invalid balance script"
				};
			}
		})();
		this.validations.set(provider, {
			key,
			script: entry.script,
			value
		});
		return value;
	}
	/** Approve the endpoint the saved adapter declares, leaving every other target refused.
	* @param provider Exact configured provider id.
	* @param endpoint Candidate taken from the saved adapter's request.
	* @returns Saved and automatically revalidated state.
	*/
	async approve(provider, endpoint) {
		if (provider === "deepseek-account") throw new BalanceEndpointMismatchError();
		const target = validateBalanceEndpoint(endpoint);
		const snapshot = await this.read(provider);
		if (snapshot.status !== "unapproved" || snapshot.request === void 0 || endpointKey(snapshot.request) !== endpointKey(target)) throw new BalanceEndpointMismatchError();
		for (let attempt = 0; attempt < 4; attempt++) {
			const state = this.store.get();
			const next = [target, ...(state.balanceEndpoints?.[provider] ?? []).filter((item) => endpointKey(item) !== endpointKey(target))].slice(0, 8);
			try {
				await this.store.update({ balanceEndpoints: { [provider]: next } }, state.revision);
				this.validations.delete(provider);
				return await this.read(provider);
			} catch (error) {
				if (error instanceof PluginStoreConflictError && attempt < 3) continue;
				throw error;
			}
		}
		throw new BalanceScriptConflictError();
	}
	/** Save a whole script using its provider-local revision; invalid text is retained.
	* @param provider Exact configured provider id.
	* @param script Complete keyless source; empty clears the configuration.
	* @param expectedRevision Last observed provider-local revision.
	* @returns Saved and automatically validated state.
	*/
	async update(provider, script, expectedRevision) {
		if (provider === "deepseek-account") {
			if (script.trim()) throw new TypeError("Use the native account query switch, not a script");
			return this.updateNative(provider, false, expectedRevision);
		}
		if (!Number.isSafeInteger(expectedRevision) || expectedRevision < 0) throw new TypeError("Invalid balance revision");
		assertKeylessBalanceScript(script);
		const next = {
			revision: expectedRevision + 1,
			script
		};
		validateBalanceScripts({ [provider]: next });
		for (let attempt = 0; attempt < 4; attempt++) {
			const state = this.store.get();
			const current = state.balanceScripts?.[provider];
			if ((current?.revision ?? 0) !== expectedRevision) throw new BalanceScriptConflictError();
			if (current?.script === script) return this.read(provider);
			try {
				await this.store.update({ balanceScripts: { [provider]: next } }, state.revision);
				return this.read(provider);
			} catch (error) {
				if (error instanceof PluginStoreConflictError && attempt < 3) continue;
				throw error;
			}
		}
		throw new BalanceScriptConflictError();
	}
	/** Remove one provider's saved script so a Host-shipped adapter (if any) resumes.
	* @param provider Exact configured provider id.
	* @param expectedRevision Last observed provider-local revision.
	* @returns Post-clear state, resolved through the built-in adapter when one exists.
	*/
	async clear(provider, expectedRevision) {
		for (let attempt = 0; attempt < 4; attempt++) {
			const state = this.store.get();
			const current = state.balanceScripts?.[provider];
			if (current === void 0) {
				this.validations.delete(provider);
				return await this.read(provider);
			}
			if ((current?.revision ?? 0) !== expectedRevision) throw new BalanceScriptConflictError();
			try {
				await this.store.update({ balanceScripts: { [provider]: void 0 } }, state.revision);
				this.validations.delete(provider);
				return await this.read(provider);
			} catch (error) {
				if (error instanceof PluginStoreConflictError && attempt < 3) continue;
				throw error;
			}
		}
		throw new BalanceScriptConflictError();
	}
	/** Remove one provider's saved script so a Host-shipped adapter (if any) resumes.
	*
	* Saving text is the owner's explicit choice and always wins over shipped
	* adapters, so removal is the one way back: an emptied script merely
	* switches querying off, it does not restore the shipped adapter.
	* @param provider Exact configured provider id.
	* @param expectedRevision Last observed provider-local revision.
	* @returns Post-removal state, resolved through the built-in adapter when one exists.
	*/
	async remove(provider, expectedRevision) {
		if (provider === "deepseek-account") throw new TypeError("The native account query has no saved script to remove");
		if (!Number.isSafeInteger(expectedRevision) || expectedRevision < 0) throw new TypeError("Invalid balance revision");
		for (let attempt = 0; attempt < 4; attempt++) {
			const state = this.store.get();
			const current = state.balanceScripts?.[provider];
			if (current === void 0) {
				this.validations.delete(provider);
				return await this.read(provider);
			}
			if ((current?.revision ?? 0) !== expectedRevision) throw new BalanceScriptConflictError();
			try {
				await this.store.update({ balanceScripts: { [provider]: void 0 } }, state.revision);
				this.validations.delete(provider);
				return await this.read(provider);
			} catch (error) {
				if (error instanceof PluginStoreConflictError && attempt < 3) continue;
				throw error;
			}
		}
		throw new BalanceScriptConflictError();
	}
	/** Persist a native-account query switch using the same provider-local revision. */
	async updateNative(provider, enabled, expectedRevision) {
		if (provider !== "deepseek-account" || typeof enabled !== "boolean" || !Number.isSafeInteger(expectedRevision) || expectedRevision < 0) throw new TypeError("Invalid native balance settings");
		for (let attempt = 0; attempt < 4; attempt++) {
			const state = this.store.get();
			const current = state.balanceScripts?.[provider];
			if ((current?.revision ?? 0) !== expectedRevision) throw new BalanceScriptConflictError();
			if (current?.enabled === enabled) return this.read(provider);
			const next = {
				revision: expectedRevision + 1,
				script: current?.script ?? "",
				enabled
			};
			try {
				await this.store.update({ balanceScripts: { [provider]: next } }, state.revision);
				return this.read(provider);
			} catch (error) {
				if (error instanceof PluginStoreConflictError && attempt < 3) continue;
				throw error;
			}
		}
		throw new BalanceScriptConflictError();
	}
	/** Approved endpoints for one provider; shipped adapters and the official seed are approved by construction. */
	approvedEndpoints(provider, adapter) {
		const stored = this.store.get().balanceEndpoints?.[provider];
		if (stored !== void 0) return stored;
		const shipped = adapter === void 0 ? [] : [adapter.endpoint];
		return isOfficialProvider(provider) ? [...OFFICIAL_BALANCE_ENDPOINTS, ...shipped] : shipped;
	}
};
//#endregion
//#region plugins/dsh-token-monitor/src/balance-adapters.ts
/**
* Built-in balance adapters for gateways we already know.
*
* A provider whose configured endpoint belongs to a known gateway gets its
* balance adapter from here instead of from a hand-written script: the adapter
* is keyless, carries no credential, names one relative request target and is
* approved by construction, so the feature works the moment that provider is
* configured. A saved provider script always wins over a built-in adapter, and
* a gateway we do not know still needs an explicit script plus endpoint
* approval.
* @module dsh-token-monitor/balance-adapters
*/
/** fastaitoken usage endpoint: remaining quota plus its unit and activation flag. */
const FASTAI_BALANCE_SCRIPT = `({
  request: { path: "/v1/usage", method: "GET", auth: "bearer" },
  parse(response) {
    const remaining = response?.remaining ?? response?.quota?.remaining ?? response?.balance;
    const currency = response?.unit ?? response?.quota?.unit ?? "USD";
    return {
      isAvailable: response?.is_active ?? response?.isValid ?? true,
      totalBalance: remaining,
      currency: currency === "credits" ? "credits" : String(currency).toUpperCase()
    };
  }
})`;
/**
* GLM Coding Plan (Zhipu) quota endpoint: rolling CREDIT_LIMIT windows for the
* 5-hour and weekly credit allowances. The primary balance shows the shortest
* window's remaining credits; both windows travel as `windows` for the UI.
*/
const GLM_BALANCE_SCRIPT = `({
  request: { path: "/api/monitor/usage/quota/limit", method: "GET", auth: "bearer" },
  parse(response) {
    const limits = (response?.data?.limits ?? []).filter(item => item && item.type === "CREDIT_LIMIT");
    const unitChar = unit => unit === 3 ? "h" : unit === 4 ? "m" : "w";
    const windows = limits.map(item => ({
      label: item.number + unitChar(item.unit),
      used: item.currentValue ?? 0,
      total: item.usage ?? 0,
      resetAt: item.nextResetTime
    }));
    const primary = windows[0];
    if (!primary) return { isAvailable: false, totalBalance: 0, currency: "credits", windows: [] };
    return {
      isAvailable: true,
      totalBalance: Math.max(primary.total - primary.used, 0),
      currency: "credits",
      windows
    };
  }
})`;
/** Adapters the Host ships and approves itself. */
const BUILT_IN_BALANCE_ADAPTERS = Object.freeze([
	{
		domain: "api.deepseek.com",
		label: "DeepSeek",
		script: OFFICIAL_BALANCE_SCRIPT,
		endpoint: Object.freeze({
			path: "/user/balance",
			method: "GET"
		})
	},
	{
		domain: "fastaitoken.com",
		label: "fastaitoken",
		script: FASTAI_BALANCE_SCRIPT,
		endpoint: Object.freeze({
			path: "/v1/usage",
			method: "GET"
		})
	},
	{
		domain: "bigmodel.cn",
		label: "GLM Coding Plan",
		script: GLM_BALANCE_SCRIPT,
		endpoint: Object.freeze({
			path: "/api/monitor/usage/quota/limit",
			method: "GET"
		})
	},
	{
		domain: "z.ai",
		label: "GLM Coding Plan",
		script: GLM_BALANCE_SCRIPT,
		endpoint: Object.freeze({
			path: "/api/monitor/usage/quota/limit",
			method: "GET"
		})
	}
]);
/** Whether one endpoint hostname belongs to a gateway domain on a label boundary. */
function matchesDomain$1(hostname, domain) {
	return hostname === domain || hostname.endsWith("." + domain);
}
/** Pick the built-in adapter for one configured provider endpoint.
* @param baseURL Provider endpoint exactly as configured; other hosts match nothing.
* @returns The adapter serving that host, or undefined for an unknown gateway.
*/
function builtInBalanceAdapter(baseURL) {
	let hostname;
	try {
		hostname = new URL(baseURL).hostname.toLowerCase();
	} catch {
		return;
	}
	return BUILT_IN_BALANCE_ADAPTERS.find((adapter) => matchesDomain$1(hostname, adapter.domain));
}
//#endregion
//#region plugins/dsh-token-monitor/src/balance-network.ts
/** Credential-bearing transport with public-address DNS pinning and no redirects. */
/** Fake-IP range handed back by TUN proxies (Mihomo/Clash default, RFC 2544 space). */
const FAKE_IP_V4 = ipaddr.IPv4.parseCIDR("198.18.0.0/15");
/** Accept only globally routable unicast addresses, including mapped IPv4 checks.
* @param address Resolved numeric address.
* @returns Whether the address may receive provider credentials.
*/
function publicBalanceAddress(address) {
	if (!ipaddr.isValid(address)) return false;
	return ipaddr.process(address).range() === "unicast";
}
/** Accept the one Fake-IP range a TUN proxy substitutes for an ordinary public domain.
* Only native IPv4 answers qualify; IPv4-mapped IPv6 forms and every other reserved range
* stay refused, so this is not a general allowance for non-public destinations.
* @param address Resolved numeric address.
* @returns Whether the address is the IPv4 Fake-IP candidate range.
*/
function fakeIpBalanceAddress(address) {
	if (!ipaddr.isValid(address) || !ipaddr.IPv4.isValid(address)) return false;
	const parsed = ipaddr.process(address);
	return parsed.kind() === "ipv4" && parsed.match(FAKE_IP_V4);
}
/** An HTTP response outside 2xx, carrying only the status so callers can classify it. */
var BalanceHttpError = class extends Error {
	status;
	/** @param status Status code returned by the provider. */
	constructor(status) {
		super("Balance HTTP " + String(status));
		this.status = status;
		this.name = "BalanceHttpError";
	}
};
/** Ordinary transport results stay plain errors and keep the short-recovery backoff, while an
* explicit upstream wait or a policy refusal is surfaced so the caller can classify the failure.
*/
var BalanceNetworkError = class extends Error {
	kind;
	retryAfterMs;
	/** @param kind Backoff-relevant classification.
	* @param message Fixed message without provider or network details.
	* @param retryAfterMs Explicit upstream wait, already bounded, when the provider asked for one.
	*/
	constructor(kind, message, retryAfterMs) {
		super(message);
		this.kind = kind;
		this.retryAfterMs = retryAfterMs;
		this.name = "BalanceNetworkError";
	}
};
/** Read an explicit provider wait so a requested pause is never shortened to the default.
* @param headers Response headers from the provider.
* @returns Bounded retry delay in milliseconds, or undefined when absent or unusable.
*/
function retryAfterMs(headers) {
	const raw = headers["retry-after"];
	const value = Array.isArray(raw) ? raw[0] : raw;
	if (typeof value !== "string" || value.trim() === "") return void 0;
	const seconds = Number(value.trim());
	const delay = Number.isFinite(seconds) ? seconds * 1e3 : Date.parse(value) - Date.now();
	if (!Number.isFinite(delay) || delay <= 0) return void 0;
	return Math.min(Math.max(delay, 15e3), 18e5);
}
/** Query one Host-resolved destination; scripts never receive its origin, key or raw headers.
* @param descriptor Validated path-only request entry.
* @param baseURL Host-private provider endpoint.
* @param apiKey Current provider credential, attached only after DNS checks.
* @param signal Cancellation on provider/script/key changes or shutdown.
* @returns Bounded parsed JSON response.
*/
async function requestBalanceJson(descriptor, baseURL, apiKey, signal) {
	const allowed = validateBalanceRequest(descriptor);
	const base = new URL(baseURL);
	if (base.protocol !== "https:" || base.username || base.password || base.search || base.hash || base.port !== "" && base.port !== "443" || base.hostname.endsWith(".")) throw new Error("Balance provider endpoint must be exact HTTPS");
	const url = new URL(allowed.path, base.origin);
	const domainTarget = !ipaddr.isValid(url.hostname.replace(/^\[|\]$/g, ""));
	const boundedSignal = AbortSignal.any([signal, AbortSignal.timeout(1e4)]);
	let cancelLookup;
	const records = await Promise.race([lookup(url.hostname.replace(/^\[|\]$/g, ""), {
		all: true,
		verbatim: true
	}), new Promise((_, reject) => {
		cancelLookup = () => reject(/* @__PURE__ */ new Error("Balance request cancelled"));
		if (boundedSignal.aborted) cancelLookup();
		else boundedSignal.addEventListener("abort", cancelLookup, { once: true });
	})]).finally(() => {
		if (cancelLookup) boundedSignal.removeEventListener("abort", cancelLookup);
	});
	boundedSignal.throwIfAborted();
	const acceptable = (address) => publicBalanceAddress(address) || domainTarget && fakeIpBalanceAddress(address);
	if (records.length === 0 || records.some((record) => !acceptable(record.address))) throw new BalanceNetworkError("blocked", "Balance destination must resolve to public or supported Fake-IP addresses");
	const pinned = records[0];
	return new Promise((resolve, reject) => {
		const req = request(url, {
			method: allowed.method,
			agent: false,
			signal: boundedSignal,
			lookup: (_hostname, options, callback) => {
				setImmediate(() => {
					if (options.all) callback(null, [pinned]);
					else callback(null, pinned.address, pinned.family);
				});
			},
			headers: {
				Accept: "application/json",
				"Accept-Encoding": "identity",
				...allowed.auth === "bearer" ? { Authorization: `Bearer ${apiKey}` } : { "x-api-key": apiKey },
				...allowed.body === void 0 ? {} : {
					"Content-Type": "application/json",
					"Content-Length": Buffer.byteLength(allowed.body)
				}
			}
		}, (res) => {
			const status = res.statusCode ?? 0;
			if (status < 200 || status >= 300) {
				res.destroy();
				const wait = status === 429 ? retryAfterMs(res.headers) : void 0;
				reject(wait === void 0 ? new BalanceHttpError(status) : new BalanceNetworkError("rate-limited", `Balance HTTP ${status}`, wait));
				return;
			}
			if (res.headers["content-encoding"] && res.headers["content-encoding"] !== "identity") {
				res.destroy();
				reject(/* @__PURE__ */ new Error("Compressed balance responses are unsupported"));
				return;
			}
			let size = 0;
			const chunks = [];
			res.on("data", (chunk) => {
				size += chunk.length;
				if (size > 262144) {
					res.destroy();
					reject(/* @__PURE__ */ new Error("Balance response exceeds 256 KiB"));
					return;
				}
				chunks.push(chunk);
			});
			res.on("error", () => reject(/* @__PURE__ */ new Error("Balance response interrupted")));
			res.on("end", () => {
				try {
					resolve(JSON.parse(Buffer.concat(chunks).toString("utf8")));
				} catch {
					reject(/* @__PURE__ */ new Error("Balance response is not JSON"));
				}
			});
		});
		req.on("error", () => reject(/* @__PURE__ */ new Error("Balance network request failed or timed out")));
		req.on("socket", (socket) => socket.on("error", () => {}));
		req.end(allowed.body);
	});
}
//#endregion
//#region plugins/dsh-token-monitor/src/balance-registry.ts
/** Provider-specific balance requests with credential rotation and stale-result rejection. */
/** Demand-driven cache: one request per provider, no polling of unused providers. */
var BalanceRegistry = class {
	dependencies;
	entries = /* @__PURE__ */ new Map();
	stopped = false;
	active = 0;
	inspections = /* @__PURE__ */ new Map();
	generations = /* @__PURE__ */ new Map();
	pendingRequests = /* @__PURE__ */ new Set();
	accountSource;
	constructor(dependencies) {
		this.dependencies = dependencies;
	}
	/** Native accounts must never fall back to an unrelated API-key balance. */
	setAccountSource(source) {
		this.accountSource = source;
	}
	/** Read current credentials before serving cached data; never return an older generation.
	* @param provider Exact configured provider identifier.
	* @returns Current balance, or undefined while unconfigured, unavailable or throttled.
	*/
	async get(provider) {
		if (this.stopped) return void 0;
		if (provider === "deepseek-account") {
			const pending = this.getAccount(provider);
			this.pendingRequests.add(pending);
			const release = () => {
				this.pendingRequests.delete(pending);
			};
			pending.then(release, release);
			return pending;
		}
		const preceding = this.inspections.get(provider);
		let release;
		const lock = new Promise((resolve) => {
			release = resolve;
		});
		this.inspections.set(provider, lock);
		await preceding;
		try {
			return (await this.prepare(provider)).result;
		} finally {
			release();
			if (this.inspections.get(provider) === lock) this.inspections.delete(provider);
		}
	}
	async getAccount(provider) {
		const generation = this.generations.get(provider) ?? 0;
		const script = await this.dependencies.readScript(provider);
		if (this.stopped || generation !== (this.generations.get(provider) ?? 0)) return void 0;
		if (script.status !== "valid") {
			this.invalidate(provider);
			return;
		}
		const value = await this.accountSource?.get();
		const latest = await this.dependencies.readScript(provider);
		if (this.stopped || generation !== (this.generations.get(provider) ?? 0) || latest.revision !== script.revision || latest.status !== "valid") return void 0;
		return value === void 0 ? void 0 : {
			...value,
			scriptRevision: script.revision
		};
	}
	async prepare(provider) {
		if (this.stopped) return {};
		const generation = this.generations.get(provider) ?? 0;
		const [script, identity] = await Promise.all([this.dependencies.readScript(provider), this.dependencies.resolveIdentity(provider)]);
		if (this.stopped || generation !== (this.generations.get(provider) ?? 0)) return {};
		if (script.status !== "valid" || !script.request || !identity) {
			this.invalidate(provider);
			return {};
		}
		let entry = this.entries.get(provider);
		if (!entry || entry.revision !== script.revision || entry.identity.apiKey !== identity.apiKey || entry.identity.baseURL !== identity.baseURL) {
			this.invalidate(provider);
			entry = {
				identity,
				revision: script.revision,
				generation: randomUUID(),
				controller: new AbortController(),
				nextAttempt: 0,
				failures: 0
			};
			this.entries.set(provider, entry);
		}
		if (entry.pending) return { result: entry.pending };
		const now = this.dependencies.now ?? Date.now;
		if (now() < entry.nextAttempt || this.active >= 4) return entry.value ? { result: entry.value } : {};
		const current = entry;
		this.active++;
		current.pending = (async () => {
			try {
				const raw = await this.dependencies.request(script.request, identity.baseURL, identity.apiKey, current.controller.signal);
				const balance = validateScriptBalance(await evaluateBalanceScript(script.script, raw));
				const [latestScript, latestIdentity] = await Promise.all([this.dependencies.readScript(provider), this.dependencies.resolveIdentity(provider)]);
				if (this.stopped || current.controller.signal.aborted || this.entries.get(provider) !== current) return void 0;
				if (latestScript.revision !== current.revision || latestScript.status !== "valid" || latestIdentity?.apiKey !== identity.apiKey || latestIdentity.baseURL !== identity.baseURL) {
					this.invalidate(provider);
					return;
				}
				current.value = {
					...balance,
					updatedAt: now(),
					provider,
					scriptRevision: script.revision,
					credentialGeneration: current.generation
				};
				current.failures = 0;
				current.lastFailure = void 0;
				current.nextAttempt = now() + 15e3;
				return current.value;
			} catch (error) {
				delete current.value;
				current.failures++;
				const requested = error instanceof BalanceNetworkError ? error.retryAfterMs : void 0;
				current.nextAttempt = now() + (requested ?? 15e3);
				const kind = error instanceof BalanceNetworkError ? error.kind : "transport";
				if (current.failures === 1 || current.lastFailure !== kind) this.dependencies.warn?.("dsh-token-monitor: balance query failed (" + kind + ")");
				current.lastFailure = kind;
				return;
			} finally {
				this.active--;
				delete current.pending;
			}
		})();
		const pending = current.pending;
		this.pendingRequests.add(pending);
		pending.finally(() => this.pendingRequests.delete(pending));
		return { result: pending };
	}
	/** Cancel a provider's obsolete request and drop its cached balance.
	* @param provider Exact provider identifier.
	*/
	invalidate(provider) {
		if (provider === "deepseek-account") this.accountSource?.invalidate();
		this.generations.set(provider, (this.generations.get(provider) ?? 0) + 1);
		this.entries.get(provider)?.controller.abort();
		this.entries.delete(provider);
	}
	/** Cancel all work when the owning plugin context is disposed. */
	async stop() {
		this.stopped = true;
		for (const provider of this.entries.keys()) this.invalidate(provider);
		const accountStop = this.accountSource?.stop();
		await Promise.allSettled([
			...this.inspections.values(),
			...this.pendingRequests,
			...accountStop ? [accountStop] : []
		]);
	}
};
//#endregion
//#region plugins/dsh-token-monitor/src/balance-account.ts
/** Narrow adapter for the desktop Host's account service; never reads login credentials. */
/** Use the installed Host package's version, not a hard-coded desktop release. */
function accountClientMetadata() {
	let version = "";
	try {
		const manifest = createRequire(import.meta.url)("@deepseek-ai/dsh-deepseek-account/package.json");
		if (typeof manifest.version === "string") version = manifest.version;
	} catch {}
	return {
		version,
		locale: Intl.DateTimeFormat().resolvedOptions().locale,
		timezoneOffsetSeconds: -(/* @__PURE__ */ new Date()).getTimezoneOffset() * 60
	};
}
/** Project ready wallets only; CNY takes precedence, and currencies are never added together. */
function parseAccountBalance(raw) {
	if (!raw || typeof raw !== "object") return void 0;
	const result = raw;
	if (result.status !== "ready" || !Array.isArray(result.value) || !Array.isArray(result.bonusWallets)) return void 0;
	const totals = /* @__PURE__ */ new Map();
	for (const [rows, field] of [[result.value, "toppedUpBalance"], [result.bonusWallets, "grantedBalance"]]) for (const rawRow of rows) {
		if (!rawRow || typeof rawRow !== "object") return void 0;
		const row = rawRow;
		if (!["CNY", "USD"].includes(String(row.currency)) || typeof row.balance !== "string" || !/^-?\d+(?:\.\d+)?$/.test(row.balance) || !Number.isFinite(Number(row.balance))) return void 0;
		const currency = row.currency;
		const total = totals.get(currency) ?? {
			toppedUpBalance: 0,
			grantedBalance: 0
		};
		total[field] += Number(row.balance);
		totals.set(currency, total);
	}
	const currency = totals.has("CNY") ? "CNY" : "USD";
	const total = totals.get(currency);
	if (!total) return void 0;
	const totalBalance = Number((total.toppedUpBalance + total.grantedBalance).toFixed(8));
	if (!Number.isFinite(totalBalance)) return void 0;
	return {
		currency,
		...total,
		totalBalance,
		isAvailable: totalBalance > 0
	};
}
/** Demand-driven native reads. No cache/backoff: every completed poll reaches the Host again. */
var AccountBalanceSource = class {
	read;
	now;
	generation = randomUUID();
	stopped = false;
	pending;
	requests = /* @__PURE__ */ new Set();
	constructor(read, now = Date.now) {
		this.read = read;
		this.now = now;
	}
	get() {
		if (this.stopped) return Promise.resolve(void 0);
		if (this.pending) return this.pending;
		const generation = this.generation;
		const pending = Promise.resolve().then(() => this.stopped || generation !== this.generation ? void 0 : this.read()).then((raw) => {
			if (this.stopped || generation !== this.generation) return void 0;
			const balance = parseAccountBalance(raw);
			return balance ? {
				...balance,
				updatedAt: this.now(),
				provider: "deepseek-account",
				scriptRevision: 0,
				credentialGeneration: generation
			} : void 0;
		}).catch(() => void 0);
		this.pending = pending;
		this.requests.add(pending);
		pending.finally(() => {
			this.requests.delete(pending);
			if (this.pending === pending) this.pending = void 0;
		});
		return pending;
	}
	/** Host credential events rotate opaque comparison identity, without inspecting a token. */
	invalidate() {
		this.generation = randomUUID();
		this.pending = void 0;
	}
	async stop() {
		this.stopped = true;
		this.invalidate();
		await Promise.allSettled([...this.requests]);
	}
};
/** Optional injection leaves API-key providers available on Hosts without account login. */
function attachAccountBalance(ctx, setSource) {
	ctx.inject(["deepseekAccount"], (accountCtx) => {
		const client = accountClientMetadata();
		const account = accountCtx.deepseekAccount;
		const source = new AccountBalanceSource(() => account.getBalance(client));
		accountCtx.on("credentials/record-updated", () => source.invalidate());
		accountCtx.effect(() => {
			setSource(source);
			return async () => {
				setSource(void 0);
				await source.stop();
			};
		}, "token-monitor: native account balance");
	});
}
//#endregion
//#region plugins/dsh-token-monitor/src/balance-provider.ts
/**
* API base URLs for known configurable providers whose profiles omit an
* explicit baseURL. Mirrors the launch adapter defaults so balance querying
* works the moment a provider is configured; an explicit profile baseURL
* always wins.
*/
const PROVIDER_BASE_URL_FALLBACKS = Object.freeze({
	"zai-coding-cn": "https://open.bigmodel.cn/api/coding/paas/v4",
	"zai-coding": "https://api.z.ai/api/coding/paas/v4",
	"kimi-coding": "https://api.kimi.com/coding/v1",
	"minimax-cn": "https://api.minimaxi.com/anthropic",
	"minimax": "https://api.minimax.io/anthropic"
});
/** Read the provider profile via its owning adapter's settings directory.
* @param ctx Context with LLM, settings and credentials.
* @param provider Exact configured route.
* @returns Key and endpoint for server-internal use, or undefined when unavailable.
*/
async function resolveBalanceIdentity(ctx, provider, balanceProvider) {
	if (balanceProvider !== void 0) {
		const resolved = await ctx.credentials.resolve(credentialRef(balanceProvider.apiKeyEnv));
		if (!resolved?.value) return void 0;
		return {
			apiKey: resolved.value,
			baseURL: balanceProvider.baseURL
		};
	}
	const descriptor = ctx.llm.listConfigurableProviders().find((item) => item.provider === provider);
	if (!descriptor || descriptor.error) return void 0;
	let profile = ctx.settings.describe().find((item) => item.ns === descriptor.settingsNs)?.value;
	for (const key of descriptor.settingsPath) {
		if (!profile || typeof profile !== "object") return void 0;
		profile = profile[key];
	}
	if (!profile || typeof profile !== "object") return void 0;
	const fields = profile;
	const official = isOfficialProvider(provider) && (descriptor.settingsNs === "llm-deepseek" || descriptor.settingsNs === "llm-deepseek-account");
	const ref = fields.apiKeyEnv ?? (official ? "DEEPSEEK_API_KEY" : void 0);
	const baseURL = fields.baseURL ?? (official ? launchEnvironmentOf(ctx).get("DEEPSEEK_BASE_URL")?.value ?? "https://api.deepseek.com" : void 0) ?? PROVIDER_BASE_URL_FALLBACKS[provider];
	if (typeof ref !== "string" || !ref || typeof baseURL !== "string") return void 0;
	const resolved = await ctx.credentials.resolve(credentialRef(ref));
	if (!resolved?.value) return void 0;
	return {
		apiKey: resolved.value,
		baseURL
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
//#region plugins/dsh-token-monitor/src/balance-api.ts
function send$1(res, status, value) {
	res.writeHead(status, {
		"Content-Type": "application/json; charset=utf-8",
		"Cache-Control": "no-store"
	});
	res.end(JSON.stringify(value));
}
function assertProvider(ctx, provider) {
	if (!ctx.llm.listConfigurableProviders().some((item) => item.provider === provider)) throw new TypeError("Unknown configured provider");
}
/** Register script APIs and shared balance reads on the owning context.
* @param ctx Context with web server and LLM directory.
* @param scripts Provider-local script store.
* @param registry Shared query cache.
*/
function registerBalanceApi(ctx, scripts, registry) {
	const guard = createRouteGuard(ctx);
	ctx.effect(() => ctx.webServer.register({
		kind: "exact",
		path: "/api/token-monitor/balance",
		handler: async (req, res) => {
			if (!guard(req, res)) return;
			if (req.method !== "GET") {
				send$1(res, 405, { error: { code: "METHOD_NOT_ALLOWED" } });
				return;
			}
			const provider = new URL(req.url ?? "/", "http://localhost").searchParams.get("provider") ?? "deepseek-official";
			try {
				assertProvider(ctx, provider);
				send$1(res, 200, await registry.get(provider) ?? null);
			} catch {
				send$1(res, 200, null);
			}
		}
	}), "dsh-token-monitor: provider balance route");
	ctx.effect(() => ctx.webServer.register({
		kind: "exact",
		path: "/api/token-monitor/balance-script",
		handler: async (req, res) => {
			if (!guard(req, res)) return;
			const provider = new URL(req.url ?? "/", "http://localhost").searchParams.get("provider") ?? "";
			try {
				assertProvider(ctx, provider);
			} catch {
				send$1(res, 400, { error: { code: "UNKNOWN_PROVIDER" } });
				return;
			}
			if (req.method === "GET") {
				try {
					send$1(res, 200, await scripts.read(provider));
				} catch {
					send$1(res, 500, { error: { code: "READ_FAILED" } });
				}
				return;
			}
			if (req.method === "DELETE") {
				const revision = Number(new URL(req.url ?? "/", "http://localhost").searchParams.get("expectedRevision") ?? NaN);
				try {
					const removed = await scripts.remove(provider, Number.isSafeInteger(revision) ? revision : -1);
					registry.invalidate(provider);
					send$1(res, 200, removed);
				} catch (error) {
					const conflict = error instanceof BalanceScriptConflictError;
					const invalid = error instanceof TypeError;
					send$1(res, conflict ? 409 : invalid ? 400 : 500, { error: { code: conflict ? "CONFLICT" : invalid ? "INVALID_REQUEST" : "WRITE_FAILED" } });
				}
				return;
			}
			if (req.method !== "PUT") {
				send$1(res, 405, { error: { code: "METHOD_NOT_ALLOWED" } });
				return;
			}
			if (req.headers["content-type"]?.split(";")[0]?.trim() !== "application/json") {
				send$1(res, 415, { error: { code: "UNSUPPORTED_MEDIA_TYPE" } });
				return;
			}
			let script, enabled, revision;
			try {
				const chunks = [];
				let size = 0;
				for await (const chunk of req) {
					const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
					size += buffer.length;
					if (size > 2e5) {
						req.resume();
						send$1(res, 413, { error: { code: "PAYLOAD_TOO_LARGE" } });
						return;
					}
					chunks.push(buffer);
				}
				const body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
				if (!body || typeof body !== "object" || Array.isArray(body)) throw new TypeError();
				const fields = body;
				const nativeSwitch = provider === "deepseek-account" && typeof fields.enabled === "boolean" && fields.script === void 0;
				const scriptEdit = typeof fields.script === "string" && Buffer.byteLength(fields.script) <= 32768 && fields.enabled === void 0;
				if (!nativeSwitch && !scriptEdit || typeof fields.expectedRevision !== "number" || !Number.isSafeInteger(fields.expectedRevision) || fields.expectedRevision < 0 || Object.keys(fields).some((key) => ![
					"script",
					"enabled",
					"expectedRevision"
				].includes(key))) throw new TypeError();
				script = fields.script;
				enabled = fields.enabled;
				revision = fields.expectedRevision;
			} catch {
				send$1(res, 400, { error: { code: "INVALID_REQUEST" } });
				return;
			}
			try {
				const saved = enabled === void 0 ? await scripts.update(provider, script, revision) : await scripts.updateNative(provider, enabled, revision);
				registry.invalidate(provider);
				send$1(res, 200, saved);
			} catch (error) {
				const conflict = error instanceof BalanceScriptConflictError;
				const sensitive = error instanceof SensitiveBalanceScriptError;
				const invalid = error instanceof TypeError;
				send$1(res, conflict ? 409 : sensitive || invalid ? 400 : 500, { error: { code: conflict ? "CONFLICT" : sensitive ? "SENSITIVE_SCRIPT" : invalid ? "INVALID_REQUEST" : "WRITE_FAILED" } });
			}
		}
	}), "dsh-token-monitor: provider script route");
	ctx.effect(() => ctx.webServer.register({
		kind: "exact",
		path: "/api/token-monitor/balance-endpoint",
		handler: async (req, res) => {
			if (!guard(req, res)) return;
			if (req.method !== "PUT") {
				send$1(res, 405, { error: { code: "METHOD_NOT_ALLOWED" } });
				return;
			}
			if (req.headers["content-type"]?.split(";")[0]?.trim() !== "application/json") {
				send$1(res, 415, { error: { code: "UNSUPPORTED_MEDIA_TYPE" } });
				return;
			}
			const provider = new URL(req.url ?? "/", "http://localhost").searchParams.get("provider") ?? "";
			try {
				assertProvider(ctx, provider);
			} catch {
				send$1(res, 400, { error: { code: "UNKNOWN_PROVIDER" } });
				return;
			}
			let endpoint;
			try {
				const chunks = [];
				let size = 0;
				for await (const chunk of req) {
					const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
					size += buffer.length;
					if (size > 4096) {
						req.resume();
						send$1(res, 413, { error: { code: "PAYLOAD_TOO_LARGE" } });
						return;
					}
					chunks.push(buffer);
				}
				endpoint = validateBalanceEndpoint(JSON.parse(Buffer.concat(chunks).toString("utf8")));
			} catch {
				send$1(res, 400, { error: { code: "INVALID_REQUEST" } });
				return;
			}
			try {
				send$1(res, 200, await scripts.approve(provider, endpoint));
				registry.invalidate(provider);
			} catch (error) {
				const mismatch = error instanceof BalanceEndpointMismatchError;
				send$1(res, mismatch ? 400 : 500, { error: { code: mismatch ? "ENDPOINT_NOT_REQUESTED" : "WRITE_FAILED" } });
			}
		}
	}), "dsh-token-monitor: provider endpoint approval route");
}
/** Model-authored adapters remain keyless and use the same revision checks as the editor.
* @param ctx Context with tools and configurable provider directory.
* @param scripts Provider-local script store.
* @param registry Shared query cache.
*/
function registerBalanceTools(ctx, scripts, registry) {
	const output = {
		schema: { type: "json" },
		render: (_args, value) => [{
			type: "text",
			text: JSON.stringify(value)
		}]
	};
	ctx.effect(() => ctx.tools.register(defineTool({
		name: "token_monitor_balance_get",
		description: "For deepseek-account, source native-account uses the Host native balance service: scripts and endpoint approvals do not apply. Use enabled=true/false (without script) with the observed revision to resume/pause queries. Legacy paused script settings remain paused until explicit enabling. Empty script is supported only as a compatibility pause; nonempty native scripts are rejected. Read the saved keyless balance script, its status and its provider-local revision. One script is shared by all models of that provider. Does not expose API keys or query balances. A provider whose configured endpoint belongs to a gateway the Host already ships an adapter for returns that adapter with source \"built-in\"; it needs no script and is approved by construction, so do not ask the user to configure one for it. Status \"unapproved\" means the saved adapter names an endpoint the owner has not approved; the owner approves it in the Token Monitor balance settings, and only the endpoint the saved adapter names can be approved.",
		parameters: { provider: {
			type: "string",
			required: true
		} },
		output,
		async execute(args, exec) {
			exec.signal.throwIfAborted();
			assertProvider(ctx, args.provider);
			return await scripts.read(args.provider);
		},
		presentCall: () => ({
			card: "generic",
			title: "读取供应商余额脚本",
			kind: "read"
		})
	})), "dsh-token-monitor: read balance script tool");
	ctx.effect(() => ctx.tools.register(defineTool({
		name: "token_monitor_balance_update",
		description: "For deepseek-account, source native-account uses the Host native balance service: scripts and endpoint approvals do not apply. Use enabled=true/false (without script) with the observed revision to resume/pause queries. Legacy paused script settings remain paused until explicit enabling. Empty script is supported only as a compatibility pause; nonempty native scripts are rejected. Save a complete balance adapter only when requested by the user. Read token_monitor_balance_get first. A provider that already reports source \"built-in\" needs no saved script; saving one replaces that shipped adapter, and the replacement endpoint then needs its own approval. Expression format: ({request:{path,method:\"GET\"|\"POST\",auth:\"bearer\"|\"x-api-key\",body?:string},parse(response){return {currency,totalBalance,grantedBalance?,toppedUpBalance?,isAvailable?,display?:string,windows?:[{label,used,total,resetAt?}]}}}). `display` is optional, trimmed, capped at 48 characters, and replaces the currency-symbol-plus-amount rendering when present; numeric fields still drive animations and depleted detection. Path must start with one / and contain no origin, query, fragment or credentials. API endpoint and key are Host-private and must never appear in source. Only these string literals may appear: the request path, the values GET/POST/bearer/x-api-key/credits, short codes, field names of at most 14 identifier characters, and a JSON body whose own string values follow the same rule; URLs, credentials, query strings, template substitution and escape sequences are rejected outright. No imports, network, Node globals, async code or secret access. Source limit 32KiB, execution 100ms/8MiB. Empty script disables querying (including a built-in adapter); ordinary invalid edits are saved and pause querying, while refused source is rejected without being stored. A valid edit whose endpoint is not approved yet stays paused until the owner approves that exact path and method in the settings panel; writes are never approved automatically. Historical usage is unchanged. Revision conflict requires rereading, never blind overwrite.",
		parameters: {
			provider: {
				type: "string",
				required: true
			},
			script: { type: "string" },
			enabled: { type: "boolean" },
			expectedRevision: {
				type: "integer",
				required: true
			}
		},
		output,
		async execute(args, exec) {
			exec.signal.throwIfAborted();
			assertProvider(ctx, args.provider);
			const switchEdit = args.provider === "deepseek-account" && typeof args.enabled === "boolean" && args.script === void 0;
			const scriptEdit = typeof args.script === "string" && args.enabled === void 0;
			if (!switchEdit && !scriptEdit) throw new TypeError("Provide either a script or a native-account enabled switch");
			const saved = switchEdit ? await scripts.updateNative(args.provider, args.enabled, args.expectedRevision) : await scripts.update(args.provider, args.script, args.expectedRevision);
			registry.invalidate(args.provider);
			return saved;
		},
		presentCall: (args) => ({
			card: "generic",
			title: "修改供应商余额脚本",
			rawInput: { provider: args.provider }
		}),
		presentResult: (_args, result) => ({
			card: "generic",
			title: result.isError ? "余额脚本未保存" : "余额脚本已保存",
			content: result.content
		})
	})), "dsh-token-monitor: update balance script tool");
}
//#endregion
//#region plugins/dsh-token-monitor/src/plan-quota.ts
/** Aggregated plan quota endpoint. */
const TOKEN_MONITOR_PLAN_QUOTAS_PATH = "/api/token-monitor/plan-quotas";
/** One query per provider is served from cache for this long. */
const PLAN_QUOTA_THROTTLE_MS = 15e3;
/** How long a provider without a usable subscription stays out of the snapshot. */
const PLAN_QUOTA_ABSENT_TTL_MS = 18e5;
/** Statuses that mean "this credential has no plan access" rather than a transient failure. */
const PLAN_QUOTA_ABSENT_STATUSES = Object.freeze([
	401,
	403,
	404
]);
/** Read one plain object field, ignoring arrays and primitives. */
function record(value) {
	return value !== null && typeof value === "object" && !Array.isArray(value) ? value : void 0;
}
/** Read one numeric field, accepting the decimal strings some providers use. */
function finiteNumber(value) {
	if (typeof value === "number") return Number.isFinite(value) ? value : void 0;
	if (typeof value === "string") {
		const trimmed = value.trim();
		if (trimmed === "") return void 0;
		const parsed = Number(trimmed);
		return Number.isFinite(parsed) ? parsed : void 0;
	}
}
/** Read one refresh timestamp, accepting epoch milliseconds or an ISO date. */
function epochMs(value) {
	if (typeof value === "number") return Number.isFinite(value) && value > 0 ? value : void 0;
	if (typeof value === "string" && value.trim() !== "") {
		const parsed = Date.parse(value.trim());
		return Number.isFinite(parsed) ? parsed : void 0;
	}
}
/** Round a used share to two decimals and keep it inside the 0..100 range. */
function percent(value) {
	return Math.min(Math.max(Math.round(value * 100) / 100, 0), 100);
}
/** Read one subscription level, ignoring empty or non-string values. */
function planLevel(value) {
	return typeof value === "string" && value.trim() !== "" ? value.trim() : void 0;
}
/** Window label of one allowance kind. */
const WINDOW_LABELS = Object.freeze({
	"5h": "5 小时",
	week: "每周",
	month: "每月",
	other: "其他额度"
});
/** Display order of the allowance kinds, matching the client's fixed order. */
const WINDOW_ORDER = Object.freeze({
	"5h": 0,
	week: 1,
	month: 2,
	other: 3
});
/**
* GLM / 智谱 Coding Plan allowance units.
*
* The quota endpoint reports one entry per rolling window; the unit decides
* which cycle the entry belongs to. Every other unit stays an `other` window
* instead of being dropped, so an unknown cycle is still visible.
*/
const GLM_UNIT_KINDS = Object.freeze({
	3: "5h",
	6: "week",
	5: "month"
});
/**
* Parse a GLM / 智谱 Coding Plan quota payload.
*
* The payload carries one entry per window with the used share and the next
* refresh time; the absolute allowance is not published, so `used` and `total`
* stay null. A malformed entry is skipped instead of failing the whole parse.
*
* 同一周期可能出现多条记录（实测同时存在 `TOKENS_LIMIT` 与 `CREDIT_LIMIT`
* 两类条目，分别对应 Token 口径与积分口径）。每个周期只保留一条：优先取带
* 绝对用量（`usage` / `currentValue`）的积分条目，否则取第一条，避免同一
* 刷新周期在界面上重复出现。
* @param raw Provider response body.
* @returns Plan level and allowance windows.
*/
function parseGlmQuota(raw) {
	const data = record(record(raw)?.data);
	const windows = [];
	const limits = data?.limits;
	if (Array.isArray(limits)) {
		const picked = /* @__PURE__ */ new Map();
		for (const item of limits) {
			const entry = record(item);
			if (entry === void 0) continue;
			const unit = finiteNumber(entry.unit);
			if (unit === void 0) continue;
			const share = finiteNumber(entry.percentage);
			const resetAt = epochMs(entry.nextResetTime);
			const used = finiteNumber(entry.currentValue);
			const total = finiteNumber(entry.usage);
			if (share === void 0 && resetAt === void 0 && used === void 0 && total === void 0) continue;
			const kind = GLM_UNIT_KINDS[unit] ?? "other";
			const window = {
				kind,
				label: WINDOW_LABELS[kind],
				usedPercent: share === void 0 && total !== void 0 && total > 0 && used !== void 0 ? percent(used / total * 100) : share === void 0 ? null : percent(share),
				used: used ?? null,
				total: total ?? null,
				...resetAt === void 0 ? {} : { resetAt }
			};
			const existing = picked.get(unit);
			if (existing === void 0 || existing.used === null && existing.total === null && (window.used !== null || window.total !== null)) picked.set(unit, window);
		}
		windows.push(...[...picked.entries()].map(([, window]) => window).sort((left, right) => WINDOW_ORDER[left.kind] - WINDOW_ORDER[right.kind]));
	}
	const plan = planLevel(data?.level);
	return {
		...plan === void 0 ? {} : { plan },
		windows
	};
}
/**
* Build one Kimi Coding Plan window from its allowance detail.
*
* Kimi publishes its figures as decimal strings and its refresh time as an
* ISO date, so every figure is converted here.
* @param detail Allowance detail of one window.
* @param kind Refresh cycle of this window.
* @returns The window, or undefined when the detail carries no usable figure.
*/
function kimiWindow(detail, kind) {
	if (detail === void 0) return void 0;
	const total = finiteNumber(detail.limit);
	const remaining = finiteNumber(detail.remaining);
	const used = finiteNumber(detail.used) ?? (total !== void 0 && remaining !== void 0 ? Math.max(total - remaining, 0) : void 0);
	const resetAt = epochMs(detail.resetTime);
	if (total === void 0 && used === void 0 && resetAt === void 0) return void 0;
	const share = total !== void 0 && total > 0 && used !== void 0 ? percent(used / total * 100) : null;
	return {
		kind,
		label: WINDOW_LABELS[kind],
		usedPercent: share,
		used: used ?? null,
		total: total ?? null,
		...resetAt === void 0 ? {} : { resetAt }
	};
}
/**
* Parse a Kimi Coding Plan usage payload.
*
* The five-hour window is the entry whose window is 300 minutes long; the
* weekly allowance is the top-level usage summary. Other entries are ignored
* so the same cycle is never published twice.
* @param raw Provider response body.
* @returns Plan level and allowance windows.
*/
function parseKimiQuota(raw) {
	const root = record(raw);
	const windows = [];
	const limits = root?.limits;
	if (Array.isArray(limits)) for (const item of limits) {
		const entry = record(item);
		const window = record(entry?.window);
		if (window === void 0 || window.timeUnit !== "TIME_UNIT_MINUTE") continue;
		if (finiteNumber(window.duration) !== 300) continue;
		const window5h = kimiWindow(record(entry?.detail), "5h");
		if (window5h !== void 0) windows.push(window5h);
	}
	const week = kimiWindow(record(root?.usage), "week");
	if (week !== void 0) windows.push(week);
	const plan = planLevel(record(record(root?.user)?.membership)?.level);
	return {
		...plan === void 0 ? {} : { plan },
		windows
	};
}
/** 保险起见的毫秒时间戳下界（2001-09-09），避免把秒/纳秒误当毫秒。 */
const MIN_EPOCH_MS = 0xe8d4a51000;
/**
* Read one MiniMax epoch field, accepting only plausible millisecond values.
* @param value Raw field value.
* @returns Epoch milliseconds, or undefined when absent or out of range.
*/
function miniMaxEpoch(value) {
	const parsed = finiteNumber(value);
	return parsed !== void 0 && parsed >= MIN_EPOCH_MS ? parsed : void 0;
}
/**
* Aggregate one MiniMax window kind across models, keeping the tightest entry.
*
* `/v1/token_plan/remains` 按模型逐条返回 5 小时与周窗口。套餐卡片是供应商级的，
* 因此每个周期取「已用比例最高」的那条模型记录（最紧的窗口），刷新时间取同一条
* 记录自己的时间字段。`status === 3` 表示该模型不在套餐内，不参与该周期的聚合。
* @param entries Parsed model entries of the payload.
* @param kind Which allowance cycle to aggregate.
* @param fields Field names of the requested cycle; `remainingMs` names this
*   cycle's own remaining-duration field and must be omitted when the API only
*   publishes one for another cycle.
* @param at Snapshot clock used when only a remaining duration is available.
* @returns The aggregated window, or undefined when no model reports this cycle.
*/
function miniMaxWindow(entries, kind, fields, at) {
	let best;
	for (const entry of entries) {
		if (finiteNumber(entry[fields.status]) === 3) continue;
		const total = finiteNumber(entry[fields.total]);
		const used = finiteNumber(entry[fields.used]);
		const reportedPercent = finiteNumber(entry[fields.reportedPercent]);
		const share = reportedPercent !== void 0 ? percent(100 - reportedPercent) : total !== void 0 && total > 0 && used !== void 0 ? percent(used / total * 100) : null;
		const remainingMs = fields.remainingMs === void 0 ? void 0 : finiteNumber(entry[fields.remainingMs]);
		const resetAt = miniMaxEpoch(entry[fields.resetAt]) ?? (remainingMs !== void 0 && remainingMs > 0 ? at + remainingMs : void 0);
		if (share === null && resetAt === void 0) continue;
		const usableCounts = total !== void 0 && total > 0 && used !== void 0 && used >= 0 && used <= total;
		const window = {
			kind,
			label: WINDOW_LABELS[kind],
			usedPercent: share,
			used: usableCounts ? used : null,
			total: usableCounts ? total : null,
			...resetAt === void 0 ? {} : { resetAt }
		};
		if (best === void 0 || share !== null && (best.percent === null || share > best.percent)) best = {
			percent: share,
			window
		};
	}
	return best?.window;
}
/**
* Parse a MiniMax M Plan usage payload.
*
* @param raw Provider response body.
* @returns The tightest 5-hour and weekly windows across models.
*/
function parseMiniMaxQuota(raw) {
	const list = record(raw)?.model_remains;
	if (!Array.isArray(list)) return { windows: [] };
	const at = Date.now();
	const entries = list.flatMap((item) => {
		const entry = record(item);
		return entry === void 0 ? [] : [entry];
	});
	const windows = [];
	for (const [kind, fields] of [["5h", {
		used: "current_interval_usage_count",
		total: "current_interval_total_count",
		reportedPercent: "current_interval_remaining_percent",
		status: "current_interval_status",
		resetAt: "end_time",
		remainingMs: "remains_time"
	}], ["week", {
		used: "current_weekly_usage_count",
		total: "current_weekly_total_count",
		reportedPercent: "current_weekly_remaining_percent",
		status: "current_weekly_status",
		resetAt: "weekly_end_time"
	}]]) {
		const window = miniMaxWindow(entries, kind, fields, at);
		if (window !== void 0) windows.push(window);
	}
	return { windows };
}
/** Plan adapters the Host ships and approves itself. */
const PLAN_QUOTA_ADAPTERS = Object.freeze([
	Object.freeze({
		domain: "z.ai",
		label: "GLM Coding Plan",
		path: "/api/monitor/usage/quota/limit",
		parse: parseGlmQuota
	}),
	Object.freeze({
		domain: "bigmodel.cn",
		label: "GLM Coding Plan",
		path: "/api/monitor/usage/quota/limit",
		parse: parseGlmQuota
	}),
	Object.freeze({
		domain: "kimi.com",
		label: "Kimi Coding Plan",
		path: "/coding/v1/usages",
		parse: parseKimiQuota
	}),
	Object.freeze({
		domain: "minimax.io",
		label: "MiniMax M Plan",
		path: "/v1/token_plan/remains",
		parse: parseMiniMaxQuota
	}),
	Object.freeze({
		domain: "minimax.cn",
		label: "MiniMax M Plan",
		path: "/v1/token_plan/remains",
		parse: parseMiniMaxQuota
	}),
	Object.freeze({
		domain: "minimaxi.com",
		label: "MiniMax M Plan",
		path: "/v1/token_plan/remains",
		parse: parseMiniMaxQuota
	})
]);
/** Whether one endpoint hostname belongs to a gateway domain on a label boundary. */
function matchesDomain(hostname, domain) {
	return hostname === domain || hostname.endsWith("." + domain);
}
/**
* Pick the built-in plan adapter for one configured provider endpoint.
* @param baseURL Provider endpoint exactly as configured; other hosts match nothing.
* @returns The adapter serving that host, or undefined for an unknown gateway.
*/
function planQuotaAdapterFor(baseURL) {
	let hostname;
	try {
		hostname = new URL(baseURL).hostname.toLowerCase();
	} catch {
		return;
	}
	return PLAN_QUOTA_ADAPTERS.find((adapter) => matchesDomain(hostname, adapter.domain));
}
/**
* Demand-driven plan quota cache.
*
* Every configured provider is queried at most once at a time: concurrent
* reads share the in-flight request, a fresh result is reused for the
* throttle interval, and a credential change drops the cached value instead of
* serving a result of an older credential.
*/
var PlanQuotaRegistry = class {
	dependencies;
	entries = /* @__PURE__ */ new Map();
	pendingRequests = /* @__PURE__ */ new Set();
	stopped = false;
	constructor(dependencies) {
		this.dependencies = dependencies;
	}
	/**
	* Query every configured provider that exposes plan quotas.
	* @returns Snapshot ordered by provider identifier.
	*/
	async snapshot() {
		const providers = [...new Set(this.dependencies.listProviders())].sort();
		const results = await Promise.all(providers.map(async (provider) => {
			try {
				return await this.get(provider);
			} catch {
				return;
			}
		}));
		const entries = [];
		for (const result of results) if (result !== void 0) entries.push(result);
		return {
			updatedAt: this.now(),
			providers: entries
		};
	}
	/**
	* Read one provider's plan quota.
	* @param provider Exact configured provider identifier.
	* @returns The provider entry, or undefined when the provider has no
	* credential, no known gateway or no usable answer.
	*/
	async get(provider) {
		if (this.stopped) return void 0;
		const identity = await this.dependencies.resolveIdentity(provider);
		if (this.stopped) return void 0;
		if (identity === void 0) {
			this.invalidate(provider);
			return;
		}
		const adapter = planQuotaAdapterFor(identity.baseURL);
		if (adapter === void 0) {
			this.invalidate(provider);
			return;
		}
		let entry = this.entries.get(provider);
		if (entry !== void 0 && (entry.identity.apiKey !== identity.apiKey || entry.identity.baseURL !== identity.baseURL)) {
			this.invalidate(provider);
			entry = void 0;
		}
		if (entry === void 0) {
			entry = {
				identity,
				adapter,
				controller: new AbortController(),
				nextAttempt: 0
			};
			this.entries.set(provider, entry);
		}
		if (entry.pending !== void 0) return entry.pending;
		if (this.now() < entry.nextAttempt) return entry.value;
		const current = entry;
		const pending = this.run(current, provider, identity);
		current.pending = pending;
		this.pendingRequests.add(pending);
		const release = () => {
			if (current.pending === pending) delete current.pending;
			this.pendingRequests.delete(pending);
		};
		pending.then(release, release);
		return pending;
	}
	/**
	* Run one provider query and publish its result.
	* @param entry Cached state of the queried provider.
	* @param provider Exact configured provider identifier.
	* @param identity Credential and endpoint the query started with.
	* @returns The provider entry, or undefined when the answer was discarded.
	*/
	async run(entry, provider, identity) {
		const controller = entry.controller;
		try {
			const raw = await this.dependencies.request({
				path: entry.adapter.path,
				method: "GET",
				auth: "bearer"
			}, identity.baseURL, identity.apiKey, controller.signal);
			const parsed = entry.adapter.parse(raw);
			const latest = await this.dependencies.resolveIdentity(provider);
			if (this.stopped || controller.signal.aborted || this.entries.get(provider) !== entry) return void 0;
			if (latest === void 0 || latest.apiKey !== identity.apiKey || latest.baseURL !== identity.baseURL) {
				this.invalidate(provider);
				return;
			}
			if (parsed.windows.length === 0) {
				delete entry.value;
				entry.absent = true;
				entry.nextAttempt = this.now() + PLAN_QUOTA_ABSENT_TTL_MS;
				return;
			}
			const value = {
				provider,
				label: entry.adapter.label,
				...parsed.plan === void 0 ? {} : { plan: parsed.plan },
				windows: parsed.windows,
				updatedAt: this.now(),
				status: "ok"
			};
			entry.value = value;
			delete entry.absent;
			entry.nextAttempt = this.now() + PLAN_QUOTA_THROTTLE_MS;
			return value;
		} catch (error) {
			if (this.stopped || controller.signal.aborted || this.entries.get(provider) !== entry) return void 0;
			if (error instanceof BalanceHttpError && PLAN_QUOTA_ABSENT_STATUSES.includes(error.status)) {
				delete entry.value;
				entry.absent = true;
				entry.nextAttempt = this.now() + PLAN_QUOTA_ABSENT_TTL_MS;
				return;
			}
			const value = {
				provider,
				label: entry.adapter.label,
				windows: [],
				updatedAt: this.now(),
				status: "error"
			};
			entry.value = value;
			entry.nextAttempt = this.now() + PLAN_QUOTA_THROTTLE_MS;
			this.dependencies.warn?.("dsh-token-monitor: plan quota query failed");
			return value;
		}
	}
	/**
	* Drop one provider's cached value and cancel its obsolete request.
	* @param provider Exact provider identifier.
	*/
	invalidate(provider) {
		this.entries.get(provider)?.controller.abort();
		this.entries.delete(provider);
	}
	/** Cancel all work when the owning plugin context is disposed. */
	async stop() {
		this.stopped = true;
		for (const provider of [...this.entries.keys()]) this.invalidate(provider);
		await Promise.allSettled([...this.pendingRequests]);
	}
	/** Current clock reading in epoch milliseconds. */
	now() {
		return (this.dependencies.now ?? Date.now)();
	}
};
/** Write one JSON response with the shared no-store headers. */
function send(res, status, value) {
	res.writeHead(status, {
		"Content-Type": "application/json; charset=utf-8",
		"Cache-Control": "no-store"
	});
	res.end(JSON.stringify(value));
}
/**
* Build the aggregated plan quota handler.
* @param registry Shared plan quota cache.
* @returns The request handler of the endpoint.
*/
function createPlanQuotaHandler(registry) {
	return async (request, response) => {
		if (request.method !== "GET") {
			send(response, 405, { error: { code: "METHOD_NOT_ALLOWED" } });
			return;
		}
		try {
			send(response, 200, await registry.snapshot());
		} catch {
			send(response, 200, {
				updatedAt: Date.now(),
				providers: []
			});
		}
	};
}
/**
* Register the aggregated plan quota endpoint on the owning context.
* @param ctx Context with web server and connection service.
* @param registry Shared plan quota cache.
*/
function registerPlanQuotaApi(ctx, registry) {
	const guard = createRouteGuard(ctx);
	const handler = createPlanQuotaHandler(registry);
	ctx.effect(() => ctx.webServer.register({
		kind: "exact",
		path: TOKEN_MONITOR_PLAN_QUOTAS_PATH,
		handler: (request, response) => {
			if (!guard(request, response)) return;
			return handler(request, response);
		}
	}), "dsh-token-monitor: plan quota route");
}
//#endregion
//#region plugins/dsh-token-monitor/src/config-base.ts
/**
* 插件自身的 `Config` schema 基座：只放用户偏好，不放运行态账本。
*
* 0.1.7 起 settings 由「插件注册的独立文档」改成「插件自己的 Config schema +
* `volatile()` 标记 + 写回 profile patch」。仅有声明了 volatile 的字段才会出现在
* 设置面板里，也才能被写入；因此每个用户可见字段都必须显式下标记。
*
* 独立成模块是为了让不依赖 cordis 运行时的纯逻辑（校验、合成）能单独引用，
* 不把整个 loader 组合拖进消费方的图里。
* @module dsh-token-monitor/config-base
*/
const providerOverrides = z.dict(z.any());
z.object({
	displayMode: z.union(["balance", "spend"]).default(DEFAULT_TOKEN_MONITOR_SETTINGS.displayMode).volatile(),
	showWhaleGirl: z.boolean().default(DEFAULT_TOKEN_MONITOR_SETTINGS.showWhaleGirl).volatile(),
	animationScale: z.number().min(.5).max(1).default(DEFAULT_TOKEN_MONITOR_SETTINGS.animationScale).hidden().volatile(),
	dailyBudgetEnabled: z.boolean().default(DEFAULT_TOKEN_MONITOR_SETTINGS.dailyBudgetEnabled).volatile(),
	dailyBudgetCny: z.number().min(Number.MIN_VALUE).max(TOKEN_MONITOR_MAX_DAILY_BUDGET_CNY).default(DEFAULT_TOKEN_MONITOR_SETTINGS.dailyBudgetCny).volatile(),
	budgetExceededNotificationEnabled: z.boolean().default(DEFAULT_TOKEN_MONITOR_SETTINGS.budgetExceededNotificationEnabled).volatile(),
	peakReminderEnabled: z.boolean().default(DEFAULT_TOKEN_MONITOR_SETTINGS.peakReminderEnabled).volatile(),
	peakReminderEnterPeak: z.boolean().default(DEFAULT_TOKEN_MONITOR_SETTINGS.peakReminderEnterPeak).volatile(),
	peakReminderEnterValley: z.boolean().default(DEFAULT_TOKEN_MONITOR_SETTINGS.peakReminderEnterValley).volatile(),
	notifyOncePerTransition: z.boolean().default(DEFAULT_TOKEN_MONITOR_SETTINGS.notifyOncePerTransition).volatile(),
	whaleBubbleEnabled: z.boolean().default(DEFAULT_TOKEN_MONITOR_SETTINGS.whaleBubbleEnabled).volatile(),
	wechatNotificationsEnabled: z.boolean().default(DEFAULT_TOKEN_MONITOR_SETTINGS.wechatNotificationsEnabled).volatile(),
	cacheHitAnomalyNotificationEnabled: z.boolean().default(DEFAULT_TOKEN_MONITOR_SETTINGS.cacheHitAnomalyNotificationEnabled).volatile(),
	cacheHitAnomalyThreshold: z.number().min(0).max(100).default(DEFAULT_TOKEN_MONITOR_SETTINGS.cacheHitAnomalyThreshold).volatile(),
	cacheHitAnomalyConsecutiveCalls: z.number().min(2).max(20).default(DEFAULT_TOKEN_MONITOR_SETTINGS.cacheHitAnomalyConsecutiveCalls).volatile(),
	/** 逐 provider 的提醒覆盖；对象递归合并，改一家不会清掉另一家。 */
	providerNotifications: providerOverrides.default({}).volatile()
});
Object.freeze({
	pet: Object.freeze(["showWhaleGirl", "animationScale"]),
	overview: Object.freeze(["displayMode"]),
	billing: Object.freeze([
		"billing",
		"balanceScripts",
		"balanceProviders",
		"balanceEndpoints",
		"balanceEndpointPolicyVersion"
	]),
	notify: Object.freeze([
		"dailyBudgetEnabled",
		"dailyBudgetCny",
		"budgetExceededNotificationEnabled",
		"peakReminderEnabled",
		"peakReminderEnterPeak",
		"peakReminderEnterValley",
		"notifyOncePerTransition",
		"whaleBubbleEnabled",
		"cacheHitAnomalyNotificationEnabled",
		"cacheHitAnomalyThreshold",
		"cacheHitAnomalyConsecutiveCalls"
	]),
	wechat: Object.freeze(["wechatNotificationsEnabled"])
});
Object.freeze([
	"displayMode",
	"showWhaleGirl",
	"animationScale",
	"dailyBudgetEnabled",
	"dailyBudgetCny",
	"budgetExceededNotificationEnabled",
	"peakReminderEnabled",
	"peakReminderEnterPeak",
	"peakReminderEnterValley",
	"notifyOncePerTransition",
	"whaleBubbleEnabled",
	"wechatNotificationsEnabled",
	"cacheHitAnomalyNotificationEnabled",
	"cacheHitAnomalyThreshold",
	"cacheHitAnomalyConsecutiveCalls",
	"providerNotifications"
]);
Object.freeze([
	"schemaVersion",
	"priceTable",
	"billing",
	"balanceScripts",
	"balanceProviders",
	"balanceEndpoints",
	"balanceEndpointPolicyVersion"
]);
//#endregion
//#region plugins/dsh-token-monitor/src/settings.ts
function sendJson(response, status, value, head = false, headers = {}) {
	response.writeHead(status, {
		"Content-Type": "application/json; charset=utf-8",
		"Cache-Control": "no-store",
		...headers
	});
	response.end(head ? void 0 : JSON.stringify(value));
}
/** 计费路由与计费模块共享同一条可移除的生命周期。
* @param ctx 拥有 web 服务的上下文。
* @param store 插件自有状态。
* @param handle 活用户配置视图。
*/
function registerBillingSettingsRoutes(ctx, store, handle) {
	const guard = createRouteGuard(ctx);
	ctx.effect(() => {
		const clients = /* @__PURE__ */ new Set();
		const snapshot = () => readBillingSnapshot(store, handle);
		const publish = () => {
			const data = `data: ${JSON.stringify(snapshot())}\n\n`;
			for (const client of clients) if (!client.write(data)) client.destroy();
		};
		const unwatch = store.subscribe(publish);
		const unwatchConfig = ctx.events.on("loader/volatile-update", publish);
		const unwatchNamespace = ctx.events.on("settings/updated", publish);
		const unregister = ctx.webServer.register({
			kind: "exact",
			path: "/api/token-monitor/billing/events",
			handler: (request, response) => {
				if (!guard(request, response)) return;
				if (request.method !== "GET") {
					sendJson(response, 405, { error: { code: "METHOD_NOT_ALLOWED" } });
					return;
				}
				response.writeHead(200, {
					"Content-Type": "text/event-stream",
					"Cache-Control": "no-store",
					Connection: "keep-alive"
				});
				clients.add(response);
				response.on("close", () => {
					clients.delete(response);
				});
				response.write(`data: ${JSON.stringify(snapshot())}\n\n`);
			}
		});
		return () => {
			unwatch();
			unwatchConfig();
			unwatchNamespace();
			unregister();
			for (const client of clients) client.end();
			clients.clear();
		};
	}, "dsh-token-monitor: live billing snapshots");
	ctx.effect(() => ctx.webServer.register({
		kind: "exact",
		path: "/api/token-monitor/billing",
		handler: async (request, response) => {
			if (!guard(request, response)) return;
			if (request.method === "GET") {
				sendJson(response, 200, readBillingSnapshot(store, handle));
				return;
			}
			if (request.method !== "PUT") {
				sendJson(response, 405, { error: { code: "METHOD_NOT_ALLOWED" } });
				return;
			}
			if (request.headers["content-type"]?.split(";")[0]?.trim() !== "application/json") {
				sendJson(response, 415, { error: { code: "UNSUPPORTED_MEDIA_TYPE" } });
				return;
			}
			let rules, revision;
			try {
				let bytes = 0;
				const chunks = [];
				for await (const chunk of request) {
					const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
					bytes += buffer.length;
					if (bytes > 2097152) {
						sendJson(response, 413, { error: { code: "PAYLOAD_TOO_LARGE" } });
						return;
					}
					chunks.push(buffer);
				}
				const body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
				if (!body || typeof body !== "object" || Object.keys(body).some((key) => !["expectedRevision", "rules"].includes(key)) || !Number.isSafeInteger(body.expectedRevision) || body.expectedRevision < 0) throw new TypeError("Invalid billing revision");
				rules = validateBillingRules(body.rules);
				revision = body.expectedRevision;
			} catch {
				sendJson(response, 400, { error: { code: "VALIDATION_ERROR" } });
				return;
			}
			try {
				await store.update({ billing: rules }, revision);
				sendJson(response, 200, readBillingSnapshot(store, handle));
			} catch (error) {
				const conflict = error instanceof PluginStoreConflictError;
				sendJson(response, conflict ? 409 : 500, { error: { code: conflict ? "CONFLICT" : "WRITE_FAILED" } });
			}
		}
	}), "dsh-token-monitor: billing rules");
	ctx.effect(() => ctx.webServer.register({
		kind: "exact",
		path: "/api/token-monitor/billing/templates",
		handler: (request, response) => {
			if (!guard(request, response)) return;
			if (request.method !== "GET") {
				sendJson(response, 405, { error: { code: "METHOD_NOT_ALLOWED" } });
				return;
			}
			sendJson(response, 200, defaultBillingRules(handle.priceTable()));
		}
	}), "dsh-token-monitor: billing templates");
}
/** 读取当前的 Host 级计费规则，不改写历史记录。
* @param store 插件自有状态，持有计费 revision。
* @param handle 活用户配置视图。
* @returns 当前计费快照。
*/
function readBillingSnapshot(store, handle) {
	const state = store.get();
	return {
		revision: state.revision,
		rules: state.billing === void 0 ? defaultBillingRules(handle.priceTable()) : validateBillingRules(state.billing)
	};
}
//#endregion
//#region plugins/dsh-token-monitor/src/module-work.ts
/** Tracks work owned by a module without stopping shared host services. */
var ModuleWork = class {
	active = true;
	pending = /* @__PURE__ */ new Set();
	/** Reject new work after stop begins and retain every admitted operation until settlement. */
	run(operation) {
		if (!this.active) return Promise.reject(Object.assign(/* @__PURE__ */ new Error("Module is stopped"), { code: "UNSUPPORTED" }));
		let request;
		try {
			request = operation();
		} catch (error) {
			return Promise.reject(error);
		}
		this.pending.add(request);
		request.then(() => this.pending.delete(request), () => this.pending.delete(request));
		return request;
	}
	/** Prevent new operations before waiting; shared connections remain available to their other users. */
	async stop() {
		this.active = false;
		await Promise.allSettled(this.pending);
	}
	/** Wait for admitted operations while ownership checks reject new removed-module writes. */
	async drain() {
		await Promise.allSettled(this.pending);
	}
};
//#endregion
//#region plugins/dsh-token-monitor/src/billing-tools.ts
const rate = { oneOf: [{ type: "number" }, { type: "null" }] };
const prices = {
	type: "object",
	additionalProperties: false,
	properties: {
		input: {
			...rate,
			description: "Uncached input CNY per million tokens; null means unpriced."
		},
		cacheHit: {
			...rate,
			description: "Cached input CNY per million tokens; null means unpriced."
		},
		cacheWrite: {
			oneOf: [
				{ type: "number" },
				{ type: "null" },
				{
					type: "string",
					enum: ["input"]
				}
			],
			description: "Cache write CNY per million tokens. input inherits uncached input; null is unpriced; 0 is free. Omission preserves the current choice."
		},
		output: {
			...rate,
			description: "Output CNY per million tokens; null means unpriced."
		}
	}
};
const tiers = {
	type: "array",
	items: {
		type: "object",
		additionalProperties: false,
		properties: {
			maxInputTokens: {
				oneOf: [{ type: "integer" }, { type: "null" }],
				required: true,
				description: "Inclusive total-input ceiling; final tier must be null."
			},
			input: {
				...rate,
				required: true
			},
			cacheHit: {
				...rate,
				required: true
			},
			output: {
				...rate,
				required: true
			},
			cacheWrite: {
				oneOf: [
					{ type: "number" },
					{ type: "null" },
					{
						type: "string",
						enum: ["input"]
					}
				],
				description: "Cache write rate; omitted or input inherits this tier input price."
			}
		}
	}
};
const output = {
	schema: { type: "json" },
	render: (_args, value) => [{
		type: "text",
		text: JSON.stringify(value)
	}]
};
/** Register tools only while the real settings, LLM and tool services are available.
* @param ctx Settings-owning plugin context.
* @param store 插件自有状态，持有计费 revision。
* @param handle 活用户配置视图。
*/
function registerBillingTools(ctx, store, handle) {
	ctx.inject(["tools", "llm"], (toolCtx) => {
		const work = new ModuleWork();
		toolCtx.effect(() => () => work.stop(), "token-monitor: billing tool operations");
		toolCtx.effect(() => toolCtx.tools.register(defineTool({
			name: "token_monitor_billing_get",
			description: "Read Host-global model billing rules and their revision. Only currently available models are listed. Each group reports ruleProvider/ruleSource: the provider entry that actually governs billing, and whether it is an explicit saved entry or inherits the shared official-family rules. enabled and each model rule come from that governing entry, so an inherited account route no longer reads as disabled. enabled alone does not prove every model has complete prices; check model.hasRule. Use exact provider/model IDs from this result before updating prices. Rates are CNY per million tokens; no currency conversion. Does not change settings or historical costs.",
			parameters: {
				provider: {
					type: "string",
					description: "Optional exact provider ID."
				},
				model: {
					type: "string",
					description: "Optional exact model ID; provide provider too."
				}
			},
			output,
			async execute(args, exec) {
				return work.run(async () => {
					exec.signal.throwIfAborted();
					if (args.model && !args.provider) throw new Error("Provide provider when selecting a model.");
					const groups = await Promise.all(toolCtx.llm.listProviders().filter((p) => !args.provider || p.id === args.provider).map(async (p) => {
						try {
							const models = await toolCtx.llm.listModels(p.id);
							return {
								provider: p.id,
								name: p.name,
								models: models.filter((m) => !args.model || m.id === args.model).map((m) => ({
									model: m.id,
									name: m.name
								}))
							};
						} catch {
							return {
								provider: p.id,
								name: p.name,
								models: [],
								error: "Model catalog unavailable; retry before changing prices."
							};
						}
					}));
					exec.signal.throwIfAborted();
					const snapshot = readBillingSnapshot(store, handle);
					return {
						revision: snapshot.revision,
						currency: "CNY",
						priceUnit: "per million tokens",
						timezone: "Asia/Shanghai",
						groups: groups.map((group) => {
							const { owner, source } = resolveBillingProvider(snapshot.rules, group.provider);
							return {
								...group,
								enabled: owner?.enabled ?? false,
								ruleProvider: owner?.provider ?? null,
								ruleSource: source,
								models: group.models.map((model) => ({
									...model,
									hasRule: owner?.models.some((item) => item.model === model.model) ?? false,
									rule: owner?.models.find((item) => item.model === model.model) ?? emptyBillingRule(model.model)
								}))
							};
						})
					};
				});
			},
			presentCall: () => ({
				card: "generic",
				title: "读取模型计费规则",
				kind: "read"
			})
		})), "token-monitor: read billing tool");
		toolCtx.effect(() => toolCtx.tools.register(defineTool({
			name: "token_monitor_billing_update",
			description: "Save only the requested fields for one available provider/model. Call token_monitor_billing_get first and supply its expectedRevision, its exact provider/model IDs, and respect ruleSource. When a provider inherits the shared official-family rules (ruleSource official-family), this tool refuses the update with INHERITED_BILLING_RULES and saves nothing, because creating a partial account entry would shadow the inherited prices. Change the shared prices in the existing billing settings instead. Changes are Host-global and apply to requests started after this update; in-flight and historical costs keep their original rules. Preserve unspecified fields and other models. On revision conflict read again; never blindly retry. Prices are CNY per million tokens, multiplier must be positive. Change prices only when requested by the user; do not invent rates. providerEnabled affects every model under that provider.",
			parameters: {
				provider: {
					type: "string",
					required: true
				},
				model: {
					type: "string",
					required: true
				},
				expectedRevision: {
					type: "integer",
					required: true
				},
				providerEnabled: {
					type: "boolean",
					description: "Explicit provider-wide billing switch; a newly created provider defaults to disabled."
				},
				patch: {
					type: "object",
					additionalProperties: false,
					required: true,
					properties: {
						enabled: { type: "boolean" },
						multiplier: { type: "number" },
						mode: {
							type: "string",
							enum: ["fixed", "peak"]
						},
						fixed: prices,
						peak: prices,
						offPeak: prices,
						periods: {
							type: "array",
							description: "Replace peak periods in Beijing time. Split cross-midnight periods. Sunday=0; start inclusive, end exclusive.",
							items: {
								type: "object",
								additionalProperties: false,
								properties: {
									days: {
										type: "array",
										items: { type: "integer" },
										required: true
									},
									start: {
										type: "integer",
										required: true,
										description: "Minute of day, 0..1439."
									},
									end: {
										type: "integer",
										required: true,
										description: "Minute of day, 1..1440."
									}
								}
							}
						},
						tiers,
						peakTiers: tiers,
						offPeakTiers: tiers
					}
				}
			},
			output,
			async execute(args, exec) {
				return work.run(async () => {
					exec.signal.throwIfAborted();
					if (!Number.isSafeInteger(args.expectedRevision) || args.expectedRevision < 0) throw new Error("expectedRevision must be a non-negative safe integer.");
					if (!Object.keys(args.patch).length && args.providerEnabled === void 0) throw new Error("No billing changes supplied.");
					if (!(await toolCtx.llm.listModels(args.provider)).some((model) => model.id === args.model)) throw new Error("Model is not available for this provider. Read the model catalog again.");
					exec.signal.throwIfAborted();
					const snapshot = readBillingSnapshot(store, handle);
					if (snapshot.revision !== args.expectedRevision) throw new Error("Billing revision conflict. Read current rules and reapply only the user-requested changes.");
					const inherited = resolveBillingProvider(snapshot.rules, args.provider);
					if (inherited.source === "official-family") throw new Error("INHERITED_BILLING_RULES: provider \"" + args.provider + "\" has no entry of its own and inherits the shared \"" + (inherited.owner?.provider ?? "deepseek-official") + "\" rules, so this update was refused and nothing was saved. Change the shared DeepSeek prices in the existing billing settings; a dedicated account rule needs its own explicit creation flow, which this tool does not provide.");
					let provider = snapshot.rules.providers.find((p) => p.provider === args.provider);
					if (!provider) {
						provider = {
							provider: args.provider,
							enabled: false,
							models: []
						};
						snapshot.rules.providers.push(provider);
					}
					if (args.providerEnabled !== void 0) provider.enabled = args.providerEnabled;
					const previous = provider.models.find((model) => model.model === args.model) ?? emptyBillingRule(args.model);
					const next = {
						...previous,
						...args.patch,
						fixed: {
							...previous.fixed,
							...args.patch.fixed
						},
						peak: {
							...previous.peak,
							...args.patch.peak
						},
						offPeak: {
							...previous.offPeak,
							...args.patch.offPeak
						}
					};
					if (next.source) next.source = {
						...next.source,
						modified: true
					};
					const index = provider.models.findIndex((model) => model.model === args.model);
					if (index < 0) provider.models.push(next);
					else provider.models[index] = next;
					const rules = validateBillingRules(snapshot.rules);
					await store.update({ billing: rules }, args.expectedRevision);
					const saved = readBillingSnapshot(store, handle);
					const savedProvider = saved.rules.providers.find((p) => p.provider === args.provider);
					return {
						revision: saved.revision,
						provider: args.provider,
						providerEnabled: savedProvider.enabled,
						rule: savedProvider.models.find((model) => model.model === args.model),
						appliesTo: "requests started after this update",
						historicalCostsChanged: false
					};
				});
			},
			presentCall: (args) => ({
				card: "generic",
				title: "修改模型计费规则",
				rawInput: {
					provider: args.provider,
					model: args.model,
					patch: args.patch
				}
			}),
			presentResult: (_args, result) => ({
				card: "generic",
				title: result.isError ? "计费规则未保存" : "计费规则已保存",
				content: result.content
			})
		})), "token-monitor: update billing tool");
	});
}
//#endregion
//#region plugins/dsh-token-monitor/src/budget.ts
/** Derive the display value without clamping: an over-budget remainder stays negative. */
function dailyBudgetInfo(today, budget) {
	const remaining = budget - today.cost;
	return {
		date: today.date,
		timeZone: today.timeZone,
		currency: today.currency,
		budget,
		spend: today.cost,
		remaining,
		exceeded: remaining < 0,
		updatedAt: today.updatedAt
	};
}
//#endregion
//#region plugins/dsh-token-monitor/src/budget-routes.ts
/** Publish only the current configured allowlist; the Client never embeds pricing model names. */
function pricingEligibilityInfo(table, now = Date.now()) {
	return {
		provider: OFFICIAL_PROVIDER_ID,
		models: Object.keys(table.models),
		updatedAt: now
	};
}
/** Register additive M2 read endpoints without changing request admission or cancellation paths. */
function registerBudgetRoutes(ctx, storage, getBudget, table) {
	const guard = createRouteGuard(ctx);
	ctx.effect(() => ctx.webServer.register({
		kind: "exact",
		path: "/api/token-monitor/daily-budget",
		handler: (req, res) => {
			if (!guard(req, res)) return;
			res.writeHead(200, {
				"Content-Type": "application/json",
				"Cache-Control": "no-store"
			});
			res.end(JSON.stringify(dailyBudgetInfo(storage.todaySpend(), getBudget())));
		}
	}), "token-monitor: daily budget route");
	ctx.effect(() => ctx.webServer.register({
		kind: "exact",
		path: "/api/token-monitor/pricing-eligibility",
		handler: (req, res) => {
			if (!guard(req, res)) return;
			res.writeHead(200, {
				"Content-Type": "application/json",
				"Cache-Control": "no-store"
			});
			res.end(JSON.stringify(pricingEligibilityInfo(table)));
		}
	}), "token-monitor: pricing eligibility route");
}
//#endregion
//#region plugins/dsh-token-monitor/src/charge.ts
/** 环形缓冲区上限：保留最近 500 次扣费，避免长期运行无限增长。 */
const MAX_EVENTS = 500;
const events = [];
const seenSourceEvents = /* @__PURE__ */ new Set();
const seenSourceEventOrder = [];
let seqCounter = 0;
let streamId = randomUUID();
/** Same-version restoration cannot replay a removed module's in-memory events. */
function resetCharges() {
	events.length = 0;
	seenSourceEvents.clear();
	seenSourceEventOrder.length = 0;
	seqCounter = 0;
	streamId = randomUUID();
}
function sourceEventKey(sourceEvent) {
	return JSON.stringify([sourceEvent.sessionId, sourceEvent.seq]);
}
/** 记录一次扣费（cost 为正数金额）。 */
function recordCharge(cost, timestamp, damageKind, breakdown, sourceEvent) {
	const identity = sourceEvent?.sourceEventSeq === void 0 ? void 0 : {
		sessionId: sourceEvent.sessionId,
		seq: sourceEvent.sourceEventSeq
	};
	if (identity !== void 0) {
		const key = sourceEventKey(identity);
		if (seenSourceEvents.has(key)) return;
		seenSourceEvents.add(key);
		seenSourceEventOrder.push(key);
		if (seenSourceEventOrder.length > 2e3) {
			const expired = seenSourceEventOrder.shift();
			if (expired !== void 0) seenSourceEvents.delete(expired);
		}
	}
	events.push({
		seq: ++seqCounter,
		cost,
		timestamp,
		damageKind,
		...sourceEvent?.provider === void 0 ? {} : { provider: sourceEvent.provider },
		...sourceEvent?.model === void 0 ? {} : { model: sourceEvent.model },
		...identity === void 0 ? {} : { sourceEvent: identity },
		...breakdown === void 0 ? {} : { breakdown }
	});
	if (events.length > MAX_EVENTS) events.splice(0, events.length - MAX_EVENTS);
}
/** 返回 seq 严格大于 since 的扣费事件（按 seq 升序）。 */
function chargesSince(since) {
	if (since >= seqCounter) return [];
	return events.filter((event) => event.seq > since);
}
function chargeBatchSince(since) {
	const firstSeq = events[0]?.seq ?? seqCounter + 1;
	return {
		streamId,
		seq: seqCounter,
		firstSeq,
		dropped: events.length > 0 && since < firstSeq - 1,
		events: chargesSince(since)
	};
}
//#endregion
//#region plugins/dsh-token-monitor/src/charge-route.ts
const TOKEN_MONITOR_CHARGE_EVENTS_PATH = "/api/token-monitor/charge-events";
function writeJson(res, status, body, headers = {}) {
	res.writeHead(status, {
		"Content-Type": "application/json",
		"Cache-Control": "no-store",
		...headers
	});
	res.end(JSON.stringify(body));
}
function parseSince(request) {
	const value = new URL(request.url ?? "/api/token-monitor/charge-events", "http://localhost").searchParams.get("since");
	if (value === null) return 0;
	if (!/^(0|[1-9]\d*)$/.test(value)) return void 0;
	const since = Number(value);
	return Number.isSafeInteger(since) ? since : void 0;
}
function createChargeEventsRouteHandler(batch = chargeBatchSince) {
	return (request, response) => {
		const method = request.method ?? "GET";
		if (method !== "GET" && method !== "HEAD") {
			writeJson(response, 405, { error: {
				code: "METHOD_NOT_ALLOWED",
				message: "Only GET and HEAD are supported"
			} }, { Allow: "GET, HEAD" });
			return;
		}
		const since = parseSince(request);
		if (since === void 0) {
			writeJson(response, 400, { error: {
				code: "INVALID_SINCE",
				message: "since must be a non-negative safe integer"
			} });
			return;
		}
		const value = batch(since);
		response.writeHead(200, {
			"Content-Type": "application/json",
			"Cache-Control": "no-store"
		});
		response.end(method === "HEAD" ? void 0 : JSON.stringify(value));
	};
}
function registerChargeEventsRoute(ctx, batch = chargeBatchSince) {
	const guard = createRouteGuard(ctx);
	const handler = createChargeEventsRouteHandler(batch);
	ctx.effect(() => ctx.webServer.register({
		kind: "exact",
		path: TOKEN_MONITOR_CHARGE_EVENTS_PATH,
		handler: (request, response) => {
			if (!guard(request, response)) return;
			handler(request, response);
		}
	}), "token-monitor: charge events route");
}
/** Carry over endpoints of adapters that were already saved and running before approvals existed.
* Only read-only GET targets are carried over; a write target always needs an explicit approval,
* and the version marker makes this a single startup pass instead of a standing auto-approval.
*/
async function migrateBalanceEndpointPolicy(store) {
	for (let attempt = 0; attempt < 3; attempt++) {
		const current = store.get();
		if ((current.balanceEndpointPolicyVersion ?? 0) >= 1) return;
		const seeded = {};
		for (const [provider, entry] of Object.entries(current.balanceScripts ?? {})) seeded[provider] = await seedsFromSavedScript(entry.script);
		const balanceEndpoints = {
			...seeded,
			...current.balanceEndpoints ?? {}
		};
		try {
			await store.update({
				balanceEndpoints,
				balanceEndpointPolicyVersion: 1
			}, current.revision);
			return;
		} catch (error) {
			if (error instanceof PluginStoreConflictError && attempt < 2) continue;
			throw error;
		}
	}
}
/** Endpoints a saved adapter may keep without a fresh approval. */
async function seedsFromSavedScript(script) {
	if (!script.trim() || refuseScriptLiteral(script) !== void 0) return [];
	try {
		const request = validateBalanceRequest(await evaluateBalanceScript(script));
		return request.method === "GET" ? [{
			path: request.path,
			method: "GET"
		}] : [];
	} catch {
		return [];
	}
}
//#endregion
//#region plugins/dsh-token-monitor/src/features/billing.ts
function apply(ctx, services) {
	const billing = {
		readSnapshot: () => readBillingSnapshot(services.store, services.settings),
		priceRecord: (record, frozen) => {
			const { inputTokens, cacheReadTokens, cacheWriteTokens, outputTokens } = record;
			const decision = frozen ? billUsage(frozen, {
				inputTokens,
				cacheReadTokens,
				cacheWriteTokens,
				outputTokens
			}, record.provider, record.model, record.timestamp) : void 0;
			const cost = decision ?? priceUsage(record.inputTokens, record.cacheReadTokens, record.cacheWriteTokens, record.outputTokens, record.provider, record.model, record.timestamp, services.priceTable());
			return cost ? {
				...record,
				...cost,
				billingStatus: "priced",
				...decision
			} : record;
		},
		onPersistedRecord: (record, kind) => {
			if (record.billingStatus !== "priced") return;
			recordCharge(record.cost, record.timestamp, kind, {
				cacheHit: {
					tokens: record.cacheReadTokens,
					cost: record.costCacheRead
				},
				cacheMiss: {
					tokens: record.inputTokens + record.cacheWriteTokens,
					cost: record.costInput + record.costCacheWrite
				},
				output: {
					tokens: record.outputTokens,
					cost: record.costOutput
				}
			}, {
				sessionId: record.sessionId,
				sourceEventSeq: record.sourceEventSeq,
				provider: record.provider,
				model: record.model
			});
		}
	};
	ctx.effect(() => {
		services.billing = billing;
		return () => {
			if (services.billing === billing) delete services.billing;
			resetCharges();
		};
	}, "token-monitor: live billing provider");
	ctx.inject(["settings"], async (settingsCtx) => {
		await migrateBalanceEndpointPolicy(services.store);
		registerBillingTools(settingsCtx, services.store, services.settings);
		settingsCtx.inject(["webServer", "connection"], (web) => registerBillingSettingsRoutes(web, services.store, services.settings));
		settingsCtx.inject(["llm"], (balanceCtx) => {
			const scripts = new BalanceScriptConfig(services.store, async (provider) => {
				if (provider === "deepseek-account") return void 0;
				const identity = await resolveBalanceIdentity(balanceCtx, provider, services.store.get().balanceProviders?.[provider]);
				return identity === void 0 ? void 0 : builtInBalanceAdapter(identity.baseURL);
			});
			const registry = new BalanceRegistry({
				readScript: (provider) => scripts.read(provider),
				resolveIdentity: (provider) => resolveBalanceIdentity(balanceCtx, provider, services.store.get().balanceProviders?.[provider]),
				request: requestBalanceJson,
				warn: (message) => balanceCtx.logger.warn(message)
			});
			attachAccountBalance(balanceCtx, (source) => registry.setAccountSource(source));
			balanceCtx.effect(() => () => registry.stop(), "token-monitor: balance requests");
			balanceCtx.inject(["webServer", "connection"], (web) => registerBalanceApi(web, scripts, registry));
			balanceCtx.inject(["tools"], (tools) => registerBalanceTools(tools, scripts, registry));
			const planQuotas = new PlanQuotaRegistry({
				listProviders: () => balanceCtx.llm.listConfigurableProviders().map((item) => item.provider),
				resolveIdentity: (provider) => resolveBalanceIdentity(balanceCtx, provider, services.store.get().balanceProviders?.[provider]),
				request: requestBalanceJson,
				warn: (message) => balanceCtx.logger.warn(message)
			});
			balanceCtx.effect(() => () => planQuotas.stop(), "token-monitor: plan quota requests");
			balanceCtx.inject(["webServer", "connection"], (web) => registerPlanQuotaApi(web, planQuotas));
		});
	});
	ctx.inject(["webServer", "connection"], (web) => {
		const guard = createRouteGuard(web);
		web.effect(() => web.webServer.register({
			kind: "exact",
			path: "/api/token-monitor/today-spend",
			handler: (req, res) => {
				if (!guard(req, res)) return;
				res.writeHead(200, {
					"Content-Type": "application/json",
					"Cache-Control": "no-store"
				});
				res.end(JSON.stringify(services.storage.todaySpend()));
			}
		}), "token-monitor: today spend route");
		registerBudgetRoutes(web, services.storage, () => services.settings.user().dailyBudgetCny, services.priceTable());
		registerChargeEventsRoute(web);
	});
}
//#endregion
export { apply };
