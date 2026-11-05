/** Verify committed build outputs are fresh: rebuild every package that has a
 * `build` script AND `src/`, then report `git status` drift on lib/dist.
 * Vendored packages (lib present but no src) are skipped — they ARE the source
 * of truth. Usage: node eval/verify-dist.mjs   (exit 1 on drift or build fail)
 */
import { execSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const PKGS = new URL('../packages/', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')
const skipped = [], failed = [], built = []
for (const name of readdirSync(PKGS)) {
  const pj = join(PKGS, name, 'package.json')
  if (!existsSync(pj)) continue
  const pkg = JSON.parse(readFileSync(pj, 'utf8'))
  if (!pkg.scripts?.build) continue
  if (!existsSync(join(PKGS, name, 'src')) && !existsSync(join(PKGS, name, 'plugin-src'))) {
    skipped.push(name); continue
  }
  try {
    execSync('pnpm build', { cwd: join(PKGS, name), stdio: 'pipe', timeout: 300_000, windowsHide: true })
    built.push(name)
  } catch (e) {
    failed.push(name)
  }
}
const drift = execSync('git status --porcelain -- packages', { encoding: 'utf8' })
  .split('\n').filter(l => l && /\/(lib|dist|plugin|native-dist)\//.test(l))
console.log(`built: ${built.length}  skipped-vendored: ${skipped.length}  build-failed: ${failed.length}`)
if (failed.length) console.log('build failed:', failed.join(', '))
if (drift.length) { console.log('DRIFT (committed output stale, commit these):'); console.log(drift.join('\n')) }
if (!drift.length && !failed.length) console.log('clean: all committed build outputs match source')
process.exit(drift.length || failed.length ? 1 : 0)
