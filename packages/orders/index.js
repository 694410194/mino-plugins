/**
 * mino-connector-orders —— 电商订单连接器（空白域：电商消费明细）。
 * 订单维度（账单只管钱，订单管买了什么）：用户从订单页复制文本、或喂
 * 导出的 CSV/txt 文件，解析入本地 sqlite，可检索/按店铺年消费统计。
 * 手动导入形态：数据由用户主动提供。
 */
import { existsSync, readFileSync, mkdirSync, readdirSync, statSync } from 'node:fs'
import { join, dirname, basename } from 'node:path'
import { homedir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { loadHostDeps } from './hostdeps.mjs'
import { createSkillProvider } from './skill-provider.mjs'

const PKG_DIR = dirname(fileURLToPath(import.meta.url))
const PKG = JSON.parse(readFileSync(join(PKG_DIR, 'package.json'), 'utf8'))
const STORE = join(process.env.DSH_HOME || join(homedir(), '.dsh'), 'connector-orders')

export const name = PKG.name
export const inject = ['skills', 'tools']
const defineTool = (await loadHostDeps()).defineTool

let DatabaseSync = null
try { ({ DatabaseSync } = await import('node:sqlite')) } catch { }

function openStore() {
  mkdirSync(STORE, { recursive: true })
  const db = new DatabaseSync(join(STORE, 'orders.db'))
  db.exec(`CREATE TABLE IF NOT EXISTS orders(platform TEXT, date TEXT, shop TEXT, item TEXT, price REAL, raw TEXT)`)
  db.exec(`CREATE INDEX IF NOT EXISTS idx_item ON orders(item)`)
  return db
}

function guessPlatform(text) {
  if (/淘宝|天猫|taobao|tmall/i.test(text)) return '淘宝'
  if (/京东|jd\.com/i.test(text)) return '京东'
  if (/拼多多|pinduoduo|pdd/i.test(text)) return '拼多多'
  if (/美团|meituan/i.test(text)) return '美团'
  if (/饿了么|ele\.me/i.test(text)) return '饿了么'
  if (/闲鱼|xianyu|goofish/i.test(text)) return '闲鱼'
  if (/抖音|douyin/i.test(text)) return '抖音'
  return '其它'
}

function* iterOrders(text) {
  for (const line of String(text).split(/\r?\n/)) {
    const l = line.trim()
    if (l.length < 6) continue
    const date = l.match(/(20\d{2})[-年/.](\d{1,2})[-月/.](\d{1,2})/)
    const price = l.match(/[¥￥]\s*(\d+(?:\.\d{1,2})?)/) || l.match(/(\d+(?:\.\d{1,2})?)\s*元/)
    const shop = l.match(/(?:店铺|商家|卖家)[:：]?\s*([^\s,，]{2,20})/)?.[1]
    // 商品名：取行内最长的中文片段
    const item = (l.match(/[一-龥][一-龥A-Za-z0-9（）()【】\[\] ]{4,60}/g) || []).sort((a, b) => b.length - a.length)[0]?.trim()
    if (!item && !price) continue
    yield {
      platform: guessPlatform(l),
      date: date ? `${date[1]}-${date[2].padStart(2, '0')}-${date[3].padStart(2, '0')}` : '',
      shop: shop || '', item: (item || l.slice(0, 60)).slice(0, 80),
      price: price ? parseFloat(price[1]) : null, raw: l.slice(0, 200),
    }
  }
}

export function apply(ctx) {
  ctx.tools.register(defineTool({
    name: 'order_add',
    description:
      '把电商订单记进本地订单库：从淘宝/京东/美团/拼多多/饿了么/闲鱼的订单页' +
      '复制文本粘贴过来，或传 .csv/.txt 导出文件路径。自动识别平台/日期/金额/商品。',
    parameters: {
      text: { type: 'string', description: '订单页复制的文本（可多行多条）' },
      file: { type: 'string', description: '或：导出的 .csv/.txt 文件路径' },
    },
    output: { schema: { type: 'object', additionalProperties: false, properties: {
      imported: { type: 'integer' } } },
      render: (_a, v) => [{ type: 'text', text: `入库 ${v.imported} 条订单` }] },
    isConcurrencySafe: () => false,
    async execute(args) {
      if (!DatabaseSync) throw new Error('order_add: 运行时缺 node:sqlite')
      let text = args.text ? String(args.text) : ''
      if (args.file) {
        const f = String(args.file)
        if (!existsSync(f)) throw new Error(`order_add: 文件不存在 ${f}`)
        text += '\n' + readFileSync(f, 'utf8')
      }
      if (!text.trim()) throw new Error('order_add: 给订单文本或文件路径')
      const db = openStore()
      const ins = db.prepare('INSERT INTO orders(platform,date,shop,item,price,raw) VALUES(?,?,?,?,?,?)')
      let n = 0
      db.exec('BEGIN')
      try {
        for (const o of iterOrders(text)) { ins.run(o.platform, o.date, o.shop, o.item, o.price, o.raw); n++ }
        db.exec('COMMIT')
      } finally { db.close() }
      if (!n) throw new Error('order_add: 没解析出订单行——把订单页整段复制粘进来')
      return { imported: n }
    },
    presentCall: (a) => ({ card: 'generic', title: '记订单', kind: 'other', rawInput: a }),
  }))

  ctx.tools.register(defineTool({
    name: 'order_search',
    description: '搜本地订单库：按商品关键词、平台、年份查买过什么、花了多少。',
    parameters: {
      q: { type: 'string', description: '商品关键词' },
      platform: { type: 'string', description: '淘宝/京东/拼多多/美团/饿了么/闲鱼/抖音' },
      year: { type: 'string', description: '年份，如 2025' },
      stats: { type: 'boolean', description: 'true=按平台×年出消费统计' },
      limit: { type: 'integer', description: '最多多少条（默认 30）' },
    },
    output: { schema: { type: 'object', additionalProperties: true },
      render: (_a, v) => [{ type: 'text', text: v.stats
        ? `消费统计：${Object.entries(v.byPlatform||{}).map(([k,x])=>`${k}¥${x}`).join('；')}`
        : `${v.count} 条：` + (v.hits||[]).slice(0,8).map(h=>`${h.date||''} ${h.item.slice(0,25)}${h.price?` ¥${h.price}`:''}`).join('；') }] },
    isConcurrencySafe: () => true,
    async execute(args) {
      const dbFile = join(STORE, 'orders.db')
      if (!existsSync(dbFile)) return args.stats ? { byPlatform: {}, byYear: {} } : { count: 0, hits: [] }
      const db = new DatabaseSync(dbFile, { readOnly: true })
      try {
        if (args.stats) {
          const rows = db.prepare("SELECT platform, substr(date,1,4) y, COUNT(*) c, ROUND(SUM(price),2) s FROM orders GROUP BY platform,y").all()
          const byPlatform = {}, byYear = {}
          for (const r of rows) {
            byPlatform[r.platform] = Math.round(((byPlatform[r.platform]||0)+r.s)*100)/100
            if (r.y) byYear[r.y] = Math.round(((byYear[r.y]||0)+r.s)*100)/100
          }
          return { stats: true, byPlatform, byYear, detail: rows.slice(0, 30) }
        }
        const conds = [], vals = []
        if (args.q) { conds.push('(item LIKE ? OR raw LIKE ?)'); vals.push(`%${args.q}%`, `%${args.q}%`) }
        if (args.platform) { conds.push('platform = ?'); vals.push(String(args.platform)) }
        if (args.year) { conds.push('date LIKE ?'); vals.push(`${args.year}%`) }
        const where = conds.length ? 'WHERE ' + conds.join(' AND ') : ''
        const limit = Math.min(Number.isFinite(+args.limit) ? +args.limit : 30, 200)
        const rows = db.prepare(`SELECT platform,date,shop,item,price FROM orders ${where} ORDER BY date DESC LIMIT ?`).all(...vals, limit)
        return { count: rows.length, hits: rows }
      } finally { db.close() }
    },
    presentCall: (a) => ({ card: 'generic', title: '查订单', kind: 'other', rawInput: a }),
  }))

  ctx.effect(() => ctx.skills.registerProvider(() => createSkillProvider(ctx)))
}
