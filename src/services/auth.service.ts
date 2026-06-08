import { apiGet, apiPost } from '@/services/api-client';
import { clearToken, setToken } from '@/lib/token';
import type { AuthSession, User } from '@/types/api';

export const authService = {
  async login(email: string, password: string) {
    const data = await apiPost<{
      user: User;
      token: string;
      onboarding_completed: boolean;
    }>('/auth/login', { email, password }, { skipAuth: true });
    setToken(data.token);
    return data;
  },

  async registerEmail(email: string) {
    const data = await apiPost<{
      user: User;
      token: string;
      resumed: boolean;
    }>('/auth/register-email', { email }, { skipAuth: true });
    setToken(data.token);
    return data;
  },

  async register(name: string, email: string, password: string) {
    const data = await apiPost<{ user: User; token: string }>(
      '/auth/register',
      {
        name,
        email,
        password,
        password_confirmation: password,
      },
      { skipAuth: true },
    );
    setToken(data.token);
    return data;
  },

  async me(workspaceId?: number) {
    const suffix =
      workspaceId !== undefined ? `?workspace_id=${workspaceId}` : '';
    return apiGet<AuthSession>(`/auth/me${suffix}`);
  },

  async logout() {
    try {
      await apiPost<null>('/auth/logout');
    } finally {
      clearToken();
    }
  },
};
