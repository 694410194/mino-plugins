/**
 * mino-connector-corpus —— 语料总库（矛层地基 v0）。
 * 统一扫 ~/.dsh/connector-xxx/ 下各连接器的 .db 文本行，建一个 FTS5
 * 全文索引；corpus_search 跨域检索。v0=关键词索引（sqlite FTS5 零依赖），
 * 向量语义层是下一步（LanceDB vendored，体量大走可选件）。
 */
import { existsSync, readFileSync, mkdirSync, readdirSync, statSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { homedir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { loadHostDeps } from './hostdeps.mjs'
import { createSkillProvider } from './skill-provider.mjs'

const PKG_DIR = dirname(fileURLToPath(import.meta.url))
const PKG = JSON.parse(readFileSync(join(PKG_DIR, 'package.json'), 'utf8'))
const DSH_HOME = process.env.DSH_HOME || join(homedir(), '.dsh')
const STORE = join(DSH_HOME, 'connector-corpus')

export const name = PKG.name
export const inject = ['skills', 'tools']
const defineTool = (await loadHostDeps()).defineTool

// 各连接器库里的文本列取法（表名→文本列）
const TABLES = {
  'orders.db': { orders: 'raw' }, 'contacts.db': { contacts: "name||' '||phone", messages: 'text' },
  'calendar.db': { events: "summary||' '||location" }, 'docs.db': { docs: 'text' },
  'gov.db': { gov: 'raw' }, 'edu.db': { edu: 'raw' }, 'jobs.db': { jobs: 'raw' },
  'car.db': { car: 'raw' }, 'meeting.db': { segs: 'txt' }, 'notes.db': { notes: "title||' '||text" },
  'vault.db': { entries: "name||' '||username||' '||url" }, 'ime.db': { words: 'word' },
  'chat.db': { messages: "sender||': '||text" }, 'matches.db': { matches: 'raw' }, 'health.db': { entries: 'raw' },
  'qzone.db': { posts: 'text' }, 'records.db': { records: "title||' '||text" },
  'companies.db': { companies: "name||' '||raw" }, 'company.db': { companies: "name||' '||raw" },
}

export function apply(ctx) {
  ctx.tools.register(defineTool({
    name: 'corpus_index',
    description: '把各连接器已入库的语料统一编进全文索引（扫 ~/.dsh/connector-*/*.db）。语料多就后台跑，返回入库条数。',
    parameters: {},
    output: { schema: { type: 'object', additionalProperties: false, properties: {
      indexed: { type: 'integer' }, sources: { type: 'integer' } } },
      render: (_a, v) => [{ type: 'text', text: `总索引 ${v.indexed} 条，覆盖 ${v.sources} 个库` }] },
    isConcurrencySafe: () => false,
    async execute() {
      const { DatabaseSync } = await import('node:sqlite').catch(() => ({}))
      if (!DatabaseSync) throw new Error('corpus_index: 运行时缺 node:sqlite')
      mkdirSync(STORE, { recursive: true })
      const idx = new DatabaseSync(join(STORE, 'corpus.db'))
      // 普通表+LIKE：FTS5 unicode61 不切 CJK，中文子串匹配靠不住
      idx.exec('DROP TABLE IF EXISTS corpus')
      idx.exec('CREATE TABLE corpus(src TEXT, text TEXT)')
      idx.exec('CREATE INDEX IF NOT EXISTS idx_src ON corpus(src)')
      const ins = idx.prepare('INSERT INTO corpus(src, text) VALUES(?,?)')
      let total = 0, sources = 0
      const dbs = readdirSync(DSH_HOME).filter(d => d.startsWith('connector-'))
        .flatMap(d => { try { return readdirSync(join(DSH_HOME, d)).filter(f => f.endsWith('.db')).map(f => ({ src: d, file: join(DSH_HOME, d, f) })) } catch { return [] } })
      for (const { src, file } of dbs) {
        const map = TABLES[file.split(/[\\/]/).pop()]
        if (!map || !Object.keys(map).length) continue
        let db
        try { db = new DatabaseSync(file, { readOnly: true }) } catch { continue }
        sources++
        try {
          for (const [table, col] of Object.entries(map)) {
            try {
              const rows = db.prepare(`SELECT ${col} t FROM ${table} LIMIT 200000`).all()
              for (const r of rows) { const t = String(r.t || '').slice(0, 20000); if (t) { ins.run(`${src}/${table}`, t); total++ } }
            } catch { }
          }
        } finally { db.close() }
      }
      idx.exec('CREATE INDEX IF NOT EXISTS idx_text ON corpus(text)')
      idx.close()
      return { indexed: total, sources }
    },
    presentCall: (a) => ({ card: 'generic', title: '建总索引', kind: 'other', rawInput: a }),
  }))

  ctx.tools.register(defineTool({
    name: 'corpus_search',
    description: '跨域全文检索：在所有连接器入库的语料里搜关键词（先 corpus_index 建索引）。返回命中原文和来源库。',
    parameters: {
      q: { type: 'string', required: true, description: '关键词（空格分隔=AND）' },
      limit: { type: 'integer', description: '最多多少条（默认 20）' },
    },
    output: { schema: { type: 'object', additionalProperties: false, properties: {
      hits: { type: 'array', items: { type: 'object', additionalProperties: true } }, count: { type: 'integer' } } },
      render: (_a, v) => [{ type: 'text', text: `${v.count} 条命中：` + v.hits.slice(0, 6).map(h => `[${h.src}] ${h.text.slice(0, 40)}`).join('；') }] },
    isConcurrencySafe: () => true,
    async execute(args) {
      const dbFile = join(STORE, 'corpus.db')
      if (!existsSync(dbFile)) throw new Error('还没建总索引，先跑 corpus_index')
      const { DatabaseSync } = await import('node:sqlite')
      const db = new DatabaseSync(dbFile, { readOnly: true })
      try {
        const terms = String(args.q || '').split(/\s+/).filter(Boolean)
        if (!terms.length) throw new Error('corpus_search: 给关键词')
        const limit = Math.min(Number.isFinite(+args.limit) ? +args.limit : 20, 100)
        const where = terms.map(() => 'text LIKE ?').join(' AND ')
        const rows = db.prepare(`SELECT src, text FROM corpus WHERE ${where} LIMIT ?`)
          .all(...terms.map(t => `%${t}%`), limit)
        return { count: rows.length, hits: rows.map(r => {
          const i = r.text.indexOf(terms[0])
          return { src: r.src, text: i >= 0 ? r.text.slice(Math.max(0, i - 30), i + 60) : r.text.slice(0, 80) }
        }) }
      } finally { db.close() }
    },
    presentCall: (a) => ({ card: 'generic', title: '全库检索', kind: 'other', rawInput: a }),
  }))

  ctx.effect(() => ctx.skills.registerProvider(() => createSkillProvider(ctx)))
}
