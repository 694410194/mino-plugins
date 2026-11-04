/**
 * mino-connector-collab —— 协同办公本地语料连接器（钉钉/飞书直读）。
 * collab_scan：枚举钉钉/飞书本地存储目录，列出库文件并尝试只读打开
 * sqlite 统计表与行数；打不开的标「加密」给指引。
 * collab_read：读指定 sqlite 库里的消息样表内容入 chat.db 检索。
 */
import { existsSync, readdirSync, statSync, readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { homedir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { loadHostDeps } from './hostdeps.mjs'
import { createSkillProvider } from './skill-provider.mjs'

const PKG_DIR = dirname(fileURLToPath(import.meta.url))
const PKG = JSON.parse(readFileSync(join(PKG_DIR, 'package.json'), 'utf8'))
const DSH_HOME = process.env.DSH_HOME || join(homedir(), '.dsh')
const CHAT_DB = join(DSH_HOME, 'connector-chat-export', 'chat.db')
const HOME = homedir()
const APPD = process.env.APPDATA || join(HOME, 'AppData', 'Roaming')
const LOCAL = process.env.LOCALAPPDATA || join(HOME, 'AppData', 'Local')

export const name = PKG.name
export const inject = ['skills', 'tools']
const defineTool = (await loadHostDeps()).defineTool

const SPOTS = [
  { app: '钉钉', dirs: [join(APPD, 'DingTalk'), join(APPD, 'DingTalkStorage'), join(LOCAL, 'DingTalk'), join(HOME, 'Documents', 'DingTalkStorage')] },
  { app: '飞书', dirs: [join(APPD, 'Feishu'), join(APPD, 'Lark'), join(LOCAL, 'Feishu'), join(HOME, 'Documents', 'Lark')] },
]

function* iterDbFiles(dir, depth = 0) {
  if (depth > 5) return
  let es
  try { es = readdirSync(dir, { withFileTypes: true }) } catch { return }
  for (const e of es) {
    const p = join(dir, e.name)
    if (e.isDirectory()) yield* iterDbFiles(p, depth + 1)
    else if (/\.(db|sqlite|sqlite3|ldb|log)$/i.test(e.name) && statSync(p).size > 4096) yield p
  }
}

export function apply(ctx) {
  ctx.tools.register(defineTool({
    name: 'collab_scan',
    description: '扫钉钉/飞书本地存储：找到库文件并尝试只读打开 sqlite，报各表行数；打不开的标加密给指引。',
    parameters: {},
    output: { schema: { type: 'object', additionalProperties: true },
      render: (_a, v) => [{ type: 'text', text: (v.apps || []).map(a => `${a.app}:库${a.dbs.length}个`).join('；') || '没找到本地存储' }] },
    isConcurrencySafe: () => true,
    async execute() {
      const { DatabaseSync } = await import('node:sqlite').catch(() => ({}))
      const apps = []
      for (const s of SPOTS) {
        const entry = { app: s.app, dirs: s.dirs.filter(d => existsSync(d)), dbs: [] }
        for (const d of entry.dirs) {
          for (const f of iterDbFiles(d)) {
            const info = { file: f.replace(HOME, '~'), sizeMB: Math.round(statSync(f).size / 104857.6) / 10 }
            if (DatabaseSync && /\.(db|sqlite|sqlite3)$/i.test(f)) {
              try {
                const db = new DatabaseSync(f, { readOnly: true })
                info.tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' LIMIT 20").all().map(t => t.name)
                db.close()
                info.readable = true
              } catch { info.readable = false }
            }
            entry.dbs.push(info)
            if (entry.dbs.length > 40) break
          }
        }
        if (entry.dirs.length) apps.push(entry)
      }
      return { apps, note: apps.length ? '' : '没找到钉钉/飞书本地目录（用导出功能拿 csv/txt 喂 chat_import）' }
    },
    presentCall: (a) => ({ card: 'generic', title: '扫钉钉飞书', kind: 'other', rawInput: a }),
  }))

  ctx.tools.register(defineTool({
    name: 'collab_read',
    description: '读钉钉/飞书本地 sqlite 库里消息样表：先 collab_scan 拿 readable 库路径和表名，把消息行收进聊天库检索。',
    parameters: {
      db: { type: 'string', required: true, description: 'sqlite 库路径' },
      source: { type: 'string', description: '来源标签 dingtalk/feishu（默认 dingtalk）' },
      limit: { type: 'integer', description: '每表最多收多少条（默认 50000）' },
    },
    output: { schema: { type: 'object', additionalProperties: false, properties: { imported: { type: 'integer' } } },
      render: (_a, v) => [{ type: 'text', text: `收编 ${v.imported} 条消息` }] },
    isConcurrencySafe: () => false,
    async execute(args) {
      const { DatabaseSync } = await import('node:sqlite')
      const f = String(args.db || '').trim()
      if (!existsSync(f)) throw new Error(`collab_read: 库不存在 ${f}`)
      const src = String(args.source || 'dingtalk')
      const limit = Math.min(Number.isFinite(+args.limit) ? +args.limit : 50000, 500000)
      let sdb
      try { sdb = new DatabaseSync(f, { readOnly: true }) }
      catch { throw new Error('collab_read: 库打不开（可能是加密库/LevelDB——加密侧按特区留给引擎）') }
      const { mkdirSync } = await import('node:fs')
      mkdirSync(join(DSH_HOME, 'connector-chat-export'), { recursive: true })
      const chatDb = new DatabaseSync(CHAT_DB)
      chatDb.exec('CREATE TABLE IF NOT EXISTS messages(source TEXT, file TEXT, time TEXT, sender TEXT, text TEXT)')
      const ins = chatDb.prepare('INSERT INTO messages(source,file,time,sender,text) VALUES(?,?,?,?,?)')
      let imported = 0
      chatDb.exec('BEGIN')
      try {
        const tables = sdb.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map(t => t.name)
        for (const t of tables) {
          const cols = sdb.prepare(`PRAGMA table_info("${t}")`).all().map(c => c.name)
          const textCol = cols.find(c => /content|text|msg|body/i.test(c))
          if (!textCol) continue
          const timeCol = cols.find(c => /time|date|create/i.test(c))
          const senderCol = cols.find(c => /sender|from|nick|name|uid/i.test(c))
          const rows = sdb.prepare(`SELECT ${timeCol || 'rowid'} t, ${senderCol || "''"} s, ${textCol} x FROM "${t}" LIMIT ?`).all(limit)
          for (const r of rows) {
            const txt = String(r.x || '').replace(/<[^>]+>/g, ' ').trim()
            if (!txt || txt.length < 2 || /^\d+$/.test(txt)) continue
            const tm = /^\d{10,13}$/.test(String(r.t)) ? new Date(+String(r.t).slice(0, 10) * 1000).toISOString().slice(0, 19).replace('T', ' ') : String(r.t || '').slice(0, 19)
            ins.run(src, f.split(/[\\/]/).pop(), tm, String(r.s || ''), txt.slice(0, 2000))
            imported++
          }
        }
        chatDb.exec('COMMIT')
      } finally { sdb.close(); chatDb.close() }
      if (!imported) throw new Error('collab_read: 库里没有消息样文本列')
      return { imported }
    },
    presentCall: (a) => ({ card: 'generic', title: '读协同库', kind: 'other', rawInput: a }),
  }))

  ctx.effect(() => ctx.skills.registerProvider(() => createSkillProvider(ctx)))
}
