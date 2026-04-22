import React, { useRef, useEffect, useImperativeHandle } from 'react';
import * as echarts from 'echarts';
import { useSize } from 'ahooks';
import { useThemeListener } from '../index';

interface AEChartProps {
  option: echarts.EChartsOption;
  style?: React.CSSProperties;
  onChartClick?: (params: any, ins: echarts.ECharts) => void;
  onEvents?: Record<string, (params: any) => void>;
}

const AEChart = (
  { option, style, onChartClick, onEvents }: AEChartProps,
  parentRef: React.Ref<any>,
) => {
  const ref = useRef<any>(null);
  const size = useSize(ref);
  const theme = useThemeListener();

  const getInstance = () => echarts.getInstanceByDom(ref.current);

  useEffect(() => {
    const ins = echarts.init(ref?.current);
    // 监听点击事件
    if (onChartClick) {
      ins.on('click', (params: any) => {
        onChartClick(params, ins);
      });
    }
    Object.keys(onEvents ?? {}).forEach((k) => {
      const handler = onEvents?.[k];
      if (typeof handler === 'function') {
        ins.on(k, handler);
      }
    });

    return () => {
      if (ins) {
        // 清理点击事件
        if (onChartClick) {
          ins.off('click', onChartClick);
        }

        // 清理onEvents中的事件
        Object.keys(onEvents ?? {}).forEach((k) => {
          const handler = onEvents?.[k];
          if (typeof handler === 'function') {
            ins.off(k, handler);
          }
        });

        ins.dispose();
      }
    };
  }, []);

  useEffect(() => {
    option && getInstance()?.setOption(option);
  }, [JSON.stringify(option), theme]);

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
