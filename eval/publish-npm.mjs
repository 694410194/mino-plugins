/** Publish all distributable packages to npm.
 * Official channel: registry.npmjs.org (npmmirror syncs automatically).
 *
 * What it does:
 *  1. Discovers every packages/<dir>/package.json, skips `private: true` (same
 *     index generator — private means "do not distribute").
 *  2. Restores lib//dist/ build outputs from the `dist` snapshot branch for
 *     packages whose declared `main` file is missing on disk (main stays clean;
 *     the tarball gets artifacts from the snapshot).
 *  3. Publishes paced (rate-limit friendly): 10s between packages, exponential
 *     backoff on E429. Idempotent — versions already on the registry are skipped.
 *  4. --ignore-scripts: vendored packages may lack build scripts; artifacts come
 *     from the dist snapshot instead of a local rebuild.
 *
 * Prereqs: `npm login` or a granular token in ~/.npmrc (needs "bypass 2fa" for
 * unattended runs). Prerelease versions are published under --tag latest.
 *
 * Usage:
 *   node eval/publish-npm.mjs [--dry-run] [--only name1,name2]
 */
import { execSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')
const PKGS = join(ROOT, 'packages')
const REGISTRY = 'https://registry.npmjs.org'
const dryRun = process.argv.includes('--dry-run')
const onlyIdx = process.argv.indexOf('--only')
const only = onlyIdx > -1 ? process.argv[onlyIdx + 1].split(',') : null
const sleep = ms => new Promise(r => setTimeout(r, ms))
const run = (cmd, cwd) => execSync(cmd, { cwd, stdio: 'pipe', timeout: 180_000, windowsHide: true }).toString().trim()

const pkgs = []
for (const dir of readdirSync(PKGS)) {
  const pj = join(PKGS, dir, 'package.json')
  if (!existsSync(pj)) continue
  const m = JSON.parse(readFileSync(pj, 'utf8'))
  if (m.private === true) continue
  if (only && !only.includes(m.name) && !only.includes(dir)) continue
  pkgs.push([dir, m])
}

// preflight: auth + restore artifacts from dist branch
run(`npm whoami --registry ${REGISTRY}`, ROOT)
const missing = []
for (const [dir, m] of pkgs) {
  if (!m.main) continue // no main declared → DSH resolves via bundle/files, not entry
  const mainAbs = join(PKGS, dir, m.main.replace(/^\.\//, ''))
  if (!existsSync(mainAbs)) missing.push(dir)
}
if (missing.length) {
  console.log(`restoring build outputs from dist branch: ${missing.join(', ')}`)
  for (const dir of missing) {
    for (const sub of ['lib', 'dist']) {
      try { run(`git checkout dist -- packages/${dir}/${sub}`, ROOT) } catch { /* no such dir on dist */ }
    }
  }
}
const stillMissing = missing.filter(dir => {
  const m = pkgs.find(([d]) => d === dir)[1]
  return !existsSync(join(PKGS, dir, m.main.replace(/^\.\//, '')))
})
if (stillMissing.length) console.log(`WARN: main still missing after restore: ${stillMissing.join(', ')}`)

console.log(`${pkgs.length} distributable package(s)${dryRun ? ' (dry-run)' : ''}`)
const ok = [], fail = [], skip = []
for (const [dir, m] of pkgs) {
  if (dryRun) { console.log(`WOULD ${m.name}@${m.version}`); continue }
  try {
    const view = run(`npm view ${m.name}@${m.version} version --registry ${REGISTRY}`, ROOT)
    if (view === m.version) { skip.push(m.name); process.stdout.write(`SKIP ${m.name}@${m.version}\n`); continue }
  } catch { /* not published yet */ }
  let done = false, lastErr = ''
  for (let attempt = 0; attempt < 3 && !done; attempt++) {
    try {
      run(`npm publish --registry ${REGISTRY} --access public --ignore-scripts --tag latest`, join(PKGS, dir))
      ok.push(`${m.name}@${m.version}`); done = true
      process.stdout.write(`OK ${m.name}@${m.version}\n`)
    } catch (e) {
      lastErr = String(e.stderr || e.message)
      if (/E429|rate limit/i.test(lastErr)) {
        if (attempt === 2) {
          // account-scoped quota: further packages will 429 too — bail out,
          // the next scheduled run picks up where this one stopped.
          console.log(`429 quota exhausted at ${m.name} — stopping run, retry later`)
          writeFileSync(join(ROOT, 'eval/.publish-result.json'), JSON.stringify({ ok, fail: [...fail, `${m.name}: quota`], skip }, null, 2))
          process.exit(0)
        }
        const wait = 300_000 * (attempt + 1)
        process.stdout.write(`429 ${m.name} wait ${wait / 1000}s\n`)
        await sleep(wait)
      } else break
    }
  }
  if (!done) {
    const msg = lastErr.split('\n').filter(l => /error|E4|E5|EPERM/i.test(l)).slice(0, 3).join(' | ')
    fail.push(`${m.name}: ${msg.slice(0, 200)}`)
    process.stdout.write(`FAIL ${m.name} ${msg.slice(0, 160)}\n`)
  }
  await sleep(60_000) // new-account publish quota ≈ ~10 PUTs per window
}
writeFileSync(join(ROOT, 'eval/.publish-result.json'), JSON.stringify({ ok, fail, skip }, null, 2))
console.log(`\nDONE ok=${ok.length} fail=${fail.length} skip=${skip.length} (eval/.publish-result.json)`)
if (fail.length) { console.log(fail.join('\n')); process.exit(1) }
