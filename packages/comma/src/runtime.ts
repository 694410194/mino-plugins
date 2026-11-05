/** The mino-comma runtime: owns the storage domain, the router Session, source fibers, and the attention loop. */
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-api-session-controller'
import type { WorkspaceRegistry } from '@deepseek-ai/dsh-workspace'
import type { SessionId } from '@deepseek-ai/dsh-session'
import type { Domain } from '@deepseek-ai/dsh-storage-domain'
import { freezeMessage, MessageId, type UserMessage } from '@deepseek-ai/dsh-llm'
import { commaDomain, type Matter, type SourceItem } from './domain.ts'
import type { NewItem, Source, SourceHost } from './source.ts'
import {
  budgetAllows, budgetSpend, emptyBudget, heuristicUrgency, judgeMatters,
  NOTIFY_URGENCIES, type DecideModel, type NotifyBudget,
} from './decide.ts'
import { renderNotebook } from './notebook.ts'
import { resolveBot, resolveNotifyTarget, type BotResolution } from './resolve.ts'
import { PAIRING_NAG_KEY, registerRouterTools } from './tools.ts'

export const ROUTER_SESSION_ID = 'comma-router' as SessionId
export const ROUTER_PRESET = 'mino-comma-router'
export const ROUTER_TITLE = 'Mino 陪伴'
const ROUTER_STATE_KEY = 'router_session'
const ROUTER_TITLE_KEY = 'router_title'
const BUDGET_KEY = 'notify_budget'
const BRIEFING_KEY = 'briefing_last'
const MATTER_TITLE_MAX = 60
const LOOP_TICK_MS = 60_000
const RENDER_DEBOUNCE_MS = 2_000

type CommaDomain = Domain<typeof commaDomain>

/** The `dshIm` proactive-delivery surface (mino-im contractVersion 1). */
interface DshImSend {
  send(botId: string, targetId: string, text: string, options?: Record<string, unknown>): Promise<unknown>
}

export interface RuntimeOptions {
  workspaceRoot?: string
  /** Configured sources.im.botId; empty opts into pairing auto-resolution. */
  sourceBotId: string
  decideModel?: DecideModel
  decideIntervalMinutes: number
  notify: { botId: string; targetId: string }
  notifyBudgetPerDay: number
  notifyMinIntervalMinutes: number
  notebookPath?: string
  briefing: { enabled: boolean; hour: number }
  seedLoops: { name: string; everyMinutes: number; prompt: string; enabled: boolean }[]
}

export class Runtime implements SourceHost {
  readonly ready: Promise<void>
  readonly logger: Context['logger']
  private readonly controller = new AbortController()
  private domain!: CommaDomain
  private fibers: Promise<void>[] = []
  private notebookDirty = true
  private renderTimer?: ReturnType<typeof setTimeout>
  /** The bot the IM source is bound to once pairing resolves; the notify default falls back to it. */
  private sourceBotId?: string
  /** Tool registration disposers keyed by agent id; agent disposal already rolls the scope back. */
  private readonly mountedTools = new Map<string, () => void>()

  constructor(
    private readonly ctx: Context,
    sources: Source[],
    private readonly options: RuntimeOptions,
  ) {
    this.logger = ctx.logger
    this.ready = this.start(sources)
  }

  private async start(sources: Source[]): Promise<void> {
    this.domain = await this.ctx.storageDomain.open(commaDomain)
    const workspace = await this.ctx.workspaceRegistry.create(this.options.workspaceRoot ?? process.cwd())
    const existing = await this.ctx.sessionController.resolveAgent(ROUTER_SESSION_ID)
    if ('error' in existing) {
      await this.ctx.sessionController.create({
        sessionId: ROUTER_SESSION_ID,
        workspaceId: workspace.id,
        agentPreset: ROUTER_PRESET,
      })
      this.ctx.logger.info('mino-comma router session created: %s', ROUTER_SESSION_ID)
    }
    await this.domain.table('state').put(ROUTER_STATE_KEY, { key: ROUTER_STATE_KEY, value: ROUTER_SESSION_ID })
    const router = await this.ctx.sessionController.resolveAgent(ROUTER_SESSION_ID)
    if (!('error' in router)) {
      this.decorateRouter(router.agent)
      if (this.domain.table('state').get(ROUTER_TITLE_KEY) === undefined) {
        router.agent.session.append('session/title', { title: ROUTER_TITLE, messageSeqs: [], source: { kind: 'user' } })
        await this.domain.table('state').put(ROUTER_TITLE_KEY, { key: ROUTER_TITLE_KEY, value: ROUTER_TITLE })
      }
    }
    await this.seedLoops(this.options.seedLoops)

    const signal = this.controller.signal
    this.fibers = [
      ...sources.map(source =>
        source.run(this, signal).catch((error: unknown) => {
          if (!signal.aborted) this.ctx.logger.error('mino-comma source %s exited: %s', source.kind, String(error))
        })),
      this.tickEvery(this.options.decideIntervalMinutes * 60_000, () => this.decideSweep()),
      this.tickEvery(LOOP_TICK_MS, () => this.loopTick()),
    ]
  }

  private async tickEvery(ms: number, tick: () => Promise<void>): Promise<void> {
    const signal = this.controller.signal
    while (!signal.aborted) {
      try {
        await tick()
      } catch (error) {
        if (!signal.aborted) this.logger.warn('mino-comma tick failed: %s', String(error))
      }
      await new Promise<void>(resolve => {
        if (signal.aborted) return resolve()
        const timer = setTimeout(resolve, ms)
        signal.addEventListener('abort', () => { clearTimeout(timer); resolve() }, { once: true })
      })
    }
  }

  /** Persist the item and group it onto the open matter sharing its groupKey. Idempotent on the item id. */
  async emit(item: NewItem): Promise<void> {
    const items = this.domain.table('source_items')
    const matters = this.domain.table('matters')
    const id: SourceItem['id'] = `${item.sourceKind}:${item.externalId}`
    if (items.get(id) !== undefined) return
    const now = Date.now()
    let matterId: string | undefined
    for (const [key, matter] of matters.entries()) {
      if (matter.groupKey === item.groupKey && matter.status === 'open') { matterId = key; break }
    }
    if (matterId === undefined) {
      matterId = `matter:${crypto.randomUUID()}`
      const matter: Matter = {
        id: matterId, groupKey: item.groupKey, title: item.summary.slice(0, MATTER_TITLE_MAX),
        urgency: 'normal', status: 'open', sourceItemIds: [id], createdAt: now, updatedAt: now,
      }
      await matters.put(matterId, matter)
    } else {
      await matters.update(matterId, matter => ({ ...matter, sourceItemIds: [...matter.sourceItemIds, id], updatedAt: now }))
    }
    await items.put(id, { id, ...item, receivedAt: now, matterId })
    this.scheduleRender()
  }

  private itemsOf(matter: Matter): SourceItem[] {
    const items = this.domain.table('source_items')
    return matter.sourceItemIds.map(id => items.get(id)).filter((i): i is SourceItem => i !== undefined)
  }

  private async routerMessage(text: string): Promise<void> {
    const resolved = await this.ctx.sessionController.resolveAgent(ROUTER_SESSION_ID)
    if ('error' in resolved) {
      this.logger.warn('mino-comma: router session unavailable, message dropped')
      return
    }
    const message: UserMessage = freezeMessage({
      id: MessageId(`mino-comma:${crypto.randomUUID()}`),
      role: 'user',
      content: [{ type: 'text', text }],
      source: { kind: 'mino-comma' },
    })
    resolved.agent.followup(message)
  }

  /** Explicit pairing step for the IM source; also records the bot the notify default falls back to. */
  async resolveBot(): Promise<BotResolution> {
    const resolution = await resolveBot(this.ctx, this.domain, this.options.sourceBotId)
    if (resolution.kind === 'resolved') {
      this.sourceBotId = resolution.botId
      const state = this.domain.table('state')
      if (state.get(PAIRING_NAG_KEY)?.value !== 'resolved') {
        await state.put(PAIRING_NAG_KEY, { key: PAIRING_NAG_KEY, value: 'resolved' })
      }
    }
    return resolution
  }

  /** Surface a pairing blockage on the router session once per state fingerprint. */
  async pairingStatus(status: 'unavailable' | 'none' | 'ambiguous', candidates: string[] = []): Promise<void> {
    const fingerprint = candidates.length ? `${status}:${[...candidates].sort().join(',')}` : status
    const state = this.domain.table('state')
    if (state.get(PAIRING_NAG_KEY)?.value === fingerprint) return
    await state.put(PAIRING_NAG_KEY, { key: PAIRING_NAG_KEY, value: fingerprint })
    const text = status === 'unavailable'
      ? '[comma pairing] 还没有接入消息渠道（mino-im 未安装或没有可用 bot）。如果你想让我帮你盯消息，请提醒用户先装好并配好 IM 渠道，然后用 comma_im_pair 工具完成接管。'
      : status === 'none'
        ? '[comma pairing] IM 渠道已就绪但还没有可接管的 bot。请在 mino-im 里配好一个 bot（external-consumer 模式），然后用 comma_im_pair 完成接管。'
        : `[comma pairing] 检测到多个可接管的 IM 账号：${candidates.join('、')}。请询问用户想让你盯哪一个，然后用 comma_im_pair 工具完成配对。`
    await this.routerMessage(text)
  }

  /** Attach the router tool surface to the materialized router agent; idempotent per agent id. */
  decorateRouter(agent: { id: SessionId; ctx: Context }): void {
    if (agent.id !== ROUTER_SESSION_ID || this.mountedTools.has(agent.id)) return
    this.mountedTools.set(agent.id, registerRouterTools(agent.ctx, {
      ctx: this.ctx,
      domain: () => this.domain,
      ready: () => this.ready,
      onChanged: () => this.scheduleRender(),
    }))
  }

  /** Forget a disposed router agent; its scoped registrations rolled back with the agent ctx. */
  dropRouter(agent: { id: SessionId }): void {
    this.mountedTools.delete(agent.id)
  }

  private async notifyIm(text: string): Promise<void> {
    const resolution = await resolveNotifyTarget(this.ctx, this.domain, this.options.notify, this.sourceBotId)
    if (resolution.kind !== 'resolved') return
    const dshim = this.ctx.get('dshIm') as DshImSend | undefined
    if (!dshim?.send) return
    try {
      await dshim.send(resolution.botId, resolution.targetId, text)
    } catch (error) {
      this.logger.warn('mino-comma: im notify failed: %s', String(error))
    }
  }

  /** One attention sweep: judge pending matters, deliver owed notifications under budget, render the notebook. */
  private async decideSweep(): Promise<void> {
    const matters = this.domain.table('matters')
    const state = this.domain.table('state')
    const now = Date.now()

    for (const [key, matter] of matters.entries()) {
      if (matter.status === 'snoozed' && (matter.snoozedUntil ?? Number.POSITIVE_INFINITY) <= now) {
        await matters.update(key, m => {
          const next = { ...m, status: 'open' as const, updatedAt: now }
          delete next.snoozedUntil
          delete next.decision
          delete next.decidedAt
          return next
        })
      }
    }

    const pending: { key: string; matter: Matter; items: SourceItem[] }[] = []
    const undelivered: { key: string; matter: Matter }[] = []
    for (const [key, matter] of matters.entries()) {
      if (matter.status !== 'open') continue
      if (matter.decision === 'notify' && matter.notifiedAt === undefined) undelivered.push({ key, matter })
      else if (matter.decidedAt === undefined || matter.updatedAt > matter.decidedAt) {
        pending.push({ key, matter, items: this.itemsOf(matter) })
      }
    }

    const judged = this.options.decideModel
      ? await judgeMatters(this.ctx, this.options.decideModel, pending, this.controller.signal)
      : undefined

    const budgetRow = state.get(BUDGET_KEY)
    let budget: NotifyBudget = budgetRow ? { ...emptyBudget(), ...JSON.parse(budgetRow.value) } : emptyBudget()
    let budgetChanged = false

    const deliver = async (matter: Matter, items: SourceItem[]): Promise<number | undefined> => {
      if (!budgetAllows(budget, now, this.options.notifyBudgetPerDay, this.options.notifyMinIntervalMinutes)) return undefined
      const latest = items.slice(-3).map(i => `- ${i.summary}`).join('\n')
      const text = `[comma ${matter.urgency}] ${matter.title}${latest ? `\n${latest}` : ''}`
      await this.routerMessage(text)
      await this.notifyIm(text)
      budget = budgetSpend(budget, now)
      budgetChanged = true
      return now
    }

    for (const { key, matter } of undelivered) {
      const notifiedAt = await deliver(matter, this.itemsOf(matter))
      if (notifiedAt !== undefined) await matters.update(key, m => ({ ...m, notifiedAt }))
    }
    for (const { key, matter, items } of pending) {
      const j = judged?.get(matter.id)
      const urgency = j?.urgency ?? heuristicUrgency(matter, items)
      const wantsNotify = NOTIFY_URGENCIES.includes(urgency)
      const notifiedAt = wantsNotify ? await deliver({ ...matter, urgency }, items) : undefined
      await matters.update(key, m => ({
        ...m, urgency, title: j?.title ?? m.title,
        decision: wantsNotify ? 'notify' : 'quiet', decidedAt: now,
        ...(notifiedAt !== undefined ? { notifiedAt } : {}),
      }))
    }
    if (budgetChanged) await state.put(BUDGET_KEY, { key: BUDGET_KEY, value: JSON.stringify(budget) })
    this.scheduleRender()
  }

  private async seedLoops(loops: RuntimeOptions['seedLoops']): Promise<void> {
    const table = this.domain.table('loops')
    for (const seed of loops) {
      const id = `loop:${seed.name}`
      const existing = table.get(id)
      await table.put(id, {
        id, name: seed.name, everyMinutes: seed.everyMinutes, prompt: seed.prompt,
        enabled: seed.enabled, ...(existing?.lastRunAt !== undefined ? { lastRunAt: existing.lastRunAt } : {}),
        ...(existing?.checkpoint !== undefined ? { checkpoint: existing.checkpoint } : {}),
      })
    }
  }

  /** Fire due loops into the router session and run the daily briefing check. */
  private async loopTick(): Promise<void> {
    const loops = this.domain.table('loops')
    const now = Date.now()
    for (const [key, loop] of loops.entries()) {
      if (!loop.enabled || now - (loop.lastRunAt ?? 0) < Math.max(loop.everyMinutes, 5) * 60_000) continue
      await this.routerMessage(`[comma loop:${loop.name}] ${loop.prompt}`)
      await loops.update(key, l => ({ ...l, lastRunAt: now }))
    }
    if (this.options.briefing.enabled) await this.briefingTick(now)
    if (this.notebookDirty) await this.renderNotebook()
  }

  private async briefingTick(now: number): Promise<void> {
    const state = this.domain.table('state')
    const last = state.get(BRIEFING_KEY)
    const today = new Date(now).toISOString().slice(0, 10)
    if (new Date(now).getHours() < this.options.briefing.hour || last?.value === today) return
    const matters = [...this.domain.table('matters').entries()].map(([, m]) => m)
    const open = matters.filter(m => m.status === 'open')
    const needs = open.filter(m => NOTIFY_URGENCIES.includes(m.urgency)).length
    await state.put(BRIEFING_KEY, { key: BRIEFING_KEY, value: today })
    await this.notifyIm(`Comma 简报: ${open.length} 项待处理，其中 ${needs} 项需要你。`)
    await this.routerMessage(`[comma briefing] 今日待处理 ${open.length} 项（需要你 ${needs} 项）。Notebook 已刷新。`)
  }

  private scheduleRender(): void {
    this.notebookDirty = true
    if (this.renderTimer !== undefined) return
    this.renderTimer = setTimeout(() => {
      this.renderTimer = undefined
      this.renderNotebook().catch((error: unknown) => this.logger.warn('mino-comma notebook render failed: %s', String(error)))
    }, RENDER_DEBOUNCE_MS)
  }

  private async renderNotebook(): Promise<void> {
    const matters = [...this.domain.table('matters').entries()].map(([, m]) => m)
    const items = new Map([...this.domain.table('source_items').entries()].map(([k, i]) => [i.id, i]))
    const path = this.options.notebookPath ?? join(this.options.workspaceRoot ?? process.cwd(), 'Comma', 'Notebook.md')
    await mkdir(dirname(path), { recursive: true })
    await writeFile(path, renderNotebook(matters, items))
    this.notebookDirty = false
  }

  async stop(): Promise<void> {
    this.controller.abort()
    for (const dispose of this.mountedTools.values()) dispose()
    this.mountedTools.clear()
    if (this.renderTimer !== undefined) clearTimeout(this.renderTimer)
    await Promise.allSettled(this.fibers)
    if (this.notebookDirty) await this.renderNotebook().catch(() => {})
    await this.domain?.close()
  }
}
