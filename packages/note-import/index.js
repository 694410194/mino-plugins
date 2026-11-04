/**
 * mino-connector-note-import —— 笔记导入连接器（半接域补齐：印象/有道/为知）。
 * 印象笔记 .enex、有道云/为知 导出的 .html/.md 解析入本地库全文检索。
 * 手动导入形态：App 内"导出笔记"得到的文件喂进来。
 */
import { existsSync, readFileSync, mkdirSync } from 'node:fs'
import { join, dirname, basename, extname } from 'node:path'
import { homedir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { loadHostDeps } from './hostdeps.mjs'
import { createSkillProvider } from './skill-provider.mjs'

const PKG_DIR = dirname(fileURLToPath(import.meta.url))
const PKG = JSON.parse(readFileSync(join(PKG_DIR, 'package.json'), 'utf8'))
const STORE = join(process.env.DSH_HOME || join(homedir(), '.dsh'), 'connector-note-import')

export const name = PKG.name
export const inject = ['skills', 'tools']
const defineTool = (await loadHostDeps()).defineTool

const strip = (s) => s.replace(/<[^>]+>/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&nbsp;/g, ' ').replace(/\s+/g, ' ').trim()

function* parseEnex(xml) {
  for (const m of xml.matchAll(/<note>([\s\S]*?)<\/note>/g)) {
    const b = m[1]
    const title = b.match(/<title>([\s\S]*?)<\/title>/)?.[1]?.trim() || '无标题'
    const content = b.match(/<content>([\s\S]*?)<\/content>/)?.[1] || ''
    const created = b.match(/<created>(\d{8})T/)?.[1] || ''
    yield { title: strip(title), text: strip(content).slice(0, 50000),
      date: created ? `${created.slice(0, 4)}-${created.slice(4, 6)}-${created.slice(6, 8)}` : '' }
  }
}

export function apply(ctx) {
  ctx.tools.register(defineTool({
    name: 'note_import',
    description: '导入笔记：印象笔记 .enex 或有道/为知/通用导出的 .html/.md 文件（或目录批量）。入库后 note_search 全文检索。',
    parameters: {
      path: { type: 'string', required: true, description: '.enex/.html/.md 文件或含这些文件的目录' },
    },
    output: { schema: { type: 'object', additionalProperties: false, properties: { notes: { type: 'integer' }, files: { type: 'integer' } } },
      render: (_a, v) => [{ type: 'text', text: `导入 ${v.notes} 篇笔记（${v.files} 个文件）` }] },
    isConcurrencySafe: () => false,
    async execute(args) {
      const { DatabaseSync } = await import('node:sqlite').catch(() => ({}))
      if (!DatabaseSync) throw new Error('note_import: 运行时缺 node:sqlite')
      const p = String(args.path || '').trim()
      if (!existsSync(p)) throw new Error(`note_import: 路径不存在 ${p}`)
      const { readdirSync, statSync } = await import('node:fs')
      const files = statSync(p).isDirectory()
        ? readdirSync(p).filter(f => /\.(enex|html?|md)$/i.test(f)).map(f => join(p, f)) : [p]
      if (!files.length) throw new Error('note_import: 目录里没有 .enex/.html/.md 文件')
      mkdirSync(STORE, { recursive: true })
      const db = new DatabaseSync(join(STORE, 'notes.db'))
      db.exec('CREATE TABLE IF NOT EXISTS notes(title TEXT,date TEXT,src TEXT,text TEXT)')
      const ins = db.prepare('INSERT INTO notes(title,date,src,text) VALUES(?,?,?,?)')
      let n = 0
      db.exec('BEGIN')
      try {
        for (const f of files) {
          const raw = readFileSync(f, 'utf8')
          const ext = extname(f).toLowerCase()
          if (ext === '.enex') {
            for (const note of parseEnex(raw)) { ins.run(note.title, note.date, basename(f), note.text); n++ }
          } else {
            const title = raw.match(/<title>([^<]+)<\/title>/i)?.[1] || basename(f).replace(/\.(html?|md)$/i, '')
            ins.run(strip(title) || basename(f), statSync(f).mtime.toISOString().slice(0, 10), basename(f), strip(raw).slice(0, 50000))
            n++
          }
          if (n > 50000) break
        }
        db.exec('COMMIT')
      } finally { db.close() }
      if (!n) throw new Error('note_import: 没解析出笔记')
      return { notes: n, files: files.length }
    },
    presentCall: (a) => ({ card: 'generic', title: '导笔记', kind: 'other', rawInput: a }),
  }))

  ctx.tools.register(defineTool({
    name: 'note_search',
    description: '查已导入的笔记：标题/正文关键词检索。',
    parameters: {
      q: { type: 'string', required: true, description: '关键词' },
      limit: { type: 'integer', description: '最多多少条（默认 15）' },
    },
    output: { schema: { type: 'object', additionalProperties: false, properties: {
      hits: { type: 'array', items: { type: 'object', additionalProperties: true } }, count: { type: 'integer' } } },
      render: (_a, v) => [{ type: 'text', text: `${v.count} 篇：` + v.hits.slice(0, 8).map(h => `《${h.title}》`).join('；') }] },
    isConcurrencySafe: () => true,
    async execute(args) {
      const dbFile = join(STORE, 'notes.db')
      if (!existsSync(dbFile)) throw new Error('还没导入过笔记，先用 note_import')
      const { DatabaseSync } = await import('node:sqlite')
      const db = new DatabaseSync(dbFile, { readOnly: true })
      try {
        const q = `%${String(args.q || '')}%`
        const limit = Math.min(Number.isFinite(+args.limit) ? +args.limit : 15, 100)
        const rows = db.prepare('SELECT title,date,src,substr(text,1,200) snippet FROM notes WHERE title LIKE ? OR text LIKE ? LIMIT ?').all(q, q, limit)
        return { count: rows.length, hits: rows }
      } finally { db.close() }
    },
    presentCall: (a) => ({ card: 'generic', title: '查笔记', kind: 'other', rawInput: a }),
  }))

  ctx.effect(() => ctx.skills.registerProvider(() => createSkillProvider(ctx)))
}
