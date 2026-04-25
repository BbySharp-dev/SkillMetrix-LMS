import api from "./axios.ts";
import type {AuthPayload, LoginRequest, RegisterRequest} from "../types/auth.ts";
import type {ApiResponse} from "@/types/api.ts";


export const authApi = {
    login: async (payload: LoginRequest): Promise<AuthPayload> => {
        const res = await api.post('/auth/login' , payload) as unknown as ApiResponse<AuthPayload>;
        return res.data!;
    },
    register: async (payload: RegisterRequest): Promise<AuthPayload> => {
        const res = await api.post('/auth/register' , payload) as unknown as ApiResponse<AuthPayload>;
        return res.data!;
    },
    logout: async (refreshToken: string): Promise<void> => {
        await api.post('/auth/logout' , {refreshToken});
    },
}