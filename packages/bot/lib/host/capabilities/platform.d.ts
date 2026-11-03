import type { Context } from '@deepseek-ai/cordis';
/** Observe only public optional service facts. Registration is not proof of tool ownership or execution. */
export declare function platformCapabilities(ctx: Context): {
    browser: {
        toolBridge: false;
        provider?: string | undefined;
    };
    voice: {
        available: boolean;
        selectedProvider?: string;
        providers: {
            id: string;
            name: string;
            phase: string;
        }[];
    };
};
