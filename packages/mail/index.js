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
      // IMAP 地址字段是 (("name" NIL "mailbox" "host")) —— 字段表 `(` 内只套一层
      // 地址 `("..."`（两个括号共），原正则 `\((?:\(\(` 要求三个连续括号恒不匹配。
      const m = l.match(/ENVELOPE \("([^"]*)" "[^"]*" \((?:\("[^"]*" NIL "[^"]*" "([^"]*)"\)|NIL)/)
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

const encHeader = (s) => /[\x80-\xff]/.test(s) ? `=?utf-8?B?${Buffer.from(s, 'utf8').toString('base64')}?=` : s

function buildRfc822({ from, to, cc, subject, body }) {
  return [
    `From: ${from}`,
    `To: ${Array.isArray(to) ? to.join(', ') : to}`,
    ...(cc ? [`Cc: ${cc}`] : []),
    `Subject: ${encHeader(subject)}`,
    `Date: ${new Date().toUTCString()}`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=utf-8',
    'Content-Transfer-Encoding: base64',
    '',
    Buffer.from(body, 'utf8').toString('base64').replace(/.{76}/g, '$&\r\n'),
  ].join('\r\n')
}

// ── 最小 SMTP 客户端：EHLO→AUTH LOGIN→MAIL/RCPT/DATA────────────────────────
class Smtp {
  constructor(cfg) {
    const smtp = cfg.smtp || {}
    const dom = String(cfg.user || '').split('@')[1] || ''
    this.host = smtp.host || `smtp.${dom}`
    this.port = smtp.port ?? 465
    this.tls = smtp.tls ?? true
    this.user = cfg.user
    this.pass = cfg.pass
    this.buf = ''
  }
  /** 等一条 `code ` 开头的完结行；其他三位码完结行立即失败。 */
  reply(code, timeout = 30000) {
    return new Promise((resolve, reject) => {
      const t = setTimeout(() => { this.sock.off('data', onData); reject(new Error('smtp timeout')) }, timeout)
      const onData = (d) => {
        this.buf += d.toString('utf8')
        const last = this.buf.split('\r\n').filter(Boolean).pop() || ''
        if (!/^\d{3} /.test(last)) return // 还有后续行（`code-` 续行）
        clearTimeout(t); this.sock.off('data', onData); this.buf = ''
        if (last.startsWith(`${code} `)) resolve(last)
        else reject(new Error(`smtp 期望 ${code} 实得 ${last}`))
      }
      this.sock.on('data', onData)
    })
  }
  async cmd(c, code) {
    this.sock.write(`${c}\r\n`)
    return this.reply(code)
  }
  async send(msg, to) {
    this.sock = this.tls ? tlsConnect({ host: this.host, port: this.port }) : netConnect({ host: this.host, port: this.port })
    await new Promise((res, rej) => { this.sock.once('secureConnect', res); this.sock.once('connect', res); this.sock.once('error', rej) })
    await this.reply('220')
    await this.cmd('EHLO mino.local', '250')
    await this.cmd(`AUTH LOGIN ${Buffer.from(this.user, 'utf8').toString('base64')}`, '334')
    await this.cmd(Buffer.from(this.pass, 'utf8').toString('base64'), '235')
    await this.cmd(`MAIL FROM:<${this.user}>`, '250')
    for (const rcpt of Array.isArray(to) ? to : [to]) await this.cmd(`RCPT TO:<${rcpt}>`, '250')
    await this.cmd('DATA', '354')
    this.sock.write(`${msg.replace(/\r\n\./g, '\r\n..')}\r\n.\r\n`)
    await this.reply('250')
    try { await this.cmd('QUIT', '221') } catch {}
    this.sock.end()
  }
}

/** 需要人工确认的发送类工具名——pre-execute 瀑布返回 ask，无审批答者时失败闭合。 */
const SENSITIVE_TOOLS = new Set(['mail_send', 'mail_unsubscribe'])

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

  ctx.tools.register(defineTool({
    name: 'mail_send',
    description: '用你的邮箱 SMTP 发一封纯文本邮件。发送前会请你确认收件人和内容。',
    parameters: {
      to: { type: 'string', required: true, description: '收件人地址，多个用英文逗号分隔' },
      subject: { type: 'string', required: true, description: '主题' },
      body: { type: 'string', required: true, description: '正文纯文本' },
      cc: { type: 'string', description: '抄送地址（可选）' },
    },
    output: { schema: { type: 'object', additionalProperties: false, properties: { sent: { type: 'boolean' }, to: { type: 'string' } } },
      render: (_a, v) => [{ type: 'text', text: v.sent ? `已发送到 ${v.to}` : '未发送' }] },
    isConcurrencySafe: () => false,
    async execute(args) {
      const cfg = loadCfg()
      if (!cfg?.host || !cfg?.user || !cfg?.pass) throw new Error(NEED_CFG)
      const to = String(args.to).split(',').map(s => s.trim()).filter(Boolean)
      if (!to.length) throw new Error('mail_send: 收件人为空')
      const msg = buildRfc822({ from: cfg.user, to, cc: args.cc, subject: String(args.subject), body: String(args.body) })
      const smtp = new Smtp(cfg)
      await smtp.send(msg, to)
      return { sent: true, to: to.join(', ') }
    },
    presentCall: (a) => ({ card: 'generic', title: `发邮件给 ${a.to}`, kind: 'other', rawInput: a }),
  }))

  ctx.tools.register(defineTool({
    name: 'mail_draft',
    description: '在你的邮箱草稿箱（IMAP APPEND）存一封草稿，不发送。',
    parameters: {
      to: { type: 'string', required: true, description: '收件人地址' },
      subject: { type: 'string', required: true, description: '主题' },
      body: { type: 'string', required: true, description: '正文纯文本' },
    },
    output: { schema: { type: 'object', additionalProperties: false, properties: { drafted: { type: 'boolean' } } },
      render: (_a, v) => [{ type: 'text', text: v.drafted ? '草稿已存入草稿箱' : '未存' }] },
    isConcurrencySafe: () => false,
    async execute(args) {
      const cfg = loadCfg()
      if (!cfg?.host || !cfg?.user || !cfg?.pass) throw new Error(NEED_CFG)
      const msg = buildRfc822({ from: cfg.user, to: String(args.to).split(',').map(s => s.trim()).filter(Boolean), subject: String(args.subject), body: String(args.body) })
      const im = new Imap(cfg)
      try {
        await im.connect(); await im.login()
        const folder = cfg.drafts || 'Drafts'
        const lines = await im.cmd(`APPEND "${folder.replace(/"/g, '')}" (\\Draft) {${Buffer.byteLength(msg)}}`, (l) => l.startsWith(`A${String(im.tag).padStart(4, '0')} `))
        if (!lines.some(l => / OK /i.test(l))) throw new Error(`APPEND 失败：${lines.join(' ').slice(0, 200)}（drafts 文件夹名可在凭据 cfg.drafts 配置）`)
        return { drafted: true }
      } finally { im.close() }
    },
    presentCall: (a) => ({ card: 'generic', title: '存邮件草稿', kind: 'other', rawInput: a }),
  }))

  ctx.tools.register(defineTool({
    name: 'mail_unsubscribe',
    description: '按关键词找到订阅邮件，读 List-Unsubscribe 头并执行退订（https 一键退订直接调用；mailto 链接回链发送确认邮件）。执行前会请你确认。',
    parameters: {
      q: { type: 'string', required: true, description: '定位订阅邮件的关键词（如发件人或刊物名）' },
    },
    output: { schema: { type: 'object', additionalProperties: false, properties: {
      found: { type: 'boolean' }, method: { type: 'string' }, detail: { type: 'string' } } },
      render: (_a, v) => [{ type: 'text', text: v.found ? `退订已发出（${v.method}）` : '没找到可退订的邮件' }] },
    isConcurrencySafe: () => false,
    async execute(args) {
      const cfg = loadCfg()
      if (!cfg?.host || !cfg?.user || !cfg?.pass) throw new Error(NEED_CFG)
      const im = new Imap(cfg)
      try {
        await im.connect(); await im.login()
        const found = await im.search(args.q, 1)
        const id = found.mails[0]?.id
        if (!id) return { found: false, method: '', detail: 'no matching mail' }
        const lines = await im.cmd(`FETCH ${id} (BODY.PEEK[HEADER.FIELDS (LIST-UNSUBSCRIBE LIST-UNSUBSCRIBE-POST SUBJECT FROM)])`)
        const raw = lines.join('')
        const hdr = raw.match(/LIST-UNSUBSCRIBE:\s*([^\r\n]+)/i)?.[1]?.replace(/[<>]/g, ' ').trim() || ''
        const oneClick = /LIST-UNSUBSCRIBE-POST:\s*List-Unsubscribe=One-Click/i.test(raw)
        if (!hdr) return { found: false, method: '', detail: 'no List-Unsubscribe header' }
        const https = hdr.match(/https?:\/\/[^\s,>]+/)?.[0]
        const mailto = hdr.match(/mailto:[^\s,>]+/)?.[0]
        if (https) {
          const res = await fetch(https, oneClick
            ? { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'List-Unsubscribe=One-Click' }
            : { method: 'GET', redirect: 'follow' })
          return { found: true, method: oneClick ? 'https-one-click' : 'https', detail: `HTTP ${res.status}` }
        }
        if (mailto) {
          const [addr, qs] = mailto.slice(7).split('?')
          const p = new URLSearchParams(qs || '')
          const msg = buildRfc822({ from: cfg.user, to: [decodeURIComponent(addr)], subject: p.get('subject') || 'unsubscribe', body: 'unsubscribe' })
          await new Smtp(cfg).send(msg, [decodeURIComponent(addr)])
          return { found: true, method: 'mailto', detail: `sent to ${addr}` }
        }
        return { found: false, method: '', detail: `unparseable header: ${hdr.slice(0, 120)}` }
      } finally { im.close() }
    },
    presentCall: (a) => ({ card: 'generic', title: '退订邮件', kind: 'other', rawInput: a }),
  }))

  // 敏感写动作挂官方审批缝：pre-execute 瀑布返回 ask，由宿主 approval 服务向人确认；
  // 无审批答者（service 级调用/无 UI）按 fail-closed 拒绝。
  ctx.on('tools/pre-execute', async (exec, next) => {
    if (!SENSITIVE_TOOLS.has(exec.name)) return next()
    return {
      kind: 'ask',
      reason: `mail connector sensitive action "${exec.name}"`,
      displayReason: {
        en: `Allow ${exec.name} (${exec.name === 'mail_send' ? 'send mail' : 'unsubscribe'})?`,
        zh: `允许执行 ${exec.name === 'mail_send' ? '发送邮件' : '邮件退订'}（${exec.name}）？`,
      },
    }
  })

  ctx.effect(() => ctx.skills.registerProvider(() => createSkillProvider(ctx)))
}
