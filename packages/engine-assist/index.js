/**
 * mino-connector-engine-assist —— 引擎代办。
 * 各连接器依赖的第三方引擎统一在这里安装/登记：
 *   engine_status   → 哪些有了哪些缺
 *   engine_setup    → 自动下载安装（Windows 拉官方 release，用户一句「帮我装」）
 *   engine_register → 用户自己装好的，登记路径进 ~/.dsh/engines.json 共享给所有连接器
 * 合规口径：引擎=用户机器上用户点头的第三方工具，本体不捆绑破解/解密能力。
 */
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { existsSync, readFileSync, writeFileSync, mkdirSync, readdirSync, unlinkSync, renameSync, statSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { homedir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { loadHostDeps } from './hostdeps.mjs'
import { createSkillProvider } from './skill-provider.mjs'

const execFileP = promisify(execFile)
const PKG_DIR = dirname(fileURLToPath(import.meta.url))
const PKG = JSON.parse(readFileSync(join(PKG_DIR, 'package.json'), 'utf8'))
const DSH_HOME = process.env.DSH_HOME || join(homedir(), '.dsh')
const ENGINES_DIR = join(DSH_HOME, 'engines')
const REGISTRY = join(DSH_HOME, 'engines.json')

export const name = PKG.name
export const inject = ['skills', 'tools']
const defineTool = (await loadHostDeps()).defineTool

// ── 引擎配方 ─────────────────────────────────────────────────────────────────
// kind: url=直链文件 / ghasset=GitHub release 资产正则 / manual=仓随时蒸发只登记
const RECIPES = {
  'yt-dlp': { kind: 'url', url: 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe',
    file: 'yt-dlp.exe', check: ['--version'], use: '视频下载（connector-ytdlp）', pathBin: 'yt-dlp' },
  'ffmpeg': { kind: 'ghasset', repo: 'BtbN/FFmpeg-Builds', match: /ffmpeg-master-latest-win64-gpl\.zip$/i,
    findExe: /bin[\\/]ffmpeg\.exe$/i, check: ['-version'], use: '音视合并（yt-dlp 配菜，大包）', pathBin: 'ffmpeg' },
  'scrcpy': { kind: 'ghasset', repo: 'Genymobile/scrcpy', match: /scrcpy-win64-v.*\.zip$/i,
    findExe: /scrcpy\.exe$/i, check: ['--version'], use: '手机投屏/拉文件（connector-scrcpy，内含 adb）', pathBin: 'scrcpy' },
  'platform-tools': { kind: 'url', url: 'https://dl.google.com/android/repository/platform-tools-latest-windows.zip',
    zip: true, findExe: /platform-tools[\\/]adb\.exe$/i, check: ['version'], use: 'ADB 通道（connector-scrcpy 备选）', pathBin: 'adb' },
  'whisper-cli': { kind: 'ghasset', repo: 'ggml-org/whisper.cpp', match: /whisper-bin-x64\.zip$/i,
    findExe: /whisper-cli\.exe$|main\.exe$/i, check: ['-h'], use: '语音转写（connector-asr，另需 .bin 模型）', pathBin: 'whisper-cli' },
  'llama-server': { kind: 'ghasset', repo: 'ggml-org/llama.cpp', match: /llama-b\d+-bin-win-cpu-x64\.zip$/i,
    findExe: /llama-server\.exe$/i, check: ['--version'], use: '本地推理/向量嵌入（connector-semsearch，大包）', pathBin: 'llama-server' },
  'localsend': { kind: 'ghasset', repo: 'localsend/localsend', match: /LocalSend-.*windows.*\.zip$/i,
    findExe: /localsend.*\.exe$/i, check: null, use: '局域网传文件（connector-localsend）', pathBin: 'localsend_app' },
  'es': { kind: 'url', url: 'https://www.voidtools.com/ES-1.1.0.31.x64.zip', zip: true,
    findExe: /es\.exe$/i, check: null, use: '文件名秒搜（Everything 引擎，connector-files-search）', pathBin: 'es' },
  'hackbrowserdata': { kind: 'ghasset', repo: 'moonD4rk/HackBrowserData', match: /hack-browser-data-.*-windows-amd64\.zip$/i,
    findExe: /hack-browser-data.*\.exe$/i, check: ['-h'], use: '浏览器数据导出（connector-browser-history 增强）', pathBin: 'hack-browser-data' },
  'wechat-dump': { kind: 'manual',
    hint: '微信解密引擎属特区：仓随时被函蒸发，不自动下载。自己找一个活着的开源仓（wechat-dump-rs/PyWxDump 系 fork）下载 exe，然后 engine_register wechat-dump <绝对路径> 登记，connector-wechat 就能认到。',
    use: '微信记录解密（connector-wechat）' },
  'qq-exporter': { kind: 'manual',
    hint: 'QQ 解密引擎同理：找 QQExporter/WeQ 系活跃仓下载 exe，engine_register qq-exporter <路径> 登记，connector-qq 认到。',
    use: 'QQ 记录解密（connector-qq）' },
}

function loadRegistry() { try { return JSON.parse(readFileSync(REGISTRY, 'utf8')) } catch { return {} } }
function saveRegistry(r) { mkdirSync(DSH_HOME, { recursive: true }); writeFileSync(REGISTRY, JSON.stringify(r, null, 2)) }

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

async function detectOne(name, r) {
  const reg = loadRegistry()[name]
  if (reg && existsSync(reg)) return reg
  const dir = join(ENGINES_DIR, name)
  if (existsSync(dir)) {
    if (r.findExe) { const hit = findExe(dir, r.findExe); if (hit) return hit }
    if (r.file && existsSync(join(dir, r.file))) return join(dir, r.file)
  }
  if (r.pathBin) { try { await execFileP(r.pathBin, r.check || ['--version'], { timeout: 8000, windowsHide: true }); return r.pathBin } catch { } }
  return null
}

async function download(url, dest) {
  const res = await fetch(url, { signal: AbortSignal.timeout(600000), redirect: 'follow' })
  if (!res.ok) throw new Error(`下载失败 HTTP ${res.status}：${url.slice(0, 90)}`)
  mkdirSync(dirname(dest), { recursive: true })
  writeFileSync(dest, Buffer.from(await res.arrayBuffer()))
  return dest
}

async function ghReleaseAsset(repo, match) {
  const res = await fetch(`https://api.github.com/repos/${repo}/releases/latest`,
    { headers: { 'User-Agent': 'Mino/1.0', Accept: 'application/vnd.github+json' }, signal: AbortSignal.timeout(30000) })
  if (!res.ok) throw new Error(`GitHub release 查询失败 HTTP ${res.status}（网络不通就手动下载后 engine_register）`)
  const j = await res.json()
  const a = (j.assets || []).find(x => match.test(x.name))
  if (!a) throw new Error(`${repo} 最新 release 里没找到匹配资产（${match}）`)
  return a.browser_download_url
}

async function unzip(zipPath, destDir) {
  mkdirSync(destDir, { recursive: true })
  await execFileP('powershell', ['-NoProfile', '-Command',
    `Expand-Archive -LiteralPath '${zipPath}' -DestinationPath '${destDir}' -Force`],
    { timeout: 180000, windowsHide: true })
}

async function installOne(name) {
  const r = RECIPES[name]
  if (r.kind === 'manual') throw new Error(r.hint)
  if (process.platform !== 'win32') throw new Error(`engine_setup: 自动安装只做了 Windows；其它平台手动装好后 engine_register ${name} <路径>`)
  const destDir = join(ENGINES_DIR, name)
  let url = r.url
  if (r.kind === 'ghasset') url = await ghReleaseAsset(r.repo, r.match)
  const isZip = r.zip || /\.zip($|\?)/i.test(url)
  const tmp = join(destDir, isZip ? '__dl.zip' : '__dl.bin')
  await download(url, tmp)
  let bin = null
  if (isZip) {
    await unzip(tmp, destDir)
    try { unlinkSync(tmp) } catch { }
    bin = r.findExe ? findExe(destDir, r.findExe) : null
  } else {
    bin = join(destDir, r.file || (name + '.exe'))
    renameSync(tmp, bin)
  }
  if (!bin || !existsSync(bin)) throw new Error(`engine_setup: ${name} 下载了但没找到可执行文件（目录 ${destDir} 可翻看，找到后 engine_register）`)
  const reg = loadRegistry(); reg[name] = bin; saveRegistry(reg)
  const ver = r.check ? await execFileP(bin, r.check, { timeout: 15000, windowsHide: true })
    .then(o => ((o.stdout || '') + (o.stderr || '')).split('\n')[0].trim()).catch(() => '已登记') : '已登记'
  return { name, bin, version: ver.slice(0, 120) }
}

export function apply(ctx) {
  ctx.tools.register(defineTool({
    name: 'engine_status',
    description: '查全部引擎状态：哪些装好（登记/engines 目录/PATH）、哪些缺。引擎是各连接器要用的第三方工具（yt-dlp/scrcpy/whisper/llama-server/es/localsend 等）。用户说「帮我装」→ engine_setup。',
    parameters: {},
    output: { schema: { type: 'object', additionalProperties: false, properties: {
      ready: { type: 'array', items: { type: 'string' } }, missing: { type: 'array', items: { type: 'string' } } } },
      render: (_a, v) => [{ type: 'text', text: `引擎就绪 ${v.ready.length}：${v.ready.join('、') || '无'}；缺 ${v.missing.length}：${v.missing.join('、') || '无'}` }] },
    isConcurrencySafe: () => true,
    async execute() {
      const ready = [], missing = []
      for (const [n, r] of Object.entries(RECIPES)) {
        if (r.kind === 'manual') { const reg = loadRegistry()[n]; (reg && existsSync(reg) ? ready : missing).push(n); continue }
        ;(await detectOne(n, r) ? ready : missing).push(n)
      }
      return { ready, missing }
    },
    presentCall: (a) => ({ card: 'generic', title: '查引擎状态', kind: 'other', rawInput: a }),
  }))

  ctx.tools.register(defineTool({
    name: 'engine_setup',
    description: '帮用户安装一个引擎：从官方 release 下载到 ~/.dsh/engines/ 并登记到 engines.json。用户说「帮我装 xx」或连接器报缺引擎时用。可选引擎名见 engine_status。',
    parameters: { name: { type: 'string', required: true, description: '引擎名：' + Object.keys(RECIPES).join('|') } },
    output: { schema: { type: 'object', additionalProperties: false, properties: {
      name: { type: 'string' }, bin: { type: 'string' }, version: { type: 'string' } } },
      render: (_a, v) => [{ type: 'text', text: `${v.name} 装好了：${v.bin}（${v.version}）` }] },
    isConcurrencySafe: () => false,
    async execute(args) {
      const n = String(args.name || '').toLowerCase()
      const r = RECIPES[n]
      if (!r) throw new Error(`engine_setup: 不认识的引擎 "${n}"，支持：${Object.keys(RECIPES).join('/')}`)
      const have = await detectOne(n, r)
      if (have && r.kind !== 'manual') {
        const ver = r.check ? await execFileP(have, r.check, { timeout: 15000, windowsHide: true })
          .then(o => ((o.stdout || '') + (o.stderr || '')).split('\n')[0].trim()).catch(() => '已登记') : '已登记'
        return { name: n, bin: have, version: ver.slice(0, 120) }
      }
      return await installOne(n)
    },
    presentCall: (a) => ({ card: 'generic', title: `装引擎 ${a.name}`, kind: 'other', rawInput: a }),
  }))

  ctx.tools.register(defineTool({
    name: 'engine_register',
    description: '用户自己装好了某个引擎：把可执行文件路径登记进 ~/.dsh/engines.json，之后所有连接器都认到。',
    parameters: {
      name: { type: 'string', required: true, description: '引擎名：' + Object.keys(RECIPES).join('|') },
      path: { type: 'string', required: true, description: '可执行文件绝对路径' },
    },
    output: { schema: { type: 'object', additionalProperties: false, properties: { name: { type: 'string' }, bin: { type: 'string' } } },
      render: (_a, v) => [{ type: 'text', text: `${v.name} 登记好了：${v.bin}` }] },
    isConcurrencySafe: () => false,
    async execute(args) {
      const n = String(args.name || '').toLowerCase()
      if (!RECIPES[n]) throw new Error(`engine_register: 不认识的引擎 "${n}"`)
      const p = String(args.path || '').trim()
      if (!existsSync(p)) throw new Error(`engine_register: 文件不存在 ${p}`)
      const reg = loadRegistry(); reg[n] = p; saveRegistry(reg)
      return { name: n, bin: p }
    },
    presentCall: (a) => ({ card: 'generic', title: `登记引擎 ${a.name}`, kind: 'other', rawInput: a }),
  }))

  ctx.effect(() => ctx.skills.registerProvider(() => createSkillProvider(ctx)))
}
