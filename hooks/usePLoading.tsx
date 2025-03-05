import { Spin } from 'antd';
import { s8 } from '../utils/utils';
import { useRef } from 'react';
import { useNotification } from 'rc-notification';
import type { FC, CSSProperties } from 'react';
import { styled } from '@umijs/max';

interface LoadingOverlayProps {
  tip?: string;
  styles?: CSSProperties;
}

const TRSpan = styled.span`
  color: var(--font);
`;

const LoadingOverlay: FC<LoadingOverlayProps> = ({ tip = '', styles }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      rowGap: '10px',
      position: 'absolute',
      top: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      zIndex: 100,
      ...styles,
    }}
  >
    <Spin />
    <TRSpan>{tip}</TRSpan>
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
