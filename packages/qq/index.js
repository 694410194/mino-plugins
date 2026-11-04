/**
 * mino-connector-qq —— QQ本地语料连接器（特区深侧）。
 * qq_dirs：定位 NTQQ 数据目录（nt_db）+ 进程。qq_decrypt：封装导出引擎
 * （connector-qq.json 的 exporter/exporterArgs，如 QQChatExporter CLI 类）
 * 产出明文后收进 chat.db（source=qq-local）。取钥解密靠引擎，本体不含。
 */
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { existsSync, readFileSync, readdirSync, mkdirSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { homedir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { loadHostDeps } from './hostdeps.mjs'
import { createSkillProvider } from './skill-provider.mjs'

const execFileP = promisify(execFile)
const PKG_DIR = dirname(fileURLToPath(import.meta.url))
const PKG = JSON.parse(readFileSync(join(PKG_DIR, 'package.json'), 'utf8'))
const DSH_HOME = process.env.DSH_HOME || join(homedir(), '.dsh')
const STORE = join(DSH_HOME, 'connector-qq')
const CFG_PATH = join(DSH_HOME, 'connector-qq.json')
const CHAT_DB = join(DSH_HOME, 'connector-chat-export', 'chat.db')
const DOCS = join(homedir(), 'Documents')

export const name = PKG.name
export const inject = ['skills', 'tools']
const defineTool = (await loadHostDeps()).defineTool

function* findDataDirs() {
  for (const base of [join(DOCS, 'Tencent Files'), join(process.env.APPDATA || '', 'Tencent Files'),
    join(process.env.APPDATA || '', 'QQ')]) {
    if (!existsSync(base)) continue
    try {
      for (const e of readdirSync(base, { withFileTypes: true })) {
        if (!e.isDirectory()) continue
        const nt = join(base, e.name, 'nt_db')
        if (existsSync(nt)) yield { account: e.name, dir: nt }
        else if (/\d{5,}/.test(e.name)) yield { account: e.name, dir: join(base, e.name) }
      }
    } catch { }
  }
}

async function running() {
  if (process.platform !== 'win32') return []
  try {
    const { stdout } = await execFileP('tasklist', ['/FO', 'CSV', '/NH'], { timeout: 15000, windowsHide: true })
    return stdout.split('\n').filter(l => /QQ\.exe|QQNT|ntqq/i.test(l)).map(l => l.split(',')[0].replace(/"/g, ''))
  } catch { return [] }
}
function cfg() { try { return JSON.parse(readFileSync(CFG_PATH, 'utf8')) } catch { return {} } }

export function apply(ctx) {
  ctx.tools.register(defineTool({
    name: 'qq_dirs',
    description: '定位本机 QQ：NTQQ nt_db 数据目录（按QQ号）、进程状态。解密前置侦察。',
    parameters: {},
    output: { schema: { type: 'object', additionalProperties: false, properties: {
      accounts: { type: 'array', items: { type: 'object', additionalProperties: true } },
      running: { type: 'array', items: { type: 'string' } } } },
      render: (_a, v) => [{ type: 'text', text: `${v.accounts.length} 个 QQ 数据目录；进程：${v.running.join('/') || '未运行'}` }] },
    isConcurrencySafe: () => true,
    async execute() {
      const accounts = [...findDataDirs()].map(a => {
        let dbCount = 0
        const walk = (d, depth) => {
          if (depth > 3) return
          try { for (const e of readdirSync(d, { withFileTypes: true })) {
            if (e.isDirectory()) walk(join(d, e.name), depth + 1)
            else if (/\.db$/i.test(e.name)) dbCount++
          } } catch { }
        }
        walk(a.dir, 0)
        return { ...a, dbCount }
      })
      return { accounts, running: await running() }
    },
    presentCall: (a) => ({ card: 'generic', title: '找QQ数据', kind: 'other', rawInput: a }),
  }))

  ctx.tools.register(defineTool({
    name: 'qq_decrypt',
    description:
      '解密导出 QQ 本地库：调配置的导出引擎（~/.dsh/connector-qq.json 的 ' +
      'exporter=引擎路径/exporterArgs=参数模板{dir}{out} 或 exporterUrl 下载）——' +
      '产出明文文件后收进聊天库。QQ 需运行已登录。',
    parameters: {
      account: { type: 'string', description: '指定 QQ 号，默认全部' },
      out: { type: 'string', description: '输出目录（默认 ~/.dsh/connector-qq/out）' },
    },
    output: { schema: { type: 'object', additionalProperties: false, properties: {
      decrypted: { type: 'integer' }, imported: { type: 'integer' }, out: { type: 'string' } } },
      render: (_a, v) => [{ type: 'text', text: `产出 ${v.decrypted} 个文件，入库 ${v.imported} 条` }] },
    isConcurrencySafe: () => false,
    async execute(args) {
      const c = cfg()
      let exporter = c.exporter
      // engine-assist 共享注册表兜底（engine_register qq-exporter 登记的也认）
      if (!exporter) {
        try {
          const reg = JSON.parse(readFileSync(join(homedir(), '.dsh', 'engines.json'), 'utf8'))['qq-exporter']
          if (reg && existsSync(reg)) exporter = reg
        } catch { }
        if (!exporter) {
          const edir = join(homedir(), '.dsh', 'engines', 'qq-exporter')
          if (existsSync(edir)) {
            for (const f of readdirSync(edir)) if (/\.exe$/i.test(f)) { exporter = join(edir, f); break }
          }
        }
      }
      if (!exporter && c.exporterUrl) {
        mkdirSync(STORE, { recursive: true })
        exporter = join(STORE, 'exporter.exe')
        if (!existsSync(exporter)) {
          const res = await fetch(c.exporterUrl, { signal: AbortSignal.timeout(180000), redirect: 'follow' })
          if (!res.ok) throw new Error(`引擎下载失败 HTTP ${res.status}`)
          writeFileSync(exporter, Buffer.from(await res.arrayBuffer()))
        }
      }
      if (!exporter || !existsSync(exporter)) throw new Error(
        `没配导出引擎：在 ${CFG_PATH} 填 {"exporter":"D:/路径/导出工具.exe","exporterArgs":"{dir} {out}"}。` +
        `备选：QQExporter（NSIS GUI，导完把明文 txt/csv/json 喂 chat_import 也行）。`)
      const procs = await running()
      if (!procs.length) throw new Error('QQ 没在运行——取钥要在登录态')
      const out = args.out ? String(args.out) : join(STORE, 'out')
      mkdirSync(out, { recursive: true })
      const dirs = [...findDataDirs()].filter(d => !args.account || d.account.includes(String(args.account)))
      if (!dirs.length) throw new Error('没找到 QQ 数据目录（先 qq_dirs 侦察）')
      let files = 0
      for (const d of dirs) {
        const argv = (c.exporterArgs || '{dir} {out}').replace(/\{dir\}/g, d.dir).replace(/\{out\}/g, join(out, d.account)).split(/\s+/).filter(Boolean)
        try { await execFileP(exporter, argv, { timeout: 900000, windowsHide: true, maxBuffer: 4 * 1024 * 1024 }) }
        catch (e) { throw new Error(`引擎报错：${String(e?.stderr || e?.message).slice(-300)}`) }
      }
      // 扫产出：明文导出文件直接走 chat-export 的 iterMessages 同形态收编（txt/csv/json/jsonl/html）
      const { DatabaseSync } = await import('node:sqlite')
      mkdirSync(join(DSH_HOME, 'connector-chat-export'), { recursive: true })
      const chatDb = new DatabaseSync(CHAT_DB)
      chatDb.exec('CREATE TABLE IF NOT EXISTS messages(source TEXT, file TEXT, time TEXT, sender TEXT, text TEXT)')
      const ins = chatDb.prepare('INSERT INTO messages(source,file,time,sender,text) VALUES(?,?,?,?,?)')
      let imported = 0
      chatDb.exec('BEGIN')
      try {
        const walk = (p, depth) => {
          if (depth > 4) return
          for (const e of readdirSync(p, { withFileTypes: true })) {
            const fp = join(p, e.name)
            if (e.isDirectory()) { walk(fp, depth + 1); continue }
            if (!/\.(txt|csv|json|jsonl|html)$/i.test(e.name)) continue
            files++
            for (const line of readFileSync(fp, 'utf8').split(/\r?\n/)) {
              const m = line.match(/^(\d{4}[-/]\d{1,2}[-/]\d{1,2}[ T]\d{1,2}:\d{2}(?::\d{2})?)[ ,，\t]+([^:：,，\t]{1,30})[:：,，\t]+(.*)$/)
              if (m && m[3].trim()) { ins.run('qq-local', e.name, m[1].replace(/\//g, '-'), m[2].trim(), m[3].trim().slice(0, 2000)); imported++ }
            }
          }
        }
        walk(out, 0)
        chatDb.exec('COMMIT')
      } finally { chatDb.close() }
      return { decrypted: files, imported, out }
    },
    presentCall: (a) => ({ card: 'generic', title: '解密QQ', kind: 'other', rawInput: a }),
  }))

  ctx.effect(() => ctx.skills.registerProvider(() => createSkillProvider(ctx)))
}
