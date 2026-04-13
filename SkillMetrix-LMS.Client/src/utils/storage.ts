const ACCESS_TOKEN_KEY = "smx_access_token";
const REFRESH_TOKEN_KEY = "smx_refresh-token";
const USER_KEY = "smx_user";

export const storage = {
  getToken: () => localStorage.getItem(ACCESS_TOKEN_KEY),
  setToken: (token: string) => localStorage.setItem(ACCESS_TOKEN_KEY, token),
  clearToken: () => localStorage.removeItem(ACCESS_TOKEN_KEY),

  getRefreshToken: () => localStorage.getItem(REFRESH_TOKEN_KEY),
  setRefreshToken: (token: string) =>
    localStorage.setItem(REFRESH_TOKEN_KEY, token),
  clearRefreshToken: () => localStorage.removeItem(REFRESH_TOKEN_KEY),

  getUser: <T>() => {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },
  setUser: (user: unknown) =>
    localStorage.setItem(USER_KEY, JSON.stringify(user)),
  clearUser: () => localStorage.removeItem(USER_KEY),

  clearAuth: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};
