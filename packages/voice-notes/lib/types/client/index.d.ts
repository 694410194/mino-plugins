/** mino-voice-notes 客户端半：注册进 mino-today 的「语音」tab 座位。
 * 与 mino-today 同款注册法（slots.inject 座位缺席则安静缺席）。
 * 数据面：同源 fetch 自有路由；录音经 MediaRecorder 同款 getUserMedia+PCM16 WAV 链。
 */
import type { Context } from '@deepseek-ai/cordis';
import { type CopyKey } from './locales.ts';
export declare const inject: string[];
export type Translate = (key: CopyKey, params?: Record<string, unknown>) => string;
export declare function apply(ctx: Context): void;
