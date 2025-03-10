/**
 * 创建一个在指定延迟后解析的 Promise。
 * 可以使用 AbortSignal 中止延迟。
 *
 * @param {number} ms - 延迟的毫秒数。
 * @param {DelayOptions} [options] - 延迟的可选参数。
 * @param {AbortSignal} [options.signal] - 用于中止延迟的信号。
 * @returns {Promise<void>} - 返回一个在指定延迟后解析的 Promise。
 *
 * @throws {AbortError} - 如果中止信号被触发，则抛出 AbortError。
 *
 * @example
 *  简单的延迟 3 秒钟
 * abortableDelay(3000).then(() => {
 *   console.log('3 秒钟后执行');
 * });
 *
 * @example
 * 使用中止信号中止延迟
 * const controller = new AbortController();
 * abortableDelay(5000, { signal: controller.signal })
 *   .then(() => {
 *     console.log('延迟完成');
 *   })
 *   .catch((error) => {
 *     if (error.name === 'AbortError') {
 *       console.log('延迟被中止');
 *     } else {
 *       console.error('发生错误:', error);
 *     }
 *   });
 *  2 秒后中止延迟
 * setTimeout(() => {
 *   controller.abort();
 * }, 2000);
 */
class AbortError extends Error {
  constructor(message = '行动被中止') {
    super(message);
    this.name = 'AbortError';
  }
}
interface DelayOptions {
  signal?: AbortSignal;
}

export default function abortableDelay(
  ms: number = 100,
  { signal }: DelayOptions = {},
): Promise<void> {
  // 参数校验
  if (typeof ms !== 'number' || ms < 0) {
    throw new TypeError('延迟时间必须为非负数');
  }
  return new Promise((resolve, reject) => {
    // 提前处理已中止的信号
    if (signal?.aborted) {
      reject(new AbortError());
      return;
    }

    // 统一清理函数
    const cleanup = () => {
      clearTimeout(timerId);
      signal?.removeEventListener('abort', abortHandler);
    };

    // 中止处理器
    const abortHandler = () => {
      cleanup();
      reject(new AbortError());
    };

    // 定时器回调
    const done = () => {
      cleanup();
      resolve();
    };

    const timerId = setTimeout(done, ms);

    // 注册中止监听（确保单次执行）
    signal?.addEventListener('abort', abortHandler, { once: true });
  });
}
