import type { AuthPayload, LoginRequest, RegisterRequest } from "@/types/auth";
import api from "./axios";

export const authApi = {
  login: async (payload: LoginRequest): Promise<AuthPayload> => {
    const res = await api.post("/auth/login", payload);
    return res.data.data as AuthPayload;
  },

  register: async (payload: RegisterRequest): Promise<AuthPayload> => {
    const res = await api.post("/auth/register", payload);
    return res.data.data as AuthPayload;
  },

  logout: async (refreshToken: string): Promise<void> => {
    await api.post("/auth/logout", { refreshToken });
  },
};
