import { Modal } from 'antd';
import type React from 'react';
import type { ReactNode } from 'react';
import { AlertResult } from '../resource/contacts';

type Title = string | ReactNode;
type Content = string | ReactNode | undefined;

type ModalType = 'confirm' | 'info' | 'error' | 'success';

type ModalParams = {
  title: Title;
  content?: Content;
  [key: string]: any; // 可以扩展其他 Modal 的参数
};

type ModalFunction = (params: ModalParams) => Promise<AlertResult>;

type ModalFunctions = {
  confirm: ModalFunction;
  info: ModalFunction;
  error: ModalFunction;
  success: ModalFunction;
};

const useAlert = (): [ModalFunctions, React.ReactElement] => {
  const [modal, AlertContext] = Modal.useModal();
  /**
   * 一个根据提供的类型调用模态框的函数。
   *
   * @param {ModalType} type - 要调用的模态框类型。
   * @param {ModalParams} params - 模态框的参数。
   * @return {Promise<AlertResult>} 一个承诺，解析为模态框操作的结果。
   */
  const callModal = (
    type: ModalType,
    { title, content, ...props }: ModalParams,
  ): Promise<AlertResult> => {
    return new Promise((resolve) => {
      modal[type]({
        title: title,
        content: content,
        centered: true,
        onOk: () => resolve(AlertResult.SUCCESS),
        onCancel: () => resolve(AlertResult.CANCEL),
        ...props, // 传递额外的参数
      });
    });
  };

  const createModalFunction = (type: ModalType): ModalFunction => {
    return (params) => callModal(type, params);
  };

  const confirm = createModalFunction('confirm');
  const info = createModalFunction('info');
  const error = createModalFunction('error');
  const success = createModalFunction('success');

  return [{ confirm, info, error, success }, AlertContext];
};

export default useAlert;
