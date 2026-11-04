/**
 * mino-connector-vault —— 密码库连接器（域 21，手动导入形态）。
 * 读用户自己从 Bitwarden/KeePass/KeeWeb/浏览器 导出的明文 CSV
 * 入本地 sqlite 检索。敏感：导出文件含明文密码——本插件只读本地、
 * 数据不出本机；建议导入后删掉导出文件（skill 里写明）。
 * 默认查询只回 名称/用户名/网址，密码字段要 showSecret:true 才回。
 */
import { existsSync, readFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { homedir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { loadHostDeps } from './hostdeps.mjs'
import { createSkillProvider } from './skill-provider.mjs'

const PKG_DIR = dirname(fileURLToPath(import.meta.url))
const PKG = JSON.parse(readFileSync(join(PKG_DIR, 'package.json'), 'utf8'))
const STORE = join(process.env.DSH_HOME || join(homedir(), '.dsh'), 'connector-vault')

export const name = PKG.name
export const inject = ['skills', 'tools']
const defineTool = (await loadHostDeps()).defineTool

let DatabaseSync = null
try { ({ DatabaseSync } = await import('node:sqlite')) } catch { }

function openStore() {
  mkdirSync(STORE, { recursive: true })
  const db = new DatabaseSync(join(STORE, 'vault.db'))
  db.exec(`CREATE TABLE IF NOT EXISTS entries(name TEXT, username TEXT, url TEXT, notes TEXT, secret TEXT)`)
  return db
}

function parseCsv(text) {
  const rows = []
  let cur = '', row = [], inQ = false
  for (let i = 0; i <= text.length; i++) {
    const ch = text[i] ?? '\n'
    if (inQ) {
      if (ch === '"' && text[i + 1] === '"') { cur += '"'; i++; continue }
      if (ch === '"') { inQ = false; continue }
      cur += ch
      continue
    }
    if (ch === '"') { inQ = true; continue }
    if (ch === ',') { row.push(cur); cur = ''; continue }
    if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++
      if (cur !== '' || row.length) { row.push(cur); rows.push(row); row = []; cur = '' }
      continue
    }
    cur += ch
  }
  return rows
}

function mapRow(header, row) {
  const h = header.map(x => x.toLowerCase().trim().replace(/"/g, ''))
  const get = (...keys) => { for (const k of keys) { const i = h.findIndex(x => x.includes(k)); if (i >= 0 && row[i]) return row[i] } return '' }
  return {
    name: get('name', 'title', '网站') || get('url', 'login_uri', 'web').slice(0, 60),
    username: get('username', 'login_username', 'user', '账号'),
    url: get('url', 'login_uri', 'web', '网址'),
    notes: get('note', '备注').slice(0, 300),
    secret: get('password', 'login_password', '密码'),
  }
}

export function apply(ctx) {
  ctx.tools.register(defineTool({
    name: 'vault_import',
    description:
      '导入你自己从 Bitwarden/KeePass/浏览器导出的明文 CSV 密码文件进本地库。' +
      '数据不出本机；导入后建议删除原导出文件（里面有明文密码）。',
    parameters: { path: { type: 'string', required: true, description: 'CSV 导出文件路径' } },
    output: { schema: { type: 'object', additionalProperties: false, properties: {
      imported: { type: 'integer' }, warning: { type: 'string' } } },
      render: (_a, v) => [{ type: 'text', text: `导入 ${v.imported} 条。${v.warning}` }] },
    isConcurrencySafe: () => false,
    async execute(args) {
      if (!DatabaseSync) throw new Error('vault_import: 运行时缺 node:sqlite')
      const f = String(args.path || '').trim()
      if (!existsSync(f)) throw new Error(`vault_import: 文件不存在 ${f}`)
      const rows = parseCsv(readFileSync(f, 'utf8'))
      if (rows.length < 2) throw new Error('vault_import: CSV 里没有条目')
      const header = rows[0]
      const db = openStore()
      const ins = db.prepare('INSERT INTO entries(name,username,url,notes,secret) VALUES(?,?,?,?,?)')
      let n = 0
      db.exec('BEGIN')
      try {
        for (const row of rows.slice(1)) {
          const e = mapRow(header, row)
          if (e.name || e.username || e.url) { ins.run(e.name, e.username, e.url, e.notes, e.secret); n++ }
        }
        db.exec('COMMIT')
      } finally { db.close() }
      return { imported: n, warning: '提醒：源导出文件是明文密码，建议删掉它' }
    },
    presentCall: (a) => ({ card: 'generic', title: '导密码库', kind: 'other', rawInput: a }),
  }))

  ctx.tools.register(defineTool({
    name: 'vault_search',
    description:
      '查已导入的密码库条目：默认只回 名称/用户名/网址；要密码本身加 showSecret=true' +
      '（密码只在本机返回给你，不外发）。',
    parameters: {
      q: { type: 'string', required: true, description: '网站名/网址/用户名关键词' },
      showSecret: { type: 'boolean', description: 'true=返回密码字段（默认 false 不返回）' },
      limit: { type: 'integer', description: '最多多少条（默认 10）' },
    },
    output: { schema: { type: 'object', additionalProperties: false, properties: {
      hits: { type: 'array', items: { type: 'object', additionalProperties: true } }, count: { type: 'integer' } } },
      render: (_a, v) => [{ type: 'text', text: `${v.count} 条：` + v.hits.slice(0, 6).map(h => `${h.name || h.url}${h.username ? '（' + h.username + '）' : ''}`).join('；') }] },
    isConcurrencySafe: () => true,
    async execute(args) {
      const dbFile = join(STORE, 'vault.db')
      if (!existsSync(dbFile)) throw new Error('还没有导入过，先用 vault_import')
      const db = new DatabaseSync(dbFile, { readOnly: true })
      try {
        const q = `%${String(args.q || '')}%`
        const limit = Math.min(Number.isFinite(+args.limit) ? +args.limit : 10, 50)
        const cols = args.showSecret ? 'name,username,url,notes,secret' : 'name,username,url,notes'
        const rows = db.prepare(`SELECT ${cols} FROM entries WHERE name LIKE ? OR url LIKE ? OR username LIKE ? LIMIT ?`).all(q, q, q, limit)
        return { count: rows.length, hits: rows }
      } finally { db.close() }
    },
    presentCall: (a) => ({ card: 'generic', title: '查密码库', kind: 'other', rawInput: a }),
  }))

  ctx.effect(() => ctx.skills.registerProvider(() => createSkillProvider(ctx)))
}
