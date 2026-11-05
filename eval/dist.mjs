/** Generate the `dist` snapshot branch: rebuild every package that has a
 * `build` script AND `src/`/`plugin-src/`, then snapshot packages/ INCLUDING
 * gitignored build outputs (lib/dist/plugin/native-dist/client/runtime) onto
 * the `dist` branch. Source branch `main` stays artifact-free; the server
 * split consumes `dist`. Usage: node eval/dist.mjs
 */
import { execSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')
const PKGS = join(ROOT, 'packages')
const OUT_DIRS = ['lib', 'dist', 'plugin', 'native-dist', 'client', 'runtime']
const git = (a) => execSync(`git ${a}`, { cwd: ROOT, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] })

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
  } catch { failed.push(name) }
}

const base = git('rev-parse main').trim()
git('checkout -B dist main --quiet')
try {
  for (const name of readdirSync(PKGS)) {
    for (const sub of OUT_DIRS) {
      if (existsSync(join(PKGS, name, sub))) {
        try { git(`add -f "packages/${name}/${sub}"`) } catch { /* nothing to add */ }
      }
    }
  }
  const added = git('diff --cached --name-only').trim().split('\n').filter(Boolean)
  git(`-c user.name="wuyangji" -c user.email="694410194@qq.com" commit -qm "dist snapshot of ${base.slice(0, 7)} (built: ${built.length}, vendored: ${skipped.length}, build-fail: ${failed.length})" --allow-empty`)
  const sha = git('rev-parse HEAD').trim()
  console.log(`built: ${built.length}  vendored-skip: ${skipped.length}  build-failed: ${failed.length}`)
  if (failed.length) console.log('build failed:', failed.join(', '))
  console.log(`dist commit ${sha.slice(0, 9)}: ${added.length} artifact files staged from ${base.slice(0, 7)}`)
} finally {
  git('checkout main --quiet')
}
console.log('next: git push -f origin dist && server split (rev-parse dist)')
