/** Enumerate every managed generation, including unreferenced interrupted stages. No external backup discovery. */
export declare function managedGraphFiles(root: string): Promise<Array<{
    path: string;
    size: number;
    mtime: number;
}>>;
export declare function eraseManagedGraphs(root: string): Promise<void>;
