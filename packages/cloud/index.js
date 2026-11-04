/**
 * mino-connector-cloud —— 云端账号连接器（凭据门形态，多服务合一）。
 * 覆盖：微信读书划线 / B站收藏 / 微博 / 百度网盘 / immich / Home Assistant。
 * 凭据全走本机配置文件 ~/.dsh/connector-cloud.json，用户自己填：
 *   {"wereadCookie":"...","biliCookie":"SESSDATA=...","weiboCookie":"...",
 *    "netdiskCookie":"...","immich":{"url":"...","key":"..."},
 *    "homeassistant":{"url":"...","token":"..."}}
 * 没配的源返回白话接入指引，不装死；凭据只进对应服务请求头，不出本机。
 */
import { readFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { homedir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { loadHostDeps } from './hostdeps.mjs'
import { createSkillProvider } from './skill-provider.mjs'

const PKG_DIR = dirname(fileURLToPath(import.meta.url))
const PKG = JSON.parse(readFileSync(join(PKG_DIR, 'package.json'), 'utf8'))
const CFG_PATH = join(process.env.DSH_HOME || join(homedir(), '.dsh'), 'connector-cloud.json')

export const name = PKG.name
export const inject = ['skills', 'tools']
const defineTool = (await loadHostDeps()).defineTool

const cfg = () => { try { return JSON.parse(readFileSync(CFG_PATH, 'utf8')) } catch { return {} } }
const need = (key, hint) => {
  throw new Error(`没配 ${key}：在 ${CFG_PATH.replace(/\//g, '\\')} 里填 ${hint}（填完重试即可）`)
}

async function jget(url, headers = {}, timeout = 15000) {
  const res = await fetch(url, { headers, signal: AbortSignal.timeout(timeout) })
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url.slice(0, 80)}`)
  return res.json()
}

// ── 各源实现 ────────────────────────────────────────────────────────────────
const SOURCES = {
  async weread(c) {
    const cookie = c.wereadCookie || need('wereadCookie', '"wereadCookie":"网页版 weread.qq.com 的 Cookie"')
    const me = await jget('https://i.weread.qq.com/user/notebook', { Cookie: cookie, 'User-Agent': 'WeRead/7.0' })
    const books = (me.books || []).map(b => ({ book: b.book?.title, author: b.book?.author, noteCount: b.noteCount })).filter(b => b.book)
    return { 有划线的书: books.slice(0, 50), 数量: books.length, 提示: '逐本划线内容用 weread_notes + bookId' }
  },
  async bilibili(c) {
    const cookie = c.biliCookie || need('biliCookie', '"biliCookie":"SESSDATA=xxx"（bilibili.com 登录后 F12 复制）')
    const favs = await jget('https://api.bilibili.com/x/v3/fav/folder/created/list-all?type=2', { Cookie: cookie, 'User-Agent': 'Mino/1.0' })
    if (favs.code !== 0) throw new Error(`B站接口拒绝（cookie 可能过期）：${favs.message}`)
    const folders = (favs.data?.list || []).map(f => ({ id: f.id, title: f.title, 视频数: f.media_count }))
    return { 收藏夹: folders }
  },
  async weibo(c) {
    const cookie = c.weiboCookie || need('weiboCookie', '"weiboCookie":"weibo.com 登录后的 Cookie"')
    const r = await jget('https://weibo.com/ajax/profile/info', { Cookie: cookie, 'User-Agent': 'Mino/1.0', 'X-Requested-With': 'XMLHttpRequest' })
    return { 账号: r.data?.user?.screen_name || '已登录', 说明: '微博接口仅验证凭据有效性，收藏内容用 weibo_fav' }
  },
  async netdisk(c) {
    const cookie = c.netdiskCookie || need('netdiskCookie', '"netdiskCookie":"pan.baidu.com 登录后的 Cookie"')
    const r = await jget('https://pan.baidu.com/api/quota?checkfree=1&checkexpire=1', { Cookie: cookie, 'User-Agent': 'pan.baidu.com' })
    if (r.errno !== 0) throw new Error('百度网盘凭据无效或过期')
    return { 网盘: '凭据有效', 总容量GB: Math.round(r.total / 1073741824), 已用GB: Math.round(r.used / 1073741824) }
  },
  async immich(c) {
    const im = c.immich || need('immich', '"immich":{"url":"http://你的immich:2283","key":"API key"}')
    const r = await jget(`${im.url.replace(/\/$/, '')}/api/albums`, { 'x-api-key': im.key })
    return { 相册数: r.length, 相册: r.slice(0, 30).map(a => ({ name: a.albumName, 张数: a.assetCount })) }
  },
  async homeassistant(c) {
    const ha = c.homeassistant || need('homeassistant', '"homeassistant":{"url":"http://你的HA:8123","token":"长期令牌"}')
    const r = await jget(`${ha.url.replace(/\/$/, '')}/api/states`, { Authorization: `Bearer ${ha.token}` })
    const byDomain = {}
    for (const s of r) { const d = s.entity_id.split('.')[0]; byDomain[d] = (byDomain[d] || 0) + 1 }
    return { 实体总数: r.length, 按类: byDomain }
  },
}

const SOURCE_NAMES = Object.keys(SOURCES)

export function apply(ctx) {
  ctx.tools.register(defineTool({
    name: 'cloud_status',
    description: '查云端连接器状态：哪些源配好了凭据、每个源的接入指引。' +
      `支持：${SOURCE_NAMES.join('/')}。凭据填在 ~/.dsh/connector-cloud.json。`,
    parameters: {},
    output: { schema: { type: 'object', additionalProperties: false, properties: {
      configured: { type: 'array', items: { type: 'string' } }, missing: { type: 'array', items: { type: 'string' } }, cfgPath: { type: 'string' } } },
      render: (_a, v) => [{ type: 'text', text: `已配 ${v.configured.length} 源，未配 ${v.missing.length} 源` }] },
    isConcurrencySafe: () => true,
    async execute() {
      const c = cfg()
      const map = { weread: 'wereadCookie', bilibili: 'biliCookie', weibo: 'weiboCookie', netdisk: 'netdiskCookie', immich: 'immich', homeassistant: 'homeassistant' }
      const configured = SOURCE_NAMES.filter(s => c[map[s]])
      const missing = SOURCE_NAMES.filter(s => !c[map[s]])
      return { configured, missing, cfgPath: CFG_PATH }
    },
    presentCall: (a) => ({ card: 'generic', title: '查云端连接状态', kind: 'other', rawInput: a }),
  }))

  ctx.tools.register(defineTool({
    name: 'cloud_pull',
    description: '从配好凭据的云端源拉数据摘要：weread=有划线的书、bilibili=收藏夹列表、' +
      'weibo=凭据验证、netdisk=网盘用量、immich=相册清单、homeassistant=智能家居实体统计。',
    parameters: {
      source: { type: 'string', required: true, description: `数据源：${SOURCE_NAMES.join('|')}` },
    },
    output: { schema: { type: 'object', additionalProperties: true },
      render: (_a, v) => [{ type: 'text', text: JSON.stringify(v).slice(0, 120) }] },
    isConcurrencySafe: () => true,
    async execute(args) {
      const fn = SOURCES[String(args.source || '').toLowerCase()]
      if (!fn) throw new Error(`cloud_pull: 不认识的源 "${args.source}"，支持：${SOURCE_NAMES.join('/')}`)
      return await fn(cfg())
    },
    presentCall: (a) => ({ card: 'generic', title: `拉取 ${a.source}`, kind: 'other', rawInput: a }),
  }))

  ctx.effect(() => ctx.skills.registerProvider(() => createSkillProvider(ctx)))
}
