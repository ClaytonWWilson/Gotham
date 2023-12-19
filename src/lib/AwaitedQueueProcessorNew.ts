import Queue from "./Queue";
import { sleepms } from "./utilites";
import type { Transformable } from "../types/state";

export default class AwaitedQueueProcessorNew<T, U> {
  private queue: Queue<Transformable<T, U>>;
  private stopped: boolean;
  private running: boolean;
  waitms: number;
  items: Transformable<T, U>[];
  length: number;

  /**
   * @param waitms The amount of time to wait between each item in the queue.
   */
  constructor(waitms: number) {
    this.queue = new Queue();
    this.waitms = waitms;
    this.items = this.queue.items;
    this.length = 0;
    this.running = false;
    this.stopped = false;
  }

  /**
   * Adds items to the queue. Items will be dequeued and called with the transformer function.
   * @param transformer Function to run on the following items.
   * @param items Items to add to the queue.
   */
  enqueue(transformer: (queueItem: T) => Promise<U>, ...items: T[]) {
    const transformables: Transformable<T, U>[] = items.map((item) => {
      return {
        data: item,
        transformer: transformer,
      };
    });
    this.queue.enqueue(...transformables);
    this.length = this.queue.length;
  }

  /**
   * Removes and returns the next item from the queue.
   * @returns An object with the transformer function and data object.
   */
  dequeue() {
    const dequeued = this.queue.dequeue();
    this.length = this.queue.length;
    return dequeued;
  }

  /**
   * Empties the queue and returns everything that was removed.
   * @returns An array of objects that contain the transformer function and data.
   */
  drain() {
    const drained = this.queue.drain();
    this.items = this.queue.items;
    this.length = this.queue.length;
    return drained;
  }

  /**
   * Removes and returns the item at the index
   * @param index Index of item to be removed
   * @returns Removed item
   */
  removeAt(index: number) {
    let removed = this.queue.removeAt(index);
    this.length = this.queue.length;
    this.items = this.queue.items;
    return removed;
  }

  /**
   * Starts running the queue. Continues running until the stop method is called.
   */
  async run() {
    if (this.running) return;

    this.running = true;
    while (!this.stopped) {
      await sleepms(this.waitms);
      const current: Transformable<T, U> | undefined = this.dequeue();

      if (current === undefined) continue;

      await current.transformer(current.data);
    }

    this.running = false;
  }

  /**
   * Stops the queue from running. Waits until the current transformer is finished before interrupting.
   */
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
