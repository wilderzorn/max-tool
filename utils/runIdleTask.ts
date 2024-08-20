type Callback = () => void;

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
