/** Persistent radix tree: a commit copies at most eight 16-way nodes, never all live records. */
type Node<V> = {
    readonly children?: readonly (Node<V> | undefined)[];
    readonly items?: readonly [string, V][];
};
export declare class PersistentMap<V> implements ReadonlyMap<string, V> {
    private readonly root?;
    readonly size: number;
    constructor(root?: Node<V> | undefined, size?: number);
    get(key: string): V | undefined;
    has(key: string): boolean;
    with(key: string, value: V): PersistentMap<V>;
    without(key: string): PersistentMap<V>;
    entries(): MapIterator<[string, V]>;
    keys(): MapIterator<string>;
    values(): MapIterator<V>;
    [Symbol.iterator](): MapIterator<[string, V]>;
    readonly [Symbol.toStringTag] = "PersistentMap";
    forEach(callback: (value: V, key: string, map: ReadonlyMap<string, V>) => void, thisArg?: unknown): void;
    set(): never;
    delete(): never;
    clear(): never;
}
export declare class PersistentSet implements ReadonlySet<string> {
    private readonly map;
    constructor(map?: PersistentMap<true>);
    get size(): number;
    has(value: string): boolean;
    with(value: string): PersistentSet;
    values(): SetIterator<string>;
    keys(): SetIterator<string>;
    entries(): SetIterator<[string, string]>;
    [Symbol.iterator](): SetIterator<string>;
    readonly [Symbol.toStringTag] = "PersistentSet";
    forEach(callback: (value: string, key: string, set: ReadonlySet<string>) => void, thisArg?: unknown): void;
    add(): never;
    delete(): never;
    clear(): never;
}
export {};
