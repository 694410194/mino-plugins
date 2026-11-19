/**
 * mino-brief 宿主半：早晚简报流水线。
 *
 * 形态 = 固定 preset 会话 + 宿主 schedule 定时唤醒：
 *   schedule.create(daily) → 到点向 `mino-brief` 会话投递 user 消息
 *   → 简报员普通模型轮生成 → 自行调 today_post（mino-today 提供）投到「今日」页。
 * 生成管线不自造——一次带人格的模型轮就是生成器；定时条目出现在宿主
 * schedules 面板与 mino-today 定时 tab，用户可暂停/删除。
 * 删除过的条目记 tombstone，不偷偷复活。
 */
import type { Context } from '@deepseek-ai/cordis';
import { z } from 'zod';
export declare const name = "mino-brief";
export declare const inject: string[];
export declare const Config: z.ZodPrefault<z.ZodObject<{
    workspaceRoot: z.ZodOptional<z.ZodString>;
    timeZone: z.ZodDefault<z.ZodString>;
    morning: z.ZodPrefault<z.ZodObject<{
        enabled: z.ZodDefault<z.ZodBoolean>;
        time: z.ZodDefault<z.ZodString>;
        prompt: z.ZodDefault<z.ZodString>;
    }, z.core.$strip>>;
    evening: z.ZodPrefault<z.ZodObject<{
        enabled: z.ZodDefault<z.ZodBoolean>;
        time: z.ZodDefault<z.ZodString>;
        prompt: z.ZodDefault<z.ZodString>;
    }, z.core.$strip>>;
}, z.core.$strip>>;
export type BriefConfig = z.infer<typeof Config>;
export declare function apply(ctx: Context, config: BriefConfig): Promise<void>;
