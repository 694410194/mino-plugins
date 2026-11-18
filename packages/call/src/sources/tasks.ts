/** tasks source: reads the task-board plugin's snapshot through its public cordis service seam.
 *
 * `ctx.get('taskBoard').snapshot()` — the same face the board publishes for remote bridges
 * (task-board/src/index.ts ctx.provide('taskBoard', ...)). No tool-name probing, no private
 * store reads; absent board → source idles and retries.
 */
import type { Context } from '@deepseek-ai/cordis'
import type { Source, SourceHost } from '../source.ts'

export const TASK_SOURCE = 'tasks'
const RETRY_MS = 15_000

/** task-board TaskStatus（其 TaskRecord 契约）。 */
type TaskStatus = 'backlog' | 'todo' | 'running' | 'done' | 'failed'

/** task-board TaskRecord 的本源所需子集（结构面，不 import 插件内部类型）。 */
interface TaskRow {
  id: string
  title: string
  status: TaskStatus
  updatedAt: number
  schedule?: { kind?: string; nextRunAt?: number }
}

interface TaskBoardFace {
  snapshot(): { enabled: boolean; tasks: readonly TaskRow[] }
}

export interface TaskSourceConfig {
  /** Poll interval in minutes. */
  intervalMinutes: number
  /** 「todo 里排了时间且已过期/临近」是否也算信号（minutes 内临近视为临近）。 */
  dueSoonMinutes: number
}

const pause = (ms: number, signal: AbortSignal): Promise<void> =>
  new Promise(resolve => {
    if (signal.aborted) return resolve()
    const timer = setTimeout(resolve, ms)
    signal.addEventListener('abort', () => { clearTimeout(timer); resolve() }, { once: true })
  })

export function taskSource(ctx: Context, config: TaskSourceConfig): Source {
  let warnedMissing = false
  return {
    kind: TASK_SOURCE,
    async run(host, signal) {
      while (!signal.aborted) {
        const board = ctx.get('taskBoard') as TaskBoardFace | undefined
        if (!board?.snapshot) {
          await pause(RETRY_MS, signal)
          continue
        }
        try {
          const snap = board.snapshot()
          warnedMissing = false
          const now = Date.now()
          for (const task of snap.tasks) {
            const dueAt = task.schedule?.nextRunAt
            const overdue = task.status === 'todo' && typeof dueAt === 'number' && dueAt - now <= config.dueSoonMinutes * 60_000
            if (task.status !== 'failed' && !overdue) continue
            await host.emit({
              sourceKind: TASK_SOURCE,
              // 状态或更新时间变化才重新浮出；稳态同一任务幂等。
              externalId: `${task.id}@${task.updatedAt}`,
              groupKey: `tasks:${task.status}`,
              summary: task.status === 'failed'
                ? `[任务失败] ${task.title}`.slice(0, 500)
                : `[任务到期] ${task.title}`.slice(0, 500),
            })
          }
        } catch (error) {
          if (!warnedMissing) {
            warnedMissing = true
            host.logger.info('mino-call tasks: snapshot failed, will retry silently: %s', String(error))
          }
        }
        await pause(config.intervalMinutes * 60_000, signal)
      }
    },
  }
}
