/**
 * mino-connector-old-disk —— 旧盘体检连接器（域 26 旧盘）。
 * disk_audit：扫指定目录/盘符，找出多年没动的老树、占空间大户、疑似重复
 * （同文件名同大小）、各类文件体积分布。只读，给清理决策用。
 */
import { existsSync, readdirSync, statSync, readFileSync } from 'node:fs'
import { join, dirname, extname } from 'node:path'
import { homedir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { loadHostDeps } from './hostdeps.mjs'
import { createSkillProvider } from './skill-provider.mjs'

const PKG_DIR = dirname(fileURLToPath(import.meta.url))
const PKG = JSON.parse(readFileSync(join(PKG_DIR, 'package.json'), 'utf8'))

export const name = PKG.name
export const inject = ['skills', 'tools']
const defineTool = (await loadHostDeps()).defineTool

const fmtSize = (n) => n > 1e9 ? `${(n / 1e9).toFixed(1)}GB` : n > 1e6 ? `${(n / 1e6).toFixed(1)}MB` : `${Math.round(n / 1e3)}KB`

function audit(root, staleYears, maxScan = 300000) {
  const now = Date.now()
  const staleMs = staleYears * 365 * 864e5
  const byExt = {}, topFiles = [], staleDirs = new Map(), dupCandidates = new Map()
  let totalSize = 0, totalFiles = 0, staleSize = 0, scanned = 0
  const dirStats = new Map()

  const walk = (d, depth) => {
    if (scanned >= maxScan || depth > 10) return { size: 0, newest: 0 }
    let es
    try { es = readdirSync(d, { withFileTypes: true }) } catch { return { size: 0, newest: 0 } }
    let dirSize = 0, newest = 0
    for (const e of es) {
      if (scanned >= maxScan) break
      const p = join(d, e.name)
      try {
        if (e.isDirectory()) {
          const sub = walk(p, depth + 1)
          dirSize += sub.size
          if (sub.newest > newest) newest = sub.newest
          continue
        }
        scanned++
        const st = statSync(p)
        dirSize += st.size; totalSize += st.size; totalFiles++
        if (st.mtimeMs > newest) newest = st.mtimeMs
        const ext = extname(e.name).toLowerCase() || '(无后缀)'
        byExt[ext] = (byExt[ext] || 0) + st.size
        if (st.mtimeMs < now - staleMs) staleSize += st.size
        topFiles.push({ p, s: st.size, t: st.mtime.toISOString().slice(0, 10) })
        if (topFiles.length > 40) { topFiles.sort((a, b) => b.s - a.s); topFiles.length = 20 }
        const key = `${e.name}|${st.size}`
        if (st.size > 1e6) dupCandidates.set(key, [...(dupCandidates.get(key) || []), p])
      } catch { /* skip */ }
    }
    if (depth >= 1 && dirSize > 50e6) dirStats.set(d, { size: dirSize, newest })
    if (newest && newest < now - staleMs && dirSize > 10e6) staleDirs.set(d, dirSize)
    return { size: dirSize, newest }
  }
  walk(root, 0)
  topFiles.sort((a, b) => b.s - a.s)
  const dups = [...dupCandidates.entries()].filter(([, ps]) => ps.length > 1)
    .map(([k, ps]) => ({ file: k.split('|')[0], size: fmtSize(+k.split('|')[1]), copies: ps.length, paths: ps.slice(0, 5) }))
  return {
    totalFiles, totalSize, staleSize, scanned, byExt,
    topFiles: topFiles.slice(0, 20),
    staleDirs: [...staleDirs.entries()].sort((a, b) => b[1] - a[1]).slice(0, 15).map(([d, s]) => ({ dir: d, size: fmtSize(s) })),
    bigDirs: [...dirStats.entries()].sort((a, b) => b[1].size - a[1].size).slice(0, 15).map(([d, v]) => ({ dir: d, size: fmtSize(v.size), newest: v.newest ? new Date(v.newest).toISOString().slice(0, 10) : '' })),
    dups: dups.slice(0, 15),
  }
}

export function apply(ctx) {
  ctx.tools.register(defineTool({
    name: 'disk_audit',
    description:
      '给一个目录/盘符做体检：总文件数和体积、多年没动的老树目录、占空间大户 TOP、' +
      '疑似重复文件（同名同大小）、按类型的体积分布。只读。找出被遗忘的角落。',
    parameters: {
      dir: { type: 'string', required: true, description: '要体检的目录（如 D:/ 或某个老硬盘盘符）' },
      staleYears: { type: 'integer', description: '多少年没动算"老树"（默认 3）' },
    },
    output: { schema: { type: 'object', additionalProperties: false, properties: {
      totalFiles: { type: 'integer' }, totalSize: { type: 'string' }, staleSize: { type: 'string' },
      byType: { type: 'object', additionalProperties: true },
      topFiles: { type: 'array', items: { type: 'object', additionalProperties: true } },
      staleDirs: { type: 'array', items: { type: 'object', additionalProperties: true } },
      bigDirs: { type: 'array', items: { type: 'object', additionalProperties: true } },
      dups: { type: 'array', items: { type: 'object', additionalProperties: true } } } },
      render: (_a, v) => [{ type: 'text', text:
        `${v.totalFiles} 个文件共 ${v.totalSize}，其中 ${v.staleSize} 多年没动；` +
        `老树目录 ${v.staleDirs.length} 个、疑似重复 ${v.dups.length} 组` }] },
    isConcurrencySafe: () => true,
    async execute(args) {
      const dir = String(args.dir || '').trim()
      if (!existsSync(dir)) throw new Error(`disk_audit: 目录不存在 ${dir}`)
      const staleYears = Math.max(1, Number.isFinite(+args.staleYears) ? +args.staleYears : 3)
      const r = audit(dir, staleYears)
      const byType = Object.fromEntries(Object.entries(r.byExt).sort((a, b) => b[1] - a[1]).slice(0, 12).map(([k, v]) => [k, fmtSize(v)]))
      return {
        totalFiles: r.totalFiles, totalSize: fmtSize(r.totalSize), staleSize: fmtSize(r.staleSize),
        byType, topFiles: r.topFiles.map(f => ({ path: f.p, size: fmtSize(f.s), mtime: f.t })),
        staleDirs: r.staleDirs, bigDirs: r.bigDirs, dups: r.dups,
      }
    },
    presentCall: (a) => ({ card: 'generic', title: '体检旧盘', kind: 'other', rawInput: a }),
  }))

  ctx.effect(() => ctx.skills.registerProvider(() => createSkillProvider(ctx)))
}
