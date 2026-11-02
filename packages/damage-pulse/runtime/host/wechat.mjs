import { randomUUID } from "node:crypto";
import { access, mkdir, mkdtemp, readFile, rename, rm, unlink, writeFile } from "node:fs/promises";
import { homedir, tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";
import "@deepseek-ai/cordis";
import { execFile } from "node:child_process";
import { scrubbedParentEnv } from "@deepseek-ai/dsh-subprocess";
/** Stable operation error safe to translate into an HTTP response. */
var WechatConnectionError = class extends Error {
	code;
	constructor(code, message, options) {
		super(message, options);
		this.code = code;
		this.name = "WechatConnectionError";
	}
};
var LoginSessionStore = class {
	ttlMs;
	now;
	createId;
	current;
	expiredSessionId;
	constructor(ttlMs, now, createId) {
		this.ttlMs = ttlMs;
		this.now = now;
		this.createId = createId;
	}
	begin(qrcode, qrPayload) {
		const session = {
			sessionId: this.createId(),
			qrcode,
			qrPayload,
			phase: "waiting",
			expiresAt: this.now() + this.ttlMs
		};
		this.current = session;
		this.expiredSessionId = void 0;
		return session;
	}
	snapshot() {
		const session = this.current;
		if (session === void 0) return void 0;
		if (this.now() >= session.expiresAt) {
			this.expiredSessionId = session.sessionId;
			this.current = void 0;
			return;
		}
		return {
			sessionId: session.sessionId,
			phase: session.phase,
			expiresAt: session.expiresAt
		};
	}
	require(sessionId) {
		const session = this.current;
		if (session === void 0) {
			if (sessionId === this.expiredSessionId) throw new WechatConnectionError("LOGIN_SESSION_EXPIRED", "微信登录二维码已过期");
			throw new WechatConnectionError("LOGIN_SESSION_NOT_FOUND", "微信登录会话不存在");
		}
		if (session.sessionId !== sessionId) throw new WechatConnectionError("LOGIN_SESSION_NOT_FOUND", "微信登录会话不存在");
		if (this.now() >= session.expiresAt) {
			this.expiredSessionId = session.sessionId;
			this.current = void 0;
			throw new WechatConnectionError("LOGIN_SESSION_EXPIRED", "微信登录二维码已过期");
		}
		return session;
	}
	markScanned(session) {
		if (this.current === session) session.phase = "scanned";
	}
	expire(session) {
		if (this.current !== session) return;
		this.expiredSessionId = session.sessionId;
		this.current = void 0;
	}
	finish(session) {
		if (this.current === session) this.current = void 0;
		this.expiredSessionId = void 0;
	}
	clear() {
		this.current = void 0;
		this.expiredSessionId = void 0;
	}
};
var SingleFlightGate = class {
	active;
	get operation() {
		return this.active ?? "idle";
	}
	async run(operation, task) {
		if (this.active !== void 0) throw new WechatConnectionError("OPERATION_IN_PROGRESS", `微信连接操作 ${this.active} 正在进行`);
		this.active = operation;
		try {
			return await task();
		} finally {
			this.active = void 0;
		}
	}
};
/** Owns the in-memory login lifecycle and refuses process changes without an injected Host owner. */
var WechatConnectionAdapter = class {
	options;
	gate = new SingleFlightGate();
	sessions;
	now;
	constructor(options) {
		this.options = options;
		this.now = options.now ?? Date.now;
		const ttlMs = options.loginTtlMs ?? 3e5;
		if (!Number.isSafeInteger(ttlMs) || ttlMs <= 0) throw new TypeError("wechat login TTL must be a positive safe integer");
		this.sessions = new LoginSessionStore(ttlMs, this.now, options.createSessionId ?? randomUUID);
	}
	/** Read orthogonal authentication, process, and delivery facts without deriving connected from credentials. */
	async status() {
		const checkedAt = this.now();
		let availability = "unsupported";
		let credential = {
			auth: "unknown",
			delivery: "unknown"
		};
		let process = "unknown";
		let lastError;
		try {
			availability = await this.options.gateway.isAvailable() ? "available" : "unsupported";
			if (availability === "available") credential = await this.options.gateway.inspectCredentials();
		} catch {
			availability = "unsupported";
			lastError = {
				code: "CLAWBOT_UNAVAILABLE",
				message: "ClawBot 微信组件不可用"
			};
		}
		try {
			if (this.options.hostBridge !== void 0) {
				const observation = await this.options.hostBridge.inspect();
				process = observation.state === "running" ? "host-managed-running" : observation.state === "stopped" ? "host-managed-stopped" : "unknown";
			} else process = await this.options.externalBridge?.inspect() ?? "unknown";
		} catch {
			process = "unknown";
			lastError ??= {
				code: "BRIDGE_INSPECTION_FAILED",
				message: "微信 bridge 状态检查失败"
			};
		}
		lastError ??= credential.lastError;
		const pendingLogin = this.sessions.snapshot();
		const auth = pendingLogin === void 0 ? credential.auth : "pending";
		const canMutateOwnedBridge = this.options.hostBridge !== void 0 && this.gate.operation === "idle";
		return {
			schemaVersion: 1,
			provider: "clawbot-wechat",
			availability,
			auth,
			process,
			delivery: credential.delivery,
			operation: this.gate.operation,
			capabilities: {
				canLogin: availability === "available" && this.gate.operation === "idle",
				canReconnect: canMutateOwnedBridge && credential.auth === "authenticated",
				canDisconnect: canMutateOwnedBridge && (credential.auth !== "unconfigured" || pendingLogin !== void 0)
			},
			...pendingLogin === void 0 ? {} : { pendingLogin },
			...credential.maskedUserId === void 0 ? {} : { identity: { maskedUserId: credential.maskedUserId } },
			...lastError === void 0 ? {} : { lastError },
			checkedAt
		};
	}
	/** Start one five-minute in-memory QR login session. */
	async login() {
		return {
			login: await this.gate.run("login", async () => {
				if (!await this.options.gateway.isAvailable()) throw new WechatConnectionError("UNSUPPORTED", "ClawBot 微信组件不可用");
				try {
					const qr = await this.options.gateway.createLoginQr();
					assertBoundedString(qr.qrcode, "qrcode", 8192);
					assertBoundedString(qr.qrPayload, "qrPayload", 16384);
					const session = this.sessions.begin(qr.qrcode, qr.qrPayload);
					return {
						sessionId: session.sessionId,
						expiresAt: session.expiresAt,
						qrPayload: session.qrPayload
					};
				} catch (error) {
					if (error instanceof WechatConnectionError) throw error;
					throw new WechatConnectionError("OPERATION_FAILED", "微信登录二维码生成失败", { cause: error });
				}
			}),
			status: await this.status()
		};
	}
	/** Poll one short-lived login session and save only validated ClawBot credentials on confirmation. */
	async confirmLogin(sessionId) {
		let result;
		await this.gate.run("confirm-login", async () => {
			const session = this.sessions.require(sessionId);
			let polled;
			try {
				polled = await this.options.gateway.pollLogin(session.qrcode);
			} catch (error) {
				if (error instanceof WechatConnectionError) throw error;
				throw new WechatConnectionError("OPERATION_FAILED", "微信登录状态检查失败", { cause: error });
			}
			switch (polled.status) {
				case "wait":
					result = "waiting";
					return;
				case "scaned":
					this.sessions.markScanned(session);
					result = "scanned";
					return;
				case "expired":
					this.sessions.expire(session);
					result = "expired";
					return;
				case "confirmed":
					await this.options.gateway.replaceCredentials(polled.credentials);
					this.sessions.finish(session);
					result = "confirmed";
					return;
			}
		});
		return {
			result,
			status: await this.status()
		};
	}
	/** Restart only a bridge explicitly owned by the Host. */
	async reconnect() {
		await this.gate.run("reconnect", async () => {
			const bridge = this.requireHostBridge();
			if ((await this.options.gateway.inspectCredentials()).auth !== "authenticated") throw new WechatConnectionError("NEEDS_LOGIN", "微信凭据未配置或已失效");
			try {
				await bridge.stopAndWaitForExit();
				await bridge.startAndWaitUntilReady();
			} catch (error) {
				throw new WechatConnectionError("OPERATION_FAILED", "微信 bridge 重连失败", { cause: error });
			}
		});
		return await this.status();
	}
	/** Stop an owned bridge before removing credentials; external processes are never signalled. */
	async disconnect(confirm) {
		if (!confirm) throw new WechatConnectionError("CONFIRMATION_REQUIRED", "断开微信前需要明确确认");
		await this.gate.run("disconnect", async () => {
			const bridge = this.requireHostBridge();
			try {
				await bridge.stopAndWaitForExit();
				await this.options.gateway.clearCredentials();
				await this.options.gateway.clearLegacyPendingLogin();
				this.sessions.clear();
			} catch (error) {
				throw new WechatConnectionError("OPERATION_FAILED", "微信断开操作失败", { cause: error });
			}
		});
		return await this.status();
	}
	requireHostBridge() {
		if (this.options.hostBridge === void 0) throw new WechatConnectionError("BRIDGE_NOT_OWNED", "微信 bridge 不由 DSH Host 管理");
		return this.options.hostBridge;
	}
};
const WECHAT_ILINK_ORIGIN = "https://ilinkai.weixin.qq.com";
const MAX_CREDENTIAL_FILE_BYTES = 65536;
const MAX_CONTEXT_FILE_BYTES = 4194304;
/** File-backed ClawBot gateway that validates all module and JSON results before use. */
var ClawbotFilesystemGateway = class {
	options;
	dataDirectory;
	importModule;
	constructor(options) {
		this.options = options;
		this.dataDirectory = options.dataDirectory ?? join(homedir(), ".wx-ai-bridge");
		this.importModule = options.importModule ?? ((url) => import(url));
	}
	async isAvailable() {
		if (this.options.clawbotIndex.trim().length === 0) return false;
		try {
			await Promise.all([
				access(this.options.clawbotIndex),
				access(join(dirname(this.options.clawbotIndex), "ilink", "auth.js")),
				access(join(dirname(this.options.clawbotIndex), "config.js"))
			]);
			return true;
		} catch {
			return false;
		}
	}
	async inspectCredentials() {
		const credentials = await readBoundedJson(join(this.dataDirectory, "credentials.json"), MAX_CREDENTIAL_FILE_BYTES);
		if (credentials.kind === "missing") return {
			auth: "unconfigured",
			delivery: "not-ready"
		};
		if (credentials.kind === "invalid") return {
			auth: "unknown",
			delivery: "unknown",
			lastError: {
				code: "CREDENTIALS_INVALID",
				message: "ClawBot 凭据文件无效"
			}
		};
		const parsedCredentials = parseStoredCredentials(credentials.value);
		if (parsedCredentials === void 0) {
			if (isPlainObject$1(credentials.value) && Object.keys(credentials.value).length === 0) return {
				auth: "unconfigured",
				delivery: "not-ready"
			};
			return {
				auth: "unknown",
				delivery: "unknown",
				lastError: {
					code: "CREDENTIALS_INVALID",
					message: "ClawBot 凭据文件无效"
				}
			};
		}
		const contexts = await readBoundedJson(join(this.dataDirectory, "context_tokens.json"), MAX_CONTEXT_FILE_BYTES);
		if (contexts.kind === "invalid") return {
			auth: "authenticated",
			delivery: "unknown",
			maskedUserId: maskIdentifier(parsedCredentials.ilinkUserId),
			lastError: {
				code: "CONTEXT_TOKENS_INVALID",
				message: "ClawBot 会话激活信息无效"
			}
		};
		let hasContext = false;
		if (contexts.kind === "value") {
			const value = contexts.value;
			if (!isStringRecord(value)) return {
				auth: "authenticated",
				delivery: "unknown",
				maskedUserId: maskIdentifier(parsedCredentials.ilinkUserId),
				lastError: {
					code: "CONTEXT_TOKENS_INVALID",
					message: "ClawBot 会话激活信息无效"
				}
			};
			hasContext = Object.values(value).some((entry) => entry.length > 0);
		}
		return {
			auth: "authenticated",
			delivery: hasContext ? "ready" : "needs-activation",
			maskedUserId: maskIdentifier(parsedCredentials.ilinkUserId)
		};
	}
	async createLoginQr() {
		const value = await getFunction(await this.loadModule("ilink/auth.js"), "getQRCode")();
		if (!isPlainObject$1(value)) throw new WechatConnectionError("LOGIN_PROTOCOL_ERROR", "微信二维码响应无效");
		const qrcode = boundedString(value.qrcode, 8192);
		const qrPayload = boundedString(value.qrcode_img_content, 16384) ?? qrcode;
		if (qrcode === void 0 || qrPayload === void 0) throw new WechatConnectionError("LOGIN_PROTOCOL_ERROR", "微信二维码响应缺少必要字段");
		return {
			qrcode,
			qrPayload
		};
	}
	async pollLogin(qrcode) {
		assertBoundedString(qrcode, "qrcode", 8192);
		const value = await getFunction(await this.loadModule("ilink/auth.js"), "pollQRCodeStatus")(qrcode);
		if (!isPlainObject$1(value)) throw new WechatConnectionError("LOGIN_PROTOCOL_ERROR", "微信登录状态响应无效");
		if (value.status === "wait" || value.status === "scaned" || value.status === "expired") return { status: value.status };
		if (value.status !== "confirmed") throw new WechatConnectionError("LOGIN_PROTOCOL_ERROR", "微信登录状态响应无效");
		const credentials = parseConfirmedCredentials(value);
		if (credentials === void 0) throw new WechatConnectionError("LOGIN_PROTOCOL_ERROR", "微信登录确认响应缺少凭据");
		return {
			status: "confirmed",
			credentials
		};
	}
	async replaceCredentials(credentials) {
		const parsed = parseStoredCredentials(credentials);
		if (parsed === void 0) throw new WechatConnectionError("LOGIN_PROTOCOL_ERROR", "微信登录凭据无效");
		await this.writeEmptyContextTokens();
		await getFunction(await this.loadModule("config.js"), "saveCredentials")(parsed);
	}
	async clearCredentials() {
		await this.writeEmptyContextTokens();
		await getFunction(await this.loadModule("config.js"), "clearCredentials")();
	}
	async clearLegacyPendingLogin() {
		try {
			await unlink(join(this.dataDirectory, "pending_qrcode.json"));
		} catch (error) {
			if (!isNodeError(error, "ENOENT")) throw error;
		}
	}
	async loadModule(relativePath) {
		if (this.options.clawbotIndex.trim().length === 0) throw new WechatConnectionError("UNSUPPORTED", "ClawBot 微信组件不可用");
		const value = await this.importModule(pathToFileURL(join(dirname(this.options.clawbotIndex), relativePath)).href);
		if (!isPlainObject$1(value)) throw new TypeError(`ClawBot module ${relativePath} has invalid exports`);
		return value;
	}
	async writeEmptyContextTokens() {
		await mkdir(this.dataDirectory, {
			recursive: true,
			mode: 448
		});
		const target = join(this.dataDirectory, "context_tokens.json");
		const temporary = `${target}.${randomUUID()}.tmp`;
		try {
			await writeFile(temporary, "{}\n", {
				encoding: "utf8",
				flag: "wx",
				mode: 384
			});
			try {
				await rename(temporary, target);
			} catch {
				await writeFile(target, "{}\n", {
					encoding: "utf8",
					mode: 384
				});
			}
		} finally {
			await unlink(temporary).catch(() => void 0);
		}
	}
};
function getFunction(record, key) {
	const value = record[key];
	if (typeof value !== "function") throw new TypeError(`ClawBot module is missing ${key}`);
	return value;
}
function parseConfirmedCredentials(value) {
	return parseStoredCredentials({
		botToken: value.bot_token,
		baseUrl: value.baseurl ?? WECHAT_ILINK_ORIGIN,
		ilinkBotId: value.ilink_bot_id,
		ilinkUserId: value.ilink_user_id
	});
}
function parseStoredCredentials(value) {
	if (!isPlainObject$1(value)) return void 0;
	const botToken = boundedString(value.botToken, 4096);
	const ilinkBotId = boundedString(value.ilinkBotId, 512);
	const ilinkUserId = boundedString(value.ilinkUserId, 512);
	const baseUrl = normalizeBaseUrl(value.baseUrl);
	if (botToken === void 0 || ilinkBotId === void 0 || ilinkUserId === void 0 || baseUrl === void 0) return;
	return {
		botToken,
		baseUrl,
		ilinkBotId,
		ilinkUserId
	};
}
function normalizeBaseUrl(value) {
	const raw = boundedString(value, 2048);
	if (raw === void 0) return void 0;
	try {
		const url = new URL(raw);
		if (url.origin !== WECHAT_ILINK_ORIGIN || url.pathname !== "/" && url.pathname !== "") return void 0;
		if (url.username || url.password || url.search || url.hash) return void 0;
		return WECHAT_ILINK_ORIGIN;
	} catch {
		return;
	}
}
function boundedString(value, maximumLength) {
	if (typeof value !== "string") return void 0;
	const text = value.trim();
	return text.length > 0 && text.length <= maximumLength ? text : void 0;
}
function assertBoundedString(value, name, maximumLength) {
	if (boundedString(value, maximumLength) === void 0) throw new WechatConnectionError("LOGIN_PROTOCOL_ERROR", `${name} 无效`);
}
function maskIdentifier(value) {
	if (value.length <= 8) return "***";
	return `${value.slice(0, 4)}***${value.slice(-4)}`;
}
function isPlainObject$1(value) {
	if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
	const prototype = Object.getPrototypeOf(value);
	return prototype === Object.prototype || prototype === null;
}
function isStringRecord(value) {
	if (!isPlainObject$1(value)) return false;
	return Object.keys(value).every((key) => key !== "__proto__" && key !== "prototype" && key !== "constructor") && Object.values(value).every((entry) => typeof entry === "string");
}
async function readBoundedJson(path, maximumBytes) {
	let buffer;
	try {
		buffer = await readFile(path);
	} catch (error) {
		return isNodeError(error, "ENOENT") ? { kind: "missing" } : { kind: "invalid" };
	}
	if (buffer.byteLength > maximumBytes) return { kind: "invalid" };
	try {
		return {
			kind: "value",
			value: JSON.parse(buffer.toString("utf8"))
		};
	} catch {
		return { kind: "invalid" };
	}
}
function isNodeError(error, code) {
	return error instanceof Error && "code" in error && error.code === code;
}
//#endregion
//#region plugins/wechat-notify/src/sender.ts
const ACTIVATION_FAILURE = /prepare|context[\s_-]?token|登录|扫码|发过消息|login|expired|激活/i;
function runCommand(invocation) {
	return new Promise((resolve, reject) => {
		execFile(invocation.command, [...invocation.args], {
			encoding: "utf8",
			env: invocation.env,
			timeout: invocation.timeoutMs,
			windowsHide: true
		}, (error) => {
			if (error) reject(error);
			else resolve();
		});
	});
}
/** Extract bounded human-readable process failure text without throwing. */
function describeFailure(error) {
	if (error !== null && typeof error === "object") {
		const value = error;
		const parts = [];
		if (typeof value.stderr === "string" && value.stderr.trim()) parts.push(value.stderr.trim());
		if (typeof value.stdout === "string" && value.stdout.trim()) parts.push(value.stdout.trim());
		if (typeof value.message === "string" && value.message.trim()) parts.push(value.message.trim());
		const text = parts.join(" | ").trim();
		if (text) return text.slice(0, 2e3);
	}
	return String(error).slice(0, 2e3);
}
/** Async UTF-8 ClawBot adapter shared by tools and background reminders. */
var ClawbotWechatSender = class {
	options;
	timeoutMs;
	tempDirectory;
	run;
	constructor(options) {
		this.options = options;
		this.timeoutMs = options.timeoutMs ?? 3e4;
		this.tempDirectory = options.tempDirectory ?? tmpdir();
		this.run = options.run ?? runCommand;
	}
	async send(message) {
		if (this.options.clawbotIndex.trim().length === 0) return {
			ok: false,
			code: "send-failed",
			detail: "未配置 WECHAT_NOTIFY_CLAWBOT_INDEX"
		};
		const privateDirectory = await mkdtemp(join(this.tempDirectory, "dsh-wechat-notify-"));
		const messageFile = join(privateDirectory, "message.txt");
		try {
			await writeFile(messageFile, message, {
				encoding: "utf8",
				flag: "wx",
				mode: 384
			});
			try {
				await this.run({
					command: process.execPath,
					args: [
						this.options.clawbotIndex,
						"send",
						"--file",
						messageFile
					],
					env: scrubbedParentEnv(),
					timeoutMs: this.timeoutMs
				});
				return { ok: true };
			} catch (error) {
				const detail = describeFailure(error);
				return {
					ok: false,
					code: ACTIVATION_FAILURE.test(detail) ? "activation-required" : "send-failed",
					detail
				};
			}
		} finally {
			await rm(privateDirectory, {
				recursive: true,
				force: true
			}).catch(() => {});
		}
	}
};
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
//#region plugins/dsh-token-monitor/src/wechat-routes.ts
const WECHAT_CONNECTION_BASE_PATH = "/api/token-monitor/wechat";
const WECHAT_STATUS_PATH = `${WECHAT_CONNECTION_BASE_PATH}/status`;
const WECHAT_LOGIN_PATH = `${WECHAT_CONNECTION_BASE_PATH}/login`;
const WECHAT_LOGIN_CONFIRM_PATH = `${WECHAT_LOGIN_PATH}/confirm`;
const WECHAT_RECONNECT_PATH = `${WECHAT_CONNECTION_BASE_PATH}/reconnect`;
const WECHAT_DISCONNECT_PATH = `${WECHAT_CONNECTION_BASE_PATH}/disconnect`;
const WECHAT_TEST_PATH = `${WECHAT_CONNECTION_BASE_PATH}/test`;
var WechatRequestError = class extends Error {
	status;
	code;
	constructor(status, code, message) {
		super(message);
		this.status = status;
		this.code = code;
		this.name = "WechatRequestError";
	}
};
const serviceErrorCodes = [
	"UNSUPPORTED",
	"OPERATION_IN_PROGRESS",
	"LOGIN_SESSION_NOT_FOUND",
	"LOGIN_SESSION_EXPIRED",
	"LOGIN_PROTOCOL_ERROR",
	"NEEDS_LOGIN",
	"BRIDGE_NOT_OWNED",
	"CONFIRMATION_REQUIRED",
	"OPERATION_FAILED"
];
function sendJson(response, status, value, head = false, headers = {}) {
	response.writeHead(status, {
		"Content-Type": "application/json; charset=utf-8",
		"Cache-Control": "no-store",
		...headers
	});
	response.end(head ? void 0 : JSON.stringify(value));
}
function sendError(response, status, code, message, headers = {}) {
	sendJson(response, status, { error: {
		code,
		message
	} }, false, headers);
}
function isPlainObject(value) {
	if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
	const prototype = Object.getPrototypeOf(value);
	return prototype === Object.prototype || prototype === null;
}
function hasExactKeys(record, keys) {
	const actual = Object.keys(record);
	return actual.length === keys.length && actual.every((key) => keys.includes(key));
}
function hasDangerousKey(record) {
	return Object.keys(record).some((key) => key === "__proto__" || key === "prototype" || key === "constructor");
}
function mediaType(request) {
	return request.headers["content-type"]?.split(";", 1)[0]?.trim().toLowerCase();
}
async function readBodyText(request) {
	const contentLength = request.headers["content-length"];
	if (contentLength !== void 0) {
		const declared = Number(contentLength);
		if (Number.isFinite(declared) && declared > 4096) {
			request.resume();
			throw new WechatRequestError(413, "PAYLOAD_TOO_LARGE", "请求体超过 4 KiB 限制");
		}
	}
	const chunks = [];
	let size = 0;
	for await (const chunk of request) {
		const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
		size += buffer.byteLength;
		if (size > 4096) {
			request.resume();
			throw new WechatRequestError(413, "PAYLOAD_TOO_LARGE", "请求体超过 4 KiB 限制");
		}
		chunks.push(buffer);
	}
	return Buffer.concat(chunks).toString("utf8");
}
async function requireEmptyBody(request) {
	if ((await readBodyText(request)).trim().length !== 0) throw new WechatRequestError(400, "VALIDATION_ERROR", "该操作不接受请求体");
}
async function readJsonObject(request) {
	if (mediaType(request) !== "application/json") throw new WechatRequestError(415, "UNSUPPORTED_MEDIA_TYPE", "请求必须使用 application/json");
	const text = await readBodyText(request);
	if (text.trim().length === 0) throw new WechatRequestError(400, "INVALID_JSON", "请求体不能为空");
	let value;
	try {
		value = JSON.parse(text);
	} catch {
		throw new WechatRequestError(400, "INVALID_JSON", "请求体不是有效 JSON");
	}
	if (!isPlainObject(value) || hasDangerousKey(value)) throw new WechatRequestError(400, "VALIDATION_ERROR", "请求字段校验失败");
	return value;
}
async function readConfirmLogin(request) {
	const value = await readJsonObject(request);
	if (!hasExactKeys(value, ["sessionId"]) || typeof value.sessionId !== "string" || value.sessionId.length < 1 || value.sessionId.length > 128 || !/^[A-Za-z0-9_-]+$/.test(value.sessionId)) throw new WechatRequestError(400, "VALIDATION_ERROR", "sessionId 无效");
	return value.sessionId;
}
async function readDisconnect(request) {
	const value = await readJsonObject(request);
	if (!hasExactKeys(value, ["confirm"]) || typeof value.confirm !== "boolean") throw new WechatRequestError(400, "VALIDATION_ERROR", "confirm 必须是布尔值");
	return value.confirm;
}
async function readTestMessage(request) {
	const value = await readJsonObject(request);
	if (!hasExactKeys(value, ["message"]) || typeof value.message !== "string" || value.message.trim().length === 0 || value.message.length > 2e3) throw new WechatRequestError(400, "VALIDATION_ERROR", "message 必须是 1–2000 个字符的非空文本");
	return value.message;
}
function serviceErrorStatus(code) {
	switch (code) {
		case "LOGIN_SESSION_NOT_FOUND": return 404;
		case "LOGIN_SESSION_EXPIRED": return 410;
		case "UNSUPPORTED": return 503;
		case "LOGIN_PROTOCOL_ERROR": return 502;
		case "OPERATION_IN_PROGRESS":
		case "BRIDGE_NOT_OWNED":
		case "NEEDS_LOGIN": return 409;
		case "CONFIRMATION_REQUIRED": return 400;
		case "OPERATION_FAILED": return 500;
	}
}
function parseServiceError(error) {
	if (!(error instanceof Error) || !("code" in error)) return void 0;
	const code = error.code;
	if (typeof code !== "string" || !serviceErrorCodes.includes(code)) return void 0;
	if (error.message.length < 1 || error.message.length > 512) return void 0;
	return {
		code,
		message: error.message
	};
}
function allowedMethods(action) {
	return action === "status" ? "GET, HEAD" : "POST";
}
/** Standalone handler seam shared by route registration and focused tests. */
function createWechatConnectionRouteHandler(service, action, reportInternalError = () => void 0) {
	return async (request, response) => {
		const method = request.method ?? "GET";
		const allow = allowedMethods(action);
		if (action === "status" && method !== "GET" && method !== "HEAD" || action !== "status" && method !== "POST") {
			sendError(response, 405, "METHOD_NOT_ALLOWED", `仅支持 ${allow}`, { Allow: allow });
			return;
		}
		try {
			let result;
			switch (action) {
				case "status":
					result = await service.status();
					break;
				case "login":
					await requireEmptyBody(request);
					result = await service.login();
					break;
				case "confirm-login":
					result = await service.confirmLogin(await readConfirmLogin(request));
					break;
				case "reconnect":
					await requireEmptyBody(request);
					result = await service.reconnect();
					break;
				case "disconnect":
					result = await service.disconnect(await readDisconnect(request));
					break;
				case "test-message": {
					const message = await readTestMessage(request);
					if (service.testMessage === void 0) {
						sendError(response, 503, "UNSUPPORTED", "微信测试消息能力当前不可用");
						return;
					}
					const delivery = await service.testMessage(message);
					if (delivery.ok) {
						result = { ok: true };
						break;
					}
					if (delivery.code === "activation-required") {
						sendError(response, 409, "ACTIVATION_REQUIRED", "微信通知通道需要先激活", {});
						return;
					}
					sendError(response, 502, "SEND_FAILED", "微信测试消息发送失败");
					return;
				}
			}
			sendJson(response, 200, result, method === "HEAD");
		} catch (error) {
			if (error instanceof WechatRequestError) {
				sendError(response, error.status, error.code, error.message);
				return;
			}
			const serviceError = parseServiceError(error);
			if (serviceError !== void 0) {
				sendError(response, serviceErrorStatus(serviceError.code), serviceError.code, serviceError.message);
				return;
			}
			reportInternalError(error);
			sendError(response, 500, "OPERATION_FAILED", "微信连接操作失败，请稍后重试");
		}
	};
}
function registerWechatRoutes(ctx, service) {
	const guard = createRouteGuard(ctx);
	const report = (_error) => {
		ctx.logger.warn("dsh-token-monitor wechat connection route failed");
	};
	const routes = [
		{
			path: WECHAT_STATUS_PATH,
			action: "status"
		},
		{
			path: WECHAT_LOGIN_PATH,
			action: "login"
		},
		{
			path: WECHAT_LOGIN_CONFIRM_PATH,
			action: "confirm-login"
		},
		{
			path: WECHAT_RECONNECT_PATH,
			action: "reconnect"
		},
		{
			path: WECHAT_DISCONNECT_PATH,
			action: "disconnect"
		},
		{
			path: WECHAT_TEST_PATH,
			action: "test-message"
		}
	];
	for (const route of routes) {
		const handler = createWechatConnectionRouteHandler(service, route.action, report);
		ctx.effect(() => ctx.webServer.register({
			kind: "exact",
			path: route.path,
			handler: (request, response) => {
				if (!guard(request, response)) return;
				return handler(request, response);
			}
		}), `token-monitor: wechat ${route.action} route`);
	}
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
//#region plugins/dsh-token-monitor/src/features/wechat.ts
function apply(ctx, services) {
	const clawbotIndex = process.env.WECHAT_NOTIFY_CLAWBOT_INDEX?.trim() ?? "";
	const fallbackSender = new ClawbotWechatSender({ clawbotIndex });
	const fallbackConnection = new WechatConnectionAdapter({ gateway: new ClawbotFilesystemGateway({
		clawbotIndex,
		...process.env.WECHAT_NOTIFY_DATA_DIRECTORY ? { dataDirectory: process.env.WECHAT_NOTIFY_DATA_DIRECTORY } : {}
	}) });
	const work = new ModuleWork();
	let active = true;
	const sender = { send: (message) => {
		if (!active) return Promise.resolve({
			ok: false,
			code: "send-failed",
			detail: "Notification channel is stopped"
		});
		return work.run(() => (ctx.get("wechatNotify", false) ?? fallbackSender).send(message));
	} };
	services.wechat = sender;
	ctx.effect(() => async () => {
		active = false;
		if (services.wechat === sender) delete services.wechat;
		await work.stop();
	}, "token-monitor: wechat deliveries");
	ctx.inject(["webServer", "connection"], (web) => {
		const connection = () => {
			const shared = ctx.get("wechatConnection", false);
			if (shared) return shared;
			if (ctx.get("wechatNotify", false)) throw new WechatConnectionError("UNSUPPORTED", "登录管理由原微信插件负责");
			return fallbackConnection;
		};
		registerWechatRoutes(web, {
			status: () => work.run(async () => {
				const shared = ctx.get("wechatConnection", false);
				if (shared) return shared.status();
				if (!ctx.get("wechatNotify", false)) return fallbackConnection.status();
				return {
					schemaVersion: 1,
					provider: "clawbot-wechat",
					availability: "unsupported",
					auth: "unknown",
					process: "unknown",
					delivery: "unknown",
					operation: "idle",
					capabilities: {
						canLogin: false,
						canReconnect: false,
						canDisconnect: false
					},
					lastError: {
						code: "LEGACY_SENDER_ONLY",
						message: "发送可用，登录管理由原插件负责"
					},
					checkedAt: Date.now()
				};
			}),
			login: () => work.run(() => connection().login()),
			confirmLogin: (sessionId) => work.run(() => connection().confirmLogin(sessionId)),
			reconnect: () => work.run(() => connection().reconnect()),
			disconnect: (confirm) => work.run(() => connection().disconnect(confirm)),
			testMessage: (message) => sender.send(message)
		});
	});
}
//#endregion
export { apply };
