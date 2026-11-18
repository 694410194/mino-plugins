/**
 * mino-connector-qqmeeting —— 腾讯会议连接器（企业自建应用 AKSK 鉴权）。
 * 签名按官方 TC3-HMAC-SHA256：stringToSign = METHOD\n +
 * X-TC-Key/X-TC-Nonce/X-TC-Timestamp（参数名字典序）+ \n + URI + \n + Body；
 * 签名 = base64(hex(HMAC-SHA256(SecretKey, stringToSign)))。
 * 凭据走官方 credentials 缝：cred_set TXMEET_SECRET_ID/TXMEET_SECRET_KEY；
 * 配置文件 ~/.dsh/connector-qqmeeting.json 存非密项+回退明文：
 * {"appId":"...","sdkId":"...","secretId":"...","secretKey":"...","baseUrl":"https://api.meeting.qq.com"}
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { homedir } from 'node:os'
import { createHmac, randomInt } from 'node:crypto'

const CFG_PATH = join(process.env.DSH_HOME || join(homedir(), '.dsh'), 'connector-qqmeeting.json')
const REF_RE = /^[A-Za-z_][A-Za-z0-9_]*$/

export const name = 'mino-connector-qqmeeting'
export const inject = ['tools', 'credentials']

const NEED_CFG = `腾讯会议需要企业自建应用凭证：cred_set TXMEET_SECRET_ID/TXMEET_SECRET_KEY，
并在 ${CFG_PATH.replace(/\//g, '\\')} 填 {"appId":"企业ID","sdkId":"应用ID"}`

function loadCfg() {
  try { return JSON.parse(readFileSync(CFG_PATH, 'utf8')) } catch { return {} }
}

async function resolveRef(ctx, name, fallback) {
  if (REF_RE.test(name)) {
    try {
      const v = await ctx.get('credentials')?.resolve?.(name)
      if (v?.value) return v.value
    } catch { /* 凭据服务不可达回落文件值 */ }
  }
  return fallback
}

async function creds(ctx) {
  const cfg = loadCfg()
  const secretId = await resolveRef(ctx, 'TXMEET_SECRET_ID', cfg.secretId)
  const secretKey = await resolveRef(ctx, 'TXMEET_SECRET_KEY', cfg.secretKey)
  if (!cfg.appId || !secretId || !secretKey) throw new Error(NEED_CFG)
  return { cfg, secretId, secretKey }
}

/** 官方签名串：METHOD\n + 三个 X-TC 头字典序串 + \n + URI + \n + Body。 */
function sign(method, uri, body, secretId, secretKey) {
  const timestamp = String(Math.floor(Date.now() / 1000))
  const nonce = String(randomInt(1, 2 ** 31 - 1))
  const headers = `X-TC-Key=${secretId}&X-TC-Nonce=${nonce}&X-TC-Timestamp=${timestamp}`
  const stringToSign = `${method}\n${headers}\n${uri}\n${body}`
  const hex = createHmac('sha256', secretKey).update(stringToSign, 'utf8').digest('hex')
  return { timestamp, nonce, signature: Buffer.from(hex, 'utf8').toString('base64') }
}

async function api(ctx, method, uri, body = '') {
  const { cfg, secretId, secretKey } = await creds(ctx)
  const { timestamp, nonce, signature } = sign(method, uri, body, secretId, secretKey)
  const base = (cfg.baseUrl || 'https://api.meeting.qq.com').replace(/\/$/, '')
  const res = await fetch(base + uri, {
    method,
    body: body || undefined,
    headers: {
      'Content-Type': 'application/json',
      AppId: String(cfg.appId),
      ...(cfg.sdkId ? { SdkId: String(cfg.sdkId) } : {}),
      'X-TC-Key': secretId,
      'X-TC-Timestamp': timestamp,
      'X-TC-Nonce': nonce,
      'X-TC-Signature': signature,
      'X-TC-Registered': '1',
    },
    signal: AbortSignal.timeout(20000),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok || (json.error_info && json.error_info.error_code)) {
    throw new Error(`qqmeeting ${uri}: HTTP ${res.status} ${json.error_info?.message || json.error_info?.error_code || ''}`.trim())
  }
  return json
}

function meetingSummary(m) {
  return {
    id: m.meeting_id || m.meeting_code,
    subject: m.subject,
    start: m.start_time ? new Date(Number(m.start_time) * 1000).toISOString() : undefined,
    end: m.end_time ? new Date(Number(m.end_time) * 1000).toISOString() : undefined,
    status: m.status,
  }
}

export function apply(ctx) {
  ctx.tools.register({
    name: 'mtg_list',
    description: '列腾讯会议企业账号下某用户的会议（默认近期待开）。凭据走凭据库 TXMEET_*。',
    parameters: {
      type: 'object', additionalProperties: false, required: ['userid'],
      properties: {
        userid: { type: 'string', description: '企业账号 userid' },
        instanceid: { type: 'string', description: '设备类型（默认 1=PC）' },
        page: { type: 'integer', description: '页码（默认 1）' },
        page_size: { type: 'integer', description: '每页（默认 10）' },
      },
    },
    output: {
      schema: { type: 'object', additionalProperties: true },
      render: (_a, v) => [{ type: 'text', text: `会议 ${v?.count ?? 0} 场` }],
    },
    isConcurrencySafe: () => true,
    async execute(args) {
      const qs = new URLSearchParams({
        userid: String(args.userid),
        instanceid: String(args.instanceid || '1'),
        page: String(args.page || 1),
        page_size: String(Math.min(Number.isFinite(+args.page_size) ? +args.page_size : 10, 20)),
      })
      const res = await api(ctx, 'GET', `/v1/meetings?${qs}`)
      const items = (res.meeting_info_list || res.meetings || []).map(meetingSummary)
      return { count: items.length, total: res.total_count, items }
    },
    presentCall: () => ({ card: 'generic', title: '列腾讯会议', kind: 'other' }),
  })

  ctx.tools.register({
    name: 'mtg_get',
    description: '取一个腾讯会议的详情（主题/时间/参会人）。meeting_id 用 mtg_list 返回的。',
    parameters: {
      type: 'object', additionalProperties: false, required: ['meetingId', 'userid'],
      properties: {
        meetingId: { type: 'string', description: '会议 id' },
        userid: { type: 'string', description: '企业账号 userid' },
      },
    },
    output: {
      schema: { type: 'object', additionalProperties: true },
      render: (_a, v) => [{ type: 'text', text: v?.subject || '未找到' }],
    },
    isConcurrencySafe: () => true,
    async execute(args) {
      const qs = new URLSearchParams({ userid: String(args.userid), instanceid: '1' })
      const res = await api(ctx, 'GET', `/v1/meetings/${encodeURIComponent(String(args.meetingId))}?${qs}`)
      const m = Array.isArray(res.meeting_info_list) ? res.meeting_info_list[0] : res
      return meetingSummary(m)
    },
    presentCall: () => ({ card: 'generic', title: '看腾讯会议', kind: 'other' }),
  })
}
