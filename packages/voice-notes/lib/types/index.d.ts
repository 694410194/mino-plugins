/** mino-voice-notes 宿主半：vnote_* 模型工具 + 分段上传/分享路由 + speechToText 转写 + 服务缝。
 *
 * 解耦边界（全官方缝，零他插件私域）：
 * - 录音段：自有 client 半经 MediaRecorder/AudioWorklet 采 PCM16 WAV → POST /mino-voice-notes/api/segment
 * - 转写：ctx.speechToText（resolve→transcribe 官方缝；sensevoice provider 由 voice-input bundle 内置）
 * - 纪要：模型读 vnote_get 的转写文 → vnote_update 写回 summary → 可 today_post 投 feed（软依赖，不耦合）
 * - 分享：/mino-voice-notes/s/<shareId> 只读页（web 档鉴权域内，本地链接）
 * - 服务缝：ctx.provide('mino-voice-notes') 暴露 start/stop/getStatus 给 meeting-detect 等消费方
 */
import type { Context } from '@deepseek-ai/cordis';
export declare const name = "mino-voice-notes";
export declare const inject: string[];
export declare function apply(ctx: Context): void;
