import { request } from '@umijs/max';

class AbortCentre {
  constructor() {
    this.controller = null;
    this.onInit();
  }
  onInit() {
    this.controller = new AbortController(); // 创建一个控制器
  }
  signal() {
    return this.controller?.signal;
  }
  clear() {
    this.controller.abort();
  }
  destroy() {
    this.controller = null;
  }
}

AbortCentre.getInstance = (function () {
  let instance;
  return function () {
    instance = instance ? instance : new AbortCentre();
    return instance;
  };
})();

export const abortController = AbortCentre.getInstance();

export default async function (url, params = {}) {
  return new Promise(async (resolve) => {
    const res = await request(url, {
      ...params,
      signal: abortController.signal(),
    });
    const signal = abortController.signal();
    if (!signal || (signal?.aborted ?? false) === true) {
      return;
    }
    resolve(res);
  });
}
