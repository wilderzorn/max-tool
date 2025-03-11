/**
 * 判断当前应用是否为主应用
 * @returns {boolean} 如果是主应用返回 true，如果是微应用返回 false
 */
export const isMain = (): boolean => {
  return window.__POWERED_BY_QIANKUN__ === undefined;
};

/**
 * @description: 是否是开发环境
 * @return {boolean}
 */
export const isDevelopment = (): boolean => {
  return process?.env?.NODE_ENV === 'development';
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
 * 检查给定值是否为空
 * 以下情况将返回 true:
 * - null
 * - false
 * - NaN
 * - 空字符串或仅包含空格的字符串
 * - 空数组
 * - 空对象
 * - 空 Map
 * - 空 Set
 * @param x - 要检查的值
 * @returns 如果值为空则返回 true，否则返回 false
 */
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
  if (x instanceof Map && x.size === 0) {
    return true;
  }
  if (x instanceof Set && x.size === 0) {
    return true;
  }
  return false;
}

/**
 * 将指定文本复制到系统剪贴板
 * @param text 要复制的文本内容
 * @returns Promise 对象,复制成功时 resolve,失败时 reject
 */
export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}

/**
 * 计算指定日期是一年中的第几天
 * @param date - 要计算的日期对象
 * @returns 返回一年中的第几天(1-366)
 */
export function dayOfYear(date: Date): number {
  const startOfYear = new Date(date.getFullYear(), 0, 0); // 上一年的最后一天
  const diff = date.getTime() - startOfYear.getTime(); // 时间戳差值
  const millisecondsInDay = 1000 * 60 * 60 * 24; // 一天的毫秒数
  return Math.floor(diff / millisecondsInDay);
}

/**
 * 计算RGB颜色值的灰度值
 * @param r - 红色通道值 (0-255)
 * @param g - 绿色通道值 (0-255)
 * @param b - 蓝色通道值 (0-255)
 * @returns 返回灰度值，基于 ITU-R BT.709 标准权重
 */
export function gray(r: number, g: number, b: number): number {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * 解析 URL 查询字符串为对象
 * @param query - URL 查询字符串(形如 'a=1&b=2')
 * @returns 包含查询参数键值对的对象
 * @example
 * ```ts
 * parseQuery('foo=bar&hello=world') // { foo: 'bar', hello: 'world' }
 * ```
 */
export function parseQuery(query: string): Record<string, string | string[]> {
  const result: Record<string, string | string[]> = {};
  query
    .replace(/^[?&]/, '')
    .split('&')
    .forEach((pair) => {
      const [key, value = ''] = pair.split('=');
      if (key) {
        const decodedKey = decodeURIComponent(key);
        const decodedValue = decodeURIComponent(value);
        if (result.hasOwnProperty(decodedKey)) {
          // 如果键已存在，将值转为数组
          if (Array.isArray(result[decodedKey])) {
            (result[decodedKey] as string[]).push(decodedValue);
          } else {
            result[decodedKey] = [result[decodedKey] as string, decodedValue];
          }
        } else {
          result[decodedKey] = decodedValue;
        }
      }
    });
  return result;
}

/**
 * 生成一个随机的十六进制颜色值
 * @returns 返回格式为 "#RRGGBB" 的颜色字符串
 * @example
 * ```ts
 * const color = randomColor(); // 返回类似 "#1a2b3c" 的颜色值
 * ```
 */
export function randomColor(): string {
  return `#${Math.floor(Math.random() * 0xffffff)
    .toString(16)
    .padStart(6, '0')}`;
}

export default {
  isMain,
  s4,
  s8,
  s12,
  s16,
  isDevelopment,
  isEmpty,
  copyToClipboard,
  dayOfYear,
  gray,
  parseQuery,
  randomColor,
};
