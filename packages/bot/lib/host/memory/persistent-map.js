function hash(key) {
    let h = 2166136261;
    for (let i = 0; i < key.length; i++)
        h = Math.imul(h ^ key.charCodeAt(i), 16777619);
    return h >>> 0;
}
function edit(node, key, value, remove, h, depth = 0) {
    if (depth === 8) {
        const items = (node?.items ?? []).filter(([k]) => k !== key);
        if (!remove)
            items.push([key, value]);
        items.sort(([a], [b]) => a.localeCompare(b));
        return Object.freeze({ items: Object.freeze(items.map(item => Object.freeze(item))) });
    }
    const index = (h >>> (depth * 4)) & 15, children = [...(node?.children ?? [])];
    children[index] = edit(children[index], key, value, remove, h, depth + 1);
    return Object.freeze({ children: Object.freeze(children) });
}
function* entries(node) {
    if (node?.items)
        for (const [key, value] of node.items)
            yield [key, value];
    if (node?.children)
        for (const child of node.children)
            yield* entries(child);
}
export class PersistentMap {
    root;
    size;
    constructor(root, size = 0) {
        this.root = root;
        this.size = size;
        Object.freeze(this);
    }
    get(key) {
        const h = hash(key);
        let node = this.root;
        for (let depth = 0; depth < 8 && node; depth++)
            node = node.children?.[(h >>> (depth * 4)) & 15];
        return node?.items?.find(([k]) => k === key)?.[1];
    }
    has(key) { return this.get(key) !== undefined; }
    with(key, value) {
        return new PersistentMap(edit(this.root, key, value, false, hash(key)), this.size + Number(!this.has(key)));
    }
    without(key) {
        return this.has(key) ? new PersistentMap(edit(this.root, key, undefined, true, hash(key)), this.size - 1) : this;
    }
    entries() { return entries(this.root); }
    *keys() { for (const [key] of this)
        yield key; }
    *values() { for (const [, value] of this)
        yield value; }
    [Symbol.iterator]() { return this.entries(); }
    [Symbol.toStringTag] = 'PersistentMap';
    forEach(callback, thisArg) {
        for (const [key, value] of this)
            callback.call(thisArg, value, key, this);
    }
    set() { throw new Error('Published memory snapshot is immutable'); }
    delete() { throw new Error('Published memory snapshot is immutable'); }
    clear() { throw new Error('Published memory snapshot is immutable'); }
}
export class PersistentSet {
    map;
    constructor(map = new PersistentMap()) {
        this.map = map;
        Object.freeze(this);
    }
    get size() { return this.map.size; }
    has(value) { return this.map.has(value); }
    with(value) { return new PersistentSet(this.map.with(value, true)); }
    values() { return this.map.keys(); }
    keys() { return this.values(); }
    *entries() { for (const value of this)
        yield [value, value]; }
    [Symbol.iterator]() { return this.values(); }
    [Symbol.toStringTag] = 'PersistentSet';
    forEach(callback, thisArg) {
        for (const value of this)
            callback.call(thisArg, value, value, this);
    }
    add() { throw new Error('Published memory snapshot is immutable'); }
    delete() { throw new Error('Published memory snapshot is immutable'); }
    clear() { throw new Error('Published memory snapshot is immutable'); }
}
//# sourceMappingURL=persistent-map.js.map
export const DSH_BOT_MODULE_VERSION = '0.6.3';
