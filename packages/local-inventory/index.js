/**
 * mino-connector-local-inventory —— 本机资产盘点连接器（conn-system 域，
 * 一次覆盖多个"盘点型"域：手机备份/截图/录音/凭据库/输入法词库）。
 * 全部只读：只列位置/数量/体积/新旧，不读内容、不取秘密。
 */
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { existsSync, readdirSync, statSync, readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { homedir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { loadHostDeps } from './hostdeps.mjs'
import { createSkillProvider } from './skill-provider.mjs'

const execFileP = promisify(execFile)
const PKG_DIR = dirname(fileURLToPath(import.meta.url))
const PKG = JSON.parse(readFileSync(join(PKG_DIR, 'package.json'), 'utf8'))

export const name = PKG.name
export const inject = ['skills', 'tools']
const defineTool = (await loadHostDeps()).defineTool

const HOME = homedir()
const APPDATA = process.env.APPDATA || join(HOME, 'AppData', 'Roaming')
const LOCAL = process.env.LOCALAPPDATA || join(HOME, 'AppData', 'Local')

const fmtSize = (n) => n > 1e9 ? `${(n / 1e9).toFixed(1)}GB` : n > 1e6 ? `${(n / 1e6).toFixed(1)}MB` : `${Math.round(n / 1e3)}KB`

function dirSize(root, maxFiles = 20000) {
  let size = 0, count = 0, newest = 0
  const walk = (d) => {
    if (count >= maxFiles) return
    let es
    try { es = readdirSync(d, { withFileTypes: true }) } catch { return }
    for (const e of es) {
      if (count >= maxFiles) return
      const p = join(d, e.name)
      try {
        if (e.isDirectory()) walk(p)
        else { const st = statSync(p); size += st.size; count++; if (st.mtimeMs > newest) newest = st.mtimeMs }
      } catch { /* skip */ }
    }
  }
  walk(root)
  return { size, count, newest: newest ? new Date(newest).toISOString().slice(0, 10) : null }
}

function findByExt(root, exts, limit = 30, maxScan = 30000) {
  const out = []
  let scanned = 0
  const walk = (d) => {
    if (out.length >= limit || scanned >= maxScan) return
    let es
    try { es = readdirSync(d, { withFileTypes: true }) } catch { return }
    for (const e of es) {
      if (out.length >= limit || scanned >= maxScan) return
      const p = join(d, e.name)
      try {
        if (e.isDirectory()) walk(p)
        else { scanned++; if (exts.some(x => e.name.toLowerCase().endsWith(x))) { const st = statSync(p); out.push({ path: p, size: st.size, mtime: st.mtime.toISOString().slice(0, 10) }) } }
      } catch { /* skip */ }
    }
  }
  walk(root)
  return out.sort((a, b) => b.mtime.localeCompare(a.mtime))
}

export function apply(ctx) {
  ctx.tools.register(defineTool({
    name: 'inventory_overview',
    description:
      '盘点本机上的个人数据资产在哪、有多大：手机备份（iTunes/华为）、截图、录音文件、' +
      '密码库文件（KeePass/Bitwarden）、输入法词库。只列位置数量体积，不读内容。用于"我的数据都在哪"摸底。',
    parameters: {},
    output: { schema: { type: 'object', additionalProperties: false, properties: {
      inventories: { type: 'object', additionalProperties: true } } },
      render: (_a, v) => [{ type: 'text', text: `盘点完成：${Object.keys(v.inventories).length} 类资产` }] },
    isConcurrencySafe: () => true,
    async execute() {
      const inv = {}
      // 手机备份
      const backups = []
      const itunes = join(APPDATA, 'Apple Computer', 'MobileSync', 'Backup')
      if (existsSync(itunes)) {
        for (const d of readdirSync(itunes, { withFileTypes: true }).filter(e => e.isDirectory())) {
          const s = dirSize(join(itunes, d.name), 5000)
          backups.push({ type: 'iTunes', dir: join(itunes, d.name), ...s, sizeHuman: fmtSize(s.size) })
        }
      }
      const huawei = join(HOME, 'Documents', 'Hisuite', 'backup')
      if (existsSync(huawei)) { const s = dirSize(huawei, 5000); backups.push({ type: '华为HiSuite', dir: huawei, ...s, sizeHuman: fmtSize(s.size) }) }
      inv['手机备份'] = backups.length ? backups : '未找到'
      // 截图
      const shots = [join(HOME, 'Pictures', 'Screenshots'), join(HOME, 'Pictures', '屏幕截图'), join(HOME, 'OneDrive', '图片', '屏幕截图')].filter(existsSync)
      inv['截图'] = shots.map(d => { const s = dirSize(d, 5000); return { dir: d, ...s, sizeHuman: fmtSize(s.size) } })
      if (!inv['截图'].length) inv['截图'] = '未找到'
      // 录音
      const recDirs = [join(HOME, 'Documents', '录音'), join(HOME, 'Documents', 'Sound recordings'), join(HOME, 'Music')].filter(existsSync)
      const recs = recDirs.flatMap(d => findByExt(d, ['.m4a', '.mp3', '.wav', '.aac', '.amr'], 50, 8000))
      inv['录音文件'] = recs.length ? recs.slice(0, 20) : '未找到'
      // 密码库
      const vaults = []
      for (const d of [HOME, join(HOME, 'Documents'), join(HOME, 'Dropbox'), join(HOME, 'OneDrive')]) {
        if (!existsSync(d)) continue
        vaults.push(...findByExt(d, ['.kdbx', '.kdb'], 20, 8000).map(f => ({ ...f, type: 'KeePass' })))
      }
      const bw = join(APPDATA, 'Bitwarden')
      if (existsSync(bw)) vaults.push({ path: bw, type: 'Bitwarden 桌面端数据目录', note: '存在即装有客户端' })
      inv['密码库'] = vaults.length ? vaults : '未找到（若用浏览器自带密码管理，密码存在浏览器配置目录里）'
      // 输入法词库
      const ime = []
      const sogou = join(APPDATA, 'SogouPY', 'scd')
      if (existsSync(sogou)) { const s = dirSize(sogou, 2000); ime.push({ type: '搜狗拼音', dir: sogou, files: s.count }) }
      const msime = join(APPDATA, 'Microsoft', 'InputMethod', 'Chs')
      if (existsSync(msime)) { const s = dirSize(msime, 2000); ime.push({ type: '微软拼音', dir: msime, files: s.count }) }
      inv['输入法词库'] = ime.length ? ime : '未找到'
      return { inventories: inv }
    },
    presentCall: (a) => ({ card: 'generic', title: '盘点本机资产', kind: 'other', rawInput: a }),
  }))

  ctx.effect(() => ctx.skills.registerProvider(() => createSkillProvider(ctx)))
}
