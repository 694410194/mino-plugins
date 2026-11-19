/** mino-brief 文案键（Today briefEditor 的 zh 原文对齐；英文 sentence case）。 */
export declare const zh: {
    readonly 'editor.title': "编辑早晚报";
    readonly 'editor.morning': "早报";
    readonly 'editor.evening': "晚报";
    readonly 'editor.desc.morning': "结合你的日程、待办和近期关注，梳理今天的重要安排、需要提前准备的事，以及值得留意的新信息，帮你更从容地开始一天。";
    readonly 'editor.desc.evening': "回顾今天重要事项的进展与尚未解决的问题，结合你的工作和学习提供复盘建议与新思路，并提醒明天需要提前准备的事。";
    readonly 'editor.preferenceLabel': "内容偏好";
    readonly 'editor.preferencePlaceholder': "添加你关注的内容和呈现偏好";
    readonly 'editor.pushEnabled': "开启推送";
    readonly 'editor.pushTime': "推送时间";
    readonly 'editor.dailyAt': "每天 {time}";
    readonly 'editor.save': "保存更改";
    readonly 'editor.saving': "保存中…";
    readonly 'editor.saved': "已保存，从下一次{name}起生效";
    readonly 'editor.failed': "保存失败，修改已保留";
    readonly 'editor.loading': "正在加载早晚报设置";
    readonly 'editor.loadFailed': "无法读取早晚报设置，请稍后重试。";
    readonly 'editor.retry': "重试";
    readonly 'editor.empty': "暂无可编辑的早晚报。";
};
export type CopyKey = keyof typeof zh;
export declare const en: Record<CopyKey, string>;
