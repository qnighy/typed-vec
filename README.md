## TypedVec: unbounded-resizable TypedArray

TypedVec is an unbounded-resizable version of JS TypedArray (such as Uint8Array).

## Difference from ES2024 [Resizable ArrayBuffer](https://github.com/tc39/proposal-resizablearraybuffer)

TypedVec is **unbounded**-resizable, meaning that you don't need to specify the maximum size of the array in advance. On the other hand, Resizable ArrayBuffer requires an upper bound on initialization to reserve virtual memory space (while the corresponding physical memory or swap is typically allocated only when needed).

## Performance

It comes with two different flavors: the full version and the fast version.

|Type|Read Access|Write Access|Implements
|---|---|---|---|
|Full|`a[i]` or<br>`a.getElement(i)`|`a[i] = x` or<br>`a.setElement(i, x)`|ArrayLike and Iterable|
|Fast|`a.getElement(i)`|`a.setElement(i, x)`|Iterable|

From a very basic benchmark, the estimated performance is as follows:

- Original TypedArray: 1x slower (baseline)
- Fast version, via `getElement` and `setElement`: **1.4x slower**
- Full version, via `getElement` and `setElement`: **14x slower**
- Full version, via `a[i]` and `a[i] = x`: **60x slower**

This is because, in the full version, every property access goes throgh a proxy with Number parsing, which is indeed slow as it is implemented in pure JS.

Additionally, in full version, `Object.preventExtensions(a)` might be surprisingly heavy, as it needs to realize all the elements in the array as properties.
