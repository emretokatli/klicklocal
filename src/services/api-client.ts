import axios, {
  type AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from 'axios';

import { clearToken, getToken } from '@/lib/token';
import type { ApiError, ApiSuccess } from '@/types/api';

export class ApiClientError extends Error {
  constructor(
    message: string,
    public status: number,
    public errors?: Record<string, string[]>,
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

export type ApiRequestConfig = InternalAxiosRequestConfig & {
  skipAuth?: boolean;
};

const baseURL = (
  process.env.NEXT_PUBLIC_API_URL ??
  'http://localhost:1981/klicklocal/backend/public/api/v1'
).replace(/\/$/, '');

export const apiClient: AxiosInstance = axios.create({
  baseURL,
  headers: { Accept: 'application/json' },
});

apiClient.interceptors.request.use((config: ApiRequestConfig) => {
  if (!config.skipAuth) {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  if (
    config.data &&
    !(config.data instanceof FormData) &&
    !config.headers['Content-Type']
  ) {
    config.headers['Content-Type'] = 'application/json';
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    const payload = response.data as ApiSuccess<unknown> | ApiError;

    if (
      payload &&
      typeof payload === 'object' &&
      'success' in payload &&
      !payload.success
    ) {
      const err = payload as ApiError;
      throw new ApiClientError(
        err.message ?? 'Request failed',
        response.status,
        err.errors,
      );
    }

    return response;
  },
  (error: AxiosError<ApiError>) => {
    if (error.response?.status === 401) {
      clearToken();
      if (
        typeof window !== 'undefined' &&
        !window.location.pathname.startsWith('/login')
      ) {
        window.location.href = '/login';
      }
    }

    const payload = error.response?.data;
    throw new ApiClientError(
      payload?.message ?? error.message ?? 'Network error',
      error.response?.status ?? 0,
      payload?.errors,
    );
  },
);

export async function apiGet<T>(
  url: string,
  config?: Partial<ApiRequestConfig>,
): Promise<T> {
  const { data } = await apiClient.get<ApiSuccess<T>>(url, config);
  return data.data;
}

export async function apiPost<T>(
  url: string,
  body?: unknown,
  config?: Partial<ApiRequestConfig>,
): Promise<T> {
  const { data } = await apiClient.post<ApiSuccess<T>>(url, body, config);
  return data.data;
}

export async function apiPut<T>(
  url: string,
  body?: unknown,
  config?: Partial<ApiRequestConfig>,
): Promise<T> {
  const { data } = await apiClient.put<ApiSuccess<T>>(url, body, config);
  return data.data;
}

export async function apiPatch<T>(
  url: string,
  body?: unknown,
  config?: Partial<ApiRequestConfig>,
): Promise<T> {
  const { data } = await apiClient.patch<ApiSuccess<T>>(url, body, config);
  return data.data;
}

export async function apiDelete<T>(
  url: string,
  config?: Partial<ApiRequestConfig>,
): Promise<T> {
  const { data } = await apiClient.delete<ApiSuccess<T>>(url, config);
  return data.data;
}

export async function apiUpload<T>(
  url: string,
  formData: FormData,
): Promise<T> {
  const { data } = await apiClient.post<ApiSuccess<T>>(url, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.data;
}
