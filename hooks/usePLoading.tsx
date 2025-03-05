import { Spin } from 'antd';
import { s8 } from '../utils/utils';
import { useRef } from 'react';
import { useNotification, NotificationAPI } from 'rc-notification';
import type { FC, CSSProperties } from 'react';

interface LoadingOverlayProps {
  tip?: string;
  styles?: CSSProperties;
}

const LoadingOverlay: FC<LoadingOverlayProps> = ({
  tip = 'Loading...',
  styles,
}) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      position: 'absolute',
      top: 0,
      width: '100%',
      height: '100%',
      backgroundColor: '#00000052',
      zIndex: 100,
      ...styles,
    }}
  >
    <Spin />
    <span>{tip}</span>
  </div>
);

interface OpenParams {
  tip?: string;
  styles?: CSSProperties;
}

interface UsePLoadingReturn {
  showLoading: (params?: OpenParams) => void;
  hideLoading: () => void;
}

export const usePLoading = (): [UsePLoadingReturn, React.ReactElement] => {
  const [notice, LoadingProvider] = useNotification();
  const currentKeyRef = useRef<{ __key__: string | null }>({ __key__: null });

  const showLoading = (params: OpenParams = {}) => {
    if (currentKeyRef.current.__key__) return;
    const { tip = '', styles = {} } = params;
    const __key__ = s8();
    currentKeyRef.current.__key__ = __key__;
    notice.open({
      content: <LoadingOverlay tip={tip} styles={styles} />,
      key: __key__,
      duration: 0,
      placement: 'top',
    });
  };

  const hideLoading = () => {
    if (currentKeyRef.current.__key__) {
      notice.close(currentKeyRef.current.__key__);
      currentKeyRef.current.__key__ = null;
    }
  };

  return [{ showLoading, hideLoading }, LoadingProvider];
};

export default usePLoading;
