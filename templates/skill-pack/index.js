// mino-skill-pack runtime —— 把随包 skills/ 目录注册为 ctx.skills provider。
// 只依赖官方公开契约（ctx.skills.registerProvider / SkillProvider 接口），零内核改动。
// 本文件在所有 skill-* 包之间保持逐字一致；改动请同步 templates/skill-pack（模板源）。
import { readFileSync } from 'node:fs'
import { readdir, readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const PKG = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'))
const SKILLS_DIR = fileURLToPath(new URL('./skills/', import.meta.url))

export const name = PKG.name
export const inject = ['skills']

// bundled(600) 之下：用户/项目同名 skill 永远覆盖市场包。
const RANK = 650
const NAME_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export function apply(ctx) {
  ctx.effect(() => ctx.skills.registerProvider(() => createProvider(ctx)))
}

function createProvider(ctx) {
  const warn = (msg) => ctx.logger?.warn(msg)
  return {
    name: PKG.name,
    async list(options = {}) {
      let entries
      try {
        entries = await readdir(SKILLS_DIR, { withFileTypes: true })
      } catch (error) {
        if (error?.code === 'ENOENT') return []
        throw error
      }
      const candidates = []
      for (const entry of entries) {
        options.signal?.throwIfAborted?.()
        const file = entry.isDirectory()
          ? join(SKILLS_DIR, entry.name, 'SKILL.md')
          : entry.isFile() && entry.name.endsWith('.md')
            ? join(SKILLS_DIR, entry.name)
            : undefined
        if (!file) continue
        const parsed = await parseSkillFile(file, options.signal, warn)
        if (parsed) candidates.push(toCandidate(parsed, file))
      }
      return candidates
    },
    async get(candidate, options = {}) {
      const parsed = await parseSkillFile(candidate.locator, options.signal, warn)
      if (!parsed || parsed.name !== candidate.name) return undefined
      return {
        name: parsed.name,
        description: parsed.description,
        ...(parsed.whenToUse !== undefined ? { whenToUse: parsed.whenToUse } : {}),
        invocation: parsed.invocation,
        source: 'market',
        provider: PKG.name,
        resourceBase: { kind: 'directory', path: dirname(candidate.locator) },
        ...(parsed.metadata !== undefined ? { metadata: parsed.metadata } : {}),
        content: parsed.content,
      }
    },
  }
}

function toCandidate(parsed, file) {
  return {
    name: parsed.name,
    description: parsed.description,
    ...(parsed.whenToUse !== undefined ? { whenToUse: parsed.whenToUse } : {}),
    invocation: parsed.invocation,
    source: 'market',
    provider: PKG.name,
    resourceBase: { kind: 'directory', path: dirname(file) },
    ...(parsed.metadata !== undefined ? { metadata: parsed.metadata } : {}),
    rank: RANK,
    locator: file,
  }
}

async function parseSkillFile(file, signal, warn) {
  let raw
  try {
    raw = await readFile(file, 'utf8')
  } catch {
    return undefined
  }
  signal?.throwIfAborted?.()
  const parsed = parseFrontmatter(raw)
  if (!parsed) {
    warn(`skill file ${file} ignored: missing frontmatter`)
    return undefined
  }
  const { data, body } = parsed
  const name = str(data.name)
  const description = str(data.description)
  if (!name || !description) {
    warn(`skill file ${file} ignored: frontmatter requires name and description`)
    return undefined
  }
  if (!NAME_RE.test(name)) {
    warn(`skill file ${file} ignored: invalid skill name "${name}"`)
    return undefined
  }
  let invocation
  try {
    invocation = parseInvocation(data)
  } catch (error) {
    warn(`skill file ${file} ignored: ${error.message}`)
    return undefined
  }
  return {
    name,
    description,
    ...(str(data.whenToUse) !== undefined ? { whenToUse: str(data.whenToUse) } : {}),
    invocation,
    ...(data.metadata && typeof data.metadata === 'object' ? { metadata: data.metadata } : {}),
    content: body.trim(),
  }
}

function parseInvocation(data) {
  const disableModel = boolField(data, 'disable-model-invocation')
  const userInvocable = boolField(data, 'user-invocable')
  return {
    modelInvocable: !(disableModel ?? false),
    userInvocable: userInvocable ?? true,
  }
}

function boolField(data, key) {
  const value = data[key]
  if (value === undefined) return undefined
  if (typeof value !== 'boolean') throw new TypeError(`frontmatter field "${key}" must be a boolean`)
  return value
}

function str(value) {
  return typeof value === 'string' && value.trim() ? value : undefined
}

function parseFrontmatter(text) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(text)
  if (!match) return undefined
  return { data: parseFlatYaml(match[1]), body: text.slice(match[0].length) }
}

// 扁平 YAML 子集：顶层 `key: value` 标量 + 一级嵌套 map（如 metadata:）。
// 不支持多行/数组/锚点——skill frontmatter 请保持单行标量。
function parseFlatYaml(src) {
  const data = {}
  let section
  for (const line of src.split(/\r?\n/)) {
    if (!line.trim() || line.trimStart().startsWith('#')) continue
    const indent = line.length - line.trimStart().length
    const match = /^([A-Za-z0-9_-]+)\s*:\s*(.*)$/.exec(line.trim())
    if (!match) continue
    const [, key, raw] = match
    const value = parseScalar(raw)
    if (indent > 0 && section) {
      if (typeof data[section] !== 'object' || data[section] === null) data[section] = {}
      data[section][key] = value
      continue
    }
    if (value === undefined) {
      section = key
      data[key] = {}
    } else {
      data[key] = value
      section = undefined
    }
  }
  return data
}

function parseScalar(raw) {
  const value = raw.trim()
  if (value === '') return undefined
  if (value.startsWith('"') && value.endsWith('"') && value.length >= 2) return value.slice(1, -1)
  if (value.startsWith("'") && value.endsWith("'") && value.length >= 2) return value.slice(1, -1)
  const bare = value.replace(/\s+#.*$/, '')
  if (bare === 'true') return true
  if (bare === 'false') return false
  if (bare === 'null' || bare === '~') return null
  return bare
}
