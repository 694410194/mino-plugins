/**
 * mino-connector-calendar —— 日历连接器（空白域：日历）。
 * cal_import：ICS 文件（各日历 App/邮箱导出的 .ics）入本地日程库。
 * cal_upcoming：看接下来 N 天的日程/纪念日。
 * CalDAV 同步为凭据门（~/.dsh/connector-cloud.json 的 caldav{url,user,pass}，
 * 仅拉取读事件，不回写）。
 */
import { existsSync, readFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { homedir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { loadHostDeps } from './hostdeps.mjs'
import { createSkillProvider } from './skill-provider.mjs'

const PKG_DIR = dirname(fileURLToPath(import.meta.url))
const PKG = JSON.parse(readFileSync(join(PKG_DIR, 'package.json'), 'utf8'))
const STORE = join(process.env.DSH_HOME || join(homedir(), '.dsh'), 'connector-calendar')
const CFG_PATH = join(process.env.DSH_HOME || join(homedir(), '.dsh'), 'connector-cloud.json')

export const name = PKG.name
export const inject = ['skills', 'tools']
const defineTool = (await loadHostDeps()).defineTool

let DatabaseSync = null
try { ({ DatabaseSync } = await import('node:sqlite')) } catch { }

function openStore() {
  mkdirSync(STORE, { recursive: true })
  const db = new DatabaseSync(join(STORE, 'calendar.db'))
  db.exec(`CREATE TABLE IF NOT EXISTS events(dtstart TEXT, dtend TEXT, summary TEXT, location TEXT, source TEXT)`)
  db.exec(`CREATE INDEX IF NOT EXISTS idx_d ON events(dtstart)`)
  return db
}

function* parseIcs(text) {
  const unfolded = text.replace(/\r?\n[ \t]/g, '')
  for (const block of unfolded.split('BEGIN:VEVENT').slice(1)) {
    const g = (k) => block.match(new RegExp(`^${k}[^:\\n]*:(.*)$`, 'm'))?.[1]?.trim()
    const fmt = (s) => {
      if (!s) return ''
      const m = s.match(/(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2}))?/)
      return m ? `${m[1]}-${m[2]}-${m[3]}${m[4] ? ' ' + m[4] + ':' + m[5] : ''}` : s
    }
    const summary = g('SUMMARY')
    if (!summary) continue
    yield { dtstart: fmt(g('DTSTART')), dtend: fmt(g('DTEND')), summary: summary.slice(0, 200), location: (g('LOCATION') || '').slice(0, 100) }
  }
}

export function apply(ctx) {
  ctx.tools.register(defineTool({
    name: 'cal_import',
    description: '导入日历 .ics 文件（各日历 App/邮箱导出的日程文件）进本地日程库。',
    parameters: { path: { type: 'string', required: true, description: '.ics 文件路径' } },
    output: { schema: { type: 'object', additionalProperties: false, properties: { imported: { type: 'integer' } } },
      render: (_a, v) => [{ type: 'text', text: `导入 ${v.imported} 条日程` }] },
    isConcurrencySafe: () => false,
    async execute(args) {
      if (!DatabaseSync) throw new Error('cal_import: 运行时缺 node:sqlite')
      const f = String(args.path || '').trim()
      if (!existsSync(f)) throw new Error(`cal_import: 文件不存在 ${f}`)
      const raw = readFileSync(f, 'utf8')
      if (!/BEGIN:VCALENDAR|BEGIN:VEVENT/.test(raw)) throw new Error('cal_import: 不是 ICS 格式')
      const db = openStore()
      const ins = db.prepare('INSERT INTO events(dtstart,dtend,summary,location,source) VALUES(?,?,?,?,?)')
      let n = 0
      db.exec('BEGIN')
      try {
        for (const e of parseIcs(raw)) { ins.run(e.dtstart, e.dtend, e.summary, e.location, 'ics'); n++ }
        db.exec('COMMIT')
      } finally { db.close() }
      if (!n) throw new Error('cal_import: ICS 里没找到日程')
      return { imported: n }
    },
    presentCall: (a) => ({ card: 'generic', title: '导日历', kind: 'other', rawInput: a }),
  }))

  ctx.tools.register(defineTool({
    name: 'cal_upcoming',
    description: '看接下来 N 天的日程（含今天）。也可搜关键词。',
    parameters: {
      days: { type: 'integer', description: '往后看几天（默认 14）' },
      q: { type: 'string', description: '可选：按关键词搜' },
    },
    output: { schema: { type: 'object', additionalProperties: false, properties: {
      events: { type: 'array', items: { type: 'object', additionalProperties: true } }, count: { type: 'integer' } } },
      render: (_a, v) => [{ type: 'text', text: `${v.count} 条：` + v.events.slice(0, 10).map(e => `${e.dtstart} ${e.summary}`).join('；') }] },
    isConcurrencySafe: () => true,
    async execute(args) {
      const dbFile = join(STORE, 'calendar.db')
      if (!existsSync(dbFile)) return { count: 0, events: [] }
      const db = new DatabaseSync(dbFile, { readOnly: true })
      try {
        let rows
        if (args.q) {
          rows = db.prepare('SELECT dtstart,dtend,summary,location FROM events WHERE summary LIKE ? OR location LIKE ? ORDER BY dtstart LIMIT 50').all(`%${args.q}%`, `%${args.q}%`)
        } else {
          const days = Number.isFinite(+args.days) ? +args.days : 14
          const until = new Date(Date.now() + days * 864e5).toISOString().slice(0, 10)
          const today = new Date().toISOString().slice(0, 10)
          rows = db.prepare('SELECT dtstart,dtend,summary,location FROM events WHERE dtstart>=? AND dtstart<=? ORDER BY dtstart LIMIT 100').all(today, until)
        }
        return { count: rows.length, events: rows }
      } finally { db.close() }
    },
    presentCall: (a) => ({ card: 'generic', title: '看日程', kind: 'other', rawInput: a }),
  }))

  ctx.tools.register(defineTool({
    name: 'cal_sync',
    description: '从 CalDAV 服务器拉日程（只读）。凭据填 ~/.dsh/connector-cloud.json 的 ' +
      'caldav{"url","user","pass"}（如 iCloud 应用专用密码/Nextcloud）。',
    parameters: {},
    output: { schema: { type: 'object', additionalProperties: false, properties: {
      synced: { type: 'integer' }, note: { type: 'string' } } },
      render: (_a, v) => [{ type: 'text', text: `同步 ${v.synced} 条日程` }] },
    isConcurrencySafe: () => false,
    async execute() {
      let c
      try { c = JSON.parse(readFileSync(CFG_PATH, 'utf8')).caldav } catch {}
      if (!c?.url || !c?.user || !c?.pass) throw new Error(`没配 CalDAV：在 ${CFG_PATH.replace(/\//g, '\\')} 填 {"caldav":{"url":"...","user":"...","pass":"..."}}`)
      // 最小 PROPFIND：拉 calendar-data
      const auth = 'Basic ' + Buffer.from(`${c.user}:${c.pass}`).toString('base64')
      const res = await fetch(c.url, {
        method: 'REPORT',
        headers: { Authorization: auth, 'Content-Type': 'application/xml', Depth: '1' },
        body: `<?xml version="1.0"?><c:calendar-query xmlns:c="urn:ietf:params:xml:ns:caldav" xmlns:d="DAV:"><d:prop><d:getetag/><c:calendar-data/></d:prop><c:filter><c:comp-filter name="VCALENDAR"><c:comp-filter name="VEVENT"/></c:comp-filter></c:filter></c:calendar-query>`,
        signal: AbortSignal.timeout(30000),
      })
      if (!res.ok && res.status !== 207) throw new Error(`cal_sync: HTTP ${res.status}（检查 url/凭据，iCloud 要应用专用密码）`)
      const xml = await res.text()
      const db = openStore()
      const ins = db.prepare('INSERT INTO events(dtstart,dtend,summary,location,source) VALUES(?,?,?,?,?)')
      let n = 0
      db.exec('BEGIN')
      try {
        for (const m of xml.matchAll(/<(?:\w+:)?calendar-data[^>]*>([\s\S]*?)<\/(?:\w+:)?calendar-data>/g)) {
          for (const e of parseIcs(m[1].replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&'))) {
            ins.run(e.dtstart, e.dtend, e.summary, e.location, 'caldav'); n++
          }
        }
        db.exec('COMMIT')
      } finally { db.close() }
      return { synced: n, note: n ? '' : '服务器没返回事件（账户可能是只读集合或 URL 不是日历集路径）' }
    },
    presentCall: (a) => ({ card: 'generic', title: '同步日历', kind: 'other', rawInput: a }),
  }))

  ctx.effect(() => ctx.skills.registerProvider(() => createSkillProvider(ctx)))
}
