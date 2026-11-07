// mino-feiyu-garden 宿主半边：状态存储 + /api/feiyu-garden/* 路由 + 陪伴记账。
// 只用官方缝：webServer 路由、agent/created、agent/disposed、settings/config。
// 不读其他插件的文件和服务 —— 状态全部自持。
import { mkdir, readFile, rename, stat, writeFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { join } from 'node:path'

const ROUTE = '/api/feiyu-garden'
const MOOD_BASELINE = 60
const MOOD_DRIFT_PER_HOUR = 2
const SATIETY_DRIFT_PER_HOUR = 4
const MAX_LOG = 200

// ---------------------------------------------------------------- 小工具

const clamp = (v, lo = 0, hi = 100) => Math.min(hi, Math.max(lo, v))
const now = () => Date.now()
const iso = () => new Date().toISOString()
const newId = (p) => `${p}_${now().toString(36)}${Math.random().toString(36).slice(2, 8)}`

function homeDir(env = process.env) {
  // 品牌纪律：默认 ~/.mino；DSH_HOME 是用户显式指定的兼容路径，允许但不探测
  return env.DSH_HOME || join(homedir(), '.mino')
}

function seed() {
  return {
    name: '小肥',
    createdAt: iso(),
    exp: 0,
    mood: { score: 72, updatedAt: now() },
    satiety: { score: 64, updatedAt: now() },
    tokensFed: 0,
    scene: 'auto',
    settings: { reduceMotion: false, chime: true },
    stats: { pets: 0, feeds: 0, sessions: 0, minutesTogether: 0 },
    log: [{ id: newId('l'), at: iso(), kind: 'born', text: '她游进了海蒂花园' }],
    open: {},
  }
}

// 惰性结算：读的时候先把衰减折进去，写的时候才落盘
function settle(state, at = now()) {
  const hours = (t) => Math.max(0, (at - t) / 3600000)
  if (state.satiety?.updatedAt) {
    state.satiety.score = clamp(state.satiety.score - SATIETY_DRIFT_PER_HOUR * hours(state.satiety.updatedAt))
    state.satiety.updatedAt = at
  }
  if (state.mood?.updatedAt) {
    const h = hours(state.mood.updatedAt)
    const hungry = state.satiety.score < 20 ? 3 : 0
    const drift = (MOOD_DRIFT_PER_HOUR + hungry) * h
    // 心情往基线回归：高于基线慢慢落，低于基线会被饿拉住不升
    if (state.mood.score > MOOD_BASELINE) {
      state.mood.score = Math.max(MOOD_BASELINE, state.mood.score - drift)
    } else if (hungry > 0) {
      state.mood.score = Math.max(0, state.mood.score - drift)
    }
    state.mood.updatedAt = at
  }
  return state
}

function levelOf(exp) {
  // level n 需要 n²·40 的累计 exp：1→40, 2→160, 3→360, 5→1000
  let lv = 1
  while (exp >= lv * lv * 40) lv += 1
  const floor = (lv - 1) * (lv - 1) * 40
  const next = lv * lv * 40
  return { level: lv, into: exp - floor, span: next - floor }
}

function moodLabel(score) {
  if (score >= 85) return '雀跃'
  if (score >= 65) return '开心'
  if (score >= 45) return '平静'
  if (score >= 25) return '蔫蔫'
  return '委屈'
}

class Store {
  constructor(root = join(homeDir(), 'feiyu-garden')) {
    this.root = root
    this.file = join(root, 'state.json')
    this.state = null
    this.mtimeMs = 0
    this.queue = Promise.resolve()
  }

  async refresh() {
    await mkdir(this.root, { recursive: true })
    let info = null
    try { info = await stat(this.file) } catch (err) { if (err.code !== 'ENOENT') throw err }
    if (!info) {
      this.state = seed()
      await this.persist()
      return
    }
    if (this.state && info.mtimeMs === this.mtimeMs) return
    this.state = { ...seed(), ...JSON.parse(await readFile(this.file, 'utf8')) }
    this.mtimeMs = info.mtimeMs
  }

  async persist() {
    const tmp = `${this.file}.${process.pid}.tmp`
    await writeFile(tmp, JSON.stringify(this.state))
    await rename(tmp, this.file)
    this.mtimeMs = (await stat(this.file)).mtimeMs
  }

  run(task) {
    const next = this.queue.then(task, task)
    this.queue = next.catch(() => {})
    return next
  }

  read() {
    return this.run(async () => {
      await this.refresh()
      settle(this.state)
      return this.state
    })
  }

  mutate(mutate) {
    return this.run(async () => {
      await this.refresh()
      settle(this.state)
      const result = await mutate(this.state)
      await this.persist()
      return result
    })
  }
}

function say(state, kind, text) {
  state.log.push({ id: newId('l'), at: iso(), kind, text })
  if (state.log.length > MAX_LOG) state.log = state.log.slice(-MAX_LOG)
}

function addExp(state, n) {
  const before = levelOf(state.exp).level
  state.exp += n
  const after = levelOf(state.exp).level
  if (after > before) say(state, 'level', `她升到了 ${after} 级，开心地翻了个身`)
}

// ---------------------------------------------------------------- 动作

const ACTIONS = {
  feed(state) {
    state.stats.feeds += 1
    const tokens = 15 + Math.floor(Math.random() * 26)
    state.tokensFed += tokens
    state.satiety.score = clamp(state.satiety.score + 25)
    state.mood.score = clamp(state.mood.score + 6)
    addExp(state, 15)
    say(state, 'feed', `你喂了她一把鱼粮（+${tokens}）`)
    return { burst: 'feed', tokens }
  },
  pet(state) {
    state.stats.pets += 1
    state.mood.score = clamp(state.mood.score + 10)
    addExp(state, 8)
    say(state, 'pet', '你摸了摸她的头，她眯起了眼睛')
    return { burst: 'pet' }
  },
  rename(state, body) {
    const name = String(body.name ?? '').trim().slice(0, 12)
    if (!name) return { error: 'empty-name' }
    state.name = name
    say(state, 'rename', `她现在叫「${name}」`)
    return { ok: true }
  },
  scene(state, body) {
    const scene = String(body.scene ?? 'auto')
    if (!['auto', 'dawn', 'dusk', 'night', 'abyss'].includes(scene)) return { error: 'bad-scene' }
    state.scene = scene
    return { ok: true }
  },
  settings(state, body) {
    state.settings = { ...state.settings, ...pick(body, ['reduceMotion', 'chime']) }
    return { ok: true }
  },
}

const pick = (obj, keys) => Object.fromEntries(keys.filter(k => k in (obj ?? {})).map(k => [k, obj[k]]))

function publicState(state) {
  const lv = levelOf(state.exp)
  return {
    name: state.name,
    createdAt: state.createdAt,
    exp: state.exp,
    level: lv.level,
    levelInto: lv.into,
    levelSpan: lv.span,
    mood: Math.round(state.mood.score),
    moodLabel: moodLabel(state.mood.score),
    satiety: Math.round(state.satiety.score),
    tokensFed: state.tokensFed,
    scene: state.scene,
    settings: state.settings,
    stats: state.stats,
    log: state.log.slice(-60).reverse(),
  }
}

// ---------------------------------------------------------------- HTTP

function json(res, status, body) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
  res.end(JSON.stringify(body))
}

async function readJson(req) {
  const chunks = []
  let size = 0
  for await (const c of req) {
    size += c.length
    if (size > 64_000) throw Object.assign(new Error('too large'), { status: 413 })
    chunks.push(c)
  }
  if (!chunks.length) return {}
  return JSON.parse(Buffer.concat(chunks).toString('utf8'))
}

// ---------------------------------------------------------------- apply

export const name = 'mino-feiyu-garden'
export const inject = []

export function apply(ctx) {
  const store = new Store()

  // 陪伴记账：官方事件缝。开工 +exp；收工按分钟折算。
  const opened = new Map()
  ctx.on('agent/created', (agent) => {
    const id = agent?.session?.id ?? agent?.id ?? newId('a')
    opened.set(id, now())
    store.mutate((s) => {
      s.stats.sessions += 1
      addExp(s, 10)
      say(s, 'companion', '她看到你开工，尾巴翘了起来')
    }).catch(() => {})
  })
  ctx.on('agent/disposed', (agent) => {
    const id = agent?.session?.id ?? agent?.id
    const start = opened.get(id)
    if (start === undefined) return
    opened.delete(id)
    const minutes = Math.max(1, Math.round((now() - start) / 60000))
    store.mutate((s) => {
      s.stats.minutesTogether += minutes
      addExp(s, Math.min(30, Math.floor(minutes / 2)))
      if (minutes >= 30) say(s, 'companion', `她陪了你 ${minutes} 分钟`)
    }).catch(() => {})
  })

  // 路由：官方 webServer 缝，只在 web/desktop 档出现；headless 档永不解析不炸
  ctx.inject(['webServer'], (webCtx) => {
    webCtx.effect(() => webCtx.webServer.register({
      kind: 'prefix',
      path: ROUTE,
      handler: async (req, res) => {
        try {
          const url = new URL(req.url, 'http://127.0.0.1')
          const sub = url.pathname.slice(ROUTE.length) || '/'
          if (req.method === 'GET' && (sub === '/' || sub === '/state')) {
            const state = await store.read()
            return json(res, 200, publicState(state))
          }
          if (req.method === 'POST' && sub === '/action') {
            const body = await readJson(req)
            const type = String(body.type ?? '')
            const fn = ACTIONS[type]
            if (!fn) return json(res, 400, { error: 'unknown-action' })
            const result = await store.mutate((s) => {
              const r = fn(s, body) ?? {}
              return { ...r, state: publicState(s) }
            })
            return json(res, 200, result)
          }
          return json(res, 404, { error: 'not-found' })
        } catch (err) {
          return json(res, err.status ?? 500, { error: String(err?.message ?? err) })
        }
      },
    }), 'feiyu-garden: 状态路由')
  })

  ctx.logger?.info?.('feiyu-garden: 海蒂花园已开园（/api/feiyu-garden/state）')
}
