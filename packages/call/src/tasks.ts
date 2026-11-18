/**
 * Task lifecycle: call 的执行半段。任务经官方缝委派给 worker 完成——
 * dsh-session 走 sessionController+preset 会话（每轮末输出 [CALL-STATUS] 状态块），
 * cli 走 ctx.subprocess（autoloop 式外部命令行 agent，stdin 喂目标 stdout 收状态）。
 * 监控=session/event 全局监听 + agent/status idle 兜底 + sessionPersistence 读冷尾；
 * 敏感工具调用天然经官方 tools/pre-execute 门闸，无答者 fail-closed。
 */
import type { Context } from '@deepseek-ai/cordis'
import type { SessionId } from '@deepseek-ai/dsh-session'
import type { WorkspaceId } from '@deepseek-ai/dsh-workspace'
import type { Domain } from '@deepseek-ai/dsh-storage-domain'
import { freezeMessage, MessageId, type UserMessage } from '@deepseek-ai/dsh-llm'
import type { callDomain, Task, TaskStatus } from './domain.ts'

export const WORKER_PRESET = 'mino-call-worker'
export const WORKER_SESSION_PREFIX = 'call-task-'

/** Worker 输出契约：每轮回复末尾的状态块。 */
export const STATUS_BLOCK_RE = /\[CALL-STATUS\]\s*(done|needs_review|failed)\s*:\s*([^\n]+)/g

/**
 * Loop 闸的 checkpoint 面：只序列化每次调用的业务结果——ToolBatchResult 封套回显
 * 本次随机 callId，整包比对永不相等（修过的真 bug：确定性闸会永远放行）。
 */
export function loopCheckpointOf(out: { results?: readonly { result?: unknown }[] } | undefined): string {
  return JSON.stringify((out?.results ?? []).map(entry => entry?.result))
}

export interface ParsedStatus {
  status: 'done' | 'needs_review' | 'failed'
  detail: string
}

/** 取最后一个状态块（一轮里只认收尾那条）。 */
export function parseStatusBlock(text: string): ParsedStatus | undefined {
  let last: ParsedStatus | undefined
  for (const m of text.matchAll(STATUS_BLOCK_RE)) {
    last = { status: m[1] as ParsedStatus['status'], detail: m[2]!.trim() }
  }
  return last
}

export type WorkerConfig = {
  kind: 'dsh-session' | 'cli'
  command: string
  timeoutMinutes: number
}

/** Runtime 提供给任务引擎的宿主面。 */
export interface TaskHost {
  readonly ctx: Context
  readonly logger: Context['logger']
  readonly signal: AbortSignal
  callDomain(): CallDomain
  /** Router workspace id——worker 会话开在同一 workspace。 */
  workspaceId(): WorkspaceId
  /** Router workspace 根目录——cli worker 的 cwd。 */
  workspaceRoot(): string
  worker(): WorkerConfig
  /** 给用户递消息（路由会话 + IM + feed 已在外层封装）。 */
  notify(text: string, task: Task): Promise<void>
  onChanged(): void
}

type CallDomain = Domain<typeof callDomain>
const table = (host: TaskHost) => host.callDomain().table('tasks')

const newSessionId = (taskId: string) => `${WORKER_SESSION_PREFIX}${taskId.replace(/^task:/, '').slice(0, 12)}` as SessionId

const briefOf = (task: Task): string => [
  `[call task] ${task.title}`,
  ``,
  task.goal,
  ``,
  `完成后用状态块收尾：[CALL-STATUS] done: <一句话交付>`,
  `需要你拍板时：[CALL-STATUS] needs_review: <具体问题>`,
  `干不下去时：[CALL-STATUS] failed: <原因>`,
].join('\n')

async function injectToSession(host: TaskHost, sessionId: SessionId, text: string): Promise<boolean> {
  const resolved = await host.ctx.sessionController.resolveAgent(sessionId)
  if ('error' in resolved) return false
  const message: UserMessage = freezeMessage({
    id: MessageId(`mino-call:${crypto.randomUUID()}`),
    role: 'user',
    content: [{ type: 'text', text }],
    source: { kind: 'mino-call' },
  })
  resolved.agent.followup(message)
  return true
}

/**
 * 原子转移：mutate 在 update 闭包内执行（读-改-写一体），返回 no-op 时同一对象 →
 * 不记 changed、不通知。终态（done/cancelled）粘性由 mutate 自行守卫——
 * session/event 与 agent/status idle 兜底会并发，后写不得回退前者。
 */
async function transition(host: TaskHost, taskId: string, mutate: (t: Task) => Task): Promise<{ task: Task; changed: boolean } | undefined> {
  let changed = false
  const task = await table(host).update(taskId, t => {
    const next = mutate(t)
    changed = next !== t
    return next
  })
  if (changed) host.onChanged()
  return task === undefined ? undefined : { task, changed }
}

const STICKY: readonly TaskStatus[] = ['done', 'cancelled']

async function applyStatus(host: TaskHost, task: Task, parsed: ParsedStatus): Promise<void> {
  const now = Date.now()
  const guard = (t: Task, patch: Partial<Task>): Task => STICKY.includes(t.status) ? t : { ...t, ...patch, updatedAt: now }
  let out: { task: Task; changed: boolean } | undefined
  if (parsed.status === 'done') {
    out = await transition(host, task.id, t => guard(t, { status: 'done' as TaskStatus, result: parsed.detail, question: undefined }))
    if (out?.changed) await host.notify(`[call 任务] 完成：${out.task.title} — ${parsed.detail}`, out.task)
  } else if (parsed.status === 'needs_review') {
    out = await transition(host, task.id, t => guard(t, { status: 'needs_review' as TaskStatus, question: parsed.detail }))
    if (out?.changed) await host.notify(`[call 任务] 等你拍板：${out.task.title} — ${parsed.detail}（用 call_task_answer 答复）`, out.task)
  } else {
    out = await transition(host, task.id, t => guard(t, { status: 'failed' as TaskStatus, failure: parsed.detail }))
    if (out?.changed) await host.notify(`[call 任务] 失败：${out.task.title} — ${parsed.detail}`, out.task)
  }
}

/** 任务文本（worker 一轮回复/CLI stdout）→ 状态机。无状态块且仍在 working 才推 needs_review。 */
export async function handleWorkerOutput(host: TaskHost, task: Task, text: string): Promise<void> {
  const parsed = parseStatusBlock(text)
  if (parsed === undefined) {
    // 契约违例守卫只允许 working→needs_review：idle 兜底读到的旧尾部若与
    // 正常状态块转移并发，no-block 后写不得回退 done/needs_review/failed。
    const out = await transition(host, task.id, t => t.status === 'working' ? ({
      ...t, status: 'needs_review' as TaskStatus,
      question: 'worker 未按契约输出状态块，请人工看一眼会话', updatedAt: Date.now(),
    }) : t)
    if (out?.changed) await host.notify(`[call 任务] 异常：${out.task.title} — worker 未输出状态块`, out.task)
    return
  }
  await applyStatus(host, task, parsed)
}

async function launchSessionWorker(host: TaskHost, task: Task): Promise<void> {
  const sessionId = newSessionId(task.id)
  const launched = await transition(host, task.id, cur => ({ ...cur, workerSessionId: sessionId, status: 'working', updatedAt: Date.now() }))
  try {
    const listed = await host.ctx.sessionController.list({}, host.signal)
    if (!listed.items.some(item => item.sessionId === sessionId)) {
      await host.ctx.sessionController.create({
        sessionId,
        workspaceId: host.workspaceId(),
        agentPreset: WORKER_PRESET,
      })
    }
    const ok = await injectToSession(host, sessionId, briefOf(launched?.task ?? task))
    if (!ok) throw new Error('worker session did not materialize')
  } catch (error) {
    await transition(host, task.id, cur => ({ ...cur, status: 'failed' as TaskStatus, failure: `worker 会话起不来: ${String(error)}`, updatedAt: Date.now() }))
  }
}

/** `ctx.subprocess` 的真实 spawn 面（SubprocessSpawnSpec：stdio/graceMs 必填，无默认）。 */
interface SubprocessFace {
  spawn(spec: {
    argv: readonly string[]
    cwd: string
    stdio: { stdin: 'ignore' | 'pipe'; stdout: 'ignore' | 'pipe'; stderr: 'ignore' | 'pipe' }
    graceMs: number
    signal?: AbortSignal
  }): {
    stdin?: { write(s: string | Uint8Array): boolean; end(): void }
    stdout?: { on(ev: 'data', cb: (c: Buffer) => void): unknown }
    done: Promise<unknown>
  }
}

async function launchCliWorker(host: TaskHost, task: Task, command: string): Promise<void> {
  const subprocess = host.ctx.get('subprocess') as SubprocessFace | undefined
  if (!subprocess?.spawn) {
    await transition(host, task.id, cur => ({ ...cur, status: 'failed' as TaskStatus, failure: 'subprocess 服务缝未挂载', updatedAt: Date.now() }))
    return
  }
  await transition(host, task.id, cur => ({ ...cur, status: 'working', updatedAt: Date.now() }))
  try {
    const proc = subprocess.spawn({
      argv: command.split(/\s+/).filter(Boolean),
      cwd: host.workspaceRoot(),
      stdio: { stdin: 'pipe', stdout: 'pipe', stderr: 'pipe' },
      graceMs: 5_000,
      signal: host.signal,
    })
    let output = ''
    proc.stdout?.on('data', chunk => { output += chunk.toString('utf8') })
    proc.stdin?.write(briefOf(task) + '\n')
    proc.stdin?.end()
    void proc.done.then(() => handleWorkerOutput(host, table(host).get(task.id) ?? task, output))
      .catch((error: unknown) => transition(host, task.id, cur => ({
        ...cur, status: 'failed' as TaskStatus, failure: `cli worker 进程失败: ${String(error)}`, updatedAt: Date.now(),
      })))
  } catch (error) {
    await transition(host, task.id, cur => ({ ...cur, status: 'failed' as TaskStatus, failure: `cli worker 起不来: ${String(error)}`, updatedAt: Date.now() }))
  }
}

async function launchWorker(host: TaskHost, task: Task): Promise<void> {
  if (task.workerKind === 'cli') {
    const cmd = host.worker().command.trim()
    if (cmd === '') {
      await transition(host, task.id, cur => ({ ...cur, status: 'failed' as TaskStatus, failure: 'worker.kind=cli 但 worker.command 为空', updatedAt: Date.now() }))
    } else {
      await launchCliWorker(host, task, cmd)
    }
  } else {
    await launchSessionWorker(host, task)
  }
}

/** 建任务并委派 worker。workerKind 缺省随配置；matterId 记录来源事项。 */
export async function createTask(host: TaskHost, input: { title: string; goal: string; matterId?: string }): Promise<Task> {
  const now = Date.now()
  const task: Task = {
    id: `task:${crypto.randomUUID()}`,
    title: input.title.slice(0, 80),
    goal: input.goal,
    status: 'open',
    workerKind: host.worker().kind,
    rounds: 0,
    createdAt: now,
    updatedAt: now,
    ...(input.matterId !== undefined ? { matterId: input.matterId } : {}),
  }
  await table(host).put(task.id, task)
  host.onChanged()
  await launchWorker(host, task)
  return table(host).get(task.id) ?? task
}

/** 用户答复 needs_review 任务 → 注回 worker 会话续跑。 */
export async function answerTask(host: TaskHost, taskId: string, answer: string): Promise<{ ok: boolean; error?: string }> {
  const task = table(host).get(taskId)
  if (task === undefined) return { ok: false, error: 'not-found' }
  if (task.status !== 'needs_review') return { ok: false, error: `not-awaiting-answer:${task.status}` }
  if (task.workerKind === 'cli') return { ok: false, error: 'cli worker 已退出，答复无法续跑——重建任务或换 dsh-session' }
  const injected = await injectToSession(host, task.workerSessionId as SessionId, `[call 用户答复] ${answer}\n\n（答复后继续任务，仍按状态块收尾）`)
  if (!injected) return { ok: false, error: 'worker-session-unavailable' }
  await transition(host, taskId, t => ({ ...t, status: 'working' as TaskStatus, question: undefined, rounds: t.rounds + 1, updatedAt: Date.now() }))
  return { ok: true }
}

export async function cancelTask(host: TaskHost, taskId: string): Promise<{ ok: boolean; error?: string }> {
  const task = table(host).get(taskId)
  if (task === undefined) return { ok: false, error: 'not-found' }
  if (task.status === 'done' || task.status === 'cancelled') return { ok: true }
  await transition(host, taskId, t => ({ ...t, status: 'cancelled' as TaskStatus, updatedAt: Date.now() }))
  return { ok: true }
}

/**
 * worker 会话的 assistant/message 事件入口：session.id → 任务 → 状态机。
 * 只处理带状态块的收尾消息；中间叙述忽略。
 */
export async function onSessionEvent(host: TaskHost, sessionId: string, eventType: string, data: unknown): Promise<void> {
  if (!sessionId.startsWith(WORKER_SESSION_PREFIX) || eventType !== 'assistant/message') return
  const content = (data as { message?: { content?: { type: string; text?: string }[] } } | undefined)?.message?.content
  const text = content?.filter(c => c.type === 'text').map(c => c.text ?? '').join('\n') ?? ''
  if (!STATUS_BLOCK_RE.test(text)) return
  STATUS_BLOCK_RE.lastIndex = 0
  const task = [...table(host).entries()].find(([, t]) => t.workerSessionId === sessionId)?.[1]
  if (task === undefined || task.status === 'done' || task.status === 'cancelled') return
  await handleWorkerOutput(host, task, text)
}

interface PersistenceReadFace {
  open(id: SessionId, access: 'read' | 'write', options?: { signal?: AbortSignal }): Promise<{ events: readonly { type: string; data?: unknown }[] }>
}

/** 持久层读会话尾部：最后一条 assistant 消息的文本（冷会话兜底判定用）。 */
async function readSessionTail(host: TaskHost, sessionId: SessionId): Promise<string> {
  const persistence = host.ctx.get('sessionPersistence') as PersistenceReadFace | undefined
  if (!persistence?.open) return ''
  try {
    const handle = await persistence.open(sessionId, 'read', { signal: host.signal })
    for (let i = handle.events.length - 1; i >= 0; i -= 1) {
      const event = handle.events[i]!
      if (event.type !== 'assistant/message') continue
      const content = (event.data as { message?: { content?: { type: string; text?: string }[] } } | undefined)?.message?.content
      return content?.filter(c => c.type === 'text').map(c => c.text ?? '').join('\n') ?? ''
    }
    return ''
  } catch {
    return ''
  }
}

/**
 * agent/status idle 兜底：worker 转空闲但任务仍 working（事件监听丢块/契约违例）——
 * 读持久层最后一条 assistant 消息重判，仍无状态块则按违例转 needs_review。
 */
export async function onWorkerIdle(host: TaskHost, sessionId: string): Promise<void> {
  if (!sessionId.startsWith(WORKER_SESSION_PREFIX)) return
  const task = [...table(host).entries()].find(([, t]) => t.workerSessionId === sessionId)?.[1]
  if (task === undefined || task.status !== 'working') return
  await handleWorkerOutput(host, task, await readSessionTail(host, sessionId as SessionId))
}

/** worker 超时巡检：working 超过 worker.timeoutMinutes 无收尾 → needs_review 拍给人。 */
export async function sweepTaskTimeouts(host: TaskHost): Promise<void> {
  const deadline = Date.now() - host.worker().timeoutMinutes * 60_000
  for (const [, task] of table(host).entries()) {
    if (task.status !== 'working' || task.updatedAt > deadline) continue
    const out = await transition(host, task.id, t => t.status === 'working' ? ({
      ...t, status: 'needs_review' as TaskStatus,
      question: `worker 超过 ${host.worker().timeoutMinutes} 分钟无收尾，请人工看一眼会话`, updatedAt: Date.now(),
    }) : t)
    if (out?.changed) await host.notify(`[call 任务] 超时：${out.task.title} — worker 无收尾，请人工处置`, out.task)
  }
}

/** 官方 schedule 服务的唤醒投递面——投递会物化冷会话，是冷 worker 续跑的官方缝。 */
interface ScheduleWakeFace {
  create(request: {
    title: string
    prompt: string
    timing: { kind: 'after'; after_seconds: number }
    target: { kind: 'session'; sessionId: SessionId }
  }, actorSessionId?: SessionId, signal?: AbortSignal): Promise<unknown>
}

interface PersistenceStatFace {
  stat(id: SessionId, options?: { signal?: AbortSignal }): Promise<unknown | undefined>
}

/**
 * 开机恢复：working 任务的 worker 会话——持久层 stat 确认会话还在 →
 * 经官方 schedule 投递「继续」唤醒（物化冷会话的官方缝）；会话真丢 → needs_review 拍给人。
 */
export async function recoverTasks(host: TaskHost): Promise<void> {
  const schedule = host.ctx.get('schedule') as ScheduleWakeFace | undefined
  const persistence = host.ctx.get('sessionPersistence') as PersistenceStatFace | undefined
  for (const [, task] of table(host).entries()) {
    // 停机恰好落在 put 与 launch 之间：open 任务重派 worker。
    if (task.status === 'open') {
      await launchWorker(host, task)
      continue
    }
    if (task.status !== 'working' || task.workerKind !== 'dsh-session' || task.workerSessionId === undefined) continue
    const sessionId = task.workerSessionId as SessionId
    let exists = true
    try { exists = (await persistence?.stat(sessionId, { signal: host.signal })) !== undefined } catch { /* stat 不可达按存在处理 */ }
    if (!exists) {
      await transition(host, task.id, t => ({
        ...t, status: 'needs_review' as TaskStatus, question: 'worker 会话已不在持久层，任务无法续跑，请人工处置', updatedAt: Date.now(),
      }))
      continue
    }
    if (!schedule?.create) {
      await transition(host, task.id, t => ({
        ...t, status: 'needs_review' as TaskStatus, question: 'schedule 服务缝未挂载，worker 无法唤醒，请人工确认', updatedAt: Date.now(),
      }))
      continue
    }
    try {
      await schedule.create({
        title: `call 恢复任务：${task.title.slice(0, 40)}`,
        prompt: `[call 恢复] 之前被中断，请继续任务：${task.title}，仍按状态块收尾。`,
        timing: { kind: 'after', after_seconds: 3 },
        target: { kind: 'session', sessionId },
      }, undefined, host.signal)
    } catch (error) {
      host.logger.warn('mino-call: task %s recovery wake failed: %s', task.id, String(error))
    }
  }
}
