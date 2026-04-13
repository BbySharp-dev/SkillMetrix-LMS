import { create } from "zustand";
import { storage } from "../utils/storage";
import type { CurrentUser } from "@/types/auth";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: CurrentUser | null;
  isAuthenticated: boolean;

  setAuth: (
    accessToken: string,
    refreshToken: string,
    user: CurrentUser,
  ) => void;
  clearAuth: () => void;
  hydrateFromStorage: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  refreshToken: null,
  user: null,
  isAuthenticated: false,

  setAuth: (accessToken, refreshToken, user) => {
    storage.setToken(accessToken);
    storage.setRefreshToken(refreshToken);
    storage.setUser(user);
    set({ accessToken, refreshToken, user, isAuthenticated: true });
  },

  clearAuth: () => {
    storage.clearAuth();
    set({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
    });
  },

  hydrateFromStorage: () => {
    const token = storage.getToken();
    const refreshToken = storage.getRefreshToken();
    const user = storage.getUser<CurrentUser>();

    if (token && refreshToken && user) {
      set({ accessToken: token, refreshToken, user, isAuthenticated: true });
      return;
    }

    set({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
    });
  },
}));
