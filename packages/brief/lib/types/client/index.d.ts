/** mino-brief 客户端半：早晚报偏好编辑器，注册进 mino-today 的「自定义」座位。 */
import type { Context } from '@deepseek-ai/cordis';
import { type CopyKey } from './locales.ts';
export declare const inject: string[];
export type Translate = (key: CopyKey, params?: Record<string, unknown>) => string;
export declare function apply(ctx: Context): void;
