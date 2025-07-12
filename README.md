lru-bounce-cache
================

LRU Cache with O(1) access

## Usage

```javascript
const LRUBounceCache = require('lru-bounce-cache');
const cache = new LRUBounceCache({ max_items: 1000, buffer_count: 2 });

cache.set('f', 1000);
cache.get('f');
```

## Description

This library will maintain `buffer_count` maps of the `max_items` maximum
length.

A set will always write to the most recent buffer.  If that buffer is full,
it will also allocate a new empty buffer as the most recent on buffer.
This will evict the oldest buffer.

Gets search all buffers to find the item.  If an item is found in not the most
recent buffer, it writes to the most recent buffer.  If a get causes a write
it might also cause an exict according to the set behavior.

The maximum number of cached items is `max_items * buffer_count - 1`.
