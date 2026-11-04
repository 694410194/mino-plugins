/**
 * mino-connector-semsearch —— 语义检索层（矛层弹头）。
 * corpus v0 是 LIKE 关键词；本件把全部连接器语料编成向量索引：
 *   引擎 = llama-server（官方 release，engine-assist 可代办）跑中文 embedding（GGUF 模型按需下载）
 *   索引 = ~/.dsh/connector-semsearch/sem.db（int8 量化向量 + sha1 去重，纯 JS 余弦）
 * 支持用户自配 OpenAI 兼容 embedding 端点（~/.dsh/connector-semsearch.json），
 * 不配就走本地引擎——语料不出本机。
 */
import { execFile, spawn } from 'node:child_process'
import { promisify } from 'node:util'
import { existsSync, readFileSync, writeFileSync, mkdirSync, readdirSync, unlinkSync, renameSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { homedir } from 'node:os'
import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { loadHostDeps } from './hostdeps.mjs'
import { createSkillProvider } from './skill-provider.mjs'

const execFileP = promisify(execFile)
const PKG_DIR = dirname(fileURLToPath(import.meta.url))
const PKG = JSON.parse(readFileSync(join(PKG_DIR, 'package.json'), 'utf8'))
const DSH_HOME = process.env.DSH_HOME || join(homedir(), '.dsh')
const STORE = join(DSH_HOME, 'connector-semsearch')
const DB_PATH = join(STORE, 'sem.db')
const CFG_PATH = join(DSH_HOME, 'connector-semsearch.json')
const ENGINES_DIR = join(DSH_HOME, 'engines')
const REGISTRY = join(DSH_HOME, 'engines.json')
const PORT = 18321

export const name = PKG.name
export const inject = ['skills', 'tools']
const defineTool = (await loadHostDeps()).defineTool
let DatabaseSync = null
try { ({ DatabaseSync } = await import('node:sqlite')) } catch { }

// ── 语料源（与 connector-corpus 同一取数口径）─────────────────────────────────
const TABLES = {
  'orders.db': { orders: 'raw' }, 'contacts.db': { contacts: "name||' '||phone", messages: 'text' },
  'calendar.db': { events: "summary||' '||location" }, 'docs.db': { docs: 'text' },
  'gov.db': { gov: 'raw' }, 'edu.db': { edu: 'raw' }, 'jobs.db': { jobs: 'raw' },
  'car.db': { car: 'raw' }, 'meeting.db': { segs: 'txt' }, 'notes.db': { notes: "title||' '||text" },
  'vault.db': { entries: "name||' '||username||' '||url" }, 'ime.db': { words: 'word' },
  'chat.db': { messages: "sender||': '||text" }, 'matches.db': { matches: 'raw' }, 'health.db': { entries: 'raw' },
  'qzone.db': { posts: 'text' }, 'records.db': { records: "title||' '||text" },
  'companies.db': { companies: "name||' '||raw" }, 'company.db': { companies: "name||' '||raw" },
}

const MODELS = [
  'bge-small-zh-v1.5-q8_0.gguf', 'bge-small-zh-v1.5-f16.gguf', 'bge-small-zh-v1.5.gguf',
]
const MODEL_URLS = (f) => [
  `https://hf-mirror.com/CompendiumLabs/bge-small-zh-v1.5-gguf/resolve/main/${f}`,
  `https://www.modelscope.cn/models/CompendiumLabs/bge-small-zh-v1.5-gguf/resolve/master/${f}`,
]

function loadCfg() { try { return JSON.parse(readFileSync(CFG_PATH, 'utf8')) } catch { return {} } }
function loadRegistry() { try { return JSON.parse(readFileSync(REGISTRY, 'utf8')) } catch { return {} } }

function findExe(root, re) {
  const stack = [root]
  while (stack.length) {
    const d = stack.pop()
    let entries
    try { entries = readdirSync(d, { withFileTypes: true }) } catch { continue }
    for (const e of entries) {
      const p = join(d, e.name)
      if (e.isDirectory()) stack.push(p)
      else if (re.test(p)) return p
    }
  }
  return null
}

// ── embedding 后端 ────────────────────────────────────────────────────────────
let serverProc = null

async function findServerBin() {
  const reg = loadRegistry()['llama-server']
  if (reg && existsSync(reg)) return reg
  const dir = join(ENGINES_DIR, 'llama-server')
  if (existsSync(dir)) { const hit = findExe(dir, /llama-server\.exe$/i); if (hit) return hit }
  try { await execFileP('llama-server', ['--version'], { timeout: 8000, windowsHide: true }); return 'llama-server' } catch { }
  return null
}

async function download(url, dest, timeout = 600000) {
  const res = await fetch(url, { signal: AbortSignal.timeout(timeout), redirect: 'follow' })
  if (!res.ok) throw new Error(`下载失败 HTTP ${res.status}`)
  mkdirSync(dirname(dest), { recursive: true })
  writeFileSync(dest, Buffer.from(await res.arrayBuffer()))
  return dest
}

async function ghReleaseAsset(repo, match) {
  // 与 engine-assist 同逻辑：latest 可能是无二进制的版本化 tag，翻列表取首个匹配
  const res = await fetch(`https://api.github.com/repos/${repo}/releases?per_page=15`,
    { headers: { 'User-Agent': 'Mino/1.0', Accept: 'application/vnd.github+json' }, signal: AbortSignal.timeout(30000) })
  if (!res.ok) throw new Error(`GitHub release 查询失败 HTTP ${res.status}`)
  for (const rel of await res.json()) {
    const a = (rel.assets || []).find(x => match.test(x.name))
    if (a) return a.browser_download_url
  }
  throw new Error(`${repo} release 里没找到匹配资产`)
}

async function unzip(zipPath, destDir) {
  mkdirSync(destDir, { recursive: true })
  await execFileP('powershell', ['-NoProfile', '-Command',
    `Expand-Archive -LiteralPath '${zipPath}' -DestinationPath '${destDir}' -Force`],
    { timeout: 300000, windowsHide: true })
}

function findModel() {
  if (!existsSync(STORE)) return null
  for (const f of MODELS) { const p = join(STORE, f); if (existsSync(p)) return p }
  const gg = readdirSync(STORE).find(f => /bge.*\.gguf$/i.test(f))
  return gg ? join(STORE, gg) : null
}

async function ensureEngine() {
  const cfg = loadCfg()
  if (cfg.endpoint) return { kind: 'endpoint', endpoint: cfg.endpoint, key: cfg.key, model: cfg.model || 'bge-small-zh-v1.5' }
  // 本地已起服务就直接用
  try {
    const r = await fetch(`http://127.0.0.1:${PORT}/v1/models`, { signal: AbortSignal.timeout(2000) })
    if (r.ok) return { kind: 'server', endpoint: `http://127.0.0.1:${PORT}`, model: 'bge-small-zh-v1.5' }
  } catch { }
  let bin = await findServerBin()
  if (!bin) {
    // 自动下载 llama.cpp（与 engine-assist 同配方，插件内自持一份不依赖对方）
    if (process.platform !== 'win32') throw new Error('sem_setup: 没探测到 llama-server，自动下载只做了 Windows；macOS/Linux 请 brew/pip 装 llama.cpp 或 engine_register 登记')
    const destDir = join(ENGINES_DIR, 'llama-server')
    const url = await ghReleaseAsset('ggml-org/llama.cpp', /llama-b\d+-bin-win-cpu-x64\.zip$/i)
    const tmp = join(destDir, '__dl.zip')
    await download(url, tmp)
    await unzip(tmp, destDir)
    try { unlinkSync(tmp) } catch { }
    bin = findExe(destDir, /llama-server\.exe$/i)
    if (!bin) throw new Error('sem_setup: llama-server 下载了但解压后没找到 exe')
    const reg = loadRegistry(); reg['llama-server'] = bin
    writeFileSync(REGISTRY, JSON.stringify(reg, null, 2))
  }
  let model = findModel()
  if (!model) {
    if (process.platform !== 'win32') throw new Error('sem_setup: 缺 embedding 模型，请把 bge GGUF 放到 ' + STORE)
    let lastErr = null
    for (const f of MODELS) {
      for (const url of MODEL_URLS(f)) {
        try { await download(url, join(STORE, f)); model = join(STORE, f); break } catch (e) { lastErr = e }
      }
      if (model) break
    }
    if (!model) throw new Error(`sem_setup: 模型下载失败（${lastErr?.message}）。手动下 bge-small-zh GGUF 放 ${STORE} 或在 ${CFG_PATH} 配 endpoint`)
  }
  // 起服务
  serverProc = spawn(bin, ['--embeddings', '-m', model, '--host', '127.0.0.1', '--port', String(PORT), '-c', '512', '-ngl', '0'],
    { windowsHide: true, stdio: 'ignore' })
  serverProc.unref()
  const deadline = Date.now() + 90000
  while (Date.now() < deadline) {
    try {
      const r = await fetch(`http://127.0.0.1:${PORT}/v1/models`, { signal: AbortSignal.timeout(2000) })
      if (r.ok) return { kind: 'server', endpoint: `http://127.0.0.1:${PORT}`, model: 'bge-small-zh-v1.5', spawned: true }
    } catch { }
    if (serverProc.exitCode !== null) throw new Error(`sem_setup: llama-server 启动失败（退出码 ${serverProc.exitCode}），检查模型文件 ${model}`)
    await new Promise(r => setTimeout(r, 1200))
  }
  throw new Error('sem_setup: llama-server 90 秒没起来（首次加载模型慢属正常，可再调一次）')
}

async function embed(backend, inputs) {
  const headers = { 'Content-Type': 'application/json' }
  if (backend.key) headers.Authorization = `Bearer ${backend.key}`
  const res = await fetch(`${backend.endpoint.replace(/\/$/, '')}/v1/embeddings`, {
    method: 'POST', headers, body: JSON.stringify({ model: backend.model, input: inputs }),
    signal: AbortSignal.timeout(120000),
  })
  if (!res.ok) throw new Error(`embedding 服务返回 HTTP ${res.status}：${(await res.text()).slice(0, 160)}`)
  const j = await res.json()
  return j.data.map(d => d.embedding)
}

// ── 向量化存储（int8 对称量化 + 范数）─────────────────────────────────────────
function quantize(vec) {
  let max = 0
  for (const v of vec) { const a = Math.abs(v); if (a > max) max = a }
  const scale = max > 0 ? max / 127 : 1
  const q = Buffer.alloc(vec.length)
  for (let i = 0; i < vec.length; i++) q[i] = Math.max(-127, Math.min(127, Math.round(vec[i] / scale)))
  return { q, scale }
}

function chunkText(t) {
  const s = String(t || '').replace(/\s+/g, ' ').trim()
  if (!s) return []
  if (s.length <= 700) return [s]
  const out = []
  for (let i = 0; i < s.length; i += 550) out.push(s.slice(i, i + 700))
  return out
}

function openDb() {
  mkdirSync(STORE, { recursive: true })
  const db = new DatabaseSync(DB_PATH)
  db.exec('CREATE TABLE IF NOT EXISTS vec(hash TEXT PRIMARY KEY, src TEXT, text TEXT, dim INT, scale REAL, qvec BLOB)')
  db.exec('CREATE INDEX IF NOT EXISTS idx_src ON vec(src)')
  return db
}

export function apply(ctx) {
  ctx.tools.register(defineTool({
    name: 'sem_setup',
    description: '就绪语义检索引擎：探测/下载 llama-server + 中文 embedding 模型并起本地服务。用户有 OpenAI 兼容 embedding 端点也可在 connector-semsearch.json 配 endpoint 走自己的。第一次用 sem_index/sem_search 前最好先调本工具。',
    parameters: {},
    output: { schema: { type: 'object', additionalProperties: false, properties: {
      kind: { type: 'string' }, endpoint: { type: 'string' }, spawned: { type: 'boolean' } } },
      render: (_a, v) => [{ type: 'text', text: `语义引擎就绪：${v.kind === 'endpoint' ? '自配端点 ' + v.endpoint : '本地 llama-server ' + v.endpoint}${v.spawned ? '（本次新起）' : ''}` }] },
    isConcurrencySafe: () => false,
    async execute() {
      const b = await ensureEngine()
      const vecs = await embed(b, ['就绪自检'])
      if (!vecs?.[0]?.length) throw new Error('sem_setup: 服务起了但 embedding 返回空')
      return { kind: b.kind, endpoint: b.endpoint, spawned: !!b.spawned }
    },
    presentCall: (a) => ({ card: 'generic', title: '起语义引擎', kind: 'other', rawInput: a }),
  }))

  ctx.tools.register(defineTool({
    name: 'sem_index',
    description: '把各连接器已入库的语料编成向量索引（扫 ~/.dsh/connector-*/*.db，增量去重）。语料多的话耗时几分钟到几小时属正常，可重复调续跑。',
    parameters: { limit: { type: 'integer', description: '本次最多入库多少条（默认不限）' } },
    output: { schema: { type: 'object', additionalProperties: false, properties: {
      indexed: { type: 'integer' }, skipped: { type: 'integer' }, dim: { type: 'integer' } } },
      render: (_a, v) => [{ type: 'text', text: `语义索引 +${v.indexed} 条（跳过已有 ${v.skipped}，向量 ${v.dim} 维）` }] },
    isConcurrencySafe: () => false,
    async execute(args) {
      if (!DatabaseSync) throw new Error('sem_index: 运行时缺 node:sqlite')
      const b = await ensureEngine()
      const db = openDb()
      const has = db.prepare('SELECT 1 FROM vec WHERE hash=?')
      const ins = db.prepare('INSERT OR REPLACE INTO vec(hash,src,text,dim,scale,qvec) VALUES(?,?,?,?,?,?)')
      let indexed = 0, skipped = 0, dim = 0
      const cap = Number(args.limit) > 0 ? Number(args.limit) : Infinity
      const pending = []
      const flush = async () => {
        while (pending.length) {
          const batch = pending.splice(0, 32)
          const vecs = await embed(b, batch.map(x => x.text))
          for (let i = 0; i < batch.length; i++) {
            const { q, scale } = quantize(vecs[i])
            dim = vecs[i].length
            ins.run(batch[i].hash, batch[i].src, batch[i].text, dim, scale, q)
            indexed++
          }
        }
      }
      const dbs = readdirSync(DSH_HOME).filter(d => d.startsWith('connector-'))
        .flatMap(d => { try { return readdirSync(join(DSH_HOME, d)).filter(f => f.endsWith('.db')).map(f => ({ src: d, file: join(DSH_HOME, d, f) })) } catch { return [] } })
      outer:
      for (const { src, file } of dbs) {
        const map = TABLES[file.split(/[\\/]/).pop()]
        if (!map) continue
        let sdb
        try { sdb = new DatabaseSync(file, { readOnly: true }) } catch { continue }
        try {
          for (const [table, col] of Object.entries(map)) {
            let rows
            try { rows = sdb.prepare(`SELECT ${col} t FROM ${table} LIMIT 300000`).all() } catch { continue }
            for (const r of rows) {
              for (const text of chunkText(r.t)) {
                const hash = createHash('sha1').update(src + '|' + table + '|' + text).digest('hex')
                if (has.get(hash)) { skipped++; continue }
                pending.push({ hash, src: `${src}/${table}`, text })
                if (pending.length >= 64) await flush()
                if (indexed >= cap) break outer
              }
            }
          }
        } finally { sdb.close() }
      }
      await flush()
      db.close()
      return { indexed, skipped, dim }
    },
    presentCall: (a) => ({ card: 'generic', title: '编语义索引', kind: 'other', rawInput: a }),
  }))

  ctx.tools.register(defineTool({
    name: 'sem_search',
    description: '语义搜索全部个人语料：不用字面命中，懂意思。例：「上次说的那个餐厅」「聊过装修的事」。返回最相关的若干条原文+来源。',
    parameters: {
      q: { type: 'string', required: true, description: '自然语言查询' },
      k: { type: 'integer', description: '返回条数（默认 8）' },
    },
    output: { schema: { type: 'object', additionalProperties: false, properties: {
      hits: { type: 'array', items: { type: 'object', additionalProperties: false, properties: {
        domain: { type: 'string' }, text: { type: 'string' }, score: { type: 'number' } } } },
      count: { type: 'integer' } } },
      render: (_a, v) => [{ type: 'text', text: v.hits.length
        ? v.hits.map(h => `[${h.src}] ${h.text.slice(0, 120)}（${h.score}）`).join('\n')
        : '没搜到——先 sem_index 编索引' }] },
    isConcurrencySafe: () => true,
    async execute(args) {
      const q = String(args.q || '').trim()
      if (!q) throw new Error('sem_search: 给个查询词')
      if (!DatabaseSync || !existsSync(DB_PATH)) throw new Error('sem_search: 还没建索引，先 sem_index')
      const b = await ensureEngine()
      const [qv] = await embed(b, [q])
      let qn = 0; for (const v of qv) qn += v * v; qn = Math.sqrt(qn) || 1
      const db = new DatabaseSync(DB_PATH, { readOnly: true })
      const rows = db.prepare('SELECT src, text, dim, scale, qvec FROM vec').all()
      db.close()
      const scored = []
      for (const r of rows) {
        const dim = r.dim
        const buf = Buffer.isBuffer(r.qvec) ? r.qvec : Buffer.from(r.qvec)
        let dot = 0, rn = 0
        for (let i = 0; i < dim; i++) { const rv = buf.readInt8(i) * r.scale; dot += qv[i] * rv; rn += rv * rv }
        scored.push({ src: r.src, text: r.text, score: +(dot / (qn * (Math.sqrt(rn) || 1))).toFixed(3) })
      }
      scored.sort((a, b) => b.score - a.score)
      const k = Math.min(Math.max(Number(args.k) || 8, 1), 50)
      return { hits: scored.slice(0, k), count: rows.length }
    },
    presentCall: (a) => ({ card: 'generic', title: `语义搜「${String(a.q).slice(0, 20)}」`, kind: 'other', rawInput: a }),
  }))

  ctx.tools.register(defineTool({
    name: 'sem_status',
    description: '语义检索层状态：索引了多少条、引擎/模型就绪没。',
    parameters: {},
    output: { schema: { type: 'object', additionalProperties: false, properties: {
      rows: { type: 'integer' }, engine: { type: 'string' }, model: { type: 'string' } } },
      render: (_a, v) => [{ type: 'text', text: `语义索引 ${v.rows} 条；引擎=${v.engine || '未就绪'}；模型=${v.model || '无'}` }] },
    isConcurrencySafe: () => true,
    async execute() {
      let rows = 0
      if (DatabaseSync && existsSync(DB_PATH)) {
        try { const db = new DatabaseSync(DB_PATH, { readOnly: true }); rows = db.prepare('SELECT COUNT(*) c FROM vec').get().c; db.close() } catch { }
      }
      const cfg = loadCfg()
      const model = findModel()
      let engine = '未就绪'
      if (cfg.endpoint) engine = `端点 ${cfg.endpoint}`
      else { const bin = await findServerBin(); if (bin) engine = 'llama-server' }
      return { rows, engine, model: model ? model.split(/[\\/]/).pop() : '无' }
    },
    presentCall: (a) => ({ card: 'generic', title: '查语义层状态', kind: 'other', rawInput: a }),
  }))

  ctx.effect(() => {
    const dispose = ctx.skills.registerProvider(() => createSkillProvider(ctx))
    return () => { try { dispose?.(); } catch { } try { serverProc?.kill() } catch { } }
  })
}
