
import { expect } from 'chai';
import { LRUBounceCache } from '../src/index';

describe('LRUBounceCache', () => {
  it('should be able to set and get a value', () => {
    const cache = new LRUBounceCache<number>();
    cache.set('key', 123);
    expect(cache.get('key')).to.equal(123);
  });

  it('should return undefined for a key that does not exist', () => {
    const cache = new LRUBounceCache<number>();
    expect(cache.get('non-existent-key')).to.be.undefined;
  });

  it('should have a hit rate of 1.0 after one hit', () => {
    const cache = new LRUBounceCache<number>();
    cache.set('key', 123);
    cache.get('key');
    expect(cache.hit_rate()).to.equal(1.0);
  });

  it('should have a hit rate of 0.0 after one miss', () => {
    const cache = new LRUBounceCache<number>();
    cache.get('key');
    expect(cache.hit_rate()).to.equal(0.0);
  });

  it('should have a hit rate of 0.5 after one hit and one miss', () => {
    const cache = new LRUBounceCache<number>();
    cache.set('key', 123);
    cache.get('key');
    cache.get('missing-key');
    expect(cache.hit_rate()).to.equal(0.5);
  });

  it('should evict the least recently used item when the cache is full', () => {
    const cache = new LRUBounceCache<number>({ max_items: 3 });

    cache.set('a', 1);
    cache.set('b', 2);
    cache.set('c', 3);

    // At this point, the primary cache is full.
    // The next set should cause a bounce.

    cache.set('d', 4);

    // The primary cache should now contain only 'd'.
    // The secondary cache should contain 'a', 'b', and 'c'.

    expect(cache.get('a')).to.equal(1);
    expect(cache.get('b')).to.equal(2);
    expect(cache.get('c')).to.equal(3);
    expect(cache.get('d')).to.equal(4);

    // Now, let's access 'a' to move it to the primary cache.
    cache.get('a');

    // Let's add another item to trigger another bounce.
    cache.set('e', 5);

    // Now, 'b' should be evicted.
    expect(cache.get('b')).to.be.undefined;
  });
});
