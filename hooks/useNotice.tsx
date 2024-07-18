import { useNotification } from 'rc-notification';
import type { ComponentType } from 'react';
import React from 'react';
import abortableDelay from '../utils/abortableDelay';
import { AlertResult } from '../utils/contacts';
import { s8 } from '../utils/utils';

interface ContentProps {
  onPress: (data?: Record<string, any>) => void;
  [key: string]: any;
}

interface UseNoticeReturn {
  open: <T = any>(
    Content: ComponentType<ContentProps>,
    props?: Record<string, any>,
  ) => Promise<T>;
}
/**
 * 自定义钩子 `useNotice`，用于管理通知组件的显示和关闭。
 * @returns 包含打开通知的函数和通知上下文的数组。
 */
const useNotice = (): [UseNoticeReturn, React.ReactElement] => {
  const [notice, NoticeContext] = useNotification({ duration: 0 });
  /**
   * 打开通知。
   * @template T - 通知关闭时解析的 Promise 的类型。
   * @param Content - 要显示的内容组件。
   * @param props - 可选的内容组件属性。
   * @returns 一个 Promise，该 Promise 在通知关闭时解析。
   */
  function open<T = any>(
    Content: ComponentType<ContentProps>,
    props: Partial<ContentProps> = {},
  ): Promise<T> {
    const __key = s8();
    return new Promise<T>((resolve) => {
      const onPress = async (
        data: Record<string, any> = { index: AlertResult.CANCEL },
      ) => {
        resolve(data as T);
        await abortableDelay(300);
        notice.close(__key);
        notice.destroy();
      };
      notice.open({
        content: <Content onPress={onPress} {...props} />,
        key: __key,
      });
    });
  }

  return [{ open }, NoticeContext];
};

export default useNotice;
