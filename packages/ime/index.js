/**
 * mino-connector-ime —— 输入法词库连接器（域 25 扩面）。
 * 导入词库转换工具（深蓝词库/rose 等）产出的词条文本（一行一词
 * 或 词,拼音,词频 格式）入本地 sqlite，可检索/导出为其它格式原料。
 * 转换动作用户侧做，本插件做收编和检索。
 */
import { existsSync, readFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { homedir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { loadHostDeps } from './hostdeps.mjs'
import { createSkillProvider } from './skill-provider.mjs'

const PKG_DIR = dirname(fileURLToPath(import.meta.url))
const PKG = JSON.parse(readFileSync(join(PKG_DIR, 'package.json'), 'utf8'))
const STORE = join(process.env.DSH_HOME || join(homedir(), '.dsh'), 'connector-ime')

export const name = PKG.name
export const inject = ['skills', 'tools']
const defineTool = (await loadHostDeps()).defineTool

let DatabaseSync = null
try { ({ DatabaseSync } = await import('node:sqlite')) } catch { }

function openStore() {
  mkdirSync(STORE, { recursive: true })
  const db = new DatabaseSync(join(STORE, 'ime.db'))
  db.exec(`CREATE TABLE IF NOT EXISTS words(word TEXT, py TEXT, freq INTEGER, source TEXT)`)
  db.exec(`CREATE INDEX IF NOT EXISTS idx_w ON words(word)`)
  return db
}

export function apply(ctx) {
  ctx.tools.register(defineTool({
    name: 'ime_import',
    description:
      '导入词库文本：深蓝词库转换/rose 等工具产出的 .txt/.csv 词表' +
      '（一行一词 或 词,拼音,词频）。入本地库后可检索/统计。',
    parameters: {
      path: { type: 'string', required: true, description: '词表文件路径' },
      source: { type: 'string', description: '来源标签（如 sogou/msime/qq）' },
    },
    output: { schema: { type: 'object', additionalProperties: false, properties: { imported: { type: 'integer' } } },
      render: (_a, v) => [{ type: 'text', text: `导入 ${v.imported} 个词条` }] },
    isConcurrencySafe: () => false,
    async execute(args) {
      if (!DatabaseSync) throw new Error('ime_import: 运行时缺 node:sqlite')
      const f = String(args.path || '').trim()
      if (!existsSync(f)) throw new Error(`ime_import: 文件不存在 ${f}`)
      const src = String(args.source || 'ime')
      const db = openStore()
      const ins = db.prepare('INSERT INTO words(word,py,freq,source) VALUES(?,?,?,?)')
      let n = 0
      db.exec('BEGIN')
      try {
        for (const line of readFileSync(f, 'utf8').split(/\r?\n/)) {
          const l = line.trim()
          if (!l || l.startsWith('#') || n > 500000) continue
          const parts = l.split(/[,，\t ]/).filter(Boolean)
          const word = parts[0]
          if (!word || !/[一-龥A-Za-z]/.test(word)) continue
          const py = parts.find(p => /^[a-z' ]+$/i.test(p) && p !== word) || ''
          const freq = +(parts.find(p => /^\d+$/.test(p)) || 0)
          ins.run(word.slice(0, 40), py.slice(0, 60), freq, src)
          n++
        }
        db.exec('COMMIT')
      } finally { db.close() }
      if (!n) throw new Error('ime_import: 没解析出词条（一行一词 或 词,拼音,词频）')
      return { imported: n }
    },
    presentCall: (a) => ({ card: 'generic', title: '导词库', kind: 'other', rawInput: a }),
  }))

  ctx.tools.register(defineTool({
    name: 'ime_search',
    description: '查词库：按词/拼音检索，或看词库规模统计。',
    parameters: {
      q: { type: 'string', description: '词或拼音关键词' },
      stats: { type: 'boolean', description: 'true=只看规模' },
      limit: { type: 'integer', description: '最多多少条（默认 30）' },
    },
    output: { schema: { type: 'object', additionalProperties: true },
      render: (_a, v) => [{ type: 'text', text: v.stats
        ? `词库 ${v.total} 词 / ${Object.keys(v.sources||{}).length} 源`
        : `${v.count} 条：` + (v.hits||[]).slice(0,10).map(h=>h.word).join('、') }] },
    isConcurrencySafe: () => true,
    async execute(args) {
      const dbFile = join(STORE, 'ime.db')
      if (!existsSync(dbFile)) return args.stats ? { stats: true, total: 0, sources: {} } : { count: 0, hits: [] }
      const db = new DatabaseSync(dbFile, { readOnly: true })
      try {
        if (args.stats) {
          const total = db.prepare('SELECT COUNT(*) c FROM words').get().c
          const sources = Object.fromEntries(db.prepare('SELECT source,COUNT(*) c FROM words GROUP BY source').all().map(r => [r.source, r.c]))
          return { stats: true, total, sources }
        }
        const q = `%${String(args.q || '')}%`
        const limit = Math.min(Number.isFinite(+args.limit) ? +args.limit : 30, 200)
        const rows = db.prepare('SELECT word,py,freq,source FROM words WHERE word LIKE ? OR py LIKE ? ORDER BY freq DESC LIMIT ?').all(q, q, limit)
        return { count: rows.length, hits: rows }
      } finally { db.close() }
    },
    presentCall: (a) => ({ card: 'generic', title: '查词库', kind: 'other', rawInput: a }),
  }))

  ctx.effect(() => ctx.skills.registerProvider(() => createSkillProvider(ctx)))
}
