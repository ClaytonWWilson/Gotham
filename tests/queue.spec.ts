import { test, expect } from "@playwright/test";
import Queue from "../src/lib/Queue";

test("Constructor", async () => {
  const q = new Queue();
  expect(q.length).toBe(0);
  expect(q.items).toEqual([]);
});

test("Enqueue items", async () => {
  const values1 = [0, 1, 2, 3, 4];
  const values2 = [5, 6, 7, 8, 9];

  const q = new Queue<number>();
  q.enqueue(...values1);
  expect(q.length).toBe(values1.length);
  expect(q.items).toEqual(values1);

  q.enqueue(...values2);
  expect(q.length).toBe(values1.length + values2.length);
  expect(q.items).toEqual([...values1, ...values2]);
});

test("Dequeue items", async () => {
  const values = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

  const q = new Queue<number>();
  q.enqueue(...values);
  for (let i = 0; i < values.length; i++) {
    expect(q.length).toBe(values.length - i);
    const dequeued = q.dequeue();
    expect(dequeued).toBe(values[i]);
  }
});

test("Enqueue and fully dequeue", async () => {
  const values = Array(100)
    .fill(0)
    .map((_, index) => index);

  const q = new Queue<number>();
  q.enqueue(...values);

  for (let i = 0; i < values.length; i++) {
    q.dequeue();
  }

  expect(q.length).toBe(0);
  expect(q.items).toEqual([]);
});

test("At", async () => {
  const values = [0, 1, 2, 3, 4, 5];

  const q = new Queue<number>();
  q.enqueue(...values);

  for (let i = 0; i < values.length; i++) {
    expect(q.at(i)).toBe(values[i]);
  }
});

test("Drain", async () => {
  const values = [0, 1, 2, 3, 4, 5];

  const q = new Queue<number>();
  q.enqueue(...values);
  let drained = q.drain();

  expect(q.length).toBe(0);
  expect(q.items).toEqual([]);
  expect(drained).toEqual(values);
});

test("Remove at", async () => {
  const values = [0, 1, 2, 3, 4, 5];
  const valuesAfter = [0, 1, 3, 4, 5];
  const removeIndex = 2;

  const q = new Queue<number>();
  q.enqueue(...values);

  let removed = q.removeAt(removeIndex);

  expect(q.length).toBe(valuesAfter.length);
  expect(q.items).toEqual(valuesAfter);
  expect(removed).toBe(values[removeIndex]);
});

const testValuesOnQueue = (values: any, queue: Queue<any>) => {
  const removeIndex = values.length / 2;
  queue.enqueue(...values);

  expect(queue.length).toBe(values.length);
  expect(queue.items).toEqual(values);

  expect(queue.at(0)).toEqual(values[0]);
  expect(queue.at(10)).toEqual(values[10]);

  const removed1 = queue.removeAt(removeIndex);
  const removed2 = queue.removeAt(removeIndex);

  expect(removed1).toEqual(values[removeIndex]);
  expect(removed2).toEqual(values[removeIndex + 1]);
  expect(queue.length).toBe(values.length - 2);

  const dequeued1 = queue.dequeue();
  const dequeued2 = queue.dequeue();

  expect(dequeued1).toEqual(values[0]);
  expect(dequeued2).toEqual(values[1]);
  expect(queue.length).toBe(values.length - 4);

  queue.drain();
  expect(queue.length).toBe(0);
  expect(queue.items).toEqual([]);
};

test("Robustness", async () => {
  const ints = new Array(100)
    .fill(0)
    .map(() => Math.trunc(Math.random() * 100));
  const strings = new Array(100)
    .fill(0)
    .map(() => Math.trunc(Math.random() * 100).toFixed());
  const objects = new Array(100).fill(0).map(() => {
    return { val: Math.trunc(Math.random() * 100) };
  });
  const undefineds = new Array(100).fill(0).map(() => undefined);

  testValuesOnQueue(ints, new Queue<number>());
  testValuesOnQueue(strings, new Queue<string>());
  testValuesOnQueue(objects, new Queue<{ val: number }>());
  testValuesOnQueue(undefineds, new Queue<undefined>());
});
