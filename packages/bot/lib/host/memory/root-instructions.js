import { lstat } from 'node:fs/promises';
import { join } from 'node:path';
// Native defaults, including their local overlays. Never open or remove instruction files.
export const rootCandidates = ['AGENTS.md', 'CLAUDE.md', 'AGENTS.local.md', 'CLAUDE.local.md'];
export const rootInstructionNotice = 'Bots root instructions are loaded by DSH natively. They are outside shared memory quotas, '
    + 'conflict resolution and forgetting rules. Affected forgetting stays blocked until the source is handled and verified.';
export async function detectRootInstructions(root) {
    const files = await Promise.all(rootCandidates.map(async (name) => {
        const path = join(root, name);
        try {
            const info = await lstat(path);
            return { path, state: info.isFile() ? 'present' : 'unknown' };
        }
        catch (error) {
            return { path, state: error.code === 'ENOENT' ? 'absent' : 'unknown' };
        }
    }));
    return { root, files };
}
//# sourceMappingURL=root-instructions.js.map
export const DSH_BOT_MODULE_VERSION = '0.6.3';
