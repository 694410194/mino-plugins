/**
 * mino-connector-music —— 歌单连接器（conn-media 域）。
 * 网易云歌单：公开歌单凭 ID/链接可读（无需凭据）；自己的私密歌单给 cookie 文件。
 * 只读、本地；cookie 只进对应接口请求头。
 */
import { readFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
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

  ctx.effect(() => ctx.skills.registerProvider(() => createSkillProvider(ctx)))
}
