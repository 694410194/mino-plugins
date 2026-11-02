// Mino plugin eval harness — vendor-style: golden suites, machine assertions,
// fault injection hooks, HTTP surface probes, n-run statistics, JSON report.
//
// Usage:
//   node eval-run.mjs --profile plugweb --patch <yml> --suite <file.jsonl>
//        [--repeat N] [--out reports/<name>] [--grep <substr>]
//
// Suite format (JSONL, one probe per line):
// {
//   "id": "tavern-isolation",        // unique id (sessions get -RUNTAG suffix)
//   "text": "你好",                   // user prompt; omit if "wait" set
//   "wait": 30,                      // or: just keep alive N seconds
//   "newSession": true,              // default: reuse probe id as session id
//   "pre": "node faults/inject-memory.mjs --content {{user}}",  // shell hook before probe
//   "http": { "path": "/orchestrator/api/settings", "expectStatus": 200 },  // live HTTP probe
//   "assert": {                      // machine assertions — every one must pass
//     "reply.match": "^.{3,}$",
//     "reply.notMatch": "error|undefined",
//     "tools.called": ["remember"],
//     "tools.absent": ["/^st_/"],
//     "schema.absent": ["/^st_/", "/^trpg_/", "/^tavern_"],
//     "schema.present": ["remember"],
//     "events.absent": ["session/error", "turn/error"],
//     "events.count.turn/end": 1,
//     "modelCalls.max": 3,
//     "elapsedMs.max": 60000,
//     "status.final": "idle"
//   }
// }
//
// Report: <out>.json (machine) + <out>.md (eval card) — verdict per probe,
// per-suite pass rates, latency/cost stats, flake detection across repeats.
import { spawn, execSync } from 'node:child_process'
import { createInterface } from 'node:readline'
import { readFileSync, appendFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname } from 'node:path'

const args = process.argv.slice(2)
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d }
const PROFILE = opt('profile', 'plugweb')
const PATCH = opt('patch', null)
const SUITE = opt('suite')
const REPEAT = parseInt(opt('repeat', '1'))
const OUT = opt('out', `reports/run-${Date.now().toString(36)}`)
const GREP = opt('grep', '')
const PORT = opt('port', '3088')
const RUNTAG = Date.now().toString(36).slice(-5)

if (!SUITE) { console.error('need --suite'); process.exit(2) }
const probes = readFileSync(SUITE, 'utf8').split('\n')
  .map(l => l.trim()).filter(l => l && !l.startsWith('#'))
  .map(l => JSON.parse(l))
  .filter(p => !GREP || p.id.includes(GREP))
  .map(p => ({ ...p, session: `${p.sameSession ?? p.id}-${RUNTAG}` }))
if (!probes.length) { console.error('empty suite'); process.exit(2) }

mkdirSync(dirname(OUT), { recursive: true })
const EVLOG = OUT + '.events.jsonl'
for (const f of [EVLOG, OUT + '.stdout', OUT + '.boot']) writeFileSync(f, '')

// ---------- dsh spawn + JSON-RPC (same mechanics as sdk-drive) ----------
const DSH = 'D:/Software/Mino/resources/runtime/cli/bin/dsh.cmd'
const env = { ...process.env, MAGPIE_GATEWAY_KEY: 'magpie', DSH_SDK_NO_BROWSER: '1', SSH_CONNECTION: 'test-harness', DSH_PRIMARY_RUNTIME: 'D:/Software/Mino/resources/runtime/primary-runtime' }
const spawnArgs = [DSH, '--profile', PROFILE]
if (PATCH) spawnArgs.push('--patch', PATCH)
spawnArgs.push('--patch', 'D:/Projects/mino/mino-plugins/eval/patches/eval-port0.yml')
const t0Boot = Date.now()
const child = spawn('cmd.exe', ['/c', ...spawnArgs], { env, stdio: ['pipe', 'pipe', 'pipe'], cwd: 'D:/tmp/mino-sdk' })
child.on('error', (e) => { console.error('SPAWN ERR', e); process.exit(2) })
let stderrTail = ''
child.stderr.on('data', (d) => { stderrTail = (stderrTail + d).slice(-8000); appendFileSync(OUT + '.boot', d) })
child.on('exit', (code) => {
  appendFileSync(OUT + '.boot', `\n[dsh exited code=${code}]\n`)
  for (const [, p] of pending) p.reject(new Error('dsh exited ' + code))
})
let nextId = 1
const pending = new Map()
const listeners = []
const rl = createInterface({ input: child.stdout })
const send = (o) => child.stdin.write(JSON.stringify(o) + '\n')
function request(method, params = {}, timeoutMs = 300000) {
  const id = nextId++
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => { pending.delete(id); reject(new Error(`timeout ${method}`)) }, timeoutMs)
    pending.set(id, { resolve: (v) => { clearTimeout(t); resolve(v) }, reject: (e) => { clearTimeout(t); reject(e) } })
    send({ jsonrpc: '2.0', id, method, params })
  })
}
let webBase = ''
let webToken = ''
rl.on('line', (line) => {
  const s = line.trim()
  if (!s.startsWith('{')) {
    if (s) {
      appendFileSync(OUT + '.stdout', s + '\n')
      const m = s.match(/dsh web:\s*(https?:\/\/[^\s?]+)(?:\?token=(\S+))?/)
      if (m) { webBase = m[1].replace(/\/+$/, ''); if (m[2]) webToken = m[2] }
    }
    return
  }
  let msg
  try { msg = JSON.parse(s) } catch { return }
  appendFileSync(EVLOG, JSON.stringify({ t: Date.now(), msg }) + '\n')
  if (msg.id !== undefined && (msg.result !== undefined || msg.error !== undefined)) {
    const p = pending.get(msg.id)
    if (p) { pending.delete(msg.id); msg.error ? p.reject(new Error(JSON.stringify(msg.error))) : p.resolve(msg.result) }
    return
  }
  if (msg.id !== undefined && msg.method) {
    if (msg.method === 'approval/request') send({ jsonrpc: '2.0', id: msg.id, result: { outcome: 'allowed-once' } })
    else if (msg.method === 'user-question/ask') send({ jsonrpc: '2.0', id: msg.id, result: { cancelled: true } })
    else send({ jsonrpc: '2.0', id: msg.id, error: { code: -32601, message: 'unhandled ' + msg.method } })
    return
  }
  if (msg.method) for (const fn of listeners) { try { fn(msg.method, msg.params ?? {}) } catch (e) { console.error('listener err', e) } }
})

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// ---------- turn runner: capture full event surface ----------
function runTurn(sessionId, text, turnTimeout = 120000) {
  const events = []
  const statuses = []
  const t0 = Date.now()
  let sawStart = false
  const done = new Promise((resolve) => {
    const timer = setTimeout(() => resolve('timeout'), turnTimeout)
    listeners.push((method, params) => {
      if (method === 'session.event' && params.sessionId === sessionId) {
        events.push(params.event)
        if (params.event?.type === 'turn/start') sawStart = true
        if (params.event?.type === 'turn/end' && sawStart) { clearTimeout(timer); resolve('turn/end') }
      }
      if (method === 'session.status' && params.sessionId === sessionId) {
        statuses.push(params.status)
        // stale-snapshot guard: 'idle' attach-time snapshots arrive between turns;
        // only accept idle once OUR turn has actually started
        if (params.status === 'idle' && sawStart) { clearTimeout(timer); resolve('idle') }
      }
    })
  })
  return { events, statuses, done, t0, send: () => request('session/query', { sessionId, contentBlocks: [{ type: 'text', text }] }) }
}

function digest(events, statuses, t0) {
  const d = { reply: '', tools: 0, toolNames: [], toolCalls: [], toolResults: [], modelCalls: 0, systemChars: 0, eventTypes: {}, turns: 0, elapsedMs: Date.now() - t0, statusFinal: statuses[statuses.length - 1] ?? '?', statuses }
  for (const e of events) {
    const ty = e?.type ?? '?'
    d.eventTypes[ty] = (d.eventTypes[ty] ?? 0) + 1
    if (ty === 'turn/end') d.turns++
    if (ty === 'step/start') d.modelCalls++ // each step = one LLM invocation; request/header is session-first-turn-only
    if (ty === 'request/header') { d.headerSnapshots = (d.headerSnapshots ?? 0) + 1; if (e.data?.header?.tools) { d.tools = e.data.header.tools.length; d.toolNames = e.data.header.tools.map(t => t.name).filter(Boolean) } }
    if (ty === 'assistant/tool-call' || ty === 'model/tool-call' || ty === 'tool/call') d.toolCalls.push(e?.data?.name ?? e?.data?.toolName ?? '?')
    if (ty === 'tool/result' || ty === 'assistant/tool-result') d.toolResults.push({ name: e?.data?.name ?? '?', text: JSON.stringify(e?.data).slice(0, 400) })
    if (ty === 'system/message' && e?.data?.message?.content) {
      for (const b of e.data.message.content) if (b.type === 'text') d.systemChars += (b.text ?? '').length
    }
  }
  for (let i = events.length - 1; i >= 0; i--) {
    const e = events[i]
    if (e?.type === 'assistant/message') {
      const c = e?.data?.message?.content
      if (Array.isArray(c)) { d.reply = c.filter(b => b.type === 'text').map(b => b.text ?? '').join(''); break }
    }
  }
  return d
}

// ---------- assertion engine ----------
function pat(p) {
  const li = p.lastIndexOf('/')
  if (p.startsWith('/') && li > 0) return new RegExp(p.slice(1, li), p.slice(li + 1))
  if (p.startsWith('/')) return new RegExp(p.slice(1)) // '/^foo' → regex body fallback
  return p
}
function checkAssertions(a, d, ctx) {
  const fails = []
  const ok = (name, cond, evidence) => { if (!cond) fails.push({ assert: name, evidence }) }
  for (const [k, v] of Object.entries(a ?? {})) {
    if (k === 'reply.match') ok(k, new RegExp(v).test(d.reply), `reply=${JSON.stringify(d.reply.slice(0, 200))}`)
    else if (k === 'reply.notMatch') ok(k, !new RegExp(v).test(d.reply), `reply matched forbidden: ${JSON.stringify(d.reply.slice(0, 200))}`)
    else if (k === 'tools.called') for (const name of [].concat(v)) ok(k, d.toolCalls.some(t => t === name || (typeof name === 'string' && pat(name) instanceof RegExp && pat(name).test(t))), `toolCalls=${JSON.stringify(d.toolCalls)} missing ${name}`)
    else if (k === 'tools.absent') for (const name of [].concat(v)) ok(k, !d.toolCalls.some(t => t === name || (typeof name === 'string' && pat(name) instanceof RegExp && pat(name).test(t))), `toolCalls contains forbidden ${name}: ${JSON.stringify(d.toolCalls)}`)
    else if (k === 'schema.absent') for (const p of [].concat(v)) { const re = p.startsWith('/') ? pat(p) : new RegExp('^' + p.replace(/\*/g, '.*') + '$'); ok(k, !d.toolNames.some(t => re.test(t)), `schema leaked ${p}: matched ${d.toolNames.filter(t => re.test(t)).length} tools`) }
    else if (k === 'schema.present') for (const p of [].concat(v)) { const re = p.startsWith('/') ? pat(p) : new RegExp('^' + p.replace(/\*/g, '.*') + '$'); ok(k, d.toolNames.some(t => re.test(t)), `schema missing ${p}`) }
    else if (k.startsWith('events.absent')) for (const ty of [].concat(v)) ok(k, !d.eventTypes[ty], `event ${ty} occurred ${d.eventTypes[ty]}×`)
    else if (k.startsWith('events.count.')) { const ty = k.slice('events.count.'.length); ok(k, (d.eventTypes[ty] ?? 0) === v, `${ty}=${d.eventTypes[ty] ?? 0} expected ${v}`) }
    else if (k === 'modelCalls.max') ok(k, d.modelCalls <= v, `modelCalls=${d.modelCalls} > ${v}`)
    else if (k === 'modelCalls.min') ok(k, d.modelCalls >= v, `modelCalls=${d.modelCalls} < ${v}`)
    else if (k === 'elapsedMs.max') ok(k, d.elapsedMs <= v, `elapsed=${d.elapsedMs}ms > ${v}`)
    else if (k === 'status.final') ok(k, d.statusFinal === v || (d.statuses ?? []).includes(v), `statuses=${JSON.stringify(d.statuses)}`)
    else if (k === 'tools.count') ok(k, d.tools === v, `tools=${d.tools}`)
    else if (k === 'tools.max') ok(k, d.tools <= v, `tools=${d.tools} > ${v}`)
    else if (k === 'systemChars.max') ok(k, d.systemChars <= v, `systemChars=${d.systemChars}`)
  }
  return fails
}

// ---------- live HTTP probe (plugin web surfaces: qq-link routes, superagent api…) ----------
async function httpProbe(h) {
  if (!h.base && !h.url && !webBase) {
    const t0 = Date.now()
    while (!webBase && Date.now() - t0 < 15000) await sleep(250)
  }
  const base = h.base ?? webBase ?? `http://127.0.0.1:${PORT}`
  let url = h.url ?? base + h.path
  const headers = { ...(h.headers ?? {}) }
  let mintInfo = null
  if (h.auth && webToken) {
    // auth model: ?token only works on GET / → mints signed cookie → cookie authenticates API calls
    const mint = await fetch(base + '/?token=' + webToken, { redirect: 'manual', signal: AbortSignal.timeout(10000) })
    const cookie = mint.headers.get('set-cookie')?.split(';')[0]
    mintInfo = { status: mint.status, hasCookie: !!cookie }
    if (cookie) headers.cookie = cookie
  }
  const expect = [].concat(h.expectStatus ?? [])
  try {
    const res = await fetch(url, { method: h.method ?? 'GET', headers, body: h.body ? JSON.stringify(h.body) : undefined, signal: AbortSignal.timeout(15000) })
    const text = await res.text()
    let pass = expect.length ? expect.includes(res.status) : res.status < 500
    if (h.expectBody) pass = pass && new RegExp(h.expectBody).test(text)
    if (h.rejectBody) pass = pass && !new RegExp(h.rejectBody).test(text)
    return { status: res.status, body: text.slice(0, 2000), mint: mintInfo, pass, expectStatus: h.expectStatus, expectBody: h.expectBody }
  } catch (e) { return { status: -1, body: String(e), mint: mintInfo, pass: false, expectStatus: h.expectStatus } }
}

// ---------- main ----------
const report = { suite: SUITE, profile: PROFILE, patch: PATCH, runtag: RUNTAG, startedAt: new Date().toISOString(), probes: [], stats: {} }
try {
  const ready = request('initialize', {
    cwd: 'D:/tmp/mino-sdk',
    provider: process.env.SDK_PROVIDER || 'magpie',
    model: process.env.SDK_MODEL || 'workbuddy/deepseek-v4.1-flash',
    ...(process.env.SDK_EFFORT === 'off' ? {} : { reasoningEffort: process.env.SDK_EFFORT || 'low' }),
    approvalRequests: true, capabilities: { userQuestions: true },
  }, 300000)
  const info = await ready
  report.bootMs = Date.now() - t0Boot
  report.serverInfo = info.serverInfo
  console.log(`INITIALIZED bootMs=${report.bootMs}`)

  for (const probe of probes) {
    const rec = { id: probe.id, session: probe.session, repeat: REPEAT, runs: [] }
    if (probe.pre) { try { execSync(probe.pre.replaceAll('{{SESSION}}', probe.session).replaceAll('{{RUNTAG}}', RUNTAG), { stdio: 'inherit', shell: 'cmd.exe' }) } catch (e) { rec.preError = String(e) } }
    for (let i = 0; i < REPEAT; i++) {
      const run = { i }
      try {
        const sessionId = probe.freshPerRepeat ? `${probe.session}-r${i}` : probe.session
        const text = probe.text?.replaceAll('{{I}}', String(i))
        if (probe.http) { Object.assign(run, { http: await httpProbe(probe.http), pass: undefined, fails: [] }); if (!run.http.pass) run.fails.push({ assert: 'http.expectStatus', evidence: `status=${run.http.status}` }) }
        if (probe.wait) {
          // measure BACKGROUND activity during idle window — the 空转/扣费 probe:
          // count session events across ALL sessions (proactive loops, retries)
          const bg = { types: {}, modelCalls: 0, sessions: new Set() }
          const bgListener = (method, params) => {
            if (method !== 'session.event') return
            const ty = params.event?.type
            bg.types[ty] = (bg.types[ty] ?? 0) + 1
            if (ty === 'request/header') bg.modelCalls++
            if (params.sessionId) bg.sessions.add(params.sessionId)
          }
          listeners.push(bgListener)
          await sleep(probe.wait * 1000)
          const idx = listeners.indexOf(bgListener); if (idx >= 0) listeners.splice(idx, 1)
          run.waited = probe.wait
          run.bg = { types: bg.types, modelCalls: bg.modelCalls, sessions: [...bg.sessions] }
          const fails = checkAssertions(probe.assert, { reply: '', tools: 0, toolNames: [], toolCalls: [], modelCalls: 0, systemChars: 0, eventTypes: {}, turns: 0, elapsedMs: probe.wait * 1000, statusFinal: 'idle' })
          for (const [k, v] of Object.entries(probe.assert ?? {})) {
            if (k === 'bg.modelCalls.max' && bg.modelCalls > v) fails.push({ assert: k, evidence: `bg modelCalls=${bg.modelCalls} > ${v} during ${probe.wait}s idle` })
            if (k === 'bg.events.absent') for (const ty of [].concat(v)) if (bg.types[ty]) fails.push({ assert: k, evidence: `bg event ${ty}×${bg.types[ty]}` })
          }
          run.fails = [...(run.fails ?? []), ...fails]
          run.pass = run.fails.length === 0
        }
        if (probe.text) {
          const t = runTurn(sessionId, text, probe.timeoutMs ?? 120000)
          const resp = await t.send()
          const preDone = t.events.some((e, i) => e?.type === 'turn/end' && t.events.slice(0, i).some(s => s?.type === 'turn/start'))
          const end = preDone ? 'pre-resolved' : await t.done
          await sleep(400) // grace: trailing session.status 'idle' lands after turn/end
          const d = digest(t.events, t.statuses, t.t0)
          Object.assign(run, { ...d, endReason: end, respKind: resp?.kind })
          const fails = checkAssertions(probe.assert, d)
          if (end === 'timeout') fails.push({ assert: 'turn.timeout', evidence: `>${probe.timeoutMs ?? 120000}ms` })
          run.fails = [...(run.fails ?? []), ...fails]
          run.pass = run.fails.length === 0
        } else { run.pass = run.fails?.length === 0 ?? true }
      } catch (e) { run.error = String(e); run.pass = false }
      rec.runs.push(run)
      appendFileSync(OUT + '.runs.jsonl', JSON.stringify({ id: probe.id, i, run }) + '\n')
      console.log(`  ${probe.id}#${i} ${run.pass ? 'PASS' : 'FAIL'} ${run.elapsedMs ?? '-'}ms` + (run.fails?.length ? ' ' + run.fails.map(f => f.assert).join(',') : ''))
    }
    rec.passAll = rec.runs.every(r => r.pass)
    rec.passRate = rec.runs.filter(r => r.pass).length / rec.runs.length
    rec.flaky = rec.runs.some(r => r.pass) && rec.runs.some(r => !r.pass)
    const lat = rec.runs.map(r => r.elapsedMs).filter(Boolean).sort((a, b) => a - b)
    rec.medianMs = lat[Math.floor(lat.length / 2)]
    report.probes.push(rec)
  }
} catch (e) { report.fatal = String(e); console.error('FATAL', e, '\n', stderrTail) }
try { await request('shutdown', {}, 5000) } catch {}
// kill the whole tree: child is a cmd.exe wrapper — SIGKILL on it orphans the Mino.exe/dsh grandchild
try { execSync(`taskkill /pid ${child.pid} /T /F`, { stdio: 'ignore' }) } catch { child.kill('SIGKILL') }

// ---------- report ----------
const total = report.probes.length
const pass = report.probes.filter(p => p.passAll).length
const flaky = report.probes.filter(p => p.flaky)
report.stats = { probes: total, passAll: pass, fail: total - pass - flaky.length, flaky: flaky.length, bootMs: report.bootMs }
writeFileSync(OUT + '.json', JSON.stringify(report, null, 2))
const md = ['# Eval Report', '', `suite: ${SUITE} | profile: ${PROFILE} | repeat: ${REPEAT} | boot: ${report.bootMs}ms`, '',
  `**${pass}/${total} probes pass-all** ${flaky.length ? `(${flaky.length} flaky: ${flaky.map(f => f.id).join(',')})` : ''}`, '',
  '| probe | verdict | median ms | tools | modelCalls | fails |', '|---|---|---|---|---|---|']
for (const p of report.probes) {
  const r = p.runs[0] ?? {}
  md.push(`| ${p.id} | ${p.passAll ? 'PASS' : p.flaky ? 'FLAKY' : 'FAIL'} | ${p.medianMs ?? '-'} | ${r.tools ?? '-'} | ${r.modelCalls ?? '-'} | ${(p.runs.flatMap(x => x.fails ?? [])).map(f => f.assert).join('; ') || '-'} |`)
}
writeFileSync(OUT + '.md', md.join('\n') + '\n')
console.log(`\nRESULT ${pass}/${total} pass-all, ${flaky.length} flaky — ${OUT}.json / .md`)
process.exit(report.probes.some(p => !p.passAll) ? 1 : 0)
