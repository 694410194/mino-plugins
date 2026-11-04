/**
 * mino-connector-contacts —— 通讯录连接器（空白域：通讯录/通话/短信）。
 * 手动导入形态：vcf 名片、CSV 联系人、SMS Backup & Restore 的
 * sms.xml/calls.xml 导出文件 → 本地 sqlite 检索。只读导出文件。
 */
import { existsSync, readFileSync, mkdirSync, statSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { homedir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { loadHostDeps } from './hostdeps.mjs'
import { createSkillProvider } from './skill-provider.mjs'

const PKG_DIR = dirname(fileURLToPath(import.meta.url))
const PKG = JSON.parse(readFileSync(join(PKG_DIR, 'package.json'), 'utf8'))
const STORE = join(process.env.DSH_HOME || join(homedir(), '.dsh'), 'connector-contacts')

export const name = PKG.name
export const inject = ['skills', 'tools']
const defineTool = (await loadHostDeps()).defineTool

let DatabaseSync = null
try { ({ DatabaseSync } = await import('node:sqlite')) } catch { }

function openStore() {
  mkdirSync(STORE, { recursive: true })
  const db = new DatabaseSync(join(STORE, 'contacts.db'))
  db.exec(`CREATE TABLE IF NOT EXISTS contacts(name TEXT, phone TEXT, email TEXT, org TEXT)`)
  db.exec(`CREATE TABLE IF NOT EXISTS messages(kind TEXT, who TEXT, number TEXT, time TEXT, text TEXT)`)
  db.exec(`CREATE INDEX IF NOT EXISTS idx_n ON contacts(name)`)
  return db
}

function* parseVcf(text) {
  for (const card of text.split(/BEGIN:VCARD/i).slice(1)) {
    const name = card.match(/^FN[^:]*:(.+)$/m)?.[1]?.trim() || card.match(/^N[^:]*:([^\n;]+)/m)?.[1]?.trim() || ''
    const phones = [...card.matchAll(/TEL[^:]*:([+0-9][0-9\s-]{5,20})/g)].map(m => m[1].replace(/\s/g, ''))
    const email = card.match(/EMAIL[^:]*:([^\s]+)/)?.[1]
    const org = card.match(/ORG[^:]*:([^\n;]+)/)?.[1]?.trim()
    if (name || phones.length) yield { name, phone: phones.join('/'), email: email || '', org: org || '' }
  }
}

function* parseSmsXml(xml) {
  for (const m of xml.matchAll(/<sms [^>]*>/g)) {
    const tag = m[0]
    const g = (k) => tag.match(new RegExp(`${k}="([^"]*)"`))?.[1]
    const t = +g('date') || 0
    yield { kind: 'sms', who: g('contact_name') || '', number: g('address') || '',
      time: t ? new Date(t).toISOString().slice(0, 19).replace('T', ' ') : '', text: (g('body') || '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').slice(0, 500) }
  }
}

function* parseCallsXml(xml) {
  for (const m of xml.matchAll(/<call [^>]*>/g)) {
    const tag = m[0]
    const g = (k) => tag.match(new RegExp(`${k}="([^"]*)"`))?.[1]
    const t = +g('date') || 0
    const type = { 1: '来电', 2: '去电', 3: '未接', 5: '拒接' }[g('type')] || '通话'
    yield { kind: 'call', who: g('contact_name') || '', number: g('number') || '',
      time: t ? new Date(t).toISOString().slice(0, 19).replace('T', ' ') : '', text: `${type} ${g('duration') || 0}秒` }
  }
}

export function apply(ctx) {
  ctx.tools.register(defineTool({
    name: 'contacts_import',
    description:
      '导入通讯录/短信/通话导出文件：.vcf 名片、.csv 联系人表、' +
      'SMS Backup & Restore 的 sms.xml/calls.xml。自动识别格式。',
    parameters: { path: { type: 'string', required: true, description: '导出文件路径' } },
    output: { schema: { type: 'object', additionalProperties: false, properties: {
      contacts: { type: 'integer' }, messages: { type: 'integer' } } },
      render: (_a, v) => [{ type: 'text', text: `导入联系人 ${v.contacts}、消息/通话 ${v.messages}` }] },
    isConcurrencySafe: () => false,
    async execute(args) {
      if (!DatabaseSync) throw new Error('contacts_import: 运行时缺 node:sqlite')
      const f = String(args.path || '').trim()
      if (!existsSync(f)) throw new Error(`contacts_import: 文件不存在 ${f}`)
      const raw = readFileSync(f, 'utf8')
      const db = openStore()
      let nc = 0, nm = 0
      db.exec('BEGIN')
      try {
        if (/BEGIN:VCARD/i.test(raw)) {
          const ins = db.prepare('INSERT INTO contacts(name,phone,email,org) VALUES(?,?,?,?)')
          for (const c of parseVcf(raw)) { ins.run(c.name, c.phone, c.email, c.org); nc++ }
        } else if (/<sms[s]?\s|<calls\s/.test(raw)) {
          const ins = db.prepare('INSERT INTO messages(kind,who,number,time,text) VALUES(?,?,?,?,?)')
          for (const m of parseSmsXml(raw)) { ins.run(m.kind, m.who, m.number, m.time, m.text); nm++ }
          for (const m of parseCallsXml(raw)) { ins.run(m.kind, m.who, m.number, m.time, m.text); nm++ }
        } else {
          // CSV: name,phone 列容错
          const ins = db.prepare('INSERT INTO contacts(name,phone,email,org) VALUES(?,?,?,?)')
          for (const line of raw.split(/\r?\n/)) {
            const c = line.split(/[,，\t]/)
            const phone = c.find(x => /^[+0-9][0-9 -]{6,}$/.test(x.trim()))
            const name = c.find(x => /[一-龥A-Za-z]/.test(x) && !/电话|phone|name|姓名/i.test(x))
            if (name && phone) { ins.run(name.trim().replace(/"/g, ''), phone.trim(), c[2]?.trim() || '', c[3]?.trim() || ''); nc++ }
          }
        }
        db.exec('COMMIT')
      } finally { db.close() }
      if (!nc && !nm) throw new Error('contacts_import: 没解析出内容（支持 vcf/联系人csv/sms.xml/calls.xml）')
      return { contacts: nc, messages: nm }
    },
    presentCall: (a) => ({ card: 'generic', title: '导通讯录', kind: 'other', rawInput: a }),
  }))

  ctx.tools.register(defineTool({
    name: 'contacts_search',
    description: '查通讯录/短信/通话：按名字、号码、内容关键词检索。',
    parameters: {
      q: { type: 'string', required: true, description: '名字/号码/短信内容关键词' },
      kind: { type: 'string', description: 'contact/sms/call/all（默认 all）' },
      limit: { type: 'integer', description: '最多多少条（默认 20）' },
    },
    output: { schema: { type: 'object', additionalProperties: false, properties: {
      contacts: { type: 'array', items: { type: 'object', additionalProperties: true } },
      messages: { type: 'array', items: { type: 'object', additionalProperties: true } } } },
      render: (_a, v) => [{ type: 'text', text:
        `联系人 ${v.contacts.length} 条` + (v.contacts[0] ? `（${v.contacts.slice(0,3).map(c=>c.name||c.phone).join('、')}）` : '') +
        `；消息通话 ${v.messages.length} 条` }] },
    isConcurrencySafe: () => true,
    async execute(args) {
      const dbFile = join(STORE, 'contacts.db')
      if (!existsSync(dbFile)) return { contacts: [], messages: [] }
      const db = new DatabaseSync(dbFile, { readOnly: true })
      try {
        const q = `%${String(args.q || '')}%`
        const limit = Math.min(Number.isFinite(+args.limit) ? +args.limit : 20, 100)
        const kind = String(args.kind || 'all')
        const contacts = kind === 'sms' || kind === 'call' ? [] :
          db.prepare('SELECT name,phone,email,org FROM contacts WHERE name LIKE ? OR phone LIKE ? LIMIT ?').all(q, q, limit)
        const messages = kind === 'contact' ? [] :
          db.prepare(`SELECT kind,who,number,time,text FROM messages WHERE (who LIKE ? OR number LIKE ? OR text LIKE ?)${kind !== 'all' ? ' AND kind=?' : ''} ORDER BY time DESC LIMIT ?`)
            .all(...(kind !== 'all' ? [q, q, q, kind, limit] : [q, q, q, limit]))
        return { contacts, messages }
      } finally { db.close() }
    },
    presentCall: (a) => ({ card: 'generic', title: '查通讯录', kind: 'other', rawInput: a }),
  }))

  ctx.effect(() => ctx.skills.registerProvider(() => createSkillProvider(ctx)))
}
