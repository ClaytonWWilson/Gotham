export default class Queue<T> {
  items: T[];
  length: number;

  constructor() {
    this.items = [];
    this.length = 0;
  }

  enqueue(...items: T[]) {
    this.items.push(...items);
    this.length = this.items.length;
  }

  dequeue() {
    const popped = this.items.shift();
    this.length = this.items.length;
    return popped;
  }

  at(index: number) {
    return this.items[index];
  }

  removeAt(index: number) {
    const removed = this.items.splice(index, 1)[0];
    this.length = this.items.length;
    return removed;
  }

  drain() {
    let deletedItems = this.items;
    this.items = [];
    this.length = 0;
    return deletedItems;
  }
}
