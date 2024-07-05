import type { RequestOptions } from '@umijs/max';
import { request } from '@umijs/max';

// 定义接口来描述返回的数据
type ResponseData = Record<string, any>;

// 定义请求参数类型
type RequestParams = RequestOptions & Record<string, any>;

class AbortCentre {
  private controller: AbortController | null;

  private constructor() {
    this.controller = null;
    this.onInit();
  }

  private onInit(): void {
    this.controller = new AbortController(); // 创建一个控制器
  }

  public signal(): AbortSignal | undefined {
    return this.controller?.signal;
  }

  public clear(): void {
    if (this.controller) {
      this.controller.abort();
      this.onInit(); // 重新初始化控制器
    }
  }

  public destroy(): void {
    this.controller = null;
  }

  private static instance: AbortCentre;

  public static getInstance(): AbortCentre {
    if (!this.instance) {
      this.instance = new AbortCentre();
    }
    return this.instance;
  }
}

const abortController = AbortCentre.getInstance();

export default async function (
  url: string,
  params: RequestParams = {},
): Promise<ResponseData | undefined> {
  try {
    const res = await request<ResponseData>(url, {
      ...params,
      signal: abortController.signal(),
    });
    if (abortController.signal()?.aborted) {
      return; // 如果请求已经被中止，则不处理响应
    }
    return res;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      // eslint-disable-next-line no-console
      console.log('Request was aborted');
    } else {
      // eslint-disable-next-line no-console
      console.error('Request failed', error);
    }
  }
}
