import api from '@/lib/axios';
import { assertSuccess } from '@/shared';
export { ApiError } from '@/shared';
import type { AuthPayload, AuthResponse, LoginRequest, RegisterRequest } from '../types';

export const authApi = {
    login: async (payload: LoginRequest): Promise<AuthPayload> => {
        const res = await api.post('/auth/login', payload) as unknown as { success: boolean; data: AuthResponse; message?: string; errors?: string[] | null };
        assertSuccess<AuthResponse>(res);
        const data = (res as { data: AuthResponse }).data;
        return {
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            user: {
                id: data.user.id,
                fullName: data.user.fullName,
                avatarUrl: data.user.avatarUrl,
                role: data.user.role,
            },
        };
    },
    register: async (payload: RegisterRequest): Promise<AuthPayload> => {
        const res = await api.post('/auth/register', payload) as unknown as { success: boolean; data: AuthResponse; message?: string; errors?: string[] | null };
        assertSuccess<AuthResponse>(res);
        const data = (res as { data: AuthResponse }).data;
        return {
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            user: {
                id: data.user.id,
                fullName: data.user.fullName,
                avatarUrl: data.user.avatarUrl,
                role: data.user.role,
            },
        };
    },
    logout: async (refreshToken: string): Promise<void> => {
        await api.post('/auth/logout', { refreshToken });
    },
    forgotPassword: async (email: string): Promise<void> => {
        const res = await api.post('/auth/forgot-password', { email });
        assertSuccess(res);
    },
    resetPassword: async (payload: { email: string; token: string; newPassword: string }): Promise<void> => {
        const res = await api.post('/auth/reset-password', payload);
        assertSuccess(res);
    },
    verifyEmail: async (userId: string, token: string): Promise<void> => {
        const res = await api.post('/auth/confirm-email', { userId, token });
        assertSuccess(res);
    },
    resendVerification: async (email: string): Promise<void> => {
        const res = await api.post('/auth/resend-verification', { email });
        assertSuccess(res);
    },
};
