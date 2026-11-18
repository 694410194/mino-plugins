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
export const inject = ['skills', 'tools', 'credentials']
const defineTool = (await loadHostDeps()).defineTool

let DatabaseSync = null
try { ({ DatabaseSync } = await import('node:sqlite')) } catch { }

function openStore() {
  mkdirSync(STORE, { recursive: true })
  const db = new DatabaseSync(join(STORE, 'calendar.db'))
  db.exec(`CREATE TABLE IF NOT EXISTS events(dtstart TEXT, dtend TEXT, summary TEXT, location TEXT, source TEXT)`)
  db.exec(`CREATE INDEX IF NOT EXISTS idx_d ON events(dtstart)`)
  // 写链要按 uid 定位远端资源——存量库补列（缺列才 ALTER，幂等）。
  if (!db.prepare('PRAGMA table_info(events)').all().some(c => c.name === 'uid')) {
    db.exec('ALTER TABLE events ADD COLUMN uid TEXT')
  }
  db.exec(`CREATE UNIQUE INDEX IF NOT EXISTS idx_uid ON events(uid) WHERE uid IS NOT NULL`)
  // cal_sync 每次 REPORT 全量重拉——同一事件重复入库会让 cal_upcoming 越查越肥，
  // 同步前按四元组去重（同 dtstart+summary+dtend+source 视为同一事件）。
  db.exec(`DELETE FROM events WHERE rowid NOT IN (SELECT MIN(rowid) FROM events GROUP BY dtstart, dtend, summary, location, source)`)
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
      const c = await caldav()
      // 最小 PROPFIND：拉 calendar-data
      const auth = c.auth
      const res = await fetch(c.url, {
        method: 'REPORT',
        headers: { Authorization: auth, 'Content-Type': 'application/xml', Depth: '1' },
        body: `<?xml version="1.0"?><c:calendar-query xmlns:c="urn:ietf:params:xml:ns:caldav" xmlns:d="DAV:"><d:prop><d:getetag/><c:calendar-data/></d:prop><c:filter><c:comp-filter name="VCALENDAR"><c:comp-filter name="VEVENT"/></c:comp-filter></c:filter></c:calendar-query>`,
        signal: AbortSignal.timeout(30000),
      })
      if (!res.ok && res.status !== 207) throw new Error(`cal_sync: HTTP ${res.status}（检查 url/凭据，iCloud 要应用专用密码）`)
      const xml = await res.text()
      const db = openStore()
      const ins = db.prepare('INSERT INTO events(dtstart,dtend,summary,location,source) SELECT ?,?,?,?,? WHERE NOT EXISTS (SELECT 1 FROM events WHERE dtstart=? AND dtend=? AND summary=? AND location=? AND source=?)')
      let n = 0
      db.exec('BEGIN')
      try {
        for (const m of xml.matchAll(/<(?:\w+:)?calendar-data[^>]*>([\s\S]*?)<\/(?:\w+:)?calendar-data>/g)) {
          for (const e of parseIcs(m[1].replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&'))) {
            const r = ins.run(e.dtstart, e.dtend, e.summary, e.location, 'caldav', e.dtstart, e.dtend, e.summary, e.location, 'caldav')
            n += Number(r.changes)
          }
        }
        db.exec('COMMIT')
      } finally { db.close() }
      return { synced: n, note: n ? '' : '服务器没返回事件（账户可能是只读集合或 URL 不是日历集路径）' }
    },
    presentCall: (a) => ({ card: 'generic', title: '同步日历', kind: 'other', rawInput: a }),
  }))

  // pass 可指官方凭据库引用名（passRef，经 cred_set 入库）；文件明文 pass 为回退。
  const caldav = async () => {
    let c
    try { c = JSON.parse(readFileSync(CFG_PATH, 'utf8')).caldav } catch {}
    let pass = c?.pass
    const ref = String(c?.passRef || '')
    if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(ref)) {
      try { pass = (await ctx.get('credentials')?.resolve?.(ref))?.value || pass } catch { /* 凭据服务不可达回落文件值 */ }
    }
    if (!c?.url || !c?.user || !pass) throw new Error(`没配 CalDAV：凭据库 cred_set <passRef名>=<密码> + ${CFG_PATH.replace(/\//g, '\\')} 填 {"caldav":{"url":"...","user":"...","passRef":"MINO_CALDAV_PASS"}}（明文 pass 为回退）`)
    return { ...c, auth: 'Basic ' + Buffer.from(`${c.user}:${pass}`).toString('base64'), base: c.url.endsWith('/') ? c.url : c.url + '/' }
  }

  const toIcs = (s) => { // 'YYYY-MM-DD[ HH:MM]' 本地时刻 → ics 本地形式
    const m = String(s || '').match(/(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2}))?/)
    if (!m) throw new Error(`日期格式不对：${s}（要 YYYY-MM-DD 或 YYYY-MM-DD HH:MM）`)
    return `${m[1]}${m[2]}${m[3]}${m[4] ? 'T' + m[4] + m[5] + '00' : ''}`
  }

  ctx.tools.register(defineTool({
    name: 'cal_write',
    description: '在你的 CalDAV 日历写一条日程（有 uid 则覆盖更新，无则新建）并同步进本地库。写入前会请你确认。',
    parameters: {
      summary: { type: 'string', required: true, description: '标题' },
      dtstart: { type: 'string', required: true, description: '开始 YYYY-MM-DD 或 YYYY-MM-DD HH:MM（本地时间）' },
      dtend: { type: 'string', description: '结束，格式同 dtstart' },
      location: { type: 'string', description: '地点' },
      uid: { type: 'string', description: '更新已有事件时给它的 uid；不传=新建' },
    },
    output: { schema: { type: 'object', additionalProperties: false, properties: {
      uid: { type: 'string' }, written: { type: 'boolean' } } },
      render: (_a, v) => [{ type: 'text', text: v.written ? `日程已写入（uid ${v.uid}）` : '未写入' }] },
    isConcurrencySafe: () => false,
    async execute(args) {
      if (!DatabaseSync) throw new Error('cal_write: 运行时缺 node:sqlite')
      const c = await caldav()
      const uid = String(args.uid || `mino-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`)
      const dtend = args.dtend ? toIcs(args.dtend) : ''
      const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//mino//cal_write//CN', 'BEGIN:VEVENT',
        `UID:${uid}`, `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').replace(/\..+/, 'Z')}`,
        `DTSTART:${toIcs(args.dtstart)}`, ...(dtend ? [`DTEND:${dtend}`] : []),
        `SUMMARY:${String(args.summary).slice(0, 200)}`, ...(args.location ? [`LOCATION:${String(args.location).slice(0, 100)}`] : []),
        'END:VEVENT', 'END:VCALENDAR', ''].join('\r\n')
      const href = `${c.base}${encodeURIComponent(uid)}.ics`
      const res = await fetch(href, {
        method: 'PUT',
        headers: { Authorization: c.auth, 'Content-Type': 'text/calendar; charset=utf-8' },
        body: ics, signal: AbortSignal.timeout(30000),
      })
      if (!res.ok && res.status !== 201 && res.status !== 204) throw new Error(`cal_write: HTTP ${res.status}`)
      const fmt = (t) => String(t).replace(/(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})?)?/, (_m, y, mo, d, h, mi) => `${y}-${mo}-${d}${h ? ' ' + h + ':' + mi : ''}`)
      const db = openStore()
      try {
        db.prepare('DELETE FROM events WHERE uid=?').run(uid)
        db.prepare('INSERT INTO events(dtstart,dtend,summary,location,source,uid) VALUES(?,?,?,?,?,?)')
          .run(fmt(toIcs(args.dtstart)), dtend ? fmt(dtend) : '', String(args.summary).slice(0, 200), String(args.location || '').slice(0, 100), 'caldav', uid)
      } finally { db.close() }
      return { uid, written: true }
    },
    presentCall: (a) => ({ card: 'generic', title: `写日程「${a.summary}」`, kind: 'other', rawInput: a }),
  }))

  ctx.tools.register(defineTool({
    name: 'cal_delete',
    description: '按 uid 从你的 CalDAV 日历删除一条日程并清本地库。删除前会请你确认。',
    parameters: { uid: { type: 'string', required: true, description: 'cal_write 返回的 uid' } },
    output: { schema: { type: 'object', additionalProperties: false, properties: { deleted: { type: 'boolean' } } },
      render: (_a, v) => [{ type: 'text', text: v.deleted ? '日程已删除' : '未删除' }] },
    isConcurrencySafe: () => false,
    async execute(args) {
      const c = await caldav()
      const uid = String(args.uid)
      const res = await fetch(`${c.base}${encodeURIComponent(uid)}.ics`, {
        method: 'DELETE', headers: { Authorization: c.auth }, signal: AbortSignal.timeout(30000),
      })
      if (!res.ok && res.status !== 204 && res.status !== 404) throw new Error(`cal_delete: HTTP ${res.status}`)
      const db = openStore()
      try { db.prepare('DELETE FROM events WHERE uid=?').run(uid) } finally { db.close() }
      return { deleted: true }
    },
    presentCall: (a) => ({ card: 'generic', title: '删日程', kind: 'other', rawInput: a }),
  }))

  // 敏感写动作挂官方审批缝：pre-execute 瀑布返回 ask，由宿主 approval 服务向人确认；
  // 无审批答者（service 级调用/无 UI）按 fail-closed 拒绝。
  const SENSITIVE = new Set(['cal_write', 'cal_delete'])
  ctx.on('tools/pre-execute', async (exec, next) => {
    if (!SENSITIVE.has(exec.name)) return next()
    return {
      kind: 'ask',
      reason: `calendar connector sensitive action "${exec.name}"`,
      displayReason: {
        en: `Allow ${exec.name} (modify your calendar)?`,
        zh: `允许执行 ${exec.name === 'cal_write' ? '写入日程' : '删除日程'}（${exec.name}）？`,
      },
    }
  })

  ctx.effect(() => ctx.skills.registerProvider(() => createSkillProvider(ctx)))
}
