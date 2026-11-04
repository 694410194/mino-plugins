/**
 * mino-connector-chat-export —— 聊天记录连接器（conn-im 域，特区·洛雪壳形态）。
 *
 * 本体零解密：不碰微信/QQ 数据库、不碰密钥。只读用户自己用导出工具
 * （WeChatMsg/留痕/PyWxDump/QQExporter 等）产出的明文导出文件
 * （.txt/.csv/.json/.jsonl/.html），导进本地 sqlite 建检索。
 * 数据不出本机；导出动作由用户侧工具完成。
 */
import { existsSync, readFileSync, readdirSync, statSync, mkdirSync } from 'node:fs'
import { join, dirname, extname, basename } from 'node:path'
import { homedir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { loadHostDeps } from './hostdeps.mjs'
import { createSkillProvider } from './skill-provider.mjs'

const PKG_DIR = dirname(fileURLToPath(import.meta.url))
const PKG = JSON.parse(readFileSync(join(PKG_DIR, 'package.json'), 'utf8'))
const DSH_HOME = process.env.DSH_HOME || join(homedir(), '.dsh')
const STORE = join(DSH_HOME, 'connector-chat-export')

export const name = PKG.name
export const inject = ['skills', 'tools']
const defineTool = (await loadHostDeps()).defineTool

let DatabaseSync = null
try { ({ DatabaseSync } = await import('node:sqlite')) } catch { /* 无 sqlite 则检索工具不注册 */ }

// ── 明文导出解析：txt/csv/json/jsonl/html 容错 ────────────────────────────────
function* iterMessages(file) {
  const ext = extname(file).toLowerCase()
  const raw = readFileSync(file, 'utf8')
  // Telegram Desktop 导出 result.json：{"messages":[{from,date,text|text_entities}]}
  if (ext === '.json' && /"messages"\s*:/.test(raw.slice(0, 2000))) {
    try {
      const j = JSON.parse(raw)
      for (const m of j.messages || []) {
        const text = typeof m.text === 'string' ? m.text
          : (Array.isArray(m.text) ? m.text.map(t => typeof t === 'string' ? t : t.text || '').join('') : '')
        if (text) yield { time: String(m.date || '').replace('T', ' ').slice(0, 19), sender: String(m.from || m.from_id || ''), text: text.slice(0, 2000) }
      }
    } catch { }
    return
  }
  // WhatsApp 导出 txt：[dd/mm/yyyy, hh:mm:ss] 名字: 内容 或 dd/mm/yyyy, hh:mm - 名字: 内容
  if (ext === '.txt' && /^\[?\d{1,4}[/.]\d{1,2}[/.]\d{1,4}[,，\s]/.test(raw.trimStart())) {
    for (const line of raw.split(/\r?\n/)) {
      const m = line.match(/^\[?(\d{1,4}[/.]\d{1,2}[/.]\d{1,4})[,，]?\s+(\d{1,2}:\d{2}(?::\d{2})?(?:\s?[AP]M)?)\]?\s*[-—]\s*([^:：]{1,40})[:：]\s*(.*)$/i)
        || line.match(/^\[(\d{1,4}[/.]\d{1,2}[/.]\d{1,4})[,，]\s*(\d{1,2}:\d{2}(?::\d{2})?(?:\s?[AP]M)?)\]\s*([^:：]{1,40})[:：]\s*(.*)$/i)
      if (m && m[4]) yield { time: `${m[1]} ${m[2]}`, sender: m[3].trim(), text: m[4].trim().slice(0, 2000) }
    }
    return
  }
  if (ext === '.json' || ext === '.jsonl') {
    for (const line of raw.split(/\r?\n/)) {
      const t = line.trim()
      if (!t) continue
      const objs = []
      if (t.startsWith('[') || t.startsWith('{')) { try { const j = JSON.parse(t); objs.push(...(Array.isArray(j) ? j : [j])) } catch { } }
      else { try { objs.push(JSON.parse(t)) } catch { } }
      for (const o of objs) {
        yield {
          time: String(o.time || o.timestamp || o.CreateTime || o.date || '').slice(0, 19),
          sender: String(o.sender || o.talker || o.nickname || o.StrNickName || o.from || ''),
          text: String(o.content || o.msg || o.StrContent || o.message || o.text || '').slice(0, 2000),
        }
      }
    }
    return
  }
  // txt/csv/html：逐行按「时间 发送者: 内容」或 CSV 列容错切
  const text = raw.replace(/<[^>]+>/g, ' ')
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^(\d{4}[-/]\d{1,2}[-/]\d{1,2}[ T]\d{1,2}:\d{2}(?::\d{2})?)[ ,，\t]+([^:：,，\t]{1,30})[:：,，\t]+(.*)$/)
    if (m) yield { time: m[1].replace(/\//g, '-'), sender: m[2].trim(), text: m[3].trim().slice(0, 2000) }
    else {
      const c = line.match(/^"?\s*([^,，]{1,30})\s*"?\s*[,，]\s*"?([^,，]{1,30})"?\s*[,，]\s*"?(.+?)"?\s*$/)
      if (c) yield { time: c[1], sender: c[2], text: c[3].replace(/^"|"$/g, '').slice(0, 2000) }
    }
  }
}

function openStore() {
  mkdirSync(STORE, { recursive: true })
  const db = new DatabaseSync(join(STORE, 'chat.db'))
  db.exec(`CREATE TABLE IF NOT EXISTS messages(
    source TEXT, file TEXT, time TEXT, sender TEXT, text TEXT)`)
  db.exec(`CREATE INDEX IF NOT EXISTS idx_text ON messages(text)`)
  db.exec(`CREATE INDEX IF NOT EXISTS idx_src ON messages(source,time)`)
  return db
}

export function apply(ctx) {
  ctx.tools.register(defineTool({
    name: 'chat_import',
    description:
      '把你自己用导出工具（WeChatMsg/留痕/PyWxDump/QQExporter）或官方导出' +
      '（Telegram Desktop 导出 result.json、WhatsApp 导出聊天 txt、钉钉/飞书导出的 csv/txt）' +
      '产出的明文聊天导出文件导入本地检索库。支持目录或单个 .txt/.csv/.json/.jsonl/.html。' +
      '只读你的导出文件，不碰原软件数据库，不解密。',
    parameters: {
      path: { type: 'string', required: true, description: '导出文件或目录的绝对路径' },
      source: { type: 'string', description: '来源标签，如 wechat/qq/telegram/qzone（用于区分检索）' },
    },
    output: { schema: { type: 'object', additionalProperties: false, properties: {
      imported: { type: 'integer' }, files: { type: 'integer' }, db: { type: 'string' } } },
      render: (_a, v) => [{ type: 'text', text: `导入 ${v.imported} 条消息（${v.files} 个文件）` }] },
    isConcurrencySafe: () => false,
    async execute(args) {
      if (!DatabaseSync) throw new Error('chat_import: 运行时缺 node:sqlite')
      const p = String(args.path || '').trim()
      if (!existsSync(p)) throw new Error(`chat_import: 路径不存在 ${p}`)
      const files = statSync(p).isDirectory()
        ? readdirSync(p).filter(f => /\.(txt|csv|json|jsonl|html|htm)$/i.test(f)).map(f => join(p, f))
        : [p]
      if (!files.length) throw new Error('chat_import: 目录里没有 .txt/.csv/.json/.jsonl/.html 导出文件')
      const source = String(args.source || 'chat')
      const db = openStore()
      const ins = db.prepare('INSERT INTO messages(source,file,time,sender,text) VALUES(?,?,?,?,?)')
      let imported = 0
      db.exec('BEGIN')
      try {
        for (const f of files) {
          for (const m of iterMessages(f)) {
            if (m.text) { ins.run(source, basename(f), m.time, m.sender, m.text); imported++ }
          }
        }
        db.exec('COMMIT')
      } finally { db.close() }
      return { imported, files: files.length, db: join(STORE, 'chat.db') }
    },
    presentCall: (a) => ({ card: 'generic', title: '导入聊天记录', kind: 'other', rawInput: a }),
  }))

  ctx.tools.register(defineTool({
    name: 'chat_search',
    description:
      '在已导入的聊天记录里按关键词检索。返回时间/发送者/内容片段。' +
      '先用 chat_import 导入过才有数据。',
    parameters: {
      q: { type: 'string', required: true, description: '检索关键词' },
      source: { type: 'string', description: '可选：限定来源标签' },
      limit: { type: 'integer', description: '最多多少条（默认 30）' },
    },
    output: { schema: { type: 'object', additionalProperties: false, properties: {
      hits: { type: 'array', items: { type: 'object', additionalProperties: true } }, count: { type: 'integer' } } },
      render: (_a, v) => [{ type: 'text', text: `${v.count} 条命中` }] },
    isConcurrencySafe: () => true,
    async execute(args) {
      const dbFile = join(STORE, 'chat.db')
      if (!existsSync(dbFile)) throw new Error('chat_search: 还没有导入过记录，先用 chat_import')
      const db = new DatabaseSync(dbFile, { readOnly: true })
      try {
        const q = `%${String(args.q || '')}%`
        const limit = Math.min(Number.isFinite(+args.limit) ? +args.limit : 30, 200)
        const rows = args.source
          ? db.prepare('SELECT source,time,sender,text FROM messages WHERE source=? AND text LIKE ? ORDER BY time DESC LIMIT ?').all(String(args.source), q, limit)
          : db.prepare('SELECT source,time,sender,text FROM messages WHERE text LIKE ? ORDER BY time DESC LIMIT ?').all(q, limit)
        return { count: rows.length, hits: rows }
      } finally { db.close() }
    },
    presentCall: (a) => ({ card: 'generic', title: '检索聊天记录', kind: 'other', rawInput: a }),
  }))

  ctx.effect(() => ctx.skills.registerProvider(() => createSkillProvider(ctx)))
}
