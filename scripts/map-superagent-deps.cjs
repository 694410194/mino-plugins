// Point mino-superagent's @deepseek-ai/* devDeps at the sibling
// mino-agent checkout so tsc/tsdown can resolve upstream types.
const fs = require('fs')
const path = require('path')

const map = JSON.parse(fs.readFileSync('/tmp/dsh-pkg-map.json', 'utf8'))
const pkgPath = path.join(__dirname, '..', 'packages', 'superagent', 'package.json')
const j = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))

j.name = 'mino-superagent'
j.description = 'Mino proactive companion agent (fork of dsh-superagent)'
const missing = []
for (const dep of Object.keys(j.devDependencies || {})) {
  if (!dep.startsWith('@deepseek-ai/')) continue
  if (map[dep]) {
    j.devDependencies[dep] = 'file:' + path.resolve('D:/Projects/mino/mino-agent', map[dep]).replace(/\\/g, '/')
  } else {
    missing.push(dep)
    delete j.devDependencies[dep]
  }
}
delete j.peerDependencies
fs.writeFileSync(pkgPath, JSON.stringify(j, null, 2) + '\n')
console.log('missing:', missing.join(',') || 'none')
