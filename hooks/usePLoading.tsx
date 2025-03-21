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
const TRDiv = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  row-gap: 10px;
  position: absolute;
  top: 0;
  width: 100vw;
  height: 100vh;
  background-color: var(--bg-mask);
  z-index: 99;
  padding-top: 20%;
`;

const LoadingOverlay: FC<LoadingOverlayProps> = ({ tip = '', styles = {} }) => (
  <TRDiv style={styles}>
    <Spin />
    <TRSpan>{tip}</TRSpan>
  </TRDiv>
);

interface UsePLoadingReturn {
  showLoading: (tip?: string, styles?: CSSProperties) => void;
  hideLoading: () => void;
}

export const usePLoading = (): [UsePLoadingReturn, React.ReactElement] => {
  const [notice, LoadingProvider] = useNotification();
  const currentKeyRef = useRef<{ __key__: string | null }>({ __key__: null });

  const showLoading = (tip?: string, styles?: CSSProperties) => {
    if (currentKeyRef.current.__key__) return;
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
