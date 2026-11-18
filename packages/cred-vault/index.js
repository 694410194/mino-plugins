/**
 * mino-cred-vault —— 凭据引导薄层（会话内凭据入库）。
 * 只做一件事：把官方 `ctx.get('credentials')` 服务缝露成三个模型工具——
 * 用户在会话里贴一把 API key，模型调 cred_set 落进官方凭据库
 *（dsh-credentials-local 的 $DSH_HOME/.credentials.yaml + 环境回退层），
 * 连接器下次 resolve 自然生效，无需重启。
 *
 * 安全边界（刻意收窄）：
 * - 不提供取值工具——密钥永不被念回会话；状态查询只回 describe 的
 *   configured/source/writable/masked（官方遮蔽预览），records 只列 key+kind。
 * - cred_set/cred_unset 挂官方审批缝（tools/pre-execute 瀑布 → ask），
 *   无审批答者时失败闭合，与 connector-mail/calendar 写链同一门闸形态。
 * - record 半（scope/id 插件自有记录）只读枚举——写 record 是属主插件的事。
 */
export const name = 'mino-cred-vault'
/** tools 服务依赖——ctx.get('tools') 只认 inject 声明过的服务，不声明则拿到 undefined。 */
export const inject = ['tools']

const REF_RE = /^[A-Za-z_][A-Za-z0-9_]*$/
const SENSITIVE = new Set(['cred_set', 'cred_unset'])
const NO_SEAM = 'credentials 服务未挂载（dsh-credentials-local 不在 bundle 栈里）。'

function credentials(ctx) {
  const svc = ctx.get('credentials')
  return svc && typeof svc.describe === 'function' ? svc : undefined
}

function refOf(args) {
  const ref = String(args?.ref ?? '').trim()
  if (!REF_RE.test(ref)) {
    throw new Error(`ref 必须是 POSIX 环境变量名（如 DEEPSEEK_API_KEY），收到 "${ref}"`)
  }
  return ref
}

export function apply(ctx) {
  const tools = ctx.get('tools')
  if (!tools?.register) {
    ctx.logger.warn('mino-cred-vault: tools service absent, idling')
    return
  }

  const defs = [
    {
      name: 'cred_status',
      description:
        '查凭据配置状态。给 ref（环境变量名，如 DEEPSEEK_API_KEY）回该引用的 configured/source/writable/masked；' +
        '不给则列出凭据库里全部插件记录（key+kind，永远不含值）。',
      parameters: {
        type: 'object', additionalProperties: false,
        properties: { ref: { type: 'string', description: '可选。POSIX 环境变量名。' } },
      },
      output: {
        schema: { type: 'object', additionalProperties: true },
        render: (_a, v) => [{
          type: 'text',
          text: v?.seam === 'absent' ? NO_SEAM
            : v?.ref ? `${v.ref.name}: ${v.ref.configured ? '已配置' : '未配置'}`
              : `凭据记录 ${v?.records?.length ?? 0} 条`,
        }],
      },
      isConcurrencySafe: () => true,
      async execute(args) {
        const svc = credentials(ctx)
        if (!svc) return { seam: 'absent', guidance: NO_SEAM }
        const out = { seam: 'mounted' }
        const ref = String(args?.ref ?? '').trim()
        if (ref) out.ref = { name: refOf({ ref }), ...(await svc.describe(ref)) }
        try {
          out.records = (await svc.listRecords()).map(r => ({ key: r.key, kind: r.kind }))
        } catch { out.records = [] }
        return out
      },
      presentCall: () => ({ card: 'generic', title: '查凭据状态', kind: 'other' }),
    },
    {
      name: 'cred_set',
      description:
        '把一把密钥按环境变量名存进官方凭据库（如用户贴了 DEEPSEEK_API_KEY=xxx）。' +
        '存完连接器下次调用即生效；空值拒绝（要删用 cred_unset）。',
      parameters: {
        type: 'object', additionalProperties: false, required: ['ref', 'value'],
        properties: {
          ref: { type: 'string', description: 'POSIX 环境变量名。' },
          value: { type: 'string', description: '密钥值（非空；不落日志、不回显）。' },
        },
      },
      output: {
        schema: { type: 'object', additionalProperties: true },
        render: (_a, v) => [{ type: 'text', text: v?.stored ? `${v.ref} 已存入凭据库` : '未写入' }],
      },
      isConcurrencySafe: () => false,
      async execute(args) {
        const svc = credentials(ctx)
        if (!svc) throw new Error(NO_SEAM)
        const ref = refOf(args)
        const value = String(args?.value ?? '')
        if (!value.length) throw new Error('value 不能为空——要删除用 cred_unset')
        await svc.set(ref, value)
        return { stored: true, ref }
      },
      presentCall: () => ({ card: 'generic', title: '存入凭据', kind: 'other' }),
    },
    {
      name: 'cred_unset',
      description: '从凭据库删掉一个引用（环境变量名）。删不存在的是空操作；环境回退层可能恢复生效。',
      parameters: {
        type: 'object', additionalProperties: false, required: ['ref'],
        properties: { ref: { type: 'string', description: 'POSIX 环境变量名。' } },
      },
      output: {
        schema: { type: 'object', additionalProperties: true },
        render: (_a, v) => [{ type: 'text', text: v?.removed ? `${v.ref} 已删除` : '未删除' }],
      },
      isConcurrencySafe: () => false,
      async execute(args) {
        const svc = credentials(ctx)
        if (!svc) throw new Error(NO_SEAM)
        const ref = refOf(args)
        await svc.unset(ref)
        return { removed: true, ref }
      },
      presentCall: () => ({ card: 'generic', title: '删除凭据', kind: 'other' }),
    },
  ]

  for (const tool of defs) ctx.effect(() => tools.register(tool))

  // 写/删挂官方审批缝：pre-execute 瀑布返回 ask；无审批答者按 fail-closed 拒绝。
  ctx.on('tools/pre-execute', async (exec, next) => {
    if (!SENSITIVE.has(exec.name)) return next()
    return {
      kind: 'ask',
      reason: `cred-vault sensitive action "${exec.name}"`,
      displayReason: {
        en: `Allow ${exec.name === 'cred_set' ? 'storing' : 'removing'} a credential (${exec.name})?`,
        zh: `允许${exec.name === 'cred_set' ? '写入' : '删除'}凭据（${exec.name}）？`,
      },
    }
  })
}
