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
