/**
 * mino-today 宿主半：自有 JSON 存储 + /mino-today/api/* 路由 + 两个模型工具。
 *
 * - `today_post`：模型把「做完了什么 / 值得留意什么」投到用户的今日页；
 * - `diary_write`：模型往某天的日记里写一条。
 * 页面数据（动态、定时任务、日记）由本插件自己的路由聚合；记忆列表由
 * fish-memory 自己的 /dsh-fish-memory/list 直接提供给客户端，本插件不读它的存储。
 */
import type { Context } from '@deepseek-ai/cordis';
export declare const name = "mino-today";
export declare const inject: string[];
export declare function apply(ctx: Context): void;
