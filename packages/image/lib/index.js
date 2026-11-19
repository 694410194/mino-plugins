import { createRequire } from "node:module";
import { Context, Service } from "@deepseek-ai/cordis";
import z from "@deepseek-ai/schemastery";
import { lstat, mkdir, readFile, realpath, rename, stat, unlink, writeFile } from "node:fs/promises";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { randomUUID } from "node:crypto";
// ../../node_modules/.pnpm/@deepseek-ai+dsh-typert-pro_83ecea34506529f5d0ffcb8181b92999/node_modules/@deepseek-ai/dsh-typert-protocol/lib/index.js
/** The one Remote failure class shared by owners, the Gateway, and consumers. */
/**
* One Remote call failure: a real Error carrying its stable code and typed
* details. Owners throw it at the failure point; the Host Gateway encodes it
* onto the wire unchanged; the Client face rebuilds an instance for the
* `RemoteResult` error branch, so `throw result.error` keeps throw semantics.
* Discrimination is always by `code`, never by instanceof.
*/
var RemoteError = class extends Error {
	code;
	details;
	/** Structural marker: cross-realm/bundle identification never uses instanceof. */
	isDSHRemoteError = true;
	/**
	* @param code - stable failure code declared in {@link RemoteErrorDetailsMap}.
	* @param message - human diagnostic carried across the wire.
	* @param details - structured payload typed by the code.
	* @param options - standard Error options (`cause` survives in-process only).
	*/
	constructor(code, message, details, options) {
		super(message, options);
		this.code = code;
		this.details = details;
		this.name = "RemoteError";
	}
};
/**
* Remote decorators and explicit Gateway bindings backed by versioned
* descriptors carried on decorated class prototypes. Strict reflection
* remains a Typert compiler responsibility.
* @module @deepseek-ai/dsh-typert-protocol
*/
const TYPERT_REMOTE_SEGMENT_PATTERN = /^[A-Za-z0-9_$.-]+$/;
/**
* Test one generated Remote name against the Connection endpoint grammar.
* @param value - namespace, method, lookup, or Context segment.
* @returns whether the value can cross the shared RPC carrier unchanged.
*/
function isTypertRemoteSegment(value) {
	return value !== "." && value !== ".." && TYPERT_REMOTE_SEGMENT_PATTERN.test(value);
}
const REMOTE_METHOD_DESCRIPTOR = "@deepseek-ai/dsh-typert-protocol/remote-methods";
/**
* Bind one visible Service field to a Cordis key and Remote namespace. A
* service that owns a Cordis Context also gives its tree `ctx.invocation`,
* `undefined` outside a Remote call, so no `TypertRemoteService` is needed for
* a Host composition to read it.
* @param service - owning Service instance, normally `this`.
* @param serviceKey - exact Cordis service key.
* @param options - optional wire namespace.
* @returns a frozen, inspectable binding with no compiler-injected metadata.
*/
function bindTypertRemote(service, serviceKey, options = {}) {
	validateName("service key", serviceKey);
	const namespace = options.namespace ?? serviceKey;
	validateName("namespace", namespace);
	const ctx = Reflect.get(service, "ctx");
	if (Context.is(ctx)) provideInvocationAccessor(ctx);
	return Object.freeze({
		service,
		serviceKey,
		namespace
	});
}
/** Cordis Service base that exposes its registered name through Typert Gateway. */
var TypertRemoteService = class extends Service {
	/** Visible binding consumed by the Gateway's source-mode discovery. */
	typertRemote;
	/**
	* Register the Service and bind the same key to Typert Gateway.
	* @param ctx - owning Cordis Context.
	* @param serviceKey - exact Cordis service key and default wire namespace.
	* @param options - optional wire namespace.
	*/
	constructor(ctx, serviceKey, options = {}) {
		super(ctx, serviceKey);
		this.typertRemote = bindTypertRemote(this, this.name, options);
	}
};
/**
* Make `ctx.invocation` read as `undefined` outside a Remote call instead of the
* reflect service's "cannot get property" error; a call-derived Context shadows
* the accessor with its own property. The first Remote Service constructed in a
* tree registers it on the root, where it outlives any one Service.
*/
function provideInvocationAccessor(ctx) {
	if (Object.hasOwn(ctx.root.reflect.props, "invocation")) return;
	ctx.root.accessor("invocation", { get: () => void 0 });
}
function Remote(methodExportOrOptions, context) {
	if (typeof methodExportOrOptions === "string") {
		validateName("Remote export name", methodExportOrOptions);
		return remoteDecorator({ kind: "direct" }, { exportName: methodExportOrOptions });
	}
	if (typeof methodExportOrOptions === "object") return remoteDecorator({ kind: "direct" }, markerOptions(methodExportOrOptions, REMOTE_OPTION_KEYS, "Remote options require name, mode: \"stream\", or resources"));
	if (context === void 0) throw new TypeError("typert-protocol: Remote decorator context is missing");
	addMarkerInitializer(context, { kind: "direct" });
}
const REMOTE_OPTION_KEYS = /* @__PURE__ */ new Set([
	"name",
	"mode",
	"resources"
]);
/** Validate one decorator options object against its accepted keys and select the marker fields. */
function markerOptions(options, accepted, requirement) {
	const keys = Reflect.ownKeys(options);
	if (keys.length === 0 || keys.some((key) => typeof key !== "string" || !accepted.has(key)) || Object.hasOwn(options, "mode") && options.mode !== "stream") throw new TypeError(`typert-protocol: ${requirement}`);
	const { mode, name, resources } = options;
	if (name !== void 0) validateName("Remote export name", name);
	return {
		...mode === void 0 ? {} : { mode },
		...name === void 0 ? {} : { exportName: name },
		...resources === void 0 ? {} : { resources: resourceReaders(resources) }
	};
}
/** Freeze declared readers into the marker record; a misdeclared reader fails at decoration. */
function resourceReaders(resources) {
	const readers = {};
	for (const [kind, reader] of Object.entries(resources)) {
		if (typeof reader !== "function") throw new TypeError(`typert-protocol: Remote resource reader "${kind}" must be a function`);
		readers[kind] = reader;
	}
	if (Object.keys(readers).length === 0) throw new TypeError("typert-protocol: Remote resources require at least one reader");
	return Object.freeze(readers);
}
function remoteDecorator(invocation, options = {}) {
	return function(_method, context) {
		addMarkerInitializer(context, invocation, options);
	};
}
function readRemoteMethodDescriptor(prototype) {
	const property = Object.getOwnPropertyDescriptor(prototype, REMOTE_METHOD_DESCRIPTOR);
	if (property === void 0) return void 0;
	const descriptor = property.value;
	if (descriptor === null || typeof descriptor !== "object") throw new TypeError("typert-protocol: Remote method descriptor must be an object");
	const version = Reflect.get(descriptor, "version");
	if (version !== 1) throw new TypeError(`typert-protocol: unsupported Remote method descriptor version ${String(version)}`);
	const methods = Reflect.get(descriptor, "methods");
	if (!Array.isArray(methods)) throw new TypeError("typert-protocol: Remote method descriptor methods must be an array");
	return descriptor;
}
function addMarkerInitializer(context, invocation, options = {}) {
	if (context.private || context.static || typeof context.name !== "string") throw new TypeError("typert-protocol: Remote decorators require a public instance method with a string name");
	const method = context.name;
	context.addInitializer(function() {
		const prototype = Object.getPrototypeOf(this);
		if (prototype === null) throw new TypeError(`typert-protocol: cannot mark Remote method "${method}" on an object without a prototype`);
		mark(prototype, method, invocation, options);
	});
}
function mark(prototype, method, invocation, { mode, exportName, resources }) {
	const descriptor = readRemoteMethodDescriptor(prototype);
	const marker = Object.freeze({
		method,
		...exportName === void 0 || exportName === method ? {} : { exportName },
		...mode === void 0 ? {} : { mode },
		invocation: Object.freeze(invocation),
		...resources === void 0 ? {} : { resources }
	});
	const current = descriptor?.methods.find((candidate) => candidate.method === method);
	if (current !== void 0) {
		if (current.exportName === marker.exportName && current.mode === marker.mode && current.resources === marker.resources && sameInvocation(current.invocation, invocation)) return;
		throw new Error(`typert-protocol: Remote method "${method}" has conflicting invocation markers`);
	}
	Object.defineProperty(prototype, REMOTE_METHOD_DESCRIPTOR, {
		configurable: true,
		value: Object.freeze({
			version: 1,
			methods: Object.freeze([...descriptor?.methods ?? [], marker])
		})
	});
}
function sameInvocation(left, right) {
	if (left.kind === "direct") return right.kind === "direct";
	if (right.kind === "direct") return false;
	return left.context === right.context;
}
function validateName(subject, value) {
	if (!isTypertRemoteSegment(value)) throw new TypeError(`typert-protocol: ${subject} must contain only RPC endpoint segment characters`);
}
// ../../node_modules/.pnpm/@deepseek-ai+dsh-util-value_d7aa40583522f82030131675afc92626/node_modules/@deepseek-ai/dsh-util-values/lib/index.js
/**
* Lazily scanned view of one JSON object's top-level fields, built from text
* that may still be streaming or from an already parsed object. Nothing is
* scanned until a reader asks; the view remembers every question it answered
* and reports changed answers when the owner refreshes for publication.
* Used for model tool-call arguments: a row reads the fields it
* cares about at whatever granularity it displays, at every stage of the call.
* @module @deepseek-ai/dsh-util-values/src/partial-json
*/
const SIMPLE_ESCAPES = {
	"\"": "\"",
	"\\": "\\",
	"/": "/",
	b: "\b",
	f: "\f",
	n: "\n",
	r: "\r",
	t: "	"
};
const CONTENT_ESCAPE = /[\\\u0000-\u001f]/u;
function isWhitespace(c) {
	return c === " " || c === "\n" || c === "\r" || c === "	";
}
function isHex(c) {
	return c >= "0" && c <= "9" || c >= "a" && c <= "f" || c >= "A" && c <= "F";
}
(class PartialArguments {
	/** The view of a call with no arguments available. */
	static EMPTY = PartialArguments.fromObject({});
	/**
	* View finished argument text without scanning it until a reader asks.
	* @param text - the complete argument JSON text.
	* @returns a sealed view.
	*/
	static fromText(text) {
		const view = new PartialArguments();
		view.append(text);
		view.sealed = true;
		return view;
	}
	/**
	* View an already parsed argument payload, such as a PTC dispatch object.
	* @param value - the parsed argument value.
	* @returns a sealed view; a non-object payload has no fields.
	*/
	static fromObject(value) {
		const view = new PartialArguments();
		view.object = typeof value === "object" && value !== null && !Array.isArray(value) ? value : {};
		view.sealed = true;
		return view;
	}
	/**
	* The source: text so far or a parsed object, plus whether it can still grow.
	* These are the only enumerable fields, so two views over the same source
	* compare equal structurally however far each has been read.
	*/
	chunks = [];
	object;
	sealed = false;
	#ends = [];
	#size = 0;
	#consumed = 0;
	#mode = "root";
	#escape = false;
	#keyStart = 0;
	#keyEscaped = false;
	#key = "";
	#current = null;
	#nestedEnds = [];
	#nestedInString = false;
	#invalidAt;
	#invalidValue = false;
	#entries = /* @__PURE__ */ new Map();
	#order = [];
	#reads = /* @__PURE__ */ new Map();
	/** Whether this view rejects further appends; does not scan text or register reads. */
	get isSealed() {
		return this.sealed;
	}
	/** Whether indexing or a content read found invalid JSON; unread value contents are not validated. */
	get invalid() {
		this.scan();
		return this.#mode === "invalid" || this.#invalidValue;
	}
	/**
	* Retain streamed argument text without scanning or comparing observed answers.
	* @param fragment - the text following every fragment appended before.
	*/
	append(fragment) {
		if (this.sealed) throw new Error("PartialArguments: cannot append to a sealed view");
		if (fragment.length === 0) return;
		this.chunks.push(fragment);
		this.#size += fragment.length;
		this.#ends.push(this.#size);
	}
	/**
	* Reconcile a streamed prefix with authoritative complete text without joining the fragments.
	* @param text - the final argument text, which replaces missing or conflicting deltas.
	* @returns this view sealed with its caches retained when every character matches; otherwise a new sealed view.
	*/
	settle(text) {
		if (this.object !== void 0 || text.length !== this.#size) return PartialArguments.fromText(text);
		let offset = 0;
		for (const chunk of this.chunks) {
			if (!text.startsWith(chunk, offset)) return PartialArguments.fromText(text);
			offset += chunk.length;
		}
		this.chunks = text.length === 0 ? [] : [text];
		this.#ends = text.length === 0 ? [] : [text.length];
		this.sealed = true;
		return this;
	}
	/**
	* Compare observed answers and advance their publication baseline. Unread views remain unscanned.
	* @returns whether any observed answer changed since its first read or the preceding refresh.
	*/
	refresh() {
		if (this.#reads.size === 0) return false;
		this.scan();
		let changed = false;
		let completions = false;
		for (const read of this.#reads.values()) {
			if (read.completion) {
				completions = true;
				continue;
			}
			changed = this.refreshRead(read) || changed;
		}
		if (completions) {
			for (const read of this.#reads.values()) if (read.completion) changed = this.refreshRead(read) || changed;
		}
		if (this.sealed) this.#reads.clear();
		return changed;
	}
	refreshRead(read) {
		const now = read.answer();
		if (Object.is(now, read.last)) return false;
		read.last = now;
		return true;
	}
	/**
	* Check whether no further fields can arrive.
	* @returns whether the outer object closed, indexing failed, or the view is sealed; unread values are not validated.
	*/
	closed() {
		return this.remember("closed", "", () => this.closedNow());
	}
	/**
	* List discovered fields in first-appearance order.
	* @returns top-level keys seen so far, in first-appearance order.
	*/
	keys() {
		return this.remember("keys", "", () => this.keysNow(), (keys) => keys.length);
	}
	/**
	* Check whether a top-level field has appeared.
	* @param key - argument name.
	* @returns whether the field has appeared (a string opened or another value began).
	*/
	has(key) {
		return this.remember("has", key, () => this.hasNow(key));
	}
	/**
	* Check whether a field's closing delimiter has arrived, without validating its contents.
	* @param key - argument name.
	* @returns whether its delimiter arrived and no content reader has reported an error for this value.
	*/
	complete(key) {
		return this.remember("complete", key, () => this.completeNow(key));
	}
	/**
	* Read string length without materializing its text.
	* @param key - argument name.
	* @param options - change granularity for a streaming string.
	* @returns decoded UTF-16 length of the string field so far; undefined when absent or not a string.
	*/
	stringLength(key, options) {
		const step = Math.max(1, Math.floor(options?.step ?? 1));
		const offset = options?.offset ?? 0;
		return this.remember(`length:${step}:${offset}`, key, () => this.lengthNow(key), (length) => length === void 0 ? void 0 : Math.ceil((length + offset) / step));
	}
	/**
	* Check a string against a decoded UTF-16 length limit without materializing it.
	* @param key - argument name.
	* @param maxLength - decoded UTF-16 limit, floored to at least zero.
	* @returns whether the string is longer than the limit; false when absent or not a string.
	*/
	stringExceeds(key, maxLength) {
		const limit = Math.max(0, Math.floor(maxLength));
		return this.remember(`exceeds:${limit}`, key, () => (this.lengthNow(key, limit + 1) ?? 0) > limit);
	}
	/**
	* Read a decoded string, including a streaming prefix.
	* @param key - argument name.
	* @returns the string field's decoded text so far; undefined when absent or not a string.
	*/
	text(key) {
		return this.remember("text", key, () => this.textNow(key));
	}
	/**
	* Read at most the first decoded UTF-16 units of a string.
	* @param key - argument name.
	* @param maxLength - maximum decoded UTF-16 length, floored to at least one.
	* @returns the bounded string prefix; undefined when absent or not a string.
	*/
	textPrefix(key, maxLength) {
		const limit = Math.max(1, Math.floor(maxLength));
		return this.remember(`prefix:${limit}`, key, () => this.textPrefixNow(key, limit));
	}
	/**
	* Read a completed non-string argument.
	* @param key - argument name.
	* @returns the parsed non-string value once it closed; undefined while open, absent, or a string.
	*/
	value(key) {
		return this.remember("value", key, () => this.valueNow(key));
	}
	/** Answer a question and, on a streaming view, remember it for change detection. */
	remember(kind, key, read, comparison) {
		this.scan();
		const result = read();
		if (!this.sealed) {
			const id = `${kind}/${key}`;
			if (!this.#reads.has(id)) this.#reads.set(id, {
				completion: kind === "complete",
				answer: comparison === void 0 ? read : () => comparison(read()),
				last: comparison === void 0 ? result : comparison(result)
			});
		}
		return result;
	}
	closedNow() {
		return this.sealed || this.#mode === "closed" || this.#mode === "invalid";
	}
	keysNow() {
		return this.object === void 0 ? this.#order : Object.keys(this.object);
	}
	hasNow(key) {
		return this.object === void 0 ? this.#entries.has(key) : Object.hasOwn(this.object, key);
	}
	completeNow(key) {
		if (this.object !== void 0) return Object.hasOwn(this.object, key);
		const entry = this.#entries.get(key);
		return entry !== void 0 && entry.end >= 0 && (entry.kind === "string" ? entry.invalidAt === void 0 : !entry.invalid);
	}
	lengthNow(key, limit = Number.POSITIVE_INFINITY) {
		if (this.object !== void 0) {
			const field = Object.hasOwn(this.object, key) ? this.object[key] : void 0;
			return typeof field === "string" ? field.length : void 0;
		}
		const entry = this.#entries.get(key);
		if (entry?.kind !== "string") return void 0;
		if (entry.text !== void 0 && entry.text.at === entry.end) return entry.text.length;
		const read = entry.length ??= {
			at: entry.start,
			length: 0,
			text: ""
		};
		this.readString(entry, read, limit, false);
		return read.length;
	}
	textNow(key) {
		if (this.object !== void 0) {
			const field = Object.hasOwn(this.object, key) ? this.object[key] : void 0;
			return typeof field === "string" ? field : void 0;
		}
		const entry = this.#entries.get(key);
		if (entry?.kind !== "string") return void 0;
		if (entry.text === void 0 && entry.end >= 0 && entry.needsDecoding && entry.invalidAt === void 0) {
			let text;
			try {
				text = JSON.parse(`"${this.slice(entry.start, entry.end)}"`);
			} catch (_error) {}
			if (text !== void 0) entry.text = {
				at: entry.end,
				length: text.length,
				text
			};
		}
		const read = entry.text ??= {
			at: entry.start,
			length: 0,
			text: ""
		};
		this.readString(entry, read, Number.POSITIVE_INFINITY, true);
		return read.text;
	}
	textPrefixNow(key, maxLength) {
		if (this.object !== void 0) {
			const field = Object.hasOwn(this.object, key) ? this.object[key] : void 0;
			return typeof field === "string" ? field.slice(0, maxLength) : void 0;
		}
		const entry = this.#entries.get(key);
		if (entry?.kind !== "string") return void 0;
		const prefixes = entry.prefixes ??= /* @__PURE__ */ new Map();
		let read = prefixes.get(maxLength);
		if (read === void 0) {
			read = {
				at: entry.start,
				length: 0,
				text: ""
			};
			prefixes.set(maxLength, read);
		}
		this.readString(entry, read, maxLength, true);
		return read.text;
	}
	valueNow(key) {
		if (this.object !== void 0) {
			if (!Object.hasOwn(this.object, key)) return void 0;
			const field = this.object[key];
			return typeof field === "string" ? void 0 : field;
		}
		const entry = this.#entries.get(key);
		if (entry?.kind !== "value" || entry.end < 0 || entry.invalid) return void 0;
		if (entry.parsed === void 0) try {
			entry.parsed = JSON.parse(this.slice(entry.start, entry.end));
		} catch (_error) {
			entry.invalid = true;
			this.#invalidValue = true;
		}
		return entry.parsed;
	}
	chunkAt(at) {
		let low = 0;
		let high = this.#ends.length;
		while (low < high) {
			const mid = low + high >>> 1;
			if (this.#ends[mid] <= at) low = mid + 1;
			else high = mid;
		}
		return low;
	}
	/** Materialize only a requested range, never the cumulative source. */
	slice(start, end) {
		if (start >= end) return "";
		const first = this.chunkAt(start);
		const last = this.chunkAt(end - 1);
		const base = first === 0 ? 0 : this.#ends[first - 1];
		if (first === last) return this.chunks[first].slice(start - base, end - base);
		const parts = [this.chunks[first].slice(start - base)];
		for (let i = first + 1; i < last; i++) parts.push(this.chunks[i]);
		parts.push(this.chunks[last].slice(0, end - this.#ends[last - 1]));
		return parts.join("");
	}
	readString(entry, read, limit, materialize) {
		const end = Math.min(entry.end < 0 ? this.#consumed : entry.end, entry.invalidAt ?? Number.POSITIVE_INFINITY, this.#invalidAt ?? Number.POSITIVE_INFINITY);
		if (!entry.needsDecoding) {
			const length = Math.min(end - read.at, limit - read.length);
			if (length <= 0) return;
			if (materialize) read.text += this.slice(read.at, read.at + length);
			read.at += length;
			read.length += length;
			return;
		}
		let chunkIndex = this.chunkAt(read.at);
		while (read.at < end && read.length < limit) {
			const base = chunkIndex === 0 ? 0 : this.#ends[chunkIndex - 1];
			const chunk = this.chunks[chunkIndex];
			const remaining = chunk.slice(read.at - base, Math.min(chunk.length, end - base));
			const boundary = remaining.search(CONTENT_ESCAPE);
			const length = Math.min(boundary < 0 ? remaining.length : boundary, limit - read.length);
			if (length > 0) {
				if (materialize) read.text += remaining.slice(0, length);
				read.at += length;
				read.length += length;
				if (read.at === base + chunk.length) chunkIndex++;
				continue;
			}
			const type = remaining.length > 1 ? remaining[1] : read.at + 1 < end ? this.chunks[chunkIndex + 1][0] : void 0;
			let decoded;
			let width = 2;
			if (remaining[0] === "\\" && type === void 0 && entry.end < 0) return;
			if (remaining[0] === "\\" && type === "u") {
				const hex = this.slice(read.at + 2, Math.min(end, read.at + 6));
				let valid = true;
				for (let i = 0; i < hex.length; i++) if (!isHex(hex[i])) valid = false;
				if (valid) {
					if (hex.length < 4 && entry.end < 0) return;
					if (hex.length === 4) decoded = String.fromCharCode(Number.parseInt(hex, 16));
				}
				width = 6;
			} else if (remaining[0] === "\\" && type !== void 0) decoded = SIMPLE_ESCAPES[type];
			if (decoded === void 0) {
				entry.invalidAt = read.at;
				this.#invalidValue = true;
				return;
			}
			if (materialize) read.text += decoded;
			read.length++;
			read.at += width;
			while (chunkIndex < this.chunks.length && read.at >= this.#ends[chunkIndex]) chunkIndex++;
		}
	}
	/** Locate new field ranges without decoding or parsing their contents. */
	scan() {
		if (this.object !== void 0 || this.#consumed === this.#size) return;
		for (let i = this.chunkAt(this.#consumed); i < this.chunks.length && this.#invalidAt === void 0; i++) {
			const pending = this.chunks[i];
			const base = i === 0 ? 0 : this.#ends[i - 1];
			for (let index = this.#consumed - base; index < pending.length && this.#mode !== "invalid"; index++) {
				if (this.#mode === "string" || this.#mode === "nested" && this.#nestedInString) {
					const end = this.stringBoundary(pending, index);
					this.#consumed += end - index;
					index = end;
					if (index === pending.length) break;
				}
				this.step(pending[index], this.#consumed);
				this.#consumed++;
			}
		}
	}
	/** Only raw quotes and their preceding backslash runs can terminate a string. */
	stringBoundary(fragment, start) {
		let at = start;
		while (true) {
			const quote = fragment.indexOf("\"", at);
			const end = quote < 0 ? fragment.length : quote;
			if (this.#mode === "string") {
				const entry = this.#current;
				if (!entry.needsDecoding && CONTENT_ESCAPE.test(fragment.slice(at, end))) entry.needsDecoding = true;
			}
			let slashStart = end;
			while (slashStart > at && fragment[slashStart - 1] === "\\") slashStart--;
			const escaped = (end - slashStart) % 2 === 1 !== (slashStart === at && this.#escape);
			this.#escape = quote < 0 && escaped;
			if (quote < 0 || !escaped) return end;
			at = quote + 1;
		}
	}
	step(c, at) {
		switch (this.#mode) {
			case "root":
				if (isWhitespace(c)) return;
				if (c === "{") {
					this.#mode = "key-or-end";
					return;
				}
				this.fail();
				return;
			case "key-or-end":
				if (isWhitespace(c)) return;
				if (c === "}") {
					this.#mode = "closed";
					return;
				}
				if (c === "\"") {
					this.beginKey(at);
					return;
				}
				this.fail();
				return;
			case "key-only":
				if (isWhitespace(c)) return;
				if (c === "\"") {
					this.beginKey(at);
					return;
				}
				this.fail();
				return;
			case "key":
				this.stepKey(c, at);
				return;
			case "colon":
				if (isWhitespace(c)) return;
				if (c === ":") {
					this.#mode = "value";
					return;
				}
				this.fail();
				return;
			case "value":
				this.beginValue(c, at);
				return;
			case "string": {
				const entry = this.#current;
				entry.end = at;
				this.#current = null;
				this.#mode = "comma-or-end";
				return;
			}
			case "scalar":
				this.stepScalar(c, at);
				return;
			case "nested":
				this.stepNested(c, at);
				return;
			case "comma-or-end":
				if (isWhitespace(c)) return;
				if (c === ",") {
					this.#mode = "key-only";
					return;
				}
				if (c === "}") {
					this.#mode = "closed";
					return;
				}
				this.fail();
				return;
			case "closed":
				if (isWhitespace(c)) return;
				this.fail();
				return;
			/* v8 ignore next 2 -- scan() stops stepping once the view is invalid. */
			case "invalid": return;
			/* v8 ignore next 2 -- Every scanner mode has a handler above. */
			default: assertNever(this.#mode);
		}
	}
	fail() {
		this.#invalidAt = this.#consumed;
		this.#mode = "invalid";
		this.#current = null;
	}
	beginKey(at) {
		this.#mode = "key";
		this.#keyStart = at + 1;
		this.#keyEscaped = false;
		this.#escape = false;
	}
	stepKey(c, at) {
		if (c < " ") {
			this.fail();
			return;
		}
		if (this.#escape) {
			this.#escape = false;
			return;
		}
		if (c === "\\") {
			this.#escape = true;
			this.#keyEscaped = true;
			return;
		}
		if (c !== "\"") return;
		const raw = this.slice(this.#keyStart, at);
		if (this.#keyEscaped) try {
			this.#key = JSON.parse(`"${raw}"`);
		} catch (_error) {
			this.fail();
			return;
		}
		else this.#key = raw;
		this.#mode = "colon";
	}
	open(entry) {
		if (!this.#entries.has(this.#key)) this.#order.push(this.#key);
		this.#entries.set(this.#key, entry);
		this.#current = entry;
	}
	beginValue(c, at) {
		if (isWhitespace(c)) return;
		if (c === "\"") {
			this.open({
				kind: "string",
				start: at + 1,
				end: -1,
				needsDecoding: false,
				invalidAt: void 0,
				length: void 0,
				text: void 0,
				prefixes: void 0
			});
			this.#escape = false;
			this.#mode = "string";
			return;
		}
		if (c === "}" || c === "," || c === ":" || c === "]") {
			this.fail();
			return;
		}
		this.open({
			kind: "value",
			start: at,
			end: -1,
			parsed: void 0,
			invalid: false
		});
		if (c === "{" || c === "[") {
			this.#mode = "nested";
			this.#nestedEnds = [c === "{" ? "}" : "]"];
			this.#nestedInString = false;
			this.#escape = false;
			return;
		}
		this.#mode = "scalar";
	}
	stepScalar(c, at) {
		if (c !== "," && c !== "}" && !isWhitespace(c)) return;
		this.closeValue(at);
		this.#mode = c === "," ? "key-only" : c === "}" ? "closed" : "comma-or-end";
	}
	stepNested(c, at) {
		if (this.#nestedInString) {
			this.#nestedInString = false;
			return;
		}
		if (c === "\"") {
			this.#nestedInString = true;
			return;
		}
		if (c === "{" || c === "[") {
			this.#nestedEnds.push(c === "{" ? "}" : "]");
			return;
		}
		if (c === "}" || c === "]") {
			if (this.#nestedEnds.pop() !== c) {
				this.fail();
				return;
			}
			if (this.#nestedEnds.length === 0) {
				this.closeValue(at + 1);
				this.#mode = "comma-or-end";
			}
		}
	}
	closeValue(end) {
		const entry = this.#current;
		entry.end = end;
		this.#current = null;
	}
});
/** Duplicate-install-safe JSON and immutable-value helpers. @module @deepseek-ai/dsh-util-values */
/**
* Mark an unreachable closed-union branch.
* @param value - impossible value; an unhandled typed variant fails at the call site.
* @param context - optional switch-site label included in the failure message.
* @returns never; a runtime value that escaped its type always throws.
*/
function assertNever(value, context) {
	const rendered = JSON.stringify(value) ?? String(value);
	throw new Error(`unreachable variant${context ? ` in ${context}` : ""}: ${rendered}`);
}
/** Whether a realm-owned intrinsic prototype has a native constructor matching this engine's representation. */
function hasIntrinsicConstructor$1(prototype, name) {
	const constructor = Object.getOwnPropertyDescriptor(prototype, "constructor")?.value;
	if (typeof constructor !== "function") return false;
	try {
		return constructor.name === name && constructor.prototype === prototype && Function.prototype.toString.call(constructor) === Function.prototype.toString.call(name === "Array" ? Array : Object);
	} catch {
		return false;
	}
}
/** Whether a candidate is one realm's intrinsic `Object.prototype`. */
function isIntrinsicObjectPrototype$1(value) {
	return Object.getPrototypeOf(value) === null && hasIntrinsicConstructor$1(value, "Object");
}
/** Whether an array uses one realm's intrinsic `Array.prototype`, not a subclass or forged prototype. */
function hasPlainArrayPrototype$1(value) {
	const prototype = Object.getPrototypeOf(value);
	if (!Array.isArray(prototype) || !hasIntrinsicConstructor$1(prototype, "Array")) return false;
	const objectPrototype = Object.getPrototypeOf(prototype);
	return typeof objectPrototype === "object" && objectPrototype !== null && isIntrinsicObjectPrototype$1(objectPrototype);
}
/** Whether an object is a plain or null-prototype record from any JavaScript realm. */
function hasPlainObjectPrototype(value) {
	const prototype = Object.getPrototypeOf(value);
	return prototype === null || typeof prototype === "object" && isIntrinsicObjectPrototype$1(prototype);
}
/** Return every JSON-visible object key, or reject own data JSON would discard. */
function enumerableStringKeys(value) {
	const keys = Reflect.ownKeys(value);
	if (keys.some((key) => typeof key !== "string" || !Object.prototype.propertyIsEnumerable.call(value, key))) return void 0;
	return keys;
}
/** Validate lossless JSON iteratively, optionally materializing a detached snapshot. */
function walkJsonValue(value, detach) {
	const ancestors = /* @__PURE__ */ new Set();
	let root;
	const assign = (destination, item) => {
		if (destination === void 0) return;
		if (destination.kind === "root") root = item;
		else if (destination.kind === "array") destination.target[destination.index] = item;
		else Object.defineProperty(destination.target, destination.key, {
			value: item,
			enumerable: true,
			configurable: true,
			writable: true
		});
	};
	const tasks = [{
		kind: "visit",
		value,
		...detach ? { destination: { kind: "root" } } : {}
	}];
	for (let task = tasks.pop(); task !== void 0; task = tasks.pop()) {
		if (task.kind === "leave") {
			ancestors.delete(task.source);
			continue;
		}
		if (task.kind === "array-item") {
			if (!Object.prototype.hasOwnProperty.call(task.source, task.index)) return void 0;
			tasks.push({
				kind: "visit",
				value: task.source[task.index],
				...task.target === void 0 ? {} : { destination: {
					kind: "array",
					target: task.target,
					index: task.index
				} }
			});
			continue;
		}
		if (task.kind === "object-property") {
			tasks.push({
				kind: "visit",
				value: task.source[task.key],
				...task.target === void 0 ? {} : { destination: {
					kind: "object",
					target: task.target,
					key: task.key
				} }
			});
			continue;
		}
		const current = task.value;
		if (current === null) {
			assign(task.destination, null);
			continue;
		}
		if (typeof current === "boolean" || typeof current === "string") {
			assign(task.destination, current);
			continue;
		}
		if (typeof current === "number") {
			if (!Number.isFinite(current) || Object.is(current, -0)) return void 0;
			assign(task.destination, current);
			continue;
		}
		if (typeof current !== "object") return void 0;
		if (ancestors.has(current)) return void 0;
		if (Array.isArray(current)) {
			if (!hasPlainArrayPrototype$1(current)) return void 0;
			const length = current.length;
			if (Reflect.ownKeys(current).length !== length + 1) return void 0;
			const target = detach ? [] : void 0;
			if (target !== void 0) assign(task.destination, target);
			ancestors.add(current);
			tasks.push({
				kind: "leave",
				source: current
			});
			for (let index = length - 1; index >= 0; index--) tasks.push({
				kind: "array-item",
				source: current,
				index,
				...target === void 0 ? {} : { target }
			});
			continue;
		}
		if (!hasPlainObjectPrototype(current)) return void 0;
		const keys = enumerableStringKeys(current);
		if (keys === void 0) return void 0;
		const target = detach ? {} : void 0;
		if (target !== void 0) assign(task.destination, target);
		ancestors.add(current);
		tasks.push({
			kind: "leave",
			source: current
		});
		for (let index = keys.length - 1; index >= 0; index--) {
			const key = keys[index];
			/* v8 ignore next -- the loop is bounded by the captured key count. */
			if (key === void 0) return void 0;
			tasks.push({
				kind: "object-property",
				source: current,
				key,
				...target === void 0 ? {} : { target }
			});
		}
	}
	return detach ? root : true;
}
/**
* Validate and detach lossless JSON in one read per property.
* @param value - candidate value to validate and detach.
* @returns the detached snapshot, or `undefined` when the value is not losslessly JSON-serializable.
*/
function snapshotJsonValue(value) {
	return walkJsonValue(value, true);
}
/**
* Test the same lossless JSON rules as {@link snapshotJsonValue} without detaching the value.
* @param value - candidate value to test.
* @returns whether the value survives a JSON round trip without loss.
*/
function isJsonValue(value) {
	return walkJsonValue(value, false) === true;
}
/**
* Deep-freeze an object graph in place while leaving live AbortSignal objects mutable.
* @param value - value to freeze.
* @returns the same value after every reachable enumerable child is frozen.
*/
function deepFreeze(value) {
	const seen = /* @__PURE__ */ new WeakSet();
	const pending = [{
		kind: "visit",
		node: value
	}];
	while (pending.length > 0) {
		const task = pending.pop();
		/* v8 ignore next -- the loop condition guarantees one pending task. */
		if (task === void 0) continue;
		if (task.kind === "property") {
			pending.push({
				kind: "visit",
				node: task.source[task.key]
			});
			continue;
		}
		const node = task.node;
		if (node === null || typeof node !== "object") continue;
		if (node instanceof AbortSignal) continue;
		if (seen.has(node)) continue;
		seen.add(node);
		Object.freeze(node);
		const keys = Object.keys(node);
		for (let index = keys.length - 1; index >= 0; index--) {
			const key = keys[index];
			/* v8 ignore next -- the loop is bounded by the captured key count. */
			if (key === void 0) continue;
			pending.push({
				kind: "property",
				source: node,
				key
			});
		}
	}
	return value;
}
// ../../node_modules/.pnpm/@deepseek-ai+dsh-timeout@0._41d72195e7a0d34d9116028f327a99c5/node_modules/@deepseek-ai/dsh-timeout/lib/index.js
/** Largest delay Node schedules without clamping it to one millisecond. */
const MAX_TIMER_DELAY_MS = 2147483647;
// ../../node_modules/.pnpm/@deepseek-ai+dsh-llm@0.2.2-alpha.2_@deepseek-ai+cordis@4.0.5/node_modules/@deepseek-ai/dsh-llm/lib/index.js
/**
* Detach and deep-freeze a message whose identity already exists.
* @param message - complete message, including its stable identity.
* @returns an immutable snapshot that preserves the identity.
*/
function freezeMessage(message) {
	return deepFreeze(structuredClone(message));
}
/**
* Harness error base with a stable machine-routable code and chained cause.
* Package errors extend it so tool results and replay can retain failure class.
* @module @deepseek-ai/dsh-llm/error
*/
/**
* Base class for all harness errors. Carries a `code` (stable, programmatic —
* e.g. `NO_ADAPTER`, `INVALID_ARGS`) distinct from the
* human-readable `message`, and supports `cause` chaining via the standard
* `ErrorOptions`. `name` defaults to the subclass constructor name.
*/
var HarnessError = class extends Error {
	/** Stable machine-routable failure class (e.g. `RATE_LIMIT`); route on this, never by parsing `message`. */
	code;
	constructor(message, code, options) {
		super(message, options);
		this.code = code;
		this.name = new.target.name;
	}
};
/**
* Canonical provider-neutral code for a response that completed normally but
* carried no content blocks at all. Providers occasionally emit a degenerate
* completion (a terminal stop with zero output); adapters classify it as this
* failure instead of yielding an empty assistant message, because an empty
* message silently ends the turn with nothing for the user or the loop to act
* on. The attempt produced nothing durable, so retry policy treats it as safe
* to repeat.
*/
const EMPTY_RESPONSE_CODE = "EMPTY_RESPONSE";
new RegExp(String.raw`(?:^|[^a-z0-9])context[\s_-](?:length|window)[\s_-]` + String.raw`(?:exceed(?:ed|s)?|overflow(?:ed)?|limit[\s_-]exceeded)(?:$|[^a-z0-9])`, "i");
new RegExp(String.raw`\b(?:request|prompt|input|messages?)\s+(?:is\s+|are\s+)?` + String.raw`too\s+(?:large|long)\s+for\s+(?:(?:this|the)\s+)?` + String.raw`(?:model(?:'s)?\s+)?context(?:\s+window)?\b`, "i");
new RegExp(String.raw`\b(?:input|prompt|request|messages?)\b.{0,40}` + String.raw`\b(?:exceed(?:s|ed)?|overflows?|is\s+larger\s+than)\b.{0,40}` + String.raw`\b(?:the\s+)?(?:model(?:'s)?\s+)?context(?:\s+(?:length|window))?\b`, "i");
/**
* Provider-owned request-retry policy configuration and resolution.
*
* Adapters expose one resolved policy per registered provider route; the
* optional dsh-llm-retry plugin executes it on the agent's failed-step extension point.
*
* @module @deepseek-ai/dsh-llm/retry-policy
*/
const DEFAULT_MAX_RETRIES = 5;
const DEFAULT_INITIAL_DELAY_MS = 500;
const DEFAULT_MAX_DELAY_MS = 1e4;
const DEFAULT_JITTER_RATIO = .1;
const DEFAULT_RETRYABLE_CODES = Object.freeze([
	EMPTY_RESPONSE_CODE,
	"RATE_LIMIT",
	"SERVER",
	"TIMEOUT",
	"TRANSPORT"
]);
const backoffSchema = z.object({
	initialDelayMs: z.number().max(MAX_TIMER_DELAY_MS).default(DEFAULT_INITIAL_DELAY_MS),
	maxDelayMs: z.number().max(MAX_TIMER_DELAY_MS).default(DEFAULT_MAX_DELAY_MS),
	jitterRatio: z.number().min(0).max(1).default(DEFAULT_JITTER_RATIO)
});
const normalPolicySchema = z.object({
	mode: z.const("normal").required(),
	maxRetries: z.number().step(1).min(0).max(Number.MAX_SAFE_INTEGER).default(DEFAULT_MAX_RETRIES),
	retryableCodes: z.array(z.string()).default([...DEFAULT_RETRYABLE_CODES]),
	backoff: backoffSchema
});
const alwaysPolicySchema = z.object({
	mode: z.const("always").required(),
	backoff: backoffSchema
});
z.union([normalPolicySchema, alwaysPolicySchema]);
const NORMAL_POLICY_KEYS = /* @__PURE__ */ new Set([
	"mode",
	"maxRetries",
	"retryableCodes",
	"backoff"
]);
const ALWAYS_POLICY_KEYS = /* @__PURE__ */ new Set([
	"mode",
	"maxRetries",
	"retryableCodes",
	"backoff"
]);
const BACKOFF_KEYS = /* @__PURE__ */ new Set([
	"initialDelayMs",
	"maxDelayMs",
	"jitterRatio"
]);
function validateKeys(value, allowed, path) {
	for (const key of Object.keys(value)) if (!allowed.has(key)) throw new Error(`${path}: unknown key "${key}"`);
}
function resolveBackoff(config, path) {
	if (config !== void 0) validateKeys(config, BACKOFF_KEYS, path);
	const initialDelayMs = config?.initialDelayMs ?? DEFAULT_INITIAL_DELAY_MS;
	const maxDelayMs = config?.maxDelayMs ?? DEFAULT_MAX_DELAY_MS;
	const jitterRatio = config?.jitterRatio ?? DEFAULT_JITTER_RATIO;
	if (!Number.isFinite(initialDelayMs) || initialDelayMs <= 0 || initialDelayMs > 2147483647) throw new Error(`${path}.initialDelayMs must be a positive finite number no greater than ${MAX_TIMER_DELAY_MS}`);
	if (!Number.isFinite(maxDelayMs) || maxDelayMs <= 0 || maxDelayMs > 2147483647) throw new Error(`${path}.maxDelayMs must be a positive finite number no greater than ${MAX_TIMER_DELAY_MS}`);
	if (initialDelayMs > maxDelayMs) throw new Error(`${path}.initialDelayMs must be less than or equal to maxDelayMs`);
	if (!Number.isFinite(jitterRatio) || jitterRatio < 0 || jitterRatio > 1) throw new Error(`${path}.jitterRatio must be between 0 and 1`);
	return Object.freeze({
		initialDelayMs,
		maxDelayMs,
		jitterRatio
	});
}
/**
* Validate, default, and detach one provider-owned retry policy.
* @param config - optional provider configuration; omission selects normal defaults.
* @param path - diagnostic path naming the provider config that owns the value.
* @returns an immutable policy safe to capture in provider registration state.
*/
function resolveRetryPolicy(config, path) {
	if (config === void 0) return Object.freeze({
		mode: "normal",
		maxRetries: DEFAULT_MAX_RETRIES,
		retryableCodes: DEFAULT_RETRYABLE_CODES,
		...resolveBackoff(void 0, `${path}.backoff`)
	});
	switch (config.mode) {
		case "normal": {
			validateKeys(config, NORMAL_POLICY_KEYS, path);
			const maxRetries = config.maxRetries ?? DEFAULT_MAX_RETRIES;
			const retryableCodes = config.retryableCodes ?? [...DEFAULT_RETRYABLE_CODES];
			if (!Number.isSafeInteger(maxRetries) || maxRetries < 0) throw new Error(`${path}.maxRetries must be a non-negative safe integer`);
			if (retryableCodes.length === 0) throw new Error(`${path}.retryableCodes must not be empty`);
			if (retryableCodes.some((code) => typeof code !== "string" || code.length === 0)) throw new Error(`${path}.retryableCodes must contain only non-empty strings`);
			if (new Set(retryableCodes).size !== retryableCodes.length) throw new Error(`${path}.retryableCodes must not contain duplicates`);
			return Object.freeze({
				mode: "normal",
				maxRetries,
				retryableCodes: Object.freeze([...retryableCodes]),
				...resolveBackoff(config.backoff, `${path}.backoff`)
			});
		}
		case "always":
			validateKeys(config, ALWAYS_POLICY_KEYS, path);
			return Object.freeze({
				mode: "always",
				...resolveBackoff(config.backoff, `${path}.backoff`)
			});
		default: throw new Error(`${path}.mode must be "normal" or "always"`);
	}
}
/**
* Field-wise equality over {@link LlmCallConfig} — the comparison a caller
* runs to decide whether a proposed configuration is a real change (worth a
* logged header snapshot) or the held one restated.
* @param a - one configuration.
* @param b - the other.
* @returns whether every field (including the `stop` list, element-wise) matches.
*/
function callConfigEquals(a, b) {
	if (a.provider !== b.provider || a.model !== b.model || a.reasoningEffort !== b.reasoningEffort || a.temperature !== b.temperature || a.maxTokens !== b.maxTokens) return false;
	if (a.stop === void 0 || b.stop === void 0) return a.stop === b.stop;
	return a.stop.length === b.stop.length && a.stop.every((s, i) => s === b.stop?.[i]);
}
/**
* Normalization for values thrown by a final LLM adapter boundary.
*
* @module @deepseek-ai/dsh-llm/adapter-failure
*/
/**
* Detach serializable provider facts from a value thrown by an adapter.
* @param value - arbitrary value thrown during adapter dispatch or iteration.
* @returns immutable provider-neutral facts suitable for a terminal finish chunk.
* @internal
*/
function normalizeLlmFailure(value) {
	const error = value instanceof Error ? value : new HarnessError(thrownMessage(value), "UNKNOWN", { cause: value });
	const carried = ownFailureSnapshot(error);
	if (carried !== void 0 && carried.code === ownErrorCode(error)) return carried;
	return Object.freeze({
		message: errorMessage(error),
		code: harnessErrorCode(error)
	});
}
/** Render a non-Error throw without letting hostile coercion escape normalization. */
function thrownMessage(value) {
	try {
		const message = String(value);
		return message.length > 0 ? message : "LLM adapter failed";
	} catch (_hostileThrownValue) {
		return "LLM adapter failed";
	}
}
/** Read a foreign error's own data-backed `code` without invoking accessors. */
function ownErrorCode(error) {
	try {
		const descriptor = Object.getOwnPropertyDescriptor(error, "code");
		return descriptor !== void 0 && "value" in descriptor ? descriptor.value : void 0;
	} catch (_sdkPropertyTrap) {
		return;
	}
}
/** Snapshot an own data property without invoking an SDK-defined accessor. */
function ownFailureSnapshot(error) {
	try {
		const descriptor = Object.getOwnPropertyDescriptor(error, "failure");
		return descriptor !== void 0 && "value" in descriptor ? failureSnapshot(descriptor.value) : void 0;
	} catch (_sdkPropertyTrap) {
		return;
	}
}
/** Validate and detach an arbitrary serializable failure payload. */
function failureSnapshot(value) {
	if (typeof value !== "object" || value === null) return void 0;
	try {
		const candidate = value;
		const message = candidate.message;
		const code = candidate.code;
		const status = candidate.status;
		const providerRetryAfterMs = candidate.providerRetryAfterMs;
		const requestId = candidate.requestId;
		const offloadImages = candidate.offloadImages;
		if (typeof message !== "string" || message.length === 0 || typeof code !== "string" || code.length === 0 || status !== void 0 && (!Number.isInteger(status) || status < 100 || status > 599) || providerRetryAfterMs !== void 0 && (!Number.isFinite(providerRetryAfterMs) || providerRetryAfterMs <= 0) || requestId !== void 0 && (typeof requestId !== "string" || requestId.length === 0) || offloadImages !== void 0 && (!Number.isSafeInteger(offloadImages) || offloadImages <= 0)) return void 0;
		return Object.freeze({
			message,
			code,
			...status === void 0 ? {} : { status },
			...providerRetryAfterMs === void 0 ? {} : { providerRetryAfterMs },
			...requestId === void 0 ? {} : { requestId },
			...offloadImages === void 0 ? {} : { offloadImages }
		});
	} catch (_sdkFailureGetter) {
		return;
	}
}
/** Read an SDK error message without letting an accessor replace the primary failure. */
function errorMessage(error) {
	try {
		const message = error.message;
		if (typeof message === "string" && message.length > 0) return message;
	} catch (_sdkMessageGetter) {}
	return "LLM adapter failed";
}
/** Trust only Harness-owned codes; third-party SDK codes are not our taxonomy. */
function harnessErrorCode(error) {
	return error instanceof HarnessError ? error.code : "UNKNOWN";
}
function quoted(value) {
	return JSON.stringify(value);
}
/**
* Stable text shown to a model that cannot accept one durable image reference.
* @param ref - durable normalized attachment omitted from the request.
* @returns deterministic text-only placeholder.
*/
function textOnlyImageText(ref) {
	return `[image omitted because this model accepts text only; attachment sha256:${String(ref.attachmentId).slice(7, 15)}]`;
}
/**
* True when typed model content contains an image block. This is the one image
* walk shared by every image policy (capability gating, text-only
* serialization, compaction survey), so a consumer cannot silently diverge.
* @param content - typed model content blocks.
* @returns whether any block is an image.
*/
function contentHasImage(content) {
	return content.some((block) => block.type === "image");
}
/**
* True when typed model content contains a file block.
* Reads current content on every call without retaining scan results.
* @param content - typed model content blocks.
* @returns whether any block is a file.
*/
function contentHasFile(content) {
	for (const block of content) if (block.type === "file") return true;
	return false;
}
/**
* Stable model-facing handle for one durable file reference: the address of
* the verbatim stored copy and the instruction to read it on demand. This is
* the only representation a provider ever receives for a file.
* @param ref - durable verbatim file reference.
* @param readonlyPath - execution-world path of the stored copy, when resolvable.
* @returns deterministic handle text naming the file, its size, and its address.
*/
function fileHandleText(ref, readonlyPath) {
	const digest = String(ref.attachmentId).slice(7, 15);
	const identity = `File ${quoted(ref.name)} (${ref.bytes} bytes, sha256:${digest})`;
	if (readonlyPath === void 0) return `[${identity} was uploaded, but the current execution environment cannot access a readable path. Report that limitation if its contents are needed; do not claim to have read it.]`;
	return `[${identity}: verbatim read-only copy saved at ${quoted(readonlyPath)}. Read that path with your file tools when its contents are needed; copy it to a writable location before modifying it. When delegating file work, include this saved path in the delegation prompt; only subagents sharing this execution environment can read it.]`;
}
/** Replace every file occurrence with handle text. */
function replaceFilesWithHandles(blocks, resolvePath) {
	let next;
	for (const [index, block] of blocks.entries()) {
		if (block.type === "file") {
			next ??= blocks.slice(0, index);
			next.push({
				type: "text",
				text: fileHandleText(block.attachment, resolvePath(block.attachment))
			});
			continue;
		}
		next?.push(block);
	}
	return next ?? blocks;
}
function projectFilesToText(messages, resolvePath) {
	if (!messages.some((message) => contentHasFile(message.content))) return messages;
	return messages.map((message) => {
		const content = replaceFilesWithHandles(message.content, resolvePath);
		return content === message.content ? message : {
			...message,
			content
		};
	});
}
/** Replace every image occurrence for a text-only model. */
function replaceImagesForTextModel(blocks) {
	let next;
	for (const [index, block] of blocks.entries()) {
		if (block.type === "image") {
			next ??= blocks.slice(0, index);
			next.push({
				type: "text",
				text: textOnlyImageText(block.attachment)
			});
			continue;
		}
		next?.push(block);
	}
	return next ?? blocks;
}
function projectImagesForTextModel(messages) {
	if (!messages.some((message) => contentHasImage(message.content))) return messages;
	return messages.map((message) => {
		const content = replaceImagesForTextModel(message.content);
		return content === message.content ? message : {
			...message,
			content
		};
	});
}
function withoutDeveloperMessages(messages) {
	const retained = messages.filter((message) => message.role !== "developer");
	return retained.length === messages.length ? messages : retained;
}
function toolDeclarations(tools, mode, history) {
	const declarations = new Map(history.tools.map((tool) => [tool.name, tool]));
	for (const update of history.updates) for (const tool of update.additions) if (!declarations.has(tool.name)) declarations.set(tool.name, {
		...tool,
		deferLoading: true
	});
	switch (mode) {
		case "in-history": return declarations;
		case "addition-only": {
			const activeNames = new Set(tools?.map((tool) => tool.name));
			for (const name of declarations.keys()) if (!activeNames.has(name)) declarations.delete(name);
			return declarations;
		}
		/* v8 ignore next 2 -- closed-union exhaustiveness guard */
		default: return assertNever(mode);
	}
}
/**
* Construct provider declarations from session-folded history without changing logged active tools.
* Unsupported routes and incomplete history use current declarations without developer updates.
* Explicitly deferred baseline tools become available only after their first retained addition.
* @param messages - complete request inputs, or the prefix selected for an auxiliary call.
* @param tools - currently active tool schemas.
* @param toolUpdate - the resolved route's update mode.
* @param history - immutable state folded from committed headers and developer messages.
* @returns provider declarations and the corresponding filtered history.
*/
function projectToolUpdates(messages, tools, toolUpdate, history) {
	if (toolUpdate === void 0) {
		let immediateTools = tools;
		if (tools?.some((tool) => tool.deferLoading === true)) immediateTools = tools.map(({ deferLoading: _loading, ...tool }) => tool);
		return {
			messages: withoutDeveloperMessages(messages),
			tools: immediateTools
		};
	}
	if (history === void 0) return {
		messages: withoutDeveloperMessages(messages),
		tools
	};
	const messageIds = new Set(messages.flatMap((message) => message.role === "developer" ? [message.id] : []));
	if (history.updates.some((update) => !messageIds.has(update.messageId))) return {
		messages: withoutDeveloperMessages(messages),
		tools
	};
	const declarations = toolDeclarations(tools, toolUpdate, history);
	const updateIds = new Set(history.updates.map((update) => update.messageId));
	const offered = new Set(history.tools.filter((tool) => !tool.deferLoading).map((tool) => tool.name));
	const projectedMessages = [];
	for (const message of messages) {
		if (message.role !== "developer") {
			projectedMessages.push(message);
			continue;
		}
		if (!updateIds.has(message.id)) continue;
		const content = message.content.filter((block) => {
			switch (block.type) {
				case "tool-addition":
					if (!declarations.has(block.toolName) || offered.has(block.toolName)) return false;
					offered.add(block.toolName);
					return true;
				case "tool-removal":
					if (toolUpdate !== "in-history") return false;
					return offered.delete(block.toolName);
				default: return true;
			}
		});
		if (content.length === 0) continue;
		if (content.length === message.content.length) projectedMessages.push(message);
		else projectedMessages.push({
			...message,
			content
		});
	}
	return {
		messages: projectedMessages.length === messages.length && projectedMessages.every((message, index) => message === messages[index]) ? messages : projectedMessages,
		tools: [...declarations.values()]
	};
}
/**
* Centralize the non-secret product identity every provider request sends as `User-Agent`, keeping
* adapters from drifting. See
* `docs/subsystems/llm-streaming.md#appidentity--app-attribution`.
*
* App-attribution vocabulary for provider requests.
* @module @deepseek-ai/dsh-llm/attribution
*/
const { version } = createRequire(import.meta.url)("../package.json");
/**
* LLM service: adapter registry with a waterfall-interceptable streaming call
* API. Exports the `LlmRuntime` default, the abstract `LlmAdapter` for
* provider backends, and `BlockAssembler` for chunk assembly.
*
* @module @deepseek-ai/dsh-llm
*/
var __runInitializers = function(thisArg, initializers, value) {
	var useValue = arguments.length > 2;
	for (var i = 0; i < initializers.length; i++) value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
	return useValue ? value : void 0;
};
var __esDecorate = function(ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
	function accept(f) {
		if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected");
		return f;
	}
	var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
	var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
	var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
	var _, done = false;
	for (var i = decorators.length - 1; i >= 0; i--) {
		var context = {};
		for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
		for (var p in contextIn.access) context.access[p] = contextIn.access[p];
		context.addInitializer = function(f) {
			if (done) throw new TypeError("Cannot add initializers after decoration has completed");
			extraInitializers.push(accept(f || null));
		};
		var result = (0, decorators[i])(kind === "accessor" ? {
			get: descriptor.get,
			set: descriptor.set
		} : descriptor[key], context);
		if (kind === "accessor") {
			if (result === void 0) continue;
			if (result === null || typeof result !== "object") throw new TypeError("Object expected");
			if (_ = accept(result.get)) descriptor.get = _;
			if (_ = accept(result.set)) descriptor.set = _;
			if (_ = accept(result.init)) initializers.unshift(_);
		} else if (_ = accept(result)) if (kind === "field") initializers.unshift(_);
		else descriptor[key] = _;
	}
	if (target) Object.defineProperty(target, contextIn.name, descriptor);
	done = true;
};
/**
* Typed error for LLM-related failures. Extends {@link HarnessError}, so the
* `code` string (e.g. `AUTH`, `RATE_LIMIT`, `NO_ADAPTER`) is shared taxonomy.
*/
var LlmError = class extends HarnessError {
	/** Serializable facts retained beside this live Error. */
	failure;
	/**
	* @param message - non-empty human-readable failure summary.
	* @param code - non-empty stable provider-neutral machine code.
	* @param options - optional cause and validated serializable provider facts.
	*/
	constructor(message, code, options) {
		if (typeof message !== "string" || message.length === 0) throw new Error("LlmError message must be a non-empty string");
		if (typeof code !== "string" || code.length === 0) throw new Error("LlmError code must be a non-empty string");
		if (options?.status !== void 0 && (!Number.isInteger(options.status) || options.status < 100 || options.status > 599)) throw new Error("LlmError status must be an integer from 100 through 599");
		if (options?.providerRetryAfterMs !== void 0 && (!Number.isFinite(options.providerRetryAfterMs) || options.providerRetryAfterMs <= 0)) throw new Error("LlmError providerRetryAfterMs must be a positive finite number");
		if (options?.requestId !== void 0 && (typeof options.requestId !== "string" || options.requestId.length === 0)) throw new Error("LlmError requestId must be a non-empty string");
		super(message, code, options);
		this.name = "LlmError";
		this.failure = Object.freeze({
			message,
			code,
			...options?.status === void 0 ? {} : { status: options.status },
			...options?.providerRetryAfterMs === void 0 ? {} : { providerRetryAfterMs: options.providerRetryAfterMs },
			...options?.requestId === void 0 ? {} : { requestId: options.requestId },
			...options?.offloadImages === void 0 ? {} : { offloadImages: options.offloadImages }
		});
	}
};
(() => {
	let _classSuper = TypertRemoteService;
	let _instanceExtraInitializers = [];
	let _listProviders_decorators;
	let _listConfigurableProviders_decorators;
	let _remoteDiscoverModels_decorators;
	return class LlmRuntime extends _classSuper {
		static {
			const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
			_listProviders_decorators = [Remote];
			_listConfigurableProviders_decorators = [Remote];
			_remoteDiscoverModels_decorators = [Remote("discoverModels")];
			__esDecorate(this, null, _listProviders_decorators, {
				kind: "method",
				name: "listProviders",
				static: false,
				private: false,
				access: {
					has: (obj) => "listProviders" in obj,
					get: (obj) => obj.listProviders
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _listConfigurableProviders_decorators, {
				kind: "method",
				name: "listConfigurableProviders",
				static: false,
				private: false,
				access: {
					has: (obj) => "listConfigurableProviders" in obj,
					get: (obj) => obj.listConfigurableProviders
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _remoteDiscoverModels_decorators, {
				kind: "method",
				name: "remoteDiscoverModels",
				static: false,
				private: false,
				access: {
					has: (obj) => "remoteDiscoverModels" in obj,
					get: (obj) => obj.remoteDiscoverModels
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			if (_metadata) Object.defineProperty(this, Symbol.metadata, {
				enumerable: true,
				configurable: true,
				writable: true,
				value: _metadata
			});
		}
		adapters = (__runInitializers(this, _instanceExtraInitializers), /* @__PURE__ */ new Map());
		directory = /* @__PURE__ */ new Map();
		discoveries = /* @__PURE__ */ new Map();
		constructor(ctx) {
			super(ctx, "llm");
		}
		/** Notify topology observers without letting one broken listener veto the commit. */
		emitAdaptersUpdated() {
			for (const listener of this.ctx.events.dispatch("emit", ["llm/adapters-updated"])) try {
				const returned = listener();
				if (returned != null && typeof returned.then === "function") Promise.resolve(returned).then(void 0, (error) => {
					this.warnAdaptersListenerFailure(error);
				});
			} catch (error) {
				this.warnAdaptersListenerFailure(error);
			}
		}
		/** Contained-listener diagnostic shared by the sync and async failure paths. */
		warnAdaptersListenerFailure(error) {
			this.ctx.logger.warn("llm: an llm/adapters-updated listener failed");
			this.ctx.logger.warn(error);
		}
		/**
		* Register an adapter for the given provider routes. Throws `LlmError` with code
		* `DUPLICATE_ADAPTER` if any provider already has an adapter (all-or-nothing).
		* Disposed with the fiber.
		* @param providers - every provider route this adapter should serve.
		* @param adapter - the adapter that streams calls for those providers.
		* @returns the disposer, carrying {@link AdapterRegistrationHandle.replace}.
		*/
		registerAdapter(providers, adapter) {
			const owned = /* @__PURE__ */ new Set();
			let released = false;
			const dispose = this.ctx.effect(function* () {
				if (providers.length === 0) throw new LlmError("an adapter must register at least one provider", "INVALID_ADAPTER");
				this.commitRoutes(owned, this.prepareRoutes(providers, adapter, owned));
				yield () => {
					released = true;
					for (const provider of owned) this.adapters.delete(provider);
					owned.clear();
					this.emitAdaptersUpdated();
				};
			}.bind(this), "llm.registerAdapter()");
			const handle = (() => void dispose());
			handle.replace = (next) => {
				if (released) throw new LlmError("a disposed adapter registration cannot replace its routes", "REGISTRATION_DISPOSED");
				this.commitRoutes(owned, this.prepareRoutes(next, adapter, owned));
			};
			return handle;
		}
		/**
		* Validate one candidate route set for `adapter`, treating routes this
		* registration already holds as available. Nothing is mutated: a rejected
		* candidate leaves the registry exactly as it was.
		*/
		prepareRoutes(providers, adapter, owned) {
			const unique = /* @__PURE__ */ new Set();
			const registrations = [];
			for (const provider of providers) {
				if (provider.length === 0) throw new LlmError("adapter provider names must be non-empty", "INVALID_ADAPTER");
				if (unique.has(provider) || this.adapters.has(provider) && !owned.has(provider)) throw new LlmError(`an adapter for provider "${provider}" is already registered`, "DUPLICATE_ADAPTER");
				const info = adapter.providerInfo(provider);
				if (typeof info.id !== "string" || info.id !== provider || typeof info.name !== "string" || info.name.length === 0) throw new LlmError(`adapter metadata for provider "${provider}" must preserve its id and have a non-empty name`, "INVALID_ADAPTER");
				unique.add(provider);
				const retryPolicy = adapter.providerRetryPolicy(provider) ?? resolveRetryPolicy(void 0, `llm: provider "${provider}" retryPolicy`);
				registrations.push({
					adapter,
					provider: {
						id: info.id,
						name: info.name
					},
					retryPolicy
				});
			}
			return registrations;
		}
		/**
		* Swap this registration's routes for the prepared ones in one synchronous
		* section, so no observer can see the registry between the release and the
		* re-registration. The route set's one mutation point is also where
		* `llm/adapters-updated` is published, so a `replace` announces itself
		* exactly like a first registration.
		*/
		commitRoutes(owned, registrations) {
			for (const provider of owned) this.adapters.delete(provider);
			owned.clear();
			for (const registration of registrations) {
				this.adapters.set(registration.provider.id, registration);
				owned.add(registration.provider.id);
			}
			this.emitAdaptersUpdated();
		}
		/**
		* Describe provider routes with a registered adapter.
		* @returns detached provider metadata in registration order.
		*/
		listProviders() {
			return [...this.adapters.values()].map(({ provider }) => ({ ...provider }));
		}
		/**
		* Declare provider routes an adapter plugin can activate through
		* configuration. Registration is all-or-nothing: an empty list, invalid
		* entry, or a provider already declared by any registration throws
		* `LlmError` without registering the rest. Disposed with the fiber.
		* @param entries - every configurable provider this plugin owns.
		* @returns a handle that withdraws all of them, and can atomically replace them.
		*/
		registerConfigurableProviders(entries) {
			let held = [];
			let disposed = false;
			/**
			* Validate a candidate set in full against everything this registration
			* does not already hold, then publish it. Nothing is written until the
			* whole set passes, so a refused candidate leaves the current entries in
			* place — the property that makes `replace` a swap rather than a
			* delete-then-add that can strand the directory empty.
			*/
			const commit = (candidates) => {
				const detached = [];
				const own = new Set(held.map((entry) => entry.provider));
				for (const entry of candidates) {
					if (entry.provider.length === 0 || entry.displayName.length === 0 || entry.settingsNs.length === 0) throw new LlmError("configurable providers need a non-empty provider, displayName, and settingsNs", "INVALID_DIRECTORY");
					if (entry.settingsPath.some((segment) => segment.length === 0)) throw new LlmError(`configurable provider "${entry.provider}" has an empty settingsPath segment`, "INVALID_DIRECTORY");
					if (this.directory.has(entry.provider) && !own.has(entry.provider) || detached.some((seen) => seen.provider === entry.provider)) throw new LlmError(`configurable provider "${entry.provider}" is already declared`, "DUPLICATE_DIRECTORY");
					detached.push(detachDirectoryEntry(entry));
				}
				for (const entry of held) this.directory.delete(entry.provider);
				for (const entry of detached) this.directory.set(entry.provider, entry);
				held = detached;
				this.emitAdaptersUpdated();
			};
			const dispose = this.ctx.effect(function* () {
				if (entries.length === 0) throw new LlmError("a configurable-provider registration must declare at least one provider", "INVALID_DIRECTORY");
				commit(entries);
				yield () => {
					disposed = true;
					for (const entry of held) this.directory.delete(entry.provider);
					held = [];
					this.emitAdaptersUpdated();
				};
			}.bind(this), "llm.registerConfigurableProviders()");
			const handle = (() => void dispose());
			handle.replace = (next) => {
				if (disposed) throw new LlmError("this configurable-provider registration was disposed", "REGISTRATION_DISPOSED");
				commit(next);
			};
			return handle;
		}
		/**
		* List every declared configurable provider, registered or dormant.
		* @returns detached directory entries in declaration order.
		*/
		listConfigurableProviders() {
			return [...this.directory.values()].map(detachDirectoryEntry);
		}
		/**
		* Offer to interrogate provider endpoints on behalf of the settings
		* namespace this plugin owns. The namespace is the key because that is what
		* a configuration surface already holds from the configurable-provider
		* directory, and because a provider being *added* has no route to name yet.
		* Disposed with the fiber.
		* @param settingsNs - the namespace whose profiles this discovery serves.
		* @param discover - interrogates one endpoint and must honor the supplied signal.
		* @returns the disposer that withdraws the offer.
		*/
		registerModelDiscovery(settingsNs, discover) {
			const dispose = this.ctx.effect(function* () {
				if (settingsNs.length === 0) throw new LlmError("model discovery needs a non-empty settings namespace", "INVALID_DISCOVERY");
				if (this.discoveries.has(settingsNs)) throw new LlmError(`model discovery for "${settingsNs}" is already registered`, "DUPLICATE_DISCOVERY");
				this.discoveries.set(settingsNs, discover);
				yield () => {
					this.discoveries.delete(settingsNs);
				};
			}.bind(this), "llm.registerModelDiscovery()");
			return () => void dispose();
		}
		/**
		* Interrogate one provider endpoint for the models it advertises. The
		* request describes a draft, not a stored route, so nothing here reads or
		* writes settings or credentials — the caller owns both, and the reply is
		* candidate metadata a surface may offer for adoption.
		* @param settingsNs - namespace whose registered discovery serves this draft.
		* @param request - the endpoint, protocol, and one-shot credential to use.
		* @param signal - caller cancellation.
		* @returns the advertised models, deduplicated in endpoint order.
		*/
		async discoverModels(settingsNs, request, signal) {
			const discover = this.discoveries.get(settingsNs);
			if (discover === void 0) throw new LlmError(`no model discovery is registered for "${settingsNs}"`, "NO_DISCOVERY");
			if ((request.provider ?? "").length === 0 && (request.baseURL ?? "").length === 0) throw new LlmError("model discovery needs a provider route or a baseURL", "INVALID_DISCOVERY");
			const discovered = signal === void 0 ? await discover(request) : await discover(request, signal);
			const seen = /* @__PURE__ */ new Set();
			const models = [];
			for (const model of discovered) {
				if (typeof model.id !== "string" || model.id.length === 0 || seen.has(model.id)) continue;
				seen.add(model.id);
				models.push({
					id: model.id,
					...model.name === void 0 ? {} : { name: model.name },
					...model.contextWindow === void 0 ? {} : { contextWindow: model.contextWindow },
					...model.maxTokens === void 0 ? {} : { maxTokens: model.maxTokens },
					...model.inputModalities === void 0 ? {} : { inputModalities: [...model.inputModalities] }
				});
			}
			return models;
		}
		/**
		* Remote adapter for one draft provider interrogation.
		* @param settingsNs - namespace whose registered discovery serves this draft.
		* @param request - endpoint, protocol, and one-shot credential to use.
		* @param signal - caller cancellation supplied by the Remote carrier.
		* @returns advertised models in endpoint order.
		* @throws RemoteError with `llm/model-discovery-rejected` when discovery refuses or fails.
		*/
		async remoteDiscoverModels(settingsNs, request, signal) {
			try {
				return await this.discoverModels(settingsNs, request, signal);
			} catch (error) {
				throw new RemoteError("llm/model-discovery-rejected", error instanceof Error ? error.message : String(error), {
					settingsNs,
					...request.baseURL === void 0 ? {} : { baseURL: request.baseURL }
				}, { cause: error });
			}
		}
		/**
		* Resolve the retry policy captured when one provider route was registered.
		* @param provider - registered provider route to inspect.
		* @returns the provider-owned policy, with normal defaults already resolved.
		*/
		providerRetryPolicy(provider) {
			return this.registration(provider).retryPolicy;
		}
		/**
		* Resolve provider-side request-image pricing for one exact route, or
		* `undefined` when the provider is unregistered or declares none. Unknown
		* providers degrade to `undefined` rather than throwing because callers
		* price durable history whose route may no longer be mounted.
		* @param provider - provider route named by a request header.
		* @param model - exact model id named by the same header.
		* @returns the owning adapter's image pricing for the route, when declared.
		*/
		imageRequestPricing(provider, model) {
			return this.adapters.get(provider)?.adapter.imageRequestPricing(provider, model);
		}
		/**
		* Resolve the image projection for an exact registered model route.
		* @param provider - registered provider route.
		* @param model - exact model id.
		* @param image - normalized image reference.
		* @returns dimensions and byte target used by the adapter's request serializer.
		*/
		imageRequestTarget(provider, model, image) {
			return this.registration(provider).adapter.imageRequestTarget(provider, model, image);
		}
		/**
		* Resolve the exact text one durable file occurrence contributes to every
		* provider request in the current execution environment.
		* @param ref - durable verbatim file reference from model history.
		* @returns the same deterministic handle text used at adapter dispatch.
		*/
		fileRequestText(ref) {
			return fileHandleText(ref, this.fileReadPath(ref));
		}
		/** Detach typed adapter-owned modality metadata. */
		detachedModalities(modalities) {
			return modalities === void 0 ? void 0 : [...modalities];
		}
		/**
		* Discover models advertised by one registered provider. Catalog membership
		* does not constrain core routing. Catalog-driven entry points may restrict
		* selection and submission to the advertised models.
		* @param provider - registered provider route to inspect.
		* @returns detached model metadata in adapter-preferred order.
		*/
		async listModels(provider) {
			const models = await this.registration(provider).adapter.listModels(provider);
			const seen = /* @__PURE__ */ new Set();
			return models.map((model) => {
				if (typeof model.provider !== "string" || model.provider !== provider || typeof model.id !== "string" || model.id.length === 0 || typeof model.name !== "string" || model.name.length === 0 || model.description !== void 0 && typeof model.description !== "string" || seen.has(model.id)) throw new LlmError(`adapter returned invalid or duplicate model metadata for provider "${provider}"`, "INVALID_CATALOG");
				seen.add(model.id);
				const inputModalities = this.detachedModalities(model.inputModalities);
				const badge = model.badge;
				return {
					provider: model.provider,
					id: model.id,
					name: model.name,
					...model.description === void 0 ? {} : { description: model.description },
					...inputModalities === void 0 ? {} : { inputModalities },
					...badge === void 0 ? {} : { badge: {
						text: typeof badge.text === "string" ? badge.text : { ...badge.text },
						tone: badge.tone
					} }
				};
			});
		}
		/**
		* Resolve and validate all metadata from the adapter that owns one exact
		* route. The result is detached from adapter-owned objects; catalog
		* membership remains advisory and does not control request routing.
		* @param provider - registered provider route to inspect.
		* @param model - exact model id passed to the adapter.
		* @param signal - optional cancellation for adapter-owned asynchronous lookup.
		* @returns exact model identity plus available context and reasoning metadata.
		*/
		async resolveModelInfo(provider, model, signal) {
			return this.resolveModelInfoFor(this.registration(provider), model, signal);
		}
		async resolveModelInfoFor(registration, model, signal) {
			const resolved = await registration.adapter.resolveModel(registration.provider.id, model, signal);
			return this.normalizeModelInfo(registration, model, resolved);
		}
		/** Validate and detach one adapter-returned exact model result. */
		normalizeModelInfo(registration, model, resolved) {
			const provider = registration.provider.id;
			if (typeof resolved.provider !== "string" || resolved.provider !== provider || typeof resolved.id !== "string" || resolved.id !== model || typeof resolved.name !== "string" || resolved.name.length === 0 || resolved.description !== void 0 && typeof resolved.description !== "string") throw new LlmError(`adapter returned invalid exact model metadata for provider "${provider}" model "${model}"`, "INVALID_MODEL_INFO");
			const context = resolved.context;
			if (context !== void 0 && (!Number.isInteger(context.contextWindow) || context.contextWindow <= 0)) throw new LlmError(`adapter returned invalid context metadata for provider "${provider}" model "${model}"`, "INVALID_MODEL_CONTEXT");
			const inputModalities = this.detachedModalities(resolved.inputModalities);
			const systemPromptUpdate = resolved.systemPromptUpdate;
			if (systemPromptUpdate !== void 0 && systemPromptUpdate !== "in-history") throw new LlmError(`adapter returned invalid system prompt update mode for provider "${provider}" model "${model}"`, "INVALID_MODEL_INFO");
			const toolUpdate = resolved.toolUpdate;
			if (toolUpdate !== void 0 && toolUpdate !== "in-history" && toolUpdate !== "addition-only") throw new LlmError(`adapter returned invalid tool update mode for provider "${provider}" model "${model}"`, "INVALID_MODEL_INFO");
			const defaultMaxTokens = resolved.defaultMaxTokens;
			if (defaultMaxTokens !== void 0 && (!Number.isSafeInteger(defaultMaxTokens) || defaultMaxTokens <= 0)) throw new LlmError(`adapter returned invalid default maxTokens for provider "${provider}" model "${model}"`, "INVALID_MODEL_MAX_TOKENS");
			const info = {
				provider,
				id: model,
				name: resolved.name,
				...resolved.description === void 0 ? {} : { description: resolved.description },
				...inputModalities === void 0 ? {} : { inputModalities },
				...context === void 0 ? {} : { context: { contextWindow: context.contextWindow } },
				...defaultMaxTokens === void 0 ? {} : { defaultMaxTokens },
				...resolved.systemPromptUpdate === void 0 ? {} : { systemPromptUpdate: resolved.systemPromptUpdate },
				...resolved.toolUpdate === void 0 ? {} : { toolUpdate: resolved.toolUpdate }
			};
			const reasoning = resolved.reasoning;
			if (reasoning === void 0) return info;
			if (reasoning.efforts.length === 0) throw new LlmError(`adapter returned invalid reasoning metadata for provider "${provider}" model "${model}"`, "INVALID_MODEL_REASONING");
			const seen = /* @__PURE__ */ new Set();
			const efforts = reasoning.efforts.map((effort) => {
				if (typeof effort.id !== "string" || effort.id.length === 0 || typeof effort.name !== "string" || effort.name.length === 0 || effort.description !== void 0 && typeof effort.description !== "string" || seen.has(effort.id)) throw new LlmError(`adapter returned invalid or duplicate reasoning effort metadata for provider "${provider}" model "${model}"`, "INVALID_MODEL_REASONING");
				seen.add(effort.id);
				return {
					id: effort.id,
					name: effort.name,
					...effort.description === void 0 ? {} : { description: effort.description }
				};
			});
			if (reasoning.defaultEffort !== void 0 && !seen.has(reasoning.defaultEffort)) throw new LlmError(`adapter returned an unknown default reasoning effort for provider "${provider}" model "${model}"`, "INVALID_MODEL_REASONING");
			return {
				...info,
				reasoning: {
					efforts,
					...reasoning.defaultEffort === void 0 ? {} : { defaultEffort: reasoning.defaultEffort }
				}
			};
		}
		/**
		* Validate a conversation call config against its exact model capability and
		* materialize adapter-configured defaults. Unsupported explicit efforts
		* reject before provider I/O; no clamping or aliasing is performed. This
		* standalone query does not bind a later dispatch; use {@link prepareCall}
		* when logging and streaming must share one adapter registration.
		* @param config - provider/model route and optional request controls.
		* @param signal - optional cancellation for adapter-owned capability lookup.
		* @returns a detached config only when a default must be materialized.
		*/
		async resolveCallConfig(config, signal) {
			return (await this.resolveCallFor(this.registration(config.provider), config, signal)).config;
		}
		async resolveCallFor(registration, config, signal) {
			const info = await this.resolveModelInfoFor(registration, config.model, signal);
			return this.resolveCallWithInfo(config, info);
		}
		/** Validate request controls against one already-bound exact model result. */
		resolveCallWithInfo(config, info) {
			const defaulted = config.maxTokens === void 0 && info.defaultMaxTokens !== void 0 ? {
				...config,
				maxTokens: info.defaultMaxTokens
			} : config;
			const reasoning = info.reasoning;
			const requested = defaulted.reasoningEffort;
			let resolvedConfig = defaulted;
			if (reasoning === void 0) {
				if (requested !== void 0) throw new LlmError(`provider "${config.provider}" model "${config.model}" does not support reasoning effort "${requested}"`, "UNSUPPORTED_REASONING_EFFORT");
			} else {
				const effective = requested ?? reasoning.defaultEffort;
				if (effective !== void 0) {
					if (!reasoning.efforts.some((effort) => effort.id === effective)) throw new LlmError(`provider "${config.provider}" model "${config.model}" does not support reasoning effort "${effective}"`, "UNSUPPORTED_REASONING_EFFORT");
					if (requested !== effective) resolvedConfig = {
						...defaulted,
						reasoningEffort: effective
					};
				}
			}
			return {
				config: resolvedConfig,
				...info.context === void 0 ? {} : { context: info.context },
				modelInfo: info
			};
		}
		/**
		* Resolve one call under its current adapter registration. The returned
		* one-shot handle keeps that registration across header logging and dispatch,
		* so HMR cannot combine one adapter's capability result with another adapter.
		* An optional synchronous callback selects concrete controls using captured
		* model metadata. Defaults and validation apply to its result. Callback
		* failures and cancellation reject preparation before dispatch.
		* @param config - provider/model route and optional concrete request controls.
		* @param signal - optional cancellation for adapter-owned capability lookup.
		* @param configure - pure control selection, called once before defaults and validation.
		* @returns a prepared config and its registration-bound stream entry point.
		*/
		async prepareCall(config, signal, configure) {
			signal?.throwIfAborted();
			const { provider, model, ...controls } = config;
			const registration = this.registration(provider);
			const adapterCall = await registration.adapter.prepareCall(provider, model, signal);
			signal?.throwIfAborted();
			const modelInfo = this.normalizeModelInfo(registration, model, adapterCall.model);
			const proposed = configure === void 0 ? config : {
				...configure(deepFreeze(structuredClone(controls)), deepFreeze(modelInfo)),
				provider,
				model
			};
			signal?.throwIfAborted();
			const resolved = this.resolveCallWithInfo(proposed, modelInfo);
			const resolvedConfig = deepFreeze(structuredClone(resolved.config));
			const context = resolved.context === void 0 ? void 0 : deepFreeze(structuredClone(resolved.context));
			const adapterDefaults = deepFreeze({
				...proposed.reasoningEffort === void 0 && resolvedConfig.reasoningEffort !== void 0 ? { reasoningEffort: true } : {},
				...proposed.maxTokens === void 0 && resolvedConfig.maxTokens !== void 0 ? { maxTokens: true } : {}
			});
			let dispatched = false;
			return Object.freeze({
				config: resolvedConfig,
				retryPolicy: registration.retryPolicy,
				adapterDefaults,
				...context === void 0 ? {} : { context },
				...modelInfo.inputModalities === void 0 ? {} : { inputModalities: Object.freeze([...modelInfo.inputModalities]) },
				...modelInfo.systemPromptUpdate === void 0 ? {} : { systemPromptUpdate: modelInfo.systemPromptUpdate },
				...modelInfo.toolUpdate === void 0 ? {} : { toolUpdate: modelInfo.toolUpdate },
				stream: (options) => {
					if (dispatched) throw new LlmError("a prepared LLM call can only be dispatched once", "INVALID_PREPARED_CALL");
					if (!callConfigEquals(options, resolvedConfig)) throw new LlmError("prepared LLM call config changed before adapter dispatch", "INVALID_PREPARED_CALL");
					dispatched = true;
					return this.streamWithRegistration(options, {
						registration,
						config: resolvedConfig,
						modelInfo,
						dispatch: (options) => adapterCall.stream(options)
					});
				}
			});
		}
		registration(provider) {
			const registration = this.adapters.get(provider);
			if (!registration) throw new LlmError(`no adapter registered for provider "${provider}"`, "NO_ADAPTER");
			return registration;
		}
		/** Remove replay state whose historical route is owned by another adapter. */
		forAdapter(options, adapter) {
			const messages = options.messages.map((message) => {
				if (message.role !== "assistant") return message;
				const source = message.source;
				if (source.replayState === void 0) return message;
				if (this.adapters.get(source.provider)?.adapter === adapter) return message;
				return freezeMessage({
					...message,
					source: {
						kind: "model",
						provider: source.provider,
						model: source.model
					}
				});
			});
			if (messages.every((message, index) => message === options.messages[index])) return options;
			const filtered = {
				...options,
				messages
			};
			return Object.isFrozen(options) ? deepFreeze(filtered) : filtered;
		}
		/**
		* Resolve the current execution-world read path of one durable file
		* reference through the mounted attachment and filesystem providers.
		*/
		fileReadPath(ref) {
			let hostPath;
			try {
				hostPath = this.ctx.get("attachments")?.fileHostPath(ref);
			} catch {
				return;
			}
			if (hostPath === void 0) return void 0;
			return this.ctx.get("fs")?.processPathFromHostPath(hostPath);
		}
		/**
		* Final adapter boundary. Adapter selection, dispatch, iterator construction,
		* and iteration failures become one terminal failure chunk. Middleware and
		* downstream consumer failures remain thrown plugin or consumer errors.
		*/
		async *adapterStream(options, prepared) {
			let iterator;
			try {
				const registration = prepared?.registration ?? this.registration(options.provider);
				const adapter = registration.adapter;
				let modelInfo;
				let resolvedConfig;
				let dispatch;
				if (prepared === void 0) {
					const adapterCall = await adapter.prepareCall(options.provider, options.model, options.signal);
					modelInfo = this.normalizeModelInfo(registration, options.model, adapterCall.model);
					resolvedConfig = this.resolveCallWithInfo(options, modelInfo).config;
					dispatch = (options) => adapterCall.stream(options);
				} else {
					modelInfo = prepared.modelInfo;
					resolvedConfig = prepared.config;
					dispatch = prepared.dispatch;
				}
				if (prepared !== void 0 && !callConfigEquals(options, resolvedConfig)) throw new LlmError("prepared LLM call config changed before adapter dispatch", "INVALID_PREPARED_CALL");
				const resolvedOptions = callConfigEquals(options, resolvedConfig) ? options : Object.isFrozen(options) ? deepFreeze({
					...options,
					...resolvedConfig
				}) : {
					...options,
					...resolvedConfig
				};
				let projectedMessages = resolvedOptions.messages;
				if (projectedMessages.some((message) => contentHasFile(message.content))) projectedMessages = projectFilesToText(projectedMessages, (ref) => this.fileReadPath(ref));
				if (modelInfo.inputModalities !== void 0 && !modelInfo.inputModalities.includes("image") && projectedMessages.some((message) => contentHasImage(message.content))) projectedMessages = projectImagesForTextModel(projectedMessages);
				const projectedTools = projectToolUpdates(projectedMessages, resolvedOptions.tools, modelInfo.toolUpdate, resolvedOptions.toolHistory);
				projectedMessages = projectedTools.messages;
				let projectedOptions = resolvedOptions;
				if (projectedMessages !== resolvedOptions.messages || projectedTools.tools !== resolvedOptions.tools) {
					projectedOptions = {
						...resolvedOptions,
						messages: projectedMessages,
						...projectedTools.tools === void 0 ? {} : { tools: projectedTools.tools }
					};
					if (Object.isFrozen(resolvedOptions)) deepFreeze(projectedOptions);
				}
				iterator = dispatch(this.forAdapter(projectedOptions, adapter))[Symbol.asyncIterator]();
			} catch (error) {
				yield adapterFailureChunk(error, options.signal);
				return;
			}
			let completed = false;
			try {
				while (true) {
					let item;
					try {
						const next = await iterator.next();
						item = next.done ? { done: true } : {
							done: false,
							value: next.value
						};
					} catch (error) {
						completed = true;
						yield adapterFailureChunk(error, options.signal);
						return;
					}
					if (item.done) {
						completed = true;
						return;
					}
					yield item.value;
				}
			} finally {
				if (!completed) {
					const close = iterator.return?.bind(iterator);
					if (close) await close();
				}
			}
		}
		/**
		* Stream one model call as raw chunks (token-level deltas). Replay state is
		* retained only when the same adapter instance owns its historical provider
		* and the target provider. Final adapter selection remains fixed through
		* asynchronous exact-model resolution and dispatch. Adapter selection,
		* dispatch, and iteration failures become terminal `error` or `aborted`
		* finish chunks; middleware, nested-call, cleanup, and consumer failures
		* remain thrown.
		* @param options - the full request; `options.provider` selects the adapter.
		* @returns the chunk stream, possibly wrapped by `llm/stream` listeners.
		*/
		stream(options) {
			return this.streamWithRegistration(options);
		}
		streamWithRegistration(options, prepared) {
			return this.ctx.waterfall(this, "llm/stream", options, () => this.adapterStream(options, prepared));
		}
	};
})();
/** Convert one adapter throw into the stream protocol's terminal outcome. */
function adapterFailureChunk(error, signal) {
	const failure = normalizeLlmFailure(error);
	return {
		type: "finish",
		reason: signal?.aborted || failure.code === "ABORTED" ? {
			kind: "aborted",
			failure
		} : {
			kind: "error",
			failure
		}
	};
}
/** Copy a directory entry, including its arrays, so neither side can mutate the other's copy. */
function detachDirectoryEntry(entry) {
	const { nativeAuth } = entry;
	return {
		...entry,
		settingsPath: [...entry.settingsPath],
		...entry.baseURLEnv === void 0 ? {} : { baseURLEnv: [...entry.baseURLEnv] },
		...nativeAuth === void 0 ? {} : { nativeAuth: {
			...nativeAuth,
			env: [...nativeAuth.env]
		} }
	};
}
// ../../node_modules/.pnpm/@deepseek-ai+dsh-tools@0.2._ceeb764d8cb1e23b7f781274d576533a/node_modules/@deepseek-ai/dsh-tools/lib/shared-DTdn5dXO.js
/** The selected provider is missing or unloaded; another provider must not take its calls. */
var ToolExecutorUnavailableError = class extends HarnessError {
	constructor() {
		super("The selected tool executor is unavailable. Load an executor in this composition before running the agent.", "TOOL_EXECUTOR_UNAVAILABLE");
		this.name = "ToolExecutorUnavailableError";
	}
};
/**
* Enforced JSON Schema subset shared by tool outputs, generated PTC mode
* types, subagents, and workflows. The subset accepts any JSON root, an
* annotation-only schema for unconstrained JSON, one scalar `type`, object
* `properties`/`required`/boolean `additionalProperties`, array `items`,
* type-correct scalar `enum`/`const`, and exact-one `oneOf`.
*
* Unsupported or misplaced keywords reject rather than being accepted without
* enforcement. Consumers that require an object root apply
* {@link assertObjectJsonSchema} before accepting input.
* @module dsh-tools/json-schema
*/
/**
* Thrown when a raw schema falls outside the enforced subset. `violations`
* lists every offending path instead of stopping at the first author error.
*/
var JsonSchemaError = class extends HarnessError {
	/** Individual schema violations in walk order. */
	violations;
	constructor(violations) {
		super(`unsupported JSON schema: ${violations.join("; ")}`, "UNSUPPORTED_SCHEMA");
		this.name = "JsonSchemaError";
		this.violations = violations;
	}
};
const CONSTRAINT_KEYWORDS = /* @__PURE__ */ new Set([
	"type",
	"oneOf",
	"properties",
	"required",
	"additionalProperties",
	"items",
	"enum",
	"const"
]);
const ANNOTATION_KEYWORDS = /* @__PURE__ */ new Set([
	"description",
	"title",
	"default",
	"examples"
]);
const SCHEMA_TYPES = [
	"object",
	"array",
	"string",
	"number",
	"integer",
	"boolean",
	"null"
];
/** Whether a realm-owned intrinsic prototype is backed by its native constructor. */
function hasIntrinsicConstructor(prototype, name) {
	const constructor = Object.getOwnPropertyDescriptor(prototype, "constructor")?.value;
	if (typeof constructor !== "function") return false;
	try {
		return constructor.name === name && constructor.prototype === prototype && Function.prototype.toString.call(constructor) === `function ${name}() { [native code] }`;
	} catch {
		return false;
	}
}
/** Whether a candidate is one realm's intrinsic `Object.prototype`. */
function isIntrinsicObjectPrototype(value) {
	return Object.getPrototypeOf(value) === null && hasIntrinsicConstructor(value, "Object");
}
/**
* Test for a realm-agnostic plain JSON record without accepting arrays or
* exotic objects.
* @param value - candidate record from any JavaScript realm.
* @returns Whether the value has a plain-object prototype chain.
*/
function isPlainJsonRecord(value) {
	if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
	try {
		const prototype = Object.getPrototypeOf(value);
		return prototype === null || typeof prototype === "object" && isIntrinsicObjectPrototype(prototype);
	} catch {
		return false;
	}
}
/** Whether an array uses one realm's intrinsic `Array.prototype`. */
function hasPlainArrayPrototype(value) {
	const prototype = Object.getPrototypeOf(value);
	if (!Array.isArray(prototype) || !hasIntrinsicConstructor(prototype, "Array")) return false;
	const objectPrototype = Object.getPrototypeOf(prototype);
	return typeof objectPrototype === "object" && objectPrototype !== null && isIntrinsicObjectPrototype(objectPrototype);
}
/** Return whether a record contains only own enumerable string keys. */
function hasOnlyEnumerableStringKeys(value) {
	try {
		return Reflect.ownKeys(value).every((key) => typeof key === "string" && Object.prototype.propertyIsEnumerable.call(value, key));
	} catch {
		return false;
	}
}
/**
* Test for an ordinary schema record whose keys survive JSON projection.
* @param value - candidate record from any JavaScript realm.
* @returns Whether the record has an intrinsic prototype and only own enumerable string keys.
*/
function isJsonSchemaRecord(value) {
	return isPlainJsonRecord(value) && hasOnlyEnumerableStringKeys(value);
}
/**
* Test for a dense ordinary array with no JSON-invisible decorations.
* @param value - candidate array from any JavaScript realm.
* @returns Whether the array is intrinsic, dense, and undecorated.
*/
function isPlainJsonArray(value) {
	if (!Array.isArray(value)) return false;
	try {
		if (!hasPlainArrayPrototype(value) || Reflect.ownKeys(value).length !== value.length + 1) return false;
		for (let index = 0; index < value.length; index++) if (!Object.hasOwn(value, index)) return false;
		return true;
	} catch {
		return false;
	}
}
/** Lossless finite JSON number, excluding negative zero. */
function isJsonNumber(value) {
	return typeof value === "number" && Number.isFinite(value) && !Object.is(value, -0);
}
/** Whether a scalar is valid for one declared schema type. */
function scalarMatches(type, value) {
	switch (type) {
		case "string": return typeof value === "string";
		case "number": return isJsonNumber(value);
		case "integer": return isJsonNumber(value) && Number.isInteger(value);
		case "boolean": return typeof value === "boolean";
		case "null": return value === null;
		/* v8 ignore next -- JsonSchemaScalarType is closed; this retains compile-time exhaustiveness. */
		default: return assertNever(type, "JsonSchemaType");
	}
}
/** Keywords that are invalid beside `oneOf`. */
const ONE_OF_SIBLING_KEYWORDS = [
	"properties",
	"required",
	"additionalProperties",
	"items",
	"enum",
	"const"
];
/** Validate object-only fields after its property schemas have been visited. */
function checkObjectSchemaTail(node, path, properties, violations) {
	const hasRequired = Object.hasOwn(node, "required");
	const required = hasRequired ? node.required : void 0;
	if (hasRequired) if (!isPlainJsonArray(required) || required.some((entry) => typeof entry !== "string")) violations.push(`${path}.required must be an array of strings`);
	else {
		const declared = isJsonSchemaRecord(properties) ? properties : {};
		for (const key of required) if (!Object.hasOwn(declared, key)) violations.push(`${path}.required names "${key}" which is not in properties`);
	}
	if (Object.hasOwn(node, "additionalProperties") && typeof node.additionalProperties !== "boolean") violations.push(`${path}.additionalProperties must be a boolean`);
}
/** Collect every violation for one raw schema tree without using the JavaScript call stack. */
function checkSchemaNode(root, rootPath, violations, seen) {
	const tasks = [{
		kind: "enter",
		node: root,
		path: rootPath
	}];
	for (let task = tasks.pop(); task !== void 0; task = tasks.pop()) {
		if (task.kind === "leave") {
			seen.delete(task.node);
			continue;
		}
		if (task.kind === "one-of-tail") {
			for (const key of ONE_OF_SIBLING_KEYWORDS) if (Object.hasOwn(task.node, key)) violations.push(`${task.path}.${key} is not supported beside oneOf`);
			continue;
		}
		if (task.kind === "object-tail") {
			checkObjectSchemaTail(task.node, task.path, task.properties, violations);
			continue;
		}
		const { node, path } = task;
		if (!isJsonSchemaRecord(node)) {
			violations.push(`${path} must be a schema object`);
			continue;
		}
		if (seen.has(node)) {
			violations.push(`${path} is circular`);
			continue;
		}
		seen.add(node);
		tasks.push({
			kind: "leave",
			node
		});
		for (const key of Object.keys(node)) {
			if (CONSTRAINT_KEYWORDS.has(key)) continue;
			if (ANNOTATION_KEYWORDS.has(key)) {
				try {
					if (!isJsonValue(node[key])) violations.push(`${path}.${key} annotation must be lossless JSON data`);
				} catch {
					violations.push(`${path}.${key} annotation must be lossless JSON data`);
				}
				continue;
			}
			violations.push(`${path}.${key} is not a supported keyword (subset: type/oneOf/properties/required/additionalProperties/items/enum/const + annotations)`);
		}
		if (Object.hasOwn(node, "description") && typeof node.description !== "string") violations.push(`${path}.description must be a string`);
		if (Object.hasOwn(node, "title") && typeof node.title !== "string") violations.push(`${path}.title must be a string`);
		const hasType = Object.hasOwn(node, "type");
		const hasOneOf = Object.hasOwn(node, "oneOf");
		if (hasType && hasOneOf) {
			violations.push(`${path} cannot declare both type and oneOf`);
			continue;
		}
		if (!hasType && !hasOneOf) {
			for (const key of ONE_OF_SIBLING_KEYWORDS) if (Object.hasOwn(node, key)) violations.push(`${path}.${key} requires type or oneOf`);
			continue;
		}
		if (hasOneOf) {
			const oneOf = node.oneOf;
			tasks.push({
				kind: "one-of-tail",
				node,
				path
			});
			if (!isPlainJsonArray(oneOf) || oneOf.length < 2) violations.push(`${path}.oneOf must be an array of at least two schemas`);
			else for (let index = oneOf.length - 1; index >= 0; index--) tasks.push({
				kind: "enter",
				node: oneOf[index],
				path: `${path}.oneOf[${index}]`
			});
			continue;
		}
		const type = node.type;
		if (typeof type !== "string" || !SCHEMA_TYPES.includes(type)) {
			violations.push(Array.isArray(type) ? `${path}.type must be a single type string (type arrays are not supported)` : `${path}.type must be one of ${SCHEMA_TYPES.join("/")}`);
			continue;
		}
		const schemaType = type;
		for (const [key, types] of Object.entries({
			properties: ["object"],
			required: ["object"],
			additionalProperties: ["object"],
			items: ["array"],
			enum: [
				"string",
				"number",
				"integer",
				"boolean",
				"null"
			],
			const: [
				"string",
				"number",
				"integer",
				"boolean",
				"null"
			]
		})) if (Object.hasOwn(node, key) && !types.includes(schemaType)) violations.push(`${path}.${key} is not supported on type "${schemaType}"`);
		switch (schemaType) {
			case "object": {
				const properties = Object.hasOwn(node, "properties") ? node.properties : void 0;
				tasks.push({
					kind: "object-tail",
					node,
					path,
					properties
				});
				if (Object.hasOwn(node, "properties")) if (!isJsonSchemaRecord(properties)) violations.push(`${path}.properties must be an object of schemas`);
				else {
					const entries = Object.entries(properties);
					for (let index = entries.length - 1; index >= 0; index--) {
						const entry = entries[index];
						/* v8 ignore next -- the loop is bounded by the captured entry count. */
						if (entry === void 0) continue;
						tasks.push({
							kind: "enter",
							node: entry[1],
							path: `${path}.properties.${entry[0]}`
						});
					}
				}
				break;
			}
			case "array":
				if (Object.hasOwn(node, "items")) tasks.push({
					kind: "enter",
					node: node.items,
					path: `${path}.items`
				});
				break;
			case "string":
			case "number":
			case "integer":
			case "boolean":
			case "null": {
				const hasEnum = Object.hasOwn(node, "enum");
				const allowed = hasEnum ? node.enum : void 0;
				const enumValid = isPlainJsonArray(allowed) && allowed.length > 0 && allowed.every((entry) => scalarMatches(schemaType, entry));
				if (hasEnum && !enumValid) violations.push(`${path}.enum must be a non-empty array of ${schemaType} values`);
				const hasConst = Object.hasOwn(node, "const");
				const declaredConst = hasConst ? node.const : void 0;
				const constValid = scalarMatches(schemaType, declaredConst);
				if (hasConst) {
					if (!constValid) violations.push(`${path}.const must be a ${schemaType} value`);
					else if (enumValid && !allowed.includes(declaredConst)) violations.push(`${path}.const must be one of ${path}.enum when both are declared`);
				}
				break;
			}
			/* v8 ignore next -- schemaType was narrowed from the closed SCHEMA_TYPES table above. */
			default: assertNever(schemaType, "JsonSchemaType");
		}
	}
}
/**
* Assert that an arbitrary raw schema uses only the enforced subset.
* Annotation-only schemas are accepted as the standard unconstrained-JSON
* form; callers that require an object root use {@link assertObjectJsonSchema}.
* @param schema - untrusted raw JSON Schema.
* @returns Assertion that the schema belongs to the supported subset.
*/
function assertSupportedJsonSchema(schema) {
	const violations = [];
	checkSchemaNode(schema, "schema", violations, /* @__PURE__ */ new Set());
	if (violations.length > 0) throw new JsonSchemaError(violations);
}
/** Safely test the lossless JSON boundary when a getter may throw. */
function safelyIsJsonValue(value) {
	try {
		return isJsonValue(value);
	} catch {
		return false;
	}
}
/** Root-aware diagnostic path for the parameter validator's empty sentinel. */
function diagnosticPath(path) {
	return path === "" ? "arguments" : path;
}
/** Append one object property without a leading dot at an implicit root. */
function propertyPath(path, key) {
	return path === "" ? key : `${path}.${key}`;
}
/** The generic exception-containment diagnostic owned by one valid schema node. */
function losslessValueViolation(path) {
	return [`"${diagnosticPath(path)}" must be a lossless JSON value`];
}
/** Append diagnostics without spreading a potentially wide child result as call arguments. */
function appendViolations(target, source) {
	for (const violation of source) target.push(violation);
}
/** Initialize one validation frame with empty aggregation state. */
function valueFrame(node, value, path) {
	return {
		node,
		value,
		path,
		catches: false,
		phase: "start",
		children: [],
		childIndex: 0,
		violations: [],
		tailViolations: [],
		matches: 0
	};
}
/** Validate one scalar node after its primitive type check. */
function checkScalarValue(node, value, path) {
	const allowed = Object.hasOwn(node, "enum") ? node.enum : void 0;
	if (allowed !== void 0 && !allowed.includes(value)) return [`"${diagnosticPath(path)}" must be one of ${JSON.stringify(allowed)}`];
	if (Object.hasOwn(node, "const") && value !== node.const) return [`"${diagnosticPath(path)}" must be ${JSON.stringify(node.const)}`];
	return [];
}
/** Validate one trusted schema/value pair with explicit frames rather than recursive calls. */
function checkValue(schema, value, path) {
	const frames = [valueFrame(schema, value, path)];
	let rootResult;
	const receive = (result) => {
		const parent = frames.at(-1);
		if (parent === void 0) {
			rootResult = result;
			return;
		}
		if (parent.kind === "oneOf") {
			if (result.length === 0) parent.matches++;
		} else appendViolations(parent.violations, result);
	};
	const finish = (result) => {
		frames.pop();
		receive(result);
	};
	while (frames.length > 0) {
		const frame = frames.at(-1);
		/* v8 ignore next -- the loop condition guarantees a current frame. */
		if (frame === void 0) break;
		try {
			if (frame.phase === "children") {
				if (frame.childIndex < frame.children.length) {
					const child = frame.children[frame.childIndex];
					/* v8 ignore next -- childIndex is bounded by children.length. */
					if (child === void 0) throw new Error("missing schema-value child frame");
					frame.childIndex++;
					frames.push(valueFrame(child.node, child.value, child.path));
					continue;
				}
				if (frame.kind === "oneOf") {
					finish(frame.matches === 1 ? [] : [`"${diagnosticPath(frame.path)}" must match exactly one oneOf branch (matched ${frame.matches})`]);
					continue;
				}
				appendViolations(frame.violations, frame.tailViolations);
				if (frame.violations.length > 0) finish(frame.violations);
				else if (frame.kind === "object") finish(safelyIsJsonValue(frame.value) ? [] : [`"${diagnosticPath(frame.path)}" must be a lossless JSON object`]);
				else finish(safelyIsJsonValue(frame.value) ? [] : [`"${diagnosticPath(frame.path)}" must be a dense lossless JSON array`]);
				continue;
			}
			const nodeType = Object.hasOwn(frame.node, "type") ? frame.node.type : void 0;
			frame.catches = !(nodeType !== void 0 && !SCHEMA_TYPES.includes(nodeType));
			const oneOf = Object.hasOwn(frame.node, "oneOf") ? frame.node.oneOf : void 0;
			if (oneOf !== void 0) {
				frame.kind = "oneOf";
				frame.children = Array.from(oneOf, (branch) => ({
					node: branch,
					value: frame.value,
					path: frame.path
				}));
				frame.childIndex = 0;
				frame.matches = 0;
				frame.phase = "children";
				continue;
			}
			if (nodeType === void 0) {
				finish(safelyIsJsonValue(frame.value) ? [] : losslessValueViolation(frame.path));
				continue;
			}
			switch (nodeType) {
				case "object": {
					if (!isPlainJsonRecord(frame.value)) {
						finish([`"${diagnosticPath(frame.path)}" must be an object`]);
						break;
					}
					const properties = Object.hasOwn(frame.node, "properties") ? frame.node.properties ?? {} : {};
					const violations = [];
					const required = Object.hasOwn(frame.node, "required") ? frame.node.required ?? [] : [];
					for (const key of required) if (!Object.hasOwn(frame.value, key) || frame.value[key] === void 0) violations.push(`missing required property "${propertyPath(frame.path, key)}"`);
					const children = [];
					for (const [key, child] of Object.entries(properties)) {
						if (!Object.hasOwn(frame.value, key) || frame.value[key] === void 0) continue;
						children.push({
							node: child,
							value: frame.value[key],
							path: propertyPath(frame.path, key)
						});
					}
					const tailViolations = [];
					if (Object.hasOwn(frame.node, "additionalProperties") && frame.node.additionalProperties === false) {
						for (const key of Object.keys(frame.value)) if (!Object.hasOwn(properties, key)) tailViolations.push(`"${propertyPath(frame.path, key)}" is not a declared property (additionalProperties: false)`);
					}
					frame.kind = "object";
					frame.children = children;
					frame.childIndex = 0;
					frame.violations = violations;
					frame.tailViolations = tailViolations;
					frame.phase = "children";
					break;
				}
				case "array": {
					if (!Array.isArray(frame.value)) {
						finish([`"${diagnosticPath(frame.path)}" must be an array`]);
						break;
					}
					const items = Object.hasOwn(frame.node, "items") ? frame.node.items : void 0;
					const children = items === void 0 ? [] : frame.value.flatMap((entry, index) => [{
						node: items,
						value: entry,
						path: `${frame.path}[${index}]`
					}]);
					frame.kind = "array";
					frame.children = children;
					frame.childIndex = 0;
					frame.violations = [];
					frame.phase = "children";
					break;
				}
				case "string":
					finish(typeof frame.value === "string" ? checkScalarValue(frame.node, frame.value, frame.path) : [`"${diagnosticPath(frame.path)}" must be a string`]);
					break;
				case "number":
					finish(typeof frame.value !== "number" ? [`"${diagnosticPath(frame.path)}" must be a number`] : !isJsonNumber(frame.value) ? [`"${diagnosticPath(frame.path)}" must be a finite JSON number`] : checkScalarValue(frame.node, frame.value, frame.path));
					break;
				case "integer":
					finish(!isJsonNumber(frame.value) || !Number.isInteger(frame.value) ? [`"${diagnosticPath(frame.path)}" must be an integer`] : checkScalarValue(frame.node, frame.value, frame.path));
					break;
				case "boolean":
					finish(typeof frame.value === "boolean" ? checkScalarValue(frame.node, frame.value, frame.path) : [`"${diagnosticPath(frame.path)}" must be a boolean`]);
					break;
				case "null":
					finish(frame.value === null ? checkScalarValue(frame.node, frame.value, frame.path) : [`"${diagnosticPath(frame.path)}" must be null`]);
					break;
				default: finish(assertNever(nodeType, "JsonSchemaType"));
			}
		} catch (error) {
			let failed = frames.pop();
			while (failed !== void 0 && !failed.catches) failed = frames.pop();
			if (failed === void 0) throw error;
			receive(losslessValueViolation(failed.path));
		}
	}
	/* v8 ignore next -- every root frame finishes or throws. */
	return rootResult ?? losslessValueViolation(path);
}
/**
* Validate a candidate value against an asserted raw schema. The function is
* total for arbitrary values and returns path-qualified violations.
* @param schema - a schema accepted by {@link assertSupportedJsonSchema}.
* @param value - the candidate JSON value.
* @param path - root label used in diagnostics.
* @returns All violations in walk order; empty means valid.
*/
function validateJsonSchemaValue(schema, value, path = "value") {
	return checkValue(schema, value, path);
}
/** Tool definitions and invocation data shared by registries and executors. @module */
/** Reserved model-facing program transport name. */
const RUN_CODE_NAME = "run_code";
/** Failure to determine a tool's step-time availability. */
var ToolActivationError = class extends HarnessError {
	/**
	* Preserve a condition failure without treating it as normal unavailability.
	* @param name - tool whose condition rejected.
	* @param cause - underlying condition failure.
	*/
	constructor(name, cause) {
		super(`cannot resolve availability of tool "${name}"`, "TOOL_ACTIVATION_FAILED", { cause });
		this.name = "ToolActivationError";
	}
};
// ../../node_modules/.pnpm/@deepseek-ai+dsh-scope@0.2._3b2754c39dde454a0a645a8ace687f63/node_modules/@deepseek-ai/dsh-scope/lib/index.js
/**
* Shared insertion-ordered storage and effect ownership for scope-aware registries.
*
* @module @deepseek-ai/dsh-scope
*/
/**
* Insertion-ordered named entries with caller-owned duplicate diagnostics.
*
* Values are borrowed. Iterators are live within one nonempty table
* generation; draining the table detaches them from later insertions. Each
* successful insertion returns an idempotent undo for that exact entry.
*/
var NamedEntries = class {
	duplicateError;
	data = /* @__PURE__ */ new Map();
	constructor(duplicateError) {
		this.duplicateError = duplicateError;
	}
	/**
	* Insert one unique name.
	* @param name - name unique within this table.
	* @param value - borrowed value to retain.
	* @returns an idempotent undo that removes only this insertion.
	*/
	insert(name, value) {
		const data = this.data;
		if (data.has(name)) throw this.duplicateError(name);
		data.set(name, value);
		let active = true;
		return () => {
			if (!active) return;
			active = false;
			data.delete(name);
			if (data.size === 0 && this.data === data) this.data = /* @__PURE__ */ new Map();
		};
	}
	/**
	* Read one named value.
	* @param name - name to resolve.
	* @returns the retained value, or `undefined` when absent.
	*/
	get(name) {
		return this.data.get(name);
	}
	/**
	* Test one name for membership.
	* @param name - name to test.
	* @returns whether the table contains that name.
	*/
	has(name) {
		return this.data.has(name);
	}
	/**
	* Iterate live names in insertion order.
	* @returns the native live key iterator.
	*/
	keys() {
		return this.data.keys();
	}
	/**
	* Iterate live entries in insertion order.
	* @returns the native live entry iterator.
	*/
	entries() {
		return this.data.entries();
	}
	/**
	* Iterate live values in insertion order.
	* @returns the native live value iterator.
	*/
	values() {
		return this.data.values();
	}
	/**
	* Test whether this table has no entries.
	* @returns whether the table is empty.
	*/
	isEmpty() {
		return this.data.size === 0;
	}
};
/**
* Insertion-ordered anonymous entries with independent registration identity.
*
* Equal values remain separate registrations. Values are borrowed, and
* iterators are live within one nonempty table generation; draining the table
* detaches them from later appends.
*/
var AnonymousEntries = class {
	data = /* @__PURE__ */ new Map();
	/**
	* Append one independently owned value.
	* @param value - borrowed value to retain.
	* @returns an idempotent undo for this exact append.
	*/
	append(value) {
		const data = this.data;
		const key = Symbol();
		data.set(key, value);
		let active = true;
		return () => {
			if (!active) return;
			active = false;
			data.delete(key);
			if (data.size === 0 && this.data === data) this.data = /* @__PURE__ */ new Map();
		};
	}
	/**
	* Iterate live values in insertion order.
	* @returns the native live value iterator.
	*/
	values() {
		return this.data.values();
	}
	/**
	* Test whether this table has no entries.
	* @returns whether the table is empty.
	*/
	isEmpty() {
		return this.data.size === 0;
	}
};
/**
* Own the global and exact-scope layers for one registry.
*
* Reads never create scoped layers. Registrations derive both visibility and
* effect ownership from the supplied Cordis context, collect undo before
* notification, and reclaim only a completely empty aggregate layer.
*/
var ScopedLayers = class {
	createLayer;
	onChange;
	/** The eagerly constructed context-global layer. */
	global;
	scoped = /* @__PURE__ */ new Map();
	constructor(createLayer, onChange) {
		this.createLayer = createLayer;
		this.onChange = onChange;
		this.global = createLayer(void 0);
	}
	/**
	* Read an existing exact-scope overlay. Deliberately chain-blind: callers
	* addressing one scope's OWN contributions (its restrictions, its guards)
	* must not silently pick up an ancestor's — use {@link chainLayers} where
	* inheritance is the point.
	* @param scope - exact scope key; `undefined` denotes no overlay.
	* @returns the existing scoped layer, or `undefined` without creating one.
	*/
	peek(scope) {
		if (scope === void 0) return void 0;
		return this.scoped.get(scope);
	}
	/**
	* Existing overlays along the scope's parent chain ({@link scopeChainOf}),
	* farthest ancestor first and the exact scope last, so a caller layering
	* them in order gives the nearest scope the final word.
	* @param scope - viewing scope, or `undefined` for no overlays.
	* @returns the existing layers, nearest last; absent overlays are skipped.
	*/
	chainLayers(scope) {
		const layers = [];
		for (const key of scopeChainOf(scope).reverse()) {
			const layer = this.scoped.get(key);
			if (layer !== void 0) layers.push(layer);
		}
		return layers;
	}
	/**
	* Materialize global named entries followed by scope-chain shadows,
	* farthest ancestor first, so the nearest scope's entry wins a name.
	* @param scope - viewing scope, or `undefined` for the global view.
	* @param pick - select the named table from a layer.
	* @returns an insertion-ordered effective map.
	*/
	merge(scope, pick) {
		const merged = new Map(pick(this.global).entries());
		for (const layer of this.chainLayers(scope)) for (const [name, value] of pick(layer).entries()) merged.set(name, value);
		return merged;
	}
	/**
	* Attach one synchronous layer mutation to its registration context.
	* @param ctx - context that determines both scope visibility and effect ownership.
	* @param action - atomic mutation returning its synchronous undo.
	* @param options - Cordis effect label and optional change notification.
	* @returns the exact disposer returned by `ctx.effect()`.
	*/
	effect(ctx, action, options) {
		const scope = scopeOf(ctx);
		const notify = options.notify ?? true;
		return ctx.effect(function* () {
			let layer;
			let created = false;
			if (scope === void 0) layer = this.global;
			else {
				const existing = this.scoped.get(scope);
				if (existing === void 0) {
					layer = this.createLayer(scope);
					this.scoped.set(scope, layer);
					created = true;
				} else layer = existing;
			}
			let undo;
			try {
				undo = action(layer);
			} catch (error) {
				if (scope !== void 0 && created && layer.isEmpty()) this.scoped.delete(scope);
				throw error;
			}
			yield () => {
				undo();
				if (scope !== void 0 && layer.isEmpty()) this.scoped.delete(scope);
				if (notify) this.onChange();
			};
			if (notify) this.onChange();
		}.bind(this), options.label);
	}
};
/**
* Scoped-context primitive: mint a Cordis context that tags registrations with
* an opaque identity and build routing-only event carriers for that identity.
*
* @module @deepseek-ai/dsh-scope
*/
/** Context tag written by {@link createScope}. */
const kScope = Symbol("dsh.scope");
/**
* The enclosing scope of each key. One relation powers both directions of
* scope nesting: registration views inherit DOWN the chain (a child scope
* sees its ancestors' layers — {@link ScopedLayers}), and event admission
* extends UP it (a listener tagged with an ancestor receives events dispatched
* to a descendant key — {@link scopeTarget}).
*/
const scopeParents = /* @__PURE__ */ new WeakMap();
/**
* The chain from a key to its root ancestor.
* @param key - the starting key, or `undefined` for the empty chain.
* @returns keys nearest-first: `[key, parent, grandparent, …]`.
*/
function scopeChainOf(key) {
	const chain = [];
	for (let cursor = key; cursor !== void 0; cursor = scopeParents.get(cursor)) chain.push(cursor);
	return chain;
}
/**
* Read the nearest scope tag inherited by a context.
* @param ctx - context to inspect.
* @returns its scope key, or `undefined` for an unscoped context.
*/
function scopeOf(ctx) {
	return ctx[kScope];
}
// ../../node_modules/.pnpm/@deepseek-ai+dsh-tools@0.2._ceeb764d8cb1e23b7f781274d576533a/node_modules/@deepseek-ai/dsh-tools/lib/index.js
/** Unified JSON-value schema DSL, inference, compilation, and tool definition helpers. @module dsh-tools/schema */
const ANNOTATION_KEYS = [
	"description",
	"title",
	"default",
	"examples"
];
/** Throw one author-schema violation through the shared schema error type. */
function authorError(message) {
	throw new JsonSchemaError([message]);
}
/** Copy own annotation fields for validation by the raw-schema boundary. */
function copyAnnotations(source, target) {
	if (Object.hasOwn(source, "description")) target.description = source.description;
	if (Object.hasOwn(source, "title")) target.title = source.title;
	if (Object.hasOwn(source, "default")) target.default = source.default;
	if (Object.hasOwn(source, "examples")) target.examples = source.examples;
}
/** Reject author-only keys outside one node's declared vocabulary. */
function assertAuthorKeys(source, path, allowed) {
	for (const key of Object.keys(source)) if (!allowed.includes(key)) authorError(`${path}.${key} is not supported by the value schema DSL`);
}
/** Install a compiled node without giving `__proto__` assignment semantics. */
function assignCompiledNode(destination, node) {
	switch (destination.kind) {
		case "root":
			destination.holder.value = node;
			break;
		case "property":
			Object.defineProperty(destination.target, destination.key, {
				value: node,
				enumerable: true,
				configurable: true,
				writable: true
			});
			break;
		case "item":
			destination.target.items = node;
			break;
		case "one-of": destination.target[destination.index] = node;
	}
}
/** Install a compiled property map at its root or containing object node. */
function assignCompiledPropertyMap(destination, compiled) {
	if (destination.kind === "root") destination.holder.value = compiled;
	else destination.target.properties = compiled.properties;
}
/** Execute an author-schema compilation task graph without recursive descent. */
function runSchemaCompiler(initial) {
	const seen = /* @__PURE__ */ new Set();
	const tasks = [initial];
	for (let task = tasks.pop(); task !== void 0; task = tasks.pop()) {
		if (task.kind === "leave") {
			seen.delete(task.input);
			continue;
		}
		if (task.kind === "property-map-tail") {
			if (task.required.length > 0) {
				task.compiled.required = task.required;
				if (task.destination.kind === "object") task.destination.target.required = task.required;
			}
			continue;
		}
		if (task.kind === "property") {
			if (!isJsonSchemaRecord(task.property)) authorError(`${task.path} must be a value schema object`);
			if (Object.hasOwn(task.property, "required") && task.property.required !== true) authorError(`${task.path}.required must be true when present`);
			if (Object.hasOwn(task.property, "required") && task.property.required === true) task.required.push(task.key);
			tasks.push({
				kind: "value",
				input: task.property,
				path: task.path,
				allowRequired: true,
				destination: {
					kind: "property",
					target: task.properties,
					key: task.key
				}
			});
			continue;
		}
		if (task.kind === "property-map") {
			if (!isJsonSchemaRecord(task.input)) authorError(`${task.path} must be an object of value schemas`);
			if (seen.has(task.input)) authorError(`${task.path} is circular`);
			seen.add(task.input);
			const compiled = { properties: {} };
			const required = [];
			assignCompiledPropertyMap(task.destination, compiled);
			tasks.push({
				kind: "leave",
				input: task.input
			});
			tasks.push({
				kind: "property-map-tail",
				compiled,
				required,
				destination: task.destination
			});
			const entries = Object.entries(task.input);
			for (let index = entries.length - 1; index >= 0; index--) {
				const entry = entries[index];
				/* v8 ignore next -- the loop is bounded by the captured entry count. */
				if (entry === void 0) continue;
				tasks.push({
					kind: "property",
					property: entry[1],
					path: `${task.path}.${entry[0]}`,
					key: entry[0],
					properties: compiled.properties,
					required
				});
			}
			continue;
		}
		const { input, path } = task;
		if (!isJsonSchemaRecord(input)) authorError(`${path} must be a value schema object`);
		if (seen.has(input)) authorError(`${path} is circular`);
		seen.add(input);
		const authorKeys = [...ANNOTATION_KEYS, ...task.allowRequired ? ["required"] : []];
		const node = {};
		assignCompiledNode(task.destination, node);
		tasks.push({
			kind: "leave",
			input
		});
		if (Object.hasOwn(input, "oneOf")) {
			assertAuthorKeys(input, path, [
				...authorKeys,
				"oneOf",
				"type"
			]);
			if (Object.hasOwn(input, "type")) authorError(`${path} cannot declare both type and oneOf`);
			if (!isPlainJsonArray(input.oneOf)) authorError(`${path}.oneOf must be an array of at least two value schemas`);
			const branches = [];
			node.oneOf = branches;
			copyAnnotations(input, node);
			for (let index = input.oneOf.length - 1; index >= 0; index--) tasks.push({
				kind: "value",
				input: input.oneOf[index],
				path: `${path}.oneOf[${index}]`,
				allowRequired: false,
				destination: {
					kind: "one-of",
					target: branches,
					index
				}
			});
			continue;
		}
		const inputType = Object.hasOwn(input, "type") ? input.type : void 0;
		switch (inputType) {
			case "json":
				assertAuthorKeys(input, path, [...authorKeys, "type"]);
				copyAnnotations(input, node);
				break;
			case "object":
				assertAuthorKeys(input, path, [
					...authorKeys,
					"type",
					"properties",
					"additionalProperties"
				]);
				if (!Object.hasOwn(input, "additionalProperties") || typeof input.additionalProperties !== "boolean") authorError(`${path}.additionalProperties must be explicitly true or false`);
				node.type = "object";
				copyAnnotations(input, node);
				node.additionalProperties = input.additionalProperties;
				if (Object.hasOwn(input, "properties")) tasks.push({
					kind: "property-map",
					input: input.properties,
					path: `${path}.properties`,
					destination: {
						kind: "object",
						target: node
					}
				});
				break;
			case "array":
				assertAuthorKeys(input, path, [
					...authorKeys,
					"type",
					"items"
				]);
				node.type = "array";
				copyAnnotations(input, node);
				if (Object.hasOwn(input, "items")) tasks.push({
					kind: "value",
					input: input.items,
					path: `${path}.items`,
					allowRequired: false,
					destination: {
						kind: "item",
						target: node
					}
				});
				break;
			case "string":
			case "number":
			case "integer":
			case "boolean":
			case "null":
				assertAuthorKeys(input, path, [
					...authorKeys,
					"type",
					"enum",
					"const"
				]);
				node.type = inputType;
				copyAnnotations(input, node);
				if (Object.hasOwn(input, "enum")) {
					if (!isPlainJsonArray(input.enum)) authorError(`${path}.enum must be a non-empty array of scalar values`);
					node.enum = Array.from(input.enum, (entry) => entry);
				}
				if (Object.hasOwn(input, "const")) node.const = input.const;
				break;
			default: authorError(`${path}.type must be string/number/integer/boolean/null/array/object/json, or use oneOf`);
		}
	}
}
/** Compile one implicit property map, collecting per-property requiredness. */
function compilePropertyMap(input, path) {
	const holder = {};
	runSchemaCompiler({
		kind: "property-map",
		input,
		path,
		destination: {
			kind: "root",
			holder
		}
	});
	/* v8 ignore next -- the root task assigns before scheduling any descendants. */
	return holder.value ?? authorError(`${path} did not compile`);
}
/** Compile one author node without applying any consumer root restriction. */
function compileValueSchema(input, path) {
	const holder = {};
	runSchemaCompiler({
		kind: "value",
		input,
		path,
		allowRequired: false,
		destination: {
			kind: "root",
			holder
		}
	});
	/* v8 ignore next -- the root task assigns before scheduling any descendants. */
	return holder.value ?? authorError(`${path} did not compile`);
}
/**
* Compile one author-facing value schema to the enforced raw JSON Schema
* subset. The author-only `json` node becomes an annotation-only schema.
* @param spec - schema for any JSON-value root.
* @returns The asserted raw schema projection.
*/
function valueSchemaSpecToJsonSchema(spec) {
	const schema = compileValueSchema(spec, "schema");
	assertSupportedJsonSchema(schema);
	return schema;
}
/**
* Compile the implicit open parameter object into raw JSON Schema.
* @param spec - per-property parameter definitions.
* @returns An object-rooted raw schema with no implicit-root openness override.
*/
function parameterSchemaSpecToJsonSchema(spec) {
	const compiled = compilePropertyMap(spec, "parameters");
	const schema = {
		type: "object",
		properties: compiled.properties,
		...compiled.required === void 0 ? {} : { required: compiled.required }
	};
	assertSupportedJsonSchema(schema);
	return schema;
}
/** Invalid model-generated arguments for a typed tool. */
var ToolArgsError = class extends HarnessError {
	/** Individual violations in schema-walk order. */
	violations;
	constructor(violations) {
		super(`invalid arguments: ${violations.join("; ")}`, "INVALID_ARGS");
		this.name = "ToolArgsError";
		this.violations = violations;
	}
};
/**
* Define a first-party tool with inferred arguments and strict execution
* validation. Replay-only presenters validate softly and fall back to generic
* rendering for obsolete logged arguments.
* @param options - typed definition and optional finalizer and presenters.
* @returns A registry-ready definition.
*/
function defineTool(options) {
	const userExecute = options.execute;
	const userFinalizeContent = options.finalizeContent;
	const userProjectContent = options.projectContent;
	const userRender = options.output.render;
	const userPresentationMeta = options.output.presentationMeta;
	const userPresentCall = options.presentCall;
	const userPresentResult = options.presentResult;
	const userIsConcurrencySafe = options.isConcurrencySafe;
	if (options.timeoutMs !== void 0 && (!Number.isFinite(options.timeoutMs) || options.timeoutMs <= 0)) throw new Error(`defineTool(${options.name}): timeoutMs must be a positive finite number`);
	const parameters = parameterSchemaSpecToJsonSchema(options.parameters);
	const outputSchema = valueSchemaSpecToJsonSchema(options.output.schema);
	const validate = (args) => validateJsonSchemaValue(parameters, args, "");
	const tool = {
		name: options.name,
		description: options.description,
		parameters,
		output: {
			schema: outputSchema,
			render(args, value) {
				return userRender(args, value);
			},
			...userPresentationMeta !== void 0 ? { presentationMeta(args, value) {
				return userPresentationMeta(args, value);
			} } : {}
		},
		...options.deferLoading === true ? { deferLoading: options.deferLoading } : {},
		...options.timeoutMs !== void 0 ? { timeoutMs: options.timeoutMs } : {},
		async execute(args, exec) {
			const violations = validate(args);
			if (violations.length > 0) throw new ToolArgsError(violations);
			return userExecute(args, exec);
		}
	};
	if (userProjectContent) tool.projectContent = (exec, result) => userProjectContent(exec, result);
	if (userFinalizeContent) tool.finalizeContent = (exec, result) => userFinalizeContent(exec, result);
	if (userPresentCall) tool.presentCall = (args) => {
		if (validate(args).length > 0) return void 0;
		return userPresentCall(args);
	};
	if (userPresentResult) tool.presentResult = (args, result) => {
		if (validate(args).length > 0) return void 0;
		return userPresentResult(args, result);
	};
	if (userIsConcurrencySafe) tool.isConcurrencySafe = (args) => {
		if (validate(args).length > 0) return false;
		return userIsConcurrencySafe(args);
	};
	return tool;
}
/**
* Omit execution and presentation callbacks from a tool definition.
* @param definition - visible capability or executor-owned transport.
* @param detachParameters - copy parameters for a caller-owned inspection result.
* @returns the model-facing schema fields.
*/
function projectToolSchema(definition, detachParameters) {
	const { name, description, parameters, deferLoading } = definition;
	const detached = detachParameters ? snapshotJsonValue(parameters) : parameters;
	if (detached === void 0) throw new Error(`tool "${name}" parameters must be lossless JSON before schema projection`);
	return {
		name,
		description,
		parameters: detached,
		...deferLoading === true ? { deferLoading } : {}
	};
}
/** Tool definitions and scoped dispatch to plugin-owned executors. @module */
/** One scope's complete tool-registry contribution. */
var ToolLayer = class {
	tools;
	restrictions = new AnonymousEntries();
	constructor(scope) {
		this.tools = new NamedEntries((name) => /* @__PURE__ */ new Error(scope === void 0 ? `tool "${name}" is already registered (for a per-agent variant, register through that agent's \`agent.ctx\` instead)` : `tool "${name}" is already registered in this scope`));
	}
	/** Whether every contribution table in this aggregate layer is empty. */
	isEmpty() {
		return this.tools.isEmpty() && this.restrictions.isEmpty();
	}
	/** Whether every compiled restriction in this layer admits a global tool name. */
	admits(name) {
		for (const filter of this.restrictions.values()) if (filter.allow !== void 0 && !filter.allow.has(name) || filter.deny !== void 0 && filter.deny.has(name)) return false;
		return true;
	}
};
var GuardLayer = class {
	guards = new AnonymousEntries();
	isEmpty() {
		return this.guards.isEmpty();
	}
};
/** Concrete tool registry and scoped executor dispatcher. */
var ToolsService = class extends Service {
	static inject = ["systemPrompt"];
	static Config = z.object({
		mode: z.never().description("Removed. Mount a native or PTC tool executor instead."),
		maxParallelSubCalls: z.never().description("Moved to the PTC tool executor configuration.")
	});
	layers = new ScopedLayers((scope) => new ToolLayer(scope), () => {
		this.ctx.emit("tools/change");
	});
	scoped = /* @__PURE__ */ new WeakMap();
	root;
	guards = new ScopedLayers(() => new GuardLayer(), () => {});
	constructor(ctx) {
		super(ctx, "tools");
		ctx.systemPrompt.tools(({ scope, toolSet }) => {
			const description = this.selectExecutor(scope).describe(this.definitions(scope, toolSet));
			return {
				...description,
				knownNames: description.knownNames ?? [...this.view(scope).knownNames]
			};
		});
	}
	/**
	* Register globally or in the calling agent scope. Scoped tools shadow
	* globals; duplicates within one layer and the reserved `run_code` name fail.
	* @param definition - tool schema, execution, and optional finalization/presentation callbacks.
	* @param options - optional step-time activation condition.
	* @returns the exact disposer that unregisters the tool.
	*/
	register(definition, options = {}) {
		const name = definition.name;
		const output = definition.output;
		if (output === void 0 || typeof output !== "object" || typeof output.render !== "function" || output.presentationMeta !== void 0 && typeof output.presentationMeta !== "function") throw new TypeError(`tool "${name}" must declare output { schema, render, presentationMeta? }`);
		assertSupportedJsonSchema(output.schema);
		const timeoutMs = definition.timeoutMs;
		if (timeoutMs !== void 0 && (!Number.isFinite(timeoutMs) || timeoutMs <= 0)) throw new TypeError(`tool "${name}" timeoutMs must be a positive finite number`);
		if (name === "run_code") throw new Error(`tool name "${RUN_CODE_NAME}" is reserved for the PTC mode presentation transport and cannot be registered or shadowed`);
		return this.layers.effect(this.ctx, (layer) => layer.tools.insert(name, {
			definition,
			when: options.when
		}), { label: "tools.register()" });
	}
	/**
	* Restrict global tools for the calling agent scope. Empty filters, unknown
	* names, scope-local names, and reserved transport names fail. Restrictions
	* intersect; scoped registrations remain visible.
	* @param filter - global-tool mask: `allow` (keep only) and/or `deny` (remove).
	* @returns the exact disposer that lifts this restriction.
	*/
	restrict(filter) {
		const scope = scopeOf(this.ctx);
		if (scope === void 0) throw new Error("tools.restrict() requires a scoped context (agent.ctx): a context-global restriction would mask every agent — deny the tool for the intended agent instead");
		const allow = filter.allow;
		const deny = filter.deny;
		if (allow === void 0 && deny === void 0) throw new Error("tools.restrict({}) is a no-op: pass `allow` and/or `deny` (an empty filter is almost always a materialized-empty-config bug)");
		const compiled = {
			...allow !== void 0 ? { allow: new Set(allow) } : {},
			...deny !== void 0 ? { deny: new Set(deny) } : {}
		};
		if ([...allow ?? [], ...deny ?? []].includes("run_code")) throw new Error(`tools.restrict() cannot name reserved PTC mode presentation transport "${RUN_CODE_NAME}"; restrict end-capability tools instead`);
		const known = this.view(scope).restrictableNames;
		const unknown = [...allow ?? [], ...deny ?? []].filter((name) => !known.has(name));
		if (unknown.length > 0) throw new Error(`tools.restrict() names unknown global tool${unknown.length > 1 ? "s" : ""} ${unknown.map((n) => `"${n}"`).join(", ")}; known global tools: ${[...known].sort().join(", ") || "(none)"}`);
		return this.layers.effect(this.ctx, (layer) => layer.restrictions.append(compiled), { label: "tools.restrict()" });
	}
	/**
	* Resolve visible tools and pre-restriction names. Restrictions across the
	* scope chain intersect over inherited global and ancestor tools; the viewing
	* scope's own registrations remain exempt. Nearer registrations shadow
	* farther ones. Pre-restriction names support restriction and prompt-order validation.
	* @param scope - the viewing scope (the agent), or undefined for the global view.
	* @returns the complete derived view for that scope.
	*/
	view(scope) {
		const layers = this.layers.chainLayers(scope);
		const own = this.layers.peek(scope);
		const inherited = new Map(this.layers.global.tools.entries());
		for (const layer of layers) {
			if (layer === own) continue;
			for (const [name, registration] of layer.tools.entries()) inherited.set(name, registration);
		}
		const visible = /* @__PURE__ */ new Map();
		const registrations = /* @__PURE__ */ new Map();
		const knownNames = /* @__PURE__ */ new Set();
		const restrictableNames = /* @__PURE__ */ new Set();
		for (const [name, registration] of inherited) {
			knownNames.add(name);
			restrictableNames.add(name);
			if (layers.every((layer) => layer.admits(name))) {
				visible.set(name, registration.definition);
				registrations.set(name, registration);
			}
		}
		if (own !== void 0) for (const [name, registration] of own.tools.entries()) {
			knownNames.add(name);
			visible.set(name, registration.definition);
			registrations.set(name, registration);
		}
		return {
			visible,
			registrations,
			knownNames,
			restrictableNames
		};
	}
	/**
	* Look up a tool as one scope sees it (scoped
	* shadows global; a restricted-away global reads as absent). Presenters pass
	* the calling agent so the rendered card matches the definition that
	* actually executed.
	* @param name - the tool name as registered.
	* @param scope - the viewing scope (the agent); omitted = the global view.
	* @param toolSet - step admission; omit only to inspect registered definitions.
	* @returns the definition the scope resolves, or undefined when none is visible.
	*/
	get(name, scope, toolSet) {
		return toolSet === void 0 ? this.view(scope).visible.get(name) : toolSet.view(scope).get(name);
	}
	/**
	* Resolve the definition a call may execute. With a step's admitted set, the
	* set decides; without one, conditional registrations are unavailable.
	* @param name - the tool name as registered.
	* @param scope - the calling agent; omitted = the global view.
	* @param toolSet - step admission, or omitted for a call outside a model step.
	* @returns the executable definition, or undefined when the call must fail as `UNKNOWN_TOOL`.
	*/
	executable(name, scope, toolSet) {
		if (toolSet !== void 0) return toolSet.view(scope).get(name);
		const view = this.view(scope);
		return view.registrations.get(name)?.when === void 0 ? view.visible.get(name) : void 0;
	}
	/**
	* Resolve conditions once for this step without changing shared registrations.
	* Cancellation or a rejected condition publishes no partial selection. Removed
	* registrations cannot be restored by a late condition result.
	* @param context - preparing agent, captured model selection, and cancellation.
	* @returns the complete selection; the caller disposes it after its tool batch settles.
	*/
	async resolve(context) {
		const { agent, signal } = context;
		signal.throwIfAborted();
		const view = this.view(agent);
		const admitted = /* @__PURE__ */ new Map();
		for (const [name, definition] of view.visible) {
			const registration = view.registrations.get(name);
			let enabled;
			try {
				enabled = registration?.when === void 0 || await registration.when(context);
			} catch (cause) {
				signal.throwIfAborted();
				throw new ToolActivationError(name, cause);
			}
			signal.throwIfAborted();
			if (enabled) admitted.set(name, definition);
		}
		let closed = false;
		return Object.freeze({
			dispose: () => {
				closed = true;
			},
			view: (scope) => {
				const visible = /* @__PURE__ */ new Map();
				if (closed || scope !== agent) return visible;
				const current = this.view(agent);
				for (const [name, definition] of admitted) if (current.visible.get(name) === definition && current.registrations.get(name) === view.registrations.get(name)) visible.set(name, definition);
				return visible;
			}
		});
	}
	/**
	* Read the visible capability definitions for descriptions and program bindings.
	* @param scope - viewing Agent or preset; omitted selects the global view.
	* @param toolSet - step admission; omit only to inspect registered definitions.
	* @returns definitions after scoped shadowing and restrictions, limited to the step's admission when given.
	*/
	definitions(scope, toolSet) {
		return toolSet === void 0 ? [...this.view(scope).visible.values()] : [...toolSet.view(scope).values()];
	}
	/**
	* Project visible definitions onto the allowlisted model-facing schema fields,
	* excluding execution and presentation callbacks.
	* @param scope - the viewing scope (the agent); omitted = the global view.
	* @param toolSet - step admission, or omitted for registered-definition inspection.
	* @returns one deep-cloned schema per visible tool.
	*/
	schemas(scope, toolSet) {
		return this.definitions(scope, toolSet).map((definition) => projectToolSchema(definition, true));
	}
	/**
	* Provide the executor for the calling scope; an unscoped contribution is the deployment default.
	* Rendering any executor-owned section requires the viewing scope's selection to remain available.
	* @param executor - initialized provider owned by the contributing plugin.
	* @returns the effect disposer. Unloading leaves the selection unavailable until it is replaced.
	*/
	setExecutor(executor) {
		const scope = scopeOf(this.ctx);
		if ((scope === void 0 ? this.root : this.scoped.get(scope))?.executor !== void 0) throw new Error("Only one tool executor may be registered in each scope");
		const record = { executor };
		return this.ctx.effect(function* () {
			for (const section of executor.sections ?? []) yield this.ctx.systemPrompt.section({
				name: section.name,
				order: section.order,
				...section.interpolate === void 0 ? {} : { interpolate: section.interpolate },
				text: ({ scope, toolSet }) => {
					if (this.selectExecutor(scope) !== executor) return "";
					return typeof section.text === "function" ? section.text(this.definitions(scope, toolSet)) : section.text;
				}
			});
			if (scope === void 0) this.root = record;
			else this.scoped.set(scope, record);
			yield () => {
				record.executor = void 0;
			};
		}.bind(this), "tools.setExecutor()");
	}
	/**
	* Resolve the nearest scoped provider, or the deployment default.
	* @param scope - Agent or preset scope; omitted selects only the root contribution.
	* @returns the selected executor; throws when it is missing or unloaded.
	*/
	selectExecutor(scope) {
		let record;
		for (const key of scopeChainOf(scope)) {
			record = this.scoped.get(key);
			if (record !== void 0) break;
		}
		record ??= this.root;
		const executor = record?.executor;
		if (executor === void 0) throw new ToolExecutorUnavailableError();
		return executor;
	}
	/**
	* Delegate a raw call batch to its Agent's provider or the deployment default.
	* Select at dispatch; accepted batches settle through that provider even if it unloads.
	* @param input - original calls, optional owning Agent, and optional logging step.
	* @returns the selected executor's settled batch; unavailable selections reject.
	*/
	async execute(input) {
		return this.selectExecutor(input.agent).execute(input);
	}
	/**
	* Register a monotonic denial in the calling scope.
	* @param guard - evaluated after extensible pre-execute policy by the shared pipeline.
	* @returns the effect disposer that removes this guard.
	*/
	guard(guard) {
		return this.guards.effect(this.ctx, (layer) => layer.guards.append(guard), { label: "tools.guard()" });
	}
	/**
	* Check global and inherited guards after pre-execute policy and approval resolve.
	* @param exec - invocation whose guards are checked before dispatch.
	* @returns the first denial reason, or undefined when no guard denies.
	*/
	checkGuards(exec) {
		for (const layer of [this.guards.global, ...this.guards.chainLayers(exec.agent)]) for (const guard of layer.guards.values()) {
			const reason = guard(exec);
			if (reason !== void 0) return reason;
		}
	}
};
// lib/types/shared.js
/** Shared route constants and wire shapes for the dsh-image-gen plugin. */
const IMAGE_ROUTE = "/plugins/dsh-image-gen/image";
const DELETE_ROUTE = "/plugins/dsh-image-gen/delete";
const SAVE_WORKSPACE_ROUTE = "/plugins/dsh-image-gen/save-workspace";
/** Host route the conversation card calls for regenerate. */
const GENERATE_ROUTE = "/plugins/dsh-image-gen/generate";
/** Presentation metadata kinds carried by tool results and result nodes. */
const META_KIND = "dsh-image-gen";
const META_KIND_BATCH = "dsh-image-gen-batch";
const DEFAULT_CLOUD_TIMEOUT_MS = 12e4;
const DEFAULT_WORKSPACE_FOLDER = "dsh-image-gen";
const DEFAULT_MINO_BASE_URL = "https://api.mino.baby/v1";
// lib/types/config.js
/** User-facing configuration for the single Mino image channel. */
/**
* Mark a schema field live for the host's settings form: the loader serves a
* plugin's settings only for `.volatile()` fields and hands `apply` a
* `Volatile` box per field (unwrapped at the entry). Older schemastery builds
* lack the method, so marking is conditional.
*/
function volatile(schema) {
	const mark = schema.volatile;
	return typeof mark === "function" ? mark.call(schema) : schema;
}
/** Cordis configuration schema. */
const Config = z.object({
	baseURL: volatile(z.string().default(DEFAULT_MINO_BASE_URL)),
	model: volatile(z.string().default("")),
	editModel: volatile(z.string().default("")),
	size: volatile(z.string().default("1024x1024")),
	quality: volatile(z.string().default("")),
	cloudTimeoutMs: volatile(z.number().min(5e3).max(36e5).default(DEFAULT_CLOUD_TIMEOUT_MS)),
	saveToWorkspace: volatile(z.boolean().default(true)),
	workspaceFolder: volatile(z.string().default(DEFAULT_WORKSPACE_FOLDER))
});
/** Resolve the channel, failing loudly on the one field with no safe default. */
function resolveChannel(config) {
	const baseURL = config.baseURL?.trim() || "https://api.mino.baby/v1";
	const model = config.model?.trim() ?? "";
	if (model.length === 0) throw new Error("图像模型未配置：请前往 设置 > 插件 > Mino 图像生成 填写模型（例如在 Mino 后台开通的图像模型 id）。");
	const editModel = config.editModel?.trim() || model;
	const size = config.size?.trim();
	const quality = config.quality?.trim();
	return {
		baseURL,
		model,
		editModel,
		...size === void 0 || size.length === 0 ? {} : { size },
		...quality === void 0 || quality.length === 0 ? {} : { quality }
	};
}
// lib/types/generation-timeout.js
const UPSTREAM_TIMEOUT_HINT = "上游可能已扣费或仍在生成，请到服务商后台确认";
var GenerationTimeoutError = class extends Error {
	constructor(timeoutMs) {
		super(`生图超时（${String(timeoutMs / 1e3)} 秒未返回），请检查网络或代理后重试；${UPSTREAM_TIMEOUT_HINT}`);
		this.name = "GenerationTimeoutError";
	}
};
async function withGenerationTimeout(timeoutMs, signal, operation) {
	const watchdog = new AbortController();
	const combinedSignal = AbortSignal.any([signal, watchdog.signal]);
	const timeout = setTimeout(() => {
		watchdog.abort();
	}, timeoutMs);
	timeout.unref?.();
	try {
		return await operation(combinedSignal);
	} catch (error) {
		if (watchdog.signal.aborted && !signal.aborted) throw new GenerationTimeoutError(timeoutMs);
		throw error;
	} finally {
		clearTimeout(timeout);
	}
}
// lib/types/mino-auth.js
/** Header the inference gateway maps to `Authorization: Bearer`. */
const TOKEN_HEADER = "x-dsh-auth-token";
function account(ctx) {
	return ctx.get("deepseekAccount");
}
/**
* Resolve the signed-in account token for one image request. The token is
* sent both as `x-dsh-auth-token` (the harness account convention, mapped to
* Bearer by the managed gateway) and as a plain Bearer credential so any
* OpenAI-compatible deployment accepts it unchanged.
*/
async function requireMinoAuth(ctx, baseURL) {
	const token = await account(ctx)?.resolveToken(baseURL);
	if (token === void 0) throw new Error("请先登录 Mino 账号后使用图像生成；登录后重试。");
	return {
		token,
		headers: {
			[TOKEN_HEADER]: token,
			authorization: `Bearer ${token}`
		}
	};
}
/** Drop a stored grant after the gateway rejected it, so the next sign-in re-auths. */
async function rejectMinoToken(ctx, token) {
	try {
		await account(ctx)?.rejectToken(token);
	} catch (_credentialRemovalFailed) {}
}
// lib/types/redact.js
/**
* Redact secret-shaped content from provider error messages.
*
* Error bodies from providers and relays surface in the conversation and in
* the settings UI. A relay may echo request headers — including the API key —
* inside its error body, so every adapter passes response text through here
* before embedding it in a thrown error, and also passes the live key so its
* exact value cannot survive even in non-standard formats.
*/
const REDACTED = "[REDACTED]";
const KEY_SHAPED_PATTERNS = [
	/\bsk-[A-Za-z0-9_-]{8,}/g,
	/\bAIza[A-Za-z0-9_-]{10,}/g,
	/\bBearer\s+[A-Za-z0-9._~+/=-]{8,}/gi,
	/\b(?:api[_-]?key|apikey|token|secret)["']?\s*[:=]\s*["']?[A-Za-z0-9._~+/=-]{8,}/gi,
	/\b(?:api[_-]?key|apikey|token|secret)\s*["'][A-Za-z0-9._~+/=-]{8,}["']/gi
];
/** Replace every occurrence of a known secret plus key-shaped values. */
function redactSecrets(text, ...secrets) {
	let redacted = text;
	for (const secret of secrets) if (secret !== void 0 && secret.length >= 8) redacted = redacted.split(secret).join(REDACTED);
	for (const pattern of KEY_SHAPED_PATTERNS) redacted = redacted.replace(pattern, REDACTED);
	return redacted;
}
// lib/types/fetch-diagnostics.js
/**
* Transport-failure diagnostics for provider fetches (#79).
*
* Node's undici reports the real reason behind a failed fetch (socket reset,
* DNS, TLS, ...) only on `error.cause`, and the host's tool-error rendering
* keeps just `.message` — so the conversation sees nothing but undici's bare
* "fetch failed". These helpers rethrow transport failures with the failing
* phase, elapsed seconds, and a bounded cause chain.
*/
/** Cap a single transport-failure description so diagnostics cannot flood the conversation. */
const TRANSPORT_DETAIL_LIMIT = 600;
/** How deep to walk `error.cause` chains; undici nests at most twice in practice. */
const CAUSE_CHAIN_DEPTH = 3;
/** Keep body reads tied to the same request timing, cancellation, and secrets. */
const responseContexts = /* @__PURE__ */ new WeakMap();
/**
* Render one error plus its `cause` chain as a single line, e.g.
* `TypeError: fetch failed <- Error [UND_ERR_SOCKET]: other side closed`.
*/
function describeErrorChain(error, depth = 0) {
	if (depth >= CAUSE_CHAIN_DEPTH) return "...";
	if (error === void 0 || error === null) return "unknown transport error";
	if (typeof error === "object") {
		const details = error;
		if (error instanceof Error || typeof details.message === "string") {
			const label = [typeof details.name === "string" ? details.name : "Error", typeof details.code === "string" && details.code.length > 0 ? `[${details.code}]` : ""].filter((part) => part.length > 0).join(" ");
			const message = typeof details.message === "string" ? details.message : "";
			const text = label.length > 0 && message.length > 0 ? `${label}: ${message}` : label || message;
			return details.cause !== void 0 && details.cause !== null && depth + 1 < CAUSE_CHAIN_DEPTH ? `${text} <- ${describeErrorChain(details.cause, depth + 1)}` : text || "unknown transport error";
		}
		if (typeof details.kind === "string") return details.reason === void 0 || details.reason === null ? details.kind : `${details.kind}: ${describeErrorChain(details.reason, depth + 1)}`;
	}
	return String(error).trim() || "unknown transport error";
}
/** One line describing why a provider fetch failed: the abort reason when the caller cancelled, the cause chain otherwise. */
function describeTransportFailure(error, signal) {
	try {
		if (signal?.aborted === true) return `aborted (${describeErrorChain(signal.reason ?? error)})`;
		return describeErrorChain(error);
	} catch {
		return "unknown transport error";
	}
}
async function withTransportDiagnostics(context, run) {
	try {
		return await run();
	} catch (error) {
		const elapsed = ((performance.now() - context.startedAt) / 1e3).toFixed(1);
		const detail = redactSecrets(describeTransportFailure(error, context.signal), ...context.secrets).replace(/\s+/g, " ").slice(0, TRANSPORT_DETAIL_LIMIT);
		throw new Error(`${context.label} failed after ${elapsed}s: ${detail}`, { cause: error });
	}
}
/**
* Await one provider fetch and rethrow transport failures as
* `${label} failed after 12.3s: ${cause chain}`. The original error stays
* reachable on `cause` for host-side error rendering.
*/
async function guardedFetch(label, signal, run, ...secrets) {
	const context = {
		label,
		signal,
		secrets,
		startedAt: performance.now()
	};
	const response = await withTransportDiagnostics(context, run);
	responseContexts.set(response, context);
	return response;
}
/** Guard only body I/O; parsing, HTTP checks and size enforcement stay with the adapter. */
function readResponseBody(response, read) {
	const context = responseContexts.get(response);
	return context === void 0 ? read() : withTransportDiagnostics(context, read);
}
// lib/types/reference-image.js
/** Latest-DSH compatibility boundary for resolving conversation image references. */
/**
* Resolve one or more edit references while keeping every DSH-specific detail
* behind this compatibility boundary. Explicit selectors preserve caller order;
* without selectors, all images in the newest image-bearing message are used.
*/
async function resolveReferenceImages(input) {
	const sourceAttachmentIds = mergeSelectors({
		single: input.sourceAttachmentId,
		multiple: input.sourceAttachmentIds,
		singleName: "source_attachment_id",
		multipleName: "source_attachment_ids",
		equal: attachmentIdsEqual
	});
	const sourcePaths = mergeSelectors({
		single: input.sourcePath,
		multiple: input.sourcePaths,
		singleName: "source_path",
		multipleName: "source_paths",
		equal: (left, right) => left.trim() === right.trim()
	});
	if (sourceAttachmentIds !== void 0 && sourcePaths !== void 0) throw new Error("edit_image accepts only one of source_attachment_id, source_attachment_ids, source_path, or source_paths");
	if (sourcePaths !== void 0) return Promise.all(sourcePaths.map((sourcePath) => readWorkspaceReferenceImage({
		sourcePath,
		...input.agent?.session.header?.cwd === void 0 ? {} : { workspaceRoot: input.agent.session.header.cwd },
		...input.maxBytes === void 0 ? {} : { maxBytes: input.maxBytes },
		signal: input.signal
	})));
	if (input.agent === void 0) throw new Error("edit_image requires an active DSH agent session to resolve a reference image");
	const refs = findReferenceImages(input.agent.session.deriveMessages(), sourceAttachmentIds);
	if (refs.length === 0) {
		if (sourceAttachmentIds !== void 0) throw new Error(`edit_image could not find image attachment ${sourceAttachmentIds[0]} in the current conversation`);
		throw new Error("edit_image requires an image in the current conversation; upload or generate an image first");
	}
	if (sourceAttachmentIds !== void 0 && refs.length !== sourceAttachmentIds.length) {
		const missing = sourceAttachmentIds.find((id) => !refs.some((ref) => attachmentIdsEqual(String(ref.attachmentId), id)));
		throw new Error(`edit_image could not find image attachment ${missing ?? "unknown"} in the current conversation`);
	}
	return Promise.all(refs.map(async (ref) => {
		const stored = await input.attachments.readImage(ref, input.signal);
		if (input.maxBytes !== void 0 && stored.data.byteLength > input.maxBytes) throw new Error(`edit_image source image is too large (${stored.data.byteLength} bytes; maximum ${input.maxBytes})`);
		return {
			data: stored.data,
			mediaType: stored.ref.mediaType
		};
	}));
}
/** Find images in caller order, or every image in the newest image-bearing message. */
function findReferenceImages(messages, sourceAttachmentIds) {
	if (sourceAttachmentIds !== void 0) return sourceAttachmentIds.flatMap((id) => {
		const ref = findReferenceImage(messages, id);
		return ref === void 0 ? [] : [ref];
	});
	const latestHumanMessage = [...messages].reverse().find((message) => message.source?.kind === "user");
	if (latestHumanMessage !== void 0) {
		const refs = collectInBlocks(latestHumanMessage.content);
		if (refs.length > 0) return refs;
	}
	for (let index = messages.length - 1; index >= 0; index -= 1) {
		const refs = collectInBlocks(messages[index]?.content ?? []);
		if (refs.length > 0) return refs;
	}
	return [];
}
/**
* Read an explicitly named workspace image without exposing filesystem or DSH
* details to provider adapters. Both lexical and real-path containment are
* enforced so absolute paths, parent traversal, and symlink escapes fail.
*/
async function readWorkspaceReferenceImage(input) {
	const requested = input.sourcePath.trim();
	if (requested.length === 0) throw new Error("edit_image source_path must not be empty");
	if (input.workspaceRoot === void 0) throw new Error("edit_image source_path requires an active DSH session workspace");
	const root = resolve(input.workspaceRoot);
	const candidate = isAbsolute(requested) ? resolve(requested) : resolve(root, requested);
	if (!containsPath$1(root, candidate)) throw new Error("edit_image source_path must stay inside the session workspace: " + requested);
	let realRoot;
	let realCandidate;
	try {
		[realRoot, realCandidate] = await Promise.all([realpath(root), realpath(candidate)]);
	} catch (error) {
		if (error.code === "ENOENT") throw new Error("edit_image could not find workspace image: " + requested);
		throw error;
	}
	if (!containsPath$1(realRoot, realCandidate)) throw new Error("edit_image source_path resolves outside the session workspace: " + requested);
	const file = await stat(realCandidate);
	if (!file.isFile()) throw new Error("edit_image source_path is not a file: " + requested);
	if (input.maxBytes !== void 0 && file.size > input.maxBytes) throw new Error("edit_image source image is too large (" + file.size + " bytes; maximum " + input.maxBytes + ")");
	const data = await readFile(realCandidate, { signal: input.signal });
	const mediaType = detectImageMediaType(data);
	if (mediaType === void 0) throw new Error("edit_image source_path is not a supported PNG, JPEG, WebP, or GIF image: " + requested);
	return {
		data: new Uint8Array(data),
		mediaType
	};
}
/** Find the newest matching image in the effective, replacement-aware history. */
function findReferenceImage(messages, sourceAttachmentId) {
	for (let index = messages.length - 1; index >= 0; index -= 1) {
		const found = findInBlocks(messages[index]?.content ?? [], sourceAttachmentId);
		if (found !== void 0) return found;
	}
}
/** Validate an untrusted serialized image reference at an HTTP/UI boundary. */
function parseImageAttachmentRef(value) {
	const ref = record$1(value);
	if (ref === void 0) return void 0;
	if (typeof ref.attachmentId !== "string" || !imageMediaType$1(ref.mediaType)) return void 0;
	if (!nonNegativeInteger(ref.bytes) || !positiveInteger(ref.width) || !positiveInteger(ref.height)) return void 0;
	if (ref.name !== void 0 && typeof ref.name !== "string") return void 0;
	const originalDimensions = ref.originalDimensions === void 0 ? void 0 : parseDimensions(ref.originalDimensions);
	if (ref.originalDimensions !== void 0 && originalDimensions === void 0) return void 0;
	return {
		attachmentId: ref.attachmentId,
		mediaType: ref.mediaType,
		bytes: ref.bytes,
		width: ref.width,
		height: ref.height,
		...typeof ref.name === "string" ? { name: ref.name } : {},
		...originalDimensions === void 0 ? {} : { originalDimensions }
	};
}
/**
* Newest matching image in one message's blocks. Tool results arrive in two
* shapes: 0.1.7 promotes them to first-class `role: 'tool'` messages (walked
* by the message-level callers below), while <=0.1.6 nests them as blocks with
* a `content` array inside a message. The 0.1.7 `ContentBlock` union declares
* no nested `content`, so recurse only when a block actually carries one.
*/
function findInBlocks(blocks, sourceAttachmentId) {
	for (let index = blocks.length - 1; index >= 0; index -= 1) {
		const block = blocks[index];
		if (block === void 0) continue;
		if (block.type === "image") {
			if (sourceAttachmentId === void 0 || attachmentIdsEqual(String(block.attachment.attachmentId), sourceAttachmentId)) return block.attachment;
			continue;
		}
		const nested = block.content;
		if (Array.isArray(nested)) {
			const found = findInBlocks(nested, sourceAttachmentId);
			if (found !== void 0) return found;
		}
	}
}
function parseDimensions(value) {
	const dimensions = record$1(value);
	if (dimensions === void 0 || !positiveInteger(dimensions.width) || !positiveInteger(dimensions.height)) return void 0;
	return {
		width: dimensions.width,
		height: dimensions.height
	};
}
function imageMediaType$1(value) {
	return value === "image/png" || value === "image/jpeg" || value === "image/webp" || value === "image/gif";
}
function collectInBlocks(blocks) {
	const refs = [];
	for (const block of blocks) {
		if (block.type === "image") refs.push(block.attachment);
		const nested = block.content;
		if (Array.isArray(nested)) refs.push(...collectInBlocks(nested));
	}
	return refs;
}
function attachmentIdsEqual(actual, requested) {
	if (actual === requested) return true;
	const actualDigest = sha256Digest(actual);
	const requestedDigest = sha256Digest(requested);
	return actualDigest !== void 0 && actualDigest === requestedDigest;
}
function sha256Digest(value) {
	return /^(?:sha256:)?([0-9a-f]{64})$/i.exec(value.trim())?.[1]?.toLowerCase();
}
function mergeSelectors(input) {
	if (input.multiple === void 0) return input.single === void 0 ? void 0 : [input.single];
	if (input.multiple.length === 0) {
		if (input.single !== void 0) return [input.single];
		throw new Error(`edit_image ${input.multipleName} must not be empty`);
	}
	const single = input.single;
	if (single !== void 0 && !input.multiple.some((value) => input.equal(single, value))) throw new Error(`edit_image ${input.singleName} must also appear in ${input.multipleName} when both are provided`);
	return input.multiple;
}
function detectImageMediaType(data) {
	if (startsWith(data, [
		137,
		80,
		78,
		71,
		13,
		10,
		26,
		10
	])) return "image/png";
	if (startsWith(data, [
		255,
		216,
		255
	])) return "image/jpeg";
	if (ascii(data, 0, 6) === "GIF87a" || ascii(data, 0, 6) === "GIF89a") return "image/gif";
	if (ascii(data, 0, 4) === "RIFF" && ascii(data, 8, 4) === "WEBP") return "image/webp";
}
function startsWith(data, signature) {
	return signature.every((byte, index) => data[index] === byte);
}
function ascii(data, offset, length) {
	return String.fromCharCode(...data.subarray(offset, offset + length));
}
function containsPath$1(parent, child) {
	const rel = relative(parent, child);
	return rel === "" || rel !== ".." && !rel.startsWith(".." + sep) && !isAbsolute(rel);
}
function positiveInteger(value) {
	return typeof value === "number" && Number.isInteger(value) && value > 0;
}
function nonNegativeInteger(value) {
	return typeof value === "number" && Number.isInteger(value) && value >= 0;
}
function record$1(value) {
	return typeof value === "object" && value !== null && !Array.isArray(value) ? value : void 0;
}
// lib/types/images-api.js
const ERROR_LIMIT = 4096;
/** HTTP failure carrying the response status so callers can drop rejected grants. */
var HttpStatusError = class extends Error {
	status;
	constructor(message, status) {
		super(message);
		this.status = status;
		this.name = "HttpStatusError";
	}
};
/** POST {baseURL}/images/generations and decode the first image result. */
async function generateMinoImage(input) {
	return parseImageResponse(await guardedFetch("image generation request", input.signal, () => fetch(imageEndpoint(input.baseURL, "generations"), {
		method: "POST",
		redirect: "error",
		signal: input.signal,
		headers: {
			...input.auth.headers,
			"content-type": "application/json"
		},
		body: JSON.stringify({
			model: input.model,
			prompt: input.prompt,
			...input.size === void 0 ? {} : { size: input.size },
			...input.quality === void 0 ? {} : { quality: input.quality }
		})
	}), input.auth.token), input);
}
/** POST {baseURL}/images/edits as an OpenAI multipart form with reference uploads. */
async function editMinoImage(input) {
	const form = new FormData();
	const imageField = input.sourceImages.length > 1 ? "image[]" : "image";
	input.sourceImages.forEach((sourceImage, index) => {
		const blob = new Blob([new Uint8Array(sourceImage.data)], { type: sourceImage.mediaType });
		form.append(imageField, blob, `reference-${index + 1}.${extensionOf(sourceImage.mediaType)}`);
	});
	form.append("prompt", input.prompt);
	form.append("model", input.model);
	if (input.size !== void 0 && input.size.length > 0) form.append("size", input.size);
	if (input.quality !== void 0) form.append("quality", input.quality);
	return parseImageResponse(await guardedFetch("image edit request", input.signal, () => fetch(imageEndpoint(input.baseURL, "edits"), {
		method: "POST",
		redirect: "error",
		signal: input.signal,
		headers: input.auth.headers,
		body: form
	}), input.auth.token), input);
}
async function parseImageResponse(response, input) {
	const text = await readBoundedText(response, Math.ceil(input.maxBytes * 1.4) + ERROR_LIMIT);
	if (!response.ok) throw new HttpStatusError(`图像请求失败（HTTP ${response.status}）：${redactSecrets(text, input.auth.token).slice(0, ERROR_LIMIT)}`, response.status);
	let payload;
	try {
		payload = JSON.parse(text);
	} catch {
		throw new Error("图像接口返回了无效的 JSON 响应");
	}
	const image = firstImage(payload);
	if (image === void 0) throw new Error(`图像接口未返回图片：${redactSecrets(text, input.auth.token).slice(0, ERROR_LIMIT)}`);
	if (image.b64_json !== void 0) {
		const data = decodeBase64(image.b64_json);
		return {
			data,
			mediaType: detectImageMediaType(data) ?? imageMediaType(image.mime_type) ?? "image/png"
		};
	}
	return downloadImage(image.url, input);
}
function imageEndpoint(baseURL, operation) {
	try {
		return new URL(`images/${operation}`, baseURL.endsWith("/") ? baseURL : `${baseURL}/`).toString();
	} catch {
		throw new Error("图像接口地址必须是绝对 URL");
	}
}
function firstImage(value) {
	if (typeof value !== "object" || value === null || Array.isArray(value)) return void 0;
	const record = value;
	const data = Array.isArray(record.data) ? record.data : Array.isArray(record.images) ? record.images : Array.isArray(record.output) ? record.output : void 0;
	if (data === void 0 || data.length === 0) return void 0;
	const candidate = data[0];
	if (typeof candidate !== "object" || candidate === null || Array.isArray(candidate)) return void 0;
	const item = candidate;
	const mime = typeof item.mime_type === "string" ? item.mime_type : typeof item.mime === "string" ? item.mime : void 0;
	return typeof item.b64_json === "string" && item.b64_json.length > 0 ? {
		b64_json: item.b64_json,
		...mime === void 0 ? {} : { mime_type: mime }
	} : typeof item.url === "string" && item.url.length > 0 ? {
		url: item.url,
		...mime === void 0 ? {} : { mime_type: mime }
	} : void 0;
}
async function downloadImage(url, input) {
	if (url === void 0) throw new Error("图像接口未返回图片数据");
	if (url.startsWith("data:")) {
		const parsed = parseDataUrl(url);
		if (parsed === void 0) throw new Error("图像接口返回了无效的 data URL");
		const data = decodeBase64(parsed.base64);
		return {
			data,
			mediaType: detectImageMediaType(data) ?? imageMediaType(parsed.mediaType) ?? "image/png"
		};
	}
	let response = await guardedFetch("image download", input.signal, () => fetch(url, {
		redirect: "follow",
		signal: input.signal,
		headers: { authorization: `Bearer ${input.auth.token}` }
	}), input.auth.token);
	if (!response.ok) response = await guardedFetch("image download", input.signal, () => fetch(url, {
		redirect: "follow",
		signal: input.signal
	}), input.auth.token);
	if (!response.ok) throw new Error(`图像下载失败（HTTP ${response.status}）`);
	const data = await readBoundedBytes(response, input.maxBytes);
	const mediaType = detectImageMediaType(data) ?? imageMediaType(response.headers.get("content-type"));
	if (mediaType === void 0) throw new Error("图像下载返回了不支持的内容类型");
	return {
		data,
		mediaType
	};
}
function parseDataUrl(value) {
	const match = /^data:([^;,]+);base64,(.*)$/s.exec(value.trim());
	return match?.[1] !== void 0 && match[2] !== void 0 ? {
		mediaType: match[1],
		base64: match[2]
	} : void 0;
}
function extensionOf(mediaType) {
	switch (mediaType) {
		case "image/jpeg": return "jpg";
		case "image/webp": return "webp";
		case "image/gif": return "gif";
		case "image/png": return "png";
	}
}
function decodeBase64(value) {
	const clean = (parseDataUrl(value)?.base64 ?? value).replace(/\s+/g, "");
	if (clean.length === 0) throw new Error("图像接口返回了无效的 base64 图片数据");
	const decoded = Buffer.from(clean, "base64");
	if (decoded.length === 0) throw new Error("图像接口返回了无效的 base64 图片数据");
	return new Uint8Array(decoded);
}
function imageMediaType(value) {
	const mediaType = value?.split(";", 1)[0]?.trim().toLowerCase();
	return mediaType === "image/png" || mediaType === "image/jpeg" || mediaType === "image/webp" || mediaType === "image/gif" ? mediaType : void 0;
}
async function readBoundedText(response, maxBytes) {
	return new TextDecoder().decode(await readBoundedBytes(response, maxBytes));
}
async function readBoundedBytes(response, maxBytes) {
	if (response.body === null) return /* @__PURE__ */ new Uint8Array();
	const reader = response.body.getReader();
	const chunks = [];
	let bytes = 0;
	try {
		for (;;) {
			const next = await readResponseBody(response, () => reader.read());
			if (next.done) break;
			bytes += next.value.byteLength;
			if (bytes > maxBytes) throw new Error(`图像响应超过 ${String(maxBytes)} 字节上限`);
			chunks.push(next.value);
		}
	} finally {
		reader.releaseLock();
	}
	const joined = new Uint8Array(bytes);
	let offset = 0;
	for (const chunk of chunks) {
		joined.set(chunk, offset);
		offset += chunk.byteLength;
	}
	return joined;
}
// lib/types/workspace-save.js
/** Persist one generated image as a file under the session workspace. */
/** File extension for each supported image media type. */
const EXTENSION = {
	"image/png": "png",
	"image/jpeg": "jpg",
	"image/webp": "webp",
	"image/gif": "gif"
};
/**
* Build the deterministic file name for a generated image:
* `image-<digest-prefix>.<ext>`. The digest prefix comes from the
* content-addressed attachment id, so the same image bytes always map to the
* same file name regardless of when they were generated, and re-saving simply
* overwrites the previous copy in place.
* @param attachmentId - durable attachment id (`sha256:<hex>`).
* @param mediaType - verified image media type.
* @returns the file name (no directory).
*/
function workspaceImageName(attachmentId, mediaType) {
	return `image-${(attachmentId.startsWith("sha256:") ? attachmentId.slice(7) : attachmentId).slice(0, 8).padEnd(8, "0")}.${EXTENSION[mediaType]}`;
}
/**
* Resolve the configured image folder inside the session workspace. The
* folder may nest, but must stay inside the workspace: absolute paths and
* parent-traversal segments are rejected for both separator styles.
*
* This lexical pass is necessary but not sufficient: `saveImageToWorkspace`
* additionally verifies the on-disk resolution so symlinked folders cannot
* escape the workspace.
* @param workspaceRoot - the session workspace directory.
* @param folder - configured subfolder; empty/blank means the workspace root.
* @returns the absolute image directory.
* @throws when the folder would escape the workspace root.
*/
function workspaceImageDir(workspaceRoot, folder) {
	const trimmed = (folder ?? "").trim();
	const root = resolve(workspaceRoot);
	const dir = trimmed === "" ? root : resolve(root, trimmed);
	if (!containsPath(root, dir)) throw new Error(`image workspace folder '${folder}' must stay inside the session workspace`);
	return dir;
}
/** True when `child` equals `parent` or lives underneath it (lexically). */
function containsPath(parent, child) {
	const rel = relative(parent, child);
	return rel === "" || rel !== ".." && !rel.startsWith(`..${sep}`) && !isAbsolute(rel);
}
/**
* Real path of the closest existing ancestor of `dir` (inclusive). Walking up
* lets us validate symlinked folder segments before creating anything under
* them.
*/
async function nearestExistingRealPath(dir) {
	let probe = dir;
	for (;;) try {
		return await realpath(probe);
	} catch (error) {
		if (error?.code !== "ENOENT") throw error;
		const parent = dirname(probe);
		if (parent === probe) throw error;
		probe = parent;
	}
}
/** Reject a directory whose on-disk resolution lands outside the workspace. */
function assertInsideWorkspace(realRoot, candidate, folder) {
	if (containsPath(realRoot, candidate)) return;
	throw new Error(`image workspace folder '${folder ?? ""}' must stay inside the session workspace (${candidate} resolves outside ${realRoot})`);
}
/**
* Write one generated image durably under the session workspace.
*
* Containment is enforced twice: lexically by `workspaceImageDir`, then
* against real paths, so a configured folder (or any intermediate segment)
* that is a symlink pointing outside the workspace is rejected before and
* after anything is created.
*
* The bytes are written to a same-directory staging file and renamed onto the
* target, so a crash never leaves a half-written image under its final name.
* Re-saving identical bytes rewrites the same file (the name is content-
* addressed), which keeps repeated generations idempotent. A cancellation is
* honoured up to and including the final rename: an aborted save never
* resolves successfully and never leaves the image behind under its final
* name.
* @param options - workspace root, configured folder, attachment identity, and image bytes.
* @returns the absolute path of the written file.
*/
async function saveImageToWorkspace(options) {
	const dir = workspaceImageDir(options.workspaceRoot, options.folder);
	options.signal?.throwIfAborted();
	const realRoot = await realpath(resolve(options.workspaceRoot));
	assertInsideWorkspace(realRoot, await nearestExistingRealPath(dir), options.folder);
	const name = workspaceImageName(options.attachmentId, options.mediaType);
	const target = join(dir, name);
	const staging = join(dir, `.${name}.${process.pid}-${randomUUID()}.tmp`);
	await mkdir(dir, { recursive: true });
	assertInsideWorkspace(realRoot, await realpath(dir), options.folder);
	try {
		await writeFile(staging, options.data, {
			flag: "wx",
			signal: options.signal
		});
		options.signal?.throwIfAborted();
		await rename(staging, target);
	} catch (error) {
		await unlink(staging).catch(() => {});
		throw error;
	}
	try {
		options.signal?.throwIfAborted();
	} catch (error) {
		await unlink(target).catch(() => {});
		throw error;
	}
	return target;
}
/** Regex pattern strictly matching generated image file names (e.g. image-01234567.png). */
const GENERATED_IMAGE_NAME_REGEX = /^image-[0-9a-f]{8,}\.(png|jpg|jpeg|webp|gif)$/i;
/** Discover all DSH workspace paths recorded in local application storage. */
async function getDshWorkspaceRoots() {
	const roots = [];
	try {
		const home = process.env.USERPROFILE || process.env.HOME || "";
		if (home) {
			const workspaceJsonPath = join(home, ".dsh", "storages", "workspace.json");
			const content = await readFile(workspaceJsonPath, "utf8");
			const workspaces = JSON.parse(content)?.tables?.workspaces;
			if (workspaces && typeof workspaces === "object") {
				for (const ws of Object.values(workspaces)) if (ws && typeof ws === "object" && "path" in ws && typeof ws.path === "string") {
					const p = ws.path;
					if (p.trim()) roots.push(p.trim());
				}
			}
		}
	} catch {}
	return roots;
}
/**
* Verify whether a candidate path lives within an allowed DSH workspace root.
* Resolves symlinks via `realpath` to prevent symlink traversal attacks.
* @returns the canonical realpath of the candidate root.
* @throws when candidateRoot does not exist or falls outside the allowed roots.
*/
async function assertWorkspaceAllowed(candidateRoot, allowedRoots) {
	const realCandidate = await realpath(resolve(candidateRoot));
	const rootsToCheck = /* @__PURE__ */ new Set();
	for (const r of allowedRoots) if (typeof r === "string" && r.trim()) try {
		rootsToCheck.add(await realpath(resolve(r)));
	} catch {}
	for (const allowed of rootsToCheck) if (containsPath(allowed, realCandidate)) return realCandidate;
	throw new Error(`Directory '${candidateRoot}' is not within an allowed DSH workspace`);
}
/**
* Safely delete a generated image file from workspace disk by its path.
* Enforces strict safety gates:
* 1. Base name must match generated image pattern (`image-<hex>.<ext>`) to avoid touching user files.
* 2. Path must be a regular file and NOT a symbolic link.
* 3. Real canonical path's basename must also match the pattern.
* 4. Real canonical path must reside within an allowed workspace root (or process.cwd()).
*/
async function deleteImageFromWorkspace(filePath, allowedWorkspaceRoots) {
	const resolved = resolve(filePath);
	const base = resolved.split(/[/\\]/).pop() ?? "";
	if (!GENERATED_IMAGE_NAME_REGEX.test(base)) return false;
	try {
		const fileLstat = await lstat(resolved);
		if (fileLstat.isSymbolicLink() || !fileLstat.isFile()) return false;
	} catch (err) {
		if (err?.code === "ENOENT") return true;
		throw err;
	}
	try {
		const realFile = await realpath(resolved);
		const realBase = realFile.split(/[/\\]/).pop() ?? "";
		if (!GENERATED_IMAGE_NAME_REGEX.test(realBase)) return false;
		const rootsToCheck = /* @__PURE__ */ new Set();
		if (allowedWorkspaceRoots) {
			for (const r of allowedWorkspaceRoots) if (typeof r === "string" && r.trim()) rootsToCheck.add(resolve(r));
		}
		rootsToCheck.add(resolve(process.cwd()));
		let withinAllowed = false;
		for (const root of rootsToCheck) try {
			if (containsPath(await realpath(root), realFile)) {
				withinAllowed = true;
				break;
			}
		} catch {}
		if (!withinAllowed) return false;
		await unlink(realFile);
		return true;
	} catch (err) {
		if (err?.code === "ENOENT") return true;
		throw err;
	}
}
// lib/types/image-route.js
const MAX_BODY_BYTES = 65536;
/** Serve one verified durable image reference to a same-origin browser request. */
async function serveImage(req, res, deps) {
	if (req.method !== "POST") return jsonError$1(res, 405, "method-not-allowed");
	if (!(req.headers["content-type"] ?? "").toLowerCase().startsWith("application/json")) return jsonError$1(res, 415, "json-required");
	if (!sameOrigin(req)) return jsonError$1(res, 403, "origin-rejected");
	let body;
	try {
		body = JSON.parse(await readBody(req));
	} catch {
		return jsonError$1(res, 400, "invalid-request");
	}
	const attachment = attachmentFromRequest(body);
	if (attachment === void 0) return jsonError$1(res, 400, "invalid-attachment");
	try {
		const stored = await deps.readImage(attachment);
		res.writeHead(200, {
			"content-type": stored.ref.mediaType,
			"content-length": String(stored.data.byteLength),
			"cache-control": "private, no-store",
			"x-content-type-options": "nosniff"
		});
		res.end(stored.data);
	} catch {
		jsonError$1(res, 404, "image-unavailable");
	}
}
function sameOrigin(req) {
	const origin = req.headers.origin;
	const host = req.headers.host;
	return !(origin !== void 0 && host !== void 0 && origin !== `http://${host}` && origin !== `https://${host}`);
}
/** Safely delete one or more generated image files from the workspace disk. */
async function serveDelete(req, res, deps) {
	if (req.method !== "POST") return jsonError$1(res, 405, "method-not-allowed");
	if (!(req.headers["content-type"] ?? "").toLowerCase().startsWith("application/json")) return jsonError$1(res, 415, "json-required");
	if (!sameOrigin(req)) return jsonError$1(res, 403, "origin-rejected");
	let body;
	try {
		body = JSON.parse(await readBody(req));
	} catch {
		return jsonError$1(res, 400, "invalid-request");
	}
	const rawPaths = typeof body === "object" && body !== null && "paths" in body && Array.isArray(body.paths) ? body.paths : [];
	const deletedFiles = [];
	const failedFiles = [];
	for (const p of rawPaths) if (typeof p === "string" && p.trim()) try {
		if (await deps.deleteWorkspaceImage(p)) deletedFiles.push(p);
		else failedFiles.push({
			path: p,
			error: "File not found or rejected by safety checks"
		});
	} catch (err) {
		failedFiles.push({
			path: p,
			error: err instanceof Error ? err.message : String(err)
		});
	}
	res.writeHead(200, {
		"content-type": "application/json",
		"cache-control": "no-store"
	});
	res.end(JSON.stringify({
		ok: failedFiles.length === 0,
		deletedCount: deletedFiles.length,
		deletedFiles,
		failedFiles
	}));
}
/** Serve on-demand image persistence into the workspace. */
async function serveSaveWorkspace(req, res, deps) {
	if (!sameOrigin(req)) return jsonError$1(res, 403, "origin-rejected");
	if (req.method !== "POST") return jsonError$1(res, 405, "method-not-allowed");
	if (!(req.headers["content-type"] ?? "").toLowerCase().startsWith("application/json")) return jsonError$1(res, 415, "json-required");
	try {
		const raw = JSON.parse(await readBody(req));
		const attachment = parseImageAttachmentRef(raw.attachment);
		if (!attachment) return jsonError$1(res, 400, "invalid-attachment");
		if (!deps.isSaveEnabled()) {
			res.writeHead(200, {
				"content-type": "application/json",
				"cache-control": "no-store"
			});
			res.end(JSON.stringify({
				ok: true,
				savedTo: void 0
			}));
			return;
		}
		const rawTarget = typeof raw.workspaceRoot === "string" && raw.workspaceRoot.trim() ? raw.workspaceRoot.trim() : deps.getActiveWorkspaceRoot();
		const allowedRoots = await deps.getAllowedWorkspaceRoots();
		let targetRoot;
		try {
			targetRoot = await assertWorkspaceAllowed(rawTarget, allowedRoots);
		} catch {
			return jsonError$1(res, 403, "workspace-root-not-allowed");
		}
		const stored = await deps.readImage(attachment);
		if (!stored || !stored.data) return jsonError$1(res, 404, "image-not-found");
		const savedTo = await deps.saveToWorkspace({
			workspaceRoot: targetRoot,
			attachmentId: String(attachment.attachmentId),
			mediaType: attachment.mediaType,
			data: stored.data
		});
		res.writeHead(200, {
			"content-type": "application/json",
			"cache-control": "no-store"
		});
		res.end(JSON.stringify({
			ok: true,
			savedTo
		}));
	} catch (err) {
		res.writeHead(500, {
			"content-type": "application/json",
			"cache-control": "no-store"
		});
		res.end(JSON.stringify({
			ok: false,
			error: err instanceof Error ? err.message : String(err)
		}));
	}
}
/** Validate the persisted reference carried by a tool presentation. */
function imageAttachmentFromMeta(meta) {
	const value = record(meta);
	if (value?.kind !== "dsh-image-gen") return void 0;
	return parseImageAttachmentRef(value.attachment);
}
function attachmentFromRequest(value) {
	return parseImageAttachmentRef(record(value)?.attachment);
}
function record(value) {
	return typeof value === "object" && value !== null && !Array.isArray(value) ? value : void 0;
}
async function readBody(req) {
	const chunks = [];
	let bytes = 0;
	for await (const chunk of req) {
		const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
		bytes += buffer.byteLength;
		if (bytes > MAX_BODY_BYTES) throw new Error("request too large");
		chunks.push(buffer);
	}
	return Buffer.concat(chunks).toString("utf8");
}
function jsonError$1(res, status, code) {
	res.writeHead(status, {
		"content-type": "application/json",
		"cache-control": "no-store"
	});
	res.end(JSON.stringify({ error: code }));
}
// lib/types/index.js
const name = "dsh-image-gen";
const inject = ["tools", "attachments"];
/** Optional strings from tool callers may contain empty placeholders. */
function cleanImageToolArgs(args) {
	const clean = { ...args };
	const fields = clean;
	for (const key of [
		"model",
		"size",
		"quality"
	]) {
		const value = fields[key];
		if (typeof value !== "string") continue;
		if (value.trim().length === 0) delete fields[key];
		else fields[key] = value.trim();
	}
	return clean;
}
/** Shared inference layer; falls back to this plugin's own config when absent. */
function minoInference(ctx) {
	const service = ctx.get("minoInference");
	if (service === void 0) return void 0;
	if (typeof service.baseURL !== "string" || typeof service.resolveAuth !== "function" || typeof service.rejectToken !== "function") throw new Error("minoInference 服务契约不匹配：需要 baseURL/resolveAuth/rejectToken（mino-inference 版本过旧，请升级插件）。");
	return service;
}
function apply(ctx, config = {}) {
	const plainConfig = (source) => {
		const out = {};
		for (const [key, value] of Object.entries(source)) out[key] = value !== null && typeof value === "object" && typeof value.get === "function" ? value.get() : value;
		return out;
	};
	const current = () => plainConfig(config);
	const knownWorkspaceRoots = /* @__PURE__ */ new Set();
	ctx.inject(["webServer"], (webCtx) => {
		webCtx.effect(() => webCtx.webServer.register({
			kind: "exact",
			path: IMAGE_ROUTE,
			handler: (req, res) => serveImage(req, res, { readImage: (ref) => ctx.attachments.readImage(ref) })
		}), "dsh-image-gen: image route");
		webCtx.effect(() => webCtx.webServer.register({
			kind: "exact",
			path: DELETE_ROUTE,
			handler: (req, res) => serveDelete(req, res, { deleteWorkspaceImage: async (filePath) => {
				const discovered = await getDshWorkspaceRoots().catch(() => []);
				return deleteImageFromWorkspace(filePath, /* @__PURE__ */ new Set([
					...knownWorkspaceRoots,
					...discovered,
					process.cwd()
				]));
			} })
		}), "dsh-image-gen: delete route");
		webCtx.effect(() => webCtx.webServer.register({
			kind: "exact",
			path: SAVE_WORKSPACE_ROUTE,
			handler: (req, res) => serveSaveWorkspace(req, res, {
				readImage: (ref) => ctx.attachments.readImage(ref),
				saveToWorkspace: (options) => {
					if (options.workspaceRoot) knownWorkspaceRoots.add(options.workspaceRoot);
					return saveImageToWorkspace({
						workspaceRoot: options.workspaceRoot,
						folder: current().workspaceFolder,
						attachmentId: options.attachmentId,
						mediaType: options.mediaType,
						data: options.data
					});
				},
				getActiveWorkspaceRoot: () => Array.from(knownWorkspaceRoots)[0] || process.cwd(),
				getAllowedWorkspaceRoots: async () => {
					const discovered = await getDshWorkspaceRoots().catch(() => []);
					return /* @__PURE__ */ new Set([
						...knownWorkspaceRoots,
						...discovered,
						process.cwd()
					]);
				},
				isSaveEnabled: () => current().saveToWorkspace !== false
			})
		}), "dsh-image-gen: save workspace route");
		webCtx.effect(() => webCtx.webServer.register({
			kind: "exact",
			path: GENERATE_ROUTE,
			handler: (req, res) => serveGenerate(req, res, async (body) => {
				const value = await generateAndSave(ctx, body, resolveChannel(current()), { signal: AbortSignal.timeout(2 * (current().cloudTimeoutMs ?? 12e4)) }, knownWorkspaceRoots, current());
				return {
					attachment: attachmentMeta(value.attachment),
					prompt: body.prompt,
					model: value.model,
					output: value.output,
					...value.savedTo === void 0 ? {} : { savedTo: value.savedTo },
					createdAt: Date.now()
				};
			})
		}), "dsh-image-gen: generate route");
	});
	ctx.inject(["systemPrompt"], (promptCtx) => {
		promptCtx.effect(() => promptCtx.systemPrompt.context({
			name: "dsh-image-gen:defaults",
			order: 59,
			text: () => {
				const model = current().model?.trim() || "not configured";
				return [
					`Image tools current provider: mino; generation model: ${JSON.stringify(model)}.`,
					"Unless the user explicitly requests a different image model, OMIT model from generate_image, generate_images and edit_image. Do not guess a model or switch models after an error.",
					"Omit unused optional arguments entirely; never fill them with empty strings.",
					"Minimal calls: generate_image({\"prompt\":\"a sailboat\"}); edit_image({\"prompt\":\"make the sail blue\"})."
				].join("\n");
			}
		}), "dsh-image-gen: tool context");
	});
	/** Shared per-item generation for generate_image and the batch loop. */
	const generateSingle = async (rawArgs, exec) => {
		const args = cleanImageToolArgs(rawArgs);
		const channel = resolveChannel(current());
		return generateAndSave(ctx, {
			...args,
			model: args.model ?? channel.model
		}, channel, exec, knownWorkspaceRoots, current());
	};
	ctx.tools.register(defineTool({
		name: "generate_image",
		description: "Generate a new image with the Mino image service. Use when the user asks to create or draw a new image; use edit_image instead when they want to change an existing image. Give a complete visual prompt including subject, composition, style, lighting, and any exact text that should appear. A successful image is attached directly to the conversation and may also be saved under the session workspace. Do not call read, glob, or other tools to locate or verify the image.",
		parameters: {
			prompt: {
				type: "string",
				required: true,
				description: "Complete description of the image to generate."
			},
			model: {
				type: "string",
				description: "Optional image model name for this call only, overriding the configured model. Omit unless the user asks for a specific model."
			},
			size: {
				type: "string",
				description: "Optional dimensions or size tier for this call only (e.g. 1024x1024). Omit to use the configured default."
			},
			quality: {
				type: "string",
				description: "Optional generation quality tier for this call only. Omit to use the configured default."
			}
		},
		output: imageOutput("Generated"),
		async execute(args, exec) {
			return generateSingle(args, exec);
		},
		presentResult: (_args, result) => imagePresentation(result)
	}));
	ctx.tools.register(defineTool({
		name: "generate_images",
		description: "Generate several images in one call, one per prompt, in order. Use for batches, variations, or illustration sets; prefer generate_image for a single image. Every successful image is attached to the conversation and may be saved under the session workspace. Items generate sequentially; a failed item is reported in the failures list and does not abort the rest.",
		parameters: {
			prompts: {
				type: "array",
				items: { type: "string" },
				required: true,
				description: "Ordered complete prompts; one image is generated per entry (1-10)."
			},
			model: {
				type: "string",
				description: "Optional image model name for this call only, applied to every item."
			},
			size: {
				type: "string",
				description: "Optional dimensions or size tier for this call only, applied to every item."
			},
			quality: {
				type: "string",
				description: "Optional generation quality tier for this call only, applied to every item."
			}
		},
		output: {
			schema: {
				type: "object",
				additionalProperties: false,
				properties: {
					images: {
						type: "array",
						items: {
							type: "object",
							additionalProperties: false,
							properties: {
								attachment: {
									type: "object",
									required: true,
									additionalProperties: false,
									properties: {
										attachmentId: {
											type: "string",
											required: true
										},
										mediaType: {
											type: "string",
											required: true
										},
										bytes: {
											type: "integer",
											required: true
										},
										width: {
											type: "integer",
											required: true
										},
										height: {
											type: "integer",
											required: true
										},
										name: { type: "string" },
										originalDimensions: {
											type: "object",
											additionalProperties: false,
											properties: {
												width: {
													type: "integer",
													required: true
												},
												height: {
													type: "integer",
													required: true
												}
											}
										}
									}
								},
								provider: {
									type: "string",
									required: true
								},
								model: {
									type: "string",
									required: true
								},
								output: {
									type: "string",
									required: true
								},
								savedTo: { type: "string" },
								saveError: { type: "string" },
								prompt: {
									type: "string",
									required: true
								}
							}
						}
					},
					failures: {
						type: "array",
						items: {
							type: "object",
							additionalProperties: false,
							properties: {
								index: {
									type: "integer",
									required: true
								},
								prompt: {
									type: "string",
									required: true
								},
								error: {
									type: "string",
									required: true
								}
							}
						}
					}
				}
			},
			render: (_args, value) => [{
				type: "text",
				text: `Generated ${String(value.images.length)} of ${String(value.images.length + value.failures.length)} images.\n${value.failures.map((failure) => `${failure.prompt.slice(0, 80)} — failed: ${failure.error}`).join("\n")}`
			}, ...value.images.flatMap((image) => imageOutput("Generated").render({}, image).map((block) => block.type === "text" ? {
				...block,
				text: `${block.text}\nImage prompt: ${image.prompt}`
			} : block))],
			presentationMeta: (_args, value) => ({
				kind: META_KIND_BATCH,
				images: value.images.map((image) => imageOutput("Generated").presentationMeta({ prompt: image.prompt }, image))
			})
		},
		async execute(args, exec) {
			if (args.prompts.length === 0) throw new Error("generate_images requires at least one prompt");
			if (args.prompts.length > 10) throw new Error(`generate_images accepts at most 10 prompts per call (got ${String(args.prompts.length)}); split larger batches into several calls`);
			const images = [];
			const failures = [];
			for (const [index, prompt] of args.prompts.entries()) {
				if (exec.signal.aborted) {
					failures.push({
						index,
						prompt,
						error: "aborted before this image started"
					});
					continue;
				}
				try {
					const value = await generateSingle({
						prompt,
						...args.model !== void 0 ? { model: args.model } : {},
						...args.size !== void 0 ? { size: args.size } : {},
						...args.quality !== void 0 ? { quality: args.quality } : {}
					}, exec);
					images.push({
						...value,
						prompt
					});
				} catch (error) {
					failures.push({
						index,
						prompt,
						error: error instanceof Error ? error.message : String(error)
					});
				}
			}
			return {
				images,
				failures
			};
		},
		presentResult: (_args, result) => imagePresentation(result)
	}));
	ctx.tools.register(defineTool({
		name: "edit_image",
		description: "Edit, combine, or restyle existing images with the Mino image service. Images attached inline to the latest human message are already readable attachments even when no workspace file exists. In that case, call edit_image immediately with prompt only; NEVER call read_image, glob, or shell to locate them, and NEVER invent @ paths. All inline images will be used in upload order. For specific older conversation images use source_attachment_id or source_attachment_ids; both canonical sha256: IDs and full bare SHA-256 digests are accepted. For files the user explicitly names in the workspace use source_path or source_paths. Provide exactly one selector field. Without a selector, images from the latest human message take priority; only when that message has no images does editing fall back to the newest conversation image. When the user wants a person, character, or object from the reference images kept as the same identity, write short hard identity-preservation instructions instead of long generic appearance descriptions.",
		parameters: {
			prompt: {
				type: "string",
				required: true,
				description: "Describe the changes to make while preserving everything else that should remain."
			},
			model: {
				type: "string",
				description: "Optional image model name for this call only, overriding the configured edit model. Omit unless the user asks for a specific model."
			},
			source_attachment_id: {
				type: "string",
				description: "Optional attachment id of a specific image already present in the current conversation."
			},
			source_attachment_ids: {
				type: "array",
				items: { type: "string" },
				description: "Optional ordered attachment ids of multiple images already present in the current conversation. Prompt references such as image 1 and image 2 follow this order."
			},
			source_path: {
				type: "string",
				description: "Optional absolute or workspace-relative path of a specific image file inside the active session workspace. Prefer this when the user names a saved file."
			},
			source_paths: {
				type: "array",
				items: { type: "string" },
				description: "Optional ordered absolute or workspace-relative paths of multiple image files inside the active session workspace."
			},
			size: {
				type: "string",
				description: "Optional output size for this call only. Omit to use the configured default."
			},
			quality: {
				type: "string",
				description: "Optional generation quality tier for this call only."
			}
		},
		output: imageOutput("Edited"),
		async execute(rawArgs, exec) {
			const args = cleanImageToolArgs(rawArgs);
			const channel = resolveChannel(current());
			const sourceImages = await resolveReferenceImages({
				...exec.agent === void 0 ? {} : { agent: exec.agent },
				attachments: ctx.attachments,
				...typeof args.source_attachment_id === "string" ? { sourceAttachmentId: args.source_attachment_id } : {},
				...Array.isArray(args.source_attachment_ids) ? { sourceAttachmentIds: args.source_attachment_ids } : {},
				...typeof args.source_path === "string" ? { sourcePath: args.source_path } : {},
				...Array.isArray(args.source_paths) ? { sourcePaths: args.source_paths } : {},
				maxBytes: ctx.attachments.imageLimits.maxImageBytes,
				signal: exec.signal
			});
			const service = minoInference(ctx);
			const baseURL = service?.baseURL ?? channel.baseURL;
			const auth = service !== void 0 ? await service.resolveAuth() : await requireMinoAuth(ctx, baseURL);
			const request = {
				auth,
				baseURL,
				model: args.model ?? channel.editModel,
				prompt: args.prompt,
				sourceImages,
				maxBytes: ctx.attachments.imageLimits.maxImageBytes,
				...args.size ?? channel.size ? { size: args.size ?? channel.size ?? "" } : {},
				...args.quality ?? channel.quality ? { quality: args.quality ?? channel.quality } : {}
			};
			try {
				return saveGenerated(ctx, await withGenerationTimeout(current().cloudTimeoutMs ?? 12e4, exec.signal, (signal) => editMinoImage({
					...request,
					signal
				})), args.model ?? channel.editModel, outputLabel(request.size, request.quality), exec, knownWorkspaceRoots, current());
			} catch (error) {
				await reauthOnUnauthorized(ctx, auth, error);
				throw error;
			}
		},
		presentResult: (_args, result) => imagePresentation(result)
	}));
}
/** Run one generation through the channel and persist the image. */
async function generateAndSave(ctx, args, channel, exec, knownRoots, config) {
	const service = minoInference(ctx);
	const baseURL = service?.baseURL ?? channel.baseURL;
	const auth = service !== void 0 ? await service.resolveAuth() : await requireMinoAuth(ctx, baseURL);
	const model = args.model ?? channel.model;
	const size = args.size ?? channel.size;
	const quality = args.quality ?? channel.quality;
	try {
		return saveGenerated(ctx, await withGenerationTimeout(config.cloudTimeoutMs ?? 12e4, exec.signal, (signal) => generateMinoImage({
			auth,
			baseURL,
			model,
			prompt: args.prompt,
			...size === void 0 ? {} : { size },
			...quality === void 0 ? {} : { quality },
			maxBytes: ctx.attachments.imageLimits.maxImageBytes,
			signal
		})), model, outputLabel(size, quality), exec, knownRoots, config);
	} catch (error) {
		await reauthOnUnauthorized(ctx, auth, error);
		throw error;
	}
}
function outputLabel(size, quality) {
	return quality === void 0 ? size ?? "default" : `${size ?? "default"}, quality=${quality}`;
}
/** Drop a rejected grant so the next attempt surfaces the sign-in flow. */
async function reauthOnUnauthorized(ctx, auth, error) {
	if (error instanceof HttpStatusError && error.status === 401) {
		const service = minoInference(ctx);
		if (service !== void 0) await service.rejectToken(auth.token);
		else await rejectMinoToken(ctx, auth.token);
	}
}
/** Serve the client card's regenerate request through the same generation core. */
async function serveGenerate(req, res, generate) {
	if (req.method !== "POST") return jsonError(res, 405, "method-not-allowed");
	if (!(req.headers["content-type"] ?? "").toLowerCase().startsWith("application/json")) return jsonError(res, 415, "json-required");
	const origin = req.headers.origin;
	const host = req.headers.host;
	if (origin !== void 0 && host !== void 0 && origin !== `http://${host}` && origin !== `https://${host}`) return jsonError(res, 403, "origin-rejected");
	let body;
	try {
		const raw = JSON.parse(await readAll(req));
		if (typeof raw.prompt !== "string" || raw.prompt.trim().length === 0) return jsonError(res, 400, "prompt-required");
		body = {
			prompt: raw.prompt.trim(),
			...typeof raw.model === "string" ? { model: raw.model } : {},
			...typeof raw.size === "string" ? { size: raw.size } : {},
			...typeof raw.quality === "string" ? { quality: raw.quality } : {}
		};
	} catch {
		return jsonError(res, 400, "invalid-request");
	}
	try {
		const value = await generate(body);
		res.writeHead(200, {
			"content-type": "application/json",
			"cache-control": "no-store"
		});
		res.end(JSON.stringify(value));
	} catch (error) {
		res.writeHead(500, {
			"content-type": "application/json",
			"cache-control": "no-store"
		});
		res.end(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }));
	}
}
async function readAll(req) {
	const chunks = [];
	let bytes = 0;
	for await (const chunk of req) {
		const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
		bytes += buffer.byteLength;
		if (bytes > 65536) throw new Error("request too large");
		chunks.push(buffer);
	}
	return Buffer.concat(chunks).toString("utf8");
}
function jsonError(res, status, code) {
	res.writeHead(status, {
		"content-type": "application/json",
		"cache-control": "no-store"
	});
	res.end(JSON.stringify({ error: code }));
}
function imageOutput(verb) {
	return {
		schema: {
			type: "object",
			additionalProperties: false,
			properties: {
				attachment: {
					type: "object",
					required: true,
					additionalProperties: false,
					properties: {
						attachmentId: {
							type: "string",
							required: true
						},
						mediaType: {
							type: "string",
							required: true
						},
						bytes: {
							type: "integer",
							required: true
						},
						width: {
							type: "integer",
							required: true
						},
						height: {
							type: "integer",
							required: true
						},
						name: { type: "string" },
						originalDimensions: {
							type: "object",
							additionalProperties: false,
							properties: {
								width: {
									type: "integer",
									required: true
								},
								height: {
									type: "integer",
									required: true
								}
							}
						}
					}
				},
				provider: {
					type: "string",
					required: true
				},
				model: {
					type: "string",
					required: true
				},
				output: {
					type: "string",
					required: true
				},
				savedTo: { type: "string" },
				saveError: { type: "string" }
			}
		},
		render: (_args, value) => {
			const saved = typeof value.savedTo === "string" ? ` It was also saved to the workspace as ${value.savedTo}.` : typeof value.saveError === "string" ? ` Saving it to the workspace failed: ${value.saveError}.` : " It has no local file path.";
			const action = verb === "Generated" ? "It is already attached to the conversation." : "The edited image is attached to the conversation.";
			return [{
				type: "text",
				text: `${verb} one image with mino/${value.model} (${value.output}). Attachment ID: ${String(value.attachment.attachmentId)}. ${action}${saved} Respond to the user without reading or searching for the image.`
			}, {
				type: "image",
				attachment: value.attachment
			}];
		},
		presentationMeta: (args, value) => ({
			kind: META_KIND,
			attachment: attachmentMeta(value.attachment),
			provider: value.provider,
			model: value.model,
			output: value.output,
			...verb === "Edited" ? { operation: "edit" } : {},
			...typeof value.savedTo === "string" ? { savedTo: value.savedTo } : {},
			prompt: args.prompt
		})
	};
}
function attachmentMeta(ref) {
	return {
		attachmentId: String(ref.attachmentId),
		mediaType: ref.mediaType,
		bytes: ref.bytes,
		width: ref.width,
		height: ref.height,
		...ref.name === void 0 ? {} : { name: ref.name },
		...ref.originalDimensions === void 0 ? {} : { originalDimensions: {
			width: ref.originalDimensions.width,
			height: ref.originalDimensions.height
		} }
	};
}
async function saveGenerated(ctx, generated, model, output, exec, knownRoots, config) {
	if (!ctx.attachments.imageLimits.mediaTypes.includes(generated.mediaType)) throw new Error(`This deployment does not accept ${generated.mediaType} generated images`);
	const attachment = await ctx.attachments.saveImage({
		data: generated.data,
		mediaType: generated.mediaType,
		name: "generated-image"
	});
	const value = {
		attachment,
		provider: "mino",
		model,
		output
	};
	if (config.saveToWorkspace === false) return value;
	const workspaceRoot = exec.agent?.session.header.cwd ?? Array.from(knownRoots)[0];
	if (workspaceRoot === void 0) return value;
	knownRoots.add(workspaceRoot);
	try {
		value.savedTo = await saveImageToWorkspace({
			workspaceRoot,
			folder: config.workspaceFolder,
			attachmentId: attachment.attachmentId,
			mediaType: generated.mediaType,
			data: generated.data,
			signal: exec.signal
		});
	} catch (error) {
		exec.signal.throwIfAborted();
		ctx.logger.warn(`dsh-image-gen: failed to save image to workspace: ${error instanceof Error ? error.message : String(error)}`);
		value.saveError = error instanceof Error ? error.message : String(error);
	}
	return value;
}
function imagePresentation(result) {
	const meta = result.meta;
	if (typeof meta === "object" && meta !== null && !Array.isArray(meta) && meta.kind === "dsh-image-gen-batch" && Array.isArray(meta.images)) {
		const content = meta.images.flatMap((image) => {
			const attachment = imageAttachmentFromMeta(image);
			return attachment === void 0 ? [] : [{
				type: "image",
				attachment
			}];
		});
		return content.length === 0 ? void 0 : {
			card: "generic",
			title: "Generated images",
			content
		};
	}
	const attachment = imageAttachmentFromMeta(result.meta);
	return attachment === void 0 ? void 0 : {
		card: "generic",
		title: "Generated image",
		content: [{
			type: "image",
			attachment
		}]
	};
}
export { Config, DELETE_ROUTE, GENERATE_ROUTE, IMAGE_ROUTE, SAVE_WORKSPACE_ROUTE, apply, imageAttachmentFromMeta, inject, name };
