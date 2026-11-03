/** Check unparsed text first so validation failures cannot echo secrets. */
export declare function rejectMemorySecrets(input: {
    content?: unknown;
    tags?: unknown;
}): void;
export declare const rejectModelSecrets: typeof rejectMemorySecrets;
