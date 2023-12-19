import Queue from "./Queue";
import { sleepms } from "./utilites";

export default class AwaitedQueueProcessor<T, U> implements Queue<T> {
  private queue: Queue<T>;
  private asynccallbackfn: (queueItem: T, index: number) => Promise<U>;
  waitms: number;
  private stopped: boolean;
  private running: boolean;
  items: T[];
  length: number;

  constructor(
    asynccallbackfn: (queueItem: T, index: number) => Promise<U>,
    waitms: number
  ) {
    this.queue = new Queue();
    this.asynccallbackfn = asynccallbackfn;
    this.waitms = waitms;
    this.items = this.queue.items;
    this.length = 0;
    this.running = false;
    this.stopped = false;
  }

  enqueue(...items: T[]) {
    this.queue.enqueue(...items);
    this.length = this.queue.length;
  }

  dequeue() {
    const dequeued = this.queue.dequeue();
    this.length = this.queue.length;
    return dequeued;
  }

  at(index: number) {
    return this.queue.at(index);
  }

  drain() {
    const drained = this.queue.drain();
    this.items = this.queue.items;
    this.length = this.queue.length;
    return drained;
  }

  removeAt(index: number) {
    let removed = this.queue.removeAt(index);
    this.length = this.queue.length;
    this.items = this.queue.items;
    return removed;
  }

  async run() {
    if (this.running) return [] as Awaited<U>[];

    this.running = true;
    let index = 0;
    const results: Awaited<U>[] = [];
    while (!this.stopped && this.queue.length > 0) {
      const result: Awaited<U> = await this.asynccallbackfn(
        this.dequeue(),
        index
      );
      index++;
      results.push(result);
      await sleepms(this.waitms);
    }

    this.running = false;
    this.stopped = false;
    return results;
  }

  async stop() {
    this.stopped = true;

    while (this.running) {
      await sleepms(1);
    }

    this.stopped = false;
  }

  isRunning() {
    return this.running;
  }
}
