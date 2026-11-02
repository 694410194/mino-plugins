/**
 * 会话绑定与每会话状态。
 *
 * 一个 DSH 会话可以绑定一张角色卡、一套世界书、一个跑团存档。
 * 绑定关系落 state.data.sessions[<sessionId>]，进程内也做一层缓存。
 *
 * 没有 sessionId 时（例如工具被非会话调用）回退到 state.data.lastCharacter，
 * 这样模型单次调用也能拿到合理上下文。
 */

const EMPTY = Object.freeze({ characterId: null, worldbooks: [], persona: null, scene: null, trpg: null })

/** 取会话绑定；不存在时返回空绑定（不写入）。 */
export function getBinding(state, sessionId) {
  if (!sessionId) return { ...EMPTY, characterId: state.data.lastCharacter || null }
  const existing = state.data.sessions[sessionId]
  if (!existing) return { ...EMPTY, characterId: state.data.lastCharacter || null }
  return {
    ...EMPTY,
    ...existing,
    worldbooks: Array.isArray(existing.worldbooks) ? existing.worldbooks : [],
  }
}

/** 写会话绑定；返回写入后的完整绑定。 */
export function setBinding(state, sessionId, patch) {
  if (!sessionId) {
    if (patch.characterId !== undefined) state.data.lastCharacter = patch.characterId
    state.save()
    return getBinding(state, sessionId)
  }
  const next = { ...getBinding(state, sessionId), ...patch }
  state.data.sessions[sessionId] = next
  if (patch.characterId !== undefined) state.data.lastCharacter = patch.characterId
  state.save()
  return next
}

/**
 * 装配期门控（tools.register 的 when）：只有「已进入酒馆模式」的会话放行
 * st_/trpg_/stage_ 工具。判定只看 binding.entered——不看 characterId：
 * getBinding 对新会话会回退继承 lastCharacter，玩过一次酒馆后
 * characterId 非空会让门对所有会话敞开，必须用 entered 这个显式标记。
 */
export function tavernWhen(state) {
  return ({ agent }) => {
    const session = agent && agent.session
    const sid = session && session.id
    const binding = getBinding(state, sid === undefined || sid === null ? undefined : String(sid))
    return binding.entered === true
  }
}

/** 从工具执行上下文里取会话 id；取不到返回 undefined。 */
export function sessionIdOf(exec) {
  if (!exec) return undefined
  const agent = exec.agent
  if (!agent) return undefined
  const session = agent.session
  if (!session) return undefined
  if (typeof session.id === 'string') return session.id
  if (session.id && typeof session.id === 'object' && typeof session.id.toString === 'function') return String(session.id)
  return undefined
}

/** 取用户角色名（persona）。 */
export function personaOf(state, sessionId, fallback = 'User') {
  const binding = getBinding(state, sessionId)
  if (binding.persona) return binding.persona
  return state.data.personas && state.data.personas.default ? state.data.personas.default : fallback
}
