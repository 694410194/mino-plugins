/** 同源 API 薄封装（mino-brief 自有路由）。 */
export interface PrefsSlot {
    slot: 'morning' | 'evening';
    title: string;
    enabled: boolean;
    hasEntry: boolean;
    time: string;
    preference: string;
}
export declare const api: {
    prefs: () => Promise<{
        ok: boolean;
        slots: PrefsSlot[];
    }>;
    savePrefs: (body: {
        slot: string;
        preference?: string;
        enabled?: boolean;
        time?: string;
    }) => Promise<{
        ok: boolean;
    }>;
};
