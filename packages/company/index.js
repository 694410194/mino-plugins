/**
 * mino-connector-company —— 企业信息连接器（目录外域：企业信息，对标 PDH 天眼查）。
 * 天眼查/企查查/爱企查 页面复制文本 → 解析成企业卡库：
 * 公司名/法人/注册资本/成立日期/状态。手动导入形态。
 */
import { existsSync, readFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { homedir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { loadHostDeps } from './hostdeps.mjs'
import { createSkillProvider } from './skill-provider.mjs'

const PKG_DIR = dirname(fileURLToPath(import.meta.url))
const PKG = JSON.parse(readFileSync(join(PKG_DIR, 'package.json'), 'utf8'))
const STORE = join(process.env.DSH_HOME || join(homedir(), '.dsh'), 'connector-company')

export const name = PKG.name
export const inject = ['skills', 'tools']
const defineTool = (await loadHostDeps()).defineTool

export function apply(ctx) {
  ctx.tools.register(defineTool({
    name: 'company_add',
    description: '记一张企业卡：把天眼查/企查查公司主页文本复制粘过来，自动抓 法人/注册资本/成立日期/经营状态。',
    parameters: {
      text: { type: 'string', required: true, description: '公司主页复制的文本' },
      name: { type: 'string', description: '公司名（文本里没识别出来时给）' },
    },
    output: { schema: { type: 'object', additionalProperties: false, properties: { stored: { type: 'integer' } } },
      render: (_a, v) => [{ type: 'text', text: `企业卡已存` }] },
    isConcurrencySafe: () => false,
    async execute(args) {
      const { DatabaseSync } = await import('node:sqlite').catch(() => ({}))
      if (!DatabaseSync) throw new Error('company_add: 运行时缺 node:sqlite')
      const text = String(args.text || '')
      if (text.trim().length < 10) throw new Error('company_add: 把公司主页文本粘进来')
      const name = String(args.name || '') ||
        text.match(/([一-龥（）()]{4,30}(?:公司|集团|厂|中心|事务所|企业))/)?.[1] || ''
      const legal = text.match(/(?:法定代表人|法人|负责人)[:：]?\s*([一-龥]{2,4})/)?.[1] || ''
      const capital = text.match(/(?:注册资本|注册资金)[:：]?\s*([0-9.,]+\s*(?:万|亿)(?:人民币|美元|元)?)/)?.[1]?.trim() || ''
      const founded = text.match(/(?:成立日期|成立时间|注册时间)[:：]?\s*(20\d{2}[-年]\d{1,2}[-月]\d{1,2})/)?.[1] || ''
      const status = text.match(/(存续|在业|注销|吊销|迁出|开业|正常)/)?.[1] || ''
      if (!name) throw new Error('company_add: 没认出公司名，用 name 参数给一下')
      mkdirSync(STORE, { recursive: true })
      const db = new DatabaseSync(join(STORE, 'company.db'))
      db.exec('CREATE TABLE IF NOT EXISTS companies(name TEXT PRIMARY KEY,legal TEXT,capital TEXT,founded TEXT,status TEXT,raw TEXT,saved TEXT)')
      db.prepare('INSERT OR REPLACE INTO companies(name,legal,capital,founded,status,raw,saved) VALUES(?,?,?,?,?,?,?)')
        .run(name, legal, capital, founded, status, text.slice(0, 3000), new Date().toISOString().slice(0, 10))
      db.close()
      return { stored: 1 }
    },
    presentCall: (a) => ({ card: 'generic', title: '存企业卡', kind: 'other', rawInput: a }),
  }))

  ctx.tools.register(defineTool({
    name: 'company_search',
    description: '查企业卡库：按公司名/法人查，stats=true 看库规模。',
    parameters: {
      q: { type: 'string', description: '公司名或法人关键词' },
      stats: { type: 'boolean', description: 'true=库规模' },
      limit: { type: 'integer', description: '最多多少条（默认 20）' },
    },
    output: { schema: { type: 'object', additionalProperties: true },
      render: (_a, v) => [{ type: 'text', text: v.stats ? `企业卡 ${v.total} 张`
        : `${v.count} 家：` + (v.hits||[]).slice(0,6).map(h=>`${h.name}(${h.status||'?'})`).join('；') }] },
    isConcurrencySafe: () => true,
    async execute(args) {
      const dbFile = join(STORE, 'company.db')
      if (!existsSync(dbFile)) return args.stats ? { stats: true, total: 0 } : { count: 0, hits: [] }
      const { DatabaseSync } = await import('node:sqlite')
      const db = new DatabaseSync(dbFile, { readOnly: true })
      try {
        if (args.stats) return { stats: true, total: db.prepare('SELECT COUNT(*) c FROM companies').get().c }
        const q = `%${String(args.q || '')}%`
        const limit = Math.min(Number.isFinite(+args.limit) ? +args.limit : 20, 100)
        const rows = db.prepare('SELECT name,legal,capital,founded,status FROM companies WHERE name LIKE ? OR legal LIKE ? OR raw LIKE ? LIMIT ?').all(q, q, q, limit)
        return { count: rows.length, hits: rows }
      } finally { db.close() }
    },
    presentCall: (a) => ({ card: 'generic', title: '查企业', kind: 'other', rawInput: a }),
  }))

  ctx.effect(() => ctx.skills.registerProvider(() => createSkillProvider(ctx)))
}
