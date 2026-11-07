/**
 * inference-server.mjs — mock Mino 推理网关。
 * 回包形状逐条对照 mino-api 真实实现（plugins/tasks/sora|sunoapi/plugin.js、
 * OpenAI 兼容 relay 端点），不是示意值：
 *   openai_video:  POST /v1/videos → GET /v1/videos/{id} → /content
 *                  状态枚举 queued|in_progress|completed|failed，progress 为数值
 *   audio:         POST /v1/audio/speech（按 response_format 定 content-type）
 *                  POST /v1/audio/transcriptions → { text }
 *   suno native:   POST /suno/submit/{MUSIC|LYRICS} → {code:'success', data:'<task_id>'}
 *                  GET  /suno/fetch/{id} → {code:'success', data: nativeTask}
 *                  nativeTask.status 枚举 NOT_START|SUBMITTED|QUEUED|IN_PROGRESS|SUCCESS|FAILURE
 * 视频与音乐查询做成两阶段轮询（先进行中后成功）以覆盖真实 poll 循环。
 * 每个请求记录方法/路径/鉴权头/JSON 体供 harness 断言；
 * ?fail=401 注入一次性认证失败，验证服务层 401→rejectToken 路径。
 */
import http from 'node:http'

export function wavSine(seconds = 0.5, freq = 440, rate = 8000) {
  const n = Math.floor(seconds * rate)
  const data = Buffer.alloc(44 + n * 2)
  data.write('RIFF', 0); data.writeUInt32LE(36 + n * 2, 4); data.write('WAVE', 8)
  data.write('fmt ', 12); data.writeUInt32LE(16, 16); data.writeUInt16LE(1, 20)
  data.writeUInt16LE(1, 22); data.writeUInt32LE(rate, 24); data.writeUInt32LE(rate * 2, 28)
  data.writeUInt16LE(2, 32); data.writeUInt16LE(16, 34)
  data.write('data', 36); data.writeUInt32LE(n * 2, 40)
  for (let i = 0; i < n; i++) data.writeInt16LE(Math.round(Math.sin(2 * Math.PI * freq * i / rate) * 8000), 44 + i * 2)
  return data
}

const FAKE_MP4 = Buffer.concat([
  Buffer.from([0, 0, 0, 24, 0x66, 0x74, 0x79, 0x70, 0x6d, 0x70, 0x34, 0x32]), // ftypmp42
  Buffer.alloc(4096, 0xab),
])

const AUDIO_MIME = { mp3: 'audio/mpeg', wav: 'audio/wav', opus: 'audio/opus', flac: 'audio/flac', aac: 'audio/aac' }

export function startMockGateway() {
  const requests = []
  let failNext401 = false
  const videoPolls = new Map()
  const sunoPolls = new Map()
  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, 'http://x')
    const raw = await new Promise((ok) => {
      const chunks = []
      req.on('data', (c) => chunks.push(c))
      req.on('end', () => ok(Buffer.concat(chunks)))
    })
    let bodyJson
    if ((req.headers['content-type'] ?? '').startsWith('application/json') && raw.length) {
      try { bodyJson = JSON.parse(raw.toString('utf8')) } catch { /* non-JSON body, leave undefined */ }
    }
    requests.push({
      method: req.method, path: url.pathname,
      auth: req.headers.authorization, grant: req.headers['x-dsh-auth-token'],
      bodyLen: raw.length, json: bodyJson,
    })
    const json = (obj, status = 200) => { res.writeHead(status, { 'content-type': 'application/json' }); res.end(JSON.stringify(obj)) }
    const bin = (buf, type) => { res.writeHead(200, { 'content-type': type }); res.end(buf) }
    const now = () => Math.floor(Date.now() / 1000)

    if (failNext401 && !url.pathname.startsWith('/mock-')) { failNext401 = false; return json({ error: { message: 'invalid grant' } }, 401) }

    // ---- openai_video protocol（sora/plugin.js: legacyRenderers.openai_video）
    if (req.method === 'POST' && url.pathname === '/v1/videos') {
      if (!bodyJson || !String(bodyJson.prompt ?? '').trim()) return json({ error: { message: 'field prompt is required' } }, 400)
      return json({ id: 'vid_mock_001', object: 'video', model: bodyJson.model, status: 'queued', progress: 0, created_at: now() })
    }
    if (req.method === 'GET' && /^\/v1\/videos\/[^/]+$/.test(url.pathname)) {
      const id = url.pathname.split('/').pop()
      const n = (videoPolls.get(id) ?? 0) + 1
      videoPolls.set(id, n)
      if (n === 1) return json({ id, object: 'video', model: 'mock-video', status: 'in_progress', progress: 50, created_at: now() })
      return json({ id, object: 'video', model: 'mock-video', status: 'completed', progress: 100, created_at: now(), completed_at: now() })
    }
    if (req.method === 'GET' && /^\/v1\/videos\/[^/]+\/content$/.test(url.pathname)) return bin(FAKE_MP4, 'video/mp4')

    // ---- OpenAI 兼容 audio 端点
    if (req.method === 'POST' && url.pathname === '/v1/audio/speech') {
      const fmt = String(bodyJson?.response_format ?? 'mp3').toLowerCase()
      return bin(wavSine(), AUDIO_MIME[fmt] ?? 'application/octet-stream')
    }
    if (req.method === 'POST' && url.pathname === '/v1/audio/transcriptions') return json({ text: '模拟转写：这是一段测试文本。' })

    // ---- suno 原生路由（sunoapi/plugin.js: native renderSubmit/renderTask）
    if (req.method === 'POST' && /^\/suno\/submit\/[^/]+$/.test(url.pathname)) {
      const action = url.pathname.split('/').pop().toUpperCase()
      if (action !== 'MUSIC' && action !== 'LYRICS') {
        return json({ code: 'invalid_action', message: 'invalid_action', data: null }, 400)
      }
      return json({ code: 'success', message: '任务提交成功', data: 'suno_mock_001' })
    }
    if (req.method === 'GET' && /^\/suno\/fetch\/[^/]+$/.test(url.pathname)) {
      const id = url.pathname.split('/').pop()
      const n = (sunoPolls.get(id) ?? 0) + 1
      sunoPolls.set(id, n)
      const task = {
        created_at: now(), updated_at: now(), task_id: id, platform: 'sunoapi',
        status: n === 1 ? 'IN_PROGRESS' : 'SUCCESS',
        fail_reason: '', submit_time: now(), finish_time: n === 1 ? 0 : now(),
        progress: n === 1 ? '50%' : '100%',
        data: n === 1 ? null : [{
          id: 'song_mock_001', title: 'Mock Track', text: 'la la la',
          audio_url: `http://127.0.0.1:${server.address().port}/mock-clip.mp3`,
          image_url: 'https://example.com/cover.jpg',
        }],
      }
      return json({ code: 'success', message: '', data: task })
    }
    if (req.method === 'GET' && url.pathname === '/mock-clip.mp3') return bin(wavSine(0.3, 550), 'audio/mpeg')
    return json({ error: { message: `mock: unhandled ${req.method} ${url.pathname}` } }, 404)
  })
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve({
      server,
      port: server.address().port,
      requests,
      failNext: () => { failNext401 = true },
    }))
  })
}
