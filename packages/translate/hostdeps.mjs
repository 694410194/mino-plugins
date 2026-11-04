/**
 * hostdeps.mjs —— 从宿主那棵树里取 `defineTool`（拿不到就退到自己的依赖，再不行用本地等价实现）。
 * 与 fish-memory/lib/hostdeps.mjs 同一策略：桌面版 profile `autoInstallPeers: false`
 * 时裸 import `@deepseek-ai/dsh-tools` 会让整条插件不激活，所以优先从宿主树解析。
 * 本包只需要 defineTool 一个件。
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { homedir } from 'node:os'
import { fileURLToPath, pathToFileURL } from 'node:url'

const SELF_MODULES = join(dirname(fileURLToPath(import.meta.url)), 'node_modules', '@deepseek-ai')

function candidateRoots() {
  const out = []
  const push = (p) => { if (p && !out.includes(p)) out.push(p) }
  push(process.env.DSH_HOST_MODULES)
  const appdata = process.env.APPDATA
  if (appdata) {
    const npm = join(appdata, 'npm', 'node_modules')
    push(join(npm, '@deepseek-ai'))
    try {
      for (const n of readdirSync(join(npm, '@deepseek-ai'))) {
        push(join(npm, '@deepseek-ai', n, 'node_modules', '@deepseek-ai'))
      }
    } catch { /* 没有就算了 */ }
  }
  try {
    const dshHome = process.env.DSH_HOME || join(homedir(), '.dsh')
    for (const p of readdirSync(join(dshHome, 'profiles'))) {
      push(join(dshHome, 'profiles', p, 'node_modules', '@deepseek-ai'))
    }
  } catch { /* 没有就算了 */ }
  push(SELF_MODULES)
  return out
}

function entryUrlFor(root, name) {
  try {
    const dir = join(root, name)
    const pkgFile = join(dir, 'package.json')
    if (!existsSync(pkgFile)) return null
    const pkg = JSON.parse(readFileSync(pkgFile, 'utf8'))
    const dot = pkg.exports?.['.']
    const rel = typeof dot === 'string' ? dot : (dot?.import || dot?.default || pkg.module || pkg.main)
    if (!rel) return null
    const file = join(dir, String(rel).replace(/^\.\//, ''))
    return existsSync(file) ? pathToFileURL(file).href : null
  } catch { return null }
}

function localDefineTool(options) {
  return options
}

export async function loadHostDeps() {
  const notes = []
  const log = (m) => notes.push(m)
  let defineTool = null
  let dtMod = null
  for (const root of candidateRoots()) {
    if (root === SELF_MODULES) continue
    const url = entryUrlFor(root, 'dsh-tools')
    if (!url) continue
    try { dtMod = await import(url); log(`dsh-tools：宿主树取到（${url}）`); break }
    catch { /* try next root */ }
  }
  if (!dtMod) {
    try { dtMod = await import('@deepseek-ai/dsh-tools'); log('dsh-tools：用自己依赖里那份') }
    catch (e) { log(`dsh-tools 拿不到（${e?.code || ''}）—— 用本地等价实现顶上`); dtMod = null }
  }
  defineTool = dtMod?.defineTool || ((options) => localDefineTool(options))
  return { defineTool, notes }
}
