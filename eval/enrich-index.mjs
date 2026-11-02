#!/usr/bin/env node
/** Enrich a format-1 plugin index with Mino eval metadata: categories, labels, score sortKey.
 *  Reads annotations from eval/catalog-annotations.json, merges into the generated index,
 *  and validates the result with the official parseMarketIndex before writing.
 *
 *  Usage: node eval/enrich-index.mjs <index.json> [--annotations <file>] [--check]
 *    --check  validate only, do not write.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseMarketIndex } from 'file:///D:/Projects/mino/mino-agent/packages/util/plugin-market-index/lib/index.js'

const HERE = dirname(fileURLToPath(import.meta.url))
const args = process.argv.slice(2)
const indexPath = resolve(args[0] ?? '')
const annPath = resolve(args[args.indexOf('--annotations') + 1] ?? '')
const annotations = JSON.parse(readFileSync(args.includes('--annotations') ? annPath : `${HERE}/catalog-annotations.json`, 'utf8'))
const index = JSON.parse(readFileSync(indexPath, 'utf8'))

if (index.format !== 1) throw new Error('index format must be 1')
const localized = (t) => ({ ...t })

// Index-level declarations: categories + labels from annotation file, plus the score sortKey.
index.metadata = {
  categories: Object.fromEntries(Object.entries(annotations.categories).map(([id, t]) => [id, { title: localized(t) }])),
  labels: Object.fromEntries(Object.entries(annotations.labels).map(([id, t]) => [id, { title: localized(t) }])),
  sortKeys: { score: { title: { en: 'Mino score', 'zh-cn': 'Mino 评分' }, order: 'desc' } },
}

const missing = []
for (const plugin of index.plugins) {
  const a = annotations.plugins[plugin.name]
  if (!a) { missing.push(plugin.name); continue }
  plugin.metadata = {
    ...plugin.metadata,
    category: a.category,
    labels: [...new Set([...(plugin.metadata?.labels ?? []), ...a.labels])],
    sortKeys: { ...(plugin.metadata?.sortKeys ?? {}), score: a.score },
  }
}
if (missing.length) console.warn('no annotation for:', missing.join(', '))

// Validate with the official parser — declaredId refs, locale shapes, everything.
const validated = parseMarketIndex(index, 'https://mino.baby/plugins/index.json')
console.log(`validated: ${validated.plugins.length} plugins, ${Object.keys(index.metadata.labels).length} labels, score sortKey ok`)

if (!args.includes('--check')) {
  writeFileSync(indexPath, JSON.stringify(index, null, 2) + '\n')
  console.log('written:', indexPath)
}
