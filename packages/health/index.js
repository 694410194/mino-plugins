/**
 * mino-connector-health —— 健康数据连接器（conn-health 域）。
 * 解析苹果健康导出 export.xml（iPhone 健康 App→导出健康数据→解压 ZIP），
 * 流式逐行解析（文件可能几个 GB），汇总步数/心率/睡眠。只读、本地。
 */
import { createReadStream, existsSync, statSync, readFileSync, mkdirSync } from 'node:fs'
import { createInterface } from 'node:readline'
import { join, dirname } from 'node:path'
import { homedir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { loadHostDeps } from './hostdeps.mjs'
import { createSkillProvider } from './skill-provider.mjs'

const PKG_DIR = dirname(fileURLToPath(import.meta.url))
const PKG = JSON.parse(readFileSync(join(PKG_DIR, 'package.json'), 'utf8'))

export const name = PKG.name
export const inject = ['skills', 'tools']
const defineTool = (await loadHostDeps()).defineTool

const TYPES = {
  steps: 'HKQuantityTypeIdentifierStepCount',
  distance: 'HKQuantityTypeIdentifierDistanceWalkingRunning',
  heartRate: 'HKQuantityTypeIdentifierHeartRate',
  weight: 'HKQuantityTypeIdentifierBodyMass',
  sleep: 'HKCategoryTypeIdentifierSleepAnalysis',
  energy: 'HKQuantityTypeIdentifierActiveEnergyBurned',
}

async function summarizeHealth(file, days) {
  const cutoff = days > 0 ? new Date(Date.now() - days * 864e5) : null
  const rl = createInterface({ input: createReadStream(file, 'utf8'), crlfDelay: Infinity })
  const stats = {}
  let records = 0, scanned = 0
  const minDate = { v: '9999' }, maxDate = { v: '0000' }
  for await (const line of rl) {
    scanned++
    if (!line.includes('<Record ')) continue
    const typeM = line.match(/type="([^"]+)"/)
    if (!typeM) continue
    const type = typeM[1]
    const dateM = line.match(/startDate="([^"]+)"/)
    const valM = line.match(/value="([^"]+)"/)
    if (dateM) {
      const d = dateM[1].slice(0, 10)
      if (d < minDate.v) minDate.v = d
      if (d > maxDate.v) maxDate.v = d
      if (cutoff && new Date(d) < cutoff) continue
    }
    records++
    const key = Object.entries(TYPES).find(([, v]) => v === type)?.[0] || 'other'
    const st = stats[key] ||= { count: 0, total: 0, min: Infinity, max: -Infinity, unit: valM ? (line.match(/unit="([^"]+)"/)?.[1] || '') : '' }
    st.count++
    const v = parseFloat(valM?.[1])
    if (Number.isFinite(v)) { st.total += v; if (v < st.min) st.min = v; if (v > st.max) st.max = v }
    if (scanned > 20_000_000) break // 防爆
  }
  rl.close()
  const summary = {}
  for (const [k, st] of Object.entries(stats)) {
    summary[k] = { 条数: st.count, 合计: Math.round(st.total * 100) / 100, 最大: st.max === -Infinity ? null : st.max, 单位: st.unit }
    if (k === 'heartRate') summary[k] = { 条数: st.count, 平均: Math.round(st.total / st.count), 最高: st.max, 最低: st.min === Infinity ? null : st.min, 单位: st.unit }
  }
  return { records, range: `${minDate.v} ~ ${maxDate.v}`, summary }
}

export function apply(ctx) {
  ctx.tools.register(defineTool({
    name: 'health_summary',
    description:
      '汇总苹果健康导出文件（iPhone 健康 App 导出的 export.xml）。' +
      '按类型统计步数/步行距离/心率/体重/睡眠/活动能量，可限定最近 N 天。本地流式解析，文件再大也不怕。',
    parameters: {
      path: { type: 'string', required: true, description: 'export.xml 的绝对路径（用户从健康 App 导出后解压得到）' },
      days: { type: 'integer', description: '只统计最近 N 天（默认 90，0=全部）' },
    },
    output: { schema: { type: 'object', additionalProperties: false, properties: {
      records: { type: 'integer' }, range: { type: 'string' }, summary: { type: 'object', additionalProperties: true } } },
      render: (_a, v) => [{ type: 'text', text: `健康记录 ${v.records} 条（${v.range}）` }] },
    isConcurrencySafe: () => true,
    async execute(args) {
      const file = String(args.path || '').trim()
      if (!existsSync(file)) throw new Error(`health_summary: 文件不存在 ${file}（iPhone：健康→头像→导出所有健康数据→解压 ZIP）`)
      if (statSync(file).size > 8 * 1024 ** 3) throw new Error('health_summary: 文件超 8GB 上限')
      const days = Number.isFinite(+args.days) ? +args.days : 90
      return await summarizeHealth(file, days)
    },
    presentCall: (a) => ({ card: 'generic', title: '汇总健康数据', kind: 'other', rawInput: a }),
  }))

  ctx.tools.register(defineTool({
    name: 'health_import',
    description:
      '导入其它健康/运动 App 的导出数据：Keep/悦跑圈/美柚 等导出的 CSV/TXT' +
      '（App 内"数据导出/隐私-下载个人信息"路径）。自动抓日期+数值行入本地库。',
    parameters: {
      path: { type: 'string', required: true, description: '导出的 .csv/.txt 文件路径' },
      source: { type: 'string', description: '来源名（keep/yuepao/meiyou/其它）' },
    },
    output: { schema: { type: 'object', additionalProperties: false, properties: { imported: { type: 'integer' } } },
      render: (_a, v) => [{ type: 'text', text: `入库 ${v.imported} 条健康记录` }] },
    isConcurrencySafe: () => false,
    async execute(args) {
      let DatabaseSync
      try { ({ DatabaseSync } = await import('node:sqlite')) } catch { throw new Error('health_import: 运行时缺 node:sqlite') }
      const f = String(args.path || '').trim()
      if (!existsSync(f)) throw new Error(`health_import: 文件不存在 ${f}`)
      const src = String(args.source || 'manual')
      const store = join(process.env.DSH_HOME || join(homedir(), '.dsh'), 'connector-health')
      mkdirSync(store, { recursive: true })
      const db = new DatabaseSync(join(store, 'health.db'))
      db.exec('CREATE TABLE IF NOT EXISTS entries(date TEXT, metric TEXT, value REAL, unit TEXT, source TEXT, raw TEXT)')
      const ins = db.prepare('INSERT INTO entries(date,metric,value,unit,source,raw) VALUES(?,?,?,?,?,?)')
      let n = 0
      db.exec('BEGIN')
      try {
        for (const line of readFileSync(f, 'utf8').split(/\r?\n/)) {
          const l = line.trim()
          const date = l.match(/(20\d{2})[-年/.](\d{1,2})[-月/.](\d{1,2})/)
          const num = l.match(/(\d+(?:\.\d+)?)\s*(步|千卡|kcal|公里|km|kg|公斤|分钟|bpm|次)/i)
          if (!date || !num) continue
          const metric = l.match(/(步数|跑步|步行|骑行|体重|睡眠|心率|卡路里|消耗|运动|经期|距离)/)?.[1] || '记录'
          ins.run(`${date[1]}-${date[2].padStart(2, '0')}-${date[3].padStart(2, '0')}`, metric,
            parseFloat(num[1]), num[2].toLowerCase(), src, l.slice(0, 200))
          n++
          if (n > 200000) break
        }
        db.exec('COMMIT')
      } finally { db.close() }
      if (!n) throw new Error('health_import: 没解析出带日期+数值的记录行')
      return { imported: n }
    },
    presentCall: (a) => ({ card: 'generic', title: '导健康数据', kind: 'other', rawInput: a }),
  }))

  ctx.effect(() => ctx.skills.registerProvider(() => createSkillProvider(ctx)))
}
