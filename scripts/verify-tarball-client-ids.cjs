// Check packed tarballs: the ./client bundle inside each .tgz must register
// window.__ModuleLoader__.load({ id }) with the tarball's own package name.
// Usage: node scripts/verify-tarball-client-ids.cjs <dir-with-tgz>
const { execFileSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const dir = path.resolve(process.argv[2] ?? 'dist')
const LOAD = /__ModuleLoader__\.load\((?:__stardustUpdatesWrap\()?\{\s*id:\s*(["'])([^"'<]+)\1/g
const read = (tgz, member) => execFileSync('tar', ['-xOzf', path.basename(tgz), `package/${member}`], {
  cwd: dir,
  maxBuffer: 1 << 28,
}).toString('utf8')
let bad = 0
for (const file of fs.readdirSync(dir).filter(f => f.endsWith('.tgz')).sort()) {
  const tgz = path.join(dir, file)
  const pkg = JSON.parse(read(tgz, 'package.json'))
  const entry = pkg.exports?.['./client']
  const rel = (typeof entry === 'string' ? entry : entry?.default ?? entry?.import)?.replace(/^\.\//, '')
  if (rel === undefined) { console.log(`-       ${file}`); continue }
  let code
  try { code = read(tgz, rel) } catch { console.log(`MISSING ${file}: ${rel} not in tarball`); bad++; continue }
  const ids = [...new Set([...code.matchAll(LOAD)].map(m => m[2]))]
  const ok = ids.length > 0 && ids.every(id => id === pkg.name)
  if (!ok) bad++
  console.log(`${ok ? 'OK     ' : 'BAD    '} ${file}: ${ids.join(', ') || '(no registration)'}`)
}
process.exitCode = bad > 0 ? 1 : 0
