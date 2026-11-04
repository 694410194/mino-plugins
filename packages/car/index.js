/**
 * mino-connector-car —— 车况连接器（目录外域：车况，对标 PDH 奔驰me）。
 * 里程/保养/违章/保险/加油记录入库，按时间线查询。手动导入形态：
 * 车企 App（奔驰me/特斯拉等）无开放接口时复制关键页文本喂进来。
 */
import { existsSync, readFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { homedir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { loadHostDeps } from './hostdeps.mjs'
import { createSkillProvider } from './skill-provider.mjs'

const PKG_DIR = dirname(fileURLToPath(import.meta.url))
const PKG = JSON.parse(readFileSync(join(PKG_DIR, 'package.json'), 'utf8'))
const STORE = join(process.env.DSH_HOME || join(homedir(), '.dsh'), 'connector-car')

export const name = PKG.name
export const inject = ['skills', 'tools']
const defineTool = (await loadHostDeps()).defineTool

const KINDS = [['保养|维修|换机油|4S', '保养维修'], ['违章|违法|罚款|扣分', '违章'],
  ['保险|续保|保单', '保险'], ['加油|充电|续航', '补能'], ['年检|审车|验车', '年检'],
  ['里程|公里', '里程'], ['洗车|美容|贴膜', '养护']]

export function apply(ctx) {
  ctx.tools.register(defineTool({
    name: 'car_add',
    description: '记车况：里程/保养/违章/保险/加油记录，一行一条或整段文本（车企App复制），自动分类抓金额里程。',
    parameters: {
      text: { type: 'string', description: '如「2025-08-10 保养 更换机油机滤 480元 52300km」' },
      file: { type: 'string', description: '或：导出 .txt/.csv 路径' },
      plate: { type: 'string', description: '车牌/车辆标签（多车区分）' },
    },
    output: { schema: { type: 'object', additionalProperties: false, properties: { imported: { type: 'integer' } } },
      render: (_a, v) => [{ type: 'text', text: `入库 ${v.imported} 条车况记录` }] },
    isConcurrencySafe: () => false,
    async execute(args) {
      const { DatabaseSync } = await import('node:sqlite').catch(() => ({}))
      if (!DatabaseSync) throw new Error('car_add: 运行时缺 node:sqlite')
      let text = args.text ? String(args.text) : ''
      if (args.file) {
        if (!existsSync(String(args.file))) throw new Error(`car_add: 文件不存在 ${args.file}`)
        text += '\n' + readFileSync(String(args.file), 'utf8')
      }
      if (!text.trim()) throw new Error('car_add: 给文本或文件')
      mkdirSync(STORE, { recursive: true })
      const db = new DatabaseSync(join(STORE, 'car.db'))
      db.exec('CREATE TABLE IF NOT EXISTS car(plate TEXT,kind TEXT,date TEXT,km REAL,amount REAL,raw TEXT)')
      const ins = db.prepare('INSERT INTO car(plate,kind,date,km,amount,raw) VALUES(?,?,?,?,?,?)')
      const plate = String(args.plate || '')
      let n = 0
      db.exec('BEGIN')
      try {
        for (const line of text.split(/\r?\n/)) {
          const l = line.trim()
          if (l.length < 5) continue
          const kind = KINDS.find(([re]) => new RegExp(re).test(l))?.[1] || '其它'
          const date = l.match(/(20\d{2})[-年/.](\d{1,2})[-月/.](\d{1,2})/)
          const km = l.match(/(\d+(?:\.\d+)?)\s*(?:km|公里|千米)/i)?.[1]
          const amt = l.match(/[¥￥]\s*(\d+(?:\.\d+)?)|(\d+(?:\.\d+)?)\s*元/)?.[0]?.replace(/[^\d.]/g, '')
          ins.run(plate, kind, date ? `${date[1]}-${date[2].padStart(2, '0')}-${date[3].padStart(2, '0')}` : '',
            km ? parseFloat(km) : null, amt ? parseFloat(amt) : null, l.slice(0, 250))
          n++
          if (n > 20000) break
        }
        db.exec('COMMIT')
      } finally { db.close() }
      if (!n) throw new Error('car_add: 没解析出车况行')
      return { imported: n }
    },
    presentCall: (a) => ({ card: 'generic', title: '记车况', kind: 'other', rawInput: a }),
  }))

  ctx.tools.register(defineTool({
    name: 'car_search',
    description: '查车况：保养/违章/保险/花费统计，stats=true 按类别汇总金额。',
    parameters: {
      q: { type: 'string', description: '关键词' },
      kind: { type: 'string', description: '保养维修/违章/保险/补能/年检/里程/养护/其它' },
      stats: { type: 'boolean', description: 'true=按类别统计' },
      limit: { type: 'integer', description: '最多多少条（默认 30）' },
    },
    output: { schema: { type: 'object', additionalProperties: true },
      render: (_a, v) => [{ type: 'text', text: v.stats
        ? `车况统计：` + (v.rows||[]).map(r=>`${r.kind}${r.c}条${r.s?` ¥${r.s}`:''}`).join('；')
        : `${v.count} 条：` + (v.hits||[]).slice(0,8).map(h=>`${h.date||''} ${h.kind} ${h.raw.slice(0,25)}`).join('；') }] },
    isConcurrencySafe: () => true,
    async execute(args) {
      const dbFile = join(STORE, 'car.db')
      if (!existsSync(dbFile)) return args.stats ? { stats: true, rows: [] } : { count: 0, hits: [] }
      const { DatabaseSync } = await import('node:sqlite')
      const db = new DatabaseSync(dbFile, { readOnly: true })
      try {
        if (args.stats) {
          const rows = db.prepare('SELECT kind,COUNT(*) c,ROUND(SUM(amount),1) s FROM car GROUP BY kind ORDER BY s DESC').all()
          return { stats: true, rows }
        }
        const conds = [], vals = []
        if (args.q) { conds.push('raw LIKE ?'); vals.push(`%${args.q}%`) }
        if (args.kind) { conds.push('kind=?'); vals.push(String(args.kind)) }
        const where = conds.length ? 'WHERE ' + conds.join(' AND ') : ''
        const limit = Math.min(Number.isFinite(+args.limit) ? +args.limit : 30, 200)
        const rows = db.prepare(`SELECT plate,kind,date,km,amount,raw FROM car ${where} ORDER BY date DESC LIMIT ?`).all(...vals, limit)
        return { count: rows.length, hits: rows }
      } finally { db.close() }
    },
    presentCall: (a) => ({ card: 'generic', title: '查车况', kind: 'other', rawInput: a }),
  }))

  ctx.effect(() => ctx.skills.registerProvider(() => createSkillProvider(ctx)))
}
