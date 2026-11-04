/**
 * mino-connector-qzone —— QQ空间连接器（域 24，特区手动导入形态）。
 * 读用户自己导出的 QQ空间说说/日志文件（json/txt，第三方导出工具产出），
 * 入本地 sqlite 检索 + 「那年今日」回放。本体零解密零爬取。
 */
import { existsSync, readFileSync, readdirSync, statSync, mkdirSync } from 'node:fs'
import { join, dirname, extname, basename } from 'node:path'
import { homedir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { loadHostDeps } from './hostdeps.mjs'
import { createSkillProvider } from './skill-provider.mjs'

const PKG_DIR = dirname(fileURLToPath(import.meta.url))
const PKG = JSON.parse(readFileSync(join(PKG_DIR, 'package.json'), 'utf8'))
const STORE = join(process.env.DSH_HOME || join(homedir(), '.dsh'), 'connector-qzone')

export const name = PKG.name
export const inject = ['skills', 'tools']
const defineTool = (await loadHostDeps()).defineTool

let DatabaseSync = null
try { ({ DatabaseSync } = await import('node:sqlite')) } catch { }

function* iterPosts(file) {
  const raw = readFileSync(file, 'utf8')
  if (extname(file).toLowerCase() === '.json' || raw.trimStart().startsWith('[') || raw.trimStart().startsWith('{')) {
    try {
      const j = JSON.parse(raw)
      const arr = Array.isArray(j) ? j : (j.msglist || j.data || j.list || [j])
      for (const o of arr) {
        const text = String(o.content || o.text || o.con || o.memo || o.title || '').trim()
        if (!text) continue
        const t = o.createTime || o.created_time || o.time || o.date || o.pubtime || ''
        const ts = typeof t === 'number' ? new Date(t > 1e12 ? t : t * 1000).toISOString().slice(0, 19).replace('T', ' ') : String(t).slice(0, 19)
        yield { time: ts, type: o.type || (o.title ? '日志' : '说说'), text: text.slice(0, 2000) }
      }
      return
    } catch { /* 落到逐行 */ }
  }
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/(20\d{2}[-/年.]\d{1,2}[-/月.]\d{1,2}[^,，\t]*)[,，\t ]+(.{2,})/)
    if (m) yield { time: m[1].replace(/[年月/.]/g, '-').replace(/日/, ''), type: '说说', text: m[2].trim().slice(0, 2000) }
  }
}

function openStore() {
  mkdirSync(STORE, { recursive: true })
  const db = new DatabaseSync(join(STORE, 'qzone.db'))
  db.exec(`CREATE TABLE IF NOT EXISTS posts(file TEXT, time TEXT, type TEXT, text TEXT)`)
  db.exec(`CREATE INDEX IF NOT EXISTS idx_t ON posts(time)`)
  return db
}

export function apply(ctx) {
  ctx.tools.register(defineTool({
    name: 'qzone_import',
    description:
      '把你自己导出的 QQ空间说说/日志文件（.json/.txt，第三方导出工具产出）' +
      '导入本地库。支持目录或单文件。只读你的导出文件。',
    parameters: { path: { type: 'string', required: true, description: '导出文件或目录路径' } },
    output: { schema: { type: 'object', additionalProperties: false, properties: {
      imported: { type: 'integer' }, db: { type: 'string' } } },
      render: (_a, v) => [{ type: 'text', text: `导入 ${v.imported} 条 QQ空间内容` }] },
    isConcurrencySafe: () => false,
    async execute(args) {
      if (!DatabaseSync) throw new Error('qzone_import: 运行时缺 node:sqlite')
      const p = String(args.path || '').trim()
      if (!existsSync(p)) throw new Error(`qzone_import: 路径不存在 ${p}`)
      const files = statSync(p).isDirectory()
        ? readdirSync(p).filter(f => /\.(json|txt)$/i.test(f)).map(f => join(p, f)) : [p]
      if (!files.length) throw new Error('qzone_import: 没有 .json/.txt 导出文件')
      const db = openStore()
      const ins = db.prepare('INSERT INTO posts(file,time,type,text) VALUES(?,?,?,?)')
      let n = 0
      db.exec('BEGIN')
      try {
        for (const f of files) for (const post of iterPosts(f)) { ins.run(basename(f), post.time, post.type, post.text); n++ }
        db.exec('COMMIT')
      } finally { db.close() }
      return { imported: n, db: join(STORE, 'qzone.db') }
    },
    presentCall: (a) => ({ card: 'generic', title: '导入QQ空间', kind: 'other', rawInput: a }),
  }))

  ctx.tools.register(defineTool({
    name: 'qzone_search',
    description: '在已导入的 QQ空间内容里按关键词检索，或按月日看「那年今日」。',
    parameters: {
      q: { type: 'string', description: '关键词（与 onthisday 二选一）' },
      onthisday: { type: 'boolean', description: 'true=看历史上今天发过的内容' },
      limit: { type: 'integer', description: '最多多少条（默认 20）' },
    },
    output: { schema: { type: 'object', additionalProperties: false, properties: {
      hits: { type: 'array', items: { type: 'object', additionalProperties: true } }, count: { type: 'integer' } } },
      render: (_a, v) => [{ type: 'text', text: `${v.count} 条：` +
        v.hits.slice(0, 8).map(h => `${h.time.slice(0, 10)} ${h.text.slice(0, 40)}`).join('；') }] },
    isConcurrencySafe: () => true,
    async execute(args) {
      const dbFile = join(STORE, 'qzone.db')
      if (!existsSync(dbFile)) throw new Error('还没有导入过，先用 qzone_import')
      const db = new DatabaseSync(dbFile, { readOnly: true })
      try {
        const limit = Math.min(Number.isFinite(+args.limit) ? +args.limit : 20, 200)
        let rows
        if (args.onthisday) {
          const md = new Date().toISOString().slice(5, 10)
          rows = db.prepare("SELECT time,type,text FROM posts WHERE substr(time,6,5)=? ORDER BY time LIMIT ?").all(md, limit)
        } else {
          const q = `%${String(args.q || '')}%`
          rows = db.prepare('SELECT time,type,text FROM posts WHERE text LIKE ? ORDER BY time DESC LIMIT ?').all(q, limit)
        }
        return { count: rows.length, hits: rows }
      } finally { db.close() }
    },
    presentCall: (a) => ({ card: 'generic', title: '翻QQ空间', kind: 'other', rawInput: a }),
  }))

  ctx.effect(() => ctx.skills.registerProvider(() => createSkillProvider(ctx)))
}
