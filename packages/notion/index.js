/**
 * mino-connector-notion —— Notion 连接器（官方 REST API，2022-06-28 版）。
 * 凭据走官方 credentials 服务缝：integration token 经 cred_set 存 NOTION_TOKEN
 *（或配置文件 tokenRef 改名）；文件明文 token 为回退路径。
 * 配置 ~/.dsh/connector-notion.json：{"tokenRef":"NOTION_TOKEN","token":"ntn_...","baseUrl":"https://api.notion.com"}
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { homedir } from 'node:os'

const CFG_PATH = join(process.env.DSH_HOME || join(homedir(), '.dsh'), 'connector-notion.json')
const API_VERSION = '2022-06-28'
const DEFAULT_REF = 'NOTION_TOKEN'
const REF_RE = /^[A-Za-z_][A-Za-z0-9_]*$/

export const name = 'mino-connector-notion'
export const inject = ['tools', 'credentials']

const NEED_CFG = `notion 需要 integration token：cred_set NOTION_TOKEN=<token> 存进凭据库，
或在 ${CFG_PATH.replace(/\//g, '\\')} 填 {"token":"ntn_..."}（tokenRef 可改引用名）`

function loadCfg() {
  try { return JSON.parse(readFileSync(CFG_PATH, 'utf8')) } catch { return {} }
}

async function tokenOf(ctx, cfg) {
  const ref = String(cfg?.tokenRef || DEFAULT_REF)
  if (REF_RE.test(ref)) {
    try {
      const v = await ctx.get('credentials')?.resolve?.(ref)
      if (v?.value) return v.value
    } catch { /* 凭据服务不可达回落文件值 */ }
  }
  return cfg?.token
}

async function api(ctx, path, options = {}) {
  const cfg = loadCfg()
  const token = await tokenOf(ctx, cfg)
  if (!token) throw new Error(NEED_CFG)
  const base = (cfg.baseUrl || 'https://api.notion.com').replace(/\/$/, '')
  const res = await fetch(base + path, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Notion-Version': API_VERSION,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    signal: AbortSignal.timeout(20000),
  })
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(`notion ${path}: HTTP ${res.status} ${body?.message || ''}`.trim())
  return body
}

function pageSummary(p) {
  const title = Object.values(p?.properties || {})
    .find(prop => prop?.type === 'title')?.title?.map(t => t.plain_text).join('') || '(untitled)'
  return { id: p.id, title, url: p.url, edited: p.last_edited_time, type: p.object }
}

export function apply(ctx) {
  ctx.tools.register({
    name: 'notion_search',
    description: '搜你的 Notion 工作区（页面/库标题或全文关键词）。凭据走凭据库 NOTION_TOKEN。',
    parameters: {
      type: 'object', additionalProperties: false,
      properties: {
        q: { type: 'string', description: '关键词，空=列最近编辑' },
        limit: { type: 'integer', description: '最多多少条（默认 10）' },
      },
    },
    output: {
      schema: { type: 'object', additionalProperties: true },
      render: (_a, v) => [{ type: 'text', text: `命中 ${v?.count ?? 0} 条` }],
    },
    isConcurrencySafe: () => true,
    async execute(args) {
      const res = await api(ctx, '/v1/search', {
        method: 'POST',
        body: JSON.stringify({
          ...(args.q ? { query: String(args.q) } : {}),
          page_size: Math.min(Number.isFinite(+args.limit) ? +args.limit : 10, 50),
          sort: { direction: 'descending', timestamp: 'last_edited_time' },
        }),
      })
      const items = (res.results || []).map(pageSummary)
      return { count: items.length, items }
    },
    presentCall: () => ({ card: 'generic', title: '搜 Notion', kind: 'other' }),
  })

  ctx.tools.register({
    name: 'notion_page',
    description: '按 id 取一个 Notion 页面的标题/链接/最近编辑时间。',
    parameters: {
      type: 'object', additionalProperties: false, required: ['id'],
      properties: { id: { type: 'string', description: '页面 id（notion_search 返回的）' } },
    },
    output: {
      schema: { type: 'object', additionalProperties: true },
      render: (_a, v) => [{ type: 'text', text: v?.title || '未找到' }],
    },
    isConcurrencySafe: () => true,
    async execute(args) {
      const p = await api(ctx, `/v1/pages/${encodeURIComponent(String(args.id))}`)
      return pageSummary(p)
    },
    presentCall: () => ({ card: 'generic', title: '看 Notion 页面', kind: 'other' }),
  })
}
