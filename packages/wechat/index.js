/**
 * mino-connector-wechat —— 微信本地语料连接器（特区深侧）。
 * wechat_dirs：定位 WeChat 进程 + 数据目录（3.x WeChat Files / 4.x xwechat_files）。
 * wechat_decrypt：封装解密导出引擎（wechat-dump-rs / PyWxDump 等单文件 exe，
 * 引擎路径在 ~/.dsh/connector-wechat.json 配 dumper，或 dumperUrl 按需下载）——
 * 引擎做内存取钥+SQLCipher 解密，产出明文 sqlite 后直接收进
 * connector-chat-export 的 chat.db（source=wechat-local），chat_search 可查。
 * 只读本机自己的数据；取钥靠引擎完成，本体不含密钥提取逻辑。
 */
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { existsSync, readFileSync, readdirSync, statSync, mkdirSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { homedir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { loadHostDeps } from './hostdeps.mjs'
import { createSkillProvider } from './skill-provider.mjs'

const execFileP = promisify(execFile)
const PKG_DIR = dirname(fileURLToPath(import.meta.url))
const PKG = JSON.parse(readFileSync(join(PKG_DIR, 'package.json'), 'utf8'))
const DSH_HOME = process.env.DSH_HOME || join(homedir(), '.dsh')
const STORE = join(DSH_HOME, 'connector-wechat')
const CFG_PATH = join(DSH_HOME, 'connector-wechat.json')
const CHAT_DB = join(DSH_HOME, 'connector-chat-export', 'chat.db')

export const name = PKG.name
export const inject = ['skills', 'tools']
const defineTool = (await loadHostDeps()).defineTool

const DOCS = join(homedir(), 'Documents')

function* findDataDirs() {
  // 4.x：Documents/xwechat_files/<wxid>/...  3.x：Documents/WeChat Files/<wxid>/...
  for (const base of [join(DOCS, 'xwechat_files'), join(DOCS, 'WeChat Files'),
    join(DOCS, 'wxid_'), join(process.env.USERPROFILE || '', 'AppData', 'Roaming', 'Tencent', 'xwechat_files')]) {
    if (!existsSync(base)) continue
    try {
      for (const e of readdirSync(base, { withFileTypes: true })) {
        if (!e.isDirectory()) continue
        const p = join(base, e.name)
        const hasDb = (d, depth) => {
          if (depth > 3) return false
          try {
            for (const x of readdirSync(d, { withFileTypes: true })) {
              if (x.isDirectory() && hasDb(join(d, x.name), depth + 1)) return true
              if (/(MSG|MicroMsg|message|chat)[^/]*\.db$/i.test(x.name)) return true
            }
          } catch { }
          return false
        }
        if (hasDb(p, 0)) yield { account: e.name, dir: p }
      }
    } catch { }
  }
}

async function running() {
  if (process.platform !== 'win32') return []
  try {
    const { stdout } = await execFileP('tasklist', ['/FO', 'CSV', '/NH'], { timeout: 15000, windowsHide: true })
    return stdout.split('\n').filter(l => /wechat|weixin|wechatapp/i.test(l)).map(l => l.split(',')[0].replace(/"/g, ''))
  } catch { return [] }
}

function cfg() { try { return JSON.parse(readFileSync(CFG_PATH, 'utf8')) } catch { return {} } }

export function apply(ctx) {
  ctx.tools.register(defineTool({
    name: 'wechat_dirs',
    description: '定位本机微信：数据目录（按账号）、进程是否在跑、库里有什么 .db。解密前置侦察。',
    parameters: {},
    output: { schema: { type: 'object', additionalProperties: false, properties: {
      accounts: { type: 'array', items: { type: 'object', additionalProperties: true } },
      running: { type: 'array', items: { type: 'string' } } } },
      render: (_a, v) => [{ type: 'text', text: `${v.accounts.length} 个账号数据目录；进程：${v.running.join('/') || '未运行'}` }] },
    isConcurrencySafe: () => true,
    async execute() {
      const accounts = [...findDataDirs()].map(a => {
        const dbs = []
        const walk = (d, depth) => {
          if (depth > 4 || dbs.length > 50) return
          try {
            for (const e of readdirSync(d, { withFileTypes: true })) {
              const p = join(d, e.name)
              if (e.isDirectory()) walk(p, depth + 1)
              else if (/\.db$/i.test(e.name)) dbs.push(p)
            }
          } catch { }
        }
        walk(a.dir, 0)
        return { ...a, dbCount: dbs.length, sample: dbs.slice(0, 5).map(x => x.split(/[\\/]/).pop()) }
      })
      return { accounts, running: await running() }
    },
    presentCall: (a) => ({ card: 'generic', title: '找微信数据', kind: 'other', rawInput: a }),
  }))

  ctx.tools.register(defineTool({
    name: 'wechat_decrypt',
    description:
      '解密导出微信本地库：调用配置的导出引擎（~/.dsh/connector-wechat.json 的 ' +
      'dumper=引擎exe路径 或 dumperUrl=下载地址；推荐 wechat-dump-rs/PyWxDump exe），' +
      '产出明文 sqlite 并把消息行收进聊天库（chat_search 可查）。微信需在运行且已登录。',
    parameters: {
      account: { type: 'string', description: '指定账号目录名（wxid_），默认全部' },
      out: { type: 'string', description: '解密输出目录（默认 ~/.dsh/connector-wechat/out）' },
      dumperArgs: { type: 'string', description: '引擎参数模板，占位 {dir} {out}（默认引擎自选）' },
    },
    output: { schema: { type: 'object', additionalProperties: false, properties: {
      decrypted: { type: 'integer' }, imported: { type: 'integer' }, out: { type: 'string' } } },
      render: (_a, v) => [{ type: 'text', text: `解密 ${v.decrypted} 库，入库消息 ${v.imported} 条` }] },
    isConcurrencySafe: () => false,
    async execute(args) {
      const c = cfg()
      let dumper = c.dumper
      // engine-assist 共享注册表兜底（engine_register wechat-dump 登记的也认）
      if (!dumper) {
        try {
          const reg = JSON.parse(readFileSync(join(homedir(), '.dsh', 'engines.json'), 'utf8'))['wechat-dump']
          if (reg && existsSync(reg)) dumper = reg
        } catch { }
        if (!dumper) {
          const edir = join(homedir(), '.dsh', 'engines', 'wechat-dump')
          if (existsSync(edir)) {
            for (const f of readdirSync(edir)) if (/\.exe$/i.test(f)) { dumper = join(edir, f); break }
          }
        }
      }
      if (!dumper && c.dumperUrl) {
        mkdirSync(STORE, { recursive: true })
        dumper = join(STORE, 'dumper.exe')
        if (!existsSync(dumper)) {
          const res = await fetch(c.dumperUrl, { signal: AbortSignal.timeout(180000), redirect: 'follow' })
          if (!res.ok) throw new Error(`引擎下载失败 HTTP ${res.status}`)
          writeFileSync(dumper, Buffer.from(await res.arrayBuffer()))
        }
      }
      if (!dumper || !existsSync(dumper)) throw new Error(
        `没配导出引擎：在 ${CFG_PATH} 填 {"dumper":"D:/路径/wechat-dump-rs.exe"} 或 {"dumperUrl":"https://.../exe"}。` +
        `本工具不自带取钥逻辑，靠这些开源引擎：wechat-dump-rs（单 exe）、PyWxDump（pip+exe）、WeChatMsg（GUI）。`)
      const procs = await running()
      if (!procs.length) throw new Error('微信没在运行——解密引擎要从进程内存取钥，先登录微信再跑')
      const out = args.out ? String(args.out) : join(STORE, 'out')
      mkdirSync(out, { recursive: true })
      const dirs = [...findDataDirs()].filter(d => !args.account || d.account.includes(String(args.account)))
      if (!dirs.length) throw new Error('没找到微信数据目录（先 wechat_dirs 侦察）')
      let decrypted = 0
      const dbs = []
      for (const d of dirs) {
        const argv = (args.dumperArgs || c.dumperArgs || '--all --data-dir {dir} --output {out}')
          .replace(/\{dir\}/g, d.dir).replace(/\{out\}/g, join(out, d.account)).split(/\s+/).filter(Boolean)
        try { await execFileP(dumper, argv, { timeout: 600000, windowsHide: true, maxBuffer: 4 * 1024 * 1024 }) }
        catch (e) { throw new Error(`引擎报错：${String(e?.stderr || e?.message).slice(-300)}`) }
        const odir = join(out, d.account)
        if (existsSync(odir)) {
          const walk = (p, depth) => {
            if (depth > 4) return
            for (const e of readdirSync(p, { withFileTypes: true })) {
              const fp = join(p, e.name)
              if (e.isDirectory()) walk(fp, depth + 1)
              else if (/\.(db|sqlite)$/i.test(e.name)) dbs.push(fp)
            }
          }
          walk(odir, 0)
        }
      }
      decrypted = dbs.length
      // 明文库 → chat.db（消息表容错：MSG/message/chat_*，列名 StrContent/content/text）
      let imported = 0
      const { DatabaseSync } = await import('node:sqlite')
      const chatDbDir = join(DSH_HOME, 'connector-chat-export')
      mkdirSync(chatDbDir, { recursive: true })
      const chatDb = new DatabaseSync(CHAT_DB)
      chatDb.exec('CREATE TABLE IF NOT EXISTS messages(source TEXT, file TEXT, time TEXT, sender TEXT, text TEXT)')
      const ins = chatDb.prepare('INSERT INTO messages(source,file,time,sender,text) VALUES(?,?,?,?,?)')
      chatDb.exec('BEGIN')
      try {
        for (const f of dbs) {
          let sdb
          try { sdb = new DatabaseSync(f, { readOnly: true }) } catch { continue }
          try {
            const tables = sdb.prepare("SELECT name FROM sqlite_master WHERE type='table' AND (name LIKE '%MSG%' OR name LIKE '%message%' OR name LIKE '%chat%')").all()
            for (const t of tables) {
              const cols = sdb.prepare(`PRAGMA table_info("${t.name}")`).all().map(c => c.name)
              const textCol = cols.find(c => /StrContent|content|text|msg/i.test(c))
              const timeCol = cols.find(c => /CreateTime|time|timestamp/i.test(c))
              const senderCol = cols.find(c => /StrTalker|talker|sender|from/i.test(c))
              if (!textCol) continue
              const rows = sdb.prepare(`SELECT ${timeCol || 'rowid'} t, ${senderCol || "''"} s, ${textCol} x FROM "${t.name}" LIMIT 500000`).all()
              for (const r of rows) {
                const txt = String(r.x || '').replace(/<[^>]+>/g, ' ').trim()
                if (!txt || txt.length < 2) continue
                const tm = /^\d{10}$/.test(String(r.t)) ? new Date(+r.t * 1000).toISOString().slice(0, 19).replace('T', ' ') : String(r.t || '').slice(0, 19)
                ins.run('wechat-local', f.split(/[\\/]/).pop(), tm, String(r.s || ''), txt.slice(0, 2000))
                imported++
              }
            }
          } finally { sdb.close() }
        }
        chatDb.exec('COMMIT')
      } finally { chatDb.close() }
      return { decrypted, imported, out }
    },
    presentCall: (a) => ({ card: 'generic', title: '解密微信', kind: 'other', rawInput: a }),
  }))

  ctx.effect(() => ctx.skills.registerProvider(() => createSkillProvider(ctx)))
}
