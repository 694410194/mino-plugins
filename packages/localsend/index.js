/**
 * mino-connector-localsend —— 文件传输连接器（工具连接器：LocalSend）。
 * LocalSend 是局域网开源传输工具（localsend.app，设备开 App 后有本地
 * HTTP API :53317）。本插件：发现设备 + 向对方发文件/文本。
 */
import { existsSync, readFileSync, statSync } from 'node:fs'
import { join, dirname, basename } from 'node:path'
import { homedir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { loadHostDeps } from './hostdeps.mjs'
import { createSkillProvider } from './skill-provider.mjs'

const PKG_DIR = dirname(fileURLToPath(import.meta.url))
const PKG = JSON.parse(readFileSync(join(PKG_DIR, 'package.json'), 'utf8'))

export const name = PKG.name
export const inject = ['skills', 'tools']
const defineTool = (await loadHostDeps()).defineTool

const FINGERPRINT = 'mino-' + Math.random().toString(36).slice(2, 10)

async function api(ip, path, body, timeout = 10000) {
  const url = `http://${ip}:53317/api/localsend/v2/${path}`
  const res = await fetch(url, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined, signal: AbortSignal.timeout(timeout) })
  if (!res.ok) throw new Error(`LocalSend ${ip} HTTP ${res.status}`)
  return res.json().catch(() => ({}))
}

export function apply(ctx) {
  ctx.tools.register(defineTool({
    name: 'localsend_scan',
    description: '扫描局域网里开着 LocalSend 的设备（多播不可用时扫常见网段的 :53317）。',
    parameters: {
      subnet: { type: 'string', description: '网段前缀如 192.168.1（默认自动猜本机网段）' },
    },
    output: { schema: { type: 'object', additionalProperties: false, properties: {
      devices: { type: 'array', items: { type: 'object', additionalProperties: true } } } },
      render: (_a, v) => [{ type: 'text', text: `${v.devices.length} 台设备：` + v.devices.map(d => `${d.alias}(${d.ip})`).join('；') }] },
    isConcurrencySafe: () => true,
    async execute(args) {
      const { networkInterfaces } = await import('node:os')
      let subnet = String(args.subnet || '')
      if (!subnet) {
        for (const list of Object.values(networkInterfaces()))
          for (const i of list || [])
            if (i.family === 'IPv4' && !i.internal && i.address.startsWith('192.168.')) { subnet = i.address.split('.').slice(0, 3).join('.'); break }
      }
      if (!subnet) throw new Error('localsend_scan: 给网段前缀，如 192.168.1')
      const probes = Array.from({ length: 254 }, (_, i) => `${subnet}.${i + 1}`)
      const found = []
      await Promise.all(probes.map(async (ip) => {
        try {
          const res = await fetch(`http://${ip}:53317/api/localsend/v2/info`, { signal: AbortSignal.timeout(1500) })
          if (res.ok) { const j = await res.json().catch(() => ({})); found.push({ ip, alias: j.alias || '?', version: j.version || '' }) }
        } catch { }
      }))
      return { devices: found.sort((a, b) => a.ip.localeCompare(b.ip)) }
    },
    presentCall: (a) => ({ card: 'generic', title: '扫设备', kind: 'other', rawInput: a }),
  }))

  ctx.tools.register(defineTool({
    name: 'localsend_send',
    description: '用 LocalSend 把本地文件或一段文本发到局域网里开 LocalSend 的设备（先用 localsend_scan 拿 IP）。',
    parameters: {
      ip: { type: 'string', required: true, description: '目标设备 IP' },
      file: { type: 'string', description: '要发的本地文件路径' },
      text: { type: 'string', description: '或：直接发一段文本' },
    },
    output: { schema: { type: 'object', additionalProperties: true },
      render: (_a, v) => [{ type: 'text', text: v.状态 || '已发送' }] },
    isConcurrencySafe: () => false,
    async execute(args) {
      const ip = String(args.ip || '').trim()
      if (!ip) throw new Error('localsend_send: 给目标 IP')
      const files = {}
      if (args.file) {
        const f = String(args.file)
        if (!existsSync(f)) throw new Error(`localsend_send: 文件不存在 ${f}`)
        const st = statSync(f)
        files[basename(f)] = { id: '0', fileName: basename(f), size: st.size, fileType: 'application/octet-stream' }
      } else if (args.text) {
        files['message.txt'] = { id: '0', fileName: 'message.txt', size: Buffer.byteLength(String(args.text)), fileType: 'text/plain' }
      } else throw new Error('localsend_send: 给文件路径或文本')
      const info = { alias: 'Mino', version: '2.1', deviceModel: 'Mino', deviceType: 'desktop', fingerprint: FINGERPRINT, port: 53317, protocol: 'http', download: false }
      const prep = await api(ip, 'prepare-upload', { info, files })
      const sessionId = prep.sessionId
      const fileTokens = prep.files || {}
      for (const [name, meta] of Object.entries(files)) {
        const token = fileTokens[meta.id] || Object.values(fileTokens)[0]
        const body = args.text && !args.file ? Buffer.from(String(args.text)) : readFileSync(String(args.file))
        const res = await fetch(`http://${ip}:53317/api/localsend/v2/upload?sessionId=${sessionId}&fileId=${meta.id}&token=${token}`,
          { method: 'POST', headers: { 'Content-Type': 'application/octet-stream' }, body, signal: AbortSignal.timeout(60000) })
        if (!res.ok) throw new Error(`上传失败 HTTP ${res.status}（对方可能点了拒绝）`)
      }
      return { 状态: `已发给 ${ip}（对方需在 LocalSend 里确认接收）` }
    },
    presentCall: (a) => ({ card: 'generic', title: '发文件', kind: 'other', rawInput: a }),
  }))

  ctx.effect(() => ctx.skills.registerProvider(() => createSkillProvider(ctx)))
}
