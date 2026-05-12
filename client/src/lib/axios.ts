import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import type { CurrentUser } from '@/features/auth/types';
import { useAuthStore } from '@/features/auth/hooks/useAuthStore';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5015/api';

// Create axios instance
const api = axios.create({ baseURL: API_BASE_URL });

// Types
type RefreshTokenResponse = {
    success: boolean;
    data?: {
        accessToken: string;
        refreshToken: string;
        user: CurrentUser;
    };
};

// Refresh token singleton
let refreshTokenPromise: Promise<string | null> | null = null;

async function fetchNewToken(): Promise<string | null> {
    try {
        const { refreshToken } = useAuthStore.getState();
        if (!refreshToken) throw new Error('No refresh token available');

        const { data: payload } = await axios.post<RefreshTokenResponse>(
            `${API_BASE_URL}/auth/refresh-token`,
            { refreshToken }
        );

        if (payload.success && payload.data) {
            useAuthStore.getState().setAuth(
                payload.data.accessToken,
                payload.data.refreshToken,
                payload.data.user
            );
            return payload.data.accessToken;
        }

        return null;
    } catch {
        useAuthStore.getState().clearAuth();
        window.location.href = '/login';
        return null;
    } finally {
        refreshTokenPromise = null;
    }
}

// Request interceptor - add auth token
api.interceptors.request.use((config) => {
    const { accessToken } = useAuthStore.getState();
    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
});

// Response interceptor - handle errors and normalize
api.interceptors.response.use(
    (response) => response.data,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
        const isAuthApi = originalRequest.url?.includes('/auth/');

        // Extract error message from response
        const responseData = error.response?.data as Record<string, unknown>;
        if (responseData?.message && typeof responseData.message === 'string') {
            error.message = responseData.message;
        }

        // Handle 401 - try refresh token
        if (error.response?.status !== 401 || originalRequest._retry || isAuthApi) {
            return Promise.reject(error);
        }

        originalRequest._retry = true;

        if (!refreshTokenPromise) {
            refreshTokenPromise = fetchNewToken();
        }

        const newAccessToken = await refreshTokenPromise;

        if (!newAccessToken) {
            return Promise.reject(error);
        }

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
    }
);

export default api;
