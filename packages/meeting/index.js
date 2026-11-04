/**
 * mino-connector-meeting —— 会议连接器（目录外域：腾讯会议，对标 PDH）。
 * 腾讯会议/飞书妙记 导出的纪要 TXT、字幕 VTT/SRT 入本地库全文检索：
 * 按会议/时间/发言人查说过什么。手动导入形态。
 */
import { existsSync, readFileSync, mkdirSync } from 'node:fs'
import { join, dirname, basename } from 'node:path'
import { homedir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { loadHostDeps } from './hostdeps.mjs'
import { createSkillProvider } from './skill-provider.mjs'

const PKG_DIR = dirname(fileURLToPath(import.meta.url))
const PKG = JSON.parse(readFileSync(join(PKG_DIR, 'package.json'), 'utf8'))
const STORE = join(process.env.DSH_HOME || join(homedir(), '.dsh'), 'connector-meeting')

export const name = PKG.name
export const inject = ['skills', 'tools']
const defineTool = (await loadHostDeps()).defineTool

function parseVtt(text) {
  const out = []
  for (const block of text.split(/\r?\n\r?\n/)) {
    const lines = block.trim().split(/\r?\n/)
    const tline = lines.find(l => l.includes('-->'))
    if (!tline) continue
    const start = tline.split('-->')[0].trim().slice(0, 8)
    const txt = lines.slice(lines.indexOf(tline) + 1).join(' ').replace(/<[^>]+>/g, '').trim()
    if (txt) out.push({ t: start, txt })
  }
  return out
}

export function apply(ctx) {
  ctx.tools.register(defineTool({
    name: 'meeting_import',
    description: '导入会议记录：腾讯会议/妙记导出的纪要 .txt 或字幕 .vtt/.srt，切分成发言条入库可检索。',
    parameters: {
      path: { type: 'string', required: true, description: '导出文件路径' },
      title: { type: 'string', description: '会议名（默认取文件名）' },
      date: { type: 'string', description: '会议日期 YYYY-MM-DD' },
    },
    output: { schema: { type: 'object', additionalProperties: false, properties: { segments: { type: 'integer' }, title: { type: 'string' } } },
      render: (_a, v) => [{ type: 'text', text: `《${v.title}》入库 ${v.segments} 条发言` }] },
    isConcurrencySafe: () => false,
    async execute(args) {
      const { DatabaseSync } = await import('node:sqlite').catch(() => ({}))
      if (!DatabaseSync) throw new Error('meeting_import: 运行时缺 node:sqlite')
      const f = String(args.path || '').trim()
      if (!existsSync(f)) throw new Error(`meeting_import: 文件不存在 ${f}`)
      const raw = readFileSync(f, 'utf8')
      const title = String(args.title || basename(f).replace(/\.(vtt|srt|txt|md)$/i, ''))
      let segs
      if (/-->/.test(raw)) segs = parseVtt(raw)
      else segs = raw.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 5)
        .map(l => ({ t: l.match(/^\[?(\d{1,2}:\d{2}(?::\d{2})?)\]?/)?.[1] || '', txt: l }))
      if (!segs.length) throw new Error('meeting_import: 没切出发言（支持 vtt/srt/txt）')
      mkdirSync(STORE, { recursive: true })
      const db = new DatabaseSync(join(STORE, 'meeting.db'))
      db.exec('CREATE TABLE IF NOT EXISTS segs(meeting TEXT,date TEXT,t TEXT,speaker TEXT,txt TEXT)')
      const ins = db.prepare('INSERT INTO segs(meeting,date,t,speaker,txt) VALUES(?,?,?,?,?)')
      const date = String(args.date || '')
      db.exec('BEGIN')
      try {
        for (const s of segs.slice(0, 20000)) {
          const sp = s.txt.match(/^([一-龥A-Za-z]{2,10})[:：]\s*/)?.[1] || ''
          ins.run(title, date, s.t, sp, s.txt.replace(/^[一-龥A-Za-z]{2,10}[:：]\s*/, '').slice(0, 500))
        }
        db.exec('COMMIT')
      } finally { db.close() }
      return { segments: segs.length, title }
    },
    presentCall: (a) => ({ card: 'generic', title: '导会议', kind: 'other', rawInput: a }),
  }))

  ctx.tools.register(defineTool({
    name: 'meeting_search',
    description: '查会议记录：按关键词查哪次会议上谁说过什么。',
    parameters: {
      q: { type: 'string', required: true, description: '关键词' },
      meeting: { type: 'string', description: '限定会议名' },
      limit: { type: 'integer', description: '最多多少条（默认 20）' },
    },
    output: { schema: { type: 'object', additionalProperties: false, properties: {
      hits: { type: 'array', items: { type: 'object', additionalProperties: true } }, count: { type: 'integer' } } },
      render: (_a, v) => [{ type: 'text', text: `${v.count} 条：` + v.hits.slice(0, 8).map(h => `《${h.meeting}》${h.speaker ? h.speaker + ':' : ''}${h.txt.slice(0, 30)}`).join('；') }] },
    isConcurrencySafe: () => true,
    async execute(args) {
      const dbFile = join(STORE, 'meeting.db')
      if (!existsSync(dbFile)) throw new Error('还没导入过会议，先用 meeting_import')
      const { DatabaseSync } = await import('node:sqlite')
      const db = new DatabaseSync(dbFile, { readOnly: true })
      try {
        const conds = ['txt LIKE ?'], vals = [`%${args.q}%`]
        if (args.meeting) { conds.push('meeting LIKE ?'); vals.push(`%${args.meeting}%`) }
        const limit = Math.min(Number.isFinite(+args.limit) ? +args.limit : 20, 100)
        const rows = db.prepare(`SELECT meeting,date,t,speaker,txt FROM segs WHERE ${conds.join(' AND ')} ORDER BY meeting,t LIMIT ?`).all(...vals, limit)
        return { count: rows.length, hits: rows }
      } finally { db.close() }
    },
    presentCall: (a) => ({ card: 'generic', title: '查会议', kind: 'other', rawInput: a }),
  }))

  ctx.effect(() => ctx.skills.registerProvider(() => createSkillProvider(ctx)))
}
