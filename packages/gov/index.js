/**
 * mino-connector-gov —— 政务连接器（目录外域：政务）。
 * 交管12123违章/个税专项扣除/社保公积金缴费 的导出文本/截图复制内容
 * 入本地库检索。手动导入形态：用户从 App/网页复制或导出文件。
 */
import { existsSync, readFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { homedir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { loadHostDeps } from './hostdeps.mjs'
import { createSkillProvider } from './skill-provider.mjs'

const PKG_DIR = dirname(fileURLToPath(import.meta.url))
const PKG = JSON.parse(readFileSync(join(PKG_DIR, 'package.json'), 'utf8'))
const STORE = join(process.env.DSH_HOME || join(homedir(), '.dsh'), 'connector-gov')

export const name = PKG.name
export const inject = ['skills', 'tools']
const defineTool = (await loadHostDeps()).defineTool

const KINDS = [['12123|违章|违法|罚款|扣分', '交管违章'], ['个税|专项附加|扣除|退税|汇算', '个税'],
  ['社保|养老|医保|失业保险|工伤', '社保'], ['公积金', '公积金'], ['不动产|房产|公积金提取', '不动产']]

export function apply(ctx) {
  ctx.tools.register(defineTool({
    name: 'gov_add',
    description: '记政务记录：把 12123/个税/社保/公积金 App 或网页的内容复制粘过来（或给导出 txt/csv 文件），自动分类入库。',
    parameters: {
      text: { type: 'string', description: '复制的文本' },
      file: { type: 'string', description: '或：导出的 .txt/.csv 路径' },
    },
    output: { schema: { type: 'object', additionalProperties: false, properties: { imported: { type: 'integer' } } },
      render: (_a, v) => [{ type: 'text', text: `入库 ${v.imported} 条政务记录` }] },
    isConcurrencySafe: () => false,
    async execute(args) {
      const { DatabaseSync } = await import('node:sqlite').catch(() => ({}))
      if (!DatabaseSync) throw new Error('gov_add: 运行时缺 node:sqlite')
      let text = args.text ? String(args.text) : ''
      if (args.file) {
        if (!existsSync(String(args.file))) throw new Error(`gov_add: 文件不存在 ${args.file}`)
        text += '\n' + readFileSync(String(args.file), 'utf8')
      }
      if (!text.trim()) throw new Error('gov_add: 给文本或文件')
      mkdirSync(STORE, { recursive: true })
      const db = new DatabaseSync(join(STORE, 'gov.db'))
      db.exec('CREATE TABLE IF NOT EXISTS gov(kind TEXT,date TEXT,amount REAL,title TEXT,raw TEXT)')
      const ins = db.prepare('INSERT INTO gov(kind,date,amount,title,raw) VALUES(?,?,?,?,?)')
      let n = 0
      db.exec('BEGIN')
      try {
        for (const line of text.split(/\r?\n/)) {
          const l = line.trim()
          if (l.length < 6) continue
          const kind = KINDS.find(([re]) => new RegExp(re).test(l))?.[1] || '其它'
          const date = l.match(/(20\d{2})[-年/.](\d{1,2})[-月/.](\d{1,2})/)
          const amt = l.match(/[¥￥]\s*(\d+(?:\.\d{1,2})?)/)?.[1] || l.match(/(\d+(?:\.\d{1,2})?)\s*(?:元|块)/)?.[1]
          ins.run(kind, date ? `${date[1]}-${date[2].padStart(2, '0')}-${date[3].padStart(2, '0')}` : '',
            amt ? parseFloat(amt) : null, l.slice(0, 80), l.slice(0, 300))
          n++
          if (n > 50000) break
        }
        db.exec('COMMIT')
      } finally { db.close() }
      if (!n) throw new Error('gov_add: 没解析出内容行')
      return { imported: n }
    },
    presentCall: (a) => ({ card: 'generic', title: '记政务', kind: 'other', rawInput: a }),
  }))

  ctx.tools.register(defineTool({
    name: 'gov_search',
    description: '查政务记录：按关键词/类别查违章、个税、社保、公积金记录。',
    parameters: {
      q: { type: 'string', description: '关键词' },
      kind: { type: 'string', description: '交管违章/个税/社保/公积金/不动产/其它' },
      stats: { type: 'boolean', description: 'true=按类别统计' },
      limit: { type: 'integer', description: '最多多少条（默认 30）' },
    },
    output: { schema: { type: 'object', additionalProperties: true },
      render: (_a, v) => [{ type: 'text', text: v.stats
        ? `政务记录：${Object.entries(v.byKind||{}).map(([k,c])=>`${k}${c}条`).join('；')}`
        : `${v.count} 条：` + (v.hits||[]).slice(0,8).map(h=>`${h.date||''} ${h.title.slice(0,30)}`).join('；') }] },
    isConcurrencySafe: () => true,
    async execute(args) {
      const dbFile = join(STORE, 'gov.db')
      if (!existsSync(dbFile)) return args.stats ? { stats: true, byKind: {} } : { count: 0, hits: [] }
      const { DatabaseSync } = await import('node:sqlite')
      const db = new DatabaseSync(dbFile, { readOnly: true })
      try {
        if (args.stats) {
          const byKind = Object.fromEntries(db.prepare('SELECT kind,COUNT(*) c FROM gov GROUP BY kind').all().map(r => [r.kind, r.c]))
          return { stats: true, byKind }
        }
        const conds = [], vals = []
        if (args.q) { conds.push('(title LIKE ? OR raw LIKE ?)'); vals.push(`%${args.q}%`, `%${args.q}%`) }
        if (args.kind) { conds.push('kind=?'); vals.push(String(args.kind)) }
        const where = conds.length ? 'WHERE ' + conds.join(' AND ') : ''
        const limit = Math.min(Number.isFinite(+args.limit) ? +args.limit : 30, 200)
        const rows = db.prepare(`SELECT kind,date,amount,title FROM gov ${where} ORDER BY date DESC LIMIT ?`).all(...vals, limit)
        return { count: rows.length, hits: rows }
      } finally { db.close() }
    },
    presentCall: (a) => ({ card: 'generic', title: '查政务', kind: 'other', rawInput: a }),
  }))

  ctx.effect(() => ctx.skills.registerProvider(() => createSkillProvider(ctx)))
}
