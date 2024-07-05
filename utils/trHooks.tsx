import { useThrottleFn } from 'ahooks';
import React from 'react';
import emitter from './events';
import { useNotification } from 'rc-notification';
import { s8 } from './utils';

export function useResize(cb: () => void, time = 500) {
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
export const useTRState = (initValue: Record<string, any> = {}, reduce?: any) => {
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

/**
 * 提供一个通知（notification）的高阶组件，用于封装和管理通知的创建、销毁和关闭。
 * @param config 配置对象，用于初始化通知组件，可以设置通知的默认属性。
 * @returns 返回一个数组，第一个元素是包含通知操作的方法对象，第二个元素是上下文持有者。
 */
export const TRNotification = (config: any = {}): [any, React.ReactNode] => {
  const staticState = useStaticState({
    keyMap: new Map(),
    keyStack: [],
  });

  const [notice, contextHolder] = useNotification({ duration: 0, ...config });

  const open = React.useCallback(
    ({ __key__ = s8(), content, ...m }) => {
      staticState.keyMap.set(__key__, __key__);
      staticState.keyStack.push(__key__);
      notice.open({
        content: <React.Fragment>{content}</React.Fragment>,
        ...m,
      });
    },
    [notice],
  );

  const destroy = React.useCallback(() => {
    notice.destroy();
    staticState.keyMap.clear();
    staticState.keyStack = [];
  }, [notice]);

  const close = React.useCallback(
    (__key__: any) => {
      const key = __key__ || staticState.keyStack.pop();
      if (key) {
        staticState.keyMap.delete(key);
        notice.close(key);
      }
    },
    [notice],
  );

  return [{ open, destroy, close }, contextHolder];
};
