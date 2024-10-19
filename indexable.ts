// deno-lint-ignore-file no-explicit-any
import { CanonicalNumericIndexString } from "@qnighy/absop";

export const hasElement = Symbol("hasElement");
export const getElement = Symbol("getElement");
export const setElement = Symbol("setElement");
export const elementKeys = Symbol("elementKeys");

/**
 * A number-indexable object imitating TypedArray Exotic Objects.
 *
 * An object inheriting this class can be accessed by numeric index.
 */
export abstract class Indexable<T> {
  /**
   * Indexes into the object (probably an array-like one).
   *
   * This is delegated to the four abstract methods getElement, setElement, hasElement, and elementKeys
   * required to be implemented by the subclass.
   */
  [key: number]: T;

  constructor() {
    const handler = new IndexableHandler<T, this>();
    const proxy = new Proxy(this, handler);
    handler.proxyObject = proxy;
    return proxy;
  }

  /**
   * Returns whether the index is a valid array index.
   *
   * Once the object is non-extensible, this method should return a stable result.
   *
   * Used in: [[GetOwnProperty]], [[HasProperty]], [[DefineOwnProperty]], [[Set]], [[DeleteProperty]]
   *
   * @param index A numeric index, including non-safe integers, non-integers, negative zero, Infinity, -Infinity, and NaN.
   * @returns `true` if the index is a valid array index, `false` otherwise.
   */
  abstract [hasElement](index: number): boolean;

  /**
   * Returns the value of the element at the index.
   *
   * Used in: [[GetOwnProperty]], [[Get]]
   *
   * @param index A numeric index, including non-safe integers, non-integers, negative zero, Infinity, -Infinity, and NaN.
   * @returns The value of the element at the index, or undefined if the index is not valid (i.e. [hasElement](index) returns false).
   */
  abstract [getElement](index: number): T | undefined;

  /**
   * Sets the value of the element at the index, or does nothing if the index is not valid.
   *
   * Used in: [[DefineOwnProperty]], [[Set]]
   *
   * @param index A numeric index, including non-safe integers, non-integers, negative zero, Infinity, -Infinity, and NaN.
   * @param value The value to set.
   */
  abstract [setElement](index: number, value: T): void;

  /**
   * Returns an iterable of all valid array indices.
   *
   * Once the object is non-extensible, this method should return a stable result.
   *
   * The returned iterable should generally satisfy the following conditions:
   *
   * - The iterable should not contain duplicate elements.
   * - [hasElement] should return `true` for all elements in the iterable.
   * - [hasElement] should return `false` for all numbers not in the iterable.
   * - So-called "array indices" should come first in the iteration order, in the ascending order.
   *   An array index is a non-negative integral number value less than 2^32 - 1.
   *   The negative zero is not an array index.
   * - Other number values should come next in the iteration order, in the ascending order.
   *
   * Used in: [[OwnPropertyKeys]], [[OwnPropertyKeys]], [[OwnPropertyKeys]], [[OwnPropertyKeys]]
   *
   * @returns An iterable of all valid array indices.
   */
  abstract [elementKeys](): Iterable<number>;
}

class IndexableHandler<T, U extends Indexable<T>> implements ProxyHandler<U> {
  proxyObject!: U;

  getOwnPropertyDescriptor(
    target: U,
    p: string | symbol,
  ): PropertyDescriptor | undefined {
    const index = parseIndex(p);
    if (index !== undefined) {
      const o = this.proxyObject;
      if (!o[hasElement](index)) {
        return undefined;
      }
      return {
        value: o[getElement](index),
        writable: true,
        enumerable: true,
        configurable: true,
      };
    }
    return Reflect.getOwnPropertyDescriptor(target, p);
  }

  has(target: U, p: string | symbol): boolean {
    const index = parseIndex(p);
    if (index !== undefined) {
      return this.proxyObject[hasElement](index);
    }
    return Reflect.has(target, p);
  }

  defineProperty(
    target: U,
    property: string | symbol,
    attributes: PropertyDescriptor,
  ): boolean {
    const index = parseIndex(property);
    if (index !== undefined) {
      const o = this.proxyObject;
      if (
        attributes.configurable === false ||
        attributes.enumerable === false ||
        "get" in attributes ||
        "set" in attributes ||
        attributes.writable === false ||
        !o[hasElement](index)
      ) {
        return false;
      }
      if ("value" in attributes) {
        o[setElement](index, attributes.value);
      }
      return true;
    }
    return Reflect.defineProperty(target, property, attributes);
  }

  get(target: U, p: string | symbol, receiver: any) {
    const index = parseIndex(p);
    if (index !== undefined) {
      return this.proxyObject[getElement](index);
    }
    return Reflect.get(target, p, receiver);
  }

  set(target: U, p: string | symbol, value: any, receiver: any): boolean {
    const index = parseIndex(p);
    if (index !== undefined) {
      const o = this.proxyObject;
      if (Object.is(o, receiver)) {
        o[setElement](index, value);
        return true;
      }
      if (!o[hasElement](index)) {
        return true;
      }
    }
    return Reflect.set(target, p, value, receiver);
  }

  deleteProperty(target: U, p: string | symbol): boolean {
    const index = parseIndex(p);
    if (index !== undefined) {
      return !this.proxyObject[hasElement](index);
    }
    return Reflect.deleteProperty(target, p);
  }

  ownKeys(target: U): ArrayLike<string | symbol> {
    const keys: string[] = [];
    for (const key of this.proxyObject[elementKeys]()) {
      keys.push(`${key}`);
    }
    for (const key of Reflect.ownKeys(target)) {
      if (typeof key === "string" && parseIndex(key) === undefined) {
        keys.push(key);
      }
    }
    return keys;
  }

  preventExtensions(target: U): boolean {
    if (Reflect.isExtensible(target)) {
      // Realize all elements in the target before extension is prevented.
      for (const key of this.proxyObject[elementKeys]()) {
        Object.defineProperty(target, `${key}`, {
          // Value can be arbitrary here, as the handler can still modify the read value.
          value: undefined,
          writable: true,
          enumerable: true,
          configurable: true,
        });
      }
    }
    // It must succeed, as the target is an ordinary object.
    return Reflect.preventExtensions(target);
  }
}

const nonIndexCache: Set<string> = new Set();

export function parseIndex(p: string | symbol): number | undefined {
  if (typeof p === "string") {
    if (nonIndexCache.has(p)) {
      return undefined;
    }
    const index = CanonicalNumericIndexString(p);
    if (index !== undefined) {
      return index;
    }
  }
  return undefined;
}

/**
 * Registers a property name to a precomputed set of known non-index names.
 *
 * @param p A property name to register.
 */
export function addNonIndexCache(p: string) {
  // Sanitize input
  p = `${p}`;
  if (parseIndex(p) === undefined) {
    nonIndexCache.add(p);
  }
}

for (const key of Object.getOwnPropertyNames(Object.prototype)) {
  addNonIndexCache(key);
}
