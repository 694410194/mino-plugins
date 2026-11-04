/**
 * mino-connector-music —— 歌单连接器（conn-media 域）。
 * 网易云歌单：公开歌单凭 ID/链接可读（无需凭据）；自己的私密歌单给 cookie 文件。
 * 只读、本地；cookie 只进对应接口请求头。
 */
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs'
import { join, dirname, extname } from 'node:path'
import { homedir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { loadHostDeps } from './hostdeps.mjs'
import { createSkillProvider } from './skill-provider.mjs'

const PKG_DIR = dirname(fileURLToPath(import.meta.url))
const PKG = JSON.parse(readFileSync(join(PKG_DIR, 'package.json'), 'utf8'))
const CFG_PATH = join(process.env.DSH_HOME || join(homedir(), '.dsh'), 'connector-music.json')

export const name = PKG.name
export const inject = ['skills', 'tools']
const defineTool = (await loadHostDeps()).defineTool

const UA = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Mino/1.0', 'Referer': 'https://music.163.com' }

function loadCookie() {
  try {
    const c = JSON.parse(readFileSync(CFG_PATH, 'utf8'))
    return c.neteaseCookie || c.cookie || null
  } catch { return null }
}

async function fetchPlaylist(id, cookie) {
  const headers = { ...UA }
  if (cookie) headers.Cookie = cookie
  const res = await fetch(`https://music.163.com/api/v6/playlist/detail?id=${id}&n=1000`, {
    headers, signal: AbortSignal.timeout(15000) })
  const j = await res.json().catch(() => null)
  const pl = j?.playlist
  if (!pl) return null
  return {
    name: pl.name,
    creator: pl.creator?.nickname || '',
    trackCount: pl.trackCount,
    tracks: (pl.tracks || []).map(t => ({
      id: t.id,
      name: t.name,
      artists: (t.ar || []).map(a => a.name).join('/'),
      album: t.al?.name || '',
    })),
  }
}

export function apply(ctx) {
  ctx.tools.register(defineTool({
    name: 'music_playlist',
    description:
      '读网易云歌单内容：传歌单 ID 或链接，返回歌名/歌手列表。' +
      '公开歌单直接读；自己的私密歌单需在 ~/.dsh/connector-music.json 填 neteaseCookie。',
    parameters: {
      id: { type: 'string', required: true, description: '歌单 ID 或 music.163.com/playlist?id=xxx 链接' },
      limit: { type: 'integer', description: '最多返回多少首（默认 50）' },
    },
    output: { schema: { type: 'object', additionalProperties: false, properties: {
      name: { type: 'string' }, trackCount: { type: 'integer' },
      tracks: { type: 'array', items: { type: 'object', additionalProperties: true } } } },
      render: (_a, v) => [{ type: 'text', text: `歌单《${v.name}》共 ${v.trackCount} 首，返回前 ${v.tracks.length} 首：` +
        v.tracks.map(t => `${t.name} - ${t.artists}`).join('；') }] },
    isConcurrencySafe: () => true,
    async execute(args) {
      const m = String(args.id || '').match(/(\d{5,})/)
      if (!m) throw new Error('music_playlist: 给歌单 ID 或链接')
      const pl = await fetchPlaylist(m[1], loadCookie())
      if (!pl) throw new Error('music_playlist: 读不到歌单（私密歌单需要在 ~/.dsh/connector-music.json 填 {"neteaseCookie":"MUSIC_U=..."}）')
      const limit = Math.min(Number.isFinite(+args.limit) ? +args.limit : 50, 500)
      return { name: pl.name, trackCount: pl.trackCount, tracks: pl.tracks.slice(0, limit) }
    },
    presentCall: (a) => ({ card: 'generic', title: '读歌单', kind: 'other', rawInput: a }),
  }))

  ctx.tools.register(defineTool({
    name: 'music_qq',
    description: '读 QQ音乐公开歌单（传歌单 id，无需凭据）。',
    parameters: {
      id: { type: 'string', required: true, description: 'QQ音乐歌单 id（y.qq.com 歌单页 url 里的数字）' },
      limit: { type: 'integer', description: '最多多少首（默认 50）' },
    },
    output: { schema: { type: 'object', additionalProperties: false, properties: {
      name: { type: 'string' }, count: { type: 'integer' }, tracks: { type: 'array', items: { type: 'object', additionalProperties: true } } } },
      render: (_a, v) => [{ type: 'text', text: `歌单《${v.name}》共 ${v.count} 首：` + v.tracks.slice(0, 10).map(t => `${t.name}-${t.artists}`).join('；') }] },
    isConcurrencySafe: () => true,
    async execute(args) {
      const id = String(args.id || '').match(/\d+/)?.[0]
      if (!id) throw new Error('music_qq: 给歌单 id')
      const res = await fetch(`https://c.y.qq.com/v8/fcg-bin/fcg_v8_playlist_cp.fcg?id=${id}&format=json&newsong=1&platform=h5`, {
        headers: UA, signal: AbortSignal.timeout(15000) })
      const j = await res.json().catch(() => null)
      const cd = j?.data?.cdlist?.[0]
      if (!cd) throw new Error('music_qq: 读不到歌单（私密歌单走不了公开接口）')
      const limit = Math.min(Number.isFinite(+args.limit) ? +args.limit : 50, 500)
      return {
        name: String(cd.dissname || ''), count: cd.songnum || (cd.songlist || []).length,
        tracks: (cd.songlist || []).slice(0, limit).map(s => ({
          id: String(s.songmid || s.songid || ''), name: String(s.songname || ''),
          artists: (s.singer || []).map(x => x.name).join('/') || '', album: String(s.albumname || ''),
        })),
      }
    },
    presentCall: (a) => ({ card: 'generic', title: '读QQ音乐歌单', kind: 'other', rawInput: a }),
  }))

  ctx.tools.register(defineTool({
    name: 'music_local',
    description: '盘点本地音乐文件夹（mp3/flac/m4a/wav/ogg…）按目录/格式统计。',
    parameters: {
      dir: { type: 'string', description: '音乐目录（默认 <用户>/Music）' },
    },
    output: { schema: { type: 'object', additionalProperties: false, properties: {
      files: { type: 'integer' }, sizeHuman: { type: 'string' }, byExt: { type: 'object', additionalProperties: true }, byDir: { type: 'object', additionalProperties: true } } },
      render: (_a, v) => [{ type: 'text', text: `本地音乐 ${v.files} 个 ${v.sizeHuman}` }] },
    isConcurrencySafe: () => true,
    async execute(args) {
      const dir = args.dir ? String(args.dir) : join(homedir(), 'Music')
      if (!existsSync(dir)) throw new Error(`music_local: 目录不存在 ${dir}`)
      const exts = ['.mp3', '.flac', '.m4a', '.wav', '.ogg', '.ape', '.wma', '.aac', '.ncm', '.kgm']
      const byExt = {}, byDir = {}
      let files = 0, size = 0
      const walk = (d, depth) => {
        if (depth > 6) return
        let es
        try { es = readdirSync(d, { withFileTypes: true }) } catch { return }
        for (const e of es) {
          const p = join(d, e.name)
          if (e.isDirectory()) { walk(p, depth + 1); continue }
          const ext = extname(e.name).toLowerCase()
          if (!exts.includes(ext)) continue
          try { const st = statSync(p); size += st.size; files++ } catch { continue }
          byExt[ext] = (byExt[ext] || 0) + 1
          const rel = d === dir ? '(根目录)' : d.slice(dir.length + 1).split(/[\\/]/)[0]
          byDir[rel] = (byDir[rel] || 0) + 1
        }
      }
      walk(dir, 0)
      return { files, sizeHuman: size > 1e9 ? `${(size / 1e9).toFixed(1)}GB` : `${(size / 1e6).toFixed(0)}MB`,
        byExt, byDir: Object.fromEntries(Object.entries(byDir).sort((a, b) => b[1] - a[1]).slice(0, 20)) }
    },
    presentCall: (a) => ({ card: 'generic', title: '盘点本地音乐', kind: 'other', rawInput: a }),
  }))

  ctx.tools.register(defineTool({
    name: 'music_history',
    description: '网易云听歌排行（最近一周/所有时间）。需要在 connector-music.json 填 neteaseCookie + uid。',
    parameters: {
      type: { type: 'integer', description: '0=所有时间，1=最近一周（默认 1）' },
    },
    output: { schema: { type: 'object', additionalProperties: true },
      render: (_a, v) => [{ type: 'text', text: `听歌排行 ${v.count} 首：` + (v.top || []).slice(0, 10).join('；') }] },
    isConcurrencySafe: () => true,
    async execute(args) {
      let c
      try { c = JSON.parse(readFileSync(CFG_PATH, 'utf8')) } catch { c = {} }
      const cookie = c.neteaseCookie || c.cookie
      const uid = c.uid || cookie?.match(/userId=(\d+)/)?.[1]
      if (!cookie || !uid) throw new Error(`没配：${CFG_PATH} 填 {"neteaseCookie":"MUSIC_U=...","uid":"你的网易云uid"}`)
      const res = await fetch(`https://music.163.com/weapi/v1/play/record?uid=${uid}&type=${Number.isFinite(+args.type) ? +args.type : 1}`, {
        method: 'POST', headers: { ...UA, Cookie: cookie, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'params=%7B%7D&encSecKey=0', signal: AbortSignal.timeout(15000) })
      const j = await res.json().catch(() => null)
      const list = (Number.isFinite(+args.type) && +args.type === 0 ? j?.allData : j?.weekData) || j?.allData || j?.weekData || []
      const top = list.slice(0, 30).map(i => `${i.song?.name || i.name} - ${(i.song?.ar || i.song?.artists || []).map(a => a.name).join('/')}`)
      return { count: list.length, top }
    },
    presentCall: (a) => ({ card: 'generic', title: '看听歌排行', kind: 'other', rawInput: a }),
  }))

  ctx.effect(() => ctx.skills.registerProvider(() => createSkillProvider(ctx)))
}
