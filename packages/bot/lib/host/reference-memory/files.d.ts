/** Managed files never follow existing symlinks, including ancestor directories. */
export declare function safeDirectory(path: string, create?: boolean): Promise<string>;
export declare function contained(root: string, child: string): string;
export declare function checkedFile(path: string, maxBytes: number): Promise<string | undefined>;
