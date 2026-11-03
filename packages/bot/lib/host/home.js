import { chmod, lstat, mkdir, open, realpath, rm, rmdir, stat, unlink } from 'node:fs/promises';
import { dirname, isAbsolute, join, relative, sep } from 'node:path';
import { constants } from 'node:fs';
import { z } from 'zod';
import { botIdSchema } from '../shared/ids.js';
import { DshBotError, parseInput } from './errors.js';
const ownerSchema = z.strictObject({
    owner: z.literal('dsh-bot'),
    version: z.literal(1),
    botId: botIdSchema,
    path: z.string(),
    dev: z.string(),
    ino: z.string(),
});
const missing = (error) => error.code === 'ENOENT';
const invalidHome = (message) => new DshBotError('bot/invalid', `Private home: ${message}`);
/** A user-selected cwd is only validated, never created, chmod'ed or deleted. */
export async function validateDefaultCwd(path) {
    if (path === undefined)
        return;
    if (!isAbsolute(path) || path.includes('\0'))
        throw new DshBotError('bot/invalid', 'defaultCwd must be an existing absolute directory');
    try {
        if (!(await stat(path)).isDirectory())
            throw new Error('Not a directory');
    }
    catch (error) {
        throw new DshBotError('bot/invalid', 'defaultCwd must be an existing absolute directory', { cause: error });
    }
}
/** Directory ownership is separate from Bot records, so keeping a home across
 * Bot deletion/recreation or Host restart never silently transfers user data.
 * The marker is outside the private home; it records the exact directory inode.
 * All Bots share the workspace root, including these per-Bot markers.
 */
export class BotHomes {
    dshHome;
    constructor(dshHome) {
        this.dshHome = dshHome;
    }
    async directory(path, root, create) {
        if (create) {
            try {
                await mkdir(path, { mode: 0o700 });
            }
            catch (error) {
                if (error.code !== 'EEXIST')
                    throw error;
            }
        }
        let info;
        try {
            info = await lstat(path);
        }
        catch (error) {
            if (!create && missing(error))
                return false;
            throw error;
        }
        if (!info.isDirectory() || info.isSymbolicLink())
            throw invalidHome('directory components must not be symlinks or files');
        const canonical = await realpath(path);
        const suffix = relative(root, canonical);
        if (canonical !== path || suffix === '' || suffix === '..' || suffix.startsWith(`..${sep}`) || isAbsolute(suffix)) {
            throw invalidHome('resolved directory escapes its owner root');
        }
        return true;
    }
    async botsRoot(create) {
        if (create)
            await mkdir(this.dshHome, { recursive: true, mode: 0o700 });
        let root;
        try {
            root = await realpath(this.dshHome);
        }
        catch (error) {
            if (!create && missing(error))
                return undefined;
            throw error;
        }
        let parent = root;
        for (const component of ['dsh-bot', 'bots']) {
            parent = join(parent, component);
            if (!(await this.directory(parent, root, create)))
                return undefined;
        }
        return { root, path: parent };
    }
    /** Shared cwd, separate from configurable skills data; never follows a managed symlink. */
    async ensureRoot() {
        try {
            const result = await this.botsRoot(true);
            if (!result)
                throw invalidHome('root is unavailable');
            await chmod(result.path, 0o700);
            return { path: result.path };
        }
        catch (error) {
            if (error instanceof DshBotError)
                throw error;
            throw new DshBotError('bot/unavailable', 'Cannot create or access the shared Bots root', { cause: error });
        }
    }
    async paths(botId, create) {
        const id = parseInput(botIdSchema, botId);
        const root = await this.botsRoot(create);
        if (!root)
            return undefined;
        const parent = join(root.path, id);
        if (!(await this.directory(parent, root.root, create)))
            return undefined;
        return { root: root.root, home: join(parent, 'home'), marker: join(parent, '.home-owner.json') };
    }
    async identity(path, botId) {
        const info = await lstat(path, { bigint: true });
        return {
            owner: 'dsh-bot',
            version: 1,
            botId,
            path: await realpath(path),
            dev: String(info.dev),
            ino: String(info.ino),
        };
    }
    async readOwner(marker) {
        // Do not follow a replaced marker into a user file. Open once to avoid a
        // check/read symlink race; all directory components were separately checked.
        const handle = await open(marker, constants.O_RDONLY | constants.O_NOFOLLOW);
        try {
            if (!(await handle.stat()).isFile())
                throw invalidHome('ownership marker is not a file');
            return ownerSchema.parse(JSON.parse(await handle.readFile('utf8')));
        }
        finally {
            await handle.close();
        }
    }
    async owned(paths, botId) {
        await this.directory(paths.home, paths.root, false);
        const expected = await this.identity(paths.home, botId);
        let saved;
        try {
            saved = await this.readOwner(paths.marker);
        }
        catch (error) {
            throw new DshBotError('bot/invalid', 'Private home ownership cannot be verified; existing directory was preserved', { cause: error });
        }
        if (saved.botId !== expected.botId ||
            saved.path !== expected.path ||
            saved.dev !== expected.dev ||
            saved.ino !== expected.ino) {
            throw invalidHome('directory was replaced or is not owned by this Bot');
        }
        return expected;
    }
    async ensure(botId) {
        try {
            const paths = await this.paths(botId, true);
            if (!paths)
                throw invalidHome('root is unavailable');
            let created = false;
            try {
                await mkdir(paths.home, { mode: 0o700 });
                created = true;
            }
            catch (error) {
                if (error.code !== 'EEXIST')
                    throw error;
            }
            await this.directory(paths.home, paths.root, false);
            if (created) {
                const marker = await open(paths.marker, 'wx', 0o600);
                try {
                    await marker.writeFile(JSON.stringify(await this.identity(paths.home, botId)), 'utf8');
                }
                finally {
                    await marker.close();
                }
            }
            await this.owned(paths, botId);
            await chmod(paths.home, 0o700);
            return { path: paths.home };
        }
        catch (error) {
            if (error instanceof DshBotError)
                throw error;
            throw new DshBotError('bot/unavailable', 'Cannot create or access the Bot private home', { cause: error });
        }
    }
    /** Validate before deleting a Bot. Recheck after its successful store commit;
     * an absent home is a no-op, and unowned paths are never adopted or deleted. */
    async prepareRemoval(botId) {
        const paths = await this.paths(botId, false);
        if (!paths || !(await this.directory(paths.home, paths.root, false)))
            return async () => { };
        const expected = await this.owned(paths, botId);
        return async () => {
            const current = await this.paths(botId, false);
            if (!current || current.home !== paths.home)
                throw invalidHome('directory changed before removal');
            const actual = await this.owned(current, botId);
            if (actual.dev !== expected.dev || actual.ino !== expected.ino)
                throw invalidHome('directory changed before removal');
            // rm does not traverse child symlinks. Only the exact owned home is
            // recursive; siblings (skills, marker and user defaultCwd) are excluded.
            await rm(current.home, { recursive: true });
            await unlink(current.marker);
            // Only an empty Bot parent may disappear. Never recursively remove it:
            // sibling skills/user files and every other Bot must survive.
            try {
                await rmdir(dirname(current.home));
            }
            catch (error) {
                if (!['ENOENT', 'ENOTEMPTY', 'EEXIST'].includes(error.code ?? ''))
                    throw error;
            }
        };
    }
}
//# sourceMappingURL=home.js.map
export const DSH_BOT_MODULE_VERSION = '0.6.3';
