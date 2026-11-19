/** 录音引擎：getUserMedia → AudioContext(16kHz mono) → ScriptProcessor → PCM16 →
 * WAV 编码，每 SEGMENT_MS 冲一段回调上传。官方 voice-input 同路径（16kHz mono PCM16 WAV），
 * 但用 ScriptProcessorNode（AudioWorklet 内联 worker 在 tsdown 单文件包里要多绕一层）。
 */
export interface Recorder {
    readonly seconds: () => number;
    stop(): Promise<void>;
    dispose(): void;
}
/** PCM16 WAV 封装（RIFF 头 + interleaved s16le）。 */
export declare function encodeWav(chunks: Float32Array[], totalSamples: number, sampleRate?: number): ArrayBuffer;
export declare function wavToBase64(buf: ArrayBuffer): string;
export declare function startRecording(onSegment: (wav: ArrayBuffer, durationMs: number) => void | Promise<void>): Promise<Recorder>;
