// Every package's exports["./client"] bundle must register with
// window.__ModuleLoader__.load({ id: <package name> }); the DSH client module
// system keys graph rows by package name. Pass --fix to rewrite stale ids.
const fs = require('fs')
const path = require('path')

const root = path.join(__dirname, '..', 'packages')
const fix = process.argv.includes('--fix')
const LOAD = /(__ModuleLoader__\.load\((?:__stardustUpdatesWrap\()?\{\s*id:\s*)(["'])([^"'<]+)\2/g
let bad = 0

for (const dir of fs.readdirSync(root).sort()) {
  const manifest = path.join(root, dir, 'package.json')
  if (!fs.existsSync(manifest)) continue
  const pkg = JSON.parse(fs.readFileSync(manifest, 'utf8'))
  const entry = pkg.exports?.['./client']
  const rel = typeof entry === 'string' ? entry : entry?.default ?? entry?.import
  if (rel === undefined) { console.log(`-        ${dir}: no ./client export`); continue }
  const file = path.join(root, dir, rel)
  if (!fs.existsSync(file)) { console.log(`MISSING  ${dir}: ${rel} not built`); bad++; continue }
  const code = fs.readFileSync(file, 'utf8')
  const ids = [...code.matchAll(LOAD)].map(m => m[3])
  const stale = [...new Set(ids.filter(id => id !== pkg.name))]
  if (ids.length === 0) { console.log(`NO-LOAD  ${dir}: ${rel} has no __ModuleLoader__.load({ id })`); bad++; continue }
  if (stale.length === 0) { console.log(`OK       ${dir}: ${pkg.name}`); continue }
  bad++
  console.log(`STALE    ${dir}: ${rel} registers ${stale.join(', ')} (package ${pkg.name})`)
  if (fix) {
    fs.writeFileSync(file, code.replace(LOAD, (all, head, q, id) => stale.includes(id) ? `${head}${q}${pkg.name}${q}` : all))
    const map = `${file}.map`
    if (fs.existsSync(map)) {
      const text = fs.readFileSync(map, 'utf8')
      fs.writeFileSync(map, stale.reduce((t, id) => t.split(`id: ${JSON.stringify(id)}`).join(`id: ${JSON.stringify(pkg.name)}`), text))
    }
    console.log(`  fixed -> ${pkg.name}`)
  }
}
if (bad > 0 && !fix) process.exitCode = 1
