'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

import { hasPlatformPermission, PLATFORM_PERMISSIONS } from '@/lib/permissions';
import { hasToken } from '@/lib/token';
import { authService } from '@/services/auth.service';
import type { AuthSession, User, UserAbilities } from '@/types/api';

type AuthContextValue = {
  user: User | null;
  session: AuthSession | null;
  abilities: UserAbilities | null;
  isPlatformAdmin: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
  workspaceScopeId: number | null;
  setWorkspaceScopeId: (id: number | null) => void;
  hasPermission: (permission: string) => boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoggingOut: boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [tokenReady, setTokenReady] = useState(false);
  const [workspaceScopeId, setWorkspaceScopeId] = useState<number | null>(null);

  useEffect(() => {
    setTokenReady(true);
  }, []);

  const meQuery = useQuery({
    queryKey: ['auth', 'me', workspaceScopeId],
    queryFn: () => authService.me(workspaceScopeId ?? undefined),
    enabled: tokenReady && hasToken(),
    retry: false,
  });

  const session = meQuery.data ?? null;

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authService.login(email, password),
    onSuccess: async () => {
      await queryClient.resetQueries();
      const me = await authService.me();
      router.replace(
        me.is_platform_admin ? '/admin/dashboard' : '/dashboard',
      );
    },
  });

  const registerMutation = useMutation({
    mutationFn: ({
      name,
      email,
      password,
    }: {
      name: string;
      email: string;
      password: string;
    }) => authService.register(name, email, password),
    onSuccess: async () => {
      await queryClient.resetQueries();
      router.replace('/dashboard');
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: async () => {
      queryClient.clear();
      router.replace('/login');
    },
  });

  const login = useCallback(
    async (email: string, password: string) => {
      await loginMutation.mutateAsync({ email, password });
    },
    [loginMutation],
  );

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      await registerMutation.mutateAsync({ name, email, password });
    },
    [registerMutation],
  );

  const logout = useCallback(async () => {
    await logoutMutation.mutateAsync();
  }, [logoutMutation]);

  const hasPermission = useCallback(
    (permission: string) =>
      hasPlatformPermission(session?.abilities, permission),
    [session?.abilities],
  );

  const value: AuthContextValue = {
    user: session?.user ?? null,
    session,
    abilities: session?.abilities ?? null,
    isPlatformAdmin: session?.is_platform_admin ?? false,
    isLoading: tokenReady && hasToken() && meQuery.isLoading,
    isAuthenticated: hasToken() && !!session,
    workspaceScopeId,
    setWorkspaceScopeId,
    hasPermission,
    login,
    register,
    logout,
    isLoggingOut: logoutMutation.isPending,
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export { PLATFORM_PERMISSIONS };
