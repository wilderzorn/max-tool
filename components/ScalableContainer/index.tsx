import React from 'react';
import { useTRState } from '../../hooks/trHooks';
import { useSize } from 'ahooks';
import styles from './index.less';

type Size = { width: number; height: number } | undefined;

interface SProps {
  /** 子组件 */
  children?: React.ReactNode;
  /** 容器自定义 class */
  className?: string;
  /** 容器自定义样式 */
  style?: React.CSSProperties;
  /** 缩放配置参数 */
  config?: Config;
}

interface Config {
  /** 设计稿基准宽度（默认 1920） */
  uiWidth?: number;
  /** 最小缩放比例（默认 0.1） */
  minScale?: number;
  /** 缩放过渡时间（单位：秒，默认 0.3） */
  transitionDuration?: number;
}

/**
 * 自适应缩放容器组件
 * @param {Object} config - 配置对象
 * @param {number} config.uiWidth - 设计稿基准宽度
 * @param {number} config.minScale - 最小缩放比例
 * @param {number} config.transitionDuration - 缩放动画时长(秒)
 */
export default React.memo(
  React.forwardRef((props: SProps, ref) => {
    const { children, className = '', style = {}, config = {} } = props;

    const { uiWidth = 1920, minScale = 0.1, transitionDuration = 0.3 } = config;

    const pageRef = React.useRef<HTMLDivElement | any>();

    const size: Size = useSize(pageRef);

    const [state, setState] = useTRState({
      pageScale: 1,
      pageHeight: 0,
    });

    React.useImperativeHandle(ref, () => {
      return { pageScale: state.pageScale };
    });

    const updateScale = React.useCallback(() => {
      if (!size || size.width <= 0 || size.height <= 0) return;
      const calculatedScale = Math.max(size.width / uiWidth, minScale);
      const pageHeight = Math.max(size.height / calculatedScale, 0);
      setState((prev) => {
        const scaleChanged = Math.abs(prev.pageScale - calculatedScale) > 0.01;
        const heightChanged = Math.abs(prev.pageHeight - pageHeight) > 1;
        return scaleChanged || heightChanged
          ? { pageScale: calculatedScale, pageHeight }
          : prev;
      });
    }, [size, uiWidth, minScale]);

    React.useEffect(() => {
      const handle = requestAnimationFrame(updateScale);
      return () => cancelAnimationFrame(handle);
    }, [updateScale]);

    return (
      <div
        ref={pageRef}
        className={`${styles.content} ${className}`}
        style={style}
      >
        <div
          className={styles.wrapper}
          style={{
            transform: `scale(${state.pageScale})`,
            transition: `transform ${transitionDuration}s`,
            width: uiWidth,
            height: state.pageHeight,
          }}
        >
          {children}
        </div>
      </div>
    );
  }),
);
