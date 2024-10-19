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

## Installation

To be updated.

## Usage

### Importing the classes

There are 11 concrete classes of TypedVec:

|Type|Original|Element Type|Format|
|---|---|---|---|
|Int8Vec|Int8Array|number|8-bit signed integer|
|Uint8Vec|Uint8Array|number|8-bit unsigned integer|
|Uint8ClampedVec|Uint8ClampedArray|number|8-bit unsigned integer|
|Int16Vec|Int16Array|number|16-bit signed integer|
|Uint16Vec|Uint16Array|number|16-bit unsigned integer|
|Int32Vec|Int32Array|number|32-bit signed integer|
|Uint32Vec|Uint32Array|number|32-bit unsigned integer|
|Float32Vec|Float32Array|number|32-bit IEEE floating point|
|Float64Vec|Float64Array|number|64-bit IEEE floating point|
|BigInt64Vec|BigInt64Array|bigint|64-bit signed integer|
|BigUint64Vec|BigUint64Array|bigint|64-bit unsigned integer|

Each has two flavors: fast and full. The fast version can be imported from `@qnighy/typed-vec/fast`, while the full version can be imported from `@qnighy/typed-vec/full`.

```js
// Import the fast version of Uint8Vec
import { Uint8Vec } from '@qnighy/typed-vec/fast';

// Or import the full version of Uint8Vec
import { Uint8Vec } from '@qnighy/typed-vec/full';
```

The fast version is recommended for most cases, as it is much faster than the full version.

### Creating a TypedVec

There are four ways to create a TypedVec:

- The _TypedVec_ constructor
- _TypedVec_.from method
- _TypedVec_.of method
- _TypedVec_.promoteFrom method

The first three are similar to the corresponding methods of TypedArray.

On the other hand, the _TypedVec_.promoteFrom method accepts an existing TypedArray and wraps it with TypedVec. This is useful when you want to use TypedVec methods on an existing TypedArray.

```js
// Create a Uint8Vec with 10 elements
const a = new Uint8Vec(10);

// Create a Uint8Vec from an array
const b = Uint8Vec.from([1, 2, 3, 4, 5]);

// Create a Uint8Vec from arguments
const c = Uint8Vec.of(1, 2, 3, 4, 5);

// Promote an existing Uint8Array
const d = Uint8Vec.promoteFrom(new Uint8Array(10));
```

### Converting back to TypedArray

You can use `asTypedArray()` to get a view of the whole range of the array as a TypedArray.

```js
const a = new Uint8Vec(10);
const b = a.asTypedArray();
```

This is equivalent to `.subarray()`.

Also, to access traits of each TypedArray, there are following properties:

- _TypedVec_.TypedArray: the original TypedArray class
- _TypedVec_.BYTES_PER_ELEMENT: the size of each element in bytes
- _TypedVec_.prototype.BYTES_PER_ELEMENT: the size of each element in bytes

### Accessing elements

In both fast and full versions, you can access elements with the `getElement` and `setElement` methods.

```js
const a = new Uint8Vec(10);
a.setElement(0, 42);
console.log(a.getElement(0)); // 42
```

In the full version, you can also access elements as properties, using the `[]` syntax. Note that, this is slower than using `getElement` and `setElement`.

```js
const a = new Uint8Vec(10);
a[0] = 42;
console.log(a[0]); // 42
```

### Using TypedArray methods

TypedVec implements all the methods of TypedArray, so you can use them as you would with TypedArray.

- Length and Buffer access
  - get `length`
  - get `buffer`
  - get `byteLength`
  - get `byteOffset`
- Element access
  - `at`
  - `slice`
  - `subarray`
- Update
  - `set`
  - `copyWithin`
  - `fill`
  - `reverse`
  - `sort`
- Copy and Update
  - `with`
  - `toReversed`
  - `toSorted`
- Iteration
  - `forEach`
  - `entries`
  - `keys`
  - `values`
  - `[Symbol.iterator]`
- Iteration - Predicate
  - `every`
  - `some`
  - `includes`
- Iteration - Lookup
  - `find`
  - `findLast`
  - `findIndex`
  - `findLastIndex`
  - `indexOf`
  - `lastIndexOf`
- Iteration - Mapping and Reduction
  - `map`
  - `filter`
  - `reduce`
  - `reduceRight`
  - `join`
  - `toString`
  - `toLocaleString`

Note that, array-returning methods such as `slice`, `subarray`, `with`, `toReversed`, `toSorted`, `map`, and `filter` return an instance of TypedArray, not TypedVec. Additionally, TypedVec does not support `[Symbol.species]`, unlike TypedArray.

If you want to obtain `TypedVec` again after using these methods, you need to use _TypedVec_.promoteFrom method to explicitly convert the result to TypedVec.

### Using as ArrayLike or Iterable

TypedVec implements Iterable, so you can use it in `for...of` loops or `Array.from` just like TypedArray.

```js
for (const a of Uint8Vec.from([1, 2, 3, 4, 5])) {
  console.log(a);
}
```

The full version of TypedVec also implements ArrayLike, though most APIs prefer Iterable over ArrayLike. Note that the fast version also formally implements ArrayLike, meaning that an API without Iterable support might be confused when an instance of the fast version is passed.

### Resizing methods

Those methods work similarly to the corresponding methods of `Array`.

- set `length`
- `push`
- `pop`
- `shift`
- `unshift`
- `splice`

### Size/capacity-related methods

Those methods additionally exist to operate on the size and capacity of the array.

- get `capacity`
- set `capacity`
- `ensureCapacity`
- `shrinkToFit`

```js
const a = new Uint8Vec(10);
console.log(a.capacity); // 10
a.capacity = 20;
console.log(a.capacity); // 20

a.ensureCapacity(30);
console.log(a.capacity); // 40
a.shrinkToFit();
console.log(a.capacity); // 10
```
