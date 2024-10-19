// deno-lint-ignore-file no-explicit-any

import { ToIndex } from "@qnighy/absop";
import {
  type TypedArray,
  type TypedArrayConstructor,
  zeroValueOf,
} from "./typedarray.ts";

export type TypedVecConstructor<
  in out T,
  in out A extends TypedArray<T, A>,
  in out V extends TypedVec<T, A>,
> = {
  new (): V;
  new (source: ArrayLike<T> | Iterable<T>): V;
  new (length: number): V;
  new (buffer: ArrayBuffer, byteOffset?: number, length?: number): V;
  TypedArray: TypedArrayConstructor<T, A>;
};

export abstract class TypedVec<in out T, in out A extends TypedArray<T, A>>
  extends Object {
  static TypedArray: TypedArrayConstructor<any, any>;
  #typedBuffer: A;
  #length: number;
  /**
   * Creates an empty vector with a fresh buffer.
   */
  constructor();
  /**
   * Creates a vector with a fresh buffer, copied from an array-like source.
   * @param source an array-like object to copy from.
   */
  constructor(source: ArrayLike<T> | Iterable<T>);
  /**
   * Creates a vector with a fresh buffer, with a specified length.
   * @param length the length of the vector.
   */
  constructor(length: number);
  /**
   * Creates a vector with an existing buffer.
   * @param buffer the backing buffer to use.
   * @param byteOffset the starting offset in the buffer. Must be 0.
   * @param length the length of the vector. If omitted, it is inferred from the buffer size.
   */
  constructor(buffer: ArrayBuffer, byteOffset?: number, length?: number);
  constructor(
    arg?: ArrayLike<T> | Iterable<T> | number | ArrayBuffer,
    byteOffset?: number,
    length?: number,
  ) {
    super();
    const ThisTypedArray =
      (this.constructor as TypedVecConstructor<T, A, this>).TypedArray;
    if (ThisTypedArray == null) {
      // Based on https://tc39.es/ecma262/multipage/indexed-collections.html#sec-%typedarray%
      throw new TypeError("Tried to instantiate abstract TypedVec");
    }
    // Based on https://tc39.es/ecma262/multipage/indexed-collections.html#sec-typedarray
    if (arg instanceof ArrayBuffer) {
      // Initialize from existing buffer.
      // Unlike TypedArray, byteOffset must be 0.
      // Length parameter behaves like TypedArray, but it is not passed to the backing buffer,
      // instead being stored in #length.
      if (byteOffset ?? 0 !== 0) {
        throw new RangeError("byteOffset must be 0");
      }
      this.#typedBuffer = new ThisTypedArray(arg, byteOffset);
      this.#length = length ?? this.#typedBuffer.length;
      if (this.#length > this.#typedBuffer.length) {
        throw new RangeError(`Invalid typed array length: ${this.#length}`);
      }
    } else if (arg instanceof SharedArrayBuffer) {
      throw new TypeError("Shared buffer cannot be used for growable arrays");
    } else {
      // Initialize with a new buffer.
      // Delegate argument interpretation to TypedArray.
      this.#typedBuffer = new ThisTypedArray(arg as any);
      this.#length = this.#typedBuffer.length;
    }
  }

  /**
   * Creates a new TypedVec from a TypedArray, reusing the buffer.
   *
   * @param buffer a source TypedArray. It must be of the same type as the target TypedVec,
   *        and the array's offset must be 0.
   * @returns a new TypedVec object pointing to the same buffer.
   */
  static promoteFrom<
    T,
    A extends TypedArray<T, A>,
    V extends TypedVec<T, A>,
  >(
    this: TypedVecConstructor<T, A, V>,
    buffer: A,
  ): V {
    return TypedVec.#promoteFrom(this, buffer);
  }
  static #promoteFrom<
    T,
    A extends TypedArray<T, A>,
    V extends TypedVec<T, A>,
  >(
    constructor: TypedVecConstructor<T, A, V>,
    buffer: A,
  ): V {
    if (!(buffer instanceof constructor.TypedArray)) {
      throw new TypeError(
        `buffer must be an instance of ${constructor.TypedArray}`,
      );
    }
    return new constructor(buffer.buffer, buffer.byteOffset, buffer.length);
  }

  /**
   * Equivalent to `index in obj`.
   * @param index an index to the array.
   * @returns if the index is a valid array index.
   */
  hasElement(index: number): boolean {
    return index < this.#length && index in this.#typedBuffer;
  }
  #getElement(index: number): T | undefined {
    return !Object.is(index, -0) && index < this.#length
      ? this.#typedBuffer[index]
      : undefined;
  }
  /**
   * Equivalent to `obj[index]`.
   * @param index an index to the array.
   * @returns the element, if any, or undefined.
   */
  getElement(index: number): T[][number] {
    return (index < this.#length ? this.#typedBuffer[index] : undefined)!;
  }
  /**
   * Equivalent to `obj[index] = value`.
   * @param index an index to the array.
   * @param value the value to set.
   */
  setElement(index: number, value: T): void {
    if (index < this.#length) {
      this.#typedBuffer[index] = value;
    }
  }

  // Buffer manipulation methods

  /**
   * Returns a TypedArray representation of the current vector.
   *
   * @returns a new TypedArray object with the same backing buffer, representing the current vector.
   */
  asTypedArray(): A {
    return this.#typedBuffer.subarray(0, this.length);
  }

  /**
   * Forcibly reallocates the backing buffer to the specified capacity.
   *
   * @param newCapacity the new capacity of the backing buffer.
   */
  #setCapacity(newCapacity: number): void {
    const oldBuffer = this.#typedBuffer;
    if (newCapacity === oldBuffer.length) {
      return;
    }

    const buf = oldBuffer.buffer as ArrayBuffer & {
      transferToFixedLength?(newLength: number): ArrayBuffer;
      transfer?(newLength: number): ArrayBuffer;
    };
    if (buf.transferToFixedLength) {
      this.#typedBuffer =
        new (oldBuffer.constructor as TypedArrayConstructor<T, A>)(
          buf.transferToFixedLength(
            newCapacity * oldBuffer.BYTES_PER_ELEMENT,
          ),
        );
    } else if (buf.transfer) {
      this.#typedBuffer =
        new (oldBuffer.constructor as TypedArrayConstructor<T, A>)(
          buf.transfer(newCapacity * oldBuffer.BYTES_PER_ELEMENT),
        );
    } else {
      const newBuffer =
        new (oldBuffer.constructor as TypedArrayConstructor<T, A>)(newCapacity);
      newBuffer.set(oldBuffer);
      oldBuffer.fill(zeroValueOf(oldBuffer));
      this.#typedBuffer = newBuffer;
    }
  }

  /**
   * Ensures that the backing buffer has enough capacity to store the specified number of elements.
   * @param demand lower bound of the new capacity
   */
  #ensureCapacity(demand: number): void {
    const oldBuffer = this.#typedBuffer;
    if (demand > oldBuffer.length) {
      const newCapacity = Math.min(
        Math.max(oldBuffer.length * 2, demand),
        Number.MAX_SAFE_INTEGER,
      );
      this.#setCapacity(newCapacity);
    }
  }

  #assertResizable(): void {
    if (!Object.isExtensible(this)) {
      throw new TypeError("Cannot resize non-extensible TypedVec");
    }
  }

  #setLength(newLength: number): void {
    if (newLength > this.#length) {
      this.#assertResizable();
      this.#ensureCapacity(newLength);
      this.#typedBuffer.fill(
        zeroValueOf(this.#typedBuffer),
        this.#length,
        newLength,
      );
      this.#length = newLength;
    } else if (newLength < this.#length) {
      this.#assertResizable();
      this.#length = newLength;
    }
  }

  /**
   * The capacity of the backing buffer.
   */
  get capacity(): number {
    return this.#typedBuffer.length;
  }

  /**
   * Sets the capacity of the backing buffer.
   *
   * Note that this is not amortized fast, meaning you should not call this method too frequently.
   */
  set capacity(newCapacity: number) {
    newCapacity = ToIndex(newCapacity, "Invalid typed array length");
    if (newCapacity < this.length) {
      throw new RangeError("new capacity too small");
    }
    this.#setCapacity(newCapacity);
  }

  /**
   * Ensures that the backing buffer has enough capacity to store the specified number of elements.
   * @param demand lower bound of the new capacity
   */
  ensureCapacity(demand: number): void {
    demand = ToIndex(demand, "Invalid typed array length");
    this.#ensureCapacity(demand);
  }

  /**
   * Shrinks the backing buffer to fit the current length.
   *
   * Note that this is not amortized fast, meaning you should not call this method too frequently.
   */
  shrinkToFit(): void {
    this.#setCapacity(this.#length);
  }

  // Imitation of TypedArray static methods

  /**
   * Creates a new TypedVec from an array-like object or an iterable.
   *
   * @param source an array-like object or an iterable to copy from.
   * @param mapper a function to map each element of the source.
   * @param thisArg an object to use as `this` when executing the mapper.
   * @returns a new TypedVec object.
   */
  static from<T, A extends TypedArray<T, A>, V extends TypedVec<T, A>>(
    this: TypedVecConstructor<T, A, V>,
    source: ArrayLike<T> | Iterable<T>,
  ): V;
  /**
   * Creates a new TypedVec from an array-like object or an iterable.
   *
   * @param source an array-like object or an iterable to copy from.
   * @param mapper a function to map each element of the source.
   * @param thisArg an object to use as `this` when executing the mapper.
   * @returns a new TypedVec object.
   */
  static from<U, T, A extends TypedArray<T, A>, V extends TypedVec<T, A>>(
    this: TypedVecConstructor<T, A, V>,
    source: ArrayLike<U> | Iterable<U>,
    mapper: (value: U, index: number) => T,
    thisArg?: any,
  ): V;
  static from<U, T, A extends TypedArray<T, A>, V extends TypedVec<T, A>>(
    this: TypedVecConstructor<T, A, V>,
    source: ArrayLike<U> | Iterable<U>,
    mapper?: (value: U, index: number) => T,
    thisArg?: any,
  ): V {
    return TypedVec.#promoteFrom(
      this,
      this.TypedArray.from(source, mapper!, thisArg),
    );
  }

  /**
   * Creates a new TypedVec from a variable number of arguments.
   *
   * @param items the elements to include in the new TypedVec.
   * @returns a new TypedVec object.
   */
  static of<T, A extends TypedArray<T, A>, V extends TypedVec<T, A>>(
    this: TypedVecConstructor<T, A, V>,
    ...items: T[]
  ): V {
    return TypedVec.#promoteFrom(this, this.TypedArray.of(...items));
  }

  // Imitation of TypedArray/Array properties

  /**
   * The number of bytes per element in the vector.
   */
  abstract readonly BYTES_PER_ELEMENT: number;

  /**
   * The current backing buffer.
   *
   * Note that, unlike TypedArray, TypedVec's backing buffer may be reallocated.
   * On reallocation, the old buffer is invalidated.
   */
  get buffer(): ArrayBuffer {
    return this.#typedBuffer.buffer;
  }

  /**
   * The current vector length in bytes.
   */
  get byteLength(): number {
    return this.#typedBuffer.BYTES_PER_ELEMENT * this.length;
  }

  /**
   * The offset to the vector.
   *
   * Unlike TypedArray, this is always 0.
   */
  get byteOffset(): number {
    return 0;
  }

  /**
   * The current length of the vector.
   *
   * Note that the length can be shorter than the backing typed array.
   */
  get length(): number {
    return this.#length;
  }

  /**
   * Resizes the vector.
   *
   * If newLength is shorter than the current length, some of the vector elements are discarded.
   *
   * If newLength is longer than the current length, the extended part is initialized by zero.
   */
  set length(newLength: number) {
    newLength = ToIndex(newLength, "Invalid typed array length");
    this.#setLength(newLength);
  }

  // Imitation of TypedArray instance methods

  /**
   * Retrieves an element using a index from the start (non-negative) or end (negative).
   *
   * @param index non-negative index from the start or negative index from the end.
   * @returns the element at the specified index, or undefined if the index is out of range.
   */
  at(index: number): T | undefined {
    index = Math.trunc(+index || 0);
    return this.#getElement(index >= 0 ? index : this.length + index);
  }

  /**
   * Copies elements within the vector.
   *
   * @param target the index to copy to.
   * @param start the index to copy from.
   * @param end the index to copy to. If omitted, it is the end of the vector.
   */
  copyWithin(target: number, start: number, end?: number): void {
    this.asTypedArray().copyWithin(target, start, end);
  }

  /**
   * Iterates over the indices and values of the vector.
   * @returns the iterator of index-value pairs.
   */
  entries(): IterableIterator<[number, T]> {
    return this.asTypedArray().entries();
  }

  /**
   * Tests if all elements satisfy the condition.
   *
   * @param predicate a function to test each element.
   * @param thisArg an object to use as `this` when executing the predicate.
   * @returns if all elements satisfy the condition.
   */
  every(
    predicate: (value: T, index: number, array: A) => /* boolish */ unknown,
    thisArg?: any,
  ): boolean {
    return this.asTypedArray().every(predicate as any, thisArg);
  }

  /**
   * Fills a part of the vector with a value.
   * @param value the value to fill.
   * @param start the index to start filling.
   * @param end the index to stop filling. If omitted, it is the end of the vector.
   */
  fill(value: T, start?: number, end?: number): void {
    this.asTypedArray().fill(value, start, end);
  }

  /**
   * Filters the elements of the vector.
   *
   * The result is returned as a TypedArray, not a TypedVec.
   *
   * @param callback a function to test each element.
   * @param thisArg an object to use as `this` when executing the callback.
   * @returns a new TypedArray containing the elements that satisfy the condition.
   */
  filter(
    callback: (value: T, index: number, array: A) => /* boolish */ unknown,
    thisArg?: any,
  ): A {
    return this.asTypedArray().filter(callback, thisArg);
  }

  /**
   * Finds the first element satisfying the condition.
   *
   * @param predicate a function to test each element.
   * @param thisArg an object to use as `this` when executing the predicate.
   * @returns the first element satisfying the condition, or undefined if none.
   */
  find(
    predicate: (value: T, index: number, array: A) => /* boolish */ unknown,
    thisArg?: any,
  ): T | undefined {
    return this.asTypedArray().find(predicate, thisArg);
  }

  /**
   * Finds the index of the first element satisfying the condition.
   *
   * @param predicate a function to test each element.
   * @param thisArg an object to use as `this` when executing the predicate.
   * @returns the index of the first element satisfying the condition, or -1 if none.
   */
  findIndex(
    predicate: (value: T, index: number, array: A) => unknown,
    thisArg?: any,
  ): number {
    return this.asTypedArray().findIndex(predicate, thisArg);
  }

  /**
   * Finds the last element satisfying the condition.
   *
   * @param predicate a function to test each element.
   * @param thisArg an object to use as `this` when executing the predicate.
   * @returns the last element satisfying the condition, or undefined if none.
   */
  findLast(
    predicate: (value: T, index: number, array: A) => unknown,
    thisArg?: any,
  ): T | undefined {
    return this.asTypedArray().findLast(predicate, thisArg);
  }

  /**
   * Finds the index of the last element satisfying the condition.
   *
   * @param predicate a function to test each element.
   * @param thisArg an object to use as `this` when executing the predicate.
   * @returns the index of the last element satisfying the condition, or -1 if none.
   */
  findLastIndex(
    predicate: (value: T, index: number, array: A) => unknown,
    thisArg?: any,
  ): number {
    return this.asTypedArray().findLastIndex(predicate, thisArg);
  }

  /**
   * Iterates over the values of the vector.
   */
  forEach(
    callback: (value: T, index: number, array: A) => void,
    thisArg?: any,
  ): void {
    this.asTypedArray().forEach(callback, thisArg);
  }

  /**
   * Tests if the vector includes a certain element.
   *
   * Comparison is done using the SameValueZero algorithm, meaning that NaN is considered equal to NaN
   * when used against Float32Array and Float64Array.
   *
   * @param searchElement an element to search for.
   * @param fromIndex the index to start searching from.
   * @returns if the element is found.
   */
  includes(searchElement: T, fromIndex?: number): boolean {
    return this.asTypedArray().includes(searchElement, fromIndex);
  }

  /**
   * Finds the index of a certain element.
   *
   * Comparison is done using the IsStrictlyEqual algorithm, meaning that NaN is not considered equal to NaN
   * when used against Float32Array and Float64Array.
   *
   * @param searchElement an element to search for.
   * @param fromIndex the index to start searching from.
   * @returns the index of the element, or -1 if not found.
   */
  indexOf(searchElement: T, fromIndex?: number): number {
    return this.asTypedArray().indexOf(searchElement, fromIndex);
  }

  /**
   * Joins the elements of the vector into a string.
   * @param separator a string to separate the elements. If omitted, it is a comma.
   * @returns the joined string.
   */
  join(separator?: string): string {
    return this.asTypedArray().join(separator);
  }

  /**
   * Iterates over the indices of the vector.
   *
   * @returns an iterator of indices.
   */
  keys(): IterableIterator<number> {
    return this.asTypedArray().keys();
  }

  /**
   * Finds the last index of a certain element.
   *
   * Comparison is done using the IsStrictlyEqual algorithm, meaning that NaN is not considered equal to NaN
   * when used against Float32Array and Float64Array.
   *
   * @param searchElement an element to search for.
   * @param fromIndex the index to start searching from.
   * @returns the last index of the element, or -1 if not found.
   */
  lastIndexOf(searchElement: T, fromIndex?: number): number;
  lastIndexOf(
    searchElement: T,
    ...rest: any[]
  ): number {
    // Number of arguments is important here. Pass the array as-is.
    return this.asTypedArray().lastIndexOf(searchElement, ...rest);
  }

  /**
   * Maps the elements of the vector.
   *
   * The result is returned as a TypedArray, not a TypedVec.
   *
   * The method cannot yield a different kind of TypedArray or an Array. Use TypedArray.from or Array.from for that.
   *
   * @param callback a function to map each element.
   * @param thisArg an object to use as `this` when executing the callback.
   * @returns a new TypedArray containing the mapped elements.
   */
  map(
    callback: (value: T, index: number, array: A) => T,
    thisArg?: any,
  ): A {
    return this.asTypedArray().map(callback, thisArg);
  }

  /**
   * Applies a function against an accumulator and each element of the vector (from left to right).
   *
   * @param callback the function to apply repeatedly.
   * @param initialValue the initial value of the accumulator.
   * @returns the final accumulator value.
   */
  reduce<U>(
    callback: (
      accumulator: U,
      value: T,
      index: number,
      array: A,
    ) => U,
    initialValue: U,
  ): U;
  /**
   * Applies a function against an accumulator and each element of the vector (from left to right).
   *
   * The array must have at least one element, and the first element is used as the initial value of the accumulator.
   *
   * @param callback the function to apply repeatedly.
   * @returns the final accumulator value.
   */
  reduce<U = T>(
    callback: (
      accumulator: T | U,
      value: T,
      index: number,
      array: A,
    ) => T | U,
  ): T | U;
  reduce(
    callback: (
      accumulator: any,
      value: T,
      index: number,
      array: A,
    ) => any,
    ...rest: any[]
  ): any {
    // Number of arguments is important here. Pass the array as-is.
    return this.asTypedArray().reduce(callback, ...(rest as []));
  }

  /**
   * Applies a function against an accumulator and each element of the vector (from right to left).
   *
   * @param callback the function to apply repeatedly.
   * @param initialValue the initial value of the accumulator.
   * @returns the final accumulator value.
   */
  reduceRight<U>(
    callback: (
      accumulator: U,
      value: T,
      index: number,
      array: A,
    ) => U,
    initialValue: U,
  ): U;
  /**
   * Applies a function against an accumulator and each element of the vector (from right to left).
   *
   * The array must have at least one element, and the first element is used as the initial value of the accumulator.
   *
   * @param callback the function to apply repeatedly.
   * @returns the final accumulator value.
   */
  reduceRight<U = T>(
    callback: (
      accumulator: T | U,
      value: T,
      index: number,
      array: A,
    ) => T | U,
  ): T | U;
  reduceRight(
    callback: (
      accumulator: any,
      value: T,
      index: number,
      array: A,
    ) => any,
    ...rest: any[]
  ): any {
    // Number of arguments is important here. Pass the array as-is.
    return this.asTypedArray().reduceRight(callback, ...(rest as []));
  }

  /**
   * Reverses the current range of the vector in place.
   *
   * The result is returned as a TypedArray, not a TypedVec.
   *
   * @returns a TypedArray representing the reversed range.
   */
  reverse(): A {
    return this.asTypedArray().reverse();
  }

  /**
   * Copies elements from an array-like object to the vector.
   *
   * @param source an array-like object, including TypedArray, to copy from.
   * @param offset the index in the destination to start copying to.
   */
  set(source: ArrayLike<T>, offset?: number): void {
    this.asTypedArray().set(source, offset);
  }

  /**
   * Returns a copy of a part of the vector.
   *
   * The result is returned as a TypedArray, not a TypedVec.
   *
   * @param start the index to start copying from.
   * @param end the index to stop copying to. If omitted, it is the end of the vector.
   * @returns a TypedArray containing the copy of the specified range.
   */
  slice(start?: number, end?: number): A {
    return this.asTypedArray().slice(start, end);
  }

  /**
   * Tests if any element satisfies the condition.
   *
   * @param callback a function to test each element.
   * @param thisArg an object to use as `this` when executing the callback.
   * @returns if any element satisfies the condition.
   */
  some(
    callback: (value: T, index: number, array: A) => unknown,
    thisArg?: any,
  ): boolean {
    return this.asTypedArray().some(callback, thisArg);
  }

  /**
   * Sorts the vector in place.
   *
   * The result is returned as a TypedArray, not a TypedVec.
   *
   * @param comparator a function to compare elements.
   *        If omitted, elements are sorted numerically based on the value.
   *        This is different from Array.prototype.sort, which sorts elements as strings.
   * @returns a TypedArray representing the sorted range.
   */
  sort(comparator?: (a: T, b: T) => number): A {
    return this.asTypedArray().sort(comparator);
  }

  /**
   * Returns a TypedArray referencing a part of the vector.
   *
   * The resulting TypedArray shares the same buffer with the original TypedArray,
   * meaning that changes to the original TypedArray are reflected in the subarray, and vice versa.
   *
   * The validity of the returned TypedArray is only guaranteed until the next operation that modifies capacity.
   *
   * The result is returned as a TypedArray, not a TypedVec.
   * @param begin the index to start the subarray.
   * @param end the index to end the subarray. If omitted, it is the end of the vector.
   * @returns a TypedArray representing the subarray.
   */
  subarray(begin?: number, end?: number): A {
    return this.asTypedArray().subarray(begin, end);
  }

  /**
   * Represents the vector as a string depending on the locale.
   *
   * @returns a locale-dependent string representation of the vector.
   */
  override toLocaleString(): string {
    return this.asTypedArray().toLocaleString();
  }

  /**
   * Returns a new TypedArray containing the elements of the vector in reverse order.
   *
   * The vector itself is not modified.
   *
   * The result is returned as a TypedArray, not a TypedVec.
   *
   * @returns a TypedArray representing the reversed range.
   */
  toReversed(): A {
    return this.asTypedArray().toReversed();
  }

  /**
   * Returns a new TypedArray containing the elements of the vector in sorted order.
   *
   * @param comparator a function to compare elements. If omitted, elements are sorted numerically.
   *        This is different from Array.prototype.sort, which sorts elements as strings.
   * @returns a TypedArray representing the sorted range.
   */
  toSorted(comparator?: (a: T, b: T) => number): A {
    return this.asTypedArray().toSorted(comparator);
  }

  /**
   * Represents the vector as a string.
   *
   * @returns a string representation of the vector.
   */
  override toString(): string {
    return this.asTypedArray().toString();
  }

  /**
   * Iterates over the values of the vector, in the order of indices.
   * @returns an iterator.
   */
  values(): IterableIterator<T> {
    return this.asTypedArray().values();
  }

  /**
   * Returns a new TypedArray containing almost the same elements as the vector, with a single element changed.
   *
   * The vector itself is not modified.
   *
   * The result is returned as a TypedArray, not a TypedVec.
   *
   * @param index the index of the element to change in the returned copy.
   * @param value the new value to set in the returned copy.
   * @returns a TypedArray representing containing a copy of the vector and a single changed element.
   */
  with(index: number, value: T): A {
    return this.asTypedArray().with(index, value);
  }

  /**
   * Iterates over the values of the vector, in the order of indices.
   * @returns an iterator.
   */
  declare [Symbol.iterator]: TypedVec<T, A>["values"];
  static {
    this.prototype[Symbol.iterator] = this.prototype.values;
  }

  /**
   * The string tag of the vector.
   */
  get [Symbol.toStringTag](): string {
    return this.#typedBuffer[Symbol.toStringTag].replace("Array", "Vec");
  }

  // Imitation of Array instance methods related to resizing

  /**
   * Removes the last element from the vector and returns it.
   *
   * @returns the removed element, or undefined if the vector was empty.
   */
  pop(): T | undefined {
    if (this.#length === 0) {
      return undefined;
    }
    this.#assertResizable();
    const result = this.#typedBuffer[this.#length - 1];
    this.#length--;
    return result;
  }

  /**
   * Pushes elements to the end of the vector.
   *
   * @param items the elements to push.
   * @returns the new length of the vector.
   */
  push(...items: T[]): number {
    const oldLength = this.#length;
    if (oldLength + items.length > Number.MAX_SAFE_INTEGER) {
      throw new RangeError("Invalid typed array length");
    }
    if (items.length > 0) {
      this.#assertResizable();
    }
    this.#ensureCapacity(oldLength + items.length);
    this.#typedBuffer.set(items, oldLength);
    this.#length += items.length;
    return this.#length;
  }

  /**
   * Removes the first element from the vector and returns it.
   *
   * Note that this operation is Θ(n), where n is the length of the vector.
   *
   * @returns the removed element, or undefined if the vector was empty.
   */
  shift(): T | undefined {
    if (this.#length === 0) {
      return undefined;
    }
    this.#assertResizable();
    const result = this.#typedBuffer[0];
    this.#typedBuffer.copyWithin(0, 1);
    this.#length--;
    return result;
  }

  /**
   * Removes elements from the vector and, if necessary, inserts new elements in their place.
   *
   * The result is returned as a TypedArray, not a TypedVec.
   *
   * Note that this operation is Θ(k1 + k2 + k3), where k1 is the number of elements to remove,
   * k2 is the number of elements to insert, and k3 is the number of elements to shift,
   * and the evaluation is amortized if inserting more items than removing.
   *
   * @param start the starting index of the range to remove.
   * @param deleteCount the number of elements to remove. If omitted, the range extends to the end of the vector.
   * @param items the elements to insert.
   */
  splice(start: number, deleteCount?: number, ...items: T[]): A;
  splice(start: number, deleteCount: number, ...items: T[]): A {
    const oldLength = this.#length;

    start = Math.trunc(+start || 0);
    start = start === -Infinity
      ? 0
      : start < 0
      ? Math.max(oldLength + start, 0)
      : Math.min(start, oldLength);

    // Referencing arguments.length to follow Array.prototype.splice behavior,
    // where [1, 2, 3].splice(0, undefined) is different from [1, 2, 3].splice(0).
    deleteCount = arguments.length < 2
      ? oldLength - start
      : Math.trunc(+deleteCount || 0);
    deleteCount = Math.min(Math.max(deleteCount, 0), oldLength - start);

    // Math.abs(items.length - deleteCount) is a safe integer as both operands are safe non-negative integers.
    // The final sum might be rounded but still isSafeInteger(roundedSum) iff isSafeInteger(sum).
    const newLength = oldLength + (items.length - deleteCount);
    if (newLength > Number.MAX_SAFE_INTEGER) {
      throw new RangeError("Invalid typed array length");
    }
    if (newLength !== oldLength) {
      this.#assertResizable();
    }
    this.#ensureCapacity(newLength);
    const deleted = this.#typedBuffer.slice(start, start + deleteCount);
    this.#typedBuffer.copyWithin(
      start + items.length,
      start + deleteCount,
      oldLength,
    );
    try {
      this.#typedBuffer.set(items, start);
    } catch (e) {
      // TypedArray.set may fail as `items` may contain arbitrary type of values and we may need type conversion.
      // Restore to the original state in this case.
      this.#typedBuffer.copyWithin(start, start + items.length, newLength);
      this.#typedBuffer.set(deleted, start);
      throw e;
    }
    this.#length = newLength;
    return deleted;
  }

  /**
   * Adds elements to the beginning of the vector.
   *
   * Note that this operation is amortized Θ(n+k), where n is the length of the vector
   * and k is the number of elements to add.
   *
   * @param items the elements to add.
   * @returns the new length of the vector.
   */
  unshift(...items: T[]): number {
    const oldLength = this.#length;
    if (oldLength + items.length > Number.MAX_SAFE_INTEGER) {
      throw new RangeError("Invalid typed array length");
    }
    if (items.length > 0) {
      this.#assertResizable();
    }
    this.#ensureCapacity(oldLength + items.length);
    this.#typedBuffer.copyWithin(items.length, 0, oldLength);
    try {
      this.#typedBuffer.set(items, 0);
    } catch (e) {
      // TypedArray.set may fail as `items` may contain arbitrary type of values and we may need type conversion.
      // Restore to the original state in this case.
      this.#typedBuffer.copyWithin(0, items.length, items.length + oldLength);
      throw e;
    }
    this.#length += items.length;
    return this.#length;
  }
}

function freezeTypedClass<T extends TypedVecConstructor<any, any, any>>(
  constructor: T,
) {
  Object.defineProperty(constructor, "TypedArray", {
    writable: false,
    enumerable: false,
    configurable: false,
  });
  Object.defineProperty(constructor, "BYTES_PER_ELEMENT", {
    writable: false,
    enumerable: false,
    configurable: false,
  });
  Object.defineProperty(constructor.prototype, "BYTES_PER_ELEMENT", {
    writable: false,
    enumerable: false,
    configurable: false,
  });
}

/**
 * A unbounded-resizable variant of Int8Array, or a vector of 8-bit signed integers.
 *
 * It can store integers from -128 to 127.
 */
export class Int8Vec extends TypedVec<number, Int8Array> {
  static override TypedArray = Int8Array;
  static BYTES_PER_ELEMENT = Int8Array.BYTES_PER_ELEMENT;
  declare BYTES_PER_ELEMENT: number;
  static {
    this.prototype.BYTES_PER_ELEMENT = Int8Array.BYTES_PER_ELEMENT;
    freezeTypedClass(this);
  }
}

/**
 * A unbounded-resizable variant of Uint8Array, or a vector of 8-bit unsigned integers.
 *
 * It can store integers from 0 to 255.
 */
export class Uint8Vec extends TypedVec<number, Uint8Array> {
  static override TypedArray = Uint8Array;
  static BYTES_PER_ELEMENT = Uint8Array.BYTES_PER_ELEMENT;
  declare BYTES_PER_ELEMENT: number;
  static {
    this.prototype.BYTES_PER_ELEMENT = Uint8Array.BYTES_PER_ELEMENT;
    freezeTypedClass(this);
  }
}

/**
 * A unbounded-resizable variant of Uint8ClampedArray, or a vector of 8-bit unsigned integers with clamping setter.
 *
 * It can store integers from 0 to 255, and values outside the range are rounded to integer and clamped to the range.
 */
export class Uint8ClampedVec extends TypedVec<number, Uint8ClampedArray> {
  static override TypedArray = Uint8ClampedArray;
  static BYTES_PER_ELEMENT = Uint8ClampedArray.BYTES_PER_ELEMENT;
  declare BYTES_PER_ELEMENT: number;
  static {
    this.prototype.BYTES_PER_ELEMENT = Uint8ClampedArray.BYTES_PER_ELEMENT;
    freezeTypedClass(this);
  }
}

/**
 * A unbounded-resizable variant of Int16Array, or a vector of 16-bit signed integers.
 *
 * It can store integers from -32768 to 32767.
 */
export class Int16Vec extends TypedVec<number, Int16Array> {
  static override TypedArray = Int16Array;
  static BYTES_PER_ELEMENT = Int16Array.BYTES_PER_ELEMENT;
  declare BYTES_PER_ELEMENT: number;
  static {
    this.prototype.BYTES_PER_ELEMENT = Int16Array.BYTES_PER_ELEMENT;
    freezeTypedClass(this);
  }
}

/**
 * A unbounded-resizable variant of Uint16Array, or a vector of 16-bit unsigned integers.
 *
 * It can store integers from 0 to 65535.
 */
export class Uint16Vec extends TypedVec<number, Uint16Array> {
  static override TypedArray = Uint16Array;
  static BYTES_PER_ELEMENT = Uint16Array.BYTES_PER_ELEMENT;
  declare BYTES_PER_ELEMENT: number;
  static {
    this.prototype.BYTES_PER_ELEMENT = Uint16Array.BYTES_PER_ELEMENT;
    freezeTypedClass(this);
  }
}

/**
 * A unbounded-resizable variant of Int32Array, or a vector of 32-bit signed integers.
 *
 * It can store integers from -2147483648 to 2147483647.
 */
export class Int32Vec extends TypedVec<number, Int32Array> {
  static override TypedArray = Int32Array;
  static BYTES_PER_ELEMENT = Int32Array.BYTES_PER_ELEMENT;
  declare BYTES_PER_ELEMENT: number;
  static {
    this.prototype.BYTES_PER_ELEMENT = Int32Array.BYTES_PER_ELEMENT;
    freezeTypedClass(this);
  }
}

/**
 * A unbounded-resizable variant of Uint32Array, or a vector of 32-bit unsigned integers.
 *
 * It can store integers from 0 to 4294967295.
 */
export class Uint32Vec extends TypedVec<number, Uint32Array> {
  static override TypedArray = Uint32Array;
  static BYTES_PER_ELEMENT = Uint32Array.BYTES_PER_ELEMENT;
  declare BYTES_PER_ELEMENT: number;
  static {
    this.prototype.BYTES_PER_ELEMENT = Uint32Array.BYTES_PER_ELEMENT;
    freezeTypedClass(this);
  }
}

/**
 * A unbounded-resizable variant of Float32Array, or a vector of 32-bit floating point numbers.
 *
 * It can store:
 *
 * - Normalized numbers from -3.4028234663852886e+38 to -1.1754943508222875e-38 and from +1.1754943508222875e-38 to +3.4028234663852886e+38, in 24-bit precision.
 * - Denormalized numbers from -1.1754943508222875e-38 to -1.401298464324817e-45 and from +1.401298464324817e-45 to +1.1754943508222875e-38, in less than 24-bit precision.
 * - Positive and negative zeroes.
 * - Positive infinity, negative infinity, and NaN.
 */
export class Float32Vec extends TypedVec<number, Float32Array> {
  static override TypedArray = Float32Array;
  static BYTES_PER_ELEMENT = Float32Array.BYTES_PER_ELEMENT;
  declare BYTES_PER_ELEMENT: number;
  static {
    this.prototype.BYTES_PER_ELEMENT = Float32Array.BYTES_PER_ELEMENT;
    freezeTypedClass(this);
  }
}

/**
 * A unbounded-resizable variant of Float64Array, or a vector of 64-bit floating point numbers.
 *
 * It can store:
 *
 * - Normalized numbers from -1.7976931348623157e+308 to -2.2250738585072014e-308 and from +2.2250738585072014e-308 to +1.7976931348623157e+308, in 53-bit precision.
 * - Denormalized numbers from -2.2250738585072014e-308 to -4.9406564584124654e-324 and from +4.9406564584124654e-324 to +2.2250738585072014e-308, in less than 53-bit precision.
 * - Positive and negative zeroes.
 * - Positive infinity, negative infinity, and NaN.
 */
export class Float64Vec extends TypedVec<number, Float64Array> {
  static override TypedArray = Float64Array;
  static BYTES_PER_ELEMENT = Float64Array.BYTES_PER_ELEMENT;
  declare BYTES_PER_ELEMENT: number;
  static {
    this.prototype.BYTES_PER_ELEMENT = Float64Array.BYTES_PER_ELEMENT;
    freezeTypedClass(this);
  }
}

/**
 * A unbounded-resizable variant of BigInt64Array, or a vector of 64-bit signed integers.
 *
 * It can store integers from -9223372036854775808 to 9223372036854775807.
 */
export class BigInt64Vec extends TypedVec<bigint, BigInt64Array> {
  static override TypedArray = BigInt64Array as
    & BigInt64ArrayConstructor
    & TypedArrayConstructor<any, any>;
  static BYTES_PER_ELEMENT = BigInt64Array.BYTES_PER_ELEMENT;
  declare BYTES_PER_ELEMENT: number;
  static {
    this.prototype.BYTES_PER_ELEMENT = BigInt64Array.BYTES_PER_ELEMENT;
    freezeTypedClass(this);
  }
}

/**
 * A unbounded-resizable variant of BigUint64Array, or a vector of 64-bit unsigned integers.
 *
 * It can store integers from 0 to 18446744073709551615.
 */
export class BigUint64Vec extends TypedVec<bigint, BigUint64Array> {
  static override TypedArray = BigUint64Array as
    & BigUint64ArrayConstructor
    & TypedArrayConstructor<any, any>;
  static BYTES_PER_ELEMENT = BigUint64Array.BYTES_PER_ELEMENT;
  declare BYTES_PER_ELEMENT: number;
  static {
    this.prototype.BYTES_PER_ELEMENT = BigUint64Array.BYTES_PER_ELEMENT;
    freezeTypedClass(this);
  }
}
