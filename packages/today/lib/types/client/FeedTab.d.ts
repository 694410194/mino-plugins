import { type ScheduleCard, type Summary } from './api.ts';
import type { TodayActions, TodayPageProps, Translate } from './TodayPage.tsx';
/** 定时任务列表：今日页 strip 与任务页「定时任务」段共用。limit=预览条数（对齐 day-in-progress 的 3+more）。 */
export declare function ScheduleList({ cards, t, onChanged, limit }: {
    cards: ScheduleCard[];
    t: Translate;
    onChanged: () => void;
    limit?: number;
}): import("react").JSX.Element;
export declare function FeedTab({ t, summary, onChanged, actions, renderSlot }: {
    t: Translate;
    summary: Summary | null;
    onChanged: () => void;
    actions: TodayActions;
    renderSlot?: TodayPageProps['renderSlot'];
}): import("react").JSX.Element;
