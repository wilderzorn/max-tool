import { useThrottleFn } from 'ahooks';
import React from 'react';
import emitter from '../utils/emitter';

type ResizeCallback = () => void;

export function useResize(cb: ResizeCallback, throttleTime = 500): void {
  const throttledRun = useThrottleFn(() => cb?.(), {
    wait: throttleTime,
    leading: false,
  });
  React.useEffect(() => {
    const handleResize = throttledRun.run;
    window.addEventListener('resize', handleResize);
    emitter.on('__onChangeMenu__', handleResize);
    // 立即触发一次初始化回调
    cb?.();
    return () => {
      window.removeEventListener('resize', handleResize);
      emitter.off('__onChangeMenu__', handleResize);
    };
  }, [throttledRun.run, cb]); // 明确依赖项
}

/**
 *  *******************  用法  *********************
 *  import {useStaticState} from '#/hooks/trHooks'; //导入方法
 *    const staticState = useStaticState({
 *     'name':'小明'
 *   });
 *   console.log(staticState.name)  // 输出内容为小明
 *   staticState.name = '小马';
 *   console.log(staticState.name)  // 输出内容为小马
 */

/**
 * 通用静态数据存放方式
 * @param initValue  任意类型初始化数据
 * @returns {any}  返回任何类型数据对象
 */
export function useStaticState<T>(initValue: T): T | any {
  const formRef = React.useRef<T | null>(null);
  if (!formRef.current) {
    formRef.current = initValue;
  }
  return formRef.current;
}

/**
 * 使用自定义hook来管理状态。
 *
 * @param initValue 初始状态值，是一个键值对的对象，默认为空对象。
 * @param reduce 一个可选的reduce函数，用于自定义状态更新逻辑，默认不提供。
 * @returns {any} 返回一个数组，第一个元素是当前的状态，第二个元素是一个用于更新状态的函数。
 */

type TRStateAction<T extends Record<string, any>> =
  | { type: 'changeData'; data: Partial<T> }
  | { type: string; [key: string]: any };

export function useTRState<T extends Record<string, any>>(
  initValue: T,
  customReducer?: (state: T, action: TRStateAction<T>) => T,
): [T, (data: Partial<T> | ((prev: T) => Partial<T>)) => void] {
  const defaultReducer = (state: T, action: TRStateAction<T>): T => {
    if (action.type === 'changeData') {
      return {
        ...state,
        ...(typeof action.data === 'function'
          ? action.data(state)
          : action.data),
      };
    }
    return customReducer?.(state, action) ?? state;
  };

  const [state, dispatch] = React.useReducer(defaultReducer, {
    isLoading: false,
    errorMsg: '',
    ...initValue,
  });

  const setState = React.useCallback(
    (data: Partial<T> | ((prev: T) => Partial<T>)) => {
      dispatch({
        type: 'changeData',
        data: typeof data === 'function' ? data(state) : data,
      });
    },
    [state],
  );

  return [state, setState];
}
