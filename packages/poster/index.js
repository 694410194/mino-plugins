/**
 * mino-connector-poster —— 报告变图。
 * 各域年度报告产出是 markdown；本件把内容渲染成一张能晒的 PNG：
 *   poster_render → 自包含 HTML → Edge/Chrome headless 截图
 * 零原生依赖（系统自带浏览器内核），不联网上传，图留在本机。
 */
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { existsSync, readFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { homedir } from 'node:os'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { loadHostDeps } from './hostdeps.mjs'
import { createSkillProvider } from './skill-provider.mjs'

const execFileP = promisify(execFile)
const PKG_DIR = dirname(fileURLToPath(import.meta.url))
const PKG = JSON.parse(readFileSync(join(PKG_DIR, 'package.json'), 'utf8'))
const STORE = join(process.env.DSH_HOME || join(homedir(), '.dsh'), 'connector-poster')

export const name = PKG.name
export const inject = ['skills', 'tools']
const defineTool = (await loadHostDeps()).defineTool

function browserCandidates() {
  const pf = process.env['ProgramFiles'] || 'C:/Program Files'
  const pfx = process.env['ProgramFiles(x86)'] || 'C:/Program Files (x86)'
  const l = process.env.LOCALAPPDATA || ''
  return [
    join(pfx, 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
    join(pf, 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
    join(pf, 'Google', 'Chrome', 'Application', 'chrome.exe'),
    join(pfx, 'Google', 'Chrome', 'Application', 'chrome.exe'),
    join(l, 'Google', 'Chrome', 'Application', 'chrome.exe'),
    join(pf, 'Tencent', 'QQBrowser', 'qqbrowser.exe'),
    'msedge', 'chrome',
  ]
}

async function detectBrowser() {
  for (const b of browserCandidates()) {
    try {
      if (!b.includes('/') && !b.includes('\\')) { await execFileP(b, ['--version'], { timeout: 8000, windowsHide: true }); return b }
      if (existsSync(b)) return b
    } catch { }
  }
  return null
}

export function apply(ctx) {
  ctx.tools.register(defineTool({
    name: 'poster_render',
    description: '把一段自包含 HTML（含内联 SVG/CSS，不引外部资源）渲染成 PNG 图片，用于把年度报告/盘点做成能晒的图。默认竖版 750×1334。没有 HTML 就先按 poster-design 技能写一份。',
    parameters: {
      html: { type: 'string', description: '自包含 HTML 源码（与 file 二选一）' },
      file: { type: 'string', description: '已有 HTML 文件绝对路径（与 html 二选一）' },
      width: { type: 'integer', description: '视口宽（默认 750）' },
      height: { type: 'integer', description: '视口高（默认 1334）' },
      out: { type: 'string', description: '输出 PNG 路径（默认 ~/.dsh/connector-poster/<名>.png）' },
    },
    output: { schema: { type: 'object', additionalProperties: false, properties: {
      png: { type: 'string' }, html: { type: 'string' } } },
      render: (_a, v) => [{ type: 'text', text: `海报已出图：${v.png}` }] },
    isConcurrencySafe: () => false,
    async execute(args) {
      let htmlPath = args.file ? String(args.file) : null
      if (!htmlPath) {
        const html = String(args.html || '')
        if (!html.trim()) throw new Error('poster_render: 给 html 源码或 file 路径')
        mkdirSync(STORE, { recursive: true })
        htmlPath = join(STORE, `poster-${Date.now()}.html`)
        writeFileSync(htmlPath, html)
      }
      if (!existsSync(htmlPath)) throw new Error(`poster_render: 文件不存在 ${htmlPath}`)
      const bin = await detectBrowser()
      if (!bin) throw new Error('poster_render: 没探测到 Edge/Chrome——手动装一个或在 Windows 上用自带 Edge')
      const out = args.out ? String(args.out) : join(STORE, htmlPath.replace(/\.html?$/i, '') .split(/[\\/]/).pop() + '.png')
      mkdirSync(dirname(out), { recursive: true })
      const w = Math.min(Math.max(Number(args.width) || 750, 100), 4000)
      const h = Math.min(Math.max(Number(args.height) || 1334, 100), 8000)
      try {
        await execFileP(bin, ['--headless=new', '--disable-gpu', '--hide-scrollbars',
          `--screenshot=${out}`, `--window-size=${w},${h}`, '--default-background-color=FFFFFFFF',
          pathToFileURL(htmlPath).href], { timeout: 60000, windowsHide: true })
      } catch {
        // 老内核没有 =new 头：退回老 headless 参数
        await execFileP(bin, ['--headless', '--disable-gpu', '--hide-scrollbars',
          `--screenshot=${out}`, `--window-size=${w},${h}`,
          pathToFileURL(htmlPath).href], { timeout: 60000, windowsHide: true })
      }
      if (!existsSync(out)) throw new Error('poster_render: 浏览器跑完但没产出 PNG')
      return { png: out, html: htmlPath }
    },
    presentCall: (a) => ({ card: 'generic', title: '渲染海报图', kind: 'other', rawInput: a }),
  }))

  ctx.effect(() => ctx.skills.registerProvider(() => createSkillProvider(ctx)))
}
