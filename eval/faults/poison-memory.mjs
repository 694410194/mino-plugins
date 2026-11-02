// Fault injection: write a {{user}}-poisoned memory item into an existing
// fish-memory session file — reproduces upstream 1.3.5 crash-on-inject.
// Usage: node poison-memory.mjs <sessionId>
import { readFileSync, writeFileSync, existsSync } from 'node:fs'

const sid = process.argv[2]
const file = `C:/Users/69441/.dsh/fish-memory/${sid}.json`
if (!existsSync(file)) { console.error('no memory file for', sid); process.exit(2) }
const d = JSON.parse(readFileSync(file, 'utf8'))
d.memories.push({
  id: 'poison' + Date.now().toString(36),
  text: '{{user}}最喜欢的人是{{name}}，{{time}}见面',
  at: new Date().toISOString(), createdAt: new Date().toISOString(),
  category: 'event', importance: 0.99, emotion: null,
  tags: ['毒物', '模板'], source: 'fault-injection',
  reinforcedAt: null, lastReinforcedDay: null,
  related: ['毒物'], relatedAt: new Date().toISOString(),
})
writeFileSync(file, JSON.stringify(d, null, 2))
console.log('poisoned', file, 'memories=' + d.memories.length)
