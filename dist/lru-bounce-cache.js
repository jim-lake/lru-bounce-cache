"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LRUBounceCache = void 0;
var DEFAULT_OPTIONS = {
    buffer_count: 2,
    max_items: 1000,
};
var LRUBounceCache = /** @class */ (function () {
    function LRUBounceCache(options) {
        this._options = __assign(__assign({}, DEFAULT_OPTIONS), options);
        this._hit_count = 0;
        this._miss_count = 0;
        this._cache_list = [];
        for (var i = 0; i < this._options.buffer_count; ++i) {
            this._cache_list.push({
                map: new Map(),
            });
        }
    }
    LRUBounceCache.prototype.get = function (key) {
        var ret;
        for (var i = 0; i < this._cache_list.length; i++) {
            var cache = this._cache_list[i];
            if (cache.map.has(key)) {
                ret = cache.map.get(key);
                if (i > 0) {
                    this.set(key, ret);
                }
                this._hit_count++;
                break;
            }
        }
        if (ret === undefined) {
            this._miss_count++;
        }
        return ret;
    };
    LRUBounceCache.prototype.set = function (key, value) {
        this._cache_list[0].map.set(key, value);
        if (this._cache_list[0].map.size >= this._options.max_items) {
            for (var i = 0; i < this._cache_list.length - 1; ++i) {
                this._cache_list[i + 1] = this._cache_list[i];
            }
            this._cache_list[0] = {
                map: new Map(),
            };
        }
    };
    LRUBounceCache.prototype.hitRate = function () {
        var total = this._hit_count + this._miss_count;
        var ret = 0;
        if (total > 0) {
            ret = this._hit_count / total;
        }
        return ret;
    };
    return LRUBounceCache;
}());
exports.LRUBounceCache = LRUBounceCache;
