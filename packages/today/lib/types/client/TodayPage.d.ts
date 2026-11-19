/**
 * 「今日」主页面：晨曦渐变 hero（问候 + 正在处理 + 陪伴统计 + 和米洛聊聊）
 * 下面挂四个视图 —— 今日动态 / 任务 / 记忆 / 日记。
 * 数据：自有路由 /mino-today/api/* + fish-memory /dsh-fish-memory/list
 * + 官方缝（sessions.list / jobs.state / uiWorkspace / schedule）。
 */
import { type ReactNode } from 'react';
export type Translate = (key: string, params?: Record<string, string | number>) => string;
/** 页面从 inject 面拿到的动作（缺服务时回调是空操作/假）。 */
export interface TodayActions {
    openSession(sessionId: string): void;
    /** 往会话发一句话；sessionId 为空时新开一个会话。返回是否发出。 */
    sendPrompt(sessionId: string | undefined, text: string, options?: {
        navigate?: boolean;
    }): Promise<boolean>;
    /** 「和米洛聊聊」：开新会话并跳过去。 */
    newChat(): Promise<void>;
    /** 订一个会话的后台任务流，返回停止函数。 */
    watchJobs(sessionId: string): () => void;
    killJob(sessionId: string, jobId: string): Promise<boolean>;
    /** 跳到官方「自动化任务」面板。 */
    openSchedules(): void;
    refreshSessions(): void;
}
export interface SessionRowLite {
    id: string;
    displayTitle: string;
    running: boolean;
    updatedAt: number;
}
export interface SessionListLite {
    ids: string[];
    byId: Record<string, SessionRowLite>;
}
export interface JobLite {
    id: string;
    kind: string;
    label: string;
    owner?: string;
    status: 'running' | 'stopping' | 'completed' | 'killed' | 'failed';
    progress?: string;
    detail?: string;
    startedAt: number;
    finishedAt?: number;
}
export interface JobsSnapshotLite {
    rows: Record<string, readonly JobLite[]>;
}
/** 渲染器把 hooks 隔间里的裸源绑成的 selector hook；缺服务时不注入。 */
type BoundHook<S> = <R>(selector: (state: S) => R, equal?: (a: R, b: R) => boolean) => R;
export interface TodayPageProps {
    t: Translate;
    actions: TodayActions;
    useSessionList?: BoundHook<SessionListLite>;
    useJobs?: BoundHook<JobsSnapshotLite>;
    /** 框架下发的子座位渲染器；渲染 'today.page.voice' 由语音笔记插件贡献。 */
    renderSlot?: (key: string, owner: Record<string, unknown>, opts?: {
        fallback?: ReactNode;
    }) => ReactNode;
}
export declare function TodayPage({ t, actions, useSessionList, useJobs, renderSlot }: TodayPageProps): import("react").JSX.Element;
export {};
