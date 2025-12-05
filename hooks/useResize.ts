import { useThrottleFn } from 'ahooks';
import React from 'react';
import emitter from '../utils/emitter';

type ResizeCallback = () => void;

export default function useResize(
  cb: ResizeCallback,
  throttleTime = 500,
): void {
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
