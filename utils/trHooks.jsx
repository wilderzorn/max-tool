import { useThrottleFn } from 'ahooks';
import React from 'react';
import emitter from './events';
import { useNotification } from 'rc-notification';

export function useResize(cb, time = 500) {
  const isMounted = React.useRef(false);
  const { run } = useThrottleFn(
    () => {
      cb?.();
    },
    { wait: time, leading: false },
  );
  React.useEffect(() => {
    window.addEventListener('resize', run);
    emitter.addListener('onChangeMnue', run);
    return () => {
      window.removeEventListener('resize', run);
      emitter.removeListener('onChangeMnue', run);
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
export function useStaticState(initValue) {
  const formRef = React.useRef();
  if (!formRef.current) {
    formRef.current = initValue;
  }
  return formRef.current;
}

export const useTRState = (initValue = {}, reduce) => {
  const reduceHandle = React.useCallback((data, action) => {
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

  const setState = React.useCallback((m, type = 'changeData') => {
    dispatch({ type: type, data: m });
  }, []);
  return [state, setState];
};
/**
 * @description: 弹窗
 * @param {*} config
 * @return {*}
 */
export const TRNotification = (config = {}) => {
  const staticState = useStaticState({
    keyMap: new Map(),
    __currentKey: null,
  });
  const [notice, contextHolder] = useNotification({ duration: null, ...config });
  const open = React.useCallback(({ __key__ = String(Date.now()), content, ...m }) => {
    staticState.keyMap.set(__key__, __key__);
    staticState.__currentKey = __key__;
    notice.open({
      content: <React.Fragment>{content}</React.Fragment>,
      ...m,
    });
  }, []);
  const destroy = React.useCallback(() => {
    notice.destroy();
    staticState.keyMap.clear();
    staticState.__currentKey = null;
  }, []);
  const close = React.useCallback((__key__) => {
    let key = staticState.__currentKey;
    if (__key__) key = __key__;
    staticState.keyMap.delete(key);
    notice.close(key);
    staticState.__currentKey = null;
  }, []);

  return [{ open, destroy, close }, contextHolder];
};
