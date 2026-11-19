/** 卡片底部的建议按钮：点一下把 prompt 发回给写卡片的会话。 */
export interface Suggestion {
    label: string;
    prompt: string;
}
/** 结构化卡体（自有 schema 枚举，不抄 Today manifest 字段名）：标题/正文之外的可视化载体。 */
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
/** 「今日」动态卡片。kind: note=随手记 / result=做完的事 / moment=值得留意。 */
export interface FeedItem {
    id: string;
    kind: 'note' | 'result' | 'moment';
    title: string;
    body?: string;
    at: string;
    sessionId?: string;
    /** 来源小标签（会话、定时任务、随手记…），卡片右上角 chip。 */
    source?: string;
    suggestions?: Suggestion[];
    dismissed?: boolean;
    /** 生成方给的批次标签（如「早报」「晚报」）；同批卡片在 feed 里并成一组。 */
    batchId?: string;
    /** 生成批次的语义类别（Today 同款：morning_brief/evening_brief/diary 等）——决定批次标题与氛围，不传就用 batchId 原文。 */
    batchKind?: string;
    /** 用户置顶——组内排在最前。 */
    pinned?: boolean;
    /** 用户反馈信号；not_interested 同时意味着划掉。 */
    feedback?: 'up' | 'down' | 'not_interested';
    /** 「调整卡片」自由文本（Today briefFeedback.adjust 语义）：生成方按 source 聚合读取。 */
    adjustNotes?: string[];
    /** 结构化卡体；缺省就是普通文字卡。 */
    card?: FeedCard;
    /** 已读标记（ISO 时间）；缺省=未读，卡片上有未读点。 */
    read?: string;
}
/** 「关注 X」追踪：用户点名的长期关注主题，绑一条宿主 schedule 定时去查。 */
export interface Watch {
    id: string;
    topic: string;
    prompt: string;
    /** 宿主 schedule 条目 id（schedule 服务缺失时为空——只记不跑）。 */
    scheduleId?: string;
    at: string;
    enabled: boolean;
}
export interface DiaryEntry {
    at: string;
    text: string;
    sessionId?: string;
}
export interface Diary {
    entries: DiaryEntry[];
    updatedAt: string;
}
export interface Store {
    items: FeedItem[];
    diaries: Record<string, Diary>;
    watches: Watch[];
}
export declare function loadStore(): Store;
export declare function saveStore(store: Store): void;
/** 本地日期键 YYYY-MM-DD（日记按本地日子归档）。 */
export declare function dayKey(date: Date): string;
/** 加一张动态卡片，返回它的 id。 */
export declare function addItem(store: Store, item: Omit<FeedItem, 'id' | 'at'> & {
    at?: string;
}): FeedItem;
/** 往某天的日记追加一条。date 缺省/非法时归今天。 */
export declare function addDiaryEntry(store: Store, date: string | undefined, text: string, sessionId?: string): {
    date: string;
    entry: DiaryEntry;
};
/** 删掉某天日记里的一条（按 at 精确匹配）。 */
export declare function deleteDiaryEntry(store: Store, date: string, at: string): boolean;
/** 登记一条「关注」追踪，返回它的 id。 */
export declare function addWatch(store: Store, watch: Omit<Watch, 'id' | 'at'>): Watch;
/** 按 id 摘一条 watch（返回被摘的，方便拿 scheduleId 去删宿主条目）。 */
export declare function removeWatch(store: Store, id: string): Watch | undefined;
