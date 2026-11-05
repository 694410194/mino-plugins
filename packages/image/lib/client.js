window.__ModuleLoader__.load({
	id: "mino-image",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react_jsx_runtime = require("react/jsx-runtime");
		let react = require("react");
		// lib/types/shared.js
		/** Host route the conversation card calls for regenerate. */
		const GENERATE_ROUTE = "/plugins/mino-image/generate";
		// lib/types/client/locales.js
		/** Locale dictionary for the Mino image plugin. */
		const NS = "mino-image";
		const zh = {
			"settings.title": "图像生成",
			"settings.desc": "使用 Mino 账号额度调用图像生成模型；在对话中让 Agent 生成或编辑图片。",
			"settings.field.model": "图像模型",
			"settings.field.model.hint": "在 Mino 后台开通的图像模型 id，例如 nano-banana 或 gpt-image。",
			"settings.field.editModel": "修图模型（可选）",
			"settings.field.editModel.hint": "留空则与图像模型相同。",
			"settings.field.size": "默认尺寸",
			"settings.field.quality": "默认质量（可选）",
			"settings.field.quality.hint": "例如 auto / low / medium / high；留空不发送。",
			"settings.field.timeout": "超时时间（秒）",
			"settings.field.saveToWorkspace": "同时保存到工作区",
			"settings.field.workspaceFolder": "工作区子目录",
			"settings.readOnly": "设置由配置文件提供，只读；如需修改请编辑对应的配置来源。",
			"settings.loading": "正在加载图像生成设置…",
			"settings.unavailable": "宿主尚未提供图像生成设置，请检查插件是否已启用及其加载日志。",
			"settings.writeRejected": "有一项设置未能保存，请检查后重试。",
			"settings.save": "保存",
			"settings.saving": "保存中…",
			"settings.saved": "已保存",
			"card.generatedTitle": "生成的图片",
			"card.generating": "正在生成图片…",
			"card.loading": "加载中…",
			"card.regenerate": "重新生成",
			"card.regenerating": "正在重新生成…",
			"card.regenerateTitle": "重新生成图片",
			"card.regenerateHint": "修改提示词后确认，新图片会替换当前显示，原图仍可切换回来。",
			"card.confirmRegenerate": "确认重新生成",
			"card.regenerateFailed": "重新生成失败",
			"card.cancel": "取消",
			"card.copyImg": "复制图片",
			"card.copiedImage": "已复制",
			"card.copyFailed": "复制失败",
			"card.download": "下载",
			"card.openNewTab": "新窗口打开",
			"card.savedToPath": "已保存到",
			"card.versionLabel": "第 {current}/{total} 版",
			"card.versionPrevious": "上一版",
			"card.versionNext": "下一版",
			"card.resultShown": "图片已生成",
			"card.promptLabel": "提示词"
		};
		const en = {
			"settings.title": "Image generation",
			"settings.desc": "Generate and edit images in conversation through your Mino account balance.",
			"settings.field.model": "Image model",
			"settings.field.model.hint": "An image model id enabled on your Mino account, e.g. nano-banana or gpt-image.",
			"settings.field.editModel": "Edit model (optional)",
			"settings.field.editModel.hint": "Empty reuses the image model.",
			"settings.field.size": "Default size",
			"settings.field.quality": "Default quality (optional)",
			"settings.field.quality.hint": "For example auto / low / medium / high; empty omits the field.",
			"settings.field.timeout": "Timeout (seconds)",
			"settings.field.saveToWorkspace": "Also save to workspace",
			"settings.field.workspaceFolder": "Workspace subfolder",
			"settings.readOnly": "Settings come from a profile file and are read-only; edit that source to change them.",
			"settings.loading": "Loading image generation settings…",
			"settings.unavailable": "The host has not provided image generation settings. Check that the plugin is enabled and review its load logs.",
			"settings.writeRejected": "A setting could not be saved. Please check and try again.",
			"settings.save": "Save",
			"settings.saving": "Saving…",
			"settings.saved": "Saved",
			"card.generatedTitle": "Generated image",
			"card.generating": "Generating image…",
			"card.loading": "Loading…",
			"card.regenerate": "Regenerate",
			"card.regenerating": "Regenerating…",
			"card.regenerateTitle": "Regenerate image",
			"card.regenerateHint": "Edit the prompt if needed. The new image replaces this view while the original remains available.",
			"card.confirmRegenerate": "Regenerate",
			"card.regenerateFailed": "Regeneration failed",
			"card.cancel": "Cancel",
			"card.copyImg": "Copy image",
			"card.copiedImage": "Copied",
			"card.copyFailed": "Copy failed",
			"card.download": "Download",
			"card.openNewTab": "Open in new tab",
			"card.savedToPath": "Saved to",
			"card.versionLabel": "Version {current}/{total}",
			"card.versionPrevious": "Previous",
			"card.versionNext": "Next",
			"card.resultShown": "Image result is shown in the conversation",
			"card.promptLabel": "Prompt"
		};
		// lib/types/client/image-result-node.js
		const IMAGE_RESULT_NODE_KIND = "mino-image-result";
		/** Plugin tools whose results carry image presentation meta. */
		const IMAGE_TOOL_NAMES = /* @__PURE__ */ new Set([
			"generate_image",
			"generate_images",
			"edit_image"
		]);
		/** Give each image Tool result its own Chat row at the event that produced it. */
		function createImageResultDefinition() {
			return {
				kind: IMAGE_RESULT_NODE_KIND,
				target: "chat",
				match: (event) => {
					if (event.type === "tool/ptc-dispatch") {
						if (event.data.isError || !IMAGE_TOOL_NAMES.has(event.data.name)) return null;
						return imageResultsFromDispatch(event).length === 0 ? null : {
							id: `ptc:${event.data.subCallId}`,
							role: "start"
						};
					}
					if (event.type === "tool/result" && imageResultsFromMeta(event.data.meta).length > 0) return {
						id: `result:${String(event.seq)}`,
						role: "start"
					};
					return null;
				},
				start: (_context, match) => {
					if (match.event.type === "tool/ptc-dispatch") {
						const results = imageResultsFromDispatch(match.event);
						if (results.length === 0) throw new Error("mino-image-result start requires a plugin image dispatch");
						return { results: results.map((result) => ({
							...result,
							seq: match.event.seq
						})) };
					}
					if (match.event.type !== "tool/result") throw new Error("mino-image-result start requires an image Tool result");
					const results = imageResultsFromMeta(match.event.data.meta);
					if (results.length === 0) throw new Error("mino-image-result start requires an image Tool result");
					return {
						turn: match.event.data.turn,
						results: results.map((result) => ({
							...result,
							seq: match.event.seq
						}))
					};
				},
				update: (context, match) => {
					if (match.event.type !== "tool/ptc-dispatch") return context.state;
					return imageResultsFromDispatch(match.event).reduce((state, result) => appendResult(state, result, match.event.seq), context.state);
				},
				buildViewNode: (context) => buildNode(context)
			};
		}
		function buildNode(context) {
			const state = context.state;
			const first = state?.results[0];
			if (state === void 0 || first === void 0) return null;
			return {
				key: context.key,
				kind: IMAGE_RESULT_NODE_KIND,
				id: context.id,
				target: "chat",
				anchorSeq: first.seq,
				location: { kind: "session" },
				visibility: "visible",
				data: {
					...state.turn !== void 0 ? { turn: state.turn } : {},
					results: state.results.map(({ seq: _seq, ...result }) => result)
				}
			};
		}
		/** Append a parsed result unless its attachment is already collected. */
		function appendResult(state, result, seq) {
			if (state.results.some((candidate) => candidate.attachment.attachmentId === result.attachment.attachmentId)) return state;
			return {
				...state,
				results: [...state.results, {
					...result,
					seq
				}]
			};
		}
		/** Parse the plugin-owned durable presentation metadata from a Tool result event. */
		function imageResultFromMeta(value) {
			const meta = record(value);
			if (meta?.kind !== "mino-image") return void 0;
			const attachment = imageAttachment(meta.attachment);
			if (attachment === void 0) return void 0;
			return {
				attachment,
				prompt: stringValue(meta.prompt, "Generated Image"),
				provider: stringValue(meta.provider, "mino"),
				model: stringValue(meta.model, ""),
				output: stringValue(meta.output, ""),
				...typeof meta.savedTo === "string" ? { savedTo: meta.savedTo } : {}
			};
		}
		/** Parse all successful images from either a single or batch Tool result meta. */
		function imageResultsFromMeta(value) {
			const meta = record(value);
			if (meta?.kind === "mino-image-batch" && Array.isArray(meta.images)) return meta.images.flatMap((image) => {
				const result = imageResultFromMeta(image);
				return result === void 0 ? [] : [result];
			});
			const result = imageResultFromMeta(value);
			return result === void 0 ? [] : [result];
		}
		/**
		* Parse plugin image results from a `tool/ptc-dispatch` event: its durable
		* `meta` carries the same presentation payload as `tool/result`; a meta-less
		* legacy event falls back to the rendered image blocks plus call arguments.
		*/
		function imageResultsFromDispatch(event) {
			const results = imageResultsFromMeta(event.data.meta);
			if (results.length > 0) return results;
			const image = event.data.content.find((block) => block.type === "image" && "attachment" in block);
			if (image === void 0 || image.type !== "image") return [];
			const args = record(event.data.arguments);
			const sourceIds = sourceAttachmentIds(args);
			return [{
				attachment: image.attachment,
				prompt: stringValue(args?.prompt, "Generated Image"),
				provider: "mino",
				model: "",
				output: "",
				...sourceIds !== void 0 ? { sourceAttachmentIds: sourceIds } : {}
			}];
		}
		/** Collect edit_image source attachment ids (single or list form) from dispatch arguments. */
		function sourceAttachmentIds(args) {
			if (args === void 0) return void 0;
			const single = typeof args.source_attachment_id === "string" ? [args.source_attachment_id] : void 0;
			const list = Array.isArray(args.source_attachment_ids) ? args.source_attachment_ids.filter((id) => typeof id === "string") : void 0;
			const ids = single ?? list;
			return ids !== void 0 && ids.length > 0 ? ids : void 0;
		}
		/** Parse an ImageAttachmentRef from the serialized meta payload. */
		function imageAttachment(value) {
			const candidate = record(value);
			if (candidate === void 0 || typeof candidate.attachmentId !== "string" || !isImageMediaType(candidate.mediaType) || !positiveInteger(candidate.bytes) || !positiveInteger(candidate.width) || !positiveInteger(candidate.height)) return void 0;
			const original = record(candidate.originalDimensions);
			if (candidate.originalDimensions !== void 0 && (original === void 0 || !positiveInteger(original.width) || !positiveInteger(original.height))) return void 0;
			return {
				attachmentId: candidate.attachmentId,
				mediaType: candidate.mediaType,
				bytes: candidate.bytes,
				width: candidate.width,
				height: candidate.height,
				...typeof candidate.name === "string" ? { name: candidate.name } : {},
				...original !== void 0 && positiveInteger(original.width) && positiveInteger(original.height) ? { originalDimensions: {
					width: original.width,
					height: original.height
				} } : {}
			};
		}
		function isImageMediaType(value) {
			return value === "image/png" || value === "image/jpeg" || value === "image/webp" || value === "image/gif";
		}
		function positiveInteger(value) {
			return typeof value === "number" && Number.isSafeInteger(value) && value > 0;
		}
		function stringValue(value, fallback) {
			return typeof value === "string" ? value : fallback;
		}
		function record(value) {
			return typeof value === "object" && value !== null && !Array.isArray(value) ? value : void 0;
		}
		// lib/types/client/conversation-image-revisions.js
		const STORAGE_PREFIX = "mino_image_conversation_revisions:";
		/** Read the locally persisted replacement history for one immutable conversation image. */
		function loadConversationImageRevisionChain(originId) {
			const empty = () => ({
				originId,
				currentIndex: 0,
				revisions: []
			});
			try {
				const raw = globalThis.localStorage?.getItem(storageKey(originId));
				if (!raw) return empty();
				const value = JSON.parse(raw);
				if (!isChain(value, originId)) return empty();
				return {
					originId,
					currentIndex: Math.min(value.currentIndex, value.revisions.length),
					revisions: value.revisions
				};
			} catch {
				return empty();
			}
		}
		/** Append a generated version and make it the version shown by the conversation card. */
		function appendConversationImageRevision(originId, revision) {
			const revisions = [...loadConversationImageRevisionChain(originId).revisions.filter((item) => item.attachment.attachmentId !== revision.attachment.attachmentId), revision].slice(-20);
			const next = {
				originId,
				currentIndex: revisions.length,
				revisions
			};
			persist(next);
			return next;
		}
		/** Select an earlier or later version without altering the underlying conversation event. */
		function selectConversationImageRevision(originId, requestedIndex) {
			const current = loadConversationImageRevisionChain(originId);
			const currentIndex = Math.max(0, Math.min(Math.trunc(requestedIndex), current.revisions.length));
			const next = {
				...current,
				currentIndex
			};
			persist(next);
			return next;
		}
		function persist(chain) {
			try {
				globalThis.localStorage?.setItem(storageKey(chain.originId), JSON.stringify(chain));
			} catch {}
		}
		function storageKey(originId) {
			return `${STORAGE_PREFIX}${originId}`;
		}
		function isChain(value, originId) {
			if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
			const candidate = value;
			return candidate.originId === originId && typeof candidate.currentIndex === "number" && Number.isSafeInteger(candidate.currentIndex) && candidate.currentIndex >= 0 && Array.isArray(candidate.revisions) && candidate.revisions.every(isRevision);
		}
		function isRevision(value) {
			if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
			const candidate = value;
			return isAttachment(candidate.attachment) && typeof candidate.provider === "string" && typeof candidate.prompt === "string" && typeof candidate.model === "string" && typeof candidate.output === "string" && typeof candidate.createdAt === "number" && Number.isFinite(candidate.createdAt) && typeof candidate.ratio === "string" && typeof candidate.quality === "string";
		}
		function isAttachment(value) {
			if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
			const candidate = value;
			return typeof candidate.attachmentId === "string" && (candidate.mediaType === "image/png" || candidate.mediaType === "image/jpeg" || candidate.mediaType === "image/webp" || candidate.mediaType === "image/gif") && typeof candidate.bytes === "number" && typeof candidate.width === "number" && typeof candidate.height === "number";
		}
		// lib/types/client/conversation-regenerate.js
		/**
		* Build the plugin generate-route request that reproduces a conversation
		* image with an edited prompt. The output label `size(, quality=...)` the
		* host recorded is parsed back into request fields so the revision repeats
		* the same knobs.
		*/
		function conversationRegenerateRequest(image, prompt, remembered) {
			const settings = remembered ?? outputSettings(image.output);
			const request = {
				prompt: prompt.trim(),
				model: image.model
			};
			const size = sizeFromRatio(settings.ratio);
			if (size !== void 0) request.size = size;
			if (settings.quality !== "default" && settings.quality !== "") request.quality = settings.quality;
			return request;
		}
		function outputSettings(output) {
			const [size, qualityPart] = (output ?? "").trim().split(",").map((value) => value.trim());
			return {
				ratio: ratioFromSize(size ?? ""),
				quality: qualityPart?.startsWith("quality=") ? qualityPart.slice(8) : "default"
			};
		}
		function ratioFromSize(size) {
			const dimensions = size.split("x").map(Number);
			if (dimensions.length === 2 && dimensions.every((value) => Number.isFinite(value) && value > 0)) {
				const target = dimensions[0] / dimensions[1];
				for (const ratio of [
					"1:1",
					"3:2",
					"2:3",
					"4:3",
					"3:4",
					"16:9",
					"9:16"
				]) {
					const [width, height] = ratio.split(":").map(Number);
					if (Math.abs(target - width / height) < .015) return ratio;
				}
			}
			return {
				"1024x1024": "1:1",
				"1536x1024": "3:2",
				"1024x1536": "2:3"
			}[size] ?? "1:1";
		}
		function sizeFromRatio(ratio) {
			return {
				"1:1": "1024x1024",
				"3:2": "1536x1024",
				"2:3": "1024x1536"
			}[ratio];
		}
		// lib/types/client/index.js
		/**
		* Mino image plugin, browser half: promoted generated-image Chat rows, keyed
		* Tool view cards for the image tools, and the bundle configuration card.
		* Copy comes through the `mino-image` locale namespace; image bytes arrive
		* through the owner-supplied authorized `loadImage` loader.
		*/
		/** Required browser services for the registrations and dictionaries. */
		const inject = [
			"slots",
			"locale",
			"uiConversation",
			"configForms"
		];
		const STYLE = `
.mino-ig-result{display:block;margin:8px 0;max-width:520px}
.mino-ig-result-title{font-size:12px;color:var(--dsw-alias-label-secondary,#64748b);margin-bottom:6px}
.mino-ig-savedto{font-size:11.5px;color:var(--dsw-alias-label-secondary,#64748b);margin-bottom:6px;word-break:break-all}
.mino-ig-container{position:relative;display:inline-block}
.mino-ig-image{display:block;max-width:100%;max-height:480px;border-radius:10px;border:1px solid var(--dsw-alias-border-l2,#e2e8f0);cursor:zoom-in}
.mino-ig-toolbar{display:flex;gap:6px;align-items:center;margin-top:8px}
.mino-ig-tool-btn{display:inline-flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:7px;border:1px solid var(--dsw-alias-border-l2,#e2e8f0);background:var(--dsw-alias-bg-layer-2,#fff);color:var(--dsw-alias-label-primary,#334155);cursor:pointer}
.mino-ig-tool-btn:hover{background:var(--dsw-alias-bg-hover,#f1f5f9)}
.mino-ig-tool-btn:disabled{opacity:.5;cursor:default}
.mino-ig-loading{padding:24px;text-align:center;color:var(--dsw-alias-label-secondary,#64748b);font-size:13px}
.mino-ig-error{padding:10px 12px;margin:6px 0;border-radius:8px;background:var(--dsw-alias-bg-danger,#fef2f2);color:var(--dsw-alias-label-danger,#b91c1c);font-size:12.5px}
.mino-ig-toast{position:absolute;left:50%;bottom:14px;transform:translateX(-50%);padding:6px 12px;border-radius:999px;background:rgba(15,23,42,.82);color:#fff;font-size:12px;white-space:nowrap}
.mino-ig-lightbox-backdrop{position:fixed;inset:0;z-index:1000;background:rgba(2,6,23,.72);display:flex;align-items:center;justify-content:center}
.mino-ig-lightbox-img{max-width:92vw;max-height:92vh;border-radius:8px}
.mino-ig-regenerate-backdrop{position:fixed;inset:0;z-index:1000;background:rgba(2,6,23,.45);display:flex;align-items:center;justify-content:center}
.mino-ig-regenerate-dialog{width:min(520px,92vw);background:var(--dsw-alias-bg-layer-1,#fff);border-radius:12px;padding:20px;box-shadow:0 18px 50px rgba(2,6,23,.25)}
.mino-ig-regenerate-dialog h3{margin:0 0 6px;font-size:15px}
.mino-ig-regenerate-dialog p{margin:0 0 12px;font-size:12.5px;color:var(--dsw-alias-label-secondary,#64748b)}
.mino-ig-regenerate-dialog label{display:block;font-size:12.5px;color:var(--dsw-alias-label-secondary,#64748b)}
.mino-ig-regenerate-dialog textarea{box-sizing:border-box;width:100%;min-height:96px;margin-top:6px;padding:10px;border:1px solid var(--dsw-alias-border-l2,#e2e8f0);border-radius:8px;font-size:13px;resize:vertical;font-family:inherit}
.mino-ig-regenerate-error{color:var(--dsw-alias-label-danger,#b91c1c)!important}
.mino-ig-regenerate-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:14px}
.mino-ig-regenerate-cancel,.mino-ig-regenerate-confirm{height:32px;padding:0 14px;border-radius:7px;font-size:13px;cursor:pointer}
.mino-ig-regenerate-cancel{border:1px solid var(--dsw-alias-border-l2,#e2e8f0);background:var(--dsw-alias-bg-layer-2,#fff);color:var(--dsw-alias-label-primary,#334155)}
.mino-ig-regenerate-confirm{border:none;background:var(--dsw-alias-bg-brand,#2563eb);color:#fff}
.mino-ig-regenerate-confirm:disabled{opacity:.55;cursor:default}
.mino-ig-regenerate-overlay{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;background:rgba(255,255,255,.66);border-radius:10px;backdrop-filter:blur(2px)}
.mino-ig-regenerate-spinner{width:26px;height:26px;border-radius:50%;border:3px solid rgba(37,99,235,.25);border-top-color:var(--dsw-alias-bg-brand,#2563eb);animation:mino-ig-spin .8s linear infinite}
@keyframes mino-ig-spin{to{transform:rotate(360deg)}}
.mino-ig-regenerate-overlay-text{font-size:12.5px;color:var(--dsw-alias-label-secondary,#475569)}
.mino-ig-regenerate-overlay-cancel{border:1px solid var(--dsw-alias-border-l2,#e2e8f0);background:#fff;border-radius:7px;padding:5px 12px;font-size:12px;cursor:pointer}
.mino-ig-version-nav{display:flex;align-items:center;gap:8px;margin-left:8px}
.mino-ig-version-nav button{width:26px;height:26px;border-radius:6px;border:1px solid var(--dsw-alias-border-l2,#e2e8f0);background:var(--dsw-alias-bg-layer-2,#fff);cursor:pointer;font-size:14px;line-height:1}
.mino-ig-version-nav button:disabled{opacity:.4;cursor:default}
.mino-ig-version-count{font-size:12px;color:var(--dsw-alias-label-secondary,#64748b)}
.mino-ig-settings{display:block;max-width:640px}
.mino-ig-settings h3{margin:0 0 4px;font-size:16px}
.mino-ig-settings .mino-ig-desc{margin:0 0 16px;font-size:12.5px;color:var(--dsw-alias-label-secondary,#64748b)}
.mino-ig-field{margin-bottom:14px}
.mino-ig-field label{display:block;font-size:13px;margin-bottom:5px}
.mino-ig-field input[type=text],.mino-ig-field input[type=number]{box-sizing:border-box;width:100%;height:34px;padding:0 10px;border:1px solid var(--dsw-alias-border-l2,#e2e8f0);border-radius:7px;font-size:13px;background:var(--dsw-alias-bg-layer-2,#fff);color:var(--dsw-alias-label-primary,#1e293b)}
.mino-ig-field .mino-ig-hint{margin-top:4px;font-size:11.5px;color:var(--dsw-alias-label-secondary,#94a3b8)}
.mino-ig-toggle{display:flex;align-items:center;gap:8px;font-size:13px}
.mino-ig-save-row{display:flex;align-items:center;gap:10px;margin-top:16px}
.mino-ig-save-btn{height:32px;padding:0 16px;border:none;border-radius:7px;background:var(--dsw-alias-bg-brand,#2563eb);color:#fff;font-size:13px;cursor:pointer}
.mino-ig-save-btn:disabled{opacity:.55;cursor:default}
.mino-ig-save-msg{font-size:12.5px;color:var(--dsw-alias-label-secondary,#64748b)}
.mino-ig-note{font-size:12.5px;color:var(--dsw-alias-label-secondary,#64748b)}
`;
		/** Mount the dictionaries, result row, tool cards, and the settings card. */
		function apply(ctx) {
			ctx.effect(() => {
				const style = document.createElement("style");
				style.dataset.plugin = "mino-image";
				style.textContent = STYLE;
				document.head.appendChild(style);
				return () => {
					style.remove();
				};
			}, "mino-image: styles");
			ctx.effect(() => ctx.locale.register(NS, {
				zh,
				en
			}), "mino-image: dictionaries");
			ctx.effect(() => ctx.uiConversation.events.register(createImageResultDefinition()), "mino-image: image result node");
			ctx.slots.inject("conversation.chat.node", () => ctx.slots.register({
				name: "conversation.chat.node",
				key: IMAGE_RESULT_NODE_KIND,
				locale: NS
			}, PromotedImageResultNode));
			for (const tool of ["generate_image", "edit_image"]) ctx.slots.inject("tool.call.toolview", () => ctx.slots.register({
				name: "tool.call.toolview",
				key: tool,
				locale: NS,
				inject: () => ({ promoted: true })
			}, GeneratedImageCard));
			ctx.slots.inject("tool.call.toolview", () => ctx.slots.register({
				name: "tool.call.toolview",
				key: "generate_images",
				locale: NS,
				inject: () => ({ promoted: true })
			}, GeneratedImagesCard));
			const form = ctx.configForms.get("mino-image");
			ctx.effect(() => ctx.configForms.whileServed(["mino-image"], () => ctx.slots.inject("plugins.bundle.config", () => ctx.slots.register({
				name: "plugins.bundle.config",
				key: "mino-image",
				locale: NS,
				inject: () => ({
					hooks: { form },
					setField: (field, value) => form.set(field, value),
					unsetField: (field) => form.unset(field)
				})
			}, MinoImageSettingsCard))), "mino-image: settings card");
		}
		function MinoImageSettingsCard(props) {
			const { t } = props;
			const snapshot = props.useForm((state) => state);
			const [draft, setDraft] = (0, react.useState)({});
			const [saving, setSaving] = (0, react.useState)(false);
			const [message, setMessage] = (0, react.useState)();
			(0, react.useEffect)(() => {
				setDraft(snapshot.value ?? {});
			}, [snapshot.value]);
			if (props.view !== "page") return null;
			if (snapshot.status !== "ready") return (0, react_jsx_runtime.jsx)("div", {
				className: "mino-ig-settings",
				children: (0, react_jsx_runtime.jsx)("p", {
					className: "mino-ig-note",
					children: t(snapshot.status === "loading" ? "settings.loading" : "settings.unavailable")
				})
			});
			const writable = snapshot.writable;
			const stringField = (key) => typeof draft[key] === "string" ? draft[key] : "";
			const set = (key, value) => setDraft((current) => ({
				...current,
				[key]: value
			}));
			const save = async () => {
				setSaving(true);
				setMessage(void 0);
				let ok = true;
				for (const [field, value] of Object.entries(draft)) if (value === "" || value === void 0) {
					if (!await props.unsetField(field)) ok = false;
				} else if (!await props.setField(field, value)) ok = false;
				setSaving(false);
				setMessage(t(ok ? "settings.saved" : "settings.writeRejected"));
			};
			return (0, react_jsx_runtime.jsxs)("section", {
				className: "mino-ig-settings",
				"aria-label": t("settings.title"),
				children: [
					(0, react_jsx_runtime.jsx)("h3", { children: t("settings.title") }),
					(0, react_jsx_runtime.jsx)("p", {
						className: "mino-ig-desc",
						children: t("settings.desc")
					}),
					!writable ? (0, react_jsx_runtime.jsx)("p", {
						className: "mino-ig-note",
						children: t("settings.readOnly")
					}) : null,
					(0, react_jsx_runtime.jsxs)("div", {
						className: "mino-ig-field",
						children: [
							(0, react_jsx_runtime.jsx)("label", {
								htmlFor: "mino-ig-model",
								children: t("settings.field.model")
							}),
							(0, react_jsx_runtime.jsx)("input", {
								id: "mino-ig-model",
								type: "text",
								value: stringField("model"),
								disabled: !writable,
								onChange: (e) => {
									set("model", e.target.value);
								}
							}),
							(0, react_jsx_runtime.jsx)("div", {
								className: "mino-ig-hint",
								children: t("settings.field.model.hint")
							})
						]
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						className: "mino-ig-field",
						children: [
							(0, react_jsx_runtime.jsx)("label", {
								htmlFor: "mino-ig-edit-model",
								children: t("settings.field.editModel")
							}),
							(0, react_jsx_runtime.jsx)("input", {
								id: "mino-ig-edit-model",
								type: "text",
								value: stringField("editModel"),
								disabled: !writable,
								onChange: (e) => {
									set("editModel", e.target.value);
								}
							}),
							(0, react_jsx_runtime.jsx)("div", {
								className: "mino-ig-hint",
								children: t("settings.field.editModel.hint")
							})
						]
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						className: "mino-ig-field",
						children: [(0, react_jsx_runtime.jsx)("label", {
							htmlFor: "mino-ig-size",
							children: t("settings.field.size")
						}), (0, react_jsx_runtime.jsx)("input", {
							id: "mino-ig-size",
							type: "text",
							value: stringField("size"),
							disabled: !writable,
							onChange: (e) => {
								set("size", e.target.value);
							}
						})]
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						className: "mino-ig-field",
						children: [
							(0, react_jsx_runtime.jsx)("label", {
								htmlFor: "mino-ig-quality",
								children: t("settings.field.quality")
							}),
							(0, react_jsx_runtime.jsx)("input", {
								id: "mino-ig-quality",
								type: "text",
								value: stringField("quality"),
								disabled: !writable,
								onChange: (e) => {
									set("quality", e.target.value);
								}
							}),
							(0, react_jsx_runtime.jsx)("div", {
								className: "mino-ig-hint",
								children: t("settings.field.quality.hint")
							})
						]
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						className: "mino-ig-field",
						children: [(0, react_jsx_runtime.jsx)("label", {
							htmlFor: "mino-ig-timeout",
							children: t("settings.field.timeout")
						}), (0, react_jsx_runtime.jsx)("input", {
							id: "mino-ig-timeout",
							type: "number",
							min: 5,
							max: 3600,
							value: Math.round((typeof draft.cloudTimeoutMs === "number" ? draft.cloudTimeoutMs : 12e4) / 1e3),
							disabled: !writable,
							onChange: (e) => {
								set("cloudTimeoutMs", Math.max(5, Number(e.target.value) || 120) * 1e3);
							}
						})]
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						className: "mino-ig-field mino-ig-toggle",
						children: [(0, react_jsx_runtime.jsx)("input", {
							id: "mino-ig-save-ws",
							type: "checkbox",
							checked: draft.saveToWorkspace !== false,
							disabled: !writable,
							onChange: (e) => {
								set("saveToWorkspace", e.target.checked);
							}
						}), (0, react_jsx_runtime.jsx)("label", {
							htmlFor: "mino-ig-save-ws",
							children: t("settings.field.saveToWorkspace")
						})]
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						className: "mino-ig-field",
						children: [(0, react_jsx_runtime.jsx)("label", {
							htmlFor: "mino-ig-folder",
							children: t("settings.field.workspaceFolder")
						}), (0, react_jsx_runtime.jsx)("input", {
							id: "mino-ig-folder",
							type: "text",
							value: stringField("workspaceFolder"),
							disabled: !writable,
							onChange: (e) => {
								set("workspaceFolder", e.target.value);
							}
						})]
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						className: "mino-ig-save-row",
						children: [(0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: "mino-ig-save-btn",
							disabled: !writable || saving,
							onClick: () => {
								save();
							},
							children: t(saving ? "settings.saving" : "settings.save")
						}), message ? (0, react_jsx_runtime.jsx)("span", {
							className: "mino-ig-save-msg",
							children: message
						}) : null]
					})
				]
			});
		}
		function GeneratedImageCard(props) {
			if (props.phase !== "result") return (0, react_jsx_runtime.jsx)(ImagePendingRow, { t: props.t });
			const result = imageResultFromBlock(props.block);
			if (props.promoted && result !== void 0) return (0, react_jsx_runtime.jsx)(PromotedResultNotice, { t: props.t });
			return (0, react_jsx_runtime.jsx)(ImageResultCard, {
				result,
				loadImage: props.loadImage,
				t: props.t
			});
		}
		/** Suppress the folded duplicate on hosts with the promoted node; render every image otherwise. */
		function GeneratedImagesCard(props) {
			if (props.phase !== "result") return (0, react_jsx_runtime.jsx)(ImagePendingRow, { t: props.t });
			const results = imageResultsFromMeta(props.block.meta);
			if (props.promoted && results.length > 0) return (0, react_jsx_runtime.jsx)(PromotedResultNotice, { t: props.t });
			if (results.length === 0) return (0, react_jsx_runtime.jsx)("div", { children: props.block.content.filter((item) => item.type === "text").map((item, index) => (0, react_jsx_runtime.jsx)("p", { children: item.type === "text" ? item.text : "" }, index)) });
			return (0, react_jsx_runtime.jsx)("div", {
				className: "mino-ig-promoted-results",
				children: results.map((result, index) => (0, react_jsx_runtime.jsx)(ImageResultCard, {
					result,
					loadImage: props.loadImage,
					t: props.t
				}, `${result.attachment.attachmentId}:${index}`))
			});
		}
		function ImagePendingRow({ t }) {
			return (0, react_jsx_runtime.jsx)("div", {
				className: "mino-ig-loading",
				children: t("card.generating")
			});
		}
		function PromotedResultNotice({ t }) {
			return (0, react_jsx_runtime.jsx)("div", {
				className: "mino-ig-loading",
				children: t("card.resultShown")
			});
		}
		/** Render image artifacts as final conversation output instead of Tool process content. */
		function PromotedImageResultNode(props) {
			return (0, react_jsx_runtime.jsx)("div", {
				className: "mino-ig-promoted-results",
				children: props.node.data.results.map((result, index) => (0, react_jsx_runtime.jsx)(ImageResultCard, {
					result,
					loadImage: props.loadImage,
					t: props.t
				}, `${result.attachment.attachmentId}:${index}`))
			});
		}
		function ImageResultCard({ result, loadImage, t }) {
			const attachment = result?.attachment;
			const originId = attachment?.attachmentId;
			const [revisionChain, setRevisionChain] = (0, react.useState)(() => loadConversationImageRevisionChain(String(originId ?? "")));
			const selectedRevision = revisionChain.revisions[revisionChain.currentIndex - 1];
			const activeAttachment = selectedRevision?.attachment ?? attachment;
			const activeResult = selectedRevision !== void 0 ? {
				prompt: selectedRevision.prompt,
				provider: selectedRevision.provider,
				model: selectedRevision.model,
				output: selectedRevision.output
			} : result;
			const savedTo = result?.savedTo;
			const [url, setUrl] = (0, react.useState)();
			const [blob, setBlob] = (0, react.useState)();
			const [error, setError] = (0, react.useState)();
			const [previewOpen, setPreviewOpen] = (0, react.useState)(false);
			const [toast, setToast] = (0, react.useState)();
			const [regenerateOpen, setRegenerateOpen] = (0, react.useState)(false);
			const [regeneratePrompt, setRegeneratePrompt] = (0, react.useState)("");
			const [regenerateError, setRegenerateError] = (0, react.useState)();
			const [isRegenerating, setIsRegenerating] = (0, react.useState)(false);
			const regenerateControllerRef = (0, react.useRef)();
			const regenerateTextareaRef = (0, react.useRef)(null);
			(0, react.useEffect)(() => {
				if (!originId) return;
				regenerateControllerRef.current?.abort();
				regenerateControllerRef.current = void 0;
				setIsRegenerating(false);
				setRegenerateOpen(false);
				setRevisionChain(loadConversationImageRevisionChain(String(originId)));
			}, [originId]);
			(0, react.useEffect)(() => () => {
				regenerateControllerRef.current?.abort();
			}, []);
			(0, react.useEffect)(() => {
				if (!regenerateOpen || isRegenerating) return;
				const frame = requestAnimationFrame(() => {
					regenerateTextareaRef.current?.focus();
					regenerateTextareaRef.current?.select();
				});
				const onKeyDown = (event) => {
					if (event.key === "Escape") setRegenerateOpen(false);
				};
				window.addEventListener("keydown", onKeyDown);
				return () => {
					cancelAnimationFrame(frame);
					window.removeEventListener("keydown", onKeyDown);
				};
			}, [regenerateOpen, isRegenerating]);
			(0, react.useEffect)(() => {
				if (!previewOpen) return;
				const onKeyDown = (e) => {
					if (e.key === "Escape") setPreviewOpen(false);
				};
				window.addEventListener("keydown", onKeyDown);
				return () => {
					window.removeEventListener("keydown", onKeyDown);
				};
			}, [previewOpen]);
			const currentUrlRef = (0, react.useRef)();
			(0, react.useEffect)(() => () => {
				if (currentUrlRef.current !== void 0) {
					URL.revokeObjectURL(currentUrlRef.current);
					currentUrlRef.current = void 0;
				}
			}, []);
			(0, react.useEffect)(() => {
				if (activeAttachment === void 0) return;
				let canceled = false;
				loadImage(activeAttachment).then(async (resUrl) => {
					if (canceled) return;
					setError(void 0);
					setUrl(resUrl);
					const fetched = await fetch(resUrl).then((res) => res.ok ? res.blob() : Promise.reject(/* @__PURE__ */ new Error(`HTTP ${String(res.status)}`))).catch(() => void 0);
					if (!canceled) setBlob(fetched);
				}).catch((cause) => {
					if (canceled) return;
					setError(cause instanceof Error ? cause.message : String(cause));
				});
				return () => {
					canceled = true;
				};
			}, [activeAttachment, loadImage]);
			const copy = async (e) => {
				e.stopPropagation();
				if (!blob) return;
				const ok = await copyImageBlob(blob);
				setToast(ok ? t("card.copiedImage") : t("card.copyFailed"));
				setTimeout(() => {
					setToast(void 0);
				}, 2e3);
			};
			const download = (e) => {
				e.stopPropagation();
				if (!url) return;
				const a = document.createElement("a");
				a.href = url;
				a.download = activeAttachment?.name || `mino-image-${Date.now()}.png`;
				document.body.appendChild(a);
				a.click();
				document.body.removeChild(a);
			};
			const openNewTab = (e) => {
				e.stopPropagation();
				if (!url) return;
				window.open(url, "_blank", "noopener,noreferrer");
			};
			const openRegenerate = (event) => {
				event.stopPropagation();
				if (activeResult === void 0 || isRegenerating) return;
				setRegeneratePrompt(activeResult.prompt);
				setRegenerateError(void 0);
				setRegenerateOpen(true);
			};
			const cancelRegenerate = () => {
				regenerateControllerRef.current?.abort();
				regenerateControllerRef.current = void 0;
				setIsRegenerating(false);
				setRegenerateOpen(false);
				setRegenerateError(void 0);
			};
			const regenerate = async () => {
				if (activeResult === void 0 || !originId || isRegenerating || regeneratePrompt.trim().length === 0) return;
				setIsRegenerating(true);
				setRegenerateError(void 0);
				setRegenerateOpen(false);
				const controller = new AbortController();
				regenerateControllerRef.current = controller;
				try {
					const request = conversationRegenerateRequest(activeResult, regeneratePrompt, selectedRevision === void 0 ? void 0 : {
						ratio: selectedRevision.ratio,
						quality: selectedRevision.quality
					});
					const response = await fetch(GENERATE_ROUTE, {
						method: "POST",
						credentials: "same-origin",
						signal: controller.signal,
						headers: { "content-type": "application/json" },
						body: JSON.stringify(request)
					});
					const payload = await response.json().catch(() => null);
					const generated = payload !== null && "attachment" in payload ? imageAttachment(payload.attachment) : void 0;
					if (!response.ok || payload === null || generated === void 0 || !("attachment" in payload)) throw new Error(payload && "error" in payload && payload.error ? payload.error : t("card.regenerateFailed"));
					const revision = {
						attachment: generated,
						prompt: payload.prompt,
						provider: "mino",
						model: payload.model,
						output: payload.output,
						createdAt: payload.createdAt,
						ratio: request.size !== void 0 ? ratioOf(request.size) : "1:1",
						quality: request.quality ?? "default"
					};
					const next = appendConversationImageRevision(String(originId), revision);
					setRevisionChain(next);
					setToast(t("card.regenerate"));
					setTimeout(() => {
						setToast(void 0);
					}, 2e3);
				} catch (cause) {
					if (!controller.signal.aborted) {
						const errMsg = cause instanceof Error ? cause.message : String(cause);
						setError(errMsg);
						setToast(errMsg);
						setTimeout(() => {
							setToast(void 0);
						}, 3500);
					}
				} finally {
					if (regenerateControllerRef.current === controller) {
						regenerateControllerRef.current = void 0;
						setIsRegenerating(false);
					}
				}
			};
			const selectVersion = (index) => {
				if (!originId || isRegenerating) return;
				setRevisionChain(selectConversationImageRevision(String(originId), index));
			};
			const canRegenerate = activeResult !== void 0 && activeResult.model.trim().length > 0;
			const versionTotal = revisionChain.revisions.length + 1;
			const versionCurrent = revisionChain.currentIndex + 1;
			if (attachment === void 0) return (0, react_jsx_runtime.jsx)("div", {
				className: "mino-ig-loading",
				children: t("card.generating")
			});
			return (0, react_jsx_runtime.jsxs)("section", {
				className: "mino-ig-result",
				"aria-label": t("card.generatedTitle"),
				children: [
					(0, react_jsx_runtime.jsx)("div", {
						className: "mino-ig-result-title",
						children: t("card.generatedTitle")
					}),
					savedTo !== void 0 ? (0, react_jsx_runtime.jsxs)("div", {
						className: "mino-ig-savedto",
						children: [
							t("card.savedToPath"),
							": ",
							savedTo
						]
					}) : null,
					error !== void 0 ? (0, react_jsx_runtime.jsx)("div", {
						className: "mino-ig-error",
						children: error
					}) : null,
					url === void 0 && error === void 0 ? (0, react_jsx_runtime.jsx)("div", {
						className: "mino-ig-loading",
						children: t("card.loading")
					}) : null,
					url !== void 0 ? (0, react_jsx_runtime.jsxs)("div", {
						className: "mino-ig-container",
						children: [
							(0, react_jsx_runtime.jsx)("img", {
								className: "mino-ig-image",
								src: url,
								alt: activeAttachment?.name ?? "Generated image",
								onClick: () => {
									if (!isRegenerating) setPreviewOpen(true);
								}
							}),
							isRegenerating ? (0, react_jsx_runtime.jsxs)("div", {
								className: "mino-ig-regenerate-overlay",
								children: [
									(0, react_jsx_runtime.jsx)("div", { className: "mino-ig-regenerate-spinner" }),
									(0, react_jsx_runtime.jsx)("span", {
										className: "mino-ig-regenerate-overlay-text",
										children: t("card.regenerating")
									}),
									(0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: "mino-ig-regenerate-overlay-cancel",
										onClick: cancelRegenerate,
										children: t("card.cancel")
									})
								]
							}) : null,
							(0, react_jsx_runtime.jsxs)("div", {
								className: "mino-ig-toolbar",
								children: [
									canRegenerate ? (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: "mino-ig-tool-btn",
										disabled: isRegenerating,
										title: isRegenerating ? t("card.regenerating") : t("card.regenerate"),
										onClick: openRegenerate,
										children: (0, react_jsx_runtime.jsxs)("svg", {
											width: "15",
											height: "15",
											viewBox: "0 0 24 24",
											fill: "none",
											stroke: "currentColor",
											strokeWidth: "2",
											strokeLinecap: "round",
											strokeLinejoin: "round",
											children: [(0, react_jsx_runtime.jsx)("path", { d: "M20 11a8.1 8.1 0 0 0-15.5-2M4 4v5h5" }), (0, react_jsx_runtime.jsx)("path", { d: "M4 13a8.1 8.1 0 0 0 15.5 2M20 20v-5h-5" })]
										})
									}) : null,
									(0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: "mino-ig-tool-btn",
										title: t("card.copyImg"),
										onClick: (e) => {
											copy(e);
										},
										children: (0, react_jsx_runtime.jsxs)("svg", {
											width: "15",
											height: "15",
											viewBox: "0 0 24 24",
											fill: "none",
											stroke: "currentColor",
											strokeWidth: "2",
											strokeLinecap: "round",
											strokeLinejoin: "round",
											children: [(0, react_jsx_runtime.jsx)("rect", {
												x: "9",
												y: "9",
												width: "13",
												height: "13",
												rx: "2",
												ry: "2"
											}), (0, react_jsx_runtime.jsx)("path", { d: "M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" })]
										})
									}),
									(0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: "mino-ig-tool-btn",
										title: t("card.download"),
										onClick: download,
										children: (0, react_jsx_runtime.jsxs)("svg", {
											width: "15",
											height: "15",
											viewBox: "0 0 24 24",
											fill: "none",
											stroke: "currentColor",
											strokeWidth: "2",
											strokeLinecap: "round",
											strokeLinejoin: "round",
											children: [
												(0, react_jsx_runtime.jsx)("path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" }),
												(0, react_jsx_runtime.jsx)("polyline", { points: "7 10 12 15 17 10" }),
												(0, react_jsx_runtime.jsx)("line", {
													x1: "12",
													y1: "15",
													x2: "12",
													y2: "3"
												})
											]
										})
									}),
									(0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: "mino-ig-tool-btn",
										title: t("card.openNewTab"),
										onClick: openNewTab,
										children: (0, react_jsx_runtime.jsxs)("svg", {
											width: "15",
											height: "15",
											viewBox: "0 0 24 24",
											fill: "none",
											stroke: "currentColor",
											strokeWidth: "2",
											strokeLinecap: "round",
											strokeLinejoin: "round",
											children: [
												(0, react_jsx_runtime.jsx)("path", { d: "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" }),
												(0, react_jsx_runtime.jsx)("polyline", { points: "15 3 21 3 21 9" }),
												(0, react_jsx_runtime.jsx)("line", {
													x1: "10",
													y1: "14",
													x2: "21",
													y2: "3"
												})
											]
										})
									}),
									toast ? (0, react_jsx_runtime.jsx)("div", {
										className: "mino-ig-toast",
										children: toast
									}) : null
								]
							}),
							versionTotal > 1 ? (0, react_jsx_runtime.jsxs)("div", {
								className: "mino-ig-version-nav",
								"aria-label": t("card.versionLabel", {
									current: String(versionCurrent),
									total: String(versionTotal)
								}),
								children: [
									(0, react_jsx_runtime.jsx)("button", {
										type: "button",
										title: t("card.versionPrevious"),
										disabled: revisionChain.currentIndex === 0 || isRegenerating,
										onClick: (event) => {
											event.stopPropagation();
											selectVersion(revisionChain.currentIndex - 1);
										},
										children: "‹"
									}),
									(0, react_jsx_runtime.jsxs)("span", {
										className: "mino-ig-version-count",
										children: [
											versionCurrent,
											"/",
											versionTotal
										]
									}),
									(0, react_jsx_runtime.jsx)("button", {
										type: "button",
										title: t("card.versionNext"),
										disabled: revisionChain.currentIndex >= revisionChain.revisions.length || isRegenerating,
										onClick: (event) => {
											event.stopPropagation();
											selectVersion(revisionChain.currentIndex + 1);
										},
										children: "›"
									})
								]
							}) : null
						]
					}) : null,
					previewOpen && url !== void 0 ? (0, react_jsx_runtime.jsx)("div", {
						className: "mino-ig-lightbox-backdrop",
						onClick: () => {
							setPreviewOpen(false);
						},
						children: (0, react_jsx_runtime.jsx)("div", {
							onClick: (e) => {
								e.stopPropagation();
							},
							children: (0, react_jsx_runtime.jsx)("img", {
								className: "mino-ig-lightbox-img",
								src: url,
								alt: activeAttachment?.name ?? "Generated image preview"
							})
						})
					}) : null,
					regenerateOpen && activeResult !== void 0 ? (0, react_jsx_runtime.jsx)("div", {
						className: "mino-ig-regenerate-backdrop",
						onMouseDown: (event) => {
							if (event.target === event.currentTarget && !isRegenerating) setRegenerateOpen(false);
						},
						children: (0, react_jsx_runtime.jsxs)("div", {
							className: "mino-ig-regenerate-dialog",
							role: "dialog",
							"aria-modal": "true",
							"aria-labelledby": `mino-ig-regenerate-${String(originId)}`,
							children: [
								(0, react_jsx_runtime.jsx)("h3", {
									id: `mino-ig-regenerate-${String(originId)}`,
									children: t("card.regenerateTitle")
								}),
								(0, react_jsx_runtime.jsx)("p", { children: t("card.regenerateHint") }),
								(0, react_jsx_runtime.jsxs)("label", { children: [(0, react_jsx_runtime.jsx)("span", { children: t("card.promptLabel") }), (0, react_jsx_runtime.jsx)("textarea", {
									ref: regenerateTextareaRef,
									value: regeneratePrompt,
									disabled: isRegenerating,
									onChange: (event) => setRegeneratePrompt(event.target.value),
									onKeyDown: (event) => {
										if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
											event.preventDefault();
											regenerate();
										}
									}
								})] }),
								regenerateError ? (0, react_jsx_runtime.jsx)("p", {
									className: "mino-ig-regenerate-error",
									role: "alert",
									children: regenerateError
								}) : null,
								(0, react_jsx_runtime.jsxs)("div", {
									className: "mino-ig-regenerate-actions",
									children: [(0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: "mino-ig-regenerate-cancel",
										onClick: cancelRegenerate,
										children: t("card.cancel")
									}), (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: "mino-ig-regenerate-confirm",
										disabled: isRegenerating || regeneratePrompt.trim().length === 0,
										onClick: () => {
											regenerate();
										},
										children: t("card.confirmRegenerate")
									})]
								})
							]
						})
					}) : null
				]
			});
		}
		function ratioOf(size) {
			return {
				"1024x1024": "1:1",
				"1536x1024": "3:2",
				"1024x1536": "2:3"
			}[size] ?? "1:1";
		}
		/** Copy a Blob to the clipboard as PNG where the platform allows it. */
		async function copyImageBlob(blob) {
			try {
				let target = blob;
				if (blob.type !== "image/png" && typeof createImageBitmap === "function") {
					const bitmap = await createImageBitmap(blob);
					const canvas = document.createElement("canvas");
					canvas.width = bitmap.width;
					canvas.height = bitmap.height;
					const context = canvas.getContext("2d");
					if (context !== null) {
						context.drawImage(bitmap, 0, 0);
						target = await new Promise((resolve, reject) => {
							canvas.toBlob((result) => result === null ? reject(/* @__PURE__ */ new Error("png encode failed")) : resolve(result), "image/png");
						});
					}
					bitmap.close();
				}
				await navigator.clipboard.write([new ClipboardItem({ "image/png": target })]);
				return true;
			} catch {
				return false;
			}
		}
		/** Parse one presentation record off a settled Tool block's durable meta. */
		function imageResultFromBlock(block) {
			const meta = imageResultFromMeta(block.meta);
			const sourceIds = sourceAttachmentIdsOf(block);
			const fallbackAttachment = block.content.find((item) => item.type === "image" && "attachment" in item);
			const attachment = meta?.attachment ?? (fallbackAttachment?.type === "image" ? fallbackAttachment.attachment : void 0);
			if (attachment === void 0) return void 0;
			const prompt = block.args.value("prompt");
			return {
				attachment,
				prompt: meta?.prompt ?? (typeof prompt === "string" ? prompt : "Generated Image"),
				provider: meta?.provider ?? "mino",
				model: meta?.model ?? "",
				output: meta?.output ?? "",
				...meta?.savedTo === void 0 ? {} : { savedTo: meta.savedTo },
				...sourceIds === void 0 ? {} : { sourceAttachmentIds: sourceIds }
			};
		}
		/** Read edit_image's source attachment selectors off the recorded call arguments. */
		function sourceAttachmentIdsOf(block) {
			const single = block.args.value("source_attachment_id");
			const list = block.args.value("source_attachment_ids");
			const ids = typeof single === "string" ? [single] : Array.isArray(list) ? list.filter((id) => typeof id === "string") : void 0;
			return ids !== void 0 && ids.length > 0 ? ids : void 0;
		}
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map