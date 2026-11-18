/**
 * mino-brief 宿主半：早晚简报流水线。
 *
 * 形态 = 固定 preset 会话 + 宿主 schedule 定时唤醒：
 *   schedule.create(daily) → 到点向 `mino-brief` 会话投递 user 消息
 *   → 简报员普通模型轮生成 → 自行调 today_post（mino-today 提供）投到「今日」页。
 * 生成管线不自造——一次带人格的模型轮就是生成器；定时条目出现在宿主
 * schedules 面板与 mino-today 定时 tab，用户可暂停/删除。
 * 删除过的条目记 tombstone，不偷偷复活。
 */
import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-api-session-controller'
import type { SessionController } from '@deepseek-ai/dsh-api-session-controller'
import type {} from '@deepseek-ai/dsh-storage-domain'
import type {} from '@deepseek-ai/dsh-workspace'
import type {} from '@deepseek-ai/dsh-schedule'
import { z } from 'zod'
import { briefDomain } from './domain.ts'
import type { Domain } from '@deepseek-ai/dsh-storage-domain'

export const name = 'mino-brief'
export const inject = ['storageDomain', 'sessionController', 'workspaceRegistry', 'webServer', 'schedule']

const TIME_RE = /^\d{2}:\d{2}(:\d{2}(\.\d{1,3})?)?$/

export const Config = z.object({
  /** Directory the brief Workspace owns; defaults to the profile's working directory. */
  workspaceRoot: z.string().optional(),
  /** IANA zone the daily entries fire in. */
  timeZone: z.string().default('Asia/Shanghai'),
  /** Morning brief entry; `HH:mm` or `HH:mm:ss` local. */
  morning: z.object({
    enabled: z.boolean().default(true),
    time: z.string().regex(TIME_RE).default('08:00'),
    prompt: z.string().default(
      '生成今日早报：面向今天这一天——今天的日程线索、昨晚以来值得留意的变化、未完成事项的跟进提醒。' +
      '产出用 today_post 投到今日页：batch=今日早报，batchKind=morning_brief。',
    ),
  }).prefault({}),
  /** Evening brief entry. */
  evening: z.object({
    enabled: z.boolean().default(true),
    time: z.string().regex(TIME_RE).default('21:00'),
    prompt: z.string().default(
      '生成今日晚报：回顾这一天——今天完成和发生的事、明天要接续的线索。' +
      '产出用 today_post 投到今日页：batch=今日晚报，batchKind=evening_brief。',
    ),
  }).prefault({}),
}).prefault({})
export type BriefConfig = z.infer<typeof Config>

/** 会话 id 的品牌类型——经控制器签名派生，免直装 dsh-session。 */
type SessionIdT = Awaited<ReturnType<SessionController['list']>>['items'][number]['sessionId']

const SESSION_ID = 'mino-brief' as SessionIdT
const PRESET_ID = 'mino-brief'
const SESSION_TITLE = '简报'
const TITLE_KEY = 'title'

interface SlotSpec { slot: 'morning' | 'evening'; title: string; time: string; prompt: string; enabled: boolean }

interface WebServerFace {
  register(route: { kind: 'exact'; path: string; handler: (req: NodeReq, res: NodeRes) => Promise<void> | void }): () => void
}
interface NodeReq { method?: string; [Symbol.asyncIterator]?: () => AsyncIterableIterator<unknown> }
interface NodeRes { writeHead(status: number, headers?: Record<string, string>): void; end(body?: string): void }
/** 宿主 schedule 服务（catalog/create/edit 同 mino-today 用的结构面）。 */
interface ScheduleFace {
  catalog(): Promise<ScheduleEntry[]>
  create(request: { title: string; prompt: string; timing: { kind: 'daily'; daily: { time: string; time_zone: string } }; target?: { kind: 'session'; sessionId?: string } | { kind: 'new'; create?: { agentPreset?: string } } }): Promise<ScheduleEntry>
  edit(request: { id: string; action: 'update' | 'delete'; patch?: { active?: boolean } }): Promise<unknown>
}
interface ScheduleEntry {
  id: string
  kind: string
  title: string
  status: 'active' | 'paused' | 'ended'
  /** daily 条目记录的 HH:mm:ss(.SSS) 触发时刻。 */
  time?: string
  scheduledAt?: string
}

const JSON_HEADERS = { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }
const MAX_PREF = 600

function sendJson(res: NodeRes, status: number, body: unknown): void {
  res.writeHead(status, JSON_HEADERS)
  res.end(JSON.stringify(body))
}

async function readBody(req: NodeReq): Promise<Record<string, unknown>> {
  let raw = ''
  for await (const chunk of req as AsyncIterable<unknown>) raw += String(chunk)
  if (!raw) return {}
  try {
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed as Record<string, unknown> : {}
  } catch {
    return {}
  }
}

/** 偏好状态行键：`pref:morning`/`pref:evening` → 用户写的内容偏好文本。 */
const prefKey = (slot: string) => `pref:${slot}`
/** 基础 prompt 合并偏好：重建定时条目时用这个全文。 */
const mergedPrompt = (spec: SlotSpec, preference: string): string =>
  spec.prompt + (preference.trim() ? `\n\n她的内容偏好：${preference.trim()}` : '')
/** 条目记录里的 HH:mm:ss(.SSS) → 显示用 HH:mm。 */
const displayTime = (t?: string): string => (t && /^\d{2}:\d{2}/.test(t) ? t.slice(0, 5) : '')

export async function apply(ctx: Context, config: BriefConfig): Promise<void> {
  const logger = ctx.logger('mino-brief')
  const domain: Domain<typeof briefDomain> = await ctx.storageDomain.open(briefDomain)
  const state = domain.table('state')

  const workspace = await ctx.workspaceRegistry.create(config.workspaceRoot ?? process.cwd())
  // resolveAgent 只覆盖活会话——冷会话要用持久层 list 判存在，避免重复 create 撞 ApiSessionCwdConflict。
  const listed = await ctx.sessionController.list({}, new AbortController().signal)
  if (!listed.items.some(item => item.sessionId === SESSION_ID)) {
    try {
      await ctx.sessionController.create({
        sessionId: SESSION_ID,
        workspaceId: workspace.id,
        agentPreset: PRESET_ID,
      })
      logger.info('brief session created: %s', SESSION_ID)
    } catch (error) {
      // 会话已登记在另一个 workspace 下——投递按 sessionId 走，沿用旧会话即可。
      logger.warn('brief session reuse: %s', error instanceof Error ? error.message : String(error))
    }
  }
  const resolved = await ctx.sessionController.resolveAgent(SESSION_ID)
  if (!('error' in resolved) && state.get(TITLE_KEY) === undefined) {
    resolved.agent.session.append('session/title', { title: SESSION_TITLE, messageSeqs: [], source: { kind: 'user' } })
    await state.put(TITLE_KEY, { key: TITLE_KEY, value: '1' })
  }

  const schedule = ctx.get('schedule')
  if (!schedule) {
    logger.warn('host schedule service unavailable — brief slots not registered')
    return
  }
  const webServer = ctx.get('webServer') as WebServerFace | undefined
  const route = (path: string, handler: (req: NodeReq, res: NodeRes) => Promise<void> | void) => {
    if (!webServer) return
    ctx.effect(() =>
      webServer.register({
        kind: 'exact',
        path,
        handler: async (req, res) => {
          try {
            await handler(req, res)
          } catch (error) {
            sendJson(res, 500, { ok: false, error: String(error && (error as Error).message) })
          }
        },
      }),
    )
  }

  const catalog = await schedule.catalog()
  const byId = new Map(catalog.map(entry => [entry.id as string, entry]))

  for (const spec of slotSpecs(config)) {
    const idKey = `schedule:${spec.slot}`
    const goneKey = `gone:${spec.slot}`
    const storedId = state.get(idKey)?.value
    const stored = storedId === undefined ? undefined : byId.get(storedId)
    if (stored) continue
    if (storedId !== undefined) {
      // Stored entry vanished from the catalog: the user deleted it — keep the tombstone.
      await state.put(goneKey, { key: goneKey, value: '1' })
      continue
    }
    if (state.get(goneKey) !== undefined || !spec.enabled) continue
    // A hand-made entry with the same title counts as ownership — adopt, never duplicate.
    const adopted = catalog.find(entry => entry.title === spec.title)
    if (adopted) {
      await state.put(idKey, { key: idKey, value: adopted.id })
      continue
    }
    const created = await schedule.create({
      title: spec.title,
      prompt: mergedPrompt(spec, state.get(prefKey(spec.slot))?.value ?? ''),
      timing: { kind: 'daily', daily: { time: normalizeTime(spec.time), time_zone: config.timeZone } },
      target: { kind: 'session', sessionId: SESSION_ID },
    })
    await state.put(idKey, { key: idKey, value: created.id as string })
    logger.info('brief schedule created: %s at %s %s', spec.title, spec.time, config.timeZone)
  }

  /** 早晚报编辑器（Today briefEditor 语义）：读 = 各槽的偏好/开关/时间；写 = 偏好与改时重建条目、开关走 edit。 */
  route('/mino-brief/api/prefs', async (req, res) => {
    const specs = slotSpecs(config)
    const sched = schedule as ScheduleFace | undefined
    const entries = sched ? await sched.catalog() : []
    const entryOf = (slot: string) => {
      const id = state.get(`schedule:${slot}`)?.value
      return id === undefined ? undefined : entries.find(e => e.id === id)
    }

    if (req.method !== 'POST') {
      sendJson(res, 200, {
        ok: true,
        slots: specs.map(spec => {
          const entry = entryOf(spec.slot)
          return {
            slot: spec.slot,
            title: spec.title,
            enabled: entry ? entry.status === 'active' : false,
            hasEntry: !!entry,
            time: displayTime(entry?.time) || spec.time.slice(0, 5),
            preference: state.get(prefKey(spec.slot))?.value ?? '',
          }
        }),
      })
      return
    }

    const body = await readBody(req)
    const spec = specs.find(s => s.slot === body.slot)
    if (!spec || !sched) return sendJson(res, 400, { ok: false, error: '没这个槽位或调度服务缺席' })
    const idKey = `schedule:${spec.slot}`
    const entry = entryOf(spec.slot)

    if (typeof body.enabled === 'boolean' && entry && (entry.status === 'active') !== body.enabled) {
      await sched.edit({ id: entry.id, action: 'update', patch: { active: body.enabled } })
    }

    const pref = typeof body.preference === 'string' ? body.preference.slice(0, MAX_PREF).trim() : undefined
    const time = typeof body.time === 'string' && TIME_RE.test(body.time) ? body.time.slice(0, 5) : undefined
    const storedPref = state.get(prefKey(spec.slot))?.value ?? ''
    const prefChanged = pref !== undefined && pref !== storedPref
    const timeChanged = time !== undefined && time !== displayTime(entry?.time)
    if (prefChanged) await state.put(prefKey(spec.slot), { key: prefKey(spec.slot), value: pref ?? '' })

    // 偏好/时间变了 → 删旧建新（schedule.edit 只能拨开关，prompt/timing 不可 patch）。
    if (entry && (prefChanged || timeChanged)) {
      await sched.edit({ id: entry.id, action: 'delete' })
    }
    if ((prefChanged || timeChanged || (body.enabled === true && !entry))) {
      const created = await sched.create({
        title: spec.title,
        prompt: mergedPrompt(spec, pref ?? storedPref),
        timing: { kind: 'daily', daily: { time: normalizeTime(time ?? displayTime(entry?.time) ?? spec.time), time_zone: config.timeZone } },
        target: { kind: 'session', sessionId: SESSION_ID },
      })
      await state.put(idKey, { key: idKey, value: created.id as string })
      // 手动删掉条目形成的 tombstone 在新条目落地后失去意义。
      if (state.get(`gone:${spec.slot}`) !== undefined) await state.delete(`gone:${spec.slot}`).catch(() => {})
    }
    sendJson(res, 200, { ok: true })
  })
}

function slotSpecs(config: BriefConfig): SlotSpec[] {
  return [
    { slot: 'morning', title: 'Mino 早报', ...config.morning },
    { slot: 'evening', title: 'Mino 晚报', ...config.evening },
  ]
}

/** `HH:mm` → `HH:mm:00`; `HH:mm:ss(.SSS)` passes through. */
function normalizeTime(time: string): string {
  return time.length === 5 ? `${time}:00` : time
}
