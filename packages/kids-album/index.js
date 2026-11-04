/**
 * mino-connector-kids-album —— 孩子相册连接器（域 28，三批攻坚·本地整理形态）。
 * kids_timeline：扫照片文件夹，按孩子生日换算月龄/年龄分组，生成成长时间线 markdown。
 * 不复制不移动照片，只产出一份索引文档。生日用户给，隐私不出本机。
 */
import { existsSync, readdirSync, statSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join, dirname, extname } from 'node:path'
import { homedir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { loadHostDeps } from './hostdeps.mjs'
import { createSkillProvider } from './skill-provider.mjs'

const PKG_DIR = dirname(fileURLToPath(import.meta.url))
const PKG = JSON.parse(readFileSync(join(PKG_DIR, 'package.json'), 'utf8'))
const STORE = join(process.env.DSH_HOME || join(homedir(), '.dsh'), 'connector-kids-album')

export const name = PKG.name
export const inject = ['skills', 'tools']
const defineTool = (await loadHostDeps()).defineTool

const IMG = ['.jpg', '.jpeg', '.png', '.heic', '.webp', '.mp4', '.mov', '.3gp']

function photoMonth(name, mtime) {
  const m = name.match(/(20\d{2})[-_.]?(0[1-9]|1[0-2])/) || mtime.toISOString().match(/(20\d{2})-(\d{2})/)
  return m ? `${m[1]}-${m[2]}` : mtime.toISOString().slice(0, 7)
}

function ageLabel(month, birth) {
  const [y, m] = month.split('-').map(Number)
  const [by, bm] = birth.split('-').map(Number)
  const diff = (y - by) * 12 + (m - bm)
  if (diff < 0) return `${month}（出生前）`
  if (diff < 12) return `${diff} 个月`
  const yr = Math.floor(diff / 12), mo = diff % 12
  return mo ? `${yr} 岁 ${mo} 个月` : `${yr} 岁`
}

export function apply(ctx) {
  ctx.tools.register(defineTool({
    name: 'kids_timeline',
    description:
      '把孩子照片文件夹按生日换算成成长时间线：传照片目录 + 孩子生日（YYYY-MM），' +
      '按月龄/年龄分组统计，写一份成长时间线 markdown 到 ~/.dsh/connector-kids-album/。只读。',
    parameters: {
      dir: { type: 'string', required: true, description: '照片文件夹' },
      birth: { type: 'string', required: true, description: '孩子出生年月 YYYY-MM（如 2023-06）' },
      name: { type: 'string', description: '可选：孩子称呼（写进文档标题）' },
    },
    output: { schema: { type: 'object', additionalProperties: false, properties: {
      photos: { type: 'integer' }, months: { type: 'integer' }, file: { type: 'string' },
      timeline: { type: 'object', additionalProperties: true } } },
      render: (_a, v) => [{ type: 'text', text: `成长时间线：${v.photos} 张照片跨 ${v.months} 个月 → ${v.file}` }] },
    isConcurrencySafe: () => true,
    async execute(args) {
      const dir = String(args.dir || '').trim()
      const birth = String(args.birth || '').match(/^(\d{4})-(\d{1,2})$/)
      if (!existsSync(dir)) throw new Error(`kids_timeline: 目录不存在 ${dir}`)
      if (!birth) throw new Error('kids_timeline: birth 用 YYYY-MM 格式（如 2023-06）')
      const byMonth = {}, byAge = {}
      let total = 0
      const walk = (d, depth) => {
        if (depth > 8) return
        let es
        try { es = readdirSync(d, { withFileTypes: true }) } catch { return }
        for (const e of es) {
          const p = join(d, e.name)
          if (e.isDirectory()) { walk(p, depth + 1); continue }
          if (!IMG.includes(extname(e.name).toLowerCase())) continue
          let st
          try { st = statSync(p) } catch { continue }
          const month = photoMonth(e.name, st.mtime)
          byMonth[month] = (byMonth[month] || 0) + 1
          const age = ageLabel(month, `${birth[1]}-${birth[2].padStart(2, '0')}`)
          byAge[age] = (byAge[age] || 0) + 1
          total++
        }
      }
      walk(dir, 0)
      if (!total) throw new Error(`kids_timeline: ${dir} 里没找到照片/视频`)
      const kidName = args.name ? String(args.name) : '宝贝'
      mkdirSync(STORE, { recursive: true })
      const file = join(STORE, `${kidName}-成长时间线.md`)
      const months = Object.keys(byMonth).sort()
      const md = [`# ${kidName}的成长时间线`, '',
        `> 来源：${dir}　生成：${new Date().toISOString().slice(0, 10)}　共 ${total} 张`, '',
        '## 按年龄', '',
        ...Object.entries(byAge).map(([k, n]) => `- **${k}**：${n} 张`), '',
        '## 按月', '',
        ...months.map(m => `- ${m}（${ageLabel(m, `${birth[1]}-${birth[2].padStart(2, '0')}`)}）：${byMonth[m]} 张`), '']
      writeFileSync(file, md.join('\n'), 'utf8')
      return { photos: total, months: months.length, file, timeline: byAge }
    },
    presentCall: (a) => ({ card: 'generic', title: '生成成长时间线', kind: 'other', rawInput: a }),
  }))

  ctx.effect(() => ctx.skills.registerProvider(() => createSkillProvider(ctx)))
}
