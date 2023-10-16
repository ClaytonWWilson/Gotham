import { expect, test } from "@playwright/test";
import AwaitedQueueProcessor from "../src/lib/AwaitedQueueProcessor";
import { sleepms } from "../src/lib/utilites";

const emptyAsyncFunc = () => {
  return new Promise<void>((resolve, reject) => {
    resolve();
  });
};

test("Constructor", async () => {
  const qp = new AwaitedQueueProcessor(emptyAsyncFunc, 50);

  expect(qp.length).toBe(0);
  expect(qp.items).toEqual([]);
});

test("Enqueue items", async () => {
  const values1 = [0, 1, 2, 3, 4];
  const values2 = [5, 6, 7, 8, 9];

  const qp = new AwaitedQueueProcessor(emptyAsyncFunc, 50);
  qp.enqueue(...values1);
  expect(qp.length).toBe(values1.length);
  expect(qp.items).toEqual(values1);

  qp.enqueue(...values2);
  expect(qp.length).toBe(values1.length + values2.length);
  expect(qp.items).toEqual([...values1, ...values2]);
});

test("Dequeue items", async () => {
  const values = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

  const qp = new AwaitedQueueProcessor<number, void>(emptyAsyncFunc, 50);
  qp.enqueue(...values);
  for (let i = 0; i < values.length; i++) {
    expect(qp.length).toBe(values.length - i);
    const dequeued = qp.dequeue();
    expect(dequeued).toBe(values[i]);
  }
});

test("At", async () => {
  const values = [0, 1, 2, 3, 4, 5];

  const qp = new AwaitedQueueProcessor<number, void>(emptyAsyncFunc, 50);
  qp.enqueue(...values);

  for (let i = 0; i < values.length; i++) {
    expect(qp.at(i)).toBe(values[i]);
  }
});

test("Drain", async () => {
  const values = [0, 1, 2, 3, 4, 5];

  const qp = new AwaitedQueueProcessor<number, void>(emptyAsyncFunc, 50);
  qp.enqueue(...values);
  let drained = qp.drain();

  expect(qp.length).toBe(0);
  expect(qp.items).toEqual([]);
  expect(drained).toEqual(values);
});

test("Remove at", async () => {
  const values = [0, 1, 2, 3, 4, 5];
  const valuesAfter = [0, 1, 3, 4, 5];
  const removeIndex = 2;

  const qp = new AwaitedQueueProcessor<number, void>(emptyAsyncFunc, 50);
  qp.enqueue(...values);

  let removed = qp.removeAt(removeIndex);

  expect(qp.length).toBe(valuesAfter.length);
  expect(qp.items).toEqual(valuesAfter);
  expect(removed).toBe(values[removeIndex]);
});

const testValuesOnQueueProcessor = (
  values: any,
  queue: AwaitedQueueProcessor<any, any>
) => {
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

  testValuesOnQueueProcessor(
    ints,
    new AwaitedQueueProcessor<number, void>(emptyAsyncFunc, 50)
  );
  testValuesOnQueueProcessor(
    strings,
    new AwaitedQueueProcessor<string, void>(emptyAsyncFunc, 50)
  );
  testValuesOnQueueProcessor(
    objects,
    new AwaitedQueueProcessor<{ val: number }, void>(emptyAsyncFunc, 50)
  );
  testValuesOnQueueProcessor(
    undefineds,
    new AwaitedQueueProcessor<undefined, void>(emptyAsyncFunc, 50)
  );
});

test.describe("Run functionality", () => {
  test("Run executes all functions", async () => {
    const values = [0, 1, 2, 3, 4];
    let counter = 0;

    const incrementCounter = async (_val: number) => {
      counter++;
    };

    let qp = new AwaitedQueueProcessor<number, void>(incrementCounter, 50);

    qp.enqueue(...values);
    await qp.run();

    expect(counter).toBe(values.length);
    expect(qp.length).toBe(0);
  });

  test("Run waits between function calls", async () => {
    const values = [0, 1, 2, 3, 4];
    let counter = 0;
    const incrementCounter = async () => {
      counter++;
    };
    let qp = new AwaitedQueueProcessor<number, void>(incrementCounter, 500);
    qp.enqueue(...values);
    let runPromise = qp.run();
    await sleepms(1000);

    // Total wait time of the run function should be 2500ms, whereas we are only
    // waiting 1000ms. Run should not be completed yet.
    expect(counter).toBeLessThan(values.length);

    await runPromise;
    expect(counter).toBe(values.length);
  });

  test("Run with empty queue", async () => {
    let qp = new AwaitedQueueProcessor<number, void>(emptyAsyncFunc, 50);
    await qp.run();
    expect(qp.length).toBe(0);
  });

  test("Calling run multiple times will not start multiple running queues", async () => {
    const values = [0, 1, 2, 3, 4];
    let counter = 0;
    const incrementCounter = async () => {
      counter++;
    };
    let qp = new AwaitedQueueProcessor<number, void>(incrementCounter, 500);
    qp.enqueue(...values);

    let runPromises: Promise<any>[] = [];
    for (let i = 0; i < 5; i++) {
      runPromises.push(qp.run());
    }

    await Promise.allSettled(runPromises);

    expect(counter).toBe(values.length);
    expect(qp.length).toBe(0);
  });

  test("Execute new tasks that are enqueued while running", async () => {
    const values1 = [0, 1, 2, 3, 4];
    const values2 = [5, 6, 7, 8, 9];
    let counter = 0;
    const incrementCounter = async () => {
      counter++;
    };
    let qp = new AwaitedQueueProcessor<number, void>(incrementCounter, 500);
    qp.enqueue(...values1);

    let runPromise = qp.run();

    await sleepms(1000);

    qp.enqueue(...values2);

    await runPromise;

    expect(counter).toBe(values1.length + values2.length);
    expect(qp.length).toBe(0);
  });

  test("Index value on callback increments correctly", async () => {
    const values = [0, 1, 2, 3, 4];
    let counter = 0;
    const incrementCounter = async (_val: number, index: number) => {
      expect(index).toBe(counter);
      counter++;
    };

    let qp = new AwaitedQueueProcessor<number, void>(incrementCounter, 50);
    qp.enqueue(...values);

    await qp.run();
  });

  test("Index value on callback increments correctly when enqueueing during run", async () => {
    const values1 = [0, 1, 2, 3, 4];
    const values2 = [5, 6, 7, 8, 9];
    let counter = 0;
    const incrementCounter = async (_val: number, index: number) => {
      expect(index).toBe(counter);
      counter++;
    };

    let qp = new AwaitedQueueProcessor<number, void>(incrementCounter, 50);
    qp.enqueue(...values1);

    let runPromise = qp.run();
    qp.enqueue(...values2);

    await runPromise;
  });

  test("Run returns correct values", async () => {
    const values = [0, 1, 2, 3, 4];
    const doubled = values.map((val) => val * 2);

    const doubleValue = async (val: number) => {
      return val * 2;
    };

    let qp = new AwaitedQueueProcessor<number, number>(doubleValue, 50);
    qp.enqueue(...values);

    let results = await qp.run();

    for (let i = 0; i < doubled.length; i++) {
      expect(results).toContainEqual(doubled[i]);
    }
  });

  test("IsRunning is accurate", async () => {
    const values = [0, 1, 2, 3, 4];

    let qp = new AwaitedQueueProcessor<number, void>(emptyAsyncFunc, 200);

    expect(qp.isRunning()).toBe(false);
    qp.enqueue(...values);
    expect(qp.isRunning()).toBe(false);

    let runPromise = qp.run();
    expect(qp.isRunning()).toBe(true);

    await runPromise;
    expect(qp.isRunning()).toBe(false);
  });
});

test("Stop while running queue", async () => {
  const values = [0, 1, 2, 3, 4];
  let qp = new AwaitedQueueProcessor<number, void>(emptyAsyncFunc, 1000);
  qp.enqueue(...values);
  qp.run();
  await sleepms(1000);
  await qp.stop();
  expect(qp.length).toBeGreaterThan(0);
});
