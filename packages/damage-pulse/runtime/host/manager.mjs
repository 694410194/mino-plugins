import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { dshHomePath } from "@deepseek-ai/dsh-home-paths";
import { access, copyFile, lstat, mkdir, readFile, rename, rmdir, unlink, writeFile } from "node:fs/promises";
import { withFileLock } from "@deepseek-ai/dsh-atomic-write";
import { createHash, randomUUID } from "node:crypto";
import { constants } from "node:fs";
import { gunzip } from "node:zlib";
import { promisify } from "node:util";
//#region packages/util/token-monitor-contract/src/index.ts
/**
* Browser-relative base path the plugin serves its PNG assets from.
*
* The desktop shell answers every `/assets/**` request itself from its own
* frozen front-end bundle, so a plugin asset published under that prefix never
* reaches the Host and the browser gets a 404. Plugin assets are therefore
* published under a document-relative namespace of their own, which the shell
* forwards to the Host unchanged. Both the Host route table and the Client
* image URLs derive from this one constant so they cannot drift apart.
*/
const TOKEN_MONITOR_ASSET_BASE = "/token-monitor-assets";
Object.freeze({
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
//#region plugins/dsh-token-monitor/src/module-files.ts
/** Confined artifact I/O shared by uninstall and release installation. No shell commands. */
const ROOTS = /* @__PURE__ */ new Set([
	"host",
	"client",
	"assets"
]);
const MAX_BYTES$1 = 262144e3;
const validModuleId = (id) => typeof id === "string" && /^[a-z][a-z0-9-]{0,47}$/.test(id) && ![
	"core",
	"plugin",
	"constructor",
	"prototype"
].includes(id);
const validReleaseVersion = (version) => typeof version === "string" && version.length < 48 && /^(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)$/.test(version);
function compareReleaseVersions(a, b) {
	if (!validReleaseVersion(a) || !validReleaseVersion(b)) throw new Error("INVALID_RELEASE_VERSION");
	const left = a.split(".").map(BigInt), right = b.split(".").map(BigInt);
	for (let i = 0; i < 3; i++) if (left[i] !== right[i]) return left[i] > right[i] ? 1 : -1;
	return 0;
}
function validateManifest(value) {
	const v = value;
	if (!v || v.schemaVersion !== 1 || !validReleaseVersion(v.version) || !Array.isArray(v.core) || !v.core.length || !Array.isArray(v.modules) || v.modules.length > 64) throw new Error("INVALID_MODULE_MANIFEST");
	const ids = /* @__PURE__ */ new Set(), paths = /* @__PURE__ */ new Set();
	let size = 0, count = 0;
	const files = (list) => {
		if (!Array.isArray(list) || !list.length) throw new Error("EMPTY_MODULE_ARTIFACTS");
		for (const f of list) {
			if (!f || !ROOTS.has(f.root) || typeof f.path !== "string" || f.path.length > 240 || isAbsolute(f.path) || f.path.split("/").some((p) => !p || p === "." || p === ".." || /[\\:\x00-\x1f<>"|?*]/.test(p) || /[. ]$/.test(p) || /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(p)) || typeof f.sha256 !== "string" || !/^[a-f0-9]{64}$/.test(f.sha256) || !Number.isSafeInteger(f.size) || f.size < 0) throw new Error("INVALID_MODULE_ARTIFACT");
			const key = `${f.root}/${f.path}`.toLowerCase();
			if (paths.has(key)) throw new Error("DUPLICATE_MODULE_ARTIFACT");
			paths.add(key);
			size += f.size;
			if (size > MAX_BYTES$1 || ++count > 2e4) throw new Error("MODULE_RELEASE_TOO_LARGE");
		}
	};
	files(v.core);
	for (const m of v.modules) {
		if (!m || !validModuleId(m.id) || ids.has(m.id)) throw new Error("INVALID_MODULE_ID");
		ids.add(m.id);
		files(m.files);
	}
	return structuredClone(v);
}
/** Reject every link-shaped ancestor, including the target. Never recurse during deletion. */
async function confinedPath(root, file) {
	const base = resolve(root), target = resolve(base, file);
	const rel = relative(base, target);
	if (!rel || rel.startsWith(`..${sep}`) || rel === ".." || isAbsolute(rel)) throw new Error("ARTIFACT_OUTSIDE_ROOT");
	let current = base;
	for (const part of ["", ...rel.split(sep)]) {
		if (part) current = resolve(current, part);
		try {
			if ((await lstat(current)).isSymbolicLink()) throw new Error("ARTIFACT_LINK_REFUSED");
		} catch (error) {
			if (error.code !== "ENOENT") throw error;
		}
	}
	return target;
}
async function removeArtifact(roots, file) {
	const target = await confinedPath(roots[file.root], file.path);
	try {
		await unlink(target);
	} catch (error) {
		if (error.code !== "ENOENT") throw error;
	}
}
async function verifyArtifact(roots, file) {
	const target = await confinedPath(roots[file.root], file.path);
	const stat = await lstat(target);
	if (!stat.isFile() || stat.size !== file.size || stat.size > MAX_BYTES$1) throw new Error("ARTIFACT_DIGEST_MISMATCH");
	const bytes = await readFile(target);
	if (bytes.length !== file.size || createHash("sha256").update(bytes).digest("hex") !== file.sha256) throw new Error("ARTIFACT_DIGEST_MISMATCH");
}
/** Same-directory rename is the commit point; the temporary file is never a recovery package. */
async function atomicJson(file, value) {
	await mkdir(dirname(file), { recursive: true });
	const temp = `${file}.${process.pid}.${randomUUID()}.tmp`;
	try {
		await writeFile(temp, JSON.stringify(value, null, 2) + "\n", {
			flag: "wx",
			mode: 384
		});
		await rename(temp, file);
	} finally {
		await unlink(temp).catch((error) => {
			if (error.code !== "ENOENT") throw error;
		});
	}
}
//#endregion
//#region plugins/dsh-token-monitor/src/module-transaction.ts
/** Interrupted replacements are recovered before any runtime payload is loaded. */
var ModuleRollbackError = class extends Error {
	constructor() {
		super("MODULE_ROLLBACK_PENDING");
	}
};
/** The new state is durable; callers must not restore an older in-memory release. */
var ModuleCommittedError = class extends Error {
	constructor() {
		super("MODULE_COMMITTED_RESTART_REQUIRED");
	}
};
async function missing(file) {
	try {
		if (!(await lstat(file)).isFile()) throw new Error("ARTIFACT_NOT_FILE");
		return false;
	} catch (error) {
		if (error.code === "ENOENT") return true;
		throw error;
	}
}
async function unlinkIfPresent(file) {
	try {
		await unlink(file);
	} catch (error) {
		if (error.code !== "ENOENT") throw error;
	}
}
async function directoryFor(stateFile, id) {
	if (!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(id)) throw new Error("INVALID_TRANSACTION_ID");
	return confinedPath(dirname(stateFile), `module-transaction-${id}`);
}
async function temporary(roots, entry, id) {
	return confinedPath(roots[entry.file.root], `${entry.file.path}.${id}.tmp`);
}
async function clean(stateFile, roots, journal) {
	const directory = await directoryFor(stateFile, journal.id);
	for (let i = 0; i < journal.entries.length; i++) {
		await unlinkIfPresent(await confinedPath(directory, `${i}.old`));
		await unlinkIfPresent(await confinedPath(directory, `${i}.new`));
		await unlinkIfPresent(await temporary(roots, journal.entries[i], journal.id));
	}
	try {
		await rmdir(directory);
	} catch (error) {
		if (error.code !== "ENOENT") throw error;
	}
	await unlinkIfPresent(`${stateFile}.transaction.json`);
}
async function replaceFile(source, target, temp) {
	await mkdir(dirname(target), { recursive: true });
	await unlinkIfPresent(temp);
	await copyFile(source, temp, constants.COPYFILE_EXCL);
	await rename(temp, target);
}
async function rollback(stateFile, roots, journal) {
	const directory = await directoryFor(stateFile, journal.id);
	journal.phase = "rolling-back";
	await atomicJson(`${stateFile}.transaction.json`, journal);
	for (let i = 0; i < journal.entries.length; i++) {
		const entry = journal.entries[i], target = await confinedPath(roots[entry.file.root], entry.file.path);
		if (entry.existed) {
			const backup = await confinedPath(directory, `${i}.old`);
			if (await missing(backup)) throw new ModuleRollbackError();
			await replaceFile(backup, target, await temporary(roots, entry, journal.id));
		} else await unlinkIfPresent(target);
	}
	await atomicJson(stateFile, JSON.parse(journal.previousState));
	journal.phase = "rolled-back";
	await atomicJson(`${stateFile}.transaction.json`, journal);
	await clean(stateFile, roots, journal);
}
async function readJournal(stateFile) {
	const path = `${stateFile}.transaction.json`;
	try {
		const stat = await lstat(path);
		if (!stat.isFile() || stat.isSymbolicLink() || stat.size > 16777216) throw new Error("INVALID_TRANSACTION_JOURNAL");
		const journal = JSON.parse(await readFile(path, "utf8"));
		if (!journal || journal.schemaVersion !== 1 || typeof journal.previousState !== "string" || ![
			"preparing",
			"replacing",
			"committing",
			"rolling-back",
			"rolled-back"
		].includes(journal.phase) || !Array.isArray(journal.entries) || !journal.entries.length || journal.entries.some((e) => !e || typeof e.existed !== "boolean" || typeof e.remove !== "boolean")) throw new Error("INVALID_TRANSACTION_JOURNAL");
		validateManifest({
			schemaVersion: 1,
			version: "0.0.0",
			core: journal.entries.map((e) => e.file),
			modules: []
		});
		await directoryFor(stateFile, journal.id);
		const previous = JSON.parse(journal.previousState);
		if (previous?.schemaVersion !== 1 || !Number.isSafeInteger(previous.revision)) throw new Error("INVALID_TRANSACTION_STATE");
		if (journal.phase === "committing" && typeof journal.nextState !== "string") throw new Error("INVALID_TRANSACTION_STATE");
		return journal;
	} catch (error) {
		if (error.code === "ENOENT") return;
		throw error;
	}
}
/** Caller holds the writer lock; recovery never starts a partially replaced release. */
async function recoverModuleTransaction(stateFile, roots) {
	const journal = await readJournal(stateFile);
	if (!journal) return;
	const current = JSON.stringify(JSON.parse(await readFile(stateFile, "utf8")));
	if (journal.phase === "committing" && current === journal.nextState) {
		await clean(stateFile, roots, journal);
		return;
	}
	if (current !== JSON.stringify(JSON.parse(journal.previousState))) throw new Error("TRANSACTION_STATE_CONFLICT");
	if (journal.phase === "preparing" || journal.phase === "rolled-back") await clean(stateFile, roots, journal);
	else await rollback(stateFile, roots, journal);
}
/** Replace validated artifacts under the manager writer lock, retaining backups only until resolved. */
async function replaceModuleArtifacts(stateFile, roots, files, download, commit, obsolete = []) {
	if (await readJournal(stateFile)) throw new Error("MODULE_RECOVERY_REQUIRED");
	validateManifest({
		schemaVersion: 1,
		version: "0.0.0",
		core: [...files, ...obsolete],
		modules: []
	});
	const journal = {
		schemaVersion: 1,
		id: randomUUID(),
		previousState: await readFile(stateFile, "utf8"),
		entries: [],
		phase: "preparing"
	};
	for (const file of [...files, ...obsolete]) journal.entries.push({
		file,
		existed: !await missing(await confinedPath(roots[file.root], file.path)),
		remove: obsolete.includes(file)
	});
	await atomicJson(`${stateFile}.transaction.json`, journal);
	const directory = await directoryFor(stateFile, journal.id);
	let committed = false;
	try {
		await mkdir(directory, { mode: 448 });
		for (let i = 0; i < journal.entries.length; i++) {
			const entry = journal.entries[i], file = entry.file;
			if (entry.existed) await copyFile(await confinedPath(roots[file.root], file.path), join(directory, `${i}.old`), constants.COPYFILE_EXCL);
			if (entry.remove) continue;
			const bytes = await download(file);
			if (bytes.byteLength !== file.size || createHash("sha256").update(bytes).digest("hex") !== file.sha256) throw new Error("ARTIFACT_DIGEST_MISMATCH");
			await writeFile(join(directory, `${i}.new`), bytes, {
				flag: "wx",
				mode: 384
			});
		}
		journal.phase = "replacing";
		await atomicJson(`${stateFile}.transaction.json`, journal);
		for (let i = 0; i < journal.entries.length; i++) {
			const entry = journal.entries[i], target = await confinedPath(roots[entry.file.root], entry.file.path);
			if (entry.remove) await unlinkIfPresent(target);
			else await replaceFile(join(directory, `${i}.new`), target, await temporary(roots, entry, journal.id));
		}
		await commit(async (state) => {
			journal.phase = "committing";
			journal.nextState = JSON.stringify(state);
			await atomicJson(`${stateFile}.transaction.json`, journal);
			await atomicJson(stateFile, state);
			committed = true;
		});
		if (!committed) throw new Error("MODULE_STATE_NOT_COMMITTED");
	} catch (error) {
		if (committed) throw new ModuleCommittedError();
		try {
			if (journal.phase === "preparing") await clean(stateFile, roots, journal);
			else await rollback(stateFile, roots, journal);
		} catch {
			throw new ModuleRollbackError();
		}
		throw error;
	}
	try {
		await clean(stateFile, roots, journal);
	} catch (error) {
		console.warn("[token-monitor] Committed cleanup deferred:", error.code ?? "CLEANUP_PENDING");
	}
}
//#endregion
//#region plugins/dsh-token-monitor/src/module-manager.ts
function validRemoval(record) {
	return !!record && typeof record.pending === "boolean" && typeof record.preserveData === "boolean" && [
		record.preserveConfig,
		record.preserveHistory,
		record.erased
	].every((value) => value === void 0 || typeof value === "boolean");
}
var ModuleOperationError = class extends Error {
	code;
	httpStatus;
	constructor(code, httpStatus = 409) {
		super(code);
		this.code = code;
		this.httpStatus = httpStatus;
	}
};
/** One authoritative state file and one operation lock govern every destructive action. */
var ModuleManager = class ModuleManager {
	manifest;
	state;
	stateFile;
	roots;
	lifecycle;
	busy = false;
	unavailable = /* @__PURE__ */ new Set();
	cleanupErrors = /* @__PURE__ */ new Map();
	constructor(manifest, state, stateFile, roots, lifecycle) {
		this.manifest = manifest;
		this.state = state;
		this.stateFile = stateFile;
		this.roots = roots;
		this.lifecycle = lifecycle;
	}
	static async open(manifest, stateFile, roots, lifecycle, allowPackageReinstall = false) {
		await mkdir(dirname(stateFile), { recursive: true });
		return withFileLock(stateFile, () => this.openLocked(manifest, stateFile, roots, lifecycle, allowPackageReinstall));
	}
	static async openLocked(manifest, stateFile, roots, lifecycle, allowPackageReinstall) {
		await recoverModuleTransaction(stateFile, roots);
		const release = validateManifest(manifest);
		let state;
		try {
			state = JSON.parse(await readFile(stateFile, "utf8"));
			if (state.schemaVersion !== 1 || !Number.isSafeInteger(state.revision) || state.revision < 0 || !validReleaseVersion(state.version) || compareReleaseVersions(state.version, release.version) > 0 || !state.removed || typeof state.removed !== "object" || Array.isArray(state.removed) || typeof state.restartRequired !== "boolean") throw new Error("INVALID_MODULE_STATE");
			for (const [id, record] of Object.entries(state.removed)) if (!validModuleId(id) || !validRemoval(record)) throw new Error("INVALID_MODULE_STATE");
			if (state.wholePlugin && !validRemoval(state.wholePlugin)) throw new Error("INVALID_MODULE_STATE");
			if (state.manifest) {
				const previous = validateManifest(state.manifest);
				if (previous.version !== state.version || state.version === release.version && !sameManifest(previous, release) && !(allowPackageReinstall && state.wholePlugin?.pending === false && Object.values(state.removed).every((record) => !record.pending))) throw new Error("RELEASE_CONTENT_CHANGED");
			}
		} catch (error) {
			if (error.code !== "ENOENT") throw error;
			state = {
				schemaVersion: 1,
				revision: 0,
				version: release.version,
				removed: {},
				restartRequired: false,
				manifest: release
			};
			await atomicJson(stateFile, state);
		}
		let incompleteReinstall = false;
		if (allowPackageReinstall && state.wholePlugin?.pending === false && Object.values(state.removed).every((record) => !record.pending)) {
			const files = [...release.core, ...release.modules.flatMap((module) => module.files)];
			let complete = true, present = false;
			for (const file of files) {
				try {
					await access(await confinedPath(roots[file.root], file.path));
					present = true;
				} catch (error) {
					if (error.code !== "ENOENT") throw error;
				}
				try {
					await verifyArtifact(roots, file);
				} catch {
					complete = false;
				}
			}
			if (complete && files.length) {
				delete state.wholePlugin;
				state.removed = {};
				state.version = release.version;
				state.manifest = release;
				state.restartRequired = false;
				state.revision++;
				await atomicJson(stateFile, state);
			} else incompleteReinstall = present;
		}
		if (state.version !== release.version && !state.wholePlugin) {
			state.version = release.version;
			state.manifest = release;
			state.restartRequired = false;
			state.revision++;
			await atomicJson(stateFile, state);
		}
		const manager = new ModuleManager(release, state, stateFile, roots, lifecycle);
		if (incompleteReinstall) manager.cleanupErrors.set("plugin", "PLUGIN_REINSTALL_INCOMPLETE");
		if (state.wholePlugin) await lifecycle.stopCore();
		for (const id of Object.keys(state.removed)) await manager.finishRemoval(id);
		if (state.wholePlugin) await manager.finishRemoval("plugin");
		for (const module of release.modules) {
			if (state.removed[module.id] || state.wholePlugin) continue;
			try {
				for (const file of module.files) await verifyArtifact(roots, file);
			} catch {
				manager.unavailable.add(module.id);
			}
		}
		if (!state.wholePlugin) for (const file of release.core) await verifyArtifact(roots, file);
		if (state.restartRequired && !state.wholePlugin && !manager.unavailable.size) {
			state.restartRequired = false;
			state.revision++;
			await manager.save();
		}
		return manager;
	}
	isInstalled(id) {
		return !this.state.wholePlugin && !this.state.removed[id] && !this.unavailable.has(id) && this.manifest.modules.some((m) => m.id === id);
	}
	/** Includes tombstones for modules absent from an intermediate release. */
	autoInstallBlocked(id) {
		return !!this.state.wholePlugin || !!this.state.removed[id];
	}
	snapshot() {
		return {
			schemaVersion: 1,
			revision: this.state.revision,
			version: this.state.version,
			pluginRemoved: !!this.state.wholePlugin,
			restartRequired: this.state.restartRequired,
			...this.state.wholePlugin?.pending ? { cleanupPending: true } : {},
			...this.cleanupErrors.size ? { cleanupErrors: [...this.cleanupErrors.values()] } : {},
			modules: this.manifest.modules.map(({ id }) => {
				const removal = this.state.wholePlugin ?? this.state.removed[id];
				return {
					id,
					autoInstallBlocked: !!removal,
					status: removal ? removal.pending ? "pending-delete" : "removed" : this.unavailable.has(id) ? "unavailable" : "installed"
				};
			})
		};
	}
	async uninstall(request) {
		return this.exclusive(request.expectedRevision, async () => {
			if (this.state.wholePlugin && !request.wholePlugin) throw new ModuleOperationError("PLUGIN_REMOVED");
			if (this.state.restartRequired) throw new ModuleOperationError("PLUGIN_RESTART_REQUIRED");
			if (typeof request.preserveData !== "boolean" || [
				request.preserveConfig,
				request.preserveHistory,
				request.wholePlugin
			].some((value) => value !== void 0 && typeof value !== "boolean") || !Array.isArray(request.ids) || request.ids.length > 64 || request.ids.some((id) => !this.manifest.modules.some((m) => m.id === id)) || !request.wholePlugin && !request.ids.length) throw new ModuleOperationError("INVALID_MODULE_REQUEST", 400);
			const ids = request.wholePlugin ? this.manifest.modules.map((m) => m.id) : [...new Set(request.ids)];
			if (!request.wholePlugin && ids.some((id) => this.state.removed[id] && !this.state.removed[id].pending)) throw new ModuleOperationError("MODULE_ALREADY_REMOVED");
			const previous = structuredClone(this.state);
			const record = {
				preserveData: request.preserveData,
				preserveConfig: request.preserveConfig ?? request.preserveData,
				preserveHistory: request.preserveHistory ?? request.preserveData,
				pending: true
			};
			for (const id of ids) this.state.removed[id] ??= { ...record };
			if (request.wholePlugin) this.state.wholePlugin ??= { ...record };
			this.state.revision++;
			try {
				await this.save();
			} catch (error) {
				this.state = previous;
				throw error;
			}
			if (request.wholePlugin) try {
				await this.lifecycle.stopCore();
			} catch {
				this.cleanupErrors.set("plugin", "PLUGIN_STOP_FAILED");
				return this.snapshot();
			}
			for (const id of ids) await this.finishRemoval(id);
			if (request.wholePlugin) await this.finishRemoval("plugin");
			return this.snapshot();
		});
	}
	async finishRemoval(id) {
		const record = id === "plugin" ? this.state.wholePlugin : this.state.removed[id];
		if (!record) return;
		if (this.state.wholePlugin && !record.pending) return;
		const files = id === "plugin" ? this.manifest.core : this.manifest.modules.find((m) => m.id === id)?.files ?? [];
		record.pending = true;
		this.cleanupErrors.delete(id);
		try {
			if (id === "plugin" && Object.values(this.state.removed).some((item) => item.pending)) return;
			if (id !== "plugin") await this.lifecycle.stop(id);
			const configuration = !(record.preserveConfig ?? record.preserveData), history = !(record.preserveHistory ?? record.preserveData);
			if (!record.erased) {
				if (configuration || history) await this.lifecycle.eraseData(id, {
					configuration,
					history
				});
				record.erased = true;
				await this.save();
			}
			let failed = false;
			for (const file of files) try {
				await removeArtifact(this.roots, file);
			} catch {
				failed = true;
			}
			if (failed) this.cleanupErrors.set(id, `${id.toUpperCase()}_FILE_DELETE_PENDING`);
			record.pending = failed;
		} catch {
			this.cleanupErrors.set(id, `${id.toUpperCase()}_CLEANUP_PENDING`);
		}
		await this.save();
	}
	/** Called by the release transaction after all bytes and their hashes are validated. */
	async install(release, expectedRevision, restoreId, replace) {
		return this.exclusive(expectedRevision, async () => {
			if (this.state.wholePlugin) throw new ModuleOperationError("PLUGIN_REMOVED");
			if (this.state.restartRequired) throw new ModuleOperationError("PLUGIN_RESTART_REQUIRED");
			const next = validateManifest(release);
			if (compareReleaseVersions(next.version, this.state.version) < 0) throw new ModuleOperationError("MODULE_DOWNGRADE_REFUSED");
			const upgrade = next.version !== this.state.version;
			const owners = (manifest) => new Map([...manifest.core.map((f) => [`${f.root}/${f.path}`.toLowerCase(), "core"]), ...manifest.modules.flatMap((m) => m.files.map((f) => [`${f.root}/${f.path}`.toLowerCase(), m.id]))]);
			const previousOwners = owners(this.manifest);
			for (const [path, owner] of owners(next)) if (previousOwners.has(path) && previousOwners.get(path) !== owner) throw new ModuleOperationError("MODULE_FILE_OWNER_CHANGED");
			if (!upgrade && !sameManifest(next, this.manifest)) throw new ModuleOperationError("RELEASE_CONTENT_CHANGED");
			if (restoreId && !next.modules.some((m) => m.id === restoreId)) throw new ModuleOperationError("MODULE_NOT_IN_RELEASE");
			if (restoreId && this.state.removed[restoreId]?.pending) throw new ModuleOperationError("MODULE_CLEANUP_PENDING");
			if (restoreId && this.isInstalled(restoreId)) throw new ModuleOperationError("MODULE_ALREADY_INSTALLED");
			if (!upgrade && !restoreId) return this.snapshot();
			const selected = next.modules.filter((m) => m.id === restoreId || upgrade && !this.state.removed[m.id]);
			const files = [...upgrade ? next.core : [], ...selected.flatMap((m) => m.files)];
			const nextPaths = new Set([...next.core, ...next.modules.flatMap((m) => m.files)].map((f) => `${f.root}/${f.path}`.toLowerCase()));
			const obsolete = upgrade ? [...this.manifest.core, ...this.manifest.modules.flatMap((m) => m.files)].filter((f) => !nextPaths.has(`${f.root}/${f.path}`.toLowerCase())) : [];
			const previous = structuredClone(this.state), previousManifest = this.manifest;
			const stopped = [];
			let coreStopped = false;
			try {
				if (upgrade) {
					coreStopped = true;
					await this.lifecycle.stopCore();
					for (const module of this.manifest.modules) {
						if (!this.isInstalled(module.id)) continue;
						stopped.push(module.id);
						await this.lifecycle.stop(module.id);
					}
				}
				await replace(files, async (persist) => {
					for (const file of files) await verifyArtifact(this.roots, file);
					if (!upgrade && restoreId) try {
						await this.lifecycle.start(restoreId);
					} catch {
						await this.lifecycle.stop(restoreId);
						throw new ModuleOperationError("MODULE_ACTIVATION_FAILED", 500);
					}
					this.manifest = next;
					this.state.manifest = next;
					this.state.version = next.version;
					this.state.restartRequired = upgrade;
					if (restoreId) delete this.state.removed[restoreId];
					this.state.revision++;
					if (persist) await persist(this.state);
					else await this.save();
				}, obsolete);
			} catch (error) {
				if (error instanceof ModuleRollbackError || error instanceof ModuleCommittedError) {
					this.state.restartRequired = true;
					throw error;
				}
				this.state = previous;
				this.manifest = previousManifest;
				await this.save();
				if (!upgrade && restoreId) await this.lifecycle.stop(restoreId);
				for (const id of stopped) await this.lifecycle.start(id);
				if (coreStopped) await this.lifecycle.startCore();
				throw error;
			}
			for (const module of selected) this.unavailable.delete(module.id);
			return this.snapshot();
		});
	}
	save() {
		return atomicJson(this.stateFile, this.state);
	}
	async exclusive(revision, action) {
		if (this.busy) throw new ModuleOperationError("MODULE_OPERATION_BUSY");
		if (!Number.isSafeInteger(revision) || revision !== this.state.revision) throw new ModuleOperationError("MODULE_STATE_CONFLICT");
		this.busy = true;
		try {
			return await withFileLock(this.stateFile, async () => {
				const disk = JSON.parse(await readFile(this.stateFile, "utf8"));
				if (JSON.stringify(disk) !== JSON.stringify(this.state)) throw new ModuleOperationError("MODULE_STATE_CONFLICT");
				return action();
			});
		} finally {
			this.busy = false;
		}
	}
};
/** Release identity does not depend on JSON object or artifact listing order. */
function sameManifest(left, right) {
	const files = (items) => items.map((f) => [
		f.root,
		f.path,
		f.sha256,
		f.size
	]).sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
	const canonical = (manifest) => JSON.stringify({
		version: manifest.version,
		core: files(manifest.core),
		modules: manifest.modules.map((m) => ({
			id: m.id,
			files: files(m.files)
		})).sort((a, b) => a.id.localeCompare(b.id))
	});
	return canonical(left) === canonical(right);
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
//#region plugins/dsh-token-monitor/src/module-releases.ts
/** Formal GitHub releases carry a manifest and one data-only gzip pack per owner. */
const REPOSITORY = "wssfk12138/dsh-damage-pulse";
const API = `https://api.github.com/repos/${REPOSITORY}/releases`;
const MAX_BYTES = 262144e3;
const gunzip$1 = promisify(gunzip);
const object = (v) => !!v && typeof v === "object" && !Array.isArray(v);
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
const artifactKey = (file) => `${file.root}/${file.path}`;
/** Only fixed GitHub endpoints and their release-asset redirect host may receive requests. */
async function download(url, limit, signal, fetcher) {
	let target = new URL(url);
	for (let redirects = 0; redirects < 4; redirects++) {
		if (!(target.hostname === "api.github.com" && target.pathname.startsWith(`/repos/${REPOSITORY}/releases`) || target.hostname === "github.com" && target.pathname.startsWith(`/${REPOSITORY}/releases/download/`) || redirects > 0 && target.hostname === "release-assets.githubusercontent.com") || target.protocol !== "https:" || target.username || target.password || target.port || target.hash) throw new Error("RELEASE_URL_REFUSED");
		const response = await fetcher(target, {
			redirect: "manual",
			signal,
			headers: {
				Accept: "application/vnd.github+json",
				"User-Agent": "dsh-token-monitor-modules"
			}
		});
		if ([
			301,
			302,
			303,
			307,
			308
		].includes(response.status)) {
			await response.body?.cancel();
			const location = response.headers.get("location");
			if (!location) throw new Error("RELEASE_REDIRECT_INVALID");
			target = new URL(location, target);
			continue;
		}
		if (!response.ok) {
			await response.body?.cancel();
			throw new Error(`GITHUB_HTTP_${response.status}`);
		}
		const length = Number(response.headers.get("content-length") ?? 0);
		if (!Number.isFinite(length) || length > limit) {
			await response.body?.cancel();
			throw new Error("RELEASE_RESPONSE_TOO_LARGE");
		}
		if (!response.body) throw new Error("RELEASE_RESPONSE_EMPTY");
		const reader = response.body.getReader(), chunks = [];
		let size = 0;
		try {
			while (true) {
				const item = await reader.read();
				if (item.done) break;
				size += item.value.length;
				if (size > limit) throw new Error("RELEASE_RESPONSE_TOO_LARGE");
				chunks.push(item.value);
			}
		} finally {
			await reader.cancel().catch(() => void 0);
			reader.releaseLock();
		}
		return Buffer.concat(chunks, size);
	}
	throw new Error("RELEASE_REDIRECT_LIMIT");
}
/** Every operation performs a fresh release lookup; callers cannot pick arbitrary versions. */
var ModuleReleases = class {
	fetcher;
	timeoutMs;
	constructor(fetcher = fetch, timeoutMs = 6e4) {
		this.fetcher = fetcher;
		this.timeoutMs = timeoutMs;
	}
	async bytes(url, limit) {
		return download(url, limit, AbortSignal.timeout(this.timeoutMs), this.fetcher);
	}
	async list() {
		const releases = [];
		for (let page = 1; page <= 100; page++) {
			const rows = JSON.parse(Buffer.from(await this.bytes(`${API}?per_page=100&page=${page}`, 8388608)).toString("utf8"));
			if (!Array.isArray(rows)) throw new Error("INVALID_GITHUB_RELEASE_LIST");
			for (const row of rows) {
				if (!object(row) || row.draft !== false || row.prerelease !== false || typeof row.tag_name !== "string") continue;
				const version = row.tag_name.replace(/^v/, "");
				if (!validReleaseVersion(version) || !Array.isArray(row.assets)) continue;
				const assets = row.assets.flatMap((a) => {
					if (!object(a) || typeof a.name !== "string" || typeof a.browser_download_url !== "string" || typeof a.size !== "number" || !Number.isSafeInteger(a.size) || a.size < 0 || a.size > MAX_BYTES || typeof a.digest !== "string" || !/^sha256:[a-f0-9]{64}$/.test(a.digest)) return [];
					const url = new URL(a.browser_download_url);
					if (url.origin !== "https://github.com" || url.username || url.password || url.search || url.hash || !url.pathname.startsWith(`/${REPOSITORY}/releases/download/${encodeURIComponent(row.tag_name)}/`)) return [];
					return [{
						name: a.name,
						url: url.href,
						size: a.size,
						digest: a.digest.slice(7)
					}];
				});
				if (new Set(assets.map((a) => a.name)).size !== assets.length || releases.some((r) => r.version === version)) throw new Error("AMBIGUOUS_RELEASE");
				releases.push({
					version,
					assets
				});
			}
			if (rows.length < 100) return releases.sort((a, b) => compareReleaseVersions(b.version, a.version));
		}
		throw new Error("GITHUB_RELEASE_LIST_TOO_LARGE");
	}
	async asset(release, name, limit) {
		const asset = release.assets.find((a) => a.name === name);
		if (!asset) throw new Error("MODULE_RELEASE_UNAVAILABLE");
		if (asset.size > limit) throw new Error("RELEASE_RESPONSE_TOO_LARGE");
		const bytes = await this.bytes(asset.url, limit);
		if (bytes.length !== asset.size || hash(bytes) !== asset.digest) throw new Error("RELEASE_DIGEST_MISMATCH");
		return bytes;
	}
	async manifest(release) {
		const name = `token-monitor-${release.version}.manifest.json`;
		if (!release.assets.some((a) => a.name === name)) return void 0;
		const manifest = validateManifest(JSON.parse(Buffer.from(await this.asset(release, name, 8388608)).toString("utf8")));
		if (manifest.version !== release.version) throw new Error("RELEASE_VERSION_MISMATCH");
		return manifest;
	}
	/** Download and verify all selected bytes before any service is stopped. */
	async prepare(release, manifest, owners) {
		const result = /* @__PURE__ */ new Map();
		for (const owner of owners) {
			const files = owner === "core" ? manifest.core : manifest.modules.find((m) => m.id === owner)?.files;
			if (!files) throw new Error("MODULE_NOT_IN_RELEASE");
			const pack = await this.asset(release, `token-monitor-${release.version}.${owner}.json.gz`, MAX_BYTES);
			const value = JSON.parse((await gunzip$1(pack, { maxOutputLength: 367001600 })).toString("utf8"));
			if (!object(value) || value.schemaVersion !== 1 || !Array.isArray(value.files) || value.files.length !== files.length) throw new Error("INVALID_MODULE_PACK");
			const expected = new Map(files.map((f) => [artifactKey(f), f]));
			for (const entry of value.files) {
				if (!object(entry) || typeof entry.key !== "string" || typeof entry.data !== "string") throw new Error("INVALID_MODULE_PACK");
				const file = expected.get(entry.key);
				if (!file || entry.data.length !== 4 * Math.ceil(file.size / 3)) throw new Error("INVALID_MODULE_PACK");
				const bytes = Buffer.from(entry.data, "base64");
				if (bytes.length !== file.size || bytes.toString("base64") !== entry.data || hash(bytes) !== file.sha256) throw new Error("ARTIFACT_DIGEST_MISMATCH");
				result.set(entry.key, bytes);
				expected.delete(entry.key);
			}
			if (expected.size) throw new Error("INVALID_MODULE_PACK");
		}
		return result;
	}
};
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
//#region plugins/dsh-token-monitor/src/module-routes.ts
async function readBody(req) {
	if (req.headers["content-type"]?.split(";")[0]?.trim() !== "application/json") throw new ModuleOperationError("UNSUPPORTED_MEDIA_TYPE", 415);
	const chunks = [];
	let size = 0;
	for await (const chunk of req) {
		const bytes = Buffer.from(chunk);
		size += bytes.length;
		if (size > 16384) throw new ModuleOperationError("PAYLOAD_TOO_LARGE", 413);
		chunks.push(bytes);
	}
	try {
		const value = JSON.parse(Buffer.concat(chunks).toString("utf8"));
		if (value && typeof value === "object" && !Array.isArray(value)) return value;
	} catch {}
	throw new ModuleOperationError("INVALID_JSON", 400);
}
function registerModuleRoutes(ctx, manager, stateFile, releases = new ModuleReleases(), liveRoutes = () => ({})) {
	const guard = createRouteGuard(ctx), work = new ModuleWork();
	for (const [path, key] of [
		["notification-events", "notificationEvents"],
		["overview", "overview"],
		["display-scope", "displayScope"]
	]) ctx.effect(() => ctx.webServer.register({
		kind: "exact",
		path: "/api/token-monitor/modules/" + path,
		handler: (req, res) => {
			if (!guard(req, res)) return;
			if (req.method !== "GET" && !(key === "notificationEvents" && req.method === "HEAD")) {
				res.writeHead(405, {
					Allow: key === "notificationEvents" ? "GET, HEAD" : "GET",
					"Cache-Control": "no-store"
				});
				res.end();
				return;
			}
			const handler = liveRoutes()[key];
			if (handler) {
				handler(req, res);
				return;
			}
			res.writeHead(204, { "Cache-Control": "no-store" });
			res.end();
		}
	}), "token-monitor: " + path + " lifecycle route");
	let busy = false;
	ctx.effect(() => () => work.stop(), "token-monitor: management requests");
	const install = async (expectedRevision, restore) => {
		const current = manager.snapshot(), list = await releases.list();
		const release = restore && !restore.upgrade ? list.find((r) => r.version === current.version) : list[0];
		if (!release) throw new ModuleOperationError("MODULE_RELEASE_UNAVAILABLE");
		if (restore?.upgrade && compareReleaseVersions(release.version, current.version) <= 0) throw new ModuleOperationError("NO_NEWER_RELEASE");
		const manifest = await releases.manifest(release);
		if (!manifest) throw new ModuleOperationError("MODULE_RELEASE_UNAVAILABLE");
		const upgrade = compareReleaseVersions(manifest.version, current.version) > 0;
		if (!upgrade && !restore) return current;
		const owners = [...upgrade ? ["core"] : [], ...manifest.modules.filter((m) => m.id === restore?.id || upgrade && !manager.autoInstallBlocked(m.id)).map((m) => m.id)];
		const bytes = await releases.prepare(release, manifest, owners);
		return manager.install(manifest, expectedRevision, restore?.id, (files, commit, obsolete) => replaceModuleArtifacts(stateFile, manager.roots, files, async (file) => {
			const data = bytes.get(artifactKey(file));
			if (!data) throw new Error("MODULE_PACK_FILE_MISSING");
			return data;
		}, commit, obsolete));
	};
	for (const action of [
		"",
		"/uninstall",
		"/check",
		"/update",
		"/restore-plan",
		"/restore"
	]) ctx.effect(() => ctx.webServer.register({
		kind: "exact",
		path: `/api/token-monitor/modules${action}`,
		handler: async (req, res) => {
			if (!guard(req, res)) return;
			const json = (status, value) => {
				res.writeHead(status, {
					"Content-Type": "application/json; charset=utf-8",
					"Cache-Control": "no-store"
				});
				res.end(JSON.stringify(value));
			};
			if (req.method !== (action ? "POST" : "GET")) {
				json(405, { error: { code: "METHOD_NOT_ALLOWED" } });
				return;
			}
			if (!action) {
				json(200, manager.snapshot());
				return;
			}
			if (busy) {
				json(409, { error: { code: "MODULE_OPERATION_BUSY" } });
				return;
			}
			busy = true;
			try {
				json(200, await work.run(async () => {
					const body = await readBody(req), current = manager.snapshot();
					if (action === "/uninstall") return manager.uninstall(body);
					if (current.pluginRemoved) throw new ModuleOperationError("PLUGIN_REMOVED");
					if (action === "/update" || action === "/restore") {
						if (!Number.isSafeInteger(body.expectedRevision) || body.expectedRevision !== current.revision) throw new ModuleOperationError("MODULE_STATE_CONFLICT");
						if (action === "/restore" && (!validModuleId(body.id) || !current.modules.some((module) => module.id === body.id) || typeof body.upgrade !== "boolean")) throw new ModuleOperationError("INVALID_MODULE_REQUEST", 400);
						return install(body.expectedRevision, action === "/restore" ? body : void 0);
					}
					const list = await releases.list(), latest = list[0];
					if (!latest) throw new ModuleOperationError("MODULE_RELEASE_UNAVAILABLE");
					const hasUpdate = compareReleaseVersions(latest.version, current.version) > 0;
					if (action === "/check") return {
						currentVersion: current.version,
						latestVersion: latest.version,
						hasUpdate,
						compatible: !!await releases.manifest(latest)
					};
					if (!validModuleId(body.id) || !current.modules.some((m) => m.id === body.id)) throw new ModuleOperationError("INVALID_MODULE_REQUEST", 400);
					const same = list.find((r) => r.version === current.version), manifest = same ? await releases.manifest(same) : void 0;
					return {
						id: body.id,
						currentVersion: current.version,
						latestVersion: latest.version,
						hasUpdate,
						currentAvailable: !!manifest?.modules.some((m) => m.id === body.id)
					};
				}));
			} catch (error) {
				const code = error instanceof Error && /^[A-Z0-9_]{1,100}$/.test(error.message) ? error.message : "MODULE_OPERATION_FAILED";
				const errno = error?.code;
				const diagnostic = [
					(/* @__PURE__ */ new Date()).toISOString(),
					action.slice(1),
					code,
					typeof errno === "string" && /^[A-Z0-9_]+$/.test(errno) ? errno : ""
				].filter(Boolean).join(" | ");
				json(error instanceof ModuleOperationError ? error.httpStatus : 500, { error: {
					code,
					diagnostic
				} });
			} finally {
				busy = false;
			}
		}
	}), `token-monitor: module ${action || "snapshot"} route`);
}
fileURLToPath(new URL("../../../assets/dsh-token-monitor/", import.meta.url));
function isMissingFile(error) {
	return error.code === "ENOENT";
}
function resolvePngPath(assetDirectory, routePath, requestUrl) {
	let pathname;
	try {
		pathname = decodeURIComponent(new URL(requestUrl ?? "/", "http://localhost").pathname);
	} catch {
		return;
	}
	const relativePath = pathname.slice(routePath.length + 1);
	const segments = relativePath.split("/");
	if (!pathname.startsWith(`${routePath}/`) || !relativePath.toLowerCase().endsWith(".png") || segments.some((segment) => segment === "" || segment === "." || segment === ".." || segment.includes("\\") || segment.includes("\0"))) return;
	const root = resolve(assetDirectory);
	const candidate = resolve(root, ...segments);
	return candidate.startsWith(`${root}${sep}`) ? candidate : void 0;
}
function createTokenMonitorAssetHandler(routePath, assetDirectory) {
	return async (request, response) => {
		if (request.method !== "GET" && request.method !== "HEAD") {
			response.writeHead(405, { Allow: "GET, HEAD" });
			response.end();
			return;
		}
		const assetPath = resolvePngPath(assetDirectory, routePath, request.url);
		if (assetPath === void 0) {
			response.writeHead(404);
			response.end();
			return;
		}
		let body;
		try {
			body = await readFile(assetPath);
		} catch (error) {
			response.writeHead(isMissingFile(error) ? 404 : 500);
			response.end();
			return;
		}
		response.writeHead(200, {
			"Content-Type": "image/png",
			"Content-Length": String(body.byteLength),
			"Cache-Control": "public, max-age=3600"
		});
		response.end(request.method === "HEAD" ? void 0 : body);
	};
}
//#endregion
//#region plugins/dsh-token-monitor/src/client-entry.ts
/**
* The desktop discovers lib/client.js from package exports, while installed
* module updates replace runtime/client/client.js. Keep the static entry a
* verified mirror of that single, self-contained bundle before services start.
* This lives in the updatable manager, not the old package's frozen loader, so
* 4.2.1 installations can receive the repair through their existing updater.
* The boot lease excludes concurrent writers. A same-directory rename either
* leaves the old entry or commits the complete new one; retry is idempotent.
*/
async function synchronizeClientEntry(roots, manifest) {
	const pluginRoot = resolve(roots.host, "../..");
	if (resolve(roots.host) !== resolve(pluginRoot, "runtime/host") || resolve(roots.client) !== resolve(pluginRoot, "runtime/client")) return;
	let pkg;
	try {
		pkg = JSON.parse(await readFile(await confinedPath(pluginRoot, "package.json"), "utf8"));
	} catch (error) {
		if (error.code === "ENOENT") return;
		throw error;
	}
	if (pkg.name !== "dsh-damage-pulse") return;
	const entry = pkg.exports?.["./client"];
	if (entry === "./runtime/client/client.js") return;
	if (entry !== "./lib/client.js") throw new Error("UNSUPPORTED_INSTALLED_CLIENT_ENTRY");
	const artifact = manifest.core.find((file) => file.root === "client" && file.path === "client.js");
	if (!artifact) throw new Error("CLIENT_ENTRY_NOT_IN_MANIFEST");
	await verifyArtifact(roots, artifact);
	const target = await confinedPath(pluginRoot, "lib/client.js");
	const mirrorRoots = {
		...roots,
		client: resolve(pluginRoot, "lib")
	};
	try {
		await verifyArtifact(mirrorRoots, artifact);
		return;
	} catch (error) {
		if (error.code !== "ENOENT" && error.message !== "ARTIFACT_DIGEST_MISMATCH") throw error;
	}
	const temporaryArtifact = {
		...artifact,
		path: `client.js.${randomUUID()}.tmp`
	};
	const temporary = await confinedPath(mirrorRoots.client, temporaryArtifact.path);
	await mkdir(mirrorRoots.client, { recursive: true });
	try {
		await copyFile(await confinedPath(roots.client, artifact.path), temporary, constants.COPYFILE_EXCL);
		await verifyArtifact(mirrorRoots, temporaryArtifact);
		await rename(temporary, target);
	} finally {
		await unlink(temporary).catch((error) => {
			if (error.code !== "ENOENT") throw error;
		});
	}
}
//#endregion
//#region plugins/dsh-token-monitor/src/runtime-host.ts
async function apply(ctx, options) {
	const { roots, stateFile, manifest } = options;
	await synchronizeClientEntry(roots, manifest);
	const core = options.loadCore ? await options.loadCore() : await import(pathToFileURL(resolve(roots.host, "core.mjs")).href + `?v=${manifest.version}`);
	const services = options.services !== void 0 ? await options.services(ctx) : await core.createServices(ctx, roots.assets, options.dataDir ?? dshHomePath("data", "dsh-token-monitor"));
	const children = /* @__PURE__ */ new Map();
	let coreChild, coreRuntime;
	let manager;
	const lifecycle = {
		async start(id) {
			if (children.has(id)) return;
			const feature = options.loadFeature ? await options.loadFeature(id) : await import(pathToFileURL(resolve(roots.host, `${id}.mjs`)).href + `?v=${manifest.version}`);
			const child = ctx.plugin({
				name: `token-monitor-${id}`,
				apply: (scope) => feature.apply(scope, services)
			});
			children.set(id, child);
			try {
				await child.await();
			} catch (error) {
				await child.dispose();
				children.delete(id);
				throw error;
			}
		},
		async stop(id) {
			await coreRuntime?.drainSettings();
			const child = children.get(id);
			if (child) {
				await child.dispose();
				children.delete(id);
			}
		},
		async startCore() {
			if (coreChild) return;
			coreChild = ctx.plugin({
				name: "token-monitor-background-core",
				apply(scope) {
					coreRuntime = core.apply(scope, services, (id) => manager.isInstalled(id));
				}
			});
			await coreChild.await();
		},
		async stopCore() {
			if (coreChild) {
				await coreChild.dispose();
				coreChild = void 0;
				coreRuntime = void 0;
			}
		},
		async eraseData(id, selection = {
			configuration: true,
			history: true
		}) {
			const resume = !!coreChild && id !== "plugin";
			if (selection.history) await lifecycle.stopCore();
			try {
				await core.eraseData(ctx, services, id, selection);
			} finally {
				if (selection.history && resume) await lifecycle.startCore();
			}
		}
	};
	manager = await ModuleManager.open(manifest, stateFile, roots, lifecycle);
	ctx.inject(["webServer"], (web) => {
		for (const directory of ["settings-ui/cute", "whale-girl"]) {
			const path = `${TOKEN_MONITOR_ASSET_BASE}/${directory}`;
			const serve = createTokenMonitorAssetHandler(path, resolve(roots.assets, directory));
			web.effect(() => web.webServer.register({
				kind: "prefix",
				path,
				handler: (req, res) => {
					if (manager.snapshot().pluginRemoved && !manager.snapshot().cleanupPending || directory === "whale-girl" && !manager.isInstalled("pet")) {
						res.writeHead(404);
						res.end();
						return;
					}
					return serve(req, res);
				}
			}), "token-monitor: owned asset route");
		}
	});
	if (!manager.snapshot().pluginRemoved) {
		const ordered = /* @__PURE__ */ new Set([
			"wechat",
			"billing",
			"notify",
			"overview",
			"pet",
			...manifest.modules.map((module) => module.id)
		]);
		for (const id of ordered) if (manager.isInstalled(id)) await lifecycle.start(id);
		await lifecycle.startCore();
	}
	ctx.inject(["webServer", "connection"], (web) => registerModuleRoutes(web, manager, stateFile, void 0, () => services));
}
//#endregion
export { apply };
