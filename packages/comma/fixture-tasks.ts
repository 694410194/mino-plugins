/**
 * Deterministic fixture for the comma task/worker layer. Stubs every official seam
 * (sessionController / agent.followup / sessionPersistence / schedule / subprocess)
 * with in-memory faces and asserts the whole lifecycle:
 * create→working→needs_review→answer→working→done, idle fallback, timeout sweep,
 * cold recovery, cli worker, loop ops, notebook board section.
 * Run: node fixture-tasks.ts   (node 24 type-strips .ts imports)
 */
import assert from 'node:assert/strict'
import {
  createTask, answerTask, cancelTask, onSessionEvent, onWorkerIdle,
  recoverTasks, sweepTaskTimeouts, parseStatusBlock, handleWorkerOutput,
  WORKER_PRESET, WORKER_SESSION_PREFIX,
} from './src/tasks.ts'
import { routerToolDefs } from './src/tools.ts'
import { renderNotebook } from './src/notebook.ts'

const results: string[] = []
const ok = (name: string) => { results.push(`PASS ${name}`) }

function tableStub<T extends { id?: string }>(seed: [string, T][] = []) {
  const map = new Map(seed)
  return {
    get: (k: string) => map.get(k),
    put: async (k: string, v: T) => { map.set(k, v) },
    update: async (k: string, fn: (v: T) => T) => { const v = fn(map.get(k)!); map.set(k, v); return v },
    delete: async (k: string) => map.delete(k),
    entries: () => map.entries(),
    _map: map,
  }
}

function makeHost(opts: {
  workerKind?: 'dsh-session' | 'cli'
  workerCommand?: string
  timeoutMinutes?: number
  persisted?: Map<string, { type: string; data?: unknown }[] | undefined>
  statMissing?: Set<string>
  noSchedule?: boolean
} = {}) {
  const tasks = tableStub<any>()
  const loops = tableStub<any>()
  const created: any[] = []
  const injected: { id: string; text: string }[] = []
  const schedules: any[] = []
  const spawns: { spec: any; stdin: string[]; stdoutCb: ((c: Buffer) => void)[]; resolveDone: () => void }[] = []
  const notices: string[] = []

  const faces: Record<string, unknown> = {}
  if (!opts.noSchedule) {
    faces['schedule'] = { create: async (req: any) => { schedules.push(req); return { id: 'sched-1' } } }
  }
  faces['sessionPersistence'] = {
    stat: async (id: string) => opts.statMissing?.has(id) ? undefined : { id },
    open: async (id: string) => ({ events: opts.persisted?.get(id) ?? [] }),
  }
  faces['subprocess'] = {
    spawn: (spec: any) => {
      const stdoutCb: ((c: Buffer) => void)[] = []
      const rec = {
        spec, stdin: [] as string[], stdoutCb,
        resolveDone: () => {},
      }
      const proc = {
        stdin: { write: (s: string) => { rec.stdin.push(s); return true }, end: () => {} },
        stdout: { on: (ev: string, cb: (c: Buffer) => void) => { if (ev === 'data') stdoutCb.push(cb) } },
        done: new Promise(res => { rec.resolveDone = () => res({ code: 0 }) }),
      }
      spawns.push(rec)
      return proc
    },
  }

  const domainStub = { table: (name: string) => name === 'tasks' ? tasks : loops }
  const host: any = {
    ctx: {
      sessionController: {
        list: async () => ({ items: created.map(c => ({ sessionId: c.sessionId })) }),
        create: async (spec: any) => { created.push(spec); return { sessionId: spec.sessionId } },
        resolveAgent: async (id: string) => ({
          agent: { followup: (m: any) => injected.push({ id, text: m.content[0].text }) },
        }),
      },
      get: (name: string) => faces[name],
      on: () => () => {},
      logger: { info: () => {}, warn: () => {}, error: () => {} },
    },
    logger: { info: () => {}, warn: () => {}, error: () => {} },
    signal: new AbortController().signal,
    commaDomain: () => domainStub,
    workspaceId: () => 'ws-1',
    workspaceRoot: () => '/tmp/ws',
    worker: () => ({ kind: opts.workerKind ?? 'dsh-session', command: opts.workerCommand ?? '', timeoutMinutes: opts.timeoutMinutes ?? 30 }),
    notify: async (text: string) => { notices.push(text) },
    onChanged: () => {},
  }
  return { host, tasks, loops, created, injected, schedules, spawns, notices }
}

const asst = (text: string) => ({ message: { content: [{ type: 'text', text }] } })

async function main() {
  // 1. status block parsing
  assert.deepEqual(parseStatusBlock('汇报\n[COMMA-STATUS] done: 交付了 X'), { status: 'done', detail: '交付了 X' })
  assert.equal(parseStatusBlock('中间块 [COMMA-STATUS] needs_review: q1\n后文\n[COMMA-STATUS] done: 最终')!.status, 'done')
  assert.equal(parseStatusBlock('没有状态块'), undefined)
  ok('parseStatusBlock')

  // 2. createTask → dsh-session worker launch
  {
    const { host, tasks, created, injected } = makeHost()
    const task = await createTask(host, { title: '整理账单', goal: '把 11 月账单归类' })
    assert.equal(task.status, 'working')
    assert.equal(created.length, 1)
    assert.equal(created[0].agentPreset, WORKER_PRESET)
    assert.ok(created[0].sessionId.startsWith(WORKER_SESSION_PREFIX))
    assert.equal(created[0].workspaceId, 'ws-1')
    assert.equal(injected.length, 1)
    assert.ok(injected[0].text.includes('整理账单') && injected[0].text.includes('[COMMA-STATUS]'))
    assert.equal(tasks._map.get(task.id).workerSessionId, created[0].sessionId)
    ok('createTask→session worker')
  }

  // 3. assistant/message with status block → done + notify
  {
    const { host, tasks, created, notices } = makeHost()
    const task = await createTask(host, { title: '查快递', goal: '查 SF123' })
    const sid = created[0].sessionId
    await onSessionEvent(host, sid, 'assistant/message', asst('已查到\n[COMMA-STATUS] done: 在途武汉'))
    const t = tasks._map.get(task.id)
    assert.equal(t.status, 'done')
    assert.equal(t.result, '在途武汉')
    assert.ok(notices.some(n => n.includes('完成')))
    ok('status block → done')
  }

  // 4. needs_review → answer → resume → done
  {
    const { host, tasks, created, injected } = makeHost()
    const task = await createTask(host, { title: '订票', goal: '订周五高铁' })
    const sid = created[0].sessionId
    await onSessionEvent(host, sid, 'assistant/message', asst('[COMMA-STATUS] needs_review: 二等座还是一等？'))
    assert.equal(tasks._map.get(task.id).status, 'needs_review')
    assert.equal(tasks._map.get(task.id).question, '二等座还是一等？')
    const res = await answerTask(host, task.id, '二等')
    assert.equal(res.ok, true)
    assert.equal(tasks._map.get(task.id).status, 'working')
    assert.equal(tasks._map.get(task.id).rounds, 1)
    assert.ok(injected.at(-1)!.text.includes('二等'))
    await onSessionEvent(host, sid, 'assistant/message', asst('[COMMA-STATUS] done: 已订 G123 二等座'))
    assert.equal(tasks._map.get(task.id).status, 'done')
    ok('needs_review→answer→done')
  }

  // 5. guards: answer wrong state, cancel, foreign session ignored
  {
    const { host, tasks } = makeHost()
    const task = await createTask(host, { title: 't', goal: 'g' })
    await onSessionEvent(host, 'other-session', 'assistant/message', asst('[COMMA-STATUS] done: stray'))
    assert.equal(tasks._map.get(task.id).status, 'working') // 外会话不触任务
    const bad = await answerTask(host, task.id, 'hi')
    assert.equal(bad.ok, false)
    assert.match(bad.error!, /not-awaiting-answer/)
    const c = await cancelTask(host, task.id)
    assert.equal(c.ok, true)
    assert.equal(tasks._map.get(task.id).status, 'cancelled')
    const c2 = await cancelTask(host, 'task:nope')
    assert.equal(c2.ok, false)
    ok('guards')
  }

  // 6. idle fallback: working worker went idle without a block → needs_review
  {
    const persisted = new Map<string, { type: string; data?: unknown }[]>()
    const { host, tasks, created } = makeHost({ persisted })
    const task = await createTask(host, { title: '整理', goal: '整理文件' })
    const sid = created[0].sessionId
    persisted.set(sid, [{ type: 'user/message' }, { type: 'assistant/message', data: asst('我整理了一半') }])
    await onWorkerIdle(host, sid)
    const t = tasks._map.get(task.id)
    assert.equal(t.status, 'needs_review')
    assert.match(t.question, /未按契约输出状态块/)
    // idle 兜底也能读到块——持久层尾部带块则正常 done
    const task2 = await createTask(host, { title: 't2', goal: 'g2' })
    persisted.set(created[1].sessionId, [{ type: 'assistant/message', data: asst('[COMMA-STATUS] done: tail ok') }])
    await onWorkerIdle(host, created[1].sessionId)
    assert.equal(tasks._map.get(task2.id).status, 'done')
    ok('idle fallback')
  }

  // 7. timeout sweep
  {
    const { host, tasks, notices } = makeHost({ timeoutMinutes: 30 })
    const task = await createTask(host, { title: '长跑', goal: 'g' })
    tasks._map.set(task.id, { ...tasks._map.get(task.id), updatedAt: Date.now() - 31 * 60_000 })
    await sweepTaskTimeouts(host)
    assert.equal(tasks._map.get(task.id).status, 'needs_review')
    assert.ok(notices.some(n => n.includes('超时')))
    ok('timeout sweep')
  }

  // 8. cold recovery: open relaunch + working wake via schedule + lost session → needs_review
  {
    const persisted = new Map<string, { type: string; data?: unknown }[]>()
    const statMissing = new Set<string>()
    const { host, tasks, created, schedules } = makeHost({ persisted, statMissing })
    const open = await createTask(host, { title: 'o', goal: 'g' })
    tasks._map.set(open.id, { ...tasks._map.get(open.id), status: 'open', workerSessionId: undefined })
    const working = await createTask(host, { title: 'w', goal: 'g' })
    const lost = await createTask(host, { title: 'l', goal: 'g' })
    statMissing.add(tasks._map.get(lost.id).workerSessionId)
    created.length = 0
    const schedulesBefore = schedules.length
    await recoverTasks(host)
    assert.ok(created.some(c => c.sessionId === tasks._map.get(open.id).workerSessionId)) // open 重派
    assert.ok(schedules.length > schedulesBefore) // working 经 schedule 唤醒
    assert.equal(schedules.at(-1).target.sessionId, tasks._map.get(working.id).workerSessionId)
    // wire 契约回归：上游 ScheduleTiming 的 after 选择器是 snake_case after_seconds（曾误传 afterSeconds 被 ScheduleInputError 拒收）
    assert.deepEqual(schedules.at(-1).timing, { kind: 'after', after_seconds: 3 })
    assert.equal(schedules.at(-1).target.kind, 'session')
    assert.equal(tasks._map.get(lost.id).status, 'needs_review')
    assert.match(tasks._map.get(lost.id).question, /会话已不在持久层/)
    ok('cold recovery')
  }

  // 9. cli worker: real SubprocessSpawnSpec shape, stdin brief, stdout block → done
  {
    const { host, tasks, spawns } = makeHost({ workerKind: 'cli', workerCommand: 'fake-agent --work' })
    const task = await createTask(host, { title: 'cli 活', goal: '跑脚本' })
    assert.equal(spawns.length, 1)
    assert.deepEqual(spawns[0].spec.argv, ['fake-agent', '--work'])
    assert.equal(spawns[0].spec.cwd, '/tmp/ws')
    assert.deepEqual(spawns[0].spec.stdio, { stdin: 'pipe', stdout: 'pipe', stderr: 'pipe' })
    assert.equal(typeof spawns[0].spec.graceMs, 'number')
    assert.ok(spawns[0].stdin[0]!.includes('cli 活'))
    for (const cb of spawns[0].stdoutCb) cb(Buffer.from('[COMMA-STATUS] done: cli 交付'))
    spawns[0].resolveDone()
    await new Promise(r => setTimeout(r, 10))
    assert.equal(tasks._map.get(task.id).status, 'done')
    assert.equal(tasks._map.get(task.id).result, 'cli 交付')
    ok('cli worker')
  }

  // 9b. race regression: done/needs_review 不被 idle 无块兜底回退（实机复现）
  {
    const { host, tasks, created } = makeHost()
    const task = await createTask(host, { title: '竞态', goal: 'g' })
    const sid = created[0].sessionId
    await onSessionEvent(host, sid, 'assistant/message', asst('[COMMA-STATUS] done: 先交付'))
    // idle 兜底迟到且无块——不得把 done 回退成 needs_review
    await handleWorkerOutput(host, tasks._map.get(task.id), '')
    const t = tasks._map.get(task.id)
    assert.equal(t.status, 'done')
    assert.equal(t.result, '先交付')
    // needs_review 同样不被无块覆盖（真实问题不丢）
    const t2 = await createTask(host, { title: '竞态2', goal: 'g2' })
    await onSessionEvent(host, created[1].sessionId, 'assistant/message', asst('[COMMA-STATUS] needs_review: 选A还是B？'))
    await handleWorkerOutput(host, tasks._map.get(t2.id), '')
    assert.equal(tasks._map.get(t2.id).status, 'needs_review')
    assert.equal(tasks._map.get(t2.id).question, '选A还是B？')
    ok('race regression')
  }

  // 10. router tools surface: task ops + loop ops
  {
    const { host, tasks, loops } = makeHost()
    const defs = routerToolDefs({
      ctx: host.ctx,
      domain: () => host.commaDomain(),
      ready: () => Promise.resolve(),
      onChanged: () => {},
      tasks: { add: i => createTask(host, i), list: () => [...tasks._map.values()], answer: (id, a) => answerTask(host, id, a), cancel: id => cancelTask(host, id), find: ref => tasks._map.has(ref) ? { key: ref } : { error: 'not-found', candidates: [] } },
      loops: { add: async i => { const id = `loop:${i.name}`; await loops.put(id, { id, ...i, enabled: true }); return { ok: true, id } }, list: () => [...loops._map.values()], remove: async n => { await loops.delete(`loop:${n}`); return { ok: true } } },
    })
    const names = defs.map(d => d.name)
    for (const n of ['comma_task_add', 'comma_tasks', 'comma_task_answer', 'comma_task_cancel', 'comma_loop_add', 'comma_loops', 'comma_loop_remove']) assert.ok(names.includes(n), n)
    const add = defs.find(d => d.name === 'comma_task_add')!
    const out: any = await add.execute(add.schema.parse({ title: '委派', goal: '干活' }))
    assert.equal(out.ok, true)
    assert.ok(tasks._map.has(out.taskId))
    const loopAdd = defs.find(d => d.name === 'comma_loop_add')!
    const lo: any = await loopAdd.execute(loopAdd.schema.parse({ name: 'watch-mail', everyMinutes: 15, prompt: '盯新邮件', checkTool: 'mail_recent', checkArgs: '{"limit":5}' }))
    assert.equal(lo.ok, true)
    assert.ok(loops._map.has('loop:watch-mail'))
    const rm = defs.find(d => d.name === 'comma_loop_remove')!
    assert.equal((await rm.execute(rm.schema.parse({ name: 'watch-mail' })) as any).ok, true)
    assert.equal(loops._map.has('loop:watch-mail'), false)
    ok('router tools surface')
  }

  // 11. notebook board section
  {
    const md = renderNotebook([], new Map(), Date.now(), [{
      id: 'task:1', title: '订票', goal: 'g', status: 'needs_review', workerKind: 'dsh-session',
      question: '二等座？', rounds: 0, createdAt: 1, updatedAt: 1,
    } as any])
    assert.ok(md.includes('任务板') && md.includes('[needs_review]') && md.includes('订票'))
    ok('notebook board')
  }

  console.log(results.join('\n'))
  console.log(`\n${results.length} fixture groups passed`)
}

main().catch(e => { console.error('FAILED:', e); process.exit(1) })
