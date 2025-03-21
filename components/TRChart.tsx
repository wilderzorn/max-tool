import React, { useRef, useEffect, useImperativeHandle } from 'react';
import * as echarts from 'echarts';
import { useSize } from 'ahooks';

const AEChart = (
  { option, style, onChartClick }: any,
  parentRef: React.Ref<any>,
) => {
  const ref = useRef<any>(null);
  const size = useSize(ref);

  const getInstance = () => echarts.getInstanceByDom(ref.current);

  useEffect(() => {
    const ins = echarts.init(ref?.current);
    // 监听点击事件
    if (onChartClick) {
      ins.on('click', (params: any) => {
        onChartClick(params);
      });
    }
    return () => {
      ins.dispose();
    };
  }, []);

  useEffect(() => {
    option && getInstance()?.setOption(option);
  }, [JSON.stringify(option)]);

  useEffect(() => {
    getInstance()?.resize();
  }, [size?.width, size?.height]);

  useImperativeHandle(parentRef, () => {
    return {
      ins: getInstance,
    };
  });

  return (
    <div
      ref={ref}
      style={{
        width: '100%',
        height: '100%',
        ...(style ?? {}),
      }}
    />
  );
};

export default React.memo(React.forwardRef(AEChart));
