/**
 * mino-connector-files-search —— 文件检索连接器（conn-system 域）。
 *
 * 两条引擎：装了 Everything（es.exe）就走它的全盘文件名索引（毫秒级）；
 * 没装就用 PowerShell 递归扫常用目录兜底。只读、本地、用户主动。
 * 零依赖零二进制——不打包 voidtools 的 es.exe（freeware 不重分发），
 * 有就吃现成，没有就兜底。
 */
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { existsSync, readFileSync } from 'node:fs'
import { join, dirname, basename } from 'node:path'
import { fileURLToPath } from 'node:url'
import { homedir } from 'node:os'
import { loadHostDeps } from './hostdeps.mjs'

const execFileP = promisify(execFile)
const PKG_DIR = dirname(fileURLToPath(import.meta.url))
const PKG = JSON.parse(readFileSync(join(PKG_DIR, 'package.json'), 'utf8'))
const SKILLS_DIR = join(PKG_DIR, 'skills')

export const name = PKG.name
export const inject = ['skills', 'tools']

const hostDeps = await loadHostDeps()
const defineTool = hostDeps.defineTool

// ── Everything 探测（有 es.exe 且服务在跑才用）────────────────────────────────
const ES_CANDIDATES = [
  'C:/Program Files/Everything/es.exe',
  'C:/Program Files (x86)/Everything/es.exe',
  join(process.env.LOCALAPPDATA || '', 'Everything', 'es.exe'),
]
let esPath = null
for (const p of ES_CANDIDATES) if (existsSync(p)) { esPath = p; break }
if (!esPath) {
  try { execFileP('where.exe', ['es.exe'], { timeout: 3000 }).then(r => { if (r.stdout.trim()) esPath = r.stdout.trim().split('\n')[0].trim() }).catch(() => {}) } catch {}
}

async function esSearch(q, limit) {
  if (!esPath) return null
  try {
    const { stdout } = await execFileP(esPath, ['-n', String(limit), '-full-path-and-name', q], { timeout: 15000, windowsHide: true })
    if (!stdout.trim()) return null
    return stdout.trim().split(/\r?\n/).map(p => ({ path: p.trim() }))
  } catch { return null } // es.exe 存在但服务没跑 → 回落
}

// ── PowerShell 兜底扫描 ───────────────────────────────────────────────────────
function defaultRoots() {
  const home = homedir()
  return ['Desktop', 'Downloads', 'Documents', 'Pictures', 'Videos']
    .map(d => join(home, d)).filter(existsSync)
}

async function psSearch(q, roots, limit) {
  const rootList = roots.map(r => `'${r.replace(/'/g, "''")}'`).join(',')
  const qq = q.replace(/'/g, "''")
  const script = [
    `$roots=@(${rootList})`,
    `$q='*${qq}*'`,
    `$out=@()`,
    `foreach($r in $roots){`,
    `  $out += Get-ChildItem -LiteralPath $r -Recurse -File -Filter $q -ErrorAction SilentlyContinue |`,
    `    Select-Object -First ${limit} FullName,Length,LastWriteTime`,
    `  if($out.Count -ge ${limit}){break}`,
    `}`,
    `$out | Select-Object -First ${limit} | ConvertTo-Json -Compress`,
  ].join('\n')
  const { stdout } = await execFileP('powershell.exe', ['-NoProfile', '-Command', script], { timeout: 90000, maxBuffer: 4 * 1024 * 1024, windowsHide: true })
  if (!stdout.trim()) return []
  let data
  try { data = JSON.parse(stdout) } catch { return [] }
  const arr = Array.isArray(data) ? data : [data]
  return arr.map(f => ({ path: f.FullName, size: f.Length, mtime: String(f.LastWriteTime || '').slice(0, 10) }))
}

export function apply(ctx) {
  ctx.tools.register(defineTool({
    name: 'files_search',
    description:
      '按文件名在用户本机找文件：装了 Everything 就走它的全盘索引（毫秒级全盘），' +
      '没装就扫 桌面/下载/文档/图片/视频 等常用目录。只按文件名匹配，不读内容。' +
      '参数 root 可指定搜索目录（比如旧硬盘 D:\\）。数据不出本机。',
    parameters: {
      q: { type: 'string', required: true, description: '文件名关键词（Everything 模式支持其语法；兜底模式按 *关键词* 匹配）' },
      root: { type: 'string', description: '可选：搜索根目录（兜底引擎用；Everything 模式忽略）。默认扫常用用户目录' },
      limit: { type: 'integer', description: '最多返回多少条（默认 30，上限 200）' },
    },
    output: {
      schema: {
        type: 'object', additionalProperties: false,
        properties: {
          engine: { type: 'string' },
          files: { type: 'array', items: { type: 'object', additionalProperties: true } },
          count: { type: 'integer' },
        },
      },
      render: (_a, v) => [{ type: 'text', text: `找到 ${v.count} 个匹配文件（${v.engine}）` }],
    },
    isConcurrencySafe: () => true,
    async execute(args) {
      const q = String(args.q ?? '').trim()
      if (!q) throw new Error('files_search: q 不能为空')
      const limit = Math.min(Number.isFinite(+args.limit) ? +args.limit : 30, 200)
      const es = !args.root ? await esSearch(q, limit) : null
      if (es && es.length) return { engine: 'everything', count: es.length, files: es }
      const roots = args.root ? [String(args.root)] : defaultRoots()
      if (!roots.length) throw new Error('files_search: 没有可扫的目录，请用 root 指定')
      const files = await psSearch(q, roots, limit)
      return { engine: es ? 'everything+powershell' : 'powershell', count: files.length, files }
    },
    presentCall: (args) => ({ card: 'generic', title: '找文件', kind: 'other', rawInput: args }),
  }))

  ctx.effect(() => ctx.skills.registerProvider(() => createSkillProvider(ctx)))
}

// ── skill provider（逐字抄 templates/skill-pack，勿变形）──
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
