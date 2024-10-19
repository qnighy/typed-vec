// deno-lint-ignore-file no-explicit-any

export interface TypedArray<in out T, in out ThisArray = unknown> {
  [index: number]: T;
  readonly length: number;
  readonly BYTES_PER_ELEMENT: number;
  readonly buffer: ArrayBufferLike;
  readonly byteLength: number;
  readonly byteOffset: number;
  readonly [Symbol.toStringTag]: string;
  at(index: number): T | undefined;
  copyWithin(target: number, start: number, end?: number): this;
  entries(): IterableIterator<[number, T]>;
  every(
    predicate: (
      value: T,
      index: number,
      array: ThisArray,
    ) => /* boolish */ unknown,
    thisArg?: any,
  ): boolean;
  fill(value: T, start?: number, end?: number): this;
  filter(
    callback: (
      value: T,
      index: number,
      array: ThisArray,
    ) => /* boolish */ unknown,
    thisArg?: any,
  ): ThisArray;
  find(
    predicate: (
      value: T,
      index: number,
      array: ThisArray,
    ) => /* boolish */ unknown,
    thisArg?: any,
  ): T | undefined;
  findIndex(
    predicate: (
      value: T,
      index: number,
      array: ThisArray,
    ) => /* boolish */ unknown,
    thisArg?: any,
  ): number;
  findLast(
    predicate: (
      value: T,
      index: number,
      array: ThisArray,
    ) => /* boolish */ unknown,
    thisArg?: any,
  ): T | undefined;
  findLastIndex(
    predicate: (
      value: T,
      index: number,
      array: ThisArray,
    ) => /* boolish */ unknown,
    thisArg?: any,
  ): number;
  forEach(
    callback: (value: T, index: number, array: ThisArray) => void,
    thisArg?: any,
  ): void;
  includes(searchElement: T, fromIndex?: number): boolean;
  indexOf(searchElement: T, fromIndex?: number): number;
  join(separator?: string): string;
  keys(): IterableIterator<number>;
  lastIndexOf(searchElement: T, fromIndex?: number): number;
  map(
    callback: (value: T, index: number, array: ThisArray) => T,
    thisArg?: any,
  ): ThisArray;
  reduce<U>(
    callback: (
      accumulator: U,
      value: T,
      index: number,
      array: ThisArray,
    ) => U,
  ): U;
  reduce<U>(
    callback: (
      accumulator: U,
      value: T,
      index: number,
      array: ThisArray,
    ) => U,
    initialValue: U,
  ): U;
  reduceRight<U>(
    callback: (
      accumulator: U,
      value: T,
      index: number,
      array: ThisArray,
    ) => U,
  ): U;
  reduceRight<U>(
    callback: (
      accumulator: U,
      value: T,
      index: number,
      array: ThisArray,
    ) => U,
    initialValue: U,
  ): U;
  reverse(): this;
  set(source: ArrayLike<T>, offset?: number): void;
  slice(start?: number, end?: number): ThisArray;
  some(
    callback: (
      value: T,
      index: number,
      array: ThisArray,
    ) => /* boolish */ unknown,
    thisArg?: any,
  ): boolean;
  sort(comparator?: (a: T, b: T) => number): this;
  subarray(begin?: number, end?: number): ThisArray;
  toLocaleString(reserved1?: unknown, reserved2?: unknown): string;
  toReversed(): ThisArray;
  toSorted(comparator?: (a: T, b: T) => number): ThisArray;
  toString(): string;
  values(): IterableIterator<T>;
  with(index: number, value: T): ThisArray;
  [Symbol.iterator](): IterableIterator<T>;
}

export interface TypedArrayConstructor<
  in out T,
  in out A extends TypedArray<T, A>,
> {
  new (length?: number): A;
  new (source: ArrayLike<T> | Iterable<T>): A;
  new (buffer: ArrayBuffer, byteOffset?: number, length?: number): A;

  readonly BYTES_PER_ELEMENT: number;

  from(source: ArrayLike<T> | Iterable<T>): A;
  from<U>(
    source: ArrayLike<U> | Iterable<U>,
    mapper: (value: U, index: number) => T,
    thisArg?: any,
  ): A;
  of(...items: T[]): A;
}

export function zeroValueOf<T, A extends TypedArray<T, A>>(typedArray: A): T {
  if (
    typedArray instanceof BigInt64Array ||
    typedArray instanceof BigUint64Array
  ) {
    return 0n as T;
  } else {
    return 0 as T;
  }
}
