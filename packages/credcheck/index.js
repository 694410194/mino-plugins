/**
 * mino-connector-credcheck —— 凭据自检。
 * cloud/mail/music 三类凭据门源形态在了但从没拿真凭据跑过：本件逐项实测——
 *   cred_status：各凭据文件配了哪些键（掩码），哪些源没配
 *   cred_check ：每个已配源发一次真实请求/登录，逐条报 ✅有效/❌失效+白话原因
 * 凭据只进对应源请求头，不落地不上传第三方。
 */
import { readFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { homedir } from 'node:os'
import { connect as tlsConnect } from 'node:tls'
import { connect as netConnect } from 'node:net'
import { fileURLToPath } from 'node:url'
import { loadHostDeps } from './hostdeps.mjs'
import { createSkillProvider } from './skill-provider.mjs'

const PKG_DIR = dirname(fileURLToPath(import.meta.url))
const PKG = JSON.parse(readFileSync(join(PKG_DIR, 'package.json'), 'utf8'))
const DSH_HOME = process.env.DSH_HOME || join(homedir(), '.dsh')

export const name = PKG.name
export const inject = ['skills', 'tools']
const defineTool = (await loadHostDeps()).defineTool

const FILES = {
  cloud: join(DSH_HOME, 'connector-cloud.json'),
  mail: join(DSH_HOME, 'connector-mail.json'),
  music: join(DSH_HOME, 'connector-music.json'),
  semsearch: join(DSH_HOME, 'connector-semsearch.json'),
}

function loadJson(p) { try { return JSON.parse(readFileSync(p, 'utf8')) } catch { return null } }

async function jget(url, headers = {}, timeout = 15000) {
  const res = await fetch(url, { headers, signal: AbortSignal.timeout(timeout) })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

// ── 各源实测：返回 {ok, note} ─────────────────────────────────────────────────
const CHECKS = {
  async weread(c) {
    const r = await jget('https://i.weread.qq.com/user/notebook', { Cookie: c.wereadCookie, 'User-Agent': 'WeRead/7.0' })
    const n = (r.books || []).length
    return { ok: n >= 0 && !!r, note: n ? `读到 ${n} 本有划线的书` : '通了但暂无划线书籍' }
  },
  async bilibili(c) {
    const r = await jget('https://api.bilibili.com/x/v3/fav/folder/created/list-all?type=2', { Cookie: c.biliCookie, 'User-Agent': 'Mino/1.0' })
    if (r.code !== 0) throw new Error(`B站拒绝：${r.message}（cookie 可能过期）`)
    return { ok: true, note: `${(r.data?.list || []).length} 个收藏夹` }
  },
  async weibo(c) {
    const r = await jget('https://weibo.com/ajax/profile/info', { Cookie: c.weiboCookie, 'User-Agent': 'Mino/1.0', 'X-Requested-With': 'XMLHttpRequest' })
    return { ok: !!r.data?.user, note: `账号 ${r.data?.user?.screen_name || '已登录'}` }
  },
  async netdisk(c) {
    const r = await jget('https://pan.baidu.com/api/quota?checkfree=1&checkexpire=1', { Cookie: c.netdiskCookie, 'User-Agent': 'pan.baidu.com' })
    if (r.errno !== 0) throw new Error('凭据无效或过期')
    return { ok: true, note: `容量 ${Math.round(r.total / 1073741824)}GB` }
  },
  async immich(c) {
    const r = await jget(`${c.immich.url.replace(/\/$/, '')}/api/albums`, { 'x-api-key': c.immich.key })
    return { ok: Array.isArray(r), note: `${r.length} 个相册` }
  },
  async homeassistant(c) {
    const r = await jget(`${c.homeassistant.url.replace(/\/$/, '')}/api/states`, { Authorization: `Bearer ${c.homeassistant.token}` })
    return { ok: Array.isArray(r), note: `${r.length} 个实体` }
  },
  async douban(c) {
    const uid = c.doubanUid
    const r = await fetch(`https://m.douban.com/rexxar/api/v2/user/${uid}/interests?count=1&start=0&status=done`,
      { headers: { 'User-Agent': 'Mino/1.0', Referer: 'https://m.douban.com/' }, signal: AbortSignal.timeout(15000) })
    if (!r.ok) throw new Error(`豆瓣 HTTP ${r.status}（uid 可能填错）`)
    return { ok: true, note: `标记总数 ${(await r.json()).total}` }
  },
}

async function imapCheck(cfg) {
  return await new Promise((resolve, reject) => {
    const { host, port = 993, tls = true, user, pass } = cfg
    const sock = tls ? tlsConnect({ host, port }) : netConnect({ host, port })
    let buf = '', step = 0, done = false
    const finish = (ok, note) => { if (done) return; done = true; try { sock.end() } catch { }; resolve({ ok, note }) }
    const timer = setTimeout(() => finish(false, '连接超时 15 秒'), 15000)
    sock.on('error', e => { clearTimeout(timer); finish(false, `连不上 ${host}:${port}（${e.code || e.message}）`) })
    sock.on('data', d => {
      buf += d.toString('utf8')
      if (step === 0 && /^\* OK/m.test(buf)) { step = 1; sock.write(`a1 LOGIN "${user}" "${pass}"\r\n`) }
      else if (step === 1 && /^a1 /m.test(buf)) {
        clearTimeout(timer)
        if (/^a1 OK/m.test(buf)) finish(true, `IMAP 登录成功（${user}）`)
        else finish(false, `IMAP 登录被拒（${buf.match(/^a1 .*/m)?.[0]?.slice(0, 80) || '凭据错'}）——QQ/163 要授权码不是登录密码`)
      }
    })
  })
}

export function apply(ctx) {
  ctx.tools.register(defineTool({
    name: 'cred_status',
    description: '凭据盘点：哪些凭据文件存在、配了哪些键（掩码显示）、哪些源还没配。不联网。',
    parameters: {},
    output: { schema: { type: 'object', additionalProperties: false, properties: { report: { type: 'string' } } },
      render: (_a, v) => [{ type: 'text', text: v.report }] },
    isConcurrencySafe: () => true,
    async execute() {
      const lines = []
      const cloud = loadJson(FILES.cloud)
      if (cloud) {
        const keys = { wereadCookie: '微信读书', biliCookie: 'B站', weiboCookie: '微博', netdiskCookie: '百度网盘', immich: 'immich', homeassistant: 'HA', doubanUid: '豆瓣', caldav: 'CalDAV' }
        const have = Object.entries(keys).filter(([k]) => cloud[k]).map(([, n]) => n)
        const miss = Object.entries(keys).filter(([k]) => !cloud[k]).map(([, n]) => n)
        lines.push(`cloud：已配 ${have.join('、') || '无'}；未配 ${miss.join('、') || '无'}`)
      } else lines.push(`cloud：未建 ${FILES.cloud}`)
      const mail = loadJson(FILES.mail)
      lines.push(mail ? `mail：已配 ${mail.user || '?'}@${mail.host || '?'}` : `mail：未建 ${FILES.mail}`)
      const music = loadJson(FILES.music)
      lines.push(music ? `music：已配 ${['neteaseCookie', 'cookie', 'uid', 'qqCookie'].filter(k => music[k]).join('、') || '无键'}` : `music：未建 ${FILES.music}`)
      const sem = loadJson(FILES.semsearch)
      lines.push(sem?.endpoint ? `semsearch：自配端点 ${sem.endpoint}` : 'semsearch：未配端点（默认本地引擎）')
      return { report: lines.join('\n') }
    },
    presentCall: (a) => ({ card: 'generic', title: '凭据盘点', kind: 'other', rawInput: a }),
  }))

  ctx.tools.register(defineTool({
    name: 'cred_check',
    description: '真凭据实测：每个已配源发一次真实请求/登录，逐条报 ✅有效/❌失效+白话原因（过期/填错/要授权码）。配了新凭据或怀疑失效时用。',
    parameters: { only: { type: 'string', description: '只测某个源（weread/bilibili/weibo/netdisk/immich/homeassistant/douban/mail/music）' } },
    output: { schema: { type: 'object', additionalProperties: false, properties: { report: { type: 'string' } } },
      render: (_a, v) => [{ type: 'text', text: v.report }] },
    isConcurrencySafe: () => false,
    async execute(args) {
      const only = String(args.only || '').toLowerCase() || null
      const lines = []
      const cloud = loadJson(FILES.cloud)
      const keyMap = { weread: 'wereadCookie', bilibili: 'biliCookie', weibo: 'weiboCookie', netdisk: 'netdiskCookie', immich: 'immich', homeassistant: 'homeassistant', douban: 'doubanUid' }
      for (const [src, key] of Object.entries(keyMap)) {
        if (only && only !== src) continue
        if (!cloud?.[key]) { lines.push(`⏭ ${src}：未配，跳过`); continue }
        try { const r = await CHECKS[src](cloud); lines.push(`✅ ${src}：${r.note}`) }
        catch (e) { lines.push(`❌ ${src}：${String(e.message || e).slice(0, 120)}`) }
      }
      const mail = loadJson(FILES.mail)
      if (!only || only === 'mail') {
        if (!mail) lines.push('⏭ mail：未配，跳过')
        else try { const r = await imapCheck(mail); lines.push(`${r.ok ? '✅' : '❌'} mail：${r.note}`) }
        catch (e) { lines.push(`❌ mail：${String(e.message || e).slice(0, 120)}`) }
      }
      const music = loadJson(FILES.music)
      if (!only || only === 'music') {
        const cookie = music?.neteaseCookie || music?.cookie
        if (!music) lines.push('⏭ music：未配，跳过')
        else if (!cookie) lines.push('⏭ music：无 cookie（公开歌单仍可用）')
        else try {
          const r = await jget('https://music.163.com/api/nuser/account/get', { Cookie: cookie, 'User-Agent': 'Mozilla/5.0 Mino/1.0' })
          lines.push(r.code === 200 && r.account ? `✅ music：网易云已登录 uid=${r.account.id}` : `❌ music：cookie 无效（重新从 music.163.com 抓 MUSIC_U）`)
        } catch (e) { lines.push(`❌ music：${String(e.message || e).slice(0, 120)}`) }
      }
      if (!lines.length) return { report: '没有可测的源——先按 cred_status 指引配凭据' }
      return { report: lines.join('\n') }
    },
    presentCall: (a) => ({ card: 'generic', title: '凭据实测', kind: 'other', rawInput: a }),
  }))

  ctx.effect(() => ctx.skills.registerProvider(() => createSkillProvider(ctx)))
}
