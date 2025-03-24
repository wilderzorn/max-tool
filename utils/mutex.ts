/**
 * Mutex 类
 *
 * 作用：
 * Mutex 是一个通用的并发控制工具，支持信号量和互斥锁的功能。
 * - 如果 capacity 为 1，则表现为互斥锁（Mutex），确保同一时间只有一个任务可以访问资源。
 * - 如果 capacity 大于 1，则表现为信号量（Semaphore），允许指定数量的任务同时访问资源。
 *
 * 属性：
 * - capacity: number - 锁的总容量，表示最大可同时访问的资源数量。
 * - available: number - 当前可用的资源数量。
 * - deferredTasks: Array<() => void> - 一个队列，用于存储等待资源的任务。
 *
 * 方法：
 * - constructor(capacity: number = 1) - 初始化锁，capacity 默认为 1。
 * - async acquire(): Promise<void> - 请求一个资源。如果资源不可用，则等待。
 * - release(): void - 释放一个资源，唤醒等待的任务。
 * - get isMutexed(): boolean - 只读属性，表示当前锁是否被占用（available === 0）。
 *
 * 使用示例：
 * const mutex = new Mutex(2); // 创建一个容量为 2 的互斥锁
 * async function task(id: number) {
 *   await mutex.acquire(); // 请求资源
 *   try {
 *      await new Promise((resolve) => setTimeout(resolve, 1000)); // 模拟任务执行
 *   } finally {
 *      mutex.release();
 *   }
 * }
 *
 * 注意事项：
 * 1. 确保每次 acquire 后都有对应的 release，否则可能导致资源泄漏或死锁。
 * 2. 避免在持有锁的情况下执行长时间操作，以免影响性能。
 */
export class Mutex {
  private capacity: number;
  private available: number;
  private deferredTasks: (() => void)[] = [];

  constructor(capacity: number = 1) {
    if (capacity < 1) {
      throw new Error('Capacity must be greater than or equal to 1');
    }
    this.capacity = capacity;
    this.available = capacity;
  }
  /**
   * 请求一个资源。
   * 如果当前有可用资源（available > 0），则直接减少 available 并返回。
   * 如果没有可用资源，则将任务加入 deferredTasks 队列，等待资源释放。
   */
  async acquire(): Promise<void> {
    if (this.available > 0) {
      this.available--;
      return;
    }
    return new Promise<void>((resolve) => {
      this.deferredTasks.push(resolve);
    });
  }
  /**
   * 释放一个资源。
   * 如果有等待的任务（deferredTasks 队列不为空），则唤醒最早的任务。
   * 如果没有等待的任务，则增加 available。
   */
  release(): void {
    const deferredTask = this.deferredTasks.shift();
    if (deferredTask != null) {
      deferredTask();
      return;
    }
    if (this.available < this.capacity) {
      this.available++;
    }
  }
  /**
   * 只读属性，表示当前锁是否被占用。
   */
  get isMutexed(): boolean {
    return this.available === 0;
  }
}
const mutex = new Mutex();
export default mutex;
