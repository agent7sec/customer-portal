import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import { auth0Service } from '../services/Auth0Service';
import { config } from '../config/env';

/**
 * Configured axios instance with auth interceptors
 */
const createApiClient = (): AxiosInstance => {
    const api = axios.create({
        baseURL: config.api.baseUrl,
        timeout: 30000,
        headers: {
            'Content-Type': 'application/json',
        },
    });

    // Request interceptor - add auth token
    api.interceptors.request.use(
        async (cfg) => {
            try {
                const tokens = auth0Service.getTokens() || (await auth0Service.refreshSession());
                if (tokens?.accessToken) {
                    cfg.headers.Authorization = `Bearer ${tokens.accessToken}`;
                }
            } catch {
                // If token refresh fails, proceed without auth (will get 401)
            }
            return cfg;
        },
        (error) => Promise.reject(error)
    );

    // Response interceptor - handle auth errors
    api.interceptors.response.use(
        (response) => response,
        async (error: AxiosError) => {
            if (error.response?.status === 401) {
                // Session expired, redirect to login via Auth0
                try {
                    await auth0Service.signOut();
                } catch {
                    // If signout fails, manually redirect
                    window.location.href = '/login';
                }
            }
            return Promise.reject(error);
        }
    );

    return api;
};

export const api = createApiClient();

/**
 * Generic API request helpers
 */
export const apiClient = {
    get: <T>(url: string, config?: AxiosRequestConfig) =>
        api.get<T>(url, config).then((res) => res.data),

    post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
        api.post<T>(url, data, config).then((res) => res.data),

    put: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
        api.put<T>(url, data, config).then((res) => res.data),

    patch: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
        api.patch<T>(url, data, config).then((res) => res.data),

    delete: <T>(url: string, config?: AxiosRequestConfig) =>
        api.delete<T>(url, config).then((res) => res.data),
};
