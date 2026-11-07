/**
 * mino-media — Mino 媒体生成插件（视频/TTS/转写/音乐）。
 *
 * 所有网关调用只经 `ctx.get('minoInference')` 服务，代码内不出现 URL 与凭据。
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { randomBytes } from 'node:crypto'
import z from '@deepseek-ai/schemastery'
import { loadHostDeps } from './hostdeps.mjs'

const defineTool = (await loadHostDeps()).defineTool

function volatile(schema) {
  const mark = schema.volatile
  return typeof mark === 'function' ? mark.call(schema) : schema
}

export const Config = z.object({
  videoModel: volatile(z.string().default('')),
  ttsModel: volatile(z.string().default('')),
  ttsVoice: volatile(z.string().default('')),
  sttModel: volatile(z.string().default('')),
  musicModel: volatile(z.string().default('')),
  workspaceFolder: volatile(z.string().default('mino-media')),
  taskTimeoutMs: volatile(z.number().min(10_000).max(3_600_000).default(900_000)),
}).description('Mino 媒体生成')

export const name = 'mino-media'
// minoInference is NOT injected: mounting anyway lets each tool fail loudly
// with a pointer to enable mino-inference instead of a silently dormant plugin.
export const inject = ['tools']

function readConfig(config) {
  const out = {}
  for (const [key, value] of Object.entries(config ?? {})) {
    out[key] = value !== null && typeof value === 'object' && typeof value.get === 'function' ? value.get() : value
  }
  return out
}

/** Persist media bytes under the session workspace; return the saved path. */
async function saveToWorkspace(exec, config, filename, data) {
  const cwd = exec?.agent?.session?.header?.cwd ?? process.cwd()
  const dir = path.join(cwd, config.workspaceFolder || 'mino-media')
  await mkdir(dir, { recursive: true })
  const filePath = path.join(dir, filename)
  await writeFile(filePath, data)
  return filePath
}

const EXT_BY_MIME = {
  'video/mp4': 'mp4', 'video/webm': 'webm', 'video/quicktime': 'mov',
  'audio/mpeg': 'mp3', 'audio/mp3': 'mp3', 'audio/wav': 'wav', 'audio/x-wav': 'wav',
  'audio/ogg': 'ogg', 'audio/flac': 'flac', 'audio/aac': 'aac', 'audio/opus': 'opus',
}
function extOf(mediaType, fallback) {
  return EXT_BY_MIME[(mediaType ?? '').split(';', 1)[0].trim().toLowerCase()] ?? fallback
}

export function apply(ctx, config = {}) {
  const current = () => readConfig(config)
  // Duck-typed seam: assert exactly the face members this plugin calls, so an
  // outdated mino-inference reports which method is missing instead of
  // surfacing `undefined is not a function` mid-tool-call.
  const FACE_METHODS = ['endpoint', 'post', 'postJson', 'getJson', 'readBytes', 'download', 'poll']
  const inference = () => {
    const service = ctx.get('minoInference')
    if (service === undefined) throw new Error('mino-inference 服务未启用：请先在插件管理中启用 mino-inference。')
    const missing = FACE_METHODS.filter((m) => typeof service[m] !== 'function')
    if (missing.length > 0) {
      throw new Error(`minoInference 服务契约不匹配：缺少 ${missing.join('、')} 方法（mino-inference 版本过旧，请升级插件）。`)
    }
    return service
  }

  /** Require a configured model id, with a per-modality Chinese hint. */
  const modelOf = (key, label) => {
    const model = current()[key]?.trim() ?? ''
    if (model.length === 0) {
      throw new Error(`${label}模型未配置：请前往 设置 > 插件 > Mino 媒体生成 填写 ${key}（Mino 后台开通的模型 id）。`)
    }
    return model
  }

  // ---- 视频：openai_video 协议（POST /v1/videos → GET /v1/videos/{id} → /content）
  ctx.tools.register(defineTool({
    name: 'generate_video',
    description: 'Generate a video with the Mino media service. Submits a video generation task, waits for completion, downloads the clip, and saves it under the session workspace. Use check_video to resume tracking an existing task id. Provide a complete visual prompt describing subject, motion, camera, and style.',
    parameters: {
      prompt: { type: 'string', required: true, description: 'Complete description of the video to generate.' },
      seconds: { type: 'number', description: 'Optional duration in seconds (1-3600). Omit to use the model default.' },
      size: { type: 'string', description: 'Optional resolution/aspect, e.g. 1280x720. Omit to use the model default.' },
      input_reference: { type: 'string', description: 'Optional first-frame image URL for image-to-video. Omit for text-to-video.' },
      model: { type: 'string', description: 'Optional video model id for this call only. Omit to use the configured model.' },
    },
    output: {
      schema: { type: 'object', additionalProperties: false, properties: {
        file: { type: 'string' }, model: { type: 'string' }, taskId: { type: 'string' } } },
      render: (_a, v) => [{ type: 'text', text: `已生成视频（模型 ${v.model}，任务 ${v.taskId}）：${v.file}` }],
    },
    isConcurrencySafe: () => false,
    async execute(args, exec) {
      const inf = inference()
      const model = args.model?.trim() || modelOf('videoModel', '视频')
      const body = { model, prompt: args.prompt }
      if (Number.isFinite(args.seconds) && args.seconds > 0) body.seconds = Math.floor(args.seconds)
      if (typeof args.size === 'string' && args.size.trim().length > 0) body.size = args.size.trim()
      if (typeof args.input_reference === 'string' && args.input_reference.trim().length > 0) body.input_reference = args.input_reference.trim()
      const task = await inf.postJson('videos', { body, signal: exec.signal })
      const id = task?.id ?? task?.task_id
      if (typeof id !== 'string' || id.length === 0) {
        throw new Error(`视频任务提交成功但未返回任务 id：${JSON.stringify(task).slice(0, 256)}`)
      }
      const done = await inf.poll(`videos/${encodeURIComponent(id)}`, {
        signal: exec.signal,
        timeoutMs: current().taskTimeoutMs,
        isDone: (payload) => {
          const status = payload?.status
          if (status === 'failed' || status === 'cancelled') return 'fail'
          return status === 'completed' || status === 'succeeded'
        },
      })
      const clip = await inf.download(inf.endpoint(`videos/${encodeURIComponent(id)}/content`), { signal: exec.signal })
      const filename = `video-${id}-${randomBytes(3).toString('hex')}.${extOf(clip.mediaType, 'mp4')}`
      const file = await saveToWorkspace(exec, current(), filename, clip.data)
      return { file, model: done?.model ?? model, taskId: id }
    },
    presentCall: (a) => ({ card: 'generic', title: '生成视频', kind: 'other', rawInput: a }),
  }))

  ctx.tools.register(defineTool({
    name: 'check_video',
    description: 'Check the status of a previously submitted Mino video generation task by id. Use when generate_video timed out or was interrupted, to see whether the task finished.',
    parameters: {
      id: { type: 'string', required: true, description: 'Video task id returned by generate_video.' },
    },
    output: {
      schema: { type: 'object', additionalProperties: false, properties: {
        id: { type: 'string' }, status: { type: 'string' }, progress: { type: 'number' }, error: { type: 'string' } } },
      render: (_a, v) => [{ type: 'text', text: `任务 ${v.id} 状态：${v.status}${v.progress !== undefined ? `，进度 ${v.progress}%` : ''}${v.error ? `，错误：${v.error}` : ''}` }],
    },
    isConcurrencySafe: () => true,
    async execute(args) {
      const payload = await inference().getJson(`videos/${encodeURIComponent(args.id.trim())}`)
      return {
        id: args.id,
        status: String(payload?.status ?? 'unknown'),
        ...(typeof payload?.progress === 'number' ? { progress: payload.progress } : {}),
        ...(payload?.error !== undefined ? { error: payload.error.message ?? JSON.stringify(payload.error) } : {}),
      }
    },
    presentCall: (a) => ({ card: 'generic', title: '查询视频任务', kind: 'read', rawInput: a }),
  }))

  // ---- TTS：POST /v1/audio/speech → 二进制音频
  ctx.tools.register(defineTool({
    name: 'speech_synthesize',
    description: 'Synthesize speech audio from text with the Mino media service (text-to-speech) and save it under the session workspace. Use for narration, voiceover, or reading text aloud.',
    parameters: {
      input: { type: 'string', required: true, description: 'Text to speak.' },
      voice: { type: 'string', description: 'Optional voice id for this call only. Omit to use the configured voice.' },
      model: { type: 'string', description: 'Optional TTS model id for this call only. Omit to use the configured model.' },
      format: { type: 'string', description: 'Optional audio format (mp3, wav, opus, flac). Omit for mp3.' },
    },
    output: {
      schema: { type: 'object', additionalProperties: false, properties: {
        file: { type: 'string' }, model: { type: 'string' }, voice: { type: 'string' } } },
      render: (_a, v) => [{ type: 'text', text: `已合成语音（模型 ${v.model}${v.voice ? `，音色 ${v.voice}` : ''}）：${v.file}` }],
    },
    isConcurrencySafe: () => false,
    async execute(args, exec) {
      const inf = inference()
      const model = args.model?.trim() || modelOf('ttsModel', '语音合成')
      const voice = args.voice?.trim() || current().ttsVoice?.trim() || ''
      if (voice.length === 0) {
        throw new Error('音色未配置：请前往 设置 > 插件 > Mino 媒体生成 填写 ttsVoice，或在调用时指定 voice 参数。')
      }
      const body = { model, input: args.input, response_format: args.format?.trim() || 'mp3' }
      if (voice.length > 0) body.voice = voice
      const response = await inf.post('audio/speech', { body, signal: exec.signal })
      const mediaType = response.headers.get('content-type')
      const data = await inf.readBytes(response)
      const filename = `speech-${Date.now()}-${randomBytes(3).toString('hex')}.${extOf(mediaType, body.response_format)}`
      const file = await saveToWorkspace(exec, current(), filename, data)
      return { file, model, voice }
    },
    presentCall: (a) => ({ card: 'generic', title: '语音合成', kind: 'other', rawInput: a }),
  }))

  // ---- 转写：POST /v1/audio/transcriptions（multipart）→ JSON text
  ctx.tools.register(defineTool({
    name: 'speech_transcribe',
    description: 'Transcribe an audio or video file to text with the Mino media service (speech-to-text). Accepts a workspace-relative or absolute file path.',
    parameters: {
      path: { type: 'string', required: true, description: 'Audio/video file path to transcribe.' },
      model: { type: 'string', description: 'Optional transcription model id for this call only. Omit to use the configured model.' },
      language: { type: 'string', description: 'Optional BCP-47 language hint, e.g. zh, en.' },
    },
    output: {
      schema: { type: 'object', additionalProperties: false, properties: {
        text: { type: 'string' }, model: { type: 'string' }, path: { type: 'string' } } },
      render: (_a, v) => [{ type: 'text', text: `转写完成（模型 ${v.model}）：\n${v.text}` }],
    },
    isConcurrencySafe: () => true,
    async execute(args, exec) {
      const inf = inference()
      const model = args.model?.trim() || modelOf('sttModel', '语音转写')
      const filePath = path.isAbsolute(args.path) ? args.path : path.join(exec?.agent?.session?.header?.cwd ?? process.cwd(), args.path)
      const data = await readFile(filePath)
      const form = new FormData()
      form.append('model', model)
      if (args.language?.trim()) form.append('language', args.language.trim())
      form.append('file', new Blob([data]), path.basename(filePath))
      const payload = await inf.postJson('audio/transcriptions', { form, signal: exec.signal })
      return {
        text: typeof payload?.text === 'string' ? payload.text : JSON.stringify(payload).slice(0, 8192),
        model,
        path: filePath,
      }
    },
    presentCall: (a) => ({ card: 'generic', title: '语音转写', kind: 'read', rawInput: a }),
  }))

  // ---- 音乐：suno 原生路由（POST /suno/submit/:action → GET /suno/fetch/:task_id）
  ctx.tools.register(defineTool({
    name: 'generate_music',
    description: 'Generate a music track with the Mino media service (Suno). Submits a music generation task, waits for completion, downloads the audio, and saves it under the session workspace.',
    parameters: {
      prompt: { type: 'string', required: true, description: 'Description of the music style, mood, and content to generate.' },
      model: { type: 'string', description: 'Optional music model id for this call only. Omit to use the configured model.' },
      instrumental: { type: 'boolean', description: 'Set true for instrumental music without vocals.' },
      tags: { type: 'string', description: 'Optional comma-separated style tags for the track.' },
      title: { type: 'string', description: 'Optional track title.' },
    },
    output: {
      schema: { type: 'object', additionalProperties: false, properties: {
        file: { type: 'string' }, model: { type: 'string' }, taskId: { type: 'string' }, note: { type: 'string' } } },
      render: (_a, v) => [{ type: 'text', text: v.file ? `已生成音乐（模型 ${v.model}，任务 ${v.taskId}）：${v.file}` : (v.note ?? '') }],
    },
    isConcurrencySafe: () => false,
    async execute(args, exec) {
      const inf = inference()
      const model = args.model?.trim() || modelOf('musicModel', '音乐')
      // Native route picks the gateway model by action: MUSIC→suno_music,
      // LYRICS→suno_lyrics. Body is passed through to Suno-API verbatim, so
      // a style description goes to gpt_description_prompt (auto mode).
      const action = /lyrics/i.test(model) ? 'LYRICS' : 'MUSIC'
      const body = { gpt_description_prompt: args.prompt, make_instrumental: args.instrumental === true }
      if (args.tags?.trim()) body.tags = args.tags.trim()
      if (args.title?.trim()) body.title = args.title.trim()
      const task = await inf.postJson(`/suno/submit/${action}`, { body, signal: exec.signal })
      if (task?.code !== undefined && task.code !== 'success') {
        throw new Error(`音乐任务提交失败：${task.message ?? task.code}`)
      }
      // renderSubmit returns { code: 'success', data: '<task_id>' }
      const id = typeof task?.data === 'string' ? task.data : task?.data?.task_id ?? task?.task_id ?? task?.id
      if (typeof id !== 'string' || id.length === 0) {
        throw new Error(`音乐任务提交成功但未返回任务 id：${JSON.stringify(task).slice(0, 256)}`)
      }
      const done = await inf.poll(`/suno/fetch/${encodeURIComponent(id)}`, {
        signal: exec.signal,
        timeoutMs: current().taskTimeoutMs,
        isDone: (payload) => {
          // renderTask wraps nativeTask: { code: 'success', data: { status, fail_reason, progress, data } }
          const status = String(payload?.data?.status ?? '').toUpperCase()
          if (status === 'FAILURE') return 'fail'
          return status === 'SUCCESS'
        },
      })
      // nativeTask.data unwrap mirrors the plugin's artifactData(): an array
      // of songs, or a nested { task_id, data: [songs] } payload.
      const taskData = done?.data?.data
      const items = Array.isArray(taskData)
        ? taskData
        : taskData && typeof taskData === 'object'
          ? (Array.isArray(taskData.data) ? taskData.data : taskData.data ? [taskData.data] : [taskData])
          : []
      const clip = items.find(item => typeof item?.audio_url === 'string' && item.audio_url.length > 0)
      const url = clip?.audio_url
      if (typeof url !== 'string') {
        return { file: '', model, taskId: id, note: `音乐任务 ${id} 已完成但返回里未包含音频地址：${JSON.stringify(done).slice(0, 512)}` }
      }
      const media = await inf.download(url, { signal: exec.signal })
      const filename = `music-${id}-${randomBytes(3).toString('hex')}.${extOf(media.mediaType, 'mp3')}`
      const file = await saveToWorkspace(exec, current(), filename, media.data)
      return { file, model, taskId: id }
    },
    presentCall: (a) => ({ card: 'generic', title: '生成音乐', kind: 'other', rawInput: a }),
  }))
}
