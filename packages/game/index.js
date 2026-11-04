/**
 * mino-connector-game —— 游戏数据连接器（目录外域：游戏，对标 PDH 原神/王者）。
 * 原神祈愿记录：玩家自己从游戏抽卡历史页复制 URL（带 authkey），
 * 本插件解析 URL 参数并分页拉取官方接口，汇总各池抽数/五星/保底进度。
 * authkey 时效短（约一天），过期让用户重复制。
 */
import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { homedir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { loadHostDeps } from './hostdeps.mjs'
import { createSkillProvider } from './skill-provider.mjs'

const PKG_DIR = dirname(fileURLToPath(import.meta.url))
const PKG = JSON.parse(readFileSync(join(PKG_DIR, 'package.json'), 'utf8'))
const STORE = join(process.env.DSH_HOME || join(homedir(), '.dsh'), 'connector-game')

export const name = PKG.name
export const inject = ['skills', 'tools']
const defineTool = (await loadHostDeps()).defineTool

const POOLS = { '301': '角色活动祈愿', '302': '武器活动祈愿', '200': '常驻祈愿', '100': '新手祈愿', '500': '集录祈愿' }

async function fetchGacha(url) {
  const u = new URL(url)
  const params = u.searchParams
  const base = `${u.protocol}//${u.host}/gacha_info/api/getGachaLog`
  const authParams = {}
  for (const k of ['authkey_ver', 'sign_type', 'auth_appid', 'lang', 'device_type', 'game_version',
    'region', 'game_biz', 'authkey', 'ext', 'init_type', 'plat_type', 'device_id', 'lang', 'level']) {
    const v = params.get(k); if (v) authParams[k] = v
  }
  const result = {}
  for (const [type, label] of Object.entries(POOLS)) {
    const items = []
    let endId = '0'
    for (let page = 0; page < 40; page++) {
      const q = new URLSearchParams({ ...authParams, gacha_type: type, size: '20', end_id: endId, page: String(page + 1) })
      const res = await fetch(`${base}?${q}`, { headers: { 'User-Agent': 'Mino/1.0' }, signal: AbortSignal.timeout(15000) })
      const j = await res.json().catch(() => null)
      if (j?.retcode !== 0) { if (!items.length) throw new Error(`祈愿接口拒绝：${j?.message || j?.retcode}（authkey 约一天过期，回游戏抽卡历史页重复制 URL）`); break }
      const list = j.data?.list || []
      items.push(...list.map(i => ({ name: i.name, rank: i.rank_type, time: i.time, item: i.item_type })))
      if (list.length < 20) break
      endId = list[list.length - 1].id
    }
    result[label] = items
  }
  return result
}

function gachaSummary(pools) {
  const out = {}
  for (const [label, items] of Object.entries(pools)) {
    if (!items.length) continue
    const fiveStars = items.filter(i => i.rank === '5')
    const sinceFive = items.findIndex(i => i.rank === '5')
    out[label] = {
      总抽数: items.length,
      五星数: fiveStars.length,
      已垫抽数: sinceFive === -1 ? items.length : sinceFive,
      五星记录: fiveStars.map(i => `${i.name}（${i.time}）`).slice(0, 10),
      最早: items[items.length - 1]?.time, 最新: items[0]?.time,
    }
  }
  return out
}

export function apply(ctx) {
  ctx.tools.register(defineTool({
    name: 'gacha_import',
    description:
      '导入原神祈愿记录：把游戏里抽卡历史页（点"详情"后复制地址栏链接，含 authkey）' +
      '整段 URL 粘过来，拉全部历史并汇总各池抽数/五星/保底进度。authkey 约一天过期。',
    parameters: { url: { type: 'string', required: true, description: '抽卡历史页完整 URL' } },
    output: { schema: { type: 'object', additionalProperties: false, properties: {
      pools: { type: 'object', additionalProperties: true }, file: { type: 'string' } } },
      render: (_a, v) => [{ type: 'text', text: `祈愿记录已入 ${Object.keys(v.pools).length} 个池` }] },
    isConcurrencySafe: () => true,
    async execute(args) {
      const url = String(args.url || '').trim()
      if (!/getGachaLog|gacha|webstatic|hoyoverse|mihoyo/i.test(url)) throw new Error('gacha_import: 粘贴游戏抽卡历史页的完整链接（含 authkey）')
      const pools = await fetchGacha(url)
      mkdirSync(STORE, { recursive: true })
      const file = join(STORE, `gacha-${new Date().toISOString().slice(0, 10)}.json`)
      writeFileSync(file, JSON.stringify({ importedAt: new Date().toISOString(), pools }, null, 2), 'utf8')
      return { pools: gachaSummary(pools), file }
    },
    presentCall: (a) => ({ card: 'generic', title: '导祈愿记录', kind: 'other', rawInput: a }),
  }))

  ctx.tools.register(defineTool({
    name: 'gacha_summary',
    description: '看已导入的原神祈愿汇总（各池抽数/五星/保底进度），读本机最后一次导入存档。',
    parameters: {},
    output: { schema: { type: 'object', additionalProperties: true },
      render: (_a, v) => [{ type: 'text', text: `${Object.keys(v).length} 个池` }] },
    isConcurrencySafe: () => true,
    async execute() {
      if (!existsSync(STORE)) throw new Error('还没有导入过祈愿记录，先用 gacha_import')
      const files = readdirSync(STORE).filter(f => f.startsWith('gacha-')).sort()
      if (!files.length) throw new Error('还没有导入过祈愿记录，先用 gacha_import')
      const j = JSON.parse(readFileSync(join(STORE, files[files.length - 1]), 'utf8'))
      return { 导入时间: j.importedAt, ...gachaSummary(j.pools) }
    },
    presentCall: (a) => ({ card: 'generic', title: '看祈愿汇总', kind: 'other', rawInput: a }),
  }))

  ctx.effect(() => ctx.skills.registerProvider(() => createSkillProvider(ctx)))
}
