import type { RequestOptions } from '@umijs/max';
import { request } from '@umijs/max';

// 定义接口来描述返回的数据
type ResponseData = Record<string, any>;

// 定义请求参数类型（扩展 RequestOptions，允许传入 signal）
type RequestParams = Omit<RequestOptions, 'signal'> & {
  signal?: AbortSignal;
} & Record<string, any>;

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

  public abort(): void {
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

const abortCentre = AbortCentre.getInstance();

export { abortCentre };

/**
 * 发送请求
 * @param url 请求地址
 * @param params 请求参数，可传入自定义的 signal
 * @returns Promise<ResponseData | undefined>
 */
export default async function requestWithAbort(
  url: string,
  params: RequestParams = {},
): Promise<ResponseData | undefined> {
  try {
    const signal = params.signal || abortCentre.signal();
    const res = await request<ResponseData>(url, {
      ...params,
      signal,
    });
    // 如果请求已经被中止，则不处理响应
    if (signal?.aborted) {
      return;
    }
    return res;
  } catch (error: any) {
    console.error('Request failed', error);
    throw error;
  }
}
