import React from 'react';
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

export default function useTRState<T extends Record<string, any>>(
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

  const [state, dispatch] = React.useReducer(defaultReducer, initValue);

  const setState = React.useCallback(
    (data: Partial<T> | ((prev: T) => Partial<T>)) => {
      dispatch({
        type: 'changeData',
        data: (current: T) => ({
          ...current,
          ...(typeof data === 'function' ? data(current) : data),
        }),
      });
    },
    [],
  );

  return [state, setState];
}
