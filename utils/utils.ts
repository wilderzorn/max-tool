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

export default {
  isMain,
  s4,
  s8,
  s12,
  s16,
};
