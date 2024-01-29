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
  lastRun: Date | null;
  continuousRun: boolean;

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
    this.lastRun = null;
    this.continuousRun = false;
  }

  enqueue(...items: T[]) {
    this.queue.enqueue(...items);
    this.length = this.queue.length;

    if (this.continuousRun) {
      this.runIndefinite();
    }
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
    if (this.lastRun === null) {
      this.lastRun = new Date();
    }

    let msSinceLastRun = new Date().valueOf() - this.lastRun.valueOf();

    if (msSinceLastRun > this.waitms * 2) {
      // Queue was running at some point, but the browser killed the thread
      await this.stop();
    }

    if (this.running) {
      return [] as Awaited<U>[];
    }

    this.running = true;
    let index = 0;
    const results: Awaited<U>[] = [];
    try {
      while (!this.stopped && this.queue.length > 0) {
        const result: Awaited<U> = await this.asynccallbackfn(
          this.dequeue(),
          index
        );

        this.lastRun = new Date();
        index++;
        results.push(result);
        await sleepms(this.waitms);
      }
    } catch (error) {
      this.running = false;
      this.stopped = false;
      throw error;
    }

    this.running = false;
    this.stopped = false;
    return results;
  }

  /**
   *
   * Runs the queue continuously until stopped.
   */
  async runIndefinite() {
    if (this.stopped) {
      return;
    }

    if (this.lastRun === null) {
      this.lastRun = new Date();
    }

    let msSinceLastRun = new Date().valueOf() - this.lastRun.valueOf();

    if (msSinceLastRun > this.waitms * 2) {
      // Queue was running at some point, but the browser killed the thread
      await this.stop();
    }

    if (this.running) return;

    this.running = true;
    this.continuousRun = true;
    let index = 0;
    while (!this.stopped) {
      try {
        await sleepms(this.waitms);
        const current: T | undefined = this.dequeue();

        if (current === undefined) continue;

        await this.asynccallbackfn(current, index);
        this.lastRun = new Date();
        index++;
      } catch (error) {
        console.error("Following error occurred while running", error);
      }
    }

    this.running = false;
    this.stopped = false;
    this.continuousRun = false;
  }

  async stop() {
    this.stopped = true;

    let stoppedAt = new Date();

    while (this.running) {
      await sleepms(1);

      let msSinceStopped = new Date().valueOf() - stoppedAt.valueOf();

      if (msSinceStopped >= this.waitms * 10) {
        // Main thread was stopped by the browser at some point and needs to be manually stopped
        this.running = false;
      }
    }

    this.stopped = false;
  }

  isRunning() {
    return this.running;
  }
}
