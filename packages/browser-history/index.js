/**
 * mino-connector-browser-history —— 浏览器历史连接器（conn-browser 域）。
 *
 * 只读本机 Chromium/Firefox 的浏览记录库（复制到临时目录后只读查询，
 * 浏览器开着也能读）。零依赖：用 Node 内置 node:sqlite（>=22.13），
 * 运行时没有 sqlite 时工具不注册，插件照常装载。
 * 三原则：只读 / 本地 / 用户主动（可传 path 指自己的库文件）。
 */
import { existsSync, statSync, readFileSync, mkdtempSync, copyFileSync, readdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, dirname, basename } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadHostDeps } from './hostdeps.mjs'

const PKG_DIR = dirname(fileURLToPath(import.meta.url))
const PKG = JSON.parse(readFileSync(join(PKG_DIR, 'package.json'), 'utf8'))
const SKILLS_DIR = join(PKG_DIR, 'skills')

// node:sqlite 在 Node 24 自带；Electron 宿主若没有则整套工具不注册
let DatabaseSync = null
try { ({ DatabaseSync } = await import('node:sqlite')) } catch { /* 运行时无 sqlite */ }
const SQLITE_OK = !!DatabaseSync

export const name = PKG.name
export const inject = ['skills', 'tools']

const hostDeps = await loadHostDeps()
const defineTool = hostDeps.defineTool

// ── 浏览器库定位 ──────────────────────────────────────────────────────────────
const L = process.env.LOCALAPPDATA || ''
const R = process.env.APPDATA || ''

function chromiumCandidates() {
  const roots = [
    ['chrome', join(L, 'Google', 'Chrome', 'User Data')],
    ['edge', join(L, 'Microsoft', 'Edge', 'User Data')],
    ['brave', join(L, 'BraveSoftware', 'Brave-Browser', 'User Data')],
  ]
  const out = []
  for (const [name, root] of roots) {
    for (const prof of profilesOf(root)) {
      const db = join(prof, 'History')
      if (existsSync(db)) out.push({ browser: name, engine: 'chromium', db })
    }
  }
  return out
}

function firefoxCandidates() {
  const root = join(R, 'Mozilla', 'Firefox', 'Profiles')
  const out = []
  for (const prof of profilesOf(root)) {
    const db = join(prof, 'places.sqlite')
    if (existsSync(db)) out.push({ browser: 'firefox', engine: 'firefox', db })
  }
  return out
}

function profilesOf(root) {
  try {
    return readdirSync(root, { withFileTypes: true })
      .filter(e => e.isDirectory() && (e.name === 'Default' || e.name.startsWith('Profile') || e.name.includes('.')))
      .map(e => join(root, e.name))
  } catch { return [] }
}

function allCandidates() {
  return [...chromiumCandidates(), ...firefoxCandidates()]
}

function pickBrowser(arg, customPath) {
  if (customPath) {
    const db = resolveUserPath(customPath)
    if (!existsSync(db)) throw new Error(`browser_history: 找不到库文件 ${db}`)
    const engine = /places\.sqlite$/i.test(db) ? 'firefox' : 'chromium'
    return { browser: 'custom', engine, db }
  }
  const want = String(arg || 'auto').toLowerCase()
  const cands = allCandidates()
  if (!cands.length) throw new Error('browser_history: 没在本机找到 Chrome/Edge/Firefox/Brave 的历史库（可用 path 参数指定库文件）')
  if (want === 'auto') {
    cands.sort((a, b) => statSync(b.db).mtimeMs - statSync(a.db).mtimeMs)
    return cands[0]
  }
  const hit = cands.find(c => c.browser === want)
  if (!hit) throw new Error(`browser_history: 本机没有 ${want} 的历史库（现有：${[...new Set(cands.map(c => c.browser))].join('、')}）`)
  return hit
}

const resolveUserPath = (p) => join(String(p).replace(/^~/, process.env.USERPROFILE || ''))

// 浏览器锁库：先复制（连同 WAL）到临时目录再读
function snapshotDb(src) {
  const dir = mkdtempSync(join(tmpdir(), 'bhist-'))
  const dst = join(dir, basename(src))
  copyFileSync(src, dst)
  for (const ext of ['-wal', '-shm']) {
    try { copyFileSync(src + ext, dst + ext) } catch { /* 无 wal 就跳 */ }
  }
  return dst
}

const CHROME_EPOCH_US = 11644473600000000n // 1601-01-01 → unix epoch 微秒差

function openDb(path) {
  const db = new DatabaseSync(path, { open: true, readOnly: true })
  return db
}

function queryRecent(engine, db, { days, limit, q }) {
  const like = q ? `%${q}%` : null
  if (engine === 'firefox') {
    const sql = `SELECT p.url, p.title, CAST(v.visit_date AS REAL) AS t FROM moz_historyvisits v
      JOIN moz_places p ON p.id = v.place_id
      WHERE p.url LIKE 'http%' ${like ? 'AND (p.url LIKE ? OR p.title LIKE ?)' : ''}
      ORDER BY v.visit_date DESC LIMIT ?`
    const rows = db.prepare(sql).all(...(like ? [like, like, limit * 4] : [limit * 4]))
    const cutoff = days > 0 ? Date.now() - days * 864e5 : 0
    return rows.map(r => ({ url: r.url, title: r.title, time: Math.round(Number(r.t) / 1000) }))
      .filter(r => r.time >= cutoff).slice(0, limit)
  }
  const sql = `SELECT u.url, u.title, CAST(v.visit_time AS REAL) AS t FROM visits v
    JOIN urls u ON u.id = v.url
    WHERE u.url LIKE 'http%' ${like ? 'AND (u.url LIKE ? OR u.title LIKE ?)' : ''}
    ORDER BY v.visit_time DESC LIMIT ?`
  const rows = db.prepare(sql).all(...(like ? [like, like, limit * 4] : [limit * 4]))
  const cutoff = days > 0 ? Date.now() - days * 864e5 : 0
  return rows.map(r => ({ url: r.url, title: r.title, time: Math.round((Number(r.t) - Number(CHROME_EPOCH_US)) / 1000) }))
    .filter(r => r.time >= cutoff).slice(0, limit)
}

function queryTop(engine, db, { days, limit }) {
  if (engine === 'firefox') {
    const cutoffUs = days > 0 ? (Date.now() - days * 864e5) * 1000 : 0
    const sql = `SELECT p.rev_host AS rh, COUNT(*) AS c FROM moz_historyvisits v
      JOIN moz_places p ON p.id = v.place_id
      WHERE p.url LIKE 'http%' AND v.visit_date >= ?
      GROUP BY rh ORDER BY c DESC LIMIT ?`
    const rows = db.prepare(sql).all(cutoffUs, limit * 3)
    return rows.map(r => ({ site: [...r.rh].reverse().join(''), visits: r.c })).filter(r => r.site).slice(0, limit)
  }
  const cutoffUs = days > 0 ? BigInt(Date.now() - days * 864e5) * 1000n + CHROME_EPOCH_US : 0n
  const sql = `SELECT u.url, COUNT(*) AS c FROM visits v
    JOIN urls u ON u.id = v.url
    WHERE u.url LIKE 'http%' AND v.visit_time >= ?
    GROUP BY u.url ORDER BY c DESC LIMIT ?`
  const rows = db.prepare(sql).all(cutoffUs, limit * 20)
  const sites = {}
  for (const r of rows) {
    try {
      const host = new URL(r.url).hostname.replace(/^www\./, '')
      sites[host] = (sites[host] || 0) + r.c
    } catch { /* bad url */ }
  }
  return Object.entries(sites).sort((a, b) => b[1] - a[1]).slice(0, limit)
    .map(([site, visits]) => ({ site, visits }))
}

function fmtTime(ms) {
  const d = new Date(ms)
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
}

export function apply(ctx) {
  ctx.tools.register(defineTool({
    name: 'browser_history_recent',
    description:
      '查用户本机浏览器最近看过什么（标题+网址+时间）。只读本地历史库，支持 chrome/edge/firefox/brave' +
      '或传 path 指定库文件。可配 days 限制天数、q 关键词过滤。数据不出本机。',
    parameters: {
      browser: { type: 'string', description: 'chrome/edge/firefox/brave/auto（默认 auto，选最近有记录的那个）' },
      days: { type: 'integer', description: '只看最近 N 天，0=不限（默认 7）' },
      limit: { type: 'integer', description: '最多返回多少条（默认 30，上限 200）' },
      q: { type: 'string', description: '可选关键词，按网址/标题模糊过滤' },
      path: { type: 'string', description: '可选：直接指定历史库文件路径（Chromium=History，Firefox=places.sqlite）' },
    },
    output: {
      schema: {
        type: 'object', additionalProperties: false,
        properties: {
          browser: { type: 'string' },
          visits: { type: 'array', items: { type: 'object', additionalProperties: true } },
          count: { type: 'integer' },
        },
      },
      render: (_a, v) => [{ type: 'text', text: `${v.browser} 最近 ${v.count} 条浏览记录` }],
    },
    isConcurrencySafe: () => true,
    async execute(args) {
      const sel = pickBrowser(args.browser, args.path)
      const db = openDb(snapshotDb(sel.db))
      try {
        const days = num(args.days, 7), limit = Math.min(num(args.limit, 30), 200)
        const rows = queryRecent(sel.engine, db, { days, limit, q: args.q })
        return {
          browser: sel.browser,
          count: rows.length,
          visits: rows.map(r => ({ time: fmtTime(r.time), title: r.title || '', url: r.url })),
        }
      } finally { db.close() }
    },
    presentCall: (args) => ({ card: 'generic', title: '查最近浏览记录', kind: 'other', rawInput: args }),
  }), { when: () => SQLITE_OK })

  ctx.tools.register(defineTool({
    name: 'browser_history_top',
    description:
      '统计用户本机浏览器最常去的站点（按访问次数排）。只读本地历史库，' +
      '支持 days 限定统计范围。适合做上网习惯回顾、找常去但忘了收藏的网站。',
    parameters: {
      browser: { type: 'string', description: 'chrome/edge/firefox/brave/auto（默认 auto）' },
      days: { type: 'integer', description: '统计最近 N 天，0=全部历史（默认 30）' },
      limit: { type: 'integer', description: '最多返回多少个站点（默认 20，上限 100）' },
      path: { type: 'string', description: '可选：直接指定历史库文件路径' },
    },
    output: {
      schema: {
        type: 'object', additionalProperties: false,
        properties: {
          browser: { type: 'string' },
          days: { type: 'integer' },
          sites: { type: 'array', items: { type: 'object', additionalProperties: true } },
        },
      },
      render: (_a, v) => [{ type: 'text', text: `${v.browser} 近 ${v.days} 天常去站点 TOP${v.sites.length}` }],
    },
    isConcurrencySafe: () => true,
    async execute(args) {
      const sel = pickBrowser(args.browser, args.path)
      const db = openDb(snapshotDb(sel.db))
      try {
        const days = num(args.days, 30), limit = Math.min(num(args.limit, 20), 100)
        const sites = queryTop(sel.engine, db, { days, limit })
        return { browser: sel.browser, days, sites }
      } finally { db.close() }
    },
    presentCall: (args) => ({ card: 'generic', title: '统计常去站点', kind: 'other', rawInput: args }),
  }), { when: () => SQLITE_OK })

  ctx.effect(() => ctx.skills.registerProvider(() => createSkillProvider(ctx)))
}

const num = (v, d) => Number.isFinite(+v) ? +v : d

// ── skill provider（与 templates/skill-pack/index.js 同一实现，勿手写变形）──
import { readdir, readFile } from 'node:fs/promises'
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
