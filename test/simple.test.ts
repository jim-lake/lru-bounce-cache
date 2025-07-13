import { expect } from 'chai';
import { LRUBounceCache } from '../dist/lru-bounce-cache.js';

describe('LRUBounceCache', () => {
  it('should be able to set and get a value', () => {
    const cache = new LRUBounceCache<number>();
    cache.set('key', 123);
    expect(cache.get('key')).to.equal(123);
  });

  it('should return undefined for a key that does not exist', () => {
    const cache = new LRUBounceCache<number>();
    expect(cache.get('non-existent-key')).to.equal(undefined);
  });

  it('should have a hit rate of 1.0 after one hit', () => {
    const cache = new LRUBounceCache<number>();
    cache.set('key', 123);
    cache.get('key');
    expect(cache.hitRate()).to.equal(1.0);
  });

  it('should have a hit rate of 0.0 after one miss', () => {
    const cache = new LRUBounceCache<number>();
    cache.get('key');
    expect(cache.hitRate()).to.equal(0.0);
  });

  it('should have a hit rate of 0.5 after one hit and one miss', () => {
    const cache = new LRUBounceCache<number>();
    cache.set('key', 123);
    cache.get('key');
    cache.get('missing-key');
    expect(cache.hitRate()).to.equal(0.5);
  });

  it('get bounce', () => {
    const cache = new LRUBounceCache<number>({ max_items: 3 });

    cache.set('a', 1);
    cache.set('b', 2);
    cache.set('c', 3);
    cache.set('d', 4);
    cache.set('e', 5);

    // check the top ones, this wont cause a write
    expect(cache.get('e')).to.equal(5);
    expect(cache.get('d')).to.equal(4);

    // check a get bounce
    expect(cache.get('c')).to.equal(3);

    // c bounced these out
    expect(cache.get('b')).to.equal(undefined);
    expect(cache.get('a')).to.equal(undefined);
  });

  it('set bounce', () => {
    const cache = new LRUBounceCache<number>({ max_items: 3 });

    cache.set('a', 1);
    cache.set('b', 2);
    cache.set('c', 3);
    cache.set('d', 4);
    cache.set('e', 5);

    // check the top ones, this wont cause a write
    expect(cache.get('e')).to.equal(5);
    expect(cache.get('d')).to.equal(4);

    // check a set bounce
    cache.set('f', 6);

    // f bounced these out
    expect(cache.get('c')).to.equal(undefined);
    expect(cache.get('b')).to.equal(undefined);
    expect(cache.get('a')).to.equal(undefined);
  });
});
