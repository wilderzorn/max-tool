/**
 * 代表超时操作的错误类。
 * @augments Error
 */
class TimeoutError extends Error {
  constructor(message = 'The operation was timed out') {
    super(message);
    this.name = 'TimeoutError';
  }
}
export default TimeoutError;
