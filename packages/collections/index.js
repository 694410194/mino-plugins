/**
 * mino-connector-collections —— 收藏夹连接器（conn-social 域，手动导入形态）。
 * 用户把分享文本批量粘进来（抖音口令/小红书笔记/B站分享/普通链接），
 * 解析提取链接+标题，去重归类写入本地收藏目录 markdown。
 * 无 API 通道时的合规兜底：内容只含用户主动提供的东西。
 */
import { readFileSync, existsSync, appendFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { homedir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { loadHostDeps } from './hostdeps.mjs'
import { createSkillProvider } from './skill-provider.mjs'

const PKG_DIR = dirname(fileURLToPath(import.meta.url))
const PKG = JSON.parse(readFileSync(join(PKG_DIR, 'package.json'), 'utf8'))
const STORE = join(process.env.DSH_HOME || join(homedir(), '.dsh'), 'connector-collections')

export const name = PKG.name
export const inject = ['skills', 'tools']
const defineTool = (await loadHostDeps()).defineTool

const MD = join(STORE, 'collections.md')

function classify(url, text) {
  const host = url.match(/https?:\/\/([^/\s]+)/)?.[1] || ''
  if (/bilibili|b23\.tv/.test(host)) return 'B站'
  if (/douyin|iesdouyin/.test(host) || /抖音/.test(text)) return '抖音'
  if (/xiaohongshu|xhslink/.test(host) || /小红书/.test(text)) return '小红书'
  if (/weibo|weibo\.cn/.test(host)) return '微博'
  if (/zhihu/.test(host)) return '知乎'
  if (/weixin\.qq\.com|mp\.weixin/.test(host)) return '公众号'
  if (/tieba/.test(host)) return '贴吧'
  return '其它'
}

function parseItems(text) {
  const items = []
  const seen = new Set()
  for (const m of String(text).matchAll(/https?:\/\/[^\s'"<>\)\]，。）」』]+/g)) {
    const url = m[0].replace(/[\.,;!?]+$/, '')
    if (seen.has(url)) continue
    seen.add(url)
    const line = m.input.slice(Math.max(0, m.index - 60), m.index).trim()
    const title = line.split(/[\r\n]/).pop()?.replace(/[^\x20-\uFFFF]/g, '').trim().slice(0, 60) || ''
    items.push({ url, title, source: classify(url, text) })
  }
  return items
}

export function apply(ctx) {
  ctx.tools.register(defineTool({
    name: 'collect_add',
    description:
      '把一段含链接的分享文本收进本地收藏目录。抖音/小红书/B站/微博/公众号链接自动归类，' +
      '按来源分节写进 ~/.dsh/connector-collections/collections.md。可以一次粘多条。',
    parameters: {
      text: { type: 'string', required: true, description: '粘贴的分享文本（可多行多条）' },
      tag: { type: 'string', description: '可选自定义标签' },
    },
    output: { schema: { type: 'object', additionalProperties: false, properties: {
      added: { type: 'integer' }, file: { type: 'string' },
      items: { type: 'array', items: { type: 'object', additionalProperties: true } } } },
      render: (_a, v) => [{ type: 'text', text: `收藏 ${v.added} 条` }] },
    isConcurrencySafe: () => false,
    async execute(args) {
      const items = parseItems(args.text)
      if (!items.length) throw new Error('collect_add: 文本里没找到链接，把分享内容里的网址一起粘过来')
      mkdirSync(STORE, { recursive: true })
      const date = new Date().toISOString().slice(0, 10)
      const tag = args.tag ? ` #${args.tag}` : ''
      const lines = items.map(i => `- [${i.title || i.url.slice(0, 60)}](${i.url})　${i.source}　${date}${tag}\n`)
      appendFileSync(MD, lines.join(''), 'utf8')
      return { added: items.length, file: MD, items }
    },
    presentCall: (a) => ({ card: 'generic', title: '收进收藏夹', kind: 'other', rawInput: a }),
  }))

  ctx.tools.register(defineTool({
    name: 'collect_list',
    description: '看本地收藏目录（~/.dsh/connector-collections/collections.md），可按来源过滤。',
    parameters: { source: { type: 'string', description: 'B站/抖音/小红书/微博/公众号/知乎/贴吧/其它' } },
    output: { schema: { type: 'object', additionalProperties: false, properties: {
      count: { type: 'integer' }, items: { type: 'array', items: { type: 'string' } } } },
      render: (_a, v) => [{ type: 'text', text: `${v.count} 条收藏` }] },
    isConcurrencySafe: () => true,
    async execute(args) {
      if (!existsSync(MD)) return { count: 0, items: [] }
      const lines = readFileSync(MD, 'utf8').split('\n').filter(l => l.startsWith('- ['))
      const items = args.source ? lines.filter(l => l.includes(String(args.source))) : lines
      return { count: items.length, items: items.slice(-100) }
    },
    presentCall: (a) => ({ card: 'generic', title: '看收藏夹', kind: 'other', rawInput: a }),
  }))

  ctx.effect(() => ctx.skills.registerProvider(() => createSkillProvider(ctx)))
}
