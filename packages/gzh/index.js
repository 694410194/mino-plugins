/**
 * mino-connector-gzh —— 公众号文章连接器（conn-reading 域）。
 * 把 mp.weixin.qq.com 公开文章抓下来存成 markdown 留档（防原文删除）。
 * 公开页面、无需凭据；正文只在本机处理，产出文件写用户磁盘。
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
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

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36'

const stripTags = (html) => html
  .replace(/<script[\s\S]*?<\/script>/gi, '')
  .replace(/<style[\s\S]*?<\/style>/gi, '')
  .replace(/<img[^>]+src="([^"]*data-src[^"]*|[^"]+)"[^>]*>/gi, (_m, s) => `\n![](${s.replace(/&amp;/g, '&')})\n`)
  .replace(/<img[^>]+data-src="([^"]+)"[^>]*>/gi, (_m, s) => `\n![](${s.replace(/&amp;/g, '&')})\n`)
  .replace(/<br\s*\/?>/gi, '\n')
  .replace(/<\/(p|div|h[1-6]|li|blockquote|section|tr)>/gi, '\n\n')
  .replace(/<h([1-6])[^>]*>/gi, (_m, n) => '\n' + '#'.repeat(+n) + ' ')
  .replace(/<li[^>]*>/gi, '\n- ')
  .replace(/<[^>]+>/g, '')
  .replace(/&nbsp;/g, ' ').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
  .replace(/\n{3,}/g, '\n\n').trim()

export function apply(ctx) {
  ctx.tools.register(defineTool({
    name: 'gzh_article_save',
    description:
      '把微信公众号文章保存成 markdown 文件留档（防原文被删/不可见）。' +
      '传入文章链接 mp.weixin.qq.com/s/xxx，默认存到 文档/articles/，可用 dir 指定目录。',
    parameters: {
      url: { type: 'string', required: true, description: '公众号文章链接（https://mp.weixin.qq.com/s/...）' },
      dir: { type: 'string', description: '可选：保存目录（默认 <用户文档>/articles）' },
    },
    output: { schema: { type: 'object', additionalProperties: false, properties: {
      file: { type: 'string' }, title: { type: 'string' }, author: { type: 'string' }, chars: { type: 'integer' } } },
      render: (_a, v) => [{ type: 'text', text: `已存档《${v.title}》→ ${v.file}` }] },
    isConcurrencySafe: () => true,
    async execute(args) {
      const url = String(args.url || '').trim()
      if (!/^https?:\/\/mp\.weixin\.qq\.com\//.test(url)) throw new Error('gzh_article_save: 只支持 mp.weixin.qq.com 的公众号文章链接')
      const res = await fetch(url, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(20000) })
      if (!res.ok) throw new Error(`gzh_article_save: 抓取失败 HTTP ${res.status}（文章可能已删或需验证）`)
      const html = await res.text()
      const title = html.match(/<meta property="og:title" content="([^"]*)"/)?.[1]
        || html.match(/var msg_title = '([^']*)'/)?.[1]
        || html.match(/<title>([^<]*)<\/title>/)?.[1]?.replace(/_/g, '').trim() || '未命名文章'
      const author = html.match(/<meta name="author" content="([^"]*)"/)?.[1]
        || html.match(/var nickname = '([^']*)'/)?.[1] || ''
      const pubTime = html.match(/var createTime = '([^']*)'/)?.[1] || html.match(/var ct = "(\d+)"/)?.[1] || ''
      const contentHtml = html.match(/<div[^>]+id="js_content"[^>]*>([\s\S]*?)<\/div>\s*<script/i)?.[1]
        || html.match(/<div[^>]+id="js_content"[^>]*>([\s\S]*)<\/div>/i)?.[1] || ''
      if (!contentHtml.trim()) throw new Error('gzh_article_save: 没抓到正文（页面结构变了或需要验证）')
      const body = stripTags(contentHtml)
      const safe = title.replace(/[\\/:*?"<>|]/g, '_').slice(0, 60)
      const dir = args.dir ? String(args.dir) : join(homedir(), 'Documents', 'articles')
      mkdirSync(dir, { recursive: true })
      const file = join(dir, `${safe}.md`)
      writeFileSync(file, `# ${title}\n\n> 来源：${author || '公众号'}　存档时间：${new Date().toISOString().slice(0, 10)}${pubTime ? `　原文发布：${pubTime}` : ''}\n> 链接：${url}\n\n${body}\n`, 'utf8')
      return { file, title, author, chars: body.length }
    },
    presentCall: (a) => ({ card: 'generic', title: '存公众号文章', kind: 'other', rawInput: a }),
  }))

  ctx.effect(() => ctx.skills.registerProvider(() => createSkillProvider(ctx)))
}
