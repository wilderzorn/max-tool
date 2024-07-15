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
  show: (
    Content: ComponentType<ContentProps>,
    props?: Record<string, any>,
  ) => Promise<any>;
}

const useNotice = (): [UseNoticeReturn, React.ReactElement] => {
  const [notice, NoticeContext] = useNotification({ duration: 0 });

  const show = (
    Content: ComponentType<ContentProps>,
    props: Record<string, any> = {},
  ): Promise<any> => {
    const __key = s8();
    return new Promise<any>((resolve) => {
      const onPress = async (
        data: Record<string, any> = { index: AlertResult.CANCEL },
      ) => {
        resolve(data);
        await abortableDelay(300);
        notice.close(__key);
        notice.destroy();
      };
      notice.open({
        content: <Content onPress={onPress} {...props} />,
        key: __key,
      });
    });
  };

  return [{ show }, NoticeContext];
};

export default useNotice;
