/** 录音引擎：getUserMedia → AudioContext(16kHz mono) → ScriptProcessor → PCM16 →
 * WAV 编码，每 SEGMENT_MS 冲一段回调上传。官方 voice-input 同路径（16kHz mono PCM16 WAV），
 * 但用 ScriptProcessorNode（AudioWorklet 内联 worker 在 tsdown 单文件包里要多绕一层）。
 */

const SAMPLE_RATE = 16000
const CHANNELS = 1
const SEGMENT_MS = 15_000
const BUFFER_SIZE = 4096

export interface Recorder {
  readonly seconds: () => number
  stop(): Promise<void>
  dispose(): void
}

/** PCM16 WAV 封装（RIFF 头 + interleaved s16le）。 */
export function encodeWav(chunks: Float32Array[], totalSamples: number, sampleRate = SAMPLE_RATE): ArrayBuffer {
  const pcm = new Int16Array(totalSamples)
  let off = 0
  for (const chunk of chunks) {
    for (let i = 0; i < chunk.length && off + i < totalSamples; i++) {
      const s = Math.max(-1, Math.min(1, chunk[i]!))
      pcm[off + i] = s < 0 ? s * 0x8000 : s * 0x7fff
    }
    off += chunk.length
  }
  const buf = new ArrayBuffer(44 + totalSamples * 2)
  const v = new DataView(buf)
  const wstr = (o: number, s: string) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)) }
  wstr(0, 'RIFF'); v.setUint32(4, 36 + totalSamples * 2, true); wstr(8, 'WAVE')
  wstr(12, 'fmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true)
  v.setUint16(22, CHANNELS, true); v.setUint32(24, sampleRate, true)
  v.setUint32(28, sampleRate * CHANNELS * 2, true); v.setUint16(32, CHANNELS * 2, true); v.setUint16(34, 16, true)
  wstr(36, 'data'); v.setUint32(40, totalSamples * 2, true)
  new Int16Array(buf, 44).set(pcm)
  return buf
}

export function wavToBase64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf)
  let bin = ''
  const CHUNK = 0x8000
  for (let i = 0; i < bytes.length; i += CHUNK) bin += String.fromCharCode(...bytes.subarray(i, i + CHUNK))
  return btoa(bin)
}

export async function startRecording(onSegment: (wav: ArrayBuffer, durationMs: number) => void | Promise<void>): Promise<Recorder> {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: { channelCount: 1, sampleRate: SAMPLE_RATE, echoCancellation: true, noiseSuppression: true },
  })
  const ctx = new AudioContext({ sampleRate: SAMPLE_RATE })
  const source = ctx.createMediaStreamSource(stream)
  const proc = ctx.createScriptProcessor(BUFFER_SIZE, CHANNELS, CHANNELS)

  let chunks: Float32Array[] = []
  let samples = 0
  let segmentStart = performance.now()
  let flushed = false
  const startedAt = performance.now()

  const flush = async () => {
    if (!samples) return
    const wav = encodeWav(chunks, samples, ctx.sampleRate)
    const ms = Math.round(performance.now() - segmentStart)
    chunks = []; samples = 0; segmentStart = performance.now()
    await onSegment(wav, ms)
  }

  proc.onaudioprocess = (e) => {
    if (flushed) return
    const input = e.inputBuffer.getChannelData(0)
    chunks.push(new Float32Array(input))
    samples += input.length
    if (performance.now() - segmentStart >= SEGMENT_MS) void flush()
  }
  source.connect(proc)
  proc.connect(ctx.destination)

  return {
    seconds: () => (performance.now() - startedAt) / 1000,
    stop: async () => {
      flushed = true
      proc.onaudioprocess = null
      await flush()
    },
    dispose: () => {
      flushed = true
      proc.onaudioprocess = null
      try { proc.disconnect() } catch { /* 已断开 */ }
      try { source.disconnect() } catch { /* 已断开 */ }
      for (const track of stream.getTracks()) track.stop()
      void ctx.close().catch(() => {})
    },
  }
}
