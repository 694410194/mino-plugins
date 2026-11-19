// mino-content-ops 的 ShotCraft 工作台挂载面（host 半）：
//   /dsh-shotcraft-workbench/* JSON 路由 —— 面板查状态、拉起上游 open.mjs、停止 dev server。
// 只依赖公开契约（ctx.webServer.register + ctx.get 可选服务读取），零内核改动。
// dev server 生命周期完全交给上游 skills/video-shotcraft/workbench/scripts/open.mjs
// 自己管（链接工程 → gen-index → vite :5198 → .dev.pid 记账），这里不平行实现。
import { existsSync, readFileSync } from 'node:fs'
import { copyFile, mkdir, readdir, stat, writeFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { request } from 'node:http'
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const PKG = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'))
const SEED_STYLES = fileURLToPath(new URL('./skills/content-ops/seed/styles', import.meta.url))
// 上游验证过的文风卡（建仓时从原仓库直拉，等同 npx skills add 分发路径；无 license 的仓库不进我们的包）
const SEED_BASE = 'https://raw.githubusercontent.com/yiliqi78/se7en-skills/main/skills/se7en-style-writer/styles'
const SEED_REMOTE = [
  '余华_战栗', '王小波_万寿寺', '马伯庸_长安十二时辰', '万维钢_科普',
  '李娟_我的阿勒泰', '汪曾祺_故乡的事物', '鲁迅_未有天才之前', '张爱玲_小团圆',
].map((n) => ({ name: n, url: `${SEED_BASE}/${encodeURIComponent(n)}.md` }))
SEED_REMOTE.push({ name: '咪蒙_传播特质20条', url: 'https://raw.githubusercontent.com/JZCreative/mimeng-writing-skill/main/TRAITS_20.md' })
const WB_DIR = fileURLToPath(new URL('./skills/video-shotcraft/workbench', import.meta.url))
const OPEN_MJS = fileURLToPath(new URL('./skills/video-shotcraft/workbench/scripts/open.mjs', import.meta.url))
const PORT = 5198

export const name = `${PKG.name}-workbench`
export const inject = []

// Loopback fence（drawio/dsh-ssh 同款）：插件路由只允许本机回环调用。
function isLoopbackRequest(req) {
  const address = req.socket.remoteAddress
  if (address !== '127.0.0.1' && address !== '::1' && address !== '::ffff:127.0.0.1') return false
  const host = req.headers.host
  if (typeof host !== 'string') return false
  let hostUrl
  try { hostUrl = new URL(`http://${host}`) } catch { return false }
  if (hostUrl.hostname !== '127.0.0.1' && hostUrl.hostname !== 'localhost' && hostUrl.hostname !== '[::1]') return false
  if (req.headers['sec-fetch-site'] === 'cross-site') return false
  const origin = req.headers.origin
  if (origin === undefined) return true
  try { return new URL(origin).host === hostUrl.host } catch { return false }
}

const ok = (res, data) => { res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' }); res.end(JSON.stringify({ ok: true, ...data })) }
const bad = (res, error, status = 200) => { res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' }); res.end(JSON.stringify({ ok: false, error })) }

// ── 选题库 feed 代理：只转 skills/content-collect 实测过的匿名只读端点 ──
// 浏览器直连这些端点会撞 CORS，统一走 host 侧 fetch + 字段归一化。
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
const FEED_SOURCES = {
  weibo: {
    url: 'https://weibo.com/ajax/side/hotSearch',
    headers: { referer: 'https://weibo.com/' },
    items: (j) => j?.data?.realtime?.map((x) => ({
      title: x.word ?? x.note,
      hot: x.num,
      url: x.word ? `https://s.weibo.com/weibo?q=${encodeURIComponent(`#${x.word}#`)}` : undefined,
    })),
  },
  bilibili: {
    url: 'https://s.search.bilibili.com/main/hotword',
    items: (j) => (j?.list ?? j?.data?.list)?.map((x) => ({
      title: x.show_name ?? x.keyword, hot: x.heat_score,
      url: x.keyword ? `https://search.bilibili.com/all?keyword=${encodeURIComponent(x.keyword)}` : undefined,
    })),
  },
  toutiao: {
    url: 'https://www.toutiao.com/hot-event/hot-board/?origin=toutiao_pc',
    items: (j) => (Array.isArray(j?.data) ? j.data : []).map((x) => ({
      title: x.Title, hot: x.HotValue, url: x.Url ?? x.GroupUrl,
    })),
  },
  baidu: {
    url: 'https://top.baidu.com/api/board?platform=wise&tab=realtime',
    items: (j) => j?.data?.cards?.[0]?.content?.flatMap((c) => c?.content ?? [c]).map((x) => ({
      title: x.word ?? x.query, hot: x.hotScore ?? x.score, url: x.url ?? x.rawUrl,
    })),
  },
  aihot: {
    url: 'https://aihot.news/api/v1/hot-topics',
    headers: { 'user-agent': 'aihot-api/2.0.0' },
    items: (j) => {
      const arr = j?.data?.items ?? j?.items ?? (Array.isArray(j?.data) ? j.data : [])
      return (Array.isArray(arr) ? arr : []).map((x) => ({
        title: x.title ?? x.name, hot: x.heat ?? x.hot ?? x.score, url: x.url ?? x.link,
      }))
    },
  },
}

async function feedHandle(req, res) {
  if (!isLoopbackRequest(req)) return bad(res, 'forbidden: loopback-only', 403)
  const url = new URL(req.url ?? '/', 'http://x')
  const sub = url.pathname.replace(/^\/dsh-content-ops\/?/, '')

  // 中枢面板兜底工作区：目录选择器不可用时用它建 Workspace 落会话。
  if (req.method === 'GET' && sub === 'ensure-workspace') {
    try {
      const dir = join(homedir(), 'mino-content')
      await mkdir(dir, { recursive: true })
      return ok(res, { dir })
    } catch (e) { return bad(res, `工作区目录创建失败：${String(e).slice(0, 200)}`) }
  }

  // 规范工作文件夹：按 MoneyPrinterTurbo / NarratoAI 验证过的 resource+storage 二分法
  //   content-factory/resource/{styles,templates,materials}  用户资产（文风模版/视频模板/素材，只读引用）
  //   content-factory/storage/tasks/<id>                     立项任务的全部产物
  if (req.method === 'POST' && sub === 'scaffold') {
    const body = await new Promise((r) => { let b = ''; req.on('data', (d) => { b += d }); req.on('end', () => { try { r(JSON.parse(b || '{}')) } catch { r({}) } }) })
    const root = typeof body.root === 'string' ? body.root.trim() : ''
    if (!root) return bad(res, '缺少 root')
    try {
      const base = join(root, 'content-factory')
      for (const d of ['resource/styles', 'resource/templates', 'resource/materials', 'storage/tasks']) await mkdir(join(base, d), { recursive: true })
      // 铺种子文风模版；只补缺，不覆盖用户文件
      try {
        for (const f of await readdir(SEED_STYLES)) {
          const dst = join(base, 'resource/styles', f)
          if (!existsSync(dst)) await copyFile(join(SEED_STYLES, f), dst)
        }
      } catch { /* seed 目录缺失不阻塞建仓 */ }
      // 上游仓库直拉的验证文风卡；单张失败不阻塞其余
      for (const s of SEED_REMOTE) {
        const dst = join(base, 'resource/styles', `${s.name}.md`)
        if (existsSync(dst)) continue
        try {
          const r = await fetch(s.url, { signal: AbortSignal.timeout(15000) })
          if (r.ok) await writeFile(dst, await r.text())
        } catch { /* 拉取失败跳过，下次建仓再补 */ }
      }
      return ok(res, { base })
    } catch (e) { return bad(res, `工作文件夹初始化失败：${String(e).slice(0, 200)}`) }
  }

  // 模版库清单：GET library?root=<工作区路径>&kind=styles|templates
  if (req.method === 'GET' && sub === 'library') {
    const root = url.searchParams.get('root')?.trim()
    const kind = url.searchParams.get('kind')
    if (!root || (kind !== 'styles' && kind !== 'templates')) return bad(res, '参数 root/kind 无效')
    try {
      const dir = join(root, 'content-factory', 'resource', kind)
      const ents = await readdir(dir, { withFileTypes: true })
      const items = ents
        .filter((e) => (kind === 'templates' ? e.isDirectory() || /\.md$/i.test(e.name) : e.isFile() && !/^\./.test(e.name)))
        .map((e) => ({ name: e.name.replace(/\.(md|txt)$/i, ''), path: join(dir, e.name), isDir: e.isDirectory() }))
      return ok(res, { kind, items })
    } catch { return ok(res, { kind, items: [] }) }
  }

  const key = sub.replace(/^feed\/?/, '')
  const src = FEED_SOURCES[key]
  if (!src) return bad(res, `unknown feed source: ${key}`, 404)
  try {
    const r = await fetch(src.url, {
      headers: { 'user-agent': UA, accept: 'application/json', ...src.headers },
      signal: AbortSignal.timeout(15000),
    })
    if (!r.ok) return bad(res, `上游返回 ${r.status}`)
    const items = (src.items(await r.json()) ?? []).filter((x) => x?.title).slice(0, 30)
    return ok(res, { source: key, items })
  } catch (e) {
    return bad(res, `采集失败：${String(e).slice(0, 200)}`)
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

function probe() {
  return new Promise((resolve) => {
    const req = request({ host: 'localhost', port: PORT, path: '/', method: 'GET', timeout: 1500 }, (res) => {
      res.resume()
      resolve(res.statusCode !== undefined && res.statusCode < 500)
    })
    req.on('timeout', () => { req.destroy(); resolve(false) })
    req.on('error', () => resolve(false))
    req.end()
  })
}

function devPid() {
  try {
    const raw = readFileSync(`${WB_DIR}/.dev.pid`, 'utf8').trim()
    const pid = Number(raw)
    return Number.isInteger(pid) && pid > 0 ? pid : undefined
  } catch { return undefined }
}

function linkedProject() {
  try {
    const meta = readFileSync(`${WB_DIR}/src/projMeta.ts`, 'utf8')
    const m = /['"`]([^'"`]+)['"`]/.exec(meta)
    return m?.[1]
  } catch { return undefined }
}

function run(cmd, args, opts = {}) {
  return new Promise((resolve) => {
    const child = spawn(cmd, args, { windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'], ...opts })
    let out = ''
    child.stdout.on('data', (d) => { out += d })
    child.stderr.on('data', (d) => { out += d })
    child.on('error', (e) => resolve({ code: -1, out: String(e) }))
    child.on('close', (code) => resolve({ code, out }))
  })
}

async function ensureDeps() {
  if (existsSync(`${WB_DIR}/node_modules/.bin/vite`)) return null
  const r = await run('npm', ['install', '--no-audit', '--no-fund'], { cwd: WB_DIR, shell: process.platform === 'win32' })
  return r.code === 0 ? null : `workbench 依赖安装失败（npm install exit ${r.code}）：${r.out.slice(-400)}`
}

async function handle(req, res) {
  if (!isLoopbackRequest(req)) return bad(res, 'forbidden: loopback-only', 403)
  const url = new URL(req.url ?? '/', 'http://x')
  const sub = url.pathname.replace(/^\/dsh-shotcraft-workbench\/?/, '')

  if (req.method === 'GET' && sub === 'status') {
    return ok(res, { running: await probe(), port: PORT, pid: devPid(), project: linkedProject(), url: `http://localhost:${PORT}/?import=project` })
  }

  if (req.method !== 'POST') return bad(res, 'method not allowed', 405)
  const body = await new Promise((r) => { let b = ''; req.on('data', (d) => { b += d }); req.on('end', () => { try { r(JSON.parse(b || '{}')) } catch { r({}) } }) })

  if (sub === 'open') {
    const dir = typeof body.dir === 'string' ? body.dir.trim() : ''
    if (!dir) return bad(res, '缺少工程目录 dir')
    const st = await stat(dir).catch(() => undefined)
    if (!st?.isDirectory() || !existsSync(`${dir}/package.json`)) return bad(res, `工程目录无效：${dir}（需含 package.json / remotion.config.ts）`)
    const depErr = await ensureDeps()
    if (depErr) return bad(res, depErr)
    // open.mjs 自管链接+索引+server 生命周期；detach 让它不随路由请求回收。
    spawn(process.execPath, [OPEN_MJS, dir, '--no-open', '--port', String(PORT)], { cwd: WB_DIR, detached: true, stdio: 'ignore', windowsHide: true }).unref()
    for (let i = 0; i < 60; i++) { if (await probe()) return ok(res, { running: true, url: `http://localhost:${PORT}/?import=project` }); await sleep(500) }
    return bad(res, 'dev server 启动超时（30s）——看 workbench/.dev.log')
  }

  if (sub === 'stop') {
    const pid = devPid()
    if (!pid) return ok(res, { running: false, note: '无 .dev.pid 记录' })
    const r = process.platform === 'win32'
      ? await run('taskkill', ['/PID', String(pid), '/T', '/F'])
      : await run('kill', [String(pid)])
    return r.code === 0 ? ok(res, { running: false }) : bad(res, `停止失败：${r.out.slice(-300)}`)
  }

  return bad(res, `unknown route: ${sub}`, 404)
}

export function apply(ctx) {
  // webServer 是可选服务：headless 档没有它，这条注入永不触发（行不 pending）；
  // web 档里服务 provide 后 child 作用域才执行，挂载随 child 销毁自动回收。
  ctx.inject(['webServer'], (child) => {
    const dispose = child.webServer.register({ kind: 'prefix', path: '/dsh-shotcraft-workbench', handler: handle })
    const disposeFeed = child.webServer.register({ kind: 'prefix', path: '/dsh-content-ops', handler: feedHandle })
    child.effect(() => () => { dispose(); disposeFeed() }, 'mino-shotcraft-workbench: routes')
  })
}
