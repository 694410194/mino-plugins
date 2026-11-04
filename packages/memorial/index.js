/**
 * mino-connector-memorial —— 纪念册连接器（场景组合包：悼念/留念）。
 * 组合三件料：聊天记录（connector-chat-export 库）+ 照片目录 + 手动记录
 * （connector-records 库），生成一本可翻阅的纪念册 HTML（照片轮播+对话
 * 片段+大事记时间线），写给在世的人存念想。
 */
import { existsSync, readFileSync, readdirSync, statSync, mkdirSync, writeFileSync, copyFileSync } from 'node:fs'
import { join, dirname, basename } from 'node:path'
import { homedir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { loadHostDeps } from './hostdeps.mjs'
import { createSkillProvider } from './skill-provider.mjs'

const PKG_DIR = dirname(fileURLToPath(import.meta.url))
const PKG = JSON.parse(readFileSync(join(PKG_DIR, 'package.json'), 'utf8'))
const DSH_HOME = process.env.DSH_HOME || join(homedir(), '.dsh')

export const name = PKG.name
export const inject = ['skills', 'tools']
const defineTool = (await loadHostDeps()).defineTool

const esc = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

export function apply(ctx) {
  ctx.tools.register(defineTool({
    name: 'memorial_build',
    description:
      '生成纪念册：把某个人的聊天语料（chat-export 库）、照片目录、大事记' +
      '（records 库里某类别）合成一本 HTML 册子：生平+对话片段+照片墙+大事记。',
    parameters: {
      name: { type: 'string', required: true, description: '这个人（检索聊天 sender 用）' },
      photos: { type: 'string', description: '照片目录（jpg/png，最多取 60 张按时间排）' },
      chatQ: { type: 'string', description: '聊天检索关键词（默认用 name）' },
      recordsCat: { type: 'string', description: 'records 库里大事记的类别名' },
      epitaph: { type: 'string', description: '册子开头的一段话（生平简介/想说的话）' },
      out: { type: 'string', description: '输出目录（默认 ~/.dsh/connector-memorial/<name>）' },
    },
    output: { schema: { type: 'object', additionalProperties: false, properties: {
      file: { type: 'string' }, chats: { type: 'integer' }, photos: { type: 'integer' }, records: { type: 'integer' } } },
      render: (_a, v) => [{ type: 'text', text: `纪念册生成 → ${v.file}（对话${v.chats}段/照片${v.photos}张/大事记${v.records}条）` }] },
    isConcurrencySafe: () => false,
    async execute(args) {
      const person = String(args.name || '').trim()
      if (!person) throw new Error('memorial_build: 给人名')
      const out = args.out ? String(args.out) : join(DSH_HOME, 'connector-memorial', person)
      mkdirSync(join(out, 'photos'), { recursive: true })

      // 1) 聊天片段
      const chats = []
      const chatDbFile = join(DSH_HOME, 'connector-chat-export', 'chat.db')
      if (existsSync(chatDbFile)) {
        const { DatabaseSync } = await import('node:sqlite')
        const db = new DatabaseSync(chatDbFile, { readOnly: true })
        try {
          const q = `%${args.chatQ || person}%`
          for (const r of db.prepare('SELECT sender,time,text FROM messages WHERE sender LIKE ? OR text LIKE ? ORDER BY time LIMIT 300').all(q, q)) {
            if (r.text && r.text.length > 3) chats.push(r)
          }
        } finally { db.close() }
      }
      // 2) 照片（按文件名/修改时间排序，复制进册子目录）
      const photos = []
      if (args.photos && existsSync(String(args.photos))) {
        const files = readdirSync(String(args.photos))
          .filter(f => /\.(jpe?g|png|heic|webp)$/i.test(f))
          .map(f => ({ f, t: statSync(join(String(args.photos), f)).mtimeMs }))
          .sort((a, b) => a.t - b.t).slice(0, 60)
        for (const { f } of files) {
          copyFileSync(join(String(args.photos), f), join(out, 'photos', f))
          photos.push(f)
        }
      }
      // 3) 大事记
      const recs = []
      const recDbFile = join(DSH_HOME, 'connector-records', 'records.db')
      if (existsSync(recDbFile)) {
        const { DatabaseSync } = await import('node:sqlite')
        const db = new DatabaseSync(recDbFile, { readOnly: true })
        try {
          const cond = args.recordsCat ? 'category LIKE ?' : 'text LIKE ?'
          const val = `%${args.recordsCat || person}%`
          for (const r of db.prepare(`SELECT category,title,text,added FROM records WHERE ${cond} OR title LIKE ? ORDER BY added LIMIT 200`).all(val, val)) {
            recs.push(r)
          }
        } catch { } finally { db.close() }
      }
      if (!chats.length && !photos.length && !recs.length)
        throw new Error('没有料：先 chat_import 导聊天记录、准备照片目录、或 record_add 记大事记')

      // 4) 生成 HTML
      const file = join(out, 'index.html')
      const html = `<!doctype html><meta charset="utf-8"><title>${esc(person)} · 纪念册</title>
<style>
body{max-width:760px;margin:40px auto;font-family:serif;color:#333;background:#faf8f5;line-height:1.8;padding:0 20px}
h1{text-align:center;font-weight:normal;letter-spacing:.3em;border-bottom:1px solid #ccc;padding-bottom:20px}
.epitaph{text-align:center;color:#666;font-style:italic;margin:30px 0}
.wall{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin:20px 0}
.wall img{width:100%;aspect-ratio:1;object-fit:cover;border-radius:4px}
.chat{background:#fff;border-left:3px solid #d8cfc0;padding:8px 14px;margin:10px 0;border-radius:0 6px 6px 0}
.chat .who{color:#998;font-size:.85em}
.rec{margin:8px 0;padding-left:14px;border-left:2px solid #ddd}
h2{letter-spacing:.2em;color:#776;font-weight:normal;margin-top:40px}
</style>
<h1>${esc(person)}</h1>
${args.epitaph ? `<p class="epitaph">${esc(args.epitaph)}</p>` : ''}
${photos.length ? `<h2>影 像</h2><div class="wall">${photos.map(f => `<img src="photos/${encodeURIComponent(f)}">`).join('')}</div>` : ''}
${chats.length ? `<h2>言 语</h2>${chats.map(c => `<div class="chat"><div class="who">${esc(c.sender)} ${esc(c.time)}</div>${esc(c.text)}</div>`).join('')}` : ''}
${recs.length ? `<h2>事 记</h2>${recs.map(r => `<div class="rec"><b>${esc(r.title || r.category)}</b> ${esc(r.added || '')}<br>${esc(r.text)}</div>`).join('')}` : ''}
<p class="epitaph">—— 由 Mino 生成，${new Date().toISOString().slice(0, 10)} ——</p>`
      writeFileSync(file, html, 'utf8')
      return { file, chats: chats.length, photos: photos.length, records: recs.length }
    },
    presentCall: (a) => ({ card: 'generic', title: '生成纪念册', kind: 'other', rawInput: a }),
  }))

  ctx.effect(() => ctx.skills.registerProvider(() => createSkillProvider(ctx)))
}
