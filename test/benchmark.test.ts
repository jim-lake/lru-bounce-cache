import { expect } from 'chai';

// Helper function to generate random strings
const generateRandomString = (length: number): string => {
  let result = '';
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

// Helper function to generate random numbers
const generateRandomNumber = (): number => Math.random() * 100000;

// Implementation with Object
interface ObjectCache<T> {
  length: number;
  map: { [key: string]: T };
}

class LRUWithObject<S, T> {
  private _options: { buffer_count?: number; max_items?: number };
  private _hit_count: number;
  private _miss_count: number;
  private _cache_list: ObjectCache<T>[];

  constructor(options?: { buffer_count?: number; max_items?: number }) {
    this._options = { buffer_count: 2, max_items: 1000, ...options };
    this._hit_count = 0;
    this._miss_count = 0;
    this._cache_list = [];
    for (let i = 0; i < this._options.buffer_count!; ++i) {
      this._cache_list.push({
        length: 0,
        map: {},
      });
    }
  }

  public get(key: S): T | undefined {
    let ret: T | undefined;
    for (let i = 0; i < this._cache_list.length; i++) {
      const cache = this._cache_list[i];
      if (key in cache.map) {
        ret = cache.map[key as any];
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
  }

  public set(key: S, value: T): void {
    if (!(key in this._cache_list[0].map)) {
      this._cache_list[0].length++;
    }
    this._cache_list[0].map[key as any] = value;
    if (this._cache_list[0].length >= this._options.max_items!) {
      for (let i = 0; i < this._cache_list.length - 1; ++i) {
        this._cache_list[i + 1] = this._cache_list[i];
      }
      this._cache_list[0] = {
        length: 0,
        map: {},
      };
    }
  }

  public hitRate(): number {
    const total = this._hit_count + this._miss_count;
    return total > 0 ? this._hit_count / total : 0;
  }
}

// Implementation with Map
interface MapCache<T> {
  map: Map<string, T>;
}

class LRUWithMap<S, T> {
  private _options: { buffer_count?: number; max_items?: number };
  private _hit_count: number;
  private _miss_count: number;
  private _cache_list: MapCache<S, T>[];

  constructor(options?: { buffer_count?: number; max_items?: number }) {
    this._options = { buffer_count: 2, max_items: 1000, ...options };
    this._hit_count = 0;
    this._miss_count = 0;
    this._cache_list = [];
    for (let i = 0; i < this._options.buffer_count!; ++i) {
      this._cache_list.push({
        map: new Map(),
      });
    }
  }

  public get(key: S): T | undefined {
    let ret: T | undefined;
    for (let i = 0; i < this._cache_list.length; i++) {
      const cache = this._cache_list[i];
      if (cache.map.has(key)) {
        ret = cache.map.get(key);
        if (i > 0) {
          this.set(key, ret!);
        }
        this._hit_count++;
        break;
      }
    }
    if (ret === undefined) {
      this._miss_count++;
    }
    return ret;
  }

  public set(key: S, value: T): void {
    this._cache_list[0].map.set(key, value);
    if (this._cache_list[0].map.size >= this._options.max_items!) {
      for (let i = 0; i < this._cache_list.length - 1; ++i) {
        this._cache_list[i + 1] = this._cache_list[i];
      }
      this._cache_list[0] = {
        map: new Map(),
      };
    }
  }

  public hitRate(): number {
    const total = this._hit_count + this._miss_count;
    return total > 0 ? this._hit_count / total : 0;
  }
}

describe('LRUBounceCache Benchmark', () => {
  const iterations = 10000;
  const keyLength = 16;
  const initialPopulation = 5000;

  const generateRandomKeys = (count: number): string[] => {
    const keys = new Set<string>();
    while (keys.size < count) {
      keys.add(generateRandomString(keyLength));
    }
    return Array.from(keys);
  };

  const existingKeys = generateRandomKeys(initialPopulation);
  const missingKeys = generateRandomKeys(iterations); // For cache misses

  const runGetBenchmark = (cache: any, targetHitRate: number) => {
    // Pre-populate the cache
    for (const key of existingKeys) {
      cache.set(key, generateRandomNumber());
    }

    const getsToPerform: string[] = [];
    const hitCount = Math.floor(iterations * targetHitRate);
    const missCount = iterations - hitCount;

    // Add keys that will hit
    for (let i = 0; i < hitCount; i++) {
      getsToPerform.push(
        existingKeys[Math.floor(Math.random() * existingKeys.length)]
      );
    }
    // Add keys that will miss
    for (let i = 0; i < missCount; i++) {
      getsToPerform.push(missingKeys[i]);
    }

    // Shuffle the operations for randomness
    for (let i = getsToPerform.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [getsToPerform[i], getsToPerform[j]] = [
        getsToPerform[j],
        getsToPerform[i],
      ];
    }

    const start = Date.now();
    for (const key of getsToPerform) {
      cache.get(key);
    }
    const end = Date.now();

    console.log(`      Get Performance: ${end - start}ms`);
    console.log(`      Target Hit Rate: ${targetHitRate * 100}%`);
    console.log(
      `      Actual Hit Rate: ${(cache.hitRate() * 100).toFixed(2)}%\n`
    );
  };

  const runSetBenchmark = (cache: any) => {
    const keys = generateRandomKeys(iterations);
    const start = Date.now();
    for (let i = 0; i < iterations; i++) {
      cache.set(keys[i], generateRandomNumber());
    }
    const end = Date.now();
    console.log(`      Set Performance: ${end - start}ms\n`);
  };

  describe('LRUWithObject', () => {
    it('benchmarks set with random keys', () => {
      const cache = new LRUWithObject<string, number>({
        max_items: initialPopulation * 2,
      });
      runSetBenchmark(cache);
    });

    [0.1, 0.5, 0.9].forEach((hitRate) => {
      it(`benchmarks get with ${hitRate * 100}% target hit rate`, () => {
        const cache = new LRUWithObject<string, number>({
          max_items: initialPopulation * 2,
        });
        runGetBenchmark(cache, hitRate);
      });
    });
  });

  describe('LRUWithMap', () => {
    it('benchmarks set with random keys', () => {
      const cache = new LRUWithMap<string, number>({
        max_items: initialPopulation * 2,
      });
      runSetBenchmark(cache);
    });

    [0.1, 0.5, 0.9].forEach((hitRate) => {
      it(`benchmarks get with ${hitRate * 100}% target hit rate`, () => {
        const cache = new LRUWithMap<string, number>({
          max_items: initialPopulation * 2,
        });
        runGetBenchmark(cache, hitRate);
      });
    });
  });
});
