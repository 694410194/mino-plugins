/**
 * mino-connector-footprints —— 足迹连接器（三批域：足迹）。
 * 从 connector-travel 的 trips.csv + 用户手动补充的城市记录汇总足迹：
 * 去过的城市×年份矩阵，写足迹 markdown。手动导入兜底形态。
 */
import { existsSync, readFileSync, writeFileSync, appendFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { homedir } from 'node:os'
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

export function apply(ctx) {
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
