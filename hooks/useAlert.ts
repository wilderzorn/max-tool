import { Modal } from 'antd';
import type React from 'react';
import type { ReactNode } from 'react';
import { AlertResult } from '../utils/contacts';

type Title = string | ReactNode;
type Content = string | ReactNode | undefined;
type ConfirmModalProps = {
  index: AlertResult;
};

type ModalType = 'confirm' | 'info' | 'error' | 'success';

type ConfirmModalFunctions = {
  confirm: (title: Title, content?: Content) => Promise<ConfirmModalProps>;
  info: (title: Title, content?: Content) => Promise<ConfirmModalProps>;
  error: (title: Title, content?: Content) => Promise<ConfirmModalProps>;
  success: (title: Title, content?: Content) => Promise<ConfirmModalProps>;
};

const useAlert = (): [ConfirmModalFunctions, React.ReactElement] => {
  const [modal, AlertContext] = Modal.useModal();

  const callModal = (
    type: ModalType,
    title: Title,
    content?: Content,
  ): Promise<ConfirmModalProps> => {
    return new Promise((resolve) => {
      modal[type]({
        title: title,
        content: content,
        onOk: () => resolve({ index: AlertResult.SUCCESS }),
        onCancel: () => resolve({ index: AlertResult.CANCEL }),
      });
    });
  };

  const createModalFunction = (
    type: ModalType,
  ): ((title: Title, content?: Content) => Promise<ConfirmModalProps>) => {
    return (title, content) => callModal(type, title, content);
  };

  const confirm = createModalFunction('confirm');
  const info = createModalFunction('info');
  const error = createModalFunction('error');
  const success = createModalFunction('success');

  return [{ confirm, info, error, success }, AlertContext];
};

export default useAlert;
