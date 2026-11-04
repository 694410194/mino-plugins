/**
 * mino-connector-footprints —— 足迹连接器（三批域：足迹）。
 * 从 connector-travel 的 trips.csv + 用户手动补充的城市记录汇总足迹：
 * 去过的城市×年份矩阵，写足迹 markdown。手动导入兜底形态。
 */
import { existsSync, readFileSync, writeFileSync, appendFileSync, mkdirSync, readdirSync } from 'node:fs'
import { join, dirname, extname } from 'node:path'
import { homedir } from 'node:os'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { fileURLToPath } from 'node:url'
import { loadHostDeps } from './hostdeps.mjs'
import { createSkillProvider } from './skill-provider.mjs'

const PKG_DIR = dirname(fileURLToPath(import.meta.url))
const PKG = JSON.parse(readFileSync(join(PKG_DIR, 'package.json'), 'utf8'))
const DSH_HOME = process.env.DSH_HOME || join(homedir(), '.dsh')
const STORE = join(DSH_HOME, 'connector-footprints')
const TRIPS = join(DSH_HOME, 'connector-travel', 'trips.csv')
const EXTRA = join(STORE, 'extra.csv')

export const name = PKG.name
export const inject = ['skills', 'tools']
const defineTool = (await loadHostDeps()).defineTool

const execFileP = promisify(execFile)

// 国内主要城市粗定位框 [minLat,maxLat,minLng,maxLng]，EXIF 坐标落框内即记该城
const CITY_BOX = {
  北京: [39.4, 41.1, 115.4, 117.5], 上海: [30.7, 31.9, 120.8, 122.1],
  广州: [22.5, 24.0, 112.9, 114.1], 深圳: [22.4, 22.9, 113.7, 114.7],
  成都: [30.0, 31.4, 103.5, 104.9], 重庆: [28.2, 30.3, 105.3, 108.0],
  杭州: [29.2, 30.6, 118.3, 120.8], 武汉: [29.9, 31.4, 113.7, 115.1],
  西安: [33.7, 34.8, 107.7, 109.8], 南京: [31.2, 32.6, 118.3, 119.2],
  苏州: [30.8, 32.0, 119.9, 121.3], 天津: [38.6, 40.3, 116.7, 118.1],
  长沙: [27.8, 28.6, 111.9, 113.2], 郑州: [34.3, 35.1, 112.7, 114.2],
  青岛: [35.6, 37.1, 119.5, 121.0], 厦门: [24.4, 24.9, 117.9, 118.4],
  昆明: [24.4, 26.4, 102.2, 103.4], 三亚: [18.1, 18.6, 108.9, 109.8],
  哈尔滨: [45.3, 46.2, 126.1, 127.0], 沈阳: [41.2, 42.5, 122.9, 123.9],
  大连: [38.7, 39.9, 120.9, 121.8], 福州: [25.7, 26.4, 119.0, 119.8],
  合肥: [31.5, 32.4, 116.9, 117.8], 济南: [36.2, 37.0, 116.6, 117.6],
  贵阳: [26.1, 27.1, 106.2, 107.2], 南宁: [22.5, 23.3, 107.9, 108.9],
  太原: [37.5, 38.3, 112.1, 113.0], 石家庄: [37.7, 38.5, 113.9, 115.0],
  兰州: [35.8, 36.5, 103.3, 104.5], 乌鲁木齐: [43.4, 44.2, 87.1, 88.0],
  拉萨: [29.5, 30.0, 90.8, 91.6], 香港: [22.1, 22.6, 113.8, 114.4],
  澳门: [22.1, 22.2, 113.5, 113.6], 台北: [24.9, 25.2, 121.4, 121.7],
  珠海: [22.0, 22.5, 113.0, 113.7], 桂林: [24.9, 25.5, 110.0, 110.6],
  丽江: [26.7, 27.1, 100.0, 100.5], 大理: [25.5, 26.0, 100.0, 100.4],
  九寨沟: [32.9, 33.3, 103.6, 104.2], 张家界: [29.0, 29.6, 110.2, 110.9],
  敦煌: [39.9, 40.4, 94.4, 95.1], 海口: [19.8, 20.2, 110.1, 110.6],
  洛阳: [34.5, 34.9, 112.1, 112.9], 开封: [34.6, 35.0, 114.1, 114.6],
  敦煌: [39.9, 40.4, 94.4, 95.1], 西宁: [36.4, 36.9, 101.4, 102.1],
  银川: [38.2, 38.8, 105.9, 106.6], 南昌: [28.4, 29.0, 115.6, 116.2],
  宁波: [29.6, 30.1, 121.3, 121.9], 温州: [27.7, 28.3, 120.4, 121.2],
  无锡: [31.4, 31.9, 119.9, 120.6], 佛山: [22.8, 23.4, 112.8, 113.4],
  东莞: [22.7, 23.2, 113.6, 114.2], 惠州: [22.8, 23.4, 114.1, 114.8],
  泉州: [24.6, 25.1, 118.3, 118.9], 烟台: [37.2, 37.8, 120.8, 121.7],
  威海: [37.2, 37.6, 121.9, 122.5], 桂林阳朔: [24.6, 25.0, 110.3, 110.7],
}

function cityOf(lat, lng) {
  for (const [name, [a, b, c, d]] of Object.entries(CITY_BOX))
    if (lat >= a && lat <= b && lng >= c && lng <= d) return name
  return null
}

// PowerShell System.Drawing 读 JPEG EXIF GPS（只读文件）
const GPS_PS = `
param([string]$img)
Add-Type -AssemblyName System.Drawing
$i = [System.Drawing.Bitmap]::new($img)
function Rat($p,$o){ [BitConverter]::ToUInt32($p.Value,$o) / [Math]::Max(1,[BitConverter]::ToUInt32($p.Value,$o+4)) }
try {
  $latP = $i.GetPropertyItem(2); $lonP = $i.GetPropertyItem(4)
  $latRef = [Text.Encoding]::ASCII.GetString($i.GetPropertyItem(1).Value).Trim([char]0)
  $lonRef = [Text.Encoding]::ASCII.GetString($i.GetPropertyItem(3).Value).Trim([char]0)
  $lat = (Rat $latP 0) + (Rat $latP 8)/60 + (Rat $latP 16)/3600
  $lon = (Rat $lonP 0) + (Rat $lonP 8)/60 + (Rat $lonP 16)/3600
  if ($latRef -eq 'S') { $lat = -$lat }; if ($lonRef -eq 'W') { $lon = -$lon }
  Write-Output "$lat,$lon"
} catch { Write-Output "" } finally { $i.Dispose() }
`

export function apply(ctx) {
  ctx.tools.register(defineTool({
    name: 'footprint_photos',
    description:
      '自动足迹补充：扫照片文件夹读 EXIF GPS 坐标，匹配内置城市框自动判去过哪些城市' +
      '（只读 EXIF 不外发；坐标不在框内的只报坐标）。国内主要城市+热门景区有框。',
    parameters: {
      dir: { type: 'string', required: true, description: '照片目录' },
      maxScan: { type: 'integer', description: '最多扫多少张 jpg（默认 2000）' },
    },
    output: { schema: { type: 'object', additionalProperties: false, properties: {
      scanned: { type: 'integer' }, withGps: { type: 'integer' },
      cities: { type: 'array', items: { type: 'string' } }, unmapped: { type: 'integer' } } },
      render: (_a, v) => [{ type: 'text', text: `扫 ${v.scanned} 张，${v.withGps} 张带定位，识别城市：${v.cities.join('、') || '无'}` }] },
    isConcurrencySafe: () => true,
    async execute(args) {
      if (process.platform !== 'win32') throw new Error('footprint_photos: 目前只支持 Windows')
      const dir = String(args.dir || '').trim()
      if (!existsSync(dir)) throw new Error(`footprint_photos: 目录不存在 ${dir}`)
      const maxScan = Math.min(Number.isFinite(+args.maxScan) ? +args.maxScan : 2000, 20000)
      const files = []
      const walk = (d, depth) => {
        if (depth > 6 || files.length >= maxScan) return
        let es
        try { es = readdirSync(d, { withFileTypes: true }) } catch { return }
        for (const e of es) {
          const p = join(d, e.name)
          if (e.isDirectory()) { walk(p, depth + 1); continue }
          if (/\.jpe?g$/i.test(e.name)) files.push(p)
          if (files.length >= maxScan) return
        }
      }
      walk(dir, 0)
      const cities = new Set()
      const unmappedCoords = []
      let withGps = 0
      for (const f of files) {
        try {
          const { stdout } = await execFileP('powershell', ['-NoProfile', '-Command', GPS_PS, '-img', f],
            { timeout: 15000, windowsHide: true })
          const m = stdout.trim().match(/^(-?\d+\.?\d*),(-?\d+\.?\d*)$/)
          if (!m) continue
          withGps++
          const c = cityOf(parseFloat(m[1]), parseFloat(m[2]))
          if (c) cities.add(c); else unmappedCoords.push(m[0])
        } catch { }
        if (files.indexOf(f) > 3000) break
      }
      if (withGps) {
        mkdirSync(STORE, { recursive: true })
        if (!existsSync(EXTRA)) writeFileSync(EXTRA, 'year,city,note\n', 'utf8')
        for (const c of cities) appendFileSync(EXTRA, `,${c},照片EXIF自动识别\n`, 'utf8')
      }
      return { scanned: files.length, withGps, cities: [...cities].sort(), unmapped: unmappedCoords.length }
    },
    presentCall: (a) => ({ card: 'generic', title: '照片足迹', kind: 'other', rawInput: a }),
  }))

  ctx.tools.register(defineTool({
    name: 'footprint_add',
    description: '手动补一条足迹：某年去过某城市（自动走不到的历史足迹靠这个补）。',
    parameters: {
      city: { type: 'string', required: true, description: '城市名' },
      year: { type: 'string', description: '年份（如 2024），不填记为未知年份' },
      note: { type: 'string', description: '可选备注' },
    },
    output: { schema: { type: 'object', additionalProperties: false, properties: { file: { type: 'string' } } },
      render: (_a, v) => [{ type: 'text', text: `已补足迹 → ${v.file}` }] },
    isConcurrencySafe: () => false,
    async execute(args) {
      const city = String(args.city || '').trim()
      if (!city) throw new Error('footprint_add: city 不能为空')
      mkdirSync(STORE, { recursive: true })
      if (!existsSync(EXTRA)) writeFileSync(EXTRA, 'year,city,note\n', 'utf8')
      appendFileSync(EXTRA, `${args.year || ''},${city.replace(/,/g, '，')},${(args.note || '').replace(/,/g, '，')}\n`, 'utf8')
      return { file: EXTRA }
    },
    presentCall: (a) => ({ card: 'generic', title: '补足迹', kind: 'other', rawInput: a }),
  }))

  ctx.tools.register(defineTool({
    name: 'footprint_map',
    description:
      '汇总足迹：合并行程表（connector-travel 的 trips.csv）和手动补的城市，' +
      '按年份×城市出足迹清单，写 markdown 到 ~/.dsh/connector-footprints/。',
    parameters: {},
    output: { schema: { type: 'object', additionalProperties: false, properties: {
      cities: { type: 'integer' }, years: { type: 'integer' }, file: { type: 'string' },
      byYear: { type: 'object', additionalProperties: true } } },
      render: (_a, v) => [{ type: 'text', text: `${v.cities} 个城市、跨 ${v.years} 年 → ${v.file}` }] },
    isConcurrencySafe: () => true,
    async execute() {
      const byYear = {}
      const add = (year, city) => {
        if (!city) return
        const y = String(year || '').slice(0, 4) || '未知'
        if (!/^\d{4}$/.test(y)) return
        (byYear[y] ||= new Set()).add(city)
      }
      if (existsSync(TRIPS)) {
        for (const l of readFileSync(TRIPS, 'utf8').split('\n').slice(1)) {
          const c = l.split(',')
          if (c.length > 3) { add(c[0], c[2]); add(c[0], c[3]) }
        }
      }
      if (existsSync(EXTRA)) {
        for (const l of readFileSync(EXTRA, 'utf8').split('\n').slice(1)) {
          const c = l.split(',')
          if (c.length > 1) add(c[0], c[1])
        }
      }
      const out = Object.fromEntries(Object.entries(byYear).sort(([a], [b]) => a.localeCompare(b))
        .map(([y, s]) => [y, [...s].sort()]))
      const cities = new Set(Object.values(out).flat())
      if (!cities.size) throw new Error('还没有足迹数据：用 travel_add 记行程，或 footprint_add 手动补城市')
      mkdirSync(STORE, { recursive: true })
      const file = join(STORE, '足迹.md')
      writeFileSync(file, ['# 我的足迹', '',
        `> ${cities.size} 个城市，${Object.keys(out).length} 个年份　生成：${new Date().toISOString().slice(0, 10)}`, '',
        ...Object.entries(out).map(([y, cs]) => `## ${y}（${cs.length} 城）\n\n${cs.map(c => `- ${c}`).join('\n')}`), ''].join('\n\n'), 'utf8')
      return { cities: cities.size, years: Object.keys(out).length, file, byYear: out }
    },
    presentCall: (a) => ({ card: 'generic', title: '汇总足迹', kind: 'other', rawInput: a }),
  }))

  ctx.effect(() => ctx.skills.registerProvider(() => createSkillProvider(ctx)))
}
