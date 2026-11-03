import type { NotificationPolicy } from '../../shared/integrations.js';
export declare function localTime(at: number, timezone: string): {
    day: string;
    time: string;
};
export declare function quietAt(at: number, p: Pick<NotificationPolicy, 'quietHours' | 'timezone'>): boolean;
