exports.LRUBounceCache = LRUBounceCache;

const DEFAULT_OPTIONS = {
  buffer_count: 2,
  max_items: 1000,
};

function LRUBounceCache(options) {
  if (this instanceof LRUBounceCache) {
    this._options = Object.assign({}, DEFAULT_OPTIONS, options);
    this._hit_count = 0;
    this._miss_count = 0;

    this._cache_list = [];
    for (let i = 0; i < this._options.buffer_count; ++i) {
      this._cache_list.push({
        length: 0,
        map: {},
      });
    }
  } else {
    return new LRUBounceCache(options);
  }
}

LRUBounceCache.prototype.get = function (key) {
  let ret;
  for (let i = 0; i < this._cache_list.length; i++) {
    const cache = this._cache_list[i];
    if (key in cache.map) {
      ret = cache.map[key];
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
  if (!(key in this._cache_list[0].map)) {
    this._cache_list[0].length++;
  }
  this._cache_list[0].map[key] = value;

  if (this._cache_list[0].length >= this._options.max_items) {
    for (let i = 0; i < this._cache_list.length - 1; ++i) {
      this._cache_list[i + 1] = this._cache_list[i];
    }
    this._cache_list[0] = {
      length: 0,
      map: {},
    };
  }
};

LRUBounceCache.prototype.hit_rate = function () {
  const total = this._hit_count + this._miss_count;
  let ret = 0;
  if (total > 0) {
    ret = this._hit_count / total;
  }
  return ret;
};
LRUBounceCache.prototype.hitRate = LRUBounceCache.prototype.hit_rate;
