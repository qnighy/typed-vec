import { Int16Vec } from "./fast.ts";

Deno.bench("Int16Vec push/pop", () => {
  const a = new Int16Vec();
  for (let i = 0; i < 100_000; i++) {
    a.push(i);
  }
  for (let i = 0; i < 100_000; i++) {
    a.pop();
  }
});

let sum = 0;

Deno.bench("Int16Array sequential access (for comparison)", () => {
  const a = new Int16Array(100_000);
  for (let i = 0; i < 100_000; i++) {
    a[i] = i;
  }
  for (let i = 0; i < 100_000; i++) {
    sum += a[i];
  }
});

Deno.bench("Int16Vec sequential access (via method)", () => {
  const a = new Int16Vec(100_000);
  for (let i = 0; i < 100_000; i++) {
    a.setElement(i, i);
  }
  for (let i = 0; i < 100_000; i++) {
    sum += a.getElement(i);
  }
});
