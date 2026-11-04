/**
 * mino-connector-translate —— 翻译连接器（工具连接器：Pot 向）。
 * 文本翻译走 MyMemory 免费接口（无 key）；可在 connector-cloud.json 配
 * deeplx{"url":"http://本地:1188/translate"} 走 DeepLX。
 * 配合 connector-ocr 可实现「截图→读字→翻译」管线。
 */
import { readFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { homedir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { loadHostDeps } from './hostdeps.mjs'
import { createSkillProvider } from './skill-provider.mjs'

const PKG_DIR = dirname(fileURLToPath(import.meta.url))
const PKG = JSON.parse(readFileSync(join(PKG_DIR, 'package.json'), 'utf8'))
const CFG = join(process.env.DSH_HOME || join(homedir(), '.dsh'), 'connector-cloud.json')

export const name = PKG.name
export const inject = ['skills', 'tools']
const defineTool = (await loadHostDeps()).defineTool

const LANGS = { 中: 'zh-CN', 英: 'en', 日: 'ja', 韩: 'ko', 法: 'fr', 德: 'de', 俄: 'ru', 西: 'es' }
const norm = (l) => LANGS[String(l || '').trim()] || String(l || 'zh-CN')

async function deeplx(text, to) {
  let c
  try { c = JSON.parse(readFileSync(CFG, 'utf8')).deeplx } catch { return null }
  if (!c?.url) return null
  const res = await fetch(c.url, { method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, target_lang: norm(to).split('-')[0].toUpperCase() === 'ZH' ? 'ZH' : norm(to).toUpperCase() }),
    signal: AbortSignal.timeout(20000) })
  if (!res.ok) return null
  const j = await res.json().catch(() => null)
  return j?.data || j?.text || null
}

export function apply(ctx) {
  ctx.tools.register(defineTool({
    name: 'translate',
    description: '翻译文本：默认 MyMemory 免费接口；配了 deeplx 端点走 DeepL 系。中英日韩法德俄西互译。',
    parameters: {
      text: { type: 'string', required: true, description: '要翻译的文本' },
      to: { type: 'string', description: '目标语言（中/英/日/韩/法/德/俄/西 或 zh-CN/en/ja…默认中）' },
      from: { type: 'string', description: '源语言（默认自动）' },
    },
    output: { schema: { type: 'object', additionalProperties: false, properties: {
      translated: { type: 'string' }, engine: { type: 'string' } } },
      render: (_a, v) => [{ type: 'text', text: v.translated }] },
    isConcurrencySafe: () => true,
    async execute(args) {
      const text = String(args.text || '').trim()
      if (!text) throw new Error('translate: 给文本')
      const to = norm(args.to || 'zh-CN')
      const dx = await deeplx(text, to).catch(() => null)
      if (dx) return { translated: dx, engine: 'deeplx' }
      const from = args.from ? norm(args.from) : 'en'
      const langpair = `${from === to ? 'en' : from}|${to}`
      const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text.slice(0, 500))}&langpair=${encodeURIComponent(langpair)}`,
        { signal: AbortSignal.timeout(20000) })
      const j = await res.json().catch(() => null)
      const out = j?.responseData?.translatedText
      if (!out) throw new Error('translate: 免费接口没返回（太长或限流；配 deeplx 走本地端点）')
      return { translated: out, engine: 'mymemory' }
    },
    presentCall: (a) => ({ card: 'generic', title: '翻译', kind: 'other', rawInput: a }),
  }))

  ctx.effect(() => ctx.skills.registerProvider(() => createSkillProvider(ctx)))
}
