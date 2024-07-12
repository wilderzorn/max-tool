/*
 * @Autor: wilderzorn wilderzorn@163.com
 * @Date: 2024-06-01 00:08:02
 * @FilePath: /src/tool/utils/authority.ts
 * @Description:
 */
export function getAuthority() {
  const auth = getAuthorization();
  return auth.length > 0 ? 'admin' : '';
}
export function getAuthorization() {
  // 权限
  return localStorage.getItem('dqtoken') || '';
}

export function setAuthorization(authority: string | undefined = undefined) {
  if (authority) return localStorage.setItem('dqtoken', authority);
  localStorage.removeItem('dqtoken');
}
