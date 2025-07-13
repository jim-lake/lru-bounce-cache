interface Options {
    buffer_count?: number;
    max_items?: number;
}
export declare class LRUBounceCache<S, T> {
    private _options;
    private _hit_count;
    private _miss_count;
    private _cache_list;
    constructor(options?: Options);
    get(key: S): T | undefined;
    set(key: S, value: T): void;
    hitRate(): number;
}
export {};
