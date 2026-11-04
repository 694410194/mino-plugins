/**
 * mino-connector-asr —— 语音转写连接器（一批·可选包：whisper 本地推理）。
 * 本体不带模型：检测本机已装的 whisper.cpp（whisper-cli.exe/main.exe）或
 * Python faster-whisper/whisper 命令行，有就调，没有给安装指引。
 * 标记 needs-setup/可选重型：模型要用户自己下（几百 MB~几 GB）。
 */
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { existsSync, readFileSync } from 'node:fs'
import { join, dirname, extname, basename } from 'node:path'
import { homedir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { loadHostDeps } from './hostdeps.mjs'
import { createSkillProvider } from './skill-provider.mjs'

const execFileP = promisify(execFile)
const PKG_DIR = dirname(fileURLToPath(import.meta.url))
const PKG = JSON.parse(readFileSync(join(PKG_DIR, 'package.json'), 'utf8'))

export const name = PKG.name
export const inject = ['skills', 'tools']
const defineTool = (await loadHostDeps()).defineTool

const SETUP_HINT = `语音转写需要本机装 whisper 推理器（二选一）：
1) whisper.cpp：github.com/ggerganov/whisper.cpp releases 下 win 包 + 下 ggml 模型（base/small）
2) faster-whisper：pip install faster-whisper（首次跑自动下模型）
装好后用 asr_transcribe 的 engine 参数指定可执行文件路径，或放 PATH 里`

async function detectEngine(custom) {
  const candidates = custom ? [custom] : [
    'whisper-cli', 'whisper-cli.exe', 'main', 'whisper', 'faster-whisper',
    join(homedir(), 'whisper.cpp', 'whisper-cli.exe'),
    'D:/whisper/whisper-cli.exe',
  ]
  for (const c of candidates) {
    try {
      await execFileP(c, ['--help'], { timeout: 10000, windowsHide: true, maxBuffer: 1024 * 1024 })
      return c
    } catch (e) {
      if (e?.code === 'ENOENT' || /not recognized|ENOENT/.test(String(e))) continue
      return c // 启动过（哪怕非零退出）就算存在
    }
  }
  return null
}

export function apply(ctx) {
  ctx.tools.register(defineTool({
    name: 'asr_transcribe',
    description:
      '把本地录音文件（mp3/wav/m4a/amr…）转写成文字。调用本机已装的 whisper.cpp ' +
      '或 faster-whisper——没装会返回安装指引。可选重型件：模型需自行下载。',
    parameters: {
      path: { type: 'string', required: true, description: '音频文件绝对路径' },
      engine: { type: 'string', description: '可选：whisper 可执行文件路径（默认自动探测 PATH/常见位置）' },
      model: { type: 'string', description: '可选：模型文件/名（whisper.cpp 要 -m 模型路径）' },
      lang: { type: 'string', description: '语言（默认 zh）' },
    },
    output: { schema: { type: 'object', additionalProperties: false, properties: {
      text: { type: 'string' }, out: { type: 'string' }, engine: { type: 'string' } } },
      render: (_a, v) => [{ type: 'text', text: `转写完成（${v.engine}）：${v.text.slice(0, 300)}` }] },
    isConcurrencySafe: () => true,
    async execute(args) {
      const f = String(args.path || '').trim()
      if (!existsSync(f)) throw new Error(`asr_transcribe: 文件不存在 ${f}`)
      const engine = await detectEngine(args.engine)
      if (!engine) throw new Error('asr_transcribe: 没找到 whisper 引擎。\n' + SETUP_HINT)
      const lang = args.lang || 'zh'
      const stem = join(dirname(f), basename(f, extname(f)))
      let argv, outFile
      if (/whisper-cli|main(\.exe)?$/i.test(engine)) {
        const model = args.model || join(dirname(engine), 'models', 'ggml-base.bin')
        argv = ['-m', model, '-f', f, '-l', lang, '-otxt', '-of', stem]
        outFile = `${stem}.txt`
      } else {
        // faster-whisper / openai-whisper CLI 约定各不同，按通用格式试
        argv = [f, '--language', lang === 'zh' ? 'Chinese' : lang, '--output_format', 'txt', '--output_dir', dirname(f)]
        outFile = `${stem}.txt`
      }
      try {
        await execFileP(engine, argv, { timeout: 600000, windowsHide: true, maxBuffer: 4 * 1024 * 1024 })
      } catch (e) {
        const tail = String(e?.stderr || e?.message || '').slice(-400)
        throw new Error(`asr_transcribe: 转写失败（${tail}）。模型路径可能不对，用 model 参数指定`)
      }
      const text = existsSync(outFile) ? readFileSync(outFile, 'utf8').trim() : ''
      return { text, out: outFile, engine }
    },
    presentCall: (a) => ({ card: 'generic', title: '语音转文字', kind: 'other', rawInput: a }),
  }))

  ctx.tools.register(defineTool({
    name: 'asr_status',
    description: '查语音转写引擎状态：本机有没有装 whisper、在哪。',
    parameters: {},
    output: { schema: { type: 'object', additionalProperties: false, properties: {
      engine: { type: 'string' }, hint: { type: 'string' } } },
      render: (_a, v) => [{ type: 'text', text: v.engine ? `引擎就绪：${v.engine}` : v.hint }] },
    isConcurrencySafe: () => true,
    async execute() {
      const engine = await detectEngine()
      return engine ? { engine, hint: '' } : { engine: '', hint: SETUP_HINT }
    },
    presentCall: (a) => ({ card: 'generic', title: '查转写引擎', kind: 'other', rawInput: a }),
  }))

  ctx.effect(() => ctx.skills.registerProvider(() => createSkillProvider(ctx)))
}
