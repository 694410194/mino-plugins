/**
 * mino-connector-dev-activity —— 开发活动连接器（conn-system，零配置）。
 * 只读：git 提交记录（扫目录里的 .git 跑 git log）+ shell 命令历史文件。
 */
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
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

function findRepos(root, depth = 3, out = []) {
  if (depth < 0 || out.length > 60) return out
  let entries
  try { entries = readdirSync(root, { withFileTypes: true }) } catch { return out }
  if (entries.some(e => e.name === '.git')) { out.push(root); return out }
  for (const e of entries) {
    if (!e.isDirectory() || e.name.startsWith('.') || e.name === 'node_modules') continue
    findRepos(join(root, e.name), depth - 1, out)
  }
  return out
}

async function gitLog(repo, days, limit) {
  try {
    const since = days > 0 ? `--since=${days} days ago` : '--all'
    const { stdout } = await execFileP('git', ['-C', repo, 'log', since,
      '--pretty=format:%ad|%an|%s', '--date=format:%Y-%m-%d %H:%M', `-n`, String(limit)],
      { timeout: 20000, windowsHide: true })
    return stdout.trim() ? stdout.trim().split('\n').map(l => {
      const [time, author, ...msg] = l.split('|')
      return { repo: repo.split(/[\\/]/).pop(), time, author, msg: msg.join('|') }
    }) : []
  } catch { return [] }
}

function shellHistoryFiles() {
  const home = homedir()
  const appdata = process.env.APPDATA || join(home, 'AppData', 'Roaming')
  return [
    ['powershell', join(appdata, 'Microsoft', 'Windows', 'PowerShell', 'PSReadLine', 'ConsoleHost_history.txt')],
    ['bash', join(home, '.bash_history')],
    ['cmd(clink)', join(appdata, 'clink_history')],
  ].filter(([, p]) => existsSync(p))
}

export function apply(ctx) {
  ctx.tools.register(defineTool({
    name: 'dev_recent_commits',
    description:
      '查本机最近 git 提交记录：扫描指定目录（默认常见项目目录）下的 git 仓库，' +
      '汇总最近 N 天的提交（时间/作者/消息/仓库）。只读。',
    parameters: {
      root: { type: 'string', description: '扫描根目录（默认依次试 ~/Projects ~/projects ~/code ~/dev 存在的那个）' },
      days: { type: 'integer', description: '最近 N 天（默认 14，0=全部）' },
      limit: { type: 'integer', description: '每仓库最多多少条（默认 20）' },
    },
    output: { schema: { type: 'object', additionalProperties: false, properties: {
      repos: { type: 'integer' }, commits: { type: 'array', items: { type: 'object', additionalProperties: true } } } },
      render: (_a, v) => [{ type: 'text', text: `${v.repos} 个仓库，${v.commits.length} 条提交` }] },
    isConcurrencySafe: () => true,
    async execute(args) {
      const home = homedir()
      let root = args.root
      if (!root) {
        for (const d of ['Projects', 'projects', 'code', 'dev', 'work']) {
          const p = join(home, d); if (existsSync(p)) { root = p; break }
        }
      }
      if (!root || !existsSync(root)) throw new Error('dev_recent_commits: 没找到项目目录，用 root 指定')
      const repos = findRepos(root)
      if (!repos.length) throw new Error(`dev_recent_commits: ${root} 下没有 git 仓库`)
      const days = Number.isFinite(+args.days) ? +args.days : 14
      const limit = Math.min(Number.isFinite(+args.limit) ? +args.limit : 20, 100)
      const all = []
      for (const r of repos.slice(0, 30)) all.push(...await gitLog(r, days, limit))
      all.sort((a, b) => b.time.localeCompare(a.time))
      return { repos: repos.length, commits: all.slice(0, 200) }
    },
    presentCall: (a) => ({ card: 'generic', title: '查最近提交', kind: 'other', rawInput: a }),
  }))

  ctx.tools.register(defineTool({
    name: 'dev_shell_history',
    description: '查本机 shell 命令历史（PowerShell/Bash/CMD 历史文件），' +
      '看最近跑过什么命令。可按 q 关键词过滤。只读。',
    parameters: {
      limit: { type: 'integer', description: '最多返回多少条（默认 40）' },
      q: { type: 'string', description: '可选关键词过滤' },
      shell: { type: 'string', description: 'powershell/bash/cmd/auto（默认 auto=全部）' },
    },
    output: { schema: { type: 'object', additionalProperties: false, properties: {
      entries: { type: 'array', items: { type: 'object', additionalProperties: true } }, count: { type: 'integer' } } },
      render: (_a, v) => [{ type: 'text', text: `${v.count} 条命令历史` }] },
    isConcurrencySafe: () => true,
    async execute(args) {
      const limit = Math.min(Number.isFinite(+args.limit) ? +args.limit : 40, 200)
      const want = String(args.shell || 'auto').toLowerCase()
      const q = args.q ? String(args.q).toLowerCase() : null
      const out = []
      for (const [shellName, file] of shellHistoryFiles()) {
        if (want !== 'auto' && !shellName.startsWith(want)) continue
        const lines = readFileSync(file, 'utf8').split(/\r?\n/).filter(Boolean)
        for (const cmd of lines.slice(-2000)) {
          if (!q || cmd.toLowerCase().includes(q)) out.push({ shell: shellName, cmd })
        }
      }
      return { count: out.length, entries: out.slice(-limit) }
    },
    presentCall: (a) => ({ card: 'generic', title: '查命令历史', kind: 'other', rawInput: a }),
  }))

  ctx.effect(() => ctx.skills.registerProvider(() => createSkillProvider(ctx)))
}
