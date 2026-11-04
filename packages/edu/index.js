/**
 * mino-connector-edu —— 教育连接器（目录外域：教育）。
 * 作业帮/华为学习/学校成绩单等导出文本 CSV 入库：科目/分数/日期/项目。
 * 手动导入形态；截图内容先走 connector-ocr 读字再喂进来。
 */
import { existsSync, readFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { homedir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { loadHostDeps } from './hostdeps.mjs'
import { createSkillProvider } from './skill-provider.mjs'

const PKG_DIR = dirname(fileURLToPath(import.meta.url))
const PKG = JSON.parse(readFileSync(join(PKG_DIR, 'package.json'), 'utf8'))
const STORE = join(process.env.DSH_HOME || join(homedir(), '.dsh'), 'connector-edu')

export const name = PKG.name
export const inject = ['skills', 'tools']
const defineTool = (await loadHostDeps()).defineTool

export function apply(ctx) {
  ctx.tools.register(defineTool({
    name: 'edu_add',
    description: '记教育记录：成绩/课程/学习时长文本或 CSV 入库。支持「2025-09 数学 92分」「英语课 30分钟」这类行。',
    parameters: {
      text: { type: 'string', description: '复制的文本' },
      file: { type: 'string', description: '或：导出 .txt/.csv 路径' },
      who: { type: 'string', description: '谁的记录（如 小宝/我）' },
    },
    output: { schema: { type: 'object', additionalProperties: false, properties: { imported: { type: 'integer' } } },
      render: (_a, v) => [{ type: 'text', text: `入库 ${v.imported} 条教育记录` }] },
    isConcurrencySafe: () => false,
    async execute(args) {
      const { DatabaseSync } = await import('node:sqlite').catch(() => ({}))
      if (!DatabaseSync) throw new Error('edu_add: 运行时缺 node:sqlite')
      let text = args.text ? String(args.text) : ''
      if (args.file) {
        if (!existsSync(String(args.file))) throw new Error(`edu_add: 文件不存在 ${args.file}`)
        text += '\n' + readFileSync(String(args.file), 'utf8')
      }
      if (!text.trim()) throw new Error('edu_add: 给文本或文件')
      mkdirSync(STORE, { recursive: true })
      const db = new DatabaseSync(join(STORE, 'edu.db'))
      db.exec('CREATE TABLE IF NOT EXISTS edu(who TEXT,date TEXT,subject TEXT,value REAL,unit TEXT,raw TEXT)')
      const ins = db.prepare('INSERT INTO edu(who,date,subject,value,unit,raw) VALUES(?,?,?,?,?,?)')
      const who = String(args.who || '')
      let n = 0
      db.exec('BEGIN')
      try {
        for (const line of text.split(/\r?\n/)) {
          const l = line.trim()
          if (l.length < 4) continue
          const date = l.match(/(20\d{2})[-年/.](\d{1,2})(?:[-月/.](\d{1,2}))?/)
          const subj = l.match(/(语文|数学|英语|物理|化学|生物|历史|地理|政治|体育|美术|音乐|编程|阅读|作业|课程|学习时长|成绩)/)?.[1]
          const val = l.match(/(\d+(?:\.\d+)?)\s*(分|分钟|小时|天|课|节|页)/)
          if (!date && !subj && !val) continue
          ins.run(who, date ? `${date[1]}-${date[2].padStart(2, '0')}-${(date[3] || '01').padStart(2, '0')}` : '',
            subj || '', val ? parseFloat(val[1]) : null, val?.[2] || '', l.slice(0, 200))
          n++
          if (n > 50000) break
        }
        db.exec('COMMIT')
      } finally { db.close() }
      if (!n) throw new Error('edu_add: 没解析出记录行')
      return { imported: n }
    },
    presentCall: (a) => ({ card: 'generic', title: '记教育', kind: 'other', rawInput: a }),
  }))

  ctx.tools.register(defineTool({
    name: 'edu_search',
    description: '查教育记录：按科目/人/时间查成绩曲线、学习时长。',
    parameters: {
      q: { type: 'string', description: '关键词' },
      subject: { type: 'string', description: '科目如 数学/英语' },
      stats: { type: 'boolean', description: 'true=按科目统计均值/条数' },
      limit: { type: 'integer', description: '最多多少条（默认 30）' },
    },
    output: { schema: { type: 'object', additionalProperties: true },
      render: (_a, v) => [{ type: 'text', text: v.stats
        ? `教育统计：` + (v.rows||[]).map(r=>`${r.subject}${r.c}条`).join('；')
        : `${v.count} 条：` + (v.hits||[]).slice(0,8).map(h=>`${h.date||''} ${h.raw.slice(0,30)}`).join('；') }] },
    isConcurrencySafe: () => true,
    async execute(args) {
      const dbFile = join(STORE, 'edu.db')
      if (!existsSync(dbFile)) return args.stats ? { stats: true, rows: [] } : { count: 0, hits: [] }
      const { DatabaseSync } = await import('node:sqlite')
      const db = new DatabaseSync(dbFile, { readOnly: true })
      try {
        if (args.stats) {
          const rows = db.prepare('SELECT subject,COUNT(*) c,ROUND(AVG(value),1) avg FROM edu GROUP BY subject ORDER BY c DESC LIMIT 20').all()
          return { stats: true, rows }
        }
        const conds = [], vals = []
        if (args.q) { conds.push('raw LIKE ?'); vals.push(`%${args.q}%`) }
        if (args.subject) { conds.push('subject=?'); vals.push(String(args.subject)) }
        const where = conds.length ? 'WHERE ' + conds.join(' AND ') : ''
        const limit = Math.min(Number.isFinite(+args.limit) ? +args.limit : 30, 200)
        const rows = db.prepare(`SELECT who,date,subject,value,unit,raw FROM edu ${where} ORDER BY date DESC LIMIT ?`).all(...vals, limit)
        return { count: rows.length, hits: rows }
      } finally { db.close() }
    },
    presentCall: (a) => ({ card: 'generic', title: '查教育', kind: 'other', rawInput: a }),
  }))

  ctx.effect(() => ctx.skills.registerProvider(() => createSkillProvider(ctx)))
}
