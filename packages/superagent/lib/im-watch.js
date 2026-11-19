import { o as health, p as key, r as pause, s as sourceContext } from "./poll-BWLtmrdm.js";
import { z } from "zod";
// src/sources/im.ts
const SOURCE = "im";
const RETRY_MS = 15e3;
/** Event v1 of the dshIm exclusive-consumer contract. */
const EventSchema = z.looseObject({
	channel: z.string().optional(),
	botId: z.string(),
	fingerprint: z.string().optional(),
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
	mentions: z.array(z.looseObject({
		id: z.string(),
		key: z.string().optional(),
		name: z.string().optional()
	})).default([]),
	mentionedAccount: z.boolean().default(false),
	at: z.string(),
	text: z.string().default(""),
	reply: z.looseObject({
		messageId: z.string(),
		conversationId: z.string(),
		actorId: z.string(),
		threadId: z.string().optional(),
		rootId: z.string().optional(),
		parentId: z.string().optional()
	})
});
const ImConfigSchema = z.object({
	botId: z.string().trim().min(1).default(""),
	chats: z.array(z.object({
		conversationId: z.string().min(1),
		name: z.string().trim().max(60).optional(),
		listen: z.enum(["mentions", "all"])
	}).strict()).refine((chats) => new Set(chats.map((chat) => chat.conversationId)).size === chats.length, "Duplicate conversations").default([]),
	directMessages: z.boolean().default(true),
	otherChats: z.enum(["none", "mentions"]).default("none"),
	readPageSize: z.number().int().min(1).max(20).default(10)
}).strict();
/** Deterministic trigger ID: every read path for one message produces the same ID. */
const imTriggerId = (messageId) => key("im", messageId);
const imThreadId = (conversationId, rootId, messageId) => `${conversationId}:${rootId ?? messageId}`;
const imChannel = (event) => ({
	source: "im",
	thread: `im:${imThreadId(event.conversation.id, event.reply.rootId, event.messageId)}`,
	address: {
		botId: event.botId,
		conversationId: event.conversation.id,
		messageId: event.messageId,
		actorId: event.actor.id,
		...event.conversation.kind === "dm" ? { direct: "true" } : {},
		...event.reply.threadId ? { threadId: event.reply.threadId } : {},
		...event.reply.rootId ? { rootId: event.reply.rootId } : {},
		...event.reply.parentId ? { parentId: event.reply.parentId } : {}
	}
});
const replyFromAddress = (address) => ({
	messageId: address.messageId ?? "",
	conversationId: address.conversationId ?? "",
	actorId: address.actorId ?? "",
	...address.threadId ? { threadId: address.threadId } : {},
	...address.rootId ? { rootId: address.rootId } : {},
	...address.parentId ? { parentId: address.parentId } : {}
});
/** Converts a dshIm event into a Trigger; the bot's own messages produce none. */
function imTrigger(input, selfIds) {
	const event = EventSchema.parse(input);
	if (selfIds.has(event.actor.id) || event.actor.kind === "app") return;
	const direct = event.conversation.kind === "dm";
	const mentioned = event.mentionedAccount || event.mentions.some((mention) => selfIds.has(mention.id));
	const thread = imThreadId(event.conversation.id, event.reply.rootId, event.messageId);
	return {
		id: imTriggerId(event.messageId),
		source: "im",
		threads: [{
			source: "im",
			id: thread
		}],
		actor: {
			source: "im",
			id: event.actor.id
		},
		human: event.actor.kind === "user",
		...direct ? { addressed: "direct" } : mentioned ? { addressed: "mention" } : {},
		at: event.at,
		text: event.text,
		channel: imChannel(event),
		meta: {
			botId: event.botId,
			conversationId: event.conversation.id,
			messageId: event.messageId,
			channel: event.channel ?? "",
			direct,
			mentioned,
			...event.reply.threadId ? { threadId: event.reply.threadId } : {},
			...event.reply.rootId ? { rootId: event.reply.rootId } : {},
			...event.reply.parentId ? { parentId: event.reply.parentId } : {},
			reply: event.reply
		}
	};
}
/** Live dshIm binding for channel sends and history reads; set by the watch loop, cleared on release. */
let imRuntime;
const eventReply = (trigger) => trigger.source === "im" ? trigger.meta.reply ?? replyFromAddress(trigger.channel?.address ?? {}) : void 0;
const imKind = {
	kind: "im",
	title: {
		zh: "IM 渠道",
		en: "IM channels"
	},
	description: {
		zh: "通过 @xmanrui/dsh-im 的独占接收能力消费 IM 消息（目前支持飞书/Lark 账号，其他渠道随 @xmanrui/dsh-im 契约扩展）。",
		en: "Consumes IM messages through @xmanrui/dsh-im exclusive intake (Feishu/Lark accounts today; other channels as @xmanrui/dsh-im implements the contract)."
	},
	schema: ImConfigSchema,
	fields: [
		{
			key: "botId",
			type: "text",
			label: {
				zh: "机器人账号",
				en: "Bot account"
			},
			hint: {
				zh: "@xmanrui/dsh-im 中已连接的 botId；该账号需开启 external-consumer 独占接收模式。",
				en: "A connected botId in @xmanrui/dsh-im; the account must run in external-consumer exclusive mode."
			}
		},
		{
			key: "chats",
			type: "rows",
			label: {
				zh: "接收的会话",
				en: "Conversations"
			},
			columns: [{
				key: "conversationId",
				type: "text",
				label: {
					zh: "会话",
					en: "Conversation"
				}
			}, {
				key: "listen",
				type: "select",
				label: {
					zh: "接收",
					en: "Receive"
				},
				options: [{
					value: "mentions",
					label: {
						zh: "仅 @",
						en: "@ only"
					}
				}, {
					value: "all",
					label: {
						zh: "全部消息",
						en: "All"
					}
				}]
			}]
		},
		{
			key: "otherChats",
			type: "select",
			label: {
				zh: "其他群",
				en: "Other chats"
			},
			options: [{
				value: "none",
				label: {
					zh: "不接收",
					en: "Not received"
				}
			}, {
				value: "mentions",
				label: {
					zh: "仅 @",
					en: "@ only"
				}
			}]
		},
		{
			key: "directMessages",
			type: "switch",
			label: {
				zh: "接收私聊",
				en: "Direct messages"
			}
		},
		{
			key: "readPageSize",
			type: "number",
			advanced: true,
			min: 1,
			max: 20,
			label: {
				zh: "每页消息数",
				en: "Messages per page"
			}
		}
	],
	health: ["im"],
	scope({ meta }, config) {
		if (meta.direct === true) return config.directMessages ? {
			listened: true,
			observed: false,
			row: "direct"
		} : {
			listened: false,
			reason: "direct_messages_not_allowed"
		};
		const chat = config.chats.find((item) => item.conversationId === meta.conversationId);
		if (chat) return {
			listened: true,
			observed: chat.listen === "all",
			row: chat.conversationId
		};
		return config.otherChats === "mentions" ? {
			listened: true,
			observed: false,
			row: "other"
		} : {
			listened: false,
			reason: "chat_not_allowed"
		};
	},
	channel: {
		allowed: (address, config) => imKind.scope({ meta: {
			conversationId: address.conversationId ?? "",
			direct: address.direct === "true"
		} }, config).listened,
		async send(_host, message) {
			const runtime = imRuntime;
			if (!runtime) throw new Error("im source is not connected to @xmanrui/dsh-im");
			const address = message.channel.address;
			try {
				await runtime.dshim.replyChecked(address.botId ?? runtime.botId, replyFromAddress(address), message.text, { expectedFingerprint: runtime.fingerprint });
			} catch (error) {
				const code = error.code;
				if (code === "stale-route" || code === "capability-unavailable") return "gone";
				throw error;
			}
			return "sent";
		},
		link(address) {
			return {
				url: "",
				label: {
					zh: `会话 ${address.conversationId ?? ""}`,
					en: `Conversation ${address.conversationId ?? ""}`
				}
			};
		}
	},
	threadContext: {
		messageId: (trigger) => String(trigger.meta.messageId ?? ""),
		async read(_commands, trigger, part, cursor, config) {
			const runtime = imRuntime;
			const reply = eventReply(trigger);
			if (!runtime?.dshim.historyChecked || !reply) return {
				messages: [],
				body: {}
			};
			const scope = part === "thread" ? "thread" : part === "parent" ? "nearby" : "group";
			const page = await runtime.dshim.historyChecked(runtime.botId, reply, {
				scope,
				limit: config.readPageSize,
				...cursor ? { cursor } : {}
			}, { expectedFingerprint: runtime.fingerprint });
			return {
				messages: page.events.flatMap((raw) => {
					try {
						const event = EventSchema.parse(raw);
						return [{
							id: event.messageId,
							from: event.actor.id,
							at: event.at,
							text: event.text,
							...event.actor.kind !== "user" ? { bot: true } : {},
							...event.reply.parentId ? { reply_to: event.reply.parentId } : {}
						}];
					} catch {
						return [];
					}
				}),
				next: page.hasMore ? page.nextCursor : void 0,
				body: {}
			};
		},
		images: () => []
	},
	find: (query) => ({
		threads: [],
		terms: [...new Set(query.match(/[A-Za-z0-9_-]{8,}/g) ?? [])]
	}),
	repliesTo: (trigger) => typeof trigger.meta.parentId === "string" ? imTriggerId(trigger.meta.parentId) : void 0,
	policy: {
		unnamed: {
			person: {
				zh: "IM 用户",
				en: "IM user"
			},
			bot: {
				zh: "IM 机器人",
				en: "IM bot"
			}
		},
		schema: z.object({
			allowed: z.array(z.object({
				id: z.string().min(1),
				name: z.string().trim().max(100).optional()
			}).strict()).refine((users) => new Set(users.map((user) => user.id)).size === users.length, "Duplicate sender ids").default([]),
			bots: z.array(z.object({
				id: z.string().min(1),
				name: z.string().trim().max(100).optional()
			}).strict()).optional()
		}).strict(),
		fields: [{
			key: "allowed",
			type: "rows",
			label: {
				zh: "能发起工作的 IM 用户",
				en: "IM users who may originate work"
			},
			columns: [{
				key: "id",
				type: "text",
				label: {
					zh: "发送人 ID",
					en: "Sender ID"
				}
			}, {
				key: "name",
				type: "text",
				label: {
					zh: "名字",
					en: "Name"
				},
				optional: true
			}]
		}, {
			key: "bots",
			type: "rows",
			label: {
				zh: "消息可以成为候选的机器人",
				en: "Bots whose messages may become candidates"
			},
			columns: [{
				key: "id",
				type: "text",
				label: {
					zh: "Bot ID",
					en: "Bot ID"
				}
			}, {
				key: "name",
				type: "text",
				label: {
					zh: "名字",
					en: "Name"
				},
				optional: true
			}]
		}],
		explicit: {
			zh: "名单内的人 @ 机器人或私聊机器人，总是明确的请求。",
			en: "Someone on the list who mentions the bot or messages it directly always makes an explicit request."
		},
		rows(stored) {
			const config = ImConfigSchema.parse(stored);
			const mentions = {
				zh: "仅 @",
				en: "@ only"
			};
			return [
				...config.chats.map((chat) => ({
					id: chat.conversationId,
					label: chat.name || chat.conversationId,
					note: chat.listen === "all" ? {
						zh: "全部消息",
						en: "All"
					} : mentions,
					cells: {
						listedUnaddressed: chat.listen === "all",
						unlistedAddressed: true,
						unlistedUnaddressed: chat.listen === "all"
					}
				})),
				{
					id: "other",
					label: {
						zh: "其他群",
						en: "Other chats"
					},
					note: config.otherChats === "mentions" ? mentions : {
						zh: "不接收",
						en: "Not received"
					},
					cells: {
						listedUnaddressed: false,
						unlistedAddressed: config.otherChats === "mentions",
						unlistedUnaddressed: false
					}
				},
				{
					id: "direct",
					label: {
						zh: "私聊",
						en: "Direct messages"
					},
					note: config.directMessages ? {
						zh: "接收",
						en: "Received"
					} : {
						zh: "不接收",
						en: "Not received"
					},
					cells: {
						listedUnaddressed: false,
						unlistedAddressed: config.directMessages,
						unlistedUnaddressed: false
					}
				}
			];
		}
	},
	environment: {
		variables: [{
			key: "DSH_SUPERAGENT_IM_BOT",
			description: {
				zh: "@xmanrui/dsh-im 机器人账号",
				en: "The @xmanrui/dsh-im bot account"
			}
		}, {
			key: "DSH_SUPERAGENT_IM_CHAT",
			description: {
				zh: "接下工单的会话 ID",
				en: "Conversation ID that started the ticket"
			}
		}],
		values: ({ trigger }) => ({
			DSH_SUPERAGENT_IM_BOT: imRuntime?.botId ?? "",
			DSH_SUPERAGENT_IM_CHAT: trigger?.source === "im" ? String(trigger.meta.conversationId ?? "") : ""
		})
	}
};
/** Returns the IM Source's settings, falling back to schema defaults while the plugin is disabled. */
const imSettings = (sources) => sources.instance("im")?.config ?? ImConfigSchema.parse({});
async function consume(ctx, dshim, signal) {
	const botId = ctx.config("im")?.botId.trim();
	if (!botId) {
		ctx.report("im", health("paused", "setupPending"));
		await pause(RETRY_MS, signal);
		return;
	}
	const account = await dshim.describeBot(botId);
	const fingerprint = account.account.fingerprint;
	const selfIds = /* @__PURE__ */ new Set([botId, account.account.id ?? ""]);
	imRuntime = {
		dshim,
		botId,
		fingerprint
	};
	ctx.report("im", health("ready", "pollFailures", {
		count: "0",
		error: ""
	}));
	const release = await dshim.consumeInbound(botId, {
		expectedFingerprint: fingerprint,
		signal,
		async onEvent(raw, { signal: eventSignal }) {
			eventSignal?.throwIfAborted();
			const trigger = imTrigger(raw, selfIds);
			if (trigger) await ctx.receive(trigger);
			return { accepted: true };
		}
	});
	try {
		await new Promise((resolve) => {
			if (signal.aborted) resolve();
			signal.addEventListener("abort", () => resolve(), { once: true });
		});
	} finally {
		release();
		imRuntime = void 0;
	}
}
const name = "dsh-superagent-im";
const inject = ["orchestrator"];
function apply(ctx) {
	ctx.effect(() => ctx.orchestrator.sources.register(imKind), "im: source kind");
	ctx.effect(() => {
		const controller = new AbortController();
		const running = (async () => {
			const sctx = sourceContext(ctx.orchestrator, imKind);
			await sctx.ready;
			while (!controller.signal.aborted) {
				const dshim = ctx.get("dshIm");
				if (!dshim?.consumeInbound) {
					sctx.report("im", health("paused", "sourceOff"));
					await pause(RETRY_MS, controller.signal);
					continue;
				}
				try {
					await consume(sctx, dshim, controller.signal);
				} catch (error) {
					if (controller.signal.aborted) return;
					sctx.report("im", health("error", "pollFailures", {
						count: "1",
						error: String(error)
					}));
					await pause(RETRY_MS, controller.signal);
				}
			}
		})();
		return async () => {
			controller.abort();
			await running;
		};
	});
}
export { SOURCE, apply, imChannel, imKind, imSettings, imThreadId, imTrigger, imTriggerId, inject, name, replyFromAddress };
