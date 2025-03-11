/**
 * 代表中止操作的错误类。
 * @augments Error
 */
class AbortError extends Error {
  constructor(message = '行动被中止') {
    super(message);
    this.name = 'AbortError';
  }
}
export default AbortError;
