type Callback = () => void;

/**
 * 在浏览器空闲时执行任务的工具函数
 *
 * @description
 * 该函数利用浏览器的 requestIdleCallback API 在空闲时间执行回调函数。
 * 如果浏览器不支持 requestIdleCallback，则降级使用 setTimeout 实现。
 * 当没有足够的空闲时间时，会自动重新调度任务。
 *
 * @param callback - 需要在空闲时执行的回调函数
 *
 * @example
 * ```ts
 * runIdleTask(() => {
 *   // 执行一些非紧急的计算任务
 *   performNonUrgentTask();
 * });
 * ```
 */
function runIdleTask(callback: Callback): void {
  if (typeof callback !== 'function') {
    return;
  }

  const executeTask = (deadline: IdleDeadline) => {
    if (deadline.timeRemaining() > 0) {
      callback();
    } else {
      runIdleTask(callback); // 如果没有空闲时间，继续尝试
    }
  };

  if ('requestIdleCallback' in globalThis) {
    (requestIdleCallback as (cb: (deadline: IdleDeadline) => void) => number)(
      executeTask,
    );
  } else {
    // 使用 setTimeout 作为回退方案
    setTimeout(
      () => executeTask({ timeRemaining: () => Infinity } as IdleDeadline),
      1,
    );
  }
}

export default runIdleTask;
