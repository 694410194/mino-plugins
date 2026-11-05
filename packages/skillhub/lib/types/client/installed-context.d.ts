/** A monotonic read context prevents A → B → A from reviving earlier scans. */
export declare function installedContext(read: () => {
    scope: unknown;
    cwd: string | undefined;
    active: boolean;
}, subscribe: (listener: () => void) => () => void): {
    getSnapshot: () => number;
    subscribe: (listener: () => void) => () => void;
};
