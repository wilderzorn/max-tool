import { message } from 'antd';
import type React from 'react';

type MessageType = 'info' | 'success' | 'error' | 'warning' | 'loading';

type MessageFunction = (
  content: React.ReactNode | string,
  duration?: number,
  onClose?: () => void,
) => Promise<void> | void;

type MessageFunctions = {
  [key in MessageType]: MessageFunction;
};

const useMessage = (): [MessageFunctions, React.ReactElement] => {
  const [messageApi, MessageContext] = message.useMessage();

  const callMessage = (
    type: MessageType,
    content: React.ReactNode | string,
    duration: number = 3,
    onClose?: () => void,
  ) => {
    messageApi[type](content, duration, onClose);
  };

  const createMessageFunction = (type: MessageType): MessageFunction => {
    return (content, duration, onClose) => callMessage(type, content, duration, onClose);
  };

  const messageFunctions: MessageFunctions = {
    info: createMessageFunction('info'),
    success: createMessageFunction('success'),
    error: createMessageFunction('error'),
    warning: createMessageFunction('warning'),
    loading: createMessageFunction('loading'),
  };

  return [messageFunctions, MessageContext];
};

export default useMessage;
