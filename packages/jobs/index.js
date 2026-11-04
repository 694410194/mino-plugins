/**
 * mino-connector-jobs —— 招聘连接器（目录外域：招聘，对标 PDH BOSS）。
 * BOSS直聘/拉勾 沟通记录、投递记录、JD 文本入库：公司/岗位/薪资/状态追踪。
 * 手动导入形态：复制沟通页文本或喂导出文件。
 */
import { existsSync, readFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { homedir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { loadHostDeps } from './hostdeps.mjs'
import { createSkillProvider } from './skill-provider.mjs'

const PKG_DIR = dirname(fileURLToPath(import.meta.url))
const PKG = JSON.parse(readFileSync(join(PKG_DIR, 'package.json'), 'utf8'))
const STORE = join(process.env.DSH_HOME || join(homedir(), '.dsh'), 'connector-jobs')

export const name = PKG.name
export const inject = ['skills', 'tools']
const defineTool = (await loadHostDeps()).defineTool

const STATES = [['已读不回|未回复', '已读不回'], ['已投|投递', '已投递'], ['面试|约面', '面试'],
  ['offer|录用', 'offer'], ['拒绝|不合适|感谢', '被拒'], ['沟通|感兴趣', '沟通中']]

export function apply(ctx) {
  ctx.tools.register(defineTool({
    name: 'job_add',
    description: '记求职记录：公司+岗位+薪资+状态，一行一条或整段粘贴，自动抓字段入库。',
    parameters: {
      text: { type: 'string', description: '如「字节跳动 后端开发 30-50K 已投递」' },
      file: { type: 'string', description: '或：导出 .txt/.csv 路径' },
    },
    output: { schema: { type: 'object', additionalProperties: false, properties: { imported: { type: 'integer' } } },
      render: (_a, v) => [{ type: 'text', text: `入库 ${v.imported} 条求职记录` }] },
    isConcurrencySafe: () => false,
    async execute(args) {
      const { DatabaseSync } = await import('node:sqlite').catch(() => ({}))
      if (!DatabaseSync) throw new Error('job_add: 运行时缺 node:sqlite')
      let text = args.text ? String(args.text) : ''
      if (args.file) {
        if (!existsSync(String(args.file))) throw new Error(`job_add: 文件不存在 ${args.file}`)
        text += '\n' + readFileSync(String(args.file), 'utf8')
      }
      if (!text.trim()) throw new Error('job_add: 给文本或文件')
      mkdirSync(STORE, { recursive: true })
      const db = new DatabaseSync(join(STORE, 'jobs.db'))
      db.exec('CREATE TABLE IF NOT EXISTS jobs(company TEXT,title TEXT,salary TEXT,state TEXT,date TEXT,raw TEXT)')
      const ins = db.prepare('INSERT INTO jobs(company,title,salary,state,date,raw) VALUES(?,?,?,?,?,?)')
      let n = 0
      db.exec('BEGIN')
      try {
        for (const line of text.split(/\r?\n/)) {
          const l = line.trim()
          if (l.length < 5) continue
          const salary = l.match(/\d+\s*[-~]\s*\d+\s*[Kk万](?:·\d+薪)?/)?.[0] || ''
          const state = STATES.find(([re]) => new RegExp(re).test(l))?.[1] || ''
          const date = l.match(/(20\d{2}[-年/.]\d{1,2}[-月/.]\d{1,2})/)?.[0] || ''
          const comp = l.match(/([一-龥A-Za-z（）()]{2,20})(?:公司|科技|集团|有限)?(?:\s|,|，)/)?.[1] || ''
          const title = l.match(/(工程师|开发|产品|运营|设计|经理|专员|分析|测试|算法|销售|实习|助理|总监|研究员|教师|顾问|编辑|文员)[一-龥A-Za-z]*/)?.[0] || ''
          if (!comp && !title && !salary) continue
          ins.run(comp, title, salary, state, date, l.slice(0, 250))
          n++
          if (n > 20000) break
        }
        db.exec('COMMIT')
      } finally { db.close() }
      if (!n) throw new Error('job_add: 没解析出求职记录行')
      return { imported: n }
    },
    presentCall: (a) => ({ card: 'generic', title: '记求职', kind: 'other', rawInput: a }),
  }))

  ctx.tools.register(defineTool({
    name: 'job_search',
    description: '查求职记录：按公司/岗位/状态查投递进度，stats=true 出漏斗统计。',
    parameters: {
      q: { type: 'string', description: '公司或岗位关键词' },
      state: { type: 'string', description: '已投递/沟通中/面试/offer/被拒/已读不回' },
      stats: { type: 'boolean', description: 'true=状态漏斗统计' },
      limit: { type: 'integer', description: '最多多少条（默认 30）' },
    },
    output: { schema: { type: 'object', additionalProperties: true },
      render: (_a, v) => [{ type: 'text', text: v.stats
        ? `求职漏斗：` + Object.entries(v.byState||{}).map(([k,c])=>`${k||'未标'}${c}`).join('；')
        : `${v.count} 条：` + (v.hits||[]).slice(0,8).map(h=>`${h.company} ${h.title} ${h.state}`).join('；') }] },
    isConcurrencySafe: () => true,
    async execute(args) {
      const dbFile = join(STORE, 'jobs.db')
      if (!existsSync(dbFile)) return args.stats ? { stats: true, byState: {} } : { count: 0, hits: [] }
      const { DatabaseSync } = await import('node:sqlite')
      const db = new DatabaseSync(dbFile, { readOnly: true })
      try {
        if (args.stats) {
          const byState = Object.fromEntries(db.prepare('SELECT state,COUNT(*) c FROM jobs GROUP BY state').all().map(r => [r.state || '未标', r.c]))
          return { stats: true, byState }
        }
        const conds = [], vals = []
        if (args.q) { conds.push('(company LIKE ? OR title LIKE ? OR raw LIKE ?)'); vals.push(`%${args.q}%`, `%${args.q}%`, `%${args.q}%`) }
        if (args.state) { conds.push('state=?'); vals.push(String(args.state)) }
        const where = conds.length ? 'WHERE ' + conds.join(' AND ') : ''
        const limit = Math.min(Number.isFinite(+args.limit) ? +args.limit : 30, 200)
        const rows = db.prepare(`SELECT company,title,salary,state,date FROM jobs ${where} ORDER BY date DESC LIMIT ?`).all(...vals, limit)
        return { count: rows.length, hits: rows }
      } finally { db.close() }
    },
    presentCall: (a) => ({ card: 'generic', title: '查求职', kind: 'other', rawInput: a }),
  }))

  ctx.effect(() => ctx.skills.registerProvider(() => createSkillProvider(ctx)))
}
