import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/features/auth/hooks/useAuthStore';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5015/api';

const api = axios.create({ baseURL: API_BASE_URL });

let refreshTokenPromise: Promise<string | null> | null = null;

async function fetchNewToken(): Promise<string | null> {
    try {
        const refreshToken = useAuthStore.getState().refreshToken;
        if (!refreshToken) throw new Error('No Refresh Token');

        const res = await axios.post(`${API_BASE_URL}/auth/refresh-token`, { refreshToken });
        const { accessToken, refreshToken: newRefresh, user } = res.data.data;

        useAuthStore.getState().setAuth(accessToken, newRefresh, user);

        return accessToken;
    } catch {
        useAuthStore.getState().clearAuth();
        window.location.href = '/login';
        return null;
    } finally {
        refreshTokenPromise = null;
    }
}

api.interceptors.request.use((config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response.data,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
        const isAuthApi = originalRequest.url?.includes('/auth/');

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

