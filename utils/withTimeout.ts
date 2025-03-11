import timeout from './timeout';

/**
 * 执行一个异步函数并设置超时限制。
 *
 * 如果 Promise 在指定时间内未完成，
 * 超时机制将触发，返回的 Promise 将被拒绝。
 *
 * @template T
 * @param {() => Promise<T>} run - 一个返回 Promise 的函数，该 Promise 将被执行。
 * @param {number} ms - 超时时间，单位为毫秒。
 * @returns {Promise<T>} 一个 Promise，如果 `run` 函数在指定时间内完成，则返回其结果；如果超时，则拒绝。
 *
 * @example
 * async function fetchData() {
 *   const response = await fetch('https://example.com/data');
 *   return response.json();
 * }
 *
 * try {
 *   const data = await withTimeout(fetchData, 1000);
 *   console.log(data); // 如果 `fetchData` 在 1 秒内完成，则输出获取的数据。
 * } catch (error) {
 *   console.error(error); // 如果 `fetchData` 在 1 秒内未完成，则输出 'TimeoutError'。
 * }
 */
export async function withTimeout<T>(
  run: () => Promise<T>,
  ms: number,
): Promise<T> {
  return Promise.race([run(), timeout(ms, true)]);
}
