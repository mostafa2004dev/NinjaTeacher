// auth.js — أُعيدت كتابته بعد تلف RAR — أدوات مساعدة للتوكن
export function getToken() {
  return localStorage.getItem("userToken");
}

export function isLoggedIn() {
  return Boolean(getToken());
}

export function getUserFromToken() {
  const token = getToken();
  if (!token) return null;
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}

export function logout() {
  localStorage.removeItem("userToken");
}

export function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
