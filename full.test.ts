import {
  assert,
  assertEquals,
  assertInstanceOf,
  assertStrictEquals,
  assertThrows,
} from "@std/assert";
import {
  BigInt64Vec,
  BigUint64Vec,
  Float32Vec,
  Float64Vec,
  Int16Vec,
  Int32Vec,
  Int8Vec,
  TypedVec,
  Uint16Vec,
  Uint32Vec,
  Uint8ClampedVec,
  Uint8Vec,
} from "./full.ts";

Deno.test("TypedVec.BYTES_PER_ELEMENT", () => {
  assertEquals(Int8Vec.BYTES_PER_ELEMENT, 1);
  assertEquals(Uint8Vec.BYTES_PER_ELEMENT, 1);
  assertEquals(Uint8ClampedVec.BYTES_PER_ELEMENT, 1);
  assertEquals(Int16Vec.BYTES_PER_ELEMENT, 2);
  assertEquals(Uint16Vec.BYTES_PER_ELEMENT, 2);
  assertEquals(Int32Vec.BYTES_PER_ELEMENT, 4);
  assertEquals(Uint32Vec.BYTES_PER_ELEMENT, 4);
  assertEquals(Float32Vec.BYTES_PER_ELEMENT, 4);
  assertEquals(Float64Vec.BYTES_PER_ELEMENT, 8);
  assertEquals(BigInt64Vec.BYTES_PER_ELEMENT, 8);
  assertEquals(BigUint64Vec.BYTES_PER_ELEMENT, 8);
});

Deno.test("TypedVec.prototype.BYTES_PER_ELEMENT", () => {
  assertEquals(Int8Vec.prototype.BYTES_PER_ELEMENT, 1);
  assertEquals(Uint8Vec.prototype.BYTES_PER_ELEMENT, 1);
  assertEquals(Uint8ClampedVec.prototype.BYTES_PER_ELEMENT, 1);
  assertEquals(Int16Vec.prototype.BYTES_PER_ELEMENT, 2);
  assertEquals(Uint16Vec.prototype.BYTES_PER_ELEMENT, 2);
  assertEquals(Int32Vec.prototype.BYTES_PER_ELEMENT, 4);
  assertEquals(Uint32Vec.prototype.BYTES_PER_ELEMENT, 4);
  assertEquals(Float32Vec.prototype.BYTES_PER_ELEMENT, 4);
  assertEquals(Float64Vec.prototype.BYTES_PER_ELEMENT, 8);
  assertEquals(BigInt64Vec.prototype.BYTES_PER_ELEMENT, 8);
  assertEquals(BigUint64Vec.prototype.BYTES_PER_ELEMENT, 8);
});

Deno.test("TypedVec.TypedArray", () => {
  assertEquals(Int8Vec.TypedArray, Int8Array);
  assertEquals(Uint8Vec.TypedArray, Uint8Array);
  assertEquals(Uint8ClampedVec.TypedArray, Uint8ClampedArray);
  assertEquals(Int16Vec.TypedArray, Int16Array);
  assertEquals(Uint16Vec.TypedArray, Uint16Array);
  assertEquals(Int32Vec.TypedArray, Int32Array);
  assertEquals(Uint32Vec.TypedArray, Uint32Array);
  assertEquals(Float32Vec.TypedArray, Float32Array);
  assertEquals(Float64Vec.TypedArray, Float64Array);
  assertEquals(BigInt64Vec.TypedArray, BigInt64Array);
  assertEquals(BigUint64Vec.TypedArray, BigUint64Array);
});

Deno.test("TypedVec.prototype.asTypedArray() type", () => {
  assertInstanceOf(new Int8Vec(3).asTypedArray(), Int8Array);
  assertInstanceOf(new Uint8Vec(3).asTypedArray(), Uint8Array);
  assertInstanceOf(new Uint8ClampedVec(3).asTypedArray(), Uint8ClampedArray);
  assertInstanceOf(new Int16Vec(3).asTypedArray(), Int16Array);
  assertInstanceOf(new Uint16Vec(3).asTypedArray(), Uint16Array);
  assertInstanceOf(new Int32Vec(3).asTypedArray(), Int32Array);
  assertInstanceOf(new Uint32Vec(3).asTypedArray(), Uint32Array);
  assertInstanceOf(new Float32Vec(3).asTypedArray(), Float32Array);
  assertInstanceOf(new Float64Vec(3).asTypedArray(), Float64Array);
  assertInstanceOf(new BigInt64Vec(3).asTypedArray(), BigInt64Array);
  assertInstanceOf(new BigUint64Vec(3).asTypedArray(), BigUint64Array);
});

Deno.test("TypedVec.from without mapper", () => {
  const a = Int16Vec.from([10, 20, 30]);
  assertEquals(Array.from(a), [10, 20, 30]);
});

Deno.test("TypedVec.from with mapper", () => {
  const a = Int16Vec.from(
    [{ value: 10 }, { value: 20 }, { value: 30 }],
    (x) => x.value,
  );
  assertEquals(Array.from(a), [10, 20, 30]);
});

Deno.test("TypedVec.of", () => {
  const a = Int16Vec.of(10, 20, 30);
  assertEquals(Array.from(a), [10, 20, 30]);
});

Deno.test("TypedVec.prototype.buffer", () => {
  const a = new Int16Vec(3);
  assertInstanceOf(a.buffer, ArrayBuffer);
  assertEquals(a.buffer.byteLength, 6);
});

Deno.test("TypedVec.prototype.byteLength", () => {
  const a = new Int16Vec(3);
  assertEquals(a.byteLength, 6);
});

Deno.test("TypedVec.prototype.byteOffset", () => {
  const a = new Int16Vec(3);
  assertEquals(a.byteOffset, 0);
});

Deno.test("TypedVec.[[Get]](index) in-range", () => {
  const a = Object.assign(Int16Vec.of(10, 20, 30), {
    capacity: 6,
  });
  assertEquals(a[0], 10);
  assertEquals(a[1], 20);
  assertEquals(a[2], 30);
});

Deno.test("TypedVec.[[Get]](index) out-of-range", () => {
  const a = Object.assign(Int16Vec.of(10, 20, 30), {
    capacity: 6,
  });
  assertEquals(a[-2], undefined);
  assertEquals(a[-1], undefined);
  assertEquals(a[3], undefined);
  assertEquals(a[4], undefined);
  assertEquals(a[5], undefined);
  assertEquals(a[6], undefined);
  assertEquals(a[7], undefined);
});

Deno.test("TypedVec.[[Get]](index) others", () => {
  const a = Object.assign(Int16Vec.of(10, 20, 30), {
    capacity: 6,
  });
  // deno-lint-ignore no-explicit-any
  assertEquals(a["-0" as any], undefined);
  assertEquals(a[-0], 10);
  assertEquals(a[0.5], undefined);
  assertEquals(a[NaN], undefined);
  assertEquals(a[Infinity], undefined);
  assertEquals(a[-Infinity], undefined);
});

Deno.test("TypedVec.getElement in-range", () => {
  const a = Object.assign(Int16Vec.of(10, 20, 30), {
    capacity: 6,
  });
  assertEquals(a.getElement(0), 10);
  assertEquals(a.getElement(1), 20);
  assertEquals(a.getElement(2), 30);
});

Deno.test("TypedVec.getElement out-of-range", () => {
  const a = Object.assign(Int16Vec.of(10, 20, 30), {
    capacity: 6,
  });
  assertEquals(a.getElement(-2), undefined);
  assertEquals(a.getElement(-1), undefined);
  assertEquals(a.getElement(3), undefined);
  assertEquals(a.getElement(4), undefined);
  assertEquals(a.getElement(5), undefined);
  assertEquals(a.getElement(6), undefined);
  assertEquals(a.getElement(7), undefined);
});

Deno.test("TypedVec.getElement others", () => {
  const a = Object.assign(Int16Vec.of(10, 20, 30), {
    capacity: 6,
  });
  assertEquals(a.getElement(-0), 10);
  assertEquals(a.getElement(0.5), undefined);
  assertEquals(a.getElement(NaN), undefined);
  assertEquals(a.getElement(Infinity), undefined);
  assertEquals(a.getElement(-Infinity), undefined);
});

Deno.test("TypedVec.[[Set]](index) in-range", () => {
  const a = Object.assign(Int16Vec.of(10, 20, 30), {
    capacity: 6,
  });
  a[0] = 100;
  assertEquals(a[0], 100);
  a[1] = 200;
  assertEquals(a[1], 200);
  a[2] = 300;
  assertEquals(a[2], 300);
});

Deno.test("TypedVec.[[Set]](index) out-of-range", () => {
  const a = Object.assign(Int16Vec.of(10, 20, 30), {
    capacity: 6,
  });
  a[-2] = 100;
  assertEquals(a[-2], undefined);
  a[-1] = 100;
  assertEquals(a[-1], undefined);
  a[3] = 100;
  assertEquals(a[3], undefined);
  a[4] = 100;
  assertEquals(a[4], undefined);
  a[5] = 100;
  assertEquals(a[5], undefined);
  a[6] = 100;
  assertEquals(a[6], undefined);
  a[7] = 100;
  assertEquals(a[7], undefined);
});

Deno.test("TypedVec.[[Set]](index) others", () => {
  const a = Object.assign(Int16Vec.of(10, 20, 30), {
    capacity: 6,
  });
  // deno-lint-ignore no-explicit-any
  a["-0" as any] = 100;
  // deno-lint-ignore no-explicit-any
  assertEquals(a["-0" as any], undefined);
  a[-0] = 100;
  assertEquals(a[-0], 100);
  a[0.5] = 100;
  assertEquals(a[0.5], undefined);
  a[NaN] = 100;
  assertEquals(a[NaN], undefined);
  a[Infinity] = 100;
  assertEquals(a[Infinity], undefined);
  a[-Infinity] = 100;
  assertEquals(a[-Infinity], undefined);
});

Deno.test("TypedVec.setElement in-range", () => {
  const a = Object.assign(Int16Vec.of(10, 20, 30), {
    capacity: 6,
  });
  a.setElement(0, 100);
  assertEquals(a.getElement(0), 100);
  a.setElement(1, 200);
  assertEquals(a.getElement(1), 200);
  a.setElement(2, 300);
  assertEquals(a.getElement(2), 300);
});

Deno.test("TypedVec.setElement out-of-range", () => {
  const a = Object.assign(Int16Vec.of(10, 20, 30), {
    capacity: 6,
  });
  a.setElement(-2, 100);
  assertEquals(a.getElement(-2), undefined);
  a.setElement(-1, 100);
  assertEquals(a.getElement(-1), undefined);
  a.setElement(3, 100);
  assertEquals(a.getElement(3), undefined);
  a.setElement(4, 100);
  assertEquals(a.getElement(4), undefined);
  a.setElement(5, 100);
  assertEquals(a.getElement(5), undefined);
  a.setElement(6, 100);
  assertEquals(a.getElement(6), undefined);
  a.setElement(7, 100);
  assertEquals(a.getElement(7), undefined);
});

Deno.test("TypedVec.setElement others", () => {
  const a = Object.assign(Int16Vec.of(10, 20, 30), {
    capacity: 6,
  });
  a.setElement(-0, 100);
  assertEquals(a.getElement(-0), 100);
  a.setElement(0.5, 100);
  assertEquals(a.getElement(0.5), undefined);
  a.setElement(NaN, 100);
  assertEquals(a.getElement(NaN), undefined);
  a.setElement(Infinity, 100);
  assertEquals(a.getElement(Infinity), undefined);
  a.setElement(-Infinity, 100);
  assertEquals(a.getElement(-Infinity), undefined);
});

Deno.test("TypedVec.[[HasProperty]](index) in-range", () => {
  const a = Object.assign(Int16Vec.of(10, 20, 30), {
    capacity: 6,
  });
  assert(0 in a);
  assert(1 in a);
  assert(2 in a);
});

Deno.test("TypedVec.[[HasProperty]](index) out-of-range", () => {
  const a = Object.assign(Int16Vec.of(10, 20, 30), {
    capacity: 6,
  });
  assert(!((-2) in a));
  assert(!((-1) in a));
  assert(!(3 in a));
  assert(!(4 in a));
  assert(!(5 in a));
  assert(!(6 in a));
  assert(!(7 in a));
});

Deno.test("TypedVec.[[HasProperty]](index) others", () => {
  const a = Object.assign(Int16Vec.of(10, 20, 30), {
    capacity: 6,
  });
  assert(!("-0" in a));
  assert((-0) in a);
  assert(!(0.5 in a));
  assert(!(NaN in a));
  assert(!(Infinity in a));
  assert(!((-Infinity) in a));
});

Deno.test("TypedVec.hasElement in-range", () => {
  const a = Object.assign(Int16Vec.of(10, 20, 30), {
    capacity: 6,
  });
  assert(a.hasElement(0));
  assert(a.hasElement(1));
  assert(a.hasElement(2));
});

Deno.test("TypedVec.hasElement out-of-range", () => {
  const a = Object.assign(Int16Vec.of(10, 20, 30), {
    capacity: 6,
  });
  assert(!a.hasElement(-2));
  assert(!a.hasElement(-1));
  assert(!a.hasElement(3));
  assert(!a.hasElement(4));
  assert(!a.hasElement(5));
  assert(!a.hasElement(6));
  assert(!a.hasElement(7));
});

Deno.test("TypedVec.hasElement others", () => {
  const a = Object.assign(Int16Vec.of(10, 20, 30), {
    capacity: 6,
  });
  assert(a.hasElement(-0));
  assert(!a.hasElement(0.5));
  assert(!a.hasElement(NaN));
  assert(!a.hasElement(Infinity));
  assert(!a.hasElement(-Infinity));
});

Deno.test("TypedVec.[[OwnPropertyKeys]]", () => {
  const a = Object.assign(Int16Vec.of(10, 20, 30), {
    capacity: 6,
  });
  assertEquals(Object.keys(a), ["0", "1", "2"]);
});

Deno.test("TypedVec.prototype.get length", () => {
  const a = new Int16Vec(3);
  a.push(1, 2, 3, 4, 5);
  a.pop();
  a.pop();
  a.pop();
  a.pop();
  a.pop();
  assertEquals(a.length, 3);
});

Deno.test("TypedVec.prototype.set length (no change)", () => {
  const a = Int16Vec.of(10, 20, 30);
  a.length = 3;
  assertEquals(Array.from(a), [10, 20, 30]);
});

Deno.test("TypedVec.prototype.set length (truncation)", () => {
  const a = Int16Vec.of(10, 20, 30);
  a.length = 2;
  assertEquals(Array.from(a), [10, 20]);
});

Deno.test("TypedVec.prototype.set length (extension)", () => {
  const a = Int16Vec.of(10, 20, 30);
  a.length = 5;
  assertEquals(Array.from(a), [10, 20, 30, 0, 0]);
});

Deno.test("TypedVec.prototype.set length (extension - BigInt)", () => {
  const a = BigInt64Vec.of(10n, 20n, 30n);
  a.length = 5;
  assertEquals(Array.from(a), [10n, 20n, 30n, 0n, 0n]);
});

Deno.test("TypedVec.prototype.set length (non-extensible, no change)", () => {
  const a = Int16Vec.of(10, 20, 30);
  Object.preventExtensions(a);
  a.length = 3;
  assertEquals(Array.from(a), [10, 20, 30]);
});

Deno.test("TypedVec.prototype.set length (non-extensible, truncation)", () => {
  const a = Int16Vec.of(10, 20, 30);
  Object.preventExtensions(a);
  assertThrows(() => {
    a.length = 2;
  }, TypeError);
  assertEquals(Array.from(a), [10, 20, 30]);
});

Deno.test("TypedVec.prototype.set length (non-extensible, extension)", () => {
  const a = Int16Vec.of(10, 20, 30);
  Object.preventExtensions(a);
  assertThrows(() => {
    a.length = 5;
  }, TypeError);
  assertEquals(Array.from(a), [10, 20, 30]);
});

Deno.test("TypedVec.prototype.at", () => {
  const a = Object.assign(Int16Vec.of(10, 20, 30), { capacity: 6 });
  assertEquals(a.at(-4), undefined);
  assertEquals(a.at(-3), 10);
  assertEquals(a.at(-1), 30);
  assertEquals(a.at(0), 10);
  assertEquals(a.at(2), 30);
  assertEquals(a.at(3), undefined);
});

Deno.test("TypedVec.prototype.copyWithin", () => {
  const a = Object.assign(Int16Vec.of(10, 20, 30), { capacity: 6 });
  a.copyWithin(1, 0, 2);
  assertEquals(Array.from(a), [10, 10, 20]);
});

Deno.test("TypedVec.prototype.entries", () => {
  const a = Object.assign(Int16Vec.of(10, 20, 30), { capacity: 6 });
  const entries = a.entries();
  assertEquals(entries.next(), { value: [0, 10], done: false });
  assertEquals(entries.next(), { value: [1, 20], done: false });
  assertEquals(entries.next(), { value: [2, 30], done: false });
  assertEquals(entries.next(), { value: undefined, done: true });
});

Deno.test("TypedVec.prototype.every", () => {
  const a = Object.assign(Int16Vec.of(10, 20, 30), { capacity: 6 });
  assertEquals(a.every((x) => x > 5), true);
  assertEquals(a.every((x) => x > 15), false);
});

Deno.test("TypedVec.prototype.fill", () => {
  const a = Object.assign(Int16Vec.of(10, 20, 30), { capacity: 6 });
  a.fill(42);
  assertEquals(Array.from(a), [42, 42, 42]);
  a.fill(43, 1, 2);
  assertEquals(Array.from(a), [42, 43, 42]);
});

Deno.test("TypedVec.prototype.filter", () => {
  const a = Object.assign(Int16Vec.of(10, 20, 30), { capacity: 6 });
  const b = a.filter((x) => x > 15);
  assertEquals(Array.from(b), [20, 30]);
});

Deno.test("TypedVec.prototype.find", () => {
  const a = Object.assign(Int16Vec.of(10, 20, 30), { capacity: 6 });
  assertEquals(a.find((x) => x > 15), 20);
  assertEquals(a.find((x) => x > 25), 30);
  assertEquals(a.find((x) => x > 35), undefined);
});

Deno.test("TypedVec.prototype.findIndex", () => {
  const a = Object.assign(Int16Vec.of(10, 20, 30), { capacity: 6 });
  assertEquals(a.findIndex((x) => x > 15), 1);
  assertEquals(a.findIndex((x) => x > 25), 2);
  assertEquals(a.findIndex((x) => x > 35), -1);
});

Deno.test("TypedVec.prototype.findLast", () => {
  const a = Object.assign(Int16Vec.of(10, 20, 30), { capacity: 6 });
  assertEquals(a.findLast((x) => x > 15), 30);
  assertEquals(a.findLast((x) => x > 25), 30);
  assertEquals(a.findLast((x) => x > 35), undefined);
});

Deno.test("TypedVec.prototype.findLastIndex", () => {
  const a = Object.assign(Int16Vec.of(10, 20, 30), { capacity: 6 });
  assertEquals(a.findLastIndex((x) => x > 15), 2);
  assertEquals(a.findLastIndex((x) => x > 25), 2);
  assertEquals(a.findLastIndex((x) => x > 35), -1);
});

Deno.test("TypedVec.prototype.forEach", () => {
  const a = Object.assign(Int16Vec.of(10, 20, 30), { capacity: 6 });
  const b: number[] = [];
  a.forEach((x) => b.push(x));
  assertEquals(b, [10, 20, 30]);
});

Deno.test("TypedVec.prototype.includes", () => {
  const a = Object.assign(Int16Vec.of(10, 20, 30), { capacity: 6 });
  assertEquals(a.includes(20), true);
  assertEquals(a.includes(25), false);
});

Deno.test("TypedVec.prototype.indexOf", () => {
  const a = Object.assign(Int16Vec.of(10, 20, 30), { capacity: 6 });
  assertEquals(a.indexOf(20), 1);
  assertEquals(a.indexOf(25), -1);
});

Deno.test("TypedVec.prototype.join", () => {
  const a = Object.assign(Int16Vec.of(10, 20, 30), { capacity: 6 });
  assertEquals(a.join(), "10,20,30");
  assertEquals(a.join("-"), "10-20-30");
});

Deno.test("TypedVec.prototype.keys", () => {
  const a = Object.assign(Int16Vec.of(10, 20, 30), { capacity: 6 });
  const keys = a.keys();
  assertEquals(keys.next(), { value: 0, done: false });
  assertEquals(keys.next(), { value: 1, done: false });
  assertEquals(keys.next(), { value: 2, done: false });
  assertEquals(keys.next(), { value: undefined, done: true });
});

Deno.test("TypedVec.prototype.lastIndexOf", () => {
  const a = Object.assign(Int16Vec.of(10, 20, 30), { capacity: 6 });
  assertEquals(a.lastIndexOf(20), 1);
  assertEquals(a.lastIndexOf(25), -1);
});

Deno.test("TypedVec.prototype.map", () => {
  const a = Object.assign(Int16Vec.of(10, 20, 30), { capacity: 6 });
  const b = a.map((x) => x * 2);
  assertEquals(Array.from(b), [20, 40, 60]);
});

Deno.test("TypedVec.prototype.reduce", () => {
  const a = Object.assign(Int16Vec.of(10, 20, 30), { capacity: 6 });
  assertEquals(a.reduce((acc, x) => acc + x), 60);
  assertEquals(a.reduce<string>((acc, x) => `${acc},${x}`), "10,20,30");
  assertEquals(
    a.reduce<string | undefined>((acc, x) => `${acc},${x}`, undefined),
    "undefined,10,20,30",
  );
});

Deno.test("TypedVec.prototype.reduceRight", () => {
  const a = Object.assign(Int16Vec.of(10, 20, 30), { capacity: 6 });
  assertEquals(a.reduceRight((acc, x) => acc + x), 60);
  assertEquals(a.reduceRight<string>((acc, x) => `${acc},${x}`), "30,20,10");
  assertEquals(
    a.reduceRight<string | undefined>((acc, x) => `${acc},${x}`, undefined),
    "undefined,30,20,10",
  );
});

Deno.test("TypedVec.prototype.reverse", () => {
  const a = Object.assign(Int16Vec.of(10, 20, 30), { capacity: 6 });
  a.reverse();
  assertEquals(Array.from(a), [30, 20, 10]);
});

Deno.test("TypedVec.prototype.set", () => {
  const a = Object.assign(Int16Vec.of(10, 20, 30), { capacity: 6 });
  a.set([40, 50, 60]);
  assertEquals(Array.from(a), [40, 50, 60]);
  a.set([70, 80], 1);
  assertEquals(Array.from(a), [40, 70, 80]);
});

Deno.test("TypedVec.prototype.slice", () => {
  const a = Object.assign(Int16Vec.of(10, 20, 30), { capacity: 6 });
  const b = a.slice();
  assertEquals(Array.from(b), [10, 20, 30]);
  b.set([40, 50, 60]);
  assertEquals(Array.from(a), [10, 20, 30]);

  const c = a.slice(1);
  assertEquals(Array.from(c), [20, 30]);
  c.set([70, 80]);
  assertEquals(Array.from(a), [10, 20, 30]);

  const d = a.slice(1, 2);
  assertEquals(Array.from(d), [20]);
  d.set([70]);
  assertEquals(Array.from(a), [10, 20, 30]);
});

Deno.test("TypedVec.prototype.some", () => {
  const a = Object.assign(Int16Vec.of(10, 20, 30), { capacity: 6 });
  assertEquals(a.some((x) => x > 15), true);
  assertEquals(a.some((x) => x > 25), true);
  assertEquals(a.some((x) => x > 35), false);
});

Deno.test("TypedVec.prototype.sort", () => {
  const a = Object.assign(Int16Vec.of(30, 10, 20), { capacity: 6 });
  a.sort();
  assertEquals(Array.from(a), [10, 20, 30]);
  a.sort((a, b) => b - a);
  assertEquals(Array.from(a), [30, 20, 10]);
});

Deno.test("TypedVec.prototype.subarray", () => {
  const a = Object.assign(Int16Vec.of(10, 20, 30), { capacity: 6 });
  const b = a.subarray(1, 2);
  assertEquals(Array.from(b), [20]);
  b.set([70]);
  assertEquals(Array.from(a), [10, 70, 30]);
});

Deno.test("TypedVec.prototype.toLocaleString", () => {
  const a = Object.assign(Int16Vec.of(10, 20, 30), { capacity: 6 });
  assertEquals(a.toLocaleString(), "10,20,30");
});

Deno.test("TypedVec.prototype.toReversed", () => {
  const a = Object.assign(Int16Vec.of(10, 20, 30), { capacity: 6 });
  const b = a.toReversed();
  assertEquals(Array.from(b), [30, 20, 10]);
  assertEquals(Array.from(a), [10, 20, 30]);
});

Deno.test("TypedVec.prototype.toSorted", () => {
  const a = Object.assign(Int16Vec.of(30, 10, 20), { capacity: 6 });
  const b = a.toSorted();
  assertEquals(Array.from(b), [10, 20, 30]);
  assertEquals(Array.from(a), [30, 10, 20]);
});

Deno.test("TypedVec.prototype.toString", () => {
  const a = Object.assign(Int16Vec.of(10, 20, 30), { capacity: 6 });
  assertEquals(a.toString(), "10,20,30");
});

Deno.test("TypedVec.prototype.values", () => {
  const a = Object.assign(Int16Vec.of(10, 20, 30), { capacity: 6 });
  const values = a.values();
  assertEquals(values.next(), { value: 10, done: false });
  assertEquals(values.next(), { value: 20, done: false });
  assertEquals(values.next(), { value: 30, done: false });
  assertEquals(values.next(), { value: undefined, done: true });
});

Deno.test("TypedVec.prototype.with", () => {
  const a = Object.assign(Int16Vec.of(10, 20, 30), { capacity: 6 });
  const b = a.with(1, 100);
  assertEquals(Array.from(b), [10, 100, 30]);
  assertEquals(Array.from(a), [10, 20, 30]);
});

Deno.test("TypedVec.prototype[Symbol.iterator]", () => {
  assertStrictEquals(
    TypedVec.prototype[Symbol.iterator],
    TypedVec.prototype.values,
  );
});

Deno.test("TypedVec.prototype[Symbol.toStringTag]", () => {
  assertEquals(new Int8Vec()[Symbol.toStringTag], "Int8Vec");
  assertEquals(new Uint8Vec()[Symbol.toStringTag], "Uint8Vec");
  assertEquals(new Uint8ClampedVec()[Symbol.toStringTag], "Uint8ClampedVec");
  assertEquals(new Int16Vec()[Symbol.toStringTag], "Int16Vec");
  assertEquals(new Uint16Vec()[Symbol.toStringTag], "Uint16Vec");
  assertEquals(new Int32Vec()[Symbol.toStringTag], "Int32Vec");
  assertEquals(new Uint32Vec()[Symbol.toStringTag], "Uint32Vec");
  assertEquals(new Float32Vec()[Symbol.toStringTag], "Float32Vec");
  assertEquals(new Float64Vec()[Symbol.toStringTag], "Float64Vec");
  assertEquals(new BigInt64Vec()[Symbol.toStringTag], "BigInt64Vec");
  assertEquals(new BigUint64Vec()[Symbol.toStringTag], "BigUint64Vec");
});

Deno.test("TypedVec.prototype.pop (non-empty)", () => {
  const a = Object.assign(Int16Vec.of(10, 20, 30), { capacity: 6 });
  assertEquals(a.pop(), 30);
  assertEquals(Array.from(a), [10, 20]);
});

Deno.test("TypedVec.prototype.pop (empty)", () => {
  const a = Object.assign(Int16Vec.of(), { capacity: 6 });
  assertEquals(a.pop(), undefined);
  assertEquals(Array.from(a), []);
});

Deno.test("TypedVec.prototype.pop (extension prevented, non-empty)", () => {
  const a = Object.assign(Int16Vec.of(10, 20, 30), { capacity: 6 });
  Object.preventExtensions(a);
  assertThrows(() => {
    a.pop();
  }, TypeError);
  assertEquals(Array.from(a), [10, 20, 30]);
});

Deno.test("TypedVec.prototype.pop (extension prevented, empty)", () => {
  const a = Object.assign(Int16Vec.of(), { capacity: 6 });
  Object.preventExtensions(a);
  assertEquals(a.pop(), undefined);
  assertEquals(Array.from(a), []);
});

Deno.test("TypedVec.prototype.push (ordinary case)", () => {
  const a = Object.assign(Int16Vec.of(10, 20, 30), { capacity: 6 });
  const ret = a.push(40, 50);
  assertEquals(ret, 5);
  assertEquals(Array.from(a), [10, 20, 30, 40, 50]);
});

Deno.test("TypedVec.prototype.push (extension prevented, pushing one or more)", () => {
  const a = Object.assign(Int16Vec.of(10, 20, 30), { capacity: 6 });
  Object.preventExtensions(a);
  assertThrows(() => {
    a.push(40, 50);
  }, TypeError);
  assertEquals(Array.from(a), [10, 20, 30]);
});

Deno.test("TypedVec.prototype.push (extension prevented, pushing none)", () => {
  const a = Object.assign(Int16Vec.of(10, 20, 30), { capacity: 6 });
  Object.preventExtensions(a);
  const ret = a.push();
  assertEquals(ret, 3);
  assertEquals(Array.from(a), [10, 20, 30]);
});

Deno.test("TypedVec.prototype.shift (non-empty)", () => {
  const a = Object.assign(Int16Vec.of(10, 20, 30), { capacity: 6 });
  assertEquals(a.shift(), 10);
  assertEquals(Array.from(a), [20, 30]);
});

Deno.test("TypedVec.prototype.shift (empty)", () => {
  const a = Object.assign(Int16Vec.of(), { capacity: 6 });
  assertEquals(a.shift(), undefined);
  assertEquals(Array.from(a), []);
});

Deno.test("TypedVec.prototype.shift (extension prevented, non-empty)", () => {
  const a = Object.assign(Int16Vec.of(10, 20, 30), { capacity: 6 });
  Object.preventExtensions(a);
  assertThrows(() => {
    a.shift();
  }, TypeError);
  assertEquals(Array.from(a), [10, 20, 30]);
});

Deno.test("TypedVec.prototype.shift (extension prevented, empty)", () => {
  const a = Object.assign(Int16Vec.of(), { capacity: 6 });
  Object.preventExtensions(a);
  assertEquals(a.shift(), undefined);
  assertEquals(Array.from(a), []);
});

Deno.test("TypedVec.prototype.splice (no deletion, no insertion)", () => {
  const a = Object.assign(Int16Vec.of(10, 20, 30), { capacity: 6 });
  const b = a.splice(1, 0);
  assertEquals(Array.from(a), [10, 20, 30]);
  assertEquals(Array.from(b), []);
});

Deno.test("TypedVec.prototype.splice (deletion only)", () => {
  const a = Object.assign(Int16Vec.of(10, 20, 30), { capacity: 6 });
  const b = a.splice(1, 2);
  assertEquals(Array.from(a), [10]);
  assertEquals(Array.from(b), [20, 30]);
});

Deno.test("TypedVec.prototype.splice (insertion only)", () => {
  const a = Object.assign(Int16Vec.of(10, 20, 30), { capacity: 6 });
  const b = a.splice(1, 0, 40, 50);
  assertEquals(Array.from(a), [10, 40, 50, 20, 30]);
  assertEquals(Array.from(b), []);
});

Deno.test("TypedVec.prototype.splice (deletion and insertion)", () => {
  const a = Object.assign(Int16Vec.of(10, 20, 30), { capacity: 6 });
  const b = a.splice(1, 2, 40, 50);
  assertEquals(Array.from(a), [10, 40, 50]);
  assertEquals(Array.from(b), [20, 30]);
});

Deno.test("TypedVec.prototype.splice (extension prevented, no deletion, no insertion)", () => {
  const a = Object.assign(Int16Vec.of(10, 20, 30), { capacity: 6 });
  Object.preventExtensions(a);
  a.splice(1, 0);
  assertEquals(Array.from(a), [10, 20, 30]);
});

Deno.test("TypedVec.prototype.splice (extension prevented, deletion only)", () => {
  const a = Object.assign(Int16Vec.of(10, 20, 30), { capacity: 6 });
  Object.preventExtensions(a);
  assertThrows(() => {
    a.splice(1, 2);
  }, TypeError);
  assertEquals(Array.from(a), [10, 20, 30]);
});

Deno.test("TypedVec.prototype.splice (extension prevented, insertion only)", () => {
  const a = Object.assign(Int16Vec.of(10, 20, 30), { capacity: 6 });
  Object.preventExtensions(a);
  assertThrows(() => {
    a.splice(1, 0, 40, 50);
  }, TypeError);
  assertEquals(Array.from(a), [10, 20, 30]);
});

Deno.test("TypedVec.prototype.splice (extension prevented, number of deletion and insertion matches)", () => {
  const a = Object.assign(Int16Vec.of(10, 20, 30), { capacity: 6 });
  Object.preventExtensions(a);
  a.splice(1, 2, 40, 50);
  assertEquals(Array.from(a), [10, 40, 50]);
});

Deno.test("TypedVec.prototype.unshift (ordinary case)", () => {
  const a = Object.assign(Int16Vec.of(10, 20, 30), { capacity: 6 });
  const ret = a.unshift(40, 50);
  assertEquals(ret, 5);
  assertEquals(Array.from(a), [40, 50, 10, 20, 30]);
});

Deno.test("TypedVec.prototype.unshift (extension prevented, unshifting one or more)", () => {
  const a = Object.assign(Int16Vec.of(10, 20, 30), { capacity: 6 });
  Object.preventExtensions(a);
  assertThrows(() => {
    a.unshift(40, 50);
  }, TypeError);
  assertEquals(Array.from(a), [10, 20, 30]);
});

Deno.test("TypedVec.prototype.unshift (extension prevented, unshifting none)", () => {
  const a = Object.assign(Int16Vec.of(10, 20, 30), { capacity: 6 });
  Object.preventExtensions(a);
  const ret = a.unshift();
  assertEquals(ret, 3);
  assertEquals(Array.from(a), [10, 20, 30]);
});
