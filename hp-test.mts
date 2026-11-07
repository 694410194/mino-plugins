import { resolveDshHome } from './packages/market/src/home-paths.ts'
import { homedir } from 'node:os'
import { join } from 'node:path'
const cases: [Record<string,string|undefined>, string][] = [
  [{}, join(homedir(),'.mino')],
  [{MINO_HOME:'/x/mino'}, '/x/mino'],
  [{DSH_HOME:'/x/dsh'}, '/x/dsh'],
  [{MINO_HOME:'',DSH_HOME:'/x/dsh'}, '/x/dsh'],
  [{MINO_HOME:'  ',DSH_HOME:'  '}, join(homedir(),'.mino')],
]
let ok = true
for (const [env, want] of cases) {
  const got = resolveDshHome(undefined, env)
  if (got !== want) { ok = false; console.log('FAIL', JSON.stringify(env), '->', got, 'want', want) }
  else console.log('pass', JSON.stringify(env), '->', got)
}
process.exit(ok ? 0 : 1)
