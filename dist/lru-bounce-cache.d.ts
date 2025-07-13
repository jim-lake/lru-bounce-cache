interface Options {
    buffer_count?: number;
    max_items?: number;
}
export declare class LRUBounceCache<T> {
    private _options;
    private _hit_count;
    private _miss_count;
    private _cache_list;
    constructor(options?: Options);
    get(key: string): T | undefined;
    set(key: string, value: T): void;
    hitRate(): number;
}
export default LRUBounceCache;
