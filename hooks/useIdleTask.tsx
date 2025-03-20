import { useEffect } from 'react';
import { useStaticState } from './trHooks';

type TaskFunction = () => void;
type CleanupFunction = (() => void) | null;
type SchedulerChunk = (isGoOn: () => boolean) => void;

interface StaticState {
  index: number;
  cleanup: CleanupFunction;
}
/**
 * useIdleTask Hook
 *
 * 作用：
 * 在浏览器空闲时段分块执行任务队列的 React Hook，适用于需要优化主线程性能的场景。
 * - 利用 requestIdleCallback API 实现任务调度
 * - 自动处理组件卸载时的任务清理
 * - 支持动态任务队列更新
 * - 根据浏览器空闲时间自动分块执行任务
 *
 * 类型定义：
 * type TaskFunction = () => void;
 *
 * 参数：
 * @param tasks - 要执行的任务函数数组 (TaskFunction[])
 *
 * 工作机制：
 * 1. 当组件挂载或 tasks 变化时，启动任务调度
 * 2. 每个浏览器空闲时段执行尽可能多的任务
 * 3. 当任务队列未完成时持续调度
 * 4. 组件卸载时自动取消未完成的任务
 *
 * 使用示例：
 * ```tsx
 * import useIdleTask from '#/hooks/useIdleTask';
 *
 * function DataProcessor() {
 *   const [state, setState] = useTRState({
 *     data: Array(10000).fill(null),
 *     processed: 0,
 *     shouldRun: false
 *   });
 *
 *   const tasks = useMemo(() => data.map((_, i) => () => {
 *     processData(i); // 执行数据处理
 *     setState((prev) => ({ ...prev, processed: prev.processed + 1 })); // 使用函数式更新
 *   }), [data]);
 *
 *   useIdleTask(state.shouldRun ? tasks : []);
 *
 *   return (
 *      <div className={styles.container}>
 *        <Button onClick={() => setState({ shouldRun: true })}>
 *          开始后台处理
 *        </Button>
 *        <Button onClick={() => {
 *          setState(() => ({ shouldRun: false, processed: 0 }));
 *          }}
 *        >
 *          重置
 *        </Button>
 *        <div>
 *          <h3>数据处理进度</h3>
 *          <progress value={state.processed} max={state.data.length} />
 *          <div>
 *            {state.processed}/{state.data.length} processed
 *          </div>
 *        </div>
 *      </div>
 *   );
 * }
 * ```
 *
 * 注意事项：
 * 1. 单个任务执行时间应控制在 5ms 以内
 * 2. 推荐使用 useMemo 优化 tasks 数组
 * 3. 避免在任务中直接修改状态，应使用函数式更新
 * 4. 重要任务建议添加超时重试机制
 * 5. 组件卸载时未完成任务会被自动取消
 *
 * 错误处理：
 * - 任务函数中的错误会被静默吞没，建议自行添加 try/catch
 * - 长时间阻塞可能导致任务中断，需做好状态持久化
 */
function useIdleTask(tasks: ReadonlyArray<TaskFunction>): void {
  const staticState = useStaticState<StaticState>({
    index: 0,
    cleanup: null,
  });

  useEffect(() => {
    staticState.index = 0;
    if (tasks.length === 0) return;
    let isCancelled = false;

    const scheduler = (chunk: SchedulerChunk) => {
      const id = requestIdleCallback((idle: IdleDeadline) => {
        if (isCancelled) return;
        chunk(() => idle.timeRemaining() > 0);
      });

      staticState.cleanup = () => {
        cancelIdleCallback(id);
        isCancelled = true;
      };
    };

    const _run = () => {
      if (isCancelled) return;
      scheduler((isGoOn: () => boolean) => {
        while (staticState.index < tasks.length && isGoOn()) {
          try {
            tasks[staticState.index++]();
          } catch (error) {
            // eslint-disable-next-line no-console
            console.error('Task execution failed:', error);
          }
        }
        if (staticState.index < tasks.length) {
          _run();
        }
      });
    };

    _run();

    return () => {
      staticState.cleanup?.();
      staticState.cleanup = null;
    };
  }, [tasks]);
}

export default useIdleTask;
