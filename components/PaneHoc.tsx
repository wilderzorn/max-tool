/*
 * @Autor: zhangzhihao
 * @Description: HOC 的主要用途
 * 1. 代码复用、逻辑抽象：HOC 可以将组件间共享的逻辑抽象出来，提高代码的复用性。例如，处理权限、数据获取、状态管理等通用逻辑。
 * 2. 增强组件：HOC 可以为组件添加额外的功能，如日志记录、错误处理、性能优化等。
 * 3. 条件渲染：HOC 可以根据某些条件决定是否渲染传入的组件或渲染不同的组件。
 * 4. 注入 Props：HOC 可以向组件注入额外的 props，例如从 Context 中获取的值、计算属性等。
 */

import type { ComponentType } from 'react';
import React from 'react';
import { useStaticState, useTRState } from '../utils/trHooks';

type PaneHocProps = {
  staticState: any;
  state: any;
  setState: (state: any) => void;
};

function PaneHoc<T extends object>(
  WrappedComponent: ComponentType<T>,
  defaultState = {},
  defaultStaticState = {},
) {
  const EnhancedComponent: React.FC<Omit<T, keyof PaneHocProps>> = (props) => {
    const hocStaticState = useStaticState({ ...defaultStaticState });
    const [hocState, setHocState] = useTRState({ ...defaultState });
    return (
      <WrappedComponent
        {...(props as T)}
        hocStaticState={hocStaticState}
        hocState={hocState}
        setHocState={setHocState}
      />
    );
  };

  return React.memo(EnhancedComponent);
}

export default PaneHoc;
