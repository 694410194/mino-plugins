/**
 * mino-meeting-detect 宿主半：日历临近会议检测。
 *
 * 形态 = 轮询 connector-calendar 的 cal_upcoming（tools.execute 服务级调用）
 * → 临近事件在自有存储域记 tombstone → 宿主 schedule 排一次性提醒投递到
 * 专用提醒会话 → 该会话的模型轮问用户要不要开录音（ask_user_question /
 * vnote_start 都在会话工具面，模型自己决定）。
 *
 * 平台事实（已验证）：宿主无服务端持续音频缝，录音必须由 client 半
 * MediaRecorder 采集——所以本插件只做「检测+提醒」，不假装能自动开录。
 * connector-calendar 缺席时轮询安静空转。
 */
import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-api-session-controller'
import type { SessionController } from '@deepseek-ai/dsh-api-session-controller'
import type {} from '@deepseek-ai/dsh-storage-domain'
import type {} from '@deepseek-ai/dsh-workspace'
import type {} from '@deepseek-ai/dsh-schedule'
import { z } from 'zod'
import { meetingDomain } from './domain.ts'
import type { Domain } from '@deepseek-ai/dsh-storage-domain'

export const name = 'mino-meeting-detect'
export const inject = ['storageDomain', 'sessionController', 'workspaceRegistry']

export const Config = z.object({
  workspaceRoot: z.string().optional(),
  /** Poll interval in minutes. */
  pollMinutes: z.number().min(1).default(5),
  /** Meetings starting within this many minutes count as upcoming. */
  leadMinutes: z.number().min(1).default(15),
  /** cal_upcoming lookahead days. */
  lookaheadDays: z.number().min(1).max(30).default(2),
}).prefault({})
export type MeetingDetectConfig = z.infer<typeof Config>

/** 会话 id 的品牌类型——经控制器签名派生，免直装 dsh-session。 */
type SessionIdT = Awaited<ReturnType<SessionController['list']>>['items'][number]['sessionId']

const SESSION_ID = 'mino-meeting-detect' as SessionIdT
const PRESET_ID = 'mino-meeting-detect'
const SESSION_TITLE = '会议提醒'
const TITLE_KEY = 'title'

interface ToolsExecFace {
  execute(input: {
    calls: readonly { type: 'tool-call'; id: string; name: string; arguments: string }[]
    signal: AbortSignal
  }): Promise<{
    results: readonly { callId: string; result: { isError: boolean; value?: unknown; error?: { message?: string } } }[]
  }>
}

interface ScheduleFace {
  create(request: {
    title: string
    prompt: string
    timing: { kind: 'after'; after_seconds: number } | { kind: 'at'; at: string }
    target: { kind: 'session'; sessionId: string }
  }): Promise<{ id: string }>
}

/** cal_upcoming 输出行（其 output.schema 契约）。 */
interface CalEvent {
  dtstart: string
  dtend: string
  summary: string
  location: string
}

/** '2026-11-19 09:30'（本地时区）→ epoch ms；解析失败返回 undefined。 */
function parseLocal(dt: string): number | undefined {
  const ms = Date.parse(dt.replace(' ', 'T'))
  return Number.isNaN(ms) ? undefined : ms
}

const pause = (ms: number, signal: AbortSignal): Promise<void> =>
  new Promise(resolve => {
    if (signal.aborted) return resolve()
    const timer = setTimeout(resolve, ms)
    signal.addEventListener('abort', () => { clearTimeout(timer); resolve() }, { once: true })
  })

export async function apply(ctx: Context, config: MeetingDetectConfig): Promise<void> {
  const logger = ctx.logger('mino-meeting-detect')
  const domain: Domain<typeof meetingDomain> = await ctx.storageDomain.open(meetingDomain)
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
      logger.info('meeting session created: %s', SESSION_ID)
    } catch (error) {
      // 会话已登记在另一个 workspace 下——投递按 sessionId 走，沿用旧会话即可。
      logger.warn('meeting session reuse: %s', error instanceof Error ? error.message : String(error))
    }
  }
  const resolved = await ctx.sessionController.resolveAgent(SESSION_ID)
  if (!('error' in resolved) && state.get(TITLE_KEY) === undefined) {
    resolved.agent.session.append('session/title', { title: SESSION_TITLE, messageSeqs: [], source: { kind: 'user' } })
    await state.put(TITLE_KEY, { key: TITLE_KEY, value: '1' })
  }

  const schedule = ctx.get('schedule') as ScheduleFace | undefined
  const controller = new AbortController()
  ctx.effect(() => () => { controller.abort() })

  const remind = async (ev: CalEvent, startMs: number): Promise<void> => {
    const dedupKey = `reminded:${ev.dtstart}|${ev.summary}`
    if (state.get(dedupKey) !== undefined) return
    const now = Date.now()
    const remindAt = Math.max(now + 10_000, startMs - config.leadMinutes * 60_000)
    const timing = remindAt <= now + 30_000
      ? { kind: 'after' as const, after_seconds: 10 }
      : { kind: 'at' as const, at: new Date(remindAt).toISOString() }
    if (!schedule) {
      logger.warn('host schedule service unavailable — meeting reminder skipped')
      return
    }
    const created = await schedule.create({
      title: `会议提醒：${ev.summary}`.slice(0, 120),
      prompt: `会议「${ev.summary}」${ev.dtstart}${ev.location ? ` 在 ${ev.location}` : ''} 即将开始（约 ${config.leadMinutes} 分钟后）。按你的人格指引问用户要不要录音记笔记。`,
      timing,
      target: { kind: 'session', sessionId: SESSION_ID },
    })
    await state.put(dedupKey, { key: dedupKey, value: created.id as string })
    logger.info('meeting reminder scheduled: %s at %s', ev.summary, ev.dtstart)
  }

  const poll = async (): Promise<void> => {
    const tools = ctx.get('tools') as ToolsExecFace | undefined
    if (!tools?.execute) return
    try {
      const { results } = await tools.execute({
        calls: [{ type: 'tool-call', id: 'mino-meeting-detect-upcoming', name: 'cal_upcoming', arguments: JSON.stringify({ days: config.lookaheadDays }) }],
        signal: controller.signal,
      })
      const res = results[0]?.result
      if (!res || res.isError) return
      const events = (res.value as { events?: CalEvent[] } | undefined)?.events ?? []
      const now = Date.now()
      for (const ev of events) {
        const startMs = parseLocal(ev.dtstart)
        if (startMs === undefined || startMs <= now) continue
        await remind(ev, startMs)
      }
    } catch (error) {
      logger.info('meeting-detect poll failed, will retry: %s', String(error))
    }
  }

  const fiber = (async () => {
    while (!controller.signal.aborted) {
      await poll()
      await pause(config.pollMinutes * 60_000, controller.signal)
    }
  })()
  void fiber
}
