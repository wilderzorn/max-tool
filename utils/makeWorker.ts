/**
 * 创建一个 Web Worker 并将传入的函数封装到 Worker 中执行。
 * 非常适合处理大量数据的计算或需要长时间执行的任务，比如图像处理、数据分析、加密解密等任务
 * 通过使用 Web Worker，可以避免在主线程中执行耗时任务，从而保持页面的流畅性和响应性。
 *
 * 注意事项
 * 1. 请确保传入的函数 `workerFunction` 是纯函数，即相同的输入始终产生相同的输出，避免在 Worker 中产生副作用。
 * 2. Web Worker 运行在独立的线程中，不能直接操作 DOM
 * 3. 使用 Web Worker 会占用额外的资源，尤其是创建多个 Worker 时，可能会导致性能问题。因此，需要谨慎管理 Worker 的生命周期。
 * 4. 如果 Worker 的脚本位于不同域，可能会受到跨域限制。
 *
 * @template T - 传递给 Worker 的输入数据类型。
 * @template R - Worker 处理完后返回的数据类型。
 *
 * @param {function(T): R} workerFunction - 要在 Worker 中运行的函数。该函数接收一个输入参数，返回处理结果。
 *
 * @returns {Worker} 返回创建的 Web Worker 实例，用于在后台执行 `workerFunction`。
 *
 * 实现说明：
 * 1. 将传入的函数 `workerFunction` 转换为字符串，以便将其嵌入到 Worker 脚本中。
 * 2. 使用 Blob 对象封装生成的脚本代码，Blob 对象的 MIME 类型设置为 `application/javascript`。
 * 3. 使用 `URL.createObjectURL` 方法将 Blob 对象转换为一个 URL，该 URL 可以用于创建 Web Worker 实例。
 * 4. 返回创建的 Web Worker 实例，主线程可以使用该实例与 Worker 进行通信（发送数据和接收结果）。
 */
function makeWorker<T = any, R = any>(workerFunction: (input: T) => R): Worker {
  // 将函数转换为字符串，并生成一个 Blob 对象
  const blob = new Blob(
    [
      `onmessage = function(event) {
        const result = (${workerFunction.toString()})(event.data);
        postMessage(result);
      }`,
    ],
    { type: 'application/javascript' },
  );
  // 使用 Blob 创建一个 URL 对象
  const worker = new Worker(URL.createObjectURL(blob));
  return worker;
}

export default makeWorker;

/** 
  怎么使用
  import makeWorker from '#/utils/makeWorker';
  // 定义 Worker 任务
  const workerFunction = (data: number): number => {
    let result = 0;
    for (let i = 0; i < data; i++) {
      result += i;
    }
    return result;
  };
  // 使用公共方法创建 Worker
  const worker = makeWorker<number, number>(workerFunction);
  worker.postMessage(1000000000); // 向 Worker 发送数据
  // 处理 Worker 返回的结果
  worker.onmessage = (event: MessageEvent<any>) => {
    console.log(event.data);
  };
  // 清理 Worker
  worker.terminate();
**/
