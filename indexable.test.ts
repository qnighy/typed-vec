import { assert, assertEquals, assertThrows } from "@std/assert";
import { type Spy, spy } from "@std/testing/mock";
import {
  elementKeys,
  getElement,
  hasElement,
  Indexable,
  setElement,
} from "./indexable.ts";

class MyIndexable<T> extends Indexable<T> {
  #hasElementSpy: Spy<undefined, [index: number], boolean>;
  #getElementSpy: Spy<undefined, [index: number], T | undefined>;
  #setElementSpy: Spy<undefined, [index: number, value: T], void>;
  #elementKeysSpy: Spy<undefined, [], Iterable<number>>;

  constructor(
    options: {
      hasElement?(index: number): boolean;
      getElement?(index: number): T | undefined;
      setElement?(index: number, value: T): void;
      elementKeys?(): Iterable<number>;
    } = {},
  ) {
    super();
    this.#hasElementSpy = spy(options.hasElement!);
    this.#getElementSpy = spy(options.getElement!);
    this.#setElementSpy = spy(options.setElement!);
    this.#elementKeysSpy = spy(options.elementKeys!);
  }

  get hasElementSpy() {
    return this.#hasElementSpy;
  }
  get getElementSpy() {
    return this.#getElementSpy;
  }
  get setElementSpy() {
    return this.#setElementSpy;
  }
  get elementKeysSpy() {
    return this.#elementKeysSpy;
  }

  [hasElement](index: number): boolean {
    return this.#hasElementSpy.call(undefined, index);
  }
  [getElement](index: number): T | undefined {
    return this.#getElementSpy.call(undefined, index);
  }
  [setElement](index: number, value: T): void {
    this.#setElementSpy.call(undefined, index, value);
  }
  [elementKeys](): Iterable<number> {
    return this.#elementKeysSpy.call(undefined);
  }
}

Deno.test("Indexable.[[GetOwnProperty]] non-number passthru (String)", () => {
  const obj = Object.assign(new MyIndexable(), {
    foo: "bar",
  });
  assertEquals(Object.getOwnPropertyDescriptor(obj, "foo"), {
    value: "bar",
    writable: true,
    enumerable: true,
    configurable: true,
  });
  assertEquals(obj.hasElementSpy.calls, []);
  assertEquals(obj.getElementSpy.calls, []);
});

Deno.test("Indexable.[[GetOwnProperty]] non-number passthru (Symbol)", () => {
  const obj = Object.assign(new MyIndexable(), {
    [Symbol.toStringTag]: "MyIndexable",
  });
  assertEquals(Object.getOwnPropertyDescriptor(obj, Symbol.toStringTag), {
    value: "MyIndexable",
    writable: true,
    enumerable: true,
    configurable: true,
  });
  assertEquals(obj.hasElementSpy.calls, []);
  assertEquals(obj.getElementSpy.calls, []);
});

Deno.test("Indexable.[[GetOwnProperty]] number (has case) 0", () => {
  const obj = new MyIndexable({
    hasElement: () => true,
    getElement: () => 42,
  });
  assertEquals(Object.getOwnPropertyDescriptor(obj, "0"), {
    value: 42,
    writable: true,
    enumerable: true,
    configurable: true,
  });
  assertEquals(obj.hasElementSpy.calls, [{ args: [0], returned: true }]);
  assertEquals(obj.getElementSpy.calls, [{ args: [0], returned: 42 }]);
});

Deno.test("Indexable.[[GetOwnProperty]] number (has case) 1", () => {
  const obj = new MyIndexable({
    hasElement: () => true,
    getElement: () => 42,
  });
  assertEquals(Object.getOwnPropertyDescriptor(obj, "1"), {
    value: 42,
    writable: true,
    enumerable: true,
    configurable: true,
  });
  assertEquals(obj.hasElementSpy.calls, [{ args: [1], returned: true }]);
  assertEquals(obj.getElementSpy.calls, [{ args: [1], returned: 42 }]);
});

Deno.test("Indexable.[[GetOwnProperty]] number (has case) large scientific integer", () => {
  const obj = new MyIndexable({
    hasElement: () => true,
    getElement: () => 42,
  });
  assertEquals(Object.getOwnPropertyDescriptor(obj, "1e+21"), {
    value: 42,
    writable: true,
    enumerable: true,
    configurable: true,
  });
  assertEquals(obj.hasElementSpy.calls, [{ args: [1e+21], returned: true }]);
  assertEquals(obj.getElementSpy.calls, [{ args: [1e+21], returned: 42 }]);
});

Deno.test("Indexable.[[GetOwnProperty]] number (has case) infinity", () => {
  const obj = new MyIndexable({
    hasElement: () => true,
    getElement: () => 42,
  });
  assertEquals(Object.getOwnPropertyDescriptor(obj, "Infinity"), {
    value: 42,
    writable: true,
    enumerable: true,
    configurable: true,
  });
  assertEquals(obj.hasElementSpy.calls, [{ args: [Infinity], returned: true }]);
  assertEquals(obj.getElementSpy.calls, [{ args: [Infinity], returned: 42 }]);
});

Deno.test("Indexable.[[GetOwnProperty]] number (has case) negative number", () => {
  const obj = new MyIndexable({
    hasElement: () => true,
    getElement: () => 42,
  });
  assertEquals(Object.getOwnPropertyDescriptor(obj, "-1"), {
    value: 42,
    writable: true,
    enumerable: true,
    configurable: true,
  });
  assertEquals(obj.hasElementSpy.calls, [{ args: [-1], returned: true }]);
  assertEquals(obj.getElementSpy.calls, [{ args: [-1], returned: 42 }]);
});

Deno.test("Indexable.[[GetOwnProperty]] number (has case) negative zero", () => {
  const obj = new MyIndexable({
    hasElement: () => true,
    getElement: () => 42,
  });
  assertEquals(Object.getOwnPropertyDescriptor(obj, "-0"), {
    value: 42,
    writable: true,
    enumerable: true,
    configurable: true,
  });
  assertEquals(obj.hasElementSpy.calls, [{ args: [-0], returned: true }]);
  assertEquals(obj.getElementSpy.calls, [{ args: [-0], returned: 42 }]);
});

Deno.test("Indexable.[[GetOwnProperty]] number (has case) non-integer", () => {
  const obj = new MyIndexable({
    hasElement: () => true,
    getElement: () => 42,
  });
  assertEquals(Object.getOwnPropertyDescriptor(obj, "0.5"), {
    value: 42,
    writable: true,
    enumerable: true,
    configurable: true,
  });
  assertEquals(obj.hasElementSpy.calls, [{ args: [0.5], returned: true }]);
  assertEquals(obj.getElementSpy.calls, [{ args: [0.5], returned: 42 }]);
});

Deno.test("Indexable.[[GetOwnProperty]] number (has case) NaN", () => {
  const obj = new MyIndexable({
    hasElement: () => true,
    getElement: () => 42,
  });
  assertEquals(Object.getOwnPropertyDescriptor(obj, "NaN"), {
    value: 42,
    writable: true,
    enumerable: true,
    configurable: true,
  });
  assertEquals(obj.hasElementSpy.calls, [{ args: [NaN], returned: true }]);
  assertEquals(obj.getElementSpy.calls, [{ args: [NaN], returned: 42 }]);
});

Deno.test("Indexable.[[GetOwnProperty]] number (does-not-have case)", () => {
  const obj = new MyIndexable({
    hasElement: () => false,
    getElement: () => 42,
  });
  assertEquals(Object.getOwnPropertyDescriptor(obj, "123"), undefined);
  assertEquals(obj.hasElementSpy.calls, [{ args: [123], returned: false }]);
  assertEquals(obj.getElementSpy.calls, []);
});

Deno.test("Indexable.[[GetOwnProperty]] frozen non-number", () => {
  const obj = Object.assign(
    new MyIndexable({
      elementKeys: () => [],
    }),
    {
      foo: "bar",
    },
  );
  Object.preventExtensions(obj);
  assertEquals(Object.getOwnPropertyDescriptor(obj, "foo"), {
    value: "bar",
    writable: true,
    enumerable: true,
    configurable: true,
  });
  assertEquals(obj.hasElementSpy.calls, []);
  assertEquals(obj.getElementSpy.calls, []);
  assertEquals(obj.elementKeysSpy.calls, [{ args: [], returned: [] }]);
});

Deno.test("Indexable.[[GetOwnProperty]] frozen number, has case", () => {
  const obj = new MyIndexable({
    hasElement: (index) => [0, 1, 123].includes(index),
    getElement: () => 42,
    elementKeys: () => [0, 1, 123],
  });
  Object.preventExtensions(obj);
  assertEquals(Object.getOwnPropertyDescriptor(obj, "123"), {
    value: 42,
    writable: true,
    enumerable: true,
    configurable: true,
  });
  assertEquals(obj.hasElementSpy.calls, [{ args: [123], returned: true }]);
  assertEquals(obj.getElementSpy.calls, [{ args: [123], returned: 42 }]);
  assertEquals(obj.elementKeysSpy.calls, [{ args: [], returned: [0, 1, 123] }]);
});

Deno.test("Indexable.[[GetOwnProperty]] frozen number, does-not-have case", () => {
  const obj = new MyIndexable({
    hasElement: (index) => [0, 1].includes(index),
    elementKeys: () => [0, 1],
  });
  Object.preventExtensions(obj);
  assertEquals(Object.getOwnPropertyDescriptor(obj, "123"), undefined);
  assertEquals(obj.hasElementSpy.calls, [{ args: [123], returned: false }]);
  assertEquals(obj.getElementSpy.calls, []);
  assertEquals(obj.elementKeysSpy.calls, [{ args: [], returned: [0, 1] }]);
});

Deno.test("Indexable.[[HasProperty]] non-number passthru", () => {
  const obj = Object.assign(new MyIndexable(), {
    foo: "bar",
  });
  assert("foo" in obj);
  assert(!("bar" in obj));
  assertEquals(obj.hasElementSpy.calls, []);
});

Deno.test("Indexable.[[HasProperty]] number (has case)", () => {
  const obj = new MyIndexable({
    hasElement: () => true,
  });
  assert("123" in obj);
  assertEquals(obj.hasElementSpy.calls, [{ args: [123], returned: true }]);
});

Deno.test("Indexable.[[HasProperty]] number (does-not-have case)", () => {
  const obj = new MyIndexable({
    hasElement: () => false,
  });
  assert(!("123" in obj));
  assertEquals(obj.hasElementSpy.calls, [{ args: [123], returned: false }]);
});

Deno.test("Indexable.[[HasProperty]] frozen non-number", () => {
  const obj = Object.assign(
    new MyIndexable({
      elementKeys: () => [],
    }),
    {
      foo: "bar",
    },
  );
  Object.preventExtensions(obj);
  assert("foo" in obj);
  assert(!("bar" in obj));
  assertEquals(obj.hasElementSpy.calls, []);
  assertEquals(obj.elementKeysSpy.calls, [{ args: [], returned: [] }]);
});

Deno.test("Indexable.[[HasProperty]] frozen number, has case", () => {
  const obj = new MyIndexable({
    hasElement: (index) => [0, 1, 123].includes(index),
    elementKeys: () => [0, 1, 123],
  });
  Object.preventExtensions(obj);
  assert("123" in obj);
  assertEquals(obj.hasElementSpy.calls, [{ args: [123], returned: true }]);
  assertEquals(obj.elementKeysSpy.calls, [{ args: [], returned: [0, 1, 123] }]);
});

Deno.test("Indexable.[[HasProperty]] frozen number, does-not-have case", () => {
  const obj = new MyIndexable({
    hasElement: (index) => [0, 1].includes(index),
    elementKeys: () => [0, 1],
  });
  Object.preventExtensions(obj);
  assert(!("123" in obj));
  assertEquals(obj.hasElementSpy.calls, [{ args: [123], returned: false }]);
  assertEquals(obj.elementKeysSpy.calls, [{ args: [], returned: [0, 1] }]);
});

Deno.test("Indexable.[[DefineOwnProperty]] non-number passthru", () => {
  const obj = new MyIndexable();
  Object.defineProperty(obj, "foo", {
    value: "bar",
    writable: true,
    enumerable: true,
    configurable: true,
  });
  assertEquals((obj as unknown as Record<string, unknown>).foo, "bar");
});

Deno.test("Indexable.[[DefineOwnProperty]] number (has case) default params", () => {
  const obj = new MyIndexable({
    hasElement: () => true,
  });
  Object.defineProperty(obj, "123", {
    value: 42,
  });
  assertEquals(obj.hasElementSpy.calls, [{ args: [123], returned: true }]);
  assertEquals(obj.setElementSpy.calls, [{
    args: [123, 42],
    returned: undefined,
  }]);
});

Deno.test("Indexable.[[DefineOwnProperty]] number (has case) with undefined value", () => {
  const obj = new MyIndexable({
    hasElement: () => true,
  });
  Object.defineProperty(obj, "123", {
    value: undefined,
  });
  assertEquals(obj.hasElementSpy.calls, [{ args: [123], returned: true }]);
  assertEquals(obj.setElementSpy.calls, [{
    args: [123, undefined],
    returned: undefined,
  }]);
});

Deno.test("Indexable.[[DefineOwnProperty]] number (has case) without value", () => {
  const obj = new MyIndexable({
    hasElement: () => true,
  });
  Object.defineProperty(obj, "123", {});
  assertEquals(obj.hasElementSpy.calls, [{ args: [123], returned: true }]);
  assertEquals(obj.setElementSpy.calls, []);
});

Deno.test("Indexable.[[DefineOwnProperty]] number (has case) all params set to true", () => {
  const obj = new MyIndexable({
    hasElement: () => true,
  });
  Object.defineProperty(obj, "123", {
    value: 42,
    writable: true,
    enumerable: true,
    configurable: true,
  });
  assertEquals(obj.hasElementSpy.calls, [{ args: [123], returned: true }]);
  assertEquals(obj.setElementSpy.calls, [{
    args: [123, 42],
    returned: undefined,
  }]);
});

Deno.test("Indexable.[[DefineOwnProperty]] number (has case) non-writable", () => {
  const obj = new MyIndexable({
    hasElement: () => true,
  });
  assertThrows(() => {
    Object.defineProperty(obj, "123", {
      value: 42,
      writable: false,
    });
  }, TypeError);
  assertEquals(obj.hasElementSpy.calls, []);
  assertEquals(obj.setElementSpy.calls, []);
});

Deno.test("Indexable.[[DefineOwnProperty]] number (has case) non-configurable", () => {
  const obj = new MyIndexable({
    hasElement: () => true,
  });
  assertThrows(() => {
    Object.defineProperty(obj, "123", {
      value: 42,
      configurable: false,
    });
  }, TypeError);
  assertEquals(obj.hasElementSpy.calls, []);
  assertEquals(obj.setElementSpy.calls, []);
});

Deno.test("Indexable.[[DefineOwnProperty]] number (has case) non-enumerable", () => {
  const obj = new MyIndexable({
    hasElement: () => true,
  });
  assertThrows(() => {
    Object.defineProperty(obj, "123", {
      value: 42,
      enumerable: false,
    });
  }, TypeError);
  assertEquals(obj.hasElementSpy.calls, []);
  assertEquals(obj.setElementSpy.calls, []);
});

Deno.test("Indexable.[[DefineOwnProperty]] number (has case) with get", () => {
  const obj = new MyIndexable({
    hasElement: () => true,
  });
  assertThrows(() => {
    Object.defineProperty(obj, "123", {
      get: () => 42,
    });
  }, TypeError);
  assertEquals(obj.hasElementSpy.calls, []);
  assertEquals(obj.setElementSpy.calls, []);
});

Deno.test("Indexable.[[DefineOwnProperty]] number (has case) with undefined get", () => {
  const obj = new MyIndexable({
    hasElement: () => true,
  });
  assertThrows(() => {
    Object.defineProperty(obj, "123", {
      get: undefined,
    });
  }, TypeError);
  assertEquals(obj.hasElementSpy.calls, []);
  assertEquals(obj.setElementSpy.calls, []);
});

Deno.test("Indexable.[[DefineOwnProperty]] number (has case) with set", () => {
  const obj = new MyIndexable({
    hasElement: () => true,
  });
  assertThrows(() => {
    Object.defineProperty(obj, "123", {
      set: () => {},
    });
  }, TypeError);
  assertEquals(obj.hasElementSpy.calls, []);
  assertEquals(obj.setElementSpy.calls, []);
});

Deno.test("Indexable.[[DefineOwnProperty]] number (has case) with undefined set", () => {
  const obj = new MyIndexable({
    hasElement: () => true,
  });
  assertThrows(() => {
    Object.defineProperty(obj, "123", {
      set: undefined,
    });
  }, TypeError);
  assertEquals(obj.hasElementSpy.calls, []);
  assertEquals(obj.setElementSpy.calls, []);
});

Deno.test("Indexable.[[DefineOwnProperty]] number (does-not-have case)", () => {
  const obj = new MyIndexable({
    hasElement: () => false,
  });
  assertThrows(() => {
    Object.defineProperty(obj, "123", {
      value: 42,
    });
  }, TypeError);
  assertEquals(obj.hasElementSpy.calls, [{ args: [123], returned: false }]);
  assertEquals(obj.setElementSpy.calls, []);
});

Deno.test("Indexable.[[DefineOwnProperty]] frozen non-number, predefined case", () => {
  const obj = Object.assign(
    new MyIndexable({
      elementKeys: () => [],
    }),
    {
      foo: "bar",
    },
  );
  Object.preventExtensions(obj);
  Object.defineProperty(obj, "foo", {
    value: "baz",
  });
  assertEquals(obj.foo, "baz");
  assertEquals(obj.hasElementSpy.calls, []);
  assertEquals(obj.elementKeysSpy.calls, [{ args: [], returned: [] }]);
});

Deno.test("Indexable.[[DefineOwnProperty]] frozen non-number, new case", () => {
  const obj = Object.assign(
    new MyIndexable({
      elementKeys: () => [],
    }),
    {
      foo: "bar",
    },
  );
  Object.preventExtensions(obj);
  assertThrows(() => {
    Object.defineProperty(obj, "bar", {
      value: "baz",
    });
  }, TypeError);
  assertEquals((obj as unknown as Record<string, unknown>).bar, undefined);
  assertEquals(obj.hasElementSpy.calls, []);
  assertEquals(obj.elementKeysSpy.calls, [{ args: [], returned: [] }]);
});

Deno.test("Indexable.[[DefineOwnProperty]] frozen number, has case", () => {
  const obj = new MyIndexable({
    hasElement: (index) => [0, 1, 123].includes(index),
    elementKeys: () => [0, 1, 123],
  });
  Object.preventExtensions(obj);
  Object.defineProperty(obj, "123", {
    value: 42,
  });
  assertEquals(obj.hasElementSpy.calls, [{ args: [123], returned: true }]);
  assertEquals(obj.setElementSpy.calls, [{
    args: [123, 42],
    returned: undefined,
  }]);
  assertEquals(obj.elementKeysSpy.calls, [{ args: [], returned: [0, 1, 123] }]);
});

Deno.test("Indexable.[[DefineOwnProperty]] frozen number, does-not-have case", () => {
  const obj = new MyIndexable({
    hasElement: (index) => [0, 1].includes(index),
    elementKeys: () => [0, 1],
  });
  Object.preventExtensions(obj);
  assertThrows(() => {
    Object.defineProperty(obj, "123", {
      value: 42,
    });
  }, TypeError);
  assertEquals(obj.hasElementSpy.calls, [{ args: [123], returned: false }]);
  assertEquals(obj.setElementSpy.calls, []);
  assertEquals(obj.elementKeysSpy.calls, [{ args: [], returned: [0, 1] }]);
});

Deno.test("Indexable.[[Get]] non-number passthru", () => {
  const obj = new MyIndexable();
  assertEquals(obj.toString, Object.prototype.toString);
});

Deno.test("Indexable.[[Get]] number", () => {
  const obj = new MyIndexable({
    getElement: () => 42,
  });
  assertEquals(obj["123"], 42);
});

Deno.test("Indexable.[[Get]] frozen non-number", () => {
  const obj = Object.assign(
    new MyIndexable({
      elementKeys: () => [],
    }),
    {
      foo: "bar",
    },
  );
  Object.preventExtensions(obj);
  assertEquals(obj.foo, "bar");
  assertEquals(obj.getElementSpy.calls, []);
  assertEquals(obj.elementKeysSpy.calls, [{ args: [], returned: [] }]);
});

Deno.test("Indexable.[[Get]] frozen number, has case", () => {
  const obj = new MyIndexable({
    hasElement: (index) => [0, 1, 123].includes(index),
    getElement: () => 42,
    elementKeys: () => [0, 1, 123],
  });
  Object.preventExtensions(obj);
  assertEquals(obj["123"], 42);
  assertEquals(obj.hasElementSpy.calls, []);
  assertEquals(obj.getElementSpy.calls, [{ args: [123], returned: 42 }]);
  assertEquals(obj.elementKeysSpy.calls, [{ args: [], returned: [0, 1, 123] }]);
});

Deno.test("Indexable.[[Get]] frozen number, does-not-have case", () => {
  const obj = new MyIndexable({
    hasElement: (index) => [0, 1].includes(index),
    elementKeys: () => [0, 1],
  });
  Object.preventExtensions(obj);
  assertEquals(obj["123"], undefined);
  assertEquals(obj.hasElementSpy.calls, []);
  assertEquals(obj.getElementSpy.calls, [{ args: [123], returned: undefined }]);
  assertEquals(obj.elementKeysSpy.calls, [{ args: [], returned: [0, 1] }]);
});

Deno.test("Indexable.[[Set]] non-number passthru", () => {
  const obj = new MyIndexable() as unknown as Record<string, unknown>;
  obj.foo = "bar";
  assertEquals(obj.foo, "bar");
});

Deno.test("Indexable.[[Set]] number (direct case)", () => {
  const obj = new MyIndexable();
  obj["123"] = 42;
  assertEquals(obj.setElementSpy.calls, [{
    args: [123, 42],
    returned: undefined,
  }]);
});

Deno.test("Indexable.[[Set]] number (indirect, has case) passthru", () => {
  const obj = new MyIndexable({
    hasElement: () => true,
  });
  const obj2 = Object.create(obj);
  obj2["123"] = 42;
  assert(Object.hasOwn(obj2, "123"));
  assertEquals(obj.setElementSpy.calls, []);
});

Deno.test("Indexable.[[Set]] number (indirect, does-not-have case)", () => {
  const obj = new MyIndexable({
    hasElement: () => false,
  });
  const obj2 = Object.create(obj);
  obj2["123"] = 42;
  assertEquals(obj2["123"], undefined);
  assertEquals(obj.setElementSpy.calls, []);
});

Deno.test("Indexable.[[Delete]] non-number passthru", () => {
  const obj = Object.assign(new MyIndexable(), { foo: "bar" });
  delete (obj as unknown as Record<string, unknown>).foo;
  assertEquals(obj.foo, undefined);
  assert(!("foo" in obj));
});

Deno.test("Indexable.[[Delete]] number (has case)", () => {
  const obj = new MyIndexable({
    hasElement: () => true,
  });
  assertThrows(() => {
    delete obj["123"];
  }, TypeError);
  assertEquals(obj.hasElementSpy.calls, [{ args: [123], returned: true }]);
});

Deno.test("Indexable.[[Delete]] number (does-not-have case)", () => {
  const obj = new MyIndexable({
    hasElement: () => false,
  });
  delete obj["123"];
  assertEquals(obj.hasElementSpy.calls, [{ args: [123], returned: false }]);
});

Deno.test("Indexable.[[OwnPropertyKeys]]", () => {
  const obj = Object.assign(
    new MyIndexable({
      elementKeys: () => [0, 1, 2],
    }),
    { foo: "bar" },
  );
  assertEquals(Reflect.ownKeys(obj), ["0", "1", "2", "foo"]);
});
