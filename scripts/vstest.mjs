#!/usr/bin/env node
/**
 * vstest 部署重启一条龙（长期方案，替代手工 cp/repack 那套会互相踩的流程）。
 *
 * 用法：
 *   node scripts/vstest.mjs [包短名...]   # 默认构建并重启
 *   node scripts/vstest.mjs --no-build  # 只重启（纯 JS 包改了源码时用这个）
 *   node scripts/vstest.mjs today brief # 只构建指定包再重启
 *
 * 部署模型：vstest profile 的全部本地插件走 link: 源码直链——改源码+重建 lib 即部署，
 * 不存在 pack/install/cp 环节，也就不会出现 pnpm install 把部署回滚的事故。
 * 注意：发版仍要走 npm pack 出 tgz 测真实产物（那是发布链，不是开发环）。
 */
import { execSync, spawn } from 'node:child_process'
import { existsSync } from 'node:fs'

const PLUGINS = 'D:/Projects/mino/mino-plugins/packages'
const AGENT = 'D:/Projects/mino/mino-agent'
const LOG = process.env.TEMP ? `${process.env.TEMP}/vstest.log` : '/tmp/vstest.log'
const PORT = 3081

/** 有构建步骤的包（lib/ 产物）；纯 JS 包（calendar/mail/webwatch）不在此列，源码即产物。 */
const BUILDABLE = {
  today: 'today', brief: 'brief', call: 'call', 'voice-notes': 'voice-notes',
  'meeting-detect': 'meeting-detect', image: 'image', market: 'market',
}

const args = process.argv.slice(2)
const noBuild = args.includes('--no-build')
const names = args.filter(a => !a.startsWith('--'))
const targets = names.length ? names : Object.keys(BUILDABLE)

if (!noBuild) {
  for (const name of targets) {
    const dir = BUILDABLE[name]
    if (!dir) { console.error(`unknown buildable package: ${name}`); process.exit(1) }
    console.log(`[build] ${name}`)
    execSync('pnpm run build', { cwd: `${PLUGINS}/${dir}`, stdio: 'inherit' })
  }
}

// 清掉占用端口的旧进程（Windows netstat/taskkill）。
const listeners = () => new Set(
  execSync('netstat -ano', { encoding: 'utf8' }).split('\n')
    .filter(l => l.includes(`:${PORT}`) && l.includes('LISTEN'))
    .map(l => l.trim().split(/\s+/).pop()),
)
for (const pid of listeners()) {
  console.log(`[kill] pid ${pid} on :${PORT}`)
  execSync(`taskkill //PID ${pid} //F`, { stdio: 'ignore' })
}
// taskkill 后 socket 释放有窗口期——轮询到 LISTENING 真消失再起新进程，否则 EADDRINUSE。
{
  const freeDeadline = Date.now() + 15_000
  while (listeners().size && Date.now() < freeDeadline) {
    execSync('node -e "setTimeout(()=>{},300)"')
  }
  if (listeners().size) { console.error(`[abort] :${PORT} 15s 还没释放`); process.exit(1) }
}

console.log('[boot] dsh --profile vstest')
const fs = await import('node:fs')
const logFd = fs.openSync(LOG, 'w')
const child = spawn(
  'node',
  ['apps/cli/lib/bin.js', '--profile', 'vstest', '--port', String(PORT), '--no-open'],
  { cwd: AGENT, stdio: ['ignore', logFd, logFd], detached: true },
)
child.unref()
fs.closeSync(logFd)

// 盯日志拿 token URL；30s 没等到就把日志尾部打出来。
const deadline = Date.now() + 30_000
const url = await new Promise(resolve => {
  const timer = setInterval(() => {
    if (!existsSync(LOG)) return
    const m = fs.readFileSync(LOG, 'utf8').match(/http:\/\/127\.0\.0\.1:\d+\/\?token=[\w-]+/)
    if (m || Date.now() > deadline) { clearInterval(timer); resolve(m?.[0] ?? null) }
  }, 500)
})

if (url) {
  console.log(`\n[ready] ${url}`)
  console.log(`[log]   ${LOG}`)
} else {
  console.error(`\n[timeout] 30s 没等到服务起来，日志尾部：`)
  console.error(fs.readFileSync(LOG, 'utf8').split('\n').slice(-15).join('\n'))
  process.exit(1)
}
