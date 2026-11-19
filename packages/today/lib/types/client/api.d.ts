/** mino-today 客户端的 API 面：本插件路由 + fish-memory 自己的 /list。 */
export interface Suggestion {
    label: string;
    prompt: string;
}
/** 结构化卡体（自有 schema 枚举）。 */
export type FeedCard = {
    type: 'list';
    items: string[];
} | {
    type: 'metric';
    value: string;
    unit?: string;
    delta?: string;
} | {
    type: 'progress';
    done: number;
    total: number;
    label?: string;
};
export interface FeedItem {
    id: string;
    kind: 'note' | 'result' | 'moment';
    title: string;
    body?: string;
    at: string;
    sessionId?: string;
    source?: string;
    suggestions?: Suggestion[];
    /** 生成方给的批次标签；同批卡片并成一组显示。 */
    batchId?: string;
    /** 批次语义类别（morning_brief/evening_brief/diary…）——有它批次头显示正式标题。 */
    batchKind?: string;
    pinned?: boolean;
    feedback?: 'up' | 'down' | 'not_interested';
    /** 结构化卡体；缺省就是普通文字卡。 */
    card?: FeedCard;
    /** 已读时间；缺省=未读。 */
    read?: string;
}
export interface ScheduleCard {
    id: string;
    title: string;
    kind: string;
    status: 'active' | 'paused' | 'ended';
    nextAt?: string;
    running?: boolean;
    lastDeliveredAt?: string;
}
export interface Summary {
    ok: boolean;
    now: string;
    today: string;
    items: FeedItem[];
    schedules: ScheduleCard[];
    diaries: {
        count: number;
        latest: string | null;
        todayHasDiary: boolean;
    };
    stats?: {
        feedCount: number;
        diaryDays: number;
        oldestAt: string | null;
    };
}
export interface DiaryListRow {
    date: string;
    updatedAt: string;
    count: number;
    preview: string;
}
export interface DiaryEntry {
    at: string;
    text: string;
    sessionId?: string;
}
export interface Watch {
    id: string;
    topic: string;
    prompt?: string;
    scheduleId?: string | null;
    enabled: boolean;
    at: string;
}
export interface MemoryRow {
    id: string;
    text: string;
    at?: string;
    importance?: number;
    category?: string;
    activation: number | null;
    freshKind: 'fact' | 'dated' | 'recorded' | 'unknown';
    sessionTitle: string;
}
/** 日历连接器 /api/day 的事件行（mino-connector-calendar 自己的公开面）。 */
export interface CalEvent {
    summary: string;
    /** 'YYYY-MM-DD HH:MM' 或 'YYYY-MM-DD'（allDay）。 */
    start: string;
    end: string;
    location: string;
    allDay: boolean;
}
/** mino-brief /api/prefs 的槽位行（早晚报插件自己的公开面）。 */
export interface BriefSlot {
    slot: 'morning' | 'evening' | string;
    title: string;
    enabled: boolean;
    hasEntry: boolean;
    time: string;
    preference: string;
}
export declare const api: {
    summary: () => Promise<Summary>;
    postItem: (title: string, kind?: FeedItem["kind"]) => Promise<{
        ok: boolean;
    }>;
    dismiss: (id: string) => Promise<{
        ok: boolean;
    }>;
    /** 真删一条动态（dismiss 只是划出视野）。 */
    deleteItem: (id: string) => Promise<{
        ok: boolean;
    }>;
    /** 卡片反馈：up/down 留信号；not_interested 顺带划掉。 */
    feedback: (id: string, signal: "up" | "down" | "not_interested") => Promise<{
        ok: boolean;
    }>;
    /** 「调整卡片」自由文本：生成方按 source 取回并折进下次产出。 */
    adjust: (id: string, note: string) => Promise<{
        ok: boolean;
    }>;
    /** 置顶开关。 */
    setPin: (id: string, pinned: boolean) => Promise<{
        ok: boolean;
        pinned: boolean;
    }>;
    /** 标已读：单条或全部。 */
    markRead: (id?: string) => Promise<{
        ok: boolean;
    }>;
    /** 定时任务暂停/恢复（id + 目标状态）。 */
    setScheduleActive: (id: string, active: boolean) => Promise<{
        ok: boolean;
    }>;
    diaries: () => Promise<{
        ok: boolean;
        dates: DiaryListRow[];
    }>;
    diary: (date: string) => Promise<{
        ok: boolean;
        date: string;
        entries: DiaryEntry[];
    }>;
    addDiary: (text: string, date?: string) => Promise<{
        ok: boolean;
        date: string;
    }>;
    deleteDiaryEntry: (date: string, at: string) => Promise<{
        ok: boolean;
    }>;
    /** 追踪中的主题（live widget 对应物）。 */
    watches: () => Promise<{
        ok: boolean;
        watches: Watch[];
    }>;
    /** 撤掉一条追踪（连它的定时日程一起）。 */
    deleteWatch: (id: string) => Promise<{
        ok: boolean;
    }>;
    /** fish-memory 自己的路由；插件不在 → fetch 抛错，由调用方转「未安装」态。 */
    memoryList: () => Promise<{
        ok: boolean;
        sessions: {
            id: string;
            title?: string;
            memories: Omit<MemoryRow, "sessionTitle">[];
        }[];
    }>;
    /** 日历连接器自己的路由（日程进展卡数据源）；插件不在 → 404 由调用方转「隐藏」态。 */
    calendarDay: (date: string) => Promise<{
        ok: boolean;
        date: string;
        events: CalEvent[];
    }>;
    /** mino-brief 自己的路由（候简报行数据源）；插件不在 → 404 由调用方转「隐藏」态。 */
    briefPrefs: () => Promise<{
        ok: boolean;
        slots: BriefSlot[];
    }>;
};
