/**
 * mino-connector-portfolio —— 行情/持仓连接器（conn-finance 域）。
 *
 * 公开行情接口（腾讯 qt.gtimg.cn / 东方财富 fundgz）查实时价，
 * 零凭据；持仓清单由用户给（参数或 CSV 文件），盈亏本地算。
 * 隐私口径：只有证券代码发给公共行情接口，持仓数量/成本不出本机。
 */
import { readFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { readdir, readFile } from 'node:fs/promises'
import { loadHostDeps } from './hostdeps.mjs'

const PKG_DIR = dirname(fileURLToPath(import.meta.url))
const PKG = JSON.parse(readFileSync(join(PKG_DIR, 'package.json'), 'utf8'))
const SKILLS_DIR = join(PKG_DIR, 'skills')

export const name = PKG.name
export const inject = ['skills', 'tools']

const hostDeps = await loadHostDeps()
const defineTool = hostDeps.defineTool

const UA = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Mino/1.0', 'Referer': 'https://finance.qq.com' }

// ── 代码规整：sh600519 / sz000001 / bj430047 / 110022(基金) ──────────────────
function normalize(code) {
  const c = String(code).trim().toLowerCase().replace(/[.\s]/g, '')
  if (/^(sh|sz|bj)\d{6}$/.test(c)) return { kind: 'stock', code: c }
  if (/^\d{6}$/.test(c)) {
    if (/^(60|68|9)/.test(c)) return { kind: 'stock', code: 'sh' + c }
    if (/^(0|3|2)/.test(c)) return { kind: 'stock', code: 'sz' + c }
    if (/^(4|8)/.test(c)) return { kind: 'stock', code: 'bj' + c }
    return { kind: 'fund', code: c }
  }
  if (/^(hk|us)/.test(c)) return { kind: 'stock', code: c }
  return null
}

// ── 腾讯行情：qt.gtimg.cn/q=sh600519（GBK 文本，~ 分隔字段）───────────────────
async function fetchQuotes(codes) {
  const url = `https://qt.gtimg.cn/q=${codes.join(',')}`
  const res = await fetch(url, { headers: UA, signal: AbortSignal.timeout(12000) })
  const buf = Buffer.from(await res.arrayBuffer())
  const text = new TextDecoder('gb18030').decode(buf)
  const out = {}
  for (const m of text.matchAll(/v_([a-z]{2}\d{6}|hk\d+|us[a-zA-Z.]+)="([^"]*)"/g)) {
    const f = m[2].split('~')
    if (f.length < 40) continue
    out[m[1]] = {
      name: f[1], price: +f[3], prevClose: +f[4], open: +f[5],
      pct: +(f[32] || 0), high: +f[33], low: +f[34], time: `${f[30] || ''}`,
    }
  }
  return out
}

// ── 东方财富基金最新净值：api.fund.eastmoney.com/f10/lsjz（fundgz 估值接口已变）──
async function fetchFund(code) {
  const res = await fetch(`https://api.fund.eastmoney.com/f10/lsjz?fundCode=${code}&pageIndex=1&pageSize=1`, {
    headers: { ...UA, Referer: 'https://fundf10.eastmoney.com/' }, signal: AbortSignal.timeout(12000) })
  const j = await res.json().catch(() => null)
  const row = j?.Data?.LSJZList?.[0]
  if (!row) return null
  let name = ''
  try {
    const page = await fetch(`https://fund.eastmoney.com/${code}.html`, { headers: UA, signal: AbortSignal.timeout(8000) })
    const html = await page.text()
    name = html.match(/<title>([^<(]+)/)?.[1]?.trim() || ''
  } catch { /* 名字拿不到就空着 */ }
  return { name, code, nav: +row.DWJZ, pct: +row.JZZZL, time: row.FSRQ || '', navType: '最新净值' }
}

async function quoteAll(codes) {
  const stocks = codes.filter(c => /^(sh|sz|bj|hk|us)/.test(c))
  const funds = codes.filter(c => /^\d{6}$/.test(c))
  const quotes = []
  if (stocks.length) {
    const q = await fetchQuotes(stocks)
    for (const c of stocks) if (q[c]) quotes.push({ kind: 'stock', code: c, ...q[c] })
  }
  for (const c of funds) {
    const f = await fetchFund(c).catch(() => null)
    if (f) quotes.push({ kind: 'fund', ...f })
  }
  return quotes
}

export function apply(ctx) {
  ctx.tools.register(defineTool({
    name: 'market_quote',
    description:
      '查股票/基金实时行情。代码支持 6 位数字（自动判沪深北/基金）或 sh600519/sz000001/bj430047 写法；' +
      '基金返回最新估值净值。一次可传多个。公共行情接口只收到证券代码，不含任何个人信息。',
    parameters: {
      codes: { type: 'array', items: { type: 'string' }, required: true, description: '证券代码列表，如 ["600519","sz000001","110022"]' },
    },
    output: {
      schema: {
        type: 'object', additionalProperties: false,
        properties: {
          quotes: { type: 'array', items: { type: 'object', additionalProperties: true } },
          failed: { type: 'array', items: { type: 'string' } },
        },
      },
      render: (_a, v) => [{ type: 'text', text: `${v.quotes.length} 只报价${v.failed.length ? `，${v.failed.length} 只未取到` : ''}` }],
    },
    isConcurrencySafe: () => true,
    async execute(args) {
      const raw = args.codes || []
      const items = raw.map(normalize)
      const failed = raw.filter((_, i) => !items[i]).map(String)
      const codes = items.filter(Boolean).map(i => i.code)
      const got = await quoteAll(codes)
      const gotSet = new Set(got.map(g => g.code))
      for (const c of codes) if (!gotSet.has(c)) failed.push(c)
      return { quotes: got, failed }
    },
    presentCall: (args) => ({ card: 'generic', title: '查行情', kind: 'other', rawInput: args }),
  }))

  ctx.tools.register(defineTool({
    name: 'market_portfolio',
    description:
      '算用户自己持仓的盈亏。holdings 传 [{code,shares,cost}]，或 file 传 CSV 路径' +
      '（列：code,shares,cost）。持仓数据只在本机算，公共行情接口只收到代码。',
    parameters: {
      holdings: { type: 'array', items: { type: 'object', additionalProperties: true }, description: '持仓列表 [{code,shares,cost}]' },
      file: { type: 'string', description: '可选：持仓 CSV 文件路径（列 code,shares,cost）' },
    },
    output: {
      schema: {
        type: 'object', additionalProperties: false,
        properties: {
          positions: { type: 'array', items: { type: 'object', additionalProperties: true } },
          totalValue: { type: 'number' },
          totalCost: { type: 'number' },
          totalPnl: { type: 'number' },
          totalPnlPct: { type: 'number' },
        },
      },
      render: (_a, v) => [{ type: 'text', text: `持仓市值 ¥${v.totalValue}，盈亏 ${v.totalPnl >= 0 ? '+' : ''}¥${v.totalPnl}（${v.totalPnlPct}%）` }],
    },
    isConcurrencySafe: () => true,
    async execute(args) {
      let holdings = args.holdings
      if (!holdings && args.file) {
        const f = String(args.file)
        if (!existsSync(f)) throw new Error(`market_portfolio: 文件不存在 ${f}`)
        holdings = parseHoldingsCsv(readFileSync(f, 'utf8'))
      }
      if (!Array.isArray(holdings) || !holdings.length) throw new Error('market_portfolio: 给 holdings 数组或 file CSV 路径')
      const codes = holdings.map(h => normalize(h.code)?.code).filter(Boolean)
      const quotes = await quoteAll(codes)
      const byCode = {}
      for (const q of quotes) byCode[q.code] = q
      let totalValue = 0, totalCost = 0
      const positions = []
      for (const h of holdings) {
        const n = normalize(h.code)
        const q = n && byCode[n.code]
        const shares = +h.shares || 0, cost = +h.cost || 0
        const price = q ? (q.price || q.nav) : null
        const value = price != null ? price * shares : null
        const costAll = cost * shares
        if (value != null) { totalValue += value; totalCost += costAll }
        positions.push({
          code: h.code, name: q?.name || '', shares, cost,
          price, value: value != null ? round2(value) : null,
          pnl: value != null ? round2(value - costAll) : null,
          pnlPct: costAll > 0 && value != null ? round2((value - costAll) / costAll * 100) : null,
        })
      }
      return {
        positions,
        totalValue: round2(totalValue), totalCost: round2(totalCost),
        totalPnl: round2(totalValue - totalCost),
        totalPnlPct: totalCost > 0 ? round2((totalValue - totalCost) / totalCost * 100) : 0,
      }
    },
    presentCall: (args) => ({ card: 'generic', title: '算持仓盈亏', kind: 'other', rawInput: args }),
  }))

  ctx.effect(() => ctx.skills.registerProvider(() => createSkillProvider(ctx)))
}

function parseHoldingsCsv(text) {
  const rows = []
  for (const line of text.split(/\r?\n/)) {
    const t = line.trim()
    if (!t || /^code/i.test(t)) continue
    const [code, shares, cost] = t.split(/[,\t]/).map(s => s.trim())
    if (code) rows.push({ code, shares: +shares || 0, cost: +cost || 0 })
  }
  return rows
}

const round2 = (n) => Math.round(n * 100) / 100

// ── skill provider（逐字抄 templates/skill-pack）──
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
        const file = entry.isDirectory() ? join(SKILLS_DIR, entry.name, 'SKILL.md')
          : entry.isFile() && entry.name.endsWith('.md') ? join(SKILLS_DIR, entry.name) : undefined
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

const str = (v) => typeof v === 'string' && v.trim() ? v : undefined

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
