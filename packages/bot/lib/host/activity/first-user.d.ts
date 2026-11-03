declare module '@deepseek-ai/dsh-session-projection/types' {
    interface SessionProjectionStateMap {
        dshBotFirstUserPreview: string | null;
    }
}
/** A bounded Host-only projection: public registry materialization restores its
 * state, and complete future events advance it without direct history reads.
 * null means no human message; an empty string remembers image-only input.
 */
export declare const firstUserProjection: {
    key: "dshBotFirstUserPreview";
    stateVersion: number;
    stateSchema: import("zod").ZodNullable<import("zod").ZodString>;
    init: () => null;
    apply: (state: string | null, event: import("@deepseek-ai/dsh-session").SessionEvent) => string | null;
};
