/**
 * mino-connector-webwatch —— 被动观察 v0。
 * 抓不到的域（12306/滴滴/淘宝订单等反爬死域）的活通道：用户在浏览器里已经
 * 打开过这些页面——扫浏览器历史命中订单/行程域 → 提示对应的导入通道
 * （复制文本给 orders/travel、截图给 connector-ocr、官方导出给 bills）。
 * 只读本机浏览器历史库（复制后只读打开），不监听不上传。
 */
import { existsSync, readFileSync, readdirSync, mkdirSync, copyFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { homedir, tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { loadHostDeps } from './hostdeps.mjs'
import { createSkillProvider } from './skill-provider.mjs'

const PKG_DIR = dirname(fileURLToPath(import.meta.url))
const PKG = JSON.parse(readFileSync(join(PKG_DIR, 'package.json'), 'utf8'))
const STORE = join(process.env.DSH_HOME || join(homedir(), '.dsh'), 'connector-webwatch')

export const name = PKG.name
export const inject = ['skills', 'tools']
const defineTool = (await loadHostDeps()).defineTool
let DatabaseSync = null
try { ({ DatabaseSync } = await import('node:sqlite')) } catch { }

// ── 订单/行程站点（命中这些域=用户在浏览器打开过订单页）────────────────────────
const SITES = [
  { site: '12306', re: /kyfw\.12306\.cn|www\.12306\.cn/i, hint: '12306 无导出——订单页全选复制文字喂 connector-travel，或截图喂 connector-ocr' },
  { site: '滴滴', re: /didiglobal\.com|didi\.cn|xiaojukeji/i, hint: '滴滴行程单在 App 里可生成 PDF 行程报销单→connector-travel' },
  { site: '淘宝订单', re: /buyertrade\.taobao\.com|trade\.taobao\.com|order.*taobao/i, hint: '淘宝订单页全选复制→connector-orders；账单侧用 connector-bills（支付宝官方导出）' },
  { site: '京东订单', re: /order\.jd\.com|jd\.com.*order/i, hint: '京东订单页复制→connector-orders；账单侧 connector-bills 支持京东账单' },
  { site: '拼多多', re: /yangkeduo|pinduoduo/i, hint: '拼多多订单页复制→connector-orders' },
  { site: '美团', re: /meituan\.com|i\.meituan|dianping/i, hint: '美团/点评订单复制→connector-orders；账单侧 connector-bills 支持美团' },
  { site: '携程', re: /ctrip\.com|trip\.com|fliggy|feizhu/i, hint: '携程/飞猪行程单导出或复制→connector-travel' },
  { site: '高德', re: /amap\.com|ditu\.amap/i, hint: '高德足迹无 API——手动点亮图喂 connector-footprints' },
  { site: '闲鱼', re: /goofish|2\.taobao|xianyu/i, hint: '闲鱼订单复制→connector-orders' },
]

// ── 浏览器历史库定位（与 connector-browser-history 同一探测面）─────────────────
const L = process.env.LOCALAPPDATA || ''
const R = process.env.APPDATA || ''

function profilesOf(root) {
  try {
    return readdirSync(root, { withFileTypes: true })
      .filter(e => e.isDirectory() && (e.name === 'Default' || e.name.startsWith('Profile') || e.name.includes('.')))
      .map(e => join(root, e.name))
  } catch { return [] }
}

function candidates() {
  const out = []
  for (const [browser, root] of [['chrome', join(L, 'Google', 'Chrome', 'User Data')],
    ['edge', join(L, 'Microsoft', 'Edge', 'User Data')],
    ['brave', join(L, 'BraveSoftware', 'Brave-Browser', 'User Data')]]) {
    for (const prof of profilesOf(root)) {
      const db = join(prof, 'History')
      if (existsSync(db)) out.push({ browser, engine: 'chromium', db })
    }
  }
  for (const prof of profilesOf(join(R, 'Mozilla', 'Firefox', 'Profiles'))) {
    const db = join(prof, 'places.sqlite')
    if (existsSync(db)) out.push({ browser: 'firefox', engine: 'firefox', db })
  }
  return out
}

const CHROME_EPOCH = 11644473600 // 1601→1970 秒差

async function readChromium(dbPath, days) {
  const tmp = join(STORE, `snap-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.db`)
  mkdirSync(STORE, { recursive: true })
  copyFileSync(dbPath, tmp)
  try {
    const db = new DatabaseSync(tmp, { readOnly: true })
    const cutoff = (Date.now() / 1000 - days * 86400 + CHROME_EPOCH) * 1e6
    const rows = db.prepare(
      `SELECT url, title, last_visit_time t FROM urls WHERE last_visit_time > ? ORDER BY last_visit_time DESC LIMIT 200000`).all(cutoff)
    db.close()
    return rows.map(r => ({ url: r.url, title: r.title || '', ts: (r.t / 1e6 - CHROME_EPOCH) * 1000 }))
  } finally { try { const { unlinkSync } = await import('node:fs'); unlinkSync(tmp) } catch { } }
}

async function readFirefox(dbPath, days) {
  const tmp = join(STORE, `snap-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.db`)
  mkdirSync(STORE, { recursive: true })
  copyFileSync(dbPath, tmp)
  try {
    const db = new DatabaseSync(tmp, { readOnly: true })
    const cutoff = (Date.now() / 1000 - days * 86400) * 1e6 // moz visit_date 微秒 unix
    const rows = db.prepare(
      `SELECT p.url, p.title, v.visit_date t FROM moz_places p JOIN moz_historyvisits v ON p.id=v.place_id
       WHERE v.visit_date > ? ORDER BY v.visit_date DESC LIMIT 200000`).all(cutoff)
    db.close()
    return rows.map(r => ({ url: r.url, title: r.title || '', ts: r.t / 1000 }))
  } finally { try { const { unlinkSync } = await import('node:fs'); unlinkSync(tmp) } catch { } }
}

export function apply(ctx) {
  ctx.tools.register(defineTool({
    name: 'watch_scan',
    description: '被动观察：扫浏览器历史（近 N 天）里访问过的订单/行程页（12306/滴滴/淘宝/京东/拼多多/美团/携程/高德/闲鱼），每个命中给出可用的导入通道。',
    parameters: {
      days: { type: 'integer', description: '回看天数（默认 30）' },
      browser: { type: 'string', description: 'chrome|edge|firefox|brave|auto（默认 auto 全扫）' },
    },
    output: { schema: { type: 'object', additionalProperties: false, properties: {
      hits: { type: 'array', items: { type: 'object' } }, browsers: { type: 'integer' } } },
      render: (_a, v) => [{ type: 'text', text: v.hits.length
        ? `命中 ${v.hits.length} 条：\n` + v.hits.slice(0, 15).map(h => `[${h.site}] ${h.when} ${h.title || h.url}`).join('\n')
        : '近 N 天没访问过订单/行程页' }] },
    isConcurrencySafe: () => true,
    async execute(args) {
      if (!DatabaseSync) throw new Error('watch_scan: 运行时缺 node:sqlite')
      const days = Math.min(Math.max(Number(args.days) || 30, 1), 365)
      const want = String(args.browser || 'auto').toLowerCase()
      const cands = candidates().filter(c => want === 'auto' || c.browser === want)
      if (!cands.length) throw new Error('watch_scan: 没找到浏览器历史库（Chrome/Edge/Firefox/Brave）')
      const hits = []
      for (const c of cands) {
        let rows = []
        try { rows = c.engine === 'chromium' ? await readChromium(c.db, days) : await readFirefox(c.db, days) } catch { continue }
        for (const r of rows) {
          const site = SITES.find(s => s.re.test(r.url))
          if (site) hits.push({ site: site.site, browser: c.browser, when: new Date(r.ts).toISOString().slice(0, 16).replace('T', ' '), title: (r.title || '').slice(0, 60), url: r.url.slice(0, 140), hint: site.hint })
        }
      }
      hits.sort((a, b) => b.when.localeCompare(a.when))
      const seen = new Set()
      const dedup = hits.filter(h => { const k = h.site + h.url; if (seen.has(k)) return false; seen.add(k); return true }).slice(0, 60)
      return { hits: dedup, browsers: cands.length }
    },
    presentCall: (a) => ({ card: 'generic', title: '扫订单页足迹', kind: 'other', rawInput: a }),
  }))

  ctx.tools.register(defineTool({
    name: 'watch_suggest',
    description: '给一个域的「抓不到数据」建议：返回该站点的可用导入通道（复制文本/截图 OCR/官方导出/手动录入）。watch_scan 命中后的下一步指引。',
    parameters: { site: { type: 'string', description: '站点名（12306/滴滴/淘宝订单/京东订单/拼多多/美团/携程/高德/闲鱼），空则全列' } },
    output: { schema: { type: 'object', additionalProperties: false, properties: { report: { type: 'string' } } },
      render: (_a, v) => [{ type: 'text', text: v.report }] },
    isConcurrencySafe: () => true,
    async execute(args) {
      const want = String(args.site || '').trim()
      const list = want ? SITES.filter(s => s.site.includes(want) || want.includes(s.site)) : SITES
      if (!list.length) throw new Error(`watch_suggest: 不认识 "${want}"，支持：${SITES.map(s => s.site).join('/')}`)
      return { report: list.map(s => `${s.site}：${s.hint}`).join('\n') }
    },
    presentCall: (a) => ({ card: 'generic', title: '导入通道建议', kind: 'other', rawInput: a }),
  }))

  ctx.effect(() => ctx.skills.registerProvider(() => createSkillProvider(ctx)))
}
