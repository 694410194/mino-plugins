/**
 * mino-connector-docs —— 文档全文连接器（空白域：文档 + 补全文检索面）。
 * docs_index：把本地文档目录（md/txt/html/log/docx/pptx/xlsx 抽文本）
 * 建 sqlite 全文索引；docs_search 检索正文内容。
 * docx/pptx/xlsx 用 PowerShell 解压 zip 取 XML 去标签，零 npm 依赖。
 */
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { existsSync, readFileSync, readdirSync, statSync, mkdirSync } from 'node:fs'
import { join, dirname, extname } from 'node:path'
import { homedir, tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { loadHostDeps } from './hostdeps.mjs'
import { createSkillProvider } from './skill-provider.mjs'

const execFileP = promisify(execFile)
const PKG_DIR = dirname(fileURLToPath(import.meta.url))
const PKG = JSON.parse(readFileSync(join(PKG_DIR, 'package.json'), 'utf8'))
const STORE = join(process.env.DSH_HOME || join(homedir(), '.dsh'), 'connector-docs')

export const name = PKG.name
export const inject = ['skills', 'tools']
const defineTool = (await loadHostDeps()).defineTool

let DatabaseSync = null
try { ({ DatabaseSync } = await import('node:sqlite')) } catch { }

const PLAIN = ['.md', '.txt', '.log', '.csv', '.json', '.html', '.htm', '.xml', '.yaml', '.yml', '.js', '.ts', '.py', '.java', '.go', '.rs', '.c', '.cpp', '.h', '.css', '.sql', '.sh', '.ps1', '.bat', '.ini', '.conf', '.vue', '.jsx', '.tsx']
const OFFICE = ['.docx', '.pptx', '.xlsx']

async function officeText(file) {
  const tmp = join(tmpdir(), `docx-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`)
  const zipPath = `${tmp}.zip`
  try {
    const { copyFileSync } = await import('node:fs')
    copyFileSync(file, zipPath)
    await execFileP('powershell', ['-NoProfile', '-Command',
      `Expand-Archive -LiteralPath '${zipPath.replace(/'/g, "''")}' -DestinationPath '${tmp.replace(/'/g, "''")}' -Force`],
      { timeout: 30000, windowsHide: true })
  } catch { return '' }
  const xmls = []
  const walk = (d) => {
    try {
      for (const e of readdirSync(d, { withFileTypes: true })) {
        const p = join(d, e.name)
        if (e.isDirectory()) walk(p)
        else if (/\.xml$/i.test(e.name) && /document|sheet|slide\d|sharedStrings/i.test(e.name)) xmls.push(p)
      }
    } catch { }
  }
  walk(tmp)
  let text = ''
  for (const x of xmls.slice(0, 30)) {
    try { text += ' ' + readFileSync(x, 'utf8').replace(/<[^>]+>/g, ' ') } catch { }
  }
  return text.replace(/\s+/g, ' ').slice(0, 100000)
}

function openStore() {
  mkdirSync(STORE, { recursive: true })
  const db = new DatabaseSync(join(STORE, 'docs.db'))
  db.exec(`CREATE TABLE IF NOT EXISTS docs(path TEXT, name TEXT, ext TEXT, size INTEGER, mtime TEXT, text TEXT)`)
  db.exec(`CREATE INDEX IF NOT EXISTS idx_t ON docs(name)`)
  return db
}

export function apply(ctx) {
  ctx.tools.register(defineTool({
    name: 'docs_index',
    description:
      '给本地文档目录建全文索引：md/txt/html/代码文件直读文本，' +
      'docx/pptx/xlsx 解出正文。建完后用 docs_search 查正文内容。',
    parameters: {
      dir: { type: 'string', required: true, description: '要索引的目录' },
      maxFiles: { type: 'integer', description: '最多索引多少文件（默认 3000）' },
    },
    output: { schema: { type: 'object', additionalProperties: false, properties: {
      indexed: { type: 'integer' }, skipped: { type: 'integer' }, db: { type: 'string' } } },
      render: (_a, v) => [{ type: 'text', text: `索引 ${v.indexed} 个文档（跳过 ${v.skipped}）` }] },
    isConcurrencySafe: () => false,
    async execute(args) {
      if (!DatabaseSync) throw new Error('docs_index: 运行时缺 node:sqlite')
      const dir = String(args.dir || '').trim()
      if (!existsSync(dir)) throw new Error(`docs_index: 目录不存在 ${dir}`)
      const maxFiles = Math.min(Number.isFinite(+args.maxFiles) ? +args.maxFiles : 3000, 20000)
      const files = []
      const walk = (d, depth) => {
        if (depth > 8 || files.length >= maxFiles) return
        let es
        try { es = readdirSync(d, { withFileTypes: true }) } catch { return }
        for (const e of es) {
          if (files.length >= maxFiles) return
          const p = join(d, e.name)
          if (e.isDirectory()) { if (!/node_modules|\.git/i.test(e.name)) walk(p, depth + 1); continue }
          const ext = extname(e.name).toLowerCase()
          if (PLAIN.includes(ext) || OFFICE.includes(ext)) files.push(p)
        }
      }
      walk(dir, 0)
      const db = openStore()
      const ins = db.prepare('INSERT OR REPLACE INTO docs(path,name,ext,size,mtime,text) VALUES(?,?,?,?,?,?)')
      let indexed = 0, skipped = 0
      db.exec('BEGIN')
      try {
        for (const f of files) {
          const ext = extname(f).toLowerCase()
          const st = statSync(f)
          if (st.size > 5 * 1024 * 1024) { skipped++; continue }
          let text = ''
          try { text = OFFICE.includes(ext) ? await officeText(f) : readFileSync(f, 'utf8').slice(0, 200000) } catch { skipped++; continue }
          if (!text.trim()) { skipped++; continue }
          ins.run(f, f.split(/[\\/]/).pop(), ext, st.size, st.mtime.toISOString().slice(0, 10), text.replace(/\0/g, ''))
          indexed++
        }
        db.exec('COMMIT')
      } finally { db.close() }
      return { indexed, skipped, db: join(STORE, 'docs.db') }
    },
    presentCall: (a) => ({ card: 'generic', title: '建文档索引', kind: 'other', rawInput: a }),
  }))

  ctx.tools.register(defineTool({
    name: 'docs_search',
    description: '在已索引的文档里按关键词查正文内容。先用 docs_index 建索引。',
    parameters: {
      q: { type: 'string', required: true, description: '关键词' },
      ext: { type: 'string', description: '可选：限定后缀如 .md/.docx' },
      limit: { type: 'integer', description: '最多多少条（默认 20）' },
    },
    output: { schema: { type: 'object', additionalProperties: false, properties: {
      hits: { type: 'array', items: { type: 'object', additionalProperties: true } }, count: { type: 'integer' } } },
      render: (_a, v) => [{ type: 'text', text: `${v.count} 个文档命中：` + v.hits.slice(0, 6).map(h => h.name).join('、') }] },
    isConcurrencySafe: () => true,
    async execute(args) {
      const dbFile = join(STORE, 'docs.db')
      if (!existsSync(dbFile)) throw new Error('还没建索引，先用 docs_index')
      const db = new DatabaseSync(dbFile, { readOnly: true })
      try {
        const q = `%${String(args.q || '')}%`
        const limit = Math.min(Number.isFinite(+args.limit) ? +args.limit : 20, 100)
        const rows = args.ext
          ? db.prepare('SELECT path,name,ext,mtime,text FROM docs WHERE text LIKE ? AND ext=? LIMIT ?').all(q, String(args.ext), limit)
          : db.prepare('SELECT path,name,ext,mtime,text FROM docs WHERE text LIKE ? LIMIT ?').all(q, limit)
        const needle = String(args.q || '')
        return {
          count: rows.length,
          hits: rows.map(r => {
            const i = r.text.indexOf(needle)
            return { name: r.name, path: r.path, mtime: r.mtime,
              snippet: i >= 0 ? r.text.slice(Math.max(0, i - 40), i + 80).replace(/\s+/g, ' ') : r.text.slice(0, 80) }
          }),
        }
      } finally { db.close() }
    },
    presentCall: (a) => ({ card: 'generic', title: '搜文档内容', kind: 'other', rawInput: a }),
  }))

  ctx.effect(() => ctx.skills.registerProvider(() => createSkillProvider(ctx)))
}
