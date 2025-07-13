import { LRUBounceCache } from '../src/lru-bounce-cache';

describe('LRUBounceCache Benchmark', () => {
  const cacheWithObject = new LRUBounceCache<number>();
  const cacheWithMap = new LRUBounceCache<number>();

  const iterations = 100000;

  it('benchmarks set with object', () => {
    const start = Date.now();
    for (let i = 0; i < iterations; i++) {
      cacheWithObject.set(`key${i}`, i);
    }
    const end = Date.now();
    console.log(`

    Set with object: ${end - start}ms

`);
  });

  it('benchmarks set with map', () => {
    const start = Date.now();
    for (let i = 0; i < iterations; i++) {
      cacheWithMap.set(`key${i}`, i);
    }
    const end = Date.now();
    console.log(`

    Set with map: ${end - start}ms

`);
  });

  it('benchmarks get with object', () => {
    for (let i = 0; i < iterations; i++) {
      cacheWithObject.set(`key${i}`, i);
    }
    const start = Date.now();
    for (let i = 0; i < iterations; i++) {
      cacheWithObject.get(`key${i}`);
    }
    const end = Date.now();
    console.log(`

    Get with object: ${end - start}ms

`);
  });

  it('benchmarks get with map', () => {
    for (let i = 0; i < iterations; i++) {
      cacheWithMap.set(`key${i}`, i);
    }
    const start = Date.now();
    for (let i = 0; i < iterations; i++) {
      cacheWithMap.get(`key${i}`);
    }
    const end = Date.now();
    console.log(`

    Get with map: ${end - start}ms

`);
  });
});
