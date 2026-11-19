/**
 * mino-today 客户端半：侧栏「今日」图标 + keyed main 页。
 * 两个注册都走 ctx.slots.inject —— 座位由 shell 包声明，装载顺序无关；
 * shell 没有这些座位时插件安静缺席而不是拖垮启动（task-board 同款写法）。
 *
 * 数据面全部走官方解耦缝：
 * - sessions.list / jobs.state —— hooks 隔间交给渲染器绑成 useSessionList / useJobs
 * - uiWorkspace.openSession —— 卡片跳回会话
 * - sessions.using + session.prompt —— 建议 chip 真发消息
 * - ctx.jobs.watchRows / kill —— 任务视图的流与停止
 * - layout.selectPanel —— 跳去官方「自动化任务」页
 */
import type { Context } from '@deepseek-ai/cordis';
export declare const inject: string[];
export declare function apply(ctx: Context): void;
