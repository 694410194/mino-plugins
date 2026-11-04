/**
 * mino-connector-records —— 万能记录连接器（niche 域兜底：政务/会议/招聘/
 * 车况/教育等没有好通道的源）。任何文本粘进来按类别入库，sqlite 检索。
 * 手动导入形态：数据由用户主动提供，合规零灰度。
 */
import { existsSync, mkdirSync, readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { homedir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { loadHostDeps } from './hostdeps.mjs'
import { createSkillProvider } from './skill-provider.mjs'

const PKG_DIR = dirname(fileURLToPath(import.meta.url))
const PKG = JSON.parse(readFileSync(join(PKG_DIR, 'package.json'), 'utf8'))
const STORE = join(process.env.DSH_HOME || join(homedir(), '.dsh'), 'connector-records')

export const name = PKG.name
export const inject = ['skills', 'tools']
const defineTool = (await loadHostDeps()).defineTool

let DatabaseSync = null
try { ({ DatabaseSync } = await import('node:sqlite')) } catch { }

function openStore() {
  mkdirSync(STORE, { recursive: true })
  const db = new DatabaseSync(join(STORE, 'records.db'))
  db.exec(`CREATE TABLE IF NOT EXISTS records(category TEXT, title TEXT, text TEXT, added TEXT)`)
  db.exec(`CREATE INDEX IF NOT EXISTS idx_c ON records(category)`)
  return db
}

export function apply(ctx) {
  ctx.tools.register(defineTool({
    name: 'record_add',
    description:
      '把一段文本按类别存进本地记录库：交管罚单、会议纪要、招聘信息、车况记录、' +
      '作业辅导资料……任何没有专用通道的数据都能存。手动提供，纯本地。',
    parameters: {
      category: { type: 'string', required: true, description: '类别（如 罚单/会议/招聘/车况/教育/证件）' },
      text: { type: 'string', required: true, description: '要存的文本内容' },
      title: { type: 'string', description: '可选标题' },
    },
    output: { schema: { type: 'object', additionalProperties: false, properties: { stored: { type: 'boolean' } } },
      render: (_a) => [{ type: 'text', text: '已存进记录库' }] },
    isConcurrencySafe: () => false,
    async execute(args) {
      if (!DatabaseSync) throw new Error('record_add: 运行时缺 node:sqlite')
      const text = String(args.text || '').trim()
      if (!text) throw new Error('record_add: text 不能为空')
      const db = openStore()
      try {
        db.prepare('INSERT INTO records(category,title,text,added) VALUES(?,?,?,?)')
          .run(String(args.category).trim(), String(args.title || '').slice(0, 80), text.slice(0, 8000),
            new Date().toISOString().slice(0, 19).replace('T', ' '))
      } finally { db.close() }
      return { stored: true }
    },
    presentCall: (a) => ({ card: 'generic', title: `存记录:${a.category || ''}`, kind: 'other', rawInput: a }),
  }))

  ctx.tools.register(defineTool({
    name: 'record_search',
    description: '检索已存的记录：按关键词、按类别或列最近条目。',
    parameters: {
      q: { type: 'string', description: '关键词' },
      category: { type: 'string', description: '只看某类' },
      limit: { type: 'integer', description: '最多多少条（默认 20）' },
    },
    output: { schema: { type: 'object', additionalProperties: false, properties: {
      hits: { type: 'array', items: { type: 'object', additionalProperties: true } }, count: { type: 'integer' } } },
      render: (_a, v) => [{ type: 'text', text: `${v.count} 条命中：` +
        v.hits.slice(0, 8).map(h => `[${h.category}]${h.title || h.preview.slice(0, 30)}`).join('；') }] },
    isConcurrencySafe: () => true,
    async execute(args) {
      const dbFile = join(STORE, 'records.db')
      if (!existsSync(dbFile)) return { count: 0, hits: [] }
      const db = new DatabaseSync(dbFile, { readOnly: true })
      try {
        const limit = Math.min(Number.isFinite(+args.limit) ? +args.limit : 20, 200)
        const conds = [], vals = []
        if (args.q) { conds.push('(text LIKE ? OR title LIKE ?)'); vals.push(`%${args.q}%`, `%${args.q}%`) }
        if (args.category) { conds.push('category = ?'); vals.push(String(args.category)) }
        const where = conds.length ? 'WHERE ' + conds.join(' AND ') : ''
        const rows = db.prepare(`SELECT category,title,substr(text,1,120) as preview,added FROM records ${where} ORDER BY added DESC LIMIT ?`).all(...vals, limit)
        return { count: rows.length, hits: rows }
      } finally { db.close() }
    },
    presentCall: (a) => ({ card: 'generic', title: '查记录', kind: 'other', rawInput: a }),
  }))

  ctx.tools.register(defineTool({
    name: 'record_categories',
    description: '列记录库里已有的类别和条数。',
    parameters: {},
    output: { schema: { type: 'object', additionalProperties: false, properties: {
      categories: { type: 'object', additionalProperties: true } } },
      render: (_a, v) => [{ type: 'text', text: Object.entries(v.categories).map(([k, n]) => `${k}:${n}`).join('，') || '还没有记录' }] },
    isConcurrencySafe: () => true,
    async execute() {
      const dbFile = join(STORE, 'records.db')
      if (!existsSync(dbFile)) return { categories: {} }
      const db = new DatabaseSync(dbFile, { readOnly: true })
      try {
        const rows = db.prepare('SELECT category, COUNT(*) c FROM records GROUP BY category ORDER BY c DESC').all()
        return { categories: Object.fromEntries(rows.map(r => [r.category, r.c])) }
      } finally { db.close() }
    },
    presentCall: (a) => ({ card: 'generic', title: '列记录类别', kind: 'other', rawInput: a }),
  }))

  ctx.effect(() => ctx.skills.registerProvider(() => createSkillProvider(ctx)))
}
