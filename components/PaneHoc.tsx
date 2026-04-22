/*
 * @Description: PaneHoc - 高阶组件
 *
 * 主要功能:
 * 1. 状态管理: 提供 hocState 和 hocStaticState 状态管理
 * 2. Context 注入: 支持注入多个外部 Context 数据
 * 3. 代码复用: 封装通用逻辑，减少重复代码
 * 4. 类型安全: 完整的 TypeScript 类型支持
 */

import type { ComponentType, Context } from 'react';
import React, { useContext } from 'react';
import { useStaticState, useTRState } from '../index';

// ===================== 类型定义区域 =====================

/**
 * PaneHoc 注入给被包装组件的 Props
 *
 * @prop hocStaticState - 静态状态，使用 useStaticState 管理
 * @prop hocState - 动态状态，使用 useTRState 管理
 * @prop setHocState - 设置动态状态的函数
 * @prop contextData - 主 Context 数据 (如果配置了 contexts.main)
 * @prop [contextKey] - 其他自定义 Context 数据
 */
export interface PaneHocProps {
  hocStaticState: any;
  hocState: any;
  setHocState: (state: any) => void;
  contextData?: any; // 主 Context 数据
  [key: string]: any;
}

/**
 * PaneHoc 配置选项
 *
 * @prop defaultState - 动态状态默认值
 * @prop defaultStaticState - 静态状态默认值
 * @prop contexts - Context 配置对象
 *   @prop main - 主 Context，通常用于应用全局状态
 *   @prop [key] - 其他自定义 Context
 * @prop contextDefaults - Context 默认值（当 Context 无值时使用）
 */
export interface PaneHocOptions {
  defaultState?: any;
  defaultStaticState?: any;
  contexts?: {
    main?: Context<any>; // 主 Context
    // 支持任意数量的自定义 Context
    [key: string]: Context<any> | undefined;
  };
  contextDefaults?: {
    main?: any; // 主 Context 默认值
    [key: string]: any; // 其他 Context 默认值
  };
}

// ===================== 核心函数区域 =====================

/**
 * PaneHoc 高阶组件主函数
 *
 * @param WrappedComponent - 要被包装的组件
 * @param options - 配置选项（可选）
 * @returns 包装后的组件
 *
 * @example
 * // 基本用法（只使用状态管理）
 * export default PaneHoc(MyComponent, {
 *   defaultState: { count: 0 },
 *   defaultStaticState: { loaded: false }
 * });
 *
 * @example
 * // 使用 Context
 * export default PaneHoc(MyComponent, {
 *   defaultState: { count: 0 },
 *   contexts: {
 *     main: AppContext,    // 注入 AppContext
 *     user: UserContext,   // 注入 UserContext
 *   }
 * });
 */
function PaneHoc<T extends object>(
  WrappedComponent: ComponentType<T>,
  options?: PaneHocOptions,
) {
  // 解构配置参数，提供默认值
  const {
    defaultState = {}, // 动态状态默认值
    defaultStaticState = {}, // 静态状态默认值
    contexts = {}, // Context 配置
    contextDefaults = {}, // Context 默认值
  } = options || {};

  /**
   * EnhancedComponent - 包装后的组件
   *
   * 这个组件会:
   * 1. 初始化状态管理 (hocStaticState, hocState, setHocState)
   * 2. 获取所有配置的 Context 数据
   * 3. 将所有状态和 Context 数据作为 props 传递给被包装组件
   */
  const EnhancedComponent: React.FC<Omit<T, keyof PaneHocProps>> = (props) => {
    // ============ 1. 状态管理 ============

    /**
     * hocStaticState - 静态状态
     * 使用 useStaticState 管理，适合存储不频繁变化的数据
     * 如: 配置信息、初始化标志等
     */
    const hocStaticState = useStaticState({ ...defaultStaticState });

    /**
     * [hocState, setHocState] - 动态状态
     * 使用 useTRState 管理，适合存储频繁变化的数据
     * 如: 计数器、表单数据等
     */
    const [hocState, setHocState] = useTRState({ ...defaultState });

    // ============ 2. Context 数据处理 ============

    /**
     * contextData - 存储所有 Context 数据的对象
     * 键: Context 名称 (来自 contexts 配置)
     * 值: Context 的实际数据
     */
    const contextData: Record<string, any> = {};

    // 遍历 contexts 配置，获取所有 Context 数据
    Object.entries(contexts).forEach(([key, Context]) => {
      if (Context) {
        try {
          // 使用 useContext 获取 Context 数据
          const contextValue = useContext(Context);
          contextData[key] = contextValue;
        } catch (error) {
          // 如果获取失败，使用默认值并输出警告
          console.warn(`获取 ${key} Context 失败:`, error);
          contextData[key] = contextDefaults[key] || {};
        }
      }
    });

    // ============ 3. 准备注入的 props ============

    /**
     * injectedProps - 要注入给被包装组件的 props
     * 包含:
     * 1. 状态管理相关的 props
     * 2. 所有 Context 数据（按配置的键名）
     */
    const injectedProps: Partial<PaneHocProps> = {
      // 状态管理 props
      hocStaticState,
      hocState,
      setHocState,

      // Context 数据 props（按键名注入）
      ...Object.keys(contexts).reduce((acc, key) => {
        if (contextData[key]) {
          acc[key] = contextData[key];
        }
        return acc;
      }, {} as Record<string, any>),
    };

    // 为常用的 Context 提供快捷访问（可选）
    // 如果配置了 main Context，额外提供 contextData 别名
    if (contexts.main && contextData.main) {
      injectedProps.contextData = contextData.main;
    }

    // ============ 4. 渲染被包装组件 ============

    return (
      <WrappedComponent
        {...(props as T)} // 原始 props
        {...injectedProps} // 注入的 props
      />
    );
  };

  // ============ 5. 设置组件显示名称（便于调试） ============

  /**
   * 设置组件的 displayName，便于在 React DevTools 中识别
   * 格式: PaneHoc(原组件名)
   */
  const componentName =
    WrappedComponent.displayName || WrappedComponent.name || 'Component';
  EnhancedComponent.displayName = `PaneHoc(${componentName})`;

  // 返回包装后的组件，使用 React.memo 优化性能
  return React.memo(EnhancedComponent);
}

// ===================== 快捷方法区域 =====================

/**
 * withContext - PaneHoc 的快捷方法
 *
 * 用于简化只有单个 Context 的包装场景
 *
 * @param WrappedComponent - 要被包装的组件
 * @param context - 要注入的 Context
 * @param defaultState - 动态状态默认值（可选）
 * @param defaultStaticState - 静态状态默认值（可选）
 * @returns 包装后的组件
 *
 * @example
 * // 简化用法，只注入一个 Context
 * export default PaneHoc.withContext(MyComponent, AppContext, { count: 0 });
 */
PaneHoc.withContext = function <T extends object>(
  WrappedComponent: ComponentType<T>,
  context?: Context<any>,
  defaultState?: any,
  defaultStaticState?: any,
) {
  return PaneHoc(WrappedComponent, {
    defaultState,
    defaultStaticState,
    contexts: context ? { main: context } : {},
  });
};

// ===================== 自定义 Hook 区域 =====================

/**
 * createPaneHook - 创建自定义 Hook
 *
 * 用于在函数组件中直接使用 PaneHoc 的状态管理逻辑
 * 而不需要包装整个组件
 *
 * @param options - 配置选项
 * @returns 包含状态管理函数的对象
 *
 * @example
 * // 在组件内部使用
 * function MyComponent() {
 *   const { hocState, setHocState } = usePaneState({ count: 0 });
 *   // ...
 * }
 */
PaneHoc.createHook = function (options?: Omit<PaneHocOptions, 'contexts'>) {
  return function usePaneState() {
    const { defaultState = {}, defaultStaticState = {} } = options || {};

    const hocStaticState = useStaticState({ ...defaultStaticState });
    const [hocState, setHocState] = useTRState({ ...defaultState });

    return {
      hocStaticState,
      hocState,
      setHocState,
    };
  };
};

// 默认导出
export default PaneHoc;
