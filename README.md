**This project is a work in progress. It might not be very useful to anyone in this state.**

# tiny-toatie-cache

This library is designed to cache search operations performed against a [Node.js Buffer](https://nodejs.org/api/buffer.html#buffer_buffer). The maximum size of the underlying storage Buffer is bounded to a fixed value (specified on insantiatation). New data is *appended to the front* and if the upper size limit is hit, the *oldest items will be deleted from the back*.

## Use case

This is made for an experimental implementation of LZ77, a streaming compression algorithm. It's often called a 'Streaming' because each compression packet can be decompressed in sequential order and the next chunk of clear text data will be produced. Some compression algorithms must decompress the entire stream of compression packets before they can get at any of the clear text data. The LZ77 compression algorithm also doesn't need to be distributed with a static dictionary, it performs search operations against a *sliding window* which fulfils an equivalent role of a dictionary.

I wrote a [prototype of LZ77](https://github.com/spacekitcat/prototype-libz77) and after finally creating something reliable, I found the performance, both in terms of speed and compression, to be quite horrific. The main problem is that the dictionary buffer needs to be in the region of 2 Megabytes (2048000 Bytes) for good space savings, but that means almost 2048000 comparisons every time it has to find the next RLE. In the worst case scenario, LZ77 could have to perform a full search operation across the entire history buffer for every single byte in its input stream. Without any sort of optimization, my prototype is `O(n^2)`. The dictionary size it uses is much more modest than dictionary size I specified above and it performs frustratingly bad.

I originally spent time looking for a data structure to represent the history buffer. My naive stab at solution would be some sort of tree with an insertion performance of `O(1)` and a lookup performance of `O(log(N))` (`O(N log(N))` in context). The big problem with a tree is the sheer size of the input streams it needs to handle (have a think about how big a file of 2048000 bytes (or 2MB) actually is if you process it a byte at a time) which will almost always lead you to hitting the dictionary size. You cannot exceed the dictionary size without both data integrity (the decompressor needs to use the same value as the compressor) and memory space issues. With a tree like structure, you'd either need something with a very complex purging mechanism or you have to rebuild the tree constantly.

Caching will hopefully prove simple and fast with low housekeeping overhead, but it's ultimately just a research project.

## Technical design

The library uses [cloakroom-smart-buffer-proxy](https://www.npmjs.com/package/cloakroom-smart-buffer-proxy) (created specifically for this library) behind the scenes as a sort of bookeeper.

## Building

```javascript
/tiny-toatie-cache <master> % yarn install
/tiny-toatie-cache <master> % yarn build
```

## Unit tests

The unit tests use Jest and the Yarn command below runs them.

```bash
/tiny-toatie-cache ‹master*› % yarn test
```

## Performance

`hit-test.js` reads, appends and then performs a search for words read sequntially from a text file. When the test completes, it summarises the number of words processed, how often it hits, misses and the average time took for each operation type.

```bash
tiny-toatie-cache ‹master*› % npx jest __tests__/performance/


 PASS  __tests__/performance/hit-test.performance.js
  A spectre haunts Europe, the spectre of communism
    ✓ hit/miss efficiency test (2ms)

Test Suites: 1 passed, 1 total
Tests:       1 passed, 1 total
Snapshots:   0 total
Time:        1.256s
Ran all test suites matching /__tests__\/performance\//i.
Jest did not exit one second after the test run has completed.

This usually means that there are asynchronous operations that weren't stopped in your tests. Consider running Jest with `--detectOpenHandles` to troubleshoot this issue.
  console.log __tests__/performance/hit-test.performance.js:52
    Word count:  12933

  console.log __tests__/performance/hit-test.performance.js:53
    Miss count:  4414

  console.log __tests__/performance/hit-test.performance.js:54
    Miss operation avg. time:  4.881966470321704

  console.log __tests__/performance/hit-test.performance.js:55
    Hit count:  8519

  console.log __tests__/performance/hit-test.performance.js:56
    Hit operation avg. time:  0.0036389247564268105
```
