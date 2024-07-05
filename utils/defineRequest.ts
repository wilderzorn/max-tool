import { history } from '@umijs/max';
import { message } from 'antd';
import { setAuthorization, getAuthorization } from './authority';

const request = {
  // 超时时间
  timeout: 1000 * 10,
  baseURL: '/api',
  // 请求头
  errorConfig: {
    errorThrower: (res: any) => {
      const { success, data, errorCode, errorMessage, showType } = res;
      if (!success) {
        const error: any = new Error(errorMessage);
        error.name = 'BizError';
        error.info = { errorCode, errorMessage, showType, data };
        throw error; // 抛出自制的错误
      }
    },
    errorHandler: (error: any) => {
      // eslint-disable-next-line no-console
      console.log('error', error);
      // TODO：配置后端接口的code
      if (error.response.data?.code) {
        // 请求成功发出且服务器也响应了状态码，但状态代码超出了 2xx 的范围
        switch (error.response.data.code) {
          case 200: {
            return;
          }
          case 401: {
            setAuthorization();
            if (location.pathname !== 'login') {
              history.replace('/login');
              message.error('请先登录');
            }
            return;
          }
          default: {
            message.error(error.response.data?.data);
            return;
          }
        }
      } else if (error.request) {
        // 请求已经成功发起，但没有收到响应
        message.error('服务器错误，请稍后重试！');
      } else {
        // 发送请求时出了点问题
        message.error('请求错误，请重试！');
      }
    },
  },
  // 拦截器
  requestInterceptors: [
    (url: any, options: any): any => {
      // 拦截请求配置，进行个性化处理。
      if (url === '/api/user/userLogin') {
        localStorage.clear();
      }
      const token = getAuthorization();

      return {
        url,
        options: {
          ...options,
          // 设置请求头
          headers: {
            'Content-Type': 'application/json',
            Logintoken: token,
            ...(options.headers ?? {}),
          },
        },
      };
    },
  ],
  responseInterceptors: [
    (res: any) => {
      return res;
    },
  ],
};
export default request;
