/**
 * mino-connector-mail —— 邮件连接器（conn-mail 域）。
 * IMAP 只读拉取你自己邮箱的最近邮件列表与搜索。凭据走本机配置文件
 * ~/.dsh/connector-mail.json：{"host":"imap.qq.com","port":993,"user":"...","pass":"授权码","tls":true}
 * 无凭据时工具返回接入指引，不装死。
 */
import { readFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { homedir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { connect as tlsConnect } from 'node:tls'
import { connect as netConnect } from 'node:net'
import { loadHostDeps } from './hostdeps.mjs'
import { createSkillProvider } from './skill-provider.mjs'

const PKG_DIR = dirname(fileURLToPath(import.meta.url))
const PKG = JSON.parse(readFileSync(join(PKG_DIR, 'package.json'), 'utf8'))
const CFG_PATH = join(process.env.DSH_HOME || join(homedir(), '.dsh'), 'connector-mail.json')

export const name = PKG.name
export const inject = ['skills', 'tools']
const defineTool = (await loadHostDeps()).defineTool

const NEED_CFG = `mail 需要 IMAP 凭据：在 ${CFG_PATH.replace(/\//g, '\\')} 填
{"host":"imap.qq.com","port":993,"user":"你的邮箱","pass":"邮箱授权码","tls":true}
（QQ/163/Gmail 都在网页版邮箱设置里开 IMAP 并生成授权码，不是登录密码）`

function loadCfg() {
  try { return JSON.parse(readFileSync(CFG_PATH, 'utf8')) } catch { return null }
}

// ── 最小 IMAP 客户端：LOGIN→SELECT→FETCH 头/搜索（只读命令）────────────────────
class Imap {
  constructor(cfg) {
    this.cfg = cfg
    this.buf = Buffer.alloc(0)
    this.lines = []
    this.tag = 0
    this.waiters = []
  }
  async connect() {
    const { host, port = 993, tls = true } = this.cfg
    this.sock = tls ? tlsConnect({ host, port }) : netConnect({ host, port })
    this.sock.on('data', (d) => this.feed(d))
    this.sock.on('error', (e) => { for (const w of this.waiters.splice(0)) w.reject(e) })
    await this.expect('*', 15000)
  }
  feed(d) {
    this.buf = Buffer.concat([this.buf, d])
    let i
    while ((i = this.buf.indexOf('\n')) >= 0) {
      const line = this.buf.subarray(0, i + 1).toString('utf8')
      this.buf = this.buf.subarray(i + 1)
      this.lines.push(line)
      const w = this.waiters[0]
      if (w) {
        w.lines.push(line)
        if (w.done(line)) { this.waiters.shift(); w.resolve(w.lines) }
      }
    }
  }
  cmd(c, doneFn, timeout = 30000) {
    const tag = `A${String(++this.tag).padStart(4, '0')}`
    const done = doneFn || ((l) => l.startsWith(tag + ' '))
    return new Promise((resolve, reject) => {
      const w = { lines: [], done, resolve, reject }
      this.waiters.push(w)
      this.sock.write(`${tag} ${c}\r\n`)
      setTimeout(() => {
        const i = this.waiters.indexOf(w)
        if (i >= 0) { this.waiters.splice(i, 1); reject(new Error('imap timeout')) }
      }, timeout)
    })
  }
  async expect(prefix, timeout) {
    return new Promise((resolve, reject) => {
      const w = { lines: [], done: (l) => l.startsWith(prefix), resolve, reject }
      this.waiters.push(w)
      setTimeout(() => { const i = this.waiters.indexOf(w); if (i >= 0) { this.waiters.splice(i, 1); reject(new Error('imap greet timeout')) } }, timeout)
    })
  }
  async login() {
    const lines = await this.cmd(`LOGIN "${this.cfg.user}" "${this.cfg.pass}"`)
    if (!lines.some(l => / OK /i.test(l))) throw new Error('IMAP 登录失败（用授权码不是登录密码）')
    await this.cmd('SELECT INBOX')
  }
  async recent(limit) {
    const exists = this.lines.filter(l => /^\* \d+ EXISTS/.test(l)).pop()
    const total = exists ? +exists.match(/\* (\d+) EXISTS/)[1] : 0
    if (!total) return { total: 0, mails: [] }
    const from = Math.max(1, total - limit + 1)
    const lines = await this.cmd(`FETCH ${from}:${total} (ENVELOPE)`, (l) => l.startsWith(`A${String(this.tag).padStart(4, '0')} `), 30000)
    const mails = []
    for (const l of lines) {
      const m = l.match(/ENVELOPE \("([^"]*)" "[^"]*" \((?:\(\("[^"]*" NIL "[^"]*" "([^"]*)"\)|NIL)/)
      if (m) mails.push({ date: m[1] || '', from: m[2] || '', subject: decodeHeader(l.match(/ENVELOPE \("[^"]*" "((?:[^"\\]|\\.)*)"/)?.[1] || '') })
    }
    return { total, mails: mails.reverse() }
  }
  async search(q, limit) {
    const lines = await this.cmd(`SEARCH CHARSET UTF-8 TEXT "${String(q).replace(/"/g, '')}"`)
    const ids = lines.filter(l => l.startsWith('* SEARCH')).flatMap(l => l.slice(8).trim().split(' ')).filter(Boolean)
    const last = ids.slice(-limit)
    const mails = []
    for (const id of last) {
      const fl = await this.cmd(`FETCH ${id} (ENVELOPE)`)
      const txt = fl.join('')
      const dm = txt.match(/ENVELOPE \("([^"]*)"/)
      const sm = txt.match(/"((?:[^"\\]|\\.)*)"\s+\(\(/)
      mails.push({ id, date: dm?.[1] || '', subject: decodeHeader(sm?.[1] || '') })
    }
    return { count: ids.length, mails: mails.reverse() }
  }
  close() { try { this.sock.write(`A9999 LOGOUT\r\n`); this.sock.end() } catch {} }
}

function decodeHeader(s) {
  return String(s).replace(/=\?utf-8\?B\?([^?]+)\?=/gi, (_m, b) => Buffer.from(b, 'base64').toString('utf8'))
    .replace(/=\?gbk\?B\?([^?]+)\?=/gi, (_m, b) => Buffer.from(b, 'base64').toString('utf8'))
    .replace(/=\?utf-8\?Q\?([^?]+)\?=/gi, (_m, q) => Buffer.from(q.replace(/_/g, ' ').replace(/=([0-9A-F]{2})/gi, (_x, h) => String.fromCharCode(parseInt(h, 16))), 'binary').toString('utf8'))
}

export function apply(ctx) {
  ctx.tools.register(defineTool({
    name: 'mail_recent',
    description: '列你自己邮箱最近的邮件（主题/发件人/日期）。需要先在配置文件填 IMAP 授权码。',
    parameters: { limit: { type: 'integer', description: '最近多少封（默认 15）' } },
    output: { schema: { type: 'object', additionalProperties: false, properties: {
      total: { type: 'integer' }, mails: { type: 'array', items: { type: 'object', additionalProperties: true } } } },
      render: (_a, v) => [{ type: 'text', text: `邮箱共 ${v.total} 封，列出最近 ${v.mails.length} 封` }] },
    isConcurrencySafe: () => false,
    async execute(args) {
      const cfg = loadCfg()
      if (!cfg?.host || !cfg?.user || !cfg?.pass) throw new Error(NEED_CFG)
      const im = new Imap(cfg)
      try {
        await im.connect(); await im.login()
        return await im.recent(Math.min(Number.isFinite(+args.limit) ? +args.limit : 15, 50))
      } finally { im.close() }
    },
    presentCall: (a) => ({ card: 'generic', title: '看最近邮件', kind: 'other', rawInput: a }),
  }))

  ctx.tools.register(defineTool({
    name: 'mail_search',
    description: '在你邮箱里按关键词搜邮件（如订票/发票/验证码）。需要先配 IMAP。',
    parameters: {
      q: { type: 'string', required: true, description: '关键词' },
      limit: { type: 'integer', description: '最多多少封（默认 10）' },
    },
    output: { schema: { type: 'object', additionalProperties: false, properties: {
      count: { type: 'integer' }, mails: { type: 'array', items: { type: 'object', additionalProperties: true } } } },
      render: (_a, v) => [{ type: 'text', text: `命中 ${v.count} 封` }] },
    isConcurrencySafe: () => false,
    async execute(args) {
      const cfg = loadCfg()
      if (!cfg?.host || !cfg?.user || !cfg?.pass) throw new Error(NEED_CFG)
      const im = new Imap(cfg)
      try {
        await im.connect(); await im.login()
        return await im.search(args.q, Math.min(Number.isFinite(+args.limit) ? +args.limit : 10, 50))
      } finally { im.close() }
    },
    presentCall: (a) => ({ card: 'generic', title: '搜邮件', kind: 'other', rawInput: a }),
  }))

  ctx.effect(() => ctx.skills.registerProvider(() => createSkillProvider(ctx)))
}
