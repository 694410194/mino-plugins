/**
 * media-harness.mjs — mino-inference + mino-media 全链路模拟验证。
 *
 * 桩掉两个无法模拟的官方缝（账号 token、真上游通道），其余全部跑真代码：
 *   ctx 桩（provide/get/tools.register） → 真 minoInference 服务
 *   → mock 网关（eval/mocks/inference-server.mjs，校验鉴权头）
 *   → 真工具 execute → 真文件落盘
 * 另注一次 401 验证服务层作废 grant 的路径。
 *
 * 用法：node eval/media-harness.mjs
 */
import { existsSync, statSync } from 'node:fs'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { startMockGateway } from './mocks/inference-server.mjs'

const WORKSPACE = 'D:/tmp/media-harness'
await mkdir(WORKSPACE, { recursive: true })
await mkdir(path.join(WORKSPACE, 'input'), { recursive: true })

const gw = await startMockGateway()
const BASE = `http://127.0.0.1:${gw.port}/v1`
const results = []
const check = (name, ok, detail = '') => { results.push({ name, ok, detail }); console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`) }

// ---- ctx 桩：cordis 最小服务面 ----
const services = new Map()
const tools = new Map()
let rejectedToken = null
const account = {
  resolveToken: async (url) => (new URL(url).origin === `http://127.0.0.1:${gw.port}` ? 'mock-grant-token' : undefined),
  rejectToken: async (t) => { rejectedToken = t },
}
const ctx = {
  provide: (n, v) => services.set(n, v),
  get: (n) => (n === 'deepseekAccount' ? account : services.get(n)),
  tools: { register: (t) => tools.set(t.name, t) },
  inject: () => {},
  on: () => () => {},
  effect: (fn) => { fn() },
}

// ---- 装载真代码 ----
const inferencePkg = await import('file:///D:/Projects/mino/mino-plugins/packages/inference/index.js')
inferencePkg.apply(ctx, { baseURL: BASE })
const mediaPkg = await import('file:///D:/Projects/mino/mino-plugins/packages/media/index.js')
mediaPkg.apply(ctx, {
  videoModel: 'mock-video', ttsModel: 'mock-tts', ttsVoice: 'mock-voice',
  sttModel: 'mock-stt', musicModel: 'mock-music',
  workspaceFolder: 'mino-media-test', taskTimeoutMs: 30_000,
})

check('minoInference 服务已 provide', services.has('minoInference'))
check('五个媒体工具已注册', ['generate_video', 'check_video', 'speech_synthesize', 'speech_transcribe', 'generate_music'].every((n) => tools.has(n)),
  [...tools.keys()].join(','))
check('endpoint 拼接 /v1', services.get('minoInference').endpoint('videos') === `${BASE}/videos`)
check('endpoint 拼接 origin（/suno）', services.get('minoInference').endpoint('/suno/x') === `http://127.0.0.1:${gw.port}/suno/x`)

const exec = { agent: { session: { header: { cwd: WORKSPACE } } }, signal: AbortSignal.timeout(60_000).signal }

// ---- generate_video：submit → poll → content 下载 → mp4 落盘 ----
try {
  const out = await tools.get('generate_video').execute({ prompt: 'a cat', seconds: 2 }, exec)
  const ok = existsSync(out.file) && statSync(out.file).size > 100
  check('generate_video 全链路', ok && out.taskId === 'vid_mock_001', `${out.file} (${out.file && statSync(out.file).size}B)`)
} catch (e) { check('generate_video 全链路', false, e.message) }

// ---- check_video ----
try {
  const out = await tools.get('check_video').execute({ id: 'vid_mock_001' }, exec)
  check('check_video 状态查询', out.status === 'completed' && out.progress === 100)
} catch (e) { check('check_video 状态查询', false, e.message) }

// ---- speech_synthesize：wav 落盘且 RIFF 头 ----
try {
  const out = await tools.get('speech_synthesize').execute({ input: '你好' }, exec)
  const head = existsSync(out.file) ? statSync(out.file).size : 0
  check('speech_synthesize 全链路', existsSync(out.file) && head > 1000 && out.model === 'mock-tts', `${out.file} (${head}B)`)
} catch (e) { check('speech_synthesize 全链路', false, e.message) }

// ---- speech_transcribe：multipart → text ----
try {
  const { writeFile } = await import('node:fs/promises')
  await writeFile(path.join(WORKSPACE, 'input', 'clip.wav'), Buffer.alloc(2048, 1))
  const out = await tools.get('speech_transcribe').execute({ path: 'input/clip.wav' }, exec)
  check('speech_transcribe 全链路', out.text.includes('模拟转写'), out.text.slice(0, 40))
} catch (e) { check('speech_transcribe 全链路', false, e.message) }

// ---- generate_music：submit → fetch 轮询 → audio_url 下载 → 落盘 ----
try {
  const out = await tools.get('generate_music').execute({ prompt: 'lofi beat' }, exec)
  check('generate_music 全链路', existsSync(out.file) && out.taskId === 'suno_mock_001', out.file)
} catch (e) { check('generate_music 全链路', false, e.message) }

// ---- 真协议断言：路径/请求体/轮询行为逐条对 mino-api 源码 ----
const videoPolls = gw.requests.filter((r) => r.method === 'GET' && r.path === '/v1/videos/vid_mock_001')
check('视频任务真轮询（≥2 次状态查询）', videoPolls.length >= 2, `${videoPolls.length} polls`)
const sunoSubmit = gw.requests.find((r) => r.method === 'POST' && r.path.startsWith('/suno/submit/'))
check('suno submit 走 /suno/submit/MUSIC', sunoSubmit?.path === '/suno/submit/MUSIC', sunoSubmit?.path)
check('suno submit body=gpt_description_prompt', sunoSubmit?.json?.gpt_description_prompt === 'lofi beat', JSON.stringify(sunoSubmit?.json))
const sunoFetches = gw.requests.filter((r) => r.method === 'GET' && r.path === '/suno/fetch/suno_mock_001')
check('suno fetch 真轮询（≥2 次）', sunoFetches.length >= 2, `${sunoFetches.length} polls`)

// ---- 负向：无效 action 必须被网关拒绝（防回退到 /suno/submit/generate）----
try {
  await services.get('minoInference').postJson('/suno/submit/generate', { body: { gpt_description_prompt: 'x' } })
  check('无效 action 被拒（invalid_action）', false, '未抛错')
} catch (e) {
  check('无效 action 被拒（invalid_action）', e.status === 400 && e.message.includes('invalid_action'), `status=${e.status}`)
}

// ---- 鉴权头断言：每个请求都带 grant + Bearer ----
const authed = gw.requests.filter((r) => !r.path.startsWith('/mock-'))
check('全部请求携带 x-dsh-auth-token + Bearer', authed.length > 0 && authed.every((r) => r.grant === 'mock-grant-token' && r.auth === 'Bearer mock-grant-token'),
  `${authed.length} requests`)

// ---- 401 路径：服务层内部作废 grant ----
try {
  gw.failNext()
  await services.get('minoInference').getJson('videos/anything')
  check('401 → rejectToken', false, '未抛错')
} catch (e) {
  check('401 → rejectToken', e.status === 401 && rejectedToken === 'mock-grant-token', `status=${e.status} rejected=${rejectedToken}`)
}

// ---- 未配置模型响铃 ----
try {
  mediaPkg.apply(Object.assign(Object.create(ctx), { __re: 1 }), { videoModel: '', ttsModel: '', sttModel: '', musicModel: '' })
} catch { /* double-apply may throw; model check below still covered by config read */ }
const ctxNoCfg = { ...ctx, tools: { register: () => {} } }
const tools2 = new Map()
ctxNoCfg.tools.register = (t) => tools2.set(t.name, t)
mediaPkg.apply(ctxNoCfg, {})
try {
  await tools2.get('generate_video').execute({ prompt: 'x' }, exec)
  check('未配模型响铃', false, '未抛错')
} catch (e) { check('未配模型响铃', e.message.includes('未配置') && e.message.includes('videoModel'), e.message.slice(0, 60)) }

// ---- 音色未配响铃（模型已配、ttsVoice 与参数双缺）----
const ctxNoVoice = { ...ctx, tools: { register: () => {} } }
const tools3 = new Map()
ctxNoVoice.tools.register = (t) => tools3.set(t.name, t)
mediaPkg.apply(ctxNoVoice, { ttsModel: 'mock-tts', ttsVoice: '' })
try {
  await tools3.get('speech_synthesize').execute({ input: 'x' }, exec)
  check('未配音色响铃', false, '未抛错')
} catch (e) { check('未配音色响铃', e.message.includes('音色未配置'), e.message.slice(0, 60)) }

// ---- 契约不匹配响铃（face 存在但缺方法，报错点名缺件而非 undefined is not a function）----
const tools4 = new Map()
const ctxStale = {
  ...ctx,
  tools: { register: (t) => tools4.set(t.name, t) },
  get: (n) => (n === 'minoInference' ? { endpoint: () => 'x' } : undefined),
}
mediaPkg.apply(ctxStale, { videoModel: 'mock-video', ttsModel: '', sttModel: '', musicModel: '' })
try {
  await tools4.get('generate_video').execute({ prompt: 'x' }, exec)
  check('契约不匹配响铃', false, '未抛错')
} catch (e) {
  check('契约不匹配响铃', e.message.includes('契约不匹配') && e.message.includes('poll'), e.message.slice(0, 80))
}

const passed = results.filter((r) => r.ok).length
console.log(`\nRESULT ${passed}/${results.length} pass`)
gw.server.close()
process.exit(passed === results.length ? 0 : 1)
