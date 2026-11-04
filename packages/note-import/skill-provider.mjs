/**
 * skill-provider.mjs —— ctx.skills.registerProvider 的标准实现。
 * 与 templates/skill-pack/index.js 的 provider 逻辑一致（D42 纪律：逐字用，勿手写变形）。
 * 用法：import { createSkillProvider } from './skill-provider.mjs'
 *       ctx.effect(() => ctx.skills.registerProvider(() => createSkillProvider(ctx)))
 * 约定：包根有 package.json（取 name）和 skills/ 目录。
 */
import { readFileSync } from 'node:fs'
import { readdir, readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const PKG_DIR = dirname(fileURLToPath(import.meta.url))
const PKG = JSON.parse(readFileSync(join(PKG_DIR, 'package.json'), 'utf8'))
const SKILLS_DIR = join(PKG_DIR, 'skills')
const RANK = 650
const NAME_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export function createSkillProvider(ctx) {
  const warn = (msg) => ctx.logger?.warn(msg)
  return {
    name: PKG.name,
    async list(options = {}) {
      let entries
      try { entries = await readdir(SKILLS_DIR, { withFileTypes: true }) }
      catch (e) { if (e?.code === 'ENOENT') return []; throw e }
      const candidates = []
      for (const entry of entries) {
        options.signal?.throwIfAborted?.()
        const file = entry.isDirectory() ? join(SKILLS_DIR, entry.name, 'SKILL.md')
          : entry.isFile() && entry.name.endsWith('.md') ? join(SKILLS_DIR, entry.name) : undefined
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
  try { raw = await readFile(file, 'utf8') } catch { return undefined }
  signal?.throwIfAborted?.()
  const parsed = parseFrontmatter(raw)
  if (!parsed) { warn(`skill file ${file} ignored: missing frontmatter`); return undefined }
  const { data, body } = parsed
  const name = str(data.name)
  const description = str(data.description)
  if (!name || !description) { warn(`skill file ${file} ignored: frontmatter requires name and description`); return undefined }
  if (!NAME_RE.test(name)) { warn(`skill file ${file} ignored: invalid skill name "${name}"`); return undefined }
  return {
    name,
    description,
    ...(str(data.whenToUse) !== undefined ? { whenToUse: str(data.whenToUse) } : {}),
    invocation: { modelInvocable: !(data['disable-model-invocation'] === true), userInvocable: data['user-invocable'] !== false },
    ...(data.metadata && typeof data.metadata === 'object' ? { metadata: data.metadata } : {}),
    content: body.trim(),
  }
}

const str = (v) => typeof v === 'string' && v.trim() ? v : undefined

function parseFrontmatter(text) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(text)
  if (!match) return undefined
  return { data: parseFlatYaml(match[1]), body: text.slice(match[0].length) }
}

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
    if (value === undefined) { section = key; data[key] = {} }
    else { data[key] = value; section = undefined }
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
