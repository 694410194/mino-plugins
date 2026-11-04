/**
 * mino-connector-travel —— 出行票据连接器（conn-travel 域，手动导入形态）。
 * 用户把订单详情文本粘进来（12306/航旅/携程/同程的订单页复制），
 * 解析成结构化行程写入本地 CSV。无通道时手动导入兜底（D38「想办法接」）。
 */
import { readFileSync, writeFileSync, existsSync, appendFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { homedir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { loadHostDeps } from './hostdeps.mjs'
import { createSkillProvider } from './skill-provider.mjs'

const PKG_DIR = dirname(fileURLToPath(import.meta.url))
const PKG = JSON.parse(readFileSync(join(PKG_DIR, 'package.json'), 'utf8'))
const STORE = join(process.env.DSH_HOME || join(homedir(), '.dsh'), 'connector-travel')

export const name = PKG.name
export const inject = ['skills', 'tools']
const defineTool = (await loadHostDeps()).defineTool

const CSV = join(STORE, 'trips.csv')
const HEAD = 'date,type,from,to,trainOrFlight,orderNo,price,raw\n'

const PATTERNS = [
  { type: 'train', re: /([GDCKTZ]?\d{1,5})次?[列车车]?(?:票)?/ },
  { type: 'flight', re: /([A-Z]{2}\d{3,4})\s*(?:航班)?/ },
]

function parseTrip(text) {
  const t = String(text).replace(/\s+/g, ' ').trim()
  const out = { date: '', type: 'other', from: '', to: '', trainOrFlight: '', orderNo: '', price: '', raw: t.slice(0, 200) }
  const dm = t.match(/(20\d{2})[-年.\/](\d{1,2})[-月.\/](\d{1,2})/)
  if (dm) out.date = `${dm[1]}-${dm[2].padStart(2, '0')}-${dm[3].padStart(2, '0')}`
  const city = t.match(/([一-龥]{2,6})(?:站|机场)?\s*[-—>到至→]+\s*([一-龥]{2,6})(?:站|机场)?/)
  if (city) { out.from = city[1]; out.to = city[2] }
  const tr = t.match(/\b([GDCKTZ]\d{1,5})\b/)
  const fl = t.match(/\b([A-Z]{2}\d{3,4})\b/)
  if (tr) { out.type = 'train'; out.trainOrFlight = tr[1] }
  else if (fl && !/^GD|CN/.test(fl[1])) { out.type = 'flight'; out.trainOrFlight = fl[1] }
  const pr = t.match(/[¥￥]\s*(\d+(?:\.\d{1,2})?)/) || t.match(/(\d+(?:\.\d{1,2})?)\s*元/)
  if (pr) out.price = pr[1]
  const no = t.match(/(?:订单号?|电子客票号?|票号)[:：\s]*([A-Z0-9]{8,})/i)
  if (no) out.orderNo = no[1]
  return out
}

export function apply(ctx) {
  ctx.tools.register(defineTool({
    name: 'travel_add',
    description:
      '把一条行程订单文本记进本地行程表。用户从 12306/航旅纵横/携程等订单页复制文本粘贴过来即可；' +
      '自动提取日期/出发到达/车次航班/金额。存在 ~/.dsh/connector-travel/trips.csv。',
    parameters: {
      text: { type: 'string', required: true, description: '从订单页复制的行程文本（粘贴原文即可）' },
    },
    output: { schema: { type: 'object', additionalProperties: false, properties: {
      trip: { type: 'object', additionalProperties: true }, file: { type: 'string' } } },
      render: (_a, v) => [{ type: 'text', text: `已记行程：${v.trip.date} ${v.trip.from}→${v.trip.to} ${v.trip.trainOrFlight}` }] },
    isConcurrencySafe: () => false,
    async execute(args) {
      const trip = parseTrip(args.text)
      mkdirSync(STORE, { recursive: true })
      if (!existsSync(CSV)) writeFileSync(CSV, HEAD, 'utf8')
      appendFileSync(CSV, [trip.date, trip.type, trip.from, trip.to, trip.trainOrFlight, trip.orderNo, trip.price,
        `"${trip.raw.replace(/"/g, '""')}"`].join(',') + '\n', 'utf8')
      return { trip, file: CSV }
    },
    presentCall: (a) => ({ card: 'generic', title: '记行程', kind: 'other', rawInput: a }),
  }))

  ctx.tools.register(defineTool({
    name: 'travel_list',
    description: '列本地行程表（~/.dsh/connector-travel/trips.csv），可按年份过滤。',
    parameters: { year: { type: 'string', description: '可选：只看某年，如 2026' } },
    output: { schema: { type: 'object', additionalProperties: false, properties: {
      trips: { type: 'array', items: { type: 'object', additionalProperties: true } }, count: { type: 'integer' } } },
      render: (_a, v) => [{ type: 'text', text: `${v.count} 条行程` }] },
    isConcurrencySafe: () => true,
    async execute(args) {
      if (!existsSync(CSV)) return { trips: [], count: 0 }
      const lines = readFileSync(CSV, 'utf8').split('\n').slice(1).filter(Boolean)
      const year = args.year ? String(args.year) : null
      const trips = lines.map(l => {
        const c = l.split(',')
        return { date: c[0], type: c[1], from: c[2], to: c[3], trainOrFlight: c[4], orderNo: c[5], price: c[6] }
      }).filter(t => !year || t.date.startsWith(year))
      return { count: trips.length, trips }
    },
    presentCall: (a) => ({ card: 'generic', title: '看行程表', kind: 'other', rawInput: a }),
  }))

  ctx.effect(() => ctx.skills.registerProvider(() => createSkillProvider(ctx)))
}
