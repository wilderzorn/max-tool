export const isMain = (): boolean => {
  return window.__POWERED_BY_QIANKUN__ === undefined;
};

/**
 * 生成UUID
 * @returns {string} 随机十六进制字符串。
 */
export function s4(): string {
  return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
}
export function s8(): string {
  return (((1 + Math.random()) * 0x100000000) | 0).toString(16).substring(1);
}
export function s12(): string {
  return s4() + s8();
}
export function s16(): string {
  return s8() + s8();
}
/**
 * @description: 异步等待
 * @param {number} time
 * @return {Promise<boolean>}
 */
export const waitTime = (time: number = 100): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, time);
  });
};

/**
 * @description: 是否是开发环境
 * @return {boolean}
 */
export const isDevelopment = (): boolean => {
  return process?.env?.NODE_ENV === 'development';
};

export function isEmpty(x: unknown): boolean {
  if (x === null || x === false || (typeof x === 'number' && isNaN(x))) {
    return true;
  }
  if (typeof x === 'string' && x.trim() === '') {
    return true;
  }
  if (Array.isArray(x) && x.length === 0) {
    return true;
  }
  if (typeof x === 'object' && x !== null && Object.keys(x).length === 0) {
    return true;
  }
  return false;
}

export default {
  isMain,
  s4,
  s8,
  s12,
  s16,
  waitTime,
  isDevelopment,
  isEmpty,
};
