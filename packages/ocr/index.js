/**
 * mino-connector-ocr —— 截图/图片识别连接器（域 20 截图扩面）。
 * 调 Windows 10/11 自带 WinRT OCR（Windows.Media.Ocr），PowerShell 桥，
 * 零依赖零下载，识别结果只在本机。支持 jpg/png/bmp/heic(看系统解码)。
 */
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { existsSync, readFileSync, unlinkSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { loadHostDeps } from './hostdeps.mjs'
import { createSkillProvider } from './skill-provider.mjs'

const execFileP = promisify(execFile)
const PKG_DIR = dirname(fileURLToPath(import.meta.url))
const PKG = JSON.parse(readFileSync(join(PKG_DIR, 'package.json'), 'utf8'))

export const name = PKG.name
export const inject = ['skills', 'tools']
const defineTool = (await loadHostDeps()).defineTool

const OCR_PS = `
param([string]$img, [string]$out)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Runtime.WindowsRuntime
$null = [Windows.Media.Ocr.OcrEngine,Windows.Foundation,ContentType=WindowsRuntime]
$null = [Windows.Graphics.Imaging.BitmapDecoder,Windows.Foundation,ContentType=WindowsRuntime]
$null = [Windows.Storage.Streams.InMemoryRandomAccessStream,Windows.Storage.Streams,ContentType=WindowsRuntime]
$null = [Windows.Storage.Streams.DataWriter,Windows.Storage.Streams,ContentType=WindowsRuntime]
$null = [Windows.Globalization.Language,Windows.Foundation,ContentType=WindowsRuntime]
function Await($op, $type) {
  # PS5.1 can't bind the generic AsTask overload directly; resolve and instantiate it here.
  $m = [System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object {
    $_.Name -eq 'AsTask' -and $_.IsGenericMethod -and $_.GetParameters().Count -eq 1 -and
    $_.GetParameters()[0].ParameterType.Name -like 'IAsyncOperation*' } | Select-Object -First 1
  $task = $m.MakeGenericMethod($type).Invoke($null, @($op))
  $task.Wait()
  return $task.Result
}
# StorageFile goes through the WinRT file broker which denies arbitrary paths;
# read the bytes ourselves and hand the decoder an in-memory stream instead.
$bytes = [System.IO.File]::ReadAllBytes($img)
$stream = New-Object Windows.Storage.Streams.InMemoryRandomAccessStream
$writer = New-Object Windows.Storage.Streams.DataWriter($stream)
$writer.WriteBytes($bytes)
$null = Await ($writer.StoreAsync()) ([System.UInt32])
$null = Await ($stream.FlushAsync()) ([System.Boolean])
$stream.Seek(0)
$decoder = Await ([Windows.Graphics.Imaging.BitmapDecoder]::CreateAsync($stream)) ([Windows.Graphics.Imaging.BitmapDecoder])
$bitmap = Await ($decoder.GetSoftwareBitmapAsync()) ([Windows.Graphics.Imaging.SoftwareBitmap])
$engine = [Windows.Media.Ocr.OcrEngine]::TryCreateFromLanguage((New-Object Windows.Globalization.Language 'zh-Hans-CN'))
if (-not $engine) { $engine = [Windows.Media.Ocr.OcrEngine]::TryCreateFromUserProfileLanguages() }
$result = Await ($engine.RecognizeAsync($bitmap)) ([Windows.Media.Ocr.OcrResult])
[System.IO.File]::WriteAllText($out, $result.Text, [System.Text.Encoding]::UTF8)
`

export function apply(ctx) {
  ctx.tools.register(defineTool({
    name: 'ocr_read',
    description:
      '识别图片/截图里的文字（Windows 自带 OCR，中文+英文，零依赖）。' +
      '传图片路径，返回识别出的文字。用于截图内容检索、聊天记录截图读字。',
    parameters: {
      path: { type: 'string', required: true, description: '图片文件绝对路径（jpg/png/bmp）' },
    },
    output: { schema: { type: 'object', additionalProperties: false, properties: {
      text: { type: 'string' }, chars: { type: 'integer' } } },
      render: (_a, v) => [{ type: 'text', text: `识别 ${v.chars} 字：${v.text.slice(0, 300)}` }] },
    isConcurrencySafe: () => true,
    async execute(args) {
      const f = String(args.path || '').trim()
      if (!existsSync(f)) throw new Error(`ocr_read: 文件不存在 ${f}`)
      if (process.platform !== 'win32') throw new Error('ocr_read: 目前只支持 Windows（用系统自带 OCR）')
      const psFile = join(tmpdir(), `ocr-${Date.now()}.ps1`)
      const outFile = join(tmpdir(), `ocr-${Date.now()}.txt`)
      const { writeFileSync } = await import('node:fs')
      writeFileSync(psFile, OCR_PS, 'utf16le' ? 'utf8' : 'utf8')
      try {
        await execFileP('powershell', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', psFile,
          '-img', f, '-out', outFile], { timeout: 60000, windowsHide: true })
      } catch (e) {
        throw new Error(`ocr_read: 识别失败（${String(e?.stderr || e?.message).slice(-200)}）`)
      } finally { try { unlinkSync(psFile) } catch {} }
      const text = existsSync(outFile) ? readFileSync(outFile, 'utf8').trim() : ''
      try { unlinkSync(outFile) } catch {}
      if (!text) throw new Error('ocr_read: 没识别出文字（图太小/太糊/不是文字图）')
      return { text, chars: text.length }
    },
    presentCall: (a) => ({ card: 'generic', title: '识别图片文字', kind: 'other', rawInput: a }),
  }))

  ctx.effect(() => ctx.skills.registerProvider(() => createSkillProvider(ctx)))
}
