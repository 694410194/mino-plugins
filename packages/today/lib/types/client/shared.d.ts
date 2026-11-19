/**
 * mino-today 的共享小组件：时钟 hook、相对时间格式化、chip/徽标。
 * 纯展示 —— 数据都从 props 进来。
 */
import { type PointerEvent as ReactPointerEvent } from 'react';
/** 每 30s 跳一次的本地时钟（相对时间、进行中任务时长用）。 */
export declare function useNow(stepMs?: number): number;
export declare function pad2(n: number): string;
/** HH:mm 本地时间。 */
export declare function hhmm(isoOrMs: string | number | undefined): string;
/** YYYY-MM-DD 本地日期键（与 host dayKey 一致）。 */
export declare function dayKey(d: Date): string;
/** 动态卡按 Today 的简报批次分桶：晨间（05-12）/下午（12-18）/晚间（18-05）。 */
export declare function batchOf(iso: string): 'morning' | 'afternoon' | 'evening';
/** 相对时间：刚刚 / N 分钟前 / N 小时前 / HH:mm（跨天给日期）。 */
export declare function relTime(iso: string, nowMs: number): string;
/** 任务时长：Ns / N分Ns / N时N分Ns。 */
export declare function durationText(ms: number): string;
/**
 * Today 卡片的指针追光（解包 TOHVBq 协议）：pointer 相对卡心求方位角写
 * --cursor-angle，按到最近边的归一化距离写 --edge-proximity（>0.3 才显光，
 * 离开归零）。事件挂在卡根元素上，CSS 里 .edgeLight 子层消费这两个 var。
 */
export declare function edgeGlowHandlers<E extends HTMLElement>(): {
    onPointerMove: (e: ReactPointerEvent<E>) => void;
    onPointerLeave: (e: ReactPointerEvent<E>) => void;
};
