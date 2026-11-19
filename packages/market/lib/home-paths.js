/**
 * Resolve the Harness home with the same semantics as the current
 * `@deepseek-ai/dsh-home-paths` package.
 */
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';
/** Default single-root Harness home. */
export function defaultDshHome() {
    return join(homedir(), '.mino');
}
/** Expand the tilde forms supported by DSH configuration. */
export function expandHomePath(path) {
    if (path === '~')
        return homedir();
    if (path.startsWith('~/') || path.startsWith('~\\'))
        return join(homedir(), path.slice(2));
    return path;
}
/**
 * Resolve an explicit home, `MINO_HOME`, `DSH_HOME`, or the default to one
 * normalized absolute path. Blank environment values are unset; an existing
 * `~/.dsh` is never adopted without an explicit pointer.
 */
export function resolveDshHome(configured, env = process.env) {
    const fromEnv = [env.MINO_HOME, env.DSH_HOME].find(v => v !== undefined && v.trim().length > 0);
    const selected = configured ?? fromEnv ?? defaultDshHome();
    return resolve(expandHomePath(selected));
}
