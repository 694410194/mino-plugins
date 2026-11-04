/**
 * mino-connector-ytdlp —— 视频下载连接器（工具连接器：yt-dlp 封装）。
 * 探测 PATH/常见位置的 yt-dlp；没有就按需从 GitHub 下载官方 release exe
 * 到 ~/.dsh/connector-ytdlp/（仅 win32 自动下载，其它平台给安装指引）。
 */
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { existsSync, readFileSync, mkdirSync, chmodSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { homedir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { loadHostDeps } from './hostdeps.mjs'
import { createSkillProvider } from './skill-provider.mjs'

const execFileP = promisify(execFile)
const PKG_DIR = dirname(fileURLToPath(import.meta.url))
const PKG = JSON.parse(readFileSync(join(PKG_DIR, 'package.json'), 'utf8'))
const STORE = join(process.env.DSH_HOME || join(homedir(), '.dsh'), 'connector-ytdlp')

export const name = PKG.name
export const inject = ['skills', 'tools']
const defineTool = (await loadHostDeps()).defineTool

const HINT = `没装 yt-dlp：yt-dlp_install 可自动下载（Windows），或手动：winget install yt-dlp / scoop install yt-dlp / pip install yt-dlp，装完重试`

async function detectBin(custom) {
  const cands = custom ? [custom] : ['yt-dlp', 'yt-dlp.exe', join(STORE, 'yt-dlp.exe'), 'D:/tools/yt-dlp.exe']
  for (const c of cands) {
    try { await execFileP(c, ['--version'], { timeout: 10000, windowsHide: true }); return c } catch { }
  }
  return null
}

export function apply(ctx) {
  ctx.tools.register(defineTool({
    name: 'ytdlp_install',
    description: '下载安装 yt-dlp 引擎到本机（Windows 从官方 GitHub release 拉单文件 exe）。已装则直接报版本。',
    parameters: {},
    output: { schema: { type: 'object', additionalProperties: false, properties: { bin: { type: 'string' }, version: { type: 'string' } } },
      render: (_a, v) => [{ type: 'text', text: `yt-dlp 就绪：${v.bin}（${v.version}）` }] },
    isConcurrencySafe: () => false,
    async execute() {
      const have = await detectBin()
      if (have) {
        const { stdout } = await execFileP(have, ['--version'], { timeout: 10000, windowsHide: true })
        return { bin: have, version: stdout.trim() }
      }
      if (process.platform !== 'win32') throw new Error('自动安装只做了 Windows；其它平台 pip/brew 装 yt-dlp 后重试')
      mkdirSync(STORE, { recursive: true })
      const dest = join(STORE, 'yt-dlp.exe')
      const res = await fetch('https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe',
        { signal: AbortSignal.timeout(120000), redirect: 'follow' })
      if (!res.ok) throw new Error(`下载失败 HTTP ${res.status}（网络不通就手动装：${HINT}）`)
      const buf = Buffer.from(await res.arrayBuffer())
      const { writeFileSync } = await import('node:fs')
      writeFileSync(dest, buf)
      const { stdout } = await execFileP(dest, ['--version'], { timeout: 10000, windowsHide: true })
      return { bin: dest, version: stdout.trim() }
    },
    presentCall: (a) => ({ card: 'generic', title: '装 yt-dlp', kind: 'other', rawInput: a }),
  }))

  ctx.tools.register(defineTool({
    name: 'ytdlp_download',
    description: '下载公开视频/音频到本地（yt-dlp 封装）：传 URL，默认最佳画质到下载目录。没装引擎会给安装指引。',
    parameters: {
      url: { type: 'string', required: true, description: '视频页 URL（B站/YouTube 等 yt-dlp 支持的站点）' },
      out: { type: 'string', description: '保存目录（默认 ~/Videos/mino）' },
      audioOnly: { type: 'boolean', description: 'true=只下音频 mp3' },
      bin: { type: 'string', description: '可选：yt-dlp 可执行文件路径' },
    },
    output: { schema: { type: 'object', additionalProperties: false, properties: { dir: { type: 'string' }, log: { type: 'string' } } },
      render: (_a, v) => [{ type: 'text', text: `下载完成 → ${v.dir}` }] },
    isConcurrencySafe: () => false,
    async execute(args) {
      const url = String(args.url || '').trim()
      if (!/^https?:\/\//.test(url)) throw new Error('ytdlp_download: 给 http(s) URL')
      const bin = await detectBin(args.bin)
      if (!bin) throw new Error('ytdlp_download: ' + HINT)
      const out = args.out ? String(args.out) : join(homedir(), 'Videos', 'mino')
      mkdirSync(out, { recursive: true })
      const argv = args.audioOnly
        ? ['-x', '--audio-format', 'mp3', '-o', join(out, '%(title)s.%(ext)s'), url]
        : ['-f', 'bv*+ba/b', '--merge-output-format', 'mp4', '-o', join(out, '%(title)s.%(ext)s'), url]
      try {
        const { stdout, stderr } = await execFileP(bin, argv, { timeout: 1800000, windowsHide: true, maxBuffer: 4 * 1024 * 1024 })
        return { dir: out, log: (stdout + stderr).slice(-1500) }
      } catch (e) {
        throw new Error(`ytdlp_download: 下载失败（${String(e?.stderr || e?.message).slice(-300)}）`)
      }
    },
    presentCall: (a) => ({ card: 'generic', title: '下载视频', kind: 'other', rawInput: a }),
  }))

  ctx.effect(() => ctx.skills.registerProvider(() => createSkillProvider(ctx)))
}
