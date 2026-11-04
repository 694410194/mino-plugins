/**
 * mino-connector-bills —— 跨生态消费账单连接器（warroom D38/D41，连接器生产线首件）。
 *
 * 形态：cordis 插件 + vendored CLI（double-entry-generator, Apache-2.0）+ 随包年度报告 skill。
 * 三原则：只读（不写用户数据源）、本地（原始数据不出本机）、用户主动（文件路径用户给）。
 *
 * 工具 bills_import：把支付宝/微信官方导出的账单文件转成统一账目（beancount）+
 * 一份分类汇总 markdown，产物写回源文件旁边（<文件名>.beancount / .summary.md）。
 */
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { existsSync, statSync, readFileSync, writeFileSync, mkdtempSync, readdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, dirname, basename, extname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { readdir, readFile } from 'node:fs/promises'
import { loadHostDeps } from './hostdeps.mjs'

const execFileP = promisify(execFile)
const PKG_DIR = dirname(fileURLToPath(import.meta.url))
const PKG = JSON.parse(readFileSync(join(PKG_DIR, 'package.json'), 'utf8'))
const DEG = join(PKG_DIR, 'vendor', 'double-entry-generator.exe')
const PROFILES = {
  alipay: join(PKG_DIR, 'vendor', 'profiles', 'alipay.yaml'),
  wechat: join(PKG_DIR, 'vendor', 'profiles', 'wechat.yaml'),
}
const SKILLS_DIR = join(PKG_DIR, 'skills')
const MAX_INPUT = 64 * 1024 * 1024
const DEG_AVAILABLE = process.platform === 'win32' && existsSync(DEG)

export const name = PKG.name
export const inject = ['skills', 'tools']

const hostDeps = await loadHostDeps()
const defineTool = hostDeps.defineTool
try { for (const n of hostDeps.notes || []) console.warn(`[connector-bills] ${n}`) } catch {}

export function apply(ctx) {
  ctx.tools.register(defineTool({
    name: 'bills_import',
    description:
      '把用户从支付宝/微信官方导出的账单文件（.csv/.xlsx/.zip）解析成统一账目。' +
      '纯本地运行，数据不出本机。在源文件旁边生成两份产物：<文件名>.beancount（全量复式账目）' +
      '和 <文件名>.summary.md（分类/月度/大额汇总）。返回汇总数字与产物路径。',
    parameters: {
      path: { type: 'string', required: true, description: '账单导出文件的绝对路径（支付宝/微信官方导出的 .csv/.xlsx/.zip）' },
      provider: { type: 'string', description: '账单来源：alipay / wechat / auto（默认 auto，按文件头自动识别）' },
      rules: { type: 'string', description: '可选：自定义分类规则 YAML 绝对路径（double-entry-generator 规则格式）' },
    },
    output: {
      schema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          file: { type: 'string' },
          provider: { type: 'string' },
          beancountFile: { type: 'string' },
          summaryFile: { type: 'string' },
          entries: { type: 'integer' },
          unclassified: { type: 'integer' },
          dateRange: { type: 'string' },
          totalExpense: { type: 'number' },
          totalIncome: { type: 'number' },
          currency: { type: 'string' },
          months: { type: 'object', additionalProperties: true },
          topCategories: { type: 'object', additionalProperties: true },
          topPayees: { type: 'object', additionalProperties: true },
        },
      },
      render: (_args, v) => [{ type: 'text', text:
        `账单已解析（${v.provider}）：${v.entries} 条，支出 ${fmt(v.totalExpense)} / 收入 ${fmt(v.totalIncome)}，` +
        `区间 ${v.dateRange}，未分类 ${v.unclassified} 条。产物：${v.beancountFile} 与 ${v.summaryFile}` }],
    },
    isConcurrencySafe: () => false,
    async execute(args) {
      const input = resolve(String(args.path ?? '').trim())
      if (!input || !existsSync(input)) throw new Error(`bills_import: 文件不存在：${input}`)
      if (statSync(input).size > MAX_INPUT) throw new Error('bills_import: 文件超过 64MB 上限')

      let billFile = input
      const ext = extname(input).toLowerCase()
      if (ext === '.zip') billFile = await extractZip(input)

      const provider = normalizeProvider(args.provider) ?? detectProvider(billFile)
      if (!provider) throw new Error('bills_import: 认不出账单来源，请用 provider 参数指定 alipay 或 wechat')
      if (!PROFILES[provider]) throw new Error(`bills_import: 暂不支持 ${provider}（当前支持 alipay/wechat）`)

      const rulesFile = args.rules ? resolve(String(args.rules)) : PROFILES[provider]
      if (args.rules && !existsSync(rulesFile)) throw new Error(`bills_import: 规则文件不存在：${rulesFile}`)

      const dir = dirname(billFile)
      const stem = basename(billFile, extname(billFile))
      const beanFile = join(dir, `${stem}.beancount`)
      const argv = ['translate', billFile, '-p', provider, '--config', rulesFile, '-o', beanFile]
      if (provider === 'wechat') argv.push('--ignore-invalid-tx-types')
      try {
        await execFileP(DEG, argv, { timeout: 120000, maxBuffer: 8 * 1024 * 1024, windowsHide: true })
      } catch (e) {
        const tail = String(e?.stderr || e?.stdout || e?.message || '').trim().split('\n').slice(-5).join('\n')
        throw new Error(`bills_import: 解析失败（${tail || '上游退出码非零'}）`)
      }
      if (!existsSync(beanFile)) throw new Error('bills_import: 解析完成但未产出账目文件')

      const bean = readFileSync(beanFile, 'utf8')
      const stats = summarize(bean)
      const summaryFile = join(dir, `${stem}.summary.md`)
      writeFileSync(summaryFile, renderSummary(stats, provider, billFile), 'utf8')
      return { file: billFile, provider, beancountFile: beanFile, summaryFile, ...stats }
    },
    presentCall: (args) => ({ card: 'generic', title: '解析账单文件', kind: 'other', rawInput: args }),
  }), {
    when: () => DEG_AVAILABLE,
  })

  ctx.tools.register(defineTool({
    name: 'bills_subscriptions',
    description:
      '在已解析的 .beancount 账目里找出疑似订阅扣费：同一收款方、相近金额、' +
      '出现在 3 个及以上不同月份的周期性扣款（如视频会员/iCloud/音乐包）。' +
      '先用 bills_import 生成账目，再把 .beancount 路径传进来。',
    parameters: {
      path: { type: 'string', required: true, description: 'bills_import 产出的 .beancount 文件绝对路径' },
      minMonths: { type: 'integer', description: '至少出现在多少个不同月份（默认 3）' },
    },
    output: {
      schema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          subscriptions: { type: 'array', items: { type: 'object', additionalProperties: true } },
          monthlyTotal: { type: 'number' },
        },
      },
      render: (_a, v) => [{ type: 'text', text:
        `疑似订阅 ${v.subscriptions.length} 项，每月合计约 ${fmt(v.monthlyTotal)}` }],
    },
    isConcurrencySafe: () => true,
    async execute(args) {
      const file = resolve(String(args.path ?? '').trim())
      if (!file || !existsSync(file)) throw new Error(`bills_subscriptions: 文件不存在：${file}（先用 bills_import 生成账目）`)
      const minMonths = Math.max(2, Number.isFinite(+args.minMonths) ? +args.minMonths : 3)
      return findSubscriptions(readFileSync(file, 'utf8'), minMonths)
    },
    presentCall: (args) => ({ card: 'generic', title: '找订阅扣费', kind: 'other', rawInput: args }),
  }), {
    when: () => DEG_AVAILABLE,
  })

  ctx.effect(() => ctx.skills.registerProvider(() => createSkillProvider(ctx)))
}

// ── 订阅识别：同收款方+相近金额，跨 ≥minMonths 个不同月份 ─────────────────────
function findSubscriptions(bean, minMonths) {
  const entries = []
  let cur = null
  for (const line of bean.split('\n')) {
    const m = line.match(/^(\d{4})-(\d{2})-(\d{2}) \* "([^"]*)"(?:\s+"([^"]*)")?/)
    if (m) { if (cur) entries.push(cur); cur = { date: m[0].slice(0, 10), payee: m[4] || m[5] || '', postings: [] }; continue }
    const p = line.match(/^\s+([A-Za-z]+(?::[A-Za-z0-9:_-]+)*)\s+(-?[\d,]+(?:\.\d+)?)\s+([A-Z]{3})\s*$/)
    if (cur && p) { cur.postings.push({ account: p[1], amount: parseFloat(p[2].replace(/,/g, '')), currency: p[3] }); continue }
    if (cur && /^\S/.test(line)) { entries.push(cur); cur = null }
  }
  if (cur) entries.push(cur)

  const groups = new Map()
  for (const e of entries) {
    let spent = 0
    for (const po of e.postings) if (po.account.startsWith('Expenses:')) spent += po.amount
    if (spent <= 0 || !e.payee) continue
    const key = e.payee
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push({ month: e.date.slice(0, 7), amount: spent })
  }

  const subs = []
  let monthlyTotal = 0
  for (const [payee, list] of groups) {
    // 按相近金额聚类（±10%）
    const clusters = []
    for (const { month, amount } of list) {
      const c = clusters.find(c => Math.abs(c.avg - amount) <= Math.max(0.5, c.avg * 0.1))
      if (c) { c.months.add(month); c.count++; c.total += amount; c.avg = c.total / c.count; c.lastMonth = month > c.lastMonth ? month : c.lastMonth }
      else clusters.push({ avg: amount, total: amount, count: 1, months: new Set([month]), lastMonth: month })
    }
    for (const c of clusters) {
      if (c.months.size < minMonths) continue
      const monthly = round2(c.avg)
      monthlyTotal += monthly
      subs.push({ payee, 每月约: monthly, 出现月数: c.months.size, 最近扣款月: c.lastMonth, 月份: [...c.months].sort() })
    }
  }
  subs.sort((a, b) => b.每月约 - a.每月约)
  return { subscriptions: subs, monthlyTotal: round2(monthlyTotal) }
}

// ── provider 识别与 zip ──────────────────────────────────────────────────────
function normalizeProvider(p) {
  const s = String(p ?? 'auto').toLowerCase()
  if (s === 'auto' || s === '') return null
  if (s === 'alipay' || s === 'zhifubao') return 'alipay'
  if (s === 'wechat' || s === 'weixin' || s === 'wx') return 'wechat'
  return s
}

function detectProvider(file) {
  const head = readFileSync(file).subarray(0, 8192)
  for (const enc of ['utf8', 'gb18030']) {
    let text = ''
    try { text = new TextDecoder(enc).decode(head) } catch { continue }
    if (/微信支付账单明细|微信昵称/.test(text)) return 'wechat'
    if (/支付宝|交易号|商家订单号/.test(text)) return 'alipay'
  }
  return null
}

async function extractZip(zipPath) {
  const dest = mkdtempSync(join(tmpdir(), 'bills-zip-'))
  try {
    await execFileP('powershell.exe', ['-NoProfile', '-Command',
      `Expand-Archive -LiteralPath ${psq(zipPath)} -DestinationPath ${psq(dest)} -Force`],
      { timeout: 60000, windowsHide: true })
  } catch {
    throw new Error('bills_import: zip 解不开（带密码的压缩包请先手动解压，再把里面的 .csv 给我）')
  }
  const csv = walk(dest).find((f) => /\.(csv|xlsx)$/i.test(f))
  if (!csv) throw new Error('bills_import: 压缩包里没找到 .csv/.xlsx 账单文件')
  return csv
}

function walk(dir) {
  const out = []
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name)
    if (e.isDirectory()) out.push(...walk(p)); else out.push(p)
  }
  return out
}

const psq = (s) => `'${String(s).replace(/'/g, "''")}'`

// ── beancount → 汇总 ─────────────────────────────────────────────────────────
function summarize(bean) {
  const entries = []
  let cur = null
  for (const line of bean.split('\n')) {
    const m = line.match(/^(\d{4})-(\d{2})-(\d{2}) \* "([^"]*)"(?:\s+"([^"]*)")?/)
    if (m) {
      if (cur) entries.push(cur)
      cur = { date: m[0].slice(0, 10), payee: m[4] || m[5] || '', postings: [] }
      continue
    }
    const p = line.match(/^\s+([A-Za-z]+(?::[A-Za-z0-9:_-]+)*)\s+(-?[\d,]+(?:\.\d+)?)\s+([A-Z]{3})\s*$/)
    if (cur && p) {
      cur.postings.push({ account: p[1], amount: parseFloat(p[2].replace(/,/g, '')), currency: p[3] })
      continue
    }
    if (cur && /^\S/.test(line)) { entries.push(cur); cur = null }
  }
  if (cur) entries.push(cur)

  let totalExpense = 0, totalIncome = 0, unclassified = 0
  const months = {}, cats = {}, payees = {}, curr = {}
  let min = '9999', max = '0000'
  for (const e of entries) {
    if (e.date < min) min = e.date
    if (e.date > max) max = e.date
    const month = e.date.slice(0, 7)
    let fixme = false, spent = 0
    for (const po of e.postings) {
      curr[po.currency] = true
      if (po.account.startsWith('Expenses:')) {
        totalExpense += po.amount
        spent += po.amount
        const cat = po.account.split(':')[1] || '其他'
        cats[cat] = (cats[cat] || 0) + po.amount
        months[month] = (months[month] || 0) + po.amount
        if (po.account.includes('FIXME')) fixme = true
      } else if (po.account.startsWith('Income:')) {
        totalIncome -= po.amount
        if (po.account.includes('FIXME')) fixme = true
      }
    }
    if (fixme) unclassified++
    if (spent > 0 && e.payee) payees[e.payee] = (payees[e.payee] || 0) + spent
  }
  return {
    entries: entries.length,
    unclassified,
    dateRange: entries.length ? `${min} ~ ${max}` : '',
    totalExpense: round2(totalExpense),
    totalIncome: round2(totalIncome),
    currency: Object.keys(curr)[0] || 'CNY',
    months: sortObj(months),
    topCategories: topObj(cats, 12),
    topPayees: topObj(payees, 10),
  }
}

const round2 = (n) => Math.round(n * 100) / 100
const fmt = (n) => `¥${round2(n).toLocaleString('zh-CN')}`
const topObj = (o, n) => Object.fromEntries(Object.entries(o).sort((a, b) => b[1] - a[1]).slice(0, n).map(([k, v]) => [k, round2(v)]))
const sortObj = (o) => Object.fromEntries(Object.entries(o).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => [k, round2(v)]))

function renderSummary(s, provider, file) {
  const lines = [
    `# 账单汇总（${provider === 'alipay' ? '支付宝' : '微信支付'}）`,
    '',
    `- 源文件：${file}`,
    `- 区间：${s.dateRange}　共 ${s.entries} 条　未分类 ${s.unclassified} 条`,
    `- 总支出：**${fmt(s.totalExpense)}**　总收入：**${fmt(s.totalIncome)}**（${s.currency}）`,
    '',
    '## 支出分类 TOP12',
    '',
    ...Object.entries(s.topCategories).map(([k, v]) => `- ${k}：${fmt(v)}`),
    '',
    '## 月度支出',
    '',
    ...Object.entries(s.months).map(([k, v]) => `- ${k}：${fmt(v)}`),
    '',
    '## 大额去向 TOP10',
    '',
    ...Object.entries(s.topPayees).map(([k, v]) => `- ${k}：${fmt(v)}`),
    '',
  ]
  return lines.join('\n')
}

// ── skill provider（与 templates/skill-pack/index.js 逐字一致的缝实现）──
const RANK = 650
const NAME_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

function createSkillProvider(ctx) {
  const warn = (msg) => ctx.logger?.warn(msg)
  return {
    name: PKG.name,
    async list(options = {}) {
      let entries
      try { entries = await readdir(SKILLS_DIR, { withFileTypes: true }) }
      catch (e) { if (e?.code === 'ENOENT') return []; throw e }
      const candidates = []
      for (const entry of entries) {
        options.signal?.throwIfAborted?.()
        const file = entry.isDirectory()
          ? join(SKILLS_DIR, entry.name, 'SKILL.md')
          : entry.isFile() && entry.name.endsWith('.md')
            ? join(SKILLS_DIR, entry.name)
            : undefined
        if (!file) continue
        const parsed = await parseSkillFile(file, options.signal, warn)
        if (parsed) candidates.push(toCandidate(parsed, file))
      }
      return candidates
    },
    async get(candidate, options = {}) {
      const parsed = await parseSkillFile(candidate.locator, options.signal, warn)
      if (!parsed || parsed.name !== candidate.name) return undefined
      return {
        name: parsed.name,
        description: parsed.description,
        ...(parsed.whenToUse !== undefined ? { whenToUse: parsed.whenToUse } : {}),
        invocation: parsed.invocation,
        source: 'market',
        provider: PKG.name,
        resourceBase: { kind: 'directory', path: dirname(candidate.locator) },
        ...(parsed.metadata !== undefined ? { metadata: parsed.metadata } : {}),
        content: parsed.content,
      }
    },
  }
}

function toCandidate(parsed, file) {
  return {
    name: parsed.name,
    description: parsed.description,
    ...(parsed.whenToUse !== undefined ? { whenToUse: parsed.whenToUse } : {}),
    invocation: parsed.invocation,
    source: 'market',
    provider: PKG.name,
    resourceBase: { kind: 'directory', path: dirname(file) },
    ...(parsed.metadata !== undefined ? { metadata: parsed.metadata } : {}),
    rank: RANK,
    locator: file,
  }
}

async function parseSkillFile(file, signal, warn) {
  let raw
  try { raw = await readFile(file, 'utf8') } catch { return undefined }
  signal?.throwIfAborted?.()
  const parsed = parseFrontmatter(raw)
  if (!parsed) { warn(`skill file ${file} ignored: missing frontmatter`); return undefined }
  const { data, body } = parsed
  const name = str(data.name)
  const description = str(data.description)
  if (!name || !description) { warn(`skill file ${file} ignored: frontmatter requires name and description`); return undefined }
  if (!NAME_RE.test(name)) { warn(`skill file ${file} ignored: invalid skill name "${name}"`); return undefined }
  return {
    name,
    description,
    ...(str(data.whenToUse) !== undefined ? { whenToUse: str(data.whenToUse) } : {}),
    invocation: { modelInvocable: !(data['disable-model-invocation'] === true), userInvocable: data['user-invocable'] !== false },
    ...(data.metadata && typeof data.metadata === 'object' ? { metadata: data.metadata } : {}),
    content: body.trim(),
  }
}

function str(value) {
  return typeof value === 'string' && value.trim() ? value : undefined
}

function parseFrontmatter(text) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(text)
  if (!match) return undefined
  return { data: parseFlatYaml(match[1]), body: text.slice(match[0].length) }
}

function parseFlatYaml(src) {
  const data = {}
  let section
  for (const line of src.split(/\r?\n/)) {
    if (!line.trim() || line.trimStart().startsWith('#')) continue
    const indent = line.length - line.trimStart().length
    const match = /^([A-Za-z0-9_-]+)\s*:\s*(.*)$/.exec(line.trim())
    if (!match) continue
    const [, key, raw] = match
    const value = parseScalar(raw)
    if (indent > 0 && section) {
      if (typeof data[section] !== 'object' || data[section] === null) data[section] = {}
      data[section][key] = value
      continue
    }
    if (value === undefined) { section = key; data[key] = {} }
    else { data[key] = value; section = undefined }
  }
  return data
}

function parseScalar(raw) {
  const value = raw.trim()
  if (value === '') return undefined
  if (value.startsWith('"') && value.endsWith('"') && value.length >= 2) return value.slice(1, -1)
  if (value.startsWith("'") && value.endsWith("'") && value.length >= 2) return value.slice(1, -1)
  const bare = value.replace(/\s+#.*$/, '')
  if (bare === 'true') return true
  if (bare === 'false') return false
  if (bare === 'null' || bare === '~') return null
  return bare
}
