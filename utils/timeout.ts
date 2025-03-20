import abortableDelay from './abortableDelay';
import TimeoutError from '../error/TimeoutError';

/**
 * 返回一个在指定延迟后抛出 `TimeoutError` 的 Promise。
 *
 * @param {number} ms - 延迟时间，单位为毫秒。
 * @param {boolean} throwTimeout - 是否抛出 `TimeoutError`。
 * @returns {Promise<void|void>} 一个在指定延迟后抛出 `TimeoutError` 的 Promise。
 * @throws {TimeoutError} 在指定延迟后抛出 `TimeoutError`。
 *
 * @example
 * try {
 *   await timeout(1000, true); // 1 秒后抛出超时异常
 * } catch (error) {
 *   console.error(error); // 会输出 'The operation was timed out'
 * }
 */

// 函数重载
async function timeout(ms: number, throwTimeout: true): Promise<never>;
async function timeout(ms: number, throwTimeout?: false): Promise<void>;
async function timeout(
  ms: number,
  throwTimeout: boolean = false,
): Promise<void> {
  await abortableDelay(ms);
  if (throwTimeout) throw new TimeoutError();
}
export default timeout;
