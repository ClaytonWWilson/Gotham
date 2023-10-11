import type Queue from "./Queue";
import { sleepms } from "./utilites";

export default class AwaitedQueueProcessor<T> {
  private queue: Queue<T>;
  private asynccallbackfn: (queueItem: T, index?: number) => Promise<any>;
  private waitms: number;

  constructor(
    queue: Queue<T>,
    asynccallbackfn: (queueItem: T, index?: number) => Promise<any>,
    waitms: number
  ) {
    this.queue = queue;
    this.asynccallbackfn = asynccallbackfn;
    this.waitms = waitms;
  }

  run = async () => {
    let index = 0;
    while (this.queue.length > 0) {
      await this.asynccallbackfn(this.queue.dequeue(), index);
      await sleepms(this.waitms);
    }
  };

  stop = () => {};
}
