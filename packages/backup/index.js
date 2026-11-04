/**
 * mino-connector-backup —— 手机备份连接器（域 17 扩面）。
 * backup_itunes：读 iTunes 备份目录的 Manifest.db（sqlite），列出备份里
 * 有什么数据（按域统计：照片/短信/通讯录/WhatsApp/健康…），只读。
 * backup_dirs：枚举各备份工具的备份目录（iTunes/华为HiSuite/小米）。
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { homedir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { loadHostDeps } from './hostdeps.mjs'
import { createSkillProvider } from './skill-provider.mjs'

const PKG_DIR = dirname(fileURLToPath(import.meta.url))
const PKG = JSON.parse(readFileSync(join(PKG_DIR, 'package.json'), 'utf8'))
const APPDATA = process.env.APPDATA || join(homedir(), 'AppData', 'Roaming')

export const name = PKG.name
export const inject = ['skills', 'tools']
const defineTool = (await loadHostDeps()).defineTool

let DatabaseSync = null
try { ({ DatabaseSync } = await import('node:sqlite')) } catch { }

const DOMAIN_HINT = {
  'CameraRollDomain': '照片/视频', 'MediaDomain': '媒体', 'HomeDomain': '应用数据',
  'WirelessDomain': '无线', 'SystemPreferencesDomain': '系统设置', 'AppDomain': '应用',
  'DatabaseDomain': '数据库', 'HealthDomain': '健康', 'KeychainDomain': '钥匙串',
}

export function apply(ctx) {
  ctx.tools.register(defineTool({
    name: 'backup_dirs',
    description: '枚举本机各手机备份工具的备份目录（iTunes/华为HiSuite/小米助手）。',
    parameters: {},
    output: { schema: { type: 'object', additionalProperties: false, properties: {
      dirs: { type: 'array', items: { type: 'object', additionalProperties: true } } } },
      render: (_a, v) => [{ type: 'text', text: `${v.dirs.length} 个备份目录` }] },
    isConcurrencySafe: () => true,
    async execute() {
      const spots = [
        { tool: 'iTunes', dir: join(APPDATA, 'Apple Computer', 'MobileSync', 'Backup') },
        { tool: 'iTunes(新Apple Devices)', dir: join(homedir(), 'Apple', 'MobileSync', 'Backup') },
        { tool: '华为HiSuite', dir: join(homedir(), 'Documents', 'Hisuite', 'backup') },
        { tool: '小米助手', dir: join(homedir(), 'Documents', 'MIUI', 'backup') },
      ]
      const dirs = []
      for (const s of spots) {
        if (!existsSync(s.dir)) continue
        try {
          const subs = readdirSync(s.dir, { withFileTypes: true }).filter(e => e.isDirectory())
          dirs.push({ ...s, 备份数: subs.length, 最新: subs.map(e => { try { return statSync(join(s.dir, e.name)).mtime.toISOString().slice(0, 10) } catch { return '' } }).sort().pop() })
        } catch { }
      }
      return { dirs }
    },
    presentCall: (a) => ({ card: 'generic', title: '找备份目录', kind: 'other', rawInput: a }),
  }))

  ctx.tools.register(defineTool({
    name: 'backup_itunes',
    description:
      '读 iTunes 备份的 Manifest.db，列出这个备份里有什么数据' +
      '（按域统计照片/短信/通讯录/健康/WhatsApp 等条目数）。只读不解密。',
    parameters: {
      dir: { type: 'string', description: '备份目录（默认自动找最新一个 iTunes 备份）' },
    },
    output: { schema: { type: 'object', additionalProperties: false, properties: {
      files: { type: 'integer' }, domains: { type: 'object', additionalProperties: true }, encrypted: { type: 'boolean' } } },
      render: (_a, v) => [{ type: 'text', text:
        `备份含 ${v.files} 个文件：` + Object.entries(v.domains).slice(0, 10).map(([k, n]) => `${k}:${n}`).join('；') +
        (v.encrypted ? '（加密备份）' : '') }] },
    isConcurrencySafe: () => true,
    async execute(args) {
      if (!DatabaseSync) throw new Error('backup_itunes: 运行时缺 node:sqlite')
      let dir = args.dir ? String(args.dir) : null
      if (!dir) {
        const base = join(APPDATA, 'Apple Computer', 'MobileSync', 'Backup')
        if (existsSync(base)) {
          const subs = readdirSync(base, { withFileTypes: true }).filter(e => e.isDirectory())
            .map(e => ({ p: join(base, e.name), t: statSync(join(base, e.name)).mtimeMs })).sort((a, b) => b.t - a.t)
          dir = subs[0]?.p
        }
      }
      if (!dir || !existsSync(dir)) throw new Error('backup_itunes: 没找到备份目录，用 dir 指定')
      const manifest = join(dir, 'Manifest.db')
      if (!existsSync(manifest)) throw new Error('backup_itunes: 目录里没有 Manifest.db（不是 iTunes 备份？）')
      const info = join(dir, 'Info.plist')
      const encrypted = existsSync(info) && readFileSync(info, 'latin1').includes('<key>IsEncrypted</key>')
      const db = new DatabaseSync(manifest, { readOnly: true })
      try {
        let files = 0
        const domains = {}
        try {
          const rows = db.prepare('SELECT domain, COUNT(*) c FROM Files GROUP BY domain ORDER BY c DESC').all()
          files = rows.reduce((a, r) => a + r.c, 0)
          for (const r of rows) {
            const label = Object.entries(DOMAIN_HINT).find(([k]) => r.domain.includes(k))?.[1] || r.domain.replace(/^(App|Media|Wireless)?Domain-?/i, '').slice(0, 30)
            domains[label] = (domains[label] || 0) + r.c
          }
        } catch { domains['(Manifest 结构未识别)'] = 0 }
        return { files, domains, encrypted }
      } finally { db.close() }
    },
    presentCall: (a) => ({ card: 'generic', title: '看备份内容', kind: 'other', rawInput: a }),
  }))

  ctx.effect(() => ctx.skills.registerProvider(() => createSkillProvider(ctx)))
}
