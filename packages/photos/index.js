/**
 * mino-connector-photos —— 相册连接器（域 4 相册，本地盘点形态）。
 * photos_scan：本地照片文件夹按年月/来源聚合盘点（数量/体积/时间跨度），只读。
 * photos_immich：从用户自己的 immich 服务器拉相册明细（凭据在 cloud 配置或本包配置）。
 */
import { existsSync, readdirSync, statSync, readFileSync } from 'node:fs'
import { join, dirname, extname } from 'node:path'
import { homedir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { loadHostDeps } from './hostdeps.mjs'
import { createSkillProvider } from './skill-provider.mjs'

const PKG_DIR = dirname(fileURLToPath(import.meta.url))
const PKG = JSON.parse(readFileSync(join(PKG_DIR, 'package.json'), 'utf8'))
const DSH_HOME = process.env.DSH_HOME || join(homedir(), '.dsh')

export const name = PKG.name
export const inject = ['skills', 'tools']
const defineTool = (await loadHostDeps()).defineTool

const IMG = ['.jpg', '.jpeg', '.png', '.heic', '.webp', '.gif', '.bmp', '.tiff', '.raw', '.cr2', '.nef', '.dng']
const VID = ['.mp4', '.mov', '.avi', '.mkv', '.3gp', '.m4v']

function scanPhotos(root, maxScan = 200000) {
  const byMonth = {}, byExt = {}, sources = {}
  let count = 0, vids = 0, size = 0, scanned = 0, oldest = '9999', newest = '0000'
  const walk = (d, depth) => {
    let es
    try { es = readdirSync(d, { withFileTypes: true }) } catch { return }
    for (const e of es) {
      if (scanned >= maxScan) return
      const p = join(d, e.name)
      if (e.isDirectory()) { if (depth < 8) walk(p, depth + 1); continue }
      scanned++
      const ext = extname(e.name).toLowerCase()
      const isImg = IMG.includes(ext), isVid = VID.includes(ext)
      if (!isImg && !isVid) continue
      let st
      try { st = statSync(p) } catch { continue }
      const m = e.name.match(/(20\d{2})[-_.]?(0[1-9]|1[0-2])/) || st.mtime.toISOString().match(/(20\d{2})-(\d{2})/)
      const month = m ? `${m[1]}-${m[2]}` : st.mtime.toISOString().slice(0, 7)
      if (isImg) { count++; size += st.size } else { vids++; size += st.size }
      byMonth[month] = (byMonth[month] || 0) + 1
      byExt[ext] = (byExt[ext] || 0) + 1
      // 来源猜测：目录名/文件名前缀
      const src = /wechat|微信/i.test(p) ? '微信' : /screenshot|截图/i.test(p) ? '截图'
        : /dcim|camera/i.test(p) ? '相机/手机' : depth <= 1 ? '顶层目录' : '子目录'
      sources[src] = (sources[src] || 0) + 1
      if (month < oldest) oldest = month
      if (month > newest) newest = month
    }
  }
  walk(root, 0)
  return { count, vids, size, byMonth, byExt, sources, oldest, newest, scanned }
}

const fmtSize = (n) => n > 1e9 ? `${(n / 1e9).toFixed(1)}GB` : `${(n / 1e6).toFixed(0)}MB`

export function apply(ctx) {
  ctx.tools.register(defineTool({
    name: 'photos_scan',
    description:
      '盘点本地照片文件夹：按月统计数量、按类型/来源归类、体积与时间跨度。' +
      '传一个或多个目录（默认 图片 目录）。只读，不复制不移动。',
    parameters: {
      dir: { type: 'string', description: '照片根目录（默认 <用户>/Pictures）' },
    },
    output: { schema: { type: 'object', additionalProperties: false, properties: {
      photos: { type: 'integer' }, videos: { type: 'integer' }, totalSize: { type: 'string' },
      range: { type: 'string' }, byMonth: { type: 'object', additionalProperties: true },
      byType: { type: 'object', additionalProperties: true }, bySource: { type: 'object', additionalProperties: true } } },
      render: (_a, v) => [{ type: 'text', text:
        `照片 ${v.photos} 张 + 视频 ${v.videos} 个，共 ${v.totalSize}，跨度 ${v.range}，` +
        `来源：${Object.entries(v.bySource).map(([k, n]) => `${k}${n}`).join('/')}` }] },
    isConcurrencySafe: () => true,
    async execute(args) {
      const dir = args.dir ? String(args.dir) : join(homedir(), 'Pictures')
      if (!existsSync(dir)) throw new Error(`photos_scan: 目录不存在 ${dir}`)
      const s = scanPhotos(dir)
      const months = Object.keys(s.byMonth).sort()
      return {
        photos: s.count, videos: s.vids, totalSize: fmtSize(s.size),
        range: s.oldest === '9999' ? '无照片' : `${s.oldest} ~ ${s.newest}`,
        byMonth: Object.fromEntries(months.slice(-24).map(m => [m, s.byMonth[m]])),
        byType: s.byExt, bySource: s.sources,
      }
    },
    presentCall: (a) => ({ card: 'generic', title: '盘点相册', kind: 'other', rawInput: a }),
  }))

  ctx.tools.register(defineTool({
    name: 'photos_immich',
    description:
      '从你自己的 immich 服务器拉相册内容明细。凭据填在 ' +
      '~/.dsh/connector-cloud.json 的 immich{"url","key"}（与 cloud 连接器共用）。',
    parameters: {
      album: { type: 'string', description: '可选：只看某个相册名' },
    },
    output: { schema: { type: 'object', additionalProperties: true } },
    isConcurrencySafe: () => true,
    async execute(args) {
      let cfg
      try { cfg = JSON.parse(readFileSync(join(DSH_HOME, 'connector-cloud.json'), 'utf8')).immich } catch {}
      if (!cfg?.url || !cfg?.key) throw new Error(`没配 immich：在 ${join(DSH_HOME, 'connector-cloud.json')} 填 {"immich":{"url":"http://:2283","key":"API key"}}`)
      const base = cfg.url.replace(/\/$/, '')
      const res = await fetch(`${base}/api/albums`, { headers: { 'x-api-key': cfg.key }, signal: AbortSignal.timeout(15000) })
      if (!res.ok) throw new Error(`photos_immich: HTTP ${res.status}（检查 url/key）`)
      const albums = await res.json()
      const want = args.album ? String(args.album).toLowerCase() : null
      const list = albums.filter(a => !want || (a.albumName || '').toLowerCase().includes(want))
      return { 相册数: list.length, 相册: list.slice(0, 30).map(a => ({ name: a.albumName, 张数: a.assetCount, 更新: a.updatedAt?.slice(0, 10) })) }
    },
    presentCall: (a) => ({ card: 'generic', title: '拉 immich 相册', kind: 'other', rawInput: a }),
  }))

  ctx.effect(() => ctx.skills.registerProvider(() => createSkillProvider(ctx)))
}
