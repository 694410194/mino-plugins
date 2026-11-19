/**
 * `today_post` 的会话内工具结果卡——走官方 `tool.call.toolview` keyed 槽。
 * 只消费 owner props 里的 argsRaw / content，不读 mino-today 私有 store，
 * 与 feed 卡片样式独立（会话内是紧凑行，不是整卡）。
 */
import type { Translate } from './TodayPage.tsx';
/** `tool.call.toolview` owner props 的结构面（官方 ToolCallOwnerProps 的最小子集）。 */
export interface ToolViewProps {
    phase: 'preparing' | 'start' | 'result';
    block: {
        argsRaw?: string;
        call?: {
            name: string;
            argsRaw: string;
        } | null;
        isError?: boolean;
        content?: readonly {
            type: string;
            text?: string;
        }[];
    };
    t: Translate;
}
export declare function TodayPostRow(props: ToolViewProps): JSX.Element;
