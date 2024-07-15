import { useThrottleFn } from 'ahooks';
import React from 'react';
import emitter from './emitter.js';

export function useResize(cb: () => void, time = 500): void {
  const isMounted = React.useRef(false);
  const { run } = useThrottleFn(
    () => {
      cb?.();
    },
    { wait: time, leading: false },
  );
  React.useEffect(() => {
    window.addEventListener('resize', run);
    emitter.addListener('__onChangeMnue__', run);
    return () => {
      window.removeEventListener('resize', run);
      emitter.removeListener('__onChangeMnue__', run);
    };
  }, []);
  React.useEffect(() => {
    /* 第一次挂载 */
    isMounted.current = true;
  }, []);
}

/**
 *  *******************  用法  *********************
 *  import {useStaticState} from '#/utils/trHooks'; //导入方法
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
export function useStaticState<T>(initValue: T): any {
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
export const useTRState = (
  initValue: Record<string, any> = {},
  reduce?: any,
): [any, any] => {
  const reduceHandle = React.useCallback((data: any, action: any) => {
    if (action.type === 'changeData') {
      return { ...data, ...action.data };
    }
    reduce?.(data, action);
  }, []);
  const [state, dispatch] = React.useReducer(reduceHandle, {
    isLoading: false,
    errorMsg: '',
    ...initValue,
  });

  const setState = React.useCallback((m: any, type = 'changeData') => {
    dispatch({ type: type, data: m });
  }, []);
  return [state, setState];
};
