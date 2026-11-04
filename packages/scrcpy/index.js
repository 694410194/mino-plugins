/**
 * mino-connector-scrcpy —— 手机连接器（工具连接器：scrcpy/adb）。
 * 「连接手机」入口：adb 设备枚举、电池/存储状态、scrcpy 投屏拉起、
 * adb pull 拉文件（相册导出/备份取数的前置件）。探测 PATH 里的 adb。
 */
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { existsSync, readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { homedir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { loadHostDeps } from './hostdeps.mjs'
import { createSkillProvider } from './skill-provider.mjs'

const execFileP = promisify(execFile)
const PKG_DIR = dirname(fileURLToPath(import.meta.url))
const PKG = JSON.parse(readFileSync(join(PKG_DIR, 'package.json'), 'utf8'))

export const name = PKG.name
export const inject = ['skills', 'tools']
const defineTool = (await loadHostDeps()).defineTool

const HINT = `没装 adb：装 platform-tools（Google 官方，或 scoop install adb）；投屏另需 scrcpy（scoop install scrcpy）。手机要开 USB 调试。`

async function adb() {
  for (const c of ['adb', 'D:/platform-tools/adb.exe', 'C:/platform-tools/adb.exe']) {
    try { await execFileP(c, ['version'], { timeout: 8000, windowsHide: true }); return c } catch { }
  }
  return null
}

export function apply(ctx) {
  ctx.tools.register(defineTool({
    name: 'phone_devices',
    description: '列出 adb 连上的手机：设备序列号/型号/电量/存储。手机需开 USB 调试连过这台电脑。',
    parameters: {},
    output: { schema: { type: 'object', additionalProperties: false, properties: {
      devices: { type: 'array', items: { type: 'object', additionalProperties: true } } } },
      render: (_a, v) => [{ type: 'text', text: v.devices.length
        ? `${v.devices.length} 台：` + v.devices.map(d => `${d.model}(${d.serial}) 电${d.battery}%`).join('；')
        : '没有设备连接（开 USB 调试 + adb 授权）' }] },
    isConcurrencySafe: () => true,
    async execute() {
      const bin = await adb()
      if (!bin) throw new Error('phone_devices: ' + HINT)
      const { stdout } = await execFileP(bin, ['devices', '-l'], { timeout: 10000, windowsHide: true })
      const devs = []
      for (const l of stdout.split('\n').slice(1)) {
        const m = l.match(/^(\S+)\s+device\s(.*)/)
        if (!m) continue
        const serial = m[1]
        const model = m[2].match(/model:([^\s]+)/)?.[1] || serial
        let battery = '?'
        try {
          const { stdout: b } = await execFileP(bin, ['-s', serial, 'shell', 'dumpsys', 'battery'], { timeout: 8000, windowsHide: true })
          battery = b.match(/level: (\d+)/)?.[1] || '?'
        } catch { }
        devs.push({ serial, model, battery })
      }
      return { devices: devs }
    },
    presentCall: (a) => ({ card: 'generic', title: '看手机', kind: 'other', rawInput: a }),
  }))

  ctx.tools.register(defineTool({
    name: 'phone_pull',
    description: '从 adb 连着的手机拉文件/目录到本机（相册导出、备份取数用）。',
    parameters: {
      remote: { type: 'string', required: true, description: '手机路径如 /sdcard/DCIM/Camera' },
      local: { type: 'string', required: true, description: '本机目标目录' },
      serial: { type: 'string', description: '多设备时指定序列号' },
    },
    output: { schema: { type: 'object', additionalProperties: false, properties: { log: { type: 'string' } } },
      render: (_a, v) => [{ type: 'text', text: v.log.slice(-200) || '拉取完成' }] },
    isConcurrencySafe: () => false,
    async execute(args) {
      const bin = await adb()
      if (!bin) throw new Error('phone_pull: ' + HINT)
      const argv = ['-s', args.serial].filter(Boolean).concat(['pull', String(args.remote), String(args.local)])
      try {
        const { stdout, stderr } = await execFileP(bin, argv, { timeout: 600000, windowsHide: true, maxBuffer: 2 * 1024 * 1024 })
        return { log: (stdout + stderr).trim() }
      } catch (e) {
        throw new Error(`phone_pull 失败：${String(e?.stderr || e?.message).slice(-200)}`)
      }
    },
    presentCall: (a) => ({ card: 'generic', title: '拉手机文件', kind: 'other', rawInput: a }),
  }))

  ctx.tools.register(defineTool({
    name: 'phone_mirror',
    description: '拉起 scrcpy 投屏（装过 scrcpy 才可用；手机开 USB 调试）。',
    parameters: {
      serial: { type: 'string', description: '多设备时指定序列号' },
      record: { type: 'string', description: '可选：同时录屏到本地 mp4 路径' },
    },
    output: { schema: { type: 'object', additionalProperties: false, properties: { launched: { type: 'boolean' } } },
      render: (_a, v) => [{ type: 'text', text: '投屏窗口已拉起（关掉窗口即结束）' }] },
    isConcurrencySafe: () => false,
    async execute(args) {
      let scrcpy = null
      for (const c of ['scrcpy', 'D:/scrcpy/scrcpy.exe', 'C:/scrcpy/scrcpy.exe']) {
        try { await execFileP(c, ['--version'], { timeout: 8000, windowsHide: true }); scrcpy = c; break } catch { }
      }
      if (!scrcpy) throw new Error('phone_mirror: 没装 scrcpy（scoop install scrcpy）')
      const argv = ['-s', args.serial].filter(Boolean)
      if (args.record) argv.push('--record', String(args.record))
      const { spawn } = await import('node:child_process')
      const child = spawn(scrcpy, argv, { detached: true, stdio: 'ignore', windowsHide: true })
      child.unref()
      return { launched: true }
    },
    presentCall: (a) => ({ card: 'generic', title: '投屏', kind: 'other', rawInput: a }),
  }))

  ctx.effect(() => ctx.skills.registerProvider(() => createSkillProvider(ctx)))
}
